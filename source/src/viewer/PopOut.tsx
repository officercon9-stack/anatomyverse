// @ts-nocheck
import { viewFlags, useViewFlags } from './viewFlags';
import { Vector3 } from 'three';
import { isWithin } from '../store/visibility';
import { structureById } from '../data';

export function togglePopOut(e, t) {
  let _s = viewFlags.get();
  if (_s.pop) {
    viewFlags.set({
      pop: null,
    });
    return;
  }
  let _root = e.object;
  while (_root.parent) {
    _root = _root.parent;
  }
  let _mn = [1000000000, 1000000000, 1000000000];
  let _mx = [-1000000000, -1000000000, -1000000000];
  let _v = new Vector3();
  _root.traverse((_o) => {
    let _sid = _o.userData && _o.userData.structureId;
    if (!_o.isMesh || !_sid || !_o.visible || !isWithin(_sid, t, structureById)) {
      return;
    }
    let _g = _o.geometry;
    if (!_g.boundingBox) {
      _g.computeBoundingBox();
    }
    let _b = _g.boundingBox;
    _o.updateWorldMatrix(true, false);
    for (let _i = 0; _i < 8; _i++) {
      _v.set(_i & 1 ? _b.max.x : _b.min.x, _i & 2 ? _b.max.y : _b.min.y, _i & 4 ? _b.max.z : _b.min.z).applyMatrix4(
        _o.matrixWorld,
      );
      let _q = [_v.x, _v.y, _v.z];
      for (let _a = 0; _a < 3; _a++) {
        if (_q[_a] < _mn[_a]) {
          _mn[_a] = _q[_a];
        }
        if (_q[_a] > _mx[_a]) {
          _mx[_a] = _q[_a];
        }
      }
    }
  });
  if (_mn[0] > 100000000) {
    return;
  }
  let _c = _mn.map((_q, _a) => (_q + _mx[_a]) / 2);
  let _cp = e.camera.position;
  let _d = [_cp.x - _c[0], _cp.y - _c[1], _cp.z - _c[2]];
  let _L = Math.hypot(_d[0], _d[1], _d[2]) || 1;
  _d = _d.map((_q) => _q / _L);
  viewFlags.set({
    pop: {
      id: t,
      c: _c,
      d: _d,
      dist: _L * 0.4,
    },
  });
}

export function PopOutHud() {
  let _g = useViewFlags();
  if (_g.pop) {
    return (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 64,
          transform: 'translateX(-50%)',
          zIndex: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '8px 14px',
          borderRadius: 999,
          background: 'var(--av-surface)',
          border: '1px solid var(--av-border)',
          color: 'var(--av-text)',
          fontSize: 12,
          boxShadow: '0 6px 20px rgba(0,0,0,.35)',
        }}
      >
        <span>
          {'Showing: '}
          <b>{structureById[_g.pop.id]?.name ?? _g.pop.id}</b>
          {' - double-click it again to put it back'}
        </span>
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() =>
            viewFlags.set({
              pop: null,
            })
          }
        >
          Put back
        </button>
      </div>
    );
  } else {
    return null;
  }
}
