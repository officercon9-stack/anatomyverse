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
GROUPS=['trunk','armL','armR','legL','legR']
def poly_dist(p,pl):
    best=np.full(len(p),1e9)
    for a,b in zip(pl[:-1],pl[1:]):
        ab=b-a;t=np.clip((p-a)@ab/(ab@ab),0,1);best=np.minimum(best,np.linalg.norm(p-(a+t[:,None]*ab),axis=1))
    return best
def group_of(pts,alm):
    top=np.array([0,1.75,-0.01]);bot=np.array([0,0.80,-0.01]);pl={'trunk':([bot,top],0.15)}
    for S in 'LR':
        pl['arm'+S]=([alm['shoulder_'+S],alm['elbow2_'+S],alm['wrist_'+S],alm['tip_middle_'+S]],0.05)
        pl['leg'+S]=([alm['hip_'+S],alm['knee2_'+S],alm['ankle_'+S],alm['toe1_'+S]],0.085)
    return np.stack([poly_dist(pts,np.array(pl[g][0]))/pl[g][1] for g in GROUPS],1).argmin(1)
def ext(P,y,h=0.006):
    b=P[np.abs(P[:,1]-y)<h];return b.min(0),b.max(0)
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
    X='VH_%s_'%sex.upper()
    aP=np.vstack([p for p,_ in anatomy(L,sex)]);aG=group_of(aP,alm);aT=aP[aG==0]
    Pt=P[~armany]
    sy=cfg['sy'];yv=hipmid[1]+0.05;ya=ahip[1]+0.05*sy
    vlo,vhi=ext(Pt,yv);alo,ahi_=ext(aT,ya)
    Sd=np.array([max(cfg['pelvis_min'][0],(ahi_[0]-alo[0]+0.016)/(vhi[0]-vlo[0])),sy,max(cfg['pelvis_min'][1],(ahi_[2]-alo[2]+0.016)/(vhi[2]-vlo[2]))])
    tp=ahip-Sd*hipmid;tp[2]=(alo[2]+ahi_[2])/2-Sd[2]*(vlo[2]+vhi[2])/2;bones['pelvis']=(np.diag(Sd),tp);print('  pelvis scale',Sd.round(3))
    sk=np.vstack([m['P'] for m in L if m['chain'][1]=='zanatomy-skull'])
    scl=by['za_sclera_1']['P'];aeye=scl.mean(0);vtop=P[:,1].max();atop=sk[:,1].max()+0.006
    lv=eye_y+0.35*(vtop-eye_y);la=aeye[1]+0.35*(atop-aeye[1]);vlo,vhi=ext(P[np.abs(P[:,0]-mid)<0.12],lv);alo,ahi_=ext(sk,la)
    kk=H/1.75;ez=(lm['eye_L'][2]+lm['eye_R'][2])/2;ml=P[np.abs(P[:,0]-mid)<0.01];ys=np.arange(eye_y-0.06*kk,eye_y-0.20*kk,-0.004)
    zf=np.array([ml[np.abs(ml[:,1]-yy)<0.003][:,2].max() for yy in ys]);vchin=ys[-1]
    for i_ in range(8,len(ys)):
        if zf[i_]<zf[i_-8:i_].max()-0.025:vchin=ys[i_]+0.004;break
    achin=sk[:,1].min()-0.006
    Sh=np.array([(ahi_[0]-alo[0]+0.012)/(vhi[0]-vlo[0]),(atop-aeye[1])/(vtop-eye_y),(ahi_[2]-alo[2]+0.012)/(vhi[2]-vlo[2])])
    tz=(alo[2]+ahi_[2])/2-Sh[2]*(vlo[2]+vhi[2])/2
    bones['head']=(np.diag(Sh),np.array([-Sh[0]*mid,aeye[1]-Sh[1]*eye_y,tz]))
    Sf=Sh.copy();Sf[1]=max(0.92,(aeye[1]-achin)/(eye_y-vchin));bones['face']=(np.diag(Sf),np.array([-Sf[0]*mid,aeye[1]-Sf[1]*eye_y,tz]));print('  head scale',Sh.round(3),'face sy',round(Sf[1],3))
    vth=U[X+'thyroid_cartilage'][0].mean(0);ath=by['za2_thyroid_cartilage']['P'].mean(0)
    def narrow(Pp,y0,cx):
        best=None
        for y in np.arange(y0-0.03,y0+0.005,0.004):
            b=Pp[(np.abs(Pp[:,1]-y)<0.005)&(np.abs(Pp[:,0]-cx)<0.13)]
            if len(b)<20:continue
            w=np.ptp(b[:,0])
            if best is None or w<best[0]:best=(w,y,b.min(0),b.max(0))
        return best
    wv,yvn,vlo,vhi=narrow(Pt,vth[1],mid);wa,yan,alo,ahi_=narrow(aT,ath[1],0)
    Sn=np.array([max(0.85,(wa+0.012)/wv),sy,max(0.85,(ahi_[2]-alo[2]+0.012)/(vhi[2]-vlo[2]))])
    bones['neck']=(np.diag(Sn),np.array([-Sn[0]*mid,yan-Sn[1]*yvn,(alo[2]+ahi_[2])/2-Sn[2]*(vlo[2]+vhi[2])/2]));print('  neck scale',Sn.round(3),'levels',round(yvn,3),round(yan,3))
    info={'vchin':vchin}
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
        Mh,th=umeyama(X,Y);cY=Y.mean(0);cX=X.mean(0);Mh=Mh*1.08;bones['hand_'+S]=(Mh,cY-Mh@cX)
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
    Mp,tp=bones['pelvis'];wy=(hipmid[1]+axy)/2;wya=Mp[1,1]*wy+tp[1]
    y1=axy-0.05;y1a=wya+sy*(y1-wy);vlo,vhi=ext(Pt,y1);alo,ahi_=ext(aT,y1a);sxc=(ahi_[0]-alo[0]+0.016)/(vhi[0]-vlo[0])
    y2=axy+0.06;y2a=wya+sy*(y2-wy);lim=sx-0.03;vb=Pt[np.abs(Pt[:,0]-mid)<lim];ab_=aT[np.abs(aT[:,0])<lim*sxc];vlo,vhi=ext(vb,y2);alo,ahi_=ext(ab_,y2a)
    sxc=min(sxc,cfg['chest_max']);Sc=np.array([sxc,sy,max(0.95,(ahi_[2]-alo[2]+0.016)/(vhi[2]-vlo[2]))])
    bones['chest']=(np.diag(Sc),np.array([-Sc[0]*mid,wya-Sc[1]*wy,(alo[2]+ahi_[2])/2-Sc[2]*(vlo[2]+vhi[2])/2]));print('  chest scale',Sc.round(3))
    seeds['pelvis']=~armany&(y>hipmid[1]-0.02)&(y<hipmid[1]+0.12)
    seeds['chest']=~armany&(y>=axy-0.06)&(y<axy+0.10)&(np.abs(P[:,0]-mid)<0.6*sx)
    seeds['neck']=~armany&(y>yvn-0.015)&(y<yvn+0.015)
    seeds['head']=(y>eye_y+0.005)
    seeds['face']=(y<=eye_y-0.02)&(y>vchin+0.005)&(P[:,2]>ez-0.06*kk)&(np.abs(P[:,0]-mid)<0.065*kk)
    for k in list(bones):
        if k.split('_')[0] not in('uarm','farm','thigh','shank'):continue
        S=k[-1];g=GROUPS.index(('arm' if k[0] in 'uf' else 'leg')+S);M,t=bones[k]
        ends={'uarm':('shoulder_','elbow2_'),'farm':('elbow2_','wrist_'),'thigh':('hip_','knee2_'),'shank':('knee2_','ankle_')}[k.split('_')[0]]
        o=alm[ends[0]+S];e=alm[ends[1]+S];a1=unit(e-o)
        h=np.array([0,0,1.]);a2=unit(h-(h@a1)*a1);a3=np.cross(a1,a2)
        def cyl(Pp):
            d=Pp-o;t_=d@a1;return t_,np.hypot(d@a2,d@a3),np.arctan2(d@a3,d@a2)
        ts,rs,ths=cyl(P[seeds[k]]@M.T+t);ta_,ra,tha=cyl(aP[aG==g]);m=(ta_>ts.min())&(ta_<ts.max())&(ra<0.2)
        rat=[]
        for c in np.linspace(-np.pi,np.pi,13)[:-1]:
            ms=(ths>=c)&(ths<c+np.pi/6);ma=m&(tha>=c)&(tha<c+np.pi/6)
            if ms.sum()>5 and ma.sum()>5:rat.append((np.quantile(ra[ma],0.95)+0.004)/rs[ms].mean())
        sr=float(np.clip(np.quantile(rat,0.75),0.85,1.7))
        Sx=np.outer(a1,a1)+sr*(np.eye(3)-np.outer(a1,a1));bones[k]=(Sx@M,o+Sx@(t-o));print('  radial',k,round(sr,2))
    if not cfg.get('neck'):bones.pop('neck',None)
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
        if mod in('anatomyverse-vulva','zanatomy-eye','zanatomy-eyedetail','schematic-body-v1'): continue
        if sex=='f' and (mod in('anatomyverse-scrotum','zanatomy-male-urethra') or nm.startswith(male)): continue
        if sex=='m' and mod=='hubmap-female-repro': continue
        if sex=='m' and (nm.startswith(male) or mod in('anatomyverse-scrotum','zanatomy-male-urethra')): continue
        Q.append((m['P'],m['F']))
    return Q
