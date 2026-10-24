// @ts-nocheck
import { useParams, Link } from 'react-router-dom';
import { lessonById } from '../data/lessons';
import { useProgressStore } from '../store/progress';
import { useHasModel3D } from '../store/viewerHooks';
import { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { questionById } from '../data/questions';
import { AnatomyViewer } from '../viewer/AnatomyViewer';
import { ArrowLeft, Target, CircleCheck, ArrowRight } from 'lucide-react';
import { ReviewBadge } from '../components/ReviewBadge';
import { getStructure } from '../data';
import { QuestionView } from '../components/QuestionView';
import { SourceList } from '../components/SourceList';

export function LessonPlayerPage() {
  let { lessonId: e } = useParams();
  let t = lessonById[e ?? ''];
  let n = useProgressStore((t) => (e ? t.lessons[e] : undefined));
  let i = useProgressStore((e) => e.updateLesson);
  let y = useHasModel3D();
  let [C, w] = useState(() => Math.min(n?.stepIndex ?? 0, t ? t.steps.length : 0));
  let [T, E] = useState({});
  let D = t?.steps[C];
  useEffect(() => {
    let e = useViewerStore.getState();
    if (t) {
      e.setMode('explore');
      e.restoreVisibility();
      e.select(null);
      if (D) {
        if (D.layers) {
          e.showOnlyLayers(D.layers);
        }
        let t = (D.focusStructureIds ?? []).filter(y);
        e.setEmphasis(t);
        setTimeout(() => e.frame(t, D.view), 30);
      } else {
        e.resetAll();
      }
    }
  }, [C, t]);
  useEffect(() => () => useViewerStore.getState().resetAll(), []);
  if (!t) {
    return (
      <div className="p-6">
        {'Lesson not found. '}
        <Link to="/app/lessons" className="underline">
          All lessons
        </Link>
      </div>
    );
  }
  let O = (e) => {
    let r = Array.from(new Set([...(n?.completedSteps ?? []), ...(D ? [D.id] : [])]));
    w(e);
    i(t.id, {
      stepIndex: Math.min(e, t.steps.length - 1),
      completedSteps: r,
    });
  };
  let k = () =>
    i(t.id, {
      completed: true,
      completedSteps: t.steps.map((e) => e.id),
      stepIndex: t.steps.length - 1,
    });
  let A = D?.checkQuestionId ? questionById[D.checkQuestionId] : undefined;
  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <section className="relative h-[42vh] shrink-0 lg:h-auto lg:flex-1" aria-label="3D viewport">
        <AnatomyViewer className="h-full w-full" />
      </section>
      <aside
        className="av-panel flex min-h-0 flex-1 flex-col border-t lg:w-[26rem] lg:flex-none lg:border-l lg:border-t-0 xl:w-[30rem]"
        aria-label="Lesson"
      >
        <div className="border-b border-[var(--av-border)] p-4">
          <Link
            to="/app/lessons"
            className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--av-text-muted)] hover:text-[var(--av-text)]"
          >
            <ArrowLeft size={13} aria-hidden />
            {' All lessons'}
          </Link>
          <h1 className="text-lg font-semibold leading-tight">{t.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <ReviewBadge status={t.reviewStatus} />
          </div>
          <ol className="mt-3 flex gap-1" aria-label="Lesson steps">
            {[
              ...t.steps,
              {
                id: 'summary',
                title: 'Summary',
              },
            ].map((e, t) => (
              <li key={e.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => O(t)}
                  aria-label={`Step ${t + 1}: ${e.title}`}
                  aria-current={t === C ? 'step' : undefined}
                  className={`block h-1.5 w-full rounded-full ${t === C ? 'bg-[var(--av-cyan)]' : t < C || n?.completedSteps.includes(e.id) ? 'bg-[var(--av-teal)]/60' : 'bg-[var(--av-surface-2)]'}`}
                />
              </li>
            ))}
          </ol>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {C === 0 && D && (
            <section className="av-card mb-4 p-4">
              <h2 className="av-section-title mb-2 flex items-center gap-1">
                <Target size={13} aria-hidden />
                {' Learning objectives'}
              </h2>
              <ul className="list-disc pl-5 text-sm text-[var(--av-text-muted)]">
                {t.objectives.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          )}
          {D ? (
            <article className="flex flex-col gap-4">
              <div>
                <p className="av-kicker mb-1">
                  {'Step '}
                  {C + 1}
                  {' of '}
                  {t.steps.length}
                </p>
                <h2 className="text-xl font-semibold">{D.title}</h2>
              </div>
              <p className="text-[0.95rem] leading-relaxed">{D.body}</p>
              {D.focusStructureIds?.length ? (
                <div>
                  <h3 className="av-section-title mb-1.5">Inspect</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {D.focusStructureIds.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="av-badge hover:border-[var(--av-teal)] hover:text-[var(--av-teal)]"
                        onClick={() =>
                          y(e) ? useViewerStore.getState().focusStructure(e) : useViewerStore.getState().select(e)
                        }
                      >
                        {getStructure(e)?.name}
                        {!y(e) && ' (text only)'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {A && (
                <div>
                  <h3 className="av-section-title mb-2">Knowledge check</h3>
                  <QuestionView
                    key={A.id}
                    question={A}
                    mode="practice"
                    onAnswered={() =>
                      E({
                        ...T,
                        [D.id]: true,
                      })
                    }
                  />
                </div>
              )}
            </article>
          ) : (
            <article className="flex flex-col gap-4">
              <div>
                <p className="av-kicker mb-1">Summary</p>
                <h2 className="text-xl font-semibold">Key points</h2>
              </div>
              <ul className="flex flex-col gap-2">
                {t.keyPoints.map((e) => (
                  <li key={e} className="flex gap-2 text-sm">
                    <CircleCheck size={16} className="mt-0.5 shrink-0 text-[var(--av-teal)]" aria-hidden />
                    {e}
                  </li>
                ))}
              </ul>
              <section>
                <h3 className="av-section-title mb-2">Sources</h3>
                <SourceList sources={t.sources} />
              </section>
              {n?.completed ? (
                <p className="flex items-center gap-2 text-sm text-[var(--av-ok)]">
                  <CircleCheck size={16} aria-hidden />
                  {' Lesson completed'}
                </p>
              ) : (
                <button type="button" className="av-btn av-btn--primary self-start" onClick={k}>
                  Mark lesson complete
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                <Link to={`/app/quiz?topic=${t.system}`} className="av-btn av-btn--sm">
                  Practise this topic
                </Link>
                <Link to="/app/lab" className="av-btn av-btn--sm">
                  Explore freely
                </Link>
              </div>
            </article>
          )}
        </div>
        <div className="flex justify-between gap-2 border-t border-[var(--av-border)] p-3">
          <button type="button" className="av-btn" disabled={C === 0} onClick={() => O(C - 1)}>
            <ArrowLeft size={15} aria-hidden />
            {' Back'}
          </button>
          {C < t.steps.length && (
            <button type="button" className="av-btn av-btn--primary" onClick={() => O(C + 1)}>
              {C === t.steps.length - 1 ? 'Summary' : 'Next'} <ArrowRight size={15} aria-hidden />
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
