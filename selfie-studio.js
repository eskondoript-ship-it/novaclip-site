/* ============================================================================
   SELFIE STUDIO — record yourself, lit by your own device, then edit it
   ============================================================================
   Point the camera at yourself, let the screen light your face, record, and
   land on the timeline with the clip selected and ready to cut. Nothing is
   uploaded; the camera stream never leaves this page.

   THE LIGHTING, WHICH IS THE PART PEOPLE ASK FOR AND BROWSERS CANNOT DO

   A page cannot set your screen's brightness. There is no API for it, on
   purpose — a website that could turn your screen to full white at midnight
   would be a website that could do that without asking. So this does the three
   things that ARE possible, and says so rather than pretending:

     A ring light. The page fills with a bright warm panel around the preview,
     which is genuinely how phone selfie apps light a face indoors — the screen
     IS the light source. Brightness and warmth are yours to set, and going
     fullscreen makes the lit area as big as the device has.

     A wake lock. Phones dim the screen after a few seconds and that is the
     light going down mid-take. The lock holds it wherever the user has it.

     The torch, where the hardware exposes it. On most Android phones the rear
     camera's LED can be turned on from a page; on iPhones it cannot. It is
     offered when it is there and hidden when it is not, rather than being a
     button that silently does nothing.

   The light also RISES rather than snapping on: over the three-two-one it
   ramps from where it was up to full. Eyes adjust on the way in, so nobody
   spends the first second of their own video squinting.

   RECORDING THROUGH A CANVAS, NOT STRAIGHT OFF THE CAMERA

   The camera gives whatever shape the hardware likes — usually 16:9 landscape,
   even when the phone is upright. The project is usually 9:16. Recording the
   camera directly and cropping later means throwing away pixels chosen by
   accident. So each frame is drawn into a canvas of the PROJECT's exact size,
   filling it, and the canvas is what gets recorded. What you see framed in the
   preview is what ends up on the timeline.

   That also fixes the mirror question. A front camera shows you flipped,
   because that is what a mirror does and it is what looks right while you are
   talking. Recording it flipped means any writing behind you comes out
   backwards. The preview is mirrored, the recording is not, unless asked.
   ============================================================================ */
