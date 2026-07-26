import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  const warns = [], errors = [];
  page.on('console', m => {
    if (m.type() === 'warning') warns.push(m.text());
    if (m.type() === 'error') errors.push(m.text().slice(0, 100));
  });
  page.on('pageerror', e => errors.push(`[pageerror] ${e.message.slice(0, 100)}`));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(3000);

  // Scroll through entire page
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 200) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await wait(30);
  }
  await wait(2000);

  console.log(`Warnings (${warns.length}):`, warns);
  console.log(`Errors (${errors.length}):`, errors.filter(e => !e.includes('WebGLRenderer')));

  const imageWarnings = warns.filter(w => w.includes('width or height modified'));
  console.log(`\nImage warnings: ${imageWarnings.length} (expected: 0)`);
  if (imageWarnings.length === 0) {
    console.log('✓ Image warnings eliminated');
  } else {
    imageWarnings.forEach(w => console.log('  ✗', w));
  }

  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
