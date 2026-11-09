/* NOVACLIP — A CUT DOES NOT LEAVE A HOLE
 * ===========================================================================
 * Asked for: "when someone cuts a video it goes automatically to the start if
 * no video is behind it, if there is make it automatically stick to it, and
 * make the video line follower go where it was too".
 *
 * Reproduced before changing anything, on a 20s clip:
 *
 *   split at 8s      ->  0..8 and 8..20          (correct, nothing moves)
 *   delete the 0..8  ->  8..20, and a hole at the front
 *
 * The remaining clip sat at 8 seconds with eight seconds of black in front of
 * it, and the only way to fix that was to drag it back by hand and hope it
 * landed on zero. Every cut made more work.
 *
 * WHAT IT DOES NOW
 * ---------------------------------------------------------------------------
 * After a cut or a delete, the track that changed is closed up: the first
 * clip starts at zero, and every clip after it starts where the one before it
 * ends. That is both halves of what was asked — "goes to the start if no
 * video is behind it" and "sticks to it" if something is.
 *
 * ONLY THE TRACK THAT CHANGED. Closing every track would pull an audio track
 * forward because a video clip was deleted, and silently lose sync on a cut
 * that had nothing to do with it. A cut is an edit to one lane.
 *
 * THE PLAYHEAD MOVES WITH THE PICTURE
 * ---------------------------------------------------------------------------
 * This is the "line follower" half, and it is the part that would be missed
 * if it were left out. If a clip slides four seconds to the left and the
 * playhead stays where it is, the preview jumps to a different frame — so the
 * edit looks like it did something to the footage rather than to the layout.
 *
 * So the playhead is moved by the same amount as whatever was under it. If it
 * was sitting inside the clip that was just deleted, there is nothing to
 * follow, and it goes to the start of the clip that took its place — which is
 * the frame now showing in the preview, so what you see does not change.
 *
 * HOW IT HOOKS IN
 * ---------------------------------------------------------------------------
 * The store's actions live in its state, so splitClip and deleteClip are
 * replaced with wrappers through setState — the same mechanism the bundle
 * uses itself. React reads them from the store on each render, so the
 * wrappers are picked up without touching a single component. The originals
 * are called first and their result is left alone; this only tidies up after.
 *
 * A clip dragged somewhere on purpose is NOT touched, because nothing here
 * runs on a drag. Only a cut or a delete closes a track up, which is the rule
 * CapCut uses and the one that was asked for.
 */
