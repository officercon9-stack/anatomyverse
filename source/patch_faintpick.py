import glob,sys
p=glob.glob('live28/assets/AnatomyViewer-*.js')[0]
s=open(p).read(); n0=len(s)

# 1. helper: deferred "soft" pick, applied only if no solid pick happened in the same click
old="function xt({name:e,structureId:t,geometry:n,color:r,baseOpacity:i=1,doubleSide:a,unmapped:o,fixedOpacity:c}){"
new=("var _fbT=0,_fbQ=null;function _fbSoft(_i,_x,_y,_sel){if(_fbQ)return;let _q={i:_i,x:_x,y:_y,sel:_sel,t:performance.now()};"
     "_fbQ=_q;setTimeout(()=>{_fbQ=null;if(_fbT>=_q.t)return;globalThis.__lcp=[_q.x,_q.y];_q.sel(_q.i)},0)}\n"+old)
assert s.count(old)==1; s=s.replace(old,new)

# 2. compute `faint`: visible, below the pick threshold by its own design (not user-dimmed, not ghosted, not x-rayed)
old=("return s&&Object.assign(n,{opacity:Math.min(n.opacity,.4)}),{chamberGlass:s,visible:n.visible,"
     "opacity:Math.round(n.opacity*100)/100,pickable:n.pickable,")
new=("s&&Object.assign(n,{opacity:Math.min(n.opacity,.4)});"
     "let _lo=e.layerOpacity&&e.layerOpacity[w[t]?.layer??`organs`],"
     "_fp=!o&&n.visible&&!n.pickable&&!n.ghosted&&n.opacity>.02&&(_lo==null||_lo>=.35)&&!(e.xray&&r&&!a);"
     "return{chamberGlass:s,visible:n.visible,faint:_fp,"
     "opacity:Math.round(n.opacity*100)/100,pickable:n.pickable,")
assert s.count(old)==1; s=s.replace(old,new)

# 3. let faint meshes be hit by the ray
old="raycast:m.pickable?s.prototype.raycast:mt,"
new="raycast:m.pickable||m.faint?s.prototype.raycast:mt,"
assert s.count(old)==1; s=s.replace(old,new)

# 4. click: solid wins outright; faint is held back and used only if nothing solid took the click
old="onClick:e=>{!m.pickable||e.delta>5||(e.stopPropagation(),globalThis.__lcp=[e.nativeEvent.clientX,e.nativeEvent.clientY],f(t))},"
new=("onClick:e=>{if(e.delta>5)return;if(m.pickable){e.stopPropagation(),_fbT=performance.now(),"
     "globalThis.__lcp=[e.nativeEvent.clientX,e.nativeEvent.clientY],f(t);return}"
     "m.faint&&_fbSoft(t,e.nativeEvent.clientX,e.nativeEvent.clientY,f)},")
assert s.count(old)==1; s=s.replace(old,new)

# 5. a faint mesh never set the hover, so it must not clear it either
old="onPointerOut:()=>p(null),"
new="onPointerOut:()=>{m.pickable&&p(null)},"
assert s.count(old)==1; s=s.replace(old,new)

open(p,'w').write(s)
print("patched %s  (+%d bytes)"%(p.split('/')[-1],len(s)-n0))
