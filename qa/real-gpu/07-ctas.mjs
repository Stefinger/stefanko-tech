import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2200));

const probe = async (sel, label) => {
  const h = await p.evaluateHandle(s=>eval(s)(), sel);
  const rest = await p.evaluate(s=>{
    const a=eval(s)(); const L=a.querySelectorAll('span > span');
    const path=L[0].querySelector('path');
    return {fill:getComputedStyle(L[1].querySelector('path')).fill,
            strokeOp:getComputedStyle(path).strokeOpacity,
            strokeW:getComputedStyle(path).strokeWidth,
            label:getComputedStyle(a.querySelector('.blob-cta-label')).color};
  }, sel);
  await h.asElement().hover();
  await new Promise(r=>setTimeout(r,1500));
  const hov = await p.evaluate(s=>{
    const a=eval(s)(); const L=a.querySelectorAll('span > span');
    const path=L[0].querySelector('path');
    return {fillOpacity:getComputedStyle(L[1]).opacity,
            fill:getComputedStyle(L[1].querySelector('path')).fill,
            strokeOp:getComputedStyle(path).strokeOpacity,
            strokeW:getComputedStyle(path).strokeWidth,
            label:getComputedStyle(a.querySelector('.blob-cta-label')).color};
  }, sel);
  console.log(`\n── ${label} ──`);
  console.log(`  rest : stroke-opacity ${rest.strokeOp} @ ${rest.strokeW}, label ${rest.label}`);
  console.log(`  hover: fill ${hov.fill} @ opacity ${hov.fillOpacity}, stroke-opacity ${hov.strokeOp} @ ${hov.strokeW}, label ${hov.label}`);
  return hov;
};

const NAV = `(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')))`;
const HERO= `(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')))`;
const nav = await probe(NAV,'NAVBAR  Start a project');
console.log(`  → white/pale border in pink state? ${Number(nav.strokeOp)===0 ? 'NO ✓' : 'YES ✗ (opacity '+nav.strokeOp+')'}`);
await p.mouse.move(5,5); await new Promise(r=>setTimeout(r,1400));
// crop the nav CTA in its pink state for a visual read
const el=await p.evaluateHandle(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')));
await el.asElement().hover(); await new Promise(r=>setTimeout(r,1500));
await p.mouse.move(5,5); await new Promise(r=>setTimeout(r,1400));

// The palette is closed: #FF6FAE is the only approved pink, so the filled CTA
// must hover to the SAME colour it rests at, at full opacity. Its hover
// response comes from the label contrast flip and the shape, not a second tint.
const BRAND_PINK = 'rgb(255, 111, 174)';   // #FF6FAE

const hero = await probe(HERO,'HERO    Start a conversation');
const pinkOk = hero.fill === BRAND_PINK;
console.log(`  → hover fill is ${hero.fill} (expected ${BRAND_PINK} = #FF6FAE): ${pinkOk ? 'YES ✓' : 'NO ✗'}, fully opaque: ${hero.fillOpacity==='1'?'YES ✓':'NO ✗'}`);
await b.close();
