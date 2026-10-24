// @ts-nocheck
import { useSearchParams } from 'react-router-dom';
import { useViewerStore } from '../store/viewerStore';
import { useProgressStore } from '../store/progress';
import { useHasModel3D } from '../store/viewerHooks';
import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from './lab/useMediaQuery';
import { structureById } from '../data';
import { LabTabs } from './lab/LabTabs';
import { TipsBubble } from './lab/TipsBubble';
import { AnatomyViewer } from '../viewer/AnatomyViewer';
import { PanelLeftClose, PanelLeftOpen, Layers, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchBox } from '../components/SearchBox';
import { StructureDetails } from './lab/StructureDetails';
import { ExploreIntro } from './lab/ExploreIntro';

export function LabPage() {
  let [e, t] = useSearchParams();
  let { selectedId: n, select: r, focusStructure: i, setMode: a } = useViewerStore();
  let o = useProgressStore((e) => e.addRecent);
  let s = useHasModel3D();
  let [l, u] = useState(true);
  let [d, f] = useState('structures');
  let [p, h] = useState(false);
  let [g, ee] = useState(false);
  let _ = useMediaQuery('(min-width: 1024px)');
  let v = useMediaQuery('(min-width: 768px)');
  useEffect(() => a('explore'), [a]);
  let x = useCallback(
    (e) => {
      if (s(e)) {
        i(e);
      } else {
        r(e);
      }
      h(false);
    },
    [s, i, r],
  );
  useEffect(() => {
    let t = e.get('structure');
    if (t && structureById[t]) {
      setTimeout(() => x(t), 50);
    }
  }, []);
  useEffect(() => {
    if (n) {
      o(n);
      t(
        (e) => {
          e.set('structure', n);
          return e;
        },
        {
          replace: true,
        },
      );
    } else {
      t(
        (e) => {
          e.delete('structure');
          return e;
        },
        {
          replace: true,
        },
      );
    }
  }, [n]);
  return (
    <div className="flex h-full min-h-0">
      {l && v && (
        <aside
          className="av-panel hidden w-72 shrink-0 border-r md:block xl:w-80"
          aria-label="Structure search, list and layers"
        >
          <LabTabs tab={d} setTab={f} onPick={x} />
        </aside>
      )}
      <section className="relative min-w-0 flex-1" aria-label="3D viewport">
        <TipsBubble />
        <AnatomyViewer className="h-full w-full" />
        <button
          type="button"
          className="av-btn av-btn--sm absolute bottom-3 left-3 z-10 hidden md:inline-flex"
          onClick={() => u(!l)}
          aria-label={l ? 'Collapse side panel' : 'Expand side panel'}
        >
          {l ? <PanelLeftClose size={15} aria-hidden /> : <PanelLeftOpen size={15} aria-hidden />}
        </button>
        <div className="absolute inset-x-3 top-[4rem] z-20 flex gap-2 md:hidden">
          <div className="flex-1">
            <SearchBox onSelect={x} placeholder="Search structures…" />
          </div>
          <button type="button" className="av-btn" onClick={() => h(true)} aria-label="Open structures and layers">
            <Layers size={18} aria-hidden />
          </button>
        </div>
      </section>
      {_ && (
        <aside
          className="av-panel hidden w-[22rem] shrink-0 overflow-y-auto border-l lg:block xl:w-96"
          aria-label="Structure information"
        >
          {n ? (
            <>
              <div className="flex justify-end px-3 pt-3">
                <button
                  type="button"
                  className="av-btn av-btn--ghost av-btn--sm"
                  onClick={() => r(null)}
                  aria-label="Close structure details"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <StructureDetails structureId={n} onPick={x} />
            </>
          ) : (
            <ExploreIntro onPick={x} />
          )}
        </aside>
      )}
      {n && !_ && (
        <div
          className={`av-panel fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t shadow-2xl lg:hidden ${g ? 'h-[70vh]' : 'h-[34vh]'}`}
          role="dialog"
          aria-label="Structure details"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              className="av-btn av-btn--ghost av-btn--sm"
              onClick={() => ee(!g)}
              aria-label={g ? 'Collapse details' : 'Expand details'}
            >
              {g ? <ChevronDown size={18} aria-hidden /> : <ChevronUp size={18} aria-hidden />}
            </button>
            <span className="h-1 w-10 rounded-full bg-[var(--av-border-strong)]" aria-hidden />
            <button
              type="button"
              className="av-btn av-btn--ghost av-btn--sm"
              onClick={() => r(null)}
              aria-label="Close structure details"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StructureDetails structureId={n} onPick={x} />
          </div>
        </div>
      )}
      {p && !v && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Structures and layers"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close panel"
            onClick={() => h(false)}
          />
          <div className="av-panel absolute bottom-0 left-0 top-0 flex w-[88vw] max-w-sm flex-col border-r">
            <div className="flex justify-end p-2">
              <button
                type="button"
                className="av-btn av-btn--ghost av-btn--sm"
                onClick={() => h(false)}
                aria-label="Close panel"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <LabTabs tab={d} setTab={f} onPick={x} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
