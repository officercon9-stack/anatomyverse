import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
for(const node of doc.getRoot().listNodes()){
  const mesh=node.getMesh(); if(!mesh) continue;
  const m=node.getWorldMatrix(); const p=[0,0,0];
  let lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
  for(const prim of mesh.listPrimitives()){
    const pos=prim.getAttribute('POSITION'); if(!pos) continue;
    for(let k=0;k<pos.getCount();k++){ pos.getElement(k,p);
      const w=[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
      for(let i=0;i<3;i++){ if(w[i]<lo[i])lo[i]=w[i]; if(w[i]>hi[i])hi[i]=w[i]; } }
  }
  console.log(node.getName().padEnd(24),
    'x['+lo[0].toFixed(3)+','+hi[0].toFixed(3)+'] y['+lo[1].toFixed(3)+','+hi[1].toFixed(3)+'] z['+lo[2].toFixed(3)+','+hi[2].toFixed(3)+']');
}
