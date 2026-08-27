/* ============================================================================
   VOICE CHANGER
   ============================================================================
   Take an audio or video clip that is already in the project — or record a new
   line into the microphone — and come back with a second clip that sounds like
   somebody else. Chipmunk, monster, robot, radio, cave. It runs on this
   machine, it costs nothing, and nothing is uploaded.

   WHY THIS FILE EXISTS AT ALL

   The editor listed "Voice Cloning" under "Not available here — needs a voice
   model and a server to run it on", and that is still true: cloning a specific
   person's voice needs a trained model and somewhere to run it. But nobody
   asking for a voice changer is usually asking for that. They want to sound
   like a chipmunk, and a chipmunk is arithmetic.

   HOW THE PITCH SHIFT WORKS, WHICH IS THE ONLY HARD PART

   Playing a sound faster raises its pitch — that is a tape deck, and it is one
   line of code. The problem is it also makes it shorter, so a four second line
   becomes two seconds and no longer fits the cut it was made for.

   So the sound is chopped into short overlapping grains, about forty
   milliseconds each. Each grain is played faster (or slower) than it was
   recorded, which shifts its pitch. But the grains are laid back down at their
   ORIGINAL spacing rather than at their new shortened length. The pitch moves;
   the timing does not. Every grain is faded in and out with a raised-cosine
   window so the joins do not click, and because those windows overlap four
   deep the sum of them is flat — with one exception, the very start and end,
   where fewer windows overlap. That is why the code carries a second buffer of
   window weights and divides by it at the end rather than trusting the theory:
   the theory is only true in the middle.

   WHAT THIS IS NOT

   It shifts the formants along with the pitch. Formants are the resonances of
   the throat and mouth, and in a real voice they stay put when you sing higher
   — which is why a soprano still sounds human. Moving them is exactly what
   makes a chipmunk sound like a chipmunk, so for this it is the effect people
   want. But it does mean a big shift stops sounding like a person rather than
   sounding like the same person, higher. Keeping formants still needs a phase
   vocoder with envelope estimation, which is a much bigger build and is not
   pretending to be here.

   Everything below the panel is pure arithmetic on arrays, so it is unit
   tested under node with no browser and no audio hardware.
   ============================================================================ */
