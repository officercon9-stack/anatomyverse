// @ts-nocheck
import { useState, useEffect } from 'react';

export var THEME_KEY = 'av.theme';

export function readTheme() {
  try {
    let e = localStorage.getItem(THEME_KEY);
    if (e === 'dark' || e === 'light') {
      return e;
    }
  } catch {}
  return 'dark';
}

export function applyTheme() {
  document.documentElement.dataset.theme = readTheme();
}

export function useTheme() {
  let [e, t] = useState(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = e;
    try {
      localStorage.setItem(THEME_KEY, e);
    } catch {}
  }, [e]);
  return [e, t];
}
