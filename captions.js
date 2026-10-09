/* ============================================================================
   NOVACLIP — CAPTIONS
   ============================================================================
   The biggest single gap between this editor and the one teenagers already
   use. CapCut puts captions on a clip in two taps and that is most of why it
   is on their phone. This editor had no captions at all: you could add a text
   clip, set its start and its duration, and do that forty times by hand.

   WHAT THIS DOES, AND WHAT IT HONESTLY DOES NOT

   It does not transcribe. Speech recognition in a browser means either a
   75MB model downloaded before the first caption appears, or every second of
   audio sent to somebody's server — and the whole promise of this editor is
   that nothing anybody records leaves their device. So this takes the words
   from the person who said them: paste the script, and the timing is worked
   out from the audio.

   That turns out to be most of the value. The tedious part of captioning was
   never typing the words — it was cutting them into lines and dragging forty
   text clips onto the right frames.

   HOW THE TIMING WORKS

   The audio is decoded and reduced to a loudness curve, twenty milliseconds
   per sample. The quiet floor and the loud peak are measured from the clip
   itself rather than assumed, because a phone recording in a bedroom and a
   mic in a treated room have nothing in common. Anything above the floor by a
   tenth of the range counts as speech; gaps shorter than a breath are joined
   up; anything shorter than a syllable is thrown away. The script is then
   dealt across the speech runs in proportion to how long each one lasts, and
   each run is cut into lines of a few words.

   WHEN THE AUDIO CANNOT BE READ

   Some files will not decode — a codec the browser has no business knowing, a
   stream with no audio at all. The captions are then spread evenly across the
   clip and the panel says so in those words. An even spread that somebody
   nudges is worth more than an error message.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncCaptions) return;
  window.__ncCaptions = 1;

  var HOP = 0.02;              /* seconds per loudness sample */
  var JOIN_GAP = 0.28;         /* shorter than this and two runs are one */
  var MIN_RUN = 0.22;          /* shorter than this is a cough, not a word */
  var PAD_IN = 0.05, PAD_OUT = 0.10;

  function store() { return window.__ncStore; }

  /* ------------------------------------------------------------- the audio */
  function decode(url) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.reject(new Error('no audio support'));
    return fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      var ctx = new AC();
      return new Promise(function (ok, no) {
        /* Both callback and promise forms, because Safari still answers to the
           first one and the editor is meant to run on a phone. */
        var p = ctx.decodeAudioData(buf, ok, no);
        if (p && p.then) p.then(ok, no);
      }).then(function (audio) {
        try { ctx.close(); } catch (e) {}
        return audio;
      });
    });
  }

  /* A loudness curve, mono, one sample every HOP seconds. */
  function envelope(audio) {
    var n = audio.numberOfChannels, len = audio.length, rate = audio.sampleRate;
    var hop = Math.max(1, Math.round(rate * HOP));
    var out = new Float32Array(Math.floor(len / hop));
    var chans = [];
    for (var c = 0; c < n; c++) chans.push(audio.getChannelData(c));
    for (var i = 0; i < out.length; i++) {
      var from = i * hop, to = from + hop, sum = 0;
      for (var j = from; j < to; j++) {
        var v = 0;
        for (var k = 0; k < n; k++) v += chans[k][j];
        v /= n;
        sum += v * v;
      }
      out[i] = Math.sqrt(sum / hop);
    }
    /* A five-sample mean, so one loud consonant does not read as a word and
       one quiet frame does not cut a word in half. */
    var sm = new Float32Array(out.length);
    for (var x = 0; x < out.length; x++) {
      var a = Math.max(0, x - 2), b = Math.min(out.length - 1, x + 2), t = 0;
      for (var y = a; y <= b; y++) t += out[y];
      sm[x] = t / (b - a + 1);
    }
    return sm;
  }

  function percentile(arr, p) {
    var copy = Array.prototype.slice.call(arr).sort(function (a, b) { return a - b; });
    if (!copy.length) return 0;
    return copy[Math.min(copy.length - 1, Math.max(0, Math.round((copy.length - 1) * p)))];
  }

  /* Where somebody is talking. Thresholds are measured off this clip, never
     assumed: a bedroom recording and a studio have different floors and a
     fixed number would be wrong for both. */
  function runs(env, duration) {
    if (!env.length) return [];
    var floor = percentile(env, 0.20), peak = percentile(env, 0.98);
    var gate = Math.max(floor + (peak - floor) * 0.10, 0.004);
    var out = [], on = false, from = 0;
    for (var i = 0; i < env.length; i++) {
      var loud = env[i] > gate;
      if (loud && !on) { on = true; from = i; }
      else if (!loud && on) { on = false; out.push([from * HOP, i * HOP]); }
    }
    if (on) out.push([from * HOP, env.length * HOP]);

    var joined = [];
    out.forEach(function (r) {
      var last = joined[joined.length - 1];
      if (last && r[0] - last[1] < JOIN_GAP) last[1] = r[1];
      else joined.push([r[0], r[1]]);
    });
    return joined
      .filter(function (r) { return r[1] - r[0] >= MIN_RUN; })
      .map(function (r) {
        return [Math.max(0, r[0] - PAD_IN), Math.min(duration, r[1] + PAD_OUT)];
      });
  }

  /* ------------------------------------------------------------- the words */
  function words(script) {
    return String(script || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  }

  /* A SENTENCE IS THE UNIT, NOT A WORD.
     The first version dealt raw words across the speech runs in proportion to
     how long each run lasted, and the arithmetic was right while the result
     was obviously machine-made: it produced the line "stop. Here is the",
     which is the end of one sentence and the start of the next sharing a
     caption. Nobody writes that. Lines are therefore built inside a sentence
     and never across one, and whole sentences are what gets dealt to the runs.

     Splitting keeps the punctuation with the sentence it ends, and treats a
     line break in the pasted script as a full stop, because that is what
     somebody means when they paste a script in verses. */
  function sentences(script) {
    var text = String(script || '').replace(/\r/g, '');
    var parts = [];
    text.split(/\n+/).forEach(function (para) {
      var m = para.match(/[^.!?…]+[.!?…]*/g) || [];
      m.forEach(function (s) { if (s.trim()) parts.push(s.trim()); });
    });
    return parts.length ? parts : (text.trim() ? [text.trim()] : []);
  }

  function plan(script, speech, duration, perLine) {
    var sents = sentences(script);
    if (!sents.length) return [];
    var spans = speech.length ? speech : [[0, duration]];
    var spanTime = spans.map(function (s) { return s[1] - s[0]; });
    var total = spanTime.reduce(function (a, b) { return a + b; }, 0) || duration;

    /* Deal whole sentences to runs: each run should hold about as much of the
       script as it holds of the speaking time. A run gets at least one
       sentence while sentences remain, so a short run is never left silent
       with words still waiting. */
    var buckets = spans.map(function () { return []; });
    var quota = spanTime.map(function (t) {
      return sents.reduce(function (a, s) { return a + s.length; }, 0) * t / total;
    });
    var si = 0;
    for (var i = 0; i < spans.length && si < sents.length; i++) {
      var filled = 0;
      var leftRuns = spans.length - i - 1;
      /* always leave one sentence for each remaining run */
      var canTake = sents.length - si - leftRuns;
      while (si < sents.length && buckets[i].length < Math.max(1, canTake) &&
             (filled < quota[i] || buckets[i].length === 0)) {
        filled += sents[si].length;
        buckets[i].push(sents[si]);
        si++;
        if (i === spans.length - 1) continue;      /* last run takes the rest */
      }
    }
    while (si < sents.length) buckets[buckets.length - 1].push(sents[si++]);

    var out = [];
    buckets.forEach(function (mine, bi) {
      if (!mine.length) return;
      var span = spans[bi];
      /* lines, built one sentence at a time so none of them straddles a stop */
      var lines = [];
      mine.forEach(function (s) {
        var w = words(s);
        for (var k = 0; k < w.length; k += perLine) lines.push(w.slice(k, k + perLine).join(' '));
      });
      var chars = lines.reduce(function (t, l) { return t + l.length; }, 0) || 1;
      var t0 = span[0], left = span[1] - span[0];
      lines.forEach(function (text, li) {
        var share = li === lines.length - 1 ? left : (span[1] - span[0]) * (text.length / chars);
        share = Math.max(0.4, Math.min(share, Math.max(0.4, left)));
        out.push({ text: text, start: t0, duration: share });
        t0 += share; left -= share;
      });
    });
    return out;
  }

  /* ------------------------------------------------------------ the styles
     Written against the text clip the bundle already draws — only values it
     understands, and only animations it has code for (fade, zoom, bounce,
     typing, none). An unknown animation is a caption that never appears. */
  var STYLES = {
    clean: { label: 'Clean', fontSize: 56, fontWeight: 800, color: '#ffffff', stroke: 7,
             strokeColor: '#000000', uppercase: false, animation: 'fade', background: false,
             shadow: true, shadowBlur: 10, lineHeight: 1.15 },
    pop:   { label: 'Bold pop', fontSize: 68, fontWeight: 800, color: '#ffffff', stroke: 10,
             strokeColor: '#000000', uppercase: true, animation: 'zoom', background: false,
             shadow: true, shadowBlur: 12, letterSpacing: 1, lineHeight: 1.1 },
    bar:   { label: 'Subtitle bar', fontSize: 42, fontWeight: 600, color: '#ffffff', stroke: 0,
             uppercase: false, animation: 'fade', background: true, backgroundColor: '#000000',
             backgroundOpacity: 0.55, lineHeight: 1.25 },
    neon:  { label: 'Neon', fontSize: 62, fontWeight: 800, color: '#ffffff', stroke: 4,
             strokeColor: '#0b1020', uppercase: true, animation: 'bounce', glow: true,
             glowColor: '#00F0FF', background: false, lineHeight: 1.1 }
  };

  /* ------------------------------------------------------------ the writing */
  function textTrack(st) {
    var t = (st.tracks || []).filter(function (x) { return x.kind === 'text'; });
    if (t.length) return t[t.length - 1];
    st.addTrack('text');
    var s2 = store().getState();
    var made = (s2.tracks || []).filter(function (x) { return x.kind === 'text'; });
    return made[made.length - 1];
  }

  function write(rows, styleKey, place, offset) {
    var s = store();
    var st = s.getState();
    var track = textTrack(st);
    if (!track) return 0;
    var style = STYLES[styleKey] || STYLES.clean;
    /* POSITIONY IS A FRACTION OF THE FRAME, NOT PIXELS.
       The first version computed a third of the project height — 356 for a
       1080p project — and every caption was drawn three hundred frames below
       the picture. Nothing appeared and the data looked perfect, which is the
       worst kind of bug. Measured: 0 puts the middle of the line at 48.8% down
       the frame, 1 puts it at 96.7%, so it is a fraction and 0.52 lands a
       caption at about three quarters of the way down — clear of the picture
       and clear of the bar that TikTok and Reels paint over the bottom. */
    var y = place === 'middle' ? 0 : 0.52;

    var made = 0;
    rows.forEach(function (row) {
      var before = s.getState().clips.length;
      s.getState().addTextClip(track.id, +(offset + row.start).toFixed(3), row.text);
      var after = s.getState().clips;
      if (after.length <= before) return;
      var clip = after[after.length - 1];
      s.getState().updateClip(clip.id, { duration: Math.max(0.4, +row.duration.toFixed(3)), name: 'Caption' });
      var patch = {};
      Object.keys(style).forEach(function (k) { if (k !== 'label') patch[k] = style[k]; });
      s.getState().updateClipText(clip.id, patch);
      s.getState().updateClipTransform(clip.id, { positionY: y });
      made++;
    });
    return made;
  }

  /* --------------------------------------------------------------- the panel */
  function css() {
    if (document.getElementById('nccap-css')) return;
    var s = document.createElement('style');
    s.id = 'nccap-css';
    s.textContent = [
      '.nccap-btn{position:fixed;left:18px;bottom:62px;z-index:99970;border:0;cursor:pointer;',
        'border-radius:999px;padding:9px 15px;font:700 12.5px/1 "Segoe UI",system-ui,sans-serif;',
        'color:#04121a;background:linear-gradient(110deg,#7C5CFF,#00F0FF 60%);',
        'box-shadow:0 8px 24px rgba(0,0,0,.4)}',
      '.nccap-btn:hover{filter:brightness(1.08)}',
      '.nccap{position:fixed;left:18px;bottom:104px;width:340px;max-width:calc(100vw - 36px);',
        'max-height:min(72vh,660px);overflow:auto;z-index:99980;border-radius:16px;padding:15px 16px;',
        'background:#0F1220;color:#EAF2FF;border:1px solid rgba(124,92,255,.5);',
        'box-shadow:0 18px 60px rgba(0,0,0,.55);font:13px/1.5 "Segoe UI",system-ui,sans-serif}',
      '.nccap h4{margin:0 0 3px;font-size:15px;display:flex;align-items:center;gap:8px}',
      '.nccap p{margin:0 0 10px;color:#8b93a7;font-size:12px;line-height:1.5}',
      '.nccap textarea{width:100%;box-sizing:border-box;min-height:104px;resize:vertical;border-radius:10px;',
        'border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:#EAF2FF;',
        'padding:9px 10px;font:inherit;font-size:12.5px}',
      '.nccap textarea:focus{outline:0;border-color:#7C5CFF}',
      '.nccap label{display:block;margin:10px 0 4px;font-size:11px;color:#8b93a7;text-transform:uppercase;',
        'letter-spacing:.06em}',
      '.nccap select{width:100%;box-sizing:border-box;border-radius:9px;padding:7px 9px;font:inherit;',
        'font-size:12.5px;background:rgba(255,255,255,.05);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.nccap .two{display:flex;gap:8px}.nccap .two>div{flex:1;min-width:0}',
      '.nccap .row{display:flex;gap:8px;margin-top:13px}',
      '.nccap button.go{flex:1;padding:10px 12px;border-radius:10px;border:0;cursor:pointer;font:inherit;',
        'font-size:13px;font-weight:700;color:#04121a;background:linear-gradient(110deg,#7C5CFF,#00F0FF 55%)}',
      '.nccap button.alt{padding:10px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:12.5px;',
        'background:rgba(255,255,255,.07);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.nccap .x{margin-left:auto;background:none;border:0;color:#8b93a7;cursor:pointer;font-size:18px;padding:0 2px}',
      '.nccap .note{margin-top:10px;font-size:11.5px;line-height:1.5;color:#8b93a7}',
      '.nccap .note.ok{color:#6EE7A8}.nccap .note.warn{color:#FFB443}'
    ].join('');
    document.head.appendChild(s);
  }

  /* The clip the captions belong to: whatever is selected, else the first
     thing on the timeline with sound in it. */
  function source() {
    var st = store() && store().getState();
    if (!st) return null;
    var byId = {};
    (st.assets || []).forEach(function (a) { byId[a.id] = a; });
    var sel = (st.clips || []).filter(function (c) { return c.id === st.selectedClipId; })[0];
    var pick = sel && sel.assetId ? sel : (st.clips || []).filter(function (c) {
      return c.assetId && (c.kind === 'video' || c.kind === 'audio');
    }).sort(function (a, b) { return a.start - b.start; })[0];
    if (!pick) return null;
    return { clip: pick, asset: byId[pick.assetId] || null };
  }

  var panel = null;

  function close() { if (panel) { panel.remove(); panel = null; } }

  function open() {
    css();
    if (panel) { close(); return; }
    var src = source();
    panel = document.createElement('div');
    panel.className = 'nccap';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Captions');
    panel.innerHTML =
      '<h4>Captions <button class="x" aria-label="Close">&times;</button></h4>' +
      '<p>' + (src
        ? 'Paste what you say. The timing comes from the clip&rsquo;s own audio — nothing is uploaded.'
        : 'Put a video or an audio clip on the timeline first.') + '</p>' +
      '<textarea placeholder="Paste your script here. Full sentences are fine — it gets cut into lines for you."></textarea>' +
      '<div class="two">' +
        '<div><label>Words a line</label><select class="w">' +
          '<option value="3">3</option><option value="4" selected>4</option>' +
          '<option value="5">5</option><option value="6">6</option></select></div>' +
        '<div><label>Style</label><select class="s">' +
          Object.keys(STYLES).map(function (k) {
            return '<option value="' + k + '">' + STYLES[k].label + '</option>';
          }).join('') + '</select></div>' +
        '<div><label>Where</label><select class="p">' +
          '<option value="bottom">Bottom</option><option value="middle">Middle</option>' +
        '</select></div>' +
      '</div>' +
      '<div class="row"><button class="go">Make captions</button>' +
      '<button class="alt undo">Undo</button></div>' +
      '<div class="note"></div>';
    document.body.appendChild(panel);

    var ta = panel.querySelector('textarea');
    var note = panel.querySelector('.note');
    panel.querySelector('.x').onclick = close;
    panel.querySelector('.undo').onclick = function () {
      var s = store();
      if (s && s.getState().undo) { s.getState().undo(); say('Put back.', 'ok'); }
    };

    function say(t, kind) {
      note.className = 'note' + (kind ? ' ' + kind : '');
      note.textContent = t;
    }

    panel.querySelector('.go').onclick = function () {
      var src2 = source();
      if (!src2) return say('Nothing on the timeline to caption yet.', 'warn');
      if (!words(ta.value).length) return say('Paste the words first — this times them, it does not invent them.', 'warn');
      var perLine = parseInt(panel.querySelector('.w').value, 10) || 4;
      var styleKey = panel.querySelector('.s').value;
      var place = panel.querySelector('.p').value;
      var clip = src2.clip, asset = src2.asset;
      var dur = clip.duration || (asset && asset.duration) || 10;

      say('Reading the audio…');
      var url = asset && asset.url;
      var go = url ? decode(url) : Promise.reject(new Error('no file'));
      go.then(function (audio) {
        var speech = runs(envelope(audio), Math.min(dur, audio.duration));
        var rows = plan(ta.value, speech, dur, perLine);
        var made = write(rows, styleKey, place, clip.start || 0);
        say(made + ' captions, timed to ' + speech.length + ' bits of speech.', 'ok');
      }).catch(function () {
        /* No readable audio. Even spacing beats an error message. */
        var rows = plan(ta.value, [], dur, perLine);
        var made = write(rows, styleKey, place, clip.start || 0);
        say(made + ' captions, spread evenly — the audio in this clip could not be read, '
            + 'so nudge them on the timeline.', 'warn');
      });
    };
    ta.focus();
  }

  function button() {
    if (document.querySelector('.nccap-btn')) return;
    css();
    var b = document.createElement('button');
    b.className = 'nccap-btn';
    b.type = 'button';
    b.textContent = 'CC Captions';
    b.title = 'Caption this clip from your script';
    b.onclick = open;
    document.body.appendChild(b);
  }

  function boot() {
    /* The store is created by the bundle, so wait for it the way the other
       sidecars do rather than assuming load order. */
    var tries = 0;
    var t = setInterval(function () {
      if (window.__ncStore || tries++ > 60) { clearInterval(t); button(); }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* Exposed for the tests: the timing is arithmetic and should be checkable
     without a browser full of React. */
  window.NC_CAPTIONS = { envelope: envelope, runs: runs, plan: plan, styles: STYLES };
})();
