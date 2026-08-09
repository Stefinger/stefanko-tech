import puppeteer from 'puppeteer';
import fs from 'node:fs';

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const VIEWPORTS = JSON.parse(process.argv[3]);
const TARGETS = JSON.parse(process.argv[4]); // [{section, frac}]

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'],
});

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));
  // slow scroll through the whole page once so every scrub timeline settles
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await new Promise(r => setTimeout(r, 60));
  }
  for (const t of TARGETS) {
    const y = await page.evaluate((sel, frac) => {
      const el = document.querySelector(`[data-scene-section="${sel}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height * frac;
    }, t.section, t.frac);
    if (y === null) continue;
    await page.evaluate(v => window.scrollTo(0, v), Math.max(0, y));
    await new Promise(r => setTimeout(r, 1400));
    await page.screenshot({ path: `${OUT}/${vp.name}--${t.section}-${t.frac}.png` });
  }
  await page.close();
}
await browser.close();
console.log('done');
