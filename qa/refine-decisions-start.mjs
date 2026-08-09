import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1500));
// creep up on the Decisions stage so the scrub is only just beginning
const top = await p.evaluate(()=>{const e=document.querySelector('[data-d-journey-desktop]');const r=e.getBoundingClientRect();return r.top+window.scrollY;});
for (const [name, off] of [['a-before',-950],['b-just-entering',-820],['c-early',-700]]) {
  await p.evaluate(y=>window.scrollTo(0,y), Math.max(0, top+off));
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:`${OUT}/${name}.png`});
}
// report stroke state of the arrow at the earliest point
const st = await p.evaluate(()=>{
  const a=document.querySelector('[data-d-wave-arrow]');
  const cs=getComputedStyle(a);
  return {dasharray:cs.strokeDasharray, dashoffset:cs.strokeDashoffset, len:a.getTotalLength().toFixed(1)};
});
console.log('arrow:',JSON.stringify(st));
await b.close(); console.log('done');
