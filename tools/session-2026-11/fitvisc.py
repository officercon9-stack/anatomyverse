import json,numpy as np
from scipy.spatial import cKDTree
Z=json.load(open('z_visc.json'));A=json.load(open('app_visc.json'))
P=np.vstack([np.array(Z[k]) for k in('Liver','Spleen','Pancreas','Kidney.l','Kidney.r','Duodenum','Gallbladder','Stomach')])
Q=np.vstack([np.array(A[k]) for k in A if k in('liver','spleen','pancreas','kidney_L','kidney_R','duodenum','gallbladder') or k.startswith('stomach')])
def aff_icp(P,Q,A0,iters=60):
    tree=cKDTree(Q);A=A0.copy()
    for _ in range(iters):
        X=P@A[:,:3].T+A[:,3];d,i=tree.query(X)
        H=np.hstack([P,np.ones((len(P),1))]);sol,*_=np.linalg.lstsq(H,Q[i],rcond=None);A=sol.T
    X=P@A[:,:3].T+A[:,3];d,_=tree.query(X);d2,_=cKDTree(X).query(Q);return (d.mean()+d2.mean())/2,A
A0=np.hstack([np.eye(3),np.array([[0],[.012],[.015]])])
e,Af=aff_icp(P,Q,A0);print('err',e,np.round(Af,3))
print('raw err',(cKDTree(Q).query(P)[0].mean()+cKDTree(P).query(Q)[0].mean())/2)
json.dump(Af.tolist(),open('viscfit.json','w'))
def diag_icp(P,Q,s0,t0,iters=60):
    tree=cKDTree(Q);s=np.array(s0,float);t=np.array(t0,float)
    for _ in range(iters):
        X=P*s+t;d,i=tree.query(X)
        for ax in range(3):
            A=np.vstack([P[:,ax],np.ones(len(P))]).T;sol,*_=np.linalg.lstsq(A,Q[i][:,ax],rcond=None);s[ax],t[ax]=sol
    X=P*s+t;d,_=tree.query(X);d2,_=cKDTree(X).query(Q);return (d.mean()+d2.mean())/2,s,t
e,s,t=diag_icp(P,Q,[1,1,1],[0,.012,.015]);print('diag err',e,np.round(s,3),np.round(t,3))
json.dump({'s':s.tolist(),'t':t.tolist()},open('viscdiag.json','w'))
