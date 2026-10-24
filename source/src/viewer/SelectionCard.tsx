// @ts-nocheck
import { useViewerStore } from '../store/viewerStore';
import { useState, useEffect } from 'react';
import { structureById } from '../data';

export function SelectionCard() {
  let _id = useViewerStore((e) => e.selectedId);
  let _md = useViewerStore((e) => e.mode);
  let _sel = useViewerStore((e) => e.select);
  let [_p, _sp] = useState(null);
  useEffect(() => {
    if (!_id) {
      return _sp(null);
    }
    let _lc = globalThis.__lcp;
    globalThis.__lcp = null;
    _sp(
      _lc
        ? [
            Math.min(_lc[0] + 16, window.innerWidth - 380),
            Math.min(Math.max(_lc[1] - 40, 70), window.innerHeight - 330),
          ]
        : [Math.min(600, window.innerWidth - 380), 90],
    );
  }, [_id]);
  let _n = _id ? structureById[_id] : null;
  if (!_n || !_p || _md === 'identify' || window.innerWidth < 700) {
    return null;
  }
  let _cl = (_n.clinicalRelevance || '')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 4);
  return (
    <div
      role="dialog"
      aria-label={`${_n.name} summary`}
      style={{
        position: 'fixed',
        left: _p[0],
        top: _p[1],
        width: 360,
        maxHeight: 'min(60vh,420px)',
        overflowY: 'auto',
        zIndex: 55,
        background: 'var(--av-surface)',
        border: '1px solid var(--av-border)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 12px 36px rgba(0,0,0,.45)',
        color: 'var(--av-text)',
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {_n.name}
          </div>
          {_n.latinName && (
            <div
              style={{
                fontStyle: 'italic',
                opacity: 0.7,
                fontSize: 12,
              }}
            >
              {_n.latinName}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => _sel(null)}
          style={{
            border: 0,
            background: 'transparent',
            color: 'inherit',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            opacity: 0.7,
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#6fd3b5',
          fontWeight: 700,
          margin: '10px 0 2px',
        }}
      >
        Function
      </div>
      <div>{_n.function || _n.description}</div>
      {_n.origin && (
        <>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: '#2fe38a',
              fontWeight: 700,
              margin: '10px 0 2px',
            }}
          >
            Origin (green dot)
          </div>
          <div>{_n.origin}</div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: '#ff8a2b',
              fontWeight: 700,
              margin: '10px 0 2px',
            }}
          >
            Insertion (orange dot)
          </div>
          <div>{_n.insertion}</div>
          {_n.innervation && (
            <>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: '#8ab4ff',
                  fontWeight: 700,
                  margin: '10px 0 2px',
                }}
              >
                Nerve supply
              </div>
              <div>{_n.innervation}</div>
            </>
          )}
        </>
      )}
      {_cl.length > 0 && (
        <>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: '#ff9d6b',
              fontWeight: 700,
              margin: '10px 0 2px',
            }}
          >
            When it goes wrong: diseases
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
            }}
          >
            {_cl.map((_t, _i) => (
              <li
                key={_i}
                style={{
                  marginBottom: 2,
                }}
              >
                {_t}
              </li>
            ))}
          </ul>
        </>
      )}
      <div
        style={{
          opacity: 0.55,
          fontSize: 11,
          marginTop: 8,
        }}
      >
        More detail is in the panel on the right.
      </div>
    </div>
  );
}
