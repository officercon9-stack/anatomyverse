// @ts-nocheck
import { getStructure } from '../data';
import { Link } from 'react-router-dom';
import { todayKey } from '../store/progress';

export function PageHeader({ kicker: e, title: t, children: n, actions: r }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {e && <p className="av-kicker mb-1">{e}</p>}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t}</h1>
        {n && <div className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--av-text-muted)]">{n}</div>}
      </div>
      {r && <div className="flex flex-wrap gap-2">{r}</div>}
    </header>
  );
}

export function PageContainer({ children: e, wide: t = false }) {
  return <div className={`mx-auto w-full px-4 py-6 sm:px-6 lg:py-8 ${t ? 'max-w-7xl' : 'max-w-5xl'}`}>{e}</div>;
}

export function StructureChips({ ids: e, empty: t }) {
  if (e.length) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {e.map((e) => {
          let t = getStructure(e);
          if (t) {
            return (
              <Link
                key={e}
                to={`/app/lab?structure=${e}`}
                className="av-badge hover:border-[var(--av-teal)] hover:text-[var(--av-teal)]"
              >
                {t.name}
              </Link>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  } else {
    return <p className="text-sm text-[var(--av-text-faint)]">{t}</p>;
  }
}

export function Card({ title: e, icon: t, children: n, action: r }) {
  return (
    <section className="av-card flex flex-col gap-3 p-5" aria-label={e}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <t size={16} className="text-[var(--av-teal)]" aria-hidden />
          {e}
        </h2>
        {r}
      </div>
      {n}
    </section>
  );
}

export function ActivityHeatmap({ activity: e }) {
  let t = Array.from(
    {
      length: 21,
    },
    (t, n) => {
      let r = new Date();
      r.setDate(r.getDate() - (20 - n));
      let i = todayKey(r);
      return {
        k: i,
        n: e[i] ?? 0,
        label: r.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };
    },
  );
  let n = Math.max(1, ...t.map((e) => e.n));
  let r = 0;
  for (let e = t.length - 1; e >= 0 && t[e].n > 0; e--) {
    r++;
  }
  return (
    <div>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`Study activity over the last 21 days. Current streak: ${r} day(s).`}
      >
        {t.map((e) => (
          <div
            key={e.k}
            title={`${e.label}: ${e.n} activities`}
            className="h-8 flex-1 rounded"
            style={{
              background: e.n
                ? `color-mix(in srgb, var(--av-teal) ${25 + (e.n / n) * 75}%, var(--av-surface-2))`
                : 'var(--av-surface-2)',
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--av-text-muted)]">
        {r > 0 ? `${r}-day study streak` : 'No activity today yet'}
        {' · last 21 days'}
      </p>
    </div>
  );
}
