import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch();

// ── 1440: hero + navbar CTA hover states ────────────────────────────────
{
  const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2200));

  const probe = async (sel, label) => {
    const box=await p.evaluate(s=>{const a=eval(s)();const r=a.getBoundingClientRect();
      return {cx:r.left+r.width/2, cy:r.top+r.height/2, x:Math.max(0,r.left-20), y:Math.max(0,r.top-20), w:r.width+40, h:r.height+40};}, sel);
    await p.mouse.move(box.cx, box.cy);
    await new Promise(r=>setTimeout(r,1700));
    const st=await p.evaluate(s=>{const a=eval(s)(); const L=a.querySelectorAll('span > span');
      const path=L[0].querySelector('path');
      return {restFill:getComputedStyle(L[0].querySelector('path')).fill,
              hoverFill:getComputedStyle(L[1].querySelector('path')).fill,
              fillOpacity:getComputedStyle(L[1]).opacity,
              strokeOp:getComputedStyle(path).strokeOpacity,
              stroke:getComputedStyle(path).stroke,
              label:getComputedStyle(a.querySelector('.blob-cta-label')).color};}, sel);
    console.log(`\n── ${label} (hovered) ──`);
    console.log(`  rest fill  : ${st.restFill}`);
    console.log(`  hover fill : ${st.hoverFill} @ opacity ${st.fillOpacity}`);
    console.log(`  stroke     : ${st.stroke} @ opacity ${st.strokeOp}`);
    console.log(`  label      : ${st.label}`);
    return {st, box};
  };
  const HERO=`(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')))`;
  const NAV =`(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')))`;

  const hero = await probe(HERO,'HERO   Start a conversation');
  console.log(`  → brand #FF6FAE = rgb(255,111,174): ${hero.st.hoverFill==='rgb(255, 111, 174)' ? 'YES ✓' : 'NO ✗'}   full opacity: ${hero.st.fillOpacity==='1'?'YES ✓':'NO ✗'}   dark-green label: ${hero.st.label==='rgb(8, 46, 38)'?'YES ✓':'NO ✗'}`);
  await p.screenshot({path:`${OUT}/hero-hover-1440.png`, clip:{x:hero.box.x,y:hero.box.y,width:hero.box.w,height:hero.box.h}});
  await p.mouse.move(5,5); await new Promise(r=>setTimeout(r,1500));

  const nav = await probe(NAV,'NAV    Start a project');
  console.log(`  → white border gone: ${Number(nav.st.strokeOp)===0 ? 'YES ✓' : 'NO ✗'}`);
  await p.mouse.move(5,5); await new Promise(r=>setTimeout(r,1400));

  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<H;y+=450){ await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,55)); }
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(`\n1440px  overflowX ${ov}  errors ${errs.length?JSON.stringify(errs.slice(0,2)):'none'}`);
  await p.close();
}

// ── 390: expanded menu CTA ──────────────────────────────────────────────
{
  const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.setViewport({width:390,height:844,deviceScaleFactor:2});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2200));
  await p.click('header button'); await new Promise(r=>setTimeout(r,900));
  const menu=await p.evaluate(()=>{
    const a=[...document.querySelectorAll('[role="dialog"] a')].find(e=>e.textContent.includes('Start a project'));
    const L=a.querySelectorAll('span > span');
    return {rest:getComputedStyle(L[0].querySelector('path')).fill,
            hover:getComputedStyle(L[1].querySelector('path')).fill};
  });
  console.log(`\n── MENU  Start a project (mobile) ──`);
  console.log(`  rest fill  : ${menu.rest}`);
  console.log(`  hover fill : ${menu.hover}  ${menu.hover==='rgb(255, 111, 174)'?'= brand #FF6FAE ✓':'✗'}`);
  await p.screenshot({path:`${OUT}/menu-390.png`});
  await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,600));
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<H;y+=420){ await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,55)); }
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(`\n390px   overflowX ${ov}  errors ${errs.length?JSON.stringify(errs.slice(0,2)):'none'}`);
  await p.close();
}
await b.close();
