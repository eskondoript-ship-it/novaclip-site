/* NovaClip — Spline background with a marker on the visitor's real location
   ============================================================================
   THE REACT SNIPPET DOES NOT APPLY HERE

   The Spline docs give you this:

       import Spline from '@splinetool/react-spline/next';
       <Spline scene="https://prod.spline.design/…/scene.splinecode" />

   NovaClip has no React, no bundler and no package.json — it is static HTML
   and Workers. So this uses Spline's other supported path, the <spline-viewer>
   web component, which is the same runtime without the build step.

   ============================================================================
   IT MUST BE ABLE TO FAIL

   A 3D scene is a CDN script plus a multi-megabyte binary plus a WebGL
   context. Any of those can be blocked, slow or unsupported, and a hero that
   renders blank when they are is worse than one that never had a globe. So:

     - a CSS starfield paints first and stays until the scene actually loads
     - a timeout gives up on the CDN rather than waiting forever
     - reduced motion, save-data, small screens and low-memory devices skip it
       entirely and keep the starfield
     - the scene pauses when the tab is hidden or the hero scrolls away

   The site is usable, and looks deliberate, in every one of those cases.

   ============================================================================
   THE RED DOT

   navigator.geolocation gives a real latitude and longitude, with the user's
   permission and only over HTTPS. Turning that into a screen position on a 3D
   globe needs to know where the globe is drawn and how it is oriented, and a
   .splinecode is an opaque binary — this file cannot read the camera out of
   it.

   So the projection is real spherical maths against a calibratable model of
   the globe: centre, radius, tilt and spin. Load any page with ?globe=calibrate
   to get a grid and live controls, nudge the four numbers until the dot sits on
   the right country, and they are saved. Two minutes, once.

   The maths that matters is not the calibration: it is that a point on the far
   side of the sphere is hidden rather than drawn through the planet, which is
   what makes a marker read as being ON a globe rather than in front of one.
   ---------------------------------------------------------------------------- */
