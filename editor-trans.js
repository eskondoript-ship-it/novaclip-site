/* ============================================================================
   editor-trans.js — the transitions, where you can see them and reach them
   ============================================================================
   TWO PROBLEMS, AND THE SECOND ONE MADE THE FIRST ONE INVISIBLE.

   The first is in editor-fx.js: every transition this editor had was a
   transform of the whole clip. Move the rectangle, scale it, fade it, clip it
   to a shape. That is the vocabulary a presentation tool has, which is exactly
   what it looked like. editor-fx.js now has a painter stage for transitions —
   feathered luma sweeps, directional smear, zoom blur, channel separation,
   slice displacement, film burn, liquid warp, a soft clock wipe and a grain
   dissolve — all rewriting the frame's pixels during the handover.

   The second is this file's reason to exist. The editor's Transitions panel is
   drawn by the React bundle from a list inside the bundle. Adding a transition
   to editor-fx.js therefore adds something nothing can select: the renderer
   would happily run it, and there was no way to ask for it. Nine new
   transitions that nobody can choose are nine transitions that do not exist.

   So this is a browser for them, in the pattern editor-looks.js already uses:
   its own panel, its own tiles, applied through the store so the editor's own
   undo takes it back. Every tile runs the real transition — the same TRANS
   step and the same TPAINT painter the renderer uses — over two frames, so
   what the tile does is what the cut will do.

   GOES WITH editor-fx.js. The painters live there and are read from NC_FX
   here; loaded without it, this panel finds no transitions and says so rather
   than drawing thirty-five dead tiles.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_TRANS_UI) return;

  var VERSION = 1;

  /* The catalogue. `paint` marks the ones that rewrite pixels — they are the
     answer to "these look like slides", and they are worth being able to find
     on their own, so the panel can filter to just them. */
  var CAT = {
    luma:      ['Soft sweep',      'Smooth', 1, 'A feathered edge travels across. The cut most real edits use.'],
    whip:      ['Whip pan',        'Motion', 1, 'Smears hard in the direction of travel, then settles.'],
    zoomblur:  ['Punch in',        'Motion', 1, 'Streaks outward from the centre as it pushes in.'],
    rgbsplit:  ['Channel split',   'Glitch', 1, 'Red, green and blue come apart and back together.'],
    slices:    ['Slice glitch',    'Glitch', 1, 'Horizontal bands thrown sideways and pulled back.'],
    burn:      ['Film burn',       'Light',  1, 'A warm bloom crosses the frame and takes it with it.'],
    warp:      ['Liquid warp',     'Motion', 1, 'The frame ripples apart along a travelling wave.'],
    radial:    ['Clock wipe',      'Shape',  1, 'A soft wedge sweeps around from the top.'],
    grain:     ['Grain dissolve',  'Smooth', 1, 'Breaks up into grain rather than fading flat.'],
    swirl:     ['Swirl',           'Motion', 1, 'Winds the frame up around its centre.'],
    pixelize:  ['Pixelise',        'Glitch', 1, 'Blocks grow until there is nothing left.'],
    bars:      ['Soft bars',       'Shape',  1, 'Nine bars close one after another, each one feathered.'],
    glow:      ['Bloom out',       'Light',  1, 'Highlights bleed before the frame goes.'],
    shake:     ['Camera shake',    'Motion', 1, 'Handheld knock with the smear that comes with it.'],
    stretch:   ['Stretch',         'Motion', 1, 'Edges pull away while the middle holds.'],
    circle:    ['Soft circle',     'Shape',  1, 'Opens from the centre with a soft rim.'],
    rollup:    ['Roll up',         'Smooth', 1, 'The soft sweep, running down the frame.'],
    invert:    ['Negative hit',    'Glitch', 1, 'One hard negative flash at the midpoint.'],

    fade:      ['Fade',            'Smooth', 0, 'Straight opacity. Always right, never interesting.'],
    dissolve:  ['Dissolve',        'Smooth', 0, 'Fade with a little softening on the way.'],
    blur:      ['Blur',            'Smooth', 0, 'Out of focus and back.'],
    slide:     ['Slide',           'Motion', 0, 'Moves across. The plain one.'],
    push:      ['Push',            'Motion', 0, 'Pushes the old frame out of the way.'],
    zoom:      ['Zoom',            'Motion', 0, 'Scales up from small.'],
    spin:      ['Spin',            'Motion', 0, 'Rotates in while it scales.'],
    swing:     ['Swing',           'Motion', 0, 'Rocks in on a hinge.'],
    elastic:   ['Elastic',         'Motion', 0, 'Overshoots and settles.'],
    ripple:    ['Ripple',          'Motion', 0, 'Squashes and stretches.'],
    morph:     ['Morph',           'Motion', 0, 'Stretches tall, then resolves.'],
    glitch:    ['Jitter',          'Glitch', 0, 'Shakes with a hue shift.'],
    shatter:   ['Shatter',         'Glitch', 0, 'Shakes apart on the way out.'],
    vhs:       ['VHS',             'Glitch', 0, 'Tape wobble and bleed.'],
    flash:     ['Flash',           'Light',  0, 'Blows out white and comes back.'],
    lightleak: ['Light leak',      'Light',  0, 'Warms and lifts across the cut.'],
    wipe:      ['Wipe',            'Shape',  0, 'A hard edge across.'],
    iris:      ['Iris',            'Shape',  0, 'Opens from a circle.'],
    shutter:   ['Shutter',         'Shape',  0, 'Slatted bars.'],
    barn:      ['Barn doors',      'Shape',  0, 'Opens from the middle.'],
    checker:   ['Checker',         'Shape',  0, 'A grid fills in.'],
    cube:      ['Cube',            'Shape',  0, 'A face turning towards you.'],
    fold:      ['Fold',            'Shape',  0, 'Folds down to a line.'],
    heart:     ['Heart',           'Shape',  0, 'Opens from a heart.'],
    diamond:   ['Diamond',         'Shape',  0, 'Opens from a diamond.'],
    pageCurl:  ['Page turn',       'Shape',  0, 'Peels away at an angle.']
  };
  var CATS = ['All', 'New', 'Smooth', 'Motion', 'Glitch', 'Light', 'Shape'];

  /* THE EFFECTS HAVE THE SAME PROBLEM THE TRANSITIONS HAD. The editor's
     Effects panel is drawn by the bundle from a list inside the bundle, so the
     eight painters added to editor-fx.js — duotone, tilt-shift, chromatic
     aberration, fisheye, bloom, god rays, soft focus and kaleidoscope — are
     eight things the renderer will apply and nothing can ask for. Same answer:
     list them here, with a strength, applied through the store. */
  var FXCAT = {
    bloom:     ['Bloom',        'The bright parts bleed into what is beside them.'],
    rays:      ['God rays',     'Shafts thrown out from the highlights.'],
    dreamy:    ['Soft focus',   'The portrait look — soft, without losing the midtones.'],
    chroma:    ['Lens fringe',  'Channels separate towards the corners, like a real lens.'],
    tiltshift: ['Tilt-shift',   'Top and bottom go soft; the middle stays sharp.'],
    duotone:   ['Duotone',      'Shadows one colour, highlights another.'],
    fisheye:   ['Fisheye',      'Barrel distortion out from the centre.'],
    kaleid:    ['Kaleidoscope', 'Wedges mirrored around the middle.']
  };
  var STRENGTHS = [0.35, 0.7, 1];

  function fx() { return window.NC_FX || null; }
  function store() {
    try { return window.__ncStore && window.__ncStore.getState(); } catch (e) { return null; }
  }
  function selected() {
    var g = store();
    if (!g) return null;
    return g.clips.filter(function (c) { return c.id === g.selectedClipId; })[0] || null;
  }

  /* ==========================================================================
     THE TWO FRAMES A TILE NEEDS
     ==========================================================================
     A transition is a handover, so a preview of one needs something to hand
     over TO. One frame on its own can only show a clip disappearing, which is
     half the story and the half that looks like a fade. These are built rather
     than shipped: two cards that differ in hue and layout, so the edge between
     them is obvious at 150 pixels wide.
     ========================================================================== */
  function card(which, w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var a = which ? ['#0b2a3a', '#124e63'] : ['#2a2f5e', '#6d4a8f'];
    var gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, a[0]); gr.addColorStop(1, a[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var cols = which ? ['#34d399', '#22d3ee'] : ['#ff5bab', '#ffd23f'];
    for (var i = 0; i < 2; i++) {
      g.fillStyle = cols[i];
      if (which) g.fillRect(w * (0.12 + i * 0.42), h * 0.18, w * 0.3, h * 0.26);
      else { g.beginPath(); g.arc(w * (0.26 + i * 0.44), h * 0.33, Math.min(w, h) * 0.15, 0, 7); g.fill(); }
    }
    /* a hard horizontal edge: wipes and sweeps are invisible on a smooth
       gradient, and this is the thing they cut across */
    g.fillStyle = which ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.55)';
    g.fillRect(0, h * 0.72, w, Math.max(2, h * 0.06));
    return c;
  }

  /* One frame of the real transition, drawn the way the renderer draws it:
     the incoming clip underneath, the outgoing clip over it with its step
     applied and its painter run. */
  /* ONE SCRATCH CANVAS, NOT ONE PER FRAME.
     This used to call document.createElement('canvas') every time it drew,
     which is sixteen allocations a frame with the panel open — and the real
     cost, as it turned out. Culling the off-screen tiles and halving the
     frame rate together bought two frames a second; moving this one line out
     of the loop bought the rest. A canvas is an expensive object and the
     garbage from throwing one away sixty times a second is worse than the
     drawing it was created to do. */
  var _off = null, _offG = null;
  function offscreen(w, h) {
    if (!_off) { _off = document.createElement('canvas'); _offG = _off.getContext('2d'); }
    if (_off.width !== w) _off.width = w;
    if (_off.height !== h) _off.height = h;
    _offG.setTransform(1, 0, 0, 1, 0, 0);
    _offG.globalCompositeOperation = 'source-over';
    _offG.globalAlpha = 1;
    _offG.filter = 'none';
    _offG.clearRect(0, 0, w, h);
    return _offG;
  }

  function drawFrame(g, w, h, id, p, A, B) {
    var F = fx();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    g.drawImage(B, 0, 0, w, h);          /* what is arriving */
    if (!F) return;

    var og = offscreen(w, h), off = og.canvas;
    og.drawImage(A, 0, 0, w, h);
    if (F.TPAINT && F.TPAINT[id]) {
      try { F.TPAINT[id](og, w, h, p, 'out'); } catch (e) {}
    }

    var step;
    try { step = F.stepFor(id, p, 'out'); } catch (e) { step = null; }
    g.save();
    g.translate(w / 2, h / 2);
    var parts = [];
    if (step) {
      try { parts = F.applyStep(g, step, w, h) || []; } catch (e) { parts = []; }
      g.globalAlpha = Math.max(0, Math.min(1, step.a == null ? 1 : step.a));
    }
    g.filter = parts.length ? parts.join(' ') : 'none';
    g.drawImage(off, -w / 2, -h / 2, w, h);
    g.filter = 'none';
    g.restore();
  }

  /* ==========================================================================
     THE PANEL
     ========================================================================== */
  var panel = null, state = { q: '', cat: 'All', mode: 'Transitions' }, raf = 0, tiles = [];

  function css() {
    if (document.getElementById('nctr-css')) return;
    var st = document.createElement('style');
    st.id = 'nctr-css';
    st.textContent = [
      '.nctr{position:fixed;left:352px;bottom:104px;z-index:100002;width:min(430px,calc(100vw - 24px));',
        'max-height:min(74vh,660px);display:flex;flex-direction:column;overflow:hidden;border-radius:16px;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14));box-shadow:0 24px 60px rgba(0,0,0,.55);',
        'font:400 13px/1.5 Inter,system-ui,sans-serif}',
      '.nctr h4{margin:0;font-size:1.05rem}',
      '.nctr .hd{padding:14px 15px 10px;border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.nctr .sub{margin:5px 0 0;font-size:.78rem;color:var(--nc-dim,#8c96ad);line-height:1.5}',
      '.nctr .q{width:100%;margin-top:10px;padding:9px 11px;border-radius:9px;font-size:12.5px;',
        'background:rgba(255,255,255,.05);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.16))}',
      '.nctr .q:focus{outline:0;border-color:var(--nc-cyan,#00F0FF)}',
      '.nctr .cats{display:flex;flex-wrap:wrap;align-items:flex-start;align-content:flex-start;',
        'gap:6px;margin-top:9px}',
      /* height pinned for the reason the Looks chips needed it: a wrapped flex
         line stretches its items, and the editor's own button rules are enough
         to make one line taller than the next. */
      '.nctr .cat{border:1px solid var(--nc-line2,rgba(255,255,255,.16));background:rgba(255,255,255,.04);',
        'color:#C7D2E8;border-radius:999px;padding:0 10px;height:24px;min-height:0;flex:0 0 auto;',
        'display:inline-flex;align-items:center;box-sizing:border-box;cursor:pointer;',
        'font:600 11px/1 Inter,system-ui,sans-serif}',
      '.nctr .cat.on{background:#00F0FF;color:#04121a;border-color:#00F0FF}',
      '.nctr .grid{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 15px 14px;',
        'display:grid;grid-template-columns:1fr 1fr;gap:11px}',
      '.nctr .tile{border:1px solid var(--nc-line2,rgba(255,255,255,.14));border-radius:12px;overflow:hidden;',
        'background:rgba(255,255,255,.03);cursor:pointer;text-align:left;padding:0;color:inherit;font:inherit}',
      '.nctr .tile:hover{border-color:var(--nc-cyan,#00F0FF)}',
      '.nctr .tile canvas{display:block;width:100%;height:auto;background:#05070e}',
      '.nctr .m{padding:8px 9px 9px}',
      '.nctr .m b{display:block;font-size:.82rem;margin-bottom:2px}',
      '.nctr .m span{display:block;font-size:.71rem;color:var(--nc-dim,#8c96ad);line-height:1.45}',
      '.nctr .new{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:999px;',
        'font-size:9px;font-weight:800;background:rgba(0,240,255,.16);color:#00F0FF;vertical-align:1px}',
      '.nctr .ft{padding:10px 15px;border-top:1px solid var(--nc-line,rgba(255,255,255,.1));',
        'font-size:11.5px;color:var(--nc-dim,#8c96ad);display:flex;gap:8px;align-items:center}',
      '.nctr .ft b{color:var(--nc-text,#EAF2FF);font-weight:700}',
      '.nctr .x{margin-left:auto;width:30px;height:30px;flex:0 0 auto;border-radius:8px;cursor:pointer;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.16));color:inherit;',
        'font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center}',
      '.nctr-btn{position:fixed;left:352px;bottom:16px;z-index:100001;border:0;cursor:pointer;',
        'padding:9px 15px;border-radius:999px;font:800 12px/1 Inter,system-ui,sans-serif;',
        'background:linear-gradient(90deg,#7C3AED,#00F0FF);color:#04121a;',
        'box-shadow:0 8px 24px rgba(124,58,237,.4)}',
      '@media (max-width:900px){.nctr{left:8px;right:8px;width:auto;bottom:96px}',
        '.nctr-btn{left:8px;bottom:8px}}'
    ].join('');
    document.head.appendChild(st);
  }

  function matches(id) {
    var c = CAT[id];
    if (state.cat === 'New' && !c[2]) return false;
    if (state.cat !== 'All' && state.cat !== 'New' && c[1] !== state.cat) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    return (c[0] + ' ' + c[1] + ' ' + c[3] + ' ' + id).toLowerCase().indexOf(q) >= 0;
  }

  function say(msg) {
    var f = panel && panel.querySelector('.ft b');
    if (f) f.textContent = msg;
  }

  function apply(id, dir) {
    var g = store(), clip = selected();
    if (!g || !clip) { say('Pick a clip on the timeline first.'); return; }
    /* One history entry for the whole change, for the reason the Looks panel
       found the hard way: these store setters record nothing of their own, so
       without this the next undo steps straight past the transition to
       whatever came before it. */
    try { if (typeof g.pushHistory === 'function') g.pushHistory(); } catch (e) {}
    try {
      g.setClipTransition(clip.id, dir, { type: id, duration: 0.6 });
      say(CAT[id][0] + ' set on the ' + (dir === 'in' ? 'start' : 'end') + '. Ctrl+Z undoes it.');
    } catch (e) { say('That clip would not take it.'); }
  }

  /* An effect tile is a still, not a loop: an effect does not have a
     beginning and an end to run through, it has a strength. Three of them,
     because one preview cannot tell you what a slider does. */
  function fillEffects() {
    var grid = panel.querySelector('.grid');
    grid.textContent = '';
    tiles = [];
    var F = fx();
    var q = state.q.trim().toLowerCase();
    var ids = Object.keys(FXCAT).filter(function (id) {
      if (!F || !F.PAINT || !F.PAINT[id]) return false;
      if (!q) return true;
      return (FXCAT[id][0] + ' ' + FXCAT[id][1] + ' ' + id).toLowerCase().indexOf(q) >= 0;
    });
    if (!ids.length) {
      var n = document.createElement('p');
      n.className = 'sub';
      n.textContent = 'Nothing matches that.';
      grid.appendChild(n);
      return;
    }
    var W = 186, H = 104, A = card(0, W, H);
    ids.forEach(function (id) {
      var meta = FXCAT[id];
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.setAttribute('data-fx', id);
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      cv.setAttribute('aria-hidden', 'true');
      var g = cv.getContext('2d');
      g.drawImage(A, 0, 0, W, H);
      try { F.PAINT[id](g, W, H, 0.7, 0); } catch (e) {}
      tile.appendChild(cv);
      var m = document.createElement('div');
      m.className = 'm';
      m.innerHTML = '<b></b><span></span>';
      m.querySelector('b').textContent = meta[0];
      var tag = document.createElement('i');
      tag.className = 'new'; tag.style.fontStyle = 'normal'; tag.textContent = 'NEW';
      m.querySelector('b').appendChild(tag);
      m.querySelector('span').textContent = meta[1];
      tile.appendChild(m);
      tile.title = 'Click: 70% · Shift-click: full · Alt-click: subtle';
      tile.onclick = function (e) {
        applyFx(id, e.shiftKey ? STRENGTHS[2] : e.altKey ? STRENGTHS[0] : STRENGTHS[1]);
      };
      grid.appendChild(tile);
    });
  }

  function applyFx(id, v) {
    var g = store(), clip = selected();
    if (!g || !clip) { say('Pick a clip on the timeline first.'); return; }
    try { if (typeof g.pushHistory === 'function') g.pushHistory(); } catch (e) {}
    var one = {};
    one[id] = v;
    try {
      g.updateClipEffects(clip.id, one);
      say(FXCAT[id][0] + ' at ' + Math.round(v * 100) + '%. Ctrl+Z undoes it.');
    } catch (e) { say('That clip would not take it.'); }
  }

  function fill() {
    if (state.mode === 'Effects') { if (raf) { cancelAnimationFrame(raf); raf = 0; } return fillEffects(); }
    var grid = panel.querySelector('.grid');
    grid.textContent = '';
    tiles = [];
    var F = fx();
    if (!F || !F.TRANS) {
      var p = document.createElement('p');
      p.className = 'sub';
      p.textContent = 'editor-fx.js has not loaded, so there are no transitions to show. '
        + 'The two files go together.';
      grid.appendChild(p);
      return;
    }
    var ids = Object.keys(CAT).filter(function (id) { return F.TRANS[id] && matches(id); });
    if (!ids.length) {
      var n = document.createElement('p');
      n.className = 'sub';
      n.textContent = 'Nothing matches that. Try a feel — soft, glitch, light — or clear the search.';
      grid.appendChild(n);
      return;
    }
    var W = 186, H = 104;
    var A = card(0, W, H), B = card(1, W, H);
    ids.forEach(function (id) {
      var meta = CAT[id];
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.setAttribute('data-trans', id);
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      cv.setAttribute('aria-hidden', 'true');
      tile.appendChild(cv);
      var m = document.createElement('div');
      m.className = 'm';
      m.innerHTML = '<b></b><span></span>';
      m.querySelector('b').textContent = meta[0];
      if (meta[2]) {
        var tag = document.createElement('i');
        tag.className = 'new';
        tag.textContent = 'NEW';
        tag.style.fontStyle = 'normal';
        m.querySelector('b').appendChild(tag);
      }
      m.querySelector('span').textContent = meta[3];
      tile.appendChild(m);
      tile.title = 'Click: set at the end · Shift-click: set at the start';
      tile.onclick = function (e) { apply(id, e.shiftKey ? 'in' : 'out'); };
      grid.appendChild(tile);
      tiles.push({ id: id, g: cv.getContext('2d'), w: W, h: H, A: A, B: B });
    });
    tick();
  }

  /* ==========================================================================
     WHAT A PANEL OF PREVIEWS COSTS, AND HOW NOT TO PAY IT
     ==========================================================================
     The first version redrew every tile on every animation frame. Forty-four
     tiles, each one a transition painter over two canvases, sixty times a
     second. Measured in the editor: 60fps with the panel shut, 53fps with it
     open, and worst frames of 50ms — a visible hitch while scrubbing, caused
     by a panel that is only showing somebody what a transition looks like.

     Two things fix it and neither costs anything on screen.

     ONLY WHAT IS ON SCREEN. The grid scrolls; most of those tiles are below
     the fold at any moment. A tile nobody can see does not need redrawing,
     and the check is one rectangle comparison against the scroller.

     AND NOT SIXTY TIMES A SECOND. A transition preview reads perfectly at 30
     — it is a two-second loop, not a game. Halving the rate halves the work
     for a difference nobody can point to.
     ========================================================================== */
  var FRAME_MS = 1000 / 30;

  function tick() {
    if (raf) cancelAnimationFrame(raf);
    var t0 = performance.now(), lastDraw = 0;
    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    function visible(cv, box) {
      var r = cv.getBoundingClientRect();
      return r.bottom > box.top - 40 && r.top < box.bottom + 40;
    }

    function frame(now) {
      if (!panel) { raf = 0; return; }
      if (!reduced && now - lastDraw < FRAME_MS) { raf = requestAnimationFrame(frame); return; }
      lastDraw = now;
      /* 2.2s per cycle with a pause at each end, so a tile is readable rather
         than a strobe. Reduced motion holds the midpoint instead. */
      var p;
      if (reduced) p = 0.5;
      else {
        var u = ((now - t0) / 2200) % 1;
        p = u < 0.12 ? 0 : u > 0.78 ? 1 : (u - 0.12) / 0.66;
      }
      var grid = panel.querySelector('.grid');
      var box = grid ? grid.getBoundingClientRect() : { top: 0, bottom: 1e5 };
      for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        if (!visible(t.g.canvas, box)) continue;
        try { drawFrame(t.g, t.w, t.h, t.id, 1 - p, t.A, t.B); } catch (e) {}
      }
      raf = reduced ? 0 : requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function close() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    tiles = [];
    if (escBound) { document.removeEventListener('keydown', escBound); escBound = null; }
  }
  var escBound = null;

  function open() {
    if (panel) { close(); return; }
    css();
    panel = document.createElement('div');
    panel.className = 'nctr';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Transitions');

    var hd = document.createElement('div');
    hd.className = 'hd';
    hd.innerHTML = '<h4>⇄ Transitions</h4>'
      + '<p class="sub">Every tile is running the real transition, on two frames. '
      + 'Click to set it at the end of the selected clip; shift-click for the start.</p>';
    /* Two things in one panel rather than a third pill in the corner: they
       are both "pick a look and put it on the clip", and the editor's bottom
       edge is crowded enough. */
    var modes = document.createElement('div');
    modes.className = 'cats';
    modes.style.margin = '10px 0 0';
    ['Transitions', 'Effects'].forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat' + (state.mode === m ? ' on' : '');
      b.textContent = m;
      b.onclick = function () {
        state.mode = m;
        modes.querySelectorAll('.cat').forEach(function (x) { x.className = 'cat'; });
        b.className = 'cat on';
        panel.querySelector('.cats.sub-cats').style.display = m === 'Transitions' ? '' : 'none';
        fill();
      };
      modes.appendChild(b);
    });
    hd.appendChild(modes);

    var q = document.createElement('input');
    q.className = 'q';
    q.type = 'search';
    q.placeholder = 'Search transitions — soft, whip, glitch, burn…';
    q.oninput = function () { state.q = q.value; fill(); };
    hd.appendChild(q);

    var cats = document.createElement('div');
    cats.className = 'cats sub-cats';
    CATS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat' + (c === state.cat ? ' on' : '');
      b.textContent = c;
      b.onclick = function () {
        state.cat = c;
        cats.querySelectorAll('.cat').forEach(function (x) { x.className = 'cat'; });
        b.className = 'cat on';
        fill();
      };
      cats.appendChild(b);
    });
    hd.appendChild(cats);

    var grid = document.createElement('div');
    grid.className = 'grid';

    var ft = document.createElement('div');
    ft.className = 'ft';
    ft.innerHTML = '<b>Pick a clip, then a transition.</b>';
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'x';
    x.setAttribute('aria-label', 'Close');
    x.title = 'Close';
    x.innerHTML = '&times;';
    x.onclick = close;
    ft.appendChild(x);

    panel.appendChild(hd);
    panel.appendChild(grid);
    panel.appendChild(ft);
    document.body.appendChild(panel);

    escBound = function (e) { if (e.key === 'Escape' && panel) close(); };
    document.addEventListener('keydown', escBound);
    fill();
  }

  function button() {
    if (document.querySelector('.nctr-btn')) return;
    css();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nctr-btn';
    b.textContent = '⇄ Transitions';
    b.title = 'Browse every transition, running';
    b.onclick = open;
    document.body.appendChild(b);
  }

  window.NC_TRANS_UI = { version: VERSION, open: open, close: close, cats: CATS, list: CAT, effects: FXCAT };

  function boot() {
    var tries = 0;
    var t = setInterval(function () {
      if (window.__ncStore || tries++ > 60) { clearInterval(t); button(); }
    }, 250);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
}());
