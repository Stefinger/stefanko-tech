/**
 * Reads Next.js dev overlay issues by clicking the error badge and reading the DOM.
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

  // Capture ALL console messages before page load
  const logs = [];
  page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await wait(3000);

  // Read full shadow DOM including structure, looking for issue content
  const shadowContent = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return { error: 'no portal' };

    // Get all elements with text content (not script/style)
    function getTextNodes(root) {
      const results = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        const tag = node.tagName?.toLowerCase();
        if (tag === 'style' || tag === 'script') continue;
        const direct = Array.from(node.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim())
          .filter(t => t.length > 0 && !t.startsWith('{') && !t.includes('border-'));
        if (direct.length > 0) {
          results.push({ tag, texts: direct, class: node.className });
        }
      }
      return results;
    }
    return getTextNodes(portal.shadowRoot);
  });

  console.log('\n=== Shadow DOM structure ===');
  if (Array.isArray(shadowContent)) {
    shadowContent.forEach(n => {
      if (n.texts.some(t => t.length > 0 && t.length < 300)) {
        console.log(`<${n.tag} class="${n.class || ''}">`);
        n.texts.forEach(t => console.log('  ' + t));
      }
    });
  } else {
    console.log(JSON.stringify(shadowContent));
  }

  // Click the issues button (it's the red badge at bottom-left)
  // Try different positions since viewport might differ
  for (const [x, y] of [[37, 822], [37, 850], [37, 830], [40, 820]]) {
    await page.mouse.click(x, y);
    await wait(300);
  }
  await wait(1000);

  await page.screenshot({ path: 'qa/phase-5-runtime-final/dev-issues-clicked.png' });

  // Re-read shadow DOM after click
  const afterClickContent = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return [];
    function getTextNodes(root) {
      const results = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        const tag = node.tagName?.toLowerCase();
        if (tag === 'style' || tag === 'script') continue;
        const direct = Array.from(node.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim())
          .filter(t => t.length > 1 && !t.startsWith('{') && !t.startsWith('@') && !t.includes('border-') && !t.includes('margin'));
        if (direct.length > 0) {
          results.push({ tag, texts: direct });
        }
      }
      return results;
    }
    return getTextNodes(portal.shadowRoot);
  });

  console.log('\n=== After click ===');
  afterClickContent.forEach(n => {
    if (n.texts.some(t => t.length > 2 && t.length < 500)) {
      console.log(`<${n.tag}>`);
      n.texts.forEach(t => console.log('  ' + t));
    }
  });

  console.log('\n=== Console Logs ===');
  logs.forEach(l => console.log(l));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
