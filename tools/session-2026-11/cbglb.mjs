import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of ['bodyparts3d-brain-only.glb','bodyparts3d-brain-skull.glb','lite/bodyparts3d-brain-only.glb']){
 const doc=await io.read('../ghclone/models/'+f);console.log('==',f);
 for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const w=n.getWorldMatrix();let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],T=0,V=0;const p=[0,0,0];
  for(const pr of m.listPrimitives()){const pos=pr.getAttribute('POSITION');V+=pos.getCount();T+=(pr.getIndices()?.getCount()||0)/3;for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);const q=[w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]];for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k])}}}
  if(f.includes('lite')||/cerebell|cerebrum|brainstem|pituit/i.test(n.getName()))console.log(n.getName().padEnd(24),'tris',T,'verts',V,'dimMM',hi.map((h,i)=>((h-lo[i])*1000).toFixed(0)).join('x'),'ctr',hi.map((h,i)=>((h+lo[i])/2).toFixed(3)).join(','));}}
