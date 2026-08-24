/* ============================================================================
   NOVACLIP STICKER LIBRARY
   ============================================================================
   Ninety-six pieces of art the editor and the photo tool can both drop onto a
   canvas: vehicles, animals, food, nature, space, sport, tech and shapes.

   WHY THESE ARE DRAWN, NOT PHOTOGRAPHED

   The obvious way to do this is a folder of PNGs. Three things rule that out.

   1. This is a Store app now, and a Store app is opened on a train. Every
      sticker here is part of the one file the service worker already caches,
      so the whole library works with the plane on. A folder of PNGs is a
      folder of separate requests that each fail on their own.
   2. Ninety-six PNGs at a size that survives being scaled up on a 4K export is
      somewhere north of 15MB. On a phone that is a real download and a real
      chunk of memory. This entire file is around a tenth of that, and it
      renders at any size because the shapes are vectors — a sticker blown up
      to fill a 1080p frame has no pixels to show.
   3. Photographs of cars belong to whoever took them. Drawn shapes do not put
      a thirteen-year-old's channel in front of a copyright claim.

   HOW THE ART IS BUILT

   Every sticker is a 64x64 viewBox and every colour comes from the palette
   below rather than being typed in place, so the set looks like one pack
   instead of ninety-six separate drawings. Flat shapes, one highlight, no
   gradients or filters — that is a style decision AND a speed one: a grid of
   ninety-six gradient-filled SVGs is genuinely slow to scroll on a mid-range
   Android, and flat fills are effectively free.

   HOW IT GETS ONTO THE CANVAS

   Neither host page is modified to understand stickers. The picker turns the
   chosen sticker into an ordinary SVG File and hands it over the way a person
   would: the photo tool gets a drop event on its stage, which it already
   handles, and the editor gets the file put into its own media input. Nothing
   here reaches inside the editor's React bundle, so nothing here breaks when
   that bundle is rebuilt.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_STICKERS_READY) return;
  window.NC_STICKERS_READY = true;

  /* One palette, so a car and a cat look like they came from the same box. */
  var C = {
    red:'#F2555A', orange:'#FF8A3D', yellow:'#FFC53D', lime:'#8FD14F', green:'#3FBF7F',
    teal:'#2FC5B6', blue:'#3B9BFF', indigo:'#6C5CE7', violet:'#A66BFF', pink:'#FF6FAE',
    brown:'#A9714B', tan:'#E0B183', dark:'#2A3142', slate:'#5A6478', grey:'#AFB8CA',
    light:'#EDF1F8', white:'#FFFFFF', black:'#1B2130', gold:'#F5B324', sky:'#BFE4FF'
  };

  /* Shorthand so the shapes below stay readable: p(d, fill) is a path. */
  function p(d, f) { return '<path d="' + d + '" fill="' + f + '"/>'; }
  function c(cx, cy, r, f) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '"/>'; }
  function e(cx, cy, rx, ry, f) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"/>';
  }
  function r(x, y, w, h, rd, f) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="' + rd + '" fill="' + f + '"/>';
  }
  function ln(x1, y1, x2, y2, col, w, cap) {
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + col +
           '" stroke-width="' + (w || 3) + '" stroke-linecap="' + (cap || 'round') + '"/>';
  }

  /* Wheels and windows repeat across most of the vehicles. */
  function wheel(cx, cy) { return c(cx, cy, 7, C.dark) + c(cx, cy, 3, C.grey); }

  var CATS = [
    /* ---------------------------------------------------------------- VEHICLES */
    { id: 'vehicles', name: 'Vehicles', icon: '🚗', items: [
      ['car', 'Car',
        p('M6 40c0-3 2-5 5-5h42c3 0 5 2 5 5v6H6z', C.red) +
        p('M13 35l5-11c1-2 2-3 4-3h20c2 0 3 1 4 3l5 11z', C.red) +
        p('M17 33l4-8c0-1 1-1 2-1h7v9zM34 24h7c1 0 2 0 2 1l4 8H34z', C.sky) +
        wheel(19, 45) + wheel(45, 45)],
      ['sportscar', 'Sports car',
        p('M4 41c0-2 2-4 4-4l8-8c2-2 4-3 7-3h17c3 0 5 1 7 3l8 8c4 0 5 2 5 4v5H4z', C.violet) +
        p('M20 29l4-4h6v6H19zM34 25h5l5 6H34z', C.sky) +
        p('M4 41h56v3H4z', C.indigo) + wheel(17, 45) + wheel(47, 45)],
      ['taxi', 'Taxi',
        p('M6 40c0-3 2-5 5-5h42c3 0 5 2 5 5v6H6z', C.gold) +
        p('M13 35l5-11c1-2 2-3 4-3h20c2 0 3 1 4 3l5 11z', C.gold) +
        p('M17 33l4-8c0-1 1-1 2-1h7v9zM34 24h7c1 0 2 0 2 1l4 8H34z', C.sky) +
        r(26, 14, 12, 6, 2, C.dark) + wheel(19, 45) + wheel(45, 45)],
      ['bus', 'Bus',
        r(6, 14, 52, 32, 6, C.orange) +
        r(11, 20, 18, 12, 2, C.sky) + r(35, 20, 18, 12, 2, C.sky) +
        r(6, 36, 52, 4, 0, C.dark) + wheel(18, 47) + wheel(46, 47)],
      ['truck', 'Truck',
        r(4, 20, 30, 22, 3, C.blue) +
        p('M36 26h12l10 10v6H36z', C.light) +
        p('M40 29h7l6 6h-13z', C.sky) +
        wheel(15, 45) + wheel(49, 45)],
      ['plane', 'Plane',
        p('M32 4c3 0 5 5 5 12v10l20 12v6l-20-6v11l7 6v4l-12-3-12 3v-4l7-6V38L7 44v-6l20-12V16c0-7 2-12 5-12z', C.light) +
        p('M32 4c3 0 5 5 5 12v6h-10v-6c0-7 2-12 5-12z', C.blue)],
      ['helicopter', 'Helicopter',
        p('M14 30c0-6 6-10 14-10h8c8 0 12 5 12 11v5H20c-4 0-6-3-6-6z', C.green) +
        p('M46 33h13v4H46z', C.green) + p('M55 28h4v10h-4z', C.green) +
        r(24, 24, 12, 8, 2, C.sky) +
        ln(8, 16, 56, 16, C.dark, 3) + ln(32, 16, 32, 22, C.dark, 3) +
        ln(20, 44, 44, 44, C.dark, 3) + ln(26, 36, 24, 44, C.dark, 3) + ln(38, 36, 40, 44, C.dark, 3)],
      ['rocket', 'Rocket',
        p('M32 4c8 6 12 16 12 26v10H20V30C20 20 24 10 32 4z', C.light) +
        c(32, 24, 6, C.sky) + c(32, 24, 3, C.blue) +
        p('M20 32L10 44l10-2zM44 32l10 12-10-2z', C.red) +
        p('M26 40h12l-3 8h-6z', C.orange) + p('M29 44h6l-3 8z', C.yellow)],
      ['train', 'Train',
        r(10, 12, 44, 30, 6, C.teal) +
        r(16, 18, 14, 10, 2, C.sky) + r(34, 18, 14, 10, 2, C.sky) +
        r(10, 32, 44, 4, 0, C.dark) +
        r(6, 44, 52, 4, 2, C.slate) + wheel(20, 46) + wheel(44, 46)],
      ['boat', 'Boat',
        p('M8 40h48l-6 12H14z', C.red) +
        p('M30 8h4v30h-4z', C.brown) +
        p('M34 12l16 10-16 8z', C.light) + p('M30 14L16 24l14 6z', C.sky)],
      ['bike', 'Bike',
        '<circle cx="16" cy="40" r="12" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        '<circle cx="48" cy="40" r="12" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        ln(16, 40, 28, 24, C.pink, 4) + ln(28, 24, 48, 40, C.pink, 4) +
        ln(28, 24, 40, 24, C.pink, 4) + ln(40, 24, 48, 40, C.pink, 4) +
        ln(26, 20, 34, 20, C.dark, 4)],
      ['scooter', 'Scooter',
        '<circle cx="14" cy="44" r="8" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        '<circle cx="50" cy="44" r="8" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        p('M14 44h22l6-18h6v-4h-10l-8 18H14z', C.lime) +
        ln(44, 22, 52, 40, C.dark, 4)]
    ]},

    /* ---------------------------------------------------------------- ANIMALS */
    { id: 'animals', name: 'Animals', icon: '🐱', items: [
      ['cat', 'Cat',
        p('M14 22l2-12 12 6zM50 22l-2-12-12 6z', C.orange) +
        c(32, 34, 20, C.orange) +
        c(25, 31, 3, C.dark) + c(39, 31, 3, C.dark) +
        p('M30 38h4l-2 3z', C.pink) +
        ln(12, 36, 22, 38, C.dark, 2) + ln(12, 42, 22, 42, C.dark, 2) +
        ln(52, 36, 42, 38, C.dark, 2) + ln(52, 42, 42, 42, C.dark, 2)],
      ['dog', 'Dog',
        e(15, 30, 7, 13, C.brown) + e(49, 30, 7, 13, C.brown) +
        c(32, 34, 19, C.tan) +
        c(26, 31, 3, C.dark) + c(38, 31, 3, C.dark) +
        e(32, 40, 5, 4, C.dark) + ln(32, 44, 32, 48, C.dark, 2)],
      ['bear', 'Bear',
        c(16, 18, 8, C.brown) + c(48, 18, 8, C.brown) +
        c(32, 34, 20, C.brown) +
        c(25, 31, 3, C.dark) + c(39, 31, 3, C.dark) +
        e(32, 41, 8, 6, C.tan) + e(32, 39, 4, 3, C.dark)],
      ['fox', 'Fox',
        p('M12 18l6 14-8 2zM52 18l-6 14 8 2z', C.orange) +
        p('M32 14c12 0 20 10 20 20 0 8-9 16-20 16s-20-8-20-16c0-10 8-20 20-20z', C.orange) +
        p('M32 34c6 0 10 5 10 9s-5 7-10 7-10-3-10-7 4-9 10-9z', C.light) +
        c(25, 30, 3, C.dark) + c(39, 30, 3, C.dark) + c(32, 40, 3, C.dark)],
      ['panda', 'Panda',
        c(15, 17, 8, C.dark) + c(49, 17, 8, C.dark) +
        c(32, 34, 20, C.white) +
        e(24, 31, 6, 7, C.dark) + e(40, 31, 6, 7, C.dark) +
        c(24, 31, 2, C.white) + c(40, 31, 2, C.white) +
        e(32, 41, 5, 4, C.dark)],
      ['rabbit', 'Rabbit',
        e(24, 16, 5, 13, C.light) + e(40, 16, 5, 13, C.light) +
        e(24, 16, 2, 8, C.pink) + e(40, 16, 2, 8, C.pink) +
        c(32, 40, 16, C.light) +
        c(26, 37, 3, C.dark) + c(38, 37, 3, C.dark) +
        p('M30 44h4l-2 3z', C.pink)],
      ['frog', 'Frog',
        c(20, 20, 9, C.lime) + c(44, 20, 9, C.lime) +
        c(20, 20, 4, C.white) + c(44, 20, 4, C.white) +
        c(20, 20, 2, C.dark) + c(44, 20, 2, C.dark) +
        p('M12 30h40c0 10-9 18-20 18s-20-8-20-18z', C.lime) +
        '<path d="M24 40c4 3 12 3 16 0" stroke="' + C.green + '" stroke-width="3" fill="none" stroke-linecap="round"/>'],
      ['fish', 'Fish',
        p('M6 32c8-12 24-16 36-10 6 3 10 7 12 10-2 3-6 7-12 10-12 6-28 2-36-10z', C.teal) +
        p('M54 32l8-9v18z', C.blue) +
        c(20, 29, 3, C.white) + c(20, 29, 2, C.dark) +
        '<path d="M30 22c4 6 4 14 0 20" stroke="' + C.blue + '" stroke-width="3" fill="none"/>'],
      ['bird', 'Bird',
        c(34, 30, 16, C.blue) +
        p('M18 30c-6-2-10-6-12-10 8-2 12 0 14 4z', C.blue) +
        p('M50 28l10 3-10 4z', C.orange) +
        c(40, 26, 3, C.white) + c(40, 26, 2, C.dark) +
        p('M28 40c6 6 14 6 18 0z', C.indigo) +
        ln(30, 46, 28, 54, C.orange, 3) + ln(40, 46, 42, 54, C.orange, 3)],
      ['butterfly', 'Butterfly',
        p('M30 32C22 14 8 14 8 24s10 16 22 12z', C.violet) +
        p('M34 32c8-18 22-18 22-8s-10 16-22 12z', C.pink) +
        p('M30 34C22 52 8 52 8 42s10-14 22-12z', C.pink) +
        p('M34 34c8 18 22 18 22 8s-10-14-22-12z', C.violet) +
        r(30, 18, 4, 30, 2, C.dark) +
        ln(32, 18, 26, 10, C.dark, 2) + ln(32, 18, 38, 10, C.dark, 2)],
      ['bee', 'Bee',
        e(32, 36, 14, 16, C.gold) +
        p('M19 28h26v5H19zM18 39h28v5H18z', C.dark) +
        e(16, 22, 10, 6, C.sky) + e(48, 22, 10, 6, C.sky) +
        c(27, 32, 2, C.dark) + c(37, 32, 2, C.dark) +
        ln(28, 18, 24, 10, C.dark, 2) + ln(36, 18, 40, 10, C.dark, 2)],
      ['unicorn', 'Unicorn',
        p('M32 6l6 16H26z', C.gold) +
        c(32, 36, 18, C.white) +
        p('M14 26c-4-8 0-14 6-14 2 6 0 10-6 14z', C.pink) +
        p('M50 26c4-8 0-14-6-14-2 6 0 10 6 14z', C.violet) +
        c(26, 34, 3, C.dark) + c(38, 34, 3, C.dark) +
        p('M28 44h8c0 3-2 4-4 4s-4-1-4-4z', C.pink)]
    ]},

    /* ---------------------------------------------------------------- FOOD */
    { id: 'food', name: 'Food', icon: '🍕', items: [
      ['pizza', 'Pizza',
        p('M32 6l24 44H8z', C.tan) +
        p('M32 16l17 30H15z', C.red) +
        c(32, 30, 3, C.white) + c(24, 40, 3, C.white) + c(40, 40, 3, C.white)],
      ['burger', 'Burger',
        p('M10 26c0-10 10-16 22-16s22 6 22 16z', C.tan) +
        r(8, 27, 48, 6, 3, C.lime) +
        r(8, 33, 48, 7, 2, C.brown) +
        r(8, 40, 48, 5, 2, C.gold) +
        p('M10 46h44c0 5-4 8-10 8H20c-6 0-10-3-10-8z', C.tan)],
      ['fries', 'Fries',
        p('M18 22l4-12 4 1-3 11zM28 20l1-13h4l-1 13zM38 21l3-11 4 1-4 11z', C.gold) +
        p('M14 24h36l-4 30H18z', C.red) +
        r(14, 24, 36, 8, 2, C.light)],
      ['hotdog', 'Hot dog',
        p('M8 38c0-8 8-14 24-14s24 6 24 14-8 12-24 12S8 46 8 38z', C.tan) +
        p('M12 34c4-4 12-6 20-6s16 2 20 6c-4 4-12 6-20 6s-16-2-20-6z', C.brown) +
        '<path d="M16 34c4 4 8-4 12 0s8-4 12 0 8-4 10 0" stroke="' + C.yellow +
        '" stroke-width="3" fill="none" stroke-linecap="round"/>'],
      ['donut', 'Donut',
        c(32, 32, 24, C.tan) +
        p('M32 8c13 0 24 11 24 24 0 4-1 7-2 10-4-6-10-4-14-8s-12 0-16-4-2-10-8-12c4-6 10-10 16-10z', C.pink) +
        c(32, 32, 8, C.light) +
        r(20, 20, 5, 2, 1, C.yellow) + r(38, 24, 5, 2, 1, C.teal) + r(28, 14, 5, 2, 1, C.blue)],
      ['icecream', 'Ice cream',
        p('M22 30h20l-10 26z', C.tan) +
        c(24, 24, 9, C.pink) + c(40, 24, 9, C.sky) + c(32, 18, 9, C.light) +
        c(32, 8, 3, C.red)],
      ['cake', 'Cake',
        r(10, 30, 44, 20, 3, C.pink) +
        r(10, 30, 44, 6, 3, C.light) +
        r(30, 16, 4, 12, 1, C.sky) +
        p('M32 10c2 2 3 4 0 6-3-2-2-4 0-6z', C.orange)],
      ['coffee', 'Coffee',
        p('M12 20h34v22c0 6-5 10-12 10H24c-7 0-12-4-12-10z', C.light) +
        p('M12 24h34v6H12z', C.brown) +
        p('M46 24h6c5 0 8 3 8 7s-3 7-8 7h-6z', C.light) +
        '<path d="M22 14c2-3-2-5 0-8M32 14c2-3-2-5 0-8" stroke="' + C.grey +
        '" stroke-width="2" fill="none" stroke-linecap="round"/>'],
      ['boba', 'Boba tea',
        p('M16 20h32l-4 34H20z', C.tan) +
        p('M17 26h30l-3 26H20z', C.brown) +
        r(14, 16, 36, 6, 2, C.light) +
        p('M34 8h5l-3 12h-5z', C.pink) +
        c(24, 46, 3, C.dark) + c(32, 48, 3, C.dark) + c(39, 45, 3, C.dark)],
      ['sushi', 'Sushi',
        r(14, 24, 36, 22, 4, C.white) +
        r(22, 24, 20, 22, 0, C.dark) +
        e(32, 24, 11, 5, C.red) +
        c(18, 34, 2, C.grey) + c(46, 38, 2, C.grey)],
      ['apple', 'Apple',
        p('M32 18c8-6 22-2 22 12 0 12-10 24-16 24-3 0-4-2-6-2s-3 2-6 2c-6 0-16-12-16-24 0-14 14-18 22-12z', C.red) +
        p('M30 18c0-6 2-10 6-12 1 6-1 10-6 12z', C.green) +
        r(30, 8, 3, 10, 1, C.brown)],
      ['banana', 'Banana',
        p('M12 18c0 20 12 32 30 32 8 0 12-2 12-6 0-3-4-2-10-4C30 36 22 28 20 16z', C.gold) +
        p('M14 18c2 16 14 26 28 26 4 0 6 0 6-2s-4-2-8-3C28 36 22 28 20 18z', C.yellow) +
        r(10, 12, 6, 8, 2, C.brown)]
    ]},

    /* ---------------------------------------------------------------- NATURE */
    { id: 'nature', name: 'Nature', icon: '🌤️', items: [
      ['sun', 'Sun',
        c(32, 32, 14, C.gold) +
        ln(32, 4, 32, 12, C.gold, 4) + ln(32, 52, 32, 60, C.gold, 4) +
        ln(4, 32, 12, 32, C.gold, 4) + ln(52, 32, 60, 32, C.gold, 4) +
        ln(12, 12, 18, 18, C.gold, 4) + ln(46, 46, 52, 52, C.gold, 4) +
        ln(52, 12, 46, 18, C.gold, 4) + ln(18, 46, 12, 52, C.gold, 4)],
      ['moon', 'Moon',
        p('M40 6c-14 0-26 11-26 26s12 26 26 26c4 0 8-1 11-3C33 55 24 45 24 32S33 9 51 9c-3-2-7-3-11-3z', C.gold) +
        c(44, 22, 3, C.yellow) + c(50, 34, 2, C.yellow)],
      ['cloud', 'Cloud',
        p('M18 46c-7 0-12-5-12-11s5-11 12-11c2-8 9-14 17-14 10 0 18 8 18 18h1c6 0 11 4 11 10s-5 8-11 8z', C.light)],
      ['rain', 'Rain',
        p('M18 34c-6 0-11-4-11-10s5-10 11-10c2-7 8-12 15-12 9 0 16 7 16 16h1c5 0 10 3 10 8s-5 8-10 8z', C.grey) +
        ln(20, 42, 17, 52, C.blue, 4) + ln(32, 42, 29, 54, C.blue, 4) + ln(44, 42, 41, 52, C.blue, 4)],
      ['snow', 'Snowflake',
        ln(32, 6, 32, 58, C.sky, 4) + ln(9, 19, 55, 45, C.sky, 4) + ln(55, 19, 9, 45, C.sky, 4) +
        ln(32, 14, 25, 20, C.sky, 3) + ln(32, 14, 39, 20, C.sky, 3) +
        ln(32, 50, 25, 44, C.sky, 3) + ln(32, 50, 39, 44, C.sky, 3)],
      ['rainbow', 'Rainbow',
        '<path d="M8 50a24 24 0 0148 0" stroke="' + C.red + '" stroke-width="6" fill="none"/>' +
        '<path d="M14 50a18 18 0 0136 0" stroke="' + C.orange + '" stroke-width="6" fill="none"/>' +
        '<path d="M20 50a12 12 0 0124 0" stroke="' + C.yellow + '" stroke-width="6" fill="none"/>' +
        '<path d="M26 50a6 6 0 0112 0" stroke="' + C.green + '" stroke-width="6" fill="none"/>'],
      ['tree', 'Tree',
        p('M32 4l18 22H14zM32 16l20 24H12z', C.green) +
        p('M32 28l22 20H10z', C.green) +
        r(28, 46, 8, 14, 2, C.brown)],
      ['flower', 'Flower',
        e(32, 18, 8, 12, C.pink) + e(32, 40, 8, 12, C.pink) +
        e(21, 29, 12, 8, C.pink) + e(43, 29, 12, 8, C.pink) +
        c(32, 29, 7, C.gold) +
        ln(32, 42, 32, 60, C.green, 3) + p('M32 50c6-2 10 0 10 4-6 2-9 0-10-4z', C.green)],
      ['leaf', 'Leaf',
        p('M52 8C24 8 10 24 10 40c0 6 2 11 5 14C34 46 40 30 52 8z', C.lime) +
        ln(52, 8, 12, 56, C.green, 3)],
      ['mountain', 'Mountain',
        p('M4 52l18-30 12 18 8-12 18 24z', C.slate) +
        p('M22 22l7 12H15zM50 28l6 8H44z', C.white) +
        c(48, 14, 6, C.gold)],
      ['wave', 'Wave',
        p('M4 34c8-8 14-8 22 0s14 8 22 0 8-6 12-4v26H4z', C.blue) +
        p('M4 44c8-8 14-8 22 0s14 8 22 0 8-6 12-4v16H4z', C.teal)],
      ['fire', 'Fire',
        p('M32 4c2 12 16 14 16 30 0 12-8 22-16 22s-16-10-16-22c0-8 4-12 8-16 0 6 4 8 6 6-2-6-2-14 2-20z', C.orange) +
        p('M32 30c1 6 8 8 8 16 0 6-4 10-8 10s-8-4-8-10c0-6 6-10 8-16z', C.yellow)]
    ]},

    /* ---------------------------------------------------------------- SPACE */
    { id: 'space', name: 'Space', icon: '🚀', items: [
      ['star', 'Star',
        p('M32 4l8 18 20 2-15 14 4 20-17-10-17 10 4-20L4 24l20-2z', C.gold)],
      ['planet', 'Planet',
        c(30, 30, 18, C.violet) +
        '<path d="M18 22c6-3 16-4 22-1M16 36c8 4 22 4 28 0" stroke="' + C.indigo +
        '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="30" cy="34" rx="30" ry="8" fill="none" stroke="' + C.gold +
        '" stroke-width="3" transform="rotate(-18 30 34)"/>'],
      ['saturn', 'Saturn',
        c(32, 30, 16, C.gold) + c(26, 24, 4, C.orange) + c(38, 34, 3, C.orange) +
        '<ellipse cx="32" cy="32" rx="28" ry="7" fill="none" stroke="' + C.tan +
        '" stroke-width="4" transform="rotate(-20 32 32)"/>'],
      ['ufo', 'UFO',
        p('M22 24c0-6 4-10 10-10s10 4 10 10z', C.sky) +
        e(32, 28, 26, 9, C.grey) +
        c(16, 30, 3, C.pink) + c(32, 33, 3, C.lime) + c(48, 30, 3, C.gold) +
        '<path d="M20 34l-8 22h40l-8-22z" fill="' + C.lime + '" opacity=".35"/>'],
      ['astronaut', 'Astronaut',
        c(32, 24, 16, C.light) +
        p('M22 22c0-6 5-10 10-10s10 4 10 10-4 8-10 8-10-2-10-8z', C.dark) +
        '<path d="M26 20c1-3 3-4 5-4" stroke="' + C.sky + '" stroke-width="2" fill="none"/>' +
        r(20, 40, 24, 20, 6, C.light) +
        r(10, 42, 10, 6, 3, C.light) + r(44, 42, 10, 6, 3, C.light) +
        r(28, 46, 8, 6, 2, C.blue)],
      ['comet', 'Comet',
        c(44, 20, 10, C.sky) + c(41, 17, 4, C.white) +
        p('M36 26L6 54l6 2 26-24zM34 22L10 40l1 6 26-18z', C.blue) +
        p('M38 30L18 56l6 1 18-22z', C.teal)],
      ['galaxy', 'Galaxy',
        c(32, 32, 5, C.white) +
        '<path d="M32 12c14 0 22 8 20 18-2 8-12 12-20 12s-18-4-20-12c-2-10 6-18 20-18z" fill="none" stroke="' + C.violet + '" stroke-width="4"/>' +
        '<path d="M32 52c-14 0-22-8-20-18" fill="none" stroke="' + C.pink + '" stroke-width="4"/>' +
        c(12, 18, 2, C.white) + c(54, 46, 2, C.white) + c(50, 14, 2, C.sky)],
      ['satellite', 'Satellite',
        r(26, 26, 12, 12, 2, C.light) +
        r(4, 24, 18, 16, 2, C.blue) + r(42, 24, 18, 16, 2, C.blue) +
        ln(13, 24, 13, 40, C.dark, 2) + ln(51, 24, 51, 40, C.dark, 2) +
        ln(32, 26, 32, 12, C.grey, 3) + c(32, 10, 4, C.grey)],
      ['telescope', 'Telescope',
        p('M10 40l30-20 8 12-30 20z', C.slate) +
        p('M40 20l10-6 6 10-8 8z', C.blue) +
        ln(24, 40, 20, 58, C.brown, 4) + ln(30, 44, 38, 58, C.brown, 4) +
        c(54, 12, 3, C.gold)],
      ['alien', 'Alien',
        p('M32 8c14 0 22 10 22 22 0 14-10 26-22 26s-22-12-22-26c0-12 8-22 22-22z', C.lime) +
        e(23, 30, 6, 8, C.dark) + e(41, 30, 6, 8, C.dark) +
        '<path d="M27 44c3 3 7 3 10 0" stroke="' + C.green + '" stroke-width="3" fill="none" stroke-linecap="round"/>'],
      ['sparkle', 'Sparkle',
        p('M32 4c2 14 12 24 26 28-14 4-24 14-26 28-2-14-12-24-26-28 14-4 24-14 26-28z', C.gold) +
        p('M12 8c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9z', C.yellow)],
      ['blackhole', 'Black hole',
        '<ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="' + C.violet + '" stroke-width="4"/>' +
        '<ellipse cx="32" cy="32" rx="20" ry="7" fill="none" stroke="' + C.indigo + '" stroke-width="4"/>' +
        c(32, 32, 11, C.black) +
        '<circle cx="32" cy="32" r="13" fill="none" stroke="' + C.gold + '" stroke-width="2"/>']
    ]},

    /* ---------------------------------------------------------------- SPORT */
    { id: 'sport', name: 'Sport', icon: '⚽', items: [
      ['football', 'Football',
        c(32, 32, 24, C.white) +
        p('M32 16l10 7-4 12h-12l-4-12z', C.dark) +
        ln(32, 8, 32, 16, C.dark, 3) + ln(10, 26, 22, 23, C.dark, 3) + ln(54, 26, 42, 23, C.dark, 3) +
        ln(18, 50, 26, 35, C.dark, 3) + ln(46, 50, 38, 35, C.dark, 3)],
      ['basketball', 'Basketball',
        c(32, 32, 24, C.orange) +
        ln(8, 32, 56, 32, C.dark, 3) + ln(32, 8, 32, 56, C.dark, 3) +
        '<path d="M15 15c10 10 10 24 0 34M49 15c-10 10-10 24 0 34" stroke="' + C.dark +
        '" stroke-width="3" fill="none"/>'],
      ['tennis', 'Tennis',
        c(32, 32, 24, C.lime) +
        '<path d="M14 15c8 8 8 26 0 34M50 15c-8 8-8 26 0 34" stroke="' + C.white +
        '" stroke-width="3" fill="none"/>'],
      ['trophy', 'Trophy',
        p('M18 8h28v16c0 8-6 14-14 14s-14-6-14-14z', C.gold) +
        p('M18 12h-8c0 8 4 12 8 13zM46 12h8c0 8-4 12-8 13z', C.gold) +
        r(28, 38, 8, 8, 1, C.gold) + r(20, 46, 24, 6, 2, C.tan) +
        p('M32 14l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z', C.white)],
      ['medal', 'Medal',
        p('M20 4l8 20h-8L12 6zM44 4l-8 20h8l8-18z', C.red) +
        c(32, 40, 16, C.gold) + c(32, 40, 11, C.yellow) +
        p('M32 32l2 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z', C.gold)],
      ['skateboard', 'Skateboard',
        p('M6 30c0-4 4-6 10-6h32c6 0 10 2 10 6s-4 6-10 6H16c-6 0-10-2-10-6z', C.violet) +
        c(18, 44, 6, C.dark) + c(46, 44, 6, C.dark) +
        c(18, 44, 3, C.grey) + c(46, 44, 3, C.grey) +
        r(15, 36, 6, 4, 1, C.slate) + r(43, 36, 6, 4, 1, C.slate)],
      ['surfboard', 'Surfboard',
        p('M32 2c12 12 16 34 8 48-3 6-5 12-8 12s-5-6-8-12C16 36 20 14 32 2z', C.teal) +
        ln(32, 10, 32, 54, C.white, 3) +
        p('M32 20c4 6 4 14 0 20-4-6-4-14 0-20z', C.gold)],
      ['dumbbell', 'Dumbbell',
        r(24, 28, 16, 8, 2, C.slate) +
        r(14, 22, 8, 20, 3, C.dark) + r(42, 22, 8, 20, 3, C.dark) +
        r(6, 26, 8, 12, 3, C.slate) + r(50, 26, 8, 12, 3, C.slate)],
      ['target', 'Target',
        c(32, 32, 24, C.red) + c(32, 32, 17, C.white) +
        c(32, 32, 10, C.red) + c(32, 32, 4, C.white) +
        ln(38, 26, 58, 8, C.gold, 3) + p('M52 4l8 2-2 8z', C.gold)],
      ['flag', 'Flag',
        r(12, 6, 4, 52, 2, C.slate) +
        p('M16 10h34l-7 10 7 10H16z', C.red)],
      ['stopwatch', 'Stopwatch',
        r(26, 4, 12, 6, 2, C.slate) +
        c(32, 36, 22, C.light) + c(32, 36, 17, C.white) +
        ln(32, 36, 32, 24, C.dark, 3) + ln(32, 36, 41, 40, C.red, 3) +
        c(32, 36, 3, C.dark) + r(48, 12, 8, 6, 2, C.slate)],
      ['whistle', 'Whistle',
        p('M8 26h26l14-6v24l-14-6H8z', C.orange) +
        c(20, 32, 7, C.red) + c(20, 32, 3, C.dark) +
        '<path d="M48 20c8 0 12 4 12 12s-4 12-12 12" fill="none" stroke="' + C.slate + '" stroke-width="3"/>']
    ]},

    /* ---------------------------------------------------------------- TECH */
    { id: 'tech', name: 'Tech', icon: '🎮', items: [
      ['phone', 'Phone',
        r(18, 4, 28, 56, 6, C.dark) + r(21, 10, 22, 42, 2, C.sky) +
        r(28, 54, 8, 3, 2, C.slate)],
      ['laptop', 'Laptop',
        r(12, 12, 40, 28, 3, C.dark) + r(15, 15, 34, 22, 2, C.sky) +
        p('M6 42h52l4 8H2z', C.grey)],
      ['camera', 'Camera',
        r(6, 18, 52, 34, 6, C.dark) +
        p('M22 12h20l4 6H18z', C.dark) +
        c(32, 35, 13, C.slate) + c(32, 35, 9, C.sky) + c(32, 35, 4, C.dark) +
        c(50, 26, 3, C.gold)],
      ['headphones', 'Headphones',
        '<path d="M10 40V32a22 22 0 0144 0v8" fill="none" stroke="' + C.dark + '" stroke-width="5"/>' +
        r(4, 36, 12, 20, 5, C.violet) + r(48, 36, 12, 20, 5, C.violet)],
      ['mic', 'Microphone',
        r(24, 4, 16, 30, 8, C.violet) +
        '<path d="M16 30a16 16 0 0032 0" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        ln(32, 46, 32, 54, C.dark, 4) + ln(22, 56, 42, 56, C.dark, 4)],
      ['tv', 'TV',
        r(6, 10, 52, 36, 5, C.dark) + r(10, 14, 44, 28, 3, C.sky) +
        ln(24, 52, 32, 46, C.slate, 4) + ln(40, 52, 32, 46, C.slate, 4)],
      ['controller', 'Controller',
        p('M14 22h36c8 0 12 8 12 16s-4 12-9 12c-4 0-6-4-9-6H18c-3 2-5 6-9 6-5 0-9-4-9-12s4-16 12-16z', C.slate) +
        r(15, 30, 4, 12, 1, C.dark) + r(11, 34, 12, 4, 1, C.dark) +
        c(45, 32, 3, C.red) + c(51, 38, 3, C.lime) + c(39, 38, 3, C.gold) + c(45, 44, 3, C.blue)],
      ['wifi', 'Wi-Fi',
        '<path d="M8 26a34 34 0 0148 0" fill="none" stroke="' + C.blue + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M17 36a22 22 0 0130 0" fill="none" stroke="' + C.blue + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M25 45a11 11 0 0114 0" fill="none" stroke="' + C.blue + '" stroke-width="5" stroke-linecap="round"/>' +
        c(32, 54, 4, C.blue)],
      ['battery', 'Battery',
        '<rect x="6" y="20" width="46" height="24" rx="5" fill="none" stroke="' + C.dark + '" stroke-width="4"/>' +
        r(11, 25, 26, 14, 2, C.lime) + r(54, 27, 5, 10, 2, C.dark)],
      ['bulb', 'Light bulb',
        c(32, 26, 16, C.gold) +
        p('M24 38h16v6H24z', C.grey) + r(25, 44, 14, 4, 1, C.slate) + r(27, 48, 10, 4, 1, C.slate) +
        ln(32, 4, 32, 0, C.gold, 3)],
      ['robot', 'Robot',
        r(12, 18, 40, 32, 8, C.slate) +
        c(24, 32, 5, C.sky) + c(40, 32, 5, C.sky) + c(24, 32, 2, C.dark) + c(40, 32, 2, C.dark) +
        r(26, 42, 12, 3, 1, C.dark) +
        ln(32, 18, 32, 10, C.slate, 3) + c(32, 8, 4, C.red) +
        r(4, 26, 8, 14, 3, C.grey) + r(52, 26, 8, 14, 3, C.grey)],
      ['gear', 'Gear',
        p('M28 4h8l1 7 6 3 6-4 6 6-4 6 3 6 7 1v8l-7 1-3 6 4 6-6 6-6-4-6 3-1 7h-8l-1-7-6-3-6 4-6-6 4-6-3-6-7-1v-8l7-1 3-6-4-6 6-6 6 4 6-3z', C.grey) +
        c(32, 32, 9, C.dark)]
    ]},

    /* ---------------------------------------------------------------- SHAPES */
    { id: 'shapes', name: 'Shapes', icon: '💬', items: [
      ['heart', 'Heart',
        p('M32 56C10 40 4 30 4 22 4 13 11 8 18 8c6 0 11 4 14 8 3-4 8-8 14-8 7 0 14 5 14 14 0 8-6 18-28 34z', C.red)],
      ['speech', 'Speech bubble',
        p('M8 10h48c3 0 4 2 4 4v26c0 2-1 4-4 4H30l-14 12v-12h-8c-3 0-4-2-4-4V14c0-2 1-4 4-4z', C.white) +
        c(22, 27, 3, C.slate) + c(32, 27, 3, C.slate) + c(42, 27, 3, C.slate)],
      ['thought', 'Thought bubble',
        p('M20 34c-6 0-10-4-10-9s4-9 9-9c1-7 7-12 14-12 8 0 14 6 14 13 5 0 9 4 9 9s-4 8-9 8z', C.white) +
        c(20, 48, 5, C.white) + c(13, 56, 3, C.white)],
      ['bolt', 'Lightning',
        p('M36 2L12 36h14l-6 26 26-36H32z', C.gold)],
      ['crown', 'Crown',
        p('M6 20l10 12 16-22 16 22 10-12v30H6z', C.gold) +
        r(6, 46, 52, 8, 2, C.orange) +
        c(6, 18, 4, C.red) + c(58, 18, 4, C.red) + c(32, 8, 4, C.red)],
      ['gem', 'Gem',
        p('M18 10h28l14 16-28 30L4 26z', C.teal) +
        p('M18 10l-6 16h40l-6-16zM12 26l20 30 20-30z', C.sky) +
        p('M18 10l6 16h16l6-16z', C.white)],
      ['check', 'Tick',
        c(32, 32, 26, C.green) +
        '<path d="M20 33l8 9 16-19" fill="none" stroke="' + C.white +
        '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'],
      ['cross', 'Cross',
        c(32, 32, 26, C.red) +
        ln(22, 22, 42, 42, C.white, 6) + ln(42, 22, 22, 42, C.white, 6)],
      ['burst', 'Burst',
        p('M32 2l6 12 13-6-3 14 14 2-10 10 10 10-14 2 3 14-13-6-6 12-6-12-13 6 3-14-14-2 10-10L2 26l14-2-3-14 13 6z', C.pink)],
      ['arrow', 'Arrow',
        p('M4 26h30V12l26 20-26 20V38H4z', C.blue)],
      ['pin', 'Pin',
        p('M32 4c11 0 20 9 20 20 0 14-20 36-20 36S12 38 12 24c0-11 9-20 20-20z', C.red) +
        c(32, 24, 8, C.white)],
      ['music', 'Music note',
        p('M26 8l28-6v34h-6V10l-16 4v30h-6z', C.violet) +
        e(20, 44, 10, 8, C.violet) + e(42, 38, 8, 6, C.violet)]
    ]}
  ];

  /* Build once. Each sticker's markup is assembled the first time its category
     is opened, not at load — ninety-six strings is cheap, but the DOM nodes
     for ninety-six previews are not, and on a phone that difference is the
     difference between the sheet opening instantly and it hitching. */
  function svgFor(item) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' +
           item[2] + '</svg>';
  }

  /* An SVG File, which is what both host pages already know how to take. */
  function fileFor(item) {
    var markup =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">' +
      item[2] + '</svg>';
    return new File([markup], item[0] + '.svg', { type: 'image/svg+xml' });
  }

  window.NC_STICKERS = { cats: CATS, svgFor: svgFor, fileFor: fileFor, palette: C };
})();
