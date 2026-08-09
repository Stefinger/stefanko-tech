import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:200,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1400));
const navCta=await p.evaluateHandle(()=>[...document.querySelectorAll('header a')].find(e=>e.textContent.includes('Start a project')));
await navCta.asElement().hover(); await new Promise(r=>setTimeout(r,700));
await p.screenshot({path:`${OUT}/nav-cta-hover.png`,clip:{x:840,y:0,width:600,height:120}});
// mid-flood snapshot of the hero secondary
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await new Promise(r=>setTimeout(r,600));
const sec=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await sec.asElement().hover(); await new Promise(r=>setTimeout(r,190));
await p.screenshot({path:`${OUT}/hero-secondary-midflood.png`,clip:{x:300,y:690,width:300,height:110}});
await b.close(); console.log('done');
