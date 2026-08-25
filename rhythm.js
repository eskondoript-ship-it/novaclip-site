/* ============================================================================
   CLICK RHYTHM — a password you perform rather than type
   ============================================================================
   Click LEFT RIGHT LEFT RIGHT on the pad. Come back tomorrow and do it again.
   You will not reproduce it exactly — nobody can — so this does not ask you to.
   It measures how you did it and asks whether that is close enough.

   This is a real technique. Keystroke dynamics has been studied since the
   1980s and click dynamics is the same idea with fewer keys: the claim is that
   the RHYTHM of a practised sequence is characteristic of the person doing it,
   because it is muscle memory rather than a decision.

   WHAT IS ACTUALLY MEASURED

   Two numbers per click, and they are the standard pair:

     dwell   how long the button was held down
     gap     how long between letting go of one and pressing the next

   An eight-click pattern gives 8 dwells and 7 gaps — fifteen numbers. The
   order of the zones (L R L R …) is stored too, but see the honesty section:
   the sequence is nearly worthless on its own and the rhythm is the secret.

   Dwell is the important half, and the reason is that somebody standing behind
   you can see WHEN you clicked and cannot see HOW LONG YOU HELD THE BUTTON.
   The visible half and the invisible half are not worth the same, so dwell is
   weighted three times as heavily.

   WHY ENROLMENT TAKES FIVE GOES

   One recording tells you what somebody did once. It tells you nothing about
   how much they naturally vary, and without that there is no way to set a
   threshold — so you end up either rejecting the owner constantly or letting
   anybody in. Five goes give a middle value and a spread for every feature,
   and the spread is what the comparison is scaled by. Three goes were tried
   first and the spread estimate was too noisy to separate anybody.

   WHY TEMPO IS NORMALISED FIRST

   People do the whole thing faster when they are in a hurry and slower when
   they are tired, and the pattern keeps its shape while that happens. So the
   candidate's total time is compared with the template's total time, and the
   template is stretched or squeezed by that ratio before anything else is
   looked at. What is being compared is the SHAPE of the rhythm — long-short-
   long — not the absolute milliseconds.

   The ratio is clamped. Somebody four times slower is not performing the same
   pattern at a different speed, they are working it out as they go.

   WHY BOTH THE AVERAGE AND THE WORST FEATURE ARE CHECKED

   An average alone hides a disaster: six intervals dead right and one wildly
   wrong averages out to "fine", and that one wrong interval is exactly what a
   different person's hand looks like. So a candidate has to be good on average
   AND not terrible anywhere. Both thresholds came out of the simulation in
   scratchpad rather than being picked because they sounded about right.

   ============================================================================
   HOW STRONG THIS IS, WITH NUMBERS
   ============================================================================
   Eight clicks of left-or-right is 256 possibilities — eight bits, about a
   two-and-a-half digit PIN. The sequence is not the secret. The rhythm is, and
   scratchpad/rhythmfinal.mjs measured how much of a secret it is over 3000
   simulated hands:

     the owner is turned away        7.7% of the time
     a stranger gets in              1.2%
     somebody who watched you once  15.9%
     somebody who studied a video   18.1%
     somebody holding the template  90.9%

   Read the last three rows before deciding what to use this for. A person who
   has watched you do it gets in roughly one try in six, and this allows three
   tries before it starts making them wait — so watching you once is worth
   about a 30% chance. That is not a lock you would put on anything that
   matters, and the page says so where somebody deciding will see it.

   The number that makes the feature worth having at all is 1.2%: against
   somebody who knows the SEQUENCE and has never seen you perform it, the
   rhythm holds up. That is the shoulder-surfing case for a PIN — the one
   where a PIN fails completely.

   It also cannot be hashed. A password can be, because it either matches or it
   does not; a rhythm has to be MEASURED against the stored numbers, so the
   numbers have to be there in readable form. Anyone who can read localStorage
   has the template, which is the 90.9% row.

   So: this signs you in to this browser, like the face and voice checks beside
   it. It is deliberately not allowed to open the locker — that needs the
   passkey, because the locker's key is derived from hardware this page cannot
   read. Letting a fifteen-number rhythm stand in for that would undo the only
   part of this page that is genuinely strong.

   MOUSE ONLY

   A touchscreen has no press-and-hold that means anything — a tap is a tap,
   dwell times collapse to nothing useful, and the whole measurement falls
   apart. So this offers itself on a device with a real pointer and says so
   plainly everywhere else, rather than appearing and then not working.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_RHYTHM) return;

  var STORE = 'nc_click_rhythm';
  var GUARD = 'nc_click_rhythm_guard';

  var MIN_CLICKS = 6;          // fewer and a stranger gets in 3% of the time
  var MAX_CLICKS = 12;         // above this nobody repeats it reliably
  var ENROL_REPEATS = 5;

  /* Tolerance floors. A feature whose enrolment samples happened to land on
     the same millisecond would otherwise demand that millisecond back.
     Relative, because a 600ms gap and a 70ms dwell do not deserve the same
     slack in absolute terms. */
  var FLOOR_MS = 12;
  var FLOOR_REL = 0.14;

  /* Dwell counts for three. It is the half of the measurement that somebody
     watching you CANNOT see — they know when you clicked, they have no idea
     how long you held the button — so it is the half that is actually secret,
     and scoring it level with the visible half was throwing that away. */
  var W_DWELL = 3;

  /* Every constant above and below came out of scratchpad/rhythmfinal.mjs
     rather than out of taste. Measured over 3000 simulated hands at eight
     clicks, with attackers who can see the gaps and not the dwells:

       owner turned away          7.7%
       stranger gets in           1.2%
       watcher, saw it once      15.9%
       student, studied a video  18.1%
       replay, has the numbers   90.9%

     The first sweep of this used a threshold that let a stranger in a third
     of the time, and the sweep before that modelled a watcher as knowing the
     dwells too — which is what made the whole thing look hopeless. */
  var T_MEAN = 1.4;            // weighted average deviation, in spread-units
  var T_WORST = 4.0;           // the worst single feature
  var TEMPO_MIN = 0.55, TEMPO_MAX = 1.85;

  /* Rate limiting. A watcher gets in about one try in six, so the number of
     tries is the number that matters: three of them is a 30% chance and five
     would be 42%. Three, then the waiting starts. */
  var FREE_TRIES = 3;
  var COOL_MS = 60 * 1000;     // doubles each time, capped
  var COOL_MAX = 30 * 60 * 1000;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; }
  }

  /* ---- can this device do it? ------------------------------------------
     Two questions again, and the second is the one that matters. A tablet
     with a keyboard case reports both a coarse and a fine pointer; what is
     being asked is whether a real button-press with a duration exists. */
  function supported() {
    if (!window.matchMedia) return false;
    return window.matchMedia('(pointer: fine)').matches;
  }

  /* ---- recording a performance ----------------------------------------- */
  function newRecorder() {
    var clicks = [];       // { zone, down, up }
    var open = null;

    return {
      press: function (zone, t) {
        if (open) return false;                       // a second button while one is held
        if (clicks.length >= MAX_CLICKS) return false;
        open = { zone: zone, down: (t == null ? now() : t), up: 0 };
        return true;
      },
      release: function (t) {
        if (!open) return false;
        open.up = (t == null ? now() : t);
        /* A click has to have a duration. A synthetic event with down and up
           on the same tick would give a dwell of 0 and poison the template. */
        if (open.up <= open.down) open.up = open.down + 1;
        clicks.push(open);
        open = null;
        return true;
      },
      cancel: function () { open = null; },
      reset: function () { clicks = []; open = null; },
      length: function () { return clicks.length; },
      zones: function () { return clicks.map(function (c) { return c.zone; }); },
      held: function () { return !!open; },
      sample: function () {
        if (clicks.length < MIN_CLICKS) return null;
        var seq = [], dwells = [], gaps = [];
        for (var i = 0; i < clicks.length; i++) {
          seq.push(clicks[i].zone);
          dwells.push(clicks[i].up - clicks[i].down);
          if (i > 0) gaps.push(clicks[i].down - clicks[i - 1].up);
        }
        return { seq: seq, dwells: dwells, gaps: gaps };
      }
    };
  }

  function now() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  /* ---- the template ------------------------------------------------------
     Median rather than mean: with three samples one fumbled go would drag a
     mean somewhere the person never actually was, and the median ignores it.
     Spread is the mean distance from that median, which with n=3 is steadier
     than a standard deviation and does not pretend to be one. */
  function median(a) {
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function spread(a, m) {
    var t = 0;
    for (var i = 0; i < a.length; i++) t += Math.abs(a[i] - m);
    return t / a.length;
  }
  function summarise(rows) {          // rows: sample-major -> feature-major
    var out = [];
    for (var i = 0; i < rows[0].length; i++) {
      var col = rows.map(function (r) { return r[i]; });
      var m = median(col);
      out.push({ m: m, s: Math.max(spread(col, m), FLOOR_MS, m * FLOOR_REL) });
    }
    return out;
  }

  function sameSeq(a, b) {
    return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
  }

  function enrol(samples) {
    if (!samples || samples.length !== ENROL_REPEATS) {
      throw new Error('It needs ' + ENROL_REPEATS + ' goes to learn how much you vary.');
    }
    var first = samples[0];
    if (!first || first.seq.length < MIN_CLICKS) {
      throw new Error('Use at least ' + MIN_CLICKS + ' clicks.');
    }
    for (var i = 1; i < samples.length; i++) {
      if (!sameSeq(samples[i].seq, first.seq)) {
        throw new Error('That was a different pattern from the one before it. All ' +
                        ENROL_REPEATS + ' have to be the same left-and-right order.');
      }
    }
    var tpl = {
      v: 1,
      seq: first.seq.slice(),
      dwells: summarise(samples.map(function (s) { return s.dwells; })),
      gaps: summarise(samples.map(function (s) { return s.gaps; })),
      at: Date.now()
    };
    if (!write(STORE, tpl)) throw new Error('This browser would not save it — storage may be full.');
    write(GUARD, { fails: 0, until: 0 });
    return { clicks: tpl.seq.length, features: tpl.dwells.length + tpl.gaps.length };
  }

  /* ---- comparing ---------------------------------------------------------
     Returns the raw numbers as well as the verdict, so the page can show what
     it decided on rather than a yes or no from nowhere. */
  function score(sample) {
    var tpl = read(STORE, null);
    if (!tpl) return { ok: false, why: 'NO_TEMPLATE' };
    if (!sameSeq(sample.seq, tpl.seq)) {
      return { ok: false, why: 'SEQ', mean: Infinity, worst: Infinity, tempo: 0, pct: 0 };
    }

    /* Tempo: total time of the whole performance, candidate over template. */
    var sum = function (a, k) {
      return a.reduce(function (t, v) { return t + (k ? v[k] : v); }, 0);
    };
    var tplTotal = sum(tpl.gaps, 'm') + sum(tpl.dwells, 'm');
    var canTotal = sum(sample.gaps) + sum(sample.dwells);
    var tempo = tplTotal > 0 ? canTotal / tplTotal : 1;
    if (tempo < TEMPO_MIN || tempo > TEMPO_MAX) {
      return { ok: false, why: 'TEMPO', mean: Infinity, worst: Infinity, tempo: tempo, pct: 0 };
    }

    var devs = [], wts = [];
    function compare(vals, model, w) {
      for (var i = 0; i < vals.length; i++) {
        var m = model[i].m * tempo;
        var s = model[i].s * tempo;
        devs.push(Math.abs(vals[i] - m) / Math.max(s, FLOOR_MS));
        wts.push(w);
      }
    }
    compare(sample.dwells, tpl.dwells, W_DWELL);
    compare(sample.gaps, tpl.gaps, 1);

    var wsum = 0, acc = 0;
    for (var k = 0; k < devs.length; k++) { acc += devs[k] * wts[k]; wsum += wts[k]; }
    var mean = acc / wsum;
    var worst = Math.max.apply(null, devs);
    var ok = mean <= T_MEAN && worst <= T_WORST;

    /* A number for the reader. It is the mean deviation turned around so that
       "dead on" is 100 and the threshold sits at 50 — presented as a closeness,
       which is what it is, and never as a probability that it is you. */
    var pct = Math.max(0, Math.min(100, Math.round(100 - (mean / T_MEAN) * 50)));

    /* ONE_OFF means what it says: the average was fine and a single feature
       blew the whole thing. Reporting it whenever the worst feature is over
       the line produced "close on most of it — 0% overall", which is two
       statements that cannot both be true. */
    return { ok: ok, mean: mean, worst: worst, tempo: tempo, pct: pct,
             why: ok ? '' : (worst > T_WORST && mean <= T_MEAN ? 'ONE_OFF' : 'RHYTHM') };
  }

  /* ---- the lock-out ----------------------------------------------------- */
  function guard() {
    var g = read(GUARD, { fails: 0, until: 0 });
    if (typeof g.fails !== 'number') g = { fails: 0, until: 0 };
    return g;
  }
  function cooling() {
    var g = guard();
    var left = g.until - Date.now();
    return left > 0 ? left : 0;
  }
  function noteFail() {
    var g = guard();
    g.fails = (g.fails || 0) + 1;
    if (g.fails > FREE_TRIES) {
      var step = Math.min(COOL_MS * Math.pow(2, g.fails - FREE_TRIES - 1), COOL_MAX);
      g.until = Date.now() + step;
    }
    write(GUARD, g);
    return g;
  }
  function notePass() { write(GUARD, { fails: 0, until: 0 }); }

  /* The one call the page makes. It wraps the scoring in the rate limit and
     writes the audit line, so there is no path that checks a pattern without
     both of those happening. */
  function verify(sample) {
    var wait = cooling();
    if (wait > 0) {
      return { ok: false, why: 'COOLING', wait: wait, pct: 0 };
    }
    if (!sample) return { ok: false, why: 'SHORT', pct: 0 };
    var r = score(sample);
    if (r.why === 'NO_TEMPLATE') return r;
    if (r.ok) { notePass(); } else { r.guard = noteFail(); }
    try {
      if (window.NC_PASSKEY && window.NC_PASSKEY.log) {
        window.NC_PASSKEY.log('Click rhythm', r.ok,
          r.ok ? (r.pct + '% match')
               : (r.why === 'SEQ' ? 'a different left-and-right order'
                  : r.why === 'TEMPO' ? 'the right pattern at the wrong speed'
                  : r.pct + '% match — not close enough'));
      }
    } catch (e) {}
    return r;
  }

  function exists() { return !!read(STORE, null); }
  function info() {
    var t = read(STORE, null);
    if (!t) return null;
    return { clicks: t.seq.length, features: t.dwells.length + t.gaps.length, at: t.at };
  }
  function forget() {
    try { localStorage.removeItem(STORE); localStorage.removeItem(GUARD); } catch (e) {}
    try {
      if (window.NC_PASSKEY && window.NC_PASSKEY.log) {
        window.NC_PASSKEY.log('Click rhythm removed', true, '');
      }
    } catch (e) {}
  }

  window.NC_RHYTHM = {
    supported: supported, newRecorder: newRecorder, enrol: enrol, verify: verify,
    score: score, exists: exists, info: info, forget: forget,
    cooling: cooling, guard: guard,
    MIN_CLICKS: MIN_CLICKS, MAX_CLICKS: MAX_CLICKS, ENROL_REPEATS: ENROL_REPEATS,
    T_MEAN: T_MEAN, T_WORST: T_WORST, FREE_TRIES: FREE_TRIES
  };
})();
