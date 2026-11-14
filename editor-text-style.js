/* NOVACLIP — A FONT AND A SIZE FOR TEXT
 * ===========================================================================
 * Asked for: "add fonts and size from 1 to 100 to text".
 *
 * The Text panel had a box to type in, an Add Text button and eight presets.
 * The presets set a look, and after that the only way to change the typeface
 * or the size was to pick a different preset and lose everything else about
 * the one you had. The clip schema has carried fontFamily and fontSize all
 * along — updateClipText(id, {...}) writes them and the renderer reads them —
 * so this is a control for something the editor could already do and had no
 * way to ask for.
 *
 * THE FONTS ARE ALL ALREADY ON THE MACHINE
 * ---------------------------------------------------------------------------
 * Not one of them is fetched. Every family here resolves against fonts the
 * operating system ships, with a stack behind it so a missing one lands on
 * something of the same shape rather than on the browser default.
 *
 * That is a deliberate limit and it costs something real — there is no
 * Bebas Neue, no Montserrat, none of the faces a thumbnail is usually set in.
 * The alternative is a Google Fonts request on every editor load, which is a
 * third-party connection from a page used by 13-year-olds, a line in the
 * privacy policy, and a typeface that silently stops working on a school
 * network that blocks the host. studio-nexus.css made the same call for the
 * same reason and says so: "two of them would be a third-party request on
 * every Studio load, which is a line in the privacy policy and a paragraph of
 * layout shift, to change the shape of some labels."
 *
 * An exported video is not affected either way — the text is drawn into the
 * frame, so what the viewer sees is whatever was on the machine that made it.
 *
 * ONE TO A HUNDRED, AND WHAT THAT MEANS
 * ---------------------------------------------------------------------------
 * The number is the size the renderer already uses, so 100 is 100 of those
 * units and not "biggest". Both ends are honest: 1 is legible on nothing and
 * is there because the range was asked for, and the slider sits beside a box
 * you can type an exact number into, because dragging to 42 is luck.
 *
 * WITH AND WITHOUT A SELECTED CLIP
 * ---------------------------------------------------------------------------
 * With a text clip selected, moving either control changes that clip now.
 * With nothing selected the controls still work and are remembered, and the
 * next piece of text added takes them — otherwise setting up a font means
 * adding text first and fixing it afterwards, every time.
 */
