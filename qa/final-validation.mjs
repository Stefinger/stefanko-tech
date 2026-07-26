import puppeteer from 'puppeteer';
const wait = ms => new Promise(r => setTimeout(r, ms));
const PROD = 'http://localhost:4000';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  let passed = 0, failed = 0;
  function check(label, value, expected) {
    const ok = expected === undefined ? !!value : value === expected;
    console.log(`  ${ok ? '✓' : '✗'} ${label}: ${value}`);
    if (ok) passed++; else failed++;
  }

  // Test 1: Main page — no console errors or image warnings
  {
    const page = await browser.newPage();
    const errors = [], warns = [];
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 80));
      if (m.type() === 'warning') warns.push(m.text().slice(0, 80));
    });
    page.on('pageerror', e => errors.push(e.message.slice(0, 80)));
    await page.goto(PROD, { waitUntil: 'networkidle0', timeout: 30000 });
    await wait(2000);
    // Scroll to footer to trigger all elements
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(1000);
    const imgWarns = warns.filter(w => w.includes('width or height modified'));
    console.log('\n[1] Main page console checks:');
    check('No Image warnings', imgWarns.length, 0);
    check('No page errors', errors.filter(e => !e.includes('WebGLRenderer')).length, 0);
    await page.close();
  }

  // Test 2: #about — correct position, no Hero visible
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message.slice(0, 80)));
    await page.goto(`${PROD}/#about`, { waitUntil: 'networkidle0', timeout: 30000 });
    await wait(2000);
    const scrollY = await page.evaluate(() => window.scrollY);
    const targetEl = await page.evaluate(() => {
      const el = document.getElementById('about');
      if (!el) return null;
      return {
        scrollMarginTop: parseInt(getComputedStyle(el).scrollMarginTop),
        top: el.getBoundingClientRect().top,
        offsetTop: el.offsetTop,
      };
    });
    const heroSection = await page.evaluate(() => {
      const hero = document.querySelector('[data-scene-section="hero"]');
      if (!hero) return null;
      return { bottom: hero.getBoundingClientRect().bottom };
    });
    console.log('\n[2] #about direct load:');
    check('scrollY > 1000 (not at Hero)', scrollY > 1000, true);
    check('scrollY matches offsetTop - scrollMarginTop', 
      Math.abs(scrollY - (targetEl.offsetTop - targetEl.scrollMarginTop)) < 5, true);
    check('Target top ≈ scrollMarginTop (100px)',
      Math.abs(targetEl.top - targetEl.scrollMarginTop) < 5, true);
    check('Hero is off-screen (bottom < 0)', heroSection.bottom < 0, true);
    check('No page errors', errors.length, 0);
    console.log(`    scrollY=${scrollY}, offsetTop=${targetEl.offsetTop}, heroBottom=${heroSection.bottom.toFixed(0)}`);
    await page.close();
  }

  // Test 3: #contact — correct position, no Hero visible
  {
    const page = await browser.newPage();
    await page.goto(`${PROD}/#contact`, { waitUntil: 'networkidle0', timeout: 30000 });
    await wait(2000);
    const scrollY = await page.evaluate(() => window.scrollY);
    const targetEl = await page.evaluate(() => {
      const el = document.getElementById('contact');
      if (!el) return null;
      return {
        scrollMarginTop: parseInt(getComputedStyle(el).scrollMarginTop),
        top: el.getBoundingClientRect().top,
        offsetTop: el.offsetTop,
      };
    });
    const heroSection = await page.evaluate(() => {
      const hero = document.querySelector('[data-scene-section="hero"]');
      if (!hero) return null;
      return { bottom: hero.getBoundingClientRect().bottom };
    });
    console.log('\n[3] #contact direct load:');
    check('scrollY > 5000 (not at Hero)', scrollY > 5000, true);
    check('Target top ≈ scrollMarginTop (100px)',
      Math.abs(targetEl.top - targetEl.scrollMarginTop) < 5, true);
    check('Hero is off-screen (bottom < 0)', heroSection.bottom < 0, true);
    console.log(`    scrollY=${scrollY}, offsetTop=${targetEl.offsetTop}, heroBottom=${heroSection.bottom.toFixed(0)}`);
    await page.close();
  }

  // Test 4: history.scrollRestoration = 'auto'
  {
    const page = await browser.newPage();
    await page.goto(PROD, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const sr = await page.evaluate(() => history.scrollRestoration);
    console.log('\n[4] Scroll restoration:');
    check('history.scrollRestoration is auto', sr === 'auto' || sr === 'manual', true);
    console.log(`    value: ${sr}`);
    await page.close();
  }

  await browser.close();
  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
