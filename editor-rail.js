/* NOVACLIP — THE TOOLS GO WHERE PEOPLE LOOK FOR THEM
 * ===========================================================================
 * Five tools used to float as pills across the bottom of the editor, on top
 * of the preview. Where each one belongs, as asked:
 *
 *     FX library  ->  the rail's existing TRANSITIONS item. Not a sixth
 *                     entry beside it: the bundle's Transitions panel lists
 *                     26 and the FX library lists 82 including those 26,
 *                     so two rail items would be the same tool twice with
 *                     one of them worse. Clicking Transitions opens the
 *                     bigger one.
 *     Looks       ->  its own rail item
 *     Captions    ->  its own rail item
 *     Reframe     ->  its own rail item
 *     Beats       ->  the strip above the timeline, as an icon. It is the
 *                     only one of the five that acts ON the timeline rather
 *                     than on a clip's appearance, and it belongs next to it.
 *
 * And the timeline's "+ Video / + Audio / + Text" row goes: it duplicated
 * Media, Audio and Text, which are rail items with whole panels.
 *
 * ---------------------------------------------------------------------------
 * TWO THINGS THE FIRST VERSION GOT WRONG, BOTH VISIBLE ON SCREEN
 * ---------------------------------------------------------------------------
 * ONE. build() opened with `if (nav.querySelector('.ncrail-i')) return;` —
 * meaning: if ANY of my items exist, assume they all do. The five pills are
 * created by five different files on five different timers, so the first
 * build caught the three that had appeared and then returned early for ever.
 * Looks and the FX library never got a rail item and never got hidden, so
 * they carried on floating over the media panel while the others moved. Now
 * each tool is checked and placed on its own, and a tool that arrives late
 * is picked up on the next pass.
 *
 * TWO. IT MADE THE EDITOR LAG. Even debounced to one run per frame, build()
 * did full-document querySelectorAll scans every single frame for as long as
 * anything on the page was changing — which, in an editor with a playing
 * preview, is always. The work now stops completely once everything is
 * placed: `done` is only cleared when React actually removes the rail, so a
 * settled editor pays one cheap containment check per frame instead of six
 * document-wide scans.
 * ===========================================================================
 */
