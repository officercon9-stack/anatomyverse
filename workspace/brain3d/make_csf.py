import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from glbtools import *
from vnet import *
from surf import surf_r,P as BP
N=pickle.load(open('net.pkl','rb')); S=N['S']
# --- smooth hull from radial map ---
def hull(off,nl=72,na=144,lapl=3):
    la=np.linspace(-np.pi/2+0.02,np.pi/2-0.02,nl); az=np.linspace(-np.pi,np.pi,na,endpoint=False)
    LA,AZ=np.meshgrid(la,az,indexing='ij')
    D=np.stack([np.sin(AZ)*np.cos(LA),np.sin(LA),np.cos(AZ)*np.cos(LA)],-1).reshape(-1,3)
    r=surf_r(D)+off; Pn=(CEN+D*r[:,None]).reshape(nl,na,3)
    for _ in range(lapl):
        Pn=(Pn+np.roll(Pn,1,1)+np.roll(Pn,-1,1))/3; Pn[1:-1]=(Pn[1:-1]*2+Pn[:-2]+Pn[2:])/4
    V=Pn.reshape(-1,3); F=[]
    for i in range(nl-1):
        for j in range(na):
            a=i*na+j; b=i*na+(j+1)%na; c=a+na; d=b+na; F+=[(a,c,b),(b,c,d)]
    # caps
    top=len(V); V=np.vstack([V,Pn[-1].mean(0),Pn[0].mean(0)]); bot=top+1
    for j in range(na): F.append(((nl-1)*na+j,top,(nl-1)*na+(j+1)%na)); F.append((j,(j+1)%na,bot))
    return V,np.array(F)
def ellipsoid(c,r,n=18,rot=None):
    u=np.linspace(0,np.pi,n); v=np.linspace(0,2*np.pi,2*n,endpoint=False); U,Vv=np.meshgrid(u,v,indexing='ij')
    X=np.stack([np.sin(U)*np.cos(Vv)*r[0],np.cos(U)*r[1],np.sin(U)*np.sin(Vv)*r[2]],-1).reshape(-1,3)
    V=X+np.array(c); F=[]; m=2*n
    for i in range(n-1):
        for j in range(m): a=i*m+j; b=i*m+(j+1)%m; F+=[(a,a+m,b),(b,a+m,b+m)]
    return V,np.array(F)
nodes=[]; omap={}
def add(name,sid,V,F,color,**kw): nodes.append(dict(name=name,V=V,F=F,color=color,**kw)); omap[name]=sid
V,F=hull(0.0028); add('csf_shell','subarachnoid-space',V,F,0x7FE3FF,alpha=0.32,rough=0.2)
cist=[ellipsoid((0,-0.064,-0.032),(0.014,0.0085,0.011)), ellipsoid((0,-0.037,0.034),(0.012,0.010,0.0065)), ellipsoid((0,-0.0035,-0.0375),(0.0085,0.0085,0.0075)), ellipsoid((0,-0.019,0.046),(0.012,0.007,0.008))]
V,F=merge(cist); add('cisterns','subarachnoid-cisterns',V,F,0x3FC4F5,alpha=0.55,rough=0.2)
# --- choroid plexus along each lateral ventricle (geodesic centreline) ---
cps={}
for sd in ('r','l'):
    v=BP['lat_vent_'+sd]; f=mg_f=None
import make_glb3 as mg
for sd in ('r','l'):
    k='lat_vent_'+sd; Vv=BP[k]; Ff=mg.out[k][1].astype(np.int64)
    used=np.unique(Ff); remap=np.full(len(Vv),-1); remap[used]=np.arange(len(used)); T=Tree(Vv[used],remap[Ff])
    # root: rear-most vertex (atrium/occipital horn); target: farthest from it (anterior horn)
    root=int(np.argmin(T.V[:,2])); d,p=T.dist(root); d=np.where(np.isfinite(d),d,-1); tgt=int(np.argmax(d))
    cps[sd]=smooth_resample(T.centre(T.path(p,tgt),0.0035),0.0015,3)
    print(sd,'ventricle centreline',len(cps[sd]),cps[sd][0].round(3),cps[sd][-1].round(3))
V,F=merge([tube(cps['r'][2:-2],0.0012,6),tube(cps['l'][2:-2],0.0012,6)]); add('choroid','choroid-plexus',V,F,0xE58FB4)
# arachnoid granulations along the SSS
gr=[]
for i in range(3,len(S['sss'])-3,2):
    p=S['sss'][i]
    for s in (-1,1): gr.append(ellipsoid(p+np.array([s*0.0046,-0.0006,0]),(0.0020,0.0018,0.0024),8))
V,F=merge(gr); add('granulations','arachnoid-granulations',V,F,0xD8ECFF,rough=0.5)
# --- CSF flow routes (local metres) ---
def vent_pts(name,top_first=True):
    Vv=BP[name]; return Vv
