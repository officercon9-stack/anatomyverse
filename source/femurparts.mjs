/* Carve a femur mesh into named parts. Triangles are assigned by centroid using
   position along the bone (t), medial-lateral (l) and front-back (d), each scaled 0..1 over
   the bone's own bounding box, so it works for left/right and for either source model.
   Usage: node femurparts.mjs <glb> <node> <left|right> [--write] [--json out.json] */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize } from '@gltf-transform/functions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [file, nodeName, side] = process.argv.slice(2);
const WRITE = process.argv.includes('--write');
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const doc = await io.read(file);
const root = doc.getRoot(), scene = root.listScenes()[0];
const node = root.listNodes().find(n => n.getName() === nodeName);
const mesh = node.getMesh(), m = node.getWorldMatrix();
const prim = mesh.listPrimitives()[0], pos = prim.getAttribute('POSITION'), ind = prim.getIndices();
const W = []; const p = [0,0,0];
for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, p);
  W.push([m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]); }
const sg = side === 'left' ? 1 : -1;
const ax = W.map(v => sg * v[0]);                     // larger = more lateral (|x| side)
const lo = [Math.min(...ax), Math.min(...W.map(v=>v[1])), Math.min(...W.map(v=>v[2]))];
const hi = [Math.max(...ax), Math.max(...W.map(v=>v[1])), Math.max(...W.map(v=>v[2]))];
function classify(c) {            // c = centroid [x,y,z]
  const l = (sg*c[0]-lo[0])/(hi[0]-lo[0]), t = (c[1]-lo[1])/(hi[1]-lo[1]), d = (c[2]-lo[2])/(hi[2]-lo[2]);
  if (t >= 0.76) {
    if (l > 0.70) return 'greater-trochanter';
    if (t > 0.86 && l < 0.58) return 'head-of-femur';
    if (t < 0.82 && d < 0.5 && l < 0.62) return 'lesser-trochanter';
    if (t >= 0.80) return 'neck-of-femur';
    return 'body-of-femur';
  }
  if (t <= 0.17) {
    if (d > 0.66 && t > 0.07) return 'patellar-surface-of-femur';
    if (l < 0.07) return 'medial-epicondyle-of-femur';
    if (l > 0.93) return 'lateral-epicondyle-of-femur';
    return l < 0.5 ? 'medial-condyle-of-femur' : 'lateral-condyle-of-femur';
  }
  if (t <= 0.30 && d < 0.35) return 'popliteal-surface-of-femur';
  return 'body-of-femur';
}
const groups = {}, lab = [];
for (let t = 0; t < ind.getCount()/3; t++) {
  const a=ind.getScalar(t*3),b=ind.getScalar(t*3+1),c=ind.getScalar(t*3+2);
  const cen=[0,1,2].map(k=>(W[a][k]+W[b][k]+W[c][k])/3);
  const g=classify(cen); (groups[g] ||= []).push(a,b,c); lab.push([...cen,g]);
}
console.log(nodeName, Object.entries(groups).map(([k,v])=>k+':'+v.length/3).join('  '));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(lab));
if (WRITE) {
  for (const [g, idx] of Object.entries(groups)) {
    const nm = doc.createMesh(nodeName+'__'+g);
    const np = doc.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial());
    for (const s of prim.listSemantics()) np.setAttribute(s, prim.getAttribute(s));
    np.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)));
    nm.addPrimitive(np);
    const nn = doc.createNode(nodeName+'__'+g).setMesh(nm);
    nn.setTranslation(node.getTranslation()).setRotation(node.getRotation()).setScale(node.getScale());
    scene.addChild(nn);
  }
  node.dispose();
  await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize());
  await io.write(file, doc);
  console.log('written');
}
