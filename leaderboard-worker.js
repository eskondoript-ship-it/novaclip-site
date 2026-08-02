/* NovaClip — accounts, saves and the world leaderboard
   ============================================================================
   One Cloudflare Worker behind the whole site. It does two jobs:

     ACCOUNTS + SAVES   your points, skills, certificates, saved ideas and AI
                        history follow you to another device or another browser,
                        instead of living in one machine's localStorage.
     WORLD LEADERBOARD  scores from every player, which cannot exist in a
                        browser at all.

   HOW ACCOUNTS WORK, AND WHY THERE ARE NO PASSWORDS
     Your users are 13-18. Collecting emails and passwords from minors means
     storing personal data, handling resets, and a breach that matters — for a
     game that awards points. So there are none.

     On first sync the browser generates a random 32-character KEY and keeps it
     in localStorage. That key IS the account. The server also prints a short
     RECOVERY CODE (like NOVA-7K2P-9QF4) that maps to the same account, so
     signing in on a phone means typing nine characters, not remembering a
     password. Anyone holding the code holds the account — same as a Google Doc
     "anyone with the link" — which is the right trade for points and badges and
     the wrong one for anything you would be upset to lose. Say that plainly to
     your users rather than implying the save is protected.

     No email, no name required, no password, nothing that identifies a child.

   ENDPOINTS
     POST /account                  -> { key, code }         make a new account
     POST /account/resolve {code}   -> { key }               sign in with a code
     GET  /save?key=...             -> { data, at }          load progress
     POST /save {key, data}         -> { ok, at }            store progress
     GET  /board?map=&mode=         -> [ rows ]              top 25
     POST /board {name,kills,key?}  -> { ok, rank, board }   submit a run
                                    -> 409 if that name is another player's

   PUTTING IT ONLINE WITHOUT A COMMAND LINE
     1. dash.cloudflare.com -> Workers & Pages -> Create -> Worker -> Deploy
        (any name; "novaclip-server" is a good one)
     2. Edit code -> select everything in the editor -> paste this file -> Deploy
     3. Back on the Worker page: Settings -> Bindings -> Add -> KV namespace
          Variable name: DB
          KV namespace: Create new, call it novaclip
        Save, then Deploy again.
     4. Copy the worker's address (https://novaclip-server.<you>.workers.dev)
        and put it in TWO places:
          game.html   const LEADERBOARD_URL = '<address>/board';
          nova.js     const NC_SERVER      = '<address>';
     That is the whole setup. The free plan covers 100,000 requests a day.

   NOTES ON TRUST
     Anything a browser sends can be forged. This validates shape, clamps every
     number and rate-limits writes; it does not pretend to be cheat-proof, and a
     determined player can still POST a fake score. That is the right amount of
     effort for a fun board. Saves are per-key so one player cannot overwrite
     another's, and a save is capped at 64 KB.
   ============================================================================ */

const TOP_N = 25;                    // rows kept per map+mode
const WRITE_COOLDOWN_MS = 20000;     // one score per IP per 20s
const SAVE_COOLDOWN_MS = 3000;       // one save per key per 3s
const SAVE_MAX_BYTES = 64 * 1024;
const MODES = ['easy', 'medium', 'hard', 'ranked'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS }
  });

const clampInt = (v, lo, hi) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo;
};

const keyFor = (map, mode) => 'board:' + map + ':' + mode;

function cleanMap(v) {
  const s = String(v || 'arena').toLowerCase();
  return /^[a-z0-9_-]{1,16}$/.test(s) ? s : 'arena';
}
function cleanMode(v) {
  const s = String(v || 'medium').toLowerCase();
  return MODES.includes(s) ? s : 'medium';
}
function cleanName(v) {
  // strip control characters, so a name cannot smuggle in newlines or escapes
  const s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24);
  return s || 'Anonymous';
}

