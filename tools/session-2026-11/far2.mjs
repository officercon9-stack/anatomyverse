import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const S=[];
for(const f of process.argv.slice(2)){const doc=await io.read(f);
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];const P=[];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}
  S.push({name:n.getName(),P});}}
const hb=[];S.filter(s=>/^b_hand-bones_L/.test(s.name)).forEach(s=>hb.push(...s.P));
console.log('handbone verts',hb.length);
const d=v=>{let b=1e9;for(const q of hb){const e=(q[0]-v[0])**2+(q[1]-v[1])**2+(q[2]-v[2])**2;if(e<b)b=e}return Math.sqrt(b)};
for(const s of S){if(!/^[tmf]_/.test(s.name)||!/_L$/.test(s.name))continue;
 const pts=s.P.filter(v=>v[1]<0.86&&v[0]>0.25&&v[0]<0.5);if(pts.length<5)continue;
 let mx=0,far=0;for(const v of pts){const e=d(v);mx=Math.max(mx,e);if(e>0.02)far++}
 console.log(s.name.padEnd(40),'handzone',pts.length,'far>20mm',far,'max',(mx*1000).toFixed(0)+'mm');}
for(const nm of ['m_extensor-digitorum_L','m_extensor-digiti-minimi_L','t_extensor-indicis_L']){const s=S.find(x=>x.name===nm);
 const pts=s.P.filter(v=>v[1]<0.86&&v[0]>0.25&&v[0]<0.5).map(v=>({v,e:d(v)})).filter(o=>o.e>0.02);
 let lo=[9,9,9],hi=[-9,-9,-9];pts.forEach(o=>o.v.forEach((x,i)=>{lo[i]=Math.min(lo[i],x);hi[i]=Math.max(hi[i],x)}));
 console.log(nm,'far bbox',lo.map(x=>x.toFixed(3)),hi.map(x=>x.toFixed(3)));}
const fb=S.filter(s=>/^b_hand-bones_L__distal/.test(s.name));fb.forEach(s=>{const c=[0,1,2].map(i=>s.P.reduce((a,v)=>a+v[i],0)/s.P.length);console.log(s.name,c.map(x=>x.toFixed(3)))});
console.log('---strands');
for(const nm of ['m_extensor-digitorum_L','m_extensor-digiti-minimi_L','t_extensor-indicis_L','m_palmaris-longus_L','m_flexor-digitorum-superficialis_L']){const s=S.find(x=>x.name===nm);
 // bands by y
 const pts=s.P.filter(v=>v[1]<0.87);
 console.log(nm,pts.length);
 for(let y=0.87;y>0.68;y-=0.02){const b=pts.filter(v=>v[1]<=y&&v[1]>y-0.02);if(!b.length)continue;
  // group by x rounded 1cm
  const g=new Map();b.forEach(v=>{const k=Math.round(v[0]*100);(g.get(k)||g.set(k,[]).get(k)).push(v)});
  console.log(' y',y.toFixed(2),[...g.entries()].sort((a,b)=>a[0]-b[0]).map(([k,a])=>k+'cm:'+a.length+'@z'+(a.reduce((t,v)=>t+v[2],0)/a.length).toFixed(2)).join(' '));}}
