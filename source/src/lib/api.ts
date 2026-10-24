// @ts-nocheck

export var ApiError = class extends Error {
  status;
  details;
  constructor(e, t, n) {
    super(t);
    this.status = e;
    this.details = n;
  }
};

export var API_BASE = '';

export async function api(e, t = {}) {
  let { json: n, headers: r, ...i } = t;
  let a = await fetch(`${API_BASE}/api${e}`, {
    credentials: 'include',
    ...i,
    headers: {
      'X-AnatomyVerse-Client': '1',
      ...(n === undefined
        ? {}
        : {
            'Content-Type': 'application/json',
          }),
      ...r,
    },
    body: n === undefined ? i.body : JSON.stringify(n),
  });
  let o = await a.text();
  let s = o ? parseJsonSafe(o) : null;
  if (!a.ok) {
    throw new ApiError(a.status, s?.error ?? a.statusText, s);
  }
  return s;
}

export function parseJsonSafe(e) {
  try {
    return JSON.parse(e);
  } catch {
    return {
      error: 'Unexpected response from server',
    };
  }
}

export function syncToServer(e, t, n) {
  api(e, {
    method: t,
    json: n,
  }).catch(() => {});
}
