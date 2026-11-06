/* NOVACLIP — "SIMPLE" IS CALLED QUICK EDIT
 * ===========================================================================
 * The editor's two modes were labelled Simple and Complex. "Simple" reads as
 * a judgement about the person rather than a description of the mode — the
 * one you pick when you are not up to the other one — and "Complex" is not
 * something anybody wants to opt into either. Quick edit says what it is: the
 * fast way through, chosen because you are in a hurry rather than because you
 * are a beginner.
 *
 * WHAT THE MODE ACTUALLY DOES, measured rather than assumed, because the
 * first reading of the bundle here was wrong. The two modes differ by two
 * things in total:
 *
 *     left rail          14 tools in Complex, 13 in Quick edit  (no AI)
 *     inspector tabs      5 in Complex, 4 in Quick edit         (no Keyframes)
 *
 * So Quick edit already carries every basic tool: Media, Text, Transitions,
 * Effects, Emojis, Stickers, Photos, Footage, Audio, Memes, SFX, Voice
 * changer, Record yourself, and Transform/Color/Effects/Audio in the
 * inspector. The two it holds back are the two that are genuinely not basic.
 * Nothing needed adding — this file only changes what the mode is called.
 *
 * WHY A SIDECAR AND NOT THE BUNDLE. The label is a string literal inside
 * compiled build output. Editing it there works today and disappears the
 * first time anybody regenerates that file, silently, which is the worst way
 * for a change to die. Relabelling from outside survives a rebuild.
 *
 * It re-applies on re-render because React owns that button and will put its
 * own text back whenever the mode changes. An observer rather than a timer:
 * it costs nothing until the subtree actually changes.
 */
(function () {
  'use strict';
  if (window.NC_QUICKEDIT) return;

  var FROM = 'Simple';
  var TITLE_FROM = /^Simple mode/i;

  /* ---- WHAT QUICK EDIT ACTUALLY KEEPS -------------------------------------
     Thirteen of fourteen is not a simpler mode, it is the same mode with the
     AI button taken out. Quick edit now holds seven:

         Media  Text  Transitions  Effects  Emojis  Audio  Memes

     Six of those were chosen directly; Media is kept because without it
     there is no way to get a video into the editor at all, and a "simple"
     mode you cannot start a project in is not simpler, it is broken.

     HOW THEY ARE IDENTIFIED, and why it is by position. Those buttons carry
     no id, no title and no data attribute — measured, the whole element is a
     class and a text node — so the only stable handles are the label and the
     order. The label is translated into nineteen languages, which rules it
     out. The order comes from one array in the bundle and does not change
     between renders.

     Position is brittle if that array is ever edited, so it is guarded
     rather than trusted: the row must be exactly the thirteen below, in that
     order, or this does nothing at all. A rebuild that changes the panels
     gets the full rail back, which is the right way to be wrong. */
  var QUICK_ORDER = ['Media', 'Text', 'Transitions', 'Effects', 'Emojis',
                     'Stickers', 'Photos', 'Footage', 'Audio', 'Memes',
                     'SFX', 'Voice changer', 'Record yourself'];
  var QUICK_KEEP  = [0, 1, 2, 3, 4, 8, 9];
  var MODE_KEY    = 'nc_editor_mode';

  function phrase() {
    /* Through the site's own phrase layer when it is up, so the button is
       relabelled in all nineteen languages rather than pinned to English on
       a site that is not. Falls back to English, which is what it said
       before, so a missing phrase layer costs nothing. */
    try {
      if (typeof window.tr === 'function') {
        var t = window.tr('ui_qe_quick');
        if (t && t !== 'ui_qe_quick') return t;
      }
    } catch (e) {}
    return 'Quick edit';
  }

  function relabel(root) {
    var to = phrase();
    var btns = (root || document).querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      /* The label is a bare text node beside an icon, so the button's own
         text is checked rather than its innerHTML — which would match the
         icon's markup too and is how a relabel starts eating svg. */
      if (b.textContent.trim() !== FROM) continue;
      for (var j = 0; j < b.childNodes.length; j++) {
        var n = b.childNodes[j];
        if (n.nodeType === 3 && n.nodeValue.trim() === FROM) n.nodeValue = to;
      }
      if (TITLE_FROM.test(b.title || '')) {
        b.title = to + ' — the fast way through, with the fiddly bits put away';
      }
    }
  }

  function store() {
    try { return window.__ncStore || null; } catch (e) { return null; }
  }
  function mode() {
    var s = store();
    try { return s ? s.getState().mode : null; } catch (e) { return null; }
  }

  /* Hide or restore the tools Quick edit puts away. Inline display, because
     React owns these nodes' className and would fight a class. */
  function trim() {
    var nav = document.querySelector('#root nav');
    if (!nav) return;
    var btns = nav.querySelectorAll('button');
    var quick = mode() === 'simple';

    if (!quick) {                       /* full mode: everything comes back */
      for (var i = 0; i < btns.length; i++) btns[i].style.removeProperty('display');
      return;
    }
    /* The guard. Anything but the exact row this was written against and we
       leave the rail alone rather than hide the wrong seven. */
    if (btns.length !== QUICK_ORDER.length) return;

    for (var j = 0; j < btns.length; j++) {
      if (QUICK_KEEP.indexOf(j) >= 0) btns[j].style.removeProperty('display');
      else btns[j].style.setProperty('display', 'none', 'important');
    }
  }

  /* ---- QUICK EDIT IS WHERE EVERYONE STARTS --------------------------------
     The bundle opens in Complex. Somebody who has never used an editor meets
     fourteen tools and five inspector tabs before they have cut anything, so
     the default moves to the smaller one. A choice that has been made is
     remembered and never overridden — this only decides the FIRST time. */
  function defaultMode() {
    var s = store();
    if (!s) return false;
    var saved = null;
    try { saved = localStorage.getItem(MODE_KEY); } catch (e) {}
    try {
      if (saved === 'simple' || saved === 'complex') {
        if (s.getState().mode !== saved) s.getState().setMode(saved);
      } else if (s.getState().mode !== 'simple') {
        s.getState().setMode('simple');
      }
    } catch (e) { return false; }

    /* Remember what they pick from here on, so the next visit opens in it. */
    try {
      var was = s.getState().mode;
      s.subscribe(function () {
        var now = s.getState().mode;
        if (now === was) return;
        was = now;
        try { localStorage.setItem(MODE_KEY, now); } catch (e) {}
        trim();
      });
    } catch (e) {}
    return true;
  }

  function boot() {
    relabel();
    var tries = 0;
    var t = setInterval(function () {
      if (defaultMode() || tries++ > 60) clearInterval(t);
    }, 200);
    /* The rail is React's and is rebuilt on every panel change, so the trim
       rides the same observer as the relabel below. */
    trim();
    try {
      var mo = new MutationObserver(function (recs) {
        /* Only look where something actually changed. The editor re-renders
           a lot and walking the whole document each time would be a cost
           paid on every keystroke. */
        for (var i = 0; i < recs.length; i++) {
          var t = recs[i].target;
          relabel(t.nodeType === 1 ? t : document);
        }
        trim();
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.NC_QUICKEDIT = { relabel: relabel, observer: mo };
    } catch (e) { window.NC_QUICKEDIT = { relabel: relabel }; }
    /* The phrase layer swaps labels after load, and its first pass is not a
       change this observer sees, so the row is re-read once it has run. */
    window.addEventListener('nc-lang', function () { relabel(); trim(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
