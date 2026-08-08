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


/* ===========================================================================
   THE SOCIAL LAYER — comments, friends, groups, and the suspension that
   actually holds
   ===========================================================================
   WHY ANY OF THIS IS SERVER-SIDE. nova.js already has ncModerate() and
   ncSuspend(), and the comment at the top of that block is honest about the
   problem: a browser-only ban is cleared by wiping local storage. For a
   personal points total that does not matter. For something other people read,
   it is the whole ballgame — the one person you actually need to stop is
   exactly the one who will open dev tools.

   So the rules live here, where the user cannot reach them:

     - the word list is checked again on arrival, whatever the page sent
     - spam is measured from what the server saw, not what the client admits to
     - the suspension is a KV key against the account, so clearing the browser
       does nothing and a fresh browser with the same code is still suspended
     - every write checks it first

   The client keeps its copy of the check purely so the writer gets told before
   they press post. It is a courtesy, not a control.
=========================================================================== */

const SUSPEND_DAYS = 2;
const SUSPEND_MS = SUSPEND_DAYS * 24 * 60 * 60 * 1000;

const W_SWEAR = ['fuck','shit','bitch','asshole','bastard','dick','cunt','whore','slut','piss','wank','prick','fag','nigg'];
const W_ABUSE = ['kill yourself','kys','hate you','nobody likes you','retard','worthless','ugly','loser','moron','pathetic'];

/* Words that legitimately contain a banned one. Checked and removed FIRST,
   because the cost of a false positive here is a two-day suspension for
   somebody who typed "Scunthorpe" or "shiitake". This list is the difference
   between a filter and a trap, and it is meant to grow. */
const INNOCENT = ['scunthorpe','shiitake','shitake','cocktail','cockpit','cockney','peacock',
  'assignment','assassin','assess','assist','associate','assume','bass','class','glass','grass',
  'pass','mass','embarrass','compass','analysis','canal','dickens','dickinson','dictionary',
  'penistone','lightwater','clitheroe','arsenal','sussex','essex','middlesex','hancock',
  'butter','shuttle','titan','titanic','matsushita','damnation','crappie'];

/* Two foldings, because one cannot catch both cases. Collapsing a repeated
   letter to ONE turns "fuuuck" into "fuck" but also "book" into "bok";
   collapsing to TWO keeps "book" but leaves "shiiiit" as "shiit". Testing both
   catches the padding without mangling ordinary words. */
function foldBase(v) {
  return String(v || '').toLowerCase()
    .replace(/[3]/g, 'e').replace(/[1!|]/g, 'i').replace(/[0]/g, 'o')
    .replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/[7]/g, 't')
    .replace(/[^a-z]+/g, ' ')
    .trim();
}
function foldVariants(v) {
  let base = ' ' + foldBase(v) + ' ';
  INNOCENT.forEach(w => { base = base.split(w).join(' '); });
  return [base.replace(/(.)\1{2,}/g, '$1$1'), base.replace(/(.)\1+/g, '$1')];
}

/* Whole words only. A plain includes() finds a swear inside "classic" and
   "grasshopper". Three trailing letters are allowed so -s, -ed, -er and -ing
   all still land — "fucking" is the base word plus three, and capping at two
   let it straight through. Three is only safe because INNOCENT above is
   subtracted first: without it, "shitake" is "shit" plus three as well. */
function hitsWord(text, word) {
  if (word.includes(' ')) return text.includes(word);
  return new RegExp('(^| )' + word + '[a-z]{0,3}( |$)').test(text);
}

/* Someone spacing a word out — "f u c k". Only single letters standing alone
   are joined up, so ordinary sentences are never squashed into false hits. */
function spacedOut(v) {
  const m = foldBase(v).match(/\b(?:[a-z] ){2,}[a-z]\b/g);
  return m ? m.join(' ').replace(/ /g, '') : '';
}

