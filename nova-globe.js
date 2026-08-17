/* NovaClip — the globe
   ============================================================================
   WHY THIS IS NOT SPLINE ANY MORE

   The Spline scene brought four problems that were all really one problem:
   it was an opaque binary rendered by someone else's runtime.

     - the "Built with Spline" badge could only be fought in a shadow root,
       and removing it on the free plan is a licence violation
     - a .splinecode cannot be read, so the red dot needed hand calibration
       against a camera this code could not see
     - it never stopped spinning, because the spin was inside the scene
     - it was a CDN module plus a multi-megabyte download before anything drew

   Drawing it here answers all four at once. The projection is the same maths
   that places the marker, so the dot is exact with nothing to calibrate. The
   rotation is a variable, so it can stop. There is no badge because there is
   no third party. And it is about 20KB of canvas with no network at all.

   ============================================================================
   HOW IT IS DRAWN

   An orthographic projection — the view of a sphere from infinitely far away,
   which is what a globe looks like. Land is a grid of dots sampled every two
   degrees and tested against coarse continent outlines; dots on the far side
   are dropped, which is what makes it read as a ball rather than a circle.

   The outlines are deliberately coarse. At this dot spacing a coastline is
   about four dots wide, so tracing every fjord would cost bytes nobody can
   see. They are accurate enough that Portugal is where Portugal is, which is
   the part that matters when a red dot lands on it.
   ---------------------------------------------------------------------------- */
