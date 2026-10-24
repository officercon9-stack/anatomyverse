// @ts-nocheck
import * as React from 'react';
import { useState, useRef } from 'react';
import { webglAvailable } from './webgl';
import { useViewerStore } from '../store/viewerStore';
import { structureById } from '../data';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { ModelErrorBoundary } from './ErrorBoundaries';
import { ModelScene, LoadingTracker } from './ModelScene';
import { Labels } from './Labels';
import { HeartAnimator } from './HeartAnimator';
import { BloodFlow } from './BloodFlow';
import { CameraRig } from './CameraRig';
import { FidelityBadge } from './FidelityBadge';
import { Toolbar } from './Toolbar';
import { HoverCard } from './HoverCard';
import { PopOutHud } from './PopOut';
import { SelectionCard } from './SelectionCard';
import { HeartPanel } from './HeartPanel';
import { AssetStatusOverlay } from './AssetStatusOverlay';
import { Eye, EyeOff } from 'lucide-react';

export function AnatomyViewer({
  className: e = '',
  minimal: t = false,
  ariaLabel: n = 'Interactive 3D anatomy model',
}) {
  let [r] = useState(() => (typeof document > 'u' ? false : webglAvailable()));
  let { lowPower: i, modelId: a, select: o, selectedId: s } = useViewerStore();
  let c = useRef(null);
  let l = s ? structureById[s]?.name : null;
  let d = useViewerStore((e) => e.mode);
  if (r) {
    return (
      <div
        className={`relative overflow-hidden ${e}`}
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #1b2a4a 0%, #0c1426 55%, #060b16 100%)',
        }}
        onPointerDown={(e) =>
          (c.current = {
            x: e.clientX,
            y: e.clientY,
          })
        }
        data-testid="anatomy-viewer"
      >
        <Canvas
          frameloop="demand"
          dpr={1}
          gl={{
            antialias: !i,
            powerPreference: i ? 'low-power' : 'high-performance',
            preserveDrawingBuffer: false,
            alpha: true,
          }}
          onCreated={({ gl: e }) => {
            e.toneMapping = 4;
            e.toneMappingExposure = 1.05;
            e.setClearColor(0, 0);
          }}
          camera={{
            fov: 38,
            near: 0.02,
            far: 50,
            position: [0, 0.95, 3.4],
          }}
          onPointerMissed={(e) => {
            let t = c.current;
            if (!t || !(Math.hypot(e.clientX - t.x, e.clientY - t.y) > 5)) {
              o(null);
            }
          }}
          aria-label={n}
          role="img"
        >
          <hemisphereLight args={['#dfe9ff', '#1b2335', i ? 0.9 : 0.55]} />
          <directionalLight position={[2, 3, 3]} intensity={i ? 1.4 : 1.1} />
          <directionalLight position={[-2.5, 1.5, -2]} intensity={0.5} color="#9ec5ff" />
          {!i && (
            <>
              <Environment resolution={128} frames={1}>
                <Lightformer form="rect" intensity={2.2} position={[2, 3, 4]} scale={[4, 2, 1]} color="#ffffff" />
                <Lightformer form="rect" intensity={1.2} position={[-4, 1, 2]} scale={[3, 3, 1]} color="#cfe3ff" />
                <Lightformer form="ring" intensity={1.6} position={[0, 2, -5]} scale={3} color="#5eead4" />
                <Lightformer
                  form="rect"
                  intensity={0.6}
                  position={[0, -3, 0]}
                  rotation-x={Math.PI / 2}
                  scale={[6, 6, 1]}
                  color="#1e293b"
                />
              </Environment>
              <ContactShadows
                position={[0, 0.001, 0]}
                opacity={0.55}
                scale={2.4}
                blur={2.4}
                far={1.2}
                resolution={256}
                frames={1}
                color="#000000"
              />
            </>
          )}
          <ModelErrorBoundary resetKey={a}>
            <React.Suspense fallback={null}>
              <ModelScene />
            </React.Suspense>
          </ModelErrorBoundary>
          <Labels />
          <HeartAnimator />
          <BloodFlow />
          <CameraRig />
          <LoadingTracker />
        </Canvas>
        <FidelityBadge />
        {!t && (
          <div className="absolute inset-x-3 top-3 z-10 flex justify-end">
            <Toolbar compact />
          </div>
        )}
        <HoverCard />
        <PopOutHud />
        <SelectionCard />
        <HeartPanel />
        <AssetStatusOverlay />
        <p className="sr-only" aria-live="polite">
          {l ? (d === 'identify' ? 'A structure is selected.' : `Selected: ${l}`) : 'No structure selected.'}
        </p>
        {!t && (
          <p className="pointer-events-none absolute bottom-3 right-3 z-10 hidden items-center gap-1 text-[11px] text-[var(--av-text-faint)] 2xl:flex">
            <Eye size={12} aria-hidden />
            {' Drag to rotate · Scroll/pinch to zoom · Right-drag/two-finger to pan'}
          </p>
        )}
      </div>
    );
  } else {
    return (
      <div className={`relative grid place-items-center bg-[var(--av-viewport)] p-6 ${e}`} role="alert">
        <div className="av-card max-w-sm p-5 text-sm">
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <EyeOff size={16} aria-hidden />
            {' 3D view not available'}
          </p>
          <p className="text-[var(--av-text-muted)]">
            Your browser or device does not support WebGL, so the 3D model cannot be shown. You can still search
            structures, read their details, and use lessons, quizzes and flashcards.
          </p>
        </div>
      </div>
    );
  }
}
