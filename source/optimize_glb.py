#!/usr/bin/env python3
"""Rebuild a glb for the web: optional simplification, 16-bit quantisation,
meshopt compression.  Node names, materials, node order and extensions are kept,
so the app's objectMap and colour handling are untouched.

usage: optimize_glb.py IN.glb OUT.glb [ratio] [abs_error_m]
  ratio 1.0 (default)  -> no simplification (full detail, just smaller)
  ratio 0.3            -> keep ~30% of triangles, within abs_error metres
"""
import sys, json, struct
import numpy as np
import meshoptimizer as mo

mo.encode_vertex_version(0)   # v0 streams: decodable by every three.js meshopt decoder
mo.encode_index_version(0)

COMP = {5120: (np.int8, 1), 5121: (np.uint8, 1), 5122: (np.int16, 2), 5123: (np.uint16, 2),
        5125: (np.uint32, 4), 5126: (np.float32, 4)}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def read_glb(path):
    raw = open(path, "rb").read()
    jl = struct.unpack("<I", raw[12:16])[0]
    g = json.loads(raw[20:20 + jl])
    off = 20 + jl
    bl = struct.unpack("<I", raw[off:off + 4])[0]
    return g, raw[off + 8: off + 8 + bl]


def read_acc(g, b, ai):
    a = g["accessors"][ai]
    bv = g["bufferViews"][a["bufferView"]]
    dt, sz = COMP[a["componentType"]]
    n = NCOMP[a["type"]]
    stride = bv.get("byteStride") or n * sz
    base = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
    cnt = a["count"]
    if stride == n * sz:
        arr = np.frombuffer(b, dtype=dt, count=cnt * n, offset=base).reshape(cnt, n)
    else:
        arr = np.empty((cnt, n), dtype=dt)
        for i in range(cnt):
            arr[i] = np.frombuffer(b, dtype=dt, count=n, offset=base + i * stride)
    arr = arr.astype(np.float64) if a["componentType"] != 5125 and a["componentType"] != 5123 else arr
    if a.get("normalized"):
        arr = arr / float(np.iinfo(dt).max) if np.issubdtype(dt, np.signedinteger) else arr / float(np.iinfo(dt).max)
        arr = np.maximum(arr, -1.0)
    return arr


