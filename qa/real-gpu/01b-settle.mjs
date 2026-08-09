import { launch, URL } from './lib.mjs';
const b = await launch();
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));
const el = await p.evaluateHandle(() => [...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await el.asElement().hover();
for (const ms of [1400, 1600, 2200, 3000]) {
  await new Promise(r => setTimeout(r, ms === 1400 ? 1400 : 200));
  const v = await p.evaluate(() => {
    const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
    const st = getComputedStyle(a.querySelector('span')).transform;
    return st;
  });
  console.log(`hovered ${ms}ms → stack transform: ${v}`);
}
// leave hover, confirm it returns cleanly with no jump
await p.mouse.move(10, 10);
await new Promise(r => setTimeout(r, 900));
const after = await p.evaluate(() => {
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
  const layers=a.querySelectorAll('span > span');
  return { stack:getComputedStyle(a.querySelector('span')).transform,
           fillOp:getComputedStyle(layers[1]).opacity,
           stroke:getComputedStyle(layers[0].querySelector('path')).strokeWidth };
});
console.log('after un-hover →', JSON.stringify(after));
await b.close();
