import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
import fs from 'fs';
for(const f of process.argv.slice(2)){const doc=await io.read(f);let t=0,m=0;for(const mesh of doc.getRoot().listMeshes()){m++;for(const p of mesh.listPrimitives()){const i=p.getIndices();t+=(i?i.getCount():p.getAttribute('POSITION').getCount())/3}}console.log(f.split('/').pop().padEnd(34),(fs.statSync(f).size/1e6).toFixed(2)+'MB',Math.round(t/1000)+'k tris',m+' meshes')}
