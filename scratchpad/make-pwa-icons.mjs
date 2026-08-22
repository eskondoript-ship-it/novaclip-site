/* PWA icons, rendered from the NovaClip mark that already exists.
   ===========================================================================
   The logo is an SVG. Windows, the Microsoft Store and every install prompt
   want PNGs at fixed sizes, so these are rasterised from logo.svg rather than
   drawn again — there is one NovaClip mark and this keeps it that way.

   TWO SETS, BECAUSE "any" AND "maskable" ARE DIFFERENT JOBS

   An "any" icon is displayed as it is. A "maskable" icon is cropped by the
   platform to whatever shape it likes — a circle, a squircle, a rounded
   square — and only the middle 80% of the canvas is guaranteed to survive.

   Labelling one file "any maskable" is the usual shortcut and it is wrong in
   both directions: as "any" it looks like a small mark adrift in a large
   field, and as "maskable" a mark drawn to fill the canvas gets its points
   sliced off. So there are two sets. The mark fills 76% of the "any" canvas
   and 56% of the maskable one, which keeps every point of the burst inside
   the safe circle whatever shape a platform crops to.

   The background is the brand's near-black rather than transparency: a
   transparent icon is composited onto whatever the platform feels like, and
   this mark has a near-white core that disappears on white.
   =========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const REPO = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(REPO, 'icons');
const BG = '#050505';                    // matches manifest background_color/theme_color

const svg = fs.readFileSync(path.join(REPO, 'logo.svg'), 'utf8');

/* size: the PNG's pixel dimensions. fill: how much of it the mark occupies. */
const JOBS = [
  { file: 'icon-192.png',     size: 192, fill: 0.76 },
  { file: 'icon-512.png',     size: 512, fill: 0.76 },
  { file: 'maskable-192.png', size: 192, fill: 0.56 },
  { file: 'maskable-512.png', size: 512, fill: 0.56 }
];

const page = (size, fill) => `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:${BG};}
  #c{width:${size}px;height:${size}px;background:${BG};
     display:flex;align-items:center;justify-content:center;}
  #c svg{width:${Math.round(size * fill)}px;height:${Math.round(size * fill)}px;display:block;}
</style>
<div id="c">${svg.replace(/width="\d+"\s+height="\d+"/, '')}</div>`;

fs.mkdirSync(OUT, { recursive: true });

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const job of JOBS) {
  const p = await browser.newPage({
    viewport: { width: job.size, height: job.size },
    deviceScaleFactor: 1                       // 1 CSS px = 1 PNG px, exactly
  });
  await p.setContent(page(job.size, job.fill));
  await p.waitForTimeout(120);                 // let the gradients paint
  await p.locator('#c').screenshot({ path: path.join(OUT, job.file), omitBackground: false });
  await p.close();
  console.log(`${job.file.padEnd(18)} ${job.size}x${job.size}  mark at ${Math.round(job.fill * 100)}%`);
}
await browser.close();

/* Read the dimensions back out of the file itself rather than trusting the
   screenshot: a PNG that is the wrong size fails a store submission, and the
   header says so in eight bytes. */
for (const job of JOBS) {
  const b = fs.readFileSync(path.join(OUT, job.file));
  const isPng = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const ok = isPng && w === job.size && h === job.size;
  console.log(`${ok ? 'OK  ' : 'BAD '} ${job.file}: png=${isPng} ${w}x${h} ${(b.length / 1024).toFixed(1)}kB`);
  if (!ok) process.exitCode = 1;
}
