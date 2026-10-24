// @ts-nocheck
import { create } from 'zustand';
import { structureById, structures } from '../data';
import { api } from '../lib/api';

export var useContentStore = create(() => ({
  v: 0,
  source: 'bundled',
}));

export function mergeServerStructures(e) {
  let t = 0;
  for (let n of e) {
    let e = structureById[n.id];
    if (e) {
      Object.assign(e, n);
      t++;
    } else {
      structures.push(n);
      structureById[n.id] = n;
      t++;
    }
  }
  if (t) {
    useContentStore.setState((e) => ({
      v: e.v + 1,
      source: 'server',
    }));
  }
  return t;
}

export async function fetchServerContent() {
  try {
    let { structures: e } = await api('/content/structures');
    mergeServerStructures(e);
  } catch {}
}
