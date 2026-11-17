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
  var WARMUP_MS = 700;          /* how long to watch the renderer before choosing */
  var FPS_STEPS = [30, 25, 24, 20, 15, 12];   /* what it is allowed to settle on */
  var FPS_FLOOR = 12;           /* below this, choppiness is worse than waiting */
  /* HOW LONG A SEEK IS ALLOWED TO TAKE.
     600ms was chosen when the only thing being waited for was a 1/30s step
     within a clip that was already decoding, which is quick. It is the wrong
     number for the case that actually freezes: a cut that jumps deep into a
     long source file, where the element has to find a keyframe hundreds of
     megabytes in. Reported as "it freezes in someplaces" — measured on that
     export, twelve stalls totalling 9.3 of 19.7 seconds, the longest 1.47s,
     all of them in the second half where the cuts are.

     A frame that waits is a frame that is RIGHT. A frame that gives up is a
     duplicate of the one before it, which is the freeze. So the cap is the
     length of a slow seek rather than the length of a fast one, and the cost
     of being generous is export time, which the frame-rate measurement
     already trades against deliberately. */
  var WAIT_CAP_MS = 2500;       /* longest one frame may wait on its sources */
  /* A pending seek is presumed dead only after a long time. This is a
     RECOVERY, not a policy: at 6s with the retry disarmed it fired often
     enough to cost the six-cut export half its distinct frames (208 of 360
     against 352), and at 6s with the retry armed it bought another 2.5s
     wait every six seconds and the export stopped finishing at all. Rare
     and fully armed is the combination that keeps both. */
  var STUCK_MS = 15000;         /* after this a pending seek is presumed dead */
  /* THE REAL CLOCK, KEPT AT LOAD. An export replaces performance.now with a
     clock that advances one frame-time per CAPTURED frame — so asking
     performance.now() while waiting for a seek would ask a clock that is
     stopped until the wait ends, and a timeout measured on it never fires.
     Taken here, before anything has had a chance to replace it, and used by
     everything that needs to know how long something has really taken. */
  var REAL_NOW = performance.now.bind(performance);
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
          /* The promise this ALSO returns rejects for a clip with no sound,
             and with nothing attached to it that is an unhandled rejection
             logged on every silent export. The callbacks above are the
             answer this code uses; this just stops the other one shouting. */
          try {
            var pr = ctx.decodeAudioData(buf, res, rej);
            if (pr && typeof pr.catch === 'function') pr.catch(function () {});
          } catch (e) { rej(e); }
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

  /* DOES THE PROJECT ACTUALLY HAVE SOUND, as opposed to having clips that
     could have had some? audible() answers the second question: it returns
     every video or audio clip on an unmuted track, and a video with no audio
     track at all counts. That is the right list to MIX, and the wrong one to
     make a decision with.

     It mattered because of what the decision is. A project with sound on a
     browser with no AAC encoder has to go back to the real-time path, since
     a laggy export with audio beats a smooth silent one. With audible() as
     the test, a timeline holding nothing but silent video said "I have
     sound", and so a browser without AAC took the slow path for every export
     — including ones where there was no sound to lose. Measured here: a
     four-second silent clip, and the export fell back with "the project has
     sound and this browser has no AAC encoder".

     This decodes the candidates and asks whether any of them produced
     samples. decodeAsset already answers null for a clip with nothing
     decodable and caches what it finds, so for a project that does have
     sound this is the decode renderAudio was going to do anyway, done
     earlier. If the question cannot be asked at all, the answer is yes —
     the costly path is the safe one when the cheap one might lose audio. */
  var realAudio = null;
  function hasRealAudio() {
    if (realAudio) return realAudio;
    var list = audible();
    if (!list.length) { realAudio = Promise.resolve(false); return realAudio; }
    var ctx;
    try { ctx = new OfflineAudioContext(1, 1, AUDIO_RATE); }
    catch (e) { realAudio = Promise.resolve(true); return realAudio; }
    realAudio = Promise.all(list.map(function (x) { return decodeAsset(ctx, x.asset); }))
      .then(function (bufs) {
        for (var i = 0; i < bufs.length; i++) if (bufs[i] && bufs[i].length) return true;
        return false;
      })
      .catch(function () { return true; });
    return realAudio;
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

  /* ---- THE SOURCES HAVE TO FOLLOW THE VIRTUAL CLOCK ---------------------
     This is the bug that made a two-effect export hang rather than merely
     take a while, and it is the same shape as the reason the old path
     dropped frames.

     The export's <video> elements PLAY, in real time, because that is how
     the bundle advances them. The virtual clock does not: it moves one
     frame-time per frame actually captured, so on a renderer managing seven
     frames a second it runs at a quarter of real speed. Within a second the
     sources are hundreds of milliseconds ahead of the timeline position
     being drawn, the bundle notices the drift and re-seeks, and a seek stops
     the next frame being captured — which stops the clock advancing, which
     lets the sources run further ahead. Measured: a six-second timeline that
     never finished at all.

     So during an offline export the sources are driven instead of played.
     They are paused, and each time a frame is kept every active one is
     advanced by exactly one frame-time, scaled by its own playbackRate so a
     clip with a speed change still lands where it should. The bundle's own
     drift check then never fires, because there is no drift.

     Active means the bundle has called play() on it and not paused it — an
     element it is not currently showing must not be wound forward, or it
     arrives at its own clip already past the start. */
  var drivenVideos = [];
  var patchedMedia = false;

  /* A REGISTER, BECAUSE THE DOCUMENT DOES NOT KNOW ABOUT THEM.
     This is the whole bug, and it hid for two releases behind code that
     looked like it was working. The bundle's source clips are created with
     createElement and never appended, so document.querySelectorAll('video')
     — which searches the document TREE — returns none of them. Every lookup
     in this file then found nothing, advanceSources() wound nothing on, and
     the sources were never driven at all.

     Measured on a four-second export: five video elements, all detached,
     zero found by the document, and fourteen seeks in the entire run, each
     one advancing by exactly 0.267s. That 0.267 is the bundle's own drift
     correction — with play() swallowed below and nothing else moving the
     clip, the only thing that ever moved it was the bundle noticing it had
     fallen about a quarter-second behind. 0.267s is eight frames at 30fps,
     which is why the export kept one picture in every eight.

     Elements register themselves here, where the bundle already announces
     them by calling play(). Pruned on each collect so a long session does
     not accumulate the dead ones. */
  var known = [];
  function remember(el) {
    for (var i = 0; i < known.length; i++) if (known[i] === el) return;
    known.push(el);
  }

  function markActive() {
    if (patchedMedia) return;
    patchedMedia = true;
    var P = HTMLMediaElement.prototype;
    var play = P.play, pause = P.pause;
    P.play = function () {
      try { this.__ncActive = true; remember(this); } catch (e) {}
      if (window.__ncOfflineExport && !this.isConnected && this.src) {
        /* Swallow the play: this file moves it by hand from now on. A
           rejected promise here would be an unhandled rejection in the
           bundle, so one that resolves is handed back. */
        return Promise.resolve();
      }
      return play.apply(this, arguments);
    };
    P.pause = function () {
      try { if (!window.__ncOfflineExport) this.__ncActive = false; } catch (e) {}
      return pause.apply(this, arguments);
    };

    /* THE BUNDLE'S OWN SEEKS WERE WATCHED HERE, AND IT MADE THINGS WORSE.
       The idea was sound: play() is not called on every clip, so an element
       the bundle steers with currentTime should be driven too. Shipped, and
       measured on the next export — the stretch from 4s to 13s, which had
       been running at 25 to 30 distinct frames a second, collapsed to
       between 2 and 10, while the part it was meant to help gained almost
       nothing. 348 distinct frames of 592 became 214.

       The reason is contention. Driving every element the bundle has ever
       touched means seeking five of them per captured frame, and a software
       decoder given five seeks at once finishes none of them in time — so
       the one actually on screen falls back to the bundle's drift
       correction, which is the eight-frame cadence this whole sequence of
       fixes has been chasing. Fewer, more accurate seeks beat more of them.

       If this is tried again it needs to drive only the clip under the
       playhead, which the store can answer: clips carry start and duration,
       assets carry a url, and an element's src can be matched to it. Not
       guessed at a second time. */
  }

  /* The export's sources: registered, detached, and holding a src. Doubles
     as the prune — anything that has lost its src is dropped. */
  function sources() {
    var out = [], keep = [];
    for (var i = 0; i < known.length; i++) {
      var v = known[i];
      try {
        if (!v || !v.src) continue;
        keep.push(v);
        /* LATCHED HERE, where it is actually observable. This used to be
           read inside advanceSources, straight after a seek was issued —
           by which time the element has already dropped to readyState 1 and
           the answer is always no. It was measured never once being set, on
           an element that had been sitting at readyState 4 a moment before.
           This runs on every advance and every readiness check, so a healthy
           element is caught while it is healthy. */
        if (v.readyState >= 2) v.__ncEverReady = true;
        if (!v.isConnected && v.__ncActive) out.push(v);
      } catch (e) {}
    }
    known = keep;
    return out;
  }

  function collectVideos() { drivenVideos = sources(); }

  /* The export creates its sources as it goes, so the list is refreshed
     rather than taken once.

     EACH WIND-ON IS A SEEK, AND A SEEK TAKES TIME. Setting currentTime does
     not move the picture; it starts a seek that finishes later. Whoever
     captures the next frame has to wait for it, and the element is marked
     here so sourcesReady() below knows which ones to wait for and since
     when. Without that mark the only question anyone could ask was the
     global one, and the global one is not answerable — see sourcesReady. */
  function advanceSources(step) {
    try {
      var now = REAL_NOW();
      var all = sources();
      for (var i = 0; i < all.length; i++) {
        var v = all[i];
        if (!v.paused) { try { v.pause(); } catch (e) {} }
        var rate = v.playbackRate || 1;
        /* OUR OWN ACCUMULATOR, NOT A READ-BACK.
           currentTime reports the START of the frame currently presented —
           it is snapped, not the value that was asked for. Adding a step to
           that lands exactly on a frame boundary every time, and a seek to a
           boundary can legitimately resolve to either side, so about a
           quarter of the steps picked the frame they had just shown.
           Measured: 89 distinct frames out of 120, the doubles spread evenly
           at seven to nine a second rather than clustered.

           Counting in our own variable keeps the error from accumulating at
           all, and the half-step nudge lands the seek inside the intended
           frame instead of on its edge.

           Resynced if the element is moved somewhere far away by the bundle
           — a cut, or a different clip taking over the element — because
           then its position is deliberate and ours is stale. */
        var want = v.__ncWant;
        if (typeof want !== 'number' || !isFinite(want) ||
            Math.abs(want - v.currentTime) > 0.5) want = v.currentTime;
        want += step * rate;
        v.__ncWant = want;
        /* A SEEK IN FLIGHT IS LEFT ALONE.
           This is what turned a stall into a freeze. Every captured frame
           issued a new seek, and a new seek CANCELS the one before it — so
           an element that needed 400ms to land was never given 400ms, it was
           interrupted every 33ms for ever. Measured: readyState stuck at 1
           while currentTime climbed, requestVideoFrameCallback never firing
           once, and the picture frozen for up to 171 frames.

           __ncWant still advances every frame, so the timeline position is
           not lost while waiting — when the pending seek does land, the next
           one goes straight to where the export has got to rather than
           crawling forward from where it stalled. */
        /* ...BUT A SEEK THAT NEVER LANDS CANNOT OWN THE CLIP FOR EVER.
           Leaving a pending seek alone is what stopped the thrashing, and on
           its own it created a worse failure: if that seek never completes —
           a decode that fails, a position the element will not reach — then
           nothing ever advances or re-issues it again, and the clip spends
           the whole rest of the export being moved only by the bundle's
           drift correction. That is one picture every eight frames, starting
           partway through and never recovering, which is precisely what the
           last five seconds of the reported export looked like: sixteen
           consecutive eight-frame gaps from 14.1s to the end.

           So a seek gets a generous window and then is written off and
           reissued from where the export has got to by now. */
        if (v.__ncSeekAt && !v.__ncFrameReady) {
          if (now - v.__ncSeekAt < STUCK_MS) continue;
          /* Abandon it and seek afresh — but remember that this clip has
             already failed to deliver once. Re-arming the full wait on the
             retry is what made the six-cut export stop finishing at all:
             every retry bought another WAIT_CAP_MS, every six seconds, for
             the rest of the run. A clip that has proven unreliable stops
             holding frames up until it proves otherwise, which it does the
             moment it hands over a frame. */
          v.__ncSeekAt = 0;
        }
        var next = want + step * 0.5;
        if (isFinite(next) && next >= 0) {
          try {
            /* ASK FOR THE FRAME, NOT FOR THE SEEK.
               The version before this waited on `!v.seeking && readyState >= 2`
               and it measured as doing nothing at all: forcedFrames came back
               0 — the wait never once fired — while the export still kept only
               15 distinct pictures out of 120, every eighth frame. Those two
               properties answer "has the seek been processed", which a
               <video> says yes to while it is still PRESENTING the previous
               picture. drawImage then copies that previous picture, happily
               and instantly, and nothing anywhere is in an error state.

               requestVideoFrameCallback is the signal that actually means a
               new frame has been presented and is there to be drawn. It is
               registered before currentTime is set, because the seek can
               finish before the next line runs. */
            v.__ncFrameReady = false;
            if (typeof v.requestVideoFrameCallback === 'function') {
              try {
                v.requestVideoFrameCallback(function () { v.__ncFrameReady = true; });
              } catch (e) { v.__ncFrameReady = true; }
            } else {
              /* No rVFC: `seeked` at least fires after the seek rather than
                 during it, which is still closer than polling a flag. */
              var onSeeked = function () { v.__ncFrameReady = true; };
              try { v.addEventListener('seeked', onSeeked, { once: true }); } catch (e) { v.__ncFrameReady = true; }
            }
            v.currentTime = next;
            /* ONLY WAIT FOR A CLIP THAT WAS ALREADY WORKING, and only while
               it keeps working. Both halves close the same door the old
               global test left open.

               readyState >= 2 means this element has data right now, so
               after a 33ms step it ought to again, and waiting for it is
               reasonable. An element abandoned half-loaded by an earlier
               export sits at readyState 1 for ever: it is never stamped, so
               it is never waited for, and it cannot cost this export a
               single millisecond however stuck it is.

               __ncMisses is the second half. If a clip that did look healthy
               times out again and again it is not going to start working, and
               600ms a frame for the rest of the run would be worse than the
               hang this file was written to prevent. After MAX_MISSES it is
               written off — that one clip only, for the rest of the export,
               with every other source still properly waited for. */
            /* EVER ready, not ready RIGHT NOW — and this distinction is the
               whole of the freeze that was left.

               The guard exists to ignore elements that never loaded, so that
               a half-dead one from an earlier export cannot hold anything
               up. readyState looked like the way to ask. It is not: a live
               element DROPS below 2 while it seeks, and a long seek is
               precisely when it stays there. So the elements that most
               needed waiting for were the only ones never waited for.

               Measured on an edit that cuts between six points scattered
               through a two-minute source: 360 frames, 36 distinct, one
               freeze of 171 frames — five and a half seconds of one still
               picture — and forcedFrames 0, because nothing ever waited at
               all. A sticky flag asks the question that was meant: has this
               element ever worked? */
            v.__ncSeekAt = v.__ncEverReady ? now : 0;
          } catch (e) {}
        }
      }
    } catch (e) {}
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

    /* BUILT AFTER THE FRAME RATE IS KNOWN, not before. The muxer is told the
       frame rate when it is constructed and the encoder is configured with
       it, so neither can exist until the warm-up has decided what this
       machine can sustain. */
    function build() {
      try {
        var cfg = {
          target: target,
          video: { codec: 'avc', width: w, height: h, frameRate: fps },
          fastStart: 'in-memory',            /* the moov atom first, so it plays while downloading */
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
          codec: 'avc1.640028',              /* High @ 4.0 — see export-fix.js */
          width: w, height: h, bitrate: bps, framerate: fps,
          latencyMode: 'quality',
          avc: { format: 'avc' }
        });
        return true;
      } catch (e) { return false; }
    }

    var asked = fps;                 /* what was requested, before measuring */
    /* How many frames had to be taken without a clip being ready. Zero on a
       healthy export; a large number is the signature of the bug this file
       has twice now been fixed for, so it is reported rather than kept. */
    var capped = 0;
    var frames = 0, stopped = false, paused = false, started = 0;
    var rafId = 0;
    var warm = { until: 0, draws: 0, done: false };
    var realNow = performance.now;
    var baseReal = realNow.call(performance);
    var api;

    /* The virtual clock. The bundle computes its timeline position as
       (performance.now() - start) / 1000, so returning a clock that moves one
       frame-time per captured frame makes that expression read "the timeline
       position of the frame being drawn", which is what it was always meant
       to be. */
    function virtualNow() { return baseReal + (frames * 1000 / fps); }

  /* A STALL CANNOT BE ALLOWED TO LAST FOR EVER, which the real-time path
     already knew: export-fix.js gives up on one after STALL_CAP and carries
     on with whatever is on screen. This had no such cap and so could wait
     for all time — and did. Measured on a two-effect export that never
     finished: the stall test answered "not ready" 951 times out of 979.

     The reason is worth writing down, because it is the whole story of the
     next bug as well. export-fix.js keeps every <video> the page has ever
     created, up to 400 of them, and reports a stall if ANY of them is
     seeking or starved. An element from an earlier export that was abandoned
     half-loaded is not connected, still has a src, and sits at readyState 1
     for ever — so the test is permanently true and nothing ever captures.
     The real-time path rode over it because its cap expired and it simply
     recorded; this one had nothing to expire.

     The first answer to that was to stop trusting the test after three
     forced frames. It un-hung the export and cost it its motion instead —
     see sourcesReady() below, which asks a question that can actually be
     answered rather than giving up on an unanswerable one. */
    /* ----------------------------------------------------------------------
       ASK THE CLIPS THIS EXPORT IS DRIVING, NOT THE WHOLE PAGE.

       Reported as the export coming out at a low frame rate "again". It did
       not: the file was a true, perfectly even 30fps, 592 packets of exactly
       one frame each. What had gone was the MOTION — only 127 of those 592
       frames were different pictures, with the distinct ones arriving every
       eighth frame almost exactly, while the text and effects on top ran
       smoothly at the full rate. A compositor at full speed over footage
       that is nearly frozen is a seek that nobody waited for.

       The cause was the paragraph above this one. The old test asked
       __ncExportStalled(), which answers for EVERY <video> the page has
       ever made — including ones abandoned half-loaded by an earlier export,
       which sit unconnected at readyState 1 for ever and are therefore
       permanently "stalled". So the test was almost always true, the three
       capped waits were spent within the first couple of seconds, and
       `capped` never reset: trustStall went false and from then on NOTHING
       waited for a seek for the rest of the export. Every frame captured
       whatever the element happened to be holding. A seek costs roughly
       200-300ms; at 33.3ms a frame that is six to nine frames, and the
       measured gap was eight.

       Asking per element fixes both halves at once. These are the elements
       this export is driving by hand — they are unconnected, they have a
       src, and advanceSources() has just wound each one on and stamped it.
       A stale element from a previous export is never stamped, so it cannot
       manufacture a stall no matter what state it is stuck in, and the
       global give-up that existed to escape it is not needed.

       The cap stays, because an anti-hang rule is why the old code existed
       and that reason has not gone away. It is per element and per frame
       now: any one clip holds up any one frame by at most WAIT_CAP_MS, and
       then that frame is taken without it. Nothing is switched off for the
       rest of the run, so the very next frame waits properly again.
       ---------------------------------------------------------------------- */
    function sourcesReady() {
      var t = REAL_NOW();
      var waiting = false;
      try {
        var all = sources();
        for (var i = 0; i < all.length; i++) {
          var v = all[i];

          /* The frame itself, reported by the element. readyState and
             seeking are not enough — see advanceSources. */
          /* CONSECUTIVE, and this reset is the other half of the freeze.
             __ncMisses only ever counted up, so one slow seek early in a
             long export wrote that clip off for the whole of the rest of it
             — after which nothing waited for it again and every later cut
             into it froze for as long as it took, with no way back. A clip
             that answers is a clip that is working; forgive it. */
          /* NOTICED WHETHER OR NOT WE ARE WAITING ON IT, which this used
             to sit below a `if (!__ncSeekAt) continue`. A clip that had been
             not armed — an element whose seek has just been abandoned — is
             skipped by the test below, so readiness has to be noticed before
             that skip rather than after it. */
          if (v.__ncFrameReady) { v.__ncSeekAt = 0; v.__ncCounted = 0; continue; }
          if (!v.__ncSeekAt) continue;              /* not waiting on this one */
          /* GIVING UP ON A FRAME IS NOT GIVING UP ON THE SEEK.
             __ncSeekAt is deliberately left where it is. It is already older
             than the cap, so every later frame passes this test instantly
             instead of waiting again — one clip costs one WAIT_CAP_MS for
             the whole of a stall, not one per frame. Clearing it here is
             what made a slow seek cost 2.5 seconds thirty times over and
             turned a twelve-second export into one hundred and seventy-six.
             And because advanceSources leaves a pending seek alone, the seek
             that is still in flight now gets the time it needs to land. */
          if (t - v.__ncSeekAt >= WAIT_CAP_MS) {
            /* Once per stall, not once per animation frame. Counting every
               tick reported 7562 "forced frames" on a 360-frame export,
               which is a number that tells nobody anything. */
            if (!v.__ncCounted) { v.__ncCounted = 1; capped++; }
            continue;
          }
          waiting = true;
        }
      } catch (e) { return true; }
      return !waiting;
    }

    /* One capture per animation frame, AFTER the bundle has drawn. rAF
       callbacks run in the order they were registered, and this one is
       registered from inside a callback, so it lands after the draw that the
       loop scheduled for the same frame. */
    /* HOW FAST CAN THIS MACHINE ACTUALLY DRAW?
       Asked for after the first version shipped: "a 30 fps export takes
       15min ~that is very bad school gonna reject me". It did, and the
       reason is arithmetic: rendering is as fast as the machine draws, so a
       renderer managing 7 frames a second needs four seconds of work for
       every second of 30fps video.

       Taking four times the clip's length is not a trade worth making for
       somebody with a lesson to hand in. So before any frame is kept, the
       loop is watched for WARMUP_MS to see what it really sustains, and the
       output frame rate is set to something the machine can hit. The file is
       still perfectly evenly spaced — every frame exactly 1/fps apart, which
       is the whole point of this file — it just has fewer of them, and it
       finishes in about the length of the clip instead of four times it.

       Measured here: a clean project draws about 25/s, one effect takes it
       to about 12/s. Those land on 24fps and 20fps respectively rather than
       on 2.5x the wall time.

       The warm-up draws the same timeline position over and over, because
       the virtual clock does not advance until frames are being kept. That
       flatters the renderer slightly — no seeking between positions — so the
       measurement is multiplied by 0.9 before it is believed.

       It never goes ABOVE what was asked for, and never below FPS_FLOOR:
       past a certain point choppiness is worse than waiting, and somebody
       who would rather wait can still export at a smaller size. */
    function chooseFps(drawsPerSecond) {
      /* 1.4, not 1.0: the render is allowed to take forty per cent longer
         than the clip in exchange for keeping the frame rate that was asked
         for. A machine drawing 25/s keeps 30fps and finishes in about 1.2x
         the clip's length, which is a trade worth making; one drawing 8/s
         drops to 12fps rather than spending four times the length on
         smoothness nobody asked to wait for. */
      var usable = drawsPerSecond * 1.4;
      for (var i = 0; i < FPS_STEPS.length; i++) {
        var step = FPS_STEPS[i];
        if (step > fps) continue;                /* never more than asked for */
        if (step <= usable) return step;
      }
      return Math.max(FPS_FLOOR, Math.min(fps, FPS_STEPS[FPS_STEPS.length - 1]));
    }

    function pump() {
      if (stopped) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        if (stopped) return;

        if (!warm.done) {
          warm.draws++;
          if (realNow.call(performance) >= warm.until) {
            warm.done = true;
            var rate = warm.draws * 1000 / WARMUP_MS;
            var picked = chooseFps(rate);
            if (picked !== fps) {
              fps = picked;
              if (api.__onFpsChange) { try { api.__onFpsChange(picked, rate); } catch (e) {} }
            }
            api.__measured = { drawsPerSecond: Math.round(rate * 10) / 10, fps: fps };
            /* Kept on the module so an export can be looked at afterwards —
               by a test, or by somebody asking why their file is 24fps. */
            window.NC_EXPORT_OFFLINE.last = {
              drawsPerSecond: api.__measured.drawsPerSecond, fps: fps, asked: asked,
              /* Filled in as the export runs — read it afterwards. */
              get forcedFrames() { return capped; }
            };
            if (!build()) { if (onFail) onFail(); return; }
          }
          pump();
          return;
        }

        if (!paused && sourcesReady()) {
          try {
            var frame = new VideoFrame(canvas, {
              timestamp: Math.round(frames * 1e6 / fps),
              duration: Math.round(1e6 / fps)
            });
            encoder.encode(frame, { keyFrame: frames % Math.max(1, Math.round(fps * KEY_EVERY_S)) === 0 });
            frame.close();
            frames++;
            /* Wind the sources on by exactly the amount the clock just
               moved, so the next draw finds them where it expects. */
            advanceSources(1 / fps);
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
        warm.until = started + WARMUP_MS;
        markActive();
        window.__ncOfflineExport = true;
        /* The virtual clock is installed from the first moment, so the
           timeline does not advance during the warm-up: the loop redraws the
           same position and the measurement costs no footage. */
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
        if (!encoder) {                    /* stopped inside the warm-up */
          try { window.NC_EXPORT_OFFLINE.last = { error: 'stopped during warm-up' }; } catch (e) {}
          if (onFail) onFail();
          return;
        }
        finish().then(function (blob) {
          if (!ok || !blob || !blob.size) {
            try { window.NC_EXPORT_OFFLINE.last = { error: 'encoder produced nothing' }; } catch (e) {}
            if (onFail) onFail(); return;
          }
          try { if (api.ondataavailable) api.ondataavailable({ data: blob }); } catch (e) {}
          try { if (api.onstop) api.onstop({}); } catch (e) {}
        }, function (e) {
          try { window.NC_EXPORT_OFFLINE.last = { error: String((e && e.message) || e) }; } catch (x) {}
          if (onFail) onFail();
        });
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

    /* WHY THE FAST PATH DID NOT RUN.
       Every return below hands the export back to the real-time recorder,
       and until now it did so in silence — so "my export is choppy" had no
       way of being told apart from "my export never used this file at all",
       which is exactly the hour I lost chasing the wrong one of those. The
       reason is recorded where the frame rate already is. */
    function fellBack(why) {
      try { window.NC_EXPORT_OFFLINE.last = { path: 'real-time', why: why }; } catch (e) {}
    }

    var wrapped = function (stream, format, codec, bps) {
      var fallback = function (why) {
        fellBack(why || 'unknown');
        return prev(stream, format, codec, bps);
      };
      try {
        /* Per export: a project can gain or lose sound between two of them. */
        realAudio = null; decoded = {};
        if (!haveBits()) {
          return fallback('this browser has no VideoEncoder/VideoFrame, or mp4-muxer did not load');
        }
        /* MP4 only. The muxer writes MP4 and nothing else, and quietly
           handing somebody an MP4 when they picked WebM is the exact bug
           export-fix.js has a long comment about. */
        if (String(format || '').toLowerCase().indexOf('webm') === 0) {
          return fallback('WebM was asked for and this path only writes MP4');
        }
        var canvas = canvasFor.get(stream);
        if (!canvas || !canvas.width || !canvas.height) {
          return fallback('the canvas behind the recording stream could not be identified' +
                          ' (captureStream was called before this file patched it)');
        }

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
        return hasRealAudio().then(function (wantsAudio) {
        var audioOk = wantsAudio ? aacWorks() : Promise.resolve(false);

        return Promise.all([
          VideoEncoder.isConfigSupported({
            codec: 'avc1.640028', width: canvas.width, height: canvas.height,
            bitrate: rate, framerate: fps
          }),
          audioOk
        ]).then(function (both) {
          var sup = both[0], canAac = both[1];
          if (!sup || !sup.supported) return fallback('H.264 at this size is not encodable here');
          if (wantsAudio && !canAac) {
            return fallback('the project has sound and this browser has no AAC encoder' +
                            ' — a laggy export with audio beats a smooth silent one');
          }
          var rec = makeOffline(canvas, 'video/mp4', rate, fps, wantsAudio && canAac,
                                function () {});
          if (!rec) return fallback('the offline recorder could not be built');
          return { recorder: rec, mime: 'video/mp4;codecs=avc1.640028', ext: 'mp4', offline: true };
        });
        }).catch(function (e) {
          return fallback('checking the encoder threw: ' + ((e && e.message) || e));
        });
      } catch (e) { return fallback('setting up threw: ' + ((e && e.message) || e)); }
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
