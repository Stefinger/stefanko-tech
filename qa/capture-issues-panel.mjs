/**
 * Opens the Next.js dev overlay, clicks the issues badge if visible,
 * and reads all text from the shadow DOM.
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'fs';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  const allLogs = [];
  page.on('console', m => allLogs.push({ type: m.type(), text: m.text() }));
  page.on('pageerror', e => allLogs.push({ type: 'pageerror', text: e.message }));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(3000);
  
  // Scroll through the full page
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= pageHeight; y += 150) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await wait(30);
  }
  await wait(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(1000);

  // Dump the entire shadow DOM HTML
  const shadowHTML = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return 'no portal';
    return portal.shadowRoot.innerHTML.slice(0, 10000);
  });
  
  writeFileSync('qa/phase-5-runtime-final/shadow-dom.html', shadowHTML);
  console.log('Shadow DOM saved (first 2000 chars):');
  console.log(shadowHTML.slice(0, 2000));

  console.log('\n=== ALL CONSOLE MESSAGES ===');
  allLogs.forEach(l => console.log(`[${l.type}] ${l.text}`));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
