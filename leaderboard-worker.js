/* NovaClip — accounts, saves and the world leaderboard
   ============================================================================
   THERE ARE TWO WORKERS. THIS IS NOT THE AI ONE.

     THIS FILE        accounts, saves, leaderboard, community.
                      Needs a KV binding called DB.
                      Its address goes in nova.js -> NC_SERVER.

     ai-worker.js     the only thing that talks to Gemini.
                      Needs a secret called GEMINI_API_KEY.
                      Its address goes in nova.js -> NC_AI_WORKER.

   They are not interchangeable. Pasting this file into the AI worker makes
   every AI request answer 500 with "KV namespace DB is not bound", because the
   check below runs before any routing and this file has no AI code in it. If
   that is the error you are chasing, you want ai-worker.js instead.
   ============================================================================
   One Cloudflare Worker behind the whole site. It does two jobs:

     ACCOUNTS + SAVES   your points, skills, certificates, saved ideas and AI
                        history follow you to another device or another browser,
                        instead of living in one machine's localStorage.
     WORLD LEADERBOARD  scores from every player, which cannot exist in a
                        browser at all.

   HOW ACCOUNTS WORK
     On first sync the browser generates a random 32-character KEY and keeps it
     in localStorage. That key IS the account. The server also prints a short
     RECOVERY CODE (like NOVA-7K2P-9QF4) that maps to the same account, so
     signing in on a phone means typing nine characters. Anyone holding the
     code holds the account — same as a Google Doc "anyone with the link" —
     which is the right trade for points and badges and the wrong one for
     anything you would be upset to lose. Say that plainly to your users
     rather than implying the save is protected.

     A PROFILE IS OPTIONAL, ON TOP OF THAT
     A username and password can be added to an existing account. It is a
     second way in, not a second account and not a stronger one: it resolves
     to the same key the code does.

     Still no email and nothing that identifies a child. The password itself
     never reaches this worker — the browser derives it through 600,000 rounds
     of PBKDF2 first, for reasons set out beside PBKDF2_ROUNDS below, and what
     arrives is the output.

   ENDPOINTS
     POST /account                  -> { key, code }         make a new account
     POST /account/resolve {code}   -> { key }               sign in with a code
     GET  /account/salt?u=          -> { salt, rounds }      before deriving
     POST /account/register         -> { key, code }         add a username
     POST /account/login            -> { key }               sign in with one
     POST /account/password         -> { ok }                change it
     GET  /save?key=...             -> { data, at }          load progress
     POST /save {key, data}         -> { ok, at }            store progress
     GET  /board?map=&mode=         -> [ rows ]              top 25
     POST /board {name,kills,key?}  -> { ok, rank, board }   submit a run
                                    -> 409 if that name is another player's
     POST /cert/issue {key,tier,name} -> { serial, issued }  sign a certificate
     GET  /cert/verify?c=            -> { valid, name, tier } check one

   PUTTING IT ONLINE WITHOUT A COMMAND LINE
     1. dash.cloudflare.com -> Workers & Pages -> Create -> Worker -> Deploy
        (any name; "novaclip-server" is a good one)
     2. Edit code -> select everything in the editor -> paste this file -> Deploy
     3. Back on the Worker page: Settings -> Bindings -> Add -> KV namespace
          Variable name: DB
          KV namespace: Create new, call it novaclip
        Save, then Deploy again.
     4. Check it before wiring it up: open <address>/health in a browser. It
        answers { worker: "leaderboard", db: "bound" } when this file is the
        one deployed here and the binding exists. If it says worker: "ai" you
        have deployed ai-worker.js at this address; if db is MISSING, step 3
        did not take.
     5. Copy the worker's address (https://novaclip-server.<you>.workers.dev)
        into ONE place:
          nova.js     const NC_SERVER = '<address>';
        To try it on your own machine first, without re-pasting nova.js, run
        this in the browser console on the site — it wins over NC_SERVER for
        that browser only:
          localStorage.setItem('nc_server', '<address>')
     That is the whole setup. The free plan covers 100,000 requests a day.

     (There used to be a second place, LEADERBOARD_URL in game.html. That was
     the arena game's own board and the game is no longer in the site, so
     NC_SERVER is the only setting now.)

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

/* ---- USERNAMES AND PASSWORDS ---------------------------------------------
   Added because they were asked for. The code-only account above still works
   and is still what an account without a profile uses — this sits beside it,
   it does not replace it. A registered account gets a code too, because a
   forgotten password with nothing behind it is an account nobody can reach.

   THE PASSWORD NEVER ARRIVES HERE

   The browser runs PBKDF2-SHA256 over the password 600,000 times and sends
   the 32 bytes that come out. This worker never sees the password itself, in
   a request body or a log line or anywhere else.

   That is not only a nicety. Cloudflare Workers get 10ms of CPU per request
   on the free plan, and 600,000 rounds of PBKDF2 is comfortably more than
   that — a server-side KDF here would either be killed mid-request or be
   turned down to an iteration count too low to be worth running. Moving it to
   the browser buys the full work factor on hardware that has time to spare,
   at the cost of half a second on the sign-in button.

   What is stored is SHA-256 over those bytes with the salt again. Fast, which
   is the point — it has to fit in the CPU budget — and safe to be fast,
   because the value it hashes is already the output of 600,000 rounds. An
   attacker holding this database still has to run the full PBKDF2 for every
   password they want to guess.

   WHAT IT IS NOT

   It is not a second factor, and it is not proof of who anybody is. Password
   plus username gets you the same 32-character key the code does. Say that to
   users rather than letting a password imply a protection it does not add. */
const PBKDF2_ROUNDS = 600000;
const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._-]{1,18}[a-z0-9])$/;
const cleanUser = (v) => String(v || '').trim().toLowerCase();
const validUser = (v) => USERNAME_RE.test(v);
/* 64 hex characters: the browser sends PBKDF2 output, nothing else. */
const validAuth = (v) => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);

const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(str) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)));
}

/* The salt a browser needs before it can derive anything — which means it has
   to be handed out BEFORE anyone has proved who they are.

   For a real account it is that account's stored salt. For a username nobody
   has taken it is HMAC(pepper, username): stable, so asking twice gives the
   same answer, and indistinguishable from a real one. Without that, "does
   this username exist" is a single unauthenticated request, and on a site
   whose users are mostly teenagers a list of who has an account here is
   exactly the thing not to publish.

   PEPPER is a Worker secret. With none set this still works and still hands
   out stable salts — it just uses a constant, so the fake salts are derivable
   by anybody with this file. /health says so out loud rather than leaving it
   to be discovered. */
async function saltFor(env, user) {
  const row = await env.DB.get('user:' + user, 'json');
  if (row && row.salt) return { salt: row.salt, rounds: row.rounds || PBKDF2_ROUNDS, real: true };
  const pepper = (env && env.PEPPER) || 'novaclip-unpeppered';
  return { salt: (await sha256Hex(pepper + '|salt|' + user)).slice(0, 32),
           rounds: PBKDF2_ROUNDS, real: false };
}

/* Compared byte by byte with no early return. A === on hex strings can stop at
   the first wrong character, and the time that takes is a hint. */
function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const validKey = (v) => typeof v === 'string' && /^[a-z0-9]{32}$/.test(v);
const cleanCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  .replace(/^NOVA/, '').slice(0, 8);

/* ---- WHO OWNS A NAME ------------------------------------------------------
   A name is claimed by whoever first posts under it, and after that only they
   may use it. Without that, the boards key rows by name and anybody can
   overwrite anybody — including by typing a real YouTube channel's title.

   THE BUG THIS REPLACES, BECAUSE IT IS WORTH REMEMBERING

   The claim was stored as `claimant || 'anon:' + ip` and then compared against
   `claimant` — which is null for anybody without an account key. So the stored
   owner was "anon:1.2.3.4" and the next comparison was against null, they were
   not equal, and the answer was 409.

   An anonymous player could post exactly ONE score under a name, ever, and was
   then locked out of their own name with "that name belongs to another
   player". It had been live on the arena board the whole time. A test that
   posted the same three names to a second game is what surfaced it.

   Now the anonymous identity is the thing compared, not null. And somebody who
   played anonymously and later signs in keeps their name rather than losing it
   to their own earlier self — the claim upgrades from the IP to the account
   key when the same IP presents one. */
/* `who` is the hashed visitor tag; `rawIp` is passed ONLY to recognise records
   written by the version of this worker that stored the address itself, and is
   never written anywhere. See the legacy branch below.

   An anonymous hold on a name now lapses. A name claimed from a browser with no
   account is somebody who may never come back, and holding their address hash
   against that name forever — to keep a stranger off a word — is storing data
   about a child for no reason that survives being said out loud. Ninety days is
   long enough to cover a school term's worth of returning to a game. A hold
   backed by an actual account does not expire, because that record is the
   account key they already gave us. */
const ANON_NAME_TTL = 90 * 24 * 60 * 60;

async function nameOwner(env, name, key, who, rawIp) {
  const nameKey = 'name:' + String(name).toLowerCase();
  const mine = validKey(key);
  const claimant = mine ? key : 'anon:' + who;
  const owner = await env.DB.get(nameKey);

  if (!owner) {
    await env.DB.put(nameKey, claimant, mine ? {} : { expirationTtl: ANON_NAME_TTL });
    return { ok: true };
  }
  if (owner === claimant) return { ok: true };

  /* LEGACY RECORDS, UPGRADED IN PLACE RATHER THAN BROKEN.
     Every name claimed before this change is stored as 'anon:<the address>'.
     Left alone, the hashed tag would not match it and the rightful holder would
     be told their own name belongs to another player — the exact bug the comment
     above this function describes, reintroduced by the fix for it. So the old
     form is recognised once, and immediately rewritten to the hash (or to the
     account key), which also means the stored addresses drain out of KV as
     people come back rather than sitting there until someone remembers. */
  if (owner === 'anon:' + rawIp) {
    await env.DB.put(nameKey, claimant, mine ? {} : { expirationTtl: ANON_NAME_TTL });
    return { ok: true };
  }

  // an anonymous claim from this same visitor, now with an account behind it
  if (mine && owner === 'anon:' + who) {
    await env.DB.put(nameKey, key);
    return { ok: true };
  }
  return { ok: false };
}

/* ---------------------------------------------------------------------------
   THE VISITOR TAG, AND WHY THE RAW ADDRESS STOPPED BEING STORED
   ---------------------------------------------------------------------------
   This worker used to write 'anon:' + the caller's IP address straight into KV:
   as the owner of a claimed leaderboard name, with no expiry, and as part of
   every rate-limit key. An IP address is personal data, these are mostly
   children's, and privacy.html said in as many words that what the server holds
   is "nothing that identifies you". That was not true, and a policy that has
   drifted from the software is the one kind of policy that is worse than none.

   So the address is now hashed the moment it arrives and only the hash is
   stored. The hash is keyed with the same PEPPER secret saltFor() uses, so
   without that secret it cannot be walked back to an address even by somebody
   holding the whole KV namespace — and with it, the same visitor still produces
   the same tag, which is all the two callers actually needed.

   Truncated to 24 hex characters: 96 bits, far past collision territory for the
   number of people who will ever play this, and short enough to read in a KV
   listing when something is being debugged.
   --------------------------------------------------------------------------- */
async function visitorHash(env, ip) {
  const pepper = (env && env.PEPPER) || 'novaclip-unpeppered';
  return (await sha256Hex(pepper + '|visitor|' + String(ip || 'unknown'))).slice(0, 24);
}

async function rateLimited(env, bucket, ms) {
  const seen = await env.DB.get('rl:' + bucket);
  if (seen && Date.now() - Number(seen) < ms) return true;
  await env.DB.put('rl:' + bucket, String(Date.now()), { expirationTtl: 120 });
  return false;
}


/* ===========================================================================
   CERTIFICATES THAT CANNOT BE FAKED BY TYPING ONE
   ===========================================================================
   A certificate is a Word file or a PDF, and anybody can edit one. Nothing
   printed on a document can stop that — not a watermark, not a password on
   the file, not a pattern behind the text. What CAN be done is to make a
   forgery fail the moment somebody checks it, and that is what this is.

   HOW IT WORKS

   The number on a certificate is not a serial anybody can invent: it is
   HMAC-SHA256 over the holder’s name, the tier and the date of issue, keyed
   with a secret that exists only on this worker. Change the name on the
   document and the number no longer matches it. Invent a number and it belongs
   to nobody. Neither can be worked out from the certificate, from this file,
   or from anything in the browser, because the key is not in any of them.

   Anyone — a parent, a school, an employer — reads the number off the
   certificate, types it into novaclip.org/verify.html (or scans the QR code,
   which goes to the same place) and gets back the name, the tier and the date
   that number was issued against. If those do not match the document in their
   hand, the document is not ours.

   WHAT IT DOES NOT CLAIM

   It does not stop anybody printing a copy of a REAL certificate — a copy of
   a genuine credential is genuine, and that is as true of a degree as it is of
   this. It does not prove the person holding it is the person named on it;
   nothing about a paper certificate ever has. And the requirements below are
   checked against this account’s own saved progress, which the browser wrote,
   so it proves what NovaClip recorded rather than what a child actually did.
   Said plainly because the alternative is implying a guarantee that is not
   there.

   THE SECRET
   Settings -> Variables and Secrets -> Add -> Secret, called CERT_SECRET, any
   long random string. Without it this worker refuses to issue rather than
   signing with a default, because a signature everybody can compute is not a
   signature — /health says which state it is in.

   SET IT ONCE AND DO NOT CHANGE IT. Every number already issued was derived
   from the key that was in place at the time, and verification recomputes it:
   replace the key and every certificate ever issued stops verifying, with no
   way to re-sign the documents already in people's hands. That is true of any
   signing key and it is worth knowing before rather than after. If it is ever
   genuinely compromised, changing it IS the right move — it invalidates the
   forgeries too — but it is a decision about every certificate at once.
   ========================================================================== */

