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
  var MAX_LIB_W    = 620;   /* px, the widest the library is allowed to grow */
  var PREVIEW_GAP  = 10;    /* px of air between the library and the picture */

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

  function libWidth(colRect) {
    var pv = findPreview();
    if (!pv) return colRect.width;
    var room = Math.floor(pv.left - PREVIEW_GAP - colRect.left);
    if (room > MAX_LIB_W) room = MAX_LIB_W;
    return room > colRect.width ? room : colRect.width;
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
      '.nctr.nc-docked .grid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:9px;',
        'padding:10px 11px 12px}',
      '.nctr.nc-docked .hd{padding:12px 13px 9px}',
      '.nctr.nc-docked .m{padding:6px 7px 8px}',
      '.nctr.nc-docked .m b{font-size:.78rem}',
      '.nctr.nc-docked .m span{font-size:.67rem;line-height:1.38}',
      '.nctr.nc-docked .ft{padding:9px 12px;font-size:11px}',

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
                       width: libWidth(lr), height: lr.height }, 'nc-docked');
        dockedPanel = true;
      } else if (dockedPanel) { clear(panel, 'nc-docked'); dockedPanel = false; }
    }

    /* The controls panel only exists while an effect is being edited. */
    editor = panel ? panel.querySelector('.ncfe') : null;
    if (editor) {
      var rr = usable(rightCol);
      if (rr) { place(editor, rr, 'nc-docked-edit'); dockedEditor = true; }
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
