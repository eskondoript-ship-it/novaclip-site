/* ============================================================================
   CREATOR LEVEL  —  a ladder made of the channel, not of the site
   ============================================================================
   Asked for as "levels for creators based on how big is their channel".

   There is already a level system here and this is deliberately NOT it. Points
   (nc_points, the coin badge, the bar on progress.html) are earned by using
   NovaClip: exports, scans, games, streaks. They measure effort on this site and
   somebody with no channel at all can top them.

   This measures the channel. It cannot be earned by using NovaClip harder, it
   does not reset, and it is the number a creator actually cares about. Two
   ladders that measure two different things, each labelled as what it is —
   the failure mode to avoid is one bar that silently mixes them, because then
   neither number means anything.

   WHERE THE NUMBERS COME FROM, AND THE BUG THIS FIXES ON THE WAY

   analytics.html signs in to YouTube and reads the channel's statistics. It
   then threw them away — it filled its own dashboard and stored nothing, so
   every other page on the site had no idea whether a channel existed.

   parent.html has been reading a cache called nc_ytsnap since the day it was
   written. NOTHING HAS EVER WRITTEN IT. The writer belonged to a chat widget
   that was removed, and it went with it. So "What this could pay" on the parent
   dashboard has always shown its no-channel-connected paragraph, to every
   parent, including the ones whose child has a connected channel — a card that
   could not work, failing quietly in exactly the way a cache read with no
   writer fails.

   So the snapshot is written here, in the shape ncPayEstimate() in nova.js
   already expects, from the numbers analytics.html already has. The level and
   the parent's pay estimate then read the same cache, and the second one starts
   working for the first time.

   WHAT IS NOT IN THE SNAPSHOT

   The OAuth token. nc_yt holds that and nova.js deliberately keeps nc_yt out of
   what syncs between devices; this file writes a different key containing four
   numbers and a channel title, so it carries nothing that could sign anybody
   in to anything.

   HIDDEN SUBSCRIBER COUNTS

   A channel can hide its subscriber count, and the API then returns zero with
   hiddenSubscriberCount set. Reading that as zero would tell a creator with
   fifty thousand subscribers that they are on level one, which is the single
   worst thing this feature could do. When the count is hidden the ladder is
   climbed on total views instead, and it says so on screen rather than
   pretending to know.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_CREATOR) return;

  var KEY = 'nc_ytsnap';

  /* --------------------------------------------------------------------------
     THE LADDER
     --------------------------------------------------------------------------
     Dense at the bottom on purpose. Almost everybody who opens this site has
     between zero and a hundred subscribers, and a ladder whose second rung is
     a thousand tells all of them the same thing: you are nowhere. The first
     four rungs are 0, 10, 50, 100 because that is where the actual journey
     happens and where encouragement is worth anything.

     The names are NovaClip's own. YouTube's award tiers have their own names
     and their own trademarks, and this site says on two pages that it is not
     affiliated with YouTube — borrowing their ladder would quietly undo that.
     -------------------------------------------------------------------------- */
  var TIERS = [
    { at: 0,       name: 'First Upload',
      blurb: 'Every channel that exists started exactly here. The first ten subscribers are the hardest ten you will ever get.' },
    { at: 10,      name: 'First Ten',
      blurb: 'Ten people decided they want to see what you make next. That is ten more than most accounts ever get.' },
    { at: 50,      name: 'Fifty Strong',
      blurb: 'Most people who start a channel stop before here. You did not.' },
    { at: 100,     name: 'Hundred Club',
      blurb: 'Triple digits. This is usually where the recommendations start bringing people who were not looking for you.' },
    { at: 500,     name: 'Five Hundred',
      blurb: 'Halfway to the subscriber half of the Partner Programme.' },
    { at: 1000,    name: 'Four Figures',
      blurb: 'A thousand subscribers is one of the two Partner Programme conditions. The other is 4,000 public watch hours in twelve months, which this cannot see.' },
    { at: 5000,    name: 'Momentum',
      blurb: 'Past the point where growth stops being one video at a time.' },
    { at: 10000,   name: 'Five Figures',
      blurb: 'Ten thousand. Brands start sending the first emails somewhere around here.' },
    { at: 50000,   name: 'Breakout',
      blurb: 'A genuinely large channel by any measure that is not a headline.' },
    { at: 100000,  name: 'Six Figures',
      blurb: 'A hundred thousand people. This is the tier most creators never reach.' },
    { at: 500000,  name: 'Half a Million',
      blurb: 'Half a million subscribers. There is not much left above this.' },
    { at: 1000000, name: 'Seven Figures',
      blurb: 'A million. Whatever you are doing, keep doing it.' }
  ];

  /* The same ladder for channels that hide their subscriber count, in views.
     Roughly what each subscriber tier tends to sit on — it is an ESTIMATE and
     the card says the word, because a tier read off views is a different claim
     from a tier read off the number it is named after. */
  var VIEW_AT = [0, 300, 2000, 6000, 40000, 100000, 600000, 1500000, 9000000, 20000000, 120000000, 300000000];

  function num(v) { var n = parseInt(v, 10); return isFinite(n) && n > 0 ? n : 0; }

  /* ==========================================================================
     THE SNAPSHOT
     ========================================================================== */
  function save(stats) {
    var s = stats || {};
    var data = {
      connected: true,
      name: String(s.name || '').slice(0, 120),
      subscribers: num(s.subscribers),
      subsHidden: !!s.subsHidden,
      totalViews: num(s.totalViews),
      videos: num(s.videos),
      created: s.created ? String(s.created) : ''
    };
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
    return data;
  }

  function snapshot() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      return (c && c.data) || null;
    } catch (e) { return null; }
  }

  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ==========================================================================
     THE LEVEL
     ==========================================================================
     Returns, always, without throwing:
       { connected, hidden, fromViews, n, of, name, blurb, subs, views,
         at, next, toNext, pct }
     n is 1-based because "level 0" reads as a failure state, and somebody who
     has just made a channel has not failed at anything. */
  function level(snap) {
    var s = snap === undefined ? snapshot() : snap;
    var out = {
      connected: !!(s && s.connected),
      hidden: !!(s && s.subsHidden),
      fromViews: false,
      of: TIERS.length,
      subs: s ? num(s.subscribers) : 0,
      views: s ? num(s.totalViews) : 0,
      videos: s ? num(s.videos) : 0,
      channel: (s && s.name) || ''
    };

    /* Hidden count: climb on views, and be explicit that this is what happened.
       A channel that hides its subscribers AND has no views is level one on
       either reading, so there is nothing to get wrong there. */
    var ladder = TIERS.map(function (t) { return t.at; });
    var value = out.subs;
    if (out.hidden) {
      out.fromViews = true;
      ladder = VIEW_AT;
      value = out.views;
    }

    var i = 0;
    for (var k = 0; k < ladder.length; k++) if (value >= ladder[k]) i = k;

    out.n = i + 1;
    out.name = TIERS[i].name;
    out.blurb = TIERS[i].blurb;
    out.at = ladder[i];
    out.next = i + 1 < ladder.length ? ladder[i + 1] : null;
    out.toNext = out.next == null ? 0 : Math.max(0, out.next - value);
    /* Progress within the rung, not within the whole ladder — the whole ladder
       is logarithmic and a bar measured against a million would read as empty
       for everybody below about level nine.

       Floored, and held at 99 while anything is still to go: rounding put 999,999
       subscribers at a visually full bar next to the words "1 to go", which reads
       as either a broken bar or a rung that was reached and not awarded. A full
       bar means the next rung, and nothing else. */
    out.pct = out.next == null ? 100
      : Math.max(0, Math.min(out.toNext > 0 ? 99 : 100,
          Math.floor((value - out.at) / (out.next - out.at) * 100)));
    return out;
  }

  function badge(lv) {
    var l = lv || level();
    if (!l.connected) return '';
    return 'Lv ' + l.n + ' · ' + l.name;
  }

  function commas(n) {
    return String(num(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ==========================================================================
     THE CARD
     ==========================================================================
     Written as one innerHTML block with no dependency on any page's stylesheet,
     because it is mounted on progress.html and in Studio and those two do not
     share a card class. Colours come from the site's own custom properties with
     fallbacks, the way every other injected panel here does. */
  function styles() {
    if (document.getElementById('nccl-css')) return;
    var st = document.createElement('style');
    st.id = 'nccl-css';
    st.textContent = [
      '.nccl{border:1px solid var(--nc-line2,rgba(255,255,255,.14));border-radius:16px;',
        'background:var(--nc-bg2,rgba(255,255,255,.04));padding:16px 18px;',
        'font:400 14px/1.55 Inter,system-ui,sans-serif;color:var(--nc-text,#EAF2FF)}',
      '.nccl-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.nccl-lv{font:800 12px/1 inherit;letter-spacing:.09em;text-transform:uppercase;',
        'color:var(--nc-cyan,#00F0FF)}',
      '.nccl-name{font:800 1.35rem/1.15 inherit;flex:1 1 auto;min-width:0}',
      '.nccl-of{font:700 12px/1 inherit;color:var(--nc-dim,#8c96ad)}',
      '.nccl-bar{height:9px;border-radius:999px;margin:13px 0 8px;overflow:hidden;',
        'background:var(--nc-bg3,rgba(255,255,255,.08))}',
      '.nccl-bar i{display:block;height:100%;border-radius:999px;',
        'background:linear-gradient(90deg,#7C5CFF,#00E5FF);transition:width .5s ease}',
      '.nccl-next{font-size:12.5px;color:var(--nc-dim,#8c96ad)}',
      '.nccl-next b{color:var(--nc-text,#EAF2FF)}',
      '.nccl-blurb{margin:11px 0 0;font-size:13px;color:var(--nc-dim,#b8bccb);line-height:1.6}',
      '.nccl-nums{display:flex;gap:16px;flex-wrap:wrap;margin-top:13px;',
        'padding-top:12px;border-top:1px solid var(--nc-line,rgba(255,255,255,.09))}',
      '.nccl-nums div{font-size:12px;color:var(--nc-dim,#8c96ad)}',
      '.nccl-nums b{display:block;font:800 1.05rem/1.2 inherit;color:var(--nc-text,#EAF2FF)}',
      '.nccl-note{margin:11px 0 0;font-size:12px;color:var(--nc-dim,#8c96ad);line-height:1.55}',
      '.nccl-note a{color:var(--nc-cyan,#00F0FF)}',
      '.nccl-ladder{margin:13px 0 0;padding:0;list-style:none;font-size:12.5px;',
        'display:grid;gap:4px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}',
      '.nccl-ladder li{display:flex;gap:7px;color:var(--nc-dim,#8c96ad)}',
      '.nccl-ladder li.on{color:var(--nc-text,#EAF2FF);font-weight:700}',
      '.nccl-ladder li.here{color:var(--nc-cyan,#00F0FF);font-weight:800}',
      '.nccl-ladder span{flex:0 0 auto;opacity:.75}'
    ].join('');
    document.head.appendChild(st);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* withLadder shows every rung, which is the point on progress.html and is
     noise inside the Studio dashboard, so it is a flag rather than always on. */
  function html(lv, withLadder) {
    var l = lv || level();

    if (!l.connected) {
      return '<div class="nccl">' +
        '<div class="nccl-top"><span class="nccl-lv">Creator level</span></div>' +
        '<div class="nccl-name" style="margin-top:6px">Not measured yet</div>' +
        '<p class="nccl-blurb">This level is your <b>channel</b>, not your points — the ' +
        'coins and the bar above are what you have done on NovaClip, and they are a ' +
        'different thing. Connect your YouTube channel in Studio and this fills in.</p>' +
        '<p class="nccl-note">Nothing is uploaded and nothing is published. The numbers ' +
        'are read once, kept on this device, and used here and on the parent dashboard.</p>' +
        (withLadder ? ladderHTML(l) : '') +
        '</div>';
    }

    var next = l.next == null
      ? '<b>Top of the ladder.</b> There is no rung above this one.'
      : '<b>' + commas(l.toNext) + '</b> ' + (l.fromViews ? 'views' : 'subscribers') +
        ' to <b>' + TIERS[l.n].name + '</b>';

    return '<div class="nccl">' +
      '<div class="nccl-top">' +
        '<span class="nccl-lv">Creator level ' + l.n + '</span>' +
        '<span class="nccl-of">of ' + l.of + '</span>' +
      '</div>' +
      '<div class="nccl-name">' + esc(l.name) + '</div>' +
      '<div class="nccl-bar"><i style="width:' + l.pct + '%"></i></div>' +
      '<div class="nccl-next">' + next + '</div>' +
      '<p class="nccl-blurb">' + esc(l.blurb) + '</p>' +
      '<div class="nccl-nums">' +
        '<div><b>' + (l.hidden ? 'hidden' : commas(l.subs)) + '</b>subscribers</div>' +
        '<div><b>' + commas(l.views) + '</b>views, all time</div>' +
        '<div><b>' + commas(l.videos) + '</b>uploads</div>' +
      '</div>' +
      (l.fromViews
        ? '<p class="nccl-note">Your channel hides its subscriber count, so this level is ' +
          '<b>estimated from total views</b> rather than read off the number it is named ' +
          'after. Unhide the count in YouTube and it will use the real figure.</p>'
        : '') +
      '<p class="nccl-note">Read from your connected channel and kept on this device. ' +
      'It is not published anywhere and it is not on any leaderboard.</p>' +
      (withLadder ? ladderHTML(l) : '') +
      '</div>';
  }

  function ladderHTML(l) {
    return '<ul class="nccl-ladder">' + TIERS.map(function (t, i) {
      var cls = l.connected && i + 1 === l.n ? 'here' : (l.connected && i + 1 < l.n ? 'on' : '');
      return '<li class="' + cls + '"><span>' + (i + 1) + '</span>' + esc(t.name) + '</li>';
    }).join('') + '</ul>';
  }

  function render(target, withLadder) {
    var el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return null;
    styles();
    var l = level();
    el.innerHTML = html(l, withLadder !== false);
    return l;
  }

  window.NC_CREATOR = {
    save: save, snapshot: snapshot, forget: forget,
    level: level, badge: badge, render: render, html: html, tiers: TIERS
  };
})();
