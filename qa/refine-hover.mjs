import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1600));
const clip={x:40,y:680,width:600,height:120};
await p.screenshot({path:`${OUT}/cta-rest.png`,clip});
const sec=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await sec.asElement().hover();
for (const [ms,name] of [[110,'t1'],[230,'t2'],[420,'t3'],[900,'t4-settled']]) {
  await new Promise(r=>setTimeout(r, name==='t1'?ms:0));
  if(name!=='t1') await new Promise(r=>setTimeout(r,0));
  await p.screenshot({path:`${OUT}/pour-${name}.png`,clip});
  if(name!=='t4-settled') await new Promise(r=>setTimeout(r, 120));
}
// navbar over cream (pink layer must be gone)
await p.setViewport({width:760,height:220,deviceScaleFactor:2});
await new Promise(r=>setTimeout(r,500));
await p.evaluate(()=>window.scrollTo(0, 1500));
await new Promise(r=>setTimeout(r,800));
await p.screenshot({path:`${OUT}/nav-over-cream.png`});
await b.close(); console.log('done');
