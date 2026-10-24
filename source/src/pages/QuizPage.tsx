// @ts-nocheck
import { structures, getStructure, structureById, modelById } from '../data';
import { shuffle, filterQuestions, scoreExam, correctAnswerText, QUIZ_TYPES, buildExam } from '../lib/quizEngine';
import { useState, useEffect, useMemo } from 'react';
import { QUESTIONS } from '../data/questions';
import { SYSTEMS, systemById } from '../data/systems';
import { useProgressStore } from '../store/progress';
import { cardsForMistake } from '../lib/flashcards';
import { Zap, CircleX, CircleCheck, RotateCcw, Clock, Timer } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useViewerStore } from '../store/viewerStore';
import { AnatomyViewer } from '../viewer/AnatomyViewer';
import { QuestionView } from '../components/QuestionView';
import { PageContainer, PageHeader } from '../components/PageLayout';

export function build3DQuestions(e, t, n = Math.random) {
  let i = new Set(Object.values(e.objectMap));
  let a = structures.filter((e) => i.has(e.id) && e.layer !== 'skin');
  return shuffle(a, n)
    .slice(0, t)
    .map((e) => {
      let t = shuffle(
        a.filter((t) => t.id !== e.id),
        n,
      )
        .sort(
          (t, n) =>
            Number(n.system === e.system) - Number(t.system === e.system) ||
            Number(n.region === e.region) - Number(t.region === e.region),
        )
        .slice(0, 3);
      let r = shuffle([e, ...t], n).map((e, t) => ({
        id: String.fromCharCode(97 + t),
        text: e.name,
      }));
      return {
        id: `gen-id-${e.id}`,
        type: 'identification',
        prompt: 'Identify the highlighted structure.',
        topic: e.system,
        difficulty: 'foundation',
        targetStructureId: e.id,
        options: r,
        correctOptionId: r.find((t) => t.text === e.name).id,
        explanation: `${e.name}: ${e.description}`,
        learningObjective: 'Identify structures on a 3D model',
        relatedStructureIds: [e.id],
        sources: e.sources,
        reviewStatus: e.reviewStatus,
      };
    });
}

export var QUIZ_MODES = [
  {
    id: 'practice',
    title: 'Practice quiz',
    text: 'Immediate feedback and explanations after each answer.',
  },
  {
    id: 'identification',
    title: 'Identification practice',
    text: 'Name highlighted structures or click them on the 3D model.',
  },
  {
    id: 'exam',
    title: 'Examination mode',
    text: 'Randomised, optionally timed. Answers revealed only at the end.',
  },
];

