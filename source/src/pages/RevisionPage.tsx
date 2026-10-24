// @ts-nocheck
import { useProgressStore } from '../store/progress';
import { useState, useMemo } from 'react';
import { newCardSet, cardsForMistake } from '../lib/flashcards';
import { getStructure, structures } from '../data';
import { Eye, Plus, Zap, Trash } from 'lucide-react';
import { SYSTEMS } from '../data/systems';
import { isDue } from '../lib/srs';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { Link } from 'react-router-dom';

export var GRADES = [
  {
    g: 'again',
    label: 'Again',
    hint: 'Forgot — review tomorrow',
  },
  {
    g: 'hard',
    label: 'Difficult',
    hint: 'Mark as difficult',
  },
  {
    g: 'good',
    label: 'Good',
    hint: 'Recalled',
  },
  {
    g: 'easy',
    label: 'Learned',
    hint: 'Mark as learned — longest interval',
  },
];

export function FlashcardReview({ queue: e, onExit: t }) {
  let n = useProgressStore((e) => e.gradeFlashcard);
  let [r, i] = useState(0);
  let [a, s] = useState(false);
  let [c, l] = useState([]);
  let u = [...e, ...c];
  let d = u[r];
  let f = d ? newCardSet(d) : null;
  if (!f) {
    return (
      <div className="av-card p-6 text-center">
        <p className="mb-1 text-lg font-semibold">Session complete</p>
        <p className="mb-4 text-sm text-[var(--av-text-muted)]">
          {'You reviewed '}
          {u.length}
          {' card'}
          {u.length === 1 ? '' : 's'}. They are rescheduled with spaced repetition.
        </p>
        <button type="button" className="av-btn av-btn--primary" onClick={t}>
          Back to deck
        </button>
      </div>
    );
  }
  let p = (e) => {
    n(d, e);
    if (e === 'again') {
      l((e) => [...e, d]);
    }
    s(false);
    i(r + 1);
  };
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-[var(--av-text-muted)]">
        {'Card '}
        {r + 1}
        {' of '}
        {u.length}
        {' · '}
        {getStructure(f.structureId)?.name}
      </p>
      <section className="av-card flex min-h-[16rem] flex-col justify-center gap-4 p-6" aria-live="polite">
        <p className="av-section-title">Question</p>
        <p className="text-lg leading-relaxed">{f.front}</p>
        {a && (
          <>
            <hr className="border-[var(--av-border)]" />
            <p className="av-section-title">Answer</p>
            <p className="text-base leading-relaxed text-[var(--av-text)]">{f.back}</p>
          </>
        )}
      </section>
      {a ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you recall it?">
          {GRADES.map(({ g: e, label: t, hint: n }) => (
            <button key={e} type="button" className="av-btn flex-col gap-0 py-2" onClick={() => p(e)} title={n}>
              <span>{t}</span>
              <span className="text-[10px] font-normal text-[var(--av-text-faint)]">{n}</span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="av-btn av-btn--primary self-center" onClick={() => s(true)} autoFocus>
          <Eye size={16} aria-hidden />
          {' Reveal answer'}
        </button>
      )}
      <button type="button" className="av-btn av-btn--ghost self-center" onClick={t}>
        End session
      </button>
    </div>
  );
}

export function FlashcardAdd() {
  let [e, t] = useState('');
  let { flashcards: n, addFlashcards: r } = useProgressStore();
  let i = structures.filter((t) => !e || t.system === e);
  return (
    <section className="av-card p-5" aria-labelledby="add-title">
      <h2 id="add-title" className="mb-3 font-semibold">
        Add cards from structures
      </h2>
      <label htmlFor="add-system" className="av-label-text">
        Filter by system
      </label>
      <select id="add-system" className="av-input mb-3" value={e} onChange={(e) => t(e.target.value)}>
        <option value="">All systems</option>
        {SYSTEMS.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
      <ul className="max-h-72 overflow-y-auto">
        {i.map((e) => {
          let t = cardsForMistake(e);
          let i = t.filter((e) => !n[e.id]);
          return (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 border-b border-[var(--av-border)] py-2 text-sm last:border-0"
            >
              <span>
                {e.name}{' '}
                <span className="text-xs text-[var(--av-text-faint)]">
                  {'· '}
                  {t.length}
                  {' cards'}
                </span>
              </span>
              <button
                type="button"
                className="av-btn av-btn--sm"
                disabled={!i.length}
                onClick={() => r(i.map((e) => e.id))}
              >
                {i.length ? (
                  <>
                    <Plus size={13} aria-hidden />
                    {' Add'}
                  </>
                ) : (
                  'Added'
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-[var(--av-text-faint)]">
        Cards are generated only from fields present in each record: names, functions, attachments, nerve and blood
        supply, relationships and clinical correlations.
      </p>
    </section>
  );
}

export function RevisionPage() {
  let { flashcards: e, removeFlashcard: t } = useProgressStore();
  let [n, r] = useState(null);
  let i = Object.values(e);
  let a = useMemo(
    () =>
      i
        .filter((e) => isDue(e))
        .sort((e, t) => e.dueAt - t.dueAt)
        .map((e) => e.cardId),
    [i],
  );
  let o = i.filter((e) => e.difficult).map((e) => e.cardId);
  if (n) {
    return (
      <PageContainer>
        <FlashcardReview queue={n} onExit={() => r(null)} />
      </PageContainer>
    );
  } else {
    return (
      <PageContainer wide>
        <PageHeader kicker="Revision" title="Flashcards">
          Spaced repetition (a documented SM-2 variant): cards you find hard come back sooner; cards you know well are
          spaced further apart.
        </PageHeader>
        <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
          <div className="flex flex-col gap-4">
            <section className="av-card flex flex-wrap items-center gap-4 p-5">
              <div className="flex-1">
                <p className="text-3xl font-semibold tabular-nums">{a.length}</p>
                <p className="text-sm text-[var(--av-text-muted)]">
                  {'due now · '}
                  {i.length}
                  {' in deck · '}
                  {o.length}
                  {' marked difficult'}
                </p>
              </div>
              <button type="button" className="av-btn av-btn--primary" disabled={!a.length} onClick={() => r(a)}>
                <Zap size={15} aria-hidden />
                {' Study due cards'}
              </button>
              <button type="button" className="av-btn" disabled={!o.length} onClick={() => r(o)}>
                Review difficult
              </button>
            </section>
            <section className="av-card p-5" aria-labelledby="deck-title">
              <h2 id="deck-title" className="mb-3 font-semibold">
                Your deck
              </h2>
              {i.length === 0 ? (
                <p className="text-sm text-[var(--av-text-muted)]">
                  {'No cards yet. Add cards here, from a structure’s panel in the '}
                  <Link to="/app/lab" className="underline">
                    lab
                  </Link>
                  , or from incorrect quiz answers.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-[var(--av-text-faint)]">
                      <tr>
                        <th className="py-2 pr-2 font-medium">Card</th>
                        <th className="pr-2 font-medium">Next review</th>
                        <th className="pr-2 font-medium">Reviews</th>
                        <th className="sr-only">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {i
                        .sort((e, t) => e.dueAt - t.dueAt)
                        .map((e) => {
                          let n = newCardSet(e.cardId);
                          return (
                            <tr key={e.cardId} className="border-t border-[var(--av-border)]">
                              <td className="py-2 pr-2">
                                <span className="line-clamp-1">{n?.front ?? e.cardId}</span>
                                {e.difficult && <span className="av-badge av-badge--warn mt-0.5">difficult</span>}
                              </td>
                              <td className="whitespace-nowrap pr-2 text-[var(--av-text-muted)]">
                                {isDue(e) ? 'Due now' : new Date(e.dueAt).toLocaleDateString()}
                              </td>
                              <td className="pr-2 tabular-nums text-[var(--av-text-muted)]">{e.history.length}</td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  className="av-btn av-btn--ghost av-btn--sm"
                                  aria-label={`Remove card: ${n?.front ?? e.cardId}`}
                                  onClick={() => t(e.cardId)}
                                >
                                  <Trash size={14} aria-hidden />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
          <FlashcardAdd />
        </div>
      </PageContainer>
    );
  }
}
