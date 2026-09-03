---
name: browser-test
description: Write a Playwright harness to verify a NovaClip feature in a real browser — including running the actual Cloudflare Worker code against a stub KV, and stubbing the Gemini API at the fetch boundary. Use when building or fixing anything with behaviour: a form, an editor tool, an API call, a layout bug you cannot see from the source.
---

# Testing a feature in a real browser

Nothing in this repo is trusted because the code looks right. Every fix in it
was confirmed by driving the actual page. This is the setup that works here,
including the parts that took a while to get right.

## The skeleton

```js
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;          // NOT `import { chromium }` — it is CommonJS
                                  // and the named import fails.
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 1300, height: 900 } });

// Fonts are unreachable from this sandbox. Without this, navigations spend
// their timeout on a TLS handshake that cannot succeed.
await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
await ctx.route('https://fonts.gstatic.com/**', r => r.abort());

// Seed past the gates, or the age gate / cookie banner / sign-up sheet covers
// the page and every result is about the overlay.
await ctx.addInitScript(() => { try {
  localStorage.setItem('nc_user_age', '17');
  localStorage.setItem('nc_consent', 'yes');
  localStorage.setItem('nc_username', 'tester');
} catch (e) {} });

const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));
await p.goto('http://localhost:8099/<page>.html', { waitUntil: 'load' });
await p.waitForTimeout(2000);
// ... assertions ...
console.log('errors:', errs.length ? errs : 'none');
await b.close();
```

Always print `errs`. A feature that works while throwing is a feature that
will stop working.

## Running the real Worker instead of guessing at it

Do not re-implement a Worker to test against it — run the file. This imports
the real `leaderboard-worker.js` and gives it an in-memory KV, so the
endpoints are exercised exactly as written:

```js
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const src = readFileSync('/home/user/novaclip-site/leaderboard-worker.js', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const worker = mod.default;

const store = new Map();
const DB = {
  async get(k, type) { const v = store.get(k); return v === undefined ? null : (type === 'json' ? JSON.parse(v) : v); },
  async put(k, v) { store.set(k, v); },
  async delete(k) { store.delete(k); }
};
// TLS, not plain http: ncServer() refuses any override that is not https://,
// so a stand-in on http:// is silently ignored and the page talks to
// production instead. Generate a cert with:
//   openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem \
//     -days 2 -nodes -subj "/CN=localhost"
// and give the browser context { ignoreHTTPSErrors: true }.
```

Point the page at it with `localStorage.setItem('nc_server', 'https://localhost:8123')`.

**The stub keeps state between runs.** Registering `novakid` once means the
next run gets "that username is taken" and the test fails for the wrong
reason. Use a fresh name each time:

```js
const U = 'kid' + Math.random().toString(36).slice(2, 8);
```

## Stubbing the AI at the vendor boundary

To test `ai-worker.js` behaviour without a key, override `globalThis.fetch`
inside the harness and answer only the Gemini URL. That way the Worker's own
validation, caps and error handling all run for real and only the vendor is
fake. Useful shapes to return:

```js
// truncated, the way a thinking model runs out of room
{ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{"ok":true,"steps":[{' }] } }] }
// refused on safety
{ promptFeedback: { blockReason: 'SAFETY' }, candidates: [{ finishReason: 'SAFETY', content: { parts: [] } }] }
```

From the page side, `ctx.route('https://novaclip-ai.*/**', ...)` is simpler
when you only care about what the page does with an answer.

## Making a test video

Several features need a real clip. Generate one in the page rather than
looking for a fixture — canvas + MediaRecorder, then `setInputFiles`:

```js
const c = document.createElement('canvas'); c.width = 640; c.height = 360;
const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm;codecs=vp8' });
// draw in a rAF loop while recording, stop, Blob -> URL.createObjectURL
```

Note that a MediaRecorder WebM has **no duration in its header** — the browser
reports `Infinity` until it has seen the end of the file. Both `publish.html`
and `moderate.js` handle that by seeking past the end first; a test clip made
this way will find that bug in anything that does not.

## Things that will waste an hour

- **The static server must run from the repo root.** Started from
  `scratchpad/` it serves the wrong directory and every page 404s.
- **React controlled inputs ignore `.value = x`.** Use the native setter:
  `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set`
  then dispatch an `input` event. This applies to the editor and trends.
- **Selecting elements by their text collides across the page.** The editor's
  rail and its properties tabs share labels; use ids or scoped selectors.
- **A step gated behind another step is not clickable.** `publish.html`
  keeps steps 3-6 `pointer-events:none` until step 2 is answered, and the
  click just times out with "intercepts pointer events".
- **Canvas checks need `willReadFrequently: true`** on the context, and a
  cross-origin frame taints the canvas so `getImageData` throws.
