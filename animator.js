/* ============================================================================
   PAPER ANIMATION — an AI director for a drawing, inside the editor
   ============================================================================
   Loaded only by editor.html. It adds one button; everything else stays out of
   the way until that button is pressed.

   WHAT IT DOES. You photograph a drawing, drop the nine joint dots onto it,
   and describe in words how it should move. The AI turns the description into
   a motion, the puppet performs it, and you record it out as a clip.

   WHY IT IS BUILT LIKE THIS. The obvious version has the AI write the animation
   code and the page eval() it. That is a remote-code-execution hole with a
   friendly name, and it fails constantly besides — a model asked for a bespoke
   easing function returns something that throws about one time in four, and
   the person watching a blank canvas has no idea why.

   So the AI does not write code. It fills in a form: a base move, a speed, a
   lean, a bounce, and a per-limb amount, all of them numbers with hard limits
   applied on this side. The engine is fixed and known-good; the AI only
   chooses its inputs.

   That constraint is the reason it can be HONEST. There is a defined space of
   things this can do, so a request either fits in it or does not — and when it
   does not, the answer says which part is out of reach and why, instead of
   producing a shrug of an animation and letting you work out that it ignored
   you. "Make him lip sync to my voice" comes back as a no, with the reason.

   Nothing is uploaded. The drawing is read by the canvas in your browser; only
   the sentence you type is sent anywhere, and only when you ask for a motion.
   ============================================================================ */
