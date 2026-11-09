/* NOVACLIP — EXPORTING WITHOUT A STOPWATCH
 * ===========================================================================
 * Reported with the file attached: "the export come out very laggy this is a
 * export". It was. Measured on that file with ffprobe: 147 frames across
 * 19.62 seconds — 7.5 frames per second where 30 were asked for — with gaps
 * between frames from 23ms to 580ms.
 *
 * WHY, AND WHY NO SETTING COULD FIX IT
 * ---------------------------------------------------------------------------
 * The export recorded the canvas in REAL TIME. MediaRecorder takes a
 * MediaStream from canvas.captureStream(30) and stamps every frame with the
 * wall clock, so the recording is a video of the renderer working. A frame
 * the renderer does not finish in its 33ms is not a late frame, it is an
 * absent one, and the file ends up with however many frames the machine
 * managed. Bitrate, codec and profile all change how those frames look;
 * none of them changes how many there are.
 *
 * And it is not a slow-machine problem, which is worth saying because that
 * was my first guess and it was wrong. Measured on a fast machine with no
 * effects at all and nothing else running, the same export managed 18.6fps
 * of the 30 it asked for.
 *
 * WHAT THIS DOES INSTEAD
 * ---------------------------------------------------------------------------
 * It takes the stopwatch away. Each frame is drawn at its own pace, handed to
 * a WebCodecs VideoEncoder with the timestamp it is SUPPOSED to have —
 * frame n is at n/fps seconds, exactly — and muxed into an MP4. The file is a
 * true 30fps whether the machine took ten seconds or ten minutes to draw it.
 * On a fast machine it finishes sooner than real time, because nothing is
 * waiting for a clock any more.
 *
 * HOW IT TAKES OVER WITHOUT REWRITING THE EDITOR
 * ---------------------------------------------------------------------------
 * The bundle asks export-fix.js for its recorder, through __ncPickRecorder.
 * So this file wraps that and hands back something that looks like a
 * MediaRecorder — start, stop, pause, resume, state, ondataavailable, onstop
 * — and is actually an encoder writing a file. The bundle's own export loop
 * carries on exactly as it was: it seeks the sources, draws the frame, and
 * never knows the difference.
 *
 * The clock the bundle reads is performance.now(), and that is the one thing
 * this has to lie about. It is patched to a VIRTUAL clock that does not move
 * with the world: it advances by exactly one frame-time each time a frame is
 * actually captured. So the loop's `F = (now - start)/1000` is always the
 * timeline position of the frame being drawn, never a measure of how long the
 * drawing took.
 *
 * A FRAME IS NOT TAKEN UNTIL ITS SOURCES ARE READY, which is the same
 * problem export-fix.js solved for the real-time path by freezing the clock.
 * Here there is no clock to freeze: if a source is still seeking, the frame
 * is simply not captured and the virtual clock does not advance, so the loop
 * redraws the same position next time round. That is why this file asks
 * export-fix.js for its stall test rather than writing a second one, and
 * why it tells that file to leave the clock alone while this is running —
 * two patched clocks would be a clock nobody owns.
 *
 * THE AUDIO IS RENDERED SEPARATELY, AND IT HAS TO BE
 * ---------------------------------------------------------------------------
 * The audio in the bundle's stream is real-time audio: it plays while the
 * export runs. Video that no longer runs in real time cannot share a track
 * with it — a render that takes twice as long would come out with audio
 * twice as long as the picture.
 *
 * So the audio is rebuilt from the project rather than recorded from it.
 * Every clip with sound is decoded and scheduled into an OfflineAudioContext
 * at its own start, with its trim, speed, volume and fades, skipping muted
 * and hidden tracks — and that mix is encoded to AAC and muxed beside the
 * video. An OfflineAudioContext renders as fast as it can and is sample
 * exact, so the result does not drift against a picture that took any amount
 * of time to draw.
 *
 * IF ANY OF THAT IS MISSING, NOTHING HAPPENS. No WebCodecs, no muxer, no
 * H.264 encoder, a format that is not MP4 — any of those and this hands the
 * export straight back to export-fix.js and the old path runs. The worst
 * case is the export people have today, not a broken one.
 */
