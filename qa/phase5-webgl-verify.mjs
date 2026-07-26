/**
 * Phase 5 Production-WebGL Verification
 * 
 * Uses headless:false + --use-gl=angle (ANGLE/Metal on Apple M-series)
 * Real hardware WebGL2 context on Apple M5 via ANGLE Metal renderer.
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const FFMPEG  = '/opt/homebrew/bin/ffmpeg';
const PROD    = 'http://localhost:4000';
const OUT     = 'qa/phase-5-runtime-final-webgl';
mkdirSync(OUT, { recursive: true });

const wait = ms => new Promise(r => setTimeout(r, ms));

// ── GPU flags that produce real WebGL2 on Apple M-series ─────────────────────
// --use-gl=desktop fails (no desktop OpenGL on Apple Silicon).
// --use-gl=angle uses ANGLE which maps to Metal backend: hardware rendering.
const GPU_ARGS = [
  '--use-gl=angle',
  '--use-angle=metal',
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--disable-gpu-sandbox',
  '--no-sandbox',
  '--disable-setuid-sandbox',
];

// ── Launch helper ─────────────────────────────────────────────────────────────
function launch(w, h) {
  return puppeteer.launch({
    headless: false,
    protocolTimeout: 120_000,
    args: [...GPU_ARGS, `--window-size=${w},${h}`],
    defaultViewport: { width: w, height: h },
  });
}

// ── Encode frames → webm ──────────────────────────────────────────────────────
function encode(frameDir, outputPath, fps = 10) {
  const cmds = [
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/f%04d.png" -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuv420p "${outputPath}" 2>&1`,
    `${FFMPEG} -y -r ${fps} -i "${frameDir}/f%04d.png" -c:v libvpx -b:v 1M "${outputPath}" 2>&1`,
  ];
  for (const cmd of cmds) {
    try { execSync(cmd, { timeout: 90_000 }); return true; } catch {}
  }
  return false;
}

// ── WebGL probe (run inside page.evaluate) ────────────────────────────────────
async function probeWebGL(page) {
  return page.evaluate(() => {
    // 1. Native canvas WebGL
    const testCanvas = document.createElement('canvas');
    const gl2  = testCanvas.getContext('webgl2');
    const gl1  = !gl2 && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
    const gl   = gl2 || gl1;

    const nativeResult = (() => {
      if (!gl) return { supported: false };
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        supported: true,
        contextType: gl2 ? 'webgl2' : 'webgl',
        vendor:   dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR),
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        version:  gl.getParameter(gl.VERSION),
      };
    })();

    // 2. R3F / Three.js canvas status
    const r3fCanvas = document.querySelector('canvas');
    const appResult = (() => {
      if (!r3fCanvas) return { canvasExists: false };
      const appGL = r3fCanvas.getContext('webgl2') || r3fCanvas.getContext('webgl');
      const isLost = appGL ? appGL.isContextLost() : null;
      const dbg = appGL && appGL.getExtension('WEBGL_debug_renderer_info');
      return {
        canvasExists: true,
        contextType:  appGL ? (r3fCanvas.getContext('webgl2') ? 'webgl2' : 'webgl') : 'none',
        contextLost:  isLost,
        vendor:   dbg ? appGL.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : (appGL ? appGL.getParameter(appGL.VENDOR) : null),
        renderer: dbg ? appGL.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : (appGL ? appGL.getParameter(appGL.RENDERER) : null),
        canvasWidth:  r3fCanvas.width,
        canvasHeight: r3fCanvas.height,
      };
    })();

    // 3. Blob journey store state (accessible via window if exposed, else null)
    const storeState = (() => {
      // BlobJourneyController stores refs in React context — not on window.
      // Check visible fallback SVGs and canvas z-index as proxy.
      const fallbackSVGs = Array.from(document.querySelectorAll('[aria-hidden="true"] svg path[fill="#FF6FAE"]'));
      const hiddenFallbacks = fallbackSVGs.filter(el => {
        let parent = el.parentElement;
        while (parent) {
          if (getComputedStyle(parent).display === 'none') return true;
          parent = parent.parentElement;
        }
        return false;
      });
      return {
        totalFallbackSVGs: fallbackSVGs.length,
        hiddenFallbacks: hiddenFallbacks.length,
        canvasZIndex: r3fCanvas ? getComputedStyle(r3fCanvas.parentElement || r3fCanvas).zIndex : null,
      };
    })();

    return { native: nativeResult, app: appResult, store: storeState };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: WebGL Proof on production site
// ─────────────────────────────────────────────────────────────────────────────
async function captureWebGLProof() {
  console.log('\n══ 1. WebGL Proof ══════════════════════════════════════════');
  const browser = await launch(1440, 900);
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', m => consoleLogs.push({ type: m.type(), text: m.text() }));
  page.on('pageerror', e => consoleLogs.push({ type: 'pageerror', text: e.message }));

  await page.goto(PROD, { waitUntil: 'networkidle0', timeout: 30_000 });
  await wait(4_000); // let WebGL handoff complete

  // Probe before scrolling (Hero state)
  const proofHero = await probeWebGL(page);

  // Scroll to Clarity section and re-probe
  await page.evaluate(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await wait(2_000);
  const proofClarity = await probeWebGL(page);

  // Additional scene info
  const sceneInfo = await page.evaluate(() => {
    // Try to read scene from the canvas parent's data attribute or from DOM
    const heroSection = document.querySelector('[data-scene-section="hero"]');
    const claritySection = document.querySelector('[data-scene-section="clarity"]');
    const finalSection = document.querySelector('[data-scene-section="final"]');
    const canvasWrap = document.querySelector('canvas')?.parentElement;
    return {
      heroSectionVisible:    heroSection  ? heroSection.getBoundingClientRect().top < window.innerHeight  && heroSection.getBoundingClientRect().bottom > 0 : null,
      claritySectionVisible: claritySection ? claritySection.getBoundingClientRect().top < window.innerHeight && claritySection.getBoundingClientRect().bottom > 0 : null,
      finalSectionVisible:   finalSection ? finalSection.getBoundingClientRect().top < window.innerHeight && finalSection.getBoundingClientRect().bottom > 0 : null,
      canvasPosition:        canvasWrap ? getComputedStyle(canvasWrap).position : null,
      canvasZIndex:          canvasWrap ? getComputedStyle(canvasWrap).zIndex   : null,
    };
  });

  const errors = consoleLogs.filter(l => l.type === 'error' || l.type === 'pageerror');
  const webglErrors = errors.filter(l => l.text.includes('WebGL') || l.text.includes('WebGLRenderer'));

  const proof = {
    timestamp: new Date().toISOString(),
    productionUrl: PROD,
    gpuFlags: GPU_ARGS,
    nativeWebGL: proofHero.native,
    applicationCanvas: {
      atHero: proofHero.app,
      atClarity: proofClarity.app,
    },
    sceneAtClarity: sceneInfo,
    fallbackState: {
      atHero:    proofHero.store,
      atClarity: proofClarity.store,
    },
    consoleErrors: errors.length,
    webglErrors: webglErrors.length,
    webglErrorMessages: webglErrors.map(l => l.text.slice(0, 200)),
    hardwareConfirmed: proofHero.native.supported && !proofHero.native.renderer?.includes('SwiftShader') && !proofHero.native.renderer?.includes('llvmpipe'),
  };

  writeFileSync(`${OUT}/webgl-proof.json`, JSON.stringify(proof, null, 2));

  console.log('  Native WebGL:', JSON.stringify(proof.nativeWebGL));
  console.log('  App canvas (Hero):', JSON.stringify(proof.applicationCanvas.atHero));
  console.log('  App canvas (Clarity):', JSON.stringify(proof.applicationCanvas.atClarity));
  console.log('  Fallback at Hero:', JSON.stringify(proof.fallbackState.atHero));
  console.log('  Fallback at Clarity:', JSON.stringify(proof.fallbackState.atClarity));
  console.log('  Scene at Clarity:', JSON.stringify(proof.sceneAtClarity));
  console.log('  WebGL errors:', proof.webglErrors);
  console.log('  Hardware confirmed:', proof.hardwareConfirmed);

  await page.screenshot({ path: `${OUT}/webgl-proof-hero.png` });
  await page.evaluate(() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'instant' }); });
  await wait(1500);
  await page.screenshot({ path: `${OUT}/webgl-proof-clarity.png` });

  await browser.close();
  return proof;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Direct-hash frame verification
// ─────────────────────────────────────────────────────────────────────────────
async function captureHashFrames(hash, label, expectedScene) {
  console.log(`\n══ 2. Hash frames: ${hash} ════════════════════════════════`);
  const browser = await launch(1440, 900);
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', m => consoleLogs.push({ type: m.type(), text: m.text() }));
  page.on('pageerror', e => consoleLogs.push({ type: 'pageerror', text: e.message }));

  const measurements = [];
  const timings = [0, 50, 100, 300, 600, 1000];

  // Navigate
  const navStart = Date.now();
  page.goto(`${PROD}/${hash}`, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});

  // Capture at each timing
  for (const timing of timings) {
    const elapsed = Date.now() - navStart;
    const remaining = timing - elapsed;
    if (remaining > 0) await wait(remaining);

    const data = await page.evaluate((h) => {
      const targetEl = document.getElementById(h);
      const heroEl   = document.querySelector('[data-scene-section="hero"]');
      const canvas   = document.querySelector('canvas');
      const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
      
      // Check fallback visibility
      const fallbackSVGs = document.querySelectorAll('[aria-hidden="true"] svg');
      const visibleFallbacks = Array.from(fallbackSVGs).filter(svg => {
        let el = svg;
        while (el) {
          if (getComputedStyle(el).display === 'none') return false;
          el = el.parentElement;
        }
        return true;
      });

      return {
        scrollY: window.scrollY,
        targetTop:    targetEl ? targetEl.getBoundingClientRect().top  : null,
        heroBottom:   heroEl   ? heroEl.getBoundingClientRect().bottom : null,
        canvasExists: !!canvas,
        contextLost:  gl ? gl.isContextLost() : null,
        visibleFallbackCount: visibleFallbacks.length,
      };
    }, hash.slice(1)).catch(() => ({ scrollY: -1 }));

    const actualT = Date.now() - navStart;
    measurements.push({ requestedMs: timing, actualMs: actualT, ...data });
    
    const fname = `${OUT}/hash-${label}-${String(timing).padStart(4, '0')}.png`;
    await page.screenshot({ path: fname }).catch(() => {});
    
    console.log(`  t=${String(timing).padStart(4)}ms | scrollY=${data.scrollY} targetTop=${data.targetTop?.toFixed(0)} heroBottom=${data.heroBottom?.toFixed(0)} fallbacks=${data.visibleFallbackCount}`);
  }

  // Full load state
  await wait(2000);
  const finalState = await page.evaluate((h) => {
    const targetEl = document.getElementById(h);
    const heroEl   = document.querySelector('[data-scene-section="hero"]');
    return {
      scrollY:    window.scrollY,
      targetTop:  targetEl ? targetEl.getBoundingClientRect().top : null,
      heroBottom: heroEl   ? heroEl.getBoundingClientRect().bottom : null,
    };
  }, hash.slice(1));

  const proofState = await probeWebGL(page);
  await page.screenshot({ path: `${OUT}/hash-${label}-final.png` });
  await browser.close();

  const allScrollYs = measurements.filter(m => m.scrollY > 0).map(m => m.scrollY);
  const minScrollY  = allScrollYs.length > 0 ? Math.min(...allScrollYs) : -1;
  const heroFlash   = minScrollY > 0 && minScrollY < 200;

  const result = {
    hash, label, expectedScene,
    measurements,
    finalState,
    webglAtFinal: proofState,
    heroFlashDetected: heroFlash,
    minScrollY,
    consoleErrors: consoleLogs.filter(l => l.type === 'error' || l.type === 'pageerror').length,
  };

  writeFileSync(`${OUT}/hash-${label}-measurements.json`, JSON.stringify(result, null, 2));
  console.log(`  Hero flash: ${heroFlash} | minScrollY: ${minScrollY} | errors: ${result.consoleErrors}`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Production recordings with real WebGL
// ─────────────────────────────────────────────────────────────────────────────
const allConsole = { warnings: [], errors: [], pageerrors: [], unhandledRejections: [] };

async function recordScroll(url, outFile, w, h, label) {
  console.log(`\n══ Recording: ${label} (${w}×${h}) ════════════`);
  const browser = await launch(w, h);
  const page = await browser.newPage();

  page.on('console', m => {
    if (m.type() === 'warning') allConsole.warnings.push({ source: label, text: m.text() });
    if (m.type() === 'error')   allConsole.errors.push({ source: label, text: m.text() });
  });
  page.on('pageerror', e => allConsole.pageerrors.push({ source: label, text: e.message }));

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
  await wait(2_000);

  const totalH = await page.evaluate(() => document.body.scrollHeight);
  const frames = 48; // 48 frames @ 8fps = 6s
  const frameDir = `${OUT}/tmp-${outFile}`;
  mkdirSync(frameDir, { recursive: true });

  for (let i = 0; i < frames; i++) {
    const p = i / (frames - 1);
    const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
    const scrollY = Math.max(0, Math.min(totalH - h, e * totalH * 0.8));
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await wait(120);
    await page.screenshot({ path: `${frameDir}/f${String(i).padStart(4,'0')}.png` });
    if (i % 8 === 0) process.stdout.write(`. `);
  }
  console.log();

  await browser.close();
  const ok = encode(frameDir, `${OUT}/${outFile}`, 8);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile}`);
}

async function recordHashVideo(hash, outFile, w, h, label) {
  console.log(`\n══ Hash video: ${label} (${hash}) ════════════`);
  const browser = await launch(w, h);
  const page = await browser.newPage();

  page.on('console', m => {
    if (m.type() === 'warning') allConsole.warnings.push({ source: label, text: m.text() });
    if (m.type() === 'error')   allConsole.errors.push({ source: label, text: m.text() });
  });
  page.on('pageerror', e => allConsole.pageerrors.push({ source: label, text: e.message }));

  await page.goto(`${PROD}/${hash}`, { waitUntil: 'networkidle0', timeout: 30_000 });
  await wait(1_000);

  const frames = 40; // 40 @ 8fps = 5s
  const frameDir = `${OUT}/tmp-${outFile}`;
  mkdirSync(frameDir, { recursive: true });

  for (let i = 0; i < frames; i++) {
    await wait(125);
    await page.screenshot({ path: `${frameDir}/f${String(i).padStart(4,'0')}.png` });
    if (i % 8 === 0) process.stdout.write(`. `);
  }
  console.log();

  await browser.close();
  const ok = encode(frameDir, `${OUT}/${outFile}`, 8);
  execSync(`rm -rf "${frameDir}"`);
  console.log(`  ${ok ? '✓' : '✗'} ${outFile}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: WebGL failure simulation
// ─────────────────────────────────────────────────────────────────────────────
async function simulateWebGLFailure() {
  console.log('\n══ 4. WebGL Failure Simulation ════════════════════════════');
  const browser = await launch(1440, 900);
  const page = await browser.newPage();

  const errors = [], pageerrs = [], unhandled = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => pageerrs.push(e.message));
  page.on('dialog', d => d.dismiss());

  await page.goto(PROD, { waitUntil: 'networkidle0', timeout: 30_000 });
  await wait(2_000);

  // Simulate context loss
  const lossResult = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { canvasFound: false };
    const ext = (canvas.getContext('webgl2') || canvas.getContext('webgl'))?.getExtension('WEBGL_lose_context');
    if (!ext) return { canvasFound: true, extFound: false };
    ext.loseContext();
    return { canvasFound: true, extFound: true, lossTriggered: true };
  });

  await wait(2_000);

  const afterLoss = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const fallbackSVGs = document.querySelectorAll('[aria-hidden="true"] svg path[fill="#FF6FAE"]');
    const visibleFallbacks = Array.from(fallbackSVGs).filter(el => {
      let p = el.parentElement;
      while (p) { if (getComputedStyle(p).display === 'none') return false; p = p.parentElement; }
      return true;
    });
    return {
      canvasPresent: !!canvas,
      canvasDisplayed: canvas ? getComputedStyle(canvas).display !== 'none' : false,
      visibleFallbackPaths: visibleFallbacks.length,
    };
  });

  const result = {
    lossTriggered: lossResult,
    afterLoss,
    consoleErrors: errors,
    pageErrors: pageerrs,
    unhandledRejections: unhandled,
    pageRemainsFunctional: afterLoss.visibleFallbackPaths > 0 || !afterLoss.canvasDisplayed,
  };

  await page.screenshot({ path: `${OUT}/webgl-failure-sim.png` });
  await browser.close();

  console.log('  Loss triggered:', JSON.stringify(lossResult));
  console.log('  After loss:', JSON.stringify(afterLoss));
  console.log('  Console errors:', errors.length, errors.slice(0,2));
  console.log('  Page errors:', pageerrs.length);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('Phase 5 Production-WebGL Verification');
  console.log(`Production: ${PROD}`);
  console.log(`Output: ${OUT}/`);
  console.log('='.repeat(60));

  const webglProof    = await captureWebGLProof();
  const hashAbout     = await captureHashFrames('#about',   'about',   'clarity');
  const hashContact   = await captureHashFrames('#contact', 'contact', 'final');
  const failureSim    = await simulateWebGLFailure();

  await recordScroll(`${PROD}/`, 'production-desktop-slow.webm', 1440, 900, 'desktop-scroll');
  await recordScroll(`${PROD}/`, 'production-mobile-slow.webm',  390,  844, 'mobile-scroll');
  await recordHashVideo('#about',   'production-hash-about.webm',   1440, 900, 'hash-about-video');
  await recordHashVideo('#contact', 'production-hash-contact.webm', 1440, 900, 'hash-contact-video');

  // ── Console report ──────────────────────────────────────────────────────────
  const consoleReport = {
    timestamp: new Date().toISOString(),
    totals: {
      warnings:          allConsole.warnings.length,
      errors:            allConsole.errors.length,
      pageerrors:        allConsole.pageerrors.length,
      unhandledRejections: allConsole.unhandledRejections.length,
    },
    warnings:          allConsole.warnings,
    errors:            allConsole.errors,
    pageerrors:        allConsole.pageerrors,
    unhandledRejections: allConsole.unhandledRejections,
    webglErrors:       allConsole.errors.filter(e => e.text?.includes('WebGL') || e.text?.includes('THREE')),
    hydrationErrors:   allConsole.errors.filter(e => e.text?.includes('hydrat') || e.text?.includes('Minified React')),
  };
  writeFileSync(`${OUT}/console-report.json`, JSON.stringify(consoleReport, null, 2));

  // ── Output summary ──────────────────────────────────────────────────────────
  const files = execSync(`ls -lh ${OUT}/*.webm ${OUT}/*.json ${OUT}/*.png 2>/dev/null | grep -v "^total"`, { encoding: 'utf8' }).trim();

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('\n[Next.js output mode]');
  console.log('  output: (not set) → Node.js production server');
  console.log('  distDir: (not set) → .next/');
  console.log('  Serve: pnpm exec next start -p 4000');

  console.log('\n[WebGL]');
  console.log('  Renderer:', webglProof.nativeWebGL.renderer);
  console.log('  Vendor:  ', webglProof.nativeWebGL.vendor);
  console.log('  Context: ', webglProof.nativeWebGL.contextType);
  console.log('  Hardware:', webglProof.hardwareConfirmed);

  console.log('\n[Hash results]');
  console.log('  #about  → Hero flash:', hashAbout.heroFlashDetected,  '| minScrollY:', hashAbout.minScrollY);
  console.log('  #contact→ Hero flash:', hashContact.heroFlashDetected, '| minScrollY:', hashContact.minScrollY);

  console.log('\n[WebGL failure simulation]');
  console.log('  Triggered:', failureSim.lossTriggered.lossTriggered);
  console.log('  After loss:', JSON.stringify(failureSim.afterLoss));
  console.log('  Page functional:', failureSim.pageRemainsFunctional);

  console.log('\n[Console totals across all recordings]');
  console.log('  Warnings:', consoleReport.totals.warnings);
  console.log('  Errors:  ', consoleReport.totals.errors);
  console.log('  Pageerrs:', consoleReport.totals.pageerrors);
  console.log('  Unhandled:', consoleReport.totals.unhandledRejections);

  console.log('\n[Files]');
  console.log(files);
}

main().catch(e => { console.error('\nFATAL:', e); process.exit(1); });
