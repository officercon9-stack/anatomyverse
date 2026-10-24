// @ts-nocheck
import { sources } from '../data';
import { ExternalLink } from 'lucide-react';

export function SourceList({ sources: e }) {
  if (!e.length) {
    return null;
  }
  let t = new Set();
  let n = e.filter((e) => {
    let n = `${e.sourceId}|${e.locator ?? ''}`;
    return !t.has(n) && (t.add(n), true);
  });
  return (
    <ul className="space-y-1 text-xs text-[var(--av-text-muted)]">
      {n.map((e) => {
        let t = sources[e.sourceId];
        if (t) {
          return (
            <li key={`${e.sourceId}-${e.locator}`}>
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-start gap-1 hover:text-[var(--av-teal)]"
              >
                <ExternalLink size={12} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  {t.title}
                  {e.locator ? ` — ${e.locator}` : ''}
                  {'. '}
                  {t.publisher}
                  {t.year ? `, ${t.year}` : ''}
                  {'. '}
                  <span className="text-[var(--av-text-faint)]">({t.license})</span>
                </span>
              </a>
            </li>
          );
        } else {
          return null;
        }
      })}
    </ul>
  );
}
