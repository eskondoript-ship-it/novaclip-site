/* ============================================================================
   PAY WORKER — a real checkout, on Cloudflare
   ============================================================================
   THIS IS A THIRD WORKER. IT IS NOT EITHER OF THE OTHER TWO.

     ai-worker.js           Gemini            needs GEMINI_API_KEY
     leaderboard-worker.js  accounts, scores  needs the DB KV binding
     pay-worker.js          THIS ONE          needs STRIPE_SECRET_KEY

   Deploying one of these at another one's address is what made every AI
   feature answer 500 last time. Give this its own worker name and its own
   route. Do not add the Stripe key to either of the others and do not add
   their bindings to this one.

   WHY THE CARD NEVER TOUCHES NOVACLIP

   pricing.html used to ask for a card number in its own form. That form was
   labelled a demo and did nothing, which was honest, but the shape of it was
   wrong and shipping the same shape with real processing behind it would have
   been a serious mistake:

     - a page that touches a PAN is in PCI DSS scope, and this one is a static
       file on GitHub Pages
     - a page that touches a PAN can leak one, through an npm dependency, an
       analytics tag, or a browser extension
     - the audience is 13-18 and the payer is a parent

   So the card details are entered on Stripe's own hosted page, on Stripe's
   domain, and NovaClip never sees them. This worker creates the Checkout
   Session and hands back a URL to redirect to. That is the whole client-side
   payment story.

   WHAT THE BROWSER MAY AND MAY NOT ASK FOR

   The browser sends a PLAN ID and a CURRENCY. It does not send a price. If it
   sent a price, somebody would send 0.01 — the amounts live in the table below
   and are looked up here, on the server, where they cannot be edited.

   WHAT STILL HAS TO BE DONE BY A HUMAN BEFORE MONEY MOVES

   Everything in DEPLOYING below. This file is complete and correct; it cannot
   be complete and LIVE, because going live needs a Stripe account that only
   the owner of this site can open. Until then /checkout answers 503 with a
   message saying exactly that, rather than pretending.

   ============================================================================
   DEPLOYING
   ============================================================================
     1  Make a Stripe account and finish the onboarding for real payments.
        Test mode works for everything below without that, using a key that
        starts sk_test_ and card 4242 4242 4242 4242.

     2  wrangler secret put STRIPE_SECRET_KEY        (paste the sk_ key)
        wrangler secret put STRIPE_WEBHOOK_SECRET    (see step 5)

     3  Set SITE_ORIGIN in wrangler.toml [vars] to https://novaclip.org — this
        is where Stripe sends the buyer back. It is a var and not a secret
        because it is not one.

     4  wrangler deploy --name novaclip-pay
        Then in pricing.html set NC_PAY to that worker's URL.

     5  Add a webhook endpoint in the Stripe dashboard pointing at
        https://<this worker>/webhook, subscribed to checkout.session.completed
        and customer.subscription.deleted. Stripe shows you the signing secret
        once; that is STRIPE_WEBHOOK_SECRET.

        The webhook is the one that matters. A buyer who closes the tab after
        paying never loads the return page, and their entitlement has to work
        anyway.

     6  Optional but wise: put the plan table below into Stripe as Products and
        Prices and swap price_data for a price ID. Then prices change in the
        dashboard instead of in a deploy.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   THE PLANS
   ---------------------------------------------------------------------------
   Amounts in the smallest unit of each currency — cents, pence, paise. Stripe
   wants them that way and floats and money do not mix.

   These mirror the six plans in pricing.html. If one changes, both change: a
   page that advertises 6.99 and charges 7.99 is fraud, not a bug.
   ------------------------------------------------------------------------- */
const PLANS = {
  family: {
    name: 'NovaClip Family Plus',
    mode: 'subscription',
    interval: 'month',
    price: { eur: 699, usd: 799, gbp: 599, cny: 4990, chf: 690, inr: 59900, bdt: 79900 }
  },
  tools: {
    name: 'NovaTools Creator',
    mode: 'subscription',
    interval: 'month',
    price: { eur: 499, usd: 599, gbp: 449, cny: 3990, chf: 490, inr: 44900, bdt: 59900 }
  },
  bundle: {
    name: 'NovaClip Bundle',
    mode: 'subscription',
    interval: 'month',
    price: { eur: 999, usd: 1099, gbp: 899, cny: 7990, chf: 990, inr: 89900, bdt: 119900 }
  },
  basic: {
    name: 'Creator Course — Basic',
    mode: 'payment',
    price: { eur: 2499, usd: 2799, gbp: 2199, cny: 19900, chf: 2490, inr: 199900, bdt: 279900 }
  },
  advanced: {
    name: 'Creator Course — Advanced',
    mode: 'payment',
    price: { eur: 4999, usd: 5499, gbp: 4499, cny: 39900, chf: 4990, inr: 399900, bdt: 549900 }
  },
  master: {
    name: 'Creator Course — Master',
    mode: 'payment',
    price: { eur: 9999, usd: 10999, gbp: 8999, cny: 79900, chf: 9990, inr: 799900, bdt: 1099900 }
  }
};

/* Stripe will not take a subscription in every currency in every account, and
   zero-decimal currencies behave differently again. Keeping the list explicit
   means an unsupported one fails here with a sentence rather than at Stripe
   with a stack trace. */
