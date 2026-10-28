#!/usr/bin/env python3
"""Build a standalone nose + ear close-up model for AnatomyVerse from BodyParts3D STL.

BodyParts3D space: millimetres, Z-up, -Y anterior.
App space:         metres, Y-up, +Z anterior  ->  (x, z, -y) / 1000
Model is centred on its own bounding box, matching the existing
bodyparts3d-brain-skull close-up asset (which sits at the origin).
"""
import sys, os, json, struct, base64
import numpy as np

SRC = sys.argv[1]          # bp3d repo root (untrusted data: path passed in, never imported from)
OUT = sys.argv[2]          # output .glb.json

PARTS = [
    # (node name, FMA id, structure id, target vertex budget)
    ("nasal_bone_r",      "FMA53647", "nasal-bone",        2600),
    ("nasal_bone_l",      "FMA53648", "nasal-bone",        2600),
    ("nasal_cartilages",  "FMA71704", "nasal-cartilages",  9000),
    ("inferior_concha_r", "FMA54737", "inferior-concha",   3600),
    ("inferior_concha_l", "FMA54738", "inferior-concha",   3600),
    ("ethmoid",           "FMA52740", "ethmoid-bone",      9000),
    ("vomer",             "FMA9710",  "vomer",             4000),
    ("nasalis_r",         "FMA55606", "nasalis",           6000),
    ("nasalis_l",         "FMA55607", "nasalis",           6000),
    ("ear",               "FMA52780", "external-ear",     16000),
    ("maxilla_r",         "FMA53649", "maxilla",           9000),
    ("maxilla_l",         "FMA53650", "maxilla",           9000),
    ("palatine_r",        "FMA53655", "palatine-bone",     4000),
    ("palatine_l",        "FMA53656", "palatine-bone",     4000),
    ("temporal_r",        "FMA52738", "temporal-bone",     9000),
    ("temporal_l",        "FMA52739", "temporal-bone",     9000),
]


def read_stl(path):
    with open(path, "rb") as f:
        head = f.read(84)
        n = struct.unpack("<I", head[80:84])[0]
        raw = f.read(n * 50)
    a = np.frombuffer(raw, dtype=np.uint8).reshape(n, 50)
    tri = a[:, 12:48].copy().view(np.float32).reshape(n, 3, 3)
    return tri.astype(np.float64)


def to_app_space(tri):
    # (x, z, -y) / 1000
    out = np.empty_like(tri)
    out[..., 0] = tri[..., 0] / 1000.0
    out[..., 1] = tri[..., 2] / 1000.0
    out[..., 2] = -tri[..., 1] / 1000.0
    return out


def cluster_decimate(tri, budget):
    """Vertex-cluster decimation: snap to a grid, drop degenerate tris, then index."""
    verts = tri.reshape(-1, 3)
    lo, hi = verts.min(0), verts.max(0)
    diag = float(np.linalg.norm(hi - lo)) or 1.0
    cell = diag / 140.0
    for _ in range(14):
        keys = np.floor((verts - lo) / cell).astype(np.int64)
        uniq, inv = np.unique(keys, axis=0, return_inverse=True)
        faces = inv.reshape(-1, 3)
        good = (faces[:, 0] != faces[:, 1]) & (faces[:, 1] != faces[:, 2]) & (faces[:, 0] != faces[:, 2])
        faces = faces[good]
        if len(uniq) <= budget or len(faces) == 0:
            break
        cell *= 1.22
    # representative position per cluster = mean of its members
    pos = np.zeros((len(uniq), 3))
    cnt = np.zeros(len(uniq))
    np.add.at(pos, inv, verts)
    np.add.at(cnt, inv, 1)
    pos /= np.maximum(cnt, 1)[:, None]
    # area-weighted vertex normals
    nrm = np.zeros_like(pos)
    if len(faces):
        p0, p1, p2 = pos[faces[:, 0]], pos[faces[:, 1]], pos[faces[:, 2]]
        fn = np.cross(p1 - p0, p2 - p0)
        for k in range(3):
            np.add.at(nrm, faces[:, k], fn)
    ln = np.linalg.norm(nrm, axis=1, keepdims=True)
    nrm = np.where(ln > 1e-12, nrm / np.maximum(ln, 1e-12), np.array([0.0, 1.0, 0.0]))
    return pos.astype(np.float32), nrm.astype(np.float32), faces.astype(np.uint32)


