// @ts-nocheck
import { useState, useEffect } from 'react';

export function useMediaQuery(e) {
  let [t, n] = useState(() =>
    typeof window < 'u' && typeof window.matchMedia == 'function' ? window.matchMedia(e).matches : true,
  );
  useEffect(() => {
    if (typeof window.matchMedia != 'function') {
      return;
    }
    let t = window.matchMedia(e);
    let r = () => n(t.matches);
    r();
    t.addEventListener('change', r);
    return () => t.removeEventListener('change', r);
  }, [e]);
  return t;
}
