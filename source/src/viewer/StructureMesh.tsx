// @ts-nocheck
import { Color, Mesh } from 'three';
import { useRef, useEffect, memo } from 'react';
import { structureById } from '../data';
import { useViewerStore } from '../store/viewerStore';
import { useShallow } from 'zustand/react/shallow';
import { resolveVisibility, isWithin } from '../store/visibility';
import { useThree } from '@react-three/fiber';
import { viewFlags } from './viewFlags';
import { registerObject } from './meshRegistry';
import { togglePopOut } from './PopOut';

export var noRaycast = () => undefined;

export var SELECTED_COLOR = new Color('#f59e0b');

export var HOVER_COLOR = new Color('#2dd4bf');

export var EMPHASIS_COLOR = new Color('#22d3ee');

export var NO_EMISSIVE = new Color('#000000');

export var HEART_CHAMBERS = ['right-atrium', 'right-ventricle', 'left-atrium', 'left-ventricle'];

export var MATERIAL_BY_LAYER = {
  bones: {
    roughness: 0.78,
    clearcoat: 0.05,
    clearcoatRoughness: 0.8,
    sheen: 0,
  },
  muscles: {
    roughness: 0.55,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    sheen: 0.6,
  },
  organs: {
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    sheen: 0.2,
  },
  vessels: {
    roughness: 0.32,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    sheen: 0,
  },
  nerves: {
    roughness: 0.45,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    sheen: 0.3,
  },
  skin: {
    roughness: 0.6,
    clearcoat: 0.1,
    clearcoatRoughness: 0.6,
    sheen: 0.4,
  },
};

export function StructureMesh({
  name: e,
  structureId: t,
  geometry: n,
  color: r,
  baseOpacity: i = 1,
  doubleSide: a,
  unmapped: o,
  fixedOpacity: c,
}) {
  let l = useRef(null);
  let u = MATERIAL_BY_LAYER[structureById[t]?.layer ?? 'organs'] ?? MATERIAL_BY_LAYER.organs;
  let d = useViewerStore((e) => e.lowPower);
  let f = useViewerStore((e) => e.select);
  let p = useViewerStore((e) => e.hover);
  let m = useViewerStore(
    useShallow((e) => {
      let n = o
        ? {
            visible: true,
            opacity: 0.5,
            pickable: false,
          }
        : resolveVisibility(t, e, structureById, i);
      if (c && n.visible && (!('ghosted' in n) || !n.ghosted)) {
        Object.assign(n, {
          opacity: 1,
          pickable: true,
        });
      }
      let r = e.selectedId ?? (e.heartBeating ? 'heart' : null);
      let a = isWithin(t, r, structureById);
      if (e.xray && r && !a && n.visible) {
        Object.assign(n, {
          opacity: Math.min(n.opacity, 0.12),
          pickable: false,
        });
      }
      let s = e.heartBeating && HEART_CHAMBERS.includes(t) && n.visible;
      if (s) {
        Object.assign(n, {
          opacity: Math.min(n.opacity, 0.4),
        });
      }
      return {
        chamberGlass: s,
        visible: n.visible,
        opacity: Math.round(n.opacity * 100) / 100,
        pickable: n.pickable,
        selected: isWithin(t, e.selectedId, structureById),
        hovered: e.hoveredId === t,
        emphasised: e.emphasis.some((e) => isWithin(t, e, structureById)),
      };
    }),
  );
  let _kr = useRef(0);
  let _lp = useRef(null);
  let { invalidate: _pv } = useThree();
  p((_s, _dt) => {
    let _m = l.current;
    if (!_m) {
      return;
    }
    let _po = viewFlags.get().pop;
    if (_po) {
      _lp.current = _po;
    }
    let _tg = _po && isWithin(t, _po.id, structureById) ? 1 : 0;
    let _k0 = _kr.current;
    if (_k0 === _tg && _tg === 0) {
      return;
    }
    let _k1 = _tg > _k0 ? Math.min(1, _k0 + _dt * 2.6) : Math.max(0, _k0 - _dt * 2.6);
    _kr.current = _k1;
    let _ke = _k1 * _k1 * (3 - _k1 * 2);
    let _pp = _lp.current;
    if (!_pp || _k1 === 0) {
      _m.scale.set(1, 1, 1);
      _m.position.set(0, 0, 0);
      _pv();
      return;
    }
    let _sc = 1 + _ke * 0.9;
    _m.scale.set(_sc, _sc, _sc);
    _m.position.set(
      _pp.c[0] * (1 - _sc) + _pp.d[0] * _pp.dist * _ke,
      _pp.c[1] * (1 - _sc) + _pp.d[1] * _pp.dist * _ke,
      _pp.c[2] * (1 - _sc) + _pp.d[2] * _pp.dist * _ke,
    );
    _pv();
  });
  useEffect(() => (l.current && !o ? registerObject(t, l.current) : undefined), [t, o]);
  let h = m.selected ? SELECTED_COLOR : m.emphasised ? EMPHASIS_COLOR : m.hovered ? HOVER_COLOR : NO_EMISSIVE;
  let g = m.selected ? 0.32 : m.emphasised ? 0.3 : m.hovered ? 0.22 : 0;
  let _ = m.selected && !m.chamberGlass ? Math.max(m.opacity, 0.9) : m.opacity;
  let v = _ < 0.99;
  return (
    <mesh
      ref={l}
      name={e}
      geometry={n}
      visible={m.visible}
      userData={{
        structureId: t,
      }}
      raycast={m.pickable ? Mesh.prototype.raycast : noRaycast}
      onClick={(e) => {
        if (!!m.pickable && !(e.delta > 5)) {
          e.stopPropagation();
          globalThis.__lcp = [e.nativeEvent.clientX, e.nativeEvent.clientY];
          f(t);
        }
      }}
      onDoubleClick={(e) => {
        if (m.pickable) {
          e.stopPropagation();
          togglePopOut(e, t);
        }
      }}
      onPointerOver={(e) => {
        if (m.pickable) {
          e.stopPropagation();
          p(t);
        }
      }}
      onPointerOut={() => p(null)}
      renderOrder={+!!v}
    >
      <meshStandardMaterial
        key={v ? 't' : 'o'}
        color={r}
        roughness={u.roughness}
        metalness={0}
        envMapIntensity={0.9}
        transparent={v}
        opacity={_}
        depthWrite={!v}
        side={a ? 2 : 0}
        emissive={h}
        emissiveIntensity={g}
      />
    </mesh>
  );
}

export var MemoStructureMesh = memo(StructureMesh);
