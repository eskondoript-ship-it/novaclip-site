/* ============================================================================
   NOVACLIP HYPE LAB — making a finished edit hold attention, without lying
   ============================================================================
   You bring a video you have ALREADY cut. This does not re-edit it. It looks
   at the cut you made, finds the places where attention falls off, and adds
   the things that hold it: a beat-timed punch, a light wash behind a flat
   stretch, words on screen, and a music bed underneath.

   WHY THIS IS NOT "ADD RANDOM EFFECTS"

   An effect that fires everywhere is wallpaper — the eye stops seeing it in
   about four seconds. Everything here is placed against a measurement:

     punch    lands on a beat that is ALSO near a cut you already made, so it
              reinforces your edit instead of fighting it
     wash     goes over a FLAT STRETCH — a run of seconds where both motion and
              loudness sit below the clip's own median. That is where a viewer
              leaves
     words    go at the hook (first 2s), at the first flat stretch, and at the
              end. Three places, because a fourth is noise
     music    is generated at the clip's own tempo, so it agrees with the cuts

   NOTHING IS UPLOADED TO DO ANY OF THIS. The frames are decoded into a canvas
   in this tab and thrown away, exactly as moderate.js does. The only thing
   that can leave the device is four still frames at 512px, and only if the
   creator presses the button that asks the AI to suggest the words.

   ============================================================================
   THE PART THAT MATTERS MOST: THIS TOOL COULD HURT SOMEBODY
   ============================================================================
   A tool whose whole purpose is punchy, high-contrast effects is the exact
   shape of tool that gives somebody a photosensitive seizure. moderate.js
   already measures that hazard on clips coming IN. It would be indefensible
   to measure it on the way in and then manufacture it on the way out.

   So the plan is checked against WCAG 2.3.1 before it can be rendered:
   no more than three luminance flashes in any one second, where a flash is a
   relative-luminance change above 10%. The check runs on the effect curve this
   file generates — which is knowable exactly, because this file generates it —
   and effects are DROPPED until the plan passes. See capFlashes().

   The cap is not a preference and there is no switch for it.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_HYPE) return;

  /* ---- analysis resolution -------------------------------------------------
     96x54 is what moderate.js uses and it is enough: luminance and frame
     difference at this size track the full-resolution numbers closely, and it
     keeps a 60-second clip inside a second or two of work. */
  var AW = 96, AH = 54;
  var HOP = 0.1;                 /* energy curve resolution, seconds */
  var AI_FRAMES = 4, AI_EDGE = 512;

  /* WCAG 2.3.1: three general flashes per second, a flash being a relative
     luminance change above 10%. Same constants as moderate.js on purpose —
     two different numbers for the same hazard in one product is a bug. */
  var FLASH_DELTA = 0.10, FLASH_LIMIT = 3;

  /* ======================================================================
     SMALL SHARED HELPERS
     ====================================================================== */

  function relLum(r, g, b) {
    var c = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /* A MediaRecorder WebM carries no duration in its header, so the browser
     reports Infinity until it has seen the end of the file. Seeking past the
     end forces it to go and find the real one. publish.html and moderate.js
     both do this; a clip exported from the NovaClip editor hits it every
     time. */
  function realDuration(v) {
    return new Promise(function (resolve) {
      var d = v.duration;
      if (isFinite(d) && d > 0) return resolve(d);
      var done = false;
      function settle() {
        if (done) return;
        done = true;
        v.removeEventListener('durationchange', onChange);
        try { v.currentTime = 0; } catch (e) {}
        resolve(isFinite(v.duration) && v.duration > 0 ? v.duration : 0);
      }
      function onChange() { if (isFinite(v.duration) && v.duration > 0) settle(); }
      v.addEventListener('durationchange', onChange);
      try { v.currentTime = 1e101; } catch (e) { settle(); }
      setTimeout(settle, 4000);
    });
  }

  function seek(v, t) {
    return new Promise(function (resolve) {
      var done = false;
      function ok() { if (done) return; done = true; v.removeEventListener('seeked', ok); resolve(); }
      v.addEventListener('seeked', ok);
      try { v.currentTime = Math.max(0, t); } catch (e) { ok(); }
      setTimeout(ok, 2500);
    });
  }

  function openVideo(src) {
    return new Promise(function (resolve, reject) {
      var v = document.createElement('video');
      v.preload = 'auto'; v.muted = true; v.playsInline = true;
      v.crossOrigin = 'anonymous';
      v.onloadedmetadata = function () { resolve(v); };
      v.onerror = function () { reject(new Error('That file could not be read as a video.')); };
      setTimeout(function () { reject(new Error('That file took too long to open.')); }, 20000);
      v.src = src;
    });
  }

  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; });
    return s[Math.floor(s.length / 2)];
  }

  /* ======================================================================
     1. WATCHING THE CLIP — luminance, motion and cuts
     ======================================================================
     One play-through with requestVideoFrameCallback rather than a set of
     seeks. A seek-sampled curve cannot see a cut: two frames eight seconds
     apart differ for a hundred reasons and none of them is an edit. Cuts and
     motion only exist between CONSECUTIVE frames, so the clip has to actually
     run. rVFC hands back mediaTime, so dropped frames shift the sample times
     rather than corrupting them.

     Firefox does not implement rVFC. It gets the seek-sampled fallback, which
     produces a usable energy curve and no cut list — and the plan degrades to
     using beats alone. Saying so is better than pretending the cuts are there. */
  function watch(v, onProgress) {
    return new Promise(function (resolve) {
      var c = document.createElement('canvas');
      c.width = AW; c.height = AH;
      var ctx = c.getContext('2d', { willReadFrequently: true });

      var lum = [], motion = [], times = [];
      var prev = null, dur = v.duration || 0;

      /* One pass over the pixels: the per-pixel luminance is kept so the NEXT
         frame can difference against it, which is what makes a cut visible.
         Computing it twice — once to sum, once to store — doubled the cost of
         the hottest loop in the file for nothing. */
      function sample(t) {
        ctx.drawImage(v, 0, 0, AW, AH);
        var d = ctx.getImageData(0, 0, AW, AH).data;
        var n = AW * AH;
        var cur = new Float32Array(n);
        var L = 0, diff = 0;
        for (var i = 0, j = 0; j < n; i += 4, j++) {
          var l = relLum(d[i], d[i + 1], d[i + 2]);
          cur[j] = l;
          L += l;
          if (prev) diff += Math.abs(l - prev[j]);
        }
        times.push(t);
        lum.push(L / n);
        motion.push(prev ? diff / n : 0);
        prev = cur;
      }

      var useRVFC = typeof v.requestVideoFrameCallback === 'function';

      if (!useRVFC) {
        /* Fallback: dense-ish seeks. Enough for an energy curve, not enough
           for cuts, and the caller is told which it got. */
        (async function () {
          var n = Math.min(120, Math.max(12, Math.round((dur || 1) / HOP)));
          for (var i = 0; i < n; i++) {
            var t = ((i + 0.5) / n) * dur;
            await seek(v, t);
            sample(t);
            if (onProgress && i % 10 === 0) onProgress(i / n);
          }
          resolve({ times: times, lum: lum, motion: motion, dense: false });
        })();
        return;
      }

      var stopped = false;
      function finish() {
        if (stopped) return;
        stopped = true;
        try { v.pause(); } catch (e) {}
        resolve({ times: times, lum: lum, motion: motion, dense: true });
      }

      function onFrame(now, meta) {
        if (stopped) return;
        var t = meta && isFinite(meta.mediaTime) ? meta.mediaTime : v.currentTime;
        sample(t);
        if (onProgress && dur) onProgress(Math.min(1, t / dur));
        if (v.ended || (dur && t >= dur - 0.02)) return finish();
        v.requestVideoFrameCallback(onFrame);
      }

      v.currentTime = 0;
      v.muted = true;
      /* Faster than real time where the browser allows it; the analysis does
         not care how fast the frames arrive, only what their mediaTime is. */
      try { v.playbackRate = 2; } catch (e) {}
      v.addEventListener('ended', finish);
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        /* Autoplay refused. Not fatal — fall back to seeks. */
        stopped = true;
        (async function () {
          var n = Math.min(120, Math.max(12, Math.round((dur || 1) / HOP)));
          for (var i = 0; i < n; i++) { await seek(v, ((i + 0.5) / n) * dur); sample(v.currentTime); }
          resolve({ times: times, lum: lum, motion: motion, dense: false });
        })();
      });
      v.requestVideoFrameCallback(onFrame);
      /* A clip that never ends is a clip that has gone wrong. */
      setTimeout(finish, Math.max(20000, (dur || 10) * 1000 * 0.8));
    });
  }

  /* ======================================================================
     2. LISTENING TO THE CLIP — loudness envelope, onsets, tempo
     ======================================================================
     decodeAudioData is tried first because it is exact and runs faster than
     real time. It does not always work: whether a browser will decode the
     audio track out of an MP4 container varies. When it refuses, the caller
     still gets a usable result with hasAudio:false, and the plan falls back to
     placing punches on cuts alone. */
  async function listen(buf) {
    var out = { hasAudio: false, rms: [], onsets: [], bpm: 0, hop: HOP };
    if (!buf || !buf.byteLength) return out;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return out;
    var ctx = new AC();
    var audio;
    try {
      audio = await ctx.decodeAudioData(buf.slice(0));
    } catch (e) {
      try { ctx.close(); } catch (e2) {}
      return out;                          /* silent, or a container we cannot open */
    }
    var sr = audio.sampleRate;
    var ch = audio.getChannelData(0);
    var win = Math.max(1, Math.round(sr * HOP));
    var rms = [];
    for (var i = 0; i + win <= ch.length; i += win) {
      var s = 0;
      for (var k = 0; k < win; k++) { var x = ch[i + k]; s += x * x; }
      rms.push(Math.sqrt(s / win));
    }
    /* Onsets: a rise in energy well above the local average. Crude next to a
       spectral-flux detector and entirely good enough to place a zoom on. */
    var onsets = [];
    var med = median(rms) || 1e-6;
    for (var j = 2; j < rms.length - 1; j++) {
      var rise = rms[j] - rms[j - 1];
      if (rise > med * 0.35 && rms[j] > med * 1.15 && rms[j] >= rms[j + 1]) {
        var t = j * HOP;
        if (!onsets.length || t - onsets[onsets.length - 1] > 0.22) onsets.push(t);
      }
    }
    /* Tempo from the commonest gap between onsets, folded into 70-180 BPM so
       that a half-time or double-time reading lands somewhere musical. */
    var gaps = [];
    for (var g = 1; g < onsets.length; g++) gaps.push(onsets[g] - onsets[g - 1]);
    var bpm = 0;
    if (gaps.length >= 4) {
      var mg = median(gaps);
      if (mg > 0.05) {
        bpm = 60 / mg;
        while (bpm < 70) bpm *= 2;
        while (bpm > 180) bpm /= 2;
      }
    }
    out.hasAudio = true;
    out.rms = rms;
    out.onsets = onsets;
    out.bpm = bpm ? Math.round(bpm) : 0;
    try { ctx.close(); } catch (e) {}
    return out;
  }

  /* ======================================================================
     3. THE READING — one energy curve, its cuts and its flat stretches
     ====================================================================== */
  function read(vis, aud, dur) {
    var n = Math.max(1, Math.round(dur / HOP));
    var energy = new Array(n).fill(0);

    /* Motion resampled onto the 0.1s grid. */
    var mMax = 0, i;
    for (i = 0; i < vis.motion.length; i++) mMax = Math.max(mMax, vis.motion[i]);
    var counts = new Array(n).fill(0);
    for (i = 0; i < vis.times.length; i++) {
      var slot = Math.min(n - 1, Math.max(0, Math.floor(vis.times[i] / HOP)));
      energy[slot] += mMax ? vis.motion[i] / mMax : 0;
      counts[slot]++;
    }
    for (i = 0; i < n; i++) if (counts[i]) energy[i] /= counts[i];

    /* Loudness folded in at equal weight where we have it. A clip can hold
       attention by being loud or by moving; the curve should notice both. */
    if (aud.hasAudio && aud.rms.length) {
      var aMax = Math.max.apply(null, aud.rms) || 1;
      for (i = 0; i < n; i++) {
        var a = (aud.rms[Math.min(aud.rms.length - 1, i)] || 0) / aMax;
        energy[i] = energy[i] * 0.5 + a * 0.5;
      }
    }

    /* Cuts: a frame-difference spike far above the clip's own typical
       difference. Only meaningful from a dense pass. */
    var cuts = [];
    if (vis.dense && vis.motion.length > 4) {
      var mMed = median(vis.motion.filter(function (x) { return x > 0; })) || 0;
      for (i = 1; i < vis.motion.length; i++) {
        if (vis.motion[i] > Math.max(0.02, mMed * 4)) {
          var t = vis.times[i];
          if (!cuts.length || t - cuts[cuts.length - 1] > 0.4) cuts.push(t);
        }
      }
    }

    /* Flat stretches: two and a half seconds or more below the clip's own
       median energy. Judged against the clip itself, never against an absolute
       — a calm vlog is not a broken video, and a threshold that says so would
       decorate every quiet clip into noise. */
    var eMed = median(energy);
    var flat = [], run = -1;
    for (i = 0; i <= n; i++) {
      var low = i < n && energy[i] < eMed * 0.75;
      if (low && run < 0) run = i;
      if (!low && run >= 0) {
        var from = run * HOP, to = i * HOP;
        if (to - from >= 2.5) flat.push({ from: from, to: to });
        run = -1;
      }
    }

    return {
      duration: dur,
      hop: HOP,
      energy: energy,
      cuts: cuts,
      flat: flat,
      bpm: aud.bpm,
      onsets: aud.onsets,
      hasAudio: aud.hasAudio,
      dense: vis.dense,
      meanLum: vis.lum.length ? vis.lum.reduce(function (a, b) { return a + b; }, 0) / vis.lum.length : 0.5
    };
  }

  /* ======================================================================
     4. THE PLAN
     ====================================================================== */

  /* Beat grid from the detected tempo, aligned to the first onset so it sits
     where the music actually is rather than at t=0. */
  function beatGrid(a) {
    if (!a.bpm) return [];
    var step = 60 / a.bpm;
    var start = a.onsets.length ? a.onsets[0] % step : 0;
    var out = [];
    for (var t = start; t < a.duration; t += step) out.push(t);
    return out;
  }

  function nearest(list, t, within) {
    var best = null, bd = Infinity;
    for (var i = 0; i < list.length; i++) {
      var d = Math.abs(list[i] - t);
      if (d < bd) { bd = d; best = list[i]; }
    }
    return bd <= within ? best : null;
  }

  function plan(a, opts) {
    opts = opts || {};
    var want = {
      punch: opts.punch !== false,
      wash: opts.wash !== false,
      words: opts.words !== false,
      music: opts.music !== false
    };
    var beats = beatGrid(a);
    var fx = [];

    /* PUNCH — a short zoom-in on a beat that coincides with a cut. Where there
       is no tempo, the cuts alone carry it. Where there are neither (a single
       unbroken take with no audio) there is nothing honest to sync to, and the
       plan says so rather than inventing a rhythm. */
    if (want.punch) {
      var anchors = [];
      if (beats.length && a.cuts.length) {
        a.cuts.forEach(function (c) {
          var b = nearest(beats, c, 0.18);
          if (b !== null) anchors.push(b);
        });
      }
      if (!anchors.length) anchors = a.cuts.slice();
      if (!anchors.length && beats.length) {
        /* Every fourth beat — a bar, at most tempos. */
        for (var i = 0; i < beats.length; i += 4) anchors.push(beats[i]);
      }
      /* No two punches inside 1.2s: past that it reads as a wobble. */
      var last = -9;
      anchors.sort(function (x, y) { return x - y; }).forEach(function (t) {
        if (t - last < 1.2 || t > a.duration - 0.3) return;
        last = t;
        fx.push({ kind: 'punch', at: t, len: 0.22, amount: 0.055 });
      });
    }

    /* WASH — a slow coloured light rising behind a flat stretch and falling
       again. Rise and fall are 700ms each by design: anything faster is the
       thing the flash cap exists to stop. */
    if (want.wash) {
      a.flat.forEach(function (f, i) {
        var len = Math.min(f.to - f.from, 4.5);
        if (len < 1.6) return;
        fx.push({
          kind: 'wash', at: f.from + 0.2, len: len,
          hue: [188, 322, 268][i % 3], amount: 0.24, ramp: 0.7
        });
      });
    }

    /* WORDS — three at most. The hook, the first flat stretch, the end card.
       Text is a placeholder until the creator writes it or asks the AI. */
    if (want.words) {
      fx.push({ kind: 'words', at: 0.35, len: 2.2, text: '', slot: 'hook',
                hint: 'The first two seconds decide whether the rest gets watched.' });
      if (a.flat.length) {
        fx.push({ kind: 'words', at: a.flat[0].from + 0.4, len: 2.4, text: '', slot: 'middle',
                  hint: 'The flattest stretch in the clip — say something here.' });
      }
      if (a.duration > 6) {
        fx.push({ kind: 'words', at: Math.max(0, a.duration - 2.6), len: 2.4, text: '', slot: 'end',
                  hint: 'The end card. Ask for the follow here, not earlier.' });
      }
    }

    if (want.music) {
      fx.push({ kind: 'music', at: 0, len: a.duration,
                bpm: a.bpm || 110, bed: a.hasAudio ? 0.16 : 0.5 });
    }

    fx.sort(function (x, y) { return x.at - y.at; });
    return capFlashes(fx, a);
  }

  /* ---- the safety cap -----------------------------------------------------
     Builds the luminance curve THIS FILE will add — which is knowable exactly,
     because this file is what draws it — samples it at 60Hz, counts changes
     above 10% within each one-second window, and drops the offending effect
     until every window is under three. Punches are dropped before washes
     because a punch is a zoom and contributes almost nothing to luminance,
     so a plan that fails is nearly always failing on washes. */
  function lumaAt(fx, t) {
    var add = 0;
    for (var i = 0; i < fx.length; i++) {
      var e = fx[i];
      if (t < e.at || t > e.at + e.len) continue;
      if (e.kind === 'wash') {
        var u = t - e.at, r = e.ramp || 0.7;
        var k = u < r ? u / r : (u > e.len - r ? Math.max(0, (e.len - u) / r) : 1);
        add += e.amount * k;
      } else if (e.kind === 'punch') {
        /* A zoom changes framing, not brightness. Counted at a token value so
           it is never zero, and so a pathological plan of hundreds of punches
           still shows up in the count. */
        add += 0.01;
      }
    }
    return Math.min(1, add);
  }

  function worstRate(fx, dur) {
    var step = 1 / 60, prev = null, flashes = [];
    for (var t = 0; t <= dur; t += step) {
      var l = lumaAt(fx, t);
      if (prev !== null && Math.abs(l - prev) >= FLASH_DELTA) flashes.push(t);
      prev = l;
    }
    var worst = 0;
    for (var i = 0; i < flashes.length; i++) {
      var n = 0;
      for (var j = i; j < flashes.length && flashes[j] - flashes[i] < 1; j++) n++;
      worst = Math.max(worst, n);
    }
    return worst;
  }

  function capFlashes(fx, a) {
    var dropped = 0;
    var order = ['wash', 'punch'];
    for (var pass = 0; pass < order.length; pass++) {
      while (worstRate(fx, a.duration) > FLASH_LIMIT) {
        var idx = -1;
        for (var i = fx.length - 1; i >= 0; i--) if (fx[i].kind === order[pass]) { idx = i; break; }
        if (idx < 0) break;
        fx.splice(idx, 1);
        dropped++;
      }
      if (worstRate(fx, a.duration) <= FLASH_LIMIT) break;
    }
    fx.flashDropped = dropped;
    fx.flashRate = worstRate(fx, a.duration);
    return fx;
  }

  /* ======================================================================
     5. DRAWING ONE FRAME
     ====================================================================== */
  function drawFrame(ctx, video, fx, t, W, H) {
    var i, e;

    /* Punch: a zoom that eases out, so it snaps in and settles. */
    var zoom = 1;
    for (i = 0; i < fx.length; i++) {
      e = fx[i];
      if (e.kind !== 'punch') continue;
      var u = (t - e.at) / e.len;
      if (u < 0 || u > 1) continue;
      zoom = Math.max(zoom, 1 + e.amount * (1 - u) * (1 - u));
    }

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    var dw = W * zoom, dh = H * zoom;
    ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();

    /* Wash: a soft coloured light from the lower third, screened over the
       picture. Ramped, never cut in. */
    for (i = 0; i < fx.length; i++) {
      e = fx[i];
      if (e.kind !== 'wash') continue;
      var v = t - e.at, r = e.ramp || 0.7;
      if (v < 0 || v > e.len) continue;
      var k = v < r ? v / r : (v > e.len - r ? Math.max(0, (e.len - v) / r) : 1);
      if (k <= 0) continue;
      var g = ctx.createRadialGradient(W * 0.5, H * 0.92, 0, W * 0.5, H * 0.92, H * 1.05);
      g.addColorStop(0, 'hsla(' + e.hue + ',95%,62%,' + (e.amount * k) + ')');
      g.addColorStop(1, 'hsla(' + e.hue + ',95%,62%,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    /* Words: entering with a short rise, held, then out. Drawn with a stroke
       behind the fill so they stay readable over a bright frame. */
    for (i = 0; i < fx.length; i++) {
      e = fx[i];
      if (e.kind !== 'words' || !e.text) continue;
      var w = t - e.at;
      if (w < 0 || w > e.len) continue;
      var inK = Math.min(1, w / 0.28);
      var outK = Math.min(1, Math.max(0, (e.len - w) / 0.28));
      var alpha = Math.min(inK, outK);
      var pop = 1 + 0.06 * (1 - inK);
      var size = Math.round(H * (e.slot === 'hook' ? 0.093 : 0.072)) * pop;
      var y = e.slot === 'hook' ? H * 0.20 : (e.slot === 'end' ? H * 0.50 : H * 0.80);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 ' + size + 'px "Plus Jakarta Sans", Segoe UI, system-ui, sans-serif';
      var lines = wrap(ctx, e.text, W * 0.86);
      var lh = size * 1.16;
      var top = y - ((lines.length - 1) * lh) / 2;
      for (var L = 0; L < lines.length; L++) {
        var ly = top + L * lh;
        ctx.lineWidth = Math.max(3, size * 0.14);
        ctx.strokeStyle = 'rgba(0,0,0,0.72)';
        ctx.lineJoin = 'round';
        ctx.strokeText(lines[L], W / 2, ly);
        ctx.fillStyle = '#fff';
        ctx.fillText(lines[L], W / 2, ly);
      }
      ctx.restore();
    }
  }

  function wrap(ctx, text, max) {
    var words = String(text).split(/\s+/), out = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > max && line) { out.push(line); line = words[i]; }
      else line = t;
    }
    if (line) out.push(line);
    return out.slice(0, 3);
  }

  /* ======================================================================
     6. THE MUSIC BED — generated, not licensed
     ======================================================================
     No music file ships with NovaClip and none is fetched. A bed that came
     from somewhere else would be somebody's copyright on a teenager's upload,
     and a claim on their channel is a real cost to them.

     So it is synthesised here at the clip's own tempo: kick, hat, a bass note
     and a soft two-chord pad. It is deliberately plain — it sits under the
     clip rather than competing with it, and it is mixed low when the clip
     already has its own audio. */
  async function makeMusic(bpm, seconds, sampleRate) {
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return null;
    var sr = sampleRate || 44100;
    var ctx = new OAC(2, Math.ceil(seconds * sr), sr);
    var beat = 60 / (bpm || 110);

    var master = ctx.createGain();
    master.gain.value = 0.9;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 9000;
    master.connect(lp); lp.connect(ctx.destination);

    function env(node, at, a, d, peak) {
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + a);
      g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
      node.connect(g); g.connect(master);
      return g;
    }

    function kick(at) {
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, at);
      o.frequency.exponentialRampToValueAtTime(45, at + 0.11);
      env(o, at, 0.004, 0.16, 0.9);
      o.start(at); o.stop(at + 0.2);
    }
    function hat(at) {
      var len = Math.max(1, Math.floor(sr * 0.03));
      var b = ctx.createBuffer(1, len, sr);
      var d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var s = ctx.createBufferSource(); s.buffer = b;
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
      s.connect(hp);
      env(hp, at, 0.002, 0.04, 0.16);
      s.start(at);
    }
    function bass(at, hz, len) {
      var o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = hz;
      env(o, at, 0.02, len, 0.24);
      o.start(at); o.stop(at + len + 0.1);
    }
    function pad(at, hz, len) {
      [0, 3.5].forEach(function (det) {
        var o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = hz; o.detune.value = det;
        var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
        o.connect(f);
        env(f, at, 0.35, len, 0.055);
        o.start(at); o.stop(at + len + 0.4);
      });
    }

    /* Two chords, four bars each — i then VI, which is the least attention-
       seeking progression there is, and that is what a bed should be. */
    var roots = [110, 87.31];
    var bars = Math.ceil(seconds / (beat * 4));
    for (var b = 0; b < bars; b++) {
      var barAt = b * beat * 4;
      if (barAt > seconds) break;
      var root = roots[Math.floor(b / 4) % roots.length];
      pad(barAt, root * 2, beat * 4);
      for (var q = 0; q < 4; q++) {
        var at = barAt + q * beat;
        if (at > seconds) break;
        if (q === 0 || q === 2) kick(at);
        hat(at + beat / 2);
        if (q % 2 === 0) bass(at, root, beat * 0.8);
      }
    }
    try { return await ctx.startRendering(); } catch (e) { return null; }
  }

  /* ======================================================================
     7. ASKING THE AI FOR THE WORDS  (opt-in, four frames, 512px)
     ======================================================================
     Same shape as moderate.js: four stills, no audio, no filename, and only
     when the creator presses the button. The model is asked for the words
     only — where they go was decided by measurement above, and a model
     guessing at timings it cannot see would be worse than the curve. */
  async function grabFrames(src, n) {
    var v = await openVideo(src);
    var dur = await realDuration(v);
    var vw = v.videoWidth || 640, vh = v.videoHeight || 360;
    var scale = Math.min(1, AI_EDGE / Math.max(vw, vh));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(vw * scale));
    c.height = Math.max(1, Math.round(vh * scale));
    var ctx = c.getContext('2d');
    var out = [];
    for (var i = 0; i < n; i++) {
      await seek(v, dur > 0 ? ((i + 0.5) / n) * dur : 0);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      var url;
      try { url = c.toDataURL('image/jpeg', 0.72); }
      catch (e) {
        v.src = '';
        throw new Error('This video comes from another site, so the browser will not let the page read its frames.');
      }
      out.push(url.slice(url.indexOf(',') + 1));
    }
    v.src = '';
    return out;
  }

  var WORDS_PROMPT =
    'You write on-screen text for short videos made by teenage creators. ' +
    'The images are four frames sampled evenly from one finished clip.\n\n' +
    'Write three captions for this clip. Answer with ONE line of JSON and nothing else:\n' +
    '{"hook":"<max 6 words, shown in the first 2 seconds>",' +
    '"middle":"<max 7 words, shown during a quiet stretch>",' +
    '"end":"<max 5 words, the end card>"}\n\n' +
    'Rules: plain language a 15-year-old would actually type. No hashtags, no emoji, ' +
    'no ALL CAPS, no clickbait promising something the frames do not show. ' +
    'If the frames are too dark or too few to tell what the video is about, ' +
    'return {"hook":"","middle":"","end":""} rather than guessing — an honest blank ' +
    'is more useful than a caption about the wrong video.';

  async function askWords(src, onProgress) {
    var url = window.NC_AI_WORKER_URL;
    if (!url) throw new Error('No AI worker is configured on this site, so there is nothing to ask.');
    if (onProgress) onProgress('Taking four frames…');
    var frames = await grabFrames(src, AI_FRAMES);
    var parts = [{ text: WORDS_PROMPT }];
    frames.forEach(function (b64) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } });
    });
    if (onProgress) onProgress('Asking the AI…');
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        payload: {
          contents: [{ parts: parts }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        }
      })
    });
    var j = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(j.error || j.reason || ('The AI worker answered ' + res.status + '.'));
    var cand = j.candidates && j.candidates[0];
    var text = cand && cand.content && cand.content.parts &&
      cand.content.parts.map(function (p) { return p.text || ''; }).join('').trim();
    if (!text) {
      var reason = (cand && cand.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason);
      if (reason && /safety|block|prohibit/i.test(String(reason))) {
        throw new Error('The AI declined to answer about these frames.');
      }
      throw new Error('The AI sent an empty answer back.');
    }
    var m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('The AI answered in a shape this page could not read.');
    var o = JSON.parse(m[0]);
    return { hook: String(o.hook || ''), middle: String(o.middle || ''), end: String(o.end || '') };
  }

  /* ======================================================================
     8. EXPORT
     ======================================================================
     Real-time, because MediaRecorder records a stream and a stream runs at the
     speed of the clock. The encoder is chosen by export-fix.js, which tries
     candidates by actually recording a third of a second — isTypeSupported
     answers true for encoders that then emit nothing. */
  async function exportVideo(src, fx, opts, onProgress) {
    opts = opts || {};
    var v = await openVideo(src);
    var dur = await realDuration(v);
    var W = opts.width || v.videoWidth || 720;
    var H = opts.height || v.videoHeight || 1280;

    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    /* A frame has to exist before anything can be drawn from it. */
    await seek(v, 0);

    var stream = canvas.captureStream(opts.fps || 30);

    /* ---- keep painting while the encoder is being chosen -------------------
       captureStream emits a frame when the canvas is MODIFIED, not on a timer.
       export-fix.js picks an encoder by recording the stream for a moment and
       checking that bytes actually come out — and a canvas that is not being
       repainted produces no frames, so every candidate emitted nothing and the
       export failed with "no encoder that actually emits data" on a machine
       whose encoders are all fine.

       Measured: a blank canvas fails the trial, a canvas painted once fails it
       too, and a canvas being repainted passes. So it is repainted here, for
       the length of the trial and no longer. */
    var warming = true;
    (function warm() {
      if (!warming) return;
      drawFrame(ctx, v, fx, 0, W, H);
      requestAnimationFrame(warm);
    })();

    /* Audio: the clip's own track, plus the generated bed, mixed through one
       destination node so the recorder receives a single audio track. */
    var AC = window.AudioContext || window.webkitAudioContext;
    var actx = null, dest = null;
    if (AC) {
      actx = new AC();
      dest = actx.createMediaStreamDestination();
      try {
        var srcNode = actx.createMediaElementSource(v);
        var g = actx.createGain();
        g.gain.value = opts.keepAudio === false ? 0 : 1;
        srcNode.connect(g); g.connect(dest);
      } catch (e) { /* no audio track, or already wired: not fatal */ }

      var music = fx.filter(function (e) { return e.kind === 'music'; })[0];
      if (music && opts.music !== false) {
        var buf = await makeMusic(music.bpm, dur, actx.sampleRate);
        if (buf) {
          var bs = actx.createBufferSource();
          bs.buffer = buf;
          var mg = actx.createGain();
          mg.gain.value = music.bed;
          bs.connect(mg); mg.connect(dest);
          bs.start();
        }
      }
      dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
    }

    var picked = await window.__ncPickRecorder(stream, opts.format || 'webm',
                                               opts.codec || 'vp9', opts.bitrate || 8e6);
    warming = false;
    if (!picked) throw new Error('This browser produced no encoder that actually emits data.');

    var chunks = [];
    picked.recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };

    var done = new Promise(function (resolve) { picked.recorder.onstop = resolve; });
    picked.recorder.start(200);

    v.currentTime = 0;
    v.muted = false;
    v.playbackRate = 1;
    await v.play();

    await new Promise(function (resolve) {
      function tick() {
        if (v.ended || v.currentTime >= dur - 0.02) return resolve();
        drawFrame(ctx, v, fx, v.currentTime, W, H);
        if (onProgress && dur) onProgress(v.currentTime / dur);
        requestAnimationFrame(tick);
      }
      tick();
    });

    try { picked.recorder.stop(); } catch (e) {}
    await done;
    try { v.pause(); v.src = ''; } catch (e) {}
    if (actx) { try { await actx.close(); } catch (e) {} }

    if (!chunks.length) throw new Error('The recorder produced an empty file.');
    return { blob: new Blob(chunks, { type: picked.mime || 'video/webm' }), ext: picked.ext || 'webm' };
  }

  /* ======================================================================
     PUBLIC
     ====================================================================== */
  async function analyse(src, onProgress) {
    var v = await openVideo(src);
    var dur = await realDuration(v);
    if (!dur) throw new Error('That video has no readable length.');
    if (onProgress) onProgress('Watching the clip…', 0);
    var vis = await watch(v, function (p) { if (onProgress) onProgress('Watching the clip…', p * 0.7); });
    try { v.pause(); } catch (e) {}

    if (onProgress) onProgress('Listening…', 0.75);
    var buf = null;
    try {
      var r = await fetch(src);
      buf = await r.arrayBuffer();
    } catch (e) { /* object URL fetch can fail; the plan copes without audio */ }
    var aud = await listen(buf);

    if (onProgress) onProgress('Reading the energy…', 0.95);
    var a = read(vis, aud, dur);
    a.width = v.videoWidth || 0;
    a.height = v.videoHeight || 0;
    try { v.src = ''; } catch (e) {}
    if (onProgress) onProgress('Done', 1);
    return a;
  }

  window.NC_HYPE = {
    analyse: analyse,
    plan: plan,
    drawFrame: drawFrame,
    exportVideo: exportVideo,
    askWords: askWords,
    makeMusic: makeMusic,
    /* Exposed so the page can show the number rather than assert the promise,
       and so a test can prove the cap actually binds. */
    flash: { delta: FLASH_DELTA, limit: FLASH_LIMIT, rate: worstRate }
  };
})();
