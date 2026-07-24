/**
 * QA Screenshot + video capture script for Responsive Correction B final pass.
 * Run: node qa/capture.mjs
 * Requires: puppeteer (installed via package.json devDependencies)
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:3000';
const VIEWPORTS = {
  390:  { w: 390,  h: 844 },
  768:  { w: 768,  h: 1024 },
  1024: { w: 1024, h: 768 },
  1200: { w: 1200, h: 900 },
  1280: { w: 1280, h: 900 },
  1440: { w: 1440, h: 900 },
};

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function scrollTo(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, selector);
  await new Promise(r => setTimeout(r, 800));
}

async function waitForAnimations() {
  /* give GSAP entrance animations time to complete (~2.5 s) */
  await new Promise(r => setTimeout(r, 2600));
}

async function openPage(browser, vp) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
  /* Disable prefers-reduced-motion so GSAP animations run */
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  /* scroll to top and settle */
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  return page;
}

async function main() {
  console.log('Launching browser…');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    /* ── Desktop 1440 px ────────────────────────────────────────────────── */
    console.log('\n[ 1440px ]');
    {
      const page = await openPage(browser, VIEWPORTS[1440]);

      await scrollTo(page, '#about');
      await waitForAnimations();
      await shot(page, 'clarity-complete-1440');

      await scrollTo(page, '.decisions-section, section:nth-child(4)');
      // scroll to decisions by evaluating
      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const dec = sects.find(s => s.querySelector('[data-d-journey-desktop]'));
        if (dec) dec.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'decisions-complete-1440');

      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const bld = sects.find(s => s.querySelector('[data-b-slab]'));
        if (bld) bld.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'build-complete-1440');

      await page.close();
    }

    /* ── Intermediate 1024 px ───────────────────────────────────────────── */
    console.log('\n[ 1024px ]');
    {
      const page = await openPage(browser, VIEWPORTS[1024]);

      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const dec = sects.find(s => s.querySelector('[data-d-journey-desktop]'));
        if (dec) dec.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'decisions-1024');

      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const bld = sects.find(s => s.querySelector('[data-b-slab]'));
        if (bld) bld.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'build-1024');

      await page.close();
    }

    /* ── Mobile 390 px ──────────────────────────────────────────────────── */
    console.log('\n[ 390px ]');
    {
      const page = await openPage(browser, VIEWPORTS[390]);

      await scrollTo(page, '#about');
      await waitForAnimations();
      await shot(page, 'clarity-complete-390');

      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const dec = sects.find(s => s.querySelector('[data-d-journey-mobile]'));
        if (dec) dec.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'decisions-complete-390');

      await page.evaluate(() => {
        const sects = Array.from(document.querySelectorAll('section'));
        const bld = sects.find(s => s.querySelector('[data-b-slab]'));
        if (bld) bld.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await waitForAnimations();
      await shot(page, 'build-complete-390');

      await page.close();
    }

    /* ── Anchor verification ────────────────────────────────────────────── */
    console.log('\n[ anchor verification ]');
    for (const [vp, dims] of [[390, VIEWPORTS[390]], [1024, VIEWPORTS[1024]]]) {
      const page = await openPage(browser, dims);

      /* Navigate via anchor */
      await page.evaluate(() => { window.location.hash = '#about'; });
      await new Promise(r => setTimeout(r, 1200));
      await shot(page, `about-anchor-${vp}`);

      await page.close();
    }

  } finally {
    await browser.close();
    console.log('\nDone. Screenshots in qa/responsive-b-final/');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
