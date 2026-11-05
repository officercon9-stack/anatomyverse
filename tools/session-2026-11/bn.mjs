import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of ['zanatomy-limbbones.glb','anatomyverse-limbs.glb']){const doc=await io.read('../live37/models/'+f);
 const nm=doc.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>n.getName());
 console.log(f,nm.length,nm.filter(x=>/tib|fib|calcan|talus|navic/i.test(x)).join(' | '));}
