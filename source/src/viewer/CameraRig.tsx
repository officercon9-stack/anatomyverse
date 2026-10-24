import { useCallback, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useViewerStore, type CameraRequest, type CameraView } from '../store/viewerStore';
import { boundsOf, objectsOf, useRegistryVersion, visibleBounds } from './meshRegistry';

/** Direction from the target towards the camera, per named view. (+z is the front of the body, +x the patient's left.) */
const VIEW_DIRECTIONS: Record<CameraView, [number, number, number]> = {
  anterior: [0, 0, 1],
  posterior: [0, 0, -1],
  left: [1, 0, 0],
  right: [-1, 0, 0],
  superior: [0, 1, 1e-4],
  inferior: [0, -1, 1e-4],
  oblique: [0.7, 0.35, 0.75],
};

/** Default orbit target: middle of the body. */
const BODY_CENTRE = new Vector3(0, 0.95, 0);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const FLIGHT_SECONDS = 0.65;

interface Flight { fromPos: Vector3; toPos: Vector3; fromTarget: Vector3; toTarget: Vector3; t: number }

/**
 * Orbit controls plus animated camera moves ("fly to this structure / this view").
 * Moves are requested through the store (`cameraRequest`).
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const { camera, invalidate, gl, scene } = useThree();
  const flight = useRef<Flight | null>(null);
  const request = useViewerStore((s) => s.cameraRequest);
  const modelId = useViewerStore((s) => s.modelId);
  const registryVersion = useRegistryVersion((s) => s.v);
  const satisfied = useRef(false);

  /** Start a flight for a request. Returns true when something could be framed. */
  const startFlight = useCallback(
    (req: CameraRequest, animate: boolean): boolean => {
      const oc = controls.current;
      if (!oc) return false;
      let target = oc.target.clone();
      let direction = new Vector3().subVectors(camera.position, oc.target).normalize();
      let distance = camera.position.distanceTo(oc.target);
      let framed = false;

      if (req.focusIds?.length) {
        const box = boundsOf(req.focusIds.flatMap((id) => objectsOf(id)));
        if (box) {
          framed = true;
          const size = box.getSize(new Vector3()).length();
          target = box.getCenter(new Vector3());
          distance = Math.min(Math.max(size * 2.2 + 0.18, 0.28), 3.2);
        } else if (!req.view) return false;
      }
      if (req.view) {
        direction = new Vector3(...VIEW_DIRECTIONS[req.view]).normalize();
        if (!framed) {
          // frame everything that is visible
          const box: Box3 | null = visibleBounds();
          framed = !!box;
          target = box ? box.getCenter(new Vector3()) : BODY_CENTRE.clone();
          const height = box ? Math.max(box.getSize(new Vector3()).y, 0.3) : 1.8;
          const fov = ((camera as any).fov ?? 40) * (Math.PI / 180);
          distance = Math.max((height / 2 / Math.tan(fov / 2)) * 1.28, 0.5);
        }
      }
      flight.current = {
        fromPos: camera.position.clone(),
        toPos: target.clone().add(direction.multiplyScalar(distance)),
        fromTarget: oc.target.clone(),
        toTarget: target,
        t: animate ? 0 : 1,
      };
      invalidate();
      return framed;
    },
    [camera, invalidate],
  );

  // new request -> fly (the first successful framing after a model change snaps without animation)
  useEffect(() => {
    if (startFlight(request, !satisfied.current)) satisfied.current = true;
  }, [request.seq]);
  useEffect(() => { satisfied.current = false; }, [modelId]);
  // meshes appeared after the request was made: try again until something could be framed
  useEffect(() => {
    if (!satisfied.current && startFlight(useViewerStore.getState().cameraRequest, true)) satisfied.current = true;
  }, [registryVersion, startFlight]);

  useFrame((_, delta) => {
    const f = flight.current;
    const oc = controls.current;
    if (!f || !oc) return;
    f.t = Math.min(1, f.t + delta / FLIGHT_SECONDS);
    const k = easeInOutCubic(f.t);
    camera.position.lerpVectors(f.fromPos, f.toPos, k);
    oc.target.lerpVectors(f.fromTarget, f.toTarget, k);
    oc.update();
    if (f.t >= 1) flight.current = null;
    invalidate();
  });

  // small debugging/testing API on window (used by the end-to-end tests)
  useEffect(() => {
    const w = window as any;
    w.__anatomyverse = {
      ...(w.__anatomyverse ?? {}),
      project: (id: string) => {
        const obj = objectsOf(id)[0];
        const box = obj ? boundsOf([obj]) : null;
        if (!box) return null;
        const p = box.getCenter(new Vector3()).project(camera);
        const r = gl.domElement.getBoundingClientRect();
        return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
      },
      isAnimating: () => flight.current !== null,
      scales: (id: string) => objectsOf(id, { visibleOnly: false }).map((o) => Math.round(o.scale.x * 1e3) / 1e3),
      debugObject: (name: string) => {
        const o: any = scene.getObjectByName(name);
        if (!o) return null;
        const box = new Box3().setFromObject(o);
        const chain: string[] = [];
        for (let n = o; n; n = n.parent) chain.push(`${n.type}:${n.name}:${n.visible}`);
        return { visible: o.visible, min: box.min.toArray(), max: box.max.toArray(), opacity: o.material?.opacity, chain };
      },
      sceneModels: () => scene.children.filter((c) => c.type === 'Group').map((c) => `${c.name}:${c.visible}:${c.children.length}`),
      materials: (name: string) => {
        const o: any = scene.getObjectByName(name);
        const m = o?.material;
        return m ? { visible: o.visible, opacity: m.opacity, transparent: m.transparent } : null;
      },
    };
  }, [camera, gl, scene]);

  return (
    <OrbitControls
      ref={controls as any}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      minDistance={0.15}
      maxDistance={6}
      target={BODY_CENTRE}
      onStart={() => { flight.current = null; }}
    />
  );
}
