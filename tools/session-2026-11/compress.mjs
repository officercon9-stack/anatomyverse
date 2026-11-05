import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, dedup, prune } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const doc=await io.read(process.argv[2]);
await doc.transform(dedup(), prune(), reorder({encoder:MeshoptEncoder}), quantize());
await io.write(process.argv[3], doc);
import fs from 'fs';
console.log('wrote', process.argv[3], (fs.statSync(process.argv[3]).size/1024).toFixed(0)+' KB');
