/* NovaClip — AI provider abstraction
   ============================================================================
   Section 17 of the build brief: the app must not be coupled to one AI vendor.
   Everything above this file asks through one interface — ncAI.ask() — and this
   file decides which provider answers.

   LAYERS, BOTTOM TO TOP

     PROVIDER      one vendor adapter. Talks to a model. Knows nothing about the
                   site. GeminiProvider here is live and talks through ncAsk()
                   (Cloudflare Worker with the shared key, or the reader's own
                   key straight to Google — the site's existing two routes).

     REGISTRY      maps a provider id to its adapter. The active one is picked
                   here once, at boot, so a swap is one line and never touches
                   the pages that call ncAI.

     ncAI.ask()    what the rest of NovaClip calls. Signature and return shape
                   are identical to ncAsk(), which every AI feature already uses:
                     { text, image, err }   // err set means the model could not
                                           // answer — never a made-up reply.

   SWAPPING PROVIDERS (what a real deployment would do)
     OpenRouter and OpenAI are stubbed below with honest errors and a TODO.
     To make one live:
       1. add its API key as a SECRET on the Cloudflare Worker (never in HTML),
       2. extend ai-worker.js with a whitelisted model list for that vendor,
       3. fill in its ask() here.
     The pages never need to change: they already call ncAI.ask().

   NOTHING HERE CAN FAKE AN ANSWER. If no provider can answer, ask() returns
   { text:'', image:'', err:'...' } — exactly what ncAsk already returns — and
   the UI layer decides how to show that. There is no demo mode in this file on
   purpose: demo data lives one layer up, in the feature files, and is always
   labelled "demo".
   ============================================================================ */

(function () {
  'use strict';

  /* ---- the interface every provider implements -------------------------
     ask(prompt, opts) -> Promise<{ text, image, err }>
        opts: { model, temperature, maxTokens }
     The Gemini adapter is the only live one: it delegates to the site's
     existing ncAsk() (worker first, personal key second), so it inherits the
     site's rate-limit messaging, timeout handling and error strings. */
  class AIProvider {
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
    /* eslint-disable no-unused-vars */
    async ask(prompt, opts) { throw new Error(this.id + ' does not implement ask()'); }
  }

  class GeminiProvider extends AIProvider {
    constructor() {
      super('gemini', 'Google Gemini');
    }
    async ask(prompt, opts) {
      if (typeof window.ncAsk !== 'function') {
        return { text: '', image: '', err: 'NovaClip core (nova.js) did not load — no AI is available.' };
      }
      return window.ncAsk(prompt, opts || {});
    }
  }

  /* TODO(vendor-lock): OpenRouter. To enable: add the OPENROUTER_API_KEY
     secret to the Worker, whitelist model ids there, and replace this stub's
     err with a real request. The ask() shape must not change. */
  class OpenRouterProvider extends AIProvider {
    constructor() {
      super('openrouter', 'OpenRouter');
    }
    async ask() {
      return {
        text: '',
        image: '',
        err: 'OpenRouter is not enabled on this build. Add OPENROUTER_API_KEY to the Cloudflare Worker, then wire OpenRouterProvider.ask() in services/ai/ai-providers.js.'
      };
    }
  }

  /* TODO(vendor-lock): OpenAI. Same story as OpenRouter — the key belongs on
     the Worker, never in the page. */
  class OpenAIProvider extends AIProvider {
    constructor() {
      super('openai', 'OpenAI');
    }
    async ask() {
      return {
        text: '',
        image: '',
        err: 'OpenAI is not enabled on this build. Add OPENAI_API_KEY to the Cloudflare Worker, then wire OpenAIProvider.ask() in services/ai/ai-providers.js.'
      };
    }
  }

  /* ---- registry ---------------------------------------------------------
     env override lets a deployment pin a vendor without editing code:
        ?ncai=openrouter   or   localStorage nc_ai_provider = 'openrouter'
     Unknown ids fall back to gemini, which is the only live adapter. */
  const PROVIDERS = {
    gemini: new GeminiProvider(),
    openrouter: new OpenRouterProvider(),
    openai: new OpenAIProvider()
  };

  function providerId() {
    try {
      const q = new URLSearchParams(location.search).get('ncai');
      if (q && PROVIDERS[q]) return q;
      const ls = localStorage.getItem('nc_ai_provider');
      if (ls && PROVIDERS[ls]) return ls;
    } catch (e) { /* storage may be off in a privacy mode — fall through */ }
    return 'gemini';
  }

  const active = PROVIDERS[providerId()];

  /* ---- the one function everything calls ------------------------------- */
  function ask(prompt, opts) {
    return active.ask(prompt, opts).catch(function (e) {
      return { text: '', image: '', err: active.name + ' failed in an unexpected way: ' + (e && e.message ? e.message : String(e)) };
    });
  }

  function list() {
    return Object.keys(PROVIDERS).map(function (id) {
      return { id: id, name: PROVIDERS[id].name, live: id === 'gemini' };
    });
  }

  window.ncAI = { ask: ask, providers: list, active: function () { return active; } };
})();
