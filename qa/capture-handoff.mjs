/**
 * Phase 5 Handoff Verification — frame-by-frame screenshots around the
 * atomic SVG → WebGL switch.
 *
 * Timing model (GPU-accelerated Chrome, 60fps):
 *   Frame 0 (0ms)   : React renders, Effects fire, RAFs queued
 *   Frame 1 (~16ms) : R3F first useFrame; FirstFrameSignal sets canvasReady
 *   Frame 2 (~32ms) : Controller setup fires (before R3F loop); mesh does
 *                     atomic handoff (opacity=1, hideFallbacks)
 *   Frame 3+ (>32ms): Normal animation (rotation lerp from neutral to target)
 *
 * We capture:
 *   before  (~10ms)  : static SVG visible, WebGL not yet rendered
 *   switch  (~35ms)  : atomic handoff frame — mesh at opacity 1, SVG hidden
 *   after   (~600ms) : mesh settled into final scene pose
 *
 * node qa/capture-handoff.mjs
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL  = 'http://localhost:3000';
const OUT = join(__dirname, 'phase-5-blob-journey-final');
mkdirSync(OUT, { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

function save(buf, name) {
  writeFileSync(join(OUT, name), buf);
  console.log('✓', name);
}

async function newBrowser() {
  return puppeteer.launch({
    headless: false,
    protocolTimeout: 30000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--use-gl=desktop',   // GPU — required for correct WebGL color
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
}

async function run() {
  // ── handoff-hero-before: static SVG visible, WebGL not yet started ─────────
  {
    const browser = await newBrowser();
    const page = await browser.newPage();
    // Navigate and capture before the first RAF fires (domcontentloaded + ~10ms)
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await wait(10);
    save(await page.screenshot({ type: 'png' }), 'handoff-hero-before.png');
    await browser.close();
  }

  // ── handoff-hero-switch: atomic handoff frame (mesh at op=1, SVG hidden) ───
  // Frame 2 fires at ~32ms. We capture at 40ms to be safely past it.
  {
    const browser = await newBrowser();
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await wait(40);
    save(await page.screenshot({ type: 'png' }), 'handoff-hero-switch.png');
    await browser.close();
  }

  // ── handoff-hero-after: mesh settled into final pose ─────────────────────
  {
    const browser = await newBrowser();
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(700);
    save(await page.screenshot({ type: 'png' }), 'handoff-hero-after.png');
    await browser.close();
  }

  // ── handoff-about-switch: direct #about load, switch frame ───────────────
  // Wait for networkidle0 so the browser has scrolled to #about, then capture
  // at the handoff frame (~40ms of animation after page is ready).
  {
    const browser = await newBrowser();
    const page = await browser.newPage();
    await page.goto(BASE_URL + '#about', { waitUntil: 'networkidle0' });
    // Scroll to #about to ensure it's in view (hash may not have scrolled yet)
    await page.evaluate(() => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(50);  // ~3 frames: handoff should have fired
    save(await page.screenshot({ type: 'png' }), 'handoff-about-switch.png');
    await browser.close();
  }

  // ── handoff-contact-switch: direct #contact load, switch frame ───────────
  {
    const browser = await newBrowser();
    const page = await browser.newPage();
    await page.goto(BASE_URL + '#contact', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(50);
    save(await page.screenshot({ type: 'png' }), 'handoff-contact-switch.png');
    await browser.close();
  }

  console.log('\nAll handoff screenshots saved.');
}

run().catch(e => { console.error(e); process.exit(1); });
