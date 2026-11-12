"""Audit repairs: retinal vein beside (not around) the artery; honest label for the tract diagrams; region
metadata; faint body outline kept while a structure is isolated."""
import re,glob
vf=glob.glob('assets/AnatomyViewer-*.js')[0];v=open(vf).read()
a="make:t=>J([[e*.0305,1.5862,.0608],[e*.0275,1.5878,.0465],[e*.024,1.5895,.038]],.0017,t,12)"
assert v.count(a)==1;v=v.replace(a,"make:t=>J([[e*.0305,1.5842,.0608],[e*.0275,1.5856,.0465],[e*.024,1.5873,.038]],.0017,t,12)")
g="_skGhost&&Object.assign(n,{opacity:Math.min(n.opacity,.12),pickable:!1});"
assert v.count(g)==1;v=v.replace(g,g+"let _skIso=w[t]?.layer===`skin`&&e.isolated&&e.isolated.length&&!e.isolated.includes(t)&&e.layerVisible?.skin!==!1&&(!_sexOf(t)||_sexOf(t)===e.sex);_skIso&&Object.assign(n,{visible:!0,opacity:.07,pickable:!1});")
open(vf,'w').write(v)
mf=glob.glob('assets/assetManifest-*.js')[0];s=open(mf).read()
i=s.index('{"id": "bodyparts3d-brain-tracts"');j=s.index('"description"',i);seg=s[i:j]
new='{"id": "bodyparts3d-brain-tracts", "name": "Brain and spinal cord tracts (pathway diagrams)", "kind": "gltf", "url": "./models/bodyparts3d-brain-tracts.glb", "fidelity": "schematic", "license": "Original generated geometry \\u2014 3D Anatomy", "attribution": "Generated pathway diagrams by 3D Anatomy (not scans and not from BodyParts3D): they show the route and crossing level of each tract, continued along the limb nerves to show the whole pathway. Approximation pending expert review.", '
s=s[:i]+new+s[j:]
def setreg(sid,reg):
    global s
    i=s.index('{id:`%s`'%sid);m=re.compile(r'region:`[a-z-]+`').search(s,i);assert m.start()-i<6000;s=s[:m.start()]+'region:`%s`'%reg+s[m.end():]
n=0
# Shoulder-girdle and iliopsoas muscles keep region upper-limb / lower-limb on purpose: the limb views use it.
for sid in ('corticospinal-tract','dorsal-column-medial-lemniscus-pathway','spinothalamic-tract'):
    if '{id:`%s`'%sid in s:setreg(sid,'whole-body');n+=1
open(mf,'w').write(s);print('regions changed',n)
