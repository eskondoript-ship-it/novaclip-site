/* ============================================================================
   MOTION LAB — the paper cut-out effect
   ============================================================================
   This is the paperanimator.com thing. It is NOT the puppet in animator.js,
   and the difference is worth stating because the first attempt built the
   wrong one:

     animator.js   cuts a DRAWING into eight limbs and rotates them at joints.
                   A marionette. You need a figure with arms and legs.

     this file     takes ANY picture, lifts the subject off its background,
                   and makes it look like a piece of paper someone cut out and
                   is holding — torn fibrous edges, paper grain, a drop shadow,
                   and the tiny frame-to-frame wobble that gives stop-motion
                   its handmade feel. The subject does not need limbs. It can
                   be a face, a car, a logo, a cat.

   HOW THE LOOK IS BUILT, in the order the pixels go down:

     1. CUT OUT.  Flood-fill inward from the four edges, taking anything close
        in colour to the border. That handles the plain-background photo and
        the drawing on white paper, which is most of what people bring. A brush
        fixes what it gets wrong, because no automatic cut-out is ever right on
        hair or on a background that matches the subject.

     2. TEAR.  A real torn edge is not a wobble applied to a smooth outline —
        it is fibres, so it needs high-frequency noise, not a sine. The mask's
        alpha is thresholded against value noise: alpha - noise*strength > 0.5.
        Ragged at the pixel level, still recognisably the original shape.

     3. THE WHITE CORE.  Tearing paper exposes the unprinted middle, which is
        why a torn edge reads as paper and a cut edge reads as a sticker. The
        band between the eroded mask and the torn mask is painted off-white.
        Leave this out and the whole effect collapses into "photo with a rough
        edge".

     4. GRAIN + SHADOW.  Fibre noise multiplied over the top, then a blurred
        offset silhouette underneath so it sits above the background rather
        than in it.

     5. BOIL.  Three complete frames are built with three different noise
        seeds and cycled at about eight per second. That is literally how
        stop-motion boil happens — the paper is re-placed by hand every shot —
        and it is far cheaper than re-tearing the mask every frame.

   Everything is canvas work in this tab. Nothing is uploaded, there is no
   model to download, and it works with the network off.
   ============================================================================ */
