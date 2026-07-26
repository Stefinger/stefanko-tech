/**
 * Diagnoses the direct hash load Hero flash by capturing screenshots 
 * at specific time intervals to see when the page is at #about vs Hero.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
mkdirSync('qa/phase-5-runtime-final', { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

async function captureHashLoad(browser, hash, label) {
  console.log(`\n=== Testing ${hash} ===`);
  
  // Open a blank page first
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  const events = [];
  page.on('console', m => {
    if (m.type() !== 'log' && m.type() !== 'info') {
      events.push({ time: Date.now(), type: 'console', msg: m.text().slice(0, 100) });
    }
  });

  // Navigate and immediately measure in tight loop
  const navPromise = page.goto(`http://localhost:3000/${hash}`, { 
    waitUntil: 'commit', // Only wait for the initial response, not full load
    timeout: 30000 
  });
  
  // Start measuring immediately after navigation starts
  const measurements = [];
  const startTime = Date.now();
  
  // Run measurement loop for 2 seconds
  let measuring = true;
  const measureLoop = async () => {
    while (measuring) {
      const scrollY = await page.evaluate(() => window.scrollY).catch(() => -1);
      const docHeight = await page.evaluate(() => document.body?.scrollHeight || 0).catch(() => 0);
      measurements.push({ 
        t: Date.now() - startTime, 
        scrollY,
        docHeight
      });
      await wait(50);
    }
  };
  
  const measurePromise = measureLoop();
  await navPromise;
  await wait(2000);
  measuring = false;
  await measurePromise;
  
  // Take screenshots at key intervals
  await page.goto(`http://localhost:3000/${hash}`, { waitUntil: 'commit', timeout: 30000 });
  const t0 = Date.now();
  
  const screenshots = [0, 100, 300, 600, 1000];
  for (const delay of screenshots) {
    await wait(delay === 0 ? 0 : delay - (screenshots.indexOf(delay) > 0 ? screenshots[screenshots.indexOf(delay) - 1] : 0));
    const scrollY = await page.evaluate(() => window.scrollY).catch(() => -1);
    await page.screenshot({ 
      path: `qa/phase-5-runtime-final/hash-${label}-${delay}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log(`  t=${Date.now() - t0}ms, screenshot scrollY=${scrollY}, saved as hash-${label}-${delay}.png`);
  }
  
  // Analysis  
  console.log('\nMeasurements (t=0 is navigation start):');
  measurements.forEach(m => {
    if (m.t % 100 < 60 || m.scrollY !== measurements[0]?.scrollY) {
      console.log(`  t=${m.t}ms: scrollY=${m.scrollY}, docHeight=${m.docHeight}`);
    }
  });
  
  const scrollYAtStart = measurements[0]?.scrollY ?? -1;
  const scrollYAtEnd = measurements[measurements.length - 1]?.scrollY ?? -1;
  const flashDetected = scrollYAtStart < 100 && scrollYAtEnd > 100;
  console.log(`Flash detected: ${flashDetected} (start: ${scrollYAtStart}, end: ${scrollYAtEnd})`);
  
  await page.close();
  return { scrollYAtStart, scrollYAtEnd, flashDetected, measurements };
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--use-gl=desktop',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
  
  await captureHashLoad(browser, '#about', 'about');
  await captureHashLoad(browser, '#contact', 'contact');
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
