// @ts-nocheck
import { useParams, useNavigate, Link } from 'react-router-dom';
import { systemById } from '../data/systems';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { systemContent } from '../lib/systemContent';
import { useViewerStore } from '../store/viewerStore';
import { ArrowRight, Box, FileText } from 'lucide-react';
import { ReviewBadge } from '../components/ReviewBadge';
import { SequencePlayer } from '../components/SequencePlayer';

export function SystemDetailPage() {
  let { systemId: e } = useParams();
  let t = useNavigate();
  let n = systemById[e];
  if (!n) {
    return (
      <PageContainer>
        <p>Unknown system.</p>
      </PageContainer>
    );
  }
  let r = systemContent(n.id);
  let i = new Set(r.with3D.map((e) => e.id));
  let a = (e) => {
    let r = useViewerStore.getState();
    r.restoreVisibility();
    r.setSystemFocus(n.id);
    t(e ? `/app/lab?structure=${e}` : '/app/lab');
  };
  return (
    <PageContainer wide>
      <PageHeader
        kicker="System"
        title={`${n.name} system`}
        actions={
          r.with3D.length > 0 ? (
            <button type="button" className="av-btn av-btn--primary" onClick={() => a()}>
              {'Explore in 3D '}
              <ArrowRight size={15} aria-hidden />
            </button>
          ) : undefined
        }
      >
        {n.summary}
      </PageHeader>
      <div className="av-card mb-6 p-4 text-sm">
        <h2 className="av-section-title mb-1">Current coverage</h2>
        <p className="text-[var(--av-text-muted)]">{n.coverageNote}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="structs-title">
          <h2 id="structs-title" className="av-section-title mb-3">
            Structures ({r.all.length})
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {r.all.map((e) => (
              <li key={e.id} className="av-card flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{e.name}</h3>
                  {i.has(e.id) ? (
                    <span className="av-badge av-badge--accent">
                      <Box size={11} aria-hidden />
                      {' 3D'}
                    </span>
                  ) : (
                    <span className="av-badge">
                      <FileText size={11} aria-hidden />
                      {' Text only'}
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm text-[var(--av-text-muted)]">{e.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <ReviewBadge status={e.reviewStatus} />
                  <button
                    type="button"
                    className="text-sm text-[var(--av-teal)] hover:underline"
                    onClick={() => a(e.id)}
                  >
                    Details →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="flex flex-col gap-4">
          {n.sequence && <SequencePlayer system={n} driveViewer={false} />}
          <section className="av-card p-4">
            <h2 className="av-section-title mb-2">Lessons</h2>
            {r.lessons.length ? (
              <ul className="flex flex-col gap-1 text-sm">
                {r.lessons.map((e) => (
                  <li key={e.id}>
                    <Link className="text-[var(--av-teal)] hover:underline" to={`/app/lessons/${e.id}`}>
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--av-text-faint)]">No lesson for this system yet.</p>
            )}
          </section>
          <section className="av-card p-4">
            <h2 className="av-section-title mb-2">Practice</h2>
            {r.questions.length ? (
              <Link to={`/app/quiz?topic=${n.id}`} className="av-btn av-btn--sm">
                {r.questions.length}
                {' question'}
                {r.questions.length > 1 ? 's' : ''}
                {' — start quiz'}
              </Link>
            ) : (
              <p className="text-sm text-[var(--av-text-faint)]">No questions for this system yet.</p>
            )}
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
