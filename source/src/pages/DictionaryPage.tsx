// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useHasModel3D } from '../store/viewerHooks';
import { REFERENCES, TA2_SOURCE } from '../data/references';
import { normalizeText } from '../lib/search';
import { PageContainer, PageHeader } from '../components/PageLayout';
import { Search, LoaderCircle, Box, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

export var DICTIONARY_FILTERS = [
  {
    i: 1,
    label: 'English',
  },
  {
    i: 2,
    label: 'Latin',
  },
  {
    i: 7,
    label: 'فارسی',
    rtl: true,
  },
  {
    i: 3,
    label: 'Français',
  },
  {
    i: 4,
    label: 'Español',
  },
  {
    i: 5,
    label: 'Português',
  },
  {
    i: 6,
    label: 'Italiano',
  },
];

export function DictionaryPage() {
  let [e, t] = useState(null);
  let [n, _] = useState(false);
  let [v, y] = useState('');
  let [b, x] = useState(7);
  let S = useHasModel3D();
  let C = useMemo(() => Object.fromEntries(Object.entries(REFERENCES).map(([e, t]) => [String(t.ta2), e])), []);
  useEffect(() => {
    fetch('./data/ta2.json')
      .then((e) => (e.ok ? e.json() : Promise.reject()))
      .then((e) => t(e))
      .catch(() => _(true));
  }, []);
  let w = useMemo(() => e?.map((e) => normalizeText(e.slice(1).join(' | '))), [e]);
  let T = useMemo(() => {
    if (!e || !w) {
      return [];
    }
    let t = normalizeText(v);
    if (t.length < 2) {
      return [];
    }
    let n = [];
    for (let r = 0; r < e.length && n.length < 60; r++) {
      if (w[r].includes(t)) {
        n.push(e[r]);
      }
    }
    let r = (e) => +!e.slice(1).some((e) => normalizeText(e) === t);
    return n.sort((e, t) => r(e) - r(t));
  }, [e, w, v]);
  let E = DICTIONARY_FILTERS.find((e) => e.i === b);
  return (
    <PageContainer>
      <PageHeader kicker="Terminology" title="Anatomy dictionary">
        Search about 7,200 official anatomical terms (Terminologia Anatomica 2) in English, Latin, Persian, French,
        Spanish, Portuguese and Italian.
      </PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-text-faint)]"
            aria-hidden
          />
          <label htmlFor="dict-q" className="sr-only">
            Search anatomical terms
          </label>
          <input
            id="dict-q"
            className="av-input pl-9"
            placeholder="e.g. femur, ventriculus, قلب, cœur…"
            value={v}
            onChange={(e) => y(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="dict-lang" className="sr-only">
            Translation shown
          </label>
          <select id="dict-lang" className="av-input" value={b} onChange={(e) => x(Number(e.target.value))}>
            {DICTIONARY_FILTERS.filter((e) => e.i > 2).map((e) => (
              <option key={e.i} value={e.i}>
                {'Show: '}
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!e && !n && (
        <p className="flex items-center gap-2 text-sm text-[var(--av-text-muted)]">
          <LoaderCircle size={16} className="animate-spin" aria-hidden />
          {' Loading dictionary…'}
        </p>
      )}
      {n && (
        <p className="text-sm text-[var(--av-danger)]">
          The dictionary could not be loaded. Check your connection and reload.
        </p>
      )}
      {e && v.trim().length < 2 && (
        <p className="text-sm text-[var(--av-text-muted)]">
          {e.length.toLocaleString()}
          {' terms loaded. Type at least 2 letters.'}
        </p>
      )}
      {e && v.trim().length >= 2 && T.length === 0 && (
        <p className="text-sm text-[var(--av-text-muted)]">No terms match “{v}”.</p>
      )}
      {T.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Dictionary results">
          {T.map((e) => {
            let t = C[e[0]];
            return (
              <li key={e[0]} className="av-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{e[1]}</p>
                    <p className="text-sm italic text-[var(--av-text-muted)]">{e[2]}</p>
                  </div>
                  <span className="av-badge">
                    {'TA2 '}
                    {e[0]}
                  </span>
                </div>
                <p dir={E.rtl ? 'rtl' : undefined} className={`mt-1 text-sm ${E.rtl ? 'text-right' : ''}`}>
                  <span className="text-xs text-[var(--av-text-faint)]">
                    {E.label}
                    {': '}
                  </span>
                  {e[b] || '—'}
                </p>
                {t && (
                  <Link to={`/app/lab?structure=${t}`} className="av-btn av-btn--sm mt-2">
                    {S(t) ? (
                      <>
                        <Box size={14} aria-hidden />
                        {' View in 3D'}
                      </>
                    ) : (
                      'Open details'
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 flex items-start gap-1.5 text-xs text-[var(--av-text-faint)]">
        <Languages size={13} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          {'Data: '}
          <a className="underline" href={TA2_SOURCE.url} target="_blank" rel="noreferrer noopener">
            {TA2_SOURCE.title}
          </a>
          {', '}
          {TA2_SOURCE.license}. Translations were contributed by the Z-Anatomy community and may contain errors.
        </span>
      </p>
    </PageContainer>
  );
}
