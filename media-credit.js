/* ============================================================================
   NOVACLIP MEDIA RULES  —  what may come in, and what has to be said about it
   ============================================================================
   Two pickers pull real media off the internet: photos.js (photographs from
   Wikipedia) and footage.js (video from Wikimedia Commons). Both ask the same
   two questions, and both used to answer them badly or not at all, so the
   answers live here once.

   QUESTION ONE: MAY THIS BE USED?

   photos.js said, in its own header, "Everything it returns is freely
   licensed". That was not true and nothing in the file checked it. Wikipedia
   articles routinely use NON-FREE images under a fair-use rationale — film
   posters, album covers, company logos, book jackets. Those are exactly the
   lead images of exactly the articles a teenager searches for. So the picker
   could hand somebody a copyrighted film poster, they could cut it into a
   video, post it, and find out what a copyright claim is.

   Now the licence is read from the API and checked, and the check FAILS CLOSED:
   a file whose licence cannot be positively identified as free does not appear
   in the grid. That loses some results. Losing results is the correct trade
   against handing a thirteen-year-old someone else's poster.

   Two denials are worth naming because they surprise people:

     NO DERIVATIVES (cc-by-nd) is refused. Editing IS making a derivative.
       An ND licence is the one licence that specifically forbids what this
       whole site does.

     NON-COMMERCIAL (cc-by-nc) is refused. A teenager whose channel gets
       monetised — which is the entire stated ambition of this site — breaks an
       NC licence retroactively, on a video already posted. Refusing it now is
       kinder than explaining it later.

   QUESTION TWO: WHO HAS TO BE CREDITED?

   Almost every free licence except CC0 and public domain requires attribution,
   and it has to travel WITH the work. photos.js did collect credits — into
   localStorage under 'nc_photo_credits', where nothing ever read them, nothing
   displayed them, and no export carried them. A credit nobody can see is not
   attribution; it is a note to self.

   So there is a ledger here that both pickers write to, it can be opened and
   read, and it produces the block of text that goes in a video description —
   title, author, source, licence, which is the form the licences ask for. The
   old 'nc_photo_credits' entries are migrated in rather than abandoned.

   QUESTION THREE, WHICH IS NOT ABOUT LICENCES AT ALL

   The search-term blocklist also lives here, because both pickers need the
   same one and a blocklist that exists in two files is a blocklist that drifts.
   Each picker keeps a small inline fallback for the case where this file is
   missing from the server: a picker that loses its filter must fail safe, not
   fail open.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_MEDIA) return;

  /* ==========================================================================
     THE LICENCE GATE
     ========================================================================== */

  /* Machine-readable licence codes Wikimedia puts in extmetadata.License.
     Anchored at the start so 'cc-by-sa-4.0' matches and 'cc-by-nc-sa-4.0'
     does not — the NC sits between 'cc-by' and the version, which is why the
     version is part of the pattern rather than a loose prefix match. */
  var FREE_CODE = /^(cc0(-1\.0)?|cc-pd|pd(-.*)?|public[\s-]*domain|cc-by-(sa-)?[1-4](\.\d)?(-.*)?|cc-by-(sa-)?\d\.\d|attribution|fal|gfdl(-.*)?|dl-de-by-2\.0|ogl-.*)$/i;

  /* Anything matching this is refused whatever else it says, and it is checked
     BEFORE the allow list. 'cc-by-nc-sa-4.0' would otherwise be a hair away
     from a pattern written for 'cc-by-sa-4.0'. */
  var NOT_FREE = /fair[\s-]*use|non[\s-]*free|unfree|no[\s-]*deriv|[\s-]nd[\s-]|[\s-]nd$|non[\s-]*commercial|[\s-]nc[\s-]|[\s-]nc$|cc-by-nc|cc-by-nd|all rights reserved|copyright(ed)?[\s-]*(only)?$|screenshot|logo|trademark(ed)? logo|with permission|используется/i;

  /* extmetadata values arrive as { value: '…', source: '…' } and the value is
     HTML — Artist in particular is usually a link. Everything here wants a
     plain string, and a display path that is handed HTML from an API is a
     cross-site-scripting bug waiting for one badly-written file page. */
  function raw(meta, key) {
    var f = meta && meta[key];
    var v = f && typeof f === 'object' ? f.value : f;
    return v == null ? '' : String(v);
  }
  function plain(meta, key) {
    return raw(meta, key)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Reads a Wikimedia extmetadata block and decides.

     Returns { ok, name, url, author, attribution, warn, why }:
       ok           may this be used here at all
       name         the licence to print, e.g. 'CC BY-SA 4.0'
       url          the licence deed, when the API gave one
       author       who to credit, '' for public domain with no named author
       attribution  true when the licence requires the credit to be shown
       warn         a non-copyright restriction worth repeating (a trademark,
                    somebody's personality rights) — does not block
       why          when ok is false, the sentence explaining it

     It is deliberately suspicious of missing data. No licence field at all is
     not "probably fine", it is "this file did not say", and this site is gated
     at thirteen. */
  function licence(meta) {
    var code  = plain(meta, 'License');
    var short = plain(meta, 'LicenseShortName');
    var terms = plain(meta, 'UsageTerms');
    var url   = plain(meta, 'LicenseUrl');
    var author = plain(meta, 'Artist') || plain(meta, 'Credit');
    var restrict = plain(meta, 'Restrictions');

    var all = [code, short, terms].join(' ');

    if (NOT_FREE.test(all)) {
      return { ok: false, name: short || terms || code, url: url, author: author,
               why: 'not free to reuse (' + (short || terms || code) + ')' };
    }
    /* The allow list runs against the machine code first and the human name
       second, because the code is the field Wikimedia actually normalises. */
    var free = FREE_CODE.test(code) ||
               /^(public domain|cc0|pd)/i.test(short) ||
               /^(public domain|cc0)/i.test(terms);
    if (!free) {
      return { ok: false, name: short || terms || code || 'unknown', url: url, author: author,
               why: code || short || terms
                 ? 'licence not recognised as free (' + (short || terms || code) + ')'
                 : 'the file page does not say what licence it is under' };
    }

    var pd = /^(cc0|pd|public)/i.test(code) || /^(public domain|cc0)/i.test(short);
    return {
      ok: true,
      name: short || terms || code,
      url: url,
      author: author,
      attribution: !pd,
      warn: restrict ? restrict.replace(/\|/g, ', ') : '',
      why: ''
    };
  }

  /* ==========================================================================
     THE CREDITS LEDGER
     ==========================================================================
     One list for both pickers, newest first, capped. An entry is
     { kind, title, author, licence, licenceUrl, page, at }. */
  var KEY = 'nc_media_credits';
  var OLD = 'nc_photo_credits';
  var CAP = 300;

  function load() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];

    /* The photos picker wrote to its own key for months. Those entries are
       somebody's actual attribution obligations for videos they have already
       made, so they are brought across rather than left behind — once, and the
       old key is then cleared so this does not run every call. */
    try {
      var old = JSON.parse(localStorage.getItem(OLD) || '[]');
      if (Array.isArray(old) && old.length) {
        old.forEach(function (o) {
          list.push({ kind: 'photo', title: o.title || '', author: '',
                      licence: '', licenceUrl: '', page: o.page || '', at: o.at || 0 });
        });
        localStorage.removeItem(OLD);
        list.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
        save(list);
      }
    } catch (e) {}
    return list;
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP))); } catch (e) {}
  }

  function add(entry) {
    var list = load();
    /* The same picture chosen twice is one obligation, not two. */
    var same = list.filter(function (e) { return e.page && e.page === entry.page; });
    if (same.length) return list.length;
    list.unshift({
      kind: entry.kind || 'media',
      title: entry.title || '',
      author: entry.author || '',
      licence: entry.licence || '',
      licenceUrl: entry.licenceUrl || '',
      page: entry.page || '',
      at: Date.now()
    });
    save(list);
    return Math.min(list.length, CAP);
  }

  /* Title, author, source, licence — the order the Creative Commons wiki asks
     for, in a shape somebody can paste straight under a video. */
  function line(e) {
    var bits = [e.title || 'Untitled'];
    if (e.author) bits.push('by ' + e.author);
    if (e.licence) bits.push('(' + e.licence + (e.licenceUrl ? ', ' + e.licenceUrl : '') + ')');
    if (e.page) bits.push('— ' + e.page);
    return bits.join(' ');
  }

  function text() {
    var list = load();
    if (!list.length) return '';
    return 'Credits\n' + list.map(function (e) { return '· ' + line(e); }).join('\n');
  }

  function count() { return load().length; }
  function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem(OLD); } catch (e) {} }

  /* ==========================================================================
     THE CREDITS SHEET
     ==========================================================================
     Deliberately plain, and deliberately has a Copy button as the primary
     action: the point of this screen is not to be read here, it is to get the
     text into a video description. */
  var veil = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function styles() {
    if (document.getElementById('nccr-css')) return;
    var st = document.createElement('style');
    st.id = 'nccr-css';
    st.textContent = [
      '.nccr-veil{position:fixed;inset:0;z-index:100001;background:rgba(4,6,12,.74);',
        '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;place-items:center;padding:18px}',
      '.nccr-sheet{width:min(620px,100%);max-height:min(84vh,700px);display:flex;flex-direction:column;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14));border-radius:18px;',
        'box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden;font:400 14px/1.55 Inter,system-ui,sans-serif}',
      '.nccr-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.nccr-head h2{margin:0;font-size:1.02rem;font-weight:800;flex:1 1 auto}',
      '.nccr-x{width:40px;height:40px;flex:0 0 auto;border-radius:11px;cursor:pointer;font-size:20px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.nccr-why{padding:12px 16px;color:var(--nc-dim,#8c96ad);font-size:12.5px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.nccr-list{flex:1 1 auto;min-height:0;overflow-y:auto;padding:8px 16px 14px;margin:0;list-style:none}',
      '.nccr-list li{padding:11px 0;border-bottom:1px solid var(--nc-line,rgba(255,255,255,.08))}',
      '.nccr-list b{display:block;font-weight:700;font-size:13.5px}',
      '.nccr-list small{display:block;color:var(--nc-dim,#8c96ad);font-size:12px;margin-top:3px;word-break:break-word}',
      '.nccr-list a{color:var(--nc-cyan,#00F0FF)}',
      '.nccr-empty{padding:26px 8px;text-align:center;color:var(--nc-dim,#8c96ad)}',
      '.nccr-foot{display:flex;gap:9px;padding:12px 16px;border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.nccr-foot button{flex:1 1 auto;min-height:44px;padding:11px 14px;border-radius:12px;cursor:pointer;',
        'font:700 14px inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.16));background:transparent;color:inherit}',
      '.nccr-foot .go{flex:2 1 auto;background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      '@media (max-width:620px){.nccr-veil{padding:0}',
        '.nccr-sheet{width:100%;height:100%;max-height:none;border-radius:0;border:0}}'
    ].join('');
    document.head.appendChild(st);
  }

  function close() {
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  function open() {
    styles();
    close();
    var list = load();

    veil = document.createElement('div');
    veil.className = 'nccr-veil';
    veil.addEventListener('mousedown', function (e) { if (e.target === veil) close(); });

    var rows = list.length
      ? '<ul class="nccr-list">' + list.map(function (e) {
          var src = e.page
            ? '<a href="' + esc(e.page) + '" target="_blank" rel="noopener">' + esc(e.page) + '</a>'
            : '';
          return '<li><b>' + esc(e.title || 'Untitled') + '</b><small>' +
                 (e.author ? 'by ' + esc(e.author) + ' · ' : '') +
                 (e.licence ? esc(e.licence) : 'licence not recorded') +
                 (src ? '<br>' + src : '') + '</small></li>';
        }).join('') + '</ul>'
      : '<div class="nccr-empty">Nothing to credit yet. Pictures and footage you ' +
        'bring in from the Photos and Footage libraries are listed here.</div>';

    var sheet = document.createElement('div');
    sheet.className = 'nccr-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Credits');
    sheet.innerHTML =
      '<div class="nccr-head"><h2>Credits</h2>' +
        '<button type="button" class="nccr-x" aria-label="Close">&times;</button></div>' +
      '<div class="nccr-why">Most free pictures and clips are free <i>on condition</i> that ' +
        'the person who made them is named. Paste this under your video and you have done it. ' +
        'It takes one line and it is the whole deal.</div>' +
      rows +
      '<div class="nccr-foot">' +
        '<button type="button" class="go" id="nccr-copy">Copy for my description</button>' +
        '<button type="button" id="nccr-clear">Clear</button>' +
      '</div>';

    veil.appendChild(sheet);
    document.body.appendChild(veil);
    document.addEventListener('keydown', onKey, true);

    sheet.querySelector('.nccr-x').onclick = close;

    var copy = sheet.querySelector('#nccr-copy');
    copy.onclick = function () {
      var t = text();
      if (!t) { copy.textContent = 'Nothing to copy'; return; }
      /* execCommand is the fallback on purpose: the clipboard API needs a
         secure context and a permission that a framed editor does not always
         have, and a Copy button that silently does nothing is worse than an
         old API. */
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy for my description'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(done, function () { fallback(t, done); });
      } else fallback(t, done);
    };
    function fallback(t, done) {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { copy.textContent = 'Could not copy'; }
      document.body.removeChild(ta);
    }

    sheet.querySelector('#nccr-clear').onclick = function () {
      clear();
      close();
    };
  }

  /* ==========================================================================
     THE SEARCH-TERM BLOCKLIST
     ==========================================================================
     Shared by both pickers. It is not a content filter and does not pretend to
     be one — the real filter is the choice of source. This is the obvious
     cases, cheaply, in one place. */
  var BLOCKED = ['porn', 'nude', 'nudity', 'naked', 'sex', 'xxx', 'erotic', 'nsfw',
    'hentai', 'fetish', 'topless', 'lingerie', 'genital', 'breast', 'penis', 'vagina',
    'gore', 'beheading', 'execution', 'suicide', 'self-harm', 'selfharm', 'corpse',
    'mutilat', 'torture', 'massacre'];

  function blocked(q) {
    var s = ' ' + String(q || '').toLowerCase().replace(/[^a-z]+/g, ' ') + ' ';
    for (var i = 0; i < BLOCKED.length; i++) if (s.indexOf(BLOCKED[i]) > -1) return true;
    return false;
  }

  window.NC_MEDIA = {
    licence: licence,
    plain: plain,
    blocked: blocked,
    credit: { add: add, list: load, text: text, count: count, clear: clear, open: open, line: line }
  };
  /* The credits sheet is reachable from both pickers and from the console. */
  window.__ncOpenCredits = open;
})();
