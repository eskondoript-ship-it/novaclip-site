/* NOVACLIP — EDITS: THE SPLIT-SCREEN COMPARISON
 * ===========================================================================
 * Asked for with a video: the "edits" genre. A real person in the top half of
 * the frame, their animated counterpart in the bottom — Jackie Chan's student
 * over Kung Fu Panda, Ronaldo over Lightning McQueen, Messi over a Cars still,
 * Neymar over an F1 car — a word across each pairing ("Hard work" / "Talent"),
 * and hard cuts straight through both halves at once.
 *
 * It is one of the most made formats on TikTok and it is tedious in every
 * editor: two clips, two transforms, two crops, two text layers, and all of it
 * redone for the next pair. Nothing here is a thing the editor could not
 * already do by hand. The whole point is that doing it by hand is nine steps
 * and this is one.
 *
 * WHAT IT SETS, AND WHY THOSE NUMBERS
 * ---------------------------------------------------------------------------
 * Read out of the bundle's own renderer rather than guessed at:
 *
 *     const g = n/2 + v*(n/2);     // x = width/2  + positionX * (width/2)
 *     const w = r/2 + k*(r/2);     // y = height/2 + positionY * (height/2)
 *
 * so positionY is in halves of the frame: -0.5 puts a clip's centre at one
 * quarter down, which is the middle of the top half, and +0.5 puts it at
 * three quarters, the middle of the bottom. Crop is a fraction per side and
 * the bundle's own sliders cap it at 0.5, so cropping 0.25 off the top and
 * 0.25 off the bottom keeps the middle band — the part with the face in it —
 * and throws away what would otherwise spill into the other half.
 *
 * THE PAIR HAS TO BE ON TWO TRACKS
 * ---------------------------------------------------------------------------
 * Two clips on one track cannot both be on screen at once: a track is a
 * sequence. So the lower clip is moved to a second video track and both are
 * started at the same time. If there is no second video track this adds one,
 * which is the only thing here that changes the shape of the project, and it
 * is the thing the format cannot be done without.
 *
 * WHAT IT DOES NOT DO
 * ---------------------------------------------------------------------------
 * It does not cut to the beat. The editor already has a Beats control that
 * does that better than a preset could, and faking it here would mean
 * guessing at a tempo this file cannot hear. It does not add the grain, the
 * letterbox bars or the shake either — all three are in the FX library, one
 * drag each, and baking somebody's taste into a button is how a tool ends up
 * with one look. What it does is the part that is pure bookkeeping.
 */
