import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,5000));           // let the hero entrance fully finish
const box=await p.evaluate(()=>{const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation'));const r=a.getBoundingClientRect();
  return {cx:r.left+r.width/2, cy:r.top+r.height/2, x:Math.max(0,r.left-20), y:Math.max(0,r.top-20), w:r.width+40, h:r.height+40};});
await p.mouse.move(box.cx, box.cy);
await new Promise(r=>setTimeout(r,2500));           // well past the 640ms fill / 520ms label
const st=await p.evaluate(()=>{
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation'));
  const L=a.querySelectorAll('span > span');
  return {hoverFill:getComputedStyle(L[1].querySelector('path')).fill,
          fillOpacity:getComputedStyle(L[1]).opacity,
          label:getComputedStyle(a.querySelector('.blob-cta-label')).color,
          stroke:getComputedStyle(L[0].querySelector('path')).stroke};
});
console.log('HERO settled hover state:');
console.log('  hover fill :', st.hoverFill, st.hoverFill==='rgb(255, 111, 174)'?'= #FF6FAE ✓':'✗');
console.log('  fill opacity:', st.fillOpacity, st.fillOpacity==='1'?'✓':'✗');
console.log('  label      :', st.label, st.label==='rgb(8, 46, 38)'?'= dark green ✓':'✗');
console.log('  stroke     :', st.stroke, st.stroke==='none'?'(filled variant has no outline) ✓':'');
await p.screenshot({path:`${OUT}/hero-hover-settled.png`, clip:{x:box.x,y:box.y,width:box.w,height:box.h}});
await b.close();