const CURRENCIES = ['eur', 'usd', 'gbp', 'cny', 'chf', 'inr', 'bdt'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === '/health') {
      /* Deliberately says whether the key is present and never what it is.
         The whole reason this worker exists is that the key is not in the
         browser; echoing it from a health check would undo that. */
      return json({
        ok: true,
        configured: !!env.STRIPE_SECRET_KEY,
        webhook: !!env.STRIPE_WEBHOOK_SECRET,
        mode: (env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? 'live'
            : (env.STRIPE_SECRET_KEY || '').startsWith('sk_test_') ? 'test' : 'unset',
        plans: Object.keys(PLANS)
      });
    }

    if (url.pathname === '/checkout' && request.method === 'POST') return checkout(request, env);
    if (url.pathname === '/verify' && request.method === 'GET') return verify(url, env);
    if (url.pathname === '/webhook' && request.method === 'POST') return webhook(request, env);

    return json({ error: 'Not found' }, 404);
  }
};

/* ---------------------------------------------------------------------------
   POST /checkout   { plan, currency, email? }  ->  { url }
   ------------------------------------------------------------------------- */
async function checkout(request, env) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({
      error: 'not_configured',
      message: 'Payments are not switched on yet. The Stripe key has not been set on the ' +
               'payment worker, so nothing can be charged — see DEPLOYING in pay-worker.js.'
    }, 503);
  }

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }

  const plan = PLANS[String(body.plan || '')];
  if (!plan) return json({ error: 'unknown_plan' }, 400);

  const currency = String(body.currency || 'eur').toLowerCase();
  if (!CURRENCIES.includes(currency)) return json({ error: 'unsupported_currency' }, 400);

  const amount = plan.price[currency];
  if (!amount) return json({ error: 'no_price_for_currency' }, 400);

  const origin = env.SITE_ORIGIN || 'https://novaclip.org';

  /* Stripe's API is form-encoded, not JSON. The bracket notation is how nested
     objects are expressed in it. */
  const form = new URLSearchParams();
  form.set('mode', plan.mode);
  form.set('success_url', `${origin}/pay-return.html?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${origin}/pricing.html?checkout=cancelled`);
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', currency);
  form.set('line_items[0][price_data][unit_amount]', String(amount));
  form.set('line_items[0][price_data][product_data][name]', plan.name);
  if (plan.mode === 'subscription') {
    form.set('line_items[0][price_data][recurring][interval]', plan.interval);
  }
  form.set('metadata[plan]', body.plan);
  /* An email is optional. If one is given Stripe prefills it and sends the
     receipt there; if not, Stripe asks. Either way it is Stripe holding it. */
  if (body.email && /.+@.+\..+/.test(String(body.email))) {
    form.set('customer_email', String(body.email).slice(0, 200));
  }
  form.set('allow_promotion_codes', 'true');
  /* Card details are collected by Stripe, on Stripe's page. Apple Pay and
     Google Pay come along automatically wherever the buyer's device offers
     them, which is most of the point of using the hosted page. */
  form.set('billing_address_collection', 'auto');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  });

  const out = await res.json();
  if (!res.ok) {
    /* Stripe's message is safe to pass on — it describes the request, not the
       account — and it is far more useful than "payment failed". */
    return json({ error: 'stripe', message: (out.error && out.error.message) || 'Stripe refused the request.' },
                res.status);
  }
  return json({ url: out.url, id: out.id });
}

/* ---------------------------------------------------------------------------
   GET /verify?session_id=...  ->  { paid, plan, email }
   ---------------------------------------------------------------------------
   For the return page, so it can say "thank you" truthfully. It asks Stripe
   rather than trusting the query string, because a query string is typed by
   whoever is looking at it.

   This is a convenience, NOT the source of truth. The webhook below is.
   ------------------------------------------------------------------------- */
async function verify(url, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'not_configured' }, 503);
  const id = url.searchParams.get('session_id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: 'bad_session_id' }, 400);

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const s = await res.json();
  if (!res.ok) return json({ error: 'stripe', message: (s.error && s.error.message) || '' }, res.status);

  return json({
    paid: s.payment_status === 'paid' || s.status === 'complete',
    plan: (s.metadata && s.metadata.plan) || null,
    email: s.customer_details ? s.customer_details.email : null,
    amount: s.amount_total,
    currency: s.currency
  });
}

/* ---------------------------------------------------------------------------
   POST /webhook
   ---------------------------------------------------------------------------
   The source of truth. A buyer who pays and then closes the tab never loads
   the return page, and their entitlement has to work anyway.

   The signature is checked before anything else. An unverified webhook body is
   just a POST from a stranger claiming somebody paid.
   ------------------------------------------------------------------------- */
async function webhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'not_configured' }, 503);

  const sig = request.headers.get('stripe-signature') || '';
  const raw = await request.text();

  const ok = await verifySignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return json({ error: 'bad_signature' }, 400);

  let event;
  try { event = JSON.parse(raw); } catch (e) { return json({ error: 'bad_json' }, 400); }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    /* Where an entitlement would be written. NovaClip's accounts live in the
       LEADERBOARD worker's KV, which this worker deliberately does not have a
       binding to — wiring that up means giving this worker DB access, and that
       is a decision to make on purpose rather than by accident. Until then the
       return page grants it on the device, which is where every other
       entitlement on this site already lives. */
    console.log('paid', s.id, s.metadata && s.metadata.plan, s.customer_details && s.customer_details.email);
  }

  return json({ received: true });
}

/* Stripe signs with HMAC-SHA256 over "timestamp.body". Web Crypto is available
   in a Worker, so this needs no library.

   The timestamp check is not decoration: without it a captured webhook can be
   replayed for ever, and it stays valid because the signature is still good. */
async function verifySignature(payload, header, secret) {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.split('=').map((s) => s.trim()))
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;      // five minutes

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');

  /* Constant-time compare. A === on a MAC leaks how much of it was right, one
     byte at a time, to anybody willing to send enough requests. */
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}
