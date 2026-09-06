/* ============================================================================
   PHOTO FX — the rest of the darkroom
   ============================================================================
   photo.html ships a real editor: layers, masks, blend modes, twelve live
   adjustments, a clone stamp, text, shapes and eleven filters. This file adds
   what a desktop photo editor has and that one did not — the effects library,
   levels and curves, and the five tools that need a gesture of their own.

   WHY IT IS A SEPARATE FILE

   photo.html was already two thousand lines and it is holding somebody's
   unsaved picture. Every effect below is arithmetic over a pixel buffer, which
   is the kind of code that is easy to get subtly wrong, and a typo in a twirl
   filter should not be able to stop the crop tool loading. This file registers
   itself through window.NC_PHOTO and touches nothing else. If it fails to
   parse, the editor is exactly what it was before it existed.

   EVERYTHING HERE IS UNDOABLE AND LOCAL

   Every entry calls push() before it changes a pixel, so Ctrl+Z takes it back.
   Nothing here uploads anything or asks the network for anything: no model, no
   service, no key. It is all arithmetic on a canvas that is already in memory,
   which is also why it works with the wifi off.

   WHAT IS DELIBERATELY NOT HERE

   Content-aware fill and true object removal need a model, and a model means an
   upload. The heal tool below is honest about being a patch blend rather than
   pretending to be either. Panorama stitching and batch processing are not
   here because neither fits a single-document editor, and half of one is worse
   than a missing feature somebody can plan around.
   ========================================================================== */
