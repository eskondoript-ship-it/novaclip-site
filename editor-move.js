/* ============================================================================
   DRAGGING A CLIP ON THE PREVIEW
   ============================================================================
   The editor could always move a clip — by typing into Position X and Position
   Y in the Transform panel, two number boxes in a side rail, in units nobody
   thinks in. Wanting the picture two centimetres left meant guessing at a
   decimal, reading the result, and guessing again. This makes the preview
   itself the control: grab the frame and move it.

   IT IS A SEPARATE FILE ON PURPOSE.

   editor.html is a 397 kB compiled bundle. Adding one line to it means
   re-pasting the whole thing, which is exactly how the Animate and Remove
   buttons went missing once already — the tools were on the server with
   nothing loading them. nova.js loads animator.js and motionlabs.js for the
   same reason, and this rides along with them. Nothing here edits the bundle;
   it drives the editor's own store, so the number boxes, the keyframes and the
   undo stack all stay in step with what the mouse did.

   THE UNITS, WHICH ARE THE WHOLE TRICK

   The compositor does this, where n and r are the canvas's own width and
   height:

       const g = n/2 + v*(n/2)      // v is transform.positionX
       const w = r/2 + k*(r/2)      // k is transform.positionY
       ctx.translate(g, w)

   So position is NOT pixels. It is a fraction of half the frame: 0 is dead
   centre, -1 is the left edge, +1 is the right edge. Two consequences, both
   useful:

     The intrinsic canvas size cancels out. A 9:16 project is 1080x1920
     internally but displayed at whatever fits the panel, and because the
     units are normalised only the DISPLAYED rectangle matters. Moving the
     mouse d pixels across a box w wide is a change of 2d/w, at every project
     resolution and every window size, with nothing to keep in sync.

     translate() happens before rotate(), so position is in screen space. Drag
     right on a clip rotated 30 degrees and it still goes right, rather than
     sliding off at an angle — which is what a hand expects and what rotating
     the delta would have got wrong.

   ONE DRAG IS ONE UNDO

   History in this editor is pushed by hand with pushHistory(), not recorded
   automatically on every change. A drag emits a state change per frame, so
   pushing per change would bury the previous edit under sixty entries of
   moving one picture. It is pushed once, on the way down, capturing where the
   clip was before the drag started.
   ============================================================================ */
