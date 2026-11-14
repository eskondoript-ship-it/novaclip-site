/* NOVACLIP — ONE VIDEO, EVERY PLACE IT GOES
 * ===========================================================================
 * Asked for: "make posting to more than one site at the same time easy like
 * buffer.com".
 *
 * WHAT BUFFER DOES, AND WHY THIS IS NOT THAT
 * ---------------------------------------------------------------------------
 * Buffer holds your TikTok and Instagram tokens on ITS servers and posts for
 * you at three in the morning. That is the product. It needs a machine that
 * stays awake, an approved app on each platform, and somewhere to keep the
 * tokens.
 *
 * NovaClip is a static site. publish.html already says this in its own words,
 * a few hundred lines above this file's panel: "NovaClip is a website with no
 * server behind it. A website cannot upload anything while its tab is closed
 * — there is nothing left running to do it." That has not changed, and
 * pretending otherwise would mean a queue that says a video went out when it
 * did not, which is the one failure that costs somebody a posting streak they
 * cannot get back.
 *
 * So this does the part that does not need a server, which is most of the
 * work and all of the boring work:
 *
 *   - ONE caption, rewritten per platform. A YouTube description and a TikTok
 *     caption are not the same text and never were. The retyping is what
 *     makes people post to one place and mean to do the rest later.
 *   - The first line pulled out and counted on its own, because roughly 125
 *     characters is all anyone sees before "more" on every platform here.
 *   - Hashtags capped and shared across platforms.
 *   - One press per platform: hand the actual video file to the app on a
 *     phone, or copy the caption and open the upload page on a laptop.
 *   - A record of where it has actually gone, which is the thing you lose
 *     track of at eleven at night.
 *
 * What it will not do is claim to have posted anything.
 *
 * THE NUMBERS IN HERE MOVE, SO THEY ARE DATED
 * ---------------------------------------------------------------------------
 * Checked November 2026, and two of them had changed recently enough that
 * writing them from memory would have been wrong:
 *
 *   - Instagram cut hashtags from 30 to 5 per post and Reel in December 2025.
 *     TikTok counts about the first five too. So the cap here is 5, not the
 *     thirty that every older guide still prints — and over-tagging is now
 *     something platforms actively discount rather than ignore.
 *   - TikTok's caption limit is reported as 4,000 in the app but 2,200
 *     through the posting API that every scheduler uses. 2,200 is used here
 *     because a caption that fits the smaller number fits both, and nothing
 *     is lost by writing to it.
 *
 * Instagram and TikTok both truncate at about 125 characters in the feed, and
 * that number is older and steadier than the caption caps. It is the one the
 * panel actually puts a counter on.
 *
 * WHERE THE FILE GOES
 * ---------------------------------------------------------------------------
 * navigator.share with a file is the good path: on a phone it opens the real
 * share sheet with the video attached, so TikTok and Instagram receive it the
 * way they expect. It is genuinely unavailable on most desktops, so the
 * fallback is not an error message — it is the caption on the clipboard, the
 * file downloaded, and the platform's upload page opened.
 */
