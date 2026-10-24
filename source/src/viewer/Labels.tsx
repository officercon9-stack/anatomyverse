import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../store/viewerStore';
import { structureById, structures } from '../data';
import { resolveVisibility } from '../store/visibility';
import { boundsOf, objectsOf, useRegistryVersion } from './meshRegistry';

/** Floating name tags above structures: the selected one, emphasised ones, and top-level parts of the focused system. */
export function Labels() {
  const registryVersion = useRegistryVersion((s) => s.v);
  const { labelsOn, selectedId, emphasis, systemFocus, mode } = useViewerStore(
    useShallow((s) => ({ labelsOn: s.labelsOn, selectedId: s.selectedId, emphasis: s.emphasis, systemFocus: s.systemFocus, mode: s.mode })),
  );
  const visibility = useViewerStore(
    useShallow((s) => ({
      layerVisible: s.layerVisible, layerOpacity: s.layerOpacity, hidden: s.hidden, isolated: s.isolated, systemFocus: s.systemFocus,
    })),
  );

  const labelled = useMemo(() => {
    const ids = new Set<string>();
    if (selectedId) ids.add(selectedId);
    if (labelsOn) {
      emphasis.forEach((id) => ids.add(id));
      // with a system in focus, name every top-level (parentless) structure of that system
      if (systemFocus) structures.filter((s) => s.system === systemFocus && !s.parentId).forEach((s) => ids.add(s.id));
    }
    return [...ids];
  }, [selectedId, labelsOn, emphasis, systemFocus]);

  const placed = useMemo(
    () =>
      labelled
        .map((id) => {
          if (!resolveVisibility(id, visibility, structureById).visible && id !== selectedId) return null;
          const box = boundsOf(objectsOf(id));
          if (!box) return null;
          const c = box.getCenter(new Vector3());
          return { id, position: [c.x, box.max.y + 0.012, c.z] as [number, number, number] };
        })
        .filter((x): x is { id: string; position: [number, number, number] } => x !== null),
    [labelled, registryVersion, visibility, selectedId],
  );

  return (
    <>
      {placed.map(({ id, position }) => {
        const hideName = mode === 'identify' && id === selectedId; // quiz mode: don't give away the answer
        const selected = id === selectedId;
        return (
          <Html key={id} position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`av-label ${selected ? 'av-label--selected' : ''}`} role="note">
              <span aria-hidden className="av-label__pin">{selected ? '◆' : '•'}</span>
              {hideName ? '?' : structureById[id]?.name}
            </div>
          </Html>
        );
      })}
    </>
  );
}
