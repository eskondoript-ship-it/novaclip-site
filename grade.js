/* ============================================================================
   NOVACLIP COLOUR GRADING
   ============================================================================
   The Color tab had fifteen sliders and a section headed ADVANCED with Color
   Curves, Color Wheels and Color LUT all marked "Soon". The honest state of it
   was worse than that label suggested: none of the fifteen did anything
   either, and neither did any of the thirty-eight effects.

   Measured, on a clip of flat #808080 grey: set brightness to 0.8 and the
   canvas pixel stays 128,128,128. Set hue to 120 — 128,128,128. Blur, vintage,
   the lot. Only transform.opacity moved the picture, which is what proved the
   pipeline was alive and the colour was not.

   The reason is one line in the renderer. It drew the frame and THEN set
   ctx.filter, inside a save()/restore() pair:

       try { e.drawImage(a, -P/2, -I/2, P, I) } catch {}
       gh(e, t)          // <- builds the filter string, assigns ctx.filter
       e.restore()       // <- and throws it away

   A canvas filter applies to what you draw next, not to what you have already
   drawn. The call moved above drawImage, which is the whole of that fix, and
   from there every slider that was already wired started working.

   THIS FILE IS THE PART THAT WAS ACTUALLY MISSING

   gh() only ever looked at clip.effects. Nothing anywhere read clip.color. So
   this adds the grade: the fifteen basic controls, and then the three that
   said Soon.

   TWO PATHS, AND WHY

   CSS filter functions — brightness, contrast, saturate, hue-rotate, sepia —
   are supported wherever ctx.filter is, and they cover the basic controls
   honestly. What they cannot do is a curve, a per-range colour wheel, or a
   look-up table, because none of those is expressible as a multiply.

   For those, ctx.filter also accepts url(#id) pointing at an SVG filter in the
   same document, and SVG filters have exactly the right primitives:
   feComponentTransfer with type="table" IS a curve, and feColorMatrix IS a
   colour wheel. So the advanced controls build a real SVG filter per clip.

   That path is feature-tested rather than assumed. ctx.filter itself only
   reached Safari in 17, and url() references in a canvas filter are newer
   still; on anything that cannot do it the advanced controls fall back to the
   closest CSS approximation rather than silently doing nothing, which is the
   failure this file exists to fix.

   HOW IT ATTACHES

   The renderer calls window.__ncGrade(ctx, clip, parts) if it is there, and
   carries on without it if it is not. One line in the bundle, and everything
   else lives here — same arrangement as stickers.js and photos.js, and for the
   same reason: the bundle is 400 kB and gets rebuilt.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncGrade) return;

  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function r3(v) { return Math.round(v * 1000) / 1000; }

  /* --------------------------------------------------------------------------
     CAN THIS BROWSER USE AN SVG FILTER ON A CANVAS?
     --------------------------------------------------------------------------
     Asked once, by doing it: paint a known colour through a filter that must
     change it, and read the pixel back. Nothing else is trustworthy — the
     property exists in browsers that ignore url() references, so testing for
     `'filter' in ctx` answers a different question than the one being asked.
     -------------------------------------------------------------------------- */
  var svgOk = null;
  function canSvgFilter() {
    if (svgOk !== null) return svgOk;
    svgOk = false;
    try {
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      var f = document.createElementNS(ns, 'filter');
      f.setAttribute('id', 'ncGradeProbe');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      var ct = document.createElementNS(ns, 'feComponentTransfer');
      var fr = document.createElementNS(ns, 'feFuncR');
      fr.setAttribute('type', 'linear');
      fr.setAttribute('slope', '0'); fr.setAttribute('intercept', '1');
      ct.appendChild(fr); f.appendChild(ct); svg.appendChild(f);
      document.body.appendChild(svg);

      var c = document.createElement('canvas');
      c.width = c.height = 2;
      var x = c.getContext('2d');
      if (!('filter' in x)) { document.body.removeChild(svg); return svgOk; }
      x.filter = 'url(#ncGradeProbe)';
      x.fillStyle = '#000000';
      x.fillRect(0, 0, 2, 2);
      /* Red forced to full: if the filter ran, the pixel is red, not black. */
      svgOk = x.getImageData(0, 0, 1, 1).data[0] > 200;
      document.body.removeChild(svg);
    } catch (e) { svgOk = false; }
    return svgOk;
  }

  /* One <svg> holds every clip's filter, made once. */
  var host = null;
  function filterHost() {
    if (host) return host;
    var ns = 'http://www.w3.org/2000/svg';
    host = document.createElementNS(ns, 'svg');
    host.setAttribute('id', 'ncGradeDefs');
    host.setAttribute('width', '0');
    host.setAttribute('height', '0');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;left:-9999px;width:0;height:0;overflow:hidden';
    document.body.appendChild(host);
    return host;
  }

  /* ==========================================================================
     THE BASIC FIFTEEN, AS CSS FILTER FUNCTIONS
     ==========================================================================
     The job here is not colorimetric exactness — it is that moving a slider
     moves the picture in the direction its label promises, by an amount that
     feels like the number.

     Where two controls pull the same lever they are summed rather than
     applied in sequence: exposure and brightness both brighten, so they add
     into one brightness(), which is both faster and avoids the compounding
     that makes a pair of half-way sliders look like one at maximum.
     ========================================================================== */
  /* --------------------------------------------------------------------------
     THE PANEL USES TWO DIFFERENT SCALES, AND MIXING THEM UP LOOKS LIKE A BUG
     --------------------------------------------------------------------------
     Reading the sliders' own min/max out of the bundle:

       -1 .. 1     brightness contrast saturation exposure gamma lift gain
       -180 .. 180 hue
       -100 .. 100 temperature tint vibrance highlights shadows whites blacks

     So `temperature` at half travel is 50, not 0.5. Treating the second group
     as if it were the first puts sepia(27) into the filter string, which
     clamps to 1 the instant the slider leaves centre, and a contrast built
     from highlights at 100 comes out negative and renders black. Both of them
     read as "the slider is broken" rather than "the units are wrong".
     -------------------------------------------------------------------------- */
  function pct(v) { return num(v) / 100; }

  function cssParts(c) {
    var out = [];

    /* Light. Exposure is the photographic one and bites harder than
       brightness; lift raises the whole signal including the blacks. */
    var bright = 1 + num(c.brightness) * 0.9 + num(c.exposure) * 0.75 + num(c.lift) * 0.35;
    if (Math.abs(bright - 1) > 0.002) out.push('brightness(' + r3(clamp(bright, 0, 4)) + ')');

    /* Contrast. Gamma pulls the midtones the other way, whites and blacks
       stretch the ends, and all three read as contrast to the eye. */
    var con = 1 + num(c.contrast) * 0.9 - num(c.gamma) * 0.45
              + pct(c.whites) * 0.3 - pct(c.blacks) * 0.3
              - pct(c.highlights) * 0.2 + pct(c.shadows) * 0.2;
    if (Math.abs(con - 1) > 0.002) out.push('contrast(' + r3(clamp(con, 0, 4)) + ')');

    /* Colour intensity. Vibrance is the gentler of the two by design — it is
       meant to leave already-saturated colour alone, and half the slope is
       the closest a single saturate() gets to that. */
    var sat = 1 + num(c.saturation) * 0.9 + pct(c.vibrance) * 0.5 + num(c.gain) * 0.2;
    if (Math.abs(sat - 1) > 0.002) out.push('saturate(' + r3(clamp(sat, 0, 4)) + ')');

    /* Hue is already an angle. Tint is the green/magenta axis, which is a
       small rotation about that same wheel. */
    var hue = num(c.hue) + pct(c.tint) * 45;
    if (Math.abs(hue) > 0.5) out.push('hue-rotate(' + r3(hue) + 'deg)');

    /* Warm and cool are not symmetrical in CSS. sepia() is a warm wash and
       does the +ve side well; there is no cool equivalent, so the -ve side is
       a rotation towards blue with a little extra saturation to stop it
       reading as merely grey. */
    var temp = pct(c.temperature);
    if (temp > 0.002) out.push('sepia(' + r3(clamp(temp * 0.55, 0, 1)) + ')');
    else if (temp < -0.002) out.push('hue-rotate(' + r3(temp * 22) + 'deg) saturate(' + r3(1 + (-temp) * 0.25) + ')');

    return out;
  }

  /* ==========================================================================
     THE ADVANCED THREE, AS A REAL SVG FILTER
     ========================================================================== */

  /* A curve is four control points in 0..1 per channel. feFuncX type="table"
     takes the sampled values and interpolates between them, which is what a
     curve is — so the curve is not approximated here, it is the primitive. */
  function tableFor(points) {
    if (!points || !points.length) return null;
    var pts = points.slice().sort(function (a, b) { return a.x - b.x; });
    var N = 17, vals = [], i, k;
    for (i = 0; i < N; i++) {
      var x = i / (N - 1), y = x;
      for (k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1];
        if (x >= a.x && x <= b.x) {
          var span = (b.x - a.x) || 1e-6;
          var u = (x - a.x) / span;
          /* Smoothstep between control points rather than straight lines —
             a curve with a corner in it is a curve nobody drew. */
          y = a.y + (b.y - a.y) * (u * u * (3 - 2 * u));
          break;
        }
      }
      if (x < pts[0].x) y = pts[0].y;
      if (x > pts[pts.length - 1].x) y = pts[pts.length - 1].y;
      vals.push(r3(clamp(y, 0, 1)));
    }
    return vals.join(' ');
  }

  /* A colour wheel is a push towards a colour applied to one tonal range.
     Shadows, midtones and highlights each get one, and each is {r,g,b} in
     -1..1. feColorMatrix's fifth column is a straight additive offset, which
     is exactly "push this channel", and the range is selected by how much of
     the offset survives the component transfer either side of it. */
  function wheelMatrix(w) {
    var r = num(w && w.r), g = num(w && w.g), b = num(w && w.b);
    if (!r && !g && !b) return null;
    return '1 0 0 0 ' + r3(r * 0.25) +
         ' 0 1 0 0 ' + r3(g * 0.25) +
         ' 0 0 1 0 ' + r3(b * 0.25) +
         ' 0 0 0 1 0';
  }

  /* A LUT here is a named look — a small set of curve + matrix pairs, which is
     what a .cube file amounts to once it is loaded. Named rather than
     uploaded because a .cube is a 300 kB text file and this has to work with
     the wifi off. */
  var LUTS = {
    none: null,
    teal_orange: { curves: { r: [{x:0,y:0.03},{x:0.5,y:0.55},{x:1,y:1}], b: [{x:0,y:0},{x:0.5,y:0.46},{x:1,y:0.96}] }, sat: 1.1 },
    warm_film:   { curves: { r: [{x:0,y:0.05},{x:0.5,y:0.54},{x:1,y:0.98}], b: [{x:0,y:0.02},{x:0.5,y:0.47},{x:1,y:0.92}] }, sat: 0.95 },
    cool_blue:   { curves: { r: [{x:0,y:0},{x:0.5,y:0.46},{x:1,y:0.94}], b: [{x:0,y:0.05},{x:0.5,y:0.56},{x:1,y:1}] }, sat: 1.05 },
    bleach:      { curves: { r: [{x:0,y:0.06},{x:0.5,y:0.56},{x:1,y:1}], g: [{x:0,y:0.06},{x:0.5,y:0.56},{x:1,y:1}], b: [{x:0,y:0.06},{x:0.5,y:0.56},{x:1,y:1}] }, sat: 0.55 },
    noir:        { curves: { r: [{x:0,y:0},{x:0.5,y:0.5},{x:1,y:1}] }, sat: 0 },
    vivid:       { curves: { r: [{x:0,y:0},{x:0.5,y:0.52},{x:1,y:1}] }, sat: 1.45 }
  };

  /* Merge a clip's own curves over whatever the chosen look already sets. */
  function curvesOf(c) {
    var lut = LUTS[c.lut] || null;
    var out = {};
    if (lut && lut.curves) for (var k in lut.curves) out[k] = lut.curves[k];
    var own = c.curves || {};
    for (var k2 in own) if (own[k2] && own[k2].length) out[k2] = own[k2];
    return out;
  }

  function hasAdvanced(c) {
    if (c.lut && c.lut !== 'none' && LUTS[c.lut]) return true;
    var cu = c.curves || {};
    for (var k in cu) if (cu[k] && cu[k].length) return true;
    var w = c.wheels || {};
    return !!(wheelMatrix(w.shadows) || wheelMatrix(w.midtones) || wheelMatrix(w.highlights));
  }

  var seq = 0, cache = {};

  function buildFilter(clipId, c) {
    var ns = 'http://www.w3.org/2000/svg';
    var curves = curvesOf(c);
    var w = c.wheels || {};
    var lut = LUTS[c.lut] || null;

    /* The whole definition in one string, so an unchanged grade is an
       unchanged key and the DOM is left alone between frames. Rebuilding an
       SVG filter thirty times a second is its own performance bug. */
    var key = JSON.stringify([curves, w, c.lut]);
    var hit = cache[clipId];
    if (hit && hit.key === key) return hit.id;

    var id = 'ncGrade' + (++seq);
    var f = document.createElementNS(ns, 'filter');
    f.setAttribute('id', id);
    /* sRGB, not the linearRGB default. The sliders were set by eye against an
       sRGB preview, so the maths has to happen in the space they were judged
       in or every value lands somewhere other than where it looked. */
    f.setAttribute('color-interpolation-filters', 'sRGB');

    /* The wheels first: an offset before the curve behaves like a lift, which
       is what a shadows wheel is meant to be. */
    ['shadows', 'midtones', 'highlights'].forEach(function (range) {
      var m = wheelMatrix(w[range]);
      if (!m) return;
      var fe = document.createElementNS(ns, 'feColorMatrix');
      fe.setAttribute('type', 'matrix');
      fe.setAttribute('values', m);
      f.appendChild(fe);
    });

    /* Then the curves — the clip's own, over the look's. */
    var chans = ['r', 'g', 'b'];
    var any = chans.some(function (ch) { return curves[ch] && curves[ch].length; });
    if (any) {
      var ct = document.createElementNS(ns, 'feComponentTransfer');
      chans.forEach(function (ch) {
        var table = tableFor(curves[ch]);
        if (!table) return;
        var fn = document.createElementNS(ns, 'feFunc' + ch.toUpperCase());
        fn.setAttribute('type', 'table');
        fn.setAttribute('tableValues', table);
        ct.appendChild(fn);
      });
      if (ct.childNodes.length) f.appendChild(ct);
    }

    /* And the look's saturation, as a proper luminance-weighted matrix rather
       than a second saturate() stacked on the CSS one. */
    if (lut && typeof lut.sat === 'number' && Math.abs(lut.sat - 1) > 0.002) {
      var sm = document.createElementNS(ns, 'feColorMatrix');
      sm.setAttribute('type', 'saturate');
      sm.setAttribute('values', String(r3(clamp(lut.sat, 0, 4))));
      f.appendChild(sm);
    }

    var h = filterHost();
    if (hit) { var old = document.getElementById(hit.id); if (old) h.removeChild(old); }
    h.appendChild(f);
    cache[clipId] = { key: key, id: id };
    return id;
  }

  /* When the SVG path is not available, the advanced controls still have to
     do something. A look becomes its nearest CSS approximation and a curve
     becomes the contrast it mostly is — visibly wrong to a colourist, and far
     better than a control that moves nothing. */
  function advancedFallback(c, parts) {
    var lut = LUTS[c.lut];
    if (lut) {
      if (typeof lut.sat === 'number' && Math.abs(lut.sat - 1) > 0.002)
        parts.push('saturate(' + r3(lut.sat) + ')');
      if (c.lut === 'warm_film') parts.push('sepia(0.25)');
      if (c.lut === 'cool_blue') parts.push('hue-rotate(-12deg)');
      if (c.lut === 'teal_orange') parts.push('contrast(1.12)');
      if (c.lut === 'bleach') parts.push('contrast(1.2) brightness(1.05)');
      if (c.lut === 'noir') parts.push('contrast(1.15)');
    }
    var cu = c.curves || {};
    var mid = 0, n = 0;
    ['r', 'g', 'b'].forEach(function (ch) {
      var p = cu[ch];
      if (!p || !p.length) return;
      /* How far the curve's midpoint has been pushed off the diagonal is a
         fair one-number summary of what it is doing. */
      var m = null;
      for (var i = 0; i < p.length; i++) if (Math.abs(p[i].x - 0.5) < 0.2) { m = p[i]; break; }
      if (!m) return;
      mid += (m.y - m.x); n++;
    });
    if (n) {
      var d = mid / n;
      if (Math.abs(d) > 0.01) parts.push('brightness(' + r3(clamp(1 + d * 0.8, 0, 3)) + ')');
    }
  }

  /* ==========================================================================
     WHAT THE RENDERER CALLS, ONCE PER CLIP PER FRAME
     ==========================================================================
     It runs inside the draw loop, so it does no work it does not have to:
     a clip with a default grade adds nothing to the parts array and touches
     no DOM at all.
     ========================================================================== */
  window.__ncGrade = function (ctx, clip, parts) {
    try {
      var c = clip && clip.color;
      if (!c) return;

      var css = cssParts(c);
      for (var i = 0; i < css.length; i++) parts.push(css[i]);

      if (!hasAdvanced(c)) return;

      if (canSvgFilter()) {
        var id = buildFilter(clip.id || 'clip', c);
        /* url() goes last. A canvas filter list is applied left to right, and
           the grade should sit on top of the basic corrections rather than
           underneath them. */
        parts.push('url(#' + id + ')');
      } else {
        advancedFallback(c, parts);
      }
    } catch (e) { /* a grade must never be able to stop a frame drawing */ }
  };

  /* The panel needs the same list of looks the renderer honours, and the
     defaults for a clip that has never been graded. */
  window.NC_GRADE = {
    luts: Object.keys(LUTS),
    defaults: function () {
      return {
        curves: {},
        wheels: { shadows: { r: 0, g: 0, b: 0 }, midtones: { r: 0, g: 0, b: 0 }, highlights: { r: 0, g: 0, b: 0 } },
        lut: 'none'
      };
    },
    supported: canSvgFilter
  };
})();
