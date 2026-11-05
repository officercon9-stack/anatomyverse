import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
const nm=process.argv[3];
let c=0;
for(const n of doc.getRoot().listNodes()){ if(n.getName()===nm){c++; const me=n.getMesh(); console.log('node',c,'prims',me?me.listPrimitives().length:0);
  if(me){ for(const pr of me.listPrimitives()){ console.log('  prim tris', pr.getIndices()?pr.getIndices().getCount()/3:'(no idx)'); } }
}}
console.log('total nodes named',nm,'=',c);
