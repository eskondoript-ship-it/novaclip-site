/* ============================================================================
   NOVACLIP EDITOR — THE KEYBOARD
   ============================================================================
   The editor was never short of features. It has thirty-seven effects, fifteen
   colour controls, transforms with crop and blend modes, speed, reverse,
   freeze frame, keyframes and transitions. What it was short of was SPEED, and
   for short-form video that is the same thing as power: a sixty-second edit is
   forty cuts, and forty cuts made by travelling to a panel with a mouse is a
   different job from forty cuts made with two fingers on the keyboard.

   That is the whole of what this file adds. No new capability — every key
   below drives something the editor could already do. What changes is how long
   it takes.

   WHAT IT DELIBERATELY DOES NOT TOUCH. The app already owns Space, S, Delete,
   M, the arrow keys, + and −, and every Ctrl/Cmd chord. Those were measured by
   asking the running app which keys it calls preventDefault on, rather than
   read off the bundle, and nothing here takes one of them back. Any key held
   with Ctrl, Cmd or Alt is passed straight through: the browser's shortcuts
   are not ours to borrow.

   TRIMMING IS DONE WITH THE APP'S OWN SPLIT. A trim that moves a clip's head
   has to move the source window with it, or the picture jumps — and the rules
   for that live inside the bundle. So "trim to the playhead" is split-then-
   delete, which gets the app to do its own arithmetic. It is also exactly what
   the result should be, and it survives whatever the bundle changes next.

   AND IT IS DISCOVERABLE. A shortcut nobody knows about is worth nothing, so ?
   opens the list and the editor says once, quietly, that it is there. A
   thirteen-year-old has never used a keyboard-driven editor; this is the part
   that teaches them.
   ========================================================================= */
