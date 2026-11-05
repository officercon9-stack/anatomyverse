import json,numpy as np,re
from scipy.spatial import cKDTree
Z=json.load(open('z_leg.json'));AL=json.load(open('app_leg.json'));AF=json.load(open('app_femur.json'))
for k,v in json.load(open('app_arm.json')).items():
    if re.match(r'b_(humerus|radius|ulna)_',k):AL[k]=v
ZA=json.load(open('z_arm.json'))
for k in('Humerus.l','Humerus.r','Radius.l','Radius.r','Ulna.l','Ulna.r'):Z[k]=ZA[k]
def appv(n,side):
    S=side.upper()
    if n=='Femur':
        key='za_femur_1' if side=='l' else 'za_femur_2'
        return np.vstack([np.array(v) for k,v in AF.items() if k.startswith(key)])
    m={'Tibia':'b_tibia_','Fibula':'b_fibula_','Patella':'b_patella_','Hip bone':'b_hip-bone_','Scapula':'b_scapula_','Clavicle':'b_clavicle_','Humerus':'b_humerus_','Radius':'b_radius_','Ulna':'b_ulna_'}
    if n in m:return np.array(AL[m[n]+S])
    return np.array(AL[f'b_foot-bones_{S}__{n.lower()}'])
def aff_icp(P,Q,A0,iters=60):
    tree=cKDTree(Q);A=A0.copy()
    for _ in range(iters):
        X=P@A[:,:3].T+A[:,3];d,i=tree.query(X)
        H=np.hstack([P,np.ones((len(P),1))]);sol,*_=np.linalg.lstsq(H,Q[i],rcond=None);A=sol.T
    X=P@A[:,:3].T+A[:,3];d,_=tree.query(X);d2,_=cKDTree(X).query(Q)
    return (d.mean()+d2.mean())/2,A
out={}
for k,P in Z.items():
    n,side=k[:-2],k[-1]
    if n in('Humerus','Radius','Ulna'):continue
    P=np.array(P);Q=appv(n,side)
    sg=1 if side=='l' else -1
    A0=np.array([[1.067,0,0,0.02*sg],[0,.967,0,.0581],[0,0,1.067,.0136]])
    if n=='Femur':A0=np.array([[1,0,0,.046*sg],[0,1,0,.047],[0,0,1,.008]])
    e,A=aff_icp(P,Q,A0)
    out[k]={'A':A.tolist(),'err':e}
    print(k.ljust(14),'err %.4f'%e,'diag',np.round(np.diag(A[:,:3]),3),'t',np.round(A[:,3],3))
for k in('Humerus','Radius','Ulna'):
  for side in('l','r'):
    f=json.load(open('armfit.json'))[f'{k}.{side}'];R=np.array(f['R'])*f['s'];out[f'{k}.{side}']={'A':np.hstack([R,np.array(f['t'])[:,None]]).tolist(),'err':f['err']}
json.dump(out,open('legfit.json','w'))
