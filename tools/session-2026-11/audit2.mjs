import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
for(const f of process.argv.slice(2)){const doc=await io.read(f);
 for(const n of doc.getRoot().listNodes()){const me=n.getMesh();if(!me)continue;const m=n.getWorldMatrix();
  let tris=0,verts=0;const p=[0,0,0];let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
  for(const pr of me.listPrimitives()){const pos=pr.getAttribute('POSITION');const ind=pr.getIndices();
   verts+=pos.getCount();tris+=(ind?ind.getCount():pos.getCount())/3;
   for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);const w=tp(m,p);for(let d=0;d<3;d++){lo[d]=Math.min(lo[d],w[d]);hi[d]=Math.max(hi[d],w[d])}}}
  const dim=hi.map((x,i)=>x-lo[i]);
  console.log([f.split('/').pop(),n.getName(),Math.round(tris),verts,dim.map(x=>(x*1000).toFixed(0)).join('x')].join('\t'));}}
