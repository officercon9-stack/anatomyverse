/* Optimise an exported Z-Anatomy group for the app: give each part a tissue
   colour from the app palette, then quantize + meshopt like the other models. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { reorder, quantize, dedup, prune, simplify } from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptDecoder.ready; await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const [src,dst,ratioRaw]=process.argv.slice(2);
const ratio=ratioRaw?Number(ratioRaw):0;
const doc=await io.read(src);
const COL={
  kidney:[0.60,0.24,0.22], 'renal pelvis':[0.86,0.80,0.62], ureter:[0.84,0.78,0.60],
  'suprarenal':[0.90,0.78,0.47], artery:[0.75,0.14,0.13], vein:[0.20,0.35,0.62],
};
function colourFor(n){
  const s=n.toLowerCase();
  for(const k of Object.keys(COL)) if(s.includes(k)) return COL[k];
  if(/vein/.test(s))return COL.vein; if(/arter/.test(s))return COL.artery;
  return [0.65,0.40,0.35];
}
const made=new Map();
for(const node of doc.getRoot().listNodes()){
  const mesh=node.getMesh(); if(!mesh) continue;
  const c=colourFor(node.getName()); const key=c.join(',');
  let mat=made.get(key);
  if(!mat){ mat=doc.createMaterial('mat_'+key).setBaseColorFactor([...c,1])
      .setRoughnessFactor(0.62).setMetallicFactor(0).setDoubleSided(true); made.set(key,mat); }
  for(const p of mesh.listPrimitives()) p.setMaterial(mat);
}
const steps=[dedup(), prune()];
if(ratio>0) steps.push(simplify({simplifier:MeshoptSimplifier, ratio, error:0.002}));
steps.push(reorder({encoder:MeshoptEncoder}), quantize());
await doc.transform(...steps);
await io.write(dst,doc);
let tris=0;
for(const m of doc.getRoot().listMeshes()) for(const p of m.listPrimitives()) tris+=p.getIndices().getCount()/3;
const fs=await import('fs');
console.log(dst,(fs.statSync(dst).size/1024).toFixed(0)+' KB,',tris,'tris,',doc.getRoot().listNodes().filter(n=>n.getMesh()).length,'parts');
