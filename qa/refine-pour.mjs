import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1600));
const clip={x:340,y:685,width:290,height:115};
const sec=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await sec.asElement().hover();
const t0=Date.now();
for (const ms of [60,140,260,420,800]) {
  const wait = ms-(Date.now()-t0);
  if (wait>0) await new Promise(r=>setTimeout(r,wait));
  await p.screenshot({path:`${OUT}/pour-${String(ms).padStart(3,'0')}.png`,clip});
}
await b.close(); console.log('done');
