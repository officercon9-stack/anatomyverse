import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const [f,re]=[process.argv[2],new RegExp(process.argv[3],'i')];
const d=await io.read(f);let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];let pts=[];
for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m||!re.test(n.getName()))continue;const w=n.getWorldMatrix();const p=[0,0,0];
 for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);const q=[w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]];pts.push(q);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k])}}}}
console.log('bbox lo',lo.map(x=>x.toFixed(3)),'hi',hi.map(x=>x.toFixed(3)),'dim',hi.map((h,i)=>(h-lo[i]).toFixed(3)),'n',pts.length);
