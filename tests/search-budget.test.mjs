/* ai-worker — the Brave query allowance, and the second query shape retiring
   ==========================================================================
   Two query shapes per scan costs two of Brave's 2,000 free queries a month,
   so the honest capacity is 1,000 scans rather than 2,000. The Worker now
   counts what it spends and drops the SECOND shape once the month is down to
   a reserve, so the last slice of the month runs single-query scans instead
   of running out and falling back into Gemini's own grounding — which is
   metered separately, far smaller, and is the path that 429'd before.

   These tests drive the real exported handler, not a copy of its logic, with
   KV and the search provider stubbed at the fetch boundary. What is being
   checked is the thing that costs money: HOW MANY QUERIES GO OUT, and whether
   the prompt names only the questions actually asked.
   ========================================================================== */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../ai-worker.js', import.meta.url), 'utf8');
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(src).toString('base64')
);
const worker = mod.default;

/* ---- the stubs ---------------------------------------------------------- */

function kv(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    get: async (k) => (map.has(k) ? map.get(k) : null),
    put: async (k, v) => { map.set(k, String(v)); },
    delete: async (k) => { map.delete(k); }
  };
}

/* Records every outbound call so the count of SEARCH queries is observable,
   and hands back a shaped answer for each. */
function stubFetch(log) {
  return async (url, init) => {
    const u = String(url && url.url ? url.url : url);
    if (u.includes('api.search.brave.com')) {
      const q = new URL(u).searchParams.get('q');
      log.push({ kind: 'search', q });
      return new Response(JSON.stringify({
        web: { results: [
          { url: 'https://e.test/' + encodeURIComponent(q), title: 'r:' + q, description: 'd' }
        ] }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    /* Gemini. The prompt is captured so the header can be inspected. */
    let sent = '';
    try { sent = typeof init?.body === 'string' ? init.body : ''; } catch (e) {}
    log.push({ kind: 'model', body: sent });
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"trends":[]}' }] } }]
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}

function env(extra = {}, seed = {}) {
  return Object.assign({
    GEMINI_API_KEY: 'k-gemini',
    SEARCH_API_KEY: 'k-brave',
    RL: kv(seed)
  }, extra);
}

function scan(body = {}) {
  return new Request('https://w.test/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' },
    body: JSON.stringify(Object.assign({
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      payload: { contents: [{ parts: [{ text: 'find trends' }] }] },
      search: true,
      searchQuery: 'minecraft news trending',
      searchQuery2: 'minecraft tiktok trend viral',
      freshness: 'pw'
    }, body))
  });
}

const monthKey = () => {
  const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
};

async function run(e, body) {
  const log = [];
  const real = globalThis.fetch;
  globalThis.fetch = stubFetch(log);
  try { return { res: await worker.fetch(scan(body), e, {}), log }; }
  finally { globalThis.fetch = real; }
}

const searches = (log) => log.filter((x) => x.kind === 'search');
const prompt   = (log) => (log.find((x) => x.kind === 'model') || {}).body || '';

/* ---- a month with room: both shapes go out ------------------------------ */

test('early in the month both query shapes are asked', async () => {
  const e = env();
  const { log } = await run(e);
  const s = searches(log);
  assert.equal(s.length, 2, 'should spend two queries while there is room');
  assert.equal(s[0].q, 'minecraft news trending');
  assert.equal(s[1].q, 'minecraft tiktok trend viral');
});

test('both questions are named in the prompt when both were asked', async () => {
  const { log } = await run(env());
  const p = prompt(log);
  assert.ok(p.includes('minecraft news trending'), 'first question missing');
  assert.ok(p.includes('minecraft tiktok trend viral'), 'second question missing');
});

test('the queries it spends are counted in KV', async () => {
  const e = env();
  await run(e);
  assert.equal(e.RL.map.get('sq:' + monthKey()), '2');
});

/* ---- inside the reserve: the second shape retires ----------------------- */

test('inside the reserve only one query goes out', async () => {
  /* 2000 cap, 200 reserve -> the second shape stops at 1800 spent. */
  const e = env({}, { ['sq:' + monthKey()]: '1800' });
  const { log } = await run(e);
  const s = searches(log);
  assert.equal(s.length, 1, 'should fall back to a single query');
  assert.equal(s[0].q, 'minecraft news trending',
    'the news shape is the one that survives');
});

test('a retired second query is NOT named in the prompt', async () => {
  const e = env({}, { ['sq:' + monthKey()]: '1800' });
  const { log } = await run(e);
  const p = prompt(log);
  assert.ok(p.includes('minecraft news trending'), 'the asked question should be named');
  assert.ok(!p.includes('minecraft tiktok trend viral'),
    'naming a question nobody asked invites the model to explain its absence');
});

test('one query below the reserve edge still asks both', async () => {
  const e = env({}, { ['sq:' + monthKey()]: '1799' });
  const { log } = await run(e);
  assert.equal(searches(log).length, 2, '1799 < 1800 should still get both');
});

/* ---- the off switch ----------------------------------------------------- */

test('SEARCH_SECOND=off asks one query however much room is left', async () => {
  const e = env({ SEARCH_SECOND: 'off' });
  const { log } = await run(e);
  assert.equal(searches(log).length, 1);
  assert.equal(e.RL.map.get('sq:' + monthKey()), '1', 'and spends one, not two');
});

test('SEARCH_BUDGET from the environment moves the reserve edge', async () => {
  /* A paid plan of 20,000: 1,800 spent is nowhere near its reserve. */
  const e = env({ SEARCH_BUDGET: '20000' }, { ['sq:' + monthKey()]: '1800' });
  const { log } = await run(e);
  assert.equal(searches(log).length, 2, 'a bigger plan keeps both shapes alive');
});

/* ---- the degenerate cases that must not spend two ----------------------- */

test('an identical second query is never a second spend', async () => {
  const e = env();
  const { log } = await run(e, { searchQuery2: 'minecraft news trending' });
  assert.equal(searches(log).length, 1);
});

test('no second query in the request means one spend', async () => {
  const e = env();
  const { log } = await run(e, { searchQuery2: '' });
  assert.equal(searches(log).length, 1);
  assert.equal(e.RL.map.get('sq:' + monthKey()), '1');
});

/* ---- /health reports it ------------------------------------------------- */

test('/health reports the allowance and what the second query is doing', async () => {
  const e = env({}, { ['sq:' + monthKey()]: '1800' });
  const real = globalThis.fetch;
  globalThis.fetch = stubFetch([]);
  let j;
  try {
    const res = await worker.fetch(new Request('https://w.test/health'), e, {});
    j = await res.json();
  } finally { globalThis.fetch = real; }
  assert.equal(j.search_budget.spent, 1800);
  assert.equal(j.search_budget.cap, 2000);
  assert.equal(j.search_budget.left, 200);
  assert.match(j.search_budget.second_query, /retired/);
  assert.equal(j.search_budget.scans_left, 200, 'single-query scans from here');
});

test('/health shows 1000 scans left on an untouched month, not 2000', async () => {
  const e = env();
  const real = globalThis.fetch;
  globalThis.fetch = stubFetch([]);
  let j;
  try {
    const res = await worker.fetch(new Request('https://w.test/health'), e, {});
    j = await res.json();
  } finally { globalThis.fetch = real; }
  assert.equal(j.search_budget.second_query, 'on');
  assert.equal(j.search_budget.scans_left, 1000,
    'two shapes per scan is 1,000 scans, and the health page should say so');
});
