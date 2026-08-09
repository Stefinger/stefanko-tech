import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1500));

// hero CTA pair: rest then hover on each
const clip={x:40,y:690,width:560,height:110};
await p.screenshot({path:`${OUT}/hero-cta-rest.png`,clip});
const links = await p.$$('main a');
// hover primary
await p.evaluate(()=>{const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')); a.scrollIntoView({block:'center'});});
await new Promise(r=>setTimeout(r,400));
const primary = await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')));
await primary.asElement().hover();
await new Promise(r=>setTimeout(r,700));
await p.screenshot({path:`${OUT}/hero-cta-hover-primary.png`,clip});
const secondary = await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await secondary.asElement().hover();
await new Promise(r=>setTimeout(r,700));
await p.screenshot({path:`${OUT}/hero-cta-hover-secondary.png`,clip});
// mid-flood
await p.evaluate(()=>{const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Start a conversation')); a.dispatchEvent(new MouseEvent('mouseout',{bubbles:true}));});
void links;
// navbar CTA hover
const navCta = await p.evaluateHandle(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')));
await navCta.asElement().hover();
await new Promise(r=>setTimeout(r,700));
await p.screenshot({path:`${OUT}/nav-cta-hover.png`,clip:{x:1180,y:0,width:260,height:110}});
// mobile menu open state
await p.setViewport({width:390,height:844,deviceScaleFactor:2});
await new Promise(r=>setTimeout(r,600));
await p.evaluate(()=>window.scrollTo(0,0));
await new Promise(r=>setTimeout(r,400));
await p.click('header button');
await new Promise(r=>setTimeout(r,800));
await p.screenshot({path:`${OUT}/mobile-menu-open.png`});
await b.close();
console.log('done');
