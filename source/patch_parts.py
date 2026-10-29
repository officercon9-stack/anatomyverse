import glob,re
A=glob.glob('live28/assets/AnatomyViewer-*.js')[0]; s=open(A).read()
L=glob.glob('live28/assets/LabPage-*.js')[0]; t=open(L).read()

# --- 3D: a distinct colour per part while a structure is isolated ---
helper=("var _avPal=['#e07a5f','#3d9bd1','#e9c46a','#6bbf8a','#b57edc','#f28cb1','#4fb5b0','#d98f3e','#7f8fe0','#a3c45c','#d1635f','#58a6d9'];"
        "globalThis.__avTint=_i=>{if(/molar|premolar|incisor|canine|tooth/.test(_i))return'#f4efe2';let _h=0;for(let _c=0;_c<_i.length;_c++)_h=(_h*31+_i.charCodeAt(_c))>>>0;return _avPal[_h%_avPal.length]};\n")
old="var _fbT=0,_fbQ=null;"
assert s.count(old)==1; s=s.replace(old,helper+old)

old="return{chamberGlass:s,visible:n.visible,faint:_fp,"
new="return{chamberGlass:s,tint:e.isolated&&e.isolated.length&&!e.isolated.includes(t)&&e.isolated.some(_i=>E(t,_i,w))?globalThis.__avTint(t):null,visible:n.visible,faint:_fp,"
assert s.count(old)==1; s=s.replace(old,new)

old="(0,A.jsx)(`meshStandardMaterial`,{color:r,"
new="(0,A.jsx)(`meshStandardMaterial`,{color:m.tint||r,"
assert s.count(old)==1; s=s.replace(old,new)
open(A,'w').write(s)

# --- panel: "Parts" chips at the top, coloured like the 3D parts; drop the duplicate "Contains" further down ---
old="(0,X.jsxs)(`dl`,{className:`flex flex-col gap-3`,children:[(0,X.jsx)(Z,{label:`Description`,children:n.description}),"
new=("L.length>0&&(0,X.jsxs)(`section`,{children:[(0,X.jsxs)(`h3`,{className:`av-section-title mb-2`,children:[`Parts (`,L.length,`)`]}),"
     "(0,X.jsx)(`div`,{className:`flex flex-wrap gap-1.5`,children:L.map(e=>(0,X.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:5},children:["
     "p.isolated?.includes(n.id)&&(0,X.jsx)(`span`,{'aria-hidden':!0,style:{width:9,height:9,borderRadius:99,background:globalThis.__avTint?.(e),flex:`none`}}),"
     "(0,X.jsx)(we,{id:e,onPick:t})]},e))})]}),"+old)
assert t.count(old)==1; t=t.replace(old,new)

old=("L.length>0&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(`span`,{className:`text-xs text-[var(--av-text-faint)]`,children:`Contains`}),"
     "L.map(e=>(0,X.jsx)(we,{id:e,onPick:t},e))]})")
assert t.count(old)==1; t=t.replace(old,"null")
old="(n.parentId||L.length>0)&&(0,X.jsxs)(`section`,{children:[(0,X.jsx)(`h3`,{className:`av-section-title mb-2`,children:`Hierarchy`})"
assert t.count(old)==1; t=t.replace(old,"n.parentId&&(0,X.jsxs)(`section`,{children:[(0,X.jsx)(`h3`,{className:`av-section-title mb-2`,children:`Hierarchy`})")
open(L,'w').write(t)
print('patched')
