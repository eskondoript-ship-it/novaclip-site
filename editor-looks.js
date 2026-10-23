/* ============================================================================
   NOVACLIP — LOOKS: ONE PRESS, A WHOLE LOOK
   ============================================================================
   The editor has 36 effects, 15 colour controls, speed and transform, and
   every one of them is a slider on its own. That is the right thing to have
   and the wrong thing to start from: a teenager who wants "that washed-out
   film thing" has to know that it is sepia at 0.35, contrast down, saturation
   down, a little grain and a vignette — six panels and a guess at each.

   A look is that combination, named, with a picture of what it does.

   WHAT A LOOK IS, EXACTLY

   A plain object: id, name, category, a sentence, tags for search, the
   version it was written against, which media it suits, and the parameters
   it sets on a clip — effects, colour, speed and transform. Nothing in it is
   new machinery. Every field it writes is a field the clip model already
   has and the renderer already reads, which is what makes the next paragraph
   true.

   THEY SURVIVE THE EXPORT, AND THAT IS THE POINT

   Export runs the same draw loop as the preview — the recorder captures the
   canvas the renderer paints — and the renderer reads the clip's own
   effects, colour, speed and transform. A look sets those fields and nothing
   else, so what the export records is what the preview showed. No look here
   is preview-only, and if one ever is, its `exportSafe` flag says so and the
   tile says so with it, rather than quietly coming out different.

   THE THUMBNAILS ARE REAL

   Each tile draws a built-in test card through the SAME pipeline the editor
   uses — NC_FX.filterFor for the filter effects, NC_FX.PAINT for the ones
   that are pixel work — so the tile is a rendering of the look, not an
   illustration of it. A tile that looks like nothing means the look does
   nothing, which is information worth having before you apply it.

   WHAT THIS FILE DELIBERATELY DOES NOT DO

   It does not touch the bundle, mount into React, or own any editor state.
   Applying a look is four calls to the store the editor already exposes, so
   the app's own undo puts it back — Ctrl+Z after a look is one step, not
   four, because the store coalesces them into the one history entry it
   pushes. Nothing here is persisted except which looks were starred.

   Goes with editor.html, which loads it. */
