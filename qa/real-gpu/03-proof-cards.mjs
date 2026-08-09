import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2000));

// scroll so the proof grid is in view and let the GSAP entrance run to completion
const y = await p.evaluate(()=>{const e=document.querySelector('#proof');const r=e.getBoundingClientRect();return r.top+window.scrollY+430;});
await p.evaluate(v=>window.scrollTo(0,v), y);
await new Promise(r=>setTimeout(r,2600));   // well past the 0.6s entrance + 0.14 stagger

const before = await p.evaluate(()=>{
  const cards=[...document.querySelectorAll('[data-p-card]')];
  return cards.map((c,i)=>({
    i, inlineTransform: c.style.transform || '(none — cleared)',
    computed: getComputedStyle(c).transform, opacity: getComputedStyle(c).opacity,
  }));
});
console.log('after entrance completes:');
before.forEach(c=>console.log(`  card ${c.i}: inline="${c.inlineTransform}"  computed=${c.computed}  opacity=${c.opacity}`));

// first-hover snap test: sample every frame from the instant of hover
await p.evaluate(()=>{
  const c=document.querySelector('#build-in-public');
  window.__c=[]; window.__h=null;
  c.addEventListener('mouseover',()=>{window.__h=performance.now();},{once:true});
  const tick=()=>{ if(window.__h!==null && window.__c.length<120){
    const m=getComputedStyle(c).transform;
    const ty = m==='none'?0:+m.match(/-?[\d.e-]+/g)[5];
    const f=getComputedStyle(c.firstElementChild).transform;
    const l=getComputedStyle(c.lastElementChild).transform;
    window.__c.push([Math.round(performance.now()-window.__h), +ty.toFixed(2),
      f==='none'?0:+(+f.match(/-?[\d.e-]+/g)[5]).toFixed(2),
      l==='none'?0:+(+l.match(/-?[\d.e-]+/g)[5]).toFixed(2)]);
  } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const card=await p.$('#build-in-public');
const box=await card.boundingBox();
await p.screenshot({path:`${OUT}/card-rest.png`, clip:{x:box.x-14,y:box.y-14,width:box.width+28,height:box.height+28}});
await card.hover();
await new Promise(r=>setTimeout(r,1400));
const c=await p.evaluate(()=>window.__c);
const firstFrames=c.slice(0,4);
const maxJump=Math.max(...c.slice(1).map((v,i)=>Math.abs(v[1]-c[i][1])));
console.log('\nfirst-hover frames [t, cardY, firstChildY, lastChildY]:');
firstFrames.forEach(f=>console.log('  ',JSON.stringify(f)));
console.log(`  largest single-frame jump in cardY: ${maxJump.toFixed(2)}px ${maxJump<3?'(smooth, no snap)':'(SNAP)'}`);
console.log(`  settled: ${JSON.stringify(c[c.length-1])}`);
await p.screenshot({path:`${OUT}/card-hover.png`, clip:{x:box.x-14,y:box.y-14,width:box.width+28,height:box.height+28}});
// layout shift check: neighbours must not move
const shift = await p.evaluate(()=>{
  const cards=[...document.querySelectorAll('[data-p-card]')];
  return cards.map(c=>Math.round(c.getBoundingClientRect().left));
});
console.log('  card left edges while hovering:', JSON.stringify(shift), '(unchanged = no layout shift)');
await b.close();
