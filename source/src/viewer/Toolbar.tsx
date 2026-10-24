// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { RotateCcw, HeartPulse, ScanEye, Tag, Gauge } from 'lucide-react';

export var VIEW_BUTTONS = [
  {
    id: 'anterior',
    label: 'Anterior view',
    short: 'Ant',
  },
  {
    id: 'posterior',
    label: 'Posterior view',
    short: 'Post',
  },
  {
    id: 'left',
    label: "Left lateral view (patient's left)",
    short: 'L',
  },
  {
    id: 'right',
    label: "Right lateral view (patient's right)",
    short: 'R',
  },
  {
    id: 'superior',
    label: 'Superior view',
    short: 'Sup',
  },
  {
    id: 'inferior',
    label: 'Inferior view',
    short: 'Inf',
  },
  {
    id: 'oblique',
    label: 'Anterolateral oblique view',
    short: 'Obl',
  },
];

export function Toolbar({ compact: e = false }) {
  let {
    setView: t,
    resetAll: n,
    labelsOn: r,
    setLabels: i,
    lowPower: a,
    setLowPower: o,
    xray: s,
    setXray: c,
    selectedId: l,
    heartBeating: u,
    setHeartBeating: d,
  } = useViewerStore();
  return (
    <div className="av-toolbar" role="toolbar" aria-label="3D view controls">
      <div className="flex gap-1" role="group" aria-label="Standard views">
        {VIEW_BUTTONS.map((e) => (
          <button
            key={e.id}
            type="button"
            className="av-tool"
            onClick={() => t(e.id)}
            title={e.label}
            aria-label={e.label}
          >
            {e.short}
          </button>
        ))}
      </div>
      <span className="av-toolbar__sep" aria-hidden />
      <button
        type="button"
        className="av-tool"
        onClick={n}
        title="Reset view, layers and selection"
        aria-label="Reset view, layers and selection"
      >
        <RotateCcw size={15} /> {!e && <span>Reset</span>}
      </button>
      <button
        type="button"
        className="av-tool"
        aria-pressed={u}
        onClick={() => d(!u)}
        title="Living anatomy: make the heart beat"
        aria-label={u ? 'Stop heartbeat' : 'Start heartbeat'}
      >
        <HeartPulse size={15} /> {!e && <span>Beat</span>}
      </button>
      <button
        type="button"
        className="av-tool"
        aria-pressed={s}
        disabled={!l && !u}
        onClick={() => c(!s)}
        title="X-ray: make everything except the selected structure see-through"
        aria-label="Toggle X-ray view of the selected structure"
      >
        <ScanEye size={15} /> {!e && <span>X-ray</span>}
      </button>
      <button
        type="button"
        className="av-tool"
        aria-pressed={r}
        onClick={() => i(!r)}
        title="Toggle labels"
        aria-label="Toggle labels"
      >
        <Tag size={15} /> {!e && <span>Labels</span>}
      </button>
      <button
        type="button"
        className="av-tool"
        aria-pressed={a}
        onClick={() => o(!a)}
        title="Simplified rendering for low-powered devices"
        aria-label="Toggle simplified rendering mode"
      >
        <Gauge size={15} /> {!e && <span>{a ? 'Lite' : 'Full'}</span>}
      </button>
    </div>
  );
}
