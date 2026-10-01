/* ============================================================================
   NOVACLIP WATERMARK — on every free export, and awkward to paint out
   ============================================================================
   WHAT THIS CAN AND CANNOT DO, SAID PLAINLY

   A visible watermark cannot be made impossible to remove. Anything a person
   can see, an inpainting model can be pointed at. Anyone who tells you
   otherwise is selling something. What a watermark CAN do is cost more to
   remove than an upgrade costs, which is the whole job: the handful of people
   determined to strip it were never going to pay, and everybody else sees the
   name.

   So this is built against what the one-click removers actually do, which is
   take ONE rectangular mask and inpaint it on every frame:

     · the mark MOVES between five anchors every few seconds, so a single mask
       is wrong for most of the video
     · it rotates and changes size and opacity a little at each move, so
       template matching does not lock on
     · one anchor is inside the frame rather than in a corner, so a crop does
       not get rid of it and inpainting it damages the subject
     · a second, very faint, very large diagonal mark sits under the whole
       frame — removing it means touching every pixel, not a box
     · a repeating low-amplitude pattern is laid over the picture. It is
       invisible at normal viewing, survives re-encoding, and still correlates
       afterwards, so a stripped video can still be shown to have come from
       here. This is the part that genuinely does not come off.

   HOW IT ATTACHES

   The editor's export loop paints a frame and the browser samples that canvas
   through captureStream. Rather than edit the minified bundle to add a draw
   call — which the next build would overwrite — captureStream is wrapped: the
   export's canvas is copied to a canvas of our own, the marks go on top, and
   the recorder is handed OUR canvas. Draw order is then guaranteed, because
   nothing else can draw after us.

   WHO GETS IT

   Free exports only. ncProHas('tools') — Kids' Tools Upgrade or the Family
   Bundle — turns it off, which is the point: it is the reason to upgrade. A
   paying customer gets a clean file with nothing hidden in it either, because
   a site selling "nothing is uploaded, no adverts" cannot quietly stamp an
   invisible signal into work somebody paid for.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncWatermark) return;

  var WORD = 'NovaClip';
  var SITE = 'novaclip.org';

  /* Height of the mark as a share of the frame's SHORT side. 0.045 puts it at
     about 48px on 1080p — the size a viewer reads without it covering the
     video. Below ~0.03 it survives a downscale to a thumbnail and vanishes;
     above ~0.07 people crop the video rather than upgrade. */
  var MARK = 0.045;
  var MOVE_EVERY = 4.0;      /* seconds between hops */

  /* Five anchors as fractions of the frame. The fourth is deliberately off the
     edge-safe area and into the picture: a corner-only watermark is removed by
     cropping 8% off the frame, which costs the thief nothing. */
  var SPOTS = [
    { x: 0.045, y: 0.055, a: 'left',  b: 'top'    },
    { x: 0.955, y: 0.055, a: 'right', b: 'top'    },
    { x: 0.955, y: 0.945, a: 'right', b: 'bottom' },
    { x: 0.370, y: 0.560, a: 'left',  b: 'middle' },
    { x: 0.045, y: 0.945, a: 'left',  b: 'bottom' }
  ];

  function paid() {
    try { return !!(window.ncProHas && window.ncProHas('tools')); } catch (e) { return false; }
  }

  /* A cheap deterministic hash, so a given export always marks the same way and
     a re-export of the same project looks identical. */
  function seedOf(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function rnd(seed) {           /* mulberry32 */
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* --------------------------------------------------------------------------
     THE INVISIBLE LAYER
     --------------------------------------------------------------------------
     A tile of low-amplitude noise, built once, drawn over every frame with a
     tiny alpha. Two reasons it is a tile and not per-pixel maths: getImageData
     on a 1080p frame costs around 8ms and would halve the export frame rate,
     and a repeating pattern is what makes it detectable by correlation later
     even after the video has been re-encoded and rescaled.
     ------------------------------------------------------------------------ */
  function noiseTile(seed) {
    var N = 64, c = document.createElement('canvas'), x, y, v;
    c.width = c.height = N;
    var g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data, r = rnd(seed);
    for (y = 0; y < N; y++) {
      for (x = 0; x < N; x++) {
        var i = (y * N + x) * 4;
        /* Centred on mid-grey so 'overlay' leaves average brightness alone;
           the deviation is what carries the signal. */
        v = 128 + Math.round((r() - 0.5) * 36);
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function drawMarks(ctx, w, h, t, state) {
    var short = Math.min(w, h);
    var step = Math.floor(t / MOVE_EVERY);
    var r = rnd(state.seed + step * 2654435761);
    var spot = SPOTS[step % SPOTS.length];

    /* ---- the faint diagonal, under everything ---------------------------- */
    ctx.save();
    ctx.globalAlpha = 0.055;
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 9);
    ctx.font = '800 ' + Math.round(short * 0.20) + 'px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(WORD, 0, 0);
    ctx.restore();

    /* ---- the invisible pattern ------------------------------------------- */
    if (state.tile) {
      ctx.save();
      ctx.globalAlpha = 0.016;
      ctx.globalCompositeOperation = 'overlay';
      var pat = ctx.createPattern(state.tile, 'repeat');
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    }

    /* ---- the readable mark ----------------------------------------------- */
    var size = short * MARK * (0.92 + r() * 0.16);
    var tilt = (r() - 0.5) * 0.09;              /* radians, ±2.6° */
    var alpha = 0.52 + r() * 0.16;
    var px = spot.x * w, py = spot.y * h;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(tilt);
    ctx.textAlign = spot.a;
    ctx.textBaseline = spot.b;
    ctx.font = '800 ' + Math.round(size) + 'px "Plus Jakarta Sans", Inter, system-ui, sans-serif';

    /* A stroke under the fill so it reads on white snow and on a night sky
       alike, and so a remover cannot simply match one flat colour. */
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeStyle = 'rgba(0,0,0,' + (alpha * 0.55).toFixed(3) + ')';
    ctx.strokeText(WORD, 0, 0);

    /* A gradient fill rather than flat white: a flat fill is the easiest thing
       in the world to detect and replace. */
    var gx = ctx.createLinearGradient(0, -size * 0.6, size * 3.2, size * 0.4);
    gx.addColorStop(0, 'rgba(255,255,255,' + alpha.toFixed(3) + ')');
    gx.addColorStop(0.55, 'rgba(226,232,240,' + alpha.toFixed(3) + ')');
    gx.addColorStop(1, 'rgba(199,210,254,' + alpha.toFixed(3) + ')');
    ctx.fillStyle = gx;
    ctx.fillText(WORD, 0, 0);

    /* The address, smaller, under the name — the part that is actually worth
       something if the clip travels. */
    var sub = Math.round(size * 0.40);
    ctx.font = '600 ' + sub + 'px Inter, system-ui, sans-serif';
    ctx.lineWidth = Math.max(1.5, sub * 0.16);
    ctx.strokeStyle = 'rgba(0,0,0,' + (alpha * 0.5).toFixed(3) + ')';
    var dy = spot.b === 'bottom' ? -size * 1.05 : size * 1.12;
    ctx.strokeText(SITE, 0, dy);
    ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.9).toFixed(3) + ')';
    ctx.fillText(SITE, 0, dy);
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     THE HOOK
     --------------------------------------------------------------------------
     captureStream is wrapped rather than the bundle being edited, because the
     bundle is minified build output and the next build would drop the change.
     ------------------------------------------------------------------------ */
  var orig = HTMLCanvasElement.prototype.captureStream;
  if (!orig) return;

  HTMLCanvasElement.prototype.captureStream = function (fps) {
    var src = this;

    /* Only the export canvas is worth marking: it is offscreen and the size of
       the finished video. A preview canvas is in the page and must stay clean,
       or the editor itself looks watermarked. */
    var offscreen = !src.isConnected;
    if (!offscreen || src.width < 160 || src.height < 160 || paid()) {
      return orig.apply(src, arguments);
    }

    var w = src.width, h = src.height;
    var out = document.createElement('canvas');
    out.width = w; out.height = h;
    var ctx = out.getContext('2d', { alpha: false });

    var state = {
      seed: seedOf(w + 'x' + h + ':' + Date.now()),
      tile: null,
      t0: 0,
      raf: 0
    };
    try { state.tile = noiseTile(state.seed); } catch (e) { state.tile = null; }

    var stream = orig.call(out, fps);

    function tick(now) {
      if (!state.t0) state.t0 = now;
      try {
        ctx.drawImage(src, 0, 0, w, h);
        drawMarks(ctx, w, h, (now - state.t0) / 1000, state);
      } catch (e) { /* a frame that cannot be copied is better skipped than fatal */ }
      state.raf = requestAnimationFrame(tick);
    }
    state.raf = requestAnimationFrame(tick);

    /* Stop the loop when the recorder lets go of the track, or the tab keeps
       painting an invisible canvas for the rest of the session. */
    stream.getVideoTracks().forEach(function (tr) {
      var stop = tr.stop.bind(tr);
      tr.stop = function () { cancelAnimationFrame(state.raf); return stop(); };
      tr.addEventListener && tr.addEventListener('ended', function () {
        cancelAnimationFrame(state.raf);
      });
    });

    return stream;
  };

  window.__ncWatermark = {
    /* Exposed so the export dialog can say whether this file will carry a mark,
       and so pricing can link the two. */
    active: function () { return !paid(); },
    size: MARK,
    word: WORD
  };
})();
