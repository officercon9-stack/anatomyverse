import sys,numpy as np,json,trimesh
sys.path.insert(0,'.')
from glbtools import *
from cl import smooth_resample
O=np.array([0,1.425,0.015])
V=np.load('dia_V.npy'); F=np.load('dia_F.npy'); M=trimesh.Trimesh(V,F,process=False)
C=np.array([0.0,0.03])  # xz centre
# rim radius by angle
ang=np.degrees(np.arctan2(V[:,0]-C[0],V[:,2]-C[1])); rad=np.hypot(V[:,0]-C[0],V[:,2]-C[1])
bins=np.arange(-180,181,10); rim=np.zeros(len(bins))
for i,b in enumerate(bins):
    d=np.abs(((ang-b+180)%360)-180); s=d<8; rim[i]=rad[s].max() if s.any() else rad.max()*.7
def rimr(t): return np.interp(((t+180)%360)-180,bins,rim)
def xz(t,r): 
    t=np.radians(t); R=r*rimr(np.degrees(t)); return np.array([C[0]+R*np.sin(t),C[1]+R*np.cos(t)])
def hits(p):
    o=np.array([[p[0],2.0,p[1]]]); loc,_,_=M.ray.intersects_location(o,np.array([[0,-1,0.]]))
    return np.sort(loc[:,1]) if len(loc) else np.array([])
def snap(p,side,off):
    for dx,dz in ((0,0),(.004,0),(-.004,0),(0,.004),(0,-.004),(.008,.008),(-.008,-.008),(.008,-.008),(-.008,.008)):
        h=hits((p[0]+dx,p[1]+dz))
        if len(h): 
            y=h[-1]+off if side=='top' else h[0]-off
            return np.array([p[0],y,p[1]])
    d=np.hypot(V[:,0]-p[0],V[:,2]-p[1]); k=np.argsort(d)[:6]; y=V[k,1].mean()
    return np.array([p[0],y+off if side=='top' else y-off,p[1]])
def path(P,side,off=0.0025,step=0.003):
    pts=np.array([snap(p,side,off) for p in P]); return smooth_resample(pts,step,2)
