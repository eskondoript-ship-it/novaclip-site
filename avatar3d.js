/* ============================================================================
   NOVACLIP — THE AVATARS, AS ACTUAL SOLIDS
   ============================================================================
   Eighteen models, built out of arithmetic and drawn by the same little
   software renderer nova-logo3d.js uses: vertices, one rotation, a perspective
   divide, a painter's sort and flat shading. There is no library here and
   nothing is downloaded, which is the same decision that file made and for the
   same reasons — a 3D engine from a CDN is 600KB to draw a star, and this repo
   does not load from CDNs.

   WHY PROCEDURAL AND NOT MODEL FILES

   A .glb of a crystal is a binary, and binaries cannot ship through the
   artifact this site is delivered by; they would need their own download page
   and somebody would have to remember to put them on the server. Geometry
   written as numbers is text, goes in the same file as everything else, weighs
   about 11KB, and can be recoloured per category without re-exporting anything.
   It is also the only version of this that still works offline.

   THE LADDER IS THE POINT

   Rarity runs 1 to 5 stars and the geometry runs with it: a one-star is a
   four-face tetrahedron, a five-star is the sixteen-ray nova with a lit core.
   Somebody who has one should be able to tell from across a room, at 30 pixels,
   without reading a number — which is what makes a cosmetic worth 5000
   NovaCoins and what "a bit like stars" has to mean to be worth buying.

   WHAT IS DELIBERATELY NOT HERE

   The eighteen free emoji avatars stay exactly as they are. They cost nothing
   to render, they already work everywhere an avatar appears — a comment, a
   leaderboard row, a notification — and replacing them would mean every one of
   those places needed a canvas. The solids are what you buy; the emoji are the
   floor, and the floor stays free.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_AV3D) return;

  /* ----------------------------------------------------------- mesh plumbing
     A mesh is { v: [[x,y,z]...], f: [[a,b,c,shade]...] }. `shade` is 0..1 and
     is what the two palette colours are mixed by, so a model can put its own
     gradient where it wants one rather than taking depth as a proxy for it. */
  function mesh() { return { v: [], f: [] }; }
  function vert(m, x, y, z) { m.v.push([x, y, z]); return m.v.length - 1; }
  function face(m, a, b, c, s) { m.f.push([a, b, c, s]); }
  /* Quads come out of every ring-shaped builder below, and every one of them
     wants the same two triangles. */
  function quad(m, a, b, c, d, s) { face(m, a, b, c, s); face(m, a, c, d, s); }

  function merge(a, b) {
    var off = a.v.length, i;
    for (i = 0; i < b.v.length; i++) a.v.push(b.v[i]);
    for (i = 0; i < b.f.length; i++) a.f.push([b.f[i][0] + off, b.f[i][1] + off, b.f[i][2] + off, b.f[i][3]]);
    return a;
  }
  /* Non-uniform scale, for the parts that are a primitive flattened in one
     axis: a fin is a cone squashed to a plate, a bowl is a cone squashed in
     height. Without it those have to be new primitives for no reason. */
  function squash(m, sx, sy, sz) {
    for (var i = 0; i < m.v.length; i++) {
      m.v[i][0] *= sx; m.v[i][1] *= sy; m.v[i][2] *= sz;
    }
    return m;
  }

  /* Rotate about Y. place() only turns about X, which is all most parts need —
     but anything arranged radially (the rocket's fins) has to face outward as
     well as stand in the right place, and without this all three fins came out
     as parallel plates. */
  function turn(m, ry) {
    var c = Math.cos(ry), si = Math.sin(ry);
    for (var i = 0; i < m.v.length; i++) {
      var p = m.v[i], x = p[0], z = p[2];
      p[0] = x * c + z * si; p[2] = -x * si + z * c;
    }
    return m;
  }

  /* Scale, then rotate about X, then shift. Enough to place every part of
     every model below; anything needing more than that is a model that wants
     to be two models. */
  function place(m, s, dx, dy, dz, rx) {
    var c = Math.cos(rx || 0), si = Math.sin(rx || 0);
    for (var i = 0; i < m.v.length; i++) {
      var p = m.v[i], x = p[0] * s, y = p[1] * s, z = p[2] * s;
      var y2 = y * c - z * si, z2 = y * si + z * c;
      p[0] = x + (dx || 0); p[1] = y2 + (dy || 0); p[2] = z2 + (dz || 0);
    }
    return m;
  }

  /* ------------------------------------------------------------- primitives */

  /* An N-pointed star, extruded. The same construction as the logo: tips at
     r=1, valleys at rIn, a front face, a back face and a wall between them. */
  function star(n, rIn, depth) {
    var m = mesh(), i, step = Math.PI / n;
    var cf = vert(m, 0, 0, depth), cb = vert(m, 0, 0, -depth);
    for (i = 0; i < n * 2; i++) {
      var a = i * step - Math.PI / 2, r = (i % 2 === 0) ? 1 : rIn;
      vert(m, Math.cos(a) * r, Math.sin(a) * r, depth);
      vert(m, Math.cos(a) * r, Math.sin(a) * r, -depth);
    }
    function F(i) { return 2 + ((i + n * 2) % (n * 2)) * 2; }
    function B(i) { return 3 + ((i + n * 2) % (n * 2)) * 2; }
    for (i = 0; i < n * 2; i++) {
      var s = i / (n * 2);
      face(m, cf, F(i), F(i + 1), s);
      face(m, cb, B(i + 1), B(i), s);
      quad(m, F(i), B(i), B(i + 1), F(i + 1), s * 0.8 + 0.1);
    }
    return m;
  }

  /* A UV sphere. Coarse on purpose — 12x8 is 192 triangles, reads as round at
     the sizes these are drawn, and keeps a grid of eighteen of them cheap. */
  function ball(seg, rings, r) {
    var m = mesh(), i, j;
    for (j = 0; j <= rings; j++) {
      var phi = Math.PI * j / rings;
      for (i = 0; i < seg; i++) {
        var th = 2 * Math.PI * i / seg;
        vert(m, r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
      }
    }
    for (j = 0; j < rings; j++) {
      for (i = 0; i < seg; i++) {
        var a = j * seg + i, b = j * seg + (i + 1) % seg;
        var c = (j + 1) * seg + (i + 1) % seg, d = (j + 1) * seg + i;
        quad(m, a, b, c, d, j / rings);
      }
    }
    return m;
  }

  function cone(seg, r, h, s0, s1) {
    var m = mesh(), i;
    var tip = vert(m, 0, h, 0), base = vert(m, 0, 0, 0);
    for (i = 0; i < seg; i++) {
      var a = 2 * Math.PI * i / seg;
      vert(m, Math.cos(a) * r, 0, Math.sin(a) * r);
    }
    for (i = 0; i < seg; i++) {
      var p = 2 + i, q = 2 + (i + 1) % seg;
      face(m, tip, p, q, s1 == null ? 0.9 : s1);
      face(m, base, q, p, s0 == null ? 0.2 : s0);
    }
    return m;
  }

  function tube(seg, r, h, s) {
    var m = mesh(), i;
    var top = vert(m, 0, h, 0), bot = vert(m, 0, 0, 0);
    for (i = 0; i < seg; i++) {
      var a = 2 * Math.PI * i / seg;
      vert(m, Math.cos(a) * r, h, Math.sin(a) * r);
      vert(m, Math.cos(a) * r, 0, Math.sin(a) * r);
    }
    for (i = 0; i < seg; i++) {
      var t0 = 2 + i * 2, b0 = 3 + i * 2;
      var t1 = 2 + ((i + 1) % seg) * 2, b1 = 3 + ((i + 1) % seg) * 2;
      quad(m, t0, t1, b1, b0, s == null ? 0.5 : s);
      face(m, top, t1, t0, 0.95);
      face(m, bot, b0, b1, 0.1);
    }
    return m;
  }

  /* A flat annulus — the ring round a planet, and the brim of the crown. */
  function annulus(seg, rIn, rOut, depth, s) {
    var m = mesh(), i;
    for (i = 0; i < seg; i++) {
      var a = 2 * Math.PI * i / seg, c = Math.cos(a), si = Math.sin(a);
      vert(m, c * rIn, depth, si * rIn); vert(m, c * rOut, depth, si * rOut);
      vert(m, c * rIn, -depth, si * rIn); vert(m, c * rOut, -depth, si * rOut);
    }
    for (i = 0; i < seg; i++) {
      var A = i * 4, B = ((i + 1) % seg) * 4;
      quad(m, A + 1, B + 1, B + 0, A + 0, s == null ? 0.7 : s);
      quad(m, A + 2, B + 2, B + 3, A + 3, s == null ? 0.7 : s);
      quad(m, A + 1, A + 3, B + 3, B + 1, 0.95);
      quad(m, A + 0, B + 0, B + 2, A + 2, 0.25);
    }
    return m;
  }

  /* Two cones base to base: a crystal, and the body of every gem here. */
  function spindle(seg, r, hTop, hBot) {
    var m = mesh(), i;
    var top = vert(m, 0, hTop, 0), bot = vert(m, 0, -hBot, 0);
    for (i = 0; i < seg; i++) {
      var a = 2 * Math.PI * i / seg;
      vert(m, Math.cos(a) * r, 0, Math.sin(a) * r);
    }
    for (i = 0; i < seg; i++) {
      var p = 2 + i, q = 2 + (i + 1) % seg;
      face(m, top, p, q, 0.85 - (i % 2) * 0.25);
      face(m, bot, q, p, 0.45 - (i % 2) * 0.25);
    }
    return m;
  }

  /* A brilliant cut: flat table on top, a crown of facets down to the girdle,
     then a pavilion to a point. The alternating shade per facet is what makes
     it read as cut stone rather than as a spinning top. */
  function gem(seg) {
    var m = mesh(), i;
    var tbl = [], gir = [], tip = vert(m, 0, -1.05, 0);
    for (i = 0; i < seg; i++) {
      var a = 2 * Math.PI * i / seg;
      tbl.push(vert(m, Math.cos(a) * 0.42, 0.52, Math.sin(a) * 0.42));
      gir.push(vert(m, Math.cos(a) * 0.95, 0.12, Math.sin(a) * 0.95));
    }
    var top = vert(m, 0, 0.52, 0);
    for (i = 0; i < seg; i++) {
      var j = (i + 1) % seg;
      face(m, top, tbl[i], tbl[j], 1);
      quad(m, tbl[i], gir[i], gir[j], tbl[j], 0.72 - (i % 2) * 0.22);
      face(m, tip, gir[j], gir[i], 0.3 + (i % 2) * 0.25);
    }
    return m;
  }

  /* The platonics, written out rather than generated: four shapes, one of
     which (the icosahedron) is quicker to read as twelve numbers than as the
     golden-ratio construction that produces them. */
  function platonic(kind) {
    var m = mesh(), i, P = 1.618033988749;
    if (kind === 'tetra') {
      var tv = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
      var tf = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]];
      for (i = 0; i < tv.length; i++) vert(m, tv[i][0] * 0.62, tv[i][1] * 0.62, tv[i][2] * 0.62);
      for (i = 0; i < tf.length; i++) face(m, tf[i][0], tf[i][1], tf[i][2], i / tf.length);
    } else if (kind === 'cube') {
      var cv = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
      var cf = [[0,3,2,1],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[0,4,7,3]];
      for (i = 0; i < cv.length; i++) vert(m, cv[i][0] * 0.58, cv[i][1] * 0.58, cv[i][2] * 0.58);
      for (i = 0; i < cf.length; i++) quad(m, cf[i][0], cf[i][1], cf[i][2], cf[i][3], i / cf.length);
    } else if (kind === 'octa') {
      var ov = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
      var of_ = [[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]];
      for (i = 0; i < ov.length; i++) vert(m, ov[i][0] * 0.92, ov[i][1] * 0.92, ov[i][2] * 0.92);
      for (i = 0; i < of_.length; i++) face(m, of_[i][0], of_[i][1], of_[i][2], i / of_.length);
    } else { /* icosa */
      var iv = [[-1,P,0],[1,P,0],[-1,-P,0],[1,-P,0],[0,-1,P],[0,1,P],[0,-1,-P],[0,1,-P],
                [P,0,-1],[P,0,1],[-P,0,-1],[-P,0,1]];
      var if_ = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],
                 [10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],
                 [2,4,11],[6,2,10],[8,6,7],[9,8,1]];
      for (i = 0; i < iv.length; i++) vert(m, iv[i][0] * 0.49, iv[i][1] * 0.49, iv[i][2] * 0.49);
      for (i = 0; i < if_.length; i++) face(m, if_[i][0], if_[i][1], if_[i][2], (i % 5) / 5);
    }
    return m;
  }

  /* ---------------------------------------------------------------- models
     Eighteen, in the order of the five rarity tiers. Each is a function so
     nothing is built until somebody actually looks at it. */
  var MODELS = {
    /* 1 star — one solid, four to twenty faces. */
    tetra:  function () { return platonic('tetra'); },
    cube:   function () { return platonic('cube'); },
    octa:   function () { return platonic('octa'); },
    star4:  function () { return star(4, 0.40, 0.13); },

    /* 2 stars — a solid with something done to it. */
    star5:  function () { return star(5, 0.45, 0.15); },
    crystal:function () { return place(spindle(6, 0.52, 1.0, 0.72), 1); },
    ring:   function () { return place(annulus(20, 0.52, 0.92, 0.10), 1, 0, 0, 0, 1.15); },
    crown:  function () {
      var m = tube(12, 0.62, 0.34, 0.55);
      for (var i = 0; i < 6; i++) {
        var a = 2 * Math.PI * i / 6;
        merge(m, place(cone(4, 0.14, 0.42), 1, Math.cos(a) * 0.52, 0.30, Math.sin(a) * 0.52));
      }
      return place(m, 1, 0, -0.32, 0);
    },

    /* 3 stars — two parts that read as an object rather than a shape. */
    icosa:  function () { return platonic('icosa'); },
    gem:    function () { return gem(10); },
    rocket: function () {
      var m = tube(12, 0.30, 0.76, 0.6);
      merge(m, place(cone(12, 0.30, 0.52), 1, 0, 0.76, 0));
      /* The fins were cones standing at radius 0.24 — inside a body of radius
         0.26, so they were buried in it and the rocket read as a crystal.
         Squashed flat and moved outboard they read as fins from any angle. */
      for (var i = 0; i < 3; i++) {
        var a = 2 * Math.PI * i / 3;
        /* Flattened to a plate, turned to face outward, then moved out to the
           hull. All three were parallel before, which is why none of them read
           as a fin from any angle. */
        var fin = turn(squash(cone(3, 0.34, 0.46), 1, 1, 0.10), -a);
        merge(m, place(fin, 1, Math.cos(a) * 0.26, -0.04, Math.sin(a) * 0.26));
      }
      return place(m, 1, 0, -0.62, 0);
    },
    saturn: function () {
      var m = ball(14, 9, 0.56);
      merge(m, place(annulus(22, 0.78, 1.14, 0.030), 1, 0, 0, 0, 0.34));
      return m;
    },

    /* 4 stars — bigger, and moving. */
    star8:  function () { return star(8, 0.42, 0.16); },
    comet:  function () {
      /* The first version put a short fat cone under a ball and read as an ice
         cream. A comet is a small bright head with a long thin tail BEHIND it,
         so the tail is now two and a half times the head's diameter, tapered,
         and the whole thing is tilted as if it were travelling. */
      var m = ball(12, 8, 0.30);
      var tail = squash(cone(10, 0.22, 1.30), 1, 1, 1);
      merge(m, place(tail, 1, 0, 0, 0, Math.PI));
      return place(m, 1, 0, 0.42, 0, -0.55);
    },
    shard:  function () {
      var m = spindle(5, 0.42, 1.05, 0.52);
      merge(m, place(spindle(5, 0.22, 0.52, 0.26), 1, 0.46, -0.10, 0.18));
      merge(m, place(spindle(5, 0.18, 0.42, 0.20), 1, -0.44, -0.18, -0.14));
      return m;
    },

    /* 5 stars — the nova itself, and the two things you put on a shelf. */
    nova:   function () { return star(8, 0.31, 0.12); },
    trophy: function () {
      /* A bowl, a stem and a plinth. The bowl is a cone turned over so it is
         wide at the top — the first version used a spindle, which is pointed at
         both ends and reads as a spinning top rather than as something you win. */
      var bowl = place(cone(14, 0.52, 0.52), 1, 0, 0.52, 0, Math.PI);
      var m = bowl;
      merge(m, place(tube(10, 0.10, 0.26, 0.45), 1, 0, -0.26, 0));
      merge(m, place(tube(14, 0.42, 0.14, 0.35), 1, 0, -0.44, 0));
      /* The two handles are what makes a cup a trophy at 40 pixels. */
      merge(m, place(squash(annulus(12, 0.10, 0.20, 0.035), 1, 1, 1), 1, -0.52, 0.26, 0, 1.5708));
      merge(m, place(squash(annulus(12, 0.10, 0.20, 0.035), 1, 1, 1), 1, 0.52, 0.26, 0, 1.5708));
      return place(m, 1, 0, 0.06, 0);
    },
    diamond:function () { return place(gem(14), 1.04); }
  };

  /* Built the first time one is drawn and kept — eighteen meshes is a few
     thousand numbers, and rebuilding one per frame would be the only expensive
     thing in this file. */
  var cache = {};
  function get(id) {
    if (!cache[id]) cache[id] = MODELS[id] ? MODELS[id]() : MODELS.cube();
    return cache[id];
  }

  /* ------------------------------------------------------------------ colour
     The category's two colours, exactly as nova-logo3d.js reads them, so an
     avatar is lit the same way the mark on the home page is. */
  var probe = null;
  function toRGB(v) {
    if (!v) return null;
    if (!probe) { probe = document.createElement('span'); probe.style.display = 'none'; document.body.appendChild(probe); }
    probe.style.color = ''; probe.style.color = v;
    var o = getComputedStyle(probe).color.match(/[\d.]+/g);
    return o ? [+o[0], +o[1], +o[2]] : null;
  }
  function palette() {
    var cs = getComputedStyle(document.documentElement);
    return [toRGB((cs.getPropertyValue('--nc-cat-a') || '').trim()) || [0, 229, 255],
            toRGB((cs.getPropertyValue('--nc-cat-b') || '').trim()) || [124, 92, 255]];
  }
  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  /* ------------------------------------------------------------------ render
     One function, called both by the animation loop and by the sprite baker.
     `ry` is the only thing that changes between frames. */
  function render(ctx, w, h, id, ry, cols) {
    var m = get(id), i;
    ctx.clearRect(0, 0, w, h);
    var rx = -0.32, cx = Math.cos(rx), sx = Math.sin(rx);
    var cy = Math.cos(ry), sy = Math.sin(ry);
    var d = 3.4, s = Math.min(w, h) * 0.40;
    var pts = new Array(m.v.length);
    for (i = 0; i < m.v.length; i++) {
      var p = m.v[i];
      var y1 = p[1] * cx - p[2] * sx, z1 = p[1] * sx + p[2] * cx;
      var x2 = p[0] * cy + z1 * sy, z2 = -p[0] * sy + z1 * cy;
      var k = d / (d + z2);
      pts[i] = [w / 2 + x2 * s * k, h / 2 - y1 * s * k, z2];
    }
    var order = [];
    for (i = 0; i < m.f.length; i++) {
      var f = m.f[i], A = pts[f[0]], B = pts[f[1]], C = pts[f[2]];
      order.push([(A[2] + B[2] + C[2]) / 3, A, B, C, f[3]]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    for (i = 0; i < order.length; i++) {
      var o = order[i], a = o[1], b = o[2], c = o[3];
      /* Back-face culling by winding in screen space — the same two lines the
         logo uses, and the reason a painter's sort is enough for solids. */
      if ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) >= 0) continue;
      var lit = 0.52 + 0.62 * Math.max(0, Math.min(1, (o[0] + 1.3) / 2.6));
      var col = mix(cols[0], cols[1], o[4]);
      ctx.fillStyle = 'rgb(' + (col[0] * lit | 0) + ',' + (col[1] * lit | 0) + ',' + (col[2] * lit | 0) + ')';
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]);
      ctx.closePath(); ctx.fill();
    }
  }

  /* ------------------------------------------------------------------- API */

  /* A still, as a data URL, cached per id+size+palette. This is what every
     place that shows an avatar as a small image uses — a rail card, a
     leaderboard row — so those do not each need a live canvas. */
  var sprites = {};
  function sprite(id, px) {
    var cols = palette();
    var key = id + '@' + px + '#' + cols[0].join(',') + cols[1].join(',');
    if (sprites[key]) return sprites[key];
    var cv = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = px * dpr; cv.height = px * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(ctx, px, px, id, -0.6, cols);
    var url = cv.toDataURL('image/png');
    sprites[key] = url;
    return url;
  }

  /* A live canvas that turns. Used for the one avatar being previewed, never
     for a grid of them: eighteen animated canvases is eighteen times the work
     for a picker most people look at for four seconds. Returns a stop(). */
  function spin(canvas, id, speed) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, r.width || canvas.width), h = Math.max(1, r.height || canvas.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = palette(), ry = -0.6, raf = 0, stopped = false;
    var still = false;
    try { still = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    function frame() {
      if (stopped) return;
      render(ctx, w, h, id, ry, cols);
      if (still) return;                       /* one frame, then leave it be */
      ry += (speed == null ? 0.011 : speed);
      raf = requestAnimationFrame(frame);
    }
    frame();
    return function stop() { stopped = true; if (raf) cancelAnimationFrame(raf); };
  }

  window.NC_AV3D = {
    ids: Object.keys(MODELS),
    has: function (id) { return !!MODELS[id]; },
    sprite: sprite,
    spin: spin,
    /* The palette changes with the category, so the bakes have to go. */
    forget: function () { sprites = {}; }
  };
  addEventListener('nc-category', function () { sprites = {}; });
})();
