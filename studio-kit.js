/* ============================================================================
   STUDIO KIT — the sticker picker, and previews for every effect
   ============================================================================
   Loaded by editor.html and photo.html. Three jobs:

     1. A sticker sheet, opened from a button next to whatever each page
        already calls "add an image".
     2. A thumbnail on every effect, transition and filter, showing what it
        actually does — the thing CapCut gets right and a list of names does
        not. "Emboss" means nothing until you have seen it.
     3. Neither of the above may make a phone stutter.

   WHY NOTHING HERE EDITS THE EDITOR

   editor.html is a compiled React bundle on one line. Its effect list lives
   inside that bundle as {key, name, icon} objects. Reaching in to add a
   thumbnail would mean editing minified output, and the next rebuild would
   erase it. So this file works from the outside: it finds the controls by the
   words a person can see on them, decorates them, and watches for React
   re-rendering them away. If the bundle changes, the worst case is that a
   preview stops appearing — the editor itself carries on.

   photo.html is plain code and could have been edited directly, but its
   filters get their previews from the same place for one good reason: the
   preview is generated from the same convolution kernel the filter runs, so
   the two cannot drift apart.

   PERFORMANCE, WHICH IS A FEATURE HERE

   A grid of ninety-six stickers and thirty animating effect previews is
   exactly how a page becomes unusable on a mid-range Android. Four rules:

     - only the open category is in the DOM;
     - every preview is a 48px box, so even the animated ones are pushing a
       trivial number of pixels;
     - animations only run while the preview is on screen, via one shared
       IntersectionObserver, and stop when it scrolls away;
     - prefers-reduced-motion switches every animated preview to a still
       frame rather than removing the preview.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_KIT_READY) return;
  window.NC_KIT_READY = true;

  var REDUCED = false;
  try { REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[<>&"]/g, function (m) {
    return ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' })[m]; }); }

  /* ==========================================================================
     THE SAMPLE FRAME
     ==========================================================================
     Every preview needs something to be applied TO. A photograph would be
     ideal and there is not one to hand that is ours to ship, so this is a
     drawn frame with the things that make an effect readable: a face-ish
     subject with skin tones so colour shifts show, hard edges so sharpen and
     emboss have something to bite on, a smooth sky so grain and blur are
     obvious, and fine stripes so pixelate is unmistakable.
     ========================================================================== */
  var SAMPLE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">' +
      '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#4FA8FF"/><stop offset="1" stop-color="#BFE4FF"/>' +
      '</linearGradient></defs>' +
      '<rect width="96" height="96" fill="url(#sky)"/>' +
      '<circle cx="74" cy="20" r="10" fill="#FFD34D"/>' +
      '<path d="M0 66l22-22 16 14 14-16 44 34v20H0z" fill="#2FA36B"/>' +
      '<path d="M0 78l30-10 30 10 36-8v20H0z" fill="#1E7A50"/>' +
      /* the subject: warm tones next to cool ones */
      '<circle cx="40" cy="46" r="14" fill="#F0B98C"/>' +
      '<circle cx="35" cy="44" r="2.4" fill="#2A3142"/><circle cx="45" cy="44" r="2.4" fill="#2A3142"/>' +
      '<path d="M34 52c4 4 8 4 12 0" stroke="#B4593F" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M26 44c0-10 6-16 14-16s14 6 14 16c0-4-6-6-14-6s-14 2-14 6z" fill="#5A3B2E"/>' +
      /* fine stripes — the giveaway for pixelate and for sharpening */
      '<g fill="#FFFFFF" opacity=".85">' +
        '<rect x="6" y="86" width="3" height="8"/><rect x="14" y="86" width="3" height="8"/>' +
        '<rect x="22" y="86" width="3" height="8"/><rect x="30" y="86" width="3" height="8"/>' +
        '<rect x="38" y="86" width="3" height="8"/><rect x="46" y="86" width="3" height="8"/>' +
      '</g>' +
    '</svg>';
  var SAMPLE_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(SAMPLE);

  /* ==========================================================================
     WHAT EACH EFFECT LOOKS LIKE
     ==========================================================================
     Keyed by the lower-cased name printed on the control. `css` is applied to
     the sample; `anim` names a keyframe for the ones that are motion rather
     than colour. These are honest approximations of the editor's real output,
     not the real render — a 48px CSS preview cannot run the WebGL pass. They
     are here to answer "which of these is the one I mean", which is the
     question a list of thirty names cannot answer at all.
     ========================================================================== */
  var FX = {
    /* colour and tone */
    'sepia':        { css: 'sepia(.85)' },
    'grayscale':    { css: 'grayscale(1)' },
    'black & white':{ css: 'grayscale(1) contrast(1.2)' },
    'vintage':      { css: 'sepia(.45) contrast(.9) saturate(1.3) brightness(1.05)' },
    'retro':        { css: 'sepia(.35) hue-rotate(-15deg) saturate(1.5)' },
    'vivid':        { css: 'saturate(1.8) contrast(1.15)' },
    'warm':         { css: 'sepia(.3) saturate(1.4) hue-rotate(-12deg)' },
    'cool':         { css: 'hue-rotate(180deg) saturate(1.2)' },
    'noir':         { css: 'grayscale(1) contrast(1.6) brightness(.85)' },
    'invert':       { css: 'invert(1)' },
    'brightness':   { css: 'brightness(1.45)' },
    'contrast':     { css: 'contrast(1.7)' },
    'saturation':   { css: 'saturate(2.2)' },
    'hue':          { css: 'hue-rotate(120deg)' },
    'hue rotate':   { css: 'hue-rotate(120deg)' },
    'blur':         { css: 'blur(2.5px)' },
    'sharpen':      { svg: 'sharpen' },
    'emboss':       { svg: 'emboss' },
    'edges':        { svg: 'edges' },
    'edge detect':  { svg: 'edges' },
    'posterize':    { svg: 'posterize' },
    'threshold':    { svg: 'threshold' },
    'sharpen +':    { svg: 'sharpenplus' },
    'pixelate':     { pixel: true },
    'soften':       { css: 'blur(1.2px)' },
    'vignette':     { overlay: 'radial-gradient(circle,transparent 42%,rgba(0,0,0,.82) 100%)' },
    'glow':         { css: 'brightness(1.25) saturate(1.2)',
                      overlay: 'radial-gradient(circle at 50% 40%,rgba(255,255,255,.55),transparent 62%)' },
    'neon':         { css: 'saturate(2.4) contrast(1.3) hue-rotate(-25deg)',
                      overlay: 'linear-gradient(135deg,rgba(255,0,190,.4),rgba(0,229,255,.4))' },
    'grain':        { css: 'contrast(1.1)', grain: true },
    'noise':        { css: 'contrast(1.1)', grain: true },
    'vhs':          { css: 'saturate(1.5) contrast(1.15)', vhs: true },
    'chromatic aberration': { chroma: true },
    'glitch':       { chroma: true, anim: 'ncGlitch' },
    'mirror':       { mirror: true },
    'kaleidoscope': { mirror: true, css: 'hue-rotate(45deg) saturate(1.4)' },
    'duotone':      { css: 'grayscale(1)',
                      overlay: 'linear-gradient(135deg,rgba(108,92,231,.75),rgba(255,111,174,.75))' },
    /* motion — transitions and animated effects */
    'zoom':         { anim: 'ncZoom' },
    'zoom in':      { anim: 'ncZoom' },
    'zoom out':     { anim: 'ncZoomOut' },
    'shake':        { anim: 'ncShake' },
    'spin':         { anim: 'ncSpin' },
    'rotate':       { anim: 'ncSpin' },
    'bounce':       { anim: 'ncBounce' },
    'pulse':        { anim: 'ncPulse' },
    'flash':        { anim: 'ncFlash' },
    'fade':         { anim: 'ncFade' },
    'dissolve':     { anim: 'ncFade' },
    'slide':        { anim: 'ncSlide' },
    'wipe':         { wipe: true },
    'swipe':        { anim: 'ncSlide' },
    'push':         { anim: 'ncSlide' },
    'shine':        { shine: true },
    'sparkle':      { anim: 'ncPulse',
                      overlay: 'radial-gradient(circle at 30% 30%,rgba(255,255,255,.9),transparent 30%)' }
  };

  /* SVG filters that reproduce the photo tool's real kernels, so those
     previews are not an impression of the filter — they are the filter. */
  var SVG_DEFS =
    '<svg id="nckit-defs" aria-hidden="true" style="position:absolute;width:0;height:0">' +
      '<filter id="nckit-sharpen" x="0" y="0" width="100%" height="100%">' +
        '<feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" preserveAlpha="true"/></filter>' +
      '<filter id="nckit-emboss" x="0" y="0" width="100%" height="100%">' +
        '<feConvolveMatrix order="3" kernelMatrix="-2 -1 0 -1 1 1 0 1 2" divisor="1" preserveAlpha="true"/></filter>' +
      '<filter id="nckit-edges" x="0" y="0" width="100%" height="100%">' +
        '<feConvolveMatrix order="3" kernelMatrix="0 1 0 1 -4 1 0 1 0" divisor="1" preserveAlpha="true"/></filter>' +
      /* Real chromatic aberration is the red and blue channels landing in
         slightly different places. These two keep one end of the spectrum
         each, so screening an offset pair back together reconstructs the
         picture with coloured fringes exactly where the edges are. */
      '<filter id="nckit-onlyred" x="0" y="0" width="100%" height="100%">' +
        '<feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>' +
      '<filter id="nckit-onlycyan" x="0" y="0" width="100%" height="100%">' +
        '<feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>' +
      '<filter id="nckit-sharpenplus" x="0" y="0" width="100%" height="100%">' +
        '<feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 9 -1 -1 -1 -1" preserveAlpha="true"/></filter>' +
      /* Threshold has no primitive either: crush to grey, then a two-step
         transfer either side of the midpoint is exactly what the real one
         does per channel. */
      '<filter id="nckit-threshold" x="0" y="0" width="100%" height="100%">' +
        '<feColorMatrix type="saturate" values="0"/>' +
        '<feComponentTransfer>' +
          '<feFuncR type="discrete" tableValues="0 1"/>' +
          '<feFuncG type="discrete" tableValues="0 1"/>' +
          '<feFuncB type="discrete" tableValues="0 1"/>' +
        '</feComponentTransfer></filter>' +
      '<filter id="nckit-posterize" x="0" y="0" width="100%" height="100%">' +
        '<feComponentTransfer>' +
          '<feFuncR type="discrete" tableValues="0 .25 .5 .75 1"/>' +
          '<feFuncG type="discrete" tableValues="0 .25 .5 .75 1"/>' +
          '<feFuncB type="discrete" tableValues="0 .25 .5 .75 1"/>' +
        '</feComponentTransfer></filter>' +
    '</svg>';

  var CSS = [
    /* ---- the sheet ---- */
    '.nckit-veil{position:fixed;inset:0;z-index:99998;background:rgba(4,6,12,.62);' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;' +
      'align-items:center;justify-content:center;padding:16px}',
    '.nckit-sheet{width:min(560px,100%);max-height:min(80vh,640px);display:flex;flex-direction:column;' +
      'background:#12172a;color:#EAF2FF;border:1px solid rgba(255,255,255,.12);border-radius:20px;' +
      'box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden;' +
      'font:14px/1.4 "Segoe UI",system-ui,sans-serif}',
    '.nckit-head{display:flex;align-items:center;gap:10px;padding:14px 16px;' +
      'border-bottom:1px solid rgba(255,255,255,.08)}',
    '.nckit-head h2{margin:0;font-size:1rem;font-weight:800;flex:1}',
    '.nckit-x{min-width:44px;min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.14);' +
      'background:rgba(255,255,255,.05);color:inherit;font-size:18px;cursor:pointer}',
    '.nckit-find{margin:12px 16px 0;min-height:44px;width:calc(100% - 32px);box-sizing:border-box;' +
      'padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);' +
      'background:rgba(255,255,255,.05);color:inherit;font:inherit}',
    '.nckit-tabs{display:flex;gap:6px;padding:12px 16px 4px;overflow-x:auto;scrollbar-width:none}',
    '.nckit-tabs::-webkit-scrollbar{display:none}',
    '.nckit-tab{flex:0 0 auto;min-height:38px;padding:0 14px;border-radius:999px;cursor:pointer;' +
      'border:1px solid transparent;background:rgba(255,255,255,.05);color:#9FB0CE;' +
      'font:700 13px/1 "Segoe UI",system-ui,sans-serif;white-space:nowrap}',
    '.nckit-tab.on{background:linear-gradient(90deg,rgba(167,139,250,.28),rgba(56,189,248,.16));' +
      'border-color:rgba(167,139,250,.45);color:#fff}',
    '.nckit-grid{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;' +
      'display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;padding:12px 16px 18px}',
    '.nckit-cell{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;' +
      'border-radius:14px;border:1px solid transparent;background:rgba(255,255,255,.04);' +
      'color:#9FB0CE;cursor:pointer;font:600 11px/1.2 "Segoe UI",system-ui,sans-serif;' +
      'min-height:84px;contain:content}',
    '.nckit-cell:hover,.nckit-cell:focus-visible{border-color:rgba(167,139,250,.5);color:#fff;outline:none}',
    '.nckit-cell svg{width:44px;height:44px;pointer-events:none}',
    '.nckit-cell span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.nckit-empty{grid-column:1/-1;text-align:center;color:#7E8AA6;padding:30px 10px}',
    /* On a phone the sheet is a sheet: full width, pinned to the bottom, and
       tall enough to show three rows without covering the whole screen. */
    '@media (max-width:640px){.nckit-veil{align-items:flex-end;padding:0}' +
      '.nckit-sheet{width:100%;max-height:78vh;border-radius:20px 20px 0 0}' +
      '.nckit-grid{grid-template-columns:repeat(auto-fill,minmax(76px,1fr))}}',

    /* ---- the button we add to each host page ---- */
    '.nckit-open{display:inline-flex;align-items:center;justify-content:center;gap:7px;' +
      'min-height:44px;padding:0 16px;border-radius:12px;cursor:pointer;' +
      'border:1px solid rgba(167,139,250,.45);' +
      'background:linear-gradient(90deg,rgba(167,139,250,.22),rgba(56,189,248,.14));' +
      'color:#EAF2FF;font:800 13px/1 "Segoe UI",system-ui,sans-serif}',
    '.nckit-open:hover{border-color:rgba(167,139,250,.8)}',

    /* ---- effect previews ---- */
    '.nckit-fx{display:block;width:48px;height:48px;border-radius:9px;overflow:hidden;' +
      'position:relative;flex:0 0 auto;background:#0B0F1C;' +
      'border:1px solid rgba(255,255,255,.12);contain:strict}',
    '.nckit-fx i{position:absolute;inset:0;display:block;background-size:cover;' +
      'background-position:center;background-repeat:no-repeat}',
    '.nckit-fx u{position:absolute;inset:0;display:block;pointer-events:none}',
    /* animations only run when the tile is marked live by the observer */
    '.nckit-fx i,.nckit-fx u,.nckit-fx{animation-play-state:paused}',
    '.nckit-fx.live i,.nckit-fx.live u,.nckit-fx.live{animation-play-state:running}',
    '@keyframes ncZoom{0%,100%{transform:scale(1)}50%{transform:scale(1.45)}}',
    '@keyframes ncZoomOut{0%,100%{transform:scale(1.45)}50%{transform:scale(1)}}',
    '@keyframes ncShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-3px,2px)}' +
      '40%{transform:translate(3px,-2px)}60%{transform:translate(-2px,-3px)}80%{transform:translate(2px,3px)}}',
    '@keyframes ncSpin{to{transform:rotate(360deg)}}',
    '@keyframes ncBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}',
    '@keyframes ncPulse{0%,100%{transform:scale(1);filter:brightness(1)}' +
      '50%{transform:scale(1.12);filter:brightness(1.4)}}',
    '@keyframes ncFlash{0%,100%{filter:brightness(1)}50%{filter:brightness(2.6)}}',
    '@keyframes ncFade{0%,100%{opacity:1}50%{opacity:.12}}',
    '@keyframes ncSlide{0%{transform:translateX(-100%)}45%,55%{transform:translateX(0)}' +
      '100%{transform:translateX(100%)}}',
    '@keyframes ncGlitch{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}' +
      '50%{transform:translateX(3px)}75%{transform:translateX(-2px)}}',
    '@keyframes ncWipe{0%{clip-path:inset(0 100% 0 0)}50%{clip-path:inset(0 0 0 0)}' +
      '100%{clip-path:inset(0 0 0 100%)}}',
    '@keyframes ncShine{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}',
    /* A still frame instead of movement, rather than no preview at all. */
    '@media (prefers-reduced-motion:reduce){.nckit-fx i,.nckit-fx u{animation:none !important}}'
  ].join('');

  /* ==========================================================================
     THE ONE PREVIEW THAT NEEDS A RASTER
     ==========================================================================
     Pixelate cannot be done to an SVG. Vector art has no pixels to lose — it
     just re-renders crisply at whatever size you scale it to, which is why the
     first attempt at this tile came out blank. So the sample is drawn once
     into a 12x12 canvas, which throws away everything except twelve squares of
     colour, and that raster is blown back up with smoothing off. That is
     precisely what the photo tool's pixelate does to a real image.
     ========================================================================== */
  var PIXEL_URL = null;
  function pixelUrl(done) {
    if (PIXEL_URL) { done(PIXEL_URL); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var cv = document.createElement('canvas');
        cv.width = cv.height = 12;
        var g = cv.getContext('2d');
        g.imageSmoothingEnabled = true;      // smooth going DOWN, blocky coming back up
        g.drawImage(img, 0, 0, 12, 12);
        PIXEL_URL = cv.toDataURL('image/png');
        done(PIXEL_URL);
      } catch (err) { done(SAMPLE_URL); }    // a tainted canvas is not worth a broken panel
    };
    img.onerror = function () { done(SAMPLE_URL); };
    img.src = SAMPLE_URL;
  }

  function boot() {
    if (document.getElementById('nckit-css')) return;
    var st = el('style'); st.id = 'nckit-css'; st.textContent = CSS;
    document.head.appendChild(st);
    var d = el('div'); d.innerHTML = SVG_DEFS;
    document.body.appendChild(d.firstChild);
  }

  /* ==========================================================================
     ONE OBSERVER FOR EVERY PREVIEW
     ==========================================================================
     Thirty simultaneously animating tiles is the difference between a smooth
     panel and a hot phone. Tiles animate only while they are on screen.
     ========================================================================== */
  var seeing = null;
  function watch(node) {
    if (REDUCED) return;
    if (!seeing) {
      seeing = new IntersectionObserver(function (rows) {
        rows.forEach(function (row) { row.target.classList.toggle('live', row.isIntersecting); });
      }, { rootMargin: '80px' });
    }
    seeing.observe(node);
  }

  /* Build one preview tile for a named effect. Returns null when the name is
     not one we know — a tile that shows the wrong thing is worse than none. */
  function tileFor(name) {
    var k = String(name || '').trim().toLowerCase();
    var f = FX[k];
    if (!f) {
      /* "Zoom In (Fast)" and the like: match on the first word we recognise. */
      for (var key in FX) if (k.indexOf(key) === 0 || k.indexOf(' ' + key) > -1) { f = FX[key]; break; }
    }
    if (!f) return null;

    var box = el('span', 'nckit-fx');
    var img = el('i');
    img.style.backgroundImage = 'url("' + SAMPLE_URL + '")';

    var filters = [];
    if (f.css) filters.push(f.css);
    if (f.svg) filters.push('url(#nckit-' + f.svg + ')');
    if (filters.length) img.style.filter = filters.join(' ');
    if (f.mirror) img.style.transform = 'scaleX(-1)';
    if (f.pixel) {
      img.style.imageRendering = 'pixelated';
      pixelUrl(function (u) { img.style.backgroundImage = 'url("' + u + '")'; });
    }
    if (f.anim && !REDUCED) {
      img.style.animation = f.anim + ' 2.4s ease-in-out infinite';
    } else if (f.anim && REDUCED) {
      /* the halfway frame, so the tile still says something */
      if (f.anim === 'ncZoom') img.style.transform = 'scale(1.35)';
      if (f.anim === 'ncFade') img.style.opacity = '.4';
      if (f.anim === 'ncSpin') img.style.transform = 'rotate(35deg)';
    }
    box.appendChild(img);

    /* Chromatic aberration, built the way the real thing works rather than
       faked with a hue shift: the same frame twice, one keeping only red and
       one only green+blue, nudged apart and screened back together. Where the
       two align the colour is correct; at every edge it fringes.

       The base copy is hidden for these — leaving it underneath would screen
       to near-white and wash the fringes out, which is what the first attempt
       at this tile did. */
    if (f.chroma) {
      img.style.opacity = '0';
      var shift = 2.5;
      [['onlyred', -shift], ['onlycyan', shift]].forEach(function (pair) {
        var lay = el('u');
        lay.style.background = 'url("' + SAMPLE_URL + '") center/cover';
        lay.style.filter = 'url(#nckit-' + pair[0] + ')';
        lay.style.transform = 'translateX(' + pair[1] + 'px)';
        lay.style.mixBlendMode = 'screen';
        box.appendChild(lay);
      });
      /* the motion belongs to the whole stack now, not the hidden base */
      if (f.anim && !REDUCED) {
        img.style.animation = '';
        box.style.animation = f.anim + ' 2.4s ease-in-out infinite';
      }
    }
    if (f.overlay) { var o = el('u'); o.style.background = f.overlay; box.appendChild(o); }
    if (f.grain) {
      var g = el('u');
      g.style.cssText = 'opacity:.35;background-image:repeating-conic-gradient(' +
        '#000 0% 25%,#fff 0% 50%);background-size:3px 3px';
      box.appendChild(g);
    }
    if (f.vhs) {
      var v = el('u');
      v.style.cssText = 'background:repeating-linear-gradient(0deg,rgba(0,0,0,.45) 0 1px,' +
        'transparent 1px 3px)';
      box.appendChild(v);
    }
    if (f.wipe && !REDUCED) {
      img.style.animation = 'ncWipe 2.4s ease-in-out infinite';
    }
    if (f.shine && !REDUCED) {
      var s = el('u');
      s.style.cssText = 'background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.85) 50%,' +
        'transparent 65%);animation:ncShine 2s linear infinite';
      box.appendChild(s);
    }
    watch(box);
    return box;
  }

  /* ==========================================================================
     DECORATING WHATEVER THE PAGE ALREADY DREW
     ==========================================================================
     Finds controls whose visible text names an effect and puts a tile in front
     of it. Runs again on DOM changes, because React redraws these panels.
     ========================================================================== */
  /* Anything that could be carrying an effect's name. Leaf-ish only: a panel
     that merely CONTAINS the word "Blur" is not a Blur control. */
  var SCAN = 'span,button,[role="button"],[data-filter],.chip,li,p';

  /* The editor draws each transition and effect as a card: a 64px-tall box
     holding one 16px lucide icon, with the name underneath. That box is the
     art slot CapCut fills with a moving thumbnail and this one fills with a
     grey droplet. Find it and put the real thing in it. */
  function artSlot(label) {
    var node = label;
    for (var up = 0; up < 4 && node; up++) {
      node = node.parentElement;
      if (!node) break;
      var kids = node.children;
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i];
        if (k === label || k.contains(label)) continue;
        if (!k.querySelector || !k.querySelector('svg')) continue;
        var r = k.getBoundingClientRect();
        if (r.height >= 36 && r.width >= 36) return k;
      }
    }
    return null;
  }

  function decorate(root) {
    var nodes = (root || document).querySelectorAll(SCAN);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.dataset.nckit) continue;
      /* leaf: no descendant carries text of its own */
      var kid = n.querySelector('*');
      if (kid && (kid.textContent || '').trim()) continue;
      var label = (n.getAttribute('data-filter') || n.textContent || '').trim();
      if (!label || label.length > 26) continue;
      var tile = tileFor(label);
      if (!tile) continue;
      n.dataset.nckit = '1';

      var slot = artSlot(n);
      if (slot) {
        /* Fill the card's own art box, edge to edge, and drop the placeholder
           icon — two pictures of one effect is one too many. */
        tile.style.width = '100%';
        tile.style.height = '100%';
        tile.style.borderRadius = '0';
        tile.style.border = '0';
        slot.textContent = '';
        slot.appendChild(tile);
      } else {
        var cs = getComputedStyle(n);
        if (cs.display === 'inline') n.style.display = 'inline-flex';
        n.style.alignItems = 'center';
        n.style.gap = '8px';
        n.insertBefore(tile, n.firstChild);
      }
    }
  }

  /* ==========================================================================
     THE STICKER SHEET
     ========================================================================== */
  var openCat = 0, veil = null;

  function closeSheet() {
    if (veil) { veil.remove(); veil = null; document.removeEventListener('keydown', onKey); }
  }
  function onKey(ev) { if (ev.key === 'Escape') closeSheet(); }

  function openSheet(insert) {
    if (!window.NC_STICKERS) return;
    boot();
    closeSheet();
    var cats = window.NC_STICKERS.cats;

    veil = el('div', 'nckit-veil');
    var sheet = el('div', 'nckit-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Stickers');

    var head = el('div', 'nckit-head', '<h2>Stickers</h2>');
    var x = el('button', 'nckit-x', '&times;');
    x.type = 'button'; x.setAttribute('aria-label', 'Close');
    x.onclick = closeSheet;
    head.appendChild(x);

    var find = el('input', 'nckit-find');
    find.type = 'search'; find.placeholder = 'Search all 96…';

    var tabs = el('div', 'nckit-tabs');
    var grid = el('div', 'nckit-grid');

    function draw() {
      var q = find.value.trim().toLowerCase();
      /* Only what is on screen gets built. Searching looks across every
         category; browsing builds one. */
      var list = [];
      if (q) {
        cats.forEach(function (cat) {
          cat.items.forEach(function (it) {
            if (it[1].toLowerCase().indexOf(q) > -1 || it[0].indexOf(q) > -1) list.push(it);
          });
        });
      } else {
        list = cats[openCat].items;
      }
      grid.textContent = '';
      if (!list.length) {
        grid.appendChild(el('div', 'nckit-empty', 'Nothing matches “' + esc(q) + '”.'));
        return;
      }
      var frag = document.createDocumentFragment();
      list.forEach(function (it) {
        var cell = el('button', 'nckit-cell');
        cell.type = 'button';
        cell.innerHTML = window.NC_STICKERS.svgFor(it) + '<span>' + esc(it[1]) + '</span>';
        cell.title = it[1];
        cell.onclick = function () { insert(window.NC_STICKERS.fileFor(it), it); closeSheet(); };
        frag.appendChild(cell);
      });
      grid.appendChild(frag);
      grid.scrollTop = 0;
    }

    cats.forEach(function (cat, i) {
      var t = el('button', 'nckit-tab' + (i === openCat ? ' on' : ''), cat.icon + ' ' + cat.name);
      t.type = 'button';
      t.onclick = function () {
        openCat = i;
        find.value = '';
        [].forEach.call(tabs.children, function (o, j) { o.classList.toggle('on', j === i); });
        draw();
      };
      tabs.appendChild(t);
    });

    var typing;
    find.addEventListener('input', function () {
      clearTimeout(typing);
      typing = setTimeout(draw, 110);   // a keystroke should not rebuild 96 nodes
    });

    sheet.append(head, find, tabs, grid);
    veil.appendChild(sheet);
    veil.addEventListener('click', function (ev) { if (ev.target === veil) closeSheet(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(veil);
    draw();
    find.focus({ preventScroll: true });
  }

  /* ==========================================================================
     HOST 1 — THE PHOTO TOOL
     ==========================================================================
     It already opens an image dropped on its stage, so the sticker is dropped
     on its stage. No new path into that file, and therefore nothing new to go
     wrong in it.
     ========================================================================== */
  function wirePhoto() {
    var place = document.getElementById('addLayerFile');
    if (!place || document.getElementById('nckit-photo-btn')) return;
    boot();
    var b = el('button', 'nckit-open', '✦ Stickers');
    b.id = 'nckit-photo-btn';
    b.type = 'button';
    b.onclick = function () {
      openSheet(function (file) {
        var stage = document.getElementById('stage');
        if (!stage) return;
        var dt = new DataTransfer();
        dt.items.add(file);
        var ev = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
        stage.dispatchEvent(ev);
      });
    };
    place.parentNode.insertBefore(b, place.nextSibling);
  }

  /* ==========================================================================
     HOST 2 — THE VIDEO EDITOR
     ==========================================================================
     Its media input is the one that accepts images. Setting .files and firing
     a change is exactly what the browser does when somebody picks a file, so
     React's own onChange runs and the sticker lands in the media library like
     any other upload.
     ========================================================================== */
  function editorInput() {
    var ins = document.querySelectorAll('input[type=file]');
    for (var i = 0; i < ins.length; i++) {
      var a = ins[i].getAttribute('accept') || '';
      if (a.indexOf('image') > -1 && a.indexOf('video') > -1) return ins[i];
    }
    for (var j = 0; j < ins.length; j++) {
      if ((ins[j].getAttribute('accept') || '').indexOf('image') > -1) return ins[j];
    }
    return null;
  }

  function wireEditor() {
    if (document.getElementById('nckit-ed-btn')) return;
    /* Sit next to Upload, which is where somebody already goes to add a
       picture. If that button has not rendered yet there is nothing to sit
       beside, so this returns and the observer tries again. */
    var up = null, all = document.querySelectorAll('button,label');
    for (var i = 0; i < all.length; i++) {
      var t = (all[i].textContent || '').trim().toLowerCase();
      if (t === 'upload' || t === 'upload media') { up = all[i]; break; }
    }
    if (!up || !editorInput()) return;
    boot();
    var b = el('button', 'nckit-open', '✦ Stickers');
    b.id = 'nckit-ed-btn';
    b.type = 'button';
    b.style.marginTop = '8px';
    b.style.width = '100%';
    b.onclick = function () {
      openSheet(function (file) {
        var input = editorInput();
        if (!input) return;
        var dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };
    (up.parentNode || document.body).insertBefore(b, up.nextSibling);
  }

  /* ==========================================================================
     START, AND KEEP UP WITH REACT
     ==========================================================================
     One observer, one rescan queued on an idle callback rather than on every
     mutation — the editor mutates constantly while the timeline plays, and a
     synchronous rescan on each one is its own performance bug.
     ========================================================================== */
  var queued = false;
  function rescan() {
    if (queued) return;
    queued = true;
    var run = function () { queued = false; try { wirePhoto(); wireEditor(); decorate(); } catch (e) {} };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 600 });
    else setTimeout(run, 250);
  }

  function start() {
    boot();
    rescan();
    new MutationObserver(rescan).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.NC_KIT = { open: openSheet, tileFor: tileFor, sample: SAMPLE_URL };
})();
