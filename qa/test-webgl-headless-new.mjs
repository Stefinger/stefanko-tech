import puppeteer from 'puppeteer';
const wait = ms => new Promise(r => setTimeout(r, ms));

// Test headless:'new' with ANGLE flags — does WebGL work for screenshots?
const browser = await puppeteer.launch({
  headless: 'new',
  protocolTimeout: 60_000,
  args: [
    '--use-gl=angle', '--use-angle=metal',
    '--enable-gpu', '--ignore-gpu-blocklist', '--disable-gpu-sandbox',
    '--no-sandbox', '--disable-setuid-sandbox',
    '--window-size=800,600',
  ],
  defaultViewport: { width: 800, height: 600 },
});

const page = await browser.newPage();
await page.goto('about:blank');
await wait(500);

const webgl = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return { supported: false };
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    supported: true,
    contextType: canvas.getContext('webgl2') ? 'webgl2' : 'webgl',
    vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  };
});
console.log('WebGL in headless:new:', JSON.stringify(webgl));

// Test screenshot speed
const t0 = Date.now();
await page.screenshot({ path: 'qa/phase-5-runtime-final-webgl/test-headless-new.png' });
console.log(`Screenshot took: ${Date.now() - t0}ms`);

await browser.close();
console.log('✓ headless:new works for screenshots');
