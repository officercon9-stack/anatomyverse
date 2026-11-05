import json,numpy as np
from scipy.spatial import cKDTree
exec(open('/tmp/jx/lymphcontent.py').read())
Lz=json.load(open('lymph.json'));fit=json.load(open('legfit.json'));Zl=json.load(open('z_leg.json'));ZA=json.load(open('z_arm.json'))
for k in('Humerus','Radius','Ulna'):
    for s in('l','r'):Zl[f'{k}.{s}']=ZA[f'{k}.{s}']
bones={s:[(n,np.array(Zl[n]),np.array(fit[n]['A'])) for n in Zl if n.endswith('.'+s) and n in fit] for s in('l','r')}
trees={s:[cKDTree(b[1]) for b in bones[s]] for s in bones}
anch=[]
for f in('anch_org','anch_skull','anch_org2'):
    for k,v in json.load(open(f+'.json')).items():
        if 'lymph' in k:continue
        a=np.array(v);anch.append(a[::2])
AL=json.load(open('app_leg.json'))
for k,v in AL.items():anch.append(np.array(v)[::2])
AA=json.load(open('app_arm.json'))
for k,v in AA.items():
    if k.startswith(('b_humerus','b_radius','b_ulna')):anch.append(np.array(v)[::2])
AT=cKDTree(np.vstack(anch))
vd=json.load(open('viscdiag.json'));sv=np.array(vd['s']);tv=np.array(vd['t'])
cands={'raw':(np.ones(3),np.zeros(3)),'viscera':(sv,tv),'skeleton':(np.array([1.067,.967,1.067]),np.array([0,.0581,.0136]))}
LIMB={'upper-limb','lower-limb'}
LIMBIDS={'Interpectoral nodes','(Medial lacunar node)','(Intermediate lacunar node)','(Lateral lacunar node)'}
out={};ids={};rep=[]
def sid(z):
    if z=='Paratracheal cervical nodes':return 'paratracheal-nodes'
    import re
    s=re.sub(r'^\(|\)$','',z).lower();s=re.sub(r'\)','',s);return re.sub(r'[^a-z0-9]+','-',s).strip('-')
for z,name,latin,region,loc,drains,note in G:
    sides=[('l',z+'.l'),('r',z+'.r')] if z+'.l' in Lz else [('',z)]
    sides=sides+[(sd,zx+('.'+sd if sd else '')) for zx in EXTRA.get(z,[]) for sd,_ in sides]
    for sd,zn in sides:
        V=np.array(Lz[zn]['v']);nn=len(V)//86 if len(V)%86==0 else None
        if region in LIMB or z in LIMBIDS:
            B=bones[sd or 'l'];D=np.stack([t.query(V)[0] for t in trees[sd or 'l']],1)
            W=1/(D+0.004)**3;idx=np.argsort(-W,1)[:,3:];np.put_along_axis(W,idx,0,1);W/=W.sum(1,keepdims=True)
            o=np.zeros_like(V)
            for j,(n,_,A) in enumerate(B):o+=W[:,[j]]*(V@A[:,:3].T+A[:,3])
            how='bones'
        else:
            best=None
            for cn,(s,t) in cands.items():
                d=np.median(AT.query(V*s+t)[0])
                if best is None or d<best[0]:best=(d,cn,s,t)
            d,how,s,t=best;o=V*s+t
        d=np.median(AT.query(o)[0])
        key=f"{sid(z)}|{sd}|{zn}"
        out[key]={'v':o.tolist(),'f':Lz[zn]['f']};
        if sd!='r':rep.append((sid(z),how,round(d*1000,1),nn))
json.dump(out,open('lymph_skinned.json','w'))
import collections
print(collections.Counter(r[1] for r in rep))
for r in rep:print(r)
