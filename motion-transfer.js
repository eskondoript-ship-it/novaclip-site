/* ============================================================================
   MOTION TRANSFER — a character image, driven by a video
   ============================================================================
   Drop in a picture of a character and a clip of someone moving; the character
   performs that movement, and the result goes onto the timeline as a clip.

   WHY IT DOES NOT LAG, WHICH IS THE WHOLE DESIGN

   The obvious build runs the pose model on every frame while the preview
   plays. That is what makes these things stutter: a pose network costs 15-40ms
   a frame on a laptop and far more on a phone, so the animation is pinned to
   whatever the model can manage and drops frames whenever the machine is busy.

   So the model runs ONCE, over the reference video, before anything is shown.
   What it produces is a track: nine joint positions per sampled frame, a few
   hundred numbers a second. Playback reads that array and interpolates. There
   is no inference, no video decode and no allocation in the draw loop, so it
   runs at whatever the display does and keeps running while the rest of the
   editor works.

   Extraction is chunked across animation frames rather than run in one loop,
   so the page stays responsive while it happens and can show real progress.

   RETARGETING, WHICH IS WHY IT DOES NOT LOOK WRONG

   Copying the video's joint positions onto the character stretches it into the
   shape of whoever was filmed — a tall dancer turns a chibi into a giraffe.
   Only the ANGLES are taken from the video. Bone lengths stay the character's
   own, and each joint is placed by walking out from the hip along the
   character's skeleton in the direction the video's skeleton points. The hip
   itself follows the subject around the frame, so walking still travels.

   WHAT THIS IS NOT

   It is not Viggle's model. Viggle runs a trained video network that repaints
   the character every frame; this poses a cut-out. It is honest paper
   animation driven by real recorded motion, it costs nothing per use, and
   nothing leaves the browser — which is the trade this site wants.
   ============================================================================ */
