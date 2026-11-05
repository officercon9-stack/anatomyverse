import json,numpy as np
from scipy.spatial import cKDTree
Z=json.load(open('/tmp/jx/z_arm.json'));A=json.load(open('/tmp/jx/app_arm.json'))
F={'first':'thumb','second':'index-finger','third':'middle-finger','fourth':'ring-finger','fifth':'little-finger'}
def amap(z):
    base,s=z[:-2],z[-1].upper();
    if base in('Humerus','Radius','Ulna'):return f'b_{base.lower()}_{s}'
    cm={'Scaphoid bone':'scaphoid','Lunate bone':'lunate','Triquetrum bone':'triquetrum','Pisiform bone':'pisiform','Trapezium bone':'trapezium','Trapezoid bone':'trapezoid','Capitate bone':'capitate','Hamate bone':'hamate'}
    if base in cm:return f'b_hand-bones_{s}__{cm[base]}'
    for k,n in (('First',1),('Second',2),('Third',3),('Fourth',4),('Fifth',5)):
        if base==f'{k} metacarpal bone':return f'b_hand-bones_{s}__metacarpal-{n}'
    p,_,rest=base.partition(' phalanx of ');f=rest.split(' ')[0]
    return f'b_hand-bones_{s}__{p.lower()}-phalanx-of-{F[f]}'
def kabsch(P,Q,scale=True):
    cp,cq=P.mean(0),Q.mean(0);P0,Q0=P-cp,Q-cq
    U,S,Vt=np.linalg.svd(P0.T@Q0);d=np.sign(np.linalg.det(U@Vt));D=np.diag([1,1,d])
    R=(U@D@Vt).T  # maps P->Q : q=R p
    s=(S*np.diag(D)).sum()/(P0**2).sum() if scale else 1.0
    return s,R,cq-s*R@cp
def icp(P,Q,iters=60,S0=None):
    best=None
    # init candidates: PCA axes sign flips
    def pca(X):
        c=X.mean(0);u,s,vt=np.linalg.svd(X-c,full_matrices=False);return c,vt
    cp,vp=pca(P);cq,vq=pca(Q);tree=cKDTree(Q)
    for sx in(1,-1):
      for sy in(1,-1):
        D=np.diag([sx,sy,1]);R0=vq.T@D@vp
        if np.linalg.det(R0)<0:R0[:,2]*=-1
        s0=S0;t0=cq-s0*R0@cp
        s,R,t=s0,R0,t0
        for _ in range(iters):
            X=s*(P@R.T)+t;d,i=tree.query(X)
            _,R,t=kabsch(P*s,Q[i],False);t=t
        X=s*(P@R.T)+t;d,i=tree.query(X);tree2=cKDTree(X);d2,_=tree2.query(Q)
        e=d.mean()+d2.mean()
        if best is None or e<best[0]:best=(e,s,R,t)
    return best
out={}
for z,P in Z.items():
    a=amap(z)
    if a not in A:print('noapp',z,a);continue
    P=np.array(P);Q=np.array(A[a]);S0=1.075 if z.split('.')[0] in('Radius','Ulna','Humerus') else 1.13
    e,s,R,t=icp(P,Q,60,S0)
    out[z]={'app':a,'s':s,'R':R.tolist(),'t':t.tolist(),'err':e/2}
    ang=np.degrees(np.arccos(np.clip((np.trace(R)-1)/2,-1,1)));print(z.ljust(42),'rot %.0f deg err %.4f m'%(ang,e/2))
json.dump(out,open('/tmp/jx/armfit.json','w'))
