import puppeteer from 'puppeteer';
export const URL = 'http://localhost:3100/';
export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function launch() {
  return puppeteer.launch({
    headless: false,                 // real GPU compositing
    executablePath: CHROME,
    userDataDir: '/tmp/claude-qa-chrome-profile',
    defaultViewport: null,
    protocolTimeout: 180000,
    args: ['--no-first-run', '--no-default-browser-check', '--window-position=0,0'],
  });
}

export async function gpuInfo(page) {
  return page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return { renderer: 'no-webgl' };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    };
  });
}
