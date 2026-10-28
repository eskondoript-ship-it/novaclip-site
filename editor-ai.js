/* ==========================================================================
   editor-ai.js — the AI Tools panel, made to answer back and to let go

   Reported as "when I try to use the AI tools on the editor the editor lags
   or doesn't do anything". Driven in a real browser against a generated clip,
   that is three separate faults, and only one of them is slowness.

   1. IT DOES ANSWER. NOBODY CAN READ IT.
      Every outcome of every tool — the successes and the refusals alike —
      goes into one span rendered `max-w-[52%] text-right text-[10px]`, on the
      same line as the tool's name and its description. Measured: a 133x28
      box at 10px. "2 caption cards timed to the speech — type into them." is
      fifty-two characters and needs three lines in a box that holds two, so
      the end of it is simply cut off. "Select a clip on the timeline first."
      — far and away the most common outcome, because nothing is selected
      until you click a clip — is a grey whisper in the corner of a row you
      have already looked away from. Pressing a button and seeing nothing is
      exactly what was reported.

   2. ONE TOOL POISONS THE NEXT.
      "Time the Captions" ends by adding text clips, and adding a clip selects
      it. So the moment it finishes, the selected clip is a caption card. The
      next tool you press reads the selection, finds no media behind it, and
      says "That clip has no media file behind it." — about a video sitting
      in plain view on the timeline. Measured directly: run Time the Captions,
      then Cut the Silence, and the second one fails every time.

   3. "FIND THE SCENES" IS LINEAR IN THE LENGTH OF THE WHOLE FILE.
      It seeks a hidden <video> every 0.25s and samples a frame at each stop.
      Measured: 764ms for a 6s clip, 3287ms for a 30s clip — about 110ms per
      second of video, and it scans the ENTIRE asset even when the clip on the
      timeline is a three-second piece of it. A five-minute source is half a
      minute of a spinner the size of a thumbnail; a ten-minute source is over
      a minute. There is no progress and no way to stop it.

   So: the panel's answers are made readable, the selection is put back where
   the user left it, and the scan is replaced with one that reads only the
   part of the file the clip actually uses, says how far along it is, and can
   be called off.

   NOTHING HERE EDITS THE BUNDLE. The panel is React's; the scan is swapped by
   catching the click in the capture phase before React's root listener sees
   it, and the results are applied through the same store actions the bundle
   uses, so undo behaves as it always did.
   ========================================================================== */

