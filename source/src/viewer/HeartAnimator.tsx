import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Object3D } from 'three';
import { useViewerStore } from '../store/viewerStore';
import { boundsOf, objectsOf, useRegistryVersion } from './meshRegistry';
import {
  ATRIA, AV_VALVES, SEMILUNAR_VALVES, VENTRICLES, cardiacPhaseAt, chamberScale, heartClock, heartSoundAt,
  playHeartSound, valveClosure, vibrateHeart,
} from './heartCycle';

type Group = 'atria' | 'ventricles' | 'av' | 'semilunar';
interface Entry { mesh: Object3D; centre: Vector3; own?: Vector3 | null; group: Group }

const heartMeshes = () => objectsOf('heart', { visibleOnly: false });
const centreOf = (id: string) => boundsOf(objectsOf(id, { visibleOnly: false }))?.getCenter(new Vector3()) ?? null;

function resetHeartTransforms() {
  for (const m of heartMeshes()) {
    m.scale.setScalar(1);
    m.position.set(0, 0, 0);
  }
}

/**
 * Makes the heart beat: atria and ventricles shrink in turn (scaling about their own centre),
 * valves open/close, and the current phase is published for the info panel, ECG and sounds.
 * Renders nothing.
 */
export function HeartAnimator() {
  const modelId = useViewerStore((s) => s.modelId);
  const beating = useViewerStore((s) => s.heartBeating);
  const bpm = useViewerStore((s) => s.heartRate);
  const setHeartPhase = useViewerStore((s) => s.setHeartPhase);
  const registryVersion = useRegistryVersion((s) => s.v);
  const { invalidate } = useThree();
  const entries = useRef<Entry[]>([]);
  const phase = useRef(0);
  const lastKey = useRef<string | null>(null);

  // (re)build the list of animated meshes whenever the set of meshes changes
  useEffect(() => {
    resetHeartTransforms();
    const list: Entry[] = [];
    const ventricleCentre = boundsOf(VENTRICLES.flatMap((id) => objectsOf(id, { visibleOnly: false })))?.getCenter(new Vector3()) ?? null;
    const chamberCentres = Object.fromEntries([...ATRIA, ...VENTRICLES].map((id) => [id, centreOf(id)]));
    for (const mesh of heartMeshes()) {
      const sid: string = mesh.userData.structureId ?? '';
      const isAv = AV_VALVES.includes(sid);
      if ((isAv || SEMILUNAR_VALVES.includes(sid)) && ventricleCentre) {
        list.push({ mesh, centre: ventricleCentre, own: centreOf(sid), group: isAv ? 'av' : 'semilunar' });
      } else if ((ATRIA.includes(sid) || VENTRICLES.includes(sid)) && chamberCentres[sid]) {
        list.push({ mesh, centre: chamberCentres[sid]!, group: ATRIA.includes(sid) ? 'atria' : 'ventricles' });
      } else if (ventricleCentre) {
        list.push({ mesh, centre: ventricleCentre, group: 'ventricles' });
      }
    }
    entries.current = list;
    invalidate();
  }, [registryVersion]);

  useEffect(() => {
    if (!beating) {
      resetHeartTransforms();
      setHeartPhase(null);
      lastKey.current = null;
    }
    invalidate();
  }, [beating]);

  useEffect(() => () => resetHeartTransforms(), []);

  useFrame((_, delta) => {
    if (!beating) return;
    phase.current = (phase.current + (bpm / 60) * Math.min(delta, 0.1)) % 1;
    heartClock.phase = phase.current;
    const scale = chamberScale(phase.current);
    const valves = valveClosure(phase.current);
    const p = new Vector3();
    for (const { mesh, centre, group, own } of entries.current) {
      if ((group === 'av' || group === 'semilunar') && own) {
        // valves move with the ventricles and shrink as they close
        const s = scale.ventricles;
        const closure = group === 'av' ? valves.av : valves.semilunar;
        const k = s * (1 - (modelId === 'schematic-body-v1' ? 0.7 : 0.45) * closure);
        p.copy(own).sub(centre).multiplyScalar(s).add(centre);
        mesh.scale.setScalar(k);
        mesh.position.set(p.x - k * own.x, p.y - k * own.y, p.z - k * own.z);
        continue;
      }
      const s = scale[group as 'atria' | 'ventricles'];
      mesh.scale.setScalar(s);
      mesh.position.set(centre.x * (1 - s), centre.y * (1 - s), centre.z * (1 - s));
    }
    // publish phase + sound only when they change
    const name = cardiacPhaseAt(phase.current);
    const sound = heartSoundAt(phase.current);
    const key = `${name}|${sound ?? ''}`;
    if (key !== lastKey.current) {
      const previousSound = (lastKey.current ?? '').split('|')[1];
      lastKey.current = key;
      setHeartPhase(key);
      if (sound && sound !== previousSound) {
        const st = useViewerStore.getState();
        if (st.heartSound) playHeartSound(sound);
        if (st.heartVibrate) vibrateHeart(sound);
      }
    }
    invalidate();
  });
  return null;
}
