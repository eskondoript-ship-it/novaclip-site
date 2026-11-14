/* NOVACLIP — MORE THAN ONE CHANNEL
 * ===========================================================================
 * Asked for: "make it easy to change between channels if they have more than
 * one".
 *
 * WHAT IT WAS LIKE BEFORE
 * ---------------------------------------------------------------------------
 * analytics.html asks YouTube for `channels?...&mine=true`, which returns the
 * ONE channel belonging to the identity that signed in, and stores its title
 * in nc_yt. There was no record that any other channel existed and no way to
 * get to one. Somebody with a personal channel and a brand channel — which is
 * most people who have ever made a second channel for a different kind of
 * video — had to sign out, sign back in, and hope Google's picker offered the
 * right one. There was nothing on the page to say a switch was even possible.
 *
 * THE HONEST SHAPE OF THE PROBLEM
 * ---------------------------------------------------------------------------
 * An OAuth access token is bound to the identity that was chosen on Google's
 * screen. It cannot be pointed at a different channel afterwards. There is no
 * "list my channels" call either: `mine=true` means the signed-in one, and
 * `managedByMe=true` only answers for CMS content owners, which a teenager
 * with two channels is not.
 *
 * So switching genuinely requires going back through Google. What CAN be
 * fixed, and is what makes the difference in use, is everything around that:
 *
 *   - remember every channel that has ever signed in here, so the second one
 *     is a name in a list rather than something to be found again;
 *   - put a switcher on the page at all, so it is discoverable before you
 *     know it exists;
 *   - ask Google for the picker explicitly (prompt=select_account consent)
 *     rather than letting it wave the existing grant through, which is what
 *     made the old sign-out/sign-in dance so unreliable;
 *   - say which channel came back, and say so loudly when it is not the one
 *     that was asked for, instead of quietly drawing the wrong numbers.
 *
 * That last point is the one that matters most. Google decides what its
 * picker shows; this code cannot force a particular channel to be chosen. It
 * can check what arrived and tell the truth about it.
 *
 * NO AVATARS
 * ---------------------------------------------------------------------------
 * The obvious design is the channel's profile picture. The API hands one over
 * free — and it is hosted on yt3.ggpht.com, so every Studio load would make a
 * request to a Google image host. Nothing else on this entire site loads an
 * image from a third party (checked: no ggpht, ytimg or googleusercontent
 * anywhere in the repo), and that is a line in the privacy policy to buy a
 * round picture. So the chip draws initials on a colour derived from the
 * channel id, which is recognisable enough to tell two channels apart at a
 * glance and costs no request.
 *
 * WHAT GETS CLEARED ON A SWITCH
 * ---------------------------------------------------------------------------
 * Two caches on this site are keyed to nothing: nc_hist (upload dates, which
 * publish.html reads to work out a posting rhythm) and the creator-level
 * snapshot. Both belong to one channel. Carried across a switch they would
 * show channel A's level and A's posting rhythm over B's dashboard, which is
 * worse than showing nothing, so a switch drops both and they refill from the
 * API for whichever channel actually answered.
 *
 * WHERE IT RUNS
 * ---------------------------------------------------------------------------
 * The switch itself can only happen on analytics.html, because that is where
 * the Firebase auth objects live. The chip, though, reads localStorage and so
 * works on any page in the Studio: elsewhere it navigates to analytics.html
 * with ?switch=<id> and that page finishes the job on load.
 */
