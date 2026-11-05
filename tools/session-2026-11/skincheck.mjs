import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
for(const n of doc.getRoot().listNodes()){
  if(n.getName()!==process.argv[3]) continue;
  console.log('skin:', n.getSkin()?'YES':'no');
  console.log('translation', n.getTranslation(),'rotation',n.getRotation(),'scale',n.getScale());
  let p=n.getParent();let depth=0;
  while(p && p.propertyType==='Node' && depth<5){console.log('parent',p.getName(),p.getTranslation(),p.getScale());p=p.getParent();depth++}
}
