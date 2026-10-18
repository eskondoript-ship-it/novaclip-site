/* ============================================================================
   NOVACLIP EDITOR — THE PHONE LAYOUT
   ============================================================================
   The editor already had phone CSS: the panels stack, the page scrolls, the
   header wraps. That made it fit. It did not make it usable, and measured at
   390x844 the difference is obvious:

       the page is 1755px tall in an 844px window
       the header alone is 234px — four wrapped rows of icon buttons
       the order down the page is  tools (371) · preview (388) ·
       properties (231) · timeline (422)

   So the video is in the middle. Touch the timeline and the preview has
   scrolled off the top; look at the preview and the timeline is off the
   bottom. Editing is watching a change and judging it, and on a phone this
   layout never let anybody do both at once. On top of that sat a duplicate
   NovaClip wordmark, a floating clip-finder pill, and the Ask card opening
   itself three seconds in over the whole thing.

   WHAT THIS DOES

   1. The preview sticks to the top of the screen. Everything else scrolls
      under it, so the picture is always there.
   2. The order becomes preview · timeline · properties · tools. The timeline
      is what a thumb touches most, so it goes directly under the picture;
      the media library is where a project starts and is rarely needed again,
      so it goes last.
   3. The header loses its duplicate wordmark and its Simple/Complex toggle
      and comes down to two rows of 44px from four of 58.
   4. The fourteen-tab rail turns from a 64px-wide column into a strip that
      scrolls sideways, which is both how a phone app does it and 64px of
      width given back to the panel.
   5. The floating clip finder goes. It is a 117px pill sitting on the
      timeline, and everything it does is in the Media tab's own search.

   HOW IT IS DONE, AND WHY THAT WAY

   All of it is CSS. The editor is a React app and moving its nodes between
   parents gets them re-inserted on the next render — so the re-ordering uses
   `display: contents` on the two wrapper divs instead, which drops their
   boxes and lets their children be ordered as one flex column. Nothing in
   the DOM is touched, nothing has to be re-applied after a render, and if
   the app's markup changes shape the worst case is that a rule stops
   matching rather than that the editor breaks.

   Goes with editor.html, which loads it. */
