// @ts-nocheck
import { Checkbox } from './Checkbox';
import { useViewerStore } from '../../store/viewerStore';
import { avFlags } from './flags';

export function BrainLayers() {
  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-[var(--av-border)] p-3">
      <p className="text-sm font-semibold">Brain: vessels, CSF and skull base</p>
      <Checkbox
        k="vessels"
        label="Arteries, capillaries and veins"
        hint="Named arteries come from BodyParts3D scans. Veins, dural sinuses and capillaries are schematic."
      />
      <Checkbox k="flow" sub label="Live blood flow" hint="Red: arterial, purple: capillary, blue: venous." />
      <Checkbox
        k="csf"
        label="Cerebrospinal fluid (CSF)"
        hint="Subarachnoid space, cisterns, choroid plexus and arachnoid granulations. The ventricles are part of the brain model."
      />
      <Checkbox
        k="csfFlow"
        sub
        label="Live CSF flow"
        hint="From the choroid plexus through the ventricles to the arachnoid granulations."
      />
      <Checkbox
        k="tracts"
        label="Brain-spinal cord pathways"
        hint="Corticospinal (motor, gold), dorsal column (touch, green) and spinothalamic (pain, orange). The brain, brainstem and cord turn translucent."
      />
      <Checkbox
        k="sig"
        sub
        label="Live signals"
        hint="Gold goes down to the muscles; green and orange go up to the brain."
      />
      <Checkbox
        k="mening"
        label="Three meninges: dura, arachnoid, pia"
        hint="Dura mater (tan, outer), arachnoid mater (pale, middle) and pia mater (pink, on the brain). The CSF lies between the arachnoid and the pia."
      />
      <Checkbox
        k="fossae"
        label="Skull base: three cranial fossae"
        hint="Anterior (gold), middle (teal) and posterior (coral), with the faint skull cap."
      />
      <button
        type="button"
        className="av-btn av-btn--sm self-start"
        onClick={() => useViewerStore.getState().focusStructure('brain')}
      >
        Zoom to the brain
      </button>
      <button
        type="button"
        className="av-btn av-btn--sm self-start"
        onClick={() => {
          avFlags.set({
            tracts: true,
            sig: true,
            csf: true,
            vessels: false,
          });
          let _s = useViewerStore.getState();
          _s.setLayerOpacity('muscles', 0.05);
          _s.setLayerOpacity('organs', 0.08);
          _s.setLayerOpacity('skin', 0.04);
          _s.setLayerOpacity('bones', 0.25);
          setTimeout(() => useViewerStore.getState().focusStructure('brainstem'), 200);
        }}
      >
        Show brain-spinal cord connection
      </button>
      <button
        type="button"
        className="av-btn av-btn--sm self-start"
        onClick={() => {
          avFlags.set({
            mening: true,
            csf: true,
            vessels: false,
            tracts: false,
          });
          useViewerStore.getState().focusStructure('brain');
        }}
      >
        Show the three meninges
      </button>
    </div>
  );
}