def process(path_in, path_out, ratio=1.0, abs_err=0.0008, min_tris=240):
    g, b = read_glb(path_in)
    meshes_out, nodes_out, accessors, views = [], [], [], []
    comp = bytearray()      # compressed payload  (buffer 0)
    fallback = [0]          # running size of the (never-stored) fallback buffer (buffer 1)
    stats = {"tri_in": 0, "tri_out": 0, "v_out": 0}

    def add_view(data_bytes, raw_len, stride, count, mode, target):
        while len(comp) % 4:
            comp.append(0)
        off = len(comp)
        comp.extend(data_bytes)
        fb = fallback[0]
        fallback[0] += (raw_len + 3) // 4 * 4
        views.append({"buffer": 1, "byteOffset": fb, "byteLength": raw_len, "byteStride": stride, "target": target,
                      "extensions": {"EXT_meshopt_compression": {
                          "buffer": 0, "byteOffset": off, "byteLength": len(data_bytes), "byteStride": stride,
                          "count": count, "mode": mode, "filter": "NONE"}}})
        if mode == "TRIANGLES":
            views[-1].pop("byteStride")      # index views carry no vertex stride
        return len(views) - 1

    for node in g["nodes"]:
        if "mesh" not in node:
            nodes_out.append(node); continue
        T = np.array(node.get("translation", [0, 0, 0]), dtype=np.float64)
        S = np.array(node.get("scale", [1, 1, 1]), dtype=np.float64)
        mesh = g["meshes"][node["mesh"]]
        prims_out = []
        gpos_min = np.full(3, 1e30); gpos_max = np.full(3, -1e30)
        built = []
        for pr in mesh["primitives"]:
            pos = read_acc(g, b, pr["attributes"]["POSITION"])[:, :3] * S + T          # -> world space
            has_n = "NORMAL" in pr["attributes"]
            if has_n:
                nrm = read_acc(g, b, pr["attributes"]["NORMAL"])[:, :3] / S           # inverse-transpose of scale
                nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-12)
            idx = read_acc(g, b, pr["indices"]).reshape(-1).astype(np.uint32)
            stats["tri_in"] += len(idx) // 3
            vtx = np.ascontiguousarray((np.hstack([pos, nrm]) if has_n else pos).astype(np.float32))   # x y z [nx ny nz]
            if ratio < 0.999 and len(idx) // 3 > min_tris:
                tgt = max(int(len(idx) * ratio) // 3 * 3, int(min_tris * 0.5) * 3)
                dst = np.zeros(len(idx), dtype=np.uint32)
                err = np.zeros(1, dtype=np.float32)
                n = mo.simplify(dst, idx, vtx[:, :3].copy(), target_index_count=tgt, target_error=abs_err,
                                options=mo.SIMPLIFY_ERROR_ABSOLUTE, result_error=err)
                idx = dst[:n].copy()
            # vertex cache + fetch order; also drops vertices the simplifier no longer references
            mo.optimize_vertex_cache(idx, idx.copy(), vertex_count=len(vtx))
            out_v = np.zeros_like(vtx)
            nv = mo.optimize_vertex_fetch(out_v, idx, vtx)
            vtx = out_v[:nv].copy()
            built.append((pr, vtx, idx, has_n))
            gpos_min = np.minimum(gpos_min, vtx[:, :3].min(axis=0)); gpos_max = np.maximum(gpos_max, vtx[:, :3].max(axis=0))
        ctr = (gpos_min + gpos_max) / 2.0
        half = np.maximum((gpos_max - gpos_min) / 2.0, 1e-6)
        for pr, vtx, idx, has_n in built:
            nv = len(vtx)
            q = np.clip(np.round((vtx[:, :3] - ctr) / half * 32767.0), -32767, 32767).astype(np.int16)
            pbuf = np.zeros((nv, 4), dtype=np.int16); pbuf[:, :3] = q
            pv = add_view(mo.encode_vertex_buffer(pbuf, nv, 8), nv * 8, 8, nv, "ATTRIBUTES", 34962)
            if has_n:
                nobj = vtx[:, 3:6].astype(np.float64) * half                          # object-space normal for scale 'half'
                nobj /= np.maximum(np.linalg.norm(nobj, axis=1, keepdims=True), 1e-12)
                qn = np.clip(np.round(nobj * 32767.0), -32767, 32767).astype(np.int16)
                nbuf = np.zeros((nv, 4), dtype=np.int16); nbuf[:, :3] = qn
                nvw = add_view(mo.encode_vertex_buffer(nbuf, nv, 8), nv * 8, 8, nv, "ATTRIBUTES", 34962)
            big = nv > 65535
            ib = idx.astype(np.uint32 if big else np.uint16)
            iv = add_view(mo.encode_index_buffer(ib, len(ib), nv), len(ib) * (4 if big else 2), 4 if big else 2,
                          len(ib), "TRIANGLES", 34963)
            a0 = len(accessors)
            accessors.append({"bufferView": pv, "componentType": 5122, "normalized": True, "count": nv, "type": "VEC3",
                              "min": [int(q[:, i].min()) for i in range(3)], "max": [int(q[:, i].max()) for i in range(3)]})
            attrs = {"POSITION": a0}
            if has_n:
                accessors.append({"bufferView": nvw, "componentType": 5122, "normalized": True, "count": nv, "type": "VEC3"})
                attrs["NORMAL"] = len(accessors) - 1
            accessors.append({"bufferView": iv, "componentType": 5125 if big else 5123, "count": len(ib), "type": "SCALAR"})
            p2 = {"attributes": attrs, "indices": len(accessors) - 1}
            if "material" in pr: p2["material"] = pr["material"]
            prims_out.append(p2)
            stats["tri_out"] += len(ib) // 3; stats["v_out"] += nv
        meshes_out.append({"name": mesh.get("name"), "primitives": prims_out} if mesh.get("name") else {"primitives": prims_out})
        n2 = {k: v for k, v in node.items() if k not in ("translation", "scale", "mesh")}
        n2["mesh"] = len(meshes_out) - 1
        n2["translation"] = [float(x) for x in ctr]
        n2["scale"] = [float(x / 32767.0 * 32767.0) for x in half]
        nodes_out.append(n2)

    out = {k: v for k, v in g.items() if k not in ("nodes", "meshes", "accessors", "bufferViews", "buffers")}
    out["nodes"], out["meshes"], out["accessors"], out["bufferViews"] = nodes_out, meshes_out, accessors, views
    out["buffers"] = [{"byteLength": len(comp)},
                      {"byteLength": fallback[0], "extensions": {"EXT_meshopt_compression": {"fallback": True}}}]
    used = set(out.get("extensionsUsed", [])) | {"EXT_meshopt_compression", "KHR_mesh_quantization"}
    out["extensionsUsed"] = sorted(used)
    out["extensionsRequired"] = ["EXT_meshopt_compression", "KHR_mesh_quantization"]
    j = json.dumps(out, separators=(",", ":")).encode()
    j += b" " * ((4 - len(j) % 4) % 4)
    bn = bytes(comp) + b"\0" * ((4 - len(comp) % 4) % 4)
    glb = (b"glTF" + struct.pack("<II", 2, 12 + 8 + len(j) + 8 + len(bn)) + struct.pack("<II", len(j), 0x4E4F534A) + j
           + struct.pack("<II", len(bn), 0x004E4942) + bn)
    open(path_out, "wb").write(glb)
    return stats, len(glb)


if __name__ == "__main__":
    pin, pout = sys.argv[1], sys.argv[2]
    ratio = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    err = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0008
    st, n = process(pin, pout, ratio, err)
    print(f"{pin.split('/')[-1]:34s} tris {st['tri_in']:>8,d} -> {st['tri_out']:>8,d}   {n/1048576:5.2f} MB")
