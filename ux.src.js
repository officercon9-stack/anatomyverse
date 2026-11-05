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
      '.av-panel.avx-peek{height:76px!important;overflow:hidden;touch-action:none}.av-panel.fixed.inset-x-0.bottom-0 > div:first-child{touch-action:none;min-height:44px}#avux-sheet .gr{touch-action:none;box-sizing:content-box;padding:8px 0}.av-panel.avx-peek > div:last-child{overflow:hidden!important;pointer-events:none}',
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
  var lastSide = null, subDone = false;
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
    isoSel: function () { var r = sel(); if (!r) return need(); var t = r, ks = Object.keys(F).filter(function (k) { return F[k].parentId === r.id && (F[k].side === 'left' || F[k].side === 'right') && !/carved from/i.test(F[k].location || ''); });
      if (ks.length === 2) { var want = lastSide || 'left'; t = F[ks.filter(function (k) { return F[k].side === want; })[0] || ks[0]]; }
      st().isolate([t.id]); st().frame([t.id]); toast('Showing only ' + t.name + (t !== r ? '. Select the other side and press Isolate to switch.' : '')); },
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
  function wireSheet() {}
  /* one touch handler for every panel that can cover the 3D view: the details sheet (collapse to a bar / reopen),
     the View and Tools sheets (swipe down to close) and the structure drawer (swipe left to close).
     It acts while the finger is moving, so it still works when the browser takes over the gesture. */
  (function () {
    var g = null;
    function inner(t, root) { for (var n = t; n && n !== root; n = n.parentNode) { if (n.scrollTop > 0) return true; } return false; }
    function kind(t) {
      if (!t || !t.closest) return null;
      var d = t.closest('.av-panel.fixed.inset-x-0.bottom-0'); if (d && isMob() && innerWidth < 768) return { k: 'det', r: d };
      var v = t.closest('#avux-sheet .sh'); if (v) return { k: 'sheet', r: v };
      var w = t.closest('div.fixed.inset-0.z-40 > .av-panel'); if (w) return { k: 'drawer', r: w };
      return null;
    }
    document.addEventListener('touchstart', function (e) {
      var c = e.touches.length === 1 && kind(e.target); if (!c) { g = null; return; }
      var hd = c.k === 'det' && c.r.firstElementChild;
      g = { k: c.k, r: c.r, x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), hd: !!(hd && hd.contains(e.target)), sc: inner(e.target, c.r), done: false, peeked: c.r.classList.contains('avx-peek'), tgt: e.target };
    }, { passive: true, capture: true });
    document.addEventListener('touchmove', function (e) {
      if (!g || g.done || !e.touches[0]) return;
      var dx = e.touches[0].clientX - g.x, dy = e.touches[0].clientY - g.y;
      if (g.k === 'det') {
        if (!g.peeked && dy > 36 && Math.abs(dy) > Math.abs(dx) && (g.hd || !g.sc)) { g.done = true; peek = true; soonFull(); }
        else if (g.peeked && dy < -26 && Math.abs(dy) > Math.abs(dx)) { g.done = true; peek = false; soonFull(); }
      } else if (g.k === 'sheet') {
        if (dy > 50 && Math.abs(dy) > Math.abs(dx) * 1.2 && !g.sc) { g.done = true; closeSheet(); }
      } else if (g.k === 'drawer') {
        if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 1.2) { g.done = true; var b = g.r.querySelector('button[aria-label="Close panel"]'); if (b) b.click(); }
      }
    }, { passive: true, capture: true });
    function end(e) {
      var q = g; g = null; if (!q || q.done) return;
      var c = (e.changedTouches || [])[0]; if (!c) return;
      if (q.k === 'det' && q.peeked && Math.abs(c.clientY - q.y) < 10 && Math.abs(c.clientX - q.x) < 10 && Date.now() - q.t < 500 && !(q.tgt.closest && q.tgt.closest('button'))) { peek = false; soonFull(); }
    }
    /* taps: the grey handle toggles the bar; the chevron on the tall sheet collapses all the way to the bar */
    document.addEventListener('click', function (e) {
      var d = e.target.closest && e.target.closest('.av-panel.fixed.inset-x-0.bottom-0'); if (!d || !isMob() || innerWidth >= 768) return;
      var hd = d.firstElementChild; if (!hd || !hd.contains(e.target) || e.target.closest('button[aria-label^="Close"]')) return;
      var btn = e.target.closest('button');
      if (d.classList.contains('avx-peek')) return;
      if (!btn) { peek = true; soonFull(); return; }
      if (/collapse/i.test(btn.getAttribute('aria-label') || '')) { peek = true; soonFull(); }
    }, true);
    document.addEventListener('touchend', end, { passive: true, capture: true });
    document.addEventListener('touchcancel', function () { g = null; }, { passive: true, capture: true });
  })();
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

  /* The lab is the only screen with no <h1>, so a screen reader lands on it with no page title. */
  function labHeading() {
    if (!/#\/app\/lab/.test(location.hash)) return;
    if (document.querySelector('h1')) return;
    var main = document.querySelector('main') || document.body;
    var h = document.createElement('h1');
    h.className = 'sr-only'; h.id = 'avx-h1'; h.textContent = '3D anatomy lab';
    main.insertBefore(h, main.firstChild);
  }


  /* ---- Vertical scroll bar -------------------------------------------
     A tall model does not fit the viewport, and the only way to move up or
     down was two step buttons. This is a proper scroll bar down the left of
     the 3D view: drag the thumb, click the track, use the wheel over it, or
     focus it and use the arrow keys. The thumb follows the camera, so it also
     shows where you are in the body. */
  var SCR = { lo: null, hi: null, drag: 0, th: 14 };   /* th = thumb height, percent of track */
  function scrRange() {
    if (SCR.lo != null) return true;
    var scn = globalThis.__scn; if (!scn) return false;
    var lo = Infinity, hi = -Infinity, xl = Infinity, xh = -Infinity, zl = Infinity, zh = -Infinity;
    scn.updateMatrixWorld(true);
    scn.traverse(function (m) {
      if (!m.isMesh || !m.visible || !m.geometry) return;
      if (!m.geometry.boundingBox) { try { m.geometry.computeBoundingBox(); } catch (e) { return; } }
      var bb = m.geometry.boundingBox; if (!bb) return;
      var b = bb.clone().applyMatrix4(m.matrixWorld);
      if (b.min.y < lo) lo = b.min.y;
      if (b.max.y > hi) hi = b.max.y;
      if (b.min.x < xl) xl = b.min.x;
      if (b.max.x > xh) xh = b.max.x;
      if (b.min.z < zl) zl = b.min.z;
      if (b.max.z > zh) zh = b.max.z;
    });
    if (!isFinite(lo) || !isFinite(hi) || hi - lo < 0.05) return false;
    SCR.lo = lo; SCR.hi = hi; SCR.xl = xl; SCR.xh = xh; SCR.zl = zl; SCR.zh = zh;
    return true;
  }
  /* How far the view can travel: stop once the head (or the feet) reaches the
     edge of the viewport rather than carrying on into empty space. How much is
     on screen depends on the zoom, so work it out from the camera each time. */
  function scrSpan() {
    if (!scrRange()) return null;
    var lo = SCR.lo, hi = SCR.hi;
    var full = hi - lo;
    /* the thumb runs the length of the body: top of the track is the head,
       bottom is the feet, whatever the zoom. A small margin keeps the ends
       from drifting into empty space. */
    var inset = full * 0.07;
    lo += inset; hi -= inset;
    if (hi - lo < 1e-3) { var m = (hi + lo) / 2; lo = m - 1e-3; hi = m + 1e-3; }
    return { lo: lo, hi: hi, full: full };
  }
  function scrY() {
    try {
      var s = globalThis.__r3s.get();
      return s.controls && s.controls.target ? s.controls.target.y : s.camera.position.y;
    } catch (e) { return null; }
  }
  function scrX() {
    try {
      var s = globalThis.__r3s.get();
      return s.controls && s.controls.target ? s.controls.target.x : s.camera.position.x;
    } catch (e) { return null; }
  }
  function scrPanTo(y) { scrPanXY(null, y); }
  function scrPanXY(x, y) {
    var dx = 0, dy = 0;
    if (x != null) { var cx = scrX(); if (cx == null) return; dx = (x || 0) - cx; }
    if (y != null) { var c = scrY(); if (c == null) return; dy = y - c; }
    if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return;
    try {
      var b = globalThis.__avb; if (!b) return;
      b.set({ panq: { dx: dx, dy: dy, seq: ((b.get().panq || {}).seq || 0) + 1 } });
      var s = globalThis.__r3s.get(); s.invalidate && s.invalidate();
    } catch (e) {}
  }
  function scrSet(frac) {
    var sp = scrSpan(); if (!sp) return;
    frac = Math.max(0, Math.min(1, frac));
    scrPanTo(sp.hi - frac * (sp.hi - sp.lo));
  }
  function syncScroll() {
    var sc = $('#avx-scroll'); if (!sc || SCR.drag) return;
    var sp = scrSpan();
    if (!sp) { sc.style.display = 'none'; return; }
    sc.style.display = '';
    var y = scrY(); if (y == null) return;
    var f = Math.max(0, Math.min(1, (sp.hi - y) / (sp.hi - sp.lo)));
    var th = sc.firstChild; if (!th) return;
    th.style.top = (f * (100 - SCR.th)) + '%';
    sc.setAttribute('aria-valuenow', String(Math.round((1 - f) * 100)));
    sc.setAttribute('aria-valuetext', f < 0.25 ? 'Near the head' : f > 0.75 ? 'Near the feet' : 'Middle of the body');
  }
  function mountScroll() {
    var onLab = /#\/app\/lab/.test(location.hash);
    var sc = $('#avx-scroll');
    if (!onLab) { if (sc) sc.remove(); var sx0 = $('#avx-scrollx'); if (sx0) sx0.remove(); SCR.lo = SCR.hi = null; return; }
    var c = $('canvas'); if (!c) return;
    var sec = c.closest('section'); if (!sec) return;
    if (sc && sc.parentElement !== sec) { sc.remove(); sc = null; }
    if (!sc) {
      sc = el('div', { id: 'avx-scroll', role: 'slider', tabindex: '0', 'aria-orientation': 'vertical',
        'aria-label': 'Move the view up and down', 'aria-valuemin': '0', 'aria-valuemax': '100', title: 'Drag to move the view up and down' });
      sc.appendChild(el('div', { class: 'avx-scroll-thumb' }));
      function fracFromEvent(e) {
        var r = sc.getBoundingClientRect(), th = sc.firstChild.getBoundingClientRect();
        var usable = r.height - th.height;
        if (usable <= 0) return 0;
        return (e.clientY - r.top - th.height / 2) / usable;
      }
      sc.addEventListener('pointerdown', function (e) {
        if (!scrRange()) return;
        SCR.drag = 1; sc.setPointerCapture && sc.setPointerCapture(e.pointerId);
        try { sc.focus({ preventScroll: true }); } catch (x) {}   /* so the arrow keys work straight after a drag */
        sc.classList.add('on'); scrSet(fracFromEvent(e)); syncThumbTo(fracFromEvent(e));
        e.preventDefault();
      });
      sc.addEventListener('pointermove', function (e) {
        if (!SCR.drag) return;
        var f = fracFromEvent(e); scrSet(f); syncThumbTo(f); e.preventDefault();
      });
      function stop(e) { if (!SCR.drag) return; SCR.drag = 0; sc.classList.remove('on'); try { sc.releasePointerCapture(e.pointerId); } catch (x) {} syncScroll(); }
      sc.addEventListener('pointerup', stop); sc.addEventListener('pointercancel', stop);
      sc.addEventListener('wheel', function (e) {
        var sp = scrSpan(); if (!sp) return;
        var y = scrY(); if (y == null) return;
        scrPanTo(Math.max(sp.lo, Math.min(sp.hi, y - Math.sign(e.deltaY) * (sp.hi - sp.lo) * 0.08)));
        e.preventDefault(); syncScroll();
      }, { passive: false });
      sc.addEventListener('keydown', function (e) {
        var sp = scrSpan(); if (!sp) return;
        var y = scrY(); if (y == null) return;
        var span = sp.hi - sp.lo, step = span * 0.08, big = span * 0.25, t = null;
        if (e.key === 'ArrowUp') t = y + step; else if (e.key === 'ArrowDown') t = y - step;
        else if (e.key === 'PageUp') t = y + big; else if (e.key === 'PageDown') t = y - big;
        else if (e.key === 'Home') t = sp.hi; else if (e.key === 'End') t = sp.lo;
        if (t == null) return;
        scrPanTo(Math.max(sp.lo, Math.min(sp.hi, t))); e.preventDefault(); setTimeout(syncScroll, 0);
      });
      sec.appendChild(sc);
    }
    function syncThumbTo(f) {
      var th = sc.firstChild; if (!th) return;
      f = Math.max(0, Math.min(1, f));
      th.style.top = (f * (100 - SCR.th)) + '%';
    }
    syncScroll();
  }

  /* Sideways scroll bar along the bottom of the 3D view: moves the model left and right. */
  function scrXSpan() {
    if (!scrRange()) return null;
    var w = SCR.xh - SCR.xl, m = w * 0.1, lo = SCR.xl + m, hi = SCR.xh - m;
    if (hi - lo < 1e-3) { var c = (hi + lo) / 2; lo = c - 1e-3; hi = c + 1e-3; }
    return { lo: lo, hi: hi };
  }
  function syncScrollX() {
    var sc = $('#avx-scrollx'); if (!sc || SCR.dragx) return;
    var sp = scrXSpan(); if (!sp) { sc.style.display = 'none'; return; }
    sc.style.display = '';
    var x = scrX(); if (x == null) return;
    var f = Math.max(0, Math.min(1, (x - sp.lo) / (sp.hi - sp.lo)));
    sc.firstChild.style.left = (f * (100 - SCR.th)) + '%';
    sc.setAttribute('aria-valuenow', String(Math.round(f * 100)));
    sc.setAttribute('aria-valuetext', f < 0.25 ? 'Towards the left' : f > 0.75 ? 'Towards the right' : 'Centre');
  }
  function mountScrollX() {
    var sc = $('#avx-scrollx');
    if (!/#\/app\/lab/.test(location.hash)) { if (sc) sc.remove(); return; }
    var c = $('canvas'); if (!c) return;
    var sec = c.closest('section'); if (!sec) return;
    if (sc && sc.parentElement !== sec) { sc.remove(); sc = null; }
    if (!sc) {
      sc = el('div', { id: 'avx-scrollx', role: 'slider', tabindex: '0', 'aria-orientation': 'horizontal',
        'aria-label': 'Move the view left and right', 'aria-valuemin': '0', 'aria-valuemax': '100', title: 'Drag to move the view left and right' });
      sc.appendChild(el('div', { class: 'avx-scroll-thumb' }));
      var fr = function (e) {
        var r = sc.getBoundingClientRect(), tw = sc.firstChild.getBoundingClientRect().width, u = r.width - tw;
        return u <= 0 ? 0 : (e.clientX - r.left - tw / 2) / u;
      };
      var setF = function (f) {
        var sp = scrXSpan(); if (!sp) return;
        f = Math.max(0, Math.min(1, f));
        scrPanXY(sp.lo + f * (sp.hi - sp.lo), null);
        sc.firstChild.style.left = (f * (100 - SCR.th)) + '%';
      };
      sc.addEventListener('pointerdown', function (e) {
        if (!scrRange()) return;
        SCR.dragx = 1; sc.setPointerCapture && sc.setPointerCapture(e.pointerId);
        try { sc.focus({ preventScroll: true }); } catch (x) {}
        sc.classList.add('on'); setF(fr(e)); e.preventDefault();
      });
      sc.addEventListener('pointermove', function (e) { if (SCR.dragx) { setF(fr(e)); e.preventDefault(); } });
      var stopx = function (e) { if (!SCR.dragx) return; SCR.dragx = 0; sc.classList.remove('on'); try { sc.releasePointerCapture(e.pointerId); } catch (x) {} syncScrollX(); };
      sc.addEventListener('pointerup', stopx); sc.addEventListener('pointercancel', stopx);
      sc.addEventListener('wheel', function (e) {
        var sp = scrXSpan(); if (!sp) return; var x = scrX(); if (x == null) return;
        var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        scrPanXY(Math.max(sp.lo, Math.min(sp.hi, x + Math.sign(d) * (sp.hi - sp.lo) * 0.08)), null);
        e.preventDefault(); syncScrollX();
      }, { passive: false });
      sc.addEventListener('keydown', function (e) {
        var sp = scrXSpan(); if (!sp) return; var x = scrX(); if (x == null) return;
        var span = sp.hi - sp.lo, t = null;
        if (e.key === 'ArrowLeft') t = x - span * 0.08; else if (e.key === 'ArrowRight') t = x + span * 0.08;
        else if (e.key === 'PageUp') t = x - span * 0.25; else if (e.key === 'PageDown') t = x + span * 0.25;
        else if (e.key === 'Home') t = sp.lo; else if (e.key === 'End') t = sp.hi;
        if (t == null) return;
        scrPanXY(Math.max(sp.lo, Math.min(sp.hi, t)), null); e.preventDefault(); setTimeout(syncScrollX, 0);
      });
      sec.appendChild(sc);
    }
    syncScrollX();
  }

  /* Cross-section of ONE organ. Select an organ (or part of one), press Cut, and the organ is
     shown on its own with a movable cutting plane. Anything modelled inside it appears and can be
     touched to read its name; the parts are also listed. Cut faces are painted a flat tissue tone so
     a solid shell reads as a cut surface. Organs that have no interior model say so. */
  var XS = { on: 0, id: null, axis: 'z', f: 0.45, saved: [], raycasts: [], plane: null, bb: null, ids: null, parts: [] };
  function recMap() {
    if (XS.R) return XS.R;
    var R = {}; (Array.isArray(F) ? F : Object.values(F || {})).forEach(function (r) { if (r && r.id) R[r.id] = r; });
    return (XS.R = R);
  }
  function meshCounts() {
    var n = {}; (globalThis.__scn || { traverse: function () {} }).traverse(function (m) { var id = m.isMesh && m.userData && m.userData.structureId; if (id) n[id] = (n[id] || 0) + 1; });
    return n;
  }
  function kids(R) {
    if (XS.K) return XS.K;
    var K = {}; Object.keys(R).forEach(function (id) { var p = R[id].parentId; if (p) (K[p] = K[p] || []).push(id); });
    return (XS.K = K);
  }
  function subtree(id) {
    var R = recMap(), K = kids(R), out = [id], st = [id];
    while (st.length) { var c = st.pop(); (K[c] || []).forEach(function (k) { out.push(k); st.push(k); }); }
    return out;
  }
  function organOf(id) {
    var R = recMap(), mc = meshCounts(), cur = id;
    function count(i) { return subtree(i).reduce(function (a, k) { return a + (mc[k] || 0); }, 0); }
    while (R[cur] && R[cur].parentId && R[R[cur].parentId]) {
      var p = R[cur].parentId;
      if (R[cur].side && !R[p].side) break;        /* stay on the chosen side of a pair */
      if (count(p) > 80) break;                    /* do not climb up to a whole body system */
      cur = p;
    }
    return cur;
  }
  function xsMeshes(ids) {
    var set = {}; ids.forEach(function (i) { set[i] = 1; });
    var out = []; globalThis.__scn.traverse(function (m) { var id = m.isMesh && m.userData && m.userData.structureId; if (id && set[id]) out.push(m); });
    return out;
  }
  function xsBox(ms) {
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    ms.forEach(function (m) {
      m.updateWorldMatrix(true, false);
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      var b = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
      [b.min, b.max].forEach(function (v) { ['x', 'y', 'z'].forEach(function (k, i) { if (v[k] < lo[i]) lo[i] = v[k]; if (v[k] > hi[i]) hi[i] = v[k]; }); });
    });
    return { lo: lo, hi: hi };
  }
  function xsDefaultF() {
    var bb = XS.bb, c = XS.fc, i = XS.axis === 'x' ? 0 : XS.axis === 'y' ? 1 : 2, span = (bb.hi[i] - bb.lo[i]) || 1;
    var f = XS.axis === 'x' ? (c[i] - bb.lo[i]) / span : (bb.hi[i] - c[i]) / span;
    return Math.max(0.05, Math.min(0.95, f));
  }
  function xsPlane() {
    var bb = XS.bb, a = XS.axis, f = XS.f, pl = XS.plane;
    if (a === 'y') { pl.normal.set(0, -1, 0); pl.constant = bb.hi[1] + (bb.lo[1] - bb.hi[1]) * f; }     /* keeps what is below */
    else if (a === 'x') { pl.normal.set(1, 0, 0); pl.constant = -(bb.lo[0] + (bb.hi[0] - bb.lo[0]) * f); } /* keeps x above the plane */
    else { pl.normal.set(0, 0, -1); pl.constant = bb.hi[2] + (bb.lo[2] - bb.hi[2]) * f; }               /* keeps what is behind */
    try { globalThis.__r3s.get().invalidate(); } catch (e) {}
  }
  function xsLook() {      /* turn the camera to face the cut surface */
    try {
      var s = globalThis.__r3s.get(), c = s.controls; if (!c || !c.target) return;
      var d = s.camera.position.distanceTo(c.target) || 0.5, dir = XS.axis === 'y' ? [0, 0.93, 0.37] : XS.axis === 'x' ? [-0.97, 0.1, 0.22] : [0, 0.08, 1];
      if (!XS.t0) XS.t0 = c.target.y;
      var lift = (window.innerWidth < 768 ? 0.22 : 0) * d;        /* on a phone, hold the organ below the panel */
      c.target.y = XS.t0 + lift;
      s.camera.position.set(c.target.x + dir[0] * d, c.target.y + dir[1] * d, c.target.z + dir[2] * d); c.update(); s.invalidate();
    } catch (e) {}
  }
  function xsStart(id) {
    var r3 = globalThis.__r3s.get(), store = globalThis.__avStore.getState();
    XS.id = organOf(id); XS.ids = subtree(XS.id);
    var R0 = recMap(), me = R0[XS.id];
    if (me && me.side && me.parentId && R0[me.parentId] && !R0[me.parentId].side) {      /* a left kidney takes the left renal pelvis, etc. */
      subtree(me.parentId).forEach(function (k) { if (R0[k] && R0[k].side === me.side && XS.ids.indexOf(k) < 0) XS.ids.push(k); });
    }
    var ms = xsMeshes(XS.ids); if (!ms.length) return false;
    XS.bb = xsBox(ms);
    var fm = xsMeshes([id].filter(function (k) { return XS.ids.indexOf(k) >= 0; }).concat(subtree(id).filter(function (k) { return XS.ids.indexOf(k) >= 0; })));
    var fb = fm.length ? xsBox(fm) : XS.bb;
    XS.fc = [0, 1, 2].map(function (i) { return (fb.lo[i] + fb.hi[i]) / 2; });   /* start the cut through the part that was selected */
    var V = r3.camera.position.constructor; XS.plane = { normal: new V(0, 0, -1), constant: 0 };
    r3.gl.localClippingEnabled = true;
    try { store.isolate([XS.id]); store.frame([XS.id]); } catch (e) {}
    XS.saved = []; XS.raycasts = [];
    ms.forEach(function (m) {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach(function (mt) {
        var rec = { m: mt, side: mt.side, cp: mt.clippingPlanes, ob: mt.onBeforeCompile, ck: mt.customProgramCacheKey };
        XS.saved.push(rec);
        mt.clippingPlanes = [XS.plane]; mt.side = 2;
        mt.onBeforeCompile = function (sh) {
          if (rec.ob) rec.ob.apply(this, arguments);
          sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n if(!gl_FrontFacing){ gl_FragColor = vec4(mix(gl_FragColor.rgb, vec3(0.88,0.58,0.54), 0.6), 1.0); }');
        };
        mt.customProgramCacheKey = function () { return 'avx-cap'; };
        mt.needsUpdate = true;
      });
      var own = Object.prototype.hasOwnProperty.call(m, 'raycast'), orig = m.raycast, pl = XS.plane;
      XS.raycasts.push({ m: m, own: own, orig: orig });
      m.raycast = function (rc, hits) {
        var n = hits.length; orig.call(this, rc, hits);
        for (var i = hits.length - 1; i >= n; i--) if (pl.normal.dot(hits[i].point) + pl.constant < 0) hits.splice(i, 1);   /* cannot touch what is cut away */
      };
    });
    var mc = meshCounts();
    XS.parts = XS.ids.filter(function (k) { return k !== XS.id && mc[k]; });
    XS.on = 1; XS.f = xsDefaultF(); xsPlane(); xsLook();
    return true;
  }
  function xsStop() {
    if (!XS.on) return;
    XS.on = 0; XS.t0 = 0;
    XS.saved.forEach(function (r) { r.m.side = r.side; r.m.clippingPlanes = r.cp; r.m.onBeforeCompile = r.ob || function () {}; r.m.customProgramCacheKey = r.ck || function () { return ''; }; r.m.needsUpdate = true; });
    XS.raycasts.forEach(function (r) { if (r.own) r.m.raycast = r.orig; else delete r.m.raycast; });
    XS.saved = []; XS.raycasts = [];
    try { globalThis.__avStore.getState().restoreVisibility(); globalThis.__r3s.get().invalidate(); } catch (e) {}
  }
  function nameOf(id) { var r = recMap()[id]; return (r && r.name) || id; }
  function xsRender() {
    var box = $('#avx-cut'); if (!box) return;
    var pan = box.querySelector('.avx-cut-pan'), body = pan.querySelector('.avx-cut-body'), head = pan.querySelector('.avx-cut-head');
    var sel = null; try { sel = globalThis.__avStore.getState().selectedId; } catch (e) {}
    body.textContent = '';
    if (!XS.on) {
      head.textContent = 'Cross-section';
      var go = el('button', { type: 'button', class: 'avx-cut-go', text: sel ? 'Cut ' + nameOf(organOf(sel)).toLowerCase() : 'Tap an organ first' });
      if (!sel) go.disabled = true;
      go.addEventListener('click', function () { if (xsStart(sel)) { try { globalThis.__avStore.getState().select(null); } catch (e) {} xsRender(); } });
      body.appendChild(go);
      body.appendChild(el('p', { class: 'avx-cut-note', text: 'Select an organ, then cut it to see and name what is inside.' }));
      return;
    }
    head.textContent = 'Cut: ' + nameOf(XS.id);
    var done = el('button', { type: 'button', class: 'avx-cut-off', text: 'Done' });
    done.addEventListener('click', function () { xsStop(); xsRender(); });
    head.appendChild(done);
    var chips = el('div', { class: 'avx-cut-chips', role: 'group', 'aria-label': 'Cut direction' });
    [['z', 'Front to back'], ['x', 'Side to side'], ['y', 'Across']].forEach(function (x) {
      var b = el('button', { type: 'button', 'aria-pressed': XS.axis === x[0] ? 'true' : 'false', text: x[1] });
      b.addEventListener('click', function () { XS.axis = x[0]; XS.f = xsDefaultF(); xsPlane(); xsLook(); xsRender(); });
      chips.appendChild(b);
    });
    var rng = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(XS.f * 100)), 'aria-label': 'Cut position' });
    rng.addEventListener('input', function () { XS.f = +rng.value / 100; xsPlane(); });
    body.appendChild(chips); body.appendChild(rng);
    if (XS.parts.length) {
      body.appendChild(el('p', { class: 'avx-cut-note', text: 'Inside (touch one, or tap it in the view):' }));
      var list = el('div', { class: 'avx-cut-parts' });
      XS.parts.forEach(function (id) {
        var b = el('button', { type: 'button', 'aria-pressed': sel === id ? 'true' : 'false', text: nameOf(id) });
        b.addEventListener('click', function () { try { globalThis.__avStore.getState().select(id); } catch (e) {} setTimeout(xsRender, 50); });
        list.appendChild(b);
      });
      body.appendChild(list);
    } else {
      body.appendChild(el('p', { class: 'avx-cut-note', text: 'This organ is modelled as a single solid shell, so the cut face is a flat tone with no named parts inside yet.' }));
    }
  }
  function mountCut() {
    var box = $('#avx-cut');
    if (!/#\/app\/lab/.test(location.hash)) { if (box) { xsStop(); box.remove(); document.documentElement.classList.remove('avx-xs'); } return; }
    var c = $('canvas'); if (!c) return;
    var sec = c.closest('section'); if (!sec) return;
    if (box && box.parentElement !== sec) { xsStop(); box.remove(); box = null; }
    if (box) {
      var pan0 = box.querySelector('.avx-cut-pan');
      if (!pan0.hidden && !XS.on) {                       /* keep the label for the current selection fresh */
        var sel0 = null; try { sel0 = globalThis.__avStore.getState().selectedId; } catch (e) {}
        if (sel0 !== XS.lastSel) { XS.lastSel = sel0; xsRender(); }
      }
      return;
    }
    box = el('div', { id: 'avx-cut' });
    var btn = el('button', { type: 'button', class: 'avx-cut-btn', 'aria-expanded': 'false', title: 'Cross-section of the selected organ', text: 'Cut' });
    var pan = el('div', { class: 'avx-cut-pan', hidden: 'hidden' });
    var close = el('button', { type: 'button', class: 'avx-cut-x', 'aria-label': 'Close cross-section', text: '\u00d7' });
    close.addEventListener('click', function () { btn.click(); });
    pan.appendChild(close);
    pan.appendChild(el('div', { class: 'avx-cut-head' }));
    pan.appendChild(el('div', { class: 'avx-cut-body' }));
    btn.addEventListener('click', function () {
      if (pan.hidden) { pan.hidden = false; document.documentElement.classList.add('avx-xs'); btn.setAttribute('aria-expanded', 'true'); btn.classList.add('on'); xsRender(); }
      else { xsStop(); pan.hidden = true; document.documentElement.classList.remove('avx-xs'); btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('on'); }
    });
    box.appendChild(btn); box.appendChild(pan); sec.appendChild(box);
  }
  /* lessons and other pages that embed the viewer: keep the Female/Male switch small and out of the way */
  function lessonTidy(sec) {
    if (!sec) return;
    if (!$('#avux-css-l')) document.head.appendChild(el('style', { id: 'avux-css-l', text: '@media(max-width:767px){.avx-sexl{position:absolute!important;left:8px!important;right:auto!important;top:auto!important;bottom:30px!important;transform:none!important;margin:0!important;padding:2px!important;gap:2px!important;z-index:15}.avx-sexl button{min-height:34px!important;padding:3px 10px!important;font-size:12px!important}}' }));
    var fem = Array.prototype.find.call(sec.querySelectorAll('button'), function (b) { return /^\s*\u2640\s*Female\s*$/.test(b.textContent); });
    if (fem && fem.parentElement && !fem.parentElement.classList.contains('avx-sexl') && !fem.parentElement.classList.contains('avx-sex')) fem.parentElement.classList.add('avx-sexl');
  }
  /* ====================== Study panel: learn, find, name, progress ====================== */
  var ST = { open: false, tab: 'learn', latin: false, scope: 'all', q: null, mas: null, show: false, xr: null, busy: false, dots: [], raf: 0, nb: {}, att: {}, attData: null, attLoading: false, lastQ: null, seenSel: null, lastRender: 0 };
  var MASCOL = ['#e5484d', '#f5a524', '#30a46c'];
  var SKIPB = /molar|premolar|incisor|canine|sinus|air-cells|tmj|disc|cartilage|malleus|incus|stapes|sesamoid/;
  var MNEM = [
    { key: 'carpals', title: 'Carpal bones (wrist)', note: 'Proximal row (thumb side to little-finger side), then distal row.', ids: ['scaphoid', 'lunate', 'triquetrum', 'pisiform', 'trapezium', 'trapezoid', 'capitate', 'hamate'], words: ['Some', 'Lovers', 'Try', 'Positions', 'That', 'They', 'Can’t', 'Handle'], hand: true },
    { key: 'tarsals', title: 'Tarsal bones (ankle and heel)', note: 'M, I, L are the medial, intermediate and lateral cuneiforms; C is the cuboid.', ids: ['talus', 'calcaneus', 'navicular', 'medial-cuneiform', 'intermediate-cuneiform', 'lateral-cuneiform', 'cuboid'], words: ['Tiger', 'Cubs', 'Need', 'M', 'I', 'L', 'C'], foot: true },
    { key: 'cranial', title: 'Cranial bones', note: 'Occipital, parietal, frontal, temporal, ethmoid, sphenoid.', ids: ['occipital-bone', 'parietal-bone', 'frontal-bone', 'temporal-bone', 'ethmoid-bone', 'sphenoid-bone'], words: ['Old', 'People', 'From', 'Texas', 'Eat', 'Spiders'] },
    { key: 'facial', title: 'Facial bones', note: 'Vomer, inferior nasal concha, nasal, maxilla, mandible, palatine, zygomatic (the lacrimal bone is the extra one).', ids: ['vomer', 'inferior-nasal-concha', 'nasal-bone', 'maxilla', 'mandible', 'palatine-bone', 'zygomatic-bone'], words: ['Virgil', 'Can', 'Not', 'Make', 'My', 'Pet', 'Zebra'] }
  ];
  var HOOK = {
    'scaphoid': 'The most commonly fractured carpal bone. Its blood supply enters from the far end, so a fracture at the waist can lead to avascular necrosis of the near part.',
    'lunate': 'The most commonly dislocated carpal bone. A dislocation can press on the median nerve.',
    'hamate': 'Its hook can fracture in golf and racket sports, and the ulnar nerve runs beside it.',
    'pisiform': 'A sesamoid bone in the tendon of flexor carpi ulnaris, sitting on the front of the triquetrum.',
    'capitate': 'Its head sits in the socket formed by the scaphoid and lunate, making it a key landmark on wrist X-rays.',
    'trapezium': 'Its saddle joint with the first metacarpal, at the base of the thumb, is a common site of osteoarthritis.',
    'clavicle': 'The most commonly fractured bone in children. Fractures usually occur where the middle and outer thirds meet.',
    'scapula': 'Fractures are uncommon and usually mean high-energy trauma, so look for chest injuries too.',
    'humerus': 'A fracture of the surgical neck can injure the axillary nerve; a shaft fracture can injure the radial nerve.',
    'radius': 'A fracture of the lower end after a fall on an outstretched hand (Colles’ fracture) is one of the most common fractures.',
    'ulna': 'The olecranon, the point of the elbow, is often fractured by a direct blow.',
    'hip-bone': 'Three bones fused together: the ilium, ischium and pubis, which meet in the acetabulum.',
    'neck-of-femur': 'Fractures here are common in older adults and can cut off the blood supply to the head of the femur.',
    'head-of-femur': 'Most of its blood supply runs along the neck, so a fracture of the neck puts the head at risk.',
    'body-of-femur': 'Shaft fractures need major force and can bleed heavily into the thigh.',
    'patella': 'The largest sesamoid bone, held in the quadriceps tendon. It improves the pull of the quadriceps at the knee.',
    'tibia': 'The shin bone lies just under the skin, so tibial fractures are often open fractures.',
    'fibula': 'Its neck lies close to the common fibular nerve; an injury there causes foot drop.',
    'calcaneus': 'The most commonly fractured tarsal bone, usually after a fall from a height.',
    'talus': 'Much of its surface is cartilage with little blood supply, so fractures risk avascular necrosis.',
    'navicular': 'Stress fractures happen in runners and athletes.',
    'metatarsal-5': 'Fractures at its base are common foot injuries, including the Jones fracture.',
    'sternum': 'The manubrium and body meet at the sternal angle, level with the 2nd rib, a landmark for counting ribs.',
    'mandible': 'It is a ring of bone, so it is often fractured in two places.',
    'temporal-bone': 'At the pterion, a blow can tear the middle meningeal artery underneath and cause an epidural haematoma.',
    'sphenoid-bone': 'The pituitary gland sits in its sella turcica.'
  };
  function masLoad() { if (ST.mas) return ST.mas; try { ST.mas = JSON.parse(localStorage.getItem('avx-mastery') || '{}') || {}; } catch (e) { ST.mas = {}; } return ST.mas; }
  function masSave() { try { localStorage.setItem('avx-mastery', JSON.stringify(ST.mas)); } catch (e) {} }
  function masPaint() { try { S.setState({ avxMv: Date.now() }); } catch (e) {} }
  globalThis.__avMasCol = function (id) { if (!ST.show) return null; var b = masLoad()[id]; return b ? MASCOL[Math.min(b, 3) - 1] : null; };
  function baseOf(id) { return String(id || '').replace(/-(left|right)$/, ''); }
  function cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }
  function nm(id) { var r = F[id]; if (!r) return String(id); return (ST.latin && r.latinName) ? r.latinName : r.name; }
  function inScope(id) {
    var r = F[id], sc = ST.scope; if (sc === 'all') return true;
    if (sc === 'hand') return /^hand-bones/.test(r.parentId || '');
    if (sc === 'foot') return /^foot-bones/.test(r.parentId || '');
    if (sc === 'head') return r.region === 'head';
    if (sc === 'arm') return r.region === 'upper-limb' && !/^hand-bones/.test(r.parentId || '');
    if (sc === 'leg') return r.region === 'lower-limb' && !/^foot-bones/.test(r.parentId || '');
    if (sc === 'trunk') return r.region !== 'head' && r.region !== 'upper-limb' && r.region !== 'lower-limb';
    return true;
  }
  function pool() { var sc = inScene(), out = []; for (var id in sc) { var r = F[id]; if (r && r.layer === 'bones' && !SKIPB.test(id) && inScope(id)) out.push(id); } return out; }
  function pick(list) {
    var m = masLoad(), w = list.map(function (id) { var b = m[id] || 0; return id === ST.lastQ ? 0 : (b === 0 ? 3 : b === 1 ? 5 : b === 2 ? 2 : 0.5); }), tot = w.reduce(function (a, c) { return a + c; }, 0), r = Math.random() * tot;
    for (var i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; } return list[list.length - 1];
  }
  function mark(id, ok) { var m = masLoad(), b = m[id] || 0; m[id] = ok ? Math.min(3, Math.max(2, b + 1)) : 1; masSave(); masPaint(); }
  function counts() { var m = masLoad(), p = pool(), c = [0, 0, 0, 0]; p.forEach(function (id) { c[Math.min(3, m[id] || 0)]++; }); return { n: p.length, none: c[0], red: c[1], amber: c[2], green: c[3] }; }
  function silent(fn) { ST.busy = true; try { fn(); } catch (e) {} ST.busy = false; }
  function sideOfSel() { var q = S.getState().selectedId && F[S.getState().selectedId]; return (q && q.side) || lastSide || 'left'; }
  /* geometry helpers: sampled world-space vertices per mesh */
  var SAMP = new WeakMap();
  function samp(o) {
    var e = o.matrixWorld.elements, k = e.join(), c = SAMP.get(o); if (c && c.k === k) return c.a;
    var a = [], g = o.geometry; if (g && g.attributes && g.attributes.position) { var p = g.attributes.position, st2 = Math.max(1, Math.floor(p.count / 250)); for (var i = 0; i < p.count; i += st2) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i); a.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]); } }
    SAMP.set(o, { k: k, a: a }); return a;
  }
  function under(id, anc) { var g = 0; while (id && g++ < 9) { if (id === anc) return true; var r = F[id]; id = r && r.parentId; } return false; }
  function ptsOf(anc) { var out = [], n = 0; try { globalThis.__scn.updateMatrixWorld(true); globalThis.__scn.traverse(function (x) { var u = x.userData; if (x.isMesh && u && u.structureId && !/^lm_/.test(x.name) && under(u.structureId, anc)) { n++; var a = samp(x); for (var i = 0; i < a.length; i++) out.push(a[i]); } }); } catch (e) {} return { a: out, n: n }; }
  function bbox(a) { var b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (var i = 0; i < a.length; i += 3) for (var k = 0; k < 3; k++) { if (a[i + k] < b[k]) b[k] = a[i + k]; if (a[i + k] > b[k + 3]) b[k + 3] = a[i + k]; } return b; }
  function mind(a, b) { var best = 1e9; for (var i = 0; i < a.length; i += 3) for (var j = 0; j < b.length; j += 3) { var d = (a[i] - b[j]) * (a[i] - b[j]) + (a[i + 1] - b[j + 1]) * (a[i + 1] - b[j + 1]) + (a[i + 2] - b[j + 2]) * (a[i + 2] - b[j + 2]); if (d < best) best = d; } return Math.sqrt(best); }
  function nextTo(sid) {
    if (ST.nb[sid]) return ST.nb[sid]; var A = ptsOf(sid); if (!A.a.length || A.n > 40) return (ST.nb[sid] = []); var bA = bbox(A.a), M = 0.014, res = [], seen = {};
    pool0().forEach(function (id) { if (under(id, sid) || under(sid, id) || seen[id]) return; var B = ptsOf(id); if (!B.a.length) return; var bB = bbox(B.a); for (var k = 0; k < 3; k++) if (bB[k] > bA[k + 3] + M || bB[k + 3] < bA[k] - M) return; var d = mind(A.a, B.a); if (d <= M) { seen[id] = 1; res.push({ id: id, d: d }); } });
    res.sort(function (p, q) { return p.d - q.d; }); return (ST.nb[sid] = res.slice(0, 8));
  }
  function pool0() { var sc = inScene(), out = []; for (var id in sc) { var r = F[id]; if (r && r.layer === 'bones' && !SKIPB.test(id)) out.push(id); } return out; }
  globalThis.__avSt = { ST: ST, muscles: function (id) { delete ST.att[id]; return muscles(id); } };
  function loadAtt(cb) {
    if (ST.attData) return cb(); if (ST.attLoading) return; ST.attLoading = true;
    fetch('./models/muscle-attach.json').then(function (r) { return r.json(); }).then(function (j) { ST.attData = j; ST.attLoading = false; cb(); }).catch(function () { ST.attData = {}; ST.attLoading = false; cb(); });
  }
  function muscles(sid) {
    if (ST.att[sid]) return ST.att[sid]; var A = ptsOf(sid), out = { o: [], i: [], dots: [] }; if (!ST.attData) return out; if (!A.a.length || A.n > 40) return (ST.att[sid] = out);
    var bA = bbox(A.a), M = ST.M || 0.006;
    Object.keys(ST.attData).forEach(function (m) {
      ['o', 'i'].forEach(function (kind) {
        var hit = false; (ST.attData[m][kind] || []).forEach(function (p) {
          for (var k = 0; k < 3; k++) if (p[k] < bA[k] - M || p[k] > bA[k + 3] + M) return;
          if (mind(p, A.a) <= M) { hit = true; out.dots.push({ p: p, kind: kind }); }
        });
        if (hit) out[kind].push(m);
      });
    });
    return (ST.att[sid] = out);
  }
  /* dots drawn over the canvas at the origin (red) and insertion (blue) points */
  function clearDots() { ST.dots = []; var d = $('#avx-dots'); if (d) d.innerHTML = ''; if (ST.raf) { cancelAnimationFrame(ST.raf); ST.raf = 0; } }
  function setDots(list) {
    clearDots(); if (!list || !list.length) return; var c = $('canvas'), sec = c && c.closest('section'); if (!sec) return;
    var host = $('#avx-dots'); if (!host) { host = el('div', { id: 'avx-dots', 'aria-hidden': 'true' }); sec.appendChild(host); }
    ST.dots = list.map(function (d) { var e = el('i', { class: 'avx-dot ' + (d.kind === 'o' ? 'o' : 'i') }); host.appendChild(e); return { p: d.p, e: e }; });
    var loop = function () {
      if (!ST.dots.length) return; try {
        var s3 = globalThis.__r3s.get(), cam = s3.camera, W = c.clientWidth, Hh = c.clientHeight, cr = c.getBoundingClientRect(), sr = sec.getBoundingClientRect(), V = cam.matrixWorldInverse.elements, P = cam.projectionMatrix.elements;
        ST.dots.forEach(function (d) {
          var x = d.p[0], y = d.p[1], z = d.p[2], vx = V[0] * x + V[4] * y + V[8] * z + V[12], vy = V[1] * x + V[5] * y + V[9] * z + V[13], vz = V[2] * x + V[6] * y + V[10] * z + V[14];
          var cx = P[0] * vx + P[4] * vy + P[8] * vz + P[12], cy = P[1] * vx + P[5] * vy + P[9] * vz + P[13], cw = P[3] * vx + P[7] * vy + P[11] * vz + P[15];
          if (cw <= 0) { d.e.style.display = 'none'; return; } var nx = cx / cw, ny = cy / cw;
          if (nx < -1 || nx > 1 || ny < -1 || ny > 1) { d.e.style.display = 'none'; return; }
          d.e.style.display = 'block'; d.e.style.left = (cr.left - sr.left + (nx * 0.5 + 0.5) * W) + 'px'; d.e.style.top = (cr.top - sr.top + (-ny * 0.5 + 0.5) * Hh) + 'px';
        });
      } catch (e) {} ST.raf = requestAnimationFrame(loop);
    };
    ST.raf = requestAnimationFrame(loop);
  }
  /* ---- rendering ---- */
  function chip(txt, on, fn, extra) { var b = el('button', { type: 'button', 'aria-pressed': on ? 'true' : 'false', text: txt }); if (extra) b.className = extra; b.addEventListener('click', fn); return b; }
  function resolveWord(ids, i, side) { var base = ids[i], c = [base + '-' + side, base, base + '-left', base + '-right']; for (var k = 0; k < c.length; k++) if (F[c[k]]) return c[k]; return null; }
  function mnemFor(sid) {
    var b = baseOf(sid), r = F[sid]; var res = [];
    MNEM.forEach(function (m) { var hit = m.ids.indexOf(b) >= 0 || (m.hand && /^hand-bones/.test(sid)) || (m.foot && /^foot-bones/.test(sid)) || (r && r.parentId && ((m.hand && /^hand-bones/.test(r.parentId)) || (m.foot && /^foot-bones/.test(r.parentId)))); if (hit) res.push(m); });
    return res;
  }
  function mnemBlock(m, side) {
    var box = el('div', { class: 'avx-st-m' }); box.appendChild(el('div', { class: 'avx-st-h', text: m.title }));
    var row = el('div', { class: 'avx-st-w' });
    m.words.forEach(function (w, i) { var id = resolveWord(m.ids, i, side), b = el('button', { type: 'button', text: w, title: id ? nm(id) : w }); if (id) b.addEventListener('click', function () { silent(function () { S.getState().select(id); }); renderStudy(); }); else b.disabled = true; row.appendChild(b); });
    box.appendChild(row); box.appendChild(el('div', { class: 'avx-st-n', text: m.note })); return box;
  }
  function learnView(body) {
    var sid = S.getState().selectedId, r = sid && F[sid];
    if (!r || r.layer !== 'bones') {
      body.appendChild(el('div', { class: 'avx-st-n', text: 'Tap a bone to see its memory aid, a clinical fact, the bones next to it and the muscles that attach to it. Or tap a word below to find that bone.' }));
      MNEM.forEach(function (m) { body.appendChild(mnemBlock(m, sideOfSel())); }); clearDots(); return;
    }
    body.appendChild(el('div', { class: 'avx-st-h', text: nm(sid) + (F[sid].latinName && !ST.latin ? '  ·  ' + F[sid].latinName : '') }));
    var hook = HOOK[baseOf(sid)] || HOOK[sid] || (r.parentId && (HOOK[baseOf(r.parentId)])); if (hook) body.appendChild(el('div', { class: 'avx-st-k' }, [el('b', { text: 'Clinical: ' }), el('span', { text: hook })]));
    mnemFor(sid).forEach(function (m) { body.appendChild(mnemBlock(m, F[sid].side || sideOfSel())); });
    var nb = nextTo(sid); if (nb.length) { body.appendChild(el('div', { class: 'avx-st-h2', text: 'Next to it' })); var rw = el('div', { class: 'avx-st-w' }); nb.forEach(function (x) { var b = el('button', { type: 'button', text: nm(x.id) }); b.addEventListener('click', function () { silent(function () { S.getState().select(x.id); }); renderStudy(); }); rw.appendChild(b); }); body.appendChild(rw); }
    var mu = muscles(sid);
    if (!ST.attData) { body.appendChild(el('div', { class: 'avx-st-n', text: 'Loading muscle attachments…' })); loadAtt(renderStudy); }
    else if (mu.o.length || mu.i.length) {
      var nmM = function (m) { return (F[m] && F[m].name) || m; };
      if (mu.o.length) body.appendChild(el('div', { class: 'avx-st-a' }, [el('i', { class: 'avx-dot o inl' }), el('b', { text: ' Muscles that start here (approx.): ' }), el('span', { text: mu.o.map(nmM).join(', ') })]));
      if (mu.i.length) body.appendChild(el('div', { class: 'avx-st-a' }, [el('i', { class: 'avx-dot i inl' }), el('b', { text: ' Muscles that end here (approx.): ' }), el('span', { text: mu.i.map(nmM).join(', ') })]));
      body.appendChild(el('div', { class: 'avx-st-n', text: 'Red and blue dots on the model mark where these muscles start and end on this bone (taken from the model’s muscle ends).' }));
      setDots(mu.dots);
    } else { clearDots(); }
  }
  function options(id) {
    var r = F[id], same = pool0().filter(function (x) { return x !== id && F[x] && ((F[x].parentId && F[x].parentId === r.parentId) || F[x].region === r.region) && baseOf(x) !== baseOf(id); });
    same.sort(function () { return Math.random() - 0.5; }); var o = [id].concat(same.slice(0, 3)); if (o.length < 4) { var any = pool0().filter(function (x) { return o.indexOf(x) < 0 && baseOf(x) !== baseOf(id); }).sort(function () { return Math.random() - 0.5; }); o = o.concat(any.slice(0, 4 - o.length)); }
    var seenN = {}; o = o.filter(function (x) { var n = nm(x).replace(/^(Left|Right) /, ''); if (seenN[n] && x !== id) return false; seenN[n] = 1; return true; });
    return o.sort(function () { return Math.random() - 0.5; });
  }
  function nextQ() {
    var p = pool(); if (!p.length) { ST.q = null; return renderStudy(); }
    var id = pick(p); ST.lastQ = id; ST.q = { id: id, done: false, msg: '', ok: null, opts: ST.tab === 'name' ? options(id) : null };
    silent(function () { var s0 = S.getState(); if (ST.tab === 'name') { if (ST.xr === null) ST.xr = !!s0.xray; s0.setXray(true); s0.select(id); s0.frame([id]); } else { s0.select(null); } });
    renderStudy();
  }
  function quizView(body) {
    var c = counts(); body.appendChild(el('div', { class: 'avx-st-n', text: c.green + ' known, ' + c.amber + ' learning, ' + c.red + ' to review, ' + c.none + ' new (of ' + c.n + ')' }));
    var scope = el('select', { 'aria-label': 'Which bones to practise' }); [['all', 'All bones'], ['head', 'Skull and face'], ['arm', 'Arm and shoulder'], ['hand', 'Hand'], ['leg', 'Leg and hip'], ['foot', 'Foot'], ['trunk', 'Trunk']].forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); if (ST.scope === o[0]) op.selected = true; scope.appendChild(op); });
    scope.addEventListener('change', function () { ST.scope = scope.value; ST.q = null; nextQ(); }); body.appendChild(scope);
    if (!ST.q) { var go = el('button', { type: 'button', class: 'avx-cut-go', text: ST.tab === 'find' ? 'Start finding' : 'Start naming' }); go.addEventListener('click', nextQ); body.appendChild(go); return; }
    var q = ST.q;
    if (ST.tab === 'find') {
      body.appendChild(el('div', { class: 'avx-st-q', text: 'Tap the ' + nm(q.id) })); if (q.msg) body.appendChild(el('div', { class: q.ok ? 'avx-st-ok' : 'avx-st-bad', text: q.msg }));
      if (!q.done) { var sk = el('button', { type: 'button', class: 'avx-st-s', text: 'Skip' }); sk.addEventListener('click', nextQ); body.appendChild(sk); }
    } else {
      body.appendChild(el('div', { class: 'avx-st-q', text: 'Which bone is highlighted?' }));
      var rw = el('div', { class: 'avx-st-w' }); q.opts.forEach(function (id) { var b = el('button', { type: 'button', text: cap(nm(id).replace(/^(Left|Right) /, '')) }); b.disabled = q.done; if (q.done && id === q.id) b.classList.add('ok'); b.addEventListener('click', function () { if (q.done) return; q.done = true; q.ok = id === q.id || baseOf(id) === baseOf(q.id) && false; q.ok = id === q.id; mark(q.id, q.ok); q.msg = q.ok ? 'Correct.' : 'It is the ' + cap(nm(q.id).replace(/^(Left|Right) /, '')) + '.'; renderStudy(); }); rw.appendChild(b); }); body.appendChild(rw);
      if (q.msg) body.appendChild(el('div', { class: q.ok ? 'avx-st-ok' : 'avx-st-bad', text: q.msg }));
    }
    if (q.done) { var nx = el('button', { type: 'button', class: 'avx-cut-go', text: 'Next' }); nx.addEventListener('click', nextQ); body.appendChild(nx); }
  }
  function mineView(body) {
    var c = counts(); body.appendChild(el('div', { class: 'avx-st-n', text: 'Your bones: ' + c.n + ' in the model.' }));
    var leg = el('div', { class: 'avx-st-leg' }); [['#30a46c', c.green + ' known'], ['#f5a524', c.amber + ' learning'], ['#e5484d', c.red + ' to review'], ['#8a93a6', c.none + ' new']].forEach(function (x) { leg.appendChild(el('span', {}, [el('i', { style: 'background:' + x[0] }), el('em', { text: x[1] })])); }); body.appendChild(leg);
    var t = chip(ST.show ? 'Colouring bones by progress: on' : 'Colour bones by progress', ST.show, function () { ST.show = !ST.show; masPaint(); renderStudy(); }, 'avx-st-t'); body.appendChild(t);
    body.appendChild(el('div', { class: 'avx-st-n', text: 'Green, amber and red appear on the bones you have practised; bones you have not practised keep their normal colour. Nothing is hidden.' }));
    var lt = chip('Names in Latin where available', ST.latin, function () { ST.latin = !ST.latin; renderStudy(); }, 'avx-st-t'); body.appendChild(lt);
    var rs = el('button', { type: 'button', class: 'avx-st-s', text: 'Reset my progress' }); rs.addEventListener('click', function () { if (confirm('Reset all your progress?')) { ST.mas = {}; masSave(); masPaint(); renderStudy(); } }); body.appendChild(rs);
  }
  function renderStudy() {
    var pan = $('#avx-study .avx-study-pan'); if (!pan || pan.hidden) return;
    var head = pan.querySelector('.avx-cut-head'), body = pan.querySelector('.avx-cut-body'); head.textContent = ''; body.textContent = '';
    var tabs = el('div', { class: 'avx-cut-chips' }); [['learn', 'Learn'], ['find', 'Find'], ['name', 'Name'], ['mine', 'Mine']].forEach(function (t) { tabs.appendChild(chip(t[1], ST.tab === t[0], function () { setTab(t[0]); })); }); head.appendChild(tabs);
    html().classList.toggle('avx-sq', ST.tab === 'find' || ST.tab === 'name');
    if (ST.tab === 'learn') learnView(body); else { clearDots(); if (ST.tab === 'mine') mineView(body); else quizView(body); }
  }
  function html() { return document.documentElement; }
  function setTab(t) {
    if (ST.tab === 'name' && t !== 'name') silent(function () { if (ST.xr !== null) { S.getState().setXray(ST.xr); ST.xr = null; } });
    ST.tab = t; ST.q = null; if (t !== 'name' && t !== 'find') silent(function () { }); renderStudy();
  }
  function studyOnSel(s) {
    if (!ST.open || ST.busy) return; var id = s.selectedId;
    if (ST.tab === 'find' && ST.q && !ST.q.done && id && id !== ST.seenSel) {
      ST.seenSel = id; var q = ST.q, ok = id === q.id; q.done = true; q.ok = ok; mark(q.id, ok);
      q.msg = ok ? 'Correct: ' + nm(q.id) + '.' : 'That is the ' + cap(nm(id).replace(/^(Left|Right) /, '')) + '. The ' + cap(nm(q.id).replace(/^(Left|Right) /, '')) + ' is highlighted now.';
      if (!ok) silent(function () { s.select(q.id); s.frame([q.id]); }); renderStudy(); return;
    }
    if (ST.tab === 'learn') { if (id !== ST.seenSel) { ST.seenSel = id; clearTimeout(ST.lt); ST.lt = setTimeout(renderStudy, 150); } }
  }
  function studyClose() {
    var box = $('#avx-study'); if (!box) return; var pan = box.querySelector('.avx-study-pan'), btn = box.querySelector('.avx-study-btn'); pan.hidden = true; ST.open = false; btn.setAttribute('aria-expanded', 'false'); clearDots();
    html().classList.remove('avx-st', 'avx-sq'); silent(function () { if (ST.xr !== null) { S.getState().setXray(ST.xr); ST.xr = null; } });
  }
  function mountStudy() {
    var box = $('#avx-study');
    if (!/#\/app\/lab/.test(location.hash)) { if (box) { studyClose(); box.remove(); } return; }
    var c = $('canvas'); if (!c) return; var sec = c.closest('section'); if (!sec) return;
    if (box && box.parentElement !== sec) { studyClose(); box.remove(); box = null; }
    if (box) return;
    box = el('div', { id: 'avx-study' });
    var btn = el('button', { type: 'button', class: 'avx-cut-btn avx-study-btn', 'aria-expanded': 'false', title: 'Study tools: memory aids, find-the-bone practice and progress', text: 'Study' });
    var pan = el('div', { class: 'avx-cut-pan avx-study-pan', hidden: 'hidden', role: 'region', 'aria-label': 'Study' });
    var close = el('button', { type: 'button', class: 'avx-cut-x', 'aria-label': 'Close study tools', text: '×' }); close.addEventListener('click', studyClose);
    var mn = el('button', { type: 'button', class: 'avx-cut-x avx-st-mn', 'aria-label': 'Shrink or expand study tools', text: '\u2013' }); mn.addEventListener('click', function () { pan.classList.toggle('min'); mn.textContent = pan.classList.contains('min') ? '+' : '\u2013'; });
    pan.appendChild(close); pan.appendChild(mn); pan.appendChild(el('div', { class: 'avx-cut-head' })); pan.appendChild(el('div', { class: 'avx-cut-body avx-st-body' }));
    btn.addEventListener('click', function () { if (!pan.hidden) return; try { if (XS.on) xsStop(); } catch (e) {} pan.hidden = false; ST.open = true; ST.seenSel = null; btn.setAttribute('aria-expanded', 'true'); html().classList.add('avx-st'); renderStudy(); });
    box.appendChild(btn); box.appendChild(pan); sec.appendChild(box);
  }
  function tick() {
    if (!globalThis.__avStore) return; S = globalThis.__avStore; F = globalThis.__avF; if (!subDone) { subDone = true; try { S.subscribe(function (s) { var q = s.selectedId && F[s.selectedId]; if (q && q.side) lastSide = q.side; try { studyOnSel(s); } catch (e) {} }); } catch (e) {} }
    if (!DEF) DEF = { layerVisible: Object.assign({}, st().layerVisible), layerOpacity: Object.assign({}, st().layerOpacity) };
    var onLab = /#\/app\/lab/.test(location.hash), c = $('canvas'), sec = c && c.closest('section'), row = sec && sec.parentElement;
    var bar = $('#avux');
    if (!onLab) document.documentElement.classList.remove('avx-rail', 'avx-sheet-open');
    document.documentElement.classList.toggle('avx-onlab', onLab); if (!onLab) Array.prototype.forEach.call(document.querySelectorAll('div[style*="position: fixed"]'), function (d) { if (/Drag the title bar/.test(d.textContent || '') && d.style.display !== 'none') d.style.setProperty('display', 'none', 'important'); });
    if (!onLab) { try { lessonTidy(sec); } catch (e) {} }
    if (!onLab || !row) { if (bar) { bar.remove(); B = {}; mounted = null; } var fb = $('#avux-fab'); if (fb) fb.remove(); var nv = $('#avux-nav'); if (nv) nv.remove(); document.documentElement.classList.remove('avx-nav'); closeSheet(); return; }
    mountFab(); markMobile(sec); applyRail(); mountNav(); try { labHeading(); } catch (e) {} try { mountScroll(); } catch (e) {} try { mountScrollX(); } catch (e) {} try { mountCut(); } catch (e) {} try { mountStudy(); } catch (e) {} try { fitPlaceholders(); } catch (e) {}
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

  /* Structures whose 3D parts only load when a layer is on (brain vessels, CSF, meninges, tracts, fossae, detailed brain):
     picking one from the list switches that layer on, then re-aims the camera once the part has loaded. */
  var GATES = {"ld_brain":["brain","cerebellum","cerebral-aqueduct","cerebral-arterial-circle","deep-cerebral-structures","fourth-ventricle","frontal-lobe","hippocampus","hypothalamus","insula","lateral-ventricle","medulla-oblongata","midbrain","occipital-lobe","parietal-lobe","pituitary-gland","pons","spinal-cord","temporal-lobe","third-ventricle"],"vessels":["anterior-cerebral-artery","anterior-choroidal-artery","anterior-inferior-cerebellar-artery","anterior-spinal-artery","basilar-artery","cavernous-sinus","cerebral-capillary-bed","great-cerebral-vein","inferior-sagittal-sinus","internal-carotid-artery","internal-cerebral-veins","internal-jugular-vein","middle-cerebral-artery","ophthalmic-artery","petrosal-sinuses","pontine-arteries","posterior-cerebral-artery","posterior-choroidal-arteries","posterior-inferior-cerebellar-artery","sigmoid-sinus","straight-sinus","superficial-cerebral-veins","superior-cerebellar-artery","superior-sagittal-sinus","thalamic-perforating-arteries","transverse-sinus","vertebral-artery"],"csf":["arachnoid-granulations","choroid-plexus","subarachnoid-cisterns","subarachnoid-space"],"fossae":["anterior-cranial-fossa","calvaria","middle-cranial-fossa","posterior-cranial-fossa"],"tracts":["corticospinal-tract","dorsal-column-medial-lemniscus-pathway","spinothalamic-tract"],"mening":["arachnoid-mater","dura-mater","pia-mater"]}, gateOf = {}; Object.keys(GATES).forEach(function (g) { GATES[g].forEach(function (id) { gateOf[id] = g; }); });
  var gLast = '';
  function hasMesh(id) { var scn = globalThis.__scn, f = false; if (!scn) return false; scn.traverse(function (m) { if (f || !m.isMesh) return; for (var p = m; p; p = p.parent) { if (p.userData && p.userData.structureId === id) { f = true; return; } } }); return f; }
  function gateSel() {
    var st = function () { return globalThis.__avStore.getState(); };
    var id = st().selectedId || ''; if (id === gLast) return; gLast = id; var g = gateOf[id]; if (!g || !globalThis.__avb) return;
    if (hasMesh(id)) return;
    var cur = globalThis.__avb.get(); var set = {}; set[g] = true; globalThis.__avb.set(set);
    var n = 0, h = setInterval(function () { n++; if (st().selectedId !== id) { clearInterval(h); return; } if (hasMesh(id) || n > 40) { clearInterval(h); if (hasMesh(id)) { try { st().focusStructure(id); } catch (e) {} } } }, 400);
  }
  var iv = setInterval(function () { if (globalThis.__avStore) { clearInterval(iv); wrapHover(); globalThis.__avStore.subscribe(function () { try { gateSel(); } catch (e) {} }); wrapSex(); restoreSel(); globalThis.__avStore.subscribe(soon); tick(); } }, 200);
})();
