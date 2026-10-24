// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { useState } from 'react';
import { PHASE_TEXT, valveClosure, enableHeartAudio, canVibrate } from './heartCycle';
import { HeartPulse } from 'lucide-react';
import { EcgTrace } from './EcgTrace';

export function HeartPanel() {
  let {
    heartBeating: e,
    heartRate: t,
    setHeartRate: n,
    setHeartBeating: r,
    focusStructure: i,
    heartPhase: a,
    bloodFlow: o,
    setBloodFlow: s,
    heartSound: c,
    setHeartSound: l,
    heartVibrate: u,
    setHeartVibrate: d,
  } = useViewerStore();
  let [f, p] = useState(() => typeof window < 'u' && window.innerWidth < 768);
  let m = useViewerStore((e) => e.modelId);
  if (!e) {
    return null;
  }
  let [h, g] = (a ?? '').split('|');
  let _ = h ? PHASE_TEXT[h] : null;
  let v = h
    ? valveClosure(
        {
          'atrial-systole': 0.06,
          'av-delay': 0.15,
          'ventricular-systole': 0.33,
          diastole: 0.75,
        }[h],
      )
    : null;
  let y = {
    color: 'var(--av-teal)',
    borderColor: 'var(--av-teal)',
  };
  return (
    <div className="absolute left-3 top-[7.25rem] z-10 w-[13rem] max-w-[calc(100%-1.5rem)] rounded-xl border border-[var(--av-border)] bg-[var(--av-surface)]/85 p-2.5 text-xs shadow md:top-16 md:w-60">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--av-text)]">
          <HeartPulse size={14} className="text-[var(--av-danger)]" aria-hidden />
          {' Living heart '}
          <span className="rounded bg-[var(--av-teal)] px-1 text-[9px] font-bold text-[var(--av-accent-ink)]">4D</span>
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            className="text-[var(--av-text-faint)] hover:text-[var(--av-text)]"
            onClick={() => p(!f)}
            aria-expanded={!f}
            aria-label={f ? 'Expand heart panel' : 'Minimise heart panel'}
          >
            {f ? '▢' : '—'}
          </button>
          <button
            type="button"
            className="text-[var(--av-text-faint)] hover:text-[var(--av-text)]"
            onClick={() => r(false)}
            aria-label="Stop heartbeat"
          >
            Stop
          </button>
        </span>
      </div>
      {f ? (
        <div className="flex items-center gap-2">
          <EcgTrace width={120} height={30} />
          <span className="text-[11px] font-semibold text-[var(--av-text)]">{_?.label.split(' ')[0]}</span>
          {g && (
            <span className="rounded bg-[var(--av-danger)] px-1 text-[9px] font-bold uppercase text-white">{g}</span>
          )}
        </div>
      ) : (
        <>
          <div className="mb-2 rounded-lg bg-[var(--av-surface-2)] p-2" aria-live="off">
            <ol className="mb-1 flex gap-1" aria-label="Cardiac cycle">
              {['atrial-systole', 'av-delay', 'ventricular-systole', 'diastole'].map((e) => (
                <li
                  key={e}
                  className={`h-1.5 flex-1 rounded-full ${h === e ? 'bg-[var(--av-danger)]' : 'bg-[var(--av-border-strong)]'}`}
                  title={PHASE_TEXT[e].label}
                />
              ))}
            </ol>
            <p className="flex items-center justify-between font-semibold text-[var(--av-text)]">
              <span>{_?.label ?? '…'}</span>
              {g && (
                <span className="rounded bg-[var(--av-danger)] px-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {g}
                </span>
              )}
            </p>
            {v && (
              <p className="mt-1 text-[11px] leading-snug text-[var(--av-text-muted)]">
                {'Tricuspid & mitral: '}
                <strong className={v.av > 0.5 ? 'text-[var(--av-ok)]' : 'text-[var(--av-danger)]'}>
                  {v.av > 0.5 ? 'open' : 'closed'}
                </strong>
                <br />
                {'Pulmonary & aortic: '}
                <strong className={v.semilunar > 0.5 ? 'text-[var(--av-ok)]' : 'text-[var(--av-danger)]'}>
                  {v.semilunar > 0.5 ? 'open' : 'closed'}
                </strong>
              </p>
            )}
            <p className="hidden leading-snug text-[var(--av-text-muted)] md:block">{_?.text}</p>
          </div>
          <EcgTrace width={176} height={44} />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              className="av-badge"
              aria-pressed={c}
              onClick={() => {
                if (!c) {
                  enableHeartAudio();
                }
                l(!c);
              }}
              style={c ? y : undefined}
            >
              {'🔊 Sound '}
              {c ? 'on' : 'off'}
            </button>
            {canVibrate() && (
              <button
                type="button"
                className="av-badge"
                aria-pressed={u}
                onClick={() => d(!u)}
                style={u ? y : undefined}
              >
                {'📳 Vibrate '}
                {u ? 'on' : 'off'}
              </button>
            )}
          </div>
          <label htmlFor="bpm" className="mb-1 mt-2 flex justify-between text-[var(--av-text-muted)]">
            <span>Heart rate</span>
            <span className="tabular-nums">
              {t}
              {' beats/min'}
            </span>
          </label>
          <input
            id="bpm"
            type="range"
            min={30}
            max={180}
            step={5}
            value={t}
            onChange={(e) => n(Number(e.target.value))}
            className="av-range"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button type="button" className="av-badge" onClick={() => i('heart')}>
              Zoom to heart
            </button>
            <button type="button" className="av-badge" aria-pressed={o} onClick={() => s(!o)} style={o ? y : undefined}>
              {'Blood flow '}
              {o ? 'on' : 'off'}
            </button>
          </div>
          {o && m !== 'schematic-body-v1' && (
            <p className="mt-1.5 text-[11px] leading-snug text-[var(--av-text-faint)]">
              Blood-flow dots are available on the schematic body model.
            </p>
          )}
          {o && m === 'schematic-body-v1' && (
            <p className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--av-text-muted)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#4f8cff]" aria-hidden />
              low O₂
              <span className="inline-block h-2 w-2 rounded-full bg-[#ff4d4d]" aria-hidden />
              high O₂
            </p>
          )}
          <p className="mt-2 hidden leading-snug text-[var(--av-text-faint)] md:block">
            Illustrative. “Lub” = tricuspid and mitral valves closing; “dub” = pulmonary and aortic valves closing. Slow
            the rate and use X-ray to watch the valve discs shrink (open) and grow (closed).
          </p>
        </>
      )}
    </div>
  );
}
