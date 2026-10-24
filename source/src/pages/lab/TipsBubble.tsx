// @ts-nocheck
import { useState } from 'react';

export function TipsBubble() {
  let [_o, _so] = useState(() => {
    try {
      if (localStorage.getItem('av_tip_seen')) {
        return false;
      } else {
        return true;
      }
    } catch {
      return true;
    }
  });
  let _close = () => {
    _so(false);
    try {
      localStorage.setItem('av_tip_seen', '1');
    } catch {}
  };
  if (!_o) {
    return (
      <button
        type="button"
        onClick={() => _so(true)}
        aria-label="Open tips"
        style={{
          position: 'absolute',
          right: 12,
          bottom: 56,
          zIndex: 15,
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid var(--av-teal)',
          background: 'var(--av-surface)',
          color: 'var(--av-teal)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,.35)',
        }}
      >
        Touch and explore
      </button>
    );
  }
  return (
    <div
      role="note"
      style={{
        position: 'absolute',
        right: 12,
        bottom: 56,
        zIndex: 15,
        width: 260,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid var(--av-teal)',
        background: 'var(--av-surface)',
        color: 'var(--av-text)',
        fontSize: 13,
        lineHeight: 1.45,
        boxShadow: '0 10px 30px rgba(0,0,0,.45)',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: 'var(--av-teal)',
        }}
      >
        Touch and explore
      </div>
      <div
        style={{
          margin: '4px 0 6px',
        }}
      >
        Get the most from this app:
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: 16,
          listStyle: 'disc',
        }}
      >
        <li>Tap any part: see what it does and which diseases affect it.</li>
        <li>Double-tap a part to pull it out; double-tap again to put it back.</li>
        <li>Drag to turn the body, pinch or scroll to zoom.</li>
        <li>Use the big buttons on the left to switch system.</li>
        <li>Test yourself with a quiz when you are ready.</li>
      </ul>
      <button
        type="button"
        className="av-btn av-btn--sm"
        style={{
          marginTop: 8,
        }}
        onClick={_close}
      >
        Got it
      </button>
    </div>
  );
}
