import puppeteer from 'puppeteer';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for (const vp of [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844}]) {
  const p=await b.newPage();
  await p.setViewport({width:vp.w,height:vp.h,deviceScaleFactor:1});
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1400));
  const m = await p.evaluate(() => {
    const note=document.querySelector('[data-c-note]');
    note.scrollIntoView({block:'center'});
    const box=note.getBoundingClientRect();
    const content=note.querySelector('.note-content');
    const kids=[...content.children];
    const first=kids[0].getBoundingClientRect();
    const last=kids[kids.length-1].getBoundingClientRect();
    const inkTop=first.top, inkBottom=last.bottom;
    return {
      boxH: +box.height.toFixed(1),
      boxCenter: +((box.top+box.bottom)/2 - box.top).toFixed(1),
      inkCenter: +(((inkTop+inkBottom)/2) - box.top).toFixed(1),
      offset: +((((inkTop+inkBottom)/2) - box.top) - box.height/2).toFixed(1),
    };
  });
  console.log(vp.n, JSON.stringify(m));
  await p.close();
}
await b.close();
