/* Cut a single-mesh organ into real anatomical regions along an axis.
   Triangles are assigned by centroid, so the result is genuine geometry with
   its own vertices - not an invisible box with a label on it.
   Usage: node regions.mjs <glb> <nodeName> <axis> <cut1,cut2,...> <suffix1,suffix2,...> */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize } from '@gltf-transform/functions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;

const [file, nodeName, axis, cutsRaw, namesRaw] = process.argv.slice(2);
const cuts = cutsRaw.split(',').map(Number);
const names = namesRaw.split(',');
const AX = { x: 0, y: 1, z: 2 }[axis];
const doc = await io.read(file);
const root = doc.getRoot(), scene = root.listScenes()[0];
const node = root.listNodes().find(n => n.getName() === nodeName);
if (!node) { console.error('node not found:', nodeName); process.exit(1); }
const mesh = node.getMesh(), m = node.getWorldMatrix();
const COL = [AX * 4, AX * 4 + 1, AX * 4 + 2];
const world = (p) => m[COL[0]] * p[0] + m[COL[1]] * p[1] + m[COL[2]] * p[2] + m[12 + AX];

const buckets = names.map(() => []);
let lo = Infinity, hi = -Infinity;
for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION'), ind = prim.getIndices();
  const p = [0, 0, 0];
  const w = (i) => { pos.getElement(i, p); return world(p); };
  for (let t = 0; t < ind.getCount() / 3; t++) {
    const a = ind.getScalar(t*3), b = ind.getScalar(t*3+1), c = ind.getScalar(t*3+2);
    const v = (w(a) + w(b) + w(c)) / 3;
    if (v < lo) lo = v; if (v > hi) hi = v;
    let k = 0; while (k < cuts.length && v < cuts[k]) k++;   // cuts are descending
    buckets[k].push(a, b, c);
  }
}
const made = [];
buckets.forEach((idx, i) => {
  if (!idx.length) return;
  const nm = doc.createMesh(nodeName + '_' + names[i]);
  const src = mesh.listPrimitives()[0];
  const np = doc.createPrimitive().setMode(src.getMode()).setMaterial(src.getMaterial());
  for (const s of src.listSemantics()) np.setAttribute(s, src.getAttribute(s));
  np.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)));
  nm.addPrimitive(np);
  const nn = doc.createNode(nodeName + '_' + names[i]).setMesh(nm);
  nn.setTranslation(node.getTranslation()).setRotation(node.getRotation()).setScale(node.getScale());
  scene.addChild(nn);
  made.push(nodeName + '_' + names[i] + ' (' + (idx.length / 3) + ' tris)');
});
node.dispose();
await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize());
await io.write(file, doc);
console.log('range along ' + axis + ': ' + lo.toFixed(4) + ' .. ' + hi.toFixed(4));
console.log('created: ' + made.join(', '));
