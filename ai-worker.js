/* NovaClip — the AI worker
   ============================================================================
   Every AI feature on the site (the AI page, Coder, Trend Spotter, Publish, the
   paper animator) calls ncAsk() in nova.js, and ncAsk() posts here. This Worker
   is the only place NovaClip's Gemini key exists.

   WHY A WORKER AT ALL
     A key shipped to a browser is a public key. Anyone can open the network tab,
     read it and spend it, and there is no way to un-ship it short of rotating.
     So the page holds no key: it posts a prompt here, this Worker adds the key
     and forwards the request to Google.

   WHAT IT IS NOT
     It is not a proxy for anything a caller likes. It accepts one shape of
     request, allows a fixed set of models, caps the prompt size, and rate-limits
     by IP. Without those, a public endpoint holding your key is a public endpoint
     spending your money.

   THE ONE RULE THIS FILE EXISTS TO ENFORCE
     Pass the upstream status through. If Google says 429 (out of quota), the
     browser must see 429, not 500. A Worker that catches everything and answers
     500 turns "the free tier is used up until midnight" into "the AI is broken",
     and there is no way to tell those apart from the page. Every error below
     carries the real status and a reason string that ncAsk() shows the user.

   PUTTING IT ONLINE
     1. dash.cloudflare.com -> Workers & Pages -> Create -> Worker -> Deploy
        (name it novaclip-ai, so the address matches NC_AI_WORKER in nova.js)
     2. Edit code -> select all -> paste this file -> Deploy
     3. Settings -> Variables and Secrets -> Add:
          Type: Secret     Name: GEMINI_API_KEY     Value: your AIza... key
        Deploy again. The key is a secret, not a plaintext variable: a plaintext
        variable is readable by anyone with dashboard access.
     4. Optional but recommended — Settings -> Bindings -> Add -> KV namespace
          Variable name: RL     KV namespace: create one called novaclip-ai-rl
        Without it the rate limit still works per isolate, but not across them.
     5. Check it: open https://novaclip-ai.<you>.workers.dev/health in a browser.
        It answers { ok: true, key: true } when the secret is set, and
        { ok: false, key: false } when it is not — which is the first thing to
        look at when the site says the AI is unreachable.

   REQUEST SHAPE (what ncAsk sends)
     POST /
     { "model": "gemini-2.5-flash",
       "payload": { "contents": [...], "generationConfig": {...} } }

   RESPONSE
     Google's own JSON, unchanged, so ncAsk can read candidates[].content.parts.
     On any failure: { "error": "<reason a person can act on>" } with a real
     HTTP status.
   ============================================================================ */

const GOOGLE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/* Only models this site actually uses. An open model field means someone can
   point your key at the most expensive thing Google sells. */
const ALLOWED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash-image'
];

const MAX_BODY = 64 * 1024;      // a prompt bigger than this is not a prompt
const RATE_MAX = 20;             // requests per IP...
const RATE_WINDOW = 60;          // ...per this many seconds
const UPSTREAM_TIMEOUT_MS = 45000;

/* CORS is wide open on purpose: the site is static and may be served from
   novaclip.pages.dev, a custom domain, and file:// during development. The key
   is never in the response, so an origin check would buy nothing here — the
   rate limit is what protects the key. */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

const json = (obj, status) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
});

/* Every failure answers in one shape, so ncAsk never has to guess. */
const fail = (status, reason) => json({ error: reason }, status);

/* In-isolate fallback for when there is no KV binding. It is per-isolate and
   Cloudflare runs many, so it is a speed bump rather than a limit — which is
   why step 4 above is recommended rather than optional in spirit. */
const memory = new Map();

async function rateLimited(env, ip) {
  const key = 'rl:' + ip;
  if (env.RL) {
    const n = parseInt((await env.RL.get(key)) || '0', 10);
    if (n >= RATE_MAX) return true;
    /* expirationTtl resets the whole window on each write rather than sliding
       it, which is the cheap approximation: worst case a caller gets 2x the
       allowance across a window boundary. That is fine for a courtesy limit. */
    await env.RL.put(key, String(n + 1), { expirationTtl: RATE_WINDOW });
    return false;
  }
  const now = Date.now(), rec = memory.get(key);
  if (!rec || now > rec.until) { memory.set(key, { n: 1, until: now + RATE_WINDOW * 1000 }); return false; }
  if (rec.n >= RATE_MAX) return true;
  rec.n++;
  return false;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);

    /* A endpoint you can open in a browser tab. It reports whether the secret is
       set without ever revealing it, because "is the key configured" is the
       question you actually have at 11pm when the site says it cannot reach the
       AI, and there is no other way to ask it. */
    if (url.pathname === '/health') {
      return json({
        ok: !!env.GEMINI_API_KEY,
        key: !!env.GEMINI_API_KEY,
        kv: !!env.RL,
        models: ALLOWED_MODELS,
        note: env.GEMINI_API_KEY
          ? 'Key is set. If the site still fails, the key itself may be rejected or out of quota — send a real prompt and read the error.'
          : 'GEMINI_API_KEY is not set. Settings > Variables and Secrets > Add secret.'
      });
    }

    if (request.method !== 'POST') return fail(405, 'Send a POST.');

    if (!env.GEMINI_API_KEY) {
      return fail(503, 'This NovaClip AI worker has no API key set. Whoever deployed it needs to add the GEMINI_API_KEY secret.');
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (await rateLimited(env, ip)) {
      return fail(429, 'Too many requests from this connection. Wait a minute, or add your own key in your profile.');
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) return fail(413, 'That prompt is too long.');

    let body;
    try { body = JSON.parse(raw); }
    catch (e) { return fail(400, 'That request was not valid JSON.'); }

    const model = (body && body.model) || 'gemini-2.5-flash';
    if (!ALLOWED_MODELS.includes(model)) {
      return fail(400, 'This worker does not serve the model "' + model + '".');
    }
    if (!body || !body.payload || !Array.isArray(body.payload.contents)) {
      return fail(400, 'Expected { model, payload: { contents: [...] } }.');
    }

    /* Without a timeout a hung upstream holds the request until Cloudflare kills
       it, and the browser sees a network error rather than a reason. */
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS);

    let upstream;
    try {
      upstream = await fetch(GOOGLE + encodeURIComponent(model) + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify(body.payload),
        signal: abort.signal
      });
    } catch (e) {
      clearTimeout(timer);
      return fail(504, e.name === 'AbortError'
        ? 'The model took too long to answer.'
        : 'Could not reach the model service.');
    }
    clearTimeout(timer);

    const text = await upstream.text();

    /* The pass-through this file exists for. Google's status becomes our status,
       and its message becomes our reason, so the page can say "out of quota"
       instead of "500". */
    if (!upstream.ok) {
      let reason = '';
      try { reason = (JSON.parse(text).error || {}).message || ''; } catch (e) {}
      if (upstream.status === 429) {
        reason = 'NovaClip\'s shared AI is out of free quota for now. Add your own key in your profile to keep going.';
      } else if (upstream.status === 400 && /API key not valid/i.test(reason)) {
        reason = 'The key on this worker was rejected by Google. Whoever deployed it needs to replace GEMINI_API_KEY.';
      } else if (upstream.status === 404) {
        reason = 'Google no longer serves the model "' + model + '". Update ALLOWED_MODELS and nova.js.';
      }
      return fail(upstream.status, reason || ('The model service answered ' + upstream.status + '.'));
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
    });
  }
};
