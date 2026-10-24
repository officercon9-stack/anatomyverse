// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from '../lib/persist';
import { syncToServer, api } from '../lib/api';
import { initialSrs, gradeCard } from '../lib/srs';

export var todayKey = (e = new Date()) =>
  `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`;

export var initialProgress = {
  bookmarks: [],
  revision: [],
  recent: [],
  lessons: {},
  quizAttempts: [],
  flashcards: {},
  activity: {},
};

export var useProgressStore = create()(
  persist(
    (e, t) => {
      let n = (e, n, r) => {
        if (t().syncEnabled) {
          syncToServer(e, n, r);
        }
      };
      let r = (e, t = 1) => ({
        activity: {
          ...e.activity,
          [todayKey()]: (e.activity[todayKey()] ?? 0) + t,
        },
      });
      return {
        ...initialProgress,
        onboarded: false,
        syncEnabled: false,
        toggleBookmark: (r) => {
          let i = !t().bookmarks.includes(r);
          e((e) => ({
            bookmarks: i ? [...e.bookmarks, r] : e.bookmarks.filter((e) => e !== r),
          }));
          n(`/progress/bookmarks/${encodeURIComponent(r)}`, i ? 'PUT' : 'DELETE');
        },
        toggleRevision: (r) => {
          let i = !t().revision.includes(r);
          e((e) => ({
            revision: i ? [...e.revision, r] : e.revision.filter((e) => e !== r),
          }));
          n(`/progress/revision/${encodeURIComponent(r)}`, i ? 'PUT' : 'DELETE');
        },
        addRecent: (t) => {
          e((e) => ({
            recent: [
              {
                id: t,
                at: Date.now(),
              },
              ...e.recent.filter((e) => e.id !== t),
            ].slice(0, 20),
            ...r(e),
          }));
          n(`/progress/recent/${encodeURIComponent(t)}`, 'POST');
        },
        updateLesson: (i, a) => {
          let o = {
            ...(t().lessons[i] ?? {
              stepIndex: 0,
              completedSteps: [],
              completed: false,
              updatedAt: 0,
            }),
            ...a,
            updatedAt: Date.now(),
          };
          e((e) => ({
            lessons: {
              ...e.lessons,
              [i]: o,
            },
            ...r(e),
          }));
          n(`/progress/lessons/${encodeURIComponent(i)}`, 'PUT', o);
        },
        recordQuizAttempt: (t) => {
          e((e) => ({
            quizAttempts: [t, ...e.quizAttempts].slice(0, 100),
            ...r(e, t.total),
          }));
          n('/progress/quiz-attempts', 'POST', t);
        },
        addFlashcards: (t) => {
          let r = Date.now();
          let i = [];
          e((e) => {
            let n = {
              ...e.flashcards,
            };
            for (let e of t) {
              if (!n[e]) {
                i.push((n[e] = initialSrs(e, r)));
              }
            }
            return {
              flashcards: n,
            };
          });
          for (let e of i) {
            n(`/progress/flashcards/${encodeURIComponent(e.cardId)}`, 'PUT', e);
          }
        },
        removeFlashcard: (t) => {
          e((e) => {
            let n = {
              ...e.flashcards,
            };
            delete n[t];
            return {
              flashcards: n,
            };
          });
          n(`/progress/flashcards/${encodeURIComponent(t)}`, 'DELETE');
        },
        gradeFlashcard: (i, a) => {
          let o = gradeCard(t().flashcards[i] ?? initialSrs(i), a);
          e((e) => ({
            flashcards: {
              ...e.flashcards,
              [i]: o,
            },
            ...r(e),
          }));
          n(`/progress/flashcards/${encodeURIComponent(i)}`, 'PUT', o);
        },
        logActivity: (t = 1) => e((e) => r(e, t)),
        setOnboarded: () =>
          e({
            onboarded: true,
          }),
        setSyncEnabled: (t) =>
          e({
            syncEnabled: t,
          }),
        replaceAll: (t) =>
          e({
            ...initialProgress,
            ...t,
          }),
        clearLocal: () =>
          e({
            ...initialProgress,
            onboarded: false,
          }),
      };
    },
    {
      name: 'anatomyverse.progress.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ syncEnabled: e, ...t }) => t,
    },
  ),
);

export function progressSnapshot(e) {
  let { bookmarks: t, revision: n, recent: r, lessons: i, quizAttempts: a, flashcards: o, activity: s } = e;
  return {
    bookmarks: t,
    revision: n,
    recent: r,
    lessons: i,
    quizAttempts: a,
    flashcards: o,
    activity: s,
  };
}

export async function importLocalProgress() {
  let e = await api('/progress/import', {
    method: 'POST',
    json: progressSnapshot(useProgressStore.getState()),
  });
  useProgressStore.getState().replaceAll(e);
  useProgressStore.getState().setSyncEnabled(true);
}
