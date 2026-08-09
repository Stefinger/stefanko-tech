import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p = await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await new Promise(r=>setTimeout(r,2200));
const b64 = await p.screenshot({encoding:'base64', clip:{x:1020,y:380,width:180,height:180}});
const res = await p.evaluate(async (data) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + data;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const buckets = new Map();
  let sum = [0,0,0], n = 0, brightest = [0,0,0];
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], bl = d[i+2];
    // ignore dark-green background
    if (r < 60) continue;
    sum[0]+=r; sum[1]+=g; sum[2]+=bl; n++;
    if (r+g+bl > brightest[0]+brightest[1]+brightest[2]) brightest = [r,g,bl];
    const key = `${r>>4},${g>>4},${bl>>4}`;
    buckets.set(key, (buckets.get(key)||0)+1);
  }
  const top = [...buckets.entries()].sort((a,b2)=>b2[1]-a[1])[0];
  return { n, avg: n ? sum.map(v=>Math.round(v/n)) : null, brightest, topBucket: top };
}, b64);
console.log('brand pink target: [255,111,174]');
console.log(JSON.stringify(res));
await b.close();
