import fs from 'fs';import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const sub=(a,b)=>a.map((x,i)=>x-b[i]);const nrm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)};
const od=await io.read('../ghclone/models/anatomyverse-organs.glb');
const world=(n)=>{const m=n.getWorldMatrix();const V=[];for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('POSITION');const e=[0,0,0];for(let i=0;i<a.getCount();i++){a.getElement(i,e);V.push([m[0]*e[0]+m[4]*e[1]+m[8]*e[2]+m[12],m[1]*e[0]+m[5]*e[1]+m[9]*e[2]+m[13],m[2]*e[0]+m[6]*e[1]+m[10]*e[2]+m[14]])}}return V};
const find=n=>od.getRoot().listNodes().find(x=>x.getName()===n);
function tube(P0,T0,r0,P1,T1,r1,seg=12,rs=12,base=0){const L=Math.hypot(...sub(P1,P0));const v=[],f=[];
 const H=t=>{const t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2;return [0,1,2].map(k=>h1*P0[k]+h2*P1[k]+h3*T0[k]*L+h4*T1[k]*L)};
 for(let i=0;i<=seg;i++){const t=i/seg,c=H(t),c2=H(Math.min(1,t+0.01)),c1=H(Math.max(0,t-0.01));const T=nrm(sub(c2,c1));
  let u=Math.abs(T[1])<0.9?[0,1,0]:[1,0,0];const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const N=nrm(cr(T,u)),B=cr(T,N);const r=r0+(r1-r0)*t;
  for(let j=0;j<rs;j++){const a=2*Math.PI*j/rs;v.push([0,1,2].map(k=>c[k]+r*(Math.cos(a)*N[k]+Math.sin(a)*B[k])))}}
 for(let i=0;i<seg;i++)for(let j=0;j<rs;j++){const a=i*rs+j,b=i*rs+(j+1)%rs,c=(i+1)*rs+j,d=(i+1)*rs+(j+1)%rs;f.push([a+base,c+base,b+base],[b+base,c+base,d+base])}return {v,f}}
for(const file of ['../zv_lo.json']){
 const J=JSON.parse(fs.readFileSync(file));
 for(const [nm,tg] of [['zv_ijv_l','subclavian_vein_L'],['zv_ijv_r','subclavian_vein_R'],['zv_va_l','subclavian_artery_L'],['zv_va_r','subclavian_artery_R']]){
  const d=J[nm];const ys=d.v.map(p=>p[1]);const y0=Math.min(...ys);
  const ring=d.v.filter(p=>p[1]<y0+0.003);const c=[0,1,2].map(k=>ring.reduce((s,p)=>s+p[k],0)/ring.length);
  const rad=ring.reduce((s,p)=>s+Math.hypot(p[0]-c[0],p[2]-c[2]),0)/ring.length;
  const up=d.v.filter(p=>p[1]>y0+0.010&&p[1]<y0+0.016);const cu=[0,1,2].map(k=>up.reduce((s,p)=>s+p[k],0)/up.length);
  const T0=nrm(sub(c,cu));
  const TV=world(find(tg));let best=1e9,bp=null;for(const p of TV){const dd=Math.hypot(...sub(p,c));if(dd<best){best=dd;bp=p}}
  const tc=[0,1,2].map(k=>TV.reduce((s,p)=>s+p[k],0)/TV.length);
  if(best<0.0015){console.log(nm,'already touches',(best*1000).toFixed(1));continue}
  // end slightly inside the target wall
  const dirIn=nrm(sub(bp,c));const end=[0,1,2].map(k=>bp[k]+dirIn[k]*0.002);
  const T=tube(c,T0,rad*0.97,end,dirIn,rad*0.9,12,12,d.v.length);
  d.v.push(...T.v);d.f.push(...T.f);
  console.log(nm,'->',tg,'gap',(best*1000).toFixed(1),'mm, rad',(rad*1000).toFixed(1),'mm');
 }
 fs.writeFileSync(file.replace('.json','_x.json'),JSON.stringify(J));
}
