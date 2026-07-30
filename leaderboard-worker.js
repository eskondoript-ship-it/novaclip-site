/* NovaClip — world leaderboard
   ============================================================================
   A complete Cloudflare Worker for the Strike Arena world board. The game keeps
   its local board in the browser on its own; this is the part that needs a server,
   because scores from other players cannot live in your localStorage.

   WHAT IT DOES
     GET  /?map=arena&mode=medium   -> top 25 runs for that map + difficulty
     POST /  {name,kills,deaths,pts,map,mode,won,at}
                                    -> stores the run, keeps the best 25

   HOW TO PUT IT ONLINE (free tier is plenty)
     1. npm install -g wrangler          (once)
     2. wrangler login
     3. Save this file as src/index.js in a new folder, next to the wrangler.toml
        printed at the bottom of this file.
     4. wrangler kv namespace create SCORES
        Paste the id it prints into wrangler.toml.
     5. wrangler deploy
     6. Copy the https://novaclip-scores.<you>.workers.dev URL it prints, and set
            const LEADERBOARD_URL = 'https://novaclip-scores.<you>.workers.dev';
        near the top of the game.html script block. That is the only game change.

   NOTES ON TRUST
     Anything a browser sends can be forged — this is a fun board, not a bank, so
     it validates shape and clamps ranges rather than pretending to be
     cheat-proof. Names are capped at 24 characters and stored as plain text; the
     game escapes them before display. There is a per-IP write cooldown so one
     person cannot flood the list, and a hard cap on stored entries per board.
   ============================================================================ */

const TOP_N = 25;                  // entries kept per map+mode
const WRITE_COOLDOWN_MS = 20000;   // one score per IP per 20s
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

// one KV key per board, so a busy map never has to read anyone else's rows
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.SCORES) return json({ error: 'SCORES KV namespace is not bound — see wrangler.toml' }, 500);

    const url = new URL(request.url);

    if (request.method === 'GET') {
      const map = cleanMap(url.searchParams.get('map'));
      const mode = cleanMode(url.searchParams.get('mode'));
      const rows = (await env.SCORES.get(keyFor(map, mode), 'json')) || [];
      return json(rows);
    }

    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const seen = await env.SCORES.get('ip:' + ip);
      if (seen && Date.now() - Number(seen) < WRITE_COOLDOWN_MS) {
        return json({ error: 'slow down' }, 429);
      }

      const run = {
        name:   cleanName(body.name),
        kills:  clampInt(body.kills, 0, 9999),
        deaths: clampInt(body.deaths, 0, 9999),
        pts:    clampInt(body.pts, 0, 999999),
        mode:   cleanMode(body.mode),
        won:    !!body.won,
        at:     Date.now()                       // server time, never the client's
      };
      const map = cleanMap(body.map);
      const key = keyFor(map, run.mode);

      const rows = (await env.SCORES.get(key, 'json')) || [];
      rows.push(run);
      // one row per name: a player's board entry is their best run, not every run
      const best = new Map();
      for (const r of rows) {
        const cur = best.get(r.name);
        if (!cur || r.kills > cur.kills) best.set(r.name, r);
      }
      const top = [...best.values()].sort((a, b) => b.kills - a.kills || b.pts - a.pts).slice(0, TOP_N);

      await env.SCORES.put(key, JSON.stringify(top));
      await env.SCORES.put('ip:' + ip, String(Date.now()), { expirationTtl: 60 });

      const rank = top.findIndex(r => r.name === run.name && r.at === run.at) + 1;
      return json({ ok: true, rank: rank || null, board: top });
    }

    return json({ error: 'use GET or POST' }, 405);
  }
};

/* ----------------------------------------------------------------------------
wrangler.toml — save this next to src/index.js

  name = "novaclip-scores"
  main = "src/index.js"
  compatibility_date = "2026-01-01"

  [[kv_namespaces]]
  binding = "SCORES"
  id = "paste-the-id-from-wrangler-kv-namespace-create"

---------------------------------------------------------------------------- */
