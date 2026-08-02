<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<title>NovaClip Studio</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', -apple-system, sans-serif; }
body { background: #060608; color: #EAF2FF; overflow-x: hidden; }
a { text-decoration: none; color: inherit; }

.sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 210px; background: rgba(12,12,16,0.85); backdrop-filter: blur(20px); display: flex; flex-direction: column; padding: 20px 0; gap: 4px; z-index: 998; border-right: 1px solid rgba(255,255,255,0.06); }
.sidebar a { font-size: 1rem; color: #EAF2FF; display: flex; align-items: center; gap: 12px; padding: 12px 20px; font-weight: 600; transition: background 0.2s; }
.sidebar a:hover { background: rgba(114,9,183,0.25); }
.sidebar a.aidot { background: linear-gradient(135deg, #F72585, #7209B7, #4CC9F0); color: white; border-radius: 12px; margin: 6px 14px; }
.sidebar .themewrap { margin-top: auto; padding: 16px 20px; }
.sidebar .themewrap label { display: block; font-size: 0.78rem; opacity: 0.6; margin-bottom: 6px; }
.sidebar select { width: 100%; font-size: 0.95rem; background: rgba(255,255,255,0.05); color: #EAF2FF; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 9px; }

.main { margin-left: 210px; padding: 34px 40px 60px; position: relative; z-index: 2; }
@media (max-width: 820px) { .main { margin-left: 0; padding: 20px; } .sidebar { position: static; width: 100%; flex-direction: row; flex-wrap: wrap; } .sidebar .themewrap { margin: 0; } }

.head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; }
h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; letter-spacing: -1.5px; }
h1 .grad { background: linear-gradient(90deg, #F72585, #7209B7, #4CC9F0); -webkit-background-clip: text; background-clip: text; color: transparent; }
.subtitle { color: #7E8AA6; margin-bottom: 24px; font-size: 1.02rem; }

.gbtn { padding: 13px 28px; border-radius: 40px; border: none; font-weight: 800; cursor: pointer; background: linear-gradient(90deg, #00F0FF, #4CC9F0); color: #04121a; font-size: 1rem; transition: transform 0.2s, box-shadow .2s; }
.gbtn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(0,240,255,0.4); }
#uname { display: none; color: #4CC9F0; font-weight: 700; }
#authmsg { display: none; max-width: 420px; margin-top: 10px; padding: 12px 14px; border-radius: 12px; font-size: 0.86rem; line-height: 1.55; border: 1px solid rgba(247,37,133,0.45); background: rgba(247,37,133,0.10); color: #ffd9e6; }
#authmsg b { color: #fff; }
#authmsg code { background: rgba(0,0,0,0.35); padding: 1px 6px; border-radius: 5px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.82rem; }
#authmsg.working { border-color: rgba(76,201,240,0.45); background: rgba(76,201,240,0.10); color: #cdeaff; }

.cardgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-top: 10px; }
.tool { background: linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 22px; cursor: pointer; transition: 0.25s; }
.tool:hover { transform: translateY(-5px); border-color: rgba(0,240,255,0.4); box-shadow: 0 16px 40px rgba(0,240,255,0.12); }
.tool .ico { font-size: 1.8rem; margin-bottom: 10px; }
.tool h3 { font-size: 1.1rem; margin-bottom: 6px; }
.tool p { color: #7E8AA6; font-size: 0.9rem; line-height: 1.5; }

#toolbar { display: none; }
.panelbox { margin-top: 20px; text-align: left; display: none; background: rgba(255,255,255,0.04); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 22px; }
#duelbox { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #EAF2FF; }
.smallbtn { margin-top: 12px; padding: 11px 22px; border-radius: 24px; border: none; cursor: pointer; font-weight: 800; color: white; background: linear-gradient(90deg, #F72585, #7209B7); }
.compcard { border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 16px; margin-bottom: 12px; background: rgba(255,255,255,0.02); }
.compcard b { font-size: 1.05rem; }
.compcard .row { display: flex; flex-wrap: wrap; gap: 16px; margin: 8px 0; font-size: 0.9rem; color: #b8bccb; }
.compcard .row span b { color: #00F0FF; font-size: 0.9rem; }
.compcard .desc { font-size: 0.85rem; color: #7E8AA6; line-height: 1.5; margin: 6px 0; }
.orb { position: fixed; border-radius: 50%; filter: blur(90px); opacity: 0.25; z-index: 0; pointer-events: none; }
.orb.a { width: 440px; height: 440px; background: #7209B7; top: -80px; right: 6%; }
.orb.b { width: 380px; height: 380px; background: #F72585; bottom: -60px; left: 20%; }
</style>
</head>
<body>
<div class='sidebar'>
  <a href='index.html' data-t='home'>Home</a>
  <a href='app.html' data-t='studio'>Studio</a>
  <a href='analytics.html' data-t='analytics'>Analytics</a>
  <a href='trends.html' data-t='trends'>Trend Spotter</a>
  <a href='editor.html' data-t='editor'>Editor</a>
  <a href='game.html' data-t='sniper'>Games</a>
  <a href='ai.html' class='aidot' data-t='ai'>NovaClip AI</a>
  <div class='themewrap'>
    <label data-t='language'>Language</label>
    <select id='langpick'></select>
  </div>
</div>

<div class='orb a'></div><div class='orb b'></div>

<div class='main'>
  <div class='head'>
    <div>
      <h1><span class='grad' data-t='studio_h'>NovaClip Studio</span></h1>
      <p class='subtitle' data-t='studio_sub'>Connect your channel and scout the competition.</p>
    </div>
    <div>
      <button id='gbtn' class='gbtn' data-t='signin'>Sign in with Google</button>
      <p id='uname'></p>
      <div id='authmsg'></div>
    </div>
  </div>

  <div id='toolbar'>
    <div class='cardgrid'>
      <div class='tool' id='compbtn'><div class='ico'></div><h3 data-t='t_comp'>Closest competitors</h3><p data-t='t_comp_d'>Channels closest to your size — full stats and links.</p></div>
      <div class='tool' id='duelbtn'><div class='ico'></div><h3 data-t='t_duel'>Duel a channel</h3><p data-t='t_duel_d'>Challenge a channel within 20k subs and win points.</p></div>
      <a class='tool' href='analytics.html'><div class='ico'></div><h3 data-t='t_analytics'>Full analytics</h3><p data-t='t_analytics_d'>Deep charts comparing you to rivals — on its own page.</p></a>
    </div>
  </div>

  <div id='duelsetup' class='panelbox'>
    <b data-t='duel_label'>Views and subs duel (max 20k subs difference between channels)</b><br><br>
    <input id='duelbox' data-tph='opp_ph' placeholder='Opponent channel name...'>
    <button id='duelgo' class='smallbtn' data-t='fight'>Fight!</button>
  </div>
  <div id='toolout' class='panelbox'></div>
</div>

<script>
/* Firebase arrives as a module from gstatic.com, and a module script is deferred
   — so for the first moment of the page, and forever if that request is blocked
   (school filter, ad blocker, a country that cannot reach Google), the button
   below is a button with nothing behind it. Clicking it does nothing at all,
   which reads as "the site is broken" and gives nobody anything to act on.
   This plain script runs first and puts a holding answer on every copy of the
   button; the module replaces it the instant it is ready. */
(function () {
  function boxes() { return document.querySelectorAll('#authmsg'); }
  function say(html) {
    var bs = boxes();
    for (var i = 0; i < bs.length; i++) { bs[i].innerHTML = html; bs[i].style.display = 'block'; }
  }
  function bind() {
    var bs = document.querySelectorAll('#gbtn');
    for (var i = 0; i < bs.length; i++) {
      if (!bs[i].onclick) bs[i].onclick = function () {
        say(window.ncAuthReady ? 'One moment...' : 'Still loading Google sign-in. If this does not clear in a few seconds, something on this network is blocking <code>www.gstatic.com</code>.');
      };
    }
  }
  document.addEventListener('DOMContentLoaded', bind);
  bind();
  setTimeout(function () {
    if (window.ncAuthReady) return;
    say('<b>Google\'s sign-in library did not load.</b><br>The page needs <code>www.gstatic.com</code>, ' +
        'and something blocked it — usually an ad blocker, a school or work network filter, or being offline. ' +
        'Try another network or turn the blocker off for this site, then reload.');
  }, 8000);
})();
</script>
<script type='module'>
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCKJVKqArOofTZT4fiz18cs_-thLB1O2J4',
  authDomain: 'novaclip-eaf8c.firebaseapp.com',
  projectId: 'novaclip-eaf8c',
  storageBucket: 'novaclip-eaf8c.firebasestorage.app',
  messagingSenderId: '299962701489',
  appId: '1:299962701489:web:766f4ea8632830c625b490'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let ytToken = null, myStats = null;

function saveToken(tok, channel) {
  ytToken = tok;
  let prev = {};
  try { prev = JSON.parse(localStorage.getItem('nc_yt') || '{}') || {}; } catch (e) {}
  // keep the channel title — certificates are issued in the connected channel's name
  const rec = { t: tok, exp: Date.now() + 50*60*1000, channel: channel || prev.channel || '' };
  localStorage.setItem('nc_yt', JSON.stringify(rec));
}
function rememberChannel(title) {
  if (!title) return;
  let rec = {};
  try { rec = JSON.parse(localStorage.getItem('nc_yt') || '{}') || {}; } catch (e) {}
  if (rec.channel !== title) { rec.channel = title; localStorage.setItem('nc_yt', JSON.stringify(rec)); }
  if (typeof logSkill === 'function' && !localStorage.getItem('nc_yt_logged')) {
    localStorage.setItem('nc_yt_logged', '1');
    logSkill('yt_connect');
  }
}
function loadToken() { try { const s = JSON.parse(localStorage.getItem('nc_yt') || 'null'); if (s && s.exp > Date.now()) return s.t; } catch (e) {} return null; }

/* Everything below works through querySelectorAll, not getElementById, on
   purpose. If this file ever gets pasted into itself the page shows two of every
   control, and getElementById only ever finds the first — you click the button
   you can see and nothing happens, because the handler went on the copy above
   it. That is exactly the "sign-in does nothing" bug. Binding every copy makes
   the page work even while it is broken, and nova.js removes the duplicate. */
const all = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel));

function note(html, kind) {
  const boxes = all('#authmsg');
  if (!boxes.length) { if (kind !== 'working') alert(html.replace(/<[^>]+>/g, '')); return; }
  boxes.forEach(b => { b.innerHTML = html; b.className = kind === 'working' ? 'working' : ''; b.style.display = html ? 'block' : 'none'; });
}

/* Google hands back an error code and a sentence written for developers. A
   fourteen-year-old reading "auth/unauthorized-domain" learns nothing, so each
   one is translated into the thing that actually has to be clicked. */
function explainAuth(e) {
  const code = (e && e.code) || '';
  const host = location.hostname || 'this site';
  if (code === 'auth/unauthorized-domain')
    return '<b>Google will not sign anyone in from this address yet.</b><br>' +
      'Open the Firebase console for <code>novaclip-eaf8c</code>, go to <b>Authentication -> Settings -> Authorized domains</b>, ' +
      'press <b>Add domain</b> and type <code>' + host + '</code>. Sign-in starts working within a minute — no code change needed.';
  if (code === 'auth/operation-not-allowed')
    return '<b>Google sign-in is switched off for this project.</b><br>' +
      'Firebase console -> <b>Authentication -> Sign-in method -> Google -> Enable</b>, then save.';
  if (code === 'auth/popup-blocked')
    return 'Your browser blocked the Google window. Allow pop-ups for <code>' + host + '</code>, or press the button again — it will use a full-page redirect instead.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
    return 'The Google window closed before sign-in finished. Press the button again when you are ready.';
  if (code === 'auth/network-request-failed')
    return 'No connection to Google. Check the network and try again.';
  if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid')
    return '<b>The Firebase key in this page is not valid.</b> Copy the current config from Firebase console -> Project settings -> Your apps, and replace <code>firebaseConfig</code> in app.html.';
  return 'Sign-in failed: ' + ((e && e.message) || 'unknown error') + (code ? ' <code>' + code + '</code>' : '');
}

function signedInUI(name) {
  all('#gbtn').forEach(b => b.style.display = 'none');
  note('');
  all('#uname').forEach(p => {
    p.style.display = 'block';
    p.innerHTML = name + ' &nbsp; <a href="#" class="signoutlink" style="color:#7E8AA6;font-size:0.85rem;">Sign out</a>';
  });
  all('#toolbar').forEach(t => t.style.display = 'block');
  all('.signoutlink').forEach(so => so.onclick = (e) => {
    e.preventDefault(); localStorage.removeItem('nc_yt'); auth.signOut().then(() => location.reload());
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    signedInUI(user.displayName);
    const cached = loadToken();
    if (cached) {
      ytToken = cached;
      try {
        const data = await yt('channels?part=statistics,snippet,contentDetails&mine=true');
        if (data.items && data.items.length) { myStats = data.items[0]; rememberChannel(myStats.snippet.title); }
        else { ytToken = null; localStorage.removeItem('nc_yt'); }
      } catch (e) { ytToken = null; }
    }
  }
});

function yt(url) { return fetch('https://www.googleapis.com/youtube/v3/' + url, { headers: { Authorization: 'Bearer ' + ytToken } }).then(r => r.json()); }
function show(html) { const box = document.getElementById('toolout'); box.style.display = 'block'; box.innerHTML = html; }

function ytProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
  return provider;
}

/* Turn a sign-in result into a working session, or say why not. Split out
   because the popup and the redirect both land here. */
async function afterSignIn(result) {
  const cred = GoogleAuthProvider.credentialFromResult(result);
  if (!cred || !cred.accessToken) {
    note('Signed in to Google, but it did not hand over permission to read your YouTube channel. ' +
         'Press the button again and tick the YouTube box on the consent screen.');
    return;
  }
  saveToken(cred.accessToken);
  const data = await yt('channels?part=statistics,snippet,contentDetails&mine=true');
  if (data.error) {
    note('Google signed you in, but YouTube refused the request: ' + data.error.message +
         '<br>If it mentions the API being disabled, enable <b>YouTube Data API v3</b> for project ' +
         '<code>novaclip-eaf8c</code> in the Google Cloud console.');
    return;
  }
  if (data.items && data.items.length) {
    myStats = data.items[0]; rememberChannel(myStats.snippet.title); signedInUI(myStats.snippet.title); note('');
  } else {
    note('That Google account has no YouTube channel on it. Sign out and use the account your channel lives on.');
  }
}

async function connect() {
  note('Opening Google...', 'working');
  try {
    await afterSignIn(await signInWithPopup(auth, ytProvider()));
  } catch (e) {
    /* Pop-ups are blocked by default on plenty of phones and school-managed
       browsers. Rather than dead-ending, hand the whole page to Google and pick
       the result back up on the way in — that path cannot be blocked. */
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
      note('Pop-up blocked — sending you to Google instead...', 'working');
      try { await signInWithRedirect(auth, ytProvider()); return; } catch (e2) { note(explainAuth(e2)); return; }
    }
    note(explainAuth(e));
    console.warn('sign-in failed', e);
  }
}
all('#gbtn').forEach(b => b.onclick = connect);
window.ncAuthReady = true;   // tells the holding script above to stand down

// coming back from the redirect fallback
getRedirectResult(auth).then(r => { if (r) afterSignIn(r); }).catch(e => note(explainAuth(e)));
// true means "you have a channel loaded and may proceed" — the tools check it,
// because running a competitor search against a null channel throws instead of
// telling anyone what went wrong
async function ensureToken() {
  if (ytToken && myStats) return true;
  const cached = loadToken();
  if (cached && !ytToken) {
    ytToken = cached;
    try { const d = await yt('channels?part=statistics,snippet,contentDetails&mine=true'); if (d.items && d.items.length) { myStats = d.items[0]; rememberChannel(myStats.snippet.title); return true; } } catch (e) {}
  }
  await connect();
  return !!(ytToken && myStats);
}

/* ============================================================================
   FINDING CHANNELS THAT ARE ACTUALLY YOUR SIZE
   The old version did two things wrong and they compounded.

   1. It searched "gaming channel", "vlog channel", "music channel". YouTube
      answers those with the BIGGEST channels that match, because that is what
      search is for. A creator with 1,200 subscribers was handed a pool of
      million-subscriber channels and told to pick from it.

   2. It ranked by the ABSOLUTE difference in subscribers. At 1,200 subs the
      gap to 200,000 is 198,800 and the gap to 900,000 is 898,800 — so it
      dutifully called the 200,000 channel your "closest competitor". Nothing
      about that is close. Size on YouTube is multiplicative: 600 and 2,400 are
      both one doubling away from 1,200, and that is the comparison that means
      something. So the ranking is now on the RATIO — |log(theirs / yours)| —
      and anything outside a quarter to four times your size is not offered at
      all.

   The search terms come from your own titles and description rather than a
   generic list, so the pool is at least in your subject. And when nothing in
   range turns up, it says so instead of printing a channel forty times your
   size with a straight face.
   ============================================================================ */
const STOPWORDS = new Set(('the a an and or of for to in on with my our your i we this that is are was ' +
  'it he she they you how what why when new best top vs video videos channel official full hd 4k ' +
  'shorts short live stream part ep episode').split(' '));

function seedTerms(myVideos) {
  const words = {};
  const feed = (text, weight) => {
    String(text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).forEach(w => {
      if (w.length < 4 || STOPWORDS.has(w)) return;
      words[w] = (words[w] || 0) + weight;
    });
  };
  (myVideos || []).forEach(v => feed(v.snippet && v.snippet.title, 3));
  feed(myStats.snippet.description, 1);
  feed(myStats.snippet.title, 2);
  const ranked = Object.keys(words).sort((a, b) => words[b] - words[a]).slice(0, 8);
  // pair the strongest words up: two-word queries are far more specific than one
  const out = [];
  for (let i = 0; i < ranked.length && out.length < 5; i += 2) {
    out.push(ranked[i + 1] ? ranked[i] + ' ' + ranked[i + 1] : ranked[i]);
  }
  if (!out.length) out.push(myStats.snippet.title);
  return out;
}

async function myRecentVideos(limit) {
  try {
    const up = myStats.contentDetails && myStats.contentDetails.relatedPlaylists &&
               myStats.contentDetails.relatedPlaylists.uploads;
    if (!up) return [];
    const d = await yt('playlistItems?part=snippet&maxResults=' + (limit || 12) + '&playlistId=' + up);
    return d.items || [];
  } catch (e) { return []; }
}

// how far apart two channels are in size, as a number of doublings
function sizeGap(a, b) { return Math.abs(Math.log2(Math.max(1, a) / Math.max(1, b))); }

/* "×2.3 your size" is the sentence a creator can act on. "+198,800 subs" is a
   number they cannot do anything with. */
function sizeWord(theirs, mine) {
  const r = Math.max(1, theirs) / Math.max(1, mine);
  if (r >= 0.95 && r <= 1.05) return 'the same size as you';
  return r > 1 ? '\u00d7' + r.toFixed(r < 10 ? 1 : 0) + ' your size'
               : '\u00d7' + (1 / r).toFixed(r > 0.1 ? 1 : 0) + ' smaller than you';
}

async function getCompetitors(n) {
  const mySubs = parseInt(myStats.statistics.subscriberCount || 0) || 1;
  const mine = await myRecentVideos(12);
  const seeds = seedTerms(mine);

  const ids = new Set();
  for (const q of seeds) {
    const sd = await yt('search?part=snippet&type=channel&maxResults=25&order=relevance&q=' + encodeURIComponent(q)).catch(() => null);
    if (sd && sd.items) sd.items.forEach(i => { if (i.snippet.channelId !== myStats.id) ids.add(i.snippet.channelId); });
    /* Search by VIDEO as well as by channel. A small creator's channel rarely
       ranks for anything, but their videos do — and every video has a channel
       behind it. This is where most of the genuinely small channels come from. */
    const vd = await yt('search?part=snippet&type=video&maxResults=25&order=relevance&q=' + encodeURIComponent(q)).catch(() => null);
    if (vd && vd.items) vd.items.forEach(i => { if (i.snippet.channelId !== myStats.id) ids.add(i.snippet.channelId); });
    if (ids.size >= 120) break;
  }
  if (!ids.size) return [];

  // channels? takes 50 ids at a time
  const all = [];
  const list = [...ids];
  for (let i = 0; i < list.length; i += 50) {
    const cd = await yt('channels?part=statistics,snippet,contentDetails&id=' + list.slice(i, i + 50).join(',')).catch(() => null);
    if (cd && cd.items) all.push(...cd.items);
  }

  const scored = all
    .filter(ch => ch.id !== myStats.id)
    // a hidden subscriber count is 0 in the API, which would look like the
    // closest possible match to a channel with none — drop those rather than
    // rank them first
    .filter(ch => !(ch.statistics && ch.statistics.hiddenSubscriberCount))
    .map(ch => ({ ch, gap: sizeGap(parseInt(ch.statistics.subscriberCount || 0), mySubs) }))
    .sort((a, b) => a.gap - b.gap);

  // within two doublings either way — a quarter your size to four times it
  const close = scored.filter(x => x.gap <= 2);
  const picked = (close.length ? close : scored).slice(0, n || 3);
  picked.forEach(x => { x.ch.__gap = x.gap; x.ch.__inRange = x.gap <= 2; });
  return picked.map(x => x.ch);
}

all('#compbtn').forEach(b => b.onclick = async () => {
  if (!await ensureToken()) return;
  show('Reading your videos, then looking for channels your size...');
  const comps = await getCompetitors(3);
  const mySubs = parseInt(myStats.statistics.subscriberCount);
  if (!comps.length) {
    show('<b>Nothing to compare you to yet.</b><br><span style="color:#7E8AA6">YouTube search returned no channels for your topics. ' +
         'That usually means the channel has very few videos to read subjects from — upload a couple more and try again.</span>');
    return;
  }
  const anyClose = comps.some(c => c.__inRange);
  const header = anyClose
    ? '<b style="font-size:1.15rem">Channels your size</b><br><span style="color:#7E8AA6;font-size:0.85rem">' +
      'Same subject as your videos, and within four times your subscriber count either way. ' +
      'Size is compared as a ratio, not a difference — 600 and 2,400 are both one doubling from 1,200.</span>'
    : '<b style="font-size:1.15rem">Nothing really close</b><br><span style="color:#ffb84d;font-size:0.85rem">' +
      'No channel in your subject came back within four times your size. These are the nearest ' +
      'anyway, and they are further from you than a fair comparison should be — treat them as a look ahead, not a rival.</span>';
  show(header + '<br><br>' + comps.map((c, i) => {
    const s = c.statistics;
    const subs = parseInt(s.subscriberCount || 0), views = parseInt(s.viewCount || 0), vids = parseInt(s.videoCount || 1);
    const avg = Math.round(views / Math.max(vids, 1));
    const gap = subs - mySubs;
    const created = c.snippet.publishedAt ? new Date(c.snippet.publishedAt).getFullYear() : '—';
    return '<div class="compcard"><b>' + (i + 1) + '. ' + c.snippet.title + '</b>' + (c.snippet.country ? ' · ' + c.snippet.country : '') +
      ' · since ' + created +
      '<div class="row"><span><b>' + subs.toLocaleString() + '</b> subs</span>' +
      '<span><b>' + views.toLocaleString() + '</b> views</span>' +
      '<span><b>' + vids.toLocaleString() + '</b> videos</span>' +
      '<span><b>~' + avg.toLocaleString() + '</b> views/video</span>' +
      '<span>' + (gap >= 0 ? '+' : '') + gap.toLocaleString() + ' vs you</span>' +
      '<span style="color:' + (c.__inRange ? '#b6ff3c' : '#ffb84d') + '">' + sizeWord(subs, mySubs) + '</span></div>' +
      '<div class="desc">' + (c.snippet.description ? c.snippet.description.slice(0, 160).replace(/</g, '&lt;') + '…' : 'No description') + '</div>' +
      '<a target="_blank" style="color:#00F0FF; font-size:0.88rem" href="https://www.youtube.com/channel/' + c.id + '">Open channel ↗</a></div>';
  }).join(''));
});

all('#duelbtn').forEach(b => b.onclick = () => {
  all('#duelsetup').forEach(d => d.style.display = d.style.display === 'block' ? 'none' : 'block');
});
all('#duelgo').forEach(b => b.onclick = async () => {
  if (!await ensureToken()) return;
  const box = document.querySelector('#duelbox');
  const name = box ? box.value : '';
  if (!name) { show('Type a channel name first.'); return; }
  show('Preparing the arena...');
  const mySubs = parseInt(myStats.statistics.subscriberCount), myViews = parseInt(myStats.statistics.viewCount);
  const sd = await yt('search?part=snippet&type=channel&maxResults=1&q=' + encodeURIComponent(name));
  if (!sd.items || !sd.items.length) { show('Could not find that channel.'); return; }
  const cd = await yt('channels?part=statistics,snippet&id=' + sd.items[0].snippet.channelId);
  const opp = cd.items[0];
  const oppSubs = parseInt(opp.statistics.subscriberCount || 0), oppViews = parseInt(opp.statistics.viewCount || 0);
  const gap = Math.abs(mySubs - oppSubs);
  if (gap > 20000) { show('Unfair matchup! The gap is ' + gap.toLocaleString() + ' subs — max allowed is 20,000. Pick someone closer!'); return; }
  let a = 0, b = 0;
  if (mySubs >= oppSubs) a++; else b++;
  if (myViews >= oppViews) a++; else b++;
  const winner = a > b ? myStats.snippet.title : (b > a ? opp.snippet.title : 'It is a TIE');
  show('<b>DUEL RESULT</b><br><br>' + myStats.snippet.title + ': ' + mySubs.toLocaleString() + ' subs · ' + myViews.toLocaleString() + ' views<br>' + opp.snippet.title + ': ' + oppSubs.toLocaleString() + ' subs · ' + oppViews.toLocaleString() + ' views<br><br><b>Winner: ' + winner + '</b>');
  if (a > b && window.addPts) addPts(20);
});


</script>
<script src='nova.js'></script>
</body>
</html>
