/* NOVACLIP — MORE THAN ONE TIMELINE IN A PROJECT
 * ==============================================
 * Asked for: "make it possible to add another timeline." A strip of tabs above
 * the lanes — Timeline 1, Timeline 2, + — where each one holds its own lanes
 * and its own clips, and switching between them is instant.
 *
 * WHY THIS AND NOT A SECOND PROJECT
 *
 * The editor already has projects: a whole separate edit with its own media
 * library, reached from the chip beside the project name. That is the right
 * thing when you are making a different video. It is the wrong thing when you
 * are making the SAME video twice — a thirty-second cut and a sixty-second
 * cut of one afternoon's footage — because a second project cannot see the
 * first one's media, so you would upload everything again.
 *
 * Timelines share the media library and the project settings, and split
 * everything else. Upload once, cut it four ways, keep all four.
 *
 * WHAT A TIMELINE IS, EXACTLY
 *
 *     { id, name, tracks, clips, markers }
 *
 * and nothing else. Assets, settings, the export options and the project name
 * belong to the project and stay put when you switch. The store's own
 * tracks/clips/markers ARE the active timeline — there is no second copy of
 * the live one to drift out of step, because switching writes the outgoing
 * one to storage and loads the incoming one into the same three fields.
 *
 * UNDO IS PER TIMELINE, AND IN MEMORY
 *
 * Switching carries the undo stack out with the timeline and brings the other
 * one's back in. That matters: a shared stack would let Undo on Timeline 2
 * restore a clip into Timeline 1, which is the kind of bug that eats work.
 * The stacks are held in memory rather than written to storage — they are full
 * snapshots of everything, and fifty of them per timeline is not something to
 * put in localStorage, which is a five-megabyte drawer shared with the whole
 * site.
 *
 * IT SITS INSIDE THE PROJECT'S OWN SAVE
 *
 * The editor autosaves tracks/clips/markers every eight seconds, and the
 * projects layer snapshots the same. Both of those see the ACTIVE timeline,
 * which is exactly right: the project's current state is the timeline you are
 * looking at. The others live under nc_timelines, keyed by project, and the
 * active one is re-read from the store on boot so a restore always wins over
 * this file's copy.
 *
 * REACT OWNS THE PANEL THIS BAR LIVES IN
 *
 * The strip is inserted as the first child of the timeline panel, which React
 * renders into and can therefore throw away on any re-render. A small observer
 * puts it back. The alternative — floating it over the panel — would have
 * covered the toolbar underneath it at some window sizes, and a bar you cannot
 * always see is worse than one that occasionally reappears a frame late.
 */
