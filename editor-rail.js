/* NOVACLIP — THE FIVE TOOLS BELONG IN THE RAIL, NOT FLOATING OVER THE VIDEO
 * ===========================================================================
 * Asked for, with the preview circled: CC Captions, Beats, Reframe, Looks and
 * the FX library were five pills floating in a row across the bottom of the
 * editor, on top of the picture. They are tools, the editor already has a
 * column of tools down the left, and that column is where somebody looks for
 * one. The pills also sat over the preview, which is the one part of the
 * screen that should never have chrome on it.
 *
 * And the timeline's own "+ Video / + Audio / + Text" row goes, because it
 * duplicates the rail: Media, Text and Audio are already rail items that do
 * the same job with more room.
 *
 * HOW, WITHOUT TOUCHING THE BUNDLE
 * ---------------------------------------------------------------------------
 * The rail is React's, drawn from a list inside the compiled bundle, so no
 * sidecar can add an entry to it. What a sidecar CAN do is append a button to
 * the rail's own container with the bundle's own classes, which is what this
 * does — measured from a real rail button rather than guessed:
 *
 *     nav   flex w-16 shrink-0 flex-col items-center gap-1 ...
 *     item  group relative flex h-12 w-12 flex-col items-center
 *           justify-center gap-0.5 rounded-xl transition-all
 *
 * WHAT EACH ONE DOES WHEN CLICKED is click the original pill. Not a
 * reimplementation of five panels: captions.js, beats.js, reframe.js,
 * editor-looks.js and editor-trans.js each own theirs, and every one of them
 * has behaviour — history, phrase translation, store wiring — that a copy
 * would get subtly wrong. The pill is hidden, not removed, so its own file
 * keeps working exactly as written and this file only moves the handle.
 *
 * It re-runs on an observer because React rebuilds that nav whenever the
 * active panel changes, which would otherwise take the five buttons with it.
 * ===========================================================================
 */
