// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { TriangleAlert, LoaderCircle } from 'lucide-react';
import { modelById } from '../data';

export function AssetStatusOverlay() {
  let { assetError: e, assetLoading: t, modelId: n, setModel: r } = useViewerStore();
  if (e) {
    return (
      <div className="absolute inset-0 z-20 grid place-items-center bg-[var(--av-bg)]/80 p-6" role="alert">
        <div className="av-card max-w-md p-5 text-sm">
          <p className="mb-2 flex items-center gap-2 font-semibold text-[var(--av-warn)]">
            <TriangleAlert size={18} aria-hidden />
            {' 3D model unavailable'}
          </p>
          <p className="text-[var(--av-text-muted)]">
            “{modelById[n]?.name}
            {'” could not be loaded. '}
            {modelById[n]?.kind === 'gltf' && (
              <>
                {'Expected file: '}
                <code>{modelById[n]?.url}</code>.
              </>
            )}
            {' The structure list, search, lessons and quizzes still work.'}
          </p>
          <p className="mt-2 text-xs text-[var(--av-text-faint)]">
            {'Details: '}
            {e}
          </p>
          <button type="button" className="av-btn av-btn--primary mt-4" onClick={() => r('schematic-body-v1')}>
            Switch to the schematic model
          </button>
        </div>
      </div>
    );
  } else if (t) {
    return (
      <div className="absolute inset-0 z-20 grid place-items-center" role="status" aria-live="polite">
        <span className="av-badge">
          <LoaderCircle size={14} className="animate-spin" aria-hidden />
          {' Loading 3D model…'}
        </span>
      </div>
    );
  } else {
    return null;
  }
}
