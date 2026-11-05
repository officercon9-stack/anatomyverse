import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const [,,f,...names]=process.argv;const doc=await io.read(f);
await doc.transform(dequantize());
let n=0;for(const node of doc.getRoot().listNodes()){if(names.includes(node.getName())){node.setMesh(null);node.dispose();n++}}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(f,doc);console.log(f,'removed',n);
