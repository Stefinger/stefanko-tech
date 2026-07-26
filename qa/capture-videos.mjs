/**
 * Phase 5 Visual Hardening — video recordings (GPU-accelerated)
 *
 * Uses page.mouse.wheel() instead of page.evaluate() for scrolling.
 * Reason: with headless:false + --use-gl=desktop, the GPU compositor +
 * simultaneous ffmpeg encoding starve the JS engine, causing long-running
 * page.evaluate() Promises (RAF scroll loops) to hit the CDP timeout.
 * page.mouse.wheel() is a fire-and-forget CDP call that avoids this.
 *
 * node qa/capture-videos.mjs
 */

import puppeteer from 'puppeteer';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FFMPEG = join(
  __dirname,
  '../node_modules/.pnpm/@ffmpeg-installer+darwin-arm64@4.1.5/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg',
);
process.env.PATH = `${dirname(FFMPEG)}:${process.env.PATH}`;

const BASE_URL = 'http://localhost:3000';
const OUT = join(__dirname, 'phase-5-blob-journey-final');
mkdirSync(OUT, { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

// Smooth scroll via discrete mouse-wheel deltas (50ms steps, ease-in-out).
// Each step is a fast fire-and-forget CDP call — no long-running Promise.
async function smoothScroll(page, targetY, durationMs) {
  const startY = await page.evaluate(() => window.scrollY);
  const total = targetY - startY;
  if (Math.abs(total) < 1) return;

  const steps = Math.max(1, Math.round(durationMs / 50));
  let prev = 0;

  // Move pointer to the centre of the viewport so wheel events are received
  const vp = page.viewport();
  await page.mouse.move(vp.width / 2, vp.height / 2);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const curr = total * eased;
    const delta = curr - prev;
    prev = curr;
    await page.mouse.wheel({ deltaY: delta });
    await wait(50);
  }
}

async function getPageHeight(page) {
  return page.evaluate(() => document.body.scrollHeight);
}

async function getSectionTop(page, selector) {
  return page.evaluate(
    sel => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    },
    selector,
  );
}

async function record(name, viewportW, viewportH, fn) {
  const path = join(OUT, name);
  console.log(`Recording ${name} …`);

  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 120000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${viewportW + 16},${viewportH + 88}`,
      '--use-gl=desktop',
    ],
    defaultViewport: { width: viewportW, height: viewportH },
  });

  try {
    const page = await browser.newPage();
    const recorder = await page.screencast({ path });
    await fn(page);
    await recorder.stop();
    console.log('✓', name);
  } finally {
    await browser.close();
  }
}

async function run() {
  // ── desktop-slow-scroll (1440 × 900) ─────────────────────────────────────
  await record('desktop-slow-scroll.webm', 1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(3000);
    const pageH = await getPageHeight(page);
    await smoothScroll(page, pageH, 9000);
    await wait(1500);
  });

  // ── desktop-fast-scroll (1440 × 900) ─────────────────────────────────────
  await record('desktop-fast-scroll.webm', 1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    const pageH = await getPageHeight(page);
    await smoothScroll(page, pageH, 2500);
    await wait(1000);
  });

  // ── desktop-reverse-scroll (1440 × 900) ──────────────────────────────────
  await record('desktop-reverse-scroll.webm', 1440, 900, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2500);
    const finalTop = await getSectionTop(page, '[data-scene-section="final"]');
    await smoothScroll(page, finalTop, 3500);
    await wait(1500);
    await smoothScroll(page, 0, 3500);
    await wait(1500);
  });

  // ── mobile-slow-scroll (390 × 844) ───────────────────────────────────────
  await record('mobile-slow-scroll.webm', 390, 844, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2500);
    const pageH = await getPageHeight(page);
    await smoothScroll(page, pageH, 9000);
    await wait(1000);
  });

  // ── mobile-fast-scroll (390 × 844) ───────────────────────────────────────
  await record('mobile-fast-scroll.webm', 390, 844, async page => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(2000);
    const pageH = await getPageHeight(page);
    await smoothScroll(page, pageH, 2500);
    await wait(600);
    await smoothScroll(page, 0, 2500);
    await wait(600);
  });

  // ── hash-about (1440 × 900) ───────────────────────────────────────────────
  await record('hash-about.webm', 1440, 900, async page => {
    await page.goto(BASE_URL + '#about', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(3500);
    const clarityTop = await getSectionTop(page, '[data-scene-section="clarity"]');
    await smoothScroll(page, clarityTop + 200, 1200);
    await wait(2000);
  });

  // ── hash-contact (1440 × 900) ────────────────────────────────────────────
  await record('hash-contact.webm', 1440, 900, async page => {
    await page.goto(BASE_URL + '#contact', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await wait(3500);
    const finalTop = await getSectionTop(page, '[data-scene-section="final"]');
    await smoothScroll(page, finalTop + 100, 1200);
    await wait(2000);
  });

  // ── Verification ──────────────────────────────────────────────────────────
  console.log('\nVerifying video files:');
  const required = [
    'desktop-slow-scroll.webm',
    'desktop-fast-scroll.webm',
    'desktop-reverse-scroll.webm',
    'mobile-slow-scroll.webm',
    'mobile-fast-scroll.webm',
    'hash-about.webm',
    'hash-contact.webm',
  ];
  let allOk = true;
  for (const f of required) {
    const ok = existsSync(join(OUT, f));
    console.log(ok ? '✓' : '✗ MISSING', f);
    if (!ok) allOk = false;
  }
  if (!allOk) process.exit(1);
  console.log('\nAll 7 videos recorded with GPU-accelerated Chrome (--use-gl=desktop).');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
