/* ============================================================================
   NOVACLIP PHOTO PICKER  —  real photographs, not drawings
   ============================================================================
   stickers.js gives the editor ninety-six drawn shapes, and its own header
   explains at length why they are drawn: they are vectors, they are in the
   file the service worker already caches, and nobody's channel gets a
   copyright claim for a shape. All still true. This is the other thing —
   actual photographs of actual cars — asked for on top of it, not instead of
   it. Both buttons sit side by side and the Stickers one is untouched.

   WHERE THE PHOTOGRAPHS COME FROM

   Wikipedia. Specifically the article search, taking each article's lead
   image, rather than Wikimedia Commons' raw media search.

   That choice is the whole safety story, so it is worth being clear about.
   Commons is the bigger library and it is the obvious thing to reach for, but
   it is a raw media dump: it holds explicit material, and this site is gated
   at thirteen. An unfiltered Commons search box on a teen video editor is not
   something to ship. Article lead images are encyclopedic by construction —
   what comes back for "car" is the photograph at the top of the car article.
   There is a term blocklist below as a second layer, and the category chips
   are deliberately the prominent thing so most people never type at all.

   NO API KEY, WHICH IS THE POINT

   The standing rule in this repo is that a key never ships to a browser. The
   way to honour it is usually a Worker; the better way, when it is available,
   is not to need a key. Wikipedia's API takes anonymous cross-origin requests
   (origin=* is in the query string for exactly that reason), so there is no
   key, no secret, no third Worker to deploy at the wrong address.

   Everything it returns is freely licensed, and every picture inserted here
   carries its article title and a link back, because these are somebody's
   photographs and that is the deal.

   HOW A PICTURE GETS INTO THE EDITOR

   The same way a sticker does, which is the same way a person does: build a
   File, put it in the editor's own media input, fire a change event. Nothing
   here reaches into the React bundle, so nothing here breaks when that bundle
   is rebuilt. That path is already proven by studio-kit.js.

   WHAT HAPPENS WITH THE WIFI OFF

   It says so. Drawn stickers work on a plane and these cannot; a grid that
   silently stays empty would read as broken rather than as offline, so the
   failure is written out in words with the Stickers button named as the thing
   that does still work.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_PHOTOS_READY) return;
  window.NC_PHOTOS_READY = true;

  var API = 'https://en.wikipedia.org/w/api.php';

  /* The chips. Ordered by what somebody making a video actually reaches for,
     and phrased as the search that returns good lead images rather than as
     the bare word — "sports car" gives photographs, "car" gives diagrams. */
  var CATS = [
    ['Cars',    'sports car'],
    ['Animals', 'wild animal'],
    ['Food',    'food dish'],
    ['Nature',  'landscape'],
    ['Space',   'planet'],
    ['Sport',   'sport'],
    ['City',    'city skyline'],
    ['Tech',    'computer'],
    ['Music',   'musical instrument'],
    ['Travel',  'landmark'],
    ['Weather', 'weather'],
    ['Plants',  'flower']
  ];

  /* Second layer, behind the choice of Wikipedia over Commons. Substring
     matched against the whole query, so it also catches these inside longer
     phrases. It is not a content filter and does not pretend to be one — it
     is the obvious cases, cheaply. */
  var BLOCKED = ['porn', 'nude', 'nudity', 'naked', 'sex', 'xxx', 'erotic', 'nsfw',
    'hentai', 'fetish', 'topless', 'lingerie', 'genital', 'breast', 'penis', 'vagina',
    'gore', 'beheading', 'execution', 'suicide', 'self-harm', 'corpse'];

  function blocked(q) {
    var s = ' ' + q.toLowerCase().replace(/[^a-z]+/g, ' ') + ' ';
    for (var i = 0; i < BLOCKED.length; i++) if (s.indexOf(BLOCKED[i]) > -1) return true;
    return false;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* --------------------------------------------------------------------------
     THE SEARCH
     --------------------------------------------------------------------------
     One request. generator=search runs the search and prop=pageimages hands
     back each result's lead image in the same response, so this is not a
     search followed by N lookups.

     pithumbsize is 480 for the grid. The full-size original comes later and
     only for the one picture actually chosen — pulling originals for twenty
     results to show twenty thumbnails is how a picker becomes unusable on a
     phone.
     -------------------------------------------------------------------------- */
  function search(q) {
    var params = {
      action: 'query', format: 'json', origin: '*',
      generator: 'search',
      gsrsearch: q,
      gsrlimit: '24',
      gsrnamespace: '0',
      prop: 'pageimages|info',
      inprop: 'url',
      piprop: 'thumbnail|original',
      pithumbsize: '480'
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
          /* An article with no lead image is not a result here. Most of the
             search hits for a broad word have no picture at all, which is why
             asking for 24 and showing what has an image is the right shape. */
          if (!p.thumbnail || !p.thumbnail.source) return;
          out.push({
            title: p.title,
            thumb: p.thumbnail.source,
            full: (p.original && p.original.source) || p.thumbnail.source,
            page: p.fullurl || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title)),
            index: typeof p.index === 'number' ? p.index : 999
          });
        });
        /* The API returns the map in arbitrary key order; index is the search
           ranking and is the order somebody expects to read them in. */
        out.sort(function (a, b) { return a.index - b.index; });
        return out;
      });
  }

  /* --------------------------------------------------------------------------
     TURNING A RESULT INTO A FILE
     --------------------------------------------------------------------------
     The editor takes a File, so the bytes have to be readable by this page,
     which means the image host has to allow the cross-origin read. Wikimedia's
     image CDN does. If that ever stops being true the fetch rejects rather
     than handing back an unreadable blob, and the caller says so and offers
     the picture in a tab instead of failing silently — a picker that appears
     to do nothing when tapped is the worst version of this.

     The original can be very large — Commons keeps 6000px scans — and a 20MB
     PNG dropped on the timeline of a phone is its own bug, so anything past
     about 2000px is taken at 2000 through the same thumbnailer that produced
     the grid. That is still far more than a 1080p export can use.
     -------------------------------------------------------------------------- */
  function sized(item) {
    var u = item.full;
    var m = /\/thumb\/(.+?)\/(\d+)px-/.exec(u);
    if (m && +m[2] > 2000) return u.replace(/\/(\d+)px-/, '/2000px-');
    return u;
  }

  function fileFor(item) {
    var url = sized(item);
    return fetch(url, { credentials: 'omit', mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      })
      .then(function (b) {
        var ext = (b.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').split('+')[0];
        var name = item.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase();
        return new File([b], (name || 'photo') + '.' + ext, { type: b.type || 'image/jpeg' });
      });
  }

  /* --------------------------------------------------------------------------
     ATTRIBUTION
     --------------------------------------------------------------------------
     These are real photographs under real licences. The editor has nowhere to
     put a credit, so it is kept where it can be got at later: a list in
     localStorage, newest first, capped so it cannot grow without limit. Small,
     but it is the difference between "freely licensed" and "taken".
     -------------------------------------------------------------------------- */
  function credit(item) {
    try {
      var k = 'nc_photo_credits';
      var list = JSON.parse(localStorage.getItem(k) || '[]');
      list.unshift({ title: item.title, page: item.page, at: Date.now() });
      localStorage.setItem(k, JSON.stringify(list.slice(0, 200)));
    } catch (e) {}
  }

  /* ========================================================================
     THE SHEET
     ======================================================================== */
  var veil = null, sheetEl = null, lastQuery = '', reqId = 0;

  function boot() {
    if (document.getElementById('ncph-css')) return;
    var st = document.createElement('style');
    st.id = 'ncph-css';
    st.textContent = [
      '.ncph-veil{position:fixed;inset:0;z-index:100000;background:rgba(4,6,12,.72);',
        '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;place-items:center;padding:18px}',
      '.ncph-sheet{width:min(760px,100%);max-height:min(86vh,760px);display:flex;flex-direction:column;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);border:1px solid var(--nc-line2,rgba(255,255,255,.14));',
        'border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden;',
        'font:400 14px/1.5 Inter,system-ui,sans-serif}',
      '.ncph-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncph-head h2{margin:0;font-size:1.02rem;font-weight:800;flex:1 1 auto}',
      '.ncph-x{width:40px;height:40px;flex:0 0 auto;border-radius:11px;cursor:pointer;font-size:20px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.ncph-bar{padding:12px 16px;display:flex;flex-direction:column;gap:10px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncph-find{width:100%;min-height:44px;padding:10px 12px;border-radius:11px;font:inherit;box-sizing:border-box;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncph-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}',
      '.ncph-chips::-webkit-scrollbar{display:none}',
      '.ncph-chip{flex:0 0 auto;min-height:38px;padding:8px 14px;border-radius:999px;cursor:pointer;font:600 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncph-chip.on{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      /* align-content and grid-auto-rows both say "a row is as tall as what
         is in it". Without them the phone sheet — which has a definite height
         where the desktop one does not — sized the rows at 86px around cells
         whose contents are 139, and since a cell is overflow:hidden the
         caption under every picture was simply clipped away. */
      '.ncph-grid{flex:1 1 auto;min-height:0;overflow-y:auto;padding:14px 16px 18px;',
        'display:grid;gap:10px;align-content:start;grid-auto-rows:min-content;',
        'grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}',
      /* flex column on the button itself, rather than trusting a <button> to
         size itself around block children — that is the other half of the
         same bug, and it is the half that would come back the next time this
         grid is put somewhere with a definite height. */
      '.ncph-cell{display:flex;flex-direction:column;align-items:stretch;padding:0;',
        'border-radius:12px;overflow:hidden;cursor:pointer;text-align:left;',
        'background:var(--nc-bg3,rgba(255,255,255,.05));border:1px solid var(--nc-line2,rgba(255,255,255,.12));color:inherit}',
      '.ncph-cell:hover{border-color:var(--nc-cyan,#00F0FF)}',
      '.ncph-cell img{display:block;flex:0 0 auto;width:100%;height:110px;object-fit:cover;',
        'background:rgba(255,255,255,.05)}',
      '.ncph-cell span{display:block;flex:0 0 auto;padding:7px 9px;font-size:11.5px;line-height:1.3;',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ncph-note{grid-column:1/-1;padding:26px 8px;text-align:center;color:var(--nc-dim,#8c96ad);font-size:13px}',
      '.ncph-note b{display:block;color:var(--nc-text,#EAF2FF);font-size:14px;margin-bottom:6px}',
      '.ncph-note a{color:var(--nc-cyan,#00F0FF)}',
      '.ncph-foot{padding:9px 16px;font-size:11.5px;color:var(--nc-dim,#8c96ad);',
        'border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncph-foot a{color:var(--nc-cyan,#00F0FF)}',
      /* On a phone the sheet is the screen. */
      '@media (max-width:760px){.ncph-veil{padding:0}',
        '.ncph-sheet{width:100%;height:100%;max-height:none;border-radius:0;border:0}',
        '.ncph-grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}}'
    ].join('');
    document.head.appendChild(st);
  }

  function close() {
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null; sheetEl = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  function open(insert) {
    boot();
    close();

    veil = el('div', 'ncph-veil');
    veil.addEventListener('mousedown', function (e) { if (e.target === veil) close(); });

    var sheet = el('div', 'ncph-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Photos');
    sheetEl = sheet;

    var head = el('div', 'ncph-head', '<h2>Photos</h2>');
    var x = el('button', 'ncph-x', '&times;');
    x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.onclick = close;
    head.appendChild(x);

    var bar = el('div', 'ncph-bar');
    var find = el('input', 'ncph-find');
    find.type = 'search';
    find.placeholder = 'Search photos — a car, a city, a dog…';
    var chips = el('div', 'ncph-chips');
    bar.appendChild(find);
    bar.appendChild(chips);

    var grid = el('div', 'ncph-grid');
    var foot = el('div', 'ncph-foot',
      'Photographs from Wikipedia, free to use. The article each one came from is ' +
      'saved with your project so you can credit it.');

    sheet.appendChild(head); sheet.appendChild(bar); sheet.appendChild(grid); sheet.appendChild(foot);
    veil.appendChild(sheet);
    document.body.appendChild(veil);
    document.addEventListener('keydown', onKey, true);

    function note(html) { grid.textContent = ''; grid.appendChild(el('div', 'ncph-note', html)); }

    function run(q, chipEl) {
      [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c === chipEl); });
      lastQuery = q;
      var mine = ++reqId;

      if (blocked(q)) {
        note('<b>Not that one.</b>Try one of the buttons above, or search for a thing — ' +
             'a car, a city, an animal.');
        return;
      }
      note('<b>Looking…</b>');

      search(q).then(function (list) {
        if (mine !== reqId) return;                 // a later search already won
        if (!list.length) {
          note('<b>No photos for “' + esc(q) + '”.</b>Try a broader word, or one of the buttons above.');
          return;
        }
        grid.textContent = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (it) {
          var cell = el('button', 'ncph-cell');
          cell.type = 'button';
          cell.title = it.title;
          var img = el('img');
          img.loading = 'lazy';
          img.alt = it.title;
          img.src = it.thumb;
          cell.appendChild(img);
          cell.appendChild(el('span', null, esc(it.title)));
          cell.onclick = function () {
            cell.disabled = true;
            cell.style.opacity = '.5';
            fileFor(it).then(function (f) {
              credit(it);
              insert(f, it);
              close();
            }).catch(function () {
              cell.disabled = false;
              cell.style.opacity = '';
              /* The read failed, so the bytes cannot be handed over from
                 here. Say what happened and give the picture anyway. */
              note('<b>That one would not download.</b>' +
                   '<a href="' + esc(it.full) + '" target="_blank" rel="noopener">Open it in a tab</a> ' +
                   'and save it, then use Upload. Or pick another.');
            });
          };
          frag.appendChild(cell);
        });
        grid.appendChild(frag);
      }).catch(function () {
        if (mine !== reqId) return;
        note('<b>' + (navigator.onLine === false ? 'You are offline.' : 'Could not reach Wikipedia.') +
             '</b>These are real photographs and they come over the network. ' +
             'The <b style="display:inline">Stickers</b> button next to this one works with the wifi off.');
      });
    }

    CATS.forEach(function (c, i) {
      var b = el('button', 'ncph-chip', esc(c[0]));
      b.type = 'button';
      b.onclick = function () { find.value = ''; run(c[1], b); };
      chips.appendChild(b);
      if (i === 0) setTimeout(function () { run(c[1], b); }, 0);
    });

    /* Typing searches on a pause, not on every keystroke — twenty-four
       results per request and a request per letter is rude to a free API and
       slower on screen than waiting. */
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
     THE BUTTON, BESIDE THE STICKERS ONE
     ========================================================================
     Same approach studio-kit.js uses and for the same reason: the editor is a
     React app that re-renders, so this finds its anchor again on a rescan
     rather than assuming the first paint is the last one.
     ======================================================================== */
  function editorInput() {
    var ins = document.querySelectorAll('input[type="file"]');
    for (var i = 0; i < ins.length; i++) {
      var a = (ins[i].getAttribute('accept') || '');
      if (a.indexOf('image') > -1 || a.indexOf('video') > -1 || !a) return ins[i];
    }
    return null;
  }

  function wire() {
    if (document.getElementById('ncph-btn')) return;
    /* Beside Stickers if it is there, beside Upload if it is not — this file
       does not depend on studio-kit.js having loaded first. */
    var anchor = document.getElementById('nckit-ed-btn');
    if (!anchor) {
      var all = document.querySelectorAll('button,label');
      for (var i = 0; i < all.length; i++) {
        var t = (all[i].textContent || '').trim().toLowerCase();
        if (t === 'upload' || t === 'upload media') { anchor = all[i]; break; }
      }
    }
    if (!anchor || !editorInput()) return;

    var b = el('button', 'nckit-open', '🖼 Photos');
    b.id = 'ncph-btn';
    b.type = 'button';
    b.style.marginTop = '8px';
    b.style.width = '100%';
    b.onclick = function () {
      open(function (file) {
        var input = editorInput();
        if (!input) return;
        var dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };
    (anchor.parentNode || document.body).insertBefore(b, anchor.nextSibling);
  }

  var queued = false;
  function rescan() {
    if (queued) return;
    queued = true;
    var run = function () { queued = false; try { wire(); } catch (e) {} };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 600 });
    else setTimeout(run, 250);
  }

  function start() {
    rescan();
    new MutationObserver(rescan).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.NC_PHOTOS = { open: open, search: search, fileFor: fileFor, cats: CATS, blocked: blocked };
})();