/* The same three tiers nova.js checks in CERT_REQS, and the same numbers.
   DUPLICATED ON PURPOSE AND A RISK WORTH NAMING: the browser decides when to
   ASK for a certificate, this file decides whether to SIGN one, and a copy
   that cannot be edited from the browser is the whole point. If a requirement
   changes in nova.js it has to change here too, or a learner meets the new bar
   and is refused at the door. */
const CERT_TIERS = {
  'Basic Certificate': {
    code: 'BA', pts: 150,
    skills: { yt_connect: 1, edit_export: 3, trend_scan: 3, ai_ask: 5, idea_save: 2, focus: 1 }
  },
  'Advanced Certificate': {
    code: 'AD', pts: 600,
    skills: { yt_connect: 1, edit_export: 10, trend_scan: 10, idea_save: 5, analytics: 5,
              ai_ask: 15, focus: 3, editing: 3, community: 1, reaction: 1 }
  },
  'Master Certificate': {
    code: 'MA', pts: 1500,
    skills: { yt_connect: 1, edit_export: 25, trend_scan: 20, idea_save: 15, analytics: 15,
              ai_ask: 30, focus: 8, editing: 10, community: 3, reaction: 3, aim: 3, fair_fight: 1 }
  }
};
const CERT_BY_CODE = { BA: 'Basic Certificate', AD: 'Advanced Certificate', MA: 'Master Certificate' };

/* A name is printed on a credential, so it is cleaned hard: no control
   characters, no markup, 48 characters, and nothing that could be mistaken for
   a second line. */
function cleanHolder(v) {
  const s = String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48);
  return s || 'NOVACLIP CREATOR';
}

async function hmacHex(secret, msg) {
  const k = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg)));
}

/* NC-BA-XXXX-XXXX-XXXX. Twelve characters of the signature in the same
   alphabet the recovery codes use — no I, O, 0 or 1, because somebody is
   going to read this off a printed page and type it into a phone. Sixty bits,
   which is not guessable, and every character of it comes from the key. */
function certSerial(tierCode, sigHex) {
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += CODE_ALPHABET[parseInt(sigHex.slice(i * 2, i * 2 + 2), 16) % CODE_ALPHABET.length];
  }
  return 'NC-' + tierCode + '-' + out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8, 12);
}
function cleanSerial(v) {
  const s = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = s.match(/^NC(BA|AD|MA)([A-Z0-9]{12})$/);
  return m ? 'NC-' + m[1] + '-' + m[2].slice(0, 4) + '-' + m[2].slice(4, 8) + '-' + m[2].slice(8, 12) : '';
}

/* What is still missing for a tier, read from the account's own saved
   progress. Returns [] when the certificate is earned. */
function certMissing(data, tier) {
  const req = CERT_TIERS[tier];
  const miss = [];
  const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; };
  const life = Math.max(num((data || {}).nc_points_lifetime), num((data || {}).nc_points));
  if (life < req.pts) miss.push({ what: 'points', have: life, need: req.pts });
  let skills = {};
  try { skills = JSON.parse((data || {}).nc_skills || '{}') || {}; } catch (e) {}
  for (const id in req.skills) {
    const got = num(skills[id]);
    if (got < req.skills[id]) miss.push({ what: id, have: got, need: req.skills[id] });
  }
  return miss;
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
  /* TOO YOUNG TO BE HERE AT ALL. Checked in the one place every write already
     passes through, so there is no endpoint to remember to protect and no new
     browser to start again in: the account is barred, wherever it signs in. */
  const minor = await env.DB.get('minor:' + code, 'json');
  if (minor && minor.blocked) {
    return { stop: json({ error: 'under-13', why: 'NovaClip is for 13 and over' }, 403) };
  }
  return { code };
}


/* ===========================================================================
   THE ACADEMY — teenagers selling what they know to other teenagers
   ===========================================================================
   A marketplace where a young creator sells a lesson pack and another one buys
   it. The rules below are the whole point of the feature living on the server
   rather than in the page: a page can be edited by whoever is looking at it,
   and these are the rules that keep a child-to-child marketplace lawful.

   WHO MAY SELL
     · an account in good standing (not suspended), and
     · a NovaClip certificate on that account — the credential is the supply
       filter, so teaching is something earned rather than switched on, and
     · a parent on file who has turned earning on for this child and named
       themselves as the person the money goes to.

   WHAT MAY BE SOLD
     Work, not time. A lesson pack is a thing somebody made, delivered when it
     is bought. There is no scheduling, no call, no private channel between two
     children, and therefore no session for anybody to be harmed in. That is a
     deliberate choice and not a limitation to be lifted quietly later.

   MONEY AND AGE
     Under 16 an account may publish, but the price is forced to zero and it
     earns NovaCoins instead. Portugal sets the working age at 16 and the
     customer being a child does not change the seller's position. Over 16 a
     price is allowed, and it is paid to the PARENT's account — a minor cannot
     hold a payout account at any processor we could use, and cannot sign the
     contract that would let them.

   WHAT THIS FILE DOES NOT DO
     It does not move money. There is no payout processor wired in and the buy
     endpoint says so in plain words rather than pretending. Orders are
     recorded so that the day one is connected, the history is already there.
   ========================================================================= */
/* ===========================================================================
   COINS THAT COST MONEY, A FEE, AND PROVING AN AGE
   ===========================================================================
   THE WALLET MOVED, AND IT HAD TO. NovaCoins were earned and kept in the
   browser, in nc_points, which was fine while they were a score. The moment
   they can be bought with a card they are money, and money in localStorage is
   a number anybody can edit from the console. Bought coins and anything spent
   in the Academy therefore live here, where the client cannot reach them.
   Earned coins stay where they are — forging a score is cheating at a game,
   forging a balance is theft from whoever gets paid out of it.

   THE FEE. NovaClip keeps ACADEMY_FEE of what a lesson sells for and the
   seller keeps the rest. It is applied where the sale happens and recorded on
   the order, so the number on the seller's page is arithmetic they can check
   rather than a figure we assert.

   PROVING SIXTEEN. A face scan is the right instinct and the wrong thing to
   build ourselves. A photograph of a child's face is biometric data: special
   category under GDPR Article 9, and storing one of a fifteen-year-old to
   prove they are not fifteen is a liability nobody here can carry. Doing the
   estimate in the browser instead is worse — it is a number the browser
   reports, and a browser can report anything.

   So this file never sees a face. AGE_PROVIDER names a certified age
   assurance service; the scan happens there, and what comes back is a signed
   statement that this account cleared the threshold. What is stored is a
   boolean, a date and the provider's reference. No image, no estimate, no
   face. Without a provider configured nobody passes, and nobody may charge
   money — which is the correct failure, because the alternative is trusting
   the page.
   ========================================================================= */
/* ===========================================================================
   THE PARENT'S RULES, AND THE UNDER-13 DOOR
   ===========================================================================
   Both of these already existed and both lived in one browser. The age gate
   was a careful piece of work — a neutral wheel that hints nothing, no retry
   button, a report form instead of a way back in — and it was all kept in
   localStorage, which a twelve-year-old defeats by opening a private window.
   The parent's PIN and limits were the same: real on the laptop they were set
   on and absent on the phone.

   So the rules moved to the account. An account carries them to every device
   it signs in on, and the worker refuses to act for an account that is barred
   — not as a second line of defence behind the page, but as the only line
   that cannot be edited by the person it applies to.

   THE PIN IS WHAT MAKES A PARENT A PARENT. There is no separate parent login
   here and inventing one would mean asking families to keep another password.
   What the worker holds is a hash of the PIN the parent already set. Changing
   a rule needs it; reading the rules does not. A child who knows the PIN can
   undo their own limits, which was true before any of this and is a thing to
   tell parents plainly rather than pretend away.
   ========================================================================= */
const MIN_AGE = 13;
const LOCKABLE = ['ai', 'academy', 'games', 'community', 'editor'];

function cleanRules(v) {
  const r = v && typeof v === 'object' ? v : {};
  const mins = parseInt(r.dailyMinutes, 10);
  const hour = (h) => {
    const n = parseInt(h, 10);
    return Number.isFinite(n) && n >= 0 && n <= 23 ? n : null;
  };
  const locks = {};
  LOCKABLE.forEach(k => { locks[k] = !!(r.locks && r.locks[k]); });
  return {
    dailyMinutes: Number.isFinite(mins) && mins > 0 ? Math.min(600, mins) : 0,
    quietFrom: hour(r.quietFrom),
    quietTo: hour(r.quietTo),
    locks,
    at: Date.now()
  };
}

const ACADEMY_FEE = 0.20;              /* NovaClip's share of a sale */

/* HOW MUCH OF A PRICE COINS MAY COVER.
   Coins can be bought, so letting them pay for a whole lesson would make the
   Academy a shop that sells its own currency to buy its own stock — and would
   let somebody with a card skip the part where a lesson is earned. Four tenths
   is the share: enough that saved coins visibly take money off the price,
   not enough that the money stops mattering.

   A lesson priced only in coins — which is what every seller under the working
   age has — is untouched by this. There is no money in that sale to split. */
const COIN_SHARE = 0.40;
const COINS_PER_EUR = 100;             /* the floor rate; the packs beat it in bulk */

/* What a priced lesson actually costs, split. Returned to the page so the
   split is shown before anybody commits, and recomputed on the server when
   they do, because a price the client worked out is a price the client chose. */
function priceSplit(price, haveCoins) {
  const coinPart = Math.round(price * COIN_SHARE * COINS_PER_EUR);
  const useCoins = Math.max(0, Math.min(coinPart, Math.floor(haveCoins || 0)));
  const money = Math.max(0, Math.round((price - useCoins / COINS_PER_EUR) * 100) / 100);
  return { price, coinPart, useCoins, money, shortCoins: coinPart - useCoins };
}
const COIN_PACKS = [
  { id: 'c300',  coins: 300,  eur: 2.99 },
  { id: 'c800',  coins: 800,  eur: 6.99 },
  { id: 'c2000', coins: 2000, eur: 14.99 }
];

async function wallet(env, code) {
  return (await env.DB.get('wal:' + code, 'json')) ||
         { bal: 0, bought: 0, earned: 0, spent: 0 };
}
async function walletPut(env, code, w) {
  await env.DB.put('wal:' + code, JSON.stringify(w));
  return w;
}

/* Whether this account has cleared the age threshold, and how. */
async function ageProof(env, code) {
  const row = await env.DB.get('age:' + code, 'json');
  return row && row.ok ? row : null;
}

/* ===========================================================================
   STARS, LEVELS, AND WHAT A TEACHER MAY CHARGE
   ===========================================================================
   A marketplace where anybody may ask twenty euros on their first day is a
   marketplace nobody trusts twice. So the price a teacher may set is earned,
   the same way the right to teach at all is earned, and it is earned from the
   only thing that is evidence: people who bought a lesson saying whether it
   was any good.

   ONLY BUYERS RATE, AND ONLY ONCE. A rating from somebody who never had the
   lesson is not information. A rating that can be repeated is a vote counted
   twice. Both are checked here rather than in the page, because a page is
   something anybody can edit.

   THE LEVELS ARE DELIBERATELY SLOW. Three sales and a decent average gets a
   new teacher to six euros; fifty sales at four and a half stars is what
   twenty takes. A level that arrives quickly is a level that means nothing,
   and the number it unlocks is what somebody else pays.
   ========================================================================= */
const TEACH_LEVELS = [
  { id: 0, name: 'New teacher',    sales: 0,  stars: 0,   maxPrice: 3  },
  { id: 1, name: 'Rated teacher',  sales: 3,  stars: 3.5, maxPrice: 6  },
  { id: 2, name: 'Trusted teacher',sales: 15, stars: 4.0, maxPrice: 12 },
  { id: 3, name: 'Master teacher', sales: 50, stars: 4.5, maxPrice: 20 }
];

