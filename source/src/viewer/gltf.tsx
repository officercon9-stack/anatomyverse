// @ts-nocheck
import { BufferAttribute } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useViewFlags, viewFlags } from './viewFlags';
import { useViewerStore } from '../store/viewerStore';
import { useRef, useMemo, useEffect } from 'react';
import { useThree, useLoader, useFrame } from '@react-three/fiber';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { MemoStructureMesh } from './StructureMesh';
import { MUSCLE_SUPPLY, FADEABLE_MUSCLES } from './muscleSupply';

export function ensureFloatAttributes(e) {
  for (let t of Object.keys(e.attributes)) {
    let n = e.getAttribute(t);
    if (n instanceof BufferAttribute && n.array instanceof Float32Array && !n.normalized) {
      continue;
    }
    let r = new Float32Array(n.count * n.itemSize);
    let i = [n.getX, n.getY, n.getZ, n.getW];
    for (let e = 0; e < n.count; e++) {
      for (let t = 0; t < n.itemSize; t++) {
        r[e * n.itemSize + t] = i[t].call(n, e);
      }
    }
    e.setAttribute(t, new BufferAttribute(r, n.itemSize));
  }
  return e;
}

export function extractParts(e, t, n) {
  let r = [];
  e.updateMatrixWorld(true);
  e.traverse((e) => {
    let i = e;
    if (!i.isMesh) {
      return;
    }
    let a = [i.name, i.parent?.name].find((e) => e && t[e]);
    let o = (Array.isArray(i.material) ? i.material[0] : i.material)?.color?.getHexString?.() ?? 'b0b0b0';
    r.push({
      name: i.name || i.uuid,
      structureId: a ? t[a] : null,
      geometry: (() => {
        let e = ensureFloatAttributes(i.geometry.clone()).applyMatrix4(i.matrixWorld);
        if (n) {
          e.translate(...n);
        }
        return e;
      })(),
      color: `#${o}`,
      baseOpacity: (Array.isArray(i.material) ? i.material[0] : i.material)?.opacity ?? 1,
    });
  });
  return r;
}

export var GlbJsonLoader = class extends GLTFLoader {
  load(e, t, n, r) {
    if (!e.endsWith('.glb.json')) {
      return super.load(e, t, n, r);
    }
    this.manager.itemStart(e);
    let i = (t) => {
      r?.(t);
      this.manager.itemError(e);
      this.manager.itemEnd(e);
    };
    fetch(e)
      .then((t) => {
        if (!t.ok) {
          throw Error(`Could not load ${e} (HTTP ${t.status})`);
        }
        return t.json();
      })
      .then((n) => {
        let r = base64ToBytes(n.glb);
        this.parse(
          r.buffer,
          '',
          (n) => {
            t(n);
            this.manager.itemEnd(e);
          },
          i,
        );
      })
      .catch(i);
  }
};

export function base64ToBytes(e) {
  let t = atob(e);
  let n = new Uint8Array(t.length);
  for (let e = 0; e < t.length; e++) {
    n[e] = t.charCodeAt(e);
  }
  return n;
}

export function GltfModel({ asset: e, onLoaded: t }) {
  let _ga = useViewFlags();
  let _sl = useViewerStore((e) => e.selectedId);
  let _ll = e.id === 'anatomyverse-limbs';
  let _ls = e.id === 'anatomyverse-limbsupply';
  let _lr = useRef(null);
  let { invalidate: _ivb } = useThree();
  let _lg = e.id === 'bodyparts3d-lungs' || e.id === 'anatomyverse-diasupply';
  let _gh = e.id === 'bodyparts3d-brain-in-body' && (_ga.csf || _ga.tracts);
  let n = useLoader(GlbJsonLoader, e.url, (e) => e.setMeshoptDecoder(MeshoptDecoder));
  let r = useMemo(() => extractParts(n.scene, e.objectMap, e.offset), [n, e.objectMap, e.offset]);
  useFrame((_s, _dt) => {
    globalThis.__scn = _s.scene;
    if (!_lg || !_lr.current) {
      return;
    }
    let _g = _lr.current;
    let _o = e.offset;
    if (_ga.breathe && !viewFlags.get().pop) {
      let _tt = performance.now() / 1000;
      let _b = 0.5 - Math.cos((_tt * Math.PI * 2) / 4) * 0.5;
      let _sx = 1 + _b * 0.03;
      let _sy = 1 + _b * 0.075;
      let _sz = 1 + _b * 0.045;
      _g.scale.set(_sx, _sy, _sz);
      _g.position.set(_o[0] * (1 - _sx), _o[1] * (1 - _sy), _o[2] * (1 - _sz));
      _ivb();
    } else if (_g.scale.x !== 1) {
      _g.scale.set(1, 1, 1);
      _g.position.set(0, 0, 0);
      _ivb();
    }
  });
  useEffect(() => () => r.forEach((e) => e.geometry.dispose()), [r]);
  useEffect(() => t?.(), [r]);
  return (
    <group name={e.id} ref={_lr}>
      {r.map((e, t) => (
        <MemoStructureMesh
          key={`${e.name}-${t}`}
          name={e.name}
          structureId={e.structureId ?? `unmapped:${e.name}`}
          unmapped={!e.structureId}
          geometry={e.geometry}
          color={e.color}
          baseOpacity={
            _gh && !/ventricle|aqueduct/.test(e.structureId ?? '')
              ? 0.4
              : _lg &&
                  _ga.dia &&
                  e.structureId !== 'diaphragm' &&
                  !/phrenic|intercostal|musculo|pericardio/.test(e.structureId ?? '')
                ? 0.05
                : _lg && /lobe/.test(e.structureId ?? '')
                  ? _ga.dia
                    ? 0.12
                    : _ga.inside
                      ? 0.16
                      : 0.85
                  : _lg && e.structureId === 'diaphragm' && _ga.dia
                    ? 0.55
                    : _ls && _ga.nv && _sl && MUSCLE_SUPPLY[_sl] && !MUSCLE_SUPPLY[_sl].includes(e.structureId)
                      ? 0.15
                      : _ll && _sl && e.structureId !== _sl && FADEABLE_MUSCLES.has(e.structureId)
                        ? 0.36
                        : e.baseOpacity
          }
        />
      ))}
    </group>
  );
}
