/* NOVACLIP — SEEING THE EFFECTS AND TRANSITIONS BEFORE YOU USE THEM
 * =================================================================
 * Asked for: "make it possible to see the preview of the effects and
 * transitions on the editor". Two panels, 36 effects and 26 transitions, and
 * neither of them showed you anything — a name, a little line icon, and a
 * slider or an In/Out pair. You picked "Kaleidoscope" over "Prism" by reading
 * two words.
 *
 * So every tile gets a live thumbnail. But measuring what those tiles would
 * actually be previewing turned up two things that had to be fixed first,
 * because a preview of something that does nothing is a worse lie than no
 * preview at all.
 *
 * ------------------------------------------------------------------------
 * ONE: ALL TWENTY-SIX TRANSITIONS WERE THE SAME FADE
 * ------------------------------------------------------------------------
 * The renderer holds the whole of it:
 *
 *     let m = 1;
 *     if (t.transitionIn  && u < t.transitionIn.duration)  m = u / t.transitionIn.duration;
 *     if (t.transitionOut && u > t.duration - t.transitionOut.duration) m = ...;
 *     e.globalAlpha *= m;
 *
 * `type` is never read. Not once, anywhere in the draw path — the only places
 * it appears at all are two tooltips on the timeline ribbon. Slide did not
 * slide, Zoom did not zoom, 3D Cube did not rotate. Checked rather than
 * assumed: the same clip at the same playhead with `fade`, `slide` and `cube`
 * rendered three byte-identical PNGs.
 *
 * ------------------------------------------------------------------------
 * TWO: FIVE OF THE THIRTY-SIX EFFECTS HAD NO RENDERING AT ALL
 * ------------------------------------------------------------------------
 * Everything an effect does in this editor happens in one function that turns
 * the effects object into a CSS filter string for the canvas. Five keys are
 * absent from it: filmGrain, emboss, chromaticAberration, shake and zoomPunch.
 * Their sliders moved, their percentages counted up, and nothing happened.
 *
 * ------------------------------------------------------------------------
 * HOW THIS IS PUT TOGETHER
 * ------------------------------------------------------------------------
 * ONE DEFINITION, TWO CONSUMERS. The tables below are the only description of
 * what a transition or an effect does. The renderer reads them through the
 * draw hook; the thumbnails read them by drawing onto their own canvas with
 * the same function. A preview cannot drift from the thing it is previewing,
 * because there is nothing for it to drift from — they are not two
 * implementations that have to be kept in step, they are one.
 *
 * THE PREVIEWS ARE CANVASES, NOT CSS. The first attempt drove the thumbnails
 * with clip-path and CSS transforms, which is cheaper and was wrong: half
 * these transitions clip to shapes CSS cannot express in one path — shutter's
 * bands and checker's squares are disjoint regions, and clip-path polygons
 * cannot have holes. A canvas takes the identical ctx calls the real renderer
 * takes, so the tile is running the transition rather than imitating it.
 *
 * WHAT THEY PREVIEW ON. Your own footage when there is any — the first image
 * or video in the project, so the effect is shown on the thing you are
 * actually cutting. A built-in test card when there is not, chosen to have
 * flat colour, a hard edge, fine detail and a face-ish shape in it, because an
 * effect demonstrated on a plain gradient shows you almost nothing: blur,
 * sharpen, posterize and edge-detect all need detail to read against.
 *
 * MOTION ON HOVER, A POSE AT REST. Twenty-six thumbnails all animating at once
 * is a panel nobody can look at. At rest each transition holds a pose halfway
 * through itself, which is the frame that distinguishes it from the others;
 * hovering it, or tapping it on a phone, plays the whole thing on a loop. The
 * effects are the same idea: the thumbnail shows your current slider value, and
 * hovering shows the effect at full strength so you can tell what it is before
 * committing to it.
 *
 * IT CHAINS, IT DOES NOT REPLACE. grade.js already owns window.__ncGrade for
 * colour grading. This keeps a reference to whatever was there and calls it
 * first, so the two compose instead of one quietly deleting the other. Load
 * order in editor.html puts this after grade.js for that reason.
 */
