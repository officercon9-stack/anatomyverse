// @ts-nocheck
import { useContentStore, mergeServerStructures } from '../store/content';
import { useState, useEffect, useMemo } from 'react';
import { structures, structureById, models } from '../data';
import { api, ApiError } from '../lib/api';
import { CircleCheck, Save, TriangleAlert, ShieldAlert } from 'lucide-react';
import { QUESTIONS } from '../data/questions';
import { LESSONS } from '../data/lessons';
import { useAuthStore } from '../store/auth';
import { PageContainer, PageHeader } from '../components/PageLayout';

export function StructureEditor() {
  useContentStore((e) => e.v);
  let [e, t] = useState(structures[0].id);
  let [n, i] = useState('');
  let a = structureById[e];
  let [s, c] = useState(null);
  let [d, f] = useState(null);
  let [p, m] = useState('');
  useEffect(() => {
    c({
      name: a.name,
      description: a.description,
      function: a.function ?? '',
      location: a.location ?? '',
      clinicalRelevance: a.clinicalRelevance ?? '',
      reviewStatus: a.reviewStatus,
      synonyms: (a.synonyms ?? []).join(', '),
    });
    f(null);
  }, [e, a]);
  let v = structures.filter((e) => e.name.toLowerCase().includes(n.toLowerCase()));
  let y = async () => {
    if (s) {
      try {
        let { structure: t } = await api(`/admin/structures/${e}`, {
          method: 'PUT',
          json: {
            ...s,
            synonyms: s.synonyms
              .split(',')
              .map((e) => e.trim())
              .filter(Boolean),
            reviewer: p || undefined,
          },
        });
        mergeServerStructures([t]);
        f({
          ok: true,
          text: 'Saved. Changes are live for all users.',
        });
      } catch (e) {
        f({
          ok: false,
          text: e instanceof ApiError ? e.message : 'Save failed',
        });
      }
    }
  };
  if (!s) {
    return null;
  }
  let C = (e, t, n = 3) => (
    <div>
      <label htmlFor={`f-${e}`} className="av-label-text">
        {t}
      </label>
      {n === 1 ? (
        <input
          id={`f-${e}`}
          className="av-input"
          value={s[e]}
          onChange={(t) =>
            c({
              ...s,
              [e]: t.target.value,
            })
          }
        />
      ) : (
        <textarea
          id={`f-${e}`}
          rows={n}
          className="av-input py-2"
          value={s[e]}
          onChange={(t) =>
            c({
              ...s,
              [e]: t.target.value,
            })
          }
        />
      )}
    </div>
  );
  return (
    <section className="av-card grid gap-4 p-5 md:grid-cols-[16rem_1fr]" aria-labelledby="editor-title">
      <div>
        <h2 id="editor-title" className="mb-2 font-semibold">
          Structure metadata
        </h2>
        <label htmlFor="admin-filter" className="sr-only">
          Filter structures
        </label>
        <input
          id="admin-filter"
          className="av-input mb-2"
          placeholder="Filter…"
          value={n}
          onChange={(e) => i(e.target.value)}
        />
        <ul className="max-h-96 overflow-y-auto text-sm" aria-label="Structures">
          {v.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                aria-current={n.id === e ? 'true' : undefined}
                className={`w-full rounded-lg px-2 py-1 text-left ${n.id === e ? 'bg-[var(--av-surface-2)] text-[var(--av-text)]' : 'text-[var(--av-text-muted)]'}`}
                onClick={() => t(n.id)}
              >
                {n.name}{' '}
                {n.reviewStatus === 'reviewed' && (
                  <CircleCheck size={12} className="inline text-[var(--av-ok)]" aria-label="reviewed" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--av-text-faint)]">
          {'ID: '}
          <code>{e}</code>
          {' (stable — referenced by assets, lessons and questions)'}
        </p>
        {C('name', 'Preferred name', 1)}
        {C('synonyms', 'Synonyms (comma-separated)', 1)}
        {C('description', 'Description')}
        {C('location', 'Location', 2)}
        {C('function', 'Function', 2)}
        {C('clinicalRelevance', 'Clinical relevance', 2)}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="f-status" className="av-label-text">
              Review status
            </label>
            <select
              id="f-status"
              className="av-input"
              value={s.reviewStatus}
              onChange={(e) =>
                c({
                  ...s,
                  reviewStatus: e.target.value,
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="pending-expert-review">Pending expert review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-reviewer" className="av-label-text">
              Reviewer name (required for “Reviewed”)
            </label>
            <input id="f-reviewer" className="av-input" value={p} onChange={(e) => m(e.target.value)} />
          </div>
        </div>
        {d && (
          <p className={`text-sm ${d.ok ? 'text-[var(--av-ok)]' : 'text-[var(--av-danger)]'}`} role="status">
            {d.text}
          </p>
        )}
        <button type="button" className="av-btn av-btn--primary self-start" onClick={y}>
          <Save size={15} aria-hidden />
          {' Save changes'}
        </button>
      </div>
    </section>
  );
}

export function AssetMappingCheck() {
  let e = useMemo(
    () =>
      models.map((e) => {
        let t = new Set(Object.values(e.objectMap));
        let n = Object.entries(e.objectMap).filter(([, e]) => !structureById[e]);
        let i = structures.filter((e) => !t.has(e.id) && !(e.childIds ?? []).some((e) => t.has(e)));
        return {
          m: e,
          mappedCount: t.size,
          unknownIds: n,
          missing: i,
        };
      }),
    [],
  );
  return (
    <section className="av-card p-5" aria-labelledby="assets-title">
      <h2 id="assets-title" className="mb-3 font-semibold">
        3D asset mapping check
      </h2>
      <div className="flex flex-col gap-4">
        {e.map(({ m: e, mappedCount: t, unknownIds: n, missing: r }) => (
          <div key={e.id} className="rounded-xl border border-[var(--av-border)] p-4 text-sm">
            <p className="font-medium">
              {e.name} <span className="av-badge ml-1">{e.fidelity}</span>
            </p>
            <p className="text-[var(--av-text-muted)]">
              {Object.keys(e.objectMap).length}
              {' objects mapped to '}
              {t}
              {' structures · '}
              {r.length}
              {' structures without a 3D object'}
            </p>
            {n.length > 0 && (
              <p className="mt-1 flex items-center gap-1 text-[var(--av-danger)]">
                <TriangleAlert size={14} aria-hidden />
                {' Objects mapped to unknown structure IDs: '}
                {n.map(([e, t]) => `${e}→${t}`).join(', ')}
              </p>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-[var(--av-text-faint)]">
                Structures missing a 3D object
              </summary>
              <p className="mt-1 text-xs text-[var(--av-text-muted)]">{r.map((e) => e.name).join(', ') || 'None'}</p>
            </details>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--av-text-faint)]">
        {'Uploading new GLB files through the browser is not implemented yet. Add models to '}
        <code>public/models/</code>
        {' and register them in '}
        <code>src/data/assetManifest.ts</code>
        {' — see ASSET_GUIDE.md.'}
      </p>
    </section>
  );
}

export function ReviewStatusPanel() {
  useContentStore((e) => e.v);
  let e = (e) => ({
    reviewed: e.filter((e) => e.reviewStatus === 'reviewed').length,
    pending: e.filter((e) => e.reviewStatus === 'pending-expert-review').length,
    draft: e.filter((e) => e.reviewStatus === 'draft').length,
  });
  let t = [
    {
      label: 'Structures',
      ...e(structures),
    },
    {
      label: 'Questions',
      ...e(QUESTIONS),
    },
    {
      label: 'Lessons',
      ...e(LESSONS),
    },
  ];
  return (
    <section className="av-card p-5" aria-labelledby="review-title">
      <h2 id="review-title" className="mb-3 font-semibold">
        Content review status
      </h2>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-[var(--av-text-faint)]">
          <tr>
            <th className="py-1 font-medium">Content</th>
            <th className="font-medium">Reviewed</th>
            <th className="font-medium">Pending</th>
            <th className="font-medium">Draft</th>
          </tr>
        </thead>
        <tbody>
          {t.map((e) => (
            <tr key={e.label} className="border-t border-[var(--av-border)]">
              <td className="py-1.5">{e.label}</td>
              <td>{e.reviewed}</td>
              <td>{e.pending}</td>
              <td>{e.draft}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-[var(--av-text-faint)]">
        Question and lesson editing is seeded in the database (see schema) but has no admin form yet.
      </p>
    </section>
  );
}

export function AdminPage() {
  if (useAuthStore((e) => e.user)?.role === 'admin') {
    return (
      <PageContainer wide>
        <PageHeader kicker="Administration" title="Content management">
          Edits are validated and saved on the server, then applied for every user.
        </PageHeader>
        <div className="flex flex-col gap-4">
          <StructureEditor />
          <div className="grid gap-4 lg:grid-cols-2">
            <AssetMappingCheck />
            <ReviewStatusPanel />
          </div>
        </div>
      </PageContainer>
    );
  } else {
    return (
      <PageContainer>
        <div className="av-card mx-auto mt-10 flex max-w-md gap-3 p-6 text-sm">
          <ShieldAlert size={20} className="shrink-0 text-[var(--av-warn)]" aria-hidden />
          <div>
            <p className="font-semibold">Administrators only</p>
            <p className="mt-1 text-[var(--av-text-muted)]">
              Content management requires an administrator account. Access is also enforced by the server.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }
}
