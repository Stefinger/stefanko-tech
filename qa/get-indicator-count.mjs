import puppeteer from 'puppeteer';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('console', m => {
    if (m.type() !== 'log' && m.type() !== 'info') {
      console.log(`[${m.type()}] ${m.text()}`);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(3000);

  // Scroll through the full page to trigger all lazy warnings
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 100) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await wait(20);
  }
  await wait(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(1000);

  // Get all button information from shadow DOM
  const buttonInfo = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal?.shadowRoot) return { error: 'no portal' };
    
    // Get ALL elements in shadow DOM with their info
    const allEls = [];
    const elements = portal.shadowRoot.querySelectorAll('*');
    for (const el of elements) {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim().slice(0, 60);
      const styles = getComputedStyle(el);
      if ((tag === 'button' || tag === 'span' || tag === 'div') && text && text.length < 50) {
        allEls.push({
          tag,
          text,
          bg: styles.backgroundColor,
          color: styles.color,
          display: styles.display,
          ariaLabel: el.getAttribute('aria-label'),
        });
      }
    }
    return allEls.filter(e => e.display !== 'none');
  });

  console.log('\nAll visible elements with text:');
  if (Array.isArray(buttonInfo)) {
    buttonInfo.forEach(el => {
      if (el.text) console.log(`  ${el.tag}: "${el.text}" (bg: ${el.bg}, label: ${el.ariaLabel})`);
    });
  }

  await page.screenshot({ path: 'qa/phase-5-runtime-final/full-page-after-scroll.png', fullPage: false });
  
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
