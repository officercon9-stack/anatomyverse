import structuresJson from './structures.json';
import modelsJson from './models.json';
import sourcesJson from './sources.json';
import chaptersJson from './chapters.json';
import type { Structure, ModelAsset, Source } from '../types';

/** All anatomy structures (teaching records). Edit src/data/structures.json to change teaching content. */
export const structures = structuresJson as unknown as Structure[];
export const models = modelsJson as unknown as ModelAsset[];
export const sources = sourcesJson as unknown as Record<string, Source>;
/** OpenStax chapter titles keyed by short code (used as the `locator` of a source). */
export const chapters = chaptersJson as Record<string, string>;

export const SCHEMATIC_MODEL_ID = 'schematic-body-v1';

export const structureById: Record<string, Structure> = Object.fromEntries(structures.map((s) => [s.id, s]));
export const modelById = Object.fromEntries(models.map((m) => [m.id, m])) as Record<string, ModelAsset>;

export function getStructure(id: string | null | undefined): Structure | undefined {
  return id ? structureById[id] : undefined;
}

/** A structure and all of its descendants (children, grand-children ...). */
export function structureWithDescendants(id: string): string[] {
  const out = [id];
  for (const s of structures) if (s.parentId === id) out.push(...structureWithDescendants(s.id));
  return out;
}

/** Ids of every structure that has a mesh in the given model (including its overlays). */
export function structuresInModel(model: ModelAsset): Set<string> {
  const ids = new Set(Object.values(model.objectMap ?? {}));
  for (const overlay of model.overlays ?? []) {
    const asset = modelById[overlay.assetId];
    if (asset) Object.values(asset.objectMap ?? {}).forEach((v) => ids.add(v));
  }
  return ids;
}
