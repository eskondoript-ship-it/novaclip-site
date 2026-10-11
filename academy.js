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

  /* Stars drawn rather than typed. The text star renders as an emoji on some
     phones and a glyph on others, at two different sizes, and a rating that
     changes size between devices looks like a bug. */
  function stars(score, n) {
    var full = Math.round(score);
    var row = '';
    for (var i = 1; i <= 5; i++) {
      row += '<span class="st' + (i <= full ? ' on' : '') + '">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">' +
        '<polygon points="12,2.6 14.9,9.1 22,9.8 16.7,14.5 18.2,21.4 12,17.8 5.8,21.4 7.3,14.5 2,9.8 9.1,9.1" ' +
        'fill="currentColor"/></svg></span>';
    }
    return '<span class="stars" title="' + (n ? score + ' out of 5, from ' + n + '' +
      (n === 1 ? ' person' : ' people') : 'not rated yet') + '">' + row +
      '<i>' + (n ? score.toFixed(1) + ' · ' + n : 'new') + '</i></span>';
  }

  var LEVEL_NAMES = ['New teacher', 'Rated teacher', 'Trusted teacher', 'Master teacher'];

  /* WHETHER THIS READER STILL HAS THEIR FREE LESSON. Read once on the way in,
     because the shelf has to say "free" or "free, but not for you any more"
     and the difference is the whole offer. The shelf itself is public and
     carries no account with it, so this is the only place the answer can come
     from. */
  var FREE = { used: false, left: true, on: null };
  /* AND WHETHER THE SERVER EVEN HAS THE RULE YET. A worker that has not been
     redeployed answers 404 to /academy/free, and a shelf full of "free" badges
     that cannot be claimed is worse than no badges: the offer is the thing
     being promised. So a 404 here takes the badges down and says why on the
     Teach tab, which is the same thing gate() already does. */
  var FREE_ON = true;

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
            (r.firstFree && FREE_ON
              ? (FREE.used
                  ? '<span class="pill">First lesson &mdash; free, and yours is spent</span>'
                  : '<span class="freepill">First lesson &mdash; free</span>')
              : '') +
            '<h3>' + esc(r.title) + '</h3>' +
            '<div class="who">' + esc(r.by) +
              (r.teacherLevelName ? ' &middot; <b class="lvl lvl' + (r.teacherLevel || 0) + '">' +
                esc(r.teacherLevelName) + '</b>' : '') +
              (r.teacherSales ? ' &middot; ' + r.teacherSales + ' sold' : '') + '</div>' +
            (r.teacherTagline ? '<div class="tagline">' + esc(r.teacherTagline) + '</div>' : '') +
            stars(r.stars || 0, r.ratings || 0) +
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
      $('r-who').innerHTML = esc(row.by) +
        (row.teacher ? ' &middot; <b class="lvl lvl' + row.teacher.level + '">' +
          esc(row.teacher.levelName || row.teacher.name) + '</b>' +
          (row.teacher.sales ? ' &middot; ' + row.teacher.sales + ' lessons sold' : '') : '') +
        ' &middot; ' + stars(row.stars || 0, row.ratings || 0);
      /* WHO WROTE IT, which is most of what somebody decides on. The
         certificate serial is here and the name on the certificate is not:
         anybody can check the credential on the verify page without being
         told a child's real name. */
      var t = row.teacher || {};
      $('r-teacher').innerHTML =
        (t.tagline ? '<div class="tagline">' + esc(t.tagline) + '</div>' : '') +
        (t.bio ? '<p class="bio">' + esc(t.bio) + '</p>' : '') +
        (row.serial ? '<p class="hint">' + esc(TIERS[row.tier] || row.tier) +
          ' certificate &middot; <a href="verify.html?c=' + encodeURIComponent(row.serial) +
          '" style="color:inherit">' + esc(row.serial) + '</a></p>' : '');
      $('r-body').textContent = row.content;
      var out = $('r-out');
      out.innerHTML = '';
      if (row.open) {
        out.innerHTML = '<p class="muted">' + (row.owner ? 'This is yours.' : 'Yours to keep.') + '</p>';
        /* Rating belongs to the person who has the lesson, and belongs here,
           where they have just read it. */
        if (!row.owner && row.bought) {
          if (row.myStars) {
            out.insertAdjacentHTML('beforeend',
              '<p class="muted">You gave it ' + stars(row.myStars, 1) + '</p>');
          } else {
            out.insertAdjacentHTML('beforeend',
              '<div class="rateme"><span>Was it any good?</span>' +
              [1, 2, 3, 4, 5].map(function (n) {
                return '<button class="starbtn" data-stars="' + n + '" aria-label="' + n +
                  ' out of 5">' + n + '</button>';
              }).join('') + '</div>');
            [].forEach.call(out.querySelectorAll('.starbtn'), function (b) {
              b.onclick = function () {
                api('/academy/rate', { id: id, stars: +b.getAttribute('data-stars') })
                  .then(function () { read(id); shelf(); })
                  .catch(function (e) {
                    out.insertAdjacentHTML('beforeend', '<p class="muted">' + esc(e.message) + '</p>');
                  });
              };
            });
          }
        }
      } else if (!signedIn()) {
        out.innerHTML = '<p class="muted">Open the Teach tab once — it sets your account up — then ' +
          'this lesson can be yours.</p>';
      } else if (row.firstFree && row.freeLeft && FREE_ON) {
        /* THE FREE FIRST LESSON, AND WHAT IT COSTS TO TAKE IT. It costs the
           chance to take anybody else's, so that is said on the button's own
           line rather than discovered afterwards. */
        out.insertAdjacentHTML('beforeend',
          '<p class="muted">This is <b>' + esc(row.by) + '&rsquo;s first lesson</b>, so it is free. ' +
          'You get one free first lesson and it locks to one creator &mdash; take this one and ' +
          '' + esc(row.by) + ' is who you spent it on.' +
          (row.price > 0 ? ' It is priced at &euro;' + row.price.toFixed(2) + ' for everybody who ' +
            'has used theirs.' : '') + '</p>');
        var fb = document.createElement('button');
        fb.className = 'go';
        fb.textContent = 'Take it free';
        fb.onclick = function () { claimFree(id, fb); };
        out.appendChild(fb);
        if (row.price > 0 || row.coins > 0) {
          out.insertAdjacentHTML('beforeend',
            '<p class="hint" style="margin-top:8px">Or pay for it and keep your free one for ' +
            'somebody else.</p>');
          out.appendChild(payButton(row, id));
        }
      } else {
        if (row.claimedOn && row.claimedOn.by) {
          out.insertAdjacentHTML('beforeend',
            '<p class="muted">Your free first lesson went to <b>' + esc(row.claimedOn.by) + '</b>' +
            (row.claimedOn.title ? ' — ' + esc(row.claimedOn.title) : '') + '.</p>');
        }
        out.appendChild(payButton(row, id));
      }
      $('readcard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) {
      $('readcard').hidden = false;
      $('r-body').textContent = 'Could not open that lesson: ' + e.message;
    });
  }

  /* The button that costs something, and the sentence that goes above it. */
  function payButton(row, id) {
    var out = $('r-out');
    var b = document.createElement('button');
    b.className = 'go';
    if (row.price > 0 && row.split) {
      /* THE SPLIT, SHOWN BEFORE ANYBODY COMMITS. Coins cover 40% of a
         priced lesson and no more, so the number on the button is the
         money that will actually be asked for — not the sticker price
         with a surprise underneath it. */
      var sp = row.split;
      out.insertAdjacentHTML('beforeend',
        '<p class="muted">€' + row.price.toFixed(2) + ' &middot; your ' + sp.useCoins +
        ' NovaCoins take off €' + (sp.useCoins / (row.coinsPerEur || 100)).toFixed(2) +
        (sp.shortCoins > 0
          ? ' &mdash; ' + sp.shortCoins + ' more coins would take off the full ' +
            Math.round((row.coinShare || 0.4) * 100) + '%'
          : ' &mdash; that is the full ' + Math.round((row.coinShare || 0.4) * 100) + '%') +
        '</p>');
      b.textContent = 'Go to checkout — €' + sp.money.toFixed(2) +
        (sp.useCoins ? ' + ' + sp.useCoins + ' coins' : '');
    } else {
      b.textContent = 'Get it for ' + row.coins + ' coins';
    }
    b.onclick = function () { buy(row, id, b); };
    return b;
  }

  /* WHERE A PURCHASE GOES, AND WHY THE TWO KINDS GO TO DIFFERENT PLACES.
     A lesson priced in money needs a card and a parent's approval, and both of
     those already exist on the pricing page: the cart, the Family Dashboard
     PIN gate in front of it, and Stripe's own page after it. So a priced
     lesson is put in that cart and the checkout is opened on it.

     A lesson priced in coins needs neither. The coins are already on the
     account, the server spends them, and sending somebody to a card page to
     spend money they are not spending would be a dead end with a Pay button
     on it. That one completes here, as it always did. */
  function buy(row, id, btn) {
    if (row.price > 0) return toCheckout(row, id, btn);
    btn.disabled = true;
    btn.textContent = 'One moment…';
    api('/academy/buy', { id: id }).then(function () {
      read(id);
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = 'Try again';
      $('r-out').insertAdjacentHTML('beforeend', why(e));
    });
  }

  /* Both halves of a refusal, which is what the worker sends and what
     ncApi now carries: the line, and the sentence that says what to do. */
  function why(e) {
    return '<p class="muted" style="margin-top:10px">' + esc(e.message) +
      (e.detail ? ' &mdash; ' + esc(e.detail) : '') + '.</p>';
  }

  /* The cart is the same localStorage key the pricing page has always used, so
     a lesson sits in it next to a plan and goes through the same parent gate.
     nc_cart is a shopping list and not an entitlement — nothing in it is worth
     anything until the server says a sale happened — so writing to it from
     here gives away nothing. */
  var CART_KEY = 'nc_cart';
  function toCheckout(row, id, btn) {
    var sp = row.split || { money: row.price, useCoins: 0 };
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { cart = []; }
    cart = cart.filter(function (it) { return !(it.lesson && it.lesson.id === id); });
    cart.push({
      name: row.title, cycle: 'once', unit: sp.money, qty: 1, sub: false, kind: 'lesson',
      lesson: { id: id, by: row.by, title: row.title, price: row.price,
                useCoins: sp.useCoins || 0, coinsPerEur: row.coinsPerEur || 100 }
    });
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {
      if (btn) {
        btn.textContent = 'Could not open the checkout';
        $('r-out').insertAdjacentHTML('beforeend', '<p class="muted">This browser will not let the ' +
          'page remember a basket, which is what the checkout reads. Private browsing usually does ' +
          'that.</p>');
      }
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Opening the checkout…'; }
    location.href = 'pricing.html#lesson';
  }

  /* The free first lesson. The refusals come back from the server with the
     reason in them — above all "you already spent it, and here is where" —
     because that is the one thing somebody will want to know. */
  function claimFree(id, btn) {
    btn.disabled = true;
    btn.textContent = 'One moment…';
    api('/academy/free', { id: id }).then(function () {
      /* Spent, so every other card on the shelf has to stop saying "free"
         before the reader scrolls back to one. */
      FREE = { used: true, left: false, on: { id: id } };
      read(id); shelf();
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = 'Try again';
      $('r-out').insertAdjacentHTML('beforeend', why(e));
    });
  }

  /* ------------------------------------------------------------- the teaching */
  /* "SIGN IN FIRST" WAS THE WRONG THING TO SAY, and it sent people to a page
     that could not help them. Nobody signs in to this site: ncSyncBoot()
     creates an account in the background on the first visit and quietly gives
     up if the worker cannot be reached — "staying local", in its own words.
     So somebody can be signed in by every visible sign, with a name and a
     coin balance in the rail, and still have no account key, through no act
     of theirs. Telling them to go and sign in is sending them to look for a
     door that was never there.

     The Academy makes the account itself instead. One call, no form, and if
     it fails the reason it gives is the real one. */
  function makeAccount() {
    var g = $('gate');
    if (!window.ncSyncOn || !window.ncSyncOn()) {
      g.innerHTML = '<div class="gate"><b>No community server</b>The Academy needs the NovaClip server, ' +
        'and this copy of the site has not been pointed at one.</div>';
      return;
    }
    g.innerHTML = '<p class="muted">Setting your account up…</p>';
    window.ncCreateAccount().then(function () { gate(); }).catch(function (e) {
      /* "slow down" is the server's rate limiter, not a server that is down,
         and telling somebody their connection failed when it did not is how a
         five-second wait turns into a bug report. */
      var busy = /slow down|429/i.test(e.message || '');
      g.innerHTML = '<div class="gate"><b>' +
        (busy ? 'The server asked us to wait a moment' : 'Could not reach the NovaClip server') +
        '</b>' + (busy ? 'Give it a few seconds and press the button' : esc(e.message)) +
        '. Your work is safe on this device — the Academy is the part that needs the server, because a ' +
        'lesson has to live somewhere other people can see it. <button class="retry" ' +
        'style="margin-top:8px">Try again</button></div>';
      var r = g.querySelector('.retry');
      if (r) r.onclick = makeAccount;
    });
  }

  function gate() {
    var g = $('gate');
    if (!signedIn()) {
      $('makecard').hidden = true;
      $('minecard').hidden = true;
      $('profcard').hidden = true;
      makeAccount();
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
      if (st.stats && st.mayPublish) {
        var sx = st.stats;
        bits.push('<b>' + esc(sx.levelName) + '</b>' +
          (sx.ratings
            ? sx.stars + ' stars from ' + sx.ratings + (sx.ratings === 1 ? ' person' : ' people') +
              ', ' + sx.sales + ' lessons sold. '
            : 'No ratings yet &mdash; your first buyers decide this. ') +
          'You can ask up to <b>&euro;' + sx.maxPrice + '</b> a lesson.' +
          (sx.next
            ? ' <br>Next: <b>' + esc(sx.next.name) + '</b> at ' + sx.next.sales + ' sales and ' +
              sx.next.stars + ' stars, which lets you ask &euro;' + sx.next.maxPrice + '.' +
              (sx.next.salesToGo ? ' ' + sx.next.salesToGo + ' sales to go.' : '')
            : ' That is the top level.'));
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
      $('profcard').hidden = !st.mayPublish;
      $('pricefield').style.display = st.mayCharge ? '' : 'none';
      var pf = $('t-price');
      if (pf && st.maxPrice) {
        pf.max = st.maxPrice;
        var lab = $('pricefield').querySelector('label');
        if (lab) lab.textContent = 'Price — up to €' + st.maxPrice + ' at your level';
      }
      var go = g.querySelector('.agego');
      if (go) go.onclick = startAgeCheck;
      if (st.mayPublish) { mine(); profile(); }
    }).catch(function (e) {
      /* A worker that answers but has never heard of /academy is a worker that
         has not been redeployed, which is a different problem from a worker
         that is down — and the one somebody can actually fix. */
      var old = /404|not found/i.test(e.message || '');
      g.innerHTML = '<div class="gate"><b>' +
        (old ? 'The server does not have the Academy yet' : 'Could not check') + '</b>' +
        esc(e.message) + (old ? '. leaderboard-worker.js needs deploying — pushing it to GitHub does '
          + 'not deploy it.' : '') + '</div>';
    });
  }

  function publish() {
    var out = $('t-out');
    out.textContent = 'Putting it up…';
    api('/academy/publish', {
      title: $('t-title').value, blurb: $('t-blurb').value, desc: $('t-desc').value,
      content: $('t-body').value,
      cat: $('t-cat').value, level: $('t-level').value,
      price: parseFloat($('t-price').value) || 0, coins: parseInt($('t-coins').value, 10) || 0
    }).then(function (r) {
      out.innerHTML = '<p class="muted">Up on the shelf.' + (r.note ? ' ' + esc(r.note) + '.' : '') + '</p>';
      $('t-title').value = ''; $('t-blurb').value = ''; $('t-desc').value = ''; $('t-body').value = '';
      mine(); shelf();
    }).catch(function (e) { out.innerHTML = why(e); });
  }

  function mine() {
    api('/academy/mine', {}).then(function (r) {
      $('mine').innerHTML = r.listings.length ? r.listings.map(function (l) {
        return '<div class="mine"><span class="grow">' + esc(l.title) +
          (l.firstFree && !l.hidden ? ' <span class="freepill">free first lesson</span>' : '') +
          '</span>' +
          (l.hidden ? '<span class="pill">taken down</span>'
                    : '<button data-off="' + esc(l.id) + '">Take it down</button>') +
          '<span class="pill">' + (l.price > 0 ? '&euro;' + l.price.toFixed(2) : l.coins + ' coins') +
          '</span></div>';
      }).join('') : '<p class="muted">Nothing up yet.</p>';
      /* WHICH ONE IS THE WINDOW, said in words as well as on a badge. It is
         decided by what was published first rather than chosen, and somebody
         who does not know that will wonder why one of their lessons is being
         given away. */
      if (r.listings.filter(function (l) { return !l.hidden; }).length) {
        $('mine').insertAdjacentHTML('beforeend',
          '<p class="hint">Your first lesson that is still up is free for anybody who has not used ' +
          'their one free lesson yet. Take it down and the next one becomes the free one.</p>');
      }
      [].forEach.call($('mine').querySelectorAll('button[data-off]'), function (b) {
        b.onclick = function () {
          api('/academy/unpublish', { id: b.getAttribute('data-off') }).then(function () { mine(); shelf(); });
        };
      });
      $('earn').innerHTML =
        '<div><b>' + r.earned.sales + '</b>lessons sold</div>' +
        '<div><b>' + (r.earned.free || 0) + '</b>given free</div>' +
        '<div><b>' + r.earned.coins + '</b>coins kept</div>' +
        '<div><b>' + (r.earned.fee || 0) + '</b>coins to NovaClip (' +
          Math.round((r.fee || 0.2) * 100) + '%)</div>' +
        '<div><b>&euro;' + (r.earned.money || 0).toFixed(2) + '</b>to your parent&rsquo;s account</div>';
    }).catch(function () {});
  }

  /* ------------------------------------------------------------ the profile */
  /* THE NAME THAT WAS NEVER MEANT TO BE PUBLISHED. Every lesson on the shelf
     carried the name off the certificate, and a certificate carries a real
     name because that is what makes it a credential. So the shelf has been
     publishing children's real names. A teaching name replaces it everywhere a
     stranger can see, the certificate number stays on the lesson so anybody
     can still check it on the verify page, and the real name comes back to
     this page only — the account it belongs to. */
  function profile() {
    api('/academy/profile', {}).then(function (r) {
      var p = r.profile || {};
      if (!$('p-name').value) $('p-name').value = p.name || '';
      if (!$('p-tag').value) $('p-tag').value = p.tagline || '';
      if (!$('p-bio').value) $('p-bio').value = p.bio || '';
      /* Deliberately NOT clearing #p-out here. This function is called again
         right after a save, and clearing it wiped the word "Saved" off the
         screen a quarter of a second after it appeared — which is exactly how
         somebody concludes the button does nothing. */
      $('p-certname').innerHTML = r.certName
        ? (p.name
            ? 'Your lessons show <b>' + esc(p.name) + '</b>. The name on your certificate, ' +
              esc(r.certName) + ', is not shown to anybody.'
            : 'Your lessons currently show <b>' + esc(r.certName) + '</b> &mdash; the name on your ' +
              'certificate, which is your real one. Put a teaching name here and it is used instead.')
        : '';
    }).catch(function (e) {
      if (/404|not found/i.test(e.message || '')) {
        $('p-out').innerHTML = '<p class="muted">The server does not have profiles yet &mdash; ' +
          'leaderboard-worker.js needs deploying again. Pushing it to GitHub does not deploy it.</p>';
      }
    });
  }

  function saveProfile() {
    var out = $('p-out');
    out.textContent = 'Saving…';
    api('/academy/profile/save', {
      name: $('p-name').value, tagline: $('p-tag').value, bio: $('p-bio').value
    }).then(function () {
      out.innerHTML = '<p class="saved">Saved. Every lesson of yours shows it, including the ones ' +
        'already up.</p>';
      profile(); shelf();
    }).catch(function (e) { out.innerHTML = why(e); });
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
    /* The free-lesson state before the first shelf, so no card has to be
       redrawn and nobody is told something is free when it is not. */
    function start() { shelf(); }
    if (signedIn()) {
      api('/academy/free', {}).then(function (f) { FREE = f || FREE; })
        .catch(function (e) { if (/404|not found/i.test(e.message || '')) FREE_ON = false; })
        .then(start);
    } else { start(); }
    if ($('tab-coins')) $('tab-coins').onclick = function () {
      $('tab-coins').classList.add('on');
      $('tab-learn').classList.remove('on'); $('tab-teach').classList.remove('on');
      $('pane-coins').hidden = false; $('pane-learn').hidden = true; $('pane-teach').hidden = true;
      coins();
    };
    $('publish').onclick = publish;
    $('p-save').onclick = saveProfile;
    $('r-close').onclick = function () { $('readcard').hidden = true; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
