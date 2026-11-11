import sys,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pickle,numpy as np,json
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix,diags
from scipy.sparse.linalg import splu
from skinlm import all_skin_landmarks
from rnd import sample,render,sheet
def unit(v): return v/np.linalg.norm(v)
def frame(a,h):
    a=unit(a);h=unit(h-(h@a)*a);return np.c_[a,h,np.cross(a,h)]
def bone(ov,ev,hv,oa,ea,ha,sr):
    Rv=frame(ev-ov,hv);Ra=frame(ea-oa,ha);sl=np.linalg.norm(ea-oa)/np.linalg.norm(ev-ov)
    M=Ra@np.diag([sl,sr,sr])@Rv.T;return M,oa-M@ov
def umeyama(X,Y):
    mx=X.mean(0);my=Y.mean(0);Xc=X-mx;Yc=Y-my;U,S,Vt=np.linalg.svd(Yc.T@Xc/len(X));D=np.eye(3)
    if np.linalg.det(U@Vt)<0:D[2,2]=-1
    R=U@D@Vt;s=np.trace(np.diag(S)@D)/((Xc**2).sum()/len(X));M=s*R;return M,my-M@mx
def bbpts(P):
    lo=P.min(0);hi=P.max(0);c=(lo+hi)/2;out=[]
    for i in range(3):
        for v in (lo[i],hi[i]):
            p=c.copy();p[i]=v;out.append(p)
    return np.array(out)
def vnormals(V,F):
    n=np.cross(V[F[:,1]]-V[F[:,0]],V[F[:,2]]-V[F[:,0]]);N=np.zeros_like(V)
    for k in range(3):np.add.at(N,F[:,k],n)
    return N/np.maximum(np.linalg.norm(N,axis=1),1e-12)[:,None]
