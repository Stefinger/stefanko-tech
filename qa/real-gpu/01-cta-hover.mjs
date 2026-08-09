import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const b = await launch();
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));

// in-page rAF sampler installed BEFORE hovering (no CDP latency skew)
async function sample(page, findFn, label) {
  await page.evaluate((fnSrc) => {
    const find = eval(fnSrc);
    const a = find();
    const stack = a.querySelector('span');
    const layers = a.querySelectorAll('span > span');
    const fill = layers[1];
    const path = layers[0].querySelector('path');
    window.__s = []; window.__h = null;
    a.addEventListener('mouseover', () => { window.__h = performance.now(); }, { once: true });
    const tick = () => {
      if (window.__h !== null && window.__s.length < 130) {
        const st = getComputedStyle(stack).transform;
        const m = st === 'none' ? [1, 0, 0, 1] : st.match(/-?[\d.e-]+/g).map(Number);
        window.__s.push({
          t: Math.round(performance.now() - window.__h),
          sx: +m[0].toFixed(4), sy: +m[3].toFixed(4),
          skew: +Math.abs(m[1]).toFixed(5),
          op: +getComputedStyle(fill).opacity,
          sw: getComputedStyle(path).strokeWidth,
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, findFn);
  const h = await page.evaluateHandle((fnSrc) => eval(fnSrc)(), findFn);
  await h.asElement().hover();
  await new Promise(r => setTimeout(r, 2000));
  const s = await page.evaluate(() => window.__s);
  // frame-rate + monotonicity checks
  const gaps = s.slice(1).map((v, i) => v.t - s[i].t);
  const maxGap = Math.max(...gaps);
  const peakSx = Math.max(...s.map(v => v.sx));
  const minSy  = Math.min(...s.map(v => v.sy));
  const peakSy = Math.max(...s.map(v => v.sy));
  const maxSkew = Math.max(...s.map(v => v.skew));
  const endSx = s[s.length - 1].sx, endSy = s[s.length - 1].sy;
  const opSeq = s.map(v => v.op);
  const opMonotonic = opSeq.every((v, i) => i === 0 || v >= opSeq[i - 1] - 0.0001);
  console.log(`\n── ${label} ──`);
  console.log(`  frames ${s.length}, max frame gap ${maxGap}ms (${maxGap <= 20 ? 'smooth 60fps' : 'DROPPED FRAMES'})`);
  console.log(`  breath  peak scaleX ${peakSx}  min scaleY ${minSy}  later peak scaleY ${peakSy}`);
  console.log(`  anisotropic? ${(peakSx > 1.01 && minSy < 0.995) ? 'YES' : 'NO'}   rotation/skew present? ${maxSkew > 0.0005 ? 'YES' : 'no (' + maxSkew + ')'}`);
  console.log(`  settles to  scaleX ${endSx} scaleY ${endSy} ${(Math.abs(endSx-1)<0.003 && Math.abs(endSy-1)<0.003) ? '— clean rest' : '— DOES NOT SETTLE'}`);
  console.log(`  fill opacity monotonic (no flicker): ${opMonotonic ? 'YES' : 'NO'}   final ${opSeq[opSeq.length-1]}`);
  console.log(`  stroke width final: ${s[s.length-1].sw}`);
  return s;
}

const FIND_OUTLINE = `(() => [...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')))`;
const FIND_FILLED  = `(() => [...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')))`;
const FIND_NAV     = `(() => [...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')))`;

// capture crisp frames mid-transition for the outline CTA
const clip = { x: 340, y: 690, width: 320, height: 130 };
await p.screenshot({ path: `${OUT}/outline-rest.png`, clip });
const el = await p.evaluateHandle(() => [...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await el.asElement().hover();
const t0 = Date.now();
for (const ms of [120, 300, 620, 1500]) {
  const w = ms - (Date.now() - t0); if (w > 0) await new Promise(r => setTimeout(r, w));
  await p.screenshot({ path: `${OUT}/outline-${String(ms).padStart(4,'0')}.png`, clip });
}
await p.mouse.move(10, 10); await new Promise(r => setTimeout(r, 1500));

await sample(p, FIND_OUTLINE, 'OUTLINE  Explore selected work');
await p.mouse.move(10, 10); await new Promise(r => setTimeout(r, 1600));
await p.reload({ waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2000));
await sample(p, FIND_FILLED, 'FILLED   Start a conversation');
await p.mouse.move(10, 10); await new Promise(r => setTimeout(r, 1600));
await p.reload({ waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2000));
await sample(p, FIND_NAV, 'NAVBAR   Start a project');
await b.close();
