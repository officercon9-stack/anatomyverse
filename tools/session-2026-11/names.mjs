import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const doc = await io.read(process.argv[2]);
const pat = new RegExp(process.argv[3] || '.', 'i');
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh || !pat.test(node.getName())) continue;
  const m = node.getWorldMatrix(); const p=[0,0,0];
  const prim = mesh.listPrimitives()[0]; const pos = prim.getAttribute('POSITION');
  let lo=1e9,hi=-1e9;
  for (let k=0;k<pos.getCount();k++){pos.getElement(k,p);const x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12];if(x<lo)lo=x;if(x>hi)hi=x;}
  console.log(node.getName().padEnd(34), 'x=['+lo.toFixed(3)+','+hi.toFixed(3)+']', lo>=0?'LEFT':hi<=0?'RIGHT':'BOTH/MID');
}
