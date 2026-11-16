/* NOVACLIP — CARRYING A PICTURE FROM THE PHOTO TOOL INTO THE EDITOR
 * ===========================================================================
 * Asked for: "make it possible to drag for example an image in the photo to
 * the editor or smtg".
 *
 * Today the only route between those two tools is the disk. You finish a
 * still in the Photo editor, press Export, find it in Downloads, go to the
 * video editor, press Upload, find it again. Two of those four steps are a
 * file manager, and on a phone the file manager is the worst part of the
 * whole site.
 *
 * WHAT THIS ADDS
 * ---------------------------------------------------------------------------
 *   DRAG   a chip in the Photo tool's bar onto the editor — which, with the
 *          mini window, means dragging it out of the window onto the editor
 *          underneath, or into a floating editor from the page behind it.
 *   PRESS  the same chip, and the picture goes to the editor whether one is
 *          open or not. If none is, the next editor to open picks it up.
 *
 * WHY THE CHIP AND NOT THE PICTURE ITSELF
 * ---------------------------------------------------------------------------
 * The obvious gesture is to drag the image on the canvas, and that is exactly
 * what cannot be done: #view IS the brush surface. draggable="true" on it
 * means every paint stroke, every selection, every clone-stamp drag starts a
 * file drag instead. The tool would stop working in order to gain a shortcut.
 *
 * So the handle is a chip in the bar, next to Export, where the other things
 * you do WITH the finished picture already are. The drag image is the
 * picture, so what you see crossing the screen is still the photograph.
 *
 * WHY A FILE AND NOT SOMETHING CLEVERER
 * ---------------------------------------------------------------------------
 * The editor already has an import: a hidden <input type="file"> that the
 * Upload button drives, which probes, thumbnails and places what it is given.
 * This builds a real File and hands it to that input, so a picture arriving
 * this way is indistinguishable from one that was uploaded — same probe, same
 * thumbnail, same timeline behaviour, no second code path to go stale.
 *
 * Checked before it was built: the editor's input takes a File made in the
 * page and imports it, Media Library 0 -> 1.
 *
 * TWO ROUTES, BECAUSE A PHONE HAS NO DRAG
 * ---------------------------------------------------------------------------
 * HTML5 drag and drop does not exist on touch. A feature that is only a drag
 * is a feature phones do not have, so the press is not a convenience, it is
 * the other half.
 *
 *   The drag  parks the payload on the top window and hands the drop a type
 *             to recognise. Same origin, so nothing is serialised at all —
 *             the receiving side is given the canvas itself and reads it when
 *             the drop happens. Verified across an iframe boundary first,
 *             because the whole idea rests on it: a drag started in a frame
 *             arrives at the parent with its dataTransfer intact.
 *
 *   The press writes the picture to a small IndexedDB tray and shouts on a
 *             BroadcastChannel. An editor already open takes it at once; one
 *             opened later drains the tray on arrival. That is what makes it
 *             work when the two tools are not on screen together, which on a
 *             phone they never are.
 *
 * ITS OWN DATABASE, ON PURPOSE. nova.js keeps the background video in
 * `novaclip` at version 1, and a second store would mean a version bump that
 * the other opener does not know about — which is a VersionError on a page
 * that has done nothing wrong. A separate database cannot collide.
 *
 * ONE PICTURE, NOT A QUEUE. The tray holds the last thing sent and is emptied
 * by whoever takes it. Anything older than an hour is dropped on sight: a
 * still from yesterday appearing in a project today is a bug, not a feature.
 */
