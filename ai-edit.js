/* AI EDIT — carries out the plan instead of describing it.
 *
 * WHAT CHANGED AND WHY
 *
 * The Publish page asked the AI for an edit and printed a list: "0:03 Overlay a
 * bold title reading GREATEST PUSKAS GOAL EVER?". Good advice, and then the
 * person had to go and do all eight of them by hand. The AI planned; the human
 * edited. This file is the other half — it takes the same plan and performs it
 * on the timeline.
 *
 * HOW IT REACHES THE EDITOR
 *
 * editor.html is a bundled React app, so there is no source to add a feature
 * to. It does expose its state store as window.__ncStore, and that store's
 * actions are the entire editing API the app's own buttons use: addTextClip,
 * updateClipTransform, updateClipSpeed, setClipTransition, updateClipColor,
 * updateClipEffects, splitClip, updateClip. Driving those is not a side door —
 * it is the same door the toolbar goes through, which is why undo, autosave and
 * the preview all behave normally afterwards.
 *
 * WHAT IT WILL NOT PRETEND TO DO
 *
 * Of the sixteen tools the planner is allowed to name, nine can be carried out
 * from a description alone. The other seven cannot, and they are not failures —
 * they are steps that need a person:
 *
 *   - background music, sound effects and stickers need somebody to CHOOSE one.
 *     An AI picking the track is an AI picking your taste.
 *   - the Remove and Animate tools need you to point at the thing.
 *   - cutting and reordering need judgement about what is worth keeping, which
 *     is the one part of editing worth doing yourself.
 *
 * Those steps are handed back saying so, with the right tab already open. The
 * alternative — quietly doing nothing and reporting eight of eight applied —
 * is the kind of lie that makes a tool untrustworthy for everything else.
 */
