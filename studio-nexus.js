/* ============================================================================
   NOVACLIP STUDIO — THE NEXUSSTREAM PANELS
   ============================================================================
   studio-nexus.css is the look. This is the four things the NexusStream app
   showed that the Studio did not, each wired to the channel that is actually
   signed in:

     THE TELEMETRY ROW    four headline tiles above the dashboard
     THE VIEW TABS        Overview / Competitors / Retention / Library
     SPIKE ALERTS         a video that genuinely outran the channel's median
     THE RETENTION CURVE  how far through a video people actually get

   The last one is the reason this file is worth having. The Studio could
   already tell you a video got 14,000 views; it could not tell you that
   everybody left at 0:11, which is the number that changes what you do next.
   It comes from the Analytics API's elapsedVideoTimeRatio dimension, which
   the page already has the scope for.

   WHAT IS DELIBERATELY MISSING

   The original's headline tile is "Concurrent Active Viewers: 14,850", next
   to "Realtime Views/Hour" and a footer reading "Low Latency Node: 14ms".
   None of those can be had. YouTube publishes no public realtime endpoint —
   the live count in YouTube's own Studio is not exposed by either API — so
   there is no honest version of that tile and it is not here. The original
   produced it with setInterval and Math.random(), which is why it works on a
   machine with no network at all.

   Same for the milestone confetti: the goal bar is here because the number it
   measures is real, and the confetti is not, because a celebration fired by
   clicking the bar is a celebration of having clicked the bar.

   HOW IT GETS THE DATA

   Handed to it. analytics.html holds its state in `let` bindings — myStats,
   myUploads, perfDays — and a `let` at the top of a classic script is not a
   property of window, so reaching for window.myUploads from here finds
   nothing. They are passed into NX.refresh() instead, which is the better
   shape anyway: this file's dependencies are the argument list rather than
   six names it hopes are lying around.

   The one thing it does fetch for itself is the retention curve, using the
   yta() the page defines — a function declaration, so that one really is
   global. The three files go together.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NX) return;

  /* Everything the panels read, filled in by NX.refresh(). */
  var D = { stats: null, uploads: [], days: 28, totals: null, yta: null, nfmt: null, hms: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function fmt(n) { return D.nfmt ? D.nfmt(n) : String(Math.round(n)); }

  function median(list) {
    var a = list.filter(function (n) { return isFinite(n); }).sort(function (x, y) { return x - y; });
    if (!a.length) return 0;
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  /* ==========================================================================
     THE TELEMETRY ROW
     ==========================================================================
     Four tiles. Every one is a number the page already fetched — this reads
     them, it does not go back to the API for them.
     ========================================================================== */

  /* The next round number worth aiming at, from wherever the channel is now.
     100 / 1,000 / 10,000 and so on, so a channel at 340 gets 1,000 and a
     channel at 340,000 gets 500,000 rather than both being told about a
     million they are nowhere near. */
  function nextMilestone(subs) {
    if (subs < 100) return 100;
    var mag = Math.pow(10, Math.floor(Math.log10(subs)));
    var half = mag * 5;
    return subs < half ? half : mag * 10;
  }

  function tile(accent, label, chip, big, sub, extra) {
    return '<div class="nx-tile" style="--a:' + accent + '">' +
      '<div class="nx-head"><span class="nx-label">' + esc(label) + '</span>' +
        (chip ? '<span class="nx-chip">' + esc(chip) + '</span>' : '') + '</div>' +
      '<p class="nx-n">' + esc(big) + '</p>' +
      (sub ? '<p class="nx-sub">' + sub + '</p>' : '') +
      (extra || '') +
    '</div>';
  }

  function telemetry() {
    var totals = D.totals;
    var box = $('nxTelemetry');
    if (!box) return;
    var st = (D.stats && D.stats.statistics) || null;
    if (!st) { box.innerHTML = ''; return; }

    var subs = num(st.subscriberCount);
    var goal = nextMilestone(subs);
    var pct = goal ? Math.max(0, Math.min(100, (subs / goal) * 100)) : 0;
    var html = '';

    /* 1. Subscribers, with the bar to the next round number. */
    html += tile('var(--nx-cyan)', 'Subscribers',
      st.hiddenSubscriberCount ? 'HIDDEN' : null,
      st.hiddenSubscriberCount ? '—' : subs.toLocaleString(),
      st.hiddenSubscriberCount
        ? 'This channel hides its subscriber count, so YouTube will not tell us either.'
        : '<b>' + fmt(num(st.viewCount)) + '</b> views all time · <b>' +
          num(st.videoCount).toLocaleString() + '</b> videos',
      st.hiddenSubscriberCount ? '' :
        '<div class="nx-goal">' +
          '<div class="nx-goalrow"><span>Next: ' + goal.toLocaleString() + '</span>' +
            '<span>' + Math.max(0, goal - subs).toLocaleString() + ' to go</span></div>' +
          '<div class="nx-track"><div class="nx-fill" style="width:' + pct.toFixed(1) + '%"></div></div>' +
        '</div>');

    /* 2-4 need the Analytics API totals. Without them — no scope, or a channel
       with no views in the window — the row is the one tile rather than three
       tiles of zero. A zero and "we were not allowed to ask" look identical
       on a dashboard and mean opposite things. */
    if (totals) {
      var views = num(totals[0]), mins = num(totals[1]), avgDur = num(totals[2]);
      var avgPct = num(totals[3]), gained = num(totals[4]), lost = num(totals[5]);
      var days = D.days || 28;

      html += tile('var(--nx-fuchsia)', 'Average view', (avgPct || 0).toFixed(1) + '% WATCHED',
        D.hms ? D.hms(avgDur) : Math.round(avgDur) + 's',
        'How long people stay, on average, across everything in the window.');

      html += tile('var(--nx-emerald)', 'Views · ' + days + 'd', null,
        fmt(views),
        '<b>' + fmt(Math.round(mins / 60)) + ' h</b> of watch time');

      var net = gained - lost;
      html += tile('var(--nx-amber)', 'Net subscribers', (net >= 0 ? 'UP' : 'DOWN'),
        (net >= 0 ? '+' : '') + fmt(net),
        '<b>+' + fmt(gained) + '</b> gained · <b>−' + fmt(lost) + '</b> lost');
    }

    box.innerHTML = html;
  }

  /* ==========================================================================
     SPIKE ALERTS
     ==========================================================================
     The original picks one of four headlines at random every few seconds and
     inflates the chart to match. This looks for the thing those headlines are
     pretending to be: a recent upload that genuinely outran what this channel
     normally does.

     The bar is deliberately high — at least three videos to have a median
     worth comparing against, at least twice that median, and posted inside
     the window being looked at. Most of the time there is nothing to say, and
     saying nothing is the correct output. An alert that fires every visit is
     wallpaper.
     ========================================================================== */
  function spike() {
    var box = $('nxSpike');
    if (!box) return;
    var ups = D.uploads || [];
    if (ups.length < 3) { box.innerHTML = ''; return; }

    var days = D.days || 28;
    var since = Date.now() - days * 86400000;
    var mid = median(ups.map(function (v) { return num(v.views); }));
    if (!mid) { box.innerHTML = ''; return; }

    var best = null;
    ups.forEach(function (v) {
      if (!v.date || v.date.getTime() < since) return;
      var r = num(v.views) / mid;
      if (r >= 2 && (!best || r > best.r)) best = { v: v, r: r };
    });
    if (!best) { box.innerHTML = ''; return; }

    var times = best.r >= 10 ? Math.round(best.r) : Math.round(best.r * 10) / 10;
    box.innerHTML =
      '<div class="nx-spike">' +
        '<span class="nx-ping" aria-hidden="true"></span>' +
        '<div class="nx-body">' +
          '<b>' + esc(best.v.title) + ' is running at ' + times + '× your usual</b>' +
          '<span>' + num(best.v.views).toLocaleString() + ' views against a median of ' +
            Math.round(mid).toLocaleString() + ' across your last ' + ups.length + ' uploads. ' +
            'While it is still moving is when a second video on the same subject does best — ' +
            'and the comments on this one will tell you what that video should be.</span>' +
        '</div>' +
        '<button class="nx-x" type="button" aria-label="Dismiss">&times;</button>' +
      '</div>';
    var x = box.querySelector('.nx-x');
    if (x) x.onclick = function () { box.innerHTML = ''; };
  }

  /* ==========================================================================
     THE VIEW TABS
     ==========================================================================
     The original renders a different component tree per tab. The Studio's
     panels are already on the page, so this shows and hides the ones that
     belong to each view — which also means nothing is re-fetched by changing
     tab, and the charts are not destroyed and rebuilt.
     ========================================================================== */
  /* Which panels each view shows. Everything named here is INSIDE #dash, which
     is where the tab row is — the Fair Fight section sits above the dashboard
     with its own heading, and a tab that made a section further up the page
     appear and disappear would read as the page jumping rather than as a
     filter. It stays put in every view. */
  var PANELS = ['dashgrid', 'perfbox', 'reviewwrap', 'nxRetainBox'];
  var VIEWS = {
    overview:    ['dashgrid', 'perfbox', 'reviewwrap'],
    competitors: ['dashgrid'],                 // the you-vs-them comparison charts
    retention:   ['nxRetainBox', 'perfbox'],
    library:     ['reviewwrap']                // the review and the ranked videos
  };
  var TABS = [
    ['overview', 'Overview'],
    ['competitors', 'Competitors'],
    ['retention', 'Retention'],
    ['library', 'Videos']
  ];

  function show(id, on) {
    var el = $(id);
    if (el) el.style.display = on ? '' : 'none';
  }

  function select(view) {
    var wanted = VIEWS[view] || VIEWS.overview;
    PANELS.forEach(function (id) { show(id, wanted.indexOf(id) >= 0); });
    var row = $('nxTabs');
    if (row) row.querySelectorAll('.nx-tab').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.v === view ? 'true' : 'false');
    });
    /* Chart.js sizes to the container, and a canvas laid out while its parent
       was display:none comes back 0 high. Ask every chart to remeasure once
       the panels are visible again. */
    requestAnimationFrame(function () {
      try {
        if (window.Chart && Chart.instances) {
          Object.keys(Chart.instances).forEach(function (k) { Chart.instances[k].resize(); });
        }
      } catch (e) {}
      if (view === 'retention') retentionBoot();
    });
  }

  function tabs() {
    var row = $('nxTabs');
    if (!row || row.dataset.built) return;
    row.dataset.built = '1';
    row.setAttribute('role', 'tablist');
    row.innerHTML = TABS.map(function (t) {
      return '<button class="nx-tab" type="button" role="tab" data-v="' + t[0] + '" ' +
             'aria-selected="' + (t[0] === 'overview') + '">' + t[1] + '</button>';
    }).join('') +
      '<span class="nx-window"><i></i>' +
        'Last ' + (D.days || 28) + ' days · to yesterday</span>';
    row.querySelectorAll('.nx-tab').forEach(function (b) {
      b.onclick = function () { select(b.dataset.v); };
    });
    select('overview');
  }

  /* ==========================================================================
     THE RETENTION CURVE
     ==========================================================================
     audienceWatchRatio against elapsedVideoTimeRatio: for each 1% of the way
     through the video, what fraction of viewers were still there. It is the
     one report in the Analytics API that answers "where did they go", and it
     is per-video, so it needs a video chosen.

     relativeRetentionPerformance is asked for in the same call — YouTube's
     own comparison against videos of a similar length — and left out of the
     reading when it comes back empty, which it does for channels below the
     threshold YouTube will compare.
     ========================================================================== */
  var retainChart = null;
  var retainFor = null;

  function retentionBoot() {
    var pick = $('nxPick');
    if (!pick || pick.dataset.built) return;
    var ups = (D.uploads || []).slice(0, 25);
    if (!ups.length) {
      var w = $('nxRetainNote');
      if (w) w.textContent = 'Once this page has your uploads, pick one here and it will show where people stopped watching.';
      return;
    }
    pick.dataset.built = '1';
    pick.innerHTML = ups.map(function (v) {
      return '<option value="' + esc(v.id) + '">' + esc(String(v.title).slice(0, 70)) + '</option>';
    }).join('');
    pick.onchange = function () { retention(pick.value); };
    retention(ups[0].id);
  }

  function note(msg, warn) {
    var n = $('nxRetainNote');
    if (!n) return;
    n.innerHTML = msg;
    n.style.color = warn ? '#fbbf24' : '';
  }

  async function retention(videoId) {
    if (!videoId || typeof D.yta !== 'function' || typeof Chart === 'undefined') return;
    if (retainFor === videoId) return;
    retainFor = videoId;
    note('Reading the retention curve…');
    var read = $('nxRetainRead');
    if (read) read.innerHTML = '';

    var rows;
    try {
      var j = await D.yta({
        metrics: 'audienceWatchRatio,relativeRetentionPerformance',
        dimensions: 'elapsedVideoTimeRatio',
        filters: 'video==' + videoId,
        sort: 'elapsedVideoTimeRatio'
      });
      rows = j.rows || [];
    } catch (e) {
      /* The same 403 the performance panels handle, and the same fix. Worth
         its own message because somebody may only ever open this tab. */
      var scope = e.code === 403 || /scope|permission|insufficient/i.test(e.message || '');
      note(scope
        ? '<b>This needs the analytics permission.</b> Press ' +
          '<a href="#" onclick="ncReconnect();return false;" style="color:#22d3ee">reconnect</a> ' +
          'and allow “View YouTube Analytics reports”.'
        : 'YouTube would not return the retention curve: ' + esc(e.message), true);
      retainFor = null;
      return;
    }

    if (!rows.length) {
      note('YouTube has no retention data for this video yet. It needs a few hundred views ' +
           'before the curve means anything, and very new uploads have none at all.', true);
      if (retainChart) { try { retainChart.destroy(); } catch (e) {} retainChart = null; }
      return;
    }

    var pcts = rows.map(function (r) { return Math.round(num(r[0]) * 100); });
    var ratio = rows.map(function (r) { return Math.round(num(r[1]) * 1000) / 10; });

    if (retainChart) { try { retainChart.destroy(); } catch (e) {} }
    var el = $('nxRetainChart');
    if (!el) return;
    retainChart = new Chart(el.getContext('2d'), {
      type: 'line',
      data: {
        labels: pcts.map(function (p) { return p + '%'; }),
        datasets: [{
          label: 'Still watching',
          data: ratio,
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,0.14)',
          fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (c) { return c.parsed.y + '% still watching'; } } }
        },
        scales: {
          x: { ticks: { color: '#7E8AA6', font: { size: 9 }, maxRotation: 0, autoSkip: true },
               grid: { color: 'rgba(255,255,255,0.05)' },
               title: { display: true, text: 'How far through the video', color: '#7E8AA6', font: { size: 10 } } },
          y: { ticks: { color: '#7E8AA6', font: { size: 9 }, callback: function (v) { return v + '%'; } },
               grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
        }
      }
    });

    note('Every point is a moment in the video and the share of viewers still there. ' +
         'Straight from your channel — the flat stretches are the parts that worked.');

    /* ---- the reading ----------------------------------------------------
       A curve is only useful if somebody can say what it means, so this says
       it: the drop in the opening, the worst single fall, and where half the
       audience had gone. All three are computed from the rows above. */
    var open = ratio.length > 1 ? Math.round(ratio[0] - ratio[Math.min(5, ratio.length - 1)]) : 0;
    /* Rounded on the way out, not on the way in: ratio[] is already to one
       decimal, and subtracting two of those gives 15.399999999999999, which
       is what this printed on the panel before. */
    var worst = 0, worstAt = 0;
    for (var i = 1; i < ratio.length; i++) {
      var d = ratio[i - 1] - ratio[i];
      if (d > worst) { worst = d; worstAt = pcts[i]; }
    }
    worst = Math.round(worst);
    var halfAt = null;
    for (var k = 0; k < ratio.length; k++) { if (ratio[k] <= 50) { halfAt = pcts[k]; break; } }

    if (read) {
      read.innerHTML =
        '<div><b>First few seconds</b><span>' +
          (open > 0 ? open + '% left before you were properly started.'
                    : 'Nobody left early — the opening is doing its job.') +
        '</span></div>' +
        '<div><b>Biggest drop</b><span>' +
          (worst >= 1 ? worst + '% left at the ' + worstAt + '% mark. Watch that moment back.'
                      : 'No single moment loses people — the fall is gradual.') +
        '</span></div>' +
        '<div><b>Half gone by</b><span>' +
          (halfAt === null ? 'More than half were still watching at the end. That is rare — do it again.'
                           : 'the ' + halfAt + '% mark.') +
        '</span></div>';
    }
  }

  /* ==========================================================================
     THE WAY IN
     ==========================================================================
     analytics.html calls NX.refresh() when the channel loads and again when
     the 28/90/365 buttons change the window. `totals` is the row the
     performance panel already fetched, passed straight in rather than asked
     for a second time.
     ========================================================================== */
  window.NX = {
    refresh: function (ctx) {
      /* Merge rather than replace: enterDash calls this before the Analytics
         API has answered, so the first call carries the channel and no
         totals, and the second carries the totals. Replacing would blank the
         channel tile on the second call. */
      var wasDays = D.days;
      if (ctx) Object.keys(ctx).forEach(function (k) {
        if (ctx[k] !== undefined) D[k] = ctx[k];
      });
      /* The retention curve is measured over the same window as everything
         else, so 28 -> 90 is a different curve. Drop the cached video id so
         the next look refetches instead of showing the old window's shape
         under the new window's heading. */
      if (wasDays !== D.days) {
        retainFor = null;
        var pick = $('nxPick');
        if (pick && pick.value && $('nxRetainBox') && $('nxRetainBox').style.display !== 'none') {
          retention(pick.value);
        }
      }
      try { telemetry(); } catch (e) { console.warn('nx telemetry', e); }
      try { spike(); } catch (e) { console.warn('nx spike', e); }
      try { tabs(); } catch (e) { console.warn('nx tabs', e); }
    },
    select: select,
    nextMilestone: nextMilestone
  };
})();
