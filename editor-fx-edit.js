/* NOVACLIP — EDITING AN EFFECT OR A TRANSITION, NOT JUST PICKING ONE
 * ===========================================================================
 * Asked for, with a picture of gl-transitions.com: parameter sliders, a
 * duration and delay, and a draggable easing curve. Until now the FX library
 * applied a transition at a fixed 0.6s with a fixed linear progress, and an
 * effect at one of three canned strengths. You could choose a look; you could
 * not shape it.
 *
 * WHERE THE SETTINGS LIVE, AND THE HONEST LIMIT OF IT
 * ---------------------------------------------------------------------------
 * A painter is called as fn(g, w, h, v) or fn(g, w, h, p, dir). It is handed
 * pixels and a number and NOTHING ELSE — no clip, no id, no context. So a
 * painter cannot look up "what did the user set for me, on this clip".
 *
 * The honest consequence, stated here rather than discovered later: settings
 * are PER EFFECT, not per clip. Set Oil paint to a radius of 3 and every clip
 * using Oil paint gets radius 3. For one person cutting one video — which is
 * what this editor is for — that is almost always what they meant anyway. It
 * is wrong for a project that deliberately uses the same effect twice at
 * different settings, and that case needs the bundle's own clip schema to
 * carry the parameters, which is not something a sidecar can add.
 *
 * Duration is the exception and is genuinely per clip, because the bundle
 * already stores it: setClipTransition(id, dir, {type, duration}).
 *
 * HOW IT TAKES EFFECT
 * ---------------------------------------------------------------------------
 * By wrapping the pack's own painters. NC_FX.PAINT[id] and .TPAINT[id] are
 * plain functions in a plain object, so each one is replaced with a wrapper
 * that reads the current settings, remaps progress through the easing curve,
 * exposes the parameters, and then calls the original. Nothing in the
 * renderer changes and nothing in the bundle is patched.
 *
 * It wraps ONLY ids this pack owns. editor-fx.js's own painters are left
 * exactly as they are — they were written against a bare strength and have no
 * parameters to read, and wrapping them would mean this file silently owning
 * behaviour it did not write.
 *
 * THE EASING CURVE IS A REAL CUBIC BEZIER
 * ---------------------------------------------------------------------------
 * Two draggable control points, same shape as the one in the picture and the
 * same maths CSS uses for cubic-bezier(). Solved by bisection rather than
 * Newton: it runs once per frame on a value already between 0 and 1, so
 * twenty iterations of bisection is nothing, and it cannot diverge the way
 * Newton can on the near-vertical curves people actually drag these into.
 */
