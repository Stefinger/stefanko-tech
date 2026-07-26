/**
 * Phase 5 Visual Hardening — QA screenshot capture
 * Uses headful (GPU-accelerated) Chrome so WebGL color management works correctly.
 *
 * Run: node qa/capture-phase5-final.mjs
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(__dirname, 'phase-5-blob-journey-final');

mkdirSync(OUT_DIR, { recursive: true });

async function save(page, name) {
  const buf = await page.screenshot({ type: 'png', fullPage: false });
  const p = join(OUT_DIR, name);
  writeFileSync(p, buf);
  console.log('✓', name);
  return p;
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function smoothScrollToEl(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, selector);
}

async function run() {
  // headless: false gives real GPU rendering so WebGL color management is accurate.
  // Screenshots with software WebGL (headless) produce incorrect dark/burgundy colors.
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--use-gl=desktop',   // GPU-accelerated WebGL — required for correct color output
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  // ── Desktop 1440px ──────────────────────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // hero-static-before-webgl: capture very early before WebGL fires
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await wait(80);
    await save(page, 'hero-static-before-webgl.png');

    // hero-first-3d-frame: just after WebGL first frame
    await wait(800);
    await save(page, 'hero-first-3d-frame.png');

    // hero-complete: fully settled
    await wait(2500);
    await save(page, 'hero-complete.png');

    // ── Clarity entry ─────────────────────────────────────────────────────────
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await smoothScrollToEl(page, '[data-scene-section="clarity"]');
    await wait(200);
    await save(page, 'clarity-entry-first-visible-frame.png');
    await wait(800);
    await save(page, 'clarity-entry-mid.png');
    await wait(1800);
    await save(page, 'clarity-complete.png');

    // ── Final CTA entry ───────────────────────────────────────────────────────
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    await smoothScrollToEl(page, '[data-scene-section="final"]');
    await wait(200);
    await save(page, 'final-entry-first-visible-frame.png');
    await wait(800);
    await save(page, 'final-entry-mid.png');
    await wait(1800);
    await save(page, 'final-complete.png');

    await page.close();
  }

  // ── Mobile 390px ────────────────────────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });

    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(600);
    await save(page, 'mobile-hero-first-3d-frame.png');
    await wait(2500);
    await save(page, 'mobile-hero-complete.png');

    // Clarity
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1500);
    await smoothScrollToEl(page, '[data-scene-section="clarity"]');
    await wait(300);
    await save(page, 'mobile-clarity-entry-first-visible-frame.png');
    await wait(1800);
    await save(page, 'mobile-clarity-complete.png');

    // Final
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(1500);
    await smoothScrollToEl(page, '[data-scene-section="final"]');
    await wait(300);
    await save(page, 'mobile-final-entry-first-visible-frame.png');
    await wait(800);
    await save(page, 'mobile-final-entry-mid.png');
    await wait(1800);
    await save(page, 'mobile-final-complete.png');

    await page.close();
  }

  // ── Colour comparisons ──────────────────────────────────────────────────────
  {
    // Reduced-motion (static SVG reference)
    const pageRM = await browser.newPage();
    await pageRM.setViewport({ width: 1440, height: 900 });
    await pageRM.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ]);
    await pageRM.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(800);
    await save(pageRM, 'color-compare-hero-reduced.png');

    await smoothScrollToEl(pageRM, '[data-scene-section="clarity"]');
    await wait(800);
    await save(pageRM, 'color-compare-clarity-reduced.png');

    await smoothScrollToEl(pageRM, '[data-scene-section="final"]');
    await wait(800);
    await save(pageRM, 'color-compare-final-reduced.png');
    await pageRM.close();

    // Normal motion (3D WebGL)
    const page3D = await browser.newPage();
    await page3D.setViewport({ width: 1440, height: 900 });
    await page3D.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(3000);
    await save(page3D, 'color-compare-hero-3d.png');

    await smoothScrollToEl(page3D, '[data-scene-section="clarity"]');
    await wait(1800);
    await save(page3D, 'color-compare-clarity-3d.png');

    await smoothScrollToEl(page3D, '[data-scene-section="final"]');
    await wait(1800);
    await save(page3D, 'color-compare-final-3d.png');
    await page3D.close();
  }

  await browser.close();
  console.log('\n✅ All screenshots saved to', OUT_DIR);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
