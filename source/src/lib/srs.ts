// @ts-nocheck

export var GRADE_DAYS = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export var DAY_MS = 86400000;

export function initialSrs(e, t = Date.now()) {
  return {
    cardId: e,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: t,
    history: [],
  };
}

export function gradeCard(e, t, n = Date.now()) {
  let r = GRADE_DAYS[t];
  let { ease: i, intervalDays: a, repetitions: o } = e;
  if (r < 3) {
    o = 0;
    a = 1;
  } else {
    o += 1;
    a = o === 1 ? 1 : o === 2 ? 6 : Math.round(a * i);
  }
  i = Math.max(1.3, i + (0.1 - (5 - r) * (0.08 + (5 - r) * 0.02)));
  return {
    ...e,
    ease: Math.round(i * 100) / 100,
    intervalDays: a,
    repetitions: o,
    dueAt: n + a * DAY_MS,
    lastReviewedAt: n,
    difficult: t === 'hard' || t === 'again' || (t !== 'easy' && e.difficult),
    history: [
      ...e.history,
      {
        at: n,
        grade: t,
      },
    ].slice(-50),
  };
}

export function isDue(e, t = Date.now()) {
  return e.dueAt <= t;
}
