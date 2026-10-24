// @ts-nocheck
import { useViewFlags, setLoadStatus } from './viewFlags';
import { useViewerStore } from '../store/viewerStore';
import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { SCHEMATIC_PARTS, COLORS } from './schematic/parts';
import { modelById } from '../data';
import { BrainFlow } from './flows/BrainFlow';
import { MuscleAttachments } from './MuscleAttachments';
import { LungAirflow } from './flows/ParticleFlows';
import { OverlayErrorBoundary } from './ErrorBoundaries';
import { GltfModel } from './gltf';
import { MemoStructureMesh } from './StructureMesh';

export function SchematicBody() {
  let _g = useViewFlags();
  let e = useViewerStore((e) => e.lowPower);
  let t = useViewerStore((e) => e.detailedHeart);
  let n = e ? 0.55 : 1;
  let r = useMemo(
    () =>
      SCHEMATIC_PARTS.map((e) => ({
        spec: e,
        geometry: e.make(n),
      })),
    [n],
  );
  let [i, a] = useState({});
  let [o, s] = useState({});
  let c = (modelById['schematic-body-v1']?.overlays ?? []).filter(
    (e) => (e.gate ? _g[e.gate] : t) && !o[e.assetId] && modelById[e.assetId],
  );
  let l = new Set(c.filter((e) => i[e.assetId]).flatMap((e) => e.replacesParts));
  useEffect(() => () => r.forEach((e) => e.geometry.dispose()), [r]);
  return (
    <group name="schematic-body-v1">
      <BrainFlow />
      <MuscleAttachments />
      {t && <LungAirflow />}
      {c.map((e) => (
        <OverlayErrorBoundary
          key={e.assetId}
          onError={() => {
            s((t) => ({
              ...t,
              [e.assetId]: true,
            }));
            setLoadStatus(e.assetId, 'failed');
          }}
        >
          <React.Suspense fallback={null}>
            <GltfModel
              asset={modelById[e.assetId]}
              onLoaded={() => {
                a((t) => ({
                  ...t,
                  [e.assetId]: true,
                }));
                setLoadStatus(e.assetId, 'loaded');
              }}
            />
          </React.Suspense>
        </OverlayErrorBoundary>
      ))}
      {r
        .filter((e) => !l.has(e.spec.name))
        .map(({ spec: e, geometry: t }) => (
          <MemoStructureMesh
            key={e.name}
            name={e.name}
            structureId={e.structureId}
            geometry={t}
            color={e.color}
            baseOpacity={
              e.name === 'skull' && (_g.vessels || _g.csf || _g.fossae || _g.tracts || _g.mening)
                ? 0.2
                : e.color === COLORS.nerve && _g.tracts
                  ? 0.28
                  : e.baseOpacity
            }
            doubleSide={e.doubleSide}
            fixedOpacity={e.fixedOpacity}
          />
        ))}
    </group>
  );
}
