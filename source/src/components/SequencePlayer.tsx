// @ts-nocheck
import { useState, useEffect } from 'react';
import { useHasModel3D } from '../store/viewerHooks';
import { useViewerStore } from '../store/viewerStore';
import { SkipBack, Pause, Play, SkipForward } from 'lucide-react';

export function SequencePlayer({ system: e, driveViewer: t = true }) {
  let n = e.sequence;
  let [r, i] = useState(0);
  let [a, o] = useState(false);
  let [s, c] = useState(false);
  let l = useHasModel3D();
  let { setEmphasis: u, focusStructure: d } = useViewerStore();
  let f = n.steps[r];
  useEffect(() => {
    if (t && s) {
      if (f.structureId && l(f.structureId)) {
        u([f.structureId]);
        d(f.structureId, {
          reveal: true,
        });
        useViewerStore.getState().select(null);
      } else {
        u([]);
      }
    }
  }, [r, t, s]);
  useEffect(() => () => u([]), [u]);
  useEffect(() => {
    if (!a) {
      return;
    }
    let e = setTimeout(() => (r < n.steps.length - 1 ? i(r + 1) : o(false)), 2600);
    return () => clearTimeout(e);
  }, [a, r, n.steps.length]);
  return (
    <section className="av-card p-4" aria-labelledby={`seq-${e.id}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id={`seq-${e.id}`} className="text-sm font-semibold">
          {n.title}
        </h3>
        <span className="av-badge" title="A simplified teaching sequence, not a physiological simulation">
          Illustrative
        </span>
      </div>
      <ol className="mb-3 flex flex-wrap items-center gap-1" aria-label="Sequence steps">
        {n.steps.map((e, t) => (
          <li key={t} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                c(true);
                i(t);
                o(false);
              }}
              aria-current={t === r ? 'step' : undefined}
              className={`rounded-md border px-2 py-1 text-xs ${t === r ? 'border-[var(--av-cyan)] bg-[color-mix(in_srgb,var(--av-cyan)_14%,transparent)] text-[var(--av-text)]' : t < r ? 'border-[var(--av-border)] text-[var(--av-text-muted)]' : 'border-[var(--av-border)] text-[var(--av-text-faint)]'}`}
            >
              {t + 1}
              {'. '}
              {e.label}
            </button>
            {t < n.steps.length - 1 && (
              <span aria-hidden className="text-[var(--av-text-faint)]">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="min-h-[3rem] text-sm leading-relaxed" aria-live="polite">
        <span className="font-medium">
          {f.label}
          {': '}
        </span>
        {f.text}
        {f.structureId && !l(f.structureId) && (
          <span className="block text-xs text-[var(--av-text-faint)]">
            (No 3D object for this step in the current model.)
          </span>
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() => {
            c(true);
            i(Math.max(0, r - 1));
          }}
          disabled={r === 0}
          aria-label="Previous step"
        >
          <SkipBack size={14} aria-hidden />
        </button>
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() => {
            c(true);
            if (r === n.steps.length - 1) {
              i(0);
            }
            o(!a);
          }}
          aria-label={a ? 'Pause' : 'Play sequence'}
        >
          {a ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {a ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="av-btn av-btn--sm"
          onClick={() => {
            c(true);
            i(Math.min(n.steps.length - 1, r + 1));
          }}
          disabled={r === n.steps.length - 1}
          aria-label="Next step"
        >
          <SkipForward size={14} aria-hidden />
        </button>
      </div>
    </section>
  );
}
