/* ============================================================================
   BIOSENTINEL — the uploaded design's frontend, driving NovaClip's real code
   ============================================================================
   The upload is a React prototype. Its screens are excellent and its numbers
   are invented: 74 BPM of subdermal pulse, 1200 DPI, a Zurich Security
   Gateway, a TPM reporting 100% operational. It has no backend at all, and for
   a prototype that is the right call.

   This is the same frontend with real machinery underneath it:

     tab           what it actually does
     ------------  --------------------------------------------------------
     Fingerprint   navigator.credentials.get() against the platform
                   authenticator — on a laptop that IS the fingerprint reader
     3D Face ID    live camera in the viewport; matching by the 128-number
                   face-api descriptor NovaClip already had
     Voiceprint    live microphone level from Web Audio; matching by the
                   24-number voiceprint NovaClip already had
     Click rhythm  rhythm.js — dwell and gap timings, approximate matching
     FIDO2 Passkey navigator.credentials.create(), the credential list, and
                   whether the device supports the PRF extension
     Secure Vault  locker.js — AES-GCM 256, key from the passkey by HKDF
     Audit Trail   the real attempt log, capped at fifty, never sent anywhere

   WHERE IT DEPARTS FROM THE UPLOAD, AND WHY

   The iris tab. There is no iris camera behind a browser API, so that slot
   holds the click rhythm — a real measurement standing where a picture of a
   measurement would have been.

   The invented telemetry. Every tile here either shows a measured value or
   says the thing is not measured. Printing a fake heart rate next to a real
   AES-GCM key length teaches somebody that both are the same kind of claim.

   The settings toggles. The upload has switches for anti-spoofing and
   auto-lock. Here those behaviours are unconditional, so they are shown as
   state rather than as switches: a toggle that cannot actually turn a safety
   measure off is worse than no toggle.

   The confetti. Left out on purpose — a verification that fails is a security
   event, and a party for the one that succeeds trains the reader to skim.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var app = $('bsPortal');
  if (!app) return;

  /* ---- icons, drawn once ------------------------------------------------ */
  var S = function (d) {
    return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' " +
           "stroke-linecap='round' stroke-linejoin='round'>" + d + '</svg>';
  };
  var I = {
    finger: S("<path d='M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4'/><path d='M5 19.5C5.5 18 6 15 6 12a6 6 0 018-5.66'/><path d='M17.29 21.02c.12-.6.43-2.3.5-3.02M12 10a2 2 0 00-2 2c0 1.02-.1 2.51-.26 4'/><path d='M8.65 22c.21-.66.45-1.32.57-2M14 13.12c0 2.38 0 6.38-1 8.88'/><path d='M22 12a10 10 0 00-.59-3.4'/><path d='M2 16h.01M21.8 16c.2-2 .131-5.354 0-6'/>"),
    cam:    S("<path d='M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z'/><circle cx='12' cy='13' r='3'/>"),
    mic:    S("<path d='M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z'/><path d='M19 10v2a7 7 0 01-14 0v-2M12 19v3'/>"),
    pulse:  S("<path d='M22 12h-4l-3 9L9 3l-3 9H2'/>"),
    key:    S("<circle cx='7.5' cy='15.5' r='5.5'/><path d='M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3'/>"),
    lock:   S("<rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0110 0v4'/>"),
    unlock: S("<rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 019.9-1'/>"),
    hist:   S("<path d='M3 3v5h5'/><path d='M3.05 13A9 9 0 106 5.3L3 8'/><path d='M12 7v5l4 2'/>"),
    shield: S("<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z'/><path d='M9 12l2 2 4-4'/>"),
    cpu:    S("<rect x='4' y='4' width='16' height='16' rx='2'/><rect x='9' y='9' width='6' height='6'/><path d='M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2'/>"),
    layers: S("<path d='M12 2L2 7l10 5 10-5-10-5z'/><path d='M2 17l10 5 10-5M2 12l10 5 10-5'/>"),
    spark:  S("<path d='M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z'/>"),
    reset:  S("<path d='M3 2v6h6'/><path d='M3.5 13a9 9 0 102.6-6.4L3 9'/>"),
    ok:     S("<circle cx='12' cy='12' r='10'/><path d='M9 12l2 2 4-4'/>"),
    no:     S("<circle cx='12' cy='12' r='10'/><path d='M15 9l-6 6M9 9l6 6'/>"),
    warn:   S("<path d='M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z'/><path d='M12 9v4M12 17h.01'/>"),
    trash:  S("<path d='M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6'/>"),
    plus:   S("<path d='M12 5v14M5 12h14'/>"),
    search: S("<circle cx='11' cy='11' r='8'/><path d='M21 21l-4.3-4.3'/>"),
    dl:     S("<path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'/>"),
    eye:    S("<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z'/><circle cx='12' cy='12' r='3'/>"),
    eyeoff: S("<path d='M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19'/><path d='M1 1l22 22M14.12 14.12a3 3 0 11-4.24-4.24'/>"),
    copy:   S("<rect x='9' y='9' width='13' height='13' rx='2'/><path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'/>"),
    file:   S("<path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/><path d='M14 2v6h6'/><circle cx='10' cy='15' r='2'/><path d='M11.5 16.5L14 19'/>")
  };

  /* ---- tabs -------------------------------------------------------------- */
  var TABS = [
    { id: 'fingerprint', label: 'Fingerprint', icon: I.finger, sub: 'Platform Authenticator' },
    { id: 'face',        label: 'Face ID',     icon: I.cam,    sub: '128-Point Descriptor' },
    { id: 'voice',       label: 'Voiceprint',  icon: I.mic,    sub: 'Acoustic Spectrum' },
    { id: 'rhythm',      label: 'Click Rhythm', icon: I.pulse, sub: 'Dwell & Gap Timing' },
    { id: 'passkey',     label: 'FIDO2 Passkey', icon: I.key,  sub: 'Hardware Token' },
    { id: 'vault',       label: 'Secure Vault', icon: I.lock,  sub: 'Encrypted', highlight: true },
    { id: 'audit',       label: 'Audit Trail', icon: I.hist,   sub: '0 Events' }
  ];

  var PK = window.NC_PASSKEY, LK = window.NC_LOCKER, RH = window.NC_RHYTHM;

  var state = {
    tab: 'fingerprint',
    platform: null,        // { ok, why }
    toastTimer: 0,
    media: null            // live camera / mic teardown
  };

  function esc(t) {
    return String(t == null ? '' : t).replace(/[<>&"]/g, function (m) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[m];
    });
  }

  /* ---- toast ------------------------------------------------------------- */
  function toast(msg, kind) {
    var slot = $('bsToastSlot');
    if (!slot) return;
    kind = kind || 'info';
    var ic = kind === 'success' ? I.ok : kind === 'error' ? I.warn : I.shield;
    slot.innerHTML =
      "<div class='bs-toast " + kind + "'><div class='l'>" + ic +
      "<span class='msg'>" + esc(msg) + '</span></div>' +
      "<button class='x' type='button' aria-label='Dismiss'>&#10005;</button></div>";
    slot.querySelector('.x').onclick = function () { slot.innerHTML = ''; };
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { slot.innerHTML = ''; }, 6000);
  }

  /* ---- what is enrolled, across every backend ---------------------------
     One list, built fresh each render from whatever each module actually
     holds. Nothing here is a mock row: if it is on screen, it is on disk. */
  function bioProfiles() {
    try {
      var raw = JSON.parse(localStorage.getItem('nc_bio_profiles') || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function allProfiles() {
    var out = [];
    (PK ? PK.keys() : []).forEach(function (k) {
      out.push({ id: k.id, kind: 'passkey', name: k.name || 'Passkey',
                 hash: shortId(k.id), at: k.at,
                 note: k.prf ? 'PRF · can open the vault' : 'no PRF on this device' });
    });
    bioProfiles().forEach(function (p) {
      if (p.face) out.push({ id: p.id + ':face', kind: 'face', name: p.name,
                             hash: '128 floats', at: p.created, note: 'face-api descriptor' });
      if (p.voice) out.push({ id: p.id + ':voice', kind: 'voice', name: p.name,
                              hash: '24 numbers', at: p.created, note: 'voiceprint' });
    });
    if (RH && RH.exists()) {
      var i = RH.info();
      out.push({ id: 'rhythm', kind: 'rhythm', name: 'Click pattern',
                 hash: i.clicks + ' clicks · ' + i.features + ' numbers', at: i.at,
                 note: 'dwell and gap timings' });
    }
    return out;
  }

  function shortId(s) {
    s = String(s || '');
    return s.length > 14 ? s.slice(0, 6) + '…' + s.slice(-6) : s;
  }
  function ago(ms) {
    if (!ms) return 'never';
    var d = Date.now() - ms;
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }
  function iconFor(kind) {
    return { passkey: I.key, face: I.cam, voice: I.mic, rhythm: I.pulse,
             fingerprint: I.finger, locker: I.lock }[kind] || I.shield;
  }

  /* ---- the shell every scanner tab shares -------------------------------
     Seven columns of visualiser and five of telemetry, which is the upload's
     own proportion. Everything variable is passed in. */
  function scanner(o) {
    return (
      "<div class='bs-scan-grid'>" +
        "<div class='bs-panel bs-scan-main'>" +
          "<div class='bs-grid-bg'></div>" +
          "<div class='bs-scan-head'>" +
            '<div><h2><i></i>' + o.title + '</h2><p>' + o.sub + '</p></div>' +
            "<div class='spec'><span>" + o.specK + '</span> <b>' + o.specV + '</b></div>' +
          '</div>' +
          o.body +
          "<div class='bs-prog'>" +
            "<div class='row'><span class='l'>" + I.layers + '<span>' + o.progLabel + '</span></span>' +
            "<span class='pct' id='bsPct'>0%</span></div>" +
            "<div class='track'><div class='bar' id='bsBar'></div></div>" +
          '</div>' +
          "<div class='bs-actions'><div class='l'>" + o.actions + '</div>' +
            (o.aside || '') +
          '</div>' +
        '</div>' +
        "<div class='bs-scan-side'>" + o.side + '</div>' +
      '</div>'
    );
  }

  /* The circular sensor housing. */
  function bezel(art, cap, rings) {
    return (
      "<div class='bs-sensor-wrap'><div class='bs-sensor-rel'>" +
        "<div class='bs-sensor-glow' id='bsGlow'></div>" +
        "<div class='bs-bezel'><div class='bs-glass' id='bsGlass'>" +
          "<div class='art'>" + art + "<span class='cap' id='bsCap'>" + cap + '</span></div>' +
          (rings === false ? '' : "<div class='bs-rings'><i></i><i></i><i></i></div>") +
          "<div id='bsBeamSlot'></div>" +
        '</div></div>' +
      '</div></div>'
    );
  }

  function metrics(rows) {
    return "<div class='bs-metrics'>" + rows.map(function (r) {
      return "<div class='bs-metric'><span class='k'>" + r[0] + "</span>" +
             "<span class='v " + (r[2] || '') + "' id='" + (r[3] || '') + "'>" + r[1] + '</span></div>';
    }).join('') + '</div>';
  }

  function diag(kind, title, body) {
    var ic = kind === 'ok' ? I.ok : kind === 'bad' ? I.no : I.cpu;
    return "<div class='bs-diag " + (kind || '') + "' id='bsDiag'>" + ic +
           '<div><b>' + title + '</b><span>' + body + '</span></div></div>';
  }

  function sideCard(title, icon, inner) {
    return "<div class='bs-panel bs-card'><h3>" + icon + title + '</h3>' + inner + '</div>';
  }

  /* Sets the sensor's visual state without re-rendering the panel. */
  function sense(kind, cap) {
    var g = $('bsGlass'), gl = $('bsGlow'), c = $('bsCap'), beam = $('bsBeamSlot');
    if (g) g.className = 'bs-glass' + (kind ? ' ' + kind : '');
    if (gl) gl.className = 'bs-sensor-glow' + (kind ? ' ' + kind : '');
    if (c && cap != null) c.textContent = cap;
    if (beam) beam.innerHTML = kind === 'scanning' ? "<div class='bs-beam'></div>" : '';
  }
  function progress(pct, bad) {
    var b = $('bsBar'), p = $('bsPct');
    if (b) { b.style.width = Math.max(0, Math.min(100, pct)) + '%'; b.className = 'bar' + (bad ? ' bad' : ''); }
    if (p) p.textContent = Math.round(pct) + '%';
  }
  function setDiag(kind, title, body) {
    var d = $('bsDiag');
    if (!d) return;
    d.className = 'bs-diag' + (kind ? ' ' + kind : '');
    d.innerHTML = (kind === 'ok' ? I.ok : kind === 'bad' ? I.no : I.cpu) +
                  '<div><b>' + esc(title) + '</b><span>' + esc(body) + '</span></div>';
  }

  /* A scan bar that runs while a promise is outstanding. It reports elapsed
     time against a typical duration and stops at 90 — it is a progress bar
     for something whose length is not knowable, and running it to 100 before
     the answer arrives would be a lie told in a widget. */
  function pace(ms) {
    var t0 = Date.now(), raf = 0, live = true;
    (function step() {
      if (!live) return;
      progress(Math.min(90, (Date.now() - t0) / ms * 100));
      raf = requestAnimationFrame(step);
    })();
    return function done(ok) {
      live = false;
      cancelAnimationFrame(raf);
      progress(100, !ok);
    };
  }

  /* ======================================================================
     TAB: FINGERPRINT — the platform authenticator, which on a laptop is the
     fingerprint reader and on a phone is the same sensor that unlocks it.
     ====================================================================== */
  function tabFingerprint() {
    var keys = PK ? PK.keys() : [];
    var has = keys.length > 0;
    app.innerHTML = scanner({
      title: 'Platform Authenticator',
      sub: 'Touch the reader your device already uses to unlock itself.',
      specK: 'STANDARD:', specV: 'WebAuthn / FIDO2',
      body: bezel(I.finger, has ? 'Touch to verify' : 'No credential yet'),
      progLabel: 'Assertion pipeline',
      actions:
        "<button class='bs-btn bs-btn-em' id='bsScan' type='button'" + (has ? '' : ' disabled') + '>' +
          I.spark + '<span>Verify fingerprint</span></button>' +
        "<button class='bs-btn bs-btn-slate' id='bsReset' type='button'>" + I.reset + '<span>Reset</span></button>',
      side:
        sideCard('Target enrolled template', I.cpu,
          has
            ? "<div class='bs-tpl'>" + keys.map(function (k) {
                return "<div class='row' aria-selected='true'><div><div class='n'>" + esc(k.name) +
                       "</div><div class='h'>" + esc(shortId(k.id)) + '</div></div>' +
                       "<span class='bs-chip'>" + (k.prf ? 'PRF' : 'BASIC') + '</span></div>';
              }).join('') + '</div>'
            : "<p class='bs-tpl'><span class='none'>Nothing enrolled. Create a passkey on the FIDO2 tab " +
              'and this reader will use it.</span></p>') +
        sideCard('Live telemetry', I.pulse,
          metrics([
            ['Credentials', String(keys.length), 'em', 'bsMetA'],
            ['Device lock', 'checking', 'dim', 'bsMetB'],
            ['User verification', 'REQUIRED', 'em', 'bsMetC'],
            ['Last result', '--', 'dim', 'bsMetD']
          ]) +
          diag('', 'Sensor ready', 'The private key never leaves the device; nothing on this page can read it.'))
    });

    platform().then(function (a) {
      var b = $('bsMetB');
      if (b) { b.textContent = a.ok ? 'PRESENT' : 'NONE'; b.className = 'v ' + (a.ok ? 'em' : 'rose'); }
      if (!a.ok) setDiag('bad', 'No device lock', a.why);
    });

    $('bsReset').onclick = function () { sense('', has ? 'Touch to verify' : 'No credential yet'); progress(0); setDiag('', 'Sensor ready', 'Waiting.'); };
    var btn = $('bsScan');
    if (btn) btn.onclick = function () {
      btn.disabled = true;
      sense('scanning', 'Waiting for the device…');
      var done = pace(2200);
      PK.signIn().then(function (r) {
        done(true);
        sense('ok', 'Identity verified');
        setDiag('ok', 'Assertion validated', 'The device held the private key and its owner proved themselves just now.');
        var d = $('bsMetD'); if (d) { d.textContent = 'VERIFIED'; d.className = 'v em'; }
        toast('Identity confirmed' + (r.name ? ' (' + r.name + ')' : '') + '.', 'success');
        unlockable();
        try { if (typeof logSkill === 'function') logSkill('biometric'); } catch (e) {}
      }).catch(function (e) {
        done(false);
        sense('bad', 'Access denied');
        setDiag('bad', 'Verification rejected', e.message);
        var d = $('bsMetD'); if (d) { d.textContent = 'REJECTED'; d.className = 'v rose'; }
        toast(e.message, 'error');
      }).then(function () { btn.disabled = false; refreshChrome(); });
    };
  }

  function platform() {
    if (state.platform) return Promise.resolve(state.platform);
    if (!PK) return Promise.resolve({ ok: false, why: 'Passkeys are not available here.' });
    return PK.available().then(function (a) { state.platform = a; return a; });
  }

  /* ======================================================================
     TAB: FACE — a real camera in the viewport. The matching is NovaClip's
     existing 128-number descriptor, which lives in biometric.js along with
     the model weights, so enrolment and sign-in hand over to its panel
     rather than a second copy of face-api being loaded here.
     ====================================================================== */
  function tabFace() {
    var profs = bioProfiles().filter(function (p) { return p.face; });
    app.innerHTML = scanner({
      title: 'Facial Descriptor Capture',
      sub: 'The picture stays on the canvas it was drawn on. Only numbers are kept.',
      specK: 'VECTOR:', specV: '128 floats',
      body:
        "<div class='bs-sensor-wrap'><div class='bs-sensor-rel' style='width:min(420px,100%)'>" +
          "<div class='bs-sensor-glow' id='bsGlow' style='inset:-10px;border-radius:16px'></div>" +
          "<div style='position:relative;border-radius:16px;overflow:hidden;border:2px solid rgba(51,65,85,.7);" +
          "background:#020617;aspect-ratio:4/3' id='bsGlass' class='bs-glass' >" +
            "<video id='bsVideo' playsinline muted autoplay style='width:100%;height:100%;object-fit:cover;" +
            "display:none;transform:scaleX(-1)'></video>" +
            "<div class='art' id='bsFaceArt' style='position:absolute;inset:0;display:grid;place-items:center'>" +
              I.cam + "<span class='cap' id='bsCap'>Camera off</span></div>" +
            "<div id='bsBeamSlot'></div>" +
          '</div>' +
        '</div></div>',
      progLabel: 'Capture pipeline',
      actions:
        "<button class='bs-btn bs-btn-em' id='bsCam' type='button'>" + I.spark + "<span>Start camera</span></button>" +
        "<button class='bs-btn bs-btn-slate' id='bsFaceGo' type='button'>" + I.shield + '<span>Enrol or sign in</span></button>',
      side:
        sideCard('Target enrolled template', I.cpu,
          profs.length
            ? "<div class='bs-tpl'>" + profs.map(function (p) {
                return "<div class='row' aria-selected='true'><div><div class='n'>" + esc(p.name) +
                       "</div><div class='h'>128 floats</div></div><span class='bs-chip'>FACE</span></div>";
              }).join('') + '</div>'
            : "<div class='bs-tpl'><span class='none'>No face enrolled on this browser yet.</span></div>") +
        sideCard('Live telemetry', I.pulse,
          metrics([
            ['Camera', 'OFF', 'dim', 'bsMetA'],
            ['Resolution', '--', 'dim', 'bsMetB'],
            ['Descriptor', profs.length ? 'STORED' : 'NONE', profs.length ? 'em' : 'dim', 'bsMetC'],
            ['Frames seen', '0', 'dim', 'bsMetD']
          ]) +
          diag('', 'Camera idle',
            'Starting the camera shows you the live frame. Matching runs in NovaClip’s face panel, ' +
            'which already holds the model.'))
    });

    $('bsCam').onclick = startCamera;
    $('bsFaceGo').onclick = function () {
      if (!window.ncBiometric) return toast('The face module has not loaded yet.', 'error');
      if (profs.length) window.ncBiometric.signIn(); else window.ncBiometric.enroll();
    };
  }

  function startCamera() {
    var btn = $('bsCam');
    if (state.media) { stopMedia(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return toast('This browser will not give a page camera access.', 'error');
    }
    btn.disabled = true;
    sense('scanning', 'Requesting camera…');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(function (stream) {
        var v = $('bsVideo'), art = $('bsFaceArt');
        v.srcObject = stream;
        v.style.display = 'block';
        if (art) art.style.display = 'none';
        state.media = { stream: stream, kind: 'cam' };
        sense('ok', '');
        progress(100);
        var frames = 0, raf;
        (function tick() {
          if (!state.media) return;
          frames++;
          var d = $('bsMetD'); if (d) { d.textContent = String(frames); d.className = 'v em'; }
          raf = requestAnimationFrame(tick);
        })();
        state.media.stop = function () { cancelAnimationFrame(raf); };
        var t = stream.getVideoTracks()[0], s = t ? t.getSettings() : {};
        var a = $('bsMetA'); if (a) { a.textContent = 'LIVE'; a.className = 'v em'; }
        var b = $('bsMetB'); if (b && s.width) { b.textContent = s.width + '×' + s.height; b.className = 'v em'; }
        setDiag('ok', 'Camera live', 'This frame is not being recorded, uploaded, or written to disk.');
        btn.innerHTML = I.no + '<span>Stop camera</span>';
        btn.disabled = false;
      })
      .catch(function (e) {
        sense('bad', 'Camera refused');
        progress(0, true);
        setDiag('bad', 'No camera', e && e.name === 'NotAllowedError'
          ? 'Permission was declined. The browser will ask again if you allow it in the address bar.'
          : (e && e.message) || 'The camera could not be opened.');
        btn.disabled = false;
        toast('The camera did not open.', 'error');
      });
  }

  /* ======================================================================
     TAB: VOICE — a real microphone level meter. Matching is NovaClip's
     24-number voiceprint, in biometric.js.
     ====================================================================== */
  function tabVoice() {
    var profs = bioProfiles().filter(function (p) { return p.voice; });
    app.innerHTML = scanner({
      title: 'Acoustic Spectrum Analyser',
      sub: 'About two and a half seconds of speech, averaged into 24 numbers.',
      specK: 'VECTOR:', specV: '24 bands',
      body:
        "<div class='bs-sensor-wrap'><div class='bs-sensor-rel' style='width:min(460px,100%)'>" +
          "<div class='bs-sensor-glow' id='bsGlow' style='inset:-10px;border-radius:16px'></div>" +
          "<div class='bs-glass' id='bsGlass' style='border-radius:16px;height:180px;width:100%;display:block;" +
          "border:2px solid rgba(51,65,85,.7);background:#020617'>" +
            "<canvas id='bsFft' width='800' height='360' style='width:100%;height:100%;display:block'></canvas>" +
            "<span class='cap' id='bsCap' style='position:absolute;left:0;right:0;bottom:10px;text-align:center'>Microphone off</span>" +
            "<div id='bsBeamSlot'></div>" +
          '</div>' +
        '</div></div>',
      progLabel: 'Input level',
      actions:
        "<button class='bs-btn bs-btn-em' id='bsMic' type='button'>" + I.spark + "<span>Start microphone</span></button>" +
        "<button class='bs-btn bs-btn-slate' id='bsVoiceGo' type='button'>" + I.shield + '<span>Enrol or sign in</span></button>',
      side:
        sideCard('Target enrolled template', I.cpu,
          profs.length
            ? "<div class='bs-tpl'>" + profs.map(function (p) {
                return "<div class='row' aria-selected='true'><div><div class='n'>" + esc(p.name) +
                       "</div><div class='h'>24 numbers</div></div><span class='bs-chip'>VOICE</span></div>";
              }).join('') + '</div>'
            : "<div class='bs-tpl'><span class='none'>No voiceprint on this browser yet.</span></div>") +
        sideCard('Live telemetry', I.pulse,
          metrics([
            ['Microphone', 'OFF', 'dim', 'bsMetA'],
            ['Sample rate', '--', 'dim', 'bsMetB'],
            ['Peak level', '--', 'dim', 'bsMetC'],
            ['Voiceprint', profs.length ? 'STORED' : 'NONE', profs.length ? 'em' : 'dim', 'bsMetD']
          ]) +
          diag('', 'Microphone idle',
            'The voice check is the weakest thing on this page and its own text says so: a good ' +
            'impression beats it.'))
    });

    $('bsMic').onclick = startMic;
    $('bsVoiceGo').onclick = function () {
      if (!window.ncBiometric) return toast('The voice module has not loaded yet.', 'error');
      if (profs.length) window.ncBiometric.signIn(); else window.ncBiometric.enroll();
    };
  }

  function startMic() {
    var btn = $('bsMic');
    if (state.media) { stopMedia(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return toast('This browser will not give a page microphone access.', 'error');
    }
    btn.disabled = true;
    sense('scanning', 'Requesting microphone…');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        var ctx = new Ctx();
        var src = ctx.createMediaStreamSource(stream);
        var an = ctx.createAnalyser();
        an.fftSize = 512;
        src.connect(an);
        var bins = new Uint8Array(an.frequencyBinCount);
        var cv = $('bsFft'), g = cv.getContext('2d');
        var raf, peak = 0;

        state.media = { stream: stream, kind: 'mic', ctx: ctx };
        sense('', '');
        var a = $('bsMetA'); if (a) { a.textContent = 'LIVE'; a.className = 'v em'; }
        var b = $('bsMetB'); if (b) { b.textContent = Math.round(ctx.sampleRate / 1000) + ' kHz'; b.className = 'v em'; }
        setDiag('ok', 'Microphone live', 'Nothing is being recorded — this draws the spectrum and throws it away.');
        btn.innerHTML = I.no + '<span>Stop microphone</span>';
        btn.disabled = false;

        (function draw() {
          if (!state.media) return;
          raf = requestAnimationFrame(draw);
          an.getByteFrequencyData(bins);
          g.clearRect(0, 0, cv.width, cv.height);
          var n = 48, step = Math.floor(bins.length / n), w = cv.width / n, lvl = 0;
          for (var i = 0; i < n; i++) {
            var v = bins[i * step] / 255;
            if (v > lvl) lvl = v;
            var h = Math.max(2, v * cv.height * 0.92);
            g.fillStyle = v > 0.55 ? '#34d399' : v > 0.25 ? '#10b981' : '#134e4a';
            g.fillRect(i * w + 1, cv.height - h, w - 3, h);
          }
          if (lvl > peak) peak = lvl;
          progress(lvl * 100);
          var c = $('bsMetC');
          if (c) { c.textContent = Math.round(peak * 100) + '%'; c.className = 'v em'; }
        })();
        state.media.stop = function () { cancelAnimationFrame(raf); try { ctx.close(); } catch (e) {} };
      })
      .catch(function (e) {
        sense('bad', 'Microphone refused');
        progress(0, true);
        setDiag('bad', 'No microphone', (e && e.message) || 'It could not be opened.');
        btn.disabled = false;
        toast('The microphone did not open.', 'error');
      });
  }

  function stopMedia() {
    if (!state.media) return;
    try { state.media.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (state.media.stop) state.media.stop(); } catch (e) {}
    state.media = null;
    render();
  }

  /* ======================================================================
     TAB: CLICK RHYTHM — standing in the iris slot, because a browser has no
     iris camera and rhythm.js is a measurement that actually exists.
     ====================================================================== */
  function tabRhythm() {
    if (!RH) { app.innerHTML = "<div class='bs-panel bs-card'><p>The rhythm module did not load.</p></div>"; return; }
    var supported = RH.supported();
    var has = RH.exists();
    var info = has ? RH.info() : null;

    app.innerHTML = scanner({
      title: 'Click Dynamics',
      sub: supported
        ? 'A password you perform. It is not the order that identifies you, it is the way you do it.'
        : 'Needs a mouse or trackpad.',
      specK: 'MEASURES:', specV: 'DWELL + GAP',
      body:
        "<div class='bs-sensor-wrap'>" +
          (supported
            ? "<div class='bs-pad' id='bsPad'>" +
                "<button class='zone' type='button' data-z='L' disabled>LEFT</button>" +
                "<button class='zone' type='button' data-z='R' disabled>RIGHT</button>" +
              "</div><div class='bs-slots' id='bsSlots'></div>"
            : "<div class='bs-empty' style='max-width:420px'>Half of what this reads is how long you hold " +
              'the button down, and a tap on a touchscreen has no such thing. Open this page on a ' +
              'computer with a mouse or a trackpad.</div>') +
        '</div>',
      progLabel: 'Clicks captured',
      actions: supported
        ? "<button class='bs-btn bs-btn-em' id='bsRhGo' type='button'>" + I.spark + '<span>' +
            (has ? 'Sign in with it' : 'Set a pattern') + '</span></button>' +
          "<button class='bs-btn bs-btn-slate' id='bsRhAgain' type='button'>" + I.reset +
            '<span>' + (has ? 'Set a new one' : 'Start over') + '</span></button>' +
          (has ? "<button class='bs-btn bs-btn-danger bs-btn-sm' id='bsRhOff' type='button'>" +
                 I.trash + '<span>Remove</span></button>' : '')
        : '',
      side:
        sideCard('Target enrolled template', I.cpu,
          has
            ? "<div class='bs-tpl'><div class='row' aria-selected='true'><div>" +
              "<div class='n'>Click pattern</div><div class='h'>" + info.clicks + ' clicks · ' +
              info.features + " numbers</div></div><span class='bs-chip'>RHYTHM</span></div></div>"
            : "<div class='bs-tpl'><span class='none'>Nothing set on this browser yet.</span></div>") +
        sideCard('Live telemetry', I.pulse,
          metrics([
            ['Clicks', '0', 'dim', 'bsMetA'],
            ['Order', '--', 'dim', 'bsMetB'],
            ['Enrolment', has ? 'COMPLETE' : (supported ? 'NOT SET' : 'N/A'), has ? 'em' : 'dim', 'bsMetC'],
            ['Last match', '--', 'dim', 'bsMetD']
          ]) +
          diag('', has ? 'Pattern ready' : 'Nothing set',
            has ? 'Perform your pattern and it checks itself on the last click.'
                : 'Six clicks or more. Eight is noticeably harder for somebody else to fake.'))
    });

    if (supported) wireRhythm();
  }

  function wireRhythm() {
    var mode = 'idle', rec = null, taken = [], want = 0;
    var pad = $('bsPad'), slots = $('bsSlots');
    var zones = [].slice.call(pad.querySelectorAll('.zone'));
    var bGo = $('bsRhGo'), bAgain = $('bsRhAgain'), bOff = $('bsRhOff');

    function dots(n, on) {
      var s = '';
      for (var i = 0; i < n; i++) s += '<i' + (i < on ? " class='on'" : '') + '></i>';
      slots.innerHTML = s;
    }
    function met(id, v, cls) { var e = $(id); if (e) { e.textContent = v; e.className = 'v ' + (cls || 'dim'); } }
    function live() {
      met('bsMetA', rec ? String(rec.length()) : '0', rec && rec.length() ? 'em' : 'dim');
      met('bsMetB', rec && rec.length() ? rec.zones().join(' ') : '--', rec && rec.length() ? 'em' : 'dim');
      progress(want ? (rec.length() / want) * 100 : 0);
    }
    function armed(on) { zones.forEach(function (z) { z.disabled = !on; }); }

    function press(zone, el, ev) {
      if (mode === 'idle' || !rec || !rec.press(zone)) return;
      el.classList.add('down');
      if (ev && ev.pointerId != null && el.setPointerCapture) {
        try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      }
    }
    function release(el) {
      if (!rec || !rec.held()) return;
      rec.release();
      el.classList.remove('down');
      dots(want || Math.max(RH.MIN_CLICKS, rec.length()), rec.length());
      live();
      if (mode === 'checking' && want && rec.length() >= want) submit();
    }

    zones.forEach(function (el) {
      var z = el.getAttribute('data-z');
      el.addEventListener('pointerdown', function (e) { e.preventDefault(); press(z, el, e); });
      el.addEventListener('pointerup', function (e) { e.preventDefault(); release(el); });
      el.addEventListener('pointercancel', function () { if (rec) rec.cancel(); el.classList.remove('down'); });
      /* Keyboard gets a press and a release rather than a click, because
         holding Space has a duration and a click event has none. */
      el.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault(); if (!e.repeat) press(z, el, null);
      });
      el.addEventListener('keyup', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault(); release(el);
      });
      el.addEventListener('click', function (e) { e.preventDefault(); });
    });

    function startEnrol() {
      mode = 'enrolling'; taken = []; want = 0; rec = RH.newRecorder();
      armed(true); dots(RH.MIN_CLICKS, 0); live();
      bGo.innerHTML = I.ok + "<span>Done — go 1 of " + RH.ENROL_REPEATS + '</span>';
      bAgain.innerHTML = I.reset + '<span>Start over</span>';
      if (bOff) bOff.style.display = 'none';
      setDiag('', 'Go 1 of ' + RH.ENROL_REPEATS,
        'Click at least ' + RH.MIN_CLICKS + ' times, then press the button. Do it the way you would ' +
        'actually do it — it is learning how much you vary.');
    }

    function takeGo() {
      var s = rec.sample();
      if (!s) return setDiag('bad', 'Too short', 'That is only ' + rec.length() + ' clicks; it needs at least ' + RH.MIN_CLICKS + '.');
      if (!want) want = s.seq.length;
      taken.push(s);
      if (taken.length < RH.ENROL_REPEATS) {
        rec = RH.newRecorder(); dots(want, 0); live();
        bGo.innerHTML = I.ok + '<span>' +
          (taken.length === RH.ENROL_REPEATS - 1 ? 'Save the pattern'
            : 'Done — go ' + (taken.length + 1) + ' of ' + RH.ENROL_REPEATS) + '</span>';
        setDiag('', 'Go ' + (taken.length + 1) + ' of ' + RH.ENROL_REPEATS,
          'Same pattern, same way. Do not try to be perfect.');
        return;
      }
      try {
        var out = RH.enrol(taken);
        mode = 'idle'; rec = null; armed(false);
        if (PK) PK.log('Click rhythm set up', true, out.clicks + ' clicks');
        toast('Click pattern kept — ' + out.clicks + ' clicks, ' + out.features + ' numbers.', 'success');
        render();
      } catch (e) {
        setDiag('bad', 'Enrolment restarted', e.message);
        startEnrol();
      }
    }

    function startCheck() {
      var wait = RH.cooling();
      if (wait > 0) return setDiag('bad', 'Too many wrong tries', 'Wait ' + Math.ceil(wait / 1000) + ' seconds.');
      mode = 'checking'; want = RH.info().clicks; rec = RH.newRecorder();
      armed(true); dots(want, 0); live();
      bGo.innerHTML = I.spark + '<span>Check it</span>';
      bAgain.innerHTML = I.reset + '<span>Cancel</span>';
      setDiag('', 'Waiting', 'Do your pattern — all ' + want + ' clicks. It checks itself on the last one.');
    }

    function submit() {
      var s = rec.sample();
      mode = 'idle'; rec = null; armed(false);
      var r = RH.verify(s);
      progress(100, !r.ok);
      if (r.ok) {
        met('bsMetD', r.pct + '%', 'em');
        setDiag('ok', 'That is you', r.pct + '% match. Signed in on this browser.');
        toast('Click rhythm matched — ' + r.pct + '%.', 'success');
        try { if (typeof logSkill === 'function') logSkill('biometric'); } catch (e) {}
        setTimeout(render, 900);
        return;
      }
      met('bsMetD', (r.pct || 0) + '%', 'rose');
      var why =
        r.why === 'COOLING' ? ['Locked out', 'Too many wrong tries. Wait ' + Math.ceil(r.wait / 1000) + ' seconds.']
        : r.why === 'SEQ'   ? ['Wrong order', 'That was a different left-and-right order.']
        : r.why === 'TEMPO' ? ['Wrong speed', 'Right pattern, but much faster or slower than the one it learned.']
        : r.why === 'ONE_OFF' ? ['One gap was out', 'Close on most of it, but a single interval was a long way off.']
        : ['Not close enough', r.pct + '% match. It wants about 50% or better.'];
      setDiag('bad', why[0], why[1]);
      toast(why[1], 'error');
      setTimeout(function () { render(); }, 1200);
    }

    bGo.onclick = function () {
      if (mode === 'enrolling') return takeGo();
      if (mode === 'checking') {
        if (rec && rec.length() >= want) return submit();
        return setDiag('bad', 'Not finished', 'That is ' + (rec ? rec.length() : 0) + ' of ' + want + ' clicks.');
      }
      if (RH.exists()) return startCheck();
      startEnrol();
    };
    bAgain.onclick = function () {
      if (mode === 'idle') return startEnrol();
      mode = 'idle'; rec = null; taken = []; want = 0;
      armed(false); render();
    };
    if (bOff) bOff.onclick = function () {
      if (!confirm('Remove the click pattern from this browser?')) return;
      RH.forget(); toast('Click pattern removed.', 'info'); render();
    };
  }

  /* ======================================================================
     TAB: PASSKEY
     ====================================================================== */
  function tabPasskey() {
    var keys = PK ? PK.keys() : [];
    app.innerHTML = scanner({
      title: 'FIDO2 Hardware Token',
      sub: 'A key generated inside the device’s secure element. It cannot be copied out.',
      specK: 'ATTESTATION:', specV: 'NONE',
      body: bezel(I.key, keys.length ? keys.length + ' enrolled' : 'No credential', false),
      progLabel: 'Credential pipeline',
      actions:
        "<button class='bs-btn bs-btn-em' id='bsPkNew' type='button'>" + I.plus + "<span>Create a passkey</span></button>" +
        "<button class='bs-btn bs-btn-slate' id='bsPkIn' type='button'" + (keys.length ? '' : ' disabled') + '>' +
          I.shield + '<span>Sign in</span></button>' +
        (keys.length ? "<button class='bs-btn bs-btn-danger bs-btn-sm' id='bsPkOff' type='button'>" +
                       I.trash + '<span>Remove</span></button>' : ''),
      side:
        sideCard('Credentials on this device', I.key,
          keys.length
            ? "<div class='bs-tpl'>" + keys.map(function (k) {
                return "<div class='row' aria-selected='true'><div><div class='n'>" + esc(k.name) +
                       "</div><div class='h'>" + esc(shortId(k.id)) + ' · ' + ago(k.at) + '</div></div>' +
                       "<span class='bs-chip" + (k.prf ? '' : ' slate') + "'>" + (k.prf ? 'PRF' : 'NO PRF') + '</span></div>';
              }).join('') + '</div>'
            : "<div class='bs-tpl'><span class='none'>None yet.</span></div>") +
        sideCard('Live telemetry', I.pulse,
          metrics([
            ['Algorithms', 'ES256 / RS256', 'em small'],
            ['Attachment', 'PLATFORM', 'em'],
            ['User verification', 'REQUIRED', 'em'],
            ['Vault derivation', keys.some(function (k) { return k.prf; }) ? 'AVAILABLE' : 'UNAVAILABLE',
              keys.some(function (k) { return k.prf; }) ? 'em' : 'dim']
          ]) +
          diag('', 'What this proves',
            'That this device holds the private key and its owner unlocked it. There is no NovaClip ' +
            'server checking the signature, so it is not proof of identity to anybody else.'))
    });

    $('bsPkNew').onclick = function () {
      var b = this; b.disabled = true;
      sense('scanning', 'Creating…');
      var done = pace(2500);
      var name = (localStorage.getItem('nc_name') || 'NovaClip user');
      PK.enrol(name).then(function () {
        done(true); toast('Passkey created. It stays on this device.', 'success'); render();
      }).catch(function (e) {
        done(false); sense('bad', 'Refused'); toast(e.message, 'error'); b.disabled = false;
      });
    };
    var bIn = $('bsPkIn');
    if (bIn) bIn.onclick = function () {
      bIn.disabled = true;
      sense('scanning', 'Waiting…');
      var done = pace(2200);
      PK.signIn().then(function (r) {
        done(true); sense('ok', 'Verified');
        toast('Signed in' + (r.name ? ' as ' + r.name : '') + '.', 'success');
        unlockable(); refreshChrome();
      }).catch(function (e) {
        done(false); sense('bad', 'Denied'); toast(e.message, 'error');
      }).then(function () { bIn.disabled = false; });
    };
    var bOff = $('bsPkOff');
    if (bOff) bOff.onclick = function () {
      if (!confirm('Remove NovaClip’s passkey handle from this browser?\n\n' +
                   'The key itself stays in the device’s own store — this removes the handle on it. ' +
                   'Anything in the vault that was encrypted with it becomes unreadable.')) return;
      PK.forget(); toast('Passkey handle removed.', 'info'); render();
    };
  }

  /* ======================================================================
     TAB: VAULT
     ====================================================================== */
  function tabVault() {
    if (!LK) { app.innerHTML = "<div class='bs-panel bs-card'><p>The locker module did not load.</p></div>"; return; }
    var open = LK.isOpen();
    var exists = LK.exists();

    if (!open) {
      app.innerHTML =
        "<div class='bs-panel bs-card'>" +
          "<div class='bs-vault-locked'><div class='bs-grid-bg'></div><div class='in'>" +
            "<div class='big'>" + I.lock + '</div>' +
            '<h3>' + (exists ? 'Vault encrypted' : 'No vault yet') + '</h3>' +
            '<p>' + (exists
              ? 'What is on disk is ciphertext, a salt and a nonce. The key is derived from your passkey ' +
                'by HKDF and exists only in memory, only while this is open.'
              : 'Nothing has been put in it yet. Opening it the first time creates it.') + '</p>' +
            "<div style='display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px'>" +
              "<button class='bs-btn bs-btn-em' id='bsVkOpen' type='button'>" + I.shield +
                '<span>Unlock with passkey</span></button>' +
              "<button class='bs-btn bs-btn-ghost' id='bsVkPass' type='button'>" + I.key +
                '<span>Use a passphrase</span></button>' +
            '</div>' +
            "<div id='bsPassRow' style='display:none;width:100%;max-width:22rem;margin-top:8px'>" +
              "<div class='bs-field'><input id='bsPass' type='password' autocomplete='current-password' " +
              "placeholder='At least eight characters'></div>" +
              "<button class='bs-btn bs-btn-em' id='bsPassGo' type='button' style='margin-top:8px'>Open</button>" +
            '</div>' +
            "<p id='bsVkMsg' style='margin-top:6px'></p>" +
          '</div></div>' +
        '</div>';

      $('bsVkOpen').onclick = function () {
        vmsg('Waiting for the device…');
        LK.unlockWithPasskey().then(function () {
          toast('Vault decrypted.', 'success'); render(); refreshChrome();
        }).catch(function (e) {
          if (e.message === 'NO_PRF') {
            vmsg('This device cannot derive a key from a passkey. Use a passphrase instead.');
            $('bsPassRow').style.display = 'block';
          } else vmsg(e.message);
        });
      };
      $('bsVkPass').onclick = function () { $('bsPassRow').style.display = 'block'; $('bsPass').focus(); };
      $('bsPassGo').onclick = passGo;
      $('bsPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') passGo(); });
      function passGo() {
        LK.unlockWithPass($('bsPass').value).then(function () {
          toast('Vault decrypted.', 'success'); render(); refreshChrome();
        }).catch(function (e) { vmsg(e.message); });
      }
      function vmsg(t) { var m = $('bsVkMsg'); if (m) { m.textContent = t; m.style.color = '#fb7185'; m.style.fontSize = '12px'; } }
      return;
    }

    app.innerHTML =
      "<div class='bs-panel bs-card'>" +
        "<div class='bs-profiles top' style='padding:0'>" +
          '<div><h2>' + I.unlock + ' Secure Vault <span class="bs-chip">Decrypted</span></h2>' +
          "<p>AES-GCM 256. Locks itself after five minutes, or when you leave this tab.</p></div>" +
          "<div style='display:flex;gap:8px;flex-wrap:wrap'>" +
            "<button class='bs-btn bs-btn-em6 bs-btn-sm' id='bsVAdd' type='button'>" + I.plus + '<span>Add secret</span></button>' +
            "<button class='bs-btn bs-btn-ghost bs-btn-sm' id='bsVLock' type='button'>" + I.lock + '<span>Lock now</span></button>' +
            "<button class='bs-btn bs-btn-danger bs-btn-sm' id='bsVWipe' type='button'>" + I.trash + '<span>Empty it</span></button>' +
          '</div>' +
        '</div>' +
        "<div id='bsVForm' style='display:none'>" +
          "<div class='bs-field'><label for='bsVT'>Title</label><input id='bsVT' maxlength='80' placeholder='What is it?'></div>" +
          "<div class='bs-field'><label for='bsVB'>Secret content</label><textarea id='bsVB' rows='3' maxlength='2000' placeholder='The bit you want kept'></textarea></div>" +
          "<div class='ft' style='justify-content:flex-start'><button class='bs-btn bs-btn-em bs-btn-sm' id='bsVSave' type='button'>Encrypt it</button></div>" +
        '</div>' +
        "<div class='bs-items' id='bsVList'></div>" +
      '</div>';

    $('bsVAdd').onclick = function () {
      var f = $('bsVForm');
      f.style.display = f.style.display === 'none' ? 'block' : 'none';
      if (f.style.display === 'block') $('bsVT').focus();
    };
    $('bsVLock').onclick = function () { LK.lock(); toast('Vault locked.', 'info'); render(); refreshChrome(); };
    $('bsVWipe').onclick = function () {
      if (!confirm('Delete the vault and everything in it? There is no copy anywhere.')) return;
      LK.destroy(); toast('Vault destroyed.', 'info'); render(); refreshChrome();
    };
    $('bsVSave').onclick = function () {
      var t = $('bsVT'), b = $('bsVB');
      if (!t.value.trim()) return toast('Give it a title.', 'error');
      LK.add(t.value.trim(), b.value).then(function () {
        t.value = ''; b.value = ''; $('bsVForm').style.display = 'none';
        toast('Encrypted into the vault.', 'success'); drawVault();
      }).catch(function (e) { toast(e.message, 'error'); });
    };
    drawVault();
  }

  function drawVault() {
    var box = $('bsVList');
    if (!box) return;
    LK.items().then(function (list) {
      if (!list.length) {
        box.innerHTML = "<div class='bs-empty' style='grid-column:1/-1'>Nothing in it yet.</div>";
        return;
      }
      box.innerHTML = '';
      list.forEach(function (it, i) {
        var el = document.createElement('div');
        el.className = 'bs-item';
        el.innerHTML =
          "<div class='a'><div class='t'>" + I.file + '<span></span></div>' +
          "<span class='bs-chip'>ENCRYPTED</span></div>" +
          "<div class='val'><div class='txt'>••••••••••••</div>" +
          "<div class='btns'><button type='button' class='rv' aria-label='Reveal'>" + I.eye + '</button>' +
          "<button type='button' class='cp' aria-label='Copy'>" + I.copy + '</button></div></div>' +
          "<div class='foot'><span></span><button type='button' class='rm' aria-label='Delete'>" + I.trash + '</button></div>';
        /* textContent, never innerHTML — this is the one place on the page
           where the string came from the reader rather than from the code. */
        el.querySelector('.a .t span').textContent = it.t || '(untitled)';
        el.querySelector('.foot span').textContent = new Date(it.at).toLocaleString();
        var shown = false, txt = el.querySelector('.txt');
        el.querySelector('.rv').onclick = function () {
          shown = !shown;
          txt.textContent = shown ? (it.b || '') : '••••••••••••';
          this.innerHTML = shown ? I.eyeoff : I.eye;
        };
        el.querySelector('.cp').onclick = function () {
          try { navigator.clipboard.writeText(it.b || ''); toast('Copied.', 'info'); }
          catch (e) { toast('This browser would not copy it.', 'error'); }
        };
        el.querySelector('.rm').onclick = function () {
          LK.remove(i).then(function () { drawVault(); toast('Purged from the vault.', 'info'); });
        };
        box.appendChild(el);
      });
    }).catch(function (e) {
      box.innerHTML = "<div class='bs-empty' style='grid-column:1/-1'>" + esc(e.message) + '</div>';
    });
  }

  /* ======================================================================
     TAB: AUDIT
     ====================================================================== */
  var auditFilter = 'ALL', auditQuery = '';

  function tabAudit() {
    var rows = PK ? PK.auditRows() : [];
    app.innerHTML =
      "<div class='bs-panel bs-card'>" +
        "<div class='bs-profiles top' style='padding:0 0 16px'>" +
          '<div><h2>' + I.hist + ' Verification audit trail ' +
            "<span class='bs-chip slate' id='bsLogCount'>0 events</span></h2>" +
          '<p>Every attempt on this browser, newest first, the last fifty. It never leaves here — ' +
          'not to NovaClip either.</p></div>' +
          "<div style='display:flex;gap:8px'>" +
            "<button class='bs-btn bs-btn-ghost bs-btn-sm' id='bsLogExport' type='button'>" + I.dl + '<span>Export JSON</span></button>' +
            "<button class='bs-btn bs-btn-danger bs-btn-sm' id='bsLogClear' type='button'>" + I.trash + '<span>Clear log</span></button>' +
          '</div>' +
        '</div>' +
        "<div class='bs-filters'>" +
          "<div class='bs-search'>" + I.search +
            "<input id='bsLogQ' type='text' placeholder='Search attempts…'></div>" +
          "<div class='bs-pills' id='bsLogPills'></div>" +
        '</div>' +
        "<div class='bs-logs' id='bsLogList'></div>" +
      '</div>';

    ['ALL', 'SUCCESS', 'FAILED'].forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bs-pill'; b.textContent = k;
      b.setAttribute('aria-pressed', auditFilter === k ? 'true' : 'false');
      b.onclick = function () { auditFilter = k; tabAudit(); };
      $('bsLogPills').appendChild(b);
    });

    var q = $('bsLogQ');
    q.value = auditQuery;
    q.oninput = function () { auditQuery = q.value; drawLogs(rows); };
    $('bsLogClear').onclick = function () {
      if (!confirm('Clear the attempt log on this browser?')) return;
      PK.clearAudit(); toast('Audit trail cleared.', 'info'); tabAudit();
    };
    /* An artifact viewer blocks a page-initiated download, and so does a
       locked-down browser. Falling back to the clipboard means the button
       still does something rather than silently doing nothing. */
    $('bsLogExport').onclick = function () {
      var json = JSON.stringify(PK.auditRows(), null, 2);
      try {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        a.download = 'novaclip-audit-' + Date.now() + '.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast('Exported.', 'success');
      } catch (e) {
        try { navigator.clipboard.writeText(json); toast('Download blocked — copied to the clipboard instead.', 'info'); }
        catch (e2) { toast('This browser would not export it.', 'error'); }
      }
    };
    drawLogs(rows);
  }

  function drawLogs(rows) {
    var box = $('bsLogList');
    if (!box) return;
    var q = auditQuery.trim().toLowerCase();
    var list = rows.filter(function (r) {
      if (auditFilter === 'SUCCESS' && !r.ok) return false;
      if (auditFilter === 'FAILED' && r.ok) return false;
      if (!q) return true;
      return (r.what + ' ' + (r.detail || '')).toLowerCase().indexOf(q) >= 0;
    });
    var c = $('bsLogCount');
    if (c) c.textContent = list.length + ' events';
    if (!list.length) {
      box.innerHTML = "<div class='bs-empty'>No records match.</div>";
      return;
    }
    box.innerHTML = list.map(function (r) {
      var kind = /rhythm/i.test(r.what) ? 'rhythm'
               : /face/i.test(r.what) ? 'face'
               : /voice/i.test(r.what) ? 'voice'
               : /locker|vault/i.test(r.what) ? 'locker' : 'passkey';
      return "<div class='bs-log'><div class='l'>" +
        "<div class='bs-ic" + (r.ok ? '' : ' rose') + "'>" + iconFor(kind) + '</div>' +
        "<div><div class='nm'><b>" + esc(r.what) + "</b>" +
        "<span class='bs-chip" + (r.ok ? '' : ' rose') + "'>" + (r.ok ? 'SUCCESS' : 'FAILED') + '</span></div>' +
        (r.detail ? "<p class='note'>" + esc(r.detail) + '</p>' : '') +
        '</div></div>' +
        "<div class='r'><div class='a'><div class='" + (r.ok ? 'x' : 'y') + "'>" +
        (r.ok ? 'VERIFIED' : 'REJECTED') + "</div><div class='y'>" +
        new Date(r.at).toLocaleString() + '</div></div></div></div>';
    }).join('');
  }

  /* ======================================================================
     CHROME: tiles, tabs, profiles, header
     ====================================================================== */
  function refreshChrome() {
    var profs = allProfiles();
    var open = LK && LK.isOpen();

    var a = $('bsProfCount'), b = $('bsProfCount2');
    if (a) a.textContent = String(profs.length);
    if (b) b.textContent = String(profs.length);

    var tm = $('bsTileModalities');
    if (tm) tm.textContent = profs.length + (profs.length === 1 ? ' Active' : ' Active');

    var tv = $('bsTileVault'), tvi = $('bsTileVaultIc');
    if (tv) { tv.textContent = open ? 'DECRYPTED' : 'LOCKED'; tv.className = 'v ' + (open ? 'em' : 'rose'); }
    if (tvi) { tvi.className = 'bs-ic' + (open ? '' : ' rose'); tvi.innerHTML = open ? I.unlock : I.lock; }

    var chip = $('bsVaultChip'), chipT = $('bsVaultChipTxt');
    if (chip) {
      chip.className = 'bs-vaultchip' + (open ? ' open' : '');
      chip.innerHTML = (open ? I.unlock : I.lock) +
        "<span id='bsVaultChipTxt'>" + (open ? 'Vault Decrypted' : 'Vault Locked') + '</span>' +
        (open ? "<span class='hint'>(Lock)</span>" : '');
      chip.onclick = open ? function () { LK.lock(); toast('Vault locked.', 'info'); render(); refreshChrome(); }
                          : function () { go('vault'); };
    }
    void chipT;

    drawTabs();
    drawProfiles(profs);
  }

  function drawTabs() {
    var wrap = $('bsTabs');
    if (!wrap) return;
    var open = LK && LK.isOpen();
    var logs = PK ? PK.auditRows().length : 0;
    wrap.innerHTML = '';
    TABS.forEach(function (t) {
      var sub = t.id === 'vault' ? (open ? 'Decrypted' : 'Encrypted')
              : t.id === 'audit' ? logs + ' Events' : t.sub;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bs-tab';
      b.id = 'bstab-' + t.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', state.tab === t.id ? 'true' : 'false');
      b.innerHTML = "<span class='t'>" + t.icon + '</span><span>' +
        "<span class='lab'>" + t.label +
        (t.id === 'vault' && open ? "<i class='live'></i>" : '') + '</span>' +
        "<span class='subl'>" + sub + '</span></span>';
      b.onclick = function () { go(t.id); };
      wrap.appendChild(b);
    });
  }

  function drawProfiles(profs) {
    var box = $('bsProfiles');
    if (!box) return;
    if (!profs.length) {
      box.innerHTML = "<div class='bs-empty' style='grid-column:1/-1'>Nothing enrolled on this browser yet. " +
                      'Pick a modality above and set one up.</div>';
      return;
    }
    box.innerHTML = '';
    profs.forEach(function (p) {
      var el = document.createElement('div');
      el.className = 'bs-pcard';
      el.innerHTML =
        "<div class='a'><div class='who'><div class='bs-ic'>" + iconFor(p.kind) + '</div>' +
        "<div><h3></h3><span class='h'></span></div></div>" +
        "<span class='bs-chip'>" + p.kind.toUpperCase() + '</span></div>' +
        "<div class='b'><span></span><div style='display:flex;align-items:center;gap:10px'>" +
        "<button type='button' class='go'>Test scan &rarr;</button></div></div>";
      el.querySelector('h3').textContent = p.name;
      el.querySelector('.h').textContent = p.hash;
      el.querySelector('.b > span').textContent = 'LAST: ' + ago(p.at);
      el.querySelector('.go').onclick = function () {
        go(p.kind === 'passkey' ? 'passkey' : p.kind === 'rhythm' ? 'rhythm' : p.kind);
      };
      box.appendChild(el);
    });
  }

  function unlockable() {
    /* A successful passkey assertion does not open the vault by itself — the
       vault needs a PRF evaluation, which is a separate ceremony. Saying so
       is better than leaving somebody to wonder why it is still locked. */
    if (LK && !LK.isOpen() && LK.exists()) {
      setTimeout(function () {
        toast('Signed in. The vault still needs its own unlock — its key comes from the passkey, not from the sign-in.', 'info');
      }, 800);
    }
  }

  /* ---- routing ----------------------------------------------------------- */
  var PANELS = {
    fingerprint: tabFingerprint, face: tabFace, voice: tabVoice,
    rhythm: tabRhythm, passkey: tabPasskey, vault: tabVault, audit: tabAudit
  };

  function go(id) {
    if (!PANELS[id]) return;
    if (state.media) {   // a camera or microphone must not survive a tab change
      try { state.media.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      try { if (state.media.stop) state.media.stop(); } catch (e) {}
      state.media = null;
    }
    state.tab = id;
    try { location.hash = id; } catch (e) {}
    render();
  }

  function render() {
    PANELS[state.tab]();
    refreshChrome();
  }

  /* ---- header odds and ends ---------------------------------------------- */
  function clock() {
    var el = $('bsClock');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString([], { hour12: false });
  }

  function modals() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-close]') : null;
      if (t) { var m = $(t.getAttribute('data-close')); if (m) m.hidden = true; }
    });
    [$('bsEnrollModal'), $('bsSettingsModal')].forEach(function (m) {
      if (!m) return;
      m.addEventListener('click', function (e) { if (e.target === m) m.hidden = true; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      [$('bsEnrollModal'), $('bsSettingsModal')].forEach(function (m) { if (m) m.hidden = true; });
    });

    var open = function (id) { var m = $(id); if (m) m.hidden = false; };
    $('bsEnrollBtn').onclick = function () { fillEnrol(); open('bsEnrollModal'); };
    $('bsAddModality').onclick = function () { fillEnrol(); open('bsEnrollModal'); };
    $('bsSettingsBtn').onclick = function () { fillSettings(); open('bsSettingsModal'); };

    $('bsWipeAll').onclick = function () {
      if (!confirm('Delete every biometric template, the vault and the audit log from this browser?\n\n' +
                   'This cannot be undone and there is no copy anywhere.')) return;
      try { if (PK) { PK.forget(); PK.clearAudit(); } } catch (e) {}
      try { if (RH) RH.forget(); } catch (e) {}
      try { if (LK) LK.destroy(); } catch (e) {}
      try { localStorage.removeItem('nc_bio_profiles'); } catch (e) {}
      $('bsSettingsModal').hidden = true;
      toast('Everything on this page has been deleted from this browser.', 'info');
      render();
    };
  }

  function fillEnrol() {
    var grid = $('bsEnrollGrid');
    if (!grid) return;
    var opts = [
      ['passkey', 'FIDO2 Passkey', 'The strong one. Made in the device’s secure hardware.'],
      ['fingerprint', 'Fingerprint', 'Uses the passkey above — on a laptop that is the fingerprint reader.'],
      ['face', 'Face', 'A 128-number descriptor. The picture never leaves the canvas.'],
      ['voice', 'Voiceprint', 'A 24-number average. Honest about being the weakest here.'],
      ['rhythm', 'Click rhythm', 'Mouse only. Five goes so it can learn how much you vary.']
    ];
    grid.innerHTML = '';
    opts.forEach(function (o) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'bs-pcard';
      el.style.cssText = 'text-align:left;cursor:pointer;font-family:inherit';
      el.innerHTML = "<div class='a'><div class='who'><div class='bs-ic'>" + iconFor(o[0]) +
        "</div><div><h3></h3><span class='h'></span></div></div></div>";
      el.querySelector('h3').textContent = o[1];
      el.querySelector('.h').textContent = o[2];
      el.onclick = function () { $('bsEnrollModal').hidden = true; go(o[0]); };
      grid.appendChild(el);
    });
  }

  function fillSettings() {
    var i = $('bsCfgIdleTxt');
    if (i && LK) i.textContent = Math.round(LK.IDLE_MS / 60000) + ' minutes untouched and the vault locks itself.';
    var r = $('bsCfgRateTxt');
    if (r && RH) r.textContent = RH.FREE_TRIES + ' wrong tries, then a doubling wait.';
  }

  /* ---- boot -------------------------------------------------------------- */
  function boot() {
    var h = (location.hash || '').replace('#', '');
    if (PANELS[h]) state.tab = h;

    clock();
    setInterval(clock, 1000);
    modals();

    platform().then(function (a) {
      var p = $('bsPlatform');
      if (p) p.textContent = a.ok ? 'Device lock present' : 'No device lock on this machine';
      var t = $('bsTilePlatform');
      if (t) { t.textContent = a.ok ? 'READY' : 'ABSENT'; t.className = 'v ' + (a.ok ? 'em' : 'rose'); }
    });

    render();

    /* The locker fires this when it locks itself — on idle, on leaving the
       tab. The chrome has to follow or the header goes on claiming the vault
       is open after it has closed. */
    addEventListener('nc-locker', function () { refreshChrome(); if (state.tab === 'vault') render(); });
    addEventListener('nc-audit', function () { refreshChrome(); if (state.tab === 'audit') tabAudit(); });
    addEventListener('hashchange', function () {
      var id = (location.hash || '').replace('#', '');
      if (PANELS[id] && id !== state.tab) { state.tab = id; render(); }
    });
    addEventListener('pagehide', function () { if (state.media) stopMedia(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
