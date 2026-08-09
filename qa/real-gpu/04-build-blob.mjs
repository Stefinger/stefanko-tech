import fs from 'node:fs';
import { launch, URL } from './lib.mjs';
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
const b=await launch(); const p=await b.newPage();
for (const w of [1280,1440,1728,1920]) {
  await p.setViewport({width:w,height:900,deviceScaleFactor:1});
  await p.goto(URL,{waitUntil:'load',timeout:60000});
  await new Promise(r=>setTimeout(r,1800));
  // park the Build section so its top sits ~30% down the viewport (natural entry)
  const y = await p.evaluate(()=>{const e=document.querySelector('[data-scene-section="build"]');const r=e.getBoundingClientRect();return r.top+window.scrollY-270;});
  await p.evaluate(v=>window.scrollTo(0,v), y);
  await new Promise(r=>setTimeout(r,1400));
  const m = await p.evaluate((vw)=>{
    const sec=document.querySelector('[data-scene-section="build"]');
    const slot=sec.querySelector('[aria-hidden="true"] div div');   // BlobSlotWrap
    const slabs=[...sec.querySelectorAll('[data-b-slab]')];
    const sr=slot.getBoundingClientRect();
    const deckRight=Math.max(...slabs.map(s=>s.getBoundingClientRect().right));
    const headRight=sec.querySelector('[data-b-headline]').getBoundingClientRect().right;
    const visW=Math.max(0, Math.min(sr.right, vw) - Math.max(sr.left, 0));
    return {
      slotLeft:Math.round(sr.left), slotRight:Math.round(sr.right), slotW:Math.round(sr.width),
      visibleW:Math.round(visW), visiblePct:Math.round(visW/sr.width*100),
      deckRight:Math.round(deckRight), headlineRight:Math.round(headRight),
      clearsDeck: sr.left >= deckRight - 1, clearsHeadline: sr.left > headRight,
      slotTop:Math.round(sr.top+window.scrollY), slotBottom:Math.round(sr.bottom+window.scrollY),
      secTop:Math.round(sec.getBoundingClientRect().top+window.scrollY),
      secBottom:Math.round(sec.getBoundingClientRect().bottom+window.scrollY),
    };
  }, w);
  const inside = m.slotTop >= m.secTop && m.slotBottom <= m.secBottom;
  console.log(`${w}px  blob ${m.slotW}px wide, ${m.visibleW}px on screen (${m.visiblePct}%)  | deck ends ${m.deckRight}, blob starts ${m.slotLeft} → clears deck: ${m.clearsDeck}  clears headline: ${m.clearsHeadline}  | vertically inside section: ${inside}`);
  await p.screenshot({path:`${OUT}/build-${w}.png`});
}
await b.close();
