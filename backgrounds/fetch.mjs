/* FETCH THE NINE CATEGORY BACKGROUNDS.
 * ===================================
 * Run this once, on a machine with internet:
 *
 *     node backgrounds/fetch.mjs
 *
 * It downloads one photograph per category into this folder and the site picks
 * them up on the next load. Nothing else to change. Node 18 or newer; no
 * packages to install.
 *
 *     node backgrounds/fetch.mjs --dry-run     see what it would take, take nothing
 *     node backgrounds/fetch.mjs food gaming   just those two
 *     node backgrounds/fetch.mjs --force       replace files that are already here
 *
 * WHY A SCRIPT RATHER THAN THE FILES THEMSELVES
 *
 * The session these were asked for runs behind an egress proxy that answers
 * 403 to every image host — unsplash, pexels, pixabay, wikimedia, all of them.
 * So the download could not happen there and had to happen here instead. This
 * is the same job, moved to a machine that can reach the internet.
 *
 * WHERE THE PICTURES COME FROM, AND WHY THAT SOURCE
 *
 * Openverse — the WordPress Foundation's search over openly licensed media. No
 * account, no API key, and it can be asked for CC0 ONLY, which is the licence
 * that permits commercial use and requires no attribution. That matters: these
 * files get published to novaclip.org, and a CC-BY image would put a credit
 * obligation on a background nobody can read a credit on.
 *
 * The script prints the source page and licence for every file it saves, and
 * writes them to credits.txt beside them. Nothing is required, but knowing
 * where a picture came from is worth four lines of code.
 *
 * IT WAS NOT RUN BEFORE BEING COMMITTED — it could not be, from behind that
 * proxy. It is written defensively for that reason: it checks the response is
 * actually an image, checks the file is big enough to be a photograph rather
 * than a placeholder, and writes nothing when either check fails. If a search
 * comes back empty it says which one and carries on with the rest.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

/* The nine, and what to look for. The terms are deliberately about the SETTING
   rather than about people: these sit behind a page of text at low opacity and
   heavily blurred, so a wide scene with strong colour reads, and a portrait
   does not. */
const WANT = [
  { id: 'gaming',   q: 'video game controller neon' },
  { id: 'music',    q: 'music studio mixing desk' },
  { id: 'sport',    q: 'running track stadium' },
  { id: 'irl',      q: 'city street travel morning' },
  { id: 'learning', q: 'books desk study library' },
  { id: 'art',      q: 'paint brushes palette studio' },
  { id: 'food',     q: 'cooking pan vegetables kitchen' },
  { id: 'comedy',   q: 'stage microphone spotlight' },
  { id: 'tech',     q: 'circuit board computer macro' }
];

const API = 'https://api.openverse.org/v1/images/';
const MIN_BYTES = 25 * 1024;          // smaller than this is not a photograph
const MAX_BYTES = 900 * 1024;         // larger than this is too heavy to ship

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const force = args.includes('--force');
const only = args.filter(a => !a.startsWith('--'));
const list = only.length ? WANT.filter(w => only.includes(w.id)) : WANT;

if (only.length && !list.length) {
  console.error('None of those are category ids. They are: ' + WANT.map(w => w.id).join(', '));
  process.exit(1);
}

async function existing(id) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    try { await fs.access(path.join(DIR, id + '.' + ext)); return id + '.' + ext; }
    catch { /* not this one */ }
  }
  return null;
}

async function search(q) {
  const url = API + '?' + new URLSearchParams({
    q,
    license: 'cc0',                   // no attribution required, commercial use allowed
    aspect_ratio: 'wide',
    size: 'large',
    mature: 'false',
    page_size: '8'
  });
  const r = await fetch(url, { headers: { 'User-Agent': 'novaclip-backgrounds/1.0' } });
  if (!r.ok) throw new Error('search failed: HTTP ' + r.status);
  const j = await r.json();
  return (j.results || []).filter(x => x.url);
}

async function grab(hit) {
  const r = await fetch(hit.url, { headers: { 'User-Agent': 'novaclip-backgrounds/1.0' } });
  if (!r.ok) return null;
  const type = (r.headers.get('content-type') || '').toLowerCase();
  if (!type.startsWith('image/')) return null;          // an HTML error page, not a picture
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < MIN_BYTES) return null;
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  return { buf, ext, type };
}

const credits = [];
let saved = 0, skipped = 0, failed = 0;

for (const w of list) {
  const have = await existing(w.id);
  if (have && !force) {
    console.log(`· ${w.id.padEnd(9)} already here as ${have} — leaving it (use --force to replace)`);
    skipped++;
    continue;
  }

  let hits;
  try { hits = await search(w.q); }
  catch (e) {
    console.log(`✗ ${w.id.padEnd(9)} search failed: ${e.message}`);
    failed++;
    continue;
  }
  if (!hits.length) {
    console.log(`✗ ${w.id.padEnd(9)} nothing CC0 came back for "${w.q}" — try a different term`);
    failed++;
    continue;
  }

  let got = null, used = null;
  for (const hit of hits) {                 // first one that is actually an image
    try { got = await grab(hit); } catch { got = null; }
    if (got) { used = hit; break; }
  }
  if (!got) {
    console.log(`✗ ${w.id.padEnd(9)} found ${hits.length} results, none downloaded as an image`);
    failed++;
    continue;
  }

  const name = w.id + '.' + got.ext;
  const kb = Math.round(got.buf.length / 1024);
  if (got.buf.length > MAX_BYTES) {
    console.log(`! ${w.id.padEnd(9)} ${name} is ${kb}KB — saving it, but resize it before you ship`);
  }
  if (dry) {
    console.log(`  ${w.id.padEnd(9)} would save ${name} (${kb}KB) from ${used.foreign_landing_url || used.url}`);
    continue;
  }
  await fs.writeFile(path.join(DIR, name), got.buf);
  credits.push(`${name}\n  ${used.title || '(untitled)'} — ${used.license || 'cc0'} ${used.license_version || ''}\n  ${used.foreign_landing_url || used.url}\n`);
  console.log(`✓ ${w.id.padEnd(9)} ${name} (${kb}KB)`);
  saved++;
}

if (credits.length && !dry) {
  await fs.appendFile(path.join(DIR, 'credits.txt'),
    `\n--- ${new Date().toISOString()} ---\n` + credits.join('\n'));
}

console.log(`\n${saved} saved, ${skipped} already there, ${failed} failed.`);
if (saved) {
  console.log('Reload the site — a category with a file now uses the photograph');
  console.log('instead of its drawn scene. Check them at about 40% opacity behind');
  console.log('text before committing: a busy photo is fine, a bright one is not.');
}
if (failed) {
  console.log('\nFor the ones that failed: any wide photograph named after the');
  console.log('category works — see README.md. CC0 search is narrow on purpose.');
}
