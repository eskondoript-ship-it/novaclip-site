/* ============================================================================
   LIVE LEADERBOARD — one board, four games
   ============================================================================
   Drops a board into any of the mini-games, submits a score when one is set,
   and keeps the table current while somebody is looking at it.

   HOW "LIVE" IT ACTUALLY IS, SAID PLAINLY

   It polls. Cloudflare KV is not a push channel and there is no socket here,
   so every four seconds the board asks the worker what it holds now. That is
   not the same as a push and this file is not going to call it one.

   What makes it feel live rather than stale:

     - it polls only while the tab is VISIBLE and the board is ON SCREEN.
       A backgrounded tab polling a worker every four seconds forever is a
       battery drain and a bill, and nobody is reading it.
     - your own score appears instantly, because the POST response carries the
       new board. You never wait a poll cycle to see yourself move.
     - a row that changed since the last poll flashes, so movement is
       noticeable without watching.

   WHEN THERE IS NO SERVER

   Most people running this have not deployed the leaderboard worker. Rather
   than an empty box or a spinner for ever, the board says there is no server
   and shows the local best instead, which is a real number and the only one
   that exists in that case.

   WHICH WAY IS UP

   Reaction time is the one where lower wins. The direction comes from the
   worker with the board, so this file never has to know — and cannot get it
   wrong for a game added later.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_BOARD) return;

  var POLL_MS = 4000;
  var LOCAL_BEST = {
    typing: 'nc_typing_best',
    flap: 'nc_flap_best',
    reaction: 'nc_reaction_best',
    aim: 'nc_aim_best'
  };

  function server() {
    try {
      if (typeof ncServer === 'function') return ncServer();
      return localStorage.getItem('nc_server') || '';
    } catch (e) { return ''; }
  }
  function myKey() {
    try { return localStorage.getItem('nc_key') || ''; } catch (e) { return ''; }
  }
  /* ------------------------------------------------------------------------
     WHAT COUNTS AS YOUR NAME

     nc_name is the one the profile dialog in nova.js writes, so it wins.

     nc_username was missing from this list and that was the whole bug. It is
     what account.js stores when somebody registers or signs in — which is the
     one moment a player is most certain they have told this site who they are.
     Without it, registering an account and then playing produced {noName:true},
     the score was dropped before it was ever sent, and the board beside them
     carried on saying nobody had posted. Silently, because all four games call
     submit() inside a try/catch and throw the answer away.

     A YouTube channel last: it is the least deliberate of the three.
     ---------------------------------------------------------------------- */
  function myName() {
    try {
      var n = localStorage.getItem('nc_name');
      if (n) return n;
      var u = localStorage.getItem('nc_username');
      if (u) return u;
      var y = JSON.parse(localStorage.getItem('nc_yt') || 'null');
      if (y && y.channel) return y.channel;
    } catch (e) {}
    return '';
  }

  /* The worker truncates at 24 and strips control characters (cleanName).
     Doing the same here means the row that comes back matches what was typed,
     rather than a quietly shortened version of it. */
  function tidyName(v) {
    return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24);
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[<>&"]/g, function (m) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[m];
    });
  }

  var CSS =
    '.ncbd{margin:18px auto 0;max-width:520px;border-radius:16px;overflow:hidden;' +
      'background:var(--nc-bg2,rgba(255,255,255,.04));' +
      'border:1px solid var(--nc-line,rgba(255,255,255,.1));' +
      "font:14px/1.5 system-ui,'Segoe UI',sans-serif;color:var(--nc-text,#EAF2FF)}" +
    '.ncbd h3{margin:0;padding:13px 16px;font-size:.82rem;font-weight:800;letter-spacing:.1em;' +
      'text-transform:uppercase;display:flex;align-items:center;gap:9px;' +
      'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}' +
    '.ncbd h3 .dot{width:8px;height:8px;border-radius:50%;background:#6FE3B0;flex:0 0 auto;' +
      'box-shadow:0 0 8px #6FE3B0;animation:ncbdPulse 2s ease-in-out infinite}' +
    '.ncbd h3 .dot.off{background:var(--nc-dim2,#6B7690);box-shadow:none;animation:none}' +
    '@keyframes ncbdPulse{0%,100%{opacity:1}50%{opacity:.35}}' +
    '.ncbd h3 .n{margin-left:auto;font-size:.7rem;font-weight:700;letter-spacing:.06em;' +
      'color:var(--nc-dim,#8B97B0)}' +
    '.ncbd ol{list-style:none;margin:0;padding:6px 0;max-height:290px;overflow-y:auto}' +
    '.ncbd li{display:flex;align-items:center;gap:12px;padding:9px 16px;font-size:.9rem}' +
    '.ncbd li.me{background:rgba(0,229,255,.08);box-shadow:inset 3px 0 0 var(--nc-cyan,#00E5FF)}' +
    '.ncbd li.moved{animation:ncbdFlash 1.4s ease-out}' +
    '@keyframes ncbdFlash{0%{background:rgba(111,227,176,.28)}100%{background:transparent}}' +
    '.ncbd .r{min-width:26px;font-variant-numeric:tabular-nums;font-weight:800;' +
      'color:var(--nc-dim,#8B97B0);font-size:.85rem}' +
    '.ncbd li:nth-child(1) .r{color:#FFD24A}.ncbd li:nth-child(2) .r{color:#D8E2F0}' +
    '.ncbd li:nth-child(3) .r{color:#E0A46B}' +
    '.ncbd .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ncbd .sc{font-variant-numeric:tabular-nums;font-weight:800;color:var(--nc-cyan,#00E5FF)}' +
    '.ncbd .sc small{font-weight:600;color:var(--nc-dim,#8B97B0);font-size:.72rem;margin-left:3px}' +
    '.ncbd .msg{padding:16px;color:var(--nc-dim,#8B97B0);font-size:.86rem;line-height:1.6}' +
    '.ncbd .msg code{font-size:.8rem;background:rgba(0,0,0,.3);padding:2px 5px;border-radius:5px;' +
      'word-break:break-all}' +
    /* The note under the board. Only ever shown when there is something to
       say about YOUR score — an empty one is hidden, not a blank strip. */
    '.ncbd .note{padding:13px 16px;font-size:.84rem;line-height:1.55;' +
      'border-top:1px solid var(--nc-line,rgba(255,255,255,.1));' +
      'background:rgba(255,210,74,.07);color:var(--nc-text,#EAF2FF)}' +
    '.ncbd .note.bad{background:rgba(255,107,157,.09)}' +
    '.ncbd .note b{color:#FFD24A}' +
    '.ncbd .note form{display:flex;gap:8px;margin-top:9px}' +
    '.ncbd .note input{flex:1;min-width:0;padding:8px 11px;border-radius:9px;' +
      'border:1px solid var(--nc-line,rgba(255,255,255,.18));' +
      'background:var(--nc-bg,rgba(0,0,0,.28));color:inherit;font:inherit}' +
    '.ncbd .note button{padding:8px 15px;border-radius:9px;border:0;cursor:pointer;' +
      'font:inherit;font-weight:800;background:var(--nc-cyan,#00E5FF);color:#04121C}';

  function styles() {
    if (document.getElementById('ncbd-css')) return;
    var s = document.createElement('style');
    s.id = 'ncbd-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function Board(game, mount) {
    this.game = game;
    this.el = mount;
    this.rows = [];
    this.dir = 'high';
    this.label = '';
    this.prev = {};        // name -> score, to spot what moved
    this.timer = 0;
    this.visible = true;
    this.el.className = 'ncbd';
    this.el.innerHTML = "<h3><span class='dot off'></span><span>Leaderboard</span>" +
                        "<span class='n'></span></h3><div class='msg'>Loading…</div>";
    this.head = this.el.querySelector('h3 span:nth-child(2)');
    this.dot = this.el.querySelector('.dot');
    this.count = this.el.querySelector('.n');
    /* A permanent element rather than markup inside paint(): paint() replaces
       the list wholesale every four seconds, and a note rebuilt on that cycle
       would take the half-typed name in the box with it. */
    this.note = document.createElement('div');
    this.note.className = 'note';
    this.note.hidden = true;
    this.el.appendChild(this.note);
    this.held = null;      // a score waiting for a name to post it under
  }

  /* paint() and offline() both swap the list out by outerHTML, which leaves
     the note where it is — but the insertAdjacentHTML fallback in paint()
     would land after it. Moving it to the end afterwards costs nothing and
     means neither has to think about ordering. */
  Board.prototype.keepNoteLast = function () {
    if (this.note.parentNode === this.el) this.el.appendChild(this.note);
  };

  Board.prototype.clearNote = function () {
    this.note.hidden = true;
    this.note.className = 'note';
    this.note.innerHTML = '';
  };

  /* ------------------------------------------------------------------------
     ASK FOR A NAME, RIGHT WHERE THE SCORE WAS LOST

     A board cannot list somebody it has no name for, and until now that ended
     the story: submit() returned {noName:true} into a try/catch and the player
     watched a board that did not include them, with nothing on screen
     connecting the two. The name box goes here, next to the score it is
     holding, rather than on the profile page they would have to go and find.
     ---------------------------------------------------------------------- */
  Board.prototype.askName = function (score, lead, bad) {
    var self = this;
    this.held = score;
    this.note.hidden = false;
    this.note.className = 'note' + (bad ? ' bad' : '');
    this.note.innerHTML =
      (lead || ('Your <b>' + esc(String(score)) + (this.label ? ' ' + esc(this.label) : '') +
                '</b> is not on the board yet — this browser has no name to put on it.')) +
      '<form><input maxlength="24" placeholder="A name for the board" ' +
      'aria-label="A name for the board"><button type="submit">Post it</button></form>';
    var form = this.note.querySelector('form');
    var input = this.note.querySelector('input');
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 0);
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var v = tidyName(input.value);
      if (v.length < 2) { input.focus(); return; }
      try { localStorage.setItem('nc_name', v); } catch (e) {}
      var s = self.held;
      self.clearNote();
      self.held = null;
      submit(self.game, s);
    };
  };

  Board.prototype.sayNote = function (html, bad) {
    this.note.hidden = false;
    this.note.className = 'note' + (bad ? ' bad' : '');
    this.note.innerHTML = html;
  };

  Board.prototype.paint = function () {
    var me = myName();
    var self = this;
    if (!this.rows.length) {
      this.el.querySelector('ol, .msg').outerHTML =
        "<div class='msg'>Nobody has posted a score yet. Be the first.</div>";
      this.count.textContent = '';
      return;
    }
    var html = '<ol>' + this.rows.map(function (r, i) {
      var moved = self.prev[r.name] !== undefined && self.prev[r.name] !== r.score;
      var isMe = me && r.name === me;
      return "<li class='" + (isMe ? 'me ' : '') + (moved ? 'moved' : '') + "'>" +
        "<span class='r'>" + (i + 1) + "</span>" +
        "<span class='nm'>" + esc(r.name) + '</span>' +
        "<span class='sc'>" + r.score +
        (self.label ? "<small>" + esc(self.label) + '</small>' : '') + '</span></li>';
    }).join('') + '</ol>';
    var old = this.el.querySelector('ol, .msg');
    if (old) old.outerHTML = html; else this.el.insertAdjacentHTML('beforeend', html);
    this.count.textContent = this.rows.length + (this.rows.length === 1 ? ' player' : ' players');
    this.prev = {};
    this.rows.forEach(function (r) { self.prev[r.name] = r.score; });
    this.keepNoteLast();
  };

  Board.prototype.offline = function (why) {
    this.dot.className = 'dot off';
    var best = '';
    try {
      var v = localStorage.getItem(LOCAL_BEST[this.game] || '');
      if (v) best = '<br><br>Your best on this device: <b>' + esc(v) +
                    (this.label ? ' ' + esc(this.label) : '') + '</b>.';
    } catch (e) {}
    var old = this.el.querySelector('ol, .msg');
    var msg = "<div class='msg'>" + why + best + '</div>';
    if (old) old.outerHTML = msg; else this.el.insertAdjacentHTML('beforeend', msg);
    this.count.textContent = '';
    this.keepNoteLast();
  };

  Board.prototype.fetch = function () {
    var self = this;
    var s = server();
    if (!s) {
      return this.offline('No leaderboard server is set on this browser, so there is nobody ' +
        'to compare with. Deploy <code>leaderboard-worker.js</code> and run ' +
        "<code>localStorage.setItem('nc_server','https://your-worker.workers.dev')</code>");
    }
    /* --------------------------------------------------------------------
       SAY WHAT ACTUALLY WENT WRONG
       --------------------------------------------------------------------
       This used to catch everything and print "It may be waking up." That is
       one of at least five things it can be, and it is the only one that
       fixes itself — so the message was reassuring in exactly the case where
       it should not have been.

       The five, and why telling them apart matters:

         the fetch rejects          no such worker, DNS, or the response has
                                    no CORS header — nothing to wait for
         404 on /scores             something IS deployed there, but not the
                                    leaderboard. This is the mistake the repo
                                    has already made once: ai-worker.js put at
                                    the leaderboard's address. Named, because
                                    guessing costs an afternoon.
         500                        deployed, running, and its KV binding is
                                    missing — the DB binding, specifically
         a JSON error field         the worker answered properly and is
                                    telling you something
         not JSON at all            an HTML error page, which usually means a
                                    proxy or a parked domain, not the worker

       The address is printed either way, because "the server" is not a thing
       anybody can check and a URL is.
       -------------------------------------------------------------------- */
    var base = s.replace(/\/$/, '');
    var where = ' <small>Trying <code>' + esc(base) + '</code>.</small>';

    return fetch(base + '/scores?game=' + encodeURIComponent(this.game),
                 { cache: 'no-store' })
      .then(function (r) {
        return r.text().then(function (body) {
          var out = null;
          try { out = JSON.parse(body); } catch (e) {}

          if (!r.ok) {
            if (r.status === 404) {
              throw new Error('The address answered, but it has no <code>/scores</code> — so ' +
                'something is deployed there and it is not the leaderboard. Check that it is ' +
                '<code>leaderboard-worker.js</code> and not <code>ai-worker.js</code>.');
            }
            if (r.status >= 500) {
              throw new Error('The leaderboard worker is running but failed (HTTP ' + r.status +
                '). The usual cause is a missing <code>DB</code> KV binding.');
            }
            throw new Error('The leaderboard server answered HTTP ' + r.status + '.');
          }
          if (!out) {
            throw new Error('The address answered with something that is not JSON, so it is ' +
              'probably not the worker.');
          }
          if (out.error) throw new Error('The leaderboard said: ' + esc(String(out.error)));
          return out;
        });
      })
      .then(function (out) {
        self.dir = out.dir || 'high';
        self.label = out.label || '';
        self.rows = Array.isArray(out.board) ? out.board : [];
        self.dot.className = 'dot';
        self.paint();
      })
      .catch(function (err) {
        var m = String((err && err.message) || err || '');
        /* A rejected fetch has no status to report — the request never got an
           answer at all. Everything above threw with a sentence in it. */
        if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) {
          m = navigator.onLine === false
            ? 'You are offline, so there is nothing to compare with yet.'
            : 'Nothing answered at that address. Either the worker is not deployed, ' +
              'or it is not sending the CORS header the browser needs.';
        }
        self.offline(m + where);
      });
  };

  /* Only poll while somebody could actually be reading it. An IntersectionObserver
     for on-screen, visibilitychange for the tab. Both, because a board scrolled
     out of view in a foreground tab is just as unread as a backgrounded one. */
  Board.prototype.start = function () {
    var self = this;
    this.fetch();

    var onScreen = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        tick();
      }, { threshold: 0 }).observe(this.el);
    }
    document.addEventListener('visibilitychange', tick);

    function tick() {
      var want = onScreen && document.visibilityState === 'visible';
      if (want && !self.timer) {
        self.timer = setInterval(function () { self.fetch(); }, POLL_MS);
        self.fetch();
      } else if (!want && self.timer) {
        clearInterval(self.timer);
        self.timer = 0;
      }
    }
    tick();
    addEventListener('pagehide', function () { clearInterval(self.timer); self.timer = 0; });
  };

  /* ---- the public bits --------------------------------------------------- */
  var boards = {};

  function mount(game, target) {
    styles();
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) {
      el = document.createElement('div');
      document.body.appendChild(el);
    }
    var b = new Board(game, el);
    boards[game] = b;
    b.start();
    return b;
  }

  /* Called by a game when a run finishes. Posting every run rather than only
     personal bests is deliberate: the worker decides what is an improvement,
     and it is the only party that can see everybody's.

     WHY THIS TELLS THE BOARD AND NOT JUST ITS CALLER

     Every one of the four games calls this as

         try { if (window.NC_BOARD) NC_BOARD.submit('typing', b); } catch (e) {}

     — fire and forget, answer discarded. That is reasonable of them; a game
     should not have to know what a leaderboard can refuse. But it meant the
     four ways a score can fail to land were all invisible, and the commonest
     of them (no name on this browser) looked exactly like nobody having
     played. So every outcome that a person could act on now goes onto the
     board itself, which is the thing they are already looking at. */
  function submit(game, score) {
    var b = boards[game];
    var s = server();
    if (!s) return Promise.resolve({ offline: true });

    if (!Number.isFinite(Number(score))) return Promise.resolve({ bad: true });

    var name = myName();
    if (!name) {
      if (b) b.askName(Number(score));
      return Promise.resolve({ noName: true });
    }

    return fetch(s.replace(/\/$/, '') + '/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: game, score: Number(score), name: name, key: myKey() })
    }).then(function (r) { return r.json(); })
      .then(function (out) {
        /* The POST comes back with the new board, so your own row appears at
           once instead of on the next poll. */
        if (b && Array.isArray(out.board)) {
          b.dir = out.dir || b.dir;
          b.label = out.label || b.label;
          b.rows = out.board;
          b.dot.className = 'dot';
          b.paint();
        }
        if (b && out.ok) b.clearNote();
        /* 409: the first account to play under a name owns it, so this is
           somebody else's. Offering the box again is the fix, and it is the
           same box. */
        if (b && out.taken) {
          b.askName(Number(score),
            '<b>' + esc(name) + '</b> is already another player\'s name on this board, so ' +
            'your score could not be posted under it. Pick a different one.', true);
        } else if (b && out.error) {
          b.sayNote('Your score was not posted: ' + esc(String(out.error)) + '.', true);
        }
        return out;
      })
      .catch(function () {
        if (b) b.sayNote('Your score could not be sent just now. It stays saved on this ' +
                         'device, and the next run will try again.', true);
        return { failed: true };
      });
  }

  window.NC_BOARD = { mount: mount, submit: submit, POLL_MS: POLL_MS };
})();
