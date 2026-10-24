import { r as e } from "./rolldown-runtime-XKyaHtl9.js";
import { A as t, N as n } from "./three-Bl2eHk-_.js";
import { a as r } from "./assetManifest-D3o27EUe-b26.js";
import { W as i, f as a, j as o, n as s, nt as c, u as l, y as u, z as d } from "./index-DAxCahJm-b26.js";
var f = e(n(), 1);
var p = t();
var _CMD = [[`full`, `Full model`, `Show the whole body again`, /(full|whole|entire|complete|normal)\s*(body|model)|^\s*(return|back|reset|restore)|return to|go back|reset|start over/, 1], [`inside`, `Internal organs`, `Body with the internal organs`, /internal organs|inner organs|inside|organs?\b|viscera|internal (body|view|model)/, 1], [`upper`, `Upper limb`, `Shoulder, arm and hand only`, /upper\s*(limb|extremit)|\barms?\b|forearm|\bhands?\b|shoulder/, 1], [`lower`, `Lower limb`, `Hip, thigh, leg and foot only`, /lower\s*(limb|extremit)|\blegs?\b|\bfeet\b|\bfoot\b|\bthigh/, 1], [`skeleton`, `Skeleton`, `Bones only`, /skeleton|\bbones?\b/, 0], [`muscles`, `Muscles and tendons`, `All muscles, tendons and ligaments`, /muscles?\b|tendons?\b|ligaments?\b/, 0], [`nv`, `Nerves and blood vessels`, `Nerves, arteries and veins`, /nerves?\b|vessels?\b|arteries|veins?\b/, 0]];
function _cmds(_t) {
  let _q = _t.toLowerCase().trim();
  if (!_q) {
    return {
      first: [],
      rest: []
    };
  }
  let _r = {
    first: [],
    rest: []
  };
  for (let _c of _CMD) {
    if (_c[3].test(_q)) {
      (_c[4] ? _r.first : _r.rest).push({
        cmd: true,
        structure: {
          id: `cmd:${_c[0]}`,
          name: _c[1],
          system: `x`,
          region: `quick view`,
          description: _c[2]
        },
        matchedOn: `name`
      });
    }
  }
  return _r;
}
function _runCmd(k) {
  let _in = location.hash.includes(`/app/lab`);
  if (!_in) {
    location.hash = `#/app/lab`;
  }
  setTimeout(() => globalThis.__viewCmd?.(k), _in ? 0 : 2500);
}
function m({
  onSelect: e,
  autoFocus: t,
  placeholder: n = `Search structures, systems, synonyms…`
}) {
  let [m, h] = (0, f.useState)(``);
  let [g, _] = (0, f.useState)(false);
  let [v, y] = (0, f.useState)(0);
  let b = (0, f.useId)();
  let x = (0, f.useRef)(null);
  let S = u();
  let C = s(e => e.v);
  let w = (0, f.useMemo)(() => {
    let _c = _cmds(m);
    return [..._c.first, ...a(m, r, 10), ..._c.rest];
  }, [m, C]);
  let T = g && m.trim().length > 0;
  let E = t => {
    if (typeof t == `string` && t.startsWith(`cmd:`)) {
      _runCmd(t.slice(4));
    } else {
      e(t);
    }
    h(``);
    _(false);
    y(0);
  };
  return (0, p.jsxs)(`div`, {
    className: `relative`,
    children: [(0, p.jsx)(`label`, {
      htmlFor: `${b}-input`,
      className: `sr-only`,
      children: `Search anatomical structures`
    }), (0, p.jsx)(i, {
      size: 16,
      className: `pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--av-text-faint)]`,
      "aria-hidden": true
    }), (0, p.jsx)(`input`, {
      ref: x,
      id: `${b}-input`,
      className: `av-input pl-9 pr-9`,
      role: `combobox`,
      "aria-expanded": T,
      "aria-controls": b,
      "aria-autocomplete": `list`,
      "aria-activedescendant": T && w[v] ? `${b}-opt-${v}` : undefined,
      autoComplete: `off`,
      autoFocus: t,
      placeholder: n,
      value: m,
      onChange: e => {
        h(e.target.value);
        _(true);
        y(0);
      },
      onFocus: () => _(true),
      onBlur: () => setTimeout(() => _(false), 150),
      onKeyDown: e => {
        if (e.key === `ArrowDown`) {
          e.preventDefault();
          _(true);
          y(e => Math.min(e + 1, w.length - 1));
        } else if (e.key === `ArrowUp`) {
          e.preventDefault();
          y(e => Math.max(e - 1, 0));
        } else if (e.key === `Enter`) {
          if (w[v]) {
            e.preventDefault();
            E(w[v].structure.id);
          }
        } else if (e.key === `Escape`) {
          _(false);
        }
      }
    }), m && (0, p.jsx)(`button`, {
      type: `button`,
      className: `absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--av-text-faint)] hover:text-[var(--av-text)]`,
      "aria-label": `Clear search`,
      onClick: () => {
        h(``);
        x.current?.focus();
      },
      children: (0, p.jsx)(d, {
        size: 15,
        "aria-hidden": true
      })
    }), T && (0, p.jsx)(`ul`, {
      id: b,
      role: `listbox`,
      "aria-label": `Search results`,
      className: `av-card absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto p-1`,
      children: w.length === 0 ? (0, p.jsxs)(`li`, {
        className: `p-3 text-sm text-[var(--av-text-muted)]`,
        role: `option`,
        "aria-selected": false,
        "aria-disabled": true,
        children: [`No structures match “`, m, `”. Try: `, l.slice(0, 3).join(`, `), `.`]
      }) : w.map((e, t) => (0, p.jsxs)(`li`, {
        id: `${b}-opt-${t}`,
        role: `option`,
        "aria-selected": t === v,
        className: `cursor-pointer rounded-lg px-3 py-2 ${t === v ? `bg-[var(--av-surface-2)]` : ``}`,
        onMouseDown: e => e.preventDefault(),
        onClick: () => E(e.structure.id),
        onMouseEnter: () => y(t),
        children: [(0, p.jsxs)(`div`, {
          className: `flex items-center justify-between gap-2`,
          children: [(0, p.jsx)(`span`, {
            className: `text-sm font-medium text-[var(--av-text)]`,
            children: e.structure.name
          }), e.cmd ? (0, p.jsx)(`span`, {
            className: `av-badge av-badge--accent shrink-0`,
            children: `View`
          }) : S(e.structure.id) ? (0, p.jsxs)(`span`, {
            className: `av-badge av-badge--accent shrink-0`,
            children: [(0, p.jsx)(c, {
              size: 11,
              "aria-hidden": true
            }), ` 3D`]
          }) : (0, p.jsx)(`span`, {
            className: `av-badge shrink-0`,
            title: `Educational record only — no object in the current 3D model`,
            children: `Text only`
          })]
        }), (0, p.jsxs)(`div`, {
          className: `text-xs text-[var(--av-text-faint)]`,
          children: [e.cmd ? `Quick view` : o[e.structure.system]?.name, e.cmd ? `` : ` · `, e.cmd ? `` : e.structure.region.replace(`-`, ` `), e.matchedOn !== `name` && e.matchedOn !== `description` && (0, p.jsxs)(p.Fragment, {
            children: [` · matched `, e.matchedOn, ` “`, e.matchedText, `”`]
          })]
        }), (0, p.jsx)(`div`, {
          className: `mt-0.5 line-clamp-1 text-xs text-[var(--av-text-muted)]`,
          children: e.structure.description
        })]
      }, e.structure.id))
    }), g && !m && (0, p.jsxs)(`div`, {
      className: `av-card absolute left-0 right-0 top-full z-30 mt-1 p-3 text-xs text-[var(--av-text-muted)]`,
      children: [(0, p.jsx)(`p`, {
        className: `mb-2`,
        children: `Try searching for:`
      }), (0, p.jsx)(`div`, {
        className: `flex flex-wrap gap-1`,
        children: [...l, `internal organs`, `upper limb`, `lower limb`, `full model`].map(e => (0, p.jsx)(`button`, {
          type: `button`,
          className: `av-badge hover:text-[var(--av-teal)]`,
          onMouseDown: e => e.preventDefault(),
          onClick: () => {
            h(e);
            _(true);
          },
          children: e
        }, e))
      })]
    })]
  });
}
export { m as t };