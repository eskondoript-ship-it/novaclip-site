/* Phone audit. Measures rather than eyeballs.

   Three classes of fault, because they have three different causes:

   1. BLEED   - the document is wider than the screen. Always a bug; there is
                no way to see the right-hand edge of the page.
   2. TINY    - a control whose box is smaller than a fingertip.
   3. STOLEN  - a control whose own centre point hit-tests to something else.
                Box measurement cannot see this one; it is what found the
                jarvis pill sitting on the navbar.

   Plus the widest element on the page when it bleeds, because "the page is
   477 wide" is useless and "that <pre> is 477 wide" is a fix.
*/
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8099';
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : [
  'index.html', 'tools.html', 'socials.html', 'biometrics.html', 'editor.html',
  'pricing.html', 'game.html', 'analytics.html', 'progress.html', 'parent.html',
  'study.html', 'trends.html', 'ai.html', 'photo.html', 'community.html',
  'coder.html', 'publish.html', 'shield.html', 'pro.html', 'app.html',
  'gift.html', 'studio-ai.html', 'typing.html', 'flap.html', 'aim.html',
  'reaction.html', 'privacy.html', 'report.html'
];

const VIEWPORT = { width: 390, height: 844 };

const AUDIT = () => {
  const out = { bleed: null, widest: [], tiny: [], stolen: [], overflowText: [] };
  const de = document.documentElement;
  const vw = de.clientWidth;

  if (de.scrollWidth > vw + 1) {
    out.bleed = { scrollWidth: de.scrollWidth, clientWidth: vw };
    // Who is actually sticking out? Report the outermost offenders only —
    // a wide <pre> makes every ancestor wide too, and listing all of them
    // buries the one element you have to change.
    const wide = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.right <= vw + 1) return;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && cs.visibility === 'hidden') return;
      if (cs.display === 'none') return;
      wide.push({ el, right: Math.round(r.right), width: Math.round(r.width) });
    });
    // Keep an element only if no *descendant* of it is also over the edge by
    // as much — that leaf is the real cause.
    const leaves = wide.filter((w) => !wide.some((o) => o !== w && w.el.contains(o.el) && o.right >= w.right - 2));
    out.widest = leaves.slice(0, 8).map((w) => ({
      tag: w.el.tagName.toLowerCase(),
      id: w.el.id || '',
      cls: (w.el.className && w.el.className.baseVal !== undefined ? w.el.className.baseVal : String(w.el.className || '')).slice(0, 70),
      right: w.right, width: w.width,
      text: (w.el.textContent || '').trim().slice(0, 40)
    }));
  }

  const CONTROL = 'a[href], button, select, input:not([type=hidden]), textarea, [role=button], summary, [tabindex]:not([tabindex="-1"])';
  const seen = new Set();
  document.querySelectorAll(CONTROL).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.pointerEvents === 'none') return;
    // Only judge what is on screen; a control 4000px down is not a tap
    // target yet and its size may be set by a script when it scrolls in.
    if (r.bottom < 0 || r.top > innerHeight * 3) return;

    const desc = el.tagName.toLowerCase() +
      (el.id ? '#' + el.id : '') +
      (el.className && typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') +
      ' «' + (el.textContent || el.getAttribute('aria-label') || el.value || '').trim().slice(0, 24) + '»';

    // 40px is the site's own stated floor (nova.js coarse-pointer rule);
    // 36 leaves a little room for a border-box rounding difference.
    if (r.width < 32 || r.height < 32) {
      const k = 'T' + desc;
      if (!seen.has(k)) { seen.add(k); out.tiny.push({ desc, w: Math.round(r.width), h: Math.round(r.height) }); }
    }

    // Hit test the centre. If something else answers, the tap goes there.
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return;
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
      const thief = hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') +
        (hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
      const k = 'S' + desc + thief;
      if (!seen.has(k)) { seen.add(k); out.stolen.push({ desc, thief }); }
    }
  });

  return out;
};

const server = null;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({
  viewport: VIEWPORT, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
});
/* The age gate and the cookie banner are modals, and a modal covering the
   page is them working. Answer both once so the audit looks at the page. */
await ctx.addInitScript(() => {
  try {
    localStorage.setItem('nc_user_age', '17');
    localStorage.setItem('nc_consent', 'yes');
    sessionStorage.setItem('nc_gate_ok', '1');
  } catch (e) {}
});
const page = await ctx.newPage();

const report = [];
for (const p of PAGES) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  try {
    await page.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 20000 });
  } catch (e) { report.push({ page: p, fatal: String(e).slice(0, 100) }); continue; }
  // Let the rail build, fonts settle, and any deferred script lay itself out.
  await page.waitForTimeout(1400);
  let r;
  try { r = await page.evaluate(AUDIT); } catch (e) { report.push({ page: p, fatal: 'audit: ' + e }); continue; }
  r.page = p; r.errors = errors;
  report.push(r);
}

for (const r of report) {
  const flags = [];
  if (r.fatal) { console.log(`\n### ${r.page}\n  FATAL ${r.fatal}`); continue; }
  if (r.bleed) flags.push(`BLEED ${r.bleed.scrollWidth}>${r.bleed.clientWidth}`);
  if (r.tiny.length) flags.push(`tiny:${r.tiny.length}`);
  if (r.stolen.length) flags.push(`stolen:${r.stolen.length}`);
  if (r.errors.length) flags.push(`js:${r.errors.length}`);
  console.log(`\n### ${r.page}  ${flags.length ? flags.join('  ') : 'clean'}`);
  if (r.widest.length) r.widest.forEach((w) => console.log(`   wide  <${w.tag}> #${w.id} .${w.cls}  right=${w.right} w=${w.width}  "${w.text}"`));
  r.tiny.slice(0, 10).forEach((t) => console.log(`   tiny  ${t.w}x${t.h}  ${t.desc}`));
  if (r.tiny.length > 10) console.log(`   tiny  ...and ${r.tiny.length - 10} more`);
  r.stolen.slice(0, 10).forEach((s) => console.log(`   STOLEN ${s.desc}  -> ${s.thief}`));
  r.errors.slice(0, 3).forEach((e) => console.log(`   js    ${e}`));
}

await browser.close();
