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

  function boot() {
    relabel();
    try {
      var mo = new MutationObserver(function (recs) {
        /* Only look where something actually changed. The editor re-renders
           a lot and walking the whole document each time would be a cost
           paid on every keystroke. */
        for (var i = 0; i < recs.length; i++) {
          var t = recs[i].target;
          relabel(t.nodeType === 1 ? t : document);
        }
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.NC_QUICKEDIT = { relabel: relabel, observer: mo };
    } catch (e) { window.NC_QUICKEDIT = { relabel: relabel }; }
    /* The phrase layer swaps labels after load, and its first pass is not a
       change this observer sees, so the row is re-read once it has run. */
    window.addEventListener('nc-lang', function () { relabel(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
