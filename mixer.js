/* ============================================================================
   NOVACLIP AUDIO MIXER
   ============================================================================
   The Audio tab had Volume, Fade In and Fade Out, and then five rows —
   Noise Reduction, EQ, Reverb, Bass Boost, Compressor — each with a "Soon"
   chip. This is those five.

   HOW THE EDITOR PLAYS SOUND, AND WHERE THIS SITS

   Every clip's media is an <audio> or <video> element, and the render loop
   sets element.volume once a frame for the clip's own level and its fades.
   That is untouched: this hangs a Web Audio graph off the same element, so
   the fades still work exactly as they did and this only shapes what comes
   out afterwards.

       element -> MediaElementSource
                  -> highpass   (rumble)
                  -> lowshelf   (bass)
                  -> peaking    (mids)
                  -> highshelf  (treble)
                  -> lowpass    (hiss)
                  -> compressor
                  -> dry ------------------> makeup -> destination
                   \-> convolver -> wet ---/

   NOTHING IS BUILT UNTIL SOMETHING IS TURNED ON, AND THAT IS DELIBERATE

   createMediaElementSource does something drastic and irreversible: it takes
   the element's output away from the speakers and routes it into the graph
   instead. If the AudioContext is suspended — which is the default until a
   real user gesture, on every browser — the sound stops dead. And it cannot
   be undone; there is no way to give an element its normal output back.

   So a clip with a default mix never gets a source node at all. The graph is
   built the first time a setting is actually moved off default, at which
   point there has certainly been a gesture, because moving a slider is one.
   A clip nobody has touched plays exactly as it did before this file existed.

   THE REVERB IS COMPUTED, NOT DOWNLOADED

   A convolver needs an impulse response, and the usual way to get one is to
   ship a .wav of a real room. This generates one instead — decaying noise,
   with the tail length and the damping following the size control. It is a
   plausible room rather than a real one, and it means reverb works with the
   wifi off, which matters on a site whose editor is meant to work on a train.

   WHAT "NOISE REDUCTION" HONESTLY IS HERE

   Not spectral subtraction — that needs an FFT per frame and a noise profile,
   and it is not something to run on a phone in a preview loop. It is a pair
   of filters that between them cut the two things people actually mean when
   they say a recording is noisy: rumble and handling below the voice, and
   hiss above it. That is a real improvement on real phone audio and it is
   named for what it does.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_MIX) return;

  /* Every value is 0 or 1-neutral, so "has this been touched" is a comparison
     against this object and nothing else has to track dirtiness. */
  function defaults() {
    return {
      denoise: 0,        /* 0..100  how hard the band limit closes in       */
      bass: 0,           /* -12..12 dB at the low shelf                     */
      mid: 0,            /* -12..12 dB around 1 kHz                         */
      treble: 0,         /* -12..12 dB at the high shelf                    */
      reverb: 0,         /* 0..100  wet mix                                 */
      room: 45,          /* 0..100  tail length and damping                 */
      comp: 0,           /* 0..100  how much compression                    */
      makeup: 0          /* -12..12 dB after everything                     */
    };
  }
  var DEF = defaults();

  function num(v, d) { var n = Number(v); return isFinite(n) ? n : d; }
  function isDefault(a) {
    if (!a) return true;
    for (var k in DEF) if (Math.abs(num(a[k], DEF[k]) - DEF[k]) > 0.001) return false;
    return true;
  }

  /* ---- the shared context ------------------------------------------------- */
  var ctx = null;
  function audioCtx() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { ctx = new C(); } catch (e) { return null; }
    /* Browsers start it suspended and only a gesture may resume it. These
       listeners are the cheapest way to catch the next one whatever it is. */
    var wake = function () {
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, wake, { capture: true, passive: true });
    });
    return ctx;
  }

  /* ---- a room, made out of noise ------------------------------------------ */
  var irCache = {};
  function impulse(room) {
    var key = Math.round(room / 10) * 10;
    if (irCache[key]) return irCache[key];
    var c = audioCtx();
    if (!c) return null;
    /* 0.18s at the small end to 2.6s at the large. Longer than that stops
       sounding like a room and starts sounding like a fault. */
    var secs = 0.18 + (key / 100) * 2.4;
    var rate = c.sampleRate;
    var len = Math.max(1, Math.floor(rate * secs));
    var buf = c.createBuffer(2, len, rate);
    /* A bigger room is also a darker one: the decay exponent falls as the
       room grows, so the tail hangs on instead of snapping shut. */
    var decay = 2.6 - (key / 100) * 1.4;
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    irCache[key] = buf;
    return buf;
  }

  /* ---- one graph per media element ---------------------------------------- */
  var graphs = new WeakMap();

  function build(elem) {
    var c = audioCtx();
    if (!c) return null;
    var src;
    try { src = c.createMediaElementSource(elem); }
    catch (e) { return null; }        /* already sourced, or cross-origin */

    var g = {
      src: src,
      hp: c.createBiquadFilter(),
      low: c.createBiquadFilter(),
      mid: c.createBiquadFilter(),
      high: c.createBiquadFilter(),
      lp: c.createBiquadFilter(),
      comp: c.createDynamicsCompressor(),
      dry: c.createGain(),
      wet: c.createGain(),
      conv: c.createConvolver(),
      out: c.createGain(),
      room: -1
    };

    g.hp.type = 'highpass';   g.hp.frequency.value = 20;
    g.low.type = 'lowshelf';  g.low.frequency.value = 180;
    g.mid.type = 'peaking';   g.mid.frequency.value = 1000; g.mid.Q.value = 0.9;
    g.high.type = 'highshelf'; g.high.frequency.value = 4200;
    g.lp.type = 'lowpass';    g.lp.frequency.value = 20000;

    g.src.connect(g.hp); g.hp.connect(g.low); g.low.connect(g.mid);
    g.mid.connect(g.high); g.high.connect(g.lp); g.lp.connect(g.comp);
    g.comp.connect(g.dry); g.dry.connect(g.out);
    g.comp.connect(g.conv); g.conv.connect(g.wet); g.wet.connect(g.out);
    g.out.connect(c.destination);

    g.dry.gain.value = 1;
    g.wet.gain.value = 0;
    graphs.set(elem, g);
    return g;
  }

  function db(x) { return Math.pow(10, x / 20); }

  function apply(elem, a) {
    var g = graphs.get(elem);
    if (!g) {
      if (isDefault(a)) return;        /* nothing on: leave the element alone */
      g = build(elem);
      if (!g) return;
    }
    var c = audioCtx(); if (!c) return;
    var t = c.currentTime;
    /* setTargetAtTime rather than assignment: a parameter jumped in the
       middle of a waveform is a click, and a rack of them is a crackle. */
    function set(p, v) { try { p.setTargetAtTime(v, t, 0.02); } catch (e) { p.value = v; } }

    var d = num(a.denoise, 0) / 100;
    /* Rumble first. 20 Hz is "off"; 160 Hz is well above a room's hum and
       still below a voice's fundamental. */
    set(g.hp.frequency, 20 + d * 140);
    /* Then hiss. Full open to 4.5 kHz, which keeps speech intelligible and
       loses the top of the noise floor. */
    set(g.lp.frequency, 20000 - d * 15500);

    set(g.low.gain, num(a.bass, 0));
    set(g.mid.gain, num(a.mid, 0));
    set(g.high.gain, num(a.treble, 0));

    var k = num(a.comp, 0) / 100;
    set(g.comp.threshold, -6 - k * 36);   /* -6 dB down to -42            */
    set(g.comp.ratio, 1 + k * 11);        /* 1:1 up to 12:1               */
    set(g.comp.knee, 30 - k * 24);
    set(g.comp.attack, 0.006);
    set(g.comp.release, 0.18);

    var w = num(a.reverb, 0) / 100;
    var rm = Math.round(num(a.room, 45));
    if (w > 0 && g.room !== rm) {
      var ir = impulse(rm);
      if (ir) { g.conv.buffer = ir; g.room = rm; }
    }
    /* Equal-power, so turning the reverb up does not also turn the whole
       thing up. */
    set(g.wet.gain, Math.sin(w * Math.PI / 2));
    set(g.dry.gain, Math.cos(w * Math.PI / 2));

    set(g.out.gain, db(num(a.makeup, 0)));
  }

  /* --------------------------------------------------------------------------
     WHICH CLIP DOES THIS ELEMENT BELONG TO?
     --------------------------------------------------------------------------
     The element's src is the asset's object URL, so it maps back through the
     asset to the clips that use it. One asset can be on the timeline more than
     once, and those copies can be mixed differently — so where there is a
     choice, the clip under the playhead wins, because that is the one you can
     hear while you are turning the knob.
     -------------------------------------------------------------------------- */
  function clipFor(elem) {
    var S = window.__ncStore;
    if (!S) return null;
    var st = S.getState();
    var src = elem.currentSrc || elem.src;
    if (!src) return null;
    var assets = st.assets || [], asset = null, i;
    for (i = 0; i < assets.length; i++) if (assets[i].url === src) { asset = assets[i]; break; }
    if (!asset) return null;
    var mine = (st.clips || []).filter(function (c) { return c.assetId === asset.id; });
    if (!mine.length) return null;
    var t = num(st.playhead, 0);
    for (i = 0; i < mine.length; i++) {
      var c2 = mine[i];
      if (t >= c2.start && t < c2.start + c2.duration) return c2;
    }
    return mine[0];
  }

  /* --------------------------------------------------------------------------
     FINDING THE ELEMENTS, WHICH IS NOT document.querySelectorAll
     --------------------------------------------------------------------------
     The editor's media elements are never put in the document. It builds them
     with document.createElement('audio'), sets a src, and keeps them in a map
     — they are decoders feeding the canvas, not things to look at, so there is
     no reason for them to be in the DOM and they are not.

     Measured while this was still querying the document: the only match was
     the preview's own empty <video>, the real audio element was invisible to
     it, and so the graph was never built for anything. Which looked exactly
     like the mixer doing nothing.

     So they are collected as they appear. createElement catches everything
     made after this file runs, which is everything imported in the session;
     play() catches any that were made before it, which is what a project
     restored on load produces. Between them there is no third case.
     -------------------------------------------------------------------------- */
  var known = [];
  function note(el) {
    if (!el || known.indexOf(el) > -1) return;
    known.push(el);
  }
  (function hook() {
    try {
      var ce = document.createElement.bind(document);
      document.createElement = function (tag) {
        var el = ce.apply(null, arguments);
        if (/^(audio|video)$/i.test(String(tag))) note(el);
        return el;
      };
    } catch (e) {}
    try {
      var MP = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
      if (MP && MP.play) {
        var op = MP.play;
        MP.play = function () { note(this); return op.apply(this, arguments); };
      }
    } catch (e) {}
  })();

  function elements() {
    var out = known.slice();
    /* Belt and braces: anything that IS in the document counts too. */
    var inDom = document.querySelectorAll('audio, video');
    for (var i = 0; i < inDom.length; i++) if (out.indexOf(inDom[i]) < 0) out.push(inDom[i]);
    return out;
  }

  /* Ten a second is plenty: these are settings somebody drags, not something
     that changes per frame, and the parameter ramps smooth over the gap. */
  function tick() {
    try {
      var els = elements();
      for (var i = 0; i < els.length; i++) {
        var clip = clipFor(els[i]);
        if (!clip) continue;
        var a = clip.audio;
        if (!a && !graphs.get(els[i])) continue;   /* untouched clip: skip */
        apply(els[i], a || DEF);
      }
    } catch (e) {}
  }
  setInterval(tick, 100);

  window.NC_MIX = {
    defaults: defaults,
    isDefault: isDefault,
    /* The panel calls this after writing to the store so a change is heard
       immediately rather than up to a tenth of a second later. */
    refresh: tick,
    context: audioCtx
  };
})();
