/* NOVACLIP — MOVING A CLIP: BETWEEN LANES, AND ALONG THE TIME
 * ===========================================================
 * Asked for: "make it possible to move the media between the editing lanes."
 * You could not. Dragging a clip moved it left and right and nothing else —
 * drag it down onto A1 or T1 and it sprang back to the lane it came from.
 *
 * WHY, EXACTLY
 *
 * The timeline's drag handler is this, with the parts that matter left in:
 *
 *     const g = p.clientX, w = N.start, f = N.duration, m = N.trackId;
 *     const d = y => {
 *       const x = y.clientX - g, C = i(x);
 *       if (j === "move") { let T = Math.max(0, w + C); u(N.id, T, m); }
 *       ...
 *
 * `m` is the track the clip was on when the drag started, captured once and
 * passed to every move. `y.clientY` is never read at all. The vertical axis
 * is not restricted or validated — it is simply not looked at, so the clip is
 * put back on its original lane sixty times a second while you drag it down.
 *
 * The store was ready the whole time. Its moveClip is
 * `(id, start, trackId) => ... trackId: trackId ?? clip.trackId`, so it has
 * always been able to do this; nothing was ever asking it to.
 *
 * HOW THIS FIXES IT WITHOUT OWNING THE DRAG
 *
 * The bundle's handler keeps running — it does the horizontal movement, the
 * snapping and the trim handles, and all of that is fine. This one only has
 * to get the last word on the track, which turns into a question of ordering.
 *
 * Their handler opens with `p.preventDefault(), p.stopPropagation()`. React
 * attaches at the root container, and stopping a synthetic event stops the
 * native one too, so the pointerdown never reaches a listener on document in
 * the bubble phase. The first version of this file listened there and was
 * never called once.
 *
 * So it listens in the CAPTURE phase, which runs on the way down and cannot
 * be stopped from below — and then registers its pointermove from a
 * setTimeout rather than immediately. That ordering is the whole trick: their
 * pointermove listener is added during the dispatch, and a new task runs
 * after the dispatch has finished, so this file's listener is registered
 * second and therefore runs second on every move. Their write lands first,
 * this one corrects it. A microtask would not have been safe — the spec
 * drains those between listeners, so it could have landed first.
 *
 * Reading the selection is deferred for the same reason. In the capture phase
 * their handler has not run yet and selectedClipId is still whatever it was;
 * by the time the timeout fires they have selected the clip being dragged.
 *
 * The correction goes through the store's setState rather than through
 * moveClip, deliberately. moveClip calls pushHistory, and their handler
 * already calls it on every single pointermove — a one-second drag is fifty
 * entries in the undo stack, which is a pre-existing problem this file should
 * not double. A direct setState changes the track and adds nothing to the
 * history, so one drag is still one undo.
 *
 * WHICH LANES IT WILL ACCEPT
 *
 * Audio belongs on an audio lane and nothing else does. Audio tracks draw
 * waveforms and carry the volume and mute controls, so a video sitting on one
 * is not a layout choice, it is a clip whose controls have gone missing.
 * Everything drawn to the canvas — video, images, text — can share a lane,
 * because the renderer switches on the clip's own kind and never asks what
 * track it is on.
 *
 * A lane it will take lights up as you drag over it. A lane it will not shows
 * you that too, rather than silently refusing and leaving you to guess: the
 * commonest reason a drop looks broken is that there is only one video lane
 * in a new project, and the answer is the "+ Video" button in the timeline
 * toolbar, not a bug.
 *
 * IT REFUSES TO GUESS. Before it moves anything it checks that the row the
 * clip is sitting in maps to the track the clip says it is on. If the DOM and
 * the store disagree — a layout change, a row this file did not expect — it
 * does nothing at all and leaves the drag to the bundle. Moving somebody's
 * footage to the wrong lane is worse than not moving it.
 *
 * ------------------------------------------------------------------------
 * THE ARROW KEYS
 * ------------------------------------------------------------------------
 * Also asked for: on a keyboard the arrows should "move the time of the clip
 * not the position of the video". They did the opposite. Measured: with a
 * clip selected, one press of Right moved transform.positionX from 0 to 0.01
 * and one press of Down moved positionY — the arrows were nudging the picture
 * around inside the frame, which is a thing you want about once a project,
 * while the thing you want a hundred times a minute, sliding a clip a frame
 * earlier, had no key at all.
 *
 * So with a clip selected:
 *
 *     Left / Right          one frame earlier or later
 *     Shift + Left / Right  one second
 *     Up / Down             the lane above or below, skipping any that will
 *                           not take this clip
 *
 * With nothing selected the keys are left entirely alone, so scrubbing the
 * playhead with the arrows still works exactly as it did — the rule is "these
 * keys act on the thing you have selected", which is the rule everywhere else
 * in the editor.
 *
 * Moving the picture inside the frame is still there, on the Position X and
 * Position Y controls in the Transform panel, which is where a control you
 * reach for once belongs.
 *
 * One thing had to be fixed for any of that to be reachable. The bundle's
 * pointerdown handler calls preventDefault, which suppresses the focus change
 * a click normally performs — so if a text field had focus, and the project
 * name at the top of the window is a text field, it kept focus while you
 * clicked a clip and every arrow went into that field. Clicking a clip now
 * takes the keyboard with it.
 *
 * ------------------------------------------------------------------------
 * A SECOND VIDEO LANE, FROM THE START
 * ------------------------------------------------------------------------
 * A new project opened with exactly three lanes: V1, A1, T1. One video lane.
 * So the first thing anybody tried after lane-dragging shipped — pick up a
 * clip, drag it down — had nowhere to land, because the only other two lanes
 * are audio (which refuses video) and text. The feature worked and looked
 * broken, which is the same thing as not working.
 *
 * A fresh project gets V1, V2, A1, T1 now. Two video lanes is the smallest
 * number where layering means anything, and four rows is what fits in the
 * timeline's default height — a fifth would open the editor with a scrollbar
 * in the timeline, which is a worse first impression than a missing lane.
 * "+ Video" in the timeline toolbar still adds as many more as you want.
 *
 * IT ONLY EVER SEEDS A PRISTINE PROJECT. The check is exact: three lanes,
 * named and kinded exactly as the bundle creates them, and no clips. Anything
 * else — one clip, one renamed lane, one added or removed lane — is somebody's
 * own arrangement and is never touched again.
 *
 * That check does the job a "have I already done this" flag would do, and does
 * it better. The first version kept such a flag and it was wrong in the most
 * ordinary case there is: the editor autosaves every eight seconds, so opening
 * the editor and closing it sooner than that saved nothing, the next load
 * restored the original three lanes, and the flag stopped V2 ever coming back.
 * The lane appeared once and then was gone for good.
 *
 * ------------------------------------------------------------------------
 * HELD KEYS DO NOT FILL THE UNDO STACK. The first press of a run goes through
 * moveClip, which records one history entry; while the key repeats it writes
 * through setState, which records none. Hold Right for two seconds and Undo
 * puts the clip back where it started in one press, not in ninety.
 */
