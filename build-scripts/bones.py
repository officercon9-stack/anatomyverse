import sys,numpy as np,pickle
sys.path.insert(0,'.')
from vessels import load,U,T,C,have,byname,em
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
names={'frontal':['frontal bone'],'ethmoid':['ethmoid'],'sphenoid':['sphenoid bone'],'occipital':['occipital bone'],'temporal_r':['right temporal bone'],'temporal_l':['left temporal bone'],'parietal_r':['right parietal bone'],'parietal_l':['left parietal bone']}
B={}
for k,n in names.items():
    els=sorted(U(*n)); V=[];F=[];o=0
    for e in els:
        v,f=load(e); V.append(v);F.append(f+o);o+=len(v)
    V=(T(np.vstack(V))-C)*0.001; F=np.vstack(F); B[k]=(V,F)
    print(k,els[:3],len(V),V.min(0).round(3),V.max(0).round(3))
pickle.dump(B,open('bones.pkl','wb'))
fig,ax=plt.subplots(1,3,figsize=(21,7)); cols=dict(frontal='r',ethmoid='orange',sphenoid='g',occipital='b',temporal_r='m',temporal_l='m',parietal_r='k',parietal_l='k')
for a,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('axial',0,2)]):
    for k,(V,F) in B.items():
        s=V[::8]
        if t=='sag' and k.endswith('_l'): continue
        a.scatter(s[:,i],s[:,j],s=.3,c=cols[k])
    a.set_aspect('equal'); a.set_title(t)
plt.savefig('viz_bones.png',dpi=60)
