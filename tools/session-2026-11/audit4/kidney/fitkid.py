"""Register the HuBMAP Visible Human male kidney interior (CC BY 4.0) to the kidneys shown in the app
(BodyParts3D) with a similarity transform (ICP on the kidney surface), then export the renal pelvis with
calyces and the renal medulla (pyramids and papillae) in app coordinates."""
import json,pickle,numpy as np,sys
from scipy.spatial import cKDTree
K=pickle.load(open('vh_m_kidney.pkl','rb'))
D={d['model']+'/'+d['name']:d for d in json.load(open('../dup.json'))}
def app(n):
    d=D['anatomyverse-organs/'+n];assert d['full'];return np.array(d['V']).reshape(-1,3),np.array(d['I']).reshape(-1,3)
def umeyama(A,B):  # similarity mapping A->B
    ma,mb=A.mean(0),B.mean(0);X,Y=A-ma,B-mb;U,S,Vt=np.linalg.svd(Y.T@X/len(A));d=np.sign(np.linalg.det(U@Vt));Dg=np.diag([1,1,d]);R=U@Dg@Vt;s=(S*np.diag(Dg)).sum()/(X**2).sum()*len(A);return s,R,mb-s*R@ma
def merge(names):
    V=[];F=[];o=0
    for n in names:
        for P,I in K[n]:V.append(P);F.append(I+o);o+=len(P)
    return np.vstack(V),np.vstack(F)
def inside(P,V,F):
    # winding-number style test by ray casting along +x (simple, mesh is closed and small)
    v0,v1,v2=V[F[:,0]],V[F[:,1]],V[F[:,2]];out=np.zeros(len(P),bool)
    for i,p in enumerate(P):
        d=np.array([1.0,0.0013,0.0007]);e1=v1-v0;e2=v2-v0;h=np.cross(d,e2);a=(e1*h).sum(1);ok=np.abs(a)>1e-12;f=1/np.where(ok,a,1);s=p-v0;u=f*(s*h).sum(1);q=np.cross(s,e1);v=f*(q@d);t=f*(e2*q).sum(1)
        out[i]=(ok&(u>=0)&(u<=1)&(v>=0)&(u+v<=1)&(t>1e-9)).sum()%2==1
    return out
OUT={};rep={};GEN={}
for side,S in (('l','L'),('r','R')):
    T,TF=app('kidney_'+S)
    C=K['VH_M_kidney_capsule_'+S][0][0]
    # start: centroid + scale by bbox diagonal, no rotation
    s=np.linalg.norm(np.ptp(T,0))/np.linalg.norm(np.ptp(C,0));R=np.eye(3);t=T.mean(0)-s*C.mean(0)
    tr=cKDTree(T);sg=1 if S=='L' else -1
    def lat_end(P):
        x=P[:,0]*sg;return P[x>x.max()-0.004].mean(0)
    def top(P):return P[P[:,1]>P[:,1].max()-0.004].mean(0)
    AV=np.array(D['anatomyverse-organs/renal_vein_L']['V']).reshape(-1,3);AA=np.array(D['anatomyverse-organs/renal_artery_R']['V']).reshape(-1,3);AU=np.array(D['anatomyverse-organs/ureter_'+S]['V']).reshape(-1,3)
    app_hil=(lat_end(AV)+lat_end(AA))/2
    vh_hil=K['VH_M_hilum_of_kidney_'+S][0][0].mean(0)
    def poles(P):
        c=P.mean(0);u=np.linalg.svd(P-c,full_matrices=False)[2][0];u=u*np.sign(u[1]);pr=(P-c)@u
        return P[pr>pr.max()-0.006].mean(0),P[pr<pr.min()+0.006].mean(0)
    LA=np.array([*poles(C),vh_hil,C.mean(0)]);LB=np.array([*poles(T),app_hil,T.mean(0)]);W=150
    s,R,t=umeyama(LA,LB)
    for it in range(60):
        X=s*C@R.T+t;d,i=tr.query(X);keep=d<np.percentile(d,90)
        # symmetric: also target->source
        d2,i2=cKDTree(X).query(T)
        A=np.vstack([C[keep],C[i2]]+[LA]*W);B=np.vstack([T[i[keep]],T]+[LB]*W);s,R,t=umeyama(A,B)
    X=s*C@R.T+t;d=tr.query(X)[0];d2=cKDTree(X).query(T)[0]
    ang=np.degrees(np.arccos(np.clip((np.trace(R)-1)/2,-1,1)))
    rep[side]=dict(scale=round(float(s),4),rot_deg=round(float(ang),1),fit_med_mm=round(float(np.median(d)*1e3),2),fit_p95_mm=round(float(np.percentile(d,95)*1e3),2),rev_med_mm=round(float(np.median(d2)*1e3),2),rev_p95_mm=round(float(np.percentile(d2,95)*1e3),2))
    f=lambda P:s*P@R.T+t
    rep[side]['landmark_err_mm']=np.round(np.linalg.norm(f(LA)-LB,axis=1)*1e3,1).tolist();rep[side]['app_hilum']=np.round(app_hil,4).tolist();rep[side]['start']=[round(float(s),3)]
    pel=['VH_M_renal_pelvis_'+S]+sorted(k for k in K if k.startswith('VH_M_major_calyx_%s_'%S) or k.startswith('VH_M_minor_calyx_%s_'%S))
    pre='VH_M_renal_pyramid_%s_'%S if S=='L' else 'VH_M_renal_pyramid_'
    med=sorted(k for k in K if (k.startswith(pre) and (S=='L' or len(k)==len(pre)+1)) or k.startswith('VH_M_renal_papilla_%s_'%S))
    for nm,names,col in (('hk_renal_pelvis_'+side,pel,[0.80,0.66,0.42]),('hk_renal_medulla_'+side,med,[0.42,0.13,0.12])):
        V,F=merge(names);V=f(V)
        ins=inside(V[::max(1,len(V)//600)],T,TF)
        rep[side][nm]=dict(parts=len(names),nv=len(V),inside_kidney=round(float(ins.mean()),3),box=[np.round(V.min(0),4).tolist(),np.round(V.max(0),4).tolist()])
        OUT[nm]=dict(v=V.round(5).tolist(),f=F.tolist(),c=col,rough=0.65)
    pyr=[f(K[n][0][0]) for n in med if 'pyramid' in n]
    GEN[side]=dict(pyr=pyr,pelvis=np.array(OUT['hk_renal_pelvis_'+side]['v']),art_end=lat_end(AA),vein_end=lat_end(AV),kid=T,kidF=TF,sg=sg)
    rep[side]['app_kidney_box']=[np.round(T.min(0),4).tolist(),np.round(T.max(0),4).tolist()]
    # hilum direction check: pelvis centroid should be medial (smaller |x|) to kidney centroid
    pv=np.array(OUT['hk_renal_pelvis_'+side]['v']);rep[side]['pelvis_medial_to_kidney_centre_mm']=round(float((abs(T.mean(0)[0])-abs(pv.mean(0)[0]))*1e3),1)
json.dump(OUT,open('hk.json','w'))
pickle.dump(GEN,open('gen_in.pkl','wb'));print(json.dumps(rep,indent=1))
