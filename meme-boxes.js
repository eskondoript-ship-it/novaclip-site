/* ============================================================================
   NOVACLIP — PUTTING MEME CAPTIONS WHERE THE MEME HAS ROOM FOR THEM
   ============================================================================
   The editor's meme tool wrote the first caption across the top of the picture
   and the second across the bottom, on every template. That is right for the
   Impact-on-a-photograph memes it was built for and wrong for most of what
   people actually reach for: Drake has two blank panels down the right-hand
   side, Change My Mind has a blank sign, Expanding Brain has four empty boxes
   down the left, Two Buttons has two blank buttons. On all of those, a caption
   nailed to the top edge lands on somebody's face and the blank space the
   template exists for stays empty.

   WHY THIS LOOKS AT THE PICTURE INSTEAD OF KEEPING A LIST

   A table of hand-measured boxes was the first thought. It is wrong for two
   reasons. The editor pulls its templates live from imgflip and memegen —
   hundreds of them, and the list changes without us — so a table covers the
   dozen somebody thought of and leaves every other template with the old
   behaviour. And neither API publishes box coordinates: imgflip gives a count
   and nothing else, memegen renders its own captions top and bottom, exactly
   the thing being fixed here. A table would also have to be measured by eye,
   which is a lot of numbers nobody can check.

   So this reads the template. A meme's caption space IS its flat space: the
   white half of Drake, the blank sign, the empty panel. Flat regions are
   trivial to find — low edge energy, low variance — and the same measurement
   that finds a white panel finds the sky above a cat or the empty tarmac in a
   road photo, which is also exactly where a caption belongs.

   WHAT IT DOES NOT DO

   It does not understand the joke. On a template with two equally good blank
   areas it has no way to know which one the first line belongs in, so it reads
   them in the order a person reads: top to bottom, then left to right. On a
   busy photograph with no flat area at all it finds nothing worth using and
   falls back to the classic band across the top and the bottom, which is the
   right answer for that kind of template and is what it always did.
   ============================================================================ */
