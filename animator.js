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
