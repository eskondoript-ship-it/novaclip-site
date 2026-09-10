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
/* v4 adds photos.js, and retires a cache full of the pre-phone stylesheets.
   nova.js and jarvis.js are served network-first so they refresh themselves,
   but a returning visitor who goes offline before that happens would get the
   old rail and the old top bar back — which is the whole of the phone work
   undone. A new name is one line and rules that out. */
/* v5 adds the Studio's NexusStream skin and panels. The stylesheet is the
   reason for the bump rather than the script: a returning visitor offline
   would be served the cached analytics.html, which now asks for a stylesheet
   the old cache has never heard of, and a dashboard with the skin's markup
   and none of its CSS is worse than either version on its own. */
/* v6 adds the clip checker and the profile page's crypto helper. */
/* v7 adds avatar.js, and retires a cache holding the old profile page —
   which now asks for a script the v6 cache has never heard of, and would
   come back offline with a picker that does not exist. */
/* v8 adds trends-nav.js. */
/* v9 adds Hype Lab — hype.html and hype.js. The bump matters more than usual
   here: a returning visitor would otherwise get the new rail from the network,
   follow the new Hype Lab link, and land on a page the v8 cache has no entry
   for. */
/* v10: nova.js lost the site-wide typefaces it was injecting, and
   studio-nexus.js/.css gained the Optimize grid. Both are cached shell files,
   so without the bump a returning visitor keeps the old pair — headings still
   in the serif that was removed, and a Studio whose new tab points at a panel
   its cached script does not know how to fill. */
/* v11: trends-nav.js gained the in-app Scripts, Thumbnails and Studio panels,
   and hype.html gained the sidebar layout it was missing. Both are cached
   shell files. Without the bump a returning visitor keeps a rail whose items
   still navigate out of the app, and a Hype Lab whose content sits 872px below
   the fold. */
/* v12: Hype Lab moved into the Trend Spotter as an embedded frame. hype.html
   gained its embed mode and trends-nav.js gained the panel that holds it, and
   both are cached shell files — a returning visitor on v11 would get a rail
   that still navigates away from the app. */
/* v13: Video Ideas became a panel too, so the whole Trend Spotter rail is now
   in-app. trends-nav.js is a cached shell file and the old copy still shows the
   signpost screen. */
/* v14: leaderboard.js now accepts nc_username as a board name and asks for one
   when there is none. It is a cached shell file, and the bump matters here more
   than most: the old copy is the one that drops a score silently, so a
   returning visitor would keep the exact bug this fixes — and would keep it on
   all four game pages, since they share this one file. */
/* v15 adds photo-fx.js — the photo editor's effects library, levels and curves,
   and its five new tools. New file in the shell, so the cache has to be retired
   for it to be fetched at all. */
/* v16 adds media-probe.js. New file in the shell, and the editor asks for it
   before its own bundle — a returning visitor served the v15 cache would get an
   editor.html that requests a script the cache has never heard of. */
/* v17: the logo was redrawn in the site's own colours, both skins gained a
   light mode, and theme-bridge.js is new. logo.svg, the two theme stylesheets
   and the bridge are all cached shell files — without the bump a returning
   visitor keeps the teal mark and a black page inside a white rail, which is
   the exact pair of things this release fixes. */
/* v18: the Gen Z toggle in the top bar took its colours from three literals and
   was unreadable in light mode — 1.78:1 on the half you are being asked to
   click. It reads the palette now. nova.js is a cached shell file, so without
   the bump a returning visitor keeps the unreadable one on every page. */
/* v19 adds nova-guide.js. New file in the shell, and twenty-two pages now ask
   for it — a returning visitor on v18 would get the pages that reference it and
   no file to answer with, which is a help button that does nothing. */
/* v20: shield.html had the rail markup and none of the rail's CSS, so the rail
   laid out in normal flow and pushed the page 872px down — a blank screen with a
   rail on it. Both that page and parent.html carry the fix in their own markup,
   and both are cached, so without the bump a returning visitor keeps the blank
   page and the parent email that forgets itself. */
/* v21: the comment safety scanner read zero comments and printed a green
   "nothing harmful found" over the top of it. parent.html is a cached shell
   file, so without the bump a returning parent keeps a scanner that reports an
   all-clear it has no evidence for — which is the whole reason to bump. */
