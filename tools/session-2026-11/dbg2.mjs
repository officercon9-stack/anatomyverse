import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const doc=await io.read(process.argv[2]);
const n=doc.getRoot().listNodes().find(x=>x.getName()==='t_extensor-indicis_L');
console.log(n.getMatrix().map(x=>+x.toFixed(4)).join(' '), 'parent',n.getParentNode()&&n.getParentNode().getName());
const prs=n.getMesh().listPrimitives();console.log('prims',prs.length);
for(const pr of prs){const a=pr.getAttribute('POSITION');console.log(a.getCount(),a.getComponentType(),a.getNormalized(),a.getMin([]),a.getMax([]));const p=[0,0,0];for(let i=0;i<5;i++){a.getElement(i,p);console.log(p)}}
