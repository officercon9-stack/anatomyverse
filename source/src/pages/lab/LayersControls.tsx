// @ts-nocheck
import { useViewerStore } from '../../store/viewerStore';
import { modelById, structuresInModel, structures, models } from '../../data';
import { LAYERS } from '../../store/visibility';
import { SYSTEMS } from '../../data/systems';
import { EyeOff, Eye, Undo2, RotateCcw } from 'lucide-react';
import { DetailedModelToggle } from './DetailedModelToggle';
import { BrainLayers } from './BrainLayers';
import { LungLayers } from './LungLayers';

export function LayersControls() {
  let e = useViewerStore();
  let t = modelById[e.modelId];
  let n = t ? structuresInModel(t) : new Set();
  let i = Object.fromEntries(
    LAYERS.map((e) => [e.id, structures.filter((t) => t.layer === e.id && n.has(t.id)).length]),
  );
  let a = Object.fromEntries(
    SYSTEMS.map((e) => [e.id, structures.filter((t) => t.system === e.id && n.has(t.id)).length]),
  );
  return (
    <div className="flex flex-col gap-5 p-4">
      <section aria-labelledby="layers-title">
        <div className="mb-2 flex items-center justify-between">
          <h3 id="layers-title" className="av-section-title">
            Tissue layers
          </h3>
        </div>
        <ul className="flex flex-col gap-3">
          {LAYERS.map((t) => {
            let n = i[t.id];
            let r = n === 0;
            return (
              <li key={t.id} className={r ? 'opacity-50' : ''}>
                <div className="flex items-center gap-2">
                  <input
                    id={`layer-${t.id}`}
                    type="checkbox"
                    className="av-checkbox"
                    checked={e.layerVisible[t.id]}
                    disabled={r}
                    onChange={(n) => e.setLayerVisible(t.id, n.target.checked)}
                  />
                  <label htmlFor={`layer-${t.id}`} className="flex-1 text-sm">
                    {t.label}
                  </label>
                  <span className="text-xs text-[var(--av-text-faint)]">{r ? 'not in model' : `${n} structures`}</span>
                </div>
                {!r && (
                  <div className="mt-1 flex items-center gap-2 pl-6">
                    <label htmlFor={`op-${t.id}`} className="sr-only">
                      {t.label}
                      {' opacity'}
                    </label>
                    <input
                      id={`op-${t.id}`}
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      className="av-range"
                      value={e.layerOpacity[t.id]}
                      onChange={(n) => e.setLayerOpacity(t.id, Number(n.target.value))}
                      aria-valuetext={`${Math.round(e.layerOpacity[t.id] * 100)}%`}
                    />
                    <span className="w-9 text-right text-xs tabular-nums text-[var(--av-text-faint)]">
                      {Math.round(e.layerOpacity[t.id] * 100)}%
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-[var(--av-text-faint)]">
          Objects below 35% opacity let clicks pass through to deeper structures.
        </p>
      </section>
      <section aria-labelledby="sys-title">
        <h3 id="sys-title" className="av-section-title mb-2">
          Focus a system
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="av-badge"
            aria-pressed={!e.systemFocus}
            onClick={() => e.setSystemFocus(null)}
            style={
              e.systemFocus
                ? undefined
                : {
                    color: 'var(--av-teal)',
                    borderColor: 'var(--av-teal)',
                  }
            }
          >
            All
          </button>
          {SYSTEMS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="av-badge"
              disabled={a[t.id] === 0}
              title={
                a[t.id] === 0 ? 'No 3D objects for this system in the current model' : `${a[t.id]} structures in model`
              }
              aria-pressed={e.systemFocus === t.id}
              onClick={() => e.setSystemFocus(e.systemFocus === t.id ? null : t.id)}
              style={
                e.systemFocus === t.id
                  ? {
                      color: 'var(--av-teal)',
                      borderColor: 'var(--av-teal)',
                    }
                  : a[t.id] === 0
                    ? {
                        opacity: 0.45,
                      }
                    : undefined
              }
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: t.color,
                }}
                aria-hidden
              />{' '}
              {t.name}
            </button>
          ))}
        </div>
        {e.systemFocus && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="av-btn av-btn--sm"
              onClick={() =>
                e.hideCategory({
                  system: e.systemFocus,
                })
              }
            >
              <EyeOff size={14} aria-hidden />
              {' Hide all in system'}
            </button>
            <button
              type="button"
              className="av-btn av-btn--sm"
              onClick={() =>
                e.showCategory({
                  system: e.systemFocus,
                })
              }
            >
              <Eye size={14} aria-hidden />
              {' Show all'}
            </button>
          </div>
        )}
      </section>
      {(e.hidden.length > 0 || e.isolated) && (
        <section className="rounded-xl border border-[var(--av-border)] p-3 text-sm">
          <p className="mb-2 text-[var(--av-text-muted)]">
            {e.isolated ? `Isolating ${e.isolated.length} structure(s). ` : ''}
            {e.hidden.length ? `${e.hidden.length} structure(s) hidden.` : ''}
          </p>
          <button type="button" className="av-btn av-btn--sm" onClick={e.restoreVisibility}>
            <Undo2 size={14} aria-hidden />
            {' Restore visibility'}
          </button>
        </section>
      )}
      <section aria-labelledby="model-title">
        <h3 id="model-title" className="av-section-title mb-2">
          3D model
        </h3>
        <label htmlFor="model-select" className="sr-only">
          Choose 3D model
        </label>
        <select id="model-select" className="av-input" value={e.modelId} onChange={(t) => e.setModel(t.target.value)}>
          {models
            .filter((e) => e.id !== 'bodyparts3d-brain-in-body')
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
        </select>
        <p className="mt-2 text-xs leading-snug text-[var(--av-text-faint)]">{t?.description}</p>
        {e.modelId === 'schematic-body-v1' && <DetailedModelToggle />}
        {e.modelId === 'schematic-body-v1' && (
          <>
            <BrainLayers />
            <LungLayers />
          </>
        )}
      </section>
      <button type="button" className="av-btn" onClick={e.resetAll}>
        <RotateCcw size={15} aria-hidden />
        {' Reset to original configuration'}
      </button>
    </div>
  );
}
