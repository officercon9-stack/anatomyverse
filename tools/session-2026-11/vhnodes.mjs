import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of process.argv.slice(2)){const d=await io.read(f);for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){const a=p.getAttribute('POSITION');const mt=p.getMaterial();console.log(n.getName(),a.getCount(),JSON.stringify(a.getMin([]).map(x=>+x.toFixed(3))),JSON.stringify(a.getMax([]).map(x=>+x.toFixed(3))),mt?.getName(),mt?.getRoughnessFactor(),mt?.getMetallicFactor(),mt?.getBaseColorFactor().map(x=>+x.toFixed(2)))}}}
