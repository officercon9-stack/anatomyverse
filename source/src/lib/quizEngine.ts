// @ts-nocheck
import { normalizeText } from './search';

export var QUIZ_TYPES = ['identification', 'click-structure'];

export function shuffle(e, t = Math.random) {
  let n = [...e];
  for (let e = n.length - 1; e > 0; e--) {
    let r = Math.floor(t() * (e + 1));
    [n[e], n[r]] = [n[r], n[e]];
  }
  return n;
}

export function filterQuestions(e, t) {
  return e.filter(
    (e) =>
      (!t.topics?.length || t.topics.includes(e.topic)) &&
      (!t.difficulties?.length || t.difficulties.includes(e.difficulty)) &&
      (!t.types?.length || t.types.includes(e.type)) &&
      (!t.excludeViewerTypes || !QUIZ_TYPES.includes(e.type)),
  );
}

export function buildExam(e, t, n, r = Math.random) {
  return shuffle(filterQuestions(e, t), r).slice(0, Math.max(0, n));
}

export function isCorrect(e, t) {
  switch (e.type) {
    case 'multiple-choice':
    case 'true-false':
    case 'identification':
      return t.kind === 'choice' && t.optionId === e.correctOptionId;
    case 'fill-blank':
      return t.kind === 'text' && e.acceptedAnswers.some((e) => normalizeText(e) === normalizeText(t.text));
    case 'matching':
      return t.kind === 'matching' && e.pairs.every((e) => t.mapping[e.left] === e.right);
    case 'click-structure':
      return t.kind === 'structure' && t.structureId === e.targetStructureId;
  }
}

export function scoreExam(e, t) {
  let n = new Map(t.map((e) => [e.questionId, e]));
  let r = {};
  let i = 0;
  let a = [];
  for (let t of e) {
    let e = !!n.get(t.id)?.correct;
    r[t.topic] ??= {
      correct: 0,
      total: 0,
    };
    r[t.topic].total++;
    if (e) {
      i++;
      r[t.topic].correct++;
    } else {
      a.push(t.id);
    }
  }
  let o = e.length;
  return {
    total: o,
    correct: i,
    percent: o ? Math.round((i / o) * 100) : 0,
    byTopic: r,
    incorrectIds: a,
  };
}

export function correctAnswerText(e, t) {
  switch (e.type) {
    case 'multiple-choice':
    case 'true-false':
    case 'identification':
      return e.options.find((t) => t.id === e.correctOptionId)?.text ?? '';
    case 'fill-blank':
      return e.acceptedAnswers[0];
    case 'matching':
      return e.pairs.map((e) => `${e.left} → ${e.right}`).join('; ');
    case 'click-structure':
      return t(e.targetStructureId);
  }
}
