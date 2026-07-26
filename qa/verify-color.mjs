/**
 * Standalone color verification — captures hero, clarity, final
 * in fresh single-page sessions.
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';
const OUT = join(__dirname, 'phase-5-blob-journey-final');
mkdirSync(OUT, { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

async function capture(name, fn) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--use-gl=desktop'],
    defaultViewport: { width: 1440, height: 900 },
  });
  try {
    const page = await browser.newPage();
    await fn(page);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    const p = join(OUT, name);
    writeFileSync(p, buf);
    console.log('✓', name);
  } finally {
    await browser.close();
  }
}

async function run() {
  // Hero 3D
  await capture('verify-hero-3d.png', async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(3000);
  });

  // Clarity 3D
  await capture('verify-clarity-3d.png', async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await page.evaluate(() => {
      document.querySelector('[data-scene-section="clarity"]').scrollIntoView({ behavior: 'instant' });
    });
    await wait(2000);
  });

  // Final 3D
  await capture('verify-final-3d.png', async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await page.evaluate(() => {
      document.querySelector('[data-scene-section="final"]').scrollIntoView({ behavior: 'instant' });
    });
    await wait(2000);
  });

  // Reduced-motion hero (reference)
  await capture('verify-hero-reduced.png', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1000);
  });

  console.log('\nDone. Check verify-*.png in', OUT);
}

run().catch(e => { console.error(e); process.exit(1); });
