import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';import {dequantize,quantize,reorder} from '@gltf-transform/functions';import fs from 'fs';
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const Z=JSON.parse(fs.readFileSync('../z_cl.json')),A=JSON.parse(fs.readFileSync('../app_cl.json'));
const interp=(lv,y)=>{ // lv: [[y,x,z]...] ascending y; clamp
 if(!lv.length)return null;if(y<=lv[0][0])return [lv[0][1],lv[0][2]];if(y>=lv[lv.length-1][0])return [lv[lv.length-1][1],lv[lv.length-1][2]];
 for(let i=0;i<lv.length-1;i++){const a=lv[i],b=lv[i+1];if(y>=a[0]&&y<=b[0]){const t=(y-a[0])/(b[0]-a[0]);return [a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2])]}}};
const mean=(l1,l2)=>{const ys=new Set([...l1.map(p=>p[0]),...l2.map(p=>p[0])]);return [...ys].sort((a,b)=>a-b).map(y=>{const p=interp(l1,y),q=interp(l2,y);return [y,(p[0]+q[0])/2,(p[1]+q[1])/2]})};
const sort=l=>l.slice().sort((a,b)=>a[0]-b[0]);
function axis(src,side,limb){const g=n=>sort(src[n+'-'+side].lv);
 if(limb==='arm'){const h=g('humerus'),fa=mean(g('radius'),g('ulna'));const hy=h[0][0];return y=>y>=hy?interp(h,y):interp(fa,y)}
 const f=g('body-of-femur'),t=g('tibia');const ty=t[t.length-1][0];return y=>y>=ty+0.02?interp(f,y):interp(t,y)}
const ss=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)};
const pl=(pts,y)=>{ // piecewise linear Z y -> app y ; pts descending in y [[zy,ay],...]
 if(y>=pts[0][0])return y+(pts[0][1]-pts[0][0]);const L=pts[pts.length-1];if(y<=L[0])return y+(L[1]-L[0]);
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(y<=a[0]&&y>=b[0]){const t=(a[0]-y)/(a[0]-b[0]);return a[1]+t*(b[1]-a[1])}}};
const ARM_Y=[[1.40,1.40],[1.10,1.13],[0.86,0.87]],LEG_Y=[[0.95,0.95],[0.43,0.48],[0.08,0.13]];
const [,,inF,outF]=process.argv;const doc=await io.read(inF);await doc.transform(dequantize());
const LIMB={median:'arm',ulnar:'arm',radial:'arm',musculocutaneous:'arm',axillary:'arm',sciatic:'leg',femoral:'leg',tibial:'leg',common_fibular:'leg'};
const report=[];
for(const n of doc.getRoot().listNodes()){const m=n.getName().match(/^zn_(.+)_([lr])$/);if(!m||!LIMB[m[1]])continue;const limb=LIMB[m[1]],side=m[2]==='l'?'left':'right';
 const za=axis(Z,side,limb),aa=axis(A,side,limb),map=limb==='arm'?ARM_Y:LEG_Y;const T=n.getTranslation(),S=n.getScale()[0];
 const w=y=>limb==='arm'?ss((1.38-y)/(1.38-1.26)):ss((0.97-y)/(0.97-0.78));
 let maxd=0;
 for(const p of n.getMesh().listPrimitives()){const pos=p.getAttribute('POSITION');const e=[0,0,0];
  for(let i=0;i<pos.getCount();i++){pos.getElement(i,e);const X=e[0]*S+T[0],Y=e[1]*S+T[1],Zc=e[2]*S+T[2];
   const zc=za(Y),y2=pl(map,Y),ac=aa(y2);const wt=w(Y);
   const nx=Y+(y2-Y)*wt, X2=X+(ac[0]-zc[0])*wt, Z2=Zc+(ac[1]-zc[1])*wt;maxd=Math.max(maxd,Math.hypot(X2-X,nx-Y,Z2-Zc));
   pos.setElement(i,[(X2-T[0])/S,(nx-T[1])/S,(Z2-T[2])/S])}}
 report.push(n.getName()+' max move '+(maxd*100).toFixed(1)+' cm')}
console.log(report.join('\n'));
await doc.transform(reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,doc);console.log('wrote',outF);
