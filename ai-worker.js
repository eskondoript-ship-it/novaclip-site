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

/* ---------------------------------------------------------------------------
   WHEN ONE VENDOR RUNS OUT, USE ANOTHER
   ---------------------------------------------------------------------------
   Free tiers run dry, and they run dry at the worst moment: a class of thirty
   opening the same page at once. Until now that was the end of it — the vendor
   said 429, this Worker passed 429 through faithfully, and every AI feature on
   the site stopped until the quota window rolled over.

   Every key this Worker has is a way of answering the same question. So when
   the one that was asked runs out, the next one that is configured gets asked
   instead, and the reader gets an answer rather than an apology.

   WHAT COUNTS AS "RUN OUT", AND WHAT DOES NOT
     429  out of quota or rate limited — the case this exists for
     503  the vendor is overloaded, which is the same thing from where we sit
     500/502/504 upstream fell over; another vendor may well be fine
   A 400 is a bad request and will be equally bad at the next vendor. A 401 is
   a broken key, which is a deploy problem and must be reported, not papered
   over by quietly spending somebody else's key. Neither one switches.

   TWO REQUESTS NEVER SWITCH, AND SAY SO
     Images — only the Gemini adapter takes them.
     Search grounding — only Gemini can look things up.
   Falling those over would mean answering a different question from the one
   asked: an ungrounded guess dressed up as a searched answer is worse than a
   clear "the AI is out of quota". This Worker already refuses to fake either
   one, and it keeps refusing.

   THE FALLBACK USES EACH VENDOR'S OWN DEFAULT MODEL. There is no honest
   mapping from "gemini-3.6-flash" to an OpenAI id, and inventing one produces
   a 404 from the second vendor on top of the 429 from the first.

   The answer carries X-NovaClip-Provider so the page can say who wrote it, and
   X-NovaClip-Switched when that is not who was asked.
   --------------------------------------------------------------------------- */
const FAILOVER_ORDER = ['gemini', 'openrouter', 'openai'];
const SWITCHABLE = new Set([429, 500, 502, 503, 504]);

/* The providers worth trying after `from`, in order: configured on this
   worker, not the one that just failed, and not already tried. */
function othersFor(env, from, tried) {
  return FAILOVER_ORDER.filter(function (p) {
    return p !== from && !tried.has(p) && !!env[SECRET[p]];
  });
}

/* ---------------------------------------------------------------------------
   A MODEL THAT IS GONE IS NOT THE SAME AS A VENDOR THAT IS BUSY
   ---------------------------------------------------------------------------
   Vendors retire models, and when one goes the request does not come back as
   429 — it comes back as 404, or as a 400 saying the model is not supported.
   The failover above deliberately does not move on either of those, so a
   retired model took every AI feature on the site down until somebody noticed
   and edited two files. That is the outage that lasts days rather than
   minutes, and it is the one this handles.

   The answer is not another vendor, it is another model AT THE SAME VENDOR:
   only Gemini can search and only Gemini takes an image, so a retired
   gemini-3.6-flash should become gemini-2.5-flash-lite, not become OpenAI.
   The vendors' own lists are already here in ALLOWED_MODELS — the point of
   that table was to stop a key being spent on the most expensive model, and
   it doubles as the list of what else this site is willing to ask for.

   Image models are kept out of a text fallback and text models out of an
   image one: answering "draw me a thumbnail" with a model that cannot draw is
   not a fallback, it is a different failure with a nicer status code.
   --------------------------------------------------------------------------- */
const MODEL_GONE = /not found|does not exist|no longer available|is not supported|unsupported model|deprecated|has been retired/i;

function modelIsGone(status, reason) {
  if (status === 404) return true;
  return status === 400 && MODEL_GONE.test(String(reason || ''));
}

/* The same vendor's other models, best first, minus the ones already asked. */
function modelsFor(provider, want, tried) {
  const wantsImage = /image/i.test(String(want || ''));
  return (ALLOWED_MODELS[provider] || []).filter(function (m) {
    if (tried.has(provider + '/' + m)) return false;
    return /image/i.test(m) === wantsImage;
  });
}

