import puppeteer from 'puppeteer';
import fs from 'node:fs';

const OUT = process.argv[2] || '/private/tmp/claude-501/-Users-stefanko-Ajtakeck-cladue-code-stefanko-tech/bef25123-34c3-4ffe-be14-9f321f992013/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1280x800',  width: 1280, height: 800 },
  { name: 'tablet-992x1000',  width: 992,  height: 1000 },
  { name: 'tablet-768x1024',  width: 768,  height: 1024 },
  { name: 'mobile-390x844',   width: 390,  height: 844 },
];

const SECTIONS = ['hero', 'uncertainty', 'clarity', 'decisions', 'build', 'proof', 'final'];

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
  ],
});

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  // full page
  await page.screenshot({ path: `${OUT}/${vp.name}--full.png`, fullPage: true });

  // per-section viewport shots
  for (const s of SECTIONS) {
    const top = await page.evaluate(sel => {
      const el = document.querySelector(`[data-scene-section="${sel}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY;
    }, s);
    if (top === null) { console.log(`MISSING section ${s} @ ${vp.name}`); continue; }
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, top));
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: `${OUT}/${vp.name}--${s}.png` });
  }

  // horizontal overflow check
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log(vp.name, 'overflowX:', overflow.scrollW - overflow.clientW, 'errors:', errors.length ? errors.slice(0, 3) : 'none');
  await page.close();
}

await browser.close();
console.log('done ->', OUT);
