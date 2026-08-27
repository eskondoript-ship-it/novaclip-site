/* ============================================================================
   NOVACLIP — PROFILES
   ============================================================================
   A username and a password, on top of the account that already exists.

   WHAT AN ACCOUNT WAS, AND STILL IS

   A random 32-character key in localStorage, plus a NOVA-XXXX-XXXX code that
   maps to it. That has not changed and is not going away: a profile is a
   second door into the same room, not a different room. Registering while
   signed in puts a name on the account already on this device rather than
   starting an empty one — otherwise a name would cost somebody every point
   and certificate they had.

   THE PASSWORD DOES NOT LEAVE THIS FILE

   It is run through PBKDF2-SHA256 600,000 times here, and only the 32 bytes
   that come out are sent. The worker never receives the password, so it
   cannot log it, leak it, or be asked for it.

   600,000 is the OWASP figure for PBKDF2-SHA256, and it is affordable here
   for the reason it is not affordable on the server: a Cloudflare Worker gets
   10ms of CPU and a phone gets as long as the person is willing to wait.
   Measured on a mid-range phone that is roughly half a second, once, on the
   sign-in button — which is why the button says what it is doing while it
   does it. A spinner with no explanation on a password field reads as
   "something is wrong".

   WHAT THIS IS NOT

   It is not stronger than the code. Username plus password resolves to the
   same key that NOVA-7K2P-9QF4 resolves to, and anybody holding either holds
   the account. It is a thing you can remember instead of a thing you have to
   keep. The page says so, because a password field implies a promise and this
   one should not be allowed to imply more than it keeps.

   NEEDS nova.js for ncServer(), ncApi(), ncKey() and ncCode(). The two files
   go together.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_ACCOUNT) return;

  var enc = new TextEncoder();

  function hex(buf) {
    var a = new Uint8Array(buf), s = '';
    for (var i = 0; i < a.length; i++) s += a[i].toString(16).padStart(2, '0');
    return s;
  }

  /* PBKDF2 needs the salt as bytes and the worker sends hex. */
  function unhex(h) {
    var out = new Uint8Array(String(h).length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(String(h).substr(i * 2, 2), 16);
    return out;
  }

  function api(path, opts) {
    if (typeof window.ncApi !== 'function') {
      return Promise.reject(new Error('nova.js has not loaded, so there is nothing to sign in to.'));
    }
    return window.ncApi(path, opts);
  }
  function post(path, body) {
    return api(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  /* --------------------------------------------------------------------------
     DERIVING
     --------------------------------------------------------------------------
     Requires crypto.subtle, which browsers only expose on a secure origin.
     Over plain http — someone opening the folder from disk, or a phone hitting
     a laptop's IP on a home network — window.crypto exists but window.crypto
     .subtle is undefined, and the failure without this check is
     "Cannot read properties of undefined (reading 'importKey')", which tells
     nobody anything.
     -------------------------------------------------------------------------- */
  async function derive(password, saltHex, rounds) {
    if (!(window.crypto && window.crypto.subtle)) {
      throw new Error('Passwords need a secure connection (https). This page is not on one, ' +
                      'so the browser will not do the encryption part.');
    }
    var base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    var bits = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt: unhex(saltHex),
      iterations: rounds,
      hash: 'SHA-256'
    }, base, 256);
    return hex(bits);
  }

  async function saltFor(username) {
    var r = await api('/account/salt?u=' + encodeURIComponent(username));
    if (!r || !r.salt) throw new Error('The server did not send a salt back.');
    return r;
  }

  /* --------------------------------------------------------------------------
     THE RULES, CHECKED HERE TOO
     --------------------------------------------------------------------------
     The worker checks these and is the one that matters — this copy exists so
     somebody typing a username gets told before they have also typed a
     password twice and pressed a button.
     -------------------------------------------------------------------------- */
  var USERNAME_RE = /^[a-z0-9](?:[a-z0-9._-]{1,18}[a-z0-9])$/;

  function checkUsername(u) {
    u = String(u || '').trim().toLowerCase();
    if (!u) return 'Pick a username.';
    if (u.length < 3) return 'A username is at least 3 characters.';
    if (u.length > 20) return 'A username is at most 20 characters.';
    if (!USERNAME_RE.test(u)) {
      return 'Letters and numbers, with . _ or - in the middle. No spaces.';
    }
    return null;
  }

  /* Length first, because it is the only one that reliably matters, and no
     rule about symbols — a required punctuation mark is how everybody ends up
     with the same password and a 1 on the end. The common-password list is
     short on purpose: it catches the handful somebody types without thinking,
     and pretending to be a real blocklist would need a file bigger than the
     rest of this site. */
  var OBVIOUS = ['password', '12345678', 'qwertyui', 'letmein1', 'iloveyou',
                 'password1', '123456789', 'novaclip', 'abc12345', '11111111'];

  function checkPassword(p, username) {
    p = String(p || '');
    if (p.length < 8) return 'A password is at least 8 characters. Longer beats complicated.';
    if (p.length > 200) return 'That is longer than the 200 characters this will take.';
    if (OBVIOUS.indexOf(p.toLowerCase()) >= 0) return 'That is one of the first passwords anybody guesses.';
    if (username && p.toLowerCase() === String(username).toLowerCase()) {
      return 'Your password cannot be your username.';
    }
    return null;
  }

  /* A rough read, shown as words rather than a bar out of five. Length is
     most of it because length is most of it. */
  function strength(p) {
    p = String(p || '');
    var kinds = (/[a-z]/.test(p) ? 1 : 0) + (/[A-Z]/.test(p) ? 1 : 0) +
                (/[0-9]/.test(p) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(p) ? 1 : 0);
    var score = Math.min(4, Math.floor(p.length / 5)) + (kinds - 1);
    if (p.length < 8) return { n: 0, word: 'Too short' };
    if (score <= 2) return { n: 1, word: 'Weak' };
    if (score <= 4) return { n: 2, word: 'Alright' };
    if (score <= 6) return { n: 3, word: 'Good' };
    return { n: 4, word: 'Strong' };
  }

  /* --------------------------------------------------------------------------
     THE THREE THINGS IT DOES
     -------------------------------------------------------------------------- */
  async function register(username, password) {
    username = String(username || '').trim().toLowerCase();
    var bad = checkUsername(username) || checkPassword(password, username);
    if (bad) throw new Error(bad);

    var s = await saltFor(username);
    var authKey = await derive(password, s.salt, s.rounds);

    /* The key and code already on this device, so the worker puts the name on
       the account that has the progress in it. Sent as a claim rather than a
       proof — anybody can post any key — but the worst it can do is attach a
       username to an account whose key you already hold, and holding the key
       is holding the account. */
    var out = await post('/account/register', {
      username: username, authKey: authKey,
      key: (typeof window.ncKey === 'function' && window.ncKey()) || undefined,
      code: (typeof window.ncCode === 'function' && window.ncCode()) || undefined
    });
    remember(out, username);
    return out;
  }

  async function login(username, password) {
    username = String(username || '').trim().toLowerCase();
    if (!username || !password) throw new Error('Both boxes, please.');
    var s = await saltFor(username);
    var authKey = await derive(password, s.salt, s.rounds);
    var out = await post('/account/login', { username: username, authKey: authKey });
    remember(out, username);
    return out;
  }

  async function changePassword(username, oldPassword, newPassword) {
    username = String(username || '').trim().toLowerCase();
    var bad = checkPassword(newPassword, username);
    if (bad) throw new Error(bad);
    var s = await saltFor(username);
    /* Same salt for both, which is what lets the worker check the old one and
       store the new one without handing out a second salt. */
    var authKey = await derive(oldPassword, s.salt, s.rounds);
    var newAuthKey = await derive(newPassword, s.salt, s.rounds);
    return post('/account/password', {
      username: username, authKey: authKey, newAuthKey: newAuthKey
    });
  }

  function remember(out, username) {
    try {
      if (out && out.key) localStorage.setItem('nc_key', out.key);
      if (out && out.code) localStorage.setItem('nc_code', out.code);
      localStorage.setItem('nc_username', username);
    } catch (e) {}
  }

  function current() {
    try { return localStorage.getItem('nc_username') || ''; } catch (e) { return ''; }
  }

  /* Signing out forgets the key on this device. It does not delete anything on
     the server, and it does not clear the progress in this browser — which is
     the honest behaviour and worth saying on the button, because "sign out"
     elsewhere on the web sometimes means both. */
  function signOut() {
    try {
      localStorage.removeItem('nc_key');
      localStorage.removeItem('nc_code');
      localStorage.removeItem('nc_username');
    } catch (e) {}
  }

  window.NC_ACCOUNT = {
    register: register,
    login: login,
    changePassword: changePassword,
    signOut: signOut,
    current: current,
    checkUsername: checkUsername,
    checkPassword: checkPassword,
    strength: strength,
    derive: derive
  };
})();
