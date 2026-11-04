/* NOVACLIP — THE TIMELINE FOLLOWS THE PLAYHEAD
 * ===========================================================================
 * Reported as "make the video playing follow timeline not just stand there".
 * It was exactly that: the editor's render loop advances `playhead` every
 * frame and the playhead marker slides right, but nothing ever scrolls the
 * timeline, so after a few seconds of playback the marker is off the side of
 * the screen and you are watching a still picture of bar one.
 *
 * WHY THIS IS A SIDECAR AND NOT A PATCH TO editor.html
 * ---------------------------------------------------------------------------
 * editor.html is a compiled bundle. Its variable names are one and two letters
 * and they are reused in every scope, so there is no honest way to hand-edit
 * the timeline component. Everything here works from the outside: the store on
 * window.__ncStore and the DOM the bundle renders.
 *
 * HOW IT FINDS WHAT IT NEEDS, WITHOUT KNOWING THE BUNDLE'S NAMES
 * ---------------------------------------------------------------------------
 * The one thing taken from the bundle is the scroller's class list — the
 * timeline lane area is the element with `min-w-0 flex-1 overflow-auto`. If a
 * rebuild renames it, findScroller() falls back to "the widest element on the
 * page that can actually scroll sideways", which is the timeline in any
 * layout this editor has had.
 *
 * The playhead marker is found by watching rather than by guessing. On each
 * playhead change every thin, tall, absolutely-placed child of the scroller is
 * measured; the one whose x moves in step with time, in the same direction,
 * over two consecutive changes is the marker. That costs one pass over a
 * handful of elements, once, and it survives any amount of renaming.
 *
 * Once the marker is known this file never computes pixels-per-second at all —
 * it reads the marker's own position. Nothing to drift, nothing to keep in
 * sync with the bundle's zoom maths.
 *
 * NOT FIGHTING THE PERSON EDITING
 * ---------------------------------------------------------------------------
 * The reason auto-scroll is so often hated is that it yanks the view back
 * while you are dragging somewhere else. So: a manual scroll switches
 * following off for QUIET_MS, and the band is generous — the view only moves
 * when the marker leaves the middle stretch of the window, and then it puts
 * the marker a third of the way in rather than centring it, so there is
 * roughly two thirds of a screen of what is coming next.
 */
