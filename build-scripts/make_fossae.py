import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from glbtools import *
B=pickle.load(open('bones.pkl','rb'))
def sub(V,F,mask):
    c=V[F].mean(1); m=mask(c[:,0],c[:,1],c[:,2]); return V,F[m]
YB=-0.008   # vault / base separation
def zb(x): return 0.020-1.1*np.abs(x)    # middle / posterior boundary (follows the petrous ridge)
Z_A=0.045                                 # anterior / middle boundary (lesser wing of sphenoid)
parts={'ant':[],'mid':[],'post':[],'vault':[]}
def take(name,kind,mask):
    V,F=B[name]; V,F=sub(V,F,mask); parts[kind].append((V,F))
for nm in ('frontal',):
    V,F=B[nm]; c=V[F].mean(1)
    parts['ant'].append((V,F[(c[:,1]<YB)&(c[:,1]>-0.045)])); parts['vault'].append((V,F[c[:,1]>=YB]))
V,F=B['ethmoid']; c=V[F].mean(1); parts['ant'].append((V,F[(c[:,1]>-0.036)&(c[:,1]<0.0)]))
V,F=B['sphenoid']; c=V[F].mean(1)
parts['ant'].append((V,F[(c[:,2]>=Z_A)&(c[:,1]>-0.05)])); parts['mid'].append((V,F[(c[:,2]<Z_A)&(c[:,1]>-0.045)])); 
for nm in ('temporal_r','temporal_l'):
    V,F=B[nm]; c=V[F].mean(1); lowside=(c[:,1]<YB+0.012)&(c[:,1]>-0.05)
    parts['mid'].append((V,F[lowside&(c[:,2]>=zb(c[:,0]))])); parts['post'].append((V,F[lowside&(c[:,2]<zb(c[:,0]))])); parts['vault'].append((V,F[~lowside]))
V,F=B['occipital']; c=V[F].mean(1); parts['post'].append((V,F[(c[:,1]<YB+0.004)])); parts['vault'].append((V,F[c[:,1]>=YB+0.004]))
for nm in ('parietal_r','parietal_l'): parts['vault'].append(B[nm])
nodes=[]; omap={}
for k,col,sid,al in (('ant',0xE9C46A,'anterior-cranial-fossa',0.9),('mid',0x2FA89A,'middle-cranial-fossa',0.9),('post',0xE76F51,'posterior-cranial-fossa',0.9),('vault',0xE8DFCB,'calvaria',0.16)):
    ms=[(V,F) for V,F in parts[k] if len(F)]; V,F=merge(ms)
    print(k,len(V),len(F)); nodes.append(dict(name='fossa_'+k,V=V,F=F,color=col,alpha=al,rough=0.7)); omap['fossa_'+k]=sid
print(write_glb(nodes,'brain-fossae.glb','bodyparts3d-brain-fossae.glb.json')); json.dump(omap,open('fossae_objectmap.json','w'))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(21,7)); cc=dict(ant='#e9c46a',mid='#2fa89a',post='#e76f51',vault='#bbb')
for a,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('top',0,2)]):
    for k in ('vault','ant','mid','post'):
        for V,F in parts[k]:
            if len(F)==0: continue
            c=V[F].mean(1)[::3]
            if t=='sag' and k=='vault': continue
            a.scatter(c[:,i],c[:,j],s=.5,c=cc[k])
    a.set_aspect('equal'); a.set_title(t)
plt.savefig('viz_fossae.png',dpi=60)
