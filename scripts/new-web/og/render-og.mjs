/**
 * Render the Open Graph share images (1200×630 PNG) for the static homepage.
 *
 * The pink "S" is the site's own WebGL model (public/jelly-logo.js) in its finished,
 * resting pose — the same frame the hero shows to visitors with prefers-reduced-motion.
 * The script serves a private harness page, drives headless Chrome over the DevTools
 * protocol, and screenshots it. Nothing here is loaded by the website.
 *
 * Usage:  node scripts/new-web/og/render-og.mjs   (or: pnpm build:og)
 * Needs:  Node ≥ 22 (native WebSocket) and Google Chrome (override with CHROME=/path).
 * Output: public/assets/og-cs-v1.png, public/assets/og-en-v1.png
 *
 * Bump VERSION when the artwork changes: share caches key on the file name.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');
const PUBLIC = join(ROOT, 'public');
const VERSION = 'v1';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = process.env.OG_OUT_DIR || join(PUBLIC, 'assets'); // override only for previews/experiments

const IMAGES = [
  { lang: 'cs', file: `og-cs-${VERSION}.png`, lines: ['OD NÁPADU', 'K PRODUKTU.'] },
  { lang: 'en', file: `og-en-${VERSION}.png`, lines: ['FROM IDEA', 'TO PRODUCT.'] },
];

// Layout (px on the 1200×630 canvas). Same composition for both languages.
const LAYOUT = { margin: 80, headlineTop: 150, headlineSize: 120, logoWidth: 400, logoHeight: 536, logoRight: 96, siteSize: 32, siteBottom: 72 };

/* Offline-quality variant of the live shader: identical shape, pose, lighting and colours,
   but a smooth (C1) reconstruction of the distance texture, a finer ray march, wider normal
   sampling and a fixed 4× internal resolution so the still has no streaks or jagged edges. */
function offlineShader(source) {
  const patch = (text, from, to) => {
    if (text.split(from).length !== 2) throw new Error(`render-og: expected exactly one occurrence of ${from}`);
    return text.replace(from, to);
  };
  let s = source;
  s = patch(s, ' float mark(vec3 p){',
    ' float decodeD(vec2 uv){vec4 s=texture2D(uShape,uv);return (s.r*65280.+s.g*255.)/65535.;}\n' +
    ' float sdf(vec2 uv){vec2 tex=vec2(768.);vec2 f=uv*tex-.5;vec2 i=floor(f);vec2 w=fract(f);w=w*w*(3.-2.*w);vec2 o=(i+.5)/tex;vec2 px=1./tex;' +
    'float a=decodeD(o),b=decodeD(o+vec2(px.x,0.)),c=decodeD(o+vec2(0.,px.y)),d=decodeD(o+px);return mix(mix(a,b,w.x),mix(c,d,w.x),w.y);}\n' +
    ' float mark(vec3 p){');
  s = patch(s, '  vec2 uv=vec2(p.x,-p.y)/3.+.5;\n  vec4 sampleD=texture2D(uShape,clamp(uv,0.,1.));\n  float d=(sampleD.r*65280.+sampleD.g*255.)/65535.;',
    '  vec2 uv=clamp(vec2(p.x,-p.y)/3.+.5,0.,1.);\n  float d=sdf(uv);');
  s = patch(s, 'for(int i=0;i<64;i++){float dist=scene(ro+rd*travel);if(dist<.0025){hit=true;break;}travel+=max(dist*.78,.002);if(travel>5.5)break;}',
    'for(int i=0;i<220;i++){float dist=scene(ro+rd*travel);if(dist<.0006){hit=true;break;}travel+=max(dist*.6,.0008);if(travel>5.5)break;}');
  // Sample normals over a wider footprint: the live 0.012 shows fine radial streaks from texel noise once the still is this large.
  s = patch(s, 'vec3 p=ro+rd*travel;float e=.012;', 'vec3 p=ro+rd*travel;float e=.03;');
  s = patch(s, 'gl.TEXTURE_MIN_FILTER,gl.LINEAR', 'gl.TEXTURE_MIN_FILTER,gl.NEAREST');
  s = patch(s, 'gl.TEXTURE_MAG_FILTER,gl.LINEAR', 'gl.TEXTURE_MAG_FILTER,gl.NEAREST');
  s = patch(s, "const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt((api.mode==='intro'?600000:450000)/(w*h)));", 'const ratio=4;');
  return s;
}

