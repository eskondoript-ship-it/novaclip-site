# Firebase JS SDK 10.12.0 — served from this repo, not from gstatic

Both files are the unmodified gstatic builds of Firebase 10.12.0, with one
exception noted below. Taken from:

    https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js
    https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js

sha256 of the files exactly as gstatic served them, before the edit below:

    firebase-app.js   6cf917206f4da022ef68d66b94ccd41cd253adc6bc84b5a2e4ea0cbde45e7046
    firebase-auth.js  b58bafb904d77dd077d508bc7cb19106be8a9290b7331b0a0f068b5d1d55a42a

## The one change

`firebase-auth.js` imports `firebase-app.js` by absolute gstatic URL. Left
alone, vendoring the files would have changed nothing: the page would load
our copy of auth, which would then go and fetch Google's copy of app anyway.
That one import is rewritten to `./firebase-app.js`. Nothing else is touched
— the two `https://www.gstatic.com/...` strings still in `firebase-app.js`
are a module name and a logger label, not fetches.

## Why

Same reason as `vendor/chart.umd.js`: these are the only scripts the site
runs that it does not host. gstatic is about as trustworthy as a CDN gets,
so this is not a reaction to a problem with Google — it is that a dependency
you serve yourself is one that cannot change under you, cannot be blocked by
a school filter, and works on a plane. Firebase here is sign-in, so a page
that cannot load it is a page nobody can log into.

## Upgrading

Download both files at the new version, re-apply the one import rewrite,
record the new hashes here, and check sign-in on profile.html and
analytics.html. The SDK is MIT licensed; Google's notice is inside each file.
