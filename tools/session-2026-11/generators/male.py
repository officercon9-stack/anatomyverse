import numpy as np, json
from sdf import *
from scipy.ndimage import gaussian_filter
rng=np.random.default_rng(3)
D=json.load(open('zdd.json'))
meshes={}
# ---- spermatic cord pieces: centreline from ductus mesh rings
def centre(v,y0,y1,step=0.004):
    v=np.array(v);pts=[]
    for y in np.arange(y0,y1+1e-6,step):
        r=v[abs(v[:,1]-y)<0.0017]
        if len(r): pts.append(r.mean(0))
    return np.array(pts)
def tube(path,r0,r1,rs=10,seg=3):
    # catmull-rom resample then sweep
    path=np.array(path);P=[path[0]]+list(path)+[path[-1]];out=[]
    for i in range(1,len(P)-2):
        for t in np.linspace(0,1,seg,endpoint=False):
            p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2];t2,t3=t*t,t*t*t
            out.append(0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3))
    out.append(path[-1]);C=np.array(out);n=len(C);V=[];F=[]
    for i in range(n):
        T=C[min(n-1,i+1)]-C[max(0,i-1)];T/=np.linalg.norm(T)
        u=np.array([0,1.0,0]) if abs(T[1])<0.9 else np.array([1.0,0,0])
        N=np.cross(T,u);N/=np.linalg.norm(N);B=np.cross(T,N);r=r0+(r1-r0)*i/(n-1)
        for j in range(rs):
            a=2*np.pi*j/rs;V.append(C[i]+r*(np.cos(a)*N+np.sin(a)*B))
    for i in range(n-1):
        for j in range(rs):
            a=i*rs+j;b=i*rs+(j+1)%rs;c=(i+1)*rs+j;d=(i+1)*rs+(j+1)%rs;F+=[[a,b,c],[b,d,c]]
    return np.array(V),np.array(F)
def merge(parts):
    V=[];F=[];o=0
    for v,f in parts: V.append(v);F.append(f+o);o+=len(v)
    return np.vstack(V),np.vstack(F)
cord_parts=[];sheath_parts=[];art_parts=[];vein_parts=[]
for k,sg in(('l',1),('r',-1)):
    v=D['dd_'+k]['v'];cl=centre(np.array(v)*np.array([sg,1,1]),0.742,0.855,0.004)*np.array([sg,1,1])
    # sheath along the scrotal/inguinal segment only
    top=cl[cl[:,1]>=0.764]
    sv,sf=tube(top,0.0048,0.0048,rs=14,seg=3);sheath_parts.append((sv,sf))
    # helical companions
    L=len(top);seg=np.linspace(0,1,L)
    def helix(off,turns,ph,r):
        P=[]
        for i,p in enumerate(top):
            T=top[min(L-1,i+1)]-top[max(0,i-1)];T/=np.linalg.norm(T);u=np.array([1.0,0,0]);N=np.cross(T,u);N/=np.linalg.norm(N);B=np.cross(T,N)
            a=ph+turns*2*np.pi*seg[i];P.append(p+off*(np.cos(a)*N+np.sin(a)*B))
        return tube(np.array(P),r,r,rs=8,seg=4)
    art_parts.append(helix(0.0016,2.2,0.0,0.0006))
    for q in range(5):
        vein_parts.append(helix(0.0025+0.0004*(q%2),1.6,q*2*np.pi/5,0.00065))
# ductus deferens full Z mesh (bevel 1.3mm)
dd=[(np.array(D['dd_'+k]['v']),np.array(D['dd_'+k]['f'])) for k in('l','r')]
meshes['mc_ductus']=dict(zip(('v','f'),map(lambda a:a.tolist(),merge(dd))),open=True,c=[0.93,0.89,0.80])
meshes['mc_sheath']=dict(zip(('v','f'),map(lambda a:a.tolist(),merge(sheath_parts))),open=True,c=[0.92,0.86,0.78],alpha=0.28,ds=True,rough=0.8)
meshes['mc_artery']=dict(zip(('v','f'),map(lambda a:a.tolist(),merge(art_parts))),open=True,c=[0.78,0.2,0.2])
meshes['mc_pampiniform']=dict(zip(('v','f'),map(lambda a:a.tolist(),merge(vein_parts))),open=True,c=[0.42,0.45,0.75])
# ---- scrotum SDF
res=0.0008
lo=(-0.055,0.700,0.025);hi=(0.055,0.815,0.100)
P,ax=grid(lo,hi,res)
F=np.full(P.shape[:-1],1.0)
fr=None
for sg in(1,-1):
    c=np.array([sg*0.0205,0.745,0.0605])
    F=smin(F,ell(P,c+np.array([0,0.0025,0]),(0.0200,0.0250,0.0225)),0.008)
    F=smin(F,ell(P,c+np.array([sg*-0.002,0.020,-0.004]),(0.0160,0.0170,0.0185)),0.010)
F=smin(F,ell(P,[0,0.790,0.054],(0.034,0.020,0.020)),0.010)
# rugae: gentle transverse ridges fading near the neck
yy=P[...,1];xx=P[...,0]
ridge=0.00018*np.sin((yy-0.70)/0.0055*2*np.pi)*np.clip((0.78-yy)/0.03,0,1)*(1+0.5*np.sin(xx/0.006))
F=F+ridge
# median raphe groove
F=F+0.0006*np.exp(-(xx/0.0022)**2)*np.clip((0.78-yy)/0.03,0,1)
v,f=mesh(F,ax,res,0.7)
meshes['scrotum']=dict(zip(('v','f'),(np.round(v,5).tolist(),f.tolist())),c=[0.80,0.60,0.50],alpha=0.42,ds=True,rough=0.75)
for k,d in meshes.items(): print(k,len(d['v']),len(d['f']))
json.dump(meshes,open('male.json','w'))
