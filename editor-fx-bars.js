/* NOVACLIP — EFFECTS AS BARS ON THE TIMELINE, THE WAY CAPCUT DOES IT
 * ===========================================================================
 * Asked for, with a CapCut screenshot showing "Flash" as a purple bar sitting
 * above the clip: "i want the effects like capcut just build it".
 *
 * Until now an effect was a property of a whole clip. You dropped it on the
 * chip bar and it was on for all twenty seconds, or it was off. There was no
 * way to say "glitch for half a second here", which is the only way anybody
 * actually uses effects.
 *
 * So this adds an FX lane at the top of the timeline. Drop an effect on it and
 * you get a bar with a start and a length. Drag the bar along the time, drag
 * either end to make it longer or shorter, click it to open its editor, press
 * Delete to remove it. The effect runs while the playhead is inside the bar
 * and not otherwise — in the preview and in the export, because both go
 * through the same draw hook.
 *
 * ---------------------------------------------------------------------------
 * A BAR BELONGS TO THE TIMELINE, NOT TO A CLIP
 * ---------------------------------------------------------------------------
 * This is CapCut's model and it is also the simpler one. A bar covering
 * 4s–6s applies to whatever is on screen at 4s–6s. It does not need to know
 * which clip that is, it survives the clip underneath being trimmed or
 * swapped, and one bar can span a cut. The alternative — binding each bar to
 * a clip id — means a bar that silently dies when you split the clip under
 * it, and nothing was gained for it.
 *
 * ---------------------------------------------------------------------------
 * HOW THE TIME WINDOW IS ENFORCED
 * ---------------------------------------------------------------------------
 * editor-fx.js hooks the renderer at window.__ncGrade(ctx, clip, parts) and
 * reads the effects off `clip.effects`. That hook is chained, not replaced,
 * exactly the way editor-fx.js chained grade.js before it: this file loads
 * after, so its wrapper is on the outside and runs first.
 *
 * The wrapper hands the inner hook a *substituted* effects object — the
 * clip's own effects, with every effect this file manages forced to 0, and
 * the ones whose bar covers the current playhead set to that bar's strength.
 * The real `clip.effects` is put back before the wrapper returns, so nothing
 * is ever written to the store: no re-render, no undo entry, nothing to
 * autosave, and a bar cannot corrupt a project. The substituted object stays
 * alive because installPainter captures it by reference and reads it later,
 * when the frame is actually composited.
 *
 * The playhead is read from the store, which is the same place the hook reads
 * it and the same place the transitions read it, so a bar is in step with
 * everything else that is time-based — including during an export.
 *
 * ---------------------------------------------------------------------------
 * WHY THE LANE MUST NOT HAVE `border-b`
 * ---------------------------------------------------------------------------
 * Not a style preference — a bug waiting to happen. editor-lanes.js finds the
 * timeline's lane rows by collecting the row container's children whose class
 * list contains `border-b`, and uses their ORDER to map the row a clip is
 * sitting in to the track the clip claims to be on. Give this lane that class
 * and every index after it is off by one, which is how you move somebody's
 * footage to the wrong lane. The divider here is an inline border-bottom and
 * the class is `nc-fxlane`, so laneRows() skips it and the mapping is
 * untouched. Verified by dragging a clip between lanes with the lane present.
 *
 * ---------------------------------------------------------------------------
 * WHY IT RE-INSERTS ITSELF
 * ---------------------------------------------------------------------------
 * The row container is React's. React removes and inserts its own children by
 * reference and leaves foreign nodes alone, so in practice the lane survives
 * a re-render — but "in practice" is not good enough for a node that has to
 * be the first child, and a layout change could replace the container
 * outright. A MutationObserver puts it back, debounced to one check per
 * animation frame. Undebounced, a full-document observer during React's first
 * render is what hung the editor when editor-rail.js shipped; this one
 * watches a single container and never queries the document.
 *
 * ---------------------------------------------------------------------------
 * THE HONEST LIMITS
 * ---------------------------------------------------------------------------
 * 1. Parameters are still per effect, not per bar, for the reason set out at
 *    the top of editor-fx-edit.js: a painter is handed pixels and a number
 *    and cannot look up which bar is asking. Strength IS per bar, because
 *    strength travels through clip.effects, which this file substitutes.
 * 2. The five effects the bundle implements as a CSS filter rather than a
 *    painter — blur, vignette, and the rest of BUNDLE_FILTER — cannot be
 *    windowed this way, because the bundle bakes their filter string before
 *    the hook is called. Those stay whole-clip chips. The FX library's own
 *    effects are all painters, so everything you can drag onto the lane
 *    windows correctly; nothing is offered that will not work.
 * 3. Bars are stored beside the project, not inside it, because the clip
 *    schema is the bundle's and a sidecar cannot add a field to it. They are
 *    under one key for every project, for the reason set out at KEY below —
 *    so opening a second project shows the first one's bars on the lane.
 *    They are visible and one click removes them, which is why this is a
 *    wart and not a bug.
 */