(function () {
  'use strict';

  /* ==========================================================================
     LAND
     ==========================================================================
     Coarse outlines in [lon, lat]. Point-in-polygon per dot.
     ========================================================================== */
  var LAND = [
    /* Africa */
    [[-17,21],[-16,14],[-13,9],[-8,4],[3,6],[9,4],[9,-1],[12,-6],[12,-17],[15,-23],
     [18,-34],[26,-34],[32,-29],[33,-26],[35,-21],[40,-15],[41,-10],[40,-3],[43,2],
     [51,11],[44,12],[43,15],[39,15],[37,20],[34,28],[32,31],[25,32],[15,32],[10,34],
     [3,36],[-2,35],[-6,36],[-10,30],[-13,26]],
    /* Europe, mainland.
       Iberia reaches -9.5, not -9: Cabo da Roca is the westernmost point of the
       mainland continent, and at -9 the coastline runs east of Lisbon — which
       put this visitor's own red dot in the Atlantic. */
    [[-9.5,43],[-9.5,37],[-6,36],[-2,36],[0,39],[3,42],[7,44],[10,44],[13,45],[16,43],
     [19,40],[24,40],[26,41],[29,41],[28,45],[30,46],[38,47],[40,44],[48,46],[52,52],
     [60,58],[68,66],[62,70],[45,68],[33,70],[30,62],[24,60],[22,59],[19,60],[13,55],
     [8,55],[4,52],[0,51],[-2,48],[-5,48],[-2,44]],
    /* Scandinavia */
    [[5,58],[8,63],[13,68],[20,70],[26,71],[30,70],[25,66],[22,62],[19,60],[13,55],[8,57]],
    /* Italy. The mainland outline above cuts the corner from the Alps to the
       Balkans, which puts Rome in the Tyrrhenian Sea. */
    [[7,45],[13,46],[14,42],[16,41],[18,40.5],[16,37.5],[14,40],[12,41],[10,43],[8,44]],
    /* Sicily and Sardinia */
    [[12.5,38],[15.5,38.3],[15.3,37],[12.5,37.5]],
    [[8,41],[9.8,41.2],[9.6,39],[8.4,39]],
    /* Britain and Ireland */
    [[-6,50],[-5,54],[-3,56],[-3,58],[0,58],[1,53],[1,51],[-4,50]],
    [[-10,52],[-10,55],[-6,55],[-6,52]],
    /* Asia */
    [[26,41],[35,37],[45,40],[50,37],[57,38],[62,42],[70,42],[76,40],[80,44],[88,48],
     [95,50],[105,50],[115,45],[122,42],[128,43],[132,48],[140,52],[143,59],[150,60],
     [160,62],[170,66],[180,67],[180,72],[160,73],[140,74],[120,74],[100,76],[80,74],
     [70,72],[60,70],[52,70],[45,66],[40,58],[38,50],[36,45],[30,45]],
    /* India */
    [[68,24],[72,20],[73,16],[77,8],[80,10],[81,16],[85,20],[88,22],[92,22],[92,26],
     [88,27],[80,28],[74,32],[70,28]],
    /* South-East Asia */
    [[92,22],[96,17],[98,10],[100,6],[104,2],[106,10],[109,11],[108,16],[106,20],
     [102,22],[97,25]],
    /* China and central Asia.
       The Siberian outline above only comes down to about 45°N, and India stops
       at 32°N, which left everything between them — Tibet, Xinjiang, and most
       of China including Beijing — as ocean. */
    [[74,32],[80,30],[85,28],[92,28],[97,28],[100,22],[105,22],[112,20],[117,23],
     [121,28],[122,33],[121,38],[118,40],[114,41],[110,40],[105,42],[100,42],
     [92,44],[85,45],[78,42],[72,40],[68,38],[66,34],[70,32]],
    /* Korea */
    [[126,34],[129,35],[130,38],[128,41],[125,40],[125,37]],
    /* Japan. Honshu has to be wide enough to hold Tokyo — the earlier outline
       was a one-dot line that the Kanto plain fell off the side of. */
    [[129,32],[133,33],[136,34],[140,35],[142,38],[142,41],[145,43],[145,46],[141,45],
     [139,41],[136,37],[132,35],[130,34]],
    /* Indonesia and Philippines, as blobs */
    [[95,5],[105,-2],[115,-4],[120,-2],[118,2],[108,3],[98,6]],
    [[110,-3],[125,-4],[135,-3],[140,-4],[132,-8],[120,-9],[112,-8]],
    /* Java — where Jakarta is, and it is not in either blob above */
    [[104.5,-5.5],[114.5,-7],[115,-8.8],[110,-8.5],[105,-6.5]],
    [[120,6],[124,10],[126,15],[122,18],[119,13],[118,8]],
    /* Australia */
    [[113,-22],[114,-27],[117,-35],[124,-34],[130,-32],[137,-35],[141,-38],[147,-39],
     [150,-37],[153.5,-30],[153,-25],[146,-19],[142,-12],[136,-12],[131,-12],[126,-14],
     [122,-18]],
    /* New Zealand */
    [[172,-41],[173,-35],[175,-37],[177,-38],[176,-41],[172,-44],[168,-46],[167,-45],
     [170,-43]],
    /* North America */
    [[-168,66],[-160,70],[-150,70],[-140,70],[-128,70],[-115,69],[-105,68],[-95,68],
     [-85,67],[-80,63],[-78,58],[-80,52],[-78,45],[-70,45],[-66,45],[-60,47],[-64,44],
     [-70,42],[-74,40],[-76,35],[-81,31],[-80,25],[-84,30],[-90,29],[-95,29],[-97,25],
     /* Mexico proper. Stopping at 21°N left Mexico City offshore, in the gap
        between this outline and the Central America one below. */
     [-95,18],[-92,17],[-96,16],[-102,18],[-106,21],[-110,24],[-114,28],
     [-117,33],[-122,37],[-124,42],[-124,48],
     [-130,54],[-136,58],[-145,60],[-152,58],[-158,56],[-165,60],[-166,64]],
    /* Central America */
    [[-92,16],[-88,16],[-84,11],[-80,9],[-77,8],[-83,9],[-87,13],[-92,14]],
    /* Greenland */
    [[-45,60],[-52,64],[-55,68],[-58,72],[-55,76],[-45,80],[-30,82],[-20,78],[-22,72],
     [-30,68],[-38,63]],
    /* South America */
    [[-81,-4],[-79,2],[-76,8],[-72,11],[-64,10],[-60,8],[-52,5],[-50,0],[-44,-2],
     [-38,-5],[-35,-8],[-38,-13],[-39,-18],[-44,-23],[-48,-25],[-53,-34],[-58,-38],
     [-62,-40],[-64,-45],[-68,-50],[-69,-53],[-74,-52],[-73,-45],[-73,-37],[-71,-30],
     [-70,-23],[-70,-18],[-77,-14],[-79.5,-8]],
    /* Antarctica, as a cap */
    [[-180,-70],[-150,-72],[-120,-73],[-90,-72],[-60,-70],[-30,-70],[0,-70],[30,-68],
     [60,-67],[90,-66],[120,-66],[150,-70],[180,-70],[180,-90],[-180,-90]],
    /* Madagascar */
    [[43,-12],[50,-15],[50,-22],[46,-25],[44,-20],[43,-16]]
  ];

  function onLand(lon, lat) {
    for (var p = 0; p < LAND.length; p++) {
      var poly = LAND[p], inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if ((yi > lat) !== (yj > lat) &&
            lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }

  /* Precomputed once: every dot that is on land, as a unit vector plus its
     coordinates. Rebuilding this per frame would be ten thousand
     point-in-polygon tests sixty times a second. */
  var DOTS = [];
  (function buildDots() {
    var step = 2;
    for (var lat = -88; lat <= 88; lat += step) {
      /* Fewer dots near the poles, or they crowd into a bright cap. */
      var lonStep = step / Math.max(0.18, Math.cos(lat * Math.PI / 180));
      for (var lon = -180; lon < 180; lon += lonStep) {
        if (!onLand(lon, lat)) continue;
        var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
        DOTS.push([Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]);
      }
    }
  })();

  /* ==========================================================================
     THE CLOSE-UP GRID
     ==========================================================================
     DOTS is the whole planet sampled every two degrees, which is about 220km
     between dots — right for a globe and useless once the view is a few degrees
     across, where it would put four dots on the screen.

     So past a certain zoom the patch in view gets its own grid, as fine as the
     view is small. It is rebuilt only when the zoom moves a step or the focus
     changes, not per frame: point-in-polygon across ten thousand candidates
     sixty times a second is not a thing to do in a background animation.

     Worth being plain about the limit: the coastlines these are tested against
     were traced at about one degree. Zoom past that and the extra dots are
     honest about where land is to within ~100km and invent nothing finer —
     there are no streets in this data, and none of it pretends there are.
     ========================================================================== */
  var localDots = null, localKey = '';

  /* How wide the view is, in kilometres across the ground. Everything that has
     to change with depth keys off this rather than off the zoom number, because
     a distance is the thing a person can picture. */
  var EARTH_KM = 6371;
  function viewSpanDeg() { return Math.asin(Math.min(1, 1 / Math.max(1, zoom))) * 180 / Math.PI; }
  function viewKm() { return viewSpanDeg() * Math.PI / 180 * EARTH_KM; }

  /* The dot layer fades out as the view gets closer than the data is good for.
     Full strength above 120km of view radius, gone below 40km. */
  function dotAlpha() {
    var km = viewKm();
    if (km >= 120) return 1;
    if (km <= 40) return 0;
    return (km - 40) / 80;
  }

  /* ==========================================================================
     REAL IMAGERY, CLOSE IN
     ==========================================================================
     Below the range where hand-traced coastlines mean anything, the honest
     options are to stop drawing land or to go and get a real picture of the
     ground. This does the second: a square of Google's imagery, fetched through
     ai-worker.js so the API key stays on the Worker and never reaches a page.

     The zoom level is CALCULATED, not guessed. A Static Maps pixel covers
     156543.03392 * cos(latitude) / 2^z metres, so the z whose 640px square
     matches the porthole's current ground radius is a logarithm, and the image
     is then drawn at the exact scale that makes its ground match the sphere's.
     Get that wrong and the imagery slides against the coordinate grid.

     Requests are bucketed by integer z and cached, so a run in from orbit to a
     street costs a handful of images rather than one per frame — which matters,
     because each one is a billed request.

     If the Worker has no GOOGLE_MAPS_KEY it answers 503, the image errors, and
     after a couple of tries this stops asking and the drawn globe carries on as
     before. Nothing breaks; there is just no photograph.
     ========================================================================== */
  /* ==========================================================================
     GROUND IMAGERY WITHOUT A BILLING ACCOUNT
     ==========================================================================
     The Google path below works, but Static Maps needs a key, and a key needs a
     card on file even inside the free allowance. That is a real cost of owning
     this feature and not one worth paying for a background on a landing page.

     Standard XYZ tiles need neither. They are the same scheme every web map
     uses — 256px squares addressed by zoom/x/y — and several providers serve
     them openly as long as you credit them and do not hammer them. So this is
     the default, the page fetches them itself, and the Worker is not involved
     at all.

     SWAPPING THE PROVIDER is one line: set window.NC_TILES before nova-globe.js
     runs, with a url template and the credit that provider requires. The credit
     is not optional — it is the condition every one of these services is free
     under, and it is drawn inside the porthole for the same reason Google's is.

     I could not reach either service from where this was written, so the URL
     shape is from their published scheme and the failure path is what was
     actually tested: if the tiles do not come, the drawn globe carries on and
     the readout says so.
     ========================================================================== */
  var TILE_DEFAULT = {
    /* Satellite imagery, which is what "actual terrain" meant. */
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: 'Imagery © Esri, Maxar, Earthstar Geographics',
    maxZoom: 19
  };

  /* Read every time rather than captured once at parse. This file is deferred,
     so a page that sets window.NC_TILES in a later script would otherwise be
     ignored depending on which tag happened to run first — a difference nobody
     should have to reason about to change a map provider. */
  function tileCfg() { return window.NC_TILES || TILE_DEFAULT; }

  var METRES_PER_PX_EQUATOR = 156543.03392;   // at zoom 0
  var MAP_SIZE = 640;                         // the square asked for
  var mapCache = {};                          // key -> record
  var mapFails = 0, mapOff = false;

  function mapBase() {
    /* nova.js owns the Worker's address; read it late because that file loads
       after this one. */
    return window.NC_AI_WORKER_URL || '';
  }

  /* Metres of ground across half of one of these images, at a given zoom. */
  function mapHalfMetres(lat, z) {
    return (MAP_SIZE / 2) * METRES_PER_PX_EQUATOR *
      Math.cos(lat * Math.PI / 180) / Math.pow(2, z);
  }

  function mapFor(lat, lon) {
    if (mapOff || !mapBase()) return null;
    var km = viewKm();
    if (km > 200) return null;                // too far out for imagery to help

    /* Close enough for ground detail to matter is also the moment worth asking
       whether a flyover exists — not on page load, when the visitor may never
       hover at all. */
    askAerial();

    /* The z whose square is about as wide as the porthole is. */
    var want = (MAP_SIZE / 2) * METRES_PER_PX_EQUATOR *
      Math.cos(lat * Math.PI / 180) / (km * 1000);
    /* FLOOR, not round. Rounding up picks a tighter zoom whose square is
       narrower than the porthole, and the corners of the circle then show bare
       sphere through the gaps. Flooring always over-covers, at the cost of at
       most one zoom level of detail — and the drawn scale stays exact either
       way, because it is computed from the z actually used. */
    var z = Math.floor(Math.log(want) / Math.LN2);
    z = Math.max(1, Math.min(20, z));

    var key = lat.toFixed(3) + ',' + lon.toFixed(3) + '@' + z;
    var rec = mapCache[key];
    if (!rec) {
      rec = { z: z, ready: false, failed: false, img: new Image() };
      mapCache[key] = rec;

      /* FETCHED, NOT SET AS AN <img> SRC.
         An <img> that fails tells you exactly one thing: it failed. It cannot
         tell you whether the Worker has no map key, or is running last month's
         code with no /map route on it at all, or is not the Worker you think
         it is — and those need completely different fixes. Silently falling
         back to the drawn globe for any of them, which is what this did, left
         no way to tell them apart from the outside.

         fetch gives the status and the Worker's own words, and mapNote turns
         them into a sentence in the readout. */
      var url = mapBase() + '/map?lat=' + lat.toFixed(6) + '&lon=' + lon.toFixed(6) +
        '&z=' + z + '&size=' + MAP_SIZE + '&type=hybrid&scale=2';

      fetch(url).then(function (r) {
        if (r.ok) return r.blob();
        return r.text().then(function (body) {
          var why = '';
          try { why = (JSON.parse(body) || {}).error || ''; } catch (e) {}
          var e = new Error(why || ('the worker answered ' + r.status));
          e.status = r.status;
          throw e;
        });
      }).then(function (blob) {
        rec.img.onload = function () { rec.ready = true; };
        rec.img.src = URL.createObjectURL(blob);
        mapNote('');
      }).catch(function (e) {
        rec.failed = true;
        mapNote(mapReason(e));
        if (++mapFails >= 2) mapOff = true;
      });
    }
    return rec.ready ? rec : null;
  }

  /* Turn what went wrong into the thing to actually go and do. */
  function mapReason(e) {
    var s = e && e.status, msg = (e && e.message) || '';
    if (s === 503 || /GOOGLE_MAPS_KEY/i.test(msg)) {
      return 'No map imagery: the worker has no GOOGLE_MAPS_KEY secret yet.';
    }
    if (s === 404 || s === 405) {
      return 'No map imagery: this worker has no /map route — it is running an older ai-worker.js.';
    }
    if (s === 400) return 'No map imagery: ' + msg;
    if (s) return 'No map imagery: the worker answered ' + s + '. ' + msg;
    /* No status at all means the request never completed — wrong address, DNS,
       offline, or a blocked request. */
    return 'No map imagery: could not reach the worker at ' + mapBase() + '.';
  }

  /* One line, said once, in the readout under the pointer and in the console.
     A landing page should not lecture a visitor about a missing secret, so it
     is deliberately quiet — but whoever owns the site needs to be able to see
     it without reading this file. */
  var mapNoteText = '';
  function mapNote(t) {
    if (t === mapNoteText) return;
    mapNoteText = t;
    if (t) {
      try { console.warn('[NovaClip globe] ' + t); } catch (e) {}
    }
  }
  function mapStatus() { return mapNoteText; }

  /* Shown in the readout only when the imagery was expected and did not come.
     It is the site owner's problem, not the visitor's, so it is one dim line
     rather than an error box. */
  function mapNoteHtml() {
    if (!mapNoteText) return '';
    return '<span style="color:#FFB443">' + mapNoteText.replace(/^No map imagery: /, '') + '</span>';
  }

  /* ==========================================================================
     THE FLYOVER, IF THERE IS ONE
     ==========================================================================
     Google renders cinematic aerial videos for some addresses. When one exists
     for the visitor's own place it plays inside the porthole, over the still
     imagery.

     It is asked for ONCE, by place name, after the readout has produced one —
     the API has no lookup by coordinate. Most residential addresses have no
     video and answer 404, which is why the still image underneath is not
     optional: it is the normal case, and the flyover is the bonus.

     Unlike the still, this cannot follow the zoom. It is somebody else's camera
     move, so it is drawn to fill the window and left alone rather than pretending
     to be locked to the ground.
     ========================================================================== */
  var aerial = null;          // { video, ready } once a flyover is playing
  var aerialAsked = false;

  function askAerial() {
    if (aerialAsked || !pos || !mapBase()) return;
    aerialAsked = true;       // one request per page, whatever the answer
    /* Coordinates go up and the Worker turns them into a street address with
       the Maps key it already holds. The lookup is address-only, but resolving
       the address in the page would mean a geocoding key in the page. */
    fetch(mapBase() + '/aerial?lat=' + pos.lat.toFixed(6) + '&lon=' + pos.lon.toFixed(6))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || j.state !== 'ACTIVE' || !j.uri) return;
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.autoplay = true;
        v.playsInline = true;
        /* Not crossOrigin: the signed URI may not send CORS headers, and asking
           for it would fail the load outright. The canvas gets tainted, which
           costs nothing here because nothing reads pixels back. */
        v.addEventListener('loadeddata', function () { aerial = { video: v, ready: true }; });
        v.src = j.uri;
        var play = v.play();
        if (play && play.catch) play.catch(function () {});
      })
      .catch(function () {});
  }

  /* Fills the window, cropping rather than letter-boxing — a black bar inside a
     porthole reads as a broken image. */
  function drawAerial(CX, CY, VR, alpha) {
    if (!aerial || !aerial.ready || alpha <= 0) return false;
    var v = aerial.video;
    var vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return false;
    var side = VR * 2;
    var scale = Math.max(side / vw, side / vh);
    var w = vw * scale, h = vh * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    try { ctx.drawImage(v, CX - w / 2, CY - h / 2, w, h); }
    catch (e) { ctx.restore(); return false; }
    ctx.restore();
    return true;
  }

  /* ==========================================================================
     THE TILE LAYER
     ==========================================================================
     Web Mercator, the projection every slippy map uses. A tile at zoom z is one
     of 2^z by 2^z squares covering the world, and the fractional tile
     coordinate of a point is all the arithmetic needed to place it.

     Note the globe is orthographic and tiles are Mercator — two different
     projections. Over a patch a couple of kilometres wide the difference is far
     below a pixel, so laying the tiles flat over the sphere's centre is exact
     enough. It would not be at continental scale, which is another reason the
     imagery only appears once the view is close.
     ========================================================================== */
  var tileCache = {}, tileFails = 0, tilesOff = false;
  var tileStats = { requested: 0, drawn: 0 };

  function lonToTileX(lon, z) { return (lon + 180) / 360 * Math.pow(2, z); }
  function latToTileY(lat, z) {
    var r = lat * Math.PI / 180;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z);
  }

  function tileImg(z, x, y) {
    var n = Math.pow(2, z);
    if (y < 0 || y >= n) return null;              // off the top or bottom of the world
    x = ((x % n) + n) % n;                          // longitude wraps, latitude does not
    var key = z + '/' + x + '/' + y;
    var rec = tileCache[key];
    if (!rec) {
      rec = { ready: false, img: new Image() };
      rec.img.onload = function () { rec.ready = true; };
      rec.img.onerror = function () {
        if (++tileFails >= 6) { tilesOff = true; mapNote('No map imagery: the tile service did not answer.'); }
      };
      rec.img.src = tileCfg().url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
      tileStats.requested++;
      tileCache[key] = rec;
    }
    return rec.ready ? rec.img : null;
  }

  /* Returns true when tiles actually covered the window, so the caller knows
     whether to draw the credit — and whether the Google path is still needed. */
  function drawTiles(CX, CY, VR, alpha) {
    var TILES = tileCfg();
    if (tilesOff || !TILES || !TILES.url || alpha <= 0) return false;
    if (!pos || focusLat == null) return false;

    var km = viewKm();
    if (km > 200) return false;

    /* Metres of ground per screen pixel, and the zoom whose tiles match it.
       Floored so the tiles are never coarser than the screen. */
    var mppScreen = (km * 1000) / VR;
    var z = Math.floor(Math.log(METRES_PER_PX_EQUATOR * Math.cos(pos.lat * Math.PI / 180) / mppScreen) / Math.LN2);
    z = Math.max(1, Math.min(TILES.maxZoom || 19, z));

    var mppTile = METRES_PER_PX_EQUATOR * Math.cos(pos.lat * Math.PI / 180) / Math.pow(2, z);
    var scale = mppTile / mppScreen;               // one tile pixel, in screen pixels
    var side = 256 * scale;

    var fx = lonToTileX(pos.lon, z), fy = latToTileY(pos.lat, z);
    /* How many tiles reach the edge of the porthole from the centre. */
    var reach = Math.ceil(VR / side) + 1;
    var x0 = Math.floor(fx), y0 = Math.floor(fy);

    var drew = 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (var dy = -reach; dy <= reach; dy++) {
      for (var dx = -reach; dx <= reach; dx++) {
        var tx = x0 + dx, ty = y0 + dy;
        var sx = CX + (tx - fx) * side;
        var sy = CY + (ty - fy) * side;
        /* Decide whether the tile is on screen BEFORE asking for it. Testing
           afterwards still fetches every corner of the square grid that the
           round window never shows — 147 requests for one view, against a
           service that is free on the understanding you do not hammer it. */
        if (sx > CX + VR || sy > CY + VR || sx + side < CX - VR || sy + side < CY - VR) continue;
        var img = tileImg(z, tx, ty);
        if (!img) continue;
        /* +1 on the size closes the hairline seams that rounding leaves
           between neighbouring tiles. */
        try { ctx.drawImage(img, sx, sy, side + 1, side + 1); drew++; } catch (e) {}
      }
    }
    ctx.restore();
    tileStats.drawn = drew;
    return drew > 0;
  }

  /* Returns true when a photograph was actually painted, because the caller has
     to credit it if so. */
  function drawMap(CX, CY, VR, alpha) {
    if (alpha <= 0 || !pos || focusLat == null) return false;
    var rec = mapFor(pos.lat, pos.lon);
    if (!rec) return false;

    var half = mapHalfMetres(pos.lat, rec.z);          // ground metres, half image
    var px = VR * (half / (viewKm() * 1000));          // the same ground, in pixels
    ctx.save();
    ctx.globalAlpha = alpha;
    try { ctx.drawImage(rec.img, CX - px, CY - px, px * 2, px * 2); }
    catch (e) { ctx.restore(); return false; }
    ctx.restore();
    return true;
  }

  function ensureLocalDots() {
    /* Kept while zooming out, not dropped the instant the pointer leaves. The
       focus clears immediately but the zoom takes a couple of seconds to come
       back, and swapping to the 220km grid at zoom 5 empties the land out
       halfway through the animation. */
    if (zoom < 1.6 || dotAlpha() <= 0) {
      if (localDots) { localDots = null; localKey = ''; }
      return;
    }
    if (focusLat == null) return;
    /* Bucketed so a smooth zoom rebuilds a handful of times, not every frame —
       and bucketed on a LOG scale, because half-unit steps are a rebuild per
       frame once the zoom is in the hundreds. Half an octave means about a
       dozen rebuilds across the whole run in, whatever the depth. */
    var oct = Math.round(Math.log(Math.max(1, zoom)) / Math.LN2 * 2) / 2;
    var bucket = Math.max(1, Math.pow(2, oct));
    var key = focusLat.toFixed(2) + ',' + focusLon.toFixed(2) + '@' + bucket;
    if (key === localKey) return;
    localKey = key;

    var span = Math.asin(Math.min(1, 1 / bucket)) * 180 / Math.PI * 1.15;
    var step = Math.max(0.004, span / 55);
    var latMin = Math.max(-89, focusLat - span), latMax = Math.min(89, focusLat + span);
    var out = [];
    for (var la = latMin; la <= latMax; la += step) {
      var k = Math.max(0.02, Math.cos(la * Math.PI / 180));
      var lonSpan = Math.min(180, span / k);
      for (var lo = focusLon - lonSpan; lo <= focusLon + lonSpan; lo += step / k) {
        if (!onLand(lo, la)) continue;
        var rla = la * Math.PI / 180, rlo = lo * Math.PI / 180;
        out.push([Math.cos(rla) * Math.sin(rlo), Math.sin(rla), Math.cos(rla) * Math.cos(rlo)]);
        if (out.length > 9000) { la = latMax + 1; break; }   // a hard ceiling on the work
      }
    }
    localDots = out.length ? out : null;
  }

  /* ==========================================================================
     STATE
     ========================================================================== */
  var layer, cv, ctx, marker, label, hoverEl, geoBtn, hostEl;
  var W = 0, H = 0, DPR = 1;
  var spin = 0, spinSpeed = 0.06;        // radians per second
  var tilt = -0.28;
  var paused = false, hovering = false;
  var zoom = 1, zoomTarget = 1;
  var focusLat = null, focusLon = null;  // where a zoom is heading
  var pos = null;                        // the visitor's real location
  var pointer = null;
  var raf = 0, last = 0;

  /* ==========================================================================
     WHERE THE GLOBE SITS
     ==========================================================================
     Measured against the headline rather than fixed as a fraction of the
     width. A globe centred at 0.66W put its left edge at 535px while the word
     "channel" ran to 755px — and that word is teal, on a near-black sphere, so
     in the light theme the headline simply lost a word. Nothing about the
     canvas can be blamed for that; the geometry has to know where the words
     end.

     The centre is what stays fixed, and the sphere is sized so that even at
     full zoom it still clears the words. Pinning the left edge instead was the
     obvious alternative and it is wrong: the disc then grows rightwards and
     carries its own centre off the side of the screen, taking the visitor's
     red dot — the entire point of the zoom — with it. */
  /* How far the porthole leans in.

     9 was too timid — it put 600km rings on screen against a reference that
     was a street map, which is not "zoomed in" by any reading. 2000 puts a
     patch about six kilometres across in the hole: a neighbourhood, which is
     the scale that was actually asked for.

     What makes that honest is that the land dots get OUT OF THE WAY on the way
     down. They are tested against coastlines traced at about a degree, so
     below roughly 40km across they stop carrying information and start
     inventing it — a solid slab of cyan that looks like terrain and is really
     just "somewhere inside Portugal". Past that the view becomes what it can
     truthfully be: a position fix. Graticule, range rings in real distance, a
     crosshair, the coordinates and the place name. That is meaningful at one
     kilometre or at one hundred, because none of it claims to be a map.

     8000 puts roughly a 1.6km-wide patch in the hole, which is the framing of
     the reference: a few streets, not a region. It is only worth going this
     close because real imagery arrives to fill it — the dots were faded out
     long before here, and without the Worker's map key this depth shows the
     grid, the rings and the marker and nothing else. */
  var ZOOM_MAX = 8000;
  var baseR = 0, baseCx = 0;

  /* The right-hand edge of the actual ink in the hero.

     Text nodes, not elements. A Range over an element returns a rect per line
     box, and a line box is as wide as the column whatever the words do — the
     h1 here reports 946px of "text" for a line whose glyphs stop at 755. Only
     a Range over a text node measures glyphs. */
  function textRight(host) {
    var max = 0, rng = document.createRange();
    var walk = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        /* Our own overlays live inside the hero too, and they sit on the globe
           by design — measuring them would push the globe away from itself. */
        var p = n.parentElement;
        return p && !p.closest('#ncglobe') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    for (var n = walk.nextNode(); n; n = walk.nextNode()) {
      rng.selectNodeContents(n);
      var rects = rng.getClientRects();
      for (var j = 0; j < rects.length; j++) {
        if (rects[j].width < 2) continue;
        if (rects[j].right > max) max = rects[j].right;
      }
    }
    return max ? max - host.getBoundingClientRect().left : 0;
  }

  function layout() {
    var minSide = Math.min(W, H);
    /* Narrow screens have no room to the side of anything: the hero stacks and
       the globe goes behind it as wallpaper, which the reduced canvas opacity
       in the stylesheet is there to make safe. */
    if (W < 760) {
      baseR = minSide * 0.42;
      baseCx = W * 0.5;
      return;
    }
    var clear = Math.round(textRight(layer.parentElement)) + 28;
    if (!clear || clear > W * 0.75) clear = W * 0.55;   // nothing sane measured
    /* Let it bleed off the right edge — a sphere cropped by the viewport reads
       as bigger than the screen, which is the look this replaced.

       No ZOOM_MAX in here any more. It used to divide the radius and multiply
       the centre, because zooming grew the disc and the layout had to leave
       room for it at full lean. The porthole is a fixed circle, so the only
       question left is how big the circle is — and reserving nine times its
       width put its centre a thousand pixels off the side of the canvas. */
    var span = (W + W * 0.18) - clear;
    baseR = Math.max(minSide * 0.20, Math.min(minSide * 0.40, span / 2));
    baseCx = clear + baseR;
  }

  /* TWO RADII, AND THE DIFFERENCE IS THE WHOLE ZOOM.

       viewR    the circle you see. Fixed. It never changes with zoom, which is
                what "zoom in but do not make it fullscreen" means — the globe
                stays the same size on the page and keeps clear of the
                headline, exactly as it does at rest.

       sphereR  the projected radius of the sphere the maths works on. This is
                what grows. At zoom 9 the sphere is nine times the width of the
                circle showing it, so what fills the circle is a small cap of
                the planet instead of the whole disc.

     Everything is then clipped to viewR. The result is a porthole: same hole,
     much closer view through it. Growing the disc itself was the obvious
     alternative and it is the one the request ruled out — a sphere at zoom 9
     with nothing clipping it is a navy rectangle over the entire hero. */
  function radius() { return baseR * zoom; }   // the sphere: what project() uses
  function viewR() { return baseR; }           // the porthole: what you see
  function cx() { return baseCx; }
  function cy() { return H * 0.52; }

  /* ==========================================================================
     PROJECTION — the single source of truth for the dots and the marker
     ========================================================================== */
  function project(lat, lon) {
    var la = lat * Math.PI / 180, lo = lon * Math.PI / 180 + spin;
    var x = Math.cos(la) * Math.sin(lo);
    var y = Math.sin(la);
    var z = Math.cos(la) * Math.cos(lo);
    var y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
    var z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    var R = radius();
    return { x: cx() + x * R, y: cy() - y2 * R, z: z2, visible: z2 > 0 };
  }

  function unproject(mx, my) {
    var R = radius();
    /* Outside the porthole is off the globe, whatever the sphere behind it is
       doing. Without this the pointer would still "be on the globe" out in the
       corners of the hero once zoomed, because the sphere by then is wider
       than the screen. */
    var vx = mx - cx(), vy = my - cy(), vr = viewR();
    if (vx * vx + vy * vy > vr * vr) return null;

    var dx = vx / R, dy = -vy / R;
    var d2 = dx * dx + dy * dy;
    if (d2 > 1) return null;
    var dz = Math.sqrt(1 - d2);
    var y = dy * Math.cos(tilt) + dz * Math.sin(tilt);
    var z = -dy * Math.sin(tilt) + dz * Math.cos(tilt);
    var lat = Math.asin(Math.max(-1, Math.min(1, y))) * 180 / Math.PI;
    var lon = (Math.atan2(dx, z) - spin) * 180 / Math.PI;
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;
    return { lat: lat, lon: lon };
  }

  /* ==========================================================================
     DRAW
     ========================================================================== */
  function draw() {
    var R = radius(), VR = viewR(), CX = cx(), CY = cy();
    ctx.clearRect(0, 0, W, H);

    /* atmosphere — around the porthole, not around the sphere. At zoom the
       sphere's own edge is far outside the screen and has no glow to give. */
    var glow = ctx.createRadialGradient(CX, CY, VR * 0.86, CX, CY, VR * 1.35);
    glow.addColorStop(0, 'rgba(0,240,255,0.20)');
    glow.addColorStop(0.45, 'rgba(0,150,255,0.08)');
    glow.addColorStop(1, 'rgba(0,120,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(CX, CY, VR * 1.35, 0, 7); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, VR, 0, 7); ctx.clip();

    /* the ocean sphere, lit from the upper left. Zoomed in, the lighting
       gradient is pinned to the porthole so the patch keeps some shading
       instead of being one flat colour from the middle of a huge sphere. */
    var gR = Math.min(R, VR * 1.6);
    var body = ctx.createRadialGradient(CX - gR * 0.35, CY - gR * 0.4, gR * 0.1, CX, CY, gR);
    body.addColorStop(0, '#123A5E');
    body.addColorStop(0.55, '#0B2038');
    body.addColorStop(1, '#050D18');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(CX, CY, R < VR ? R : VR, 0, 7); ctx.fill();

    /* The photograph arrives as the dots leave, so the two never fight over the
       same ground. Drawn on the sphere fill and under everything else, because
       the grid, the rings and the marker are all annotations ON it. */
    var close = 1 - dotAlpha();
    /* Free tiles first, because they cost nothing and need no key. The Google
       path is only reached if a provider was cleared out deliberately — it is
       the upgrade, not the default. */
    var credit = '';
    var TILES = tileCfg();
    if (TILES && TILES.url) {
      /* Tiles are configured, so tiles are the source — full stop. Falling
         through to Google when a tile is merely still loading would ask a
         Worker that may have no map key for imagery nobody asked it for, and
         then report that missing key as if it were the problem. */
      if (drawTiles(CX, CY, VR, close)) { credit = TILES.credit || ''; mapNote(''); }
    } else if (drawMap(CX, CY, VR, close)) {
      credit = 'Map data ©Google';
    }
    /* The flyover sits on the still, so a frame it has not covered yet still
       shows ground rather than a hole. */
    if (drawAerial(CX, CY, VR, close)) credit = 'Aerial imagery ©Google';
    var showedMap = !!credit;

    /* Graticule spacing follows the zoom. Thirty-degree lines are right for a
       whole planet and meaningless once the view is six degrees wide, where
       the nearest line would be off the edge. */
    var span = viewSpanDeg();                                    // visible half-angle
    var gstep = span > 40 ? 30 : span > 12 ? 10 : span > 4 ? 2 : span > 1.2 ? 0.5
      : span > 0.4 ? 0.2 : span > 0.15 ? 0.05 : span > 0.06 ? 0.02 : 0.01;
    /* ONLY THE WINDOW IN VIEW.
       Drawing the whole sphere's grid at the fine spacing is not slow, it is
       impossible: at a hundredth of a degree that is 16,000 lines of 144,000
       points each, and the first attempt hung the tab hard enough to time out
       the test. The lines that matter are the ones crossing the porthole, so
       the loops are clamped to the patch around the focus and each line is
       sampled across that patch rather than right around the planet. */
    var laMin = -80, laMax = 80, loMin = -180, loMax = 180;
    if (focusLat != null && span < 40) {
      var pad = span * 1.4;
      laMin = Math.max(-89, focusLat - pad);
      laMax = Math.min(89, focusLat + pad);
      var kk = Math.max(0.02, Math.cos(focusLat * Math.PI / 180));
      var lpad = Math.min(180, pad / kk);
      loMin = focusLon - lpad;
      loMax = focusLon + lpad;
    }
    /* Snap to the grid so the lines are at round coordinates, not offset by
       wherever the visitor happens to live. */
    laMin = Math.ceil(laMin / gstep) * gstep;
    loMin = Math.ceil(loMin / gstep) * gstep;
    /* A fixed sample count per line: enough to be smooth, bounded whatever the
       zoom does. */
    var latArc = Math.max((loMax - loMin) / 90, 0.0001);
    var lonArc = Math.max((laMax - laMin) / 90, 0.0001);

    /* The grid carries the whole picture once the dots have gone, so it comes
       up as they fade. At 0.07 over a whole planet it is a hint behind the
       land; at that strength over an empty close-up it is nothing at all. */
    var gAlpha = 0.07 + (1 - dotAlpha()) * 0.11;
    ctx.strokeStyle = 'rgba(0,240,255,' + gAlpha.toFixed(3) + ')';
    ctx.lineWidth = 1;
    for (var la = laMin, gi = 0; la <= laMax && gi < 200; la += gstep, gi++) {
      ctx.beginPath();
      var started = false;
      for (var lo = loMin; lo <= loMax; lo += latArc) {
        var p = project(la, lo);
        if (!p.visible) { started = false; continue; }
        started ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), started = true);
      }
      ctx.stroke();
    }
    for (var lo2 = loMin, gj = 0; lo2 <= loMax && gj < 200; lo2 += gstep, gj++) {
      ctx.beginPath();
      var st2 = false;
      for (var la2 = laMin; la2 <= laMax; la2 += lonArc) {
        var q = project(la2, lo2);
        if (!q.visible) { st2 = false; continue; }
        st2 ? ctx.lineTo(q.x, q.y) : (ctx.moveTo(q.x, q.y), st2 = true);
      }
      ctx.stroke();
    }

    /* land dots — z gives both the brightness and the size, which is what
       makes the near face read as nearer. Close in, the two-degree world grid
       is 220km between dots and would show four of them, so a finer grid is
       built for the patch actually on screen. */
    var pts = localDots || DOTS;
    var ct = Math.cos(tilt), stt = Math.sin(tilt), cs = Math.cos(spin), ss = Math.sin(spin);
    var dotScale = localDots ? VR * 0.010 : R * 0.006;
    var fade = dotAlpha();
    for (var i = 0; fade > 0 && i < pts.length; i++) {
      var d = pts[i];
      /* rotate about the pole, then lean */
      var x = d[0] * cs + d[2] * ss;
      var z0 = -d[0] * ss + d[2] * cs;
      var y = d[1];
      var z = y * stt + z0 * ct;
      if (z <= 0.02) continue;
      var y2 = y * ct - z0 * stt;
      var sx = CX + x * R, sy = CY - y2 * R;
      /* cheap reject: most of a fine local grid still lands outside the hole */
      if (sx < CX - VR || sx > CX + VR || sy < CY - VR || sy > CY + VR) continue;
      var a = 0.25 + z * 0.75;
      /* Close in, every dot is the same brightness and the land arrives as one
         flat slab of cyan with a ruled edge. A fixed per-point wobble — derived
         from the coordinates, so it does not shimmer between frames — breaks
         that up into something that reads as ground. It is texture, not data:
         the outlines underneath are traced at about a degree and this does not
         pretend to know anything finer. */
      if (localDots) {
        var n = (d[0] * 12.9898 + d[1] * 78.233 + d[2] * 37.719) * 43758.5453;
        a *= 0.55 + 0.45 * Math.abs(n - Math.floor(n));
      }
      ctx.fillStyle = 'rgba(64,226,255,' + (a * fade).toFixed(3) + ')';
      var s = Math.max(0.7, dotScale * (0.55 + z * 0.65));
      ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
    }

    /* Range rings, once close enough for a distance to mean something. They
       are what turns a field of dots into a place: something to read the scale
       against. */
    if (span < 12) drawRings(CX, CY, R, VR, span);

    /* CREDIT WHERE IT IS REQUIRED.
       Google's imagery carries its own credit in the corner and the terms say it
       has to stay visible. A circular window crops corners, so the credit is
       reprinted inside the window instead. This is a licence condition, not
       decoration — if the imagery is showing, this line shows with it. */
    if (showedMap) {
      ctx.font = '10px Geist,Inter,system-ui,sans-serif';
      var cw = ctx.measureText(credit).width;
      var cyPos = CY + VR * 0.86;
      ctx.fillStyle = 'rgba(4,8,16,0.62)';
      ctx.fillRect(CX - cw / 2 - 6, cyPos - 11, cw + 12, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(credit, CX - cw / 2, cyPos);
    }

    ctx.restore();

    /* limb — the porthole's own rim */
    ctx.strokeStyle = 'rgba(0,240,255,0.30)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(CX, CY, VR, 0, 7); ctx.stroke();

    placeMarker();
  }

  /* Circles of true ground distance around the focus, labelled. The Earth's
     mean radius in km turns the sphere's angles into something a person can
     picture. */
  /* Distances read in metres once kilometres stop being the useful unit —
     "0.5km" is a worse label than "500m" on a view two kilometres across. */
  function distLabel(km) {
    if (km >= 1) return (km < 10 ? +km.toFixed(1) : Math.round(km)) + 'km';
    return Math.round(km * 1000) + 'm';
  }

  function drawRings(CX, CY, R, VR, span) {
    if (focusLat == null) return;
    var maxKm = span * Math.PI / 180 * EARTH_KM;
    /* one-two-five, so the labels are always round numbers */
    var step = Math.pow(10, Math.floor(Math.log(maxKm / 3) / Math.LN10));
    if (maxKm / step > 15) step *= 5; else if (maxKm / step > 6) step *= 2;
    if (!(step > 0) || !isFinite(step)) return;

    ctx.strokeStyle = 'rgba(255,46,77,0.20)';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px ui-monospace,monospace';
    ctx.lineWidth = 1;
    for (var km = step, guard = 0; km <= maxKm && guard < 24; km += step, guard++) {
      var rad = km / EARTH_KM;              // angular distance
      var px = Math.sin(rad) * R;           // orthographic: sin of the angle
      if (px > VR) break;
      ctx.beginPath(); ctx.arc(CX, CY, px, 0, 7); ctx.stroke();
      ctx.fillText(distLabel(km), CX + 4, CY - px - 3);
    }

    /* A crosshair on the focus. Once the dots have faded there is nothing else
       marking the middle, and a ring with no centre is just a circle. */
    if (dotAlpha() < 0.6) {
      var arm = Math.min(VR * 0.06, 22);
      ctx.strokeStyle = 'rgba(255,46,77,0.45)';
      ctx.beginPath();
      ctx.moveTo(CX - arm, CY); ctx.lineTo(CX - arm * 0.3, CY);
      ctx.moveTo(CX + arm * 0.3, CY); ctx.lineTo(CX + arm, CY);
      ctx.moveTo(CX, CY - arm); ctx.lineTo(CX, CY - arm * 0.3);
      ctx.moveTo(CX, CY + arm * 0.3); ctx.lineTo(CX, CY + arm);
      ctx.stroke();
    }
  }

  function placeMarker() {
    if (!pos || !marker) return;
    var p = project(pos.lat, pos.lon);
    marker.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';

    /* The label sits to the right of the dot, except when the dot is near the
       right edge — zoomed in it is at the centre of a porthole that bleeds off
       the side of the screen, and "You are here" was being written off the edge
       of the page. Then it goes to the left instead. */
    var flip = p.x + 15 + label.offsetWidth > W - 8;
    label.style.transform = 'translate(' + (flip ? p.x - 15 - label.offsetWidth : p.x + 15) +
      'px,' + p.y + 'px) translateY(-50%)';

    /* Outside the porthole the dot is not on the visible face, even though the
       sphere still has a point there. */
    var dx = p.x - cx(), dy = p.y - cy(), vr = viewR();
    var inHole = dx * dx + dy * dy <= vr * vr;
    marker.classList.toggle('on', p.visible && inHole);
    label.classList.toggle('on', p.visible && inHole);
  }

  /* ==========================================================================
     LOOP
     ========================================================================== */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;

    /* The globe stops while the pointer is on it. It span forever before,
       which made reading a label or aiming at a country a moving target. */
    /* The idle drift is a whole-globe speed, and it stays one. Left running
       while zoomed it is 0.06 rad/s across a sphere two and a half million
       pixels wide — a street strobing past at 165,000 pixels a second. So it
       is divided by the zoom, which holds it at the same speed on screen, and
       switched off entirely past 2×: by then the reader is reading a place
       rather than watching a planet, and a view they chose should stay put. */
    if (!paused && !hovering && !dragging && zoom < 2) spin += spinSpeed * dt / zoom;

    /* Ease towards whatever zoom was asked for, and towards the focus point
       so the location rotates into view rather than jumping there. */
    var before = { spin: spin, tilt: tilt, zoom: zoom };

    /* The throw. Flick and let go and the planet carries on turning, losing
       most of its speed each second, the way a real one on a spindle would
       not — but the way every map anyone has dragged does. */
    /* The stop threshold is in pixels of travel, not radians. A fixed radian
       cutoff looked right on the whole globe and killed the throw dead at
       street zoom, where the sphere is millions of pixels across and a real
       flick is a ten-thousandth of a radian. Below eight pixels a second is
       stopped at any zoom, which is the only definition that means anything
       to the person watching. */
    var stop = 8 / Math.max(1, radius());
    if (manual && !dragging && (Math.abs(vSpin) > stop || Math.abs(vTilt) > stop)) {
      spin += vSpin * dt;
      tilt = clampTilt(tilt + vTilt * dt);
      var decay = Math.pow(0.045, dt);
      vSpin *= decay; vTilt *= decay;
    }

    if (Math.abs(zoom - zoomTarget) > 0.001) zoom += (zoomTarget - zoom) * Math.min(1, dt * 3.4);
    else zoom = zoomTarget;
    if (dragging || manual) {
      /* A hand is on it, or was a moment ago. Nothing else may move it:
         two easings pulling the same two numbers is the fight the reader
         always loses. */
    } else if (focusLon != null) {
      var want = -focusLon * Math.PI / 180;
      var diff = want - spin;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      /* An exponential ease never actually arrives, and a globe that keeps
         creeping by a fifth of a degree a second has not stopped — it is just
         stopping slowly, which is the thing that was wrong with it before.
         Close enough is snapped to exact. */
      if (Math.abs(diff) < 0.0015) spin = want;
      else spin += diff * Math.min(1, dt * 4.5);
      /* The full latitude, not a fraction of it: leaning only 85% of the way
         leaves the dot above the centre of the disc and the readout naming
         somewhere six degrees south of home. The clamp is still there so a
         visitor in Tromsø gets a steep view rather than a pole-on disc. */
      var wantTilt = Math.max(-1.15, Math.min(1.15, focusLat * Math.PI / 180));
      var dTilt = wantTilt - tilt;
      if (Math.abs(dTilt) < 0.0015) tilt = wantTilt;
      else tilt += dTilt * Math.min(1, dt * 4.5);
    } else {
      tilt += (-0.28 - tilt) * Math.min(1, dt * 2);
    }
    /* Still turning under a stationary pointer, so re-read what is now
       beneath it. The lookup itself is debounced and cached, so this costs
       one unproject per frame and no extra network. */
    if (spin !== before.spin || tilt !== before.tilt || zoom !== before.zoom) readPointer();
    ensureLocalDots();
    draw();
  }

  /* ==========================================================================
     LOCATION
     ========================================================================== */
  function savePos(p) {
    pos = p;
    try { localStorage.setItem('nc_geo', JSON.stringify(p)); } catch (e) {}
    if (geoBtn) geoBtn.remove();
    placeMarker();
  }

  function askLocation(auto) {
    if (!navigator.geolocation || !isSecureContext) return;
    navigator.geolocation.getCurrentPosition(function (g) {
      savePos({ lat: g.coords.latitude, lon: g.coords.longitude });
    }, function (err) {
      if (!geoBtn) return;
      geoBtn.textContent = err.code === 1 ? 'Location permission denied'
        : err.code === 3 ? 'Timed out — tap to retry' : 'Location unavailable';
      if (err.code !== 1) setTimeout(function () { geoBtn.textContent = 'Show me on the globe'; }, 3000);
    }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 });
  }

  /* ==========================================================================
     HOVER: name the place, and pull the visitor's own location into view
     ========================================================================== */
  var hoverTimer, lastKey = '', cache = new Map();

  /* Naming the place is a nicety on top of the coordinates, so it is never
     allowed to be the reason the box says nothing. It had no timeout: a
     geocoder that is blocked, rate-limited or simply slow left a fetch pending
     and the readout stuck on "Locating…" with no way out — which is exactly
     what it did on the live site. Now it gives up after six seconds and the
     coordinates stand on their own.

     A failure is cached like any other answer. Retrying a dead endpoint every
     time the pointer moves a tenth of a degree is a request storm nobody
     benefits from. */
  var GEO_TIMEOUT = 6000;

  function lookup(lat, lon, done) {
    var key = lat.toFixed(1) + ',' + lon.toFixed(1);
    if (cache.has(key)) { done(cache.get(key)); return; }

    var settled = false;
    function finish(text) {
      if (settled) return;
      settled = true;
      cache.set(key, text);
      done(text);
    }
    /* A plain timer rather than AbortController: the point is that the UI stops
       waiting, and whether the socket is also torn down is the browser's
       business. This works the same on the older mobile browsers the rest of
       this file is written for. */
    setTimeout(function () { finish(''); }, GEO_TIMEOUT);

    fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' +
      lat.toFixed(4) + '&longitude=' + lon.toFixed(4) + '&localityLanguage=en')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var city = j.city || j.locality || j.principalSubdivision || '';
        var country = j.countryName || '';
        finish(country ? (city ? city + ', ' + country : country) : 'Open ocean');
      })
      .catch(function () { finish(''); });
  }

  /* Where the pointer last was, in layer coordinates. Kept because the globe
     keeps turning after the pointer stops — it is rotating the visitor's own
     location into view — and a readout written once on mousemove would name
     whatever happened to be under the cursor at the moment it arrived, while
     the ground beneath it slid somewhere else entirely. */
  var ptrX = 0, ptrY = 0, ptrIn = false;

  /* ==========================================================================
     DRAGGING IT
     ==========================================================================
     Grab the globe and turn it: left and right around the pole, up and down
     over them.

     The mapping is one line each, and it is exact rather than tuned. In an
     orthographic projection a point at angle θ from the centre lands R·sin(θ)
     from the centre, so for small moves a drag of d pixels IS a rotation of
     d/R radians. That single fact makes the drag feel right at every zoom for
     free: R grows with the zoom, so the same finger movement that swings a
     continent when you are looking at the whole planet nudges a few hundred
     metres when you are looking at a street. No separate sensitivity setting,
     because there is nothing left to set.

     Tilt is clamped just short of a right angle. Going over the top is not
     wrong mathematically — the sphere is fine with it — but the horizon flips
     and the readout starts naming places behind you, and no one who dragged
     upwards meant to end up looking at the world upside down.
     ========================================================================== */
  var dragging = false, dragMoved = false;
  var lastPX = 0, lastPY = 0;
  var vSpin = 0, vTilt = 0;          // momentum, radians per second
  /* Sticky, and deliberately so. The globe leans in on the visitor's own
     street the first time a pointer touches it, which is the flourish the
     hero was built around — but it re-armed on every re-entry, so the moment
     you dragged out to look at the Pacific and moved the mouse away and back,
     it slammed to 8000× on Sobreda again. You could pan a street and never
     turn a planet. Once someone starts driving, the globe stops grabbing the
     wheel back, for the rest of the visit. */
  var manual = false;
  var TILT_LIMIT = 1.45;             // ~83°, short of the pole

  function clampTilt(v) { return Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, v)); }

  function onDown(e) {
    if (!layer || e.button > 0) return;
    /* Touch is deliberately left out. The layer is pointer-events:none and
       sits behind the hero, so the only way to catch a finger would be to
       swallow the page's own scroll over the whole top of the screen — and on
       a phone the globe is 34% wallpaper behind the words, not a control. */
    if (e.pointerType === 'touch') return;
    /* A button that happens to sit over the disc is a button first. */
    if (e.target && e.target.closest &&
        e.target.closest('a,button,input,select,textarea,label,[role="button"]')) return;
    var r = layer.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    if (!unproject(mx, my)) return;              // not on the globe
    /* Stops the drag from selecting the headline it passes over. */
    if (e.cancelable) e.preventDefault();
    dragging = true; dragMoved = false;
    lastPX = mx; lastPY = my;
    vSpin = vTilt = 0;
    /* Taking hold cancels the lean towards the visitor's own location. Two
       things easing the same numbers at once is a fight the reader loses. */
    manual = true;
    focusLat = focusLon = null;
    setCursor('grabbing');
  }

  /* The layer is pointer-events:none, so a cursor set on it is never used.
     It goes on the hero instead; links and buttons in there carry their own
     cursor from the UA stylesheet, which beats an inherited one. */
  function setCursor(v) {
    if (hostEl) hostEl.style.cursor = v || '';
  }

  function onDrag(e) {
    if (!dragging || !layer) return false;
    var r = layer.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    var dx = mx - lastPX, dy = my - lastPY;
    lastPX = mx; lastPY = my;
    if (!dragMoved && (Math.abs(dx) + Math.abs(dy)) > 2) dragMoved = true;

    var R = radius();
    if (R > 0) {
      var ds = dx / R, dt = dy / R;
      spin += ds;
      tilt = clampTilt(tilt + dt);
      /* Kept for the throw after release. Per-frame deltas are noisy, so this
         is smoothed rather than taken raw. */
      vSpin = vSpin * 0.6 + ds * 0.4 * 60;
      vTilt = vTilt * 0.6 + dt * 0.4 * 60;
    }
    return true;
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    setCursor(hovering ? 'grab' : '');
  }

  /* THE WHEEL, AND WHY ROTATION NEEDED IT.

     Dragging alone turned out to be half a control. Putting the pointer on
     the globe leans it all the way in on the visitor's own street, and at
     that magnification the sphere is millions of pixels wide — so a drag
     pans a few hundred metres of Sobreda, which is lovely, and can never
     reach Japan, which is not what "rotate the earth in every way" asks for.
     The wheel is what puts the whole planet back within reach of a drag.

     Zoom is multiplied, not added: a notch should mean "a bit closer" at
     every scale, and a fixed step that crosses a street would take four
     thousand notches to cross the zoom range. */
  function onWheel(e) {
    if (!layer) return;
    var r = layer.getBoundingClientRect();
    var vx = e.clientX - r.left - cx(), vy = e.clientY - r.top - cy(), vr = viewR();
    if (vx * vx + vy * vy > vr * vr) return;   // off the porthole: the page scrolls
    /* Only now, once we know the wheel was meant for the globe. Swallowing
       every scroll over the hero would trap the reader at the top of the
       page. */
    if (e.cancelable) e.preventDefault();
    manual = true;
    focusLat = focusLon = null;
    /* Roughly a halving per notch. The range is 8000×, or thirteen doublings,
       so a gentler step turns "back out to the whole planet" into forty
       scrolls — which is not a control, it is a chore. */
    var k = e.deltaMode === 1 ? 0.2 : 0.006;      // lines vs pixels
    zoomTarget = Math.max(1, Math.min(ZOOM_MAX, zoomTarget * Math.exp(-e.deltaY * k)));
  }


  function onMove(e) {
    if (!layer) return;
    var r = layer.getBoundingClientRect();
    ptrX = e.clientX - r.left; ptrY = e.clientY - r.top;
    ptrIn = true;
    readPointer();
  }

  function readPointer() {
    if (!layer || !ptrIn) return;
    var mx = ptrX, my = ptrY;
    var hit = unproject(mx, my);

    var wasHovering = hovering;
    /* Mid-drag the pointer regularly leaves the disc — you are pulling a
       continent past the edge, which is the whole point. Dropping out of the
       hover state there would zoom back out from under the hand. */
    if (!dragging) hovering = !!hit;

    if (!dragging) setCursor(hovering ? 'grab' : '');

    /* Pointer on the globe: hold still, and lean in on the visitor's own
       location so the red dot is actually readable. */
    if (dragging || manual) { /* the reader is steering; no automatic lean */ }
    else if (hovering && !wasHovering) {
      /* ZOOM_MAX, not a number picked here: the layout sized the sphere so
         that exactly this much zoom still clears the headline. */
      if (pos) { focusLat = pos.lat; focusLon = pos.lon; zoomTarget = ZOOM_MAX; }
      else zoomTarget = 1 + (ZOOM_MAX - 1) * 0.4;
    } else if (!hovering && wasHovering) {
      focusLat = focusLon = null;
      zoomTarget = 1;
    }

    if (!hit) { if (hoverEl) hoverEl.classList.remove('on'); clearTimeout(hoverTimer); return; }

    hoverEl.classList.add('on');
    /* Same edge problem as the marker's label: the porthole runs off the right
       of the hero, so a box pinned 16px to the right of the pointer is written
       off the page. It goes above-left instead when there is no room. */
    var hw = hoverEl.offsetWidth, hh = hoverEl.offsetHeight;
    var hx = mx + 16 + hw > W - 8 ? mx - 16 - hw : mx + 16;
    var hy = my + 16 + hh > H - 8 ? my - 16 - hh : my + 16;
    hoverEl.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
    var coords = Math.abs(hit.lat).toFixed(2) + (hit.lat >= 0 ? '°N' : '°S') + '  ' +
                 Math.abs(hit.lon).toFixed(2) + (hit.lon >= 0 ? '°E' : '°W');
    var key = hit.lat.toFixed(1) + ',' + hit.lon.toFixed(1);
    if (key !== lastKey) {
      lastKey = key;
      hoverEl.innerHTML = '<b>Locating…</b><span>' + coords + '</span>' + mapNoteHtml();
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () {
        lookup(hit.lat, hit.lon, function (text) {
          if (lastKey !== key) return;
          hoverEl.innerHTML = '<b>' + (text || 'Unknown') + '</b><span>' + coords + '</span>' +
            mapNoteHtml();
        });
      }, 360);
    } else {
      var sp = hoverEl.querySelector('span');
      if (sp) sp.textContent = coords;
    }
  }

  /* ==========================================================================
     SETUP
     ========================================================================== */
  function style() {
    var st = document.createElement('style');
    st.id = 'ncglobe-css';
    st.textContent = [
      '#ncglobe{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}',
      '.hero>*{position:relative;z-index:1}',
      '#ncglobe canvas{position:absolute;inset:0;width:100%;height:100%}',
      /* Below 760px the hero stacks and there is no column to sit beside, so
         the globe goes behind the words. Dark navy under a teal headline is
         unreadable at full strength — this is what makes that safe. */
      '@media (max-width:760px){#ncglobe canvas{opacity:.34}#nchover{display:none}}',
      '#ncglobe .sky{position:absolute;inset:0;background:' +
        'radial-gradient(1100px 700px at 70% 45%,rgba(0,120,255,.10),transparent 65%),' +
        'radial-gradient(800px 600px at 25% 70%,rgba(114,9,183,.12),transparent 68%)}',
      '#ncdot{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;' +
        'background:#FF2E4D;box-shadow:0 0 0 2px rgba(255,255,255,.92),0 0 20px 5px rgba(255,46,77,.8);' +
        'opacity:0;transition:opacity .35s;z-index:2}',
      '#ncdot.on{opacity:1}',
      '#ncdot::after{content:"";position:absolute;inset:-6px;border-radius:50%;' +
        'border:2px solid rgba(255,46,77,.6)}',
      '@media (prefers-reduced-motion:no-preference){' +
        '#ncdot::after{animation:ncping 2.1s cubic-bezier(0,0,.2,1) infinite}' +
        '@keyframes ncping{0%{transform:scale(.6);opacity:.9}70%,100%{transform:scale(2.6);opacity:0}}}',
      '#nclabel{position:absolute;white-space:nowrap;z-index:2;' +
        'font:600 12px/1 Geist,Inter,system-ui,sans-serif;color:#EAF2FF;' +
        'background:rgba(8,11,20,.82);border:1px solid rgba(255,46,77,.5);border-radius:999px;' +
        'padding:5px 10px;opacity:0;transition:opacity .35s;backdrop-filter:blur(8px)}',
      '#nclabel.on{opacity:1}',
      '#nchover{position:absolute;left:0;top:0;z-index:3;pointer-events:none;' +
        'background:rgba(8,11,20,.9);border:1px solid rgba(0,240,255,.42);border-radius:12px;' +
        'padding:7px 11px;font:600 12px/1.35 Geist,Inter,system-ui,sans-serif;color:#EAF2FF;' +
        'white-space:nowrap;opacity:0;transition:opacity .18s;backdrop-filter:blur(10px)}',
      '#nchover.on{opacity:1}',
      '#nchover b{display:block}',
      '#nchover span{color:#8A97B4;font-family:ui-monospace,monospace;font-size:11px}',
      '#ncgeo{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:4;' +
        'pointer-events:auto;font:600 12px/1 Geist,Inter,system-ui,sans-serif;color:#9FB0C8;' +
        'background:rgba(8,11,20,.72);border:1px solid rgba(255,255,255,.15);border-radius:999px;' +
        'padding:8px 15px;cursor:pointer;backdrop-filter:blur(8px)}',
      '#ncgeo:hover{color:#EAF2FF;border-color:rgba(0,240,255,.55)}',
      'html[data-theme="light"] #nchover,html[data-theme="light"] #nclabel{' +
        'background:rgba(255,255,255,.9);color:#14203A}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function resize() {
    var r = layer.getBoundingClientRect();
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
  }

  function init() {
    var host = document.querySelector('.hero') || document.querySelector('header');
    if (!host) return;
    hostEl = host;
    style();

    layer = document.createElement('div');
    layer.id = 'ncglobe';
    layer.setAttribute('aria-hidden', 'true');
    var sky = document.createElement('div'); sky.className = 'sky';
    cv = document.createElement('canvas');
    ctx = cv.getContext('2d');
    marker = document.createElement('div'); marker.id = 'ncdot';
    label = document.createElement('div'); label.id = 'nclabel';
    hoverEl = document.createElement('div'); hoverEl.id = 'nchover';
    layer.appendChild(sky); layer.appendChild(cv);
    layer.appendChild(marker); layer.appendChild(label); layer.appendChild(hoverEl);

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.insertBefore(layer, host.firstChild);
    resize();

    try { pos = JSON.parse(localStorage.getItem('nc_geo') || 'null'); } catch (e) {}
    if (!pos) {
      geoBtn = document.createElement('button');
      geoBtn.id = 'ncgeo'; geoBtn.type = 'button';
      geoBtn.textContent = 'Show me on the globe';
      geoBtn.addEventListener('click', function () {
        geoBtn.textContent = 'Asking your browser…';
        askLocation();
      });
      host.appendChild(geoBtn);
    } else {
      label.textContent = 'You are here';
    }

    /* All three go on the window, not on the layer: #ncglobe is
       pointer-events:none so that the hero's own buttons keep working, which
       means it never sees an event of its own. pointerdown is the one
       listener that cannot be passive — it has to be able to cancel the text
       selection a drag across the headline would otherwise start. */
    addEventListener('pointerdown', onDown);
    /* Turn first, then re-read: the label should name what is under the
       cursor after the drag moved it, not before. */
    addEventListener('pointermove', function (e) { onDrag(e); onMove(e); }, { passive: true });
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('pointerup', onUp, { passive: true });
    addEventListener('pointercancel', onUp, { passive: true });
    /* Released over another window, or over a devtools panel: the pointerup
       never arrives, and without this the globe stays stuck to the cursor. */
    addEventListener('blur', onUp);
    /* Pointer gone from the window entirely: there is nothing under it to
       report, and without this the globe would stay frozen mid-zoom. */
    document.addEventListener('pointerleave', function () {
      if (dragging) return;                      // still holding it, just outside
      ptrIn = false; hovering = false;
      setCursor('');
      /* A reader who drove it somewhere keeps where they drove it. */
      if (!manual) { focusLat = focusLon = null; zoomTarget = 1; }
      if (hoverEl) hoverEl.classList.remove('on');
    });
    addEventListener('resize', function () { resize(); });
    /* The headline is measured in glyphs, and the webfont arrives after first
       paint — so the width it was measured at is not the width it keeps. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(); });

    /* Reduced motion keeps the globe, drops the spin. */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) spinSpeed = 0;

    /* Nothing renders while it cannot be seen. */
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        paused = !es[0].isIntersecting;
      }, { threshold: 0.02 }).observe(host);
    }

    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
  else init();

  window.NCGlobe = {
    project: project, unproject: unproject, dots: function () { return DOTS.length; },
    onLand: onLand, setPos: savePos, state: function () {
      return { spin: spin, tilt: tilt, zoom: zoom, hovering: hovering, pos: pos,
               dragging: dragging, manual: manual, vSpin: vSpin, vTilt: vTilt };
    },
    /* Where the disc actually is. The layout is measured from the headline
       rather than fixed, so nothing outside can assume a fraction of the
       width — including the tests that drive it. */
    geo: function () { return { cx: cx(), cy: cy(), r: radius(), viewR: viewR(), w: W, h: H }; },
    tiles: function () { return { requested: tileStats.requested, drawn: tileStats.drawn, off: tilesOff }; },
    localDots: function () { return localDots ? localDots.length : 0; }
  };
})();