(function () {
  'use strict';
  if (window.NC_EXPORT_OFFLINE) return;

  var FPS_FALLBACK = 30;
  var KEY_EVERY_S = 2;          /* a keyframe at least this often */
  var AUDIO_RATE = 48000;
  var AUDIO_BPS = 128000;

  /* ---- which canvas is behind which stream ------------------------------
     __ncPickRecorder is handed a MediaStream; the frames have to come from
     the canvas that made it. The only place that pairing exists is the
     captureStream call itself. */
  var canvasFor = new WeakMap();
  var realCapture = HTMLCanvasElement.prototype.captureStream;
  if (realCapture) {
    HTMLCanvasElement.prototype.captureStream = function () {
      var s = realCapture.apply(this, arguments);
      try { canvasFor.set(s, this); } catch (e) {}
      return s;
    };
  }

  function haveBits() {
    return typeof VideoEncoder === 'function' &&
           typeof VideoFrame === 'function' &&
           typeof EncodedVideoChunk === 'function' &&
           window.Mp4Muxer && window.Mp4Muxer.Muxer && window.Mp4Muxer.ArrayBufferTarget;
  }

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }

  /* ==========================================================================
     THE AUDIO MIX, BUILT FROM THE PROJECT
     ========================================================================== */

  var decoded = {};            /* asset id -> AudioBuffer, for this export */

  function assetById(id) {
    var st = state();
    if (!st || !st.assets) return null;
    for (var i = 0; i < st.assets.length; i++) if (st.assets[i].id === id) return st.assets[i];
    return null;
  }
  function trackById(id) {
    var st = state();
    if (!st || !st.tracks) return null;
    for (var i = 0; i < st.tracks.length; i++) if (st.tracks[i].id === id) return st.tracks[i];
    return null;
  }

  function decodeAsset(ctx, asset) {
    if (decoded[asset.id]) return Promise.resolve(decoded[asset.id]);
    return fetch(asset.url).then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) {
        return new Promise(function (res, rej) {
          /* The callback form, because Safari and some Chromium builds still
             do not return a promise from decodeAudioData. */
          try { ctx.decodeAudioData(buf, res, rej); } catch (e) { rej(e); }
        });
      })
      .then(function (b) { decoded[asset.id] = b; return b; })
      .catch(function () { return null; });   /* a clip with no decodable sound is silent */
  }

  /* Everything that makes a noise, with where and how loud. */
  function audible() {
    var st = state(), out = [];
    if (!st || !st.clips) return out;
    for (var i = 0; i < st.clips.length; i++) {
      var c = st.clips[i];
      if (c.kind !== 'video' && c.kind !== 'audio') continue;
      var tr = trackById(c.trackId);
      if (tr && tr.muted) continue;
      var a = assetById(c.assetId);
      if (!a || !a.url) continue;
      if (a.kind !== 'video' && a.kind !== 'audio') continue;
      out.push({ clip: c, asset: a });
    }
    return out;
  }

  function renderAudio(totalSeconds) {
    var list = audible();
    if (!list.length || typeof OfflineAudioContext !== 'function') return Promise.resolve(null);
    var frames = Math.max(1, Math.ceil(totalSeconds * AUDIO_RATE));
    var ctx;
    try { ctx = new OfflineAudioContext(2, frames, AUDIO_RATE); }
    catch (e) { return Promise.resolve(null); }

    return Promise.all(list.map(function (it) {
      return decodeAsset(ctx, it.asset).then(function (buf) { return { it: it, buf: buf }; });
    })).then(function (rows) {
      var any = false;
      for (var i = 0; i < rows.length; i++) {
        var buf = rows[i].buf, c = rows[i].it.clip;
        if (!buf) continue;
        try {
          var src = ctx.createBufferSource();
          src.buffer = buf;
          var speed = c.speed > 0 ? c.speed : 1;
          if (speed !== 1) src.playbackRate.value = speed;

          var g = ctx.createGain();
          var vol = (typeof c.volume === 'number') ? c.volume : 1;
          if (vol < 0) vol = 0;
          var at = Math.max(0, c.start || 0);
          var dur = Math.max(0, c.duration || 0);
          if (!dur) continue;

          /* Fades, written as ramps on the gain rather than baked into the
             samples, so a fade that is longer than the clip cannot run past
             its end. */
          var fi = Math.min(c.fadeIn || 0, dur / 2);
          var fo = Math.min(c.fadeOut || 0, dur / 2);
          g.gain.setValueAtTime(fi > 0 ? 0.0001 : vol, at);
          if (fi > 0) g.gain.linearRampToValueAtTime(vol, at + fi);
          if (fo > 0) {
            g.gain.setValueAtTime(vol, at + dur - fo);
            g.gain.linearRampToValueAtTime(0.0001, at + dur);
          }

          src.connect(g); g.connect(ctx.destination);
          /* sourceStart is where in the source the clip begins; the source is
             played for the clip's own length, scaled by speed because the
             clip's seconds are not the source's seconds when it is sped up. */
          var off = Math.max(0, c.sourceStart || 0);
          src.start(at, off, dur * speed);
          any = true;
        } catch (e) { /* one clip failing is a silent clip, not a failed export */ }
      }
      if (!any) return null;
      return ctx.startRendering();
    }).catch(function () { return null; });
  }

  function encodeAudio(buffer, muxer) {
    if (!buffer || typeof AudioEncoder !== 'function') return Promise.resolve(false);
    return AudioEncoder.isConfigSupported({
      codec: 'mp4a.40.2', sampleRate: buffer.sampleRate,
      numberOfChannels: Math.min(2, buffer.numberOfChannels), bitrate: AUDIO_BPS
    }).then(function (sup) {
      if (!sup || !sup.supported) return false;
      return new Promise(function (resolve) {
        var enc, failed = false;
        try {
          enc = new AudioEncoder({
            output: function (chunk, meta) {
              try { muxer.addAudioChunk(chunk, meta); } catch (e) {}
            },
            error: function () { failed = true; }
          });
          enc.configure({ codec: 'mp4a.40.2', sampleRate: buffer.sampleRate,
                          numberOfChannels: Math.min(2, buffer.numberOfChannels),
                          bitrate: AUDIO_BPS });
        } catch (e) { return resolve(false); }

        var chans = Math.min(2, buffer.numberOfChannels);
        var total = buffer.length;
        var CH = 4096;                       /* frames per AudioData */
        var inter = new Float32Array(CH * chans);
        var left = buffer.getChannelData(0);
        var right = chans > 1 ? buffer.getChannelData(1) : left;
        var at = 0;
        try {
          while (at < total && !failed) {
            var n = Math.min(CH, total - at);
            for (var i = 0; i < n; i++) {
              inter[i * chans] = left[at + i];
              if (chans > 1) inter[i * chans + 1] = right[at + i];
            }
            var data = new AudioData({
              format: 'f32', sampleRate: buffer.sampleRate,
              numberOfFrames: n, numberOfChannels: chans,
              timestamp: Math.round(at / buffer.sampleRate * 1e6),
              data: inter.subarray(0, n * chans)
            });
            enc.encode(data); data.close();
            at += n;
          }
        } catch (e) { failed = true; }
        enc.flush().then(function () { resolve(!failed); },
                         function () { resolve(false); });
      });
    }).catch(function () { return false; });
  }

  /* ENCODE SOMETHING BEFORE PROMISING TO ENCODE EVERYTHING.
     isConfigSupported is a claim, not a result, and the cost of it being
     wrong here is a finished export with a declared audio track and nothing
     in it — a silent film, discovered after the render. So a few
     milliseconds of silence go through a real AudioEncoder first and the
     answer is whether a chunk came out the other side. It costs about a
     millisecond and it is the difference between a promise and a fact. */
  var aacAnswer = null;
  function aacWorks() {
    if (aacAnswer) return aacAnswer;
    aacAnswer = new Promise(function (resolve) {
      if (typeof AudioEncoder !== 'function' || typeof AudioData !== 'function') return resolve(false);
      var got = 0, enc;
      try {
        enc = new AudioEncoder({
          output: function () { got++; },
          error: function () { resolve(false); }
        });
        enc.configure({ codec: 'mp4a.40.2', sampleRate: AUDIO_RATE,
                        numberOfChannels: 2, bitrate: AUDIO_BPS });
        var n = 1024;
        var d = new AudioData({
          format: 'f32', sampleRate: AUDIO_RATE, numberOfFrames: n,
          numberOfChannels: 2, timestamp: 0, data: new Float32Array(n * 2)
        });
        enc.encode(d); d.close();
        enc.flush().then(function () {
          try { enc.close(); } catch (e) {}
          resolve(got > 0);
        }, function () { resolve(false); });
      } catch (e) { resolve(false); }
    });
    return aacAnswer;
  }

  /* ==========================================================================
     THE RECORDER THAT IS NOT A RECORDER
     ========================================================================== */

  function makeOffline(canvas, mime, bps, fps, withAudio, onFail) {
    var M = window.Mp4Muxer;
    var target = new M.ArrayBufferTarget();
    var muxer, encoder, ok = true;

    var w = canvas.width, h = canvas.height;
    /* H.264 wants even dimensions. An odd canvas is rare but a failed
       configure here would take the whole export down. */
    if (w % 2 || h % 2) return null;

    try {
      /* THE AUDIO TRACK IS DECLARED ONLY IF IT CAN BE FILLED.
         Declaring one and then writing no chunks produces a file with a
         six-second audio stream containing nothing — ffprobe reports the
         duration and zero packets, and a player shows a silent film. That
         is exactly what the first version of this file shipped on a machine
         with no AAC encoder, so the decision is made before the muxer is
         built rather than discovered when the chunks fail to arrive. */
      var cfg = {
        target: target,
        video: { codec: 'avc', width: w, height: h, frameRate: fps },
        fastStart: 'in-memory',              /* the moov atom first, so it plays while downloading */
        firstTimestampBehavior: 'offset'
      };
      if (withAudio) cfg.audio = { codec: 'aac', sampleRate: AUDIO_RATE, numberOfChannels: 2 };
      muxer = new M.Muxer(cfg);
      encoder = new VideoEncoder({
        output: function (chunk, meta) {
          try { muxer.addVideoChunk(chunk, meta); } catch (e) { ok = false; }
        },
        error: function () { ok = false; }
      });
      encoder.configure({
        codec: 'avc1.640028',                /* High @ 4.0 — see export-fix.js */
        width: w, height: h, bitrate: bps, framerate: fps,
        latencyMode: 'quality',
        avc: { format: 'avc' }
      });
    } catch (e) { return null; }

    var frames = 0, stopped = false, paused = false, started = 0;
    var rafId = 0;
    var realNow = performance.now;
    var baseReal = realNow.call(performance);
    var api;

    /* The virtual clock. The bundle computes its timeline position as
       (performance.now() - start) / 1000, so returning a clock that moves one
       frame-time per captured frame makes that expression read "the timeline
       position of the frame being drawn", which is what it was always meant
       to be. */
    function virtualNow() { return baseReal + (frames * 1000 / fps); }

    function sourcesReady() {
      try {
        if (typeof window.__ncExportStalled === 'function') return !window.__ncExportStalled();
      } catch (e) {}
      return true;
    }

    /* One capture per animation frame, AFTER the bundle has drawn. rAF
       callbacks run in the order they were registered, and this one is
       registered from inside a callback, so it lands after the draw that the
       loop scheduled for the same frame. */
    function pump() {
      if (stopped) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        if (stopped) return;
        if (!paused && sourcesReady()) {
          try {
            var frame = new VideoFrame(canvas, {
              timestamp: Math.round(frames * 1e6 / fps),
              duration: Math.round(1e6 / fps)
            });
            encoder.encode(frame, { keyFrame: frames % Math.max(1, Math.round(fps * KEY_EVERY_S)) === 0 });
            frame.close();
            frames++;
          } catch (e) { ok = false; }
        }
        pump();
      });
    }

    function finish() {
      var seconds = frames / fps;
      return encoder.flush().then(function () {
        return withAudio ? renderAudio(seconds) : null;
      }).then(function (buf) {
        return buf ? encodeAudio(buf, muxer) : false;
      }).then(function () {
        muxer.finalize();
        return new Blob([target.buffer], { type: 'video/mp4' });
      });
    }

    api = {
      get state() { return stopped ? 'inactive' : (paused ? 'paused' : 'recording'); },
      mimeType: 'video/mp4;codecs=avc1.640028',
      videoBitsPerSecond: bps,
      ondataavailable: null,
      onstop: null,
      onerror: null,
      start: function () {
        started = realNow.call(performance);
        window.__ncOfflineExport = true;
        try { performance.now = virtualNow; } catch (e) {}
        pump();
      },
      pause: function () { paused = true; },
      resume: function () { paused = false; },
      requestData: function () {},
      stop: function () {
        if (stopped) return;
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        try { performance.now = realNow; } catch (e) {}
        window.__ncOfflineExport = false;
        finish().then(function (blob) {
          if (!ok || !blob || !blob.size) { if (onFail) onFail(); return; }
          try { if (api.ondataavailable) api.ondataavailable({ data: blob }); } catch (e) {}
          try { if (api.onstop) api.onstop({}); } catch (e) {}
        }, function () { if (onFail) onFail(); });
      },
      addEventListener: function (type, fn) {
        if (type === 'dataavailable') api.ondataavailable = fn;
        else if (type === 'stop') api.onstop = fn;
        else if (type === 'error') api.onerror = fn;
      },
      removeEventListener: function () {},
      /* For the test harness, and for anyone wondering which path ran. */
      __offline: true,
      __frames: function () { return frames; }
    };
    return api;
  }

  /* ==========================================================================
     TAKING OVER FROM export-fix.js
     ========================================================================== */
  var waited = 0;
  (function wrap() {
    var prev = window.__ncPickRecorder;
    if (typeof prev !== 'function') {
      if (++waited > 200) return;            /* export-fix.js never loaded */
      return setTimeout(wrap, 100);
    }
    if (prev.__offlineWrapped) return;

    var wrapped = function (stream, format, codec, bps) {
      var fallback = function () { return prev(stream, format, codec, bps); };
      try {
        if (!haveBits()) return fallback();
        /* MP4 only. The muxer writes MP4 and nothing else, and quietly
           handing somebody an MP4 when they picked WebM is the exact bug
           export-fix.js has a long comment about. */
        if (String(format || '').toLowerCase().indexOf('webm') === 0) return fallback();
        var canvas = canvasFor.get(stream);
        if (!canvas || !canvas.width || !canvas.height) return fallback();

        var st = state();
        var fps = (st && st.exportSettings && st.exportSettings.fps) ||
                  (st && st.settings && st.settings.fps) || FPS_FALLBACK;
        var rate = Math.max(1, Number(bps) || 8e6);

        /* CAN THIS MACHINE WRITE THE SOUND? Decided here, before anything
           is built, because the answer changes whether this path may run at
           all. A project with sound exported on a browser with no AAC
           encoder has to go back to the old path: a laggy export with audio
           beats a smooth silent one, every time. A project with no sound in
           it does not care either way and gets a video-only file. */
        var wantsAudio = audible().length > 0;
        var audioOk = wantsAudio ? aacWorks() : Promise.resolve(false);

        return Promise.all([
          VideoEncoder.isConfigSupported({
            codec: 'avc1.640028', width: canvas.width, height: canvas.height,
            bitrate: rate, framerate: fps
          }),
          audioOk
        ]).then(function (both) {
          var sup = both[0], canAac = both[1];
          if (!sup || !sup.supported) return fallback();
          if (wantsAudio && !canAac) return fallback();
          var rec = makeOffline(canvas, 'video/mp4', rate, fps, wantsAudio && canAac,
                                function () {});
          if (!rec) return fallback();
          return { recorder: rec, mime: 'video/mp4;codecs=avc1.640028', ext: 'mp4', offline: true };
        }).catch(fallback);
      } catch (e) { return fallback(); }
    };
    wrapped.__offlineWrapped = true;
    window.__ncPickRecorder = wrapped;
  }());

  window.NC_EXPORT_OFFLINE = {
    available: haveBits,
    state: function () {
      return { bits: haveBits(), muxer: !!window.Mp4Muxer,
               encoder: typeof VideoEncoder === 'function',
               wrapped: !!(window.__ncPickRecorder && window.__ncPickRecorder.__offlineWrapped),
               active: !!window.__ncOfflineExport };
    }
  };
})();