function screen(text) {
  const vars = foldVariants(text);
  const spaced = spacedOut(text);
  const test = w => vars.some(v => hitsWord(v, w)) ||
                    (spaced && spaced.includes(w.replace(/ /g, '')) && w.replace(/ /g,'').length >= 4);
  for (const w of W_ABUSE) if (test(w)) return { ok: false, kind: 'abuse', hit: w };
  for (const w of W_SWEAR) if (test(w)) return { ok: false, kind: 'swear', hit: w };
  return { ok: true };
}

/* Spam, measured server-side. Three ways people flood a feed, all of them
   caught from what the server has actually stored rather than what the client
   claims. */
async function spamCheck(env, code, text) {
  const now = Date.now();
  const recent = (await env.DB.get('rate:' + code, 'json')) || [];
  const live = recent.filter(r => now - r.at < 60000);

  if (live.length >= 8) return { spam: true, why: 'more than eight posts in a minute' };
  const same = live.filter(r => r.t === text.slice(0, 80)).length;
  if (same >= 2) return { spam: true, why: 'the same message over and over' };
  if (/(.)\1{9,}/.test(text)) return { spam: true, why: 'a wall of one character' };
  const letters = text.replace(/[^a-z]/gi, '');
  if (letters.length > 14 && letters === letters.toUpperCase())
    return { spam: true, why: 'shouting in capitals' };

  live.push({ at: now, t: text.slice(0, 80) });
  await env.DB.put('rate:' + code, JSON.stringify(live.slice(-20)), { expirationTtl: 300 });
  return { spam: false };
}

async function suspendedFor(env, code) {
  const until = parseInt((await env.DB.get('susp:' + code)) || '0', 10);
  return until > Date.now() ? until : 0;
}

async function suspend(env, code, reason) {
  const until = Date.now() + SUSPEND_MS;
  /* The TTL is the suspension: KV drops the key when it expires, so nothing
     has to run a job to lift it. */
  await env.DB.put('susp:' + code, String(until),
    { expirationTtl: Math.ceil(SUSPEND_MS / 1000) + 60 });
  await env.DB.put('suspwhy:' + code, reason,
    { expirationTtl: Math.ceil(SUSPEND_MS / 1000) + 60 });
  return until;
}

/* Every write goes through this. Returns null when the caller may proceed, or
   a Response when they may not. */
