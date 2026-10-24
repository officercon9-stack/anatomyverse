// @ts-nocheck
import { useRef, useMemo, useEffect, useState } from 'react';
import { Vector3, CatmullRomCurve3, SphereGeometry, MeshBasicMaterial, Object3D, TubeGeometry } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useViewFlags } from '../viewFlags';

export function RouteDots({ routes: _r, kind: _kd, cols: _cols }) {
  let _bl = _kd === 'blood';
  let _per = _bl ? 14 : _kd === 'sig' ? 9 : 20;
  let _n = _r.length * _per;
  let _ref = useRef(null);
  let _tm = useRef(0);
  let _cv = useMemo(
    () =>
      _r.map((_q) =>
        _q.map((_a) => {
          let _pts = [];
          for (let _j = 0; _j + 2 < _a.length; _j += 3) {
            _pts.push(new Vector3(_a[_j] / 10000, _a[_j + 1] / 10000, _a[_j + 2] / 10000));
          }
          if (_pts.length > 1) {
            return new CatmullRomCurve3(_pts, false, 'centripetal');
          } else {
            return null;
          }
        }),
      ),
    [_r],
  );
  let _ph = useMemo(
    () =>
      Float32Array.from(
        {
          length: _n,
        },
        (_u, _j) => (_j % _per) / _per + Math.random() * 0.03,
      ),
    [_n, _per],
  );
  let _geo = useMemo(() => new SphereGeometry(_bl ? 0.0017 : _kd === 'sig' ? 0.0026 : 0.0015, 6, 5), [_bl, _kd]);
  let _mat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 16777215,
        depthTest: false,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );
  let _dm = useMemo(() => new Object3D(), []);
  let _cc = useMemo(() => {
    let _C = _mat.color.constructor;
    return {
      a: new _C('#ff3b3b'),
      p: new _C('#c24fc0'),
      v: new _C('#4f8cff'),
      f: new _C('#6fe6ff'),
      w: new _C('#e9fbff'),
      m: new _C('#ffc83a'),
      s: new _C('#3cff9a'),
      q: new _C('#ff8a4a'),
      t: new _C(),
    };
  }, [_mat]);
  let { invalidate: _inv } = useThree();
  useEffect(() => _inv(), [_inv]);
  useEffect(
    () => () => {
      _geo.dispose();
      _mat.dispose();
    },
    [_geo, _mat],
  );
  useFrame((_e, _dt) => {
    let _m = _ref.current;
    if (!_m) {
      return;
    }
    _dt = Math.min(_dt, 0.1);
    _tm.current += _dt;
    let _pl = Math.pow(Math.max(0, Math.sin(_tm.current * 7.5)), 2);
    let _t = _cc.t;
    for (let _j = 0; _j < _n; _j++) {
      let _ri = Math.floor(_j / _per);
      let _cs = _cv[_ri];
      let _f = _ph[_j];
      let _pt;
      let _s = 1;
      if (_bl) {
        let _sg = _f < 0.46 ? 0 : _f < 0.54 ? 1 : 2;
        let _sp = _sg === 0 ? 0.55 + _pl * 1.1 : _sg === 1 ? 0.3 : 0.8;
        _f = (_f + _dt * 0.04 * _sp) % 1;
        _ph[_j] = _f;
        let _cur = _cs[_sg === 0 ? 0 : _sg === 1 ? 1 : 2];
        _sg = _f < 0.46 ? 0 : _f < 0.54 ? 1 : 2;
        _cur = _cs[_sg];
        let _u = _sg === 0 ? _f / 0.46 : _sg === 1 ? (_f - 0.46) / 0.08 : (_f - 0.54) / 0.46;
        if (!_cur) {
          continue;
        }
        _pt = _cur.getPointAt(Math.min(Math.max(_u, 0), 1));
        if (_sg === 0) {
          _t.copy(_cc.a).lerp(_cc.p, Math.max(0, (_u - 0.7) / 0.3));
        } else if (_sg === 1) {
          _t.copy(_cc.p);
        } else {
          _t.copy(_cc.p).lerp(_cc.v, Math.min(1, _u / 0.25));
        }
      } else {
        _f = (_f + _dt * (_kd === 'sig' ? 0.045 : 0.02)) % 1;
        _ph[_j] = _f;
        let _cur = _cs[0];
        if (!_cur) {
          continue;
        }
        _pt = _cur.getPointAt(_f);
        _s = _f > 0.93 ? (1 - _f) / 0.07 : _f < 0.03 ? _f / 0.03 : 1;
        if (_kd === 'sig') {
          _t.copy(_cc[_cols[_ri]]);
        } else {
          _t.copy(_cc.f).lerp(_cc.w, _f > 0.8 ? (_f - 0.8) / 0.2 : 0);
        }
      }
      _dm.position.copy(_pt);
      _dm.scale.setScalar(Math.max(_s, 0.001));
      _dm.updateMatrix();
      _m.setMatrixAt(_j, _dm.matrix);
      _m.setColorAt(_j, _t);
    }
    _m.instanceMatrix.needsUpdate = true;
    if (_m.instanceColor) {
      _m.instanceColor.needsUpdate = true;
    }
    _inv();
  });
  return (
    <instancedMesh
      ref={_ref}
      args={[_geo, _mat, _n]}
      renderOrder={10}
      frustumCulled={false}
      raycast={() => undefined}
    />
  );
}