(function () {
  'use strict';
  if (window.NC_TEXT_STYLE) return;

  var KEY = 'nc_text_style';
  var MIN = 1, MAX = 100, DEF_SIZE = 48;

  /* label, CSS stack. Nothing here is fetched. */
  var FONTS = [
    ['Sans (default)', 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'],
    ['Helvetica / Arial', 'Helvetica, Arial, sans-serif'],
    ['Verdana', 'Verdana, Geneva, sans-serif'],
    ['Tahoma', 'Tahoma, Geneva, sans-serif'],
    ['Trebuchet', '"Trebuchet MS", Tahoma, sans-serif'],
    ['Impact', 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif'],
    ['Georgia', 'Georgia, "Times New Roman", serif'],
    ['Times', '"Times New Roman", Times, serif'],
    ['Palatino', 'Palatino, "Palatino Linotype", "Book Antiqua", serif'],
    ['Garamond', 'Garamond, Baskerville, serif'],
    ['Courier', '"Courier New", Courier, monospace'],
    ['Mono', 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'],
    ['Comic', '"Comic Sans MS", "Comic Neue", cursive'],
    ['Brush Script', '"Brush Script MT", "Segoe Script", cursive']
  ];

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }

  function remembered() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (r && typeof r.size === 'number') return r;
    } catch (e) {}
    return { family: FONTS[0][1], size: DEF_SIZE };
  }
  function remember(r) {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
  }

  function selectedText() {
    var st = state();
    if (!st || !st.selectedClipId) return null;
    for (var i = 0; i < st.clips.length; i++) {
      var c = st.clips[i];
      if (c.id === st.selectedClipId && c.kind === 'text') return c;
    }
    return null;
  }

  function apply(patch) {
    var c = selectedText();
    var r = remembered();
    if (patch.family !== undefined) r.family = patch.family;
    if (patch.size !== undefined) r.size = patch.size;
    remember(r);
    if (!c) return false;
    var st = state();
    if (!st || typeof st.updateClipText !== 'function') return false;
    var out = {};
    if (patch.family !== undefined) out.fontFamily = patch.family;
    if (patch.size !== undefined) out.fontSize = patch.size;
    try { st.updateClipText(c.id, out); } catch (e) { return false; }
    return true;
  }

  function clamp(n) {
    n = Math.round(Number(n));
    if (!isFinite(n)) return DEF_SIZE;
    return Math.max(MIN, Math.min(MAX, n));
  }

  /* ------------------------------------------------------------------ view */

  var CSS =
    '.ncts{display:grid;gap:8px;padding:10px 0 2px;border-top:1px solid rgba(255,255,255,.08);margin-top:10px}' +
    '.ncts-lab{font:600 10px/1 system-ui;letter-spacing:.07em;text-transform:uppercase;color:#8B93AD}' +
    '.ncts-sel{width:100%;background:rgba(255,255,255,.05);color:#E6E9F2;font:inherit;font-size:13px;' +
      'border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:7px 9px;cursor:pointer}' +
    '.ncts-sel:focus{outline:2px solid #7C5CFF;outline-offset:1px}' +
    '.ncts-sz{display:flex;align-items:center;gap:9px}' +
    '.ncts-sz input[type=range]{flex:1 1 auto;min-width:0;accent-color:#7C5CFF;cursor:pointer}' +
    '.ncts-n{width:58px;flex:0 0 auto;background:rgba(255,255,255,.05);color:#E6E9F2;' +
      'border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:5px 6px;' +
      'font:600 12px/1 ui-monospace,monospace;text-align:center}' +
    '.ncts-hint{font:400 10px/1.4 system-ui;color:#6E768C}';

  function css() {
    if (document.getElementById('ncts-css')) return;
    var s = document.createElement('style');
    s.id = 'ncts-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var box = null;

  function host() {
    var ta = document.querySelector('textarea.input-field');
    if (!ta) return null;
    /* The panel body the typing box and the Add Text button share. */
    var p = ta.parentElement;
    while (p && !/space-y-3/.test(p.className || '')) p = p.parentElement;
    return p;
  }

  function build() {
    var h = host();
    if (!h) { box = null; return; }
    if (box && box.parentNode === h) return;    /* already in place */
    css();

    var r = remembered();
    box = document.createElement('div');
    box.className = 'ncts';

    var l1 = document.createElement('div');
    l1.className = 'ncts-lab';
    l1.textContent = 'Font';
    box.appendChild(l1);

    var sel = document.createElement('select');
    sel.className = 'ncts-sel';
    sel.setAttribute('aria-label', 'Font');
    FONTS.forEach(function (f) {
      var o = document.createElement('option');
      o.value = f[1];
      o.textContent = f[0];
      /* Each name drawn in its own face, so the list is the sample. */
      o.style.fontFamily = f[1];
      sel.appendChild(o);
    });
    sel.value = r.family;
    if (!sel.value) sel.value = FONTS[0][1];
    sel.onchange = function () {
      sel.style.fontFamily = sel.value;
      apply({ family: sel.value });
    };
    sel.style.fontFamily = sel.value;
    box.appendChild(sel);

    var l2 = document.createElement('div');
    l2.className = 'ncts-lab';
    l2.textContent = 'Size';
    box.appendChild(l2);

    var row = document.createElement('div');
    row.className = 'ncts-sz';
    var rng = document.createElement('input');
    rng.type = 'range';
    rng.min = String(MIN);
    rng.max = String(MAX);
    rng.step = '1';
    rng.value = String(clamp(r.size));
    rng.setAttribute('aria-label', 'Text size');
    var num = document.createElement('input');
    num.type = 'number';
    num.className = 'ncts-n';
    num.min = String(MIN);
    num.max = String(MAX);
    num.value = rng.value;
    num.setAttribute('aria-label', 'Text size, 1 to 100');

    function setSize(v, from) {
      var n = clamp(v);
      if (from !== 'rng') rng.value = String(n);
      if (from !== 'num') num.value = String(n);
      apply({ size: n });
    }
    rng.oninput = function () { setSize(rng.value, 'rng'); };
    /* change, not input: typing "5" on the way to "50" would otherwise apply
       5 and then fight the caret. */
    num.onchange = function () { setSize(num.value, 'num'); };
    num.onblur = function () { num.value = String(clamp(num.value)); };

    row.appendChild(rng);
    row.appendChild(num);
    box.appendChild(row);

    var hint = document.createElement('div');
    hint.className = 'ncts-hint';
    hint.textContent = 'Applies to the selected text. With nothing selected, the next text you add takes these.';
    box.appendChild(hint);

    h.appendChild(box);
  }

  /* Follow the selection: picking a text clip should show ITS font and size,
     not the last thing that was typed into these boxes. */
  var lastShown = null;
  function sync() {
    if (!box || !box.parentNode) return;
    var c = selectedText();
    var key = c ? c.id : null;
    if (key === lastShown) return;
    lastShown = key;
    if (!c || !c.text) return;
    var sel = box.querySelector('.ncts-sel');
    var rng = box.querySelector('input[type=range]');
    var num = box.querySelector('.ncts-n');
    if (c.text.fontFamily && sel) {
      /* Only if it is one this list offers — a preset may have set something
         else, and silently relabelling it would be a lie about what is on the
         clip. The size still syncs either way. */
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === c.text.fontFamily) {
          sel.value = c.text.fontFamily;
          sel.style.fontFamily = sel.value;
          break;
        }
      }
    }
    if (typeof c.text.fontSize === 'number' && rng && num) {
      var n = clamp(c.text.fontSize);
      rng.value = String(n);
      num.value = String(n);
    }
  }

  /* Newly added text takes the remembered font and size. The bundle writes
     its own defaults when the clip is created, so this runs just after and
     only for a clip that has not been styled by hand yet. */
  var seen = {};
  function dressNew() {
    var st = state();
    if (!st) return;
    var r = remembered();
    for (var i = 0; i < st.clips.length; i++) {
      var c = st.clips[i];
      if (c.kind !== 'text' || seen[c.id]) continue;
      seen[c.id] = true;
      if (!c.text) continue;
      var want = {};
      if (r.family && c.text.fontFamily !== r.family) want.fontFamily = r.family;
      if (r.size && c.text.fontSize !== r.size) want.fontSize = clamp(r.size);
      if (!want.fontFamily && !want.fontSize) continue;
      try { st.updateClipText(c.id, want); } catch (e) {}
    }
  }

  function start() {
    var tries = 0;
    (function wait() {
      if (state()) {
        try { store().subscribe(function () { build(); sync(); dressNew(); }); } catch (e) {}
        /* The Text panel is mounted and unmounted by the rail, which is React
           work the store never hears about. */
        setInterval(function () { build(); sync(); }, 450);
        build();
        return;
      }
      if (++tries > 160) return;
      setTimeout(wait, 250);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_TEXT_STYLE = {
    FONTS: FONTS,
    get: remembered,
    apply: apply,
    build: build,
    mounted: function () { return !!(box && box.parentNode); }
  };
})();
