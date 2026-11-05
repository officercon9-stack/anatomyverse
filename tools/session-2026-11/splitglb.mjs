/* Split merged bilateral meshes in a GLB into separate left and right nodes.
   Many nodes hold BOTH copies of a paired structure in one primitive, so no
   side could be selected. Each such primitive is split by triangle centroid
   into <name>__L and <name>__R nodes. Midline structures (sternum, vertebrae,
   trachea) have triangles crossing x=0 and are left untouched.
   Positive x is the subject's LEFT in these models. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize } from '@gltf-transform/functions';
import fs from 'fs';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;

const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
const apply = process.argv.includes('--apply');
const report = [];

for (const file of files) {
  const doc = await io.read(file);
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const made = [];

  for (const node of [...root.listNodes()]) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const m = node.getWorldMatrix();
    const prims = mesh.listPrimitives();
    // gather triangle centroid x across all primitives
    let lo = Infinity, hi = -Infinity, tot = 0, cross = 0, L = 0, R = 0;
    const per = [];
    for (const prim of prims) {
      const pos = prim.getAttribute('POSITION'); const ind = prim.getIndices();
      if (!pos || !ind) { per.push(null); continue; }
      const n = ind.getCount() / 3; const cx = new Float32Array(n);
      const p = [0, 0, 0];
      const wx = (i) => { pos.getElement(i, p); return m[0]*p[0] + m[4]*p[1] + m[8]*p[2] + m[12]; };
      for (let t = 0; t < n; t++) {
        const x = (wx(ind.getScalar(t*3)) + wx(ind.getScalar(t*3+1)) + wx(ind.getScalar(t*3+2))) / 3;
        cx[t] = x; if (x < lo) lo = x; if (x > hi) hi = x; if (x >= 0) L++; else R++;
      }
      per.push(cx); tot += n;
    }
    if (!tot) continue;
    const half = Math.max(Math.abs(lo), Math.abs(hi)); if (half < 1e-6) continue;
    const gap = 0.06 * half;
    for (const cx of per) if (cx) for (const x of cx) if (Math.abs(x) < gap) cross++;
    const sym = Math.abs((lo + hi) / 2) < 0.12 * (hi - lo);
    if (!(sym && cross / tot < 0.02 && L / tot > 0.25 && R / tot > 0.25)) continue;

    for (const side of ['L', 'R']) {
      const keep = side === 'L' ? (x) => x >= 0 : (x) => x < 0;
      const nm = doc.createMesh(mesh.getName() + '_' + side);
      let any = false;
      prims.forEach((prim, pi) => {
        const cx = per[pi]; if (!cx) return;
        const ind = prim.getIndices();
        const sel = [];
        for (let t = 0; t < cx.length; t++) if (keep(cx[t]))
          sel.push(ind.getScalar(t*3), ind.getScalar(t*3+1), ind.getScalar(t*3+2));
        if (!sel.length) return;
        const np = doc.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial());
        for (const sname of prim.listSemantics()) np.setAttribute(sname, prim.getAttribute(sname));
        np.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(sel)));
        nm.addPrimitive(np); any = true;
      });
      if (!any) continue;
      const nn = doc.createNode(node.getName() + '__' + side).setMesh(nm);
      nn.setTranslation(node.getTranslation()).setRotation(node.getRotation()).setScale(node.getScale());
      scene.addChild(nn);
      made.push(nn.getName());
    }
    node.dispose();
  }

  report.push({ file, split: made.length / 2, names: made });
  if (apply && made.length) {
    await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize());
    await io.write(file, doc);
  }
}
fs.writeFileSync('splitreport.json', JSON.stringify(report, null, 1));
for (const r of report) console.log(r.file.split('/').pop().padEnd(40), r.split, 'nodes split');
