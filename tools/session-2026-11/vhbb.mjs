import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
for(const f of process.argv.slice(2)){const d=await io.read('/tmp/ccf/v1.2/models/'+f+'.glb');let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],vc=0;
 for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){const a=p.getAttribute('POSITION');vc+=a.getCount();const mn=a.getMin([]),mx=a.getMax([]);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],mn[k]);hi[k]=Math.max(hi[k],mx[k])}}}
 console.log(f,vc,'lo',lo.map(x=>+x.toFixed(3)),'hi',hi.map(x=>+x.toFixed(3)))}
