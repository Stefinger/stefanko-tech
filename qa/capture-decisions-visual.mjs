/**
 * Decisions cloud visual alignment verification.
 * Captures normal + reduced-motion screenshots at all required widths,
 * then produces side-by-side Figma comparisons.
 *
 * Usage: node qa/capture-decisions-visual.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'responsive-b-final');
fs.mkdirSync(OUT, { recursive: true });

const BASE   = 'http://localhost:3000';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ── Figma reference URLs from the get_screenshot calls ───────────────────── */
const FIGMA_DESKTOP_URL = 'https://www.figma.com/api/mcp/asset/21b9ea96-4098-4c10-be93-1419e3185bcf';
const FIGMA_MOBILE_URL  = 'https://www.figma.com/api/mcp/asset/a157201a-22b7-49ef-8f63-1d7a0819d69d';

/* ── Download a URL to a file ──────────────────────────────────────────────── */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

/* ── Scroll Decisions into view and wait for wave to fully draw ────────────── */
async function scrollToDecisions(page, isMobile) {
  const attr = isMobile ? 'data-d-journey-mobile' : 'data-d-journey-desktop';
  await page.evaluate((a) => {
    const sects = Array.from(document.querySelectorAll('section'));
    const dec   = sects.find(s => s.querySelector(`[${a}]`));
    if (dec) dec.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, attr);
  await new Promise(r => setTimeout(r, 3500));
}

/* ── Single capture ─────────────────────────────────────────────────────────── */
async function capture(browser, { w, h, label, reducedMotion }) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{
    name: 'prefers-reduced-motion',
    value: reducedMotion ? 'reduce' : 'no-preference',
  }]);
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));

  await scrollToDecisions(page, w <= 991);

  const suffix = reducedMotion ? '-reduced' : '';
  const name   = `decisions-visual-${label}${suffix}.png`;
  const dest   = path.join(OUT, name);
  await page.screenshot({ path: dest });
  console.log(`  ✓ ${name}`);
  await page.close();
  return dest;
}

/* ── Side-by-side comparison via Puppeteer HTML ────────────────────────────── */
async function sideBySide(browser, figmaPath, implPath, outName, figmaW, figmaH) {
  const figmaB64 = fs.readFileSync(figmaPath).toString('base64');
  const implB64  = fs.readFileSync(implPath).toString('base64');

  const page = await browser.newPage();
  /* composite: figma left, impl right, label row at top */
  const panelW = Math.max(figmaW, 700);
  const totalW = panelW * 2 + 8;
  const totalH = figmaH + 32;

  await page.setViewport({ width: totalW, height: totalH, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head><style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #222; display: flex; flex-direction: column; width: ${totalW}px; }
  .labels { display: flex; height: 32px; background: #333; }
  .labels span {
    flex: 1; display: flex; align-items: center; justify-content: center;
    color: #fff; font: 600 13px/1 sans-serif;
  }
  .panels { display: flex; gap: 8px; }
  .panel { flex: 0 0 ${panelW}px; overflow: hidden; }
  img { display: block; width: 100%; height: auto; }
</style></head>
<body>
  <div class="labels">
    <span>FIGMA (node ${outName.includes('1440') ? '19:57' : '113:67'})</span>
    <span>IMPLEMENTATION</span>
  </div>
  <div class="panels">
    <div class="panel">
      <img src="data:image/png;base64,${figmaB64}" />
    </div>
    <div class="panel">
      <img src="data:image/png;base64,${implB64}" />
    </div>
  </div>
</body>
</html>`);

  await new Promise(r => setTimeout(r, 300));
  const dest = path.join(OUT, outName);
  await page.screenshot({ path: dest, fullPage: true });
  console.log(`  ✓ ${outName}`);
  await page.close();
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
async function main() {
  /* 1. Download Figma reference images */
  const figmaDesktopPath = path.join(OUT, '_figma-ref-desktop.png');
  const figmaMobilePath  = path.join(OUT, '_figma-ref-mobile.png');
  console.log('Downloading Figma references…');
  await download(FIGMA_DESKTOP_URL, figmaDesktopPath).catch(() =>
    console.warn('  (Figma desktop URL expired — comparisons will use placeholder)'));
  await download(FIGMA_MOBILE_URL, figmaMobilePath).catch(() =>
    console.warn('  (Figma mobile URL expired — comparisons will use placeholder)'));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    /* 2. Capture required implementation screenshots */
    const widths = [
      { w: 360,  h: 780,  label: '360'  },
      { w: 390,  h: 844,  label: '390'  },
      { w: 768,  h: 1024, label: '768'  },
      { w: 992,  h: 768,  label: '992'  },
      { w: 1024, h: 768,  label: '1024' },
      { w: 1200, h: 900,  label: '1200' },
      { w: 1440, h: 900,  label: '1440' },
    ];

    const captured = {};
    for (const vp of widths) {
      console.log(`\n[ ${vp.w}px ]`);
      captured[vp.label] = {
        normal:  await capture(browser, { ...vp, reducedMotion: false }),
        reduced: await capture(browser, { ...vp, reducedMotion: true }),
      };
    }

    /* 3. Create side-by-side comparisons */
    console.log('\n[ composites ]');
    if (fs.existsSync(figmaDesktopPath)) {
      await sideBySide(browser, figmaDesktopPath, captured['1440'].reduced,
        'decisions-compare-1440.png', 1024, 800);
    }
    if (fs.existsSync(figmaMobilePath)) {
      await sideBySide(browser, figmaMobilePath, captured['390'].reduced,
        'decisions-compare-390.png', 390, 800);
    }

  } finally {
    await browser.close();
    console.log('\nDone. Screenshots in qa/responsive-b-final/');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
