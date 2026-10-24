// @ts-nocheck
import { getStructure } from '../data';
import { useState, useMemo, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { shuffle, isCorrect, correctAnswerText } from '../lib/quizEngine';
import { systemById } from '../data/systems';
import { ReviewBadge } from './ReviewBadge';
import { CircleCheck, CircleX, MousePointerClick } from 'lucide-react';
import { SourceList } from './SourceList';

export var structureName = (e) => getStructure(e)?.name ?? e;

export function QuestionView({ question: e, mode: t, onAnswered: n, forceSubmitSignal: r, index: i, total: a }) {
  let [o, s] = useState(null);
  let [c, l] = useState('');
  let [u, d] = useState({});
  let [f, p] = useState(null);
  let [m] = useState(() => Date.now());
  let h = useViewerStore();
  let g = useMemo(() => (e.type === 'matching' ? shuffle(e.pairs.map((e) => e.right)) : []), [e]);
  let v = e.type === 'identification' || e.type === 'click-structure';
  useEffect(() => {
    if (!v) {
      return;
    }
    let t = useViewerStore.getState();
    t.setMode('identify');
    t.restoreVisibility();
    if (e.type === 'identification' && e.targetStructureId) {
      t.focusStructure(e.targetStructureId);
    }
    if (e.type === 'click-structure') {
      t.select(null);
      t.setView('anterior');
    }
    return () => useViewerStore.getState().setMode('explore');
  }, [e, v]);
  let y = () => {
    switch (e.type) {
      case 'fill-blank':
        return {
          kind: 'text',
          text: c,
        };
      case 'matching':
        return {
          kind: 'matching',
          mapping: u,
        };
      case 'click-structure':
        return {
          kind: 'structure',
          structureId: h.selectedId,
        };
      default:
        return {
          kind: 'choice',
          optionId: o ?? '',
        };
    }
  };
  let b =
    !f &&
    (e.type === 'fill-blank'
      ? c.trim().length > 0
      : e.type === 'matching'
        ? e.pairs.every((e) => u[e.left])
        : e.type === 'click-structure'
          ? !!h.selectedId
          : !!o);
  let x = () => {
    if (f) {
      return;
    }
    let r = y();
    let i = {
      questionId: e.id,
      response: r,
      correct: isCorrect(e, r),
      timeMs: Date.now() - m,
    };
    p(i);
    if (v && t === 'practice') {
      useViewerStore.getState().setMode('explore');
    }
    n?.(i);
  };
  useEffect(() => {
    if (r) {
      x();
    }
  }, [r]);
  let S = t === 'practice' && f;
  let C = !!f;
  return (
    <section className="av-card flex flex-col gap-4 p-5" aria-labelledby={`q-${e.id}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {i !== undefined && a !== undefined && (
          <span className="av-badge">
            {'Question '}
            {i + 1}
            {' of '}
            {a}
          </span>
        )}
        <span className="av-badge">{systemById[e.topic]?.name}</span>
        <span className="av-badge">{e.difficulty}</span>
        <ReviewBadge status={e.reviewStatus} />
      </div>
      <h3 id={`q-${e.id}`} className="text-base font-medium leading-relaxed">
        {e.prompt}
      </h3>
      {(e.type === 'multiple-choice' || e.type === 'true-false' || e.type === 'identification') && (
        <div role="radiogroup" aria-labelledby={`q-${e.id}`} className="flex flex-col gap-2">
          {e.options.map((t) => {
            let n = S ? (t.id === e.correctOptionId ? 'correct' : t.id === o ? 'incorrect' : undefined) : undefined;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={o === t.id}
                className="av-option"
                data-state={n}
                disabled={C}
                onClick={() => s(t.id)}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--av-border-strong)] text-xs font-semibold uppercase">
                  {t.id}
                </span>
                <span className="flex-1">{t.text}</span>
                {n === 'correct' && (
                  <CircleCheck size={18} className="text-[var(--av-ok)]" aria-label="Correct answer" />
                )}
                {n === 'incorrect' && (
                  <CircleX size={18} className="text-[var(--av-danger)]" aria-label="Your answer — incorrect" />
                )}
              </button>
            );
          })}
        </div>
      )}
      {e.type === 'fill-blank' && (
        <div>
          <label htmlFor={`fb-${e.id}`} className="av-label-text">
            Your answer
          </label>
          <input
            id={`fb-${e.id}`}
            className="av-input"
            value={c}
            disabled={C}
            autoComplete="off"
            onChange={(e) => l(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && b && x()}
          />
        </div>
      )}
      {e.type === 'matching' && (
        <div className="flex flex-col gap-2">
          {e.pairs.map((t) => {
            let n = S ? u[t.left] === t.right : undefined;
            return (
              <div key={t.left} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1.2fr]">
                <label htmlFor={`m-${e.id}-${t.left}`} className="text-sm font-medium">
                  {t.left}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id={`m-${e.id}-${t.left}`}
                    className="av-input"
                    disabled={C}
                    value={u[t.left] ?? ''}
                    onChange={(e) =>
                      d({
                        ...u,
                        [t.left]: e.target.value,
                      })
                    }
                  >
                    <option value="">Choose…</option>
                    {g.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                  {n === true && (
                    <CircleCheck size={18} className="shrink-0 text-[var(--av-ok)]" aria-label="Correct" />
                  )}
                  {n === false && (
                    <CircleX
                      size={18}
                      className="shrink-0 text-[var(--av-danger)]"
                      aria-label={`Incorrect; correct: ${t.right}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {e.type === 'click-structure' && (
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--av-border-strong)] p-3 text-sm text-[var(--av-text-muted)]">
          <MousePointerClick size={18} aria-hidden />
          {h.selectedId
            ? 'A structure is selected. Submit, or click a different one.'
            : 'Click a structure in the 3D viewer, then submit.'}
        </p>
      )}
      {!f && (
        <button type="button" className="av-btn av-btn--primary self-start" disabled={!b} onClick={x}>
          Submit answer
        </button>
      )}
      {f && t === 'exam' && (
        <p className="text-sm text-[var(--av-text-muted)]" role="status">
          Answer recorded.
        </p>
      )}
      {S && (
        <div
          className="rounded-xl border border-[var(--av-border)] bg-[var(--av-surface-2)] p-4"
          role="status"
          aria-live="polite"
        >
          <p
            className={`mb-1 flex items-center gap-2 font-semibold ${f.correct ? 'text-[var(--av-ok)]' : 'text-[var(--av-danger)]'}`}
          >
            {f.correct ? <CircleCheck size={18} aria-hidden /> : <CircleX size={18} aria-hidden />}
            {f.correct ? 'Correct' : 'Incorrect'}
          </p>
          {!f.correct && (
            <p className="mb-1 text-sm">
              {'Correct answer: '}
              <strong>{correctAnswerText(e, structureName)}</strong>
              {e.type === 'click-structure' && f.response.kind === 'structure' && f.response.structureId && (
                <>
                  {' (you selected '}
                  {structureName(f.response.structureId)})
                </>
              )}
            </p>
          )}
          <p className="text-sm leading-relaxed text-[var(--av-text-muted)]">{e.explanation}</p>
          <div className="mt-2">
            <SourceList sources={e.sources} />
          </div>
        </div>
      )}
    </section>
  );
}
