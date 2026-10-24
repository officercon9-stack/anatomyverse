// @ts-nocheck
import { PageContainer, PageHeader } from '../components/PageLayout';
import { SYSTEMS } from '../data/systems';
import { systemContent, completeness } from '../lib/systemContent';
import { Link } from 'react-router-dom';

export function SystemsPage() {
  return (
    <PageContainer wide>
      <PageHeader kicker="Systems" title="Anatomical systems">
        Coverage is tracked per system — a system is not marked complete just because it has a menu entry. Counts
        reflect the bundled schematic model and seeded content.
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SYSTEMS.map((e) => {
          let t = systemContent(e.id);
          let n = completeness(t);
          return (
            <li key={e.id}>
              <Link
                to={`/app/systems/${e.id}`}
                className="av-card flex h-full flex-col gap-3 p-5 transition hover:border-[var(--av-teal)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: e.color,
                      }}
                      aria-hidden
                    />
                    {e.name}
                  </h2>
                  <span className={`av-badge ${n.tone}`}>{n.label}</span>
                </div>
                <p className="text-sm text-[var(--av-text-muted)]">{e.summary}</p>
                <dl className="mt-auto grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <dt className="text-[var(--av-text-faint)]">Records</dt>
                    <dd className="text-base font-semibold">{t.all.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--av-text-faint)]">In 3D</dt>
                    <dd className="text-base font-semibold">{t.with3D.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--av-text-faint)]">Lessons</dt>
                    <dd className="text-base font-semibold">{t.lessons.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--av-text-faint)]">Questions</dt>
                    <dd className="text-base font-semibold">{t.questions.length}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
