/* ============================================================================
   NOVACLIP — REFRAME
   ============================================================================
   Footage is shot wide and posted tall. Every short on this planet started life
   as a 16:9 recording that somebody had to crop, and doing it by hand means
   setting the project to 9:16, scaling every clip up until it fills, and then
   dragging each one left or right until the person talking is not half out of
   frame.

   This does the dragging. It samples frames out of the clip, works out which
   vertical strip of the picture is worth keeping, and sets the scale and the
   offset so that strip is what survives the crop.

   WHAT "WORTH KEEPING" MEANS HERE

   Not faces — face detection in a browser means shipping a model, and this
   file is 12KB. It uses two things that correlate well enough with the subject
   and cost nothing: detail (how much is going on in a column of pixels) and
   movement (how much that column changes between samples). A person talking in
   front of a flat wall wins on both. A static logo in the corner wins on
   neither. Where the picture is uniformly busy the answer comes out near the
   middle, which is also what a person would have done.

   THE NUMBERS THIS DEPENDS ON, ALL MEASURED

   The renderer draws a clip contained in the frame, so a 16:9 source in a 9:16
   project fills the width and letterboxes top and bottom. Filling the frame
   therefore needs scale = (frameH / frameW) x sourceAspect — 3.16 for 16:9 into
   9:16. positionX and positionY are in half-frames: 1.0 moves the picture by
   half the frame width, which is why a value of 1 puts the centre at the edge.
   Both were measured against the real preview rather than assumed, because
   both are the kind of thing that silently draws everything off-screen.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncReframe) return;
  window.__ncReframe = 1;

  var SAMPLES = 9;             /* frames looked at per clip */
  var COLS = 64;               /* columns the picture is reduced to */

  function store() { return window.__ncStore; }

  var SHAPES = {
    '9:16':  { w: 1080, h: 1920, label: '9:16 — TikTok, Reels, Shorts' },
    '1:1':   { w: 1080, h: 1080, label: '1:1 — feed square' },
    '4:5':   { w: 1080, h: 1350, label: '4:5 — Instagram portrait' },
    '16:9':  { w: 1920, h: 1080, label: '16:9 — YouTube, back to wide' }
  };

  /* --------------------------------------------------------------- looking */
  /* Sample frames out of a video and score every column for detail and for
     movement. Returns one array of scores across the width. */
  function interest(url, duration) {
    return new Promise(function (ok, no) {
      var v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.crossOrigin = 'anonymous';
      v.preload = 'auto';
      var cv = document.createElement('canvas');
      var W = 160, H = 90;
      cv.width = W; cv.height = H;
      var g = cv.getContext('2d', { willReadFrequently: true });
      var cols = new Float64Array(COLS), prev = null, done = 0, failed = false;

      function bail(e) { if (!failed) { failed = true; no(e || new Error('no frames')); } }

      v.onerror = bail;
      v.onloadedmetadata = function () {
        var dur = isFinite(v.duration) && v.duration > 0 ? v.duration : (duration || 5);
        var times = [];
        for (var i = 0; i < SAMPLES; i++) times.push(dur * (i + 0.5) / SAMPLES);
        var at = 0;

        function seek() {
          if (at >= times.length) return finish();
          v.currentTime = Math.min(times[at++], Math.max(0, dur - 0.05));
        }
        v.onseeked = function () {
          try {
            g.drawImage(v, 0, 0, W, H);
            var d = g.getImageData(0, 0, W, H).data;
            var lum = new Float64Array(W * H);
            for (var i = 0; i < W * H; i++) {
              lum[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
            }
            for (var x = 0; x < W; x++) {
              var detail = 0, move = 0;
              for (var y = 0; y < H; y++) {
                var k = y * W + x;
                if (x + 1 < W) detail += Math.abs(lum[k + 1] - lum[k]);
                if (y + 1 < H) detail += Math.abs(lum[k + W] - lum[k]);
                if (prev) move += Math.abs(lum[k] - prev[k]);
              }
              /* Movement counts for more than detail: a busy background is
                 detailed and nobody is looking at it. */
              cols[Math.floor(x * COLS / W)] += detail + move * 2.2;
            }
            prev = lum;
            done++;
          } catch (e) { /* a tainted frame — carry on, the rest may work */ }
          seek();
        };
        seek();
      };

      function finish() {
        try { v.src = ''; } catch (e) {}
        if (!done) return bail();
        ok(cols);
      }
      setTimeout(function () { if (!failed && !done) bail(); }, 12000);
      v.src = url;
    });
  }

  /* The best window of the picture to keep, as a fraction across. */
  function window_(cols, keep) {
    var n = cols.length;
    var width = Math.max(1, Math.round(keep * n));
    if (width >= n) return 0.5;
    var run = 0, best = -1, bestAt = 0;
    for (var i = 0; i < n; i++) {
      run += cols[i];
      if (i >= width) run -= cols[i - width];
      if (i >= width - 1 && run > best) { best = run; bestAt = i - width + 1; }
    }
    return (bestAt + width / 2) / n;
  }

  /* ---------------------------------------------------------------- doing */
  function aspect(asset, clip) {
    var w = (asset && asset.width) || 1920, h = (asset && asset.height) || 1080;
    return w / h || 16 / 9;
  }

  /* scale that makes a source fill the frame, and the positionX that puts the
     chosen window in the middle of it. Both derived from measurements of the
     real renderer — see the header. */
  function fit(srcAspect, frameW, frameH, centre) {
    var contained = frameW / srcAspect;              /* drawn height at scale 1 */
    var scale = contained < frameH ? frameH / contained : 1;
    var visible = 1 / scale;                         /* fraction of the source kept */
    var u = Math.max(visible / 2, Math.min(1 - visible / 2, centre));
    /* positionX is in half-frames, so a shift of d frame-widths needs 2d */
    var px = scale * (1 - 2 * u);
    return { scale: +scale.toFixed(4), positionX: +px.toFixed(4), visible: visible, centre: u };
  }

  function apply(shapeKey, smart, onStep) {
    var shape = SHAPES[shapeKey];
    var s = store();
    var st = s.getState();
    var byId = {};
    (st.assets || []).forEach(function (a) { byId[a.id] = a; });
    var clips = (st.clips || []).filter(function (c) {
      return c.kind === 'video' && c.assetId;
    });
    s.getState().updateSettings({ width: shape.w, height: shape.h });

    var i = 0;
    function next() {
      if (i >= clips.length) return Promise.resolve(clips.length);
      var clip = clips[i++];
      var asset = byId[clip.assetId];
      var sa = aspect(asset, clip);
      var plain = fit(sa, shape.w, shape.h, 0.5);
      /* Put the safe version in first, so a clip whose frames cannot be read
         still comes out filling the frame rather than letterboxed. */
      s.getState().updateClipTransform(clip.id, { scale: plain.scale, positionX: plain.positionX });
      if (onStep) onStep(i, clips.length);
      if (!smart || !asset || !asset.url || plain.visible >= 0.999) return next();
      return interest(asset.url, clip.duration).then(function (cols) {
        var c = window_(cols, plain.visible);
        var f = fit(sa, shape.w, shape.h, c);
        s.getState().updateClipTransform(clip.id, { scale: f.scale, positionX: f.positionX });
      }).catch(function () { /* keep the centred version */ }).then(next);
    }
    return next();
  }

  /* --------------------------------------------------------------- the panel */
  function css() {
    if (document.getElementById('ncrf-css')) return;
    var s = document.createElement('style');
    s.id = 'ncrf-css';
    s.textContent = [
      '.ncrf-btn{position:fixed;left:240px;bottom:62px;z-index:99970;border:0;cursor:pointer;',
        'border-radius:999px;padding:9px 15px;font:700 12.5px/1 "Segoe UI",system-ui,sans-serif;',
        'color:#04121a;background:linear-gradient(110deg,#FF2E97,#FFB443 75%);',
        'box-shadow:0 8px 24px rgba(0,0,0,.4)}',
      '.ncrf-btn:hover{filter:brightness(1.08)}',
      '.ncrf{position:fixed;left:240px;bottom:104px;width:320px;max-width:calc(100vw - 36px);',
        'z-index:99980;border-radius:16px;padding:15px 16px;background:#0F1220;color:#EAF2FF;',
        'border:1px solid rgba(255,46,151,.45);box-shadow:0 18px 60px rgba(0,0,0,.55);',
        'font:13px/1.5 "Segoe UI",system-ui,sans-serif}',
      '.ncrf h4{margin:0 0 3px;font-size:15px;display:flex;align-items:center;gap:8px}',
      '.ncrf p{margin:0 0 10px;color:#8b93a7;font-size:12px;line-height:1.5}',
      '.ncrf label{display:block;margin:9px 0 4px;font-size:11px;color:#8b93a7;',
        'text-transform:uppercase;letter-spacing:.06em}',
      '.ncrf select{width:100%;box-sizing:border-box;border-radius:9px;padding:7px 9px;font:inherit;',
        'font-size:12.5px;background:rgba(255,255,255,.05);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.ncrf .chk{display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:12px;color:#c9d2e6}',
      '.ncrf .row{display:flex;gap:8px;margin-top:12px}',
      '.ncrf button.go{flex:1;padding:10px 12px;border-radius:10px;border:0;cursor:pointer;font:inherit;',
        'font-size:12.5px;font-weight:700;color:#04121a;background:linear-gradient(110deg,#FF2E97,#FFB443 75%)}',
      '.ncrf button.alt{padding:10px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:12.5px;',
        'background:rgba(255,255,255,.07);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.ncrf .x{margin-left:auto;background:none;border:0;color:#8b93a7;cursor:pointer;font-size:18px;padding:0 2px}',
      '.ncrf .note{margin-top:10px;font-size:11.5px;line-height:1.5;color:#8b93a7}',
      '.ncrf .note.ok{color:#6EE7A8}.ncrf .note.warn{color:#FFB443}'
    ].join('');
    document.head.appendChild(s);
  }

  var panel = null;
  function close() { if (panel) { panel.remove(); panel = null; } }

  function open() {
    css();
    if (panel) { close(); return; }
    panel = document.createElement('div');
    panel.className = 'ncrf';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Reframe');
    panel.innerHTML =
      '<h4>Reframe <button class="x" aria-label="Close">&times;</button></h4>' +
      '<p>Changes the shape of the whole project and re-crops every video clip to fit it.</p>' +
      '<label>Shape</label><select class="shape">' +
      Object.keys(SHAPES).map(function (k) {
        return '<option value="' + k + '"' + (k === '9:16' ? ' selected' : '') + '>' +
               SHAPES[k].label + '</option>';
      }).join('') + '</select>' +
      '<div class="chk"><input type="checkbox" class="smart" checked id="ncrf-smart">' +
      '<label for="ncrf-smart" style="margin:0;text-transform:none;letter-spacing:0;font-size:12px;color:#c9d2e6">' +
      'Find the subject in each clip (looks at nine frames — a second or two per clip)</label></div>' +
      '<div class="row"><button class="go">Reframe</button><button class="alt undo">Undo</button></div>' +
      '<div class="note"></div>';
    document.body.appendChild(panel);

    var note = panel.querySelector('.note');
    function say(t, k) { note.className = 'note' + (k ? ' ' + k : ''); note.textContent = t; }
    panel.querySelector('.x').onclick = close;
    panel.querySelector('.undo').onclick = function () {
      store().getState().undo(); say('Put back.', 'ok');
    };
    panel.querySelector('.go').onclick = function () {
      var shape = panel.querySelector('.shape').value;
      var smart = panel.querySelector('.smart').checked;
      var st = store().getState();
      var n = (st.clips || []).filter(function (c) { return c.kind === 'video' && c.assetId; }).length;
      if (!n) return say('No video clips on the timeline yet.', 'warn');
      store().getState().pushHistory();
      say(smart ? 'Looking at the footage…' : 'Reframing…');
      apply(shape, smart, function (i, total) { say('Clip ' + i + ' of ' + total + '…'); })
        .then(function (count) {
          say(count + ' clips reframed to ' + shape + (smart ? ', each cropped to its subject.' : '.'), 'ok');
        })
        .catch(function () { say('Reframed, but the footage could not be read — clips are centre-cropped.', 'warn'); });
    };
  }

  function button() {
    if (document.querySelector('.ncrf-btn')) return;
    css();
    var b = document.createElement('button');
    b.className = 'ncrf-btn';
    b.type = 'button';
    b.textContent = '⤢ Reframe';
    b.title = 'Crop the whole project to another shape';
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

  window.NC_REFRAME = { fit: fit, window: window_, shapes: SHAPES };
})();