def run(sex,cfg):
    lm,arms,feet,P,F,A,U=all_skin_landmarks(sex);anc=pickle.load(open('vh/united_anc_%s.pkl'%sex,'rb'))
    alm=pickle.load(open('app_lm.pkl','rb'));L=pickle.load(open('app_%s.pkl'%('male' if sex=='m' else 'female'),'rb'));by={m['name']:m for m in L}
    n=len(P);mid=lm['mid'];H=lm['H'];Z=np.array([0,0,1.])
    # outward orientation
    vol=np.einsum('ij,ij->i',P[F[:,0]],np.cross(P[F[:,1]],P[F[:,2]])).sum()
    if vol<0:F=F[:,[0,2,1]]
    bones={};seeds={}
    armany=arms['L']['arm_mask']|arms['R']['arm_mask']
    hipmid=(lm['hip_L']+lm['hip_R'])/2;ahip=(alm['hip_L']+alm['hip_R'])/2
    eye_y=(lm['eye_L'][1]+lm['eye_R'][1])/2
    Sd=np.array(cfg['trunk']);bones['trunk']=(np.diag(Sd),ahip-Sd*hipmid)
    # head
    scl=by['za_sclera_1']['P'];aeL=scl[scl[:,0]>0].mean(0);aeR=scl[scl[:,0]<0].mean(0)
    abr=np.vstack([by[k]['P'] for k in ('zb_cerebrum','zb_cerebellum','zb_brainstem')])
    vbr=np.vstack([U[k][0] for k in U if k.startswith('Allen_')])
    bones['head']=umeyama(np.vstack([lm['eye_L'],lm['eye_R'],bbpts(vbr)]),np.vstack([aeL,aeR,bbpts(abr)]))
    info={}
    for S,sg in (('L',1),('R',-1)):
        a=arms[S];u=a['u'];Ax=a['axilla'];tt=a['cl_t'];cen=a['cl_c'];tw=a['t_wrist']
        # elbow from width profile
        fm=a['arm_mask'][F].all(1);Sa,_=sample(P,F[fm],200000,np.random.default_rng(2));t=(Sa-Ax)@u;ac=a['across']
        bins=np.arange(0.02,tw-0.04,0.01);wid=np.array([np.ptp((Sa[(t>=b)&(t<b+0.01)])@ac) for b in bins])
        m1=bins>=0.10;imax=np.flatnonzero(m1)[np.argmax(wid[m1])];m0=(bins>=0.04)&(bins<=bins[imax]);imin=np.flatnonzero(m0)[np.argmin(wid[m0])]
        te=(bins[imax]+bins[imin])/2+0.005
        cl=lambda x:np.array([np.interp(x,tt,cen[:,k]) for k in range(3)])
        E=cl(te);W=a['wrist'];C0=cl(tt[0]);du=unit(E-C0)
        aS=alm['shoulder_'+S];aE=alm['elbow2_'+S];aW=alm['wrist_'+S]
        Sh=E-du*np.linalg.norm(aS-aE)/np.linalg.norm(aE-aW)*np.linalg.norm(E-W)
        info['arm_'+S]=dict(te=te,tw=tw,S=Sh,E=E,W=W)
        aac=unit(alm['mcp_index_'+S]-alm['mcp_little_'+S])
        bones['uarm_'+S]=bone(Sh,E,Z,aS,aE,Z,cfg['r_arm'])
        bones['farm_'+S]=bone(E,W,ac,aE,aW,aac,cfg['r_arm'])
        fn=['thumb','index','middle','ring','little']
        X=np.vstack([W]+[a['tip_'+f] for f in fn])
        Y=np.vstack([aW]+[alm['tip_%s_%s'%(f,S)]+0.004*unit(alm['tip_%s_%s'%(f,S)]-alm['pip_%s_%s'%(f,S)]) for f in fn])
        bones['hand_'+S]=umeyama(X,Y)
        bones['thigh_'+S]=bone(lm['hip_'+S],lm['knee2_'+S],lm['patella_'+S]-lm['knee2_'+S],alm['hip_'+S],alm['knee2_'+S],alm['patella_'+S]-alm['knee2_'+S],cfg['r_leg'])
        bones['shank_'+S]=bone(lm['knee2_'+S],lm['ankle_'+S],Z,alm['knee2_'+S],alm['ankle_'+S],Z,cfg['r_leg'])
        f=feet[S];ax=alm['footaxis_'+S];lat=np.array([sg,0,0.])
        X=np.vstack([lm['ankle_'+S],f['heel'],f['toe1'],f['toe5']])
        Y=np.vstack([alm['ankle_'+S],alm['heel_'+S]-0.010*ax,alm['toe1_'+S]+0.006*ax,alm['toe5_'+S]+0.004*ax+0.006*lat])
        bones['foot_'+S]=umeyama(X,Y)
        # seeds
        side=(P[:,0]-mid)*sg>0;y=P[:,1];ta=(P-Ax)@u;am=a['arm_mask']
        seeds['thigh_'+S]=side&~armany&(y>lm['knee2_'+S][1]+0.03)&(y<lm['knee2_'+S][1]+0.20)
        seeds['shank_'+S]=side&~armany&(y>lm['ankle_'+S][1]+0.08)&(y<lm['knee2_'+S][1]-0.08)
        seeds['foot_'+S]=side&~armany&(y<lm['ankle_'+S][1]-0.02)
        seeds['uarm_'+S]=am&(ta>0.02)&(ta<te-0.05)
        seeds['farm_'+S]=am&(ta>te+0.06)&(ta<tw-0.05)
        seeds['hand_'+S]=am&(ta>tw+0.03)
    axy=max(arms['L']['axilla'][1],arms['R']['axilla'][1]);sx=min(abs(info['arm_L']['S'][0]-mid),abs(info['arm_R']['S'][0]-mid))
    y=P[:,1]
    seeds['trunk']=~armany&(((y>hipmid[1]-0.02)&(y<axy-0.02))|((y>=axy-0.02)&(y<axy+0.10)&(np.abs(P[:,0]-mid)<sx-0.05)))
    seeds['head']=y>eye_y-0.085*H/1.75
    names=list(bones);lab=-np.ones(n,int)
    for i,k in enumerate(names):lab[seeds[k]&(lab<0)]=i
    # harmonic weights
    deg=np.asarray(A.sum(1)).ravel();Lp=diags(deg)-A;free=lab<0;fi=np.flatnonzero(free);si=np.flatnonzero(~free)
    Lff=Lp[fi][:,fi].tocsc();Lfs=Lp[fi][:,si]
    B=np.zeros((len(si),len(names)));B[np.arange(len(si)),lab[si]]=1
    lu=splu(Lff);Wt=np.zeros((n,len(names)));Wt[si]=B;Wt[fi]=np.clip(lu.solve(-(Lfs@B)),0,1);Wt/=Wt.sum(1,keepdims=True)
    V=np.zeros_like(P)
    for i,k in enumerate(names):
        M,t=bones[k];V+=Wt[:,[i]]*(P@M.T+t)
    return V,F,L,A,info,names,Wt
