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
const zones={hand_L:{b:/^b_hand-bones_L/,sfx:'_L',z:v=>v[1]<0.86&&v[0]>0.25&&v[0]<0.5},hand_R:{b:/^b_hand-bones_R/,sfx:'_R',z:v=>v[1]<0.86&&v[0]<-0.25&&v[0]>-0.5},
 foot_L:{b:/^b_foot-bones_L/,sfx:'_L',z:v=>v[1]<0.14&&v[0]>0.05&&v[0]<0.25},foot_R:{b:/^b_foot-bones_R/,sfx:'_R',z:v=>v[1]<0.14&&v[0]<-0.05&&v[0]>-0.25}};
for(const [zn,Z] of Object.entries(zones)){const hb=[];S.filter(s=>Z.b.test(s.name)).forEach(s=>hb.push(...s.P));
 const d=v=>{let b=1e9;for(const q of hb){const e=(q[0]-v[0])**2+(q[1]-v[1])**2+(q[2]-v[2])**2;if(e<b)b=e}return Math.sqrt(b)};
 console.log('==',zn);
 for(const s of S){if(!/^[tmf]_/.test(s.name)||!s.name.endsWith(Z.sfx))continue;const pts=s.P.filter(Z.z);if(pts.length<5)continue;
  let mx=0,far=0;for(const v of pts){const e=d(v);mx=Math.max(mx,e);if(e>0.02)far++}
  if(far>0)console.log(s.name.padEnd(40),'zone',pts.length,'far>20mm',far,'max',(mx*1000).toFixed(0)+'mm');}}
