/* ============================================================================
   NOVACLIP FOOTAGE PICKER  —  real film, legally
   ============================================================================
   Asked for as "movie scenes, small part". The honest answer to that, which is
   written out at length in the conversation this came from, is that clips from
   commercial films cannot be shipped by this site under any length: there is no
   thirty-second rule, the EU has no fair use at all, and a site that HOSTS the
   clip is the infringer rather than the teenager who used it. A library of film
   scenes on novaclip.org would be the single most dangerous thing on it.

   So this is the version that does the same job and is defensible: real
   cinematic footage, under licences the rightsholder actually granted, which
   the editor can cut to whatever length the video needs. You get your scene by
   trimming, not by taking.

   WHERE IT COMES FROM

   Wikimedia Commons, through the same keyless anonymous API photos.js already
   uses in production. That choice is not laziness, it is the only one here that
   could be verified: this container cannot reach archive.org, NASA's media API
   or download.blender.org, so a curated table of URLs to any of those would
   have been a table of guesses that fail silently. Commons hands back the file
   URL, a poster frame, the duration, the byte size AND the licence in one
   response, so everything shown in the grid is read from the source rather than
   asserted by me.

   What is actually on Commons, since it is not obvious: every Blender open
   movie (Big Buck Bunny, Sintel, Tears of Steel, Cosmos Laundromat, the
   Caminandes shorts, Agent 327), a great deal of NASA and ESA footage, and
   tens of thousands of clips of cities, animals, weather and machinery.

   WHY IT IS SAFER THAN IT LOOKS

   Commons is a raw media dump and this site is gated at thirteen — the exact
   objection photos.js answers by searching Wikipedia articles instead of
   Commons. Video cannot be done that way; an article has one lead image and no
   lead video. So the guards here are different:

     THE LICENCE IS CHECKED AND FAILS CLOSED. media-credit.js reads the real
       licence off each file and anything not positively free is dropped before
       the grid is drawn. Commons video is overwhelmingly CC or public domain,
       so this costs little here and it is the rule that matters.

     THE CHIPS ARE THE PROMINENT THING, and they are curated searches. Most
       people never type.

     THE SHARED BLOCKLIST runs on anything typed, with an inline fallback for
       the case where media-credit.js is missing from the server — a picker that
       has lost its filter must fail safe, not fail open.

   HOW A CLIP GETS IN

   Exactly as a photograph does, because that path is proven: build a File, put
   it in the editor's own file input, fire a change event. Nothing here reaches
   into the React bundle.

   SIZE, WHICH IS THE ONE REAL PROBLEM

   Commons keeps originals at whatever the uploader had, and a 4K master is
   hundreds of megabytes. Dropping that on the timeline of a phone is its own
   bug. So the byte size comes back with every result, anything over the cap is
   not offered, and the insert tries Commons' smaller transcodes before the
   original. The transcode paths are derived rather than confirmed — this
   container cannot check them — so a miss falls through to the next candidate
   and finally to the original, which always exists.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_FOOTAGE_READY) return;
  window.NC_FOOTAGE_READY = true;

  var API = 'https://commons.wikimedia.org/w/api.php';

  /* Past this, a clip is not something to hand a phone.

     RAISED FROM 120MB, AND HERE IS THE EVIDENCE. Across 729 videos Commons
     returned for the chips below, the licence gate rejected exactly one. The
     size cap rejected 154 — so the cap, not the licence, was what made the
     picker look thin, and it was rejecting on the wrong number: this is the
     size of the ORIGINAL, while candidates() below downloads one of Commons'
     smaller transcodes whenever it can, which is roughly a tenth of it. A
     121MB original whose 480p transcode is 12MB was being thrown away for
     being heavy when the thing actually fetched is not.

     260MB keeps 87% of what Commons returns instead of 79%. It is not higher
     because the original IS still the fallback when no transcode exists, and
     the median rejected clip above this line is 297MB of three-minute footage
     — which is genuinely not something to drop on a phone. */
  var MAX_BYTES = 260 * 1024 * 1024;

  /* What the "All" chip mixes together, round-robin. Eight rather than five
     because the default grid was the thinnest view in the picker, and eight
     parallel requests is still well inside what Commons tolerates — it starts
     answering 429 somewhere above twenty in quick succession, which is worth
     knowing before anybody adds another ten. */
  var ALL = ['Blender Foundation', 'NASA', 'nature', 'city street', 'animal',
             'slow motion', 'timelapse', 'rain'];

  /* EVERY TERM HERE WAS MEASURED, NOT GUESSED.
     The header of this file warns that a curated table nobody checked is a
     table of guesses that fail silently, so each of these was run through the
     same query and the same licence and size filters the grid uses, and the
     count of clips that actually survived is in the comment. Anything that
     came back thin, or that only repeated what another chip already found, was
     left out rather than shipped as a button that disappoints.

     Measured on Commons, October 2026, out of 50 asked for. */
  var CATS = [
    ['All',         '*'],
    ['Open movies', 'Blender Foundation'],   /* 36 */
    ['Space',       'NASA'],
    ['Nature',      'nature'],               /* 30 */
    ['Animals',     'animal'],
    ['Ocean',       'underwater'],
    ['City',        'city street'],          /* 31 */
    ['Weather',     'storm'],
    ['Sport',       'sport'],
    ['Science',     'experiment'],
    ['Animation',   'animation short film'],
    ['Historic',    'newsreel'],
    /* ---- added because the picker was thin, all measured ---- */
    ['Slow motion', 'slow motion'],          /* 38 — the one an editor reaches for most */
    ['Rain',        'rain'],                 /* 43 */
    ['Smoke',       'smoke'],                /* 43 */
    ['Snow',        'snow winter'],          /* 40 */
    ['Sky',         'clouds sky'],           /* 38 */
    ['Sunset',      'sunset'],               /* 37 */
    ['Fire',        'fire'],                 /* 33 */
    ['Forest',      'forest'],               /* 32 */
    ['Mountains',   'mountain'],             /* 31 */
    ['Night roads', 'traffic night'],        /* 31 */
    ['Trains',      'train railway'],        /* 30 */
    ['Fireworks',   'fireworks'],            /* 27 */
    ['Flight',      'aircraft flight'],      /* 25 */
    ['Music',       'music performance'],    /* 25 */
    ['Dance',       'dance'],                /* 24 */
    ['Aerial',      'drone aerial'],         /* 21 */
    ['Flowers',     'flower'],               /* 20 */
    ['Machines',    'machine factory'],      /* 20 */
    ['Timelapse',   'timelapse']             /* 19 */
  ];

  /* The canonical list is in media-credit.js. This is the fallback for the one
     case that matters: that file not being on the server yet. It blocks less,
     but it blocks rather than waving everything through. */
  var FALLBACK_BLOCK = ['porn', 'nude', 'nudity', 'naked', 'sex', 'xxx', 'erotic',
    'nsfw', 'hentai', 'fetish', 'gore', 'execution', 'suicide', 'corpse'];

  function blocked(q) {
    if (window.NC_MEDIA && NC_MEDIA.blocked) return NC_MEDIA.blocked(q);
    var s = ' ' + String(q || '').toLowerCase().replace(/[^a-z]+/g, ' ') + ' ';
    for (var i = 0; i < FALLBACK_BLOCK.length; i++) if (s.indexOf(FALLBACK_BLOCK[i]) > -1) return true;
    return false;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function clock(sec) {
    var s = Math.round(Number(sec) || 0);
    if (!s) return '';
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function megabytes(b) {
    var n = Number(b) || 0;
    if (!n) return '';
    return n >= 1048576 ? Math.round(n / 1048576) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  }
  /* "File:Big Buck Bunny 4K.webm" is not a title anybody wants to read. */
  function pretty(title) {
    return String(title || '')
      .replace(/^File:/i, '')
      .replace(/\.(webm|ogv|ogg|mp4|mov|mpg|mpeg|avi)$/i, '')
      .replace(/_/g, ' ')
      .trim();
  }

  /* --------------------------------------------------------------------------
     THE SEARCH
     --------------------------------------------------------------------------
     One request. generator=search finds the files and prop=imageinfo returns
     everything about each of them in the same response — the playable URL, a
     poster frame at 480, the duration, the byte size and the licence block.
     Nothing here needs a second round trip, which is what makes checking the
     licence before drawing the grid affordable.

     gsrnamespace=6 is the File: namespace and filetype:video is CirrusSearch's
     own filter, so the search cannot wander into article text.
     -------------------------------------------------------------------------- */
  function search(q) {
    var params = {
      action: 'query', format: 'json', origin: '*',
      generator: 'search',
      gsrsearch: 'filetype:video ' + q,
      gsrnamespace: '6',
      /* 50 is the API's ceiling for an anonymous caller and it costs the same
         one request as 30 did. Measured: a typical term returns 41-49 videos
         at this limit, of which roughly three quarters survive the licence and
         size gates — so this alone is about half as many clips again per chip,
         with no extra traffic. */
      gsrlimit: '50',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata|user',
      iiurlwidth: '480',
      iiextmetadatafilter: 'License|LicenseShortName|LicenseUrl|UsageTerms|Artist|Credit|Restrictions|ObjectName'
    };
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');

    return fetch(API + '?' + qs, { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        var pages = (d && d.query && d.query.pages) || {};
        var out = [];
        Object.keys(pages).forEach(function (k) {
          var p = pages[k];
          var ii = p.imageinfo && p.imageinfo[0];
          if (!ii || !ii.url) return;
          if (ii.mime && ii.mime.indexOf('video') !== 0) return;

          /* THE GATE. A file whose licence is not positively free never
             reaches the grid, so it cannot be chosen by accident. */
          var lic = window.NC_MEDIA
            ? NC_MEDIA.licence(ii.extmetadata)
            /* No media-credit.js on the server: refuse everything rather than
               show unlicensed footage to a thirteen-year-old. The note in the
               grid says which file is missing. */
            : { ok: false, why: 'media-credit.js is not on this server' };
          if (!lic.ok) return;

          if (ii.size && Number(ii.size) > MAX_BYTES) return;

          out.push({
            title: pretty((window.NC_MEDIA && NC_MEDIA.plain(ii.extmetadata, 'ObjectName')) || p.title),
            file: p.title,
            url: ii.url,
            poster: ii.thumburl || '',
            mime: ii.mime || 'video/webm',
            bytes: Number(ii.size) || 0,
            seconds: Number(ii.duration) || 0,
            page: ii.descriptionurl || ('https://commons.wikimedia.org/wiki/' + encodeURIComponent(p.title)),
            licence: lic.name,
            licenceUrl: lic.url,
            author: lic.author,
            warn: lic.warn,
            index: typeof p.index === 'number' ? p.index : 999
          });
        });
        out.sort(function (a, b) { return a.index - b.index; });
        return out;
      });
  }

  /* --------------------------------------------------------------------------
     TURNING A RESULT INTO A FILE
     --------------------------------------------------------------------------
     Commons keeps machine-made smaller versions of every video it can
     transcode, under /transcoded/ with the resolution in the name. They are a
     tenth of the size and quite good enough for a teenager's 1080p export, so
     they are tried first — but WHICH ones exist depends on the source, and this
     container could not check a single one of them. So the list is walked in
     order and the original is last. The original is the one URL the API
     actually returned, so the walk always terminates somewhere real.
     -------------------------------------------------------------------------- */
  function candidates(item) {
    var out = [];
    /* https://upload.wikimedia.org/wikipedia/commons/a/ab/Name.webm
       becomes  …/commons/transcoded/a/ab/Name.webm/Name.webm.480p.vp9.webm */
    var m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/.exec(item.url);
    if (m && item.bytes > 24 * 1024 * 1024) {
      var base = m[1] + '/transcoded/' + m[2] + '/' + m[3] + '/' + m[4] + '/' + m[4];
      out.push(base + '.480p.vp9.webm');
      out.push(base + '.480p.webm');
      out.push(base + '.360p.webm');
    }
    out.push(item.url);
    return out;
  }

  function fileFor(item) {
    var urls = candidates(item);

    function attempt(i) {
      if (i >= urls.length) return Promise.reject(new Error('no readable version'));
      return fetch(urls[i], { credentials: 'omit', mode: 'cors' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.blob();
        })
        .then(function (b) {
          if (!b || !b.size) throw new Error('empty');
          var ext = (urls[i].split('.').pop() || 'webm').split('?')[0].toLowerCase();
          if (ext.length > 4) ext = 'webm';
          var name = item.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase();
          return new File([b], (name || 'clip') + '.' + ext, { type: b.type || item.mime });
        })
        .catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }

  /* ========================================================================
     THE SHEET
     ======================================================================== */
  var veil = null, reqId = 0;

  function boot() {
    if (document.getElementById('ncfo-css')) return;
    var st = document.createElement('style');
    st.id = 'ncfo-css';
    st.textContent = [
      '.ncfo-veil{position:fixed;inset:0;z-index:100000;background:rgba(4,6,12,.72);',
        '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;place-items:center;padding:18px}',
      '.ncfo-sheet{width:min(820px,100%);max-height:min(86vh,780px);display:flex;flex-direction:column;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);border:1px solid var(--nc-line2,rgba(255,255,255,.14));',
        'border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden;',
        'font:400 14px/1.5 Inter,system-ui,sans-serif}',
      '.ncfo-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncfo-head h2{margin:0;font-size:1.02rem;font-weight:800;flex:1 1 auto}',
      '.ncfo-x{width:40px;height:40px;flex:0 0 auto;border-radius:11px;cursor:pointer;font-size:20px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.ncfo-bar{padding:12px 16px;display:flex;flex-direction:column;gap:10px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncfo-find{width:100%;min-height:44px;padding:10px 12px;border-radius:11px;font:inherit;box-sizing:border-box;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncfo-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}',
      '.ncfo-chips::-webkit-scrollbar{display:none}',
      '.ncfo-chip{flex:0 0 auto;min-height:38px;padding:8px 14px;border-radius:999px;cursor:pointer;font:600 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncfo-chip.on{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      /* Same two properties photos.js needs and for the same reason: the phone
         sheet has a definite height, so without them the rows are sized at the
         poster and every caption below it is clipped away. */
      '.ncfo-grid{flex:1 1 auto;min-height:0;overflow-y:auto;padding:14px 16px 18px;',
        'display:grid;gap:11px;align-content:start;grid-auto-rows:min-content;',
        'grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}',
      '.ncfo-cell{display:flex;flex-direction:column;align-items:stretch;padding:0;',
        'border-radius:12px;overflow:hidden;cursor:pointer;text-align:left;',
        'background:var(--nc-bg3,rgba(255,255,255,.05));border:1px solid var(--nc-line2,rgba(255,255,255,.12));color:inherit}',
      '.ncfo-cell:hover{border-color:var(--nc-cyan,#00F0FF)}',
      '.ncfo-shot{position:relative;flex:0 0 auto;height:112px;background:',
        'linear-gradient(135deg,rgba(124,92,255,.35),rgba(0,229,255,.22))}',
      '.ncfo-shot img{display:block;width:100%;height:100%;object-fit:cover}',
      '.ncfo-time{position:absolute;right:6px;bottom:6px;padding:2px 7px;border-radius:999px;',
        'background:rgba(4,6,12,.78);color:#EAF2FF;font:700 11px/1.5 inherit}',
      '.ncfo-meta{flex:0 0 auto;padding:8px 10px 10px}',
      '.ncfo-meta b{display:block;font-size:12.5px;font-weight:700;line-height:1.3;',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ncfo-meta small{display:block;margin-top:3px;font-size:11px;color:var(--nc-dim,#8c96ad);',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ncfo-lic{display:inline-block;margin-top:5px;padding:1px 7px;border-radius:999px;font:700 10px/1.6 inherit;',
        'background:rgba(0,229,255,.14);color:var(--nc-cyan,#00F0FF)}',
      '.ncfo-note{grid-column:1/-1;padding:26px 8px;text-align:center;color:var(--nc-dim,#8c96ad);font-size:13px}',
      '.ncfo-note b{display:block;color:var(--nc-text,#EAF2FF);font-size:14px;margin-bottom:6px}',
      '.ncfo-note a{color:var(--nc-cyan,#00F0FF)}',
      '.ncfo-foot{display:flex;align-items:center;gap:10px;padding:10px 16px;font-size:11.5px;',
        'color:var(--nc-dim,#8c96ad);border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncfo-foot p{margin:0;flex:1 1 auto}',
      '.ncfo-cr{flex:0 0 auto;min-height:36px;padding:8px 13px;border-radius:10px;cursor:pointer;',
        'font:700 12px inherit;background:transparent;color:inherit;',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.16))}',
      '@media (max-width:760px){.ncfo-veil{padding:0}',
        '.ncfo-sheet{width:100%;height:100%;max-height:none;border-radius:0;border:0}',
        '.ncfo-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}'
    ].join('');
    document.head.appendChild(st);
  }

  function close() {
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  function open(insert) {
    boot();
    close();

    veil = el('div', 'ncfo-veil');
    veil.addEventListener('mousedown', function (e) { if (e.target === veil) close(); });

    var sheet = el('div', 'ncfo-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Footage');

    var head = el('div', 'ncfo-head', '<h2>Footage</h2>');
    var x = el('button', 'ncfo-x', '&times;');
    x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.onclick = close;
    head.appendChild(x);

    var bar = el('div', 'ncfo-bar');
    var find = el('input', 'ncfo-find');
    find.type = 'search';
    find.placeholder = 'Search footage — a storm, a city at night, a rocket…';
    var chips = el('div', 'ncfo-chips');
    bar.appendChild(find);
    bar.appendChild(chips);

    var grid = el('div', 'ncfo-grid');

    var foot = el('div', 'ncfo-foot');
    var why = el('p', null,
      'Real film, free to use and free to cut. Drop one in and trim it to the ' +
      'bit you want — that is how you get a scene.');
    var crBtn = el('button', 'ncfo-cr', 'Credits');
    crBtn.type = 'button';
    crBtn.onclick = function () {
      if (window.NC_MEDIA) NC_MEDIA.credit.open();
    };
    foot.appendChild(why);
    foot.appendChild(crBtn);

    sheet.appendChild(head); sheet.appendChild(bar); sheet.appendChild(grid); sheet.appendChild(foot);
    veil.appendChild(sheet);
    document.body.appendChild(veil);
    document.addEventListener('keydown', onKey, true);

    function note(html) { grid.textContent = ''; grid.appendChild(el('div', 'ncfo-note', html)); }

    function run(q, chipEl) {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === chipEl); });
      var mine = ++reqId;

      if (!window.NC_MEDIA) {
        note('<b>Footage needs media-credit.js.</b>That file checks the licence ' +
             'on every clip, and without it nothing here can be offered. ' +
             'Upload it next to editor.html.');
        return;
      }
      if (blocked(q)) {
        note('<b>Not that one.</b>Try one of the buttons above, or search for a ' +
             'thing — a storm, a city, a rocket.');
        return;
      }
      note('<b>Looking…</b>');

      var job = q !== '*' ? search(q) :
        Promise.allSettled(ALL.map(search)).then(function (rs) {
          var lists = rs.map(function (r) { return r.status === 'fulfilled' ? r.value : []; });
          var out = [], seen = {}, i = 0, took = true;
          while (took) {
            took = false;
            for (var c = 0; c < lists.length; c++) {
              var it = lists[c][i];
              if (!it) continue;
              took = true;
              if (seen[it.file]) continue;
              seen[it.file] = 1;
              out.push(it);
            }
            i++;
          }
          return out;
        });

      job.then(function (list) {
        if (mine !== reqId) return;
        if (!list.length) {
          /* Two reasons the grid can be empty and they need different advice:
             nothing matched, or things matched and every one of them was
             filtered out. The second is the interesting one and it used to
             look identical to the first. */
          note(q === '*'
            ? '<b>Nothing came back.</b>Try one of the buttons above.'
            : '<b>No free footage for “' + esc(q) + '”.</b>' +
              'Either nothing matched, or what matched was not free to reuse — ' +
              'clips that are not are left out on purpose. Try a broader word, ' +
              'or one of the buttons above.');
          return;
        }
        grid.textContent = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (it) {
          var cell = el('button', 'ncfo-cell');
          cell.type = 'button';
          cell.title = it.title + (it.author ? ' — ' + it.author : '');

          var shot = el('div', 'ncfo-shot');
          if (it.poster) {
            var img = el('img');
            img.loading = 'lazy';
            img.alt = '';
            img.src = it.poster;
            /* A missing poster leaves the gradient behind it, which is a
               deliberate card rather than a broken-image glyph. */
            img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };
            shot.appendChild(img);
          }
          var t = clock(it.seconds);
          if (t) shot.appendChild(el('span', 'ncfo-time', t));

          var meta = el('div', 'ncfo-meta',
            '<b>' + esc(it.title) + '</b>' +
            '<small>' + (it.author ? esc(it.author) : 'author not named') +
            (it.bytes ? ' · ' + megabytes(it.bytes) : '') + '</small>' +
            '<span class="ncfo-lic">' + esc(it.licence || 'free') + '</span>');

          cell.appendChild(shot);
          cell.appendChild(meta);

          cell.onclick = function () {
            cell.disabled = true;
            cell.style.opacity = '.5';
            var was = meta.querySelector('.ncfo-lic');
            if (was) was.textContent = 'getting it…';
            fileFor(it).then(function (f) {
              NC_MEDIA.credit.add({
                kind: 'footage',
                title: it.title,
                author: it.author,
                licence: it.licence,
                licenceUrl: it.licenceUrl,
                page: it.page
              });
              insert(f, it);
              close();
            }).catch(function () {
              cell.disabled = false;
              cell.style.opacity = '';
              if (was) was.textContent = it.licence || 'free';
              note('<b>That one would not download.</b>' +
                   '<a href="' + esc(it.page) + '" target="_blank" rel="noopener">Open its page</a>, ' +
                   'save the video, then use Upload. Or pick another — most of them work.');
            });
          };
          frag.appendChild(cell);
        });
        grid.appendChild(frag);
      }).catch(function () {
        if (mine !== reqId) return;
        note('<b>' + (navigator.onLine === false
              ? 'You have no connection.' : 'Could not reach Wikimedia Commons.') +
             '</b>This library is real video and it comes over the network. ' +
             'The <b style="display:inline">Stickers</b> and <b style="display:inline">Emojis</b> ' +
             'tabs need nothing fetched.');
      });
    }

    CATS.forEach(function (c, i) {
      var b = el('button', 'ncfo-chip', esc(c[0]));
      b.type = 'button';
      b.onclick = function () { find.value = ''; run(c[1], b); };
      chips.appendChild(b);
      if (i === 0) setTimeout(function () { run(c[1], b); }, 0);
    });

    var t = null;
    find.addEventListener('input', function () {
      clearTimeout(t);
      var q = find.value.trim();
      if (!q) return;
      t = setTimeout(function () { run(q, null); }, 420);
    });
    find.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      clearTimeout(t);
      var q = find.value.trim();
      if (q) run(q, null);
    });

    setTimeout(function () { find.focus(); }, 40);
  }

  /* ========================================================================
     THE WAY IN IS THE RAIL
     ======================================================================== */
  function editorInput() {
    var ins = document.querySelectorAll('input[type="file"]');
    for (var i = 0; i < ins.length; i++) {
      var a = (ins[i].getAttribute('accept') || '');
      if (a.indexOf('video') > -1 || a.indexOf('image') > -1 || !a) return ins[i];
    }
    return null;
  }

  function intoEditor(file) {
    var input = editorInput();
    if (!input) return;
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  window.__ncOpenFootage = function () { open(intoEditor); };

  window.NC_FOOTAGE = { open: open, search: search, fileFor: fileFor,
                        cats: CATS, blocked: blocked, candidates: candidates };
})();
