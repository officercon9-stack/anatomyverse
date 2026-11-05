import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);const re=new RegExp(process.argv[4]);const out={};
for(const node of doc.getRoot().listNodes()){
  const mesh=node.getMesh(); if(!mesh||!re.test(node.getName())) continue;
  const m=node.getWorldMatrix();const p=[0,0,0];const arr=[];
  for(const prim of mesh.listPrimitives()){const pos=prim.getAttribute('POSITION');
    for(let k=0;k<pos.getCount();k++){pos.getElement(k,p);arr.push([m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]);}}
  out[node.getName()]=arr;
}
fs.writeFileSync(process.argv[3],JSON.stringify(out));console.log(Object.keys(out).length);
