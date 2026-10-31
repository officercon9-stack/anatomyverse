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
      '.avx-b[aria-pressed=true]{background:var(--av-grad,var(--av-teal));color:#fff;border-color:transparent}',
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
      '.avx-i{display:inline-flex;align-items:center;gap:7px}.avx-i:hover{border-color:var(--ic)}.avx-i[aria-pressed=true]{background:color-mix(in srgb,var(--ic) 22%,var(--av-surface));color:var(--av-text);border-color:var(--ic)}',
      '#avux{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:7px 12px}#avux > .r{flex-wrap:nowrap}#avux nav{min-width:0;flex:1 1 180px;overflow:hidden;white-space:nowrap}#avux nav ol{flex-wrap:nowrap}',
      '#avux .avx-b{min-height:32px;padding:4px 10px}#avux .sel-only[hidden]{display:none}#avux nav{flex:1 1 160px!important;min-width:160px}#avux nav li{flex:none}',
      '@media(max-width:1500px){#avux .avx-ico .lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}#avux .avx-ico{padding:4px 8px}}',
      '@media(max-width:1180px){#avux .avx-ico2 .lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}#avux .avx-ico2{padding:4px 8px}}',
      '.avx-lay{position:relative}.avx-pop{position:absolute;right:0;top:calc(100% + 6px);z-index:60;min-width:230px;padding:6px;border:1px solid var(--av-border-strong);border-radius:12px;background:var(--av-bg-elevated);box-shadow:0 14px 40px -12px #000c;display:flex;flex-direction:column;gap:2px}',
      '.avx-pop[hidden]{display:none}.avx-pop button{display:flex;align-items:center;gap:9px;text-align:left;padding:8px 10px;border:0;border-radius:8px;background:none;color:var(--av-text);font:500 13px var(--font-sans,system-ui);cursor:pointer}.avx-pop button:hover{background:var(--av-surface)}',
      '.avx-pop button::before{content:"";width:16px;height:16px;border-radius:4px;border:1.5px solid var(--av-border-strong);flex:none}.avx-pop button[aria-checked=true]::before{background:var(--av-teal);border-color:var(--av-teal);box-shadow:inset 0 0 0 3px var(--av-bg-elevated)}',
      '.av-toolbar [aria-label=Body],.av-toolbar [aria-label=Body]+.av-toolbar__sep{display:none!important}',
      '@media(min-width:768px) and (min-height:501px){.av-toolbar-dock{padding-right:7.25rem!important}.avx-sex{position:absolute!important;top:66px!important;left:12px!important;right:auto!important;transform:none!important;margin:0!important;padding:3px!important;gap:2px!important;z-index:15}.avx-sex button{min-height:34px!important;padding:4px 12px!important;font-size:13.5px!important}}',
      'html.avx-rail aside.av-panel.lg\\:flex{width:84px!important;padding:10px 6px!important;align-items:stretch}',
      'html.avx-rail aside.av-panel.lg\\:flex > div:first-child{flex-direction:column;gap:6px;padding:0!important}html.avx-rail aside.av-panel.lg\\:flex > div:first-child a span span,html.avx-rail aside.av-panel.lg\\:flex > div:first-child select{display:none}',
      'html.avx-rail aside.av-panel.lg\\:flex .av-nav-link{flex-direction:column;justify-content:center;gap:4px;padding:8px 2px!important;font-size:10.5px;line-height:1.15;text-align:center;height:auto!important;min-height:54px}',
      'html.avx-rail aside.av-panel.lg\\:flex .av-nav-link span{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;flex:none!important}',
      'html.avx-rail aside.av-panel.lg\\:flex > div:last-child p{display:none}',
      '.av-panel.avx-peek{height:132px!important;overflow:hidden}.av-panel.avx-peek > div:last-child{overflow:hidden!important;pointer-events:none}',
      '#avux-fail{position:absolute;left:10px;right:10px;top:118px;z-index:26;display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:14px;background:rgba(60,20,40,.92);border:1px solid rgba(255,107,139,.6);color:#ffe4ea;font:500 12.5px/1.35 var(--font-sans,system-ui)}#avux-fail span{flex:1}#avux-fail .avx-b{min-height:34px}@media(min-width:768px){#avux-fail{top:auto;bottom:60px;left:50%;right:auto;transform:translateX(-50%);max-width:560px}}',
      '#avux-nav{display:none}',
      '@media (max-width:767px) and (min-height:501px){html.avx-nav #avux-nav{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:35;height:calc(72px + env(safe-area-inset-bottom));padding:8px 4px env(safe-area-inset-bottom);background:linear-gradient(180deg,#1b3672,#152c60);border-top:1px solid rgba(120,160,240,.28);box-shadow:0 -10px 24px -14px #000c}',
      'html.avx-nav #avux-nav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;color:#c9d6f3;font:600 12px/1.1 var(--font-sans,system-ui);cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}',
      'html.avx-nav #avux-nav .pl{width:64px;height:32px;border-radius:16px;display:flex;align-items:center;justify-content:center;transition:background .2s}',
      'html.avx-nav #avux-nav button:active .pl{background:rgba(255,255,255,.10)}',
      'html.avx-nav #avux-nav button[aria-current=true] .pl{background:linear-gradient(135deg,rgba(23,107,255,.55),rgba(0,229,255,.45))}html.avx-nav #avux-nav button[aria-current=true]{color:#fff}',
      'html.avx-nav #avux-nav button:focus-visible{outline:2px solid #00e5ff;outline-offset:-4px;border-radius:12px}',
      'html.avx-nav main{padding-bottom:calc(72px + env(safe-area-inset-bottom))}',
      'html.avx-nav .av-toolbar-dock,html.avx-nav .avx-sex,html.avx-nav #avux-fab,html.avx-nav section button[aria-label="Open structures and layers"]{display:none!important}',
      'html.avx-nav section .absolute.top-3.right-3 > button{visibility:hidden;pointer-events:none}',
      'html.avx-nav section .absolute.inset-x-3.top-\\[4rem\\]{top:10px!important}',
      'html.avx-nav .av-panel.fixed.inset-x-0.bottom-0{bottom:calc(72px + env(safe-area-inset-bottom))!important;border-radius:24px 24px 0 0!important}',
      'html.avx-nav #avux-toast{bottom:calc(86px + env(safe-area-inset-bottom))}',
      '#avux-sheet .vh{margin:14px 2px 8px;font:700 12px var(--font-sans,system-ui);letter-spacing:.02em;color:#9fb3dd}#avux-sheet .vg{display:flex;flex-wrap:wrap;gap:8px}',
      '#avux-sheet .vc{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:6px 14px;border-radius:20px;border:1px solid rgba(120,160,240,.4);background:rgba(32,60,118,.85);color:#eef3ff;font:600 13px var(--font-sans,system-ui);cursor:pointer}',
      '#avux-sheet .vc[aria-pressed=true]{background:linear-gradient(135deg,#176bff,#00c8ff);border-color:transparent;color:#fff}',
      '#avux-sheet .vc:active{transform:scale(.97)}}',
      '#avux-fab{display:none}','html:not(.avx-onlab) .avx-qcard{display:none!important}',
      '@media(max-width:767px),(max-height:500px){#avux{padding:4px 10px;border-bottom:0;background:transparent;position:relative;z-index:25}#avux [role=toolbar],#avux .tg{display:none}#avux nav{font-size:12px}#avux .r:first-child{min-height:28px}',
      '#avux-fab{display:flex;position:fixed;right:14px;z-index:40;width:58px;height:58px;border-radius:50%;border:0;align-items:center;justify-content:center;flex-direction:column;gap:1px;color:#fff;font:700 10px/1 var(--font-sans,system-ui);background:conic-gradient(from 210deg,#00e5ff,#176bff,#9b4dff,#ff4fc8,#00e5ff);box-shadow:0 8px 22px -6px #000c,0 0 0 3px var(--av-bg);transition:bottom .2s}',
      '#avux-fab span{background:#0f2149e6;border-radius:50%;width:48px;height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}',
      '.av-toolbar-dock{justify-content:flex-start!important}',
      '.avx-sex{position:absolute!important;left:auto!important;right:10px!important;top:calc(4rem + 54px)!important;transform:none!important;margin:0!important;padding:3px!important;gap:2px!important;z-index:15}',
      '.avx-sex button{min-height:34px!important;padding:4px 11px!important;font-size:13px!important}',
      '.av-toolbar-dock .av-toolbar{max-width:none!important;width:100%!important;-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent)}.av-toolbar [aria-label=Body],.av-toolbar [aria-label=Body]+.av-toolbar__sep{display:none!important}',
      '.avx-tour{display:none!important}',
      '.avx-badge{font-size:10.5px!important;max-width:calc(100% - 150px)!important}}',
      '@media(max-height:500px){.avx-qcard{display:none!important}.av-panel.fixed.inset-x-0.bottom-0.z-30{left:auto!important;width:min(46vw,400px)!important;top:56px!important;height:auto!important;max-height:none!important;border-radius:16px 0 0 0!important;border-left:1px solid var(--av-border)}.avx-pan{transform:scale(.82);transform-origin:bottom left}#avux-sheet .tl{grid-template-columns:repeat(5,1fr)}#avux-sheet .t{min-height:70px}#avux-sheet .sh{max-height:92vh}}',
      'html.avx-sheet-open .avx-cred{display:none!important}',
      '@media(max-height:500px){html.avx-sheet-open main section.relative.min-w-0{margin-right:min(46vw,400px)}html.avx-sheet-open .avx-badge{display:none!important}html.avx-sheet-open main aside.av-panel.md\\:block{display:none!important}main aside.av-panel.md\\:block{width:15rem!important}}',
      '#avux-sheet{position:fixed;inset:0;z-index:9998;background:#0008;display:flex;align-items:flex-end}',
      '#avux-sheet .sh{width:100%;max-height:85vh;overflow:auto;background:var(--av-bg-elevated);border-top:1px solid var(--av-border-strong);border-radius:20px 20px 0 0;padding:10px 14px calc(16px + env(safe-area-inset-bottom));animation:avxUp .22s ease-out}',
      '@keyframes avxUp{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}@media(prefers-reduced-motion:reduce){#avux-sheet .sh{animation:none}}',
      '#avux-sheet .gr{width:40px;height:5px;border-radius:9px;background:var(--av-border-strong);margin:0 auto 10px}',
      '#avux-sheet h2{margin:0 0 2px;font:700 16px var(--font-sans,system-ui);color:var(--av-text)}#avux-sheet p{margin:0 0 12px;font-size:12.5px;color:var(--av-text-muted)}',
      '#avux-sheet .tl{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
      '#avux-sheet .t{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-height:84px;padding:8px 4px;border-radius:16px;border:1px solid color-mix(in srgb,var(--ic) 45%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--ic) 26%,var(--av-surface)),var(--av-surface));color:var(--av-text);font:600 12.5px/1.2 var(--font-sans,system-ui);text-align:center;cursor:pointer}',
      '#avux-sheet .t:active{transform:scale(.97)}#avux-sheet .t[aria-disabled=true]{opacity:.42}#avux-sheet .t[aria-pressed=true]{box-shadow:0 0 0 2px var(--ic) inset}',
      '#avux-sheet .t .ib{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ic) 22%,transparent)}',
      '#avux-sheet .cur{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:9px 12px;border-radius:12px;background:var(--av-surface);border:1px solid var(--av-border);font-size:13px;color:var(--av-text)}',
      '@media(max-width:767px),(max-height:500px){#avux{gap:4px}#avux .r{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#avux .r::-webkit-scrollbar{display:none}.avx-b{flex:none;min-height:36px}#avux .hm{display:none}#avux nav{flex:1;min-width:0;white-space:nowrap;overflow-x:auto}#avux nav ol{flex-wrap:nowrap}}'
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

  var IC = {
    reset: ['#00e5ff', 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5'],
    showAll: ['#34d399', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    hide: ['#ff4fc8', 'M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6'],
    iso: ['#9b4dff', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01'],
    reveal: ['#fbbf24', 'M12 2l10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5'],
    fade: ['#5fa8ff', 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18'],
    undo: ['#cbd5e1', 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3'],
    mgr: ['#ff4fc8', 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
    help: ['#5fa8ff', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01'],
    tour: ['#00e5ff', 'M5 3l14 9-14 9V3z'],
    panel: ['#94a3b8', 'M3 3h18v18H3zM9 3v18'],
    view: ['#00e5ff', 'M12 2v4M12 18v4M2 12h4M18 12h4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
    layers: ['#9b4dff', 'M12 2l10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5'],
    tools: ['#ff4fc8', 'M4 6h16M4 12h10M4 18h7M17 15l3 3-3 3'],
    info: ['#fbbf24', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01'],
    anim: ['#ff7a8a', 'M5 3l14 9-14 9V3z'],
    female: ['#ff4fc8', 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 14v7M9 18h6'],
    male: ['#5fa8ff', 'M10 20a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM14.5 9.5L20 4M15 4h5v5']
  };
  function svgI(k, size) { var c = IC[k]; if (!c) return null; var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size || 16); s.setAttribute('height', size || 16); s.setAttribute('aria-hidden', 'true'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', c[0]); s.setAttribute('stroke-width', '2.2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', c[1]); s.appendChild(p); return s; }
  function deco(b, k) { if (b.firstChild && b.firstChild.nodeType === 3) { var sp = el('span', { class: 'lbl', text: b.textContent }); b.textContent = ''; b.appendChild(sp); if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', sp.textContent); } var i = svgI(k); if (i) { b.insertBefore(i, b.firstChild); b.style.setProperty('--ic', IC[k][0]); b.classList.add('avx-i'); } return b; }
  var B = {};
  function mountBar(row) {
    var main = row.parentElement; css();
    var bar = el('div', { id: 'avux', role: 'region', 'aria-label': 'Study controls' });
    var crumb = el('nav', { 'aria-label': 'Where you are in the body' }, [el('ol', { id: 'avx-crumb' })]);
    var tg = el('div', { class: 'r tg' });
    B.menu = el('button'); B.left = el('button'); B.right = el('button'); B.focus = el('button');
    var pop = el('div', { class: 'avx-pop', role: 'menu', hidden: '' });
    function item(key, label, fn) { var b = el('button', { type: 'button', role: 'menuitemcheckbox', text: label, onclick: function () { fn(); syncToggles(); } }); b.dataset.k = key; pop.appendChild(b); return b; }
    B.menu = item('nav', 'App menu', function () { if (pref('nav')) { setPanel('nav', false); } else { var r2 = pref('rail') !== false; if (r2) { pref('rail', false); } else { setPanel('nav', true); pref('rail', true); } } applyRail(); });
    B.left = item('left', 'Find anatomy panel', function () { togglePanel('left'); });
    B.right = item('right', 'Details panel', function () { togglePanel('right'); });
    B.focus = item('focus', 'Full-width body (hide all panels)', function () { var all = !(pref('left') && pref('right')); setPanel('left', all); setPanel('right', all); setPanel('nav', all); });
    var lb = btn('Layout', function () { var o = pop.hasAttribute('hidden'); if (o) pop.removeAttribute('hidden'); else pop.setAttribute('hidden', ''); lb.setAttribute('aria-expanded', String(o)); }, 'Choose which panels are shown', true); deco(lb, 'panel'); lb.setAttribute('aria-haspopup', 'menu'); lb.setAttribute('aria-expanded', 'false');
    var lay = el('div', { class: 'avx-lay hm' }, [lb, pop]);
    B.help = btn('Help', helpDlg, 'How to use this model', true);
    tg.appendChild(lay); tg.appendChild(B.help);
    var ac = el('div', { class: 'r', role: 'toolbar', 'aria-label': 'View and visibility actions' });
    B.reset = btn('Reset view', A.reset, 'Return the camera to the front view');
    B.showAll = btn('Show all', A.showAll, 'Show every structure and layer again');
    B.hide = btn('Hide', A.hideSel, 'Hide the selected structure');
    B.iso = btn('Isolate', A.isoSel, 'Show only the selected structure');
    B.reveal = btn('Reveal', A.reveal, 'Fade covering layers so the selected structure can be seen');
    [B.hide, B.iso, B.reveal].forEach(function (b) { b.classList.add('sel-only'); });
    B.fade = btn('Fade others', A.fade, 'Make other structures see-through around the selected one', true); B.fade.setAttribute('aria-pressed', 'false');
    B.undo = btn('Undo', undo, 'Undo the last visibility change', true);
    B.mgr = btn('Visibility', mgrDlg, 'Visibility manager: search every structure and choose what is visible', true);
    deco(B.reset,'reset');deco(B.showAll,'showAll');deco(B.hide,'hide');deco(B.iso,'iso');deco(B.reveal,'reveal');deco(B.fade,'fade');deco(B.undo,'undo');deco(B.mgr,'mgr');deco(B.help,'help');
    [B.hide, B.iso, B.reveal, B.reset, B.showAll, B.fade, B.undo, B.mgr].forEach(function (b) { ac.appendChild(b); });
    lb.classList.add('avx-ico'); B.help.classList.add('avx-ico'); B.undo.classList.add('avx-ico2'); B.reset.classList.add('avx-ico2');
    bar.appendChild(crumb); bar.appendChild(ac); bar.appendChild(tg);
    main.insertBefore(bar, row);
    main.style.display = 'flex'; main.style.flexDirection = 'column';
    row.style.flex = '1 1 0'; row.style.height = 'auto'; row.style.minHeight = '0'; row.classList.add('avx-labrow');
    applyPanels(); refresh();
  }
  function panelEl(w) {
    if (w === 'nav') return Array.prototype.filter.call(document.querySelectorAll('aside'), function (a) { return !a.closest('main'); })[0];
    var as = document.querySelectorAll('main aside.av-panel'); var out = Array.prototype.slice.call(as).filter(function (a) { return a.parentElement && a.parentElement.contains($('canvas')); });
    if (w === 'right' && out.length < 2) return null; return w === 'left' ? out[0] : out[out.length - 1];
  }
  function setPanel(w, hide) { pref(w, !!hide); var e = panelEl(w); if (e) e.style.display = hide ? 'none' : ''; syncToggles(); }
  function togglePanel(w) { setPanel(w, !pref(w)); }
  function applyPanels() { ['nav', 'left', 'right'].forEach(function (w) { var e = panelEl(w); if (e) e.style.display = pref(w) ? 'none' : ''; }); syncToggles(); }
  function usable(w) { var e = panelEl(w); if (!e) return false; if (pref(w)) { e.style.display = ''; var ok = getComputedStyle(e).display !== 'none'; e.style.display = 'none'; return ok; } return getComputedStyle(e).display !== 'none'; }
  function syncToggles() { if (!B.menu || !B.menu.dataset) return; [['nav', B.menu], ['left', B.left], ['right', B.right]].forEach(function (p) { p[1].style.display = usable(p[0]) ? '' : 'none'; }); B.menu.setAttribute('aria-checked', String(!pref('nav'))); B.menu.textContent = pref('nav') ? 'App menu: hidden' : (pref('rail') !== false ? 'App menu: compact' : 'App menu: full'); B.left.setAttribute('aria-checked', String(!pref('left'))); B.right.setAttribute('aria-checked', String(!pref('right'))); B.focus.setAttribute('aria-checked', String(!!(pref('left') && pref('right')))); }
  function applyRail() { document.documentElement.classList.toggle('avx-rail', /#\/app\/lab/.test(location.hash) && pref('rail') !== false); }
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
    var nv = ol.parentElement; if (nv) nv.scrollLeft = 1e5;
  }
  function refresh() {
    if (!B.hide) return; var r = sel();
    [B.hide, B.iso, B.reveal].forEach(function (b) { b.setAttribute('aria-disabled', r ? 'false' : 'true'); if (r) b.removeAttribute('hidden'); else b.setAttribute('hidden', ''); });
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

  function isMob() { return matchMedia('(max-width:767px),(max-height:500px)').matches; }
  function mountFab() {
    if ($('#avux-fab')) return;
    var f = el('button', { id: 'avux-fab', type: 'button', 'aria-label': 'Open view tools', title: 'View tools', onclick: sheet });
    var sp = el('span'); var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', 22); s.setAttribute('height', 22); s.setAttribute('fill', 'none'); s.setAttribute('stroke', '#fff'); s.setAttribute('stroke-width', '2.2'); s.setAttribute('stroke-linecap', 'round');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M4 6h16M4 12h10M4 18h7M17 15l3 3-3 3'); s.appendChild(p); sp.appendChild(s); sp.appendChild(document.createTextNode('Tools')); f.appendChild(sp);
    document.body.appendChild(f);
  }
  function closeSheet() { var s = $('#avux-sheet'); if (s) { s.remove(); var f = $('#avux-fab'); if (f && f.offsetParent) f.focus(); } setTimeout(function () { try { syncNav(); } catch (e) {} }, 30); }
  function sheet() {
    closeSheet(); var r = sel(), s = st();
    var tl = el('div', { class: 'tl' });
    function tile(k, label, fn, needSel, pressed) {
      var b = el('button', { type: 'button', class: 't', onclick: function () { if (needSel && !sel()) { need(); return; } closeSheet(); fn(); } });
      b.style.setProperty('--ic', IC[k][0]); var ib = el('span', { class: 'ib' }); ib.appendChild(svgI(k, 22)); b.appendChild(ib); b.appendChild(document.createTextNode(label));
      if (needSel && !r) b.setAttribute('aria-disabled', 'true'); if (pressed !== undefined) b.setAttribute('aria-pressed', String(!!pressed));
      tl.appendChild(b);
    }
    tile('reset', 'Reset view', A.reset); tile('showAll', 'Show all', A.showAll); tile('undo', 'Undo', undo);
    tile('iso', 'Isolate selected', A.isoSel, true); tile('reveal', 'Reveal selected', A.reveal, true); tile('hide', 'Hide selected', A.hideSel, true);
    tile('fade', 'Fade surroundings', A.fade, false, s.xray); tile('mgr', 'Visibility manager', mgrDlg); tile('help', 'How to use', helpDlg);
    var tb = Array.prototype.find.call(document.querySelectorAll('button'), function (b) { return /touch and explore/i.test(b.textContent) && !b.closest('#avux-sheet'); });
    if (tb) tile('tour', 'Quick tour', function () { tb.classList.remove('avx-tour'); tb.click(); });
    var cur = el('div', { class: 'cur' }); cur.appendChild(svgI(r ? 'iso' : 'help', 18)); cur.appendChild(document.createTextNode(r ? 'Selected: ' + r.name : 'Nothing selected yet. Tap a part of the body, or search for it.'));
    var box = el('div'); box.appendChild(cur); box.appendChild(tl);
    openSheet('tools', 'View tools', 'Choose what you see. Undo brings back your last change.', box);
  }
  function openSheet(k, title, sub, content) {
    var sh = el('div', { class: 'sh', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, [el('div', { class: 'gr' }), el('h2', { text: title }), el('p', { text: sub }), content]);
    var o = el('div', { id: 'avux-sheet', 'data-k': k, onclick: function (e) { if (e.target === o) closeSheet(); } }, [sh]);
    document.body.appendChild(o); var kd = function (e) { if (e.key === 'Escape') { closeSheet(); document.removeEventListener('keydown', kd); } }; document.addEventListener('keydown', kd);
    var y0 = null; sh.addEventListener('touchstart', function (e) { if (sh.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true }); sh.addEventListener('touchend', function (e) { if (y0 != null && (e.changedTouches[0].clientY - y0) > 70) closeSheet(); y0 = null; }, { passive: true });
    var first = sh.querySelector('button'); if (first) first.focus();
    setTimeout(syncNav, 30);
  }
  function FXpop() { return globalThis.__avFx && globalThis.__avFx.pop || null; }
  function markMobile(sec) {
    var fem = Array.prototype.find.call(sec.querySelectorAll('button'), function (b) { return /^\s*♀\s*Female\s*$/.test(b.textContent); });
    if (fem && fem.parentElement && !fem.parentElement.classList.contains('avx-sex') && !fem.closest('.av-toolbar-dock')) fem.parentElement.classList.add('avx-sex');
    Array.prototype.forEach.call(sec.querySelectorAll('button'), function (b) { if (/^\s*touch and explore\s*$/i.test(b.textContent) && !b.closest('[role=dialog]')) b.classList.add('avx-tour'); });
    var bd = sec.querySelector('.absolute.bottom-3.left-14'); if (bd) bd.classList.add('avx-badge');
    var up = sec.querySelector('button[aria-label="Move the view up"]'); if (up && up.parentElement) up.parentElement.classList.add('avx-pan');
    Array.prototype.forEach.call(document.querySelectorAll('a'), function (a) { if (/^3D models:/.test(a.textContent || '')) a.classList.add('avx-cred'); });
    Array.prototype.forEach.call(document.querySelectorAll('div[style*="position: fixed"]'), function (d) { if (/Drag the title bar/.test(d.textContent || '')) d.classList.add('avx-qcard'); });
    var sheetEl = document.querySelector('.av-panel.fixed.inset-x-0.bottom-0'); var so = !!(sheetEl && sheetEl.getBoundingClientRect().height > 30 && getComputedStyle(sheetEl).display !== 'none'); document.documentElement.classList.toggle('avx-sheet-open', so);
    var fxb = document.getElementById('av-skull-tools'), sx = sec.querySelector('.avx-sex');
    var anc = sx && sx.getBoundingClientRect().height ? sx : (sec.querySelector('.absolute.inset-x-3.z-20') || sx);
    if (fxb && fxb.style.display !== 'none' && anc && isMob()) { var pr = anc.getBoundingClientRect(); fxb.dataset.avx = '1'; fxb.style.setProperty('top', Math.round(pr.bottom + 8) + 'px', 'important'); fxb.style.setProperty('max-width', 'calc(100vw - 16px)', 'important'); fxb.style.setProperty('flex-wrap', 'nowrap', 'important'); fxb.style.setProperty('overflow-x', 'auto', 'important'); fxb.style.setProperty('justify-content', 'flex-start', 'important'); fxb.style.setProperty('white-space', 'nowrap', 'important'); var pp = FXpop(); if (pp) pp.style.setProperty('top', Math.round(pr.bottom + 8 + fxb.getBoundingClientRect().height + 6) + 'px', 'important'); }
    else if (fxb && fxb.dataset.avx) { delete fxb.dataset.avx; fxb.style.removeProperty('top'); fxb.style.removeProperty('max-width'); fxb.style.removeProperty('flex-wrap'); fxb.style.removeProperty('justify-content'); var pq = FXpop(); if (pq) pq.style.removeProperty('top'); }
    sheetFit(sec, sheetEl, so);
    var fab = $('#avux-fab'); if (!fab) return;
    var top = innerHeight; Array.prototype.forEach.call(document.querySelectorAll('.av-panel'), function (p) { var cs = getComputedStyle(p); if (cs.position !== 'fixed' && cs.position !== 'absolute') return; var b = p.getBoundingClientRect(); if (b.width >= innerWidth * .9 && b.bottom >= innerHeight - 4 && b.top > innerHeight * .25 && b.height > 40) top = Math.min(top, b.top); });
    var side = so && sheetEl.getBoundingClientRect().width < innerWidth * .7;
    if (side) { fab.style.right = (sheetEl.getBoundingClientRect().width + 14) + 'px'; fab.style.bottom = '16px'; }
    else { fab.style.right = ''; fab.style.bottom = (innerHeight - top + (top < innerHeight ? 12 : 30)) + 'px'; }
    fab.style.display = (so && !side && sheetEl.getBoundingClientRect().height > innerHeight * .5) ? 'none' : '';
  }


  /* phone details sheet: swipe down to shrink it to a small bar (the part stays selected and highlighted),
     swipe up or tap the bar to bring it back; the 3D view always fits in the space above the sheet */
  var peek = false, peekSel = null;
  function sheetFit(sec, sh, open) {
    var portrait = isMob() && innerWidth < 768 && innerHeight > 500;
    if (sh && !sh.dataset.avxSw) { sh.dataset.avxSw = '1'; wireSheet(sh); }
    var sid = st().selectedId; if (sid !== peekSel) { peekSel = sid; peek = false; }
    if (sh) sh.classList.toggle('avx-peek', !!(open && peek));
    var h = open && portrait && sh ? Math.round(sh.getBoundingClientRect().height) : 0; if (h > innerHeight * .5) h = 0;
    var want = h ? Math.max(0, h - 8) + 'px' : '';
    if (sec.style.paddingBottom !== want) { sec.style.paddingBottom = want; sec.style.boxSizing = 'border-box'; setTimeout(function () { var s = r3(); if (s && s.invalidate) s.invalidate(); }, 60); }
  }
  function wireSheet(sh) {
    var y0 = null, t0 = 0;
    sh.addEventListener('touchstart', function (e) { var hd = sh.firstElementChild; if (!hd || !hd.contains(e.target) && !sh.classList.contains('avx-peek')) return; y0 = e.touches[0].clientY; t0 = Date.now(); }, { passive: true });
    sh.addEventListener('touchend', function (e) { if (y0 == null) return; var dy = (e.changedTouches[0] || {}).clientY - y0; y0 = null;
      if (dy > 40) { peek = true; } else if (dy < -40 || (Math.abs(dy) < 8 && peek && Date.now() - t0 < 400 && !(e.target.closest && e.target.closest('button')))) { peek = false; }
      else return; soonFull(); }, { passive: true });
    sh.addEventListener('click', function (e) { if (sh.classList.contains('avx-peek') && !(e.target.closest && e.target.closest('button[aria-label^="Close"]'))) { peek = false; soonFull(); } }, true);
  }
  function soonFull() { try { tick(); } catch (e) {} setTimeout(function () { try { tick(); } catch (e) {} }, 120); }
  /* after choosing a part from the search box on a phone, close the keyboard so the 3D view is not hidden */
  var lastSid = null;
  function blurAfterPick() { var id = S && st().selectedId; if (id && id !== lastSid && isMob()) { var a = document.activeElement; if (a && a.tagName === 'INPUT') a.blur(); } lastSid = id; }

  /* ---------- Android-style bottom bar for the 3D lab on phones (portrait) ---------- */
  function navMode() { return /#\/app\/lab/.test(location.hash) && innerWidth < 768 && innerHeight > 500; }
  function tool(label) { return document.querySelector('.av-toolbar button[aria-label^="' + label + '"]'); }
  function mountNav() {
    var nav = $('#avux-nav');
    if (!navMode()) { if (nav) nav.remove(); document.documentElement.classList.remove('avx-nav'); return; }
    document.documentElement.classList.add('avx-nav');
    if (nav) { syncNav(); return; }
    nav = el('nav', { id: 'avux-nav', 'aria-label': 'Lab controls' });
    [['view', 'View', viewSheet], ['layers', 'Layers', openLayers], ['tools', 'Tools', sheet], ['info', 'Info', openInfo]].forEach(function (d) {
      var b = el('button', { type: 'button', 'data-k': d[0], onclick: function () { if (navBusy()) return; d[2](); setTimeout(syncNav, 60); } });
      var pill = el('span', { class: 'pl' }); pill.appendChild(svgI(d[0], 22)); b.appendChild(pill); b.appendChild(el('span', { class: 'lb', text: d[1] }));
      nav.appendChild(b);
    });
    document.body.appendChild(nav); syncNav();
  }
  var navT = 0; function navBusy() { var n = Date.now(); if (n - navT < 350) return true; navT = n; return false; }
  function syncNav() {
    var nav = $('#avux-nav'); if (!nav) return;
    var open = { view: !!$('#avux-sheet[data-k=view]'), tools: !!$('#avux-sheet[data-k=tools]'), layers: !!document.querySelector('[role=dialog][aria-label*="tructures and layers"], div.fixed.inset-0.z-40'), info: !!(document.querySelector('.av-panel.fixed.inset-x-0.bottom-0') && !peek) };
    Array.prototype.forEach.call(nav.children, function (b) { var k = b.getAttribute('data-k'); b.setAttribute('aria-current', open[k] ? 'true' : 'false'); });
  }
  function openLayers() { closeSheet(); var b = document.querySelector('button[aria-label="Open structures and layers"]'); if (b) b.click(); else toast('The structure list is not available here.'); }
  function openInfo() {
    closeSheet(); var r = sel();
    if (!r) { toast('Tap a part of the body, or search for it, to see its details.'); var i = document.querySelector('input[placeholder^="Search"]'); if (i) i.focus(); return; }
    var sh = document.querySelector('.av-panel.fixed.inset-x-0.bottom-0');
    if (sh) { peek = !peek ? true : false; soonFull(); } else { st().select(null); setTimeout(function () { st().select(r.id); }, 30); }
  }
  function viewSheet() {
    closeSheet(); var s = st();
    var body = el('div');
    function sec(title) { body.appendChild(el('h3', { class: 'vh', text: title })); var g = el('div', { class: 'vg' }); body.appendChild(g); return g; }
    function chip(g, label, fn, pressed, k) { var b = el('button', { type: 'button', class: 'vc', onclick: function () { fn(); } }); if (k) { b.style.setProperty('--ic', IC[k][0]); b.appendChild(svgI(k, 18)); } b.appendChild(document.createTextNode(label)); if (pressed !== undefined) b.setAttribute('aria-pressed', String(!!pressed)); g.appendChild(b); return b; }
    var g1 = sec('Look from');
    [['Front', 'Anterior view'], ['Back', 'Posterior view'], ['Left', 'Left lateral view'], ['Right', 'Right lateral view'], ['Top', 'Superior view'], ['Below', 'Inferior view'], ['Oblique', 'Anterolateral oblique view']].forEach(function (v) { chip(g1, v[0], function () { var b = tool(v[1]); if (b) b.click(); closeSheet(); }); });
    chip(g1, 'Reset view', function () { A.reset(); closeSheet(); }, undefined, 'reset');
    var g2 = sec('Body');
    var f = chip(g2, 'Female', function () { st().setSex('female'); f.setAttribute('aria-pressed', 'true'); m.setAttribute('aria-pressed', 'false'); }, s.sex === 'female', 'female');
    var m = chip(g2, 'Male', function () { st().setSex('male'); m.setAttribute('aria-pressed', 'true'); f.setAttribute('aria-pressed', 'false'); }, s.sex === 'male', 'male');
    var g3 = sec('Show');
    [['Labels', 'Toggle labels'], ['X-ray of selected part', 'Toggle X-ray view'], ['Heartbeat', 'Start heartbeat'], ['Simplified (faster) drawing', 'Toggle simplified rendering']].forEach(function (v) {
      var tb = tool(v[1]); if (!tb) return; var c = chip(g3, v[0], function () { tb.click(); setTimeout(function () { c.setAttribute('aria-pressed', String(tb.getAttribute('aria-pressed') === 'true')); }, 80); }, tb.getAttribute('aria-pressed') === 'true');
    });
    var g4 = sec('Animations');
    chip(g4, 'Watch a system in action', function () { closeSheet(); try { st().setSystemsMenuOpen(true); } catch (e) {} }, undefined, 'anim');
    openSheet('view', 'View', 'Camera angle, body and what is drawn.', body);
  }

  /* fit the simple placeholder shapes inside the scanned skull (they poked out of the face and the vault).
     Geometry is adjusted once in place; scanned models are not touched. */
  var FIT = {
    nasal_cavity: { s: [0.85, 1, 0.55], a: 'zmin' }, olfactory_epithelium: { s: [1, 1, 0.6], a: 'zmin' },
    oral_cavity: { s: [0.9, 0.9, 0.7], a: 'zmin' }, tongue_taste_buds: { s: [0.9, 1, 0.75], a: 'zmin' },
    cerebrum: { s: [0.9, 0.92, 0.9], a: 'c' }, cerebellum: { s: [0.94, 0.94, 0.94], a: 'c' }
  };
  function fitPlaceholders() {
    var sc = globalThis.__scn; if (!sc || sc.__avxFit) return; var n = 0;
    sc.traverse(function (m) {
      var f = m.isMesh && FIT[m.name]; if (!f || !m.geometry || m.geometry.userData.__avxFit) return;
      var g = m.geometry; g.computeBoundingBox(); var b = g.boundingBox;
      var cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2, cz = f.a === 'zmin' ? b.min.z : (b.min.z + b.max.z) / 2;
      g.translate(-cx, -cy, -cz); g.scale(f.s[0], f.s[1], f.s[2]); g.translate(cx, cy, cz);
      g.computeBoundingBox(); g.computeBoundingSphere(); g.userData.__avxFit = 1; n++;
    });
    if (n) { sc.__avxFit = 1; var s = r3(); if (s && s.invalidate) s.invalidate(); }
  }
  /* lifecycle */
  function tick() {
    if (!globalThis.__avStore) return; S = globalThis.__avStore; F = globalThis.__avF;
    if (!DEF) DEF = { layerVisible: Object.assign({}, st().layerVisible), layerOpacity: Object.assign({}, st().layerOpacity) };
    var onLab = /#\/app\/lab/.test(location.hash), c = $('canvas'), sec = c && c.closest('section'), row = sec && sec.parentElement;
    var bar = $('#avux');
    if (!onLab) document.documentElement.classList.remove('avx-rail', 'avx-sheet-open');
    document.documentElement.classList.toggle('avx-onlab', onLab); if (!onLab) Array.prototype.forEach.call(document.querySelectorAll('div[style*="position: fixed"]'), function (d) { if (/Drag the title bar/.test(d.textContent || '') && d.style.display !== 'none') d.style.setProperty('display', 'none', 'important'); });
    if (!onLab || !row) { if (bar) { bar.remove(); B = {}; mounted = null; } var fb = $('#avux-fab'); if (fb) fb.remove(); var nv = $('#avux-nav'); if (nv) nv.remove(); document.documentElement.classList.remove('avx-nav'); closeSheet(); return; }
    mountFab(); markMobile(sec); applyRail(); mountNav(); try { fitPlaceholders(); } catch (e) {}
    if (!bar || mounted !== row) { if (bar) bar.remove(); B = {}; mounted = row; css(); mountBar(row); last = JSON.stringify(snap()); }
    light();
  }
  function light() { blurAfterPick(); if (!S || !B.hide) return; track(); var k = st().selectedId + '|' + st().systemFocus + '|' + st().xray; if (k !== lastSel) { lastSel = k; refresh(); } }
  /* scheduling: cheap state sync soon after a change, full page checks at most a few times a second */
  var tL = 0, tF = 0;
  function soon() { if (!tL) tL = setTimeout(function () { tL = 0; try { light(); } catch (e) {} }, 60); if (!tF) tF = setTimeout(function () { tF = 0; try { tick(); } catch (e) {} }, 350); }
  /* hover: ignore on touch screens (no hover there) and batch mouse hover to one update per frame */
  var lastPT = 'mouse', hv = { id: undefined, raf: 0 };
  addEventListener('pointerdown', function (e) { lastPT = e.pointerType || 'mouse'; }, true);
  addEventListener('pointermove', function (e) { if (e.pointerType) lastPT = e.pointerType; }, true);
  /* rapid repeated taps on Female/Male rebuild the body each time: apply at most one switch every 450 ms (the last choice wins) */
  function wrapSex() {
    var s = globalThis.__avStore; if (!s || s.getState().__avxSex) return; var orig = s.getState().setSex; if (typeof orig !== 'function') return;
    var lastT = 0, want = null, tmr = 0;
    s.setState({ __avxSex: true, setSex: function (v) {
      var now = Date.now(); want = v; if (tmr) return;
      var wait = Math.max(0, 450 - (now - lastT));
      if (!wait) { lastT = now; want = null; orig(v); return; }
      tmr = setTimeout(function () { tmr = 0; lastT = Date.now(); var w = want; want = null; if (w && w !== s.getState().sex) orig(w); }, wait);
    } });
  }
  /* a detailed model that fails to download: say so, keep everything else working, offer a retry */
  var failed = {};
  function noteFail(msg) {
    var m = /Could not load \S*?\/models\/(?:lite\/)?([\w-]+)\.glb/.exec(msg || ''); if (!m) return; failed[m[1]] = 1; setTimeout(showFail, 300);
  }
  addEventListener('error', function (e) { noteFail(e && (e.message || (e.error && e.error.message))); });
  addEventListener('unhandledrejection', function (e) { noteFail(e && e.reason && (e.reason.message || String(e.reason))); });
  var NICE = { 'anatomyverse-limbs': 'limbs', 'anatomyverse-organs': 'organs', 'zanatomy-skull': 'skull', 'zanatomy-heart': 'heart', 'bodyparts3d-lungs': 'lungs', 'zanatomy-eye': 'eye', 'zanatomy-ear': 'ear', 'anatomyverse-limbsupply': 'limb vessels and nerves', 'zanatomy-eyedetail': 'eye details' };
  function showFail() {
    var ks = Object.keys(failed); if (!ks.length || !/#\/app\/lab/.test(location.hash)) return; css();
    var sec = $('canvas') && $('canvas').closest('section'); if (!sec) return;
    var box = $('#avux-fail'); if (!box) { box = el('div', { id: 'avux-fail', role: 'alert' }); sec.appendChild(box); }
    var off = navigator.onLine === false;
    box.innerHTML = '';
    box.appendChild(el('span', { text: (off ? 'You are offline. ' : '') + 'Some detailed parts could not load (' + ks.map(function (k) { return NICE[k] || k; }).join(', ') + '). Simplified shapes are shown for them.' }));
    box.appendChild(el('button', { type: 'button', class: 'avx-b', text: 'Retry', onclick: function () { try { var id = st().selectedId; if (id) sessionStorage.setItem('avux.resel', id); } catch (e) {} location.reload(); } }));
    box.appendChild(el('button', { type: 'button', class: 'avx-b', 'aria-label': 'Dismiss', text: '×', onclick: function () { box.remove(); failed = {}; } }));
  }
  function restoreSel() { try { var id = sessionStorage.getItem('avux.resel'); if (id && S && F[id]) { sessionStorage.removeItem('avux.resel'); setTimeout(function () { st().select(id); st().frame([id]); }, 1500); } } catch (e) {} }
  function wrapHover() {
    var s = globalThis.__avStore; if (!s || s.getState().__avxHover) return; var orig = s.getState().hover; if (typeof orig !== 'function') return;
    s.setState({ __avxHover: true, hover: function (id) {
      if (lastPT !== 'mouse' || drag.off) { if (id == null && s.getState().hoveredId != null) orig(null); return; }
      hv.id = id; if (hv.raf) return; hv.raf = requestAnimationFrame(function () { hv.raf = 0; orig(hv.id); });
    } });
  }
  /* smoother dragging: stop per-move hit-testing of every 3D part while the view is being dragged */
  var drag = { on: false, x: 0, y: 0, off: false };
  function r3() { try { return globalThis.__r3s && globalThis.__r3s.get ? globalThis.__r3s.get() : null; } catch (e) { return null; } }
  function evOn(v) { var s = r3(); if (s && s.setEvents && s.events && s.events.enabled !== v) s.setEvents({ enabled: v }); }
  addEventListener('pointerdown', function (e) { if (e.target && e.target.tagName === 'CANVAS') { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; } }, true);
  addEventListener('pointermove', function (e) { if (!drag.on || drag.off) return; if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) { drag.off = true; evOn(false); } }, true);
  function endDrag() { if (drag.off) evOn(true); drag.on = false; drag.off = false; }
  addEventListener('pointerup', endDrag, true); addEventListener('pointercancel', endDrag, true); addEventListener('blur', endDrag);
  var lastSel = '';
  document.addEventListener('click', function (e) { var lay = document.querySelector('#avux .avx-lay'); if (!lay || lay.contains(e.target)) return; var pop = lay.querySelector('.avx-pop'), lb = lay.querySelector('button'); if (pop && !pop.hasAttribute('hidden')) { pop.setAttribute('hidden', ''); if (lb) lb.setAttribute('aria-expanded', 'false'); } });
  addEventListener('resize', function () { try { syncToggles(); } catch (e) {} });
  addEventListener('keydown', function (e) { if (e.key !== 'Escape' || !S || !/#\/app\/lab/.test(location.hash)) return; if ($('#avux-dlg') || $('#avux-sheet') || document.querySelector('[role=dialog][aria-modal=true]')) return; var a = document.activeElement; if (a && /INPUT|SELECT|TEXTAREA/.test(a.tagName)) return; if (st().selectedId) { st().select(null); toast('Selection cleared'); } });
  setInterval(function () { if (!document.hidden) { try { tick(); } catch (e) {} } }, 900);
  addEventListener('hashchange', function () { setTimeout(function () { try { tick(); } catch (e) {} }, 50); });
  var iv = setInterval(function () { if (globalThis.__avStore) { clearInterval(iv); wrapHover(); wrapSex(); restoreSel(); globalThis.__avStore.subscribe(soon); tick(); } }, 200);
})();
