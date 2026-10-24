// @ts-nocheck

export function Logo({ compact: e = false }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight text-[var(--av-text)]">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#0b1324" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#22d3ee" strokeWidth="3" />
        <ellipse cx="32" cy="32" rx="8" ry="20" fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="4" fill="#f59e0b" />
      </svg>
      <span>
        AnatomyVerse{!e && <span className="ml-1 text-[var(--av-teal)]">3D</span>}
        {e && <span className="ml-1 text-[var(--av-teal)]">3D</span>}
      </span>
    </span>
  );
}