/* v22: the scanner's diagnostics said the connection was refused, and the
   reason was the scope — youtube.readonly reads the channel but is refused on
   every comment endpoint. analytics.html now asks for youtube.force-ssl too and
   parent.html names that as the cause. Both are cached shell files. */
/* v23: getting the Family Shield stops asking a parent to do a developer's
   chores — the install page builds a ZIP of just the extension and the shield
   announces its own ID, so nothing is copied by hand. shield.html and
   parent.html are both cached, and shield.html also gains Nova. */
/* v24: the AI Editor page's plan is now carried out on the timeline instead of
   printed as a list to work through by hand. Two new shell files, and both
   editor.html and publish.html reference them — a returning visitor on v23
   would get the pages and no files to answer with. */
/* v25: Nova is a character now. The guide's scan used to fly the assistant
   PILL into the middle of the screen; nova-mascot.js draws her instead, and the
   pill is left where the reader put it. The Publish page is the AI Editor —
   renamed in the rail, the tab title, the guide and all twenty languages.
   New shell file, twenty-three pages reference it, and nova.js carries the
   rename, so a returning visitor on v24 would get the old name and no mascot. */
/* v26: the AI Editor did not edit, because the CLIP never crossed. The plan
   went from one page to the other and the video stayed behind as a local
   variable, so the timeline was empty and the panel said "import your clip
   first" — a feature that appeared to do nothing. The clip now travels in
   IndexedDB, the result plays as soon as it lands, and the finished edit is
   handed over ready to post. publish.html and the two ai-edit files are all
   cached. */
/* v27: two more boards. Reaction gains the fastest single go beside the
   median, and the target game gains accuracy beside points — a number it has
   always counted and never posted. reaction.html, aim.html and leaderboard.js
   are all cached, and leaderboard.js carries the message that explains a board
   the deployed worker has not heard of yet. */
/* v28: the two new boards sit beside their originals instead of under them —
   a game with two boards is asking one question twice, and stacked the second
   one is below the fold. Both boards also carry their own name now; the header
   said "Leaderboard" on both, which side by side is worse than one board.
   leaderboard.js, reaction.html and aim.html are all cached. */
/* v29: the rail and the assistants. Progress left the rail (its two halves now
   live on pricing.html and the new history.html), History and Categories
   joined it, and jarvis.js and nova-guide.js are deleted — an old cache
   holding either would still serve pages that no longer exist, and this bump
   is what retires them. Two assistants were replaced by one: the n8n chat
   widget and the Nova voice pill are both removed, and nova-ask.js asks a
   single typed question three seconds in. categories.js is the one copy of
   the category list, shared by the first-run dialog and categories.html. */
/* v44: privacy.html rewritten to match v43's deletions. It still described
   face, voice and click-rhythm sign-in, and the voice commands that went with
   them — a policy claiming to collect biometrics the site no longer has is a
   promise broken in the safest possible direction, but it is still wrong, and
   it is the first document any partner or regulator reads. There is a
   "Biometrics: removed" section now saying what went, why, and what happens to
   data already enrolled on somebody's browser; the camera and microphone
   section covers only the editor, the selfie studio and the voice changer; and
   the analytics section states plainly that ad personalisation is denied.

   Cached page, and the one page where a stale copy is a legal problem rather
   than a cosmetic one. */
/* v43: three changes, and two of them delete things.

   Biometrics are gone from the site. biometrics.html, biometric.js,
   biosentinel.js, rhythm.js and theme-biometric.css are deleted — a face
   descriptor or a voiceprint used to recognise somebody is Article 9 "special
   category" data under GDPR whatever machine it sits on, and this site's users
   are children. The passkey stays and is not the same thing: the private key
   is made inside the device's secure hardware and nothing biometric reaches
   this site. guard.js and profile.html both changed with it, and the shell
   drops five files.

   Ads are contextual only, structurally. novatools/nt.js and nt-config.js set
   requestNonPersonalizedAds, TFCD, TFUA and restricted data processing before
   the loader and again on every unit, and auto ads are refused rather than
   configured. All 31 pages also tell GA4 allow_google_signals:false and
   allow_ad_personalization_signals:false.

   And on a phone the rail is a menu. The 64px bottom strip that held fourteen
   links behind a sideways scroll is gone; below 760px there is a button in the
   bar and six items behind it — Studio, Socials, Games, Family, Pricing,
   Profile. That is a nova.js change, which every page loads, so a returning
   visitor served the old copy from cache gets the strip back on a page whose
   body no longer reserves room for it. */
