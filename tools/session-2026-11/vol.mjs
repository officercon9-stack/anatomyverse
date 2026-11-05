import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
for(const f of process.argv.slice(2)){const doc=await io.read(f);let bad=0,tot=0;const out=[];
 for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const m=n.getWorldMatrix();const d=det(m);let vol=0;const p=[0,0,0];
  for(const pr of n.getMesh().listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];
   const P=[];for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}
   for(let t=0;t<I.length;t+=3){const a=P[I[t]],b=P[I[t+1]],c=P[I[t+2]];vol+=(a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;}}
  // three.js flips winding when det<0 at render time => effective volume sign = vol*sign(det)? vol computed in world space uses raw winding; renderer corrects for det<0 by flipping front face
  const eff=d<0?-vol:vol;tot++;out.push(n.getName()+" "+(eff<0?"INV":"ok ")+" "+(vol*1e6).toFixed(1));if(eff<0)bad++}
 console.log(f.split('/').pop(),'meshes',tot,'effectively-inverted',bad);if(bad)console.log('  '+out.slice(0,60).join('\n  '));}
