import fs from 'fs';import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const d=await io.read('../ghclone/models/zanatomy-skull.glb');const nd=n=>d.getRoot().listNodes().find(x=>x.getName()===n);
function get(n){const m=n.getWorldMatrix();const p=n.getMesh().listPrimitives()[0];const a=p.getAttribute('POSITION');const e=[0,0,0];const V=[];for(let i=0;i<a.getCount();i++){a.getElement(i,e);V.push([m[0]*e[0]+m[4]*e[1]+m[8]*e[2]+m[12],m[1]*e[0]+m[5]*e[1]+m[9]*e[2]+m[13],m[2]*e[0]+m[6]*e[1]+m[10]*e[2]+m[14]])}
 const I=Array.from(p.getIndices().getArray());const F=[];for(let i=0;i<I.length;i+=3)F.push([I[i],I[i+1],I[i+2]]);return {V,F}}
const cen=V=>[0,1,2].map(k=>V.reduce((s,p)=>s+p[k],0)/V.length);
const out={};
for(const [jaw,a,b] of [['u','um1','um2'],['l','lm1','lm2']])for(const sd of [1,2]){
 const A=get(nd(`za_tooth_${a}_${sd}`)),B=get(nd(`za_tooth_${b}_${sd}`));const cA=cen(A.V),cB=cen(B.V);
 let dx=cB[0]-cA[0],dz=cB[2]-cA[2];const L=Math.hypot(dx,dz);dx/=L;dz/=L;
 const sc=0.88,step=0.0102;const tgt=[cB[0]+dx*step,cB[1]+(jaw==='u'?0.0010:-0.0004),cB[2]+dz*step];
 const sgn=sd===1?1:-1;const ang=-0.18*sgn; // splay outward a little
 const ca=Math.cos(ang),sa=Math.sin(ang);
 const V=B.V.map(p=>{const x=(p[0]-cB[0])*sc,y=(p[1]-cB[1])*sc,z=(p[2]-cB[2])*sc;return [tgt[0]+ca*x+sa*z,tgt[1]+y,tgt[2]-sa*x+ca*z].map(v=>+v.toFixed(5))});
 out[`zt_third_${jaw}${sd===1?'l':'r'}`]={v:V,f:B.F,c:[0.96,0.94,0.86],rough:0.35};
 console.log(jaw,sd,'centre',cB.map(v=>v.toFixed(3)),'->',tgt.map(v=>v.toFixed(3)));
}
fs.writeFileSync('../third.json',JSON.stringify(out));
