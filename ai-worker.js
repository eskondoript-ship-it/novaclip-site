/* NovaClip — the AI worker
   ============================================================================
   Every AI feature on the site (the AI page, Coder, Trend Spotter, Publish, the
   paper animator) calls ncAsk() in nova.js, and ncAsk() posts here. This Worker
   is the only place NovaClip's vendor keys exist.

   WHY A WORKER AT ALL
     A key shipped to a browser is a public key. Anyone can open the network tab,
     read it and spend it, and there is no way to un-ship it short of rotating.
     So the page holds no key: it posts a prompt here, this Worker adds the key
     and forwards the request to the model vendor.

   THREE PROVIDERS, ONE INTERFACE
     The request carries { provider, model, payload } where provider is one of
        gemini      -> Google, via GEMINI_API_KEY
        openrouter  -> OpenRouter, via OPENROUTER_API_KEY
        openai      -> OpenAI, via OPENAI_API_KEY
     Each provider has its own whitelist of model ids, because "model" is an
     open field and an open field means someone can point your key at the most
     expensive thing a vendor sells. Every vendor answer is normalized to
     Google's candidates[].content.parts shape before it leaves this Worker, so
     the page reads every provider through the same ncAsk() parser.

   WHAT IT IS NOT
     It is not a proxy for anything a caller likes. It accepts one shape of
     request, allows a fixed set of models, caps the prompt size, and rate-limits
     by IP. Without those, a public endpoint holding your key is a public endpoint
     spending your money.

   THE ONE RULE THIS FILE EXISTS TO ENFORCE
     Pass the upstream status through. If a vendor says 429 (out of quota), the
     browser must see 429, not 500. A Worker that catches everything and answers
     500 turns "the free tier is used up until midnight" into "the AI is broken",
     and there is no way to tell those apart from the page. Every error below
     carries the real status and a reason string that ncAsk() shows the user.

   PUTTING IT ONLINE
     1. dash.cloudflare.com -> Workers & Pages -> Create -> Worker -> Deploy
        (name it novaclip-ai, so the address matches NC_AI_WORKER in nova.js)
     2. Edit code -> select all -> paste this file -> Deploy
     3. Settings -> Variables and Secrets -> Add (each is a Secret, never a
        plaintext variable — a plaintext variable is readable by anyone with
        dashboard access). Add the vendors you want to serve:
          GEMINI_API_KEY       your AIza... key (Google)
          OPENROUTER_API_KEY   your sk-or-... key (OpenRouter)
          OPENAI_API_KEY       your sk-... key (OpenAI)
        Deploy again after each one.
     4. Optional but recommended — Settings -> Bindings -> Add -> KV namespace
          Variable name: RL     KV namespace: create one called novaclip-ai-rl
        Without it the rate limit still works per isolate, but not across them.
     5. Check it: open https://novaclip-ai.<you>.workers.dev/health in a browser.
        It reports which keys are set, without ever revealing one — and that is
        the first thing to look at when the site says the AI is unreachable.

   REQUEST SHAPE (what ncAsk sends)
     POST /
     { "provider": "gemini",                 // gemini | openrouter | openai
       "model": "gemini-2.5-flash",
       "payload": { "contents": [...], "generationConfig": {...} } }

   RESPONSE
     For gemini: Google's own JSON, unchanged, so ncAsk can read
     candidates[].content.parts. For openrouter and openai: the answer is
     normalized into that same shape. On any failure: { "error": "<reason a
     person can act on>" } with a real HTTP status.
   ============================================================================ */

const GOOGLE = 'https://generativelanguage.googleapis.com/v1beta/models/';
const OPENROUTER = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI = 'https://api.openai.com/v1/chat/completions';

/* Only models this site actually uses, per provider. An open model field means
   someone can point your key at the most expensive thing a vendor sells. */
const ALLOWED_MODELS = {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash-image'
  ],
  openrouter: [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-chat'
  ],
  openai: [
    'gpt-4o-mini',
    'gpt-4o'
  ]
};

/* A provider's key secret name — the guard in the handler checks it exists
   before any request is forwarded, so a missing key fails with "not enabled"
   instead of a bare 401 from upstream. */
const SECRET = {
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  openai: 'OPENAI_API_KEY'
};

const DEFAULT_MODEL = {
  gemini: 'gemini-2.5-flash',
  openrouter: 'openai/gpt-4o-mini',
  openai: 'gpt-4o-mini'
};

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

/* ---- vendor adapters ------------------------------------------------
   Gemini and OpenAI/OpenRouter take different request shapes. The site always
   sends Gemini's shape (contents/generationConfig); this converts it for the
   chat-completions vendors and folds their answers back into Gemini's shape,
   so ncAsk's parser never knows which vendor answered. */
function openAiPayload(model, payload) {
  const gc = payload.generationConfig || {};
  const messages = [];
  (payload.contents || []).forEach(function (c) {
    const text = (c.parts || []).map(function (p) { return p.text || ''; }).join('').trim();
    if (!text) return;
    messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: text });
  });
  if (!messages.length) messages.push({ role: 'user', content: '' });
  const out = { model: model, messages: messages };
  if (gc.temperature != null) out.temperature = gc.temperature;
  if (gc.maxOutputTokens) out.max_tokens = gc.maxOutputTokens;
  return out;
}

