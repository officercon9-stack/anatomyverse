const H=require('./h');H.serve(process.argv[2],9036);const N=+process.argv[3]||20;
(async()=>{const {b,ctx,pg,errs}=await H.open(9036,390,844,'/app/lab',13000);const c=await ctx.newCDPSession(pg);await c.send('Performance.enable');const warns=[];pg.on('console',m=>{if(/context|WebGL/i.test(m.text()))warns.push(m.type()+': '+m.text().slice(0,100))});
for(let i=0;i<N;i++){await pg.evaluate(()=>location.hash='#/app/dashboard');await pg.waitForTimeout(500);await pg.evaluate(()=>location.hash='#/app/lab');await pg.waitForTimeout(1800)}
await pg.waitForTimeout(3000);await c.send('HeapProfiler.collectGarbage');const x=await c.send('Performance.getMetrics');const g=n=>x.metrics.find(y=>y.name===n).value;
const lost=await pg.evaluate(()=>{const s=globalThis.__r3s&&globalThis.__r3s.get&&globalThis.__r3s.get();return s?s.gl.getContext().isContextLost():'no state'});
const n=await pg.evaluate(()=>{let k=0;globalThis.__scn&&globalThis.__scn.traverse(o=>{if(o.isMesh)k++});return k});
console.log(N,'trips: heap',(g('JSHeapUsedSize')/1e6).toFixed(0),'MB nodes',g('Nodes'),'current ctx lost?',lost,'meshes',n);console.log('webgl console msgs',JSON.stringify([...new Set(warns)].slice(0,5)));
await pg.evaluate(()=>__avStore.getState().select('femur'));await pg.waitForTimeout(800);await pg.screenshot({path:'trips.png'});
console.log('ERRS',JSON.stringify(errs.slice(0,4)));await b.close();process.exit(0)})();