(function () {
  'use strict';
  if (window.NC_FX_EDIT) return;

  var STORE_KEY = 'nc_fx_settings';

  /* ---- what each thing can be adjusted by --------------------------------
     Declared, not invented. An effect only appears with a parameter here if
     there is a real second dimension to it — a radius, a count, an angle.
     Giving all 43 a fake knob so the panel looks richer would be padding of
     the worst sort, because every one of those sliders would be a promise
     that moving it does something.

     `v` (strength) is implicit on every effect and is not listed. */
  var PARAMS = {
    /* effects */
    oil:          [{ k: 'radius',  label: 'Brush size',   min: 1, max: 5,  step: 1,    def: 2 }],
    bokeh:        [{ k: 'size',    label: 'Disc size',    min: .5, max: 2, step: .05,  def: 1 }],
    stainedglass: [{ k: 'cells',   label: 'Cell size',    min: .5, max: 2, step: .05,  def: 1 }],
    glassblocks:  [{ k: 'grid',    label: 'Blocks',       min: 3, max: 14, step: 1,    def: 7 }],
    tunnel:       [{ k: 'depth',   label: 'Repeats',      min: 2, max: 9,  step: 1,    def: 5 }],
    echo:         [{ k: 'ghosts',  label: 'Ghosts',       min: 1, max: 7,  step: 1,    def: 4 }],
    dither:       [{ k: 'levels',  label: 'Levels',       min: 2, max: 10, step: 1,    def: 4 }],
    crt:          [{ k: 'gap',     label: 'Scanline gap', min: .5, max: 3, step: .1,   def: 1 }],
    motionblur:   [{ k: 'angle',   label: 'Angle',        min: 0, max: 180, step: 5,   def: 0 }],
    twirl:        [{ k: 'turns',   label: 'Turns',        min: .5, max: 4, step: .1,   def: 2.2 }],
    pincushion:   [{ k: 'amount',  label: 'Amount',       min: .1, max: 1, step: .05,  def: .45 }],
    /* transitions */
    venetian:     [{ k: 'slats',   label: 'Slats',        min: 4, max: 24, step: 1,    def: 12 }],
    blinds:       [{ k: 'slats',   label: 'Blinds',       min: 4, max: 20, step: 1,    def: 10 }],
    spiral:       [{ k: 'turns',   label: 'Turns',        min: 1, max: 5,  step: .1,   def: 2.2 }],
    mosaicshuffle:[{ k: 'tiles',   label: 'Tiles',        min: 5, max: 20, step: 1,    def: 12 }],
    melt:         [{ k: 'columns', label: 'Columns',      min: 8, max: 48, step: 2,    def: 26 }],
    inkbleed:     [{ k: 'blots',   label: 'Blots',        min: 4, max: 24, step: 1,    def: 14 }],
    tilesflip:    [{ k: 'tiles',   label: 'Tiles',        min: 3, max: 12, step: 1,    def: 7 }],
    blockslide:   [{ k: 'rows',    label: 'Rows',         min: 3, max: 18, step: 1,    def: 9 }],
    ripplegrid:   [{ k: 'cells',   label: 'Cells',        min: 4, max: 16, step: 1,    def: 10 }],
    glasswipe:    [{ k: 'band',    label: 'Band width',   min: .06, max: .4, step: .01, def: .16 }],
    lensflare:    [{ k: 'ghosts',  label: 'Ghosts',       min: 0, max: 6,  step: 1,    def: 3 }],
    wobble:       [{ k: 'waves',   label: 'Waves',        min: 4, max: 24, step: 1,    def: 12 }],
    vortex:       [{ k: 'spin',    label: 'Spin',         min: 1, max: 6,  step: .2,   def: 3.4 }]
  };

  /* The presets in the easing dropdown. The four CSS names plus the two that
     an edit actually wants: a hard snap at the end, and an overshoot. */
  var CURVES = {
    'Linear':      [0, 0, 1, 1],
    'Ease':        [.25, .1, .25, 1],
    'Ease in':     [.42, 0, 1, 1],
    'Ease out':    [0, 0, .58, 1],
    'Ease in out': [.42, 0, .58, 1],
    'Snap':        [.9, .05, 1, .55],
    'Overshoot':   [.34, 1.4, .64, 1]
  };

  var DEF = { duration: 0.6, delay: 0, curve: [0, 0, 1, 1], params: {} };

  var settings = {};
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) settings = JSON.parse(raw) || {};
  } catch (e) { settings = {}; }

  function cfg(id) {
    if (!settings[id]) {
      settings[id] = { duration: DEF.duration, delay: DEF.delay,
                       curve: DEF.curve.slice(), params: {} };
      var ps = PARAMS[id] || [];
      for (var i = 0; i < ps.length; i++) settings[id].params[ps[i].k] = ps[i].def;
    }
    return settings[id];
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ---- the curve ---------------------------------------------------------
     cubic-bezier(x1,y1,x2,y2) with P0 at (0,0) and P3 at (1,1), exactly as
     CSS defines it. x is time, y is progress. Given a time, find the t whose
     x matches, then read that t's y. */
  function bez(a, b, t) {
    var mt = 1 - t;
    return 3 * mt * mt * t * a + 3 * mt * t * t * b + t * t * t;
  }
  function solve(c, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var lo = 0, hi = 1, t = x;
    /* Bisection, twenty rounds: accurate to about one part in a million,
       which is far finer than a frame, and it cannot run away on a curve
       dragged near-vertical the way Newton's method can. */
    for (var i = 0; i < 20; i++) {
      t = (lo + hi) / 2;
      if (bez(c[0], c[2], t) < x) lo = t; else hi = t;
    }
    return bez(c[1], c[3], t);
  }

  /* ---- wrapping the pack's painters -------------------------------------- */
  var wrapped = false;
  function wrap() {
    var pack = window.NC_FX_PACK, fx = window.NC_FX;
    if (wrapped || !pack || !fx) return false;

    var ours = {};
    Object.keys(pack.PAINT).forEach(function (k) { ours['fx:' + k] = true; });
    Object.keys(pack.TPAINT).forEach(function (k) { ours['tr:' + k] = true; });

    Object.keys(pack.PAINT).forEach(function (id) {
      var real = fx.PAINT[id];
      if (typeof real !== 'function') return;
      fx.PAINT[id] = function (g, w, h, v) {
        window.NC_FX_EDIT.current = cfg(id).params;
        return real(g, w, h, v);
      };
    });

    Object.keys(pack.TPAINT).forEach(function (id) {
      var real = fx.TPAINT[id];
      if (typeof real !== 'function') return;
      fx.TPAINT[id] = function (g, w, h, p, dir) {
        var c = cfg(id);
        window.NC_FX_EDIT.current = c.params;
        /* Delay first, then easing. The delay eats the front of the run, so
           a 0.2 delay means nothing happens for the first fifth and the
           whole transition is squeezed into the remaining four fifths —
           which is what a delay means on a timeline, rather than making the
           transition late and letting it run off the end of the clip. */
        var d = c.delay || 0;
        var q = d > 0 ? Math.max(0, (p - d) / Math.max(1e-6, 1 - d)) : p;
        return real(g, w, h, solve(c.curve, Math.min(1, q)), dir);
      };
    });

    wrapped = true;
    return true;
  }

  /* ---- reading a parameter from inside a painter --------------------------
     The painters in editor-fx-pack.js call this. Anything that has not
     declared a parameter, or is running before the editor has loaded, gets
     the fallback and behaves exactly as it did before. */
  function param(id, key, fallback) {
    try {
      var p = settings[id] && settings[id].params;
      if (p && typeof p[key] === 'number') return p[key];
    } catch (e) {}
    return fallback;
  }

  window.NC_FX_EDIT = {
    PARAMS: PARAMS, CURVES: CURVES,
    cfg: cfg, save: save, param: param, solve: solve, wrap: wrap,
    current: {}
  };

  /* =========================================================================
     THE EDITOR
     ========================================================================= */
  var CSS = [
    '.ncfe-gear{position:absolute;top:5px;right:5px;width:21px;height:21px;padding:0;',
      'border:1px solid rgba(255,255,255,.18);border-radius:6px;cursor:pointer;z-index:3;',
      'background:rgba(10,8,20,.72);color:#C4B5FD;font:600 11px/1 system-ui;display:grid;',
      'place-items:center;opacity:0;transition:opacity .12s}',
    '.nctr .tile{position:relative}',
    '.nctr .tile:hover .ncfe-gear,.ncfe-gear:focus{opacity:1}',
    '.ncfe{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;',
      'background:#0B0A14;border-radius:inherit;overflow:hidden}',
    '.ncfe-hd{display:flex;align-items:center;gap:8px;padding:12px 14px;',
      'border-bottom:1px solid rgba(255,255,255,.08);flex:0 0 auto}',
    '.ncfe-hd b{font-size:13px;color:#fff}',
    '.ncfe-hd span{font-size:10px;color:#8B93AD}',
    '.ncfe-x{margin-left:auto;background:none;border:0;color:#8B93AD;cursor:pointer;',
      'font-size:17px;line-height:1;padding:3px 6px}',
    '.ncfe-bd{flex:1 1 auto;overflow-y:auto;padding:12px 14px;display:grid;gap:14px}',
    '.ncfe-prev{display:block;width:100%;max-width:300px;margin:0 auto;border-radius:9px;',
      'background:#000;aspect-ratio:16/9}',
    '.ncfe-sec{border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 11px}',
    '.ncfe-sec>h5{margin:0 0 9px;font:600 9px/1 system-ui;letter-spacing:.11em;',
      'text-transform:uppercase;color:#7E8AA6}',
    '.ncfe-row{display:grid;grid-template-columns:78px 1fr 40px;align-items:center;',
      'gap:8px;margin:0 0 7px}',
    '.ncfe-row:last-child{margin-bottom:0}',
    '.ncfe-row label{font-size:11px;color:#C9D1E4}',
    '.ncfe-row output{font:600 10px/1 ui-monospace,monospace;color:#A78BFA;text-align:right}',
    '.ncfe-row input[type=range]{width:100%;accent-color:#7C5CFF}',
    '.ncfe-curve{display:block;width:100%;max-width:230px;margin:2px auto 8px;',
      'border-radius:8px;background:rgba(255,255,255,.03);cursor:crosshair;touch-action:none}',
    '.ncfe-pre{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}',
    '.ncfe-pre button{font:600 9px/1 system-ui;padding:4px 7px;border-radius:6px;cursor:pointer;',
      'color:#A9B2C9;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}',
    '.ncfe-pre button.on{color:#fff;background:rgba(124,92,255,.3);border-color:#7C5CFF}',
    '.ncfe-ft{flex:0 0 auto;display:flex;gap:8px;padding:11px 14px;',
      'border-top:1px solid rgba(255,255,255,.08)}',
    '.ncfe-ft button{flex:1;padding:8px;border-radius:9px;cursor:pointer;',
      'font:700 11px/1 system-ui;border:1px solid rgba(255,255,255,.12);',
      'background:rgba(255,255,255,.05);color:#C9D1E4}',
    '.ncfe-ft button.go{background:#7C5CFF;border-color:#7C5CFF;color:#fff}'
  ].join('');

  function css() {
    if (document.getElementById('ncfe-css')) return;
    var s = document.createElement('style');
    s.id = 'ncfe-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function round(v, step) {
    var d = (String(step).split('.')[1] || '').length;
    return Number(v).toFixed(d);
  }

  /* ---- the curve editor -------------------------------------------------- */
  function drawCurve(cv, c, drag) {
    var g = cv.getContext('2d'), W = cv.width, H = cv.height, P = 16;
    var X = function (x) { return P + x * (W - P * 2); };
    /* y inverted, and the box allows a bit of overshoot above 1 and below 0
       so an Overshoot curve is not drawn clipped flat against the lid. */
    var Y = function (y) { return H - P - ((y + .4) / 1.8) * (H - P * 2); };
    g.clearRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gx = X(i / 4), gy = Y(i / 4);
      g.beginPath(); g.moveTo(gx, P * .4); g.lineTo(gx, H - P * .4); g.stroke();
      g.beginPath(); g.moveTo(P * .4, gy); g.lineTo(W - P * .4, gy); g.stroke();
    }
    g.strokeStyle = 'rgba(255,255,255,.16)';
    g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(1), Y(1)); g.stroke();
    /* handles */
    g.strokeStyle = 'rgba(167,139,250,.5)';
    g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(c[0]), Y(c[1])); g.stroke();
    g.beginPath(); g.moveTo(X(1), Y(1)); g.lineTo(X(c[2]), Y(c[3])); g.stroke();
    /* the curve itself */
    g.strokeStyle = '#A78BFA'; g.lineWidth = 2;
    g.beginPath();
    for (var k = 0; k <= 60; k++) {
      var t = k / 60, x = bez(c[0], c[2], t), y = bez(c[1], c[3], t);
      if (k === 0) g.moveTo(X(x), Y(y)); else g.lineTo(X(x), Y(y));
    }
    g.stroke();
    [[c[0], c[1], 0], [c[2], c[3], 1]].forEach(function (p, idx) {
      g.fillStyle = drag === idx ? '#fff' : '#7C5CFF';
      g.beginPath(); g.arc(X(p[0]), Y(p[1]), 5.5, 0, 6.2832); g.fill();
    });
    g.lineWidth = 1;
  }

  function wireCurve(cv, c, onchange) {
    var drag = -1;
    var P = 16;
    function pt(e) {
      var r = cv.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width * cv.width - P) / (cv.width - P * 2);
      var y = (cv.height - P - (e.clientY - r.top) / r.height * cv.height)
              / (cv.height - P * 2) * 1.8 - .4;
      return [x, y];
    }
    cv.addEventListener('pointerdown', function (e) {
      var p = pt(e);
      var d0 = Math.hypot(p[0] - c[0], p[1] - c[1]);
      var d1 = Math.hypot(p[0] - c[2], p[1] - c[3]);
      drag = d0 < d1 ? 0 : 1;
      cv.setPointerCapture(e.pointerId);
      move(e);
    });
    function move(e) {
      if (drag < 0) return;
      var p = pt(e);
      /* x is time and must stay inside the run; y is progress and may
         overshoot, which is the whole point of an overshoot curve. */
      var x = Math.max(0, Math.min(1, p[0])), y = Math.max(-.4, Math.min(1.4, p[1]));
      if (drag === 0) { c[0] = x; c[1] = y; } else { c[2] = x; c[3] = y; }
      drawCurve(cv, c, drag);
      onchange();
    }
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', function () { drag = -1; drawCurve(cv, c, -1); });
    cv.addEventListener('pointercancel', function () { drag = -1; drawCurve(cv, c, -1); });
  }

  /* ---- the panel --------------------------------------------------------- */
  var open = null;

  function close() {
    if (open && open.parentNode) open.parentNode.removeChild(open);
    open = null;
  }

  function editor(id, kind) {
    css(); close();
    var host = document.querySelector('.nctr');
    if (!host) return;
    var ui = window.NC_TRANS_UI;
    var meta = (kind === 'tr' ? ui.list[id] : ui.effects[id]) || [id, '', 0, ''];
    var label = meta[0], blurb = kind === 'tr' ? meta[3] : meta[1];
    var c = cfg(id);

    var box = document.createElement('div');
    box.className = 'ncfe';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Edit ' + label);

    var ps = PARAMS[id] || [];
    var paramRows = ps.map(function (p) {
      var v = (typeof c.params[p.k] === 'number') ? c.params[p.k] : p.def;
      return '<div class="ncfe-row"><label for="ncfe-' + p.k + '">' + p.label + '</label>' +
        '<input id="ncfe-' + p.k + '" type="range" data-p="' + p.k + '" min="' + p.min +
        '" max="' + p.max + '" step="' + p.step + '" value="' + v + '">' +
        '<output>' + round(v, p.step) + '</output></div>';
    }).join('');

    box.innerHTML =
      '<div class="ncfe-hd"><div><b>' + label + '</b><br><span>' + (blurb || '') + '</span></div>' +
        '<button class="ncfe-x" title="Back to the library">&times;</button></div>' +
      '<div class="ncfe-bd">' +
        '<canvas class="ncfe-prev" width="300" height="169"></canvas>' +
        (ps.length ? '<div class="ncfe-sec"><h5>Parameters</h5>' + paramRows + '</div>' : '') +
        (kind === 'tr'
          ? '<div class="ncfe-sec"><h5>Timing</h5>' +
            '<canvas class="ncfe-curve" width="230" height="150"></canvas>' +
            '<div class="ncfe-pre">' +
              Object.keys(CURVES).map(function (n) {
                return '<button data-c="' + n + '">' + n + '</button>';
              }).join('') + '</div>' +
            '<div class="ncfe-row" style="margin-top:10px"><label>Duration</label>' +
              '<input type="range" data-t="duration" min="0.15" max="3" step="0.05" value="' +
              c.duration + '"><output>' + c.duration.toFixed(2) + 's</output></div>' +
            '<div class="ncfe-row"><label>Delay</label>' +
              '<input type="range" data-t="delay" min="0" max="0.6" step="0.02" value="' +
              c.delay + '"><output>' + c.delay.toFixed(2) + '</output></div>' +
            '</div>'
          : '<div class="ncfe-sec"><h5>Strength</h5>' +
            '<div class="ncfe-row"><label>Amount</label>' +
              '<input type="range" data-t="strength" min="0.05" max="1" step="0.05" value="' +
              (c.strength || 0.7) + '"><output>' +
              Math.round((c.strength || 0.7) * 100) + '%</output></div></div>') +
      '</div>' +
      '<div class="ncfe-ft"><button class="back">Back</button>' +
        '<button class="go">Apply to selected clip</button></div>';

    host.appendChild(box);
    open = box;

    /* live preview */
    var prev = box.querySelector('.ncfe-prev');
    var pg = prev.getContext('2d');
    var A = document.createElement('canvas'), B = document.createElement('canvas');
    A.width = B.width = 300; A.height = B.height = 169;
    (function cards() {
      [[A, '#1b2a6b', '#c23f7a', 'A'], [B, '#0d5c4a', '#f0c040', 'B']].forEach(function (s) {
        var g = s[0].getContext('2d');
        var gr = g.createLinearGradient(0, 0, 300, 169);
        gr.addColorStop(0, s[1]); gr.addColorStop(1, s[2]);
        g.fillStyle = gr; g.fillRect(0, 0, 300, 169);
        g.fillStyle = 'rgba(255,255,255,.92)';
        g.font = '700 54px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(s[3], 150, 84);
        g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3;
        for (var i = 1; i < 5; i++) {
          g.beginPath(); g.moveTo(i * 60, 0); g.lineTo(i * 60 - 22, 169); g.stroke();
        }
      });
    }());

    var raf = 0, t0 = performance.now();
    function frame(now) {
      if (!open) { raf = 0; return; }
      var fx = window.NC_FX;
      pg.setTransform(1, 0, 0, 1, 0, 0);
      pg.clearRect(0, 0, 300, 169);
      if (kind === 'tr') {
        var cyc = 2400, el = (now - t0) % cyc, p = Math.min(1, Math.max(0, (el - 250) / 1700));
        pg.drawImage(B, 0, 0);
        var tmp = document.createElement('canvas'); tmp.width = 300; tmp.height = 169;
        var tg = tmp.getContext('2d');
        tg.drawImage(A, 0, 0);
        try { if (fx && fx.TPAINT[id]) fx.TPAINT[id](tg, 300, 169, p, 'out'); } catch (e) {}
        pg.drawImage(tmp, 0, 0);
      } else {
        pg.drawImage(A, 0, 0);
        var sv = (c.strength || 0.7);
        try { if (fx && fx.PAINT[id]) fx.PAINT[id](pg, 300, 169, sv); } catch (e) {}
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* curve */
    var cv = box.querySelector('.ncfe-curve');
    if (cv) {
      drawCurve(cv, c.curve, -1);
      wireCurve(cv, c.curve, function () {
        save();
        box.querySelectorAll('.ncfe-pre button').forEach(function (b) { b.className = ''; });
      });
      box.querySelectorAll('.ncfe-pre button').forEach(function (b) {
        var name = b.getAttribute('data-c');
        if (CURVES[name].join() === c.curve.join()) b.className = 'on';
        b.onclick = function () {
          c.curve = CURVES[name].slice();
          /* cfg(id) returned the live object, so the editor's own reference
             has to be repointed too or the canvas keeps drawing the old one. */
          cfg(id).curve = c.curve;
          drawCurve(cv, c.curve, -1);
          box.querySelectorAll('.ncfe-pre button').forEach(function (x) { x.className = ''; });
          b.className = 'on';
          save();
        };
      });
    }

    box.querySelectorAll('input[type=range]').forEach(function (r) {
      r.oninput = function () {
        var out = r.parentNode.querySelector('output');
        var v = parseFloat(r.value);
        var pk = r.getAttribute('data-p'), tk = r.getAttribute('data-t');
        if (pk) {
          c.params[pk] = v;
          var spec = ps.filter(function (x) { return x.k === pk; })[0];
          out.textContent = round(v, spec ? spec.step : 0.01);
        } else if (tk === 'duration') { c.duration = v; out.textContent = v.toFixed(2) + 's'; }
        else if (tk === 'delay')      { c.delay = v;    out.textContent = v.toFixed(2); }
        else if (tk === 'strength')   { c.strength = v; out.textContent = Math.round(v * 100) + '%'; }
        save();
      };
    });

    function shut() { if (raf) cancelAnimationFrame(raf); close(); }
    box.querySelector('.ncfe-x').onclick = shut;
    box.querySelector('.back').onclick = shut;
    box.querySelector('.go').onclick = function () {
      var ok = window.NC_FX_EDIT.applyNow(id, kind);
      if (ok) shut();
    };
  }

  /* Applying uses the panel's own store wiring where it can, so history and
     undo behave exactly as they do from a tile click. */
  function applyNow(id, kind) {
    var st;
    try { st = window.__ncStore && window.__ncStore.getState(); } catch (e) {}
    if (!st) return false;
    var clip = null;
    try {
      clip = st.clips.filter(function (c) { return c.id === st.selectedClipId; })[0] || null;
    } catch (e) {}
    if (!clip) { alert('Pick a clip on the timeline first.'); return false; }
    try { if (typeof st.pushHistory === 'function') st.pushHistory(); } catch (e) {}
    var c = cfg(id);
    try {
      if (kind === 'tr') {
        st.setClipTransition(clip.id, 'out', { type: id, duration: c.duration });
      } else {
        var one = {}; one[id] = (c.strength || 0.7);
        st.updateClipEffects(clip.id, one);
      }
      return true;
    } catch (e) { alert('That clip would not take it.'); return false; }
  }

  /* ---- a gear on every tile ---------------------------------------------- */
  function gears() {
    var panel = document.querySelector('.nctr');
    if (!panel) return;
    css();
    var ui = window.NC_TRANS_UI, pack = window.NC_FX_PACK;
    if (!ui || !pack) return;
    panel.querySelectorAll('.tile').forEach(function (tile) {
      if (tile.querySelector('.ncfe-gear')) return;
      /* data-fx / data-trans, which editor-trans.js puts on every tile. The
         first version matched the heading text against the catalogue and
         found nothing, because the NEW badge is appended INSIDE the <b> —
         so the heading reads "StarburstNEW" and no catalogue label equals
         it. The attribute was there the whole time. */
      var id = tile.getAttribute('data-fx') || tile.getAttribute('data-trans');
      if (!id) return;
      /* Only ours: editor-fx.js's painters have no parameters and no easing
         wrapper, so offering an editor for them would promise nothing. */
      var isFx = !!tile.getAttribute('data-fx');
      var mine = isFx ? pack.PAINT[id] : pack.TPAINT[id];
      if (!mine) return;
      var gear = document.createElement('button');
      gear.type = 'button';
      gear.className = 'ncfe-gear';
      gear.textContent = '⚙';
      gear.title = 'Edit ' + name;
      gear.onclick = function (e) {
        e.stopPropagation(); e.preventDefault();
        editor(id, isFx ? 'fx' : 'tr');
      };
      tile.appendChild(gear);
    });
  }

  /* =========================================================================
     DRAG IT ON, AND SEE IT AS A BUTTON — THE CAPCUT SHAPE
     =========================================================================
     Asked for: drag an effect onto the clip, and have it show as a button
     rather than a percentage buried in a properties panel.

     WHAT THE BUNDLE WOULD AND WOULD NOT GIVE ME, measured before building
     rather than assumed. A timeline clip carries NO handle back to its id:
     no data attribute holds it, no element has the clip's name as its own
     text, and the production React build exposes no fiber to read props
     from. Dropping onto one specific clip is therefore not something a
     sidecar can do honestly — it would have to guess which clip was under
     the cursor from pixel arithmetic over a scale and scroll offset the
     bundle also does not expose, and guess wrong at the edges.

     What IS reliable is the store: selectedClipId, selectClip and
     updateClipEffects all exist and work. So the drop applies to the
     SELECTED clip, and the bar says so in as many words rather than leaving
     somebody to discover it by dropping on the wrong one. Clicking a clip to
     select it is one motion the editor already supports; the drag is the
     second. It is the CapCut gesture with one honest caveat printed on it.

     The bar is this file's own element, docked above the timeline, because
     every attempt to anchor to the bundle's layout found nothing stable to
     anchor to. */
  var BARCSS = [
    '.ncfx-bar{position:fixed;left:50%;transform:translateX(-50%);z-index:30;',
      'display:flex;align-items:center;gap:7px;max-width:min(880px,94vw);',
      'padding:6px 9px;border-radius:12px;background:rgba(11,10,20,.93);',
      'border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px);',
      'font:600 10px/1 system-ui;overflow-x:auto;scrollbar-width:none}',
    '.ncfx-bar::-webkit-scrollbar{display:none}',
    '.ncfx-bar.drop{border-color:#7C5CFF;background:rgba(124,92,255,.2)}',
    '.ncfx-bar>i{font-style:normal;color:#7E8AA6;white-space:nowrap;flex:0 0 auto}',
    '.ncfx-chip{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;',
      'padding:5px 6px 5px 9px;border-radius:999px;cursor:pointer;white-space:nowrap;',
      'color:#E6E9F2;background:rgba(124,92,255,.22);border:1px solid rgba(124,92,255,.5)}',
    '.ncfx-chip:hover{background:rgba(124,92,255,.36)}',
    '.ncfx-chip b{font-weight:700}',
    '.ncfx-chip u{text-decoration:none;color:#A78BFA;font-size:9px;opacity:.85}',
    '.ncfx-chip span{display:grid;place-items:center;width:15px;height:15px;border-radius:50%;',
      'background:rgba(0,0,0,.4);color:#C9D1E4;font-size:11px;line-height:1}',
    '.ncfx-chip span:hover{background:#ff4d6a;color:#fff}',
    '.nctr .tile[draggable]{cursor:grab}',
    '.nctr .tile.dragging{opacity:.5}'
  ].join('');

  function barcss() {
    if (document.getElementById('ncfx-barcss')) return;
    var s = document.createElement('style');
    s.id = 'ncfx-barcss'; s.textContent = BARCSS;
    document.head.appendChild(s);
  }

  var bar = null;

  function selClip() {
    try {
      var st = window.__ncStore.getState();
      return st.clips.filter(function (c) { return c.id === st.selectedClipId; })[0] || null;
    } catch (e) { return null; }
  }

  /* The effects actually on the selected clip: every non-zero key of its
     effects object, named from whichever catalogue knows it. The bundle's own
     36 are included — somebody wanting to see what is on a clip does not care
     which file implements it. */
  function activeOn(clip) {
    if (!clip || !clip.effects) return [];
    var ui = window.NC_TRANS_UI, out = [];
    for (var k in clip.effects) {
      if (!Object.prototype.hasOwnProperty.call(clip.effects, k)) continue;
      var v = clip.effects[k];
      if (!(typeof v === 'number' && v > 0.001)) continue;
      var label = k;
      try { if (ui && ui.effects[k]) label = ui.effects[k][0]; } catch (e) {}
      if (label === k) label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
      out.push({ id: k, label: label, v: v, mine: !!(window.NC_FX_PACK && window.NC_FX_PACK.PAINT[k]) });
    }
    return out;
  }

  function setEffect(id, v) {
    var clip = selClip();
    if (!clip) return false;
    try {
      var st = window.__ncStore.getState();
      if (typeof st.pushHistory === 'function') st.pushHistory();
      var one = {}; one[id] = v;
      st.updateClipEffects(clip.id, one);
      return true;
    } catch (e) { return false; }
  }

  function place() {
    if (!bar) return;
    /* Above the pill row if it is there, otherwise above the bottom edge.
       Measured rather than hard-coded, the same way editor-layout.js places
       the pills, because the timeline's height changes with the layout. */
    var y = 118;
    try {
      var pill = document.querySelector('.nctr-btn');
      if (pill) {
        var r = pill.getBoundingClientRect();
        if (r.height) y = Math.max(54, window.innerHeight - r.top + 8);
      }
    } catch (e) {}
    bar.style.bottom = y + 'px';
  }

  function paintBar() {
    var clip = selClip();
    var list = activeOn(clip);
    if (!bar) {
      barcss();
      bar = document.createElement('div');
      bar.className = 'ncfx-bar';
      document.body.appendChild(bar);
      ['dragenter', 'dragover'].forEach(function (ev) {
        bar.addEventListener(ev, function (e) {
          e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
          bar.classList.add('drop');
        });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        bar.addEventListener(ev, function () { bar.classList.remove('drop'); });
      });
      bar.addEventListener('drop', onDrop);
    }
    place();
    if (!clip) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    bar.textContent = '';
    var hint = document.createElement('i');
    hint.textContent = list.length ? 'On this clip:' : 'Drag an effect here →';
    bar.appendChild(hint);

    list.forEach(function (fx) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ncfx-chip';
      chip.title = fx.mine ? 'Click to edit · × to remove' : 'Click to adjust · × to remove';
      var b = document.createElement('b'); b.textContent = fx.label;
      /* NO PERCENTAGE. A chip is the thing itself, the way CapCut shows it —
         "Starburst", not "Starburst 70%". The strength still exists and is
         still editable; it belongs in the editor behind the chip, not
         printed on the face of a button whose job is to say what is on the
         clip. A number there turns a label into a readout. */
      var u = document.createElement('u'); u.textContent = '';
      u.style.display = 'none';
      var x = document.createElement('span'); x.textContent = '×'; x.title = 'Remove';
      chip.appendChild(b); chip.appendChild(u); chip.appendChild(x);
      x.onclick = function (e) {
        e.stopPropagation();
        if (setEffect(fx.id, 0)) paintBar();
      };
      chip.onclick = function () {
        /* Only ours has an editor. The bundle's own effects have no
           parameters here, so clicking one opens the library at it rather
           than an editor that would be empty. */
        if (fx.mine && window.NC_FX_EDIT.editor) {
          if (!document.querySelector('.nctr')) window.NC_TRANS_UI.open();
          setTimeout(function () { window.NC_FX_EDIT.editor(fx.id, 'fx'); }, 90);
        } else if (window.NC_FX_PACK) {
          window.NC_FX_PACK.openEffects();
        }
      };
      bar.appendChild(chip);
    });
  }

  function onDrop(e) {
    e.preventDefault();
    var id = '', kind = 'fx';
    try {
      id = e.dataTransfer.getData('text/nc-fx') || '';
      kind = e.dataTransfer.getData('text/nc-kind') || 'fx';
    } catch (err) {}
    if (!id) return;
    var clip = selClip();
    if (!clip) return;
    if (kind === 'tr') {
      try {
        var st = window.__ncStore.getState();
        if (typeof st.pushHistory === 'function') st.pushHistory();
        st.setClipTransition(clip.id, 'out', { type: id, duration: cfg(id).duration });
      } catch (err) {}
    } else {
      setEffect(id, cfg(id).strength || 0.7);
    }
    paintBar();
  }

  /* Make the library's tiles draggable. Same identification as the gears:
     by the heading text against the catalogue, because a tile carries no id. */
  function draggables() {
    var panel = document.querySelector('.nctr');
    if (!panel) return;
    var ui = window.NC_TRANS_UI;
    if (!ui) return;
    panel.querySelectorAll('.tile').forEach(function (tile) {
      if (tile.getAttribute('draggable') === 'true') return;
      var id = tile.getAttribute('data-fx') || tile.getAttribute('data-trans');
      if (!id) return;
      tile.setAttribute('draggable', 'true');
      tile.addEventListener('dragstart', function (e) {
        try {
          e.dataTransfer.setData('text/nc-fx', id);
          e.dataTransfer.setData('text/nc-kind',
            tile.getAttribute('data-fx') ? 'fx' : 'tr');
          e.dataTransfer.effectAllowed = 'copy';
        } catch (err) {}
        tile.classList.add('dragging');
        paintBar();
      });
      tile.addEventListener('dragend', function () { tile.classList.remove('dragging'); });
    });
  }

  window.NC_FX_EDIT.editor = editor;
  window.NC_FX_EDIT.applyNow = applyNow;
  window.NC_FX_EDIT.gears = gears;
  window.NC_FX_EDIT.bar = paintBar;

  try {
    var mo = new MutationObserver(function () { gears(); draggables(); });
    var start = function () { mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  } catch (e) {}

  /* The bar follows the selection. Subscribing to the store is exact and
     costs nothing; the interval is only a floor in case the store is replaced
     during a project load. */
  function watch() {
    try {
      var st = window.__ncStore;
      if (!st) return false;
      var last = '';
      st.subscribe(function () {
        var s = st.getState();
        var sig = String(s.selectedClipId) + '|' +
          JSON.stringify((s.clips.filter(function (c) { return c.id === s.selectedClipId; })[0] || {}).effects || {});
        if (sig === last) return;
        last = sig;
        paintBar();
      });
      paintBar();
      window.addEventListener('resize', place);
      return true;
    } catch (e) { return false; }
  }
  if (!watch()) {
    var wt = 0;
    var wi = setInterval(function () { if (watch() || ++wt > 80) clearInterval(wi); }, 150);
  }

  if (!wrap()) {
    var tries = 0;
    var t = setInterval(function () { if (wrap() || ++tries > 80) clearInterval(t); }, 100);
  }
})();
