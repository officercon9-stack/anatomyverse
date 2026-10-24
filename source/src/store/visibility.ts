import type { Structure } from '../types';

export type Layer = 'skin' | 'muscles' | 'bones' | 'vessels' | 'nerves' | 'organs';

export const LAYERS: { id: Layer; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'muscles', label: 'Muscles' },
  { id: 'bones', label: 'Bones' },
  { id: 'vessels', label: 'Blood vessels' },
  { id: 'nerves', label: 'Nervous tissue' },
  { id: 'organs', label: 'Internal organs' },
];

/** The part of the viewer state that decides what is visible. */
export interface VisibilityState {
  layerVisible: Record<Layer, boolean>;
  layerOpacity: Record<Layer, number>;
  hidden: string[];
  /** When set, only these structures (and their ancestors/descendants) are shown. */
  isolated: string[] | null;
  /** When set, structures of other systems are ghosted. */
  systemFocus: string | null;
}

export const initialVisibility: VisibilityState = {
  layerVisible: { skin: true, muscles: true, bones: true, vessels: true, nerves: true, organs: true },
  layerOpacity: { skin: 0.12, muscles: 1, bones: 1, vessels: 1, nerves: 1, organs: 1 },
  hidden: [],
  isolated: null,
  systemFocus: null,
};

type ById = Record<string, Structure>;

/** Parent chain of a structure (nearest parent first). Loop-safe. */
export function ancestorsOf(id: string, byId: ById): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let parent = byId[id]?.parentId;
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    out.push(parent);
    parent = byId[parent]?.parentId;
  }
  return out;
}

export interface ResolvedVisibility {
  visible: boolean;
  opacity: number;
  /** Ghosted or very transparent parts cannot be picked by touch/mouse. */
  pickable: boolean;
  ghosted: boolean;
}

/** Decide how one structure should be drawn, from layers, hiding, isolation and system focus. */
export function resolveVisibility(id: string, state: VisibilityState, byId: ById, opacityFactor = 1): ResolvedVisibility {
  const s = byId[id];
  const chain = [id, ...ancestorsOf(id, byId)];
  const hiddenResult = { visible: false, opacity: 0, pickable: false, ghosted: false };
  if ((state.isolated && !chain.some((c) => state.isolated!.includes(c))) || chain.some((c) => state.hidden.includes(c))) {
    return hiddenResult;
  }
  const layer = (s?.layer ?? 'organs') as Layer;
  if (!state.layerVisible[layer]) return hiddenResult;
  let opacity = state.layerOpacity[layer] * opacityFactor;
  let ghosted = false;
  if (state.systemFocus && s && s.system !== state.systemFocus && !(s.secondarySystems ?? []).includes(state.systemFocus)) {
    ghosted = true;
    opacity = Math.min(opacity, 0.08);
  }
  return { visible: opacity > 0.01, opacity, pickable: !ghosted && opacity >= 0.35, ghosted };
}

/** True when `id` is `ancestor` or lies below it. */
export function isWithin(id: string, ancestor: string | null, byId: ById): boolean {
  return ancestor ? id === ancestor || ancestorsOf(id, byId).includes(ancestor) : false;
}

/** Make a structure visible again: un-hide it and its ancestors, switch its layer on, drop conflicting isolation/focus. */
export function revealStructure(id: string, state: VisibilityState, byId: ById): VisibilityState {
  const s = byId[id];
  const chain = [id, ...ancestorsOf(id, byId)];
  const next: VisibilityState = {
    ...state,
    hidden: state.hidden.filter((h) => !chain.includes(h)),
    layerVisible: { ...state.layerVisible },
    layerOpacity: { ...state.layerOpacity },
  };
  if (s) {
    next.layerVisible[s.layer as Layer] = true;
    if (next.layerOpacity[s.layer as Layer] < 0.35) next.layerOpacity[s.layer as Layer] = 0.6;
  }
  if (next.isolated && !chain.some((c) => next.isolated!.includes(c))) next.isolated = null;
  if (next.systemFocus && s && s.system !== next.systemFocus && !(s.secondarySystems ?? []).includes(next.systemFocus)) {
    next.systemFocus = null;
  }
  return next;
}