(function () {
  'use strict';
  if (window.NC_EDITS) return;

  var TOP_Y = -0.5, BOT_Y = 0.5;     /* halves of the frame, from the renderer */
  var BAND = 0.25;                   /* crop per side: keeps the middle half */

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }

  function videoTracks(st) {
    return (st.tracks || []).filter(function (t) { return t.kind === 'video'; });
  }

  /* The two clips to pair. The selected one leads, and its nearest neighbour
     follows — which is almost always the two you just dropped in. */
  function pair(st) {
    var clips = (st.clips || []).filter(function (c) { return c.kind !== 'audio'; });
    if (clips.length < 2) return null;
    var sel = null;
    for (var i = 0; i < clips.length; i++) {
      if (clips[i].id === st.selectedClipId) sel = clips[i];
    }
    var sorted = clips.slice().sort(function (a, b) { return (a.start || 0) - (b.start || 0); });
    if (!sel) return { top: sorted[0], bottom: sorted[1] };
    var idx = sorted.indexOf(sel);
    var other = sorted[idx + 1] || sorted[idx - 1];
    if (!other) return null;
    return { top: sel, bottom: other };
  }

  function transformFor(half) {
    return {
      positionX: 0,
      positionY: half === 'top' ? TOP_Y : BOT_Y,
      scale: 1,
      crop: { top: BAND, right: 0, bottom: BAND, left: 0 }
    };
  }

  /* --------------------------------------------------------------- the work */

  function build(opts) {
    var st = state();
    if (!st) return { ok: false, why: 'The editor is not ready yet.' };
    var p = pair(st);
    if (!p) return { ok: false, why: 'Put two clips on the timeline first — one for each half.' };
    if (p.top.id === p.bottom.id) return { ok: false, why: 'That needs two different clips.' };

    try { if (typeof st.pushHistory === 'function') st.pushHistory(); } catch (e) {}

    /* Two tracks, because one track is a sequence and both halves have to be
       on screen together. */
    var vt = videoTracks(st);
    if (vt.length < 2) {
      try { st.addTrack('video'); } catch (e) {
        return { ok: false, why: 'Could not add a second video track for the bottom half.' };
      }
      st = state();
      vt = videoTracks(st);
      if (vt.length < 2) return { ok: false, why: 'Could not add a second video track.' };
    }

    var at = Math.min(p.top.start || 0, p.bottom.start || 0);

    /* The lower clip moves to the second video track and both start together,
       so a cut through the pair lands on the same frame in each. */
    /* moveClip(id, start, trackId) — start SECOND, track third. Read out of
       the bundle rather than assumed: the first version passed the track where
       the start goes, which silently set each clip's start to a track id,
       left both on one track, and still reported success. */
    try {
      st.moveClip(p.top.id, at, vt[0].id);
      st.moveClip(p.bottom.id, at, vt[1].id);
    } catch (e) {
      return { ok: false, why: 'Those clips would not move onto two tracks.' };
    }

    try {
      st = state();
      st.updateClipTransform(p.top.id, transformFor('top'));
      st.updateClipTransform(p.bottom.id, transformFor('bottom'));
    } catch (e) {
      return { ok: false, why: 'Those clips would not take the split layout.' };
    }

    var made = 0;
    if (opts && (opts.topText || opts.bottomText)) {
      made = captions(opts.topText, opts.bottomText, at,
                      Math.min(p.top.duration || 4, p.bottom.duration || 4));
    }
    return { ok: true, top: p.top.id, bottom: p.bottom.id, captions: made };
  }

  /* One line of text per half, sitting just inside it rather than on the seam,
     which is where the genre puts them and where they stay legible over a
     face. */
  function captions(topText, bottomText, at, dur) {
    var st = state();
    if (!st || typeof st.addTextClip !== 'function') return 0;
    var tt = (st.tracks || []).filter(function (t) { return t.kind === 'text'; })[0];
    if (!tt) {
      try { st.addTrack('text'); } catch (e) { return 0; }
      st = state();
      tt = (st.tracks || []).filter(function (t) { return t.kind === 'text'; })[0];
      if (!tt) return 0;
    }
    var n = 0;
    [[topText, -0.55], [bottomText, 0.45]].forEach(function (row) {
      if (!row[0]) return;
      try {
        st = state();
        st.addTextClip(tt.id, at);
        var cs = state().clips.filter(function (c) { return c.kind === 'text'; });
        var made = cs[cs.length - 1];
        if (!made) return;
        state().updateClipText(made.id, { content: row[0] });
        state().updateClipTransform(made.id, { positionX: 0, positionY: row[1] });
        /* resizeClip(id, start, duration), same lesson. */
        if (dur > 0) { try { state().resizeClip(made.id, at, dur); } catch (e) {} }
        n++;
      } catch (e) {}
    });
    return n;
  }

  /* -------------------------------------------------------------------- view */

  var CSS =
    '.nced-btn{position:fixed;left:-9999px;top:-9999px}' +
    '.nced{position:fixed;left:14px;bottom:118px;width:330px;z-index:100002;' +
      'background:#0B0A14;border:1px solid rgba(255,255,255,.14);border-radius:14px;' +
      'box-shadow:0 18px 44px rgba(0,0,0,.5);color:#E6E9F2;' +
      'font:400 13px/1.5 system-ui;overflow:hidden}' +
    '.nced-hd{display:flex;align-items:center;gap:8px;padding:12px 14px;' +
      'border-bottom:1px solid rgba(255,255,255,.08)}' +
    '.nced-hd b{font-size:13px}' +
    '.nced-x{margin-left:auto;background:none;border:0;color:#8B93AD;cursor:pointer;font-size:16px}' +
    '.nced-bd{padding:12px 14px;display:grid;gap:10px}' +
    '.nced-bd p{margin:0;color:#8B93AD;font-size:11.5px;line-height:1.5}' +
    '.nced-lab{font:600 10px/1 system-ui;letter-spacing:.07em;text-transform:uppercase;color:#8B93AD}' +
    '.nced-in{width:100%;background:rgba(255,255,255,.05);color:#E6E9F2;font:inherit;' +
      'border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:7px 9px}' +
    '.nced-go{width:100%;border:0;border-radius:9px;padding:9px;cursor:pointer;' +
      'background:#7C5CFF;color:#fff;font:600 13px/1 system-ui}' +
    '.nced-go:hover{background:#8f72ff}' +
    '.nced-say{font-size:11.5px;line-height:1.5;min-height:1em}' +
    '.nced-say.no{color:#ff9d9d}.nced-say.ok{color:#9dffc4}';

  var box = null;

  function css() {
    if (document.getElementById('nced-css')) return;
    var s = document.createElement('style');
    s.id = 'nced-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function close() {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    box = null;
  }

  function open() {
    if (box) { close(); return; }
    css();
    box = document.createElement('div');
    box.className = 'nced';
    box.innerHTML =
      '<div class="nced-hd"><b>Edits</b>' +
        '<button class="nced-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="nced-bd">' +
        '<p>The split-screen comparison: one clip in the top half, one in the bottom, ' +
        'a word on each. Pick a clip on the timeline — the one next to it becomes the ' +
        'other half.</p>' +
        '<div><div class="nced-lab">Top line</div>' +
          '<input class="nced-in" id="ncedTop" value="Hard work"></div>' +
        '<div><div class="nced-lab">Bottom line</div>' +
          '<input class="nced-in" id="ncedBot" value="Talent"></div>' +
        '<button class="nced-go" type="button" id="ncedGo">Make the split</button>' +
        '<div class="nced-say" id="ncedSay"></div>' +
        '<p>It lays out the halves and the words. Beats, grain and bars stay yours — ' +
        'the Beats button cuts better than a preset could, and the rest is one drag ' +
        'each from the FX library.</p>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector('.nced-x').onclick = close;
    box.querySelector('#ncedGo').onclick = function () {
      var say = box.querySelector('#ncedSay');
      var r = build({
        topText: (box.querySelector('#ncedTop').value || '').trim(),
        bottomText: (box.querySelector('#ncedBot').value || '').trim()
      });
      say.className = 'nced-say ' + (r.ok ? 'ok' : 'no');
      say.textContent = r.ok
        ? 'Done — two halves' + (r.captions ? ' and ' + r.captions + ' line' + (r.captions > 1 ? 's' : '') : '') +
          '. Ctrl+Z puts it back.'
        : r.why;
    };
  }

  /* The rail picks this pill up by class, the same way it adopts the FX
     library's. Kept off screen by the CSS above so it is never a loose button
     floating over the preview if the rail has not loaded yet. */
  function pill() {
    if (document.querySelector('.nced-btn')) return;
    css();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nced-btn';
    b.textContent = 'Edits';
    b.onclick = open;
    document.body.appendChild(b);
  }

  function start() { pill(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_EDITS = { open: open, close: close, build: build, TOP_Y: TOP_Y, BOT_Y: BOT_Y, BAND: BAND };
})();
