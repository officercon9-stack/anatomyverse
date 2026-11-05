import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);const pat=new RegExp(process.argv[3]);
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const M={};for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||!pat.test(n.getName()))continue;const m=n.getWorldMatrix(),p=[0,0,0],P=[];let tri=0;
 for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}tri+=(pr.getIndices()?pr.getIndices().getCount():pos.getCount())/3}
 M[n.getName()]={P,tri,node:n}}
const ch=(A,B)=>{let s=0;for(const a of A){let b=1e9;for(const q of B){const d=(a[0]-q[0])**2+(a[1]-q[1])**2+(a[2]-q[2])**2;if(d<b)b=d}s+=Math.sqrt(b)}return s/A.length};
const names=Object.keys(M).filter(k=>/_1(__.*)?$|_1$/.test(k)||k.endsWith('_1'));
for(const k of Object.keys(M).filter(k=>/_1$/.test(k))){const k2=k.replace(/_1$/,'_2');if(!M[k2])continue;
 const A=M[k].P,B=M[k2].P.map(v=>[-v[0],v[1],v[2]]);
 const c=(a)=>[0,1,2].map(i=>a.reduce((s,v)=>s+v[i],0)/a.length);
 const bb=a=>{const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];a.forEach(v=>v.forEach((x,i)=>{lo[i]=Math.min(lo[i],x);hi[i]=Math.max(hi[i],x)}));return hi.map((x,i)=>x-lo[i])};
 console.log(k.padEnd(18),'tris',M[k].tri,M[k2].tri,'chamfer(mm)',(((ch(A,B)+ch(B,A))/2)*1000).toFixed(2),'size1',bb(A).map(x=>(x*1000).toFixed(1)).join('x'),'size2',bb(B).map(x=>(x*1000).toFixed(1)).join('x'),'ctr1',c(A).map(x=>(x*1000).toFixed(1)).join(','),'ctr2',c(B).map(x=>(x*1000).toFixed(1)).join(','));}
