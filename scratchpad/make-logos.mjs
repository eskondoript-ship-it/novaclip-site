/* One mark, three colourways: the Nova explosion.
   ===========================================================================
   Asked for a star explosion, which is lucky, because that is what a nova is —
   the name has been describing the shape all along.

   Written as a generator rather than three hand-drawn files so the three sites
   cannot drift apart. The geometry is defined once; a brand supplies four
   colours and one optional cue inside the core. Change the shape here and all
   three change together.

   WHAT IT HAS TO SURVIVE

   A favicon is 16 pixels. Everything clever disappears at that size, so the
   mark is built in layers of decreasing importance: the four-point burst
   carries it alone, the shockwave ring and the debris are there at 64px and
   above, and the fine detail is allowed to vanish. That is why the burst is
   fat-bodied with concave flanks rather than a thin sparkle — a thin sparkle
   at 16px is a smudge.

   Flat colour, no filters: SVG filters are expensive to rasterise at large
   sizes and are dropped outright by some feed readers and email clients. The
   glow is a radial gradient, which is not.
   =========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

const BRANDS = {
  novaclip: {
    file: '/home/user/novaclip-site/logo.svg',
    label: 'NovaClip',
    hot: '#EAFEFF',      // the core, near white
    core: '#2AD7D7',     // the burst body
    edge: '#00BCC5',     // the burst tips and ring
    halo: '#00BCC5',
    /* NovaClip keeps its play triangle, cut out of the core rather than laid
       on top, so the shape still says "video" in one flat colour. */
    cue: 'play'
  },
  novatools: {
    file: '/home/user/novaclip-site/novatools/logo.svg',
    label: 'NovaTools',
    hot: '#EAF0FF',
    core: '#4C7BF0',
    edge: '#2867E4',
    halo: '#2867E4',
    cue: null
  },
  novaclassics: {
    /* Vite copies src/public into the build, so the mark reaches the
       published site instead of sitting in the repo unused. */
    file: '/home/user/novaboomers/src/public/logo.svg',
    label: 'NovaClassics',
    /* Warm rather than electric: this one sits on cream paper beside a serif
       typeface, and a neon burst would look like it had wandered in from a
       different site. */
    hot: '#FDFCF9',
    core: '#7C8C77',
    edge: '#5D6B5D',
    halo: '#8A6A4B',
    cue: null
  }
};

/* ---- the geometry, once -------------------------------------------------- */

/* WHY THIS IS NOT A FOUR-POINT STAR ANY MORE

   The first mark was a single four-point star with concave flanks. That is a
   good shape and it belongs to somebody else: it is what Gemini's logo looks
   like, and a creator tool whose icon reads as another company's AI is a
   branding problem no amount of colour fixes.

   A nova is not a sparkle, it is a detonation. So this is built the way an
   explosion actually looks: a hot core, a crown of rays thrown out at uneven
   lengths, and fragments still travelling beyond them. Sixteen rays rather
   than four, alternating long and short, each nudged off perfect symmetry —
   evenly spaced spokes read as a sun or a wheel, uneven ones read as force.

   The nudge comes from a fixed table rather than Math.random, so every render
   of every brand is identical and re-running this never quietly changes the
   logo. */

const RAYS = 16;

/* Degrees of nudge, cycled. Small enough to stay tidy, big enough to stop the
   crown looking machined. */
const JITTER = [0, 2.6, -1.9, 3.1, -2.5, 1.2, -3.0, 2.1];

function ray(i) {
  const long = i % 2 === 0;
  const deg = i * (360 / RAYS) + JITTER[i % JITTER.length];
  const a = deg * Math.PI / 180;
  const r0 = 9.5;                       // leaves the core, not the centre
  const r1 = long ? 30.5 : 20;          // how far this one was thrown
  const halfWidth = long ? 3.4 : 2.3;   // at the base; the tip is a point
  const spread = halfWidth / r0;        // radians

  const P = (ang, r) =>
    `${(32 + Math.cos(ang) * r).toFixed(2)} ${(32 + Math.sin(ang) * r).toFixed(2)}`;

  return `M${P(a - spread, r0)} L${P(a, r1)} L${P(a + spread, r0)} Z`;
}

