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
  /* A face is [a, b, c, shade, material]. material 0 means "mix the two
     palette colours by shade", which is everything the solids used. 1 is ink
     and 2 is near-white — without those two a character has no eyes, and a
     character with no eyes is a lump. */
  function face(m, a, b, c, s, mat) { m.f.push([a, b, c, s, mat || 0]); }
  /* Quads come out of every ring-shaped builder below, and every one of them
     wants the same two triangles. */
  function quad(m, a, b, c, d, s, mat) { face(m, a, b, c, s, mat); face(m, a, c, d, s, mat); }

  function merge(a, b) {
    var off = a.v.length, i;
    for (i = 0; i < b.v.length; i++) a.v.push(b.v[i]);
    for (i = 0; i < b.f.length; i++) a.f.push([b.f[i][0] + off, b.f[i][1] + off, b.f[i][2] + off, b.f[i][3], b.f[i][4] || 0]);
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

  /* Repaint every face of a part. Used for the eyes and the white of a helmet
     visor, which are whole small meshes rather than individual faces. */
  function mat(m, k) { for (var i = 0; i < m.f.length; i++) m.f[i][4] = k; return m; }

  /* Shift every face's position in the gradient. The values are centred on
     zero, NOT all positive: the first version only ever added, so every
     character came out somewhere between "slightly purple" and "very purple"
     and the palette's other colour was never used. Negative goes the other
     way, which is what actually makes eighteen of them tell apart. Eighteen characters built from
     one body were eighteen of the same character wearing hats — this is what
     makes them read as different people before you have looked at the hat. The
     eyes and the visor are skipped: they are fixed materials and a tinted eye
     is a bruise. */
  function tint(m, d) {
    for (var i = 0; i < m.f.length; i++) {
      if (m.f[i][4]) continue;
      m.f[i][3] = Math.max(0, Math.min(1, m.f[i][3] + d));
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

  /* ------------------------------------------------------------ characters
     Little round people, in the Stumble Guys shape: a head that is nearly as
     big as the body, a stubby torso, two arm blobs and two feet. That shape is
     chosen rather than copied — it is the one that still reads as a person at
     40 pixels, which is the size these are mostly seen at, and it gives every
     variant a face to hang an expression on.

     One builder makes all eighteen. Each gets ONE distinguishing feature,
     because at 40px two is mud: a cap, a horn, ears, a crown, wings, a halo.
     The feature is what the rarity ladder is made of, so the five-star ones
     carry the things worth 5000 NovaCoins and the one-stars are plain. */

  function guy(opt) {
    opt = opt || {};
    var m = mesh();
    /* Every proportion is an option, and each character sets several of them.
       Build is as much of the difference as the hat: a tall thin one and a
       squat wide one are two characters even before either puts anything on. */
    var headR = opt.headR || 0.43;
    var bodyR = opt.bodyR || 0.40;
    var bodyW = opt.bodyW || 1.06;
    var headY = (opt.headY == null ? 0.34 : opt.headY);
    var limb  = opt.limb  || 1.0;
    var armX  = 0.45 * bodyW / 1.06;

    merge(m, place(squash(ball(12, 8, bodyR), bodyW, opt.bodyH || 1.02, 0.96), 1, 0, -0.32, 0));
    var footY = -0.32 - bodyR * 0.95;
    merge(m, place(squash(ball(8, 5, 0.15 * limb), 1.15, 0.8, 1.3), 1, -0.19, footY, 0.02));
    merge(m, place(squash(ball(8, 5, 0.15 * limb), 1.15, 0.8, 1.3), 1, 0.19, footY, 0.02));
    merge(m, place(squash(ball(8, 5, 0.135 * limb), 0.85, 1.3, 0.85), 1, -armX, -0.28, 0.02));
    merge(m, place(squash(ball(8, 5, 0.135 * limb), 0.85, 1.3, 0.85), 1, armX, -0.28, 0.02));

    /* head */
    if (opt.head === 'cube') {
      merge(m, place(platonic('cube'), headR * 1.12, 0, headY, 0));
    } else {
      merge(m, place(squash(ball(14, 10, headR), 1.0, 0.94, 1.0), 1, 0, headY, 0));
    }

    /* eyes — two dark beads and two white glints.
       NEGATIVE z, and that is the whole story of why there were no faces here
       for several passes. project() divides by (d + z2), so a LARGER z is a
       SMALLER figure: +z is away from the camera, not towards it. Every
       face-side part was therefore being built on the back of the head —
       rookie's eyes were inside its own skull and only leaked a few pixels at
       the silhouette, and blocky's sat neatly behind an opaque cube. Anything
       meant to face the reader goes to -z; anything behind them, +z. */
    var cube = opt.head === 'cube';
    var ez = -(cube ? headR * 1.02 : headR * 0.80);
    var ex = headR * (cube ? 0.26 : 0.34), ey = headY + headR * 0.10;
    var er = 0.085 * (opt.eye || 1);
    merge(m, place(mat(ball(7, 5, er), 1), 1, -ex, ey, ez));
    merge(m, place(mat(ball(7, 5, er), 1), 1, ex, ey, ez));
    merge(m, place(mat(ball(6, 4, 0.034), 2), 1, -ex + 0.03, ey + 0.035, ez - 0.055));
    merge(m, place(mat(ball(6, 4, 0.034), 2), 1, ex + 0.03, ey + 0.035, ez - 0.055));

    var top = headY + headR * 0.92, f = opt.feature;

    if (f === 'cap') {
      merge(m, place(squash(ball(12, 6, headR * 0.98), 1, 0.5, 1), 1, 0, top - 0.10, 0));
      merge(m, place(squash(ball(10, 4, headR * 0.52), 1, 0.28, 1.5), 1, 0, top - 0.16, -headR * 0.72));
    } else if (f === 'horn') {
      merge(m, place(cone(7, 0.11, 0.30), 1, 0, top - 0.04, 0));
    } else if (f === 'horns') {
      merge(m, place(cone(6, 0.09, 0.26), 1, -0.26, top - 0.12, 0, 0.42));
      merge(m, place(cone(6, 0.09, 0.26), 1, 0.26, top - 0.12, 0, -0.42));
    } else if (f === 'ears') {
      merge(m, place(squash(ball(9, 6, 0.19), 0.55, 1.15, 0.9), 1, -headR * 1.00, headY + 0.13, 0));
      merge(m, place(squash(ball(9, 6, 0.19), 0.55, 1.15, 0.9), 1, headR * 1.00, headY + 0.13, 0));
    } else if (f === 'antenna') {
      merge(m, place(tube(5, 0.022, 0.26), 1, 0, top - 0.06, 0));
      merge(m, place(ball(8, 6, 0.085), 1, 0, top + 0.22, 0));
    } else if (f === 'halo') {
      /* Tilted towards the camera. Flat, it is seen at the camera's own 18
         degrees and draws as a bar — which reads as a stick balanced on the
         head rather than as a halo. */
      merge(m, place(annulus(20, 0.24, 0.345, 0.028), 1, 0, top + 0.16, -0.02, 0.62));
    } else if (f === 'crown') {
      merge(m, place(tube(10, headR * 0.62, 0.11), 1, 0, top - 0.07, 0));
      for (var i = 0; i < 5; i++) {
        var ang = 2 * Math.PI * i / 5;
        merge(m, place(cone(4, 0.055, 0.16), 1,
                       Math.cos(ang) * headR * 0.52, top + 0.04, Math.sin(ang) * headR * 0.52));
      }
    } else if (f === 'helmet') {
      merge(m, place(squash(ball(14, 8, headR * 1.08), 1, 0.74, 1), 1, 0, headY + 0.07, 0));
      merge(m, place(mat(squash(ball(12, 5, headR * 0.80), 1, 0.42, 0.55), 2), 1, 0, headY + 0.02, -headR * 0.62));
    } else if (f === 'wings') {
      merge(m, place(turn(squash(cone(3, 0.30, 0.42), 1, 1, 0.09), 1.35), 1, -0.34, -0.22, 0.26));
      merge(m, place(turn(squash(cone(3, 0.30, 0.42), 1, 1, 0.09), -1.35), 1, 0.34, -0.22, 0.26));
    } else if (f === 'cape') {
      merge(m, place(squash(cone(5, 0.40, 0.72), 1, 1, 0.22), 1, 0, -0.66, 0.26, Math.PI));
    } else if (f === 'star') {
      merge(m, place(star(5, 0.42, 0.05), 0.30, 0, top + 0.16, 0.02));
    } else if (f === 'nova') {
      merge(m, place(star(8, 0.31, 0.05), 0.36, 0, top + 0.18, 0.02));
      merge(m, place(annulus(18, 0.22, 0.31, 0.022), 1, 0, top + 0.02, 0, 1.3));
    } else if (f === 'trophy') {
      merge(m, place(cone(10, 0.23, 0.27), 1, 0.56, 0.16, -0.16, Math.PI));
      merge(m, place(tube(8, 0.045, 0.13), 1, 0.56, 0.01, -0.16));
      merge(m, place(tube(10, 0.17, 0.06), 1, 0.56, -0.07, -0.16));
    } else if (f === 'bolt') {
      merge(m, place(star(4, 0.24, 0.05), 0.26, 0, top + 0.13, 0.02));
    } else if (f === 'gem') {
      merge(m, place(gem(8), 0.27, 0, top + 0.16, 0.02));
    } else if (f === 'ring') {
      merge(m, place(annulus(16, 0.11, 0.17, 0.03), 1, -headR * 0.95, headY + 0.04, 0, 1.5708));
    }
    if (opt.tone) tint(m, opt.tone);
    return m;
  }

  var MODELS = {
    /* 1 star — four builds, no decoration beyond the head */
    rookie:  function () { return guy({ tone: -0.38 }); },
    blocky:  function () { return guy({ head: 'cube', bodyW: 1.22, bodyR: 0.42, tone: -0.08 }); },
    capper:  function () { return guy({ feature: 'cap', headR: 0.38, bodyH: 1.30, bodyR: 0.36,
                                        headY: 0.40, tone: +0.17 }); },
    horned:  function () { return guy({ feature: 'horn', headR: 0.36, bodyR: 0.33, bodyW: 0.92,
                                        limb: 0.85, headY: 0.36, tone: +0.42 }); },

    /* 2 stars */
    eared:   function () { return guy({ feature: 'ears', headR: 0.50, bodyR: 0.33, headY: 0.38,
                                        eye: 1.15, tone: -0.23 }); },
    antenna: function () { return guy({ feature: 'antenna', headR: 0.37, bodyH: 1.34, bodyR: 0.34,
                                        bodyW: 0.90, headY: 0.42, limb: 0.8, tone: +0.07 }); },
    hooper:  function () { return guy({ feature: 'ring', bodyW: 1.26, bodyR: 0.43, headR: 0.41,
                                        tone: +0.30 }); },
    sparky:  function () { return guy({ feature: 'bolt', headR: 0.36, bodyW: 1.18, bodyR: 0.41,
                                        eye: 0.85, tone: +0.52 }); },

    /* 3 stars */
    astro:   function () { return guy({ feature: 'helmet', headR: 0.44, bodyR: 0.38, tone: -0.28 }); },
    winger:  function () { return guy({ feature: 'wings', headR: 0.39, bodyH: 1.26, bodyR: 0.35,
                                        limb: 0.9, headY: 0.39, tone: +0.00 }); },
    jewel:   function () { return guy({ feature: 'gem', bodyW: 1.20, bodyR: 0.42, headR: 0.42,
                                        eye: 1.1, tone: +0.24 }); },
    devil:   function () { return guy({ feature: 'horns', headR: 0.40, bodyH: 1.22, bodyR: 0.36,
                                        eye: 0.9, tone: +0.47 }); },

    /* 4 stars */
    caped:   function () { return guy({ feature: 'cape', bodyR: 0.45, bodyW: 1.14, headR: 0.44,
                                        tone: -0.16 }); },
    starlet: function () { return guy({ feature: 'star', headR: 0.49, bodyR: 0.32, headY: 0.40,
                                        eye: 1.2, limb: 0.85, tone: +0.12 }); },
    haloed:  function () { return guy({ feature: 'halo', headR: 0.38, bodyH: 1.30, bodyR: 0.34,
                                        bodyW: 0.94, headY: 0.41, tone: +0.34 }); },

    /* 5 stars */
    king:    function () { return guy({ feature: 'crown', bodyW: 1.24, bodyR: 0.44, headR: 0.45,
                                        tone: -0.33 }); },
    champ:   function () { return guy({ feature: 'trophy', bodyR: 0.42, headR: 0.42, limb: 1.1,
                                        tone: +0.04 }); },
    nova:    function () { return guy({ feature: 'nova', headR: 0.47, bodyR: 0.38, headY: 0.37,
                                        eye: 1.1, tone: +0.57 }); }
  };

  /* Built the first time one is drawn and kept — eighteen meshes is a few
     thousand numbers, and rebuilding one per frame would be the only expensive
     thing in this file. */
  var cache = {};
  function get(id) {
    if (!cache[id]) {
      var m = MODELS[id] ? MODELS[id]() : MODELS.cube();
      /* Its own size, measured once and kept with it. The eighteen are not one
         size: a rocket with fins and a king with a crown are much taller than a
         cube with ears, and 'nova' is taller again. Anything drawing one big
         enough to see — the hero does — has to scale and centre per model or
         the tall ones come out with their heads cut off, which is exactly what
         the first version of the hero did. */
      var i, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (i = 0; i < m.v.length; i++) {
        for (var a = 0; a < 3; a++) {
          if (m.v[i][a] < lo[a]) lo[a] = m.v[i][a];
          if (m.v[i][a] > hi[a]) hi[a] = m.v[i][a];
        }
      }
      m.mid = (lo[1] + hi[1]) / 2;
      /* The half-size that has to fit: the taller of its height and width, so
         a wide model is not pushed off the sides to make a tall one fit. */
      m.half = Math.max((hi[1] - lo[1]) / 2, (hi[0] - lo[0]) / 2, 0.1);
      cache[id] = m;
    }
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
  function render(ctx, w, h, id, ry, cols, rx, zoom) {
    var m = get(id), i;
    ctx.clearRect(0, 0, w, h);
    /* rx and zoom are optional and exist for one caller: the hero on the home
       page, which draws the chosen character where the turning logo used to be
       and lets a reader drag it. Everywhere else takes the fixed three-quarter
       view the picker and the rail cards use. */
    if (rx == null) rx = -0.32;
    var cx = Math.cos(rx), sx = Math.sin(rx);
    var cy = Math.cos(ry), sy = Math.sin(ry);
    var d = 3.4, s, off = 0;
    if (zoom === 'fit' || (zoom && zoom.fit)) {
      /* As large as it goes with a margin, centred on its own middle rather
         than on the origin. 0.44 of the shorter side leaves about an eighth of
         the box as air, which is what stops a crown or a rocket fin touching
         the edge as it turns. {fit: k} asks for k of that — the hero uses it to
         leave the headline alone. */
      s = Math.min(w, h) * 0.44 * (zoom.fit || 1) / m.half;
      off = m.mid;
    } else {
      s = Math.min(w, h) * 0.40 * (zoom || 1);
    }
    var pts = new Array(m.v.length);
    for (i = 0; i < m.v.length; i++) {
      var p = m.v[i];
      var y1 = (p[1] - off) * cx - p[2] * sx, z1 = (p[1] - off) * sx + p[2] * cx;
      var x2 = p[0] * cy + z1 * sy, z2 = -p[0] * sy + z1 * cy;
      var k = d / (d + z2);
      pts[i] = [w / 2 + x2 * s * k, h / 2 - y1 * s * k, z2];
    }
    var order = [];
    for (i = 0; i < m.f.length; i++) {
      var f = m.f[i], A = pts[f[0]], B = pts[f[1]], C = pts[f[2]];
      order.push([(A[2] + B[2] + C[2]) / 3, A, B, C, f[3], f[4] || 0]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    for (i = 0; i < order.length; i++) {
      var o = order[i], a = o[1], b = o[2], c = o[3];
      /* Back-face culling by winding in screen space — the same two lines the
         logo uses, and the reason a painter's sort is enough for solids. */
      if ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) >= 0) continue;
      var lit = 0.52 + 0.62 * Math.max(0, Math.min(1, (o[0] + 1.3) / 2.6));
      var col = o[5] === 1 ? [26, 24, 38] : o[5] === 2 ? [246, 248, 255]
                                           : mix(cols[0], cols[1], o[4]);
      ctx.fillStyle = 'rgb(' + (col[0] * lit | 0) + ',' + (col[1] * lit | 0) + ',' + (col[2] * lit | 0) + ')';
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]);
      ctx.closePath();
      ctx.fill();
      /* AND STROKE IT, in the same colour. Canvas antialiases every path on its
         own, so two triangles sharing an edge each cover about half that edge's
         pixels and the background shows through the middle. On a sphere that is
         a visible wireframe over the whole head — it looked like a rendering
         fault, and at 40px it looked like noise. */
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ------------------------------------------------------------------- API */

  /* A still, as a data URL, cached per id+size+palette. This is what every
     place that shows an avatar as a small image uses — a rail card, a
     leaderboard row — so those do not each need a live canvas. */
  var sprites = {};
  var drawCols = null;        /* the live-draw palette, see draw() below */
  function sprite(id, px) {
    var cols = palette();
    var key = id + '@' + px + '#' + cols[0].join(',') + cols[1].join(',');
    if (sprites[key]) return sprites[key];
    var cv = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = px * dpr; cv.height = px * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(ctx, px, px, id, -0.34, cols);
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
    var cols = palette(), ry = -0.34, raf = 0, stopped = false;
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
    /* One frame into a canvas somebody else owns the loop for. nova-logo3d.js
       already has a loop, a drag, a pause-when-hidden and a resize — handing it
       a frame is far less code than giving the hero a second renderer, and it
       means the character answers a drag exactly as the logo did. */
    draw: function (ctx, w, h, id, ry, rx, zoom) {
      /* The palette is cached across frames on purpose. palette() reads a
         custom property off <html> through getComputedStyle and a probe
         element, which forces a style recalculation — once is nothing, sixty
         times a second behind a hero is a frame budget spent on two colours
         that change when the category does and never otherwise. Cleared by the
         nc-category listener at the foot of this file. */
      if (!drawCols) drawCols = palette();
      render(ctx, w, h, id, ry, drawCols, rx, zoom);
    },
    /* The palette changes with the category, so the bakes have to go. */
    forget: function () { sprites = {}; }
  };
  addEventListener('nc-category', function () { sprites = {}; drawCols = null; });
})();