(function () {
  'use strict';

  /* 900px, the same breakpoint the editor's own phone block uses, because
     this layers on top of those rules rather than replacing them: loaded
     after, same specificity, so the later rule wins where they overlap. */
  var CSS = [
    '@media (max-width: 900px) {',

    /* THERE IS NO PINNED PREVIEW HERE, AND THERE WAS FOR AN HOUR.

       The obvious answer to "the picture scrolls away" is position:sticky on
       the preview, and it works — but only once nothing between it and the
       viewport clips, and on this page three things do: #root, body and html
       all carry an overflow other than visible. Freeing them pins the
       preview and then does something far worse. The app's columns have a
       min-content width of about 634px, and with nothing clipping them a
       phone browser stops laying out at 390 and lays out at 634 instead,
       zooming the whole page out to fit. Measured at a 390px device:
       innerWidth 634, the site bar 634 wide, the project button at x=473.
       A pinned preview is not worth a zoomed-out editor.

       What the order below does instead is cheaper and holds: with the
       header down to 100px the preview occupies 208-461 and the timeline
       starts at 461, so on an 844px phone the picture and the first 380px
       of the timeline are both on screen with nothing scrolled at all —
       which is the case that was actually complained about. */

    /* ---- the header: three tight rows, not four loose ones -------------- */
    /* NOTHING HERE IS SELECTED BY POSITION, AND THE FIRST VERSION WAS.
       :nth-child(4) and :nth-child(8) were written off a measurement of the
       header, and the header has a child that is not in its markup —
       editor.html injects the project button into it. So the counts were out
       by one and the rules hid the project switcher and the transport: the
       play button, on a phone, where there is no spacebar. Each rule below
       says what the thing is instead. */
    /* A second NovaClip wordmark directly under the site bar's own, which
       already carries the way back and the menu. */
    '  #root > div > header > a:first-child { display: none; }',
    /* The name field and the project button are the same name twice. The
       button keeps it — it also opens the project list, where renaming is. */
    '  #root > div > header > input { display: none; }',
    /* Simple vs Complex changes one tab out of fourteen; 180px of a 390px
       row for that. It stays on a laptop, where the row is free. */
    '  #root > div > header > div:has(> button[title^="Simple mode"]) { display: none; }',
    /* 00:00:00:00/00:00:00:00 — 218px to say what the playhead already shows. */
    '  #root > div > header > div[class*="font-mono"] { display: none; }',
    '  #root > div > header {',
    '    padding: 6px 8px; gap: 6px; row-gap: 6px;',
    '  }',
    /* THE PROJECT BUTTON WAS OFF THE SIDE OF THE SCREEN, AND WAS BEFORE ANY
       OF THIS. It is fixed-positioned and moved to the body, and its left
       comes from script rather than from the phone rule in editor.html, so
       an inline style beat that rule: measured at 390px wide, its left edge
       was at x=473 — eighty-three pixels past the right of the screen. The
       name of the project and the way into the project list, both simply
       gone on a phone. !important because the thing being overridden is an
       inline style. */
    '  #ncpj-btn {',
    '    left: auto !important; right: 8px !important; top: 58px !important;',
    '    transform: none !important; max-width: 54vw !important;',
    '  }',

    /* ---- the order down the page --------------------------------------- */
    /* Two wrappers lose their boxes so that the preview, the timeline, the
       properties panel and the tool panel become children of one column and
       can be put in the order a thumb wants them. */
    '  #root > div > div.flex-1 > .flex-col,',
    '  #root > div > div.flex-1 > .flex-col > .flex-1 { display: contents; }',

    /* 1 · the preview, first */
    /* The Editor/Photo switch floats at y63 over the top of the header, so
       it shrinks a little and moves up out of the way. */
    '  #ncpairtabs { top: 56px !important; transform: scale(.86); transform-origin: left top; }',
    '  #root > div > div.flex-1 > .flex-col > .flex-1 > :first-child {',
    '    order: 1;',
    '    height: 30vh !important; min-height: 180px !important; max-height: 42vh;',
    '    width: 100% !important; flex: 0 0 auto;',
    '  }',
    /* 2 · the timeline */
    '  #root > div > div.flex-1 > .flex-col > .shrink-0 {',
    '    order: 2; width: 100% !important; height: auto !important; min-height: 260px;',
    '  }',
    /* 3 · the properties panel.
       Named by what it is, not by its index. Written as :nth-child(2) it
       matched nothing — there is a drag handle between it and the preview —
       so it kept the default order of 0 and rendered ABOVE a preview that
       had been given order 1. The first screenful of the editor was
       "No clip selected". */
    '  #root > div > div.flex-1 > .flex-col > .flex-1 > .shrink-0 {',
    '    order: 3; width: 100% !important; max-width: none !important;',
    '    height: auto !important; min-height: 220px;',
    '  }',
    /* and the handle itself, which resizes nothing once everything is a row */
    '  #root > div > div.flex-1 > .flex-col > .flex-1 > [class*="cursor-"] { display: none; }',
    /* 4 · the media library and the tool tabs */
    '  #root > div > div.flex-1 > div:first-child {',
    '    order: 4; height: 38vh; min-height: 240px;',
    '  }',

    /* ---- the tool tabs lie down ---------------------------------------- */
    '  #root > div > div.flex-1 > div:first-child > .flex-row { flex-direction: column; }',
    /* IT WRAPS, IT DOES NOT SCROLL SIDEWAYS. The first version was one row
       that scrolled, which is the usual phone answer and was wrong here: the
       sweep caught «Text» sitting at x=380 on a 360px screen, and a tab
       nobody can see is a tab nobody presses. Two rows of seven cost 39px
       and put all fourteen on the screen at once. */
    '  #root > div > div.flex-1 > div:first-child nav {',
    '    width: 100% !important; flex-direction: row; flex-wrap: wrap;',
    '    justify-content: flex-start; align-content: flex-start;',
    '    gap: 2px; padding: 4px 6px; overflow: visible;',
    '    border-right: 0; border-bottom: 1px solid rgba(255,255,255,.08);',
    '  }',
    '  #root > div > div.flex-1 > div:first-child nav > * { flex: 1 1 13%; }',
    '  #root > div > div.flex-1 > div:first-child nav button { min-width: 44px; }',

    /* ---- the timeline's own control row -------------------------------- */
    /* Zoom, Snap and the Video/Audio/Text filters are one unwrapped row.
       Measured at 360: «Text» starts at x=380, twenty pixels past the edge.
       This was true before any of this and simply never showed up, because
       the timeline used to be the fourth thing down the page and the sweep
       only reads what is on screen. Moving it up found it. */
    '  #nc-tl-bar + div, #root .flex.items-center.gap-2.border-b {',
    '    flex-wrap: wrap; row-gap: 4px;',
    '  }',

    /* ---- floating things that sit on the work -------------------------- */
    '  #nccf-launch { display: none !important; }',

    /* Captions, Beats and Reframe are three separately-written buttons that
       each pick their own left offset — 18px, 140px, 240px — which on a
       laptop is a tidy row and on a 390px phone is three blobs ending 46px
       from the edge, on top of whatever is under them. Thirds of the width
       makes them one bar, which is what they always were. */
    '  .nccap-btn, .ncbeat-btn, .ncrf-btn {',
    '    bottom: 8px !important; height: 38px; padding: 0 6px !important;',
    '    width: calc((100vw - 24px) / 3); text-align: center;',
    '    font-size: 12px !important; overflow: hidden; white-space: nowrap;',
    '  }',
    '  .nccap-btn { left: 8px !important; }',
    '  .ncbeat-btn { left: calc(8px + (100vw - 24px) / 3 + 4px) !important; }',
    '  .ncrf-btn { left: calc(8px + 2 * ((100vw - 24px) / 3 + 4px)) !important; }',
    /* and Help steps up a row rather than sitting on top of Reframe */
    '  #nchq-btn { bottom: 54px !important; right: 10px !important; height: 38px; }',
    /* the trial message steps up past both of them. It is already pointer-
       transparent, so this is about reading it, not about reaching it. */
    '  #nctrialbar { bottom: 102px !important; }',

    '}'
  ].join('\n');

  function inject() {
    if (document.getElementById('ncphone')) return;
    var s = document.createElement('style');
    s.id = 'ncphone';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  /* Nothing below runs on a laptop. */
  var phone = false;
  try { phone = window.matchMedia('(max-width: 900px)').matches; } catch (e) {}
  if (!phone) return;

  /* There was a scroll-to-the-preview here and it has been taken out. With
     the header down to three tight rows the preview already ends around
     485px of an 844px screen, so there was nothing to scroll to — and a page
     that moves under you a second and a half after it loads is the kind of
     tidying that reads as a fault. Measured: site bar 52 + header 132 +
     preview 253. */
  void phone;
}());
