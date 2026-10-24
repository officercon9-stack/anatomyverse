// @ts-nocheck

export function webglAvailable() {
  try {
    let e = document.createElement('canvas');
    return !!e.getContext('webgl2') || !!e.getContext('webgl');
  } catch {
    return false;
  }
}
