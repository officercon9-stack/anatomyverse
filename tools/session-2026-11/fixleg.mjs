import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const fit = JSON.parse(fs.readFileSync('femurfit.json'));
const mul=(a,b)=>{const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o;};
for (const file of process.argv.slice(2)) {
  const doc = await io.read(file); let dropped=0, moved=0;
  for (const n of doc.getRoot().listNodes()) {
    const nm = n.getName();
    if (/^za_(fibula|tibia|patella|humerus|radius|ulna|scapula|clavicle|hipbone)_\d$/.test(nm)) { n.dispose(); dropped++; continue; }
    const f = nm.match(/^za_femur_(\d)__/);
    if (f) { if (n.getParentNode()) throw new Error('parent '+nm);
      const F = fit[f[1]==='1'?'L':'R']; const nm2 = mul(F, n.getWorldMatrix()); n.setMatrix(nm2); moved++; }
  }
  await doc.transform(prune(), reorder({ encoder: MeshoptEncoder }), quantize());
  await io.write(file, doc); console.log(file,'dropped',dropped,'moved',moved);
}
