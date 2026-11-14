/* NOVACLIP — THE EFFECT EDITOR FOLLOWS THE CLIP YOU PICKED
 * ===========================================================================
 * Three things asked for together, because they are one thing:
 *
 *   "delete effects on right panel"
 *   "make the effect editing tab appear when i select a clip"
 *   "if it has multiple make it possible to change the effect you wanna edit"
 *
 * WHY THE RIGHT PANEL'S EFFECTS TAB GOES
 * ---------------------------------------------------------------------------
 * The bundle's inspector has four tabs — Transform, Color, Effects, Audio.
 * Its Effects tab lists 36 effects with a strength slider each. The FX
 * library this editor actually uses lists 51, with parameters, easing and a
 * live preview on every tile, and editor-fx-edit.js gives each one a real
 * editor behind it.
 *
 * So the tab was the smaller, worse copy of something already on screen, in
 * the place a person looks first. editor-rail.js records the same mistake
 * being made from the other direction: somebody hunting for an added effect
 * opened the rail's smaller list three times, counted 36, and concluded the
 * 43 new ones had never been added. Two lists of effects in one editor is the
 * bug; removing one of them is the fix, and this is the one with less in it.
 *
 * NOTHING IS DELETED FROM THE BUNDLE. The tab button is hidden and the store
 * is steered off 'effects' if anything selects it — a keyboard shortcut, a
 * restored project, the bundle's own code. Hiding a button is not the same as
 * making a state unreachable, and the state is what draws the panel.
 *
 * WHY THE EDITOR OPENS ON SELECTION
 * ---------------------------------------------------------------------------
 * Before this, reaching an effect's settings meant: notice the floating "On
 * this clip" bar, click the chip, wait for the library to open, and the
 * editor appears inside it. Four steps, and the first one is noticing a bar
 * at the bottom of the screen. Selecting a clip is already how you say "this
 * is the one I am working on", so that is when its settings appear.
 *
 * ONLY WHEN THERE IS SOMETHING TO EDIT. A clip with no effects of ours opens
 * nothing: an empty editor is worse than no editor, and it would take over
 * the library panel somebody may have open to browse. A clip the user has not
 * chosen does not either — this runs on selection changing, not on a repaint.
 *
 * AND IT DOES NOT FIGHT YOU. If you close the editor, it stays closed for
 * that clip. Re-opening it every time the store ticks would make the close
 * button look broken, and the store ticks for playhead movement.
 *
 * THE SWITCHER
 * ---------------------------------------------------------------------------
 * A clip with three effects used to mean closing the editor, finding the
 * floating bar again and clicking a different chip. The editor now carries
 * the clip's other effects in its own header, so switching is one press and
 * the panel never closes. It is only drawn when the clip has more than one —
 * a row of one button is a row that explains nothing.
 */