async function teacherStats(env, code) {
  const t = (await env.DB.get('tstats:' + code, 'json')) || { sales: 0, sum: 0, n: 0 };
  const avg = t.n ? Math.round((t.sum / t.n) * 10) / 10 : 0;
  /* A teacher with no ratings yet is level 0 whatever their sales say: the
     level is a statement about how it went, not about how much was shifted. */
  let level = TEACH_LEVELS[0];
  for (const L of TEACH_LEVELS) {
    if (t.sales >= L.sales && (L.stars === 0 || avg >= L.stars)) level = L;
  }
  const next = TEACH_LEVELS[level.id + 1] || null;
  return {
    sales: t.sales, ratings: t.n, stars: avg,
    level: level.id, levelName: level.name, maxPrice: level.maxPrice,
    next: next ? { name: next.name, sales: next.sales, stars: next.stars, maxPrice: next.maxPrice,
                   salesToGo: Math.max(0, next.sales - t.sales) } : null
  };
}

function cleanStars(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0;
}

const ACADEMY_CATS = ['editing', 'thumbnails', 'titles', 'growth', 'filming', 'sound', 'other'];
const ACADEMY_LEVELS = ['starter', 'getting-there', 'advanced'];
const ACADEMY_MAX_PRICE = 20;          /* euros. A lesson pack, not a course. */
const ACADEMY_WORK_AGE = 16;           /* below this: coins, never cash */
const ACADEMY_MAX_LISTINGS = 12;       /* per account, so nobody floods the shelf */

const cleanLine = (v, n) => String(v == null ? '' : v)
  .replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const cleanText = (v, n) => String(v == null ? '' : v)
  .replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n').trim().slice(0, n);
const cleanCat = (v) => ACADEMY_CATS.includes(String(v)) ? String(v) : 'other';
const cleanLevel = (v) => ACADEMY_LEVELS.includes(String(v)) ? String(v) : 'starter';

/* An age band, never a birthday. The Academy needs to know which side of the
   working age somebody is and nothing else, so that is all that is stored. */
function cleanAge(v) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 13 || n > 19) return 0;
  return n;
}

function listingId() {
  return 'L' + Date.now().toString(36) + randomFrom(CODE_ALPHABET, 5);
}

/* Everything the publish rules need, read from storage rather than from the
   request. The client is told WHY it cannot publish, because "no" with no
   reason is how a teenager decides a feature is broken. */
async function teachStanding(env, code, key) {
  const consent = await env.DB.get('teach:' + code, 'json');
  const cert = validKey(key) ? await env.DB.get('certof:' + key, 'json') : null;
  const age = consent ? cleanAge(consent.age) : 0;
  const proof = await ageProof(env, code);
  const stats = await teacherStats(env, code);
  /* A PARENT SAYING SIXTEEN IS NOT PROOF OF SIXTEEN. It is enough to publish
     for coins — nothing is being paid, so nothing turns on the number — and it
     is not enough to be paid. Money needs the age checked by somebody whose
     job that is. */
  const mayPublish = !!(consent && consent.ok && cert);
  const mayCharge = !!(mayPublish && age >= ACADEMY_WORK_AGE && proof);
  return {
    consent: !!(consent && consent.ok),
    payee: consent && consent.payee ? consent.payee : null,
    age, cert: cert || null, proof: proof ? { at: proof.at, by: proof.by } : null,
    mayPublish, mayCharge, stats,
    why: !consent || !consent.ok
      ? 'a parent has to turn earning on from the Family Dashboard first'
      : (!cert ? 'you need a NovaClip certificate before you can teach'
               : (age < ACADEMY_WORK_AGE
                  ? ''
                  : (!proof ? 'to be paid rather than earn coins, your age has to be checked' : '')))
  };
}

/* ===========================================================================
   WHO THE TEACHER IS — AND THE ONE THING A PROFILE MAY NOT CARRY
   ===========================================================================
   Until now the name on a lesson came straight off the certificate, which
   means it was the child's REAL NAME, published to anybody who opened the
   shelf. A teaching name fixes that: the profile name is what the shelf shows,
   the certificate serial stays on the row so the credential is still checkable
   on the verify page, and the real name is only ever sent back to the account
   it belongs to.

   A NAME BELONGS TO ONE ACCOUNT, the same rule the leaderboard needed for the
   same reason: without it, anybody can teach under a name somebody else is
   known by. tname:<lowercased> is the index that enforces it.

   AND NOW THE PART THAT MATTERS MORE THAN ANY OF IT. A profile is the first
   place on this site where one child writes prose that another child reads and
   then acts on. It is therefore the exact place somebody writes "add me on
   discord" — and a private channel between two children is the one thing the
   Academy was designed not to have. There is no messaging here, no way to
   reach a seller, and no profile link out, because the moment there is, this
   stops being a shelf and becomes something that needs moderators, reporting
   flows and a duty of care nobody here can staff.

   So a contact detail in a profile is REFUSED, and the refusal says which kind
   was found. Stripping it silently would be worse: the teacher would think the
   feature was broken, and would try again in a form the stripper missed.
   ========================================================================= */
const PROF_NAME_MAX = 40;
const PROF_TAG_MAX  = 90;
const PROF_BIO_MAX  = 600;
const LESSON_DESC_MAX = 1200;

/* The platform names are deliberately only the ones that exist to carry
   private messages. "tiktok", "instagram" and "youtube" are left out on
   purpose: they are what these lessons are ABOUT, and refusing a bio for
   saying "I edit TikToks" is a false accusation that teaches somebody the
   check is nonsense. */
const CONTACT_TESTS = [
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,                        'an email address'],
  [/\b(?:https?:\/\/|www\.)\S+/i,                                   'a link'],
  [/\b[a-z0-9-]{2,}\.(?:com|net|org|io|gg|me|tv|co|pt|es|uk|br|app|xyz|link|to)\b/i,
                                                                    'a web address'],
  [/(?:^|[\s(])@[a-z0-9._]{3,}/i,                                   'an @ handle'],
  [/\b(?:discord|snapchat|snap\s?chat|telegram|whatsapp|whats\s?app|kik|skype|wickr|viber)\b/i,
                                                                    'somewhere to be messaged privately'],
  [/\b(?:add|dm|message|msg|text|call|ring)\s+me\b/i,               'a way to be contacted off NovaClip']
];

/* A phone number, found by how many digits are in a run rather than by shape,
   because every country writes them differently. Nine to fifteen is a phone;
   a subscriber count, a year and a frame rate are all shorter. */
function digitRunLooksLikePhone(text) {
  const runs = String(text || '').match(/[+()\d][\d\s().\-+]{6,}\d/g) || [];
  return runs.some(r => {
    const d = r.replace(/\D/g, '').length;
    return d >= 9 && d <= 15;
  });
}

/* checkDigits is off for the body of a lesson, and only there. A lesson about
   editing is full of numbers — timecodes, bitrates, resolutions — and a list
   of cut points written "00 01 30 00 02 45" is twelve digits in a row. In a
   one-line profile or a sales blurb a twelve-digit run is a phone number; in
   six thousand words of instructions it is the instructions. The patterns
   that actually matter — an address, a handle, a messaging app — are checked
   everywhere. */
function contactIn(text, checkDigits) {
  const t = String(text || '');
  if (!t) return '';
  for (const [re, what] of CONTACT_TESTS) if (re.test(t)) return what;
  if (checkDigits !== false && digitRunLooksLikePhone(t)) return 'a phone number';
  return '';
}

async function profileOf(env, code) {
  return (await env.DB.get('prof:' + code, 'json')) || null;
}

/* What strangers are allowed to know about a teacher: the name they teach
   under, what they say about themselves, and the level they have earned.
   Not the certificate name — see the block above. */
async function publicTeacher(env, code, fallbackName) {
  const [prof, stats] = await Promise.all([profileOf(env, code), teacherStats(env, code)]);
  return {
    by: (prof && prof.name) || fallbackName || 'A NovaClip creator',
    named: !!(prof && prof.name),
    tagline: (prof && prof.tagline) || '',
    bio: (prof && prof.bio) || '',
    level: stats.level, levelName: stats.levelName,
    stars: stats.stars, ratings: stats.ratings, sales: stats.sales
  };
}

/* ===========================================================================
   THE FIRST LESSON IS FREE — ONCE, FROM ONE CREATOR, EVER
   ===========================================================================
   Every teacher's first lesson — the earliest one they still have up — is
   claimable for nothing. A learner gets exactly one of those, from one
   creator, for as long as the account exists, and choosing it spends it.

   WHY THE CREATOR'S FIRST AND NOT ANY OF THEM. If the freebie could be spent
   on anything, the only rational move is to spend it on the most expensive
   lesson on the shelf, and the teacher who wrote it gets nothing for the one
   sale that mattered most. Pinning it to the creator's own first listing
   leaves the choice where it belongs: the teacher decides what goes in the
   shop window by deciding what to publish first, and the learner decides which
   window to walk into.

   WHY THE LIMIT IS ONE PER ACCOUNT AND NOT ONE PER CREATOR. One per creator is
   a free Academy: twelve creators, twelve free lessons, nobody paid. It is
   also how a rating ring would be built, since a claim opens the lesson and an
   opened lesson can be rated — at one claim per account, a fake five-star
   needs a fresh account, which is the cost that makes it not worth doing.

   A CLAIM IS NOT A SALE. It is recorded as an order, so the lesson opens and
   can be rated, and counted on the teacher as a freebie — never into
   tstats.sales, because sales are what levels and prices are earned with and
   giving something away is not evidence that it was worth paying for.
   ========================================================================= */
/* ===========================================================================
   THE EMAIL TO THE PARENT, WHICH IS NOW AN EMAIL
   ===========================================================================
   The Family Dashboard asked for a parent's address, made up a six-digit code
   IN THE PAGE, and then printed it on the screen with "(Demo)" in front of it.
   That is not a weak check, it is the absence of one: the person it is meant
   to keep out is the person holding the device, and the code was being handed
   to them. Every parental control behind it — the PIN, the daily limit, the
   locks, the teaching consent — rested on a number the child could read.

   So the code is made here, stored here as a hash, and sent to the address by
   an email provider. The browser is never told what it is. That single change
   is the whole point: the only way to learn the code is to have the inbox,
   which is exactly what "confirm the parent's email" was always supposed to
   mean.

   WHAT STOPS THIS BEING A WAY TO SEND MAIL TO STRANGERS. An endpoint that
   emails anybody is an endpoint somebody will use to email everybody. The
   body is fixed — there is no field in it that the caller writes, not even a
   name — so the worst it can carry is NovaClip's own sentence. On top of
   that: one send a minute per account, one a minute per address, and six a
   day per account, counted here rather than taken on trust.

   THE KEY LIVES ON THE WORKER. MAIL_KEY is a Worker secret, like every other
   key this project has; nothing about it reaches a browser. Without it this
   refuses and says which secret is missing, because the alternative is going
   back to printing the code on the screen, and that is the bug.
   ========================================================================= */
const MAIL_CODE_TTL = 20 * 60;          /* seconds a code is good for */
const MAIL_MAX_TRIES = 5;               /* wrong guesses before it dies */
const MAIL_DAY_CAP = 6;                 /* sends per account per day */

function sixDigits() {
  /* crypto.getRandomValues rather than Math.random: this is the thing that
     stands between a child and their own parental controls. */
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(100000 + (a[0] % 900000));
}

/* An address, shown back the way a bank shows one: enough to recognise, not
   enough to learn. The page prints this, so the child confirming the parent's
   address sees that it went somewhere plausible without being told where. */
function maskEmail(e) {
  const at = String(e || '').indexOf('@');
  if (at < 1) return '';
  const user = e.slice(0, at), host = e.slice(at + 1);
  const head = user.slice(0, 1);
  const dot = host.lastIndexOf('.');
  const hhead = host.slice(0, 1), tail = dot > 0 ? host.slice(dot) : '';
  return head + '•••@' + hhead + '•••' + tail;
}

const validEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(v || ''));

/* The code is kept as a hash, so a dump of the store is not a list of live
   codes. The salt is whichever long secret this worker already has. */
async function codeHash(env, code, account) {
  const secret = env.MAIL_SECRET || env.CERT_SECRET || env.PEPPER || 'novaclip-unpeppered';
  return hmacHex(secret, account + '|parent-email|' + code);
}

/* Two providers, both of them a single JSON POST. Named rather than
   generalised: a "any provider" adapter that guesses at the request shape is
   a thing that fails at the one moment it matters. */
const mailReady = (env) => !!(env.MAIL_KEY && env.MAIL_FROM);

/* The refusal when there is no provider, kept in one place because it is
   given twice: once by the route before it spends anybody's allowance, and
   once by the sender, which must never assume the route checked. */
function mailNotSetUp() {
  return { ok: false, status: 503,
      error: 'email is not switched on for this worker yet',
      detail: 'set two Worker secrets: MAIL_KEY (the API key from an email provider) and '
            + 'MAIL_FROM (a verified sender, for example "NovaClip <noreply@novaclip.org>"). '
            + 'MAIL_PROVIDER is "resend" unless set to "postmark". Nothing is emailed and no '
            + 'code is issued until those exist — and the code is never shown on screen, '
            + 'because showing it to the child is what this replaced' };
}

