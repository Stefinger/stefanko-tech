import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch();

// ---- desktop: nav CTA pink state + hero CTA pink state (short viewport, no clip) ----
{
  const p=await b.newPage();
  await p.setViewport({width:700,height:150,deviceScaleFactor:2});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1800));
  await p.close();
}
{
  const p=await b.newPage();
  await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  const nav=await p.evaluateHandle(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')));
  await nav.asElement().hover(); await new Promise(r=>setTimeout(r,1700));
  await p.screenshot({path:`${OUT}/nav-cta-pink.png`, clip:{x:1180,y:0,width:260,height:110}});
  await p.mouse.move(5,5); await new Promise(r=>setTimeout(r,1500));
  const hero=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')));
  await hero.asElement().hover(); await new Promise(r=>setTimeout(r,1700));
  await p.screenshot({path:`${OUT}/hero-cta-pink.png`, clip:{x:40,y:660,width:420,height:160}});
  // build section
  await p.mouse.move(5,5);
  const y=await p.evaluate(()=>{const e=document.querySelector('[data-scene-section="build"]');return e.getBoundingClientRect().top+window.scrollY-250;});
  await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,1600));
  await p.screenshot({path:`${OUT}/build-1440.png`});
  await p.close();
}
{
  const p=await b.newPage();
  await p.setViewport({width:1280,height:800,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  const y=await p.evaluate(()=>{const e=document.querySelector('[data-scene-section="build"]');return e.getBoundingClientRect().top+window.scrollY-220;});
  await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,1600));
  await p.screenshot({path:`${OUT}/build-1280.png`});
  await p.close();
}
// ---- mobile: expanded menu, link fill mid-travel ----
{
  const p=await b.newPage();
  await p.setViewport({width:390,height:844,deviceScaleFactor:2});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  await p.click('header button');
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:`${OUT}/menu-rest.png`});
  // drive the reveal deterministically (touch viewport has no hover)
  await p.evaluate(()=>{
    const link=[...document.querySelectorAll('[role="dialog"] a')][1];
    link.querySelector('span > span').style.clipPath='inset(0 46% 0 0)';
  });
  await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:`${OUT}/menu-fill-46pct.png`});
  await p.evaluate(()=>{
    const link=[...document.querySelectorAll('[role="dialog"] a')][1];
    link.querySelector('span > span').style.clipPath='inset(0 0 0 0)';
  });
  await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:`${OUT}/menu-fill-100pct.png`});
  await p.close();
}
await b.close(); console.log('done');
