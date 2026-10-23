import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from cl import *
from surf import surf_pt,surf_r,to_dir,CEN,slerp_path,P as BP
rng=np.random.default_rng(7)
def nearest_vertex(V,pt): return int(np.argmin(np.linalg.norm(V-pt,axis=1)))
def bez(P0,P1,P2,P3,n=14):
    t=np.linspace(0,1,n)[:,None]; return (1-t)**3*P0+3*(1-t)**2*t*P1+3*(1-t)*t**2*P2+t**3*P3
def outward(p): d=p-CEN; return d/np.linalg.norm(d)
def deep_to_surface(p,tdir=None,off=0.0005,n=12):
    """curve from a (maybe deep) point out to the pial surface along its own radial direction"""
    d=to_dir(p)[0] if tdir is None else tdir/np.linalg.norm(tdir)
    q=surf_pt(d,off)[0]; L=np.linalg.norm(q-p)
    if L<0.0012: return np.array([p,q])
    return bez(p,p+outward(p)*L/3,q-d*L/3,q,n)
def dir_az_lat(az,lat): a=np.radians(az);l=np.radians(lat); return np.array([np.sin(a)*np.cos(l),np.sin(l),np.cos(a)*np.cos(l)])
def surf_dir_path(d0,d1,n=14,off=0.0005,lift=0.0015): return slerp_path(d0,d1,n,off,lift)
# ---------- sinuses (schematic), flow direction ----------
def sinus_set():
    S={}
    # superior sagittal: front -> back along the midline, in the fissure above the hemispheres
    psi=np.radians(np.linspace(28,172,36)); d=np.column_stack([0*psi,np.sin(psi),np.cos(psi)])
    sss=surf_pt(d,0.0016); sss[:,0]=0; S['sss']=sss
    tor=np.array([0,-0.004,-0.0835]); S['torcular']=tor
    S['sss']=np.vstack([sss[sss[:,2]>-0.07],tor]); 
    # straight sinus: vein of Galen junction -> torcular
    G=np.array([0,0.0125,-0.0165]); S['gcv_pt']=G
    S['straight']=bez(G,G+np.array([0,-0.004,-0.012]),tor+np.array([0,0.010,0.020]),tor,14)
    # inferior sagittal sinus: along the lower edge of the falx, front -> back ending at G
    S['iss']=np.array([[0,0.030,0.050],[0,0.040,0.034],[0,0.0445,0.012],[0,0.0415,-0.004],[0,0.030,-0.0125],G])
    # internal cerebral veins (pairs) from the interventricular foramen back to G
    for sd,s in (('r',-1),('l',1)):
        S['icv_'+sd]=np.array([[s*0.0025,0.0095,0.034],[s*0.0028,0.0165,0.020],[s*0.0022,0.0185,0.004],[s*0.0012,0.0150,-0.010],G])
        # transverse -> sigmoid -> jugular bulb -> IJV
        ts=np.array([tor,[s*0.012,-0.010,-0.080],[s*0.030,-0.017,-0.071],[s*0.046,-0.027,-0.057],[s*0.056,-0.036,-0.046]])
        S['ts_'+sd]=ts; 
        sg=np.array([ts[-1],[s*0.0575,-0.047,-0.040],[s*0.054,-0.060,-0.033],[s*0.048,-0.072,-0.027]])
        S['sig_'+sd]=sg
        S['ijv_'+sd]=np.array([sg[-1],[s*0.045,-0.095,-0.022],[s*0.040,-0.125,-0.015],[s*0.036,-0.155,-0.010]])
        S['cav_'+sd]=np.array([[s*0.017,-0.016,0.040],[s*0.0155,-0.019,0.035],[s*0.0155,-0.021,0.028]])
        S['pet_'+sd]=np.vstack([S['cav_'+sd][-1:],[[s*0.025,-0.030,0.012],[s*0.040,-0.036,-0.012],[s*0.052,-0.038,-0.032],ts[-1]]])
    for k in S:
        if k in('torcular','gcv_pt'): continue
        S[k]=smooth_resample(S[k],0.002,1)
    return S

# ---------- artery trees & routes ----------
def farthest_targets(tree,root,k,minsep=0.012):
    d,p=tree.dist(root); d=np.where(np.isfinite(d),d,-1); tg=[]; 
    order=np.argsort(-d)
    for i in order:
        if d[i]<=0: break
        if all(np.linalg.norm(tree.V[i]-tree.V[j])>minsep for j in tg): tg.append(int(i))
        if len(tg)>=k: break
    return tg,p
