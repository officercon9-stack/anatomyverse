import { create } from 'zustand';
import { structures, structureById, SCHEMATIC_MODEL_ID } from '../data';
import { initialVisibility, revealStructure, type Layer } from './visibility';

export type CameraView = 'anterior' | 'posterior' | 'left' | 'right' | 'superior' | 'inferior' | 'oblique';
export type ViewerMode = 'explore' | 'identify' | string;

export interface CameraRequest {
  /** Increases on every request so the camera rig notices repeated identical requests. */
  seq: number;
  view?: CameraView;
  focusIds?: string[];
}

const nextRequest = (prev: CameraRequest, patch: Omit<CameraRequest, 'seq'>): CameraRequest => ({ seq: prev.seq + 1, ...patch });

/** Low-power devices (<= 4 GB memory, phones) get lighter rendering. Can be forced via localStorage. */
function detectLowPower(): boolean {
  try {
    const stored = localStorage.getItem('av.lowPower');
    if (stored !== null) return stored === '1';
  } catch { /* storage blocked */ }
  if (typeof navigator === 'undefined') return false;
  const memory = (navigator as any).deviceMemory as number | undefined;
  return (memory !== undefined && memory <= 4) || /Mobi|Android/i.test(navigator.userAgent);
}

export interface ViewerState {
  // visibility
  layerVisible: Record<Layer, boolean>;
  layerOpacity: Record<Layer, number>;
  hidden: string[];
  isolated: string[] | null;
  systemFocus: string | null;
  // model + selection
  modelId: string;
  selectedId: string | null;
  hoveredId: string | null;
  labelsOn: boolean;
  lowPower: boolean;
  mode: ViewerMode;
  cameraRequest: CameraRequest;
  assetError: string | null;
  assetLoading: boolean;
  emphasis: string[];
  xray: boolean;
  detailedHeart: boolean;
  // heart animation
  heartBeating: boolean;
  heartRate: number;
  heartPhase: string | null;
  bloodFlow: boolean;
  heartSound: boolean;
  heartVibrate: boolean;
  // actions
  setDetailedHeart(v: boolean): void;
  setXray(v: boolean): void;
  setHeartBeating(v: boolean): void;
  setHeartPhase(v: string | null): void;
  setBloodFlow(v: boolean): void;
  setHeartSound(v: boolean): void;
  setHeartVibrate(v: boolean): void;
  setHeartRate(bpm: number): void;
  select(id: string | null): void;
  hover(id: string | null): void;
  /** Select a structure, make it visible, and fly the camera to it. */
  focusStructure(id: string, options?: { reveal: boolean }): void;
  setView(view: CameraView): void;
  /** Frame some structures (or the whole visible body when empty) from a given view. */
  frame(ids: string[], view?: CameraView): void;
  resetCamera(): void;
  hideStructure(id: string): void;
  showStructure(id: string): void;
  setLayerVisible(layer: Layer, visible: boolean): void;
  setLayerOpacity(layer: Layer, opacity: number): void;
  hideCategory(filter: { layer?: string; system?: string }): void;
  showCategory(filter: { layer?: string; system?: string }): void;
  isolate(ids: string[]): void;
  restoreVisibility(): void;
  resetAll(): void;
  setSystemFocus(system: string | null): void;
  showOnlyLayers(layers: Layer[]): void;
  setLabels(on: boolean): void;
  setLowPower(on: boolean): void;
  setModel(id: string): void;
  setMode(mode: ViewerMode): void;
  setAssetStatus(s: { loading?: boolean; error?: string | null }): void;
  setEmphasis(ids: string[]): void;
}

const visibilityFields = (s: ViewerState) => ({
  layerVisible: s.layerVisible, layerOpacity: s.layerOpacity, hidden: s.hidden, isolated: s.isolated, systemFocus: s.systemFocus,
});

const matches = (s: { layer: string; system: string }, f: { layer?: string; system?: string }) =>
  (!f.layer || s.layer === f.layer) && (!f.system || s.system === f.system);

