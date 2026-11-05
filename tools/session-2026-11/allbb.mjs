import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const out=[];
for(const f of process.argv.slice(3)){
 const doc=await io.read(f);const asset=f.split('/').pop().replace('.glb','');
 for(const node of doc.getRoot().listNodes()){
  const mesh=node.getMesh(); if(!mesh) continue;
  const m=node.getWorldMatrix();const p=[0,0,0];let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],c=[0,0,0],n=0;
  for(const prim of mesh.listPrimitives()){const pos=prim.getAttribute('POSITION');
   for(let k=0;k<pos.getCount();k++){pos.getElement(k,p);const w=[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
    for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],w[i]);hi[i]=Math.max(hi[i],w[i]);c[i]+=w[i]}n++}}
  out.push({asset,name:node.getName(),lo,hi,c:c.map(x=>x/n),n});
 }}
fs.writeFileSync(process.argv[2],JSON.stringify(out));console.log(out.length);
