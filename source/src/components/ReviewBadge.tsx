// @ts-nocheck
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export function ReviewBadge({ status: e }) {
  if (e === 'reviewed') {
    return (
      <span className="av-badge av-badge--ok" title="Checked by a qualified reviewer">
        <ShieldCheck size={12} aria-hidden />
        {' Expert reviewed'}
      </span>
    );
  } else {
    return (
      <span
        className="av-badge av-badge--warn"
        title="Written from the cited references but not yet checked by a qualified anatomist. Verify with your course materials."
      >
        <ShieldAlert size={12} aria-hidden /> {e === 'draft' ? 'Draft' : 'Educational content · under review'}
      </span>
    );
  }
}
