import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  console.log('==', f);
  for (const n of doc.getRoot().listNodes()) {
    const m = n.getMesh(); if (!m) continue;
    const nm = n.getName();
    if (!/tibia|fibula|patella|femur|tarsal|calcan|talus|foot|leg/i.test(nm)) continue;
    const pos = m.listPrimitives()[0].getAttribute('POSITION');
    const w = n.getWorldMatrix(); const p=[0,0,0]; let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
    for (let i=0;i<pos.getCount();i+=7){pos.getElement(i,p);const q=[w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12],w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13],w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14]];for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],q[k]);mx[k]=Math.max(mx[k],q[k]);}}
    console.log(nm.padEnd(40), pos.getCount(), mn.map(v=>v.toFixed(2)).join(','), '|', mx.map(v=>v.toFixed(2)).join(','));
  }
}
