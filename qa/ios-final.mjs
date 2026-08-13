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

/*
 * Screenshots are taken of the WHOLE viewport and cropped afterwards.
 *
 * `page.screenshot({ clip })` was tried first and its origin proved
 * unreliable across scroll states here — a check built on it silently samples
 * the wrong region and then passes for free. A full viewport capture is
 * unambiguous by definition: pixel (x, y) is CSS pixel (x, y) of the viewport
 * at deviceScaleFactor 1. Every check below is control-tested at the end of
 * this file to prove it can still fail.
 */
const viewportPixels = async () => {
  const b64 = await page.screenshot({ encoding: 'base64' });
  return page.evaluate(async data => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + data;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const g = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    return { w: g.width, h: g.height, d: Array.from(g.data) };
  }, b64);
};

/* Extracts a viewport-coordinate rectangle from a decoded viewport capture. */
const crop = (img, x, y, w, h) => {
  const out = [];
  for (let row = y; row < y + h; row++) {
    if (row < 0 || row >= img.h) continue;
    for (let col = x; col < x + w; col++) {
      if (col < 0 || col >= img.w) continue;
      const i = (row * img.w + col) * 4;
      out.push(img.d[i], img.d[i + 1], img.d[i + 2]);
    }
  }
  return out;
};

/* Fraction of pixels in the top strip that are not the brand dark green. */
async function topStripNonDark() {
  const px = crop(await viewportPixels(), 0, 0, 390, INSET);
  let bad = 0;
  for (let i = 0; i < px.length; i += 3) {
    // Anything lighter than a dark tone counts as a leak.
    if (px[i] > 60 || px[i + 1] > 80 || px[i + 2] > 75) bad++;
  }
  return bad / (px.length / 3);
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
  return crop(await viewportPixels(), box.x, box.y, box.w, box.h);
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
  for (let i = 0; i < a.length; i += 3) if (Math.abs(a[i] - b[i]) > 6) diff++;
  const pct = diff / (a.length / 3);
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

/*
 * ── E. Controls ────────────────────────────────────────────────────────────
 * A green suite proves nothing unless its checks can go red. These run last
 * because they deliberately break the page.
 */
console.log('\n── E. controls — the checks above must be able to fail ──');

await scrollTo((await sectionTop('proof')) + 300);
const withFix = await topStripNonDark();
// Same scroll position twice: only idle breathing separates the two samples.
const ct = await sectionTop('clarity');
const q1 = await blobPixels('clarity', ct + 200);
const q2 = await blobPixels('clarity', ct + 200);
let same = 0;
for (let i = 0; i < q1.length; i += 3) if (Math.abs(q1[i] - q2[i]) > 6) same++;
const idlePct = same / (q1.length / 3);
check(
  'B2 reads scroll, not noise',
  idlePct < 0.03,
  `${(idlePct * 100).toFixed(1)}% differ at an UNCHANGED scroll position`,
);

// Neutralise the backdrop and confirm the strip check goes red.
await scrollTo((await sectionTop('proof')) + 300);
await page.addStyleTag({
  content: 'header > div:first-child { background-color: transparent !important; }',
});
await sleep(400);
const noBackdrop = await topStripNonDark();
check(
  'strip check detects a removed backdrop',
  withFix === 0 && noBackdrop > 0.5,
  `${(withFix * 100).toFixed(1)}% with the fix → ${(noBackdrop * 100).toFixed(1)}% without it`,
);

const failed = results.filter(r => !r).length;
console.log(`\n  ${results.length - failed}/${results.length} checks passed${failed ? ` — ${failed} FAILED` : ' ✓'}\n`);
await browser.close();
process.exit(failed ? 1 : 0);
