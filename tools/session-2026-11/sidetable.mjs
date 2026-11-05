/* For every node in every model, measure which side of the midline it sits on. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const out = {};
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const m = node.getWorldMatrix(); const p = [0,0,0];
    let lo = Infinity, hi = -Infinity;
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION'); if (!pos) continue;
      for (let k = 0; k < pos.getCount(); k++) {
        pos.getElement(k, p);
        const x = m[0]*p[0] + m[4]*p[1] + m[8]*p[2] + m[12];
        if (x < lo) lo = x; if (x > hi) hi = x;
      }
    }
    if (lo === Infinity) continue;
    const span = hi - lo, half = Math.max(Math.abs(lo), Math.abs(hi));
    const side = lo >= -0.02 * half ? 'left' : hi <= 0.02 * half ? 'right' : 'both';
    out[node.getName()] = { side, lo: +lo.toFixed(4), hi: +hi.toFixed(4) };
  }
}
fs.writeFileSync('../sidetable.json', JSON.stringify(out));
const c = { left: 0, right: 0, both: 0 };
for (const k in out) c[out[k].side]++;
console.log('nodes measured:', Object.keys(out).length, JSON.stringify(c));
