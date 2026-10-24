// @ts-nocheck
import { useViewerStore } from '../../store/viewerStore';
import { useLoadStatus } from '../../viewer/viewFlags';
import { modelById } from '../../data';

export function DetailedModelToggle() {
  let { detailedHeart: e, setDetailedHeart: t } = useViewerStore();
  let n = useLoadStatus('zanatomy-heart');
  let r = modelById['zanatomy-heart'];
  if (r) {
    return (
      <label className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--av-border)] p-3 text-sm">
        <input type="checkbox" className="av-checkbox mt-0.5" checked={e} onChange={(e) => t(e.target.checked)} />
        <span>
          Detailed heart and brain
          <span className="block text-[11px] leading-snug text-[var(--av-text-faint)]">
            {n === 'failed'
              ? 'Could not load — the simplified heart is shown instead.'
              : n === 'loading' || (e && !n)
                ? 'Loading…'
                : 'Scan-derived heart and brain drawn inside the body in place of the simplified ones.'}{' '}
            {r.license}.
          </span>
        </span>
      </label>
    );
  } else {
    return null;
  }
}