function harness({ lang, lines }) {
  const L = LAYOUT;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>OG ${lang}</title>
<link rel="stylesheet" href="/fonts.css">
<style>
html,body{margin:0;background:#082E26}
body{width:1200px;height:630px;overflow:hidden;position:relative;color:#f4f0ea;-webkit-font-smoothing:antialiased}
.headline{position:absolute;left:${L.margin}px;top:${L.headlineTop}px;margin:0;font:400 ${L.headlineSize}px/0.96 Anton,Impact,sans-serif;text-transform:uppercase;color:#f4f0ea}
.site{position:absolute;left:${L.margin}px;bottom:${L.siteBottom}px;margin:0;font:600 ${L.siteSize}px/1 Geist,Arial,sans-serif;letter-spacing:-.4px;color:#f4f0ea}
.hero{position:absolute;inset:0}
.hero-art{position:absolute;right:${L.logoRight}px;top:50%;transform:translateY(-50%);width:${L.logoWidth}px;height:${L.logoHeight}px}
.hero-logo{position:relative;width:100%;height:100%}
.jelly-volume{position:absolute;inset:-30%;width:160%;height:160%;display:block}
.opening,.opening-logo{position:absolute;left:-9999px;width:230px;height:308px}
</style></head><body>
<div class="opening"><div class="opening-logo"></div></div>
<section class="hero"><div class="hero-art"><div class="hero-logo"></div></div></section>
<h1 class="headline">${lines[0]}<br>${lines[1]}</h1>
<p class="site">stefanko.tech</p>
<script src="/jelly-shape.js"></script><script src="/jelly-logo.js"></script>
</body></html>`;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const work = mkdtempSync(join(tmpdir(), 'stefanko-og-'));
writeFileSync(join(work, 'jelly-logo.js'), offlineShader(readFileSync(join(PUBLIC, 'jelly-logo.js'), 'utf8')));
for (const image of IMAGES) writeFileSync(join(work, `${image.lang}.html`), harness(image));
const server = createServer((req, res) => {
  const path = req.url.split('?')[0];
  const file = path === '/jelly-logo.js' ? join(work, 'jelly-logo.js')
    : path.endsWith('.html') ? join(work, path)
    : join(PUBLIC, path); // /fonts.css, /jelly-shape.js, /assets/*
  let body;
  try { body = readFileSync(file); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const profile = join(work, 'chrome-profile');
const chrome = spawn(CHROME, ['--headless=new', `--user-data-dir=${profile}`, '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--remote-debugging-port=0', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const devtools = await new Promise((res, rej) => {
  let err = '';
  chrome.stderr.on('data', d => { err += d; const m = err.match(/DevTools listening on (ws:\S+)/); if (m) res(m[1]); });
  chrome.on('exit', () => rej(new Error('render-og: Chrome exited before DevTools was ready\n' + err)));
});
const browserPort = new URL(devtools).port;

async function render(image) {
  const target = await (await fetch(`http://127.0.0.1:${browserPort}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await send('Page.enable');
  await send('Page.bringToFront');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/${image.lang}.html` });
  for (let i = 0; i < 150; i++) {
    if (await evaluate("document.body.classList.contains('volume-ready') && document.fonts.status === 'loaded'")) break;
    await sleep(100);
  }
  await evaluate('dispatchEvent(new Event("resize"))'); // reduced motion draws one frame; make sure it is at final size
  await sleep(1500);
  const state = await evaluate(`(() => { const c = document.querySelector('canvas'); return { ready: document.body.classList.contains('volume-ready'), canvas: c && [c.width, c.height], fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).sort() } })()`);
  if (!state?.ready || !state.canvas || state.canvas[0] < 1000) throw new Error(`render-og ${image.lang}: WebGL model did not render (${JSON.stringify(state)})`);
  if (!state.fonts.includes('Anton') || !state.fonts.includes('Geist')) throw new Error(`render-og ${image.lang}: fonts missing (${state.fonts})`);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  writeFileSync(join(OUT_DIR, image.file), Buffer.from(shot.result.data, 'base64'));
  ws.close();
  console.log(`${OUT_DIR}/${image.file}  (canvas ${state.canvas.join('×')}, fonts ${state.fonts.join('+')})`);
}

try {
  for (const image of IMAGES) await render(image);
} finally {
  chrome.kill();
  server.close();
  rmSync(work, { recursive: true, force: true });
}
