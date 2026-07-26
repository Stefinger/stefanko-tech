/**
 * Scrolls through entire page and captures all console messages.
 */
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

  const allLogs = [];
  page.on('console', m => {
    const entry = `[${m.type()}] ${m.text()}`;
    allLogs.push(entry);
    if (m.type() !== 'log' && m.type() !== 'info') {
      console.log(entry);
    }
  });
  page.on('pageerror', e => {
    const entry = `[pageerror] ${e.message}`;
    allLogs.push(entry);
    console.log(entry);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(3000);

  // Scroll through entire page slowly
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page height:', pageHeight);
  
  for (let y = 0; y <= pageHeight; y += 200) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await wait(50);
  }
  
  await wait(2000);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(1000);

  // Find the dev tools button and click it
  const buttonRect = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return null;
    const buttons = portal.shadowRoot.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.getAttribute('aria-label')?.includes('Dev Tools') || btn.getAttribute('aria-label')?.includes('issue')) {
        const r = btn.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2, label: btn.getAttribute('aria-label'), text: btn.textContent?.slice(0, 50) };
      }
    }
    // Return first button
    const firstBtn = buttons[0];
    if (firstBtn) {
      const r = firstBtn.getBoundingClientRect();
      return { x: r.x + r.width/2, y: r.y + r.height/2, label: firstBtn.getAttribute('aria-label'), text: firstBtn.textContent?.slice(0, 50) };
    }
    return null;
  });
  
  console.log('Dev tools button:', JSON.stringify(buttonRect));
  
  if (buttonRect) {
    await page.mouse.click(buttonRect.x, buttonRect.y);
    await wait(1000);
    await page.screenshot({ path: 'qa/phase-5-runtime-final/dev-tools-open.png' });
  }

  // Get full shadow DOM content after click
  const fullContent = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return 'no portal';
    
    // Find all visible text nodes, filtering out CSS
    const results = [];
    const walker = document.createTreeWalker(portal.shadowRoot, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent.trim();
      // Filter CSS-like content
      if (t.length > 2 && !t.includes('{') && !t.includes(':') && !t.startsWith('.') && !t.startsWith('@') && !t.startsWith('*') && !t.startsWith('/*')) {
        results.push(t);
      }
    }
    return results;
  });
  
  console.log('\n=== Shadow DOM text after click ===');
  fullContent.forEach(t => console.log(t));

  console.log('\n=== ALL WARNINGS/ERRORS ===');
  allLogs.filter(l => l.startsWith('[warn') || l.startsWith('[error') || l.startsWith('[pageerror')).forEach(l => console.log(l));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
