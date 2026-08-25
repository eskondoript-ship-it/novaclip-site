/* ============================================================================
   TEENVERSE — the uploaded design's frontend, on NovaClip's own machinery
   ============================================================================
   The upload is a React app with a mock data file: invented users, invented
   clubs, an invented conversation. For a prototype that is exactly right — it
   is showing you a shape.

   This is that shape with real things behind it:

     tab            what it actually does
     -------------  -------------------------------------------------------
     Feed           posts from the leaderboard worker's /feed and /post,
                    which is the same store community.html already used
     Clubs          /groups, /groups/create, /groups/join — real groups with
                    real membership
     Showcase       your own posts marked as showcase, plus what others have
                    shared. No stock photography.
     Study Lounge   the wall-clock pomodoro, the goal list and the synthesised
                    sound from study.html, in this design's clothes
     Advice & Vibes posts in the advice channel, with the safety modal one tap
                    away on every screen
     Gifts          NovaCoins, what they unlock — and the MODERATOR TOOLS

   WHERE IT DEPARTS FROM THE UPLOAD

   The Gifts tab is not in the upload at all. It is NovaClip's, it was in
   socials.html before this, and taking it away to be faithful to a design
   would have removed something that works. It is built in the same language.

   The mock data is gone. Where there is nothing yet, the page says so. A feed
   of invented teenagers saying invented things to each other is the one thing
   a community page must not ship with, because the first real user posts into
   a crowd that is not there.

   THE SIGNATURE THE FIRST ATTEMPT MISSED

   Skew. Every active pill, every primary button, every badge is skewed a few
   degrees with its label counter-skewed so the text stays upright. It is in
   theme-teenverse.css as .tv-skew4/5/6/10 and it is most of why the design
   reads the way it does.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('tvApp');
  if (!root) return;

  var $ = function (id) { return document.getElementById(id); };

  /* ---- icons ------------------------------------------------------------ */
  var S = function (d) {
    return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' " +
           "stroke-linecap='round' stroke-linejoin='round'>" + d + '</svg>';
  };
  var I = {
    spark:  S("<path d='M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z'/>"),
    compass:S("<circle cx='12' cy='12' r='10'/><path d='M16.2 7.8l-2.9 6.5-6.5 2.9 2.9-6.5 6.5-2.9z'/>"),
    users:  S("<path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'/>"),
    palette:S("<circle cx='13.5' cy='6.5' r='.5'/><circle cx='17.5' cy='10.5' r='.5'/><circle cx='8.5' cy='7.5' r='.5'/><circle cx='6.5' cy='12.5' r='.5'/><path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z'/>"),
    head:   S("<path d='M3 18v-6a9 9 0 0118 0v6'/><path d='M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z'/>"),
    heart:  S("<path d='M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0016.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4 3 5.5l7 7 7-7z'/>"),
    gift:   S("<path d='M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z'/><path d='M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z'/>"),
    shield: S("<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><path d='M9 12l2 2 4-4'/>"),
    plus:   S("<path d='M12 5v14M5 12h14'/>"),
    bell:   S("<path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.7 21a2 2 0 01-3.4 0'/>"),
    search: S("<circle cx='11' cy='11' r='8'/><path d='M21 21l-4.3-4.3'/>"),
    x:      S("<path d='M18 6L6 18M6 6l12 12'/>"),
    award:  S("<circle cx='12' cy='8' r='6'/><path d='M15.5 13.5L17 22l-5-3-5 3 1.5-8.5'/>"),
    flame:  S("<path d='M12 2s4 4 4 8a4 4 0 01-8 0c0-1.5.5-2.5 1-3 0 2 1 3 2 3s1-2 1-4c0-2-1-3-1-4z'/><path d='M5 14a7 7 0 1014 0c0-3-2-5-4-7 1 4-1 6-3 6s-2-2-2-4c-3 2-5 4-5 5z'/>"),
    clock:  S("<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>"),
    msg:    S("<path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'/>"),
    flag:   S("<path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'/><path d='M4 22v-7'/>"),
    check:  S("<circle cx='12' cy='12' r='10'/><path d='M8 12l3 3 5-6'/>"),
    warn:   S("<path d='M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z'/><path d='M12 9v4M12 17h.01'/>"),
    eyeoff: S("<path d='M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19'/><path d='M1 1l22 22M14.12 14.12a3 3 0 11-4.24-4.24'/>"),
    eye:    S("<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z'/><circle cx='12' cy='12' r='3'/>"),
    gavel:  S("<path d='M14 13l-7.8 7.8a2 2 0 01-2.8-2.8L11.2 10'/><path d='M9 8l7 7M13 4l7 7M11 6l2-2 7 7-2 2z'/>"),
    play:   S("<path d='M5 3l14 9-14 9V3z'/>"),
    pause:  S("<path d='M6 4h4v16H6zM14 4h4v16h-4z'/>"),
    reset:  S("<path d='M3 2v6h6'/><path d='M3.5 13a9 9 0 102.6-6.4L3 9'/>")
  };

  /* ---- tabs -------------------------------------------------------------- */
  var TABS = [
    { id: 'feed',     label: 'Feed',           icon: I.compass },
    { id: 'clubs',    label: 'Clubs',          icon: I.users },
    { id: 'showcase', label: 'Showcase',       icon: I.palette },
    { id: 'study',    label: 'Study Lounge',   icon: I.head },
    { id: 'advice',   label: 'Advice & Vibes', icon: I.heart },
    { id: 'gifts',    label: 'Gifts',          icon: I.gift }
  ];

  var CHANNELS = [
    { id: 'all',      label: 'All Channels',     emoji: '✨' },
    { id: 'creative', label: 'Arts & Creative',  emoji: '🎨' },
    { id: 'study',    label: 'Study & Academics',emoji: '📚' },
    { id: 'tech',     label: 'Tech & Game Dev',  emoji: '💻' },
    { id: 'music',    label: 'Music & Audio',    emoji: '🎵' },
    { id: 'advice',   label: 'Peer Advice',      emoji: '💬' },
    { id: 'wellness', label: 'Wellness & Eco',   emoji: '🌿' },
    { id: 'general',  label: 'Hangout Lounge',   emoji: '☕' }
  ];

  var EMOJI = ['🔥', '💜', '💡', '🚀', '👏', '💯'];

  var S_ = {
    tab: 'feed', channel: 'all', sort: 'hot', q: '',
    posts: [], clubs: [], hidden: [], mod: null, notifs: []
  };

  /* ---- helpers ----------------------------------------------------------- */
  function esc(t) {
    return String(t == null ? '' : t).replace(/[<>&"]/g, function (m) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[m];
    });
  }
  function ls(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function server() { try { return typeof ncServer === 'function' ? ncServer() : ''; } catch (e) { return ''; } }
  function myKey() { try { return localStorage.getItem('nc_key') || ''; } catch (e) { return ''; } }
  function myCode() { try { return localStorage.getItem('nc_code') || ''; } catch (e) { return ''; } }
  function myName() { try { return localStorage.getItem('nc_name') || ''; } catch (e) { return ''; } }
  function myPts() { try { return parseInt(localStorage.getItem('nc_points') || '0', 10); } catch (e) { return 0; } }
  function ago(ms) {
    if (!ms) return '';
    var d = Date.now() - ms;
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }
  function api(path, body) {
    var s = server();
    if (!s) return Promise.reject(new Error('no server'));
    var opts = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { cache: 'no-store' };
    return fetch(s.replace(/\/$/, '') + path, opts).then(function (r) { return r.json(); });
  }

  /* ---- toasts ------------------------------------------------------------ */
  function toast(msg, kind) {
    var wrap = $('tvToasts');
    if (!wrap) return;
    kind = kind || 'info';
    var el = document.createElement('div');
    el.className = 'tv-toast ' + kind;
    el.innerHTML = (kind === 'success' ? I.check : kind === 'error' ? I.warn : I.spark) +
                   '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  /* ======================================================================
     NAVBAR
     ====================================================================== */
  function navbar() {
    var name = myName() || 'You';
    return (
      "<header class='tv-nav'><div class='tv-nav-in'>" +
        "<div class='tv-nav-row'>" +
          "<button class='tv-brand' id='tvBrand' type='button'>" +
            "<span class='sq'>" + I.spark + '</span>' +
            '<span><span class="nm">Teen<em>Verse</em>' +
              "<span class='tag tv-skew10'><span>Community</span></span></span>" +
              "<span class='sub'>CONNECT • CREATE • GROW</span></span>" +
          '</button>' +

          "<div class='tv-search'>" + I.search +
            "<input id='tvQ' type='text' placeholder='Search topics, #tags, clubs, projects…'>" +
            "<button class='x' id='tvQX' type='button' hidden aria-label='Clear'>" + I.x + '</button>' +
          '</div>' +

          "<nav class='tv-links' id='tvLinks' role='tablist'></nav>" +

          "<div class='tv-nav-acts'>" +
            "<button class='tv-btn tv-btn-mag tv-btn-sm tv-skew6' id='tvCreate' type='button'>" +
              '<span>' + I.plus + '</span><span>Create</span></button>' +
            "<div style='position:relative'>" +
              "<button class='tv-iconbtn' id='tvBell' type='button' aria-label='Notifications'>" +
                I.bell + "<span class='pip' id='tvPip' hidden></span></button>" +
              "<div class='tv-drop' id='tvNotifs' hidden></div>" +
            '</div>' +
            "<button class='tv-iconbtn' id='tvSafe' type='button' aria-label='Safety and help' " +
              "style='color:var(--tv-cyan)'>" + I.shield + '</button>' +
            "<button class='tv-pill' id='tvProfile' type='button'>" +
              "<span class='av'>🦄</span>" +
              "<span class='who'><b>" + esc(name) + '</b>' +
              '<span>' + I.award + '<span>' + myPts() + ' XP</span></span></span></button>' +
            "<button class='tv-iconbtn tv-burger' id='tvBurger' type='button' aria-label='Menu'>" +
              I.compass + '</button>' +
          '</div>' +
        '</div>' +

        "<div class='tv-msearch'><div class='tv-search' style='max-width:none;display:block'>" +
          I.search + "<input id='tvQ2' type='text' placeholder='Search topics, clubs, tags…'>" +
        '</div></div>' +

        "<div class='tv-mobile' id='tvMobile' hidden></div>" +
      '</div></header>'
    );
  }

  function paintLinks() {
    var nav = $('tvLinks'), mob = $('tvMobile');
    if (!nav) return;
    nav.innerHTML = TABS.map(function (t) {
      /* title, because between 1024 and 1500 the rail leaves no room for the
         labels and these become icons only. */
      return "<button class='tv-link' role='tab' id='tvlink-" + t.id + "' type='button' " +
             "title='" + t.label + "' aria-label='" + t.label + "' " +
             "aria-selected='" + (S_.tab === t.id) + "'>" + t.icon + '<span>' + t.label + '</span></button>';
    }).join('');
    mob.innerHTML = TABS.map(function (t) {
      return "<button type='button' data-m='" + t.id + "' aria-selected='" + (S_.tab === t.id) + "'>" +
             t.icon + '<span>' + t.label + '</span></button>';
    }).join('') +
      "<button type='button' data-safe='1' style='color:var(--tv-cyan)'>" + I.shield +
      '<span>Safe Harbor &amp; Resources</span></button>';

    TABS.forEach(function (t) {
      var b = $('tvlink-' + t.id);
      if (b) b.onclick = function () { go(t.id); };
    });
    [].forEach.call(mob.querySelectorAll('[data-m]'), function (b) {
      b.onclick = function () { go(b.getAttribute('data-m')); mob.hidden = true; };
    });
    var sf = mob.querySelector('[data-safe]');
    if (sf) sf.onclick = function () { mob.hidden = true; openSafety(); };
  }

  /* ======================================================================
     FEED
     ====================================================================== */
  function channelBar() {
    return "<div class='tv-channels tv-noscroll'><div class='row'>" +
      CHANNELS.map(function (c) {
        var n = c.id === 'all' ? S_.posts.length
              : S_.posts.filter(function (p) { return (p.channel || 'general') === c.id; }).length;
        return "<button class='tv-ch' type='button' data-ch='" + c.id + "' " +
               "aria-selected='" + (S_.channel === c.id) + "'>" +
               '<span>' + c.emoji + '</span><span>' + c.label + "</span><span class='n'>" + n + '</span></button>';
      }).join('') + '</div></div>';
  }

  function visible() {
    var out = S_.posts.filter(function (p) { return S_.hidden.indexOf(String(p.id)) < 0; });
    if (S_.channel !== 'all') out = out.filter(function (p) { return (p.channel || 'general') === S_.channel; });
    if (S_.q) {
      var q = S_.q.toLowerCase();
      out = out.filter(function (p) {
        return ((p.title || '') + ' ' + (p.text || '') + ' ' + (p.tags || []).join(' ') +
                ' ' + (p.name || '')).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (S_.sort === 'new') out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    else out.sort(function (a, b) { return (b.up || 0) - (a.up || 0) || (b.at || 0) - (a.at || 0); });
    return out;
  }

  function postCard(p) {
    var mine = myName() && p.name === myName();
    var ups = ls('nc_tv_up', {});
    var up = !!ups[p.id];
    var reacts = p.reactions || {};
    return (
      "<article class='tv-post" + (p.pinned ? ' pin' : '') + "' data-p='" + esc(p.id) + "'>" +
        (p.pinned ? "<div class='pinbar'><span>📌 PINNED</span>" +
                    "<span class='tv-chip mag'>FEATURED</span></div>" : '') +
        "<div class='body'>" +
          "<div class='top'><div class='who'>" +
            "<span class='av'>" + (p.avatar || '👤') + '</span>' +
            "<div><div class='nm'><b>" + esc(p.name || 'Someone') + '</b>' +
              (mine ? "<span class='tv-chip'>YOU</span>" : '') + '</div>' +
              "<div class='meta'><span>" + ago(p.at) + '</span>' +
              (p.club ? "<span>•</span><span style='color:var(--tv-magenta);font-weight:700'>" +
                        esc(p.club) + '</span>' : '') + '</div>' +
            '</div></div>' +
            "<span class='tv-chip grey'>" + esc(p.channel || 'general') + '</span>' +
          '</div>' +
          (p.title ? '<h3>' + esc(p.title) + '</h3>' : '') +
          "<p class='txt'>" + esc(p.text || '') + '</p>' +
          ((p.tags || []).length
            ? "<div class='tags'>" + p.tags.map(function (t) {
                return "<button type='button' data-tag='" + esc(t) + "'>#" + esc(t) + '</button>';
              }).join('') + '</div>'
            : '') +
          "<div class='bar'><div class='l'>" +
            "<button class='tv-act" + (up ? ' on' : '') + "' type='button' data-up='" + esc(p.id) + "'>" +
              I.heart + "<span class='c'>" + (p.up || 0) + '</span></button>' +
            EMOJI.map(function (e) {
              var n = reacts[e] || 0;
              return "<button class='tv-emoji" + (n ? ' on' : '') + "' type='button' data-re='" +
                     esc(p.id) + "' data-e='" + e + "'>" + e + (n ? ' ' + n : '') + '</button>';
            }).join('') +
          '</div>' +
          "<button class='tv-act' type='button' data-flag='" + esc(p.id) + "' title='Report'>" +
            I.flag + '<span>Report</span></button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function viewFeed() {
    var name = myName() || 'creator';
    var list = visible();
    return (
      "<div class='tv-hero'><div class='g1'></div><div class='g2'></div><div class='in'>" +
        "<div class='kick'><span>" + I.spark + '</span><span>WELCOME, ' + esc(name.toUpperCase()) +
          ' • 100% TEEN SPACE</span></div>' +
        '<h1>Where youth passion meets <em>real art &amp; tech.</em></h1>' +
        '<p>Show your edits, code, art and music, join a focus room, swap advice that is actually ' +
        'useful, and find people working on the same thing you are.</p>' +
        "<div class='acts'>" +
          "<button class='tv-btn tv-btn-mag tv-skew6' id='tvHeroPost' type='button'>" +
            '<span>' + I.plus + '</span><span>Share something new</span></button>' +
          "<button class='tv-btn tv-btn-ghost tv-skew6' id='tvHeroStudy' type='button'>" +
            '<span style="color:var(--tv-cyan)">' + I.head + '</span><span>Join study lounge</span></button>' +
        '</div>' +
      '</div></div>' +

      channelBar() +

      "<div class='tv-grid'>" +
        "<div class='tv-feed'>" +
          "<div class='tv-sort' style='align-self:flex-start'>" +
            "<button type='button' data-sort='hot' aria-selected='" + (S_.sort === 'hot') + "'>" +
              I.flame + '<span>Hot</span></button>' +
            "<button type='button' data-sort='new' aria-selected='" + (S_.sort === 'new') + "'>" +
              I.clock + '<span>Newest</span></button>' +
          '</div>' +
          (list.length
            ? list.map(postCard).join('')
            : "<div class='tv-empty'><h3>Nothing here yet</h3>" +
              '<p>' + (server()
                ? 'No posts in this channel. Be the first — that is genuinely how every one of ' +
                  'these starts.'
                : 'There is no community server set on this browser, so there is nobody to talk to ' +
                  'yet. Everything else on this page works without one.') + '</p>' +
              "<button class='tv-btn tv-btn-green tv-skew6' id='tvEmptyPost' type='button'>" +
              '<span>' + I.plus + '</span><span>Write the first one</span></button></div>') +
        '</div>' +

        "<div class='tv-side'>" +
          widgetClubs() + widgetStudy() + widgetVibe() + widgetTags() +
        '</div>' +
      '</div>'
    );
  }

  function widgetClubs() {
    return "<div class='tv-widget'><div class='hd'>" + I.users + '<h3>Active clubs</h3></div>' +
      "<div class='in'>" + (S_.clubs.length
        ? S_.clubs.slice(0, 4).map(function (c) {
            return "<button type='button' data-club='" + esc(c.id || c.name) + "' " +
              "style='display:flex;gap:10px;align-items:center;width:100%;background:none;border:0;" +
              "cursor:pointer;padding:8px 0;text-align:left;color:inherit'>" +
              "<span style='font-size:22px;padding:4px;background:#000;border-radius:8px;" +
              "border:1px solid var(--tv-n800)'>" + (c.icon || '🎯') + '</span>' +
              "<span><b style='display:block;font-size:13px;color:#fff'>" + esc(c.name) + '</b>' +
              "<span class='tv-mono'>" + (c.members || 1) + ' members</span></span></button>';
          }).join('')
        : "<p class='none'>No clubs yet. Start one from the Clubs tab.</p>") + '</div></div>';
  }
  function widgetStudy() {
    return "<div class='tv-widget'><div class='hd'>" + I.head + '<h3>Study lounge</h3></div>' +
      "<div class='in'><p style='font-size:13px;color:var(--tv-n300);line-height:1.6;margin:0 0 12px'>" +
      'Twenty-five minutes on, five off. The clock runs off the wall, so it stays right even when ' +
      'the tab is in the background.</p>' +
      "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-goto='study'>" +
      '<span>Open the lounge</span></button></div></div>';
  }
  function widgetVibe() {
    /* Rotates by the day rather than at random, so two people on the same day
       see the same one and it is something they can mention to each other. */
    var VIBES = [
      'Somebody out there is stuck on exactly the thing you worked out last week.',
      'A rough first version that exists beats a perfect one that does not.',
      'You are allowed to make things that are only for you.',
      'Comparing your behind-the-scenes to somebody else’s highlight reel is a rigged game.',
      'Asking for help early is a skill, not an admission.',
      'The people who got good at this were bad at it for longer than you think.',
      'Rest is part of the work, not a break from it.'
    ];
    var day = Math.floor(Date.now() / 86400000) % VIBES.length;
    return "<div class='tv-widget'><div class='hd'>" + I.spark + '<h3>Vibe of the day</h3></div>' +
      "<div class='in'><p style='font-size:14px;color:#fff;line-height:1.6;margin:0;font-weight:600'>" +
      esc(VIBES[day]) + '</p></div></div>';
  }
  function widgetTags() {
    var counts = {};
    S_.posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 8);
    return "<div class='tv-widget'><div class='hd'>" + I.flame + '<h3>Trending tags</h3></div>' +
      "<div class='in'>" + (top.length
        ? "<div style='display:flex;flex-wrap:wrap;gap:6px'>" + top.map(function (t) {
            return "<button class='tv-chip grey' type='button' data-tag='" + esc(t) + "' " +
                   "style='cursor:pointer'>#" + esc(t) + ' ' + counts[t] + '</button>';
          }).join('') + '</div>'
        : "<p class='none'>Tags show up here once posts start using them.</p>") + '</div></div>';
  }

  /* ======================================================================
     CLUBS / SHOWCASE / ADVICE
     ====================================================================== */
  function viewClubs() {
    return (
      "<div style='display:flex;align-items:flex-end;justify-content:space-between;gap:16px;" +
      "flex-wrap:wrap;margin-bottom:20px'>" +
        '<div><h1 style="font-family:var(--tv-head);font-weight:900;text-transform:uppercase;' +
        'font-size:clamp(1.5rem,3.6vw,2.25rem);color:#fff;letter-spacing:-.02em">Clubs</h1>' +
        "<p style='font-size:13px;color:var(--tv-n400);margin:4px 0 0'>Small groups with their own " +
        'feed. Join one, or start the one that should exist.</p></div>' +
        "<button class='tv-btn tv-btn-green tv-skew6' id='tvNewClub' type='button'>" +
        '<span>' + I.plus + '</span><span>Start a club</span></button>' +
      '</div>' +
      (S_.clubs.length
        ? "<div style='display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))'>" +
          S_.clubs.map(function (c) {
            return "<div class='tv-card' style='padding:18px'>" +
              "<div style='display:flex;align-items:center;gap:12px;margin-bottom:10px'>" +
              "<span style='font-size:30px'>" + (c.icon || '🎯') + '</span>' +
              "<div><h3 style='font-family:var(--tv-head);font-weight:900;text-transform:uppercase;" +
              "font-size:15px;color:#fff'>" + esc(c.name) + '</h3>' +
              "<span class='tv-mono'>" + (c.members || 1) + ' members</span></div></div>' +
              "<p style='font-size:13px;color:var(--tv-n300);line-height:1.6;margin:0 0 14px'>" +
              esc(c.about || 'No description yet.') + '</p>' +
              "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-join='" +
              esc(c.id || c.name) + "'><span>" + (c.joined ? 'Open' : 'Join') + '</span></button></div>';
          }).join('') + '</div>'
        : "<div class='tv-empty'><h3>No clubs yet</h3><p>" +
          (server() ? 'Nobody has started one. It takes about ten seconds.'
                    : 'Clubs live on the community server, and there is not one set on this browser yet.') +
          '</p></div>')
    );
  }

  function viewShowcase() {
    var shows = S_.posts.filter(function (p) { return p.channel === 'creative' || p.showcase; });
    return (
      "<div style='margin-bottom:20px'>" +
      '<h1 style="font-family:var(--tv-head);font-weight:900;text-transform:uppercase;' +
      'font-size:clamp(1.5rem,3.6vw,2.25rem);color:#fff;letter-spacing:-.02em">Showcase</h1>' +
      "<p style='font-size:13px;color:var(--tv-n400);margin:4px 0 0'>Finished things, and things " +
      'that are not finished but are worth looking at anyway.</p></div>' +
      (shows.length
        ? "<div style='display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))'>" +
          shows.map(postCard).join('') + '</div>'
        : "<div class='tv-empty'><h3>Nothing on the wall</h3>" +
          '<p>Post something to the Arts &amp; Creative channel and it lands here. Screenshots, ' +
          'clips, a track, half a game — all of it counts.</p>' +
          "<button class='tv-btn tv-btn-green tv-skew6' id='tvShowPost' type='button'>" +
          '<span>' + I.plus + '</span><span>Share something</span></button></div>')
    );
  }

  function viewAdvice() {
    var advice = S_.posts.filter(function (p) { return p.channel === 'advice'; });
    return (
      "<div class='tv-hero' style='border-left-color:var(--tv-cyan)'><div class='g2'></div>" +
      "<div class='in'>" +
        "<div class='kick' style='color:var(--tv-cyan);border-color:rgba(0,242,255,.4);" +
        "box-shadow:0 0 8px rgba(0,242,255,.2)'><span>" + I.heart + '</span><span>PEER ADVICE</span></div>' +
        '<h1>Ask the thing you have been <em style="color:var(--tv-cyan)">sitting on.</em></h1>' +
        '<p>Answers from people the same age as you, going through the same year. Nobody here is ' +
        'a professional, and for anything serious the button below goes to people who are.</p>' +
        "<div class='acts'>" +
          "<button class='tv-btn tv-btn-mag tv-skew6' id='tvAskBtn' type='button'>" +
            '<span>' + I.msg + '</span><span>Ask something</span></button>' +
          "<button class='tv-btn tv-btn-ghost tv-skew6' id='tvSafeBtn2' type='button'>" +
            '<span style="color:var(--tv-cyan)">' + I.shield + '</span><span>If it is serious</span></button>' +
        '</div>' +
      '</div></div>' +
      (advice.length
        ? "<div class='tv-feed'>" + advice.map(postCard).join('') + '</div>'
        : "<div class='tv-empty'><h3>No questions yet</h3><p>Somebody has to go first, and the " +
          'first one is always the hardest. It does not have to be a big thing.</p></div>')
    );
  }

  /* ======================================================================
     STUDY LOUNGE — the real pomodoro, in this design's clothes
     ====================================================================== */
  var pom = { mode: 'focus', endsAt: 0, running: false, tick: 0 };
  var POM = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

  function viewStudy() {
    return (
      "<div style='margin-bottom:20px'>" +
      '<h1 style="font-family:var(--tv-head);font-weight:900;text-transform:uppercase;' +
      'font-size:clamp(1.5rem,3.6vw,2.25rem);color:#fff;letter-spacing:-.02em">Study lounge</h1>' +
      "<p style='font-size:13px;color:var(--tv-n400);margin:4px 0 0'>Twenty-five on, five off. " +
      'Everything here stays on this device.</p></div>' +
      "<div style='display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));" +
      "align-items:start'>" +
        "<div class='tv-card' style='padding:22px;text-align:center'>" +
          "<div style='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:18px'>" +
            "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-pom='focus'><span>Focus · 25</span></button>" +
            "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-pom='short'><span>Break · 5</span></button>" +
            "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-pom='long'><span>Long · 15</span></button>" +
          '</div>' +
          "<div id='tvClock' style='font-family:var(--tv-mono);font-size:clamp(2.6rem,9vw,3.6rem);" +
          "font-weight:900;color:var(--tv-green);letter-spacing:-.02em;line-height:1'>25:00</div>" +
          "<div id='tvPhase' class='tv-mono' style='margin:6px 0 18px;letter-spacing:.16em'>FOCUS</div>" +
          "<div style='display:flex;gap:8px;justify-content:center'>" +
            "<button class='tv-btn tv-btn-green tv-skew6' id='tvPomGo' type='button'>" +
              '<span>' + I.play + '</span><span>Start</span></button>' +
            "<button class='tv-btn tv-btn-ghost' id='tvPomReset' type='button'>" +
              '<span>' + I.reset + '</span><span>Reset</span></button>' +
          '</div>' +
        '</div>' +
        "<div class='tv-card' style='padding:22px'>" +
          "<h3 class='tv-lab' style='color:#fff;margin-bottom:12px'>This session</h3>" +
          "<div style='display:flex;gap:8px;margin-bottom:12px'>" +
            "<input id='tvGoal' placeholder='What are you getting through?' " +
            "style='flex:1;min-width:0;padding:10px 12px;border-radius:8px;background:var(--tv-bg2);" +
            "border:1px solid var(--tv-n800);color:#fff;font-family:var(--tv-sans);font-size:13px'>" +
            "<button class='tv-btn tv-btn-green tv-btn-sm' id='tvGoalAdd' type='button'><span>+</span></button>" +
          '</div>' +
          "<div id='tvGoals'></div>" +
        '</div>' +
      '</div>'
    );
  }

  function paintPom() {
    var c = $('tvClock'), ph = $('tvPhase');
    if (!c) return;
    var left = pom.running ? Math.max(0, Math.round((pom.endsAt - Date.now()) / 1000)) : POM[pom.mode];
    var m = Math.floor(left / 60), s = left % 60;
    c.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    ph.textContent = pom.mode === 'focus' ? 'FOCUS' : pom.mode === 'short' ? 'SHORT BREAK' : 'LONG BREAK';
    if (pom.running && left <= 0) {
      pom.running = false;
      clearInterval(pom.tick);
      toast(pom.mode === 'focus' ? 'Time. Take the five.' : 'Break over.', 'success');
      try { if (typeof logSkill === 'function') logSkill('focus'); } catch (e) {}
      var go = $('tvPomGo');
      if (go) go.innerHTML = '<span>' + I.play + '</span><span>Start</span>';
    }
  }
  function paintGoals() {
    var box = $('tvGoals');
    if (!box) return;
    var goals = ls('nc_study_goals', []);
    if (!goals.length) {
      box.innerHTML = "<p class='tv-mono'>Nothing on the list yet.</p>";
      return;
    }
    box.innerHTML = goals.map(function (g, i) {
      return "<div style='display:flex;align-items:center;gap:10px;padding:9px 0;" +
        "border-bottom:1px solid var(--tv-n900)'>" +
        "<button type='button' data-tick='" + i + "' style='width:20px;height:20px;flex:0 0 auto;" +
        'border-radius:6px;cursor:pointer;border:1px solid var(--tv-n700);' +
        "background:" + (g.done ? 'var(--tv-green)' : 'transparent') + ";color:#000;font-weight:900;" +
        "font-size:12px;line-height:1'>" + (g.done ? '✓' : '') + '</button>' +
        "<span style='flex:1;min-width:0;font-size:13px;color:" +
        (g.done ? 'var(--tv-n500);text-decoration:line-through' : '#fff') + "'>" + esc(g.t) + '</span>' +
        "<button type='button' data-del='" + i + "' style='background:none;border:0;cursor:pointer;" +
        "color:var(--tv-n500);font-size:16px'>×</button></div>";
    }).join('');
  }

  /* ======================================================================
     GIFTS + MODERATOR TOOLS
     ====================================================================== */
  function viewGifts() {
    var pts = myPts();
    var unlocked = ls('nc_unlocked', []);
    return (
      "<div style='margin-bottom:20px'>" +
      '<h1 style="font-family:var(--tv-head);font-weight:900;text-transform:uppercase;' +
      'font-size:clamp(1.5rem,3.6vw,2.25rem);color:#fff;letter-spacing:-.02em">Gifts</h1>' +
      "<p style='font-size:13px;color:var(--tv-n400);margin:4px 0 0'>What your NovaCoins have " +
      'unlocked, and the moderator queue if you are one.</p></div>' +

      "<div class='tv-card' style='padding:22px;margin-bottom:16px;display:flex;align-items:center;" +
      "gap:18px;flex-wrap:wrap'>" +
        "<span style='font-size:42px'>🪙</span>" +
        "<div style='flex:1;min-width:180px'>" +
          "<div style='font-family:var(--tv-mono);font-size:11px;color:var(--tv-n500);" +
          "text-transform:uppercase;letter-spacing:.1em'>NovaCoins</div>" +
          "<div style='font-family:var(--tv-mono);font-size:30px;font-weight:900;color:var(--tv-green)'>" +
          pts + '</div></div>' +
        "<div class='tv-chip'>" + unlocked.length + ' unlocked</div>' +
      '</div>' +

      (unlocked.length
        ? "<div style='display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));" +
          "margin-bottom:28px'>" + unlocked.map(function (u) {
            return "<div class='tv-card' style='padding:14px;display:flex;align-items:center;gap:10px'>" +
              "<span style='font-size:22px'>🎁</span>" +
              "<b style='font-size:13px;color:#fff'>" + esc(u) + '</b></div>';
          }).join('') + '</div>'
        : "<div class='tv-empty' style='margin-bottom:28px'><h3>Nothing unlocked yet</h3>" +
          '<p>NovaCoins come from finishing things — exports, trend scans, games, study ' +
          'sessions. They are not buyable, on purpose.</p></div>') +

      "<div class='tv-mod' id='tvModZone'></div>"
    );
  }

  function paintMod() {
    var zone = $('tvModZone');
    if (!zone) return;
    if (!server()) {
      zone.innerHTML = "<div class='tv-widget'><div class='hd'>" + I.gavel +
        '<h3>Moderator tools</h3></div>' +
        "<div class='in'><p class='none'>Moderation runs on the community server and there is not " +
        'one set on this browser.</p></div></div>';
      return;
    }
    zone.innerHTML = "<div class='tv-widget'><div class='hd'>" + I.gavel +
      "<h3>Moderator tools</h3></div><div class='in'><p class='none'>Checking…</p></div></div>";

    api('/mod/queue', { key: myKey() }).then(function (out) {
      if (out.error === 'not_a_moderator') {
        zone.innerHTML = "<div class='tv-widget'><div class='hd'>" + I.gavel +
          '<h3>Moderator tools</h3></div>' +
          "<div class='in'><p class='none'>You are not a moderator on this server. If somebody " +
          'reports a post, a moderator sees it here — and every action they take is written ' +
          'to a log that other moderators can read.</p></div></div>';
        return;
      }
      if (out.error === 'no_moderators') {
        zone.innerHTML = "<div class='tv-widget'><div class='hd'>" + I.gavel +
          '<h3>Moderator tools</h3></div>' +
          "<div class='in'><p class='none'>" + esc(out.message) + '</p></div></div>';
        return;
      }
      S_.mod = out;
      renderMod(zone, out);
    }).catch(function () {
      zone.innerHTML = "<div class='tv-widget'><div class='hd'>" + I.gavel +
        "<h3>Moderator tools</h3></div><div class='in'><p class='none'>Could not reach the " +
        'server.</p></div></div>';
    });
  }

  function renderMod(zone, out) {
    var open = (out.queue || []).filter(function (r) { return r.state === 'open'; });
    zone.innerHTML =
      "<div class='tv-widget' style='margin-bottom:16px'><div class='hd'>" + I.gavel +
        "<h3>Report queue</h3><span class='tv-count' style='margin-left:auto'>" + open.length +
        ' open</span></div>' +
        "<div class='in'>" +
          (out.queue && out.queue.length
            ? out.queue.map(function (r) {
                var hidden = (out.hidden || []).indexOf(r.postId) >= 0;
                return "<div class='tv-modrow" + (r.count > 2 ? ' hot' : '') +
                  (r.state !== 'open' ? ' done' : '') + "'>" +
                  "<div class='l'><b>" + esc(r.reason) +
                    (r.count > 1 ? " <span class='tv-count'>×" + r.count + '</span>' : '') + '</b>' +
                    (r.note ? '<p>' + esc(r.note) + '</p>' : '') +
                    "<span class='id'>" + esc(r.postId) + ' · ' + ago(r.at) +
                    (r.state !== 'open' ? ' · ' + esc(r.state) : '') + '</span></div>' +
                  "<div class='acts'>" +
                    "<button class='tv-btn tv-btn-amber tv-btn-sm' type='button' data-act='" +
                      (hidden ? 'unhide' : 'hide') + "' data-id='" + esc(r.postId) + "'>" +
                      (hidden ? I.eye : I.eyeoff) + '<span>' + (hidden ? 'Unhide' : 'Hide') + '</span></button>' +
                    "<button class='tv-btn tv-btn-ghost tv-btn-sm' type='button' data-act='dismiss' " +
                      "data-id='" + esc(r.postId) + "'><span>Dismiss</span></button>" +
                  '</div></div>';
              }).join('')
            : "<p class='none'>Nothing reported. That is the good outcome.</p>") +
        '</div></div>' +

      "<div class='tv-widget' style='margin-bottom:16px'><div class='hd'>" + I.warn +
        '<h3>Suspend an account</h3></div>' +
        "<div class='in'>" +
          "<p style='font-size:12px;color:var(--tv-n400);line-height:1.6;margin:0 0 12px'>" +
          'Two days, server-side, so clearing the browser does not undo it. Use the recovery code ' +
          'from the report, and say why — the reason goes in the log with your name on it.</p>' +
          "<div class='tv-field'><input id='tvSusCode' placeholder='NOVA-XXXX-XXXX'></div>" +
          "<div class='tv-field'><input id='tvSusWhy' placeholder='Why'></div>" +
          "<button class='tv-btn tv-btn-danger tv-btn-sm' id='tvSusGo' type='button'>" +
          '<span>Suspend for two days</span></button>' +
        '</div></div>' +

      "<div class='tv-widget'><div class='hd'>" + I.clock + '<h3>Moderator log</h3></div>' +
        "<div class='in'>" +
          "<p style='font-size:12px;color:var(--tv-n400);line-height:1.6;margin:0 0 10px'>" +
          'Append-only. Hiding something and quietly unhiding it leaves both lines.</p>' +
          ((out.log || []).length
            ? out.log.map(function (l) {
                return "<div class='tv-logrow'><b>" + esc(l.act) + '</b>' +
                  '<span>' + esc(l.postId || l.reason || '') + '</span>' +
                  "<span style='color:var(--tv-n500)'>by " + esc(l.by) + '</span>' +
                  '<time>' + ago(l.at) + '</time></div>';
              }).join('')
            : "<p class='none'>Nothing done yet.</p>") +
        '</div></div>';

    [].forEach.call(zone.querySelectorAll('[data-act]'), function (b) {
      b.onclick = function () {
        api('/mod/act', { key: myKey(), act: b.getAttribute('data-act'), postId: b.getAttribute('data-id') })
          .then(function (r) {
            if (r.error) return toast(r.error, 'error');
            toast('Done.', 'success');
            loadHidden();
            paintMod();
          });
      };
    });
    var sus = $('tvSusGo');
    if (sus) sus.onclick = function () {
      var code = ($('tvSusCode').value || '').trim();
      var why = ($('tvSusWhy').value || '').trim();
      if (!code) return toast('Which account?', 'error');
      if (!confirm('Suspend ' + code + ' for two days?\n\nReason: ' + (why || '(none given)'))) return;
      api('/mod/act', { key: myKey(), act: 'suspend', code: code, reason: why }).then(function (r) {
        if (r.error) return toast(r.error, 'error');
        toast('Suspended.', 'success');
        paintMod();
      });
    };
  }

  /* ======================================================================
     MODALS
     ====================================================================== */
  function openCreate(channel) {
    var m = $('tvCreateModal');
    m.hidden = false;
    var sel = $('tvPostCh');
    sel.innerHTML = CHANNELS.filter(function (c) { return c.id !== 'all'; })
      .map(function (c) { return "<option value='" + c.id + "'>" + c.emoji + ' ' + c.label + '</option>'; }).join('');
    if (channel) sel.value = channel;
    $('tvPostTitle').value = '';
    $('tvPostText').value = '';
    $('tvPostTags').value = '';
    setTimeout(function () { $('tvPostTitle').focus(); }, 30);
  }
  function openSafety() { $('tvSafetyModal').hidden = false; }
  function openProfile() {
    var m = $('tvProfileModal');
    m.hidden = false;
    $('tvPName').value = myName();
  }

  function submitPost() {
    var title = ($('tvPostTitle').value || '').trim();
    var text = ($('tvPostText').value || '').trim();
    var ch = $('tvPostCh').value;
    var tags = ($('tvPostTags').value || '').split(/[,\s]+/)
      .map(function (t) { return t.replace(/^#/, '').trim(); })
      .filter(Boolean).slice(0, 5);
    if (!text) return toast('Write something first.', 'error');
    if (!myName()) return toast('Set a name on your profile first.', 'error');

    var post = { id: 'p' + Date.now().toString(36), name: myName(), title: title, text: text,
                 channel: ch, tags: tags, at: Date.now(), up: 0, avatar: '🦄' };

    if (server()) {
      api('/post', { key: myKey(), code: myCode(), name: myName(),
                     text: (title ? title + '\n\n' : '') + text, channel: ch, tags: tags })
        .then(function (r) {
          if (r.error === 'suspended') {
            return toast('Your account is suspended until ' + new Date(r.until).toLocaleString() + '.', 'error');
          }
          if (r.error) return toast(r.error, 'error');
          toast('Posted.', 'success');
          $('tvCreateModal').hidden = true;
          load();
        }).catch(function () { toast('Could not reach the server.', 'error'); });
      return;
    }
    /* No server: keep it on the device rather than losing what somebody typed. */
    var local = ls('nc_tv_posts', []);
    local.unshift(post);
    set('nc_tv_posts', local.slice(0, 100));
    S_.posts = local;
    $('tvCreateModal').hidden = true;
    toast('Kept on this device — there is no community server set.', 'info');
    render();
  }

  /* ======================================================================
     DATA
     ====================================================================== */
  function loadHidden() {
    if (!server()) return Promise.resolve();
    return api('/mod/hidden').then(function (r) {
      S_.hidden = (r && r.hidden) || [];
    }).catch(function () {});
  }

  function load() {
    S_.posts = ls('nc_tv_posts', []);
    if (!server()) { render(); return; }
    Promise.all([
      api('/feed').catch(function () { return null; }),
      api('/groups', { key: myKey() }).catch(function () { return null; }),
      loadHidden()
    ]).then(function (r) {
      var feed = r[0], groups = r[1];
      if (feed && Array.isArray(feed.posts)) {
        S_.posts = feed.posts.map(function (p) {
          var t = String(p.text || '').split('\n\n');
          return { id: p.id, name: p.name, title: t.length > 1 ? t[0] : '',
                   text: t.length > 1 ? t.slice(1).join('\n\n') : (p.text || ''),
                   channel: p.channel || 'general', tags: p.tags || [],
                   at: p.at, up: p.up || 0, avatar: '👤' };
        });
      }
      if (groups && Array.isArray(groups.groups)) S_.clubs = groups.groups;
      render();
    });
  }

  /* ======================================================================
     RENDER + ROUTING
     ====================================================================== */
  var VIEWS = { feed: viewFeed, clubs: viewClubs, showcase: viewShowcase,
                study: viewStudy, advice: viewAdvice, gifts: viewGifts };

  function go(id) {
    if (!VIEWS[id]) return;
    S_.tab = id;
    try { location.hash = id; } catch (e) {}
    render();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function render() {
    $('tvMain').innerHTML = VIEWS[S_.tab]();
    paintLinks();
    wire();
    if (S_.tab === 'study') { paintPom(); paintGoals(); }
    if (S_.tab === 'gifts') paintMod();
  }

  function wire() {
    var m = $('tvMain');

    [].forEach.call(m.querySelectorAll('[data-ch]'), function (b) {
      b.onclick = function () { S_.channel = b.getAttribute('data-ch'); render(); };
    });
    [].forEach.call(m.querySelectorAll('[data-sort]'), function (b) {
      b.onclick = function () { S_.sort = b.getAttribute('data-sort'); render(); };
    });
    [].forEach.call(m.querySelectorAll('[data-tag]'), function (b) {
      b.onclick = function () { S_.q = b.getAttribute('data-tag'); $('tvQ').value = S_.q; render(); };
    });
    [].forEach.call(m.querySelectorAll('[data-goto]'), function (b) {
      b.onclick = function () { go(b.getAttribute('data-goto')); };
    });
    [].forEach.call(m.querySelectorAll('[data-up]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-up');
        var ups = ls('nc_tv_up', {});
        ups[id] = !ups[id];
        set('nc_tv_up', ups);
        var p = S_.posts.filter(function (x) { return String(x.id) === id; })[0];
        if (p) p.up = Math.max(0, (p.up || 0) + (ups[id] ? 1 : -1));
        render();
      };
    });
    [].forEach.call(m.querySelectorAll('[data-re]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-re'), e = b.getAttribute('data-e');
        var p = S_.posts.filter(function (x) { return String(x.id) === id; })[0];
        if (!p) return;
        p.reactions = p.reactions || {};
        p.reactions[e] = (p.reactions[e] || 0) + 1;
        render();
      };
    });
    [].forEach.call(m.querySelectorAll('[data-flag]'), function (b) {
      b.onclick = function () { report(b.getAttribute('data-flag')); };
    });

    var hp = $('tvHeroPost'); if (hp) hp.onclick = function () { openCreate(); };
    var hs = $('tvHeroStudy'); if (hs) hs.onclick = function () { go('study'); };
    var ep = $('tvEmptyPost'); if (ep) ep.onclick = function () { openCreate(); };
    var sp = $('tvShowPost'); if (sp) sp.onclick = function () { openCreate('creative'); };
    var ab = $('tvAskBtn'); if (ab) ab.onclick = function () { openCreate('advice'); };
    var s2 = $('tvSafeBtn2'); if (s2) s2.onclick = openSafety;
    var nc = $('tvNewClub'); if (nc) nc.onclick = newClub;

    /* study */
    [].forEach.call(m.querySelectorAll('[data-pom]'), function (b) {
      b.onclick = function () {
        pom.mode = b.getAttribute('data-pom');
        pom.running = false;
        clearInterval(pom.tick);
        paintPom();
      };
    });
    var pg = $('tvPomGo');
    if (pg) pg.onclick = function () {
      if (pom.running) {
        pom.running = false;
        clearInterval(pom.tick);
        pg.innerHTML = '<span>' + I.play + '</span><span>Start</span>';
      } else {
        /* Wall clock, not a counter: a background tab has its timers throttled
           and a counted-down pomodoro comes back minutes wrong. */
        pom.endsAt = Date.now() + POM[pom.mode] * 1000;
        pom.running = true;
        pom.tick = setInterval(paintPom, 250);
        pg.innerHTML = '<span>' + I.pause + '</span><span>Pause</span>';
      }
      paintPom();
    };
    var pr = $('tvPomReset');
    if (pr) pr.onclick = function () {
      pom.running = false; clearInterval(pom.tick); paintPom();
      if (pg) pg.innerHTML = '<span>' + I.play + '</span><span>Start</span>';
    };
    var ga = $('tvGoalAdd');
    if (ga) ga.onclick = addGoal;
    var gi = $('tvGoal');
    if (gi) gi.addEventListener('keydown', function (e) { if (e.key === 'Enter') addGoal(); });
    [].forEach.call(m.querySelectorAll('[data-tick]'), function (b) {
      b.onclick = function () {
        var g = ls('nc_study_goals', []);
        var i = +b.getAttribute('data-tick');
        if (g[i]) { g[i].done = !g[i].done; set('nc_study_goals', g); paintGoals(); }
      };
    });
    [].forEach.call(m.querySelectorAll('[data-del]'), function (b) {
      b.onclick = function () {
        var g = ls('nc_study_goals', []);
        g.splice(+b.getAttribute('data-del'), 1);
        set('nc_study_goals', g);
        paintGoals();
      };
    });
  }

  function addGoal() {
    var i = $('tvGoal');
    var v = (i.value || '').trim();
    if (!v) return;
    var g = ls('nc_study_goals', []);
    g.push({ t: v.slice(0, 120), done: false });
    set('nc_study_goals', g);
    i.value = '';
    paintGoals();
  }

  function newClub() {
    var name = prompt('What is the club called?');
    if (!name) return;
    if (!server()) return toast('Clubs need the community server.', 'error');
    api('/groups/create', { key: myKey(), code: myCode(), name: name.slice(0, 40) })
      .then(function (r) {
        if (r.error) return toast(r.error, 'error');
        toast('Club started.', 'success');
        load();
      }).catch(function () { toast('Could not reach the server.', 'error'); });
  }

  function report(id) {
    var why = prompt('What is wrong with it?\n\nBullying / Unsafe / Spam / Something else');
    if (why === null) return;
    if (!server()) return toast('Reports need the community server.', 'error');
    api('/report', { postId: id, reason: why || 'Not specified' }).then(function (r) {
      if (r.error) return toast(r.error, 'error');
      toast('Reported. A moderator will look.', 'success');
    }).catch(function () { toast('Could not send the report.', 'error'); });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    root.innerHTML =
      navbar() +
      "<main class='tv-main' id='tvMain'></main>" +
      "<footer class='tv-foot'><div class='in'>" +
        "<div class='brand'><span class='sq'>" + I.spark + '</span>' +
        '<div><b>Teen<em>Verse</em></b>' +
        '<p>A youth-first community for making things, studying and asking.</p></div></div>' +
        "<div class='links' id='tvFootLinks'></div>" +
        "<div class='fine'>For creators aged 13–18 • nothing here is sent to advertisers</div>" +
      '</div></footer>';

    $('tvFootLinks').innerHTML = TABS.map(function (t) {
      return "<button type='button' data-f='" + t.id + "'>" + t.label + '</button>';
    }).join('') + "<button type='button' class='safe' data-fsafe='1'>" + I.shield +
      '<span>Safety &amp; help</span></button>';
    [].forEach.call($('tvFootLinks').querySelectorAll('[data-f]'), function (b) {
      b.onclick = function () { go(b.getAttribute('data-f')); };
    });
    $('tvFootLinks').querySelector('[data-fsafe]').onclick = openSafety;

    $('tvBrand').onclick = function () { go('feed'); };
    $('tvCreate').onclick = function () { openCreate(); };
    $('tvSafe').onclick = openSafety;
    $('tvProfile').onclick = openProfile;
    $('tvBurger').onclick = function () { var mm = $('tvMobile'); mm.hidden = !mm.hidden; };
    $('tvBell').onclick = function () {
      var d = $('tvNotifs');
      d.hidden = !d.hidden;
      if (!d.hidden) {
        d.innerHTML = "<div class='hd'><b>" + I.bell + 'Notifications</b></div>' +
          "<div class='list'><div class='none'>Nothing yet. This fills in when somebody replies " +
          'to you or a club you are in posts.</div></div>';
        $('tvPip').hidden = true;
      }
    };
    document.addEventListener('click', function (e) {
      var d = $('tvNotifs');
      if (d && !d.hidden && !d.contains(e.target) && e.target.closest('#tvBell') === null) d.hidden = true;
    });

    function onQ(el) {
      if (!el) return;
      el.addEventListener('input', function () {
        S_.q = el.value.trim();
        var x = $('tvQX');
        if (x) x.hidden = !S_.q;
        var other = el.id === 'tvQ' ? $('tvQ2') : $('tvQ');
        if (other) other.value = el.value;
        render();
      });
    }
    onQ($('tvQ')); onQ($('tvQ2'));
    $('tvQX').onclick = function () {
      S_.q = ''; $('tvQ').value = ''; if ($('tvQ2')) $('tvQ2').value = '';
      $('tvQX').hidden = true; render();
    };

    /* modals */
    [].forEach.call(document.querySelectorAll('.tv-modal'), function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) m.hidden = true; });
      var x = m.querySelector('.x');
      if (x) x.onclick = function () { m.hidden = true; };
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      [].forEach.call(document.querySelectorAll('.tv-modal'), function (m) { m.hidden = true; });
      var d = $('tvNotifs'); if (d) d.hidden = true;
    });
    $('tvPostGo').onclick = submitPost;
    $('tvPSave').onclick = function () {
      var v = ($('tvPName').value || '').trim().slice(0, 24);
      if (!v) return toast('Names cannot be blank.', 'error');
      try { localStorage.setItem('nc_name', v); } catch (e) {}
      $('tvProfileModal').hidden = true;
      toast('Saved.', 'success');
      boot();
      load();
    };

    var h = (location.hash || '').replace('#', '');
    if (VIEWS[h]) S_.tab = h;
    addEventListener('hashchange', function () {
      var id = (location.hash || '').replace('#', '');
      if (VIEWS[id] && id !== S_.tab) { S_.tab = id; render(); }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); load(); });
  } else { boot(); load(); }
})();