def cl_path(tree,p,t,rad=0.0012): return smooth_resample(tree.centre(tree.path(p,t),rad),0.0015,2)
def get_group(sid,side):
    if sid=='middle-cerebral-artery' and side=='L':
        g=G(sid,'R'); return dict(g,V=mirror(g['V']),F=g['F'][:,[0,2,1]],side='L')
    return G(sid,side)
def sd_sign(side): return -1 if side=='R' else 1
def build_arteries():
    A={}; routes_art={}  # key -> list of centreline arrays (proximal->distal)
    for side in ('R','L'):
        s=sd_sign(side); T={}
        def tree(sid,sd=None): 
            k=(sid,sd or side)
            if k not in T: g=get_group(sid,sd or side); T[k]=Tree(g['V'],g['F'])
            return T[k]
        ica=tree('internal-carotid-artery'); root=int(np.argmin(ica.V[:,1]))
        ica_cl,t_end,_,_=centreline(ica,root,rad=0.0016); ica_end=ica_cl[-1]
        A[side]=dict(ica=ica_cl)
        # MCA
        mca=tree('middle-cerebral-artery'); r=nearest_vertex(mca.V,ica_end); tg,p=farthest_targets(mca,r,4,0.010)
        A[side]['mca']=[cl_path(mca,p,t,0.0010) for t in tg]
        # ACA
        aca=tree('anterior-cerebral-artery'); r=nearest_vertex(aca.V,ica_end); tg,p=farthest_targets(aca,r,1)
        A[side]['aca']=[cl_path(aca,p,tg[0],0.0008)]
        # vertebral -> basilar (basilar built once, from the right)
        va=tree('vertebral-artery'); rv=int(np.argmin(va.V[:,1])); va_cl,_,_,_=centreline(va,rv,rad=0.0010); A[side]['va']=va_cl
    ba=Tree(G('basilar-artery','M')['V'],G('basilar-artery','M')['F']); rb=int(np.argmin(ba.V[:,1])); ba_cl,_,_,_=centreline(ba,rb,rad=0.0010)
    for side in ('R','L'):
        s=sd_sign(side); A[side]['ba']=ba_cl
        pca=Tree(*[G('posterior-cerebral-artery',side)[k] for k in('V','F')]); r=nearest_vertex(pca.V,ba_cl[-1]); tg,p=farthest_targets(pca,r,4,0.014)
        A[side]['pca']=[cl_path(pca,p,t,0.0010) for t in tg]
        pica=Tree(*[G('posterior-inferior-cerebellar-artery',side)[k] for k in('V','F')])
        # root: vertex closest to the vertebral centreline
        va_cl=A[side]['va']; dd=[np.linalg.norm(pica.V-q,axis=1).min() for q in va_cl]; q=va_cl[int(np.argmin(dd))]
        r=nearest_vertex(pica.V,q); tg,p=farthest_targets(pica,r,2,0.012); A[side]['pica']=[cl_path(pica,p,t,0.0010) for t in tg]
        sca=Tree(*[G('superior-cerebellar-artery',side)[k] for k in('V','F')]); r=nearest_vertex(sca.V,ba_cl[-1]); tg,p=farthest_targets(sca,r,1); A[side]['sca']=[cl_path(sca,p,tg[0],0.0008)]
        # anterior choroidal / thalamoperforating
        ach=Tree(*[G('anterior-choroidal-artery',side)[k] for k in('V','F')]); r=nearest_vertex(ach.V,A[side]['ica'][-1]); tg,p=farthest_targets(ach,r,1); A[side]['ach']=[cl_path(ach,p,tg[0],0.0006)]
        thp=Tree(*[G('thalamic-perforating-arteries',side)[k] for k in('V','F')]); r=nearest_vertex(thp.V,A[side]['pca'][0][0]); tg,p=farthest_targets(thp,r,1); A[side]['thp']=[cl_path(thp,p,tg[0],0.0006)]
    return A
if __name__=='__main__':
    A=build_arteries()
    for sd in A:
        for k,v in A[sd].items():
            vv=v if isinstance(v,list) else [v]
            print(sd,k,[ (len(x),np.round(x[0],3).tolist(),np.round(x[-1],3).tolist()) for x in vv])
    pickle.dump(A,open('arteries_cl.pkl','wb'))
