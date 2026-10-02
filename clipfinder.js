/* ============================================================================
   NOVACLIP CLIP FINDER  —  type a channel, see what works on it
   ============================================================================
   WHAT WAS ASKED FOR, AND THE ONE PART OF IT THAT CANNOT BE BUILT

   The ask was: type a YouTube channel's name and get a popular clip back that
   you can edit. The first half is done here and works. The second half — the
   video arriving on the timeline as footage — cannot be built by anybody, and
   it is worth being exact about why rather than quietly shipping something
   that half does it:

     · YouTube's terms forbid taking the file. There is no API that offers it,
       and the tools that scrape it do so in breach.
     · The video is somebody's copyrighted work. The EU has no fair use, and
       there is no length that makes a re-upload lawful.
     · A site that SERVED that video to be re-cut would be the infringer, not
       the teenager who clicked. footage.js reached exactly this conclusion
       about film clips, in writing, and nothing about YouTube changes it.

   So the video plays here in YouTube's own embedded player, which is the one
   way they do permit it, and what you take away is not the pixels.

   WHAT YOU DO TAKE AWAY, WHICH IS THE USEFUL PART

   The channel's biggest videos, ranked by views, with lengths and dates — so
   you can see what actually works for somebody you admire rather than guessing.
   Pick a stretch of one, and the AI turns it into a brief for YOUR version: the
   hook, the beats with timings, a shot list you can film, and a title and
   thumbnail idea. That is the thing NovaClip is actually for — the hard part
   was never the cutting, it was knowing what to make.

   And the footage you cut it with comes from the picker next door, which is
   licensed and safe to use.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncOpenClipFinder) return;

  var PANEL = null, VEIL = null, STATE = { channel: null, videos: [], picked: null,
                                           inSec: 0, outSec: 30, plan: '' };

  function worker() { return window.NC_AI_WORKER_URL || ''; }

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
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
  }
  function big(n) {
    n = n || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  /* --------------------------------------------------------------------------
     STYLE
     Scoped to .nccf- so it cannot leak into the editor's own chrome, and laid
     out to survive a phone: the grid collapses to one column and the player
     keeps its aspect ratio rather than being given a fixed height.
     ------------------------------------------------------------------------ */
  function styles() {
    if (document.getElementById('nccf-style')) return;
    var st = document.createElement('style');
    st.id = 'nccf-style';
    st.textContent =
      '.nccf-veil{position:fixed;inset:0;z-index:100003;background:rgba(4,6,12,.74);' +
        'display:flex;align-items:center;justify-content:center;padding:16px;}' +
      '.nccf{width:min(980px,100%);max-height:min(88vh,860px);overflow:auto;' +
        'background:#0B0E18;border:1px solid rgba(120,140,255,.26);border-radius:18px;' +
        'box-shadow:0 30px 80px rgba(0,0,0,.6);color:#E8EEFF;' +
        'font:400 14px/1.5 system-ui,-apple-system,sans-serif;}' +
      '.nccf-h{display:flex;align-items:center;gap:12px;padding:16px 18px;' +
        'border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;background:#0B0E18;z-index:2}' +
      '.nccf-h h2{margin:0;font-size:1.05rem;font-weight:700;flex:1}' +
      '.nccf-x{border:0;background:transparent;color:#8A97B4;font-size:24px;cursor:pointer;line-height:1}' +
      '.nccf-b{padding:16px 18px}' +
      '.nccf-find{display:flex;gap:8px;flex-wrap:wrap}' +
      '.nccf-find input{flex:1 1 220px;min-width:0;padding:11px 13px;border-radius:11px;' +
        'background:#070910;border:1px solid rgba(120,140,255,.3);color:#E8EEFF;font-size:15px}' +
      '.nccf-go{padding:11px 18px;border:0;border-radius:11px;cursor:pointer;font-weight:700;' +
        'background:linear-gradient(90deg,#6C5CE7,#00D2FF);color:#04121a}' +
      '.nccf-go[disabled]{opacity:.55;cursor:default}' +
      '.nccf-note{margin:12px 0 0;padding:11px 13px;border-radius:11px;font-size:12.5px;line-height:1.55;' +
        'background:rgba(180,83,9,.12);border:1px solid rgba(251,191,36,.3);color:#FDE68A}' +
      '.nccf-msg{margin:14px 0 0;font-size:13px;color:#8A97B4}' +
      '.nccf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:16px}' +
      '.nccf-card{text-align:left;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:13px;' +
        'background:#0F1322;cursor:pointer;overflow:hidden;color:inherit;font:inherit}' +
      '.nccf-card:hover,.nccf-card:focus-visible{border-color:rgba(120,140,255,.6)}' +
      '.nccf-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#070910}' +
      '.nccf-card .t{padding:9px 10px 2px;font-size:12.5px;font-weight:650;line-height:1.35;' +
        'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
      '.nccf-card .m{padding:0 10px 10px;font-size:11.5px;color:#8A97B4}' +
      '.nccf-chan{display:flex;align-items:center;gap:10px;margin-top:16px;font-size:13px;color:#A8B4CE}' +
      '.nccf-chan img{width:34px;height:34px;border-radius:50%}' +
      '.nccf-play{margin-top:4px;width:100%;aspect-ratio:16/9;border:0;border-radius:13px;background:#000}' +
      '.nccf-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;font-size:12.5px}' +
      '.nccf-row label{color:#8A97B4}' +
      '.nccf-row input[type=range]{flex:1 1 160px;min-width:120px}' +
      '.nccf-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}' +
      '.nccf-acts button{padding:10px 15px;border-radius:11px;border:1px solid rgba(120,140,255,.34);' +
        'background:#141A2E;color:#E8EEFF;cursor:pointer;font-weight:650;font-size:13px}' +
      '.nccf-acts button.pri{border:0;background:linear-gradient(90deg,#6C5CE7,#00D2FF);color:#04121a}' +
      '.nccf-acts button[disabled]{opacity:.55;cursor:default}' +
      '.nccf-plan{margin-top:14px;padding:13px 15px;border-radius:13px;background:#0F1322;' +
        'border:1px solid rgba(255,255,255,.1);white-space:pre-wrap;font-size:13px;line-height:1.6}' +
      '.nccf-back{border:0;background:transparent;color:#7FB2FF;cursor:pointer;font-size:13px;padding:0}' +
      '@media(max-width:560px){.nccf-grid{grid-template-columns:1fr 1fr}.nccf-card .t{font-size:11.5px}}';
    document.head.appendChild(st);
  }

  /* ---- the honest line, shown every time, never dismissible ------------- */
  function noteHTML() {
    return 'The video itself stays on YouTube — it cannot be downloaded into the editor, ' +
           'by NovaClip or by anything else, and re-cutting somebody else’s video is theirs ' +
           'to allow, not ours. What you take from here is the <b>idea</b>: pick a stretch and ' +
           'NovaClip writes you a plan for your own version.';
  }

  /* --------------------------------------------------------------------------
     SEARCH
     ------------------------------------------------------------------------ */
  function find(name, msg, grid, chanBox) {
    msg.textContent = 'Looking up ' + name + '…';
    grid.innerHTML = '';
    chanBox.innerHTML = '';
    var base = worker();
    if (!base) {
      msg.textContent = 'The AI worker address is missing, so channels cannot be looked up.';
      return Promise.resolve();
    }
    return fetch(base + '/yt?channel=' + encodeURIComponent(name) + '&n=8')
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || res.j.state === 'NONE') {
          msg.textContent = res.j.reason || res.j.error ||
            'That did not work. Try the channel’s exact name.';
          return;
        }
        STATE.channel = res.j.channel;
        STATE.videos = res.j.videos || [];
        if (!STATE.videos.length) {
          msg.textContent = 'Nothing long enough to study on that channel — it may be all Shorts.';
          return;
        }
        msg.textContent = '';
        var c = res.j.channel;
        chanBox.innerHTML =
          (c.thumb ? '<img src="' + esc(c.thumb) + '" alt="">' : '') +
          '<div><b>' + esc(c.title) + '</b>' +
          (c.hidden ? '' : ' · ' + big(c.subscribers) + ' subscribers') +
          '<br><span style="color:#6E7B96">Their ' + STATE.videos.length +
          ' most-watched videos, longest first by views</span></div>';
        STATE.videos.forEach(function (v) {
          var b = el('button', 'nccf-card');
          b.type = 'button';
          b.innerHTML =
            (v.thumb ? '<img src="' + esc(v.thumb) + '" alt="" loading="lazy">' : '') +
            '<div class="t">' + esc(v.title) + '</div>' +
            '<div class="m">' + big(v.views) + ' views · ' + clock(v.seconds) + '</div>';
          b.onclick = function () { pick(v); };
          grid.appendChild(b);
        });
      })
      .catch(function (e) {
        msg.textContent = 'Could not reach the worker: ' + (e && e.message ? e.message : 'no answer');
      });
  }

  /* --------------------------------------------------------------------------
     ONE VIDEO: watch a stretch of it, then turn it into your own plan
     ------------------------------------------------------------------------ */
  function pick(v) {
    STATE.picked = v;
    STATE.inSec = 0;
    STATE.outSec = Math.min(45, v.seconds);
    STATE.plan = '';
    render();
  }

  function planPrompt() {
    var v = STATE.picked, c = STATE.channel || {};
    return 'A teenage creator wants to make their own video inspired by one that did well on ' +
      'somebody else’s channel. Do NOT suggest they re-upload, re-cut or copy any part of ' +
      'the original.\n\n' +
      'Channel: ' + (c.title || 'unknown') + '\n' +
      'Video title: ' + v.title + '\n' +
      'Length: ' + clock(v.seconds) + ', and it has ' + big(v.views) + ' views\n' +
      'The part they are interested in: ' + clock(STATE.inSec) + ' to ' + clock(STATE.outSec) + '\n\n' +
      'From the TITLE alone, work out why this video probably did well, then give them a plan ' +
      'for an original video of their own on the same idea. Use exactly these headings and keep ' +
      'the whole thing under 300 words:\n' +
      'WHY IT WORKED\nYOUR HOOK (the first 5 seconds, written out)\nTHE BEATS (4-6 lines, each ' +
      'with a timing)\nWHAT TO FILM (things they can actually shoot or find as stock)\nTITLE\n' +
      'THUMBNAIL';
  }

  function makePlan(btn, out) {
    if (typeof window.ncAsk !== 'function') {
      out.textContent = 'The AI is not loaded on this page.';
      out.style.display = '';
      return;
    }
    btn.disabled = true;
    var was = btn.textContent;
    btn.textContent = 'Thinking…';
    out.style.display = '';
    out.textContent = 'Writing your plan…';
    Promise.resolve(window.ncAsk(planPrompt(), { max: 700 }))
      .then(function (r) {
        var text = (r && (r.text || r.err)) || '';
        STATE.plan = r && r.text ? r.text : '';
        out.textContent = text || 'The AI did not answer. Try again in a moment.';
      })
      .catch(function (e) {
        out.textContent = 'The AI did not answer: ' + (e && e.message ? e.message : 'unknown');
      })
      .then(function () { btn.disabled = false; btn.textContent = was; });
  }

  /* --------------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------------ */
  function render() {
    var body = PANEL.querySelector('.nccf-b');
    body.innerHTML = '';

    if (!STATE.picked) {
      var find1 = el('div', 'nccf-find');
      var input = el('input');
      input.type = 'text';
      input.placeholder = 'A YouTube channel name…';
      input.setAttribute('aria-label', 'YouTube channel name');
      var go = el('button', 'nccf-go', 'Find their best');
      go.type = 'button';
      find1.appendChild(input); find1.appendChild(go);
      var note = el('div', 'nccf-note', noteHTML());
      var chanBox = el('div', 'nccf-chan');
      var msg = el('p', 'nccf-msg');
      var grid = el('div', 'nccf-grid');
      body.appendChild(find1); body.appendChild(note);
      body.appendChild(chanBox); body.appendChild(msg); body.appendChild(grid);

      var run = function () {
        var q = input.value.trim();
        if (!q) { input.focus(); return; }
        go.disabled = true;
        find(q, msg, grid, chanBox).then(function () { go.disabled = false; });
      };
      go.onclick = run;
      input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } };
      setTimeout(function () { input.focus(); }, 40);
      return;
    }

    /* ---- the picked video ---- */
    var v = STATE.picked;
    var back = el('button', 'nccf-back', '← Other videos from this channel');
    back.type = 'button';
    back.onclick = function () { STATE.picked = null; render(); };
    body.appendChild(back);

    var h = el('p', '', '<b>' + esc(v.title) + '</b><br>' +
      '<span style="color:#8A97B4;font-size:12.5px">' + big(v.views) + ' views · ' +
      clock(v.seconds) + ' · ' + esc((STATE.channel || {}).title || '') + '</span>');
    h.style.margin = '10px 0 8px';
    body.appendChild(h);

    /* YouTube's own player, with the chosen in and out points. This is the one
       way their terms allow the video to be shown, and it is why the frames
       cannot be reached from here: the iframe is another origin. */
    var frame = el('iframe', 'nccf-play');
    frame.setAttribute('allow', 'encrypted-media; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.title = v.title;
    body.appendChild(frame);

    var reload = function () {
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
        '?start=' + Math.floor(STATE.inSec) + '&end=' + Math.ceil(STATE.outSec) + '&rel=0';
    };

    var row = el('div', 'nccf-row');
    var lab = el('label', '', 'From');
    var from = el('input'); from.type = 'range'; from.min = 0; from.max = Math.max(1, v.seconds - 5);
    from.value = STATE.inSec; from.setAttribute('aria-label', 'Clip start');
    var read = el('span', '', clock(STATE.inSec) + ' → ' + clock(STATE.outSec));
    read.style.cssText = 'min-width:118px;font-variant-numeric:tabular-nums;color:#A8B4CE';
    var lenLab = el('label', '', 'Length');
    var len = el('input'); len.type = 'range'; len.min = 5;
    len.max = Math.min(120, Math.max(10, v.seconds));
    len.value = Math.max(5, STATE.outSec - STATE.inSec);
    len.setAttribute('aria-label', 'Clip length');
    row.appendChild(lab); row.appendChild(from);
    row.appendChild(lenLab); row.appendChild(len); row.appendChild(read);
    body.appendChild(row);

    var sync = function () {
      STATE.inSec = Math.min(parseInt(from.value, 10) || 0, Math.max(0, v.seconds - 5));
      STATE.outSec = Math.min(v.seconds, STATE.inSec + (parseInt(len.value, 10) || 15));
      read.textContent = clock(STATE.inSec) + ' → ' + clock(STATE.outSec);
    };
    from.oninput = function () { sync(); };
    len.oninput = function () { sync(); };
    from.onchange = function () { sync(); reload(); };
    len.onchange = function () { sync(); reload(); };
    reload();

    var note2 = el('div', 'nccf-note', noteHTML());
    body.appendChild(note2);

    var out = el('div', 'nccf-plan');
    out.style.display = 'none';

    var acts = el('div', 'nccf-acts');
    var mk = el('button', 'pri', 'Write me a plan for my own version');
    mk.type = 'button';
    mk.onclick = function () { makePlan(mk, out); };
    var cp = el('button', '', 'Copy the plan');
    cp.type = 'button';
    cp.onclick = function () {
      var t = STATE.plan || out.textContent || '';
      if (!t) return;
      try {
        navigator.clipboard.writeText(t).then(function () {
          cp.textContent = 'Copied';
          setTimeout(function () { cp.textContent = 'Copy the plan'; }, 1600);
        });
      } catch (e) {}
    };
    var ft = el('button', '', 'Find footage I can legally use');
    ft.type = 'button';
    ft.onclick = function () {
      if (typeof window.__ncOpenFootage === 'function') { close(); window.__ncOpenFootage(); }
    };
    var open2 = el('button', '', 'Open on YouTube');
    open2.type = 'button';
    open2.onclick = function () {
      window.open(v.url + '&t=' + Math.floor(STATE.inSec) + 's', '_blank', 'noopener');
    };
    acts.appendChild(mk); acts.appendChild(cp);
    if (typeof window.__ncOpenFootage === 'function') acts.appendChild(ft);
    acts.appendChild(open2);
    body.appendChild(acts);
    body.appendChild(out);
  }

  /* --------------------------------------------------------------------------
     OPEN / CLOSE
     ------------------------------------------------------------------------ */
  function close() {
    if (VEIL) { VEIL.remove(); VEIL = null; PANEL = null; }
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  function open() {
    if (VEIL) return;
    styles();
    VEIL = el('div', 'nccf-veil');
    VEIL.addEventListener('mousedown', function (e) { if (e.target === VEIL) close(); });
    PANEL = el('div', 'nccf');
    PANEL.setAttribute('role', 'dialog');
    PANEL.setAttribute('aria-label', 'Clip finder');
    var head = el('div', 'nccf-h',
      '<h2>Clip finder</h2>');
    var x = el('button', 'nccf-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.onclick = close;
    head.appendChild(x);
    PANEL.appendChild(head);
    PANEL.appendChild(el('div', 'nccf-b'));
    VEIL.appendChild(PANEL);
    document.body.appendChild(VEIL);
    document.addEventListener('keydown', onKey, true);
    STATE.picked = null;
    render();
  }

  /* The editor's own bundle knows nothing about this panel, so it brings its
     own way in. Bottom left, clear of the trial bar in the middle and the Pro
     badge top right. */
  function launcher() {
    if (document.getElementById('nccf-launch')) return;
    var b = el('button', '', '▶ Clip finder');
    b.id = 'nccf-launch';
    b.type = 'button';
    b.title = 'See what works on a channel you like, and get a plan for your own version';
    b.style.cssText =
      'position:fixed;left:16px;bottom:16px;z-index:995;padding:9px 14px;border-radius:11px;' +
      'border:1px solid rgba(120,140,255,.4);background:rgba(11,14,24,.92);color:#E8EEFF;' +
      'font:650 12.5px/1 system-ui,-apple-system,sans-serif;cursor:pointer;' +
      'box-shadow:0 6px 20px rgba(0,0,0,.4)';
    b.onclick = open;
    document.body.appendChild(b);
  }

  window.__ncOpenClipFinder = open;
  window.NC_CLIPFINDER = { open: open, close: close, state: STATE };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', launcher);
  else launcher();
})();
