import numpy as np, json
from skimage import measure
from scipy.ndimage import gaussian_filter
def smin(a,b,k):
    h=np.clip(0.5+0.5*(b-a)/k,0,1);return b*(1-h)+a*h-k*h*(1-h)
def ell(P,c,r,frame=None):
    q=P-np.array(c)
    if frame is not None: q=np.stack([q@frame[0],q@frame[1],q@frame[2]],-1)
    r=np.array(r);return (np.linalg.norm(q/r,axis=-1)-1)*float(r.min())
def capsule(P,a,b,ra,rb):
    a=np.array(a);b=np.array(b);pa=P-a;ba=b-a;h=np.clip((pa@ba)/(ba@ba),0,1)
    return np.linalg.norm(pa-h[...,None]*ba,axis=-1)-(ra+(rb-ra)*h)
def grid(lo,hi,res):
    ax=[np.arange(l,h,res) for l,h in zip(lo,hi)];X,Y,Z=np.meshgrid(*ax,indexing='ij');return np.stack([X,Y,Z],-1),ax
def mesh(F,ax,res,smooth=0.6):
    F=gaussian_filter(F,smooth)
    v,f,n,_=measure.marching_cubes(F,0,spacing=(res,)*3)
    v=v+np.array([a[0] for a in ax]);
    return v,f
def out(v,f,flip=False):
    f=f[:,::-1] if flip else f
    return {'v':np.round(v,5).tolist(),'f':f.tolist()}
