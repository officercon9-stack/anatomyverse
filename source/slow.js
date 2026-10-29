const {chromium}=require('playwright');const Z=require('./hz');const root=process.argv[2],port=+process.argv[3],prof=process.argv[4]||'4g';Z.serve(root,port);
const P={'4g':{d:1.6e6/8*4,u:750e3/8,l:150},'3g':{d:1.6e6/8,u:750e3/8,l:300}}[prof];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const pg=await ctx.newPage();const c=await ctx.newCDPSession(pg);await c.send('Network.enable');await c.send('Network.emulateNetworkConditions',{offline:false,latency:P.l,downloadThroughput:P.d,uploadThroughput:P.u});await c.send('Emulation.setCPUThrottlingRate',{rate:4});
let bytes=0;c.on('Network.loadingFinished',e=>bytes+=e.encodedDataLength);
const cnt=()=>pg.evaluate(()=>{let n=0;globalThis.__scn&&globalThis.__scn.traverse(o=>{if(o.isMesh)n++});return n}).catch(()=>0);
const t0=Date.now();await pg.goto(`http://localhost:${port}/#/app/lab`);let tUI=0,tBody=0,tAll=0;
for(let i=0;i<1200;i++){await pg.waitForTimeout(100);const n=await cnt();if(!tUI&&await pg.evaluate(()=>!!document.querySelector('canvas')).catch(()=>0))tUI=Date.now()-t0;if(!tBody&&n>150)tBody=Date.now()-t0;if(n>=455){tAll=Date.now()-t0;break}}
console.log(root,prof,'canvas',tUI,'ms  first body parts',tBody,'ms  whole body',tAll,'ms  MB',(bytes/1e6).toFixed(2));
// second visit (cache)
bytes=0;const t1=Date.now();await pg.reload();let r2=0;for(let i=0;i<1200;i++){await pg.waitForTimeout(100);if(await cnt()>=455){r2=Date.now()-t1;break}}console.log('  repeat visit whole body',r2,'ms  MB',(bytes/1e6).toFixed(2));
await b.close();process.exit(0)})();
