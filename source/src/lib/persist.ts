// @ts-nocheck

export function createJSONStorage(e, t) {
  let n;
  try {
    n = e();
  } catch {
    return;
  }
  return {
    getItem: (e) => {
      let r = (e) => (e === null ? null : JSON.parse(e, t?.reviver));
      let i = n.getItem(e) ?? null;
      if (i instanceof Promise) {
        return i.then(r);
      } else {
        return r(i);
      }
    },
    setItem: (e, r) => n.setItem(e, JSON.stringify(r, t?.replacer)),
    removeItem: (e) => n.removeItem(e),
  };
}

export var toThenable = (e) => (t) => {
  try {
    let n = e(t);
    if (n instanceof Promise) {
      return n;
    } else {
      return {
        then(e) {
          return toThenable(e)(n);
        },
        catch(e) {
          return this;
        },
      };
    }
  } catch (e) {
    return {
      then(e) {
        return this;
      },
      catch(t) {
        return toThenable(t)(e);
      },
    };
  }
};

export var persist = (e, t) => (n, r, i) => {
  let a = {
    storage: createJSONStorage(() => window.localStorage),
    partialize: (e) => e,
    version: 0,
    merge: (e, t) => ({
      ...t,
      ...e,
    }),
    ...t,
  };
  let o = false;
  let s = 0;
  let c = new Set();
  let l = new Set();
  let u = a.storage;
  if (!u) {
    return e(
      (...e) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`,
        );
        n(...e);
      },
      r,
      i,
    );
  }
  let d = () => {
    let e = a.partialize({
      ...r(),
    });
    return u.setItem(a.name, {
      state: e,
      version: a.version,
    });
  };
  let f = i.setState;
  i.setState = (...e) => {
    f(...e);
    return d();
  };
  let p = e(
    (...e) => {
      n(...e);
      return d();
    },
    r,
    i,
  );
  i.getInitialState = () => p;
  let m;
  let h = () => {
    if (!u) {
      return;
    }
    let e = ++s;
    o = false;
    c.forEach((e) => e(r() ?? p));
    let t = a.onRehydrateStorage?.call(a, r() ?? p) || undefined;
    return toThenable(u.getItem.bind(u))(a.name)
      .then((e) => {
        if (e) {
          if (typeof e.version == 'number' && e.version !== a.version) {
            if (a.migrate) {
              let t = a.migrate(e.state, e.version);
              if (t instanceof Promise) {
                return t.then((e) => [true, e]);
              } else {
                return [true, t];
              }
            }
            console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
          } else {
            return [false, e.state];
          }
        }
        return [false, undefined];
      })
      .then((t) => {
        if (e !== s) {
          return;
        }
        let [i, o] = t;
        m = a.merge(o, r() ?? p);
        n(m, true);
        if (i) {
          return d();
        }
      })
      .then(() => {
        if (e === s) {
          t?.(r(), undefined);
          m = r();
          o = true;
          l.forEach((e) => e(m));
        }
      })
      .catch((n) => {
        if (e === s) {
          t?.(undefined, n);
        }
      });
  };
  i.persist = {
    setOptions: (e) => {
      a = {
        ...a,
        ...e,
      };
      if (e.storage) {
        u = e.storage;
      }
    },
    clearStorage: () => {
      ++s;
      u?.removeItem(a.name);
    },
    getOptions: () => a,
    rehydrate: () => h(),
    hasHydrated: () => o,
    onHydrate: (e) => {
      c.add(e);
      return () => {
        c.delete(e);
      };
    },
    onFinishHydration: (e) => {
      l.add(e);
      return () => {
        l.delete(e);
      };
    },
  };
  if (!a.skipHydration) {
    h();
  }
  return m || p;
};
