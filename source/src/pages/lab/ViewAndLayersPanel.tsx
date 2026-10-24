// @ts-nocheck
import { useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { avFlags } from './flags';
import { showDiaphragm, showLimbs, applyView } from './views';
import { LayersControls } from './LayersControls';

export function ViewAndLayersPanel() {
  let [_a, _sa] = useState('all');
  let [_m, _sm] = useState(false);
  let [_nv, _snv] = useState(false);
  globalThis.__sa = _sa;
  globalThis.__snv = _snv;
  let _go = (_id, _sys, _foc, _fn) => {
    let _s = useViewerStore.getState();
    _s.restoreVisibility();
    _s.select(null);
    if (!_foc) {
      _s.resetCamera();
    }
    avFlags.set(
      _id === 'brain'
        ? {
            ld_brain: true,
          }
        : _id === 'lungs'
          ? {
              ld_lung: true,
            }
          : _id === 'bones'
            ? {
                ld_org: true,
                ld_limb: true,
              }
            : _id === 'gut' || _id === 'kidney'
              ? {
                  ld_org: true,
                }
              : {},
    );
    globalThis.__cv = _id;
    _snv(false);
    avFlags.set({
      vessels: _id === 'brain',
      flow: _id === 'brain',
      csf: _id === 'brain',
      csfFlow: _id === 'brain',
      airflow: true,
    });
    for (let _l of ['skin', 'muscles', 'bones', 'vessels', 'nerves', 'organs']) {
      _s.setLayerOpacity(_l, _l === 'skin' ? (_sys ? 0.08 : 0.12) : 1);
    }
    avFlags.set({
      inside: false,
      dia: false,
      nv: false,
    });
    _s.setSystemFocus(_sys);
    _sa(_id);
    if (_fn) {
      _fn();
    }
    if (_foc) {
      setTimeout(() => useViewerStore.getState().focusStructure(_foc), 200);
    }
  };
  let _B = [
    ['all', 'Whole body', null, null],
    ['bones', 'Bones', 'skeletal', null],
    ['muscles', 'Muscles', null, null, 'muscles'],
    ['heart', 'Heart and blood', 'cardiovascular', 'heart'],
    ['brain', 'Brain and nerves', 'nervous', 'brain'],
    ['lungs', 'Lungs', 'respiratory', 'bronchial-tree'],
    ['gut', 'Digestion', 'digestive', null],
    ['kidney', 'Kidneys and bladder', 'urinary', null],
    ['inside', 'Internal organs', null, null, 'inside'],
    ['upper', 'Upper limb', null, null, 'upper'],
    ['lower', 'Lower limb', null, null, 'lower'],
    ['nv', 'Nerves and blood vessels', null, null, 'nv'],
    ['dia', 'Diaphragm: blood and nerves', null, null, true],
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-base font-semibold">What do you want to see?</p>
      <div className="grid grid-cols-2 gap-2">
        {_B.map((b) => (
          <button
            key={b[0]}
            type="button"
            aria-pressed={_a === b[0]}
            className="av-btn justify-center text-center"
            style={{
              minHeight: 48,
              fontSize: 14,
              fontWeight: 600,
              ...(b[4] === true
                ? {
                    gridColumn: 'span 2',
                  }
                : {}),
              ...(_a === b[0]
                ? {
                    borderColor: 'var(--av-teal)',
                    color: 'var(--av-teal)',
                  }
                : {}),
            }}
            onClick={() =>
              b[4] === true
                ? (_sa('dia'), showDiaphragm())
                : b[4]
                  ? (_sa(b[0]), showLimbs(b[4]))
                  : _go(b[0], b[2], b[3])
            }
          >
            {b[1]}
          </button>
        ))}
      </div>
      {['muscles', 'upper', 'lower'].includes(_a) && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            aria-pressed={_nv}
            className="av-btn justify-center text-center"
            style={{
              minHeight: 48,
              fontSize: 14,
              fontWeight: 600,
              ...(_nv
                ? {
                    borderColor: 'var(--av-teal)',
                    color: 'var(--av-teal)',
                  }
                : {}),
            }}
            onClick={() => {
              let _n = !_nv;
              _snv(_n);
              if (_n) {
                avFlags.set({
                  ld_sup: true,
                });
              }
              applyView(_a, _n, true);
            }}
          >
            {_nv ? 'Hide nerves and blood vessels' : 'Show nerves and blood vessels'}
          </button>
          {_nv && (
            <p className="text-xs text-[var(--av-text-muted)]">
              Yellow = nerves, red = arteries, blue = veins. Muscles are see-through. Tap a muscle to see its own nerve
              and artery.
            </p>
          )}
        </div>
      )}
      <ol
        className="text-sm leading-relaxed text-[var(--av-text-muted)]"
        style={{
          paddingLeft: 18,
          listStyle: 'decimal',
        }}
      >
        <li>Click a button above.</li>
        <li>Click any part of the body: you see what it does and which diseases affect it.</li>
        <li>Double-click a part to pull it out. Double-click again to put it back.</li>
      </ol>
      <button type="button" className="av-btn av-btn--sm self-start" aria-expanded={_m} onClick={() => _sm(!_m)}>
        {_m ? 'Hide more options' : 'More options (layers, sliders, models)'}
      </button>
      {_m && (
        <div
          style={{
            margin: '0 -16px',
          }}
        >
          <LayersControls />
        </div>
      )}
    </div>
  );
}