/* ---------------------------------------------------------------------------
   GROUNDING, THE CHEAP WAY — AND CACHED
   ---------------------------------------------------------------------------
   Asking Gemini to ground an answer is one line of JSON and it is the most
   expensive line in this file. The tool is billed per grounded request at
   roughly thirty-five dollars per thousand, which made one Trend Spotter scan
   cost about as much as eighteen ordinary AI answers — and eighty per cent of
   that was the search, not the model.

   A plain search API costs a few dollars per thousand queries for the same
   thing: a list of current pages about a subject. So when SEARCH_API_KEY is
   set, this Worker does the search itself, pastes the results into the prompt
   as context, and asks the model WITHOUT the grounding tool. The page cannot
   tell: the sources come back in groundingMetadata exactly where nova.js
   already looks for them.

   With no SEARCH_API_KEY it falls back to Gemini's own grounding, so a
   deployment that has not set the secret keeps working exactly as before.

   AND THE SAME QUESTION IS ONLY PAID FOR ONCE. A trend scan is a public
   question about a public subject — "what is moving in Minecraft this week" —
   and the answer is the same for everybody who asks it that afternoon. It is
   cached in KV under a hash of the exact request, so a second asker, or the
   same asker tomorrow morning, is free. The key is the whole payload, so two
   different prompts can never collide; a hit means somebody asked for
   precisely this, word for word.
   --------------------------------------------------------------------------- */
const SEARCH_TTL = 6 * 60 * 60;        // six hours: trends move by the day, not the minute
const SEARCH_HITS = 6;                 // enough to ground an answer, small enough to stay cheap

const SEARCH_API = {
  brave: {
    req: (k, q) => [
      'https://api.search.brave.com/res/v1/web/search?count=' + SEARCH_HITS + '&q=' + encodeURIComponent(q),
      { headers: { Accept: 'application/json', 'X-Subscription-Token': k } }
    ],
    read: (j) => ((j.web && j.web.results) || []).map(r => ({ title: r.title, uri: r.url, text: r.description || '' }))
  },
  serper: {
    req: (k, q) => [
      'https://google.serper.dev/search',
      { method: 'POST', headers: { 'X-API-KEY': k, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: q, num: SEARCH_HITS }) }
    ],
    read: (j) => (j.organic || []).map(r => ({ title: r.title, uri: r.link, text: r.snippet || '' }))
  }
};

/* Never throws and never blocks the answer: a search that fails returns no
   hits, and the caller falls back to Gemini's own grounding. */
async function webSearch(env, q) {
  const which = SEARCH_API[(env.SEARCH_PROVIDER || 'brave').toLowerCase()] || SEARCH_API.brave;
  try {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 6000);
    const [url, init] = which.req(env.SEARCH_API_KEY, q);
    const r = await fetch(url, Object.assign({ signal: abort.signal }, init));
    clearTimeout(timer);
    if (!r.ok) return [];
    const j = await r.json();
    return which.read(j).filter(h => h && h.uri && h.title).slice(0, SEARCH_HITS);
  } catch (e) { return []; }
}

/* The results, pasted in front of the prompt the page wrote. */
function withContext(payload, q, hits) {
  let copy;
  try { copy = JSON.parse(JSON.stringify(payload)); } catch (e) { return payload; }
  if (!copy.contents || !copy.contents[0] || !Array.isArray(copy.contents[0].parts)) return payload;
  const lines = hits.map((h, i) =>
    (i + 1) + '. ' + h.title + ' — ' + h.uri + '\n   ' + String(h.text || '').slice(0, 300)).join('\n');
  copy.contents[0].parts.unshift({ text:
    'LIVE WEB RESULTS for "' + q + '", fetched seconds ago. Treat these as what is true right now, ' +
    'and do not claim anything they do not support:\n' + lines + '\n\n---\n' });
  return copy;
}

/* Put the sources where nova.js already reads them, so a self-searched answer
   and a Gemini-grounded one are the same shape to the page. */
function withSources(text, hits) {
  if (!hits || !hits.length) return text;
  try {
    const j = JSON.parse(text);
    j.groundingMetadata = { groundingChunks: hits.map(h => ({ web: { uri: h.uri, title: h.title } })) };
    return JSON.stringify(j);
  } catch (e) { return text; }
}

