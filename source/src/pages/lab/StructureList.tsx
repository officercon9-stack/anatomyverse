// @ts-nocheck
import { useContentStore } from '../../store/content';
import { useViewerStore } from '../../store/viewerStore';
import { useHasModel3D } from '../../store/viewerHooks';
import { useState } from 'react';
import { SYSTEMS } from '../../data/systems';
import { structures } from '../../data';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function StructureList({ onPick: e, initialOpen: t }) {
  useContentStore((e) => e.v);
  let n = useViewerStore((e) => e.selectedId);
  let i = useHasModel3D();
  let [a, o] = useState(new Set(t ? [t] : []));
  return (
    <nav aria-label="Structures by system">
      <ul className="flex flex-col">
        {SYSTEMS.map((t) => {
          let s = structures.filter((e) => e.system === t.id).sort((e, t) => e.name.localeCompare(t.name));
          let c = a.has(t.id);
          return (
            <li key={t.id} className="border-b border-[var(--av-border)] last:border-0">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-2.5 text-left text-sm font-medium hover:bg-[var(--av-surface-2)]"
                aria-expanded={c}
                onClick={() =>
                  o((e) => {
                    let n = new Set(e);
                    if (n.has(t.id)) {
                      n.delete(t.id);
                    } else {
                      n.add(t.id);
                    }
                    return n;
                  })
                }
              >
                {c ? <ChevronDown size={15} aria-hidden /> : <ChevronRight size={15} aria-hidden />}
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: t.color,
                  }}
                  aria-hidden
                />
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-[var(--av-text-faint)]">{s.length}</span>
              </button>
              {c && (
                <ul className="pb-2">
                  {s.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 pl-9 text-left text-sm hover:bg-[var(--av-surface-2)] ${n === t.id ? 'text-[var(--av-amber)]' : 'text-[var(--av-text-muted)]'}`}
                        aria-current={n === t.id ? 'true' : undefined}
                        onClick={() => e(t.id)}
                      >
                        <span>
                          {n === t.id && <span aria-hidden>{'◆ '}</span>}
                          {t.name}
                        </span>
                        {!i(t.id) && (
                          <span className="text-[10px] uppercase tracking-wide text-[var(--av-text-faint)]">text</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
