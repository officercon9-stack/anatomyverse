import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const tn=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2],m[1]*p[0]+m[5]*p[1]+m[9]*p[2],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]];
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
// test: for the vertices furthest from centroid, does the face normal point away from centroid?
for(const f of process.argv.slice(2)){const doc=await io.read(f);const bad=[];
for(const n of doc.getRoot().listNodes()){const me=n.getMesh();if(!me)continue;const m=n.getWorldMatrix();const flipW=det(m)<0;
 const P=[],N=[],T=[];const p=[0,0,0];let off=0;
 for(const pr of me.listPrimitives()){const pos=pr.getAttribute('POSITION'),nor=pr.getAttribute('NORMAL');const ind=pr.getIndices();
  for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p));if(nor){nor.getElement(i,p);N.push(tn(m,p))}else N.push(null)}
  const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];for(let t=0;t<I.length;t+=3)T.push([I[t]+off,I[t+1]+off,I[t+2]+off]);off+=pos.getCount()}
 if(!T.length)continue;
 const c=[0,1,2].map(i=>P.reduce((s,v)=>s+v[i],0)/P.length);
 // use face normals from winding (renderer flips when det<0)
 const sc=[];for(const [a,b,cc] of T){const A=P[a],B=P[b],C=P[cc];const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
  let fn=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(flipW)fn=fn.map(x=>-x);
  const ctr=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3,(A[2]+B[2]+C[2])/3];const r=[ctr[0]-c[0],ctr[1]-c[1],ctr[2]-c[2]];const rl=Math.hypot(...r);if(rl<1e-6)continue;
  const area=Math.hypot(...fn)/2;const dot=(fn[0]*r[0]+fn[1]*r[1]+fn[2]*r[2])/(Math.hypot(...fn)*rl||1);
  sc.push({d:rl,dot,area})}
 sc.sort((a,b)=>b.d-a.d);const top=sc.slice(0,Math.max(20,Math.floor(sc.length*0.2)));
 const s=top.reduce((t,o)=>t+o.dot*o.area,0)/top.reduce((t,o)=>t+o.area,0);
 if(s<-0.15)bad.push(n.getName()+' '+s.toFixed(2));}
console.log(f.split('/').pop(),'outward-score-negative:',bad.length);bad.forEach(b=>console.log('  ',b));}
