/**
 * Captures the exact Next.js dev indicator issues using headless Chrome with CDP.
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
  });
  page.on('pageerror', e => allLogs.push(`[pageerror] ${e.message}`));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(4000);

  await page.screenshot({ path: 'qa/phase-5-runtime-final/dev-indicator-initial.png' });
  
  // Now try to click the indicator badge (the "4 Issues" badge is at bottom-left)
  // First find it in the shadow DOM
  const badgeInfo = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return { error: 'no portal' };
    
    // Find buttons in the shadow root
    const buttons = Array.from(portal.shadowRoot.querySelectorAll('button'));
    return buttons.map(b => ({
      text: b.textContent?.trim().slice(0, 100),
      ariaLabel: b.getAttribute('aria-label'),
      rect: (() => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })(),
    }));
  });
  
  console.log('Buttons in shadow DOM:', JSON.stringify(badgeInfo, null, 2));

  // Try to click at different positions to find the issues indicator
  // Then screenshot and read the expanded panel
  
  // Try clicking the issue badge area at various positions
  for (const [x, y] of [[37, 862], [37, 870], [37, 880], [20, 862], [50, 862]]) {
    await page.mouse.click(x, y);
    await wait(200);
  }
  
  await wait(1000);
  await page.screenshot({ path: 'qa/phase-5-runtime-final/dev-indicator-after-click.png' });

  // Read the expanded content  
  const expandedContent = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return 'no portal';
    
    // Get all text, filtering out CSS
    function getAllText(root) {
      const texts = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const t = node.textContent.trim();
        if (t.length > 2 && !t.startsWith('{') && !t.startsWith('@') && !t.startsWith(':') && !t.includes('border-') && !t.includes('font-size') && !t.includes('margin') && !t.includes('color:')) {
          texts.push(t);
        }
      }
      return texts;
    }
    return getAllText(portal.shadowRoot);
  });
  
  console.log('\nExpanded content:', JSON.stringify(expandedContent, null, 2));
  console.log('\nAll console logs:');
  allLogs.forEach(l => console.log(l));

  // Try to find the issue count more precisely
  const issueCount = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return null;
    
    // Look for any element that mentions "issue" or has a number
    const allElements = portal.shadowRoot.querySelectorAll('*');
    const issueEls = [];
    for (const el of allElements) {
      const t = el.textContent?.trim();
      if (t && t.match(/^\d+\s*(issue|Issue)/)) {
        issueEls.push({ tag: el.tagName, text: t.slice(0, 50) });
      }
    }
    return issueEls;
  });
  console.log('\nIssue count elements:', JSON.stringify(issueCount));
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
