// @ts-nocheck
import { systemById } from '../data/systems';
import { REFERENCES } from '../data/references';

export function normalizeText(e) {
  return e
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/[-\s]+/g, ' ')
    .trim();
}

export function editDistance(e, t, n = 3) {
  if (Math.abs(e.length - t.length) > n) {
    return n + 1;
  }
  let r = Array(t.length + 1)
    .fill(0)
    .map((e, t) => t);
  for (let i = 1; i <= e.length; i++) {
    let a = Infinity;
    let o = r[0];
    r[0] = i;
    for (let n = 1; n <= t.length; n++) {
      let s = r[n];
      r[n] = Math.min(r[n] + 1, r[n - 1] + 1, o + (e[i - 1] === t[n - 1] ? 0 : 1));
      o = s;
      a = Math.min(a, r[n]);
    }
    if (a > n) {
      return n + 1;
    }
  }
  return r[t.length];
}

export function scoreEntry(e, t) {
  let n = normalizeText(t);
  if (!n) {
    return 0;
  }
  if (n === e) {
    return 100;
  }
  if (n.startsWith(e)) {
    return 85;
  }
  let r = n.split(' ');
  if (r.some((t) => t.startsWith(e))) {
    return 70;
  }
  if (n.includes(e)) {
    return 55;
  }
  let i = e.split(' ');
  if (i.length > 1 && i.every((e) => r.some((t) => t.startsWith(e)))) {
    return 60;
  }
  if (e.length >= 4) {
    let t = e.length >= 7 ? 2 : 1;
    if (editDistance(e, n, t) <= t) {
      return 45;
    }
    if (i.length === 1 && r.some((n) => n.length >= 4 && editDistance(e, n, t) <= t)) {
      return 40;
    }
  }
  return 0;
}

export function searchStructures(e, t, n = 12) {
  let r = normalizeText(e);
  if (!r) {
    return [];
  }
  let i = [];
  for (let e of t) {
    let t = [
      ['name', e.name, 1],
      ...(e.synonyms ?? []).map((e) => ['synonym', e, 0.92]),
      ...(e.latinName ? [['latin', e.latinName, 0.9]] : []),
      ['system', systemById[e.system]?.name ?? e.system, 0.5],
      ['region', e.region.replace('-', ' '), 0.45],
      ...(() => {
        let t = REFERENCES[e.id];
        if (t) {
          return [t.la, t.fr, t.es, t.pt, t.it, t.fa].filter(Boolean).map((e) => ['translation', e, 0.88]);
        } else {
          return [];
        }
      })(),
    ];
    let n = null;
    for (let [i, a, o] of t) {
      let t = scoreEntry(r, a) * o;
      if (t > 0 && (!n || t > n.score)) {
        n = {
          structure: e,
          score: t,
          matchedOn: i,
          matchedText: a,
        };
      }
    }
    if (!n && r.length >= 4 && normalizeText(e.description).includes(r)) {
      n = {
        structure: e,
        score: 20,
        matchedOn: 'description',
        matchedText: e.description,
      };
    }
    if (n) {
      i.push(n);
    }
  }
  return i.sort((e, t) => t.score - e.score || e.structure.name.localeCompare(t.structure.name)).slice(0, n);
}

export var SEARCH_SUGGESTIONS = [
  'Femur',
  'Brachial plexus',
  'Left ventricle',
  'Cerebellum',
  'Diaphragm',
  'Femoral artery',
];
