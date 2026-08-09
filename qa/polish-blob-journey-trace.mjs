import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for (const vp of [{n:'1440x900',w:1440,h:900},{n:'390x844',w:390,h:844}]) {
  const p = await b.newPage();
  await p.setViewport({width:vp.w,height:vp.h,deviceScaleFactor:1});
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  const H = await p.evaluate(()=>document.body.scrollHeight);
  const seen = [];
  for (let y = 0; y <= H - vp.h; y += Math.round(vp.h/3)) {
    await p.evaluate(v=>window.scrollTo(0,v), y);
    await new Promise(r=>setTimeout(r,120));
    const info = await p.evaluate(() => {
      const c = document.querySelector('canvas');
      return { hasCanvas: !!c };
    });
    // read scene indirectly: which section owns the viewport centre
    const scene = await p.evaluate(() => {
      const probe = window.scrollY + window.innerHeight/2;
      const els = [...document.querySelectorAll('[data-scene-section]')];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        if (probe >= top && probe < top + r.height) return el.dataset.sceneSection;
      }
      return els.length ? els[els.length-1].dataset.sceneSection : 'none';
    });
    if (seen[seen.length-1] !== scene) seen.push(scene);
    if (!info.hasCanvas) { seen.push('NO-CANVAS'); break; }
  }
  console.log(vp.n, '->', seen.join(' > '));
  await p.close();
}
await b.close();
