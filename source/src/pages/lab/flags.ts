// @ts-nocheck
import { useSyncExternalStore } from 'react';

export var avFlags = (globalThis.__avb ??= (() => {
  let _s = {
    vessels: false,
    flow: false,
    csf: false,
    csfFlow: false,
    fossae: false,
    tracts: false,
    sig: true,
    mening: false,
    breathe: true,
    airflow: true,
    inside: false,
    pop: null,
    dia: false,
    nv: false,
    ld_org: false,
    ld_brain: false,
    ld_limb: false,
    ld_lung: false,
    ld_sup: false,
  };
  let _l = new Set();
  return {
    get: () => _s,
    set: (_p) => {
      _s = {
        ..._s,
        ..._p,
      };
      _l.forEach((_f) => _f());
    },
    sub: (_f) => {
      _l.add(_f);
      return () => _l.delete(_f);
    },
  };
})());

export function useAvFlags() {
  return useSyncExternalStore(avFlags.sub, avFlags.get);
}
