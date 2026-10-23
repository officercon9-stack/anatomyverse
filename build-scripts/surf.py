import sys,numpy as np,pickle
sys.path.insert(0,'.')
import make_glb3 as mg
from scipy.spatial import cKDTree
# per-piece vertices in local metres
P={k:(mg.T(mg.out[k][0])-mg.C)*0.001 for k in mg.KEEP if mg.out[k][2]['group']!='Skull'}
F={k:mg.out[k][1] for k in P}
allv=np.vstack(list(P.values()))
# outer surface: radial map r(dir) about a centre
CEN=np.array([0,0.0,-0.005])
def dirs(v):
    d=v-CEN; r=np.linalg.norm(d,axis=1); return d/r[:,None],r
NL,NA=90,180   # latitude (from -90..90 via y), azimuth bins
d,r=dirs(allv)
lat=np.arcsin(np.clip(d[:,1],-1,1)); az=np.arctan2(d[:,0],d[:,2])  # az=0 -> +z (front); +x = patient's left
li=np.clip(((lat+np.pi/2)/np.pi*NL).astype(int),0,NL-1); ai=((az+np.pi)/(2*np.pi)*NA).astype(int)%NA
R=np.zeros((NL,NA))
np.maximum.at(R,(li,ai),r)
# fill empty bins & smooth a little (max filter then mean)
from scipy.ndimage import maximum_filter,uniform_filter
for _ in range(3):
    Rf=maximum_filter(R,size=3,mode=('nearest','wrap')); R=np.where(R>0,R,Rf)
Rs=uniform_filter(maximum_filter(R,size=3,mode=('nearest','wrap')),size=3,mode=('nearest','wrap'))
def surf_r(dirn):
    dirn=np.atleast_2d(dirn); dirn=dirn/np.linalg.norm(dirn,axis=1)[:,None]
    la=np.arcsin(np.clip(dirn[:,1],-1,1)); a=np.arctan2(dirn[:,0],dirn[:,2])
    fi=(la+np.pi/2)/np.pi*NL-.5; fj=(a+np.pi)/(2*np.pi)*NA-.5
    i0=np.clip(np.floor(fi).astype(int),0,NL-2); j0=np.floor(fj).astype(int); ti=np.clip(fi-i0,0,1); tj=fj-j0
    j1=(j0+1)%NA; j0%=NA
    return (Rs[i0,j0]*(1-ti)*(1-tj)+Rs[i0+1,j0]*ti*(1-tj)+Rs[i0,j1]*(1-ti)*tj+Rs[i0+1,j1]*ti*tj)
def surf_pt(dirn,off=0.0005):
    dirn=np.atleast_2d(dirn); dirn=dirn/np.linalg.norm(dirn,axis=1)[:,None]
    return CEN+dirn*(surf_r(dirn)+off)[:,None]
def to_dir(p):
    d=np.atleast_2d(p)-CEN; return d/np.linalg.norm(d,axis=1)[:,None]
def slerp_path(d0,d1,n,off=0.0005,lift=0.0):
    d0=d0/np.linalg.norm(d0); d1=d1/np.linalg.norm(d1)
    w=np.arccos(np.clip(d0@d1,-1,1)); t=np.linspace(0,1,n)
    if w<1e-6: ds=np.tile(d0,(n,1))
    else: ds=(np.sin((1-t)*w)[:,None]*d0+np.sin(t*w)[:,None]*d1)/np.sin(w)
    pts=surf_pt(ds,off)
    if lift: pts=pts+ds*(np.sin(np.pi*t)*lift)[:,None]
    return pts
if __name__=='__main__':
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    fig,ax=plt.subplots(1,3,figsize=(18,6))
    th=np.linspace(0,2*np.pi,360)
    for a,(t,f) in zip(ax,[('sagittal',lambda th:(np.sin(th),0*th,np.cos(th))),('coronal',lambda th:(0*th,np.sin(th),np.cos(th))),('axial',lambda th:(np.sin(th),np.cos(th),0*th))]):
        pass
    sel=allv[::10]
    for a,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('axi',0,2)]):
        a.scatter(sel[:,i],sel[:,j],s=.3,c='#ccc')
        # sample sphere dirs near the plane
        for ang in np.linspace(0,2*np.pi,200):
            if t=='sag': dd=np.array([0,np.sin(ang),np.cos(ang)])
            elif t=='cor': dd=np.array([np.sin(ang),np.cos(ang),0.0001])
            else: dd=np.array([np.sin(ang),0.0001,np.cos(ang)])
            p=surf_pt(dd,0)[0]; a.plot(p[i],p[j],'r.',ms=2)
        a.set_aspect('equal'); a.set_title(t)
    plt.savefig('viz_surf.png',dpi=65)
    print('verts',len(allv))