async function gate(env, body) {
  const code = cleanCode(body.code || '');
  const key = String(body.key || '');
  if (!code || !key) return { stop: json({ error: 'sign in first' }, 401) };
  const owner = await env.DB.get('code:' + code);
  if (!owner || owner !== key) return { stop: json({ error: 'that code and key do not match' }, 403) };
  const until = await suspendedFor(env, code);
  if (until) return { stop: json({
    error: 'suspended', until,
    why: (await env.DB.get('suspwhy:' + code)) || 'community guidelines'
  }, 403) };
  return { code };
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


    // ---------- suspension status ----------
    if (path === '/me' && request.method === 'POST') {
      const code = cleanCode(body.code || '');
      const until = code ? await suspendedFor(env, code) : 0;
      return json({ ok: true, suspended: !!until, until,
                    why: until ? (await env.DB.get('suspwhy:' + code)) || '' : '' });
    }

    // ---------- comments ----------
    if (path === '/feed' && request.method === 'GET') {
      const room = (url.searchParams.get('room') || 'main').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'main';
      return json({ ok: true, room, posts: (await env.DB.get('feed:' + room, 'json')) || [] });
    }

    if (path === '/post' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const text = String(body.text || '').trim().slice(0, 400);
      if (!text) return json({ error: 'nothing to post' }, 400);

      /* The order matters. Screen BEFORE storing, so a banned message is never
         readable by anyone even for the second before it is removed. */
      const bad = screen(text);
      if (!bad.ok) {
        const until = await suspend(env, g.code,
          bad.kind === 'abuse' ? 'Abuse directed at someone' : 'Swearing in a comment');
        return json({ error: 'suspended', until, kind: bad.kind,
          why: 'That is not allowed here. Suspended for ' + SUSPEND_DAYS + ' days.' }, 403);
      }
      const sp = await spamCheck(env, g.code, text);
      if (sp.spam) {
        const until = await suspend(env, g.code, 'Spam: ' + sp.why);
        return json({ error: 'suspended', until, kind: 'spam',
          why: 'Spam — ' + sp.why + '. Suspended for ' + SUSPEND_DAYS + ' days.' }, 403);
      }

      const room = String(body.room || 'main').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'main';
      /* A group feed is only writable by its members, or a group is just a
         public room with a name on it. */
      if (room.startsWith('g-')) {
        const grp = await env.DB.get('grp:' + room.slice(2), 'json');
        if (!grp) return json({ error: 'no such group' }, 404);
        if (!grp.members.includes(g.code)) return json({ error: 'join the group first' }, 403);
      }
      const posts = (await env.DB.get('feed:' + room, 'json')) || [];
      posts.unshift({ id: randomFrom('abcdefghijkmnpqrstuvwxyz23456789', 10),
                      code: g.code, name: cleanName(body.name), face: String(body.face || '⭐').slice(0, 8),
                      text, at: Date.now() });
      await env.DB.put('feed:' + room, JSON.stringify(posts.slice(0, 120)));
      return json({ ok: true, posts: posts.slice(0, 120) });
    }

    if (path === '/post/delete' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const room = String(body.room || 'main').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'main';
      const posts = (await env.DB.get('feed:' + room, 'json')) || [];
      // you can delete your own; nobody else's
      const left = posts.filter(p => !(p.id === body.id && p.code === g.code));
      await env.DB.put('feed:' + room, JSON.stringify(left));
      return json({ ok: true, posts: left });
    }

    // ---------- friends ----------
    if (path === '/friends' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      return json({ ok: true,
        friends: (await env.DB.get('fr:' + g.code, 'json')) || [],
        requests: (await env.DB.get('frq:' + g.code, 'json')) || [] });
    }

    if (path === '/friends/add' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const them = cleanCode(body.friend || '');
      if (!them || them === g.code) return json({ error: 'that is not someone else\'s code' }, 400);
      if (!(await env.DB.get('code:' + them))) return json({ error: 'no account with that code' }, 404);

      /* A request, not an add. Being added to a stranger's friends list without
         agreeing is how a "friends" feature becomes a way to bother someone. */
      const theirQ = (await env.DB.get('frq:' + them, 'json')) || [];
      const mine = (await env.DB.get('fr:' + g.code, 'json')) || [];
      if (mine.some(f => f.code === them)) return json({ error: 'already friends' }, 400);
      if (theirQ.some(f => f.code === g.code)) return json({ ok: true, already: true });
      theirQ.push({ code: g.code, name: cleanName(body.name), face: String(body.face || '⭐').slice(0, 8), at: Date.now() });
      await env.DB.put('frq:' + them, JSON.stringify(theirQ.slice(-40)));
      return json({ ok: true, sent: true });
    }

    if (path === '/friends/accept' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const them = cleanCode(body.friend || '');
      const q = (await env.DB.get('frq:' + g.code, 'json')) || [];
      const req = q.find(f => f.code === them);
      if (!req) return json({ error: 'no request from them' }, 404);

      const mine = (await env.DB.get('fr:' + g.code, 'json')) || [];
      const theirs = (await env.DB.get('fr:' + them, 'json')) || [];
      if (!mine.some(f => f.code === them)) mine.push({ code: them, name: req.name, face: req.face, at: Date.now() });
      if (!theirs.some(f => f.code === g.code))
        theirs.push({ code: g.code, name: cleanName(body.name), face: String(body.face || '⭐').slice(0, 8), at: Date.now() });
      await env.DB.put('fr:' + g.code, JSON.stringify(mine.slice(-100)));
      await env.DB.put('fr:' + them, JSON.stringify(theirs.slice(-100)));
      await env.DB.put('frq:' + g.code, JSON.stringify(q.filter(f => f.code !== them)));
      return json({ ok: true, friends: mine });
    }

    if (path === '/friends/remove' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const them = cleanCode(body.friend || '');
      /* Removed from BOTH sides. A one-sided unfriend leaves the other person
         still seeing you on their list, which is worse than not having it. */
      const mine = ((await env.DB.get('fr:' + g.code, 'json')) || []).filter(f => f.code !== them);
      const theirs = ((await env.DB.get('fr:' + them, 'json')) || []).filter(f => f.code !== g.code);
      const q = ((await env.DB.get('frq:' + g.code, 'json')) || []).filter(f => f.code !== them);
      await env.DB.put('fr:' + g.code, JSON.stringify(mine));
      await env.DB.put('fr:' + them, JSON.stringify(theirs));
      await env.DB.put('frq:' + g.code, JSON.stringify(q));
      return json({ ok: true, friends: mine, requests: q });
    }

    // ---------- groups ----------
    if (path === '/groups' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const ids = (await env.DB.get('mygrp:' + g.code, 'json')) || [];
      const out = [];
      for (const id of ids) {
        const grp = await env.DB.get('grp:' + id, 'json');
        if (grp) out.push({ id, name: grp.name, members: grp.members.length, owner: grp.owner === g.code });
      }
      return json({ ok: true, groups: out });
    }

    if (path === '/groups/create' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const name = cleanName(body.groupName).slice(0, 24);
      if (!name) return json({ error: 'give it a name' }, 400);
      const bad = screen(name);
      if (!bad.ok) {
        const until = await suspend(env, g.code, 'Group name: ' + bad.kind);
        return json({ error: 'suspended', until, kind: bad.kind,
                      why: 'That name is not allowed. Suspended for ' + SUSPEND_DAYS + ' days.' }, 403);
      }
      const id = randomFrom('abcdefghijkmnpqrstuvwxyz23456789', 8);
      await env.DB.put('grp:' + id, JSON.stringify({ name, owner: g.code, members: [g.code], at: Date.now() }));
      const mine = (await env.DB.get('mygrp:' + g.code, 'json')) || [];
      mine.push(id);
      await env.DB.put('mygrp:' + g.code, JSON.stringify(mine.slice(-30)));
      return json({ ok: true, id, name });
    }

    if (path === '/groups/join' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const id = String(body.group || '').replace(/[^a-z0-9]/gi, '').slice(0, 8);
      const grp = await env.DB.get('grp:' + id, 'json');
      if (!grp) return json({ error: 'no group with that code' }, 404);
      if (grp.members.length >= 40) return json({ error: 'that group is full' }, 400);
      if (!grp.members.includes(g.code)) {
        grp.members.push(g.code);
        await env.DB.put('grp:' + id, JSON.stringify(grp));
      }
      const mine = (await env.DB.get('mygrp:' + g.code, 'json')) || [];
      if (!mine.includes(id)) { mine.push(id); await env.DB.put('mygrp:' + g.code, JSON.stringify(mine.slice(-30))); }
      return json({ ok: true, id, name: grp.name });
    }

    if (path === '/groups/leave' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const id = String(body.group || '').replace(/[^a-z0-9]/gi, '').slice(0, 8);
      const grp = await env.DB.get('grp:' + id, 'json');
      if (grp) {
        grp.members = grp.members.filter(m => m !== g.code);
        /* An empty group is deleted rather than left as a ghost somebody can
           still join by guessing the code. */
        if (!grp.members.length) await env.DB.delete('grp:' + id);
        else await env.DB.put('grp:' + id, JSON.stringify(grp));
      }
      const mine = ((await env.DB.get('mygrp:' + g.code, 'json')) || []).filter(x => x !== id);
      await env.DB.put('mygrp:' + g.code, JSON.stringify(mine));
      return json({ ok: true });
    }

    return json({ error: 'not found', endpoints: ['/account', '/account/resolve', '/save', '/board',
      '/me', '/feed', '/post', '/post/delete', '/friends', '/friends/add', '/friends/accept',
      '/friends/remove', '/groups', '/groups/create', '/groups/join', '/groups/leave'] }, 404);
  }
};
