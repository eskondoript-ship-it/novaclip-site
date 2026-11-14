/* NOVACLIP — THE BOTTOM OF THE TIMELINE IS REACHABLE
 * ===========================================================================
 * Reported as "when i click on effects a part of the timeline aint visible",
 * with a screenshot showing the T1 lane cut off along the bottom edge.
 *
 * WHAT IT ACTUALLY IS, WHICH IS NOT WHAT IT LOOKED LIKE
 * ---------------------------------------------------------------------------
 * Measured at the reporter's own viewport, 1917x997, with a clip selected:
 *
 *   V1 ends at 843    V2 at 915    A1 at 979    T1 at 1051
 *
 * T1 finishes 54px below a 997px window. It does that on EVERY inspector tab
 * — Transform, Color, Effects and Audio all measured identically — so the
 * Effects tab is when it was noticed rather than what caused it. Worth saying
 * plainly, because "fix the Effects tab" would have fixed nothing.
 *
 * The timeline is two columns side by side:
 *
 *   .w-44.shrink-0.overflow-y-auto      the track labels  V1 V2 A1 T1
 *   .relative.min-w-0.flex-1.overflow-auto   the lanes the clips sit on
 *
 * Both are 254px tall. The labels hold 312px of content and the lanes hold
 * 372px, so both scroll — and they scroll SEPARATELY. Nothing synchronises
 * them. Scroll the lanes to reach the bottom track and the labels stay put,
 * so the clips you dragged into view are now printed beside the wrong track
 * names; scroll the labels instead and the lanes do not follow at all. On a
 * short window the bottom track can be scrolled to in one column and not the
 * other, which is the state the screenshot caught.
 *
 * WHAT THIS DOES
 * ---------------------------------------------------------------------------
 * Mirrors scrollTop between the two columns, in both directions, with a
 * re-entry guard so one does not drive the other round in circles. That is
 * all. It does not resize anything, does not change how tall the timeline is,
 * and does not touch the horizontal scroll — the lanes scroll sideways
 * through the whole project and the labels must not move when they do.
 *
 * WHY NOT JUST MAKE THE TIMELINE TALLER
 * ---------------------------------------------------------------------------
 * Because the number of tracks is not bounded. Four fit today; the reporter's
 * own screenshot shows twenty-two. Any fixed height is the wrong height for
 * somebody, and a timeline that grows takes the room from the preview, which
 * is the part you are actually looking at. Scrolling that works is the fix
 * that holds at four tracks and at forty.
 *
 * REBINDING
 * ---------------------------------------------------------------------------
 * React replaces these nodes on re-render — adding a track, switching layout,
 * opening a panel. Listeners are attached to whatever pair is on screen now
 * and re-attached when that changes, tracked by a flag on the element so the
 * same node is never bound twice.
 */
(function () {
  'use strict';
  if (window.NC_TL_FIT) return;

  var LABELS = '.w-44.shrink-0.overflow-y-auto';
  var MARK = '__ncTlSynced';
  var lock = false;          /* set while mirroring, so the echo is ignored */
  var pairs = 0;

  function lanesOf(labels) {
    /* The lanes are the labels' next scrollable sibling. Found by position in
       the row rather than by class: these are Tailwind utility strings, and
       "min-w-0 flex-1 overflow-auto" is a layout decision that a rebuild can
       reword without meaning anything by it. */
    var row = labels.parentElement;
    if (!row) return null;
    var kids = row.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k === labels) continue;
      if (k.scrollHeight > k.clientHeight + 2 ||
          /auto|scroll/.test(getComputedStyle(k).overflowY)) return k;
    }
    return null;
  }

  function mirror(from, to) {
    return function () {
      if (lock) return;
      lock = true;
      /* The two columns can have different scrollable heights — the lanes
         carry a horizontal scrollbar the labels do not — so copying the raw
         scrollTop would drift at the bottom. Copy the POSITION instead, as a
         fraction of what each can travel, and clamp it. */
      var fromMax = from.scrollHeight - from.clientHeight;
      var toMax = to.scrollHeight - to.clientHeight;
      if (toMax > 0) {
        var want = fromMax > 0 ? (from.scrollTop / fromMax) * toMax : 0;
        var next = Math.max(0, Math.min(toMax, Math.round(want)));
        if (Math.abs(to.scrollTop - next) > 1) to.scrollTop = next;
      }
      /* Released on the next frame, not immediately: the assignment above
         queues a scroll event that has not fired yet, and clearing the guard
         synchronously would let that echo straight back through here. */
      requestAnimationFrame(function () { lock = false; });
    };
  }

  function bind() {
    var labels = document.querySelectorAll(LABELS);
    for (var i = 0; i < labels.length; i++) {
      var a = labels[i];
      if (a[MARK]) continue;
      var b = lanesOf(a);
      if (!b) continue;
      a[MARK] = true;
      b[MARK] = true;
      a.addEventListener('scroll', mirror(a, b), { passive: true });
      b.addEventListener('scroll', mirror(b, a), { passive: true });
      pairs++;
    }
  }

  function start() {
    bind();
    /* Cheap, and only when the editor's own DOM changes. Attribute changes are
       ignored: React toggles class names on these containers constantly and
       none of that can create or destroy the pair. */
    try {
      new MutationObserver(function () { bind(); })
        .observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    window.addEventListener('resize', bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_TL_FIT = {
    bind: bind,
    pairs: function () { return pairs; },
    /* For a test: how far each column can still travel. */
    state: function () {
      var a = document.querySelector(LABELS);
      if (!a) return null;
      var b = lanesOf(a);
      return {
        labels: { top: a.scrollTop, max: a.scrollHeight - a.clientHeight },
        lanes: b ? { top: b.scrollTop, max: b.scrollHeight - b.clientHeight } : null
      };
    }
  };
})();
