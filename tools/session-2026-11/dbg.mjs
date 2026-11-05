import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready;
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();
console.log('nodes', root.listNodes().length, 'meshes', root.listMeshes().length);
let i=0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  if (i++ > 3) break;
  const m = node.getWorldMatrix();
  console.log('node', node.getName(), 'matrix', m.map(v=>+v.toFixed(3)).join(','));
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'); const ind = prim.getIndices();
    console.log('   POSITION count', pos && pos.getCount(), 'normalized', pos && pos.getNormalized(), 'componentType', pos && pos.getComponentType(), 'indices', ind && ind.getCount());
    const p=[0,0,0]; let lo=1e9,hi=-1e9;
    for (let k=0;k<pos.getCount();k++){pos.getElement(k,p);const x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12];if(x<lo)lo=x;if(x>hi)hi=x;}
    console.log('   world x range', lo.toFixed(4), hi.toFixed(4));
  }
}