(function () {
  'use strict';
  if (window.NC_FX_AUTO) return;

  var TAB_SIG = /px-2\.5 py-1\.5 text-xs/;   /* the inspector's tab buttons */
  var DEAD = 'effects';                       /* the rightPanelTab we retire */
  var FALLBACK = 'properties';                /* what the inspector opens on */

  var lastClip = null;
  var closedFor = {};     /* clip id -> the user shut the editor; leave it shut */
  var opened = 0;

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }

  /* ----------------------------------------------------------- the tab goes */

  function hideTab() {
    var bs = document.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!TAB_SIG.test(b.className || '')) continue;
      if ((b.textContent || '').trim() !== 'Effects') continue;
      if (b.style.display === 'none') continue;
      b.style.display = 'none';
    }
  }

  /* The button is gone; make sure the state behind it is too. */
  function steer() {
    var st = state();
    if (!st || st.rightPanelTab !== DEAD) return;
    try {
      if (typeof st.setRightPanelTab === 'function') st.setRightPanelTab(FALLBACK);
      else store().setState({ rightPanelTab: FALLBACK });
    } catch (e) {}
  }

  /* ------------------------------------------------- what is on this clip */

  function selClip() {
    var st = state();
    if (!st || !st.selectedClipId) return null;
    for (var i = 0; i < st.clips.length; i++) {
      if (st.clips[i].id === st.selectedClipId) return st.clips[i];
    }
    return null;
  }

  /* The effects on a clip that THIS editor can actually edit — the pack's own,
     which are the ones editor-fx-edit.js wraps and gives parameters to. The
     bundle's built-in effects have no parameters here, so offering to edit
     one would open a panel with a title and nothing under it. */
  function editable(clip) {
    var out = [];
    if (!clip || !clip.effects) return out;
    var ui = window.NC_TRANS_UI;
    var known = (ui && ui.effects) || {};
    for (var k in clip.effects) {
      if (!Object.prototype.hasOwnProperty.call(clip.effects, k)) continue;
      if (!(clip.effects[k] > 0)) continue;
      if (!known[k]) continue;
      var params = window.NC_FX_EDIT && window.NC_FX_EDIT.PARAMS;
      out.push({ id: k, label: (known[k] && known[k][0]) || k,
                 tunable: !!(params && params[k]) });
    }
    return out;
  }

  /* ------------------------------------------------------------- the opener */

  function openFor(id) {
    var fx = window.NC_FX_EDIT;
    if (!fx || !fx.editor) return false;
    /* The editor renders inside the library panel, so the library has to be
       there first. Opening it is what the chip in the floating bar does too. */
    if (!document.querySelector('.nctr')) {
      if (window.NC_TRANS_UI && window.NC_TRANS_UI.open) window.NC_TRANS_UI.open();
      else return false;
    }
    setTimeout(function () {
      try { fx.editor(id, 'fx'); } catch (e) {}
      decorate();
    }, 90);
    opened++;
    return true;
  }

  /* ------------------------------------------------------------ the switcher */

  var CSS =
    '.ncfa-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;' +
      'padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.08);flex:0 0 auto}' +
    '.ncfa-row i{font-style:normal;font-size:10px;color:#8B93AD;letter-spacing:.04em;' +
      'text-transform:uppercase;margin-right:2px}' +
    '.ncfa-sw{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);' +
      'color:#C9CEDC;font:600 11px/1 system-ui;padding:5px 9px;border-radius:999px;' +
      'cursor:pointer}' +
    '.ncfa-sw:hover{background:rgba(255,255,255,.1);color:#fff}' +
    '.ncfa-sw.on{border-color:#7C5CFF;background:rgba(124,92,255,.18);color:#C4B5FD}' +
    '.ncfa-sw[disabled]{opacity:.45;cursor:default}';

  function css() {
    if (document.getElementById('ncfa-css')) return;
    var s = document.createElement('style');
    s.id = 'ncfa-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Put the clip's other effects into the editor's own header. */
  function decorate() {
    var box = document.querySelector('.ncfe');
    if (!box) return;
    var old = box.querySelector('.ncfa-row');
    if (old) old.parentNode.removeChild(old);

    var list = editable(selClip());
    if (list.length < 2) return;      /* a row of one button says nothing */

    css();
    var now = '';
    var hd = box.querySelector('.ncfe-hd b');
    if (hd) now = (hd.textContent || '').trim();

    var row = document.createElement('div');
    row.className = 'ncfa-row';
    var lab = document.createElement('i');
    lab.textContent = 'On this clip';
    row.appendChild(lab);

    list.forEach(function (fx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ncfa-sw' + (fx.label === now ? ' on' : '');
      b.textContent = fx.label;
      if (fx.label === now) {
        b.disabled = true;
        b.title = 'Showing this one';
      } else if (!fx.tunable) {
        /* It is on the clip and it is ours, but nothing about it is
           adjustable beyond strength. Say so rather than opening a panel
           with one slider and calling it an editor. */
        b.title = fx.label + ' has no settings beyond strength';
      } else {
        b.title = 'Edit ' + fx.label;
      }
      b.onclick = function () {
        if (fx.label === now) return;
        openFor(fx.id);
      };
      row.appendChild(b);
    });

    /* Under the title, above the controls. */
    var head = box.querySelector('.ncfe-hd');
    if (head && head.nextSibling) box.insertBefore(row, head.nextSibling);
    else box.appendChild(row);
  }

  /* --------------------------------------------------------------- the watch */

  function onSelectionChanged(clip) {
    if (!clip) return;
    if (closedFor[clip.id]) return;
    var list = editable(clip);
    if (!list.length) return;
    /* Prefer one with its own parameters, because that is the editor worth
       landing on. But open a parameterless one rather than nothing: 24 of the
       51 pack effects have parameters, and the other 27 still carry strength,
       easing and duration — which is an editor, just a shorter one. Skipping
       them would mean "select a clip and its settings appear" quietly not
       being true for half the library. */
    var pick = list[0];
    for (var i = 0; i < list.length; i++) {
      if (list[i].tunable) { pick = list[i]; break; }
    }
    openFor(pick.id);
  }

  function tick() {
    var st = state();
    if (!st) return;
    steer();
    hideTab();

    var id = st.selectedClipId || null;
    if (id !== lastClip) {
      lastClip = id;
      /* A different clip gets a fresh chance to open its editor. */
      if (id) delete closedFor[id];
      onSelectionChanged(selClip());
    } else if (document.querySelector('.ncfe')) {
      decorate();
    }
  }

  /* The editor's own close button removes .ncfe. Noticing that it is gone,
     while the same clip is still selected, is how "the user shut it" is told
     apart from "it was never opened" — without patching the close handler. */
  var wasOpen = false;
  function watchClose() {
    var now = !!document.querySelector('.ncfe');
    if (wasOpen && !now && lastClip) closedFor[lastClip] = true;
    wasOpen = now;
  }

  function start() {
    var tries = 0;
    (function wait() {
      if (state()) {
        try {
          store().subscribe(function () { tick(); watchClose(); });
        } catch (e) {}
        tick();
        /* The store does not tick when React alone re-renders the inspector,
           which is when the tab button comes back. Cheap, and it is two
           querySelectorAll calls. */
        setInterval(function () { hideTab(); steer(); watchClose(); }, 400);
        return;
      }
      if (++tries > 160) return;
      setTimeout(wait, 250);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_FX_AUTO = {
    editable: function () { return editable(selClip()); },
    openFor: openFor,
    decorate: decorate,
    opened: function () { return opened; },
    hideTab: hideTab
  };
})();
