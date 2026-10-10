/* ============================================================================
   NOVACLIP — THE EXPORT IS THE JOB
   ============================================================================
   Two things were wrong and they were the same thing.

   NOTHING RECORDED AN EXPORT. Every certificate on this site asks for
   edit_export — three of them for Basic, ten for Advanced, twenty-five for
   Master — and no file anywhere called logSkill('edit_export'). The only
   mention of logSkill in editor.html is inside the text of a warning message.
   So the requirement at the centre of the whole credential could not be met
   by doing the thing it names, and nobody would ever have found out except by
   exporting twenty-five videos and watching the counter stay at zero.

   AND EXPORTING PAID NOTHING, while a round of a reaction game paid five. The
   coins were easiest to get from the part of the site that makes nothing.

   This fixes both at the point where a video actually lands on somebody's
   disk: the editor hands the file over by clicking an anchor with a download
   attribute, so that is what is watched. Not the button — a button can be
   pressed and the export can still fail, and paying for a press rather than a
   file is how you teach somebody to press buttons.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncEarnHook) return;
  window.__ncEarnHook = 1;

  var PER_EXPORT = 30;          /* before the daily policy in nova.js */
  var LAST = 0;

  function reward(name) {
    /* One export can produce one download; a double-click should not pay
       twice, and three seconds is longer than any double-click. */
    var now = Date.now();
    if (now - LAST < 3000) return;
    LAST = now;
    try { if (typeof window.logSkill === 'function') window.logSkill('edit_export'); } catch (e) {}
    try { if (typeof window.addPts === 'function') window.addPts(PER_EXPORT, 'edit'); } catch (e) {}
  }

  var VIDEO = /\.(mp4|webm|mov|m4v)$/i;

  /* Patched on the prototype rather than listened for on the document: the
     bundle makes an anchor, sets download, and calls click() on it without
     ever putting it in the page, so a document listener never sees it. */
  var realClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    try {
      var d = this.getAttribute && this.getAttribute('download');
      if (d && VIDEO.test(d)) reward(d);
    } catch (e) {}
    return realClick.apply(this, arguments);
  };

  /* And the ordinary case, for anything that does put the link in the page. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[download]');
    if (!a) return;
    var d = a.getAttribute('download') || '';
    if (VIDEO.test(d)) reward(d);
  }, true);

  window.NC_EARN_HOOK = { reward: reward, perExport: PER_EXPORT };
})();
