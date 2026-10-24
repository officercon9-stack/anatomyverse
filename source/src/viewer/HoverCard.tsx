// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { structureById } from '../data';
import { useRef, useEffect } from 'react';

export function HoverCard() {
  let e = useViewerStore((e) => e.hoveredId);
  let t = useViewerStore((e) => e.mode);
  let n = e ? structureById[e] : null;
  let _r = useRef(null);
  let _lp = useRef([0, 0]);
  let _pos = (_el) => {
    if (_el) {
      let _x = Math.min(_lp.current[0] + 18, window.innerWidth - 320);
      let _y = Math.min(_lp.current[1] + 18, window.innerHeight - 170);
      _el.style.transform = `translate(${_x}px,${_y}px)`;
    }
  };
  useEffect(() => {
    let _m = (_e) => {
      _lp.current = [_e.clientX, _e.clientY];
      _pos(_r.current);
    };
    window.addEventListener('pointermove', _m);
    return () => window.removeEventListener('pointermove', _m);
  }, []);
  useEffect(() => {
    let _el = _r.current;
    if (_el && _el.firstChild && _el.firstChild.animate) {
      _el.firstChild.animate(
        [
          {
            opacity: 0,
            transform: 'scale(.82)',
          },
          {
            opacity: 1,
            transform: 'scale(1)',
          },
        ],
        {
          duration: 160,
          easing: 'ease-out',
        },
      );
    }
  }, [e]);
  if (!n || t === 'identify' || e === useViewerStore.getState().selectedId) {
    return null;
  }
  let _d = (n.function || n.description || '').split(/(?<=[.!?])\s/)[0];
  if (_d.length > 200) {
    _d = `${_d.slice(0, 197)}...`;
  }
  let _cl = (n.clinicalRelevance || '')
    .split(/(?<=[.!?])\s/)
    .slice(0, 2)
    .join(' ');
  if (_cl.length > 230) {
    _cl = `${_cl.slice(0, 227)}...`;
  }
  return (
    <div
      ref={(_el) => {
        _r.current = _el;
        _pos(_el);
      }}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 60,
        width: 320,
      }}
      aria-hidden
    >
      <div
        style={{
          transformOrigin: 'top left',
          background: 'var(--av-surface)',
          border: '1px solid var(--av-border)',
          borderRadius: 12,
          padding: '10px 12px',
          boxShadow: '0 8px 28px rgba(0,0,0,.4)',
          color: 'var(--av-text)',
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {n.name}
        </div>
        {n.latinName && (
          <div
            style={{
              fontStyle: 'italic',
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            {n.latinName}
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#6fd3b5',
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          Function
        </div>
        <div
          style={{
            opacity: 0.9,
          }}
        >
          {_d}
        </div>
        {_cl && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 6,
              borderTop: '1px solid var(--av-border)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: '#ff9d6b',
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              Common problems
            </div>
            <div
              style={{
                opacity: 0.9,
              }}
            >
              {_cl}
            </div>
          </div>
        )}
        <div
          style={{
            opacity: 0.55,
            marginTop: 6,
            fontSize: 11,
          }}
        >
          Click for full details
        </div>
      </div>
    </div>
  );
}
