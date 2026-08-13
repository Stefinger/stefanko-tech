/**
 * iPhone stability QA — navbar top area, mobile Blob S scope, menu regression.
 *
 * The safe-area inset is FORCED to 47 px, because a desktop browser reports 0
 * and the bug only exists where it is non-zero. This validates the mechanism,
 * not the device.
 *
 * Run against a production build:  pnpm start -p 3300
 */
import puppeteer from 'puppeteer';

const URL = 'http://localhost:3300/';
const INSET = 47;
const SECTIONS = ['hero', 'uncertainty', 'clarity', 'decisions', 'build', 'proof', 'final'];
const BLOB_ALLOWED = new Set(['hero', 'clarity', 'final']);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const pass = n => `${String(n).padEnd(46)}✓`;
const fail = n => `${String(n).padEnd(46)}✗`;

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`  ${ok ? pass(name) : fail(name)}${detail ? '  ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(e.message));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await page.addStyleTag({ content: `:root { --safe-top: ${INSET}px !important; }` });
await sleep(2600);

/* Decodes a screenshot in-page (no native image deps) and returns its pixels. */
const decode = (b64) => page.evaluate(async data => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + data;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data);
}, b64);

/* Fraction of pixels in the top strip that are not the brand dark green. */
async function topStripNonDark(extraHeight = 0) {
  const h = INSET + extraHeight;
  const b64 = await page.screenshot({
    clip: { x: 0, y: 0, width: 390, height: h }, encoding: 'base64',
  });
  const d = await decode(b64);
  let bad = 0;
  for (let i = 0; i < d.length; i += 4) {
    // Anything lighter than a dark tone counts as a leak.
    if (d[i] > 60 || d[i + 1] > 80 || d[i + 2] > 75) bad++;
  }
  return bad / (d.length / 4);
}

const scrollTo = async y => { await page.evaluate(v => window.scrollTo(0, v), y); await sleep(700); };
const sectionTop = async id =>
  page.evaluate(s => {
    const el = document.querySelector(`[data-scene-section="${s}"]`);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  }, id);

const openMenu = async () => {
  await page.evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click());
  await sleep(650);
};
const closeMenu = async () => {
  await page.evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click());
  await sleep(750);
};

// ── A. Navbar top area ──────────────────────────────────────────────────────
console.log('\n── A. top area above the navbar (inset forced to 47px) ──');

let worstStrip = 0;
const stripAt = async label => {
  const v = await topStripNonDark();
  worstStrip = Math.max(worstStrip, v);
  check(label, v === 0, `${(v * 100).toFixed(1)}% non-dark`);
};

await stripAt('initial load, at top');
for (const s of SECTIONS.slice(1)) {
  await scrollTo((await sectionTop(s)) + 200);
  await stripAt(`scrolled down into ${s}`);
}
// scroll back up through everything
for (const s of [...SECTIONS].reverse().slice(1)) {
  await scrollTo((await sectionTop(s)) + 120);
  await stripAt(`scrolled up into ${s}`);
}
await scrollTo(0);
await stripAt('returned to top');

// menu states over a cream section
await scrollTo((await sectionTop('clarity')) + 200);
await openMenu();
await stripAt('menu OPEN over cream section');
await closeMenu();
await stripAt('menu CLOSED over cream section');

/*
 * The mechanism test: on iOS a position:fixed header is not repositioned in
 * lockstep with the visual viewport while Safari's chrome collapses, so it
 * transiently sits a few px lower than the top of the screen. Shifting the
 * header down reproduces exactly that exposure.
 */
console.log('\n── A2. simulated fixed-header lag during chrome collapse ──');
for (const lag of [8, 24, 60]) {
  await page.addStyleTag({ content: `header { transform: translateY(${lag}px); }` });
  await sleep(350);
  const v = await topStripNonDark();
  worstStrip = Math.max(worstStrip, v);
  check(`header lagging ${lag}px below viewport top`, v === 0, `${(v * 100).toFixed(1)}% non-dark`);
}
await page.reload({ waitUntil: 'load' });
await page.addStyleTag({ content: `:root { --safe-top: ${INSET}px !important; }` });
await sleep(2400);

console.log(`\n  worst case across every state: ${(worstStrip * 100).toFixed(2)}% non-dark`);

// visible navbar content must stay out of the unsafe area
const navGeom = await page.evaluate(() => {
  const logo = document.querySelector('header a[href="/"]').getBoundingClientRect();
  const burger = document.querySelector('header button[aria-controls="mobile-menu"]').getBoundingClientRect();
  return { logoTop: Math.round(logo.top), burgerTop: Math.round(burger.top) };
});
check('logo below the inset', navGeom.logoTop >= INSET, `top ${navGeom.logoTop}px`);
check('hamburger below the inset', navGeom.burgerTop >= INSET, `top ${navGeom.burgerTop}px`);

// ── B. Blob visibility scope ────────────────────────────────────────────────
console.log('\n── B. mobile Blob S appears only in Hero / Clarity / Final ──');

for (const s of SECTIONS) {
  await scrollTo((await sectionTop(s)) + 150);
  const has = await page.evaluate(sec => {
    const el = document.querySelector(`[data-scene-section="${sec}"]`);
    return !!el && el.querySelectorAll('canvas').length > 0;
  }, s);
  const want = BLOB_ALLOWED.has(s);
  check(`${s.padEnd(12)} blob ${has ? 'present' : 'absent '}`, has === want, want ? '(expected present)' : '(expected absent)');
}
const globalFixed = await page.evaluate(
  () => [...document.querySelectorAll('canvas')].filter(c => {
    let n = c.parentElement;
    while (n && n !== document.body) {
      if (getComputedStyle(n).position === 'fixed') return true;
      n = n.parentElement;
    }
    return false;
  }).length,
);
check('no global fixed WebGL canvas', globalFixed === 0, `${globalFixed} found`);

// ── B2. the blob is alive on scroll, not static ─────────────────────────────
console.log('\n── B2. blob still reacts to scroll inside its section ──');

async function blobPixels(section, y) {
  await scrollTo(y);
  const box = await page.evaluate(s => {
    const c = document.querySelector(`[data-scene-section="${s}"] canvas`);
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }, section);
  if (!box || box.y < 0 || box.y + box.h > 844) return null;
  const b64 = await page.screenshot({
    clip: { x: box.x, y: box.y, width: box.w, height: box.h }, encoding: 'base64',
  });
  return decode(b64);
}

for (const s of ['hero', 'clarity', 'final']) {
  const top = await sectionTop(s);
  const a = await blobPixels(s, top + 60);
  const b = await blobPixels(s, top + 200);
  if (!a || !b || a.length !== b.length) {
    check(`${s.padEnd(12)} scroll response`, false, 'could not sample');
    continue;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 6) diff++;
  const pct = diff / (a.length / 4);
  check(`${s.padEnd(12)} pose changes with scroll`, pct > 0.01, `${(pct * 100).toFixed(1)}% of pixels differ`);
}

// ── C. Menu open/close regression ───────────────────────────────────────────
console.log('\n── C. menu open/close must not corrupt the blob ──');

for (const s of SECTIONS) {
  const y = (await sectionTop(s)) + 150;
  await scrollTo(y);

  const before = await page.evaluate(sec => {
    const c = document.querySelector(`[data-scene-section="${sec}"] canvas`);
    const r = c && c.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      box: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null,
      count: document.querySelectorAll('canvas').length,
    };
  }, s);

  await openMenu();
  // While open: no blob may be visible anywhere over the overlay.
  const duringOverlay = await page.evaluate(() => {
    const overlay = document.getElementById('mobile-menu');
    const oz = Number(getComputedStyle(overlay).zIndex);
    return [...document.querySelectorAll('canvas')].filter(c => {
      const r = c.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) return false;
      let n = c.parentElement, z = 0;
      while (n && n !== document.body) {
        const v = Number(getComputedStyle(n).zIndex);
        if (!Number.isNaN(v) && v > z) z = v;
        n = n.parentElement;
      }
      return z > oz;
    }).length;
  });
  await closeMenu();

  const after = await page.evaluate(sec => {
    const c = document.querySelector(`[data-scene-section="${sec}"] canvas`);
    const r = c && c.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      box: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null,
      count: document.querySelectorAll('canvas').length,
    };
  }, s);

  const same =
    before.scrollY === after.scrollY &&
    JSON.stringify(before.box) === JSON.stringify(after.box) &&
    before.count === after.count;
  const stillCorrectScope = BLOB_ALLOWED.has(s) ? after.box !== null : after.box === null;

  check(
    `${s.padEnd(12)} survives menu open/close`,
    same && stillCorrectScope && duringOverlay === 0,
    `scrollY ${before.scrollY}→${after.scrollY}, box ${JSON.stringify(before.box)}→${JSON.stringify(after.box)}`,
  );
}

// ── D. hygiene ──────────────────────────────────────────────────────────────
console.log('\n── D. hygiene ──');
const overflow = await page.evaluate(() =>
  Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
check('no horizontal overflow', overflow === 0, `${overflow}px`);
check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

const failed = results.filter(r => !r).length;
console.log(`\n  ${results.length - failed}/${results.length} checks passed${failed ? ` — ${failed} FAILED` : ' ✓'}\n`);
await browser.close();
process.exit(failed ? 1 : 0);
