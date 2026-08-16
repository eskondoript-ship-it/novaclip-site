/* NovaClip — the AI worker
   ============================================================================
   THERE ARE TWO WORKERS. THIS IS THE AI ONE.

     THIS FILE               the only thing that talks to the model vendors.
                             Needs a secret called GEMINI_API_KEY, and one per
                             other provider you turn on.
                             Its address goes in nova.js -> NC_AI_WORKER.

     leaderboard-worker.js   accounts, saves, leaderboard, community.
                             Needs a KV binding called DB.
                             Its address goes in nova.js -> NC_SERVER.

   Deploy them as two separate Workers with two separate addresses. If the AI
   pages answer 500 with "KV namespace DB is not bound", the other file is
   deployed here by mistake — replace it with this one.

   Every AI feature on the site (the AI page, Coder, Trend Spotter, Publish, the
   paper animator) calls ncAsk() in nova.js, and ncAsk() posts here. Jarvis's
   voice works the same way: jarvis.js posts to /tts on this same Worker and gets
   audio back. This Worker is the only place NovaClip's vendor keys exist.

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
        "model": "gemini-3.6-flash",
       "search": true,                       // OPTIONAL — ground the answer in a live
                                             // Google Search. Gemini-only, no key of
                                             // its own: the tool is part of the API.
       "payload": { "contents": [...], "generationConfig": {...} } }

     POST /tts                              // Jarvis's voice, text -> audio
     { "text": "Reply all set.", "voice": "Orus" }   // voice is optional

   RESPONSE
     For gemini: Google's own JSON, unchanged, so ncAsk can read
     candidates[].content.parts. A search request also carries the live results
     in groundingMetadata.groundingChunks[].web.uri/title, which ncAsk turns
     into a clickable source list. For openrouter and openai: the answer is
     normalized into that same shape. /tts answers with the MP3 itself. On any
     failure: { "error": "<reason a person can act on>" } with a real HTTP status.
   ============================================================================ */

const GOOGLE = 'https://generativelanguage.googleapis.com/v1beta/models/';
const OPENROUTER = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI = 'https://api.openai.com/v1/chat/completions';

/* Only models this site actually uses, per provider. An open model field means
   someone can point your key at the most expensive thing a vendor sells. */
