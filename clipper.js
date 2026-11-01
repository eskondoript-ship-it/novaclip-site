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
  function clock(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
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
      return 'You have told NovaClip this is <b>your own video</b>. The timestamps below are a ' +
             'cut list — take them to the Editor and cut away. If it is not yours, untick that ' +
             'box: what comes back is then a plan for your own version, not something to ' +
             're-upload.';
    }
    return 'The video stays on YouTube. NovaClip never downloads it, never re-cuts it and ' +
           'never posts it — re-uploading somebody else’s video is theirs to allow, not ' +
           'ours, and there is no clip length that makes it legal. What you get is the ' +
           '<b>brief</b>: which moments work, why, and what to say, so you can make your own.';
  }

  /* -------------------------------------------------------------------------
     THE ASK
     ----------------------------------------------------------------------- */
  function prompt() {
    var band = S.want === '15-30' ? '15 to 30 seconds'
             : S.want === '60-90' ? '60 to 90 seconds' : '30 to 60 seconds';
    return 'You are finding the moments in this video that would work as standalone short ' +
      'videos for a teenage creator. Watch it properly — do not guess from the title.\n\n' +
      'Each clip must be ' + band + ' long and must make sense on its own to somebody who has ' +
      'never seen the rest. A clip that needs the previous ten minutes explained is a bad clip ' +
      'however funny it is.\n\n' +
      'Score each one out of 100 on whether a stranger would stop scrolling for it. Be hard: ' +
      'most moments in most videos are not worth clipping, and a list where everything scores ' +
      '80 is useless. Use the full range.\n\n' +
      'Group them into chapters that describe what that stretch of the video is about.\n\n' +
      'Answer with ONE line of JSON and nothing else:\n' +
      '{"video":"<what the video is, max 12 words>",' +
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
        function () { flash(btn, 'Copied', was); },
        function () { flash(btn, 'Could not copy', was); });
    } else flash(btn, 'Could not copy', was);
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
      var t = tags(c);
      main.appendChild(el('div', 'ncclip-cap',
        esc(c.caption) + (t ? ' <span class="ncclip-tags">' + esc(t) + '</span>' : '')));
    }

    var acts = el('div', 'ncclip-acts');

    var play = el('button', 'pri', '▶ Watch this bit');
    play.type = 'button';
    play.onclick = function () {
      var old = main.querySelector('iframe');
      if (old) { old.remove(); play.textContent = '▶ Watch this bit'; return; }
      var f = document.createElement('iframe');
      f.className = 'ncclip-play';
      f.allow = 'accelerometer; clipboard-write; encrypted-media; picture-in-picture';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      f.src = 'https://www.youtube-nocookie.com/embed/' + S.id +
              '?start=' + Math.round(c.start || 0) + '&end=' + Math.round(c.end || 0) +
              '&autoplay=1&rel=0';
      main.appendChild(f);
      play.textContent = '✕ Close the player';
    };
    acts.appendChild(play);

    var cap = el('button', '', 'Copy the caption');
    cap.type = 'button';
    cap.onclick = function () {
      var t = tags(c);
      copyText(cap, (c.caption || '') + (t ? '\n\n' + t : ''), 'Copy the caption');
    };
    acts.appendChild(cap);

    /* Only on your own footage is a timestamp a cut. On somebody else's it is
       a brief, so the button is not offered at all rather than being offered
       and then refusing. */
    if (S.mine) {
      var cut = el('button', '', '✂ Copy the in/out');
      cut.type = 'button';
      cut.onclick = function () {
        copyText(cut, clock(c.start) + ' - ' + clock(c.end) + '  ' + (c.title || ''),
                 '✂ Copy the in/out');
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
    input.placeholder = 'Paste a YouTube link…';
    input.value = S.url;
    input.setAttribute('aria-label', 'YouTube video link');
    var go = el('button', 'ncclip-go', S.busy ? 'Watching…' : 'Find the clips');
    go.type = 'button';
    go.disabled = S.busy;
    find.appendChild(input); find.appendChild(go);
    host.appendChild(find);

    var opts = el('div', 'ncclip-opts');

    var lenWrap = el('label', '', 'Clip length ');
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
      var sortWrap = el('label', '', 'Sort by ');
      var sort = el('select');
      [['score', 'Score'], ['time', 'Time']].forEach(function (o) {
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
    mineWrap.appendChild(document.createTextNode(' This is my own video'));
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
      host.appendChild(el('p', 'ncclip-msg',
        'Google is watching the whole video. On a long one this takes a minute — ' +
        'it is reading it, not searching for it.'));
      return;
    }
    if (S.err) { host.appendChild(el('p', 'ncclip-msg', esc(S.err))); return; }
    if (!S.data) return;

    var flat = allClips();
    if (!flat.length) {
      host.appendChild(el('p', 'ncclip-msg',
        'Nothing in that video came back as worth clipping.'));
      return;
    }

    if (S.data.video) {
      host.appendChild(el('p', 'ncclip-msg',
        '<b>' + esc(S.data.video) + '</b> — ' + flat.length + ' moments worth cutting.'));
    }

    if (S.sort === 'score') {
      host.appendChild(el('div', 'ncclip-chap', 'Best first'));
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
      '<h1>AI clipper</h1>' +
      '<p class="lede">Paste a long video and NovaClip watches it, then tells you which ' +
      'moments would work on their own — where each one starts and ends, how strong it ' +
      'is, and what to put in the caption.</p>' +
      '<div class="card"><div class="ncclip-body"></div></div>';
    render();
  }

  window.NC_CLIPPER = { mount: mount, render: render, state: S };
})();
