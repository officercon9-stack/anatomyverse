// @ts-nocheck
import { useProgress } from '@react-three/drei';
import { useViewerStore } from '../store/viewerStore';
import { useEffect } from 'react';
import { modelById } from '../data';
import { SchematicBody } from './SchematicBody';
import { GltfModel } from './gltf';
import { AlveolarFlow } from './flows/ParticleFlows';

export function LoadingTracker() {
  let { active: e } = useProgress();
  let t = useViewerStore((e) => e.setAssetStatus);
  useEffect(
    () =>
      t({
        loading: e,
      }),
    [e, t],
  );
  return null;
}

export function ModelScene() {
  let e = useViewerStore((e) => e.modelId);
  let t = modelById[e];
  if (t) {
    if (t.kind === 'procedural') {
      return <SchematicBody />;
    } else {
      return (
        <>
          <GltfModel asset={t} />
          {t.id === 'anatomyverse-alveoli' && <AlveolarFlow />}
        </>
      );
    }
  } else {
    return null;
  }
}
