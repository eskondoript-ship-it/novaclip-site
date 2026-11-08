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

  var panel = null, column = null, ro = null, docked = false, pending = 0;

  /* THE RIGHT-HAND PANEL, the one that otherwise reads "nothing selected".
     Asked for with that panel circled: "put the panel here".

     The editor has two `.glass` columns — the left one wraps the icon rail
     and the Media Library, the right one holds Transform / Colour / Effects
     / Audio. They are told apart by position rather than by class, because
     the only class difference between them is flex-row against flex-col,
     which is a layout detail a rebuild could flip without meaning anything.
     The right-hand one is the one further right, and that stays true however
     it is built. */
  function findColumn() {
    var glass = document.querySelectorAll('.glass');
    var best = null, bestX = -1;
    for (var i = 0; i < glass.length; i++) {
      var r = glass[i].getBoundingClientRect();
      if (r.width < MIN_COLUMN || r.height < 200) continue;
      if (r.left > bestX) { bestX = r.left; best = glass[i]; }
    }
    /* One column only, or none wide enough: there is no right-hand panel to
       dock into, so stay floating rather than cover the left one. */
    if (!best || bestX < window.innerWidth * 0.5) return null;
    return best;
  }

  function css() {
    if (document.getElementById('nc-dock-css')) return;
    var s = document.createElement('style');
    s.id = 'nc-dock-css';
    s.textContent = [
      /* Rounded on the inner edge, square against the window, so it reads as
         part of the right-hand column rather than a card dropped on top. */
      '.nctr.nc-docked{border-radius:14px 0 0 14px;box-shadow:-14px 18px 40px rgba(0,0,0,.4)}',
      /* CAPCUT PACKS MORE THAN TWO ACROSS. The floating panel was 430px wide
         and two fixed columns suited it; the dock is about 300px, where two
         194px columns do not fit at all. auto-fill lets the same grid be two
         narrow tiles in the column and three or four if the column is
         dragged wider, without this file knowing the number. */
      '.nctr.nc-docked .grid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:9px;',
        'padding:10px 11px 12px}',
      '.nctr.nc-docked .hd{padding:12px 13px 9px}',
      '.nctr.nc-docked .m{padding:6px 7px 8px}',
      '.nctr.nc-docked .m b{font-size:.78rem}',
      '.nctr.nc-docked .m span{font-size:.67rem;line-height:1.38}',
      '.nctr.nc-docked .ft{padding:9px 12px;font-size:11px}',
      /* The parameter editor fills the panel, so it inherits the dock for
         free. Only its preview needs to stop assuming a 430px panel. */
      '.nctr.nc-docked .ncfe-prev{max-width:100%}',
      '.nctr.nc-docked .ncfe-curve{max-width:100%}',
      '.nctr.nc-docked .ncfe-row{grid-template-columns:66px 1fr 34px}'
    ].join('');
    document.head.appendChild(s);
  }

  function undock() {
    if (!panel || !docked) return;
    docked = false;
    panel.classList.remove('nc-docked');
    ['left', 'top', 'width', 'height', 'max-height', 'bottom'].forEach(function (k) {
      panel.style.removeProperty(k);
    });
  }

  function apply() {
    if (!panel || !panel.isConnected) return;
    if (window.innerWidth < MIN_VIEWPORT) { undock(); return; }
    if (!column || !column.isConnected) column = findColumn();
    if (!column) { undock(); return; }
    var r = column.getBoundingClientRect();
    if (r.width < MIN_COLUMN || r.height < 200) { undock(); return; }
    css();
    docked = true;
    panel.classList.add('nc-docked');
    /* Inline and !important, because .nctr's own rule is a stylesheet rule
       with left/bottom/width/max-height in it and this has to win without
       editing that rule — editor-trans.js owns it and still needs it for the
       floating case. */
    panel.style.setProperty('left', Math.round(r.left) + 'px', 'important');
    panel.style.setProperty('top', Math.round(r.top) + 'px', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('width', Math.round(r.width) + 'px', 'important');
    panel.style.setProperty('height', Math.round(r.height) + 'px', 'important');
    panel.style.setProperty('max-height', 'none', 'important');
  }

  function watchColumn() {
    if (ro || !column || typeof ResizeObserver !== 'function') return;
    ro = new ResizeObserver(function () {
      if (pending) return;
      pending = requestAnimationFrame(function () { pending = 0; apply(); });
    });
    ro.observe(column);
  }

  /* The panel is created lazily, the first time the library is opened, so
     this watches for it rather than looking once. One rAF per batch, and it
     only ever reads document.body's direct children — the undebounced
     full-document scan in an earlier version of editor-rail.js is what hung
     the editor before DOMContentLoaded, and that mistake is not worth
     repeating for a panel that appears once. */
  function hunt() {
    if (panel && panel.isConnected) return;
    panel = document.querySelector('.nctr');
    if (!panel) return;
    column = findColumn();
    watchColumn();
    apply();
  }

  var obs = new MutationObserver(function () {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; hunt(); apply(); });
  });

  function boot() {
    hunt();
    obs.observe(document.body, { childList: true });
    window.addEventListener('resize', function () {
      if (pending) return;
      pending = requestAnimationFrame(function () { pending = 0; apply(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.NC_DOCK = {
    state: function () {
      var r = column ? column.getBoundingClientRect() : null;
      return { panel: !!(panel && panel.isConnected), column: !!column, docked: docked,
               rect: r ? { x: Math.round(r.left), y: Math.round(r.top),
                           w: Math.round(r.width), h: Math.round(r.height) } : null };
    },
    apply: apply,
    undock: undock,
    rescan: function () { panel = null; column = null; if (ro) { ro.disconnect(); ro = null; } hunt(); }
  };
})();
