// @ts-nocheck
import { Checkbox } from './Checkbox';
import { useViewerStore } from '../../store/viewerStore';
import { avFlags } from './flags';

export function LungLayers() {
  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-[var(--av-border)] p-3">
      <p className="text-sm font-semibold">Lungs and breathing</p>
      <Checkbox
        k="breathe"
        label="Breathing animation"
        hint="The lungs and diaphragm move as in quiet breathing (15 breaths a minute)."
      />
      <Checkbox k="airflow" sub label="Air flow" hint="Blue dots: air going in. Orange dots: air going out." />
      <Checkbox
        k="inside"
        label="See inside the lungs"
        hint="Makes the lobes transparent to show the bronchial tree, the small airways and the alveoli (drawn larger than real)."
      />
      <button
        type="button"
        className="av-btn av-btn--sm self-start"
        onClick={() => {
          let _s = useViewerStore.getState();
          for (let _l of ['skin', 'muscles', 'bones', 'vessels', 'nerves', 'organs']) {
            _s.setLayerOpacity(_l, _l === 'skin' ? 0.08 : 1);
          }
          _s.setSystemFocus('respiratory');
          avFlags.set({
            inside: false,
          });
          setTimeout(() => useViewerStore.getState().focusStructure('bronchial-tree'), 200);
        }}
      >
        Show the lungs in the chest
      </button>
    </div>
  );
}
