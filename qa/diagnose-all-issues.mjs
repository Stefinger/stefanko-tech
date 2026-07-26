/**
 * Diagnoses all console warnings/errors and checks hash navigation behavior.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

async function checkPage(browser, url, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  const logs = [];
  page.on('console', m => {
    if (m.type() === 'warning' || m.type() === 'error') {
      logs.push(`[${m.type()}] ${m.text()}`);
    }
  });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(5000);
  
  const scrollY = await page.evaluate(() => window.scrollY);
  const targetEl = await page.evaluate((hash) => {
    if (!hash) return null;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { 
      scrollY: window.scrollY,
      top: r.top,
      id: el.id,
      scrollMarginTop: getComputedStyle(el).scrollMarginTop,
      offsetTop: el.offsetTop,
    };
  }, url.includes('#') ? url.split('#')[1] : null);
  
  // Check the Next.js indicator shadow DOM for issue count
  const indicatorInfo = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return 'no portal';
    const fullText = portal.shadowRoot.textContent?.trim() || '';
    // Look for issue number
    const issueMatch = fullText.match(/(\d+)\s+[Ii]ssue/);
    return { 
      hasIssues: issueMatch ? issueMatch[1] : 'not found',
      snippet: fullText.slice(0, 300)
    };
  });
  
  console.log(`\n=== ${label} ===`);
  console.log(`URL: ${url}`);
  console.log(`scrollY: ${scrollY}`);
  if (targetEl) console.log(`Target element:`, JSON.stringify(targetEl, null, 2));
  console.log(`Next.js indicator:`, JSON.stringify(indicatorInfo));
  console.log(`Console warnings/errors (${logs.length}):`);
  logs.forEach(l => console.log('  ' + l));
  
  await page.close();
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=desktop'],
    defaultViewport: { width: 1440, height: 900 },
  });

  // Check main page for all issues
  const mainPage = await browser.newPage();
  await mainPage.setViewport({ width: 1440, height: 900 });
  
  const allLogs = [];
  mainPage.on('console', m => allLogs.push({ type: m.type(), text: m.text() }));
  mainPage.on('pageerror', e => allLogs.push({ type: 'pageerror', text: e.message }));
  
  await mainPage.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(5000);
  
  // Scroll through the whole page to trigger all warnings
  await mainPage.evaluate(() => {
    return new Promise(resolve => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 300;
        if (y < document.body.scrollHeight) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      step();
    });
  });
  await wait(3000);
  
  console.log('\n=== ALL CONSOLE MESSAGES (main page) ===');
  allLogs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  // Try to click the issues indicator
  const indicator = await mainPage.$('[data-nextjs-toast]');
  console.log('\nIndicator element found:', !!indicator);
  
  // Get all shadow DOM text  
  const shadowText = await mainPage.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return 'no portal found';
    return portal.shadowRoot.textContent || 'empty shadow root';
  });
  console.log('\nShadow root text (first 500):', shadowText.slice(0, 500));
  
  await mainPage.close();
  
  // Now check hash navigation
  await checkPage(browser, 'http://localhost:3000/#about', '#about direct load');
  await checkPage(browser, 'http://localhost:3000/#contact', '#contact direct load');
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
