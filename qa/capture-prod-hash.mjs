/**
 * Captures frame-by-frame hash screenshots and production recordings.
 * Uses production server (port 4000, no dev indicators).
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { execSync } from 'child_process';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

const PROD_URL = 'http://localhost:4000';

// GPU args — use ANGLE which maps to Metal on Apple Silicon
const GPU_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--use-gl=angle',          // ANGLE: Metal on M-series Mac, OpenGL on others
  '--enable-gpu',
  '--disable-software-rasterizer',
  '--ignore-gpu-blocklist',
  '--window-size=1440,900',
];

async function captureHashFrames(browser, hash, label) {
  console.log(`\n=== Capturing ${hash} frame-by-frame ===`);
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', m => {
    if (m.type() !== 'log' && m.type() !== 'info') {
      logs.push(`[${m.type()}] ${m.text().slice(0, 100)}`);
    }
  });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message.slice(0, 100)}`));

  // Navigate and capture frames at specific times
  const screenshots = {};

  const navPromise = page.goto(`${PROD_URL}/${hash}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Capture at 0ms (as soon as navigate starts)
  await wait(5);
  const scrollAt0 = await page.evaluate(() => window.scrollY).catch(() => -1);
  await page.screenshot({ path: `qa/phase-5-runtime-final/hash-${label}-000.png` });
  screenshots[0] = scrollAt0;
  console.log(`  000ms: scrollY=${scrollAt0}`);

  await wait(95);
  const scrollAt100 = await page.evaluate(() => window.scrollY).catch(() => -1);
  await page.screenshot({ path: `qa/phase-5-runtime-final/hash-${label}-100.png` });
  screenshots[100] = scrollAt100;
  console.log(`  100ms: scrollY=${scrollAt100}`);

  await wait(200);
  const scrollAt300 = await page.evaluate(() => window.scrollY).catch(() => -1);
  await page.screenshot({ path: `qa/phase-5-runtime-final/hash-${label}-300.png` });
  screenshots[300] = scrollAt300;
  console.log(`  300ms: scrollY=${scrollAt300}`);

  await wait(300);
  const scrollAt600 = await page.evaluate(() => window.scrollY).catch(() => -1);
  await page.screenshot({ path: `qa/phase-5-runtime-final/hash-${label}-600.png` });
  screenshots[600] = scrollAt600;
  console.log(`  600ms: scrollY=${scrollAt600}`);

  await wait(400);
  const scrollAt1000 = await page.evaluate(() => window.scrollY).catch(() => -1);
  await page.screenshot({ path: `qa/phase-5-runtime-final/hash-${label}-1000.png` });
  screenshots[1000] = scrollAt1000;
  console.log(`  1000ms: scrollY=${scrollAt1000}`);

  await navPromise.catch(() => {});
  await wait(3000);

  const finalScrollY = await page.evaluate(() => window.scrollY);
  const targetInfo = await page.evaluate((h) => {
    const el = document.getElementById(h);
    if (!el) return null;
    return {
      top: el.getBoundingClientRect().top,
      scrollMarginTop: getComputedStyle(el).scrollMarginTop,
      offsetTop: el.offsetTop,
    };
  }, hash.slice(1));

  console.log(`  Final: scrollY=${finalScrollY}`);
  console.log(`  Target: ${JSON.stringify(targetInfo)}`);
  console.log(`  Console: ${logs.length > 0 ? logs.join(', ') : 'none'}`);

  // Validate: no scroll at 0 means browser already at correct position
  const minScrollY = Math.min(...Object.values(screenshots).filter(s => s >= 0));
  const heroVisible = minScrollY < 200; // Hero is in first 1072px
  console.log(`  Hero visible at any frame: ${heroVisible}`);
  console.log(`  Min scrollY across all frames: ${minScrollY}`);

  await page.close();
  return { screenshots, finalScrollY, targetInfo, logs };
}

async function captureVideo(browser, url, filename, viewportWidth = 1440, viewportHeight = 900) {
  console.log(`\n=== Capturing video: ${filename} ===`);
  const page = await browser.newPage();
  await page.setViewport({ width: viewportWidth, height: viewportHeight });

  const logs = [];
  page.on('console', m => {
    if (m.type() !== 'log' && m.type() !== 'info') {
      logs.push(`[${m.type()}] ${m.text().slice(0, 80)}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2000);

  // Record video by capturing frames and encoding with ffmpeg
  const frameDir = `qa/phase-5-runtime-final/frames-${filename.replace('.webm', '')}`;
  mkdirSync(frameDir, { recursive: true });

  const totalFrames = 120; // 4 seconds at 30fps
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const scrollY = Math.min(scrollHeight * progress * 0.7, scrollHeight - viewportHeight);
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    if (i % 10 === 0) await wait(50);
    await page.screenshot({
      path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png`,
    });
  }

  console.log(`  Captured ${totalFrames} frames, encoding...`);

  try {
    execSync(
      `ffmpeg -y -r 30 -i "${frameDir}/frame-%04d.png" -c:v libvpx-vp9 -b:v 1M -pix_fmt yuva420p "qa/phase-5-runtime-final/${filename}" 2>/dev/null`,
      { stdio: 'pipe', timeout: 60000 }
    );
    console.log(`  ✓ Video: qa/phase-5-runtime-final/${filename}`);
  } catch {
    // Try vp8
    try {
      execSync(
        `ffmpeg -y -r 30 -i "${frameDir}/frame-%04d.png" -c:v libvpx -b:v 1M "qa/phase-5-runtime-final/${filename}" 2>/dev/null`,
        { stdio: 'pipe', timeout: 60000 }
      );
      console.log(`  ✓ Video (vp8): qa/phase-5-runtime-final/${filename}`);
    } catch (e2) {
      console.log(`  ✗ Video encoding failed: ${e2.message}`);
    }
  }

  // Clean up frames
  execSync(`rm -rf "${frameDir}"`);
  
  console.log(`  Console messages: ${logs.length > 0 ? logs.slice(0, 3).join('; ') : 'none'}`);
  await page.close();
}

async function captureHashVideo(browser, hash, filename, width = 1440, height = 900) {
  console.log(`\n=== Capturing hash video: ${filename} (${hash}) ===`);
  const page = await browser.newPage();
  await page.setViewport({ width, height });

  const logs = [];
  page.on('console', m => {
    if (m.type() !== 'log' && m.type() !== 'info') logs.push(`[${m.type()}] ${m.text().slice(0, 60)}`);
  });

  // Navigate fresh
  await page.goto(`${PROD_URL}/${hash}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(1000);

  const frameDir = `qa/phase-5-runtime-final/frames-${filename.replace('.webm', '')}`;
  mkdirSync(frameDir, { recursive: true });

  // Capture 3 seconds of the initial state (to show blob settling in)
  const totalFrames = 90; // 3 seconds at 30fps
  for (let i = 0; i < totalFrames; i++) {
    await wait(33); // ~30fps
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png` });
  }

  console.log(`  Captured ${totalFrames} frames, encoding...`);

  try {
    execSync(
      `ffmpeg -y -r 30 -i "${frameDir}/frame-%04d.png" -c:v libvpx-vp9 -b:v 1M -pix_fmt yuva420p "qa/phase-5-runtime-final/${filename}" 2>/dev/null`,
      { stdio: 'pipe', timeout: 60000 }
    );
    console.log(`  ✓ Video: qa/phase-5-runtime-final/${filename}`);
  } catch {
    try {
      execSync(
        `ffmpeg -y -r 30 -i "${frameDir}/frame-%04d.png" -c:v libvpx -b:v 1M "qa/phase-5-runtime-final/${filename}" 2>/dev/null`,
        { stdio: 'pipe', timeout: 60000 }
      );
      console.log(`  ✓ Video (vp8): qa/phase-5-runtime-final/${filename}`);
    } catch (e) {
      console.log(`  ✗ Video encoding failed: ${e.message.slice(0, 80)}`);
    }
  }

  execSync(`rm -rf "${frameDir}"`);
  console.log(`  Console: ${logs.length > 0 ? logs.slice(0,3).join('; ') : 'none'}`);
  await page.close();
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: GPU_ARGS,
    defaultViewport: null, // set per page
  });

  // === Frame-by-frame hash verification ===
  await captureHashFrames(browser, '#about', 'about');
  await captureHashFrames(browser, '#contact', 'contact');

  // === Production scroll videos ===
  await captureVideo(browser, `${PROD_URL}/`, 'production-desktop-slow.webm', 1440, 900);
  await captureVideo(browser, `${PROD_URL}/`, 'production-mobile-slow.webm', 390, 844);

  // === Hash videos ===
  await captureHashVideo(browser, '#about', 'production-hash-about.webm', 1440, 900);
  await captureHashVideo(browser, '#contact', 'production-hash-contact.webm', 1440, 900);

  await browser.close();
  console.log('\n=== All QA captures complete ===');
  console.log('Files in qa/phase-5-runtime-final/:');
  try {
    const files = execSync('ls -la qa/phase-5-runtime-final/ | grep -v "^total\\|^d"').toString();
    console.log(files);
  } catch {}
}

run().catch(e => { console.error(e); process.exit(1); });
