/* ============================================================================
   NOVACLIP — WHAT YOU HAVE POSTED
   ============================================================================
   The videos already on the connected channel, each with the numbers it earned,
   a mark out of ten you give it yourself, and what the AI thinks would make the
   next one better.

   WHY THE MARK IS YOURS AND NOT THE AI'S

   Asked for as "see all the videos you've posted and rating them out ten". The
   obvious build is to have the model score them. That is the wrong way round
   and would be worth nothing: a model reading a title and a view count is
   guessing, and a confident number next to somebody's work invites them to
   believe it. The creator knows which video they rushed.

   So the ten is theirs. What the AI adds is the part it can actually do: read
   the title, the length, the day it went out and the numbers beside it, and
   name what to change. The mark is the input to that, not the output.

   WHAT THE NUMBERS ARE, AND ARE NOT

   Views, likes, length and publish date come from YouTube's public Data API
   through the worker — the same endpoint the clip finder uses, so nothing new
   is deployed. Views per day is worked out here, because a video from 2023 and
   one from last week are not comparable on views alone and that is the mistake
   this panel exists to stop.

   WHAT IT CANNOT SEE: watch time, retention, impressions, click-through. Those
   need the YouTube Analytics API and the channel owner's OAuth token, which is
   a different grant from the one this site asks for. The panel says so rather
   than implying the list is everything.

   SHORTS ARE MISSING, ON PURPOSE AND NOT ON OURS. The worker's /yt endpoint
   drops anything under 45 seconds, because it was written to find videos worth
   studying for structure. That filter is right there and wrong here, so the
   panel tells the reader what is not in the list instead of letting them count
   wrong.

   GOES WITH: trends-nav.js (the rail row and the #/posted route), trends.html
   (loads this), sw.js (cache bump). ai-worker.js is UNCHANGED.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_POSTED) return;

  var RATE_KEY = 'nc_video_marks';     /* { "<videoId>": 0-10 } */
  var BOX = null;
  var S = { channel: '', videos: null, busy: '', err: '', notes: {}, sort: 'views' };

  function t(key, fallback) {
    try {
      if (typeof window.tr === 'function') { var v = window.tr(key); if (v) return v; }
    } catch (e) {}
    return fallback;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function big(n) {
    n = n || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(Math.round(n));
  }
  function clock(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return m + ':' + String(s).padStart(2, '0');
  }
  function daysSince(iso) {
    var d = Date.parse(iso || '');
    if (!d) return 0;
    return Math.max(1, Math.round((Date.now() - d) / 86400000));
  }
  function worker() { return window.NC_AI_WORKER_URL || ''; }

  function marks() {
    try { return JSON.parse(localStorage.getItem(RATE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function setMark(id, n) {
    var m = marks();
    if (n === '' || n == null) delete m[id]; else m[id] = Math.max(0, Math.min(10, Math.round(n)));
    try { localStorage.setItem(RATE_KEY, JSON.stringify(m)); } catch (e) {}
  }

  /* The connected channel's title. analytics.html stores it when somebody signs
     in to YouTube, and creator-level.js keeps a snapshot beside it; either will
     do, and neither holds the OAuth token. */
  function connected() {
    var title = '';
    try {
      var y = JSON.parse(localStorage.getItem('nc_yt') || 'null');
      if (y && y.channel) title = y.channel;
    } catch (e) {}
    if (!title) {
      try {
        var s = JSON.parse(localStorage.getItem('nc_ytsnap') || 'null');
        if (s && s.data && s.data.channel) title = s.data.channel;
      } catch (e) {}
    }
    return title;
  }

  /* -------------------------------------------------------------------------
     STYLE
     ----------------------------------------------------------------------- */
  function styles() {
    if (document.getElementById('ncpost-style')) return;
    var st = document.createElement('style');
    st.id = 'ncpost-style';
    st.textContent =
      '.ncpost-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}' +
      '.ncpost-row input{flex:1 1 200px;min-width:0;padding:10px 12px;border-radius:10px;' +
        'background:var(--nc-sunk,#070910);border:1px solid var(--nc-line,rgba(120,140,255,.3));' +
        'color:inherit;font:inherit;font-size:14px}' +
      '.ncpost-go{padding:10px 16px;border:0;border-radius:10px;cursor:pointer;font:inherit;' +
        'font-weight:700;background:linear-gradient(90deg,#6C5CE7,#00D2FF);color:#04121a}' +
      '.ncpost-go[disabled]{opacity:.55;cursor:default}' +
      '.ncpost-row select{padding:8px 10px;border-radius:9px;background:var(--nc-sunk,#070910);' +
        'border:1px solid var(--nc-line,rgba(120,140,255,.3));color:inherit;font:inherit;font-size:12.5px}' +
      '.ncpost-chan{display:flex;gap:12px;align-items:center;margin:14px 0 4px;font-size:13px;opacity:.85}' +
      '.ncpost-chan img{width:38px;height:38px;border-radius:50%}' +
      '.ncpost-msg{font-size:13px;opacity:.72;margin:12px 0 0;line-height:1.6}' +
      '.ncpost-card{display:flex;gap:14px;padding:13px;margin-top:11px;border-radius:13px;' +
        'background:var(--nc-panel,#0F1322);border:1px solid var(--nc-line,rgba(255,255,255,.1))}' +
      '.ncpost-card img.th{width:150px;height:84px;object-fit:cover;border-radius:9px;' +
        'background:var(--nc-sunk,#070910);flex:0 0 auto}' +
      '.ncpost-main{flex:1 1 auto;min-width:0}' +
      '.ncpost-t{font-size:14px;font-weight:650;line-height:1.35}' +
      '.ncpost-t a{color:inherit;text-decoration:none}' +
      '.ncpost-t a:hover{text-decoration:underline}' +
      '.ncpost-nums{display:flex;gap:14px;flex-wrap:wrap;margin-top:5px;font-size:11.5px;' +
        'opacity:.7;font-variant-numeric:tabular-nums}' +
      '.ncpost-nums b{font-weight:700;opacity:1}' +
      '.ncpost-mark{display:flex;gap:7px;align-items:center;margin-top:9px;flex-wrap:wrap}' +
      '.ncpost-mark label{font-size:11.5px;opacity:.7}' +
      '.ncpost-mark input[type=range]{flex:1 1 120px;min-width:90px;accent-color:#6C5CE7}' +
      '.ncpost-mark .n{font-family:var(--mono,ui-monospace,monospace);font-size:14px;' +
        'font-weight:700;min-width:46px;text-align:right}' +
      '.ncpost-acts{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}' +
      '.ncpost-acts button{padding:6px 11px;border-radius:9px;' +
        'border:1px solid var(--nc-line,rgba(120,140,255,.34));background:var(--nc-sunk,#141A2E);' +
        'color:inherit;cursor:pointer;font:inherit;font-weight:650;font-size:11.5px}' +
      '.ncpost-acts button[disabled]{opacity:.5;cursor:default}' +
      '.ncpost-note{margin-top:9px;padding:10px 12px;border-radius:10px;font-size:12.5px;' +
        'line-height:1.55;background:var(--nc-sunk,#070910);border-left:2px solid #6C5CE7;' +
        'white-space:pre-wrap}' +
      '.ncpost-cant{margin-top:14px;padding:11px 13px;border-radius:11px;font-size:12.5px;' +
        'line-height:1.55;background:rgba(180,83,9,.12);border:1px solid rgba(251,191,36,.3);' +
        'color:#B45309}' +
      'html[data-theme="dark"] .ncpost-cant{color:#FDE68A}' +
      '@media(max-width:560px){.ncpost-card{flex-direction:column}' +
        '.ncpost-card img.th{width:100%;height:auto;aspect-ratio:16/9}}';
    document.head.appendChild(st);
  }

  /* -------------------------------------------------------------------------
     LOAD
     ----------------------------------------------------------------------- */
  function load(name) {
    var base = worker();
    if (!base) {
      S.err = t('st_post_noworker',
        'The AI worker address is missing, so channels cannot be looked up.');
      paint(); return;
    }
    S.busy = t('st_post_looking', 'Looking up the channel…');
    S.err = ''; S.videos = null;
    paint();
    fetch(base + '/yt?channel=' + encodeURIComponent(name) + '&n=12')
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        S.busy = '';
        if (!res.ok || res.j.state === 'NONE' || !res.j.channel) {
          S.err = res.j.reason || res.j.error ||
            t('st_post_nochan', 'That channel could not be found. Try its exact name.');
          paint(); return;
        }
        S.chan = res.j.channel;
        S.videos = res.j.videos || [];
        paint();
      })
      .catch(function (e) {
        S.busy = '';
        S.err = t('st_post_noreach', 'Could not reach the worker: ') +
                (e && e.message ? e.message : '—');
        paint();
      });
  }

  /* -------------------------------------------------------------------------
     WHAT COULD BE BETTER
     ----------------------------------------------------------------------- */
  function advise(v, btn, out) {
    if (typeof window.ncAsk !== 'function') {
      out.textContent = t('st_post_noai', 'The AI is not loaded on this page.');
      out.hidden = false; return;
    }
    var mine = marks()[v.id];
    var per = Math.round(v.views / daysSince(v.published));
    btn.disabled = true;
    var was = btn.textContent;
    btn.textContent = t('st_post_thinking', 'Thinking…');
    out.hidden = false;
    out.textContent = t('st_post_reading', 'Reading the numbers…');

    var prompt =
      'A teenage creator wants to know what to change on their NEXT video, based on one they ' +
      'already posted. Do not praise it and do not pad the answer.\n\n' +
      'Title: ' + v.title + '\n' +
      'Length: ' + clock(v.seconds) + '\n' +
      'Posted: ' + daysSince(v.published) + ' days ago\n' +
      'Views: ' + v.views + ' (' + per + ' a day)\n' +
      'Likes: ' + v.likes + (v.views ? ' (' + (v.likes / v.views * 100).toFixed(1) +
        '% of viewers)' : '') + '\n' +
      (mine != null ? 'The creator marks it ' + mine + ' out of 10 themselves.\n' : '') +
      '\nYou can see the title and those numbers and NOTHING else — not the video, not the ' +
      'thumbnail, not the retention curve. Say what the numbers and the title alone support, ' +
      'and say plainly when something would need the video to judge.\n\n' +
      'Answer in exactly three short paragraphs, no headings:\n' +
      '1. What the numbers say, including whether the like rate is normal (1 to 4% of viewers ' +
      'is typical).\n' +
      '2. One concrete change to the TITLE, written out as you would publish it.\n' +
      '3. One thing to do differently on the next video.' +
      (mine != null && mine <= 5
        ? '\n\nThe creator rates this low. Take that seriously rather than arguing with it.'
        : '');

    window.ncAsk(prompt, { maxTokens: 700, temperature: 0.5 }).then(function (r) {
      btn.disabled = false; btn.textContent = was;
      var text = (r && (r.text || r.err)) || '';
      out.textContent = text || t('st_post_noanswer', 'The AI did not answer. Try again.');
      S.notes[v.id] = out.textContent;
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = was;
      out.textContent = t('st_post_noanswer', 'The AI did not answer. Try again.') +
        ' ' + (e && e.message ? e.message : '');
    });
  }

  /* -------------------------------------------------------------------------
     RENDER
     ----------------------------------------------------------------------- */
  function card(v) {
    var wrap = el('div', 'ncpost-card');
    if (v.thumb) {
      var im = document.createElement('img');
      im.className = 'th';
      im.src = v.thumb;
      im.alt = '';
      im.loading = 'lazy';
      wrap.appendChild(im);
    }
    var main = el('div', 'ncpost-main');
    main.appendChild(el('div', 'ncpost-t',
      '<a href="' + esc(v.url) + '" target="_blank" rel="noopener">' + esc(v.title) + '</a>'));

    var days = daysSince(v.published);
    var per = Math.round(v.views / days);
    var likePc = v.views ? (v.likes / v.views * 100) : 0;
    main.appendChild(el('div', 'ncpost-nums',
      '<span><b>' + big(v.views) + '</b> ' + esc(t('st_post_views', 'views')) + '</span>' +
      '<span><b>' + big(per) + '</b> ' + esc(t('st_post_perday', 'a day')) + '</span>' +
      '<span><b>' + likePc.toFixed(1) + '%</b> ' + esc(t('st_post_liked', 'liked it')) + '</span>' +
      '<span>' + clock(v.seconds) + '</span>' +
      '<span>' + days + ' ' + esc(t('st_post_days', 'days ago')) + '</span>'));

    /* The mark. Range plus a readable number, because a slider with no value is
       a control nobody trusts. */
    var m = marks()[v.id];
    var mk = el('div', 'ncpost-mark');
    mk.appendChild(el('label', '', esc(t('st_post_yourmark', 'Your mark'))));
    var r = el('input');
    r.type = 'range'; r.min = '0'; r.max = '10'; r.step = '1';
    r.value = m == null ? '5' : String(m);
    var nOut = el('span', 'n', m == null ? '—' : m + '/10');
    r.oninput = function () {
      setMark(v.id, parseInt(r.value, 10));
      nOut.textContent = r.value + '/10';
    };
    mk.appendChild(r);
    mk.appendChild(nOut);
    main.appendChild(mk);

    var out = el('div', 'ncpost-note');
    out.hidden = !S.notes[v.id];
    if (S.notes[v.id]) out.textContent = S.notes[v.id];

    var acts = el('div', 'ncpost-acts');
    var ask = el('button', '', esc(t('st_post_better', 'What could be better')));
    ask.type = 'button';
    ask.onclick = function () { advise(v, ask, out); };
    acts.appendChild(ask);
    main.appendChild(acts);
    main.appendChild(out);

    wrap.appendChild(main);
    return wrap;
  }

  function paint() {
    if (!BOX) return;
    var host = BOX.querySelector('.ncpost-body');
    if (!host) return;
    host.innerHTML = '';

    var row = el('div', 'ncpost-row');
    var input = el('input');
    input.type = 'text';
    input.placeholder = t('st_post_holder', 'Your channel name…');
    input.value = S.channel || connected();
    input.setAttribute('aria-label', t('st_post_holder', 'Your channel name…'));
    var go = el('button', 'ncpost-go', S.busy ? esc(t('st_post_looking2', 'Looking…'))
                                              : esc(t('st_post_load', 'Load my videos')));
    go.type = 'button';
    go.disabled = !!S.busy;
    var run = function () {
      S.channel = input.value.trim();
      if (!S.channel) { input.focus(); return; }
      load(S.channel);
    };
    go.onclick = run;
    input.onkeydown = function (e) { if (e.key === 'Enter') run(); };
    row.appendChild(input); row.appendChild(go);

    if (S.videos && S.videos.length) {
      var sel = el('select');
      [['views', t('st_post_byviews', 'Most views')],
       ['perday', t('st_post_byperday', 'Views a day')],
       ['mark', t('st_post_bymark', 'Your mark')],
       ['new', t('st_post_bynew', 'Newest')]].forEach(function (o) {
        var op = el('option', '', o[1]);
        op.value = o[0];
        if (o[0] === S.sort) op.selected = true;
        sel.appendChild(op);
      });
      sel.onchange = function () { S.sort = sel.value; paint(); };
      row.appendChild(sel);
    }
    host.appendChild(row);

    if (!connected() && !S.videos) {
      host.appendChild(el('p', 'ncpost-msg', esc(t('st_post_connect',
        'No channel is connected on this device yet. Type the name above, or connect your ' +
        'channel once in the Studio and it fills in by itself.'))));
    }
    if (S.busy) { host.appendChild(el('p', 'ncpost-msg', esc(S.busy))); return; }
    if (S.err) { host.appendChild(el('p', 'ncpost-msg', esc(S.err))); return; }
    if (!S.videos) return;

    if (S.chan) {
      var c = el('div', 'ncpost-chan');
      c.innerHTML =
        (S.chan.thumb ? '<img src="' + esc(S.chan.thumb) + '" alt="">' : '') +
        '<div><b>' + esc(S.chan.title) + '</b>' +
        (S.chan.hidden ? '' : ' · ' + big(S.chan.subscribers) + ' ' +
          esc(t('st_post_subs', 'subscribers'))) + '</div>';
      host.appendChild(c);
    }

    if (!S.videos.length) {
      host.appendChild(el('p', 'ncpost-msg', esc(t('st_post_none',
        'Nothing came back for that channel that is longer than 45 seconds.'))));
      return;
    }

    var mk = marks();
    var list = S.videos.slice().sort(function (a, b) {
      if (S.sort === 'perday') {
        return (b.views / daysSince(b.published)) - (a.views / daysSince(a.published));
      }
      if (S.sort === 'mark') {
        return (mk[b.id] == null ? -1 : mk[b.id]) - (mk[a.id] == null ? -1 : mk[a.id]);
      }
      if (S.sort === 'new') return Date.parse(b.published || 0) - Date.parse(a.published || 0);
      return b.views - a.views;
    });
    list.forEach(function (v) { host.appendChild(card(v)); });

    host.appendChild(el('div', 'ncpost-cant', t('st_post_cant',
      '<b>What this cannot see.</b> Watch time, retention, impressions and click-through need ' +
      'YouTube’s Analytics API and a sign-in this site does not ask for. Shorts are also ' +
      'missing: the lookup drops anything under 45 seconds. So this is the public half of the ' +
      'picture — enough to compare your own videos against each other, not enough to ' +
      'explain why one of them worked.')));
  }

  /* -------------------------------------------------------------------------
     MOUNT
     ----------------------------------------------------------------------- */
  function mount(box) {
    if (box.dataset.view === 'posted') { BOX = box; return; }
    box.dataset.view = 'posted';
    styles();
    BOX = box;
    box.innerHTML =
      '<h1 data-t="st_post_h">' + esc(t('st_post_h', 'What you have posted')) + '</h1>' +
      '<p class="lede" data-t="st_post_p">' + esc(t('st_post_p',
        'Every video on your channel with the numbers it earned, a mark out of ten you give it ' +
        'yourself, and what the AI thinks would make the next one better. The mark is yours — ' +
        'a model reading a title and a view count is guessing, and you know which one you ' +
        'rushed.')) + '</p>' +
      '<div class="card"><div class="ncpost-body"></div></div>';
    paint();
  }

  window.NC_POSTED = { mount: mount, state: S, paint: paint };
})();
