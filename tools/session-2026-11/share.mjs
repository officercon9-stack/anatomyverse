import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const det=m=>m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);
for(const f of process.argv.slice(2)){const doc=await io.read(f);const byMesh=new Map();
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const a=byMesh.get(m)||[];a.push(n);byMesh.set(m,a)}
 const sh=[...byMesh.entries()].filter(([m,a])=>a.length>1);
 console.log(f.split('/').pop(),'meshes',byMesh.size,'shared-by-multiple-nodes',sh.length);
 sh.slice(0,25).forEach(([m,a])=>console.log('   ',a.map(n=>n.getName()+(det(n.getWorldMatrix())<0?'[mirrored]':'')).join(' + ')));}
