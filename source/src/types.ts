export type ReviewStatus = 'pending-expert-review' | string;

export interface Source { id: string; title: string; publisher: string; year?: number; url: string; license: string }
export interface SourceRef { sourceId: string; locator?: string }

/** One teaching record: a bone, muscle, organ, vessel, nerve ... */
export interface Structure {
  id: string;
  name: string;
  latinName?: string;
  synonyms: string[];
  system: string;            // skeletal, muscular, nervous, cardiovascular ...
  region: string;            // head, neck, thorax, abdomen, upper-limb ...
  layer: 'skin' | 'muscles' | 'bones' | 'vessels' | 'nerves' | 'organs';
  parentId?: string;
  location?: string;
  description: string;
  function?: string;
  landmarks?: string[];
  articulations?: string[];
  clinicalRelevance?: string;
  learningObjectives?: string[];
  sources: SourceRef[];
  reviewStatus: ReviewStatus;
  // muscles only
  origin?: string; insertion?: string; innervation?: string; actions?: string; bloodSupply?: string;
}

export interface Overlay {
  assetId: string;
  /** Name of a runtime flag; the overlay is only loaded while it is true (lazy loading). */
  gate?: string;
  /** Parts of the schematic body that this overlay replaces once it has loaded. */
  replacesParts: string[];
}

/** A 3D model: either the procedural schematic body or a glTF (stored as base64 JSON). */
export interface ModelAsset {
  id: string;
  name: string;
  kind: 'procedural' | 'gltf';
  fidelity: string;
  url?: string;
  license?: string;
  attribution?: string;
  /** 3D node name -> structure id */
  objectMap: Record<string, string>;
  overlays?: Overlay[];
}
