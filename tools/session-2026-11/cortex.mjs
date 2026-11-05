import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const tp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const doc=await io.read(process.argv[2]);const pat=new RegExp(process.argv[3]);const P=[];const T=[];
for(const n of doc.getRoot().listNodes()){const me=n.getMesh();if(!me||!pat.test(n.getName()))continue;const m=n.getWorldMatrix();const p=[0,0,0];
 for(const pr of me.listPrimitives()){const pos=pr.getAttribute('POSITION');const base=P.length;for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);P.push(tp(m,p))}
  const ind=pr.getIndices();const I=ind?ind.getArray():[...Array(pos.getCount()).keys()];for(let t=0;t<I.length;t+=3)T.push([I[t]+base,I[t+1]+base,I[t+2]+base])}}
fs.writeFileSync(process.argv[4],JSON.stringify({P,T}));console.log('verts',P.length,'tris',T.length);
