import { Box3, type Object3D } from 'three';
import { create } from 'zustand';
import { structureWithDescendants } from '../data';

/**
 * Registry of the 3D objects that belong to each structure.
 * Meshes register themselves by structure id; the camera, labels and heart animation look them up here.
 */
const registry = new Map<string, Set<Object3D>>();

/** Bumped (at most once per tick) whenever the registry changes, so components can re-read it. */
export const useRegistryVersion = create<{ v: number; bump: () => void }>((set) => ({
  v: 0,
  bump: () => set((s) => ({ v: s.v + 1 })),
}));

let bumpQueued = false;
function queueBump() {
  if (bumpQueued) return;
  bumpQueued = true;
  queueMicrotask(() => {
    bumpQueued = false;
    useRegistryVersion.getState().bump();
  });
}

/** Register an object for a structure. Returns the function that removes it again. */
export function registerObject(structureId: string, obj: Object3D): () => void {
  if (!registry.has(structureId)) registry.set(structureId, new Set());
  registry.get(structureId)!.add(obj);
  queueBump();
  return () => {
    registry.get(structureId)?.delete(obj);
    queueBump();
  };
}

/** All objects of a structure and of its descendants. */
export function objectsOf(structureId: string, { visibleOnly = true } = {}): Object3D[] {
  const out: Object3D[] = [];
  for (const id of structureWithDescendants(structureId)) {
    for (const obj of registry.get(id) ?? []) if (!visibleOnly || obj.visible) out.push(obj);
  }
  return out;
}

/** Bounding box around the objects, or null when empty. */
export function boundsOf(objects: Object3D[]): Box3 | null {
  if (!objects.length) return null;
  const box = new Box3();
  for (const o of objects) box.expandByObject(o);
  return box.isEmpty() ? null : box;
}

/** Bounding box of everything currently visible. */
export function visibleBounds(): Box3 | null {
  const all: Object3D[] = [];
  for (const set of registry.values()) for (const o of set) if (o.visible) all.push(o);
  return boundsOf(all);
}
