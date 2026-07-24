/**
 * Decisions content verification — cloud title + subtext inside cloud shape.
 * Tests normal-motion and reduced-motion at 1440, 1024, 390px.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');
const BASE = 'http://localhost:3000';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function scrollToDecisions(page, isMobile) {
  const attr = isMobile ? 'data-d-journey-mobile' : 'data-d-journey-desktop';
  await page.evaluate((a) => {
    const sects = Array.from(document.querySelectorAll('section'));
    const dec = sects.find(s => s.querySelector(`[${a}]`));
    if (dec) dec.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, attr);
  /* wait for scrub to reach fully-drawn state */
  await new Promise(r => setTimeout(r, 3200));
}

async function capture(browser, w, h, label, reducedMotion) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{
    name: 'prefers-reduced-motion',
    value: reducedMotion ? 'reduce' : 'no-preference',
  }]);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));

  await scrollToDecisions(page, w <= 991);
  const suffix = reducedMotion ? '-reduced' : '';
  const file = path.join(OUT, `decisions-content-${label}${suffix}.png`);
  await page.screenshot({ path: file });
  console.log(`  ✓ decisions-content-${label}${suffix}.png`);
  await page.close();
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    for (const [w, h, label] of [[1440, 900, '1440'], [1200, 900, '1200'], [1024, 768, '1024'], [390, 844, '390']]) {
      console.log(`[ ${w}px ]`);
      await capture(browser, w, h, label, false);
      await capture(browser, w, h, label, true);
    }
  } finally {
    await browser.close();
    console.log('\nDone.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
