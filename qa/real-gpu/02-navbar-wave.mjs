import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const b = await launch();
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));

const read = () => p.evaluate(() => {
  const layers = [...document.querySelectorAll('header svg')].map(s => s.closest('div'));
  const pink = document.querySelector('header path[fill="#ff6fae"], header path[fill="#FF6FAE"]');
  const pinkLayer = pink ? pink.closest('div') : null;
  return {
    y: Math.round(window.scrollY),
    pinkOpacity: pinkLayer ? +getComputedStyle(pinkLayer).opacity.slice(0,6) : null,
    layerCount: layers.length,
  };
});

console.log('— creeping through the first pixels of scroll —');
for (const y of [0, 1, 3, 8, 16, 23, 24, 25, 26, 30, 60, 200]) {
  await p.evaluate(v => window.scrollTo(0, v), y);
  await new Promise(r => setTimeout(r, 140));
  const s = await read();
  console.log(`  scrollY ${String(s.y).padStart(3)} → pink opacity ${s.pinkOpacity}`);
}
console.log('— settled after the transition completes —');
await new Promise(r => setTimeout(r, 900));
console.log('  ', JSON.stringify(await read()));

// sample continuously while scrolling back to the very top, looking for flicker
console.log('— returning to top, sampling every frame —');
await p.evaluate(() => {
  window.__w = [];
  const pink = document.querySelector('header path[fill="#ff6fae"], header path[fill="#FF6FAE"]').closest('div');
  const tick = () => { if (window.__w.length < 200) window.__w.push([Math.round(window.scrollY), +getComputedStyle(pink).opacity]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
for (let y = 200; y >= 0; y -= 10) { await p.evaluate(v => window.scrollTo(0, v), y); await new Promise(r => setTimeout(r, 22)); }
await new Promise(r => setTimeout(r, 1000));
const w = await p.evaluate(() => window.__w);
const atTop = w.filter(v => v[0] === 0);
const finalOp = atTop.length ? atTop[atTop.length - 1][1] : null;
// flicker = opacity going up then down then up again within the run
let dirChanges = 0;
for (let i = 2; i < w.length; i++) {
  const a = w[i-1][1] - w[i-2][1], c = w[i][1] - w[i-1][1];
  if (Math.abs(a) > 0.002 && Math.abs(c) > 0.002 && Math.sign(a) !== Math.sign(c)) dirChanges++;
}
console.log(`  frames ${w.length}, opacity direction reversals: ${dirChanges} ${dirChanges <= 1 ? '(clean, no flicker)' : '(FLICKER)'}`);
console.log(`  final opacity at scrollY 0: ${finalOp} ${finalOp === 0 ? '— hidden at top ✓' : '— NOT HIDDEN'}`);

// visual: solid pink over cream
await p.evaluate(() => window.scrollTo(0, 1500));
await new Promise(r => setTimeout(r, 1000));
await p.screenshot({ path: `${OUT}/wave-over-cream.png`, clip: { x: 0, y: 0, width: 900, height: 150 } });
await p.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 1000));
await p.screenshot({ path: `${OUT}/wave-at-top.png`, clip: { x: 0, y: 0, width: 900, height: 150 } });
await b.close();
