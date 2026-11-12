/* AnatomyVerse self-check: runs the technical audit checks inside the app and offers safe, non-anatomical repairs.
   It never edits anatomy. Findings are technical (software) checks, not validation by an anatomical expert. */
(function () {
  'use strict';
  var TOL_MM = 15;
  var PAIRS = [
    ['subclavian-artery-left', 'axillary-artery-left'], ['subclavian-artery-right', 'axillary-artery-right'],
    ['axillary-artery-left', 'brachial-artery-left'], ['axillary-artery-right', 'brachial-artery-right'],
    ['brachial-artery-left', 'radial-artery-left'], ['brachial-artery-left', 'ulnar-artery-left'],
    ['brachial-artery-right', 'radial-artery-right'], ['brachial-artery-right', 'ulnar-artery-right'],
    ['aorta', 'common-carotid-artery-left'], ['aorta', 'common-carotid-artery-right'],
    ['aorta', 'subclavian-artery-left'], ['aorta', 'common-iliac-artery'], ['aorta', 'coeliac-trunk'], ['aortic-valve', 'aorta'],
    ['common-iliac-artery', 'external-iliac-artery-left'], ['common-iliac-artery', 'external-iliac-artery-right'],
    ['external-iliac-artery-left', 'femoral-artery-left'], ['external-iliac-artery-right', 'femoral-artery-right'],
    ['femoral-artery-left', 'popliteal-artery-left'], ['femoral-artery-right', 'popliteal-artery-right'],
    ['popliteal-artery-left', 'anterior-tibial-artery-left'], ['popliteal-artery-left', 'posterior-tibial-artery-left'],
    ['popliteal-artery-right', 'anterior-tibial-artery-right'], ['popliteal-artery-right', 'posterior-tibial-artery-right'],
    ['axillary-vein-left', 'basilic-vein-left'], ['axillary-vein-right', 'basilic-vein-right'],
    ['brainstem', 'spinal-cord'], ['spinal-cord', 'cauda-equina']
  ];
  var DEF = { layerVisible: { skin: true, muscles: true, bones: true, vessels: true, nerves: true, organs: true }, layerOpacity: { skin: 0.12, muscles: 1, bones: 1, vessels: 1, nerves: 1, organs: 1 } };
  var cancel = false, running = false, report = null, ui = null;

  function store() { return globalThis.__avStore && globalThis.__avStore.getState(); }
  function R() { return globalThis.__avRec || {}; }
  function sc() { var r = globalThis.__r3s && globalThis.__r3s.get && globalThis.__r3s.get(); return r && r.scene && r.camera ? r : null; }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function visibleChain(o) { for (var p = o; p; p = p.parent) if (!p.visible) return false; return true; }

  function worldVerts(o) {
    var g = o.geometry, p = g.attributes.position, e = o.matrixWorld.elements, a = new Float32Array(p.count * 3);
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i); a[i * 3] = e[0] * x + e[4] * y + e[8] * z + e[12]; a[i * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; a[i * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; }
    return a;
  }
  function meshesById() {
    var s = sc(), by = {}; if (!s) return by; s.scene.updateMatrixWorld(true);
    s.scene.traverse(function (o) { if (o.isMesh && o.userData && o.userData.structureId) (by[o.userData.structureId] = by[o.userData.structureId] || []).push(o); });
    return by;
  }
  function cat(list) { var out = []; list.forEach(function (o) { out.push(worldVerts(o)); }); return out; }
  function minDistMm(A, B) {
    var m = 1e18;
    for (var a = 0; a < A.length; a++) for (var b = 0; b < B.length; b++) {
      var P = A[a], Q = B[b], sa = Math.max(1, Math.floor(P.length / 3 / 1500)), sb = Math.max(1, Math.floor(Q.length / 3 / 1500));
      for (var i = 0; i < P.length; i += 3 * sa) for (var j = 0; j < Q.length; j += 3 * sb) {
        var dx = P[i] - Q[j], dy = P[i + 1] - Q[j + 1], dz = P[i + 2] - Q[j + 2], d = dx * dx + dy * dy + dz * dz; if (d < m) m = d;
      }
    }
    return Math.sqrt(m) * 1000;
  }

  /* ---------- checks ---------- */
  function checkRecords(add) {
    var rec = R(), ids = Object.keys(rec), names = {}, noLatin = 0, noFn = 0, shortDesc = 0, noSup = [];
    ids.forEach(function (id) {
      var r = rec[id], n = (r.name || '').trim().toLowerCase(); (names[n] = names[n] || []).push(id);
      if (!(r.bloodSupply && r.venousDrainage && r.innervation)) noSup.push(id); if (!r.latinName) noLatin++; if (!(r.function && String(r.function).trim())) noFn++; if (!r.description || String(r.description).length < 60) shortDesc++;
    });
    var dups = Object.keys(names).filter(function (n) { return names[n].length > 1; });
    add('Records', dups.length ? 'fail' : 'pass', ids.length + ' records; ' + dups.length + ' duplicated names' + (dups.length ? ': ' + dups.slice(0, 8).join(', ') : ''));
    add('Blood and nerve supply', noSup.length ? 'fail' : 'pass', noSup.length ? noSup.length + ' records lack arterial supply, venous drainage or nerve supply text: ' + noSup.slice(0, 8).join(', ') : 'All ' + ids.length + ' records have arterial supply, venous drainage and nerve supply text (written from standard references; not yet reviewed by the named reviewers)');
    add('Content gaps', 'info', noLatin + ' without Latin name, ' + noFn + ' without function text, ' + shortDesc + ' with very short descriptions (needs expert-written or cited text; not auto-repaired)');
  }
  function checkSceneDuplicates(add, by) {
    var bad = [];
    Object.keys(by).forEach(function (id) {
      var list = by[id].filter(visibleChain); if (list.length < 2) return;
      var bx = list.map(function (o) { o.geometry.computeBoundingBox(); var b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z]; });
      for (var i = 0; i < bx.length; i++) for (var j = i + 1; j < bx.length; j++) {
        var same = list[i].geometry.attributes.position.count === list[j].geometry.attributes.position.count; for (var k = 0; k < 6; k++) if (Math.abs(bx[i][k] - bx[j][k]) > 0.002) same = false;
        if (same) bad.push(id);
      }
    });
    add('Duplicate meshes', bad.length ? 'fail' : 'pass', bad.length ? 'Same structure drawn twice in the same place: ' + bad.slice(0, 10).join(', ') : 'No structure is drawn twice in the same place (checked ' + Object.keys(by).length + ' structures)');
    var shown = {}, tw = [];
    Object.keys(by).forEach(function (id) { var n = (R()[id] && R()[id].name || '').toLowerCase(); if (!n) return; if (by[id].some(visibleChain)) { (shown[n] = shown[n] || []).push(id); } });
    Object.keys(shown).forEach(function (n) { if (shown[n].length > 1) tw.push(n + ' [' + shown[n].join(' + ') + ']'); });
    add('Same name shown by two ids', tw.length ? 'fail' : 'pass', tw.length ? tw.slice(0, 8).join('; ') : 'None');
  }
  /* Integrity checks added by the Nov 2026 master audit (technical only). */
  function checkIntegrity(add, by) {
    var rec = R(), ids = Object.keys(rec), badParent = [], cyc = [], noSys = [], noName = [];
    ids.forEach(function (id) {
      var r = rec[id]; if (!r.name || !String(r.name).trim()) noName.push(id); if (!r.system) noSys.push(id);
      if (r.parentId && !rec[r.parentId]) badParent.push(id);
      var seen = {}, q = r, n = 0; while (q && q.parentId && n++ < 40) { if (seen[q.parentId]) { cyc.push(id); break; } seen[q.parentId] = 1; q = rec[q.parentId]; }
    });
    var bad = badParent.length + cyc.length + noSys.length + noName.length;
    add('Names, systems and parents', bad ? 'fail' : 'pass', noName.length + ' without a name, ' + noSys.length + ' without a system, ' + badParent.length + ' with a missing parent, ' + cyc.length + ' in a parent loop' + (bad ? ': ' + noName.concat(noSys, badParent, cyc).slice(0, 8).join(', ') : ''));
    var s = sc(), empty = [], nan = [], tiny = [], huge = [], out = [], unmapped = 0, two = [];
    if (!s) return;
    s.scene.traverse(function (o) {
      if (!o.isMesh || o.isInstancedMesh) return; var g = o.geometry, p = g && g.attributes && g.attributes.position; var nm = o.name || '(unnamed)';
      if (!p || !p.count) { empty.push(nm); return; }
      var sid = o.userData && o.userData.structureId; if (!sid) { if (o.parent && /^(schematic|zanatomy|bodyparts3d|anatomyverse|hubmap)/.test(o.parent.name || '')) unmapped++; return; }
      if (!g.boundingBox) g.computeBoundingBox(); var b = g.boundingBox.clone().applyMatrix4(o.matrixWorld), mn = b.min, mx = b.max;
      if (!(isFinite(mn.x + mn.y + mn.z + mx.x + mx.y + mx.z))) { nan.push(nm); return; }
      var d = Math.max(mx.x - mn.x, mx.y - mn.y, mx.z - mn.z);
      if (d < 0.0004) tiny.push(nm); if (d > 1.9) huge.push(nm);
      if (mn.y < -0.05 || mx.y > 1.85 || mn.x < -1.05 || mx.x > 1.05 || mn.z < -0.5 || mx.z > 0.5) out.push(nm);
    });
    Object.keys(by).forEach(function (id) {
      var m = {}; by[id].forEach(function (o) { if (!visibleChain(o)) return; var k = o.parent && o.parent.name || '?'; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); m[k] = m[k] ? m[k].union(b) : b; });
      var ks = Object.keys(m);
      for (var i = 0; i < ks.length; i++) for (var j = i + 1; j < ks.length; j++) {
        var a = m[ks[i]], c = m[ks[j]], x = Math.min(a.max.x, c.max.x) - Math.max(a.min.x, c.min.x), y = Math.min(a.max.y, c.max.y) - Math.max(a.min.y, c.min.y), z = Math.min(a.max.z, c.max.z) - Math.max(a.min.z, c.min.z);
        if (x <= 0 || y <= 0 || z <= 0) continue; var sa = a.max.clone().sub(a.min), sb = c.max.clone().sub(c.min), v = Math.min(sa.x * sa.y * sa.z, sb.x * sb.y * sb.z);
        if (v > 0 && x * y * z / v > 0.8) two.push(id);
      }
    });
    var gbad = empty.length + nan.length + out.length;
    add('Mesh geometry', gbad ? 'fail' : (tiny.length || huge.length ? 'warn' : 'pass'), empty.length + ' empty, ' + nan.length + ' with invalid coordinates, ' + out.length + ' outside the body bounds, ' + tiny.length + ' extremely small, ' + huge.length + ' oversized' + (gbad + tiny.length + huge.length ? ': ' + empty.concat(nan, out, tiny, huge).slice(0, 8).join(', ') : ''));
    add('Structure drawn twice', two.length ? 'warn' : 'pass', two.length + ' structures are drawn by two models in the same place' + (two.length ? ': ' + two.slice(0, 10).join(', ') : '') + '; ' + unmapped + ' meshes without a structure id');
    var have = 0, none = 0; ids.forEach(function (id) { (by[id] ? have++ : none++); });
    add('Mesh references', 'info', have + ' structures have their own mesh loaded now; ' + none + ' are text-only or shown through their parts');
  }
  function checkContinuity(add, by) {
    var bad = [], n = 0, skipped = 0, cache = {};
    var get = function (id) { if (!by[id]) return null; return cache[id] || (cache[id] = cat(by[id])); };
    PAIRS.forEach(function (p) { var A = get(p[0]), B = get(p[1]); if (!A || !B) { skipped++; return; } n++; var d = minDistMm(A, B); if (d > TOL_MM) bad.push(p[0] + ' / ' + p[1] + ': ' + d.toFixed(0) + ' mm'); });
    add('Vessel and nerve continuity', bad.length ? 'fail' : 'pass', n + ' known joins checked (tolerance ' + TOL_MM + ' mm)' + (skipped ? ', ' + skipped + ' skipped (not loaded)' : '') + (bad.length ? '. Gaps: ' + bad.join('; ') : ''));
  }
  async function checkMarkers(add, ids, progress) {
    var st = store(), rec = R(), bad = [], n = 0, s0 = st.selectedId;
    for (var k = 0; k < ids.length; k++) {
      if (cancel) break; var id = ids[k]; progress('Markers ' + (k + 1) + ' / ' + ids.length + ' — ' + id);
      try { store().select && store().select(null); } catch (e0) {}
      await wait(250); store().focusStructure(id);
      var dot = null, tries = 0, nm = ((rec[id] && rec[id].name) || '').toLowerCase().slice(0, 14);
      while (tries++ < 16 && !cancel) {
        await wait(250);
        var lb = Array.prototype.filter.call(document.querySelectorAll('#avsl .lb.sel'), function (x) { return x.offsetParent !== null && x.textContent.toLowerCase().indexOf(nm.slice(0, 10)) >= 0; });
        var dots = document.querySelectorAll('#avsl circle.dt.sel'); if (lb.length && dots.length) { dot = dots[dots.length - 1]; break; }
      }
      var r0 = sc(), last = '', still = 0, w = 0;
      while (r0 && w++ < 20 && still < 2) { var key = r0.camera.matrixWorld.elements.slice(12, 15).concat(r0.camera.zoom).map(function (v) { return v.toFixed(5); }).join(); still = key === last ? still + 1 : 0; last = key; await wait(200); }
      if (dot) { var dots2 = document.querySelectorAll('#avsl circle.dt.sel'); if (dots2.length) dot = dots2[dots2.length - 1]; }
      var okSel = store().selectedId === id, r = sc(), problem = '';
      if (!okSel) problem = 'selection failed';
      else if (!dot) problem = 'no marker shown';
      else if (r) {
        var cv = document.querySelector('canvas'), cr = cv && cv.getBoundingClientRect(), svg = dot.ownerSVGElement.getBoundingClientRect(), dx = +dot.getAttribute('cx') + svg.left, dy = +dot.getAttribute('cy') + svg.top, best = 1e9, any = false;
        r.scene.updateMatrixWorld(true); var cam = r.camera, ce = cam.matrixWorldInverse.elements, pe = cam.projectionMatrix.elements;
        r.scene.traverse(function (o) {
          if (!o.isMesh || !o.userData) return; var sid = o.userData.structureId; if (!sid || !(sid === id || sid.indexOf(id + '-') === 0 || (globalThis.__avAliasKid && globalThis.__avAliasKid(id, sid)))) return;
          var p = o.geometry.attributes.position, e = o.matrixWorld.elements, step = Math.max(1, Math.floor(p.count / 800));
          for (var i = 0; i < p.count; i += step) {
            var x = p.getX(i), y = p.getY(i), z = p.getZ(i), wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
            var vx = ce[0] * wx + ce[4] * wy + ce[8] * wz + ce[12], vy = ce[1] * wx + ce[5] * wy + ce[9] * wz + ce[13], vz = ce[2] * wx + ce[6] * wy + ce[10] * wz + ce[14], vw = ce[3] * wx + ce[7] * wy + ce[11] * wz + ce[15];
            var cx = pe[0] * vx + pe[4] * vy + pe[8] * vz + pe[12] * vw, cy = pe[1] * vx + pe[5] * vy + pe[9] * vz + pe[13] * vw, cw = pe[3] * vx + pe[7] * vy + pe[11] * vz + pe[15] * vw; if (cw <= 0) continue;
            any = true; var sx = cr.left + (cx / cw * 0.5 + 0.5) * cr.width, sy = cr.top + (1 - (cy / cw * 0.5 + 0.5)) * cr.height, d = Math.hypot(sx - dx, sy - dy); if (d < best) best = d;
          }
        });
        if (!any) problem = 'structure has no drawable mesh'; else if (best > 14) problem = 'marker ' + best.toFixed(0) + ' px from the structure';
      }
      n++; if (problem) bad.push((rec[id] ? rec[id].name : id) + ' (' + id + '): ' + problem);
    }
    if (s0) store().focusStructure(s0);
    add('Selection and markers', bad.length ? 'fail' : 'pass', n + ' structures tested' + (cancel ? ' (stopped early)' : '') + '; ' + bad.length + ' problems' + (bad.length ? ': ' + bad.slice(0, 12).join('; ') : ''));
  }

  async function checkAirborne(add, by, progress) {
    var rec = R(), C = 0.01, grid = new Map(), key = function (x, y, z) { return x + ',' + y + ',' + z; }, W = {};
    Object.keys(by).forEach(function (id) { W[id] = cat(by[id]); W[id].forEach(function (a) { for (var i = 0; i < a.length; i += 3 * Math.max(1, Math.floor(a.length / 3 / 400))) { var k = key(Math.floor(a[i] / C), Math.floor(a[i + 1] / C), Math.floor(a[i + 2] / C)), c = grid.get(k); if (!c) grid.set(k, c = []); c.push(id, a[i], a[i + 1], a[i + 2]); } }); });
    var rel = function (a, b) { return a === b || a.indexOf(b + '-') === 0 || b.indexOf(a + '-') === 0; };
    function near(id, x, y, z) { var best = 1e9, cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C);
      for (var R2 = 1; R2 <= 2; R2++) { for (var dx = -R2; dx <= R2; dx++) for (var dy = -R2; dy <= R2; dy++) for (var dz = -R2; dz <= R2; dz++) { var c = grid.get(key(cx + dx, cy + dy, cz + dz)); if (!c) continue; for (var i = 0; i < c.length; i += 4) { if (rel(c[i], id)) continue; var d = Math.hypot(c[i + 1] - x, c[i + 2] - y, c[i + 3] - z); if (d < best) best = d; } } if (best < R2 * C) break; }
      return best * 1000; }
    var bad = [], n = 0, ids = Object.keys(by).filter(function (id) { var sys = rec[id] && rec[id].system; return sys === 'cardiovascular' || sys === 'nervous'; });
    for (var k = 0; k < ids.length; k++) {
      if (cancel) break; if (k % 8 === 0) { progress('Loose vessels and nerves ' + k + ' / ' + ids.length); await wait(5); }
      var id = ids[k], tot = 0, air = 0, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      W[id].forEach(function (a) { for (var q = 0; q < a.length; q += 3) for (var j = 0; j < 3; j++) { if (a[q + j] < mn[j]) mn[j] = a[q + j]; if (a[q + j] > mx[j]) mx[j] = a[q + j]; } });
      var ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]].sort(function (a, b) { return b - a; }); if (ext[2] > 0.04) continue; /* only thin, tube-like structures */
      W[id].forEach(function (a) { var st = 3 * Math.max(1, Math.floor(a.length / 3 / 60)); for (var i = 0; i < a.length; i += st) { tot++; if (near(id, a[i], a[i + 1], a[i + 2]) > 12) air++; } });
      n++; if (tot && air / tot >= 0.25) bad.push(id + ' ' + Math.round(100 * air / tot) + '%');
    }
    add('Loose vessels and nerves', bad.length ? 'fail' : 'pass', n + ' vessels and nerves tested; ' + bad.length + ' have 25% or more of their length more than 12 mm from any other structure' + (bad.length ? ': ' + bad.join(', ') : ''));
  }
  function checkState(add) {
    var s = store(), notes = [];
    if (s.isolated && s.isolated.length) notes.push('isolation is on (' + s.isolated.length + ')'); if (s.hidden && s.hidden.length) notes.push(s.hidden.length + ' structures hidden');
    Object.keys(s.layerVisible || {}).forEach(function (k) { if (!s.layerVisible[k]) notes.push('layer ' + k + ' off'); });
    add('View state', notes.length ? 'warn' : 'pass', notes.length ? notes.join(', ') + '. "Reset view and visibility" restores the defaults.' : 'Everything visible, nothing isolated');
  }

  async function run(mode, progress) {
    running = true; cancel = false; var out = [], add = function (t, s, m) { out.push({ check: t, status: s, detail: m }); render(out); };
    try {
      progress('Reading records'); checkRecords(add); await wait(20);
      checkState(add); progress('Scanning the 3D scene'); var by = meshesById(); checkSceneDuplicates(add, by); checkIntegrity(add, by); await wait(20);
      progress('Checking vessel and nerve joins'); await wait(20); checkContinuity(add, by); await checkAirborne(add, by, progress);
      var ids = Object.keys(R()).sort(); if (mode === 'aironly') ids = []; if (mode === 'quick') ids = ids.filter(function (_, i) { return i % 20 === 0; }); await checkMarkers(add, ids, progress);
    } catch (e) { add('Self-check error', 'fail', String(e && e.message || e)); }
    running = false; progress(cancel ? 'Stopped' : 'Finished'); report = { when: new Date().toISOString(), mode: mode, note: 'Technical (software) checks only. Not validation by an anatomical expert.', results: out }; if (globalThis.__avSelfCheck) globalThis.__avSelfCheck.last = report;
  }

  /* ---------- safe repairs (non-anatomical) ---------- */
  var repairs = {
    reset: function () { var s = store(); try { s.isolate && s.isolate([]); s.restoreVisibility && s.restoreVisibility(); Object.keys(DEF.layerVisible).forEach(function (k) { s.setLayerVisible && s.setLayerVisible(k, true); s.setLayerOpacity && s.setLayerOpacity(k, DEF.layerOpacity[k]); }); if (globalThis.__avb) globalThis.__avb.set({ ld_brain: false }); } catch (e) { return 'Could not reset: ' + e.message; } return 'View and visibility reset.'; },
    refresh: async function () { try { if (navigator.serviceWorker) { var rs = await navigator.serviceWorker.getRegistrations(); for (var i = 0; i < rs.length; i++) await rs[i].unregister(); } if (globalThis.caches) { var ks = await caches.keys(); for (var j = 0; j < ks.length; j++) await caches.delete(ks[j]); } } catch (e) { return 'Could not clear cached files: ' + e.message; } setTimeout(function () { location.reload(); }, 400); return 'Cached app files cleared. Reloading…'; }
  };

  /* ---------- UI ---------- */
  var COL = { pass: '#3ddc97', fail: '#ff6b6b', warn: '#ffb74d', info: '#8ab4ff' };
  function el(t, a, kids) { var e = document.createElement(t); for (var k in (a || {})) { if (k === 'style') e.style.cssText = a[k]; else if (k === 'text') e.textContent = a[k]; else e.setAttribute(k, a[k]); } (kids || []).forEach(function (c) { e.appendChild(c); }); return e; }
  function render(list) {
    if (!ui) return; ui.list.textContent = '';
    list.forEach(function (r) { ui.list.appendChild(el('div', { style: 'border-left:3px solid ' + COL[r.status] + ';padding:6px 10px;margin:6px 0;background:rgba(255,255,255,.04);border-radius:4px' }, [el('div', { style: 'font-weight:600;font-size:13px', text: r.check + ' — ' + ({ pass: 'passed', fail: 'problem found', warn: 'check', info: 'note' })[r.status] }), el('div', { style: 'font-size:12px;opacity:.85;line-height:1.45;word-break:break-word', text: r.detail })])); });
  }
  function btn(label, fn, primary) { var b = el('button', { type: 'button', style: 'min-height:40px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:' + (primary ? '#1f6feb' : 'rgba(255,255,255,.08)') + ';color:#fff;font:600 13px system-ui;cursor:pointer', text: label }); b.addEventListener('click', fn); return b; }
  function openPanel() {
    if (ui) { ui.root.style.display = 'flex'; return; }
    var prog = el('div', { style: 'font-size:12px;opacity:.8;min-height:18px;margin:6px 0', role: 'status', 'aria-live': 'polite' });
    var list = el('div', { style: 'overflow:auto;flex:1;min-height:80px' });
    var msg = el('div', { style: 'font-size:12px;color:#3ddc97;min-height:16px', role: 'status' });
    var box = el('div', { role: 'dialog', 'aria-label': 'Self-check', 'aria-modal': 'true', style: 'width:min(640px,94vw);max-height:88vh;display:flex;flex-direction:column;background:#0f1b33;color:#e8eefc;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:16px;font-family:system-ui,sans-serif' }, [
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, [el('h2', { style: 'margin:0;font-size:17px', text: 'Self-check' }), btn('Close', function () { cancel = true; ui.root.style.display = 'none'; })]),
      el('p', { style: 'font-size:12px;opacity:.8;line-height:1.5;margin:8px 0', text: 'Runs technical checks inside this app: duplicate records and meshes, vessel and nerve joins, selection and markers. It does not change any anatomy. Results are software checks, not validation by an anatomist.' }),
      el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px' }, [
        btn('Quick check (about 1 minute)', function () { if (!running) run('quick', function (t) { prog.textContent = t; }); }, true),
        btn('Full check (all records, slow)', function () { if (!running) run('full', function (t) { prog.textContent = t; }); }),
        btn('Stop', function () { cancel = true; })]),
      prog, list,
      el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px' }, [
        btn('Reset view and visibility', function () { msg.textContent = repairs.reset(); }),
        btn('Refresh app files', async function () { msg.textContent = await repairs.refresh(); }),
        btn('Copy report', function () { var t = JSON.stringify(report || { note: 'Run a check first' }, null, 2); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { msg.textContent = 'Report copied.'; }, function () { msg.textContent = 'Copy not allowed here; use Download.'; }); }),
        btn('Download report', function () { var a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(report || {}, null, 2)], { type: 'application/json' })), download: 'anatomyverse-selfcheck.json' }); document.body.appendChild(a); a.click(); a.remove(); })]),
      msg]);
    var root = el('div', { style: 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center' }, [box]);
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cancel = true; root.style.display = 'none'; } });
    document.body.appendChild(root); ui = { root: root, list: list };
  }
  function addLauncher() {
    if (document.getElementById('avsc-open')) return;
    var b = el('button', { id: 'avsc-open', type: 'button', 'aria-label': 'Open self-check', text: 'Self-check', style: 'position:fixed;left:10px;bottom:2px;z-index:29;min-height:20px;padding:0 8px;border-radius:10px;border:0;background:rgba(15,27,51,.6);color:rgba(190,205,225,.85);font:10px system-ui,sans-serif;text-decoration:underline;cursor:pointer' });
    b.addEventListener('click', openPanel); document.body.appendChild(b);
  }
  document.addEventListener('keydown', function (e) { if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) { e.preventDefault(); openPanel(); } });
  globalThis.__avSelfCheck = { markers: function (ids) { var o = []; cancel = false; return checkMarkers(function (t, s, m) { o.push([t, s, m]); }, ids, function () {}).then(function () { return o; }); }, run: run, repairs: repairs, open: openPanel, pairs: PAIRS };
  setInterval(function () { var onLab = /lab/.test(location.hash); var b = document.getElementById('avsc-open'); if (onLab && !b) addLauncher(); if (b) { b.style.display = onLab ? '' : 'none'; var nar = window.innerWidth < 768; b.style.bottom = nar ? '78px' : '2px'; b.style.left = nar ? '2px' : '10px'; b.style.padding = nar ? '0 4px' : '0 8px'; } }, 1500);
})();