function crown() {
  return Array.from({ length: RAYS }, (_, i) => ray(i)).join(' ');
}

/* The stars still travelling: small four-pointed sparks well outside the
   crown. Four points is fine at this size — a two-pixel spark is a spark, and
   it was the big silhouette that was doing the impersonating. */
const SPARKS = [
  { deg: 24, r: 27.5, s: 2.6 }, { deg: 107, r: 29, s: 1.9 },
  { deg: 168, r: 26.5, s: 2.3 }, { deg: 253, r: 28.5, s: 2.0 },
  { deg: 312, r: 26, s: 1.6 }
];

function sparks(colour) {
  return SPARKS.map(({ deg, r, s }) => {
    const a = deg * Math.PI / 180;
    const x = 32 + Math.cos(a) * r, y = 32 + Math.sin(a) * r;
    const f = (n) => n.toFixed(1);
    const d = `M${f(x)} ${f(y - s)} Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)} ` +
              `Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)} ` +
              `Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)} ` +
              `Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)} Z`;
    return `<path d="${d}" fill="${colour}" opacity="0.75"/>`;
  }).join('\n    ');
}

/* The favicon is a different drawing, not the same one scaled.
   At 16 pixels the shockwave ring and the debris are three grey pixels of
   noise sitting on top of the only part that carries the meaning. So the tab
   icon is the burst and the core alone, drawn slightly fatter to hold its
   colour when a browser resamples it. */
function favicon(b) {
  const id = b.label.toLowerCase() + '-f';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32" role="img" aria-label="${b.label}">
  <defs>
    <linearGradient id="${id}" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="${b.core}"/>
      <stop offset="100%" stop-color="${b.edge}"/>
    </linearGradient>
  </defs>
  <path d="${crown()}" fill="url(#${id})"/>
  <circle cx="32" cy="32" r="8.5" fill="${b.hot}"/>
</svg>
`;
}

function svg(b, size = 64) {
  const id = b.label.toLowerCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${b.label}">
  <!-- The Nova mark: a star explosion. Generated by scratchpad/make-logos.mjs —
       edit that, not this, or the three sites drift apart. -->
  <defs>
    <radialGradient id="${id}-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${b.halo}" stop-opacity="0.45"/>
      <stop offset="55%" stop-color="${b.halo}" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="${b.halo}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-body" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="${b.core}"/>
      <stop offset="100%" stop-color="${b.edge}"/>
    </linearGradient>
    ${b.cue === 'play' ? `<mask id="${id}-cut">
      <rect width="64" height="64" fill="#fff"/>
      <path d="M28.7 26.6 L40 32 L28.7 37.4 Z" fill="#000"/>
    </mask>` : ''}
  </defs>

  <!-- the light it throws -->
  <circle cx="32" cy="32" r="31" fill="url(#${id}-halo)"/>

  <!-- the stars still travelling -->
  <g>
    ${sparks(b.edge)}
  </g>

  <!-- the crown of rays and the core: the part that works alone at 16 pixels -->
  <g${b.cue === 'play' ? ` mask="url(#${id}-cut)"` : ''}>
    <path d="${crown()}" fill="url(#${id}-body)"/>
    <circle cx="32" cy="32" r="9.5" fill="${b.hot}"/>
  </g>
</svg>
`;
}

for (const [name, b] of Object.entries(BRANDS)) {
  fs.mkdirSync(path.dirname(b.file), { recursive: true });
  fs.writeFileSync(b.file, svg(b));
  console.log(`${b.label.padEnd(13)} -> ${b.file}`);
  const fav = path.join(path.dirname(b.file), 'favicon.svg');
  fs.writeFileSync(fav, favicon(b));
  console.log(`${''.padEnd(13)}    ${fav}`);
}