/* Keys and codes come from crypto.getRandomValues, never Math.random: a save key
   guessable from the clock is not a key. The code alphabet drops I, O, 0 and 1,
   because someone is going to read it off one screen and type it into another. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomFrom(alphabet, n) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
const newKey = () => randomFrom('abcdefghijklmnopqrstuvwxyz0123456789', 32);
const newCode = () => 'NOVA-' + randomFrom(CODE_ALPHABET, 4) + '-' + randomFrom(CODE_ALPHABET, 4);

const validKey = (v) => typeof v === 'string' && /^[a-z0-9]{32}$/.test(v);
const cleanCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  .replace(/^NOVA/, '').slice(0, 8);

async function rateLimited(env, bucket, ms) {
  const seen = await env.DB.get('rl:' + bucket);
  if (seen && Date.now() - Number(seen) < ms) return true;
  await env.DB.put('rl:' + bucket, String(Date.now()), { expirationTtl: 120 });
  return false;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.DB) return json({ error: 'KV namespace DB is not bound — see the setup notes at the top of this file' }, 500);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    let body = {};
    if (request.method === 'POST') {
      try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
    }

    // ---------- accounts ----------
    if (path === '/account' && request.method === 'POST') {
      if (await rateLimited(env, 'acct:' + ip, 10000)) return json({ error: 'slow down' }, 429);
      const key = newKey();
      let code = newCode(), tries = 0;
      // a collision here would hand someone else's save to a stranger
      while (await env.DB.get('code:' + cleanCode(code)) && tries++ < 5) code = newCode();
      await env.DB.put('code:' + cleanCode(code), key);
      await env.DB.put('save:' + key, JSON.stringify({ data: {}, at: Date.now() }));
      return json({ key, code });
    }

    if (path === '/account/resolve' && request.method === 'POST') {
      if (await rateLimited(env, 'resolve:' + ip, 2000)) return json({ error: 'slow down' }, 429);
      const code = cleanCode(body.code);
      if (code.length !== 8) return json({ error: 'that code does not look right' }, 400);
      const key = await env.DB.get('code:' + code);
      if (!key) return json({ error: 'no account with that code' }, 404);
      return json({ key });
    }

    // ---------- saves ----------
    if (path === '/save' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!validKey(key)) return json({ error: 'bad key' }, 400);
      const row = await env.DB.get('save:' + key, 'json');
      if (!row) return json({ error: 'no such save' }, 404);
      return json(row);
    }

    if (path === '/save' && request.method === 'POST') {
      const key = body.key;
      if (!validKey(key)) return json({ error: 'bad key' }, 400);
      if (await rateLimited(env, 'save:' + key, SAVE_COOLDOWN_MS)) return json({ error: 'slow down' }, 429);
      const existing = await env.DB.get('save:' + key);
      if (!existing) return json({ error: 'no such save' }, 404);
      const data = (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) ? body.data : {};
      const blob = JSON.stringify({ data, at: Date.now() });
      if (blob.length > SAVE_MAX_BYTES) return json({ error: 'save too big' }, 413);
      await env.DB.put('save:' + key, blob);
      return json({ ok: true, at: Date.now() });
    }

    // ---------- leaderboard ----------
    // (also answers on "/" so an older LEADERBOARD_URL without /board keeps working)
    if (path === '/board' || path === '/') {
      if (request.method === 'GET') {
        const map = cleanMap(url.searchParams.get('map'));
        const mode = cleanMode(url.searchParams.get('mode'));
        return json((await env.DB.get(keyFor(map, mode), 'json')) || []);
      }
      if (request.method === 'POST') {
        if (await rateLimited(env, 'board:' + ip, WRITE_COOLDOWN_MS)) return json({ error: 'slow down' }, 429);

        /* ---- A NAME BELONGS TO ONE ACCOUNT ----
           The board keys rows by name, so without this two people called
           "MrBeast" are the same row and the second one overwrites the first.
           Worse, a name here is usually a real YouTube channel title — the game
           fills it in from the connected channel — so anyone could type a
           creator's channel name and post scores as them.

           So a name is claimed the first time it is used and bound to the
           account key that claimed it. After that, only that account may post
           under it. Nobody has to register anything: the first person to play
           under a name owns it, and a creator who connects their channel owns
           their channel's name from their first match.

           A player with no account key can still post, but only under a name
           nobody has claimed — which is the honest trade for not signing in. */
        const claimant = validKey(body.key) ? body.key : null;
        const wanted = cleanName(body.name);
        const nameKey = 'name:' + wanted.toLowerCase();
        const owner = await env.DB.get(nameKey);
        if (owner && owner !== claimant) {
          return json({ error: 'the name "' + wanted + '" belongs to another player', taken: true }, 409);
        }
        if (!owner) await env.DB.put(nameKey, claimant || 'anon:' + ip);

        const run = {
          name:   wanted,
          kills:  clampInt(body.kills, 0, 9999),
          deaths: clampInt(body.deaths, 0, 9999),
          pts:    clampInt(body.pts, 0, 999999),
          mode:   cleanMode(body.mode),
          won:    !!body.won,
          at:     Date.now()                       // server time, never the client's
        };
        const k = keyFor(cleanMap(body.map), run.mode);
        const rows = (await env.DB.get(k, 'json')) || [];
        rows.push(run);
        // one row per name: a player's entry is their best run, not every run
        const best = new Map();
        for (const r of rows) {
          const cur = best.get(r.name);
          if (!cur || r.kills > cur.kills) best.set(r.name, r);
        }
        const top = [...best.values()].sort((a, b) => b.kills - a.kills || b.pts - a.pts).slice(0, TOP_N);
        await env.DB.put(k, JSON.stringify(top));
        const rank = top.findIndex(r => r.name === run.name && r.at === run.at) + 1;
        return json({ ok: true, rank: rank || null, board: top });
      }
    }

    return json({ error: 'not found', endpoints: ['/account', '/account/resolve', '/save', '/board'] }, 404);
  }
};
