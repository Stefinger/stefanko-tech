import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for (const vp of [{name:'rm-1440',width:1440,height:900},{name:'rm-390',width:390,height:844}]) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({width:vp.width,height:vp.height,deviceScaleFactor:1});
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  const hasCanvas = await page.evaluate(()=>!!document.querySelector('canvas'));
  for (const s of ['hero','uncertainty','clarity','decisions','build','proof','final']) {
    const y = await page.evaluate(sel=>{const el=document.querySelector(`[data-scene-section="${sel}"]`);if(!el)return null;const r=el.getBoundingClientRect();return r.top+window.scrollY;},s);
    if (y===null) continue;
    await page.evaluate(v=>window.scrollTo(0,v), Math.max(0,y));
    await new Promise(r=>setTimeout(r,350));
    await page.screenshot({path:`${OUT}/${vp.name}--${s}.png`});
  }
  const ov = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(vp.name,'canvas mounted:',hasCanvas,'overflowX:',ov,'errors:',errs.length?errs.slice(0,2):'none');
  await page.close();
}
await browser.close();
