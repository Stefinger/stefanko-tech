import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1500));
const y = await p.evaluate(()=>{const e=document.querySelector('#proof');const r=e.getBoundingClientRect();return r.top+window.scrollY+520;});
await p.evaluate(v=>window.scrollTo(0,v), y);
await new Promise(r=>setTimeout(r,1200));
await p.screenshot({path:`${OUT}/cards-rest.png`});
const card=await p.$('#build-in-public');
await card.hover();
await new Promise(r=>setTimeout(r,1100));
await p.screenshot({path:`${OUT}/cards-hover.png`});
const m=await p.evaluate(()=>{
  const c=document.querySelector('#build-in-public');
  const cs=getComputedStyle(c);
  return {transform:cs.transform, shadow:cs.boxShadow.slice(0,110),
    first:getComputedStyle(c.firstElementChild).transform,
    last:getComputedStyle(c.lastElementChild).transform};
});
console.log(JSON.stringify(m,null,1));
await b.close(); console.log('done');