(function () {
  'use strict';

  if (window.__ncMoveReady) return;         // a second load must not double-bind
  window.__ncMoveReady = true;

  var SNAP = 0.02;        // within this of an edge or the middle, sit on it
  var NUDGE = 0.01;       // one arrow press
  var NUDGE_BIG = 0.12;   // with shift held
  var LIMIT = 3;          // far enough to push a clip well out of shot, near
                          // enough that it can always be dragged back

  /* Drawn last is on top, and the order is the compositor's own so that what
     you grab is what you can see. text:3 sits above everything, audio:0 has no
     picture at all and is excluded rather than ranked. */
  var DRAW_ORDER = { text: 3, effect: 2, video: 1, audio: 0 };

  var store = null;
  var drag = null;        // { id, startX, startY, fromX, fromY, axis }
  var guide = null;

  function S() {
    if (!store) store = window.__ncStore || null;
    return store;
  }

  /* The preview is the biggest canvas actually on screen. Matching on the
     bundle's Tailwind class list would work today and break the day the
     bundle is rebuilt; size is a property of what the thing IS. */
  function previewCanvas() {
    var best = null, bestArea = 0;
    var all = document.querySelectorAll('canvas');
    for (var i = 0; i < all.length; i++) {
      var r = all[i].getBoundingClientRect();
      var area = r.width * r.height;
      if (r.width < 80 || r.height < 80) continue;
      if (area > bestArea) { bestArea = area; best = all[i]; }
    }
    return best;
  }

  /* Which clip a drag should move: the selected one if it is actually on
     screen right now, otherwise whatever is on top at the playhead — which is
     then also selected, so the Transform panel follows the hand rather than
     showing a different clip's numbers. */
  function target(st) {
    var t = st.playhead;
    var live = (st.clips || []).filter(function (c) {
      return c && !c.hidden && c.kind !== 'audio' &&
             t >= c.start && t < c.start + c.duration;
    });
    if (!live.length) return null;
    var sel = live.filter(function (c) { return c.id === st.selectedClipId; })[0];
    if (sel) return sel;
    live.sort(function (a, b) {
      return (DRAW_ORDER[a.kind] || 0) - (DRAW_ORDER[b.kind] || 0);
    });
    return live[live.length - 1];
  }

  function clamp(v) { return Math.max(-LIMIT, Math.min(LIMIT, v)); }

  /* Centre and the four edges, because those are the placements anyone
     actually wants to be exact — a title on the middle line, a logo flush to
     a corner. Alt turns it off for the times when close is the point. */
  function snap(v, off) {
    if (off) return v;
    var stops = [-1, -0.5, 0, 0.5, 1];
    for (var i = 0; i < stops.length; i++)
      if (Math.abs(v - stops[i]) < SNAP) return stops[i];
    return v;
  }

  /* A hairline where the clip has snapped, over the canvas rather than on it:
     the canvas belongs to React and is repainted every frame, so anything
     drawn into it here would be wiped or would fight the compositor. */
  function showGuide(cv, x, y) {
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'ncmove-guide';
      guide.style.cssText = 'position:fixed;z-index:9998;pointer-events:none;inset:0;';
      guide.innerHTML = '<i data-v></i><i data-h></i>';
      var st = document.createElement('style');
      st.textContent = '#ncmove-guide i{position:absolute;background:#00E5FF;' +
        'box-shadow:0 0 8px rgba(0,229,255,.7);display:none}' +
        '#ncmove-guide i[data-v]{width:1px}#ncmove-guide i[data-h]{height:1px}';
      document.head.appendChild(st);
      document.body.appendChild(guide);
    }
    var r = cv.getBoundingClientRect();
    var v = guide.querySelector('[data-v]'), h = guide.querySelector('[data-h]');
    if (x == null) v.style.display = 'none';
    else {
      v.style.display = 'block';
      v.style.left = (r.left + r.width / 2 + x * (r.width / 2)) + 'px';
      v.style.top = r.top + 'px'; v.style.height = r.height + 'px';
    }
    if (y == null) h.style.display = 'none';
    else {
      h.style.display = 'block';
      h.style.top = (r.top + r.height / 2 + y * (r.height / 2)) + 'px';
      h.style.left = r.left + 'px'; h.style.width = r.width + 'px';
    }
  }
  function hideGuide() { if (guide) showGuide(previewCanvas() || document.body, null, null); }

  function onDown(e) {
    var s = S(); if (!s || e.button > 0) return;
    var cv = previewCanvas();
    if (!cv || e.target !== cv) return;

    var st = s.getState();
    var clip = target(st);
    if (!clip) return;

    /* Once, before anything moves, so the whole gesture is a single step back
       rather than sixty. */
    if (typeof st.pushHistory === 'function') st.pushHistory();
    if (clip.id !== st.selectedClipId && typeof st.selectClip === 'function') st.selectClip(clip.id);

    drag = {
      id: clip.id,
      startX: e.clientX, startY: e.clientY,
      fromX: (clip.transform && clip.transform.positionX) || 0,
      fromY: (clip.transform && clip.transform.positionY) || 0,
      axis: null, moved: false
    };
    cv.style.cursor = 'grabbing';
    /* Stops the drag from selecting the panel's labels, and on a touchscreen
       stops the page scrolling under the finger. */
    if (e.cancelable) e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onMove(e) {
    var cv = previewCanvas();
    if (!drag) {
      /* Nothing held: just say the frame is grabbable when there is something
         in it to grab. */
      if (cv) {
        var s0 = S();
        cv.style.cursor = (s0 && target(s0.getState())) ? 'grab' : '';
        cv.style.touchAction = 'none';
      }
      return;
    }
    var s = S(); if (!s || !cv) return;
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;

    var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;

    /* Shift locks to whichever way the hand committed first, decided once so
       the lock does not flip about mid-drag. */
    if (e.shiftKey) {
      if (!drag.axis) drag.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (drag.axis === 'x') dy = 0; else dx = 0;
    } else drag.axis = null;

    var nx = clamp(drag.fromX + 2 * dx / r.width);
    var ny = clamp(drag.fromY + 2 * dy / r.height);
    var sx = snap(nx, e.altKey), sy = snap(ny, e.altKey);

    s.getState().updateClipTransform(drag.id, { positionX: sx, positionY: sy });
    showGuide(cv, sx !== nx ? sx : null, sy !== ny ? sy : null);
    if (e.cancelable) e.preventDefault();
  }

  function onUp() {
    if (!drag) return;
    drag = null;
    hideGuide();
    var cv = previewCanvas();
    if (cv) cv.style.cursor = 'grab';
  }

  /* Arrows for the last few pixels, which is the one thing a mouse is bad at.
     Ignored while typing, or a title's caption would move instead of edit. */
  function onKey(e) {
    if (!/^Arrow/.test(e.key)) return;
    var el = document.activeElement;
    if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
    var s = S(); if (!s) return;
    var st = s.getState();
    var clip = (st.clips || []).filter(function (c) { return c.id === st.selectedClipId; })[0];
    if (!clip || clip.kind === 'audio') return;

    var step = e.shiftKey ? NUDGE_BIG : NUDGE;
    var t = clip.transform || {};
    var x = t.positionX || 0, y = t.positionY || 0;
    if (e.key === 'ArrowLeft') x -= step;
    else if (e.key === 'ArrowRight') x += step;
    else if (e.key === 'ArrowUp') y -= step;
    else y += step;

    if (typeof st.pushHistory === 'function') st.pushHistory();
    st.updateClipTransform(clip.id, { positionX: clamp(x), positionY: clamp(y) });
    e.preventDefault();
  }

  addEventListener('pointerdown', onDown, true);
  addEventListener('pointermove', onMove, true);
  addEventListener('pointerup', onUp, true);
  addEventListener('pointercancel', onUp, true);
  /* Released over another window, or over devtools: without this the clip
     stays stuck to the cursor. */
  addEventListener('blur', onUp);
  addEventListener('keydown', onKey);

  window.NCMove = {
    canvas: previewCanvas,
    target: function () { var s = S(); return s ? target(s.getState()) : null; },
    dragging: function () { return !!drag; }
  };
})();
