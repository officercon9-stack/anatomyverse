import fs from 'fs';
const sub=(a,b)=>a.map((x,i)=>x-b[i]);const nrm=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)};const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function cat(P,n){const out=[];const g=i=>P[Math.max(0,Math.min(P.length-1,i))];for(let i=0;i<P.length-1;i++){for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);out.push([0,1,2].map(j=>0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}out.push(P[P.length-1]);return out}
function tube(P,r0,r1,v,f,rs=10){const C=cat(P,8);const base=v.length;const n=C.length;
 for(let i=0;i<n;i++){const T=nrm(sub(C[Math.min(n-1,i+1)],C[Math.max(0,i-1)]));const u=Math.abs(T[1])<0.9?[0,1,0]:[1,0,0];const N=nrm(cr(T,u)),B=cr(T,N);const r=r0+(r1-r0)*i/(n-1);
  for(let j=0;j<rs;j++){const a=2*Math.PI*j/rs;v.push([0,1,2].map(k=>+(C[i][k]+r*(Math.cos(a)*N[k]+Math.sin(a)*B[k])).toFixed(5)))}}
 for(let i=0;i<n-1;i++)for(let j=0;j<rs;j++){const a=base+i*rs+j,b=base+i*rs+(j+1)%rs,c=base+(i+1)*rs+j,d=base+(i+1)*rs+(j+1)%rs;f.push([a,c,b],[b,c,d])}}
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const d=await io.read('../ghclone/models/anatomyverse-organs.glb');const n=d.getRoot().listNodes().find(x=>x.getName()==='large_intestine');const m=n.getWorldMatrix();const a=n.getMesh().listPrimitives()[0].getAttribute('POSITION');const e=[0,0,0];const V=[];
for(let i=0;i<a.getCount();i++){a.getElement(i,e);V.push([m[0]*e[0]+m[4]*e[1]+m[8]*e[2]+m[12],m[1]*e[0]+m[5]*e[1]+m[9]*e[2]+m[13],m[2]*e[0]+m[6]*e[1]+m[10]*e[2]+m[14]])}
const snap=g=>{let b=1e9,p=null;for(const q of V){const dd=Math.hypot(q[0]-g[0],q[1]-g[1],q[2]-g[2]);if(dd<b){b=dd;p=q}}return p};
const E=[0.009,1.025,0.063];
const targets=[[0.066,1.045,0.012],[0.052,0.985,0.045],[0.03,0.94,0.05],[0.075,1.0,0.03]];
const out={zm_ima_branches:{v:[],f:[]}};const D=out.zm_ima_branches;
const paths=[
 [[0.009,1.040,0.064],[0.03,1.046,0.045],null],
 [E,[0.03,1.0,0.06],null],
 [[0.009,1.030,0.063],[0.018,0.975,0.055],null],
 [[0.009,1.035,0.064],[0.04,1.015,0.05],null]];
const T=[targets[0],targets[1],targets[2],targets[3]];
paths.forEach((p,i)=>{const t=snap(T[i]);const dir=sub(t,p[0]);const end=[0,1,2].map(k=>t[k]-nrm(dir)[k]*0.0015);console.log('branch',i,'ends',end.map(x=>x.toFixed(3)).join(','),'from',p[0].join(','));tube([p[0],p[1],end],0.0012,0.0006,D.v,D.f)});
fs.writeFileSync('../zm.json',JSON.stringify(out));
