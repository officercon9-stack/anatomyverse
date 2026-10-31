const H=require('./h');H.serve(process.argv[2],9021);const W=+process.argv[3]||390,Hh=+process.argv[4]||844;
(async()=>{const {b,ctx,pg,errs}=await H.open(9021,W,Hh,'/app/lab',13000);const c=await ctx.newCDPSession(pg);await c.send('Performance.enable');
const ids=await pg.evaluate(()=>{const o=[];return null});
const list=['schematic-body-v1','zanatomy-heart','zanatomy-skull','zanatomy-eye','zanatomy-ear','zanatomy-eyedetail','zanatomy-limbbones','bodyparts3d-nose-ear','sample-gltf-femur','detailed-anatomy-placeholder'];
const mem=async()=>{const m=await c.send('Performance.getMetrics');const g=n=>m.metrics.find(x=>x.name===n).value;const r=await pg.evaluate(()=>{const s=globalThis.__r3s&&globalThis.__r3s.get();return s?{geo:s.gl.info.memory.geometries,tex:s.gl.info.memory.textures,prog:s.gl.info.programs.length}:{}});return {heapMB:+(g('JSHeapUsedSize')/1e6).toFixed(1),nodes:g('Nodes'),listeners:g('JSEventListeners'),...r}};
const meshes=()=>pg.evaluate(()=>{let n=0;globalThis.__scn&&globalThis.__scn.traverse(o=>{if(o.isMesh){let v=true;for(let p=o;p;p=p.parent)if(!p.visible)v=false;if(v)n++}});return n});
console.log('start',JSON.stringify(await mem()));
for(const id of list){const t=Date.now();await pg.evaluate(id=>__avStore.getState().setModel(id),id);let st;for(let i=0;i<200;i++){await pg.waitForTimeout(100);st=await pg.evaluate(()=>{const s=__avStore.getState();return {l:s.assetLoading,e:s.assetError,m:s.modelId}});if(!st.l&&i>3)break}
 console.log(id.padEnd(30),'ms',Date.now()-t,'meshes',await meshes(),'error',JSON.stringify(st.e),'ui:',await pg.evaluate(()=>{const e=[...document.querySelectorAll('[role=alert],[role=status]')].map(x=>x.textContent.trim()).filter(Boolean);return e.slice(0,2).join(' | ').slice(0,120)}));
 if(id==='detailed-anatomy-placeholder')await pg.screenshot({path:'msw_missing.png'})}
console.log('after one pass',JSON.stringify(await mem()));
for(let r=0;r<3;r++)for(const id of list.slice(0,8)){await pg.evaluate(id=>__avStore.getState().setModel(id),id);await pg.waitForTimeout(1500)}
await pg.evaluate(()=>__avStore.getState().setModel('schematic-body-v1'));await pg.waitForTimeout(4000);
await c.send('HeapProfiler.collectGarbage').catch(()=>{});await pg.waitForTimeout(500);console.log('after 3 more passes',JSON.stringify(await mem()));
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(0)})();
