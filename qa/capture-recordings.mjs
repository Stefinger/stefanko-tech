/**
 * Scroll recording capture for Responsive Correction B final pass.
 * Records normal-motion slow scroll through Clarity, Decisions, Build sections.
 * Uses Puppeteer's built-in screencast API (v22+).
 */
import puppeteer from 'puppeteer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
process.env.FFMPEG_PATH = ffmpegPath;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:3000';

async function scrollSlowly(page, fromY, toY, steps = 40, delayMs = 80) {
  const delta = (toY - fromY) / steps;
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(fromY + delta * i));
    await new Promise(r => setTimeout(r, delayMs));
  }
}

async function getScrollHeight(page) {
  return page.evaluate(() => document.body.scrollHeight);
}

async function getSectionY(page, dataAttr) {
  return page.evaluate((attr) => {
    const sects = Array.from(document.querySelectorAll('section'));
    const s = sects.find(el => el.querySelector(`[${attr}]`));
    return s ? s.getBoundingClientRect().top + window.scrollY - 120 : 0;
  }, dataAttr);
}

async function recordScroll(browser, vp, outputName) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));

  /* Find start (Clarity section) and end (Build section) scroll positions */
  const clarityY = await getSectionY(page, 'data-c-label');
  const buildY   = await getSectionY(page, 'data-b-label');
  const totalH   = await getScrollHeight(page);
  const endY     = Math.min(buildY + vp.h, totalH - vp.h);

  const outPath = path.join(OUT, `${outputName}.webm`);
  console.log(`  Recording ${outputName}.webm (${clarityY}px → ${endY}px)…`);

  /* Start screencast — point Puppeteer at the bundled ffmpeg */
  const recorder = await page.screencast({ path: outPath, ffmpegPath });

  /* Scroll into clarity, pause, then slow-scroll through all three sections */
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 200)), clarityY);
  await new Promise(r => setTimeout(r, 500));

  /* Slow scroll from just before Clarity through Build */
  await scrollSlowly(page, Math.max(0, clarityY - 200), endY, 80, 80);

  /* Hold final position briefly */
  await new Promise(r => setTimeout(r, 1200));

  await recorder.stop();
  console.log(`  ✓ ${outputName}.webm`);
  await page.close();
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('\n[ Desktop 1440px recording ]');
    await recordScroll(browser, { w: 1440, h: 900 }, 'scroll-desktop-final');

    console.log('\n[ Mobile 390px recording ]');
    await recordScroll(browser, { w: 390, h: 844 }, 'scroll-mobile-final');
  } finally {
    await browser.close();
    console.log('\nDone.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
