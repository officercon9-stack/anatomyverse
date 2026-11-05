import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const [file,name,out]=process.argv.slice(2);
const doc=await io.read(file);const n=doc.getRoot().listNodes().find(x=>x.getName()===name);
const m=n.getWorldMatrix();const prim=n.getMesh().listPrimitives()[0];const pos=prim.getAttribute('POSITION');const p=[0,0,0];const pts=[];
for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);pts.push([m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]);}
fs.writeFileSync(out,JSON.stringify(pts));console.log(name,pts.length,prim.getIndices().getCount()/3,'tris');
