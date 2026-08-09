import puppeteer from 'puppeteer';
import fs from 'node:fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p = await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1200));
await p.screenshot({path:`${OUT}/nav-top.png`, clip:{x:1150,y:0,width:290,height:120}});
// hover state on nav link + CTA
await p.hover('a[href="#about"]');
await new Promise(r=>setTimeout(r,500));
await p.screenshot({path:`${OUT}/nav-hover-link.png`, clip:{x:820,y:0,width:620,height:110}});
// scrolled state (pink under-wave over cream)
await p.evaluate(()=>window.scrollTo(0, 1400));
await new Promise(r=>setTimeout(r,900));
await p.setViewport({width:760,height:200,deviceScaleFactor:2});
await new Promise(r=>setTimeout(r,600));
await p.screenshot({path:`${OUT}/nav-scrolled.png`});
await p.close(); await b.close();
console.log('done');
