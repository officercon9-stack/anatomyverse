// @ts-nocheck
import { useProgressStore } from '../store/progress';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { LESSONS } from '../data/lessons';
import { systemById } from '../data/systems';
import { Clock, CircleCheck } from 'lucide-react';
import { ReviewBadge } from '../components/ReviewBadge';
import { Link } from 'react-router-dom';

export function LessonsPage() {
  let e = useProgressStore((e) => e.lessons);
  return (
    <PageContainer>
      <PageHeader kicker="Guided learning" title="Lessons">
        Structured lessons move the 3D camera, show the relevant layers and check understanding at key steps.
      </PageHeader>
      <ul className="flex flex-col gap-4">
        {LESSONS.map((t) => {
          let n = e[t.id];
          return (
            <li key={t.id} className="av-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="av-badge">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: systemById[t.system].color,
                      }}
                      aria-hidden
                    />
                    {systemById[t.system].name}
                  </span>
                  <span className="av-badge">
                    <Clock size={11} aria-hidden /> {t.durationMinutes}
                    {' min'}
                  </span>
                  <ReviewBadge status={t.reviewStatus} />
                  {n?.completed && (
                    <span className="av-badge av-badge--ok">
                      <CircleCheck size={11} aria-hidden />
                      {' Completed'}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold">{t.title}</h2>
                <p className="text-sm text-[var(--av-text-muted)]">{t.summary}</p>
              </div>
              <Link to={`/app/lessons/${t.id}`} className="av-btn av-btn--primary shrink-0">
                {n?.completed ? 'Review' : n ? `Resume (step ${n.stepIndex + 1})` : 'Start'}
              </Link>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
