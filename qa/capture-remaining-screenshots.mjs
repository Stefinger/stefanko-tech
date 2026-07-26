/**
 * Capture remaining QA screenshots for Phase 5 hardening pass.
 * Uses --use-gl=desktop for GPU-accurate color.
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

function save(buf, name) {
  writeFileSync(join(OUT, name), buf);
  console.log('✓', name);
}

async function withPage(w, h, fn) {
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${w},${h}`,
      '--use-gl=desktop',
    ],
    defaultViewport: { width: w, height: h },
  });
  try {
    const page = await browser.newPage();
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function run() {
  // ── Desktop 1440 — hero/clarity/final sequence ──────────────────────────
  await withPage(1440, 900, async page => {
    // Static before WebGL
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await wait(80);
    save(await page.screenshot({ type: 'png' }), 'hero-static-before-webgl.png');

    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'hero-first-3d-frame.png');
    await wait(2500);
    save(await page.screenshot({ type: 'png' }), 'hero-complete.png');
  });

  await withPage(1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await page.evaluate(() =>
      document.querySelector('[data-scene-section="clarity"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(200);
    save(await page.screenshot({ type: 'png' }), 'clarity-entry-first-visible-frame.png');
    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'clarity-entry-mid.png');
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'clarity-complete.png');
  });

  await withPage(1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await page.evaluate(() =>
      document.querySelector('[data-scene-section="final"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(200);
    save(await page.screenshot({ type: 'png' }), 'final-entry-first-visible-frame.png');
    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'final-entry-mid.png');
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'final-complete.png');
  });

  // ── Mobile 390 ────────────────────────────────────────────────────────────
  await withPage(390, 844, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(600);
    save(await page.screenshot({ type: 'png' }), 'mobile-hero-first-3d-frame.png');
    await wait(2500);
    save(await page.screenshot({ type: 'png' }), 'mobile-hero-complete.png');
  });

  await withPage(390, 844, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1500);
    await page.evaluate(() =>
      document.querySelector('[data-scene-section="clarity"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(300);
    save(await page.screenshot({ type: 'png' }), 'mobile-clarity-entry-first-visible-frame.png');
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'mobile-clarity-complete.png');
  });

  await withPage(390, 844, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1500);
    await page.evaluate(() =>
      document.querySelector('[data-scene-section="final"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(300);
    save(await page.screenshot({ type: 'png' }), 'mobile-final-entry-first-visible-frame.png');
    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'mobile-final-entry-mid.png');
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'mobile-final-complete.png');
  });

  // ── Colour comparisons ───────────────────────────────────────────────────
  // Reduced-motion reference (static SVG)
  await withPage(1440, 900, async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1000);
    save(await page.screenshot({ type: 'png' }), 'color-compare-hero-reduced.png');

    await page.evaluate(() =>
      document.querySelector('[data-scene-section="clarity"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'color-compare-clarity-reduced.png');

    await page.evaluate(() =>
      document.querySelector('[data-scene-section="final"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(800);
    save(await page.screenshot({ type: 'png' }), 'color-compare-final-reduced.png');
  });

  // 3D reference (active WebGL)
  await withPage(1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(3000);
    save(await page.screenshot({ type: 'png' }), 'color-compare-hero-3d.png');

    await page.evaluate(() =>
      document.querySelector('[data-scene-section="clarity"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'color-compare-clarity-3d.png');

    await page.evaluate(() =>
      document.querySelector('[data-scene-section="final"]').scrollIntoView({ behavior: 'instant' })
    );
    await wait(1800);
    save(await page.screenshot({ type: 'png' }), 'color-compare-final-3d.png');
  });

  console.log('\n✅ All screenshots done.');
}

run().catch(e => { console.error(e); process.exit(1); });
