// @ts-nocheck
import { useViewerStore } from './viewerStore';
import { useMemo, useCallback } from 'react';
import { modelById, structuresInModel, structureWithDescendants } from '../data';

export function useHasModel3D() {
  let e = useViewerStore((e) => e.modelId);
  let t = useMemo(() => (modelById[e] ? structuresInModel(modelById[e]) : new Set()), [e]);
  return useCallback((e) => structureWithDescendants(e).some((e) => t.has(e)), [t]);
}