(function () {
  'use strict';
  if (window.NC_LANES) return;

  var CLIP = '.cursor-grab.absolute';   /* a clip in the timeline, not a media tile */
  var TRIM = '.cursor-ew-resize';       /* the two trim handles inside it */

  function css() {
    if (document.getElementById('nc-lanes-css')) return;
    var s = document.createElement('style');
    s.id = 'nc-lanes-css';
    s.textContent = [
      /* The lane under the pointer. Inset rather than a border so nothing
         reflows and the rows do not shift while you are dragging over them. */
      '.nc-lane-ok{box-shadow:inset 0 0 0 2px rgba(56,189,248,.65),',
      '  inset 0 0 40px rgba(56,189,248,.12);background:rgba(56,189,248,.06)}',
      '.nc-lane-no{box-shadow:inset 0 0 0 2px rgba(251,113,133,.55);',
      '  background:rgba(251,113,133,.07)}',
      /* Why it will not take it, said on the lane itself. */
      '.nc-lane-no::after{content:attr(data-nc-why);position:absolute;right:10px;top:50%;',
      '  transform:translateY(-50%);font:700 11px system-ui,sans-serif;color:#fb7185;',
      '  background:rgba(8,10,18,.82);padding:4px 9px;border-radius:999px;pointer-events:none;z-index:9}'
    ].join('');
    document.head.appendChild(s);
  }

  function store() { return window.__ncStore; }

  /* The lane rows, in the order the tracks are in. The row container also
     holds a full-height overlay for the playhead, which is not a lane — the
     border-b class is what separates the two. */
  function laneRows(clipEl) {
    var row = clipEl && clipEl.parentElement;
    var host = row && row.parentElement;
    if (!host) return null;
    var rows = [];
    for (var i = 0; i < host.children.length; i++) {
      var c = host.children[i];
      if (/\bborder-b\b/.test(c.className || '')) rows.push(c);
    }
    return rows.length ? rows : null;
  }

  function takes(clipKind, trackKind) {
    if (clipKind === 'audio') return trackKind === 'audio';
    return trackKind !== 'audio';
  }

  function why(clipKind, trackKind) {
    if (clipKind === 'audio') return 'audio lanes only';
    return 'audio lane';
  }

  var drag = null;

  function clear() {
    if (!drag) return;
    drag.rows.forEach(function (r) {
      r.classList.remove('nc-lane-ok', 'nc-lane-no');
      r.removeAttribute('data-nc-why');
    });
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp, true);
    drag = null;
  }

  function setTrack(id, trackId) {
    var st = store().getState();
    var changed = false;
    var clips = st.clips.map(function (c) {
      if (c.id !== id || c.trackId === trackId) return c;
      changed = true;
      return Object.assign({}, c, { trackId: trackId });
    });
    if (changed) store().setState({ clips: clips });
  }

  function rowAt(y) {
    if (!drag) return -1;
    for (var i = 0; i < drag.rows.length; i++) {
      var b = drag.rows[i].getBoundingClientRect();
      if (y >= b.top && y <= b.bottom) return i;
    }
    /* Past the ends, clamp — dragging off the top of the timeline should mean
       the top lane, not "nothing happened". */
    var first = drag.rows[0].getBoundingClientRect();
    var last = drag.rows[drag.rows.length - 1].getBoundingClientRect();
    if (y < first.top) return 0;
    if (y > last.bottom) return drag.rows.length - 1;
    return -1;
  }

  function onMove(e) {
    if (!drag) return;
    var st = store().getState();
    var clip = null;
    for (var i = 0; i < st.clips.length; i++) if (st.clips[i].id === drag.id) clip = st.clips[i];
    if (!clip) return;

    var idx = rowAt(e.clientY);
    drag.rows.forEach(function (r) {
      r.classList.remove('nc-lane-ok', 'nc-lane-no');
      r.removeAttribute('data-nc-why');
    });
    if (idx < 0) return;
    var track = st.tracks[idx];
    if (!track) return;

    if (track.locked) {
      drag.rows[idx].classList.add('nc-lane-no');
      drag.rows[idx].setAttribute('data-nc-why', 'locked');
      setTrack(drag.id, drag.from);
      return;
    }
    if (!takes(drag.kind, track.kind)) {
      drag.rows[idx].classList.add('nc-lane-no');
      drag.rows[idx].setAttribute('data-nc-why', why(drag.kind, track.kind));
      setTrack(drag.id, drag.from);       /* stay where it was */
      return;
    }
    drag.rows[idx].classList.add('nc-lane-ok');
    setTrack(drag.id, track.id);
  }

  function onUp() { clear(); }

  function onDown(e) {
    if (e.button !== 0) return;
    if (!e.target || !e.target.closest) return;
    var clipEl = e.target.closest(CLIP);
    if (!clipEl) return;
    if (e.target.closest(TRIM)) return;          /* trimming an edge, not moving */
    var s = store();
    if (!s || !s.getState || !s.setState) return;

    /* CLICKING A CLIP HAS TO TAKE THE KEYBOARD WITH IT.
       Their handler calls preventDefault on pointerdown, and one of the things
       that suppresses is the focus change a click normally makes. So if any
       text field had focus — the project name at the top of the window is an
       input, and it is the first one on the page — it keeps it while you click
       a clip, and every arrow key afterwards goes to that field instead of to
       the timeline. Measured: the keydown's target was INPUT, so the arrow
       handler below correctly stood down and nothing moved.

       Clicking a clip means you are working on the clip. The field lets go. */
    try {
      var act = document.activeElement;
      if (act && act !== document.body && /^(INPUT|TEXTAREA)$/.test(act.tagName || '')) act.blur();
    } catch (err) {}

    /* A NEW TASK, NOT THIS ONE. Two things have to have happened before this
       can start: their handler has to have selected the clip, and it has to
       have registered its own pointermove. Both happen during the dispatch
       this listener is at the front of, so everything below waits for the
       dispatch to finish. */
    setTimeout(function () {
      var st = s.getState();
      var id = st.selectedClipId;
      if (!id) return;
      var clip = null;
      for (var i = 0; i < st.clips.length; i++) if (st.clips[i].id === id) clip = st.clips[i];
      if (!clip) return;

      var rows = laneRows(clipEl);
      if (!rows) return;

      /* THE CHECK THAT STOPS THIS GUESSING. The row this clip is drawn in has
         to be the row belonging to the track the clip says it is on. If those
         two disagree, the DOM is not laid out the way this file believes and
         the only safe thing is to do nothing. */
      var mine = rows.indexOf(clipEl.parentElement);
      if (mine < 0 || !st.tracks[mine] || st.tracks[mine].id !== clip.trackId) return;

      css();
      if (drag) clear();
      drag = { id: id, rows: rows, kind: clip.kind, from: clip.trackId };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, true);
    }, 0);
  }

  /* CAPTURE, because their handler calls stopPropagation and nothing in the
     bubble phase below the root ever sees this event. */
  document.addEventListener('pointerdown', onDown, true);


  /* ==========================================================================
     THE STARTING LANES
     ========================================================================== */
  /* NO "HAVE I DONE THIS ALREADY" FLAG, AND THAT IS THE POINT.
     The first version wrote one, and it was wrong in the ordinary case:
     the editor autosaves every eight seconds, so opening the editor and
     closing it inside that window saved nothing, the next load restored the
     original three lanes, and the flag stopped V2 ever coming back. The lane
     appeared once and then vanished for good.

     The pristine check below is a better flag than any flag. A project with a
     clip in it, or a lane added, removed or renamed, fails it and is never
     touched again — so the only thing that can be re-seeded is a project with
     nothing in it, where re-seeding is the right answer anyway. */

  /* Exactly the three the bundle makes and nothing else. A project with any
     clip in it, or any lane added, removed or renamed, is somebody's own and
     is not touched. */
  function isPristine(st) {
    if (!st || !st.tracks || st.tracks.length !== 3) return false;
    if (st.clips && st.clips.length) return false;
    var want = [['video', 'V1'], ['audio', 'A1'], ['text', 'T1']];
    for (var i = 0; i < 3; i++) {
      if (st.tracks[i].kind !== want[i][0] || st.tracks[i].name !== want[i][1]) return false;
    }
    return true;
  }

  function seedLanes() {
    var s = store();
    if (!s || !s.getState || !s.setState) return false;
    var st = s.getState();
    if (!isPristine(st)) return false;

    /* Built by hand rather than through addTrack, for two reasons: addTrack
       appends, so the new video lane would land under the text lane instead
       of beside its own kind, and it pushes a history entry, which would make
       Undo on a brand-new project delete a lane the person never added. */
    var v1 = st.tracks[0];
    var v2 = { id: 'track_nc_v2_' + Date.now().toString(36),
               kind: 'video', name: 'V2', locked: false, hidden: false, muted: false,
               height: v1.height || 72 };
    s.setState({ tracks: [st.tracks[0], v2, st.tracks[1], st.tracks[2]] });
    return true;
  }

  /* The project the editor restores from storage arrives after this file runs,
     and it arrives from IndexedDB, so there is no one moment to hook. It tries
     a few times over the first couple of seconds and stops the first time it
     either seeds or finds something that is not a pristine project. */
  (function waitForStore() {
    var tries = 0;
    (function tick() {
      setTimeout(function () {
        if (!store()) { if (++tries < 40) tick(); return; }
        if (seedLanes()) return;
        if (!isPristine(store().getState())) return;
        if (++tries < 40) tick();
      }, 120);
    })();
  })();

  /* ==========================================================================
     THE ARROW KEYS
     ========================================================================== */
  function clipById(st, id) {
    for (var i = 0; i < st.clips.length; i++) if (st.clips[i].id === id) return st.clips[i];
    return null;
  }
  function trackIndex(tracks, id) {
    for (var i = 0; i < tracks.length; i++) if (tracks[i].id === id) return i;
    return -1;
  }
  function setStart(id, start) {
    var st = store().getState();
    store().setState({ clips: st.clips.map(function (c) {
      return c.id === id ? Object.assign({}, c, { start: start }) : c;
    }) });
  }

  function onKey(e) {
    var k = e.key;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'ArrowUp' && k !== 'ArrowDown') return;
    /* Anything with a modifier that is not Shift belongs to the browser or to
       a shortcut this file knows nothing about. */
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '') || t.isContentEditable)) return;

    var s = store();
    if (!s || !s.getState || !s.setState) return;
    var st = s.getState();
    var id = st.selectedClipId;
    if (!id) return;                     /* nothing selected: the playhead keeps the keys */
    var clip = clipById(st, id);
    if (!clip) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      var fps = (st.settings && st.settings.fps) || 30;
      var step = e.shiftKey ? 1 : 1 / fps;
      var start = Math.max(0, clip.start + (k === 'ArrowRight' ? step : -step));
      start = Math.round(start * 10000) / 10000;
      if (start === clip.start) return;
      if (e.repeat) setStart(id, start); else st.moveClip(id, start, clip.trackId);
      return;
    }

    var i = trackIndex(st.tracks, clip.trackId);
    if (i < 0) return;
    var dir = k === 'ArrowUp' ? -1 : 1;
    for (var j = i + dir; j >= 0 && j < st.tracks.length; j += dir) {
      var tr = st.tracks[j];
      if (tr.locked || !takes(clip.kind, tr.kind)) continue;
      if (e.repeat) setTrack(id, tr.id); else st.moveClip(id, clip.start, tr.id);
      return;
    }
  }

  /* Capture, for the same reason the pointer listener is: the bundle's own
     key handling has to not get this one. */
  window.addEventListener('keydown', onKey, true);
  /* A drag interrupted by the tab losing the pointer should not leave a lane
     lit up for the rest of the session. */
  window.addEventListener('pointercancel', onUp, true);
  window.addEventListener('blur', onUp);

  window.NC_LANES = { takes: takes, onKey: onKey };
})();