(function () {
  'use strict';
  if (!/editor\.html/i.test(location.pathname) && !document.getElementById('root')) return;

  /* ---- the motion space --------------------------------------------------
     Everything the engine can do, expressed as numbers. This list IS the
     contract with the AI: the prompt describes exactly these fields and the
     clamp below enforces them, so a wrong or hostile answer degrades into a
     sensible animation rather than a broken one. */
  const BASES = ['idle', 'wave', 'walk', 'run', 'jump', 'dance', 'sway', 'point'];
  const DEFAULT = { base: 'idle', speed: 1, arms: 1, legs: 1, lean: 0, bounce: 1, head: 1 };

  function clamp(v, lo, hi, d) {
    v = parseFloat(v);
    return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  }
  function sanitise(m) {
    return {
      base:   BASES.indexOf(m && m.base) >= 0 ? m.base : 'idle',
      speed:  clamp(m && m.speed, 0.2, 3, 1),
      arms:   clamp(m && m.arms, 0, 2.5, 1),
      legs:   clamp(m && m.legs, 0, 2.5, 1),
      lean:   clamp(m && m.lean, -25, 25, 0),
      bounce: clamp(m && m.bounce, 0, 3, 1),
      head:   clamp(m && m.head, 0, 3, 1)
    };
  }

  /* The base cycles. Each returns degrees of rotation per joint group plus a
     vertical bob in pixels; the modifiers above scale them. */
  const CYCLE = {
    idle:  t => ({ bob: Math.sin(t * 2) * 2,  armL: Math.sin(t * 2) * 3,  armR: -Math.sin(t * 2) * 3,
                   legL: 0, legR: 0, lean: 0, head: Math.sin(t * 2) * 2 }),
    wave:  t => ({ bob: Math.sin(t * 3) * 2,  armL: -95 + Math.sin(t * 9) * 26, armR: 6,
                   legL: 0, legR: 0, lean: 0, head: Math.sin(t * 3) * 4 }),
    walk:  t => ({ bob: Math.abs(Math.sin(t * 5)) * 5,  armL: Math.sin(t * 5) * 30, armR: -Math.sin(t * 5) * 30,
                   legL: -Math.sin(t * 5) * 26, legR: Math.sin(t * 5) * 26, lean: 3, head: Math.sin(t * 5) * 3 }),
    run:   t => ({ bob: Math.abs(Math.sin(t * 9)) * 11, armL: Math.sin(t * 9) * 58, armR: -Math.sin(t * 9) * 58,
                   legL: -Math.sin(t * 9) * 52, legR: Math.sin(t * 9) * 52, lean: 13, head: 6 }),
    jump:  t => { const p = (Math.sin(t * 3.4) + 1) / 2;
                  return { bob: -p * 46, armL: -p * 100, armR: -p * 100,
                           legL: -p * 26, legR: p * 26, lean: 0, head: -p * 6 }; },
    dance: t => ({ bob: Math.abs(Math.sin(t * 6)) * 9, armL: -60 + Math.sin(t * 6) * 46,
                   armR: -60 - Math.sin(t * 6) * 46, legL: Math.sin(t * 3) * 22,
                   legR: -Math.sin(t * 3) * 22, lean: Math.sin(t * 3) * 9, head: Math.sin(t * 6) * 9 }),
    sway:  t => ({ bob: Math.sin(t * 1.6) * 3, armL: Math.sin(t * 1.6) * 16, armR: Math.sin(t * 1.6) * 16,
                   legL: 0, legR: 0, lean: Math.sin(t * 1.6) * 8, head: Math.sin(t * 1.6) * 6 }),
    point: t => ({ bob: Math.sin(t * 2) * 1.5, armL: 4, armR: -78 + Math.sin(t * 4) * 5,
                   legL: 0, legR: 0, lean: -3, head: -Math.sin(t * 2) * 3 })
  };

  /* ---- the panel --------------------------------------------------------- */
  const css = document.createElement('style');
  css.textContent = [
    '#ncPaBtn{position:fixed;right:18px;bottom:158px;z-index:995;display:flex;align-items:center;gap:8px;',
    'padding:11px 16px;border:0;border-radius:30px;cursor:pointer;font:600 13.5px system-ui,sans-serif;',
    'color:#05070E;background:linear-gradient(110deg,#FFD166,#FF6B9D);box-shadow:0 8px 26px rgba(255,107,157,.4)}',
    'body.ncplaying #ncPaBtn{display:none}',
    '#ncPa{position:fixed;inset:0;z-index:99994;display:none;place-items:center;padding:18px;',
    'background:rgba(4,6,12,.92);backdrop-filter:blur(10px);font-family:system-ui,sans-serif}',
    '#ncPa.on{display:grid}',
    '#ncPaC{width:100%;max-width:940px;max-height:94vh;overflow:auto;background:#0B0E16;color:#EAF2FF;',
    'border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:24px}',
    '#ncPaC h2{font-size:1.2rem;font-weight:650;margin-bottom:5px}',
    '#ncPaC .sub{color:#8A97B4;font-size:.9rem;line-height:1.6;margin-bottom:16px}',
    '#ncPaGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:18px}',
    '#ncPaCv{width:100%;border-radius:14px;background:#0F1420;border:1px solid rgba(255,255,255,.12);',
    'touch-action:none;display:block;aspect-ratio:4/3}',
    '#ncPa .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center}',
    '#ncPa button.b{padding:10px 17px;border:0;border-radius:11px;cursor:pointer;font:600 13.5px system-ui;',
    'color:#05070E;background:linear-gradient(110deg,#7C5CFF,#00E5FF)}',
    '#ncPa button.b.alt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);color:#EAF2FF}',
    '#ncPa button.b:disabled{opacity:.45;cursor:default}',
    '#ncPa input[type=text],#ncPa textarea,#ncPa select{width:100%;padding:11px 13px;border-radius:11px;',
    'border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#EAF2FF;font:inherit;font-size:14px;resize:vertical}',
    '#ncPa label{display:block;font-size:12.5px;color:#8A97B4;margin:14px 0 6px}',
    '#ncPaSay{border-radius:13px;padding:13px 15px;font-size:13.5px;line-height:1.6;margin-top:12px;display:none}',
    '#ncPaSay.no{background:rgba(255,107,157,.09);border:1px solid rgba(255,107,157,.4)}',
    '#ncPaSay.yes{background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.32)}',
    '#ncPaSay.wait{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#A8B4CE}',
    '#ncPaSay b{display:block;margin-bottom:4px}',
    '#ncPa .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}',
    '#ncPa .chips button{padding:6px 12px;border-radius:20px;font-size:12.5px;cursor:pointer;',
    'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);color:#A8B4CE}',
    '#ncPa .hint{color:#7E8AA6;font-size:12.5px;line-height:1.6;margin-top:10px}',
    '@media (max-width:700px){#ncPaBtn{bottom:auto;top:12px;right:12px;padding:9px 13px;font-size:12.5px}}'
  ].join('');
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.id = 'ncPaBtn';
  btn.innerHTML = '<span style="font-size:15px">🎨</span> Animate a drawing';
  btn.title = 'Turn a drawing into a moving clip';

  const ui = document.createElement('div');
  ui.id = 'ncPa';
  ui.innerHTML =
    '<div id="ncPaC">' +
      '<h2>Animate a drawing</h2>' +
      '<p class="sub">Photograph a drawing, drag the dots onto its head, hands and feet, then say ' +
      'how it should move. Nothing is uploaded — only the sentence you type is sent, and only when ' +
      'you ask for a motion.</p>' +
      '<div id="ncPaGrid">' +
        '<div>' +
          '<canvas id="ncPaCv" width="640" height="480"></canvas>' +
          '<div class="row">' +
            '<label for="ncPaFile" class="b" style="display:inline-block;margin:0;color:#05070E">Open a drawing</label>' +
            '<input type="file" id="ncPaFile" accept="image/*" style="display:none">' +
            '<button class="b alt" id="ncPaPlay">Play</button>' +
            '<button class="b alt" id="ncPaReset">Reset dots</button>' +
            '<button class="b alt" id="ncPaRec">Record 6s</button>' +
          '</div>' +
          '<p class="hint">Draw on white paper with a dark pen and it lifts off the page cleanly. ' +
          'The dots are the puppet’s joints — the closer they sit to the real ones, the better it moves.</p>' +
        '</div>' +
        '<div>' +
          '<label for="ncPaAsk">How should it move?</label>' +
          '<textarea id="ncPaAsk" rows="3" placeholder="e.g. skipping happily, leaning forward a bit"></textarea>' +
          '<div class="chips">' +
            '<button>waving hello</button><button>running fast</button>' +
            '<button>dancing at a party</button><button>walking sadly</button>' +
            '<button>jumping for joy</button><button>pointing at something</button>' +
          '</div>' +
          '<div class="row"><button class="b" id="ncPaGo">Direct it</button></div>' +
          '<div id="ncPaSay"></div>' +
          '<label for="ncPaBase">Or set it yourself</label>' +
          '<select id="ncPaBase"></select>' +
          '<div class="row" style="gap:14px">' +
            '<label style="margin:0;flex:1">Speed<input type="range" id="ncPaSpeed" min="0.2" max="3" step="0.1" value="1" style="width:100%"></label>' +
            '<label style="margin:0;flex:1">Bounce<input type="range" id="ncPaBounce" min="0" max="3" step="0.1" value="1" style="width:100%"></label>' +
          '</div>' +
          '<p class="hint" id="ncPaOut">Recording gives you a six-second WebM. Save it, then bring it ' +
          'into the timeline the same way you add any other clip.</p>' +
        '</div>' +
      '</div>' +
      '<div class="row" style="margin-top:18px">' +
        '<button class="b alt" id="ncPaClose">Close</button>' +
      '</div>' +
    '</div>';

  function boot() {
    if (document.getElementById('ncPaBtn')) return;
    document.body.appendChild(btn);
    document.body.appendChild(ui);
    wire();
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ---- engine ------------------------------------------------------------ */
  function wire() {
    const $ = id => document.getElementById(id);
    const cv = $('ncPaCv'), ctx = cv.getContext('2d', { willReadFrequently: true });
    let cut = null, playing = false, raf = 0, t0 = 0, drag = -1, rec = null;
    let mot = Object.assign({}, DEFAULT);

    $('ncPaBase').innerHTML = BASES.map(b =>
      '<option value="' + b + '">' + b[0].toUpperCase() + b.slice(1) + '</option>').join('');

    const NAMES = ['head', 'neck', 'hip', 'handL', 'handR', 'footL', 'footR', 'shoulderL', 'shoulderR'];
    let J = {};
    const defaults = (w, h) => ({
      head:      [w * 0.50, h * 0.13], neck: [w * 0.50, h * 0.26], hip: [w * 0.50, h * 0.56],
      shoulderL: [w * 0.38, h * 0.29], shoulderR: [w * 0.62, h * 0.29],
      handL:     [w * 0.24, h * 0.52], handR: [w * 0.76, h * 0.52],
      footL:     [w * 0.40, h * 0.94], footR: [w * 0.60, h * 0.94]
    });

    const BONES = [
      ['neck', 'shoulderR', 0.22], ['shoulderR', 'handR', 0.20],
      ['hip', 'footR', 0.24],
      ['neck', 'hip', 0.46],
      ['head', 'neck', 0.46],
      ['hip', 'footL', 0.24],
      ['neck', 'shoulderL', 0.22], ['shoulderL', 'handL', 0.20]
    ];

    /* The page is whatever colour dominates the border of the photo. Anything
       far enough from it is ink. Copes with a phone photo of a sketchbook under
       a lamp, which a fixed white threshold does not. */
    function lift(image, w, h) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(image, 0, 0, w, h);
      const im = x.getImageData(0, 0, w, h), d = im.data;
      let r = 0, g = 0, b = 0, n = 0;
      const edge = (px, py) => px < 3 || py < 3 || px > w - 4 || py > h - 4;
      for (let py = 0; py < h; py += 2) for (let px = 0; px < w; px += 2) {
        if (!edge(px, py)) continue;
        const i = (py * w + px) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
      r /= n; g /= n; b /= n;
      for (let i = 0; i < d.length; i += 4) {
        const dist = Math.hypot(d[i] - r, d[i + 1] - g, d[i + 2] - b);
        d[i + 3] = dist < 46 ? 0 : Math.min(255, dist * 4);
      }
      x.putImageData(im, 0, 0);
      return c;
    }

    function draw(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!cut) return;
      const raw = (CYCLE[mot.base] || CYCLE.idle)(playing ? t * mot.speed : 0);
      const m = {
        bob:  raw.bob * mot.bounce,
        armL: raw.armL * mot.arms, armR: raw.armR * mot.arms,
        legL: raw.legL * mot.legs, legR: raw.legR * mot.legs,
        lean: raw.lean + mot.lean, head: raw.head * mot.head
      };
      const rot = { 'neck>shoulderL': m.armL, 'shoulderL>handL': m.armL * 0.6,
                    'neck>shoulderR': m.armR, 'shoulderR>handR': m.armR * 0.6,
                    'hip>footL': m.legL, 'hip>footR': m.legR,
                    'neck>hip': m.lean * -0.5, 'head>neck': m.head };
      ctx.save();
      ctx.translate(0, m.bob);
      BONES.forEach(([a, b, wide]) => {
        const A = J[a], B = J[b];
        if (!A || !B) return;
        const ang = (rot[a + '>' + b] || 0) * Math.PI / 180;
        const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        const w = Math.max(18, len * wide);
        const base = Math.atan2(B[1] - A[1], B[0] - A[0]);
        ctx.save();
        ctx.translate(A[0], A[1]); ctx.rotate(ang); ctx.translate(-A[0], -A[1]);
        /* a capsule around the bone, so limbs overlap at the joints rather
           than leaving a gap when they swing */
        ctx.beginPath();
        ctx.save();
        ctx.translate(A[0], A[1]); ctx.rotate(base);
        ctx.roundRect ? ctx.roundRect(-w * 0.5, -w * 0.55, len + w, w * 1.1, w * 0.5)
                      : ctx.rect(-w * 0.5, -w * 0.55, len + w, w * 1.1);
        ctx.restore();
        ctx.clip();
        ctx.drawImage(cut, 0, 0);
        ctx.restore();
      });
      ctx.restore();
      if (!playing) NAMES.forEach(n => {
        const p = J[n]; if (!p) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7);
        ctx.fillStyle = 'rgba(0,229,255,.85)'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#061018'; ctx.stroke();
      });
    }

    function say(kind, title, body) {
      const s = $('ncPaSay');
      s.className = kind; s.style.display = 'block';
      s.innerHTML = '<b>' + title + '</b>' +
        String(body).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    }

    $('ncPaFile').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
        cv.width = Math.round(img.naturalWidth * s);
        cv.height = Math.round(img.naturalHeight * s);
        cut = lift(img, cv.width, cv.height);
        J = defaults(cv.width, cv.height);
        playing = false; $('ncPaPlay').textContent = 'Play';
        draw(0);
        say('yes', 'Drawing loaded', 'Drag the blue dots onto its head, hands and feet, then say how it should move.');
      };
      img.onerror = () => say('no', 'Could not read that file', 'Try a JPG or PNG photo of the drawing.');
      img.src = URL.createObjectURL(f);
    };

    const at = e => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
    };
    cv.addEventListener('pointerdown', e => {
      if (!cut || playing) return;
      const [x, y] = at(e);
      let best = -1, bd = 24;
      NAMES.forEach((n, i) => {
        const d = Math.hypot(J[n][0] - x, J[n][1] - y);
        if (d < bd) { bd = d; best = i; }
      });
      drag = best;
      if (best >= 0) { try { cv.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); }
    });
    cv.addEventListener('pointermove', e => {
      if (drag < 0) return;
      J[NAMES[drag]] = at(e); draw(0); e.preventDefault();
    });
    ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { drag = -1; }));

    function loop(now) {
      if (!playing) return;
      if (!t0) t0 = now;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!playing) { playing = true; t0 = 0; raf = requestAnimationFrame(loop); $('ncPaPlay').textContent = 'Stop'; } }
    function stop()  { playing = false; cancelAnimationFrame(raf); $('ncPaPlay').textContent = 'Play'; draw(0); }

    $('ncPaPlay').onclick = () => {
      if (!cut) return say('no', 'No drawing yet', 'Open a photo of a drawing first.');
      playing ? stop() : start();
    };
    $('ncPaReset').onclick = () => { if (!cut) return; J = defaults(cv.width, cv.height); stop(); };

    $('ncPaBase').onchange = () => { mot.base = $('ncPaBase').value; draw(0); };
    $('ncPaSpeed').oninput  = () => { mot.speed  = +$('ncPaSpeed').value; };
    $('ncPaBounce').oninput = () => { mot.bounce = +$('ncPaBounce').value; };

    ui.querySelectorAll('.chips button').forEach(b =>
      b.onclick = () => { $('ncPaAsk').value = b.textContent; $('ncPaAsk').focus(); });

    /* ---- the director ---------------------------------------------------- */
    const SYS =
      'You are directing a cut-out paper puppet: a photographed drawing cut into eight pieces ' +
      '(head, torso, two arms, two forearms, two legs) that can only rotate about their joints ' +
      'and bob up and down. It has no face controls, no mouth, no fingers, no camera, no ' +
      'background, and it cannot move across the frame or change shape.\n\n' +
      'Answer with ONE line of JSON and nothing else.\n\n' +
      'If the request fits what the puppet can do:\n' +
      '{"ok":true,"base":"<one of: ' + BASES.join(', ') + '>","speed":0.2-3,"arms":0-2.5,' +
      '"legs":0-2.5,"lean":-25..25,"bounce":0-3,"head":0-3,"why":"<under 18 words on your reading of it>"}\n\n' +
      'If any part of it is outside that — lip sync, facial expression, walking across the screen, ' +
      'a camera move, a background, 3D, changing the drawing, adding objects, more than one ' +
      'character — then:\n' +
      '{"ok":false,"why":"<one plain sentence naming the part that is not possible and why>",' +
      '"instead":"<the closest motion this puppet CAN do>"}\n\n' +
      'Do not stretch a request to fit. Saying no accurately is more useful than a motion that ' +
      'ignores what was asked for. Interpret mood through the numbers: sad is slow with low ' +
      'bounce and a forward lean, excited is fast with high bounce.';

    $('ncPaGo').onclick = async () => {
      const q = $('ncPaAsk').value.trim();
      if (!q) return;
      if (typeof window.ncAsk !== 'function')
        return say('no', 'The AI is not loaded', 'nova.js did not load on this page, so there is nothing to ask. The sliders below still work.');

      $('ncPaGo').disabled = true;
      say('wait', 'Thinking…', 'Working out whether this puppet can do that.');
      const r = await window.ncAsk(SYS + '\n\nREQUEST: ' + q, { maxTokens: 400, temperature: 0.3 });
      $('ncPaGo').disabled = false;

      if (r.err) return say('no', 'Could not reach the AI', r.err + ' The sliders below still work.');

      let j = null;
      try { j = JSON.parse((r.text.match(/\{[\s\S]*\}/) || [''])[0]); } catch (e) {}
      if (!j) return say('no', 'The AI answered in a shape I could not read', 'Try saying it in fewer words.');

      if (j.ok === false) {
        return say('no', 'That is past what this can do',
          (j.why || 'Part of that is outside a cut-out puppet.') +
          (j.instead ? '  Closest it can do: ' + j.instead : ''));
      }

      mot = sanitise(j);
      $('ncPaBase').value = mot.base;
      $('ncPaSpeed').value = mot.speed;
      $('ncPaBounce').value = mot.bounce;
      say('yes', 'Directed: ' + mot.base, (j.why || '') +
        '  (speed ' + mot.speed + ', bounce ' + mot.bounce + ', lean ' + mot.lean + '°)');
      if (cut) start();
      if (typeof window.logSkill === 'function') window.logSkill('editing');
      if (window.addPts) addPts(5);
    };

    /* ---- recording ------------------------------------------------------- */
    $('ncPaRec').onclick = () => {
      if (!cut) return say('no', 'No drawing yet', 'Open a photo of a drawing first.');
      if (rec) { rec.stop(); return; }
      if (!cv.captureStream || typeof MediaRecorder === 'undefined')
        return say('no', 'This browser cannot record a canvas', 'Chrome, Edge and Firefox can.');
      const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .find(t => MediaRecorder.isTypeSupported(t));
      if (!type) return say('no', 'No video encoder here', 'This browser has none available.');

      const chunks = [];
      rec = new MediaRecorder(cv.captureStream(30), { mimeType: type, videoBitsPerSecond: 4000000 });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'paper-animation.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        say('yes', 'Saved paper-animation.webm',
          Math.round(blob.size / 1024) + ' kB. Add it to the timeline the same way you add any other clip.');
        rec = null; $('ncPaRec').textContent = 'Record 6s';
        stop();
      };
      start();
      rec.start();
      $('ncPaRec').textContent = 'Stop';
      say('wait', 'Recording…', 'It stops on its own after six seconds.');
      setTimeout(() => { if (rec) rec.stop(); }, 6000);
    };

    /* ---- open and close -------------------------------------------------- */
    btn.onclick = () => { ui.classList.add('on'); draw(0); };
    $('ncPaClose').onclick = () => { stop(); ui.classList.remove('on'); };
    ui.addEventListener('click', e => { if (e.target === ui) { stop(); ui.classList.remove('on'); } });
    addEventListener('keydown', e => { if (e.key === 'Escape' && ui.classList.contains('on')) { stop(); ui.classList.remove('on'); } });
  }
})();