(function () {
  'use strict';
  if (!/editor\.html/i.test(location.pathname) &&
      !document.body.hasAttribute('data-nc-editor-tools')) return;
  if (window.__ncMotionLab) return;
  window.__ncMotionLab = true;

  const $ = id => document.getElementById(id);
  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

  /* ---- deterministic value noise ------------------------------------------
     Math.random() per pixel is white noise: every pixel independent, which
     tears into sand rather than fibres. Value noise interpolated off a coarse
     grid gives clumps the size of paper fibre, and being seeded means the same
     boil frame is identical every time it is drawn. */
  function makeNoise(seed) {
    const hash = (x, y) => {
      let h = x * 374761393 + y * 668265263 + seed * 1442695040888963407;
      h = (h ^ (h >> 13)) * 1274126177;
      return ((h ^ (h >> 16)) >>> 0) / 4294967295;
    };
    const smooth = t => t * t * (3 - 2 * t);
    return function (x, y, scale) {
      const fx = x / scale, fy = y / scale;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = smooth(fx - x0), ty = smooth(fy - y0);
      const a = hash(x0, y0), b = hash(x0 + 1, y0);
      const c = hash(x0, y0 + 1), d = hash(x0 + 1, y0 + 1);
      return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    };
  }

  /* Two octaves: the coarse one makes the big bites out of the edge, the fine
     one makes the fibres along it. One octave alone looks like either a wavy
     line or static. */
  const fibre = (n, x, y) => n(x, y, 9) * 0.62 + n(x + 500, y + 500, 2.6) * 0.38;

  /* ---- the cut-out --------------------------------------------------------
     Flood fill from every edge pixel, taking anything within `tol` of the
     colour it started from. Iterative, not recursive: a 4000px photo would
     blow the call stack on the first try. */
  function autoCut(data, W, H, tol) {
    const keep = new Uint8Array(W * H).fill(1);
    const seen = new Uint8Array(W * H);
    const stack = [];
    const push = (x, y) => { const i = y * W + x; if (!seen[i]) { seen[i] = 1; stack.push(i); } };

    /* Sample the border rather than one corner: a photo with a vignette has
       four noticeably different corners and one of them would be kept. */
    let br = 0, bg = 0, bb = 0, n = 0;
    for (let x = 0; x < W; x += 2) {
      for (const y of [0, H - 1]) { const p = (y * W + x) * 4; br += data[p]; bg += data[p + 1]; bb += data[p + 2]; n++; }
    }
    for (let y = 0; y < H; y += 2) {
      for (const x of [0, W - 1]) { const p = (y * W + x) * 4; br += data[p]; bg += data[p + 1]; bb += data[p + 2]; n++; }
    }
    br /= n; bg /= n; bb /= n;

    for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
    for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

    const t2 = tol * tol * 3;
    while (stack.length) {
      const i = stack.pop();
      const p = i * 4;
      const dr = data[p] - br, dg = data[p + 1] - bg, db = data[p + 2] - bb;
      if (dr * dr + dg * dg + db * db > t2) continue;
      keep[i] = 0;
      const x = i % W, y = (i / W) | 0;
      if (x > 0) push(x - 1, y);
      if (x < W - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < H - 1) push(x, y + 1);
    }
    return keep;
  }

  /* A 3x3 box blur over the mask, twice. Without it the tear threshold has
     only 0 and 1 to work with and the edge comes out as steps. */
  function soften(mask, W, H) {
    let src = Float32Array.from(mask);
    let dst = new Float32Array(W * H);
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let s = 0, c = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy; if (yy < 0 || yy >= H) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx; if (xx < 0 || xx >= W) continue;
              s += src[yy * W + xx]; c++;
            }
          }
          dst[y * W + x] = s / c;
        }
      }
      const t = src; src = dst; dst = t;
    }
    return src;
  }

  /* ---- one boil frame -----------------------------------------------------
     Builds a complete paper cut-out into its own canvas. Called three times
     with three seeds; the loop then just blits whichever is current. */
  function buildFrame(img, soft, W, H, opt, seed) {
    const n = makeNoise(seed);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    const src = document.createElement('canvas');
    src.width = W; src.height = H;
    src.getContext('2d').drawImage(img, 0, 0, W, H);
    const sd = src.getContext('2d').getImageData(0, 0, W, H);
    const out = ctx.createImageData(W, H);

    const torn = opt.edge === 'torn';
    const strength = torn ? opt.tear : 0;
    const core = opt.core;                       // px of exposed paper fibre

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x, p = i * 4;
        const a = soft[i];
        const wob = torn ? (fibre(n, x, y) - 0.5) * strength : 0;
        const inside = a - wob > 0.5;
        if (!inside) { out.data[p + 3] = 0; continue; }

        /* Distance to the edge, cheaply: the softened mask already falls off
           over a few pixels, so its value near 0.5 IS a distance estimate. */
        const edgeness = torn ? (a - wob - 0.5) : (a - 0.5);
        /* The softened mask only reaches 0.5 above the threshold, so an
           unclamped core would pass that ceiling around 8 and paint the whole
           subject white — a bug that reads as "the tool deleted my picture". */
        const inCore = core > 0 && edgeness < Math.min(0.36, core * 0.045);

        let r, g, b;
        if (inCore) {
          /* Unprinted paper, not pure white — paper is warm and never flat. */
          const t = fibre(n, x * 1.7, y * 1.7);
          r = 246 + t * 8; g = 242 + t * 8; b = 232 + t * 10;
        } else {
          r = sd.data[p]; g = sd.data[p + 1]; b = sd.data[p + 2];
          if (opt.grain > 0) {
            const t = (fibre(n, x * 2.3, y * 2.3) - 0.5) * opt.grain * 80;
            r += t; g += t; b += t;
          }
        }
        out.data[p] = clamp(r, 0, 255);
        out.data[p + 1] = clamp(g, 0, 255);
        out.data[p + 2] = clamp(b, 0, 255);
        out.data[p + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    return cv;
  }

  /* ---- motions ------------------------------------------------------------
     Each returns a transform for a moment in the loop. Deliberately small:
     paper held in front of a camera does not do backflips, and overdoing this
     is what makes the effect look like a PowerPoint transition. */
  const MOTIONS = {
    boil:   () => ({}),
    sway:   t => ({ rot: Math.sin(t * Math.PI * 2) * 3.5 }),
    float:  t => ({ y: Math.sin(t * Math.PI * 2) * 0.035, rot: Math.sin(t * Math.PI * 2 + 1) * 1.6 }),
    pop:    t => { const e = Math.min(1, t * 3); const o = 1 - Math.pow(1 - e, 3);
                   return { sx: 0.2 + o * 0.8, sy: 0.2 + o * 0.8, rot: (1 - o) * -14 }; },
    unfold: t => { const e = Math.min(1, t * 2.2); const o = 1 - Math.pow(1 - e, 3);
                   return { sx: o, rot: (1 - o) * 9 }; },
    spin:   t => ({ sx: Math.cos(t * Math.PI * 2) }),
    wide:   t => ({ sx: 1 + Math.sin(t * Math.PI * 2) * 0.45 })
  };
  const MOTION_LABEL = {
    boil: 'Boil only', sway: 'Sway', float: 'Float', pop: 'Pop in',
    unfold: 'Unfold', spin: 'Card spin', wide: 'Wide / squash'
  };

  /* ---- UI ------------------------------------------------------------------ */
  const css = document.createElement('style');
  css.textContent = [
    '#ncMlBtn{position:fixed;right:16px;bottom:150px;z-index:99997;border:0;border-radius:999px;',
    'padding:11px 17px;font:600 13.5px system-ui;color:#05070E;cursor:pointer;display:flex;align-items:center;gap:8px;',
    'background:linear-gradient(110deg,#FFD36E,#FF7AC8);box-shadow:0 10px 30px rgba(255,122,200,.35)}',
    '#ncMl{position:fixed;inset:0;z-index:99998;background:rgba(3,5,12,.82);backdrop-filter:blur(10px);',
    'display:none;align-items:center;justify-content:center;padding:20px;overflow:auto}',
    '#ncMl.on{display:flex}',
    '#ncMl .box{background:#0C1220;border:1px solid rgba(255,255,255,.12);border-radius:20px;',
    'padding:24px;width:min(1000px,100%);max-height:94vh;overflow:auto;color:#EAF2FF;font:14px/1.6 system-ui}',
    '#ncMl h2{font:660 21px system-ui;letter-spacing:-.02em;margin-bottom:4px}',
    '#ncMl .sub{color:#8A97B4;font-size:13.5px;margin-bottom:18px}',
    '#ncMl .cols{display:grid;grid-template-columns:1fr 320px;gap:20px}',
    '@media (max-width:820px){#ncMl .cols{grid-template-columns:1fr}}',
    '#ncMl .stage{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);',
    'border-radius:14px;padding:10px;display:flex;align-items:center;justify-content:center;min-height:300px}',
    '#ncMlCv{max-width:100%;max-height:56vh;border-radius:8px;cursor:crosshair}',
    '#ncMl label{display:block;font-size:12.5px;color:#8A97B4;margin:13px 0 6px}',
    '#ncMl select,#ncMl input[type=range]{width:100%}',
    '#ncMl select{padding:10px 12px;border-radius:11px;border:1px solid rgba(255,255,255,.14);',
    'background:rgba(255,255,255,.04);color:#EAF2FF;font:inherit;font-size:13.5px}',
    '#ncMl .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '#ncMl button.b{padding:10px 16px;border:0;border-radius:11px;cursor:pointer;font:600 13.5px system-ui;',
    'color:#05070E;background:linear-gradient(110deg,#FFD36E,#FF7AC8)}',
    '#ncMl button.b.alt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);color:#EAF2FF}',
    '#ncMl button.b:disabled{opacity:.45;cursor:default}',
    '#ncMl .seg{display:flex;gap:6px;flex-wrap:wrap}',
    '#ncMl .seg button{flex:1;min-width:74px;padding:8px 10px;border-radius:10px;font:600 12.5px system-ui;',
    'cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);color:#A8B4CE}',
    '#ncMl .seg button.on{background:rgba(255,211,110,.16);border-color:#FFD36E;color:#FFD36E}',
    '#ncMlSay{border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.6;margin-top:12px;display:none}',
    '#ncMlSay.no{background:rgba(255,107,157,.09);border:1px solid rgba(255,107,157,.4)}',
    '#ncMlSay.yes{background:rgba(255,211,110,.08);border:1px solid rgba(255,211,110,.35)}',
    '#ncMlSay.wait{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#A8B4CE}',
    '#ncMlSay b{display:block;margin-bottom:3px}',
    '#ncMl .hint{color:#7E8AA6;font-size:12.5px;line-height:1.6;margin-top:10px}',
    '@media (max-width:700px){#ncMlBtn{bottom:auto;top:56px;right:12px;padding:9px 13px;font-size:12.5px}}'
  ].join('');
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.id = 'ncMlBtn';
  btn.innerHTML = '<span style="font-size:15px">📄</span> Motion Lab';
  btn.title = 'Turn any picture into a paper cut-out clip';

  const ui = document.createElement('div');
  ui.id = 'ncMl';
  ui.innerHTML =
    '<div class="box">' +
      '<h2>Motion Lab</h2>' +
      '<p class="sub">Any picture becomes a piece of cut-out paper: torn edges, grain, a shadow ' +
      'and the wobble of stop-motion. Nothing is uploaded.</p>' +
      '<div class="cols">' +
        '<div>' +
          '<div class="stage"><canvas id="ncMlCv" width="640" height="640"></canvas></div>' +
          '<div class="row">' +
            '<label style="margin:0"><input id="ncMlFile" type="file" accept="image/*" style="display:none"></label>' +
            '<button class="b alt" id="ncMlOpen">Open a picture</button>' +
            '<button class="b alt" id="ncMlPlay">Play</button>' +
            '<button class="b" id="ncMlRec">Record 5s</button>' +
            '<button class="b alt" id="ncMlPng">Save PNG</button>' +
          '</div>' +
          '<p class="hint" id="ncMlHint">The cut-out is automatic. If it takes too much or too little, ' +
          'drag the tolerance, or paint on the canvas to put parts back (and hold Alt to rub them out).</p>' +
        '</div>' +
        '<div>' +
          '<label>Motion</label>' +
          '<select id="ncMlMotion"></select>' +
          '<label>Edge</label>' +
          '<div class="seg" id="ncMlEdge">' +
            '<button data-v="torn" class="on">Torn</button>' +
            '<button data-v="cut">Clean cut</button>' +
            '<button data-v="none">None</button>' +
          '</div>' +
          '<label>Background</label>' +
          '<div class="seg" id="ncMlBg">' +
            '<button data-v="transparent" class="on">None</button>' +
            '<button data-v="green">Green</button>' +
            '<button data-v="white">White</button>' +
          '</div>' +
          '<label>Cut-out tolerance <span id="ncMlTolV">42</span></label>' +
          '<input id="ncMlTol" type="range" min="8" max="110" step="2" value="42">' +
          '<label>Tear <span id="ncMlTearV">0.5</span></label>' +
          '<input id="ncMlTear" type="range" min="0" max="1.4" step="0.05" value="0.5">' +
          '<label>Paper edge <span id="ncMlCoreV">3</span></label>' +
          '<input id="ncMlCore" type="range" min="0" max="10" step="1" value="3">' +
          '<label>Grain <span id="ncMlGrainV">0.35</span></label>' +
          '<input id="ncMlGrain" type="range" min="0" max="1" step="0.05" value="0.35">' +
          '<label>Shadow <span id="ncMlShadV">0.5</span></label>' +
          '<input id="ncMlShad" type="range" min="0" max="1" step="0.05" value="0.5">' +
          '<label>Boil <span id="ncMlBoilV">8</span> fps</label>' +
          '<input id="ncMlBoil" type="range" min="0" max="16" step="1" value="8">' +
          '<label>Speed <span id="ncMlSpeedV">1</span></label>' +
          '<input id="ncMlSpeed" type="range" min="0.25" max="3" step="0.05" value="1">' +
          '<div id="ncMlSay"></div>' +
        '</div>' +
      '</div>' +
      '<div class="row" style="margin-top:16px"><button class="b alt" id="ncMlClose">Close</button></div>' +
    '</div>';

  function boot() {
    if (!document.body) return;
    /* The editor's own left rail has a Motion Lab tab now. The floating button
       is the fallback for a page that has this script but not the rail — two
       ways in at once is just clutter, so only one of them is ever added. */
    if (!window.__ncRailTools) document.body.appendChild(btn);
    document.body.appendChild(ui);
    wire();
    window.__ncOpenMotionLab = function () { ui.classList.add('on'); };
  }

  function wire() {
    const cv = $('ncMlCv'), ctx = cv.getContext('2d');
    let img = null, W = 0, H = 0;
    let mask = null, soft = null;          // Uint8Array / Float32Array, image sized
    let frames = [], shadow = null;
    let raf = 0, t0 = 0, rec = null, painting = 0;

    const opt = () => ({
      edge: seg('ncMlEdge'), bg: seg('ncMlBg'),
      tol: +$('ncMlTol').value, tear: +$('ncMlTear').value,
      core: +$('ncMlCore').value, grain: +$('ncMlGrain').value,
      shadow: +$('ncMlShad').value, boil: +$('ncMlBoil').value,
      speed: +$('ncMlSpeed').value, motion: $('ncMlMotion').value
    });

    function seg(id) {
      const on = $(id).querySelector('button.on');
      return on ? on.dataset.v : '';
    }
    function say(kind, title, body) {
      const el = $('ncMlSay');
      el.className = kind; el.style.display = 'block';
      el.innerHTML = '<b>' + title + '</b>' + (body || '');
    }

    $('ncMlMotion').innerHTML = Object.keys(MOTIONS)
      .map(k => '<option value="' + k + '">' + MOTION_LABEL[k] + '</option>').join('');

    ['ncMlEdge', 'ncMlBg'].forEach(id => {
      $(id).querySelectorAll('button').forEach(b => b.onclick = () => {
        $(id).querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        if (id === 'ncMlEdge') rebuild(); else draw(0);
      });
    });

    /* Live labels. The cut-out ones re-cut, the look ones only re-render, and
       keeping those apart is the difference between a slider that responds and
       one that stutters on a big photo. */
    const bind = (id, vid, after) => {
      const s = $(id);
      const show = () => { $(vid).textContent = s.value; };
      s.oninput = show;
      s.onchange = () => { show(); after(); };
      show();
    };
    bind('ncMlTol', 'ncMlTolV', () => cutOut());
    bind('ncMlTear', 'ncMlTearV', rebuild);
    bind('ncMlCore', 'ncMlCoreV', rebuild);
    bind('ncMlGrain', 'ncMlGrainV', rebuild);
    bind('ncMlShad', 'ncMlShadV', rebuild);
    bind('ncMlBoil', 'ncMlBoilV', () => {});
    bind('ncMlSpeed', 'ncMlSpeedV', () => {});

    btn.onclick = () => ui.classList.add('on');
    $('ncMlClose').onclick = () => { stop(); ui.classList.remove('on'); };
    ui.onclick = e => { if (e.target === ui) { stop(); ui.classList.remove('on'); } };
    $('ncMlOpen').onclick = () => $('ncMlFile').click();

    $('ncMlFile').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const im = new Image();
      im.onload = () => {
        /* Cap the working size. The cut-out and the tear are per-pixel in JS,
           and a 12-megapixel phone photo takes about forty seconds of it. */
        const MAX = 720;
        const s = Math.min(1, MAX / Math.max(im.naturalWidth, im.naturalHeight));
        W = Math.round(im.naturalWidth * s); H = Math.round(im.naturalHeight * s);
        cv.width = W; cv.height = H;
        img = im;
        say('wait', 'Cutting it out…', 'Finding the background.');
        setTimeout(cutOut, 30);
      };
      im.onerror = () => say('no', 'That file would not open', 'Try a PNG or a JPEG.');
      im.src = URL.createObjectURL(f);
    };

    function cutOut() {
      if (!img) return;
      const tmp = document.createElement('canvas');
      tmp.width = W; tmp.height = H;
      tmp.getContext('2d').drawImage(img, 0, 0, W, H);
      const d = tmp.getContext('2d').getImageData(0, 0, W, H).data;
      mask = autoCut(d, W, H, +$('ncMlTol').value);
      const kept = mask.reduce((a, b) => a + b, 0) / (W * H);
      rebuild();
      if (kept > 0.97) {
        say('no', 'Nothing was cut away',
          'The background is too close to the subject for an automatic cut. Lower the tolerance, ' +
          'or paint over what you want to keep and rub out the rest with Alt held down.');
      } else if (kept < 0.03) {
        say('no', 'That took almost everything',
          'The tolerance is too high — it decided the subject was background too. Drag it down.');
      } else {
        say('yes', 'Cut out', Math.round(kept * 100) + '% of the picture kept. ' +
          'Paint on it to correct the edges, then pick a motion and record.');
      }
    }

    function rebuild() {
      if (!img || !mask) return;
      soft = soften(mask, W, H);
      const o = opt();
      /* Three seeds is the whole boil. Two reads as a flicker, four is not
         distinguishable from three and costs another full pass. */
      frames = [1, 2, 3].map(s => buildFrame(img, soft, W, H, o, s));

      shadow = document.createElement('canvas');
      shadow.width = W; shadow.height = H;
      const sc = shadow.getContext('2d');
      sc.filter = 'blur(' + Math.round(Math.max(2, W * 0.012)) + 'px)';
      sc.drawImage(frames[0], 0, 0);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = '#000';
      sc.fillRect(0, 0, W, H);
      draw(0);
    }

    function draw(time) {
      if (!frames.length) return;
      const o = opt();
      ctx.clearRect(0, 0, W, H);
      if (o.bg === 'green') { ctx.fillStyle = '#00b140'; ctx.fillRect(0, 0, W, H); }
      else if (o.bg === 'white') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }

      const loop = 3 / o.speed;
      const t = ((time % (loop * 1000)) / (loop * 1000));
      const m = (MOTIONS[o.motion] || MOTIONS.boil)(t) || {};
      const idx = o.boil > 0 ? Math.floor(time / (1000 / o.boil)) % frames.length : 0;

      ctx.save();
      ctx.translate(W / 2 + (m.x || 0) * W, H / 2 + (m.y || 0) * H);
      ctx.rotate((m.rot || 0) * Math.PI / 180);
      ctx.scale(m.sx == null ? 1 : m.sx, m.sy == null ? 1 : m.sy);
      if (o.shadow > 0 && shadow) {
        ctx.globalAlpha = o.shadow * 0.55;
        ctx.drawImage(shadow, -W / 2 + W * 0.012, -H / 2 + H * 0.018);
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(frames[idx], -W / 2, -H / 2);
      ctx.restore();
    }

    function start() { if (raf) return; t0 = performance.now(); tick(); }
    function tick() { draw(performance.now() - t0); raf = requestAnimationFrame(tick); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    $('ncMlPlay').onclick = () => {
      if (!frames.length) return say('no', 'No picture yet', 'Open one first.');
      if (raf) { stop(); $('ncMlPlay').textContent = 'Play'; }
      else { start(); $('ncMlPlay').textContent = 'Pause'; }
    };

    /* ---- painting the mask back ------------------------------------------
       Automatic cut-outs are wrong on hair, on glass and on anything the same
       colour as what is behind it. This is the escape hatch, and it is why the
       tool is usable on a real photo rather than only on a clean one. */
    function paintAt(e, erase) {
      if (!mask) return;
      const r = cv.getBoundingClientRect();
      const x = Math.round((e.clientX - r.left) / r.width * W);
      const y = Math.round((e.clientY - r.top) / r.height * H);
      const rad = Math.max(6, Math.round(W * 0.035));
      for (let dy = -rad; dy <= rad; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -rad; dx <= rad; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= W) continue;
          if (dx * dx + dy * dy > rad * rad) continue;
          mask[yy * W + xx] = erase ? 0 : 1;
        }
      }
    }
    let pending = 0;
    const repaint = () => { if (pending) return; pending = setTimeout(() => { pending = 0; rebuild(); }, 140); };
    cv.onpointerdown = e => { painting = 1; cv.setPointerCapture(e.pointerId); paintAt(e, e.altKey); repaint(); };
    cv.onpointermove = e => { if (painting) { paintAt(e, e.altKey); repaint(); } };
    cv.onpointerup = () => { painting = 0; };

    /* ---- out ---------------------------------------------------------------- */
    $('ncMlPng').onclick = () => {
      if (!frames.length) return say('no', 'No picture yet', 'Open one first.');
      draw(0);
      cv.toBlob(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'paper-cutout.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        say('yes', 'Saved paper-cutout.png',
          opt().bg === 'transparent' ? 'Transparent background, ready to drop over anything.'
                                     : 'On a ' + opt().bg + ' background.');
      }, 'image/png');
    };

    $('ncMlRec').onclick = () => {
      if (!frames.length) return say('no', 'No picture yet', 'Open one first.');
      if (rec) { rec.stop(); return; }
      if (!cv.captureStream || typeof MediaRecorder === 'undefined')
        return say('no', 'This browser cannot record a canvas', 'Chrome, Edge and Firefox can.');
      const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .find(t => MediaRecorder.isTypeSupported(t));
      if (!type) return say('no', 'No video encoder here', 'This browser has none available.');

      /* WebM has no alpha in most players, so a transparent export would come
         out black. Say so rather than handing over a ruined clip — green is
         what the editor keys out anyway. */
      if (opt().bg === 'transparent')
        say('wait', 'Recording on green',
          'WebM cannot carry transparency anywhere it will be played. Key the green out in the editor, ' +
          'or use Save PNG if you need a real alpha channel.');

      const chunks = [];
      const wasBg = seg('ncMlBg');
      if (wasBg === 'transparent') {
        $('ncMlBg').querySelectorAll('button').forEach(x =>
          x.classList.toggle('on', x.dataset.v === 'green'));
      }
      rec = new MediaRecorder(cv.captureStream(30), { mimeType: type, videoBitsPerSecond: 5000000 });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'paper-animation.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        say('yes', 'Saved paper-animation.webm',
          Math.round(blob.size / 1024) + ' kB. Add it to the timeline the same way as any other clip.');
        rec = null;
        $('ncMlRec').textContent = 'Record 5s';
        $('ncMlBg').querySelectorAll('button').forEach(x =>
          x.classList.toggle('on', x.dataset.v === wasBg));
        stop();
        if (window.addPts) addPts(5);
      };
      start();
      rec.start();
      $('ncMlRec').textContent = 'Stop';
      setTimeout(() => { if (rec) rec.stop(); }, 5000);
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
