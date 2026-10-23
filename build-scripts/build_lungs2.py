import sys,numpy as np,json,pickle
sys.path.insert(0,'.')
import build_lungs as B
from lungload import *
from glbtools import *
from scipy.spatial import cKDTree
import trimesh
rng=np.random.default_rng(11)
# lung volume from the generated lung surface fields
_LS=pickle.load(open('/home/claude/brain3d/lung_surface.pkl','rb')); FFd=_LS['F']; X0g=_LS['X0']; Hg=_LS['H']
LC=np.array([0,1240,95.])
def inside(p,margin=2.0):
    p=np.asarray(p); F=FFd['L' if p[0]>0 else 'R']; i=np.round((p-X0g)/Hg).astype(int)
    if (i<0).any() or (i>=np.array(F.shape)).any(): return False
    return bool(F[tuple(i)]>margin)
# tree elements
els=[obj(fj)[0] for fj in sorted(D['FMA7393'])]
allv=np.vstack(els); lab=np.concatenate([[i]*len(v) for i,v in enumerate(els)]); TK=cKDTree(allv)
def ends(V):
    c=V.mean(0); u,s,vt=np.linalg.svd(V-c,full_matrices=False); a=vt[0]; t=(V-c)@a; srt=np.sort(t)
    lo=V[t<=srt[max(2,len(t)//30)]].mean(0); hi=V[t>=srt[-max(3,len(t)//30)]].mean(0)
    r=np.sqrt(np.mean(((V-c)-np.outer(t,a))**2)); return lo,hi,r
EN=[ends(V) for V in els]
def is_leaf(i,p):
    d,idx=TK.query(p,k=40); return not any(lab[j]!=i and dd<4.0 for j,dd in zip(idx,d))
# element adjacency by vertex proximity
n=len(els); adj=[[] for _ in range(n)]; pairs=set()
for i,V in enumerate(els):
    for l in TK.query_ball_point(V,2.5):
        for j in set(lab[l]):
            if j!=i: pairs.add((min(i,j),max(i,j)))
for i,j in pairs: adj[i].append(j); adj[j].append(i)
root=int(np.argmax([max(e[0][1],e[1][1]) for e in EN]))
par={root:None}; q=[root]
while q:
    u=q.pop(0)
    for w in adj[u]:
        if w not in par: par[w]=u; q.append(w)
print('elements',n,'reached',len(par),'root',root)
def chain(i):
    c=[];
    while i is not None: c.append(i); i=par.get(i)
    return c[::-1]
def poly_for(i_chain):
    P=[]; prev_exit=None
    for k,e in enumerate(i_chain):
        lo,hi,_=EN[e]
        if k==0: entry,exit_=(lo,hi) if lo[1]>hi[1] else (hi,lo)
        else:
            if np.linalg.norm(lo-prev_exit)<np.linalg.norm(hi-prev_exit): entry,exit_=lo,hi
            else: entry,exit_=hi,lo
        P+= [entry,exit_]; prev_exit=exit_
    return P
tubes=[]; tips=[]; routes=[]
def norm(v): return v/ (np.linalg.norm(v)+1e-9)
def grow(p,d,r,g,path,depth):
    if g==0: tips.append((p,d,path)); return
    grown=False
    for sgn in (-1,1):
        ax=norm(np.cross(d,rng.normal(size=3)))
        for tryL in (1.0,0.6):
            L=(9.0*0.8**depth)*tryL
            nd=norm(d*np.cos(0.62)+ax*np.sin(0.62)*sgn+norm(LC-p)*0.0+rng.normal(size=3)*0.12)
            q=p+nd*L
            if inside(q): 
                mid=(p+q)/2+norm(rng.normal(size=3))*0.5
                tubes.append(([p,mid,q],max(r*0.74,0.3))); grown=True; grow(q,nd,max(r*0.74,0.3),g-1,path+[q],depth+1); break
    if not grown: tips.append((p,d,path))
for i,(lo,hi,r) in enumerate(EN):
    if i not in par: continue
    for e,o in ((hi,lo),(lo,hi)):
        if e[1]>1292: continue
        if not is_leaf(i,e): continue
        d=norm(e-o)
        if not inside(e,1.0): 
            pass
        grow(e,d,max(r,0.6),4,poly_for(chain(i)),0)
print('tubes',len(tubes),'tips',len(tips))
# ---- geometry (T mm -> app local) ----
Ts=[tube(B.A(np.array(P)),r/1000*1.0,5) for P,r in tubes]
V,F=merge(Ts); B.add('bronchioles','bronchioles',V,F,0xF1DEC8,1.0,0.45)
def sphere(c,r,nu=5,nv=4):
    u=np.linspace(0,2*np.pi,nu,endpoint=False); v=np.linspace(0.25,np.pi-0.25,nv)
    X=[c+r*np.array([np.sin(b)*np.cos(a),np.cos(b),np.sin(b)*np.sin(a)]) for b in v for a in u]
    X.append(c+np.array([0,r,0])); X.append(c-np.array([0,r,0])); X=np.array(X); F=[]
    for j in range(nv-1):
        for i in range(nu):
            a=j*nu+i;b=j*nu+(i+1)%nu;c2=a+nu;d=b+nu; F+=[(a,b,c2),(b,d,c2)]
    t=nv*nu; 
    for i in range(nu): F.append((i,t,(i+1)%nu)); F.append(((nv-1)*nu+(i+1)%nu,t+1,(nv-1)*nu+i))
    return X,np.array(F)
Ss=[]
for p,d,path in tips:
    for k in range(5):
        off=norm(d+rng.normal(size=3)*0.9)*rng.uniform(0.9,2.0)
        Ss.append(sphere(p+d*1.2+off,rng.uniform(1.0,1.5)))
V,F=merge(Ss); B.add('alveoli','alveoli',B.A(V),F,0xE0687A,0.95,0.3); print('alveoli verts',len(V))
# air routes (world coords, app space)
for k,(p,d,path) in enumerate(tips):
    if k%3: continue
    P=np.array(path)
    routes.append((B.A(P)+B.O))
enc=lambda P:np.round(np.asarray(P)*1e4).astype(int).reshape(-1).tolist()
json.dump(dict(air=[enc(r) for r in routes]),open('lung-flow.json','w'),separators=(',',':'))
print('routes',len(routes))
print(write_glb(B.nodes,'lungs.glb','bodyparts3d-lungs.glb.json')); json.dump(B.omap,open('lungs_objectmap.json','w'))