/* ============================================================================
   REMOVE SOMETHING FROM A PICTURE
   ============================================================================
   Paint over the thing you do not want and it is replaced with what the
   surrounding image says should be behind it. Same job as cleanup.pictures,
   done here in the browser: nothing is uploaded, which for a site used by
   teenagers is not a small detail — the photo never leaves the device.

   HOW IT WORKS, since "AI magic" is not an explanation. It is exemplar-based
   inpainting. The hole is filled from its edge inward, one ring at a time. For
   each boundary pixel the algorithm searches the nearby image for the 9x9
   patch that best matches the known part of its surroundings, and copies the
   middle of that patch in. Because it always works from the boundary, each
   ring it fills becomes context for the next one — which is how a fence or a
   brick wall continues through the hole instead of smearing.

   It is not a diffusion model and it will not invent a face that was hidden
   behind someone. It is very good at removing a person from grass, a sign from
   a wall, a stranger from a beach — anything whose background is texture. On a
   busy background you will see it repeat a detail. That is the honest limit of
   the method, and the panel says so rather than letting you find out.
   ============================================================================ */
(function () {
  'use strict';
  if (!/editor\.html/i.test(location.pathname) && !document.getElementById('root')) return;

  const css = document.createElement('style');
  css.textContent = [
    '#ncRmBtn{position:fixed;right:18px;bottom:212px;z-index:995;display:flex;align-items:center;gap:8px;',
    'padding:11px 16px;border:0;border-radius:30px;cursor:pointer;font:600 13.5px system-ui,sans-serif;',
    'color:#05070E;background:linear-gradient(110deg,#7CFF9E,#00E5FF);box-shadow:0 8px 26px rgba(0,229,255,.35)}',
    'body.ncplaying #ncRmBtn{display:none}',
    '#ncRm{position:fixed;inset:0;z-index:99994;display:none;place-items:center;padding:18px;',
    'background:rgba(4,6,12,.92);backdrop-filter:blur(10px);font-family:system-ui,sans-serif}',
    '#ncRm.on{display:grid}',
    '#ncRmC{width:100%;max-width:900px;max-height:94vh;overflow:auto;background:#0B0E16;color:#EAF2FF;',
    'border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:24px}',
    '#ncRmC h2{font-size:1.2rem;font-weight:650;margin-bottom:5px}',
    '#ncRmC .sub{color:#8A97B4;font-size:.9rem;line-height:1.6;margin-bottom:16px}',
    '#ncRmCv{width:100%;border-radius:14px;background:#0F1420;border:1px solid rgba(255,255,255,.12);',
    'touch-action:none;display:block;cursor:crosshair}',
    '#ncRm .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center}',
    '#ncRm button.b{padding:10px 17px;border:0;border-radius:11px;cursor:pointer;font:600 13.5px system-ui;',
    'color:#05070E;background:linear-gradient(110deg,#7CFF9E,#00E5FF)}',
    '#ncRm button.b.alt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);color:#EAF2FF}',
    '#ncRm button.b:disabled{opacity:.45;cursor:default}',
    '#ncRm label{font-size:12.5px;color:#8A97B4}',
    '#ncRmSay{border-radius:13px;padding:12px 15px;font-size:13.5px;line-height:1.6;margin-top:12px;display:none;',
    'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#A8B4CE}',
    '@media (max-width:700px){#ncRmBtn{bottom:auto;top:58px;right:12px;padding:9px 13px;font-size:12.5px}}'
  ].join('');
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.id = 'ncRmBtn';
  btn.innerHTML = '<span style="font-size:15px">\u2702\ufe0f</span> Remove something';
  btn.title = 'Paint over something to take it out of a photo';

  const ui = document.createElement('div');
  ui.id = 'ncRm';
  ui.innerHTML =
    '<div id="ncRmC">' +
      '<h2>Remove something from a picture</h2>' +
      '<p class="sub">Open a photo, paint over what you want gone, then press Remove. ' +
      'It works best when what is behind the thing is texture \u2014 grass, sky, a wall, sand. ' +
      'Nothing is uploaded; the picture never leaves this device.</p>' +
      '<canvas id="ncRmCv" width="800" height="600"></canvas>' +
      '<div class="row">' +
        '<label for="ncRmFile" class="b" style="display:inline-block;color:#05070E">Open a photo</label>' +
        '<input type="file" id="ncRmFile" accept="image/*" style="display:none">' +
        '<label>Brush <input type="range" id="ncRmSize" min="6" max="70" step="2" value="26"></label>' +
        '<button class="b alt" id="ncRmUndo">Undo stroke</button>' +
        '<button class="b alt" id="ncRmClear">Clear paint</button>' +
        '<button class="b" id="ncRmGo">Remove it</button>' +
        '<button class="b alt" id="ncRmSave">Save PNG</button>' +
      '</div>' +
      '<div id="ncRmSay"></div>' +
      '<div class="row"><button class="b alt" id="ncRmClose">Close</button></div>' +
    '</div>';

  function boot() {
    if (document.getElementById('ncRmBtn')) return;
    document.body.appendChild(btn);
    document.body.appendChild(ui);
    wire();
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();

  function wire() {
    const $ = id => document.getElementById(id);
    const cv = $('ncRmCv'), ctx = cv.getContext('2d', { willReadFrequently: true });
    let base = null;            // the photo, as ImageData
    let mask = null;            // Uint8Array, 1 = painted out
    let strokes = [];           // for undo: each entry is the mask before that stroke
    let painting = false, brush = 26;

    function say(t) { const s = $('ncRmSay'); s.style.display = t ? 'block' : 'none'; s.textContent = t || ''; }

    function repaint() {
      if (!base) return;
      ctx.putImageData(base, 0, 0);
      if (!mask) return;
      /* The paint is drawn as a translucent overlay rather than into the pixels,
         so the original is never damaged by marking it up. */
      const ov = ctx.getImageData(0, 0, cv.width, cv.height), d = ov.data;
      for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
        if (!mask[i]) continue;
        d[p] = d[p] * 0.35 + 255 * 0.65;
        d[p + 1] = d[p + 1] * 0.35 + 46 * 0.65;
        d[p + 2] = d[p + 2] * 0.35 + 138 * 0.65;
      }
      ctx.putImageData(ov, 0, 0);
    }

    $('ncRmFile').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const img = new Image();
      img.onload = () => {
        /* Capped at 1100px on the long edge. The patch search is O(hole x
           window) and a 12-megapixel phone photo would take minutes for a
           result nobody can tell apart from this one. */
        const s = Math.min(1, 1100 / Math.max(img.naturalWidth, img.naturalHeight));
        cv.width = Math.round(img.naturalWidth * s);
        cv.height = Math.round(img.naturalHeight * s);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        base = ctx.getImageData(0, 0, cv.width, cv.height);
        mask = new Uint8Array(cv.width * cv.height);
        strokes = [];
        repaint();
        say('Paint over what you want gone. Cover it completely, and a little past its edge.');
      };
      img.onerror = () => say('Could not read that file. Try a JPG or PNG.');
      img.src = URL.createObjectURL(f);
    };

    $('ncRmSize').oninput = e => { brush = +e.target.value; };

    const at = e => {
      const r = cv.getBoundingClientRect();
      return [Math.round((e.clientX - r.left) * cv.width / r.width),
              Math.round((e.clientY - r.top) * cv.height / r.height)];
    };
    function dab(x, y) {
      const rad = brush / 2, r2 = rad * rad;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy > r2) continue;
        const px = Math.round(x + dx), py = Math.round(y + dy);
        if (px < 0 || py < 0 || px >= cv.width || py >= cv.height) continue;
        mask[py * cv.width + px] = 1;
      }
    }
    cv.addEventListener('pointerdown', e => {
      if (!base) return;
      painting = true;
      strokes.push(Uint8Array.from(mask));
      if (strokes.length > 12) strokes.shift();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      const [x, y] = at(e); dab(x, y); repaint(); e.preventDefault();
    });
    cv.addEventListener('pointermove', e => {
      if (!painting) return;
      const [x, y] = at(e); dab(x, y); repaint(); e.preventDefault();
    });
    ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { painting = false; }));

    $('ncRmUndo').onclick = () => {
      if (!strokes.length) return;
      mask = strokes.pop(); repaint();
    };
    $('ncRmClear').onclick = () => {
      if (!mask) return;
      mask = new Uint8Array(cv.width * cv.height); strokes = []; repaint();
    };

    $('ncRmGo').onclick = () => {
      if (!base) return say('Open a photo first.');
      let n = 0; for (let i = 0; i < mask.length; i++) if (mask[i]) n++;
      if (!n) return say('Nothing is painted yet.');
      if (n > mask.length * 0.45)
        return say('That is nearly half the picture. There is not enough left for it to work out ' +
                   'what belongs there \u2014 paint over less.');

      $('ncRmGo').disabled = true;
      say('Working\u2026 filling ' + n.toLocaleString() + ' pixels from the edges inward. ' +
          'A big area takes a few seconds.');
      /* Two frames before starting: one to paint the message, one to let the
         browser actually show it. The fill blocks the main thread, so without
         this the "working" text never appears. */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const t0 = performance.now();
        try {
          base = inpaint(base, mask, cv.width, cv.height);
          mask = new Uint8Array(cv.width * cv.height);
          strokes = [];
          repaint();
          say('Done in ' + ((performance.now() - t0) / 1000).toFixed(1) + 's. ' +
              'Paint over anything it got wrong and run it again \u2014 it works on the new picture.');
          if (window.addPts) addPts(5);
        } catch (err) {
          say('That did not work: ' + err.message);
        }
        $('ncRmGo').disabled = false;
      }));
    };

    $('ncRmSave').onclick = () => {
      if (!base) return say('Nothing to save yet.');
      /* Save the CLEAN image, not the canvas — the canvas has the paint
         overlay drawn on it. */
      const out = document.createElement('canvas');
      out.width = cv.width; out.height = cv.height;
      out.getContext('2d').putImageData(base, 0, 0);
      out.toBlob(bl => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(bl);
        a.download = 'cleaned.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        say('Saved cleaned.png');
      }, 'image/png');
    };

    btn.onclick = () => ui.classList.add('on');
    $('ncRmClose').onclick = () => ui.classList.remove('on');
    ui.addEventListener('click', e => { if (e.target === ui) ui.classList.remove('on'); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && ui.classList.contains('on')) ui.classList.remove('on'); });
  }

  /* --- exemplar-based inpainting, filled from the boundary inward --- */
  function inpaint(image, hole, W, H) {
    const d = new Uint8ClampedArray(image.data);
    const unknown = Uint8Array.from(hole);
    const P = 4;                       // patch half-width: 9x9 window
    const SEARCH = 90;                 // how far to look for a donor patch
    const idx = (x, y) => (y * W + x) * 4;

    let remaining = 0;
    for (let i = 0; i < unknown.length; i++) if (unknown[i]) remaining++;

    let guard = 0;
    while (remaining > 0 && guard++ < 4000) {
      /* The boundary: unknown pixels with at least one known neighbour.
         Filling only these, then recomputing, is the onion peel. */
      const edge = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!unknown[y * W + x]) continue;
        if ((x > 0 && !unknown[y * W + x - 1]) || (x < W - 1 && !unknown[y * W + x + 1]) ||
            (y > 0 && !unknown[(y - 1) * W + x]) || (y < H - 1 && !unknown[(y + 1) * W + x])) {
          edge.push([x, y]);
        }
      }
      if (!edge.length) break;

      /* Highest confidence first: the boundary pixel with the most known
         neighbours has the most context to match against, so it is the one
         whose guess is most likely to be right. */
      edge.sort((a, b) => known(b[0], b[1]) - known(a[0], a[1]));

      const wrote = [];
      for (let e = 0; e < edge.length; e++) {
        const [x, y] = edge[e];
        const best = findPatch(x, y);
        if (best) {
          const s = idx(best[0], best[1]), t = idx(x, y);
          d[t] = d[s]; d[t + 1] = d[s + 1]; d[t + 2] = d[s + 2]; d[t + 3] = 255;
          wrote.push(y * W + x);
        }
      }
      if (!wrote.length) break;
      wrote.forEach(i => { unknown[i] = 0; remaining--; });
    }

    /* Anything the search could never place — a hole larger than the search
       window, or one touching an edge with no texture near it — is closed by
       averaging its known neighbours so no magenta paint survives. */
    for (let pass = 0; pass < 40 && remaining > 0; pass++) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!unknown[y * W + x]) continue;
        let r = 0, g = 0, b = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const px = x + dx, py = y + dy;
          if (px < 0 || py < 0 || px >= W || py >= H || unknown[py * W + px]) continue;
          const s = idx(px, py); r += d[s]; g += d[s + 1]; b += d[s + 2]; n++;
        }
        if (n < 2) continue;
        const t = idx(x, y);
        d[t] = r / n; d[t + 1] = g / n; d[t + 2] = b / n; d[t + 3] = 255;
        unknown[y * W + x] = 0; remaining--;
      }
    }
    return new ImageData(d, W, H);

    function known(x, y) {
      let n = 0;
      for (let dy = -P; dy <= P; dy++) for (let dx = -P; dx <= P; dx++) {
        const px = x + dx, py = y + dy;
        if (px >= 0 && py >= 0 && px < W && py < H && !unknown[py * W + px]) n++;
      }
      return n;
    }

    /* Sum of squared differences over the known pixels of the patch. The
         donor must itself be fully known, or the hole copies its own hole. */
    function findPatch(x, y) {
      let bx = -1, by = -1, bestErr = Infinity;
      const x0 = Math.max(P, x - SEARCH), x1 = Math.min(W - P - 1, x + SEARCH);
      const y0 = Math.max(P, y - SEARCH), y1 = Math.min(H - P - 1, y + SEARCH);
      const step = (x1 - x0) * (y1 - y0) > 40000 ? 2 : 1;   // thin the search on big windows
      for (let cy = y0; cy <= y1; cy += step) for (let cx = x0; cx <= x1; cx += step) {
        if (unknown[cy * W + cx]) continue;
        let err = 0, n = 0, bad = false;
        for (let dy = -P; dy <= P && !bad; dy += 2) for (let dx = -P; dx <= P; dx += 2) {
          const sx = cx + dx, sy = cy + dy, tx = x + dx, ty = y + dy;
          if (sx < 0 || sy < 0 || sx >= W || sy >= H) { bad = true; break; }
          if (unknown[sy * W + sx]) { bad = true; break; }
          if (tx < 0 || ty < 0 || tx >= W || ty >= H || unknown[ty * W + tx]) continue;
          const a = idx(sx, sy), b = idx(tx, ty);
          const dr = d[a] - d[b], dg = d[a + 1] - d[b + 1], db = d[a + 2] - d[b + 2];
          err += dr * dr + dg * dg + db * db; n++;
          if (err > bestErr * n) { bad = true; break; }        // early out
        }
        if (bad || n < 4) continue;
        const e = err / n;
        if (e < bestErr) { bestErr = e; bx = cx; by = cy; }
      }
      return bx < 0 ? null : [bx, by];
    }
  }
})();
