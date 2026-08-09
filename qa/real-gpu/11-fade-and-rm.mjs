import { launch, URL } from './lib.mjs';
const b=await launch();

// ── mobile: is the exit/entry a fade, or a pop? sample rendered pink area ──
{
  const p=await b.newPage();
  await p.setViewport({width:390,height:844,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2400));
  // scroll from Hero into Uncertainty in small steps, sampling the blob region
  const uTop=await p.evaluate(()=>{const e=document.querySelector('[data-scene-section="uncertainty"]');return e.getBoundingClientRect().top+window.scrollY;});
  console.log('── mobile Hero → Uncertainty handover (blob region alpha) ──');
  const samples=[];
  for(let d=-500; d<=700; d+=100){
    await p.evaluate(v=>window.scrollTo(0,Math.max(0,v)), uTop+d);
    await new Promise(r=>setTimeout(r,260));
    const n=await p.evaluate(()=>{
      const c=document.querySelector('canvas'); if(!c) return -1;
      return 1; // canvas present
    });
    samples.push([d,n]);
  }
  console.log('  canvas stays mounted throughout:', samples.every(s=>s[1]===1) ? 'YES (no unmount pop)' : 'NO');
  // measure the opacity ramp directly off the material via a rendered-frame proxy:
  // count blob-coloured pixels in the right half where no pink section art exists
  const probe = async () => {
    const b64=await p.screenshot({encoding:'base64'});
    return p.evaluate(async d=>{
      const img=new Image(); img.src='data:image/png;base64,'+d; await img.decode();
      const c=document.createElement('canvas'); c.width=img.width;c.height=img.height;
      const x=c.getContext('2d'); x.drawImage(img,0,0);
      const px=x.getImageData(0,0,c.width,c.height).data;
      let n=0;
      for(let i=0;i<px.length;i+=4){const r=px[i],g=px[i+1],bl=px[i+2];
        if(r>140&&r<225&&g>55&&g<115&&bl>95&&bl<165) n++;}   // the shaded 3D blob range
      return n;
    }, b64);
  };
  console.log('  shaded-blob pixels while crossing into Uncertainty:');
  for(const d of [-600,-350,-150,0,150,400]){
    await p.evaluate(v=>window.scrollTo(0,Math.max(0,v)), uTop+d);
    await new Promise(r=>setTimeout(r,650));
    console.log(`    offset ${String(d).padStart(5)} → ${String(await probe()).padStart(6)} px`);
  }
  await p.close();
}

// ── reduced motion on the new interactions ────────────────────────────────
{
  const p=await b.newPage();
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  console.log('\n── reduced motion ──');
  console.log('  WebGL canvas mounted:', await p.evaluate(()=>!!document.querySelector('canvas')), '(expected false)');
  // proof card
  const y=await p.evaluate(()=>{const e=document.querySelector('#proof');return e.getBoundingClientRect().top+window.scrollY+430;});
  await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,1500));
  const bx=await p.evaluate(()=>{const c=document.querySelector('#build-in-public');const r=c.getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2};});
  await p.mouse.move(bx.cx,bx.cy); await new Promise(r=>setTimeout(r,600));
  const card=await p.evaluate(()=>{const c=document.querySelector('#build-in-public');return {t:getComputedStyle(c).transform, s:getComputedStyle(c).boxShadow};});
  console.log('  proof card hover  :', card.t, card.t==='none'?'→ lift suppressed ✓':'→ still lifts');
  console.log('  ring still shows  :', card.s.includes('136, 255, 92')?'YES ✓ (non-motion cue kept)':'no');
  await p.close();
}
{
  const p=await b.newPage();
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setViewport({width:390,height:844,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1800));
  await p.click('header button'); await new Promise(r=>setTimeout(r,600));
  const menu=await p.evaluate(()=>{
    const link=[...document.querySelectorAll('[role="dialog"] a')][1];
    const fill=link.querySelector('span > span');
    return {trans:getComputedStyle(fill).transitionDuration, clip:getComputedStyle(fill).clipPath};
  });
  console.log('  menu link fill    : transition', menu.trans, '| resting clip', menu.clip, menu.trans==='0s'||menu.trans==='1e-05s'?'→ instant, no travel animation ✓':'');
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log('  horizontal overflow:', ov);
  await p.close();
}
await b.close();
