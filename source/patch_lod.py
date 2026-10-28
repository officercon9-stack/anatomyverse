import sys,re
R="live28/assets/"
a=R+"AnatomyViewer-C5q0xwNu-b47.js"; s=open(a).read()
o="n=m(kt,e.url,e=>e.setMeshoptDecoder(oe))"
n="n=m(kt,(D.getState().lowPower?e.url.replace(`./models/`,`./models/lite/`):e.url)+`?v=lod1`,e=>e.setMeshoptDecoder(oe))"
assert s.count(o)==1; s=s.replace(o,n)
o="(e.gate?_g[e.gate]:t&&!_lpQ)"; assert s.count(o)==1; s=s.replace(o,"(e.gate?_g[e.gate]:t)")
open(a,"w").write(s)
i=R+"index-DAxCahJm-b47.js"; s=open(i).read()
o="return e!==void 0&&e<=4||/Mobi|Android/i.test(navigator.userAgent)}"
n=("let t=/Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)||navigator.platform===`MacIntel`&&navigator.maxTouchPoints>1,"
   "r=navigator.hardwareConcurrency,c=typeof matchMedia==`function`&&matchMedia(`(pointer:coarse)`).matches;"
   "return e!==void 0&&e<=4||t||c||r!==void 0&&r<=4}")
assert s.count(o)==1; s=s.replace(o,n); open(i,"w").write(s)
