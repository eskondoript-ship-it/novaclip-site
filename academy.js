/* ============================================================================
   NOVACLIP — THE ACADEMY, the page half
   ============================================================================
   The rules are not in this file. Every decision that matters — who may teach,
   who may charge, what a lesson may say, where money would go — is made by
   leaderboard-worker.js, because this file is a page and a page can be edited
   by whoever is looking at it. What is here is the asking and the showing.

   That split is the whole reason the feature is safe to ship. A teenager who
   opens the console and sets `mayCharge = true` changes nothing: the next
   publish still comes back with the price at zero and a sentence explaining
   why, because the server read the age off the parent's own consent record.

   WHAT THIS PAGE DELIBERATELY DOES NOT HAVE

   No messaging. No profiles to visit. No way to reach the person who wrote a
   lesson. The product is the lesson, and the moment two children can talk to
   each other privately on the back of a sale, this stops being a shelf and
   starts being something that needs moderators, reporting flows and a duty of
   care nobody here can staff yet.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var LEVELS = { 'starter': 'Starting out', 'getting-there': 'Getting there', 'advanced': 'Already good' };
  var TIERS = { basic: 'Basic', advanced: 'Advanced', master: 'Master' };

  function who() {
    return { key: localStorage.getItem('nc_key') || '', code: localStorage.getItem('nc_code') || '' };
  }
  function signedIn() { var w = who(); return !!(w.key && w.code); }

  function api(path, body) {
    if (!window.ncApi) return Promise.reject(new Error('the community server is not configured'));
    return window.ncApi(path, body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({}, who(), body))
    } : undefined);
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function money(row) {
    if (row.price > 0) return '<span class="price">&euro;' + row.price.toFixed(2) + '</span>';
    if (row.coins > 0) return '<span class="price coins">' + row.coins + ' coins</span>';
    return '<span class="price coins">Free</span>';
  }

  /* --------------------------------------------------------------- the shelf */
  function shelf() {
    var cat = $('cat').value;
    var note = $('shelfnote');
    $('shelf').innerHTML = '';
    note.textContent = 'Loading…';
    window.ncApi('/academy/list' + (cat ? '?cat=' + encodeURIComponent(cat) : ''))
      .then(function (rows) {
        if (!rows.length) {
          note.textContent = 'Nothing here yet. If you have a certificate, the Teach tab is how it gets here.';
          return;
        }
        note.textContent = '';
        $('shelf').innerHTML = rows.map(function (r) {
          return '<article class="lesson">' +
            '<h3>' + esc(r.title) + '</h3>' +
            '<div class="who">' + esc(r.by) + (r.tier ? ' &middot; ' + (TIERS[r.tier] || r.tier) + ' certificate' : '') + '</div>' +
            '<p class="blurb">' + esc(r.blurb || '') + '</p>' +
            '<div class="foot"><span class="pill">' + esc(LEVELS[r.level] || r.level) + '</span>' +
            money(r) + '<button data-id="' + esc(r.id) + '">Open</button></div>' +
            '</article>';
        }).join('');
        [].forEach.call($('shelf').querySelectorAll('button'), function (b) {
          b.onclick = function () { read(b.getAttribute('data-id')); };
        });
      })
      .catch(function (e) { note.textContent = 'Could not reach the Academy: ' + e.message; });
  }

  /* ------------------------------------------------------------- one lesson */
  function read(id) {
    api('/academy/item', { id: id }).then(function (row) {
      $('readcard').hidden = false;
      $('r-title').textContent = row.title;
      $('r-who').textContent = row.by + (row.tier ? ' · ' + (TIERS[row.tier] || row.tier) + ' certificate' : '');
      $('r-body').textContent = row.content;
      var out = $('r-out');
      out.innerHTML = '';
      if (row.open) {
        out.innerHTML = '<p class="muted">' + (row.owner ? 'This is yours.' : 'Yours to keep.') + '</p>';
      } else if (!signedIn()) {
        out.innerHTML = '<p class="muted">Sign in on the Profile page to get this lesson.</p>';
      } else {
        var b = document.createElement('button');
        b.className = 'go';
        b.textContent = row.price > 0
          ? 'Get it for €' + row.price.toFixed(2)
          : 'Get it for ' + row.coins + ' coins';
        b.onclick = function () { buy(id, b); };
        out.appendChild(b);
      }
      $('readcard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) {
      $('readcard').hidden = false;
      $('r-body').textContent = 'Could not open that lesson: ' + e.message;
    });
  }

  function buy(id, btn) {
    btn.disabled = true;
    btn.textContent = 'One moment…';
    api('/academy/buy', { id: id }).then(function () {
      read(id);
    }).catch(function (e) {
      /* THE HONEST FAILURE. Paid lessons answer 503 until a payout processor
         exists, and saying so plainly is the point: a button that looks like it
         worked and did nothing is worse than one that explains itself. */
      btn.disabled = false;
      btn.textContent = 'Try again';
      $('r-out').insertAdjacentHTML('beforeend',
        '<p class="muted" style="margin-top:10px">' + esc(e.message) +
        '. Lessons priced in coins work now; money is waiting on the payout side, ' +
        'which pays the seller&rsquo;s parent rather than the seller.</p>');
    });
  }

  /* ------------------------------------------------------------- the teaching */
  function gate() {
    var g = $('gate');
    if (!signedIn()) {
      g.innerHTML = '<div class="gate"><b>Sign in first</b>The Academy needs to know whose lesson it is. ' +
        'Your account lives on the Profile page.</div>';
      $('makecard').hidden = true;
      $('minecard').hidden = true;
      return;
    }
    g.innerHTML = '<p class="muted">Checking what you are allowed to do…</p>';
    api('/academy/standing', {}).then(function (st) {
      var bits = [];
      if (!st.consent) {
        bits.push('<b>A parent has to switch this on</b>Open the Family Dashboard on this device and turn ' +
          'on teaching. They are asked for their own name and email, because any money a lesson earns is ' +
          'paid to them and not to you &mdash; under 18 you cannot hold a payout account, and that is the ' +
          'law rather than our rule.');
      } else if (!st.cert) {
        bits.push('<b>Earn a certificate first</b>Teaching here is something you earn. Any certificate ' +
          'opens it &mdash; see the Pricing page for what each one asks for.');
      } else if (!st.mayCharge) {
        bits.push('<b>You can teach, for coins</b>You are under ' + st.workAge + ', and in Portugal that is ' +
          'below the age anybody may be paid for work. So your lessons earn NovaCoins instead of money. ' +
          'On your ' + st.workAge + 'th birthday your parent can set a price.');
      }
      if (st.consent && st.cert && st.age >= st.workAge && !st.ageVerified) {
        bits.push('<b>One more step before money</b>A parent saying you are ' + st.age + ' is enough to ' +
          'teach for coins. To be paid actual money your age has to be checked properly &mdash; a quick ' +
          'face scan with the service that does it, which takes seconds. <u>NovaClip never sees the ' +
          'picture</u>: the scan happens at the checking service and all that comes back here is a yes ' +
          'or a no. <button class="agego" style="margin-top:8px">Check my age</button>');
      }
      if (st.mayCharge) {
        bits.push('<b>You can set a price</b>Up to &euro;' + st.maxPrice + ' a lesson, and NovaClip keeps ' +
          Math.round((st.fee || 0.2) * 100) + '% of it &mdash; you keep the rest. It is paid to your ' +
          'parent&rsquo;s account, not yours. Payouts are not connected yet, so money prices will not go ' +
          'through until they are &mdash; coins work today.');
      }
      g.innerHTML = '<div class="gate">' + bits.join('</div><div class="gate">') + '</div>';
      $('makecard').hidden = !st.mayPublish;
      $('minecard').hidden = !st.mayPublish;
      $('pricefield').style.display = st.mayCharge ? '' : 'none';
      var go = g.querySelector('.agego');
      if (go) go.onclick = startAgeCheck;
      if (st.mayPublish) mine();
    }).catch(function (e) {
      g.innerHTML = '<div class="gate"><b>Could not check</b>' + esc(e.message) + '</div>';
    });
  }

  function publish() {
    var out = $('t-out');
    out.textContent = 'Putting it up…';
    api('/academy/publish', {
      title: $('t-title').value, blurb: $('t-blurb').value, content: $('t-body').value,
      cat: $('t-cat').value, level: $('t-level').value,
      price: parseFloat($('t-price').value) || 0, coins: parseInt($('t-coins').value, 10) || 0
    }).then(function (r) {
      out.innerHTML = '<p class="muted">Up on the shelf.' + (r.note ? ' ' + esc(r.note) + '.' : '') + '</p>';
      $('t-title').value = ''; $('t-blurb').value = ''; $('t-body').value = '';
      mine(); shelf();
    }).catch(function (e) { out.innerHTML = '<p class="muted">' + esc(e.message) + '</p>'; });
  }

  function mine() {
    api('/academy/mine', {}).then(function (r) {
      $('mine').innerHTML = r.listings.length ? r.listings.map(function (l) {
        return '<div class="mine"><span class="grow">' + esc(l.title) + '</span>' +
          (l.hidden ? '<span class="pill">taken down</span>'
                    : '<button data-off="' + esc(l.id) + '">Take it down</button>') +
          '<span class="pill">' + (l.price > 0 ? '&euro;' + l.price.toFixed(2) : l.coins + ' coins') +
          '</span></div>';
      }).join('') : '<p class="muted">Nothing up yet.</p>';
      [].forEach.call($('mine').querySelectorAll('button[data-off]'), function (b) {
        b.onclick = function () {
          api('/academy/unpublish', { id: b.getAttribute('data-off') }).then(function () { mine(); shelf(); });
        };
      });
      $('earn').innerHTML =
        '<div><b>' + r.earned.sales + '</b>lessons taken</div>' +
        '<div><b>' + r.earned.coins + '</b>coins kept</div>' +
        '<div><b>' + (r.earned.fee || 0) + '</b>coins to NovaClip (' +
          Math.round((r.fee || 0.2) * 100) + '%)</div>' +
        '<div><b>&euro;' + (r.earned.money || 0).toFixed(2) + '</b>to your parent&rsquo;s account</div>';
    }).catch(function () {});
  }

  /* THE FACE SCAN THAT THIS SITE NEVER SEES.
     The check runs at a certified age assurance service. We send nobody there
     but the account reference; they do the scan, they estimate the age, and
     they send back a signed yes or no. A photograph of a child's face is
     biometric data under GDPR Article 9, and the safest place for one is
     nowhere near us — so there is no camera code in this file at all, which is
     the point rather than an omission. */
  function startAgeCheck() {
    api('/age/start', {}).then(function (r) {
      location.href = r.url;
    }).catch(function (e) {
      var g = $('gate');
      g.insertAdjacentHTML('beforeend', '<div class="gate"><b>Age checking is not connected yet</b>' +
        esc(e.message) + '. Until it is, lessons here earn NovaCoins rather than money &mdash; which ' +
        'needs nobody\'s age and nobody\'s face.</div>');
    });
  }

  /* ---------------------------------------------------------------- the coins */
  function coins() {
    var box = $('coinshop');
    if (!box) return;
    window.ncApi('/coins/packs').then(function (r) {
      var packs = r.packs.map(function (p) {
        return '<div class="lesson"><h3>' + p.coins + ' NovaCoins</h3>' +
          '<p class="blurb">Spend them on lessons in the Academy.</p>' +
          '<div class="foot"><span class="price">&euro;' + p.eur.toFixed(2) + '</span>' +
          '<button data-pack="' + p.id + '">Buy</button></div></div>';
      }).join('');
      box.innerHTML = '<div class="shelf">' + packs + '</div>' +
        '<p class="muted">A parent pays for these, and it is their card that is asked for. ' +
        'Coins are spent inside NovaClip and cannot be turned back into money.</p>';
      [].forEach.call(box.querySelectorAll('button[data-pack]'), function (b) {
        b.onclick = function () {
          api('/coins/checkout', { pack: b.getAttribute('data-pack') }).then(function (r) {
            location.href = r.url;
          }).catch(function (e) {
            box.insertAdjacentHTML('beforeend', '<p class="muted">' + esc(e.message) + '.</p>');
          });
        };
      });
    }).catch(function () {});
    if (signedIn()) {
      api('/coins/balance', {}).then(function (w) {
        var el = $('balance');
        if (el) el.textContent = w.bal + ' NovaCoins';
      }).catch(function () {});
    }
  }

  /* ------------------------------------------------------------------- wiring */
  function boot() {
    $('tab-learn').onclick = function () {
      $('tab-learn').classList.add('on'); $('tab-teach').classList.remove('on');
      $('pane-learn').hidden = false; $('pane-teach').hidden = true;
      if ($('pane-coins')) $('pane-coins').hidden = true;
      if ($('tab-coins')) $('tab-coins').classList.remove('on');
    };
    $('tab-teach').onclick = function () {
      $('tab-teach').classList.add('on'); $('tab-learn').classList.remove('on');
      $('pane-teach').hidden = false; $('pane-learn').hidden = true;
      if ($('pane-coins')) $('pane-coins').hidden = true;
      if ($('tab-coins')) $('tab-coins').classList.remove('on');
      gate();
    };
    $('cat').onchange = shelf;
    if ($('tab-coins')) $('tab-coins').onclick = function () {
      $('tab-coins').classList.add('on');
      $('tab-learn').classList.remove('on'); $('tab-teach').classList.remove('on');
      $('pane-coins').hidden = false; $('pane-learn').hidden = true; $('pane-teach').hidden = true;
      coins();
    };
    $('publish').onclick = publish;
    $('r-close').onclick = function () { $('readcard').hidden = true; };
    shelf();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
