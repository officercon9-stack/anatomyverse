import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from vnet import *
A=pickle.load(open('arteries_cl.pkl','rb'))
S=sinus_set()
def tangent_at(p):
    d=to_dir(p)[0]; r=np.array([0.3,0.5,0.8]); r=r-d*(r@d); return r/np.linalg.norm(r)
def tort(path,amp=0.0006,k=3):
    """add a gentle wiggle to a polyline so capillaries look tortuous"""
    P=np.asarray(path); n=len(P); t=np.linspace(0,1,n)
    d=np.gradient(P,axis=0); d/=np.linalg.norm(d,axis=1)[:,None]+1e-9
    nrm=np.cross(d,to_dir(P)); nrm/=np.linalg.norm(nrm,axis=1)[:,None]+1e-9
    return P+nrm*(amp*np.sin(t*np.pi*k*2+rng.uniform(0,6))*np.sin(np.pi*t))[:,None]
def sinus_after(kind,side,z=None):
    sd='r' if side=='R' else 'l'; s=sd_sign(side)
    ts=S['ts_'+sd]; sig=S['sig_'+sd]; ij=S['ijv_'+sd]
    tail=np.vstack([ts,sig[1:],ij[1:]])
    if kind=='sss':
        i=int(np.argmin(np.abs(S['sss'][:,2]-z))); return np.vstack([S['sss'][i:],tail[1:]]), i
    if kind=='ts':
        j=int(np.argmin(np.linalg.norm(ts-z,axis=1))); return np.vstack([ts[j:],sig[1:],ij[1:]]), j
    if kind=='cav':
        return np.vstack([S['cav_'+sd],S['pet_'+sd][1:],sig[1:],ij[1:]]),0
    if kind=='deep':
        return np.vstack([S['straight'],S['ts_'+sd][1:],sig[1:],ij[1:]]),0
def drain(E,side,tdir_hint=None):
    """from a pial surface point E: capillary hop, vein to a sinus, then along the sinus to the jugular"""
    s=sd_sign(side); dE=to_dir(E)[0]; lat=np.degrees(np.arcsin(dE[1])); fwd=dE[2]
    # capillary hop (~5 mm along the surface towards the draining sinus)
    if lat>=12: kind='sss'
    elif fwd<0.25: kind='ts'
    else: kind='cav'
    if kind=='sss':
        tgt_d=np.array([s*0.10,1.0,dE[2]*1.0]); 
    elif kind=='ts':
        tgt_d=np.array([s*0.9,-0.25,-0.7])
    else:
        tgt_d=np.array([s*0.5,-0.55,0.6])
    tgt_d=tgt_d/np.linalg.norm(tgt_d)
    hop=slerp_path(dE,(dE*0.985+tgt_d*0.015)/np.linalg.norm(dE*0.985+tgt_d*0.015),6,0.0006,0.0)
    cap=tort(hop,0.0008,2.5)
    V0=cap[-1]
    if kind=='sss':
        sp,i=sinus_after('sss',side,V0[2]); entry=sp[0]
        vein=slerp_path(to_dir(V0)[0],to_dir(entry)[0],12,0.0007,0.002); vein=np.vstack([vein[:-1],entry]); sin=sp
    elif kind=='ts':
        tsp=S['ts_'+('r' if side=='R' else 'l')]; j=int(np.argmin(np.linalg.norm(tsp-(V0+np.array([s*0.01,-0.02,-0.02])),axis=1))); j=max(j,1)
        sin,_=sinus_after('ts',side,tsp[j]); entry=sin[0]
        vein=bez(V0,V0+to_dir(V0)[0]*0.004,entry+(entry-CEN)/np.linalg.norm(entry-CEN)*0.006,entry,12)
    else:
        sin,_=sinus_after('cav',side); entry=sin[0]
        vein=bez(V0,V0+to_dir(V0)[0]*0.004,entry+(entry-CEN)/np.linalg.norm(entry-CEN)*0.006,entry,12); 
    return cap,vein,sin,kind
routes=[]; branch_tubes={}  # parent id -> list of polylines (arterial branches)
vein_tubes=[]; cap_hops=[]
def add_route(art,side,parent,cap,vein,sin):
    routes.append(dict(side=side,art=art,cap=cap,ven=np.vstack([vein,sin])))
    branch_tubes.setdefault(parent,[]).append(art)
    vein_tubes.append(vein); cap_hops.append(cap)
def cat(*ps):
    out=[ps[0]]
    for p in ps[1:]:
        if len(p)==0: continue
        q=p[1:] if np.linalg.norm(p[0]-out[-1][-1])<1e-4 else p
        if len(q): out.append(q)
    return np.vstack(out)
def branch_to_surface(start,target_dir,nmid=0):
    q=surf_pt(target_dir,0.0005)[0]; L=np.linalg.norm(q-start); d=to_dir(q)[0]
    if L<0.003: return np.array([start,q])
    return bez(start,start+(outward(start) if np.linalg.norm(start-CEN)>0.02 else d)*L/3,q-d*L/3,q,16)
