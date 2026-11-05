import json,numpy as np
from scipy.spatial import cKDTree
exec(open('/tmp/jx/fitarm3.py').read().split('out={}')[0])
fit=json.load(open('/tmp/jx/armfit.json'))
J=json.load(open('/tmp/jx/joints.json'));N=json.load(open('/tmp/jx/joints_new.json'))
ARM=['annular-ligament-of-radius','elbow-joint-capsule','radiocarpal-joint-capsule','dorsal-radiocarpal-ligament','radiate-carpal-ligament','pisotriquetral-ligament','dorsal-intercarpal-ligaments','dorsal-carpometacarpal-ligaments','palmar-carpometacarpal-ligaments','metacarpophalangeal-joint-capsules','collateral-metacarpophalangeal-ligaments','proximal-interphalangeal-joint-capsules-hand','distal-interphalangeal-joint-capsules-hand','collateral-interphalangeal-ligaments-hand','palmar-interphalangeal-ligaments']
src={}
for k,v in J.items():
    if k.split('|')[0] in ARM:src[k]=v
for k,v in N.items():
    if len(v['v'])>8:src[k]=v
# humerus fit
for side in('l','r'):
    P=np.array(Z[f'Humerus.{side}']);Q=np.array(A[f'b_humerus_{side.upper()}'])
    best=None
    for s0 in(0.9,0.95,1.0,1.05,1.1):
        e,s,R,t=icp(P,Q,80,s0)
        if best is None or e<best[0]:best=(e,s,R,t)
    e,s,R,t=best;fit[f'Humerus.{side}']={'s':s,'R':R.tolist(),'t':t.tolist(),'err':e/2};print('humerus',side,'s',round(s,3),'err',round(e/2,4))
bones={}
for side in('l','r'):
    names=[n for n in Z if n.endswith('.'+side)]
    bones[side]=[(n,np.array(Z[n]),np.array(fit[n]['R']),fit[n]['s'],np.array(fit[n]['t'])) for n in names if n in fit]
out={};stats=[]
for key,d in src.items():
    sid,side,zn=key.split('|');V=np.array(d['v']);B=bones[side]
    D=np.stack([cKDTree(b[1]).query(V)[0] for b in B],1)
    W=1/(D+0.004)**3;
    # keep 3 nearest
    idx=np.argsort(-W,1)[:,3:];np.put_along_axis(W,idx,0,1);W/=W.sum(1,keepdims=True)
    out_v=np.zeros_like(V)
    for j,(n,_,R,s,t) in enumerate(B):
        out_v+=W[:,[j]]*(s*(V@R.T)+t)
    out[key]={'v':out_v.tolist(),'f':d['f']}
    mean_near=sorted(set(B[j][0] for j in np.argmax(W,1)))
    stats.append((sid,side,len(V),mean_near[:4]))
json.dump(out,open('/tmp/jx/arm_skinned.json','w'));json.dump(fit,open('/tmp/jx/armfit.json','w'))
for s in stats:
    if s[1]=='l':print(s)