export const useViewerStore = create<ViewerState>((set, get) => ({
  ...structuredClone(initialVisibility),
  modelId: SCHEMATIC_MODEL_ID,
  selectedId: null,
  hoveredId: null,
  labelsOn: true,
  lowPower: detectLowPower(),
  mode: 'explore',
  cameraRequest: { seq: 0, view: 'anterior' },
  assetError: null,
  assetLoading: false,
  emphasis: [],
  xray: false,
  detailedHeart: true,
  heartBeating: false,
  heartRate: 60,
  heartPhase: null,
  bloodFlow: true,
  heartSound: false,
  heartVibrate: false,

  setDetailedHeart: (v) => set({ detailedHeart: v }),
  setXray: (v) => set({ xray: v }),
  setHeartBeating: (v) => set((s) => ({ heartBeating: v, xray: v ? true : s.selectedId ? s.xray : false })),
  setHeartPhase: (v) => set({ heartPhase: v }),
  setBloodFlow: (v) => set({ bloodFlow: v }),
  setHeartSound: (v) => set({ heartSound: v }),
  setHeartVibrate: (v) => set({ heartVibrate: v }),
  setHeartRate: (bpm) => set({ heartRate: Math.max(30, Math.min(180, bpm)) }),

  select: (id) => set((s) => ({ selectedId: id, xray: id || s.heartBeating ? s.xray : false })),
  hover: (id) => (get().hoveredId === id ? undefined : set({ hoveredId: id })),

  focusStructure: (id, options = { reveal: true }) => {
    const s = get();
    const patch = options.reveal ? visibilityFields({ ...s, ...revealStructure(id, s, structureById) }) : {};
    set({ ...patch, selectedId: id, xray: true, cameraRequest: nextRequest(s.cameraRequest, { focusIds: [id] }) });
  },
  setView: (view) => set((s) => ({ cameraRequest: nextRequest(s.cameraRequest, { view }) })),
  frame: (ids, view) =>
    set((s) => ({ cameraRequest: nextRequest(s.cameraRequest, { focusIds: ids.length ? ids : undefined, view }) })),
  resetCamera: () => set((s) => ({ cameraRequest: nextRequest(s.cameraRequest, { view: 'anterior' }) })),

  hideStructure: (id) => set((s) => ({ hidden: s.hidden.includes(id) ? s.hidden : [...s.hidden, id] })),
  showStructure: (id) => set((s) => visibilityFields({ ...s, ...revealStructure(id, s, structureById) })),
  setLayerVisible: (layer, visible) => set((s) => ({ layerVisible: { ...s.layerVisible, [layer]: visible } })),
  setLayerOpacity: (layer, opacity) =>
    set((s) => ({ layerOpacity: { ...s.layerOpacity, [layer]: Math.max(0, Math.min(1, opacity)) } })),
  hideCategory: (filter) =>
    set((s) => {
      const ids = structures.filter((x) => matches(x, filter)).map((x) => x.id);
      return { hidden: Array.from(new Set([...s.hidden, ...ids])) };
    }),
  showCategory: (filter) =>
    set((s) => {
      const ids = new Set(structures.filter((x) => matches(x, filter)).map((x) => x.id));
      return {
        hidden: s.hidden.filter((h) => !ids.has(h)),
        layerVisible: filter.layer ? { ...s.layerVisible, [filter.layer]: true } : s.layerVisible,
      };
    }),
  isolate: (ids) => set({ isolated: ids.length ? ids : null }),
  restoreVisibility: () => set({ hidden: [], isolated: null, systemFocus: null }),
  resetAll: () =>
    set((s) => ({
      ...structuredClone(initialVisibility),
      selectedId: null,
      xray: false,
      emphasis: [],
      cameraRequest: nextRequest(s.cameraRequest, { view: 'anterior' }),
    })),
  setSystemFocus: (system) => set({ systemFocus: system }),
  showOnlyLayers: (layers) =>
    set((s) => ({
      layerVisible: Object.fromEntries(Object.keys(s.layerVisible).map((l) => [l, layers.includes(l as Layer)])) as Record<Layer, boolean>,
    })),
  setLabels: (on) => set({ labelsOn: on }),
  setLowPower: (on) => {
    try { localStorage.setItem('av.lowPower', on ? '1' : '0'); } catch { /* ignore */ }
    set({ lowPower: on });
  },
  setModel: (id) => set({ modelId: id, selectedId: null, assetError: null }),
  setMode: (mode) => set({ mode }),
  setAssetStatus: ({ loading, error }) =>
    set((s) => ({ assetLoading: loading ?? s.assetLoading, assetError: error === undefined ? s.assetError : error })),
  setEmphasis: (ids) => set({ emphasis: ids }),
}));
