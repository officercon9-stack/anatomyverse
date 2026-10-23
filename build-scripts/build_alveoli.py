import sys,numpy as np,json
sys.path.insert(0,'.')
from glbtools import *
rng=np.random.default_rng(5)
def nz(v): return v/(np.linalg.norm(v)+1e-12)
def sphere_mesh(c,r,nu=28,nv=18,flip=False):
    u=np.linspace(0,2*np.pi,nu,endpoint=False); v=np.linspace(0,np.pi,nv)
    X=np.array([c+r*np.array([np.sin(b)*np.cos(a),np.cos(b),np.sin(b)*np.sin(a)]) for b in v for a in u]); F=[]
    for j in range(nv-1):
        for i in range(nu):
            a=j*nu+i;b=j*nu+(i+1)%nu;c2=a+nu;d=b+nu; F+=[(a,c2,b),(b,c2,d)] if not flip else [(a,b,c2),(b,d,c2)]
    return X,np.array(F)
nodes=[];omap={}
def add(n,sid,V,F,col,a=1.0,rough=0.4): nodes.append(dict(name=n,V=V,F=F,color=col,alpha=a,rough=rough)); omap[n]=sid
C0=np.array([0.075,0.0,0.0]); R=0.027
# alveoli: central atrium + 8 around (fibonacci)
cent=[C0]; 
k=8; 
for i in range(k):
    y=1-2*(i+0.5)/k; rr=np.sqrt(1-y*y); th=i*np.pi*(3-np.sqrt(5)); d=np.array([y,rr*np.cos(th),rr*np.sin(th)])
    if d[0]<-0.85: d=nz(d+np.array([0.6,0,0]))
    cent.append(C0+d*0.047)
cent=np.array(cent); rad=[0.021]+[R]*k
meshes=[]
for c,r in zip(cent,rad):
    meshes.append(sphere_mesh(c,r)); meshes.append(sphere_mesh(c,r-0.0006,flip=True))
V,F=merge(meshes); add('alveoli','alveoli',V,F,0xF3B3AC,0.26,0.25)
# airways
path=lambda pts:np.array([np.array(p,float) for p in pts])
RB=path([(-0.20,0.05,0.0),(-0.15,0.035,0.0),(-0.11,0.02,0.0)]); V,F=tube(RB,0.0085,14); add('respiratory_bronchiole','respiratory-bronchiole',V,F,0xEBD7C4,0.85,0.4)
AD=path([(-0.11,0.02,0.0),(-0.06,0.008,0.0),(-0.015,0.0,0.0),(0.03,0.0,0.0)]); V,F=tube(AD,np.array([0.0078,0.0075,0.0072,0.0070]),14); add('alveolar_duct','alveolar-duct',V,F,0xE6C9B4,0.85,0.4)
# vessels
ART=path([(-0.16,-0.13,0.03),(-0.08,-0.11,0.03),(0.00,-0.085,0.02),(0.05,-0.07,0.012)]); V,F=tube(ART,np.array([0.0075,0.007,0.0062,0.005]),12); add('pulmonary_arteriole','pulmonary-arteriole',V,F,0x4B63C9,0.95,0.35)
VEN=path([(0.085,0.075,0.012),(0.07,0.10,0.025),(-0.02,0.125,0.035),(-0.12,0.135,0.04),(-0.18,0.14,0.04)]); V,F=tube(VEN,np.array([0.005,0.0062,0.0072,0.008,0.0085]),12); add('pulmonary_venule','pulmonary-venule',V,F,0xD9362F,0.95,0.35)
# capillary arcs around each of the 8 outer alveoli
arcs=[]
for ci in range(1,len(cent)):
    c=cent[ci]
    for kk in range(6):
        n=nz(rng.normal(size=3)); u=nz(np.cross(n,rng.normal(size=3))); w=np.cross(n,u)
        a0=rng.uniform(0,2*np.pi); span=np.pi*rng.uniform(1.1,1.7); ts=np.linspace(0,span,28)
        P=np.array([c+(R+0.0024+0.0010*np.sin(5*t+kk))*(np.cos(a0+t)*u+np.sin(a0+t)*w) for t in ts]); arcs.append(P)
V,F=merge([tube(P,0.0026,6) for P in arcs]); add('pulmonary_capillaries','pulmonary-capillaries',V,F,0xB0405A,0.95,0.4)
# cells
sm=[]
for ci in range(1,len(cent)):
    c=cent[ci]
    for kk in range(2):
        d=nz(rng.normal(size=3)); 
        if d[0]<-0.5: d[0]*=-1
        sm.append(sphere_mesh(c+d*(R-0.0028),0.0045,10,8))
V,F=merge(sm); add('type_ii_pneumocytes','type-ii-pneumocyte',V,F,0xE8C14A,1.0,0.5)
mc=cent[3]; d=nz(np.array([0.2,-0.6,0.5])); mp=mc+d*(R-0.013)
mm=[sphere_mesh(mp,0.0085,14,10)]+[sphere_mesh(mp+nz(rng.normal(size=3))*0.0075,0.0035,8,6) for _ in range(9)]
V,F=merge(mm); add('alveolar_macrophage','alveolar-macrophage',V,F,0x93A87F,1.0,0.6)
print(write_glb(nodes,'alveoli.glb','anatomyverse-alveoli.glb.json')); json.dump(omap,open('alveoli_objectmap.json','w'))
# ----- flow routes -----
enc=lambda P:np.round(np.asarray(P)*1e4).astype(int).reshape(-1).tolist()
from vnet import smooth_resample
rbc=[enc(P) for P in arcs]
art=[enc(smooth_resample(ART,0.004,1))]; ven=[enc(smooth_resample(VEN,0.004,1))]
o2=[];co2=[]
for ci in range(1,len(cent)):
    c=cent[ci]
    for kk in range(7):
        d=nz(rng.normal(size=3)); lum=c+nz(rng.normal(size=3))*R*rng.uniform(0,0.55); wall=c+d*(R+0.0024)
        mid=c+d*(R-0.003)
        o2.append(enc([lum,mid,wall])); 
        d2=nz(rng.normal(size=3)); wall2=c+d2*(R+0.0024); lum2=c+nz(rng.normal(size=3))*R*rng.uniform(0,0.5)
        co2.append(enc([wall2,c+d2*(R-0.003),lum2]))
air=[enc(smooth_resample(np.vstack([RB,AD,[C0],[cent[2]]]),0.004,1))]
json.dump(dict(off=[-0.075,1.2,0],rbc=rbc,art=art,ven=ven,o2=o2,co2=co2,air=air),open('alveoli-flow.json','w'),separators=(',',':'))
print(len(rbc),len(o2))
