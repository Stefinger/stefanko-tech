import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2200));
const box = await p.evaluate(()=>{const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation'));const r=a.getBoundingClientRect();return {cx:r.left+r.width/2, cy:r.top+r.height/2, x:r.left-20, y:r.top-20, w:r.width+40, h:r.height+40};});
await p.mouse.move(box.cx, box.cy);          // real pointer move, not element.hover()
await new Promise(r=>setTimeout(r,1700));
const state = await p.evaluate(()=>{
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation'));
  return {label:getComputedStyle(a.querySelector('.blob-cta-label')).color,
          fillOp:getComputedStyle(a.querySelectorAll('span > span')[1]).opacity};
});
console.log('hover state:', JSON.stringify(state), state.label==='rgb(8, 46, 38)' ? '(hovered ✓)' : '(NOT hovered)');
await p.screenshot({path:`${OUT}/hero-cta-pink.png`, clip:{x:box.x,y:box.y,width:box.w,height:box.h}});
await b.close();