async function sendMail(env, to, subject, text, html) {
  const from = env.MAIL_FROM || '';
  const key = env.MAIL_KEY || '';
  const who = String(env.MAIL_PROVIDER || 'resend').toLowerCase();
  if (!key || !from) return mailNotSetUp();
  let url, headers, payload;
  if (who === 'postmark') {
    url = 'https://api.postmarkapp.com/email';
    headers = { 'Content-Type': 'application/json', 'Accept': 'application/json',
                'X-Postmark-Server-Token': key };
    payload = { From: from, To: to, Subject: subject, TextBody: text, HtmlBody: html,
                MessageStream: env.MAIL_STREAM || 'outbound' };
  } else {
    url = 'https://api.resend.com/emails';
    headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key };
    payload = { from, to: [to], subject, text, html };
  }
  let res, bodyText = '';
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    bodyText = await res.text();
  } catch (e) {
    return { ok: false, status: 502, error: 'the email provider could not be reached',
             detail: String(e && e.message || e) };
  }
  if (!res.ok) {
    /* The provider's own words, trimmed. "Sent" when nothing was sent is the
       failure mode that makes this whole feature a lie, so a refusal is
       reported rather than swallowed. */
    return { ok: false, status: 502, error: 'the email provider refused to send it',
             detail: bodyText.slice(0, 300) };
  }
  return { ok: true };
}

function parentCodeMail(code) {
  const text = [
    'Somebody is setting up the NovaClip Family Dashboard and gave this address as the parent',
    'or guardian.',
    '',
    'Your confirmation code is ' + code,
    '',
    'It is good for 20 minutes. Type it on the Family Dashboard to set the PIN that protects',
    'daily limits, the under-13 block, what your child can reach, and whether they may earn',
    'money teaching.',
    '',
    'If this was not you, ignore this email. Nothing changes until the code is typed in, and',
    'this address is not added to any list.',
    '',
    'NovaClip · novaclip.org'
  ].join('\n');
  const html = '<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#12141c;max-width:520px">'
    + '<p>Somebody is setting up the <b>NovaClip Family Dashboard</b> and gave this address as the '
    + 'parent or guardian.</p>'
    + '<p style="font:800 30px/1.2 ui-monospace,Consolas,monospace;letter-spacing:6px;margin:22px 0">'
    + code + '</p>'
    + '<p>It is good for 20 minutes. Type it on the Family Dashboard to set the PIN that protects '
    + 'daily limits, the under-13 block, what your child can reach, and whether they may earn money '
    + 'teaching.</p>'
    + '<p style="color:#5a6478">If this was not you, ignore this email. Nothing changes until the '
    + 'code is typed in, and this address is not added to any list.</p>'
    + '<p style="color:#5a6478">NovaClip · novaclip.org</p></div>';
  return { subject: 'Your NovaClip parent code: ' + code, text, html };
}

