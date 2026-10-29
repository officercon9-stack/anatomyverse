const {chromium}=require('playwright');const H=require('./h');H.serve(process.argv[2],8930);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ctx.addInitScript(()=>{try{localStorage.setItem('av.disclaimerSeen','1')}catch(e){}});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PAGE '+e.message));pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+' '+m.text().slice(0,160))});
const c=await ctx.newCDPSession(pg);await c.send('Network.enable');let bytes=0,big=[];const sz={};c.on('Network.loadingFinished',e=>{bytes+=e.encodedDataLength;sz[e.requestId]&&(sz[e.requestId].b=e.encodedDataLength)});c.on('Network.responseReceived',e=>{sz[e.requestId]={u:e.response.url.replace(/^.*\/\/[^/]+/,'')}});
const count=()=>pg.evaluate(()=>{let n=0;globalThis.__scn&&globalThis.__scn.traverse(o=>{if(o.isMesh)n++});return n});
const t0=Date.now();await pg.goto('http://localhost:8930/#/app/lab');let tUI=null,tModel=null;
for(let i=0;i<600;i++){await pg.waitForTimeout(100);if(!tUI&&await pg.evaluate(()=>!!document.querySelector('canvas')))tUI=Date.now()-t0;if(await count()>400){tModel=Date.now()-t0;break}}
console.log('first canvas ms',tUI,'model ready ms',tModel,'MB transferred',(bytes/1e6).toFixed(1));
console.log('largest',JSON.stringify(Object.values(sz).filter(x=>x.b).sort((a,b)=>b.b-a.b).slice(0,8).map(x=>x.u.split('?')[0]+' '+(x.b/1e6).toFixed(2)+'MB')));
console.log('low power on (lite models)?',await pg.evaluate(()=>__avStore.getState().lowPower));
// responsiveness: drag on canvas, measure JS long tasks
await pg.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(e.duration))).observe({entryTypes:['longtask']})});
const cv=await pg.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/3}});
const m0=await c.send('Performance.enable').then(()=>c.send('Performance.getMetrics'));
await pg.mouse.move(cv.x,cv.y);await pg.mouse.down();for(let i=0;i<30;i++){await pg.mouse.move(cv.x+i*4,cv.y);await pg.waitForTimeout(30)}await pg.mouse.up();
const m1=await c.send('Performance.getMetrics');const g=(m,n)=>m.metrics.find(x=>x.name===n).value;
console.log('drag: script s',(g(m1,'ScriptDuration')-g(m0,'ScriptDuration')).toFixed(2),'layout s',(g(m1,'LayoutDuration')-g(m0,'LayoutDuration')).toFixed(2),'heap MB',(g(m1,'JSHeapUsedSize')/1e6).toFixed(0));
// refresh
const t1=Date.now();await pg.reload();let tR=null;for(let i=0;i<600;i++){await pg.waitForTimeout(100);if(await count()>400){tR=Date.now()-t1;break}}console.log('refresh model ready ms',tR);
// offline
await pg.waitForTimeout(3000);await ctx.setOffline(true);const t2=Date.now();await pg.reload().catch(e=>console.log('offline reload err',e.message));let tO=null;for(let i=0;i<300;i++){await pg.waitForTimeout(100);if(await count().catch(()=>0)>400){tO=Date.now()-t2;break}}
console.log('offline model ready ms',tO,'title',await pg.title().catch(()=>'?'));
console.log('ERRS/WARN',JSON.stringify([...new Set(errs)].slice(0,12)));await b.close();process.exit(0)})();
