/* THE NOVACLIP MARK, IN THREE DIMENSIONS.
 * ======================================
 * The hero used to carry a rotating globe with satellite tiles fetched over
 * the network. This replaces it with the site's own logo, extruded and turning.
 *
 * WHY THE SWAP IS AN IMPROVEMENT AND NOT JUST A DIFFERENT PICTURE
 *
 *   - The globe was a map of the Earth on the front page of a video editor for
 *     teenagers. It was beautiful and it said nothing about the product.
 *   - It needed a TILE KEY IN THE PAGE. A MapTiler key shipped in index.html,
 *     public by necessity — the browser is what fetches the tiles. Removing
 *     the globe removes the key from this repo entirely, which is the outcome
 *     the standing rule about keys actually wants.
 *   - It fetched tiles, an aerial video and a geolocation permission on the
 *     first paint of the first page. This fetches nothing, ever.
 *   - It could not follow the category vibe. This is drawn from the same two
 *     colours the rest of the site is now lit with, so the front page is the
 *     first place a reader sees their own choice.
 *
 * THE GEOMETRY IS THE REAL LOGO, NOT AN IMPRESSION OF IT
 *
 * logo.svg is a starburst: sixteen rays from a core, alternating long and
 * short, with a wedge cut out on the right and five small stars still
 * travelling outwards. The numbers below are read off that file — outer radius
 * 30.5 and 20 in its 64-unit box, valleys and core at 9.5 — so the two cannot
 * drift into being different marks.
 *
 * NO LIBRARY. Nothing here needs one: it is 100 vertices, a rotation matrix,
 * a dot product for the lighting and a painter's-algorithm sort. A 3D engine
 * from a CDN would be 600KB to draw a star, and this repo does not load from
 * CDNs anyway.
 */
