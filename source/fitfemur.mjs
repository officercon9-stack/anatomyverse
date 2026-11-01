import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
function pts(doc, re){const out=[];for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||!re.test(n.getName()))continue;const w=n.getWorldMatrix();const pos=n.getMesh().listPrimitives()[0].getAttribute('POSITION');const p=[0,0,0];for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);out.push([w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]]);}}return out;}
const cen=a=>[0,1,2].map(k=>a.reduce((s,v)=>s+v[k],0)/a.length);
function ends(P){const s=[...P].sort((a,b)=>a[1]-b[1]);const n=Math.floor(s.length*0.08);return [cen(s.slice(0,n)),cen(s.slice(-n))];}
const bd=await io.read('../old/limbs_pre.glb'), zd=await io.read('../live35/models/zanatomy-limbbones.glb');
const res={};
for(const [side,bn,zn] of [['L',/^b_femur_L$/,/^za_femur_1__/],['R',/^b_femur_R$/,/^za_femur_2__/]]){
  const B=pts(bd,bn),Z=pts(zd,zn);const [bb,bt]=ends(B),[zb,zt]=ends(Z);
  const sub=(a,b)=>a.map((v,i)=>v-b[i]),len=v=>Math.hypot(...v);
  const bv=sub(bt,bb),zv=sub(zt,zb);const s=len(bv)/len(zv);
  // rotation taking zv->bv (Rodrigues)
  const a=zv.map(v=>v/len(zv)),b=bv.map(v=>v/len(bv));
  const v=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const c=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const K=[[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]];
  const K2=K.map((r,i)=>r.map((_,j)=>K[i].reduce((t,_,k)=>t+K[i][k]*K[k][j],0)));
  const R=[0,1,2].map(i=>[0,1,2].map(j=>(i===j?1:0)+K[i][j]+K2[i][j]/(1+c)));
  const ap=p=>{const q=[0,1,2].map(i=>R[i][0]*(p[0]-zb[0])+R[i][1]*(p[1]-zb[1])+R[i][2]*(p[2]-zb[2]));return q.map((x,i)=>x*s+bb[i]);};
  const T=Z.map(ap);const bx=A=>[0,1,2].map(k=>[Math.min(...A.map(p=>p[k])),Math.max(...A.map(p=>p[k]))].map(x=>x.toFixed(3)).join('..'));
  console.log(side,'scale',s.toFixed(3),'angle',(Math.acos(c)*180/Math.PI).toFixed(1));console.log(' b ',bx(B).join(' | '));console.log(' z0',bx(Z).join(' | '));console.log(' z1',bx(T).join(' | '));
  // 4x4 col-major: p' = s*R*(p-zb)+bb
  const M=new Array(16).fill(0);for(let i=0;i<3;i++){for(let j=0;j<3;j++)M[j*4+i]=s*R[i][j];M[12+i]=bb[i]-s*(R[i][0]*zb[0]+R[i][1]*zb[1]+R[i][2]*zb[2]);}M[15]=1;
  res[side]=M;
}
fs.writeFileSync('femurfit.json',JSON.stringify(res));
