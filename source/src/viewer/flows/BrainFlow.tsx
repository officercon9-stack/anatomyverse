// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { viewFlags, useViewFlags } from '../viewFlags';
import { ParticleStream, RouteDots } from './ParticleFlows';

export var cachedBrainFlow = null;

export function BrainFlow() {
  useEffect(() => {
    let _u = useViewerStore.subscribe((_s) => {
      if (_s.selectedId) {
        viewFlags.set({
          ld_limb: true,
        });
      }
    });
    return () => _u();
  }, []);
  let _g = useViewFlags();
  let [_d, _sd] = useState(cachedBrainFlow);
  let _need = (_g.flow && _g.vessels) || (_g.csfFlow && _g.csf) || (_g.sig && _g.tracts);
  useEffect(() => {
    if (_need && !_d) {
      fetch('./models/brain-flow.json')
        .then((_r) => _r.json())
        .then((_j) => {
          cachedBrainFlow = _j;
          _sd(_j);
        })
        .catch(() => {});
    }
  }, [_need, _d]);
  let _bl = useMemo(() => (_d ? _d.blood.map((_r) => [_r.a, _r.c, _r.v]) : []), [_d]);
  let _cs = useMemo(() => (_d ? _d.csf.map((_r) => [_r]) : []), [_d]);
  let _ba = useMemo(
    () =>
      _d
        ? {
            a: _d.blood.map((_r) => _r.a),
            c: _d.blood.map((_r) => _r.c),
            v: _d.blood.map((_r) => _r.v),
          }
        : null,
    [_d],
  );
  let _sg = useMemo(() => (_d ? (_d.sig ?? []).map((_r) => [_r.p]) : []), [_d]);
  let _sc = useMemo(() => (_d ? (_d.sig ?? []).map((_r) => (_r.k === 'p' ? 'q' : _r.k)) : []), [_d]);
  if (_d && !_g.pop) {
    return (
      <group name="brain-flow" position={_d.off}>
        {_g.flow &&
          _g.vessels &&
          _ba && [
            <ParticleStream
              key="ba"
              arrs={_ba.a}
              rad={0.0019}
              c1="#9e0f1a"
              c2="#ff6a55"
              per={0.008}
              sp={4}
              op={0.85}
              pulse
            />,
            <ParticleStream
              key="bc"
              arrs={_ba.c}
              rad={0.0008}
              c1="#7a2a8a"
              c2="#e06ab8"
              per={0.004}
              sp={1.2}
              op={0.85}
            />,
            <ParticleStream
              key="bv"
              arrs={_ba.v}
              rad={0.0021}
              c1="#1a2f8a"
              c2="#5f95ff"
              per={0.012}
              sp={2.5}
              op={0.85}
            />,
          ]}
        {_g.csfFlow && _g.csf && _d.csf && (
          <ParticleStream key="cs" arrs={_d.csf} rad={0.0022} c1="#2fb4e0" c2="#e8fbff" per={0.01} sp={1} op={0.62} />
        )}
        {_g.sig && _g.tracts && _sg.length > 0 && <RouteDots key="s" routes={_sg} kind="sig" cols={_sc} />}
      </group>
    );
  } else {
    return null;
  }
}
