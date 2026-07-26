/**
 * Precise timing test: captures scrollY at 0, 50, 100, 200, 500, 1000ms after navigation.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=desktop', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  for (const hash of ['#about', '#contact']) {
    const page = await browser.newPage();
    const logs = [];
    page.on('console', m => { if (m.type() !== 'log' && m.type() !== 'info') logs.push(`[${m.type()}] ${m.text().slice(0, 120)}`); });

    // Navigate and start measuring immediately
    const navStart = Date.now();
    
    // Use CDP to capture load events precisely
    const client = await page.createCDPSession();
    await client.send('Page.enable');
    
    const measurements = [];
    
    // Navigate
    const navPromise = page.goto(`http://localhost:3000/${hash}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    
    // Immediately start measuring
    for (const delay of [0, 50, 100, 200, 500, 1000, 2000]) {
      await wait(delay === 0 ? 5 : delay - (measurements.length > 0 ? measurements[measurements.length - 1].delay : 0));
      const scrollY = await page.evaluate(() => window.scrollY).catch(() => -1);
      measurements.push({ delay: delay, scrollY, t: Date.now() - navStart });
    }
    
    await navPromise.catch(() => {});
    
    // Final state after full load
    await wait(3000);
    const finalScrollY = await page.evaluate(() => window.scrollY);
    const targetInfo = await page.evaluate((h) => {
      const el = document.getElementById(h);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, offsetTop: el.offsetTop, scrollMarginTop: getComputedStyle(el).scrollMarginTop };
    }, hash.slice(1));
    
    const scrollRestoration = await page.evaluate(() => history.scrollRestoration);
    
    console.log(`\n=== ${hash} ===`);
    console.log(`history.scrollRestoration: ${scrollRestoration}`);
    console.log(`Scroll measurements:`, measurements);
    console.log(`Final scrollY: ${finalScrollY}`);
    console.log(`Target element:`, JSON.stringify(targetInfo));
    console.log(`Console messages:`, logs);
    
    const minScrollY = Math.min(...measurements.map(m => m.scrollY).filter(s => s >= 0));
    const heroFlash = minScrollY < 100;
    console.log(`Hero flash detected: ${heroFlash} (min scrollY: ${minScrollY})`);
    
    await page.close();
  }
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
