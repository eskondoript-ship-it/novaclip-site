/* ============================================================================
   THE LOCKER — the uploaded design's "zero-knowledge security manager", real
   ============================================================================
   A few lines you would rather nobody read if they picked up your phone: a
   spare email, a bank's phone number, the thing you are working out how to
   say. Encrypted on this device with AES-GCM, and the key comes from your
   passkey — which means from your fingerprint, face or PIN.

   WHY THIS IS NOT A BUTTON THAT HIDES A LIST

   The easy version of this feature stores the notes in plain localStorage and
   puts an Unlock button in front of them. Anyone who opens the developer
   console reads the lot, and a "biometric lock" that a thirteen-year-old's
   older brother defeats by pressing F12 has taught them something false about
   what security is.

   So the notes are never stored readable. What is on disk is ciphertext, a
   salt and a nonce. The key exists only in memory, only while unlocked, and
   is derived like this:

     passkey PRF  ->  32 bytes  ->  HKDF-SHA256 + salt  ->  AES-GCM key

   PRF is a WebAuthn extension: the authenticator signs a fixed input with the
   private key that never leaves the hardware and returns 32 derived bytes. The
   same passkey and the same input always give the same bytes, and nothing else
   can produce them. Delete the passkey and the notes are unreadable — by
   anybody, including whoever wrote this.

   WHEN THE DEVICE CANNOT DO THAT

   Not every authenticator supports PRF. There is no way to derive a key from a
   passkey without it, so rather than pretend, the page says the locker is not
   available on this device and offers a passphrase instead — PBKDF2 at 310,000
   iterations, which is what OWASP asks for with SHA-256. That is a real key
   too; it just depends on something remembered rather than something held.

   WHAT IT STILL DOES NOT PROTECT AGAINST

   A browser extension, or anyone with the device unlocked and the locker open,
   sees what you see. This protects data at rest on a shared or lost device.
   It is not protection from somebody standing behind you.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_LOCKER) return;

  var STORE = 'nc_locker';
  var ITERATIONS = 310000;          // OWASP's 2023 floor for PBKDF2-HMAC-SHA256

  function readBlob() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; }
  }
  function writeBlob(b) {
    try { localStorage.setItem(STORE, JSON.stringify(b)); return true; } catch (e) { return false; }
  }
  function rnd(n) { var b = new Uint8Array(n); crypto.getRandomValues(b); return b; }

  function b64(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }
  function unb64(str) {
    var bin = atob(str), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  /* ---- key derivation ---------------------------------------------------
     Two ways in, one kind of key out. HKDF for the PRF path because its input
     is already 32 bytes of high-entropy key material and stretching it would
     be pointless work; PBKDF2 for the passphrase path because its input is a
     human-chosen string and stretching it is the entire point. */
  function keyFromPrf(bytes, salt) {
    return crypto.subtle.importKey('raw', bytes, 'HKDF', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'HKDF', hash: 'SHA-256', salt: salt,
            info: new TextEncoder().encode('novaclip-locker') },
          base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      });
  }

  function keyFromPass(pass, salt) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pass),
                                   'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: ITERATIONS },
          base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      });
  }

  /* ---- the unlocked session --------------------------------------------
     The key lives here and nowhere else. Not in localStorage, not on window
     — a CryptoKey created as non-extractable cannot be read out of the
     browser even by code on this page, so the worst a bug can do is use it,
     not leak it. */
  var live = null;              // { key, mode }
  var idleTimer = 0;
  var IDLE_MS = 5 * 60 * 1000;  // five minutes untouched and it locks itself

  function touch() {
    clearTimeout(idleTimer);
    if (!live) return;
    idleTimer = setTimeout(lock, IDLE_MS);
  }

  function lock() {
    live = null;
    clearTimeout(idleTimer);
    try { dispatchEvent(new CustomEvent('nc-locker')); } catch (e) {}
  }

  function isOpen() { return !!live; }

  /* ---- read and write ---------------------------------------------------- */
  function decrypt(blob, key) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.ct))
      .then(function (plain) {
        var txt = new TextDecoder().decode(plain);
        var arr = JSON.parse(txt);
        return Array.isArray(arr) ? arr : [];
      });
  }

  function encrypt(items, key) {
    var iv = rnd(12);           // 96 bits, which is what GCM wants
    var data = new TextEncoder().encode(JSON.stringify(items));
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data)
      .then(function (ct) { return { iv: b64(iv), ct: b64(new Uint8Array(ct)) }; });
  }

  /* Open with a passkey. Rejects with 'NO_PRF' when the device cannot derive
     a key, so the page can offer the passphrase instead of showing a failure
     the reader can do nothing about. */
  function unlockWithPasskey() {
    if (!window.NC_PASSKEY) return Promise.reject(new Error('Passkeys are not set up on this page.'));
    var blob = readBlob();
    var salt = blob && blob.salt ? unb64(blob.salt) : rnd(16);
    return window.NC_PASSKEY.secret().then(function (bytes) {
      return keyFromPrf(bytes, salt);
    }).then(function (key) {
      return finishUnlock(key, 'prf', salt, blob);
    });
  }

  function unlockWithPass(pass) {
    if (!pass || pass.length < 8) {
      return Promise.reject(new Error('Use at least eight characters.'));
    }
    var blob = readBlob();
    var salt = blob && blob.salt ? unb64(blob.salt) : rnd(16);
    return keyFromPass(pass, salt).then(function (key) {
      return finishUnlock(key, 'pass', salt, blob);
    });
  }

  /* Shared tail: a first unlock creates an empty locker, a later one has to
     actually decrypt. A wrong passphrase fails here, in AES-GCM's own
     authentication check — which is the right place for it to fail, because
     GCM will not hand back plaintext it cannot verify. */
  function finishUnlock(key, mode, salt, blob) {
    if (!blob) {
      live = { key: key, mode: mode };
      return encrypt([], key).then(function (enc) {
        writeBlob({ v: 1, mode: mode, salt: b64(salt), iv: enc.iv, ct: enc.ct });
        touch();
        try { dispatchEvent(new CustomEvent('nc-locker')); } catch (e) {}
        return [];
      });
    }
    if (blob.mode !== mode) {
      return Promise.reject(new Error(
        blob.mode === 'prf'
          ? 'This locker was made with a passkey. Unlock it with the passkey.'
          : 'This locker was made with a passphrase. Unlock it with the passphrase.'));
    }
    return decrypt(blob, key).then(function (items) {
      live = { key: key, mode: mode };
      touch();
      try { dispatchEvent(new CustomEvent('nc-locker')); } catch (e) {}
      return items;
    }).catch(function () {
      throw new Error(mode === 'pass'
        ? 'That passphrase does not open this locker.'
        : 'That passkey does not open this locker.');
    });
  }

  function items() {
    if (!live) return Promise.reject(new Error('The locker is locked.'));
    var blob = readBlob();
    if (!blob) return Promise.resolve([]);
    touch();
    return decrypt(blob, live.key);
  }

  function save(list) {
    if (!live) return Promise.reject(new Error('The locker is locked.'));
    touch();
    return encrypt(list, live.key).then(function (enc) {
      var blob = readBlob() || {};
      blob.v = 1; blob.mode = live.mode;
      blob.iv = enc.iv; blob.ct = enc.ct;
      if (!blob.salt) blob.salt = b64(rnd(16));
      if (!writeBlob(blob)) throw new Error('This browser would not save it — storage may be full.');
      return list;
    });
  }

  function add(title, body) {
    return items().then(function (list) {
      list.unshift({ t: String(title || '').slice(0, 80),
                     b: String(body || '').slice(0, 2000),
                     at: Date.now() });
      return save(list);
    });
  }

  function remove(i) {
    return items().then(function (list) {
      list.splice(i, 1);
      return save(list);
    });
  }

  function exists() { return !!readBlob(); }
  function mode() { var b = readBlob(); return b ? b.mode : null; }

  /* Destroying it is one line and it is irreversible, which is the point —
     there is no copy anywhere to restore from. */
  function destroy() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    lock();
  }

  /* Leaving, hiding or backgrounding the page drops the key. Coming back
     asks for the fingerprint again, which is what a lock is for. */
  addEventListener('pagehide', lock);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') lock();
  });

  window.NC_LOCKER = {
    unlockWithPasskey: unlockWithPasskey, unlockWithPass: unlockWithPass,
    lock: lock, isOpen: isOpen, items: items, add: add, remove: remove,
    exists: exists, mode: mode, destroy: destroy, touch: touch,
    ITERATIONS: ITERATIONS, IDLE_MS: IDLE_MS
  };
})();
