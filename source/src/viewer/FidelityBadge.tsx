// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { useLoadStatus } from './viewFlags';
import { modelById } from '../data';
import { useState } from 'react';
import { Box, Info } from 'lucide-react';

export function FidelityBadge() {
  let e = useViewerStore((e) => e.modelId);
  let t = useViewerStore((e) => e.detailedHeart);
  let n = useLoadStatus('zanatomy-heart');
  let r = modelById[e];
  let [i, a] = useState(false);
  if (!r) {
    return null;
  }
  let o = r.fidelity === 'anatomical' ? 'av-badge--ok' : 'av-badge--warn';
  return (
    <div className="absolute bottom-3 left-14 z-10 max-w-[min(22rem,calc(100%-4.5rem))] md:left-14">
      <button type="button" className={`av-badge ${o}`} onClick={() => a(!i)} aria-expanded={i}>
        <Box size={13} aria-hidden />
        {r.fidelity === 'schematic' ? (
          <span>
            Schematic model{n === 'loaded' && t ? ' + detailed heart' : ''}
            <span className="hidden 2xl:inline">{' — body not anatomically accurate'}</span>
            <span className="sr-only">
              {' — the body is not anatomically accurate'}
              {n === 'loaded' && t ? '; the heart is a scan-derived model' : ''}
            </span>
          </span>
        ) : r.fidelity === 'simplified' ? (
          'Simplified model'
        ) : (
          'Anatomical model'
        )}
        <Info size={13} aria-hidden />
      </button>
      {i && (
        <div className="av-card absolute bottom-full mb-2 w-72 max-w-[80vw] p-3 text-xs leading-relaxed text-[var(--av-text-muted)]">
          <p className="mb-1 font-medium text-[var(--av-text)]">{r.name}</p>
          <p>{r.description}</p>
          <p className="mt-1">
            {'Licence: '}
            {r.license}
          </p>
          {e === 'schematic-body-v1' && n === 'loaded' && t && modelById['zanatomy-heart'] && (
            <p className="mt-2">
              {'Heart: '}
              {modelById['zanatomy-heart'].attribution}
              {' Licence: '}
              {modelById['zanatomy-heart'].license}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
