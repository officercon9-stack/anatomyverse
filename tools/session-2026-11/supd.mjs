import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const R='../live37/models/';
const load=async f=>{const doc=await io.read(R+f);const out=[];
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();const p=[0,0,0];const P=[];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}
  out.push({name:n.getName(),P});}return out;};
const sup=await load('anatomyverse-limbsupply.glb');
const hard=[...await load('anatomyverse-limbs.glb'),...await load('zanatomy-limbbones.glb')];
// grid index of limb (muscle+bone) points
const cell=0.02,G=new Map();const k=(x,y,z)=>Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
for(const s of hard)for(const v of s.P){const kk=k(...v);(G.get(kk)||G.set(kk,[]).get(kk)).push(v)}
const nearest=v=>{let b=1e9;const cx=Math.floor(v[0]/cell),cy=Math.floor(v[1]/cell),cz=Math.floor(v[2]/cell);
 for(let r=0;r<=8;r++){for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))!==r)continue;
  const a=G.get((cx+dx)+','+(cy+dy)+','+(cz+dz));if(!a)continue;for(const q of a){const e=Math.hypot(q[0]-v[0],q[1]-v[1],q[2]-v[2]);if(e<b)b=e}}
  if(b<r*cell)break}return b};
const rows=[];
for(const s of sup){const d=s.P.map(nearest).sort((a,b)=>a-b);const n=d.length;
 rows.push({name:s.name,n,med:d[n>>1]*1000,p90:d[Math.floor(n*.9)]*1000,max:d[n-1]*1000,y:s.P.reduce((a,v)=>a+v[1],0)/n});}
rows.sort((a,b)=>b.p90-a.p90);
console.log('supply meshes',rows.length);
rows.slice(0,60).forEach(r=>console.log(r.name.padEnd(42),'pts',r.n,'med',r.med.toFixed(0),'p90',r.p90.toFixed(0),'max',r.max.toFixed(0),'y',r.y.toFixed(2)));
