/**
 * Mobile Blob S travel.
 *
 * Verifies that the blob is anchored and opaque while its section is centred,
 * releases downward and fades as the section leaves, and leaves no pixel on
 * screen between approved sections.
 *
 * Run against a production build: pnpm start -p 3300
 */
import puppeteer from 'puppeteer';

const URL = 'http://localhost:3300/';
const VH = 844;
const ALLOWED = ['hero', 'clarity', 'final'];
const FORBIDDEN = ['uncertainty', 'decisions', 'build', 'proof'];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const check = (n, ok, d = '') => {
  results.push(ok);
  console.log(`  ${String(n).padEnd(46)}${ok ? '✓' : '✗'}${d ? '  ' + d : ''}`);
};

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.setViewport({ width: 390, height: VH, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await sleep(2800);

/** Document Y that puts this slot's centre `fromTop` px below the viewport top. */
const scrollForSlotCentre = async (section, fromTop) => {
  const mid = await page.evaluate(s => {
    const c = document.querySelector(`[data-scene-section="${s}"] canvas`);
    const r = c.getBoundingClientRect();
    return r.top + r.height / 2 + window.scrollY;
  }, section);
  const wanted = Math.max(0, mid - fromTop);
  const landed = await page.evaluate(v => {
    window.scrollTo(0, v);
    return window.scrollY;
  }, wanted);
  await sleep(760);
  return Math.abs(landed - wanted) < 2;
};

const layerOpacity = async section =>
  page.evaluate(s => {
    const l = document.querySelector(`[data-scene-section="${s}"] [data-blob-layer]`);
    return l ? parseFloat(getComputedStyle(l).opacity || '1') : null;
  }, section);

// ── travel curve ────────────────────────────────────────────────────────────
console.log('\n── travel curve: opacity as the slot centre crosses the viewport ──');
console.log(`  ${''.padEnd(9)} slot centre at:  bottom      3/4       centre     1/4        top`);
for (const s of ALLOWED) {
  const row = [];
  for (const fromTop of [VH, VH * 0.75, VH * 0.5, VH * 0.25, 0]) {
    const reachable = await scrollForSlotCentre(s, fromTop);
    const op = await layerOpacity(s);
    row.push(`${op === null ? '  --  ' : op.toFixed(2).padStart(6)}${reachable ? ' ' : '*'}`);
  }
  console.log(`  ${s.padEnd(9)} ${row.join('    ')}`);
}
console.log('  (* = page cannot scroll that far; the section is pinned by the page end)');

// ── settled ─────────────────────────────────────────────────────────────────
console.log('\n── settled: anchored at full opacity while centred ──');
for (const s of ALLOWED) {
  await scrollForSlotCentre(s, VH * 0.5);
  const op = await layerOpacity(s);
  check(`${s.padEnd(9)} settled, fully opaque`, op !== null && op > 0.99, `opacity ${op?.toFixed(3)}`);
}

// ── released ────────────────────────────────────────────────────────────────
console.log('\n── released: gone by the time the slot reaches the viewport top ──');
for (const s of ALLOWED) {
  const reachable = await scrollForSlotCentre(s, 0);
  const op = await layerOpacity(s);
  if (!reachable) {
    console.log(`  ${s.padEnd(9)} pinned by the page end — stays settled by design (opacity ${op?.toFixed(3)})`);
    continue;
  }
  check(`${s.padEnd(9)} faded out on leaving`, op !== null && op < 0.05, `opacity ${op?.toFixed(3)}`);
}

// ── the blob actually moves down while releasing ────────────────────────────
/*
 * The direct evidence for travel rather than just a fade: with everything else
 * hidden, the blob's own pixel centroid must sit clearly BELOW the centre of
 * its canvas once released, and back at the centre when settled.
 */
console.log('\n── the release is a downward travel, not just a fade ──');
await page.addStyleTag({
  content: `body * { visibility: hidden !important; }
    [data-blob-layer] canvas { visibility: visible !important; }
    html, body, section { background: #000 !important; }`,
});
await sleep(500);

const blobCentroidOffset = async section => {
  const box = await page.evaluate(s => {
    const c = document.querySelector(`[data-scene-section="${s}"] canvas`);
    const r = c.getBoundingClientRect();
    return { top: r.top, h: r.height };
  }, section);
  const b64 = await page.screenshot({ encoding: 'base64' });
  return page.evaluate(async (d, bx) => {
    const i = new Image();
    i.src = 'data:image/png;base64,' + d;
    await i.decode();
    const c = document.createElement('canvas');
    c.width = i.width; c.height = i.height;
    c.getContext('2d').drawImage(i, 0, 0);
    const g = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let sum = 0, n = 0;
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++) {
        const k = (y * c.width + x) * 4;
        if (g[k] > 60 || g[k + 1] > 60 || g[k + 2] > 60) { sum += y; n++; }
      }
    if (n === 0) return null;
    // + means the blob sits below the centre of its own canvas
    return Math.round(sum / n - (bx.top + bx.h / 2));
  }, b64, box);
};

for (const s of ['hero', 'clarity']) {
  await scrollForSlotCentre(s, VH * 0.5);
  const settled = await blobCentroidOffset(s);
  await scrollForSlotCentre(s, VH * 0.15);
  const released = await blobCentroidOffset(s);
  const op = await layerOpacity(s);
  check(
    `${s.padEnd(9)} drifts down as it releases`,
    settled !== null && released !== null && released - settled > 25 && op < 0.9,
    `centroid ${settled >= 0 ? '+' : ''}${settled}px → ${released >= 0 ? '+' : ''}${released}px ` +
      `(${released - settled > 0 ? '+' : ''}${released - settled}px down), opacity ${op.toFixed(2)}`,
  );
}

// ── forbidden sections ──────────────────────────────────────────────────────
console.log('\n── forbidden sections mount nothing ──');
for (const s of FORBIDDEN) {
  await page.evaluate(x => {
    const e = document.querySelector(`[data-scene-section="${x}"]`);
    window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 150);
  }, s);
  await sleep(600);
  const n = await page.evaluate(x => document.querySelectorAll(`[data-scene-section="${x}"] canvas`).length, s);
  check(`${s.padEnd(12)} no canvas`, n === 0, `${n} found`);
}