(function () {
  'use strict';
  if (window.NC_TIDY) return;

  var EPS = 1e-4;          /* seconds; below this two edges are the same edge */
  var wrapped = false;

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }

  function q(t) { return Math.round(t * 1000) / 1000; }

  /* Close every gap on one track. Returns the moves it made, so the playhead
     can be moved by the same amount, or null if there was nothing to do. */
  function closeTrack(trackId) {
    var st = state();
    if (!st || !st.clips || !trackId) return null;

    var on = [];
    for (var i = 0; i < st.clips.length; i++) {
      if (st.clips[i].trackId === trackId) on.push(st.clips[i]);
    }
    if (!on.length) return null;
    on.sort(function (a, b) { return (a.start || 0) - (b.start || 0); });

    var at = 0, moves = [];
    for (var j = 0; j < on.length; j++) {
      var c = on[j], from = c.start || 0;
      if (Math.abs(from - at) > EPS) {
        moves.push({ id: c.id, from: from, to: q(at), dur: c.duration || 0 });
      }
      at += (c.duration || 0);
    }
    if (!moves.length) return null;

    var byId = {};
    for (var k = 0; k < moves.length; k++) byId[moves[k].id] = moves[k].to;

    /* setState rather than moveClip: moveClip calls pushHistory, and the
       action this is tidying up after has already pushed one. Going through
       it would make a single cut take two presses of Undo to put back. */
    var next = st.clips.map(function (c) {
      return byId[c.id] === undefined ? c : Object.assign({}, c, { start: byId[c.id] });
    });
    try { store().setState({ clips: next }); } catch (e) { return null; }
    return moves;
  }

  /* Where the playhead should go, given what moved. `gone` is the range the
     deleted clip occupied, when there was one. */
  function followPlayhead(moves, gone) {
    var st = state();
    if (!st || !moves || !moves.length) return;
    var t = st.playhead || 0, target = null;

    /* Was the playhead inside something that moved? Follow it exactly. */
    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      if (t >= m.from - EPS && t <= m.from + m.dur + EPS) {
        target = t - (m.from - m.to);
        break;
      }
    }

    /* Inside the clip that was just deleted, or in the hole it left: there is
       nothing to follow, so land on the start of whatever has taken that
       place. That is the frame the preview is showing anyway, so the picture
       does not jump. */
    if (target === null && gone && t >= gone.start - EPS && t <= gone.end + EPS) {
      /* Whatever slid into the hole now begins where the hole began, so that
         is where the playhead belongs: the preview keeps showing a frame,
         and it is the frame that is actually there now. */
      target = gone.start;
    }

    if (target === null) return;
    if (target < 0) target = 0;
    if (Math.abs(target - t) < EPS) return;
    try { if (st.setPlayhead) st.setPlayhead(q(target)); } catch (e) {}
  }

  function tidy(trackId, gone) {
    var moves = closeTrack(trackId);
    if (moves) followPlayhead(moves, gone);
    return moves;
  }

  function wrap() {
    if (wrapped) return true;
    var s = store();
    if (!s || !s.getState || !s.setState) return false;
    var st = s.getState();
    if (!st || typeof st.deleteClip !== 'function') return false;

    var origDelete = st.deleteClip;
    var origSplit = typeof st.splitClip === 'function' ? st.splitClip : null;
    var origRipple = typeof st.rippleDelete === 'function' ? st.rippleDelete : null;

    var patch = {};

    patch.deleteClip = function (id) {
      /* Read the clip BEFORE it is gone — its track is the one to close, and
         its range is what tells the playhead where it used to be. */
      var before = state(), clip = null;
      if (before) for (var i = 0; i < before.clips.length; i++) {
        if (before.clips[i].id === id) clip = before.clips[i];
      }
      var track = clip ? clip.trackId : null;
      var gone = clip ? { start: clip.start || 0, end: (clip.start || 0) + (clip.duration || 0) } : null;
      var out = origDelete.apply(this, arguments);
      if (track) tidy(track, gone);
      return out;
    };

    if (origRipple) {
      patch.rippleDelete = function (id) {
        var before = state(), clip = null;
        if (before) for (var i = 0; i < before.clips.length; i++) {
          if (before.clips[i].id === id) clip = before.clips[i];
        }
        var track = clip ? clip.trackId : null;
        var gone = clip ? { start: clip.start || 0, end: (clip.start || 0) + (clip.duration || 0) } : null;
        var out = origRipple.apply(this, arguments);
        /* rippleDelete already pulls the rest of the track back by the
           deleted clip's length. That leaves any gap that was there before
           exactly where it was, so this still has something to do — and if it
           does not, closeTrack returns null and nothing happens. */
        if (track) tidy(track, gone);
        return out;
      };
    }

    if (origSplit) {
      patch.splitClip = function (id, at) {
        var before = state(), clip = null;
        if (before) for (var i = 0; i < before.clips.length; i++) {
          if (before.clips[i].id === id) clip = before.clips[i];
        }
        var track = clip ? clip.trackId : null;
        var out = origSplit.apply(this, arguments);
        /* A split makes no hole of its own. This is here for the half of the
           request about a clip that was already adrift: cut it, and the track
           it is on closes up to the front. */
        if (track) tidy(track, null);
        return out;
      };
    }

    s.setState(patch);
    wrapped = true;
    return true;
  }

  var tries = 0;
  (function wait() {
    if (wrap()) return;
    if (++tries > 160) return;        /* ~40s, then give up quietly */
    setTimeout(wait, 250);
  })();

  window.NC_TIDY = {
    wrapped: function () { return wrapped; },
    /* For a test, and for anyone who wants to close a track by hand. */
    close: function (trackId) { return tidy(trackId, null); },
    closeAll: function () {
      var st = state(), out = [];
      if (!st) return out;
      for (var i = 0; i < st.tracks.length; i++) {
        var m = tidy(st.tracks[i].id, null);
        if (m) out.push({ track: st.tracks[i].id, moves: m });
      }
      return out;
    }
  };
})();
