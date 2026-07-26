import puppeteer from 'puppeteer';
const wait = ms => new Promise(r => setTimeout(r, ms));

const flagSets = [
  { name: 'angle+metal', flags: ['--use-gl=angle', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--no-sandbox', '--disable-setuid-sandbox'] },
  { name: 'angle+default', flags: ['--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--no-sandbox', '--disable-setuid-sandbox'] },
  { name: 'desktop', flags: ['--use-gl=desktop', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox', '--disable-setuid-sandbox'] },
  { name: 'no-extra-gpu', flags: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-gpu-blocklist', '--enable-gpu'] },
];

for (const { name, flags } of flagSets) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [...flags, '--window-size=800,600'],
      defaultViewport: { width: 800, height: 600 },
      timeout: 15000,
    });
    const page = await browser.newPage();
    await page.goto('about:blank');
    await wait(500);
    
    const webgl = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      const gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { supported: false };
      const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        supported: true,
        contextType: gl2 ? 'webgl2' : 'webgl',
        vendor: dbgInfo ? gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: dbgInfo ? gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
      };
    });
    
    console.log(`[${name}] WebGL: ${JSON.stringify(webgl)}`);
    await browser.close();
  } catch (e) {
    console.log(`[${name}] FAILED: ${e.message.slice(0, 100)}`);
  }
  await wait(500);
}
