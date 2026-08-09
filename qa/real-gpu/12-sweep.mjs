import { launch, URL, gpuInfo } from './lib.mjs';
const b=await launch();
for (const vp of [{n:'1440',w:1440,h:900},{n:'1280',w:1280,h:800},{n:'390',w:390,h:844}]) {
  const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.setViewport({width:vp.w,height:vp.h,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1800));
  const gpu=await gpuInfo(p);
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<H;y+=Math.round(vp.h/2)){ await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,60)); }
  await p.evaluate(()=>window.scrollTo(0,0)); await new Promise(r=>setTimeout(r,700));
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(`${vp.n}px  overflowX ${ov}  errors ${errs.length?JSON.stringify(errs.slice(0,2)):'none'}  gpu ${/swiftshader/i.test(gpu.renderer)?'SOFTWARE':'hardware'}`);
  await p.close();
}
await b.close();
