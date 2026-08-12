/**
 * Mobile Blob S: presence per section, and stability across the menu cycle.
 *   node qa/ios-blob-mobile.mjs [url]
 */
import puppeteer from 'puppeteer';
const URL = process.argv[2] || 'http://localhost:3300/';
const SECTIONS = ['hero','uncertainty','clarity','decisions','build','proof','final'];
const EXPECT = { hero:true, uncertainty:false, clarity:false, decisions:false, build:false, proof:false, final:true };
// clarity is expected true; set explicitly for readability
EXPECT.clarity = true;

const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--enable-unsafe-swiftshader'] });
const p = await b.newPage();
await p.setViewport({ width:390, height:844, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2200));

console.log('── canvas inventory (mobile) ──');
const inv = await p.evaluate(SEC => {
  const all=[...document.querySelectorAll('canvas')];
  const fixed=all.filter(c=>{ let n=c.parentElement; while(n){ if(getComputedStyle(n).position==='fixed') return true; n=n.parentElement; } return false; });
  const per={};
  for (const s of SEC) {
    const el=document.querySelector(`[data-scene-section="${s}"]`);
    per[s]= el ? el.querySelectorAll('canvas').length : -1;
  }
  return { total: all.length, globalFixed: fixed.length, per };
}, SECTIONS);
console.log(`  total canvases: ${inv.total}   global fixed journey canvas: ${inv.globalFixed} ${inv.globalFixed===0?'✓ (journey not mounted on mobile)':'✗'}`);
let ok=true;
for (const s of SECTIONS) {
  const has = inv.per[s] > 0;
  const good = has === EXPECT[s];
  if(!good) ok=false;
  console.log(`  ${s.padEnd(12)} canvas: ${String(has).padEnd(5)} expected: ${String(EXPECT[s]).padEnd(5)} ${good?'✓':'✗'}`);
}
console.log(`  → mobile Blob S only in Hero / Clarity / Final CTA: ${ok?'YES ✓':'NO ✗'}`);

console.log('\n── menu open/close must not move the Blob S or the page ──');
const clarityY = await p.evaluate(()=>{ const e=document.querySelector('[data-scene-section="clarity"]'); const r=e.getBoundingClientRect(); return r.top+window.scrollY+r.height/2-window.innerHeight/2; });
await p.evaluate(y=>window.scrollTo(0,y), clarityY);
await new Promise(r=>setTimeout(r,900));
const snap = () => p.evaluate(()=>{
  const c=document.querySelector('[data-scene-section="clarity"] canvas');
  const r=c?c.getBoundingClientRect():null;
  return { scrollY:Math.round(window.scrollY), blob: r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null };
});
const before = await snap();
await p.click('header button'); await new Promise(r=>setTimeout(r,900));
const during = await snap();
await p.click('header button'); await new Promise(r=>setTimeout(r,1200));
const after = await snap();
console.log(`  before  scrollY=${before.scrollY}  blob=${JSON.stringify(before.blob)}`);
console.log(`  after   scrollY=${after.scrollY}  blob=${JSON.stringify(after.blob)}`);
const samePos = JSON.stringify(before.blob)===JSON.stringify(after.blob);
const sameScroll = Math.abs(before.scrollY-after.scrollY)<=1;
console.log(`  scroll restored exactly: ${sameScroll?'YES ✓':'NO ✗'}   blob unmoved: ${samePos?'YES ✓':'NO ✗'}`);
void during;

console.log('\n── blob never overlaps body copy in its sections ──');
const overlap = await p.evaluate(()=>{
  const out=[];
  for (const s of ['hero','clarity','final']) {
    const sec=document.querySelector(`[data-scene-section="${s}"]`);
    const c=sec.querySelector('canvas'); if(!c) continue;
    const cr=c.getBoundingClientRect();
    for (const t of sec.querySelectorAll('p,h1,h2,h3')) {
      const tr=t.getBoundingClientRect();
      if(tr.width===0||tr.height===0) continue;
      const ix=Math.max(0,Math.min(cr.right,tr.right)-Math.max(cr.left,tr.left));
      const iy=Math.max(0,Math.min(cr.bottom,tr.bottom)-Math.max(cr.top,tr.top));
      if(ix>4&&iy>4) out.push(s+': "'+t.textContent.trim().slice(0,28)+'"');
    }
  }
  return out;
});
console.log(`  overlaps: ${overlap.length? JSON.stringify(overlap.slice(0,4)) : 'none ✓'}`);

const ov = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
console.log(`\n  horizontal overflow: ${ov}  |  console errors: ${errs.length?JSON.stringify(errs.slice(0,3)):'none ✓'}`);
await b.close();
