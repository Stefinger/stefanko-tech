import { launch, URL } from './lib.mjs';
const b=await launch(); const p=await b.newPage();
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto(URL,{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2000));
console.log('WebGL canvas mounted:', await p.evaluate(()=>!!document.querySelector('canvas')), '(expected false)');

// CTA
const cta=await p.evaluateHandle(()=>[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work')));
const beforeC=await p.evaluate(()=>{
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
  const L=a.querySelectorAll('span > span');
  return {stackAnim:getComputedStyle(a.querySelector('span')).animationName,
          fillTrans:getComputedStyle(L[1]).transitionDuration,
          strokeTrans:getComputedStyle(L[0].querySelector('path')).transitionDuration};
});
await cta.asElement().hover(); await new Promise(r=>setTimeout(r,700));
const afterC=await p.evaluate(()=>{
  const a=[...document.querySelectorAll('main a')].find(e=>e.textContent.includes('Explore selected work'));
  const L=a.querySelectorAll('span > span');
  return {stackAnim:getComputedStyle(a.querySelector('span')).animationName,
          stackTransform:getComputedStyle(a.querySelector('span')).transform,
          fillOpacity:getComputedStyle(L[1]).opacity};
});
console.log('CTA rest  :', JSON.stringify(beforeC));
console.log('CTA hover :', JSON.stringify(afterC));
console.log('  breath animation suppressed:', afterC.stackAnim==='none' && afterC.stackTransform==='none' ? 'YES' : 'NO');
console.log('  fill still conveys state (instant, no transition):', afterC.fillOpacity==='1' ? 'YES' : 'NO');

// Proof cards
await p.mouse.move(5,5);
const y=await p.evaluate(()=>{const e=document.querySelector('#proof');const r=e.getBoundingClientRect();return r.top+window.scrollY+430;});
await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,1500));
const card=await p.$('#build-in-public');
const beforeK=await p.evaluate(()=>getComputedStyle(document.querySelector('#build-in-public')).transitionDuration);
await card.hover(); await new Promise(r=>setTimeout(r,700));
const afterK=await p.evaluate(()=>{
  const c=document.querySelector('#build-in-public');
  return {transform:getComputedStyle(c).transform,
          first:getComputedStyle(c.firstElementChild).transform,
          shadow:getComputedStyle(c).boxShadow.slice(0,60)};
});
console.log('Card transition-duration at rest:', beforeK);
console.log('Card hover :', JSON.stringify(afterK));
console.log('  lift + parallax suppressed:', afterK.transform==='none' && afterK.first==='none' ? 'YES' : 'NO');
console.log('  shadow/ring still responds (non-motion cue):', afterK.shadow.includes('rgba(8, 46, 38, 0.24)') ? 'YES' : 'no');
await b.close();