(function () {
  'use strict';

  function boot() {
    var P = window.NC_PHOTO;
    if (!P || P.__fx) return;
    P.__fx = true;

    var pointFilter = P.pointFilter, convolve = P.convolve;
    var push = P.push, render = P.render, touch = P.touch, toast = P.toast;
    var active = P.active, ctxOf = P.ctxOf, region = P.region, makeCanvas = P.makeCanvas;
    var esc = P.esc;

    var lum = function (r, g, b) { return r * 0.2126 + g * 0.7152 + b * 0.0722; };
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var hex2rgb = function (h) {
      h = String(h || '#000000').replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16) || 0;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    /* Read the active layer's pixels inside the selection. Returned with the
       region so a caller can write them back to the same place. */
    function grab() {
      var l = active(); if (!l) return null;
      var r = region(), cx = ctxOf(l);
      return { l: l, r: r, cx: cx, img: cx.getImageData(r.x, r.y, r.w, r.h) };
    }
    function put(g) { g.cx.putImageData(g.img, g.r.x, g.r.y); touch(g.l); }

    /* --------------------------------------------------------------------
       A SEPARABLE GAUSSIAN

       The existing convolve() is a 3x3 that reads the source for every tap.
       Half of what follows wants a real blur at a chosen radius — glow, tilt
       shift, denoise, the unsharp mask, watercolour — and a 25x25 box of that
       shape is 625 reads per pixel. Separating it into a horizontal pass and a
       vertical one makes it 2r, which is the difference between a filter that
       runs and one that appears to hang the tab.
       -------------------------------------------------------------------- */
    function blurData(d, W, H, radius) {
      if (radius < 1) return d;
      var sigma = radius / 2, k = [], sum = 0, i, x, y, c;
      for (i = -radius; i <= radius; i++) {
        var v = Math.exp(-(i * i) / (2 * sigma * sigma));
        k.push(v); sum += v;
      }
      for (i = 0; i < k.length; i++) k[i] /= sum;

      var tmp = new Float32Array(d.length);
      for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
          var ro = 0, go = 0, bo = 0, ao = 0;
          for (i = -radius; i <= radius; i++) {
            var sx = clamp(x + i, 0, W - 1), w = k[i + radius], si = (y * W + sx) * 4;
            ro += d[si] * w; go += d[si + 1] * w; bo += d[si + 2] * w; ao += d[si + 3] * w;
          }
          c = (y * W + x) * 4;
          tmp[c] = ro; tmp[c + 1] = go; tmp[c + 2] = bo; tmp[c + 3] = ao;
        }
      }
      var out = new Uint8ClampedArray(d.length);
      for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
          var r2 = 0, g2 = 0, b2 = 0, a2 = 0;
          for (i = -radius; i <= radius; i++) {
            var sy = clamp(y + i, 0, H - 1), w2 = k[i + radius], si2 = (sy * W + x) * 4;
            r2 += tmp[si2] * w2; g2 += tmp[si2 + 1] * w2;
            b2 += tmp[si2 + 2] * w2; a2 += tmp[si2 + 3] * w2;
          }
          c = (y * W + x) * 4;
          out[c] = r2; out[c + 1] = g2; out[c + 2] = b2; out[c + 3] = a2;
        }
      }
      return out;
    }

    /* Resample a region through a coordinate function. Every distortion below
       is this plus a different (x,y) -> (sx,sy). Bilinear, because nearest
       neighbour on a twirl looks like a mistake rather than an effect. */
    function warp(fn) {
      var g = grab(); if (!g) return;
      var W = g.r.w, H = g.r.h, src = new Uint8ClampedArray(g.img.data), d = g.img.data;
      var cx = W / 2, cy = H / 2;
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var s = fn(x - cx, y - cy, cx, cy);
          var sx = clamp(s[0] + cx, 0, W - 1.001), sy = clamp(s[1] + cy, 0, H - 1.001);
          var x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0;
          var x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
          var i00 = (y0 * W + x0) * 4, i10 = (y0 * W + x1) * 4;
          var i01 = (y1 * W + x0) * 4, i11 = (y1 * W + x1) * 4;
          var o = (y * W + x) * 4;
          for (var ch = 0; ch < 4; ch++) {
            var a = src[i00 + ch] + (src[i10 + ch] - src[i00 + ch]) * fx;
            var b = src[i01 + ch] + (src[i11 + ch] - src[i01 + ch]) * fx;
            d[o + ch] = a + (b - a) * fy;
          }
        }
      }
      put(g);
    }

    /* A 256-entry histogram of luminance over the region — what auto levels,
       auto contrast and the levels panel all read. */
    function histogram() {
      var g = grab(); if (!g) return null;
      var d = g.img.data, h = new Uint32Array(256), rr = new Uint32Array(256),
          gg = new Uint32Array(256), bb = new Uint32Array(256), n = 0;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 8) continue;                 // transparent pixels are not tones
        h[lum(d[i], d[i + 1], d[i + 2]) | 0]++;
        rr[d[i]]++; gg[d[i + 1]]++; bb[d[i + 2]]++; n++;
      }
      return { l: h, r: rr, g: gg, b: bb, n: n };
    }

    /* The tone value below which `frac` of the pixels sit. Auto levels clips a
       little at each end on purpose: stretching to the single darkest pixel in
       the frame means one stuck sensor pixel decides the whole black point. */
    function percentile(hist, n, frac) {
      var want = n * frac, run = 0;
      for (var i = 0; i < 256; i++) { run += hist[i]; if (run >= want) return i; }
      return 255;
    }

    function levelsMap(lo, hi, gamma) {
      var t = new Uint8ClampedArray(256), span = Math.max(1, hi - lo);
      for (var i = 0; i < 256; i++) {
        t[i] = Math.pow(clamp((i - lo) / span, 0, 1), 1 / gamma) * 255;
      }
      return t;
    }
    function applyMaps(mr, mg, mb) {
      pointFilter(function (d, i) {
        d[i] = mr[d[i]]; d[i + 1] = mg[d[i + 1]]; d[i + 2] = mb[d[i + 2]];
      });
    }

    /* ======================================================================
       THE EFFECTS
       ======================================================================
       Added to the same FILTERS object photo.html builds its chips from, so
       they appear in the panel with the eleven that were already there and
       obey the same rules: active layer, inside the selection, undoable.
       ==================================================================== */
    var F = P.FILTERS;

    /* ---- tone ---------------------------------------------------------- */
    F['Invert'] = function () {
      pointFilter(function (d, i) {
        d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2];
      });
    };
    F['Solarize'] = function () {
      pointFilter(function (d, i) {
        for (var c = 0; c < 3; c++) if (d[i + c] > 128) d[i + c] = 255 - d[i + c];
      });
    };
    F['Auto levels'] = function () {
      var h = histogram(); if (!h) return;
      /* Per channel, so a colour cast is corrected rather than preserved —
         this is the difference between auto levels and auto contrast. */
      var mk = function (ch) {
        return levelsMap(percentile(ch, h.n, 0.005), percentile(ch, h.n, 0.995), 1);
      };
      applyMaps(mk(h.r), mk(h.g), mk(h.b));
    };
    F['Auto contrast'] = function () {
      var h = histogram(); if (!h) return;
      /* One map for all three channels: the tones are stretched and the colour
         relationship between them is left alone. */
      var m = levelsMap(percentile(h.l, h.n, 0.005), percentile(h.l, h.n, 0.995), 1);
      applyMaps(m, m, m);
    };
    F['Auto colour'] = function () {
      var g = grab(); if (!g) return;
      /* Grey world: assume the average of a real scene is neutral, and scale
         each channel until it is. Wrong for a photograph that really is mostly
         one colour, which is why it is a button and not automatic. */
      var d = g.img.data, sr = 0, sg = 0, sb = 0, n = 0;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 8) continue;
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
      }
      if (!n) return;
      var avg = (sr + sg + sb) / (3 * n);
      var kr = avg / (sr / n || 1), kg = avg / (sg / n || 1), kb = avg / (sb / n || 1);
      for (i = 0; i < d.length; i += 4) {
        d[i] *= kr; d[i + 1] *= kg; d[i + 2] *= kb;
      }
      put(g);
    };
    F['Colourise'] = function () {
      var c = hex2rgb(P.brush().color);
      pointFilter(function (d, i) {
        var t = lum(d[i], d[i + 1], d[i + 2]) / 255;
        d[i] = c[0] * t; d[i + 1] = c[1] * t; d[i + 2] = c[2] * t;
      });
    };
    F['Duotone'] = function () {
      /* Shadows take the brush colour, highlights stay paper-white. Using the
         brush colour rather than a fixed pair means the swatch beside it is
         the control, with nothing new to learn. */
      var c = hex2rgb(P.brush().color);
      pointFilter(function (d, i) {
        var t = lum(d[i], d[i + 1], d[i + 2]) / 255;
        d[i] = c[0] + (255 - c[0]) * t;
        d[i + 1] = c[1] + (255 - c[1]) * t;
        d[i + 2] = c[2] + (255 - c[2]) * t;
      });
    };
    F['Old photo'] = function () {
      var g = grab(); if (!g) return;
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var cxm = W / 2, cym = H / 2, max = Math.sqrt(cxm * cxm + cym * cym);
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var i = (y * W + x) * 4;
          var t = lum(d[i], d[i + 1], d[i + 2]);
          var n = (Math.random() - 0.5) * 26;
          var dx = x - cxm, dy = y - cym;
          var v = 1 - Math.pow(Math.max(0, Math.sqrt(dx * dx + dy * dy) / max - 0.4) / 0.6, 2) * 0.7;
          d[i] = (t * 1.07 + 24 + n) * v;
          d[i + 1] = (t * 0.96 + 14 + n) * v;
          d[i + 2] = (t * 0.76 + 4 + n) * v;
        }
      }
      put(g);
    };

    /* ---- sharpen and clean --------------------------------------------- */
    F['Unsharp mask'] = function () {
      var g = grab(); if (!g) return;
      /* The real thing rather than a 3x3 stencil: blur a copy, and add back
         the difference. A radius means it sharpens edges at the scale you
         choose instead of amplifying every pixel of sensor noise. */
      var d = g.img.data, soft = blurData(d, g.r.w, g.r.h, 3), amount = 1.1;
      for (var i = 0; i < d.length; i += 4) {
        for (var c = 0; c < 3; c++) d[i + c] += (d[i + c] - soft[i + c]) * amount;
      }
      put(g);
    };
    F['Denoise'] = function () {
      var g = grab(); if (!g) return;
      /* Edge-preserving: blend towards the blurred value only where the pixel
         is already close to it. A flat sky smooths, an edge does not, which is
         what separates denoise from blur. */
      var d = g.img.data, soft = blurData(d, g.r.w, g.r.h, 2);
      for (var i = 0; i < d.length; i += 4) {
        var diff = Math.abs(d[i] - soft[i]) + Math.abs(d[i + 1] - soft[i + 1]) +
                   Math.abs(d[i + 2] - soft[i + 2]);
        var k = Math.max(0, 1 - diff / 90);
        for (var c = 0; c < 3; c++) d[i + c] += (soft[i + c] - d[i + c]) * k;
      }
      put(g);
    };
    F['Despeckle'] = function () {
      var g = grab(); if (!g) return;
      /* A 3x3 median. Slower than a blur and worth it: it removes dust and
         single hot pixels outright while leaving edges where they are. */
      var W = g.r.w, H = g.r.h, src = new Uint8ClampedArray(g.img.data), d = g.img.data;
      var buf = new Array(9);
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          for (var c = 0; c < 3; c++) {
            var n = 0;
            for (var ky = -1; ky <= 1; ky++) {
              for (var kx = -1; kx <= 1; kx++) {
                var sy = clamp(y + ky, 0, H - 1), sx = clamp(x + kx, 0, W - 1);
                buf[n++] = src[(sy * W + sx) * 4 + c];
              }
            }
            buf.sort(function (a, b) { return a - b; });
            d[(y * W + x) * 4 + c] = buf[4];
          }
        }
      }
      put(g);
    };
    F['Glow'] = function () {
      var g = grab(); if (!g) return;
      /* Screen the picture over a blurred copy of its own highlights. */
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var bright = new Uint8ClampedArray(d.length);
      for (var i = 0; i < d.length; i += 4) {
        var t = Math.max(0, lum(d[i], d[i + 1], d[i + 2]) - 150) / 105;
        bright[i] = d[i] * t; bright[i + 1] = d[i + 1] * t;
        bright[i + 2] = d[i + 2] * t; bright[i + 3] = d[i + 3];
      }
      var soft = blurData(bright, W, H, 12);
      for (i = 0; i < d.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          d[i + c] = 255 - (255 - d[i + c]) * (255 - soft[i + c] * 0.85) / 255;
        }
      }
      put(g);
    };
    F['Tilt shift'] = function () {
      var g = grab(); if (!g) return;
      /* A band across the middle stays sharp and everything above and below it
         goes progressively soft, which is what makes a real scene read as a
         model of one. */
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var soft = blurData(d, W, H, Math.max(3, Math.round(H / 45)));
      var mid = H / 2, keep = H * 0.16, fade = H * 0.22;
      for (var y = 0; y < H; y++) {
        var t = clamp((Math.abs(y - mid) - keep) / fade, 0, 1);
        for (var x = 0; x < W; x++) {
          var i = (y * W + x) * 4;
          for (var c = 0; c < 3; c++) d[i + c] += (soft[i + c] - d[i + c]) * t;
        }
      }
      put(g);
    };

    /* ---- artistic ------------------------------------------------------ */
    F['Oil paint'] = function () {
      var g = grab(); if (!g) return;
      /* Kuwahara-ish: for each pixel take the most common intensity bucket in
         its neighbourhood and the average colour of the pixels in it. That is
         what gives the flat, brush-loaded look rather than a blur. */
      var W = g.r.w, H = g.r.h, src = new Uint8ClampedArray(g.img.data), d = g.img.data;
      var R = 3, LV = 20;
      var cnt = new Int32Array(LV), ar = new Int32Array(LV), ag = new Int32Array(LV), ab = new Int32Array(LV);
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          cnt.fill(0); ar.fill(0); ag.fill(0); ab.fill(0);
          for (var ky = -R; ky <= R; ky++) {
            for (var kx = -R; kx <= R; kx++) {
              var sy = clamp(y + ky, 0, H - 1), sx = clamp(x + kx, 0, W - 1);
              var si = (sy * W + sx) * 4;
              var b = (lum(src[si], src[si + 1], src[si + 2]) * LV / 256) | 0;
              cnt[b]++; ar[b] += src[si]; ag[b] += src[si + 1]; ab[b] += src[si + 2];
            }
          }
          var best = 0;
          for (var k = 1; k < LV; k++) if (cnt[k] > cnt[best]) best = k;
          var o = (y * W + x) * 4, n = cnt[best] || 1;
          d[o] = ar[best] / n; d[o + 1] = ag[best] / n; d[o + 2] = ab[best] / n;
        }
      }
      put(g);
    };
    F['Pencil sketch'] = function () {
      var g = grab(); if (!g) return;
      /* Colour dodge of the grey picture by its own inverted blur — the
         standard darkroom trick, and it holds fine lines that an edge-detect
         kernel turns into a scribble. */
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var grey = new Uint8ClampedArray(d.length);
      for (var i = 0; i < d.length; i += 4) {
        var t = lum(d[i], d[i + 1], d[i + 2]);
        grey[i] = grey[i + 1] = grey[i + 2] = 255 - t;
        grey[i + 3] = d[i + 3];
      }
      var soft = blurData(grey, W, H, 6);
      for (i = 0; i < d.length; i += 4) {
        var base = lum(d[i], d[i + 1], d[i + 2]);
        var v = soft[i] >= 255 ? 255 : Math.min(255, base * 255 / (255 - soft[i]));
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      put(g);
    };
    F['Cartoon'] = function () {
      var g = grab(); if (!g) return;
      /* Flatten the colours into bands, then lay the edges over the top in
         black. Both halves are needed: bands alone look posterised, edges
         alone look like a line drawing. */
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var soft = blurData(d, W, H, 2);
      var step = 255 / 5;
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var i = (y * W + x) * 4;
          var gx = 0, gy = 0;
          if (x > 0 && x < W - 1 && y > 0 && y < H - 1) {
            var L = function (xx, yy) {
              var j = (yy * W + xx) * 4;
              return lum(soft[j], soft[j + 1], soft[j + 2]);
            };
            gx = L(x + 1, y) - L(x - 1, y);
            gy = L(x, y + 1) - L(x, y - 1);
          }
          var edge = Math.sqrt(gx * gx + gy * gy) > 26 ? 0 : 1;
          for (var c = 0; c < 3; c++) {
            d[i + c] = Math.round(soft[i + c] / step) * step * edge;
          }
        }
      }
      put(g);
    };
    F['Watercolour'] = function () {
      var g = grab(); if (!g) return;
      var d = g.img.data, W = g.r.w, H = g.r.h;
      var soft = blurData(d, W, H, 4), step = 255 / 7;
      for (var i = 0; i < d.length; i += 4) {
        var wobble = (Math.random() - 0.5) * 14;
        for (var c = 0; c < 3; c++) {
          d[i + c] = clamp(Math.round((soft[i + c] + wobble) / step) * step, 0, 255);
        }
      }
      put(g);
    };
    F['Stained glass'] = function () {
      var g = grab(); if (!g) return;
      /* Scatter seed points, give every pixel the colour of the nearest one,
         and darken the pixels that sit on a boundary between two cells. */
      var d = g.img.data, W = g.r.w, H = g.r.h, src = new Uint8ClampedArray(d);
      var cell = 22, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
      var pts = [];
      for (var j = 0; j < rows; j++) {
        for (var i2 = 0; i2 < cols; i2++) {
          pts.push([i2 * cell + Math.random() * cell, j * cell + Math.random() * cell]);
        }
      }
      var owner = new Int32Array(W * H);
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          /* Only the nine cells around this one can win, so this stays linear
             in pixels rather than pixels x seeds. */
          var ci = clamp((x / cell) | 0, 0, cols - 1), cj = clamp((y / cell) | 0, 0, rows - 1);
          var bi = -1, bd = Infinity;
          for (var dj = -1; dj <= 1; dj++) {
            for (var di = -1; di <= 1; di++) {
              var ii = ci + di, jj = cj + dj;
              if (ii < 0 || jj < 0 || ii >= cols || jj >= rows) continue;
              var idx = jj * cols + ii, px = pts[idx];
              var dd = (px[0] - x) * (px[0] - x) + (px[1] - y) * (px[1] - y);
              if (dd < bd) { bd = dd; bi = idx; }
            }
          }
          owner[y * W + x] = bi;
        }
      }
      var sum = {};
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        var o = owner[y * W + x], s = sum[o] || (sum[o] = [0, 0, 0, 0]), k = (y * W + x) * 4;
        s[0] += src[k]; s[1] += src[k + 1]; s[2] += src[k + 2]; s[3]++;
      }
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        var oo = owner[y * W + x], ss = sum[oo], kk = (y * W + x) * 4;
        var lead = (x > 0 && owner[y * W + x - 1] !== oo) || (y > 0 && owner[(y - 1) * W + x] !== oo);
        var f = lead ? 0.25 : 1;
        d[kk] = ss[0] / ss[3] * f; d[kk + 1] = ss[1] / ss[3] * f; d[kk + 2] = ss[2] / ss[3] * f;
      }
      put(g);
    };
    F['Halftone'] = function () {
      var g = grab(); if (!g) return;
      /* Print dots: a grid of circles whose radius is the local darkness. */
      var l = active(), r = g.r, cell = 6;
      var tmp = makeCanvas(r.w, r.h), tx = tmp.getContext('2d');
      var d = g.img.data;
      tx.fillStyle = '#fff'; tx.fillRect(0, 0, r.w, r.h);
      tx.fillStyle = '#000';
      for (var y = 0; y < r.h; y += cell) {
        for (var x = 0; x < r.w; x += cell) {
          var sr = 0, n = 0;
          for (var j = 0; j < cell && y + j < r.h; j++) {
            for (var i = 0; i < cell && x + i < r.w; i++) {
              var k = ((y + j) * r.w + (x + i)) * 4;
              sr += lum(d[k], d[k + 1], d[k + 2]); n++;
            }
          }
          var rad = (1 - (sr / n) / 255) * (cell * 0.72);
          if (rad > 0.3) {
            tx.beginPath();
            tx.arc(x + cell / 2, y + cell / 2, rad, 0, Math.PI * 2);
            tx.fill();
          }
        }
      }
      g.cx.clearRect(r.x, r.y, r.w, r.h);
      g.cx.drawImage(tmp, r.x, r.y);
      touch(l);
    };
    F['Mosaic tiles'] = function () { P.pixelate(14); };

    /* ---- distort ------------------------------------------------------- */
    F['Twirl'] = function () {
      warp(function (x, y, cx) {
        var d = Math.sqrt(x * x + y * y), max = Math.min(cx, cx);
        var a = Math.atan2(y, x) - (1 - clamp(d / (max * 1.2), 0, 1)) * 2.2;
        return [Math.cos(a) * d, Math.sin(a) * d];
      });
    };
    F['Bulge'] = function () {
      warp(function (x, y, cx, cy) {
        var max = Math.min(cx, cy), d = Math.sqrt(x * x + y * y);
        if (d > max) return [x, y];
        var k = Math.pow(d / max, 1.6);
        return [x * k * (max / (d || 1)), y * k * (max / (d || 1))];
      });
    };
    F['Pinch'] = function () {
      warp(function (x, y, cx, cy) {
        var max = Math.min(cx, cy), d = Math.sqrt(x * x + y * y);
        if (d > max || d === 0) return [x, y];
        var k = Math.pow(d / max, 0.62);
        return [x * k * (max / d), y * k * (max / d)];
      });
    };
    F['Fisheye'] = function () {
      warp(function (x, y, cx, cy) {
        var max = Math.min(cx, cy), d = Math.sqrt(x * x + y * y);
        if (d === 0 || d > max) return [x, y];
        var k = Math.atan(d / max * 2.2) / Math.atan(2.2);
        return [x * k * max / d, y * k * max / d];
      });
    };
    F['Ripple'] = function () {
      warp(function (x, y) {
        var d = Math.sqrt(x * x + y * y);
        var off = Math.sin(d / 9) * 7;
        return [x + (x / (d || 1)) * off, y + (y / (d || 1)) * off];
      });
    };
    F['Wave'] = function () {
      warp(function (x, y) { return [x + Math.sin(y / 14) * 9, y]; });
    };

    /* ---- edges of the frame -------------------------------------------- */
    F['Border'] = function () {
      var l = active(); if (!l) return;
      var doc = P.doc(), cx = ctxOf(l), w = Math.max(4, Math.round(Math.min(doc.w, doc.h) * 0.03));
      cx.save();
      cx.strokeStyle = P.brush().color;
      cx.lineWidth = w;
      cx.strokeRect(w / 2, w / 2, doc.w - w, doc.h - w);
      cx.restore();
      touch(l);
    };
    F['Edge fade'] = function () {
      var l = active(); if (!l) return;
      /* Fades the ALPHA rather than towards a colour, so it works over
         whatever is on the layer below instead of only over white. */
      var doc = P.doc(), cx = ctxOf(l);
      var img = cx.getImageData(0, 0, doc.w, doc.h), d = img.data;
      var fx = doc.w * 0.14, fy = doc.h * 0.14;
      for (var y = 0; y < doc.h; y++) {
        for (var x = 0; x < doc.w; x++) {
          var t = Math.min(
            clamp(x / fx, 0, 1), clamp((doc.w - 1 - x) / fx, 0, 1),
            clamp(y / fy, 0, 1), clamp((doc.h - 1 - y) / fy, 0, 1));
          d[(y * doc.w + x) * 4 + 3] *= t;
        }
      }
      cx.putImageData(img, 0, 0);
      touch(l);
    };

    /* ======================================================================
       THE TOOLS THAT NEED A GESTURE
       ==================================================================== */
    var T = P.TOOLS;
    T.push(['wand', 'Magic wand', 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M12.2 6.2l-1.4-1.4M3 21l9-9']);
    T.push(['lasso', 'Lasso', 'M7 22a5 5 0 01-2-4c0-2 2-3 2-3M20.5 10c0 4.4-3.8 8-8.5 8s-8.5-3.6-8.5-8S7.3 2 12 2s8.5 3.6 8.5 8z']);
    T.push(['heal', 'Blemish', 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 13c1.5 2 6.5 2 8-2']);
    T.push(['redeye', 'Red eye', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z']);
    T.push(['gradient', 'Gradient', 'M3 3h18v18H3zM3 12h18']);

    var wandTol = 32, healSize = 26, gradKind = 'linear';

    /* --- magic wand: flood fill over colour distance, result becomes the
       selection box. The editor's selection is rectangular, so this reports
       the bounding box of what it matched and says so rather than pretending
       to have selected a shape. */
    P.tools.wand = {
      down: function (p) {
        var l = active(); if (!l) return null;
        var doc = P.doc(), cx = ctxOf(l);
        var img = cx.getImageData(0, 0, doc.w, doc.h), d = img.data;
        var W = doc.w, H = doc.h;
        if (p.x < 0 || p.y < 0 || p.x >= W || p.y >= H) return null;
        var si = (p.y * W + p.x) * 4;
        var tr = d[si], tg = d[si + 1], tb = d[si + 2];
        var tol = wandTol * wandTol * 3;
        var seen = new Uint8Array(W * H), stack = [p.y * W + p.x];
        var minx = p.x, maxx = p.x, miny = p.y, maxy = p.y, hits = 0;
        while (stack.length) {
          var q = stack.pop();
          if (seen[q]) continue;
          seen[q] = 1;
          var k = q * 4;
          var dr = d[k] - tr, dg = d[k + 1] - tg, db = d[k + 2] - tb;
          if (dr * dr + dg * dg + db * db > tol) continue;
          hits++;
          var qx = q % W, qy = (q / W) | 0;
          if (qx < minx) minx = qx; if (qx > maxx) maxx = qx;
          if (qy < miny) miny = qy; if (qy > maxy) maxy = qy;
          if (qx > 0) stack.push(q - 1);
          if (qx < W - 1) stack.push(q + 1);
          if (qy > 0) stack.push(q - W);
          if (qy < H - 1) stack.push(q + W);
        }
        if (hits < 2) { toast('Nothing close enough in colour there'); return null; }
        P.setSel({ x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1 });
        toast('Selected the area around that colour — ' + hits.toLocaleString() + ' pixels');
        return null;
      }
    };

    /* --- lasso: draw a shape, and its bounding box becomes the selection.
       Same honesty as the wand — the box is what the rest of the editor can
       act on, so the box is what it gives you. */
    P.tools.lasso = {
      down: function (p) { return { ext: 'lasso', pts: [[p.x, p.y]] }; },
      move: function (p, e, drag) {
        drag.pts.push([p.x, p.y]);
        var xs = drag.pts.map(function (a) { return a[0]; });
        var ys = drag.pts.map(function (a) { return a[1]; });
        P.setSel({ x: Math.min.apply(null, xs), y: Math.min.apply(null, ys),
                   w: Math.max.apply(null, xs) - Math.min.apply(null, xs),
                   h: Math.max.apply(null, ys) - Math.min.apply(null, ys) });
      },
      up: function (p, e, drag) {
        if (drag.pts.length < 3) { P.setSel(null); return; }
        toast('Selected the area you drew around');
      }
    };

    /* --- blemish remover. Not content-aware and does not claim to be: it
       takes a ring of pixels from around the spot and blends them over it,
       which is what actually removes a spot on skin and is honest about
       failing on a busy background. */
    P.tools.heal = {
      down: function (p) {
        var l = active(); if (!l || l.locked) { toast('That layer is locked'); return null; }
        push();
        var doc = P.doc(), cx = ctxOf(l), R = Math.round(healSize / 2);
        var x0 = clamp(p.x - R, 0, doc.w - 1), y0 = clamp(p.y - R, 0, doc.h - 1);
        var w = Math.min(doc.w - x0, R * 2), h = Math.min(doc.h - y0, R * 2);
        if (w < 3 || h < 3) return null;
        var img = cx.getImageData(x0, y0, w, h), d = img.data;
        /* average of the ring at the edge of the patch */
        var sr = 0, sg = 0, sb = 0, n = 0;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            if (x > 1 && x < w - 2 && y > 1 && y < h - 2) continue;
            var k = (y * w + x) * 4;
            sr += d[k]; sg += d[k + 1]; sb += d[k + 2]; n++;
          }
        }
        if (!n) return null;
        sr /= n; sg /= n; sb /= n;
        var cxm = w / 2, cym = h / 2, max = Math.min(cxm, cym);
        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            var dx = x - cxm, dy = y - cym;
            var t = 1 - clamp(Math.sqrt(dx * dx + dy * dy) / max, 0, 1);
            t = t * t;                       // soft edge, so the patch has no rim
            var i = (y * w + x) * 4;
            d[i] += (sr - d[i]) * t;
            d[i + 1] += (sg - d[i + 1]) * t;
            d[i + 2] += (sb - d[i + 2]) * t;
          }
        }
        cx.putImageData(img, x0, y0);
        touch(l); render();
        return null;
      }
    };

    /* --- red eye. Only touches pixels that are actually red-dominant, so
       clicking near an eye rather than exactly on it does not grey out the
       skin around it. */
    P.tools.redeye = {
      down: function (p) {
        var l = active(); if (!l || l.locked) { toast('That layer is locked'); return null; }
        push();
        var doc = P.doc(), cx = ctxOf(l), R = 18;
        var x0 = clamp(p.x - R, 0, doc.w - 1), y0 = clamp(p.y - R, 0, doc.h - 1);
        var w = Math.min(doc.w - x0, R * 2), h = Math.min(doc.h - y0, R * 2);
        if (w < 3 || h < 3) return null;
        var img = cx.getImageData(x0, y0, w, h), d = img.data, hit = 0;
        for (var i = 0; i < d.length; i += 4) {
          var r = d[i], gg2 = d[i + 1], b = d[i + 2];
          if (r > 60 && r > gg2 * 1.5 && r > b * 1.4) {
            var keep = (gg2 + b) / 2;
            d[i] = keep * 0.8; d[i + 1] = gg2 * 0.9; d[i + 2] = b * 0.9;
            hit++;
          }
        }
        cx.putImageData(img, x0, y0);
        touch(l); render();
        toast(hit ? 'Fixed ' + hit + ' red pixels' : 'No red eye found there — click on the pupil');
        return null;
      }
    };

    /* --- gradient: drag to set direction and length. */
    P.tools.gradient = {
      down: function (p) {
        var l = active(); if (!l || l.locked) { toast('That layer is locked'); return null; }
        push();
        return { ext: 'gradient', x0: p.x, y0: p.y };
      },
      up: function (p, e, drag) {
        var l = active(); if (!l) return;
        var doc = P.doc(), cx = ctxOf(l), r = region();
        var col = P.brush().color, rgb = hex2rgb(col);
        var gr;
        if (gradKind === 'radial') {
          var rad = Math.max(4, Math.hypot(p.x - drag.x0, p.y - drag.y0));
          gr = cx.createRadialGradient(drag.x0, drag.y0, 0, drag.x0, drag.y0, rad);
        } else {
          gr = cx.createLinearGradient(drag.x0, drag.y0, p.x, p.y);
        }
        gr.addColorStop(0, 'rgba(' + rgb.join(',') + ',1)');
        gr.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
        cx.save();
        cx.beginPath();
        cx.rect(r.x, r.y, r.w, r.h);
        cx.clip();
        cx.fillStyle = gr;
        cx.fillRect(r.x, r.y, r.w, r.h);
        cx.restore();
        touch(l); render();
      }
    };

    /* ======================================================================
       PANEL SECTIONS
       ==================================================================== */

    /* --- levels, curves and the auto buttons --- */
    var lv = { lo: 0, hi: 255, gamma: 1 };
    var curve = [0, 64, 128, 192, 255];        // output at five evenly spaced inputs

    function curveMap() {
      var t = new Uint8ClampedArray(256);
      for (var i = 0; i < 256; i++) {
        var f = i / 255 * 4, a = Math.min(3, f | 0), frac = f - a;
        t[i] = curve[a] + (curve[a + 1] - curve[a]) * frac;
      }
      return t;
    }

    P.sections.push({
      html: function (l, tool) {
        if (tool !== 'adjust' || !l) return '';
        return '<div class="sect"><h3>Levels and curves<span class="sp"></span>' +
          '<button id="fxLvReset" type="button">Reset</button></h3><div class="in">' +
          '<div class="chips">' +
            '<button id="fxAutoL" type="button">Auto levels</button>' +
            '<button id="fxAutoC" type="button">Auto contrast</button>' +
            '<button id="fxAutoK" type="button">Auto colour</button>' +
          '</div>' +
          '<label class="f">Black point</label><div class="row">' +
            '<input type="range" id="fxLo" min="0" max="254" value="' + lv.lo + '">' +
            '<span class="val">' + lv.lo + '</span></div>' +
          '<label class="f">White point</label><div class="row">' +
            '<input type="range" id="fxHi" min="1" max="255" value="' + lv.hi + '">' +
            '<span class="val">' + lv.hi + '</span></div>' +
          '<label class="f">Midtones</label><div class="row">' +
            '<input type="range" id="fxGa" min="20" max="300" value="' + Math.round(lv.gamma * 100) + '">' +
            '<span class="val">' + lv.gamma.toFixed(2) + '</span></div>' +
          '<button id="fxLvGo" class="prim" type="button" style="width:100%">Apply levels</button>' +
          '<label class="f" style="margin-top:12px">Curve</label>' +
          '<div class="row">' + curve.map(function (v, i) {
            return '<input type="range" class="fxCv" data-c="' + i + '" min="0" max="255" value="' + v +
                   '" style="writing-mode:vertical-lr;direction:rtl;width:26px;height:74px">';
          }).join('') + '</div>' +
          '<button id="fxCvGo" type="button" style="width:100%">Apply curve</button>' +
          '<p class="hint">Levels stretch the tones between a black and a white point; the curve bends ' +
          'them in between. Both write into the pixels — the sliders above them stay live on the layer.</p>' +
          '</div></div>';
      },
      wire: function (l, tool) {
        if (tool !== 'adjust' || !l) return;
        var $ = function (id) { return document.getElementById(id); };
        var bind = function (id, set) {
          var el = $(id); if (!el) return;
          el.oninput = function () {
            set(+el.value);
            var v = el.parentNode.querySelector('.val');
            if (v) v.textContent = id === 'fxGa' ? lv.gamma.toFixed(2) : el.value;
          };
        };
        bind('fxLo', function (v) { lv.lo = Math.min(v, lv.hi - 1); });
        bind('fxHi', function (v) { lv.hi = Math.max(v, lv.lo + 1); });
        bind('fxGa', function (v) { lv.gamma = v / 100; });
        if ($('fxLvGo')) $('fxLvGo').onclick = function () {
          push();
          var m = levelsMap(lv.lo, lv.hi, lv.gamma);
          applyMaps(m, m, m); render();
        };
        if ($('fxLvReset')) $('fxLvReset').onclick = function () {
          lv = { lo: 0, hi: 255, gamma: 1 };
          curve = [0, 64, 128, 192, 255];
          P.repaint();
        };
        if ($('fxAutoL')) $('fxAutoL').onclick = function () { push(); F['Auto levels'](); render(); };
        if ($('fxAutoC')) $('fxAutoC').onclick = function () { push(); F['Auto contrast'](); render(); };
        if ($('fxAutoK')) $('fxAutoK').onclick = function () { push(); F['Auto colour'](); render(); };
        Array.prototype.forEach.call(document.querySelectorAll('.fxCv'), function (el) {
          el.oninput = function () { curve[+el.dataset.c] = +el.value; };
        });
        if ($('fxCvGo')) $('fxCvGo').onclick = function () {
          push();
          var m = curveMap();
          applyMaps(m, m, m); render();
        };
      }
    });

    /* --- the settings for the new tools --- */
    P.sections.push({
      html: function (l, tool) {
        if (tool === 'wand') {
          return '<div class="sect"><h3>Magic wand</h3><div class="in">' +
            '<label class="f">Tolerance</label><div class="row">' +
            '<input type="range" id="fxTol" min="4" max="120" value="' + wandTol + '">' +
            '<span class="val">' + wandTol + '</span></div>' +
            '<p class="hint">Click a colour and everything joined to it within the tolerance is found. ' +
            'The editor\'s selection is a rectangle, so what you get is the <b>box around</b> what matched ' +
            '— enough to aim a filter at, not a cut-out shape.</p></div></div>';
        }
        if (tool === 'lasso') {
          return '<div class="sect"><h3>Lasso</h3><div class="in">' +
            '<p class="hint">Draw around what you want. Same as the wand: the selection that comes out ' +
            'is the box around your shape, because that is what the filters and the crop can act on.</p>' +
            '</div></div>';
        }
        if (tool === 'heal') {
          return '<div class="sect"><h3>Blemish remover</h3><div class="in">' +
            '<label class="f">Size</label><div class="row">' +
            '<input type="range" id="fxHeal" min="8" max="90" value="' + healSize + '">' +
            '<span class="val">' + healSize + '</span></div>' +
            '<p class="hint">Click a spot and the skin around it is blended over the top, softly enough ' +
            'to leave no rim. It works on an even background and not on a busy one — for that, the clone ' +
            'stamp with <kbd>Alt</kbd>-click is the better tool.</p></div></div>';
        }
        if (tool === 'redeye') {
          return '<div class="sect"><h3>Red eye</h3><div class="in">' +
            '<p class="hint">Click the pupil. Only pixels that are genuinely red-dominant are changed, ' +
            'so a click that lands slightly off does not grey the skin — it says it found nothing ' +
            'instead.</p></div></div>';
        }
        if (tool === 'gradient') {
          return '<div class="sect"><h3>Gradient</h3><div class="in">' +
            '<div class="chips">' +
            '<button data-grad="linear" class="' + (gradKind === 'linear' ? 'on' : '') + '" type="button">Linear</button>' +
            '<button data-grad="radial" class="' + (gradKind === 'radial' ? 'on' : '') + '" type="button">Radial</button>' +
            '</div><label class="f">Colour</label><input type="color" id="fxGradC" value="' +
            esc(P.brush().color) + '">' +
            '<p class="hint">Drag on the picture to set where it starts and ends. It fades from the ' +
            'colour to transparent, so it layers over what is underneath rather than covering it.</p>' +
            '</div></div>';
        }
        return '';
      },
      wire: function (l, tool) {
        var $ = function (id) { return document.getElementById(id); };
        if ($('fxTol')) $('fxTol').oninput = function () {
          wandTol = +this.value;
          this.parentNode.querySelector('.val').textContent = wandTol;
        };
        if ($('fxHeal')) $('fxHeal').oninput = function () {
          healSize = +this.value;
          this.parentNode.querySelector('.val').textContent = healSize;
        };
        if ($('fxGradC')) $('fxGradC').oninput = function () { P.brush().color = this.value; };
        Array.prototype.forEach.call(document.querySelectorAll('[data-grad]'), function (b) {
          b.onclick = function () { gradKind = b.dataset.grad; P.repaint(); };
        });
      }
    });

    /* --- straighten, and a watermark --- */
    P.sections.push({
      html: function () {
        return '<div class="sect"><h3>Straighten and finish</h3><div class="in">' +
          '<label class="f">Angle</label><div class="row">' +
          '<input type="range" id="fxAng" min="-45" max="45" step="0.5" value="0">' +
          '<span class="val">0°</span></div>' +
          '<button id="fxAngGo" type="button" style="width:100%">Straighten</button>' +
          '<p class="hint">Rotates by any angle and scales up so no corner shows through. ' +
          'The 90° buttons above are lossless; this one resamples, so it is worth doing once.</p>' +
          '<label class="f" style="margin-top:12px">Watermark</label>' +
          '<input type="text" id="fxWmT" placeholder="Your name or @handle" maxlength="60">' +
          '<div class="grid2" style="margin-top:6px">' +
          '<button id="fxWmGo" type="button">Add it</button>' +
          '<button id="fxBg" type="button">Cut background</button></div>' +
          '<p class="hint"><b>Cut background</b> makes every pixel matching the one at the top-left ' +
          'corner transparent, within the wand\'s tolerance. It is a colour key, so it works on a plain ' +
          'backdrop and not on a photograph of a room.</p></div></div>';
      },
      wire: function () {
        var $ = function (id) { return document.getElementById(id); };
        var ang = 0;
        if ($('fxAng')) $('fxAng').oninput = function () {
          ang = +this.value;
          this.parentNode.querySelector('.val').textContent = ang + '°';
        };
        if ($('fxAngGo')) $('fxAngGo').onclick = function () {
          if (!ang) { toast('Set an angle first'); return; }
          push();
          var doc = P.doc(), rad = Math.abs(ang * Math.PI / 180);
          /* Scale so the rotated rectangle still covers the frame — otherwise
             straightening a photo puts four triangular holes in its corners. */
          var scale = Math.abs(Math.sin(rad)) * (doc.h / doc.w) + Math.abs(Math.cos(rad));
          scale = Math.max(scale, Math.abs(Math.sin(rad)) * (doc.w / doc.h) + Math.abs(Math.cos(rad)));
          doc.layers.forEach(function (L) {
            var c = makeCanvas(doc.w, doc.h), cx = c.getContext('2d');
            cx.translate(doc.w / 2, doc.h / 2);
            cx.rotate(ang * Math.PI / 180);
            cx.scale(scale, scale);
            cx.drawImage(L.canvas, -doc.w / 2, -doc.h / 2);
            L.canvas = c;
            touch(L);
          });
          render();
          toast('Straightened by ' + ang + '°');
        };
        if ($('fxWmGo')) $('fxWmGo').onclick = function () {
          var t = ($('fxWmT').value || '').trim();
          if (!t) { toast('Type the words first'); return; }
          var l = active(); if (!l) return;
          push();
          var doc = P.doc(), cx = ctxOf(l);
          var size = Math.max(12, Math.round(Math.min(doc.w, doc.h) * 0.045));
          cx.save();
          cx.font = '700 ' + size + "px system-ui, 'Segoe UI', sans-serif";
          cx.textAlign = 'right';
          cx.textBaseline = 'bottom';
          cx.globalAlpha = 0.62;
          /* Drawn twice: a dark pass offset by a pixel, so it stays readable
             over a light picture and a dark one alike. */
          cx.fillStyle = 'rgba(0,0,0,.55)';
          cx.fillText(t, doc.w - size * 0.6 + 1, doc.h - size * 0.5 + 1);
          cx.fillStyle = '#fff';
          cx.fillText(t, doc.w - size * 0.6, doc.h - size * 0.5);
          cx.restore();
          touch(l); render();
        };
        if ($('fxBg')) $('fxBg').onclick = function () {
          var l = active(); if (!l) return;
          push();
          var doc = P.doc(), cx = ctxOf(l);
          var img = cx.getImageData(0, 0, doc.w, doc.h), d = img.data;
          var tr = d[0], tg = d[1], tb = d[2], tol = wandTol * wandTol * 3, n = 0;
          for (var i = 0; i < d.length; i += 4) {
            var dr = d[i] - tr, dg = d[i + 1] - tg, db = d[i + 2] - tb;
            if (dr * dr + dg * dg + db * db <= tol) { d[i + 3] = 0; n++; }
          }
          cx.putImageData(img, 0, 0);
          touch(l); render();
          toast(n ? 'Cleared ' + n.toLocaleString() + ' pixels' :
                    'Nothing matched the top-left corner — raise the wand tolerance');
        };
      }
    });

    /* Every FILTERS entry photo.html wires up already calls push() for itself
       through the chip handler, so nothing here needs to. The dock is repainted
       once so the new chips, tools and sections all appear. */
    P.repaint();
  }

  if (window.NC_PHOTO) boot();
  else addEventListener('nc-photo-ready', boot);
})();
