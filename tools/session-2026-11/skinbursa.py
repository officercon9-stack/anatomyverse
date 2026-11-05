import json,numpy as np
from scipy.spatial import cKDTree
exec(open('/tmp/jx/bursacontent.py').read())
Bj=json.load(open('bursae.json'));fit=json.load(open('legfit.json'));Z=json.load(open('z_leg.json'));ZA=json.load(open('z_arm.json'))
for k in('Humerus','Radius','Ulna'):
    for s in('l','r'):Z[f'{k}.{s}']=ZA[f'{k}.{s}']
bones={s:[(n,np.array(Z[n]),np.array(fit[n]['A'])) for n in Z if n.endswith('.'+s) and n in fit] for s in('l','r')}
trees={s:[cKDTree(b[1]) for b in bones[s]] for s in('l','r')}
out={};report=[]
AL=json.load(open('app_leg.json'));AF=json.load(open('app_femur.json'));AA=json.load(open('app_arm.json'))
app={'l':[],'r':[]}
for k,v in AL.items():app['l' if k.endswith('_L') or '_L__' in k else 'r'].append(np.array(v))
for k,v in AA.items():
    if k.startswith(('b_humerus','b_radius','b_ulna')):app['l' if k.endswith('_L') else 'r'].append(np.array(v))
app['l'].append(np.vstack([np.array(v) for k,v in AF.items() if k.startswith('za_femur_1')]));app['r'].append(np.vstack([np.array(v) for k,v in AF.items() if k.startswith('za_femur_2')]))
AT={s:cKDTree(np.vstack(app[s])) for s in app}
for z,i,*_ in B:
  for s in('l','r'):
    zn=z[:-2]+'.'+s
    d=Bj[zn];V=np.array(d['v']);D=np.stack([t.query(V)[0] for t in trees[s]],1)
    W=1/(D+0.004)**3;idx=np.argsort(-W,1)[:,3:];np.put_along_axis(W,idx,0,1);W/=W.sum(1,keepdims=True)
    o=np.zeros_like(V)
    for j,(n,_,A) in enumerate(bones[s]):o+=W[:,[j]]*(V@A[:,:3].T+A[:,3])
    out[f'{i}|{s}|{zn}']={'v':o.tolist(),'f':d['f']}
    dd=AT[s].query(o)[0]
    if s=='l':print(i.ljust(48),'dist to nearest bone: min %.1f median %.1f mm'%(dd.min()*1000,np.median(dd)*1000))
json.dump(out,open('bursae_skinned.json','w'))
