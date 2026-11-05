import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const LM=JSON.parse(fs.readFileSync('../lm.json'));
function pts(doc,re,step=1){const out=[];for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||!re.test(n.getName()))continue;const w=n.getWorldMatrix();const pos=n.getMesh().listPrimitives()[0].getAttribute('POSITION');const p=[0,0,0];for(let i=0;i<pos.getCount();i+=step){pos.getElement(i,p);out.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}return out;}
const L=await io.read('../old_models/anatomyverse-limbs.glb'), Z=await io.read('../old_models/zanatomy-limbbones.glb');
const nn=(P,q)=>{let b=1e9;for(const p of P){const d=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(d<b)b=d}return Math.sqrt(b)};
const cases=[['tibia',/^b_tibia_L$/,/^za_tibia_1$/,L,Z],['fibula',/^b_fibula_L$/,/^za_fibula_1$/,L,Z],['humerus',/^b_humerus_L$/,/^za_humerus_1$/,L,Z],['radius',/^b_radius_L$/,/^za_radius_1$/,L,Z],['ulna',/^b_ulna_L$/,/^za_ulna_1$/,L,Z],['scapula',/^b_scapula_L$/,/^za_scapula_1$/,L,Z]];
for(const [tok,bre,zre,LD,ZD] of cases){
 const lms=LM.filter(r=>r[0].includes(tok)&&r[2]>0.01).map(r=>[r[2],r[3],r[4]]);
 const B=pts(LD,bre,2),Zp=pts(ZD,zre,1);
 const cen=A=>[0,1,2].map(k=>A.reduce((s,v)=>s+v[k],0)/A.length);
 for(const [lab,P] of [['b_',B],['za',Zp]]){
  // coordinate descent over translation + uniform scale about lm centroid
  const c=cen(lms);let t=[0,0,0],s=1;const cost=(t,s)=>lms.reduce((a,q)=>a+nn(P,[c[0]+(q[0]-c[0])*s+t[0],c[1]+(q[1]-c[1])*s+t[1],c[2]+(q[2]-c[2])*s+t[2]]),0)/lms.length;
  let best=cost(t,s);const c0=best;let step=0.02;
  for(let it=0;it<40&&step>0.0005;it++){let imp=false;for(const [k,d] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1],[3,1],[3,-1]]){const t2=[...t];let s2=s;if(k<3)t2[k]+=d*step;else s2+=d*step*5;const v=cost(t2,s2);if(v<best){best=v;t=t2;s=s2;imp=true}}if(!imp)step/=2;}
  console.log(tok.padEnd(8),lab,'n',lms.length,'mean NN before',(c0*1000).toFixed(1),'mm  after',(best*1000).toFixed(1),'mm  shift',t.map(v=>(v*1000).toFixed(0)).join(','),'scale',s.toFixed(3));
 }}