export function QuizSetup({ initial: e, onStart: t }) {
  let [n, r] = useState(e);
  let i =
    n.mode === 'identification'
      ? null
      : filterQuestions(QUESTIONS, {
          topics: n.topics,
          difficulties: n.difficulties,
          excludeViewerTypes: !n.includeViewer,
        });
  let a = (e, t) => (e.includes(t) ? e.filter((e) => e !== t) : [...e, t]);
  let o = SYSTEMS.filter((e) => QUESTIONS.some((t) => t.topic === e.id));
  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="av-section-title mb-2">Mode</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUIZ_MODES.map((e) => (
            <button
              key={e.id}
              type="button"
              role="radio"
              aria-checked={n.mode === e.id}
              className="av-option flex-col items-start"
              onClick={() =>
                r({
                  ...n,
                  mode: e.id,
                })
              }
            >
              <span className="font-semibold">{e.title}</span>
              <span className="text-xs text-[var(--av-text-muted)]">{e.text}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {n.mode !== 'identification' && (
        <>
          <fieldset>
            <legend className="av-section-title mb-2">
              {'Topics '}
              {n.topics.length === 0 && <span className="normal-case tracking-normal">(all)</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {o.map((e) => (
                <label key={e.id} className="av-badge cursor-pointer gap-2 py-1.5">
                  <input
                    type="checkbox"
                    className="av-checkbox"
                    checked={n.topics.includes(e.id)}
                    onChange={() =>
                      r({
                        ...n,
                        topics: a(n.topics, e.id),
                      })
                    }
                  />
                  {e.name}{' '}
                  <span className="text-[var(--av-text-faint)]">
                    ({QUESTIONS.filter((t) => t.topic === e.id).length})
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="av-section-title mb-2">
              {'Difficulty '}
              {n.difficulties.length === 0 && <span className="normal-case tracking-normal">(all)</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {['foundation', 'intermediate', 'advanced'].map((e) => (
                <label key={e} className="av-badge cursor-pointer gap-2 py-1.5">
                  <input
                    type="checkbox"
                    className="av-checkbox"
                    checked={n.difficulties.includes(e)}
                    onChange={() =>
                      r({
                        ...n,
                        difficulties: a(n.difficulties, e),
                      })
                    }
                  />{' '}
                  {e}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="av-checkbox"
              checked={n.includeViewer}
              onChange={(e) =>
                r({
                  ...n,
                  includeViewer: e.target.checked,
                })
              }
            />
            Include questions that use the 3D model
          </label>
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="q-count" className="av-label-text">
            Number of questions
          </label>
          <input
            id="q-count"
            type="number"
            min={1}
            max={30}
            className="av-input"
            value={n.count}
            onChange={(e) =>
              r({
                ...n,
                count: Math.max(1, Math.min(30, Number(e.target.value) || 1)),
              })
            }
          />
          {i && (
            <p className="mt-1 text-xs text-[var(--av-text-faint)]">
              {i.length}
              {' matching question(s) available.'}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            className="av-checkbox"
            checked={n.timed}
            onChange={(e) =>
              r({
                ...n,
                timed: e.target.checked,
              })
            }
          />
          {n.mode === 'exam' ? 'Time limit (60 seconds per question)' : 'Timed (45 seconds per question)'}
        </label>
      </div>
      <div>
        <button
          type="button"
          className="av-btn av-btn--primary"
          disabled={i !== null && i.length === 0}
          onClick={() => t(n)}
        >
          {'Start '}
          {QUIZ_MODES.find((e) => e.id === n.mode).title.toLowerCase()}
        </button>
        {i !== null && i.length === 0 && (
          <p className="mt-2 text-sm text-[var(--av-warn)]">
            No questions match these filters. Remove a filter to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export function useCountdown(e, t, n) {
  let [r, i] = useState(e);
  useEffect(() => i(e), [e, t]);
  useEffect(() => {
    if (r === null) {
      return;
    }
    if (r <= 0) {
      n();
      return;
    }
    let e = setTimeout(() => i(r - 1), 1000);
    return () => clearTimeout(e);
  }, [r]);
  return r;
}

export function QuizSummary({ questions: e, answers: t, mode: n, onRestart: r }) {
  let a = scoreExam(e, t);
  let s = useProgressStore((e) => e.addFlashcards);
  let [l, d] = useState(false);
  let p = e.filter((e) => a.incorrectIds.includes(e.id));
  let h = (e) => getStructure(e)?.name ?? e;
  let _ = Array.from(new Set(p.flatMap((e) => e.relatedStructureIds))).flatMap((e) =>
    structureById[e] ? cardsForMistake(structureById[e]) : [],
  );
  return (
    <div className="flex flex-col gap-6">
      <section className="av-card p-6 text-center" aria-live="polite">
        <p className="av-kicker mb-1">{n === 'exam' ? 'Examination complete' : 'Session complete'}</p>
        <p className="text-5xl font-semibold tabular-nums" data-testid="quiz-score">
          {a.correct}/{a.total}
        </p>
        <p className="mt-1 text-lg text-[var(--av-text-muted)]">{a.percent}%</p>
      </section>
      <section className="av-card p-5">
        <h2 className="av-section-title mb-3">Performance by topic</h2>
        <ul className="flex flex-col gap-2">
          {Object.entries(a.byTopic).map(([e, t]) => (
            <li key={e} className="text-sm">
              <div className="mb-0.5 flex justify-between">
                <span>{systemById[e]?.name ?? e}</span>
                <span className="tabular-nums">
                  {t.correct}/{t.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--av-surface-2)]">
                <div
                  className="h-full bg-[var(--av-teal)]"
                  style={{
                    width: `${(t.correct / t.total) * 100}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
      {p.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="review-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="review-title" className="text-lg font-semibold">
              Review incorrect answers ({p.length})
            </h2>
            {_.length > 0 && (
              <button
                type="button"
                className="av-btn av-btn--sm"
                disabled={l}
                onClick={() => {
                  s(_.map((e) => e.id));
                  d(true);
                }}
              >
                <Zap size={14} aria-hidden /> {l ? 'Added to flashcards' : `Add ${_.length} related flashcards`}
              </button>
            )}
          </div>
          {p.map((e) => {
            let n = t.find((t) => t.questionId === e.id);
            let r = n
              ? n.response.kind === 'choice' && 'options' in e
                ? (e.options.find((e) => e.id === n.response.optionId)?.text ?? 'No answer')
                : n.response.kind === 'text'
                  ? n.response.text || 'No answer'
                  : n.response.kind === 'structure'
                    ? n.response.structureId
                      ? h(n.response.structureId)
                      : 'No selection'
                    : n.response.kind === 'matching'
                      ? Object.entries(n.response.mapping)
                          .map(([e, t]) => `${e} → ${t}`)
                          .join('; ') || 'No answer'
                      : ''
              : 'No answer (time expired)';
            return (
              <article key={e.id} className="av-card p-4 text-sm">
                <p className="mb-2 font-medium">{e.prompt}</p>
                <p className="flex items-start gap-1.5 text-[var(--av-danger)]">
                  <CircleX size={15} className="mt-0.5 shrink-0" aria-hidden />
                  {' Your answer: '}
                  {r}
                </p>
                <p className="flex items-start gap-1.5 text-[var(--av-ok)]">
                  <CircleCheck size={15} className="mt-0.5 shrink-0" aria-hidden />
                  {' Correct: '}
                  {correctAnswerText(e, h)}
                </p>
                <p className="mt-2 text-[var(--av-text-muted)]">{e.explanation}</p>
              </article>
            );
          })}
        </section>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="av-btn av-btn--primary" onClick={r}>
          <RotateCcw size={15} aria-hidden />
          {' New session'}
        </button>
        <Link to="/app/dashboard" className="av-btn">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export function QuizRunner({ config: e, onDone: t }) {
  let [n] = useSearchParams();
  let r = useViewerStore((e) => e.modelId);
  let i = useMemo(() => {
    if (e.mode === 'identification') {
      let t = filterQuestions(QUESTIONS, {
        types: QUIZ_TYPES,
      });
      let n = build3DQuestions(modelById[r], e.count);
      return buildExam([...t, ...n], {}, e.count);
    }
    let t = n.get('structure');
    let i = t ? QUESTIONS.filter((e) => e.relatedStructureIds.includes(t)) : QUESTIONS;
    return buildExam(
      i,
      {
        topics: e.topics,
        difficulties: e.difficulties,
        excludeViewerTypes: !e.includeViewer,
      },
      e.count,
    );
  }, []);
  let [a, o] = useState(0);
  let [c, u] = useState([]);
  let [d, m] = useState(0);
  let g = useMemo(() => Date.now(), []);
  let _ = useProgressStore((e) => e.recordQuizAttempt);
  let y = i[a];
  let x = c.some((e) => e.questionId === y?.id);
  let S = e.mode === 'exam';
  let w = i.some((e) => QUIZ_TYPES.includes(e.type));
  let E = (n) => {
    let r = scoreExam(i, n);
    _({
      id: crypto.randomUUID(),
      mode: e.mode,
      startedAt: g,
      finishedAt: Date.now(),
      total: r.total,
      correct: r.correct,
      byTopic: r.byTopic,
      answers: n,
    });
    t(i, n);
  };
  let A = useCountdown(S && e.timed ? i.length * 60 : null, 'exam', () => E(c));
  let j = useCountdown(!S && e.timed && !x ? 45 : null, a, () => m((e) => e + 1));
  useEffect(() => () => useViewerStore.getState().setMode('explore'), []);
  if (!y) {
    return <p className="text-sm">No questions available.</p>;
  }
  let I = S ? A : j;
  return (
    <div className={w ? 'grid gap-4 lg:grid-cols-[1fr_minmax(0,28rem)]' : ''}>
      {w && (
        <div className={`av-card overflow-hidden ${QUIZ_TYPES.includes(y.type) ? '' : 'opacity-60'}`}>
          <AnatomyViewer className="h-[52vh] min-h-[320px] w-full lg:h-[calc(100vh-12rem)]" />
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-sm text-[var(--av-text-muted)]">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--av-surface-2)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={i.length}
            aria-valuenow={a + 1}
            aria-label="Quiz progress"
          >
            <div
              className="h-full bg-[var(--av-teal)]"
              style={{
                width: `${((a + 1) / i.length) * 100}%`,
              }}
            />
          </div>
          {I !== null && (
            <span className={`av-badge tabular-nums ${I < 10 ? 'av-badge--danger' : ''}`} aria-live="off">
              {S ? <Clock size={12} aria-hidden /> : <Timer size={12} aria-hidden />} {Math.floor(I / 60)}:
              {String(I % 60).padStart(2, '0')}
            </span>
          )}
        </div>
        <QuestionView
          key={y.id}
          question={y}
          mode={S ? 'exam' : 'practice'}
          index={a}
          total={i.length}
          forceSubmitSignal={d}
          onAnswered={(e) => u((t) => [...t.filter((t) => t.questionId !== e.questionId), e])}
        />
        <div className="flex justify-between gap-2">
          <button type="button" className="av-btn av-btn--ghost" onClick={() => E(c)}>
            End session
          </button>
          <button
            type="button"
            className="av-btn av-btn--primary"
            disabled={!x}
            onClick={() => (a < i.length - 1 ? o(a + 1) : E(c))}
          >
            {a < i.length - 1 ? 'Next question' : S ? 'Submit examination' : 'See results'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuizPage() {
  let [e] = useSearchParams();
  let t = {
    mode: ['practice', 'identification', 'exam'].includes(e.get('mode') ?? '') ? e.get('mode') : 'practice',
    topics: e.get('topic') ? [e.get('topic')] : [],
    difficulties: [],
    count: e.get('structure')
      ? Math.max(1, QUESTIONS.filter((t) => t.relatedStructureIds.includes(e.get('structure'))).length)
      : 8,
    timed: false,
    includeViewer: true,
  };
  let [n, r] = useState(e.get('structure') ? 'running' : 'setup');
  let [i, a] = useState(t);
  let [o, s] = useState(null);
  return (
    <PageContainer wide={n === 'running'}>
      <PageHeader
        kicker="Assessment"
        title={n === 'running' ? QUIZ_MODES.find((e) => e.id === i.mode).title : 'Quiz & examination'}
      >
        {n === 'setup' && 'All questions are demonstration content pending expert review; each cites its source.'}
        {n === 'running' &&
          i.mode === 'exam' &&
          'Answers and explanations are shown only after you submit the examination.'}
      </PageHeader>
      {n === 'setup' && (
        <QuizSetup
          initial={i}
          onStart={(e) => {
            a(e);
            r('running');
          }}
        />
      )}
      {n === 'running' && (
        <QuizRunner
          config={i}
          onDone={(e, t) => {
            s({
              q: e,
              a: t,
            });
            r('done');
          }}
        />
      )}
      {n === 'done' && o && <QuizSummary questions={o.q} answers={o.a} mode={i.mode} onRestart={() => r('setup')} />}
    </PageContainer>
  );
}