/* v42: the five per-page walkthroughs are one site tour. Four screens about
   what NovaClip is, shown once on a first visit rather than a new modal every
   time somebody arrives somewhere new, and set in type you can actually read —
   32px headline, 19px copy, up from 20 and 13. Two shell files carry it:
   nova-instructions.js is rewritten, and nova.js loads it now, so the five
   pages that used to carry their own <script> tag no longer do. Without the
   bump a returning visitor gets the old pages from the cache asking for a file
   whose contents changed underneath them, and the tour either never appears or
   appears five times. */
/* v41: the Editor and the AI Editor left the main site rail and open full
   screen inside Studio instead — fixed, edge to edge, over the rail, with a
   34px strip carrying the way back. Photo took their place in the rail, since
   the Editor entry was its only route into the site. nova.js and trends-nav.js
   are both cached shell files and both changed, so without the bump a
   returning visitor gets one of them from the network and the other from the
   cache: a rail with no Editor in it and a Studio that still opens the tool
   into a 940px column, or the reverse.

   Three more in nova.js, all found by the width sweep once it was pointed at
   the eight pages it had never been given: aim.html, flap.html, reaction.html
   and offline.html had no link off them at all, so a page with no way out now
   gets one in the top bar (offline.html carries its own, since it does not
   load nova.js); a bare `button { width:100% }` on report.html was reaching
   into that bar and shoving the "?" off the edge; and the Editor/Photo tabs no
   longer float over the tool when it is embedded. */
/* v40: nova-instructions.js — a walkthrough for the five pages that need one
   (editor, AI editor, Studio, photo, tools). It opens once per tool and then
   only from the "?" in the top bar, and Next waits two seconds on each step:
   press it inside that window and the walkthrough restarts from step one and
   says why. Escape always closes, so it is a pace, not a cage. Also in v40:
   the Ideas and Scripts panels were printing "[object Object]" because ncAsk
   returns { text, err, ... } and both read it as a string. */
/* v39: the Studio panels were unreachable by clicking, which is the only way
   anybody reaches them. The app's rail routes with history.pushState, and
   pushState does not fire hashchange — so this file's router never ran on a
   click and the app's own "STAGED" placeholder stayed up. It listens for
   popstate and for a wrapped pushState now, and hides that placeholder with a
   class on <html> rather than an inline style React throws away on its next
   render. trends-nav.js is the file, and it is cached. */
/* v38: the Studio panels hand you something now instead of printing text and
   stopping. Ideas save to a shortlist that is drawn at the top of that panel
   and downloads as a file, and each one can go straight to Scripts or to the
   thumbnail maker with its title already in the box. Scripts downloads as a
   named .txt and hands the subject and the hook to the AI Editor, which used
   to ask for them again. Saving an idea also logs idea_save — a certificate
   task worth 5 towards Advanced and 15 towards Master that nothing on the site
   had ever written. trends-nav.js and publish.html both changed, both cached. */
/* v37: the editor exports vertical. Its resolution list was four landscape
   sizes, so a Short could be previewed at 9:16 and then only saved as a 16:9
   file with the phone footage boxed in the middle of it — Vertical 9:16,
   Vertical HD, Square and Portrait 4:5 are in the Export dialog now.
   The floating globe in the bottom-left corner is gone with them: it opened a
   second copy of the theme, vibe and language controls that the top bar has
   carried on every page for a while, and on the editor it sat over the tool
   rail. editor.html and nova.js both changed and both are cached. */
/* v36: NovaTools is personalised, and it gained three tools. A "Picked for
   you" strip at the top takes its four from the category — Art gets the new
   drawing board first, Tech the developer set — and disappears entirely for
   Classic or no category. The drawing board is new and hands what you drew
   straight to Animate a drawing, which until now needed paper, a dark pen and
   a camera before it could do anything. The video editor and the AI Editor are
   in the catalogue at last: the two largest tools on the site were the two not
   listed on the tools page. tools.html and categories.js both changed and both
   are cached. */
/* v35: three things, and the first is a fix. A category with no photograph
   recorded "no photo" in sessionStorage for the whole visit, and sessionStorage
   survives a reload — so adding the nine files changed nothing until the tab
   was closed, which is exactly how it was reported. A miss now carries a
   timestamp and is retried after two minutes.
   A neutral "Classic" category joins the nine: it is the plain NovaClip look,
   with no tint, no scene and nothing said to the AI about a channel.
   And nova-guide.js is back — the written walkthrough for twenty-four pages,
   on a "?" in the top bar rather than on the deleted Jarvis pill. New shell
   file, 29 pages reference it. */