// ── no blob pixels in the gaps ──────────────────────────────────────────────
console.log('\n── no blob PIXELS on screen between approved sections ──');
const litPercent = async () => {
  const b64 = await page.screenshot({ encoding: 'base64' });
  return page.evaluate(async d => {
    const i = new Image();
    i.src = 'data:image/png;base64,' + d;
    await i.decode();
    const c = document.createElement('canvas');
    c.width = i.width; c.height = i.height;
    c.getContext('2d').drawImage(i, 0, 0);
    const g = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let k = 0; k < g.length; k += 4) if (g[k] > 60 || g[k + 1] > 60 || g[k + 2] > 60) n++;
    return (n / (g.length / 4)) * 100;
  }, b64);
};
const sectionTop = async s =>
  page.evaluate(x => {
    const e = document.querySelector(`[data-scene-section="${x}"]`);
    return e.getBoundingClientRect().top + window.scrollY;
  }, s);

for (const [a, z, label] of [['hero', 'clarity', 'hero→clarity'], ['clarity', 'final', 'clarity→final']]) {
  const ta = await sectionTop(a), tz = await sectionTop(z);
  let worst = 0, at = null;
  // stop a full viewport short of the next section: closer than that and the
  // blob is legitimately arriving, which is the behaviour under test elsewhere.
  for (let y = ta + 900; y < tz - VH; y += 300) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await sleep(520);
    const v = await litPercent();
    if (v > worst) { worst = v; at = y; }
  }
  check(`${label.padEnd(14)} nothing on screen`, worst < 0.05,
    `peak ${worst.toFixed(3)}% of viewport${at !== null ? ` at scrollY ${at}` : ''}`);
}

// ── menu open/close mid-travel ──────────────────────────────────────────────
/*
 * The hard case for the travel: pause the blob while it is PART WAY through
 * releasing, then resume. Opacity and position both have to come back to the
 * same values, not to a settled default and not to a stale frozen frame.
 */
console.log('\n── menu open/close while mid-travel ──');
for (const s of ['hero', 'clarity']) {
  await scrollForSlotCentre(s, VH * 0.15);   // released, part faded
  const before = {
    op: await layerOpacity(s),
    centroid: await blobCentroidOffset(s),
    scrollY: await page.evaluate(() => window.scrollY),
  };
  await page.evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click());
  await sleep(700);
  await page.evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click());
  await sleep(900);
  const after = {
    op: await layerOpacity(s),
    centroid: await blobCentroidOffset(s),
    scrollY: await page.evaluate(() => window.scrollY),
  };
  check(
    `${s.padEnd(9)} resumes mid-travel state`,
    before.scrollY === after.scrollY &&
      Math.abs(before.op - after.op) < 0.03 &&
      Math.abs(before.centroid - after.centroid) < 6,
    `opacity ${before.op.toFixed(2)}→${after.op.toFixed(2)}, ` +
      `centroid ${before.centroid}px→${after.centroid}px, scrollY ${before.scrollY}→${after.scrollY}`,
  );
}

check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

const failed = results.filter(r => !r).length;
console.log(`\n  ${results.length - failed}/${results.length} checks passed${failed ? ` — ${failed} FAILED` : ' ✓'}\n`);
await browser.close();
process.exit(failed ? 1 : 0);
