import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const pat=new RegExp(process.argv[3]||'.');
const doc=await io.read(process.argv[2]);
for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||!pat.test(n.getName()))continue;
 let agree=0,dis=0;const p=[0,0,0],q=[0,0,0],r=[0,0,0],nn=[0,0,0];
 for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION'),nor=pr.getAttribute('NORMAL');if(!nor)continue;const ind=pr.getIndices();const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];
  for(let t=0;t<I.length;t+=3){pos.getElement(I[t],p);pos.getElement(I[t+1],q);pos.getElement(I[t+2],r);const u=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],v=[r[0]-p[0],r[1]-p[1],r[2]-p[2]];
   const fn=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];nor.getElement(I[t],nn);const d=fn[0]*nn[0]+fn[1]*nn[1]+fn[2]*nn[2];if(d>0)agree++;else dis++}}
 const m=n.getWorldMatrix();const det=m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
 console.log(n.getName().padEnd(26),'normal-agrees-with-winding',agree,'disagrees',dis,'det',det>0?'+':'-');}