/* v34: the backgrounds were invisible on the home page, which is the page
   they were reported invisible on. The wash, the photo and the drawn scene all
   sat at z-index:-1, which is BEHIND the element's own background — and every
   page paints an opaque body (index.html's --void is var(--nc-bg)). They are a
   stack now: --nc-bg on <html>, the body transparent and lifted above them.
   The three big blurred orbs seven pages float behind their content also
   follow the category, because at 460px and 42% opacity they were the loudest
   thing on the screen and they were still violet on a Food page. nova.js is
   the only file that changed and it is cached, so the bump is what delivers
   any of it. */
/* v33: every category has a real background now, not only a colour. Nine
   scenes are composed in category-scene.js and handed over as data URIs — a
   new shell file, loaded by 33 pages, so a cache without it is 33 pages asking
   for a script that is not there. nova.js falls back to it when backgrounds/
   holds no photograph for that category, and it now probes png, jpeg and webp
   as well as jpg, which is what somebody dropping a file in actually has. */
/* v32: Trend Spotter became Studio in the rail, and the page behind that name
   grew the Editor and the AI Editor as panels of its own. trends-nav.js is the
   file that changed and it is cached, so without the bump a returning visitor
   gets a rail with two rows that redirect away instead of two panels that open
   in place. nova.js also gained the per-category background photo layer —
   nothing ships in backgrounds/, and a category with no file there keeps its
   colours, so this bump costs nothing to anybody who adds none. */
/* v31: the front page's globe is gone and NovaClip's own mark turns there
   instead — nova-logo3d.js is a new shell file, index.html changed to load it,
   and nova-globe.js is deleted, so a cache still holding it would serve a page
   asking for a file that no longer exists. The category also lights the whole
   site now: nova.js tints the background family from it, so every page has to
   come back for the new copy or the choice shows on some pages and not others.
   categories.js carries the colours. */
/* v30: two buttons, a category that does something, and BioSentinel back.
   The bar gained a switch that puts the rail away and an "Ask Nova" button
   that reopens the card, so nova.js is the reason for the bump on its own.
   The category now steers the Ask card's shortcuts, Trend Spotter's first
   search and the AI prompts on ai.html, publish.html and trends-nav.js —
   every one of those is a cached file that would otherwise be served from
   v29 without the wiring. And biometrics.html is back, set up from inside
   profile.html rather than from the rail: the six files it needs are in the
   shell again, and profile.html has to be re-fetched or the frame that loads
   it does not exist. */
