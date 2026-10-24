/**
 * Simplified cardiac cycle used by the heart animation, ECG trace and sounds.
 * `phase` runs 0..1 over one heartbeat; all functions take a phase (values > 1 wrap).
 */

/** Shared clock: the heart animator writes the current phase here, the ECG trace and blood flow read it. */
export const heartClock = { phase: 0 };

/** Illustrative ECG waveform (P wave, QRS complex, T wave as gaussians). */
export function ecgValue(phase: number): number {
  const t = phase % 1;
  const bump = (centre: number, width: number, height: number) => height * Math.exp(-((t - centre) ** 2) / (2 * width * width));
  return bump(0.04, 0.018, 0.15) + bump(0.135, 0.006, -0.12) + bump(0.15, 0.007, 1) + bump(0.165, 0.007, -0.25) + bump(0.4, 0.035, 0.3);
}

export type CardiacPhase = 'atrial-systole' | 'av-delay' | 'ventricular-systole' | 'diastole';

export const PHASE_TEXT: Record<CardiacPhase, { label: string; text: string }> = {
  'atrial-systole': { label: 'Atria contracting', text: 'The atria squeeze, topping up the ventricles with blood.' },
  'av-delay': {
    label: 'Brief pause (AV node delay)',
    text: 'The electrical signal is briefly delayed so the ventricles can finish filling.',
  },
  'ventricular-systole': {
    label: 'Ventricles contracting',
    text: 'The ventricles squeeze, pumping blood into the pulmonary trunk and aorta.',
  },
  diastole: { label: 'Relaxation (diastole)', text: 'The whole heart relaxes and fills with blood again.' },
};

export function cardiacPhaseAt(phase: number): CardiacPhase {
  const t = phase % 1;
  return t < 0.12 ? 'atrial-systole' : t < 0.16 ? 'av-delay' : t < 0.5 ? 'ventricular-systole' : 'diastole';
}

const sineWindow = (t: number, from: number, to: number) => (t >= from && t < to ? Math.sin(((t - from) / (to - from)) * Math.PI) : 0);
const ramp = (t: number, from: number, to: number) => Math.max(0, Math.min(1, (t - from) / (to - from)));

/** Scale of the atria and ventricles (they shrink 10% when they contract). */
export function chamberScale(phase: number) {
  const t = phase % 1;
  return { atria: 1 - 0.1 * sineWindow(t, 0, 0.12), ventricles: 1 - 0.1 * sineWindow(t, 0.16, 0.5) };
}

/** How closed each valve group is (0 open .. 1 closed). */
export function valveClosure(phase: number) {
  const t = phase % 1;
  return {
    av: t < 0.16 ? 1 - ramp(t, 0.14, 0.16) : t < 0.5 ? 0 : ramp(t, 0.55, 0.6),
    semilunar: t < 0.2 ? 0 : t < 0.48 ? ramp(t, 0.2, 0.23) : 1 - ramp(t, 0.48, 0.5),
  };
}

export const AV_VALVES = ['tricuspid-valve', 'mitral-valve'];
export const SEMILUNAR_VALVES = ['pulmonary-valve', 'aortic-valve'];
export const ATRIA = ['right-atrium', 'left-atrium'];
export const VENTRICLES = ['right-ventricle', 'left-ventricle'];

export type HeartSound = 'lub' | 'dub';
/** Which heart sound ("lub" = AV valves close, "dub" = semilunar valves close) is playing at this phase. */
export function heartSoundAt(phase: number): HeartSound | null {
  const t = phase % 1;
  return t >= 0.16 && t < 0.24 ? 'lub' : t >= 0.5 && t < 0.58 ? 'dub' : null;
}

/** Speed of the flowing blood dots depends on the phase. */
export function bloodSpeedAt(phase: number): number {
  const p = cardiacPhaseAt(phase);
  return p === 'ventricular-systole' ? 2.4 : p === 'atrial-systole' ? 0.9 : 0.35;
}

// ---- optional audio and vibration feedback -------------------------------------------------

let audio: AudioContext | null = null;

/** Create/resume the audio context (must be called from a user gesture). Returns false if unsupported. */
export function enableHeartAudio(): boolean {
  try {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return false;
    audio ??= new Ctor();
    audio.resume();
    return true;
  } catch {
    return false;
  }
}

export function playHeartSound(kind: HeartSound, volume = 0.9) {
  if (!audio || audio.state !== 'running') return;
  const now = audio.currentTime;
  const freq = kind === 'lub' ? 52 : 74;
  const length = kind === 'lub' ? 0.14 : 0.1;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 180;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.4, now);
  osc.frequency.exponentialRampToValueAtTime(freq, now + length * 0.6);
  gain.gain.setValueAtTime(1e-4, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(1e-4, now + length);
  osc.connect(filter).connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + length + 0.02);
}

export function vibrateHeart(kind: HeartSound) {
  try { navigator.vibrate?.(kind === 'lub' ? 40 : 25); } catch { /* unsupported */ }
}

export const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
