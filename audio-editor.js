/* ============================================================================
   NOVACLIP AUDIO EDITOR  —  a waveform, a selection, and the eight edits
   ============================================================================
   WHAT THIS IS

   Asked for as "an audio editor simple as audiomass.co": open a sound, see it,
   drag across the bit you mean, and cut it. Not a DAW — no tracks, no
   automation, no plugins. One file, one waveform, one selection.

   WHY IT IS A NEW FILE AND NOT A TAB IN ONE OF THE THREE THAT EXIST

   voice-changer.js, mixer.js and beats.js all already touch audio, and none of
   them is this. All three work on a clip that is ALREADY IN A PROJECT — they
   hang a Web Audio graph off the editor's own <audio> element and shape what
   comes out. Nothing in the site lets you open a loose .mp3, look at it, and
   change the samples. That is a different job: it owns the buffer rather than
   filtering a stream, and every edit here rewrites the actual numbers.

   NOTHING LEAVES THE DEVICE, AND THERE IS NOTHING TO DEPLOY

   decodeAudioData, some arithmetic over Float32Arrays, and a WAV written by
   hand at the end. No worker, no key, no upload, no network call of any kind —
   which is also why it works with the wifi off. privacy.html needs no new row
   for this, because there is no row to add.

   THE UNDO STACK IS CAPPED, DELIBERATELY

   Every edit here produces a whole new AudioBuffer, and a stereo minute at
   48kHz is about 23MB of Float32. An unbounded undo stack on a ten-minute
   podcast is how a browser tab gets killed, so the stack holds a fixed number
   of steps and drops the oldest. The count is low on purpose and the cost is
   stated where it is set.

   GOES WITH: trends-nav.js (the rail row and the #/audio route), trends.html
   (loads this), sw.js (cache bump). ai-worker.js is untouched — nothing here
   asks anybody anything.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_AUDIO_ED) return;

  /* Eight steps of undo. A stereo minute at 48kHz is ~23MB, so eight of those
     is already ~184MB on a long file — low enough to survive a phone, high
     enough that nobody loses work they were actually thinking about. */
  var UNDO_MAX = 8;

  var BOX = null, ctx = null;
  var S = {
    buf: null,          /* the AudioBuffer being edited */
    name: '',
    sel: null,          /* { a, b } in samples, a <= b */
    play: null,         /* the running source node */
    playFrom: 0, playAt: 0,
    zoom: 1, scroll: 0, /* zoom 1 = whole file in view */
    undo: [], redo: [],
    busy: '', err: ''
  };

  function t(key, fallback) {
    try {
      if (typeof window.tr === 'function') { var v = window.tr(key); if (v) return v; }
    } catch (e) {}
    return fallback;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function clock(sec) {
    sec = Math.max(0, sec || 0);
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2);
  }
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  /* -------------------------------------------------------------------------
     BUFFER HELPERS
     Every edit builds a new buffer rather than mutating the old one, which is
     what makes undo a matter of keeping the reference.
     ----------------------------------------------------------------------- */
  function makeBuf(chans, len, rate) {
    return audio().createBuffer(Math.max(1, chans), Math.max(1, len), rate);
  }
  function copyRange(src, a, b) {
    var len = Math.max(0, b - a);
    var out = makeBuf(src.numberOfChannels, len || 1, src.sampleRate);
    for (var c = 0; c < src.numberOfChannels; c++) {
      out.getChannelData(c).set(src.getChannelData(c).subarray(a, b));
    }
    return out;
  }
  function concat(parts, chans, rate) {
    var len = 0, i, c;
    for (i = 0; i < parts.length; i++) len += parts[i].length;
    var out = makeBuf(chans, len || 1, rate);
    for (c = 0; c < chans; c++) {
      var d = out.getChannelData(c), at = 0;
      for (i = 0; i < parts.length; i++) {
        var p = parts[i];
        d.set(p.getChannelData(Math.min(c, p.numberOfChannels - 1)), at);
        at += p.length;
      }
    }
    return out;
  }

  function push(next) {
    if (S.buf) {
      S.undo.push(S.buf);
      if (S.undo.length > UNDO_MAX) S.undo.shift();
    }
    S.redo.length = 0;
    S.buf = next;
    clampSel();
  }
  function clampSel() {
    if (!S.sel || !S.buf) { S.sel = null; return; }
    var n = S.buf.length;
    S.sel.a = Math.max(0, Math.min(n, S.sel.a));
    S.sel.b = Math.max(0, Math.min(n, S.sel.b));
    if (S.sel.b - S.sel.a < 2) S.sel = null;
  }
  function selOrAll() {
    if (!S.buf) return null;
    return S.sel ? { a: S.sel.a, b: S.sel.b } : { a: 0, b: S.buf.length };
  }

  /* -------------------------------------------------------------------------
     THE EDITS
     ----------------------------------------------------------------------- */
  var CLIP = null;   /* the clipboard, an AudioBuffer */

  function doCut()  { CLIP = copyRange(S.buf, S.sel.a, S.sel.b); doDelete(); }
  function doCopy() { CLIP = copyRange(S.buf, S.sel.a, S.sel.b); flashMsg('copied'); }
  function doDelete() {
    var r = S.sel;
    push(concat([copyRange(S.buf, 0, r.a), copyRange(S.buf, r.b, S.buf.length)],
                S.buf.numberOfChannels, S.buf.sampleRate));
    S.sel = null;
  }
  function doTrim() {
    var r = S.sel;
    push(copyRange(S.buf, r.a, r.b));
    S.sel = null;
  }
  function doPaste() {
    if (!CLIP) return;
    var at = S.sel ? S.sel.a : S.buf.length;
    push(concat([copyRange(S.buf, 0, at), CLIP, copyRange(S.buf, at, S.buf.length)],
                S.buf.numberOfChannels, S.buf.sampleRate));
  }
  function doSilence() {
    var r = selOrAll(), out = copyRange(S.buf, 0, S.buf.length);
    for (var c = 0; c < out.numberOfChannels; c++) out.getChannelData(c).fill(0, r.a, r.b);
    push(out);
  }
  function doReverse() {
    var r = selOrAll(), out = copyRange(S.buf, 0, S.buf.length);
    for (var c = 0; c < out.numberOfChannels; c++) {
      var d = out.getChannelData(c);
      for (var i = r.a, j = r.b - 1; i < j; i++, j--) { var x = d[i]; d[i] = d[j]; d[j] = x; }
    }
    push(out);
  }
  /* Equal-power rather than linear: a linear fade sounds like it dips in the
     middle, because loudness is not proportional to amplitude. */
  function doFade(into) {
    var r = selOrAll(), out = copyRange(S.buf, 0, S.buf.length);
    var n = r.b - r.a;
    for (var c = 0; c < out.numberOfChannels; c++) {
      var d = out.getChannelData(c);
      for (var i = 0; i < n; i++) {
        var p = n < 2 ? 1 : i / (n - 1);
        d[r.a + i] *= Math.sin((into ? p : 1 - p) * Math.PI / 2);
      }
    }
    push(out);
  }
  function peakOf(buf, a, b) {
    var peak = 0;
    for (var c = 0; c < buf.numberOfChannels; c++) {
      var d = buf.getChannelData(c);
      for (var i = a; i < b; i++) { var v = d[i] < 0 ? -d[i] : d[i]; if (v > peak) peak = v; }
    }
    return peak;
  }
  function doNormalise() {
    var r = selOrAll(), peak = peakOf(S.buf, r.a, r.b);
    if (!peak) { flashMsg('silent'); return; }
    /* To -1dBFS, not to 1.0. Hitting full scale exactly is what clips on
       playback once a codec rounds a sample the wrong way. */
    doGain(0.891 / peak);
  }
  function doGain(mult) {
    var r = selOrAll(), out = copyRange(S.buf, 0, S.buf.length);
    for (var c = 0; c < out.numberOfChannels; c++) {
      var d = out.getChannelData(c);
      for (var i = r.a; i < r.b; i++) {
        var v = d[i] * mult;
        d[i] = v > 1 ? 1 : v < -1 ? -1 : v;
      }
    }
    push(out);
  }

  function undo() {
    if (!S.undo.length) return;
    S.redo.push(S.buf);
    S.buf = S.undo.pop();
    clampSel(); draw(); paintBar();
  }
  function redo() {
    if (!S.redo.length) return;
    S.undo.push(S.buf);
    S.buf = S.redo.pop();
    clampSel(); draw(); paintBar();
  }

  /* -------------------------------------------------------------------------
     WAV OUT
     16-bit PCM, written by hand. The browser can decode a dozen formats and
     encode none of them, so this is the one way out that needs no library.
     ----------------------------------------------------------------------- */
  function toWav(buf) {
    var chans = buf.numberOfChannels, len = buf.length, rate = buf.sampleRate;
    var bytes = 44 + len * chans * 2;
    var ab = new ArrayBuffer(bytes), v = new DataView(ab), p = 0;
    function str(s) { for (var i = 0; i < s.length; i++) v.setUint8(p++, s.charCodeAt(i)); }
    function u32(n) { v.setUint32(p, n, true); p += 4; }
    function u16(n) { v.setUint16(p, n, true); p += 2; }
    str('RIFF'); u32(bytes - 8); str('WAVE');
    str('fmt '); u32(16); u16(1); u16(chans); u32(rate);
    u32(rate * chans * 2); u16(chans * 2); u16(16);
    str('data'); u32(len * chans * 2);
    var data = [];
    for (var c = 0; c < chans; c++) data.push(buf.getChannelData(c));
    for (var i = 0; i < len; i++) {
      for (var c2 = 0; c2 < chans; c2++) {
        var x = data[c2][i];
        x = x > 1 ? 1 : x < -1 ? -1 : x;
        v.setInt16(p, x < 0 ? x * 0x8000 : x * 0x7FFF, true); p += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }
  function save() {
    if (!S.buf) return;
    var url = URL.createObjectURL(toWav(S.buf));
    var a = document.createElement('a');
    a.href = url;
    /* "-edited" so it does not land in Downloads under the same name as the
       file it came from. Opening tone.wav, cutting it and saving produced
       tone.wav, which is the original quietly replaced. */
    a.download = (S.name.replace(/\.[^.]+$/, '') || 'novaclip-audio') + '-edited.wav';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* -------------------------------------------------------------------------
     PLAYBACK
     ----------------------------------------------------------------------- */
  function stop() {
    if (S.play) { try { S.play.stop(); } catch (e) {} S.play = null; }
    paintBar();
  }
  function play(fromSel) {
    if (!S.buf) return;
    stop();
    var a = 0, b = S.buf.length;
    if (fromSel && S.sel) { a = S.sel.a; b = S.sel.b; }
    var src = audio().createBufferSource();
    src.buffer = S.buf;
    src.connect(ctx.destination);
    src.onended = function () { if (S.play === src) { S.play = null; paintBar(); } };
    S.playFrom = a / S.buf.sampleRate;
    S.playAt = ctx.currentTime;
    src.start(0, S.playFrom, (b - a) / S.buf.sampleRate);
    S.play = src;
    paintBar();
    tick();
  }
  var raf = 0;
  function tick() {
    cancelAnimationFrame(raf);
    if (!S.play) { draw(); return; }
    draw();
    raf = requestAnimationFrame(tick);
  }
  function playhead() {
    if (!S.play || !ctx) return -1;
    return S.playFrom + (ctx.currentTime - S.playAt);
  }

  /* -------------------------------------------------------------------------
     THE WAVEFORM
     One column of pixels per column of canvas, each drawn from the min and max
     of the samples behind it — which is what makes a transient visible at all.
     Averaging instead of min/max is why some editors draw a flat grey worm.
     ----------------------------------------------------------------------- */
  function view() {
    if (!S.buf) return { a: 0, b: 0 };
    var n = S.buf.length, span = Math.max(16, Math.round(n / S.zoom));
    var a = Math.max(0, Math.min(n - span, Math.round(S.scroll)));
    return { a: a, b: Math.min(n, a + span) };
  }
  function draw() {
    var cv = BOX && BOX.querySelector('.ncaud-wave');
    if (!cv) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(80, cv.clientWidth), h = Math.max(60, cv.clientHeight);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cs = getComputedStyle(cv);
    g.clearRect(0, 0, w, h);
    g.fillStyle = cs.getPropertyValue('--wave-bg') || '#070910';
    g.fillRect(0, 0, w, h);
    if (!S.buf) return;

    var vw = view(), span = vw.b - vw.a;
    var chans = Math.min(2, S.buf.numberOfChannels);
    var lane = h / chans;

    /* The selection, under the wave so the wave stays readable on top. */
    if (S.sel) {
      var sa = (S.sel.a - vw.a) / span * w, sb = (S.sel.b - vw.a) / span * w;
      g.fillStyle = 'rgba(0,240,255,.16)';
      g.fillRect(Math.max(0, sa), 0, Math.min(w, sb) - Math.max(0, sa), h);
    }

    for (var c = 0; c < chans; c++) {
      var d = S.buf.getChannelData(c);
      var mid = lane * c + lane / 2, amp = lane / 2 - 2;
      g.strokeStyle = 'rgba(255,255,255,.14)';
      g.beginPath(); g.moveTo(0, mid); g.lineTo(w, mid); g.stroke();
      g.fillStyle = '#00F0FF';
      for (var x = 0; x < w; x++) {
        var i0 = vw.a + Math.floor(x / w * span);
        var i1 = vw.a + Math.floor((x + 1) / w * span);
        if (i1 <= i0) i1 = i0 + 1;
        var min = 1, max = -1;
        for (var i = i0; i < i1 && i < d.length; i++) {
          var v = d[i];
          if (v < min) min = v;
          if (v > max) max = v;
        }
        if (min > max) { min = 0; max = 0; }
        var y0 = mid - max * amp, y1 = mid - min * amp;
        g.fillRect(x, y0, 1, Math.max(1, y1 - y0));
      }
    }

    var ph = playhead();
    if (ph >= 0) {
      var px = (ph * S.buf.sampleRate - vw.a) / span * w;
      if (px >= 0 && px <= w) {
        g.fillStyle = '#FF2E97';
        g.fillRect(px, 0, 2, h);
      }
    }
  }

  /* -------------------------------------------------------------------------
     LOADING
     ----------------------------------------------------------------------- */
  function load(file) {
    if (!file) return;
    if (!audio()) { S.err = t('st_aud_nosupport', 'This browser has no Web Audio, so sound cannot be opened here.'); paint(); return; }
    S.busy = t('st_aud_opening', 'Opening…'); S.err = ''; paint();
    var fr = new FileReader();
    fr.onerror = function () {
      S.busy = ''; S.err = t('st_aud_noread', 'That file could not be read.'); paint();
    };
    fr.onload = function () {
      ctx.decodeAudioData(fr.result, function (buf) {
        S.busy = ''; S.err = '';
        S.buf = buf; S.name = file.name || '';
        S.undo.length = 0; S.redo.length = 0;
        S.sel = null; S.zoom = 1; S.scroll = 0;
        paint();
      }, function () {
        S.busy = '';
        S.err = t('st_aud_nodecode',
          'That is not a sound this browser can open. MP3, WAV, M4A and OGG all work; ' +
          'some .wma and .aiff files do not.');
        paint();
      });
    };
    fr.readAsArrayBuffer(file);
  }

  /* -------------------------------------------------------------------------
     RENDER
     ----------------------------------------------------------------------- */
  function flashMsg(which) {
    var m = BOX && BOX.querySelector('.ncaud-flash');
    if (!m) return;
    m.textContent = which === 'copied' ? t('st_aud_copied', 'Copied')
                  : which === 'silent' ? t('st_aud_silent', 'That stretch is already silent')
                  : '';
    clearTimeout(m._tm);
    m._tm = setTimeout(function () { m.textContent = ''; }, 1800);
  }

  function paintBar() {
    var bar = BOX && BOX.querySelector('.ncaud-stat');
    if (!bar || !S.buf) return;
    var rate = S.buf.sampleRate;
    var parts = [
      esc(S.name || t('st_aud_untitled', 'Untitled')),
      clock(S.buf.length / rate),
      (S.buf.numberOfChannels > 1 ? t('st_aud_stereo', 'stereo') : t('st_aud_mono', 'mono')),
      Math.round(rate / 100) / 10 + ' kHz'
    ];
    if (S.sel) {
      parts.push('<b>' + t('st_aud_sel', 'Selected') + ' ' +
                 clock((S.sel.b - S.sel.a) / rate) + '</b>');
    }
    bar.innerHTML = parts.join(' · ');
  }

  var BTNS = [
    ['cut',   'st_aud_cut',   'Cut',        function () { doCut(); },   true],
    ['copy',  'st_aud_copy',  'Copy',       function () { doCopy(); },  true],
    ['paste', 'st_aud_paste', 'Paste',      function () { doPaste(); }, false],
    ['del',   'st_aud_del',   'Delete',     function () { doDelete(); }, true],
    ['trim',  'st_aud_trim',  'Trim to it', function () { doTrim(); },  true],
    ['fin',   'st_aud_fin',   'Fade in',    function () { doFade(true); },  false],
    ['fout',  'st_aud_fout',  'Fade out',   function () { doFade(false); }, false],
    ['norm',  'st_aud_norm',  'Normalise',  function () { doNormalise(); }, false],
    ['quiet', 'st_aud_quiet', 'Silence',    function () { doSilence(); },   false],
    ['rev',   'st_aud_rev',   'Reverse',    function () { doReverse(); },   false]
  ];

  function paint() {
    if (!BOX) return;
    var host = BOX.querySelector('.ncaud-body');
    if (!host) return;
    host.innerHTML = '';

    /* ---- open a file ---- */
    var open = el('div', 'ncaud-open');
    var pick = el('button', 'ncaud-go', esc(t('st_aud_open', 'Open a sound')));
    pick.type = 'button';
    var inp = el('input');
    inp.type = 'file';
    inp.accept = 'audio/*';
    inp.style.display = 'none';
    inp.onchange = function () { load(inp.files && inp.files[0]); };
    pick.onclick = function () { inp.click(); };
    open.appendChild(pick); open.appendChild(inp);
    if (S.buf) {
      var dl = el('button', '', esc(t('st_aud_save', 'Save as WAV')));
      dl.type = 'button';
      dl.onclick = save;
      open.appendChild(dl);
    }
    host.appendChild(open);
    host.appendChild(el('div', 'ncaud-hint',
      esc(t('st_aud_hint', 'Everything happens on this device. Nothing is uploaded, nothing is ' +
                           'sent to an AI, and it works with the wifi off.'))));

    if (S.busy) { host.appendChild(el('p', 'ncaud-msg', esc(S.busy))); return; }
    if (S.err) { host.appendChild(el('p', 'ncaud-msg', esc(S.err))); }
    if (!S.buf) return;

    /* ---- transport ---- */
    var tr1 = el('div', 'ncaud-row');
    [[t('st_aud_play', 'Play'), function () { play(false); }],
     [t('st_aud_playsel', 'Play selection'), function () { play(true); }],
     [t('st_aud_stop', 'Stop'), stop]].forEach(function (p) {
      var b = el('button', '', esc(p[0]));
      b.type = 'button';
      b.disabled = (p[0] === t('st_aud_playsel', 'Play selection')) && !S.sel;
      b.onclick = p[1];
      tr1.appendChild(b);
    });
    var zoomIn = el('button', '', '+');
    zoomIn.type = 'button';
    zoomIn.title = t('st_aud_zoomin', 'Zoom in');
    zoomIn.onclick = function () { setZoom(S.zoom * 2); };
    var zoomOut = el('button', '', '−');
    zoomOut.type = 'button';
    zoomOut.title = t('st_aud_zoomout', 'Zoom out');
    zoomOut.onclick = function () { setZoom(S.zoom / 2); };
    var all = el('button', '', esc(t('st_aud_all', 'Select all')));
    all.type = 'button';
    all.onclick = function () { S.sel = { a: 0, b: S.buf.length }; draw(); paintBar(); paint(); };
    var none = el('button', '', esc(t('st_aud_none', 'Clear')));
    none.type = 'button';
    none.onclick = function () { S.sel = null; draw(); paintBar(); paint(); };
    tr1.appendChild(zoomOut); tr1.appendChild(zoomIn);
    tr1.appendChild(all); tr1.appendChild(none);
    host.appendChild(tr1);

    /* ---- the waveform ---- */
    var wrap = el('div', 'ncaud-wrap');
    var cv = document.createElement('canvas');
    cv.className = 'ncaud-wave';
    cv.setAttribute('aria-label', t('st_aud_wavelabel', 'The sound, drawn. Drag across it to select.'));
    wrap.appendChild(cv);
    host.appendChild(wrap);
    wireWave(cv);

    host.appendChild(el('div', 'ncaud-stat'));
    host.appendChild(el('div', 'ncaud-flash'));

    /* ---- the edits ---- */
    var tr2 = el('div', 'ncaud-row');
    BTNS.forEach(function (b) {
      var btn = el('button', '', esc(t(b[1], b[2])));
      btn.type = 'button';
      btn.disabled = (b[4] && !S.sel) || (b[0] === 'paste' && !CLIP);
      btn.onclick = function () { b[3](); draw(); paintBar(); paint(); };
      tr2.appendChild(btn);
    });
    host.appendChild(tr2);

    var tr3 = el('div', 'ncaud-row');
    var u = el('button', '', esc(t('st_aud_undo', 'Undo')));
    u.type = 'button'; u.disabled = !S.undo.length; u.onclick = function () { undo(); paint(); };
    var r = el('button', '', esc(t('st_aud_redo', 'Redo')));
    r.type = 'button'; r.disabled = !S.redo.length; r.onclick = function () { redo(); paint(); };
    tr3.appendChild(u); tr3.appendChild(r);
    host.appendChild(tr3);

    host.appendChild(el('div', 'ncaud-hint',
      esc(t('st_aud_selnote', 'With nothing selected, Fade, Normalise, Silence and Reverse apply ' +
                              'to the whole sound. Cut, Copy, Delete and Trim need a selection.'))));

    draw();
    paintBar();
  }

  function setZoom(z) {
    if (!S.buf) return;
    var mid = view().a + (view().b - view().a) / 2;
    S.zoom = Math.max(1, Math.min(2048, z));
    var span = S.buf.length / S.zoom;
    S.scroll = Math.max(0, Math.min(S.buf.length - span, mid - span / 2));
    draw();
  }

  function wireWave(cv) {
    var dragging = false, anchor = 0;
    function at(ev) {
      var r = cv.getBoundingClientRect();
      var x = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) / r.width;
      var v = view();
      return Math.max(0, Math.min(S.buf.length,
        Math.round(v.a + x * (v.b - v.a))));
    }
    function down(ev) {
      if (!S.buf) return;
      dragging = true; anchor = at(ev);
      S.sel = null; draw(); paintBar();
      ev.preventDefault();
    }
    function move(ev) {
      if (!dragging || !S.buf) return;
      var p = at(ev);
      S.sel = { a: Math.min(anchor, p), b: Math.max(anchor, p) };
      clampSel(); draw(); paintBar();
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      paint();
    }
    cv.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    cv.addEventListener('touchstart', down, { passive: false });
    cv.addEventListener('touchmove', move, { passive: true });
    cv.addEventListener('touchend', up);
    /* The wheel scrolls the view when zoomed in, which is the one gesture
       everybody tries first and nothing else on the page wants here. */
    cv.addEventListener('wheel', function (ev) {
      if (!S.buf || S.zoom <= 1) return;
      ev.preventDefault();
      var span = S.buf.length / S.zoom;
      S.scroll = Math.max(0, Math.min(S.buf.length - span,
        S.scroll + (ev.deltaY > 0 ? 1 : -1) * span * 0.12));
      draw();
    }, { passive: false });
  }

  /* -------------------------------------------------------------------------
     STYLE — only this panel's own parts. The heading, .lede and .card come
     from the Studio stylesheet in trends-nav.js.
     ----------------------------------------------------------------------- */
  function styles() {
    if (document.getElementById('ncaud-style')) return;
    var st = document.createElement('style');
    st.id = 'ncaud-style';
    st.textContent =
      '.ncaud-open{display:flex;gap:8px;flex-wrap:wrap}' +
      '.ncaud-go{padding:11px 18px;border:0;border-radius:11px;cursor:pointer;' +
        'background:linear-gradient(90deg,#6C5CE7,#00D2FF);color:#04121a;font:inherit;font-weight:700}' +
      '.ncaud-open button:not(.ncaud-go),.ncaud-row button{padding:8px 13px;border-radius:10px;' +
        'border:1px solid var(--nc-line,rgba(120,140,255,.34));background:var(--nc-sunk,#141A2E);' +
        'color:inherit;cursor:pointer;font:inherit;font-weight:650;font-size:12.5px}' +
      '.ncaud-row button[disabled]{opacity:.42;cursor:default}' +
      '.ncaud-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}' +
      '.ncaud-wrap{margin-top:12px;border-radius:12px;overflow:hidden;' +
        'border:1px solid var(--nc-line,rgba(255,255,255,.12))}' +
      '.ncaud-wave{display:block;width:100%;height:220px;--wave-bg:#070910;' +
        'cursor:text;touch-action:none}' +
      '.ncaud-stat{margin-top:9px;font-size:12px;opacity:.78;' +
        'font-variant-numeric:tabular-nums;word-break:break-word}' +
      '.ncaud-flash{font-size:12px;color:#34D399;min-height:16px;margin-top:3px}' +
      '.ncaud-hint{font-size:12px;opacity:.62;margin-top:9px;line-height:1.55}' +
      '.ncaud-msg{margin:12px 0 0;font-size:13px;opacity:.78}' +
      '@media(max-width:560px){.ncaud-wave{height:150px}' +
        '.ncaud-row button{font-size:11.5px;padding:7px 10px}}';
    document.head.appendChild(st);
  }

  /* -------------------------------------------------------------------------
     MOUNT
     ----------------------------------------------------------------------- */
  function mount(box) {
    if (box.dataset.view === 'audio') { BOX = box; draw(); return; }
    box.dataset.view = 'audio';
    styles();
    BOX = box;
    box.innerHTML =
      '<h1 data-t="st_aud_h">' + esc(t('st_aud_h', 'Audio editor')) + '</h1>' +
      '<p class="lede" data-t="st_aud_p">' + esc(t('st_aud_p',
        'Open a sound, drag across the part you mean, and cut it. Fades, normalise, reverse ' +
        'and silence, then save it back out as a WAV. It all happens on this device.')) + '</p>' +
      '<div class="card"><div class="ncaud-body"></div></div>';
    paint();
  }

  window.addEventListener('resize', function () { draw(); });

  window.NC_AUDIO_ED = { mount: mount, state: S, draw: draw };
})();
