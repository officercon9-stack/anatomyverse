import numpy as np, json
from sdf import *
T=json.load(open('tongue_smooth.json'));V=np.array(T['v']);F=np.array(T['f'])
# vertex normals (outward after volume-orient)
vol=np.einsum('ij,ij->i',V[F[:,0]],np.cross(V[F[:,1]],V[F[:,2]])).sum()
if vol<0:F=F[:,::-1]
N=np.zeros_like(V);fn=np.cross(V[F[:,1]]-V[F[:,0]],V[F[:,2]]-V[F[:,0]])
for k in range(3):np.add.at(N,F[:,k],fn)
N/=np.linalg.norm(N,axis=1,keepdims=True)+1e-12
top=V[:,1]>V[:,1].min()+0.6*(V[:,1].max()-V[:,1].min())
dors=np.where((N[:,1]>0.75)&top)[0]
zmin,zmax=V[:,2].min(),V[:,2].max();print('tongue z',zmin,zmax,'dorsal verts',len(dors))
rng=np.random.default_rng(7)
pts=[];rad=[]
# circumvallate V
for sg in(1,-1):
    for k in range(5):
        g=np.array([sg*(0.0025+0.0020*k),0,zmin+0.40*(zmax-zmin)+0.0017*k])
        d=np.linalg.norm(V[dors][:,[0,2]]-g[[0,2]],axis=1);i=dors[np.argmin(d)];pts.append(V[i]+N[i]*0.0002);rad.append(0.0013)
# fungiform on anterior two thirds
cand=dors[V[dors][:,2]>zmin+0.5*(zmax-zmin)]
sel=rng.choice(cand,70,replace=False)
for i in sel:pts.append(V[i]+N[i]*0.0001);rad.append(0.00075)
# foliate folds on sides: 4 short ridges each side
side=np.where((abs(V[:,0])>0.010)&(V[:,2]<zmin+0.45*(zmax-zmin))&(V[:,2]>zmin+0.25*(zmax-zmin))&(V[:,1]>V[:,1].min()+0.4*(V[:,1].max()-V[:,1].min())))[0]
for i in rng.choice(side,10,replace=False):pts.append(V[i]);rad.append(0.0008)
def sphere(c,r,nu=8,nv=6):
    v=[];f=[]
    for j in range(nv+1):
        th=np.pi*j/nv
        for i in range(nu):
            ph=2*np.pi*i/nu;v.append(c+r*np.array([np.sin(th)*np.cos(ph),np.cos(th),np.sin(th)*np.sin(ph)]))
    for j in range(nv):
        for i in range(nu):
            a=j*nu+i;b=j*nu+(i+1)%nu;c_=(j+1)*nu+i;d=(j+1)*nu+(i+1)%nu;f+=[[a,c_,b],[b,c_,d]]
    return np.array(v),np.array(f)
VV=[];FF=[];o=0
for c,r in zip(pts,rad):
    v,f=sphere(c,r);VV.append(v);FF.append(f+o);o+=len(v)
VV=np.vstack(VV);FF=np.vstack(FF)
meshes={'zo_taste':{'v':np.round(VV,5).tolist(),'f':FF.tolist(),'c':[0.93,0.62,0.60],'rough':0.5}}
# oral cavity lumen (schematic translucent space)
res=0.0010;lo=(-0.045,1.495,0.010);hi=(0.045,1.560,0.100)
P,ax=grid(lo,hi,res)
cav=ell(P,[0,1.527,0.053],(0.034,0.026,0.038))
cav=np.maximum(cav,1.548-P[...,1])     # below hard palate
cav=np.maximum(cav,1.500-P[...,1]-0.0)*1.0 if False else cav
cav=np.maximum(cav,P[...,2]-0.088)     # in front of the lips line
v,f=mesh(cav,ax,res,0.8)
meshes['zo_oral_cavity']={'v':np.round(v,5).tolist(),'f':f.tolist(),'c':[0.95,0.60,0.62],'alpha':0.18,'ds':True,'rough':0.8}
for k,d in meshes.items():print(k,len(d['v']))
json.dump(meshes,open('taste.json','w'))