(function () {
  'use strict';
  if (window.NC_MEME) return;

  /* The analysis runs on a thumbnail, not the full template. 64 cells across
     is enough to tell a blank panel from a face and it keeps the whole thing
     at about a millisecond — this runs while somebody is waiting for a button
     they have just pressed. */
  var GRID = 64;

  /* ---------------------------------------------------------------- reading
     One pass over the thumbnail builds three summed-area tables: luminance,
     luminance squared, and edge energy. After that, the mean and the variance
     of any rectangle in the picture are four lookups each, which is what makes
     it affordable to score every candidate box rather than a handful. */
  function scan(img, w, h) {
    var cv = document.createElement('canvas');
    var gw = GRID, gh = Math.max(8, Math.round(GRID * h / w));
    cv.width = gw; cv.height = gh;
    var c = cv.getContext('2d', { willReadFrequently: true });
    c.drawImage(img, 0, 0, gw, gh);
    var px;
    try { px = c.getImageData(0, 0, gw, gh).data; }
    catch (e) { return null; }          /* tainted — the caller falls back */

    var lum = new Float64Array(gw * gh);
    var i, x, y;
    for (i = 0; i < gw * gh; i++) {
      lum[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
    }
    /* Edge energy, as the plain difference to the right and below. A Sobel
       would be more correct and no more useful at this scale: what is being
       asked is "is anything happening here", not "which way does it face". */
    var edge = new Float64Array(gw * gh);
    for (y = 0; y < gh; y++) {
      for (x = 0; x < gw; x++) {
        var k = y * gw + x;
        var dx = x + 1 < gw ? Math.abs(lum[k + 1] - lum[k]) : 0;
        var dy = y + 1 < gh ? Math.abs(lum[k + gw] - lum[k]) : 0;
        edge[k] = dx + dy;
      }
    }
    return { gw: gw, gh: gh, lum: lum, edge: edge, sum: table(lum, gw, gh),
             sum2: table2(lum, gw, gh), sumE: table(edge, gw, gh) };
  }

  function table(a, gw, gh) {
    var t = new Float64Array((gw + 1) * (gh + 1)), x, y;
    for (y = 0; y < gh; y++) {
      for (x = 0; x < gw; x++) {
        t[(y + 1) * (gw + 1) + x + 1] =
          a[y * gw + x] + t[y * (gw + 1) + x + 1] + t[(y + 1) * (gw + 1) + x] - t[y * (gw + 1) + x];
      }
    }
    return t;
  }
  function table2(a, gw, gh) {
    var sq = new Float64Array(gw * gh);
    for (var i = 0; i < gw * gh; i++) sq[i] = a[i] * a[i];
    return table(sq, gw, gh);
  }
  function area(t, gw, x0, y0, x1, y1) {           /* [x0,x1) [y0,y1) */
    var W = gw + 1;
    return t[y1 * W + x1] - t[y0 * W + x1] - t[y1 * W + x0] + t[y0 * W + x0];
  }

  /* ---------------------------------------------------------------- finding
     Every candidate box is scored on three things: how flat it is, how big it
     is, and how wide it is. Flatness decides whether a caption would sit on
     top of something; size and shape decide whether the caption will be big
     enough to read. A tall narrow blank strip down the side of a picture is
     flat and useless. */
  function best(s, want) {
    var gw = s.gw, gh = s.gh, out = [];
    /* Cells already given to a box, so two captions cannot land on each
       other. */
    var taken = [];

    var widths = [], heights = [];
    var wfrac, hfrac;
    for (wfrac = 1.0; wfrac >= 0.30; wfrac -= 0.10) widths.push(Math.round(gw * wfrac));
    for (hfrac = 0.36; hfrac >= 0.09; hfrac -= 0.045) heights.push(Math.round(gh * hfrac));

    for (var n = 0; n < want; n++) {
      var top = null;
      for (var wi = 0; wi < widths.length; wi++) {
        var bw = widths[wi];
        if (bw < 6) continue;
        for (var hi = 0; hi < heights.length; hi++) {
          var bh = heights[hi];
          if (bh < 3) continue;
          /* A step of a cell or two. The first version stepped by a
             twenty-fourth of the picture, which on a tall template is four
             cells, and it walked straight past the blank buttons in Two
             Buttons — the one position that qualified was never looked at.
             Finer costs about a millisecond and finds things. */
          var stepX = Math.max(1, Math.round(gw / 56)), stepY = Math.max(1, Math.round(gh / 56));
          for (var y0 = 0; y0 + bh <= gh; y0 += stepY) {
            for (var x0 = 0; x0 + bw <= gw; x0 += stepX) {
              if (overlaps(taken, x0, y0, bw, bh)) continue;
              var cells = bw * bh;
              var e = area(s.sumE, gw, x0, y0, x0 + bw, y0 + bh) / cells;
              var m = area(s.sum, gw, x0, y0, x0 + bw, y0 + bh) / cells;
              var m2 = area(s.sum2, gw, x0, y0, x0 + bw, y0 + bh) / cells;
              var sd = Math.sqrt(Math.max(0, m2 - m * m));
              /* The two hard rejections, and both numbers were measured on
                 real templates rather than picked. Drake's white panels come
                 back at edge 0.0 and deviation 0.0; the blank buttons in Two
                 Buttons are 6.1 and 9.1, which a first cut at 6 threw away;
                 the busiest thing anybody would want a caption on is around 8.
                 A deviation over 30 means the box straddles two different
                 things — half on a white panel and half on a face.

                 Gru's Plan comes back at 11.3 and 95 and is rejected by both,
                 which is right: that template has pictures where the other
                 ones have blank boards, and there is genuinely nowhere flat to
                 put a caption. It falls back to the bands, which is the honest
                 answer rather than a failure. */
              if (e > 9 || sd > 30) continue;
              /* Flatness, then area, then a mild preference for wide boxes —
                 a caption is a line of words, not a column. */
              var flat = 1 / (1 + e * 0.6 + sd * 0.07);
              var score = flat * Math.pow(cells / (gw * gh), 0.55) * (0.6 + 0.4 * (bw / gw));
              if (!top || score > top.score) {
                top = { x: x0, y: y0, w: bw, h: bh, score: score, lum: m };
              }
            }
          }
        }
      }
      if (!top) break;
      taken.push(top);
      out.push(top);
    }

    /* Read in the order a person reads: down the page, then across. Row
       banding first, so two boxes side by side are not swapped by a few
       pixels of difference in their tops. */
    out.sort(function (a, b) {
      var band = Math.max(2, Math.round(gh * 0.08));
      var ra = Math.floor(a.y / band), rb = Math.floor(b.y / band);
      return ra !== rb ? ra - rb : a.x - b.x;
    });
    return out.map(function (b) {
      return { x: b.x / gw, y: b.y / gh, w: b.w / gw, h: b.h / gh, lum: b.lum };
    });
  }

  function overlaps(list, x, y, w, h) {
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      /* A little breathing room between boxes, so two captions are not
         touching even when the flat area is one big panel. */
      if (x < o.x + o.w + 1 && x + w + 1 > o.x && y < o.y + o.h + 1 && y + h + 1 > o.y) return true;
    }
    return false;
  }

  /* How pale the picture is under a box, in the same 0..255 the finder reports.
     A caption that has been dragged carries the brightness of the place it came
     from, and white words moved onto a white panel go invisible — so whatever
     moves one asks again. The scan is already in hand, so this is four lookups
     in the summed-area table and nothing else. */
  function lumAt(s, box) {
    if (!s) return 0;
    var x0 = Math.max(0, Math.min(s.gw - 1, Math.floor(box.x * s.gw)));
    var y0 = Math.max(0, Math.min(s.gh - 1, Math.floor(box.y * s.gh)));
    var x1 = Math.max(x0 + 1, Math.min(s.gw, Math.ceil((box.x + box.w) * s.gw)));
    var y1 = Math.max(y0 + 1, Math.min(s.gh, Math.ceil((box.y + box.h) * s.gh)));
    return area(s.sum, s.gw, x0, y0, x1, y1) / ((x1 - x0) * (y1 - y0));
  }

  /* The fallback, and the thing the editor did for every template: a band
     across the top and a band across the bottom. */
  function bands(count) {
    var out = [{ x: 0.03, y: 0.015, w: 0.94, h: 0.22, lum: 0 }];
    if (count > 1) out.push({ x: 0.03, y: 0.765, w: 0.94, h: 0.22, lum: 0 });
    for (var i = 2; i < count; i++) {
      out.push({ x: 0.03, y: 0.25 + (i - 2) * 0.17, w: 0.94, h: 0.15, lum: 0 });
    }
    return out;
  }

  /* --------------------------------------------------------------- drawing
     Impact, white, black outline — the house style of the form, and the only
     one that stays readable over anything. On a pale panel it flips to black
     text with a white outline, because white Impact on a white panel is an
     invisible caption, and a blank white panel is exactly what this is now
     good at finding. */
  /* The wrap, at one size. Gives back the lines, or null if the words cannot be
     broken to this width at this size — which is the only failure a wrap has. */
  function wrap(ctx, words, size, bw) {
    ctx.font = 'bold ' + size + 'px Impact, "Arial Black", sans-serif';
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var next = cur ? cur + ' ' + words[i] : words[i];
      /* THE OUTLINE IS PART OF THE WIDTH. measureText returns the width
         of the letters; the stroke is drawn centred on their edge and adds
         half a line width at each end, which at a caption's size is eleven
         pixels a side. Wrapping on the fill width alone is how a word ends
         up printed over the border of the picture. */
      if (ctx.measureText(next).width + size * 0.18 > bw * 0.98) {
        if (!cur) return null;                    /* one word wider than the box */
        lines.push(cur); cur = words[i];
      } else cur = next;
    }
    /* AND THE LAST LINE TOO. The loop above only measures a line when it is
       deciding whether to break, so whatever is left in hand at the end was
       pushed without ever being checked — which is how "REGION" came out
       614px wide in a 452px box, hanging over the edge of the picture with
       its last letter cut off. It is the one line of the wrap that nothing
       was measuring. */
    if (cur) {
      if (ctx.measureText(cur).width + size * 0.18 > bw * 0.98) return null;
      lines.push(cur);
    }
    return lines;
  }

  /* A hair inside the picture, always. A found box can sit flush against the
     edge of the image — on Is This A Pigeon both of them do — and a caption
     centred in it then has its outline hanging over the edge, which is where
     "A FLAT REGION" lost its N. */
  function inset(box, W) {
    var x0 = Math.max(box.x, 0.012), x1 = Math.min(box.x + box.w, 0.988);
    return { x0: x0, x1: x1, w: Math.max(0.08, x1 - x0) * W };
  }

  function fit(ctx, text, box, W, H) {
    var bw = inset(box, W).w, bh = box.h * H;
    var words = text.toUpperCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    for (var size = Math.min(bh * 0.92, H * 0.14); size > 7; size *= 0.94) {
      var lines = wrap(ctx, words, size, bw);
      if (!lines) continue;
      if (lines.length * size * 1.08 <= bh) return { size: size, lines: lines };
    }
    return null;
  }

  /* fit() refusing to answer means "put this somewhere else", and for a caption
     that has been dragged by hand there is nowhere else — the box is where it
     was put. So this one always answers: it keeps the width, shrinks until the
     longest word goes in, and lets the lines run past the bottom of the frame
     rather than dropping the words. */
  function squeeze(ctx, text, box, W, H) {
    var f = fit(ctx, text, box, W, H);
    if (f) return f;
    var bw = inset(box, W).w;
    var words = text.toUpperCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    for (var size = Math.min(box.h * H * 0.92, H * 0.14); size > 5; size *= 0.94) {
      var lines = wrap(ctx, words, size, bw);
      if (lines) return { size: size, lines: lines };
    }
    return { size: 6, lines: [words.join(' ')] };
  }

  /* One caption, centred in its box, in the house style: white Impact with a
     black outline, flipped to black-on-white over a pale panel. */
  function paint(ctx, f, box, W, H) {
    ctx.font = 'bold ' + f.size + 'px Impact, "Arial Black", sans-serif';
    ctx.lineWidth = Math.max(2, f.size * 0.16);
    var pale = box.lum > 150;
    ctx.strokeStyle = pale ? '#fff' : '#000';
    ctx.fillStyle = pale ? '#111' : '#fff';
    var blockH = f.lines.length * f.size * 1.08;
    var ins = inset(box, W);
    var cx = (ins.x0 + ins.x1) / 2 * W;   /* the same inset box fit() measured */
    /* A squeezed caption can be taller than its frame, and centring it then
       starts it above the top of the picture. The first line stays on the
       canvas whatever happens. */
    var top = Math.max(f.size * 0.86, (box.y * H) + (box.h * H - blockH) / 2 + f.size * 0.86);
    for (var li = 0; li < f.lines.length; li++) {
      var yy = top + li * f.size * 1.08;
      ctx.strokeText(f.lines[li], cx, yy);
      ctx.fillText(f.lines[li], cx, yy);
    }
  }

  function draw(canvas, img, texts, opt) {
    opt = opt || {};
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.drawImage(img, 0, 0, W, H);

    var wanted = texts.filter(function (t) { return (t || '').trim(); }).length;
    if (!wanted) return { boxes: [], auto: false };

    var s = opt.noScan ? null : scan(img, W, H);
    var found = s ? best(s, texts.length) : [];
    /* A box is only worth having if a caption actually fits in it. Anything
       that comes back unusable is replaced by its band, so a template with one
       good panel and one busy half still gets both captions. */
    var boxes = [], auto = true;
    var fb = bands(texts.length);
    for (var i = 0; i < texts.length; i++) {
      if (found[i]) boxes.push(found[i]);
      else {
        /* FEWER BOXES THAN CAPTIONS IS A FAILURE, NOT A PARTIAL SUCCESS.
           Filling the gap with a band put a full-width caption through the
           middle of a picture whose other two captions were sitting in boxes
           on the right — Is This A Pigeon, with "IS THIS A CAPTION SPOT"
           printed across the ones above and below it. A band is the whole
           width by definition, so it cannot share a picture with a box. */
        boxes.push(fb[i]);
        auto = false;
      }
    }

    /* ALL THE CAPTIONS GO IN BOXES, OR ALL OF THEM GO IN BANDS.

       Deciding per caption was the obvious thing and it was wrong. On Batman
       Slapping Robin the second caption fitted its speech bubble and the first
       did not, so the first fell back to the band — which runs the full width
       of the picture, straight through the bubble the second one was sitting
       in. "THE TOP TEXT" and "NO" were printed on top of each other. A band is
       the whole width by definition, so it can never share a picture with a
       box; the two placements are a choice about the template, not about one
       line.

       So every caption is measured in its box first, and the boxes are used
       only if every one of them comes out big enough to read. Otherwise the
       whole thing falls back to the classic bands, which is what it always
       did.

       BIG ENOUGH IS ABSOLUTE, NOT RELATIVE TO THE BAND. Measuring the box
       against the band was the first rule and it threw away almost everything:
       a band is the full width of the picture and a speech bubble is a third
       of it, so a bubble caption is always smaller — the test rejected Batman,
       Change My Mind, the balloon and Is This A Pigeon, every one of which had
       its caption in the right place. What actually matters is whether the
       words can be read, so the test is a floor: a caption has to come out at
       least 4.5% of the picture's height. Drake's panels and the speech
       bubbles clear it comfortably; the patch of flat sky over a street
       photograph does not, and that one goes back to the band. */
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    var plan = [], useBoxes = auto;      /* false already if a box is missing */
    for (var k = 0; k < texts.length; k++) {
      var t = (texts[k] || '').trim();
      if (!t) { plan.push(null); continue; }
      var inBox = fit(ctx, t, boxes[k], W, H);
      var inBand = fit(ctx, t, fb[k], W, H);
      if (!inBox || inBox.size < Math.max(11, H * 0.045)) useBoxes = false;
      plan.push({ text: t, box: inBox, band: inBand });
    }

    for (var j2 = 0; j2 < plan.length; j2++) {
      var row = plan[j2];
      if (!row) continue;
      var box = useBoxes ? boxes[j2] : fb[j2];
      var f = useBoxes ? row.box : row.band;
      if (!f) continue;
      paint(ctx, f, box, W, H);
    }
    boxes = useBoxes ? boxes : fb;
    auto = useBoxes;
    return { boxes: boxes, auto: auto };
  }

  /* ------------------------------------------------------------- drawing, told
     The same picture and the same house style, but at boxes somebody chose:
     no scan, no band fallback and no all-or-nothing rule, because none of those
     are decisions any more once a caption has been dragged into place. The
     caller has already drawn the template onto the canvas — this only adds the
     words, and it adds every one of them.

     `caps` is [{x, y, w, h, lum, text}] in the same 0..1 box coordinates the
     finder gives back, so a caption handed straight from NC_MEME.boxes() lands
     exactly where draw() would have put it. */
  function drawAt(canvas, caps) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    var drawn = [];
    for (var i = 0; i < caps.length; i++) {
      var c = caps[i];
      var t = (c.text || '').trim();
      if (!t) continue;
      var f = squeeze(ctx, t, c, W, H);
      if (!f) continue;
      paint(ctx, f, c, W, H);
      drawn.push({ x: c.x, y: c.y, w: c.w, h: c.h, lum: c.lum || 0, size: f.size });
    }
    return { boxes: drawn, auto: false };
  }

  window.NC_MEME = {
    /* Exposed for the tests: what size and how many lines a caption comes out
       at in a given box, which is the number every placement decision turns
       on and the only way to check one without reading pixels. */
    fit: fit,
    /* fit() that never says no — what drawAt uses, and what the editor's live
       preview has to use if the preview is to be the picture. */
    squeeze: squeeze,
    /* The brightness under a box, for a caption that has been moved. */
    lumAt: lumAt,
    /* Exposed one by one rather than as one call, so the editor can ask where
       the boxes are (to show them) without drawing, and the tests can check
       the finding and the drawing apart from each other. */
    scan: scan,
    boxes: function (img, w, h, n) { var s = scan(img, w, h); return s ? best(s, n) : []; },
    bands: bands,
    draw: draw,
    /* What the caption editor calls: boxes that were chosen, not found. */
    drawAt: drawAt
  };
})();
