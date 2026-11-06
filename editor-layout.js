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

  var KEY = 'nc_editor_layout';   /* 'studio' | 'wide' (CapCut-like) | 'classic' */
  var SHELL = '#root > div.flex-col';
  var MAIN  = SHELL + ' > div.flex-1';
  var LEFT  = MAIN + ' > div.shrink-0:first-child';
  var MID   = MAIN + ' > div.flex-col';
  var PROW  = MID + ' > div.flex-1';        /* preview | handle | inspector */

  /* The five floating tool pills, each created by a different file. Declared
     up here with the other selectors because css() reads it: it used to be
     assigned halfway down, which happened to be before the first apply() and
     so happened to work — a load-order coincidence, not a guarantee. */
  var PILLS = '.nccap-btn,.ncbeat-btn,.ncrf-btn,.nclk-btn,.nctr-btn';

  var ORDER = ['studio', 'wide', 'classic'];
  var NAMES = { studio: 'Studio', wide: 'Wide', classic: 'Classic' };

  /* STUDIO IS THE DEFAULT, AND ONLY FOR SOMEBODY WHO HAS NOT CHOSEN.
     An empty key means a person who never touched the toggle, so they get the
     new arrangement. A key that says 'wide' is somebody who picked wide back
     when wide was the default and the button said so — changing that under
     them is how a preference stops meaning anything. */
  function pref() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) >= 0 ? v : 'studio';
    } catch (e) { return 'studio'; }
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
      /* THE FLOOR WAS 1360 AND THAT WAS TOO HIGH.
         It was set there because at 1280 the header's export group runs off
         the right edge — but blocking this whole file still reproduced that,
         so it was never this layout's bug, and the floor was treating it as
         if it were. The effect was that a 1280 laptop got the shipped layout
         and no toggle, which from the outside looks exactly like the feature
         not existing. Reported as "the capcut layout is still not on the
         editor", and measured: at 1280 the timeline came out 994px with the
         nav back in a vertical strip.

         1280 is also where the argument for this layout is strongest. The
         timeline goes from 994px to the full 1280 — 286 more pixels, about
         three more seconds in view at the default zoom, on the size of screen
         that can least afford to lose them.

         Still a floor rather than none: under 1280 the panels genuinely do
         not fit beside each other and the phone layout is the right one. */
      '@media (min-width:1280px){',
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
      /* SEVEN ACROSS WAS A MEASUREMENT OF ENGLISH.
         13% of a 350px nav is 46px, which fits "Text" and "Audio" and does not
         fit "Transições" (58px), "Alterador de voz" (49px) or "Adesivos"
         (48px). Reported from a Portuguese screenshot where the labels were
         printing straight through each other, and measured after: every one of
         the fourteen boxes was 46px wide with text needing up to 58.

         Five across at 20% gives 64px, and the label is now allowed to wrap
         onto a second line instead of running out of its box — which is what
         makes this hold in languages nobody has measured yet. German and
         Portuguese are the long ones; wrapping costs a row of height and
         removes the whole class of bug. */
      'html[data-nclay="wide"] ' + LEFT + ' nav > *{flex:1 1 20%}',
      'html[data-nclay="wide"] ' + LEFT + ' nav button{min-width:0;width:100%;',
        'height:auto;padding:7px 3px;border-radius:9px}',
      /* The rail sized its labels for a 72px-wide strip. There is more room
         now, so they get a readable size instead of staying at 9px. */
      /* The label wraps rather than overflowing. The rail sized these for a
         72px strip and nowrap was safe there because the words were English;
         it is not safe for a word that is half again as long. overflow-wrap
         rather than word-break so it splits between words first and only
         breaks inside one when a single word genuinely cannot fit. */
      'html[data-nclay="wide"] ' + LEFT + ' nav button span{font-size:10.5px;line-height:1.2;',
        'white-space:normal;overflow-wrap:anywhere;hyphens:auto;display:block;max-width:100%}',
      'html[data-nclay="wide"] ' + LEFT + ' nav button svg{width:17px;height:17px}',

      /* ---- THE TRANSPORT GOES UNDER THE PLAYER -------------------------
         The last thing that still read as "not CapCut". Play, jump-to-start,
         jump-to-end and the timecode were up in the top bar with the project
         name and the export button — which is where a document app puts its
         chrome, not where a video app puts its transport. Every editor of
         this kind has them directly beneath the picture, centred, because
         that is where your eye already is while you scrub.

         Moved with position:fixed rather than by relocating the nodes. The
         header is React's and its children are reconciled on every render;
         taking them out of the DOM is how a bundle starts putting them back
         in the wrong place or losing them. Out of flow, they leave the header
         with room to spare — which is also why the Export button stopped
         being pushed off the edge.

         :has() is what tells the two identical "flex items-center gap-1"
         groups apart — one holds Undo/Redo/Save, the other holds the
         transport, and they are indistinguishable by class alone. */
      'html[data-nclay="wide"] ' + SHELL + ' > header > div:has(> button[title^="Play/Pause"]){',
        'position:fixed;z-index:60;left:calc(352px + (100vw - 352px) / 2);',
        'transform:translateX(-50%);',
        'bottom:calc(min(42vh,340px) + 58px);',
        'background:rgba(10,13,24,.82);backdrop-filter:blur(10px);',
        'border:1px solid rgba(255,255,255,.12);border-radius:999px;',
        'padding:4px 8px;gap:4px}',
      'html[data-nclay="wide"] ' + SHELL + ' > header > div[class*="font-mono"]{',
        'position:fixed;z-index:60;left:calc(352px + (100vw - 352px) / 2);',
        'transform:translateX(-50%);',
        'bottom:calc(min(42vh,340px) + 20px);',
        'margin:0;font-size:12px;opacity:.85;',
        'background:rgba(10,13,24,.72);border-radius:999px;padding:3px 12px}',
      /* The divider that used to sit beside the transport now separates
         nothing, so it goes. */
      'html[data-nclay="wide"] ' + SHELL + ' > header > div.w-px:last-of-type{display:none}',

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
      'html[data-nclay="wide"] #nccf-launch{bottom:calc(min(42vh,340px) + 104px) !important}',
      'html[data-nclay="wide"] .nccap-btn,html[data-nclay="wide"] .ncbeat-btn,',
      'html[data-nclay="wide"] .ncrf-btn,html[data-nclay="wide"] .nclk-btn,',
      'html[data-nclay="wide"] .nctr-btn{bottom:calc(min(42vh,340px) + 104px)}',
      /* and the panels they open sit on top of the shelf, not under it */
      'html[data-nclay="wide"] .nclk,html[data-nclay="wide"] .nctr,',
      'html[data-nclay="wide"] .nccap,html[data-nclay="wide"] .ncbeat,',
      'html[data-nclay="wide"] .ncrf{bottom:calc(min(42vh,340px) + 56px);',
        /* AND A CEILING, OR THEY GO THROUGH IT.
           These panels carry their own max-height — 660px for the browsers —
           chosen before the timeline took 340px off the bottom of the window.
           Measured with the browser open at 1040px tall: the panel's top came
           out at -16, sixteen pixels above the screen.

           The part that made it worth chasing is what it did to the tiles.
           A panel that does not fit does not scroll, so its grid never
           overflowed, so every one of the forty-four previews counted as
           on-screen and was redrawn on every pass — the culling added to stop
           exactly that was culling nothing. Two bugs wearing each other's
           clothes: the layout fault hid the performance fault.

           The ceiling is the window minus the timeline, minus the header, so
           the panel always ends below the top bar and its grid scrolls. */
        'max-height:calc(100vh - min(42vh,340px) - 172px)}',

      '}',   /* end of the min-width:1360 block */

      /* ====================================================================
         STUDIO — the browser is the workbench, the player sits beside it
         ====================================================================
         Asked for from a Filmora screenshot. The thing that makes that window
         read the way it does is the share of it each region gets, measured
         off the screenshot at 1166px wide:

             browser (categories + grid)   0 .. 725     62%
             player                      725 .. 1166    38%
             timeline                    full width along the bottom

         Wide already puts the timeline across the bottom and the tabs along
         the top. What it does not do is give the browser any room: it is
         352px of a 1600px window, 22%, because that panel started life as a
         drawer you opened to drag one file out of. Anything you pick FROM a
         library — an effect, a transition, a sticker, a title — you pick by
         looking at forty of them, and forty thumbnails do not go in 352px.
         Measured in wide at 1600: the panel's grid is three tiles across.
         Here it is eight.

         Built as an extra attribute rather than a third value of data-nclay,
         so every rule above still matches and studio is wide plus a handful
         of overrides. One attribute, nothing re-specified, and no chance of
         the two arrangements disagreeing about the parts they share.

         WHAT HAD TO GIVE. Taking the browser to 62% leaves 608px at 1600 for
         what is currently preview AND inspector side by side. The inspector
         is 368 of those, which would leave the picture 240px wide — so in
         this layout the right-hand column stacks: player on top, inspector
         beneath it. That is also where Filmora keeps its properties, and it
         means nothing is lost, only moved.

         52vw rather than the 62% off the screenshot. 62% of a 1366 laptop is
         847px of browser and 519 for the picture, and the picture is still
         the thing being judged. 52vw gives the browser six tiles across at
         1366 and keeps the player above 650. Clamped at both ends: never so
         narrow the grid is pointless, never so wide the player is a stamp. */
      'html[data-ncstudio]{--ncb:clamp(420px,52vw,980px)}',

      '@media (min-width:1280px){',

      /* the browser takes the floor */
      'html[data-ncstudio] ' + LEFT + '{width:var(--ncb) !important;',
        'max-width:none !important;flex-basis:var(--ncb) !important}',
      'html[data-ncstudio] ' + LEFT + ' > .flex-row{width:100% !important}',

      /* THE TABS STOP BEING FIFTHS. Wide gives each tab flex:1 1 20% because
         it is dividing 352px and five across is what fits a word. Across
         980px that same rule makes each tab 196px of mostly empty space, in
         three rows. Here they size to their own labels and flow as one row,
         which is the row the screenshot has — and still wrap on their own if
         a translation needs them to, rather than because a percentage said
         so. */
      'html[data-ncstudio] ' + LEFT + ' nav > *{flex:0 0 auto}',
      'html[data-ncstudio] ' + LEFT + ' nav button{min-width:76px;width:auto;',
        'padding:7px 11px}',
      'html[data-ncstudio] ' + LEFT + ' nav button span{font-size:11px}',

      /* right column: player over inspector */
      'html[data-ncstudio] ' + PROW + '{flex-direction:column}',
      'html[data-ncstudio] ' + PROW + ' > div.flex-1{min-height:0}',
      /* The drag handle set a WIDTH between two columns. There are no two
         columns here, and a col-resize grip lying on its side that moves the
         wrong axis is worse than no grip, so it goes. */
      'html[data-ncstudio] ' + PROW + ' > div.w-1{display:none}',
      'html[data-ncstudio] ' + PROW + ' > div.min-w-0.shrink-0{',
        'width:100% !important;max-width:none !important;height:auto !important;',
        'max-height:38%;overflow:auto;',
        'border-top:1px solid rgba(255,255,255,.1)}',

      /* The transport is fixed to the centre of the picture, and the picture
         no longer starts at 352. Same sum, with the browser's width in it. */
      'html[data-ncstudio] ' + SHELL + ' > header > div:has(> button[title^="Play/Pause"]),',
      'html[data-ncstudio] ' + SHELL + ' > header > div[class*="font-mono"]{',
        'left:calc(var(--ncb) + (100vw - var(--ncb)) / 2)}',

      /* AND IT HAS TO CLEAR THE INSPECTOR NOW.
         Wide lifts the transport to just above the timeline, because in wide
         the bottom of the picture is dead space. In studio it is not: the
         inspector sits there, and the first build put the play button and the
         timecode straight on top of "No clip selected".

         So the lift gains the inspector's height. It cannot be written as a
         constant — the inspector is content-height up to a 38% cap, so it is
         204px with a clip selected and less without — and CSS cannot measure
         a sibling. A ResizeObserver keeps --ncinsp honest instead, which
         costs one number per resize and is the only way this stays right
         while the panel changes size under it. */
      'html[data-ncstudio] ' + SHELL + ' > header > div:has(> button[title^="Play/Pause"]){',
        'bottom:calc(var(--ncinsp,0px) + min(42vh,340px) + 52px)}',
      'html[data-ncstudio] ' + SHELL + ' > header > div[class*="font-mono"]{',
        'bottom:calc(var(--ncinsp,0px) + min(42vh,340px) + 16px)}',

      '}',   /* end of studio */

      /* ---- BELOW 1280, WHERE NEITHER GRID APPLIES ----------------------
         Studio and wide both start at 1280; under that the editor falls back
         to the arrangement it shipped with, and that arrangement's header
         does not fit. Measured at 1100: Split, Duplicate, Delete, Project
         settings and Export all sit past the right edge, Export by 268px —
         not clipped, unreachable.

         This is not new and it is not caused here: wide has done the same
         thing for as long as it has existed, and it was the default, so this
         is what that window size has always been. But it is the DEFAULT's
         problem now, and the same treatment classic already carries fixes
         it, so it stops being a comment and becomes two rules.

         Kept to max-width:1279 on purpose. Classic's copy of this is
         unscoped because classic crowds at every size; wide and studio only
         crowd below their own floor, and the 10ch cap on the project name is
         not something to inflict on a 1920 window that has room for it. */
      '@media (max-width:1279px){',
        'html[data-nclay="wide"] ' + SHELL + ' > header{',
          'overflow-x:auto;overflow-y:hidden;gap:2px;',
          'padding-left:8px;padding-right:8px}',
        'html[data-nclay="wide"] ' + SHELL + ' > header > *{min-width:0}',
        'html[data-nclay="wide"] ' + SHELL + ' > header button{',
          'padding-left:6px;padding-right:6px}',
        'html[data-nclay="wide"] ' + SHELL + ' > header input,',
        'html[data-nclay="wide"] ' + SHELL + ' > header [contenteditable]{',
          'max-width:10ch;min-width:0}',
        'html[data-nclay="wide"] ' + SHELL + ' > header::-webkit-scrollbar{height:0}',
      '}',

      /* The phone layout is its own arrangement and wins. It is below the
         gate above anyway, but this is kept explicit: two layout files racing
         over the same elements is how both end up wrong. */
      '@media (max-width:900px){',
        'html[data-nclay="wide"] .nclk-btn,html[data-nclay="wide"] .nctr-btn,',
        'html[data-nclay="wide"] .nccap-btn,html[data-nclay="wide"] .ncbeat-btn,',
        'html[data-nclay="wide"] .ncrf-btn{bottom:8px}}',

      /* ---- THE FIVE PILLS NOW CARRY ICONS ------------------------------
         Captions, Beats, Reframe, Looks and Transitions each used to open
         with a character — ♪, ⤢, ✦, ⇄ — picked because it was one keystroke,
         not because it meant anything. ⤢ is the fullscreen glyph and the
         button crops; ✦ is a sparkle and the button grades. Each file now
         draws a real 15px icon instead.

         The rule lives here, once, rather than in five stylesheets, because
         this file already owns where these five sit and what they line up
         with. They are five separate files with five separate css() blocks
         and no way to agree on a number between them; this is the only place
         that already knows about all of them. */
      PILLS.split(',').map(function (s) { return s + '{display:inline-flex;align-items:center;gap:7px}'; }).join('') +
      PILLS.split(',').map(function (s) { return s + ' .ncpill-i'; }).join(',') +
        '{width:15px;height:15px;flex:0 0 auto;fill:none;stroke:currentColor;',
        'stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',

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
         edge.

         Hiding it was the wrong half of that trade. The layout now applies at
         1280, and a layout you cannot see the switch for is one nobody knows
         they have — which is how this went unnoticed. So below 1360 the button
         SHRINKS instead of disappearing: the word "Layout:" goes, leaving just
         Wide or Classic, which is 102px down to about 58 and leaves the export
         group where it was. The title attribute still says what it does.

         The old hide-rule was first written ABOVE the one that sets
         display:inline-flex. A media query adds no specificity, so the later
         rule won and the button stayed on screen at every width — the hide did
         nothing at all. Measured again afterwards, which is the only reason it
         was caught, and the reason this replacement was measured too. */
      '@media (max-width:1359px){',
        '.nclay-btn{padding:0 8px;font-size:11px;gap:0}',
        '.nclay-btn span.nclay-word{display:none}}',

      /* ---- THE EXPORT BUTTON IN CLASSIC, AT 1280 -----------------------
         Reported as "on the classic the export button is a lil cooked", and
         it is worse than cooked: measured at 1280 in classic the header's
         children come to 1388px in a 1278px box, so Export sits 109px PAST
         the right edge of the window and cannot be clicked at all. In wide at
         the same width the header fits with room to spare, which is why this
         only shows up on the layout somebody opts back into.

         This is the crowding the original floor at 1360 was avoiding rather
         than fixing, and it is not caused by this file — blocking the whole
         thing still reproduces it. But an unreachable primary action is not
         something to leave sitting behind a comment.

         Two rules, in order of how much they change. First the header is
         allowed to compress: its children stop refusing to shrink and the
         gaps tighten, which is where most of the 110px comes back. Then
         overflow-x:auto as the floor under it — if some future label pushes
         it over again the button is scrolled to rather than lost, which is
         the difference between awkward and unusable. */
      /* NOT INSIDE A MEDIA QUERY, AND THAT WAS THE FIRST MISTAKE HERE.
         Scoped to max-width:1359 it did nothing at 1366 — where measurement
         showed the export button 79px off the right edge, worse than the 1280
         case it was written for, because 1366 fell straight through the query
         into the unfixed state. The header overflows whenever its contents
         are wider than it is, which is not a fact about any particular
         breakpoint, so neither is the fix. At 1600 classic the header already
         fits and these rules do nothing: no overflow, no scrollbar. */
      'html[data-nclay="classic"] ' + SHELL + ' > header{',
        'overflow-x:auto;overflow-y:hidden;gap:3px}',
      'html[data-nclay="classic"] ' + SHELL + ' > header > *{min-width:0}',
      'html[data-nclay="classic"] ' + SHELL + ' > header button{',
        'padding-left:7px;padding-right:7px}',
      /* The last fourteen pixels at 1280. Measured down from 110 -> 31 -> 14
         by the rules above; this is the remainder, and it is the gap between
         the header's own groups rather than anything inside them. */
      '@media (max-width:1400px){',
        'html[data-nclay="classic"] ' + SHELL + ' > header{gap:1px;',
          'padding-left:8px;padding-right:8px}',
        'html[data-nclay="classic"] ' + SHELL + ' > header button{',
          'padding-left:5px;padding-right:5px}}',
      /* The project name is the one thing in that header nobody needs to read
         while they are exporting, and it is what the remaining overflow is
         made of. It keeps its space down to a readable ten characters and
         gives the rest back. */
      'html[data-nclay="classic"] ' + SHELL + ' > header input,',
      'html[data-nclay="classic"] ' + SHELL + ' > header [contenteditable]{',
        'max-width:10ch;min-width:0}',
      /* A horizontal scrollbar inside a 56px header eats a third of it. The
         row still scrolls, it just does not advertise it. */
      'html[data-nclay="classic"] ' + SHELL + ' > header::-webkit-scrollbar{height:0}'
    ].join('');
    document.head.appendChild(st);
  }

  function apply() {
    css();
    var p = pref();
    var el = document.documentElement;
    /* Studio IS wide, plus the overrides keyed off the second attribute, so
       data-nclay carries 'wide' for it and every rule written for wide goes
       on matching without being listed twice. */
    el.setAttribute('data-nclay', p === 'classic' ? 'classic' : 'wide');
    if (p === 'studio') el.setAttribute('data-ncstudio', '1');
    else el.removeAttribute('data-ncstudio');
    var b = document.querySelector('.nclay-btn b');
    if (b) b.textContent = NAMES[p] || 'Studio';
    /* The inspector counts in studio and not in the other two, so the
       variable is re-read on every switch, not only when the panel resizes. */
    try { if (window.__ncInspRead) window.__ncInspRead(); } catch (e) {}
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
    b.title = 'Studio: a full-width browser beside the player. ' +
              'Wide: timeline across the whole window. ' +
              'Classic: the layout the editor shipped with.';
    b.innerHTML = '<span class="nclay-word">Layout: </span><b></b>';
    b.onclick = function () {
      setPref(ORDER[(ORDER.indexOf(pref()) + 1) % ORDER.length]);
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

  /* --------------------------------------------------------------------------
     THE FLOATING TOOL BUTTONS, LAID OUT INSTEAD OF GUESSED AT
     --------------------------------------------------------------------------
     Captions, Beats, Reframe, Looks and Transitions each ship their own pill
     and each one sets its own `left` in its own file — 18px, 140px, 352px and
     so on. Those numbers were measured once, against English labels, and they
     are wrong the moment a word gets longer: in Portuguese "Reenquadrar" runs
     from 688 to 810 and "Looks" starts at 792, so the two print through each
     other. Reported from a screenshot, and measured: one overlapping pair at
     1600px, and the row also crosses the preview.

     So the lefts are overridden and the row is laid out from the buttons' OWN
     measured widths, left to right, wrapping up a row when it would reach the
     right edge. That is language-proof in a way a hardcoded offset cannot be:
     it asks each button how wide it actually is, in whatever language it is
     currently showing.

     Deliberately not a flex container. The five buttons are created by five
     different files at five different moments, none of which know about each
     other, and moving them into a shared parent would mean each of those files
     finding its button somewhere it did not put it. Positioning them where
     they already are costs nothing and breaks nothing.
     ------------------------------------------------------------------------ */
  /* THE WIDTH IS NOT STABLE WHEN THE ROW IS FIRST LAID OUT.
     First attempt placed each button from the width it had at that moment, and
     the row still overlapped — worse than before, two pairs instead of one.
     The reason took a measurement: the pills are positioned before the phrase
     layer has swapped the labels, so "Beats" is measured and "♪ Batidas" is
     what ends up in the slot. Re-running on nc-lang does not catch it either,
     because the FIRST translation is applied at load and is not a change.

     So each button is watched for its own size changing, which is the thing
     that actually invalidates the row, whatever caused it — a translation, a
     font arriving, a label the tool rewrites itself. */
  var watched = null;
  function watch(b) {
    if (!window.ResizeObserver) return;
    if (!watched) {
      watched = new WeakSet();
      try {
        window.__ncPillRO = new ResizeObserver(function () { layoutPillsSoon(); });
      } catch (e) { return; }
    }
    if (watched.has(b) || !window.__ncPillRO) return;
    watched.add(b);
    try { window.__ncPillRO.observe(b); } catch (e) {}
  }

  function layoutPills() {
    var all = [].slice.call(document.querySelectorAll(PILLS))
                .filter(function (b) {
                  var s = getComputedStyle(b);
                  return s.display !== 'none' && s.visibility !== 'hidden';
                });
    if (!all.length) return;
    all.forEach(watch);

    /* Left edge: clear of the media panel in wide, clear of nothing in
       classic, and always clear of the window edge. */
    var startX = 16;
    var gap = 8, rowH = 42;
    var bottom = window.innerWidth <= 900 ? 8 : 16;
    var max = window.innerWidth - 16;

    /* Measure every width FIRST, then place. Reading and writing in the same
       pass means each getBoundingClientRect() is answering after the previous
       button has already been moved, which is both slower and — once a label
       has changed underneath it — wrong. */
    var widths = all.map(function (b) {
      return Math.ceil(b.getBoundingClientRect().width) || 90;
    });

    var x = startX, row = 0;
    all.forEach(function (b, i) {
      var w = widths[i];
      if (x + w > max && x > startX) { row++; x = startX; }
      b.style.setProperty('left', x + 'px', 'important');
      b.style.setProperty('right', 'auto', 'important');
      b.style.setProperty('bottom', (bottom + row * rowH) + 'px', 'important');
      x += w + gap;
    });
  }

  /* Re-run whenever anything that changes a width changes: the window, the
     language (every label changes at once), and the arrival of a button that
     was not in the DOM yet — the five files create theirs whenever they get
     round to it. */
  var pillTimer = null;
  function layoutPillsSoon() {
    clearTimeout(pillTimer);
    pillTimer = setTimeout(layoutPills, 60);
  }

  /* --------------------------------------------------------------------------
     HOW TALL THE INSPECTOR IS, KEPT IN A CSS VARIABLE
     --------------------------------------------------------------------------
     Only studio needs it, and only so the transport can sit above the
     inspector instead of on it. Everywhere else the variable stays unset and
     the calc() falls back to 0px, which is the wide behaviour exactly.
     -------------------------------------------------------------------------- */
  var inspRO = null;
  function trackInspector() {
    var el = document.querySelector(PROW + ' > div.min-w-0.shrink-0');
    if (!el) return false;
    function read() {
      var h = pref() === 'studio' ? Math.round(el.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty('--ncinsp', h + 'px');
    }
    read();
    if (window.ResizeObserver && !inspRO) {
      try { (inspRO = new ResizeObserver(read)).observe(el); } catch (e) {}
    }
    window.addEventListener('resize', read);
    /* The toggle changes whether it counts at all, so apply() re-reads it. */
    window.__ncInspRead = read;
    return true;
  }

  window.NC_LAYOUT = {
    get: pref,
    set: function (v) { setPref(ORDER.indexOf(v) >= 0 ? v : 'studio'); apply(); },
    options: ORDER.slice(),
    apply: apply,
    pills: layoutPills
  };

  /* Painted before the button exists, so the layout is right from the first
     frame rather than snapping into place once the header is found. */
  apply();

  function boot() {
    var tries = 0;
    var gotBtn = false, gotInsp = false;
    var t = setInterval(function () {
      if (!gotBtn) gotBtn = button();
      if (!gotInsp) gotInsp = trackInspector();
      if ((gotBtn && gotInsp) || tries++ > 80) clearInterval(t);
    }, 250);

    /* The pills arrive late and independently, so the row is re-laid out as
       they appear rather than once at boot. The observer is cheap — it only
       acts when something matching PILLS is actually added. */
    layoutPillsSoon();
    try {
      new MutationObserver(function (recs) {
        for (var i = 0; i < recs.length; i++) {
          var added = recs[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1 && (n.matches && n.matches(PILLS) ||
                                     n.querySelector && n.querySelector(PILLS))) {
              layoutPillsSoon();
              return;
            }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* no observer, the resize and language hooks still fire */ }

    window.addEventListener('resize', layoutPillsSoon);
    /* Every label changes at once, so every width does. nova.js fires this. */
    window.addEventListener('nc-lang', layoutPillsSoon);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
}());