def anatomy(L,sex):
    Q=[]
    male=('scrotum','mc_','za2_testis','za2_epididymis','za2_glans','za2_corpus','za2_prostate','za2_seminal')
    for m in L:
        nm=m['name'];mod=m['chain'][1] if len(m['chain'])>1 else ''
        if not m['vis'] or len(m['F'])==0: continue
        if nm.startswith(('skin_','hair_','za_auricle','alveoli','skin')) or m['sid'] in('skin','epidermis','dermis','hypodermis','skin-appendages'): continue
        if mod=='anatomyverse-vulva' and sex=='m': continue
        if sex=='f' and (mod in('anatomyverse-scrotum','zanatomy-male-urethra') or nm.startswith(male)): continue
        if sex=='m' and mod=='hubmap-female-repro': continue
        if sex=='m' and nm.startswith(('za2_glans','za2_corpus')): continue
        Q.append((m['P'],m['F']))
    return Q
def enclose(V,F,A,Q,margin=0.003,rounds=14,cap=0.007):
    rng=np.random.default_rng(3);pts=np.vstack([sample(P,Fq,max(300,int(len(Fq)*1.5)),rng)[0] for P,Fq in Q]+[P for P,_ in Q])
    A=A.copy();A.data[:]=1;deg=np.asarray(A.sum(1)).ravel();V=V.copy()
    for r in range(rounds):
        N=vnormals(V,F);tr=cKDTree(V);d,i=tr.query(pts);sd=np.einsum('ij,ij->i',pts-V[i],N[i])
        bad=(sd>-margin)&(d<0.05);need=np.zeros(len(V));np.maximum.at(need,i[bad],np.minimum(sd[bad]+margin,cap))
        if r%3==0 or r==rounds-1: print('   round',r,'violations',int(bad.sum()),'p99 mm',round(np.quantile(sd[bad]+margin,0.99)*1000,1) if bad.any() else 0)
        if bad.sum()<50:break
        for _ in range(4):
            nb=A.multiply(need[None,:]).max(axis=1).toarray().ravel();need=np.maximum(need,nb)
        for _ in range(10):need=(A@need+need)/(deg+1)
        disp=N*need[:,None]
        for _ in range(3):disp=(A@disp+disp)/(deg+1)[:,None]
        V+=1.6*disp
    return V
CFG={'m':dict(trunk=[1.0,0.894,1.0],r_arm=1.1,r_leg=1.0),'f':dict(trunk=[0.92,0.931,0.95],r_arm=1.0,r_leg=1.0)}
if __name__=='__main__':
    for sex in sys.argv[1:]:
        V,F,L,A,info,names,Wt=run(sex,CFG[sex]);print(sex,{k:(round(v['te'],3),v['S'].round(3)) for k,v in info.items()})
        Q=anatomy(L,sex);V0=V.copy();V=enclose(V,F,A,Q)
        print('  moved mean mm',round(np.linalg.norm(V-V0,axis=1).mean()*1000,2),'p95',round(np.quantile(np.linalg.norm(V-V0,axis=1),0.95)*1000,1))
        pickle.dump((V,F,V0),open('fit_%s.pkl'%sex,'wb'))
        b=(-0.5,0.5,0.0,1.8);bs=(-0.3,0.3,0,1.8);sk=(214,170,140)
        an=[(P,Fq,(170,60,55)) for P,Fq in Q]
        ims=[render([(V,F,sk)],view=v,H=820,bounds=b if v in('front','back') else bs) for v in('front','right','back')]
        ims+=[render(an+[(V0,F,sk)],view='front',H=820,bounds=b),render(an,view='front',H=820,bounds=b)]
        sheet(ims,'fit_%s.png'%sex)