def enclose(V,F,A,Q,alm,names,Wt,margin=0.003):
    rng=np.random.default_rng(3);pts=np.vstack([sample(P,Fq,max(300,int(len(Fq)*1.5)),rng)[0] for P,Fq in Q]+[P for P,_ in Q])
    _,ui=np.unique(np.round(pts/0.004).astype(np.int64),axis=0,return_index=True);pts=pts[ui]
    for S in 'LR':
        a=alm['wrist_'+S];b=alm['tip_middle_'+S];u=unit(b-a);t=(pts-a)@u;rd=np.linalg.norm((pts-a)-t[:,None]*u,axis=1)
        pts=pts[~((t>-0.005)&(rd<0.1))]
    # body-part groups, so one limb's skin never reacts to another part's anatomy
    G=GROUPS;pg=group_of(pts,alm)
    gw=np.zeros((len(V),len(G)))
    for i,k in enumerate(names):
        g='trunk' if k in('pelvis','chest','neck','head','face') else ('arm' if k.split('_')[0] in('uarm','farm','hand') else 'leg')+k[-1]
        gw[:,G.index(g)]+=Wt[:,i]
    vg=gw.argmax(1)
    A=A.copy();A.data[:]=1;deg=np.asarray(A.sum(1)).ravel();V=V.copy()
    # creases and near-contact zones (armpit, under the breast, between the thighs): never push skin there,
    # because moving one side outward only drives it into the facing side
    Nc=vnormals(V,F);trc=cKDTree(V);contact=np.zeros(len(V),bool)
    for dd in (0.008,0.014,0.02,0.028):
        d_,j_=trc.query(V+Nc*dd);contact|=(d_<0.5*dd)&(np.einsum('ij,ij->i',Nc[j_],Nc)<0.2)
    cm=contact.astype(float)
    for _ in range(3):cm=np.maximum(cm,A.multiply(cm[None,:]).max(axis=1).toarray().ravel())
    for _ in range(6):cm=(A@cm+cm)/(deg+1)
    keep=1-np.clip(cm*1.5,0,1);print('   contact-zone vertices',int(contact.sum()),flush=True)
    def passes(rounds,cap,reach,total,dil,avg,tag):
        nonlocal V
        N0=vnormals(V,F)
        for _ in range(8):N0=(A@N0+N0);N0/=np.maximum(np.linalg.norm(N0,axis=1),1e-12)[:,None]
        acc=np.zeros(len(V))
        for r in range(rounds):
            N=vnormals(V,F);need=np.zeros(len(V));nb_=0
            for gi in range(len(G)):
                vi=np.flatnonzero(vg==gi);q=pts[pg==gi]
                if len(q)==0:continue
                d,ix=cKDTree(V[vi]).query(q);gv=vi[ix];sd=np.einsum('ij,ij->i',q-V[gv],N[gv])
                val=(sd>-margin)&(d<reach)&(np.einsum('ij,ij->i',N[gv],N0[gv])>0.8)
                val&=keep[gv]>0.5;np.maximum.at(need,gv[val],np.minimum(sd[val]+margin,cap));nb_+=int(val.sum())
            if r%4==0 or r==rounds-1: print('   ',tag,r,'violations',nb_,flush=True)
            if nb_<30:break
            for _ in range(dil):
                nb=A.multiply(need[None,:]).max(axis=1).toarray().ravel();need=np.maximum(need,nb)
            for _ in range(avg):need=(A@need+need)/(deg+1)
            step=np.minimum(1.5*need*keep,total-acc);acc+=step;V+=N0*step[:,None]
    passes(10,0.006,0.03,0.04,6,40,'coarse')
    passes(12,0.004,0.015,0.02,4,12,'main')
    for _ in range(12):   # Taubin smoothing: removes creases and flaps without shrinking
        V=V+0.5*((A@V)/deg[:,None]-V);V=V-0.53*((A@V)/deg[:,None]-V)
    passes(4,0.003,0.008,0.006,2,6,'final')
    for _ in range(4):
        V=V+0.5*((A@V)/deg[:,None]-V);V=V-0.53*((A@V)/deg[:,None]-V)
    # flank under each armpit: the edge of latissimus dorsi leaves a ridge; relax it
    w=np.zeros(len(V))
    for sg in (1,-1):
        d=poly_dist(V,np.array([[sg*0.165,1.08,-0.01],[sg*0.165,1.38,-0.01]]));w=np.maximum(w,np.clip((0.105-d)/0.04,0,1))
    d=np.linalg.norm(V-np.array([0,1.47,0.06]),axis=1);w=np.maximum(w,0.6*np.clip((0.07-d)/0.03,0,1))
    for _ in range(40):V=V+(0.6*w)[:,None]*((A@V)/deg[:,None]-V)
    return V
