/* NOVACLIP — THE FLOATING WINDOW
 * ===========================================================================
 * Asked for by name: the Xiaomi one. On HyperOS you pull an app into a small
 * card that sits over whatever you were doing, drag it by the header, resize
 * it, and shrink it to a bubble at the edge when it is in the way. It is the
 * best idea in that launcher and almost nothing on the web copies it.
 *
 * AND IT HOLDS EVERY TAB, which is the second half of the ask: "every tab
 * including ai and studio tabs". Not a chosen five — the whole site. Every
 * Studio panel, both AI tabs, the Photo editor, the Trend Spotter, Academy,
 * Games, Socials, your Profile, History, Family, Pricing. The picker is built
 * from the same labels, keys and icons the rails use, so a row here reads
 * exactly as the row that navigates there, in all twenty languages.
 *
 * WHY THIS SITE WANTS ONE
 * ---------------------------------------------------------------------------
 * Every tool here takes the whole screen, and the thing you need WHILE using
 * one is always somewhere else: the clip list with the timestamps you are
 * cutting to, the script you wrote, the trend you are making this for, Ask
 * Nova when something will not behave, your own numbers to check whether the
 * last one worked. Today each of those means leaving where you are and coming
 * back, and a timeline position is not something you want to rebuild from
 * memory.
 *
 * A floating window is the honest fix: the tool comes to you instead of your
 * place being abandoned for the tool.
 *
 * WHAT IT IS, EXACTLY
 * ---------------------------------------------------------------------------
 * A draggable, resizable panel holding an iframe of a page this site already
 * has. Not a popup — a popup is a different window the browser owns, it is
 * blocked by default on phones, and it cannot sit over the editor. Not a
 * modal either: a modal stops you working, which is the opposite of the ask.
 *
 *   drag      anywhere on the header
 *   resize    the grip at the bottom-right
 *   halve     double-tap the header — snaps to the left or right half, which
 *             is the "half page" shape the request named
 *   shrink    the − button parks it as a bubble at the nearest edge; tap to
 *             bring it back exactly where it was
 *   full      the ⤢ button opens the same page properly, for when the little
 *             window has stopped being enough
 *
 * Position and size are remembered per tool, so the window somebody dragged
 * to the corner last night opens in the corner tonight.
 *
 * ?embed=1 IS WHY THIS LOOKS RIGHT RATHER THAN LIKE A PAGE IN A BOX
 * ---------------------------------------------------------------------------
 * nova.js already has NC_EMBED: a page loaded with ?embed=1 stands its top
 * bar, its points badge and its overlays down, because studio-ai.html and
 * trends.html have been hosting pages in iframes for a while. Every URL here
 * carries it, so what lands in a 420px window is the tool, not the tool under
 * a navigation bar built for a 1440px screen. No new embed mode was needed.
 *
 * AND &float=1, WHICH IS THE LOOP GUARD
 * ---------------------------------------------------------------------------
 * The picker lists Studio, and Studio can open the picker. Without a marker
 * the AI Clipper floated over the editor would offer to float the editor over
 * itself, for ever, each level a fresh React bundle. Every URL this file opens
 * carries &float=1, and the first thing this file does is leave if it finds
 * float=1 in its own address. One level deep, always.
 *
 * It is NOT `window.top !== window.self`, which was the first guard written
 * here and was wrong: Studio's own panels are iframes, so that test took the
 * launcher out of the editor — the single place it is most worth having.
 *
 * THE IFRAME IS WHY THIS STAYS SMALL
 * ---------------------------------------------------------------------------
 * Each tool is already a page. Re-rendering one inside a panel would mean a
 * second copy of its logic that goes stale the first time the real one
 * changes; an iframe is the same page, so it cannot drift. The cost is real
 * and worth saying: the seven Studio panels carry that page's React bundle, so
 * a floating AI Clipper is a second copy of it in memory. Those rows say
 * "heavier" in the picker rather than leaving somebody to discover it as
 * slowness.
 *
 * WHERE THE LAUNCHER GOES: WHICHEVER RAIL THIS PAGE HAS
 * ---------------------------------------------------------------------------
 * There are three, and a new permanent chip in a screen corner was not an
 * option — right:15px/bottom:15px is Ask Nova, and three more pieces of
 * floating chrome are stacked above it. So the launcher is a rail row, in the
 * rail the page actually has:
 *
 *   .sidebar #ncnav     nova.js's rail, on thirty-odd pages
 *   .nc-sidebar nav     the Studio bundle's rail, on trends.html
 *   #root nav           the editor's rail — editor-rail.js adopts the hidden
 *                       .ncfloat-btn this file leaves for it, the same
 *                       arrangement Looks, Captions and Edits already use
 *
 * A row, not a corner: it is where somebody already looks to go somewhere,
 * and it costs no screen space that was holding anything.
 */
