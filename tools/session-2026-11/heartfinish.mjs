import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});await MeshoptDecoder.ready;await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const [,,inF,outF,lite]=process.argv;
const d=await io.read(inF);await d.transform(dequantize());
for(const m of d.getRoot().listMaterials()){if(/^vh_/.test(m.getName()))m.setRoughnessFactor(0.82)}
if(lite){for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m||!/^za_(left_ventricle|right_ventricle|left_atrium|right_atrium|ivs|tricuspid|pulmonary_valve|mitral)/.test(n.getName()))continue;for(const p of m.listPrimitives()){const pos=p.getAttribute('POSITION').getArray();const ind=p.getIndices().getArray();const tgt=Math.max(150,Math.floor(ind.length/3*0.4))*3;const [ni]=MeshoptSimplifier.simplify(Uint32Array.from(ind),pos,3,tgt,0.02,[]);p.getIndices().setArray(ni)}}}
await d.transform(prune(),reorder({encoder:MeshoptEncoder}),quantize());await io.write(outF,d);console.log(outF,(fs.statSync(outF).size/1024).toFixed(0)+'KB');