tv=BP['third_vent']; aq=BP['aqueduct']; fv=BP['fourth_vent']
monro=np.array([0,0.0095,0.0335])
# third ventricle path: foramen of Monro -> floor/back -> aqueduct top
aq_top=aq[np.argmax(aq[:,1])]; aq_bot=aq[np.argmin(aq[:,1])]
third=bez(monro,monro+np.array([0,-0.007,-0.004]),aq_top+np.array([0,0.006,0.012]),aq_top,10)
aqp=smooth_resample(np.array([aq_top,aq.mean(0),aq_bot]),0.0015,0)
fv_top=fv[np.argmax(fv[:,1])]; fv_bot=fv[np.argmin(fv[:,1])]
fourth=bez(aq_bot,aq_bot+np.array([0,-0.004,-0.002]),fv_top+np.array([0,0.003,0.002]),np.array([0,-0.047,-0.014]),8)
mag=np.array([0,-0.060,-0.024]); cm=np.array([0,-0.064,-0.032])
exit_=bez(fourth[-1],np.array([0,-0.052,-0.020]),np.array([0,-0.058,-0.026]),cm,8)
def lv_route(sd):
    c=cps[sd]; j=int(np.argmin(np.linalg.norm(c-monro,axis=1)))
    # pick the end of the centreline closest to Monro, travel from the far end through the body
    i0=0 if np.linalg.norm(c[0]-monro)>np.linalg.norm(c[-1]-monro) else len(c)-1
    seg=c[:j+1] if i0==0 else c[j:][::-1]
    return np.vstack([seg,bez(seg[-1],seg[-1]+np.array([0,0.0,0.004]),monro+np.array([0,0.003,-0.003]),monro,6)[1:]])
routes_csf=[]
cis_outs=[]
sg=S['sss']
for sd,s in (('r',-1),('l',1)):
    lv=lv_route(sd)
    base=np.vstack([lv,third[1:],aqp[1:],fourth[1:],exit_[1:]])
    # subarachnoid paths from cisterna magna
    d0=to_dir(cm)[0]
    for ang,lat in ((-170,35),(-140,45),(-120,12)):
        # up the back over the convexity to the granulations
        dA=dir_az_lat(ang*(1 if s>0 else -1)*-1 if False else (ang if s<0 else -ang),lat)
        mid=slerp_path(d0,dA,12,-0.0012,0.0)
        end_i=int(np.argmin(np.abs(sg[:,2]-(0.05*np.cos(np.radians(ang))*-1))))
        gp=sg[end_i]+np.array([s*0.0046,-0.0006,0]); dg=to_dir(gp)[0]
        up=slerp_path(dA,dg,12,0.0015,0.0)
        route=np.vstack([base,mid[1:],up[1:],gp[None]])
        routes_csf.append(route)
    # forward along the base (prepontine cistern) then up the lateral convexity
    base_f=np.vstack([base[:-8],bez(base[-8],np.array([s*0.016,-0.050,-0.020]),np.array([s*0.030,-0.050,0.010]),np.array([s*0.030,-0.038,0.034]),10)[1:]])
    dB=to_dir(base_f[-1])[0]; dT=dir_az_lat(-60 if s<0 else 60,50)
    side=slerp_path(dB,dT,12,0.0014,0.0)
    gi=int(np.argmin(np.abs(sg[:,2]-0.01))); gp=sg[gi]+np.array([s*0.0046,-0.0006,0]); up=slerp_path(dT,to_dir(gp)[0],10,0.0015,0.0)
    routes_csf.append(np.vstack([base_f,side[1:],up[1:],gp[None]]))
# spinal branch: down the central canal / spinal subarachnoid space
from cordlib import cord as _cord, OFF as _OFF
_br=np.array([[0,-0.0838,-0.0135],[0,-0.1005,-0.0215],[0,-0.1130,-0.0268],[0,-0.1205,-0.0285],[0,-0.1235,-0.0290]])
_cc=_cord(0,0.93,0.01)-_OFF
_cc=_cc[_cc[:,1]<_br[-1,1]]
_spin=np.vstack([[[0,-0.050,-0.014],[0,-0.065,-0.008],[0,-0.080,-0.004]],_br,_cc])
routes_csf.append(np.vstack([lv_route('r'),third[1:],aqp[1:],fourth[1:],_spin[1:]]))
from glbtools import tube as _tb
_sp=np.vstack([_br[2:],_cc[::3]]); _sp[:,2]+=0.0
V,F=_tb(_sp,np.r_[np.full(len(_br)-2,0.0105),np.full(len(_cc[::3]),0.0105)],12); add('thecal_sac','subarachnoid-space',V,F,0x7FE3FF,alpha=0.35,rough=0.2)
print('csf routes',len(routes_csf),[len(r) for r in routes_csf])
pickle.dump(dict(routes=routes_csf),open('csf_routes.pkl','wb'))
print(write_glb(nodes,'brain-csf.glb','bodyparts3d-brain-csf.glb.json')); json.dump(omap,open('csf_objectmap.json','w'))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(21,7)); allb=np.vstack(list(BP.values()))[::12]
for a_,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('top',0,2)]):
    a_.scatter(allb[:,i],allb[:,j],s=.2,c='#ddd')
    for r in routes_csf: a_.plot(r[:,i],r[:,j],'-',c='c',lw=.8)
    for sd in 'rl': a_.plot(cps[sd][:,i],cps[sd][:,j],'-',c='m',lw=1.2)
    a_.set_aspect('equal'); a_.set_title(t)
plt.savefig('viz_csf.png',dpi=60)
