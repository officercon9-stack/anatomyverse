// @ts-nocheck
import { useState, useId, useRef, useMemo } from 'react';
import { useHasModel3D } from '../store/viewerHooks';
import { useContentStore } from '../store/content';
import { searchStructures, SEARCH_SUGGESTIONS } from '../lib/search';
import { structures } from '../data';
import { Search, X, Box } from 'lucide-react';
import { systemById } from '../data/systems';

export var VIEW_COMMANDS = [
  [
    'full',
    'Full model',
    'Show the whole body again',
    /(full|whole|entire|complete|normal)\s*(body|model)|^\s*(return|back|reset|restore)|return to|go back|reset|start over/,
    1,
  ],
  [
    'inside',
    'Internal organs',
    'Body with the internal organs',
    /internal organs|inner organs|inside|organs?\b|viscera|internal (body|view|model)/,
    1,
  ],
  [
    'upper',
    'Upper limb',
    'Shoulder, arm and hand only',
    /upper\s*(limb|extremit)|\barms?\b|forearm|\bhands?\b|shoulder/,
    1,
  ],
  [
    'lower',
    'Lower limb',
    'Hip, thigh, leg and foot only',
    /lower\s*(limb|extremit)|\blegs?\b|\bfeet\b|\bfoot\b|\bthigh/,
    1,
  ],
  ['skeleton', 'Skeleton', 'Bones only', /skeleton|\bbones?\b/, 0],
  ['muscles', 'Muscles and tendons', 'All muscles, tendons and ligaments', /muscles?\b|tendons?\b|ligaments?\b/, 0],
  ['nv', 'Nerves and blood vessels', 'Nerves, arteries and veins', /nerves?\b|vessels?\b|arteries|veins?\b/, 0],
];

export function matchCommands(_t) {
  let _q = _t.toLowerCase().trim();
  if (!_q) {
    return {
      first: [],
      rest: [],
    };
  }
  let _r = {
    first: [],
    rest: [],
  };
  for (let _c of VIEW_COMMANDS) {
    if (_c[3].test(_q)) {
      (_c[4] ? _r.first : _r.rest).push({
        cmd: true,
        structure: {
          id: `cmd:${_c[0]}`,
          name: _c[1],
          system: 'x',
          region: 'quick view',
          description: _c[2],
        },
        matchedOn: 'name',
      });
    }
  }
  return _r;
}

export function runCommand(k) {
  let _in = location.hash.includes('/app/lab');
  if (!_in) {
    location.hash = '#/app/lab';
  }
  setTimeout(() => globalThis.__viewCmd?.(k), _in ? 0 : 2500);
}

export function SearchBox({ onSelect: e, autoFocus: t, placeholder: n = 'Search structures, systems, synonyms…' }) {
  let [m, h] = useState('');
  let [g, _] = useState(false);
  let [v, y] = useState(0);
  let b = useId();
  let x = useRef(null);
  let S = useHasModel3D();
  let C = useContentStore((e) => e.v);
  let w = useMemo(() => {
    let _c = matchCommands(m);
    return [..._c.first, ...searchStructures(m, structures, 10), ..._c.rest];
  }, [m, C]);
  let T = g && m.trim().length > 0;
  let E = (t) => {
    if (typeof t == 'string' && t.startsWith('cmd:')) {
      runCommand(t.slice(4));
    } else {
      e(t);
    }
    h('');
    _(false);
    y(0);
  };
  return (
    <div className="relative">
      <label htmlFor={`${b}-input`} className="sr-only">
        Search anatomical structures
      </label>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-text-faint)]"
        aria-hidden
      />
      <input
        ref={x}
        id={`${b}-input`}
        className="av-input pl-9 pr-9"
        role="combobox"
        aria-expanded={T}
        aria-controls={b}
        aria-autocomplete="list"
        aria-activedescendant={T && w[v] ? `${b}-opt-${v}` : undefined}
        autoComplete="off"
        autoFocus={t}
        placeholder={n}
        value={m}
        onChange={(e) => {
          h(e.target.value);
          _(true);
          y(0);
        }}
        onFocus={() => _(true)}
        onBlur={() => setTimeout(() => _(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            _(true);
            y((e) => Math.min(e + 1, w.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            y((e) => Math.max(e - 1, 0));
          } else if (e.key === 'Enter') {
            if (w[v]) {
              e.preventDefault();
              E(w[v].structure.id);
            }
          } else if (e.key === 'Escape') {
            _(false);
          }
        }}
      />
      {m && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--av-text-faint)] hover:text-[var(--av-text)]"
          aria-label="Clear search"
          onClick={() => {
            h('');
            x.current?.focus();
          }}
        >
          <X size={15} aria-hidden />
        </button>
      )}
      {T && (
        <ul
          id={b}
          role="listbox"
          aria-label="Search results"
          className="av-card absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto p-1"
        >
          {w.length === 0 ? (
            <li className="p-3 text-sm text-[var(--av-text-muted)]" role="option" aria-selected={false} aria-disabled>
              No structures match “{m}
              {'”. Try: '}
              {SEARCH_SUGGESTIONS.slice(0, 3).join(', ')}.
            </li>
          ) : (
            w.map((e, t) => (
              <li
                key={e.structure.id}
                id={`${b}-opt-${t}`}
                role="option"
                aria-selected={t === v}
                className={`cursor-pointer rounded-lg px-3 py-2 ${t === v ? 'bg-[var(--av-surface-2)]' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => E(e.structure.id)}
                onMouseEnter={() => y(t)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--av-text)]">{e.structure.name}</span>
                  {e.cmd ? (
                    <span className="av-badge av-badge--accent shrink-0">View</span>
                  ) : S(e.structure.id) ? (
                    <span className="av-badge av-badge--accent shrink-0">
                      <Box size={11} aria-hidden />
                      {' 3D'}
                    </span>
                  ) : (
                    <span
                      className="av-badge shrink-0"
                      title="Educational record only — no object in the current 3D model"
                    >
                      Text only
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--av-text-faint)]">
                  {e.cmd ? 'Quick view' : systemById[e.structure.system]?.name}
                  {e.cmd ? '' : ' · '}
                  {e.cmd ? '' : e.structure.region.replace('-', ' ')}
                  {e.matchedOn !== 'name' && e.matchedOn !== 'description' && (
                    <>
                      {' · matched '}
                      {e.matchedOn}
                      {' “'}
                      {e.matchedText}”
                    </>
                  )}
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-[var(--av-text-muted)]">{e.structure.description}</div>
              </li>
            ))
          )}
        </ul>
      )}
      {g && !m && (
        <div className="av-card absolute left-0 right-0 top-full z-30 mt-1 p-3 text-xs text-[var(--av-text-muted)]">
          <p className="mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-1">
            {[...SEARCH_SUGGESTIONS, 'internal organs', 'upper limb', 'lower limb', 'full model'].map((e) => (
              <button
                key={e}
                type="button"
                className="av-badge hover:text-[var(--av-teal)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  h(e);
                  _(true);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
