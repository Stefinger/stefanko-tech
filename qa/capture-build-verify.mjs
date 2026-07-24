/**
 * Targeted Build section verification at multiple widths.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:3000';

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function captureBuild(browser, width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  /* Scroll to the BUILD section top */
  await page.evaluate(() => {
    const sects = Array.from(document.querySelectorAll('section'));
    const bld = sects.find(s => s.querySelector('[data-b-slab]'));
    if (bld) bld.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  /* Wait for entrance animation (label fade + slab settle) */
  await new Promise(r => setTimeout(r, 2800));
  await shot(page, `build-top-${label}`);

  await page.close();
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    for (const [w, h, label] of [
      [1440, 900, '1440'],
      [1280, 900, '1280'],
      [1200, 900, '1200'],
      [1024, 768, '1024'],
      [992,  768, '992'],
      [768,  1024, '768'],
      [390,  844, '390'],
    ]) {
      console.log(`[ ${w}px ]`);
      await captureBuild(browser, w, h, label);
    }
  } finally {
    await browser.close();
    console.log('\nDone.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
