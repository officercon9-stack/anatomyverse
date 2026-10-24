// @ts-nocheck
import { useProgressStore } from '../store/progress';
import { useAuthStore } from '../store/auth';
import { lessonById, LESSONS } from '../data/lessons';
import { isDue } from '../lib/srs';
import { useMemo } from 'react';
import { PageContainer, PageHeader, Card, ActivityHeatmap, StructureChips } from '../components/PageLayout';
import {
  X,
  Sparkles,
  Boxes,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CircleCheck,
  Flame,
  ListChecks,
  Bookmark,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { systemById, SYSTEMS } from '../data/systems';

export function DashboardPage() {
  let e = useProgressStore();
  let t = useAuthStore((e) => e.user);
  let n = Object.entries(e.lessons);
  let r = n.filter(([, e]) => !e.completed).sort((e, t) => t[1].updatedAt - e[1].updatedAt)[0];
  let i = n.filter(([, e]) => e.completed).map(([e]) => e);
  let a = r ? lessonById[r[0]] : LESSONS.find((e) => !i.includes(e.id));
  let o = Object.values(e.flashcards).filter((e) => isDue(e)).length;
  let s = !e.onboarded && e.recent.length === 0 && e.quizAttempts.length === 0 && n.length === 0;
  let c = useMemo(() => {
    let t = {};
    for (let n of e.quizAttempts) {
      for (let [e, r] of Object.entries(n.byTopic)) {
        t[e] ??= {
          correct: 0,
          total: 0,
        };
        t[e].correct += r.correct;
        t[e].total += r.total;
      }
    }
    return Object.entries(t)
      .map(([e, t]) => ({
        topic: e,
        pct: Math.round((t.correct / t.total) * 100),
        ...t,
      }))
      .sort((e, t) => e.pct - t.pct);
  }, [e.quizAttempts]);
  let l = e.quizAttempts.length
    ? Math.round(
        (e.quizAttempts.reduce((e, t) => e + t.correct, 0) /
          Math.max(
            1,
            e.quizAttempts.reduce((e, t) => e + t.total, 0),
          )) *
          100,
      )
    : null;
  let u = c.find((e) => e.pct < 80);
  return (
    <PageContainer wide>
      <PageHeader kicker="Dashboard" title={t ? `Welcome back, ${t.displayName}` : 'Your anatomy study space'}>
        {t ? (
          'Progress is synced to your account.'
        ) : (
          <>
            {'You are in '}
            <strong>local mode</strong>: your progress is saved in this browser.
          </>
        )}
      </PageHeader>
      {s && (
        <section className="av-card relative mb-6 overflow-hidden p-6" aria-label="Getting started">
          <button
            type="button"
            className="av-btn av-btn--ghost av-btn--sm absolute right-3 top-3"
            onClick={e.setOnboarded}
            aria-label="Dismiss getting started"
          >
            <X size={16} aria-hidden />
          </button>
          <p className="av-kicker mb-1 flex items-center gap-1">
            <Sparkles size={13} aria-hidden />
            {' Getting started'}
          </p>
          <h2 className="mb-4 text-lg font-semibold">Three steps to your first study session</h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {[
              {
                to: '/app/lab?structure=heart',
                icon: Boxes,
                t: '1. Explore the lab',
                d: 'Rotate the model, click a structure and read its details.',
              },
              {
                to: '/app/lessons/heart-chambers-blood-flow',
                icon: BookOpen,
                t: '2. Take a guided lesson',
                d: 'The heart: chambers and blood flow (≈15 min).',
              },
              {
                to: '/app/quiz',
                icon: GraduationCap,
                t: '3. Test yourself',
                d: 'A short quiz with explanations after each answer.',
              },
            ].map(({ to: t, icon: n, t: r, d: i }) => (
              <li key={r}>
                <Link
                  to={t}
                  onClick={e.setOnboarded}
                  className="flex h-full flex-col gap-1 rounded-xl border border-[var(--av-border)] p-4 hover:border-[var(--av-teal)]"
                >
                  <n size={18} className="text-[var(--av-teal)]" aria-hidden />
                  <span className="font-medium">{r}</span>
                  <span className="text-sm text-[var(--av-text-muted)]">{i}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Continue learning" icon={BookOpen}>
          {a ? (
            <>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-[var(--av-text-muted)]">
                {r
                  ? `Step ${(r[1].stepIndex ?? 0) + 1} of ${a.steps.length}`
                  : `${a.durationMinutes} min · ${systemById[a.system].name}`}
              </p>
              <Link to={`/app/lessons/${a.id}`} className="av-btn av-btn--primary self-start">
                {r ? 'Resume' : 'Start'}
                {' lesson '}
                <ArrowRight size={15} aria-hidden />
              </Link>
            </>
          ) : (
            <p className="text-sm text-[var(--av-text-muted)]">
              All available lessons completed. Revisit them or try exam mode.
            </p>
          )}
        </Card>
        <Card title="Learning progress" icon={CircleCheck}>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-xs text-[var(--av-text-faint)]">Lessons</dt>
              <dd className="text-xl font-semibold">
                {i.length}/{LESSONS.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--av-text-faint)]">Quiz avg</dt>
              <dd className="text-xl font-semibold">{l === null ? '—' : `${l}%`}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--av-text-faint)]">Cards due</dt>
              <dd className="text-xl font-semibold">{o}</dd>
            </div>
          </dl>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--av-surface-2)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={LESSONS.length}
            aria-valuenow={i.length}
            aria-label="Lessons completed"
          >
            <div
              className="h-full bg-[var(--av-teal)]"
              style={{
                width: `${(i.length / LESSONS.length) * 100}%`,
              }}
            />
          </div>
          {i.length > 0 && (
            <ul className="text-sm text-[var(--av-text-muted)]">
              {i.map((e) => (
                <li key={e} className="flex items-center gap-1.5">
                  <CircleCheck size={13} className="text-[var(--av-ok)]" aria-hidden />
                  {lessonById[e]?.title}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Daily study activity" icon={Flame}>
          <ActivityHeatmap activity={e.activity} />
        </Card>
        <Card title="Recommended revision" icon={ListChecks}>
          <ul className="flex flex-col gap-2 text-sm">
            {o > 0 && (
              <li>
                <Link to="/app/flashcards" className="text-[var(--av-teal)] underline-offset-2 hover:underline">
                  {o}
                  {' flashcard'}
                  {o > 1 ? 's' : ''}
                  {' due for review'}
                </Link>
              </li>
            )}
            {u && (
              <li>
                <Link
                  to={`/app/quiz?topic=${u.topic}`}
                  className="text-[var(--av-teal)] underline-offset-2 hover:underline"
                >
                  {'Practise '}
                  {systemById[u.topic]?.name ?? u.topic}
                  {' ('}
                  {u.pct}% so far)
                </Link>
              </li>
            )}
            {e.revision.length > 0 && (
              <li>
                {'Your revision list: '}
                <StructureChips ids={e.revision} empty="" />
              </li>
            )}
            {!o && !u && !e.revision.length && (
              <li className="text-[var(--av-text-faint)]">
                Complete a quiz or add structures to your revision list to get recommendations.
              </li>
            )}
          </ul>
        </Card>
        <Card
          title="Quiz performance"
          icon={GraduationCap}
          action={
            <Link to="/app/quiz" className="text-xs text-[var(--av-teal)]">
              New quiz
            </Link>
          }
        >
          {c.length ? (
            <ul className="flex flex-col gap-2">
              {c.map((e) => (
                <li key={e.topic} className="text-sm">
                  <div className="mb-0.5 flex justify-between">
                    <span>{systemById[e.topic]?.name ?? e.topic}</span>
                    <span className="tabular-nums text-[var(--av-text-muted)]">
                      {e.correct}/{e.total}
                      {' · '}
                      {e.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--av-surface-2)]">
                    <div
                      className="h-full"
                      style={{
                        width: `${e.pct}%`,
                        background: e.pct >= 70 ? 'var(--av-ok)' : 'var(--av-warn)',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--av-text-faint)]">No quiz attempts yet.</p>
          )}
        </Card>
        <Card title="Saved & recent" icon={Bookmark}>
          <div>
            <h3 className="av-section-title mb-1.5">Saved structures</h3>
            <StructureChips ids={e.bookmarks} empty="Save structures from the lab’s information panel." />
          </div>
          <div>
            <h3 className="av-section-title mb-1.5">Recently explored</h3>
            <StructureChips ids={e.recent.slice(0, 10).map((e) => e.id)} empty="Nothing explored yet." />
          </div>
        </Card>
      </div>
      <section className="mt-6" aria-labelledby="qa-title">
        <h2 id="qa-title" className="av-section-title mb-3">
          Quick access — anatomical systems
        </h2>
        <div className="flex flex-wrap gap-2">
          {SYSTEMS.map((e) => (
            <Link key={e.id} to={`/app/systems/${e.id}`} className="av-btn av-btn--sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: e.color,
                }}
                aria-hidden
              />
              {e.name}
            </Link>
          ))}
          <Link to="/app/flashcards" className="av-btn av-btn--sm">
            <Zap size={14} aria-hidden />
            {' Flashcards'}
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