connectors=[]  # extra procedural trunk pieces (parent id, polyline)
for side in ('R','L'):
    s=sd_sign(side); a=A[side]
    trunk_ica=a['ica']
    # ---- MCA cortical branches
    targets=[(-35,40),(-70,45),(-100,40),(-130,30),(-60,15),(-90,12),(-120,10),(-75,-12),(-105,-15)]
    tips=[m[-1] for m in a['mca']]
    for az,lat in targets:
        td=dir_az_lat(az*s*-1*-1 if False else (az if side=='R' else -az),lat)
        k=int(np.argmin([np.linalg.norm(to_dir(t)[0]-td) for t in tips]))
        mc=a['mca'][k]; br=branch_to_surface(mc[-1],td)
        art=cat(trunk_ica,mc,br); cap,vein,sin,kind=drain(br[-1],side)
        add_route(art,side,'middle-cerebral-artery',cap,vein,sin)
    # ---- ACA: pericallosal arch + dorsal branches
    ac=a['aca'][0]; tip=ac[-1]
    peri=np.array([tip,[s*0.004,0.010,0.057],[s*0.0035,0.026,0.052],[s*0.0035,0.036,0.038],[s*0.0035,0.0405,0.018],[s*0.0035,0.0405,-0.002],[s*0.0035,0.037,-0.022],[s*0.0035,0.029,-0.036]])
    peri=smooth_resample(peri,0.0018,1); connectors.append(('anterior-cerebral-artery',peri))
    for psi in (32,52,72,92,112):
        pz=np.cos(np.radians(psi))*0.09-0.005; i=int(np.argmin(np.abs(peri[:,2]-np.clip(pz,-0.034,0.05)))); st=peri[i]
        td=np.array([s*0.10,np.sin(np.radians(psi)),np.cos(np.radians(psi))]); br=branch_to_surface(st,td)
        # route: ICA -> ACA -> pericallosal up to this branch -> branch
        art=cat(trunk_ica,ac,peri[:i+1],br); cap,vein,sin,kind=drain(br[-1],side)
        add_route(art,side,'anterior-cerebral-artery',cap,vein,sin)
    # ---- PCA (vertebrobasilar): connector P1/P2 around the midbrain
    ba=a['ba']; pc0=a['pca'][0][0]
    conn=bez(ba[-1],ba[-1]+np.array([s*0.010,0.0,-0.004]),pc0+np.array([s*0.006,0.0,0.020]),pc0,14); connectors.append(('posterior-cerebral-artery',conn))
    for pc in a['pca']:
        end=pc[-1]; br=deep_to_surface(end,None,0.0005,8)
        art=cat(a['va'],ba,conn,pc,br); cap,vein,sin,kind=drain(br[-1],side)
        add_route(art,side,'posterior-cerebral-artery',cap,vein,sin)
    # ---- cerebellar arteries
    for pi in a['pica']:
        br=deep_to_surface(pi[-1],None,0.0005,8); art=cat(a['va'],pi,br); cap,vein,sin,kind=drain(br[-1],side)
        add_route(art,side,'posterior-inferior-cerebellar-artery',cap,vein,sin)
    sc=a['sca'][0]; br=deep_to_surface(sc[-1],None,0.0005,8); art=cat(a['va'],ba,sc,br); cap,vein,sin,kind=drain(br[-1],side)
    add_route(art,side,'superior-cerebellar-artery',cap,vein,sin)
    # ---- deep arteries -> internal cerebral vein -> great cerebral vein -> straight sinus
    for key,parent in (('ach','anterior-choroidal-artery'),('thp','thalamic-perforating-arteries')):
        ar=a[key][0]; icv=S['icv_'+('r' if side=='R' else 'l')]
        j=int(np.argmin(np.linalg.norm(icv-ar[-1],axis=1))); j=min(max(j,1),len(icv)-2)
        e=ar[-1]; hop=tort(bez(e,e+np.array([0,0.002,0]),icv[j]+np.array([0,-0.002,0]),icv[j],6),0.0005,2)
        sin,_=sinus_after('deep',side)
        vein=icv[j:]
        base=cat(trunk_ica,ar) if key=='ach' else cat(a['va'],ba,conn,a['pca'][0],ar)
        routes.append(dict(side=side,art=base,cap=hop,ven=np.vstack([vein,sin]))); branch_tubes.setdefault(parent,[]).append(base[-len(ar):])
        cap_hops.append(hop)
print('routes',len(routes))
pickle.dump(dict(routes=routes,branch_tubes=branch_tubes,vein_tubes=vein_tubes,cap_hops=cap_hops,connectors=connectors,S=S,A=A),open('net.pkl','wb'))
# ---------- preview ----------
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(21,7)); allb=np.vstack(list(BP.values()))[::12]
for a_,(t,i,j) in zip(ax,[('sag',2,1),('cor',0,1),('top',0,2)]):
    a_.scatter(allb[:,i],allb[:,j],s=.2,c='#ddd')
    for r in routes:
        a_.plot(r['art'][:,i],r['art'][:,j],'-',c='r',lw=.5); a_.plot(r['ven'][:,i],r['ven'][:,j],'-',c='b',lw=.5); a_.plot(r['cap'][:,i],r['cap'][:,j],'-',c='m',lw=1)
    a_.set_aspect('equal'); a_.set_title(t)
plt.savefig('viz_net.png',dpi=60)