(function () {
  'use strict';

  /* The maths below is pure and is unit-tested under node, so the module
     attaches itself wherever it finds a global rather than assuming a browser.
     Only the panel — which needs a document — checks the page. */
  var G = typeof window !== 'undefined' ? window
        : typeof globalThis !== 'undefined' ? globalThis : this;
  if (G.NCMotion) return;

  /* ---- tunables ---------------------------------------------------------- */
  var FPS = 24;             // sampling rate of the reference video
  var MAX_SECONDS = 20;     // bounds the work and the memory
  var SMOOTH = 0.45;        // 0 none, 1 frozen — pose output jitters and it shows
  var MODEL =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/' +
    'pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  var VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

  /* The nine the rig has, and where each comes from in MediaPipe's 33. Its
     "left" is the subject's left, which is the right of the image; the names
     below are the rig's, so they are deliberately crossed. */
  var LM = {
    nose: 0, shoulderR: 11, shoulderL: 12, wristR: 15, wristL: 16,
    hipR: 23, hipL: 24, ankleR: 27, ankleL: 28
  };

  /* Walking order out from the root. Each entry is [parent, child]; a child is
     placed along the video's direction at the character's own bone length. */
  var CHAIN = [
    ['hip', 'neck'], ['neck', 'head'],
    ['neck', 'shoulderL'], ['shoulderL', 'handL'],
    ['neck', 'shoulderR'], ['shoulderR', 'handR'],
    ['hip', 'footL'], ['hip', 'footR']
  ];

  /* ---- the pose provider -------------------------------------------------
     Swappable so the maths below can be tested without a network, and so a
     different model can be dropped in later without touching the rest. A
     provider takes a video element and a time, and returns 33 landmarks as
     {x,y} in 0..1, or null when it cannot see a person. */
  var provider = null;

  function defaultProvider() {
    var landmarker = null;
    return function (videoEl) {
      if (!landmarker) return Promise.reject(new Error('pose model not ready'));
      var res = landmarker.detectForVideo(videoEl, performance.now());
      var lm = res && res.landmarks && res.landmarks[0];
      return Promise.resolve(lm || null);
    };
    /* loadModel() below fills `landmarker` in. Kept in this closure so the
       model handle cannot leak into the rest of the file and be used from
       somewhere that has not checked it loaded. */
  }

  var _vision = null;
  function loadModel(onProgress) {
    if (_vision) return _vision;
    _vision = new Promise(function (res, rej) {
      onProgress && onProgress('Loading the pose model…');
      import(VISION_CDN + '/vision_bundle.mjs').then(function (v) {
        return v.FilesetResolver.forVisionTasks(VISION_CDN + '/wasm').then(function (files) {
          return v.PoseLandmarker.createFromOptions(files, {
            baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1
          });
        });
      }).then(res, function (e) {
        _vision = null;
        rej(new Error('The pose model could not be loaded. It comes from ' +
          'cdn.jsdelivr.net and storage.googleapis.com — a school filter, an ad ' +
          'blocker or being offline will stop it. ' + (e && e.message ? '(' + e.message + ')' : '')));
      });
    });
    return _vision;
  }

  /* ---- extraction --------------------------------------------------------
     Seeks the video frame by frame rather than playing it. Playing would tie
     the pass to real time and to whatever the model can keep up with; seeking
     runs as fast as the machine allows and cannot silently skip frames. */
  function extract(videoEl, opts) {
    opts = opts || {};
    var onProgress = opts.onProgress || function () {};
    var fps = opts.fps || FPS;
    var dur = Math.min(videoEl.duration || 0, opts.maxSeconds || MAX_SECONDS);
    if (!dur || !isFinite(dur)) return Promise.reject(new Error('That video has no readable length.'));

    var total = Math.max(2, Math.round(dur * fps));
    var track = [], i = 0;

    function seekTo(t) {
      return new Promise(function (res) {
        var done = function () { videoEl.removeEventListener('seeked', done); res(); };
        videoEl.addEventListener('seeked', done);
        videoEl.currentTime = Math.min(t, dur - 0.001);
      });
    }

    return new Promise(function (resolve, reject) {
      function step() {
        if (i >= total) {
          if (!track.filter(Boolean).length)
            return reject(new Error('No person was found in that video. It needs a ' +
              'body in shot — head to feet works best.'));
          return resolve({ fps: fps, duration: dur, frames: track });
        }
        seekTo(i / fps).then(function () {
          return provider(videoEl, i / fps);
        }).then(function (lm) {
          track.push(lm ? nine(lm) : null);
          i++;
          onProgress(i / total);
          /* Back to the event loop between frames. A tight loop here is what
             makes a page freeze for ten seconds and then finish. */
          (window.requestAnimationFrame || setTimeout)(step);
        }).catch(reject);
      }
      step();
    });
  }

  /* MediaPipe's 33 down to the nine the rig has, in 0..1 space. neck and hip
     are midpoints — neither exists as a landmark, and both are what the rig
     hangs off. */
  function nine(lm) {
    function p(i) { var q = lm[i]; return q ? [q.x, q.y] : null; }
    function mid(a, b) {
      var A = p(a), B = p(b);
      return (A && B) ? [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] : null;
    }
    var o = {
      head: p(LM.nose),
      neck: mid(LM.shoulderL, LM.shoulderR),
      hip: mid(LM.hipL, LM.hipR),
      shoulderL: p(LM.shoulderL), shoulderR: p(LM.shoulderR),
      handL: p(LM.wristL), handR: p(LM.wristR),
      footL: p(LM.ankleL), footR: p(LM.ankleR)
    };
    for (var k in o) if (!o[k]) return null;   // partial pose is worse than none
    return o;
  }

  /* ---- smoothing ---------------------------------------------------------
     Pose output shivers by a pixel or two per frame, which reads as a nervous
     tremor once it drives a drawing. An exponential average across the baked
     track fixes it for free — the track is finite and already in memory, so
     this is one pass over an array rather than anything at playback. */
  function smooth(frames, amount) {
    var a = Math.max(0, Math.min(0.95, amount == null ? SMOOTH : amount));
    if (!a) return frames;
    var prev = null;
    return frames.map(function (f) {
      if (!f) { prev = null; return null; }
      if (!prev) { prev = f; return f; }
      var out = {};
      for (var k in f) {
        out[k] = [prev[k][0] + (f[k][0] - prev[k][0]) * (1 - a),
                  prev[k][1] + (f[k][1] - prev[k][1]) * (1 - a)];
      }
      prev = out;
      return out;
    });
  }

  /* Gaps where nobody was detected. Holding the last pose looks like a freeze;
     interpolating across the gap looks like the movement continued, which is
     nearer the truth for a brief occlusion. Long gaps still hold. */
  function fillGaps(frames, maxGap) {
    maxGap = maxGap || 8;
    var out = frames.slice();
    for (var i = 0; i < out.length; i++) {
      if (out[i]) continue;
      var a = i - 1; while (a >= 0 && !out[a]) a--;
      var b = i; while (b < out.length && !out[b]) b++;
      if (a < 0 || b >= out.length || b - a > maxGap) { out[i] = out[a] || out[b] || null; continue; }
      var t = (i - a) / (b - a), A = out[a], B = out[b], f = {};
      for (var k in A) f[k] = [A[k][0] + (B[k][0] - A[k][0]) * t,
                               A[k][1] + (B[k][1] - A[k][1]) * t];
      out[i] = f;
    }
    return out;
  }

  /* ---- retargeting -------------------------------------------------------
     The character keeps its own proportions. For each bone, take the DIRECTION
     the video's skeleton points and step the character's own bone length along
     it, walking out from the hip. Copying positions instead is what turns a
     short character into whoever was filmed. */
  function boneLengths(rest) {
    var L = {};
    CHAIN.forEach(function (pair) {
      var a = rest[pair[0]], b = rest[pair[1]];
      L[pair[0] + '>' + pair[1]] = Math.hypot(b[0] - a[0], b[1] - a[1]);
    });
    return L;
  }

  function pose(frame, rest, lens, box, travel) {
    if (!frame) return null;
    var w = box.w, h = box.h;
    var out = {};
    /* Where the hip sits. The video's hip is normalised, so this maps it into
       the character's box; `travel` scales how much of the subject's wandering
       about the frame the character copies. 0 pins it centred, 1 follows. */
    var restHip = rest.hip;
    out.hip = [
      restHip[0] + (frame.hip[0] * w - restHip[0]) * travel,
      restHip[1] + (frame.hip[1] * h - restHip[1]) * travel
    ];
    CHAIN.forEach(function (pair) {
      var pn = pair[0], cn = pair[1];
      var vp = frame[pn], vc = frame[cn];
      var dx = (vc[0] - vp[0]) * w, dy = (vc[1] - vp[1]) * h;
      var d = Math.hypot(dx, dy) || 1;
      var len = lens[pn + '>' + cn];
      var P = out[pn] || rest[pn];
      out[cn] = [P[0] + dx / d * len, P[1] + dy / d * len];
    });
    return out;
  }

  /* One pass, ahead of playback: every frame becomes nine ready coordinates.
     Playback then does no maths beyond interpolating between two of them. */
  function bake(track, rest, box, opts) {
    opts = opts || {};
    var lens = boneLengths(rest);
    var travel = opts.travel == null ? 1 : opts.travel;
    var frames = smooth(fillGaps(track.frames), opts.smooth);
    return {
      fps: track.fps,
      duration: track.duration,
      frames: frames.map(function (f) { return pose(f, rest, lens, box, travel); })
    };
  }

  /* Playback: pick the two nearest baked frames and blend. Sampling at 24 and
     showing at 60 would otherwise judder visibly. */
  function sample(baked, t) {
    var f = t * baked.fps;
    var i = Math.floor(f), k = f - i;
    var A = baked.frames[Math.max(0, Math.min(baked.frames.length - 1, i))];
    var B = baked.frames[Math.max(0, Math.min(baked.frames.length - 1, i + 1))];
    if (!A) return B || null;
    if (!B) return A;
    var out = {};
    for (var n in A) out[n] = [A[n][0] + (B[n][0] - A[n][0]) * k,
                               A[n][1] + (B[n][1] - A[n][1]) * k];
    return out;
  }

  G.NCMotion = {
    /* the pieces, each usable and testable on its own */
    extract: extract,
    nine: nine,
    bake: bake,
    sample: sample,
    smooth: smooth,
    fillGaps: fillGaps,
    boneLengths: boneLengths,
    pose: pose,
    CHAIN: CHAIN,
    loadModel: loadModel,
    setProvider: function (fn) { provider = fn; },
    useDefaultProvider: function (onProgress) {
      return loadModel(onProgress).then(function (landmarker) {
        provider = function (videoEl) {
          var res = landmarker.detectForVideo(videoEl, performance.now());
          var lm = res && res.landmarks && res.landmarks[0];
          return Promise.resolve(lm || null);
        };
        return true;
      });
    },
    hasProvider: function () { return !!provider; },
    limits: { fps: FPS, maxSeconds: MAX_SECONDS }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = G.NCMotion;
})();

/* ============================================================================
   THE PANEL
   ============================================================================
   Separate from the maths above so that half stays testable under node. This
   half needs a document and only runs on the editor, in the same idiom as
   animator.js and motionlabs.js — a launcher bottom-right, a full-screen panel,
   and it stands down if the rail is presenting the tools itself.
   ============================================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  if (!/editor\.html/i.test(location.pathname) && !document.getElementById('root')) return;
  if (document.getElementById('ncMtBtn')) return;

  var M = window.NCMotion;
  var NAMES = ['head', 'neck', 'hip', 'shoulderL', 'shoulderR', 'handL', 'handR', 'footL', 'footR'];
  var BONES = [
    ['neck', 'shoulderR', 0.22], ['shoulderR', 'handR', 0.20], ['hip', 'footR', 0.24],
    ['neck', 'hip', 0.46], ['head', 'neck', 0.46], ['hip', 'footL', 0.24],
    ['neck', 'shoulderL', 0.22], ['shoulderL', 'handL', 0.20]
  ];
  var W = 480, H = 480;

  var cut = null, J = null, baked = null, playing = false, raf = 0, t0 = 0;
  var vid = null, rec = null, chunks = [];

  var css = document.createElement('style');
  css.textContent = [
    '#ncMtBtn{position:fixed;right:18px;bottom:212px;z-index:995;display:flex;align-items:center;gap:8px;',
      'padding:11px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.14);cursor:pointer;',
      'background:rgba(12,14,24,.92);color:#EAF2FF;font:650 13px/1 Geist,Inter,system-ui,sans-serif;',
      'backdrop-filter:blur(12px)}',
    '#ncMtBtn:hover{border-color:rgba(0,240,255,.55)}',
    'body.ncplaying #ncMtBtn{display:none}',
    'html[data-theme="light"] #ncMtBtn{background:rgba(255,255,255,.95);color:#101828;border-color:rgba(16,24,44,.16)}',
    '#ncMt{position:fixed;inset:0;z-index:10001;display:none;place-items:center;padding:20px;',
      'background:rgba(4,6,12,.82);backdrop-filter:blur(10px);',
      'font:400 13.5px/1.55 Geist,Inter,system-ui,sans-serif}',
    '#ncMt.on{display:grid}',
    '#ncMtC{width:100%;max-width:940px;max-height:92vh;overflow:auto;background:#0C1220;color:#EAF2FF;',
      'border:1px solid rgba(255,255,255,.13);border-radius:20px;padding:22px}',
    'html[data-theme="light"] #ncMtC{background:#fff;color:#101828;border-color:rgba(16,24,44,.14)}',
    '#ncMtC h2{font-size:1.2rem;font-weight:750;margin:0 0 4px}',
    '#ncMtC .sub{opacity:.62;font-size:12.5px;margin-bottom:16px;line-height:1.6}',
    '#ncMtGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
    '@media (max-width:820px){#ncMtGrid{grid-template-columns:1fr}}',
    '#ncMtC .pane{border:1px solid rgba(127,127,127,.22);border-radius:14px;padding:14px}',
    '#ncMtC .pane h3{font-size:.92rem;font-weight:700;margin:0 0 8px;display:flex;align-items:center;gap:7px}',
    '#ncMtC .pane h3 i{width:19px;height:19px;border-radius:6px;display:grid;place-items:center;',
      'background:rgba(0,229,255,.16);color:#00E5FF;font-style:normal;font-size:11px;font-weight:800}',
    '#ncMtStage{width:100%;aspect-ratio:1;border-radius:12px;background:rgba(127,127,127,.12);',
      'touch-action:none;display:block}',
    '#ncMtC input[type=file]{font:inherit;font-size:12px;width:100%}',
    '#ncMtC .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}',
    '#ncMtC button.go{font:inherit;font-weight:700;padding:10px 16px;border-radius:11px;border:0;cursor:pointer;',
      'background:linear-gradient(110deg,#7C5CFF,#00E5FF);color:#05070E}',
    '#ncMtC button.go[disabled]{opacity:.45;cursor:default}',
    '#ncMtC button.q{font:inherit;padding:9px 14px;border-radius:11px;cursor:pointer;',
      'background:none;border:1px solid rgba(127,127,127,.34);color:inherit}',
    '#ncMtBar{height:7px;border-radius:99px;background:rgba(127,127,127,.22);overflow:hidden;margin-top:10px;display:none}',
    '#ncMtBar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7C5CFF,#00E5FF);transition:width .12s}',
    '#ncMtSay{margin-top:10px;font-size:12.5px;line-height:1.6;padding:9px 11px;border-radius:10px;display:none}',
    '#ncMtSay.ok{display:block;background:rgba(0,229,255,.1);border-left:3px solid #00E5FF}',
    '#ncMtSay.no{display:block;background:rgba(255,80,110,.1);border-left:3px solid #FF6B81}',
    '#ncMtC label.sl{display:block;font-size:12px;opacity:.7;margin:10px 0 3px}',
    '#ncMtC input[type=range]{width:100%}',
    '@media (max-width:700px){#ncMtBtn{bottom:auto;top:12px;right:12px;padding:9px 12px;font-size:12px}}'
  ].join('');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.id = 'ncMtBtn';
  btn.innerHTML = '<span style="font-size:15px">🕺</span> Copy a move';
  btn.title = 'Make a character copy the motion in a video';

  var ui = document.createElement('div');
  ui.id = 'ncMt';
  ui.innerHTML =
    '<div id="ncMtC">' +
      '<h2>Copy a move</h2>' +
      '<p class="sub">A picture of a character, and a clip of someone moving. The character copies ' +
        'the movement. It reads the video in your browser and nothing is uploaded — the pose model ' +
        'is downloaded once and runs on this device.</p>' +
      '<div id="ncMtGrid">' +
        '<div class="pane">' +
          '<h3><i>1</i> The character</h3>' +
          '<input type="file" id="ncMtImg" accept="image/*">' +
          '<canvas id="ncMtStage" width="' + W + '" height="' + H + '"></canvas>' +
          '<p class="sub" style="margin:8px 0 0">Drag the dots onto the head, hands and feet. ' +
            'Its own proportions are kept — only the angles come from the video.</p>' +
        '</div>' +
        '<div class="pane">' +
          '<h3><i>2</i> The movement</h3>' +
          '<input type="file" id="ncMtVid" accept="video/*">' +
          '<div class="row"><button class="go" id="ncMtRun" disabled>Read the movement</button>' +
            '<button class="q" id="ncMtPlay" disabled>Play</button></div>' +
          '<div id="ncMtBar"><i></i></div>' +
          '<label class="sl">How much it travels around the frame</label>' +
          '<input type="range" id="ncMtTravel" min="0" max="100" value="100">' +
          '<label class="sl">Smoothing</label>' +
          '<input type="range" id="ncMtSmooth" min="0" max="90" value="45">' +
          '<div id="ncMtSay"></div>' +
          '<div class="row" style="margin-top:14px">' +
            '<button class="go" id="ncMtSave" disabled>Add to the timeline</button>' +
            '<button class="q" id="ncMtClose">Close</button></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function boot() {
    if (document.getElementById('ncMtBtn')) return;
    if (!window.__ncRailTools) document.body.appendChild(btn);
    document.body.appendChild(ui);
    wire();
  }
  window.__ncOpenMotion = function () { ui.classList.add('on'); };
  btn.onclick = window.__ncOpenMotion;

  function $(id) { return document.getElementById(id); }
  function say(kind, html) {
    var s = $('ncMtSay'); s.className = kind; s.innerHTML = html;
  }

  /* Same cut-out rule as the drawing animator: the page is whatever colour
     dominates the border, and anything far enough from it is the character. */
  function lift(image) {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d', { willReadFrequently: true });
    var s = Math.min(W / image.width, H / image.height);
    var dw = image.width * s, dh = image.height * s;
    x.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);
    var im = x.getImageData(0, 0, W, H), d = im.data;
    var r = 0, g = 0, b = 0, n = 0;
    for (var py = 0; py < H; py += 2) for (var px = 0; px < W; px += 2) {
      if (px > 3 && py > 3 && px < W - 4 && py < H - 4) continue;
      var i = (py * W + px) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
    r /= n; g /= n; b /= n;
    for (var k = 0; k < d.length; k += 4) {
      var dist = Math.hypot(d[k] - r, d[k + 1] - g, d[k + 2] - b);
      d[k + 3] = dist < 46 ? 0 : Math.min(255, dist * 4);
    }
    x.putImageData(im, 0, 0);
    return c;
  }

  function restJoints() {
    return {
      head: [W * 0.50, H * 0.13], neck: [W * 0.50, H * 0.26], hip: [W * 0.50, H * 0.56],
      shoulderL: [W * 0.38, H * 0.29], shoulderR: [W * 0.62, H * 0.29],
      handL: [W * 0.24, H * 0.52], handR: [W * 0.76, H * 0.52],
      footL: [W * 0.40, H * 0.94], footR: [W * 0.60, H * 0.94]
    };
  }

  /* Draw the character in a pose. Bone lengths are preserved by the retarget,
     so mapping each rest bone onto its posed bone is a translate and a rotate
     — no scaling, which is what keeps the artwork from smearing. */
  function drawPose(ctx, P) {
    ctx.clearRect(0, 0, W, H);
    if (!cut) return;
    if (!P) { ctx.drawImage(cut, 0, 0); return; }
    BONES.forEach(function (bone) {
      var a = bone[0], b = bone[1], wide = bone[2];
      var A = J[a], B = J[b], A2 = P[a], B2 = P[b];
      if (!A || !B || !A2 || !B2) return;
      var len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      if (!len) return;
      var w = Math.max(18, len * wide);
      var restAng = Math.atan2(B[1] - A[1], B[0] - A[0]);
      var poseAng = Math.atan2(B2[1] - A2[1], B2[0] - A2[0]);
      ctx.save();
      ctx.translate(A2[0], A2[1]);
      ctx.rotate(poseAng - restAng);
      ctx.translate(-A[0], -A[1]);
      ctx.beginPath();
      ctx.save();
      ctx.translate(A[0], A[1]); ctx.rotate(restAng);
      if (ctx.roundRect) ctx.roundRect(-w * 0.5, -w * 0.55, len + w, w * 1.1, w * 0.5);
      else ctx.rect(-w * 0.5, -w * 0.55, len + w, w * 1.1);
      ctx.restore();
      ctx.clip();
      ctx.drawImage(cut, 0, 0);
      ctx.restore();
    });
  }

  function drawDots(ctx) {
    NAMES.forEach(function (n) {
      var p = J[n]; if (!p) return;
      ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7);
      ctx.fillStyle = 'rgba(0,229,255,.85)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#061018'; ctx.stroke();
    });
  }

  function repaint() {
    var cv = $('ncMtStage'); if (!cv) return;
    var ctx = cv.getContext('2d');
    drawPose(ctx, null);
    if (!playing) drawDots(ctx);
  }

  function rebake() {
    if (!window.__ncTrack || !J) return;
    baked = M.bake(window.__ncTrack, J, { w: W, h: H }, {
      travel: (+$('ncMtTravel').value) / 100,
      smooth: (+$('ncMtSmooth').value) / 100
    });
    $('ncMtPlay').disabled = false;
    $('ncMtSave').disabled = false;
  }

  function loop(ts) {
    if (!playing) return;
    if (!t0) t0 = ts;
    var t = (ts - t0) / 1000;
    if (t > baked.duration) { t0 = ts; t = 0; }
    var cv = $('ncMtStage');
    drawPose(cv.getContext('2d'), M.sample(baked, t));
    raf = requestAnimationFrame(loop);
  }

  function play(on) {
    playing = on; t0 = 0;
    $('ncMtPlay').textContent = on ? 'Stop' : 'Play';
    if (on) raf = requestAnimationFrame(loop);
    else { cancelAnimationFrame(raf); repaint(); }
  }

  function wire() {
    var cv = $('ncMtStage');
    J = restJoints();
    repaint();

    $('ncMtClose').onclick = function () { play(false); ui.classList.remove('on'); };
    ui.onclick = function (e) { if (e.target === ui) { play(false); ui.classList.remove('on'); } };

    $('ncMtImg').onchange = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var img = new Image();
      img.onload = function () { cut = lift(img); URL.revokeObjectURL(img.src); repaint(); };
      img.onerror = function () { say('no', '<b>That image would not open.</b>'); };
      img.src = URL.createObjectURL(f);
    };

    /* Dragging a joint. Which one is decided on the way down, so a slip does
       not hand the drag to a neighbouring dot halfway through. */
    var held = null;
    function at(e) {
      var r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    }
    cv.addEventListener('pointerdown', function (e) {
      if (playing) return;
      var p = at(e), best = null, bd = 26;
      NAMES.forEach(function (n) {
        var d = Math.hypot(J[n][0] - p[0], J[n][1] - p[1]);
        if (d < bd) { bd = d; best = n; }
      });
      if (!best) return;
      held = best; cv.setPointerCapture(e.pointerId); e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!held) return;
      J[held] = at(e); repaint();
    });
    cv.addEventListener('pointerup', function () {
      if (!held) return;
      held = null;
      if (window.__ncTrack) rebake();     // proportions changed, redo the pose
    });

    $('ncMtVid').onchange = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      if (vid) URL.revokeObjectURL(vid.src);
      vid = document.createElement('video');
      vid.muted = true; vid.playsInline = true; vid.preload = 'auto';
      vid.onloadedmetadata = function () {
        $('ncMtRun').disabled = false;
        say('ok', '<b>Ready.</b> ' + vid.duration.toFixed(1) + 's' +
          (vid.duration > M.limits.maxSeconds
            ? ' — only the first ' + M.limits.maxSeconds + 's will be read.' : '') +
          ' Press <b>Read the movement</b>.');
      };
      vid.onerror = function () { say('no', '<b>That video would not open in this browser.</b> MP4 or WebM works best.'); };
      vid.src = URL.createObjectURL(f);
    };

    $('ncMtRun').onclick = function () {
      if (!vid) return;
      if (!cut) { say('no', '<b>Add a character picture first.</b> Step 1.'); return; }
      var bar = $('ncMtBar'), fill = bar.firstChild;
      bar.style.display = 'block'; fill.style.width = '0%';
      $('ncMtRun').disabled = true;
      say('ok', 'Loading the pose model…');

      var ready = M.hasProvider() ? Promise.resolve(true)
        : M.useDefaultProvider(function (m) { say('ok', m); });

      ready.then(function () {
        say('ok', 'Reading the movement… the page stays usable while it works.');
        return M.extract(vid, {
          onProgress: function (p) { fill.style.width = Math.round(p * 100) + '%'; }
        });
      }).then(function (track) {
        window.__ncTrack = track;
        rebake();
        bar.style.display = 'none';
        $('ncMtRun').disabled = false;
        var got = track.frames.filter(Boolean).length;
        say('ok', '<b>Got it.</b> ' + got + ' of ' + track.frames.length +
          ' frames had a body in them. Press <b>Play</b>.');
        play(true);
      }).catch(function (err) {
        bar.style.display = 'none';
        $('ncMtRun').disabled = false;
        say('no', '<b>Could not read that.</b> ' + (err && err.message ? err.message : ''));
      });
    };

    $('ncMtPlay').onclick = function () { play(!playing); };
    $('ncMtTravel').oninput = rebake;
    $('ncMtSmooth').oninput = rebake;

    /* Record the canvas exactly as it plays. The clip is the animation, so
       recording it is honest — there is no second render path to disagree
       with what was on screen. */
    $('ncMtSave').onclick = function () {
      if (!baked) return;
      if (!cv.captureStream || typeof MediaRecorder === 'undefined') {
        say('no', '<b>This browser cannot record a canvas.</b> Chrome, Edge and Firefox can.');
        return;
      }
      var type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0];
      if (!type) { say('no', '<b>No WebM encoder in this browser.</b>'); return; }
      chunks = [];
      rec = new MediaRecorder(cv.captureStream(30), { mimeType: type, videoBitsPerSecond: 4000000 });
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var blob = new Blob(chunks, { type: type });
        var url = URL.createObjectURL(blob);
        var st = window.__ncStore && window.__ncStore.getState();
        if (st && st.addAssets) {
          var file = new File([blob], 'copied-move.webm', { type: type });
          try { st.addAssets([file]); } catch (e) { }
          say('ok', '<b>Added to the media library.</b> Drag it onto the timeline.');
        } else {
          var a = document.createElement('a');
          a.href = url; a.download = 'copied-move.webm'; a.click();
          say('ok', '<b>Saved to your downloads.</b> The editor was not reachable to add it directly.');
        }
        $('ncMtSave').disabled = false;
        $('ncMtSave').textContent = 'Add to the timeline';
      };
      $('ncMtSave').disabled = true;
      $('ncMtSave').textContent = 'Recording…';
      play(true);
      rec.start();
      setTimeout(function () { try { rec.stop(); } catch (e) {} play(false); },
        Math.min(baked.duration, M.limits.maxSeconds) * 1000 + 250);
    };
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
