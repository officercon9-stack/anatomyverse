// @ts-nocheck
import { useViewerStore } from '../../store/viewerStore';
import { avFlags } from './flags';
import { structures } from '../../data';

export function switchModel(_m, _id) {
  let _k = 0;
  let _h = setInterval(() => {
    _k++;
    let _s = useViewerStore.getState();
    if (_k === 1 && _s.modelId !== _m) {
      _s.setModel(_m);
    }
    _s = useViewerStore.getState();
    if (_s.modelId === _m && !_s.assetLoading && _k > 3) {
      clearInterval(_h);
      _s.focusStructure(_id);
    } else if (_k > 80) {
      clearInterval(_h);
    }
  }, 400);
}

export function showLimbs(_k) {
  applyView(_k, false);
}

export function showDiaphragm() {
  let _s = useViewerStore.getState();
  avFlags.set({
    ld_lung: true,
  });
  _s.restoreVisibility();
  for (let _l of ['skin', 'muscles', 'bones', 'vessels', 'nerves', 'organs']) {
    _s.setLayerOpacity(_l, _l === 'skin' ? 0.08 : 1);
  }
  _s.setSystemFocus('respiratory');
  avFlags.set({
    inside: false,
    dia: true,
  });
  setTimeout(() => useViewerStore.getState().focusStructure('diaphragm'), 250);
  setTimeout(() => useViewerStore.getState().select(null), 1000);
}

export var UPPER_LIMB_IDS = [
  'clavicle',
  'scapula',
  'deltoid',
  'biceps-brachii',
  'triceps-brachii',
  'pectoralis-major',
  'brachial-plexus',
];

export var LOWER_LIMB_IDS = [
  'hip-bone',
  'femur',
  'tibia',
  'fibula',
  'patella',
  'rectus-femoris',
  'gastrocnemius',
  'inguinal-ligament',
  'iliotibial-tract',
];

export var UPPER_LIMB_FOCUS = ['humerus', 'radius', 'ulna', 'hand-bones', 'scapula', 'clavicle'];

export var LOWER_LIMB_FOCUS = ['femur', 'tibia', 'fibula', 'foot-bones', 'hip-bone'];

export function regionIds(_f) {
  return structures.filter(_f).map((_e) => _e.id);
}

export function applyView(_k, _nv, _keep) {
  let _s = useViewerStore.getState();
  let _o;
  if (_k === 'all') {
    _o = {
      skin: 0.12,
      muscles: 1,
      bones: 1,
      vessels: 1,
      nerves: 1,
      organs: 1,
    };
  } else if (_k === 'inside') {
    _o = {
      skin: 0.05,
      muscles: 0,
      bones: 0.45,
      vessels: 1,
      nerves: 0.5,
      organs: 1,
    };
  } else if (_k === 'nv') {
    _o = {
      skin: 0.05,
      muscles: 0.2,
      bones: 0.3,
      vessels: 1,
      nerves: 1,
      organs: 0.12,
    };
  } else if (_k === 'skeleton') {
    _o = {
      skin: 0.05,
      muscles: 0.05,
      bones: 1,
      vessels: 0.05,
      nerves: 0.05,
      organs: 0.05,
    };
  } else {
    _o = {
      skin: 0.05,
      muscles: _nv ? 0.5 : 1,
      bones: _nv ? 0.3 : _k === 'muscles' ? 0.2 : 0.6,
      vessels: _nv ? 1 : 0.12,
      nerves: _nv ? 1 : 0.12,
      organs: 0.08,
    };
  }
  avFlags.set(
    _k === 'all'
      ? {}
      : _k === 'inside'
        ? {
            ld_org: true,
            ld_lung: true,
            ld_brain: true,
          }
        : _k === 'skeleton'
          ? {
              ld_org: true,
              ld_limb: true,
            }
          : _k === 'nv'
            ? {
                ld_limb: true,
                ld_sup: true,
              }
            : {
                ld_limb: true,
              },
  );
  _s.restoreVisibility();
  for (let _l in _o) {
    _s.setLayerVisible(_l, true);
    _s.setLayerOpacity(_l, _o[_l]);
  }
  avFlags.set({
    inside: false,
    dia: false,
    nv: !!_nv,
    ...(_k === 'all' || _k === 'inside'
      ? {
          vessels: false,
          flow: false,
          csf: false,
          csfFlow: false,
          airflow: true,
        }
      : {
          vessels: false,
          flow: false,
          csf: false,
          csfFlow: false,
          airflow: false,
        }),
  });
  globalThis.__cv = _k;
  let _ids =
    _k === 'inside'
      ? regionIds((_e) => _e.region !== 'upper-limb' && _e.region !== 'lower-limb')
      : _k === 'upper'
        ? regionIds((_e) => _e.region === 'upper-limb' || UPPER_LIMB_IDS.includes(_e.id))
        : _k === 'lower'
          ? regionIds((_e) => _e.region === 'lower-limb' || LOWER_LIMB_IDS.includes(_e.id))
          : null;
  if (_ids) {
    _s.isolate(_ids);
  }
  if (!_keep) {
    _s.select(null);
    if (_k === 'upper') {
      _s.frame(UPPER_LIMB_FOCUS, 'anterior');
    } else if (_k === 'lower') {
      _s.frame(LOWER_LIMB_FOCUS, 'anterior');
    } else {
      _s.resetCamera();
    }
  }
}

export function runViewCommand(_k) {
  let _m = _k === 'full' ? 'all' : _k === 'skeleton' ? 'bones' : _k;
  globalThis.__sa?.(_m);
  globalThis.__snv?.(false);
  applyView(_k === 'full' ? 'all' : _k, false);
}

// the search box calls this through globalThis (it lives in a lazily loaded chunk)
globalThis.__viewCmd = runViewCommand;
