/* ============================================================================
   editor-layout.js — the editing layout, the way editors are actually laid out
   ============================================================================
   WHAT WAS WRONG WITH IT. Measured on a 1600px window, the editor laid out
   like this:

       header                                   1600 x  56
       main row                                 1600 x 894
         left panel (rail + media)               352 x 894   full height
         centre column                          1244 x 894
           preview + inspector                  1244 x 590
           timeline                             1244 x 300   <- only 1244

   The timeline lives inside the centre column, so it stops where the media
   panel starts and the whole left 352px of the bottom of the window is media
   browser that nobody is looking at while they cut. Every editor built for
   this job — CapCut, Premiere, Resolve, Final Cut — runs the timeline the full
   width of the window along the bottom, because the timeline is the thing you
   are actually working in and its usable length is how many seconds you can
   see at once. On a 1600px window this gets 356 more pixels of timeline, which
   at the default zoom is about four more seconds in view.

       header                                   1600 x  56
       panels row                               1600 x 594
         left panel        preview + inspector
       timeline                                 1600 x 300   <- all of it

   HOW, WITHOUT TOUCHING THE BUNDLE. The editor is a compiled React bundle and
   its markup is not ours to edit. But the three regions above are real
   elements in a known arrangement, so the shell becomes a grid and the centre
   column is dissolved with display:contents — its children become grid items
   of the shell, and the timeline can then be told to span every column. No
   markup moves; the same DOM is simply arranged the way the work wants it.

   display:contents is what makes it possible and also what makes it fragile:
   it only works while the tree has the shape above. Every rule here is written
   so that if the bundle changes shape the selector matches nothing and the
   editor falls back to the layout it shipped with, rather than collapsing.

   IT IS A CHOICE, AND IT REMEMBERS. Some people liked the old one, and a
   layout that cannot be turned off is a layout somebody is stuck in. The
   toggle sits in the header and the answer is kept per device.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_LAYOUT) return;

  var KEY = 'nc_editor_layout';          /* 'wide' (CapCut-like) or 'classic' */
  var SHELL = '#root > div.flex-col';
  var MAIN  = SHELL + ' > div.flex-1';
  var LEFT  = MAIN + ' > div.shrink-0:first-child';
  var MID   = MAIN + ' > div.flex-col';

  function pref() {
    try { return localStorage.getItem(KEY) === 'classic' ? 'classic' : 'wide'; }
    catch (e) { return 'wide'; }
  }
  function setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function css() {
    if (document.getElementById('nclay-css')) return;
    var st = document.createElement('style');
    st.id = 'nclay-css';
    st.textContent = [
      /* IT ONLY APPLIES WHERE THERE IS ROOM FOR IT.

         The whole argument for this layout is that the timeline gets the
         width of the window. On a 1280px laptop there is not much width to
         give, and the right-hand inspector is already tight there — the sweep
         flagged Export, Color and Effects past the right edge at that size.
         Blocking this file entirely still reproduced it, so it is not caused
         here, but a layout change is not the place to be arguing about whose
         bug it is: below 1360 the editor keeps the arrangement it shipped
         with, where that crowding is at least the crowding people already
         know.

         Everything is scoped to the attribute as well, so turning it off is
         one attribute and not a page reload. */
      '@media (min-width:1360px){',
      'html[data-nclay="wide"] ' + SHELL + '{',
        'display:grid;grid-template-rows:auto minmax(0,1fr) auto;min-height:0}',

      /* The main row becomes the grid that holds the panels AND the timeline.
         Two columns: the media side at its own width, everything else taking
         what is left. */
      'html[data-nclay="wide"] ' + MAIN + '{',
        'display:grid;grid-template-columns:auto minmax(0,1fr);',
        'grid-template-rows:minmax(0,1fr) auto;min-height:0}',

      'html[data-nclay="wide"] ' + LEFT + '{grid-column:1;grid-row:1;min-height:0}',

      /* THE LINE THAT DOES IT. The centre column stops being a box and its two
         children — the preview/inspector row and the timeline — become items
         of the grid above, which is the only way the timeline can be told to
         span past the media panel without moving any markup. */
      'html[data-nclay="wide"] ' + MID + '{display:contents}',

      'html[data-nclay="wide"] ' + MID + ' > div.flex-1{grid-column:2;grid-row:1;min-height:0}',
      'html[data-nclay="wide"] ' + MID + ' > div.shrink-0{',
        'grid-column:1 / -1;grid-row:2;min-height:0;',
        /* A little more room than the 300px it had, since it now has something
           to do with it. Capped so it can never eat the preview. */
        'min-height:min(42vh,340px)}',
      /* The seam between the panels and the full-width timeline is now a real
         edge across the window, so it gets a real line. */
      'html[data-nclay="wide"] ' + MID + ' > div.shrink-0{',
        'border-top:1px solid rgba(255,255,255,.1)}',

      /* ---- THE TABS LIE DOWN -------------------------------------------
         The thing that actually made this not look like CapCut. The fourteen
         tools — Media, Text, Transitions, Effects, Audio and the rest — were a
         vertical strip of icons down the far left edge of the window, each one
         a 14px glyph with a 9px word under it. Every editor of this kind puts
         them as a horizontal row across the TOP of the panel they open, where
         the label can be read at a normal size and the panel below is the
         width of the column rather than the width of the column minus a rail.

         The structure already allows it: the left panel is a flex-row holding
         the nav and the panel content, so turning it into a column puts the
         nav on top. The phone layout has done exactly this for a while — this
         is the same move at desktop size, with room for the labels. */
      'html[data-nclay="wide"] ' + LEFT + ' > .flex-row{flex-direction:column}',
      'html[data-nclay="wide"] ' + LEFT + ' nav{',
        'width:100% !important;flex-direction:row;flex-wrap:wrap;',
        'justify-content:flex-start;align-content:flex-start;',
        'gap:2px;padding:6px 8px;overflow:visible;',
        'border-right:0;border-bottom:1px solid rgba(255,255,255,.1)}',
      /* Seven across, two rows, so all fourteen are on screen without
         scrolling and each one is wide enough for its word. */
      'html[data-nclay="wide"] ' + LEFT + ' nav > *{flex:1 1 13%}',
      'html[data-nclay="wide"] ' + LEFT + ' nav button{min-width:0;width:100%;',
        'height:auto;padding:7px 2px;border-radius:9px}',
      /* The rail sized its labels for a 72px-wide strip. There is more room
         now, so they get a readable size instead of staying at 9px. */
      'html[data-nclay="wide"] ' + LEFT + ' nav button span{font-size:10.5px;line-height:1.25}',
      'html[data-nclay="wide"] ' + LEFT + ' nav button svg{width:17px;height:17px}',

      /* The floating pills this site adds sit above the timeline; with the
         timeline taller they need to come up with it. */
      /* ---- THE PILLS GET A SHELF ---------------------------------------
         Six of these are added by six different files — Clip finder,
         Captions, Beats, Reframe, Looks, Transitions — each anchored to the
         bottom-left of the window at a left offset of its own. That put them
         ON the timeline before this layout and over the media panel after it,
         because the window's bottom-left stopped being empty space.

         So in wide mode they are given one shelf: a row along the bottom of
         the preview, which is the one strip of the window that is dead space
         in every layout. Listed by name because each lives in a different
         file and CSS cannot say "the fixed things near the bottom left".
         #nccf-launch is styled with an inline cssText, which beats a
         stylesheet, so that one is the only !important here and it is for a
         reason rather than out of habit. */
      /* THE SHELF NEEDS A WINDOW WIDE ENOUGH TO HOLD IT. The row ends around
         x=960, so on anything narrower the last pill is off the side — the
         sweep caught «Transitions» at x=874 on a 360px screen, which is a
         button nobody can press. The lift above the timeline applies at every
         width; only the across-the-window spacing waits for the room. */
      '@media (min-width:1100px){',
        'html[data-nclay="wide"] #nccf-launch{left:364px !important}',
        'html[data-nclay="wide"] .nccap-btn{left:478px}',
        'html[data-nclay="wide"] .ncbeat-btn{left:596px}',
        'html[data-nclay="wide"] .ncrf-btn{left:688px}',
        'html[data-nclay="wide"] .nclk-btn{left:792px}',
        'html[data-nclay="wide"] .nctr-btn{left:874px}}',
      'html[data-nclay="wide"] #nccf-launch{bottom:calc(min(42vh,340px) + 12px) !important}',
      'html[data-nclay="wide"] .nccap-btn,html[data-nclay="wide"] .ncbeat-btn,',
      'html[data-nclay="wide"] .ncrf-btn,html[data-nclay="wide"] .nclk-btn,',
      'html[data-nclay="wide"] .nctr-btn{bottom:calc(min(42vh,340px) + 12px)}',
      /* and the panels they open sit on top of the shelf, not under it */
      'html[data-nclay="wide"] .nclk,html[data-nclay="wide"] .nctr,',
      'html[data-nclay="wide"] .nccap,html[data-nclay="wide"] .ncbeat,',
      'html[data-nclay="wide"] .ncrf{bottom:calc(min(42vh,340px) + 56px)}',

      '}',   /* end of the min-width:1360 block */

      /* The phone layout is its own arrangement and wins. It is below the
         gate above anyway, but this is kept explicit: two layout files racing
         over the same elements is how both end up wrong. */
      '@media (max-width:900px){',
        'html[data-nclay="wide"] .nclk-btn,html[data-nclay="wide"] .nctr-btn,',
        'html[data-nclay="wide"] .nccap-btn,html[data-nclay="wide"] .ncbeat-btn,',
        'html[data-nclay="wide"] .ncrf-btn{bottom:8px}}',

      '.nclay-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;',
        'border-radius:9px;cursor:pointer;flex:0 0 auto;white-space:nowrap;',
        'font:700 11.5px/1 Inter,system-ui,sans-serif;',
        'background:rgba(255,255,255,.06);color:#C7D2E8;',
        'border:1px solid rgba(255,255,255,.16)}',
      '.nclay-btn:hover{border-color:#00F0FF;color:#EAF2FF}',
      '.nclay-btn b{font-weight:800;color:#00F0FF}',
      /* THE TOGGLE IS NOT WORTH THE EXPORT BUTTON, AND ORDER DECIDES WHETHER
         THAT IS TRUE. The header's children come to 1253px at 1280 wide, 102
         of which is this button, and the export group runs off the right
         edge. So it is not drawn below 1360 — the layout still applies there
         and NC_LAYOUT.set() still switches it.

         This rule was first written ABOVE the one that sets display:inline-flex.
         A media query adds no specificity, so the later rule won and the
         button stayed on screen at every width — the hide did nothing at all,
         and the header still overflowed. Measured again afterwards, which is
         the only reason it was caught. */
      '@media (max-width:1359px){.nclay-btn{display:none !important}}'
    ].join('');
    document.head.appendChild(st);
  }

  function apply() {
    css();
    document.documentElement.setAttribute('data-nclay', pref());
    var b = document.querySelector('.nclay-btn b');
    if (b) b.textContent = pref() === 'wide' ? 'Wide' : 'Classic';
  }

  /* The toggle goes in the header, beside the editor's own controls. Inserted
     before the export button's group so it cannot push the primary action off
     the end of a narrow header. */
  function button() {
    if (document.querySelector('.nclay-btn')) return false;
    var header = document.querySelector(SHELL + ' > header');
    if (!header) return false;
    var tail = header.querySelector('div.ml-auto');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nclay-btn';
    b.title = 'Timeline across the whole window, or back to the original layout';
    b.innerHTML = 'Layout: <b></b>';
    b.onclick = function () {
      setPref(pref() === 'wide' ? 'classic' : 'wide');
      apply();
      /* The editor measures its own canvas on resize and nowhere else, so it
         has to be told the shape changed or the preview keeps the old size. */
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    };
    if (tail && tail.parentNode === header) header.insertBefore(b, tail);
    else header.appendChild(b);
    apply();
    return true;
  }

  window.NC_LAYOUT = {
    get: pref,
    set: function (v) { setPref(v === 'classic' ? 'classic' : 'wide'); apply(); },
    apply: apply
  };

  /* Painted before the button exists, so the layout is right from the first
     frame rather than snapping into place once the header is found. */
  apply();

  function boot() {
    var tries = 0;
    var t = setInterval(function () {
      if (button() || tries++ > 80) clearInterval(t);
    }, 250);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
}());