async function firstLessonOf(env, sellerCode) {
  const mine = (await env.DB.get('mine:' + sellerCode, 'json')) || [];
  for (const id of mine) {
    const row = await env.DB.get('lst:' + id, 'json');
    if (row && !row.hidden) return id;
  }
  return '';
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    /* Answered before the DB guard below, so it can report a missing binding
       instead of failing on it. Two things are worth knowing from a browser:
       which of the two Workers is deployed at this address, and whether its
       binding exists. Deploying the AI Worker here is the mistake that makes
       every community feature fail, and this is what makes it visible —
       ai-worker.js answers /health with worker:"ai". */
    if (new URL(request.url).pathname.replace(/\/+$/, '') === '/health') {
      return json({
        ok: !!env.DB,
        worker: 'leaderboard',
        db: env.DB ? 'bound' : 'MISSING — Settings -> Bindings -> Add -> KV namespace, variable name DB',
        /* Not an error — usernames and passwords work without it. It only
           decides whether the salt handed out for an unregistered username is
           derivable from this file, which is what stops the salt endpoint
           answering "does this person have an account here". Worth saying,
           because nothing else would ever surface it. */
        /* Certificates are signed here or not at all — see the block above
           CERT_TIERS. Unset, /cert/issue refuses rather than signing with a
           default that anybody could compute. */
        certificates: env.CERT_SECRET
          ? 'ready'
          : 'not set — add a Worker secret called CERT_SECRET (any long random string). ' +
            'Until then no certificate can be issued or checked.',
        pepper: env.PEPPER
          ? 'set'
          : 'not set — add a Worker secret called PEPPER (any long random string) ' +
            'so an unused username cannot be told apart from a taken one, and so ' +
            'the stored visitor tags cannot be walked back to IP addresses',
        parentEmail: (env.MAIL_KEY && env.MAIL_FROM)
          ? 'ready — sending through ' + String(env.MAIL_PROVIDER || 'resend')
          : 'not set — add Worker secrets MAIL_KEY (an email provider API key) and MAIL_FROM '
            + '(a verified sender). Until then the Family Dashboard cannot confirm a parent, '
            + 'and it will say so rather than showing the code on screen',
        hint: env.DB ? 'Put this address in NC_SERVER in nova.js.'
                     : 'The community pages stay offline until DB is bound.'
      }, env.DB ? 200 : 500);
    }

    if (!env.DB) return json({ error: 'KV namespace DB is not bound — see the setup notes at the top of this file' }, 500);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    /* Hashed once per request. Everything below uses `who`; `ip` survives only
       so nameOwner() can recognise a record written before this change. */
    const who = await visitorHash(env, ip);
    let body = {};
    if (request.method === 'POST') {
      try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
    }

    // ---------- accounts ----------
    if (path === '/account' && request.method === 'POST') {
      if (await rateLimited(env, 'acct:' + who, 10000)) return json({ error: 'slow down' }, 429);
      const key = newKey();
      let code = newCode(), tries = 0;
      // a collision here would hand someone else's save to a stranger
      while (await env.DB.get('code:' + cleanCode(code)) && tries++ < 5) code = newCode();
      await env.DB.put('code:' + cleanCode(code), key);
      await env.DB.put('save:' + key, JSON.stringify({ data: {}, at: Date.now() }));
      return json({ key, code });
    }

    /* The salt, handed out before anyone has proved anything — see saltFor.
       GET so it can be cached by nothing and read by anything; there is no
       secret in the answer. */
    if (path === '/account/salt' && request.method === 'GET') {
      const user = cleanUser(url.searchParams.get('u'));
      if (!validUser(user)) return json({ error: 'that username will not work' }, 400);
      const s = await saltFor(env, user);
      return json({ salt: s.salt, rounds: s.rounds });
    }

    if (path === '/account/register' && request.method === 'POST') {
      if (await rateLimited(env, 'reg:' + who, 15000)) return json({ error: 'slow down' }, 429);
      const user = cleanUser(body.username);
      if (!validUser(user)) {
        return json({ error: 'A username is 3 to 20 characters: letters, numbers, and . _ - in the middle.' }, 400);
      }
      if (!validAuth(body.authKey)) return json({ error: 'bad request' }, 400);
      if (await env.DB.get('user:' + user)) {
        return json({ error: 'that username is taken' }, 409);
      }

      /* An existing device already has a key and a save on it. Registering
         should put a name on THAT account rather than silently starting an
         empty one and orphaning everything they have done — which is what
         handing back a fresh key would do. */
      let key = validKey(body.key) ? body.key : null;
      let code = null;
      if (key && !(await env.DB.get('save:' + key))) key = null;   // key we have never seen

      if (key) {
        code = String(body.code || '') || null;
      } else {
        key = newKey();
        code = newCode();
        let tries = 0;
        while (await env.DB.get('code:' + cleanCode(code)) && tries++ < 5) code = newCode();
        await env.DB.put('code:' + cleanCode(code), key);
        await env.DB.put('save:' + key, JSON.stringify({ data: {}, at: Date.now() }));
      }

      const salt = (await saltFor(env, user)).salt;
      const hash = await sha256Hex(body.authKey + '|' + salt);
      await env.DB.put('user:' + user, JSON.stringify({
        key, salt, rounds: PBKDF2_ROUNDS, hash, at: Date.now()
      }));
      return json({ ok: true, key, code, username: user });
    }

    if (path === '/account/login' && request.method === 'POST') {
      const user = cleanUser(body.username);
      /* Per username AND per address. Per username alone lets one attacker
         lock a real person out of their own account by guessing at it; per
         address alone lets a spread of usernames through from one machine. */
      if (await rateLimited(env, 'login:' + user, 1500) ||
          await rateLimited(env, 'loginip:' + who, 800)) {
        return json({ error: 'too many tries just now — wait a moment' }, 429);
      }
      if (!validUser(user) || !validAuth(body.authKey)) {
        return json({ error: 'that username and password do not match' }, 401);
      }
      const row = await env.DB.get('user:' + user, 'json');
      /* Same message and the same work whether the username exists or not.
         "No such user" versus "wrong password" is the same enumeration the
         salt endpoint goes to trouble to avoid. */
      const expect = row ? row.hash : await sha256Hex('no-such-user|' + user);
      const got = await sha256Hex(body.authKey + '|' + (row ? row.salt : (await saltFor(env, user)).salt));
      if (!row || !sameSecret(expect, got)) {
        return json({ error: 'that username and password do not match' }, 401);
      }
      return json({ ok: true, key: row.key, username: user });
    }

    /* Changing a password re-derives from the SAME salt, so the browser does
       not need a new one and an old device holding the old password simply
       stops working. The key does not change: it is the account, not the
       credential. */
    if (path === '/account/password' && request.method === 'POST') {
      const user = cleanUser(body.username);
      if (await rateLimited(env, 'pw:' + user, 3000)) return json({ error: 'slow down' }, 429);
      if (!validUser(user) || !validAuth(body.authKey) || !validAuth(body.newAuthKey)) {
        return json({ error: 'bad request' }, 400);
      }
      const row = await env.DB.get('user:' + user, 'json');
      if (!row) return json({ error: 'that username and password do not match' }, 401);
      const got = await sha256Hex(body.authKey + '|' + row.salt);
      if (!sameSecret(row.hash, got)) {
        return json({ error: 'that username and password do not match' }, 401);
      }
      row.hash = await sha256Hex(body.newAuthKey + '|' + row.salt);
      row.at = Date.now();
      await env.DB.put('user:' + user, JSON.stringify(row));
      return json({ ok: true });
    }

    if (path === '/account/resolve' && request.method === 'POST') {
      if (await rateLimited(env, 'resolve:' + who, 2000)) return json({ error: 'slow down' }, 429);
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

    // ---------- certificates ----------
    /* Issued here and nowhere else, because the signature is what makes a
       forged certificate detectable and the key for it is only on this worker.
       See the block above CERT_TIERS for what that does and does not prove. */
    if (path === '/cert/issue' && request.method === 'POST') {
      if (!env.CERT_SECRET) {
        return json({ error: 'this worker cannot sign certificates yet \u2014 add a secret called CERT_SECRET' }, 503);
      }
      if (await rateLimited(env, 'cert:' + who, 5000)) return json({ error: 'slow down' }, 429);
      const key = body.key;
      if (!validKey(key)) return json({ error: 'bad key' }, 400);
      const tier = CERT_TIERS[body.tier] ? body.tier : '';
      if (!tier) return json({ error: 'no such certificate' }, 400);
      const row = await env.DB.get('save:' + key, 'json');
      if (!row) return json({ error: 'no such save' }, 404);
      const missing = certMissing(row.data, tier);
      if (missing.length) return json({ error: 'not earned yet', missing }, 403);

      const name = cleanHolder(body.name);
      /* A DATE, not a timestamp: it is what the certificate prints, and asking
         twice on the same day has to give the same number back rather than
         minting a second credential for the same work. */
      const iso = new Date().toISOString().slice(0, 10);
      const tc = CERT_TIERS[tier].code;
      const serial = certSerial(tc, await hmacHex(env.CERT_SECRET, name + '|' + tc + '|' + iso));
      await env.DB.put('cert:' + serial, JSON.stringify({ name, tier, iso, key, at: Date.now() }));
      /* The other way round as well. The Academy has to ask "does this account
         hold a certificate" on every publish, and scanning every certificate
         ever issued to answer it is not a question you can ask twice. */
      await env.DB.put('certof:' + key, JSON.stringify({ serial, tier, iso, name }));
      return json({ serial, name, tier, issued: iso });
    }

    /* Public on purpose. Whoever is holding the certificate is the person who
       needs to check it, and they have no account here. The answer carries the
       three things printed on the document and nothing else — no key, no
       points, no history. */
    if (path === '/cert/verify' && request.method === 'GET') {
      const c = cleanSerial(url.searchParams.get('c'));
      if (!c) return json({ valid: false, reason: 'that is not a NovaClip certificate number' });
      const rec = await env.DB.get('cert:' + c, 'json');
      if (!rec) return json({ valid: false, reason: 'no certificate with that number has been issued' });
      /* Recomputed rather than trusted. The stored row and the number have to
         agree, so an edited record fails the same way an invented number
         does. */
      if (env.CERT_SECRET) {
        const tc = (CERT_TIERS[rec.tier] || {}).code || '';
        const again = certSerial(tc, await hmacHex(env.CERT_SECRET, rec.name + '|' + tc + '|' + rec.iso));
        if (again !== c) return json({ valid: false, reason: 'the details do not match the number' });
      }
      return json({ valid: true, name: rec.name, tier: rec.tier, issued: rec.iso });
    }

    // ---------- the Academy ----------
    /* What the account is allowed to do, and why not when it is not. */
    if (path === '/academy/standing' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const st = await teachStanding(env, g.code, body.key);
      return json({
        consent: st.consent, cert: st.cert, age: st.age,
        mayPublish: st.mayPublish, mayCharge: st.mayCharge, stats: st.stats,
        workAge: ACADEMY_WORK_AGE, maxPrice: st.stats.maxPrice, hardMax: ACADEMY_MAX_PRICE,
        levels: TEACH_LEVELS, why: st.why,
        ageVerified: !!st.proof, ageConfigured: !!env.AGE_PROVIDER,
        fee: ACADEMY_FEE, payouts: false
      });
    }

    /* The parent's switch. It carries the parent's own name and email because
       they are the person the money would be paid to and the person who
       answers for the account — and the age, because the parent is a better
       source for it than the child. */
    if (path === '/academy/consent' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const on = body.allow !== false;
      if (!on) {
        await env.DB.delete('teach:' + g.code);
        return json({ ok: true, consent: false });
      }
      const name = cleanLine(body.parentName, 60);
      const email = cleanLine(body.parentEmail, 90).toLowerCase();
      const age = cleanAge(body.age);
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
        return json({ error: 'the parent\'s name and email are both needed' }, 400);
      }
      if (!age) return json({ error: 'the age has to be between 13 and 19' }, 400);
      /* CHECKED BEFORE THE RATE LIMIT, ON PURPOSE. The limiter spends its slot
         on whatever arrives, so validating afterwards means a parent who
         mistypes their email is told "slow down" when they correct it three
         seconds later. A rejected field costs no storage, so it costs no
         allowance either. */
      if (await rateLimited(env, 'teach:' + g.code, 3000)) return json({ error: 'slow down' }, 429);
      await env.DB.put('teach:' + g.code, JSON.stringify({
        ok: true, age, payee: { name, email }, at: Date.now()
      }));
      return json({ ok: true, consent: true, age, mayCharge: age >= ACADEMY_WORK_AGE });
    }

    if (path === '/academy/publish' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const st = await teachStanding(env, g.code, body.key);
      if (!st.mayPublish) return json({ error: st.why || 'not allowed to publish yet' }, 403);

      const title = cleanLine(body.title, 70);
      const blurb = cleanLine(body.blurb, 160);
      /* THE DESCRIPTION, WHICH IS WHAT A BUYER ACTUALLY READS BEFORE PAYING.
         Before this existed the preview was the first 220 characters of the
         lesson itself, which managed to be both bad selling and a giveaway: it
         told the buyer nothing about what was inside and handed over the
         opening of the thing they were being asked to buy. */
      const desc = cleanText(body.desc, LESSON_DESC_MAX);
      const content = cleanText(body.content, 6000);
      if (title.length < 6) return json({ error: 'the title needs to say what it teaches' }, 400);
      if (content.length < 80) return json({ error: 'there is not enough in the lesson yet' }, 400);
      for (const field of [title, blurb, desc, content]) {
        const seen = screen(field);
        if (!seen.ok) return json({ error: 'that wording will not pass — ' + seen.kind }, 400);
      }
      /* The lesson itself is read by somebody who has bought it, but the
         title, the blurb and the description are read by everybody — so they
         are held to the same no-contact rule as a profile. A lesson whose
         description says "message me for the rest" is the private channel
         again, wearing a different hat. */
      /* And the lesson body with it, which matters more rather than less: a
         contact detail hidden inside something only buyers can read is the
         same private channel with nobody watching it. */
      for (const field of [[title, true], [blurb, true], [desc, true], [content, false]]) {
        const c = contactIn(field[0], field[1]);
        if (c) {
          return json({ error: 'a lesson cannot carry ' + c,
            detail: 'there is no messaging in the Academy on purpose. What is sold here is the lesson '
                  + 'itself, delivered when it is bought, and nothing that sends a buyer somewhere '
                  + 'else to be contacted can go on the shelf' }, 400);
        }
      }
      /* After the checks, for the same reason as the consent endpoint: being
         throttled for fixing a typo teaches people the feature is broken. */
      if (await rateLimited(env, 'pub:' + g.code, 4000)) return json({ error: 'slow down' }, 429);

      /* THE AGE RULE, APPLIED HERE AND NOWHERE ELSE. A price from an account
         under the working age is not refused, it is turned into coins, because
         refusing would just teach somebody to lie about their age. */
      let price = Math.round(Number(body.price) * 100) / 100;
      if (!Number.isFinite(price) || price < 0) price = 0;
      /* THE CEILING IS THE ONE THIS TEACHER HAS EARNED. Clamped rather than
         refused, and the answer says what the cap was, so somebody who asks
         for twelve on their first day gets three and is told why rather than
         getting an error they have to guess at. */
      const levelMax = Math.min(st.stats.maxPrice, ACADEMY_MAX_PRICE);
      const asked = price;
      if (price > levelMax) price = levelMax;
      const coinsOnly = !st.mayCharge;
      if (coinsOnly) price = 0;
      const coins = Math.max(0, Math.min(500, Math.round(Number(body.coins) || 0)));

      const mine = (await env.DB.get('mine:' + g.code, 'json')) || [];
      const id = cleanLine(body.id, 24) && mine.includes(cleanLine(body.id, 24))
        ? cleanLine(body.id, 24) : listingId();
      if (!mine.includes(id)) {
        if (mine.length >= ACADEMY_MAX_LISTINGS) {
          return json({ error: 'that is as many lessons as one account can have up at once' }, 403);
        }
        mine.push(id);
        await env.DB.put('mine:' + g.code, JSON.stringify(mine));
        const idx = (await env.DB.get('lstidx', 'json')) || [];
        idx.unshift(id);
        await env.DB.put('lstidx', JSON.stringify(idx.slice(0, 500)));
      }
      const row = {
        id, code: g.code, title, blurb, desc, content,
        cat: cleanCat(body.cat), level: cleanLevel(body.level),
        price, coins, coinsOnly,
        /* The fallback when there is no teaching name yet, and the reason
           setting one is worth doing: this is the name off the certificate,
           which is the child's real one. It is never sent to anybody but the
           account it belongs to once a profile name exists. */
        by: cleanLine(st.cert && st.cert.name, 48) || 'A NovaClip creator',
        tier: (st.cert && st.cert.tier) || '', serial: (st.cert && st.cert.serial) || '',
        at: Date.now(), hidden: false,
        /* The lesson's own stars, kept on the row so the shelf does not have to
           read a second record for every card it draws. */
        sum: (await env.DB.get('lst:' + id, 'json') || {}).sum || 0,
        n: (await env.DB.get('lst:' + id, 'json') || {}).n || 0
      };
      await env.DB.put('lst:' + id, JSON.stringify(row));
      return json({ ok: true, id, price, coinsOnly, level: st.stats.level, levelMax,
        note: coinsOnly
          ? 'under ' + ACADEMY_WORK_AGE + ', so this earns coins rather than money'
          : (asked > levelMax
             ? 'a ' + st.stats.levelName.toLowerCase() + ' can ask up to \u20ac' + levelMax +
               ', so the price was set to that'
             : '') });
    }

    if (path === '/academy/unpublish' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const id = cleanLine(body.id, 24);
      const row = await env.DB.get('lst:' + id, 'json');
      if (!row || row.code !== g.code) return json({ error: 'not yours' }, 403);
      row.hidden = true;
      await env.DB.put('lst:' + id, JSON.stringify(row));
      return json({ ok: true });
    }

    /* The shelf. Public, and deliberately without the lesson itself in it:
       a browse answer that carried every lesson would be a shop that gives
       its stock away. */
    if (path === '/academy/list' && request.method === 'GET') {
      const idx = (await env.DB.get('lstidx', 'json')) || [];
      const cat = url.searchParams.get('cat');
      const out = [];
      /* One lookup per teacher rather than one per card. A shelf of sixty
         lessons from six teachers used to be sixty reads of the same two
         records; now it is six. */
      const seen = new Map(), firsts = new Map();
      for (const id of idx.slice(0, 120)) {
        const row = await env.DB.get('lst:' + id, 'json');
        if (!row || row.hidden) continue;
        if (cat && ACADEMY_CATS.includes(cat) && row.cat !== cat) continue;
        if (!seen.has(row.code)) seen.set(row.code, await publicTeacher(env, row.code, row.by));
        if (!firsts.has(row.code)) firsts.set(row.code, await firstLessonOf(env, row.code));
        const t = seen.get(row.code);
        out.push({ id: row.id, title: row.title, blurb: row.blurb, cat: row.cat, level: row.level,
                   price: row.price, coins: row.coins, coinsOnly: row.coinsOnly,
                   by: t.by, tier: row.tier, at: row.at,
                   stars: row.n ? Math.round((row.sum / row.n) * 10) / 10 : 0, ratings: row.n || 0,
                   teacherLevel: t.level, teacherLevelName: t.levelName, teacherStars: t.stars,
                   teacherSales: t.sales, teacherTagline: t.tagline,
                   /* Whether this is the one lesson of this teacher's that
                      anybody may take for nothing. */
                   firstFree: firsts.get(row.code) === row.id,
                   length: row.content ? row.content.length : 0 });
        if (out.length >= 60) break;
      }
      return json(out);
    }

    /* One lesson. The content comes back only for the person who made it or
       somebody who has an order against it. */
    if (path === '/academy/item' && request.method === 'POST') {
      const id = cleanLine(body.id, 24);
      const row = await env.DB.get('lst:' + id, 'json');
      if (!row || row.hidden) return json({ error: 'no such lesson' }, 404);
      const code = cleanCode(body.code || '');
      const owner = code && code === row.code;
      const ord = code ? await env.DB.get('ord:' + code + ':' + id, 'json') : null;
      const bought = !!ord;
      const mine = code ? await env.DB.get('rate:' + code + ':' + id, 'json') : null;
      const teach = await publicTeacher(env, row.code, row.by);
      const free = !row.price && !row.coins;
      const open = owner || bought || free;
      /* The free first lesson, from both ends: whether THIS lesson is the one
         this teacher gives away, and whether the reader still has their one
         claim to spend. Both come from storage, because both are rules. */
      const firstFree = (await firstLessonOf(env, row.code)) === row.id;
      const claim = code ? await env.DB.get('free:' + code, 'json') : null;
      let claimedOn = null;
      if (claim) {
        const was = claim.id === row.id ? row : await env.DB.get('lst:' + claim.id, 'json');
        claimedOn = { id: claim.id, title: was ? was.title : '',
                      by: was ? (await publicTeacher(env, claim.seller, was.by)).by : '', at: claim.at };
      }
      return json({
        id: row.id, title: row.title, blurb: row.blurb, desc: row.desc || '',
        cat: row.cat, level: row.level,
        price: row.price, coins: row.coins, coinsOnly: row.coinsOnly, by: teach.by, tier: row.tier,
        at: row.at, owner, bought, open, wasFree: !!(ord && ord.free),
        firstFree, freeLeft: !claim, claimedOn,
        /* Only the owner is ever told the name on the certificate. Everybody
           else gets the teaching name and the serial, which is enough to check
           the certificate on the verify page without naming a child. */
        certName: owner ? row.by : '',
        serial: row.serial || '',
        stars: row.n ? Math.round((row.sum / row.n) * 10) / 10 : 0, ratings: row.n || 0,
        myStars: mine ? mine.stars : 0,
        teacher: { level: teach.level, name: teach.levelName, levelName: teach.levelName,
                   by: teach.by, named: teach.named, tagline: teach.tagline, bio: teach.bio,
                   stars: teach.stars, ratings: teach.ratings, sales: teach.sales },
        /* For a priced lesson: how far the buyer's coins go towards it. */
        split: row.price > 0
          ? priceSplit(row.price, code ? ((await wallet(env, code)).bal) : 0)
          : null,
        coinShare: COIN_SHARE, coinsPerEur: COINS_PER_EUR,
        /* Before it is bought, what comes back is the teacher's own
           description of it \u2014 and only a slice of the lesson when there is no
           description, which is what every lesson published before this
           existed looks like. */
        content: open ? row.content : (row.desc || (row.content.slice(0, 220) + '\u2026'))
      });
    }

    /* AN ORDER, NOT A PAYMENT. Nothing here moves money and nothing here
       pretends to: a priced lesson answers 503 and says what is missing, and a
       coin-priced one goes through, because coins are this site's own and need
       no processor, no payout account and nobody's age. */
    if (path === '/academy/buy' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const id = cleanLine(body.id, 24);
      const row = await env.DB.get('lst:' + id, 'json');
      if (!row || row.hidden) return json({ error: 'no such lesson' }, 404);
      if (row.code === g.code) return json({ error: 'that is your own lesson' }, 400);
      if (await env.DB.get('ord:' + g.code + ':' + id)) return json({ ok: true, already: true });
      if (row.price > 0) {
        const w = await wallet(env, g.code);
        const split = priceSplit(row.price, w.bal);
        return json({
          error: 'paid lessons are not switched on yet',
          detail: 'NovaCoins cover ' + Math.round(COIN_SHARE * 100) + '% of a priced lesson and the rest '
                + 'is paid for. The money half would go to the seller\'s parent account, and no payout '
                + 'processor is connected to this worker yet',
          price: row.price, split
        }, 503);
      }
      /* The allowance is spent here, where something is actually written. An
         attempt that bounced off the "not switched on" wall above has cost
         nothing and should not stop the next real purchase two seconds later —
         which is exactly what it did on the first run of the tests. */
      /* SPENT FROM THE SERVER'S WALLET, NOT THE BROWSER'S. Coins can be bought
         with a card now, so a balance the client reports is a balance the
         client can invent. */
      const buyerW = await wallet(env, g.code);
      if (row.coins > 0 && buyerW.bal < row.coins) {
        /* Checked before the limiter, like every other refusal in this file:
           somebody who cannot afford a lesson has bought nothing, so they have
           spent none of their allowance either. */
        return json({ error: 'not enough NovaCoins', need: row.coins, have: buyerW.bal }, 402);
      }
      if (await rateLimited(env, 'buy:' + g.code, 2000)) return json({ error: 'slow down' }, 429);
      if (row.coins > 0) {
        buyerW.bal -= row.coins;
        buyerW.spent += row.coins;
        await walletPut(env, g.code, buyerW);
      }

      /* The fee, taken where the sale happens so the seller's page can show
         arithmetic rather than an assertion. */
      const fee = Math.round(row.coins * ACADEMY_FEE);
      const net = row.coins - fee;
      await env.DB.put('ord:' + g.code + ':' + id,
        JSON.stringify({ at: Date.now(), coins: row.coins, fee, net, price: 0 }));
      if (net > 0) {
        const sellerW = await wallet(env, row.code);
        sellerW.bal += net;
        sellerW.earned += net;
        await walletPut(env, row.code, sellerW);
      }
      const earned = (await env.DB.get('earn:' + row.code, 'json')) ||
                     { coins: 0, fee: 0, money: 0, sales: 0 };
      earned.coins += net; earned.fee = (earned.fee || 0) + fee; earned.sales += 1;
      await env.DB.put('earn:' + row.code, JSON.stringify(earned));
      /* Sales are half of what a level is made of; the stars are the other
         half and arrive later, if the buyer thinks it was worth saying. */
      const t = (await env.DB.get('tstats:' + row.code, 'json')) || { sales: 0, sum: 0, n: 0 };
      t.sales += 1;
      await env.DB.put('tstats:' + row.code, JSON.stringify(t));
      return json({ ok: true, coins: row.coins, toSeller: net, fee });
    }

    /* ---------- the age on the account, and the parent's rules ---------- */
    /* The browser reports what the age wheel was told, once. Under 13 bars the
       account rather than this browser — which is the whole point, because the
       browser was never the thing that was too young. */
    if (path === '/account/age' && request.method === 'POST') {
      const code = cleanCode(body.code || '');
      const key = String(body.key || '');
      if (!code || !key) return json({ error: 'sign in first' }, 401);
      const owner = await env.DB.get('code:' + code);
      if (!owner || owner !== key) return json({ error: 'that code and key do not match' }, 403);
      const age = parseInt(body.age, 10);
      if (!Number.isFinite(age) || age < 1 || age > 120) return json({ error: 'bad age' }, 400);
      const had = await env.DB.get('minor:' + code, 'json');
      /* A BARRED ACCOUNT CANNOT ARGUE ITSELF OLDER. Once it is set, a second
         answer does not lift it: that would be the retry button the age gate
         deliberately does not have, moved to where nobody can see it. */
      if (had && had.blocked) return json({ ok: true, blocked: true, locked: true });
      await env.DB.put('minor:' + code, JSON.stringify({
        age, blocked: age < MIN_AGE, at: Date.now()
      }));
      return json({ ok: true, blocked: age < MIN_AGE });
    }

    /* What this account is, everywhere. The page asks on load, so a block or a
       rule set on one device is true on the next one. */
    /* ======================================================================
       ENTITLEMENT — WHAT SOMEBODY PAID FOR, WRITTEN DOWN WHERE IT SURVIVES
       ======================================================================
       Until now a purchase was granted by the return page: Stripe sent the
       buyer back, the page asked the pay worker to confirm the session, and
       the browser wrote nc_pro. A parent who paid and closed the tab before
       that page loaded was charged and got nothing, and the only record of it
       was in Stripe.

       So the pay worker tells this one, from its webhook, which fires whether
       or not anybody is looking at a page.

       WHY A TICKET AND NOT THE ACCOUNT CODE. The obvious design sends the
       NovaClip code to the pay worker and on into Stripe's session metadata.
       That code is the one thing that moves an account — it is the password
       reset, the second device and the recovery route in one string — so
       putting it in a third party's database, where it sits in logs and
       exports and support tools, hands out account access to buy a
       subscription. A ticket is a random string that means nothing except
       "the holder started a checkout for this account", expires in a day, and
       is useless for anything else. That is what travels.
       ====================================================================== */
    const GRANT_TTL = 86400;               /* a ticket is good for a day */
    const GRANT_SKEW = 10 * 60 * 1000;     /* how stale a signed call may be */

    /* The browser asks for one of these just before it sends somebody to
       Stripe. Same proof as any other account call: the code and its key. */
    if (path === '/entitlement/ticket' && request.method === 'POST') {
      const code = cleanCode(body.code || '');
      const key = String(body.key || '');
      if (!code || !key) return json({ error: 'sign in first' }, 401);
      const owner = await env.DB.get('code:' + code);
      if (!owner || owner !== key) return json({ error: 'that code and key do not match' }, 403);
      const ticket = 'tkt_' + randomFrom('abcdefghijklmnopqrstuvwxyz0123456789', 32);
      await env.DB.put('tkt:' + ticket, code, { expirationTtl: GRANT_TTL });
      return json({ ticket, expires: GRANT_TTL });
    }

    /* Called by the pay worker, never by a browser.

       THE SIGNATURE IS THE WHOLE DOOR. This endpoint hands out paid plans for
       free to anybody who can call it, so it is not enough that the caller
       knows a ticket — a ticket travels through Stripe and is not a secret.
       The caller must hold GRANT_SECRET, which only the two workers have, and
       must have signed this exact ticket, plan and session with it.

       It is also replay-proof twice over: the timestamp must be recent, and a
       Stripe session that has already been granted is accepted and ignored
       rather than granted again, because Stripe retries a webhook it did not
       get a 200 from and a retry must not become a second purchase. */
    if (path === '/entitlement/grant' && request.method === 'POST') {
      if (!env.GRANT_SECRET) {
        return json({ error: 'entitlement granting is not switched on',
          detail: 'set a Worker secret called GRANT_SECRET on this worker AND on the pay '
                + 'worker, with the same value — it is what proves a grant came from the '
                + 'pay worker and not from a stranger' }, 503);
      }
      const ticket = String(body.ticket || '');
      const plan = cleanLine(body.plan, 40);
      const session = cleanLine(body.session, 90);
      const ts = parseInt(body.ts, 10) || 0;
      const sig = String(body.sig || '');
      if (!ticket || !plan || !session || !ts || !sig) return json({ error: 'incomplete' }, 400);

      if (Math.abs(Date.now() - ts) > GRANT_SKEW) return json({ error: 'stale' }, 400);

      const want = await hmacHex(env.GRANT_SECRET, [ticket, plan, session, ts].join('|'));
      /* Compared whole, not prefix: a length-leaking compare on a signature is
         how a signature stops being one. */
      if (want.length !== sig.length || want !== sig) return json({ error: 'bad signature' }, 403);

      /* Already done? Say so and stop — a Stripe retry is not a second sale. */
      if (await env.DB.get('gsess:' + session)) return json({ ok: true, already: true });

      const code = await env.DB.get('tkt:' + ticket);
      /* An expired or unknown ticket is not an error worth retrying: the
         purchase happened, there is simply nobody here to give it to. 200 so
         Stripe stops redelivering, and said plainly so it shows up in a log.  */
      if (!code) return json({ ok: true, granted: false, reason: 'ticket expired or unknown' });

      const pro = (await env.DB.get('pro:' + code, 'json')) || { plans: [], updated: 0 };
      if (pro.plans.indexOf(plan) < 0) pro.plans.push(plan);
      pro.updated = Date.now();
      await env.DB.put('pro:' + code, JSON.stringify(pro));
      await env.DB.put('gsess:' + session, '1', { expirationTtl: 60 * 60 * 24 * 90 });
      return json({ ok: true, granted: true, plans: pro.plans });
    }

    if (path === '/account/state' && request.method === 'POST') {
      const code = cleanCode(body.code || '');
      const key = String(body.key || '');
      if (!code || !key) return json({ error: 'sign in first' }, 401);
      const owner = await env.DB.get('code:' + code);
      if (!owner || owner !== key) return json({ error: 'that code and key do not match' }, 403);
      const minor = await env.DB.get('minor:' + code, 'json');
      const rules = await env.DB.get('rules:' + code, 'json');
      return json({
        blocked: !!(minor && minor.blocked),
        age: minor ? minor.age : 0,
        rules: rules || null,
        hasPin: !!(await env.DB.get('rpin:' + code)),
        /* WHAT THEY PAID FOR, ON WHATEVER DEVICE THEY SIGN IN FROM. This is
           the half of the webhook that the buyer actually feels: the grant is
           written against the account, and this is where any device picks it
           up — including the one that was closed before the return page ever
           loaded, and including a second device that was never used to buy
           anything. Null when nothing has been bought, so a page can tell
           "free" from "could not reach the server". */
        pro: (await env.DB.get('pro:' + code, 'json')) || null
      });
    }

    /* Setting the rules needs the PIN a parent already keeps. The hash is sent
       by the page — the PIN itself never travels, the same way it never leaves
       the device on the Family Dashboard today. */
    /* ---------- confirming the parent's email, for real ---------- */
    /* Issues a code and EMAILS it. What comes back to the browser is that it
       was sent and a masked address — never the code, which is the entire
       difference between this and what it replaced. */
    if (path === '/parent/email/start' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const email = cleanLine(body.email, 90).toLowerCase();
      if (!validEmail(email)) return json({ error: 'that does not look like an email address' }, 400);
      /* ASKED FIRST, BECAUSE IT IS THE ANSWER THAT CANNOT CHANGE. The caps and
         the limiters below are about volume; this is about whether the feature
         exists at all. Checked after them, a worker with no mail key tells a
         parent to "give it a minute before asking for another" — which is the
         wrong sentence, and one they would keep following. */
      if (!mailReady(env)) {
        const no = mailNotSetUp();
        return json({ error: no.error, detail: no.detail }, no.status);
      }

      /* A DAY'S WORTH, COUNTED HERE. Six is enough for a parent who mistypes
         their address twice and still cannot find the message; it is not
         enough to be worth using this as a way to bother somebody. */
      const dayKey = 'pmailday:' + g.code + ':' + new Date().toISOString().slice(0, 10);
      const sent = parseInt((await env.DB.get(dayKey)) || '0', 10);
      if (sent >= MAIL_DAY_CAP) {
        return json({ error: 'that is as many codes as one account can send in a day',
          detail: 'wait until tomorrow, or use the code already in the inbox — it lasts twenty '
                + 'minutes from when it was sent' }, 429);
      }
      /* Checked before the limiter and before the provider is called, like
         every other refusal in this file: a rejected address costs nothing, so
         it should cost no allowance either. */
      if (await rateLimited(env, 'pmail:' + g.code, 60000)) {
        return json({ error: 'a code was just sent', detail: 'give it a minute before asking for another' }, 429);
      }
      /* And per ADDRESS as well as per account, so a pile of accounts cannot
         be pointed at one inbox. */
      if (await rateLimited(env, 'pmailto:' + (await hmacHex(env.PEPPER || 'p', email)).slice(0, 24), 60000)) {
        return json({ error: 'a code was just sent to that address',
                      detail: 'give it a minute before asking for another' }, 429);
      }

      const code = sixDigits();
      const mail = parentCodeMail(code);
      const out = await sendMail(env, email, mail.subject, mail.text, mail.html);
      if (!out.ok) return json({ error: out.error, detail: out.detail }, out.status);

      /* Only once the provider has actually accepted it. Storing first and
         sending second gives you a code that works for an email nobody got. */
      await env.DB.put('pmail:' + g.code, JSON.stringify({
        hash: await codeHash(env, code, g.code), email, at: Date.now(), tries: 0
      }), { expirationTtl: MAIL_CODE_TTL + 60 });
      await env.DB.put(dayKey, String(sent + 1), { expirationTtl: 60 * 60 * 26 });
      return json({ sent: true, to: maskEmail(email), minutes: Math.round(MAIL_CODE_TTL / 60) });
    }

    /* The six digits coming back. */
    if (path === '/parent/email/check' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const given = String(body.code6 || '').replace(/\D/g, '');
      const row = await env.DB.get('pmail:' + g.code, 'json');
      if (!row) {
        return json({ error: 'that code has expired', detail: 'ask for a new one' }, 410);
      }
      if (!/^\d{6}$/.test(given)) return json({ error: 'the code is six digits' }, 400);
      if (row.tries >= MAIL_MAX_TRIES) {
        await env.DB.delete('pmail:' + g.code);
        return json({ error: 'too many wrong tries', detail: 'that code is dead — ask for a new one' }, 429);
      }
      const want = await codeHash(env, given, g.code);
      if (!sameSecret(row.hash, want)) {
        row.tries += 1;
        await env.DB.put('pmail:' + g.code, JSON.stringify(row), { expirationTtl: MAIL_CODE_TTL + 60 });
        return json({ error: 'that code does not match',
                      left: Math.max(0, MAIL_MAX_TRIES - row.tries) }, 403);
      }
      await env.DB.delete('pmail:' + g.code);
      /* The address is kept because it is the one the dashboard writes to
         afterwards — a weekly summary, an alert — and because "which
         address was confirmed" is the question a parent asks later. */
      await env.DB.put('pmailok:' + g.code, JSON.stringify({ email: row.email, at: Date.now() }));
      return json({ verified: true, email: row.email });
    }

    /* Has this account's parent email been confirmed, and which one. Read by
       the dashboard on load so a confirmation survives a new device, which the
       browser-only version never did. */
    if (path === '/parent/email/state' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const ok = await env.DB.get('pmailok:' + g.code, 'json');
      const live = await env.DB.get('pmail:' + g.code, 'json');
      return json({
        verified: !!ok, email: ok ? ok.email : '', at: ok ? ok.at : 0,
        pending: !!live, to: live ? maskEmail(live.email) : '',
        configured: !!(env.MAIL_KEY && env.MAIL_FROM)
      });
    }

    if (path === '/parent/rules' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const pin = String(body.pinHash || '');
      if (!/^[a-f0-9]{64}$/.test(pin)) return json({ error: 'the Family Dashboard PIN is needed' }, 400);
      const have = await env.DB.get('rpin:' + g.code);
      /* First use sets the PIN this account answers to; after that it has to
         match, so a child who never knew it cannot replace it with one they
         chose. */
      if (!have) await env.DB.put('rpin:' + g.code, pin);
      else if (!sameSecret(have, pin)) return json({ error: 'that PIN does not match this account' }, 403);
      if (await rateLimited(env, 'rules:' + g.code, 1500)) return json({ error: 'slow down' }, 429);
      const rules = cleanRules(body.rules);
      await env.DB.put('rules:' + g.code, JSON.stringify(rules));
      return json({ ok: true, rules });
    }

    /* ---------- NovaCoins you can buy ---------- */
    if (path === '/coins/packs' && request.method === 'GET') {
      return json({ packs: COIN_PACKS, fee: ACADEMY_FEE, buyable: !!env.COIN_LINKS,
                    coinShare: COIN_SHARE, coinsPerEur: COINS_PER_EUR });
    }

    if (path === '/coins/balance' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      return json(await wallet(env, g.code));
    }

    /* Where to send somebody who wants to buy coins. COIN_LINKS is a JSON map
       of pack id to a payment link, set as a Worker secret — the links are not
       in the repo because the repo is public, and a payment link in a public
       file is somebody else's checkout page. */
    if (path === '/coins/checkout' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const pack = COIN_PACKS.filter(p => p.id === String(body.pack))[0];
      if (!pack) return json({ error: 'no such pack' }, 400);
      let links = null;
      try { links = env.COIN_LINKS ? JSON.parse(env.COIN_LINKS) : null; } catch (e) {}
      if (!links || !links[pack.id]) {
        return json({
          error: 'buying coins is not switched on yet',
          detail: 'set a Worker secret called COIN_LINKS holding {"' + pack.id + '":"<payment link>"}'
        }, 503);
      }
      /* The account travels with the payment so the webhook knows who to
         credit. It is the recovery code, which is not a password and cannot
         sign in on its own. */
      const sep = links[pack.id].indexOf('?') === -1 ? '?' : '&';
      return json({ url: links[pack.id] + sep + 'client_reference_id=' + encodeURIComponent(g.code),
                    pack });
    }

    /* The payment processor says a pack was paid for. THIS IS THE ONLY WAY
       COINS ARE CREATED: a request from the browser cannot mint anything, and
       a request that cannot be verified is refused rather than trusted. */
    if (path === '/coins/paid' && request.method === 'POST') {
      if (!env.COIN_SECRET) return json({ error: 'no COIN_SECRET set on this worker' }, 503);
      const given = String(body.sig || '');
      const code = cleanCode(body.code || '');
      const packId = String(body.pack || '');
      const ref = cleanLine(body.ref, 64);
      const pack = COIN_PACKS.filter(p => p.id === packId)[0];
      if (!code || !pack || !ref) return json({ error: 'bad call' }, 400);
      const want = await hmacHex(env.COIN_SECRET, code + '|' + packId + '|' + ref);
      if (!sameSecret(given, want)) return json({ error: 'signature does not match' }, 403);
      /* Paid twice is credited once: the processor retries webhooks, and a
         retry that credits again is free coins for anybody who notices. */
      if (await env.DB.get('paid:' + ref)) return json({ ok: true, already: true });
      await env.DB.put('paid:' + ref, String(Date.now()));
      const w = await wallet(env, code);
      w.bal += pack.coins;
      w.bought += pack.coins;
      await walletPut(env, code, w);
      return json({ ok: true, coins: pack.coins, balance: w.bal });
    }

    /* ---------- proving sixteen ---------- */
    /* Starts a check with the age assurance provider. This worker never sees a
       face: the scan happens at the provider, and what comes back here is a
       signed yes or no. */
    if (path === '/age/start' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      if (!env.AGE_PROVIDER) {
        return json({
          error: 'age checks are not switched on yet',
          detail: 'set AGE_PROVIDER to a certified age assurance service. NovaClip must never take or '
                + 'keep the photograph itself: a face is biometric data under GDPR Article 9, and a '
                + 'picture of a child proving they are not a child is the worst thing in the building '
                + 'to be holding.'
        }, 503);
      }
      const sep = env.AGE_PROVIDER.indexOf('?') === -1 ? '?' : '&';
      return json({ url: env.AGE_PROVIDER + sep + 'ref=' + encodeURIComponent(g.code) +
                         '&threshold=' + ACADEMY_WORK_AGE });
    }

    /* The provider's answer. Signed, because this is the thing that decides
       whether somebody may be paid. */
    if (path === '/age/result' && request.method === 'POST') {
      if (!env.AGE_SECRET) return json({ error: 'no AGE_SECRET set on this worker' }, 503);
      const code = cleanCode(body.code || '');
      const pass = body.pass === true;
      const ref = cleanLine(body.ref, 64);
      if (!code || !ref) return json({ error: 'bad call' }, 400);
      const want = await hmacHex(env.AGE_SECRET, code + '|' + (pass ? 'pass' : 'fail') + '|' + ref);
      if (!sameSecret(String(body.sig || ''), want)) return json({ error: 'signature does not match' }, 403);
      if (!pass) {
        await env.DB.delete('age:' + code);
        return json({ ok: true, verified: false });
      }
      /* A boolean, a date and the provider's reference. No image, no estimate,
         no face — none of it is here to be leaked. */
      await env.DB.put('age:' + code, JSON.stringify({
        ok: true, at: Date.now(), by: cleanLine(body.by, 40) || 'provider', ref
      }));
      return json({ ok: true, verified: true });
    }

    if (path === '/age/standing' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const proof = await ageProof(env, g.code);
      return json({ verified: !!proof, at: proof ? proof.at : 0, by: proof ? proof.by : '',
                    configured: !!env.AGE_PROVIDER, threshold: ACADEMY_WORK_AGE });
    }

    /* A rating, from somebody who actually had the lesson. Checked here and
       nowhere else: the page can be edited by whoever is reading it. */
    if (path === '/academy/rate' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const id = cleanLine(body.id, 24);
      const stars = cleanStars(body.stars);
      if (!stars) return json({ error: 'a rating is one to five stars' }, 400);
      const row = await env.DB.get('lst:' + id, 'json');
      if (!row) return json({ error: 'no such lesson' }, 404);
      if (row.code === g.code) return json({ error: 'you cannot rate your own lesson' }, 400);
      if (!(await env.DB.get('ord:' + g.code + ':' + id))) {
        return json({ error: 'only somebody who has the lesson can rate it' }, 403);
      }
      const had = await env.DB.get('rate:' + g.code + ':' + id, 'json');
      if (had) return json({ error: 'you have already rated this one', stars: had.stars }, 409);
      if (await rateLimited(env, 'rate:' + g.code, 1500)) return json({ error: 'slow down' }, 429);

      await env.DB.put('rate:' + g.code + ':' + id, JSON.stringify({ stars, at: Date.now() }));
      row.sum = (row.sum || 0) + stars;
      row.n = (row.n || 0) + 1;
      await env.DB.put('lst:' + id, JSON.stringify(row));
      /* And on the teacher, which is what the level is read from. */
      const t = (await env.DB.get('tstats:' + row.code, 'json')) || { sales: 0, sum: 0, n: 0 };
      t.sum += stars; t.n += 1;
      await env.DB.put('tstats:' + row.code, JSON.stringify(t));
      return json({ ok: true, stars, lesson: { stars: Math.round((row.sum / row.n) * 10) / 10, n: row.n } });
    }

    /* ---------- the teacher's own profile ---------- */
    /* Read: only ever your own, and it is the one answer that carries the name
       off the certificate, because that is the account it belongs to. */
    if (path === '/academy/profile' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const st = await teachStanding(env, g.code, body.key);
      const prof = await profileOf(env, g.code);
      return json({
        profile: prof || { name: '', tagline: '', bio: '' },
        certName: st.cert ? st.cert.name : '',
        tier: st.cert ? st.cert.tier : '', serial: st.cert ? st.cert.serial : '',
        stats: st.stats,
        limits: { name: PROF_NAME_MAX, tagline: PROF_TAG_MAX, bio: PROF_BIO_MAX, desc: LESSON_DESC_MAX }
      });
    }

    if (path === '/academy/profile/save' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const st = await teachStanding(env, g.code, body.key);
      if (!st.mayPublish) return json({ error: st.why || 'not allowed to teach yet' }, 403);

      const name = cleanLine(body.name, PROF_NAME_MAX);
      const tagline = cleanLine(body.tagline, PROF_TAG_MAX);
      const bio = cleanText(body.bio, PROF_BIO_MAX);
      if (name && name.length < 3) return json({ error: 'a teaching name needs at least three characters' }, 400);
      for (const field of [name, tagline, bio]) {
        const seen = screen(field);
        if (!seen.ok) return json({ error: 'that wording will not pass — ' + seen.kind }, 400);
        const c = contactIn(field);
        if (c) {
          return json({ error: 'a profile cannot carry ' + c,
            detail: 'there is no messaging in the Academy and no way to reach a teacher, on purpose. '
                  + 'Two children arranging to talk privately on the back of a sale is the thing this '
                  + 'marketplace was built not to have' }, 400);
        }
      }

      const prev = await profileOf(env, g.code);
      const lower = name.toLowerCase();
      /* A NAME BELONGS TO ONE ACCOUNT — the leaderboard learned this the hard
         way, where two people called the same thing were one row. Here it is
         worse than a collision: a teaching name somebody else is known by is
         an impersonation, and the lesson is sold on the strength of it. */
      if (name && (!prev || prev.name !== name)) {
        const taken = await env.DB.get('tname:' + lower);
        if (taken && taken !== g.code) {
          return json({ error: 'somebody else already teaches under that name' }, 409);
        }
      }
      if (await rateLimited(env, 'prof:' + g.code, 3000)) return json({ error: 'slow down' }, 429);

      const prof = { name, tagline, bio, at: Date.now(),
                     since: (prev && prev.since) || Date.now() };
      await env.DB.put('prof:' + g.code, JSON.stringify(prof));
      if (name) await env.DB.put('tname:' + lower, g.code);
      /* The old name is released, or nobody could ever change their mind about
         one and it would sit there blocking the name for everybody. */
      if (prev && prev.name && prev.name.toLowerCase() !== lower) {
        const held = await env.DB.get('tname:' + prev.name.toLowerCase());
        if (held === g.code) await env.DB.delete('tname:' + prev.name.toLowerCase());
      }
      return json({ ok: true, profile: prof });
    }

    /* ---------- the free first lesson ---------- */
    /* With no id, this only answers "have I still got mine, and if not where
       did it go". With an id, it spends it. */
    if (path === '/academy/free' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const claim = await env.DB.get('free:' + g.code, 'json');
      const id = cleanLine(body.id, 24);

      if (!id) {
        let on = null;
        if (claim) {
          const was = await env.DB.get('lst:' + claim.id, 'json');
          on = { id: claim.id, title: was ? was.title : '',
                 by: was ? (await publicTeacher(env, claim.seller, was.by)).by : '', at: claim.at };
        }
        return json({ used: !!claim, left: !claim, on });
      }

      const row = await env.DB.get('lst:' + id, 'json');
      if (!row || row.hidden) return json({ error: 'no such lesson' }, 404);
      if (row.code === g.code) return json({ error: 'that is your own lesson' }, 400);
      if (await env.DB.get('ord:' + g.code + ':' + id)) return json({ ok: true, already: true });
      if ((await firstLessonOf(env, row.code)) !== id) {
        return json({ error: 'that is not this creator\'s first lesson',
          detail: 'what is free is the first lesson a teacher put up. This one is not it' }, 403);
      }
      if (claim) {
        const was = await env.DB.get('lst:' + claim.id, 'json');
        const who = was ? (await publicTeacher(env, claim.seller, was.by)).by : 'another creator';
        return json({
          error: 'your free lesson is already spent',
          detail: 'you took it from ' + who + (was ? ' — ' + was.title : '') + '. One free first '
                + 'lesson, from one creator, is the whole offer',
          on: { id: claim.id, title: was ? was.title : '', by: who }
        }, 409);
      }
      if (await rateLimited(env, 'free:' + g.code, 2000)) return json({ error: 'slow down' }, 429);

      await env.DB.put('free:' + g.code, JSON.stringify({ seller: row.code, id, at: Date.now() }));
      /* An order, so the lesson opens and can be rated — and marked free, so
         the seller's page can tell the difference between a sale and a
         sample. */
      await env.DB.put('ord:' + g.code + ':' + id,
        JSON.stringify({ at: Date.now(), coins: 0, fee: 0, net: 0, price: 0, free: true }));
      const earned = (await env.DB.get('earn:' + row.code, 'json')) ||
                     { coins: 0, fee: 0, money: 0, sales: 0 };
      earned.free = (earned.free || 0) + 1;
      await env.DB.put('earn:' + row.code, JSON.stringify(earned));
      /* And deliberately nothing written to tstats: a lesson given away is not
         a sale, so it buys no level and unlocks no price. */
      return json({ ok: true, free: true, id, title: row.title });
    }

    if (path === '/academy/mine' && request.method === 'POST') {
      const g = await gate(env, body);
      if (g.stop) return g.stop;
      const mine = (await env.DB.get('mine:' + g.code, 'json')) || [];
      const first = await firstLessonOf(env, g.code);
      const rows = [];
      for (const id of mine) {
        const row = await env.DB.get('lst:' + id, 'json');
        if (row) rows.push({ id: row.id, title: row.title, price: row.price, coins: row.coins,
                             coinsOnly: row.coinsOnly, cat: row.cat, hidden: !!row.hidden, at: row.at,
                             /* Which one of yours is the shop window. Worth
                                saying out loud, because it is decided by what
                                you published first rather than chosen. */
                             firstFree: row.id === first });
      }
      const earned = (await env.DB.get('earn:' + g.code, 'json')) ||
                     { coins: 0, fee: 0, money: 0, sales: 0 };
      return json({ listings: rows, earned, wallet: await wallet(env, g.code), fee: ACADEMY_FEE,
                    profile: await profileOf(env, g.code) });
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
        if (await rateLimited(env, 'board:' + who, WRITE_COOLDOWN_MS)) return json({ error: 'slow down' }, 429);

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
        const wanted = cleanName(body.name);
        if (!(await nameOwner(env, wanted, body.key, who, ip)).ok) {
          return json({ error: 'the name "' + wanted + '" belongs to another player', taken: true }, 409);
        }

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


    /* ======================================================================
       MINI-GAME SCORES  —  GET /scores?game=flap   POST /scores
       ======================================================================
       /board above is the arena's: it is shaped around kills, deaths and a
       map. The four mini-games have one number each and no map, so they get
       their own route rather than four awkward map names.

       WHICH WAY IS UP IS PER GAME, AND IT MATTERS

       Reaction time is the odd one out: 180ms beats 240ms. Sorting every game
       descending would have put the slowest reflexes on top of that board and
       nobody would have spotted it from the code, because the board would
       still look like a board. The direction lives in GAMES below, on the
       server, so a client cannot claim its own.

       ONE ROW PER NAME

       A player's entry is their best, not every attempt. Otherwise one person
       playing all afternoon owns the whole table.
       ==================================================================== */
    if (path === '/scores') {
      /* Keys are letters only, because cleanGame() below strips everything
         else — "reaction_best" would arrive as "reactionbest" and quietly not
         match a key spelled with the underscore. */
      const GAMES = {
        typing:       { dir: 'high', max: 400,    label: 'WPM' },
        flap:         { dir: 'high', max: 100000, label: 'score' },
        reaction:     { dir: 'low',  max: 5000,   label: 'ms' },
        aim:          { dir: 'high', max: 10000,  label: 'points' },
        /* TWO SECOND BOARDS, MEASURING THE OTHER THING EACH GAME KNOWS.

           reactionbest is the fastest single go of the five, where `reaction`
           is the median. They are different questions — "how fast can you be"
           against "how fast are you" — and the median is still the one that
           goes to Progress. Pressing before green voids the go, so the best-of
           board cannot be farmed by hammering; it is luckier than the median,
           not cheatable.

           aimaccuracy is hits as a percentage of shots, which the target game
           has always counted and never posted. It needs a floor: one shot,
           one hit, 100% would otherwise top the table for ever. The floor is
           enforced on the client where the shot count lives, and the range
           here is 0-100 so nothing outside a percentage can be stored. */
        reactionbest: { dir: 'low',  max: 5000,   label: 'ms' },
        aimaccuracy:  { dir: 'high', max: 100,    label: '% accurate' }
      };
      const cleanGame = (v) => {
        const g = String(v || '').toLowerCase().replace(/[^a-z]/g, '');
        return GAMES[g] ? g : null;
      };
      const scoreKey = (g) => 'scores:' + g;

      if (request.method === 'GET') {
        const g = cleanGame(url.searchParams.get('game'));
        if (!g) return json({ error: 'unknown game' }, 400);
        const rows = (await env.DB.get(scoreKey(g), 'json')) || [];
        return json({ game: g, dir: GAMES[g].dir, label: GAMES[g].label, board: rows });
      }

      if (request.method === 'POST') {
        const g = cleanGame(body.game);
        if (!g) return json({ error: 'unknown game' }, 400);
        const spec = GAMES[g];

        if (await rateLimited(env, 'sc:' + g + ':' + who, 5000)) {
          return json({ error: 'slow down' }, 429);
        }

        /* A score is a number in range or it is nothing. 0 is a legitimate
           score in three of these games, so this cannot use a falsy check. */
        const raw = Number(body.score);
        if (!Number.isFinite(raw)) return json({ error: 'score must be a number' }, 400);
        const score = clampInt(Math.round(raw), 0, spec.max);

        /* Same name rule as the arena board: the first account to play under a
           name owns it, and after that only that account may post under it.
           Without this, one row per name means anybody can overwrite anybody. */
        const wanted = cleanName(body.name);
        if (!(await nameOwner(env, wanted, body.key, who, ip)).ok) {
          return json({ error: 'the name "' + wanted + '" belongs to another player', taken: true }, 409);
        }

        const rows = (await env.DB.get(scoreKey(g), 'json')) || [];
        const better = (a, b) => (spec.dir === 'low' ? a < b : a > b);

        const best = new Map();
        for (const r of rows) {
          const cur = best.get(r.name);
          if (!cur || better(r.score, cur.score)) best.set(r.name, r);
        }
        const mine = best.get(wanted);
        const improved = !mine || better(score, mine.score);
        if (improved) best.set(wanted, { name: wanted, score: score, at: Date.now() });

        const top = [...best.values()]
          .sort((a, b) => (spec.dir === 'low' ? a.score - b.score : b.score - a.score) || a.at - b.at)
          .slice(0, TOP_N);
        await env.DB.put(scoreKey(g), JSON.stringify(top));

        const rank = top.findIndex((r) => r.name === wanted) + 1;
        return json({ ok: true, improved, rank: rank || null,
                      dir: spec.dir, label: spec.label, board: top });
      }
    }

    /* ======================================================================
       MODERATION
       ======================================================================
       The worker already suspends accounts by itself for swearing and spam.
       That catches the obvious and misses everything else — a post that is
       cruel without a single rude word, a photo that should not be up, someone
       being ground down in the replies. Those need a person.

       WHO IS A MODERATOR

       Whoever's account key is in the MOD_KEYS secret, comma separated:

         wrangler secret put MOD_KEYS

       Not a flag in KV, because anything in KV is written by a route and a
       route can have a bug. A secret is changed by whoever holds the
       Cloudflare login, which for a site aimed at 13-18s is the right bar. If
       MOD_KEYS is unset there are no moderators and the tools say so rather
       than letting everybody in.

       WHAT A MODERATOR CAN AND CANNOT DO

       Can: see the queue, hide a post, suspend an account for a day, and
       dismiss a report. Every action is written to a log with who did it.

       Cannot: read anybody's saves, see an account's recovery code, or unhide
       something they hid without it showing in the log. A moderator is not an
       administrator, and the difference matters when the moderators are
       teenagers too.
       ==================================================================== */
    const modKeys = String(env.MOD_KEYS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const isMod = (k) => validKey(k) && modKeys.includes(k);

    /* Anybody may report. A report is a request for a human to look, so it is
       deliberately cheap to make and rate limited rather than gated. */
    if (path === '/report' && request.method === 'POST') {
      if (await rateLimited(env, 'rep:' + who, 10000)) return json({ error: 'slow down' }, 429);
      const id = String(body.postId || '').slice(0, 64);
      if (!id) return json({ error: 'which post?' }, 400);

      const queue = (await env.DB.get('mod:queue', 'json')) || [];
      /* One row per post. Ten people reporting the same thing is one job for a
         moderator, not ten — but the count is what tells them it is urgent. */
      const found = queue.find((r) => r.postId === id);
      if (found) {
        found.count = (found.count || 1) + 1;
        found.at = Date.now();
      } else {
        queue.unshift({
          postId: id,
          reason: cleanName(body.reason || 'Not specified').slice(0, 60),
          note: String(body.note || '').replace(/[\x00-\x1f]/g, '').slice(0, 200),
          count: 1, at: Date.now(), state: 'open'
        });
      }
      await env.DB.put('mod:queue', JSON.stringify(queue.slice(0, 200)));
      return json({ ok: true });
    }

    if (path === '/mod/queue' && request.method === 'POST') {
      if (!modKeys.length) {
        return json({ error: 'no_moderators',
          message: 'No moderator keys are set on this worker, so nobody can moderate. ' +
                   'Set MOD_KEYS — see the MODERATION block in leaderboard-worker.js.' }, 503);
      }
      if (!isMod(body.key)) return json({ error: 'not_a_moderator' }, 403);
      const queue = (await env.DB.get('mod:queue', 'json')) || [];
      const log = (await env.DB.get('mod:log', 'json')) || [];
      const hidden = (await env.DB.get('mod:hidden', 'json')) || [];
      return json({ ok: true, queue, log: log.slice(0, 50), hidden });
    }

    if (path === '/mod/act' && request.method === 'POST') {
      if (!isMod(body.key)) return json({ error: 'not_a_moderator' }, 403);
      const act = String(body.act || '');
      const id = String(body.postId || '').slice(0, 64);
      const who = String(body.key).slice(0, 6);          // enough to tell them apart, not the key

      const queue = (await env.DB.get('mod:queue', 'json')) || [];
      const row = queue.find((r) => r.postId === id);

      if (act === 'hide' || act === 'unhide') {
        let hidden = (await env.DB.get('mod:hidden', 'json')) || [];
        if (act === 'hide') { if (!hidden.includes(id)) hidden.push(id); }
        else hidden = hidden.filter((x) => x !== id);
        await env.DB.put('mod:hidden', JSON.stringify(hidden.slice(-500)));
        if (row) row.state = act === 'hide' ? 'hidden' : 'open';
      } else if (act === 'dismiss') {
        if (row) row.state = 'dismissed';
      } else if (act === 'suspend') {
        const code = cleanCode(body.code || '');
        if (!code) return json({ error: 'which account?' }, 400);
        await suspend(env, code, 'Moderator review: ' + (body.reason || 'community guidelines'));
        if (row) row.state = 'actioned';
      } else {
        return json({ error: 'unknown action' }, 400);
      }

      await env.DB.put('mod:queue', JSON.stringify(queue));

      /* The log is append-only from here. A moderator who hides something and
         then quietly unhides it still leaves both lines. */
      const log = (await env.DB.get('mod:log', 'json')) || [];
      log.unshift({ act: act, postId: id || null, by: who, at: Date.now(),
                    reason: String(body.reason || '').slice(0, 80) });
      await env.DB.put('mod:log', JSON.stringify(log.slice(0, 200)));

      return json({ ok: true, queue });
    }

    /* The feed asks for this so a hidden post stays hidden for everybody, not
       only for the moderator who hid it. Public on purpose: it is a list of
       ids that are NOT to be shown, which leaks nothing. */
    if (path === '/mod/hidden' && request.method === 'GET') {
      return json({ hidden: (await env.DB.get('mod:hidden', 'json')) || [] });
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
