import puppeteer from 'puppeteer';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,1600));
// install an in-page rAF sampler BEFORE hovering, so no CDP latency skews timings
await p.evaluate(() => {
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
  const flood=a.querySelectorAll('span > span')[1];
  const stack=a.querySelector('span');
  window.__s=[]; window.__hoverStart=null;
  a.addEventListener('mouseover',()=>{ window.__hoverStart=performance.now(); },{once:true});
  const tick=()=>{
    if(window.__hoverStart!==null && window.__s.length<70){
      window.__s.push([Math.round(performance.now()-window.__hoverStart),
                       getComputedStyle(flood).clipPath,
                       getComputedStyle(stack).transform]);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const sec=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
await sec.asElement().hover();
await new Promise(r=>setTimeout(r,1600));
const s=await p.evaluate(()=>window.__s);
const pick=[0,2,5,9,14,20,28,38,50];
for(const i of pick){ if(s[i]) console.log(`${String(s[i][0]).padStart(4)}ms  ${s[i][1]}   ${s[i][2]}`); }
console.log('samples:', s.length);
await b.close();