(function () {
  'use strict';
  if (window.NC_FX_BARS) return;

  var LANE_H   = 30;     /* px, the FX lane's height */
  var MIN_DUR  = 0.1;    /* s, the shortest a bar can be dragged */
  var DEF_DUR  = 1.2;    /* s, a freshly dropped bar */
  var SNAP_PX  = 7;      /* how close counts as a snap */
  var DEF_V    = 0.85;   /* strength a freshly dropped bar carries */

  var bars = [];
  var lane = null;        /* effects */
  var trLane = null;      /* transitions */
  var host = null;
  var sel  = null;       /* iid of the selected bar */
  var obs  = null;
  var pending = 0;

  function store() { return window.__ncStore; }
  function state() { try { return store().getState(); } catch (e) { return null; } }
  function pps() { var s = state(); return (s && s.pixelsPerSecond) || 80; }
  function now() { var s = state(); return (s && s.playhead) || 0; }

  /* ---- where the bars are kept -------------------------------------------
     ONE KEY, NOT ONE PER PROJECT, and that is a deliberate retreat from the
     first version of this file.

     Keying on the project looks obviously right and is quietly broken: the
     bundle exposes no project id, so the only handle is the project's name,
     and the name arrives from the autosave restore AFTER React has mounted —
     which is the moment this file finds the timeline and loads. So load()
     read 'nc_fx_bars:' before the name existed, found nothing, and the bars
     were gone on every reload that lost the race. Measured: the same test
     passed and then failed on the next run with nothing changed but timing.
     Keying on the name also orphans every bar the moment somebody renames
     their project.

     So: one key, the same choice nc_fx_settings already makes for per-effect
     parameters. The cost is that a second project opens with the first one's
     bars still on the lane. That is a real cost and it is the right trade
     here, because the lane shows them: they are drawn on the timeline with
     their names on them, and anything you can see and delete is not a
     mystery. Per-effect parameters are invisible and make the same trade. */
  var KEY = 'nc_fx_bars';
  function key() { return KEY; }
  function load() {
    bars = [];
    try {
      var raw = localStorage.getItem(key());
      if (!raw) return;
      var a = JSON.parse(raw);
      if (!a || !a.length) return;
      for (var i = 0; i < a.length; i++) {
        var b = a[i];
        if (!b || !b.fx || !(b.dur > 0)) continue;
        bars.push({ iid: b.iid || uid(), fx: b.fx,
                    start: Math.max(0, +b.start || 0),
                    dur: Math.max(MIN_DUR, +b.dur),
                    v: b.v > 0 ? +b.v : DEF_V });
      }
    } catch (e) { bars = []; }
  }
  function save() {
    tidy();
    try { localStorage.setItem(key(), JSON.stringify(bars)); } catch (e) {}
  }
  function uid() { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* Times are rounded to the millisecond before they are stored or shown.
     A drag adds a pixel delta divided by pixelsPerSecond, so the raw numbers
     come out as 3.200000000000001, which is harmless arithmetically and ugly
     in anything that ever prints it. A millisecond is finer than one frame at
     any frame rate this editor exports, so nothing is lost. */
  function q(t) { return Math.round(t * 1000) / 1000; }
  function tidy() {
    for (var i = 0; i < bars.length; i++) {
      bars[i].start = Math.max(0, q(bars[i].start));
      bars[i].dur = Math.max(MIN_DUR, q(bars[i].dur));
    }
  }

  function label(fx) {
    try {
      var ui = window.NC_TRANS_UI;
      if (ui && ui.effects && ui.effects[fx]) return ui.effects[fx][0];
    } catch (e) {}
    return fx;
  }

  /* An effect this file can window: it has to be a painter, because the
     bundle's CSS-filter effects are baked before the hook runs. */
  function windowable(fx) {
    try { return !!(window.NC_FX && window.NC_FX.PAINT && window.NC_FX.PAINT[fx]); }
    catch (e) { return false; }
  }

  /* ==========================================================================
     THE GATE
     ========================================================================== */
  function managed() {
    var m = {};
    for (var i = 0; i < bars.length; i++) m[bars[i].fx] = true;
    return m;
  }

  function gatedEffects(own, t) {
    var out = Object.assign({}, own || {});
    var m = managed();
    for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) out[k] = 0;
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      if (t < b.start || t >= b.start + b.dur) continue;
      /* Two bars of the same effect overlapping: the stronger one wins,
         rather than the last one in the list, so the result does not depend
         on the order they happened to be created in. */
      if (!(out[b.fx] > b.v)) out[b.fx] = b.v;
    }
    return out;
  }

  var chained = false;
  function chain() {
    if (chained) return true;
    var inner = window.__ncGrade;
    if (typeof inner !== 'function') return false;
    window.__ncGrade = function (ctx, clip, parts) {
      if (!clip || !bars.length) return inner(ctx, clip, parts);
      var own = clip.effects;
      try {
        clip.effects = gatedEffects(own, now());
        return inner(ctx, clip, parts);
      } finally {
        /* Always, even if the inner hook threw — leaving the substitution in
           place would write it into the next autosave. */
        clip.effects = own;
      }
    };
    chained = true;
    return true;
  }

  /* ==========================================================================
     THE LANE
     ========================================================================== */
  function findHost() {
    var sc = document.querySelector('.min-w-0.flex-1.overflow-auto');
    if (!sc) return null;
    for (var i = 0; i < sc.children.length; i++) {
      var c = sc.children[i];
      if (c.nodeType !== 1) continue;
      for (var j = 0; j < c.children.length; j++) {
        if (/\bborder-b\b/.test(c.children[j].className || '')) return c;
      }
    }
    return null;
  }

  function css() {
    if (document.getElementById('nc-fxbars-css')) return;
    var s = document.createElement('style');
    s.id = 'nc-fxbars-css';
    s.textContent = [
      '.nc-fxlane{position:relative;height:' + LANE_H + 'px;',
      '  border-bottom:1px solid rgba(255,255,255,.06);',
      '  background:linear-gradient(180deg,rgba(124,92,255,.07),rgba(124,92,255,.02))}',
      '.nc-fxlane-tag{position:sticky;left:0;z-index:4;display:inline-flex;align-items:center;',
      '  height:100%;padding:0 8px;font:700 9px system-ui,sans-serif;letter-spacing:.08em;',
      '  color:#A78BFA;text-transform:uppercase;pointer-events:none}',
      '.nc-fxlane-hint{position:absolute;left:46px;top:0;height:100%;display:flex;align-items:center;',
      '  font:600 10px system-ui,sans-serif;color:rgba(167,139,250,.5);pointer-events:none;white-space:nowrap}',
      '.nc-fxlane.drop{background:rgba(124,92,255,.2);box-shadow:inset 0 0 0 1px rgba(124,92,255,.6)}',
      /* a bar */
      '.nc-fxbar{position:absolute;top:3px;height:' + (LANE_H - 7) + 'px;z-index:5;',
      '  display:flex;align-items:center;overflow:hidden;border-radius:5px;cursor:grab;',
      '  background:linear-gradient(180deg,#8B6CFF,#6D4DF0);border:1px solid rgba(255,255,255,.22);',
      '  box-shadow:0 1px 3px rgba(0,0,0,.35);user-select:none;touch-action:none}',
      '.nc-fxbar.on{border-color:#fff;box-shadow:0 0 0 1px #fff,0 1px 6px rgba(124,92,255,.7)}',
      '.nc-fxbar.live{background:linear-gradient(180deg,#A98CFF,#7C5CFF)}',
      '.nc-fxbar b{flex:1 1 auto;min-width:0;padding:0 6px;font:700 10px system-ui,sans-serif;',
      '  color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}',
      '.nc-fxbar i{position:absolute;top:0;width:6px;height:100%;cursor:ew-resize;z-index:2}',
      '.nc-fxbar i.l{left:0}.nc-fxbar i.r{right:0}',
      '.nc-fxbar u{position:absolute;right:2px;top:50%;transform:translateY(-50%);z-index:3;',
      '  display:none;place-items:center;width:14px;height:14px;border-radius:50%;',
      '  background:rgba(0,0,0,.45);color:#fff;font:700 10px system-ui,sans-serif;',
      '  text-decoration:none;cursor:pointer}',
      '.nc-fxbar:hover u{display:grid}',
      /* The transitions row reads differently on purpose: a cyan bar on a
         cyan-tinted strip, against the violet of the effects row, so which
         row you are looking at is obvious without reading the TR/FX tag. */
      '.nc-trlane{background:linear-gradient(180deg,rgba(0,240,255,.07),rgba(0,240,255,.02))}',
      '.nc-trlane .nc-fxlane-tag{color:#67E8F9}',
      '.nc-trlane .nc-fxlane-hint{color:rgba(103,232,249,.5)}',
      '.nc-trbar{background:linear-gradient(180deg,#22D3EE,#0891B2)}',
      '.nc-trbar b{color:#04121a}',
      '.nc-trbar.on{border-color:#fff;box-shadow:0 0 0 1px #fff,0 1px 6px rgba(34,211,238,.7)}',
      '.nc-trbar{cursor:default}',
      '.nc-trbar i{cursor:ew-resize}',
      '.nc-fxbar u:hover{background:#ff4d6a}'
    ].join('');
    document.head.appendChild(s);
  }

  /* TWO LANES, ONE FOR EACH KIND.
     Asked for: "make the effects and transitions have its own timeline".
     They were sharing one strip and the transitions were not even allowed on
     it — dropping one said "transitions go on a clip" and nothing happened,
     which is a refusal where a row should have been.

     They are genuinely different things and the rows reflect that. An effect
     bar is free: it starts where you drop it and lasts as long as you drag
     it, and this file owns the list. A TRANSITION is not free — it belongs to
     a cut, the bundle already stores it as clip.transitionIn/transitionOut,
     and there is nowhere else for it to live. So the transition row is drawn
     FROM the store rather than from a list of this file's own: drop one and
     it snaps to the nearest cut, drag its edge and it sets that transition's
     duration, delete it and the clip loses it. Nothing is duplicated, so the
     row cannot drift out of step with the clips underneath it. */
  function makeLane(kind) {
    css();
    var el = document.createElement('div');
    el.className = kind === 'tr' ? 'nc-fxlane nc-trlane' : 'nc-fxlane';
    var tag = document.createElement('span');
    tag.className = 'nc-fxlane-tag';
    tag.textContent = kind === 'tr' ? 'TR' : 'FX';
    el.appendChild(tag);

    /* The same drag the FX library already fires for the chip bar:
       text/nc-fx carries the id, text/nc-kind says effect or transition. */
    ['dragenter', 'dragover'].forEach(function (ev) {
      el.addEventListener(ev, function (e) {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'copy'; } catch (err) {}
        el.classList.add('drop');
      });
    });
    el.addEventListener('dragleave', function () { el.classList.remove('drop'); });
    el.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation();
      el.classList.remove('drop');
      var id = '', kind = 'fx';
      try {
        id = e.dataTransfer.getData('text/nc-fx') || '';
        kind = e.dataTransfer.getData('text/nc-kind') || 'fx';
      } catch (err) {}
      if (!id) return;
      var want = kind === 'tr' ? 'tr' : 'fx';
      if (want !== (el === trLane ? 'tr' : 'fx')) {
        flash(want === 'tr' ? 'Transitions go on the TR row' : 'Effects go on the FX row');
        return;
      }
      if (want === 'tr') { dropTransition(id, xToTime(e.clientX)); return; }
      if (!windowable(id)) { flash(label(id) + ' cannot be timed — drop it on the clip'); return; }
      add(id, xToTime(e.clientX));
    });

    /* Clicking the empty lane moves the playhead there, which is what every
       other strip in this timeline does. */
    el.addEventListener('pointerdown', function (e) {
      if (e.target !== el && e.target !== tag) return;
      select(null);
      var s = state();
      if (s && s.setPlayhead) s.setPlayhead(Math.max(0, xToTime(e.clientX)));
    });
    return el;
  }

  function ensureLane() {
    var h = findHost();
    if (!h) return false;
    if (h !== host) { host = h; }
    if (!lane || !lane.isConnected) lane = makeLane('fx');
    if (!trLane || !trLane.isConnected) trLane = makeLane('tr');
    /* Order, top down: TR, then FX, then the clips. A transition happens at
       the cut and an effect sits over the picture, so the row nearer the
       clips is the one that acts on them for longer. */
    if (lane.parentElement !== host || host.firstChild !== lane) {
      host.insertBefore(lane, host.firstChild);
    }
    if (trLane.parentElement !== host || host.firstChild !== trLane) {
      host.insertBefore(trLane, host.firstChild);
    }
    watch();
    return true;
  }

  function watch() {
    if (obs || !host) return;
    obs = new MutationObserver(function () {
      /* One check per frame, never a document query. See the header. */
      if (pending) return;
      pending = requestAnimationFrame(function () {
        pending = 0;
        if (!host || !host.isConnected) { obs.disconnect(); obs = null; host = null; boot(); return; }
        if (lane && (lane.parentElement !== host || host.firstChild !== lane)) {
          host.insertBefore(lane, host.firstChild);
        }
      });
    });
    obs.observe(host, { childList: true });
  }

  /* ==========================================================================
     GEOMETRY
     ========================================================================== */
  function xToTime(clientX) {
    if (!lane) return 0;
    var r = lane.getBoundingClientRect();
    return Math.max(0, (clientX - r.left) / pps());
  }

  /* Everything worth snapping to: zero, the playhead, every clip edge, and
     the ends of the other bars. */
  function snaps(exceptIid) {
    var out = [0, now()];
    var s = state();
    if (s && s.clips) for (var i = 0; i < s.clips.length; i++) {
      var c = s.clips[i];
      out.push(c.start || 0);
      out.push((c.start || 0) + (c.duration || 0));
    }
    for (var j = 0; j < bars.length; j++) {
      if (bars[j].iid === exceptIid) continue;
      out.push(bars[j].start);
      out.push(bars[j].start + bars[j].dur);
    }
    return out;
  }

  function snap(t, exceptIid) {
    var tol = SNAP_PX / pps(), list = snaps(exceptIid);
    var best = t, bestD = tol;
    for (var i = 0; i < list.length; i++) {
      var d = Math.abs(list[i] - t);
      if (d < bestD) { bestD = d; best = list[i]; }
    }
    return best;
  }

  /* ==========================================================================
     THE BARS
     ========================================================================== */
  function add(fx, start) {
    if (!windowable(fx)) return null;
    var b = { iid: uid(), fx: fx, start: Math.max(0, q(snap(start))), dur: DEF_DUR, v: DEF_V };
    bars.push(b);
    save(); render(); select(b.iid);
    flash(label(fx) + ' — drag the ends to set how long');
    return b;
  }

  function remove(iid) {
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].iid !== iid) continue;
      bars.splice(i, 1); break;
    }
    if (sel === iid) sel = null;
    save(); render();
  }

  function select(iid) {
    sel = iid;
    if (!lane) return;
    var all = lane.querySelectorAll('.nc-fxbar');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle('on', all[i].getAttribute('data-iid') === iid);
    }
  }

  var toast = null, toastT = 0;
  function flash(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:96px;' +
        'z-index:99999;padding:7px 13px;border-radius:999px;background:rgba(12,14,22,.92);' +
        'color:#E9E7FF;font:600 12px system-ui,sans-serif;border:1px solid rgba(124,92,255,.5);' +
        'pointer-events:none;opacity:0;transition:opacity .16s';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { if (toast) toast.style.opacity = '0'; }, 2200);
  }

  function barEl(b) {
    var el = document.createElement('div');
    el.className = 'nc-fxbar';
    el.setAttribute('data-iid', b.iid);
    el.title = label(b.fx) + ' — drag to move, drag an end to resize, click to edit';

    var t = document.createElement('b');
    t.textContent = label(b.fx);
    el.appendChild(t);

    var l = document.createElement('i'); l.className = 'l';
    var r = document.createElement('i'); r.className = 'r';
    el.appendChild(l); el.appendChild(r);

    var x = document.createElement('u');
    x.textContent = '×';
    x.title = 'Remove';
    x.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    x.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault(); remove(b.iid);
    });
    el.appendChild(x);

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      select(b.iid);
      var mode = e.target === l ? 'l' : e.target === r ? 'r' : 'move';
      var t0 = xToTime(e.clientX), s0 = b.start, d0 = b.dur, moved = false;

      function move(ev) {
        var dt = xToTime(ev.clientX) - t0;
        if (Math.abs(dt) * pps() > 2) moved = true;
        if (mode === 'move') {
          b.start = Math.max(0, snap(s0 + dt, b.iid));
        } else if (mode === 'l') {
          var ns = snap(s0 + dt, b.iid);
          if (ns < 0) ns = 0;
          if (ns > s0 + d0 - MIN_DUR) ns = s0 + d0 - MIN_DUR;
          b.start = ns; b.dur = (s0 + d0) - ns;
        } else {
          var ne = snap(s0 + d0 + dt, b.iid);
          if (ne < s0 + MIN_DUR) ne = s0 + MIN_DUR;
          b.dur = ne - s0;
        }
        place(el, b);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up, true);
        save(); render(); select(b.iid);
        /* A click, not a drag, opens the editor — the same panel the gear on
           the library tile opens, so there is one editor and not two. */
        if (!moved) {
          try {
            if (window.NC_FX_EDIT && window.NC_FX_EDIT.editor) window.NC_FX_EDIT.editor(b.fx, 'fx');
          } catch (err) {}
        }
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, true);
    });

    place(el, b);
    return el;
  }

  function place(el, b) {
    var k = pps();
    el.style.left = (b.start * k) + 'px';
    el.style.width = Math.max(10, b.dur * k) + 'px';
  }

  function render() {
    if (!lane) return;
    var old = lane.querySelectorAll('.nc-fxbar');
    for (var i = 0; i < old.length; i++) old[i].remove();
    var hint = lane.querySelector('.nc-fxlane-hint');
    if (!bars.length) {
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'nc-fxlane-hint';
        hint.textContent = 'Drag an effect here to run it for part of the video';
        lane.appendChild(hint);
      }
    } else if (hint) { hint.remove(); }
    for (var j = 0; j < bars.length; j++) lane.appendChild(barEl(bars[j]));
    renderTr();
    live();
  }

  /* The bar under the playhead reads brighter, so it is obvious which one is
     responsible for what the preview is showing. */
  function live() {
    if (!lane) return;
    var t = now(), all = lane.querySelectorAll('.nc-fxbar');
    for (var i = 0; i < all.length; i++) {
      var iid = all[i].getAttribute('data-iid'), b = null;
      for (var j = 0; j < bars.length; j++) if (bars[j].iid === iid) b = bars[j];
      all[i].classList.toggle('live', !!b && t >= b.start && t < b.start + b.dur);
    }
  }

  /* ==========================================================================
     TRANSITIONS: READ OFF THE CLIPS, NOT KEPT HERE
     ========================================================================== */

  /* Every cut a transition could sit on: each clip's start and end. */
  function cuts() {
    var st = state(), out = [];
    if (!st || !st.clips) return out;
    for (var i = 0; i < st.clips.length; i++) {
      var c = st.clips[i], a = c.start || 0, d = c.duration || 0;
      out.push({ t: a, clip: c, dir: 'in' });
      out.push({ t: a + d, clip: c, dir: 'out' });
    }
    return out;
  }

  /* The bundle stores a transition as {type, duration} on the clip. An `in`
     occupies the clip's first `duration` seconds, an `out` its last. */
  function trBars() {
    var st = state(), out = [];
    if (!st || !st.clips) return out;
    for (var i = 0; i < st.clips.length; i++) {
      var c = st.clips[i], a = c.start || 0, d = c.duration || 0;
      if (c.transitionIn && c.transitionIn.type && c.transitionIn.duration > 0) {
        out.push({ iid: c.id + ':in', clip: c.id, dir: 'in', fx: c.transitionIn.type,
                   start: a, dur: Math.min(c.transitionIn.duration, d) });
      }
      if (c.transitionOut && c.transitionOut.type && c.transitionOut.duration > 0) {
        var td = Math.min(c.transitionOut.duration, d);
        out.push({ iid: c.id + ':out', clip: c.id, dir: 'out', fx: c.transitionOut.type,
                   start: a + d - td, dur: td });
      }
    }
    return out;
  }

  function trLabel(id) {
    try {
      var ui = window.NC_TRANS_UI;
      if (ui && ui.list && ui.list[id]) return ui.list[id][0];
    } catch (e) {}
    return id;
  }

  function setTr(clipId, dir, value) {
    var st = state();
    if (!st || !st.setClipTransition) return false;
    try {
      if (typeof st.pushHistory === 'function') st.pushHistory();
      st.setClipTransition(clipId, dir, value);
      return true;
    } catch (e) { return false; }
  }

  /* Dropped on the TR row: put it on the nearest cut. A transition that does
     not land on a cut is not a transition, so there is no "where you dropped
     it" to honour — the useful thing is to say which cut it went to. */
  function dropTransition(id, t) {
    var list = cuts();
    if (!list.length) { flash('Put a clip on the timeline first'); return; }
    var best = null, bestD = Infinity;
    for (var i = 0; i < list.length; i++) {
      var d = Math.abs(list[i].t - t);
      if (d < bestD) { bestD = d; best = list[i]; }
    }
    if (!best) return;
    var dur = Math.min(DEF_DUR, (best.clip.duration || DEF_DUR));
    if (setTr(best.clip.id, best.dir, { type: id, duration: dur })) {
      flash(trLabel(id) + ' on the cut at ' + best.t.toFixed(2) + 's — drag its edge to set how long');
      render();
    }
  }

  function trBarEl(b) {
    var el = document.createElement('div');
    el.className = 'nc-fxbar nc-trbar';
    el.setAttribute('data-iid', b.iid);
    el.title = trLabel(b.fx) + ' — drag an end to set how long, × to remove';

    var t = document.createElement('b');
    t.textContent = trLabel(b.fx);
    el.appendChild(t);

    var l = document.createElement('i'); l.className = 'l';
    var r = document.createElement('i'); r.className = 'r';
    el.appendChild(l); el.appendChild(r);

    var x = document.createElement('u');
    x.textContent = '×';
    x.title = 'Remove';
    x.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    x.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      /* null is how the bundle's own UI clears one. */
      setTr(b.clip, b.dir, null);
      render();
    });
    el.appendChild(x);

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      /* ONLY THE ENDS MOVE. The body is not draggable, because moving a
         transition means moving it to a different cut, and dragging it a few
         pixels is not how anybody says that — they drop a new one on the cut
         they want. Dragging the body here would have to either snap back or
         silently retarget another clip. */
      var mode = e.target === l ? 'l' : e.target === r ? 'r' : null;
      if (!mode) {
        var s0 = state();
        if (s0 && s0.selectClip) { try { s0.selectClip(b.clip); } catch (err) {} }
        return;
      }
      var t0 = xToTime(e.clientX), d0 = b.dur, moved = false;
      function move(ev) {
        var dt = xToTime(ev.clientX) - t0;
        /* An `in` grows from the clip's start, so dragging its right edge
           lengthens it; an `out` ends at the clip's end, so dragging its
           LEFT edge lengthens it. */
        var grow = (b.dir === 'in') ? (mode === 'r' ? dt : -dt)
                                    : (mode === 'l' ? -dt : dt);
        var nd = d0 + grow;
        if (nd < MIN_DUR) nd = MIN_DUR;
        var st = state(), clip = null;
        if (st) for (var i = 0; i < st.clips.length; i++) if (st.clips[i].id === b.clip) clip = st.clips[i];
        var cap = clip ? (clip.duration || nd) : nd;
        if (nd > cap) nd = cap;
        if (Math.abs(nd - b.dur) * pps() > 1) moved = true;
        b.dur = nd;
        if (b.dir === 'out' && clip) b.start = (clip.start || 0) + (clip.duration || 0) - nd;
        place(el, b);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up, true);
        if (moved) setTr(b.clip, b.dir, { type: b.fx, duration: q(b.dur) });
        render();
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, true);
    });

    place(el, b);
    return el;
  }

  function renderTr() {
    if (!trLane) return;
    var old = trLane.querySelectorAll('.nc-fxbar');
    for (var i = 0; i < old.length; i++) old[i].remove();
    var list = trBars();
    var hint = trLane.querySelector('.nc-fxlane-hint');
    if (!list.length) {
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'nc-fxlane-hint';
        hint.textContent = 'Drag a transition here to put it on the nearest cut';
        trLane.appendChild(hint);
      }
    } else if (hint) { hint.remove(); }
    for (var j = 0; j < list.length; j++) trLane.appendChild(trBarEl(list[j]));
  }

  /* ==========================================================================
     KEYS
     ========================================================================== */
  document.addEventListener('keydown', function (e) {
    if (!sel) return;
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName || '')) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); e.stopPropagation(); remove(sel); return;
    }
    if (e.key === 'Escape') { select(null); return; }
  });

  /* ==========================================================================
     BOOT
     ========================================================================== */
  var zoom = 0, subbed = false, lastTrSig = null;

  function sub() {
    if (subbed) return;
    var s = store();
    if (!s || !s.subscribe) return;
    s.subscribe(function (st) {
      if (!st) return;
      /* A zoom change moves every bar, because every bar's position is a
         time multiplied by pixelsPerSecond. */
      if (st.pixelsPerSecond !== zoom) {
        zoom = st.pixelsPerSecond;
        var all = lane ? lane.querySelectorAll('.nc-fxbar') : [];
        for (var i = 0; i < all.length; i++) {
          var iid = all[i].getAttribute('data-iid');
          for (var j = 0; j < bars.length; j++) if (bars[j].iid === iid) place(all[i], bars[j]);
        }
      }
      /* The transitions row is drawn from the clips, so it has to be redrawn
         when they change — a trim, a split, an undo, or a transition set from
         the library rather than from this row. Compared as a signature rather
         than redrawn every tick, because this fires on every playhead frame
         during playback and rebuilding the row sixty times a second would be
         its own lag report. */
      var sig = '';
      try {
        for (var i = 0; i < st.clips.length; i++) {
          var c = st.clips[i];
          sig += c.id + '|' + (c.start || 0) + '|' + (c.duration || 0) + '|' +
                 ((c.transitionIn && c.transitionIn.type) || '') + ':' +
                 ((c.transitionIn && c.transitionIn.duration) || 0) + '|' +
                 ((c.transitionOut && c.transitionOut.type) || '') + ':' +
                 ((c.transitionOut && c.transitionOut.duration) || 0) + ';';
        }
      } catch (e) {}
      if (sig !== lastTrSig) { lastTrSig = sig; renderTr(); }
      live();
    });
    subbed = true;
  }

  var tries = 0;
  function boot() {
    var ok = ensureLane();
    chain();
    if (ok) { load(); zoom = pps(); render(); sub(); return; }
    if (++tries > 160) return;      /* ~40s, then give up quietly */
    setTimeout(boot, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.NC_FX_BARS = {
    list: function () { return bars.slice(); },
    add: add,
    remove: remove,
    clear: function () { bars = []; save(); render(); },
    at: function (t) {
      var out = [];
      for (var i = 0; i < bars.length; i++) {
        var b = bars[i];
        if (t >= b.start && t < b.start + b.dur) out.push(b.fx);
      }
      return out;
    },
    state: function () {
      return { lane: !!(lane && lane.isConnected), host: !!host, chained: chained,
               bars: bars.length, pps: pps(), selected: sel };
    },
    rescan: function () { host = null; if (obs) { obs.disconnect(); obs = null; } boot(); }
  };
})();