(function () {
  'use strict';
  if (window.NC_FOLLOW) return;

  var QUIET_MS   = 1400;  /* after a manual scroll, leave the view alone */
  var LEAD       = 0.34;  /* where the marker sits after a scroll, 0..1 */
  var EDGE_LEFT  = 0.08;  /* follow once the marker is outside this band */
  var EDGE_RIGHT = 0.82;

  var scroller = null;
  var marker   = null;
  var quietUntil = 0;
  var samples = [];       /* for working out which element is the marker */

  function store() { return window.__ncStore; }

  function scrollable(el) {
    if (!el || el.nodeType !== 1) return false;
    var ov = getComputedStyle(el).overflowX;
    return (ov === 'auto' || ov === 'scroll') && el.scrollWidth > el.clientWidth + 8;
  }

  function findScroller() {
    var el = document.querySelector('.min-w-0.flex-1.overflow-auto');
    if (scrollable(el)) return el;
    /* Fallback: the widest sideways-scrolling thing on the page. */
    var best = null, bestW = 0, all = document.querySelectorAll('div');
    for (var i = 0; i < all.length; i++) {
      if (!scrollable(all[i])) continue;
      var w = all[i].clientWidth;
      if (w > bestW) { bestW = w; best = all[i]; }
    }
    return best;
  }

  /* Candidates: thin elements that span most of the lane area's height.
     The height test is what matters. The ruler is full of tick marks that are
     also one pixel wide, and on a long timeline there are hundreds of them —
     an earlier version collected those, filled its list before it ever reached
     the marker, and so never found it. Ticks live inside the 32px ruler; the
     marker runs the full height of the lanes, so asking for half the
     scroller's height separates them cleanly and needs no class names. */
  function candidates() {
    if (!scroller) return [];
    /* Fast path: the marker as this build renders it. Checked rather than
       trusted — if a rebuild changes it, the measurement below still works. */
    var quick = scroller.querySelector('.pointer-events-none.absolute.top-0.z-30.h-full');
    if (quick) return [quick];

    var out = [], all = scroller.querySelectorAll('div,span');
    var minH = Math.max(40, scroller.clientHeight * 0.5);
    for (var i = 0; i < all.length && out.length < 40; i++) {
      var el = all[i], r = el.getBoundingClientRect();
      if (r.width > 0 && r.width <= 6 && r.height >= minH) out.push(el);
    }
    return out;
  }

  function xOf(el) { return el.getBoundingClientRect().left + scroller.scrollLeft; }

  /* Two observations of (time, x) per element decide it. An element that does
     not move, or moves the wrong way, or moves when time did not, is not it. */
  function learn(t) {
    var cands = candidates();
    if (!cands.length) return;
    /* The fast path returns the marker itself, so there is nothing to work
       out — taking it straight away saves the two playhead changes the
       measurement needs, which the person would otherwise see as the view
       sitting still for the first second of playback. */
    if (cands.length === 1 && cands[0].className &&
        /pointer-events-none/.test(cands[0].className.toString())) {
      marker = cands[0];
      samples = [];
      return;
    }
    var now = [];
    for (var i = 0; i < cands.length; i++) now.push({ el: cands[i], x: xOf(cands[i]) });

    if (samples.length) {
      var prev = samples[samples.length - 1];
      var dt = t - prev.t;
      if (Math.abs(dt) > 1e-4) {
        for (var j = 0; j < now.length; j++) {
          var was = null;
          for (var k = 0; k < prev.items.length; k++) {
            if (prev.items[k].el === now[j].el) { was = prev.items[k]; break; }
          }
          if (!was) continue;
          var dx = now[j].x - was.x;
          /* Same sign as the time change, and actually moved. */
          if (Math.abs(dx) > 0.5 && (dx > 0) === (dt > 0)) {
            marker = now[j].el;
            samples = [];
            return;
          }
        }
      }
    }
    samples.push({ t: t, items: now });
    if (samples.length > 3) samples.shift();
  }

  function follow() {
    if (!scroller || !marker) return;
    if (Date.now() < quietUntil) return;
    var view = scroller.clientWidth;
    if (view < 80) return;

    /* Where the marker is within the visible strip, 0 at the left edge. */
    var rel = marker.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
    if (rel >= view * EDGE_LEFT && rel <= view * EDGE_RIGHT) return;

    var target = scroller.scrollLeft + rel - view * LEAD;
    var max = scroller.scrollWidth - view;
    if (target < 0) target = 0;
    if (target > max) target = max;
    if (Math.abs(target - scroller.scrollLeft) < 2) return;

    /* Always an instant assignment, never scrollTo({behavior:'smooth'}).
       A smooth scroll is an animation, and issuing a new one re-starts it from
       wherever it has got to. Because follow() runs every frame while the view
       is catching up, a smooth call was cancelled and re-issued sixty times a
       second and so never arrived: a jump to 120s left the marker seven
       thousand pixels off screen, and every jump "crept" a fraction of the way.
       Instant is also what the eye wants here. During playback the marker is
       itself moving smoothly, so a per-frame assignment reads as a smooth
       pan; for a jump, landing immediately is what CapCut does too. */
    scroller.scrollLeft = target;
  }

  var lastT = null, raf = 0, settle = 0;
  var SETTLE_FRAMES = 15;   /* ~250ms at 60fps */

  function pump() {
    if (raf) return;
    raf = requestAnimationFrame(function step() {
      raf = 0;
      follow();
      var playing = false;
      try { playing = !!store().getState().isPlaying; } catch (e) {}
      if (settle > 0) settle--;
      if (settle > 0 || playing) { raf = requestAnimationFrame(step); }
    });
  }

  function onPlayhead(t) {
    if (t === lastT) return;
    if (!scroller || !scroller.isConnected) scroller = findScroller();
    if (!scroller) return;
    if (!marker || !marker.isConnected) { marker = null; learn(t); }
    lastT = t;
    /* KEEP LOOKING FOR A FEW FRAMES RATHER THAN GUESSING WHEN REACT COMMITS.
       The store fires before React has re-rendered, so a single measurement
       reads the marker's OLD position and the view only creeps part of the
       way there — a 120-second jump left the marker seven thousand pixels off
       screen, and a jump back to zero stopped a thousand pixels short.
       Waiting a fixed two frames was no better: React 18 schedules its commit
       and does not promise any particular frame.
       So this does not try to be clever about timing. It re-runs follow() for
       a handful of frames and lets it converge: once the marker is inside the
       comfortable band, follow() returns immediately and the loop costs a
       rectangle read per frame for a quarter of a second. During playback the
       loop is continuous anyway, which is what following means. */
    settle = SETTLE_FRAMES;
    pump();
  }

  function attach() {
    var s = store();
    if (!s || !s.subscribe) return false;

    s.subscribe(function (st) {
      if (!st) return;
      if (typeof st.playhead === 'number') onPlayhead(st.playhead);
    });

    /* A wheel or a drag on the bar means the person wants to look somewhere;
       stop steering for a moment. Scroll events the code itself causes are not
       counted, which is why this listens for input rather than for scroll. */
    document.addEventListener('wheel', function (e) {
      if (scroller && scroller.contains(e.target)) quietUntil = Date.now() + QUIET_MS;
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (scroller && scroller.contains(e.target)) quietUntil = Date.now() + QUIET_MS;
    }, { passive: true });
    /* Pressing play is a request to watch, so it clears any quiet period. */
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space') quietUntil = 0;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') quietUntil = 0;
    });

    return true;
  }

  var tries = 0;
  (function wait() {
    if (attach()) return;
    if (++tries > 120) return;          /* ~30s, then give up quietly */
    setTimeout(wait, 250);
  })();

  window.NC_FOLLOW = {
    /* For the test harness and for anyone debugging a layout change. */
    state: function () {
      return {
        scroller: !!scroller,
        marker: !!marker,
        scrollLeft: scroller ? scroller.scrollLeft : null,
        view: scroller ? scroller.clientWidth : null,
        quiet: Math.max(0, quietUntil - Date.now())
      };
    },
    rescan: function () { scroller = findScroller(); marker = null; samples = []; }
  };
})();
