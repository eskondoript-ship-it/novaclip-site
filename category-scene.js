/* A BACKGROUND FOR EVERY CATEGORY, DRAWN RATHER THAN FETCHED.
 * =========================================================
 * The category already lit the site in its own two colours. Colours alone are
 * a tint, not a place — asked for directly, and right: choosing Food should
 * put you somewhere, not just make the page warmer.
 *
 * So each of the nine gets a real scene behind the site, and a written-in
 * category gets one too. Nine SVGs, composed here and handed over as data
 * URIs. Nothing is fetched, nothing is cached, nothing is licensed.
 *
 * WHY NOT PHOTOGRAPHS
 *
 * Nine photographs is nine licences, about two megabytes, and nine decisions
 * about somebody else's copyright made inside a source file. A drawn scene is
 * a few hundred bytes of markup, works offline on the first visit, and cannot
 * ever turn out to be a stock image somebody has to take down.
 *
 * A PHOTOGRAPH STILL WINS WHEN THERE IS ONE. ncCategoryPhoto() in nova.js
 * looks in backgrounds/ first and only falls back to this. Drop a file in and
 * that category uses it instead — see backgrounds/README.md. This is the floor,
 * not the ceiling.
 *
 * HOW THESE ARE MEANT TO BE SEEN
 *
 * Behind a page of text, at about 40% on the dark theme and 26% on the light
 * one. They are drawn for that: big shapes, no fine detail, nothing that needs
 * to be read. Judge one by squinting at it. A scene that is legible at full
 * strength is a scene that will fight the words in front of it.
 */
