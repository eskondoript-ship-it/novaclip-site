/* ============================================================================
   THE IDENTITY GATE — prove it is you, or the site does not open
   ============================================================================
   If somebody has enrolled a way of proving who they are, this asks for it
   before the site becomes usable, and does not take no for an answer.

   If they have NOT enrolled anything, this does nothing at all. Not a prompt,
   not a nag, not a "set one up?" — the page just opens. Somebody who has never
   asked for a lock should never meet one.

   WHAT COUNTS AS PROOF, IN THE ORDER IT IS OFFERED

     Passkey        the device's own fingerprint / face / PIN, through WebAuthn
     Face           the 128-number descriptor, compared in the page
     Click rhythm   dwell and gap timings, compared approximately
     Voice          the 24-number voiceprint

   Any ONE of them opens it. They are alternatives rather than steps: somebody
   with a cut finger still has their face, and a gate that can be locked out of
   by a plaster is a gate that gets turned off.

   HOW LONG IT LASTS

   One browser session. sessionStorage, not localStorage — so moving between
   pages in the same tab does not ask again, and closing the browser does. A
   flag that survives a reboot is a lock that is open all week.

   ============================================================================
   WHAT THIS IS NOT, SAID PLAINLY
   ============================================================================
   It is not security. It is JavaScript in a page, and a page cannot stop
   somebody who opens the developer console, sets one sessionStorage key, and
   reloads. Anybody who can do that was never going to be stopped by this.

   What it DOES stop is the case it was asked for: somebody picking up an
   unlocked laptop and opening the site. That is the realistic threat in a
   house, and it is worth stopping.

   The things on this site that are genuinely protected are protected by
   cryptography rather than by this gate — the Locker's contents are AES-GCM
   under a key derived from the passkey, and no amount of clicking past a lock
   screen decrypts them. That separation is deliberate: the gate is a
   convenience, the Locker is the real thing.

   THE WAY OUT

   A lock with no way out is a way to lose a site. If every enrolled method
   fails — the camera broke, the passkey was deleted from the device's own
   store, the fingerprint no longer reads — three failed attempts reveal a
   button that removes the lock along with everything it was protecting. That
   is honest: you can always get back in, and it costs you the templates and
   the Locker, because the Locker's key came from a passkey that is going away.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_GUARD) return;

  var PASS = 'nc_gate_ok';        // sessionStorage: proved, for this session
  var EXEMPT = /(^|\/)(privacy|report|offline)\.html$/i;

  /* Straight out of storage, NOT through NC_PASSKEY / NC_RHYTHM.
     Those modules are script tags on biometrics.html and nowhere else, so
     asking them would have meant the gate correctly locking that one page and
     silently letting every other page through — the exact opposite of a lock.
     The keys are read here and the modules are fetched only when somebody
     actually picks a method to prove themselves with. */
  function ls(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (e) { return fallback; }
  }

  function enrolled() {
    var out = [];
    var keys = ls('nc_passkeys', []);
    if (Array.isArray(keys) && keys.length) out.push('passkey');

    var profs = ls('nc_bio_profiles', []);
    if (Array.isArray(profs)) {
      if (profs.some(function (p) { return p && p.face; })) out.push('face');
      if (profs.some(function (p) { return p && p.voice; })) out.push('voice');
    }

    if (ls('nc_click_rhythm', null)) out.push('rhythm');
    return out;
  }

  /* Fetches a module the gate needs, once, and resolves when it has defined
     the global it is responsible for. The paths are relative because the site
     is flat and is served from a subdirectory in some previews. */
  var loading = {};
  function need(src, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    if (loading[src]) return loading[src];
    loading[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () {
        if (window[globalName]) resolve(window[globalName]);
        else reject(new Error(src + ' loaded but did not define ' + globalName));
      };
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
    return loading[src];
  }

  function passed() {
    try { return sessionStorage.getItem(PASS) === '1'; } catch (e) { return false; }
  }
  function markPassed(how) {
    try { sessionStorage.setItem(PASS, '1'); } catch (e) {}
    try {
      if (window.NC_PASSKEY && window.NC_PASSKEY.log) {
        window.NC_PASSKEY.log('Site unlocked', true, how || '');
      }
    } catch (e) {}
  }
  function forget() {
    try { sessionStorage.removeItem(PASS); } catch (e) {}
  }

  /* ---- the lock screen --------------------------------------------------
     Built in code rather than in every page's markup, because it has to be
     able to appear on all twenty-nine of them. It is deliberately opaque:
     a blurred overlay you can read through would let somebody see the thing
     they have not proved they are allowed to see. */
  var CSS =
    '#ncgate{position:fixed;inset:0;z-index:99999;background:#020617;color:#e2e8f0;' +
      'display:flex;align-items:center;justify-content:center;padding:24px;' +
      "font:16px/1.5 'Plus Jakarta Sans',system-ui,'Segoe UI',sans-serif;overflow:auto}" +
    '#ncgate .gb{width:100%;max-width:420px;text-align:center}' +
    '#ncgate .gr{width:96px;height:96px;margin:0 auto 20px;border-radius:50%;position:relative;' +
      'display:grid;place-items:center;background:rgba(16,185,129,.08);' +
      'border:1px solid rgba(16,185,129,.28);color:#34d399}' +
    '#ncgate .gr svg{width:42px;height:42px;fill:none;stroke:currentColor;stroke-width:1.7;' +
      'stroke-linecap:round;stroke-linejoin:round}' +
    '#ncgate .gr::after{content:"";position:absolute;left:0;right:0;height:2px;border-radius:2px;' +
      'background:linear-gradient(90deg,transparent,#34d399,transparent);' +
      'box-shadow:0 0 12px #10b981;animation:ncgbeam 2s ease-in-out infinite alternate}' +
    '@keyframes ncgbeam{0%{top:4%;opacity:.7}50%{opacity:1}100%{top:92%;opacity:.7}}' +
    '#ncgate h2{font-size:1.35rem;font-weight:800;letter-spacing:-.02em;color:#fff;margin:0 0 8px}' +
    '#ncgate p{font-size:.92rem;color:#94a3b8;margin:0 0 20px;line-height:1.6}' +
    '#ncgate .gm{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}' +
    '#ncgate button{min-height:48px;padding:0 18px;border-radius:12px;cursor:pointer;' +
      "font:700 .95rem/1 'Plus Jakarta Sans',system-ui,sans-serif;display:flex;align-items:center;" +
      'justify-content:center;gap:10px;border:1px solid #334155;background:rgba(15,23,42,.7);color:#e2e8f0}' +
    '#ncgate button:hover:not(:disabled){border-color:#10b981;color:#34d399}' +
    '#ncgate button:disabled{opacity:.5;cursor:default}' +
    '#ncgate button.pri{background:#10b981;color:#021;border-color:transparent;' +
      'box-shadow:0 0 18px rgba(16,185,129,.3)}' +
    '#ncgate button.pri:hover:not(:disabled){background:#34d399;color:#021}' +
    '#ncgate button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;' +
      'stroke-linecap:round;stroke-linejoin:round}' +
    '#ncgate .gmsg{min-height:1.4em;font-size:.88rem;color:#94a3b8;margin:0 0 8px;line-height:1.5}' +
    '#ncgate .gmsg.bad{color:#fb7185}' +
    '#ncgate .gmsg.good{color:#34d399}' +
    '#ncgate .gpad{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}' +
    '#ncgate .gpad button{min-height:92px;font-family:ui-monospace,Consolas,monospace;' +
      'letter-spacing:.16em;font-size:.78rem}' +
    '#ncgate .gpad button.down{background:#10b981;color:#021;border-color:transparent}' +
    '#ncgate .gdots{display:flex;gap:6px;justify-content:center;margin-bottom:12px;min-height:11px}' +
    '#ncgate .gdots i{width:10px;height:10px;border-radius:50%;border:1px solid #334155}' +
    '#ncgate .gdots i.on{background:#34d399;border-color:transparent}' +
    '#ncgate .gout{margin-top:18px;padding-top:16px;border-top:1px solid #1e293b}' +
    '#ncgate .gout button{width:100%;background:transparent;border-color:#7f1d1d;color:#fb7185;font-weight:600}' +
    '#ncgate .gtiny{font-size:.76rem;color:#64748b;margin-top:14px;line-height:1.55}' +
    '#ncgate .gback{background:none!important;border:0!important;color:#64748b!important;' +
      'font-weight:600!important;min-height:38px!important}';

  var IC = {
    key:    "<svg viewBox='0 0 24 24'><circle cx='7.5' cy='15.5' r='5.5'/><path d='M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3'/></svg>",
    face:   "<svg viewBox='0 0 24 24'><path d='M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3'/><circle cx='12' cy='11' r='3'/></svg>",
    pulse:  "<svg viewBox='0 0 24 24'><path d='M22 12h-4l-3 9L9 3l-3 9H2'/></svg>",
    mic:    "<svg viewBox='0 0 24 24'><path d='M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z'/><path d='M19 10v2a7 7 0 01-14 0v-2M12 19v3'/></svg>",
    shield: "<svg viewBox='0 0 24 24'><path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z'/><path d='M9 12l2 2 4-4'/></svg>"
  };

  var LABEL = {
    passkey: ['Use your fingerprint or face', IC.key],
    face:    ['Look at the camera', IC.face],
    rhythm:  ['Do your click pattern', IC.pulse],
    voice:   ['Say your passphrase', IC.mic]
  };

  var el = null, fails = 0, methods = [];

  function show() {
    if (document.getElementById('ncgate')) return;

    var st = document.createElement('style');
    st.id = 'ncgate-css';
    st.textContent = CSS;
    document.head.appendChild(st);

    el = document.createElement('div');
    el.id = 'ncgate';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Confirm your identity');
    document.body.appendChild(el);

    /* The page underneath must not scroll, and must not be reachable by Tab.
       inert would be the right tool; it is not everywhere yet, so the overlay
       simply traps focus back to itself. */
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('focusin', trap, true);
    document.addEventListener('keydown', swallow, true);

    menu();
  }

  function trap(e) {
    if (!el) return;
    if (!el.contains(e.target)) {
      e.stopPropagation();
      var b = el.querySelector('button');
      if (b) b.focus();
    }
  }
  /* Escape must not close it, and neither must anything else. */
  function swallow(e) {
    if (!el) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); }
  }

  function done(how) {
    markPassed(how);
    document.removeEventListener('focusin', trap, true);
    document.removeEventListener('keydown', swallow, true);
    document.documentElement.style.overflow = '';
    if (el) el.remove();
    var css = document.getElementById('ncgate-css');
    if (css) css.remove();
    el = null;
    try { dispatchEvent(new CustomEvent('nc-gate-open')); } catch (e) {}
  }

  function say(t, kind) {
    var m = el && el.querySelector('.gmsg');
    if (m) { m.textContent = t || ''; m.className = 'gmsg' + (kind ? ' ' + kind : ''); }
  }

  function menu() {
    var name = '';
    try { name = localStorage.getItem('nc_name') || ''; } catch (e) {}
    el.innerHTML =
      "<div class='gb'>" +
        "<div class='gr'>" + IC.shield + '</div>' +
        '<h2>' + (name ? 'Welcome back, ' + escape2(name) : 'Confirm it is you') + '</h2>' +
        '<p>This browser has a lock on it. Prove who you are with any one of these and the site ' +
        'opens. Nothing you do here is sent anywhere.</p>' +
        "<p class='gmsg'></p>" +
        "<div class='gm'>" +
          methods.map(function (m, i) {
            var L = LABEL[m];
            return "<button type='button' data-m='" + m + "'" + (i === 0 ? " class='pri'" : '') + '>' +
                   L[1] + '<span>' + L[0] + '</span></button>';
          }).join('') +
        '</div>' +
        (fails >= 3
          ? "<div class='gout'><button type='button' id='ncgOut'>I cannot get in — remove the lock</button>" +
            "<p class='gtiny'>This deletes every template on this browser and the Locker with them. " +
            'The Locker cannot be recovered afterwards by anybody, which is what makes it a locker.</p></div>'
          : "<p class='gtiny'>This is a lock on this browser, not a password on an account. It stops " +
            'somebody picking up an unlocked laptop; it is not protection from somebody determined.</p>') +
      '</div>';

    [].forEach.call(el.querySelectorAll('[data-m]'), function (b) {
      b.onclick = function () { run(b.getAttribute('data-m')); };
    });
    var out = el.querySelector('#ncgOut');
    if (out) out.onclick = escapeHatch;
    var first = el.querySelector('button');
    if (first) first.focus();
  }

  function escape2(s) {
    return String(s).replace(/[<>&]/g, function (m) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m];
    });
  }

  function fail(msg) {
    fails++;
    say(msg, 'bad');
    setTimeout(function () { if (el) { var keep = msg; menu(); say(keep, 'bad'); } }, 1600);
  }

  /* ---- the four ways in -------------------------------------------------- */
  function run(m) {
    say('Loading…');
    var mod = m === 'passkey' ? ['passkey.js', 'NC_PASSKEY']
            : m === 'rhythm'  ? ['rhythm.js', 'NC_RHYTHM']
            : ['biometric.js', 'ncBiometric'];
    need(mod[0], mod[1]).then(function () {
      if (m === 'passkey') return byPasskey();
      if (m === 'rhythm') return byRhythm();
      return byBio(m);
    }).catch(function (e) {
      fail(e.message + ' — try another method.');
    });
  }

  function byPasskey() {
    say('Waiting for the device…');
    [].forEach.call(el.querySelectorAll('button'), function (b) { b.disabled = true; });
    window.NC_PASSKEY.signIn().then(function (r) {
      say('That is you.', 'good');
      setTimeout(function () { done('passkey' + (r && r.name ? ' · ' + r.name : '')); }, 450);
    }).catch(function (e) {
      fail(e.message);
    });
  }

  function byRhythm() {
    var RH = window.NC_RHYTHM;
    var wait = RH.cooling();
    if (wait > 0) return fail('Too many wrong tries. Wait ' + Math.ceil(wait / 1000) + ' seconds.');

    var want = RH.info().clicks, rec = RH.newRecorder();
    el.innerHTML =
      "<div class='gb'>" +
        "<div class='gr'>" + IC.pulse + '</div>' +
        '<h2>Your click pattern</h2>' +
        '<p>All ' + want + ' clicks, the way you normally do it. It checks itself on the last one.</p>' +
        "<p class='gmsg'></p>" +
        "<div class='gdots'></div>" +
        "<div class='gpad'>" +
          "<button type='button' data-z='L'>LEFT</button>" +
          "<button type='button' data-z='R'>RIGHT</button>" +
        '</div>' +
        "<button type='button' class='gback'>Use something else</button>" +
      '</div>';

    var dots = el.querySelector('.gdots');
    function paint() {
      var s = '';
      for (var i = 0; i < want; i++) s += '<i' + (i < rec.length() ? " class='on'" : '') + '></i>';
      dots.innerHTML = s;
    }
    paint();

    [].forEach.call(el.querySelectorAll('.gpad button'), function (b) {
      var z = b.getAttribute('data-z');
      b.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (!rec.press(z)) return;
        b.classList.add('down');
        if (e.pointerId != null && b.setPointerCapture) {
          try { b.setPointerCapture(e.pointerId); } catch (x) {}
        }
      });
      b.addEventListener('pointerup', function (e) {
        e.preventDefault();
        if (!rec.held()) return;
        rec.release();
        b.classList.remove('down');
        paint();
        if (rec.length() >= want) check();
      });
      b.addEventListener('pointercancel', function () { rec.cancel(); b.classList.remove('down'); });
      /* Holding Space has a duration; a click event does not. */
      b.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (e.repeat || !rec.press(z)) return;
        b.classList.add('down');
      });
      b.addEventListener('keyup', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (!rec.held()) return;
        rec.release(); b.classList.remove('down'); paint();
        if (rec.length() >= want) check();
      });
      b.addEventListener('click', function (e) { e.preventDefault(); });
    });

    el.querySelector('.gback').onclick = menu;

    function check() {
      var r = RH.verify(rec.sample());
      if (r.ok) {
        say('That is you — ' + r.pct + '% match.', 'good');
        return setTimeout(function () { done('click rhythm · ' + r.pct + '%'); }, 500);
      }
      fail(r.why === 'COOLING'
        ? 'Too many wrong tries. Wait ' + Math.ceil(r.wait / 1000) + ' seconds.'
        : r.why === 'SEQ' ? 'That was a different left-and-right order.'
        : r.why === 'TEMPO' ? 'Right pattern, wrong speed.'
        : 'Not close enough — ' + r.pct + '% match.');
    }
  }

  /* Face and voice live in biometric.js, which owns the camera, the model and
     its own panel. Rather than a second copy of any of that, the gate opens
     that panel and waits for the event it fires on a successful match. */
  function byBio(kind) {
    if (!window.ncBiometric) return fail('The face and voice module has not loaded on this page.');
    say('Opening the ' + (kind === 'face' ? 'camera' : 'microphone') + '…');

    var settled = false;
    function ok(e) {
      if (settled) return;
      settled = true;
      cleanup();
      say('That is you.', 'good');
      setTimeout(function () {
        done(kind + (e && e.detail && e.detail.name ? ' · ' + e.detail.name : ''));
      }, 450);
    }
    function cleanup() {
      document.removeEventListener('nc:bio-signin', ok);
      clearTimeout(timer);
    }
    document.addEventListener('nc:bio-signin', ok);

    /* If the panel is closed without a match, nothing fires. Ninety seconds
       and the gate takes itself back rather than sitting on a message about
       a camera that is no longer on. */
    var timer = setTimeout(function () {
      if (settled) return;
      settled = true;
      cleanup();
      if (el) { menu(); say('That did not finish. Try again, or use another method.', 'bad'); }
    }, 90000);

    try { window.ncBiometric.signIn(); }
    catch (e) { settled = true; cleanup(); fail('The panel would not open.'); }
  }

  /* ---- the way out ------------------------------------------------------- */
  function escapeHatch() {
    if (!confirm('Remove the lock from this browser?\n\n' +
                 'This deletes your face and voice profiles, your passkey handle and your click ' +
                 'pattern — and the Locker with them, because its key came from the passkey.\n\n' +
                 'There is no copy anywhere. This cannot be undone.')) return;
    try { if (window.NC_PASSKEY) window.NC_PASSKEY.forget(); } catch (e) {}
    try { if (window.NC_RHYTHM) window.NC_RHYTHM.forget(); } catch (e) {}
    try { if (window.NC_LOCKER) window.NC_LOCKER.destroy(); } catch (e) {}
    try { localStorage.removeItem('nc_bio_profiles'); } catch (e) {}
    try { localStorage.removeItem('nc_bio_session'); } catch (e) {}
    done('lock removed');
  }

  /* ---- boot -------------------------------------------------------------- */
  function check() {
    if (window.NC_EMBED) return;                  // a tab host already asked
    if (EXEMPT.test(location.pathname)) return;   // policy pages stay reachable
    if (passed()) return;
    methods = enrolled();
    if (!methods.length) return;                  // nothing enrolled: no gate, no nag
    show();
  }

  window.NC_GUARD = {
    check: check, enrolled: enrolled, passed: passed, forget: forget,
    lockNow: function () { forget(); check(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
})();
