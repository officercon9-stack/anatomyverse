const {chromium}=require('playwright');const Z=require('./hz');Z.serve(process.argv[2],8993);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const pg=await ctx.newPage();await pg.goto('http://localhost:8993/#/app/lab');await pg.waitForTimeout(12000);
const c=await ctx.newCDPSession(pg);await c.send('Emulation.setCPUThrottlingRate',{rate:4});await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:500});await c.send('Profiler.start');
const cnt=()=>pg.evaluate(()=>{let n=0;globalThis.__scn&&globalThis.__scn.traverse(o=>{if(o.isMesh)n++});return n}).catch(()=>0);
const t1=Date.now();await pg.reload();let r2=0,marks=[];for(let i=0;i<600;i++){await pg.waitForTimeout(100);const n=await cnt();if(n&&!marks.length)marks.push('first meshes '+(Date.now()-t1));if(n>=455){r2=Date.now()-t1;break}}
const {profile}=await c.send('Profiler.stop');console.log('reload whole body',r2,marks);
const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const cnts={};profile.samples.forEach(s=>cnts[s]=(cnts[s]||0)+1);const self={};
for(const id in cnts){const f=byId[id].callFrame;const k=(f.functionName||'(anon)')+' '+f.url.split('/').pop().slice(0,28)+':'+f.lineNumber+':'+f.columnNumber;self[k]=(self[k]||0)+cnts[id]}
// inclusive by url
const tot=profile.samples.length;const byUrl={};for(const id in cnts){const u=byId[id].callFrame.url.split('/').pop().replace(/-[A-Za-z0-9_-]{8}-b\d+/,'')||byId[id].callFrame.functionName;byUrl[u]=(byUrl[u]||0)+cnts[id]}
console.log('by file',JSON.stringify(Object.entries(byUrl).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>k+' '+(100*v/tot).toFixed(1)+'%')));
Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,22).forEach(([k,v])=>console.log((100*v/tot).toFixed(1)+'%',k));
await b.close();process.exit(0)})();