async function cacheKey(parts) {
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return 'gs:' + Array.from(new Uint8Array(buf)).slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

const MAX_BODY = 64 * 1024;      // a prompt bigger than this is not a prompt

/* ---- IMAGES ---------------------------------------------------------------
   A request may carry frames as Gemini inlineData parts. That is how the
   editor's clip checker asks whether a video contains nudity, and it is the
   only caller today.

   It needs its own budget because a JPEG is not a prompt: four 512px frames
   are around 200KB of base64, which MAX_BODY refuses outright. A separate,
   larger cap applies only when the request actually contains images, so the
   text endpoint keeps its 64KB and cannot be widened by accident.

   Everything here exists because an endpoint that forwards arbitrary images
   to a vendor on your key is an image API you are paying for. Count, size,
   and type are all checked before a byte leaves this Worker, and the per-IP
   rate limit above applies to these the same as to any other request. */
const MAX_IMAGE_BODY = 1.5 * 1024 * 1024;   // ~4 frames at 512px, with room
const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 320 * 1024;          // per frame, decoded from base64
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* Walks the payload once and reports what is in it, so the caps above can be
   applied and a bad part refused with a reason rather than passed upstream to
   fail as a vendor error nobody can read. */
function inspectImages(payload) {
  let count = 0, biggest = 0, badType = null;
  (payload.contents || []).forEach(function (c) {
    (c.parts || []).forEach(function (part) {
      const d = part && (part.inlineData || part.inline_data);
      if (!d) return;
      count++;
      const mime = String(d.mimeType || d.mime_type || '').toLowerCase();
      if (IMAGE_TYPES.indexOf(mime) < 0) badType = mime || '(none)';
      /* base64 is 4 characters per 3 bytes. */
      const bytes = Math.floor(String(d.data || '').length * 3 / 4);
      if (bytes > biggest) biggest = bytes;
    });
  });
  return { count: count, biggest: biggest, badType: badType };
}
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
   novaclip.org, a Pages preview host, and file:// during development. The key
   is never in the response, so an origin check would buy nothing here — the
   rate limit is what protects the key. */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  /* A cross-origin response hides every header the server does not name here,
     so without this the page can see the answer but not who wrote it. It is
     two strings and it is what lets nova.js say "Gemini is out, OpenAI
     answered" instead of leaving somebody to wonder why the voice changed. */
  'Access-Control-Expose-Headers': 'X-NovaClip-Provider, X-NovaClip-Switched, X-NovaClip-Model, X-NovaClip-Cache',
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
        'HTTP-Referer': 'https://novaclip.org',
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

      /* EVERY model this worker is allowed to ask for, not just the default.

         It used to probe one hard-coded name, which answers "is the key
         working" and not the question you have when the site has been dead for
         three days: WHICH of these names is still being served. A retired model
         and a rejected key look identical from the page and need completely
         different fixes, and one of them is a two-word edit. Four tiny calls,
         only when a human opens this URL. */
      const wanted = (ALLOWED_MODELS.gemini || []).slice();
      const model = DEFAULT_MODEL.gemini;
      if (wanted.indexOf(model) < 0) wanted.unshift(model);

      const each = [];
      for (let i = 0; i < wanted.length; i++) {
        let rr = null, bb = '', why = '', st = '';
        try {
          rr = await fetch(GOOGLE + wanted[i] + ':generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }],
              generationConfig: { maxOutputTokens: 1 } })
          });
          bb = await rr.text();
        } catch (e) {
          each.push({ model: wanted[i], ok: false, http: 0, google_status: '',
                      google_says: 'Could not reach Google: ' + String(e.message || e) });
          continue;
        }
        try {
          const j = JSON.parse(bb);
          why = (j.error && (j.error.message || j.error.status)) || '';
          st = (j.error && j.error.status) || '';
        } catch (e) { why = bb.slice(0, 200); }
        each.push({ model: wanted[i], ok: rr.ok, http: rr.status, google_status: st,
                    google_says: why || (rr.ok ? 'answered' : 'no message') });
      }

      const working = each.filter(function (e) { return e.ok; }).map(function (e) { return e.model; });
      /* The headline is the model the site actually asks for. If that one is
         dead, it is the first one that still answers — because at that point
         the useful sentence is "this name works, the default does not". */
      const head = each.filter(function (e) { return e.model === model; })[0] ||
                   each.filter(function (e) { return e.ok; })[0] || each[0];
      if (!head) return json({ probe: 'gemini', ok: false, reason: 'Could not reach Google at all.', models: each });
      const reason = head.google_says;

      return json({
        probe: 'gemini', model,
        ok: working.length > 0,
        http: head.http,
        google_status: head.google_status,
        google_says: reason,
        /* Which names are alive right now. If this list is empty the model
           names in this file and in nova.js are what need changing; if it has
           entries but the site is still failing, the default is the dead one. */
        models: each,
        serving: working,
        default_is_served: working.indexOf(model) >= 0,
        /* The ones that actually happen, named so the fix is obvious. The
           model case is first because it is the only one of these that can
           take the site down for days while the key is perfectly fine. */
        likely: working.length && working.indexOf(model) < 0
            ? 'The key works, but the model this site asks for ("' + model + '") is not being served. ' +
              'Serving now: ' + working.join(', ') + '. Put one of those in DEFAULT_MODEL in ai-worker.js ' +
              'and in ncDefaultModel in nova.js.'
          : !working.length && each.every(function (e) { return e.http === 404; })
            ? 'The key works, but not one of these model names is served any more. They all need replacing ' +
              'in ALLOWED_MODELS and DEFAULT_MODEL here, and in ncDefaultModel in nova.js.'
          : !head.ok && /SERVICE_DISABLED|has not been used|is disabled/i.test(reason)
            ? 'Generative Language API is not enabled on this project. Enable it, wait a minute, retry.'
          : !head.ok && /API_KEY_SERVICE_BLOCKED|not authorized|restricted/i.test(reason)
            ? 'The key is restricted to a set of APIs that excludes Generative Language. Edit the key: API restrictions > add Generative Language API, or set it to unrestricted.'
          : !head.ok && /API key not valid|API_KEY_INVALID/i.test(reason)
            ? 'The key string itself is wrong — a Firebase browser key or a truncated paste will do this.'
          : !head.ok && /quota|RESOURCE_EXHAUSTED/i.test(reason)
            ? 'Out of quota for now.'
          : head.ok ? 'Working. If the site still fails, the problem is in the page, not the key.'
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
        /* The order a request falls through when a vendor runs out, with only
           the vendors this deployment can actually reach. One key configured
           means no failover, which is worth seeing on the health page rather
           than discovering at four in the afternoon. */
        failover: FAILOVER_ORDER.filter(function (p) { return !!env[SECRET[p]]; }),
        /* Grounding: who does the searching, and whether answers are cached.
           "gemini-builtin" is the expensive path — roughly ten times the price
           of a plain search API for the same list of pages. */
        grounding: env.SEARCH_API_KEY ? ((env.SEARCH_PROVIDER || 'brave') + ' (search API)') : 'gemini-builtin',
        search_cache: env.RL ? (SEARCH_TTL / 3600) + 'h in KV' : 'off — no RL KV binding',
        note: (['gemini', 'openrouter', 'openai']
          .filter(function (p) { return !!env[SECRET[p]]; })
          .join(', ') || 'none') + ' — Settings > Variables and Secrets > Add secret (GEMINI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY).'
      });
    }

    /* ========================================================================
       /map — one square of Google's map imagery, by coordinate
       ========================================================================
       The globe on the landing page draws its own continents, which is honest
       to about a degree and no finer. Zoomed in on a visitor's own street that
       is not a map, so this fetches the real thing.

       It is a GET that returns an image, because it is used as an <img> src and
       drawn to a canvas.

       WHY IT IS HERE AND NOT IN THE PAGE
         A Static Maps request needs a key, and a key in a page is a public key.
         So the page asks this Worker for a picture and never sees the key —
         the same reason every other vendor call in this file goes through here.

       WHY THE PARAMETERS ARE PINNED DOWN
         An endpoint that forwards arbitrary query strings to a billed API is an
         open image proxy someone else can spend your money through. Latitude
         and longitude must parse as numbers in range, zoom is clamped, and the
         size and type come from a fixed list. Nothing else is passed on.

       ATTRIBUTION
         Google's imagery carries a baked-in credit in the corner, and the terms
         require it stay visible. The page draws this inside a circular window,
         which crops corners — so nova-globe.js also prints "Map data ©Google"
         inside the window. Do not remove it; the licence is the reason it is
         there, not decoration.
       ======================================================================== */
    /* ========================================================================
       /aerial — Google's pre-rendered flyover of an address, if one exists
       ========================================================================
       A cinematic orbit of a place, as an MP4. The globe plays it inside the
       porthole when there is one, over the still imagery from /map.

       THREE THINGS ABOUT THIS API THAT SHAPE THE CODE

         It is keyed by ADDRESS, not by coordinate. There is no lookup by
         lat/lon, so the caller has to pass a place name — which is why the
         globe sends the one it already reverse-geocoded for the readout.

         Coverage is narrow. Landmarks and major metros have rendered videos;
         most residential streets do not, and the honest answer for those is a
         404. That is reported as such rather than dressed up, because the page
         has a still image to fall back to and needs to know to use it.

         A video that has never been rendered is not rendered on demand here.
         renderVideo is asynchronous and takes minutes, so calling it inside a
         request that a hover is waiting on would just time out. Pass render=1
         to start one in the background for the NEXT visitor; the reply says
         PROCESSING and the page falls back today.

       The response carries the signed MP4 URI, which the page then loads
       directly from Google. Proxying video bytes through a Worker would put
       every megabyte of every playthrough on your bill for no benefit — the
       URI is already time-limited and carries no key of ours.
       ======================================================================== */
    if (url.pathname === '/aerial') {
      if (!env.GOOGLE_MAPS_KEY) {
        return fail(503, 'This worker has no GOOGLE_MAPS_KEY secret set, so it cannot look up aerial video.');
      }
      /* Either a street address, or coordinates that get turned into one here.

         The lookup itself is address-only — that is the API, not a choice — but
         the page only ever knows where the visitor IS, as a latitude and a
         longitude. Translating in the page would need a geocoding key in the
         page. Translating here needs nothing new: it is the same Maps key that
         is already on this Worker, and Google's own geocoder returns the
         formatted street address the video lookup wants. A city name from
         somewhere else would not match anything. */
      let address = (url.searchParams.get('address') || '').trim();
      const alat = parseFloat(url.searchParams.get('lat'));
      const alon = parseFloat(url.searchParams.get('lon'));

      if (!address && isFinite(alat) && isFinite(alon)) {
        if (alat < -90 || alat > 90 || alon < -180 || alon > 180) {
          return fail(400, 'Those coordinates are out of range.');
        }
        try {
          const gr = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
            alat.toFixed(6) + ',' + alon.toFixed(6) +
            '&key=' + encodeURIComponent(env.GOOGLE_MAPS_KEY));
          const gj = await gr.json();
          const first = gj && gj.results && gj.results[0];
          if (first && first.formatted_address) address = first.formatted_address;
          else return json({ state: 'NONE',
            reason: 'No street address could be resolved for those coordinates.' }, 404);
        } catch (e) {
          return fail(504, 'Could not reach the geocoder.');
        }
      }

      if (!address || address.length > 200) {
        return fail(400, 'Expected an address of up to 200 characters, or lat and lon.');
      }

      const q = new URLSearchParams();
      q.set('address', address);
      q.set('key', env.GOOGLE_MAPS_KEY);

      let r, j;
      try {
        r = await fetch('https://aerialview.googleapis.com/v1/videos:lookupVideo?' + q.toString());
        j = await r.json();
      } catch (e) {
        return fail(504, 'Could not reach the aerial view service.');
      }

      /* PROCESSING means someone has already asked for this one and it is not
         finished. Not an error — just not today. */
      if (j && j.state === 'PROCESSING') {
        return json({ state: 'PROCESSING', address: address });
      }

      if (j && j.error) {
        if (j.error.code === 404) {
          /* Optionally start a render so a later visit has something. Fire and
             forget: the answer to THIS request is still "nothing yet". */
          if (url.searchParams.get('render') === '1') {
            try {
              await fetch('https://aerialview.googleapis.com/v1/videos:renderVideo?key=' +
                encodeURIComponent(env.GOOGLE_MAPS_KEY), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: address })
              });
              return json({ state: 'PROCESSING', address: address, started: true });
            } catch (e) { /* fall through to the plain 404 */ }
          }
          return json({ state: 'NONE', address: address,
            reason: 'No aerial video covers this address.' }, 404);
        }
        return fail(r.status || 502, j.error.message || 'The aerial view service refused that.');
      }

      const uris = j && j.uris;
      const mp4 = uris && (
        (uris.MP4_MEDIUM && (uris.MP4_MEDIUM.landscapeUri || uris.MP4_MEDIUM.portraitUri)) ||
        (uris.MP4_HIGH && (uris.MP4_HIGH.landscapeUri || uris.MP4_HIGH.portraitUri)) ||
        (uris.MP4_LOW && (uris.MP4_LOW.landscapeUri || uris.MP4_LOW.portraitUri))
      );
      if (!mp4) {
        return json({ state: 'NONE', address: address,
          reason: 'The service answered without a playable video.' }, 404);
      }

      return json({ state: 'ACTIVE', address: address, uri: mp4,
        /* Google's terms require the credit stay on screen; the page draws it. */
        attribution: 'Google' });
    }

    if (url.pathname === '/map') {
      if (!env.GOOGLE_MAPS_KEY) {
        /* Named clearly, because the page falls back to its drawn globe and a
           silent 404 would look like a bug rather than a missing secret. */
        return fail(503, 'This worker has no GOOGLE_MAPS_KEY secret set, so it cannot serve map imagery.');
      }

      const lat = parseFloat(url.searchParams.get('lat'));
      const lon = parseFloat(url.searchParams.get('lon'));
      if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return fail(400, 'Expected lat and lon as numbers within range.');
      }
      let z = parseInt(url.searchParams.get('z'), 10);
      if (!isFinite(z)) z = 14;
      z = Math.max(1, Math.min(20, z));

      const SIZES = { '320': 1, '480': 1, '640': 1 };
      const size = SIZES[url.searchParams.get('size')] ? url.searchParams.get('size') : '640';
      const TYPES = { roadmap: 1, satellite: 1, hybrid: 1, terrain: 1 };
      const type = TYPES[url.searchParams.get('type')] ? url.searchParams.get('type') : 'hybrid';
      const scale = url.searchParams.get('scale') === '2' ? '2' : '1';

      const q = 'center=' + lat.toFixed(6) + ',' + lon.toFixed(6) +
        '&zoom=' + z + '&size=' + size + 'x' + size + '&scale=' + scale +
        '&maptype=' + type + '&key=' + encodeURIComponent(env.GOOGLE_MAPS_KEY);

      let img;
      try {
        img = await fetch('https://maps.googleapis.com/maps/api/staticmap?' + q);
      } catch (e) {
        return fail(504, 'Could not reach the map service.');
      }
      if (!img.ok) {
        /* Google explains a refused key in the body of a 4xx, and that message
           is the only thing that makes this debuggable from outside. */
        let why = '';
        try { why = (await img.text()).slice(0, 200); } catch (e) {}
        return fail(img.status, why || ('The map service answered ' + img.status + '.'));
      }

      return new Response(img.body, {
        status: 200,
        headers: {
          'Content-Type': img.headers.get('Content-Type') || 'image/png',
          /* A patch of ground does not change. Caching it is the difference
             between one billed request per visitor and one per mouse move. */
          'Cache-Control': 'public, max-age=86400',
          ...CORS
        }
      });
    }

    if (request.method !== 'POST') return fail(405, 'Send a POST.');

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (await rateLimited(env, ip)) {
      return fail(429, 'Too many requests from this connection. Wait a minute, or add your own key in your profile.');
    }

    const raw = await request.text();
    /* Two caps, and the bigger one only unlocks if the body really does carry
       images — checked below against the parsed payload, not against the size.
       Reading a 1.5MB body first and then refusing it is the order that has to
       happen: there is no way to know what is in a request without reading it.
       The rate limit above has already run, so the cost of that is bounded. */
    if (raw.length > MAX_IMAGE_BODY) return fail(413, 'That request is too large.');
    if (raw.length > MAX_BODY && !/"inline_?[Dd]ata"/.test(raw)) {
      return fail(413, 'That prompt is too long.');
    }

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

    /* Frames, if there are any. Refused here with a reason rather than passed
       upstream to come back as a vendor error the page cannot explain. */
    const img = inspectImages(body.payload);
    if (img.count) {
      if (provider !== 'gemini') {
        return fail(400, 'Only the Gemini adapter on this worker takes images.');
      }
      if (img.count > MAX_IMAGES) {
        return fail(413, 'Too many images in one request — ' + MAX_IMAGES + ' at most.');
      }
      if (img.badType) {
        return fail(400, 'Images must be JPEG, PNG or WebP. Got "' + img.badType + '".');
      }
      if (img.biggest > MAX_IMAGE_BYTES) {
        return fail(413, 'One of those images is too big. Shrink the frames before sending them.');
      }
    } else if (raw.length > MAX_BODY) {
      /* The body was over the text cap and the inlineData that let it through
         the first check is not really there — a padded string shaped to look
         like one. */
      return fail(413, 'That prompt is too long.');
    }

    /* Grounding is a Google-side tool. Refuse rather than silently ignore, so a
       caller knows their "search the live web" request did not happen. */
    const search = body.search === true;
    if (search && provider !== 'gemini' && !env.SEARCH_API_KEY) {
      return fail(400, 'Search grounding is a Gemini feature; the ' + provider + ' adapter cannot search. ' +
                       'Set SEARCH_API_KEY and this Worker will do the search itself for any provider.');
    }

    /* A provider with no key on the worker is "not enabled" — a clear reason
       instead of a bare 401 from upstream. */
    if (!env[SECRET[provider]]) {
      return fail(503, 'This NovaClip AI worker has no ' + SECRET[provider] + ' secret set. Whoever deployed it needs to add it — and OpenRouter/OpenAI only work when their key is on the worker too.');
    }

    /* ------------------------------------------------------------------
       THE SAME PUBLIC QUESTION IS ONLY PAID FOR ONCE
       ------------------------------------------------------------------
       Keyed on the request as it arrived — provider, model, the page's own
       payload and the search query — and NOT on the payload after the search
       results are pasted in. Keying on the injected version would mean two
       people asking the same thing a minute apart got different keys, because
       the web moved between them, and the cache would never hit. This way a
       hit skips the search AND the model.

       Only grounded requests are cached. An ordinary prompt is cheap, often
       personal, and has no business in a shared store. */
    let cacheK = '';
    if (search && env.RL) {
      try {
        cacheK = await cacheKey([provider, model, body.payload,
                                 typeof body.searchQuery === 'string' ? body.searchQuery : '']);
        const hit = await env.RL.get(cacheK);
        if (hit) {
          return new Response(hit, {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS,
                       'X-NovaClip-Cache': 'hit' }
          });
        }
      } catch (e) { cacheK = ''; }   /* a broken cache must never break an answer */
    }

    /* ------------------------------------------------------------------
       GROUNDING: OUR OWN SEARCH WHERE WE HAVE A KEY FOR ONE
       ------------------------------------------------------------------
       With SEARCH_API_KEY set, the Worker fetches the results itself and
       pastes them into the prompt, and the model is asked WITHOUT the
       grounding tool — a few dollars per thousand instead of thirty-five.
       Without the secret, or if the search fails or returns nothing, this
       falls through and Gemini grounds it exactly as it always did. */
    let payload = body.payload;
    let hits = null;
    let grounded = search;
    const sq = typeof body.searchQuery === 'string' ? body.searchQuery.trim().slice(0, 200) : '';

    if (search && env.SEARCH_API_KEY && sq) {
      const found = await webSearch(env, sq);
      if (found.length) {
        payload = withContext(payload, sq, found);
        hits = found;
        grounded = false;
      }
    }

    /* An image can only be answered by Gemini, and so can a request we are
       asking GEMINI to ground. One we grounded ourselves is only text by the
       time it leaves here, so it may fail over to another vendor like anything
       else — which is a second, quieter win from doing the search ourselves. */
    const pinned = grounded || img.count > 0;

    const tried = new Set();        /* vendors asked */
    const triedM = new Set();       /* provider/model pairs asked */
    let at = provider, atModel = model;
    let upstream = null, text = '', lastStatus = 0, lastReason = '';

    /* Every vendor once, plus the alternative models at whichever vendor turns
       out to have retired the one we asked for. Bounded, and every hop only
       ever happens on a request that already failed. */
    const MAX_HOPS = FAILOVER_ORDER.length + 3;
    for (let hop = 0; hop < MAX_HOPS; hop++) {
      tried.add(at);
      triedM.add(at + '/' + atModel);

      /* Without a timeout a hung upstream holds the request until Cloudflare
         kills it, and the browser sees a network error rather than a reason. */
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS);
      let threw = null;
      try {
        upstream = await upstreamFetch(at, atModel, payload, env[SECRET[at]], abort.signal, grounded);
      } catch (e) {
        threw = e;
      }
      clearTimeout(timer);

      if (threw) {
        /* A vendor that cannot be reached at all is exactly what another
           vendor is for — but a timeout on a long prompt will time out again,
           so it is treated as switchable rather than fatal and the reason is
           kept in case nothing else answers either. */
        lastStatus = 504;
        lastReason = threw.name === 'AbortError'
          ? 'The model took too long to answer.'
          : 'Could not reach the model service.';
        upstream = null;
      } else {
        text = await upstream.text();
        if (upstream.ok) break;
        lastStatus = upstream.status;
        lastReason = '';
        try { lastReason = (JSON.parse(text).error || {}).message || ''; } catch (e) {}
      }

      /* The model, not the vendor. Try what else this vendor serves before
         leaving it — and this one applies even to a pinned request, because
         staying at Gemini is exactly what a pinned request needs. */
      const gone = modelIsGone(lastStatus, lastReason);
      if (gone) {
        const alt = modelsFor(at, model, triedM)[0];
        if (alt) { atModel = alt; upstream = null; continue; }
      }

      const canSwitch = !pinned && (SWITCHABLE.has(lastStatus) || gone);
      const next = canSwitch ? othersFor(env, at, tried)[0] : null;
      if (!next) break;
      at = next;
      atModel = DEFAULT_MODEL[next];
      upstream = null;
    }

    /* Nothing answered. The reason names the vendor that was actually asked
       last, and says plainly that the others were tried too — "out of quota"
       reads very differently when it means all of them. */
    if (!upstream || !upstream.ok) {
      let reason = lastReason;
      if (lastStatus === 429) {
        reason = tried.size > 1
          ? 'Every AI on this NovaClip worker is out of quota for now (' +
            Array.from(tried).join(', ') + '). Add your own key in your profile to keep going.'
          : 'NovaClip\'s shared AI is out of free quota for now. Add your own key in your profile to keep going.';
      } else if (lastStatus === 401 || (lastStatus === 400 && /key not valid|invalid api key/i.test(reason))) {
        reason = 'The ' + at + ' key on this worker was rejected by its vendor. Whoever deployed it needs to replace ' + SECRET[at] + '.';
      } else if (modelIsGone(lastStatus, reason)) {
        /* Every model this worker is allowed to ask for has been asked and
           refused. Naming them is the whole diagnosis: it is the difference
           between "the AI is broken" and "these four model names are dead and
           need replacing in ALLOWED_MODELS, DEFAULT_MODEL and nova.js". */
        reason = 'No model this worker is allowed to use is being served any more. Tried: ' +
          Array.from(triedM).join(', ') + '. The names need updating in ai-worker.js ' +
          '(ALLOWED_MODELS and DEFAULT_MODEL) and in nova.js (ncDefaultModel).';
      }
      return fail(lastStatus || 502, reason || ('The model service answered ' + lastStatus + '.'));
    }

    /* Who actually wrote it. The page reads these to say so out loud. */
    const who = {
      'X-NovaClip-Provider': at,
      /* Which name answered. The vendor can stay the same while the model
         changes under it, and when that happens this header is the only thing
         that says the default in this file has been retired. */
      'X-NovaClip-Model': atModel,
      ...(at !== provider ? { 'X-NovaClip-Switched': provider + '->' + at } : {})
    };

    /* Gemini passes through untouched; the chat-completions vendors are folded
       back into Gemini's candidates shape so ncAsk reads them the same way. */
    if (at === 'gemini') {
      const out = withSources(text, hits);
      if (cacheK) { try { await env.RL.put(cacheK, out, { expirationTtl: SEARCH_TTL }); } catch (e) {} }
      return new Response(out, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...who,
                   ...(cacheK ? { 'X-NovaClip-Cache': 'miss' } : {}) }
      });
    }
    let upstreamJson;
    try { upstreamJson = JSON.parse(text); }
    catch (e) { return fail(502, 'The AI answered in a shape this worker could not read.'); }
    const geminiShape = toGeminiShape(upstreamJson);
    if (!geminiShape) {
      return fail(502, 'The AI answered in a shape this worker could not read.');
    }
    const shaped = withSources(JSON.stringify(geminiShape), hits);
    if (cacheK) { try { await env.RL.put(cacheK, shaped, { expirationTtl: SEARCH_TTL }); } catch (e) {} }
    return new Response(shaped, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...who,
                 ...(cacheK ? { 'X-NovaClip-Cache': 'miss' } : {}) }
    });
  }
};
