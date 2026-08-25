/* ============================================================================
   NOVACLIP SERVICE WORKER
   ============================================================================
   Here so NovaClip can be installed — from the browser, and through PWABuilder
   for the Microsoft Store. It is written to be dull on purpose. This site has
   a video editor holding somebody's unsaved project, two live APIs, and
   seventy sound files that play through <audio>; a clever cache is a good way
   to break all three. Reliability first, offline second.

   WHAT IT WILL NOT TOUCH, AND WHY

   Anything that is not a GET. A POST is a thing happening, not a thing to
   keep.

   Anything on another origin. The AI worker, the leaderboard worker, fonts,
   map tiles, the pose model — all of it goes straight to the network, never
   into a cache. That rules out ever serving a stale answer from an API, and
   it means no session or account response can be written to disk here.

   Anything with a Range header. Audio and video are fetched in pieces; a
   cached 206 handed back later is a file that will not play. The sound effects
   and every video in the editor go through this path.

   Anything under /api/. There is nothing there today. There will be one day,
   and by then nobody will remember to come back and add this line.

   HOW THE REST IS SERVED

   Pages: network first. Online, you always get the page that is on the server
   — a stale page is how somebody ends up looking at last week's editor. The
   cached copy is the fallback for when the network is not there, and
   offline.html is the fallback for a page that has never been visited.

   Scripts and styles: network first as well, for the same reason. They pair
   with the HTML, and serving a fresh page beside a script from three deploys
   ago is worse than being a little slower.

   Images and fonts: the cached copy immediately, with a fresh one fetched in
   the background for next time. They are large, they change rarely, and one
   visit behind on a picture costs nobody anything.

   UPDATES

   No skipWaiting on its own. A new worker taking over a page that is already
   open would swap the files under a running editor. It takes over the next
   time the site is opened with nothing else running, which is the boring,
   safe moment. Bump CACHE below to retire everything cached by the old one.
   ============================================================================ */

/* Bump this to invalidate everything the previous version cached. */
/* Bumped whenever what is cached changes shape. v1 shipped before the sticker
   library, the effect previews, the RTL fixes and the new rail — and because
   nothing ever retired it, returning visitors kept being served the old files
   from it. A new name means activate() deletes the old cache outright. */
/* v3 adds the two skins and the two typefaces they are drawn in. A page that
   comes back from the cache in its own colours but with the fallback font is
   a visibly different page, so the fonts belong in the shell beside them. */
const CACHE = 'novaclip-v3';

/* Kept deliberately short: the shell of the site and the things a first
   offline launch cannot do without. Every extra file here is another chance
   for install to fail, and a worker that fails to install is no worker. */
const SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/nova.js',
  '/logo.svg',
  /* Analytics is the page most likely to be opened on a train, and its charts
     came from a CDN until now — which is to say they did not come at all. */
  '/vendor/chart.umd.js',
  /* The sticker art and the effect previews: the editor and the photo tool are
     both offline-capable without them, but both are much less useful. */
  '/stickers.js',
  '/studio-kit.js',
  /* The focus timer is the one page here most likely to be opened with the
     wifi off on purpose. */
  '/study.html',
  '/passkey.js',
  '/locker.js',
  '/rhythm.js',
  '/leaderboard.js',
  '/teenverse.js',
  /* The lock: every page fetches it, so it has to be there offline too. */
  '/guard.js',
  '/biosentinel.js',
  /* The two skins, and the faces they are set in. Without the woff2 files the
     first offline visit falls back to the system sans and the page looks
     wrong rather than merely plain. 50KB for both, once. */
  '/theme-teenverse.css',
  '/theme-biometric.css',
  '/fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  '/fonts/space-grotesk-latin-wght-normal.woff2',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* allSettled, not addAll: addAll rejects the whole install if a single
       file 404s, and then the site has no service worker at all because of
       one missing icon. */
    await Promise.allSettled(SHELL.map(async (url) => {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (res && res.ok) await cache.put(url, res);
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((n) => (n !== CACHE ? caches.delete(n) : null)));
    await self.clients.claim();
  })());
});

/* For a future "a new version is ready — reload?" prompt. Nothing calls it
   yet; it costs four lines and means the page can hand over deliberately
   rather than the worker deciding on its own. */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const IMAGE_OR_FONT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i;
const MEDIA = /\.(?:mp3|wav|ogg|m4a|mp4|webm|mov|glb|gltf)$/i;

self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* Chrome throws on this combination if a worker tries to handle it. */
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;                 // audio/video seeking

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (url.origin !== self.location.origin) return;      // every API and CDN
  if (url.pathname.startsWith('/api/')) return;
  if (MEDIA.test(url.pathname)) return;                 // never worth caching here

  if (req.mode === 'navigate') { event.respondWith(page(req)); return; }
  if (IMAGE_OR_FONT.test(url.pathname)) { event.respondWith(quietly(req)); return; }

  event.respondWith(fresh(req));
});

/* A page: the server's copy when there is a network, the last one seen when
   there is not, and an honest offline page when neither exists. */
async function page(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) keep(req, res.clone());
    return res;
  } catch (e) {
    return (await caches.match(req)) ||
           (await caches.match('/offline.html')) ||
           new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

/* A script or a stylesheet: current if at all possible. */
async function fresh(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) keep(req, res.clone());
    return res;
  } catch (e) {
    const hit = await caches.match(req);
    if (hit) return hit;
    throw e;                    // let the page see the failure it would have seen
  }
}

/* A picture or a font: what we already have, and quietly fetch a fresh one
   for next time. */
async function quietly(req) {
  const hit = await caches.match(req);
  const spare = fetch(req).then((res) => {
    if (res && res.ok) keep(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await spare) ||
         new Response('', { status: 504, statusText: 'Not cached and not reachable' });
}

/* One place that decides what is allowed to be written down. */
function keep(req, res) {
  /* `basic` means same-origin and readable. Anything opaque, redirected or
     partial is left alone. */
  if (!res || res.status !== 200 || res.type !== 'basic') return;
  if ((res.headers.get('cache-control') || '').includes('no-store')) return;
  caches.open(CACHE).then((c) => c.put(req, res)).catch(() => {});
}
