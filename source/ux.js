/* 3D Anatomy: study controls (breadcrumb, labelled actions, panel toggles, visibility manager, help). Uses only the app's own store. */
(function () {
  'use strict';
  var S = null, F = null, DEF = null, hist = [], applying = false, last = '', mounted = null, toastT = 0;
  var SYS = { skeletal: 'Skeletal system', muscular: 'Muscular system', nervous: 'Nervous system', cardiovascular: 'Cardiovascular system', respiratory: 'Respiratory system', digestive: 'Digestive system', urinary: 'Urinary system', reproductive: 'Reproductive system', endocrine: 'Endocrine system', lymphatic: 'Lymphatic and immune systems', integumentary: 'Integumentary system', 'special-senses': 'Special senses: eye and ear' };
  var LAYERS = { skin: 'Skin', muscles: 'Muscles', bones: 'Bones', vessels: 'Vessels', nerves: 'Nerves', organs: 'Organs' };
  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, a, kids) { var e = document.createElement(t); for (var k in (a || {})) { if (k === 'text') e.textContent = a[k]; else if (k === 'class') e.className = a[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), a[k]); else e.setAttribute(k, a[k]); } (kids || []).forEach(function (c) { if (c) e.appendChild(c); }); return e; }
  function pref(k, v) { try { var p = JSON.parse(localStorage.getItem('avux.p') || '{}'); if (v === undefined) return p[k]; p[k] = v; localStorage.setItem('avux.p', JSON.stringify(p)); } catch (e) {} }
  function toast(m) { var t = $('#avux-toast'); if (!t) { t = el('div', { id: 'avux-toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); } t.textContent = m; t.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(function () { t.style.opacity = 0; }, 3500); }
  function css() {
    if ($('#avux-css')) return;
    document.head.appendChild(el('style', { id: 'avux-css', text: [
      '#avux{display:flex;flex-direction:column;gap:6px;padding:8px 12px;border-bottom:1px solid var(--av-border);background:var(--av-bg-elevated);font:500 13px/1.3 var(--font-sans,Inter,system-ui,sans-serif);color:var(--av-text)}',
      '#avux .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
      '#avux .sp{flex:1}',
      '.avx-b{min-height:34px;padding:5px 11px;border:1px solid var(--av-border-strong);border-radius:8px;background:var(--av-surface);color:var(--av-text);font:inherit;cursor:pointer;white-space:nowrap}',
      '.avx-b:hover{border-color:var(--av-teal)}.avx-b:focus-visible{outline:2px solid var(--av-focus);outline-offset:2px}',
      '.avx-b[aria-pressed=true]{background:var(--av-teal);color:#04202a;border-color:var(--av-teal)}',
      '.avx-b[aria-disabled=true]{opacity:.45;cursor:not-allowed}',
      '#avux nav ol{display:flex;flex-wrap:wrap;gap:2px;list-style:none;margin:0;padding:0;align-items:center}',
      '#avux nav li+li::before{content:"\\203A";margin:0 6px;color:var(--av-text-faint)}',
      '#avux nav button{background:none;border:0;color:var(--av-text-muted);font:inherit;cursor:pointer;padding:2px 3px;border-radius:4px}',
      '#avux nav button:hover{color:var(--av-teal);text-decoration:underline}',
      '#avux nav li[aria-current=page]{color:var(--av-text);font-weight:700}',
      '@media(min-width:768px){main aside.av-panel.md\\:block{width:17rem}}',
      '@media(min-width:1024px){main aside.av-panel.lg\\:block{width:20rem}}',
      '#avux-dlg{position:fixed;inset:0;z-index:9999;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px}',
      '#avux-dlg .box{width:min(720px,100%);max-height:92vh;display:flex;flex-direction:column;background:var(--av-bg-elevated);color:var(--av-text);border:1px solid var(--av-border-strong);border-radius:14px;box-shadow:var(--av-shadow);font:14px/1.45 var(--font-sans,Inter,system-ui,sans-serif)}',
      '#avux-dlg header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--av-border)}#avux-dlg header h2{flex:1;margin:0;font-size:17px}',
      '#avux-dlg .body{padding:12px 14px;overflow:auto}',
      '#avux-dlg input[type=search],#avux-dlg select{min-height:36px;border:1px solid var(--av-border-strong);border-radius:8px;background:var(--av-surface);color:var(--av-text);padding:4px 10px;font:inherit}',
      '#avux-dlg .row{display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid var(--av-border)}',
      '#avux-dlg .row .n{flex:1;text-align:left;background:none;border:0;color:var(--av-text);font:inherit;cursor:pointer;padding:4px 2px}',
      '#avux-dlg .row .n:hover{color:var(--av-teal)}#avux-dlg .row.sel{background:color-mix(in srgb,var(--av-teal) 14%,transparent)}',
      '#avux-dlg .bd{font-size:11px;padding:1px 7px;border-radius:99px;border:1px solid var(--av-border-strong);color:var(--av-text-muted);white-space:nowrap}',
      '#avux-dlg .bd.ok{border-color:var(--av-ok);color:var(--av-ok)}#avux-dlg .bd.no{border-color:var(--av-warn);color:var(--av-warn)}',
      '#avux-dlg input[type=checkbox]{width:20px;height:20px;accent-color:var(--av-teal)}',
      '#avux-dlg .lay{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0 12px}#avux-dlg .lay label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--av-text-muted)}',
      '#avux-dlg h3{margin:12px 0 4px;font-size:14px}#avux-dlg ul{margin:4px 0 4px 18px;padding:0}',
      '#avux-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:10000;background:var(--av-surface-2);color:var(--av-text);border:1px solid var(--av-teal);padding:8px 14px;border-radius:10px;font:13px var(--font-sans,system-ui);opacity:0;transition:opacity .2s;pointer-events:none;max-width:90vw}',
      '@media(max-width:767px){#avux{padding:6px 8px;gap:4px}#avux .r{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#avux .r::-webkit-scrollbar{display:none}.avx-b{flex:none;min-height:36px}#avux .hm{display:none}#avux nav{flex:1;min-width:0;white-space:nowrap;overflow-x:auto}#avux nav ol{flex-wrap:nowrap}}'
    ].join('\n') }));
  }
  function st() { return S.getState(); }
  function snap() { var s = st(); return { hidden: s.hidden, isolated: s.isolated, layerVisible: s.layerVisible, layerOpacity: s.layerOpacity, systemFocus: s.systemFocus, xray: s.xray }; }
  function track() {
    var j = JSON.stringify(snap());
    if (j !== last) { if (last && !applying) { hist.push(last); if (hist.length > 40) hist.shift(); } last = j; refresh(); }
  }
  function undo() { if (!hist.length) { toast('Nothing to undo'); return; } applying = true; var p = JSON.parse(hist.pop()); S.setState(p); last = JSON.stringify(snap()); applying = false; refresh(); }
  function sel() { var id = st().selectedId; return id && F[id] ? F[id] : null; }
  function inScene() { var o = {}; try { globalThis.__scn.traverse(function (x) { var u = x.userData; if (u && u.structureId) o[u.structureId] = 1; }); } catch (e) {} return o; }
  function visible(id) { var s = st(), r = F[id]; if (!r) return false; if (s.hidden.indexOf(id) >= 0) return false; if (s.isolated && s.isolated.indexOf(id) < 0) return false; if (r.layer && s.layerVisible[r.layer] === false) return false; return true; }
  function chain(id) { var out = [], g = 0, r = F[id]; while (r && r.parentId && F[r.parentId] && g++ < 8) { out.unshift(F[r.parentId]); r = F[r.parentId]; } return out; }
  /* actions */
  var A = {
    reset: function () { S.getState().resetCamera(); },
    showAll: function () { var s = st(); s.restoreVisibility(); S.setState({ layerVisible: Object.assign({}, DEF.layerVisible), layerOpacity: Object.assign({}, DEF.layerOpacity) }); toast('All structures shown'); },
    hideSel: function () { var r = sel(); if (!r) return need(); st().hideStructure(r.id); st().select(null); toast(r.name + ' hidden. Use Undo or Show all to bring it back.'); },
    isoSel: function () { var r = sel(); if (!r) return need(); st().isolate([r.id]); st().frame([r.id]); toast('Showing only ' + r.name); },
    fade: function () { st().setXray(!st().xray); },
    reveal: function () { var r = sel(); if (!r) return need(); st().showStructure(r.id); chain(r.id).forEach(function (p) { st().showStructure(p.id); }); var lo = Object.assign({}, st().layerOpacity); if (r.layer !== 'skin') lo.skin = Math.min(lo.skin == null ? 1 : lo.skin, .15); if (r.layer === 'bones' || r.layer === 'organs' || r.layer === 'vessels' || r.layer === 'nerves') lo.muscles = Math.min(lo.muscles == null ? 1 : lo.muscles, .3); S.setState({ layerOpacity: lo }); st().frame([r.id]); toast('Surrounding layers faded so ' + r.name + ' is visible'); }
  };
  function need() { toast('Select a structure first: click it in the 3D view or pick it from the list.'); }
  function btn(label, fn, tip, extra) { var b = el('button', { type: 'button', class: 'avx-b', title: tip || label, onclick: function () { if (b.getAttribute('aria-disabled') === 'true' && !extra) { need(); return; } fn(); } , text: label }); return b; }
  var B = {};
  function mountBar(row) {
    var main = row.parentElement; css();
    var bar = el('div', { id: 'avux', role: 'region', 'aria-label': 'Study controls' });
    var crumb = el('nav', { 'aria-label': 'Where you are in the body' }, [el('ol', { id: 'avx-crumb' })]);
    var tg = el('div', { class: 'r' });
    B.menu = btn('Menu', function () { togglePanel('nav'); }, 'Show or hide the app menu'); B.menu.classList.add('hm');
    B.left = btn('Find anatomy', function () { togglePanel('left'); }, 'Show or hide the structure list'); B.left.classList.add('hm');
    B.right = btn('Details', function () { togglePanel('right'); }, 'Show or hide the details panel'); B.right.classList.add('hm');
    B.focus = btn('Full-width body', function () { var all = !(pref('left') && pref('right')); setPanel('left', all); setPanel('right', all); setPanel('nav', all); }, 'Hide all side panels for a bigger 3D view; press again to bring them back'); B.focus.classList.add('hm');
    B.help = btn('How to use', helpDlg, 'How to use this model');
    tg.appendChild(el('span', { class: 'sp' }));
    [B.menu, B.left, B.right, B.focus, B.help].forEach(function (b) { tg.appendChild(b); });
    var top = el('div', { class: 'r' }, [crumb, el('span', { class: 'sp' })]); top.appendChild(tg); top.style.justifyContent = 'space-between';
    var ac = el('div', { class: 'r', role: 'toolbar', 'aria-label': 'View and visibility actions' });
    B.reset = btn('Reset view', A.reset, 'Return the camera to the front view');
    B.showAll = btn('Show all', A.showAll, 'Show every structure and layer again');
    B.hide = btn('Hide selected', A.hideSel, 'Hide the selected structure');
    B.iso = btn('Isolate selected', A.isoSel, 'Show only the selected structure');
    B.reveal = btn('Reveal selected', A.reveal, 'Fade covering layers so the selected structure can be seen');
    B.fade = btn('Fade surroundings', A.fade, 'Make other structures see-through around the selected one', true); B.fade.setAttribute('aria-pressed', 'false');
    B.undo = btn('Undo', undo, 'Undo the last visibility change', true);
    B.mgr = btn('Visibility manager', mgrDlg, 'Search every structure and choose what is visible', true);
    [B.reset, B.showAll, B.hide, B.iso, B.reveal, B.fade, B.undo, B.mgr].forEach(function (b) { ac.appendChild(b); });
    bar.appendChild(top); bar.appendChild(ac);
    main.insertBefore(bar, row);
    main.style.display = 'flex'; main.style.flexDirection = 'column';
    row.style.flex = '1 1 0'; row.style.height = 'auto'; row.style.minHeight = '0';
    applyPanels(); refresh();
  }
  function panelEl(w) {
    if (w === 'nav') return Array.prototype.filter.call(document.querySelectorAll('aside'), function (a) { return !a.closest('main'); })[0];
    var as = document.querySelectorAll('main aside.av-panel'); var out = Array.prototype.slice.call(as).filter(function (a) { return a.parentElement && a.parentElement.contains($('canvas')); });
    return w === 'left' ? out[0] : out[out.length - 1];
  }
  function setPanel(w, hide) { pref(w, !!hide); var e = panelEl(w); if (e) e.style.display = hide ? 'none' : ''; syncToggles(); }
  function togglePanel(w) { setPanel(w, !pref(w)); }
  function applyPanels() { ['nav', 'left', 'right'].forEach(function (w) { var e = panelEl(w); if (e) e.style.display = pref(w) ? 'none' : ''; }); syncToggles(); }
  function syncToggles() { if (B.menu) { B.menu.setAttribute('aria-pressed', String(!pref('nav'))); B.left.setAttribute('aria-pressed', String(!pref('left'))); B.right.setAttribute('aria-pressed', String(!pref('right'))); B.focus.setAttribute('aria-pressed', String(!!(pref('left') && pref('right')))); } }
  function crumb() {
    var ol = $('#avx-crumb'); if (!ol) return; ol.innerHTML = '';
    var s = st(), r = sel();
    function li(label, fn, cur) { var l = el('li'); if (cur) { l.setAttribute('aria-current', 'page'); l.textContent = label; } else l.appendChild(el('button', { type: 'button', text: label, onclick: fn })); ol.appendChild(l); }
    li('Human body', function () { st().select(null); st().restoreVisibility(); st().resetCamera(); }, !r && !s.systemFocus);
    if (r) {
      li(SYS[r.system] || r.system, function () { st().select(null); try { st().setSystemFocus(r.system); } catch (e) {} }, false);
      chain(r.id).forEach(function (p) { li(p.name, function () { st().select(p.id); st().frame([p.id]); }, false); });
      li(r.name, null, true);
    } else if (s.systemFocus) li(SYS[s.systemFocus] || s.systemFocus, null, true);
  }
  function refresh() {
    if (!B.hide) return; var r = sel();
    [B.hide, B.iso, B.reveal].forEach(function (b) { b.setAttribute('aria-disabled', r ? 'false' : 'true'); });
    B.undo.setAttribute('aria-disabled', hist.length ? 'false' : 'true');
    B.fade.setAttribute('aria-pressed', String(!!st().xray));
    crumb();
  }
  /* dialogs */
  function closeDlg() { var d = $('#avux-dlg'); if (d) d.remove(); document.removeEventListener('keydown', escK); if (mgrT) { clearInterval(mgrT); mgrT = 0; } }
  function escK(e) { if (e.key === 'Escape') closeDlg(); }
  function dlg(title, body, wide) {
    closeDlg();
    var d = el('div', { id: 'avux-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, onclick: function (e) { if (e.target === d) closeDlg(); } }, [el('div', { class: 'box' }, [el('header', {}, [el('h2', { text: title }), el('button', { type: 'button', class: 'avx-b', text: 'Close', onclick: closeDlg })]), body])]);
    document.body.appendChild(d); document.addEventListener('keydown', escK); var f = d.querySelector('input,button'); if (f) f.focus();
  }
  function helpDlg() {
    var b = el('div', { class: 'body' });
    b.innerHTML = '<h3>Find a structure</h3><ul><li>Type in the search box (name, Latin name or common word) or open a system in the list.</li><li>Tap a part of the body, or pick it from the list when it is too small to tap.</li></ul>' +
      '<h3>Move around</h3><ul><li>Drag to rotate, scroll or pinch to zoom, double-tap a part to pull it out for a closer look.</li><li><b>Reset view</b> returns to the front view.</li></ul>' +
      '<h3>See what is hidden</h3><ul><li><b>Hide selected</b>, <b>Isolate selected</b> and <b>Reveal selected</b> change what is visible. <b>Fade surroundings</b> makes the rest see-through.</li><li><b>Show all</b> and <b>Undo</b> bring things back.</li><li><b>Visibility manager</b> lists every structure with an on/off switch and layer see-through sliders.</li></ul>' +
      '<h3>Male and female</h3><ul><li>All shared structures are in both models. Only sex-specific organs change. Choosing a sex-specific structure switches the model for you.</li></ul>' +
      '<h3>Panels</h3><ul><li>Use <b>Find anatomy</b>, <b>Details</b> and <b>Full-width body</b> to give the 3D view more room. Your selection is kept.</li></ul>';
    dlg('How to use this model', b);
  }
  var mgrT = 0;
  function mgrDlg() {
    var inS = inScene(), q = el('input', { type: 'search', placeholder: 'Search structures', 'aria-label': 'Search structures' });
    var sy = el('select', { 'aria-label': 'Filter by system' }, [el('option', { value: '', text: 'All systems' })].concat(Object.keys(SYS).map(function (k) { return el('option', { value: k, text: SYS[k] }); })));
    var list = el('div', { id: 'avx-list' }), info = el('div', { style: 'font-size:12px;color:var(--av-text-muted);margin:6px 0' });
    var cmd = el('div', { class: 'r', style: 'display:flex;flex-wrap:wrap;gap:6px;margin:6px 0' });
    function c(l, f, t) { cmd.appendChild(el('button', { type: 'button', class: 'avx-b', text: l, title: t || l, onclick: function () { f(); draw(); } })); }
    c('Show all', A.showAll, 'Show every structure'); c('Hide all', function () { st().isolate([]); S.setState({ hidden: Object.keys(F) }); toast('All structures hidden. Switch any on below, or press Undo.'); }, 'Hide every structure');
    c('Restore default', function () { st().restoreVisibility(); S.setState({ layerVisible: Object.assign({}, DEF.layerVisible), layerOpacity: Object.assign({}, DEF.layerOpacity), xray: false }); }, 'Back to the starting visibility');
    c('Show selected only', function () { var r = sel(); if (r) st().isolate([r.id]); else need(); }, 'Show only the selected structure');
    c('Reveal selected and parent', A.reveal, 'Show the selected structure with its parent and fade covering layers');
    c('Undo', undo, 'Undo last change');
    var lay = el('div', { class: 'lay' });
    Object.keys(LAYERS).forEach(function (k) {
      var cb = el('input', { type: 'checkbox', 'aria-label': 'Show ' + LAYERS[k], onchange: function () { st().setLayerVisible(k, cb.checked); } });
      var rg = el('input', { type: 'range', min: 0, max: 100, 'aria-label': LAYERS[k] + ' see-through', oninput: function () { st().setLayerOpacity(k, rg.value / 100); } });
      lay.appendChild(el('label', {}, [el('span', { style: 'display:flex;gap:6px;align-items:center' }, [cb, el('b', { text: LAYERS[k] })]), rg]));
      lay._m = lay._m || {}; lay._m[k] = [cb, rg];
    });
    function draw() {
      var s = st(), ft = q.value.trim().toLowerCase(), sys = sy.value, ids = Object.keys(F).filter(function (id) { var r = F[id]; if (sys && r.system !== sys) return false; if (!ft) return true; return (r.name + ' ' + (r.latinName || '') + ' ' + (r.synonyms || []).join(' ')).toLowerCase().indexOf(ft) >= 0; });
      ids.sort(function (a, b) { return F[a].name.localeCompare(F[b].name); });
      var shown = ids.slice(0, 120); list.innerHTML = '';
      info.textContent = ids.length + ' structures' + (ids.length > shown.length ? ' (first ' + shown.length + ' shown: type to narrow)' : '') + '. "In 3D" means a model of it is loaded in the viewer.';
      shown.forEach(function (id) {
        var r = F[id], v = visible(id), cb = el('input', { type: 'checkbox', 'aria-label': 'Visible: ' + r.name, onchange: function () { if (cb.checked) st().showStructure(id); else st().hideStructure(id); draw(); } });
        cb.checked = v;
        var other = r.sex && r.sex !== s.sex;
        var row = el('div', { class: 'row' + (s.selectedId === id ? ' sel' : '') }, [cb, el('button', { type: 'button', class: 'n', text: r.name, title: 'Select ' + r.name, onclick: function () { st().select(id); st().frame([id]); toast(r.sex && r.sex !== s.sex ? 'Switched to the ' + r.sex + ' model: ' + r.name + ' is ' + r.sex + '-specific.' : r.name + ' selected'); closeDlg(); } }),
          r.sex ? el('span', { class: 'bd', text: r.sex + ' only' + (other ? ' (switches model)' : '') }) : null,
          el('span', { class: 'bd ' + (inS[id] ? 'ok' : 'no'), text: inS[id] ? 'In 3D' : 'No 3D model' })]);
        list.appendChild(row);
      });
      Object.keys(lay._m).forEach(function (k) { lay._m[k][0].checked = s.layerVisible[k] !== false; lay._m[k][1].value = Math.round((s.layerOpacity[k] == null ? 1 : s.layerOpacity[k]) * 100); });
    }
    q.addEventListener('input', draw); sy.addEventListener('change', draw);
    var body = el('div', { class: 'body' }, [el('div', { class: 'r', style: 'display:flex;gap:8px;flex-wrap:wrap' }, [q, sy]), cmd, el('b', { text: 'Layers (tick to show, slide to make see-through)' }), lay, info, list]);
    dlg('Visibility manager', body, true); draw();
    mgrT = setInterval(function () { if (!$('#avux-dlg')) { clearInterval(mgrT); mgrT = 0; return; } if (document.activeElement !== q) { draw(); } }, 1500);
  }
  /* lifecycle */
  function tick() {
    if (!globalThis.__avStore) return; S = globalThis.__avStore; F = globalThis.__avF;
    if (!DEF) DEF = { layerVisible: Object.assign({}, st().layerVisible), layerOpacity: Object.assign({}, st().layerOpacity) };
    var onLab = /#\/app\/lab/.test(location.hash), c = $('canvas'), sec = c && c.closest('section'), row = sec && sec.parentElement;
    var bar = $('#avux');
    if (!onLab || !row) { if (bar) { bar.remove(); B = {}; mounted = null; } return; }
    if (!bar || mounted !== row) { if (bar) bar.remove(); B = {}; mounted = row; css(); mountBar(row); last = JSON.stringify(snap()); }
    track(); var k = st().selectedId + '|' + st().systemFocus + '|' + st().xray; if (k !== lastSel) { lastSel = k; refresh(); }
  }
  var lastSel = '';
  setInterval(tick, 400);
  var iv = setInterval(function () { if (globalThis.__avStore) { clearInterval(iv); globalThis.__avStore.subscribe(function () { try { tick(); } catch (e) {} }); } }, 300);
})();
