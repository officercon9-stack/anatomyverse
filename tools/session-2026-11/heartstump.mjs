import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const d=await io.read('/tmp/ccf/v1.2/models/VH_M_Heart.glb');await d.transform(dequantize());
for(const n of d.getRoot().listNodes()){const nm=n.getName();if(!/(left_cardiac_atrium|right_cardiac_atrium)$/.test(nm))continue;const A=n.getMesh().listPrimitives()[0].getAttribute('POSITION').getArray();const P=[];for(let i=0;i<A.length;i+=3)P.push([A[i],A[i+1],A[i+2]]);
 // use median as centre
 const med=k=>{const a=P.map(p=>p[k]).sort((x,y)=>x-y);return a[a.length>>1]};const c=[med(0),med(1),med(2)];
 const r=P.map(p=>Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2])).sort((a,b)=>a-b);
 console.log(nm,'centre',c.map(x=>+x.toFixed(3)),'r pct',[10,50,75,90,95,99,100].map(q=>+(r[Math.min(r.length-1,Math.floor(q/100*r.length))]).toFixed(3)))}
for(const n of d.getRoot().listNodes()){const nm=n.getName();if(!/(left_cardiac_atrium|right_cardiac_atrium)$/.test(nm))continue;const p0=n.getMesh().listPrimitives()[0];const A=p0.getAttribute('POSITION').getArray(),I=p0.getIndices().getArray();const nv=A.length/3;
 const P=[];for(let i=0;i<nv;i++)P.push([A[i*3],A[i*3+1],A[i*3+2]]);const med=k=>{const a=P.map(p=>p[k]).sort((x,y)=>x-y);return a[a.length>>1]};const c=[med(0),med(1),med(2)];
 for(const TH of [0.040,0.044]){const far=P.map(p=>Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2])>TH);
  const par=Array.from({length:nv},(_,i)=>i);const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
  for(let i=0;i<I.length;i+=3){const a=I[i],b=I[i+1],cc=I[i+2];if(far[a]&&far[b])par[f(a)]=f(b);if(far[b]&&far[cc])par[f(b)]=f(cc);if(far[a]&&far[cc])par[f(a)]=f(cc)}
  const comp=new Map();for(let i=0;i<nv;i++)if(far[i]){const r=f(i);(comp.get(r)||comp.set(r,[]).get(r)).push(i)}
  const big=[...comp.values()].filter(v=>v.length>=40).map(v=>{const cc=[0,0,0];v.forEach(i=>{cc[0]+=P[i][0];cc[1]+=P[i][1];cc[2]+=P[i][2]});return {n:v.length,c:cc.map(x=>+(x/v.length).toFixed(3))}});
  console.log(nm,TH,JSON.stringify(big))}}
