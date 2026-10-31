const H=require('./h');H.serve(process.argv[2],9030);const MIN=+process.argv[3]||4;
(async()=>{const {b,ctx,pg,errs}=await H.open(9030,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);await c.send('Performance.enable');
await pg.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(Math.round(e.duration)))).observe({entryTypes:['longtask']})});
const ids=await pg.evaluate(()=>Object.keys(__avF));const models=['schematic-body-v1','zanatomy-heart','zanatomy-skull','zanatomy-eye','zanatomy-ear'];
const mem=async()=>{await c.send('HeapProfiler.collectGarbage').catch(()=>{});const m=await c.send('Performance.getMetrics');const g=n=>m.metrics.find(x=>x.name===n).value;const r=await pg.evaluate(()=>{const s=globalThis.__r3s&&globalThis.__r3s.get();return s?[s.gl.info.memory.geometries,s.gl.info.memory.textures]:[]}).catch(()=>[]);return `heap ${(g('JSHeapUsedSize')/1e6).toFixed(1)}MB nodes ${g('Nodes')} listeners ${g('JSEventListeners')} geo/tex ${r}`};
const t0=Date.now();let loop=0;console.log('t=0',await mem());
while(Date.now()-t0<MIN*60000){loop++;
 for(let k=0;k<6;k++){const id=ids[(loop*37+k*101)%ids.length];await pg.evaluate(id=>{const S=__avStore.getState();S.select(id);S.frame([id])},id);await pg.waitForTimeout(250)}
 await pg.evaluate(()=>{const S=__avStore.getState();S.isolate([S.selectedId]);});await pg.waitForTimeout(300);await pg.evaluate(()=>__avStore.getState().restoreVisibility());
 const cv=await pg.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/3}});
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[cv]});for(let i=0;i<10;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cv.x+i*8,y:cv.y}]});await pg.waitForTimeout(16)}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 if(loop%3===0){await pg.evaluate(m=>__avStore.getState().setModel(m),models[(loop/3)%models.length]);await pg.waitForTimeout(1500)}
 if(loop%5===0){await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(1200);await pg.evaluate(()=>location.hash='#/app/lab');await pg.waitForTimeout(3500)}
 if(loop%4===0){const inp=pg.locator('input[placeholder^="Search"]').first();await inp.fill(['heart','femur','eye','vagus'][loop%4]).catch(()=>{});await pg.waitForTimeout(300);await inp.fill('').catch(()=>{})}
 if(loop%5===0)console.log('t='+Math.round((Date.now()-t0)/1000)+'s loop',loop,await mem(),'longtasks>200ms so far',await pg.evaluate(()=>__lt.filter(x=>x>200).length));
}
await pg.evaluate(()=>__avStore.getState().setModel('schematic-body-v1'));await pg.waitForTimeout(3000);console.log('end',await mem());
const lt=await pg.evaluate(()=>__lt);lt.sort((a,b)=>b-a);console.log('longtasks total',lt.length,'top',JSON.stringify(lt.slice(0,8)));
console.log('ERRS',JSON.stringify([...new Set(errs)].slice(0,6)));await b.close();process.exit(0)})();
