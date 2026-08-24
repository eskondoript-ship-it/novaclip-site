/* ============================================================================
   PASSKEYS — the one sign-in here that is not demo-grade
   ============================================================================
   The face and voice checks on this page are honest about what they are: a
   descriptor compared against a stored one, in JavaScript, with the page's own
   copy admitting a good impersonation can beat the voice one. They are a
   demonstration of how biometrics work, and they are fun, and they should not
   be the strongest thing on offer.

   A passkey is. The private key is generated inside the device's secure
   hardware, never leaves it, and cannot be used without the reader proving
   themselves to the device — the same fingerprint or face or PIN that unlocks
   the phone. Nothing here can read it, copy it, or send it anywhere.

   WHAT IT STILL DOES NOT DO, SAID PLAINLY

   NovaClip has no server that verifies the signature. So this unlocks THIS
   BROWSER, the way a password manager does — it is not proof of identity to
   anyone else, and it never claims to be. The difference from face and voice
   is real but it is about the strength of the lock, not about who is holding
   the other end.

   Storing the credential id locally is fine: an id is a public handle, not a
   secret. Losing it costs you the shortcut, not the key.

   WHY THIS IS NOT THE PROTOTYPE'S VERSION

   The uploaded design's helper only ever called navigator.credentials.get().
   There is no enrolment in it at all, so on a device that has never registered
   a credential the button could only ever fail. Both halves are here.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_PASSKEY) return;

  var STORE = 'nc_passkeys';
  var AUDIT = 'nc_bio_audit';

  /* ---- storage ---------------------------------------------------------- */
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }

  function keys() { return read(STORE, []); }

  /* ---- the audit trail --------------------------------------------------
     Every attempt, kept on the device. Borrowed from the uploaded design,
     which is right that somebody should be able to see what has been tried
     against their own browser. Capped at 50 so it cannot grow without end. */
  function log(what, ok, detail) {
    var rows = read(AUDIT, []);
    rows.unshift({ at: Date.now(), what: what, ok: !!ok, detail: detail || '' });
    write(AUDIT, rows.slice(0, 50));
    try { dispatchEvent(new CustomEvent('nc-audit')); } catch (e) {}
  }
  function auditRows() { return read(AUDIT, []); }
  function clearAudit() { write(AUDIT, []); try { dispatchEvent(new CustomEvent('nc-audit')); } catch (e) {} }

  /* ---- base64url, because credential ids are ArrayBuffers ---------------- */
  function toB64(buf) {
    var b = new Uint8Array(buf), s = '';
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64(str) {
    var s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }
  function randomBytes(n) {
    var b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
  }

  /* ---- can this browser do it at all? -----------------------------------
     Two separate questions, and conflating them is why passkey buttons so
     often appear and then do nothing. `PublicKeyCredential` says the API
     exists; the platform-authenticator check says the device actually has a
     fingerprint reader, a face camera or a PIN wired up to it. Only the
     second one means the button will work. */
  function available() {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      return Promise.resolve({ ok: false, why: 'This browser has no passkey support.' });
    }
    if (!window.isSecureContext) {
      return Promise.resolve({ ok: false, why: 'Passkeys need a secure connection (https).' });
    }
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(function (yes) {
        return yes
          ? { ok: true }
          : { ok: false, why: 'This device has no screen lock, fingerprint or face unlock set up, ' +
                              'so there is nothing for a passkey to live in.' };
      })
      .catch(function () { return { ok: false, why: 'This browser would not say whether passkeys work.' }; });
  }

  /* ---- enrol ------------------------------------------------------------ */
  function enrol(displayName) {
    var name = String(displayName || 'NovaClip user').slice(0, 60);
    return available().then(function (a) {
      if (!a.ok) { log('Passkey set-up', false, a.why); throw new Error(a.why); }

      /* The user handle identifies the account to the authenticator. There is
         no account server here, so it is a random id kept beside the key —
         stable for this browser, meaningless anywhere else, and specifically
         NOT anything about the person. */
      var handle = read(STORE + '_uid', null);
      if (!handle) { handle = toB64(randomBytes(16)); write(STORE + '_uid', handle); }

      return navigator.credentials.create({
        publicKey: {
          challenge: randomBytes(32),
          rp: { name: 'NovaClip', id: location.hostname },
          user: { id: fromB64(handle), name: name, displayName: name },
          /* -7 is ES256 and -257 is RS256: between them every platform
             authenticator in use is covered. */
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',   // the device itself, not a USB key
            userVerification: 'required',          // the lock must actually be proven
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'                      // nothing here needs to identify the hardware
        }
      }).then(function (cred) {
        if (!cred) throw new Error('The device did not create a passkey.');
        var list = keys();
        list.push({ id: cred.id, name: name, at: Date.now() });
        write(STORE, list);
        log('Passkey set up', true, name);
        return { id: cred.id, name: name };
      }).catch(function (e) {
        var why = friendly(e);
        log('Passkey set-up', false, why);
        throw new Error(why);
      });
    });
  }

  /* ---- sign in ---------------------------------------------------------- */
  function signIn() {
    var list = keys();
    if (!list.length) {
      var none = 'There is no passkey on this device yet. Set one up first.';
      log('Passkey sign-in', false, none);
      return Promise.reject(new Error(none));
    }
    return navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        rpId: location.hostname,
        timeout: 60000,
        userVerification: 'required',
        allowCredentials: list.map(function (k) {
          return { type: 'public-key', id: fromB64(k.id) };
        })
      }
    }).then(function (cred) {
      if (!cred) throw new Error('No passkey was returned.');
      var known = list.filter(function (k) { return k.id === cred.id; })[0];
      /* There is no server to check the signature against, and pretending
         otherwise would be the dishonest part. What IS proven: the device
         held the private key for one of the ids we registered, and its owner
         unlocked it just now. */
      log('Passkey sign-in', true, known ? known.name : '');
      return { id: cred.id, name: known ? known.name : '' };
    }).catch(function (e) {
      var why = friendly(e);
      log('Passkey sign-in', false, why);
      throw new Error(why);
    });
  }

  function forget() {
    write(STORE, []);
    log('Passkeys removed from this browser', true, '');
    /* The key itself lives in the device's own store. This removes NovaClip's
       handle on it, which is all this page can reach — the reader is told
       where the rest lives. */
  }

  /* Browser errors here are famously unhelpful. NotAllowedError alone covers
     "you cancelled", "it timed out" and "the device refused", so it is
     written out as all three rather than guessing one. */
  function friendly(e) {
    var n = (e && e.name) || '';
    if (n === 'NotAllowedError')
      return 'The device did not confirm it — the prompt was closed, it timed out, or the ' +
             'fingerprint or face was not recognised. Try again.';
    if (n === 'InvalidStateError')
      return 'This device already has a NovaClip passkey. Use Sign in rather than Set up.';
    if (n === 'NotSupportedError')
      return 'This device cannot make the kind of passkey NovaClip asked for.';
    if (n === 'SecurityError')
      return 'The address this page is on does not match the passkey. That happens when the ' +
             'site is opened from a different domain than the one it was set up on.';
    if (n === 'AbortError') return 'The request was cancelled.';
    return (e && e.message) || 'The passkey step did not finish.';
  }

  window.NC_PASSKEY = {
    available: available, enrol: enrol, signIn: signIn, forget: forget,
    keys: keys, log: log, auditRows: auditRows, clearAudit: clearAudit
  };
})();
