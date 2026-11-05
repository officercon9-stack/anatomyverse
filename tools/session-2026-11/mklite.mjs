import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { dequantize, weld, simplify, reorder, quantize, prune } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inF,outF,ratio,err]=process.argv;const doc=await io.read(inF);
await doc.transform(dequantize(),weld({tolerance:1e-5}),simplify({simplifier:MeshoptSimplifier,ratio:+ratio,error:+(err||0.01),lockBorder:false}),prune(),reorder({encoder:MeshoptEncoder}),quantize());
await io.write(outF,doc);console.log(outF);
