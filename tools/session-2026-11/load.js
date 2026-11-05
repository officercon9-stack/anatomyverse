const {chromium}=require('playwright');const H=require('./h');
const dir=process.argv[2],route=process.argv[3]||'/app/lab';const port=9500+Math.floor(Math.random()*90);H.serve(dir,port);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true});const pg=await ctx.newPage();
const cdp=await ctx.newCDPSession(pg);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
let bytes=0,reqs=[];pg.on('response',async r=>{try{const l=(await r.body()).length;const u=r.url().replace(/.*:\d+/,'');reqs.push([u,l]);bytes+=l}catch(e){}});
const t0=Date.now();await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});await pg.goto('http://localhost:'+port+'/#'+route,{waitUntil:'load'});
let ready=null;for(let i=0;i<120;i++){const ok=await pg.evaluate(()=>!!(globalThis.__r3s&&globalThis.__r3s.get&&globalThis.__r3s.get().scene&&globalThis.__r3s.get().scene.children.length>3)).catch(()=>false);if(ok){ready=Date.now()-t0;break}await pg.waitForTimeout(1000)}
const m=await cdp.send('Performance.getMetrics').catch(()=>null);
const mem=await pg.evaluate(()=>performance.memory?performance.memory.usedJSHeapSize/1e6:null);
console.log(reqs.filter(r=>/glb/.test(r[0])).map(r=>r[0].replace(/\?.*/,'')+' '+(r[1]/1e6).toFixed(2)).join('; '));console.log(reqs.filter(r=>!/glb/.test(r[0])&&r[1]>150000).map(r=>r[0].replace(/\?.*/,'')+' '+(r[1]/1e6).toFixed(2)).join('; '));console.log('ready ms',ready,'MB transferred',(bytes/1e6).toFixed(1),'heapMB',mem);

await b.close();process.exit(0)})();
