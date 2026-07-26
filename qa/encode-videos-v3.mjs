import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import puppeteer from 'puppeteer';

const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const PROD_URL = 'http://localhost:4000';
const OUT_DIR = 'qa/phase-5-runtime-final';
mkdirSync(OUT_DIR, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

function encode(frameDir, outputPath, fps = 8) {
  try {
    execSync(
      `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx-vp9 -b:v 0 -crf 35 -pix_fmt yuv420p "${outputPath}" 2>&1`,
      { timeout: 120000 }
    );
    return true;
  } catch {
    try {
      execSync(
        `${FFMPEG} -y -r ${fps} -i "${frameDir}/frame-%04d.png" -c:v libvpx -b:v 600k "${outputPath}" 2>&1`,
        { timeout: 120000 }
      );
      return true;
    } catch { return false; }
  }
}

async function recordScroll(url, outFile, width, height) {
  console.log(`Recording scroll: ${outFile} (${width}x${height})`);
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 90000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width, height },
  });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 60)); });
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(1500);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const frameDir = `${OUT_DIR}/tmp-${outFile.replace('.webm', '')}-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });

  // 40 frames, 8fps → 5 second video
  const numFrames = 40;
  for (let i = 0; i < numFrames; i++) {
    const p = i / (numFrames - 1);
    const eased = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
    const scrollY = Math.max(0, Math.min(totalHeight - height, eased * totalHeight * 0.78));
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await wait(150);
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4,'0')}.png` });
    process.stdout.write(i % 10 === 0 ? `${i} ` : '');
  }
  console.log();
  await browser.close();

  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile} | errors: ${logs.slice(0,2).join('; ') || 'none'}`);
}

async function recordHash(hash, outFile, width, height) {
  console.log(`Recording hash: ${outFile} (${hash})`);
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 90000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width, height },
  });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 60)); });
  
  await page.goto(`${PROD_URL}/${hash}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(500);

  const frameDir = `${OUT_DIR}/tmp-${outFile.replace('.webm', '')}-${Date.now()}`;
  mkdirSync(frameDir, { recursive: true });
  
  // 32 frames at 8fps = 4 second video
  const numFrames = 32;
  for (let i = 0; i < numFrames; i++) {
    await wait(125);
    await page.screenshot({ path: `${frameDir}/frame-${String(i).padStart(4,'0')}.png` });
  }
  
  await browser.close();
  const ok = encode(frameDir, `${OUT_DIR}/${outFile}`);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile} | errors: ${logs.slice(0,2).join('; ') || 'none'}`);
}

async function run() {
  await recordScroll(`${PROD_URL}/`, 'production-desktop-slow.webm', 1440, 900);
  await recordScroll(`${PROD_URL}/`, 'production-mobile-slow.webm', 390, 844);
  await recordHash('#about', 'production-hash-about.webm', 1440, 900);
  await recordHash('#contact', 'production-hash-contact.webm', 1440, 900);

  console.log('\n=== Output files ===');
  console.log(execSync(`ls -lh ${OUT_DIR}/*.webm 2>/dev/null || echo "none"`, {encoding:'utf8'}));
}

run().catch(e => { console.error(e); process.exit(1); });