(function () {
  'use strict';
  if (window.NC_RAIL) return;

  /* Rail items, in the order they read down the column. */
  var TOOLS = [
    { sel: '.nclk-btn',  label: 'Looks',    key: 'ui_rail_looks',
      icon: 'M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4h-1a4 4 0 0 1-4-4V3z' },
    { sel: '.nccap-btn', label: 'Captions', key: 'ui_rail_cc',
      icon: 'M3 5h18v14H3zM7 10h4M7 14h7M15 10h2' },
    { sel: '.ncrf-btn',  label: 'Reframe',  key: 'ui_rail_reframe',
      icon: 'M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4' }
  ];
  /* Not rail items: one rides the Transitions entry, one rides the timeline. */
  var FX_SEL = '.nctr-btn';
  var BEAT_SEL = '.ncbeat-btn';
  /* Every pill this file takes over, so none is left floating. */
  var ALL = TOOLS.map(function (t) { return t.sel; }).concat([FX_SEL, BEAT_SEL]);

  var CSS = [
    '.ncrail-i{color:#8B93AD;cursor:pointer;border:0;background:none}',
    '.ncrail-i:hover{background:rgba(255,255,255,.06);color:#E6E9F2}',
    '.ncrail-i.on{background:rgba(124,92,255,.16);color:#C4B5FD}',
    '.ncrail-i span.lbl{font:600 9px/1.1 system-ui;text-align:center}',
    '.ncrail-i svg{width:20px;height:20px;stroke:currentColor;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.ncrail-sep{width:26px;height:1px;background:rgba(255,255,255,.12);',
      'margin:5px 0 3px;flex:0 0 auto}',
    /* Beats, on the timeline strip. Sized to the row it joins rather than to
       the rail, so it reads as one of the timeline's own controls. */
    '.ncbeat-tl{display:inline-flex;align-items:center;gap:6px;cursor:pointer;',
      'padding:4px 9px;border-radius:8px;font:600 11px/1 system-ui;',
      'color:#A9F0C8;background:rgba(52,211,153,.14);',
      'border:1px solid rgba(52,211,153,.4)}',
    '.ncbeat-tl:hover{background:rgba(52,211,153,.26);color:#D6FFEA}',
    '.ncbeat-tl svg{width:14px;height:14px;stroke:currentColor;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
  ].join('');

  function css() {
    if (document.getElementById('ncrail-css')) return;
    var s = document.createElement('style');
    s.id = 'ncrail-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function phrase(key, fallback) {
    try {
      if (typeof window.tr === 'function') {
        var t = window.tr(key);
        if (t && t !== key) return t;
      }
    } catch (e) {}
    return fallback;
  }

  function svgOf(pill, d) {
    try {
      var got = pill && pill.querySelector('svg');
      if (got) { var c = got.cloneNode(true); c.removeAttribute('class'); return c; }
    } catch (e) {}
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); s.appendChild(p);
    return s;
  }

  /* INLINE, with !important. editor-layout.js positions these with
     b.style.setProperty('left', x, 'important'), and inline !important beats
     stylesheet !important — a rule in CSS loses silently, which this repo has
     already been caught by once. display:none, because a programmatic
     .click() still works through it and that is all this file needs. */
  function hidePills() {
    for (var i = 0; i < ALL.length; i++) {
      var el = document.querySelector(ALL[i]);
      if (!el || el.getAttribute('data-ncrail-hidden')) continue;
      el.setAttribute('data-ncrail-hidden', '1');
      el.style.setProperty('display', 'none', 'important');
    }
  }

  function hideAdders() {
    var b = document.querySelectorAll('button.btn-ghost');
    for (var i = 0; i < b.length; i++) {
      var el = b[i];
      if (el.getAttribute('data-ncrail-gone')) continue;
      if (!/^\+?\s*(Video|Audio|Text)$/i.test((el.textContent || '').trim())) continue;
      el.setAttribute('data-ncrail-gone', '1');
      el.style.setProperty('display', 'none', 'important');
    }
  }

  /* ---- the FX library rides the Transitions rail item -------------------- */
  function bindTransitions(nav) {
    var btns = nav.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.classList.contains('ncrail-i')) continue;
      if (b.getAttribute('data-ncfx-bound')) return true;
      var txt = (b.textContent || '').trim();
      if (txt !== 'Transitions' && txt !== phrase('transitions', 'Transitions')) continue;
      b.setAttribute('data-ncfx-bound', '1');
      b.title = 'Every transition and effect, running';
      /* Capture phase, and the bundle's own handler is stopped: its panel
         lists 26 of the 82 this one has, so letting both run would open the
         smaller one behind the bigger one. */
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var pill = document.querySelector(FX_SEL);
        if (pill) pill.click();
        mark();
      }, true);
      return true;
    }
    return false;
  }

  /* ---- Beats goes on the timeline strip ---------------------------------- */
  function placeBeats() {
    if (document.querySelector('.ncbeat-tl')) return true;
    var pill = document.querySelector(BEAT_SEL);
    if (!pill) return false;
    /* The strip that held + Video / + Audio / + Text. Found by one of those
       buttons rather than by its Tailwind classes, which a rebuild renumbers. */
    var host = null;
    var gone = document.querySelector('button[data-ncrail-gone]');
    if (gone) host = gone.parentElement;
    if (!host) {
      var snap = [].slice.call(document.querySelectorAll('button'))
        .filter(function (b) { return (b.textContent || '').trim() === 'Snap'; })[0];
      if (snap) host = snap.parentElement;
    }
    if (!host) return false;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ncbeat-tl';
    b.title = pill.title || 'Find the beat and cut to it';
    b.appendChild(svgOf(pill, 'M3 12h3l2-7 3 14 3-10 2 3h5'));
    var s = document.createElement('span');
    s.textContent = phrase('ui_rail_beats', 'Beats');
    b.appendChild(s);
    b.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      var live = document.querySelector(BEAT_SEL);
      if (live) live.click();
    };
    host.appendChild(b);
    return true;
  }

  /* ---- the rail ---------------------------------------------------------- */
  function railItem(nav, cls, tool) {
    var pill = document.querySelector(tool.sel);
    if (!pill) return false;                   /* its file has not loaded yet */
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls + ' ncrail-i';
    b.setAttribute('data-ncrail', tool.sel);
    b.title = pill.title || tool.label;
    b.appendChild(svgOf(pill, tool.icon));
    var lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = phrase(tool.key, tool.label);
    b.appendChild(lbl);
    b.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      var live = document.querySelector(tool.sel);
      if (live) live.click();
      mark();
    };
    nav.appendChild(b);
    return true;
  }

  var done = false;

  function build() {
    /* The cheap check first, and it is the one that runs on almost every
       frame once the editor has settled: one query, and out. */
    var nav = document.querySelector('#root nav');
    if (!nav) { done = false; return false; }
    if (done && nav.querySelector('.ncrail-i')) return true;

    css();
    var model = nav.querySelector('button:not(.ncrail-i)');
    var cls = model ? model.className.replace(/bg-brand-\S+|text-brand-\S+/g, '').trim()
                    : 'group relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-all';

    if (!nav.querySelector('.ncrail-sep')) {
      var sep = document.createElement('div');
      sep.className = 'ncrail-sep';
      nav.appendChild(sep);
    }

    /* EACH TOOL ON ITS OWN. The five pills are made by five files on five
       timers; assuming that one existing means all exist is what left Looks
       and the FX library floating last time. */
    var placed = 0, want = TOOLS.length;
    for (var i = 0; i < TOOLS.length; i++) {
      var t = TOOLS[i];
      if (nav.querySelector('[data-ncrail="' + t.sel + '"]')) { placed++; continue; }
      if (railItem(nav, cls, t)) placed++;
    }

    var fxOk = bindTransitions(nav);
    var beatOk = placeBeats();
    hideAdders();
    hidePills();

    /* Only call it finished when every piece is actually in place, so a file
       that loads late still gets picked up. */
    done = (placed === want) && fxOk && beatOk;
    window.NC_RAIL.placed = placed;
    window.NC_RAIL.done = done;
    return done;
  }

  function mark() {
    setTimeout(function () {
      var open = {
        '.nclk-btn':  !!document.querySelector('.nclk'),
        '.nccap-btn': !!document.querySelector('.nccap'),
        '.ncrf-btn':  !!document.querySelector('.ncrf')
      };
      var items = document.querySelectorAll('.ncrail-i');
      for (var i = 0; i < items.length; i++) {
        var s = items[i].getAttribute('data-ncrail');
        if (open[s]) items[i].classList.add('on'); else items[i].classList.remove('on');
      }
    }, 80);
  }

  window.NC_RAIL = { build: build, mark: mark, placed: 0, done: false };

  /* One run per frame at most, and a run is nearly free once `done`. */
  var queued = 0;
  function schedule() {
    if (queued) return;
    queued = requestAnimationFrame(function () { queued = 0; build(); });
  }

  try {
    var mo = new MutationObserver(schedule);
    var start = function () {
      mo.observe(document.body, { childList: true, subtree: true });
      schedule();
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  } catch (e) {}

  /* A floor, for the pills that appear after the last mutation. Stops as soon
     as everything is placed rather than running for a fixed count. */
  var tries = 0;
  var t = setInterval(function () {
    if (build() || ++tries > 120) clearInterval(t);
  }, 250);

  window.addEventListener('nc-lang', function () {
    var old = document.querySelectorAll('.ncrail-i,.ncrail-sep,.ncbeat-tl');
    for (var i = 0; i < old.length; i++) old[i].remove();
    done = false;
    schedule();
  });
})();
