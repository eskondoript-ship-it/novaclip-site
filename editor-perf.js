/* NOVACLIP — THE EDITOR SHOULD NOT BURN A CORE DOING NOTHING
 * ===========================================================================
 * Reported as the editor lagging once several clips are on the timeline, on a
 * Core Ultra 5 laptop in Chrome — a machine that has no business struggling
 * with four 4MB clips. Measured in Chromium with the CPU throttled 6x to
 * stand in for a laptop with less headroom than a server, four clips loaded:
 *
 *     devicePixelRatio 2 (native)   preview canvas 1590x894   idle 12 fps
 *     devicePixelRatio 1 (capped)   preview canvas  795x447   idle 22 fps
 *
 * Twelve frames a second while SITTING STILL. Nothing is playing, nothing is
 * being dragged, and the editor is still working flat out.
 *
 * WHY
 *
 * The preview's render loop is unconditional:
 *
 *     const y = () => { Wd(h, d.width, d.height, ...); requestAnimationFrame(y) };
 *
 * It redraws the whole composite every animation frame forever, whether or
 * not anything changed. And the canvas is sized at `w * devicePixelRatio`, so
 * on the high-DPI screen these laptops ship with it is drawing four times the
 * pixels it shows.
 *
 * Both of those live inside the compiled bundle, so neither line can be
 * edited. This gets at them from outside instead.
 *
 * ONE: CAP THE PIXEL RATIO
 *
 * The preview is a few hundred CSS pixels wide. Rendering it at 2x gains
 * very little on a video preview — the source is being scaled down to fit
 * anyway — and costs four times the fill. Capping the ratio the bundle reads
 * is enough; its own ResizeObserver does the rest.
 *
 * TWO: STOP REDRAWING WHEN NOTHING IS HAPPENING
 *
 * requestAnimationFrame is wrapped so that, when the editor is genuinely
 * idle, callbacks run at IDLE_FPS instead of sixty. Idle means: not playing,
 * and no pointer, key, wheel or focus event for QUIET_MS. Any of those
 * restores full speed on the very next frame, so dragging and scrubbing are
 * never throttled — the only thing slowed down is a still picture being
 * painted over and over.
 *
 * This is deliberately conservative. It would be easy to skip the redraw
 * entirely when the playhead and clips have not changed, and that would be
 * better — but from out here there is no safe way to know what the bundle
 * considers dirty, and a preview that fails to update after an edit is far
 * worse than one that costs too much.
 */
(function () {
  'use strict';
  if (window.NC_PERF) return;

  var DPR_CAP  = 1.5;    /* still sharper than CSS pixels, a quarter less fill than 2 */
  var IDLE_FPS = 20;
  var QUIET_MS = 400;

  /* ---- 1. the pixel ratio the bundle sizes its canvas from ---------------- */
  var realDpr = window.devicePixelRatio || 1;
  if (realDpr > DPR_CAP) {
    try {
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        get: function () { return DPR_CAP; }
      });
    } catch (e) { /* if it cannot be redefined, the throttle below still helps */ }
  }

  /* ---- 2. the idle redraw ------------------------------------------------- */
  var lastInput = 0;
  function poke() { lastInput = Date.now(); }
  ['pointerdown', 'pointermove', 'pointerup', 'keydown', 'wheel', 'focus', 'input', 'change']
    .forEach(function (ev) {
      window.addEventListener(ev, poke, { passive: true, capture: true });
    });

  function playing() {
    try {
      var s = window.__ncStore && window.__ncStore.getState();
      return !!(s && s.isPlaying);
    } catch (e) { return true; }     /* unknown: assume busy, never throttle blindly */
  }

  function idle() {
    /* NEVER while exporting. The export loop in the bundle is driven by
       requestAnimationFrame and timed by the wall clock, so slowing its frames
       down does not slow the clock down with them — it drops frames out of the
       recorded file. export-awake.js exists because that loop starving is the
       bug; this file must not be a second cause of it. Also note document.hidden
       is true for the whole of a backgrounded export, which is exactly when the
       test below would otherwise say "idle, throttle it". */
    try { if (window.NC_AWAKE && window.NC_AWAKE.exporting()) return false; }
    catch (e) { return false; }
    if (playing()) return false;
    if (Date.now() - lastInput < QUIET_MS) return false;
    if (document.hidden) return true;
    return true;
  }

  var raf = window.requestAnimationFrame.bind(window);
  var caf = window.cancelAnimationFrame.bind(window);
  var pending = new Map();          /* our id -> {real id or timer} */
  var nextId = 1;
  var lastRun = 0;

  window.requestAnimationFrame = function (cb) {
    var id = nextId++;
    var gap = 1000 / IDLE_FPS;
    var since = Date.now() - lastRun;
    if (idle() && since < gap) {
      /* Hold this frame back rather than running it, and let it through when
         the idle budget comes round. A timer, not a frame, so the browser is
         free to do nothing at all in between. */
      var t = setTimeout(function () {
        pending.delete(id);
        lastRun = Date.now();
        var r = raf(cb);
        pending.set(id, { raf: r });
      }, Math.max(0, gap - since));
      pending.set(id, { timer: t });
      return id;
    }
    lastRun = Date.now();
    var r = raf(function (ts) { pending.delete(id); cb(ts); });
    pending.set(id, { raf: r });
    return id;
  };

  window.cancelAnimationFrame = function (id) {
    var rec = pending.get(id);
    if (!rec) return caf(id);          /* an id from before this file loaded */
    pending.delete(id);
    if (rec.timer) clearTimeout(rec.timer);
    if (rec.raf != null) caf(rec.raf);
  };

  window.NC_PERF = {
    dprCap: DPR_CAP,
    realDpr: realDpr,
    idleFps: IDLE_FPS,
    isIdle: idle,
    held: function () { return pending.size; }
  };
})();