(function () {
  'use strict';
  if (window.NC_SCENE) return;

  var W = 1600, H = 1000;

  function esc(s) { return s.replace(/#/g, '%23').replace(/"/g, "'").replace(/\n/g, ''); }

  /* Shared shell: the wash both colours make, before the motif goes on top.
     Every scene starts here so the nine feel like one family rather than nine
     unrelated pictures. */
  function shell(a, b, motif) {
    return esc(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" ' +
        'preserveAspectRatio="xMidYMid slice">' +
        '<defs>' +
          '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="' + a + '"/>' +
            '<stop offset="1" stop-color="' + b + '"/>' +
          '</linearGradient>' +
          '<radialGradient id="r1" cx="18%" cy="12%" r="62%">' +
            '<stop offset="0" stop-color="' + a + '" stop-opacity=".95"/>' +
            '<stop offset="1" stop-color="' + a + '" stop-opacity="0"/>' +
          '</radialGradient>' +
          '<radialGradient id="r2" cx="86%" cy="92%" r="60%">' +
            '<stop offset="0" stop-color="' + b + '" stop-opacity=".9"/>' +
            '<stop offset="1" stop-color="' + b + '" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<rect width="' + W + '" height="' + H + '" fill="' + a + '" opacity=".14"/>' +
        '<rect width="' + W + '" height="' + H + '" fill="url(#r1)" opacity=".5"/>' +
        '<rect width="' + W + '" height="' + H + '" fill="url(#r2)" opacity=".45"/>' +
        motif +
      '</svg>'
    );
  }

  /* ---------------------------------------------------------------- motifs
     Each is a handful of large shapes. They are named after what somebody
     would say they can see, not after what they are made of. */
  var MOTIF = {

    /* Hexes and a scatter of lit diamonds. */
    gaming: function (a, b) {
      var out = '<g fill="none" stroke="' + b + '" stroke-width="3" opacity=".30">';
      /* 118, not 74. At 74 this drew about 250 hexagons and the data URI came
         out at 12.6KB — for a pattern that is blurred and sitting at half
         opacity, which is to say for a texture nobody can count. At 118 it is
         a quarter of the polygons, under 4KB, and looks the same once it is
         behind a page. */
      var r = 118, dx = r * 1.732, dy = r * 1.5, row, col, cx, cy, i, pts;
      for (row = -1; row * dy < H + r; row++) {
        for (col = -1; col * dx < W + r; col++) {
          cx = col * dx + (row % 2 ? dx / 2 : 0);
          cy = row * dy;
          pts = [];
          for (i = 0; i < 6; i++) {
            pts.push((cx + r * Math.cos(Math.PI / 180 * (60 * i - 30))).toFixed(0) + ',' +
                     (cy + r * Math.sin(Math.PI / 180 * (60 * i - 30))).toFixed(0));
          }
          out += '<polygon points="' + pts.join(' ') + '"/>';
        }
      }
      out += '</g><g fill="' + a + '" opacity=".55">';
      [[300, 240], [980, 180], [640, 690], [1330, 560], [180, 780]].forEach(function (p) {
        out += '<polygon points="' + p[0] + ',' + (p[1] - 58) + ' ' + (p[0] + 52) + ',' + p[1] +
               ' ' + p[0] + ',' + (p[1] + 58) + ' ' + (p[0] - 52) + ',' + p[1] + '"/>';
      });
      return out + '</g>';
    },

    /* An equaliser, and the wave it is reading. */
    music: function (a, b) {
      var out = '<g fill="' + b + '" opacity=".42">', x, h, i;
      for (i = 0, x = 40; x < W; i++, x += 58) {
        h = 90 + Math.abs(Math.sin(i * 0.7)) * 420;
        out += '<rect x="' + x + '" y="' + (H - h) + '" width="30" height="' + h + '" rx="15"/>';
      }
      out += '</g><path d="M0 430 ';
      for (x = 0; x <= W; x += 40) out += 'L' + x + ' ' + (430 + Math.sin(x / 120) * 110).toFixed(0) + ' ';
      return out + '" fill="none" stroke="' + a + '" stroke-width="7" opacity=".55"/>';
    },

    /* Lane arcs sweeping across, and the ball. */
    sport: function (a, b) {
      var out = '<g fill="none" stroke="' + b + '" stroke-width="10" opacity=".34">', i;
      for (i = 0; i < 7; i++) out += '<path d="M-100 ' + (200 + i * 130) + ' Q 800 ' + (i * 130 - 120) + ' 1750 ' + (260 + i * 130) + '"/>';
      out += '</g><circle cx="1210" cy="300" r="150" fill="none" stroke="' + a + '" stroke-width="12" opacity=".5"/>' +
             '<circle cx="1210" cy="300" r="52" fill="' + a + '" opacity=".4"/>';
      return out;
    },

    /* Hills, and the sun going down behind them. */
    irl: function (a, b) {
      return '<circle cx="1180" cy="300" r="200" fill="' + a + '" opacity=".45"/>' +
        '<path d="M0 720 Q 300 560 620 700 T 1180 660 T 1700 730 L1700 1000 L0 1000Z" fill="' + b + '" opacity=".38"/>' +
        '<path d="M0 830 Q 400 700 780 830 T 1700 800 L1700 1000 L0 1000Z" fill="' + a + '" opacity=".32"/>' +
        '<g fill="none" stroke="' + b + '" stroke-width="4" opacity=".28">' +
        '<path d="M120 250 q 90 -60 180 0"/><path d="M400 170 q 110 -70 220 0"/>' +
        '<path d="M1350 480 q 80 -55 160 0"/></g>';
    },

    /* Ruled paper, and the shapes of a diagram on it. */
    learning: function (a, b) {
      var out = '<g stroke="' + b + '" stroke-width="3" opacity=".26">', y, x;
      for (y = 90; y < H; y += 74) out += '<line x1="70" y1="' + y + '" x2="' + (W - 70) + '" y2="' + y + '"/>';
      out += '<line x1="180" y1="0" x2="180" y2="' + H + '" stroke-width="5"/></g>';
      out += '<g fill="none" stroke="' + a + '" stroke-width="9" opacity=".45">' +
        '<circle cx="1230" cy="330" r="140"/>' +
        '<rect x="330" y="560" width="260" height="260" rx="24"/>' +
        '<path d="M780 830 L920 560 L1060 830 Z"/></g>';
      for (x = 0; x < 3; x++) out += '<circle cx="' + (1180 + x * 90) + '" cy="760" r="26" fill="' + b + '" opacity=".4"/>';
      return out;
    },

    /* Brush strokes, and the paint they came out of. */
    art: function (a, b) {
      return '<g fill="none" stroke-linecap="round" opacity=".45">' +
        '<path d="M120 780 C 380 380 620 900 900 460" stroke="' + a + '" stroke-width="72"/>' +
        '<path d="M420 220 C 760 540 980 160 1480 520" stroke="' + b + '" stroke-width="54"/>' +
        '<path d="M200 500 C 520 700 700 300 1120 780" stroke="' + a + '" stroke-width="30"/>' +
        '</g><g opacity=".4">' +
        '<circle cx="1350" cy="220" r="96" fill="' + b + '"/>' +
        '<circle cx="1480" cy="800" r="132" fill="' + a + '"/>' +
        '<circle cx="250" cy="180" r="64" fill="' + b + '"/></g>';
    },

    /* Looking down into pans on a hob, with things scattered around them. */
    food: function (a, b) {
      var out = '<g opacity=".42">';
      [[430, 480, 250], [1120, 380, 200], [880, 800, 165]].forEach(function (c) {
        out += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="none" stroke="' + b + '" stroke-width="16"/>' +
               '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (c[2] - 46) + '" fill="' + a + '" opacity=".55"/>';
      });
      out += '<rect x="640" y="450" width="330" height="34" rx="17" fill="' + b + '"/>' +
             '<rect x="1290" y="350" width="280" height="30" rx="15" fill="' + b + '"/></g>';
      out += '<g fill="' + a + '" opacity=".38">';
      [[210, 190, 46], [1420, 640, 58], [700, 190, 38], [320, 860, 50], [1180, 900, 42]].forEach(function (c) {
        out += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
      });
      return out + '</g>';
    },

    /* Bursts, and the bubbles the punchlines come out of. */
    comedy: function (a, b) {
      var out = '<g fill="' + b + '" opacity=".4">', i, j, cx, cy, R, rr, pts;
      [[380, 300, 210], [1230, 700, 250], [900, 200, 150]].forEach(function (s) {
        cx = s[0]; cy = s[1]; R = s[2]; pts = [];
        for (i = 0; i < 20; i++) {
          rr = (i % 2 ? R * 0.5 : R);
          pts.push((cx + rr * Math.cos(Math.PI * i / 10)).toFixed(0) + ',' +
                   (cy + rr * Math.sin(Math.PI * i / 10)).toFixed(0));
        }
        out += '<polygon points="' + pts.join(' ') + '"/>';
      });
      out += '</g><g fill="' + a + '" opacity=".38">' +
        '<path d="M980 640 h330 a40 40 0 0 1 40 40 v150 a40 40 0 0 1 -40 40 h-210 l-90 80 v-80 h-30 a40 40 0 0 1 -40 -40 v-150 a40 40 0 0 1 40 -40Z"/>' +
        '<path d="M170 640 h240 a34 34 0 0 1 34 34 v110 a34 34 0 0 1 -34 34 h-150 l-70 62 v-62 h-20 a34 34 0 0 1 -34 -34 v-110 a34 34 0 0 1 34 -34Z"/></g>';
      return out;
    },

    /* Traces on a board, and what they connect. */
    tech: function (a, b) {
      var out = '<g fill="none" stroke="' + b + '" stroke-width="6" opacity=".34">' +
        '<path d="M0 220 H400 L520 340 H900 L1010 230 H1600"/>' +
        '<path d="M0 640 H260 L400 500 H760 L880 640 H1240 L1360 520 H1600"/>' +
        '<path d="M180 1000 V800 L320 660"/><path d="M1120 0 V180 L1250 300"/>' +
        '<path d="M700 1000 V820 L820 700 H1180"/></g>';
      out += '<g fill="' + a + '" opacity=".5">';
      [[400, 340], [900, 340], [1010, 230], [400, 500], [880, 640], [1360, 520], [320, 660], [820, 700]].forEach(function (n) {
        out += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="20"/>';
      });
      out += '</g><g fill="none" stroke="' + a + '" stroke-width="8" opacity=".4">' +
        '<rect x="620" y="380" width="240" height="240" rx="26"/></g>';
      return out;
    },

    /* Everyone who typed their own answer. Deliberately the calmest of the
       nine shapes rather than a tenth theme: it has to sit under "Warhammer
       painting" and "speedcubing" and "Moroccan cooking" without claiming to
       be about any of them. */
    own: function (a, b) {
      return '<g opacity=".4">' +
        '<circle cx="330" cy="280" r="260" fill="' + a + '"/>' +
        '<circle cx="1240" cy="720" r="300" fill="' + b + '"/>' +
        '<circle cx="1120" cy="200" r="150" fill="' + b + '" opacity=".7"/>' +
        '<circle cx="480" cy="820" r="180" fill="' + a + '" opacity=".7"/>' +
        '</g><g fill="none" stroke="' + b + '" stroke-width="5" opacity=".25">' +
        '<path d="M-100 500 Q 400 300 800 520 T 1700 460"/>' +
        '<path d="M-100 620 Q 400 420 800 640 T 1700 580"/></g>';
    }
  };

  /* The finished data URI for a category id and its two colours. `id` may be
     anything: an id with no motif of its own gets `own`, which is what every
     written-in answer lands on. */
  function svg(id, a, b) {
    var m = MOTIF[id] || MOTIF.own;
    return 'data:image/svg+xml;utf8,' + shell(a, b, m(a, b));
  }

  window.NC_SCENE = { svg: svg, has: function (id) { return !!MOTIF[id]; } };
})();
