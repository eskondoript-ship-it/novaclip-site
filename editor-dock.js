/* NOVACLIP — THE FX LIBRARY SITS IN THE LEFT COLUMN, NOT OVER THE PREVIEW
 * ===========================================================================
 * Asked for across three messages, the last one decisive: a screenshot of
 * the editor with the RIGHT-hand panel circled — the one that otherwise just
 * says "nothing selected" — and "put the panel here". An earlier version of
 * this file read the first two messages as meaning the left column and put
 * it there; the circle settled it. Flipping it back is a change to
 * findColumn() and the border-radius below, nothing else.
 *
 * Both pictures are the same change. editor-fx-edit.js's parameter and timing
 * editor is `.ncfe { position:absolute; inset:0 }` INSIDE the library panel —
 * it fills whatever the panel is. So putting the panel in the left column
 * puts the sliders and the easing curve there too, and there is one thing to
 * move rather than two.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A MEASUREMENT AND NOT A MOVE
 * ---------------------------------------------------------------------------
 * There was an earlier attempt at this. It reparented the panel into the
 * editor's own column — into React's DOM — and the result was "no preview a
 * lot of bugs no side panel". It was reverted whole in 93b07ad.
 *
 * This file does not touch React's DOM at all. The panel stays exactly where
 * editor-trans.js put it, a child of <body>, and stays position:fixed. All
 * that changes is the four numbers: left, top, width and height are measured
 * off the column and written as inline styles. Nothing is moved, nothing is
 * reparented, nothing is inserted into a tree React owns, and if this file
 * is deleted the panel floats again exactly as it did before.
 *
 * The column is found by position, not by class — see findColumn(). If
 * there is no right-hand panel wide enough, the library keeps its floating
 * geometry rather than being positioned somewhere wrong.
 *
 * ---------------------------------------------------------------------------
 * ONLY WHERE THERE IS ROOM
 * ---------------------------------------------------------------------------
 * Docking needs a column to dock into. On a phone the editor has no second
 * column, and a 302px panel pinned over a 390px screen would cover the
 * preview and the timeline both — which is the problem this is supposed to
 * solve, not a smaller version of it. Under MIN_VIEWPORT, or when the column
 * measures narrower than MIN_COLUMN, the panel is left floating and phone
 * users get what they had.
 */
