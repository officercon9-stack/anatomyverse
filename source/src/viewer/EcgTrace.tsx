import { useEffect, useRef } from 'react';
import { ecgValue, heartClock } from './heartCycle';

/** Scrolling ECG trace drawn on a 2D canvas, driven by the shared heart clock (illustrative only). */
export function EcgTrace({ width = 200, height = 48 }: { width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const samples: number[] = Array(width).fill(0);
    let lastPhase = heartClock.phase;
    let raf = 0;
    const draw = () => {
      // add the ECG samples for the phase travelled since the last frame
      const now = heartClock.phase;
      let travelled = now - lastPhase;
      if (travelled < 0) travelled += 1;
      const n = Math.max(1, Math.min(6, Math.round(travelled * 120)));
      for (let i = 1; i <= n; i++) {
        samples.shift();
        samples.push(ecgValue(lastPhase + (travelled * i) / n));
      }
      lastPhase = now;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(52,211,153,0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const baseline = height * 0.68;
      samples.forEach((v, x) => (x === 0 ? ctx.moveTo(x, baseline - v * height * 0.55) : ctx.lineTo(x, baseline - v * height * 0.55)));
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);
  return (
    <canvas
      ref={ref}
      style={{ width, height }}
      className="block rounded-md bg-black/60"
      role="img"
      aria-label="ECG trace in time with the heartbeat (illustrative)"
    />
  );
}
