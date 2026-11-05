/* Smart label management for the 3D lab.
   Modes: clean (default, selected structure only), smart (collision-free labels with leader lines,
   density by screen size and zoom, region clusters), index (searchable list of every structure).
   Reads the app's own store (__avStore), scene (__r3s) and records (__avRec). Removes nothing. */
(function () {
  'use strict';
  var KEY = 'av.labelMode';
  var mode = 'clean';
  try { var m0 = localStorage.getItem(KEY); if (m0 === 'smart' || m0 === 'index' || m0 === 'clean') mode = m0; } catch (e) {}

  var ST = function () { return globalThis.__avStore && globalThis.__avStore.getState && globalThis.__avStore.getState(); };
  var REC = function () { return globalThis.__avRec || {}; };

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '#avsl{position:absolute;inset:0;pointer-events:none;z-index:12;overflow:hidden;font:600 11px/1.15 system-ui,-apple-system,Segoe UI,sans-serif}',
    '#avsl svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '#avsl .ln{fill:none;stroke:rgba(190,215,255,.75);stroke-width:1}',
    '#avsl .ln.sel{stroke:#00e5ff;stroke-width:1.6}',
    '#avsl .dt{fill:#fff;stroke:rgba(10,20,50,.9);stroke-width:1}',
    '#avsl .dt.sel{fill:#00e5ff}',
    '#avsl .lb{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:4px;box-sizing:border-box;height:18px;max-width:150px;padding:0 7px;border-radius:9px;background:rgba(10,22,52,.88);color:#eaf2ff;border:1px solid rgba(160,190,240,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;touch-action:manipulation;transition:transform .12s ease-out,opacity .12s}',
    '#avsl .lb.sel{height:auto;min-height:22px;max-width:190px;white-space:normal;padding:3px 9px;border-radius:11px;background:#06314a;border:1.5px solid #00e5ff;color:#fff;font-size:12px;box-shadow:0 2px 10px rgba(0,0,0,.45)}',
    '#avsl .lb.cl{border-style:dashed;background:rgba(32,26,70,.9);border-color:rgba(200,170,255,.7)}',
    '#avsl .lb .tx{overflow:hidden;text-overflow:ellipsis}',
    '#avsl .lb:focus-visible,#avsl-ctl button:focus-visible,#avsl-idx button:focus-visible,#avsl-idx input:focus-visible,#avsl-list button:focus-visible{outline:2px solid #00e5ff;outline-offset:1px}',
    '#avsl-ctl{position:absolute;z-index:13;top:8px;left:44px;display:flex;border:1px solid rgba(160,190,240,.4);border-radius:14px;background:rgba(10,22,52,.9);overflow:hidden;font:600 11px/1 system-ui,sans-serif}',
    '#avsl-ctl button{all:unset;box-sizing:border-box;cursor:pointer;padding:7px 10px;color:#b9c9e6;min-height:28px;display:flex;align-items:center}',
    '#avsl-ctl button[aria-pressed=true]{background:#0e6b9a;color:#fff}',
    '#avsl-list,#avsl-idx{position:absolute;z-index:14;background:rgba(9,18,44,.97);color:#eaf2ff;border:1px solid rgba(160,190,240,.4);font:500 13px/1.3 system-ui,sans-serif;display:flex;flex-direction:column;box-sizing:border-box}',
    '#avsl-list{left:8px;right:8px;bottom:8px;max-height:48%;border-radius:12px}',
    '#avsl-list header,#avsl-idx header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;font-weight:600;border-bottom:1px solid rgba(160,190,240,.25)}',
    '#avsl-list .bd,#avsl-idx .bd{overflow:auto;-webkit-overflow-scrolling:touch;padding:4px 6px 8px}',
    '#avsl-list .it,#avsl-idx .it{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;padding:8px 8px;border-radius:7px;min-height:34px}',
    '#avsl-list .it:hover,#avsl-idx .it:hover{background:rgba(80,130,200,.25)}',
    '#avsl-list .x,#avsl-idx .x{all:unset;cursor:pointer;padding:6px 10px;border-radius:8px;background:rgba(160,190,240,.18);font-weight:600;font-size:12px}',
    '#avsl-idx{top:44px;bottom:8px;left:8px;width:min(330px,calc(100% - 16px));border-radius:12px}',
    '#avsl-idx input[type=search],#avsl-idx select{box-sizing:border-box;width:100%;padding:8px 10px;border-radius:8px;border:1px solid rgba(160,190,240,.4);background:rgba(20,34,70,.9);color:#fff;font:500 14px system-ui,sans-serif}',
    '#avsl-idx .tools{display:grid;gap:6px;padding:8px 10px;border-bottom:1px solid rgba(160,190,240,.25)}',
    '#avsl-idx details{border-bottom:1px solid rgba(160,190,240,.15)}',
    '#avsl-idx summary{cursor:pointer;padding:9px 8px;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:8px;min-height:36px;align-items:center}',
    '#avsl-idx summary::-webkit-details-marker{display:none}',
    '#avsl-idx .sm{color:#9fb3d6;font-weight:500;font-size:12px}',
    '#avsl-idx .sys{color:#8aa0c8;font-size:11px;margin-left:6px}',
    '#avsl-idx .no3d{color:#8aa0c8;font-size:11px;margin-left:6px;font-style:italic}',
    '#avsl-idx.min{bottom:auto!important;height:auto!important;width:min(330px,calc(100% - 16px))}',
    '#avsl-idx.min .tools,#avsl-idx.min .bd{display:none}',
    '@media (max-width:767px){#avsl-idx{top:auto;left:8px;right:8px;width:auto;height:52%}#avsl-idx.min{height:auto}#avsl-ctl{left:40px}}',
    '@media (prefers-reduced-motion:reduce){#avsl .lb{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  /* keep taps on our own controls away from the 3D canvas (it treats unhandled clicks as "deselect") */
  function isolate(e) { ['click', 'dblclick', 'pointerdown', 'pointerup', 'pointermove', 'wheel', 'contextmenu'].forEach(function (t) { e.addEventListener(t, function (ev) { ev.stopPropagation(); }); }); return e; }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'on') { for (var ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); } else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  var NOUN = { muscles: 'muscles', bones: 'bones', vessels: 'vessels', nerves: 'nerves', organs: 'organs', skin: 'skin layers' };

  /* anatomical regions for clusters, from record region and the structure's position (metres, y up) */
  function subRegion(rec, y, x) {
    var r = rec.region;
    if (r === 'head') return 'Head';
    if (r === 'neck') return 'Neck';
    if (r === 'thorax') return 'Thorax';
    if (r === 'abdomen') return 'Abdomen';
    if (r === 'pelvis') return 'Pelvis';
    if (r === 'back') return 'Back';
    if (r === 'whole-body') return 'Whole body';
    var upper = r === 'upper-limb' || (r === 'limb' && upperName(rec)) || (r === 'trunk' && false);
    if (r === 'trunk') return y < 1.05 ? 'Pelvis' : 'Thorax';
    if (upper) { return y > 1.33 ? 'Shoulder' : y > 1.12 ? 'Arm' : y > 0.9 ? 'Forearm' : 'Hand'; }
    if (r === 'lower-limb' || r === 'limb') { return y > 0.86 ? 'Hip' : y > 0.5 ? 'Thigh' : y > 0.09 ? 'Leg' : 'Foot'; }
    return 'Body';
  }
  function upperName(rec) { return /clavic|scapul|acromi|glenoid|humer|radi(us|al)|ulna|carp|hand|finger|thumb|digit of hand|coracoid/i.test(rec.id + ' ' + (rec.name || '')); }
  function noun(layers, n) { var best = '', bc = 0; for (var k in layers) if (layers[k] > bc) { bc = layers[k]; best = k; } return bc >= n * 0.8 && NOUN[best] ? NOUN[best] : 'structures'; }

  var IDX_GROUPS = [
    ['hn', 'Head and neck'], ['sul', 'Shoulder and upper limb'], ['thx', 'Thorax'], ['abd', 'Abdomen'],
    ['bck', 'Back'], ['pel', 'Pelvis'], ['ll', 'Lower limb'], ['wb', 'Whole body']
  ];
  function idxGroup(rec) {
    var r = rec.region;
    if (r === 'head' || r === 'neck') return 'hn';
    if (r === 'upper-limb') return 'sul';
    if (r === 'thorax') return 'thx';
    if (r === 'abdomen') return 'abd';
    if (r === 'back') return 'bck';
    if (r === 'pelvis') return 'pel';
    if (r === 'lower-limb') return 'll';
    if (r === 'limb') return upperName(rec) ? 'sul' : 'll';
    if (r === 'trunk') return /sternal|xiphoid|rib|sternum/i.test(rec.id) ? 'thx' : 'pel';
    return 'wb';
  }

  /* ---------- scene access ---------- */
  var bboxCache = new WeakMap();
  var sampCache = new WeakMap();
  function chainVisible(o) { for (var p = o; p; p = p.parent) if (p.visible === false) return false; return true; }
  function meshOpaque(o) { var mt = o.material; if (Array.isArray(mt)) mt = mt[0]; if (!mt) return true; if (mt.visible === false) return false; return mt.opacity === undefined || mt.opacity > 0.06; }
  function worldBox(o) {
    var e = o.matrixWorld.elements, key = e[0] + ',' + e[5] + ',' + e[10] + ',' + e[12] + ',' + e[13] + ',' + e[14];
    var c = bboxCache.get(o); if (c && c.k === key) return c.b;
    var g = o.geometry; if (!g) return null; if (!g.boundingBox) g.computeBoundingBox(); if (!g.boundingBox) return null;
    var b = g.boundingBox, mn = b.min, mx = b.max, out = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (var i = 0; i < 8; i++) {
      var x = i & 1 ? mx.x : mn.x, y = i & 2 ? mx.y : mn.y, z = i & 4 ? mx.z : mn.z;
      var wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
      if (wx < out[0]) out[0] = wx; if (wy < out[1]) out[1] = wy; if (wz < out[2]) out[2] = wz;
      if (wx > out[3]) out[3] = wx; if (wy > out[4]) out[4] = wy; if (wz > out[5]) out[5] = wz;
    }
    bboxCache.set(o, { k: key, b: out }); return out;
  }
  function samples(o) {
    var e = o.matrixWorld.elements, key = e.join(',');
    var c = sampCache.get(o); if (c && c.k === key) return c.a;
    var a = [], g = o.geometry;
    if (g && g.attributes && g.attributes.position) {
      var p = g.attributes.position, st = Math.max(1, Math.floor(p.count / 160));
      for (var i = 0; i < p.count; i += st) {
        var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        a.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
      }
    }
    sampCache.set(o, { k: key, a: a }); return a;
  }

  /* ---------- state ---------- */
  var root = null, svg = null, ctl = null, idx = null, listEl = null, host = null, nodes = {};
  var lastKey = '', lastRun = 0, raf = 0, stats = { shown: 0, clusters: 0, candidates: 0 };

  function sc() { var r = globalThis.__r3s && globalThis.__r3s.get && globalThis.__r3s.get(); return r && r.scene && r.camera && r.gl ? r : null; }

  function structures(restrictSys) {
    var s = sc(), by = {}, R = REC();
    s.scene.traverse(function (o) {
      if (!o.isMesh || !o.userData) return;
      var id = o.userData.structureId; if (!id || !R[id]) return;
      if (!chainVisible(o) || !meshOpaque(o)) return;
      if (restrictSys && R[id].system !== restrictSys) return;
      (by[id] = by[id] || []).push(o);
    });
    /* aggregate records (e.g. "Femoral artery") have no mesh of their own: anchor the selected one on its left/right children */
    try {
      var sel = globalThis.__avStore && globalThis.__avStore.getState().selectedId;
      if (sel && R[sel] && !by[sel] && (!restrictSys || R[sel].system === restrictSys)) {
        var kids = [];
        s.scene.traverse(function (o) {
          if (!o.isMesh || !o.userData) return;
          var id = o.userData.structureId; if (!id || (id.indexOf(sel + '-') !== 0 && !aliasKid(sel, id))) return;
          if (!chainVisible(o) || !meshOpaque(o)) return;
          kids.push(o);
        });
        if (kids.length) by[sel] = kids;
      }
    } catch (e) {}
    return by;
  }

  /* aggregate records whose parts carry other ids (lungs -> lobes, hand and foot bones -> named bones) */
  function aliasKid(sel, id) {
    var side = /-left$/.test(sel) ? 'left' : /-right$/.test(sel) ? 'right' : '';
    if (sel === 'left-lung') return /^left-(upper|lower)-lobe$/.test(id);
    if (sel === 'right-lung') return /^right-(upper|middle|lower)-lobe$/.test(id);
    if (/^foot-bones/.test(sel)) return !!side && id.slice(-side.length - 1) === '-' + side && /(calcaneus|talus|navicular|cuboid|cuneiform|metatarsal|toe$|toe-|great-toe|sesamoid)/.test(id) && !/ligament|capsule|muscle|artery|vein|nerve|tendon|sheath|bursa/.test(id);
    if (/^hand-bones/.test(sel)) return !!side && id.slice(-side.length - 1) === '-' + side && /(carpal|scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|phalanx)/.test(id) && !/ligament|capsule|muscle|artery|vein|nerve|tendon|sheath|bursa/.test(id);
    return false;
  }
  globalThis.__avAliasKid = aliasKid;
  function project(cam, W, H, p) {
    var e = cam.matrixWorldInverse.elements, x = p[0], y = p[1], z = p[2];
    var vx = e[0] * x + e[4] * y + e[8] * z + e[12], vy = e[1] * x + e[5] * y + e[9] * z + e[13], vz = e[2] * x + e[6] * y + e[10] * z + e[14], vw = e[3] * x + e[7] * y + e[11] * z + e[15];
    var pe = cam.projectionMatrix.elements;
    var cx = pe[0] * vx + pe[4] * vy + pe[8] * vz + pe[12] * vw, cy = pe[1] * vx + pe[5] * vy + pe[9] * vz + pe[13] * vw, cw = pe[3] * vx + pe[7] * vy + pe[11] * vz + pe[15] * vw;
    if (cw <= 0.0001) return null;
    return [(cx / cw * 0.5 + 0.5) * W, (1 - (cy / cw * 0.5 + 0.5)) * H, vz];
  }

  function evalStructure(id, meshes, cam, W, H) {
    var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (var i = 0; i < meshes.length; i++) {
      var b = worldBox(meshes[i]); if (!b) continue;
      for (var k = 0; k < 3; k++) { if (b[k] < mn[k]) mn[k] = b[k]; if (b[k + 3] > mx[k]) mx[k] = b[k + 3]; }
    }
    if (mn[0] > mx[0]) return null;
    var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9, any = false;
    for (var c = 0; c < 8; c++) {
      var p = project(cam, W, H, [c & 1 ? mx[0] : mn[0], c & 2 ? mx[1] : mn[1], c & 4 ? mx[2] : mn[2]]);
      if (!p) continue; any = true;
      if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0]; if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1];
    }
    if (!any) return null;
    var w = Math.min(maxx, W * 3) - Math.max(minx, -W * 2), h = Math.min(maxy, H * 3) - Math.max(miny, -H * 2);
    return { id: id, meshes: meshes, size: Math.sqrt(Math.max(0, w) * Math.max(0, h)), wy: (mn[1] + mx[1]) / 2, wx: (mn[0] + mx[0]) / 2,
      box: [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2] };
  }

  function anchor(cam, W, H, ev) {
    var cp = cam.position, P = [], i, n = 0, cx = 0, cy = 0, cz = 0;
    for (i = 0; i < ev.meshes.length; i++) { var a = samples(ev.meshes[i]); for (var j = 0; j < a.length; j += 3) { P.push(a[j], a[j + 1], a[j + 2]); cx += a[j]; cy += a[j + 1]; cz += a[j + 2]; n++; } }
    if (!n) return project(cam, W, H, ev.box);
    cx /= n; cy /= n; cz /= n;
    var tx = cp.x - cx, ty = cp.y - cy, tz = cp.z - cz, bi = -1, bd = 1e18;
    for (i = 0; i < P.length; i += 3) {
      if ((P[i] - cx) * tx + (P[i + 1] - cy) * ty + (P[i + 2] - cz) * tz < 0) continue;   // keep the camera-facing half
      var d = (P[i] - cx) * (P[i] - cx) + (P[i + 1] - cy) * (P[i + 1] - cy) + (P[i + 2] - cz) * (P[i + 2] - cz);
      if (d < bd) { bd = d; bi = i; }
    }
    if (bi < 0) bi = 0;
    return project(cam, W, H, [P[bi], P[bi + 1], P[bi + 2]]);
  }

  /* ---------- layout ---------- */
  /* place item centres in the free space of a column (blocked intervals removed), spaced so none overlap */
  function layoutColumn(items, top, bottom, gap, blocks) {
    items.sort(function (a, b) { return a.ay - b.ay; });
    var segs = [], cur = top;
    blocks.forEach(function (bl) { if (bl[0] > cur) segs.push([cur, bl[0]]); cur = Math.max(cur, bl[1]); });
    if (cur < bottom) segs.push([cur, bottom]);
    var free = 0; segs.forEach(function (g) { free += g[1] - g[0]; });
    function toFree(y) { var f = 0; for (var k = 0; k < segs.length; k++) { var g = segs[k]; if (y >= g[1]) f += g[1] - g[0]; else { if (y > g[0]) f += y - g[0]; break; } } return f; }
    function toReal(f) { for (var k = 0; k < segs.length; k++) { var g = segs[k], l = g[1] - g[0]; if (f <= l || k === segs.length - 1) return g[0] + Math.min(f, l); f -= l; } return top; }
    var prev = null, i;
    for (i = 0; i < items.length; i++) { var h = items[i].h; var want = toFree(items[i].ay); var c = want; if (prev) c = Math.max(c, prev.c + (prev.h + h) / 2 + gap); c = Math.max(c, h / 2); items[i].c = c; prev = items[i]; }
    var lim = free;
    for (i = items.length - 1; i >= 0; i--) { var hh = items[i].h; if (items[i].c + hh / 2 > lim) items[i].c = lim - hh / 2; lim = items[i].c - hh / 2 - gap; }
    items.forEach(function (it) { it.y = toReal(it.c) - it.h / 2; });
    return free;
  }
  function obstacles(hr, W, H) {
    var out = [], tall = [], q = document.querySelectorAll('button,input,select,a,[role=slider],[role=dialog],nav,header,.av-panel');
    for (var n = 0; n < q.length; n++) {
      var e = q[n];
      if ((root && root.contains(e)) || (ctl && ctl.contains(e)) || (idx && idx.contains(e)) || (listEl && listEl.contains(e)) || e.contains(host)) continue;
      var r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue;
      var x0 = Math.max(0, r.left - hr.left - 3), y0 = Math.max(0, r.top - hr.top - 3), x1 = Math.min(W, r.right - hr.left + 3), y1 = Math.min(H, r.bottom - hr.top + 3);
      if (x1 - x0 < 6 || y1 - y0 < 6) continue;
      if ((x1 - x0) > W * 0.6 && (y1 - y0) > H * 0.6) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' && e.tagName !== 'INPUT') { if (cs.visibility === 'hidden') continue; }
      var b = [x0, y0, x1, y1];
      if ((y1 - y0) > H * 0.35 && (x1 - x0) < 70) tall.push(b); else out.push(b);
    }
    return { out: out, tall: tall };
  }
  function colBlocks(obs, x0, x1, pad) {
    var bl = obs.filter(function (o) { return o[2] > x0 && o[0] < x1; }).map(function (o) { return [o[1] - pad, o[3] + pad]; }).sort(function (a, b) { return a[0] - b[0]; });
    var m = []; bl.forEach(function (b) { var l = m[m.length - 1]; if (l && b[0] <= l[1]) l[1] = Math.max(l[1], b[1]); else m.push(b.slice()); });
    return m;
  }

  function placeControl(ob, W, H, mL) {
    if (!ctl) return;
    var w = ctl.offsetWidth || 150, h = ctl.offsetHeight || 28, x = Math.max(8, mL + 4), best = 8;
    var all = ob.out.concat(ob.tall);
    for (var y = 8; y < Math.min(H - 60, 260); y += 6) {
      var hit = all.some(function (o) { return o[2] > x && o[0] < x + w && o[3] > y && o[1] < y + h; });
      if (!hit) { best = y; break; }
    }
    ctl.style.left = x + 'px'; ctl.style.top = best + 'px';
  }
  function node(key, build) { var n = nodes[key]; if (!n) { n = build(); nodes[key] = n; } n.seen = true; return n; }

  function run(force) {
    var s = sc(), S = ST(); if (!s || !S || !root || !host) return;
    var W = host.clientWidth, H = host.clientHeight; if (W < 50 || H < 50) return;
    var cam = s.camera; cam.updateMatrixWorld();
    var ce = cam.matrixWorld.elements;
    var key = [mode, S.selectedId, S.systemFocus, S.labelsOn, (S.emphasis || []).join(), W, H, ce[12].toFixed(3), ce[13].toFixed(3), ce[14].toFixed(3), ce[0].toFixed(3), ce[2].toFixed(3), ce[4].toFixed(3), ce[6].toFixed(3), ce[8].toFixed(3), ce[10].toFixed(3), (S.hidden || []).length, (S.isolated || []).length, S.xray ? 1 : 0].join('|');
    var now = performance.now();
    if (!force && key === lastKey && now - lastRun < 900) return;
    if (!force && now - lastRun < 60) return;
    lastKey = key; lastRun = now;

    var R = REC(), mobile = Math.min(W, H) < 520 || W < 700;
    var hr = host.getBoundingClientRect(), ob = obstacles(hr, W, H);
    var rowH = mobile ? 17 : 19, gap = 3, top = 4, bottom = H - 4;
    var mL = 6, mR = 6;
    ob.tall.forEach(function (t) { if (t[0] < W * 0.3) mL = Math.max(mL, t[2] + 4); else if (t[2] > W * 0.7) mR = Math.max(mR, W - t[0] + 4); });
    var colW = Math.round(Math.max(88, Math.min(mobile ? 136 : 170, W * (mobile ? 0.34 : 0.2))));
    var padB = rowH / 2 + 1;
    var blL = colBlocks(ob.out, mL, mL + colW, padB), blR = colBlocks(ob.out, W - mR - colW, W - mR, padB);
    function freeLen(bl) { var f = bottom - top; bl.forEach(function (b) { f -= Math.max(0, Math.min(b[1], bottom) - Math.max(b[0], top)); }); return f; }
    var capL = Math.max(1, Math.floor(freeLen(blL) / (rowH + gap))), capR = Math.max(1, Math.floor(freeLen(blR) / (rowH + gap)));
    var maxRows = Math.max(capL, capR);
    placeControl(ob, W, H, mL);
    var narrow = window.matchMedia('(max-width:767px)').matches;
    if (listEl) { listEl.style.left = mL + 'px'; listEl.style.right = mR + 'px'; }
    if (idx) { idx.style.left = mL + 'px'; if (narrow) idx.style.right = mR + 'px'; else { idx.style.right = ''; var pt = ctl.offsetTop + ctl.offsetHeight + 8, px1 = mL + 330; for (var it = 0; it < 5; it++) { var moved = false; ob.out.concat(ob.tall).forEach(function (o) { if (o[2] > mL && o[0] < px1 && o[1] < pt + 48 && o[3] > pt - 2 && o[3] < H * 0.5) { pt = o[3] + 6; moved = true; } }); if (!moved) break; } idx.style.top = pt + 'px'; } }
    var wantSmart = mode === 'smart' && S.labelsOn !== false;

    var by = structures(wantSmart ? S.systemFocus : null);
    var pinned = [];
    if (S.selectedId) pinned.push(S.selectedId);
    (S.emphasis || []).forEach(function (id) { if (pinned.indexOf(id) < 0) pinned.push(id); });
    var all = {};
    if (wantSmart) { for (var id in by) all[id] = by[id]; }
    var needExtra = pinned.filter(function (id) { return !all[id]; });
    if (needExtra.length) {   // selected or emphasised structures are always labelled, even if outside the focus set
      var allBy = structures(null); needExtra.forEach(function (id) { if (allBy[id]) all[id] = allBy[id]; });
    }

    var cand = [];
    for (var cid in all) {
      var ev = evalStructure(cid, all[cid], cam, W, H); if (!ev) continue;
      ev.pin = pinned.indexOf(cid) >= 0; ev.sel = cid === S.selectedId; ev.rec = R[cid];
      cand.push(ev);
    }
    stats.candidates = cand.length;

    var labelled = [], clusters = [];
    var minPx = Math.max(16, Math.min(W, H) * (mobile ? 0.07 : 0.05));
    var capLabels = Math.max(2, Math.min(capL + capR - 3, mobile ? 11 : 22));
    var capChipsMax = mobile ? 7 : 11;

    /* pinned first */
    cand.forEach(function (c) { if (c.pin) labelled.push(c); });

    if (wantSmart) {
      /* one label per left/right pair unless one of them is pinned */
      var rest = cand.filter(function (c) { return !c.pin; });
      var best = {};
      rest.forEach(function (c) {
        var base = c.id.replace(/-(left|right)$/, ''), cur = best[base];
        if (!cur || c.size > cur.size) best[base] = c;
      });
      var uniq = rest.filter(function (c) { return best[c.id.replace(/-(left|right)$/, '')] === c; });
      uniq.sort(function (a, b) { return b.size - a.size; });
      var placedCount = labelled.length;
      var leftovers = [];
      for (var u = 0; u < uniq.length; u++) {
        var c2 = uniq[u];
        if (placedCount < capLabels && c2.size >= minPx) { var pa = anchor(cam, W, H, c2); if (pa && pa[0] > 6 && pa[0] < W - 6 && pa[1] > 40 && pa[1] < H - 30) { c2.a = pa; labelled.push(c2); placedCount++; continue; } }
        leftovers.push(c2);
      }
      /* the rest become region clusters (all structures, both sides, that are on screen and large enough to see) */
      var groups = {};
      cand.forEach(function (c) {
        if (c.pin || labelled.indexOf(c) >= 0 || c.size < 5) return;
        var p = project(cam, W, H, c.box); if (!p || p[0] < 0 || p[0] > W || p[1] < 20 || p[1] > H - 10) return;
        var sr = subRegion(c.rec, c.wy, c.wx), g = groups[sr] = groups[sr] || { name: sr, ids: [], layers: {}, sx: 0, sy: 0, sz: 0 };
        g.ids.push(c.id); g.layers[c.rec.layer] = (g.layers[c.rec.layer] || 0) + 1; g.sz += c.size; if (!g.bs || c.size > g.bs) { g.bs = c.size; g.sx = p[0]; g.sy = p[1]; }
      });
      Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.ids.length >= 3; })
        .sort(function (a, b) { return b.sz - a.sz; }).slice(0, Math.max(0, Math.min(capChipsMax, capL + capR - 2 - labelled.length))).forEach(function (g) {
          g.ax = g.sx; g.ay = g.sy;
          g.text = g.name + ' ' + noun(g.layers, g.ids.length) + ' (' + g.ids.length + ')';
          clusters.push(g);
        });
    }

    /* anchors for pinned */
    labelled.forEach(function (c) { if (!c.a) c.a = anchor(cam, W, H, c); });
    labelled = labelled.filter(function (c) { return c.a && c.a[0] > 2 && c.a[0] < W - 2 && c.a[1] > 2 && c.a[1] < H - 2; });

    /* build items and split into columns */
    var items = [];
    labelled.forEach(function (c) { items.push({ kind: 'l', key: 'l:' + c.id, id: c.id, text: short(c.rec.name || c.id), full: c.rec.name || c.id, ax: c.a[0], ay: c.a[1], sel: c.sel, pin: c.pin, h: c.sel ? 24 : rowH }); });
    clusters.forEach(function (g) { items.push({ kind: 'c', key: 'c:' + g.name, g: g, text: g.text, ax: g.ax, ay: g.ay, h: rowH }); });
    var cw = function (it) { return it.kind === 'c' ? Math.min(colW + 18, 156) : colW; };
    var L = [], Rr = [];
    items.forEach(function (it) { (it.ax < W / 2 ? L : Rr).push(it); });
    function spill(from, to, capF, capT) { while (from.length > capF && !from[0].sel) { from.sort(function (a, b) { return Math.abs(b.ax - W / 2) - Math.abs(a.ax - W / 2); }); var mv = from.pop(); if (to.length < capT) to.push(mv); else mv.drop = true; } }
    spill(L, Rr, capL, capR); spill(Rr, L, capR, capL);
    L = L.filter(function (i) { return !i.drop; }); Rr = Rr.filter(function (i) { return !i.drop; });
    layoutColumn(L, top, bottom, gap, blL); layoutColumn(Rr, top, bottom, gap, blR);

    /* render */
    for (var nk in nodes) nodes[nk].seen = false;
    var lines = [];
    function draw(col, side) {
      col.forEach(function (it) {
        var n = node(it.key, function () {
          var b = el('button', { type: 'button', class: 'lb' + (it.kind === 'c' ? ' cl' : ''), 'aria-label': it.text });
          b.appendChild(el('span', { class: 'tx', text: it.text }));
          isolate(b); root.appendChild(b); return { b: b };
        });
        n.b.className = 'lb' + (it.kind === 'c' ? ' cl' : '') + (it.sel ? ' sel' : '');
        n.b.firstChild.textContent = it.sel ? (it.full || it.text) : it.text; n.b.setAttribute('aria-label', it.full || it.text); n.b.title = it.full || it.text;
        n.b.style.display = '';
        n.b.style.maxWidth = (it.sel ? Math.min(190, W * 0.5) : cw(it)) + 'px';
        n.b.__it = it;
        var w = Math.min(it.sel ? 190 : cw(it), n.b.offsetWidth || colW);
        var x = side === 'l' ? mL : W - mR - w;
        n.b.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(it.y) + 'px)';
        var ex = side === 'l' ? x + w : x, ey = it.y + (it.h || rowH) / 2;
        lines.push({ k: it.key, sel: it.sel, d: 'M' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' L' + (ex + (side === 'l' ? 10 : -10)).toFixed(1) + ' ' + ey.toFixed(1) + ' L' + it.ax.toFixed(1) + ' ' + it.ay.toFixed(1), ax: it.ax, ay: it.ay });
      });
    }
    draw(L, 'l'); draw(Rr, 'r');
    /* click handlers read the current item */
    for (var k2 in nodes) { (function (n) { if (!n.wired) { n.wired = true; n.b.addEventListener('click', function (ev) { ev.stopPropagation(); var it = n.b.__it; if (!it) return; if (it.kind === 'c') openList(it.g); else focusId(it.id); }); } })(nodes[k2]); }
    for (var k3 in nodes) { if (!nodes[k3].seen) { nodes[k3].b.style.display = 'none'; nodes[k3].b.__it = null; } }
    /* svg */
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    lines.forEach(function (ln) {
      var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', ln.d); p.setAttribute('class', 'ln' + (ln.sel ? ' sel' : '')); svg.appendChild(p);
      var d = document.createElementNS(SVGNS, 'circle'); d.setAttribute('cx', ln.ax.toFixed(1)); d.setAttribute('cy', ln.ay.toFixed(1)); d.setAttribute('r', ln.sel ? 3.5 : 2.5); d.setAttribute('class', 'dt' + (ln.sel ? ' sel' : '')); svg.appendChild(d);
    });
    stats.shown = L.length + Rr.length; stats.clusters = clusters.length;
    globalThis.__avSLstats = stats;
  }

  function short(n) { var t = n.replace(/\s*\([^)]*\)/g, '').trim(); return t || n; }
  function focusId(id) { var S = ST(); if (!S) return; try { S.focusStructure(id); } catch (e) { S.select(id); } closeList(); }

  /* ---------- cluster list ---------- */
  function closeList() { if (listEl) { listEl.remove(); listEl = null; } }
  function openList(g) {
    closeList(); var R = REC();
    var ids = g.ids.slice().sort(function (a, b) { return (R[a].name || a).localeCompare(R[b].name || b); });
    var bd = el('div', { class: 'bd' });
    ids.forEach(function (id) { var b = el('button', { type: 'button', class: 'it', text: R[id].name || id }); b.addEventListener('click', function () { focusId(id); }); bd.appendChild(b); });
    var hd = el('header', {}, [el('span', { text: g.text }), el('button', { type: 'button', class: 'x', text: 'Close', on: { click: closeList } })]);
    listEl = el('div', { id: 'avsl-list', role: 'dialog', 'aria-label': g.text }, [hd, bd]);
    isolate(listEl); host.appendChild(listEl); var f = listEl.querySelector('.it'); if (f) f.focus();
  }

  /* ---------- index ---------- */
  var idxState = { q: '', sys: '', open: {} };
  var hasMesh = null;
  function meshIds() { var s = sc(), out = {}; if (!s) return out; s.scene.traverse(function (o) { if (o.isMesh && o.userData && o.userData.structureId) out[o.userData.structureId] = 1; }); return out; }
  function shown3d(id) { return !!(hasMesh && (hasMesh[id] || hasMesh[id + '-left'] || hasMesh[id + '-right'])); }
  function buildIndex() {
    if (idx) { idx.remove(); idx = null; }
    var R = REC(), ids = Object.keys(R); if (!ids.length) return;
    hasMesh = meshIds();
    var groups = {}; IDX_GROUPS.forEach(function (g) { groups[g[0]] = []; });
    ids.forEach(function (id) { var r = R[id]; groups[idxGroup(r)].push(r); });
    for (var gk in groups) groups[gk].sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
    var systems = {}; ids.forEach(function (id) { systems[R[id].system] = 1; });
    var q = el('input', { type: 'search', id: 'avsl-q', placeholder: 'Search all ' + ids.length + ' structures', 'aria-label': 'Search the anatomical index', autocomplete: 'off' });
    var sel = el('select', { id: 'avsl-sys', 'aria-label': 'Filter by system' }, [el('option', { value: '', text: 'All systems' })].concat(Object.keys(systems).sort().map(function (s) { return el('option', { value: s, text: s.replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }) }); })));
    var tools = el('div', { class: 'tools' }, [q, sel]);
    var bd = el('div', { class: 'bd' });
    var hd = el('header', {}, [el('span', { text: 'Anatomical index' }), el('button', { type: 'button', class: 'x', id: 'avsl-min', text: 'Collapse', on: { click: function () { var m = idx.classList.toggle('min'); this.textContent = m ? 'Expand' : 'Collapse'; } } })]);
    idx = el('div', { id: 'avsl-idx', role: 'region', 'aria-label': 'Anatomical index' }, [hd, tools, bd]);
    isolate(idx); host.appendChild(idx);
    function match(r, t) { return !t || (r.name || '').toLowerCase().indexOf(t) >= 0 || (r.latinName || '').toLowerCase().indexOf(t) >= 0 || (r.synonyms || []).join(' ').toLowerCase().indexOf(t) >= 0 || r.id.indexOf(t.replace(/\s+/g, '-')) >= 0; }
    function itemBtn(r) {
      var b = el('button', { type: 'button', class: 'it' }); b.appendChild(document.createTextNode(r.name || r.id));
      b.appendChild(el('span', { class: 'sys', text: (r.system || '').replace(/-/g, ' ') }));
      if (!shown3d(r.id)) b.appendChild(el('span', { class: 'no3d', text: 'details only' }));
      b.addEventListener('click', function () {
        var S = ST(); if (!S) return;
        var kids = hasMesh[r.id] ? [] : ['-right', '-left'].map(function (x) { return r.id + x; }).filter(function (k) { return hasMesh[k]; });
        try { S.focusStructure(kids.length ? kids[0] : r.id); if (kids.length > 1) S.frame(kids); } catch (e) { S.select(r.id); }
        if (window.matchMedia('(max-width:767px)').matches) { idx.classList.add('min'); var mb = idx.querySelector('#avsl-min'); if (mb) mb.textContent = 'Expand'; }
      });
      return b;
    }
    function render() {
      bd.textContent = ''; var t = idxState.q.trim().toLowerCase(), sy = idxState.sys, total = 0;
      IDX_GROUPS.forEach(function (g) {
        var list = groups[g[0]].filter(function (r) { return (!sy || r.system === sy) && match(r, t); });
        if (!list.length) return; total += list.length;
        var d = el('details', {}), sm = el('summary', {}, [el('span', { text: g[1] }), el('span', { class: 'sm', text: String(list.length) })]); d.appendChild(sm);
        var body = el('div', {}); d.appendChild(body);
        function fill() { if (body.firstChild) return; var cap = t ? 150 : 400; list.slice(0, cap).forEach(function (r) { body.appendChild(itemBtn(r)); }); if (list.length > cap) body.appendChild(el('div', { class: 'sm', text: '+' + (list.length - cap) + ' more. Type to narrow the list.', style: 'padding:6px 8px' })); }
        d.addEventListener('toggle', function () { idxState.open[g[0]] = d.open; if (d.open) fill(); });
        if (t || idxState.open[g[0]]) { d.open = true; fill(); }
        bd.appendChild(d);
      });
      if (!total) bd.appendChild(el('div', { class: 'sm', text: 'No structure matches. Try another word.', style: 'padding:10px' }));
    }
    var tm = 0; q.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { idxState.q = q.value; render(); }, 120); });
    sel.addEventListener('change', function () { idxState.sys = sel.value; render(); });
    render();
  }

  /* ---------- mode control ---------- */
  function setMode(m) {
    mode = m; try { localStorage.setItem(KEY, m); } catch (e) {}
    if (ctl) Array.prototype.forEach.call(ctl.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
    closeList();
    if (m === 'index') { if (!idx) buildIndex(); } else if (idx) { idx.remove(); idx = null; }
    lastKey = ''; run(true);
  }
  function mountControl() {
    var defs = [['clean', 'Clean', 'Clean view: only the selected structure is labelled'], ['smart', 'Smart', 'Smart labels: arranged around the body with leader lines'], ['index', 'Index', 'Anatomical index: searchable list of every structure']];
    ctl = el('div', { id: 'avsl-ctl', role: 'group', 'aria-label': 'Label display' }, defs.map(function (d) {
      var b = el('button', { type: 'button', 'data-m': d[0], title: d[2], 'aria-pressed': String(mode === d[0]), text: d[1] }); b.addEventListener('click', function () { setMode(d[0]); }); return b;
    }));
    isolate(ctl); host.appendChild(ctl);
  }

  /* ---------- mount / unmount with the lab page ---------- */
  function mount(canvasHost) {
    host = canvasHost; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    root = el('div', { id: 'avsl' }); svg = document.createElementNS(SVGNS, 'svg'); root.appendChild(svg); host.appendChild(root);
    mountControl(); if (mode === 'index') buildIndex();
    if (window.ResizeObserver) { new ResizeObserver(function () { lastKey = ''; }).observe(host); }
    var tick = function () { raf = requestAnimationFrame(tick); try { run(false); } catch (e) { if (!tick.warned) { tick.warned = 1; console.warn('smart labels', e); } } };
    tick();
  }
  function unmount() {
    cancelAnimationFrame(raf); [root, ctl, idx, listEl].forEach(function (n) { if (n && n.remove) n.remove(); });
    root = svg = ctl = idx = listEl = host = null; nodes = {}; lastKey = '';
  }
  setInterval(function () {
    var s = sc(), canv = s && s.gl && s.gl.domElement, ok = !!(canv && canv.isConnected && canv.parentElement);
    if (ok && !host) mount(canv.parentElement);
    else if (ok && host && host !== canv.parentElement) { unmount(); mount(canv.parentElement); }
    else if (!ok && host) unmount();
    else if (ok && mode === 'index' && idx && Object.keys(REC()).length && !hasMesh) buildIndex();
  }, 600);
  globalThis.__avSL = true;
  globalThis.__avSLmode = function (m) { setMode(m); };
})();
