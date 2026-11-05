import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of ['zanatomy-organs2.glb','lite/zanatomy-organs2.glb']){const d=await io.read('../ghclone/models/'+f);console.log('==',f,'scenes',d.getRoot().listScenes().length,'materials',d.getRoot().listMaterials().map(m=>m.getName()+':'+m.getBaseColorFactor().map(x=>x.toFixed(2))).join(' | '));
 for(const n of d.getRoot().listNodes()){const m=n.getMesh();const pr=m&&m.listPrimitives()[0];console.log(n.getName(),'mesh',m&&m.getName(),'attrs',pr&&pr.listSemantics().join(','),'tris',pr&&pr.getIndices().getCount()/3,'mat',pr&&pr.getMaterial()&&pr.getMaterial().getName(),'parent',n.getParentNode()&&n.getParentNode().getName(),'T',n.getTranslation().map(x=>x.toFixed(3)),'S',n.getScale().map(x=>x.toFixed(3)))}}