(function () {
  'use strict';

  var G = typeof window !== 'undefined' ? window
        : typeof globalThis !== 'undefined' ? globalThis : this;
  if (G.NCVoice) return;

  /* ---- tunables ---------------------------------------------------------- */
  var GRAIN = 2048;         // samples per grain: ~46ms at 44.1k. Shorter smears
                            // pitch, longer smears timing. This is the usual
                            // compromise for speech.
  var OVERLAP = 4;          // grains overlapping at any moment
  var MAX_SECONDS = 120;    // bounds the memory: 2 minutes of stereo float is
                            // already 40MB before any working buffers

  /* ---- small helpers ----------------------------------------------------- */

  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  /* Reads x at a fractional position. Everything here that changes speed goes
     through this, so there is one place where off-the-end is defined and it is
     defined as silence rather than as a wrapped or repeated sample. */
  function at(x, p) {
    if (p <= 0) return x.length ? x[0] : 0;
    if (p >= x.length - 1) return 0;
    var i = p | 0, f = p - i;
    return x[i] * (1 - f) + x[i + 1] * f;
  }

  /* Plain speed change: pitch and duration move together, like a tape. Used on
     its own for the "tape" control, and as the reader inside each grain. */
  function resample(x, ratio) {
    if (!isNum(ratio) || ratio <= 0) return x.slice ? x.slice() : new Float32Array(x);
    var n = Math.max(1, Math.round(x.length / ratio));
    var out = new Float32Array(n);
    for (var i = 0; i < n; i++) out[i] = at(x, i * ratio);
    return out;
  }

  function semitonesToRatio(st) { return Math.pow(2, (isNum(st) ? st : 0) / 12); }

  /* ---- the pitch shift --------------------------------------------------- */

  /* Same length out as in; pitch multiplied by 2^(semitones/12). See the file
     header for why it is grains rather than one long resample.

     The alignment search is what stops it sounding like a cheap toy. Laying
     each grain down at exactly its nominal position means the waveform arrives
     at a random point in its cycle each time, and where two overlapping grains
     disagree about which way the wave is going they cancel — heard as a
     warble, or on a sustained note as a hollow flutter. So before writing a
     grain, the read position is nudged up to half a hop either way to find
     where it best AGREES with what has already been written. Timing moves by
     up to eleven milliseconds, which nobody can hear; the cancellation goes
     away, which everybody can. */
  function shift(x, semitones) {
    var ratio = semitonesToRatio(semitones);
    if (!x.length || Math.abs(ratio - 1) < 1e-6) return new Float32Array(x);

    var L = Math.min(GRAIN, Math.max(64, x.length));
    var hop = Math.max(1, Math.round(L / OVERLAP));
    var out = new Float32Array(x.length);
    var weight = new Float32Array(x.length);

    /* Raised cosine, built once. Rebuilding it per grain is the difference
       between this taking 8ms and taking 400ms on a long clip. */
    var win = new Float32Array(L);
    for (var j = 0; j < L; j++) win[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / L);

    /* How far the search may slide, and how coarsely it looks. Every fourth
       lag and every fourth sample is plenty to find the right cycle of a human
       voice, and it is sixteen times less arithmetic than looking at all of
       them — the difference between a two minute clip taking one second and
       taking fifteen. */
    var K = hop >= 32 ? (hop >> 1) : 0;
    var STEP = 4, LAG = 4;

    for (var start = 0, first = true; start < x.length; start += hop, first = false) {
      var read = start;

      if (!first && K) {
        var bestScore = -Infinity, bestRead = start;
        for (var lag = -K; lag <= K; lag += LAG) {
          var cand = start + lag;
          if (cand < 0) continue;
          var score = 0;
          /* Against the overlap region only — the part where this grain and
             the ones already written have to agree. */
          for (var m = 0; m < hop; m += STEP) {
            var o2 = start + m;
            if (o2 >= out.length) break;
            score += at(x, cand + m * ratio) * out[o2];
          }
          if (score > bestScore) { bestScore = score; bestRead = cand; }
        }
        read = bestRead;
      }

      for (var k = 0; k < L; k++) {
        var o = start + k;
        if (o >= out.length) break;
        /* Read position advances by `ratio` per output sample: that is the
           whole pitch change. The grain still LANDS at `start`, which is why
           the timing survives. */
        out[o] += at(x, read + k * ratio) * win[k];
        weight[o] += win[k];
      }
    }

    /* Divide by how much window actually landed on each sample. In the middle
       this is a constant and the division is a formality; at the two ends it
       is not, and skipping it is what gives these things a fade-in nobody
       asked for. */
    for (var i = 0; i < out.length; i++) if (weight[i] > 1e-6) out[i] /= weight[i];
    return out;
  }

  /* ---- filters ----------------------------------------------------------- */

  /* One biquad section, run forwards. The coefficients come from the standard
     RBJ cookbook formulas below. */
  function biquad(x, b0, b1, b2, a1, a2) {
    var y = new Float32Array(x.length);
    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (var i = 0; i < x.length; i++) {
      var v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
      y[i] = v;
    }
    return y;
  }

  function lowpass(x, sr, f, q) {
    f = Math.max(20, Math.min(sr / 2 - 100, f)); q = q || 0.707;
    var w = 2 * Math.PI * f / sr, c = Math.cos(w), a = Math.sin(w) / (2 * q);
    var a0 = 1 + a;
    return biquad(x, (1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0,
                  -2 * c / a0, (1 - a) / a0);
  }

  function highpass(x, sr, f, q) {
    f = Math.max(20, Math.min(sr / 2 - 100, f)); q = q || 0.707;
    var w = 2 * Math.PI * f / sr, c = Math.cos(w), a = Math.sin(w) / (2 * q);
    var a0 = 1 + a;
    return biquad(x, (1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0,
                  -2 * c / a0, (1 - a) / a0);
  }

  /* A telephone, a walkie-talkie and a tannoy are all mostly this: throw away
     everything below a few hundred hertz and above three or four thousand. */
  function band(x, sr, lo, hi) {
    return lowpass(highpass(x, sr, lo), sr, hi);
  }

  /* ---- colour ------------------------------------------------------------ */

  /* Multiplying by a steady tone. It is the oldest robot voice there is —
     Doctor Who did it with a ring modulator in 1963 — and it still works
     because it scatters the voice's harmonics onto sum and difference
     frequencies that no throat could produce. */
  function ringMod(x, sr, hz, mix) {
    mix = mix == null ? 1 : Math.max(0, Math.min(1, mix));
    var out = new Float32Array(x.length);
    var w = 2 * Math.PI * hz / sr;
    for (var i = 0; i < x.length; i++)
      out[i] = x[i] * (1 - mix) + x[i] * Math.sin(w * i) * mix;
    return out;
  }

  /* Soft saturation. tanh rather than a hard clip because a hard clip past
     about a third of the way in stops sounding like loudness and starts
     sounding like a broken speaker. */
  function drive(x, amount) {
    var a = Math.max(0, isNum(amount) ? amount : 0);
    if (!a) return new Float32Array(x);
    var out = new Float32Array(x.length), k = 1 + a * 9;
    var norm = Math.tanh(k);
    for (var i = 0; i < x.length; i++) out[i] = Math.tanh(x[i] * k) / norm;
    return out;
  }

  /* A room. Repeats fading into each other — not a real reverb, which needs a
     recorded impulse, but the right shape for a cave or a big hall. */
  function echo(x, sr, delaySec, feedback, mix) {
    var d = Math.max(1, Math.round((delaySec || 0.2) * sr));
    var fb = Math.max(0, Math.min(0.85, feedback == null ? 0.35 : feedback));
    var m = Math.max(0, Math.min(1, mix == null ? 0.35 : mix));
    /* Long enough to let the tail finish rather than cutting it off mid-decay. */
    var tail = fb > 0.01 ? Math.ceil(Math.log(0.001) / Math.log(fb)) * d : 0;
    var out = new Float32Array(x.length + Math.min(tail, sr * 4));
    for (var i = 0; i < out.length; i++) {
      var dry = i < x.length ? x[i] : 0;
      var back = i >= d ? out[i - d] * fb : 0;
      out[i] = dry + back;
    }
    /* Mix against the dry signal, keeping the tail. */
    var res = new Float32Array(out.length);
    for (var j = 0; j < out.length; j++) {
      var s = j < x.length ? x[j] : 0;
      res[j] = s * (1 - m) + out[j] * m;
    }
    return res;
  }

  /* Bring the loudest moment up to `peak` without touching anything else.
     Guards the divide, so a silent clip stays silent instead of becoming a
     buffer of NaN. */
  function normalize(x, peak) {
    peak = peak == null ? 0.89 : peak;
    var max = 0;
    for (var i = 0; i < x.length; i++) { var v = Math.abs(x[i]); if (v > max) max = v; }
    if (max < 1e-6) return new Float32Array(x);
    var g = peak / max;
    var out = new Float32Array(x.length);
    for (var j = 0; j < x.length; j++) out[j] = x[j] * g;
    return out;
  }

  /* ---- the voices -------------------------------------------------------- */

  /* Each is a plain description rather than code, so the panel can list them,
     a test can walk all of them, and adding one is a line rather than a
     function. `pitch` is in semitones; twelve is an octave. */
  var PRESETS = [
    { id: 'chipmunk', name: 'Chipmunk',   about: 'Small and fast',            pitch: 7 },
    { id: 'squeaky',  name: 'Squeaky',    about: 'A whole octave up',         pitch: 12 },
    { id: 'kid',      name: 'Little kid', about: 'Just younger',              pitch: 4 },
    { id: 'deep',     name: 'Deep',       about: 'Lower, still you',          pitch: -5 },
    { id: 'monster',  name: 'Monster',    about: 'Low and growling',          pitch: -9, drive: 0.35 },
    { id: 'giant',    name: 'Giant',      about: 'Low, in a big room',        pitch: -7, echo: { time: 0.13, fb: 0.35, mix: 0.3 } },
    { id: 'robot',    name: 'Robot',      about: 'Ring modulated, like a Dalek', ring: 55, ringMix: 0.85, band: [200, 4000] },
    { id: 'alien',    name: 'Alien',      about: 'Higher and metallic',       pitch: 3, ring: 175, ringMix: 0.6 },
    { id: 'radio',    name: 'Radio',      about: 'Through a small speaker',   band: [380, 3200], drive: 0.3 },
    { id: 'megaphone',name: 'Megaphone',  about: 'Shouted through a cone',    band: [520, 3500], drive: 0.6, echo: { time: 0.06, fb: 0.22, mix: 0.25 } },
    { id: 'phone',    name: 'Phone call', about: 'Like a call recording',     band: [300, 3400] },
    { id: 'cave',     name: 'Cave',       about: 'Big empty space',           echo: { time: 0.22, fb: 0.5, mix: 0.42 } },
    { id: 'ghost',    name: 'Ghost',      about: 'Low, hollow, trailing',     pitch: -3, echo: { time: 0.31, fb: 0.55, mix: 0.5 }, band: [180, 3000] }
  ];

  function preset(id) {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
    return null;
  }

  /* Runs one voice over one channel. Order matters and is the order a real
     signal chain would be in: change the voice, colour it, put it in a room,
     then set the level. Filtering before the pitch shift would filter the
     wrong frequencies, because the shift is about to move them. */
  function apply(x, sampleRate, id, tweaks) {
    tweaks = tweaks || {};
    var p = preset(id) || {};
    var pitch = tweaks.pitch == null ? (p.pitch || 0) : tweaks.pitch;
    var y = new Float32Array(x);

    if (pitch) y = shift(y, pitch);
    if (p.band) y = band(y, sampleRate, p.band[0], p.band[1]);
    if (p.ring) y = ringMod(y, sampleRate, p.ring, p.ringMix);
    if (p.drive) y = drive(y, p.drive);
    if (p.echo) y = echo(y, sampleRate, p.echo.time, p.echo.fb, p.echo.mix);
    if (tweaks.normalize !== false) y = normalize(y);
    return y;
  }

  /* ---- writing a file ---------------------------------------------------- */

  /* 16-bit PCM in a WAV wrapper. Deliberately not MediaRecorder: that encodes
     in real time — thirty seconds of audio takes thirty seconds — and gives a
     different result on every browser. This is instant, exact, and the same
     everywhere. WAV is fat, but the file never leaves the machine. */
  function wav(channels, sampleRate) {
    var chans = channels.length, len = channels[0].length;
    var bytes = len * chans * 2;
    var buf = new ArrayBuffer(44 + bytes);
    var v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + bytes, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);                       // PCM
    v.setUint16(22, chans, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * chans * 2, true);  // byte rate
    v.setUint16(32, chans * 2, true);               // block align
    v.setUint16(34, 16, true);                      // bits
    str(36, 'data'); v.setUint32(40, bytes, true);
    var o = 44;
    for (var i = 0; i < len; i++) {
      for (var c = 0; c < chans; c++) {
        var s = Math.max(-1, Math.min(1, channels[c][i]));
        /* Asymmetric on purpose: -1 maps to -32768 and +1 to 32767, which is
           what the format's range actually is. */
        v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        o += 2;
      }
    }
    return buf;
  }

  G.NCVoice = {
    resample: resample, shift: shift, ringMod: ringMod, drive: drive,
    echo: echo, band: band, lowpass: lowpass, highpass: highpass,
    normalize: normalize, apply: apply, wav: wav,
    PRESETS: PRESETS, preset: preset,
    limits: { maxSeconds: MAX_SECONDS, grain: GRAIN }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = G.NCVoice;

  /* ==========================================================================
     THE PANEL
     ==========================================================================
     Outside the editor bundle, like every other tool here, because the bundle
     is a 397 kB compiled file and adding a button to it means re-pasting the
     whole thing.
     ========================================================================== */
  if (typeof document === 'undefined') return;

  var V = G.NCVoice;
  var ui = null, srcBuf = null, srcName = '', outBlob = null, outUrl = '';
  var chosen = 'chipmunk', mediaRec = null, recChunks = [], recStream = null;
  var ac = null;

  function $(id) { return document.getElementById(id); }
  function audioCtx() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    return ac;
  }
  function say(kind, html) {
    var n = $('ncVcSay'); if (!n) return;
    n.className = 'ncvc-say ' + kind; n.innerHTML = html;
  }

  var CSS = [
    '#ncvc{position:fixed;inset:0;z-index:100000;background:rgba(3,8,14,.86);',
    'backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:16px}',
    '#ncvc.on{display:flex}',
    '#ncvc .box{position:relative}',
    '#ncvc .ncvc-x{position:absolute;top:10px;right:10px;width:40px;height:40px;padding:0;',
    'display:grid;place-items:center;font-size:24px;line-height:1;border-radius:11px;cursor:pointer;',
    'background:rgba(255,255,255,.06);border:1px solid #17324a;color:#dbeafe;z-index:2}',
    '#ncvc .ncvc-x:hover{background:rgba(255,255,255,.13);color:#fff}',
    '#ncvc h2{padding-right:46px}',
    '#ncvc .box{background:#0b1622;border:1px solid #17324a;border-radius:16px;',
    'max-width:760px;width:100%;max-height:92vh;overflow:auto;padding:22px;color:#dbeafe;',
    'font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
    '#ncvc h2{margin:0 0 6px;font-size:22px;color:#fff}',
    '#ncvc .lede{margin:0 0 18px;color:#93b4cc}',
    '#ncvc .step{border:1px solid #17324a;border-radius:12px;padding:14px;margin-bottom:14px}',
    '#ncvc .step h3{margin:0 0 10px;font-size:15px;color:#cfe6ff;display:flex;gap:8px;align-items:center}',
    '#ncvc .num{background:#00E5FF;color:#04212b;border-radius:999px;width:22px;height:22px;',
    'display:inline-grid;place-items:center;font-weight:700;font-size:12px;flex:none}',
    '#ncvc button{font:inherit;border-radius:9px;padding:9px 14px;cursor:pointer;border:1px solid #1d3f5c;',
    'background:#122a3e;color:#dbeafe}',
    '#ncvc button:disabled{opacity:.45;cursor:default}',
    '#ncvc button.go{background:linear-gradient(90deg,#5b8cff,#a06bff);border:0;color:#fff;font-weight:600}',
    '#ncvc .voices{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}',
    '#ncvc .v{text-align:left;line-height:1.25}',
    '#ncvc .v b{display:block;font-size:13px}',
    '#ncvc .v span{color:#8fb0c8;font-size:11px}',
    '#ncvc .v.sel{outline:2px solid #00E5FF;background:#12384a}',
    '#ncvc .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}',
    '#ncvc label{display:block;margin:10px 0 4px;color:#9fc0d8;font-size:12px}',
    '#ncvc input[type=range]{width:100%}',
    '#ncvc .ncvc-say{margin-top:12px;padding:10px 12px;border-radius:9px;font-size:13px}',
    '#ncvc .ncvc-say.ok{background:#0d2f24;border:1px solid #1c6b4f;color:#b6f2d8}',
    '#ncvc .ncvc-say.no{background:#3a1420;border:1px solid #7d2540;color:#ffc7d4}',
    '#ncvc .ncvc-say.info{background:#0e2438;border:1px solid #1d4a6e;color:#bcdcf5}',
    '#ncvc audio{width:100%;margin-top:10px}',
    '@media (max-width:520px){#ncvc .box{padding:15px}#ncvc .voices{grid-template-columns:1fr 1fr}}',
    /* Light mode. nova.js puts data-theme on <html>, and a panel that stays
       dark when the rest of the site turns white is the exact complaint that
       came in about the editor once already. */
    'html[data-theme="light"] #ncvc{background:rgba(238,243,249,.88)}',
    'html[data-theme="light"] #ncvc .box{background:#fff;border-color:#dbe4ee;color:#16233a}',
    'html[data-theme="light"] #ncvc h2{color:#0b1220}',
    'html[data-theme="light"] #ncvc .lede,html[data-theme="light"] #ncvc label{color:#54697f}',
    'html[data-theme="light"] #ncvc .step{border-color:#e3eaf3}',
    'html[data-theme="light"] #ncvc .step h3{color:#1c2b40}',
    'html[data-theme="light"] #ncvc button{background:#eef3f9;border-color:#cfdbe8;color:#17263b}',
    'html[data-theme="light"] #ncvc button.go{color:#fff}',
    'html[data-theme="light"] #ncvc .v span{color:#5c6f85}',
    'html[data-theme="light"] #ncvc .v.sel{background:#dff3fb}',
    'html[data-theme="light"] #ncvc select{background:#fff;color:#17263b;border-color:#cfdbe8}',
    'html[data-theme="light"] #ncvc .ncvc-say.ok{background:#e6f7ef;border-color:#7fcaa8;color:#0d5138}',
    'html[data-theme="light"] #ncvc .ncvc-say.no{background:#fdeaf0;border-color:#e39ab0;color:#7d1533}',
    'html[data-theme="light"] #ncvc .ncvc-say.info{background:#e8f1fb;border-color:#9dc2e4;color:#12385d}'
  ].join('');

  function build() {
    var st = document.createElement('style'); st.textContent = CSS;
    document.head.appendChild(st);

    ui = document.createElement('div');
    ui.id = 'ncvc';
    ui.innerHTML =
      '<div class="box">' +
        /* Same exit as Record yourself, for the same reason: this panel takes
           the whole screen, and a Close button at the far end of a long form
           is not a door anybody sees. */
        '<button id="ncVcX" class="ncvc-x" type="button" aria-label="Close and go back to the editor" title="Back to the editor">&times;</button>' +
        '<h2>Voice changer</h2>' +
        '<p class="lede">Pick a clip that has sound, or record a new line. ' +
        'It is changed on this device — nothing is uploaded, and it works offline.</p>' +

        '<div class="step"><h3><i class="num">1</i> The sound</h3>' +
          '<div class="row">' +
            '<select id="ncVcClip" style="flex:1;min-width:180px;padding:8px;border-radius:8px;' +
            'background:#0d1f2e;color:#dbeafe;border:1px solid #1d3f5c"></select>' +
            '<button id="ncVcUse">Use this</button>' +
          '</div>' +
          '<div class="row"><button id="ncVcRec">Record a line</button>' +
          '<input type="file" id="ncVcFile" accept="audio/*,video/*" style="flex:1;min-width:150px"></div>' +
        '</div>' +

        '<div class="step"><h3><i class="num">2</i> The voice</h3>' +
          '<div class="voices" id="ncVcVoices"></div>' +
          '<label>Extra pitch <span id="ncVcPitchN">0</span> semitones</label>' +
          '<input type="range" id="ncVcPitch" min="-12" max="12" step="1" value="0">' +
        '</div>' +

        '<div class="step"><h3><i class="num">3</i> Hear it, then keep it</h3>' +
          '<div class="row">' +
            '<button class="go" id="ncVcGo" disabled>Change the voice</button>' +
            '<button id="ncVcAdd" disabled>Add to the timeline</button>' +
            '<button id="ncVcClose">Close</button>' +
          '</div>' +
          '<audio id="ncVcOut" controls style="display:none"></audio>' +
        '</div>' +

        '<div class="ncvc-say info" id="ncVcSay">Pick something with sound in it.</div>' +
      '</div>';
    document.body.appendChild(ui);
    wire();
  }

  /* Every asset the project has that could carry audio. Video counts: a phone
     clip's audio track decodes exactly the same way. */
  function soundAssets() {
    var s = window.__ncStore && window.__ncStore.getState();
    if (!s) return [];
    return (s.assets || []).filter(function (a) {
      return a && a.url && (a.kind === 'audio' || a.kind === 'video');
    });
  }

  function fillClips() {
    var sel = $('ncVcClip'); if (!sel) return;
    var list = soundAssets();
    sel.innerHTML = list.length
      ? list.map(function (a, i) {
          return '<option value="' + i + '">' + String(a.name || 'Clip ' + (i + 1))
            .replace(/[<>&]/g, '') + '</option>';
        }).join('')
      : '<option value="">Nothing in the project has sound yet</option>';
    $('ncVcUse').disabled = !list.length;
  }

  function fillVoices() {
    var box = $('ncVcVoices');
    box.innerHTML = V.PRESETS.map(function (p) {
      return '<button class="v' + (p.id === chosen ? ' sel' : '') + '" data-v="' + p.id + '">' +
        '<b>' + p.name + '</b><span>' + p.about + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('[data-v]'), function (b) {
      b.onclick = function () {
        chosen = b.getAttribute('data-v');
        fillVoices();
        if (srcBuf) $('ncVcGo').disabled = false;
      };
    });
  }

  function loadFrom(url, name) {
    say('info', 'Reading the sound…');
    return fetch(url).then(function (r) { return r.arrayBuffer(); })
      .then(function (ab) { return audioCtx().decodeAudioData(ab); })
      .then(function (buf) {
        if (buf.duration > V.limits.maxSeconds)
          say('info', '<b>Long clip.</b> Only the first ' + V.limits.maxSeconds +
            ' seconds will be changed.');
        srcBuf = buf; srcName = name || 'clip';
        $('ncVcGo').disabled = false;
        say('ok', '<b>Ready.</b> ' + buf.duration.toFixed(1) + 's of sound from <b>' +
          srcName.replace(/[<>&]/g, '') + '</b>. Pick a voice and press <b>Change the voice</b>.');
      })
      .catch(function () {
        srcBuf = null; $('ncVcGo').disabled = true;
        say('no', '<b>That would not decode.</b> If it is a video, the browser may not be ' +
          'able to read its audio track — try exporting the audio first, or record a line instead.');
      });
  }

  function run() {
    if (!srcBuf) return;
    var sr = srcBuf.sampleRate;
    var cap = Math.min(srcBuf.length, Math.floor(V.limits.maxSeconds * sr));
    var chans = [];
    var extra = +$('ncVcPitch').value || 0;
    var p = V.preset(chosen) || {};

    say('info', 'Changing it…');
    $('ncVcGo').disabled = true;

    /* Out to the next turn of the event loop before the arithmetic starts, so
       the "Changing it" actually paints. A few seconds of audio is tens of
       millions of multiplies and it all happens in one go. */
    setTimeout(function () {
      try {
        for (var c = 0; c < srcBuf.numberOfChannels; c++) {
          var raw = srcBuf.getChannelData(c).subarray(0, cap);
          chans.push(V.apply(raw, sr, chosen, { pitch: (p.pitch || 0) + extra }));
        }
        /* Effects with a tail make the channels different lengths if they are
           processed independently; pad to the longest so the file is square. */
        var len = chans.reduce(function (m, a) { return Math.max(m, a.length); }, 0);
        chans = chans.map(function (a) {
          if (a.length === len) return a;
          var b = new Float32Array(len); b.set(a); return b;
        });

        outBlob = new Blob([V.wav(chans, sr)], { type: 'audio/wav' });
        if (outUrl) URL.revokeObjectURL(outUrl);
        outUrl = URL.createObjectURL(outBlob);
        var au = $('ncVcOut');
        au.src = outUrl; au.style.display = 'block';
        $('ncVcAdd').disabled = false;
        $('ncVcGo').disabled = false;
        say('ok', '<b>Done.</b> Have a listen. If it is right, <b>Add to the timeline</b>.');
        au.play().catch(function () {});
      } catch (e) {
        $('ncVcGo').disabled = false;
        say('no', '<b>That did not work.</b> ' + (e && e.message ? e.message : ''));
      }
    }, 30);
  }

  function addToProject() {
    if (!outBlob) return;
    var s = window.__ncStore && window.__ncStore.getState();
    if (!s || !s.addAssets) {
      var a = document.createElement('a');
      a.href = outUrl; a.download = 'voice.wav'; a.click();
      say('ok', '<b>Saved to your downloads.</b> The editor was not reachable.');
      return;
    }
    var name = (V.preset(chosen) || {}).name || 'Voice';
    var id = 'asset-voice-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    /* An asset RECORD, not the Blob. Handing this action a raw file is what
       blanked the editor once already. */
    s.addAssets([{
      id: id, name: name + ' — ' + srcName.replace(/\.[a-z0-9]+$/i, ''),
      kind: 'audio', url: outUrl,
      duration: srcBuf ? Math.min(srcBuf.duration, V.limits.maxSeconds) : 0,
      width: 0, height: 0, thumbnail: '', createdAt: Date.now()
    }]);
    /* Straight onto an audio track at the playhead, so it can be heard in
       place rather than found in a list and dragged. */
    try {
      var st = window.__ncStore.getState();
      var track = (st.tracks || []).filter(function (t) { return t.kind === 'audio'; })[0];
      if (track && st.addClipFromAsset) st.addClipFromAsset(id, track.id, st.playhead || 0);
    } catch (e) {}
    say('ok', '<b>On the timeline.</b> It is on the audio track at the playhead.');
  }

  /* ---- recording a line -------------------------------------------------- */
  function toggleRecord() {
    var btn = $('ncVcRec');
    if (mediaRec) {
      try { mediaRec.stop(); } catch (e) {}
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      recStream = stream; recChunks = [];
      var type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0];
      mediaRec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      mediaRec.ondataavailable = function (e) { if (e.data.size) recChunks.push(e.data); };
      mediaRec.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(recChunks, { type: recChunks[0] ? recChunks[0].type : 'audio/webm' });
        mediaRec = null; recStream = null;
        btn.textContent = 'Record a line';
        loadFrom(URL.createObjectURL(blob), 'my recording');
      };
      mediaRec.start();
      btn.textContent = 'Stop recording';
      say('info', '<b>Recording.</b> Say your line, then press <b>Stop recording</b>.');
    }).catch(function () {
      say('no', '<b>No microphone.</b> The browser refused, or there is nothing to record with. ' +
        'Check the microphone permission for this site in the address bar.');
    });
  }

  function wire() {
    fillVoices();
    fillClips();

    $('ncVcPitch').oninput = function () {
      $('ncVcPitchN').textContent = (this.value > 0 ? '+' : '') + this.value;
    };
    $('ncVcUse').onclick = function () {
      var list = soundAssets(), i = +$('ncVcClip').value;
      if (list[i]) loadFrom(list[i].url, list[i].name || 'clip');
    };
    $('ncVcFile').onchange = function () {
      var f = this.files && this.files[0];
      if (f) loadFrom(URL.createObjectURL(f), f.name);
    };
    $('ncVcRec').onclick = toggleRecord;
    $('ncVcGo').onclick = run;
    $('ncVcAdd').onclick = addToProject;
    $('ncVcClose').onclick = close;
    $('ncVcX').onclick = close;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ui && ui.classList.contains('on')) { e.stopPropagation(); close(); }
    }, true);
    ui.onclick = function (e) { if (e.target === ui) close(); };
  }

  function close() {
    if (mediaRec) { try { mediaRec.stop(); } catch (e) {} }
    if (recStream) recStream.getTracks().forEach(function (t) { t.stop(); });
    var au = $('ncVcOut'); if (au) au.pause();
    ui.classList.remove('on');
  }

  G.__ncOpenVoice = function () {
    if (!ui) build();
    fillClips();
    ui.classList.add('on');
  };

  /* A button of its own only when the editor's rail has not claimed it, same
     rule the other tools follow. */
  if (!window.__ncRailTools) {
    var btn = document.createElement('button');
    btn.textContent = '🎤 Voice changer';
    btn.style.cssText = 'position:fixed;left:14px;bottom:120px;z-index:99998;padding:9px 13px;' +
      'border-radius:10px;border:1px solid #1d3f5c;background:#122a3e;color:#dbeafe;cursor:pointer';
    btn.onclick = function () { G.__ncOpenVoice(); };
    if (document.readyState === 'loading')
      addEventListener('DOMContentLoaded', function () { document.body.appendChild(btn); });
    else document.body.appendChild(btn);
  }
})();