export function ParticleStream({ arrs: _a, rad: _rd, c1: _c1, c2: _c2, per: _pe, sp: _sp, op: _op, pulse: _pu }) {
  let _tm = useRef(0);
  let _gt = useRef(0);
  let { invalidate: _inv } = useThree();
  let _geo = useMemo(() => {
    let _g = [];
    for (let _q of _a) {
      let _pts = [];
      for (let _j = 0; _j + 2 < _q.length; _j += 3) {
        _pts.push(new Vector3(_q[_j] / 10000, _q[_j + 1] / 10000, _q[_j + 2] / 10000));
      }
      if (_pts.length < 2) {
        continue;
      }
      let _cu = new CatmullRomCurve3(_pts, false, 'centripetal');
      let _ln = _cu.getLength();
      let _t = new TubeGeometry(_cu, Math.max(8, Math.round(_pts.length * 1.5)), _rd, 6, false);
      let _uv = _t.attributes.uv;
      for (let _i = 0; _i < _uv.count; _i++) {
        _uv.setX(_i, _uv.getX(_i) * _ln);
      }
      _g.push(_t);
    }
    if (_g.length) {
      return mergeGeometries(_g, false);
    } else {
      return null;
    }
  }, [_a, _rd]);
  let _mat = useMemo(() => {
    let _m = new MeshBasicMaterial({
      color: 16777215,
      transparent: true,
      opacity: _op,
      depthTest: false,
      depthWrite: false,
    });
    let _C = _m.color.constructor;
    let _u = {
      uT: {
        value: 0,
      },
      uP: {
        value: _pe,
      },
      uC1: {
        value: new _C(_c1),
      },
      uC2: {
        value: new _C(_c2),
      },
    };
    _m.userData.u = _u;
    _m.onBeforeCompile = (_s) => {
      Object.assign(_s.uniforms, _u);
      _s.vertexShader = _s.vertexShader
        .replace('void main() {', 'varying float vS;varying float vV;\nvoid main() {')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvS=uv.x;vV=uv.y;');
      _s.fragmentShader = _s.fragmentShader
        .replace(
          'void main() {',
          'uniform float uT;uniform float uP;uniform vec3 uC1;uniform vec3 uC2;varying float vS;varying float vV;\nvoid main() {',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\nfloat _ph=fract(vS/uP-uT);float _b=smoothstep(0.0,0.55,_ph)*(1.0-smoothstep(0.55,1.0,_ph));float _e=0.55+0.45*abs(sin(vV*6.2831853));diffuseColor.rgb=mix(uC1,uC2,_b)*(0.6+0.5*_e);diffuseColor.a*=0.45+0.55*_b;',
        );
    };
    return _m;
  }, [_op, _pe, _c1, _c2]);
  useEffect(
    () => () => {
      if (_geo) {
        _geo.dispose();
      }
      _mat.dispose();
    },
    [_geo, _mat],
  );
  useFrame((_e, _dt) => {
    _dt = Math.min(_dt, 0.1);
    _gt.current += _dt;
    let _pl = _pu ? 1 + Math.pow(Math.max(0, Math.sin(_gt.current * 7.5)), 2) * 1.6 : 1;
    _tm.current = (_tm.current + _dt * _sp * _pl) % 1000;
    _mat.userData.u.uT.value = _tm.current;
    _inv();
  });
  if (_geo) {
    return <mesh geometry={_geo} material={_mat} renderOrder={9} frustumCulled={false} raycast={() => undefined} />;
  } else {
    return null;
  }
}

