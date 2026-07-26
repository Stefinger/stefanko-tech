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
  '--window-size=1440,900',
];

function encode(frameDir, outputPath, fps = 30) {
  // Try VP9 first, fall back to VP8
  const cmds = [
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx-vp9 -b:v 0 -crf 33 -pix_fmt yuv420p "${outputPath}" 2>&1`,
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx -b:v 1M "${outputPath}" 2>&1`,
  ];
  for (const cmd of cmds) {
    try {
      execSync(cmd, { timeout: 120000 });
      return true;
    } catch {}
  }
  return false;
}

async function recordScroll(url, outFile, width, height, durationMs = 6000, fps = 30) {
  console.log(`Recording scroll: ${outFile} (${width}x${height})`);
  const browser = await puppeteer.launch({
    headless: false, args: [...GPU_ARGS, `--window-size=${width},${height}`], defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 80)); });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(1500);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const numFrames = Math.ceil((durationMs / 1000) * fps);
  const frameDir = `${OUT_DIR}/tmp-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });

  for (let i = 0; i < numFrames; i++) {
    const progress = i / (numFrames - 1);
    // Ease-in-out
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const scrollY = Math.max(0, Math.min(totalHeight - height, eased * totalHeight * 0.75));
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png` });
    if (i % 30 === 0) await wait(10);
  }

  await browser.close();
  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`, fps);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile} | errors: ${logs.length > 0 ? logs[0] : 'none'}`);
}

async function recordHash(hash, outFile, width, height, durationMs = 3000, fps = 30) {
  console.log(`Recording hash: ${outFile} (${hash})`);
  const browser = await puppeteer.launch({
    headless: false, args: [...GPU_ARGS, `--window-size=${width},${height}`], defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height });

  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 80)); });

  await page.goto(`${PROD_URL}/${hash}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(500);

  const numFrames = Math.ceil((durationMs / 1000) * fps);
  const frameDir = `${OUT_DIR}/tmp-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });

  for (let i = 0; i < numFrames; i++) {
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4, '0')}.png` });
    await wait(Math.floor(1000 / fps));
  }

  await browser.close();
  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`, fps);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile} | errors: ${logs.length > 0 ? logs[0] : 'none'}`);
}

async function run() {
  await recordScroll(`${PROD_URL}/`, 'production-desktop-slow.webm', 1440, 900, 7000);
  await recordScroll(`${PROD_URL}/`, 'production-mobile-slow.webm', 390, 844, 7000);
  await recordHash('#about', 'production-hash-about.webm', 1440, 900, 4000);
  await recordHash('#contact', 'production-hash-contact.webm', 1440, 900, 4000);

  console.log('\n=== Videos ===');
  const files = execSync(`ls -lh ${OUT_DIR}/*.webm 2>/dev/null || echo "none"`).toString();
  console.log(files);
}

run().catch(e => { console.error(e); process.exit(1); });