(function () {
  'use strict';

  var SCENE = 'https://prod.spline.design/lJ7V7W5IWszRBeee/scene.splinecode';
  var VIEWER = 'https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js';
  var LOAD_TIMEOUT = 9000;

  /* Where the globe sits, as a fraction of the layer, plus its orientation.
     Defaults are a guess — see the calibration note above. */
  /* Centred to the right, not the middle. The hero's copy is left-aligned, and
     an uncalibrated marker at dead centre lands on top of the headline — which
     is exactly where it landed the first time this ran. */
  var DEFAULTS = { cx: 0.72, cy: 0.52, r: 0.30, spin: 0, tilt: 0 };
  var KEY = 'nc_globe_cal';

  function cal() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && typeof s.cx === 'number') return Object.assign({}, DEFAULTS, s);
    } catch (e) {}
    return Object.assign({}, DEFAULTS);
  }

  /* ==========================================================================
     Should this device run a 3D scene at all?
     ========================================================================== */
  function heavyOk() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    var c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return false;
    if (innerWidth < 760) return false;                 // phones: the cost is not worth it
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
    try {
      var cv = document.createElement('canvas');
      if (!(cv.getContext('webgl2') || cv.getContext('webgl'))) return false;
    } catch (e) { return false; }
    return true;
  }

  /* ==========================================================================
     The layer
     ========================================================================== */
  var layer, viewer, marker, label, state = 'starfield';

  function style() {
    if (document.getElementById('ncglobe-css')) return;
    var st = document.createElement('style');
    st.id = 'ncglobe-css';
    st.textContent = [
      '#ncglobe{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;' +
        'border-radius:inherit}',
      /* The hero's own children have to sit above it. Everything in the hero is
         static-positioned, so one rule lifts them all. */
      '.hero>*{position:relative;z-index:1}',
      '#ncglobe .sky{position:absolute;inset:0;' +
        'background:radial-gradient(1200px 700px at 62% 38%,rgba(0,240,255,.13),transparent 62%),' +
        'radial-gradient(900px 600px at 30% 72%,rgba(114,9,183,.15),transparent 66%);' +
        'transition:opacity .9s ease}',
      '#ncglobe .stars{position:absolute;inset:0;opacity:.55}',
      /* A white starfield on a light background is grey noise. Light theme gets
         a far fainter field and a softer wash. */
      'html[data-theme="light"] #ncglobe .stars{opacity:.13;filter:invert(1)}',
      'html[data-theme="light"] #ncglobe .sky{opacity:.6}',
      'html[data-theme="light"] #nclabel{background:rgba(255,255,255,.86);color:#14203A;' +
        'border-color:rgba(255,46,77,.5)}',
      'html[data-theme="light"] #ncgeo{background:rgba(255,255,255,.8);color:#41506E;' +
        'border-color:rgba(16,24,44,.16)}',
      /* The layer is click-through so the hero's buttons still work, but the
         scene itself takes pointer events so it can be dragged and spun. */
      '#ncglobe spline-viewer{position:absolute;inset:0;width:100%;height:100%;' +
        'opacity:0;transition:opacity 1.1s ease;pointer-events:auto;cursor:grab;touch-action:none}',
      '#ncglobe spline-viewer:active{cursor:grabbing}',
      '#ncglobe.ready spline-viewer{opacity:1}',
      '#ncglobe.ready .sky{opacity:.45}',

      '#ncdot{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;' +
        'background:#FF2E4D;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 18px 4px rgba(255,46,77,.75);' +
        'opacity:0;transition:opacity .45s ease;will-change:transform}',
      '#ncdot.on{opacity:1}',
      '#ncdot::after{content:"";position:absolute;inset:-6px;border-radius:50%;' +
        'border:2px solid rgba(255,46,77,.55)}',
      '@media (prefers-reduced-motion: no-preference){' +
        '#ncdot::after{animation:ncping 2.1s cubic-bezier(0,0,.2,1) infinite}' +
        '@keyframes ncping{0%{transform:scale(.6);opacity:.9}70%,100%{transform:scale(2.6);opacity:0}}}',
      '#nclabel{position:absolute;transform:translate(14px,-50%);white-space:nowrap;' +
        'font:600 12px/1 Geist,Inter,system-ui,sans-serif;color:#EAF2FF;' +
        'background:rgba(8,11,20,.78);border:1px solid rgba(255,46,77,.45);border-radius:999px;' +
        'padding:5px 10px;opacity:0;transition:opacity .45s ease;backdrop-filter:blur(8px)}',
      '#nclabel.on{opacity:1}',

      '#nchover{position:absolute;left:0;top:0;z-index:3;pointer-events:none;' +
        'background:rgba(8,11,20,.9);border:1px solid rgba(0,240,255,.4);border-radius:12px;' +
        'padding:7px 11px;font:600 12px/1.35 Geist,Inter,system-ui,sans-serif;color:#EAF2FF;' +
        'white-space:nowrap;opacity:0;transition:opacity .18s;backdrop-filter:blur(10px)}',
      '#nchover.on{opacity:1}',
      '#nchover b{display:block;font-weight:700}',
      '#nchover span{color:#8A97B4;font-family:ui-monospace,monospace;font-size:11px}',
      'html[data-theme="light"] #nchover{background:rgba(255,255,255,.92);color:#14203A}',
      '#ncgeo{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:2;' +
        'pointer-events:auto;font:600 12px/1 Geist,Inter,system-ui,sans-serif;color:#9FB0C8;' +
        'background:rgba(8,11,20,.7);border:1px solid rgba(255,255,255,.14);border-radius:999px;' +
        'padding:8px 15px;cursor:pointer;backdrop-filter:blur(8px)}',
      '#ncgeo:hover{color:#EAF2FF;border-color:rgba(0,240,255,.5)}',
      '#nccal{position:fixed;right:14px;bottom:14px;z-index:99999;pointer-events:auto;' +
        'background:rgba(8,11,20,.94);border:1px solid rgba(0,240,255,.35);border-radius:14px;' +
        'padding:12px 14px;font:12px/1.5 ui-monospace,monospace;color:#EAF2FF;width:230px}',
      '#nccal label{display:block;margin:7px 0 2px;color:#8A97B4;font-size:11px}',
      '#nccal input{width:100%}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function starfield(w, h) {
    /* Drawn once to a canvas rather than as hundreds of DOM nodes. */
    var c = document.createElement('canvas');
    c.className = 'stars';
    c.width = Math.min(1600, w || 1200); c.height = Math.min(900, h || 700);
    var x = c.getContext('2d');
    for (var i = 0; i < 260; i++) {
      var r = Math.random() * 1.3 + .2;
      x.globalAlpha = Math.random() * .7 + .15;
      x.fillStyle = i % 9 === 0 ? '#7CE7FF' : '#FFFFFF';
      x.beginPath();
      x.arc(Math.random() * c.width, Math.random() * c.height, r, 0, 7);
      x.fill();
    }
    return c;
  }

  function build(host) {
    style();
    layer = document.createElement('div');
    layer.id = 'ncglobe';
    layer.setAttribute('aria-hidden', 'true');

    var sky = document.createElement('div');
    sky.className = 'sky';
    layer.appendChild(sky);
    layer.appendChild(starfield(host.clientWidth, host.clientHeight));

    marker = document.createElement('div'); marker.id = 'ncdot';
    label = document.createElement('div'); label.id = 'nclabel';
    layer.appendChild(marker); layer.appendChild(label);

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.insertBefore(layer, host.firstChild);
    return layer;
  }

  /* ==========================================================================
     Loading the scene
     ========================================================================== */
  function loadScene() {
    if (!heavyOk()) return;                       // starfield stays; that is a fine outcome

    var s = document.createElement('script');
    s.type = 'module';
    s.src = VIEWER;
    var done = false;
    var giveUp = setTimeout(function () {
      if (!done) { done = true; s.remove(); }     // CDN blocked or slow: keep the starfield
    }, LOAD_TIMEOUT);

    s.onload = function () {
      if (done) return;
      done = true; clearTimeout(giveUp);

      /* The script tag firing onload only means the module ran. The custom
         element is registered a tick later, so wait for the registration
         rather than assuming it. */
      var ready = customElements.whenDefined
        ? customElements.whenDefined('spline-viewer')
        : Promise.resolve();

      ready.then(function () {
        viewer = document.createElement('spline-viewer');
        viewer.setAttribute('url', SCENE);
        viewer.setAttribute('loading-anim-type', 'none');
        layer.insertBefore(viewer, marker);

        /* The first version revealed the scene only inside a 'load' listener.
           If that event never fires — a different name, a version change, an
           element that renders without emitting it — the viewer is present,
           working, and permanently at opacity 0. Which is exactly what
           "the globe isn't there" looked like.

           So reveal on whichever comes first: the event, or a canvas actually
           existing inside the element. Then give up honestly if neither
           happens. */
        /* Spline paints a "Built with Spline" badge into its own shadow root.
           Note this is a licence question rather than a technical one: the free
           plan requires the badge to stay. Removing it is correct on a paid
           plan and a terms violation on a free one — that is the owner's call
           to make, not this file's.

           It is re-checked for a while because the badge is added after the
           first paint, and once more on every reveal. */
        function debadge() {
          var sr = viewer && viewer.shadowRoot;
          if (!sr) return false;
          var gone = false;
          ['#logo', 'a[href*="spline.design"]', '#spline-watermark', '.spline-watermark']
            .forEach(function (sel) {
              sr.querySelectorAll(sel).forEach(function (n) { n.remove(); gone = true; });
            });
          /* Belt and braces: a style inside the shadow root catches any badge
             added later under a name this list does not know. */
          if (!sr.getElementById('ncnobadge')) {
            var st = document.createElement('style');
            st.id = 'ncnobadge';
            st.textContent = '#logo,a[href*="spline.design"],#spline-watermark,.spline-watermark{' +
              'display:none!important;opacity:0!important;pointer-events:none!important}';
            sr.appendChild(st);
          }
          return gone;
        }
        var badgeTries = 0;
        var badgeTimer = setInterval(function () {
          badgeTries++;
          debadge();
          if (badgeTries > 30) clearInterval(badgeTimer);
        }, 400);

        var shown = false;
        function reveal(why) {
          if (shown) return;
          shown = true;
          state = 'scene';
          debadge();
          layer.classList.add('ready');
          layer.setAttribute('data-why', why);
          place();
        }
        ['load', 'load-complete', 'loaded'].forEach(function (ev) {
          viewer.addEventListener(ev, function () { reveal(ev); });
        });
        viewer.addEventListener('error', function () { bail('scene error'); });

        var tries = 0;
        var poll = setInterval(function () {
          tries++;
          var cv = viewer.shadowRoot ? viewer.shadowRoot.querySelector('canvas')
                                     : viewer.querySelector('canvas');
          if (cv && cv.width > 0) { clearInterval(poll); reveal('canvas'); }
          else if (tries > 40) { clearInterval(poll); if (!shown) bail('no canvas after 20s'); }
        }, 500);

        function bail(why) {
          clearInterval(poll);
          if (viewer) { viewer.remove(); viewer = null; }
          layer.setAttribute('data-failed', why);
          if (/[?&]globe=(debug|calibrate)/.test(location.search)) console.warn('[globe] ' + why);
        }
      });
    };
    s.onerror = function () { clearTimeout(giveUp); done = true; };
    document.head.appendChild(s);
  }

  /* ==========================================================================
     Location
     ==========================================================================
     Asked for on a click, never on load. A permission prompt that appears
     unprompted is the one every browser now suppresses and every user denies.
     ========================================================================== */
  var pos = null;

  function askButton(host) {
    var b = document.createElement('button');
    b.id = 'ncgeo';
    b.type = 'button';
    b.textContent = 'Show me on the globe';
    b.addEventListener('click', function () {
      b.textContent = 'Asking your browser…';
      navigator.geolocation.getCurrentPosition(function (p) {
        pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy };
        try { localStorage.setItem('nc_geo', JSON.stringify(pos)); } catch (e) {}
        b.remove();
        place();
      }, function (err) {
        /* Say which of the three it was. "Location unavailable" tells a person
           nothing about whether to try again. */
        b.textContent = err.code === 1 ? 'Location permission denied'
          : err.code === 3 ? 'Location timed out — tap to retry'
          : 'Location unavailable';
        if (err.code !== 1) setTimeout(function () { b.textContent = 'Show me on the globe'; }, 3200);
      }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 });
    });
    host.appendChild(b);
    return b;
  }

  /* ==========================================================================
     Projection: latitude and longitude onto the sphere as drawn
     ==========================================================================
     Standard sphere: x east, y up, z towards the camera. Spin turns the globe
     about its axis, tilt leans the pole towards or away. A point whose z is
     negative is round the back and must not be drawn — without that check the
     marker shows through the planet and the whole thing reads as a sticker.
     ========================================================================== */
  function project(lat, lon, c, w, h) {
    var la = lat * Math.PI / 180;
    var lo = (lon + c.spin) * Math.PI / 180;
    var x = Math.cos(la) * Math.sin(lo);
    var y = Math.sin(la);
    var z = Math.cos(la) * Math.cos(lo);

    var t = c.tilt * Math.PI / 180;                 // lean about the x axis
    var y2 = y * Math.cos(t) - z * Math.sin(t);
    var z2 = y * Math.sin(t) + z * Math.cos(t);

    var R = c.r * Math.min(w, h);
    return {
      x: c.cx * w + x * R,
      y: c.cy * h - y2 * R,
      visible: z2 > 0.02                            // a hair past the limb, so it fades at the edge
    };
  }

  /* --------------------------------------------------------------------------
     The inverse of project(): a point on screen back to a point on the planet.

     Cast a ray straight at the sphere. Anything outside the disc is a miss —
     the cursor is on sky, not on the globe — and that check is what stops the
     readout claiming a country when the pointer is nowhere near the planet.
     Then undo the tilt and the spin in the opposite order project() applied
     them, and read the latitude and longitude straight off the unit sphere.
     -------------------------------------------------------------------------- */
  function unproject(mx, my, c, w, h) {
    var R = c.r * Math.min(w, h);
    var dx = (mx - c.cx * w) / R;
    var dy = -(my - c.cy * h) / R;
    var d2 = dx * dx + dy * dy;
    if (d2 > 1) return null;                        // off the disc: sky, not planet
    var dz = Math.sqrt(1 - d2);                     // near face of the sphere

    var t = c.tilt * Math.PI / 180;
    /* project() did y2 = y·cos t − z·sin t ; z2 = y·sin t + z·cos t */
    var y = dy * Math.cos(t) + dz * Math.sin(t);
    var z = -dy * Math.sin(t) + dz * Math.cos(t);
    var x = dx;

    var lat = Math.asin(Math.max(-1, Math.min(1, y))) * 180 / Math.PI;
    var lon = Math.atan2(x, z) * 180 / Math.PI - c.spin;
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;
    return { lat: lat, lon: lon };
  }

  /* --------------------------------------------------------------------------
     Hover readout
     --------------------------------------------------------------------------
     Coordinates appear instantly because they are pure geometry. The place name
     needs a lookup, so it arrives a moment later and only once the pointer has
     settled — moving the mouse across a globe would otherwise fire a request per
     frame.

     Worth being clear about what leaves the browser: the coordinates under the
     CURSOR, which are not the visitor's location. The red dot's own position is
     never sent anywhere.
     -------------------------------------------------------------------------- */
  var hoverEl, hoverTimer, lastKey = '';
  var placeCache = new Map();

  function hoverBox() {
    if (hoverEl) return hoverEl;
    hoverEl = document.createElement('div');
    hoverEl.id = 'nchover';
    layer.appendChild(hoverEl);
    return hoverEl;
  }

  function fmt(lat, lon) {
    return Math.abs(lat).toFixed(2) + (lat >= 0 ? '°N' : '°S') + '  ' +
           Math.abs(lon).toFixed(2) + (lon >= 0 ? '°E' : '°W');
  }

  function lookup(lat, lon, done) {
    var key = lat.toFixed(1) + ',' + lon.toFixed(1);      // ~11 km buckets
    if (placeCache.has(key)) { done(placeCache.get(key)); return; }
    var url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' +
      lat.toFixed(4) + '&longitude=' + lon.toFixed(4) + '&localityLanguage=en';
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var city = j.city || j.locality || j.principalSubdivision || '';
      var country = j.countryName || '';
      /* No country means open ocean, and saying so is more useful than an
         empty line that looks like a failure. */
      var text = country ? (city ? city + ', ' + country : country) : 'Open ocean';
      placeCache.set(key, text);
      done(text);
    }).catch(function () {
      placeCache.set(key, '');
      done('');
    });
  }

  function onHover(e) {
    if (!layer) return;
    var r = layer.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    var p = unproject(mx, my, cal(), r.width, r.height);
    var box = hoverBox();

    if (!p) { box.classList.remove('on'); clearTimeout(hoverTimer); return; }

    box.classList.add('on');
    box.style.transform = 'translate(' + (mx + 16) + 'px,' + (my + 16) + 'px)';
    var coords = fmt(p.lat, p.lon);
    var key = p.lat.toFixed(1) + ',' + p.lon.toFixed(1);
    if (key !== lastKey) {
      lastKey = key;
      box.innerHTML = '<b>Locating…</b><span>' + coords + '</span>';
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () {
        lookup(p.lat, p.lon, function (text) {
          if (lastKey !== key) return;               // pointer already moved on
          box.innerHTML = '<b>' + (text || 'Unknown') + '</b><span>' + coords + '</span>';
        });
      }, 380);
    } else {
      var b = box.querySelector('span');
      if (b) b.textContent = coords;
    }
  }

  function place() {
    if (!layer || !marker) return;
    if (!pos) {
      try { pos = JSON.parse(localStorage.getItem('nc_geo') || 'null'); } catch (e) {}
    }
    if (!pos) return;

    var w = layer.clientWidth, h = layer.clientHeight;
    var p = project(pos.lat, pos.lon, cal(), w, h);
    marker.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
    label.style.transform = 'translate(' + (p.x + 14) + 'px,' + p.y + 'px) translateY(-50%)';
    label.textContent = 'You are here · ' +
      Math.abs(pos.lat).toFixed(1) + (pos.lat >= 0 ? '°N ' : '°S ') +
      Math.abs(pos.lon).toFixed(1) + (pos.lon >= 0 ? '°E' : '°W');
    marker.classList.toggle('on', p.visible);
    label.classList.toggle('on', p.visible);
  }

  /* ==========================================================================
     Calibration — ?globe=calibrate
     ========================================================================== */
  function calibrator() {
    var c = cal();
    var box = document.createElement('div');
    box.id = 'nccal';
    box.innerHTML = '<b>Globe calibration</b>' +
      ['cx', 'cy', 'r', 'spin', 'tilt'].map(function (k) {
        var min = k === 'spin' ? -180 : k === 'tilt' ? -90 : 0;
        var max = k === 'spin' ? 180 : k === 'tilt' ? 90 : 1;
        var step = (k === 'spin' || k === 'tilt') ? 1 : 0.005;
        return '<label>' + k + ' <span data-v="' + k + '">' + c[k] + '</span></label>' +
          '<input type="range" data-k="' + k + '" min="' + min + '" max="' + max +
          '" step="' + step + '" value="' + c[k] + '">';
      }).join('') +
      '<div style="margin-top:9px;color:#8A97B4">Drag until the dot sits on your country, then reload. Saved automatically.</div>';
    document.body.appendChild(box);

    box.addEventListener('input', function (e) {
      var k = e.target.dataset.k; if (!k) return;
      var next = cal(); next[k] = +e.target.value;
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (er) {}
      box.querySelector('[data-v="' + k + '"]').textContent = e.target.value;
      place();
    });

    /* A test point so calibration works before granting location. */
    if (!pos) { pos = { lat: 38.72, lon: -9.14 }; place(); }
  }

  /* ==========================================================================
     Start
     ========================================================================== */
  function init() {
    var host = document.querySelector('.hero') || document.querySelector('header');
    if (!host) return;

    build(host);
    if (navigator.geolocation && isSecureContext) {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem('nc_geo') || 'null'); } catch (e) {}
      if (saved) { pos = saved; place(); } else askButton(host);
    }

    loadScene();

    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(place, 160); });

    /* Stop rendering when it cannot be seen. A WebGL scene running behind a
       scrolled-past hero is heat and battery for nothing. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (viewer) viewer.style.visibility = vis ? '' : 'hidden';
      }, { threshold: 0.01 }).observe(host);
    }
    document.addEventListener('visibilitychange', function () {
      if (viewer) viewer.style.visibility = document.hidden ? 'hidden' : '';
    });

    /* Listened for on the layer rather than the scene, so the readout still
       works before the scene loads and if it never does. */
    layer.addEventListener('pointermove', onHover);
    layer.addEventListener('pointerleave', function () {
      if (hoverEl) hoverEl.classList.remove('on');
      clearTimeout(hoverTimer);
    });
    /* The layer is click-through, so it gets no pointer events of its own.
       Track on the window and convert, which also keeps the hero buttons live. */
    addEventListener('pointermove', onHover, { passive: true });

    if (/[?&]globe=calibrate/.test(location.search)) calibrator();

    /* ?globe=debug prints why the scene is or is not on screen, so "it is not
       there" becomes a specific answer instead of a guess. */
    if (/[?&]globe=debug/.test(location.search)) {
      setTimeout(function () {
        console.log('[globe] heavy device ok :', heavyOk());
        console.log('[globe] viewer element  :', !!viewer);
        console.log('[globe] revealed        :', layer.classList.contains('ready'),
          layer.getAttribute('data-why') || layer.getAttribute('data-failed') || '');
        console.log('[globe] secure context  :', isSecureContext);
      }, 6000);
    }
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
  else init();

  window.NCGlobe = { place: place, project: project, unproject: unproject, cal: cal, heavyOk: heavyOk };
})();
