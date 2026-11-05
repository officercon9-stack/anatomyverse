import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of ['VH_F_Uterus','VH_F_Ovary_L','VH_F_Ovary_R','VH_F_Fallopian_Tube_L','VH_F_Fallopian_Tube_R']){const d=await io.read('/tmp/ccf/v1.2/models/'+f+'.glb');
 for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){const a=p.getAttribute('POSITION');console.log(f,'|',n.getName(),'|',a.getCount(),'v',p.getIndices()?.getCount()/3,'t',JSON.stringify(a.getMin([]).map(x=>+x.toFixed(4))),JSON.stringify(a.getMax([]).map(x=>+x.toFixed(4))),'T',n.getTranslation(),'S',n.getScale())}}}
