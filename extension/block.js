/* NovaClip Family Shield — the content script that does the blocking
   ============================================================================
   Runs on youtube.com, tiktok.com, instagram.com and twitch.tv. Two jobs:

     1. Hide items in a feed, sidebar or search result before they are read.
     2. Stop a blocked page from playing, and say why.

   The rules come from family-filter.js — the same file the Family Dashboard
   runs, so what a parent previews is exactly what happens here.

   ============================================================================
   WHY IT LOOKS LIKE THIS

   All four sites are single-page apps that rebuild the DOM constantly, so
   there is no "page loaded" moment to hook. A MutationObserver, throttled,
   is the only thing that keeps up with an infinite feed.

   Items are hidden with a class rather than removed. Removing nodes from a
   React tree makes these sites throw and sometimes blank the page, and a
   blank YouTube teaches a child that the shield is broken rather than that
   the video was blocked.
   ---------------------------------------------------------------------------- */
(function () {
  'use strict';

  var F = globalThis.NCFilter;
  if (!F) return;                       // engine missing: do nothing rather than half-block

  var settings = null;
  var host = location.hostname.replace(/^www\./, '');
  var platform =
    /youtube\.com$/.test(host) ? 'youtube' :
    /tiktok\.com$/.test(host) ? 'tiktok' :
    /instagram\.com$/.test(host) ? 'instagram' :
    /twitch\.tv$/.test(host) ? 'twitch' : null;
  if (!platform) return;

  /* ==========================================================================
     Settings
     ========================================================================== */
  chrome.storage.local.get(['nc_family_settings'], function (v) {
    settings = v && v.nc_family_settings;
    if (!settings) settings = F.defaults('tween');
    start();
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'local' || !changes.nc_family_settings) return;
    settings = changes.nc_family_settings.newValue || F.defaults('tween');
    /* A parent changing a setting should show up without asking the child to
       reload anything. Un-hide everything, then re-run the new rules. */
    document.querySelectorAll('.ncfs-hidden').forEach(function (el) {
      el.classList.remove('ncfs-hidden');
      el.removeAttribute('data-ncfs');
    });
    sweep();
    checkPage();
  });

  function on() {
    return settings && settings.enabled !== false &&
      !(settings.platforms && settings.platforms[platform] === false);
  }

  function report(what) {
    /* The parent's log. Kept in the extension, capped, and it records the
       category rather than the content — a log of exactly what a child tried
       to watch is itself a privacy problem. */
    chrome.runtime.sendMessage({ type: 'ncfs-blocked', item: {
      platform: platform,
      category: what.category || what.rule,
      label: what.label || '',
      where: what.where || 'feed',
      at: Date.now()
    } });
  }

  /* ==========================================================================
     Feed items — the selectors, per site

     These are the containers each site uses for one card. They change when the
     sites redesign; when one goes stale the shield quietly stops hiding that
     surface, which is why the page-level check below is the backstop.
     ========================================================================== */
  var ITEMS = {
    youtube: 'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ' +
             'ytd-grid-video-renderer, ytd-reel-item-renderer, ytm-shorts-lockup-view-model, ' +
             'ytd-playlist-renderer, ytd-channel-renderer',
    tiktok: '[data-e2e="recommend-list-item-container"], [data-e2e="search_top-item"], ' +
            '[data-e2e="user-post-item"], div[class*="DivItemContainer"]',
    instagram: 'article, div[role="button"][tabindex="0"] > div > div > a[href*="/reel/"], ' +
               'div[style*="flex-direction"] > a[href*="/p/"]',
    twitch: 'article[data-a-target], div[data-target="directory-container"] article, ' +
            'div[data-a-target="video-tower-card"], .tw-tower > div'
  };

  function textOf(el) {
    /* innerText would force layout on every card in an infinite feed. The
       aria-label and title attributes carry what we need on all four sites
       and cost nothing. */
    var bits = [];
    var labelled = el.querySelectorAll('[aria-label], [title], img[alt]');
    for (var i = 0; i < labelled.length && i < 12; i++) {
      var n = labelled[i];
      bits.push(n.getAttribute('aria-label') || n.getAttribute('title') || n.getAttribute('alt') || '');
    }
    if (bits.join('').trim().length < 4) bits.push((el.textContent || '').slice(0, 400));
    return bits.join(' ');
  }

  function sweep() {
    if (!on()) return;
    var sel = ITEMS[platform];
    if (!sel) return;
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.hasAttribute('data-ncfs')) continue;      // already judged
      var verdict = F.check({ platform: platform, title: textOf(el) }, settings);
      el.setAttribute('data-ncfs', verdict.blocked ? 'blocked' : 'ok');
      if (verdict.blocked) {
        el.classList.add('ncfs-hidden');
        report({ category: verdict.category, label: verdict.label, rule: verdict.rule, where: 'feed' });
      }
    }
  }

  /* ==========================================================================
     The page itself — the backstop

     If a child opens a blocked video directly, the feed sweep never sees it.
     This reads the page title and the channel name and covers the whole
     viewport if they match.
     ========================================================================== */
  function pageInfo() {
    var t = document.title || '';
    var channel = '';
    var el;
    if (platform === 'youtube') {
      el = document.querySelector('ytd-channel-name a, #upload-info #channel-name a, #owner #channel-name a');
      channel = el ? el.textContent : '';
      var d = document.querySelector('meta[name="description"]');
      return { title: t, channel: channel, description: d ? d.content.slice(0, 600) : '' };
    }
    if (platform === 'twitch') {
      el = document.querySelector('[data-a-target="stream-title"], h2[title]');
      var cat = document.querySelector('[data-a-target="stream-game-link"]');
      return { title: (el ? el.textContent : '') + ' ' + t, channel: location.pathname.slice(1),
        category: cat ? cat.textContent : '' };
    }
    if (platform === 'tiktok') {
      el = document.querySelector('[data-e2e="browse-video-desc"], [data-e2e="video-desc"]');
      return { title: (el ? el.textContent : '') + ' ' + t,
        channel: (location.pathname.match(/@([\w.-]+)/) || [])[1] || '' };
    }
    el = document.querySelector('meta[property="og:title"]');
    return { title: (el ? el.content : '') + ' ' + t,
      channel: (location.pathname.match(/^\/([\w.]+)\//) || [])[1] || '' };
  }

  var covered = false;
  function checkPage() {
    if (!on()) { uncover(); return; }
    var info = pageInfo();
    info.platform = platform;
    var v = F.check(info, settings);
    if (v.blocked) cover(v); else uncover();
  }

  function cover(v) {
    if (covered) return;
    covered = true;
    report({ category: v.category, label: v.label, rule: v.rule, where: 'page' });

    /* Pause anything already playing. A blocked page that keeps talking has
       not blocked anything. */
    document.querySelectorAll('video, audio').forEach(function (m) {
      try { m.pause(); m.muted = true; } catch (e) {}
    });

    var wrap = document.createElement('div');
    wrap.id = 'ncfs-cover';
    wrap.innerHTML =
      '<div class="ncfs-card">' +
        '<div class="ncfs-mark">NovaClip</div>' +
        '<h1>Blocked</h1>' +
        '<p>This page matched <b>' + esc(v.label || 'a blocked category') + '</b> in your family settings.</p>' +
        '<p class="ncfs-small">A parent can change this in the NovaClip Family Dashboard.</p>' +
        '<button id="ncfs-back">Go back</button>' +
      '</div>';
    document.documentElement.appendChild(wrap);
    var b = document.getElementById('ncfs-back');
    if (b) b.addEventListener('click', function () { history.length > 1 ? history.back() : (location.href = 'about:blank'); });
  }

  function uncover() {
    covered = false;
    var c = document.getElementById('ncfs-cover');
    if (c) c.remove();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ==========================================================================
     Search terms

     A child who searches "thinspo" should not see the results page at all,
     and this is the one surface where blocking is unambiguous.
     ========================================================================== */
  function checkSearch() {
    if (!on() || !settings.safeSearch) return;
    var q = new URLSearchParams(location.search);
    var term = q.get('search_query') || q.get('q') || '';
    if (!term) return;
    var v = F.check({ platform: platform, title: term }, settings);
    if (v.blocked) cover(v);
  }

  /* ==========================================================================
     Keeping up with a single-page app
     ========================================================================== */
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      sweep();
    });
  }

  var lastUrl = location.href;
  function start() {
    sweep();
    checkPage();
    checkSearch();

    new MutationObserver(function () {
      schedule();
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        uncover();
        /* These sites swap the page without a navigation event, and the new
           title lands a beat after the URL does. */
        setTimeout(function () { checkPage(); checkSearch(); }, 400);
        setTimeout(checkPage, 1200);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    /* Titles arrive late on all four. A few cheap re-checks catch that
       without polling forever. */
    [800, 2000, 4000].forEach(function (ms) { setTimeout(checkPage, ms); });
  }
})();
