import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, InstancedMesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three';
import { useViewerStore } from '../store/viewerStore';
import { SCHEMATIC_MODEL_ID } from '../data';
import { bloodSpeedAt, heartClock } from './heartCycle';

type Point = [number, number, number];

/** Dots per path. */
const DOTS_PER_PATH = 18;

// Centre lines of the schematic blood flow (metres, y up). Both colours share the heart chambers.
const HEART_CHAMBER_LOOP: Point[] = [
  [-0.03, 1.255, 0.045], [-0.012, 1.236, 0.058], [0.006, 1.212, 0.074], [0.005, 1.246, 0.088], [0.012, 1.3, 0.078], [0.016, 1.328, 0.05],
];
/** Blue (oxygen-poor) paths: body -> right heart -> lungs. */
const VENOUS_PATHS: Point[][] = [
  [[-0.036, 1.39, 0.024], [-0.036, 1.31, 0.04], ...HEART_CHAMBER_LOOP, [-0.07, 1.3, 0.01]],
  [[-0.024, 0.95, -0.028], [-0.03, 1.05, -0.022], [-0.031, 1.19, 0.018], ...HEART_CHAMBER_LOOP, [0.08, 1.3, 0.005]],
];
const AORTA_LOOP: Point[] = [
  [0.024, 1.265, 0.012], [0.037, 1.242, 0.03], [0.05, 1.205, 0.042], [0.022, 1.249, 0.048], [0.012, 1.31, 0.05],
  [0.006, 1.352, 0.028], [0.02, 1.364, -0.01], [0.03, 1.33, -0.045], [0.026, 1.2, -0.05], [0.015, 1, -0.045],
];
/** Red (oxygen-rich) paths: lungs -> left heart -> aorta -> body. */
const ARTERIAL_PATHS: Point[][] = [
  [[-0.075, 1.27, -0.01], [-0.02, 1.262, -0.004], ...AORTA_LOOP],
  [[0.085, 1.27, -0.01], [0.05, 1.266, 0.002], ...AORTA_LOOP],
];

/** Small spheres travelling along curves (faster during ventricular contraction). */
function FlowDots({ paths, color }: { paths: Point[][]; color: string }) {
  const curves = useMemo(() => paths.map((p) => new CatmullRomCurve3(p.map((v) => new Vector3(...v)), false, 'centripetal')), [paths]);
  const mesh = useRef<InstancedMesh>(null);
  const bpm = useViewerStore((s) => s.heartRate);
  const count = curves.length * DOTS_PER_PATH;
  const progress = useMemo(
    () => Array.from({ length: count }, (_, i) => (i % DOTS_PER_PATH) / DOTS_PER_PATH + Math.random() * 0.02),
    [count],
  );
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new SphereGeometry(0.0042, 8, 6), []);
  const material = useMemo(() => new MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 }), [color]);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [invalidate]);

  useFrame((_, delta) => {
    const im = mesh.current;
    if (!im) return;
    const step = (bpm / 60) * Math.min(delta, 0.1) * 0.11 * bloodSpeedAt(heartClock.phase);
    for (let i = 0; i < count; i++) {
      progress[i] = (progress[i] + step) % 1;
      const p = curves[Math.floor(i / DOTS_PER_PATH)].getPointAt(progress[i]);
      dummy.position.copy(p);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    invalidate();
  });
  return <instancedMesh ref={mesh} args={[geometry, material, count]} renderOrder={10} frustumCulled={false} raycast={() => undefined} />;
}

/** Blood-flow dots for the schematic body while the heart beats. */
export function BloodFlow() {
  const show = useViewerStore((s) => s.bloodFlow && s.heartBeating && s.modelId === SCHEMATIC_MODEL_ID);
  if (!show) return null;
  return (
    <group name="blood-flow">
      <FlowDots paths={VENOUS_PATHS} color="#4f8cff" />
      <FlowDots paths={ARTERIAL_PATHS} color="#ff4d4d" />
    </group>
  );
}
