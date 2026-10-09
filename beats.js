/* ============================================================================
   NOVACLIP — BEATS
   ============================================================================
   The other half of why a teenager edits in CapCut: cutting to the music. Doing
   it by hand means playing a track, tapping a key forty times, and dragging
   every cut a frame or two until it stops feeling late. This finds the beats in
   the audio and does three things with them — marks them on the ruler, cuts the
   selected clip on every one, or spaces the clips evenly across them.

   HOW THE BEATS ARE FOUND

   A beat is a sudden increase in loudness, not loudness itself: a sustained
   chord is loud for two seconds and is not two hundred beats. So the loudness
   curve is differentiated, the increases are kept and the decreases thrown away
   (that is "spectral flux" done on energy rather than on bins — cruder than a
   proper onset detector and perfectly adequate for music with a drum in it),
   and a peak counts only if it stands above the local average of the half
   second either side of it. The local average matters: a quiet intro and a loud
   chorus have completely different absolute levels and one fixed threshold
   would find every beat in the chorus and none in the intro.

   WHAT IT WILL GET WRONG

   Music with no percussion — a piano ballad, strings, somebody talking over a
   pad — has no sharp increases to find, and this will either find nothing or
   find breaths. The panel says what it found and how confident the spacing is,
   so the answer is visible before forty cuts land on the timeline.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncBeats) return;
  window.__ncBeats = 1;

  var HOP = 0.01;              /* 10ms — finer than captions need, beats are sharp */
  var MIN_GAP = 0.16;          /* 375bpm; below this it is one beat heard twice */

  function store() { return window.__ncStore; }

  function decode(url) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.reject(new Error('no audio support'));
    return fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      var ctx = new AC();
      return new Promise(function (ok, no) {
        var p = ctx.decodeAudioData(buf, ok, no);
        if (p && p.then) p.then(ok, no);
      }).then(function (a) { try { ctx.close(); } catch (e) {} return a; });
    });
  }

  function energy(audio) {
    var n = audio.numberOfChannels, rate = audio.sampleRate;
    var hop = Math.max(1, Math.round(rate * HOP));
    var out = new Float32Array(Math.floor(audio.length / hop));
    var chans = [];
    for (var c = 0; c < n; c++) chans.push(audio.getChannelData(c));
    for (var i = 0; i < out.length; i++) {
      var from = i * hop, to = from + hop, sum = 0;
      for (var j = from; j < to; j++) {
        var v = 0;
        for (var k = 0; k < n; k++) v += chans[k][j];
        sum += (v / n) * (v / n);
      }
      out[i] = Math.sqrt(sum / hop);
    }
    return out;
  }

  /* Onsets: where the loudness jumps, measured against the half second around
     it rather than against a number chosen in advance. */
  function onsets(env, sensitivity) {
    var flux = new Float32Array(env.length);
    for (var i = 1; i < env.length; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);

    var win = Math.round(0.5 / HOP);
    var beats = [], last = -99;
    var lift = 1.6 - (sensitivity || 0.5) * 0.9;     /* 0 = picky, 1 = greedy */
    for (var x = 1; x < flux.length - 1; x++) {
      if (flux[x] <= flux[x - 1] || flux[x] < flux[x + 1]) continue;   /* local peak only */
      var a = Math.max(0, x - win), b = Math.min(flux.length - 1, x + win), sum = 0;
      for (var y = a; y <= b; y++) sum += flux[y];
      var avg = sum / (b - a + 1);
      if (flux[x] < avg * (1 + lift) + 1e-4) continue;
      var t = x * HOP;
      if (t - last < MIN_GAP) continue;
      beats.push(+t.toFixed(3));
      last = t;
    }
    return beats;
  }

  /* How regular the spacing is, which is the honest way to say "is this music
     or is this somebody shuffling in a chair". */
  function tempo(beats) {
    if (beats.length < 4) return null;
    var gaps = [];
    for (var i = 1; i < beats.length; i++) gaps.push(beats[i] - beats[i - 1]);
    var sorted = gaps.slice().sort(function (a, b) { return a - b; });
    var med = sorted[Math.floor(sorted.length / 2)];
    if (!med || med < 0.1 || med > 2) return null;
    var close = gaps.filter(function (g) { return Math.abs(g - med) < med * 0.18; }).length;

    /* ONSETS ARE NOT THE TEMPO. A 120bpm track with a hat between the kicks
       has something happening every 0.25s, and reporting "240 bpm" to somebody
       who knows their song is 120 makes the whole panel look wrong. Tempo is
       folded into the range people actually count in, the same way every DJ
       app does it, and the raw onset rate is kept so the cut spacing can still
       use it. */
    var bpm = 60 / med;
    while (bpm > 180) bpm /= 2;
    while (bpm < 70) bpm *= 2;
    return { bpm: Math.round(bpm), onsetBpm: Math.round(60 / med),
             steady: close / gaps.length, gap: med };
  }

  /* ------------------------------------------------------------------- doing */
  function source() {
    var st = store() && store().getState();
    if (!st) return null;
    var byId = {};
    (st.assets || []).forEach(function (a) { byId[a.id] = a; });
    var sel = (st.clips || []).filter(function (c) { return c.id === st.selectedClipId; })[0];
    var audio = (st.clips || []).filter(function (c) {
      return c.assetId && c.kind === 'audio';
    }).sort(function (a, b) { return a.start - b.start; })[0];
    /* The beats come from the music, so an audio clip wins over the selection
       unless the selection is itself audio. */
    var pick = (sel && sel.kind === 'audio' && sel.assetId) ? sel : (audio || (sel && sel.assetId ? sel : null));
    if (!pick) return null;
    return { clip: pick, asset: byId[pick.assetId] || null };
  }

  function cutTarget() {
    var st = store().getState();
    var sel = (st.clips || []).filter(function (c) { return c.id === st.selectedClipId; })[0];
    if (sel && sel.kind === 'video') return sel;
    return (st.clips || []).filter(function (c) { return c.kind === 'video' && c.assetId; })
                           .sort(function (a, b) { return a.start - b.start; })[0] || null;
  }

  function mark(times, offset) {
    var s = store();
    var made = 0;
    times.forEach(function (t) {
      s.getState().addMarker(+(offset + t).toFixed(3), 'Beat');
      made++;
    });
    return made;
  }

  /* Cutting walks the beats forwards and re-finds the clip each time, because
     a split replaces one clip with two and the second half is the thing the
     next cut belongs in. */
  function cut(times, offset, clip) {
    var s = store();
    var id = clip.id, made = 0;
    times.forEach(function (t) {
      var at = offset + t;
      var st = s.getState();
      var target = st.clips.filter(function (c) {
        return (c.id === id || c.assetId === clip.assetId) &&
               at > c.start + 0.08 && at < c.start + c.duration - 0.08;
      })[0];
      if (!target) return;
      s.getState().splitClip(target.id, +at.toFixed(3));
      made++;
    });
    return made;
  }

  /* --------------------------------------------------------------- the panel */
  function css() {
    if (document.getElementById('ncbeat-css')) return;
    var s = document.createElement('style');
    s.id = 'ncbeat-css';
    s.textContent = [
      '.ncbeat-btn{position:fixed;left:140px;bottom:62px;z-index:99970;border:0;cursor:pointer;',
        'border-radius:999px;padding:9px 15px;font:700 12.5px/1 "Segoe UI",system-ui,sans-serif;',
        'color:#04121a;background:linear-gradient(110deg,#B6FF3C,#00F0FF 70%);',
        'box-shadow:0 8px 24px rgba(0,0,0,.4)}',
      '.ncbeat-btn:hover{filter:brightness(1.08)}',
      '.ncbeat{position:fixed;left:140px;bottom:104px;width:320px;max-width:calc(100vw - 36px);',
        'z-index:99980;border-radius:16px;padding:15px 16px;background:#0F1220;color:#EAF2FF;',
        'border:1px solid rgba(182,255,60,.45);box-shadow:0 18px 60px rgba(0,0,0,.55);',
        'font:13px/1.5 "Segoe UI",system-ui,sans-serif}',
      '.ncbeat h4{margin:0 0 3px;font-size:15px;display:flex;align-items:center;gap:8px}',
      '.ncbeat p{margin:0 0 10px;color:#8b93a7;font-size:12px;line-height:1.5}',
      '.ncbeat label{display:block;margin:8px 0 4px;font-size:11px;color:#8b93a7;',
        'text-transform:uppercase;letter-spacing:.06em}',
      '.ncbeat input[type=range]{width:100%;accent-color:#B6FF3C}',
      '.ncbeat select{width:100%;box-sizing:border-box;border-radius:9px;padding:7px 9px;font:inherit;',
        'font-size:12.5px;background:rgba(255,255,255,.05);color:#EAF2FF;',
        'border:1px solid rgba(255,255,255,.16)}',
      '.ncbeat .row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '.ncbeat button.go{flex:1;min-width:120px;padding:10px 12px;border-radius:10px;border:0;cursor:pointer;',
        'font:inherit;font-size:12.5px;font-weight:700;color:#04121a;',
        'background:linear-gradient(110deg,#B6FF3C,#00F0FF 70%)}',
      '.ncbeat button.alt{flex:1;min-width:100px;padding:10px 12px;border-radius:10px;cursor:pointer;',
        'font:inherit;font-size:12.5px;background:rgba(255,255,255,.07);color:#EAF2FF;',
        'border:1px solid rgba(255,255,255,.16)}',
      '.ncbeat .x{margin-left:auto;background:none;border:0;color:#8b93a7;cursor:pointer;font-size:18px;padding:0 2px}',
      '.ncbeat .note{margin-top:10px;font-size:11.5px;line-height:1.5;color:#8b93a7}',
      '.ncbeat .note.ok{color:#B6FF3C}.ncbeat .note.warn{color:#FFB443}'
    ].join('');
    document.head.appendChild(s);
  }

  var panel = null, found = null;

  function close() { if (panel) { panel.remove(); panel = null; } }

  function open() {
    css();
    if (panel) { close(); return; }
    panel = document.createElement('div');
    panel.className = 'ncbeat';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Beats');
    panel.innerHTML =
      '<h4>Beats <button class="x" aria-label="Close">&times;</button></h4>' +
      '<p>Finds the beat in the music on the timeline. Mark them, or cut the video on every one.</p>' +
      '<label>How many beats to find</label>' +
      '<input type="range" class="sens" min="0" max="100" value="50">' +
      '<label>Use every</label>' +
      '<select class="every"><option value="1">beat</option>' +
      '<option value="2" selected>2nd beat</option>' +
      '<option value="4">4th beat — once a bar</option>' +
      '<option value="8">8th beat — once every two bars</option></select>' +
      '<div class="row"><button class="go find">Find the beats</button></div>' +
      '<div class="row"><button class="alt mark" disabled>Mark them</button>' +
      '<button class="alt cut" disabled>Cut on every beat</button></div>' +
      '<div class="row"><button class="alt clear">Clear markers</button>' +
      '<button class="alt undo">Undo</button></div>' +
      '<div class="note"></div>';
    document.body.appendChild(panel);

    var note = panel.querySelector('.note');
    function say(t, kind) { note.className = 'note' + (kind ? ' ' + kind : ''); note.textContent = t; }

    panel.querySelector('.x').onclick = close;
    panel.querySelector('.undo').onclick = function () {
      store().getState().undo();
      say('Put back.', 'ok');
    };
    panel.querySelector('.clear').onclick = function () {
      var st = store().getState();
      var n = (st.markers || []).length;
      (st.markers || []).slice().forEach(function (m) { store().getState().removeMarker(m.id); });
      say(n + ' markers cleared.', 'ok');
    };

    panel.querySelector('.find').onclick = function () {
      var src = source();
      if (!src || !src.asset || !src.asset.url) return say('Put the music on the timeline first.', 'warn');
      say('Listening…');
      var sens = parseInt(panel.querySelector('.sens').value, 10) / 100;
      decode(src.asset.url).then(function (audio) {
        var all = onsets(energy(audio), sens);
        var t = tempo(all);
        var every = parseInt(panel.querySelector('.every').value, 10) || 1;
        /* Every onset is a cut every quarter of a second, which is not an edit,
           it is a strobe. Cutting on the bar is what people actually do. */
        var times = all.filter(function (_, i) { return i % every === 0; });
        found = { times: times, offset: src.clip.start || 0, all: all };
        panel.querySelector('.mark').disabled = !times.length;
        panel.querySelector('.cut').disabled = !times.length;
        if (!all.length) return say('No beats found. If the music has no drums in it, there is '
                                  + 'nothing sharp to find — try the slider further right.', 'warn');
        say(all.length + ' beats found' + (t ? ' · about ' + t.bpm + ' bpm, ' +
            Math.round(t.steady * 100) + '% evenly spaced' : ' · spacing is irregular') +
            ' · using ' + times.length + '.', 'ok');
      }).catch(function () {
        found = null;
        say('That file\'s audio could not be read in this browser.', 'warn');
      });
    };

    panel.querySelector('.mark').onclick = function () {
      if (!found) return;
      say(mark(found.times, found.offset) + ' markers on the ruler.', 'ok');
    };

    panel.querySelector('.cut').onclick = function () {
      if (!found) return;
      var target = cutTarget();
      if (!target) return say('No video clip to cut.', 'warn');
      if (found.times.length > 80 &&
          !confirm('That is ' + found.times.length + ' cuts. Undo puts it back — carry on?')) return;
      say(cut(found.times, found.offset, target) + ' cuts made.', 'ok');
    };
  }

  function button() {
    if (document.querySelector('.ncbeat-btn')) return;
    css();
    var b = document.createElement('button');
    b.className = 'ncbeat-btn';
    b.type = 'button';
    b.textContent = '♪ Beats';
    b.title = 'Find the beat and cut to it';
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

  window.NC_BEATS = { energy: energy, onsets: onsets, tempo: tempo };
})();
