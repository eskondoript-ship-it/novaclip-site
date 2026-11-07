/* NOVACLIP — THE BIG EFFECTS AND TRANSITIONS PACK
 * ===========================================================================
 * WHAT WAS ASKED FOR: a library "as big as CapCut's" that actually works.
 * The second half of that is the hard half, and it is the half this file is
 * organised around, so read this before adding to it.
 *
 * WHAT WAS ALREADY HERE AND WHAT IS HERE NOW. Read off the live registries
 * in a real browser with the editor running, not counted by eye in the
 * source — the first pass of this header was written the second way and got
 * two of the four numbers wrong:
 *
 *                              before   added   after
 *     NC_FX.PAINT                  18      43      61   effect painters
 *     NC_FX.TPAINT                 18      38      56   transition painters
 *     NC_TRANS_UI.list             44      38      82   transitions you can pick
 *     NC_TRANS_UI.effects           8      43      51   effects you can pick
 *     editor-looks.js LOOKS         24       -      24   colour looks, untouched
 *
 * The two catalogue rows are the ones that matter to somebody using the
 * editor, because they are what the panels list. The two registry rows are
 * what the renderer can execute. They differ because the React bundle
 * implements 26 transitions of its own that have a catalogue entry and no
 * painter here — which is also why the effects catalogue started at 8 while
 * there were 18 painters: ten painters were things the renderer would run
 * and no panel could ask for.
 *
 * WHERE IT PLUGS IN. Nothing here patches the React bundle and nothing here
 * edits editor-fx.js. The two registries are plain objects hanging off
 * window.NC_FX, and the two catalogues the panels read are the same objects
 * on window.NC_TRANS_UI — so a sidecar can add keys to all four and the
 * panels pick them up the next time they open. That is the same extension
 * point editor-trans.js itself uses.
 *
 *     NC_FX.PAINT[id]  = function (g, w, h, v)        v = strength 0..1
 *     NC_FX.TPAINT[id] = function (g, w, h, p, dir)   p = progress, dir in/out
 *
 * ---------------------------------------------------------------------------
 * HONEST ABOUT "AS BIG AS CAPCUT"
 * ---------------------------------------------------------------------------
 * CapCut's count is in the thousands and three quarters of that is not
 * something this file could contain even in principle:
 *
 *   - LICENSED ASSET PACKS. Most of CapCut's "effects" are overlay videos,
 *     sticker sheets, sound beds and font packs. They are content, not code,
 *     they are owned by somebody, and shipping them would be a copyright
 *     problem rather than an engineering one.
 *   - ML FEATURES. Auto-cutout, face retouch, body tracking, sky replace,
 *     relight. These need models on a GPU, not canvas arithmetic. The honest
 *     version of these is a Worker call, not an entry in this file.
 *   - COMBINATIONS COUNTED AS ITEMS. A "preset" that is one effect at one
 *     strength with one colour counts separately in their library.
 *
 * What IS reachable procedurally is the part a person reaches for in a real
 * edit, and that is what this file is: film and camera looks, glitch and
 * signal damage, optical lens behaviour, stylisation, and the transitions
 * that actually get used between two shots. Eighty of them, which is a real
 * library rather than a long list.
 *
 * NO PADDING. There is a strong temptation, writing to a number, to ship
 * `vignette1` through `vignette9`. Everything here had to be visibly its own
 * thing beside its neighbours or it is not in the file. A library of two
 * hundred where a hundred and fifty look the same is the complaint people
 * make about big effect libraries, not the goal.
 *
 * ---------------------------------------------------------------------------
 * PERFORMANCE, WHICH IS WHY SOME OF THESE LOOK OVER-ENGINEERED
 * ---------------------------------------------------------------------------
 * A painter runs on every frame of the preview AND every frame of an export.
 * A per-pixel loop over a 1080p frame is two million iterations; over 4K it
 * is eight. So:
 *
 *   - Anything expressible as a channel curve uses a 256-entry LUT built
 *     once per call, not arithmetic per pixel.
 *   - Anything needing neighbours (edges, oil, sort) runs on a DOWNSCALED
 *     copy and is scaled back up. At the strengths these are used at, the
 *     difference is invisible and the cost is a quarter or a sixteenth.
 *   - Anything expressible with drawImage, a composite mode or a CSS filter
 *     string is done that way, because that path is on the GPU and the
 *     per-pixel path is not.
 *
 * SCRATCH CANVASES ARE PRIVATE TO THIS FILE. editor-fx.js has its own pool
 * and a comment recording what happened when a painter took scratch 0 — the
 * frame being painted IS that canvas in the editor's draw path, and asking
 * for it at a new size clears it, so the effect came out solid black. This
 * file never touches that pool. It has its own, and sc(0) here is safe
 * because it is not the same object.
 * ===========================================================================
 */