CFG={'m':dict(chest_max=1.15,sy=0.894,pelvis_min=[0.95,0.95],r_arm=1.0,r_leg=1.0),'f':dict(chest_max=1.24,sy=0.931,pelvis_min=[0.95,0.95],r_arm=1.0,r_leg=1.0)}
if __name__=='__main__':
    for sex in sys.argv[1:]:
        V,F,L,A,info,names,Wt=run(sex,CFG[sex]);print(sex)
        Q=anatomy(L,sex);V0=V.copy();V=enclose(V,F,A,Q,pickle.load(open('app_lm.pkl','rb')),names,Wt)
        print('  moved mean mm',round(np.linalg.norm(V-V0,axis=1).mean()*1000,2),'p95',round(np.quantile(np.linalg.norm(V-V0,axis=1),0.95)*1000,1))
        pickle.dump((V,F,V0),open('fit_%s.pkl'%sex,'wb'))
        b=(-0.5,0.5,0.0,1.8);bs=(-0.3,0.3,0,1.8);sk=(214,170,140)
        an=[(P,Fq,(170,60,55)) for P,Fq in Q]
        ims=[render([(V,F,sk)],view=v,H=820,bounds=b if v in('front','back') else bs) for v in('front','right','back')]
        ims+=[render(an+[(V0,F,sk)],view='front',H=820,bounds=b),render(an,view='front',H=820,bounds=b)]
        sheet(ims,'fit_%s.png'%sex)
