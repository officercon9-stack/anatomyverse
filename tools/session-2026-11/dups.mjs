import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const dir='../live35/models/';
const recs=[];
for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.glb'))) {
  const doc = await io.read(dir+f);
  for (const n of doc.getRoot().listNodes()) {
    const m=n.getMesh(); if(!m) continue;
    const pos=m.listPrimitives()[0].getAttribute('POSITION'); const w=n.getWorldMatrix(); const p=[0,0,0];
    let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
    for(let i=0;i<pos.getCount();i+=3){pos.getElement(i,p);const q=[w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]];for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],q[k]);mx[k]=Math.max(mx[k],q[k]);}}
    recs.push({f,name:n.getName(),mn,mx,c:mx.map((v,i)=>(v+mn[i])/2),vol:(mx[0]-mn[0])*(mx[1]-mn[1])*(mx[2]-mn[2])});
  }
}
fs.writeFileSync('recs.json',JSON.stringify(recs));
const base=n=>n.replace(/^(b|za|m|t|f|v|n|o)_/,'').replace(/_(L|R|1|2)$/,'');
console.log(recs.length,'meshes');
// pairs from different files / names with large bbox overlap (IoU) 
function iou(a,b){let v=1;for(let k=0;k<3;k++){const lo=Math.max(a.mn[k],b.mn[k]),hi=Math.min(a.mx[k],b.mx[k]);if(hi<=lo)return 0;v*=hi-lo;}return v/(a.vol+b.vol-v);}
const out=[];
for(let i=0;i<recs.length;i++)for(let j=i+1;j<recs.length;j++){const a=recs[i],b=recs[j];if(a.vol<1e-9||b.vol<1e-9)continue;const u=iou(a,b);if(u>0.5)out.push([u,a.f+':'+a.name,b.f+':'+b.name]);}
out.sort((x,y)=>y[0]-x[0]);
for(const o of out.slice(0,120))console.log(o[0].toFixed(2),o[1],'<>',o[2]);
console.log(out.length,'pairs');