(function () {
  'use strict';

  var store = null;
  function S() {
    if (!store) store = window.__ncStore;
    return store && store.getState ? store.getState() : null;
  }

  var FPS = function () {
    var s = S();
    var f = s && s.settings && s.settings.fps;
    return (typeof f === 'number' && f > 0) ? f : 30;
  };
  var FRAME = function () { return 1 / FPS(); };

  function sel() {
    var s = S();
    if (!s || !s.selectedClipId) return null;
    for (var i = 0; i < s.clips.length; i++) {
      if (s.clips[i].id === s.selectedClipId) return s.clips[i];
    }
    return null;
  }

  /* The project's end, which is what "fit" means. */
  function projectEnd() {
    var s = S();
    if (!s || !s.clips.length) return 10;
    var end = 0;
    s.clips.forEach(function (c) { end = Math.max(end, c.start + c.duration); });
    return Math.max(end, 1);
  }

  function seek(by) {
    var s = S();
    if (!s) return;
    s.setPlayhead(Math.max(0, Math.round((s.playhead + by) * 1000) / 1000));
  }

  /* ---------------------------------------------------------------- the toast
     Every key says what it did. Without it, a keyboard layer on an app that
     looks the same afterwards is indistinguishable from a key that did
     nothing — which is how people decide a shortcut is broken and go back to
     the mouse. */
  var toastEl = null, toastT = null;
  function say(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'nckeytoast';
      toastEl.setAttribute('role', 'status');
      toastEl.style.cssText =
        'position:fixed;left:50%;transform:translateX(-50%);top:70px;z-index:99990;' +
        'pointer-events:none;padding:7px 14px;border-radius:999px;' +
        'font:700 13px/1 system-ui,-apple-system,sans-serif;letter-spacing:.01em;' +
        'color:#EAF2FF;background:rgba(12,16,26,.92);border:1px solid rgba(255,255,255,.14);' +
        'box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:0;transition:opacity .12s';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { if (toastEl) toastEl.style.opacity = '0'; }, 1100);
  }

  function needClip() {
    var c = sel();
    if (!c) { say('Pick a clip first'); return null; }
    return c;
  }

  /* --------------------------------------------------------------- the trims
     Split at the playhead, then drop the side nobody wants. The app's own
     split moves the source window; doing the arithmetic here would be a second
     implementation of a rule that already exists, and a second place for it to
     be wrong. */
  function trimTo(side) {
    var s = S(), c = needClip();
    if (!c || !s) return;
    var t = s.playhead;
    if (t <= c.start + FRAME() || t >= c.start + c.duration - FRAME()) {
      say('Put the playhead inside the clip'); return;
    }
    var before = s.clips.map(function (x) { return x.id; });
    s.splitClip(c.id, t);
    var after = S().clips;
    /* The two halves: the original id keeps one side, the new id is the
       other. Which is which is the bundle's business, so they are found by
       where they sit rather than by assuming. */
    var pieces = after.filter(function (x) {
      return x.trackId === c.trackId &&
             x.start >= c.start - 0.001 && x.start + x.duration <= c.start + c.duration + 0.001;
    });
    var head = null, tail = null;
    pieces.forEach(function (x) {
      if (Math.abs(x.start - c.start) < 0.01) head = x;
      if (Math.abs(x.start - t) < 0.01) tail = x;
    });
    if (!head || !tail) { say('Trimmed'); return; }
    var drop = side === 'in' ? head : tail;
    var keep = side === 'in' ? tail : head;
    S().deleteClip(drop.id);
    S().selectClip(keep.id);
    say(side === 'in' ? 'Trimmed the start to the playhead'
                      : 'Trimmed the end to the playhead');
    void before;
  }

  /* --------------------------------------------------------------- the moves */
  function nudge(frames) {
    var c = needClip();
    if (!c) return;
    var by = frames * FRAME();
    var to = Math.max(0, Math.round((c.start + by) * 1000) / 1000);
    S().moveClip(c.id, to);
    say((by > 0 ? '→ ' : '← ') + Math.abs(frames) + (Math.abs(frames) === 1 ? ' frame' : ' frames'));
  }

  var copied = null;
  function copy() {
    var c = needClip();
    if (!c) return;
    copied = c.id;
    say('Copied · V drops it at the playhead');
  }
  function paste() {
    var s = S();
    if (!s) return;
    var src = copied || s.selectedClipId;
    if (!src || !s.clips.some(function (x) { return x.id === src; })) {
      say('Nothing to paste'); return;
    }
    var had = s.clips.map(function (x) { return x.id; });
    s.duplicateClip(src);
    var made = S().clips.filter(function (x) { return had.indexOf(x.id) === -1; })[0];
    if (!made) { say('Could not paste'); return; }
    S().moveClip(made.id, S().playhead);
    S().selectClip(made.id);
    say('Pasted at the playhead');
  }
  function duplicate() {
    var c = needClip();
    if (!c) return;
    S().duplicateClip(c.id);
    say('Duplicated, straight after it');
  }
  /* X is a lift that closes the gap, not a clipboard cut — the store can put a
     clip back only by copying one that still exists, so a cut that removed the
     original would have nothing to paste. Saying "ripple delete" is the honest
     label for what it does. */
  function lift() {
    var c = needClip();
    if (!c) return;
    S().rippleDelete(c.id);
    say('Removed, gap closed');
  }

  /* --------------------------------------------------------------- the looks */
  var RATES = { '1': 0.25, '2': 0.5, '3': 1, '4': 1.5, '5': 2 };
  function speed(rate) {
    var c = needClip();
    if (!c) return;
    S().updateClipSpeed(c.id, { rate: rate });
    say(rate === 1 ? 'Normal speed' : rate + '× speed');
  }
  function reverse() {
    var c = needClip();
    if (!c) return;
    var on = !(c.speed && c.speed.reverse);
    S().updateClipSpeed(c.id, { reverse: on });
    say(on ? 'Reversed' : 'Playing forwards');
  }
  function punch() {
    var c = needClip();
    if (!c) return;
    var on = !(c.effects && c.effects.zoomPunch > 0);
    S().updateClipEffects(c.id, { zoomPunch: on ? 0.55 : 0 });
    say(on ? 'Zoom punch on' : 'Zoom punch off');
  }

  /* --------------------------------------------------------------- the zooms */
  function fit() {
    var s = S();
    if (!s) return;
    var lane = document.querySelector('.timeline, #timeline, [class*="timeline"]');
    var w = lane ? lane.clientWidth : window.innerWidth - 360;
    var px = Math.max(8, Math.min(400, (w - 40) / projectEnd()));
    s.setZoom(Math.round(px));
    say('Whole project in view');
  }

  /* ------------------------------------------------------------ the cheat sheet */
  var KEYS = [
    ['Move around', [
      [', .', 'One frame back / forward'],
      ['Shift , .', 'One second back / forward'],
      ['J K L', 'Back a second · pause · forward a second'],
      ['Home End', 'Start / end of the project']
    ]],
    ['Cut', [
      ['I', 'Trim the start to the playhead'],
      ['O', 'Trim the end to the playhead'],
      ['S', 'Split here (the editor’s own)'],
      ['X', 'Remove and close the gap']
    ]],
    ['Move the clip', [
      ['[ ]', 'Nudge one frame'],
      ['Shift [ ]', 'Nudge one second'],
      ['C then V', 'Copy, then drop it at the playhead'],
      ['D', 'Duplicate straight after']
    ]],
    ['Make it look fast', [
      ['Shift 1–5', '0.25× · 0.5× · 1× · 1.5× · 2×'],
      ['R', 'Reverse'],
      ['P', 'Zoom punch'],
      ['F', 'Fit the project on screen']
    ]]
  ];

  var sheet = null;
  function cheatSheet() {
    if (sheet) { sheet.remove(); sheet = null; return; }
    sheet = document.createElement('div');
    sheet.id = 'nckeysheet';
    sheet.style.cssText =
      'position:fixed;inset:0;z-index:99991;display:grid;place-items:center;padding:22px;' +
      'background:rgba(6,8,14,.72);backdrop-filter:blur(6px);' +
      'font-family:system-ui,-apple-system,sans-serif';
    var cols = KEYS.map(function (grp) {
      return '<div><div style="font:800 11px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;' +
        'color:#7C8BA8;margin:0 0 9px">' + grp[0] + '</div>' +
        grp[1].map(function (row) {
          return '<div style="display:flex;gap:12px;align-items:baseline;margin:0 0 7px">' +
            '<kbd style="flex:0 0 auto;min-width:74px;font:700 12px/1.5 ui-monospace,Consolas,monospace;' +
            'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:7px;' +
            'padding:3px 7px;color:#EAF2FF;text-align:center">' + row[0] + '</kbd>' +
            '<span style="font-size:13px;color:#C3CDE0;line-height:1.45">' + row[1] + '</span></div>';
        }).join('') + '</div>';
    }).join('');
    sheet.innerHTML =
      '<div style="max-width:860px;width:100%;background:#0E1220;border:1px solid rgba(255,255,255,.12);' +
      'border-radius:18px;padding:26px 28px;box-shadow:0 30px 80px rgba(0,0,0,.6)">' +
      '<div style="display:flex;align-items:baseline;gap:12px;margin:0 0 20px">' +
      '<b style="font-size:1.15rem;color:#EAF2FF;letter-spacing:-.01em">Edit with the keyboard</b>' +
      '<span style="font-size:12.5px;color:#7C8BA8">Forty cuts go a lot faster this way. ' +
      'Press <kbd style="font-family:ui-monospace,monospace">?</kbd> any time — Esc closes this.</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:22px 28px">' +
      cols + '</div></div>';
    sheet.onclick = function (e) { if (e.target === sheet) { sheet.remove(); sheet = null; } };
    document.body.appendChild(sheet);
  }

  /* ----------------------------------------------------------------- the wiring */
  function typing(e) {
    var t = e.target;
    if (!t) return false;
    var tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  }

  function onKey(e) {
    if (typing(e)) return;
    /* Ctrl, Cmd and Alt belong to the app and to the browser. */
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var k = e.key;

    if (k === '?' || (k === '/' && e.shiftKey)) { e.preventDefault(); cheatSheet(); return; }
    if (k === 'Escape' && sheet) { e.preventDefault(); sheet.remove(); sheet = null; return; }

    if (e.shiftKey && RATES[k]) { e.preventDefault(); speed(RATES[k]); return; }

    var s = S();
    if (!s) return;

    switch (k) {
      case ',': e.preventDefault(); seek(e.shiftKey ? -1 : -FRAME()); break;
      case '.': e.preventDefault(); seek(e.shiftKey ? 1 : FRAME()); break;
      case 'j': case 'J': e.preventDefault(); seek(-1); break;
      case 'l': case 'L': e.preventDefault(); seek(1); break;
      case 'k': case 'K': e.preventDefault(); s.setPlaying(false); say('Paused'); break;
      case 'Home': e.preventDefault(); s.setPlayhead(0); break;
      case 'End': e.preventDefault(); s.setPlayhead(projectEnd()); break;
      case 'i': case 'I': e.preventDefault(); trimTo('in'); break;
      case 'o': case 'O': e.preventDefault(); trimTo('out'); break;
      case '[': e.preventDefault(); nudge(e.shiftKey ? -FPS() : -1); break;
      case ']': e.preventDefault(); nudge(e.shiftKey ? FPS() : 1); break;
      case 'c': case 'C': e.preventDefault(); copy(); break;
      case 'v': case 'V': e.preventDefault(); paste(); break;
      case 'x': case 'X': e.preventDefault(); lift(); break;
      case 'd': case 'D': e.preventDefault(); duplicate(); break;
      case 'r': case 'R': e.preventDefault(); reverse(); break;
      case 'p': case 'P': e.preventDefault(); punch(); break;
      case 'f': case 'F': e.preventDefault(); fit(); break;
      default: return;
    }
  }

  function boot() {
    if (!window.__ncStore) { setTimeout(boot, 400); return; }
    /* CAPTURE, AND IT HAS TO BE. The first version listened on document in the
       bubble phase and almost nothing fired: the app stops keydown from
       bubbling out of its own editor shell, so "." and Home arrived — they are
       handled on document — and every letter died on the way up. Measured, not
       guessed: twelve keys silently did nothing while the two that happened to
       be bound at document level worked perfectly, which is the kind of split
       result that looks like a typo and is not.

       Capturing at the window is safe here because this handler touches only
       the keys it owns and returns for everything else, so the app's own S,
       Space and Delete still reach it untouched. */
    window.addEventListener('keydown', onKey, true);
    /* Said once per browser, because the keys are no use to somebody who does
       not know they exist, and said twice is nagging. */
    try {
      if (!localStorage.getItem('nc_keys_seen')) {
        localStorage.setItem('nc_keys_seen', '1');
        setTimeout(function () { say('Press ? for keyboard shortcuts'); }, 2500);
      }
    } catch (e) {}
    window.ncEditorKeys = { sheet: cheatSheet, map: KEYS };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
