// node exp.js <sex> <regex on "model/name|sid"> <out.json> [maxVerts]  -> world-space vertices (+indices if small) of matching meshes
const {chromium}=require('playwright');const fs=require('fs');
const [sex,re,out,mx]=[process.argv[2],process.argv[3],process.argv[4],+(process.argv[5]||6000)];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:900,height:700}});const p=await c.newPage();
await p.goto('http://localhost:'+(process.env.PORT||8150)+'/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<80;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();await p.evaluate(s=>__avStore.getState().setSex(s),sex);
await p.evaluate(()=>globalThis.__avb.set({ld_jlo:!0,ld_jup:!0,ld_bur:!0,ld_lyu:!0,ld_lyl:!0,vessels:!0,csf:!0,fossae:!0,tracts:!0,mening:!0,dia:!0}));await p.evaluate(()=>window.dispatchEvent(new Event('avgo')));await wait();await p.waitForTimeout(2500);
const names=await p.evaluate(re=>{const R=new RegExp(re);const s=__r3s.get();s.scene.updateMatrixWorld(true);const L=[];s.scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){const k=(o.parent&&o.parent.name)+'/'+o.name+'|'+(o.userData.structureId||'');if(R.test(k))L.push(o)}});globalThis.__E=L;return L.length},re);
const res=[];for(let i=0;i<names;i++){res.push(await p.evaluate(([i,mx])=>{const o=__E[i],g=o.geometry,pos=g.attributes.position,e=o.matrixWorld.elements;const full=pos.count<=mx;const step=full?1:Math.ceil(pos.count/mx);const V=[];for(let k=0;k<pos.count;k+=step){const x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);V.push(+(e[0]*x+e[4]*y+e[8]*z+e[12]).toFixed(5),+(e[1]*x+e[5]*y+e[9]*z+e[13]).toFixed(5),+(e[2]*x+e[6]*y+e[10]*z+e[14]).toFixed(5))}
 return {model:o.parent&&o.parent.name,name:o.name,sid:o.userData.structureId||null,nv:pos.count,full,V,I:full&&g.index?Array.from(g.index.array):null}},[i,mx]))}
fs.writeFileSync(out,JSON.stringify(res));console.log('exported',res.length,res.map(r=>r.model+'/'+r.name).join(', ').slice(0,1500));await b.close();process.exit(0)})()
