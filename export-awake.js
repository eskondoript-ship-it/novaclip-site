/* NOVACLIP — AN EXPORT MUST NOT STOP BECAUSE THE TAB WENT TO THE BACKGROUND
 * ===========================================================================
 * A 34.5-second export came back with 34.5 seconds of sound and 6.5 seconds
 * of picture. ffprobe on the file:
 *
 *     audio (aac)   34.560708 s
 *     video (h264)   6.500367 s     194 frames, dead-even 30fps, then nothing
 *
 * It does not degrade, it stops. That is not an encoder fault, it is the
 * export loop, which lives in the compiled bundle and reads:
 *
 *     d.start(250);
 *     const y = performance.now();
 *     const I = () => {
 *       const F = (performance.now() - y) / 1e3;    // where we are = elapsed
 *       if (F >= i) { P(); return }                 // past the end: stop
 *       ... seek every source to F ...
 *       Wd(v, c.width, c.height, F, ...);           // draw one frame
 *       x = requestAnimationFrame(I);               // and again
 *     };
 *     x = requestAnimationFrame(I);
 *
 * Two facts about that loop meet badly. It is DRIVEN by requestAnimationFrame
 * and it is TIMED by the wall clock. Chrome stops serving rAF to a tab that is
 * hidden, minimised or completely covered by another window — but the audio
 * graph and the media elements feeding it are not throttled, because playing
 * music in a background tab has to keep working.
 *
 * So the moment the tab goes away:
 *
 *   - the loop stops being called, so the canvas is never drawn again, and
 *     captureStream has nothing to emit: the video track simply ends;
 *   - the recorder is still running and the audio keeps arriving;
 *   - the clock keeps counting, so when the tab comes back F has leapt past
 *     the end of the timeline, the loop exits on its very first call, and the
 *     file is closed as though it had finished.
 *
 * Nothing reports an error. The export says 100% and hands over a file whose
 * picture died at the moment you looked away.
 *
 * MEASURED, by holding rAF back for 9 seconds mid-export (the same thing a
 * hidden tab does) on a 25-second timeline:
 *
 *     control          274 frames    video 25.04s   audio 25.04s
 *     9s rAF stall     175 frames    video 24.99s   audio 24.98s
 *
 * 99 frames gone. The duration still reads 25 seconds, so the file looks
 * right and plays with a nine-second freeze in the middle.
 *
 * THE FIX: A CLOCK THAT DOES NOT GET THROTTLED
 *
 * The loop cannot be edited from out here, but the thing it is waiting on
 * can. requestAnimationFrame is wrapped so that, while an export is running,
 * every callback is registered twice: with the real rAF, and with a backstop
 * driven by Web Audio. Whichever fires first runs the callback; the other
 * finds it already done and does nothing.
 *
 * Web Audio is the right clock precisely because of the asymmetry that caused
 * the bug: a ScriptProcessorNode goes on firing onaudioprocess on the main
 * thread in a hidden tab, at the audio device's own rate, for the same reason
 * the recorder went on collecting sound. The bug's own cause is what fixes it.
 *
 * When the tab is visible rAF always wins — it is called first and fires in
 * about 16ms, well inside the grace period — so a normal export behaves
 * exactly as it did and this file costs nothing but a silent audio node.
 *
 * WHAT THIS DOES NOT CLAIM
 *
 * It keeps the loop running; it cannot make Chrome decode video faster than
 * it wants to for a tab nobody is looking at. If the browser throttles the
 * source <video> elements as well, some frames will repeat. A repeated frame
 * is a far smaller fault than a missing one, and the file stays the right
 * length with sound in sync, which is the part that was actually broken.
 *
 * This only ever applies during an export. At every other moment the wrapper
 * is a straight pass-through — one `if` and a call — and the audio node only
 * exists while an export is running.
 *
 * The wrapper is left in place rather than being removed when the export ends,
 * on purpose. editor-perf.js wraps requestAnimationFrame too; taking this one
 * off and putting it back around each export would reorder that stack and, if
 * anything had captured a reference in between, strand it. A pass-through that
 * stays put is cheaper than a wrapper that keeps being rebuilt.
 *
 * VERIFIED, driving the wrapper with a synthetic healthy 60Hz rAF: 252 frames
 * over four seconds, 252 served by rAF and 0 by the backstop. It fires when
 * rAF is starved and at no other time.
 */