(function () {
  'use strict';
  if (window.NC_AI_EDIT) return;

  var KEY = 'nc_ai_edit_plan';

  /* ---- the plan, handed from one page to the other ---------------------- */
  function stash(plan, about) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ steps: plan, about: about || '', at: Date.now() }));
      return true;
    } catch (e) { return false; }
  }
  function pending() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY) || 'null');
      /* An hour. A plan older than that belongs to a video the person has
         almost certainly moved on from, and silently applying it to whatever
         is on the timeline now would be worse than forgetting it. */
      if (p && p.steps && p.steps.length && Date.now() - p.at < 3600e3) return p;
    } catch (e) {}
    return null;
  }
  function clearPending() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ---- helpers ---------------------------------------------------------- */
  function store() { return window.__ncStore || null; }
  function secs(at) {
    if (typeof at === 'number') return Math.max(0, at);
    var m = String(at || '').match(/^(\d+):(\d+(?:\.\d+)?)$/);
    if (m) return (+m[1]) * 60 + (+m[2]);
    var n = parseFloat(at);
    return isNaN(n) ? 0 : Math.max(0, n);
  }
  function clamp(v, lo, hi, dflt) {
    var n = parseFloat(v);
    if (isNaN(n)) return dflt;
    return Math.min(hi, Math.max(lo, n));
  }
  function trackOf(st, kind) {
    var t = st.tracks.filter(function (x) { return x.kind === kind; });
    return t.length ? t[0] : null;
  }
  /* The clip a timestamp lands on. Steps are written against the video, so the
     one playing at that moment is the one the step is about. */
  function clipAt(st, t) {
    var vids = st.clips.filter(function (c) { return c.kind === 'video' || c.kind === 'image'; });
    var hit = vids.filter(function (c) { return t >= c.start && t < c.start + c.duration; })[0];
    return hit || vids.sort(function (a, b) { return a.start - b.start; })[0] || null;
  }
  var EFFECTS = ['blur', 'glow', 'vignette', 'noise', 'rgbSplit', 'sharpen', 'pixelate', 'vintage',
    'filmGrain', 'emboss', 'chromaticAberration', 'glitch', 'mirror', 'kaleidoscope', 'posterize',
    'edgeDetect', 'halftone', 'ascii', 'nightVision', 'thermal', 'hologram', 'dreamy', 'prism',
    'wave', 'shake', 'zoomPunch', 'glitchRGB', 'scanlines', 'bloom', 'toon', 'crosshatch', 'dots',
    'neon', 'invert', 'grayscale', 'sepia'];
  function effectKey(name) {
    var want = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
    for (var i = 0; i < EFFECTS.length; i++) {
      if (EFFECTS[i].toLowerCase() === want) return EFFECTS[i];
    }
    return null;
  }
  var TRANSITIONS = ['fade', 'dissolve', 'wipe', 'slide', 'zoom'];

  /* ---- what each tool does --------------------------------------------- */
  /* Every entry either performs the step and says what it did, or refuses and
     says which tab to open. Nothing returns a vague success. */
  var DO = {
    'text and titles': function (st, s, t, a) {
      var tr = trackOf(st, 'text') || trackOf(st, 'video');
      if (!tr) return no('This project has no track to put text on.');
      var words = (a.text || guessQuote(s.do) || '').trim();
      if (!words) return no('The step did not say what the text should read.', 'text');
      st.addTextClip(tr.id, t, words);
      var made = store().getState().clips.slice(-1)[0];
      if (made && a.seconds) store().getState().updateClip(made.id, { duration: clamp(a.seconds, 0.5, 30, 4) });
      return ok('Added the title "' + words + '" at ' + fmt(t) + '.');
    },
    'zoom and reposition a clip': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      st.updateClipTransform(c.id, {
        scale: clamp(a.scale, 0.2, 4, 1.35),
        positionX: clamp(a.x, -1, 1, 0) * 400,
        positionY: clamp(a.y, -1, 1, 0) * 400
      });
      return ok('Zoomed the clip at ' + fmt(t) + ' to ' + clamp(a.scale, 0.2, 4, 1.35) + '×.');
    },
    'speed up or slow down': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      var rate = clamp(a.rate, 0.1, 4, guessRate(s.do));
      st.updateClipSpeed(c.id, { rate: rate });
      return ok('Set the clip at ' + fmt(t) + ' to ' + rate + '× speed.');
    },
    'crossfade, wipe, slide and zoom transitions': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      var type = TRANSITIONS.indexOf(String(a.type || '').toLowerCase()) >= 0
        ? String(a.type).toLowerCase() : guessTransition(s.do);
      var where = a.at === 'out' ? 'out' : 'in';
      st.setClipTransition(c.id, where, { type: type, duration: clamp(a.seconds, 0.1, 3, 0.5) });
      return ok('Put a ' + type + ' transition on the ' + where + ' of the clip at ' + fmt(t) + '.');
    },
    'colour: brightness, contrast, saturation, warmth': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      var set = {}, any = false;
      ['brightness', 'contrast', 'saturation', 'temperature'].forEach(function (k) {
        var v = a[k === 'temperature' ? (a.temperature !== undefined ? 'temperature' : 'warmth') : k];
        if (v !== undefined && !isNaN(parseFloat(v))) { set[k] = clamp(v, -100, 100, 0); any = true; }
      });
      if (!any) { set.saturation = 15; set.contrast = 10; }
      st.updateClipColor(c.id, set);
      return ok('Graded the clip at ' + fmt(t) + ' (' + Object.keys(set).join(', ') + ').');
    },
    'filters including night vision and hologram': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      var key = effectKey(a.effect) || effectKey(a.filter) || guessEffect(s.do);
      if (!key) return no('The step did not name a filter this editor has.', 'effects');
      var set = {};
      set[key] = clamp(a.amount, 0, 100, 60);
      st.updateClipEffects(c.id, set);
      return ok('Applied the ' + key + ' filter to the clip at ' + fmt(t) + '.');
    },
    'volume per clip and fade in / out': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      var set = {};
      if (a.volume !== undefined) set.volume = clamp(a.volume, 0, 2, 1);
      if (a.fadeIn !== undefined) set.fadeIn = clamp(a.fadeIn, 0, 5, 0);
      if (a.fadeOut !== undefined) set.fadeOut = clamp(a.fadeOut, 0, 5, 0);
      if (!Object.keys(set).length) { set.fadeIn = 0.4; set.fadeOut = 0.4; }
      st.updateClip(c.id, set);
      return ok('Set volume and fades on the clip at ' + fmt(t) + '.');
    },
    'split at the playhead': function (st, s, t, a) {
      var c = clipAt(st, t);
      if (!c) return no('There is no clip on the timeline at ' + fmt(t) + '.');
      if (t <= c.start + 0.05 || t >= c.start + c.duration - 0.05)
        return no('A split at ' + fmt(t) + ' would land on the edge of the clip, not inside it.');
      st.splitClip(c.id, t);
      return ok('Split the clip at ' + fmt(t) + '.');
    }
  };
  DO['captions typed on a text track'] = DO['text and titles'];

  /* The seven that genuinely need a person, each with the reason and the tab
     that gets them there. */
  /* Keys are lowercase because that is how a tool name arrives — the planner's
     list is written for a reader ("the Audio tab", "the Remove tool") and the
     lookup lowercases it. Capitalised keys here silently missed every one of
     these and fell through to the generic "this needs you", losing the reason
     and the tab, which is most of the value. */
  var HANDS = {
    'background music from the audio tab': ['Music is a choice, not a calculation — pick the track you want.', 'audio'],
    'sound effects from the sfx tab': ['Pick the sound effect you want from the SFX tab.', 'sfx'],
    'stickers and memes': ['Pick the sticker you want — this is the part that is yours.', 'stickers'],
    'remove an object from a frame (the remove tool)': ['The Remove tool needs you to point at the thing to remove.', 'remove'],
    'animate a drawing (the animate tool)': ['The Animate tool needs your drawing.', 'animate'],
    'cut / trim a clip': ['What is worth cutting is a judgement about your video, and it is the part worth doing yourself.', null],
    'reorder clips on the timeline': ['Which order tells the story better is your call.', null]
  };

  function ok(msg) { return { done: true, msg: msg }; }
  function no(msg, tab) { return { done: false, msg: msg, tab: tab || null }; }
  function fmt(t) { return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); }

  /* ---- reading intent out of the sentence when args are missing ---------- */
  /* The planner is asked for machine-readable args, but an older plan — or a
     model having an off day — may only leave the sentence. Rather than refuse a
     step that plainly says "slow down to 0.5x", read it. */
  function guessQuote(text) {
    var m = String(text || '').match(/['"‘’“”]([^'"‘’“”]{2,60})['"‘’“”]/);
    return m ? m[1] : '';
  }
  function guessRate(text) {
    var m = String(text || '').match(/([\d.]+)\s*x\b/i);
    if (m) return clamp(m[1], 0.1, 4, 1);
    return /slow|slower|slo-?mo/i.test(text) ? 0.5 : 1.5;
  }
  function guessTransition(text) {
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < TRANSITIONS.length; i++) if (t.indexOf(TRANSITIONS[i]) >= 0) return TRANSITIONS[i];
    if (t.indexOf('crossfade') >= 0) return 'dissolve';
    return 'fade';
  }
  function guessEffect(text) {
    var t = String(text || '').toLowerCase().replace(/[^a-z ]/g, '');
    for (var i = 0; i < EFFECTS.length; i++) {
      var human = EFFECTS[i].replace(/([A-Z])/g, ' $1').toLowerCase();
      if (t.indexOf(human) >= 0 || t.indexOf(EFFECTS[i].toLowerCase()) >= 0) return EFFECTS[i];
    }
    return null;
  }

  /* ---- applying --------------------------------------------------------- */
  function apply(steps) {
    var s = store();
    if (!s) return { err: 'The editor is not loaded on this page.' };
    var st = s.getState();
    if (!st.clips.length) return { err: 'empty' };

    var before = JSON.parse(JSON.stringify(st.getState ? st.clips : st.clips));
    var results = [];
    steps.forEach(function (step) {
      var t = secs(step.at);
      var tool = String(step.tool || '').toLowerCase().trim();
      var args = (step.args && typeof step.args === 'object') ? step.args : {};
      var fn = DO[tool];
      if (fn) {
        var r;
        /* One bad step must not abandon the other seven. */
        try { r = fn(store().getState(), step, t, args); }
        catch (e) { r = no('That step could not be carried out (' + e.message + ').'); }
        results.push({ step: step, done: r.done, msg: r.msg, tab: r.tab });
        return;
      }
      var hand = HANDS[tool];
      results.push({
        step: step, done: false, yours: true,
        msg: hand ? hand[0] : 'This one needs you — the editor cannot choose it for you.',
        tab: hand ? hand[1] : null
      });
    });
    return { results: results, before: before };
  }

  function restore(before) {
    var s = store();
    if (!s || !before) return false;
    /* The selection has to come back with the clips. addTextClip selects what
       it creates, so after putting the timeline back the editor was still
       pointing at a clip that no longer existed — and its inspector panel reads
       `clip.transform` straight off that, which threw and blanked the panel.
       Restoring is meant to be the safe button; it cannot be the one that
       breaks the app. */
    var ids = {};
    before.forEach(function (c) { ids[c.id] = 1; });
    var sel = s.getState().selectedClipId;
    s.setState({ clips: before, selectedClipId: (sel && ids[sel]) ? sel : null });
    return true;
  }

  window.NC_AI_EDIT = {
    stash: stash, pending: pending, clear: clearPending,
    apply: apply, restore: restore,
    tools: Object.keys(DO), needsYou: Object.keys(HANDS),
    _secs: secs, _effectKey: effectKey       /* for the tests */
  };
})();