const ALLOWED_MODELS = {
  gemini: [
    'gemini-3.6-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
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
  gemini: 'gemini-3.6-flash',
  openrouter: 'openai/gpt-4o-mini',
  openai: 'gpt-4o-mini'
};

const MAX_BODY = 64 * 1024;      // a prompt bigger than this is not a prompt
const RATE_MAX = 20;             // requests per IP...
const RATE_WINDOW = 60;          // ...per this many seconds
const UPSTREAM_TIMEOUT_MS = 45000;

/* Jarvis's voice. POST /tts turns text into MP3 with Gemini's TTS model. The
   voice list is closed so callers cannot experiment against your key, and the
   text is capped at roughly a breath's worth of speech — Jarvis's replies are
   already kept short, and there is no reason to allow a script to read a novel
   through your free quota. */
const TTS_MODEL = 'gemini-2.5-flash-tts';
const TTS_VOICE = 'Orus';               // calm, measured male — the default Jarvis
const TTS_VOICES = ['Orus', 'Charon', 'Zephyr', 'Puck', 'Kore', 'Fenrir', 'Aoede', 'Leda'];
const TTS_MAX_TEXT = 2000;              // characters

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

async function upstreamFetch(provider, model, payload, key, signal, search) {
  if (provider === 'gemini') {
    /* Live-web grounding. Adding the google_search tool asks Google to look the
       question up before answering and return the hits in groundingMetadata.
       No extra key of our own is needed — the tool is billed with the prompt —
       which is the whole reason Jarvis can search on the shared key. */
    const body = search ? Object.assign({}, payload, { tools: [{ google_search: {} }] }) : payload;
    return fetch(GOOGLE + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
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
    /* /health?probe=1 spends one tiny call on the real vendor and returns
       exactly what came back. "The key is set" and "the key works" are
       different questions, and only the second one matters at 11pm. No secret
       is echoed — only the upstream status and the vendor's own words. */
    if (url.pathname === '/health' && url.searchParams.get('probe') === '1') {
      if (!env.GEMINI_API_KEY) return json({ probe: 'gemini', ok: false, reason: 'GEMINI_API_KEY is not set.' });
      const model = 'gemini-3.6-flash';
      let r, body = '';
      try {
        r = await fetch(GOOGLE + model + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 1 } })
        });
        body = await r.text();
      } catch (e) {
        return json({ probe: 'gemini', ok: false, reason: 'Could not reach Google: ' + String(e.message || e) });
      }
      let reason = '', status = '';
      try {
        const j = JSON.parse(body);
        reason = (j.error && (j.error.message || j.error.status)) || '';
        status = (j.error && j.error.status) || '';
      } catch (e) { reason = body.slice(0, 300); }

      return json({
        probe: 'gemini', model,
        ok: r.ok,
        http: r.status,
        google_status: status,
        google_says: reason || (r.ok ? 'the call succeeded' : 'no message'),
        /* The three that actually happen, named so the fix is obvious. */
        likely: !r.ok && /SERVICE_DISABLED|has not been used|is disabled/i.test(reason)
            ? 'Generative Language API is not enabled on this project. Enable it, wait a minute, retry.'
          : !r.ok && /API_KEY_SERVICE_BLOCKED|not authorized|restricted/i.test(reason)
            ? 'The key is restricted to a set of APIs that excludes Generative Language. Edit the key: API restrictions > add Generative Language API, or set it to unrestricted.'
          : !r.ok && /API key not valid|API_KEY_INVALID/i.test(reason)
            ? 'The key string itself is wrong — a Firebase browser key or a truncated paste will do this.'
          : !r.ok && /quota|RESOURCE_EXHAUSTED/i.test(reason)
            ? 'Out of quota for now.'
          : r.ok ? 'Working. If the site still fails, the problem is in the page, not the key.'
          : 'Unrecognised — read google_says.'
      });
    }

    if (url.pathname === '/health') {
      return json({
        ok: !!env.GEMINI_API_KEY,
        /* Which of the two Workers is deployed here. leaderboard-worker.js
           answers "leaderboard"; if you see that at the AI address, or "ai" at
           the community address, the two are swapped. */
        worker: 'ai',
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

    if (url.pathname === '/tts') {
      /* Speech. { text, voice? } in, an MP3 out, same key and rate limit as
         everything else. jarvis.js calls this so it can answer out loud with a
         proper voice instead of the browser's. */
      if (!env.GEMINI_API_KEY) {
        return fail(503, 'This NovaClip AI worker has no GEMINI_API_KEY secret set, so it cannot speak.');
      }
      const text = body && typeof body.text === 'string' ? body.text.trim() : '';
      if (!text) return fail(400, 'Expected { text: "..." }.');
      if (text.length > TTS_MAX_TEXT) return fail(413, 'That text is too long to read aloud.');
      const voice = TTS_VOICES.includes(body.voice) ? body.voice : TTS_VOICE;

      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS);

      let ttsRes;
      try {
        ttsRes = await fetch(GOOGLE + TTS_MODEL + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
              audioConfig: { audioEncoding: 'MP3' }
            }
          }),
          signal: abort.signal
        });
      } catch (e) {
        clearTimeout(timer);
        return fail(504, e.name === 'AbortError'
          ? 'The speech service took too long to answer.'
          : 'Could not reach the speech service.');
      }
      clearTimeout(timer);

      const ttsRaw = await ttsRes.text();
      if (!ttsRes.ok) {
        let reason = '';
        try { reason = (JSON.parse(ttsRaw).error || {}).message || ''; } catch (e) {}
        if (ttsRes.status === 429) {
          reason = 'NovaClip\'s shared speech is out of free quota for now. Try again in a while.';
        } else if (ttsRes.status === 401 || (ttsRes.status === 400 && /key not valid|invalid api key/i.test(reason))) {
          reason = 'The GEMINI_API_KEY on this worker was rejected by Google. Whoever deployed it needs to replace it.';
        }
        return fail(ttsRes.status, reason || ('The speech service answered ' + ttsRes.status + '.'));
      }

      let ttsJson;
      try { ttsJson = JSON.parse(ttsRaw); }
      catch (e) { return fail(502, 'The speech service answered in a shape this worker could not read.'); }
      const part = ttsJson.candidates && ttsJson.candidates[0] && ttsJson.candidates[0].content &&
                   ttsJson.candidates[0].content.parts && ttsJson.candidates[0].content.parts[0];
      const inline = part && part.inlineData;
      if (!inline || !inline.data) return fail(502, 'The speech service answered without audio.');

      let bytes;
      try {
        bytes = Uint8Array.from(atob(inline.data), function (c) { return c.charCodeAt(0); });
      } catch (e) { return fail(502, 'The speech service sent audio this worker could not decode.'); }

      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': inline.mimeType || 'audio/mpeg',
          'Cache-Control': 'no-store',
          ...CORS
        }
      });
    }

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

    /* Grounding is a Google-side tool. Refuse rather than silently ignore, so a
       caller knows their "search the live web" request did not happen. */
    const search = body.search === true;
    if (search && provider !== 'gemini') {
      return fail(400, 'Search grounding is a Gemini feature; the ' + provider + ' adapter cannot search.');
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
      upstream = await upstreamFetch(provider, model, body.payload, env[SECRET[provider]], abort.signal, search);
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