def polar(wp): return [xz(t,r) for t,r in wp]
routes={'nerve':[],'ia':[],'sa':[],'ma':[],'pa':[],'ic':[]}
def A(p): return np.asarray(p)
for s in (1,-1):
    pt=(60*s,.55) if s==1 else (-38*s*-1,.32)   # piercing point (theta,rho) : left muscle, right caval opening
    pt=(60,.55) if s==1 else (-35,.32)
    th0,r0=pt
    # trunk down the mediastinum to the dome top, then through
    top=snap(xz(th0,r0),'top',0.0025)
    trunk=np.array([[s*.034,1.48,.015],[s*.042,1.38,.03],[s*.05,1.32,.042],[top[0]*.9+s*.005*.1,top[1]+.045,top[2]*.9+.004],top])-np.array([0,0,0])
    trunk[3]=[top[0],top[1]+.04,top[2]]
    bot=snap(xz(th0,r0),'bot',0.0025)
    thru=np.array([top,[top[0],(top[1]+bot[1])/2,top[2]],bot])
    routes['nerve'].append(smooth_resample(np.vstack([trunk,thru[1:]]),0.003,2))
    sg=1 if s==1 else -1
    mir=lambda wp:[(sg*t if s==1 else t, r) for t,r in wp]
    # branches on underside (abdominal surface): anterior, lateral, posterior
    if s==1: 
        br=[[(60,.55),(45,.7),(25,.88),(8,.95)],[(60,.55),(75,.75),(95,.92)],[(60,.55),(85,.45),(120,.7),(150,.9)],[(60,.55),(30,.4),(5,.5)],[(60,.55),(100,.55),(130,.55),(165,.5)]]
    else:
        br=[[(-35,.32),(-30,.6),(-22,.85),(-10,.95)],[(-35,.32),(-60,.6),(-85,.92)],[(-35,.32),(-70,.4),(-110,.7),(-145,.9)],[(-35,.32),(-5,.35),(5,.5)],[(-35,.32),(-85,.5),(-120,.55),(-165,.5)]]
    for b in br: routes['nerve'].append(path(polar(b),'bot',0.0025))
    # inferior phrenic artery from aorta (aortic hiatus), underside, fans out
    a0=np.array([0.016*s*.0+0.02,-0.046])
    for nm,wp in (('a',[(s*165,.8),(s*140,.8),(s*105,.82),(s*80,.8),(s*45,.8)] ),('b',[(s*165,.8),(s*125,.6),(s*100,.45),(s*70,.45),(s*45,.5)]),('c',[(s*165,.8),(s*150,.95),(s*120,.97),(s*100,.97)])):
        pts=polar(wp); pts[0]=a0 if True else pts[0]
        pth=path(pts,'bot',0.003)
        routes['ia'].append(pth)
    stub=np.array([[0.02,snap(a0,'bot',0.003)[1]-.04,a0[1]],[0.02,snap(a0,'bot',0.003)[1]-.015,a0[1]]]) if s==1 else None
    # superior phrenic artery: thoracic aorta -> top surface posterior
    for wp in ([(s*172,.85),(s*150,.7),(s*125,.55)],[(s*172,.85),(s*160,.5),(s*140,.35)]):
        pts=polar(wp); pts[0]=np.array([0.02,-0.04]); routes['sa'].append(path(pts,'top',0.003))
    # musculophrenic artery along the costal margin on top
    rimw=[(s*5,.9),(s*30,.92),(s*55,.93),(s*80,.93),(s*105,.92),(s*130,.9),(s*150,.86)]
    routes['ma'].append(path(polar(rimw),'top',0.003))
    routes['ma'].append(path(polar([(s*30,.92),(s*28,.65),(s*25,.45)]),'top',0.003))
    routes['ma'].append(path(polar([(s*80,.93),(s*70,.7),(s*62,.58)]),'top',0.003))
    # pericardiophrenic artery: runs beside the phrenic trunk (thoracic side)
    pa=trunk[:4].copy(); pa[:,0]+=s*0.0045; pa[:,2]+=0.0035; routes['pa'].append(smooth_resample(np.vstack([pa,snap(xz(th0,r0),'top',0.004)[None]]),0.003,2))
    # lower intercostal and subcostal nerves: along the rim on underside, with stubs inward
    ic=polar([(s*(30+25*i),.97) for i in range(6)]); 
    routes['ic'].append(path(polar([(s*t,.965) for t in range(25,160,12)]),'bot',0.003))
    for t in (35,60,85,110,135):
        routes['ic'].append(path(polar([(s*t,.965),(s*t,.82)]),'bot',0.003))
nodes=[];omap={}
def add(name,sid,key,r,col,rough=.5,em=None):
    Vv,Fv=merge([tube(p,r,6) for p in routes[key]]); n=dict(name=name,V=Vv-O,F=Fv,color=col,rough=rough)
    if em: n['emissive']=em
    nodes.append(n); omap[name]=sid; print(name,len(Vv))
add('phrenic_nerve_dia','phrenic-nerve','nerve',.0021,0xF0CF45,.45)
add('inferior_phrenic_a','inferior-phrenic-artery','ia',.0019,0xD62F2F)
add('superior_phrenic_a','superior-phrenic-artery','sa',.0014,0xE0453F)
add('musculophrenic_a','musculophrenic-artery','ma',.0017,0xC83A5A)
add('pericardiophrenic_a','pericardiophrenic-artery','pa',.0013,0xE8584F)
add('lower_intercostal_n','lower-intercostal-nerves','ic',.0013,0xB8E05A,.45)
print(write_glb(nodes,'dia-supply.glb','anatomyverse-diasupply.glb.json'))
json.dump(omap,open('diasupply_objectmap.json','w'))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,2,figsize=(14,7)); cols={'nerve':'gold','ia':'r','sa':'m','ma':'b','pa':'orange','ic':'g'}
for k,L in routes.items():
    for p in L:
        ax[0].plot(p[:,0],p[:,2],c=cols[k]); ax[1].plot(p[:,0],p[:,1],c=cols[k])
ax[0].plot(V[:,0],V[:,2],'k.',ms=.5); ax[1].plot(V[:,0],V[:,1],'k.',ms=.5)
for a in ax: a.set_aspect('equal')
plt.savefig('viz_dia.png',dpi=60)
