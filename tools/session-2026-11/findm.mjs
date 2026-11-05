import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const re=new RegExp(process.argv[2],'i');
for(const f of fs.readdirSync('../live37/models').filter(x=>x.endsWith('.glb'))){const doc=await io.read('../live37/models/'+f);
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m||!re.test(n.getName()))continue;
  let t=0,v=0;for(const p of m.listPrimitives()){t+=(p.getIndices()?.getCount()||0)/3;v+=p.getAttribute('POSITION').getCount()}
  console.log(f.padEnd(34),n.getName().padEnd(40),'tris',t,'verts',v)}}