(function () {
  'use strict';
  if (window.NC_TIMELINES) return;

  var KEY = 'nc_timelines';
  var BAR = 'nc-tl-bar';

  function store() { return window.__ncStore; }
  function proj() {
    try { return localStorage.getItem('novaclip_project_current') || 'default'; }
    catch (e) { return 'default'; }
  }
  function uid() { return 'tl' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeAll(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); }
    catch (e) { /* a full drawer must not take the editor down */ }
  }

  /* The live three fields, copied out. JSON rather than structuredClone
     because a clip can carry things structuredClone refuses, and everything
     in here came from JSON in the first place. */
  function capture() {
    var st = store().getState();
    try {
      return JSON.parse(JSON.stringify({
        tracks: st.tracks || [], clips: st.clips || [], markers: st.markers || []
      }));
    } catch (e) {
      return { tracks: st.tracks || [], clips: st.clips || [], markers: st.markers || [] };
    }
  }

  /* The lanes a brand-new timeline opens with — the same four a new project
     gets, so adding a timeline and starting a project feel like one thing. */
  function freshTracks() {
    var n = Date.now().toString(36);
    return [
      { id: 'track_tlv1_' + n, kind: 'video', name: 'V1', locked: false, hidden: false, muted: false, height: 72 },
      { id: 'track_tlv2_' + n, kind: 'video', name: 'V2', locked: false, hidden: false, muted: false, height: 72 },
      { id: 'track_tla1_' + n, kind: 'audio', name: 'A1', locked: false, hidden: false, muted: false, height: 64 },
      { id: 'track_tlt1_' + n, kind: 'text',  name: 'T1', locked: false, hidden: false, muted: false, height: 72 }
    ];
  }

  var hist = {};          /* id -> { past, future }, memory only. See the header. */

  /* THE PROJECT ID DOES NOT EXIST YET WHEN THE EDITOR OPENS.
     novaclip_project_current is written by the projects layer the first time
     it saves, which is several seconds in — so everything before that belongs
     to the key 'default', and everything after belongs to a real id. Without
     this, a timeline made in the first few seconds was filed under 'default',
     the id appeared, and the next lookup found nothing and helpfully built a
     brand-new empty Timeline 1 over the top. Measured: two timelines in
     storage, a third in memory, and switching between the two that existed
     did nothing at all.

     It is the same edit either way, so the shelf gets carried across the one
     time the name changes. */
  function migrate(all, p) {
    if (p === 'default' || all[p] || !all['default']) return false;
    all[p] = all['default'];
    delete all['default'];
    return true;
  }

  function book() {
    var all = readAll(), p = proj();
    var moved = migrate(all, p);
    if (!all[p] || !all[p].list || !all[p].list.length) {
      var first = capture();
      first.id = uid();
      first.name = 'Timeline 1';
      all[p] = { active: first.id, list: [first] };
      moved = true;
    }
    if (moved) writeAll(all);
    return all[p];
  }

  /* WRITES INTO THE CALLER'S OWN COPY, AND DOES NOT TOUCH STORAGE.
     The first version of this read storage, updated it and wrote it back —
     and every caller had already read its own copy a few lines earlier, so
     the caller's writeAll() put the pre-update version straight back. Adding
     a timeline and switching to it lost the one you came from: two functions
     both doing read-modify-write on the same key, each undoing the other.

     One rule now: whoever holds `all` does the writing, exactly once, and
     this only fills in the fields. */
  function stash(b) {
    if (!store() || !b) return;
    var now = capture();
    for (var i = 0; i < b.list.length; i++) {
      if (b.list[i].id !== b.active) continue;
      b.list[i].tracks = now.tracks;
      b.list[i].clips = now.clips;
      b.list[i].markers = now.markers;
      return;
    }
  }

  /* The standalone form, for the interval and for pagehide. */
  function saveActive() {
    if (!store()) return;
    var all = readAll(), p = proj();
    migrate(all, p);
    var b = all[p];
    if (!b) return;
    stash(b);
    writeAll(all);
  }

  function switchTo(id) {
    var all = readAll(), p = proj();
    migrate(all, p);
    var b = all[p];
    if (!b || id === b.active) return;
    var target = null;
    for (var i = 0; i < b.list.length; i++) if (b.list[i].id === id) target = b.list[i];
    if (!target) return;

    var st = store().getState();
    /* the outgoing one, contents and undo stack both */
    hist[b.active] = { past: st.past || [], future: st.future || [] };
    stash(b);

    b.active = id;
    writeAll(all);

    var back = hist[id] || { past: [], future: [] };
    store().setState({
      tracks: target.tracks || freshTracks(),
      clips: target.clips || [],
      markers: target.markers || [],
      selectedClipId: null,
      selectedTrackId: null,
      playhead: 0,
      isPlaying: false,
      past: back.past,
      future: back.future
    });
    paint();
  }

  function create() {
    book();                                   /* make sure there is a list */
    var all = readAll(), p = proj();
    migrate(all, p);
    var b = all[p];
    if (!b) return;
    stash(b);                                 /* keep what is on screen now */
    var made = { id: uid(), name: 'Timeline ' + (b.list.length + 1),
                 tracks: freshTracks(), clips: [], markers: [] };
    b.list.push(made);
    writeAll(all);
    switchTo(made.id);
  }

  function rename(id) {
    var all = readAll(), p = proj();
    migrate(all, p);
    var b = all[p];
    if (!b) return;
    var t = null;
    for (var i = 0; i < b.list.length; i++) if (b.list[i].id === id) t = b.list[i];
    if (!t) return;
    var name = window.prompt('Name this timeline', t.name);
    if (name == null) return;
    name = String(name).trim().slice(0, 40);
    if (!name) return;
    t.name = name;
    writeAll(all);
    paint();
  }

  function remove(id) {
    var all = readAll(), p = proj();
    migrate(all, p);
    var b = all[p];
    if (!b || b.list.length < 2) return;      /* never the last one */
    var t = null, at = -1;
    for (var i = 0; i < b.list.length; i++) if (b.list[i].id === id) { t = b.list[i]; at = i; }
    if (!t) return;
    var many = (t.clips || []).length;
    var msg = 'Delete "' + t.name + '"?' +
      (many ? ' It has ' + many + ' clip' + (many > 1 ? 's' : '') + ' on it.' : '') +
      ' Your uploaded media is not touched.';
    if (!window.confirm(msg)) return;

    var wasActive = b.active === id;
    b.list.splice(at, 1);
    delete hist[id];
    if (wasActive) {
      /* Point at a neighbour BEFORE writing, so a reload in between cannot
         land on a timeline that is no longer in the list. */
      b.active = b.list[Math.max(0, at - 1)].id;
      writeAll(all);
      var next = b.list[Math.max(0, at - 1)];
      var back = hist[next.id] || { past: [], future: [] };
      store().setState({
        tracks: next.tracks || freshTracks(), clips: next.clips || [], markers: next.markers || [],
        selectedClipId: null, selectedTrackId: null, playhead: 0, isPlaying: false,
        past: back.past, future: back.future
      });
    } else {
      writeAll(all);
    }
    paint();
  }

  /* ==========================================================================
     THE STRIP
     ========================================================================== */
  function css() {
    if (document.getElementById('nc-tl-css')) return;
    var s = document.createElement('style');
    s.id = 'nc-tl-css';
    s.textContent = [
      '.nc-tl-bar{display:flex;align-items:center;gap:6px;padding:6px 10px;flex:0 0 auto;',
      '  border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent);',
      '  overflow-x:auto;scrollbar-width:none}',
      '.nc-tl-bar::-webkit-scrollbar{display:none}',
      '.nc-tl-tab{display:inline-flex;align-items:center;gap:7px;flex:0 0 auto;cursor:pointer;',
      '  padding:5px 10px;border-radius:9px;font:600 12px system-ui,sans-serif;color:inherit;',
      '  opacity:.62;background:transparent;',
      '  border:1px solid color-mix(in srgb,currentColor 14%,transparent)}',
      '.nc-tl-tab:hover{opacity:.95;background:color-mix(in srgb,currentColor 8%,transparent)}',
      '.nc-tl-tab.on{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent);',
      '  border-color:#38bdf8aa;box-shadow:0 0 0 1px #38bdf855}',
      '.nc-tl-count{font-size:10px;opacity:.6;font-variant-numeric:tabular-nums}',
      '.nc-tl-x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;',
      '  border-radius:5px;border:0;background:transparent;color:inherit;opacity:.55;',
      '  font:700 13px/1 system-ui,sans-serif;cursor:pointer;padding:0}',
      '.nc-tl-x:hover{opacity:1;background:color-mix(in srgb,#fb7185 30%,transparent)}',
      '.nc-tl-add{flex:0 0 auto;cursor:pointer;padding:5px 11px;border-radius:9px;',
      '  font:700 12px system-ui,sans-serif;color:inherit;opacity:.72;background:transparent;',
      '  border:1px dashed color-mix(in srgb,currentColor 26%,transparent)}',
      '.nc-tl-add:hover{opacity:1;border-style:solid;background:color-mix(in srgb,currentColor 9%,transparent)}',
      '.nc-tl-hint{margin-left:auto;flex:0 0 auto;font:600 10px system-ui,sans-serif;opacity:.4;',
      '  white-space:nowrap;padding-left:10px}'
    ].join('');
    document.head.appendChild(s);
  }

  /* The panel the lanes live in. Found through the Snap button because that is
     the one control in there with a stable, readable name. */
  function panel() {
    var snap = null;
    var all = document.querySelectorAll('button');
    for (var i = 0; i < all.length; i++) {
      if (/^snap$/i.test((all[i].textContent || '').trim())) { snap = all[i]; break; }
    }
    if (!snap) return null;
    var bar = snap.parentElement;
    var root = bar && bar.parentElement;
    if (!root || !/flex-col/.test(root.className || '')) return null;
    return root;
  }

  function paint() {
    var host = panel();
    if (!host || !store()) return;
    css();
    var b = book();

    var el = document.getElementById(BAR);
    if (!el) {
      el = document.createElement('div');
      el.id = BAR;
      el.className = 'nc-tl-bar';
    }
    if (el.parentElement !== host || host.firstChild !== el) {
      host.insertBefore(el, host.firstChild);
    }

    var html = '';
    for (var i = 0; i < b.list.length; i++) {
      var t = b.list[i];
      var on = t.id === b.active;
      var n = on ? (store().getState().clips || []).length : (t.clips || []).length;
      html += '<span class="nc-tl-tab' + (on ? ' on' : '') + '" data-tl="' + t.id + '" ' +
              'title="' + esc(t.name) + (on ? ' — double-click to rename' : '') + '">' +
                esc(t.name) +
                '<span class="nc-tl-count">' + n + '</span>' +
                (on && b.list.length > 1
                  ? '<button type="button" class="nc-tl-x" data-del="' + t.id + '" ' +
                    'aria-label="Delete this timeline">&times;</button>' : '') +
              '</span>';
    }
    html += '<button type="button" class="nc-tl-add" id="nc-tl-add">+ Timeline</button>';
    html += '<span class="nc-tl-hint">same media, separate cut</span>';
    el.innerHTML = html;

    el.querySelectorAll('[data-tl]').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        if (e.target && e.target.getAttribute && e.target.getAttribute('data-del')) return;
        switchTo(tab.getAttribute('data-tl'));
      });
      tab.addEventListener('dblclick', function () { rename(tab.getAttribute('data-tl')); });
    });
    el.querySelectorAll('[data-del]').forEach(function (x) {
      x.addEventListener('click', function (e) {
        e.stopPropagation();
        remove(x.getAttribute('data-del'));
      });
    });
    var add = document.getElementById('nc-tl-add');
    if (add) add.addEventListener('click', create);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */
  /* WHO IS THE TRUTH ON BOOT, AND WHY IT IS THIS FILE

     The first version stashed the live store into the active timeline as soon
     as the store existed. That is several seconds before the project finishes
     restoring from IndexedDB, so what it stashed was the empty state the
     editor starts with — and both timelines came back from a reload with
     nothing on them. It saved over the work with a blank page.

     So the order is the other way round. nc_timelines is written every two
     seconds and again on pagehide; the editor's own autosave runs every
     eight. This copy is therefore never staler than the project's, and on
     boot it is applied to the store rather than read from it.

     With one exception, for the first run on a project that already existed
     before timelines did: if this file has nothing and the restore brought
     something back, the restore is obviously right, and it is adopted as
     Timeline 1 instead of being wiped. */
  var ready = false;

  function settle() {
    var b = book(), act = null;
    for (var i = 0; i < b.list.length; i++) if (b.list[i].id === b.active) act = b.list[i];
    if (!act) { ready = true; paint(); return; }

    var st = store().getState();
    var mine = (act.clips || []).length, live = (st.clips || []).length;

    if (mine === 0 && live > 0) {
      saveActive();                      /* adopt what the project restored */
    } else if (mine > 0) {
      store().setState({
        tracks: act.tracks && act.tracks.length ? act.tracks : st.tracks,
        clips: act.clips,
        markers: act.markers || [],
        selectedClipId: null,
        selectedTrackId: null
      });
    }
    ready = true;
    paint();
  }

  var tries = 0;
  (function wait() {
    setTimeout(function () {
      if (!store()) { if (++tries < 60) wait(); return; }
      paint();                           /* the strip can show immediately */
      /* Long enough for the project restore to have landed, so this is
         deciding against a finished state rather than a half-loaded one. */
      setTimeout(settle, 2200);
    }, 150);
  })();

  /* React re-renders the panel and takes the strip with it. */
  try {
    new MutationObserver(function () {
      if (!document.getElementById(BAR) && panel()) paint();
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  /* A safety net for the active timeline's contents, and it keeps the clip
     counts on the other tabs honest. Five seconds, which is under the
     editor's own eight-second autosave so the two never disagree for long. */
  var lastProj = proj();
  setInterval(function () {
    if (!store()) return;
    var now = proj();
    if (now !== lastProj) {
      /* A different project is open — its timelines, not the last one's. */
      lastProj = now;
      paint();
      return;
    }
    if (ready) saveActive();          /* never before settle() has decided */
  }, 2000);
  window.addEventListener('pagehide', function () {
    try { if (ready) saveActive(); } catch (e) {}
  });

  window.NC_TIMELINES = { switchTo: switchTo, create: create, rename: rename,
                          remove: remove, list: function () { return book().list; } };
})();
