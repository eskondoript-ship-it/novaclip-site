import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const BASE = 'http://localhost:8099';
const OUT = '/tmp/claude-0/-home-user-novaclip-site/6555b89c-7587-5545-934a-f71b7b390761/scratchpad';
const pages = process.argv.slice(2);
const full = process.env.FULL === '1';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true
});
await ctx.addInitScript(() => {
  try {
    localStorage.setItem('nc_user_age', '17');
    localStorage.setItem('nc_consent', 'yes');
    sessionStorage.setItem('nc_gate_ok', '1');
  } catch (e) {}
});
const page = await ctx.newPage();
for (const p of pages) {
  await page.goto(BASE + '/' + p, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/ph-${p.replace('.html', '')}.png`, fullPage: full });
}
await browser.close();
console.log('ok');
