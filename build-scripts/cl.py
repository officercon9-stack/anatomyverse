import numpy as np,pickle,sys
sys.path.insert(0,'.')
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from scipy.spatial import cKDTree
RAW=pickle.load(open('vessels_raw.pkl','rb'))['groups']
def G(sid,side):
    for g in RAW:
        if g['sid']==sid and g['side']==side: return g
    raise KeyError((sid,side))
def mirror(v): v=v.copy(); v[:,0]*=-1; return v
class Tree:
    def __init__(s,V,F,tol=0.0006):
        s.V=V; n=len(V)
        e=np.vstack([F[:,[0,1]],F[:,[1,2]],F[:,[2,0]]])
        w=np.linalg.norm(V[e[:,0]]-V[e[:,1]],axis=1)
        kd=cKDTree(V); pr=kd.query_pairs(tol,output_type='ndarray')
        if len(pr): e=np.vstack([e,pr]); w=np.concatenate([w,np.linalg.norm(V[pr[:,0]]-V[pr[:,1]],axis=1)+1e-6])
        s.A=coo_matrix((w,(e[:,0],e[:,1])),shape=(n,n)).tocsr(); s.A=s.A.maximum(s.A.T)
        s.kd=kd
    def dist(s,root):
        d,p=dijkstra(s.A,indices=root,return_predecessors=True); return d,p
    def path(s,p,t):
        out=[t]
        while p[out[-1]]>=0: out.append(p[out[-1]])
        return out[::-1]
    def centre(s,idx,rad=0.0012):
        pts=s.V[idx]; res=[]
        for q in pts:
            nb=s.kd.query_ball_point(q,rad); res.append(s.V[nb].mean(0))
        return np.array(res)
def smooth_resample(P,step=0.0015,it=2):
    P=np.asarray(P,float)
    for _ in range(it):
        if len(P)>3: P=np.vstack([P[0],(P[:-2]+2*P[1:-1]+P[2:])/4,P[-1]])
    seg=np.linalg.norm(np.diff(P,axis=0),axis=1); L=np.concatenate([[0],np.cumsum(seg)])
    if L[-1]<=0: return P
    n=max(int(L[-1]/step),2); t=np.linspace(0,L[-1],n)
    return np.column_stack([np.interp(t,L,P[:,k]) for k in range(3)])
def centreline(tree,root,target=None,rad=0.0012):
    d,p=tree.dist(root)
    fin=np.isfinite(d)
    if target is None: target=int(np.argmax(np.where(fin,d,-1)))
    idx=tree.path(p,target)
    return smooth_resample(tree.centre(idx,rad)), target, d, fin
