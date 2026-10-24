// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { useState, useEffect } from 'react';

export function MuscleAttachments() {
  let _id = useViewerStore((e) => e.selectedId);
  let [_d, _sd] = useState(globalThis.__mkc ?? null);
  useEffect(() => {
    if (!_d) {
      fetch('./models/muscle-attach.json')
        .then((_r) => _r.json())
        .then((_j) => {
          globalThis.__mkc = _j;
          _sd(_j);
        })
        .catch(() => {});
    }
  }, [_d]);
  let _m = _d && _id ? _d[_id] : null;
  if (!_m) {
    return null;
  }
  let _sp = (_p, _c, _k) => (
    <mesh key={_k} position={_p} renderOrder={20} raycast={() => undefined}>
      <sphereGeometry args={[0.0085, 16, 12]} />
      <meshBasicMaterial color={_c} depthTest={false} transparent opacity={0.95} />
    </mesh>
  );
  return (
    <group name="attach">
      {_m.o.map((_p, _i) => _sp(_p, '#2fe38a', `o${_i}`))}
      {_m.i.map((_p, _i) => _sp(_p, '#ff8a2b', `i${_i}`))}
    </group>
  );
}