(function () {
  'use strict';
  if (window.NC_RAIL) return;

  /* The five, in the order they should read down the rail: the two that
     change the whole clip's look first, then the three that add to it. */
  var TOOLS = [
    { sel: '.nctr-btn',  label: 'FX',       key: 'ui_rail_fx' },
    { sel: '.nclk-btn',  label: 'Looks',    key: 'ui_rail_looks' },
    { sel: '.nccap-btn', label: 'Captions', key: 'ui_rail_cc' },
    { sel: '.ncbeat-btn',label: 'Beats',    key: 'ui_rail_beats' },
    { sel: '.ncrf-btn',  label: 'Reframe',  key: 'ui_rail_reframe' }
  ];

  /* Fallback icons, used only when a pill has not been given one yet. The
     pills normally carry an .ncpill-i svg that editor-layout.js put there,
     and cloning that keeps the two in step: change the icon in one place and
     both the pill and the rail item follow. */
  var ICON = {
    '.nctr-btn':  'M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4',
    '.nclk-btn':  'M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4h-1a4 4 0 0 1-4-4V3z',
    '.nccap-btn': 'M3 5h18v14H3zM7 10h4M7 14h7M15 10h2',
    '.ncbeat-btn':'M3 12h3l2-7 3 14 3-10 2 3h5',
    '.ncrf-btn':  'M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4'
  };

  var CSS = [
    /* NOT hidden from here — see hidePills(). editor-layout.js positions
       these with inline !important, and inline !important beats a stylesheet
       !important, so a rule here loses. This repo learned that once already,
       on the pill-lift CSS that was dead for months. */
    /* Our rail items. The bundle's classes do the layout; this only adds the
       label size and the hover, which the bundle puts on its own items with
       a group-hover rule we cannot reuse from outside. */
    '.ncrail-i{color:#8B93AD;cursor:pointer;border:0;background:none}',
    '.ncrail-i:hover{background:rgba(255,255,255,.06);color:#E6E9F2}',
    '.ncrail-i.on{background:rgba(124,92,255,.16);color:#C4B5FD}',
    '.ncrail-i span.lbl{font:600 9px/1.1 system-ui;letter-spacing:.01em;text-align:center}',
    '.ncrail-i svg{width:20px;height:20px;stroke:currentColor;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    /* A hairline above the five, so they read as a group the editor gained
       rather than as more of the bundle's own list. */
    '.ncrail-sep{width:26px;height:1px;background:rgba(255,255,255,.12);margin:5px 0 3px;flex:0 0 auto}'
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

  function iconFor(tool, pill) {
    /* Prefer the pill's own svg, so the two never drift apart. */
    try {
      var got = pill && pill.querySelector('svg');
      if (got) {
        var c = got.cloneNode(true);
        c.removeAttribute('class');
        c.setAttribute('viewBox', got.getAttribute('viewBox') || '0 0 24 24');
        return c;
      }
    } catch (e) {}
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pth.setAttribute('d', ICON[tool.sel] || 'M4 6h16M4 12h16M4 18h10');
    svg.appendChild(pth);
    return svg;
  }

  /* ---- the timeline's duplicate add buttons ------------------------------
     "+ Video", "+ Audio" and "+ Text" in the strip above the timeline. The
     rail already has Media, Audio and Text, with a whole panel each instead
     of a button that drops an empty track. Matched by their own class AND
     their text, because `btn-ghost` alone also catches buttons elsewhere in
     the toolbar that should stay. */
  function hideAdders() {
    var n = 0;
    document.querySelectorAll('button.btn-ghost').forEach(function (b) {
      if (b.getAttribute('data-ncrail-gone')) return;
      var t = (b.textContent || '').trim();
      if (!/^\+?\s*(Video|Audio|Text)$/i.test(t)) return;
      b.setAttribute('data-ncrail-gone', '1');
      b.style.setProperty('display', 'none', 'important');
      n++;
    });
    return n;
  }

  /* ---- putting the pills away -------------------------------------------
     INLINE, with !important, because that is the only thing that outranks
     what editor-layout.js writes:

         b.style.setProperty('left', x + 'px', 'important')

     Inline !important beats stylesheet !important, so the obvious rule in
     CSS silently lost and all five pills stayed on screen — measured, not
     guessed: the first run of this put the rail items in place and left the
     pills floating exactly where they were. The same mistake is already
     recorded in this repo once, on a pill-lift rule that was dead for
     months, which is how I knew where to look.

     display:none rather than moving them off-screen, because a programmatic
     .click() still works on a display:none element and that is all this file
     needs from them. Their own files keep owning the panels. */
  function hidePills() {
    TOOLS.forEach(function (tool) {
      var el = document.querySelector(tool.sel);
      if (!el || el.getAttribute('data-ncrail-hidden')) return;
      el.setAttribute('data-ncrail-hidden', '1');
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function build() {
    var nav = document.querySelector('#root nav');
    if (!nav) return false;
    css();
    /* Already there and still attached? Nothing to do. React rebuilds this
       nav on every panel change, so this runs often and must be cheap. */
    if (nav.querySelector('.ncrail-i')) { hideAdders(); return true; }

    var model = nav.querySelector('button');
    var cls = model ? model.className.replace(/bg-brand-\S+|text-brand-\S+/g, '').trim()
                    : 'group relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-all';

    var sep = document.createElement('div');
    sep.className = 'ncrail-sep';
    nav.appendChild(sep);

    var made = 0;
    TOOLS.forEach(function (tool) {
      var pill = document.querySelector(tool.sel);
      if (!pill) return;                       /* that file has not loaded */
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls + ' ncrail-i';
      b.setAttribute('data-ncrail', tool.sel);
      b.title = pill.title || tool.label;
      b.appendChild(iconFor(tool, pill));
      var lbl = document.createElement('span');
      lbl.className = 'lbl';
      lbl.textContent = phrase(tool.key, tool.label);
      b.appendChild(lbl);
      b.onclick = function (e) {
        e.preventDefault(); e.stopPropagation();
        /* Click the real pill. Its own file owns the panel, the history and
           the translations; this is a handle, not a reimplementation. */
        var live = document.querySelector(tool.sel);
        if (live) live.click();
        mark();
      };
      nav.appendChild(b);
      made++;
    });
    hideAdders();
    hidePills();
    window.NC_RAIL.made = made;
    return made > 0;
  }

  /* Light the rail item whose panel is actually open, so the rail says where
     you are rather than just what you can press. */
  function mark() {
    setTimeout(function () {
      var open = {
        '.nctr-btn':  !!document.querySelector('.nctr'),
        '.nclk-btn':  !!document.querySelector('.nclk'),
        '.nccap-btn': !!document.querySelector('.nccap'),
        '.ncbeat-btn':!!document.querySelector('.ncbeat'),
        '.ncrf-btn':  !!document.querySelector('.ncrf')
      };
      document.querySelectorAll('.ncrail-i').forEach(function (b) {
        var s = b.getAttribute('data-ncrail');
        if (open[s]) b.classList.add('on'); else b.classList.remove('on');
      });
    }, 80);
  }

  window.NC_RAIL = { build: build, mark: mark, hideAdders: hideAdders, made: 0 };

  /* ---- DEBOUNCED, AND THAT IS NOT A NICETY -------------------------------
     The first version ran build() straight from the observer callback. Every
     call does full-document querySelectorAll scans — for the rail, for the
     pills, for the toolbar's add buttons — and React's initial render emits
     thousands of mutations. Thousands of whole-document scans, synchronously,
     before the page has finished parsing: the editor never reached
     DOMContentLoaded at all. Measured, by blocking this one script and
     watching the same page load in under a second.

     So the observer only ever SCHEDULES a build, one per frame at most, and
     several hundred mutations in the same tick collapse into a single run. */
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

  /* The pills are created on their own timers by five different files, so the
     rail is rebuilt for a while after load as each one appears. Through the
     same scheduler, so a tick and a mutation in the same frame are one run. */
  var tries = 0;
  var t = setInterval(function () {
    schedule();
    if (++tries > 100) clearInterval(t);
  }, 250);

  window.addEventListener('nc-lang', function () {
    document.querySelectorAll('.ncrail-i').forEach(function (b) { b.remove(); });
    document.querySelectorAll('.ncrail-sep').forEach(function (s) { s.remove(); });
    build();
  });
})();
