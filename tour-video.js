/* Video tour: adds "Watch the video tour" to the Quick tour card and to the View tools sheet. */
(function () {
  'use strict';
  var SRC = new URL('./tour.mp4', document.baseURI).href;
  var css = document.createElement('style');
  css.textContent = '#avtv{position:fixed;inset:0;z-index:2147483000;background:rgba(5,10,25,.88);display:flex;align-items:center;justify-content:center;padding:12px}' +
    '#avtv .bx{width:100%;max-width:960px;background:#0f2149;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.6)}' +
    '#avtv header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;color:#fff;font:600 16px system-ui,sans-serif}' +
    '#avtv header button{background:#fff;color:#0f2149;border:0;border-radius:8px;padding:8px 14px;font:600 14px system-ui,sans-serif;cursor:pointer}' +
    '#avtv video{display:block;width:100%;max-height:75vh;background:#000}' +
    '.avtv-btn{margin-top:8px;margin-right:8px}';
  document.head.appendChild(css);
  function close() { var d = document.getElementById('avtv'); if (d) { var v = d.querySelector('video'); try { v.pause(); } catch (e) {} d.remove(); } document.removeEventListener('keydown', esc); }
  function esc(e) { if (e.key === 'Escape') close(); }
  function open() {
    close();
    var d = document.createElement('div'); d.id = 'avtv'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Video tour');
    d.onclick = function (e) { if (e.target === d) close(); };
    var bx = document.createElement('div'); bx.className = 'bx';
    var h = document.createElement('header'); var t = document.createElement('span'); t.textContent = 'Video tour (50 seconds)';
    var x = document.createElement('button'); x.type = 'button'; x.textContent = 'Close'; x.onclick = close; h.appendChild(t); h.appendChild(x);
    var v = document.createElement('video'); v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'metadata'; v.src = SRC;
    v.onerror = function () { t.textContent = 'The video could not be loaded. Check your connection and try again.'; };
    bx.appendChild(h); bx.appendChild(v); d.appendChild(bx); document.body.appendChild(d);
    document.addEventListener('keydown', esc); x.focus();
  }
  function patch() {
    var notes = document.querySelectorAll('div[role=note]');
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      if (!/touch and explore/i.test(n.textContent) || n.querySelector('.avtv-btn')) continue;
      var got = Array.prototype.find.call(n.querySelectorAll('button'), function (b) { return /^\s*got it\s*$/i.test(b.textContent); });
      if (!got) continue;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'av-btn av-btn--sm avtv-btn'; b.textContent = 'Watch the video tour';
      b.onclick = open; n.insertBefore(b, got);
    }
    var tl = document.querySelector('#avux-sheet .tl');
    if (tl && !tl.querySelector('.avtv-tile')) {
      var tile = Array.prototype.find.call(tl.querySelectorAll('button'), function (x) { return /quick tour/i.test(x.textContent); }) || tl.querySelector('button:last-child');
      var c = tile ? tile.cloneNode(true) : null;
      if (c) { c.classList.add('avtv-tile'); if (c.lastChild.nodeType === 3) c.lastChild.textContent = 'Video tour'; c.removeAttribute('aria-disabled'); c.onclick = function () { var s = document.getElementById('avux-sheet'); if (s) s.remove(); open(); }; tl.appendChild(c); }
    }
  }
  var q = 0; new MutationObserver(function () { if (q) return; q = setTimeout(function () { q = 0; try { patch(); } catch (e) {} }, 120); }).observe(document.documentElement, { childList: true, subtree: true });
})();