(function () {
  'use strict';

  /* Guarded the way every sidecar here is: this file can be parsed before
     nova.js has defined tr, and the two keys it wants are the only text in
     this file that is not already the bundle's own English. */
  function tr(k) {
    try { return (typeof window.tr === 'function' && window.tr(k)) || ''; }
    catch (e) { return ''; }
  }
  function store() {
    return window.__ncStore && window.__ncStore.getState
      ? window.__ncStore.getState() : null;
  }

  /* The three that read the media. The rest of the panel sets a property on
     the selected clip and returns in a frame, and none of this applies. */
  var READS_MEDIA = { 'Time the Captions': 1, 'Cut the Silence': 1, 'Find the Scenes': 1 };

  /* ----------------------------------------------------------------------
     1. THE ANSWER, WHERE IT CAN BE READ
     ---------------------------------------------------------------------- */

  function styles() {
    if (document.getElementById('ncai-css')) return;
    var s = document.createElement('style');
    s.id = 'ncai-css';
    s.textContent = [
      /* The row wraps, and the message takes the whole of the second line.
         `order` rather than moving it in the DOM, because the DOM is React's
         and it rebuilds this row on every status change. The chip and the
         icon keep their places on line one. */
      '.ncai button{flex-wrap:wrap}',
      /* Matched on the arbitrary Tailwind class because that is the only
         thing that distinguishes the status span from the "Ready" chip
         beside it — both are bare spans. If a rebuild of the bundle ever
         changes that number this rule stops applying, and what comes back is
         today's behaviour rather than a broken panel. */
      '.ncai [class*="max-w-[52%]"]{max-width:none !important;flex:0 0 100%;order:9;',
      '  text-align:left !important;font-size:.78rem !important;line-height:1.45 !important;',
      '  white-space:normal;margin-top:7px;padding-top:7px;',
      '  border-top:1px solid rgba(255,255,255,.07)}',
      /* A refusal is not a result, and at 10px in the corner the two looked
         identical. */
      '.ncai [class*="text-amber"]{color:#fbbf24 !important;font-weight:600}',
      '.ncai [class*="text-emerald-300"]{color:#6ee7b7 !important;font-weight:600}',
      /* Those two are chosen to glow on the dark panel the bundle was drawn
         for, and this panel follows the site theme — on the light one they
         are mid-amber and mint on near-white, which is the colour of a
         caption, not of the sentence explaining why nothing happened. Same
         patch trends.html already applies to its own radar. */
      'html[data-theme="light"] .ncai [class*="text-amber"]{color:#b45309 !important}',
      'html[data-theme="light"] .ncai [class*="text-emerald-300"]{color:#047857 !important}',

      /* The progress strip for a long scan. Fixed rather than inside the
         panel: the panel is a narrow column that scrolls, and a progress bar
         you have to scroll to find is not progress. */
      '#ncai-run{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);',
      '  z-index:99990;display:flex;align-items:center;gap:14px;padding:12px 14px 12px 18px;',
      '  border-radius:14px;background:#11162a;border:1px solid rgba(255,255,255,.14);',
      '  box-shadow:0 18px 50px rgba(0,0,0,.5);font:600 .82rem/1.3 system-ui,sans-serif;',
      '  color:#e8edf8;max-width:min(520px,92vw)}',
      '#ncai-run .t{flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;',
      '  text-overflow:ellipsis}',
      '#ncai-run .bar{flex:1 1 90px;min-width:70px;height:6px;border-radius:999px;',
      '  background:rgba(255,255,255,.12);overflow:hidden}',
      '#ncai-run .bar i{display:block;height:100%;width:0;border-radius:999px;',
      '  background:linear-gradient(90deg,#22d3ee,#a78bfa);transition:width .18s linear}',
      '#ncai-run button{font:inherit;cursor:pointer;color:#e8edf8;padding:7px 14px;',
      '  border-radius:999px;background:rgba(255,255,255,.08);',
      '  border:1px solid rgba(255,255,255,.18)}',
      '#ncai-run button:hover{background:rgba(255,255,255,.16)}'
    ].join('');
    document.head.appendChild(s);
  }

  /* The panel is mounted and thrown away as the right-hand tab changes, so
     this runs on a cheap observer rather than once at load. The h2 is the
     only stable thing in it — the class names are Tailwind and the structure
     is React's. */
  function tagPanel() {
    var heads = document.querySelectorAll('h2');
    for (var i = 0; i < heads.length; i++) {
      if ((heads[i].textContent || '').trim() !== 'AI Tools') continue;
      var root = heads[i].closest('div.flex-col') || heads[i].parentElement;
      while (root && !root.querySelector('button p')) root = root.parentElement;
      if (root && !root.classList.contains('ncai')) root.classList.add('ncai');
      return;
    }
  }

  /* ----------------------------------------------------------------------
     2. THE SELECTION, PUT BACK
     ---------------------------------------------------------------------- */

  function watchSelection(btn, beforeId) {
    var S = store();
    if (!S || !beforeId) return;
    var before = (S.clips || []).filter(function (c) { return c.id === beforeId; })[0];
    if (!before || !before.assetId) return;   /* nothing worth protecting */

    /* WATCH, DO NOT WAIT AND THEN LOOK.
       The first version waited for the bundle's spinner to clear and then
       checked the selection once, and it never fired. This listener is on the
       capture phase, so it runs BEFORE React's click handler — at the moment
       it is installed the tool has not started and there is no spinner, so
       "wait until the spinner is gone" was already true and the check ran
       against a selection nothing had touched yet.

       So it watches instead. Every tick looks at the selection; the spinner
       only decides how long to keep looking, which is what it is actually
       good for — a tool that is still running keeps the watch alive past the
       eight seconds that cover the quick ones. */
    var t0 = Date.now(), sawSpin = false;
    (function poll() {
      var spin = !!btn.querySelector('.animate-spin');
      if (spin) sawSpin = true;

      var s = store();
      if (s && s.selectedClipId !== beforeId) {
        var now = (s.clips || []).filter(function (c) { return c.id === s.selectedClipId; })[0];
        /* Only when the tool moved the selection onto something with no media
           behind it. A tool that deliberately selects another piece of
           footage — a split, say — is left alone, and so is a selection the
           person made themselves while it ran. */
        if (now && !now.assetId) s.selectClip(beforeId);
        return;
      }

      var ms = Date.now() - t0;
      if (ms > 120000 || (!spin && !sawSpin && ms > 8000) || (sawSpin && !spin && ms > 600)) return;
      setTimeout(poll, 120);
    })();
  }

  /* ----------------------------------------------------------------------
     3. THE SCAN, BOUNDED AND INTERRUPTIBLE
     ---------------------------------------------------------------------- */

  var running = null;

  function runBar(label) {
    var old = document.getElementById('ncai-run');
    if (old) old.remove();
    var w = document.createElement('div');
    w.id = 'ncai-run';
    w.setAttribute('role', 'status');
    var t = document.createElement('span'); t.className = 't'; t.textContent = label;
    var bar = document.createElement('span'); bar.className = 'bar';
    var fill = document.createElement('i'); bar.appendChild(fill);
    var stop = document.createElement('button');
    stop.type = 'button';
    stop.textContent = tr('ui_cancel') || 'Cancel';
    w.appendChild(t); w.appendChild(bar); w.appendChild(stop);
    document.body.appendChild(w);
    return {
      at: function (f) { fill.style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + '%'; },
      onstop: function (fn) { stop.addEventListener('click', fn); },
      done: function () { w.remove(); }
    };
  }

  function say(text, bad) {
    try { if (typeof window.toast === 'function') return window.toast(text); } catch (e) {}
    if (bad) try { console.warn(text); } catch (e) {}
  }

  function openVideo(url) {
    return new Promise(function (ok, no) {
      var v = document.createElement('video');
      v.src = url; v.muted = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
      var t = setTimeout(function () { no(new Error('That clip took too long to open.')); }, 15000);
      v.onloadeddata = function () { clearTimeout(t); ok(v); };
      v.onerror = function () {
        clearTimeout(t); no(new Error('That clip could not be decoded for scene detection.'));
      };
    });
  }

  function seek(v, t) {
    return new Promise(function (done) {
      var fired = false;
      function go() { if (fired) return; fired = true; v.removeEventListener('seeked', go); done(); }
      v.addEventListener('seeked', go);
      try { v.currentTime = t; } catch (e) { go(); }
      /* 400ms, not the 1200ms the bundle waits. A seek that has not landed in
         four hundred milliseconds has missed its frame, and on a long file
         the difference between the two numbers is the difference between a
         scan you wait for and a scan you abandon. */
      setTimeout(go, 400);
    });
  }

  async function findScenes() {
    var S = store();
    if (!S) return;
    var clip = (S.clips || []).filter(function (c) { return c.id === S.selectedClipId; })[0];
    if (!clip) return say('Select a clip on the timeline first.', true);
    var asset = (S.assets || []).filter(function (a) { return a.id === clip.assetId; })[0];
    if (!asset || !asset.url) return say('That clip has no media file behind it.', true);
    if (running) return;

    /* ONLY THE PART OF THE FILE THIS CLIP USES.
       The bundle hands the whole asset to the scanner and then throws away
       every cut outside the clip's length — so trimming a ten-minute source
       down to eight seconds still costs the full ten minutes of seeking, and
       on a clip whose source does not start at zero the cuts it keeps are
       offset by however far in it was trimmed. Both fall out of scanning the
       window the clip actually shows. */
    var from = Math.max(0, (clip.sourceStart || 0) + (clip.trimIn || 0));
    var span = clip.duration || 0;

    var cancelled = false;
    var ui = runBar((tr('ts_ai_scanning') || 'Scanning') + ' · ' + (asset.name || 'clip'));
    ui.onstop(function () { cancelled = true; });
    running = true;

    var v = null;
    try {
      v = await openVideo(asset.url);
      var dur = isFinite(v.duration) ? v.duration : 0;
      /* A WebM written by MediaRecorder carries no duration in its header and
         reports Infinity until the end of the file has been seen — the same
         trap publish.html and moderate.js already work around. Seeking past
         the end settles it. Without this the scan has no end to stop at. */
      if (!dur) {
        await seek(v, 1e7);
        dur = isFinite(v.duration) ? v.duration : 0;
        await seek(v, from);
      }
      var to = dur ? Math.min(dur, from + span) : from + span;

      var W = 32, H = 18;
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var g = c.getContext('2d', { willReadFrequently: true });
      if (!g) throw new Error('Could not open a canvas to sample frames.');

      var STEP = 0.25, SENS = 26, MIN_GAP = 1;
      var cuts = [], prev = null, last = -Infinity;

      for (var t = from; t < to; t += STEP) {
        if (cancelled) break;
        await seek(v, t);
        g.drawImage(v, 0, 0, W, H);
        var d;
        try { d = g.getImageData(0, 0, W, H).data; }
        catch (e) { throw new Error('The video is from another site, so its frames cannot be read here.'); }
        if (prev) {
          var sum = 0;
          for (var i = 0; i < d.length; i += 4) {
            sum += Math.abs(d[i] - prev[i]) + Math.abs(d[i + 1] - prev[i + 1]) +
                   Math.abs(d[i + 2] - prev[i + 2]);
          }
          if (sum / (d.length / 4 * 3) > SENS && t - last >= MIN_GAP) { cuts.push(t); last = t; }
        }
        prev = new Uint8ClampedArray(d);
        ui.at(span ? (t - from) / span : 0);
      }

      /* Back to where they belong on the timeline. `t` is a time inside the
         source file; the clip shows that file starting at `from` and sitting
         at `clip.start`, so the offset is the difference. For an untrimmed
         clip this is the bundle's own arithmetic; for a trimmed one it is
         the arithmetic the bundle is missing. */
      var at = cuts.map(function (t) { return t - from; })
                   .filter(function (o) { return o > 0.4 && o < span - 0.4; });

      if (!at.length) {
        say(cancelled ? 'Scan stopped — nothing split.'
                      : 'No hard cuts found — it looks like one continuous shot.');
      } else {
        var s2 = store();
        if (s2.pushHistory) s2.pushHistory();
        /* Back to front, because splitting renumbers everything after the
           cut and a forward pass would split the pieces it had just made. */
        at.slice().reverse().forEach(function (o) { s2.splitClip(clip.id, clip.start + o); });
        at.forEach(function (o) { s2.addMarker(clip.start + o, 'scene'); });
        say(at.length + ' scene change' + (at.length === 1 ? '' : 's') +
            ' found and split' + (cancelled ? ' (stopped early).' : '.'));
      }
    } catch (e) {
      say((e && e.message) || 'That did not work.', true);
    }
    try { if (v) v.src = ''; } catch (e) {}
    ui.done();
    running = false;
  }

  /* ----------------------------------------------------------------------
     WIRING
     ---------------------------------------------------------------------- */

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('button');
    if (!btn) return;
    var panel = btn.closest('.ncai');
    if (!panel) return;
    var label = btn.querySelector('p');
    var name = label ? (label.textContent || '').trim() : '';
    if (!READS_MEDIA[name]) return;

    if (name === 'Find the Scenes') {
      /* Capture phase, so this lands before React's root listener and the
         bundle's own scan never starts. preventDefault as well as
         stopPropagation: the row is a <button> inside no form, but a button
         that visibly does nothing on mousedown is worse than one that does
         the wrong thing. */
      e.preventDefault();
      e.stopPropagation();
      findScenes();
      return;
    }

    var S = store();
    if (S) watchSelection(btn, S.selectedClipId);
  }, true);

  function boot() {
    styles();
    tagPanel();
    try {
      new MutationObserver(tagPanel).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