(function () {
  'use strict';
  if (window.NC_FLOAT) return;

  /* THE LOOP GUARD, FIRST. See the header. A page opened inside a floating
     window gets no launcher of its own, so nothing can nest. */
  if (/[?&]float=1/.test(location.search)) return;

  var KEY = 'nc_float_geom';
  /* WHICH TOOL WAS OPEN, AND HOW.
     Geometry was already remembered per tool, so a window came back the size
     and shape you left it — but only once you had gone and found it again,
     because every navigation destroyed it and nothing recorded that it had
     been there. Asked for: remember which tool was open.

     { id, state } — state is 'open' or 'bubble', because a window parked at
     the edge is a thing somebody chose and coming back expanded would undo
     that choice. Written whenever either changes, removed by × and only by ×:
     closing is the one gesture that means "I am done with this", and
     navigating is not. That is also what keeps it from being a trap — the
     way out is the button already on the window. */
  var LAST = 'nc_float_last';
  var MIN_W = 260, MIN_H = 220;

  /* THE NOTCH AND THE HOME BAR.
     A phone's window is not its screen. Pinned at y=4 the title bar sits
     under the status bar on anything with a notch, and the grip at the bottom
     sits under the home indicator — both of which swallow the touch. The
     insets are read through CSS custom properties because env() is not
     readable from JavaScript any other way; they are 0 everywhere else, so
     this costs a desktop nothing. */
  var SAFE = { t: 0, r: 0, b: 0, l: 0 };
  function readSafe() {
    try {
      var cs = getComputedStyle(document.documentElement);
      SAFE.t = parseFloat(cs.getPropertyValue('--ncf-sat')) || 0;
      SAFE.r = parseFloat(cs.getPropertyValue('--ncf-sar')) || 0;
      SAFE.b = parseFloat(cs.getPropertyValue('--ncf-sab')) || 0;
      SAFE.l = parseFloat(cs.getPropertyValue('--ncf-sal')) || 0;
    } catch (e) {}
  }

  /* Portrait and narrow is a phone held upright, and that is the one case
     where half the WIDTH is not a window, it is a column. See halve(). */
  function tall() { return innerHeight > innerWidth && innerWidth < 760; }

  function tr(k) {
    try { return (k && typeof window.tr === 'function' && window.tr(k)) || ''; }
    catch (e) { return ''; }
  }
  function words(t) { return tr(t.key) || t.label; }

  /* ------------------------------------------------------------------ tools */

  /* EVERY TAB. The labels, the i18n keys and the icon paths are lifted from
     the places that already own them — PANELS in trends-nav.js for the Studio
     panels, NC_NAV and T in nova.js for the site rows — so a row in this
     picker is the same row, worded the same way in every language, as the one
     that navigates there.

     heavy:true means the page brings Studio's React bundle with it. */
  var TOOLS = [
    { group: 'Studio', gkey: 'studio', items: [
      { id: 'trends',  label: 'Trend Spotter', key: 'st_trends_h', url: 'trends.html', hash: '#/trends', heavy: true,
        icon: 'M3 17l6-6 4 4 7-7M14 8h7v7' },
      { id: 'ideas',   label: 'Video Ideas', key: 'st_ideas_h', url: 'trends.html', hash: '#/ideas', heavy: true,
        icon: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z' },
      { id: 'scripts', label: 'Scripts', key: 'st_scripts_h', url: 'trends.html', hash: '#/scripts', heavy: true,
        icon: 'M4 3h11l5 5v13H4zM15 3v5h5M8 13h8M8 17h5' },
      { id: 'thumbs',  label: 'Thumbnails', key: 'st_thumb_h', url: 'trends.html', hash: '#/thumbnails', heavy: true,
        icon: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6' },
      { id: 'clipper', label: 'AI Clipper', key: 'st_clipper_h', url: 'trends.html', hash: '#/clipper', heavy: true,
        icon: 'M6 3v12M18 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
      { id: 'audio',   label: 'Audio editor', key: 'st_aud_h', url: 'trends.html', hash: '#/audio', heavy: true,
        icon: 'M3 12h2l2-7 3 14 3-11 2 4h6' },
      { id: 'posted',  label: 'What you posted', key: 'st_post_h', url: 'trends.html', hash: '#/posted', heavy: true,
        icon: 'M4 5h16v11H4zM9 20h6M12 16v4M9 8l5 3-5 3z' },
      /* analytics.html rather than trends.html#/studio: the same dashboard,
         without the bundle in front of it. The rail row goes to the panel
         because you are already in Studio when you press it; opening it in a
         window from somewhere else, there is nothing to stay inside. */
      { id: 'studio',  label: 'Studio', key: 'st_studio_h', url: 'analytics.html',
        icon: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-3' }
    ] },
    { group: 'Create', gkey: 'nav_create', items: [
      /* editor.html and photo.html open on their own as well as inside
         Studio, and on their own they are the lighter of the two doors. */
      { id: 'editor',  label: 'Editor', key: 'editor', url: 'editor.html',
        icon: 'M4 6h16M4 12h10M4 18h7M17 11l4 4-4 4v-8z' },
      { id: 'photo',   label: 'Photo', key: 'photo', url: 'photo.html',
        icon: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M8.5 9.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z' },
      { id: 'hype',    label: 'Hype Lab', key: 'st_hype_h', url: 'hype.html',
        icon: 'M13 2 4 14h7l-1 8 9-12h-7z' },
      { id: 'publish', label: 'Publish', url: 'publish.html',
        icon: 'M12 19V5M5 12l7-7 7 7' }
    ] },
    /* NO KEY ON THIS GROUP, deliberately. tr('ai') is the product's name —
       "NovaClip AI" — so the header read as the row underneath it. The group
       is the two letters, and those are the two letters in every language
       this site speaks. */
    { group: 'AI', items: [
      /* The two tabs of studio-ai.html, opened as the pages they are. That
         host adds a tab strip this window has no room for, and ai.html on its
         own is by far the lightest thing in this list. */
      { id: 'ask',     label: 'NovaClip AI', key: 'ai', url: 'ai.html',
        icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM8 10h.01M16 10h.01M8 15c1.5 1.5 6.5 1.5 8 0' },
      { id: 'coder',   label: 'Coder', url: 'coder.html',
        icon: 'M8 6l-5 6 5 6M16 6l5 6-5 6' }
    ] },
    { group: 'Learn', gkey: 'nav_learn', items: [
      { id: 'academy', label: 'Academy', key: 'academy', url: 'academy.html',
        icon: 'M3 8l9-5 9 5-9 5zM7 12v5l5 3 5-3v-5' },
      { id: 'games',   label: 'Games', key: 'games', url: 'game.html',
        icon: 'M6 11h4M8 9v4M15 11h.01M18 13h.01M3 8h18v9H3z' },
      { id: 'tools',   label: 'Tools', key: 'st_tools', url: 'tools.html',
        icon: 'M14 6a4 4 0 1 0 4 4l4 4-3 3-4-4a4 4 0 0 0-1-7zM9 11 3 17l3 3 6-6' },
      { id: 'community', label: 'Community', key: 'nav_community', url: 'community.html',
        icon: 'M16 19v-2a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v2M9.5 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 13a3 3 0 0 0 3-3M17 4a3 3 0 0 1 0 6' }
    ] },
    { group: 'You', gkey: 'nav_you', items: [
      { id: 'home',    label: 'Home', key: 'home', url: 'index.html',
        icon: 'M3 11l9-8 9 8M6 10v10h12V10' },
      { id: 'socials', label: 'Socials', key: 'socials', url: 'socials.html',
        icon: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4' },
      { id: 'profile', label: 'Profile', key: 'profile', url: 'profile.html',
        icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z' },
      { id: 'history', label: 'History', key: 'history', url: 'history.html',
        icon: 'M12 8v5l4 2M12 3a9 9 0 1 0 9 9A9 9 0 0 0 12 3z' },
      { id: 'family',  label: 'Family', key: 'family', url: 'parent.html',
        icon: 'M9 20H4v-6a4 4 0 0 1 8 0v6h-3zM17 20h3v-5a3 3 0 0 0-5-2M8 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM16.5 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z' },
      { id: 'pricing', label: 'Pricing', key: 'pricing', url: 'pricing.html',
        icon: 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
    ] }
  ];

  var FLAT = [];
  TOOLS.forEach(function (g) {
    g.items.forEach(function (t) { t.gkey = g.gkey; t.group = g.group; FLAT.push(t); });
  });

  /* The address the window loads. ?embed=1 stands the host chrome down,
     &float=1 is the loop guard, and the hash comes last because a fragment
     has to. */
  function hrefOf(t) { return t.url + '?embed=1&float=1' + (t.hash || ''); }

  var win = null, bubble = null, cur = null;

  /* --------------------------------------------------------------- geometry */

  function geoms() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveGeom(id, g) {
    var all = geoms();
    all[id] = { x: g.x, y: g.y, w: g.w, h: g.h };
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }

  /* What was open, for the next page. See LAST at the top. */
  function remember(state) {
    try {
      if (!cur) return;
      localStorage.setItem(LAST, JSON.stringify({ id: cur.tool.id, state: state }));
    } catch (e) {}
  }
  function forget() { try { localStorage.removeItem(LAST); } catch (e) {} }

  /* Keep the whole window on screen. Called on open and on resize, because a
     phone turning sideways is the commonest way a remembered position ends up
     off the edge. */
  function clamp(g) {
    var vw = innerWidth, vh = innerHeight;
    var l = 4 + SAFE.l, r = 4 + SAFE.r, t = 4 + SAFE.t, b = 4 + SAFE.b;
    g.w = Math.max(MIN_W, Math.min(g.w, vw - l - r));
    g.h = Math.max(MIN_H, Math.min(g.h, vh - t - b));
    g.x = Math.max(l, Math.min(g.x, vw - g.w - r));
    g.y = Math.max(t, Math.min(g.y, vh - g.h - b));
    return g;
  }

  /* WHERE A WINDOW OPENS THE FIRST TIME.
     On a laptop, a card in the top-right corner, out of the way of what you
     were reading. On a phone held upright, the bottom half — which is the
     shape the request named, and the only one that leaves the thing you were
     doing visible above it. A card floating in the middle of a 390px screen
     covers everything and is no better than navigating away. */
  function startGeom(t) {
    readSafe();
    var saved = geoms()[t.id];
    if (saved && isFinite(saved.x)) return clamp({ x: saved.x, y: saved.y, w: saved.w, h: saved.h });
    var vw = innerWidth, vh = innerHeight;
    if (tall()) {
      var hh = Math.max(MIN_H, Math.floor(vh / 2) - 10);
      return clamp({ x: 8, y: vh - hh - 8 - SAFE.b, w: vw - 16, h: hh });
    }
    var w = Math.min(420, vw - 24), h = Math.min(580, vh - 90);
    return clamp({ x: vw - w - 16, y: 64, w: w, h: h });
  }

  /* -------------------------------------------------------------------- CSS */

  /* THE SITE'S OWN PALETTE, NOT A DARK CARD.
     Written first with hard-coded hex, and on a light-mode page it showed:
     a black panel with white text sitting over a white page, which is what
     every bolted-on widget looks like. nova.js already publishes the whole
     palette as variables and restates every one of them under
     html[data-theme="light"], so using them is both less code and the only
     way this follows the theme switch without a second stylesheet. The
     fallbacks are the dark values, for the moment before nova.js's theme
     sheet lands.

     The rail's vocabulary on purpose — --nc-rail1 for the surface,
     --nc-navhead for captions, --nc-navhoverbg for a hovered row. A window
     holding a tool should look like the rail that lists it, not like a
     dialog from somewhere else. */
  var CSS =
    /* env() cannot be read from JavaScript. Parked on :root as custom
       properties, getComputedStyle can. See readSafe(). */
    ':root{--ncf-sat:env(safe-area-inset-top,0px);--ncf-sar:env(safe-area-inset-right,0px);' +
      '--ncf-sab:env(safe-area-inset-bottom,0px);--ncf-sal:env(safe-area-inset-left,0px)}' +
    /* ----------------------------------------------------------------------
       THE MINIMISE BUTTON DID NOTHING, AND THIS IS THE LINE THAT FIXES IT.

       shrink() sets `win.hidden = true`, which is correct and which the
       browser honours through its own `[hidden]{display:none}` — a rule of
       specificity (0,0,1). `.ncf{display:flex}` below is (0,1,0) and beats
       it, so the property flipped, the bubble appeared, and the window stayed
       exactly where it was. The same applied in reverse to `.ncf-bub`, so
       restoring left the bubble sitting on top of the window it had just
       brought back.

       The test that was supposed to cover this asked the element whether
       `hidden` was true. It was. That is the property, not the picture.
       Hiding is now asserted by measuring `display` instead.
       ---------------------------------------------------------------------- */
    '.ncf[hidden],.ncf-bub[hidden]{display:none}' +
    '.ncf{position:fixed;z-index:2147483000;display:flex;flex-direction:column;' +
      'background:var(--nc-rail1,#0E1220);color:var(--nc-text,#EAF2FF);' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.16));' +
      'border-radius:14px;box-shadow:0 24px 60px var(--nc-shadow,rgba(0,0,0,.55));overflow:hidden;' +
      'font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.ncf-hd{display:flex;align-items:center;gap:6px;padding:9px 10px;flex:0 0 auto;' +
      'background:var(--nc-card2,rgba(255,255,255,.06));' +
      'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.10));' +
      'cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.ncf.drag .ncf-hd{cursor:grabbing}' +
    '.ncf-ttl{font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis;min-width:0;flex:1 1 auto}' +
    '.ncf-b{flex:0 0 auto;width:26px;height:26px;display:grid;place-items:center;' +
      'border:0;border-radius:7px;background:var(--nc-card2,rgba(255,255,255,.06));' +
      'color:var(--nc-navlink,#98A6C4);font:600 13px/1 system-ui;cursor:pointer;padding:0}' +
    '.ncf-b:hover{background:var(--nc-navhoverbg,rgba(255,255,255,.04));color:var(--nc-navon,#fff)}' +
    '.ncf-b:focus-visible{outline:2px solid var(--nc-violet,#7C5CFF);outline-offset:1px}' +
    '.ncf-body{flex:1 1 auto;min-height:0;position:relative;background:var(--nc-bg,#05070E)}' +
    '.ncf-body iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}' +
    /* While dragging, the iframe must stop eating pointer events or the drag
       dies the moment the cursor crosses into the page inside the window. */
    '.ncf.drag .ncf-body,.ncf.size .ncf-body{pointer-events:none}' +
    '.ncf-grip{position:absolute;right:0;bottom:0;width:24px;height:24px;cursor:nwse-resize;' +
      'touch-action:none;z-index:2}' +
    '.ncf-grip::after{content:"";position:absolute;right:5px;bottom:5px;width:9px;height:9px;' +
      'border-right:2px solid var(--nc-navhead,#5D6A88);border-bottom:2px solid var(--nc-navhead,#5D6A88);' +
      'border-radius:0 0 3px 0}' +
    '.ncf-bub{position:fixed;z-index:2147483000;width:54px;height:54px;border-radius:50%;' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.18));background:var(--nc-rail1,#0E1220);' +
      'color:var(--nc-navicoon,#A78BFA);cursor:pointer;' +
      'box-shadow:0 10px 26px var(--nc-shadow,rgba(0,0,0,.5));display:grid;place-items:center;padding:4px;' +
      'touch-action:none}' +
    '.ncf-bub:hover{border-color:var(--nc-navonline,rgba(167,139,250,.28));color:var(--nc-navon,#fff)}' +
    '.ncf-bub svg{width:22px;height:22px}' +
    /* the picker */
    '.ncf-menu{position:fixed;z-index:2147483001;width:276px;max-width:calc(100vw - 16px);' +
      'max-height:min(72vh,520px);display:flex;flex-direction:column;' +
      'background:var(--nc-rail1,#0E1220);border:1px solid var(--nc-line2,rgba(255,255,255,.16));' +
      'border-radius:13px;box-shadow:0 18px 44px var(--nc-shadow,rgba(0,0,0,.55));' +
      'font:400 13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--nc-text,#EAF2FF)}' +
    '.ncf-menu header{padding:10px 11px 8px;flex:0 0 auto}' +
    '.ncf-menu h4{margin:0 0 7px;font:700 12px/1.3 system-ui;color:var(--nc-text,#EAF2FF)}' +
    '.ncf-menu p{margin:0 0 8px;font-size:11px;color:var(--nc-dim,#7E8AA6);line-height:1.45}' +
    '.ncf-menu input{width:100%;box-sizing:border-box;padding:7px 9px;border-radius:8px;' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.16));background:var(--nc-card,rgba(255,255,255,.04));' +
      'color:var(--nc-text,#EAF2FF);font:400 12.5px/1.3 system-ui}' +
    '.ncf-menu input:focus{outline:2px solid var(--nc-violet,#7C5CFF);outline-offset:0}' +
    '.ncf-list{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 6px 7px;scrollbar-width:thin}' +
    '.ncf-gh{padding:9px 6px 3px;font:800 9.5px/1 system-ui;letter-spacing:.12em;' +
      'text-transform:uppercase;color:var(--nc-navhead,#5D6A88)}' +
    '.ncf-list button{display:flex;align-items:center;gap:9px;width:100%;padding:7px 8px;' +
      'border:0;border-radius:8px;background:none;color:var(--nc-navlink,#98A6C4);' +
      'font:500 13px/1.3 system-ui;text-align:left;cursor:pointer}' +
    '.ncf-list button:hover,.ncf-list button:focus-visible{outline:none;' +
      'background:var(--nc-navhoverbg,rgba(255,255,255,.04));color:var(--nc-navon,#fff)}' +
    '.ncf-list button svg{width:17px;height:17px;flex:0 0 auto;color:var(--nc-navhead,#5D6A88)}' +
    '.ncf-list button:hover svg{color:var(--nc-navicoon,#A78BFA)}' +
    '.ncf-list button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ncf-list button i{flex:0 0 auto;font-style:normal;font-size:9.5px;color:var(--nc-dim,#7E8AA6)}' +
    '.ncf-none{padding:12px 8px;font-size:12px;color:var(--nc-dim,#7E8AA6)}' +
    /* A FINGER IS NOT A CURSOR. 26px buttons and a 24px grip are fine under a
       mouse and too small under a thumb, and these four buttons sit in a row
       at the top of a window somebody is also trying to drag. Keyed on the
       pointer rather than the width, so a touchscreen laptop gets them too
       and a narrow desktop window does not. */
    /* A phone's picker is a sheet, not a dropdown. At the desktop's 276px it
       sat as a narrow column in the middle of a 390px screen with air down
       both sides, which is what a menu pinned to a rail row looks like when
       there is no rail row to pin it to. */
    '@media (max-width:520px){' +
      '.ncf-menu{width:calc(100vw - 24px);max-height:min(76vh,560px)}' +
    '}' +
    '@media (pointer:coarse){' +
      '.ncf-hd{gap:4px;padding:10px}' +
      '.ncf-b{width:34px;height:34px;font-size:15px}' +
      '.ncf-grip{width:34px;height:34px}' +
      '.ncf-bub{width:60px;height:60px}' +
      '.ncf-list button{padding:10px 8px}' +
      '.ncf-menu input{padding:9px 10px;font-size:16px}' +   /* 16px: anything less and iOS zooms the page on focus */
    '}' +
    '@media (max-width:520px){.ncf{border-radius:12px}}';

  function css() {
    if (document.getElementById('ncf-css')) return;
    var s = document.createElement('style');
    s.id = 'ncf-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function svg(d, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  /* --------------------------------------------------------------- dragging */

  /* One routine for the header and the grip: both are "press, move, let go",
     and the only difference is which numbers the movement changes.
     setPointerCapture is the part that matters — a fast drag that leaves the
     header does not drop the window, which is what every
     mousemove-on-document implementation gets wrong the first time. */
  function grab(el, onMove, cls) {
    el.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      var sx = e.clientX, sy = e.clientY;
      var g0 = { x: cur.g.x, y: cur.g.y, w: cur.g.w, h: cur.g.h };
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      win.classList.add(cls);
      e.preventDefault();

      function move(ev) { onMove(ev.clientX - sx, ev.clientY - sy, g0); place(); }
      function up(ev) {
        try { el.releasePointerCapture(ev.pointerId); } catch (err) {}
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        win.classList.remove(cls);
        saveGeom(cur.tool.id, cur.g);
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }

  function place() {
    clamp(cur.g);
    win.style.left = Math.round(cur.g.x) + 'px';
    win.style.top = Math.round(cur.g.y) + 'px';
    win.style.width = Math.round(cur.g.w) + 'px';
    win.style.height = Math.round(cur.g.h) + 'px';
  }

  /* ------------------------------------------------------------- the window */

  /* `keep` is for the close() that open() does to clear the previous window
     before building the next one: that is not somebody saying they are done,
     and letting it wipe the memory would mean the only state ever recorded
     was whatever happened to be last written afterwards. × passes nothing. */
  function close(keep) {
    if (win && win.parentNode) win.parentNode.removeChild(win);
    if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
    win = null; bubble = null; bub = null; cur = null;
    if (!keep) forget();
  }

  /* The bubble's own place on screen, kept out of the window's geometry
     because the two move independently once it has been dragged. */
  var bub = null;

  function placeBubble() {
    if (!bubble || !bub) return;
    var s = bubble.offsetWidth || 54;
    bub.x = Math.max(4 + SAFE.l, Math.min(bub.x, innerWidth - s - 4 - SAFE.r));
    bub.y = Math.max(4 + SAFE.t, Math.min(bub.y, innerHeight - s - 4 - SAFE.b));
    bubble.style.left = Math.round(bub.x) + 'px';
    bubble.style.top = Math.round(bub.y) + 'px';
  }

  function shrink() {
    if (!win || !cur) return;
    saveGeom(cur.tool.id, cur.g);
    win.hidden = true;
    remember('bubble');
    if (bubble) { bubble.hidden = false; placeBubble(); return; }

    bubble = document.createElement('button');
    bubble.type = 'button';
    bubble.className = 'ncf-bub';
    bubble.title = words(cur.tool);
    bubble.setAttribute('aria-label', words(cur.tool));
    bubble.innerHTML = svg(cur.tool.icon);
    document.body.appendChild(bubble);

    /* Parked at the nearest side, the way the phone does it. */
    var size = bubble.offsetWidth || 54;
    var right = (cur.g.x + cur.g.w / 2) > innerWidth / 2;
    bub = {
      x: right ? innerWidth - size - 12 : 12,
      y: Math.max(60, Math.min(cur.g.y, innerHeight - size - 20))
    };
    placeBubble();

    /* AND IT MOVES. A bubble you cannot move is a bubble sitting on top of
       whatever you parked it over — which on a phone is most of the screen.
       Drag and tap are the same gesture until the finger has travelled, so
       the press only counts as a tap if it ends within a few pixels of where
       it started; anything further is a move and must not also reopen the
       window. */
    var sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
    bubble.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      sx = e.clientX; sy = e.clientY; ox = bub.x; oy = bub.y; moved = false;
      try { bubble.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    bubble.addEventListener('pointermove', function (e) {
      if (!sx && !sy) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
      moved = true;
      bub.x = ox + dx; bub.y = oy + dy;
      placeBubble();
    });
    function up(e) {
      try { bubble.releasePointerCapture(e.pointerId); } catch (err) {}
      sx = sy = 0;
      if (moved) {
        /* Snap back to whichever side it was let go nearer, the way the
           phone does — a bubble loose in the middle is in the way. */
        var s2 = bubble.offsetWidth || 54;
        bub.x = (bub.x + s2 / 2) > innerWidth / 2 ? innerWidth - s2 - 12 - SAFE.r : 12 + SAFE.l;
        placeBubble();
        return;
      }
      bubble.hidden = true;
      win.hidden = false;
      place();
      remember('open');
    }
    bubble.addEventListener('pointerup', up);
    bubble.addEventListener('pointercancel', function (e) {
      try { bubble.releasePointerCapture(e.pointerId); } catch (err) {}
      sx = sy = 0;
    });
    /* A keyboard never moves it, so Enter and Space are always a restore. */
    bubble.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      bubble.hidden = true; win.hidden = false; place();
      remember('open');
    });
  }

  /* HALF THE SCREEN — AND WHICH HALF DEPENDS ON THE SCREEN.
     On a laptop, the left or right half, whichever it is already nearer.
     On a phone held upright, the TOP or BOTTOM half: half of 390px is a
     195px column, which is not a window, and the half-page app on the phone
     this was asked for is a card across the bottom with your own page still
     visible above it. */
  function halve() {
    if (!cur) return;
    readSafe();
    var vw = innerWidth, vh = innerHeight;
    if (tall()) {
      var low = (cur.g.y + cur.g.h / 2) > vh / 2;
      cur.g.w = vw - 16;
      cur.g.h = Math.max(MIN_H, Math.floor(vh / 2) - 10);
      cur.g.x = 8;
      cur.g.y = low ? vh - cur.g.h - 8 : 8;
    } else {
      var right = (cur.g.x + cur.g.w / 2) > vw / 2;
      cur.g.w = Math.max(MIN_W, Math.floor(vw / 2) - 12);
      cur.g.h = vh - 80;
      cur.g.y = 56;
      cur.g.x = right ? vw - cur.g.w - 8 : 8;
    }
    place();
    saveGeom(cur.tool.id, cur.g);
  }

  function open(id) {
    var tool = null;
    for (var i = 0; i < FLAT.length; i++) if (FLAT[i].id === id) tool = FLAT[i];
    if (!tool) return null;
    css();
    close(true);

    cur = { tool: tool, g: startGeom(tool) };

    win = document.createElement('div');
    win.className = 'ncf';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', words(tool));

    var hd = document.createElement('div');
    hd.className = 'ncf-hd';
    var ttl = document.createElement('span');
    ttl.className = 'ncf-ttl';
    ttl.textContent = words(tool);
    hd.appendChild(ttl);

    function btn(glyph, title, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ncf-b';
      b.textContent = glyph;
      b.title = title;
      b.setAttribute('aria-label', title);
      b.onclick = function (e) { e.stopPropagation(); fn(); };
      /* The header owns dragging; a press on a button must not start one. */
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      hd.appendChild(b);
    }
    btn('▤', tr('f_half') || 'Half screen', halve);
    btn('−', tr('f_shrink') || 'Shrink to a bubble', shrink);
    btn('⤢', tr('f_full') || 'Open the full page', function () {
      try { location.href = tool.url + (tool.hash || ''); } catch (e) {}
    });
    btn('×', tr('f_close') || 'Close', close);

    var body = document.createElement('div');
    body.className = 'ncf-body';
    var fr = document.createElement('iframe');
    fr.src = hrefOf(tool);
    fr.title = words(tool);
    body.appendChild(fr);

    var grip = document.createElement('div');
    grip.className = 'ncf-grip';
    grip.setAttribute('aria-hidden', 'true');

    win.appendChild(hd);
    win.appendChild(body);
    win.appendChild(grip);
    document.body.appendChild(win);
    place();

    grab(hd, function (dx, dy, g0) { cur.g.x = g0.x + dx; cur.g.y = g0.y + dy; }, 'drag');
    grab(grip, function (dx, dy, g0) { cur.g.w = g0.w + dx; cur.g.h = g0.h + dy; }, 'size');

    /* Double-tap rather than dblclick: dblclick does not fire for touch. */
    var lastTap = 0;
    hd.addEventListener('pointerup', function () {
      var now = Date.now();
      if (now - lastTap < 320) halve();
      lastTap = now;
    });

    addEventListener('resize', onResize);
    remember('open');
    return win;
  }

  /* A phone changes innerHeight whenever the address bar slides away, so this
     runs far more often there than on a laptop — and it is what keeps a
     window, or a parked bubble, from ending up under an edge that just moved. */
  function onResize() {
    readSafe();
    if (cur && win && !win.hidden) place();
    if (bubble && !bubble.hidden) placeBubble();
  }

  /* ------------------------------------------------------------- the picker */

  var menu = null;
  function closeMenu() {
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
    menu = null;
    document.removeEventListener('pointerdown', awayMenu, true);
    document.removeEventListener('keydown', keyMenu, true);
  }
  function awayMenu(e) { if (menu && !menu.contains(e.target)) closeMenu(); }
  function keyMenu(e) { if (e.key === 'Escape') closeMenu(); }

  function pick(anchor) {
    css();
    if (menu) { closeMenu(); return; }

    menu = document.createElement('div');
    menu.className = 'ncf-menu';
    menu.setAttribute('role', 'dialog');

    var head = document.createElement('header');
    var h = document.createElement('h4');
    h.textContent = tr('f_win') || 'Open in a floating window';
    var p = document.createElement('p');
    p.textContent = tr('f_win_d') ||
      'It sits over this page. Drag it by the bar, double-tap the bar for half the screen, − parks it at the edge.';
    var q = document.createElement('input');
    q.type = 'search';
    q.placeholder = tr('f_find') || 'Which tool?';
    q.setAttribute('aria-label', tr('f_find') || 'Which tool?');
    head.appendChild(h); head.appendChild(p); head.appendChild(q);

    var list = document.createElement('div');
    list.className = 'ncf-list';
    menu.appendChild(head);
    menu.appendChild(list);

    /* Twenty-two rows is more than a menu should ask somebody to read, so it
       filters as you type. Matching BOTH the translated words and the English
       label on purpose: somebody typing "clipper" on a Persian page is typing
       the name they know the tool by. */
    function draw(filter) {
      var f = (filter || '').trim().toLowerCase();
      list.textContent = '';
      var shown = 0;
      TOOLS.forEach(function (g) {
        var hit = g.items.filter(function (t) {
          return !f || words(t).toLowerCase().indexOf(f) >= 0 ||
                       t.label.toLowerCase().indexOf(f) >= 0;
        });
        if (!hit.length) return;
        var gh = document.createElement('div');
        gh.className = 'ncf-gh';
        gh.textContent = tr(g.gkey) || g.group;
        list.appendChild(gh);
        hit.forEach(function (t) {
          shown++;
          var b = document.createElement('button');
          b.type = 'button';
          /* Said out loud rather than discovered as slowness: the heavy rows
             carry Studio's whole bundle a second time. */
          b.innerHTML = svg(t.icon) + '<span></span>' +
            (t.heavy ? '<i>' + (tr('f_heavy') || 'heavier') + '</i>' : '');
          b.querySelector('span').textContent = words(t);
          b.onclick = function () { closeMenu(); open(t.id); };
          list.appendChild(b);
        });
      });
      if (!shown) {
        var none = document.createElement('div');
        none.className = 'ncf-none';
        none.textContent = tr('f_nohit') || 'Nothing by that name.';
        list.appendChild(none);
      }
    }
    draw('');
    q.addEventListener('input', function () { draw(q.value); });
    q.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var first = list.querySelector('button');
      if (first) first.click();
    });

    document.body.appendChild(menu);

    /* Beside the rail row, flipped above it when there is no room below, and
       never off the left or the right of the screen. */
    var r = (anchor && anchor.getBoundingClientRect && anchor.getBoundingClientRect()) ||
            { left: 16, right: 16, top: 80, bottom: 80 };
    /* THE PHONE'S LAUNCHER IS THE HIDDEN PILL, PARKED AT -9999.
       Opened from the drawer there is nothing on screen to sit beside, and
       anchoring to where that pill really is would clamp the picker into the
       top-left corner — technically on screen, and nowhere near the thumb
       that just pressed the row. Centred and low instead, which is where a
       sheet belongs on a phone. */
    if (r.left < 0 || r.left > innerWidth) {
      var ph = tall();
      r = { left: 0, right: innerWidth, top: ph ? innerHeight : 80, bottom: ph ? innerHeight : 80 };
      menu.style.left = '50%';
      menu.style.transform = 'translateX(-50%)';
    }
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    if (menu.style.transform) {
      menu.style.top = Math.round(Math.max(8 + SAFE.t,
        Math.min(r.top - mh - 12, innerHeight - mh - 8 - SAFE.b))) + 'px';
      document.addEventListener('pointerdown', awayMenu, true);
      document.addEventListener('keydown', keyMenu, true);
      try { q.focus({ preventScroll: true }); } catch (e) {}
      return;
    }
    var x = Math.min(Math.max(8, r.left), Math.max(8, innerWidth - mw - 8));
    var y = r.bottom + 6 + mh <= innerHeight ? r.bottom + 6
          : Math.max(8, Math.min(r.top - mh - 6, innerHeight - mh - 8));
    menu.style.left = Math.round(x) + 'px';
    menu.style.top = Math.round(y) + 'px';

    document.addEventListener('pointerdown', awayMenu, true);
    document.addEventListener('keydown', keyMenu, true);
    try { q.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------------------------------------------------------- the launcher */

  /* THREE RAILS, AND THE PAGE HAS ONE OF THEM. See the header for why this is
     a rail row rather than another chip in a screen corner. */

  function label() { return tr('nav_window') || 'Floating window'; }
  var ICON = 'M3 5h18v14H3zM13 10h7v7h-7zM7 8h3';

  /* nova.js's rail: a .ncg group holding one row, appended after the last
     group so it never pushes a navigation link under the fold. ncRailFit() is
     asked to measure again because the column just grew — that pass is what
     keeps the whole rail on screen, and it has already run by the time this
     lands.

     AN <a>, NOT A <button>, AND THAT IS THE WHOLE TRICK.
     Every rule nova.js writes for a rail row is `.sidebar #ncnav a.ncl …` —
     the tag name is in the selector. Built as a button this row matched none
     of them: measured against its neighbours it came back 13.33px black text
     on no background with square corners and no height, in a column of
     12.18px pale rows 28px tall with 11px corners. It read as a form control
     dropped into the navigation.

     No href. An <a> without one is not a link, takes no focus of its own and
     gets no pointer cursor, so role, tabindex and cursor are set here; what
     it keeps is the one thing it was built for, which is matching `a.ncl`. */
  function intoSiteRail() {
    var nav = document.querySelector('.sidebar #ncnav');
    if (!nav) return false;
    if (nav.querySelector('.ncf-launch')) return true;
    var g = document.createElement('div');
    g.className = 'ncg';
    var box = document.createElement('div');
    box.className = 'ncgi';
    var a = document.createElement('a');
    /* .ncl is nova.js's row and gives this its whole appearance; .ncf-launch
       is ours, and only for finding it again. */
    a.className = 'ncl ncf-launch';
    a.setAttribute('role', 'button');
    a.setAttribute('tabindex', '0');
    a.style.cursor = 'pointer';
    a.innerHTML = svg(ICON, 'nci') + '<span class="nct" data-t="nav_window"></span>';
    a.querySelector('.nct').textContent = label();
    a.addEventListener('click', function (e) { e.preventDefault(); pick(a); });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(a); }
    });
    box.appendChild(a);
    g.appendChild(box);
    nav.appendChild(g);
    try { if (typeof window.ncRailFit === 'function') window.ncRailFit(); } catch (e) {}
    return true;
  }

  /* The Studio bundle's rail. Its rows are anchors with the bundle's own
     hashed classes, so the row is built by CLONING one that is already there
     — same markup, same classes, same icon size — and then having its icon
     and words replaced. Copying beats guessing: trends-nav.js does exactly
     this for the rows it adds, and for the same reason. */
  function intoStudioRail() {
    var side = document.querySelector('.nc-sidebar');
    if (!side) return false;
    var nav = side.querySelector('nav') || side;
    if (nav.querySelector('.ncf-launch')) return true;
    var model = nav.querySelector('.nc-nav-item');
    if (!model) return false;
    var row = model.cloneNode(true);
    row.classList.remove('nc-nav-item-active');
    row.classList.add('ncf-launch');
    row.removeAttribute('href');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.style.cursor = 'pointer';
    var s = row.querySelector('svg');
    if (s) s.innerHTML = '<path d="' + ICON + '"/>';
    /* The LAST element child that actually holds words — the active row
       carries an empty marker element after its label, and that is what a
       naive .pop() picks. Same filter trends-nav.js uses. */
    var lab = [].slice.call(row.childNodes).filter(function (n) {
      return n.nodeType === 1 && n.tagName !== 'svg' && !n.querySelector('svg') &&
             (n.textContent || '').trim();
    }).pop();
    if (lab) { lab.textContent = label(); lab.setAttribute('data-t', 'nav_window'); }
    else row.appendChild(document.createTextNode(label()));
    row.addEventListener('click', function (e) { e.preventDefault(); pick(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(row); }
    });
    nav.appendChild(row);
    return true;
  }

  /* The editor's rail is editor-rail.js's, and it adopts pills by class — the
     arrangement Looks, Captions and Edits already use. This leaves one off
     screen for it to find. The picker is anchored on the rail row once that
     file has moved it, and on the hidden pill only if it never did.

     AND IT IS WHAT THE PHONE USES TOO. See phoneRow(). */
  function pill() {
    var b = document.querySelector('.ncfloat-btn');
    if (b) return b;
    b = document.createElement('button');
    b.type = 'button';
    b.id = 'ncfloatbtn';
    b.className = 'ncfloat-btn';
    b.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    b.textContent = label();
    b.onclick = function () {
      pick(document.querySelector('[data-ncrail=".ncfloat-btn"]') || b);
    };
    document.body.appendChild(b);
    return b;
  }

  /* ON A PHONE THERE IS NO RAIL TO PUT A ROW IN.
     Measured at 390px: `.sidebar` is display:none, and so are all eleven of
     its rows — Home and Studio included. The site rail is not a strip down
     there, it simply is not there. The navigation is #ncbar at the top and
     the #ncsheet drawer its burger opens, and the launcher was landing in an
     element nobody could ever see.

     nova.js already has the hook for this. NC_PHONE_EXTRAS is a list of
     [buttonId, label, icon] that the drawer renders as a labelled row and
     wires to click the real control — "they click the originals rather than
     reimplementing them, so there is still exactly one copy of what each
     button does". Settings, Ask Nova and the page guide already come through
     it. The hidden pill above has an id for exactly this, and the drawer
     filters on that id existing, so this costs nothing on a page where the
     pill was never made.

     It belongs in that row rather than in the list of links above it: the
     list goes to pages, and this opens something over the one you are on. */
  function phoneRow() {
    var b = pill();
    if (!b) return;
    var list = window.NC_PHONE_EXTRAS = window.NC_PHONE_EXTRAS || [];
    for (var i = 0; i < list.length; i++) if (list[i][0] === b.id) return;
    list.push([b.id, label(), ICON]);
  }

  /* The rails are built by other files — nova.js at the end of <body>, the
     Studio bundle after React mounts — so one try is not enough, and watching
     for ever is not either. Twenty tries at 400ms covers a slow phone booting
     a React page and then gives up quietly. */
  /* BRING BACK WHAT WAS OPEN.
     The window is a real element on a real page, so navigating destroys it —
     and the whole point of a floating tool is that it survives the thing you
     were doing. It comes back on the next page in the state it was left: the
     same tool, its own remembered size and position, and still parked at the
     edge if that is where it was.

     This is worth being plain about: a heavy tool left open is a heavy tool
     on every page until it is closed, because restoring it means loading it.
     That is the deal the feature asks for and × ends it. The ones that carry
     Studio's bundle are the ones the picker already marks "heavier".

     Anything it cannot place is dropped rather than guessed at — a remembered
     id for a tool that no longer exists would otherwise sit in storage
     failing quietly on every page for ever. */
  function restore() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(LAST) || 'null'); } catch (e) {}
    if (!v || !v.id) return;
    var known = false;
    for (var i = 0; i < FLAT.length; i++) if (FLAT[i].id === v.id) known = true;
    if (!known) { forget(); return; }
    if (!open(v.id)) { forget(); return; }
    if (v.state === 'bubble') shrink();
  }

  function start() {
    css();
    readSafe();
    pill();
    phoneRow();
    restore();
    var tries = 0;
    (function again() {
      if (intoSiteRail() || intoStudioRail()) return;
      if (++tries > 20) return;
      setTimeout(again, 400);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_FLOAT = {
    TOOLS: TOOLS, FLAT: FLAT,
    open: open, close: close, pick: pick,
    shrink: shrink, halve: halve,
    href: hrefOf,
    geom: function () { return cur ? cur.g : null; }
  };
})();
