import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const S=[];
for(const f of process.argv.slice(2)){const doc=await io.read(f);
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];const P=[];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}
  S.push({name:n.getName(),P});}}
const C=0.01;const H=new Map();const ck=(x,y,z)=>Math.floor(x/C)+','+Math.floor(y/C)+','+Math.floor(z/C);
S.filter(s=>/^(b_|za_)/.test(s.name)).forEach(s=>s.P.forEach((v,i)=>{if(i%2)return;const k=ck(...v);let a=H.get(k);if(!a)H.set(k,a=[]);a.push(v)}));
function nb(v,r){const cx=Math.floor(v[0]/C),cy=Math.floor(v[1]/C),cz=Math.floor(v[2]/C);const R=Math.ceil(r/C);let best=1e9;
 for(let x=-R;x<=R;x++)for(let y=-R;y<=R;y++)for(let z=-R;z<=R;z++){const a=H.get((cx+x)+','+(cy+y)+','+(cz+z));if(!a)continue;for(const q of a){const d=Math.hypot(q[0]-v[0],q[1]-v[1],q[2]-v[2]);if(d<best)best=d}}return best}
const out=[];
for(const s of S){if(!/^[tm]_/.test(s.name))continue;let far=0,n=0,mx=0;const pts=[];
 s.P.forEach((v,i)=>{if(v[1]>0.87&&v[1]<1.0&&false)return;const d=nb(v,0.06);n++;if(d>0.03){far++;pts.push(v)}mx=Math.max(mx,d)});
 out.push({name:s.name,n,far,frac:far/n,mx});}
out.sort((a,b)=>b.far-a.far);
fs.writeFileSync('far.json',JSON.stringify(out));
out.filter(o=>o.far>0).slice(0,50).forEach(o=>console.log(o.name.padEnd(40),o.far+'/'+o.n,'max',(o.mx*1000).toFixed(0)+'mm'));
