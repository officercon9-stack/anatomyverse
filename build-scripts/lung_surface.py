import sys,numpy as np,pickle
sys.path.insert(0,'.')
from lungload import *
from scipy import ndimage
from scipy.spatial import ConvexHull
from skimage import measure
import trimesh,fast_simplification
H=2.5
X0=np.array([-145.,1005.,0.]); SH=np.array([int(290/H),int(400/H),int(205/H)])
gx=X0[0]+np.arange(SH[0])*H; gy=X0[1]+np.arange(SH[1])*H; gz=X0[2]+np.arange(SH[2])*H
GX,GY,GZ=np.meshgrid(gx,gy,gz,indexing='ij'); P=np.stack([GX,GY,GZ],-1)
tree=np.vstack([obj(fj)[0] for fj in sorted(D['FMA7393'])])
dv=np.vstack([obj(fj)[0] for fj in sorted(D['FMA13295'])])
# diaphragm dome height-field (upper envelope)
dm=np.full((SH[0],SH[2]),np.nan)
ix=np.clip(((dv[:,0]-X0[0])/H).astype(int),0,SH[0]-1); iz=np.clip(((dv[:,2]-X0[2])/H).astype(int),0,SH[2]-1)
for a,b,y in zip(ix,iz,dv[:,1]):
    if np.isnan(dm[a,b]) or y>dm[a,b]: dm[a,b]=y
mask=~np.isnan(dm); idx=ndimage.distance_transform_edt(~mask,return_distances=False,return_indices=True)
dm=dm[tuple(idx)]; dm=ndimage.gaussian_filter(dm,2.0)
f_dia=GY-(dm[:,None,:]-1.0)   # broadcast on y
f_dia=GY-np.broadcast_to(dm[:,None,:],GY.shape)+1.0
def anchors(s):  # s=-1 right (x<0), +1 left
    A=[(38,1372,85),(55,1355,60),(55,1355,115),(122,1220,90),(118,1250,60),(118,1250,125),(95,1230,28),(60,1100,25),(95,1100,25),(110,1080,45),
       (95,1250,172),(70,1130,170),(40,1300,160),(100,1100,160),(110,1055,90),(85,1040,60),(85,1040,130),(55,1060,95),(40,1090,95),(22,1330,95),(22,1250,95),(22,1150,100)]
    return np.array([(-s*x if False else (x if s>0 else -x),y,z) for x,y,z in A],float)
def lung(side):
    s=1 if side=='L' else -1
    tp=tree[(tree[:,0]*s>30)][::12]
    off=np.array([[a,b,c] for a in(-13,13) for b in(-13,13) for c in(-13,13)],float)
    pts=np.vstack([anchors(s)]+[tp+o for o in off])
    eq=ConvexHull(pts).equations
    f_hull=np.empty(GX.shape,np.float32)
    for i in range(SH[0]): f_hull[i]=np.min(-(P[i]@eq[:,:3].T+eq[:,3]),axis=-1)
    f_med=(GX*s)-20.0
    F=np.minimum(np.minimum(f_hull,f_med),f_dia)
    if side=='L':
        c=np.array([46,1172,150.]); r=np.array([34,50,40.]); rn=np.sqrt((((P-c)/r)**2).sum(-1)); F=np.minimum(F,(rn-1)*30)
    else:
        c=np.array([-35,1170,150.]); r=np.array([22,40,30.]); rn=np.sqrt((((P-c)/r)**2).sum(-1)); F=np.minimum(F,(rn-1)*25)
    F=ndimage.gaussian_filter(F,1.3)
    return F
FF={'R':lung('R'),'L':lung('L')}
# fissure planes
def oblique(p): return 0.865*(p[:,2]-45)+0.505*(p[:,1]-1270)    # >0 anterior-superior
out={}
for side,F in FF.items():
    V,Fc,N,_=measure.marching_cubes(F,0.0,spacing=(H,H,H)); V=V+X0
    # grooves along fissures
    d_ob=oblique(V); disp=-2.4*np.exp(-(d_ob/3.0)**2)
    if side=='R': 
        d_h=V[:,1]-1205; disp+= -2.0*np.exp(-(d_h/3.0)**2)*(d_ob>0)*(V[:,2]>75)
    V=V+N*disp[:,None]*(-1)   # marching_cubes normals point to decreasing values? flip below if needed
    m=trimesh.Trimesh(V,Fc,process=False); m.fix_normals(); V,Fc=m.vertices,m.faces
    cen=V[Fc].mean(1); ob=oblique(cen)
    if side=='R':
        lab=np.where(ob<0,2,np.where((cen[:,1]<1205)&(cen[:,2]>75),1,0))   # 0 upper,1 middle,2 lower
    else: lab=np.where(ob<0,1,0)
    out[side]=(V,Fc,lab)
    print(side,len(V),len(Fc),np.bincount(lab),'vol L',(F>0).sum()*H**3/1e6)
pickle.dump(dict(out=out,F=FF,X0=X0,H=H),open('lung_surface.pkl','wb'))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,2,figsize=(14,8))
for side,(V,Fc,lab) in out.items():
    ax[0].scatter(V[::5,0],V[::5,1],s=0.3,c='r' if side=='R' else 'b'); ax[1].scatter(V[::5,2],V[::5,1],s=0.3,c='r' if side=='R' else 'b')
ax[0].scatter(tree[::8,0],tree[::8,1],s=0.2,c='k'); ax[1].scatter(tree[::8,2],tree[::8,1],s=0.2,c='k'); ax[0].scatter(dv[::30,0],dv[::30,1],s=0.2,c='g')
ax[0].set_aspect('equal');ax[1].set_aspect('equal'); plt.savefig('lung_surface.png',dpi=60)