function toGeminiShape(upstreamJson) {
  const choice = upstreamJson && upstreamJson.choices && upstreamJson.choices[0];
  const msg = choice && choice.message;
  if (msg) {
    let text = '';
    if (typeof msg.content === 'string') text = msg.content;
    else if (Array.isArray(msg.content)) {
      msg.content.forEach(function (p) { if (p && p.text) text += p.text; });
    }
    const parts = [];
    if (text) parts.push({ text: text });
    return { candidates: [{ content: { parts: parts } }] };
  }
  const img = upstreamJson && upstreamJson.data && upstreamJson.data[0];
  if (img && img.b64_json) {
    return { candidates: [{ content: { parts: [{ inlineData: { mimeType: img.mime_type || 'image/png', data: img.b64_json } }] } }] };
  }
  return null;
}

async function upstreamFetch(provider, model, payload, key, signal) {
  if (provider === 'gemini') {
    return fetch(GOOGLE + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload),
      signal: signal
    });
  }
  if (provider === 'openrouter') {
    return fetch(OPENROUTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        /* Lets the site identify itself in OpenRouter's dashboard, which also
           makes the key easier to manage there. Not required to work. */
        'HTTP-Referer': 'https://novaclip.pages.dev',
        'X-Title': 'NovaClip'
      },
      body: JSON.stringify(openAiPayload(model, payload)),
      signal: signal
    });
  }
  /* openai */
  return fetch(OPENAI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify(openAiPayload(model, payload)),
    signal: signal
  });
}

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

    /* An endpoint you can open in a browser tab. It reports which secrets are
       set without ever revealing one, because "is the key configured" is the
       question you actually have at 11pm when the site says it cannot reach the
       AI, and there is no other way to ask it. */
    if (url.pathname === '/health') {
      return json({
        ok: !!env.GEMINI_API_KEY,
        key: !!env.GEMINI_API_KEY,
        keys: { gemini: !!env.GEMINI_API_KEY, openrouter: !!env.OPENROUTER_API_KEY, openai: !!env.OPENAI_API_KEY },
        kv: !!env.RL,
        models: ALLOWED_MODELS,
        note: (['gemini', 'openrouter', 'openai']
          .filter(function (p) { return !!env[SECRET[p]]; })
          .join(', ') || 'none') + ' — Settings > Variables and Secrets > Add secret (GEMINI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY).'
      });
    }

    if (request.method !== 'POST') return fail(405, 'Send a POST.');

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (await rateLimited(env, ip)) {
      return fail(429, 'Too many requests from this connection. Wait a minute, or add your own key in your profile.');
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) return fail(413, 'That prompt is too long.');

    let body;
    try { body = JSON.parse(raw); }
    catch (e) { return fail(400, 'That request was not valid JSON.'); }

    const provider = (body && body.provider) || 'gemini';
    if (!ALLOWED_MODELS[provider]) {
      return fail(400, 'This worker does not know the AI provider "' + provider + '".');
    }
    const model = (body && body.model) || DEFAULT_MODEL[provider];
    if (!ALLOWED_MODELS[provider].includes(model)) {
      return fail(400, 'This worker does not serve the model "' + model + '" on ' + provider + '.');
    }
    if (!body || !body.payload || !Array.isArray(body.payload.contents)) {
      return fail(400, 'Expected { provider, model, payload: { contents: [...] } }.');
    }

    /* A provider with no key on the worker is "not enabled" — a clear reason
       instead of a bare 401 from upstream. */
    if (!env[SECRET[provider]]) {
      return fail(503, 'This NovaClip AI worker has no ' + SECRET[provider] + ' secret set. Whoever deployed it needs to add it — and OpenRouter/OpenAI only work when their key is on the worker too.');
    }

    /* Without a timeout a hung upstream holds the request until Cloudflare kills
       it, and the browser sees a network error rather than a reason. */
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS);

    let upstream;
    try {
      upstream = await upstreamFetch(provider, model, body.payload, env[SECRET[provider]], abort.signal);
    } catch (e) {
      clearTimeout(timer);
      return fail(504, e.name === 'AbortError'
        ? 'The model took too long to answer.'
        : 'Could not reach the model service.');
    }
    clearTimeout(timer);

    const text = await upstream.text();

    /* The pass-through this file exists for. The vendor's status becomes our
       status, and its message becomes our reason, so the page can say "out of
       quota" instead of "500". */
    if (!upstream.ok) {
      let reason = '';
      try { reason = (JSON.parse(text).error || {}).message || ''; } catch (e) {}
      if (upstream.status === 429) {
        reason = 'NovaClip\'s shared AI is out of free quota for now. Add your own key in your profile to keep going.';
      } else if (upstream.status === 401 || (upstream.status === 400 && /key not valid|invalid api key/i.test(reason))) {
        reason = 'The ' + provider + ' key on this worker was rejected by its vendor. Whoever deployed it needs to replace ' + SECRET[provider] + '.';
      } else if (upstream.status === 404) {
        reason = 'The vendor no longer serves the model "' + model + '". Update ALLOWED_MODELS and nova.js.';
      }
      return fail(upstream.status, reason || ('The model service answered ' + upstream.status + '.'));
    }

    /* Gemini passes through untouched; the chat-completions vendors are folded
       back into Gemini's candidates shape so ncAsk reads them the same way. */
    if (provider === 'gemini') {
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
      });
    }
    let upstreamJson;
    try { upstreamJson = JSON.parse(text); }
    catch (e) { return fail(502, 'The AI answered in a shape this worker could not read.'); }
    const geminiShape = toGeminiShape(upstreamJson);
    if (!geminiShape) {
      return fail(502, 'The AI answered in a shape this worker could not read.');
    }
    return new Response(JSON.stringify(geminiShape), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
    });
  }
};
