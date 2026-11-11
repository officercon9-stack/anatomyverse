const {chromium}=require('playwright');const fs=require('fs');
const sex=process.argv[2]||'male';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();
await p.goto('http://localhost:8150/#/app/lab');
for(let i=0;i<40;i++){await p.waitForTimeout(3000);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total)break}
await p.evaluate(s=>__avStore.getState().setSex(s),sex);await p.waitForTimeout(6000);
const n=await p.evaluate(()=>{const s=globalThis.__r3s.get();s.scene.updateMatrixWorld(true);const L=[];s.scene.traverse(o=>{if(o.isMesh)L.push(o)});globalThis.__dumpL=L;return L.length});
const out=fs.createWriteStream('app_'+sex+'.jsonl');
for(let i=0;i<n;i++){const r=await p.evaluate(i=>{const o=__dumpL[i];const g=o.geometry;const pos=g.attributes.position;const e=o.matrixWorld.elements;const P=new Float32Array(pos.count*3);
 for(let k=0;k<pos.count;k++){const x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);P[k*3]=e[0]*x+e[4]*y+e[8]*z+e[12];P[k*3+1]=e[1]*x+e[5]*y+e[9]*z+e[13];P[k*3+2]=e[2]*x+e[6]*y+e[10]*z+e[14]}
 let I;if(g.index){I=new Uint32Array(g.index.count);for(let k=0;k<I.length;k++)I[k]=g.index.getX(k)}else{I=new Uint32Array(pos.count);for(let k=0;k<I.length;k++)I[k]=k}
 let vis=true,chain=[];for(let q=o;q;q=q.parent){if(!q.visible)vis=false;if(q.name)chain.push(q.name)}
 const b64=a=>{const u=new Uint8Array(a.buffer);let s='';for(let k=0;k<u.length;k+=32768)s+=String.fromCharCode.apply(null,u.subarray(k,k+32768));return btoa(s)};
 const m=Array.isArray(o.material)?o.material[0]:o.material;
 return {name:o.name,sid:o.userData.structureId||null,chain:chain.slice(0,4),vis,col:m&&m.color?m.color.getHexString():null,op:m?m.opacity:1,tr:m?m.transparent:false,mv:m?m.visible:true,nv:pos.count,P:b64(P),I:b64(I)}},i);
 out.write(JSON.stringify(r)+'\n')}
out.end();await new Promise(r=>out.on('finish',r));console.log('dumped',n,sex);await b.close();process.exit(0)})()