(function () {
  'use strict';

  var FAV_KEY = 'nc_looks_fav';
  var VERSION = 1;

  /* ==========================================================================
     THE REGISTRY
     ==========================================================================
     Every look is a combination somebody would otherwise have to find by
     hand. They are grouped by what they are for, not by which slider they
     move, and no two of them land in the same place — a library of presets
     that differ only by name is the thing this was written to avoid.

     fx     — effect name → strength, 0..1, exactly as the clip stores them
     color  — the colour controls, in the clip's own units
     speed  — rate, and reverse where a look is about time
     xform  — transform fields, scale and the rest
     Anything a look leaves out is left exactly as the clip had it, so a look
     applied over a graded clip keeps the grade unless it says otherwise. */
  var LOOKS = [
    /* ---- cinematic ----------------------------------------------------- */
    { id: 'filmic-warmth', name: 'Filmic Warmth', cat: 'Cinematic', v: VERSION,
      desc: 'Warm highlights, lifted blacks and a little grain. The safe one.',
      tags: 'film warm cinema orange teal grain',
      fx: { filmGrain: 0.22, vignette: 0.3 },
      color: { temperature: 12, contrast: 8, saturation: 6, lift: 4, highlights: -6 } },

    { id: 'cinema-cold', name: 'Cold Open', cat: 'Cinematic', v: VERSION,
      desc: 'Blue shadows, flat contrast. Night exteriors and serious talking.',
      tags: 'cool blue night moody cinematic teal',
      fx: { vignette: 0.35, bloom: 0.12 },
      color: { temperature: -18, tint: 4, contrast: -4, saturation: -8, shadows: -10 } },

    { id: 'matte-fade', name: 'Matte Fade', cat: 'Cinematic', v: VERSION,
      desc: 'Crushed-flat film look: nothing reaches true black.',
      tags: 'matte faded flat film vintage soft',
      fx: { filmGrain: 0.15 },
      color: { lift: 14, blacks: 12, contrast: -14, saturation: -12, whites: -8 } },

    /* ---- retro --------------------------------------------------------- */
    { id: 'retro-vhs', name: 'Retro VHS', cat: 'Retro', v: VERSION,
      desc: 'Tape bleed, scanlines and a soft focus, like a 1994 camcorder.',
      tags: 'vhs tape 90s retro scanlines analog',
      fx: { scanlines: 0.45, rgbSplit: 0.18, noise: 0.25, blur: 0.04, vintage: 0.2 },
      color: { saturation: -6, contrast: -6, temperature: 6 } },

    { id: 'super8', name: 'Super 8', cat: 'Retro', v: VERSION,
      desc: 'Heavy grain, warm cast and a hard vignette. Home movies.',
      tags: 'super8 film grain 70s warm vignette',
      fx: { filmGrain: 0.5, vignette: 0.55, vintage: 0.35 },
      color: { temperature: 20, saturation: -4, contrast: 6, lift: 6 } },

    { id: 'mono-noir', name: 'Noir', cat: 'Retro', v: VERSION,
      desc: 'Black and white with the contrast pushed where it hurts.',
      tags: 'black white mono noir grayscale contrast',
      fx: { grayscale: 1, filmGrain: 0.18, vignette: 0.4 },
      color: { contrast: 22, blacks: -10, whites: 8 } },

    /* ---- glow ---------------------------------------------------------- */
    { id: 'dream-glow', name: 'Dream Glow', cat: 'Glow', v: VERSION,
      desc: 'Soft bloom on the highlights, everything a half-step gentler.',
      tags: 'dream soft glow bloom hazy pastel',
      fx: { dreamy: 0.4, bloom: 0.35, glow: 0.2 },
      color: { contrast: -8, saturation: 8, highlights: 10, lift: 6 } },

    { id: 'neon-pulse', name: 'Neon Pulse', cat: 'Glow', v: VERSION,
      desc: 'Saturated edges and a hot glow. Built for night footage and gaming.',
      tags: 'neon glow gaming night saturated cyber',
      fx: { neon: 0.45, glow: 0.4, bloom: 0.25, vignette: 0.25 },
      color: { saturation: 26, contrast: 12, temperature: -8 } },

    { id: 'soft-bloom', name: 'Soft Bloom', cat: 'Glow', v: VERSION,
      desc: 'Just the bloom. Nothing else moved, so it stacks on any grade.',
      tags: 'bloom soft light gentle stackable',
      fx: { bloom: 0.3 } },

    /* ---- glitch -------------------------------------------------------- */
    { id: 'glitch-burst', name: 'Glitch Burst', cat: 'Glitch', v: VERSION,
      desc: 'Channel tearing and digital noise. Strong — meant for one beat.',
      tags: 'glitch rgb digital broken datamosh beat',
      fx: { glitch: 0.5, glitchRGB: 0.4, rgbSplit: 0.3, noise: 0.2 },
      color: { contrast: 10, saturation: 10 } },

    { id: 'rgb-impact', name: 'RGB Impact', cat: 'Glitch', v: VERSION,
      desc: 'A clean channel split with no noise. Reads at a glance on a title.',
      tags: 'rgb split chromatic impact title clean',
      fx: { rgbSplit: 0.35, chromaticAberration: 0.3 } },

    { id: 'digital-noise', name: 'Digital Noise', cat: 'Glitch', v: VERSION,
      desc: 'Sensor noise and a touch of scanline. Low-light phone footage.',
      tags: 'noise grain digital lowlight sensor',
      fx: { noise: 0.4, scanlines: 0.15, sharpen: 0.15 },
      color: { contrast: 6, saturation: -6 } },

    /* ---- punch (motion) ------------------------------------------------ */
    { id: 'velocity-zoom', name: 'Velocity Zoom', cat: 'Punch', v: VERSION,
      desc: 'A zoom punch with a motion blur under it. Lands a cut.',
      tags: 'zoom punch speed impact motion blur',
      fx: { zoomPunch: 0.45, blur: 0.05 },
      color: { contrast: 8 } },

    { id: 'hand-held', name: 'Hand Held', cat: 'Punch', v: VERSION,
      desc: 'A constant small shake, as if nobody used a tripod.',
      tags: 'shake handheld camera movement real',
      fx: { shake: 0.25 } },

    { id: 'speed-ramp-in', name: 'Ramp In', cat: 'Punch', v: VERSION,
      desc: 'Half speed with a punch on entry. Slow the moment, then arrive.',
      tags: 'slow motion ramp speed half punch',
      fx: { zoomPunch: 0.3 },
      speed: { rate: 0.5 } },

    { id: 'double-time', name: 'Double Time', cat: 'Punch', v: VERSION,
      desc: 'Twice the speed with a little blur, for walking and setting up.',
      tags: 'fast speed double timelapse quick',
      fx: { blur: 0.03 },
      speed: { rate: 2 } },

    { id: 'rewind', name: 'Rewind', cat: 'Punch', v: VERSION,
      desc: 'Reversed, with tape artefacts. The gag everybody tries first.',
      tags: 'reverse rewind backwards tape gag',
      fx: { scanlines: 0.3, rgbSplit: 0.15 },
      speed: { rate: 1, reverse: true } },

    /* ---- clean --------------------------------------------------------- */
    { id: 'bright-clean', name: 'Bright & Clean', cat: 'Clean', v: VERSION,
      desc: 'Lifted, sharpened, neutral. What a tutorial should look like.',
      tags: 'bright clean sharp tutorial neutral daylight',
      fx: { sharpen: 0.2 },
      color: { brightness: 8, contrast: 6, saturation: 4, highlights: 4 } },

    { id: 'punch-contrast', name: 'High Contrast', cat: 'Clean', v: VERSION,
      desc: 'Deep blacks and bright whites. Stands up on a phone in daylight.',
      tags: 'contrast punch bold phone daylight',
      fx: { sharpen: 0.15, vignette: 0.15 },
      color: { contrast: 24, blacks: -12, whites: 10, saturation: 8 } },

    { id: 'desat-doc', name: 'Documentary', cat: 'Clean', v: VERSION,
      desc: 'Colour pulled back, contrast held. Serious without being grey.',
      tags: 'documentary desaturated serious news natural',
      fx: {},
      color: { saturation: -22, contrast: 6, temperature: -4 } },

    /* ---- stylised ------------------------------------------------------ */
    { id: 'comic-ink', name: 'Comic Ink', cat: 'Stylised', v: VERSION,
      desc: 'Posterised with the edges found. Cartoon without the filter look.',
      tags: 'comic cartoon toon posterise edges anime',
      fx: { toon: 0.5, posterize: 0.35, edgeDetect: 0.12 },
      color: { saturation: 16, contrast: 12 } },

    { id: 'thermal-cam', name: 'Thermal', cat: 'Stylised', v: VERSION,
      desc: 'Heat-camera palette. One shot of it is funny; a minute is not.',
      tags: 'thermal heat infrared camera gag',
      fx: { thermal: 0.75, noise: 0.12 } },

    { id: 'pixel-8bit', name: '8-Bit', cat: 'Stylised', v: VERSION,
      desc: 'Real block averaging, not a blur. Reads as pixels at any size.',
      tags: 'pixel 8bit retro game blocks minecraft',
      fx: { pixelate: 0.55, posterize: 0.2 },
      color: { saturation: 12 } },

    { id: 'mirror-kaleido', name: 'Kaleidoscope', cat: 'Stylised', v: VERSION,
      desc: 'Mirrored and folded. Music beds and transitions, not dialogue.',
      tags: 'kaleidoscope mirror symmetry music trippy',
      fx: { kaleidoscope: 0.5, mirror: 0.3, bloom: 0.15 } }
  ];

  var CATS = ['All', 'Cinematic', 'Retro', 'Glow', 'Glitch', 'Punch', 'Clean', 'Stylised'];

  /* Expose the registry: editor-help.js lists what a panel can do, and a
     later pass that wants to search looks from the Ask card should read this
     rather than keep its own copy. */
  window.NC_LOOKS = { version: VERSION, looks: LOOKS, cats: CATS };

  /* ==========================================================================
     THE STORE
     ========================================================================== */
  function store() {
    try { return window.__ncStore && window.__ncStore.getState(); } catch (e) { return null; }
  }
  function selected() {
    var g = store();
    if (!g) return null;
    return g.clips.filter(function (c) { return c.id === g.selectedClipId; })[0] || null;
  }

  /* Applying is four calls, and they are four because the store keeps
     effects, colour, speed and transform in four places. Only the ones a
     look actually sets are called, so a look with no colour block leaves the
     grade alone. */
  /* PUSH FIRST, OR UNDO EATS THE CLIP.

     updateClipEffects and its three siblings change the clip without recording
     anything, which is fine when a slider is being dragged — one history entry
     per pixel of travel would be useless. A look is not a drag: it is one
     decision that moves up to four groups of fields at once, and without an
     entry of its own the next Ctrl+Z steps straight past it to whatever came
     before. Measured: apply a look, press undo, and the clip itself
     disappeared, because the previous entry was the clip being created.

     One push before the four calls, so the whole look undoes as one move. */
  function pushHistory() {
    var g = store();
    try { if (g && typeof g.pushHistory === 'function') g.pushHistory(); } catch (e) {}
  }

  function apply(look) {
    var g = store();
    var clip = selected();
    if (!g || !clip) return false;
    pushHistory();
    if (look.fx) g.updateClipEffects(clip.id, look.fx);
    if (look.color) g.updateClipColor(clip.id, look.color);
    if (look.speed) g.updateClipSpeed(clip.id, look.speed);
    if (look.xform) g.updateClipTransform(clip.id, look.xform);
    return true;
  }

  /* Everything a look can touch, put back to nothing. Written from the
     registry rather than from a list, so a look added later cannot leave a
     field behind that Reset does not know about. */
  function reset() {
    var g = store();
    var clip = selected();
    if (!g || !clip) return false;
    pushHistory();              /* same reason as apply() — Reset is one move */
    var fx = {}, col = {};
    LOOKS.forEach(function (l) {
      Object.keys(l.fx || {}).forEach(function (k) { fx[k] = 0; });
      Object.keys(l.color || {}).forEach(function (k) { col[k] = 0; });
    });
    g.updateClipEffects(clip.id, fx);
    g.updateClipColor(clip.id, col);
    g.updateClipSpeed(clip.id, { rate: 1, reverse: false });
    return true;
  }

  /* ==========================================================================
     THE TEST CARD AND THE TILES
     ==========================================================================
     The card has to contain the things the effects act on, or half the tiles
     look identical: a colour sweep for the grades, hard edges for the
     posterise and the edge-detect, a bright spot for the bloom, and skin-ish
     mid-tones so a warm look reads as warm rather than as orange. */
  function drawCard(g, w, h) {
    var sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2B3F6B'); sky.addColorStop(0.55, '#6E86B8'); sky.addColorStop(1, '#C9A227');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    var sun = g.createRadialGradient(w * 0.74, h * 0.3, 1, w * 0.74, h * 0.3, h * 0.42);
    sun.addColorStop(0, 'rgba(255,246,214,1)'); sun.addColorStop(1, 'rgba(255,246,214,0)');
    g.fillStyle = sun; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1B2233';
    g.beginPath();
    g.moveTo(0, h); g.lineTo(w * 0.22, h * 0.52); g.lineTo(w * 0.44, h);
    g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(w * 0.3, h); g.lineTo(w * 0.58, h * 0.38); g.lineTo(w * 0.9, h);
    g.closePath(); g.fill();
    g.fillStyle = '#D9A68B';                       /* a mid-tone that shows a cast */
    g.beginPath(); g.arc(w * 0.26, h * 0.72, h * 0.14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F4F1E8'; g.fillRect(w * 0.06, h * 0.08, w * 0.1, h * 0.06);
    g.fillStyle = '#0B0E16'; g.fillRect(w * 0.84, h * 0.82, w * 0.12, h * 0.1);
  }

  /* The same pipeline the editor draws with. filterFor turns an effect into
     the ctx.filter string the renderer uses; PAINT is for the ones that are
     pixel work and cannot be a filter. If editor-fx.js has not landed, the
     tile is the plain card and says nothing it cannot show. */
  function paintTile(cv, look) {
    var w = cv.width, h = cv.height;
    var g = cv.getContext('2d');
    var FX = window.NC_FX;
    g.save();
    var filt = [];
    if (FX && FX.filterFor) {
      Object.keys(look.fx || {}).forEach(function (k) {
        var f = FX.filterFor(k, look.fx[k]);
        if (f) filt.push(f);
      });
    }
    /* The colour block is the clip's own units; these are the same transfer
       curves the grade applies, kept simple enough to be honest at 132px. */
    var c = look.color || {};
    if (c.brightness) filt.push('brightness(' + (1 + c.brightness / 100) + ')');
    if (c.contrast) filt.push('contrast(' + (1 + c.contrast / 100) + ')');
    if (c.saturation) filt.push('saturate(' + (1 + c.saturation / 100) + ')');
    if (c.temperature) filt.push('sepia(' + Math.min(0.6, Math.abs(c.temperature) / 100) + ')' +
      (c.temperature < 0 ? ' hue-rotate(170deg)' : ''));
    g.filter = filt.join(' ') || 'none';
    drawCard(g, w, h);
    g.filter = 'none';
    if (FX && FX.PAINT) {
      Object.keys(look.fx || {}).forEach(function (k) {
        if (FX.PAINT[k]) { try { FX.PAINT[k](g, w, h, look.fx[k]); } catch (e) {} }
      });
    }
    /* The two that are motion rather than picture get a mark, because a still
       cannot show them and an unmarked still would imply they do nothing. */
    if ((look.fx && (look.fx.shake || look.fx.zoomPunch)) || look.speed) {
      g.fillStyle = 'rgba(8,10,18,.72)';
      g.fillRect(0, h - 15, w, 15);
      g.fillStyle = '#EAF2FF';
      g.font = '600 9px "Segoe UI",system-ui,sans-serif';
      g.fillText(look.speed ? (look.speed.reverse ? 'reversed' : look.speed.rate + '× speed') : 'moves', 5, h - 5);
    }
    g.restore();
  }

  /* ==========================================================================
     THE PANEL
     ========================================================================== */
  function favs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (e) { return []; }
  }
  function toggleFav(id) {
    var f = favs(), i = f.indexOf(id);
    if (i < 0) f.push(id); else f.splice(i, 1);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
    return f.indexOf(id) >= 0;
  }

  function css() {
    if (document.getElementById('nclk-css')) return;
    var s = document.createElement('style');
    s.id = 'nclk-css';
    s.textContent = [
      '.nclk-btn{position:fixed;left:352px;bottom:62px;z-index:99970;border:0;cursor:pointer;',
        'border-radius:999px;padding:9px 15px;font:700 12.5px/1 "Segoe UI",system-ui,sans-serif;',
        'color:#04121a;background:linear-gradient(110deg,#FFC83D,#FF7A1A 70%);',
        'box-shadow:0 8px 24px rgba(0,0,0,.4)}',
      '.nclk-btn:hover{filter:brightness(1.08)}',
      '.nclk{position:fixed;left:18px;bottom:104px;width:420px;max-width:calc(100vw - 36px);',
        'max-height:min(74vh,680px);overflow:auto;z-index:99980;border-radius:16px;padding:15px 16px;',
        'background:#0F1220;color:#EAF2FF;border:1px solid rgba(255,200,61,.45);',
        'box-shadow:0 18px 60px rgba(0,0,0,.55);font:13px/1.5 "Segoe UI",system-ui,sans-serif}',
      '.nclk h4{margin:0 0 3px;font-size:15px;display:flex;align-items:center;gap:8px}',
      '.nclk p.sub{margin:0 0 10px;color:#8b93a7;font-size:12px}',
      '.nclk input.q{width:100%;box-sizing:border-box;border-radius:9px;padding:8px 10px;font:inherit;',
        'font-size:12.5px;background:rgba(255,255,255,.05);color:#EAF2FF;',
        'border:1px solid rgba(255,255,255,.16)}',
      '.nclk input.q:focus{outline:0;border-color:#FFC83D}',
      /* align-items, and the fixed height, are not tidiness. A wrapped flex
         row stretches each line's items to the tallest thing on that line, and
         the editor's own button rules are enough to make one line taller than
         the next: measured, the five chips on the first line came out 69px
         tall against 21px on the second, so three of them sat over the
         background art as big translucent panes with a word at the bottom.
         Pinning the height here means nothing outside this panel can stretch
         a chip, whichever line it wraps onto. */
      '.nclk .cats{display:flex;flex-wrap:wrap;align-items:flex-start;',
        'align-content:flex-start;gap:6px;margin:10px 0 4px}',
      '.nclk .cat{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#C7D2E8;',
        'border-radius:999px;padding:0 10px;height:24px;min-height:0;flex:0 0 auto;align-self:flex-start;',
        'display:inline-flex;align-items:center;box-sizing:border-box;',
        'font:600 11px/1 "Segoe UI",system-ui,sans-serif;cursor:pointer}',
      '.nclk .cat.on{background:#FFC83D;color:#1B1405;border-color:#FFC83D}',
      '.nclk .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}',
      '.nclk .tile{border:1px solid rgba(255,255,255,.14);border-radius:12px;overflow:hidden;',
        'background:rgba(255,255,255,.03);cursor:pointer;text-align:left;padding:0;color:inherit;font:inherit}',
      '.nclk .tile:hover{border-color:#FFC83D}',
      '.nclk .tile canvas{display:block;width:100%;height:auto;background:#000}',
      '.nclk .tile .m{padding:7px 9px 9px}',
      '.nclk .tile b{display:block;font-size:12.5px}',
      '.nclk .tile span{display:block;color:#8b93a7;font-size:11px;line-height:1.35;margin-top:2px}',
      '.nclk .star{position:absolute;margin:-1px 0 0 -26px;background:none;border:0;cursor:pointer;',
        'color:#FFC83D;font-size:14px;line-height:1;padding:2px}',
      '.nclk .row{display:flex;gap:8px;margin-top:12px}',
      '.nclk button.go{flex:1;padding:9px 12px;border-radius:10px;border:0;cursor:pointer;font:inherit;',
        'font-weight:700;font-size:12.5px;background:#FFC83D;color:#1B1405}',
      '.nclk button.ghost{padding:9px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:12.5px;',
        'background:rgba(255,255,255,.06);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.nclk .say{margin-top:10px;font-size:12px;border-radius:9px;padding:8px 10px;display:none}',
      '.nclk .say.on{display:block}',
      '.nclk .say.ok{background:rgba(27,200,120,.14);color:#8FE9BE}',
      '.nclk .say.warn{background:rgba(255,122,26,.14);color:#FFC08A}',
      '@media (max-width:900px){.nclk-btn{left:8px!important;bottom:54px!important}',
        '.nclk{left:8px;right:8px;width:auto;bottom:96px;max-height:66vh}',
        '.nclk .grid{grid-template-columns:1fr 1fr}}'
    ].join('');
    document.head.appendChild(s);
  }

  var panel = null, state = { q: '', cat: 'All' };

  function say(kind, text) {
    if (!panel) return;
    var el = panel.querySelector('.say');
    el.className = 'say on ' + kind;
    el.textContent = text;
  }

  function matches(look) {
    if (state.cat === 'Favourites') return favs().indexOf(look.id) >= 0;
    if (state.cat !== 'All' && look.cat !== state.cat) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    return (look.name + ' ' + look.cat + ' ' + look.desc + ' ' + look.tags).toLowerCase().indexOf(q) >= 0;
  }

  function fill() {
    var grid = panel.querySelector('.grid');
    grid.textContent = '';
    var list = LOOKS.filter(matches);
    if (!list.length) {
      var none = document.createElement('p');
      none.className = 'sub';
      none.textContent = 'Nothing matches that. Try a mood — warm, glitch, slow — or clear the search.';
      grid.appendChild(none);
      return;
    }
    var starred = favs();
    list.forEach(function (look) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.setAttribute('data-look', look.id);
      var cv = document.createElement('canvas');
      cv.width = 186; cv.height = 104;
      cv.setAttribute('aria-hidden', 'true');
      tile.appendChild(cv);
      var m = document.createElement('div');
      m.className = 'm';
      var b = document.createElement('b');
      b.textContent = look.name;
      var sp = document.createElement('span');
      sp.textContent = look.desc;
      m.appendChild(b); m.appendChild(sp);
      tile.appendChild(m);
      tile.title = 'Apply ' + look.name;
      tile.onclick = function () {
        if (!selected()) { say('warn', 'Pick a clip on the timeline first — a look is applied to one clip.'); return; }
        if (apply(look)) say('ok', look.name + ' applied. Ctrl+Z puts it back.');
      };
      var star = document.createElement('button');
      star.type = 'button';
      star.className = 'star';
      star.textContent = starred.indexOf(look.id) >= 0 ? '★' : '☆';
      star.title = 'Keep this one at hand';
      star.onclick = function (e) {
        e.stopPropagation();
        star.textContent = toggleFav(look.id) ? '★' : '☆';
        if (state.cat === 'Favourites') fill();
      };
      m.insertBefore(star, m.firstChild);
      grid.appendChild(tile);
      paintTile(cv, look);
    });
  }

  function open() {
    if (panel) { close(); return; }
    css();
    panel = document.createElement('div');
    panel.className = 'nclk';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Looks');
    var h = document.createElement('h4');
    h.textContent = '✦ Looks';
    var sub = document.createElement('p');
    sub.className = 'sub';
    sub.textContent = 'A whole grade in one press, on the clip you have selected. Every tile is drawn with the effects it applies.';
    var q = document.createElement('input');
    q.className = 'q';
    q.type = 'search';
    q.placeholder = 'Search looks — warm, glitch, slow, vhs…';
    q.oninput = function () { state.q = q.value; fill(); };
    var cats = document.createElement('div');
    cats.className = 'cats';
    CATS.concat(['Favourites']).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat' + (c === state.cat ? ' on' : '');
      b.textContent = c;
      b.onclick = function () {
        state.cat = c;
        cats.querySelectorAll('.cat').forEach(function (x) { x.className = 'cat'; });
        b.className = 'cat on';
        fill();
      };
      cats.appendChild(b);
    });
    var grid = document.createElement('div');
    grid.className = 'grid';
    var say1 = document.createElement('div');
    say1.className = 'say';
    var row = document.createElement('div');
    row.className = 'row';
    var res = document.createElement('button');
    res.type = 'button';
    res.className = 'ghost';
    res.textContent = 'Reset this clip';
    res.onclick = function () {
      if (!selected()) { say('warn', 'Pick a clip first.'); return; }
      reset();
      say('ok', 'Back to no look. The clip keeps its trim, position and text.');
    };
    var shut = document.createElement('button');
    shut.type = 'button';
    shut.className = 'go';
    shut.textContent = 'Done';
    shut.onclick = close;
    row.appendChild(res); row.appendChild(shut);
    panel.appendChild(h); panel.appendChild(sub); panel.appendChild(q);
    panel.appendChild(cats); panel.appendChild(grid); panel.appendChild(say1); panel.appendChild(row);
    document.body.appendChild(panel);
    fill();
    if (!selected()) say('warn', 'Nothing selected yet — pick a clip on the timeline and the tiles will apply to it.');
    q.focus();
  }

  function close() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
  }

  function button() {
    if (document.querySelector('.nclk-btn')) return;
    css();
    var b = document.createElement('button');
    b.className = 'nclk-btn';
    b.type = 'button';
    b.textContent = '✦ Looks';
    b.title = 'A whole grade in one press';
    b.onclick = open;
    document.body.appendChild(b);
  }

  function boot() {
    var tries = 0;
    var t = setInterval(function () {
      if (window.__ncStore || tries++ > 60) { clearInterval(t); button(); }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
