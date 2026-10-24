// @ts-nocheck
import { create } from 'zustand';
import { api } from '../lib/api';
import { importLocalProgress, useProgressStore } from './progress';

export var useAuthStore = create((e) => ({
  user: null,
  backend: 'unknown',
  checking: true,
  check: async () => {
    e({
      user: null,
      backend: 'offline',
      checking: false,
    });
  },
  login: async (t, n) => {
    let { user: r } = await api('/auth/login', {
      method: 'POST',
      json: {
        email: t,
        password: n,
      },
    });
    e({
      user: r,
      backend: 'online',
    });
    await importLocalProgress();
  },
  register: async (t, n, r) => {
    let { user: i } = await api('/auth/register', {
      method: 'POST',
      json: {
        email: t,
        password: n,
        displayName: r,
      },
    });
    e({
      user: i,
      backend: 'online',
    });
    await importLocalProgress();
  },
  logout: async () => {
    await api('/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);
    useProgressStore.getState().setSyncEnabled(false);
    e({
      user: null,
    });
  },
  updatePreferences: async (t) => {
    let { user: n } = await api('/auth/me/preferences', {
      method: 'PUT',
      json: t,
    });
    e({
      user: n,
    });
  },
}));
