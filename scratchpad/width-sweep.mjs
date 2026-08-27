/* The same three checks at several widths. The phone work touched rules that
   desktop shares — every `@media (min-width:761px)` wrapper added around a
   pill rule is a chance to have moved something on a laptop instead. This is
   the regression half. */
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const BASE = 'http://localhost:8099';
const PAGES = ['index.html', 'tools.html', 'socials.html', 'biometrics.html', 'editor.html',
  'pricing.html', 'game.html', 'analytics.html', 'study.html', 'photo.html',
  'community.html', 'typing.html', 'parent.html', 'trends.html', 'ai.html', 'progress.html', 'shield.html', 'pro.html', 'app.html', 'gift.html', 'coder.html', 'publish.html', 'studio-ai.html',
  /* The two documents. They are plain text pages and unlikely to break, but
     they are also the two most likely to be read on a phone by a parent who
     has never opened the site before. */
  'privacy.html', 'terms.html', 'profile.html'];

const SIZES = [
  { w: 360, h: 640, m: true,  label: 'phone-s' },
  { w: 390, h: 844, m: true,  label: 'phone' },
  { w: 412, h: 915, m: true,  label: 'phone-l' },
  { w: 844, h: 390, m: true,  label: 'landscape' },
  { w: 768, h: 1024, m: true, label: 'tablet' },
  { w: 1280, h: 800, m: false, label: 'laptop' },
  { w: 1920, h: 1080, m: false, label: 'desktop' }
];

const CHECK = () => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const out = { bleed: 0, offscreen: [], covered: [] };
  if (de.scrollWidth > vw + 1) out.bleed = de.scrollWidth - vw;

  /* Two things that are always wrong at any width: a control whose box is
     entirely off the side of the screen (you cannot scroll sideways to it if
     the page does not scroll sideways), and the Nova pill or the top bar
     landing on the page's own first heading. */
  const nav = document.querySelector('.sidebar');
  document.querySelectorAll('a[href], button:not([disabled])').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return;
    if (r.top > innerHeight || r.bottom < 0) return;
    /* Inside a horizontal scroller, off to the side is a swipe away and fine. */
    let sc = el.parentElement, scrolls = false;
    while (sc && sc !== document.body) {
      const o = getComputedStyle(sc).overflowX;
      if ((o === 'auto' || o === 'scroll') && sc.scrollWidth > sc.clientWidth + 1) { scrolls = true; break; }
      sc = sc.parentElement;
    }
    if (scrolls) return;
    if (r.right < 2 || r.left > vw - 2) {
      out.offscreen.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        ' «' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 22) + '»' +
        ' at x=' + Math.round(r.left));
    }
  });

  /* CAN YOU GET OFF THIS PAGE?
     trends.html passed every other check on this list while being a dead end:
     no site rail, every link a hash route inside itself, and the one way out
     sitting in a drawer that the desktop rail's own hide-rule had switched
     off. Nothing that measures boxes or hit-tests controls can see that. */
  const out2 = [...document.querySelectorAll('a[href]')].filter((a) => {
    const href = a.getAttribute('href') || '';
    if (!/\.html(\?|#|$)/.test(href) || /^https?:/.test(href)) return false;
    const r = a.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(a);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  });
  if (!out2.length) out.trapped = true;
  /* A burger counts as a way out, but only if opening it actually produces
     one — which is the whole point, since the bug was a burger that opened a
     menu CSS had switched off. The driver clicks it and asks again. */
  out.menuBtn = out.trapped && [...document.querySelectorAll('button')].some((x) => {
    const r = x.getBoundingClientRect();
    return r.width > 0 && r.height > 0 &&
      /menu|burger|nav|btn-ico/i.test(x.className + ' ' + (x.id || '') + ' ' + (x.getAttribute('aria-label') || ''));
  });

  /* Is the page's first heading readable, or is something floating on it? */
  const h = document.querySelector('h1, h2');
  if (h) {
    const r = h.getBoundingClientRect();
    if (r.width > 0 && r.top >= 0 && r.top < innerHeight) {
      const hit = document.elementFromPoint(Math.min(r.left + 12, innerWidth - 2), r.top + r.height / 2);
      if (hit && !h.contains(hit) && hit !== h && !hit.contains(h)) {
        out.covered.push('heading «' + h.textContent.trim().slice(0, 26) + '» covered by ' +
          hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') +
          (typeof hit.className === 'string' && hit.className ? '.' + hit.className.trim().split(/\s+/)[0] : ''));
      }
    }
  }
  return out;
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;
for (const s of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h }, isMobile: s.m, hasTouch: s.m
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('nc_user_age', '17');
      localStorage.setItem('nc_consent', 'yes');
      sessionStorage.setItem('nc_gate_ok', '1');
      /* A returning visitor who already has a profile, which is what every
         page below is being measured as. The first-run sign-up sheet is a
         full-screen overlay, so without this every page would report its own
         heading as covered — by the thing deliberately covering it. The sheet
         has its own test. */
      localStorage.setItem('nc_username', 'sweeper');
    } catch (e) {}
  });
  const page = await ctx.newPage();
  const lines = [];
  for (const p of PAGES) {
    const errs = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
    try {
      await page.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1200);
      let r = await page.evaluate(CHECK);
      /* Nothing visible leads off the page — try the burger the way a reader
         would, then ask again. */
      if (r.trapped && r.menuBtn) {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((x) => {
            const q = x.getBoundingClientRect();
            return q.width > 0 && q.height > 0 &&
              /menu|burger|nav|btn-ico/i.test(x.className + ' ' + (x.id || '') + ' ' + (x.getAttribute('aria-label') || ''));
          });
          if (b) b.click();
        });
        await page.waitForTimeout(600);
        const after = await page.evaluate(CHECK);
        /* Keep the trapped verdict from the second look — that is what the
           click was for — but keep the heading verdict from the first. An
           open menu covering the page behind it is a menu working, and
           reporting it as a covered heading is the tool lying about a page
           it disturbed itself. */
        r = { ...after, covered: r.covered };
      }
      const f = [];
      if (r.bleed) f.push('BLEED +' + r.bleed);
      if (r.trapped) f.push('TRAPPED (no way off this page)');
      r.offscreen.slice(0, 4).forEach((o) => f.push('OFFSCREEN ' + o));
      r.covered.forEach((c) => f.push('COVERED ' + c));
      errs.slice(0, 2).forEach((e) => f.push('JS ' + e));
      if (f.length) { bad++; lines.push('  ' + p + ': ' + f.join(' | ')); }
    } catch (e) { bad++; lines.push('  ' + p + ': FATAL ' + String(e).slice(0, 80)); }
  }
  console.log(`\n## ${s.label} ${s.w}x${s.h}` + (lines.length ? '' : '  — all clean'));
  lines.forEach((l) => console.log(l));
  await ctx.close();
}
await browser.close();
console.log('\n' + (bad ? bad + ' page/size combinations with findings' : 'all clean'));