(function () {
  'use strict';
  if (window.NC_DOCK) return;

  var MIN_VIEWPORT = 900;   /* px of window width before docking is offered */
  var MIN_COLUMN   = 240;   /* px of column width worth docking into */

  var panel = null, editor = null;            /* .nctr (library), .ncfe (controls) */
  var leftCol = null, rightCol = null;
  var roL = null, roR = null, roP = null, pending = 0;
  var previewEl = null;
  var dockedPanel = false, dockedEditor = false;

  /* TWO COLUMNS, TWO DIFFERENT THINGS IN THEM.

     Corrected after getting it backwards: "i said put the editing effects
     like in the second image there not the transitions effect page". The
     circled right-hand panel was never meant to hold the BROWSER — it is
     where an effect's own controls belong, the sliders and the timing curve
     from the gl-transitions picture. The browser goes on the left, which is
     where CapCut keeps it and where the first attempt had it.

     So the library panel (.nctr) docks left and the parameter editor (.ncfe)
     docks right, and when you open an effect's settings you can see the grid
     and its controls at the same time instead of one replacing the other.

     The columns are told apart by position, not by class. The editor has two
     `.glass` blocks — the left wraps the icon rail and the Media Library, the
     right holds Transform / Colour / Effects / Audio — and the only class
     difference is flex-row against flex-col, a layout detail a rebuild could
     flip without meaning anything. Left-most and right-most stay true
     however it is built. */
  var GAP = 8;         /* breathing room above the timeline */
  var MIN_PANEL = 260;  /* below this a docked panel is not worth docking */

  function glassColumns() {
    var all = document.querySelectorAll('.glass'), out = [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i].getBoundingClientRect();
      if (r.width < MIN_COLUMN || r.height < 200) continue;
      out.push({ el: all[i], x: r.left });
    }
    out.sort(function (a, b) { return a.x - b.x; });
    return out;
  }

  /* The left block contains the icon rail as well, and the library should
     not sit on top of the rail. So inside it, take the panel area — the
     child that does not hold the rail. */
  function findLeftColumn() {
    var cols = glassColumns();
    if (cols.length < 2) return null;
    var g = cols[0].el;
    var inner = g.querySelector('.min-w-0.flex-1.overflow-hidden');
    if (inner && inner.getBoundingClientRect().width >= MIN_COLUMN) return inner;
    var best = null, bestW = 0;
    for (var i = 0; i < g.children.length; i++) {
      var c = g.children[i];
      if (c.querySelector && c.querySelector('.ncrail-i')) continue;   /* the rail */
      var w = c.getBoundingClientRect().width;
      if (w > bestW) { bestW = w; best = c; }
    }
    return bestW >= MIN_COLUMN ? best : null;
  }

  /* THE PICTURE DOES NOT USE THE ROOM IT IS GIVEN, so the library can have
     the rest of it. Asked for: "make the menu bigger cause the preview aint
     using all of the space most sapce in empty".

     It depends entirely on the project's aspect ratio, which is why this is
     measured every time rather than set to a number. Measured in a 1600px
     window:

       16:9  the picture spans 412..1228 and the left column ends at 396.
             Sixteen pixels of slack. There is nothing to take, and the
             library stays the width of the column, exactly as before.
       1:1   the picture spans 587..1054. The library can run from the
             column's left edge to 577 — 486px instead of 302, about sixty
             per cent wider, which at minmax(128px,1fr) is three tiles across
             instead of two.

     A 9:16 project leaves more still. The cap stops it becoming a wall of
     tiles on a wide monitor.

     The preview is found as the biggest canvas on the page, ignoring
     anything inside the library itself — its own tiles are canvases too, and
     once the panel is wide enough they are not trivially smaller. */
  function findPreview() {
    var all = document.querySelectorAll('canvas'), best = null, bestA = 0;
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      if (c.closest && c.closest('.nctr')) continue;
      var r = c.getBoundingClientRect();
      if (r.width < 150 || r.height < 80) continue;
      var a = r.width * r.height;
      if (a > bestA) { bestA = a; best = r; previewEl = c; }
    }
    return best;
  }

  /* THE COLUMN'S WIDTH, AND NOTHING MORE.
     This used to grow the library from the column's edge towards the
     preview, up to MAX_LIB_W, on the reasoning that the gap between them was
     spare room. Asked to stop: "make the effects/transition page like any
     other sidebar page when i open cause its a lil bad rn".

     It is a fair complaint. Media, Text, Stickers, Photos and the rest all
     open as a panel the width of the column; the library alone opened at
     twice that and laid itself over the picture — measured at 620px against
     the column's 345 in the reported layout, so two thirds of it was sitting
     on the preview. A page that behaves differently from every other page in
     the same rail reads as broken even when it is deliberate.

     The grid inside is what adapts instead: auto-fill with a smaller minimum
     puts three tiles across the same 345px that used to hold two. Same
     number of effects on screen, none of it over the preview. */
  function libWidth(colRect) {
    return colRect.width;
  }

  function findRightColumn() {
    var cols = glassColumns();
    if (cols.length < 2) return null;
    var last = cols[cols.length - 1];
    if (last.x < window.innerWidth * 0.5) return null;
    return last.el;
  }

  function css() {
    if (document.getElementById('nc-dock-css')) return;
    var s = document.createElement('style');
    s.id = 'nc-dock-css';
    s.textContent = [
      /* The library sits in the LEFT column: square against the icon rail,
         rounded away from it. */
      '.nctr.nc-docked{border-radius:0 14px 14px 0;box-shadow:14px 18px 40px rgba(0,0,0,.4)}',
      /* CAPCUT PACKS MORE THAN TWO ACROSS. The floating panel was 430px wide
         and two fixed columns suited it; the dock is about 300px, where two
         194px columns do not fit at all. auto-fill lets the same grid be two
         narrow tiles in the column and three or four if it is wider, without
         this file knowing the number. */
      /* 72, not 128. Measured in the browser at the two window widths that
         matter, counting tiles fully inside the panel:

           column 272px (1440 window)   128px -> 1 across, 1 visible
                                         96px -> 2 across, 4 visible
                                         72px -> 3 across, 6 visible
           column 332px (1760 window)   128px -> 2 across, 2 visible
                                         96px -> 3 across, 6 visible
                                         72px -> 4 across, 8 visible

         96 looked like enough on a wide screen and is not: on an ordinary
         1440 laptop it still only fits two. 72 is the first value that puts
         three across a 272px column, which is the one the complaint was
         about — "make the preview smaller so it fits more effects in a
         column". The tile comes out 79px wide there, 73px at four across,
         which still reads as a transition at a glance. auto-fill does the
         counting, so a wider column keeps using the room. */
      '.nctr.nc-docked .grid{grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:7px;',
        'padding:8px 9px 10px}',
      /* The tile's own picture comes down with it — these are 16:9 canvases
         and at three across that is about 56px of height each, so a column
         now shows three rows where it showed one and a half. */
      '.nctr.nc-docked .grid canvas{height:auto;aspect-ratio:16/9}',
      /* THE HEADER WAS A THIRD OF THE PANEL BEFORE A SINGLE TILE.
         Title, a three-line paragraph explaining that the tiles animate, a
         search box, and the categories on two wrapped rows — about 250px of
         740 spent before the grid starts. In a floating 620px panel that is
         proportionate; in a 338px column it is most of what you can see.

         The paragraph goes (it explains itself the moment you look at a
         tile, and it stays in the heading's tooltip), and the categories
         become one row that scrolls sideways instead of wrapping onto two.
         Nothing is removed from the panel — every category is still
         reachable, it just does not cost a second row to show them. */
      '.nctr.nc-docked .hd{padding:9px 10px 7px}',
      '.nctr.nc-docked .hd .sub{display:none}',
      '.nctr.nc-docked .hd .sub-cats{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;',
        'scrollbar-width:none;padding-bottom:2px}',
      '.nctr.nc-docked .hd .sub-cats::-webkit-scrollbar{display:none}',
      /* A chip cut off square at the panel's edge reads as a layout bug. The
         fade says the row carries on and can be pushed sideways, which is
         the one thing a hidden scrollbar stops it saying. */
      '.nctr.nc-docked .hd .sub-cats{-webkit-mask-image:linear-gradient(90deg,',
        '#000 calc(100% - 22px),transparent);mask-image:linear-gradient(90deg,',
        '#000 calc(100% - 22px),transparent)}',
      '.nctr.nc-docked .hd .sub-cats .cat{flex:0 0 auto}',
      /* AND THE GAPS BETWEEN THEM. With the paragraph gone the header still
         measured 160px of a 440px panel — more height than a whole row of
         effects — because each of the four remaining pieces is held 9-10px
         off the one above it and the search box is 39px tall on its own.
         Those spacings are right in a floating panel with room to breathe.
         In the column they are the difference between two rows of effects
         and three, so they come in. */
      '.nctr.nc-docked .hd h4{font-size:.95rem;line-height:1.25}',
      '.nctr.nc-docked .hd .cats{margin-top:6px!important}',
      '.nctr.nc-docked .hd .q{margin-top:6px!important;padding:7px 9px;font-size:.78rem}',
      '.nctr.nc-docked .hd .sub-cats{margin-top:6px!important}',
      '.nctr.nc-docked .hd .cat{padding:3px 9px;font-size:.68rem}',
      /* THE WORDS ARE WHAT WAS EATING THE COLUMN, not the pictures.
         With three tiles across, a card is 99px of preview and then up to
         five lines of description underneath — "A feathered edge travels
         across. The cut most real edits use." — so two and a half rows
         filled the panel. The sentence is worth having; five lines of it
         against a 56px thumbnail is not. Clamped to two lines, which is
         enough to tell two glitches apart, and the full text stays in the
         title attribute for anyone who hovers. */
      '.nctr.nc-docked .m{padding:4px 6px 6px}',
      '.nctr.nc-docked .m b{font-size:.72rem;line-height:1.2}',
      '.nctr.nc-docked .m span{font-size:.63rem;line-height:1.3;display:-webkit-box;',
        '-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      /* The NEW badge was a block of its own on a line of its own. */
      '.nctr.nc-docked .m .nw,.nctr.nc-docked .m .new,.nctr.nc-docked .m i{',
        'font-size:.55rem;padding:0 4px;margin:1px 0 2px}',
      /* The footer is one line of advice and a close button, and it was 49px
         of a 440px panel. Same reasoning as the header. */
      '.nctr.nc-docked .ft{padding:6px 10px;font-size:10.5px;line-height:1.3}',

      /* THE CONTROLS GO IN THE RIGHT COLUMN, ON THEIR OWN.
         .ncfe is a child of .nctr and is normally position:absolute inset:0,
         so it covers the library. Switching it to fixed takes it out of the
         library's box entirely and lets it be measured onto the other side
         of the screen, without reparenting it — .nctr sets no transform,
         filter or perspective, so it is not a containing block for a fixed
         child and its overflow:hidden does not clip one either. Verified in
         the browser rather than taken on trust: the editor measures the full
         right column, not a sliver of the left one. */
      '.ncfe.nc-docked-edit{position:fixed;inset:auto;z-index:100003;',
        'border-radius:14px 0 0 14px;box-shadow:-14px 18px 40px rgba(0,0,0,.45);',
        'border:1px solid rgba(255,255,255,.14)}',
      '.ncfe.nc-docked-edit .ncfe-prev{max-width:100%}',
      '.ncfe.nc-docked-edit .ncfe-curve{max-width:100%}',
      '.ncfe.nc-docked-edit .ncfe-row{grid-template-columns:72px 1fr 38px}'
    ].join('');
    document.head.appendChild(s);
  }

  /* WHERE THE TIMELINE STARTS, SO THE PANEL CAN STOP THERE.

     Both docked panels take the full height of the column they sit in. In the
     Studio layout that column ends above the timeline and all is well. In
     CLASSIC it does not: measured at 1917x997 with the library open, .nctr ran
     from y=109 to y=1048 while the track labels start at y=834 — 214px of the
     timeline underneath a panel, including every track name. Reported twice as
     "the timeline is not completely visible", and the first fix (syncing the
     two columns' scrolling) was a real bug but not this one.

     The timeline is found from its own furniture rather than by class: the
     track-label column walked upwards until an ancestor also contains the Snap
     control, which is the toolbar above the ruler. That ancestor is the whole
     timeline block, and its top is the line no panel may cross. Tailwind class
     strings are not a stable handle; "the box that holds both the lanes and
     the Snap button" is. */
  function timelineTop() {
    var labels = document.querySelector('.w-44.shrink-0.overflow-y-auto');
    if (!labels) return 0;
    var e = labels.parentElement, hops = 0;
    while (e && hops++ < 6) {
      var bs = e.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) {
        if ((bs[i].textContent || '').trim() === 'Snap') {
          return e.getBoundingClientRect().top;
        }
      }
      e = e.parentElement;
    }
    /* No Snap button found — an older build, or it was renamed. The labels'
       own top is a worse answer but still better than covering them. */
    return labels.getBoundingClientRect().top;
  }

  /* The column height a panel may actually use. */
  function roomIn(rect) {
    var limit = timelineTop();
    if (!(limit > 0)) return rect.height;
    var room = limit - GAP - rect.top;
    /* Never crush it to nothing: below this the panel is unusable and the
       honest thing is to leave it full height and overlap, which at least
       still works as a panel. */
    if (room < MIN_PANEL) return rect.height;
    return Math.min(rect.height, room);
  }

  function place(el, rect, cls) {
    el.classList.add(cls);
    /* Inline and !important: .nctr's own rule carries left/bottom/width/
       max-height and .ncfe's carries inset, and both are stylesheet rules
       their own files still need for the undocked case. */
    el.style.setProperty('left', Math.round(rect.left) + 'px', 'important');
    el.style.setProperty('top', Math.round(rect.top) + 'px', 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('width', Math.round(rect.width) + 'px', 'important');
    el.style.setProperty('height', Math.round(rect.height) + 'px', 'important');
    el.style.setProperty('max-height', 'none', 'important');
  }

  function clear(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    ['left', 'top', 'right', 'bottom', 'width', 'height', 'max-height']
      .forEach(function (k) { el.style.removeProperty(k); });
  }

  function undock() {
    if (dockedPanel) { clear(panel, 'nc-docked'); dockedPanel = false; }
    if (dockedEditor) { clear(editor, 'nc-docked-edit'); dockedEditor = false; }
  }

  function usable(el) {
    if (!el || !el.isConnected) return null;
    var r = el.getBoundingClientRect();
    return (r.width >= MIN_COLUMN && r.height >= 200) ? r : null;
  }

  function apply() {
    if (window.innerWidth < MIN_VIEWPORT) { undock(); return; }
    if (!leftCol || !leftCol.isConnected) leftCol = findLeftColumn();
    if (!rightCol || !rightCol.isConnected) rightCol = findRightColumn();
    css();

    if (panel && panel.isConnected) {
      var lr = usable(leftCol);
      if (lr) {
        /* A plain object rather than the live rect, so widening the panel
           cannot feed back into the next measurement. */
        place(panel, { left: lr.left, top: lr.top,
                       width: libWidth(lr), height: roomIn(lr) }, 'nc-docked');
        dockedPanel = true;
      } else if (dockedPanel) { clear(panel, 'nc-docked'); dockedPanel = false; }
    }

    /* The controls panel only exists while an effect is being edited. */
    editor = panel ? panel.querySelector('.ncfe') : null;
    if (editor) {
      var rr = usable(rightCol);
      /* The right column gets the same treatment for the same reason: in
         Classic it runs past the timeline too, and the effect editor covering
         the right-hand end of every lane is the same bug on the other side. */
      if (rr) {
        place(editor, { left: rr.left, top: rr.top, width: rr.width, height: roomIn(rr) },
              'nc-docked-edit');
        dockedEditor = true;
      }
      else if (dockedEditor) { clear(editor, 'nc-docked-edit'); dockedEditor = false; }
    } else { dockedEditor = false; }
  }

  function watchColumns() {
    if (typeof ResizeObserver !== 'function') return;
    if (!roL && leftCol) {
      roL = new ResizeObserver(nudge); roL.observe(leftCol);
    }
    if (!roR && rightCol) {
      roR = new ResizeObserver(nudge); roR.observe(rightCol);
    }
    /* The library's width is measured off the picture, so changing the
       project's aspect ratio has to re-measure it — 16:9 to 1:1 moves the
       picture's left edge by 175px and that is the whole of the extra room.
       Watching the canvas is simpler than watching the store for a setting
       whose name this file would otherwise have to know. */
    if (previewEl && previewEl.isConnected) {
      if (roP && roP.__el !== previewEl) { roP.disconnect(); roP = null; }
      if (!roP) { roP = new ResizeObserver(nudge); roP.__el = previewEl; roP.observe(previewEl); }
    }
  }

  function nudge() {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; apply(); });
  }

  /* The library panel is created the first time it is opened, and the
     controls panel is created inside it each time an effect is edited — so
     both are watched for rather than looked up once. One rAF per batch, and
     nothing here ever scans the whole document: the undebounced
     full-document scan in an early editor-rail.js is what hung the editor
     before DOMContentLoaded. */
  var innerObs = null;
  function hunt() {
    if (!panel || !panel.isConnected) {
      panel = document.querySelector('.nctr');
      if (innerObs) { innerObs.disconnect(); innerObs = null; }
    }
    if (!panel) return;
    if (!innerObs) {
      innerObs = new MutationObserver(nudge);
      innerObs.observe(panel, { childList: true });
    }
    if (!leftCol || !leftCol.isConnected) leftCol = findLeftColumn();
    if (!rightCol || !rightCol.isConnected) rightCol = findRightColumn();
    findPreview();                 /* sets previewEl for watchColumns */
    watchColumns();
  }

  var obs = new MutationObserver(function () {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; hunt(); apply(); });
  });

  function boot() {
    hunt(); apply();
    obs.observe(document.body, { childList: true });
    window.addEventListener('resize', nudge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.NC_DOCK = {
    state: function () {
      var m = function (el) {
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { x: Math.round(r.left), y: Math.round(r.top),
                 w: Math.round(r.width), h: Math.round(r.height) };
      };
      return { panel: !!(panel && panel.isConnected), editor: !!(editor && editor.isConnected),
               dockedPanel: dockedPanel, dockedEditor: dockedEditor,
               left: m(leftCol), right: m(rightCol),
               panelRect: m(panel), editorRect: m(editor) };
    },
    apply: apply,
    undock: undock,
    rescan: function () {
      panel = null; editor = null; leftCol = null; rightCol = null;
      if (roL) { roL.disconnect(); roL = null; }
      if (roR) { roR.disconnect(); roR = null; }
      if (roP) { roP.disconnect(); roP = null; }
      previewEl = null;
      hunt(); apply();
    }
  };
})();