(function () {
  'use strict';
  if (window.NC_HANDOFF) return;

  var TYPE = 'application/x-novaclip-media';
  var DB = 'novaclip-handoff', STORE = 'tray', KEY = 'one';
  var STALE = 60 * 60 * 1000;

  function topWin() { try { return window.top || window; } catch (e) { return window; } }

  /* ----------------------------------------------------- the live bridge */

  /* Same origin, so the payload travels as objects rather than as text. The
     canvas goes across as a canvas and is read at the drop, which is the
     difference between a drag that starts instantly and one that stops to
     base64 three megabytes first. */
  function park(p) {
    try { topWin().__ncHandoff = p; } catch (e) { window.__ncHandoff = p; }
  }
  function parked() {
    var t = null;
    try { t = topWin().__ncHandoff; } catch (e) {}
    return t || window.__ncHandoff || null;
  }
  function unpark() {
    try { topWin().__ncHandoff = null; } catch (e) {}
    window.__ncHandoff = null;
  }

  function fileFrom(p) {
    return new Promise(function (ok) {
      if (!p) return ok(null);
      var name = p.name || 'picture.png', type = p.type || 'image/png';
      if (p.blob) return ok(new File([p.blob], name, { type: type }));
      if (p.canvas) {
        try {
          return p.canvas.toBlob(function (b) {
            ok(b ? new File([b], name, { type: type }) : null);
          }, type);
        } catch (e) { return ok(null); }
      }
      ok(null);
    });
  }

  /* ------------------------------------------------------------- the tray */

  function idb() {
    return new Promise(function (ok, no) {
      var r;
      try { r = indexedDB.open(DB, 1); } catch (e) { return no(e); }
      r.onupgradeneeded = function () {
        if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE);
      };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { no(r.error); };
    });
  }
  function tx(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (ok, no) {
        var t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
        req.onsuccess = function () { ok(req.result); };
        req.onerror = function () { no(req.error); };
      });
    });
  }
  function trayPut(rec) { return tx('readwrite', function (s) { return s.put(rec, KEY); }); }
  function trayTake() {
    return tx('readonly', function (s) { return s.get(KEY); }).then(function (rec) {
      if (!rec) return null;
      return tx('readwrite', function (s) { return s.delete(KEY); })
        .catch(function () {})
        .then(function () {
          if (!rec.at || Date.now() - rec.at > STALE) return null;
          return rec;
        });
    }).catch(function () { return null; });
  }

  function channel() {
    try { return new BroadcastChannel('nc-handoff'); } catch (e) { return null; }
  }

  /* ------------------------------------------------------- the sending side */

  /* make() returns { name, type, canvas } — called at the moment of the drag
     so the picture is whatever is on screen then, not whatever it was when
     the page loaded. */
  function offer(el, make) {
    if (!el || el.__ncOffer) return;
    el.__ncOffer = 1;
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function (e) {
      var p = null;
      try { p = make(); } catch (err) { p = null; }
      if (!p) { e.preventDefault(); return; }
      park(p);
      try {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData(TYPE, p.name || 'picture');
        /* text/plain as well, so dropping it somewhere that has never heard
           of this still does something sensible rather than nothing. */
        e.dataTransfer.setData('text/plain', p.name || 'picture');
        if (p.canvas) {
          /* The picture, not a ghost of a button. Scaled down because the
             browser shows the drag image at its natural size and a 4000px
             canvas under the cursor is not a cursor. */
          var g = document.createElement('canvas');
          var s = Math.min(1, 160 / Math.max(1, p.canvas.width));
          g.width = Math.max(1, Math.round(p.canvas.width * s));
          g.height = Math.max(1, Math.round(p.canvas.height * s));
          g.getContext('2d').drawImage(p.canvas, 0, 0, g.width, g.height);
          /* It has to be in the document for one frame or Chromium ignores
             it; off screen so nobody ever sees it sitting there. */
          g.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
          document.body.appendChild(g);
          e.dataTransfer.setDragImage(g, Math.round(g.width / 2), Math.round(g.height / 2));
          setTimeout(function () { try { g.remove(); } catch (err) {} }, 0);
        }
      } catch (err) {}
    });
    el.addEventListener('dragend', function () { unpark(); });
  }

  /* The press. Writes the picture to the tray and tells anyone listening.
     Resolves with 'taken' when an editor was there to take it and 'waiting'
     when it is in the tray for the next one — the caller says which, because
     "sent" when nothing received it is the kind of lie that costs trust. */
  function send(p) {
    return fileFrom(p).then(function (f) {
      if (!f) return 'failed';
      /* An editor in this same window — the mini window case — can simply be
         handed it, no storage involved. */
      if (deliverHere(f)) return 'taken';
      return trayPut({ at: Date.now(), name: f.name, type: f.type, blob: f })
        .then(function () {
          var c = channel();
          if (c) { try { c.postMessage('take'); } catch (e) {} try { c.close(); } catch (e) {} }
          /* Give an editor in another frame or tab a moment to answer. */
          return new Promise(function (ok) {
            setTimeout(function () {
              tx('readonly', function (s) { return s.get(KEY); })
                .then(function (rec) { ok(rec ? 'waiting' : 'taken'); })
                .catch(function () { ok('waiting'); });
            }, 450);
          });
        })
        .catch(function () { return 'failed'; });
    });
  }

  /* Every editor in this window, including ones inside a mini window and the
     page around it. Same origin, so each frame's own NC_HANDOFF can be asked
     to do the import rather than this one reaching into its DOM. */
  function deliverHere(file) {
    var wins = [], i;
    try { wins.push(topWin()); } catch (e) {}
    try {
      var fr = topWin().document.querySelectorAll('iframe');
      for (i = 0; i < fr.length; i++) { try { if (fr[i].contentWindow) wins.push(fr[i].contentWindow); } catch (e) {} }
    } catch (e) {}
    for (i = 0; i < wins.length; i++) {
      try {
        var h = wins[i].NC_HANDOFF;
        if (h && h !== window.NC_HANDOFF && h.canTake && h.canTake() && h.take(file)) return true;
        if (h && h === window.NC_HANDOFF && canTake() && take(file)) return true;
      } catch (e) {}
    }
    return false;
  }

  /* ----------------------------------------------------- the editor's side */

  /* The input the Upload button drives. Identified by what it accepts rather
     than by a class the bundle is free to rename. */
  function fileInput() {
    var all = document.querySelectorAll('input[type=file]');
    for (var i = 0; i < all.length; i++) {
      if (/image/.test(all[i].accept || '')) return all[i];
    }
    return null;
  }
  function canTake() { return !!fileInput(); }

  function take(file) {
    var input = fileInput();
    if (!input || !file) return false;
    try {
      var dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch (e) { return false; }
  }

  /* The whole editor is the drop target, so there is no small square to aim
     at — but ONLY for a drag carrying our own type. An ordinary file dragged
     in off the desktop must reach the editor's own handler untouched, which
     means not calling preventDefault on it. */
  function acceptDrops() {
    var veil = null;
    function ours(e) {
      try { return [].indexOf.call(e.dataTransfer.types || [], TYPE) >= 0; }
      catch (err) { return false; }
    }
    function show(on) {
      if (on && !veil) {
        veil = document.createElement('div');
        veil.className = 'nchx-veil';
        veil.textContent = (window.tr && tr('hx_drop')) || 'Drop it here';
        document.body.appendChild(veil);
      } else if (!on && veil) {
        try { veil.remove(); } catch (e) {}
        veil = null;
      }
    }
    addEventListener('dragenter', function (e) { if (ours(e)) { e.preventDefault(); show(true); } }, true);
    addEventListener('dragover', function (e) {
      if (!ours(e)) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'copy'; } catch (err) {}
    }, true);
    addEventListener('dragleave', function (e) {
      /* Only when the pointer has actually left the window; dragleave also
         fires for every element boundary crossed on the way across. */
      if (e.relatedTarget === null && !e.clientX && !e.clientY) show(false);
    }, true);
    addEventListener('drop', function (e) {
      if (!ours(e)) return;
      e.preventDefault();
      show(false);
      var p = parked();
      unpark();
      fileFrom(p).then(function (f) { if (f) take(f); });
    }, true);
    addEventListener('dragend', function () { show(false); }, true);
  }

  function drain() {
    if (!canTake()) return;
    trayTake().then(function (rec) {
      if (!rec || !rec.blob) return;
      take(new File([rec.blob], rec.name || 'picture.png', { type: rec.type || 'image/png' }));
    });
  }

  function listen() {
    var c = channel();
    if (!c) return;
    c.onmessage = function (m) { if (m && m.data === 'take') drain(); };
  }

  /* ---------------------------------------------------------------- styles */

  function css() {
    if (document.getElementById('nchx-css')) return;
    var s = document.createElement('style');
    s.id = 'nchx-css';
    s.textContent =
      '.nchx-veil{position:fixed;inset:0;z-index:2147482000;pointer-events:none;' +
        'display:grid;place-items:center;' +
        'background:rgba(124,92,255,.14);border:3px dashed rgba(167,139,250,.75);' +
        'font:700 16px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;' +
        'text-shadow:0 2px 10px rgba(0,0,0,.6)}' +
      /* the chip, styled to sit in the Photo tool's own bar */
      '.nchx-send{display:inline-flex;align-items:center;gap:6px;cursor:grab}' +
      '.nchx-send:active{cursor:grabbing}' +
      '.nchx-send[disabled]{cursor:default;opacity:.45}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------- the roles */

  /* THE PHOTO TOOL. Its own API hands over the flattened document — the
     composite, at full size, not the zoomed preview on screen. */
  function asPhoto() {
    var P = window.NC_PHOTO;
    if (!P || typeof P.composite !== 'function') return false;
    var bar = document.querySelector('.bar');
    var save = document.getElementById('save');
    if (!bar || document.getElementById('nchxSend')) return true;

    function payload() {
      if (P.ready && !P.ready()) return null;
      var src = P.composite();
      if (!src || !src.width) return null;
      /* A COPY, NOT THE LIVE ONE. composite() returns the tool's own scratch
         canvas and reuses it on the very next render — so handing it over and
         reading it later, which is exactly what a drop does, would read
         whatever the tool had drawn since. */
      var c = document.createElement('canvas');
      c.width = src.width; c.height = src.height;
      c.getContext('2d').drawImage(src, 0, 0);
      var d = P.doc && P.doc();
      return { name: (d && d.name) || 'novaclip-photo.png', type: 'image/png', canvas: c };
    }

    var b = document.createElement('button');
    b.id = 'nchxSend';
    b.type = 'button';
    b.className = 'nchx-send';
    b.textContent = (window.tr && tr('hx_toeditor')) || 'To editor';
    b.title = (window.tr && tr('hx_toeditor_d')) || 'Drag this onto the editor, or press it to send the picture there';
    b.setAttribute('data-t', 'hx_toeditor');
    b.onclick = function () {
      var p = payload();
      if (!p) return;
      b.disabled = true;
      send(p).then(function (how) {
        b.disabled = false;
        var say = how === 'taken' ? (window.tr && tr('hx_sent')) || 'Sent to the editor.'
                : how === 'waiting' ? (window.tr && tr('hx_waiting')) || 'Ready — it will be there when you open the editor.'
                : (window.tr && tr('hx_failed')) || 'That could not be sent.';
        try { P.toast(say); } catch (e) {}
      });
    };
    offer(b, payload);

    /* Next to Export, which is where the other things you do with a finished
       picture already live. */
    if (save && save.parentNode === bar) bar.insertBefore(b, save);
    else bar.appendChild(b);

    /* Disabled until there is a picture, the same as Export. The tool's own
       syncBar owns that state for its buttons and does not know about this
       one, so it is mirrored rather than hooked. */
    setInterval(function () {
      var on = !(P.ready && !P.ready());
      if (b.disabled !== !on && document.activeElement !== b) b.disabled = !on;
    }, 500);
    return true;
  }

  /* THE VIDEO EDITOR. React has not necessarily rendered the input yet, so
     this is retried the same way editor-rail.js waits for its rail. */
  function asEditor() {
    if (!/\/editor\.html$/.test(location.pathname)) return false;
    acceptDrops();
    listen();
    var tries = 0;
    (function again() {
      if (canTake()) { drain(); return; }
      if (++tries > 30) return;
      setTimeout(again, 400);
    })();
    return true;
  }

  function start() {
    css();
    asEditor();
    if (!asPhoto()) {
      /* photo.html announces itself when its document is ready, and the
         script that builds NC_PHOTO runs after this one on some loads. */
      var n = 0;
      var t = setInterval(function () {
        if (asPhoto() || ++n > 30) clearInterval(t);
      }, 400);
      addEventListener('nc-photo-ready', function () { asPhoto(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_HANDOFF = {
    TYPE: TYPE,
    offer: offer, send: send,
    take: take, canTake: canTake, drain: drain,
    parked: parked
  };
})();
