import puppeteer from 'puppeteer';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(() => {
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
  const stack=a.querySelector('span');
  const layers=a.querySelectorAll('span > span');
  const outline=layers[0], fill=layers[1];
  window.__s=[]; window.__h=null;
  a.addEventListener('mouseover',()=>{window.__h=performance.now();},{once:true});
  const tick=()=>{
    if(window.__h!==null && window.__s.length<80){
      const cs=getComputedStyle(fill);
      window.__s.push([Math.round(performance.now()-window.__h),
        getComputedStyle(stack).transform,
        cs.opacity, cs.transform,
        getComputedStyle(outline.querySelector('path')).strokeWidth,
        getComputedStyle(outline.querySelector('path')).strokeOpacity]);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const el=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await el.asElement().hover();
await new Promise(r=>setTimeout(r,1900));
const s=await p.evaluate(()=>window.__s);
console.log('  t   stack-transform (breath)              fill-op  fill-scale                 stroke-w  stroke-op');
for(const i of [0,3,7,12,18,26,36,48,62]){ if(!s[i]) continue;
  const [t,st,op,ft,sw,so]=s[i];
  console.log(`${String(t).padStart(4)}ms ${st.padEnd(38)} ${op.slice(0,5).padEnd(7)} ${ft.padEnd(26)} ${sw.padEnd(9)} ${so}`);
}
await b.close();
