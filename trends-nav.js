/* ============================================================================
   TREND SPOTTER — MAKING THE RAIL DO THE WORK, IN PLACE
   ============================================================================
   trends.html is a bundled React app with its own sidebar and its own hash
   router, and four of the six things in that sidebar went nowhere: Scripts,
   Thumbnails, Editor and Publish each opened a placeholder with a badge
   reading STAGED.

   The first version of this file pointed those rail items at the pages that
   already do the job — Scripts at ai.html, Thumbnails at publish.html, Studio
   at analytics.html. That fixed "the feature does not exist" and introduced a
   worse problem: every one of them left this app entirely and landed on a
   full site page with the main sidebar. Clicking Studio inside the Studio
   threw you out of it.

   So the ones that CAN work here now work here. Scripts, Thumbnails and Studio
   render as panels inside this app's own content area, beside its rail, and
   the hash never leaves #/. Nothing navigates.

   HOW A PANEL SURVIVES REACT

   The shell is  .nc-app > .nc-sidebar + main.nc-main > .nc-page  and React
   owns .nc-page. A panel injected INTO .nc-page would be wiped on the next
   render. So the panel is appended to main.nc-main as a SIBLING of .nc-page,
   and the two are shown and hidden against each other. React re-renders its
   own subtree as much as it likes and never touches this one.

   HYPE LAB IS THE REAL PAGE, IN A FRAME

   It is a full tool — file picker, frame decoding, canvas preview, recorder —
   and rebuilding it here would be a second copy that drifts from the first.
   So it is not rebuilt: the panel holds hype.html?embed=1 in an iframe, which
   is the same thing game.html already does with the four games. One page, one
   copy of the code, and it stops being somewhere you get sent instead of
   somewhere you go.

   nova.js already understands ?embed=1 and skips the rail, the top bar and the
   points badge; hype.html hides its own .sidebar markup on the same flag.

   The Studio panel is a snapshot rather than the whole dashboard, and it says
   so: the charts on analytics.html need a YouTube OAuth grant and the
   Analytics API, which belong to that page. What can honestly be shown from
   what this device already knows is shown, and the rest is one button away.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_TRENDS_NAV) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ==========================================================================
     THE RAIL
     ========================================================================== */

  /* Routes this file now owns and renders in place. The app's router does not
     know them; it will render whatever it renders into .nc-page, and .nc-page
     is hidden while one of these is showing, so it does not matter. */
  var PANELS = {
    '/scripts':    { label: 'Scripts',
                     icon: 'M4 3h11l5 5v13H4zM15 3v5h5M8 13h8M8 17h5',
                     why: 'Turn a trend into a script, here' },
    '/thumbnails': { label: 'Thumbnails',
                     icon: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6',
                     why: 'Make a 1280x720 thumbnail, here' },
    '/studio':     { label: 'Studio',
                     icon: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-3',
                     why: 'How the videos you made from these trends are doing' },
    '/hype':       { label: 'Hype Lab',
                     icon: 'M13 2 4 14h7l-1 8 9-12h-7z',
                     why: 'Find the seconds where your finished edit loses people, and fill them' }
  };

  /* Old hrefs in the bundle, and where each should now point. Editor and
     Publish are not in the rail — they are in the main sidebar two rows away —
     but somebody with #/editor bookmarked should still land on the editor
     rather than on a placeholder. */
  var REWRITE = {
    '/scripts':    '#/scripts',
    '/thumbnails': '#/thumbnails'
  };
  var LEAVE = { '/editor': 'editor.html', '/publish': 'publish.html' };
  var DROP = ['/editor', '/publish'];

  function railItem(href) { return $('.nc-sidebar a[href="' + href + '"]'); }

  /* A row cloned from a sibling so the layout, classes and hover behaviour are
     the app's rather than a guess at them. Only the icon path and the label
     are replaced. */
  function addItem(nav, key, spec, href) {
    if (!nav || nav.querySelector('[data-nc-add="' + key + '"]')) return;
    /* The LAST item, not the first. The first is "Back to NovaClip", whose
       icon is a back arrow — cloning that gave Studio an arrow pointing off
       the page, which is the one thing it does not do. */
    var models = nav.querySelectorAll('.nc-nav-item');
    var model = models[models.length - 1];
    if (!model) return;
    var a = model.cloneNode(true);
    a.setAttribute('data-nc-add', key);
    a.className = 'nc-nav-item ';
    a.href = href;
    a.title = spec.why;
    a.removeAttribute('aria-current');
    var svg = a.querySelector('svg');
    if (svg) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', spec.icon);
      svg.appendChild(path);
    }
    var label = [].slice.call(a.childNodes).filter(function (n) {
      return n.nodeType === 1 && n.tagName !== 'svg' && !n.querySelector('svg');
    }).pop();
    if (label) label.textContent = spec.label;
    else a.textContent = spec.label;
    var items = nav.querySelectorAll('.nc-nav-item');
    var last = items[items.length - 1];
    if (last && last.parentNode) last.parentNode.insertBefore(a, last.nextSibling);
    else nav.appendChild(a);
  }

  function fixRail() {
    var side = $('.nc-sidebar');
    if (!side) return;

    /* Point the app's own dead rows at the panels below. */
    Object.keys(REWRITE).forEach(function (route) {
      var a = railItem('#' + route);
      if (!a) return;
      a.href = REWRITE[route];
      a.title = (PANELS[route] || {}).why || '';
      a.classList.remove('nc-nav-item-active');
    });

    /* Take the two that belong to the main sidebar out of this one. */
    DROP.forEach(function (route) {
      var a = railItem('#' + route);
      if (a) a.remove();
    });

    var nav = side.querySelector('nav') || side;
    addItem(nav, 'hype', PANELS['/hype'], '#/hype');
    addItem(nav, 'studio', PANELS['/studio'], '#/studio');
    markActive();
  }

  function markActive() {
    var h = hash();
    var side = $('.nc-sidebar');
    if (!side) return;
    side.querySelectorAll('.nc-nav-item').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var mine = PANELS[href.slice(1)];
      if (!mine) return;
      if (href.slice(1) === h) a.classList.add('nc-nav-item-active');
      else a.classList.remove('nc-nav-item-active');
    });
  }

  /* ==========================================================================
     THE PANEL HOST
     ========================================================================== */
  function hash() { return (location.hash || '').replace(/^#/, ''); }

  var STYLE_ID = 'nc-x-style';
  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.ncx{padding:28px 30px 70px;max-width:940px}',
      '.ncx h1{font-size:1.7rem;font-weight:800;letter-spacing:-.02em;margin:0 0 6px}',
      '.ncx .lede{opacity:.72;margin:0 0 22px;line-height:1.6;max-width:70ch}',
      '.ncx .card{border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:16px;',
      '  padding:18px;background:color-mix(in srgb,currentColor 4%,transparent);margin-bottom:16px}',
      '.ncx label{display:block;font-size:.8rem;opacity:.7;margin:12px 0 5px}',
      /* A fixed dark fill is wrong half the time: this app follows the site
         theme, and rgba(0,0,0,.28) on the light theme is a grey box with dark
         text in it. Tinted from the current text colour instead, so it is a
         subtle wash on either. */
      '.ncx input,.ncx select,.ncx textarea{width:100%;background:color-mix(in srgb,currentColor 8%,transparent);',
      '  color:inherit;border:1px solid color-mix(in srgb,currentColor 26%,transparent);',
      '  border-radius:10px;padding:10px 12px;font:inherit;font-size:.93rem}',
      '.ncx input::placeholder,.ncx textarea::placeholder{color:inherit;opacity:.45}',
      '.ncx textarea{min-height:170px;resize:vertical;line-height:1.6}',
      '.ncx input:focus,.ncx select:focus,.ncx textarea:focus{outline:none;border-color:#22d3ee}',
      '.ncx .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}',
      '.ncx button{border:1px solid color-mix(in srgb,currentColor 24%,transparent);',
      '  background:color-mix(in srgb,currentColor 8%,transparent);color:inherit;',
      '  border-radius:11px;padding:10px 16px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer}',
      '.ncx button:hover:not(:disabled){border-color:#22d3ee}',
      '.ncx button:disabled{opacity:.45;cursor:not-allowed}',
      '.ncx button.go{background:linear-gradient(110deg,#7c5cff,#22d3ee);border:0;color:#06121a;font-weight:800}',
      '.ncx .say{margin-top:12px;font-size:.9rem;border:1px solid color-mix(in srgb,currentColor 22%,transparent);',
      '  border-radius:11px;padding:10px 13px;line-height:1.55}',
      '.ncx .say.no{border-color:rgba(255,90,90,.55);background:rgba(255,90,90,.08)}',
      '.ncx .say.ok{border-color:rgba(34,211,238,.5);background:rgba(34,211,238,.07)}',
      '.ncx .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
      '@media(max-width:820px){.ncx .two{grid-template-columns:1fr}.ncx{padding:20px 16px 60px}}',
      '.ncx canvas{width:100%;border-radius:12px;display:block;background:#000}',
      /* The frame gets the height rather than the iframe getting a fixed one,
         so the tool grows with the window instead of scrolling inside a box
         that is always slightly too short. */
      '.ncx .frame{border:1px solid color-mix(in srgb,currentColor 18%,transparent);',
      '  border-radius:16px;overflow:hidden;height:calc(100vh - 190px);min-height:560px}',
      '.ncx .frame iframe{width:100%;height:100%;border:0;display:block}',
      '.ncx .facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px}',
      '.ncx .fact{border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:12px;',
      '  padding:11px 13px;background:color-mix(in srgb,currentColor 4%,transparent)}',
      '.ncx .fact b{display:block;font-size:1.25rem;font-weight:800}',
      '.ncx .fact span{opacity:.62;font-size:.74rem}'
    ].join('');
    document.head.appendChild(s);
  }

  function host() {
    var main = $('main.nc-main');
    if (!main) return null;
    var box = main.querySelector('#nc-x-panel');
    if (!box) {
      box = document.createElement('div');
      box.id = 'nc-x-panel';
      box.className = 'ncx';
      box.style.display = 'none';
      main.appendChild(box);
    }
    return box;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function say(el, kind, html) {
    if (!el) return;
    el.className = 'say' + (kind ? ' ' + kind : '');
    el.innerHTML = html || '';
    el.style.display = html ? '' : 'none';
  }

  /* ==========================================================================
     SCRIPTS
     ========================================================================== */
  function scriptsPanel(box) {
    if (box.dataset.view === 'scripts') return;
    box.dataset.view = 'scripts';
    box.innerHTML =
      '<h1>Scripts</h1>' +
      '<p class="lede">Turn a trend into something you can actually read out. It writes a hook, ' +
      'the middle and an ending — short, because a short video is what this is for.</p>' +
      '<div class="card">' +
        '<label for="ncxTopic">What is the video about</label>' +
        '<input id="ncxTopic" type="text" maxlength="120" placeholder="the trend, or your own idea">' +
        '<div class="two">' +
          '<div><label for="ncxLen">How long</label><select id="ncxLen">' +
            '<option value="15">15 seconds</option><option value="30" selected>30 seconds</option>' +
            '<option value="60">60 seconds</option></select></div>' +
          '<div><label for="ncxTone">How it sounds</label><select id="ncxTone">' +
            '<option>Straight to the point</option><option>Funny</option>' +
            '<option>Storytime</option><option>Explainer</option></select></div>' +
        '</div>' +
        '<div class="row"><button class="go" id="ncxWrite">Write it</button>' +
          '<button id="ncxCopy" disabled>Copy</button></div>' +
        '<div class="say" id="ncxSay" style="display:none"></div>' +
        '<label for="ncxOut" style="margin-top:16px">The script</label>' +
        '<textarea id="ncxOut" placeholder="It appears here. Edit it — it is a first draft, not a script."></textarea>' +
      '</div>';

    var topic = $('#ncxTopic', box), out = $('#ncxOut', box), sayEl = $('#ncxSay', box);
    var write = $('#ncxWrite', box), copy = $('#ncxCopy', box);

    /* If the reader came from a trend, use it. The app puts the trend it is
       showing in the URL on its own routes; this reads the last one seen. */
    try {
      var seed = sessionStorage.getItem('nc_trend_seed');
      if (seed && !topic.value) topic.value = seed;
    } catch (e) {}

    out.addEventListener('input', function () { copy.disabled = !out.value.trim(); });

    copy.addEventListener('click', function () {
      if (!out.value.trim()) return;
      try {
        navigator.clipboard.writeText(out.value);
        say(sayEl, 'ok', 'Copied.');
      } catch (e) { out.select(); }
    });

    write.addEventListener('click', async function () {
      var t = topic.value.trim();
      if (!t) return say(sayEl, 'no', 'Say what the video is about first.');
      if (typeof window.ncAsk !== 'function') {
        return say(sayEl, 'no', 'The AI helper did not load on this page.');
      }
      write.disabled = true;
      say(sayEl, '', 'Writing…');
      var secs = $('#ncxLen', box).value;
      var tone = $('#ncxTone', box).value;
      try {
        var answer = await window.ncAsk(
          'Write a script for a ' + secs + '-second short video for a teenage creator.\n' +
          'Subject: ' + t + '\nTone: ' + tone + '\n\n' +
          'Give it as plain text with three labelled parts — HOOK, MIDDLE, END. ' +
          'The hook is the first two seconds and has to earn the rest. ' +
          'Write words a 15-year-old would actually say out loud, no stage directions, ' +
          'no hashtags, no emoji, and do not promise anything the video cannot show. ' +
          'Keep it to what fits in ' + secs + ' seconds when read at a normal pace.');
        out.value = String(answer || '').trim();
        copy.disabled = !out.value;
        say(sayEl, out.value ? 'ok' : 'no',
          out.value ? 'First draft. Change anything — it is yours.' : 'The AI sent nothing back.');
      } catch (err) {
        say(sayEl, 'no', esc((err && err.message) || String(err)));
      }
      write.disabled = false;
    });
  }

  /* ==========================================================================
     THUMBNAILS
     ==========================================================================
     1280x720 because that is the size YouTube asks for, drawn on a canvas
     here. No upload, no model, no network — which is why it works when the AI
     does not. */
  function thumbPanel(box) {
    if (box.dataset.view === 'thumbnails') return;
    box.dataset.view = 'thumbnails';
    box.innerHTML =
      '<h1>Thumbnails</h1>' +
      '<p class="lede">1280&times;720, the size YouTube asks for. Drawn on this device — ' +
      'nothing is uploaded and nothing is generated by a model, so it works offline.</p>' +
      '<div class="card">' +
        '<div class="two">' +
          '<div>' +
            '<label for="ncxTitle">Big words</label>' +
            '<input id="ncxTitle" type="text" maxlength="40" value="POV: it worked" placeholder="six words or fewer">' +
            '<label for="ncxSub">Small words (optional)</label>' +
            '<input id="ncxSub" type="text" maxlength="46" placeholder="the bit underneath">' +
            '<label for="ncxLook">Look</label>' +
            '<select id="ncxLook">' +
              '<option value="0">Cyan on black</option>' +
              '<option value="1">Hot pink</option>' +
              '<option value="2">Lime on charcoal</option>' +
              '<option value="3">Violet gradient</option>' +
            '</select>' +
            '<label for="ncxShot">Your own picture (optional)</label>' +
            '<input id="ncxShot" type="file" accept="image/*">' +
            '<div class="row"><button class="go" id="ncxSave">Save the PNG</button></div>' +
            '<div class="say" id="ncxSay2" style="display:none"></div>' +
          '</div>' +
          '<div><label>Preview</label><canvas id="ncxCanvas" width="1280" height="720"></canvas></div>' +
        '</div>' +
      '</div>';

    var c = $('#ncxCanvas', box), ctx = c.getContext('2d');
    var title = $('#ncxTitle', box), sub = $('#ncxSub', box), look = $('#ncxLook', box);
    var shot = $('#ncxShot', box), sayEl = $('#ncxSay2', box);
    var photo = null;

    var LOOKS = [
      { bg: '#05070E', ink: '#00E5FF', sub: '#9fb3c8' },
      { bg: '#12030B', ink: '#FF3D9A', sub: '#e6b9cd' },
      { bg: '#0E0E0E', ink: '#B6FF4A', sub: '#b8c9a8' },
      { bg: '#0B0620', ink: '#C4B5FD', sub: '#a99fd6' }
    ];

    function draw() {
      var L = LOOKS[+look.value] || LOOKS[0];
      ctx.fillStyle = L.bg;
      ctx.fillRect(0, 0, 1280, 720);

      if (photo) {
        /* Cover, then darken, so the words stay readable over any picture. */
        var r = Math.max(1280 / photo.width, 720 / photo.height);
        var w = photo.width * r, h = photo.height * r;
        ctx.drawImage(photo, (1280 - w) / 2, (720 - h) / 2, w, h);
        var g = ctx.createLinearGradient(0, 0, 0, 720);
        g.addColorStop(0, 'rgba(0,0,0,.35)');
        g.addColorStop(1, 'rgba(0,0,0,.78)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1280, 720);
      } else {
        var g2 = ctx.createRadialGradient(1050, 150, 0, 1050, 150, 900);
        g2.addColorStop(0, L.ink + '33');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, 1280, 720);
      }

      var words = title.value.trim() || ' ';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      /* Shrink to fit rather than overflow: a thumbnail with the last word
         missing is worse than one set a little smaller. */
      var size = 132;
      var lines;
      do {
        ctx.font = '800 ' + size + 'px "Plus Jakarta Sans", Segoe UI, system-ui, sans-serif';
        lines = wrap(ctx, words, 1080);
        size -= 6;
      } while ((lines.length * size * 1.12 > 430 || lines.length > 3) && size > 44);

      var y = 700 - (sub.value.trim() ? 84 : 40) - lines.length * size * 1.12;
      lines.forEach(function (ln, i) {
        var ly = y + i * size * 1.12;
        ctx.lineWidth = Math.max(6, size * 0.13);
        ctx.strokeStyle = 'rgba(0,0,0,.75)';
        ctx.lineJoin = 'round';
        ctx.strokeText(ln, 90, ly);
        ctx.fillStyle = i === 0 ? L.ink : '#ffffff';
        ctx.fillText(ln, 90, ly);
      });

      if (sub.value.trim()) {
        ctx.font = '600 46px "Plus Jakarta Sans", Segoe UI, system-ui, sans-serif';
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.strokeText(sub.value.trim(), 90, 640);
        ctx.fillStyle = L.sub;
        ctx.fillText(sub.value.trim(), 90, 640);
      }
    }

    function wrap(c2, text, max) {
      var w = String(text).split(/\s+/), out = [], line = '';
      for (var i = 0; i < w.length; i++) {
        var t = line ? line + ' ' + w[i] : w[i];
        if (c2.measureText(t).width > max && line) { out.push(line); line = w[i]; }
        else line = t;
      }
      if (line) out.push(line);
      return out;
    }

    [title, sub, look].forEach(function (el) {
      el.addEventListener('input', draw);
      el.addEventListener('change', draw);
    });

    shot.addEventListener('change', function () {
      var f = shot.files && shot.files[0];
      if (!f) { photo = null; return draw(); }
      var img = new Image();
      img.onload = function () { photo = img; draw(); };
      img.onerror = function () { say(sayEl, 'no', 'That image could not be read.'); };
      img.src = URL.createObjectURL(f);
    });

    $('#ncxSave', box).addEventListener('click', function () {
      try {
        c.toBlob(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = 'novaclip-thumbnail.png';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
          say(sayEl, 'ok', 'Saved at 1280&times;720.');
        }, 'image/png');
      } catch (e) {
        say(sayEl, 'no', 'The browser would not export the canvas.');
      }
    });

    draw();
  }

  /* ==========================================================================
     STUDIO — a snapshot, honestly labelled
     ========================================================================== */
  function studioPanel(box) {
    if (box.dataset.view === 'studio') return;
    box.dataset.view = 'studio';

    var channel = '', dates = [];
    try {
      var yt = JSON.parse(localStorage.getItem('nc_yt') || '{}') || {};
      channel = yt.channel || '';
    } catch (e) {}
    try { dates = JSON.parse(localStorage.getItem('nc_hist') || '[]') || []; } catch (e) {}

    var cadence = '—';
    if (dates.length > 2) {
      var gaps = [];
      var sorted = dates.slice().sort(function (a, b) { return b - a; });
      for (var i = 0; i < sorted.length - 1; i++) gaps.push((sorted[i] - sorted[i + 1]) / 86400000);
      gaps.sort(function (a, b) { return a - b; });
      var mid = gaps[Math.floor(gaps.length / 2)];
      if (isFinite(mid)) cadence = mid < 1.5 ? 'about daily' : ('every ' + Math.round(mid) + ' days');
    }
    var last = dates.length ? new Date(Math.max.apply(null, dates)) : null;
    var sinceLast = last ? Math.round((Date.now() - last.getTime()) / 86400000) : null;

    box.innerHTML =
      '<h1>Studio</h1>' +
      '<p class="lede">What this device already knows about your channel. The charts — watch time, ' +
      'retention, where viewers come from — need a YouTube sign-in and live on the full Studio page.</p>' +
      '<div class="card">' +
        '<div class="facts">' +
          '<div class="fact"><b>' + esc(channel || '—') + '</b><span>Connected channel</span></div>' +
          '<div class="fact"><b>' + (dates.length || '—') + '</b><span>Uploads it has seen</span></div>' +
          '<div class="fact"><b>' + esc(cadence) + '</b><span>Your usual gap</span></div>' +
          '<div class="fact"><b>' + (sinceLast == null ? '—' : sinceLast + 'd') + '</b><span>Since the last one</span></div>' +
        '</div>' +
        '<div class="say" style="margin-top:16px">' +
          (channel
            ? 'Measured from the upload dates this device stored the last time Studio ran. ' +
              'Nothing here was fetched just now.'
            : '<b>No channel connected on this device yet.</b> Open the full Studio and sign in ' +
              'with Google once; after that this panel fills in.') +
        '</div>' +
        '<div class="row">' +
          '<a href="analytics.html"><button class="go">Open the full Studio</button></a>' +
          '<a href="#/hype"><button>Hype Lab</button></a>' +
        '</div>' +
      '</div>';
  }

  /* ==========================================================================
     HYPE LAB — the real page, embedded
     ==========================================================================
     Deliberately an iframe rather than a rebuild. hype.html is ~550 lines of
     markup wired to hype.js; a second copy inside this file would be two
     things to keep in step forever, and the first time they disagreed nobody
     would know which one was right.

     The frame is only built once. Rebuilding it on every visit to the route
     would throw away a clip somebody had already dropped in and analysed,
     which is a minute of their time and the whole point of the tool.
     ========================================================================== */
  function hypePanel(box) {
    if (box.dataset.view === 'hype') return;
    box.dataset.view = 'hype';
    box.innerHTML =
      '<h1>Hype Lab</h1>' +
      '<p class="lede">Drop in a video you have already cut. It finds the seconds where attention ' +
      'falls off and puts something there — a punch on the beat, a light wash, words, a music bed. ' +
      'Nothing is uploaded to measure it.</p>' +
      '<div class="frame"><iframe id="ncxHype" title="Hype Lab" ' +
        'src="hype.html?embed=1" loading="lazy" ' +
        'allow="camera; microphone; clipboard-write"></iframe></div>';
  }

  /* ==========================================================================
     THE ROUTER
     ========================================================================== */
  function route() {
    var h = hash();

    /* Somebody with an old bookmark for a route that is now a real page. */
    if (LEAVE[h]) { location.replace(LEAVE[h]); return; }

    var main = $('main.nc-main');
    if (!main) return;
    var page = main.querySelector('.nc-page');
    var box = host();
    if (!box) return;

    var mine = PANELS[h];
    if (mine) {
      styles();
      if (page) page.style.display = 'none';
      box.style.display = '';
      if (h === '/scripts') scriptsPanel(box);
      else if (h === '/thumbnails') thumbPanel(box);
      else if (h === '/hype') hypePanel(box);
      else studioPanel(box);
      /* A panel opened from halfway down the trends list should start at the
         top of itself, not wherever the last screen was scrolled to. */
      try { main.scrollTop = 0; window.scrollTo(0, 0); } catch (e) {}
    } else {
      /* Hidden, NOT reset. Clearing dataset.view here made every panel rebuild
         itself on the way back: a script you had typed, a thumbnail you had
         set up, and — worst — the Hype Lab frame with a clip already dropped
         in and analysed. Leaving the view marked means returning to the same
         panel keeps its state, while switching to a different one still
         rebuilds, because the marker no longer matches. */
      box.style.display = 'none';
      if (page) page.style.display = '';
    }
    markActive();
  }

  function boot() {
    fixRail();
    route();
    /* React rebuilds the rail on every route change and would put the dead
       hrefs back. Cheap to re-apply; the guards inside addItem and the panel
       renderers keep it from duplicating anything. The panel itself is outside
       React's subtree, so this never fights it. */
    try {
      new MutationObserver(function () { fixRail(); }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    window.addEventListener('hashchange', route);
  }

  window.NC_TRENDS_NAV = { fixRail: fixRail, route: route, panels: PANELS };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