(function () {
  'use strict';

  if (typeof document === 'undefined') return;
  var G = window;
  if (G.__ncSelfieReady) return;
  G.__ncSelfieReady = true;

  /* ---- tunables ---------------------------------------------------------- */
  var MAX_SECONDS = 180;
  var FPS = 30;
  var MAX_EDGE = 1920;      // caps the canvas on a project set to something huge

  var ui = null, stream = null, videoEl = null, canvas = null, ctx = null;
  var rec = null, chunks = [], painting = false, raf = null;
  var startedAt = 0, countdownTimer = null, wakeLock = null;
  var torchOn = false, mirrorRec = false;

  function $(id) { return document.getElementById(id); }

  /* ---- a clock that survives a tab switch --------------------------------
     Same reason as in motion-transfer.js: requestAnimationFrame does not fire
     in a hidden tab, and MediaRecorder captures a canvas AS IT IS PAINTED — so
     switching tabs mid-take used to freeze the picture while the audio carried
     on, and you got a video of one still frame with a voice over it. Timers
     inside a Worker are not throttled the way a hidden page's are.

     Deliberately a second copy rather than shared with motion-transfer.js.
     These files get pasted onto the server one at a time, and a shared helper
     is a file that has to arrive first or nothing works. */
  var ticker = null;
  function makeTicker() {
    if (ticker !== null) return ticker;
    ticker = false;
    try {
      var src = 'onmessage=function(e){var d=e.data;' +
                'setTimeout(function(){postMessage(d.id)},d.ms|0)}';
      var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      var waiting = {}, next = 1;
      w.onmessage = function (e) {
        var fn = waiting[e.data]; delete waiting[e.data];
        if (fn) fn();
      };
      ticker = function (fn, ms) {
        var id = next++;
        waiting[id] = fn;
        w.postMessage({ id: id, ms: ms || 0 });
        return id;
      };
    } catch (e) { ticker = false; }
    return ticker;
  }
  function tick(fn, ms) {
    var t = makeTicker();
    if (!document.hidden && !ms && typeof requestAnimationFrame === 'function')
      return requestAnimationFrame(fn);
    if (t) return t(fn, ms || 0);
    return setTimeout(fn, ms || 0);
  }

  function say(kind, html) {
    var n = $('ncSsSay'); if (!n) return;
    n.className = 'ncss-say ' + kind; n.innerHTML = html;
  }

  /* ---- the light --------------------------------------------------------- */

  /* Warmth as an actual colour temperature rather than a vibe: 0 is tungsten,
     roughly 2700K, and 1 is overcast daylight at about 6500K. Skin lit by the
     cold end alone looks ill, which is why it does not start there. */
  function lightColour(warmth) {
    var warm = [255, 175, 105], cool = [225, 238, 255];
    var c = [0, 1, 2].map(function (i) {
      return Math.round(warm[i] + (cool[i] - warm[i]) * warmth);
    });
    return 'rgb(' + c.join(',') + ')';
  }

  function paintLight() {
    var glow = $('ncSsGlow'); if (!glow) return;
    var b = (+$('ncSsBright').value) / 100;
    var w = (+$('ncSsWarm').value) / 100;
    glow.style.background = lightColour(w);
    glow.style.opacity = b;
  }

  /* The ramp the file header promises. Runs off the wall clock rather than a
     fixed number of steps so it takes the same time on a slow phone. */
  function raiseLight(ms, to) {
    var glow = $('ncSsGlow');
    var from = parseFloat(glow.style.opacity || '0');
    var t0 = performance.now();
    (function step() {
      var k = Math.min(1, (performance.now() - t0) / ms);
      /* Eased, because a linear ramp in opacity does not look linear —
         brightness perception is closer to a curve than a line. */
      glow.style.opacity = from + (to - from) * (k * k);
      if (k < 1) requestAnimationFrame(step);
      else { $('ncSsBright').value = Math.round(to * 100); }
    })();
  }

  /* ---- the hardware bits that may or may not exist ----------------------- */

  function videoTrack() {
    return stream && stream.getVideoTracks && stream.getVideoTracks()[0];
  }

  function torchSupported() {
    var t = videoTrack();
    if (!t || !t.getCapabilities) return false;
    try { return !!t.getCapabilities().torch; } catch (e) { return false; }
  }

  function setTorch(on) {
    var t = videoTrack();
    if (!t || !torchSupported()) return Promise.resolve(false);
    return t.applyConstraints({ advanced: [{ torch: !!on }] })
      .then(function () { torchOn = !!on; return true; })
      .catch(function () { return false; });
  }

  /* Phones dim, then sleep. Either one is the light going out half way through
     a take. Not everywhere — Safari added it late and it needs https — so a
     failure is quiet rather than an error. */
  function holdScreenAwake() {
    if (!navigator.wakeLock || wakeLock) return;
    navigator.wakeLock.request('screen').then(function (l) {
      wakeLock = l;
      l.addEventListener('release', function () { wakeLock = null; });
    }).catch(function () {});
  }
  function releaseScreen() {
    if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  }
  /* A wake lock is dropped by the browser whenever the tab is hidden and is
     not given back automatically. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && ui && ui.classList.contains('on') && stream) holdScreenAwake();
  });

  /* ---- the canvas the recording actually comes from ---------------------- */

  function projectSize() {
    var s = window.__ncStore && window.__ncStore.getState();
    var w = (s && s.settings && s.settings.width) || 1080;
    var h = (s && s.settings && s.settings.height) || 1920;
    var k = Math.min(1, MAX_EDGE / Math.max(w, h));
    return { w: Math.round(w * k), h: Math.round(h * k) };
  }

  /* Fill the frame and crop the overflow, rather than letterboxing. A selfie
     with black bars down both sides is not what anybody wanted. */
  function drawFrame() {
    if (!ctx || !videoEl || !videoEl.videoWidth) return;
    var cw = canvas.width, ch = canvas.height;
    var vw = videoEl.videoWidth, vh = videoEl.videoHeight;
    var scale = Math.max(cw / vw, ch / vh);
    var dw = vw * scale, dh = vh * scale;

    ctx.save();
    if (mirrorRec) { ctx.translate(cw, 0); ctx.scale(-1, 1); }
    ctx.drawImage(videoEl, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.restore();
  }

  function paintLoop() {
    if (!painting) return;
    drawFrame();
    raf = tick(paintLoop, document.hidden ? Math.round(1000 / FPS) : 0);
  }

  /* ---- camera ------------------------------------------------------------ */

  var facing = 'user';

  function openCamera() {
    stop();
    var size = projectSize();
    /* Asked for portrait when the project is portrait. Most cameras ignore it
       and hand back landscape anyway, which is exactly why everything is
       redrawn through the canvas. */
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facing,
        width: { ideal: size.w }, height: { ideal: size.h }
      },
      audio: { echoCancellation: true, noiseSuppression: true }
    }).then(function (s) {
      stream = s;
      videoEl.srcObject = s;
      videoEl.play().catch(function () {});
      canvas.width = size.w; canvas.height = size.h;
      painting = true; paintLoop();
      holdScreenAwake();

      $('ncSsTorch').style.display = torchSupported() ? '' : 'none';
      $('ncSsGo').disabled = false;
      say('ok', '<b>Camera on.</b> ' + size.w + '&times;' + size.h +
        ', matching the project. Set the light, then press <b>Record</b>.' +
        (torchSupported() ? '' : ' <span style="opacity:.75">(No torch on this camera — ' +
          'the screen light below is what lights you.)</span>'));
    }).catch(function (e) {
      var why = e && e.name === 'NotAllowedError'
        ? 'The camera permission was refused. Click the camera icon in the address bar to allow it.'
        : e && e.name === 'NotFoundError'
        ? 'No camera was found on this device.'
        : (e && e.message) || 'The camera would not open.';
      say('no', '<b>No camera.</b> ' + why);
      $('ncSsGo').disabled = true;
    });
  }

  function stop() {
    painting = false;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    releaseScreen();
    torchOn = false;
  }

  /* ---- recording --------------------------------------------------------- */

  function countdownThenRecord() {
    var n = 3;
    var pill = $('ncSsCount');
    pill.style.display = 'grid';
    pill.textContent = n;
    /* The light comes up across the whole countdown, reaching full exactly as
       recording starts. */
    raiseLight(n * 1000, 1);

    countdownTimer = setInterval(function () {
      n--;
      if (n > 0) { pill.textContent = n; return; }
      clearInterval(countdownTimer); countdownTimer = null;
      pill.style.display = 'none';
      startRecording();
    }, 1000);
  }

  function startRecording() {
    if (!stream || !canvas.captureStream) {
      say('no', '<b>This browser cannot record a canvas.</b> Chrome, Edge and Firefox can.');
      return;
    }
    var type = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0];
    if (!type) { say('no', '<b>No WebM encoder in this browser.</b>'); return; }

    /* Picture from the canvas, sound from the microphone. The camera's own
       video track is not in here at all — the canvas is the framed version. */
    var out = new MediaStream();
    canvas.captureStream(FPS).getVideoTracks().forEach(function (t) { out.addTrack(t); });
    stream.getAudioTracks().forEach(function (t) { out.addTrack(t); });

    chunks = [];
    rec = new MediaRecorder(out, { mimeType: type, videoBitsPerSecond: 6000000 });
    rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
    rec.onstop = finish;
    rec.start(250);                     // a chunk every 250ms, so a crash loses
                                        // a quarter second rather than the take
    startedAt = Date.now();
    $('ncSsGo').textContent = 'Stop';
    $('ncSsGo').classList.add('rec');
    tickClock();
    say('info', '<b>Recording.</b> Press <b>Stop</b> when you are done. ' +
      'You can switch tabs — it keeps going.');
  }

  function tickClock() {
    if (!rec || rec.state !== 'recording') return;
    var s = (Date.now() - startedAt) / 1000;
    $('ncSsGo').textContent = 'Stop  ' + s.toFixed(0) + 's';
    if (s >= MAX_SECONDS) { stopRecording(); return; }
    tick(tickClock, 250);
  }

  function stopRecording() {
    if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch (e) {} }
  }

  function finish() {
    var took = (Date.now() - startedAt) / 1000;
    rec = null;
    $('ncSsGo').textContent = 'Record';
    $('ncSsGo').classList.remove('rec');

    var blob = new Blob(chunks, { type: chunks[0] ? chunks[0].type : 'video/webm' });
    if (!blob.size) { say('no', '<b>Nothing was recorded.</b> Try once more.'); return; }
    var url = URL.createObjectURL(blob);

    var s = window.__ncStore && window.__ncStore.getState();
    if (!s || !s.addAssets) {
      var a = document.createElement('a');
      a.href = url; a.download = 'selfie.webm'; a.click();
      say('ok', '<b>Saved to your downloads.</b> The editor was not reachable to add it.');
      return;
    }

    var id = 'asset-selfie-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    /* An asset RECORD, never the Blob or a File — handing this action a raw
       file is what blanked the whole editor once. */
    s.addAssets([{
      id: id,
      name: 'Me ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      kind: 'video', url: url, duration: took,
      width: canvas.width, height: canvas.height,
      thumbnail: '', createdAt: Date.now()
    }]);

    /* Straight onto the timeline and selected, which is the "edit it right
       after" half of the request: close the panel and the clip is already
       there, already the one the properties rail is pointed at. */
    var placed = false;
    try {
      var st = window.__ncStore.getState();
      var track = (st.tracks || []).filter(function (t) { return t.kind === 'video'; })[0]
               || (st.tracks || [])[0];
      if (track && st.addClipFromAsset) {
        st.addClipFromAsset(id, track.id, st.playhead || 0);
        placed = true;
        var g = window.__ncStore.getState();
        var mine = (g.clips || []).filter(function (c) { return c.assetId === id; }).pop();
        if (mine && g.selectClip) g.selectClip(mine.id);
      }
    } catch (e) {}

    say('ok', '<b>' + took.toFixed(1) + ' seconds recorded.</b> ' +
      (placed ? 'It is on the timeline at the playhead and selected — close this and cut it.'
              : 'It is in the media library; drag it onto the timeline.'));
    if (placed) setTimeout(close, 900);
  }

  /* ---- the panel --------------------------------------------------------- */

  var CSS = [
    '#ncss{position:fixed;inset:0;z-index:100000;display:none;align-items:center;',
    'justify-content:center;padding:14px;background:#04080d}',
    '#ncss.on{display:flex}',
    /* The light itself: behind everything, filling the viewport. */
    '#ncSsGlow{position:absolute;inset:0;opacity:0;transition:background .25s;pointer-events:none}',
    '#ncss .ncss-x{position:absolute;top:10px;right:10px;width:40px;height:40px;padding:0;',
    'display:grid;place-items:center;font-size:24px;line-height:1;border-radius:11px;cursor:pointer;',
    'background:rgba(255,255,255,.06);border:1px solid #17324a;color:#dbeafe}',
    '#ncss .ncss-x:hover{background:rgba(255,255,255,.13);color:#fff}',
    '#ncss h2{padding-right:46px}',
    '#ncss .box{position:relative;z-index:1;width:100%;max-width:520px;max-height:96vh;overflow:auto;',
    'background:rgba(8,18,28,.92);border:1px solid #17324a;border-radius:16px;padding:16px;',
    'color:#dbeafe;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
    '#ncss h2{margin:0 0 4px;font-size:20px;color:#fff}',
    '#ncss .lede{margin:0 0 12px;color:#93b4cc;font-size:13px}',
    '#ncss .stage{position:relative;border-radius:12px;overflow:hidden;background:#000;',
    'aspect-ratio:9/16;max-height:46vh;margin:0 auto 12px;width:max-content;max-width:100%}',
    '#ncss .stage video{height:100%;width:100%;object-fit:cover;display:block;transform:scaleX(-1)}',
    '#ncss .stage video.nomirror{transform:none}',
    '#ncSsCount{position:absolute;inset:0;display:none;place-items:center;font-size:88px;',
    'font-weight:800;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.8);background:rgba(0,0,0,.15)}',
    '#ncss button{font:inherit;border-radius:9px;padding:9px 13px;cursor:pointer;',
    'border:1px solid #1d3f5c;background:#122a3e;color:#dbeafe}',
    '#ncss button:disabled{opacity:.45;cursor:default}',
    '#ncss button.go{background:linear-gradient(90deg,#5b8cff,#a06bff);border:0;color:#fff;font-weight:600}',
    '#ncss button.go.rec{background:linear-gradient(90deg,#ff4d6d,#ff8a3d)}',
    '#ncss button.on{outline:2px solid #00E5FF}',
    '#ncss .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:9px}',
    '#ncss label{display:block;margin:9px 0 3px;color:#9fc0d8;font-size:12px}',
    '#ncss input[type=range]{width:100%}',
    '#ncss .ncss-say{margin-top:11px;padding:9px 11px;border-radius:9px;font-size:12.5px}',
    '#ncss .ncss-say.ok{background:#0d2f24;border:1px solid #1c6b4f;color:#b6f2d8}',
    '#ncss .ncss-say.no{background:#3a1420;border:1px solid #7d2540;color:#ffc7d4}',
    '#ncss .ncss-say.info{background:#0e2438;border:1px solid #1d4a6e;color:#bcdcf5}',
    /* Light mode — nova.js puts data-theme on <html>. The stage stays black
       whatever the theme: it is a hole with a camera behind it, and a white
       surround around the picture would fight the ring light rather than
       help it. */
    'html[data-theme="light"] #ncss{background:#eef3f9}',
    'html[data-theme="light"] #ncss .box{background:rgba(255,255,255,.93);border-color:#dbe4ee;color:#16233a}',
    'html[data-theme="light"] #ncss h2{color:#0b1220}',
    'html[data-theme="light"] #ncss .lede,html[data-theme="light"] #ncss label{color:#54697f}',
    'html[data-theme="light"] #ncss button{background:#eef3f9;border-color:#cfdbe8;color:#17263b}',
    'html[data-theme="light"] #ncss button.go{color:#fff}',
    'html[data-theme="light"] #ncss .ncss-say.ok{background:#e6f7ef;border-color:#7fcaa8;color:#0d5138}',
    'html[data-theme="light"] #ncss .ncss-say.no{background:#fdeaf0;border-color:#e39ab0;color:#7d1533}',
    'html[data-theme="light"] #ncss .ncss-say.info{background:#e8f1fb;border-color:#9dc2e4;color:#12385d}'
  ].join('');

  function build() {
    var st = document.createElement('style'); st.textContent = CSS;
    document.head.appendChild(st);

    ui = document.createElement('div');
    ui.id = 'ncss';
    ui.innerHTML =
      '<div id="ncSsGlow"></div>' +
      '<div class="box">' +
        /* A way out that looks like a way out. This panel fills the screen and
           blacks out the editor behind it, and the only exit used to be a
           button called Close sitting fifth in a row of camera controls —
           Record, Flip camera, Mirror, Fullscreen, Close — which reads as one
           more camera setting rather than as the door. It was reported as
           having no back button, and that is a fair reading of it.
           The X goes where every dialog on the web keeps it. Close stays too;
           this adds an exit rather than moving one. */
        '<button id="ncSsX" class="ncss-x" type="button" aria-label="Close and go back to the editor" title="Back to the editor">&times;</button>' +
        '<h2>Record yourself</h2>' +
        '<p class="lede">The screen is the light. It comes up over the countdown so you are not ' +
        'squinting on the first frame.</p>' +
        '<div class="stage"><video id="ncSsVid" playsinline muted></video>' +
        '<div id="ncSsCount"></div></div>' +
        '<div class="row">' +
          '<button class="go" id="ncSsGo" disabled>Record</button>' +
          '<button id="ncSsFlip">Flip camera</button>' +
          '<button id="ncSsMirror">Mirror: off</button>' +
          '<button id="ncSsTorch" style="display:none">Torch</button>' +
          '<button id="ncSsFull">Fullscreen</button>' +
          '<button id="ncSsClose">Close</button>' +
        '</div>' +
        '<label>Light <span id="ncSsBrightN">55</span>%</label>' +
        '<input type="range" id="ncSsBright" min="0" max="100" value="55">' +
        '<label>Warmth — warm to daylight</label>' +
        '<input type="range" id="ncSsWarm" min="0" max="100" value="35">' +
        '<div class="ncss-say info" id="ncSsSay">Starting the camera…</div>' +
      '</div>';
    document.body.appendChild(ui);

    videoEl = $('ncSsVid');
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    $('ncSsBright').oninput = function () {
      $('ncSsBrightN').textContent = this.value; paintLight();
    };
    $('ncSsWarm').oninput = paintLight;
    $('ncSsGo').onclick = function () {
      if (rec) stopRecording(); else countdownThenRecord();
    };
    $('ncSsFlip').onclick = function () {
      facing = facing === 'user' ? 'environment' : 'user';
      videoEl.classList.toggle('nomirror', facing !== 'user');
      openCamera();
    };
    $('ncSsMirror').onclick = function () {
      mirrorRec = !mirrorRec;
      this.textContent = 'Mirror: ' + (mirrorRec ? 'on' : 'off');
      this.classList.toggle('on', mirrorRec);
    };
    $('ncSsTorch').onclick = function () {
      var b = this;
      setTorch(!torchOn).then(function (ok) {
        b.classList.toggle('on', torchOn);
        if (!ok) say('info', 'This camera would not turn its torch on.');
      });
    };
    $('ncSsFull').onclick = function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (ui.requestFullscreen) ui.requestFullscreen().catch(function () {});
    };
    $('ncSsClose').onclick = close;
    $('ncSsX').onclick = close;
    /* Escape closes it, which is what every other overlay on this site does
       and the first thing anybody tries when a panel has taken the screen.
       Capture, so it still works while a slider has focus. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ui && ui.classList.contains('on')) { e.stopPropagation(); close(); }
    }, true);
    paintLight();
  }

  function close() {
    if (rec) stopRecording();
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    $('ncSsCount').style.display = 'none';
    stop();
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    ui.classList.remove('on');
  }

  G.__ncOpenSelfie = function () {
    if (!ui) build();
    ui.classList.add('on');
    paintLight();
    openCamera();
  };

  if (!window.__ncRailTools) {
    var btn = document.createElement('button');
    btn.textContent = '🎬 Record yourself';
    btn.style.cssText = 'position:fixed;left:14px;bottom:170px;z-index:99998;padding:9px 13px;' +
      'border-radius:10px;border:1px solid #1d3f5c;background:#122a3e;color:#dbeafe;cursor:pointer';
    btn.onclick = function () { G.__ncOpenSelfie(); };
    if (document.readyState === 'loading')
      addEventListener('DOMContentLoaded', function () { document.body.appendChild(btn); });
    else document.body.appendChild(btn);
  }
})();