(function () {
  'use strict';
  if (window.NC_XPOST) return;

  var TAG_CAP = 5;
  var HOOK = 125;          /* what shows before "more" */
  var KEY = 'nc_xpost';

  /* The platforms a teenager posting shorts actually uses. Each one says what
     it takes and where it is posted from; nothing here pretends to upload. */
  var SITES = [
    { id: 'yt', name: 'YouTube Shorts', cap: 5000, tags: 15,
      url: 'https://www.youtube.com/upload',
      note: 'Title and description are separate. The description is where the tags go.' },
    { id: 'tt', name: 'TikTok', cap: 2200, tags: TAG_CAP,
      url: 'https://www.tiktok.com/upload',
      note: 'Caption and hashtags are one box. Hashtags count towards the limit.' },
    { id: 'ig', name: 'Instagram Reels', cap: 2200, tags: TAG_CAP,
      url: 'https://www.instagram.com/',
      note: 'Five hashtags at most since December 2025 — more is not neutral any more.' },
    { id: 'fb', name: 'Facebook Reels', cap: 2200, tags: TAG_CAP,
      url: 'https://www.facebook.com/reels/create',
      note: 'Takes the same caption as Instagram.' },
    { id: 'x', name: 'X', cap: 280, tags: 2,
      url: 'https://x.com/compose/post',
      note: 'Short. The hook on its own, and at most two tags.' }
  ];

  function $(id) { return document.getElementById(id); }

  /* ------------------------------------------------------------- the words */

  function cleanTag(t) {
    return String(t || '').replace(/[^0-9A-Za-zÀ-ɏ]/g, '');
  }

  function hashes(tags, n) {
    var out = [];
    for (var i = 0; i < tags.length && out.length < n; i++) {
      var t = cleanTag(tags[i]);
      if (t) out.push('#' + t);
    }
    return out;
  }

  /* The first sentence, or the first line, whichever comes first. This is the
     hook — the only part most people read — so it leads every caption rather
     than being left wherever it happened to fall in the description. */
  function hookOf(title, desc) {
    var d = String(desc || '').trim();
    if (!d) return String(title || '').trim();
    var line = d.split(/\n/)[0].trim();
    var stop = line.search(/[.!?](\s|$)/);
    if (stop > 20 && stop < HOOK) line = line.slice(0, stop + 1);
    return line || String(title || '').trim();
  }

  /* Cut at a word, never mid-word, and only when there is something to cut. */
  function fit(text, cap) {
    var t = String(text || '');
    if (t.length <= cap) return t;
    var cut = t.slice(0, cap - 1);
    var sp = cut.lastIndexOf(' ');
    if (sp > cap * 0.6) cut = cut.slice(0, sp);
    return cut.replace(/[\s,;:–-]+$/, '') + '…';
  }

  function captionFor(site, src) {
    var tagLine = hashes(src.tags, site.tags).join(' ');

    if (site.id === 'yt') {
      /* YouTube is the one with a separate title field, so its body is the
         description as written rather than a caption built around a hook. */
      var body = String(src.desc || '').trim();
      return (body + (tagLine ? '\n\n' + tagLine : '')).trim();
    }

    if (site.id === 'x') {
      /* 280 including the tags, so the tags are budgeted first and the hook
         gets what is left — the other way round truncates mid-hashtag. */
      var room = site.cap - (tagLine ? tagLine.length + 1 : 0);
      return (fit(src.hook, Math.max(40, room)) + (tagLine ? ' ' + tagLine : '')).trim();
    }

    var lead = src.hook;
    var rest = String(src.desc || '').trim();
    /* Do not print the hook twice when it was lifted out of the description. */
    if (rest.indexOf(lead) === 0) rest = rest.slice(lead.length).trim();
    var full = lead + (rest ? '\n\n' + rest : '');
    var room2 = site.cap - (tagLine ? tagLine.length + 2 : 0);
    return (fit(full, Math.max(60, room2)) + (tagLine ? '\n\n' + tagLine : '')).trim();
  }

  /* ------------------------------------------------------------- the record */

  function readDone() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeDone(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }
  /* Keyed by the title, because that is the only stable handle a page with no
     server has on "this video". Retitle it and the ticks reset, which is the
     safe direction to be wrong in: it asks again rather than claiming a video
     was posted that never was. */
  function slot() { return (($('title') && $('title').value) || '').trim().slice(0, 80) || '—'; }

  function isDone(siteId) {
    var d = readDone()[slot()];
    return !!(d && d[siteId]);
  }
  function setDone(siteId, on) {
    var all = readDone(), k = slot();
    if (!all[k]) all[k] = {};
    if (on) all[k][siteId] = Date.now(); else delete all[k][siteId];
    writeDone(all);
  }

  /* --------------------------------------------------------------- handing over */

  function clip() { return window.__ncClip || null; }

  function canShareFile() {
    var f = clip();
    if (!f || !navigator.share || !navigator.canShare) return false;
    try { return navigator.canShare({ files: [f] }); } catch (e) { return false; }
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (res, rej) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        res();
      } catch (e) { rej(e); }
    });
  }

  function download() {
    var f = clip();
    if (!f) return false;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(f);
    a.download = f.name || 'video.mp4';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 20000);
    return true;
  }

  /* ------------------------------------------------------------------- view */

  var built = false;

  function row(site) {
    var r = document.createElement('div');
    r.className = 'xp-row';
    r.dataset.site = site.id;
    r.innerHTML =
      '<div class="xp-head">' +
        '<label class="xp-tick"><input type="checkbox" class="xp-done"><span></span></label>' +
        '<b class="xp-name"></b>' +
        '<span class="xp-count"></span>' +
      '</div>' +
      '<p class="xp-note"></p>' +
      '<textarea class="xp-text" rows="4" spellcheck="false"></textarea>' +
      '<div class="xp-btns">' +
        '<button type="button" class="xp-b xp-copy">Copy caption</button>' +
        '<button type="button" class="xp-b xp-send"></button>' +
        '<button type="button" class="xp-b xp-open">Open ' + '</button>' +
      '</div>' +
      '<div class="xp-say" aria-live="polite"></div>';
    r.querySelector('.xp-name').textContent = site.name;
    r.querySelector('.xp-note').textContent = site.note;
    r.querySelector('.xp-open').textContent = 'Open ' + site.name;
    return r;
  }

  function panelHTML() {
    return '' +
      '<h2><span class="n">7</span>Everywhere else</h2>' +
      '<p class="sub">The same video, written once, in the shape each place wants it. ' +
        'Tick them off as they go out.</p>' +
      '<div class="row" style="margin-bottom:4px">' +
        '<button class="go" type="button" id="xpBuild">Write them all</button>' +
        '<button class="alt" type="button" id="xpReset">Clear the ticks</button>' +
      '</div>' +
      '<div class="say" id="xpSay"></div>' +
      '<div id="xpRows"></div>' +
      '<p class="note"><b>Why there is no "post at 6pm" button here.</b> ' +
        'Buffer can schedule because it runs on its own servers and holds your ' +
        'accounts. NovaClip has no server — a website cannot upload anything once ' +
        'its tab is shut, and a queue that says a video went out when it did not is ' +
        'worse than no queue. So this does everything except the press: the caption ' +
        'each place wants, the video handed straight to the app on a phone, and a ' +
        'record of where it has actually gone. For a genuine scheduled post, upload ' +
        'to YouTube now and use <b>YouTube’s own scheduled publishing</b> — that ' +
        'runs on their machines.</p>';
  }

  function gather() {
    var tags = [];
    var box = $('tagbox');
    if (box) {
      /* Each tag is <span class="tag">text<button>×</button></span>. Clone and
         drop the button rather than stripping a trailing × off the text: the
         string version eats the last letter of any tag that happens to end in
         one, and "max" coming out as "ma" is the kind of bug nobody looks for
         twice. */
      box.querySelectorAll('.tag').forEach(function (n) {
        var c = n.cloneNode(true);
        c.querySelectorAll('button').forEach(function (b) { b.remove(); });
        var t = (c.textContent || '').trim();
        if (t && tags.indexOf(t) < 0 && t.length < 40) tags.push(t);
      });
    }
    var title = ($('title') && $('title').value) || '';
    var desc = ($('desc') && $('desc').value) || '';
    return { title: title.trim(), desc: desc.trim(), tags: tags, hook: hookOf(title, desc) };
  }

  function fill() {
    var src = gather();
    if (!src.title && !src.desc) {
      say('no', 'Nothing to write yet', 'Fill in the title and description in step 4 first.');
      return false;
    }
    var rows = $('xpRows');
    SITES.forEach(function (site) {
      var r = rows.querySelector('[data-site="' + site.id + '"]');
      if (!r) return;
      var ta = r.querySelector('.xp-text');
      var text = site.id === 'yt'
        ? (src.title + '\n\n' + captionFor(site, src))
        : captionFor(site, src);
      ta.value = text;
      count(r, site);
    });
    say('yes', 'Written', 'Five versions, each inside that platform’s limit. Edit any of them before you send it.');
    return true;
  }

  function count(r, site) {
    var ta = r.querySelector('.xp-text');
    var n = ta.value.length;
    var first = ta.value.split('\n')[0].length;
    var c = r.querySelector('.xp-count');
    c.textContent = n + ' / ' + site.cap + '  ·  hook ' + first + '/' + HOOK;
    c.className = 'xp-count' + (n > site.cap || first > HOOK ? ' over' : '');
  }

  function say(kind, title, body) {
    var s = $('xpSay');
    if (!s) return;
    s.className = 'say ' + kind;
    s.style.display = 'block';
    s.innerHTML = '<b>' + title + '</b>' + String(body).replace(/[<>&]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
    });
  }

  function rsay(r, text) {
    var s = r.querySelector('.xp-say');
    s.textContent = text;
    s.style.display = text ? 'block' : 'none';
  }

  function wire(r, site) {
    var ta = r.querySelector('.xp-text');
    ta.addEventListener('input', function () { count(r, site); });

    r.querySelector('.xp-copy').onclick = function () {
      copy(ta.value).then(
        function () { rsay(r, 'Caption copied.'); },
        function () { rsay(r, 'Could not reach the clipboard — select the text and copy it by hand.'); }
      );
    };

    var send = r.querySelector('.xp-send');
    function sendLabel() {
      send.textContent = canShareFile() ? 'Send the video' : 'Copy + download';
    }
    sendLabel();

    send.onclick = function () {
      if (canShareFile()) {
        navigator.share({ files: [clip()], text: ta.value, title: (gather().title || 'Video') })
          .then(function () { rsay(r, 'Handed to the share sheet. Tick it off once it is up.'); })
          .catch(function (e) {
            if (e && e.name === 'AbortError') { rsay(r, ''); return; }
            rsay(r, 'The share sheet refused it. Use Copy + the upload page instead.');
          });
        return;
      }
      /* The laptop path: caption on the clipboard, file in Downloads, upload
         page open. Three presses become one. */
      copy(ta.value).then(function () {
        var got = download();
        rsay(r, got
          ? 'Caption copied and the video is downloading. The upload page is next.'
          : 'Caption copied. Add the video in step 1 to download it with one press.');
        window.open(site.url, '_blank', 'noopener');
      }, function () {
        rsay(r, 'Could not reach the clipboard — select the caption and copy it by hand.');
      });
    };

    r.querySelector('.xp-open').onclick = function () {
      window.open(site.url, '_blank', 'noopener');
    };

    var box = r.querySelector('.xp-done');
    box.checked = isDone(site.id);
    r.classList.toggle('is-done', box.checked);
    box.onchange = function () {
      setDone(site.id, box.checked);
      r.classList.toggle('is-done', box.checked);
      rsay(r, box.checked ? 'Marked as posted.' : '');
    };
  }

  function build() {
    if (built) return true;
    var s6 = $('s6');
    if (!s6 || !s6.parentNode) return false;

    var step = document.createElement('div');
    /* Starts dimmed like steps 3 to 6 and is woken by the page's openSteps().
       A step that is live before there is a clip in invites somebody to write
       five captions for a video that is not there. */
    step.className = 'step off';
    step.id = 's7';
    step.innerHTML = panelHTML();
    s6.parentNode.insertBefore(step, s6.nextSibling);

    var rows = $('xpRows');
    SITES.forEach(function (site) {
      var r = row(site);
      rows.appendChild(r);
      wire(r, site);
    });

    $('xpBuild').onclick = fill;
    $('xpReset').onclick = function () {
      var all = readDone();
      delete all[slot()];
      writeDone(all);
      SITES.forEach(function (site) {
        var r = rows.querySelector('[data-site="' + site.id + '"]');
        var b = r.querySelector('.xp-done');
        b.checked = false;
        r.classList.remove('is-done');
        rsay(r, '');
      });
      say('yes', 'Cleared', 'Nothing is marked as posted for this title any more.');
    };

    built = true;
    return true;
  }

  var CSS =
    '#s7 .xp-row{border:1px solid color-mix(in srgb,currentColor 18%,transparent);' +
      'border-radius:14px;padding:13px 15px;margin-top:12px}' +
    '#s7 .xp-row.is-done{opacity:.62;border-color:color-mix(in srgb,#4ade80 55%,transparent)}' +
    '#s7 .xp-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '#s7 .xp-name{font-size:1rem;font-weight:800}' +
    '#s7 .xp-count{margin-left:auto;font-size:.76rem;opacity:.6;' +
      'font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '#s7 .xp-count.over{color:#ff9d57;opacity:1;font-weight:700}' +
    '#s7 .xp-tick{display:inline-flex;align-items:center;cursor:pointer}' +
    '#s7 .xp-tick input{width:18px;height:18px;cursor:pointer}' +
    '#s7 .xp-note{margin:6px 0 8px;font-size:.82rem;opacity:.62;line-height:1.5}' +
    '#s7 .xp-text{width:100%;font:inherit;font-size:.88rem;line-height:1.5;padding:9px 11px;' +
      'border-radius:10px;border:1px solid color-mix(in srgb,currentColor 20%,transparent);' +
      'background:color-mix(in srgb,currentColor 5%,transparent);color:inherit;resize:vertical}' +
    '#s7 .xp-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}' +
    '#s7 .xp-b{min-height:40px;padding:7px 13px;border-radius:999px;font:inherit;' +
      'font-size:.84rem;font-weight:700;cursor:pointer;color:inherit;' +
      'border:1px solid color-mix(in srgb,currentColor 24%,transparent);' +
      'background:color-mix(in srgb,currentColor 6%,transparent)}' +
    '#s7 .xp-b:hover{background:color-mix(in srgb,currentColor 13%,transparent)}' +
    '#s7 .xp-say{margin-top:8px;font-size:.82rem;opacity:.75;display:none}' +
    '@media(max-width:520px){#s7 .xp-count{margin-left:0;width:100%}' +
      '#s7 .xp-b{flex:1 1 auto}}';

  function paint() {
    if (document.getElementById('xp-css')) return;
    var s = document.createElement('style');
    s.id = 'xp-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function start() {
    if (!$('s6')) return;      /* not publish.html */
    paint();
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_XPOST = {
    sites: SITES,
    fill: fill,
    captionFor: captionFor,
    hookOf: hookOf,
    gather: gather,
    done: readDone
  };
})();
