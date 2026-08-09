import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
await p.setViewport({width:390,height:844,deviceScaleFactor:1});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2400));

const countPink = async () => {
  const b64 = await p.screenshot({ encoding:'base64' });
  return p.evaluate(async (data) => {
    const img=new Image(); img.src='data:image/png;base64,'+data; await img.decode();
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const x=c.getContext('2d'); x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data;
    let n=0;
    for(let i=0;i<d.length;i+=4){
      const r=d[i],g=d[i+1],bl=d[i+2];
      // brand-pink family: strong red, mid blue, low-ish green
      if(r>150 && g<130 && bl>90 && bl<210 && r-g>60) n++;
    }
    return n;
  }, b64);
};

console.log('pink pixels in view at each section centre (mobile 390):');
for (const scene of ['hero','uncertainty','clarity','decisions','build','proof','final']) {
  await p.evaluate(async (sc)=>{
    const el=document.querySelector(`[data-scene-section="${sc}"]`);
    const r=el.getBoundingClientRect(); const t=r.top+window.scrollY;
    window.scrollTo(0, Math.max(0, t + r.height/2 - window.innerHeight/2));
  }, scene);
  await new Promise(r=>setTimeout(r,1400));   // let the fade settle
  const n = await countPink();
  await p.screenshot({path:`${OUT}/m-${scene}.png`});
  console.log(`  ${scene.padEnd(12)} ${String(n).padStart(6)} px  ${n<1200?'← effectively no blob':''}`);
}
await b.close();