export function LungAirflow() {
  let _g = useViewFlags();
  let [_d, _sd] = useState(globalThis.__lfc ?? null);
  let _gr = useRef(null);
  let _ref = useRef(null);
  let { invalidate: _inv } = useThree();
  useEffect(() => {
    if (_g.airflow && !_d) {
      fetch('./models/lung-flow.json')
        .then((_r) => _r.json())
        .then((_j) => {
          globalThis.__lfc = _j;
          _sd(_j);
        })
        .catch(() => {});
    }
  }, [_g.airflow, _d]);
  let _per = 7;
  let _cv = useMemo(
    () =>
      _d
        ? _d.air.map((_a) => {
            let _pts = [];
            for (let _j = 0; _j + 2 < _a.length; _j += 3) {
              _pts.push(new Vector3(_a[_j] / 10000, _a[_j + 1] / 10000, _a[_j + 2] / 10000));
            }
            if (_pts.length > 1) {
              return new CatmullRomCurve3(_pts, false, 'centripetal');
            } else {
              return null;
            }
          })
        : [],
    [_d],
  );
  let _n = _cv.length * _per;
  let _ph = useMemo(
    () =>
      Float32Array.from(
        {
          length: _n,
        },
        (_u, _j) => (_j % _per) / _per + Math.random() * 0.05,
      ),
    [_n],
  );
  let _geo = useMemo(() => new SphereGeometry(0.0015, 6, 5), []);
  let _mat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 16777215,
        depthTest: false,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );
  let _dm = useMemo(() => new Object3D(), []);
  let _cc = useMemo(() => {
    let _C = _mat.color.constructor;
    return {
      a: new _C('#c8ecff'),
      b: new _C('#ffb48c'),
    };
  }, [_mat]);
  useFrame((_e, _dt) => {
    let _gp = _gr.current;
    if (!_gp || !_d) {
      return;
    }
    _dt = Math.min(_dt, 0.1);
    let _tt = performance.now() / 1000;
    let _vs = Math.sin((_tt * Math.PI * 2) / 4);
    let _dir = _vs >= 0 ? 1 : -1;
    let _sp = 0.06 + Math.abs(_vs) * 0.28;
    if (_g.breathe) {
      let _b = 0.5 - Math.cos((_tt * Math.PI * 2) / 4) * 0.5;
      let _sx = 1 + _b * 0.03;
      let _sy = 1 + _b * 0.075;
      let _sz = 1 + _b * 0.045;
      _gp.scale.set(_sx, _sy, _sz);
      _gp.position.set(0, (1 - _sy) * 1.425, (1 - _sz) * 0.015);
    } else {
      _gp.scale.set(1, 1, 1);
      _gp.position.set(0, 0, 0);
    }
    let _m = _ref.current;
    if (!_m) {
      return;
    }
    _mat.color.copy(_vs >= 0 ? _cc.a : _cc.b);
    for (let _j = 0; _j < _n; _j++) {
      let _cu = _cv[Math.floor(_j / _per)];
      if (!_cu) {
        continue;
      }
      let _f = (_ph[_j] + _dir * _dt * _sp + 1) % 1;
      _ph[_j] = _f;
      let _s = _f < 0.06 ? _f / 0.06 : _f > 0.94 ? (1 - _f) / 0.06 : 1;
      _dm.position.copy(_cu.getPointAt(_f));
      _dm.scale.setScalar(Math.max(_s, 0.001));
      _dm.updateMatrix();
      _m.setMatrixAt(_j, _dm.matrix);
    }
    _m.instanceMatrix.needsUpdate = true;
    _inv();
  });
  if (_g.airflow && !_g.pop && !_g.dia && _d && _n > 0) {
    return (
      <group ref={_gr}>
        <instancedMesh
          ref={_ref}
          args={[_geo, _mat, _n]}
          renderOrder={10}
          frustumCulled={false}
          raycast={() => undefined}
        />
      </group>
    );
  } else {
    return null;
  }
}

