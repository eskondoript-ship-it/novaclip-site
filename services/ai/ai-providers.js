/* NovaClip — AI provider abstraction
   ============================================================================
   Section 17 of the build brief: the app must not be coupled to one AI vendor.
   Everything above this file asks through one interface — ncAI.ask() — and this
   file decides which provider answers.

   LAYERS, BOTTOM TO TOP

     PROVIDER      one vendor adapter. Talks to a model. Knows nothing about the
                   site. All three adapters here are live and talk through
                   ncAsk() in nova.js, which routes to the Cloudflare Worker
                   (where the vendor keys live) or, for Gemini, straight to
                   Google with a key of the reader's own.

     REGISTRY      maps a provider id to its adapter. The active one is picked
                   here once, at boot, so a swap is one line and never touches
                   the pages that call ncAI. A deployment can also pin one
                   without editing code (?ncai=openrouter on the URL, or
                   localStorage nc_ai_provider) — ncAsk() honors the same
                   selection, so the whole site swaps together.

     ncAI.ask()    what the rest of NovaClip calls. Signature and return shape
                   are identical to ncAsk(), which every AI feature already uses:
                     { text, image, err }   // err set means the model could not
                                           // answer — never a made-up reply.

   WHICH PROVIDER ANSWERS
     gemini      Google, via ncAsk(). The site's default.
     openrouter  OpenRouter. Routes through the worker's OPENROUTER_API_KEY.
     openai      OpenAI. Routes through the worker's OPENAI_API_KEY.

   ENABLING A VENDOR
     The adapters below are live, but a vendor only actually answers when its
     key is set on the Cloudflare Worker (Settings > Variables and Secrets):
     GEMINI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY. Missing key means
     ncAsk() comes back with an honest err naming the missing secret. No code
     change is needed — the pages already call ncAI.ask().

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
     All three adapters delegate to ncAsk() in nova.js, so they inherit the
     site's worker routing, rate-limit messaging, timeout handling and error
     strings. The only difference between them is which provider id reaches
     the worker. */
  class AIProvider {
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
    /* eslint-disable no-unused-vars */
    async ask(prompt, opts) { throw new Error(this.id + ' does not implement ask()'); }
  }

  /* The one guard every adapter needs: ncAsk lives in nova.js, which loads on
     every page. If it is missing, the core did not load — say so rather than
     throwing a TypeError. */
  function viaNcAsk(provider, prompt, opts) {
    if (typeof window.ncAsk !== 'function') {
      return Promise.resolve({
        text: '',
        image: '',
        err: 'NovaClip core (nova.js) did not load — no AI is available.'
      });
    }
    const o = opts || {};
    return window.ncAsk(prompt, { provider: provider, model: o.model, temperature: o.temperature, maxTokens: o.maxTokens });
  }

  class GeminiProvider extends AIProvider {
    constructor() {
      super('gemini', 'Google Gemini');
    }
    ask(prompt, opts) {
      return viaNcAsk('gemini', prompt, opts);
    }
  }

  class OpenRouterProvider extends AIProvider {
    constructor() {
      super('openrouter', 'OpenRouter');
    }
    ask(prompt, opts) {
      return viaNcAsk('openrouter', prompt, opts);
    }
  }

  class OpenAIProvider extends AIProvider {
    constructor() {
      super('openai', 'OpenAI');
    }
    ask(prompt, opts) {
      return viaNcAsk('openai', prompt, opts);
    }
  }

  /* ---- registry ---------------------------------------------------------
     env override lets a deployment pin a vendor without editing code:
        ?ncai=openrouter   or   localStorage nc_ai_provider = 'openrouter'
     Unknown ids fall back to gemini. The same selection drives ncAsk() in
     nova.js, so the two layers can never disagree about the active provider. */
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
      return { id: id, name: PROVIDERS[id].name, live: true };
    });
  }

  window.ncAI = { ask: ask, providers: list, active: function () { return active; } };
})();
