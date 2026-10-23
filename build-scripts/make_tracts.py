import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from glbtools import *
from cordlib import *
from cl import smooth_resample
from surf import surf_pt
cd=cord(0,0.76,0.01)           # model coords, y descending
Y=cd[::-1,1]; XX=cd[::-1,0]; ZZ=cd[::-1,2]
def cordp(y0,y1,dx=0,dz=0,n=30):
    ys=np.linspace(y0,y1,n); return np.column_stack([np.interp(ys,Y,XX)+dx,ys,np.interp(ys,Y,ZZ)+dz])
def loc(p): return np.asarray(p,float)+OFF           # brain-local -> model
bridge=np.array([[0,-0.0838,-0.0135],[0,-0.1005,-0.0215],[0,-0.1130,-0.0268],[0,-0.1205,-0.0285],[0,-0.1235,-0.0290]])+OFF
def bridgep(dx,dz=0,rev=False):
    P=bridge.copy(); w=np.linspace(0,1,len(P))[:,None]; P=P+np.hstack([w*dx,0*w,w*dz]); return P[::-1] if rev else P
CORT=lambda sgn,az_y,z: surf_pt(np.array([sgn*0.5,az_y,z]),-0.003)[0]
plex=lambda s:[(s*.018,1.445,-.045),(s*.08,1.43,-.022),(s*.13,1.4,-.006),(s*.172,1.36,0)]
rad=lambda s:[(s*.2,1.3,-.03),(s*.24,1.22,-.026),(s*.272,1.13,0)]
cauda=lambda s:[(s*.012,0.94,-.068),(s*.03,.90,-.07),(s*.055,.84,-.07)]
sci=lambda s:[(s*.085,.8,-.062),(s*.1,.7,-.045),(s*.1,.55,-.036)]
def sm(P,step=0.004): return smooth_resample(np.asarray(P),step,2)
routes=[]; tubes={'cst':[],'dcml':[],'stt':[]}
for s in (1,-1):
    h=-s
    up=[CORT(h,0.85,0.25),(h*.028,.048,.015),(h*.020,.025,.010),(h*.014,.006,.007),(h*.011,-.016,.010),(h*.008,-.034,.014),(h*.0045,-.055,.010),(h*.002,-.072,.0)]
    top=np.vstack([loc(up),bridgep(s*0.0025,0.001)[1:]])
    arm=np.vstack([top,cordp(1.535,1.445,s*0.0028,0.001)[1:],np.array(plex(s))[0:],np.array(rad(s))])
    leg=np.vstack([top,cordp(1.535,0.976,s*0.0028,0.001)[1:],np.array(cauda(s)),np.array(sci(s))])
    for P,nm in ((arm,'arm'),(leg,'leg')):
        P=sm(P); routes.append(dict(t='m',p=P-OFF)); tubes['cst'].append(P-OFF)
    # DCML: leg -> ipsilateral dorsal column -> medulla -> cross -> thalamus -> cortex
    asc=[(-s*.003,-.074,-.0185),(-s*.005,-.066,-.008),(-s*.006,-.044,.004),(-s*.008,-.025,.004),(-s*.010,-.010,.004),(-s*.014,.003,.006),(-s*.019,.020,.008),CORT(-s*1,0.85,0.02)]
    d=np.vstack([np.array(sci(s))[::-1],np.array(cauda(s))[::-1],cordp(0.976,1.535,s*0.002,-0.0035),bridgep(s*0.003,-0.004,True)[::-1][::-1][1:] if False else bridgep(s*0.003,-0.0035)[1:3],loc(asc)])
    P=sm(d); routes.append(dict(t='s',p=P-OFF)); tubes['dcml'].append(P-OFF)
    # spinothalamic: arm -> enter cord, cross -> anterolateral column opposite side -> thalamus -> cortex
    asc2=[(-s*.006,-.075,-.004),(-s*.010,-.045,.002),(-s*.011,-.020,.000),(-s*.014,.000,.004),(-s*.019,.020,.008),CORT(-s*1,0.85,0.02)]
    st=np.vstack([np.array(rad(s))[::-1],np.array(plex(s))[::-1],cordp(1.445,1.535,-s*0.0035,0.002),bridgep(-s*0.004,0.003)[1:3],loc(asc2)])
    P=sm(st); routes.append(dict(t='p',p=P-OFF)); tubes['stt'].append(P-OFF)
nodes=[];omap={}
for k,sid,col in (('cst','corticospinal-tract',0xF2B632),('dcml','dorsal-column-medial-lemniscus-pathway',0x3CCB7F),('stt','spinothalamic-tract',0xFF7A45)):
    V,F=merge([tube(p,0.0012,7) for p in tubes[k]]); nodes.append(dict(name=k,V=V,F=F,color=col,rough=0.45)); omap[k]=sid
print(write_glb(nodes,'brain-tracts.glb','bodyparts3d-brain-tracts.glb.json')); json.dump(omap,open('tracts_objectmap.json','w'))
pickle.dump(routes,open('tract_routes.pkl','wb'))
print([ (r['t'],len(r['p']),r['p'][0].round(3).tolist(),r['p'][-1].round(3).tolist()) for r in routes])
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(21,10))
for a,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('cor-brain',0,1)]):
    for r in routes: 
        p=r['p']+OFF; a.plot(p[:,i],p[:,j],'-',c={'m':'gold','s':'g','p':'r'}[r['t']],lw=1)
    a.set_aspect('equal'); a.set_title(t)
ax[2].set_xlim(-0.12,0.12); ax[2].set_ylim(1.5,1.8)
plt.savefig('viz_tracts.png',dpi=55)