export function AirDots({ routes: _r, per: _per, speed: _sp, rad: _rd, c1: _c1, c2: _c2, mode: _mo }) {
  let _ref = useRef(null);
  let _n = _r.length * _per;
  let { invalidate: _inv } = useThree();
  let _cv = useMemo(
    () =>
      _r.map((_a) => {
        let _pts = [];
        for (let _j = 0; _j + 2 < _a.length; _j += 3) {
          _pts.push(new Vector3(_a[_j] / 10000, _a[_j + 1] / 10000, _a[_j + 2] / 10000));
        }
        if (_pts.length > 1) {
          return new CatmullRomCurve3(_pts, false, 'centripetal');
        } else {
          return null;
        }
      }),
    [_r],
  );
  let _ph = useMemo(
    () =>
      Float32Array.from(
        {
          length: _n,
        },
        (_u, _j) => (_j % _per) / _per + Math.random() * 0.08,
      ),
    [_n, _per],
  );
  let _geo = useMemo(() => new SphereGeometry(_rd, 8, 6), [_rd]);
  let _mat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 16777215,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );
  let _dm = useMemo(() => new Object3D(), []);
  let _cc = useMemo(() => {
    let _C = _mat.color.constructor;
    return {
      a: new _C(_c1),
      b: new _C(_c2),
      t: new _C(),
    };
  }, [_mat, _c1, _c2]);
  useFrame((_e, _dt) => {
    let _m = _ref.current;
    if (!_m) {
      return;
    }
    _dt = Math.min(_dt, 0.1);
    let _tt = performance.now() / 1000;
    let _vs = Math.sin((_tt * Math.PI * 2) / 4);
    let _dir = _mo === 'air' ? (_vs >= 0 ? 1 : -1) : 1;
    let _spd = _mo === 'air' ? _sp * (0.2 + Math.abs(_vs)) : _sp;
    for (let _j = 0; _j < _n; _j++) {
      let _cu = _cv[Math.floor(_j / _per)];
      if (!_cu) {
        continue;
      }
      let _f = (_ph[_j] + _dir * _dt * _spd + 1) % 1;
      _ph[_j] = _f;
      let _s = _f < 0.08 ? _f / 0.08 : _f > 0.92 ? (1 - _f) / 0.08 : 1;
      _dm.position.copy(_cu.getPointAt(_f));
      _dm.scale.setScalar(Math.max(_s, 0.001));
      _dm.updateMatrix();
      _m.setMatrixAt(_j, _dm.matrix);
      _cc.t.copy(_cc.a).lerp(_cc.b, _f);
      _m.setColorAt(_j, _cc.t);
    }
    _m.instanceMatrix.needsUpdate = true;
    if (_m.instanceColor) {
      _m.instanceColor.needsUpdate = true;
    }
    _inv();
  });
  return (
    <instancedMesh
      ref={_ref}
      args={[_geo, _mat, _n]}
      renderOrder={10}
      frustumCulled={false}
      raycast={() => undefined}
    />
  );
}

export function AlveolarFlow() {
  let [_d, _sd] = useState(globalThis.__alf ?? null);
  useEffect(() => {
    if (!_d) {
      fetch('./models/alveoli-flow.json')
        .then((_r) => _r.json())
        .then((_j) => {
          globalThis.__alf = _j;
          _sd(_j);
        })
        .catch(() => {});
    }
  }, [_d]);
  if (_d) {
    return (
      <group position={_d.off}>
        <AirDots routes={_d.rbc} per={4} speed={0.07} rad={0.0032} c1="#5a62dc" c2="#ff3d3d" />
        <AirDots routes={_d.art} per={12} speed={0.09} rad={0.0042} c1="#5a62dc" c2="#6f67e0" />
        <AirDots routes={_d.ven} per={14} speed={0.09} rad={0.0046} c1="#ff4a3f" c2="#ff4a3f" />
        <AirDots routes={_d.o2} per={1} speed={0.3} rad={0.0017} c1="#8defff" c2="#8defff" />
        <AirDots routes={_d.co2} per={1} speed={0.3} rad={0.0017} c1="#ffb259" c2="#ffb259" />
        <AirDots routes={_d.air} per={8} speed={0.5} rad={0.003} c1="#dff3ff" c2="#dff3ff" mode="air" />
      </group>
    );
  } else {
    return null;
  }
}
