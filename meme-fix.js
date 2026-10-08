/* ============================================================================
   NOVACLIP — THE MEME CAPTION EDITOR
   ============================================================================
   Three things were asked for about the meme tool, and they turn out to be one
   piece of work:

     "there is a lag in the bottom and top text"
     "make it appear in the places that they should be ... they don't appear
      in the blank spot of most memes"
     "make the text on the memes possible to edit or move"

   WHAT WAS THERE

   A dialog with two boxes, Top text and Bottom text, and a Generate button
   that drew the first across the top edge of the picture and the second across
   the bottom. You could not see what you were making until it was made, you
   could not move it afterwards, and the two captions landed on faces on every
   template whose blank space is somewhere else — which is most of the ones
   people actually use.

   THE LAG WAS NOT THE TYPING

   Measured before anything was changed: 168ms per keystroke, worst 263ms. Both
   caption boxes are React state on the component that also renders the grid of
   a hundred template thumbnails, inside a dialog with a full-screen
   backdrop-blur behind it. Every letter re-rendered the grid and repainted the
   blur. Taking the blur off took it to 72ms; hiding the grid took it to 101ms;
   both together, 77ms. So it was the two of them, and the fix for both is the
   same one: this editor keeps its own text, React never hears a keystroke, and
   nothing above re-renders at all.

   WHY IT REPLACES THE DIALOG'S CONTROLS RATHER THAN PATCHING THEM

   editor.html is a built bundle. Every other extension on this site works the
   same way — editor-fx.js, editor-lanes.js, ai-edit.js — by watching for what
   the bundle puts on the page and working with the store it publishes at
   window.__ncStore. Nothing here edits the bundle.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncMemeFix) return;
  window.__ncMemeFix = 1;

  var TOP = 'input[placeholder="Top text..."]';
  var BOTTOM = 'input[placeholder="Bottom text..."]';

  /* ------------------------------------------------------------------ style */
  function css() {
    if (document.getElementById('ncmeme-css')) return;
    var st = document.createElement('style');
    st.id = 'ncmeme-css';
    st.textContent = [
      '.ncmeme-stage{position:relative;width:100%;border-radius:12px;overflow:hidden;',
        'background:#0b0d14;touch-action:none;user-select:none}',
      '.ncmeme-stage img{display:block;width:100%;pointer-events:none}',
      /* A caption is a textarea sitting exactly where it will be drawn, in the
         font it will be drawn in. There is no separate preview to drift. */
      '.ncmeme-cap{position:absolute;box-sizing:border-box;margin:0;padding:0;border:0;',
        'background:transparent;resize:none;overflow:hidden;text-align:center;',
        'font-family:Impact,"Arial Black",sans-serif;font-weight:700;line-height:1.08;',
        'color:#fff;-webkit-text-stroke:0.055em #000;paint-order:stroke fill;',
        'text-transform:uppercase;cursor:move;outline:0;z-index:1}',
      '.ncmeme-cap.pale{color:#111;-webkit-text-stroke:0.055em #fff}',
      '.ncmeme-cap:focus{cursor:text}',
      /* Above the captions, not under them: the frame takes no clicks itself,
         but the grip in its corner sits half over the caption's own box and a
         textarea painted on top of it swallowed every grab at it. */
      /* A dashed white line is invisible on Drake's white panel, which is
         precisely where the boxes land. A dark ring under the white dashes
         shows up on either. */
      '.ncmeme-box{position:absolute;border:1px dashed rgba(255,255,255,.85);border-radius:6px;',
        'box-shadow:0 0 0 1px rgba(0,0,0,.45),inset 0 0 0 1px rgba(0,0,0,.45);',
        'pointer-events:none;opacity:0;transition:opacity .15s;z-index:2}',
      '.ncmeme-stage:hover .ncmeme-box,.ncmeme-stage.live .ncmeme-box{opacity:.85}',
      /* The frame does not take clicks — it sits over the caption — but the
         grip in its corner has to, and pointer-events is inherited: a grip
         inside a pointer-events:none frame is a grip nothing can grab, which
         is exactly how the first resize did nothing at all. */
      '.ncmeme-grip{position:absolute;width:16px;height:16px;right:-8px;bottom:-8px;border-radius:50%;',
        'background:#7C5CFF;border:2px solid #fff;cursor:nwse-resize;opacity:0;transition:opacity .15s;',
        'pointer-events:auto;touch-action:none}',
      '.ncmeme-stage:hover .ncmeme-grip{opacity:1}',
      '.ncmeme-bar{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap}',
      /* Mixed from the dialog's own text colour rather than written in grey:
         this dialog is white on the light theme, and two pale grey buttons on
         a white card read as disabled. */
      '.ncmeme-bar button{border:1px solid color-mix(in srgb,currentColor 26%,transparent);',
        'background:color-mix(in srgb,currentColor 8%,transparent);color:inherit;opacity:.82;',
        'border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer}',
      '.ncmeme-bar button:hover{border-color:#7C5CFF;opacity:1}',
      '.ncmeme-hint{font-size:10.5px;color:inherit;opacity:.62;margin-top:6px;line-height:1.5}',
      /* THE LAG, MEASURED TWICE.
         Stopping the keystroke before React was the obvious half and it bought
         nothing: 169ms a letter with the captions off React entirely. The cost
         is not the re-render, it is the paint. This dialog is a full-screen
         backdrop-blurred sheet, with a second blur on the panel, over a column
         of a hundred remote thumbnails 7417px tall — and a backdrop filter has
         to re-read everything behind it on every frame, including the frame
         where a caret blinks. Turning the blurs off for as long as the caption
         editor is open: 169ms to 33ms a letter.
         The surfaces keep their own backgrounds, which are 88% and 60% opaque
         and stacked, so what shows through is about five percent of a picture
         nobody can see anyway. It is on the <html> element so it ends by
         itself when the dialog goes. */
      'html.ncmeme-open *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
    ].join('');
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------------ helper
     The dialog's own <img> has no crossOrigin, so anything drawn from it taints
     the canvas and toBlob throws. Both imgflip and memegen answer with
     access-control-allow-origin: *, so a second load asking for it properly
     gives us pixels we are allowed to read. */
  function load(url) {
    return new Promise(function (ok, no) {
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { ok(im); };
      im.onerror = function () { no(new Error('template did not load')); };
      im.src = url;
    });
  }

  function measure(cap, stageW, natW) {
    /* The size the caption will be DRAWN at, worked out on the real pixels and
       then scaled down to the preview — so what is on screen is what comes
       out, rather than two guesses that happen to look similar. It asks the
       same function the drawing asks (squeeze, not fit), because fit() answers
       "nowhere" for a box too small for its words and the drawing does not have
       that option: a caption that has been dragged is drawn where it was put. */
    var cv = measure.cv || (measure.cv = document.createElement('canvas'));
    var ctx = cv.getContext('2d');
    var box = { x: cap.x, y: cap.y, w: cap.w, h: cap.h };
    var f = window.NC_MEME.squeeze(ctx, cap.text || ' ', box, natW, cap.natH);
    if (!f) f = { size: Math.max(10, cap.h * cap.natH * 0.5), lines: [cap.text || ''] };
    return f.size * (stageW / natW);
  }

  /* ------------------------------------------------------------------- build */
  function build(dialog) {
    var top = dialog.querySelector(TOP);
    var bottom = dialog.querySelector(BOTTOM);
    var img = dialog.querySelector('img');
    if (!top || !bottom || !img || dialog.__ncMeme) return;
    dialog.__ncMeme = 1;
    css();
    document.documentElement.classList.add('ncmeme-open');

    /* React's two inputs stay in the DOM and stop being used. Removing them
       outright would have React re-create them on its next render and we would
       be fighting it; hidden, they simply never see a keystroke, which is the
       whole of the lag fix. */
    var holder = top.parentElement;
    top.style.display = 'none';
    bottom.style.display = 'none';

    var stage = document.createElement('div');
    stage.className = 'ncmeme-stage';
    var shot = document.createElement('img');
    shot.src = img.src;
    stage.appendChild(shot);

    var bar = document.createElement('div');
    bar.className = 'ncmeme-bar';
    var addBtn = document.createElement('button');
    addBtn.type = 'button'; addBtn.textContent = '+ caption';
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button'; resetBtn.textContent = 'Reset places';
    bar.appendChild(addBtn); bar.appendChild(resetBtn);

    var hint = document.createElement('div');
    hint.className = 'ncmeme-hint';
    hint.textContent = 'Type straight onto the picture. Drag a caption to move it, ' +
                       'pull its corner to resize. The blank spots are found for you.';

    /* The original picture is left in place above ours — it is the template
       thumbnail and it is what the dialog looked like — so the stage goes in
       its place and the thumbnail is hidden. */
    img.parentElement.style.display = 'none';
    holder.parentElement.insertBefore(stage, holder);
    holder.parentElement.insertBefore(bar, holder);
    holder.parentElement.insertBefore(hint, holder);

    var caps = [];
    var natW = 0, natH = 0, bitmap = null, sheet = null;

    function render() {
      var w = stage.clientWidth || 400;
      caps.forEach(function (c) {
        /* Asked again every frame of a drag: the words are white on a dark
           picture and black on a pale one, and which one a caption is sitting
           on changes the moment it is moved. */
        if (sheet) c.lum = window.NC_MEME.lumAt(sheet, c);
        c.el.style.left = (c.x * 100) + '%';
        c.el.style.top = (c.y * 100) + '%';
        c.el.style.width = (c.w * 100) + '%';
        c.el.style.height = (c.h * 100) + '%';
        c.el.style.fontSize = measure(c, w, natW) + 'px';
        c.el.classList.toggle('pale', c.lum > 150);
        c.frame.style.left = c.el.style.left; c.frame.style.top = c.el.style.top;
        c.frame.style.width = c.el.style.width; c.frame.style.height = c.el.style.height;
      });
    }

    function addCap(box, text) {
      var c = {
        x: box.x, y: box.y, w: box.w, h: box.h, lum: box.lum || 0,
        text: text || '', natH: natH
      };
      var ta = document.createElement('textarea');
      ta.className = 'ncmeme-cap';
      ta.rows = 1;
      ta.value = c.text;
      ta.spellcheck = false;
      ta.placeholder = caps.length ? 'caption' : 'top text';
      var frame = document.createElement('div');
      frame.className = 'ncmeme-box';
      var grip = document.createElement('div');
      grip.className = 'ncmeme-grip';
      frame.appendChild(grip);
      c.el = ta; c.frame = frame;
      stage.appendChild(frame);
      stage.appendChild(ta);
      caps.push(c);

      ta.addEventListener('input', function () {
        c.text = ta.value;
        ta.style.fontSize = measure(c, stage.clientWidth || 400, natW) + 'px';
      });
      /* The keystroke stops here. React is upstream of this dialog and has no
         reason to hear about it, and hearing about it is what cost 168ms. */
      ['keydown', 'keyup', 'input', 'change'].forEach(function (ev) {
        ta.addEventListener(ev, function (e) { e.stopPropagation(); });
      });

      drag(ta, c, false);
      drag(grip, c, true);
      return c;
    }

    function drag(handle, c, resizing) {
      handle.addEventListener('pointerdown', function (e) {
        /* A PRESS IS NOT YET A DRAG.
           The first version refused to drag a caption that had the cursor in
           it, so the thing anybody does — type the words, then move them — did
           nothing at all: you had to click away first and that is not a rule
           anybody would guess. Now every press waits. Under a few pixels of
           movement nothing is prevented and the press stays what it was, a
           click into the text; past that the caption starts moving, the cursor
           comes out of it, and the text is left alone. */
        var r = stage.getBoundingClientRect();
        var sx = e.clientX, sy = e.clientY, ox = c.x, oy = c.y, ow = c.w, oh = c.h;
        var live = resizing;                        /* a grip is a drag at once */
        if (resizing) { e.preventDefault(); try { handle.setPointerCapture(e.pointerId); } catch (err) {} }
        function move(ev) {
          var dx = (ev.clientX - sx) / r.width, dy = (ev.clientY - sy) / r.height;
          if (!live) {
            if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
            live = true;
            c.el.blur();
            try { handle.setPointerCapture(ev.pointerId); } catch (err) {}
          }
          if (resizing) {
            c.w = Math.max(0.12, Math.min(1 - c.x, ow + dx));
            c.h = Math.max(0.05, Math.min(1 - c.y, oh + dy));
          } else {
            c.x = Math.max(0, Math.min(1 - c.w, ox + dx));
            c.y = Math.max(0, Math.min(1 - c.h, oy + dy));
          }
          ev.preventDefault();
          render();
        }
        function up(ev) {
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
          try { handle.releasePointerCapture(ev.pointerId); } catch (err) {}
          if (!live && !resizing) c.el.focus();
        }
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
      });
    }

    /* ------------------------------------------------------- the first layout */
    load(img.src).then(function (im) {
      bitmap = im;
      natW = im.naturalWidth; natH = im.naturalHeight;
      try { sheet = window.NC_MEME.scan(im, natW, natH); } catch (e) { sheet = null; }
      var boxes = [];
      try { boxes = window.NC_MEME.boxes(im, natW, natH, 2); } catch (e) {}
      var fb = window.NC_MEME.bands(2);
      addCap(boxes[0] || fb[0], '');
      addCap(boxes[1] || fb[1], '');
      caps.forEach(function (c) { c.natH = natH; });
      render();
      stage.classList.add('live');
      setTimeout(function () { stage.classList.remove('live'); }, 1400);
      caps[0].el.focus();
    }).catch(function () {
      /* No pixels — the template would not load with CORS. The captions still
         work, they just start in the classic two bands with nothing detected. */
      natW = img.naturalWidth || 600; natH = img.naturalHeight || 600;
      var fb = window.NC_MEME.bands(2);
      addCap(fb[0], ''); addCap(fb[1], '');
      caps.forEach(function (c) { c.natH = natH; });
      render();
    });

    addBtn.addEventListener('click', function () {
      /* A new caption starts across the middle, where it is in the way and
         therefore obviously draggable, rather than under one of the others. */
      var c = addCap({ x: 0.08, y: 0.42, w: 0.84, h: 0.16, lum: 0 }, '');
      c.natH = natH;
      render(); c.el.focus();
    });
    resetBtn.addEventListener('click', function () {
      if (!bitmap) return;
      var boxes = [];
      try { boxes = window.NC_MEME.boxes(bitmap, natW, natH, caps.length); } catch (e) {}
      var fb = window.NC_MEME.bands(caps.length);
      caps.forEach(function (c, i) {
        var b = boxes[i] || fb[i];
        c.x = b.x; c.y = b.y; c.w = b.w; c.h = b.h; c.lum = b.lum || 0;
      });
      render();
    });
    addEventListener('resize', render);

    dialog.__ncCaps = function () { return { caps: caps, img: bitmap, w: natW, h: natH }; };
    /* The way back, for the one case this editor cannot finish: no readable
       pixels means no canvas, so the words are handed to the two inputs the
       bundle still has and its own Generate is let through. React only believes
       a value that arrives through the property setter it patched, hence the
       long way round. */
    dialog.__ncHandOff = function () {
      var set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      [top, bottom].forEach(function (input, i) {
        var c = caps[i];
        set.call(input, (c && c.text ? c.text : ''));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };
  }

  /* ----------------------------------------------------------------- generate
     The bundle's own Generate draws the two React values top and bottom. This
     takes the click first and draws what is actually on the stage, at the
     template's real size. */
  function wire() {
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('button');
      if (!btn || !/generate meme/i.test(btn.textContent || '')) return;
      if (btn.__ncPass) { btn.__ncPass = 0; return; }   /* our own second click */
      var dialog = btn.closest('div');
      while (dialog && !dialog.__ncCaps) dialog = dialog.parentElement;
      if (!dialog || !dialog.__ncCaps) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      make(dialog, btn);
    }, true);
  }

  function make(dialog, btn) {
    var state = dialog.__ncCaps();
    var store = window.__ncStore;
    var texts = state.caps.map(function (c) { return (c.text || '').trim(); });
    if (!texts.some(Boolean)) return;
    /* Nothing to draw on, or nowhere to put the result: hand the words back to
       the dialog and let it do what it always did, rather than swallowing the
       click and leaving the button dead. */
    if (!state.img || !store) {
      if (dialog.__ncHandOff) dialog.__ncHandOff();
      btn.__ncPass = 1;
      setTimeout(function () { btn.click(); }, 0);
      return;
    }

    var was = btn.textContent;
    btn.textContent = 'Generating…';

    var cv = document.createElement('canvas');
    cv.width = state.w; cv.height = state.h;
    var ctx = cv.getContext('2d');
    ctx.drawImage(state.img, 0, 0, cv.width, cv.height);
    /* Drawn where they were put, not where they were found: the boxes on the
       stage are the boxes, because somebody may have moved them. */
    window.NC_MEME.drawAt(cv, state.caps.map(function (c) {
      return { x: c.x, y: c.y, w: c.w, h: c.h, lum: c.lum, text: c.text || '' };
    }));

    cv.toBlob(function (blob) {
      btn.textContent = was;
      if (!blob) return;
      var name = (dialog.querySelector('h3') || {}).textContent || 'meme';
      var id = 'meme_cap_' + Date.now();
      var st = store.getState();
      st.addAssets([{
        id: id, name: name + ' — ' + (texts.filter(Boolean)[0] || 'meme'),
        kind: 'image', url: URL.createObjectURL(blob), duration: 5,
        width: cv.width, height: cv.height, thumbnail: '', createdAt: Date.now()
      }]);
      /* Onto the first video track at the playhead, which is what the bundle's
         own version did after it generated one. */
      try {
        var s2 = store.getState();
        var track = (s2.tracks || []).find(function (t) { return t.kind === 'video'; });
        if (track && s2.addClipFromAsset) s2.addClipFromAsset(id, track.id, s2.playhead || 0);
      } catch (err) {}
      /* Close the way the dialog closes itself. */
      var cancel = [].slice.call(dialog.querySelectorAll('button'))
        .find(function (b) { return /cancel/i.test(b.textContent || ''); });
      if (cancel) cancel.click();
    }, 'image/png');
  }

  /* ------------------------------------------------------------------- watch */
  function look() {
    var t = document.querySelector(TOP);
    /* The blurs come back the moment the dialog goes, whoever closed it. */
    if (!t && !document.querySelector('.ncmeme-stage')) {
      document.documentElement.classList.remove('ncmeme-open');
    }
    if (!t) return;
    var d = t.closest('div.glass-strong') || t.closest('div');
    /* Up to the dialog panel: the inputs sit a couple of wrappers inside it. */
    var n = t, hops = 0;
    while (n && hops++ < 6) {
      if (n.querySelector && n.querySelector('img') && n.querySelector(BOTTOM)) { d = n; break; }
      n = n.parentElement;
    }
    if (d) build(d);
  }

  function boot() {
    wire();
    new MutationObserver(function () { look(); })
      .observe(document.documentElement, { childList: true, subtree: true });
    look();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
