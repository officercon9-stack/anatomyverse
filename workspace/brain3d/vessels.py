import sys,numpy as np,pickle,zipfile,collections
sys.path.insert(0,'.')
from build_parts import parts,em,nm,byname
z=zipfile.ZipFile('/mnt/user-data/uploads/partof_BP3D_4_0_obj_99.zip')
def load(el):
    t=z.read(f'partof_BP3D_4.0_obj_99/{el}.obj').decode('latin1').splitlines()
    v=np.array([[float(x) for x in l.split()[1:4]] for l in t if l.startswith('v ')])
    f=[]
    for l in t:
        if l.startswith('f '):
            idx=[int(p.split('/')[0]) for p in l.split()[1:]]
            for k in range(1,len(idx)-1): f.append((idx[0]-1,idx[k]-1,idx[k+1]-1))
    return v,np.array(f,dtype=np.int64)
have={n.split('/')[-1][:-4] for n in z.namelist() if n.endswith('.obj')}
claimed={e for p in parts for e in p['elements']}
def U(*names):
    s=set()
    for n in names:
        assert n in byname,n
        for c in byname[n]: s|=em[c]
    return {e for e in s if e in have}
SPEC=[ # id, label, side, concept names (priority order)
 ('ophthalmic-artery','Ophthalmic artery','R',['right ophthalmic artery']),
 ('ophthalmic-artery','Ophthalmic artery','L',['left ophthalmic artery']),
 ('anterior-choroidal-artery','Anterior choroidal artery','R',['right anterior choroidal artery']),
 ('anterior-choroidal-artery','Anterior choroidal artery','L',['left anterior choroidal artery']),
 ('posterior-choroidal-arteries','Posterior choroidal arteries','R',['right posterior choroidal artery','right posterior medial choroidal artery']),
 ('posterior-choroidal-arteries','Posterior choroidal arteries','L',['left posterior choroidal artery','left posterior medial choroidal artery']),
 ('thalamic-perforating-arteries','Thalamic perforating arteries','R',['right thalamoperforating artery','right thalamogeniculate artery']),
 ('thalamic-perforating-arteries','Thalamic perforating arteries','L',['left thalamoperforating artery','left thalamogeniculate artery']),
 ('anterior-cerebral-artery','Anterior cerebral artery','R',['right anterior cerebral artery']),
 ('anterior-cerebral-artery','Anterior cerebral artery','L',['left anterior cerebral artery']),
 ('middle-cerebral-artery','Middle cerebral artery','R',['trunk of right middle cerebral artery','sphenoid part of right middle cerebral artery','anterolateral central branch of right middle cerebral artery','right middle cerebral artery']),
 ('posterior-cerebral-artery','Posterior cerebral artery','R',['right lateral occipital artery','right medial occipital artery','right splenial artery','right posterior cerebral artery']),
 ('posterior-cerebral-artery','Posterior cerebral artery','L',['left lateral occipital artery','left medial occipital artery','left splenial artery','left posterior cerebral artery']),
 ('superior-cerebellar-artery','Superior cerebellar artery','R',['right superior cerebellar artery']),
 ('superior-cerebellar-artery','Superior cerebellar artery','L',['left superior cerebellar artery']),
 ('anterior-inferior-cerebellar-artery','Anterior inferior cerebellar artery','M',['anterior inferior cerebellar artery']),
 ('posterior-inferior-cerebellar-artery','Posterior inferior cerebellar artery','R',['right posterior inferior cerebellar artery']),
 ('posterior-inferior-cerebellar-artery','Posterior inferior cerebellar artery','L',['left posterior inferior cerebellar artery']),
 ('pontine-arteries','Pontine arteries','R',['right pontine artery','lateral branch of right pontine artery','medial branch of right pontine artery']),
 ('pontine-arteries','Pontine arteries','L',['left pontine artery','lateral branch of left pontine artery','medial branch of left pontine artery']),
 ('anterior-spinal-artery','Anterior spinal artery','R',['right anterior spinal artery']),
 ('basilar-artery','Basilar artery','M',['basilar artery']),
 ('vertebral-artery','Vertebral artery','R',['right vertebral artery']),
 ('vertebral-artery','Vertebral artery','L',['left vertebral artery']),
 ('internal-carotid-artery','Internal carotid artery','R',['right internal carotid artery']),
 ('internal-carotid-artery','Internal carotid artery','L',['left internal carotid artery']),
]
taken=set(claimed); groups=[]
for sid,lab,side,names in SPEC:
    els=sorted(U(*names)-taken); taken|=set(els)
    groups.append(dict(sid=sid,label=lab,side=side,elements=els))
# transform identical to the brain GLB
def T(v): return np.column_stack([v[:,0],v[:,2],-v[:,1]])
import make_glb3 as mg  # reuses C (centroid) — runs builder quickly
C=mg.C; S=0.001
out=[]
for g in groups:
    if not g['elements']: print('EMPTY',g['sid'],g['side']); continue
    V=[];F=[];o=0
    for e in g['elements']:
        v,f=load(e); V.append(v); F.append(f+o); o+=len(v)
    V=(T(np.vstack(V))-C)*S; F=np.vstack(F)
    out.append(dict(g,V=V,F=F))
    print(f"{g['sid']:38s}{g['side']} els={len(g['elements']):3d} V={len(V):6d} F={len(F):6d} y[{V[:,1].min():.3f},{V[:,1].max():.3f}] x[{V[:,0].min():.3f},{V[:,0].max():.3f}] z[{V[:,2].min():.3f},{V[:,2].max():.3f}]")
pickle.dump(dict(groups=out,C=C),open('vessels_raw.pkl','wb'))