(function () {
  'use strict';
  if (window.NC_FX_PACK) return;

  /* ---- private scratch pool ---------------------------------------------- */
  var _p = [];
  function sc(n, w, h) {
    var c = _p[n];
    if (!c) { c = _p[n] = document.createElement('canvas'); }
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    return c;
  }
  /* A scratch that already holds a copy of the frame, which is what most of
     these actually want. Returns the canvas, not the context, because half
     the callers only ever drawImage it back. */
  function copyOf(n, g, w, h) {
    var c = sc(n, w, h), cg = c.getContext('2d');
    cg.setTransform(1, 0, 0, 1, 0, 0);
    cg.clearRect(0, 0, w, h);
    cg.drawImage(g.canvas, 0, 0);
    return c;
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function cover(p, dir) { return dir === 'out' ? 1 - p : p; }

  /* Mask the current frame with a shape drawn into a scratch. Same idea as
     editor-fx.js's maskWith, reimplemented because that one is not exported;
     kept deliberately identical in behaviour so a transition written against
     one reads the same as a transition written against the other. */
  function maskWith(g, w, h, make) {
    var m = sc(7, w, h), mg = m.getContext('2d');
    mg.setTransform(1, 0, 0, 1, 0, 0);
    mg.clearRect(0, 0, w, h);
    /* SAVE/RESTORE AROUND THE CALLER, AND RESET ALPHA FIRST. getContext()
       returns the SAME context object every time with its state intact, so a
       painter that sets globalAlpha on the mask and does not put it back
       leaves it set for whichever painter masks next. Four of the painters
       below legitimately want a partial-alpha mask near the end of their
       run, and without this they silently broke every transition that ran
       after them: measured, the ones downstream stopped erasing at about
       210/255 instead of reaching 0, which on a real cut is a seam. The
       failure needed two different transitions in one session to show up at
       all, which is exactly the kind that ships. */
    mg.save();
    mg.globalAlpha = 1;
    mg.globalCompositeOperation = 'source-over';
    mg.filter = 'none';
    make(mg);
    mg.restore();
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(m, 0, 0);
    g.restore();
  }

  /* Run fn over the frame's pixels at a reduced size and scale the result
     back. `div` of 2 is a quarter of the work, 4 is a sixteenth. Used by
     everything that needs to look at neighbouring pixels. */
  function perPixelSmall(g, w, h, div, fn) {
    var sw = Math.max(2, Math.round(w / div)), sh = Math.max(2, Math.round(h / div));
    var s = sc(1, sw, sh), sg = s.getContext('2d');
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, sw, sh);
    sg.imageSmoothingEnabled = true;
    sg.drawImage(g.canvas, 0, 0, sw, sh);
    var d;
    try { d = sg.getImageData(0, 0, sw, sh); } catch (e) { return false; }
    fn(d.data, sw, sh);
    sg.putImageData(d, 0, 0);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    g.imageSmoothingEnabled = true;
    g.drawImage(s, 0, 0, sw, sh, 0, 0, w, h);
    g.restore();
    return true;
  }

  /* Full-resolution per-pixel, for the ones that are a pure channel map and
     so cannot be faked at a lower resolution without losing detail. Always
     LUT-driven — see the note at the top of the file. */
  function perPixel(g, w, h, fn) {
    var d;
    try { d = g.getImageData(0, 0, w, h); } catch (e) { return false; }
    fn(d.data, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.putImageData(d, 0, 0);
    g.restore();
    return true;
  }

  /* A 256-entry curve. Built once per call and read two million times. */
  function lut(fn) {
    var t = new Uint8Array(256);
    for (var i = 0; i < 256; i++) t[i] = clamp(Math.round(fn(i / 255) * 255), 0, 255);
    return t;
  }
  /* A 256-entry luminance -> RGB ramp. Several painters here map brightness
     onto a colour (thermal, the toners, split tone), which is not a
     per-channel curve and so cannot use lut() above. Measured at 1080p the
     arithmetic-per-pixel version of these cost 36-50ms a frame; precomputing
     the ramp once and indexing it takes them to a third of that, because
     two million iterations of six multiplies and three clamps is the cost,
     not the pixel access. */
  function lumRamp(fn) {
    var r = new Uint8Array(256), g2 = new Uint8Array(256), b = new Uint8Array(256);
    for (var i = 0; i < 256; i++) {
      var c = fn(i / 255);
      r[i] = clamp(c[0], 0, 255) | 0; g2[i] = clamp(c[1], 0, 255) | 0; b[i] = clamp(c[2], 0, 255) | 0;
    }
    return { r: r, g: g2, b: b };
  }
  /* Blend a ramp in at strength v. The luminance index is integer-rounded
     from the same weights every painter here uses. */
  function applyRamp(data, ramp, v) {
    var R = ramp.r, G = ramp.g, B = ramp.b;
    for (var i = 0; i < data.length; i += 4) {
      var l = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      data[i]     += (R[l] - data[i]) * v;
      data[i + 1] += (G[l] - data[i + 1]) * v;
      data[i + 2] += (B[l] - data[i + 2]) * v;
    }
  }

  function applyLut(data, rT, gT, bT) {
    for (var i = 0; i < data.length; i += 4) {
      data[i] = rT[data[i]]; data[i + 1] = gT[data[i + 1]]; data[i + 2] = bT[data[i + 2]];
    }
  }

  /* A blurred copy, via the canvas filter, which is the GPU path. Falling
     back to nothing rather than to a JS box blur: a painter that silently
     costs thirty milliseconds a frame is worse than one that is slightly
     less soft than intended. */
  function blurCopy(n, g, w, h, px) {
    var c = sc(n, w, h), cg = c.getContext('2d');
    cg.setTransform(1, 0, 0, 1, 0, 0);
    cg.clearRect(0, 0, w, h);
    cg.filter = 'blur(' + Math.max(0, px).toFixed(2) + 'px)';
    cg.drawImage(g.canvas, 0, 0);
    cg.filter = 'none';
    return c;
  }

  /* Draw `src` over the frame in a composite mode at an alpha. The single
     most reused three lines in the file. */
  function over(g, src, mode, alpha) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = mode;
    g.globalAlpha = clamp(alpha, 0, 1);
    g.drawImage(src, 0, 0);
    g.restore();
  }

  /* A deterministic hash-noise, so grain does not crawl differently on every
     re-render of the same frame — and so a test can assert the same frame
     twice and get the same bytes. Math.random() in a painter makes the
     effect unverifiable and makes an export shimmer. */
  function hash2(x, y, seed) {
    var n = x * 374761393 + y * 668265263 + seed * 1274126177;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  /* ---- PARAMETERS, WHEN THE EDITOR IS THERE ------------------------------
     editor-fx-edit.js declares a named parameter for the painters below that
     genuinely have a second dimension, and gives the user a slider for it.
     This reads the current value, falling back to exactly the constant that
     was hard-coded before — so with that file absent, or before it loads,
     every painter here behaves precisely as it did. A slider that does
     nothing is worse than no slider, so every key read here is wired into
     the arithmetic below rather than merely accepted. */
  function P(id, key, fallback) {
    try {
      var e = window.NC_FX_EDIT;
      if (e && typeof e.param === 'function') return e.param(id, key, fallback);
    } catch (err) {}
    return fallback;
  }

  var PAINT = {}, TPAINT = {}, FXCAT = {}, TCAT = {};

  /* =========================================================================
     EFFECTS
     =========================================================================
     Grouped by what a person would be looking for, because that is how the
     panel lists them: film, lens, signal damage, stylise, light, warp.
     ========================================================================= */

  /* ---- FILM AND CAMERA --------------------------------------------------- */

  /* Bleach bypass: the silver is left in, so contrast goes up hard and
     saturation drops without going grey. The real process crushes the
     shadows and keeps the highlights, which is the S-curve below. */
  PAINT.bleach = function (g, w, h, v) {
    var s = v * 0.75;
    var c = lut(function (x) { return clamp(x + (x - 0.5) * s * 1.6, 0, 1); });
    perPixel(g, w, h, function (d) {
      applyLut(d, c, c, c);
      for (var i = 0; i < d.length; i += 4) {
        var l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
        d[i]     += (l - d[i]) * s;
        d[i + 1] += (l - d[i + 1]) * s;
        d[i + 2] += (l - d[i + 2]) * s;
      }
    });
  };

  /* Cross-process: the look of running film in the wrong chemistry. Blue
     shadows, yellow-green highlights, and the channels pulled apart at
     different rates — three different curves, which is the whole trick. */
  PAINT.crossprocess = function (g, w, h, v) {
    var k = v;
    var r = lut(function (x) { return x + k * (Math.pow(x, 0.78) - x); });
    var gg = lut(function (x) { return x + k * (x * 1.06 - 0.03 - x); });
    var b = lut(function (x) { return x + k * (Math.pow(x, 1.4) + 0.06 - x); });
    perPixel(g, w, h, function (d) { applyLut(d, r, gg, b); });
  };

  /* Halation: real film scatters light inside the emulsion and it scatters
     RED furthest, which is why bright edges on film bloom warm and digital
     bloom looks wrong when it is white. Blur a copy, keep the highlights,
     tint it red, screen it back. */
  PAINT.halation = function (g, w, h, v) {
    var b = blurCopy(2, g, w, h, Math.max(2, Math.min(w, h) * 0.012));
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.clearRect(0, 0, w, h);
    tg.drawImage(b, 0, 0);
    /* Keep only what was already bright, then push it warm. */
    tg.globalCompositeOperation = 'multiply';
    tg.fillStyle = '#ff5a2a'; tg.fillRect(0, 0, w, h);
    tg.globalCompositeOperation = 'source-over';
    over(g, t, 'screen', v * 0.5);
  };

  /* Orton: the wedding-photograph glow. A blurred copy screened over a sharp
     one, which lifts the midtones and keeps the edges. */
  PAINT.orton = function (g, w, h, v) {
    var b = blurCopy(2, g, w, h, Math.max(3, Math.min(w, h) * 0.02));
    over(g, b, 'screen', v * 0.55);
  };

  /* Infrared: foliage goes white, sky goes near-black. A red/blue channel
     swap with the green lifted is the photographic approximation and it is
     the one that actually reads as IR rather than as a blue filter. */
  PAINT.infrared = function (g, w, h, v) {
    perPixel(g, w, h, function (d) {
      for (var i = 0; i < d.length; i += 4) {
        var R = d[i], G = d[i + 1], B = d[i + 2];
        var nr = clamp(G * 1.25, 0, 255), nb = clamp(R * 0.55, 0, 255);
        var ng = clamp(G * 0.55 + B * 0.2, 0, 255);
        d[i]     += (nr - R) * v;
        d[i + 1] += (ng - G) * v;
        d[i + 2] += (nb - B) * v;
      }
    });
  };

  /* Cyanotype and sepia-deep are one painter with two tints, because they
     genuinely are the same operation — desaturate, then map black-to-white
     onto a two-colour ramp. */
  function toner(dark, light) {
    var ramp = lumRamp(function (l) {
      return [dark[0] + (light[0] - dark[0]) * l,
              dark[1] + (light[1] - dark[1]) * l,
              dark[2] + (light[2] - dark[2]) * l];
    });
    return function (g, w, h, v) {
      perPixel(g, w, h, function (d) { applyRamp(d, ramp, v); });
    };
  }
  PAINT.cyanotype = toner([8, 28, 64], [196, 232, 255]);
  PAINT.platinum  = toner([18, 16, 20], [246, 240, 228]);

  /* ---- LENS -------------------------------------------------------------- */

  /* Anamorphic flare: a wide cinema lens throws a horizontal blue streak off
     a highlight. Threshold the bright pixels, smear them sideways only, tint
     them, add. The sideways-only smear is what makes it anamorphic and not
     just a glow. */
  PAINT.anamorphic = function (g, w, h, v) {
    var sw = Math.max(8, Math.round(w / 4)), sh = Math.max(8, Math.round(h / 4));
    var s = sc(1, sw, sh), sg = s.getContext('2d');
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, sw, sh);
    sg.drawImage(g.canvas, 0, 0, sw, sh);
    var d;
    try { d = sg.getImageData(0, 0, sw, sh); } catch (e) { return; }
    var px = d.data;
    for (var i = 0; i < px.length; i += 4) {
      var l = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
      var keep = l > 0.72 ? (l - 0.72) / 0.28 : 0;
      px[i] = 40 * keep; px[i + 1] = 120 * keep; px[i + 2] = 255 * keep; px[i + 3] = 255 * keep;
    }
    sg.putImageData(d, 0, 0);
    /* The streak: the same strip drawn repeatedly at widening horizontal
       scales, which is a cheap directional blur and stays on the GPU. */
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.clearRect(0, 0, w, h);
    tg.globalCompositeOperation = 'lighter';
    for (var k = 1; k <= 7; k++) {
      var ex = 1 + k * 0.5, a = (1 - k / 8) * 0.5;
      tg.globalAlpha = a;
      tg.drawImage(s, w / 2 - (w * ex) / 2, 0, w * ex, h);
    }
    over(g, t, 'lighter', v);
  };

  /* Starburst: the cross-shaped flare a stopped-down lens puts on a point
     light. Same highlight pass as anamorphic, smeared on both axes. */
  PAINT.starburst = function (g, w, h, v) {
    var sw = Math.max(8, Math.round(w / 4)), sh = Math.max(8, Math.round(h / 4));
    var s = sc(1, sw, sh), sg = s.getContext('2d');
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, sw, sh); sg.drawImage(g.canvas, 0, 0, sw, sh);
    var d; try { d = sg.getImageData(0, 0, sw, sh); } catch (e) { return; }
    var px = d.data;
    for (var i = 0; i < px.length; i += 4) {
      var l = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
      var keep = l > 0.8 ? (l - 0.8) / 0.2 : 0;
      px[i] *= keep; px[i + 1] *= keep; px[i + 2] *= keep; px[i + 3] = 255 * keep;
    }
    sg.putImageData(d, 0, 0);
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.clearRect(0, 0, w, h);
    tg.globalCompositeOperation = 'lighter';
    for (var k = 1; k <= 6; k++) {
      var e = 1 + k * 0.42, a = (1 - k / 7) * 0.42;
      tg.globalAlpha = a;
      tg.drawImage(s, w / 2 - (w * e) / 2, 0, w * e, h);
      tg.drawImage(s, 0, h / 2 - (h * e) / 2, w, h * e);
    }
    over(g, t, 'lighter', v);
  };

  /* Bokeh: out-of-focus highlights become discs, not blobs. Blur the frame,
     then stamp discs where the highlights were — the stamping is what makes
     it bokeh instead of a blur. */
  PAINT.bokeh = function (g, w, h, v) {
    var b = blurCopy(2, g, w, h, Math.max(3, Math.min(w, h) * 0.02));
    var step = Math.max(14, Math.round(Math.min(w, h) / 26));
    var r = step * 0.46 * P('bokeh', 'size', 1);
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    var small = sc(4, Math.max(2, Math.round(w / step)), Math.max(2, Math.round(h / step)));
    var smg = small.getContext('2d');
    smg.setTransform(1, 0, 0, 1, 0, 0); smg.clearRect(0, 0, small.width, small.height);
    smg.imageSmoothingEnabled = true;
    smg.drawImage(g.canvas, 0, 0, small.width, small.height);
    var d; try { d = smg.getImageData(0, 0, small.width, small.height); } catch (e) { return; }
    tg.globalCompositeOperation = 'lighter';
    for (var y = 0; y < small.height; y++) {
      for (var x = 0; x < small.width; x++) {
        var o = (y * small.width + x) * 4;
        var l = (d.data[o] * 0.299 + d.data[o + 1] * 0.587 + d.data[o + 2] * 0.114) / 255;
        if (l < 0.74) continue;
        var a = (l - 0.74) / 0.26;
        tg.globalAlpha = a * 0.8;
        tg.fillStyle = 'rgb(' + d.data[o] + ',' + d.data[o + 1] + ',' + d.data[o + 2] + ')';
        tg.beginPath();
        tg.arc((x + 0.5) * step, (y + 0.5) * step, r, 0, 6.2832);
        tg.fill();
      }
    }
    over(g, b, 'source-over', v * 0.8);
    over(g, t, 'lighter', v);
  };

  /* Lens dirt: the smudges and specks on real glass, which only show up when
     light hits them — so it is a highlight-gated overlay, not a texture laid
     flat on top. Generated from the hash, so it does not crawl. */
  PAINT.lensdirt = function (g, w, h, v) {
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    var n = 90;
    for (var i = 0; i < n; i++) {
      var x = hash2(i, 1, 7) * w, y = hash2(i, 2, 7) * h;
      var r = (0.004 + hash2(i, 3, 7) * 0.03) * Math.min(w, h);
      var a = 0.05 + hash2(i, 4, 7) * 0.22;
      var gr = tg.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,' + a + ')');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      tg.fillStyle = gr;
      tg.beginPath(); tg.arc(x, y, r, 0, 6.2832); tg.fill();
    }
    /* Gated: multiply the dirt by the frame's own brightness so it appears
       over the bright areas and stays invisible in the shadows. */
    tg.globalCompositeOperation = 'multiply';
    tg.drawImage(g.canvas, 0, 0);
    tg.globalCompositeOperation = 'source-over';
    over(g, t, 'lighter', v * 0.9);
  };

  /* Pincushion, the opposite sign of the fisheye already in editor-fx.js.
     Worth its own entry because a long lens really does this and the two
     look nothing alike. */
  PAINT.pincushion = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var k = v * P('pincushion', 'amount', 0.45), steps = 26;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    /* Concentric rings redrawn at a radius-dependent scale. Twenty-six rings
       is enough that the seams disappear and cheap enough to stay on the
       GPU — the per-pixel version of this is four times the cost for no
       visible gain at these strengths. */
    for (var i = steps; i >= 1; i--) {
      var r0 = i / steps, s = 1 + k * r0 * r0;
      g.save();
      g.beginPath();
      g.arc(w / 2, h / 2, (Math.max(w, h) / 2) * r0, 0, 6.2832);
      g.clip();
      g.drawImage(src, w / 2 - (w * s) / 2, h / 2 - (h * s) / 2, w * s, h * s);
      g.restore();
    }
    g.restore();
  };

  /* ---- SIGNAL DAMAGE ----------------------------------------------------- */

  /* A CRT: three things at once, and leaving any one out stops it reading as
     a tube. The phosphor stripe, the scanline gap, and the glow that a real
     tube throws because the glass is in front of the phosphor. */
  PAINT.crt = function (g, w, h, v) {
    var glow = blurCopy(2, g, w, h, Math.max(1, Math.min(w, h) * 0.004));
    over(g, glow, 'lighter', v * 0.3);
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    /* Floor FIRST, then scale. Rounding h/240 * param before the Math.max
       meant every value of the slider landed on the same clamped 2 at
       preview size. */
    var gap = Math.max(1, Math.round(Math.max(2, h / 240) * P('crt', 'gap', 1)));
    tg.fillStyle = 'rgba(0,0,0,' + (0.55 * v) + ')';
    for (var y = 0; y < h; y += gap * 2) tg.fillRect(0, y, w, gap);
    var sw = Math.max(3, Math.round(w / 420));
    for (var x = 0; x < w; x += sw * 3) {
      tg.fillStyle = 'rgba(255,0,0,' + (0.12 * v) + ')'; tg.fillRect(x, 0, sw, h);
      tg.fillStyle = 'rgba(0,255,0,' + (0.12 * v) + ')'; tg.fillRect(x + sw, 0, sw, h);
      tg.fillStyle = 'rgba(0,0,255,' + (0.12 * v) + ')'; tg.fillRect(x + sw * 2, 0, sw, h);
    }
    over(g, t, 'source-over', 1);
  };

  /* Bad signal: a broken sync is not noise everywhere, it is BANDS that are
     displaced sideways with the colour torn off them, and the bands have to
     have hard edges. Soft random noise reads as grain, not as a fault. */
  PAINT.badsignal = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var bands = Math.round(6 + v * 16);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (var i = 0; i < bands; i++) {
      var y = Math.round(hash2(i, 11, 3) * h);
      var bh = Math.max(2, Math.round(hash2(i, 12, 3) * h * 0.06));
      var dx = (hash2(i, 13, 3) - 0.5) * w * 0.22 * v;
      g.drawImage(src, 0, y, w, bh, dx, y, w, bh);
      /* The colour tear: one channel pushed further than the band itself. */
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.35 * v;
      g.drawImage(src, 0, y, w, bh, dx + 8 * v, y, w, bh);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
    }
    g.restore();
  };

  /* VHS tracking: the band that rolls up the picture when the tape is worn.
     Distinct from `vhs` in the bundle, which is wobble and bleed with no
     tracking band at all. */
  PAINT.vhstrack = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var bh = Math.max(6, Math.round(h * 0.08 * v));
    var y = Math.round(h * 0.62);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    /* The band is squashed, shifted and desaturated — all three, because the
       tape head is losing contact rather than just moving. */
    g.filter = 'saturate(' + (1 - 0.7 * v) + ') contrast(' + (1 + 0.5 * v) + ')';
    g.drawImage(src, 0, y, w, bh, -w * 0.04 * v, y, w * (1 + 0.08 * v), bh);
    g.filter = 'none';
    g.fillStyle = 'rgba(255,255,255,' + (0.1 * v) + ')';
    g.fillRect(0, y, w, bh);
    g.restore();
  };

  /* Datamosh: the compression artefact where a frame keeps the previous
     frame's motion. With one frame to work from the honest version is block
     displacement — whole macroblocks pulled from the wrong place. */
  PAINT.datamosh = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var bs = Math.max(8, Math.round(Math.min(w, h) / 22));
    var cols = Math.ceil(w / bs), rows = Math.ceil(h / bs);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (hash2(c, r, 5) > v * 0.55) continue;
        var dx = Math.round((hash2(c, r, 6) - 0.5) * bs * 4);
        var dy = Math.round((hash2(c, r, 7) - 0.5) * bs * 2);
        var sx = clamp(c * bs + dx, 0, w - bs), sy = clamp(r * bs + dy, 0, h - bs);
        g.drawImage(src, sx, sy, bs, bs, c * bs, r * bs, bs, bs);
      }
    }
    g.restore();
  };

  /* Pixel sort: the glitch where a run of pixels is reordered by brightness.
     Genuinely per-pixel and genuinely O(n log n) per row, so it runs at a
     quarter scale — at the strengths anyone uses this at, the sorted runs
     are much bigger than the pixels anyway. */
  PAINT.pixelsort = function (g, w, h, v) {
    perPixelSmall(g, w, h, 3, function (d, sw, sh) {
      /* Above 1 at v=0, so no run qualifies and the painter is a true
         no-op. The old 0.62 sorted the bright half of the frame even with
         the slider at zero. */
      var thr = 1.02 - v * 0.44;
      for (var y = 0; y < sh; y++) {
        var x = 0;
        while (x < sw) {
          var o = (y * sw + x) * 4;
          var l = (d[o] * 0.299 + d[o + 1] * 0.587 + d[o + 2] * 0.114) / 255;
          if (l < thr) { x++; continue; }
          var start = x;
          while (x < sw) {
            var oo = (y * sw + x) * 4;
            var ll = (d[oo] * 0.299 + d[oo + 1] * 0.587 + d[oo + 2] * 0.114) / 255;
            if (ll < thr) break;
            x++;
          }
          var n = x - start;
          if (n < 3) continue;
          var run = [];
          for (var i = 0; i < n; i++) {
            var p = (y * sw + start + i) * 4;
            run.push([d[p], d[p + 1], d[p + 2],
                      d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114]);
          }
          run.sort(function (a, b) { return a[3] - b[3]; });
          for (var j = 0; j < n; j++) {
            var q = (y * sw + start + j) * 4;
            d[q] = run[j][0]; d[q + 1] = run[j][1]; d[q + 2] = run[j][2];
          }
        }
      }
    });
  };

  /* Interlace: the two fields of a frame taken at different moments, which
     is why fast motion combs on broadcast. Odd lines from a scaled copy. */
  PAINT.interlace = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var dx = Math.round(w * 0.012 * v);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (var y = 1; y < h; y += 2) g.drawImage(src, 0, y, w, 1, dx, y, w, 1);
    g.restore();
  };

  /* Ordered dither, Bayer 4x4. The look of an old display rather than of
     noise — which is exactly why the matrix is fixed and not random. */
  PAINT.dither = function (g, w, h, v) {
    var M = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    perPixel(g, w, h, function (d, W, H) {
      var levels = Math.max(2, Math.round(P('dither', 'levels', 4)));
      var step = 255 / (levels - 1), inv = 1 / step;
      /* The matrix offset only has sixteen possible values, and x and y come
         free from a nested loop — the modulo and divide per pixel to recover
         them from a flat index was most of the cost. */
      var off = new Float32Array(16);
      for (var k = 0; k < 16; k++) off[k] = (M[k] / 16 - 0.5) * step;
      for (var y = 0; y < H; y++) {
        var row = (y & 3) * 4, i = y * W * 4;
        for (var x = 0; x < W; x++, i += 4) {
          var m = off[row + (x & 3)];
          var a = ((d[i] + m) * inv + 0.5) | 0, b = ((d[i + 1] + m) * inv + 0.5) | 0,
              c = ((d[i + 2] + m) * inv + 0.5) | 0;
          d[i]     = clamp(a * step, 0, 255);
          d[i + 1] = clamp(b * step, 0, 255);
          d[i + 2] = clamp(c * step, 0, 255);
        }
      }
    });
  };

  /* ---- STYLISE ----------------------------------------------------------- */

  /* Sobel edges. The gradient magnitude, not a difference-of-blurs, because
     Sobel gives clean one-pixel lines and the blur trick gives mush. */
  function sobelInto(d, sw, sh, out) {
    var lum = new Float32Array(sw * sh);
    for (var i = 0, p = 0; i < d.length; i += 4, p++) {
      lum[p] = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
    }
    for (var y = 1; y < sh - 1; y++) {
      for (var x = 1; x < sw - 1; x++) {
        var o = y * sw + x;
        var gx = -lum[o - sw - 1] - 2 * lum[o - 1] - lum[o + sw - 1]
               +  lum[o - sw + 1] + 2 * lum[o + 1] + lum[o + sw + 1];
        var gy = -lum[o - sw - 1] - 2 * lum[o - sw] - lum[o - sw + 1]
               +  lum[o + sw - 1] + 2 * lum[o + sw] + lum[o + sw + 1];
        out[o] = Math.sqrt(gx * gx + gy * gy);
      }
    }
  }

  PAINT.edges = function (g, w, h, v) {
    perPixelSmall(g, w, h, 2, function (d, sw, sh) {
      var e = new Float32Array(sw * sh);
      sobelInto(d, sw, sh, e);
      var gain = 1 + v * 3;
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        var m = clamp(e[p] * gain, 0, 1) * 255;
        d[i] += (m - d[i]) * v; d[i + 1] += (m - d[i + 1]) * v; d[i + 2] += (m - d[i + 2]) * v;
      }
    });
  };

  /* Neon edges: the Sobel magnitude mapped onto a hue ramp and added, so
     the lines glow in colour instead of going white. */
  PAINT.neonedge = function (g, w, h, v) {
    perPixelSmall(g, w, h, 2, function (d, sw, sh) {
      var e = new Float32Array(sw * sh);
      sobelInto(d, sw, sh, e);
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        var m = clamp(e[p] * (1 + v * 3), 0, 1);
        var hueR = 0.5 + 0.5 * Math.sin(m * 6.0), hueG = 0.5 + 0.5 * Math.sin(m * 6.0 + 2.1),
            hueB = 0.5 + 0.5 * Math.sin(m * 6.0 + 4.2);
        d[i]     = clamp(d[i] * (1 - v * 0.6) + hueR * m * 255 * v * 1.6, 0, 255);
        d[i + 1] = clamp(d[i + 1] * (1 - v * 0.6) + hueG * m * 255 * v * 1.6, 0, 255);
        d[i + 2] = clamp(d[i + 2] * (1 - v * 0.6) + hueB * m * 255 * v * 1.6, 0, 255);
      }
    });
  };

  /* Pencil sketch: colour dodge of the frame against its own blurred
     negative, which is the darkroom technique and the only version of this
     that produces real pencil tone rather than grey edges. */
  PAINT.sketch = function (g, w, h, v) {
    var inv = sc(2, w, h), ig = inv.getContext('2d');
    ig.setTransform(1, 0, 0, 1, 0, 0); ig.clearRect(0, 0, w, h);
    ig.filter = 'invert(1) grayscale(1) blur(' + Math.max(1, Math.min(w, h) * 0.008).toFixed(2) + 'px)';
    ig.drawImage(g.canvas, 0, 0);
    ig.filter = 'none';
    var base = sc(3, w, h), bg = base.getContext('2d');
    bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, w, h);
    bg.filter = 'grayscale(1)';
    bg.drawImage(g.canvas, 0, 0);
    bg.filter = 'none';
    bg.globalCompositeOperation = 'color-dodge';
    bg.drawImage(inv, 0, 0);
    bg.globalCompositeOperation = 'source-over';
    over(g, base, 'source-over', v);
  };

  /* Cartoon: flat colour plus a drawn outline. Both halves are required —
     posterising alone looks like a cheap filter, and the outline is what
     makes the eye read it as drawn. */
  PAINT.cartoon = function (g, w, h, v) {
    perPixelSmall(g, w, h, 2, function (d, sw, sh) {
      var e = new Float32Array(sw * sh);
      sobelInto(d, sw, sh, e);
      var levels = Math.max(3, Math.round(9 - v * 5));
      var step = 255 / (levels - 1);
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        var q0 = Math.round(d[i] / step) * step,
            q1 = Math.round(d[i + 1] / step) * step,
            q2 = Math.round(d[i + 2] / step) * step;
        d[i] += (q0 - d[i]) * v; d[i + 1] += (q1 - d[i + 1]) * v; d[i + 2] += (q2 - d[i + 2]) * v;
        var line = clamp(e[p] * 2.2 - 0.25, 0, 1) * v;
        d[i] *= (1 - line); d[i + 1] *= (1 - line); d[i + 2] *= (1 - line);
      }
    });
  };

  /* Oil paint: a mode filter — the most common quantised colour in a
     neighbourhood wins, which is what gives the characteristic flat
     brush-blobs. Quarter scale, because the window makes this the most
     expensive painter in the file by a distance. */
  PAINT.oil = function (g, w, h, v) {
    /* Sixth-scale and twelve bins. At quarter-scale with a radius-4 window
       this was 119ms a frame at 1080p — the slowest thing in the file by a
       factor of two, because the cost is the window AREA times the pixel
       count and both were too high. A sixth scale is a 2.25x saving on the
       pixel count alone, and the blobs this produces are large by nature so
       the detail was never there to lose. */
    var oilRad = P('oil', 'radius', 2);
    perPixelSmall(g, w, h, 6, function (d, sw, sh) {
      var rad = Math.max(1, Math.round(oilRad)), bins = 12;
      var src = new Uint8ClampedArray(d);
      var cR = new Float32Array(bins), cG = new Float32Array(bins),
          cB = new Float32Array(bins), cnt = new Float32Array(bins);
      for (var y = 0; y < sh; y++) {
        for (var x = 0; x < sw; x++) {
          cR.fill(0); cG.fill(0); cB.fill(0); cnt.fill(0);
          for (var dy = -rad; dy <= rad; dy++) {
            var yy = y + dy; if (yy < 0 || yy >= sh) continue;
            for (var dx = -rad; dx <= rad; dx++) {
              var xx = x + dx; if (xx < 0 || xx >= sw) continue;
              var o = (yy * sw + xx) * 4;
              var l = (src[o] * 0.299 + src[o + 1] * 0.587 + src[o + 2] * 0.114) / 255;
              var b = Math.min(bins - 1, (l * bins) | 0);
              cnt[b]++; cR[b] += src[o]; cG[b] += src[o + 1]; cB[b] += src[o + 2];
            }
          }
          var best = 0;
          for (var b2 = 1; b2 < bins; b2++) if (cnt[b2] > cnt[best]) best = b2;
          var n = cnt[best] || 1, t = (y * sw + x) * 4;
          d[t]     += (cR[best] / n - d[t]) * v;
          d[t + 1] += (cG[best] / n - d[t + 1]) * v;
          d[t + 2] += (cB[best] / n - d[t + 2]) * v;
        }
      }
    });
  };

  /* Stained glass: cells of flat colour with dark leading between them. The
     cell centres come from the hash so the pattern is stable frame to frame
     — a voronoi that jitters every frame is unwatchable. */
  PAINT.stainedglass = function (g, w, h, v) {
    var cells = Math.round(26 + (1 - v) * 60);
    /* The parameter scales the STEP, not the cell count. Scaling the count
       did nothing: step has a lower floor and on a small canvas both ends of
       the slider clamped to it, so the knob moved and the picture did not. */
    var step = Math.max(4, Math.round(Math.min(w, h) / cells * P('stainedglass', 'cells', 1)));
    var small = sc(4, Math.max(2, Math.round(w / step)), Math.max(2, Math.round(h / step)));
    var smg = small.getContext('2d');
    smg.setTransform(1, 0, 0, 1, 0, 0); smg.clearRect(0, 0, small.width, small.height);
    smg.imageSmoothingEnabled = true;
    smg.drawImage(g.canvas, 0, 0, small.width, small.height);
    var d; try { d = smg.getImageData(0, 0, small.width, small.height); } catch (e) { return; }
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    tg.strokeStyle = 'rgba(8,6,12,0.9)';
    tg.lineWidth = Math.max(1, step * 0.12);
    for (var y = 0; y < small.height; y++) {
      for (var x = 0; x < small.width; x++) {
        var o = (y * small.width + x) * 4;
        tg.fillStyle = 'rgb(' + d.data[o] + ',' + d.data[o + 1] + ',' + d.data[o + 2] + ')';
        var jx = (hash2(x, y, 9) - 0.5) * step * 0.5, jy = (hash2(x, y, 10) - 0.5) * step * 0.5;
        tg.beginPath();
        tg.moveTo(x * step + jx, y * step + jy);
        tg.lineTo((x + 1) * step + jx, y * step - jy);
        tg.lineTo((x + 1) * step - jx, (y + 1) * step + jy);
        tg.lineTo(x * step - jx, (y + 1) * step - jy);
        tg.closePath();
        tg.fill(); tg.stroke();
      }
    }
    over(g, t, 'source-over', v);
  };

  /* Thermal: a false-colour ramp on luminance. Black-blue-magenta-yellow-
     white, which is the ramp a real thermal camera uses. */
  var THERMAL = (function () {
    var stops = [[0, 0, 0, 12], [0.25, 20, 0, 120], [0.5, 190, 20, 130],
                 [0.72, 255, 150, 20], [0.88, 255, 240, 110], [1, 255, 255, 255]];
    /* Built once at load, not once per frame: the stop search was running
       inside the pixel loop. */
    return lumRamp(function (l) {
      var a = stops[0], b = stops[stops.length - 1];
      for (var s = 0; s < stops.length - 1; s++) {
        if (l >= stops[s][0] && l <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
      }
      var k = (l - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
    });
  }());
  PAINT.thermal = function (g, w, h, v) {
    perPixel(g, w, h, function (d) { applyRamp(d, THERMAL, v); });
  };

  /* Night vision: green, yes, but the three things that actually sell it are
     the bloom, the per-pixel sensor noise and the hard vignette of a tube. */
  PAINT.nightvision = function (g, w, h, v) {
    /* Measured at 101ms a frame at 1080p before this, which is three frames'
       worth for one effect. Three things were being done per pixel that do
       not need to be: a Math.pow, a modulo and a divide for the coordinates,
       and a multiply-heavy hash. Now the curve is a table, the coordinates
       come from the loop instead of from arithmetic on the index, the
       vignette's x-term is tabulated per column, and the noise is a 64x64
       tile read with a mask. */
    var CURVE = lut(function (x) { return Math.pow(x, 0.72); });
    var NT = 64, noise = new Float32Array(NT * NT);
    for (var ni = 0; ni < NT * NT; ni++) {
      noise[ni] = (hash2(ni % NT, (ni / NT) | 0, 21) - 0.5) * 0.22;
    }
    perPixel(g, w, h, function (d, W, H) {
      var vx = new Float32Array(W);
      for (var x0 = 0; x0 < W; x0++) { var t = (x0 / W - 0.5) * 2; vx[x0] = t * t; }
      for (var y = 0; y < H; y++) {
        var dy = (y / H - 0.5) * 2, vy = dy * dy;
        var nrow = (y & (NT - 1)) * NT;
        var i = y * W * 4;
        for (var x = 0; x < W; x++, i += 4) {
          var l = CURVE[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8] / 255;
          var vig = 1 - (vx[x] + vy) * 0.95;
          if (vig < 0) vig = 0;
          var out = (l + noise[nrow + (x & (NT - 1))]) * vig;
          if (out < 0) out = 0; else if (out > 1) out = 1;
          d[i]     += (out * 40 - d[i]) * v;
          d[i + 1] += (out * 255 - d[i + 1]) * v;
          d[i + 2] += (out * 70 - d[i + 2]) * v;
        }
      }
    });
    var b = blurCopy(2, g, w, h, Math.max(1, Math.min(w, h) * 0.006));
    over(g, b, 'lighter', v * 0.35);
  };

  /* Solarize and threshold are two points on the same control, but they are
     visually unrelated enough to be two entries. */
  PAINT.solarize = function (g, w, h, v) {
    var c = lut(function (x) { return x < 0.5 ? x : 1 - (x - 0.5) * 2 * v - (1 - v) * (1 - x); });
    perPixel(g, w, h, function (d) { applyLut(d, c, c, c); });
  };
  PAINT.threshold = function (g, w, h, v) {
    var cut = 0.5;
    perPixel(g, w, h, function (d) {
      for (var i = 0; i < d.length; i += 4) {
        var l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        var o = l > cut ? 255 : 0;
        d[i] += (o - d[i]) * v; d[i + 1] += (o - d[i + 1]) * v; d[i + 2] += (o - d[i + 2]) * v;
      }
    });
  };

  /* ---- LIGHT AND COLOUR -------------------------------------------------- */

  /* Clarity: local contrast. Unsharp mask with a wide radius, which lifts
     texture without touching overall exposure — the slider everybody reaches
     for and nobody can name. */
  PAINT.clarity = function (g, w, h, v) {
    var b = blurCopy(2, g, w, h, Math.max(4, Math.min(w, h) * 0.03));
    /* Subtract the blur, add it back harder: difference blend gives the
       high-frequency detail, overlay puts it back as contrast. */
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    tg.drawImage(g.canvas, 0, 0);
    tg.globalCompositeOperation = 'difference';
    tg.drawImage(b, 0, 0);
    tg.globalCompositeOperation = 'source-over';
    over(g, t, 'overlay', v * 0.85);
  };

  /* Vibrance, not saturation: lifts the muted pixels and leaves the already
     saturated ones alone, which is why skin survives it and a saturate()
     call does not. */
  PAINT.vibrance = function (g, w, h, v) {
    perPixel(g, w, h, function (d) {
      for (var i = 0; i < d.length; i += 4) {
        var R = d[i], G = d[i + 1], B = d[i + 2];
        var mx = Math.max(R, G, B), mn = Math.min(R, G, B);
        var sat = (mx - mn) / 255;
        var k = v * (1 - sat) * 1.1;          /* <- the whole idea, right here */
        var l = R * 0.299 + G * 0.587 + B * 0.114;
        d[i]     = clamp(R + (R - l) * k, 0, 255);
        d[i + 1] = clamp(G + (G - l) * k, 0, 255);
        d[i + 2] = clamp(B + (B - l) * k, 0, 255);
      }
    });
  };

  /* Split tone: shadows one way, highlights the other, with the midtones
     left alone. The colourist's move, and not expressible as a filter. */
  /* The three per-luminance OFFSETS, tabulated. Split tone adds to the
     original rather than replacing it, so it cannot use applyRamp — but the
     offsets depend only on luminance, so they tabulate the same way. */
  var SPLIT = (function () {
    var dr = new Float32Array(256), dg = new Float32Array(256), db = new Float32Array(256);
    for (var i = 0; i < 256; i++) {
      var l = i / 255, sh = clamp(1 - l * 2, 0, 1), hi = clamp(l * 2 - 1, 0, 1);
      dr[i] = hi * 26 - sh * 12; dg[i] = hi * 14 - sh * 2; db[i] = sh * 34 - hi * 18;
    }
    return { r: dr, g: dg, b: db };
  }());
  PAINT.splittone = function (g, w, h, v) {
    perPixel(g, w, h, function (d) {
      for (var i = 0; i < d.length; i += 4) {
        var l = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8;
        d[i]     = clamp(d[i]     + SPLIT.r[l] * v, 0, 255);
        d[i + 1] = clamp(d[i + 1] + SPLIT.g[l] * v, 0, 255);
        d[i + 2] = clamp(d[i + 2] + SPLIT.b[l] * v, 0, 255);
      }
    });
  };

  /* A real glow that respects the highlights, as opposed to the bloom
     already in editor-fx.js which lifts everything. Threshold first. */
  PAINT.highlightglow = function (g, w, h, v) {
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    tg.filter = 'brightness(1.6) contrast(2.4) blur(' +
                Math.max(2, Math.min(w, h) * 0.018).toFixed(2) + 'px)';
    tg.drawImage(g.canvas, 0, 0);
    tg.filter = 'none';
    over(g, t, 'screen', v * 0.6);
  };

  /* Directional light leak, four corners, picked by strength so the three
     preset strengths give three different leaks rather than one leak at
     three opacities. */
  PAINT.leak = function (g, w, h, v) {
    var corner = v < 0.5 ? 0 : v < 0.85 ? 1 : 2;
    var pts = [[0, 0], [w, 0], [w, h]];
    var cx = pts[corner][0], cy = pts[corner][1];
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    var gr = tg.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.9);
    gr.addColorStop(0, 'rgba(255,186,92,0.85)');
    gr.addColorStop(0.45, 'rgba(255,96,64,0.30)');
    gr.addColorStop(1, 'rgba(255,60,40,0)');
    tg.fillStyle = gr; tg.fillRect(0, 0, w, h);
    over(g, t, 'screen', v * 0.8);
  };

  /* ---- WARP -------------------------------------------------------------- */

  /* Twirl: angular displacement falling off with radius. Related to the
     swirl transition but this is a sustained effect and the falloff is
     tuned so the centre stays readable. */
  PAINT.twirl = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var steps = 30, maxA = v * P('twirl', 'turns', 2.2);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    for (var i = steps; i >= 1; i--) {
      var r0 = i / steps;
      var a = maxA * (1 - r0) * (1 - r0);
      g.save();
      g.beginPath(); g.arc(w / 2, h / 2, (Math.max(w, h) / 2) * r0, 0, 6.2832); g.clip();
      g.translate(w / 2, h / 2); g.rotate(a); g.translate(-w / 2, -h / 2);
      g.drawImage(src, 0, 0);
      g.restore();
    }
    g.restore();
  };

  /* Frosted glass: per-pixel positional jitter. The jitter comes from the
     hash and not Math.random, so the frost is a fixed pane rather than
     boiling noise. */
  PAINT.frost = function (g, w, h, v) {
    /* DONE AT HALF SIZE AND SCALED BACK. At 1080p with a 7px cell this was
       forty-two thousand drawImage calls and 97ms a frame. The jitter is a
       per-cell displacement, so halving the resolution halves the cell count
       in each axis — a quarter of the calls — and the result is upscaled,
       which is invisible on an effect whose entire character is that the
       picture is broken up. */
    var hw = Math.max(8, w >> 1), hh = Math.max(8, h >> 1);
    var half = sc(5, hw, hh), hg = half.getContext('2d');
    hg.setTransform(1, 0, 0, 1, 0, 0);
    hg.clearRect(0, 0, hw, hh);
    hg.imageSmoothingEnabled = true;
    hg.drawImage(g.canvas, 0, 0, hw, hh);
    var src = copyOf(2, hg, hw, hh);
    var cell = Math.max(2, Math.round(Math.min(hw, hh) / 90));
    /* v * 6, not 1 + v * 5: the old form still jittered by a whole cell at
       strength zero, so the effect could not be dialled off. */
    var amp = cell * v * 6;
    hg.save(); hg.setTransform(1, 0, 0, 1, 0, 0);
    for (var y = 0; y < hh; y += cell) {
      for (var x = 0; x < hw; x += cell) {
        var dx = (hash2(x, y, 33) - 0.5) * amp, dy = (hash2(x, y, 34) - 0.5) * amp;
        hg.drawImage(src, clamp(x + dx, 0, hw - cell), clamp(y + dy, 0, hh - cell),
                     cell, cell, x, y, cell, cell);
      }
    }
    hg.restore();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    g.drawImage(half, 0, 0, hw, hh, 0, 0, w, h);
    g.restore();
  };

  /* Glass blocks: a grid of tiles each magnifying its own contents. Reads as
     thick glass, which is a different thing from frost. */
  PAINT.glassblocks = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var n = Math.max(3, Math.round(P('glassblocks', 'grid', 7)));
    var bw = w / n, bh = h / n, z = 1 + v * 0.5;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var sx = c * bw + bw / 2 - (bw / z) / 2, sy = r * bh + bh / 2 - (bh / z) / 2;
        g.drawImage(src, sx, sy, bw / z, bh / z, c * bw, r * bh, bw, bh);
      }
    }
    g.strokeStyle = 'rgba(255,255,255,' + (0.12 * v) + ')';
    g.lineWidth = 1;
    for (var i = 1; i < n; i++) {
      g.beginPath(); g.moveTo(i * bw, 0); g.lineTo(i * bw, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * bh); g.lineTo(w, i * bh); g.stroke();
    }
    g.restore();
  };

  /* Tunnel: the frame repeated inward at decreasing scale. The classic
     music-video look and three lines of drawImage. */
  PAINT.tunnel = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var n = Math.max(1, Math.round(P('tunnel', 'depth', 5)));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (var i = 1; i <= n; i++) {
      var s = Math.pow(0.72, i);
      g.globalAlpha = (1 - i / (n + 1)) * v;   /* see the note in echo */
      g.drawImage(src, w / 2 - (w * s) / 2, h / 2 - (h * s) / 2, w * s, h * s);
    }
    g.restore();
  };

  /* Quad mirror. The existing `mirror` is one axis and `kaleid` is wedges;
     this is the four-way one, which looks like neither. */
  PAINT.mirror4 = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var t = sc(3, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
    tg.drawImage(src, 0, 0, w / 2, h / 2, 0, 0, w / 2, h / 2);
    tg.save(); tg.translate(w, 0); tg.scale(-1, 1);
    tg.drawImage(src, 0, 0, w / 2, h / 2, 0, 0, w / 2, h / 2); tg.restore();
    tg.save(); tg.translate(0, h); tg.scale(1, -1);
    tg.drawImage(src, 0, 0, w / 2, h / 2, 0, 0, w / 2, h / 2); tg.restore();
    tg.save(); tg.translate(w, h); tg.scale(-1, -1);
    tg.drawImage(src, 0, 0, w / 2, h / 2, 0, 0, w / 2, h / 2); tg.restore();
    over(g, t, 'source-over', v);
  };

  /* Radial (rotational) blur — smeared around the centre rather than out
     from it, which is what the existing zoom blur does. */
  PAINT.radialblur = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var n = 10, span = v * 0.22;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1 / n;
    for (var i = 0; i < n; i++) {
      var a = (i / (n - 1) - 0.5) * span;
      g.save();
      g.translate(w / 2, h / 2); g.rotate(a); g.translate(-w / 2, -h / 2);
      g.drawImage(src, 0, 0);
      g.restore();
    }
    g.restore();
  };

  /* Directional motion blur. */
  PAINT.motionblur = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var n = 10, span = v * w * 0.06;
    var ang = P('motionblur', 'angle', 0) * Math.PI / 180;
    var ux = Math.cos(ang), uy = Math.sin(ang);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1 / n;
    for (var i = 0; i < n; i++) {
      var o = (i / (n - 1) - 0.5) * span;
      g.drawImage(src, o * ux, o * uy);
    }
    g.restore();
  };

  /* Echo trails: the frame drawn at decreasing scale and alpha, which is the
     "trippy" look without needing frame history. */
  PAINT.echo = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var n = Math.max(1, Math.round(P('echo', 'ghosts', 4)));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'lighter';
    for (var i = 1; i <= n; i++) {
      var s = 1 + i * 0.045 * v;
      /* Scaled by v. Without it the ghosts were drawn at the same strength
         whatever the slider said — only their spacing changed — so the
         lowest preset looked identical to the highest. */
      g.globalAlpha = (1 - i / (n + 1)) * 0.5 * v;
      g.drawImage(src, w / 2 - (w * s) / 2, h / 2 - (h * s) / 2, w * s, h * s);
    }
    g.restore();
  };

  /* Polar: the frame wrapped around the centre. Genuinely per-pixel — no
     drawImage arrangement produces a polar remap — so it runs at half. */
  PAINT.polar = function (g, w, h, v) {
    var src = copyOf(2, g, w, h);
    var sw = Math.max(2, w >> 1), sh = Math.max(2, h >> 1);
    var s = sc(4, sw, sh), sg2 = s.getContext('2d');
    sg2.setTransform(1, 0, 0, 1, 0, 0); sg2.clearRect(0, 0, sw, sh);
    sg2.drawImage(src, 0, 0, sw, sh);
    var srcD, outD;
    try {
      srcD = sg2.getImageData(0, 0, sw, sh);
      outD = sg2.createImageData(sw, sh);
    } catch (e) { return; }
    var a = srcD.data, o = outD.data;
    for (var y = 0; y < sh; y++) {
      for (var x = 0; x < sw; x++) {
        var dx = x / sw - 0.5, dy = y / sh - 0.5;
        var ang = Math.atan2(dy, dx), rad = Math.sqrt(dx * dx + dy * dy) * 2;
        var ux = clamp((ang / 6.2832 + 0.5), 0, 0.999) * sw;
        var uy = clamp(rad, 0, 0.999) * sh;
        var si = (((uy | 0) * sw) + (ux | 0)) * 4, di = (y * sw + x) * 4;
        o[di] = a[si]; o[di + 1] = a[si + 1]; o[di + 2] = a[si + 2]; o[di + 3] = 255;
      }
    }
    sg2.putImageData(outD, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    /* The unwarped frame at FULL alpha, then the polar one over it at v.
       Both draws were at alpha v, so at v=0 the painter cleared the frame
       and then drew nothing into it — a transparent frame, measured 130/255
       of change at a strength that is supposed to do nothing at all. */
    g.globalAlpha = 1;
    g.drawImage(src, 0, 0);
    g.globalAlpha = v;
    g.drawImage(s, 0, 0, sw, sh, 0, 0, w, h);
    g.restore();
  };

  /* ---- the catalogue entries the panel reads ----------------------------- */
  FXCAT.bleach        = ['Bleach bypass',  'Contrast up hard, colour pulled out, shadows crushed. The war-film look.'];
  FXCAT.crossprocess  = ['Cross process',  'Wrong chemistry on purpose: blue shadows, yellow-green highlights.'];
  FXCAT.halation      = ['Halation',       'Bright edges bloom warm, the way light scatters inside real film.'];
  FXCAT.orton         = ['Orton glow',     'Soft bloom over a sharp frame. Dreamy without going out of focus.'];
  FXCAT.infrared      = ['Infrared',       'Foliage goes white, sky goes near-black.'];
  FXCAT.cyanotype     = ['Cyanotype',      'The blueprint blue of the oldest photographic process.'];
  FXCAT.platinum      = ['Platinum',       'Warm-white highlights, cold black shadows. A gallery print.'];
  FXCAT.anamorphic    = ['Anamorphic flare', 'The blue horizontal streak a wide cinema lens throws.'];
  FXCAT.starburst     = ['Starburst',      'Cross-shaped flares off every point of light.'];
  FXCAT.bokeh         = ['Bokeh',          'Out-of-focus highlights become discs, not blobs.'];
  FXCAT.lensdirt      = ['Lens dirt',      'Smudges on the glass that only show where light hits them.'];
  FXCAT.pincushion    = ['Pincushion',     'Long-lens distortion, pulling the corners in.'];
  FXCAT.crt           = ['CRT',            'Phosphor stripes, scanline gaps and the glow of the glass.'];
  FXCAT.badsignal     = ['Bad signal',     'Bands torn sideways with the colour coming off them.'];
  FXCAT.vhstrack      = ['VHS tracking',   'The worn-tape band rolling up the picture.'];
  FXCAT.datamosh      = ['Datamosh',       'Macroblocks pulled from the wrong place.'];
  FXCAT.pixelsort     = ['Pixel sort',     'Bright runs reordered by brightness. The glitch-art one.'];
  FXCAT.interlace     = ['Interlace',      'Combing on motion, like broadcast video.'];
  FXCAT.dither        = ['Dither',         'Ordered 4x4 dots. An old display, not noise.'];
  FXCAT.edges         = ['Edge detect',    'Clean one-pixel outlines on a dark field.'];
  FXCAT.neonedge      = ['Neon edges',     'Outlines that glow in colour.'];
  FXCAT.sketch        = ['Pencil sketch',  'Real pencil tone, by dodging against the blurred negative.'];
  FXCAT.cartoon       = ['Cartoon',        'Flat colour plus a drawn outline.'];
  FXCAT.oil           = ['Oil paint',      'Flat brush-blobs from the commonest colour nearby.'];
  FXCAT.stainedglass  = ['Stained glass',  'Cells of flat colour with dark leading between.'];
  FXCAT.thermal       = ['Thermal',        'False colour on heat: black, blue, magenta, yellow, white.'];
  FXCAT.nightvision   = ['Night vision',   'Green tube, sensor noise, bloom and a hard vignette.'];
  FXCAT.solarize      = ['Solarize',       'Highlights fold back on themselves.'];
  FXCAT.threshold     = ['Threshold',      'Pure black and white, no midtones.'];
  FXCAT.clarity       = ['Clarity',        'Local contrast. Texture up without changing exposure.'];
  FXCAT.vibrance      = ['Vibrance',       'Lifts the muted colours and leaves saturated ones alone.'];
  FXCAT.splittone     = ['Split tone',     'Warm highlights, cool shadows, midtones untouched.'];
  FXCAT.highlightglow = ['Highlight glow', 'Only the bright parts bloom.'];
  FXCAT.leak          = ['Light leak',     'Warm light spilling in from a corner.'];
  FXCAT.twirl         = ['Twirl',          'Winds the frame around its centre, centre stays readable.'];
  FXCAT.frost         = ['Frosted glass',  'Seen through a frozen pane.'];
  FXCAT.glassblocks   = ['Glass blocks',   'A grid of tiles each magnifying its own piece.'];
  FXCAT.tunnel        = ['Tunnel',         'The frame repeating inward forever.'];
  FXCAT.mirror4       = ['Quad mirror',    'Mirrored on both axes at once.'];
  FXCAT.radialblur    = ['Radial blur',    'Smeared around the centre, not out from it.'];
  FXCAT.motionblur    = ['Motion blur',    'A straight directional smear.'];
  FXCAT.echo          = ['Echo',           'Ghosts of the frame at growing scales.'];
  FXCAT.polar         = ['Polar warp',     'The frame wrapped around its own centre.'];

  /* =========================================================================
     TRANSITIONS
     =========================================================================
     HOW ONE WORKS, because it is not obvious from the signature and getting
     it wrong produces a transition that does nothing at all.

     The painter is handed the frame of ONE of the two shots, and `dir` says
     which: 'out' for the shot being left, 'in' for the shot being arrived at.
     It reveals the other shot by ERASING part of its own frame —
     destination-out through a mask — because the compositor has already put
     the other shot underneath. So a transition is a moving hole, plus
     whatever distortion is applied to the frame around the hole.

     cover(p, dir) is the fraction that should be GONE. At p=0 nothing is
     revealed; at p=1 everything is. Every painter below is written so that
     those two endpoints are exact, which is what the test asserts: a
     transition that is 96% done at p=1 leaves a visible seam on the cut.
     ========================================================================= */

  /* Erase through a radial gradient from an arbitrary point. Four of the
     shape transitions are this function with different centres. */
  function irisAt(g, w, h, c, cx, cy, soft) {
    var R = Math.sqrt(Math.max(cx, w - cx) * Math.max(cx, w - cx) +
                      Math.max(cy, h - cy) * Math.max(cy, h - cy));
    var r = c * R * (1 + soft);
    maskWith(g, w, h, function (mg) {
      var gr = mg.createRadialGradient(cx, cy, Math.max(0, r * (1 - soft)), cx, cy, Math.max(0.01, r));
      gr.addColorStop(0, '#000');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      mg.fillStyle = gr;
      mg.fillRect(0, 0, w, h);
    });
  }

  /* Erase through a path the caller draws, used by every shape wipe. The
     path is drawn at full opacity, so these are hard-edged by design — the
     feathered ones use a gradient instead. */
  function maskPath(g, w, h, draw) {
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = '#000';
      draw(mg);
    });
  }

  /* ---- SWEEPS AND WIPES -------------------------------------------------- */

  /* The soft sweep on a diagonal. editor-fx.js has it horizontal (luma) and
     vertical (rollup); the diagonal is the one a real edit uses most after
     those two and it was missing. */
  TPAINT.lumadiag = function (g, w, h, p, dir) {
    var c = cover(p, dir), band = 0.4;
    var t = -band + c * (1 + band * 2);
    maskWith(g, w, h, function (mg) {
      var gr = mg.createLinearGradient((t - band) * w, (t - band) * h, (t + band) * w, (t + band) * h);
      if (dir === 'out') { gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); }
      else { gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
      mg.fillStyle = gr; mg.fillRect(0, 0, w, h);
    });
  };

  /* A scanning line with a glow ahead of it. The glow is the point: a bare
     line reads as a wipe, the glow reads as something scanning. */
  TPAINT.scanwipe = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var y = c * h;
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = '#000';
      mg.fillRect(0, 0, w, y);
      /* The feather has to vanish at both ends. At c=0 a fixed 12% band was
         erasing the top of the frame before the transition had started —
         measured 240/255 where it should have been 255 — and at c=1 it left
         the same band un-erased at the bottom. Scaled by how far in we are
         from either end, so the soft edge exists only while it is travelling. */
      var fade = h * 0.12 * Math.min(1, c * 6, (1 - c) * 6);
      if (fade > 0.5) {
        var gr = mg.createLinearGradient(0, y, 0, y + fade);
        gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        mg.fillStyle = gr; mg.fillRect(0, y, w, fade);
      }
    });
    /* The bright edge, drawn on the frame itself rather than the mask. */
    if (c > 0.001 && c < 0.999) {
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'lighter';
      var lg = g.createLinearGradient(0, y - h * 0.03, 0, y + h * 0.03);
      lg.addColorStop(0, 'rgba(120,180,255,0)');
      lg.addColorStop(0.5, 'rgba(160,210,255,0.55)');
      lg.addColorStop(1, 'rgba(120,180,255,0)');
      g.fillStyle = lg; g.fillRect(0, y - h * 0.03, w, h * 0.06);
      g.restore();
    }
  };

  /* A skewed hard edge. Reads as a cut rather than a wipe, which is the
     point of it — fast, graphic, no feather. */
  TPAINT.shearwipe = function (g, w, h, p, dir) {
    var c = cover(p, dir), sk = w * 0.3;
    maskPath(g, w, h, function (mg) {
      /* One quad from off the left edge to the shear line, rather than a
         rectangle plus a triangle. The earlier version mixed a fillRect
         into an open path and filled both, which left the far corner
         uncovered at c=1 — measured 76/255 still opaque where the shot
         should have been completely gone. A single polygon that starts
         beyond the left edge cannot leave a gap at either end. */
      var x = -sk * 2 + c * (w + sk * 4);
      mg.beginPath();
      mg.moveTo(-w, 0);
      mg.lineTo(x + sk, 0);
      mg.lineTo(x - sk, h);
      mg.lineTo(-w, h);
      mg.closePath();
      mg.fill();
    });
  };

  /* Venetian blinds, vertical. The bundle has a horizontal `shutter`; this
     is the other axis and it is feathered, which the bundle's is not. */
  TPAINT.venetian = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('venetian', 'slats', 12)), bw = w / n;
    maskWith(g, w, h, function (mg) {
      /* A solid part plus a short feathered leading edge, not one gradient
         across the whole opened width. With the gradient spanning the
         opening, the far side of every slat stayed semi-transparent and the
         transition topped out at 127/255 — half-done at the end of its own
         run. The feather is now a fixed fraction of the slat, so the solid
         part reaches the full slat width at c=1. */
      /* Shrinking to nothing over the last fifth of the run. A fixed feather
         means the soft trailing edge of every slat is still only half-erased
         when the slat is nominally fully open — it finished 82% done
         (46/255), which is the same seam in a subtler form. */
      var feather = bw * 0.35 * Math.min(1, (1 - c) * 5);
      for (var i = 0; i < n; i++) {
        var open = bw * c;
        var solid = Math.max(0, open - feather);
        mg.fillStyle = '#000';
        mg.fillRect(i * bw, 0, solid, h);
        if (open > solid) {
          var gr = mg.createLinearGradient(i * bw + solid, 0, i * bw + open, 0);
          gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
          mg.fillStyle = gr;
          mg.fillRect(i * bw + solid, 0, open - solid, h);
        }
      }
    });
  };

  /* Horizontal blinds that open from alternating sides, which is what makes
     it read as blinds rather than as bars. */
  TPAINT.blinds = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('blinds', 'slats', 10)), bh = h / n;
    maskPath(g, w, h, function (mg) {
      for (var i = 0; i < n; i++) {
        var x = (i % 2 === 0) ? 0 : w * (1 - c);
        mg.fillRect(x, i * bh, w * c, bh + 1);
      }
    });
  };

  /* A spiral wipe. Drawn as a filled sweep of increasing radius AND angle,
     which is one path rather than a loop over wedges. */
  TPAINT.spiral = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var R = Math.sqrt(w * w + h * h) / 2, turns = P('spiral', 'turns', 2.2);
    maskPath(g, w, h, function (mg) {
      mg.beginPath();
      mg.moveTo(w / 2, h / 2);
      var steps = 140, end = c * turns * 6.2832;
      for (var i = 0; i <= steps; i++) {
        var a = (i / steps) * end;
        var r = (a / (turns * 6.2832)) * R * 1.5;
        mg.lineTo(w / 2 + Math.cos(a - 1.5708) * r, h / 2 + Math.sin(a - 1.5708) * r);
      }
      for (var j = steps; j >= 0; j--) {
        var a2 = (j / steps) * end;
        var r2 = (a2 / (turns * 6.2832)) * R * 1.5 + R * 0.5 * c;
        mg.lineTo(w / 2 + Math.cos(a2 - 1.5708) * r2, h / 2 + Math.sin(a2 - 1.5708) * r2);
      }
      mg.closePath(); mg.fill();
      /* Past three quarters the spiral's own arms no longer cover the
         corners, so the remainder is filled outright. Without this the
         transition never finishes and leaves four lit corners on the cut. */
      if (c > 0.75) {
        mg.globalAlpha = (c - 0.75) / 0.25;
        mg.fillRect(0, 0, w, h);
      }
    });
  };

  /* ---- SHAPES ------------------------------------------------------------ */

  TPAINT.irisdiamond = function (g, w, h, p, dir) {
    var c = cover(p, dir), R = (Math.abs(w) + Math.abs(h)) * c;
    maskPath(g, w, h, function (mg) {
      mg.beginPath();
      mg.moveTo(w / 2, h / 2 - R); mg.lineTo(w / 2 + R, h / 2);
      mg.lineTo(w / 2, h / 2 + R); mg.lineTo(w / 2 - R, h / 2);
      mg.closePath(); mg.fill();
    });
  };

  TPAINT.irishex = function (g, w, h, p, dir) {
    var c = cover(p, dir), R = Math.sqrt(w * w + h * h) * c * 0.62;
    maskPath(g, w, h, function (mg) {
      mg.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = i * 1.0472 - 1.5708;
        var x = w / 2 + Math.cos(a) * R, y = h / 2 + Math.sin(a) * R;
        if (i === 0) mg.moveTo(x, y); else mg.lineTo(x, y);
      }
      mg.closePath(); mg.fill();
    });
  };

  TPAINT.irisstar = function (g, w, h, p, dir) {
    /* A star's inner radius is what reaches the corners, not its points, so
       the multiplier has to be generous AND the last of the run fills the
       rest outright. Without the fill it bottomed out at 17/255 — nearly
       there, which on a cut is a thin bright outline of the old shot. */
    var c = cover(p, dir), R = Math.sqrt(w * w + h * h) * c * 1.15;
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = '#000';
      mg.beginPath();
      for (var i = 0; i < 10; i++) {
        var a = i * 0.6283 - 1.5708;
        var r = (i % 2 === 0) ? R : R * 0.46;
        var x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r;
        if (i === 0) mg.moveTo(x, y); else mg.lineTo(x, y);
      }
      mg.closePath(); mg.fill();
      if (c > 0.86) { mg.globalAlpha = (c - 0.86) / 0.14; mg.fillRect(0, 0, w, h); }
    });
  };

  /* Four corners closing in, which is a different read from an iris opening
     out even though the geometry is a relative of it. */
  TPAINT.corners = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    maskPath(g, w, h, function (mg) {
      var s = c * 0.72;
      mg.beginPath(); mg.moveTo(0, 0); mg.lineTo(w * s, 0); mg.lineTo(0, h * s); mg.closePath(); mg.fill();
      mg.beginPath(); mg.moveTo(w, 0); mg.lineTo(w - w * s, 0); mg.lineTo(w, h * s); mg.closePath(); mg.fill();
      mg.beginPath(); mg.moveTo(0, h); mg.lineTo(w * s, h); mg.lineTo(0, h - h * s); mg.closePath(); mg.fill();
      mg.beginPath(); mg.moveTo(w, h); mg.lineTo(w - w * s, h); mg.lineTo(w, h - h * s); mg.closePath(); mg.fill();
      if (c > 0.7) { mg.globalAlpha = (c - 0.7) / 0.3; mg.fillRect(0, 0, w, h); }
    });
  };

  /* Tiles flipping over one after another, on a diagonal delay so it reads
     as a wave crossing the frame. */
  TPAINT.tilesflip = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('tilesflip', 'tiles', 7));
    var tw = w / n, th = h / n;
    maskPath(g, w, h, function (mg) {
      for (var r = 0; r < n; r++) {
        for (var col = 0; col < n; col++) {
          var delay = (r + col) / (n * 2 - 2);
          var local = clamp((c - delay * 0.6) / 0.4, 0, 1);
          if (local <= 0) continue;
          /* A flip read as a vertical squash, which is what a flip looks
             like without a 3D transform. */
          var hh = th * local;
          mg.fillRect(col * tw, r * th + (th - hh) / 2, tw + 1, hh);
        }
      }
    });
  };

  /* Blocks sliding in by row, alternating direction. */
  TPAINT.blockslide = function (g, w, h, p, dir) {
    var c = cover(p, dir), rows = Math.round(P('blockslide', 'rows', 9)), bh = h / rows;
    maskPath(g, w, h, function (mg) {
      for (var r = 0; r < rows; r++) {
        var d2 = (r % 2 === 0) ? 1 : -1;
        var wid = w * clamp(c * 1.25 - (r / rows) * 0.25, 0, 1);
        mg.fillRect(d2 > 0 ? 0 : w - wid, r * bh, wid, bh + 1);
      }
    });
  };

  /* Mosaic shuffle: tiles appear in a fixed scrambled order. The order comes
     from the hash so it is the same every time the transition plays — a
     shuffle that is different on every render cannot be previewed. */
  TPAINT.mosaicshuffle = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('mosaicshuffle', 'tiles', 12));
    var tw = w / n, th = h / n;
    maskPath(g, w, h, function (mg) {
      for (var r = 0; r < n; r++) {
        for (var col = 0; col < n; col++) {
          if (hash2(col, r, 41) > c) continue;
          mg.fillRect(col * tw, r * th, tw + 1, th + 1);
        }
      }
    });
  };

  /* ---- ORGANIC ----------------------------------------------------------- */

  /* Ink bleed: overlapping blobs growing from fixed seeds. Reads as ink
     because the blobs are irregular and they merge. */
  TPAINT.inkbleed = function (g, w, h, p, dir) {
    var c = cover(p, dir), seeds = Math.round(P('inkbleed', 'blots', 14));
    var R = Math.sqrt(w * w + h * h) * 0.42;
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = '#000';
      for (var i = 0; i < seeds; i++) {
        var cx = hash2(i, 51, 2) * w, cy = hash2(i, 52, 2) * h;
        var grow = clamp(c * 1.5 - hash2(i, 53, 2) * 0.5, 0, 1);
        if (grow <= 0) continue;
        var r = grow * R * (0.6 + hash2(i, 54, 2) * 0.8);
        /* Irregular: the radius wobbles with angle, which is the whole
           difference between ink and a circle. */
        mg.beginPath();
        for (var a = 0; a <= 32; a++) {
          var ang = (a / 32) * 6.2832;
          var wob = 1 + Math.sin(ang * 3 + i) * 0.18 + Math.sin(ang * 7 + i * 2) * 0.09;
          var x = cx + Math.cos(ang) * r * wob, y = cy + Math.sin(ang) * r * wob;
          if (a === 0) mg.moveTo(x, y); else mg.lineTo(x, y);
        }
        mg.closePath(); mg.fill();
      }
      if (c > 0.82) { mg.globalAlpha = (c - 0.82) / 0.18; mg.fillRect(0, 0, w, h); }
    });
  };

  /* Paper tear: a jagged vertical edge travelling across, with the fibres
     showing as a rough line. */
  TPAINT.papertear = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    maskPath(g, w, h, function (mg) {
      var x = c * w * 1.1;
      mg.beginPath();
      mg.moveTo(0, 0);
      var steps = 40;
      for (var i = 0; i <= steps; i++) {
        var y = (i / steps) * h;
        var j = (hash2(i, 61, 4) - 0.5) * w * 0.05;
        mg.lineTo(x + j, y);
      }
      mg.lineTo(0, h);
      mg.closePath(); mg.fill();
    });
  };

  /* Melt: the frame drips downward in columns at different rates. */
  TPAINT.melt = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('melt', 'columns', 26)), cw = w / n;
    maskPath(g, w, h, function (mg) {
      for (var i = 0; i < n; i++) {
        var rate = 0.6 + hash2(i, 71, 8) * 0.9;
        var drop = clamp(c * rate * 1.4, 0, 1);
        mg.fillRect(i * cw, 0, cw + 1, drop * h);
      }
      if (c > 0.8) { mg.globalAlpha = (c - 0.8) / 0.2; mg.fillRect(0, 0, w, h); }
    });
  };

  /* Droplet: concentric rings spreading from a point, each ring a soft band.
     The frame is also displaced outward, which is what makes it water and
     not a target. */
  TPAINT.droplet = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var R = Math.sqrt(w * w + h * h) / 2;
    /* The displacement, as rings of the frame redrawn at a scale that
       oscillates with radius. */
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    var rings = 22, amp = (1 - Math.abs(c - 0.5) * 2) * 0.06;
    for (var i = rings; i >= 1; i--) {
      var r0 = i / rings;
      var s = 1 + Math.sin((r0 - c) * 18) * amp;
      g.save();
      g.beginPath(); g.arc(w / 2, h / 2, R * r0, 0, 6.2832); g.clip();
      g.drawImage(src, w / 2 - (w * s) / 2, h / 2 - (h * s) / 2, w * s, h * s);
      g.restore();
    }
    g.restore();
    irisAt(g, w, h, c, w / 2, h / 2, 0.35);
  };

  /* ---- SIGNAL AND GLITCH ------------------------------------------------- */

  /* Static tune: the frame breaks into television snow and the other side
     tunes in out of it. */
  TPAINT.startune = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var k = 1 - Math.abs(c - 0.5) * 2;          /* peaks at the midpoint */
    var cell = Math.max(2, Math.round(Math.min(w, h) / 220));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = k * 0.85;
    for (var y = 0; y < h; y += cell) {
      for (var x = 0; x < w; x += cell * 3) {
        var n = hash2(x + y * 7, y, 13);
        if (n < 0.55) continue;
        var l = Math.round(n * 255);
        g.fillStyle = 'rgb(' + l + ',' + l + ',' + l + ')';
        g.fillRect(x, y, cell * 3, cell);
      }
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')';
      mg.fillRect(0, 0, w, h);
    });
  };

  /* CRT off: the picture collapses to a bright horizontal line, then the
     line shrinks to a dot. Two stages, and the second one is what people
     recognise. */
  TPAINT.crtoff = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    var stage1 = clamp(c / 0.6, 0, 1), stage2 = clamp((c - 0.6) / 0.4, 0, 1);
    var hh = h * (1 - stage1) + 2;
    var ww = w * (1 - stage2);
    if (ww > 0.5 && hh > 0.5) {
      g.drawImage(src, (w - ww) / 2, (h - hh) / 2, ww, hh);
      /* The line glows brighter as it collapses, because the same beam
         energy is going into fewer lines. */
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = stage1 * 0.7;
      g.fillStyle = '#cfe6ff';
      g.fillRect((w - ww) / 2, h / 2 - Math.max(1, hh * 0.04), ww, Math.max(2, hh * 0.08));
    }
    g.restore();
  };

  /* Tape rewind: horizontal streaking with the picture pulled sideways and
     noise bands through it. */
  TPAINT.taperewind = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var k = 1 - Math.abs(c - 0.5) * 2;
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1 / 7;
    for (var i = 0; i < 7; i++) g.drawImage(src, (i - 3) * w * 0.05 * k, 0);
    g.globalAlpha = 1;
    var bands = Math.round(k * 10);
    for (var b = 0; b < bands; b++) {
      var y = hash2(b, 81, 6) * h, bh = h * 0.03;
      g.globalAlpha = 0.5 * k;
      g.drawImage(src, 0, y, w, bh, (hash2(b, 82, 6) - 0.5) * w * 0.3, y, w, bh);
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Film advance: the frame slips vertically with the black frame bar
     crossing, which is what a projector does between frames. */
  TPAINT.filmadvance = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var off = c * h;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.drawImage(src, 0, -off);
    g.drawImage(src, 0, h - off);
    /* The bar between frames. */
    g.fillStyle = '#07060a';
    g.fillRect(0, h - off - h * 0.025, w, h * 0.05);
    g.restore();
    maskPath(g, w, h, function (mg) { mg.fillRect(0, 0, w, Math.max(0, h - off - h * 0.025)); });
  };

  /* Prism sweep: the travelling edge splits into red, green and blue so the
     seam itself is chromatic. */
  TPAINT.prismsweep = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var sep = w * 0.035 * (1 - Math.abs(c - 0.5) * 2);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    var chans = [['#f00', -sep], ['#0f0', 0], ['#00f', sep]];
    for (var i = 0; i < 3; i++) {
      var t = sc(3 + i, w, h), tg = t.getContext('2d');
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h);
      tg.drawImage(src, 0, 0);
      tg.globalCompositeOperation = 'multiply';
      tg.fillStyle = chans[i][0]; tg.fillRect(0, 0, w, h);
      g.drawImage(t, chans[i][1], 0);
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      var band = 0.3, x0 = -band + c * (1 + band * 2);
      var gr = mg.createLinearGradient((x0 - band) * w, 0, (x0 + band) * w, 0);
      if (dir === 'out') { gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); }
      else { gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
      mg.fillStyle = gr; mg.fillRect(0, 0, w, h);
    });
  };

  /* Strobe cut: hard flashes at decreasing intervals. Deterministic from p,
     so it strobes the same way every play. */
  TPAINT.strobecut = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var phase = Math.sin(c * c * 42) > 0 ? 1 : 0;
    if (phase) {
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - Math.abs(c - 0.5) * 2)) + ')';
      g.fillRect(0, 0, w, h);
      g.restore();
    }
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Colour bleed: saturation runs away before the frame goes, like dye
     spreading in water. */
  TPAINT.colourbleed = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var k = 1 - Math.abs(c - 0.5) * 2;
    var b = blurCopy(2, g, w, h, Math.max(1, Math.min(w, h) * 0.03 * k));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'saturation';
    g.globalAlpha = k;
    g.drawImage(b, 0, 0);
    g.restore();
    over(g, b, 'screen', k * 0.3);
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* ---- CAMERA MOVES ------------------------------------------------------ */

  /* Vertical whip. The horizontal one exists; this is the other axis and it
     is the one used for a cut between two talking heads. */
  TPAINT.whipv = function (g, w, h, p, dir) {
    var k = dir === 'out' ? p : 1 - p;
    var src = copyOf(2, g, w, h);
    var span = h * 0.5 * k;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    /* THE BASE COPY AT FULL ALPHA FIRST. Drawing n copies at 1/n alpha does
       NOT add up to an opaque frame — alpha composites as 1-(1-a)^n, so
       twelve passes at 1/12 reach about 0.65 and the frame came out
       measurably see-through (165/255) even at zero smear. The smear passes
       go on top of a solid base instead. */
    g.drawImage(src, 0, 0);
    var n = 12;
    g.globalAlpha = 1 / n;
    for (var i = 1; i < n; i++) {
      g.drawImage(src, 0, (dir === 'out' ? -1 : 1) * (i / n) * span);
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + cover(p, dir) + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Zoom and rotate together, with the smear that goes with it. */
  TPAINT.zoomrotate = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.drawImage(src, 0, 0);          /* solid base — see the note in whipv */
    var n = 9;
    g.globalAlpha = 1 / n;
    for (var i = 1; i < n; i++) {
      var t = i / (n - 1);
      var s = 1 + c * 0.8 * t, a = c * 0.5 * t;
      g.save();
      g.translate(w / 2, h / 2); g.rotate(a); g.scale(s, s); g.translate(-w / 2, -h / 2);
      g.drawImage(src, 0, 0);
      g.restore();
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Pull focus: through a defocus and out the other side. The blur peaks at
     the midpoint, which is where the cut actually lands. */
  TPAINT.pullfocus = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var k = 1 - Math.abs(c - 0.5) * 2;
    var b = blurCopy(2, g, w, h, Math.max(0, Math.min(w, h) * 0.05 * k));
    over(g, b, 'source-over', k);
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Crush: squashed vertically to nothing and back. */
  TPAINT.crush = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var hh = h * (1 - c);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    if (hh > 0.5) g.drawImage(src, 0, (h - hh) / 2, w, hh);
    g.restore();
  };

  /* Split apart: the frame halves slide off opposite ways. */
  TPAINT.splitv = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    var off = c * w * 0.6;
    g.drawImage(src, 0, 0, w, h / 2, -off, 0, w, h / 2);
    g.drawImage(src, 0, h / 2, w, h / 2, off, h / 2, w, h / 2);
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + clamp(c * 1.4 - 0.4, 0, 1) + ')';
      mg.fillRect(0, 0, w, h);
    });
  };

  TPAINT.splith = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    var off = c * h * 0.6;
    g.drawImage(src, 0, 0, w / 2, h, 0, -off, w / 2, h);
    g.drawImage(src, w / 2, 0, w / 2, h, w / 2, off, w / 2, h);
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + clamp(c * 1.4 - 0.4, 0, 1) + ')';
      mg.fillRect(0, 0, w, h);
    });
  };

  /* Wobble: a travelling sine on the horizontal, which is the jelly look. */
  TPAINT.wobble = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var k = 1 - Math.abs(c - 0.5) * 2;
    var src = copyOf(2, g, w, h);
    var band = Math.max(2, Math.round(h / 90));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    for (var y = 0; y < h; y += band) {
      var dx = Math.sin(y / h * P('wobble', 'waves', 12) + c * 10) * w * 0.07 * k;
      g.drawImage(src, 0, y, w, band, dx, y, w, band);
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Vortex: rotation that increases toward the edge while the whole frame
     shrinks — a drain rather than a spin. */
  TPAINT.vortex = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var R = Math.max(w, h) / 2, steps = 26;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    /* The rings are circles and the frame is a rectangle, so the four
       corners fall outside the largest ring and were never drawn — the
       frame read 240/255 at rest with four transparent corners. The
       undistorted frame goes down first and the rings distort over it. */
    g.drawImage(src, 0, 0);
    for (var i = steps; i >= 1; i--) {
      var r0 = i / steps;
      var a = c * P('vortex', 'spin', 3.4) * r0, s = 1 - c * 0.55;
      g.save();
      g.beginPath(); g.arc(w / 2, h / 2, R * r0, 0, 6.2832); g.clip();
      g.translate(w / 2, h / 2); g.rotate(a); g.scale(s, s); g.translate(-w / 2, -h / 2);
      g.drawImage(src, 0, 0);
      g.restore();
    }
    g.restore();
    irisAt(g, w, h, clamp(c * 1.3 - 0.3, 0, 1), w / 2, h / 2, 0.5);
  };

  /* ---- LIGHT ------------------------------------------------------------- */

  /* A lens flare that travels across and takes the frame with it. */
  TPAINT.lensflare = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var x = c * w, k = 1 - Math.abs(c - 0.5) * 2;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'lighter';
    /* The core. */
    var gr = g.createRadialGradient(x, h / 2, 0, x, h / 2, Math.min(w, h) * 0.5 * k);
    gr.addColorStop(0, 'rgba(255,245,220,' + (0.9 * k) + ')');
    gr.addColorStop(0.3, 'rgba(255,190,120,' + (0.35 * k) + ')');
    gr.addColorStop(1, 'rgba(255,140,80,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    /* The streak, and the ghosts along the axis — both are what make it a
       flare rather than a glow. */
    g.fillStyle = 'rgba(255,230,200,' + (0.3 * k) + ')';
    g.fillRect(0, h / 2 - h * 0.006, w, h * 0.012);
    var gh = Math.round(P('lensflare', 'ghosts', 3));
    for (var i = 1; i <= gh; i++) {
      var gx = x + (w / 2 - x) * i * 0.7, r = Math.min(w, h) * 0.04 * i;
      var g2 = g.createRadialGradient(gx, h / 2, 0, gx, h / 2, r);
      g2.addColorStop(0, 'rgba(160,255,210,' + (0.18 * k) + ')');
      g2.addColorStop(1, 'rgba(160,255,210,0)');
      g.fillStyle = g2;
      g.beginPath(); g.arc(gx, h / 2, r, 0, 6.2832); g.fill();
    }
    g.restore();
    maskWith(g, w, h, function (mg) {
      var band = 0.25, x0 = -band + c * (1 + band * 2);
      var lg = mg.createLinearGradient((x0 - band) * w, 0, (x0 + band) * w, 0);
      if (dir === 'out') { lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, '#000'); }
      else { lg.addColorStop(0, '#000'); lg.addColorStop(1, 'rgba(0,0,0,0)'); }
      mg.fillStyle = lg; mg.fillRect(0, 0, w, h);
    });
  };

  /* A hard light streak crossing on a diagonal. */
  TPAINT.lightstreak = function (g, w, h, p, dir) {
    var c = cover(p, dir), k = 1 - Math.abs(c - 0.5) * 2;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.translate(w * (c * 1.6 - 0.3), 0);
    g.rotate(-0.42);
    var gr = g.createLinearGradient(-w * 0.12, 0, w * 0.12, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,' + (0.75 * k) + ')');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(-w * 0.12, -h, w * 0.24, h * 3);
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Heartbeat: two scale pulses and then the cut, timed so the second pulse
     lands on the frame the cut happens on. */
  TPAINT.heartbeat = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var pulse = Math.abs(Math.sin(c * 6.2832)) * (1 - c) * 0.16;
    var s = 1 + pulse;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.drawImage(src, w / 2 - (w * s) / 2, h / 2 - (h * s) / 2, w * s, h * s);
    g.restore();
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = 'rgba(0,0,0,' + c + ')'; mg.fillRect(0, 0, w, h);
    });
  };

  /* Glass wipe: a refracting vertical band that magnifies what is behind it
     as it crosses. */
  TPAINT.glasswipe = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var src = copyOf(2, g, w, h);
    var x = c * w, bw = w * P('glasswipe', 'band', 0.16);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.beginPath(); g.rect(x - bw / 2, 0, bw, h); g.clip();
    var z = 1.35;
    g.drawImage(src, w / 2 - (w * z) / 2, h / 2 - (h * z) / 2, w * z, h * z);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(200,225,255,0.12)';
    g.fillRect(x - bw / 2, 0, bw, h);
    g.restore();
    /* The band has width, so erasing only up to its leading edge leaves a
        half-band of the old shot standing at the end — measured 20/255,
        which is a visible vertical strip on the cut. Past the point where
        the band runs off the right edge, the rest goes too. */
    maskPath(g, w, h, function (mg) {
      mg.fillRect(0, 0, Math.max(0, x - bw / 2), h);
      if (c > 0.88) {
        mg.globalAlpha = (c - 0.88) / 0.12;
        mg.fillRect(0, 0, w, h);
      }
    });
  };

  /* Ripple grid: a grid of cells each rippling on a delay from the centre. */
  TPAINT.ripplegrid = function (g, w, h, p, dir) {
    var c = cover(p, dir), n = Math.round(P('ripplegrid', 'cells', 10));
    var tw = w / n, th = h / n;
    var src = copyOf(2, g, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    for (var r = 0; r < n; r++) {
      for (var col = 0; col < n; col++) {
        var dxc = (col + 0.5) / n - 0.5, dyc = (r + 0.5) / n - 0.5;
        var dist = Math.sqrt(dxc * dxc + dyc * dyc) * 1.42;
        var local = clamp((c - dist * 0.55) / 0.45, 0, 1);
        var s = 1 - local;
        if (s <= 0.01) continue;
        var cw = tw * s, ch = th * s;
        g.drawImage(src, col * tw, r * th, tw, th,
                    col * tw + (tw - cw) / 2, r * th + (th - ch) / 2, cw, ch);
      }
    }
    g.restore();
  };

  /* Heavy grain dissolve — coarser and more violent than the existing
     `grain`, which is a fine-grain film dissolve. */
  TPAINT.grainheavy = function (g, w, h, p, dir) {
    var c = cover(p, dir);
    var cell = Math.max(3, Math.round(Math.min(w, h) / 90));
    maskWith(g, w, h, function (mg) {
      mg.fillStyle = '#000';
      for (var y = 0; y < h; y += cell) {
        for (var x = 0; x < w; x += cell) {
          if (hash2(x / cell | 0, y / cell | 0, 91) > c) continue;
          mg.fillRect(x, y, cell, cell);
        }
      }
    });
  };

  /* ---- the catalogue entries the panel reads ----------------------------- */
  /* [label, category, isPaint, description] — the shape editor-trans.js uses,
     and `1` for paint because every one of these rewrites pixels. */
  TCAT.lumadiag      = ['Diagonal sweep', 'Smooth', 1, 'The soft sweep, running corner to corner.'];
  TCAT.scanwipe      = ['Scan line',      'Light',  1, 'A glowing line scans down and takes the frame with it.'];
  TCAT.shearwipe     = ['Shear wipe',     'Shape',  1, 'A skewed hard edge. Graphic, fast, no feather.'];
  TCAT.venetian      = ['Venetian',       'Shape',  1, 'Vertical slats opening, each one feathered.'];
  TCAT.blinds        = ['Blinds',         'Shape',  1, 'Horizontal blinds opening from alternating sides.'];
  TCAT.spiral        = ['Spiral',         'Shape',  1, 'Winds outward from the centre in a spiral.'];
  TCAT.irisdiamond   = ['Diamond iris',   'Shape',  1, 'Opens as a diamond.'];
  TCAT.irishex       = ['Hex iris',       'Shape',  1, 'Opens as a hexagon.'];
  TCAT.irisstar      = ['Star iris',      'Shape',  1, 'Opens as a five-pointed star.'];
  TCAT.corners       = ['Corners',        'Shape',  1, 'All four corners close in at once.'];
  TCAT.tilesflip     = ['Tile flip',      'Shape',  1, 'Tiles flip over in a wave across the frame.'];
  TCAT.blockslide    = ['Block slide',    'Motion', 1, 'Rows slide in from alternating sides.'];
  TCAT.mosaicshuffle = ['Mosaic',         'Shape',  1, 'Tiles appear in a scrambled but fixed order.'];
  TCAT.inkbleed      = ['Ink bleed',      'Smooth', 1, 'Irregular blots spread and merge until the frame is gone.'];
  TCAT.papertear     = ['Paper tear',     'Shape',  1, 'A jagged fibrous edge rips across.'];
  TCAT.melt          = ['Melt',           'Smooth', 1, 'Drips away in columns at different rates.'];
  TCAT.droplet       = ['Droplet',        'Motion', 1, 'Rings spread from the centre and the frame rides them.'];
  TCAT.startune      = ['Static tune',    'Glitch', 1, 'Breaks into television snow and tunes back in.'];
  TCAT.crtoff        = ['CRT off',        'Glitch', 1, 'Collapses to a bright line, then to a dot.'];
  TCAT.taperewind    = ['Tape rewind',    'Glitch', 1, 'Horizontal streaking with the picture pulled sideways.'];
  TCAT.filmadvance   = ['Film advance',   'Glitch', 1, 'Slips vertically with the projector frame bar crossing.'];
  TCAT.prismsweep    = ['Prism sweep',    'Glitch', 1, 'The seam itself splits into red, green and blue.'];
  TCAT.strobecut     = ['Strobe cut',     'Light',  1, 'Hard flashes closing up to the cut.'];
  TCAT.colourbleed   = ['Colour bleed',   'Light',  1, 'Saturation runs away like dye in water.'];
  TCAT.whipv         = ['Whip up',        'Motion', 1, 'The whip pan, on the vertical.'];
  TCAT.zoomrotate    = ['Zoom spin',      'Motion', 1, 'Pushes in and rotates, with the smear that follows.'];
  TCAT.pullfocus     = ['Pull focus',     'Smooth', 1, 'Out of focus at the midpoint and sharp again after.'];
  TCAT.crush         = ['Crush',          'Motion', 1, 'Squashed flat to nothing.'];
  TCAT.splitv        = ['Split across',   'Motion', 1, 'Top and bottom halves slide opposite ways.'];
  TCAT.splith        = ['Split down',     'Motion', 1, 'Left and right halves slide opposite ways.'];
  TCAT.wobble        = ['Wobble',         'Motion', 1, 'A travelling jelly ripple on the horizontal.'];
  TCAT.vortex        = ['Vortex',         'Motion', 1, 'Spins down a drain, faster at the edge.'];
  TCAT.lensflare     = ['Lens flare',     'Light',  1, 'A flare with streak and ghosts travels across.'];
  TCAT.lightstreak   = ['Light streak',   'Light',  1, 'One hard diagonal band of light crossing.'];
  TCAT.heartbeat     = ['Heartbeat',      'Motion', 1, 'Two scale pulses, the second one on the cut.'];
  TCAT.glasswipe     = ['Glass wipe',     'Shape',  1, 'A refracting band magnifies what is behind it.'];
  TCAT.ripplegrid    = ['Ripple grid',    'Shape',  1, 'Cells shrink away on a delay from the centre.'];
  TCAT.grainheavy    = ['Heavy grain',    'Smooth', 1, 'Coarse grain, much more violent than a film dissolve.'];

  /* =========================================================================
     REGISTRATION
     =========================================================================
     Into the live registries, not over them: `PAINT` and `TPAINT` on NC_FX
     are the same objects the renderer reads every frame, and the two
     catalogues are the same objects the panels read when they open. Keys
     are only ever ADDED — an existing id is left alone, so this file can
     never shadow a painter editor-fx.js already has, whatever gets added
     to either file later.
     ========================================================================= */
  /* ---- STRENGTH ZERO MUST DO NOTHING AT ALL ------------------------------
     Four of the painters here work on a downscaled copy because they need to
     look at neighbouring pixels. That resample costs a little sharpness
     whatever the blend does afterwards, so at v=0 they returned a very
     slightly soft frame rather than the frame they were given — measured as
     13/255 of change at a setting that means "off".

     Thirteen is not visible on one clip. It is visible when the editor
     applies several painters in a chain and each one resamples again, and it
     is wrong in principle: a user who drags a slider to zero is entitled to
     their frame back, byte for byte, and an effect that cannot be turned off
     from its own control is a bug however small the number is.

     One guard here rather than an early return in each painter, so the
     invariant holds for anything added to this file later without the author
     having to remember it. The threshold is 0.002 and not 0 because the
     editor's own slider arithmetic can land on 1e-16. */
  function guarded(fn) {
    return function (g, w, h, v) {
      if (!(v > 0.002)) return;
      return fn(g, w, h, v);
    };
  }
  for (var _k in PAINT) {
    if (Object.prototype.hasOwnProperty.call(PAINT, _k)) PAINT[_k] = guarded(PAINT[_k]);
  }

  function mergeNew(into, from, what) {
    var added = 0, clashed = [];
    if (!into) return { added: 0, clashed: clashed };
    for (var k in from) {
      if (!Object.prototype.hasOwnProperty.call(from, k)) continue;
      if (Object.prototype.hasOwnProperty.call(into, k)) { clashed.push(k); continue; }
      into[k] = from[k]; added++;
    }
    if (clashed.length) {
      /* Loud, because a silent clash means somebody's effect quietly stopped
         being the one they wrote. */
      try {
        console.warn('[NC_FX_PACK] ' + what + ': left alone, already defined: ' + clashed.join(', '));
      } catch (e) {}
    }
    return { added: added, clashed: clashed };
  }

  function register() {
    var fx = window.NC_FX, ui = window.NC_TRANS_UI;
    if (!fx) return false;
    var r = {
      paint:  mergeNew(fx.PAINT, PAINT, 'PAINT'),
      tpaint: mergeNew(fx.TPAINT, TPAINT, 'TPAINT'),
      fxcat:  ui ? mergeNew(ui.effects, FXCAT, 'effects catalogue') : { added: 0, clashed: [] },
      tcat:   ui ? mergeNew(ui.list, TCAT, 'transition catalogue') : { added: 0, clashed: [] }
    };
    window.NC_FX_PACK.registered = r;
    window.NC_FX_PACK.ready = true;
    try {
      window.dispatchEvent(new CustomEvent('nc-fx-pack', { detail: r }));
    } catch (e) {}
    return true;
  }

  /* ---- WHICH ONES ARE EXPENSIVE, MEASURED ---------------------------------
     Timed at 1920x1080, best of three after two warm-up passes, in a
     headless container with NO GPU — so these are software-rasterised and
     are the worst case rather than the typical one. Three reference points
     from the same machine, which are what make the numbers readable:

         GPU-path drawImage of a 1080p canvas            3.4 ms
         getImageData + a real per-pixel loop + put      8.0 ms
         ONE canvas blur() filter                       28.4 ms

     That third number is the story. Everything in this list is dominated by
     blur filters or by repeated full-frame composite draws, both of which a
     real GPU does roughly an order of magnitude faster. I cannot measure the
     figure on a real machine from here and am not going to pretend the
     software number is the real one.

     What this is FOR: the renderer can drop the preview to half resolution
     for these while scrubbing and keep full resolution for the export, which
     is the standard answer and needs a list like this to act on. Nothing
     consumes it yet — editor-perf.js is the natural place and that is a
     separate change, not one to bury in here.

     The median effect in the file is 2.9 ms. This is a tail of thirteen, not
     a property of the pack. */
  var COST = {
    starburst: 91, clarity: 72, sketch: 62, oil: 54, vibrance: 53,
    anamorphic: 52, nightvision: 51, highlightglow: 50, thermal: 43,
    platinum: 43, neonedge: 38, frost: 34, cyanotype: 32,
    pullfocus: 34   /* the only transition in the tail */
  };
  function heavy(id) { return (COST[id] || 0) > 33.3; }

  /* ---- A SIGNPOST IN THE PANEL PEOPLE ACTUALLY OPEN ----------------------
     The editor has two Effects panels and they are not the same one.

       the left rail's "Effects"   drawn by the React bundle from its own
                                   fixed list. Says "36 effects available"
                                   and always will — nothing outside the
                                   bundle can add a row to it.
       the FX library pill         this pack's 51, plus 82 transitions.

     Somebody looking for an effect clicks the one in the rail, counts 36,
     and concludes the new ones were never added. That happened three times
     in one session to the person who asked for them, which is not a user
     failing to read — it is two panels with the same name and no connection
     between them.

     So the rail panel gets one line pointing at the other one. It is found
     by its own subtitle, "<n> effects available", because that <p> is the
     only stable handle the bundle gives: no id, no data attribute, and a
     className of Tailwind utilities that a rebuild would renumber. The
     number is read rather than assumed, so if the bundle's list ever changes
     size the signpost still matches what is above it.

     Inline styles, because React owns className on its own nodes — though
     not on this one, which is ours; the inline rule is for the neighbours'
     stylesheet rather than for React. */
  function openEffectsLibrary() {
    var ui = window.NC_TRANS_UI;
    if (!ui || typeof ui.open !== 'function') return;
    if (!document.querySelector('.nctr')) ui.open();   /* open() toggles */
    setTimeout(function () {
      var panel = document.querySelector('.nctr');
      if (!panel) return;
      var tabs = panel.querySelectorAll('.cats .cat');
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].textContent !== 'Effects') continue;
        if (tabs[i].className.indexOf('on') < 0) tabs[i].click();
        break;
      }
      var q = panel.querySelector('.q');
      if (q) { try { q.focus(); } catch (e) {} }
    }, 70);
  }

  function signpost() {
    var ps = document.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (!/^\d+\s+effects available$/.test((p.textContent || '').trim())) continue;
      var host = p.parentNode;
      if (!host || host.querySelector('.ncfx-more')) return;   /* already placed */
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ncfx-more';
      /* COUNTED FROM THE CATALOGUE THE CLICK ACTUALLY OPENS, not from this
         pack's own total. Saying "+43 more" beside "36 available" promises
         79 and then opens a panel holding 51 — because 8 of those 51 were
         catalogued before this file existed. A signpost whose number does
         not match the room it points at is worse than no signpost. */
      var lib = 0;
      try { lib = Object.keys(window.NC_TRANS_UI.effects).length; } catch (e) {}
      if (!lib) lib = Object.keys(FXCAT).length;
      b.textContent = 'Open the FX library — ' + lib + ' effects →';
      b.title = 'Film, lens, glitch, stylise and warp — ' + lib +
                ' effects, in the panel this one cannot list';
      b.style.cssText = 'display:block;margin:6px 0 0;padding:5px 9px;width:100%;' +
        'font:600 10px/1.3 inherit;text-align:left;cursor:pointer;' +
        'color:#C4B5FD;background:rgba(124,92,255,.14);' +
        'border:1px solid rgba(124,92,255,.42);border-radius:8px;';
      b.onmouseenter = function () { b.style.background = 'rgba(124,92,255,.26)'; };
      b.onmouseleave = function () { b.style.background = 'rgba(124,92,255,.14)'; };
      b.onclick = openEffectsLibrary;
      host.insertBefore(b, p.nextSibling);
      return;
    }
  }

  window.NC_FX_PACK = {
    PAINT: PAINT, TPAINT: TPAINT, FXCAT: FXCAT, TCAT: TCAT,
    register: register, ready: false,
    cost: COST, heavy: heavy,
    signpost: signpost, openEffects: openEffectsLibrary,
    counts: { effects: Object.keys(PAINT).length, transitions: Object.keys(TPAINT).length }
  };

  /* The rail panel is mounted and unmounted as the rail is clicked, so this
     rides an observer rather than running once. Cheap: it only walks <p>
     elements, and it returns the moment it has placed the row. */
  try {
    var mo = new MutationObserver(function () { signpost(); });
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
    else document.addEventListener('DOMContentLoaded', function () {
      mo.observe(document.body, { childList: true, subtree: true });
    });
  } catch (e) {}

  /* editor-fx.js and editor-trans.js may or may not have run yet depending
     on script order, and the editor is a bundle that boots asynchronously.
     So: try now, and if the registries are not up yet, keep trying briefly
     rather than assuming an order that a future edit to editor.html would
     silently break. */
  if (!register()) {
    var tries = 0;
    var t = setInterval(function () {
      if (register() || ++tries > 80) clearInterval(t);
    }, 100);
  }
})();
