/**
 * Simulates an iPhone top inset by forcing --safe-top, then samples the real
 * rendered pixels in that strip across scroll positions and menu states.
 * env(safe-area-inset-*) cannot be set from script, so overriding the variable
 * the layout actually consumes is the closest faithful check available off-device.
 *   node qa/ios-safe-area.mjs [url]
 */
import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:3300/';
const INSET = 47;                     // iPhone 14/15 portrait status-bar inset
const DARK = [8, 46, 38];             // #082E26

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
await p.addStyleTag({ content: `:root{--safe-top:${INSET}px;--safe-bottom:34px;}` });
await new Promise(r => setTimeout(r, 2000));

const stripIsDark = async () => {
  const b64 = await p.screenshot({ encoding: 'base64', captureBeyondViewport: false });
  return p.evaluate(async (data, inset, dark) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const dpr = img.width / window.innerWidth;
    const d = x.getImageData(0, 0, c.width, Math.round(inset * dpr)).data;
    let bad = 0, total = 0;
    for (let i = 0; i < d.length; i += 4) {
      total++;
      if (Math.abs(d[i]-dark[0])>12 || Math.abs(d[i+1]-dark[1])>12 || Math.abs(d[i+2]-dark[2])>12) bad++;
    }
    return { pct: +(bad / total * 100).toFixed(2) };
  }, b64, INSET, DARK);
};

const at = async (label, fn) => {
  await fn();
  await new Promise(r => setTimeout(r, 700));
  const { pct } = await stripIsDark();
  console.log(`  ${label.padEnd(34)} non-dark pixels in top ${INSET}px: ${String(pct).padStart(6)}%  ${pct < 0.5 ? '✓' : '✗'}`);
  return pct;
};

console.log('── top inset must always read dark green ──');
const results = [];
results.push(await at('fresh load (top)', async () => {}));
for (const [name, sel] of [['Uncertainty','uncertainty'],['Clarity','clarity'],['Decisions','decisions'],['Build','build'],['Proof','proof'],['Final CTA','final']]) {
  results.push(await at(`scrolled into ${name}`, () => p.evaluate(s => {
    const e = document.querySelector(`[data-scene-section="${s}"]`);
    const r = e.getBoundingClientRect();
    window.scrollTo(0, r.top + window.scrollY + r.height / 2 - window.innerHeight / 2);
  }, sel)));
}
results.push(await at('menu OPEN (over cream section)', () => p.click('header button')));
results.push(await at('menu CLOSED', () => p.click('header button')));
results.push(await at('scrolled back to top', () => p.evaluate(() => window.scrollTo(0, 0))));

console.log(`\n  worst case: ${Math.max(...results)}% non-dark  → ${Math.max(...results) < 0.5 ? 'NO light strip anywhere ✓' : 'LIGHT STRIP DETECTED ✗'}`);

console.log('\n── visible navbar content stays inside the safe area ──');
const geo = await p.evaluate(inset => {
  const logo = document.querySelector('header a');
  const burger = document.querySelector('header button');
  return { inset, logoTop: Math.round(logo.getBoundingClientRect().top), burgerTop: Math.round(burger.getBoundingClientRect().top) };
}, INSET);
console.log(`  inset ${geo.inset}px | logo top ${geo.logoTop}px ${geo.logoTop >= geo.inset ? '✓' : '✗'} | hamburger top ${geo.burgerTop}px ${geo.burgerTop >= geo.inset ? '✓' : '✗'}`);

console.log('\n── errors / overflow ──');
const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(`  horizontal overflow: ${ov}  |  console errors: ${errs.length ? JSON.stringify(errs.slice(0,3)) : 'none ✓'}`);
await b.close();
