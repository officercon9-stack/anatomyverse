import numpy as np
from PIL import Image
def sample(P,F,n,rng):
    a=P[F[:,0]];b=P[F[:,1]];c=P[F[:,2]]
    cr=np.cross(b-a,c-a);ar=np.linalg.norm(cr,axis=1);ar=np.where(np.isfinite(ar),ar,0)
    if ar.sum()<=0: return np.zeros((0,3)),np.zeros((0,3))
    idx=rng.choice(len(F),size=n,p=ar/ar.sum())
    u=rng.random(n);v=rng.random(n);m=u+v>1;u[m]=1-u[m];v[m]=1-v[m]
    pts=a[idx]+(b[idx]-a[idx])*u[:,None]+(c[idx]-a[idx])*v[:,None]
    nr=cr[idx]/np.maximum(ar[idx],1e-12)[:,None]
    return pts,nr
def render(parts,view='front',H=900,pad=0.03,bounds=None,npts=1200000,up=1,bg=(18,24,48),twoside=True,seed=0):
    """parts: list of (P,F,rgb). Y-up coordinates by default (up=1). view: front(+z toward viewer), back, left, right"""
    rng=np.random.default_rng(seed)
    tot=sum(len(F) for _,F,_ in parts) or 1
    pts=[];nrm=[];col=[]
    for P,F,c in parts:
        n=max(2000,int(npts*len(F)/tot));p,nr=sample(P,F,n,rng);pts.append(p);nrm.append(nr);col.append(np.tile(np.array(c,float),(len(p),1)))
    pts=np.vstack(pts);nrm=np.vstack(nrm);col=np.vstack(col)
    ax_up=up;others=[i for i in range(3) if i!=ax_up]
    # assume y-up: x right, z toward viewer for front
    if view=='front': right=np.array([1,0,0]);fwd=np.array([0,0,1])
    elif view=='back': right=np.array([-1,0,0]);fwd=np.array([0,0,-1])
    elif view=='left': right=np.array([0,0,1]);fwd=np.array([-1,0,0])
    elif view=='right': right=np.array([0,0,-1]);fwd=np.array([1,0,0])
    elif view=='q': right=np.array([0.8,0,-0.6]);fwd=np.array([0.6,0,0.8])
    upv=np.array([0,1,0])
    x=pts@right;y=pts@upv;d=pts@fwd
    if bounds is None: bounds=(x.min(),x.max(),y.min(),y.max())
    x0,x1,y0,y1=bounds;sc=(H*(1-2*pad))/(y1-y0);W=int((x1-x0)*sc+2*pad*H)+1
    px=((x-x0)*sc+pad*H).astype(int);py=(H-1-((y-y0)*sc+pad*H)).astype(int)
    ok=(px>=0)&(px<W)&(py>=0)&(py<H)
    L=np.array([0.35,0.45,0.82]);L=L/np.linalg.norm(L)
    Lv=L[0]*right+L[1]*upv+L[2]*fwd
    sh=nrm@Lv
    facing=nrm@fwd
    if twoside: sh=np.where(facing<0,-sh,sh)
    sh=0.28+0.72*np.clip(sh,0,1)
    rgb=np.clip(col*sh[:,None],0,255)
    order=np.argsort(d[ok])
    img=np.zeros((H,W,3),np.uint8);img[:]=bg
    pxo=px[ok][order];pyo=py[ok][order];c=rgb[ok][order].astype(np.uint8)
    for dx in (0,1):
        for dy in (0,1):
            xx=np.clip(pxo+dx,0,W-1);yy=np.clip(pyo+dy,0,H-1);img[yy,xx]=c
    return Image.fromarray(img)
def sheet(imgs,out):
    W=sum(i.size[0] for i in imgs);H=max(i.size[1] for i in imgs);s=Image.new('RGB',(W,H),(18,24,48));x=0
    for i in imgs: s.paste(i,(x,0));x+=i.size[0]
    s.save(out);return s
