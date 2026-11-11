"""Wire the fitted skins into the compiled app (manifest + viewer). Run from the repo root: python3 patch_app.py . bNNN"""
import sys,glob,json,subprocess,re
ROOT,NEW=sys.argv[1],sys.argv[2]
M=glob.glob(ROOT+'/assets/assetManifest-*.js')[0];V=glob.glob(ROOT+'/assets/AnatomyViewer-*.js')[0]
m=open(M,encoding='utf-8').read();v=open(V,encoding='utf-8').read()
parts=['skin_head','skin_neck','skin_torso','skin_torso_female','hair_male','hair_female','skin_breast_L','skin_breast_R']+['skin_%s_%s'%(p,s) for p in('arm','forearm','hand','thigh','leg','foot') for s in 'LR']
if 'hubmap-skin-male' not in m:
    ents=[]
    for name,who,doi in (('male','Male','https://doi.org/10.48539/HBM369.SBSP.863'),('female','Female','https://doi.org/10.48539/HBM466.LKPQ.876')):
        ents.append(json.dumps({"id":"hubmap-skin-"+name,"name":"Body surface, %s (HuBMAP / NLM Visible Human)"%name,"kind":"gltf","url":"./models/hubmap-skin-%s.glb"%name,"fidelity":"anatomical","license":"CC BY 4.0 - HuBMAP CCF 3D Reference Library (NLM Visible Human %s)"%who,"attribution":"HuBMAP CCF 3D Reference Object Library, 3D Reference Organ for Skin, %s (Kristen Browne, Heidi Schlehlein), CC BY 4.0 (https://github.com/hubmapconsortium/ccf-releases). Modified: re-posed and scaled to this app's skeleton and pushed outward where muscles protruded; simplified."%who,"description":"Whole-body skin surface from the Visible Human %s, re-posed to this app's skeleton. The pose, proportions and local thickness were changed to fit; it is not a measurement of any person."%who,"objectMap":{"skin_body_"+name:"skin"}}))
    a='"hm_ovary_r": "ovary"}},';assert m.count(a)==1
    m=m.replace(a,a+','.join(ents)+',')
    a='{assetId:`hubmap-female-repro`,';assert m.count(a)==1
    ov=''.join('{assetId:`hubmap-skin-%s`,replacesParts:[%s]},'%(n,','.join('`%s`'%p for p in parts)) for n in('male','female'))
    m=m.replace(a,ov+a)
    open(M,'w',encoding='utf-8').write(m)
if 'hubmap-skin-male' not in v:
    a='&&!o[e.assetId]&&T[e.assetId]),[_mn,_smn]';assert v.count(a)==1
    v=v.replace(a,'&&!o[e.assetId]&&T[e.assetId]&&!(e.assetId===`hubmap-skin-male`&&_sx!==`male`)&&!(e.assetId===`hubmap-skin-female`&&_sx!==`female`)),[_mn,_smn]')
    a='let i=[`zanatomy-heart`,';assert v.count(a)==1
    v=v.replace(a,'let i=[`hubmap-skin-male`,`hubmap-skin-female`,`zanatomy-heart`,')
    a='.filter(_p=>!(e.id===`hubmap-female-repro`&&_jsx!==`female`))';assert v.count(a)==1
    v=v.replace(a,a+'.filter(_p=>!(e.id===`hubmap-skin-male`&&_jsx!==`male`)&&!(e.id===`hubmap-skin-female`&&_jsx!==`female`))')
    v=v.replace('lod50','lod51')
    open(V,'w',encoding='utf-8').write(v)
sw=open(ROOT+'/sw.js').read();sw=sw.replace("'lod50'","'lod51'");n=int(re.search(r"av-v(\d+)",sw).group(1));sw=sw.replace('av-v%d'%n,'av-v%d'%(n+1));open(ROOT+'/sw.js','w').write(sw)
import os
print(subprocess.run(['python3',ROOT+'/tools/session-2026-11/bump.py',ROOT,NEW,os.path.basename(M),os.path.basename(V)],capture_output=True,text=True).stdout[-600:])