(function () {
  'use strict';
  if (window.NC_CH) return;

  var LIST_KEY = 'nc_channels';
  var TOK_KEY = 'nc_yt';
  var MAX = 8;                 /* more than anyone signs into from one browser */

  /* ---------------------------------------------------------------- storage */

  function readList() {
    try {
      var r = JSON.parse(localStorage.getItem(LIST_KEY) || 'null');
      if (r && r.list && r.list.length) return r.list;
    } catch (e) {}
    return [];
  }

  function writeList(list) {
    try { localStorage.setItem(LIST_KEY, JSON.stringify({ v: 1, list: list })); } catch (e) {}
  }

  function tokRec() {
    try { return JSON.parse(localStorage.getItem(TOK_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  /* The id of the channel whose token is in hand. Older installs stored only a
     title, so fall back to matching on that — otherwise everybody who was
     already signed in before this file existed would see "no channel" until
     they reconnected. */
  function currentId() {
    var rec = tokRec();
    if (rec.channelId) return rec.channelId;
    if (rec.channel) {
      var l = readList();
      for (var i = 0; i < l.length; i++) if (l[i].title === rec.channel) return l[i].id;
    }
    return null;
  }

  function current() {
    var id = currentId(), l = readList();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    var rec = tokRec();
    /* Signed in, but to a channel that predates this list. */
    if (rec.channel) return { id: null, title: rec.channel };
    return null;
  }

  function signedIn() {
    var rec = tokRec();
    return !!(rec.t && (!rec.exp || rec.exp > Date.now() - 60 * 60 * 1000));
  }

  /* Record a channels.list item. Called from analytics.html the moment a
     sign-in resolves, which is the only place a channel's identity is ever
     known for certain. */
  function seen(item) {
    if (!item || !item.id) return null;
    var title = (item.snippet && item.snippet.title) || '';
    var rec = { id: item.id, title: title, at: Date.now() };
    var list = readList(), out = [rec];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== rec.id) out.push(list[i]);
    }
    writeList(out.slice(0, MAX));

    /* Pin the id onto the token record so a later page load knows which of
       the remembered channels the token in hand belongs to. */
    var t = tokRec();
    if (t.channelId !== rec.id || t.channel !== title) {
      t.channelId = rec.id;
      if (title) t.channel = title;
      try { localStorage.setItem(TOK_KEY, JSON.stringify(t)); } catch (e) {}
    }
    render();
    return rec;
  }

  /* Anything cached for "the channel" with no channel in the key. */
  function forgetChannelData() {
    try { localStorage.removeItem('nc_hist'); } catch (e) {}
    try { if (window.NC_CREATOR && NC_CREATOR.forget) NC_CREATOR.forget(); } catch (e) {}
  }

  function forget(id) {
    var list = readList(), out = [];
    for (var i = 0; i < list.length; i++) if (list[i].id !== id) out.push(list[i]);
    writeList(out);
    render();
  }

  /* ----------------------------------------------------------------- switch */

  function go(id) {
    forgetChannelData();
    if (typeof window.ncSwitchChannel === 'function') { window.ncSwitchChannel(id || ''); return; }
    /* Not on the page that owns the auth objects. Hand the job over. */
    var u = 'analytics.html';
    if (id) u += '?switch=' + encodeURIComponent(id);
    try { location.href = u; } catch (e) {}
  }

  /* -------------------------------------------------------------------- view */

  function initials(title) {
    var parts = String(title || '?').trim().split(/\s+/), s = '';
    for (var i = 0; i < parts.length && s.length < 2; i++) {
      if (parts[i]) s += parts[i][0];
    }
    return s.toUpperCase() || '?';
  }

  /* A stable colour per channel so the two chips never look the same. Hashing
     the id rather than the title means renaming a channel does not change its
     colour, which is the whole point of having one. */
  function hue(id) {
    var h = 0, s = String(id || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function dot(ch) {
    var d = el('span', 'ncch-dot', initials(ch.title));
    d.style.background = 'hsl(' + hue(ch.id || ch.title) + ' 62% 42%)';
    return d;
  }

  var openMenu = null;

  function closeMenu() {
    if (openMenu && openMenu.parentNode) openMenu.parentNode.removeChild(openMenu);
    openMenu = null;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('mousedown', onAway, true);
  }

  function onKey(e) {
    if (e.key === 'Escape') { closeMenu(); e.stopPropagation(); }
  }

  function onAway(e) {
    if (openMenu && !openMenu.contains(e.target) &&
        !(e.target.closest && e.target.closest('.ncch-chip'))) closeMenu();
  }

  function buildMenu(chip) {
    var m = el('div', 'ncch-menu');
    m.setAttribute('role', 'menu');
    var list = readList(), cur = currentId(), n = 0, others = 0;
    for (var j = 0; j < list.length; j++) if (list[j].id !== cur) others++;

    for (var i = 0; i < list.length; i++) {
      (function (ch) {
        var row = el('button', 'ncch-row' + (ch.id === cur ? ' is-on' : ''));
        row.type = 'button';
        row.setAttribute('role', 'menuitem');
        row.appendChild(dot(ch));
        var lab = el('span', 'ncch-rlab');
        lab.appendChild(el('b', null, ch.title || 'Channel'));
        lab.appendChild(el('i', null, ch.id === cur ? 'Showing now' : 'Signed in here before'));
        row.appendChild(lab);
        row.onclick = function () {
          closeMenu();
          if (ch.id === cur) return;
          go(ch.id);
        };
        m.appendChild(row);
        n++;
      })(list[i]);
    }

    if (n) m.appendChild(el('div', 'ncch-sep'));

    var add = el('button', 'ncch-row ncch-add');
    add.type = 'button';
    add.setAttribute('role', 'menuitem');
    add.appendChild(el('span', 'ncch-dot ncch-plus', '+'));
    var al = el('span', 'ncch-rlab');
    /* "Use a different one" only makes sense once a different one is listed.
       Until then this row IS the way a second channel gets discovered, so it
       has to say what it does. */
    al.appendChild(el('b', null, others ? 'Use a different channel…' : 'Add another channel…'));
    al.appendChild(el('i', null, 'Google asks which one'));
    add.appendChild(al);
    add.onclick = function () { closeMenu(); go(''); };
    m.appendChild(add);

    m.appendChild(el('p', 'ncch-why',
      'Switching goes back through Google, because the permission YouTube gives ' +
      'belongs to one channel at a time. Pick the channel on its screen.'));

    chip.appendChild(m);
    openMenu = m;
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onAway, true);
    var first = m.querySelector('.ncch-row');
    if (first) try { first.focus(); } catch (e) {}
  }

  function host() {
    var h = document.getElementById('ncChSwitch');
    if (h) return h;
    /* No host on the page: put one in the dashboard header if there is one,
       which is where it belongs on analytics.html. */
    var head = document.querySelector('.sthead');
    if (!head) return null;
    h = el('span', null);
    h.id = 'ncChSwitch';
    head.appendChild(h);
    return h;
  }

  function render() {
    var h = host();
    if (!h) return;
    closeMenu();
    h.textContent = '';
    if (!signedIn()) { h.style.display = 'none'; return; }
    h.style.display = '';

    var cur = current();
    if (!cur) { h.style.display = 'none'; return; }

    var chip = el('span', 'ncch-chip');
    var btn = el('button', 'ncch-btn');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.appendChild(dot(cur));
    btn.appendChild(el('span', 'ncch-name', cur.title || 'Your channel'));
    btn.appendChild(el('span', 'ncch-caret', '▾'));
    btn.title = 'Change channel';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (openMenu) { closeMenu(); return; }
      buildMenu(chip);
    };
    chip.appendChild(btn);
    h.appendChild(chip);
  }

  /* --------------------------------------------------------------- the paint */

  var CSS =
    '#ncChSwitch{margin-left:auto}' +
    '.ncch-chip{position:relative;display:inline-block}' +
    '.ncch-btn{display:inline-flex;align-items:center;gap:8px;min-height:36px;' +
      'padding:4px 10px 4px 4px;border:1px solid var(--nc-line,#2a3144);border-radius:999px;' +
      'background:var(--nc-card,rgba(255,255,255,.04));color:inherit;font:inherit;' +
      'font-size:.86rem;font-weight:600;cursor:pointer;max-width:16rem}' +
    '.ncch-btn:hover{border-color:var(--nc-lime,#B6FF3C)}' +
    '.ncch-btn:focus-visible{outline:2px solid var(--nc-lime,#B6FF3C);outline-offset:2px}' +
    '.ncch-dot{flex:0 0 auto;width:28px;height:28px;border-radius:50%;display:grid;' +
      'place-items:center;color:#fff;font-size:.72rem;font-weight:800;letter-spacing:.02em}' +
    '.ncch-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ncch-caret{flex:0 0 auto;opacity:.6;font-size:.7rem}' +
    '.ncch-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:60;width:19rem;' +
      'max-width:calc(100vw - 32px);padding:6px;border:1px solid var(--nc-line,#2a3144);' +
      'border-radius:14px;background:var(--nc-bg2,#121622);' +
      'box-shadow:0 18px 40px rgba(0,0,0,.45)}' +
    '.ncch-row{display:flex;align-items:center;gap:10px;width:100%;padding:8px;' +
      'border:0;border-radius:10px;background:none;color:inherit;font:inherit;' +
      'text-align:left;cursor:pointer}' +
    '.ncch-row:hover,.ncch-row:focus-visible{background:var(--nc-card,rgba(255,255,255,.06));outline:none}' +
    '.ncch-rlab{min-width:0}' +
    '.ncch-rlab b{display:block;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ncch-rlab i{display:block;font-style:normal;font-size:.74rem;color:var(--nc-dim,#7E8AA6)}' +
    '.ncch-row.is-on .ncch-rlab i{color:var(--nc-lime,#B6FF3C)}' +
    '.ncch-plus{background:var(--nc-line,#2a3144) !important;font-size:1rem}' +
    '.ncch-sep{height:1px;margin:6px 8px;background:var(--nc-line,#2a3144)}' +
    '.ncch-why{margin:4px 8px 6px;font-size:.72rem;line-height:1.45;color:var(--nc-dim,#7E8AA6)}' +
    '@media (max-width:560px){#ncChSwitch{margin-left:0;width:100%}.ncch-btn{max-width:100%}' +
      '.ncch-menu{right:auto;left:0}}';

  function paint() {
    if (document.getElementById('ncch-css')) return;
    var s = document.createElement('style');
    s.id = 'ncch-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function start() {
    paint();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.NC_CH = {
    seen: seen,
    list: readList,
    current: current,
    currentId: currentId,
    render: render,
    forget: forget,
    forgetChannelData: forgetChannelData,
    switchTo: go
  };
})();
