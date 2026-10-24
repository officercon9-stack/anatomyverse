// @ts-nocheck
import { structuresInModel, modelById, SCHEMATIC_MODEL_ID as DEFAULT_MODEL_ID, structures } from '../data';
import { LESSONS } from '../data/lessons';
import { QUESTIONS } from '../data/questions';

export function systemContent(e) {
  let t = structuresInModel(modelById[DEFAULT_MODEL_ID]);
  let n = structures.filter((t) => t.system === e || t.secondarySystems?.includes(e));
  return {
    all: n,
    with3D: n.filter((e) => t.has(e.id) || (e.childIds ?? []).some((e) => t.has(e))),
    lessons: LESSONS.filter((t) => t.system === e),
    questions: QUESTIONS.filter((t) => t.topic === e),
  };
}

export function completeness(e) {
  if (e.with3D.length >= 5 && e.questions.length >= 3) {
    return {
      label: 'Core content available',
      tone: 'av-badge--ok',
    };
  } else if (e.with3D.length > 0 || e.all.length >= 3) {
    return {
      label: 'Partial',
      tone: 'av-badge--warn',
    };
  } else {
    return {
      label: 'Introductory text only',
      tone: '',
    };
  }
}
