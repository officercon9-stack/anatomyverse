import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const LM=JSON.parse(fs.readFileSync('../lm.json')), PAR=JSON.parse(fs.readFileSync('../lmpar.json'));
const dir='../live35/models/';
const L=await io.read(dir+'anatomyverse-limbs.glb'), Z=await io.read(dir+'zanatomy-limbbones.glb'), S=await io.read(dir+'zanatomy-skull.glb');
function pts(doc,re){const out=[];for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||!re.test(n.getName()))continue;const w=n.getWorldMatrix();const pos=n.getMesh().listPrimitives()[0].getAttribute('POSITION');const p=[0,0,0];for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);out.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}return out;}
const SRC={ 'hip-bone':[L,'b_hip-bone_'], humerus:[L,'b_humerus_'], radius:[L,'b_radius_'], ulna:[L,'b_ulna_'], scapula:[L,'b_scapula_'], tibia:[L,'b_tibia_'], fibula:[L,'b_fibula_'], clavicle:[L,'b_clavicle_'],
  femur:[Z,'za_femur_'], sternum:[Z,'za_sternum_'], 'parietal-bone':[S,'za_parietal_'], 'frontal-bone':[S,'za_frontal_'], 'sphenoid-bone':[S,'za_sphenoid_'], 'temporal-bone':[S,'za_temporal_'], 'occipital-bone':[S,'za_occipital_'], mandible:[S,'za_mandible_'] };
const sideRe=(pre,side)=>{const l=pre.startsWith('b_')?'L':'1',r=pre.startsWith('b_')?'R':'2';const sfx=side>0?l:side<0?r:'(L|R|1|2)';return new RegExp('^'+pre+sfx+'($|__)')};
// spatial grid for NN
function grid(P,cs=0.01){const g=new Map();for(const p of P){const k=Math.floor(p[0]/cs)+','+Math.floor(p[1]/cs)+','+Math.floor(p[2]/cs);(g.get(k)||g.set(k,[]).get(k)).push(p)}return {g,cs}}
function nn(G,q,maxr=25){const {g,cs}=G;const cx=Math.floor(q[0]/cs),cy=Math.floor(q[1]/cs),cz=Math.floor(q[2]/cs);let best=1e9,bp=null;for(let r=0;r<=maxr;r++){for(let x=cx-r;x<=cx+r;x++)for(let y=cy-r;y<=cy+r;y++)for(let z=cz-r;z<=cz+r;z++){if(Math.max(Math.abs(x-cx),Math.abs(y-cy),Math.abs(z-cz))!==r)continue;const a=g.get(x+','+y+','+z);if(!a)continue;for(const p of a){const d=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(d<best){best=d;bp=p}}}if(bp&&Math.sqrt(best)<=r*cs)break;}return [Math.sqrt(best),bp]}
const out={};const rep=[];
const clusters={};
LM.forEach(([name,sid,x,y,z],i)=>{const par=PAR[name];if(!par||!SRC[par])return;const side=x>0.012?1:x<-0.012?-1:0;(clusters[par+'|'+side]||(clusters[par+'|'+side]=[])).push({name,x,y,z});});
for(const [key,arr] of Object.entries(clusters)){const [par,sd]=key.split('|');const [doc,pre]=SRC[par];let P=pts(doc,sideRe(pre,+sd));if(!P.length)P=pts(doc,sideRe(pre,0));if(!P.length){console.log('no mesh',key);continue}
 const G=grid(P);const cost=t=>{const d=arr.map(a=>nn(G,[a.x+t[0],a.y+t[1],a.z+t[2]])[0]).sort((a,b)=>a-b);const k=Math.max(1,Math.floor(d.length*0.8));return d.slice(0,k).reduce((s,v)=>s+v,0)/k};
 let t=[0,0,0],best=cost(t);const c0=best;let step=0.02;
 for(let it=0;it<60&&step>0.0006;it++){let imp=false;for(const [k,d] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){const t2=[...t];t2[k]+=d*step;if(Math.abs(t2[k])>0.08)continue;const v=cost(t2);if(v<best-1e-6){best=v;t=t2;imp=true}}if(!imp)step/=2}
 // only accept a shift if it helps materially
 t=[0,0,0];
 let moved=0;for(const a of arr){const q=[a.x+t[0],a.y+t[1],a.z+t[2]];const [d,bp]=nn(G,q);const fin=d>0.003?bp:q;out[a.name]=fin.map(v=>+v.toFixed(5));if(d>0.003)moved++}
 rep.push([key,arr.length,(c0*1000).toFixed(1),(best*1000).toFixed(1),t.map(v=>(v*1000).toFixed(0)).join(','),moved]);}
console.log('cluster'.padEnd(18),'n  before_mm after_mm shift_mm snapped');for(const r of rep)console.log(r[0].padEnd(18),String(r[1]).padEnd(3),r[2].padEnd(9),r[3].padEnd(8),r[4].padEnd(12),r[5]);
fs.writeFileSync('../lmnew.json',JSON.stringify(out));console.log(Object.keys(out).length,'landmarks re-anchored');
