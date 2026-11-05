import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { reorder, quantize, prune } from '@gltf-transform/functions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [file, pat] = process.argv.slice(2); const re = new RegExp(pat);
const doc = await io.read(file); let n = 0;
for (const nd of doc.getRoot().listNodes()) if (re.test(nd.getName())) { nd.dispose(); n++; }
await doc.transform(prune(), reorder({ encoder: MeshoptEncoder }), quantize());
await io.write(file, doc); console.error('removed', n);
