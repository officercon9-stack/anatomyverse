import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
import fs from 'fs';
const [inp,outp,bonesFile]=process.argv.slice(2);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const doc=await io.read(inp);
const bdoc=await io.read(bonesFile||inp);
const W=(n)=>n.getWorldMatrix();
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
function inv(m){const a=m,o=new Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;d=1/d;
o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o;}
const cen=(n)=>{const m=W(n),p=[0,0,0];const P=[];for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}}return [0,1,2].map(i=>P.reduce((a,v)=>a+v[i],0)/P.length)};
const names=['index-finger','middle-finger','ring-finger','little-finger'];
const mc={ 'index-finger':'metacarpal-2','middle-finger':'metacarpal-3','ring-finger':'metacarpal-4','little-finger':'metacarpal-5'};
const log=[];
for(const side of ['L','R']){
 const bn={};for(const n of bdoc.getRoot().listNodes()){if(n.getName().startsWith(`b_hand-bones_${side}__`)&&n.getMesh())bn[n.getName().split('__')[1]]=cen(n)}
 // chains: index 0..3 = index..little ; points sorted by descending y
 const chains=names.map(f=>[bn[mc[f]],bn['proximal-phalanx-of-'+f],bn['middle-phalanx-of-'+f],bn['distal-phalanx-of-'+f]].map(c=>({x:c[0],y:c[1],z:c[2]})));
 const at=(c,y)=>{const ch=chains[c];if(y>=ch[0].y)return ch[0];for(let i=0;i<3;i++){if(y<=ch[i].y&&y>=ch[i+1].y){const t=(ch[i].y-y)/(ch[i].y-ch[i+1].y);return {x:ch[i].x+t*(ch[i+1].x-ch[i].x),z:ch[i].z+t*(ch[i+1].z-ch[i].z)}}}return ch[3]};
 const sg=side==='L'?1:-1;
 // source strand anchors (x*sign) at the distal end of extensor digitorum, ulnar->radial = little..index
 const SRC=[0.250,0.280,0.305,0.340]; // little, ring, middle, index
 const fingerOf=(xs)=>{ // float finger index 0..3 (index..little)
   // SRC little=idx3 ... index=idx0
   const a=[0.340,0.305,0.280,0.250]; // idx0..3
   if(xs>=a[0])return 0; if(xs<=a[3])return 3;
   for(let i=0;i<3;i++){if(xs<=a[i]&&xs>=a[i+1]){return i+(a[i]-xs)/(a[i]-a[i+1])}}return 0};
 const jobs=[[`m_extensor-digitorum_${side}`,null],[`m_extensor-digiti-minimi_${side}`,3],[`t_extensor-indicis_${side}`,0],[`m_extensor-indicis_${side}`,0,`t_extensor-indicis_${side}`]];
 const dxMap={};
 const YT=0.78;
 const ANCH=[0.250,0.280,0.305,0.340]; // src xs for idx3..idx0
 for(const [nm,fix,dxFrom] of jobs){const n=doc.getRoot().listNodes().find(x=>x.getName()===nm);if(!n){log.push('missing '+nm);continue}
  const m=W(n),im=inv(m);const p=[0,0,0];
  // gather world verts
  const refs=[];for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);refs.push({pos,i,w:tp(m,p)})}}
  const bin=0.004;const zb=new Map();refs.forEach(r=>{const k=Math.floor(r.w[1]/bin);const e=zb.get(k)||zb.set(k,{s:0,n:0}).get(k);e.s+=r.w[2];e.n++});
  const zmean=y=>{let best=null,bd=1e9;for(const [k,e] of zb){const yc=(k+0.5)*bin;const d=Math.abs(yc-y);if(d<bd){bd=d;best=e}}return best.s/best.n};
  // single-strand x offset
  let dxFix=0;if(dxFrom){dxFix=dxMap[dxFrom]}else if(fix!==null){const lo=Math.min(...refs.map(r=>r.w[1]));const tip=refs.filter(r=>r.w[1]<lo+0.006);const tx=tip.reduce((a,r)=>a+r.w[0],0)/tip.length;const ty=tip.reduce((a,r)=>a+r.w[1],0)/tip.length;dxFix=at(fix,Math.min(ty,0.84)).x-tx;dxMap[nm]=dxFix;}
  const T0=xs=>{ // returns target x (in side-mirrored sign space) for digitorum strands
    const src=ANCH.slice().reverse(); // idx0..3 → 0.340..0.250 (descending)
    const tg=[0,1,2,3].map(f=>at(f,YT).x*sg);
    if(xs>=src[0])return xs+(tg[0]-src[0]); if(xs<=src[3])return xs+(tg[3]-src[3]);
    for(let i=0;i<3;i++){if(xs<=src[i]&&xs>=src[i+1]){const u=(src[i]-xs)/(src[i]-src[i+1]);return tg[i]+u*(tg[i+1]-tg[i])}}return xs};
  let moved=0,maxd=0;
  for(const r of refs){const w=r.w,y=w[1];if(y>=0.95)continue;let t=(0.95-y)/0.12;t=Math.min(1,Math.max(0,t));t=t*t*(3-2*t);
   const xs=w[0]*sg;let dx;let f;
   if(fix!==null){dx=dxFix;f=fix}else{const tx=T0(xs);dx=(tx-xs)*sg;f=0;const src=ANCH.slice().reverse();let ff=xs>=src[0]?0:xs<=src[3]?3:0;for(let i=0;i<3;i++)if(xs<=src[i]&&xs>=src[i+1])ff=i+(src[i]-xs)/(src[i]-src[i+1]);f=ff}
   const yy=Math.min(y,0.84);const f0=Math.floor(f),f1=Math.min(3,f0+1),fr=f-f0;const a1=at(f0,yy),b1=at(f1,yy);
   const tz=(a1.z+fr*(b1.z-a1.z))-0.011;const dz=tz-zmean(yy);
   const nx=w[0]+t*dx,nz=w[2]+t*dz;const d=Math.hypot(nx-w[0],nz-w[2]);if(d>maxd)maxd=d;moved++;
   const q=tp(im,[nx,w[1],nz]);r.pos.__f=r.pos.__f||new Float32Array(r.pos.getCount()*3);r.pos.__f.set(q,r.i*3);}
  const done=new Set();for(const r of refs){if(done.has(r.pos))continue;done.add(r.pos);const f=r.pos.__f;if(!f)continue;/* fill untouched verts */const pp=[0,0,0];const cnt=r.pos.getCount();for(let i=0;i<cnt;i++){if(f[i*3]===0&&f[i*3+1]===0&&f[i*3+2]===0){r.pos.getElement(i,pp);f.set(pp,i*3)}}r.pos.setNormalized(false);r.pos.setArray(f);delete r.pos.__f;}
  log.push(`${nm}: moved ${moved} verts, max shift ${(maxd*1000).toFixed(0)}mm`);}
}
console.log(log.join('\n'));
await doc.transform(prune(), reorder({ encoder: MeshoptEncoder }), quantize());
await io.write(outp,doc);
