/** Capture Decisions wave path mid-scroll to check for artefacts */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox'],
  });

  for (const [w, h] of [[1440, 900], [1024, 768]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

    /* Scroll to decisions section journey and pause mid-animation */
    await page.evaluate(() => {
      const sects = Array.from(document.querySelectorAll('section'));
      const dec = sects.find(s => s.querySelector('[data-d-journey-desktop]'));
      if (dec) {
        const journeyEl = dec.querySelector('[data-d-journey-desktop]');
        if (journeyEl) journeyEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    /* Wait for wave to fully draw */
    await new Promise(r => setTimeout(r, 3000));

    const file = path.join(OUT, `decisions-path-${w}.png`);
    await page.screenshot({ path: file });
    console.log(`✓ decisions-path-${w}.png`);
    await page.close();
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