(function () {
  'use strict';
  if (window.NC_FX) return;

  var W = 320, H = 180;             /* the test card, and the preview aspect */

  /* ==========================================================================
     THE EFFECTS TABLE
     ==========================================================================
     The first thirty-one are transcribed from the renderer's own filter
     builder, value for value. They are not "close to" what the editor does,
     they are what it does — the constants are copied across so a thumbnail
     showing blur at 40% is showing blur(8px), which is exactly what the canvas
     will get.

     The last three are new. filmGrain, emboss and chromaticAberration were in
     the panel, in the effects object and in the AI presets, and were in no
     branch of the filter builder, so all three were sliders wired to nothing.
     They are written in the same idiom as the rest and in the same honest
     spirit: a CSS filter chain cannot do a real emboss convolution or a true
     three-channel split, so these are the nearest thing the medium has rather
     than a promise the renderer cannot keep.
     ========================================================================== */
  var FX = {
    blur:        function (v) { return 'blur(' + (v * 20) + 'px)'; },
    sharpen:     function (v) { return 'contrast(' + (1 + v) + ')'; },
    vintage:     function (v) { return 'sepia(' + v + ')'; },
    pixelate:    function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    glow:        function (v) { return 'brightness(' + (1 + v * .5) + ')'; },
    bloom:       function (v) { return 'brightness(' + (1 + v * .3) + ') saturate(' + (1 + v * .4) + ')'; },
    vignette:    function (v) { return 'contrast(' + (1 - v * .2) + ')'; },
    noise:       function (v) { return 'contrast(' + (1 + v * .1) + ')'; },
    rgbSplit:    function (v) { return 'saturate(' + (1 + v * .3) + ')'; },
    glitch:      function (v) { return 'hue-rotate(' + (v * 90) + 'deg)'; },
    glitchRGB:   function (v) { return 'saturate(' + (1 + v * .5) + ') hue-rotate(' + (v * 45) + 'deg)'; },
    scanlines:   function (v) { return 'contrast(' + (1 + v * .15) + ')'; },
    dreamy:      function (v) { return 'brightness(' + (1 + v * .2) + ') blur(' + (v * 3) + 'px)'; },
    prism:       function (v) { return 'hue-rotate(' + (v * 180) + 'deg) saturate(' + (1 + v * .3) + ')'; },
    neon:        function (v) { return 'saturate(' + (1 + v * .6) + ') brightness(' + (1 + v * .2) + ')'; },
    toon:        function (v) { return 'contrast(' + (1 + v * .4) + ') saturate(' + (1 + v * .3) + ')'; },
    invert:      function (v) { return 'invert(' + v + ')'; },
    grayscale:   function (v) { return 'grayscale(' + v + ')'; },
    sepia:       function (v) { return 'sepia(' + v + ')'; },
    nightVision: function (v) { return 'brightness(' + (1 + v * .4) + ') saturate(' + (1 + v * .5) + ') hue-rotate(' + (v * 80) + 'deg)'; },
    thermal:     function (v) { return 'hue-rotate(' + (v * 180) + 'deg) saturate(' + (1 + v * .5) + ')'; },
    hologram:    function (v) { return 'hue-rotate(' + (v * 120) + 'deg) brightness(' + (1 + v * .2) + ')'; },
    posterize:   function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    edgeDetect:  function (v) { return 'contrast(' + (1 + v * .5) + ')'; },
    halftone:    function (v) { return 'contrast(' + (1 + v * .2) + ')'; },
    mirror:      function (v) { return 'saturate(' + (1 + v * .1) + ')'; },
    kaleidoscope:function (v) { return 'hue-rotate(' + (v * 60) + 'deg)'; },
    crosshatch:  function (v) { return 'contrast(' + (1 + v * .2) + ')'; },
    dots:        function (v) { return 'contrast(' + (1 + v * .15) + ')'; },
    ascii:       function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    wave:        function (v) { return 'saturate(' + (1 + v * .1) + ')'; },

    /* THE THREE THAT WERE WIRED TO NOTHING. */
    filmGrain:   function (v) { return 'contrast(' + (1 + v * .18) + ') saturate(' + (1 - v * .25) + ') sepia(' + (v * .12) + ')'; },
    emboss:      function (v) { return 'grayscale(' + (v * .85) + ') contrast(' + (1 + v * .7) + ') brightness(' + (1 + v * .1) + ')'; },
    chromaticAberration: function (v) { return 'saturate(' + (1 + v * .8) + ') hue-rotate(' + (v * 12) + 'deg) contrast(' + (1 + v * .1) + ')'; }
  };

  /* shake and zoomPunch are movement, not colour, so they cannot live in a
     filter string at all — which is presumably why they were left out of one.
     They belong in the per-frame hook with the transitions, and they are the
     only two effects that need the playhead to mean anything. */
  var MOTION = {
    shake: function (v, t) {
      return { tx: Math.sin(t * 47) * v * .035 + Math.sin(t * 31) * v * .02,
               ty: Math.cos(t * 43) * v * .03 };
    },
    zoomPunch: function (v, t) {
      /* One punch per beat-ish, decaying inside each cycle, so it reads as a
         hit rather than a wobble. */
      var f = t % .6 / .6;
      var k = Math.pow(1 - f, 3);
      return { sx: 1 + v * .25 * k, sy: 1 + v * .25 * k };
    }
  };

  /* Names as the panel prints them, to the keys the store uses. The panel is
     built from a list this file cannot reach, so the tiles are matched by the
     one thing on screen — their label. */
  var FX_NAMES = {
    'Blur': 'blur', 'Glow': 'glow', 'Vignette': 'vignette', 'Noise': 'noise',
    'RGB Split': 'rgbSplit', 'Sharpen': 'sharpen', 'Pixelate': 'pixelate',
    'Vintage': 'vintage', 'Film Grain': 'filmGrain', 'Emboss': 'emboss',
    'Chromatic Aberration': 'chromaticAberration', 'Glitch': 'glitch',
    'Mirror': 'mirror', 'Kaleidoscope': 'kaleidoscope', 'Posterize': 'posterize',
    'Edge Detect': 'edgeDetect', 'Halftone': 'halftone', 'ASCII': 'ascii',
    'Night Vision': 'nightVision', 'Thermal': 'thermal', 'Hologram': 'hologram',
    'Dreamy': 'dreamy', 'Prism': 'prism', 'Wave': 'wave', 'Shake': 'shake',
    'Zoom Punch': 'zoomPunch', 'Glitch RGB': 'glitchRGB', 'Scanlines': 'scanlines',
    'Bloom': 'bloom', 'Toon': 'toon', 'Crosshatch': 'crosshatch', 'Dots': 'dots',
    'Neon': 'neon', 'Invert': 'invert', 'Grayscale': 'grayscale', 'Sepia': 'sepia'
  };

  /* A painter key has no filter of its own — its whole look is drawn. Asking
     for one would put the bundle's old duplicate back on top of the thing
     that replaced it. */
  function filterFor(key, v) {
    if (!(v > 0)) return '';
    if (PAINT[key]) return '';
    var f = FX[key];
    return f ? f(v) : '';
  }

  /* ==========================================================================
     THE TRANSITIONS
     ==========================================================================
     step(p, dir) describes the frame, where p is 0 at the start of the move
     and 1 when the clip has fully arrived. Nothing here touches a canvas or a
     stylesheet — it returns numbers, and the two adapters below turn those
     into the ctx calls the renderer needs and the ctx calls a 110-pixel
     thumbnail needs, which are the same calls.

       a        opacity, 0-1
       tx, ty   translation, in fractions of the frame
       sx, sy   scale
       rot      degrees
       skx      horizontal skew, in radians
       blur     pixels
       bright, sat   filter multipliers
       hue      degrees
       clip     {kind, p} — a shape the frame is revealed through

     `dir` is 'in' or 'out'. An out transition is not an in transition played
     backwards: something that slid in from the left should leave to the right,
     or the cut looks like it changed its mind. Anything directional flips.
     ========================================================================== */
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function back(p) { var c = 1.70158 + 1; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }

  var TRANS = {
    fade:      function (p) { return { a: p }; },
    dissolve:  function (p) { return { a: p, blur: (1 - p) * 4 }; },
    slide:     function (p, d) { return { a: 1, tx: (1 - ease(p)) * (d === 'out' ? 1.2 : -1.2) }; },
    push:      function (p, d) { return { a: 1, tx: (1 - ease(p)) * (d === 'out' ? -1.2 : 1.2) }; },
    zoom:      function (p) { var e = ease(p); return { a: p, sx: .2 + e * .8, sy: .2 + e * .8 }; },
    blur:      function (p) { return { a: Math.min(1, p * 2), blur: (1 - p) * 22 }; },
    spin:      function (p, d) { var e = ease(p);
                 return { a: p, rot: (1 - e) * (d === 'out' ? -200 : 200), sx: .2 + e * .8, sy: .2 + e * .8 }; },
    glitch:    function (p) { var s = Math.sin(p * 61) * (1 - p);
                 return { a: p > .08 ? 1 : p * 12, tx: s * .16, hue: (1 - p) * 140, sat: 1 + (1 - p) * 1.4 }; },
    flash:     function (p) { return { a: Math.min(1, p * 2.2), bright: 1 + Math.pow(1 - p, 2) * 5 }; },
    wipe:      function (p, d) { return { a: 1, clip: { kind: 'wipe', p: p, dir: d } }; },
    pageCurl:  function (p, d) { var e = ease(p);
                 return { a: p, skx: (1 - e) * (d === 'out' ? -.7 : .7), tx: (1 - e) * (d === 'out' ? .5 : -.5), sx: .55 + e * .45 }; },
    cube:      function (p, d) { var e = ease(p);
                 /* A face of a cube turning towards you: it is narrow and
                    off to one side, and widens as it comes square on. */
                 return { a: 1, sx: .08 + e * .92, tx: (1 - e) * (d === 'out' ? .55 : -.55), skx: (1 - e) * (d === 'out' ? -.28 : .28) }; },
    iris:      function (p) { return { a: 1, clip: { kind: 'iris', p: p } }; },
    ripple:    function (p) { var w = Math.sin(p * Math.PI * 4) * (1 - p) * .16;
                 return { a: Math.min(1, p * 1.6), sx: 1 + w, sy: 1 - w }; },
    shutter:   function (p) { return { a: 1, clip: { kind: 'shutter', p: p } }; },
    morph:     function (p) { var e = ease(p);
                 return { a: p, sx: .45 + e * .55, sy: 1.5 - e * .5, blur: (1 - p) * 10 }; },
    swing:     function (p, d) { var k = (1 - p);
                 return { a: Math.min(1, p * 1.8), rot: Math.sin(k * Math.PI * 2.2) * 32 * k * (d === 'out' ? -1 : 1),
                          ty: k * -.25 }; },
    elastic:   function (p) { var s = back(Math.min(1, p)); return { a: Math.min(1, p * 2.5), sx: s, sy: s }; },
    fold:      function (p) { return { a: 1, sy: Math.max(.02, ease(p)) }; },
    shatter:   function (p) { var k = 1 - p;
                 return { a: p, tx: Math.sin(p * 83) * k * .09, ty: Math.cos(p * 67) * k * .07,
                          rot: Math.sin(p * 53) * k * 14, sx: 1 + k * .12, sy: 1 + k * .12 }; },
    lightleak: function (p) { var k = 1 - p;
                 return { a: Math.min(1, p * 1.5), bright: 1 + k * 1.8, sat: 1 + k * .9, hue: k * 22 }; },
    vhs:       function (p) { var k = 1 - p;
                 return { a: Math.min(1, p * 1.6), tx: Math.sin(p * 97) * k * .05,
                          sat: 1 + k * 1.6, hue: k * -14, blur: k * 2, clip: { kind: 'shutter', p: Math.min(1, p * 1.3) } }; },
    barn:      function (p) { return { a: 1, clip: { kind: 'barn', p: p } }; },
    checker:   function (p) { return { a: 1, clip: { kind: 'checker', p: p } }; },
    heart:     function (p) { return { a: 1, clip: { kind: 'heart', p: p } }; },
    diamond:   function (p) { return { a: 1, clip: { kind: 'diamond', p: p } }; }
  };

  var TRANS_NAMES = {
    'Fade': 'fade', 'Slide': 'slide', 'Push': 'push', 'Zoom': 'zoom', 'Blur': 'blur',
    'Spin': 'spin', 'Glitch': 'glitch', 'Flash': 'flash', 'Dissolve': 'dissolve',
    'Wipe': 'wipe', 'Page Curl': 'pageCurl', '3D Cube': 'cube', 'Iris': 'iris',
    'Ripple': 'ripple', 'Shutter': 'shutter', 'Morph': 'morph', 'Swing': 'swing',
    'Elastic': 'elastic', 'Fold': 'fold', 'Shatter': 'shatter', 'Light Leak': 'lightleak',
    'VHS': 'vhs', 'Barn Doors': 'barn', 'Checker': 'checker', 'Heart': 'heart',
    'Diamond': 'diamond'
  };

  function stepFor(id, p, dir) {
    var f = TRANS[id] || TRANS.fade;
    var s = f(Math.max(0, Math.min(1, p)), dir || 'in') || {};
    return { a: s.a == null ? 1 : s.a, tx: s.tx || 0, ty: s.ty || 0,
             sx: s.sx == null ? 1 : s.sx, sy: s.sy == null ? 1 : s.sy,
             rot: s.rot || 0, skx: s.skx || 0, blur: s.blur || 0,
             bright: s.bright || 1, sat: s.sat || 1, hue: s.hue || 0, clip: s.clip || null };
  }

  /* ==========================================================================
     THE ONE ADAPTER
     ==========================================================================
     Both the real renderer and every thumbnail go through this. w and h are
     the size of the frame being drawn, and the context is expected to be
     already translated to its centre, which is where the editor's draw loop
     hands it over.
     ========================================================================== */
  function shapePath(ctx, clip, w, h) {
    var p = Math.max(0, Math.min(1, clip.p));
    ctx.beginPath();
    if (clip.kind === 'wipe') {
      var ww = w * p;
      ctx.rect(clip.dir === 'out' ? w / 2 - ww : -w / 2, -h / 2, ww, h);
    } else if (clip.kind === 'iris') {
      ctx.arc(0, 0, Math.sqrt(w * w + h * h) / 2 * p, 0, Math.PI * 2);
    } else if (clip.kind === 'barn') {
      ctx.rect(-w / 2 * p, -h / 2, w * p, h);
    } else if (clip.kind === 'shutter') {
      var bands = 7, bh = h / bands;
      for (var i = 0; i < bands; i++) ctx.rect(-w / 2, -h / 2 + i * bh, w, bh * p);
    } else if (clip.kind === 'checker') {
      var cols = 6, rows = 4, cw = w / cols, ch = h / rows;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        /* Squares do not all arrive at once — the diagonal fills in, which is
           what makes it read as a checker rather than as a grid fading up. */
        var delay = (x + y) / (cols + rows - 2) * .6;
        var q = Math.max(0, Math.min(1, (p - delay) / .4));
        if (q <= 0) continue;
        ctx.rect(-w / 2 + x * cw + cw * (1 - q) / 2, -h / 2 + y * ch + ch * (1 - q) / 2, cw * q, ch * q);
      }
    } else if (clip.kind === 'diamond') {
      var d = Math.max(w, h) * p;
      ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0); ctx.closePath();
    } else if (clip.kind === 'heart') {
      var s = Math.max(w, h) * p * .75;
      /* Drawn from the standard parametric heart, sampled rather than
         bezier'd so it scales cleanly at thumbnail size. */
      for (var t = 0; t <= 64; t++) {
        var a = t / 64 * Math.PI * 2;
        var hx = 16 * Math.pow(Math.sin(a), 3);
        var hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
        if (t === 0) ctx.moveTo(hx / 16 * s, hy / 16 * s); else ctx.lineTo(hx / 16 * s, hy / 16 * s);
      }
      ctx.closePath();
    } else {
      ctx.rect(-w / 2, -h / 2, w, h);
    }
  }

  /* Applies a step to a context that is already centred on the frame. Returns
     the filter fragments it wants, because the renderer collects those into
     one string rather than setting ctx.filter itself. */
  function applyStep(ctx, step, w, h) {
    var parts = [];
    if (step.clip) { shapePath(ctx, step.clip, w, h); ctx.clip(); }
    ctx.translate(step.tx * w, step.ty * h);
    if (step.rot) ctx.rotate(step.rot * Math.PI / 180);
    if (step.skx) ctx.transform(1, 0, step.skx, 1, 0, 0);
    ctx.scale(step.sx, step.sy);
    if (step.blur > .01) parts.push('blur(' + step.blur.toFixed(2) + 'px)');
    if (Math.abs(step.bright - 1) > .01) parts.push('brightness(' + step.bright.toFixed(3) + ')');
    if (Math.abs(step.sat - 1) > .01) parts.push('saturate(' + step.sat.toFixed(3) + ')');
    if (Math.abs(step.hue) > .5) parts.push('hue-rotate(' + step.hue.toFixed(1) + 'deg)');
    return parts;
  }

  /* ==========================================================================
     THE PAINTERS — REAL PIXEL WORK, NOT A FILTER STRING
     ==========================================================================
     Eleven of the thirty-six effects were the same as another one. Not similar
     — identical, because the renderer's filter builder gave them the same
     string:

       vintage    == sepia                    sepia(v)
       pixelate   == posterize == ascii       contrast(1 + v*0.3)
       scanlines  == dots                     contrast(1 + v*0.15)
       halftone   == crosshatch               contrast(1 + v*0.2)
       mirror     == wave                     saturate(1 + v*0.1)

     Thirty-six names, thirty-one of which did something, and only five
     distinct looks between those eleven. Turning up the "ASCII" slider made
     the picture very slightly more contrasty.

     They could not have been fixed inside a filter string, and that is the
     whole reason they were not: CSS filters cannot pixelate, cannot quantise
     to a palette, cannot draw a character grid, cannot rotate a halftone
     screen, cannot hatch, cannot mirror a half, cannot displace a scanline.
     Nudging the contrast constants apart so the tiles looked different would
     have been the worst of both — eleven effects that still do nothing, now
     lying about it in eleven different ways.

     So these ten are drawn. Each one takes the frame that is about to go on
     screen and rewrites its pixels: a real block average for pixelate, a real
     level quantiser for posterize, a real character ramp for ascii, a real
     45-degree dot screen for halftone, real crossed strokes for crosshatch,
     a real horizontal displacement for wave. sepia is the eleventh and it
     stays a filter, because sepia(v) is genuinely what sepia is — it was
     vintage that had been sitting on top of it, and vintage is a film look
     now: tone, lifted blacks, vignette and grain.

     WHERE THEY RUN. In the editor's own draw loop, on the real frame, which
     means the preview shows them and the export contains them. The panel
     thumbnails call the same functions on their own canvas, so the tile and
     the video cannot disagree.

     WHAT THEY COST. Every one works at the size the frame is being drawn at,
     on a reused scratch canvas, and none of them runs at all unless its
     slider is above zero. The screens (ascii, dots, halftone, crosshatch)
     sample a downscaled copy rather than reading full-resolution pixels per
     cell, which is the difference between a few thousand reads and a few
     hundred thousand.
     ========================================================================== */

  /* Two reusable scratch canvases. Allocating a canvas per frame per clip is
     how you turn an effect into a stutter. */
  var _sc = [null, null];
  function scratch(n, w, h) {
    var c = _sc[n];
    if (!c) { c = _sc[n] = document.createElement('canvas'); }
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    return c;
  }
  /* A copy of what is currently on g, to read from while g is being redrawn. */
  function snapshot(g, w, h) {
    var t = scratch(1, w, h), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.clearRect(0, 0, w, h);
    tg.drawImage(g.canvas, 0, 0);
    return t;
  }
  /* A downscaled copy, one pixel per cell, for the screen effects. */
  function grid(g, cols, rows) {
    var t = scratch(1, cols, rows), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0);
    tg.clearRect(0, 0, cols, rows);
    tg.imageSmoothingEnabled = true;
    tg.drawImage(g.canvas, 0, 0, cols, rows);
    return tg.getImageData(0, 0, cols, rows).data;
  }
  function lum(d, i) { return (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255; }

  var _grain = null;
  function grainTile() {
    if (_grain) return _grain;
    var c = document.createElement('canvas');
    c.width = c.height = 96;
    var g = c.getContext('2d'), d = g.createImageData(96, 96), p = d.data;
    for (var i = 0; i < p.length; i += 4) {
      var n = 120 + Math.random() * 135;
      p[i] = p[i + 1] = p[i + 2] = n; p[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    _grain = c;
    return c;
  }

  var PAINT = {
    /* A real block average. Downscale with smoothing on so each block is the
       mean of what it covers, then back up with smoothing off so the blocks
       stay hard-edged — which is what makes it read as pixelation rather than
       as a blur. */
    pixelate: function (g, w, h, v) {
      var s = Math.max(.012, 1 - v * .97);
      var sw = Math.max(2, Math.round(w * s)), sh = Math.max(2, Math.round(h * s));
      /* SCRATCH 1, NOT 0. In the editor's draw path the frame being painted
         IS scratch 0, and asking for it at a new size resizes it, which
         clears it — the effect came out solid black. The one painter that
         needed a second canvas was the one that took the first one away from
         itself. */
      var t = scratch(1, sw, sh), tg = t.getContext('2d');
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.clearRect(0, 0, sw, sh);
      tg.imageSmoothingEnabled = true;
      tg.drawImage(g.canvas, 0, 0, sw, sh);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, w, h);
      g.imageSmoothingEnabled = false;
      g.drawImage(t, 0, 0, sw, sh, 0, 0, w, h);
      g.imageSmoothingEnabled = true;
      g.restore();
    },

    /* Colour quantisation: twelve levels per channel down to two. A lookup
       table rather than the arithmetic per pixel, because this runs over
       every pixel of every frame. */
    posterize: function (g, w, h, v) {
      var n = Math.max(2, Math.round(12 - v * 10));
      var step = 255 / (n - 1);
      var lutA = new Uint8ClampedArray(256);
      for (var i = 0; i < 256; i++) lutA[i] = Math.round(Math.round(i / step) * step);
      var d = g.getImageData(0, 0, w, h), p = d.data;
      for (var j = 0; j < p.length; j += 4) {
        p[j] = lutA[p[j]]; p[j + 1] = lutA[p[j + 1]]; p[j + 2] = lutA[p[j + 2]];
      }
      g.putImageData(d, 0, 0);
    },

    /* A character ramp, darkest glyph for the darkest cell. Each glyph keeps
       its cell's own colour rather than going green-on-black, which stays
       readable as a picture instead of as a novelty. */
    ascii: function (g, w, h, v) {
      var cell = Math.max(4, Math.round(4 + v * 9));
      var cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell));
      var d = grid(g, cols, rows);
      var RAMP = ' .:-=+*#%@';
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#05070c'; g.fillRect(0, 0, w, h);
      g.font = '700 ' + cell + 'px ui-monospace,Menlo,Consolas,monospace';
      g.textBaseline = 'top';
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var k = Math.round(lum(d, i) * (RAMP.length - 1));
        if (k <= 0) continue;
        g.fillStyle = 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')';
        g.fillText(RAMP.charAt(k), x * cell, y * cell);
      }
      g.restore();
    },

    /* A CRT, not a contrast bump: dark lines every three pixels, and the
       brightness roll a tube has from top to bottom. */
    scanlines: function (g, w, h, v) {
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = 'rgba(0,0,0,' + (.72 * v).toFixed(3) + ')';
      for (var y = 0; y < h; y += 3) g.fillRect(0, y, w, 1.4);
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(255,255,255,' + (.06 * v).toFixed(3) + ')');
      gr.addColorStop(.5, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,' + (.14 * v).toFixed(3) + ')');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.restore();
    },

    /* A dot-matrix panel: colour dots on black, radius by brightness. */
    dots: function (g, w, h, v) {
      var cell = Math.max(4, Math.round(4 + v * 10));
      var cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell));
      var d = grid(g, cols, rows);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#04060b'; g.fillRect(0, 0, w, h);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var rad = lum(d, i) * cell * .46;
        if (rad < .35) continue;
        g.fillStyle = 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')';
        g.beginPath(); g.arc(x * cell + cell / 2, y * cell + cell / 2, rad, 0, 6.2832); g.fill();
      }
      g.restore();
    },

    /* Newsprint: one monochrome screen, black ink on paper, and the grid
       turned 45 degrees the way a real halftone screen is — which is the
       thing that stops it looking like the dot-matrix above. */
    halftone: function (g, w, h, v) {
      var cell = Math.max(3, Math.round(3 + v * 8));
      var cols = Math.max(1, Math.ceil(w / 2)), rows = Math.max(1, Math.ceil(h / 2));
      var d = grid(g, cols, rows);
      var diag = Math.ceil(Math.sqrt(w * w + h * h));
      var a = Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#10131a';
      g.translate(w / 2, h / 2); g.rotate(a); g.translate(-diag / 2, -diag / 2);
      for (var y = 0; y < diag; y += cell) for (var x = 0; x < diag; x += cell) {
        var cx = x - diag / 2, cy = y - diag / 2;
        var ix = cx * ca - cy * sa + w / 2, iy = cx * sa + cy * ca + h / 2;
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        var gx = Math.min(cols - 1, Math.max(0, Math.round(ix / w * cols)));
        var gy = Math.min(rows - 1, Math.max(0, Math.round(iy / h * rows)));
        var rad = (1 - lum(d, (gy * cols + gx) * 4)) * cell * .62;
        if (rad < .3) continue;
        g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
      }
      g.restore();
    },

    /* Pen hatching on paper. One stroke direction for a light cell, four
       crossed for a black one — the drawing technique the effect is named
       after, rather than a texture laid over the top. */
    crosshatch: function (g, w, h, v) {
      var cell = Math.max(5, Math.round(5 + v * 7));
      var cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell));
      var d = grid(g, cols, rows);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(20,22,30,.8)';
      g.lineWidth = Math.max(.6, cell * .09);
      g.lineCap = 'round';
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var dark = 1 - lum(d, (y * cols + x) * 4);
        var n = Math.min(4, Math.floor(dark * 4.6));
        if (n <= 0) continue;
        var px = x * cell, py = y * cell;
        g.beginPath();
        if (n > 0) { g.moveTo(px, py); g.lineTo(px + cell, py + cell); }
        if (n > 1) { g.moveTo(px, py + cell); g.lineTo(px + cell, py); }
        if (n > 2) { g.moveTo(px, py + cell / 2); g.lineTo(px + cell, py + cell / 2); }
        if (n > 3) { g.moveTo(px + cell / 2, py); g.lineTo(px + cell / 2, py + cell); }
        g.stroke();
      }
      g.restore();
    },

    /* The left half, flipped onto the right. At half strength you get the
       ghost of it, which is the useful setting. */
    mirror: function (g, w, h, v) {
      var t = snapshot(g, w, h);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = Math.max(0, Math.min(1, v));
      g.translate(w, 0); g.scale(-1, 1);
      g.drawImage(t, 0, 0, w / 2, h, 0, 0, w / 2, h);
      g.restore();
    },

    /* Horizontal displacement, two scanlines at a time, travelling with the
       playhead so it moves rather than sitting there bent. */
    wave: function (g, w, h, v, t) {
      var src = snapshot(g, w, h);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, w, h);
      var amp = v * w * .055, k = Math.PI * 6;
      for (var y = 0; y < h; y += 2) {
        var dx = Math.sin(y / h * k + t * 2.2) * amp;
        g.drawImage(src, 0, y, w, 2, dx, y, w, 2);
      }
      g.restore();
    },

    /* A film look rather than a sepia slider: the tone, blacks lifted off
       zero the way dye film never quite reaches black, a vignette, and grain.
       This is the one that used to be a duplicate of sepia, and it is the
       reason sepia is allowed to stay a plain filter. */
    vintage: function (g, w, h, v) {
      var d = g.getImageData(0, 0, w, h), p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var r = p[i], gg = p[i + 1], b = p[i + 2];
        var tr = r * .393 + gg * .769 + b * .189;
        var tg2 = r * .349 + gg * .686 + b * .168;
        var tb = r * .272 + gg * .534 + b * .131;
        tr = tr * (1 - .18 * v) + 34 * v;
        tg2 = tg2 * (1 - .20 * v) + 28 * v;
        tb = tb * (1 - .24 * v) + 40 * v;
        p[i] = r + (tr - r) * v;
        p[i + 1] = gg + (tg2 - gg) * v;
        p[i + 2] = b + (tb - b) * v;
      }
      g.putImageData(d, 0, 0);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      var rad = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .25,
                                       w / 2, h / 2, Math.max(w, h) * .72);
      rad.addColorStop(0, 'rgba(0,0,0,0)');
      rad.addColorStop(1, 'rgba(22,13,4,' + (.55 * v).toFixed(3) + ')');
      g.fillStyle = rad; g.fillRect(0, 0, w, h);
      g.globalAlpha = .16 * v;
      g.globalCompositeOperation = 'overlay';
      var tile = grainTile();
      for (var gy = 0; gy < h; gy += 96) for (var gx = 0; gx < w; gx += 96) g.drawImage(tile, gx, gy);
      g.restore();
    }
  };

  /* Geometry first, then tone, then the screens that replace the picture
     entirely, then the overlay. Running a halftone before a mirror would
     mirror the dots rather than the image. */
  var PAINT_ORDER = ['mirror', 'wave', 'pixelate', 'vintage', 'posterize',
                     'ascii', 'dots', 'halftone', 'crosshatch', 'scanlines'];

  /* The exact string the bundle's own filter builder pushes for each of these,
     so it can be taken back out. Leaving it in would apply a contrast bump on
     top of a painter that has already replaced every pixel — and for vintage
     it would sepia-tone the film look a second time. */
  var BUNDLE_FILTER = {
    pixelate:   function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    posterize:  function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    ascii:      function (v) { return 'contrast(' + (1 + v * .3) + ')'; },
    scanlines:  function (v) { return 'contrast(' + (1 + v * .15) + ')'; },
    dots:       function (v) { return 'contrast(' + (1 + v * .15) + ')'; },
    halftone:   function (v) { return 'contrast(' + (1 + v * .2) + ')'; },
    crosshatch: function (v) { return 'contrast(' + (1 + v * .2) + ')'; },
    mirror:     function (v) { return 'saturate(' + (1 + v * .1) + ')'; },
    wave:       function (v) { return 'saturate(' + (1 + v * .1) + ')'; },
    vintage:    function (v) { return 'sepia(' + v + ')'; }
  };

  function activePainters(fx) {
    var out = [];
    for (var i = 0; i < PAINT_ORDER.length; i++) {
      var k = PAINT_ORDER[i];
      if (fx && fx[k] > 0) out.push(k);
    }
    return out;
  }

  function runPaint(g, w, h, fx, t) {
    var list = activePainters(fx);
    for (var i = 0; i < list.length; i++) {
      try { PAINT[list[i]](g, w, h, fx[list[i]], t || 0); } catch (e) {}
    }
    return list.length;
  }

  /* ==========================================================================
     PUTTING THEM IN THE EDITOR'S OWN DRAW
     ==========================================================================
     These have to be in the video, not just in the panel — so they run inside
     the renderer, on the frame it is about to composite, which means the
     preview shows them and the export writes them out.

     The draw loop's last act for a clip is one drawImage with the filter
     already set. So the painter borrows that one call: the frame goes to a
     scratch canvas with the same filter applied, the painters rewrite it, and
     the result is drawn back through the same transform the editor had set up
     — so the clip's position, scale, rotation and any transition still apply
     exactly as they did.

     The override is installed on the context, fires once and removes itself.
     It is also cleared at the top of every hook call, because a clip that
     never reaches drawImage — a text clip, a frame that throws — would
     otherwise leave it armed for whatever is drawn next. */
  function installPainter(ctx, clip, t) {
    var fx = clip && clip.effects;
    if (!activePainters(fx).length) return;
    var orig = ctx.drawImage;
    ctx.__ncPaint = true;
    ctx.drawImage = function (img, a, b, c, d) {
      delete ctx.drawImage;
      delete ctx.__ncPaint;
      /* Only the four-argument destination form is ours; anything else goes
         straight through rather than being guessed at. */
      if (arguments.length !== 5) return orig.apply(ctx, arguments);
      var W2 = Math.max(1, Math.round(Math.abs(c))), H2 = Math.max(1, Math.round(Math.abs(d)));
      if (W2 * H2 > 4200000) return orig.apply(ctx, arguments);   /* absurd size: don't */
      try {
        var off = scratch(0, W2, H2), og = off.getContext('2d');
        og.setTransform(1, 0, 0, 1, 0, 0);
        og.clearRect(0, 0, W2, H2);
        og.filter = ctx.filter || 'none';
        og.drawImage(img, 0, 0, W2, H2);
        og.filter = 'none';
        runPaint(og, W2, H2, fx, t);
        var keep = ctx.filter;
        ctx.filter = 'none';
        orig.call(ctx, off, a, b, c, d);
        ctx.filter = keep;
      } catch (e) {
        try { orig.apply(ctx, arguments); } catch (e2) {}
      }
    };
  }

  /* ==========================================================================
     THE DRAW HOOK
     ==========================================================================
     grade.js is already here. Its function is kept and called first, so the
     colour grade still lands and this composes on top of it instead of
     replacing it — which is what assigning window.__ncGrade without looking
     would have done.

     WHY IT DIVIDES THE ALPHA. By the time this runs the renderer has already
     done `globalAlpha *= m`, where m is the linear fade ramp. For the
     transitions that should not fade — slide, push, wipe, iris, barn, fold,
     checker — that ramp is simply wrong, and m is exactly the p computed
     below, so dividing it back out is exact rather than approximate. Clips
     that carry no transition never reach that line.
     ========================================================================== */
  var prevGrade = typeof window.__ncGrade === 'function' ? window.__ncGrade : null;
  var NEW_FX = ['filmGrain', 'emboss', 'chromaticAberration'];

  function activeTransition(clip, playhead) {
    var u = playhead - (clip.start || 0);
    var ti = clip.transitionIn, to = clip.transitionOut, dur = clip.duration || 0;
    if (ti && ti.duration > 0 && u >= 0 && u < ti.duration) {
      return { id: ti.type, p: u / ti.duration, dir: 'in' };
    }
    if (to && to.duration > 0 && u > dur - to.duration && u <= dur) {
      return { id: to.type, p: (dur - u) / to.duration, dir: 'out' };
    }
    return null;
  }

  window.__ncGrade = function (ctx, clip, parts) {
    /* A painter armed on the last clip that never got drawn would fire on
       this one. Disarm before anything else. */
    if (ctx && ctx.__ncPaint) { try { delete ctx.drawImage; delete ctx.__ncPaint; } catch (e) {} }
    if (prevGrade) { try { prevGrade(ctx, clip, parts); } catch (e) {} }
    try {
      var store = window.__ncStore;
      if (!store || !clip) return;
      var st = store.getState();
      var t = st.playhead || 0;

      /* Take the bundle's duplicate filter back out for anything a painter
         now owns, then arm the painter. */
      var pfx = clip.effects || {};
      for (var pk in BUNDLE_FILTER) {
        if (!(pfx[pk] > 0)) continue;
        var dead = BUNDLE_FILTER[pk](pfx[pk]);
        var at = parts.indexOf(dead);
        if (at > -1) parts.splice(at, 1);
      }
      installPainter(ctx, clip, t);

      /* The two effects that are movement rather than colour. Time-based, so
         they only actually move while the playhead does. */
      var fx = clip.effects || {};
      var mtx = 0, mty = 0, msx = 1, msy = 1;
      for (var k in MOTION) {
        if (!(fx[k] > 0)) continue;
        var m = MOTION[k](fx[k], t);
        mtx += m.tx || 0; mty += m.ty || 0;
        msx *= m.sx == null ? 1 : m.sx; msy *= m.sy == null ? 1 : m.sy;
      }

      /* The three effects that had no filter branch at all. */
      for (var j = 0; j < NEW_FX.length; j++) {
        var key = NEW_FX[j];
        if (fx[key] > 0) parts.push(FX[key](fx[key]));
      }

      var act = activeTransition(clip, t);
      /* THE CANVAS, NOT THE PROJECT SETTINGS.
         The draw loop hands the image to drawImage in the preview canvas's own
         units — P is the canvas width, not 1920 — so a translation expressed
         as a fraction of the frame has to be scaled by the same thing. Using
         settings.width made every move about two and a half times too far:
         slide and cube both left the canvas entirely and rendered as identical
         blank frames, which is exactly the bug this was meant to fix. */
      var w = (ctx.canvas && ctx.canvas.width) || (st.settings && st.settings.width) || 1920;
      var h = (ctx.canvas && ctx.canvas.height) || (st.settings && st.settings.height) || 1080;

      if (mtx || mty || msx !== 1 || msy !== 1) {
        ctx.translate(mtx * w, mty * h);
        ctx.scale(msx, msy);
      }
      if (!act || !act.id) return;

      var step = stepFor(act.id, act.p, act.dir);
      var pp = Math.max(act.p, 0.0005);
      var base = ctx.globalAlpha / pp;
      ctx.globalAlpha = Math.max(0, Math.min(1, base * step.a));
      var extra = applyStep(ctx, step, w, h);
      for (var i = 0; i < extra.length; i++) parts.push(extra[i]);
    } catch (e) { /* a broken transition must never take the preview down */ }
  };

  /* ==========================================================================
     WHAT THE THUMBNAILS SHOW
     ==========================================================================
     Your own footage if the project has any, because an effect is only worth
     previewing on the thing it is going to be applied to. The test card is the
     fallback, and it is built rather than shipped as a file: it has to carry
     flat colour, a hard edge, fine repeating detail and a skin-ish tone,
     because blur, sharpen, posterize, halftone and edge-detect all show up as
     nothing at all on a smooth gradient.
     ========================================================================== */
  var source = null, sourceIsAsset = false;

  function testCard() {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    var sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#2a2f5e'); sky.addColorStop(1, '#6d4a8f');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    /* flat blocks — posterize, invert and grayscale live here */
    var cols = ['#ff5bab', '#ffd23f', '#22d3ee', '#34d399'];
    for (var i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(10 + i * 34, 12, 28, 28); }
    /* fine stripes — blur, sharpen, halftone and dots need something to bite on */
    for (var x = 0; x < W; x += 6) { g.fillStyle = x % 12 ? '#ffffff22' : '#00000033'; g.fillRect(x, 52, 3, 34); }
    /* a hard high-contrast edge — edge detect and emboss */
    g.fillStyle = '#0b0e16'; g.fillRect(0, 96, W, H - 96);
    g.fillStyle = '#f5f7fb'; g.beginPath(); g.moveTo(0, 96); g.lineTo(W, 130); g.lineTo(W, 96); g.closePath(); g.fill();
    /* a warm oval, so skin tones and hue shifts read */
    g.fillStyle = '#e8b48c'; g.beginPath(); g.ellipse(W * .74, H * .68, 30, 36, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0b0e16'; g.beginPath(); g.ellipse(W * .70, H * .63, 3.4, 4.4, 0, 0, Math.PI * 2);
    g.ellipse(W * .79, H * .63, 3.4, 4.4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#0b0e16'; g.lineWidth = 2.2; g.beginPath(); g.arc(W * .745, H * .70, 11, .2, Math.PI - .2); g.stroke();
    g.fillStyle = '#ffffffcc'; g.font = 'bold 15px system-ui,sans-serif';
    g.fillText('NovaClip', 12, H - 16);
    return c;
  }

  function pickSource() {
    var fallback = testCard();
    source = fallback; sourceIsAsset = false;
    try {
      var st = window.__ncStore && window.__ncStore.getState();
      if (!st) return;
      var asset = (st.assets || []).filter(function (a) {
        return a && a.url && (a.kind === 'image' || a.kind === 'video');
      })[0];
      if (!asset) return;
      if (asset.kind === 'image') {
        var im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = function () { source = im; sourceIsAsset = true; paintAll(); };
        im.src = asset.url;
      } else {
        var v = document.createElement('video');
        v.crossOrigin = 'anonymous'; v.muted = true; v.preload = 'metadata';
        v.onloadeddata = function () {
          try {
            var c = document.createElement('canvas');
            c.width = W; c.height = H;
            c.getContext('2d').drawImage(v, 0, 0, W, H);
            source = c; sourceIsAsset = true; paintAll();
          } catch (e) {}
        };
        /* One second in, not frame zero: a lot of clips open on black. */
        v.onloadedmetadata = function () { try { v.currentTime = Math.min(1, (v.duration || 2) / 3); } catch (e) {} };
        v.src = asset.url;
      }
    } catch (e) {}
  }

  function drawSource(ctx, w, h) {
    if (!source) return;
    try { ctx.drawImage(source, -w / 2, -h / 2, w, h); } catch (e) {}
  }

  /* ==========================================================================
     ONE TICKER FOR EVERY THUMBNAIL ON SCREEN
     ==========================================================================
     Thirty-six effect tiles and twenty-six transition tiles, each with its own
     requestAnimationFrame, is sixty-two loops running in a panel where at most
     eight are visible. One ticker walks a set instead, tiles add themselves
     only while they are both on screen and actually animating, and when the
     set empties the loop stops rather than spinning on an empty list.
     ========================================================================== */
  var live = new Set(), raf = 0;
  function tick() {
    raf = 0;
    live.forEach(function (fn) { try { fn(); } catch (e) {} });
    if (live.size) raf = requestAnimationFrame(tick);
  }
  function wake() { if (!raf && live.size) raf = requestAnimationFrame(tick); }

  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var seen = new WeakSet();
  var onScreen = null;
  try {
    onScreen = new IntersectionObserver(function (rows) {
      rows.forEach(function (r) {
        var t = r.target.__ncFx;
        if (!t) return;
        t.visible = r.isIntersecting;
        if (!r.isIntersecting) { live.delete(t.step); }
        else { t.paint(); }
      });
    }, { rootMargin: '120px' });
  } catch (e) {}

  function paintAll() {
    document.querySelectorAll('canvas.nc-fx-prev').forEach(function (c) {
      if (c.__ncFx) { try { c.__ncFx.paint(); } catch (e) {} }
    });
  }

  function makeCanvas(cls) {
    var c = document.createElement('canvas');
    c.className = 'nc-fx-prev ' + (cls || '');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(160 * dpr); c.height = Math.round(90 * dpr);
    c.style.width = '100%'; c.style.height = 'auto'; c.style.display = 'block';
    c.style.borderRadius = '8px'; c.style.background = '#0b0e16';
    return c;
  }


  /* Claiming a tile, and clearing whatever got there first.

     studio-kit.js decorates named cards all over the editor with a little
     animated sample, and it reaches these two panels too. It runs first — it
     is earlier in the defer chain — so on the opening pass it can land a
     thumbnail in a tile a moment before this file gets to it. The class is
     what tells it to leave the tile alone from then on; removing any .nckit-fx
     already inside is what settles the race that happened before the class
     existed. */
  function claim(tile) {
    tile.classList.add('nc-fx-tile');
    try {
      tile.querySelectorAll('.nckit-fx').forEach(function (n) { n.remove(); });
      tile.querySelectorAll('[data-nckit]').forEach(function (n) { n.removeAttribute('data-nckit'); });
    } catch (e) {}
  }

  /* ---- an effect thumbnail ------------------------------------------------ */
  function attachEffect(tile, key, name) {
    if (seen.has(tile)) return;
    seen.add(tile);
    claim(tile);
    var c = makeCanvas('nc-fx-effect');
    var slider = tile.querySelector('input[type=range]');
    var head = tile.firstElementChild;
    if (head && head.nextSibling) tile.insertBefore(c, head.nextSibling); else tile.appendChild(c);
    c.style.marginBottom = '6px';

    var g = c.getContext('2d');
    var hovering = false, demoT = 0;

    /* AT ZERO IT SHOWS THE EFFECT ANYWAY, AND SAYS SO.
       The first version drew the tile at the slider's real value, which is
       exact and was useless: every one of the thirty-six sits at 0% until you
       touch it, so the panel opened as thirty-six identical thumbnails and
       answered none of the question it was built to answer. An untouched tile
       demonstrates itself at 80% instead, with the word "preview" in the
       corner so it cannot be mistaken for a setting — the slider underneath
       still reads 0%, and the moment you move it the tile switches to your
       real value and the label goes. */
    var DEMO = .8;
    function demoing() { return !(Number(slider && slider.value) > 0); }
    function value() {
      if (hovering) return .9;
      var v = slider ? Number(slider.value) : 0;
      return (isFinite(v) && v > 0) ? v : DEMO;
    }

    function paint() {
      var w = c.width, h = c.height;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h / 2);
      var v = value();
      var extra = '';
      if (MOTION[key] && v > 0) {
        var m = MOTION[key](v, demoT);
        g.translate((m.tx || 0) * w, (m.ty || 0) * h);
        g.scale(m.sx == null ? 1 : m.sx, m.sy == null ? 1 : m.sy);
      }
      var f = filterFor(key, v);
      g.filter = (f + extra).trim() || 'none';
      drawSource(g, w, h);
      g.restore();
      g.filter = 'none';
      /* The drawn effects, run on the tile exactly as they run on the frame.
         One object with one key in it, so only this tile's own effect fires. */
      if (PAINT[key] && v > 0) {
        var one = {}; one[key] = v;
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        runPaint(g, w, h, one, demoT);
        g.restore();
      }
      if (demoing() && !hovering) {
        var fs = Math.round(h * .13);
        g.font = '600 ' + fs + 'px system-ui,sans-serif';
        g.textBaseline = 'bottom';
        var pad = Math.round(h * .06), tw = g.measureText('preview').width;
        g.fillStyle = 'rgba(8,10,18,.62)';
        g.fillRect(pad - 3, h - pad - fs - 2, tw + 8, fs + 5);
        g.fillStyle = 'rgba(255,255,255,.82)';
        g.fillText('preview', pad + 1, h - pad);
      }
    }

    function step() { demoT += 1 / 60; paint(); }

    c.__ncFx = { paint: paint, step: step, visible: true };
    /* Only the two moving effects need a loop, and only while they are set. */
    function retune() {
      /* wave travels with the playhead, so its tile has to tick like the two
         motion effects do; the other painters are still pictures. */
      var wants = !reduced && (MOTION[key] || key === 'wave') && value() > 0;
      if (wants) { live.add(step); wake(); } else { live.delete(step); paint(); }
    }
    if (slider) slider.addEventListener('input', retune);
    tile.addEventListener('pointerenter', function () { hovering = true; retune(); });
    tile.addEventListener('pointerleave', function () { hovering = false; retune(); });
    /* No hover on a phone, so a tap on the thumbnail does the same thing. */
    c.addEventListener('click', function () {
      hovering = !hovering; retune();
      if (hovering) setTimeout(function () { hovering = false; retune(); }, 1400);
    });
    if (onScreen) onScreen.observe(c);
    retune();
    c.title = name;
  }

  /* ---- a transition thumbnail --------------------------------------------- */
  function attachTransition(tile, id, name) {
    if (seen.has(tile)) return;
    seen.add(tile);
    claim(tile);
    /* The icon box is 64px of gradient with a line icon in the middle. That is
       the space the preview wants, and the icon is what the preview replaces. */
    var box = tile.firstElementChild;
    var c = makeCanvas('nc-fx-trans');
    if (box && /h-16/.test(box.className || '')) {
      box.innerHTML = '';
      box.style.padding = '0';
      box.style.height = 'auto';
      box.appendChild(c);
    } else {
      tile.insertBefore(c, tile.firstChild);
    }

    var g = c.getContext('2d');
    var playing = false, p = .5, t0 = 0;

    function paint() {
      var w = c.width, h = c.height;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h / 2);
      var s = stepFor(id, p, 'in');
      g.globalAlpha = s.a;
      var parts = applyStep(g, s, w, h);
      g.filter = parts.length ? parts.join(' ') : 'none';
      drawSource(g, w, h);
      g.restore();
      g.filter = 'none';
      g.globalAlpha = 1;
    }

    function step() {
      var now = performance.now();
      /* 1.1s of movement then a beat holding the finished frame, so you can
         see where it lands instead of it snapping straight back to the start. */
      var cycle = (now - t0) % 1600;
      p = cycle < 1100 ? cycle / 1100 : 1;
      paint();
    }

    c.__ncFx = { paint: paint, step: step, visible: true };

    function play() {
      if (reduced) return;
      playing = true; t0 = performance.now();
      live.add(step); wake();
    }
    function stop() {
      playing = false; live.delete(step); p = .5; paint();
    }
    tile.addEventListener('pointerenter', play);
    tile.addEventListener('pointerleave', stop);
    c.addEventListener('click', function (e) {
      e.stopPropagation();
      if (playing) { stop(); return; }
      play();
      setTimeout(function () { if (playing) stop(); }, 3400);
    });
    if (onScreen) onScreen.observe(c);
    paint();
    c.style.cursor = 'pointer';
    c.title = name;
  }

  /* ==========================================================================
     FINDING THE TILES
     ==========================================================================
     The panels are React, rebuilt whenever the selection changes, and this
     file cannot reach the component. So it watches for them and matches tiles
     by the only stable thing on screen — the label each one prints. An
     unrecognised label is left exactly as it was rather than guessed at.
     ========================================================================== */
  function panelTitled(word) {
    var h = [...document.querySelectorAll('h2')].filter(function (x) {
      return (x.textContent || '').trim() === word;
    })[0];
    return h ? h.closest('div.flex.h-full.flex-col') || h.parentElement.parentElement : null;
  }

  function scan() {
    hookStore();
    if (!source) return;

    var ep = panelTitled('Effects');
    if (ep) {
      ep.querySelectorAll('input[type=range]').forEach(function (r) {
        var tile = r.closest('div.rounded-xl');
        if (!tile || seen.has(tile)) return;
        var label = tile.querySelector('span.text-\\[11px\\]') ||
                    [...tile.querySelectorAll('span')].filter(function (s) { return (s.textContent || '').trim(); }).pop();
        var name = label ? (label.textContent || '').trim() : '';
        var key = FX_NAMES[name];
        /* Brightness, Contrast, Saturation and Hue are the Color Adjust group
           below, which is a different list with a different range and no store
           binding. Not ours; left alone. */
        if (!key) return;
        attachEffect(tile, key, name);
      });
    }

    var tp = panelTitled('Transitions');
    if (tp) {
      tp.querySelectorAll('div.group').forEach(function (tile) {
        if (seen.has(tile)) return;
        var label = tile.querySelector('span.text-\\[11px\\]') ||
                    [...tile.querySelectorAll('span')].filter(function (s) { return (s.textContent || '').trim(); })[0];
        var name = label ? (label.textContent || '').trim() : '';
        var id = TRANS_NAMES[name];
        if (!id) return;
        attachTransition(tile, id, name);
      });
    }
  }

  var booted = false;
  function boot() {
    scan();
    if (booted) return;
    booted = true;
    pickSource();
    try {
      new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  /* THE STORE DOES NOT EXIST YET WHEN THIS FILE RUNS.
     React mounts after it, and window.__ncStore is set inside that mount — so
     subscribing at boot threw, the catch swallowed it, and the subscription
     was never made. The thumbnails stayed on the test card even once the
     project had footage in it, which is the one case they exist for. Tried
     from scan() instead, which runs on every mutation, and latched once it
     takes. */
  var subscribed = false;
  function hookStore() {
    if (subscribed || !window.__ncStore || !window.__ncStore.subscribe) return;
    try {
      var had = -1;
      window.__ncStore.subscribe(function () {
        var n = (window.__ncStore.getState().assets || []).length;
        if (n !== had) { had = n; if (!sourceIsAsset && n) pickSource(); }
      });
      subscribed = true;
      if (!sourceIsAsset && (window.__ncStore.getState().assets || []).length) pickSource();
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  /* The editor mounts React after this file runs, so one late sweep catches
     the first render even if the observer above missed it. */
  setTimeout(boot, 1500);

  window.NC_FX = { FX: FX, TRANS: TRANS, MOTION: MOTION, PAINT: PAINT, stepFor: stepFor,
                   filterFor: filterFor, applyStep: applyStep, runPaint: runPaint, scan: scan };
})();
