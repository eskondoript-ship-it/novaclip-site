/* ============================================================================
   NOVACLIP COLOUR GRADING — THE PANELS
   ============================================================================
   grade.js is the maths: it reads clip.color and turns it into what the canvas
   actually draws through. This is the part you touch — the three controls the
   Color tab listed as "Soon" and has now been wired to open:

     Curves   a draggable curve per channel, plus one for all three at once
     Wheels   shadows / midtones / highlights, each pushed towards a colour
     Look     the named grades, applied as a starting point

   WHY THESE ARE SHEETS AND NOT PANEL SECTIONS

   The Color tab is a 400 kB React bundle's own component. Rendering a curve
   editor inside it means writing React in minified jsx-runtime calls and
   re-doing it every time the bundle is rebuilt. Everything else added to this
   editor — the stickers, the photos, the project browser — is a sheet opened
   by a global, and the bundle only ever holds one line pointing at it. This
   is the same arrangement, for the same reason.

   EVERY CHANGE GOES STRAIGHT INTO THE STORE

   No local copy, no apply button. The store is the single source of truth and
   the preview redraws from it, so dragging a curve point shows the graded
   frame while you are dragging. It also means undo, autosave and the project
   snapshot all pick the grade up without knowing anything about it.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncOpenGrade) return;

  var CH = [
    ['rgb', 'All',   '#e8edf8'],
    ['r',   'Red',   '#f87171'],
    ['g',   'Green', '#4ade80'],
    ['b',   'Blue',  '#60a5fa']
  ];

  var LOOKS = [
    ['none',        'None',        'No look — just your own grade'],
    ['teal_orange', 'Teal & Orange', 'Warm skin, cool shadows. The blockbuster one.'],
    ['warm_film',   'Warm Film',   'Soft warm stock, gentle shoulder'],
    ['cool_blue',   'Cool Blue',   'Cold and clean, a night look'],
    ['bleach',      'Bleach',      'Washed out and contrasty'],
    ['noir',        'Noir',        'Black and white, hard'],
    ['vivid',       'Vivid',       'Everything louder']
  ];

  var RANGES = [['shadows', 'Shadows'], ['midtones', 'Midtones'], ['highlights', 'Highlights']];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function store() { return window.__ncStore || null; }
  function clipById(id) {
    var s = store(); if (!s) return null;
    var st = s.getState();
    var list = st.clips || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || null;
  }
  /* Every write goes through here so the shape of a colour object is decided
     in exactly one place — a clip made before grading existed has no curves,
     wheels or lut key at all, and half the panel would read undefined. */
  function patch(id, part) {
    var s = store(); if (!s) return;
    var st = s.getState();
    var c = clipById(id);
    if (!c) return;
    var base = c.color || {};
    var next = {};
    for (var k in base) next[k] = base[k];
    if (!next.curves) next.curves = {};
    if (!next.wheels) next.wheels = { shadows: { r: 0, g: 0, b: 0 }, midtones: { r: 0, g: 0, b: 0 }, highlights: { r: 0, g: 0, b: 0 } };
    if (!next.lut) next.lut = 'none';
    for (var k2 in part) next[k2] = part[k2];
    st.updateClip(c.id, { color: next });
  }

  /* ---- the sheet ---------------------------------------------------------- */
  var veil = null, current = null, mode = 'curves';

  function boot() {
    if (document.getElementById('ncgr-css')) return;
    var st = document.createElement('style');
    st.id = 'ncgr-css';
    st.textContent = [
      '.ncgr-veil{position:fixed;inset:0;z-index:100002;background:rgba(4,6,12,.72);',
        '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;place-items:center;padding:18px}',
      '.ncgr{width:min(600px,100%);max-height:min(88vh,780px);display:flex;flex-direction:column;overflow:hidden;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);border-radius:18px;',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14));box-shadow:0 30px 80px rgba(0,0,0,.6);',
        'font:400 14px/1.5 Inter,system-ui,sans-serif}',
      '.ncgr-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncgr-head h2{margin:0;font-size:1.02rem;font-weight:800;flex:1 1 auto}',
      '.ncgr-x{width:40px;height:40px;flex:0 0 auto;border-radius:11px;cursor:pointer;font-size:20px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.ncgr-tabs{display:flex;gap:6px;padding:10px 16px 0}',
      '.ncgr-tab{flex:1 1 0;min-height:40px;border-radius:11px;cursor:pointer;font:700 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncgr-tab.on{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      '.ncgr-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px}',
      '.ncgr-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.ncgr-row label{flex:0 0 84px;font-size:12px;color:var(--nc-dim,#8c96ad)}',
      '.ncgr-row input[type=range]{flex:1 1 auto;min-width:0;min-height:32px}',
      '.ncgr-row .v{flex:0 0 46px;text-align:right;font:600 12px/1 ui-monospace,monospace}',
      '.ncgr-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}',
      '.ncgr-chip{min-height:38px;padding:8px 13px;border-radius:999px;cursor:pointer;font:600 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncgr-chip.on{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      '.ncgr-canvas{width:100%;max-width:340px;aspect-ratio:1;display:block;margin:0 auto 14px;',
        'border-radius:12px;background:#080b14;border:1px solid var(--nc-line2,rgba(255,255,255,.14));touch-action:none;cursor:crosshair}',
      '.ncgr-look{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px}',
      '.ncgr-look button{padding:11px 12px;border-radius:12px;cursor:pointer;text-align:left;color:inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.05));border:1px solid var(--nc-line2,rgba(255,255,255,.12))}',
      '.ncgr-look button.on{border-color:var(--nc-cyan,#00F0FF);background:rgba(0,240,255,.08)}',
      '.ncgr-look b{display:block;font-size:13px;margin-bottom:2px}',
      '.ncgr-look span{font-size:11px;color:var(--nc-dim,#8c96ad);line-height:1.35}',
      '.ncgr-foot{display:flex;gap:8px;align-items:center;padding:11px 16px;',
        'border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncgr-foot .note{flex:1 1 auto;font-size:11.5px;color:var(--nc-dim,#8c96ad)}',
      '.ncgr-foot button{min-height:40px;padding:9px 15px;border-radius:11px;cursor:pointer;font:700 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '@media (max-width:760px){.ncgr-veil{padding:0}',
        '.ncgr{width:100%;height:100%;max-height:none;border-radius:0;border:0}}'
    ].join('');
    document.head.appendChild(st);
  }

  function close() {
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  /* ==========================================================================
     CURVES
     ==========================================================================
     Four points, dragged on a square. x is input, y is output, and the
     diagonal is "leave it alone" — which is why the diagonal is drawn: a
     curve is only ever read as the distance from it.
     ========================================================================== */
  function defaultCurve() {
    return [{ x: 0, y: 0 }, { x: 0.33, y: 0.33 }, { x: 0.66, y: 0.66 }, { x: 1, y: 1 }];
  }
  function isDefault(pts) {
    if (!pts || pts.length !== 4) return false;
    for (var i = 0; i < pts.length; i++) if (Math.abs(pts[i].x - pts[i].y) > 0.002) return false;
    return true;
  }

  function curvesPanel(body, id) {
    var chan = 'rgb';
    var chips = el('div', 'ncgr-chips');
    var cv = el('canvas', 'ncgr-canvas');
    cv.width = cv.height = 340;
    var hint = el('p', null, '');
    hint.style.cssText = 'margin:0;font-size:11.5px;color:var(--nc-dim,#8c96ad);text-align:center';
    hint.textContent = 'Drag a point. Above the line is brighter, below is darker.';

    function pointsFor(ch) {
      var c = clipById(id);
      var cu = (c && c.color && c.color.curves) || {};
      /* "All" is stored as the three channels held together — there is no
         separate rgb curve in the filter, because feComponentTransfer has one
         function per channel and nothing above them. */
      var key = ch === 'rgb' ? 'r' : ch;
      return (cu[key] && cu[key].length === 4) ? cu[key].map(function (p) { return { x: p.x, y: p.y }; }) : defaultCurve();
    }

    function write(pts) {
      var c = clipById(id);
      var cu = {};
      var old = (c && c.color && c.color.curves) || {};
      for (var k in old) cu[k] = old[k];
      if (chan === 'rgb') {
        if (isDefault(pts)) { delete cu.r; delete cu.g; delete cu.b; }
        else { cu.r = pts; cu.g = pts; cu.b = pts; }
      } else {
        if (isDefault(pts)) delete cu[chan];
        else cu[chan] = pts;
      }
      patch(id, { curves: cu });
    }

    var pts = pointsFor(chan);

    function draw() {
      var g = cv.getContext('2d'), S = cv.width;
      g.clearRect(0, 0, S, S);
      g.fillStyle = '#080b14'; g.fillRect(0, 0, S, S);
      /* grid */
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
      for (var i = 1; i < 4; i++) {
        g.beginPath(); g.moveTo(S * i / 4, 0); g.lineTo(S * i / 4, S);
        g.moveTo(0, S * i / 4); g.lineTo(S, S * i / 4); g.stroke();
      }
      /* the do-nothing diagonal */
      g.strokeStyle = 'rgba(255,255,255,.22)';
      g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(0, S); g.lineTo(S, 0); g.stroke();
      g.setLineDash([]);
      /* the curve, sampled the same way grade.js samples it so what is drawn
         is what is applied rather than a prettier relative of it */
      var col = CH.filter(function (c) { return c[0] === chan; })[0][2];
      g.strokeStyle = col; g.lineWidth = 2;
      g.beginPath();
      for (var px = 0; px <= S; px++) {
        var x = px / S, y = x, k;
        for (k = 0; k < pts.length - 1; k++) {
          var a = pts[k], b = pts[k + 1];
          if (x >= a.x && x <= b.x) {
            var span = (b.x - a.x) || 1e-6, u = (x - a.x) / span;
            y = a.y + (b.y - a.y) * (u * u * (3 - 2 * u));
            break;
          }
        }
        if (x < pts[0].x) y = pts[0].y;
        if (x > pts[pts.length - 1].x) y = pts[pts.length - 1].y;
        var py = S - y * S;
        if (px === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      /* handles */
      pts.forEach(function (p) {
        g.fillStyle = col;
        g.beginPath(); g.arc(p.x * S, S - p.y * S, 7, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#080b14';
        g.beginPath(); g.arc(p.x * S, S - p.y * S, 3, 0, Math.PI * 2); g.fill();
      });
    }

    var dragging = -1;
    function at(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    }
    cv.addEventListener('pointerdown', function (e) {
      var p = at(e), best = -1, bd = 1e9;
      pts.forEach(function (q, i) {
        var d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      if (bd > 0.14) return;
      dragging = best;
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      if (dragging < 0) return;
      var p = at(e);
      var q = pts[dragging];
      /* The ends stay at the ends. A curve whose first point has slid inwards
         has an undefined stretch before it, and the fix for that is not
         letting it happen. */
      if (dragging > 0 && dragging < pts.length - 1) {
        var lo = pts[dragging - 1].x + 0.04, hi = pts[dragging + 1].x - 0.04;
        q.x = Math.max(lo, Math.min(hi, p.x));
      }
      q.y = Math.max(0, Math.min(1, p.y));
      draw();
      write(pts);
    });
    function up(e) {
      if (dragging < 0) return;
      dragging = -1;
      try { cv.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    CH.forEach(function (c) {
      var b = el('button', 'ncgr-chip' + (c[0] === chan ? ' on' : ''), c[1]);
      b.type = 'button';
      b.onclick = function () {
        chan = c[0];
        [].forEach.call(chips.children, function (x) { x.classList.toggle('on', x === b); });
        pts = pointsFor(chan);
        draw();
      };
      chips.appendChild(b);
    });

    body.appendChild(chips);
    body.appendChild(cv);
    body.appendChild(hint);
    draw();

    return function reset() {
      patch(id, { curves: {} });
      pts = defaultCurve();
      draw();
    };
  }

  /* ==========================================================================
     WHEELS
     ==========================================================================
     Three tonal ranges, each a red/green/blue push. Sliders rather than an
     actual round wheel: a wheel is two numbers pretending to be one gesture,
     and on a phone it is a two-number gesture you cannot make accurately.
     ========================================================================== */
  function wheelsPanel(body, id) {
    function wheelsOf() {
      var c = clipById(id);
      var w = (c && c.color && c.color.wheels) || {};
      var out = {};
      RANGES.forEach(function (r) {
        var v = w[r[0]] || {};
        out[r[0]] = { r: Number(v.r) || 0, g: Number(v.g) || 0, b: Number(v.b) || 0 };
      });
      return out;
    }
    var w = wheelsOf();

    RANGES.forEach(function (range) {
      var box = el('div');
      box.style.cssText = 'margin-bottom:18px';
      var h = el('div', null, range[1]);
      h.style.cssText = 'font:800 11px/1 inherit;letter-spacing:.09em;text-transform:uppercase;' +
        'color:var(--nc-dim,#8c96ad);margin-bottom:9px';
      box.appendChild(h);
      [['r', 'Red', '#f87171'], ['g', 'Green', '#4ade80'], ['b', 'Blue', '#60a5fa']].forEach(function (ch) {
        var row = el('div', 'ncgr-row');
        var lab = el('label', null, ch[1]);
        lab.style.color = ch[2];
        var inp = el('input');
        inp.type = 'range'; inp.min = '-100'; inp.max = '100'; inp.step = '1';
        inp.value = String(Math.round(w[range[0]][ch[0]] * 100));
        var out = el('span', 'v', inp.value);
        inp.addEventListener('input', function () {
          out.textContent = inp.value;
          w[range[0]][ch[0]] = Number(inp.value) / 100;
          var next = {};
          RANGES.forEach(function (r2) { next[r2[0]] = { r: w[r2[0]].r, g: w[r2[0]].g, b: w[r2[0]].b }; });
          patch(id, { wheels: next });
        });
        row.appendChild(lab); row.appendChild(inp); row.appendChild(out);
        box.appendChild(row);
      });
      body.appendChild(box);
    });

    return function reset() {
      var zero = {};
      RANGES.forEach(function (r) { zero[r[0]] = { r: 0, g: 0, b: 0 }; });
      patch(id, { wheels: zero });
      [].forEach.call(body.querySelectorAll('input[type=range]'), function (i) {
        i.value = '0';
        var v = i.nextSibling; if (v) v.textContent = '0';
      });
    };
  }

  /* ==========================================================================
     LOOK
     ========================================================================== */
  function lookPanel(body, id) {
    var c = clipById(id);
    var chosen = (c && c.color && c.color.lut) || 'none';
    var grid = el('div', 'ncgr-look');
    LOOKS.forEach(function (L) {
      var b = el('button', chosen === L[0] ? 'on' : '',
        '<b>' + L[1] + '</b><span>' + L[2] + '</span>');
      b.type = 'button';
      b.onclick = function () {
        chosen = L[0];
        [].forEach.call(grid.children, function (x) { x.classList.toggle('on', x === b); });
        patch(id, { lut: L[0] });
      };
      grid.appendChild(b);
    });
    body.appendChild(grid);
    return function reset() {
      chosen = 'none';
      [].forEach.call(grid.children, function (x, i) { x.classList.toggle('on', i === 0); });
      patch(id, { lut: 'none' });
    };
  }

  /* ========================================================================== */
  var TITLES = { curves: 'Colour curves', wheels: 'Colour wheels', lut: 'Look' };

  function open(which, clipId) {
    boot();
    close();
    mode = TITLES[which] ? which : 'curves';
    current = clipId;

    if (!clipById(clipId)) return;

    veil = el('div', 'ncgr-veil');
    veil.addEventListener('mousedown', function (e) { if (e.target === veil) close(); });
    var sheet = el('div', 'ncgr');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Colour grading');

    var head = el('div', 'ncgr-head', '<h2>' + TITLES[mode] + '</h2>');
    var x = el('button', 'ncgr-x', '&times;');
    x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.onclick = close;
    head.appendChild(x);

    var tabs = el('div', 'ncgr-tabs');
    var body = el('div', 'ncgr-body');
    var foot = el('div', 'ncgr-foot');
    var note = el('span', 'note', '');
    var reset = el('button', null, 'Reset');
    var done = el('button', null, 'Done');
    done.style.cssText += 'background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent';
    done.onclick = close;
    foot.appendChild(note); foot.appendChild(reset); foot.appendChild(done);

    var resetFn = function () {};

    function build() {
      body.textContent = '';
      head.querySelector('h2').textContent = TITLES[mode];
      if (mode === 'curves') resetFn = curvesPanel(body, current);
      else if (mode === 'wheels') resetFn = wheelsPanel(body, current);
      else resetFn = lookPanel(body, current);
      /* Said once, where it matters, rather than as a warning nobody reads:
         if the browser cannot run an SVG filter on a canvas these three
         controls are approximated, and it is better to know that than to
         wonder why the curve looks softer than it is drawn. */
      var ok = window.NC_GRADE && window.NC_GRADE.supported && window.NC_GRADE.supported();
      note.textContent = ok ? 'Changes apply to the selected clip as you make them.'
        : 'This browser cannot run a full grade on the canvas, so these are approximated.';
    }

    [['curves', 'Curves'], ['wheels', 'Wheels'], ['lut', 'Look']].forEach(function (t) {
      var b = el('button', 'ncgr-tab' + (t[0] === mode ? ' on' : ''), t[1]);
      b.type = 'button';
      b.onclick = function () {
        mode = t[0];
        [].forEach.call(tabs.children, function (o) { o.classList.toggle('on', o === b); });
        build();
      };
      tabs.appendChild(b);
    });
    reset.onclick = function () { resetFn(); };

    sheet.appendChild(head); sheet.appendChild(tabs); sheet.appendChild(body); sheet.appendChild(foot);
    veil.appendChild(sheet);
    document.body.appendChild(veil);
    document.addEventListener('keydown', onKey, true);
    build();
  }

  window.__ncOpenGrade = open;
  window.NC_GRADE_UI = { open: open, looks: LOOKS };
})();