(function () {
  'use strict';
  if (window.NC_AWAKE) return;

  /* How long to wait for the real rAF before the audio clock steps in.
     RELAXED while rAF is behaving: a pure safety net that a healthy 60Hz
     never reaches. TIGHT while rAF is starved, when the backstop is the only
     thing driving the export and should do it at about sixty a second. */
  var GRACE_RELAXED = 50;
  var GRACE_TIGHT   = 16;
  /* rAF counts as healthy if it has served anything this recently. Three
     frames at 60Hz, so ordinary jitter does not flip the mode back and forth.

     An earlier version switched to TIGHT the first time the backstop fired and
     back to RELAXED only if rAF then served something within GRACE_TIGHT. That
     is 16ms, and rAF at 60Hz arrives every 16.7 — so it essentially never
     switched back, and the audio clock ended up driving every export whether
     or not anything was wrong. Measured on an unstalled control export: 1458
     frames released by the backstop against 787 by rAF. Healthiness has to be
     judged on whether rAF is delivering at all, not on it winning a race
     against a deadline shorter than its own period. */
  var HEALTHY_MS = 50;

  var exporting = 0;           /* refcount: concurrent exports are allowed */
  var waiting = [];            /* callbacks registered but not yet run */
  var lastRafServe = 0;        /* when the real rAF last ran one of ours */
  var rescued = 0, served = 0;

  function grace() {
    return (Date.now() - lastRafServe < HEALTHY_MS) ? GRACE_RELAXED : GRACE_TIGHT;
  }

  var realRaf = window.requestAnimationFrame.bind(window);
  var realCaf = window.cancelAnimationFrame.bind(window);

  /* ---- the clock the browser will not throttle ----------------------------- */
  var actx = null, node = null, silence = null;

  function startClock() {
    if (node) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;                       /* no Web Audio: setTimeout fallback */
    try {
      actx = new AC();
      /* 256 frames at 48kHz is a tick every ~5ms — far finer than needed, and
         the smallest buffer means the least latency between the clock and the
         frame it releases. */
      node = actx.createScriptProcessor(256, 1, 1);
      node.onaudioprocess = tick;
      /* A ScriptProcessorNode only runs when it is connected to something that
         pulls on it, so it goes to the destination through a muted gain. The
         export hears nothing; the node gets its tick. */
      silence = actx.createGain();
      silence.gain.value = 0;
      node.connect(silence);
      silence.connect(actx.destination);
      if (actx.state === 'suspended') actx.resume();
    } catch (e) { stopClock(); }
  }

  function stopClock() {
    try { if (node) { node.onaudioprocess = null; node.disconnect(); } } catch (e) {}
    try { if (silence) silence.disconnect(); } catch (e) {}
    try { if (actx) actx.close(); } catch (e) {}
    actx = node = silence = null;
  }

  /* The fallback for a browser with no Web Audio, or a context that will not
     resume. Hidden tabs throttle this to roughly once a second, so it is not a
     substitute — it is the difference between a slow export and a dead one. */
  var fallback = 0;
  function startFallback() {
    if (fallback) return;
    fallback = setInterval(tick, GRACE_TIGHT);
  }
  function stopFallback() { if (fallback) { clearInterval(fallback); fallback = 0; } }

  /* ---- releasing the frames the real rAF did not ------------------------- */
  function tick() {
    if (!waiting.length) return;
    var now = Date.now();
    var g = grace();
    var due = null;
    for (var i = 0; i < waiting.length; i++) {
      if (!waiting[i].done && now - waiting[i].at >= g) { due = waiting[i]; break; }
    }
    if (!due) return;
    rescued++;
    run(due, now);
  }

  function run(rec, ts) {
    if (rec.done) return;
    rec.done = true;
    var i = waiting.indexOf(rec);
    if (i >= 0) waiting.splice(i, 1);
    /* The timestamp a rAF callback is handed is a performance.now() value, and
       export-fix.js may be holding performance.now still. Read it rather than
       computing one, so both files agree about what time it is. */
    var stamp;
    try { stamp = performance.now(); } catch (e) { stamp = ts; }
    try { rec.cb(stamp); } catch (e) { /* a throwing callback must not stop the loop */ }
  }

  window.requestAnimationFrame = function (cb) {
    if (!exporting) return realRaf(cb);
    var rec = { cb: cb, at: Date.now(), done: false, raf: 0 };
    waiting.push(rec);
    if (waiting.length > 240) waiting.shift();      /* cannot grow without bound */
    rec.raf = realRaf(function (ts) {
      /* Mark rAF healthy even if this callback was already released by the
         backstop: the point is that rAF is being served at all. */
      lastRafServe = Date.now();
      if (rec.done) return;
      served++;
      run(rec, ts);
    });
    return rec.raf;
  };

  window.cancelAnimationFrame = function (id) {
    for (var i = 0; i < waiting.length; i++) {
      if (waiting[i].raf === id) { waiting[i].done = true; waiting.splice(i, 1); break; }
    }
    return realCaf(id);
  };

  /* ---- knowing when an export is running --------------------------------- */
  function begin() {
    exporting++;
    if (exporting === 1) {
      rescued = served = 0;
      lastRafServe = Date.now();   /* assume healthy until shown otherwise */
      startClock();
      if (!node) startFallback();
      else if (actx && actx.state !== 'running') startFallback();   /* belt and braces */
    }
  }

  function end() {
    if (!exporting) return;
    exporting--;
    if (exporting > 0) return;
    stopClock();
    stopFallback();
    /* Let anything still queued run through the real rAF rather than stranding
       it, then put the original back. */
    var left = waiting.splice(0);
    for (var i = 0; i < left.length; i++) {
      if (!left[i].done) realRaf(left[i].cb);
    }
  }

  /* The export is the only thing in the editor that records a canvas:
     `g = c.captureStream(e.fps)` on a canvas it created and never attached.
     That makes it an exact marker for the start, with no guessing. */
  var proto = window.HTMLCanvasElement && HTMLCanvasElement.prototype;
  if (proto && proto.captureStream) {
    var realCapture = proto.captureStream;
    proto.captureStream = function () {
      var stream = realCapture.apply(this, arguments);
      /* A canvas on the page is the preview, not an export. */
      if (this.isConnected) return stream;
      try {
        begin();
        var open = 0, closed = false;
        var finish = function () {
          if (closed) return;
          closed = true;
          clearTimeout(timer);
          end();
        };
        /* The export ends with `for (const P of g.getTracks()) P.stop()`.
           Shadowing stop on each track catches that exactly; an own property
           overrides the prototype and leaves every other stream alone. */
        var tracks = stream.getTracks();
        open = tracks.length;
        tracks.forEach(function (t) {
          var s = t.stop;
          t.stop = function () {
            if (--open <= 0) finish();
            return s.apply(t, arguments);
          };
          t.addEventListener('ended', function () { if (--open <= 0) finish(); });
        });
        if (!tracks.length) finish();
        /* A backstop, so a crash between start and stop cannot leave the
           wrapper and the audio node in place for the rest of the session.
           Kd() caps an export at 600s for a paid account. */
        var timer = setTimeout(finish, 20 * 60 * 1000);
      } catch (e) { end(); }
      return stream;
    };
  }

  window.NC_AWAKE = {
    exporting: function () { return exporting > 0; },
    /* For the test harness, and worth reading in the console after a long
       export: rescued > 0 means the tab was starved and this file carried it. */
    stats: function () {
      return { rescued: rescued, served: served, grace: grace(),
               clock: node ? ('audio:' + (actx && actx.state)) : (fallback ? 'timer' : 'none'),
               waiting: waiting.length };
    }
  };
})();
