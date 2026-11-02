/* ============================================================================
   NOVACLIP AI CLIPPER  —  paste a long video, get the moments worth cutting
   ============================================================================
   WHERE IT LIVES

   A panel in Studio's own rail, beside Editor, AI Editor and Photo — not a
   floating button in the editor. trends-nav.js owns that rail and routes
   #/clipper here; this file only renders into the box it is handed, the same
   way the Trend Spotter and Scripts panels do. It draws nothing on its own and
   adds no launcher anywhere.

   WHAT THIS IS, AND WHERE THE LINE IS

   The ask was the thing the side-hustle videos sell: paste a YouTube link, get
   viral shorts out the other end, post them. Three of those four steps are
   real and are built here. The fourth is not, and clipfinder.js next door
   already wrote down why in more detail:

     · YouTube's terms forbid taking the file. No API offers it.
     · The video is somebody's copyrighted work. The EU has no fair use, and
       there is no clip length that makes a re-upload lawful.
     · A site that SERVED that video to be re-cut would be the infringer — not
       the fourteen-year-old who clicked the button.

   So nothing is downloaded, nothing is re-encoded, and nothing is posted. What
   this does is WATCH — Gemini takes a public YouTube URL directly, Google
   fetches it at their end, and the file never touches NovaClip or the browser.
   What comes back is the part the paid tools actually charge for: which
   moments are the good ones, where exactly they start and end, how strong each
   one is, and what to say in the caption.

   On somebody else's video that is a brief: the timestamps play in YouTube's
   own embed and the plan is yours to film. On YOUR OWN video — the one you
   uploaded, the one you hold the rights to — the same timestamps are a cut
   list, and that is the honest version of the whole business.

   WHY THE TOKEN CAP IS 4000 AND NOT 1500

   nova.js retries anything that stops at MAX_TOKENS with three times the
   budget, so an answer that overruns bills four times over and says nothing
   about it. This answer is a long JSON array by design, so it is given room
   once instead of being clipped and bought twice.

   GOES WITH: nova.js (ncAsk learned opts.video), trends-nav.js (the rail row
   and the route), trends.html (loads this), sw.js (cache bump). ai-worker.js
   is UNCHANGED — it already passes contents through untouched, so there is
   nothing to redeploy.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_CLIPPER) return;

  var S = { url: '', id: '', busy: false, err: '', data: null,
            sort: 'score', want: '30-60', mine: false };
  var BOX = null;

  /* nova.js owns the dictionary; this panel only asks it. The fallback is the
     exact English the key replaced, so a page where nova.js has not finished
     loading still reads properly rather than showing a key name. */
  function t(key, fallback) {
    try {
      if (typeof window.tr === 'function') {
        var v = window.tr(key);
        if (v) return v;
      }
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
  /* Hours only once there are hours. A clip reads 0:42, a two-hour stream
     reads 2:00:00 — the first version printed that as 120:00, which is a
     number nobody has ever written down about a video. */
  function clock(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return m + ':' + String(s).padStart(2, '0');
  }
  function tags(c) {
    return (c.hashtags || []).map(function (t) {
      return '#' + String(t).replace(/^#/, '');
    }).join(' ');
  }

  /* Every shape a teenager will actually paste: the long one, the share one,
     the one with a playlist glued on, the one copied out of the app with a
     timestamp already in it. */
  function videoId(raw) {
    var u = String(raw || '').trim();
    if (!u) return '';
    if (/^[\w-]{11}$/.test(u)) return u;
    var m = u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : '';
  }

  /* -------------------------------------------------------------------------
     STYLE
     Only the clip cards. The heading, the lede and .card come from the Studio
     panel stylesheet in trends-nav.js, so this panel looks like the eight next
     to it rather than like a guest.
     ----------------------------------------------------------------------- */
  function styles() {
    if (document.getElementById('ncclip-style')) return;
    var st = document.createElement('style');
    st.id = 'ncclip-style';
    st.textContent =
      '.ncclip-find{display:flex;gap:8px;flex-wrap:wrap}' +
      '.ncclip-find input{flex:1 1 220px;min-width:0;padding:11px 13px;border-radius:11px;' +
        'background:var(--nc-sunk,#070910);border:1px solid var(--nc-line,rgba(120,140,255,.3));' +
        'color:inherit;font:inherit;font-size:15px}' +
      '.ncclip-go{padding:11px 18px;border:0;border-radius:11px;cursor:pointer;font-weight:700;' +
        'background:linear-gradient(90deg,#6C5CE7,#00D2FF);color:#04121a;font:inherit;' +
        'font-weight:700}' +
      '.ncclip-go[disabled]{opacity:.55;cursor:default}' +
      '.ncclip-opts{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:12px;' +
        'font-size:12.5px;opacity:.78}' +
      '.ncclip-opts select{padding:7px 9px;border-radius:9px;' +
        'background:var(--nc-sunk,#070910);border:1px solid var(--nc-line,rgba(120,140,255,.3));' +
        'color:inherit;font:inherit;font-size:12.5px}' +
      '.ncclip-opts label{display:flex;gap:6px;align-items:center}' +
      '.ncclip-note{margin:12px 0 0;padding:11px 13px;border-radius:11px;font-size:12.5px;' +
        'line-height:1.55;background:rgba(180,83,9,.12);' +
        'border:1px solid rgba(251,191,36,.3);color:#B45309}' +
      'html[data-theme="dark"] .ncclip-note{color:#FDE68A}' +
      '.ncclip-msg{margin:14px 0 0;font-size:13px;opacity:.7}' +
      '.ncclip-chap{margin:22px 0 10px;font-size:12px;letter-spacing:.07em;' +
        'text-transform:uppercase;color:#7FB2FF;font-weight:700}' +
      '.ncclip-card{display:flex;gap:14px;padding:14px;margin-top:10px;border-radius:14px;' +
        'background:var(--nc-panel,#0F1322);border:1px solid var(--nc-line,rgba(255,255,255,.1))}' +
      '.ncclip-rank{flex:0 0 auto;width:44px;text-align:center}' +
      '.ncclip-rank .n{font-size:12px;opacity:.6;font-weight:700}' +
      '.ncclip-score{font:700 20px/1.1 inherit;margin-top:4px}' +
      '.ncclip-score small{display:block;font-size:10px;font-weight:600;opacity:.6}' +
      '.ncclip-hi{color:#10B981}.ncclip-mid{color:#D97706}.ncclip-lo{opacity:.6}' +
      'html[data-theme="dark"] .ncclip-hi{color:#34D399}' +
      'html[data-theme="dark"] .ncclip-mid{color:#FBBF24}' +
      '.ncclip-main{flex:1 1 auto;min-width:0}' +
      '.ncclip-t{font-size:14.5px;font-weight:700;line-height:1.35}' +
      '.ncclip-when{font-size:12px;opacity:.65;margin-top:3px;font-variant-numeric:tabular-nums}' +
      '.ncclip-why{font-size:12.5px;opacity:.82;margin-top:8px;line-height:1.55}' +
      '.ncclip-hook{font-size:12.5px;margin-top:8px;padding:9px 11px;border-radius:10px;' +
        'background:var(--nc-sunk,#070910);border-left:2px solid #6C5CE7;line-height:1.5}' +
      '.ncclip-cap{font-size:12px;opacity:.82;margin-top:8px;word-break:break-word}' +
      '.ncclip-tags{color:#7FB2FF}' +
      '.ncclip-acts{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}' +
      '.ncclip-acts button{padding:7px 12px;border-radius:9px;' +
        'border:1px solid var(--nc-line,rgba(120,140,255,.34));' +
        'background:var(--nc-sunk,#141A2E);color:inherit;cursor:pointer;' +
        'font:inherit;font-weight:650;font-size:12px}' +
      '.ncclip-acts button.pri{border:0;background:linear-gradient(90deg,#6C5CE7,#00D2FF);' +
        'color:#04121a}' +
      '.ncclip-acts button[disabled]{opacity:.55;cursor:default}' +
      '.ncclip-play{margin-top:10px;width:100%;aspect-ratio:16/9;border:0;border-radius:11px;' +
        'background:#000}' +
      '@media(max-width:560px){.ncclip-card{flex-direction:column;gap:10px}' +
        '.ncclip-rank{display:flex;align-items:baseline;gap:8px;width:auto;text-align:left}' +
        '.ncclip-score{margin-top:0}.ncclip-score small{display:inline;margin-left:4px}}';
    document.head.appendChild(st);
  }

  /* The line that is shown every time and cannot be dismissed. It changes with
     whose video it is, because the answer genuinely changes. */
  function noteHTML() {
    if (S.mine) {
      return t('st_clip_note_mine',
        'You have told NovaClip this is <b>your own video</b>. The timestamps below are a ' +
        'cut list — take them to the Editor and cut away. If it is not yours, untick that ' +
        'box: what comes back is then a plan for your own version, not something to re-upload.');
    }
    return t('st_clip_note_theirs',
      'The video stays on YouTube. NovaClip never downloads it, never re-cuts it and ' +
      'never posts it — re-uploading somebody else’s video is theirs to allow, not ' +
      'ours, and there is no clip length that makes it legal. What you get is the ' +
      '<b>brief</b>: which moments work, why, and what to say, so you can make your own.');
  }

  /* -------------------------------------------------------------------------
     THE ASK
     ----------------------------------------------------------------------- */
  /* THE TWO LIMITS, AND WHY EACH ONE IS WHERE IT IS.

     TWO HOURS AT THE TOP is enforced for real, by videoTo below — Gemini
     simply stops watching at 7200 seconds, so a four-hour stream is billed as
     two hours and answers about the first half rather than running up a bill
     nobody agreed to. It is a cap on the watching, not a refusal: paste a long
     stream and you get the first two hours, and the page says so.

     TWO MINUTES AT THE BOTTOM is a refusal, and it is a judgement about the
     answer rather than the cost. Under two minutes there is no long video to
     find the good part OF — the whole thing is already the clip, and what
     comes back is three overlapping windows onto the same ninety seconds, each
     with a confident score. That is worse than nothing because it looks like
     an answer.

     The length is read off the video by the model, not looked up: the only
     place a duration could otherwise come from is YouTube's Data API, which
     would mean a new endpoint on ai-worker.js and a redeploy — and the whole
     point of this feature is that it needed neither. */
  var MAX_SECONDS = 7200;      /* two hours of watching, hard */
  var MIN_SECONDS = 120;       /* under this there is nothing to find */

  function prompt() {
    var band = S.want === '15-30' ? '15 to 30 seconds'
             : S.want === '60-90' ? '60 to 90 seconds' : '30 to 60 seconds';
    return 'FIRST, the length. Report how long this video is in seconds as "seconds". If it is ' +
      'under ' + MIN_SECONDS + ' seconds, answer {"seconds":<the length>,"chapters":[]} and ' +
      'nothing else — do not find clips in it. A video that short is already the clip, and ' +
      'cutting it up produces three overlapping windows onto the same moment.\n\n' +
      'You are finding the moments in this video that would work as standalone short ' +
      'videos for a teenage creator. Watch it properly — do not guess from the title.\n\n' +
      'Each clip must be ' + band + ' long and must make sense on its own to somebody who has ' +
      'never seen the rest. A clip that needs the previous ten minutes explained is a bad clip ' +
      'however funny it is.\n\n' +
      'Score each one out of 100 on whether a stranger would stop scrolling for it. Be hard: ' +
      'most moments in most videos are not worth clipping, and a list where everything scores ' +
      '80 is useless. Use the full range.\n\n' +
      'Group them into chapters that describe what that stretch of the video is about.\n\n' +
      'Answer with ONE line of JSON and nothing else:\n' +
      '{"video":"<what the video is, max 12 words>","seconds":<how long the video is>,' +
      '"chapters":[{"name":"<max 8 words>","clips":[' +
      '{"start":<seconds>,"end":<seconds>,"title":"<max 7 words, how a clipper would title it>",' +
      '"score":<0-100>,"why":"<why it stops the scroll, max 30 words>",' +
      '"hook":"<the words actually said in the first seconds, quoted from the video>",' +
      '"caption":"<a caption for the post, max 25 words>",' +
      '"hashtags":["<no # sign>","…up to 5"]}]}]}\n' +
      'start and end are seconds from the beginning of the video, as numbers.\n' +
      'Order the clips inside each chapter by where they happen, not by score.';
  }

  function run() {
    var id = videoId(S.url);
    if (!id) {
      S.err = 'That does not look like a YouTube link. Paste the whole thing from the address bar.';
      render(); return;
    }
    if (typeof window.ncAsk !== 'function') {
      S.err = 'The AI is not loaded on this page, so nothing can be watched.';
      render(); return;
    }
    S.id = id; S.err = ''; S.data = null; S.busy = true;
    render();

    window.ncAsk(prompt(), {
      video: 'https://www.youtube.com/watch?v=' + id,
      /* The cap that does the work. Past two hours Gemini stops watching, so
         a six-hour stream costs what two hours costs instead of what six do. */
      videoFrom: 0,
      videoTo: MAX_SECONDS,
      maxTokens: 4000,
      temperature: 0.4
    }).then(function (r) {
      S.busy = false;
      if (!r || r.err) {
        S.err = (r && r.err) || 'The AI did not answer.';
        if (/not.*public|private|unlisted|unavailable|permission/i.test(S.err)) {
          S.err = 'Google could not open that video. It has to be a PUBLIC YouTube video — ' +
                  'unlisted and private ones are refused, and so are videos that are age-gated ' +
                  'or blocked in some countries.';
        }
        render(); return;
      }
      var m = String(r.text || '').match(/\{[\s\S]*\}/);
      if (!m) {
        S.err = 'The AI answered, but not in the shape this page can read. Try again.';
        render(); return;
      }
      try { S.data = JSON.parse(m[0]); }
      catch (e) {
        S.err = 'The AI’s answer was cut off halfway. Try a shorter video, or ask again.';
      }
      render();
    }).catch(function (e) {
      S.busy = false;
      S.err = 'The AI did not answer: ' + (e && e.message ? e.message : 'unknown');
      render();
    });
  }

  /* -------------------------------------------------------------------------
     RENDER
     ----------------------------------------------------------------------- */
  function allClips() {
    var out = [];
    ((S.data && S.data.chapters) || []).forEach(function (ch) {
      (ch.clips || []).forEach(function (c) { out.push({ ch: ch.name || '', c: c }); });
    });
    return out;
  }

  function scoreClass(n) {
    return n >= 75 ? 'ncclip-hi' : n >= 55 ? 'ncclip-mid' : 'ncclip-lo';
  }

  function flash(btn, text, was) {
    btn.textContent = text;
    setTimeout(function () { btn.textContent = was; }, 1700);
  }

  function copyText(btn, text, was) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash(btn, t('st_clip_copied', 'Copied'), was); },
        function () { flash(btn, t('st_clip_nocopy', 'Could not copy'), was); });
    } else flash(btn, t('st_clip_nocopy', 'Could not copy'), was);
  }

  function card(c, rank) {
    var wrap = el('div', 'ncclip-card');
    var secs = Math.max(0, Math.round((c.end || 0) - (c.start || 0)));
    var sc = Math.max(0, Math.min(100, Math.round(c.score || 0)));

    var left = el('div', 'ncclip-rank');
    left.innerHTML = '<div class="n">#' + rank + '</div>' +
      '<div class="ncclip-score ' + scoreClass(sc) + '">' + sc + '<small>/ 100</small></div>';

    var main = el('div', 'ncclip-main');
    main.appendChild(el('div', 'ncclip-t', esc(c.title || 'Untitled moment')));
    main.appendChild(el('div', 'ncclip-when',
      clock(c.start) + ' – ' + clock(c.end) + ' · ' + secs + 's'));
    if (c.why) main.appendChild(el('div', 'ncclip-why', esc(c.why)));
    if (c.hook) main.appendChild(el('div', 'ncclip-hook', '“' + esc(c.hook) + '”'));
    if (c.caption) {
      var tg = tags(c);
      main.appendChild(el('div', 'ncclip-cap',
        esc(c.caption) + (tg ? ' <span class="ncclip-tags">' + esc(tg) + '</span>' : '')));
    }

    var acts = el('div', 'ncclip-acts');

    var play = el('button', 'pri', '▶ ' + esc(t('st_clip_watch', 'Watch this bit')));
    play.type = 'button';
    play.onclick = function () {
      var old = main.querySelector('iframe');
      if (old) { old.remove();
        play.textContent = '▶ ' + t('st_clip_watch', 'Watch this bit'); return; }
      var f = document.createElement('iframe');
      f.className = 'ncclip-play';
      f.allow = 'accelerometer; clipboard-write; encrypted-media; picture-in-picture';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      f.src = 'https://www.youtube-nocookie.com/embed/' + S.id +
              '?start=' + Math.round(c.start || 0) + '&end=' + Math.round(c.end || 0) +
              '&autoplay=1&rel=0';
      main.appendChild(f);
      play.textContent = '✕ ' + t('st_clip_close', 'Close the player');
    };
    acts.appendChild(play);

    var cap = el('button', '', esc(t('st_clip_copycap', 'Copy the caption')));
    cap.type = 'button';
    cap.onclick = function () {
      var tg = tags(c);
      copyText(cap, (tg ? (c.caption || '') + '\n\n' + tg : (c.caption || '')),
               t('st_clip_copycap', 'Copy the caption'));
    };
    acts.appendChild(cap);

    /* Only on your own footage is a timestamp a cut. On somebody else's it is
       a brief, so the button is not offered at all rather than being offered
       and then refusing. */
    if (S.mine) {
      var cut = el('button', '', '✂ ' + esc(t('st_clip_inout', 'Copy the in/out')));
      cut.type = 'button';
      cut.onclick = function () {
        copyText(cut, clock(c.start) + ' - ' + clock(c.end) + '  ' + (c.title || ''),
                 '✂ ' + t('st_clip_inout', 'Copy the in/out'));
      };
      acts.appendChild(cut);
    }

    main.appendChild(acts);
    wrap.appendChild(left);
    wrap.appendChild(main);
    return wrap;
  }

  function render() {
    if (!BOX) return;
    var host = BOX.querySelector('.ncclip-body');
    if (!host) return;
    host.innerHTML = '';

    var find = el('div', 'ncclip-find');
    var input = el('input');
    input.type = 'url';
    input.placeholder = t('st_clip_paste', 'Paste a YouTube link…');
    input.value = S.url;
    input.setAttribute('aria-label', 'YouTube video link');
    var go = el('button', 'ncclip-go', S.busy ? t('st_clip_watching', 'Watching…')
                                              : t('st_clip_find', 'Find the clips'));
    go.type = 'button';
    go.disabled = S.busy;
    find.appendChild(input); find.appendChild(go);
    host.appendChild(find);

    var opts = el('div', 'ncclip-opts');

    var lenWrap = el('label', '', esc(t('st_clip_len', 'Clip length')) + ' ');
    var len = el('select');
    [['15-30', '15–30s'], ['30-60', '30–60s'], ['60-90', '60–90s']].forEach(function (o) {
      var op = el('option', '', o[1]);
      op.value = o[0];
      if (o[0] === S.want) op.selected = true;
      len.appendChild(op);
    });
    len.onchange = function () { S.want = len.value; };
    lenWrap.appendChild(len);
    opts.appendChild(lenWrap);

    if (S.data) {
      var sortWrap = el('label', '', esc(t('st_clip_sort', 'Sort by')) + ' ');
      var sort = el('select');
      [['score', t('st_clip_score', 'Score')], ['time', t('st_clip_time', 'Time')]].forEach(function (o) {
        var op = el('option', '', o[1]);
        op.value = o[0];
        if (o[0] === S.sort) op.selected = true;
        sort.appendChild(op);
      });
      sort.onchange = function () { S.sort = sort.value; render(); };
      sortWrap.appendChild(sort);
      opts.appendChild(sortWrap);
    }

    var mineWrap = el('label');
    var mine = el('input');
    mine.type = 'checkbox';
    mine.checked = S.mine;
    mine.onchange = function () { S.mine = mine.checked; render(); };
    mineWrap.appendChild(mine);
    mineWrap.appendChild(document.createTextNode(' ' + t('st_clip_mine', 'This is my own video')));
    opts.appendChild(mineWrap);
    host.appendChild(opts);

    host.appendChild(el('div', 'ncclip-note', noteHTML()));

    var start = function () {
      S.url = input.value.trim();
      if (!S.url) { input.focus(); return; }
      run();
    };
    go.onclick = start;
    input.onkeydown = function (e) { if (e.key === 'Enter') start(); };

    if (S.busy) {
      host.appendChild(el('p', 'ncclip-msg', esc(t('st_clip_busy',
        'Google is watching the whole video. On a long one this takes a minute — ' +
        'it is reading it, not searching for it.'))));
      return;
    }
    if (S.err) { host.appendChild(el('p', 'ncclip-msg', esc(S.err))); return; }
    if (!S.data) return;

    var flat = allClips();
    var secs = Math.round(S.data.seconds || 0);

    /* Too short, and say which it was rather than "no clips found" — the
       difference between "your video is 90 seconds" and "the AI found
       nothing" is the difference between knowing what to do next and not. */
    if (!flat.length && secs > 0 && secs < MIN_SECONDS) {
      host.appendChild(el('div', 'ncclip-note',
        t('st_clip_short',
          'That video is <b>{d}</b> long, and the clipper needs at least <b>two minutes</b> to ' +
          'work with. Under that there is no long video to find the good part of — the whole ' +
          'thing is already the clip. Paste something longer.')
          .replace('{d}', clock(secs))));
      return;
    }
    if (!flat.length) {
      host.appendChild(el('p', 'ncclip-msg',
        esc(t('st_clip_nothing', 'Nothing in that video came back as worth clipping.'))));
      return;
    }

    if (S.data.video) {
      host.appendChild(el('p', 'ncclip-msg',
        '<b>' + esc(S.data.video) + '</b>' +
        (secs ? ' · ' + t('st_clip_dur', '{d} long').replace('{d}', clock(secs)) : '') +
        ' — ' + t(flat.length === 1 ? 'st_clip_found1' : 'st_clip_found',
                  flat.length === 1 ? '{n} moment worth cutting' : '{n} moments worth cutting')
                  .replace('{n}', flat.length) + '.'));
    }

    /* Longer than the cap: the answer only covers the first two hours, and a
       list of timestamps that silently stops at 2:00:00 would otherwise look
       like the back half of the stream simply had nothing in it. */
    if (secs > MAX_SECONDS) {
      host.appendChild(el('div', 'ncclip-note',
        t('st_clip_long',
          'That video is <b>{d}</b> long, so only the <b>first two hours</b> were watched. ' +
          'Everything below comes from that part. To get at the rest, upload it in pieces or ' +
          'use a link that starts later.')
          .replace('{d}', clock(secs))));
    }

    if (S.sort === 'score') {
      host.appendChild(el('div', 'ncclip-chap', esc(t('st_clip_best', 'Best first'))));
      flat.slice().sort(function (a, b) { return (b.c.score || 0) - (a.c.score || 0); })
        .forEach(function (x, i) { host.appendChild(card(x.c, i + 1)); });
      return;
    }

    var n = 0;
    (S.data.chapters || []).forEach(function (ch) {
      if (!ch.clips || !ch.clips.length) return;
      host.appendChild(el('div', 'ncclip-chap', esc(ch.name || 'Chapter')));
      ch.clips.slice().sort(function (a, b) { return (a.start || 0) - (b.start || 0); })
        .forEach(function (c) { host.appendChild(card(c, ++n)); });
    });
  }

  /* -------------------------------------------------------------------------
     MOUNT — trends-nav.js hands us the panel box and we fill it. Guarded the
     same way the other panels are, so coming back to the route keeps whatever
     was already found rather than rebuilding an empty form.
     ----------------------------------------------------------------------- */
  function mount(box) {
    if (box.dataset.view === 'clipper') { BOX = box; return; }
    box.dataset.view = 'clipper';
    styles();
    BOX = box;
    box.innerHTML =
      '<h1 data-t="st_clipper_h">' + esc(t('st_clipper_h', 'AI Clipper')) + '</h1>' +
      '<p class="lede" data-t="st_clipper_p">' + t('st_clipper_p',
        'Paste a long video and NovaClip watches it, then tells you which moments would ' +
        'work on their own — where each one starts and ends, how strong it is, and what to ' +
        'put in the caption. It reads up to two hours, and needs the video to be at least ' +
        'two minutes long. Public YouTube videos only.') + '</p>' +
      '<div class="card"><div class="ncclip-body"></div></div>';
    render();
  }

  window.NC_CLIPPER = { mount: mount, render: render, state: S };
})();