(function () {
  'use strict';
  if (window.NC_LOGO3D) return;
  if (location.search.indexOf('embed=1') !== -1) return;

  /* ---------------------------------------------------------------- geometry
     Straight from logo.svg's 64-unit box, normalised so the mark is 1.0 across
     its longest ray. RAYS is 16 because the logo has 16; alternating LONG and
     SHORT is what gives it the sparkle rather than a cog. */
  var RAYS = 16;
  var R_LONG = 30.5 / 30.5;         /* 1.00 — the long rays reach the edge */
  var R_SHORT = 20.0 / 30.5;        /* 0.66 */
  var R_VALLEY = 9.5 / 30.5;        /* 0.31 — where the rays meet the core */
  var DEPTH = 0.14;                 /* half-thickness of the extrusion */

  /* The wedge logo.svg masks out of the right-hand side — the "clip" in
     NovaClip. Expressed as the ray indices whose front and back faces are not
     drawn, so the notch turns with the mark instead of being a hole painted
     on the front. */
  var NOTCH = { from: 15.4, to: 0.6 };

  function inNotch(i) {
    var a = i % RAYS;
    return NOTCH.from > NOTCH.to ? (a >= NOTCH.from || a <= NOTCH.to)
                                 : (a >= NOTCH.from && a <= NOTCH.to);
  }

  /* Build once. Every frame after this is arithmetic on these arrays. */
  var verts = [], tris = [];

  (function build() {
    var i, ang, r, step = Math.PI * 2 / RAYS;

    /* 0 and 1: the two face centres. */
    verts.push([0, 0, DEPTH]);
    verts.push([0, 0, -DEPTH]);

    /* Then, per ray: the tip, and the valley that follows it. Front and back
       copies of each, so the sides can be quads between them. */
    for (i = 0; i < RAYS; i++) {
      ang = i * step - Math.PI / 2;
      r = (i % 2 === 0) ? R_LONG : R_SHORT;
      verts.push([Math.cos(ang) * r, Math.sin(ang) * r, DEPTH]);          /* tip  front */
      verts.push([Math.cos(ang) * r, Math.sin(ang) * r, -DEPTH]);         /* tip  back  */
      ang += step / 2;
      verts.push([Math.cos(ang) * R_VALLEY, Math.sin(ang) * R_VALLEY, DEPTH]);
      verts.push([Math.cos(ang) * R_VALLEY, Math.sin(ang) * R_VALLEY, -DEPTH]);
    }

    function tipF(i) { return 2 + (i % RAYS) * 4; }
    function tipB(i) { return 3 + (i % RAYS) * 4; }
    function valF(i) { return 4 + (i % RAYS) * 4; }
    function valB(i) { return 5 + (i % RAYS) * 4; }

    for (i = 0; i < RAYS; i++) {
      var skip = inNotch(i);
      /* FACES. Two triangles per ray on each side: centre→valley→tip and
         centre→tip→previous valley. `t` runs 0..1 around the mark and is what
         the colour is mixed by, so the gradient wraps the way logo.svg's does
         rather than being flat. */
      var t = i / RAYS;
      if (!skip) {
        tris.push({ v: [0, valF(i - 1), tipF(i)], t: t, face: 1 });
        tris.push({ v: [0, tipF(i), valF(i)], t: t, face: 1 });
        tris.push({ v: [1, tipB(i), valB(i - 1)], t: t, face: -1 });
        tris.push({ v: [1, valB(i), tipB(i)], t: t, face: -1 });
      }
      /* SIDES. Always drawn, notch or not — the notch is a slice taken out of
         a solid, so its walls are exactly what should be visible through it. */
      tris.push({ v: [valF(i - 1), valB(i - 1), tipB(i)], t: t, face: 0 });
      tris.push({ v: [valF(i - 1), tipB(i), tipF(i)], t: t, face: 0 });
      tris.push({ v: [tipF(i), tipB(i), valB(i)], t: t, face: 0 });
      tris.push({ v: [tipF(i), valB(i), valF(i)], t: t, face: 0 });
    }
  })();

  /* The five small stars logo.svg has travelling outwards, given orbits.
     Positions are the SVG's own, converted out of its 64-unit box. */
  var SPARKS = [
    { p: [(57.1 - 32) / 30.5, (43.2 - 32) / 30.5, 0.35], s: 0.034 },
    { p: [(23.5 - 32) / 30.5, (59.7 - 32) / 30.5, -0.30], s: 0.027 },
    { p: [(6.1 - 32) / 30.5, (37.5 - 32) / 30.5, 0.28], s: 0.031 },
    { p: [(23.7 - 32) / 30.5, (4.7 - 32) / 30.5, -0.34], s: 0.028 },
    { p: [(49.4 - 32) / 30.5, (12.7 - 32) / 30.5, 0.31], s: 0.023 }
  ];

  /* ------------------------------------------------------------------ colour
     The two the category is lit with, read from the variables ncCategoryVibe()
     publishes. Falling back to the logo's own cyan and pink when no category
     is set, which is exactly what logo.svg uses. */
  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var a = (cs.getPropertyValue('--nc-cat-a') || '').trim();
    var b = (cs.getPropertyValue('--nc-cat-b') || '').trim();
    return [toRGB(a) || [0, 240, 255], toRGB(b) || [255, 46, 151]];
  }

  /* Any colour the palette might hold, resolved to three numbers. hsl() is in
     there because a written-in category's colours are generated as hsl, and
     `#` values because the presets are hex — so both have to be understood
     rather than one of them silently failing to a fallback. */
  var probe = null;
  function toRGB(v) {
    if (!v) return null;
    if (!probe) { probe = document.createElement('span'); probe.style.display = 'none'; document.body.appendChild(probe); }
    probe.style.color = '';
    probe.style.color = v;
    var out = getComputedStyle(probe).color.match(/[\d.]+/g);
    if (!out || out.length < 3) return null;
    return [+out[0], +out[1], +out[2]];
  }

  function mix(c1, c2, t) {
    return [c1[0] + (c2[0] - c1[0]) * t,
            c1[1] + (c2[1] - c1[1]) * t,
            c1[2] + (c2[2] - c1[2]) * t];
  }
  function css(c, l, alpha) {
    return 'rgba(' + Math.round(Math.min(255, c[0] * l)) + ',' +
                     Math.round(Math.min(255, c[1] * l)) + ',' +
                     Math.round(Math.min(255, c[2] * l)) + ',' + alpha + ')';
  }

  /* ------------------------------------------------------------------- state */
  var host, layer, cv, ctx, W = 0, H = 0, DPR = 1;
  var rotY = -0.5, rotX = -0.25, spin = 0.0045, drag = null, vel = 0;
  var COLS = null, raf = 0, visible = true;
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function style() {
    if (document.getElementById('nclogo3d-css')) return;
    var st = document.createElement('style');
    st.id = 'nclogo3d-css';
    st.textContent = [
      /* Same footprint the globe had: the right-hand half of the hero, behind
         the headline, and pointer-events:none so the hero's own buttons keep
         working. The drag is listened for on the window instead. */
      '#nclogo3d{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
      /* Sized off the headline, not off the hero. At 86% it reached back under
         "channel" and "game." and the two fought; 56% puts the whole mark in
         the right-hand third, which is the space the globe used to occupy
         before it was allowed to grow. */
      '#nclogo3d canvas{position:absolute;right:-3%;top:50%;transform:translateY(-50%);' +
        'width:min(56%,540px);aspect-ratio:1;display:block}',
      '@media (max-width:900px){#nclogo3d canvas{right:-14%;width:min(86%,430px);opacity:.42}}',
      '@media (max-width:600px){#nclogo3d canvas{opacity:.26}}',
      /* The halo logo.svg draws behind the mark, kept — it is most of what
         makes it read as light rather than as a shape. */
      '#nclogo3d .halo{position:absolute;right:-3%;top:50%;transform:translateY(-50%);' +
        'width:min(56%,540px);aspect-ratio:1;border-radius:50%;pointer-events:none;' +
        'background:radial-gradient(circle,var(--nc-cat-a,#7C5CFF) 0%,transparent 62%);' +
        'opacity:.16;filter:blur(24px)}',
      'html[data-theme="light"] #nclogo3d .halo{opacity:.13}',
      '@media (max-width:900px){#nclogo3d .halo{right:-14%;width:min(86%,430px);opacity:.10}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function resize() {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* Rotate a point by X then Y, and project it. A single perspective divide
     is all the camera this needs. */
  function project(p) {
    var cx = Math.cos(rotX), sx = Math.sin(rotX);
    var y1 = p[1] * cx - p[2] * sx;
    var z1 = p[1] * sx + p[2] * cx;
    var cy = Math.cos(rotY), sy = Math.sin(rotY);
    var x2 = p[0] * cy + z1 * sy;
    var z2 = -p[0] * sy + z1 * cy;
    var d = 3.2;
    var k = d / (d + z2);
    var s = Math.min(W, H) * 0.40;
    return [W / 2 + x2 * s * k, H / 2 + y1 * s * k, z2];
  }

  /* ------------------------------------------------------- the chosen avatar
     Asked for: when a character has been bought and is being worn, the hero
     shows THAT turning, not the mark. It is the same arrangement the floating
     collection uses — avatar3d.js owns the geometry, this file owns the loop,
     the drag and the pausing — so there is one renderer for characters on the
     site and one place that decides when the hero is spinning at all.

     Falls back to the mark whenever there is no character to draw: nothing
     bought, a photograph or an emoji chosen instead, or avatar3d.js not landed
     yet (it is side-loaded by nova.js, so on a cold load the first few frames
     here are always the logo). */
  var avId = '', avFresh = false;
  function heroAvatar() {
    /* Cached, because this is read once a frame and the answer is a
       localStorage lookup — which is synchronous, and at 60fps on a phone that
       is 60 of them a second for a value that changes about twice a year. The
       two events below are the only things that can change it. */
    if (avFresh) return avId;
    avFresh = true;
    avId = '';
    try {
      if (!window.NC_AV3D || !NC_AV3D.draw || !NC_AV3D.has) { avFresh = false; return ''; }
      var v = window.ncAvatarRaw ? ncAvatarRaw() : '';
      if (NC_AV3D.has(v)) avId = v;
    } catch (e) {}
    return avId;
  }
  function avChanged() {
    avFresh = false;
    /* Drawn at once rather than waiting for the next frame, because under
       prefers-reduced-motion there is no next frame. */
    draw();
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!COLS) COLS = palette();

    var av = heroAvatar();
    if (av) {
      /* 'fit', not a number. The first version asked for 1.5 and the astronaut
         came out with its head through the top of the box and its boots cut
         off — the eighteen characters are not one size, and a fixed multiplier
         can only be right for one of them. avatar3d.js measures each model and
         fills the box with a margin. */
      /* 0.8 of what would fit, and the fifth of the box that gives back is
         not decoration: the mark is a sparse star that the headline can run
         past, and a character is solid. At a full fit the astronaut's shoulder
         was level with the end of the word "channel". */
      NC_AV3D.draw(ctx, W, H, av, rotY, rotX, { fit: 0.8 });
      sparks();                       /* the five travelling stars stay */
      return;
    }

    var i, j, pts = new Array(verts.length);
    for (i = 0; i < verts.length; i++) pts[i] = project(verts[i]);

    /* Painter's algorithm. A z-buffer would be the correct answer for a
       general scene; for one convex-ish solid of 100 triangles, sorting by
       average depth is right often enough that nothing visibly pops, and it
       is two lines instead of a buffer per frame. */
    var order = [];
    for (i = 0; i < tris.length; i++) {
      var t = tris[i], a = pts[t.v[0]], b = pts[t.v[1]], c = pts[t.v[2]];
      order.push({ t: t, z: (a[2] + b[2] + c[2]) / 3, a: a, b: b, c: c });
    }
    order.sort(function (p, q) { return q.z - p.z; });

    for (i = 0; i < order.length; i++) {
      var o = order[i], A = o.a, B = o.b, Cc = o.c;
      /* Back-face culling by winding, in screen space. */
      var area = (B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1]);
      if (area <= 0) continue;

      /* Flat shading from the screen-space normal's z, which for a solid this
         shallow is indistinguishable from the real thing and costs nothing.
         The sides are darkened so the extrusion reads as thickness rather
         than as a wider flat star. */
      var depth = (o.z + 1.2) / 2.4;
      var l = 0.62 + 0.55 * Math.max(0, Math.min(1, depth));
      /* 0.74, not 0.62. The sides have to read as thickness, and on the dark
         theme either value does — but on the light theme 0.62 turned an amber
         Food mark muddy brown, which looks like a rendering fault rather than
         a shadow. */
      if (o.t.face === 0) l *= 0.74;
      var col = mix(COLS[0], COLS[1], o.t.t);
      ctx.fillStyle = css(col, l, 1);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.lineTo(Cc[0], Cc[1]);
      ctx.closePath();
      ctx.fill();
    }

    /* The core: logo.svg's near-white centre, drawn after the faces so it sits
       on them, and scaled by the same projection so it stays put when the mark
       turns away. */
    var mid = project([0, 0, DEPTH + 0.01]);
    var edge = project([R_VALLEY * 1.15, 0, DEPTH + 0.01]);
    var rad = Math.abs(edge[0] - mid[0]);
    if (rad > 0.5) {
      var g = ctx.createRadialGradient(mid[0], mid[1], 0, mid[0], mid[1], rad);
      g.addColorStop(0, 'rgba(255,255,255,.96)');
      /* The falloff starts earlier and ends transparent, so the core is a lit
         centre rather than a white disc with a hard edge sitting on the star.
         logo.svg can use a solid circle because it is 64 pixels across; at 500
         the same circle is a hole. */
      g.addColorStop(0.55, 'rgba(246,252,255,.72)');
      g.addColorStop(1, css(mix(COLS[0], COLS[1], 0.5), 1.15, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(mid[0], mid[1], rad, 0, Math.PI * 2);
      ctx.fill();
    }

    sparks();
  }

  /* The five travelling stars, as flat four-point sparkles that always face
     the camera. They are billboards on purpose: a sparkle seen edge-on
     disappears, and these are meant to read at any angle.

     Lifted out of draw() so the avatar can keep them: they belong to the hero's
     composition rather than to the mark, and a character turning in an empty
     corner of the page looked like a mistake next to one surrounded by them. */
  function sparks() {
    var i, j;
    for (i = 0; i < SPARKS.length; i++) {
      var sp = SPARKS[i], P = project(sp.p);
      var k = Math.min(W, H) * sp.s * (3.2 / (3.2 + P[2]));
      ctx.fillStyle = css(COLS[1], 1.15, 0.72);
      ctx.beginPath();
      for (j = 0; j < 4; j++) {
        var ang = j * Math.PI / 2;
        var nx = P[0] + Math.cos(ang) * k, ny = P[1] + Math.sin(ang) * k;
        var mx = P[0] + Math.cos(ang + Math.PI / 4) * k * 0.22;
        var my = P[1] + Math.sin(ang + Math.PI / 4) * k * 0.22;
        if (j === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
        ctx.lineTo(mx, my);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  function frame() {
    raf = 0;
    if (!visible) return;
    if (drag === null) {
      rotY += spin + vel;
      vel *= 0.94;
      /* A slow nod, so it is not a turntable. */
      rotX = -0.25 + Math.sin(Date.now() / 4200) * 0.13;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && !reduced) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* ---------------------------------------------------------------- pointers
     On the window, not on the layer: #nclogo3d is pointer-events:none so the
     hero's buttons keep working, which means it never receives an event of its
     own. Exactly the arrangement the globe used, and for the same reason. */
  function onDown(e) {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    drag = { x: e.clientX, y: e.clientY, ry: rotY, rx: rotX };
  }
  function onMove(e) {
    if (drag === null) return;
    rotY = drag.ry + (e.clientX - drag.x) * 0.008;
    rotX = Math.max(-1.1, Math.min(1.1, drag.rx + (e.clientY - drag.y) * 0.006));
    vel = (e.clientX - drag.x) * 0.00035;
    if (reduced) draw();
  }
  function onUp() { drag = null; }

  function init() {
    host = document.querySelector('.hero') || document.querySelector('header');
    if (!host) return;
    style();

    layer = document.createElement('div');
    layer.id = 'nclogo3d';
    layer.setAttribute('aria-hidden', 'true');
    var halo = document.createElement('div');
    halo.className = 'halo';
    cv = document.createElement('canvas');
    ctx = cv.getContext('2d');
    layer.appendChild(halo);
    layer.appendChild(cv);

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.insertBefore(layer, host.firstChild);
    resize();
    draw();
    start();

    addEventListener('resize', function () { resize(); draw(); }, { passive: true });
    addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);

    /* A star turning in a tab nobody is looking at is a battery being spent on
       nothing. */
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (visible) start(); else stop();
    });

    /* Off screen once the reader has scrolled past the hero, for the same
       reason. */
    try {
      new IntersectionObserver(function (rows) {
        visible = rows[0].isIntersecting && !document.hidden;
        if (visible) start(); else stop();
      }, { threshold: 0.01 }).observe(layer);
    } catch (e) {}

    /* The avatar is side-loaded after this file runs, and can be changed from
       the profile dialog on this very page, so both are listened for. */
    addEventListener('nc-avatar-3d', avChanged);
    addEventListener('nc-avatar-changed', avChanged);

    /* The category is what it is drawn in, so a change repaints it. */
    addEventListener('nc-category', function () { COLS = null; draw(); });
    /* And a theme change can move the fallback colours. */
    addEventListener('nc-theme', function () { COLS = null; draw(); });
  }

  window.NC_LOGO3D = { init: init, redraw: function () { COLS = null; draw(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
