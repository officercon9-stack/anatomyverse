import numpy as np, json
from sdf import *
res=0.0007
lo=(-0.040,0.775,0.0);hi=(0.040,0.880,0.062)
P,ax=grid(lo,hi,res)
A=np.array([0,0.842,0.044]);B=np.array([0,0.790,0.012]);L=np.linalg.norm(B-A)
u=(B-A)/L;n=np.array([0,-u[2],u[1]]);n=n if n[2]>0 else -n   # outward (anterior-inferior)
ex=np.array([1.0,0,0]);fr=(ex,u,n)
pt=lambda s:A+s*(B-A)
big=np.full(P.shape[:-1],1.0)
def lobe(sig,spec,K=0.009):
    F=big.copy()
    for s,xo,r,no in spec:
        c=pt(s)+sig*xo*ex+n*no
        F=smin(F,ell(P,c,r,fr),K)
    return F
# labia majora
spec=[(0.04,0.0105,(0.0075,0.0075,0.0075),0.004),(0.2,0.0145,(0.0090,0.0095,0.0085),0.005),(0.4,0.0165,(0.0100,0.0100,0.0090),0.005),(0.6,0.0165,(0.0100,0.0100,0.0090),0.004),(0.8,0.0150,(0.0090,0.0095,0.0085),0.003),(0.97,0.0110,(0.0075,0.0075,0.0070),0.002)]
majora=smin(lobe(1,spec),lobe(-1,spec),0.002)
# labia minora
specm=[(0.10,0.0050,(0.0030,0.0080,0.0050),0.0040),(0.25,0.0075,(0.0032,0.0090,0.0070),0.0055),(0.42,0.0090,(0.0034,0.0095,0.0090),0.0060),(0.60,0.0090,(0.0034,0.0095,0.0085),0.0050),(0.78,0.0078,(0.0030,0.0090,0.0060),0.0035),(0.88,0.0062,(0.0026,0.0070,0.0040),0.0025)]
minora=smin(lobe(1,specm,0.005),lobe(-1,specm,0.005),0.0015)
# clitoris glans + body + crura
G=pt(0.10)+n*0.0040
cl=ell(P,G,(0.0028,0.0030,0.0030),fr)
body=capsule(P,G+n*(-0.001),G+np.array([0,0.010,-0.014]),0.0020,0.0026)
cl=smin(cl,body,0.002)
for sg in(1,-1):
    cl=smin(cl,capsule(P,G+np.array([0,0.010,-0.014]),G+np.array([sg*0.014,0.002,-0.026]),0.0024,0.0020),0.002)
# hood: fold over glans, merged with anterior minora
hood=ell(P,pt(0.045)+n*0.0058,(0.0070,0.0070,0.0050),fr)
hood=smin(hood,capsule(P,pt(0.06)+n*0.004+0.0050*ex,pt(0.22)+n*0.0052+0.0075*ex,0.0020,0.0026),0.002)
hood=smin(hood,capsule(P,pt(0.06)+n*0.004-0.0050*ex,pt(0.22)+n*0.0052-0.0075*ex,0.0020,0.0026),0.002)
# mons pubis
mons=ell(P,[0,0.858,0.040],(0.020,0.011,0.009),(ex,np.array([0,1.0,0]),np.array([0,0,1.0])))
mons=smin(mons,ell(P,pt(0.0)+n*0.0,(0.013,0.010,0.009),fr),0.008)
meshes={}
for name,F in [('vulva_labia_majora',majora),('vulva_labia_minora',minora),('vulva_clitoris',cl),('vulva_clitoral_hood',hood),('vulva_mons',mons)]:
    v,f=mesh(F,ax,res);meshes[name]=out(v,f);print(name,len(v),len(f))
json.dump(meshes,open('vulva.json','w'))
