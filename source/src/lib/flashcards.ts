// @ts-nocheck
import { relationsOf } from '../data/relationships';
import { structureById } from '../data';

export var cardId = {
  function: (e) => `What is the function of the ${e.toLowerCase()}?`,
  innervation: (e) => `What is the nerve supply of ${e}?`,
  bloodSupply: (e) => `What is the blood supply of the ${e.toLowerCase()}?`,
  origin: (e) => `Where does ${e} originate?`,
  insertion: (e) => `Where does ${e} insert?`,
  actions: (e) => `What are the main actions of ${e}?`,
  clinicalRelevance: (e) => `Give a clinical correlation for the ${e.toLowerCase()}.`,
  location: (e) => `Where is the ${e.toLowerCase()} located?`,
};

export function cardsForStructure(e) {
  let t = [
    {
      id: `${e.id}:identity`,
      structureId: e.id,
      field: 'identity',
      front: `Name the structure: ${e.description}`,
      back: e.name,
    },
  ];
  Object.keys(cardId).forEach((n) => {
    let r = e[n];
    if (typeof r == 'string' && r.trim()) {
      t.push({
        id: `${e.id}:${n}`,
        structureId: e.id,
        field: n,
        front: cardId[n](e.name),
        back: r,
      });
    }
  });
  return t;
}

export function cardsForLesson(e) {
  let t = relationsOf(e.id);
  if (t.length) {
    return {
      id: `${e.id}:relationships`,
      structureId: e.id,
      field: 'relationships',
      front: `Name the key anatomical relationships of the ${e.name.toLowerCase()}.`,
      back: t
        .map((e) => `${e.label} ${structureById[e.otherId]?.name ?? e.otherId}${e.note ? ` (${e.note})` : ''}`)
        .join('; '),
    };
  } else {
    return null;
  }
}

export function cardsForMistake(e) {
  let t = cardsForLesson(e);
  if (t) {
    return [...cardsForStructure(e), t];
  } else {
    return cardsForStructure(e);
  }
}

export function newCardSet(e) {
  let [t] = e.split(':');
  let n = structureById[t];
  if (n) {
    return cardsForMistake(n).find((t) => t.id === e) ?? null;
  } else {
    return null;
  }
}