const CACHE = 'novaclip-v44';

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
  /* The Studio's skin and its panels. Both are small and both belong to the
     page above — the tiles and the tabs are markup this file's own script
     writes, so shipping analytics.html without them offline would leave three
     empty divs where the top of the dashboard should be. */
  '/studio-nexus.css',
  '/studio-nexus.js',
  /* The shared 1-10 scale. analytics.html and publish.html both call into it
     and both throw without it. */
  '/rank.js',
  /* The sticker art and the effect previews: the editor and the photo tool are
     both offline-capable without them, but both are much less useful. */
  '/stickers.js',
  '/studio-kit.js',
  /* The photo editor's effects library and its five extra tools. Cached beside
     the scripts above for the same reason grade.js is: every effect in it is
     arithmetic on a canvas already in memory, so it genuinely works on a train
     — and photo.html without it is a visibly smaller editor rather than a
     broken one, which is the worse failure to debug. */
  '/photo-fx.js',
  /* The photo picker itself is cached even though the photographs it fetches
     are not and cannot be. That is the point: offline, the button is still
     there and says in words that it needs the network and that Stickers does
     not. A missing button would just look like the feature had gone. */
  '/photos.js',
  /* The grade and its panels. Colour correction is arithmetic on the frame
     already in memory, so unlike the photo picker this one works offline. */
  '/grade.js',
  '/grade-ui.js',
  /* The mixer is Web Audio and a generated impulse response — no files to
     fetch, so it works on a train like the grade does. */
  '/mixer.js',
  '/mixer-ui.js',
  /* Picks a video encoder that actually emits bytes on this machine. */
  '/export-fix.js',
  /* Works out how long a dropped file actually is. It belongs in the shell for
     the same reason export-fix.js does: the editor loads it before its own
     bundle, and without it every import falls back to the four-line probe that
     turned an undecodable file into a silent five-second clip. */
  '/media-probe.js',
  /* Checks a dropped clip for fast flashing and blank footage. Pure
     arithmetic on frames already in memory, so it works offline. */
  '/moderate.js',
  /* Nova herself, drawn in SVG rather than fetched as an image. She is the
     face on the scanner and on the question nova-ask.js asks, and at a few
     hundred bytes of markup she costs less cached than the one PNG she
     replaced. */
  '/nova-mascot.js',
  /* The mark that turns on the front page. Cached because index.html is
     cached: the hero without it is a hero with an empty right-hand half, and
     unlike the globe it replaced there is nothing for it to fetch, so offline
     it is exactly as good as online. */
  '/nova-logo3d.js',
  /* The question asked three seconds in, and the category behind it. Both are
     cached because both work with no network at all: nova-ask.js matches what
     was typed against a table in its own file and only falls back to the model
     when nothing matches, and categories.js is a list and a localStorage key.
     Offline, the card still opens and still takes you to the right page. */
  '/nova-ask.js',
  /* The written page walkthroughs. Cached for the reason they are written
     down rather than asked of a model: a help button that needs the network
     is missing at exactly the moment somebody is stuck. */
  '/nova-guide.js',
  /* The five step-by-step walkthroughs, for the same reason and one more: the
     editor and the photo editor both work with the network off, so their
     instructions have to as well. */
  '/nova-instructions.js',
  '/categories.js',
  /* The nine drawn backgrounds. Cached because they are the floor under every
     category: a page served offline without this file is a page with the
     colours and no scene, which is a visibly different site from the one that
     was there a minute ago. */
  '/category-scene.js',
  /* The two pages the rail gained. History reads what is already stored on the
     device, so it is fully useful offline; Categories is the page that lets
     somebody change the answer they gave on their first visit, and it needs
     nothing but the file above. */
  '/history.html',
  '/categories.html',
  '/ai-edit.js',
  '/ai-edit-panel.js',
  /* Sends the Trend Spotter's rail to the real pages. Without it that rail
     offers four features this site already has as though they were unbuilt. */
  '/trends-nav.js',
  /* Hype Lab. The page and its engine go together: hype.html is markup with
     no behaviour of its own, so shipping it without hype.js offline would give
     somebody a drop zone that measures nothing and four dead checkboxes.
     The analysis, the effects and the music are all arithmetic on frames and
     samples already in memory — no model, no assets — so it genuinely works
     on a train. Only the "ask the AI for the words" button needs the network,
     and it says so when it cannot reach it. */
  '/hype.html',
  '/hype.js',
  /* The profile page's crypto and its avatar picker. Registering needs the
     network, but the page should not be a blank screen on a train either. */
  '/account.js',
  '/avatar.js',
  /* The focus timer is the one page here most likely to be opened with the
     wifi off on purpose. */
  '/study.html',
  /* THE DEVICE LOCK, DOWN TO ITS TWO REAL PARTS.
     biometrics.html, biometric.js, biosentinel.js, rhythm.js and
     theme-biometric.css are deleted — face descriptors and voiceprints are
     Article 9 data under GDPR and this site's users are children.

     What is left is not biometric data at all: a passkey's private key is made
     inside the device's secure hardware and never leaves it. guard.js matters
     most here, because nova.js injects it into every page — a cache holding the
     pages but not the lock is a cache where a locked device opens straight up. */
  '/passkey.js',
  '/locker.js',
  '/guard.js',
  /* Where the lock is set up. A shell with the lock and not the page that
     configures it is a lock with no keyhole. */
  '/profile.html',
  '/leaderboard.js',
  '/tools-data.js',
  '/tools-extra.js',
  '/teenverse.js',
  /* The two skins, and the faces they are set in. Without the woff2 files the
     first offline visit falls back to the system sans and the page looks
     wrong rather than merely plain. 50KB for both, once. */
  '/theme-teenverse.css',
  /* Keeps an embedded app's own theme picker from stealing the attribute the
     site selects its palette with. typing.html loads it before its bundle, so
     a cached page without it is a page where light mode does not work. */
  '/theme-bridge.js',
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
