import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import puppeteer from 'puppeteer';

const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const PROD_URL = 'http://localhost:4000';
const OUT_DIR = 'qa/phase-5-runtime-final';
mkdirSync(OUT_DIR, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

const GPU_ARGS = [
  '--no-sandbox', '--disable-setuid-sandbox',
  '--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist',
  '--disable-software-rasterizer',
];

function encode(frameDir, outputPath, fps = 10) {
  const cmds = [
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx-vp9 -b:v 0 -crf 33 -pix_fmt yuv420p "${outputPath}" 2>&1`,
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx -b:v 800k "${outputPath}" 2>&1`,
  ];
  for (const cmd of cmds) {
    try {
      execSync(cmd, { timeout: 120000 });
      return true;
    } catch {
      console.log('    encode attempt failed, trying next...');
    }
  }
  return false;
}

async function recordScroll(url, outFile, width, height) {
  console.log(`Recording: ${outFile}`);
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 60000,
    args: [...GPU_ARGS, `--window-size=${width},${height}`],
    defaultViewport: { width, height },
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2000);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const frameDir = `${OUT_DIR}/tmp-${outFile.replace('.webm', '')}-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });

  // Capture 60 frames at 10fps = 6 second video, scrolling through the page
  const numFrames = 60;
  for (let i = 0; i < numFrames; i++) {
    const progress = i / (numFrames - 1);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const scrollY = Math.max(0, Math.min(totalHeight - height, eased * totalHeight * 0.75));
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await wait(100); // give page time to render
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png` });
    if (i % 10 === 0) console.log(`    frame ${i}/${numFrames}`);
  }

  await browser.close();
  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile}`);
}

async function recordHash(hash, outFile, width, height) {
  console.log(`Recording hash: ${outFile} (${hash})`);
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 60000,
    args: [...GPU_ARGS, `--window-size=${width},${height}`],
    defaultViewport: { width, height },
  });
  const page = await browser.newPage();

  await page.goto(`${PROD_URL}/${hash}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(500);

  const frameDir = `${OUT_DIR}/tmp-${outFile.replace('.webm', '')}-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });

  // 4 seconds at 10fps = 40 frames
  const numFrames = 40;
  for (let i = 0; i < numFrames; i++) {
    await wait(100);
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png` });
    if (i % 10 === 0) console.log(`    frame ${i}/${numFrames}`);
  }

  await browser.close();
  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile}`);
}

async function run() {
  await recordScroll(`${PROD_URL}/`, 'production-desktop-slow.webm', 1440, 900);
  await recordScroll(`${PROD_URL}/`, 'production-mobile-slow.webm', 390, 844);
  await recordHash('#about', 'production-hash-about.webm', 1440, 900);
  await recordHash('#contact', 'production-hash-contact.webm', 1440, 900);

  console.log('\n=== Output files ===');
  console.log(execSync(`ls -lh ${OUT_DIR}/*.webm 2>/dev/null || echo "no webm files"`).toString());
}

run().catch(e => { console.error(e); process.exit(1); });
