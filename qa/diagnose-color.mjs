/**
 * Diagnose WebGL color output by reading actual canvas pixels.
 * Compares with expected brand pink #FF6FAE.
 */
import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3000';

async function run() {
  // Try with GPU flags for real color management
  const browser = await puppeteer.launch({
    headless: false,   // real browser window for GPU
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=desktop',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000)); // wait for 3D to render

  // Sample canvas pixel at blob position (approximately right-center column)
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'no canvas' };

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Try reading from the R3F context via a 2d read from the element
      return { error: 'no 2d context on canvas' };
    }

    // Read pixel at approximate blob center (hero: roughly x=1050, y=450)
    const pixel = ctx.getImageData(1050, 450, 1, 1).data;
    return {
      r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3],
      hex: `#${[pixel[0], pixel[1], pixel[2]].map(c => c.toString(16).padStart(2, '0')).join('')}`,
    };
  });

  console.log('Canvas pixel at blob center:', result);

  // Also check renderer settings via THREE global if available
  const rendererInfo = await page.evaluate(() => {
    // R3F exposes the renderer on the canvas via __r3f
    const canvas = document.querySelector('canvas');
    if (!canvas || !canvas.__r3f) return { error: 'no __r3f' };
    const gl = canvas.__r3f?.fiber?.gl;
    if (!gl) return { error: 'no gl' };
    return {
      toneMapping: gl.toneMapping,
      outputColorSpace: gl.outputColorSpace,
      capabilities: {
        isWebGL2: gl.capabilities?.isWebGL2,
        precision: gl.capabilities?.precision,
      },
    };
  });

  console.log('Renderer settings:', rendererInfo);

  // Screenshot for comparison
  await page.screenshot({ path: 'qa/phase-5-blob-journey-final/headful-hero-complete.png' });
  console.log('✓ headful-hero-complete.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
