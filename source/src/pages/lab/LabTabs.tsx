// @ts-nocheck
import { SearchBox } from '../../components/SearchBox';
import { ListTree, Layers } from 'lucide-react';
import { StructureList } from './StructureList';
import { ViewAndLayersPanel } from './ViewAndLayersPanel';

export function LabTabs({ tab: e, setTab: t, onPick: n }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3 pb-2">
        <SearchBox onSelect={n} />
      </div>
      <div
        role="tablist"
        aria-label="Laboratory panels"
        className="mx-3 mb-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--av-border)] p-1"
      >
        {['structures', 'layers'].map((n) => (
          <button
            key={n}
            role="tab"
            type="button"
            aria-selected={e === n}
            aria-controls={`lab-tab-${n}`}
            id={`lab-tabbtn-${n}`}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm ${e === n ? 'bg-[var(--av-surface-2)] text-[var(--av-text)]' : 'text-[var(--av-text-muted)]'}`}
            onClick={() => t(n)}
          >
            {n === 'structures' ? <ListTree size={15} aria-hidden /> : <Layers size={15} aria-hidden />}
            {n === 'structures' ? 'Find a part' : 'What to show'}
          </button>
        ))}
      </div>
      <div
        id={`lab-tab-${e}`}
        role="tabpanel"
        aria-labelledby={`lab-tabbtn-${e}`}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {e === 'structures' ? (
          <div className="px-2 pb-4">
            <StructureList onPick={n} />
          </div>
        ) : (
          <ViewAndLayersPanel />
        )}
      </div>
    </div>
  );
}
