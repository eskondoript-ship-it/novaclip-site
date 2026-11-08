/* NOVACLIP — THE FX LIBRARY BELONGS IN THE LEFT COLUMN, NOT OVER THE VIDEO
 * ===========================================================================
 * Asked for, with gl-transitions.com as the reference: pick a transition and
 * edit it down the left-hand side, with the picture to the right. What was
 * there instead was a floating dialog pinned over the middle of the editor,
 * covering the preview it was previewing against.
 *
 * It was also too small to use, and that was measurable rather than a matter
 * of taste. The dialog is capped at min(74vh, 660px) and its header — title,
 * blurb, two tabs, a search box and up to sixteen category chips — takes most
 * of that. Measured on a 1500x900 window: panel 388px tall, GRID 127px. A
 * tile is 107px. One row visible, eighty-one scrolled out of sight, which is
 * exactly what "I can't see the previews" looks like from the other side.
 *
 * The editor's left column is 283 x 498 and already owns this job: Media,
 * Text, Effects and the rest all render there. Putting the library in it
 * gives the grid roughly three times the height and stops it covering the
 * preview.
 *
 * ---------------------------------------------------------------------------
 * MOVED, NOT REBUILT
 * ---------------------------------------------------------------------------
 * The dialog already has everything — live tiles running the real transition,
 * search, categories, the two tabs, the gear, the parameter and timing
 * editor. Rebuilding that in a new container would mean maintaining two of
 * it and losing whichever features I forgot. So the element is adopted into
 * the left column and restyled from `position:fixed` to filling its parent.
 * editor-trans.js keeps owning what is inside it and does not know this
 * happened.
 *
 * React owns that column and rerenders it. The panel is therefore put back
 * whenever it is found orphaned, and React's own panel content is hidden
 * rather than removed — removing children of a node React is managing is how
 * you get a blank panel and an exception on its next update.
 * ===========================================================================
 */
(function () {
  'use strict';
  if (window.NC_FX_DOCK) return;

  var CSS = [
    /* Fill the column instead of floating. Every one of these overrides a
       rule in editor-trans.js's own stylesheet, so they carry !important —
       not from habit, but because both rules have the same specificity and
       load order decides, and load order here is whichever file the service
       worker happened to serve first. */
    '.nctr.ncdock{position:absolute !important;inset:0 !important;',
      'left:0 !important;bottom:auto !important;width:auto !important;',
      'max-height:none !important;height:100% !important;border-radius:0 !important;',
      'border:0 !important;border-right:1px solid rgba(255,255,255,.07) !important;',
      'box-shadow:none !important;z-index:5 !important}',
    /* The header is the thing that was eating the grid. In a column this
       narrow the blurb is three lines of text nobody reads twice. */
    '.nctr.ncdock .hd{padding:10px 12px 8px !important}',
    '.nctr.ncdock .hd h4{font-size:.95rem !important}',
    '.nctr.ncdock .hd .sub{display:none !important}',
    '.nctr.ncdock .cats{gap:4px !important;margin-top:7px !important}',
    '.nctr.ncdock .cats .cat{padding:3px 7px !important;font-size:9.5px !important}',
    '.nctr.ncdock .q{margin-top:7px !important;padding:7px 9px !important;font-size:11.5px !important}',
    /* ---- THE COLUMN IS WIDER WHILE THE LIBRARY IS IN IT -----------------
       283px is enough for a media list and not enough for a grid of video
       previews. The column is flex-1 inside a flex row, so a min-width
       widens it and the preview keeps the rest. */
    '.ncdock-host{min-width:min(420px,32vw) !important}',
    /* Two columns when there is room for two, one when there is not. */
    '.nctr.ncdock .grid{grid-template-columns:repeat(auto-fill,minmax(168px,1fr)) !important;',
      'gap:9px !important;padding:9px 11px 12px !important;',
      'flex:1 1 auto !important;min-height:0 !important;overflow-y:auto !important}',
    /* The tile collapse is fixed at source in editor-trans.js with
       align-self:start — display:block and aspect-ratio were both tried
       here first and neither moved it off 3px. */
    '.nctr.ncdock .ft{padding:8px 12px !important;font-size:10.5px !important}',
    /* ---- THE EDITOR FILLS THE COLUMN, AND THAT IS THE REFERENCE ---------
       I tried it as a bottom section first, so the library stayed visible
       while you adjusted. It measured badly and, more to the point, it is
       not what was asked for. The reference has ONLY "transition
       parameters" and "timing" down its left side — no list of transitions
       beside them. Splitting a 283px column between a grid and a full
       editor gave the grid 70px, which is less than one 107px tile, and
       took room from the controls at the same time. Both halves worse.

       So the editor takes the column, with Back returning to the grid. */
    '.nctr.ncdock .ncfe-prev{max-width:100% !important}',
    '.nctr.ncdock .ncfe-bd{padding:9px 12px !important;gap:10px !important}',
    '.nctr.ncdock .ncfe-hd{padding:8px 12px !important}',
    '.nctr.ncdock .ncfe-ft{padding:8px 12px !important}',
    /* A column this narrow cannot carry a 78px label, a slider and a readout
       on one line without the slider becoming a stub. */
    '.nctr.ncdock .ncfe-row{grid-template-columns:62px 1fr 34px !important;gap:6px !important}',
    '.nctr.ncdock .ncfe-row label{font-size:10px !important}',
    '.nctr.ncdock .ncfe{position:absolute !important;inset:0 !important;',
      'border-radius:0 !important}',
    /* React's own panel for whichever rail item is lit, hidden while ours is
       up. Hidden, not removed: React is managing those nodes. */
    '.ncdock-host > *:not(.nctr){visibility:hidden !important}',
    '.ncdock-host{position:relative !important}'
  ].join('');

  function css() {
    if (document.getElementById('ncdock-css')) return;
    var s = document.createElement('style');
    s.id = 'ncdock-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function column() {
    var nav = document.querySelector('#root nav');
    if (!nav) return null;
    var c = nav.nextElementSibling;
    /* Sanity-check it rather than trusting position: a rebuild could put
       something else next to the rail, and docking into the wrong element
       would put the library somewhere strange rather than fail loudly. */
    if (!c || c.tagName !== 'DIV') return null;
    var r = c.getBoundingClientRect();
    if (r.width < 120 || r.height < 160) return null;
    return c;
  }

  function dock() {
    var panel = document.querySelector('.nctr');
    if (!panel) { undock(); return false; }
    var col = column();
    if (!col) return false;
    css();
    if (panel.parentElement === col && panel.classList.contains('ncdock')) return true;
    col.classList.add('ncdock-host');
    panel.classList.add('ncdock');
    col.appendChild(panel);
    return true;
  }

  function undock() {
    var hosts = document.querySelectorAll('.ncdock-host');
    for (var i = 0; i < hosts.length; i++) hosts[i].classList.remove('ncdock-host');
  }

  window.NC_FX_DOCK = { dock: dock, undock: undock, column: column };

  /* Same shape as editor-rail.js and for the same reason: one run per frame
     at most, and a run that finds nothing to do is two queries. Running this
     straight from the observer is what hung the editor once already. */
  var queued = 0;
  function schedule() {
    if (queued) return;
    queued = requestAnimationFrame(function () { queued = 0; dock(); });
  }

  try {
    var mo = new MutationObserver(schedule);
    var start = function () {
      mo.observe(document.body, { childList: true, subtree: true });
      schedule();
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  } catch (e) {}

  window.addEventListener('resize', schedule);
})();