meshes, nodes, accessors, bufviews = [], [], [], []
blob = bytearray()


def pad4():
    while len(blob) % 4:
        blob.append(0)


built = []
for name, fid, sid, budget in PARTS:
    p = os.path.join(SRC, "assets", "BodyParts3D_data", "stl", fid + ".stl")
    if not os.path.exists(p):
        print("  MISSING", fid, name); continue
    tri = to_app_space(read_stl(p))
    pos, nrm, faces = cluster_decimate(tri, budget)
    built.append((name, sid, pos, nrm, faces))
    print(f"  {name:18s} {len(tri):6,d} tris -> {len(pos):6,d} verts / {len(faces):6,d} tris")

# centre the whole model on its bounding box
allpos = np.concatenate([b[2] for b in built], 0)
centre = (allpos.min(0) + allpos.max(0)) / 2.0
print("  centring on", [round(float(c), 4) for c in centre])

for name, sid, pos, nrm, faces in built:
    pos = pos - centre
    pad4(); off_p = len(blob); blob += pos.tobytes()
    pad4(); off_n = len(blob); blob += nrm.tobytes()
    pad4(); off_i = len(blob); blob += faces.tobytes()
    bv_p, bv_n, bv_i = len(bufviews), len(bufviews) + 1, len(bufviews) + 2
    bufviews += [
        {"buffer": 0, "byteOffset": off_p, "byteLength": pos.nbytes, "target": 34962},
        {"buffer": 0, "byteOffset": off_n, "byteLength": nrm.nbytes, "target": 34962},
        {"buffer": 0, "byteOffset": off_i, "byteLength": faces.nbytes, "target": 34963},
    ]
    a_p, a_n, a_i = len(accessors), len(accessors) + 1, len(accessors) + 2
    accessors += [
        {"bufferView": bv_p, "componentType": 5126, "count": len(pos), "type": "VEC3",
         "min": pos.min(0).tolist(), "max": pos.max(0).tolist()},
        {"bufferView": bv_n, "componentType": 5126, "count": len(nrm), "type": "VEC3"},
        {"bufferView": bv_i, "componentType": 5125, "count": faces.size, "type": "SCALAR"},
    ]
    meshes.append({"name": name,
                   "primitives": [{"attributes": {"POSITION": a_p, "NORMAL": a_n}, "indices": a_i}]})
    nodes.append({"name": name, "mesh": len(meshes) - 1})

gltf = {
    "asset": {"version": "2.0", "generator": "AnatomyVerse nose/ear builder (BodyParts3D STL)"},
    "scene": 0, "scenes": [{"nodes": list(range(len(nodes)))}],
    "nodes": nodes, "meshes": meshes, "accessors": accessors, "bufferViews": bufviews,
    "buffers": [{"byteLength": len(blob)}],
}
jchunk = json.dumps(gltf, separators=(",", ":")).encode()
jchunk += b" " * ((4 - len(jchunk) % 4) % 4)
bchunk = bytes(blob) + b"\0" * ((4 - len(blob) % 4) % 4)
glb = (b"glTF" + struct.pack("<II", 2, 12 + 8 + len(jchunk) + 8 + len(bchunk))
       + struct.pack("<II", len(jchunk), 0x4E4F534A) + jchunk
       + struct.pack("<II", len(bchunk), 0x004E4942) + bchunk)

doc = {
    "format": "glb-base64",
    "license": "CC BY-SA 2.1 Japan - BodyParts3D",
    "attribution": ("BodyParts3D, (c) The Database Center for Life Science, licensed under "
                    "CC BY-SA 2.1 Japan. Decimated and converted for AnatomyVerse."),
    "glb": base64.b64encode(glb).decode(),
}
json.dump(doc, open(OUT, "w", encoding="utf-8"), separators=(",", ":"))
print(f"\n  wrote {OUT}  ({os.path.getsize(OUT)/1048576:.2f} MB, {len(nodes)} meshes)")
print("  structure ids:", sorted({b[1] for b in built}))
