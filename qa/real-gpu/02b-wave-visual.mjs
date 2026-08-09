import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:1000,height:220,deviceScaleFactor:2});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2000));
await p.evaluate(()=>window.scrollTo(0,1500)); await new Promise(r=>setTimeout(r,1100));
await p.screenshot({path:`${OUT}/wave-over-cream.png`});
// sample the actual rendered pink pixel to prove it is not translucent
const px = await p.evaluate(async () => {
  const el = document.querySelector('header path[fill="#ff6fae"], header path[fill="#FF6FAE"]');
  const layer = el.closest('div');
  return { computedOpacity: getComputedStyle(layer).opacity, fillAttr: el.getAttribute('fill') };
});
console.log('pink layer:', JSON.stringify(px));
await b.close();
