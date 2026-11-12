"""Fit the MakeHuman (CC0) body to the app skeleton and muscles: limbs by linear-blend skinning on
joint-to-landmark bones, trunk and head by a height-dependent warp to the anatomy extents, then push-out so
no anatomy pokes through."""
import sys,os
SW='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/skinwork';sys.path.insert(0,SW)
import pickle,numpy as np
RAD=0;RLO=float(os.environ.get('RLO',0.92));RHI=float(os.environ.get('RHI',1.3));TMAX=float(os.environ.get('TMAX',1.45))
from scipy.sparse import coo_matrix,diags
from scipy.sparse.linalg import splu
from scipy.ndimage import gaussian_filter1d
from fit import anatomy,enclose,group_of,bone,umeyama,unit,poly_dist,GROUPS
from rnd import render,sheet
def adj(F,n):
    i=np.r_[F[:,0],F[:,1],F[:,2],F[:,1],F[:,2],F[:,0]];j=np.r_[F[:,1],F[:,2],F[:,0],F[:,0],F[:,1],F[:,2]]
    A=coo_matrix((np.ones(len(i)),(i,j)),shape=(n,n)).tocsr();A.data[:]=1;return A
def run(sex):
    P,F,J=pickle.load(open('mhp_%s.pkl'%sex,'rb'));n=len(P)
    alm=pickle.load(open(SW+'/app_lm.pkl','rb'));L=pickle.load(open(SW+'/app_%s.pkl'%('male' if sex=='m' else 'female'),'rb'));by={m['name']:m for m in L}
    Q=anatomy(L,sex);aP=np.vstack([p for p,_ in Q]);aG=group_of(aP,alm)
    Z=np.array([0,0,1.]);j=lambda k:J[k]
    sk=np.vstack([m['P'] for m in L if len(m['chain'])>1 and m['chain'][1]=='zanatomy-skull'])
    aeye=by['za_sclera_1']['P'].mean(0) if 'za_sclera_1' in by else np.array([0,1.59,0.06])
    # --- limb bones
    bones={};segs={}
    for S,s in (('L','l'),('R','r')):
        bones['uarm_'+S]=bone(j(s+'-shoulder'),j(s+'-elbow'),Z,alm['shoulder_'+S],alm['elbow2_'+S],Z,1.0)
        mw=(j(s+'-hand')+j(s+'-hand-2'))/2*0+j(s+'-hand')
        bones['farm_'+S]=bone(j(s+'-elbow'),mw,Z,alm['elbow2_'+S],alm['wrist_'+S],Z,1.0)
        X=[];Y=[]
        for N,f in ((2,'index'),(3,'middle'),(4,'ring'),(5,'little')):
            for jj,a in ((1,'mcb'),(2,'mcp'),(3,'pip'),(4,'dip')):X.append(j('%s-finger-%d-%d'%(s,N,jj)));Y.append(alm['%s_%s_%s'%(a,f,S)])
        for jj,a in ((2,'mcp'),(3,'pip')):X.append(j('%s-finger-1-%d'%(s,jj)));Y.append(alm['%s_thumb_%s'%(a,S)])
        Mh,th=umeyama(np.array(X),np.array(Y));bones['hand_'+S]=(Mh,th)
        bones['thigh_'+S]=bone(j(s+'-upper-leg'),j(s+'-knee'),Z,alm['hip_'+S],alm['knee2_'+S],Z,1.0)
        bones['shank_'+S]=bone(j(s+'-knee'),j(s+'-ankle'),Z,alm['knee2_'+S],alm['ankle_'+S],Z,1.0)
        footm=(P[:,1]<j(s+'-ankle')[1]+0.02)&(np.sign(P[:,0])==(1 if S=='L' else -1))
        fp=P[footm];heel=fp[np.argmin(fp[:,2]+0.5*fp[:,1])]
        X=np.array([j(s+'-ankle'),j(s+'-toe-1-1'),j(s+'-toe-5-1'),j(s+'-toe-1-3'),heel]);ax=alm['footaxis_'+S]
        Y=np.array([alm['ankle_'+S],alm['mt1h_'+S],alm['mt5h_'+S],alm['toe1_'+S]-0.012*ax,alm['heel_'+S]-0.010*ax])
        bones['foot_'+S]=umeyama(X,Y)
        segs['arm'+S]=np.array([j(s+'-shoulder'),j(s+'-elbow'),j(s+'-hand'),j(s+'-finger-3-4')])
        segs['leg'+S]=np.array([j(s+'-upper-leg'),j(s+'-knee'),j(s+'-ankle'),j(s+'-toe-1-3')])
    # --- radial (girth) scale per limb segment so the skin covers the muscles
    for k in [k for k in bones if k.split('_')[0] in('uarm','farm','thigh','shank')]:
        S=k[-1];s=S.lower();base=k.split('_')[0]
        mj={'uarm':(s+'-shoulder',s+'-elbow','shoulder_','elbow2_'),'farm':(s+'-elbow',s+'-hand','elbow2_','wrist_'),'thigh':(s+'-upper-leg',s+'-knee','hip_','knee2_'),'shank':(s+'-knee',s+'-ankle','knee2_','ankle_')}[base]
        o,e=j(mj[0]),j(mj[1]);u=unit(e-o);t=(P-o)@u;r=np.linalg.norm((P-o)-t[:,None]*u,axis=1);ln=np.linalg.norm(e-o)
        sel=(t>0.25*ln)&(t<0.75*ln)&(r<0.12)
        oa,ea=alm[mj[2]+S],alm[mj[3]+S];ua=unit(ea-oa);g=GROUPS.index(('arm' if base in('uarm','farm') else 'leg')+S);Ap=aP[aG==g]
        ta=(Ap-oa)@ua;ra=np.linalg.norm((Ap-oa)-ta[:,None]*ua,axis=1);la=np.linalg.norm(ea-oa);sa=(ta>0.25*la)&(ta<0.75*la)&(ra<0.12)
        M,tt=bones[k];sl=la/ln
        # current radius after the bone map (bone keeps radial scale 1 -> radius r)
        sr=RAD*0+float(np.clip((np.quantile(ra[sa],0.97)+0.005)/np.quantile(r[sel],0.6),RLO,RHI)) if sa.sum()>20 and sel.sum()>20 else 1.0
        bones[k]=bone(o,e,Z if base!='thigh' else Z,oa,ea,Z,sr);print('  radial',k,round(sr,2))
    # --- trunk warp
    trunkpl=np.array([[0,j('l-upper-leg')[1]-0.08,0],[0,j('head-2')[1],0]])
    yk_m=np.array([P[:,1].min(),j('l-upper-leg')[1],j('l-shoulder')[1],j('l-eye')[1],P[:,1].max()])
    asole=min(aP[:,1].min(),alm['heel_L'][1]-0.03);ahip=(alm['hip_L'][1]+alm['hip_R'][1])/2;ash=(alm['shoulder_L'][1]+alm['shoulder_R'][1])/2
    yk_a=np.array([asole-0.004,ahip,ash,aeye[1],sk[:,1].max()+0.007])
    ymap=lambda y:np.interp(y,yk_m,yk_a,left=None,right=None)+(y<yk_m[0])*(y-yk_m[0])+(y>yk_m[-1])*(y-yk_m[-1])
    # MH trunk vertices (exclude limbs) and app trunk anatomy
    dm=np.stack([poly_dist(P,segs[g]) for g in ('armL','armR','legL','legR')],1).min(1);dt=poly_dist(P,trunkpl)
    tm=(dt<dm*1.0)|(np.abs(P[:,0])<0.6*j('l-shoulder')[0])
    tm&=~((P[:,1]<j('l-upper-leg')[1]-0.03))   # below crotch belongs to legs
    aT=np.vstack([aP[aG==0],sk])
    ys=np.arange(j('l-upper-leg')[1]-0.03,P[:,1].max()+0.001,0.01);sx=[];sz=[];cx=[];cz=[];ok=[]
    for y in ys:
        b=P[tm&(np.abs(P[:,1]-y)<0.008)];ya=ymap(y);ba=aT[np.abs(aT[:,1]-ya)<0.008]
        if y>j('l-shoulder')[1]-0.04 and y<j('neck')[1]: # shoulders: use the narrow core only
            b=b[np.abs(b[:,0])<0.07+0.0*y];ba=ba[np.abs(ba[:,0])<0.07]
        if len(b)<10 or len(ba)<10:sx.append(np.nan);sz.append(np.nan);cx.append(np.nan);cz.append(np.nan);continue
        mg=0.010 if ya>aeye[1]-0.12 else 0.016
        sx.append((np.ptp(ba[:,0])+mg)/np.ptp(b[:,0]));sz.append((np.ptp(ba[:,2])+mg)/np.ptp(b[:,2]))
        cx.append((ba[:,0].min()+ba[:,0].max())/2-(b[:,0].min()+b[:,0].max())/2*sx[-1]);cz.append((ba[:,2].min()+ba[:,2].max())/2-(b[:,2].min()+b[:,2].max())/2*sz[-1])
    def fill(a,lo,hi):
        a=np.array(a,float);m=~np.isnan(a);a=np.interp(np.arange(len(a)),np.flatnonzero(m),a[m]);a=np.clip(a,lo,hi);return gaussian_filter1d(a,4,mode='nearest')
    # never shrink the MakeHuman trunk below its own shape by more than 10%; it is the realistic contour
    sx=fill(sx,0.97,TMAX);sz=fill(sz,0.97,TMAX);sx[:]=sx.mean() if TMAX<=1.0 else sx;sz[:]=sz.mean() if TMAX<=1.0 else sz;cx=fill(cx,-0.05,0.05);cz=fill(cz,-0.08,0.08)
    def trunk(Pp):
        y=Pp[:,1];X=np.interp(y,ys,sx);Zs=np.interp(y,ys,sz);Cx=np.interp(y,ys,cx);Cz=np.interp(y,ys,cz)
        return np.c_[Pp[:,0]*X+Cx,ymap(y),Pp[:,2]*Zs+Cz]
    print('  trunk sx range',sx.min().round(2),sx.max().round(2),'sz',sz.min().round(2),sz.max().round(2))
    # --- seeds and harmonic weights
    names=['chest']+[k for k in bones];lab=-np.ones(n,int)
    lab[tm&(np.abs(P[:,0])<0.5*j('l-shoulder')[0])&(P[:,1]>j('l-upper-leg')[1]+0.06)]=0
    tl=np.array([j('pelvis'),j('spine-3'),j('neck'),j('head-2')]);dT=poly_dist(P,tl)*1.0
    near={g:poly_dist(P,segs[g]) for g in segs}
    for S,s in (('L','l'),('R','r')):
        own_a=(near['arm'+S]<dT)&(near['arm'+S]<near['leg'+S]);own_l=(near['leg'+S]<dT*1.3)&(near['leg'+S]<near['arm'+S])
        def seg(a,b,lo,hi):
            o,e=j(a),j(b);u=e-o;t=((P-o)@u)/(u@u);r=np.linalg.norm((P-o)-t[:,None]*u,axis=1);return (t>lo)&(t<hi)&(r<0.11)
        side=np.sign(P[:,0])==(1 if S=='L' else -1)
        for k,a,b,lo,hi in (('uarm',s+'-shoulder',s+'-elbow',0.3,0.8),('farm',s+'-elbow',s+'-hand',0.2,0.8),('thigh',s+'-upper-leg',s+'-knee',0.3,0.85),('shank',s+'-knee',s+'-ankle',0.15,0.85)):
            lab[seg(a,b,lo,hi)&side&(own_a if k in('uarm','farm') else own_l)&(lab<0)]=names.index(k+'_'+S)
        lab[side&own_a&(np.linalg.norm(P-j(s+'-finger-3-1'),axis=1)<0.07)&(lab<0)]=names.index('hand_'+S)
        lab[side&(P[:,1]<j(s+'-ankle')[1]-0.025)&(lab<0)]=names.index('foot_'+S)
    A=adj(F,n);deg=np.asarray(A.sum(1)).ravel();Lp=diags(deg)-A;fi=np.flatnonzero(lab<0);si=np.flatnonzero(lab>=0)
    B=np.zeros((len(si),len(names)));B[np.arange(len(si)),lab[si]]=1
    Wt=np.zeros((n,len(names)));Wt[si]=B;Wt[fi]=np.clip(splu(Lp[fi][:,fi].tocsc()).solve(-(Lp[fi][:,si]@B)),0,1);Wt/=Wt.sum(1,keepdims=True)
    for S in 'LR':
        tr_own=(dT<near['arm'+S])&(P[:,1]<j('l-shoulder')[1]-0.08)
        for k in ('farm_','hand_'):Wt[tr_own,names.index(k+S)]=0
        Wt[tr_own&(P[:,1]<j('l-shoulder')[1]-0.15),names.index('uarm_'+S)]=0
    Wt[Wt.sum(1)<1e-6,0]=1;Wt/=Wt.sum(1,keepdims=True)
    for _ in range(6):Wt=(A@Wt+Wt)/(deg[:,None]+1)
    Wt/=Wt.sum(1,keepdims=True)
    V=Wt[:,[0]]*trunk(P)
    for i,k in enumerate(names[1:],1):M,t=bones[k];V+=Wt[:,[i]]*(P@M.T+t)
    EY=pickle.load(open('eyes_%s.pkl'%sex,'rb'));pickle.dump({k:(trunk(v),f) for k,(v,f) in EY.items()},open('eyesfit_%s.pkl'%sex,'wb'))
    return V,F,L,A,names,Wt,Q,alm
if __name__=='__main__':
    for sex in sys.argv[1:]:
        V,F,L,A,names,Wt,Q,alm=run(sex);V0=V.copy()
        from scipy.spatial import cKDTree
        from fit import vnormals
        N=vnormals(V,F);pts=np.vstack([p for p,_ in Q]);d,i=cKDTree(V).query(pts);sd=np.einsum('ij,ij->i',pts-V[i],N[i]);out=sd>0
        for nm,m in (('head',pts[:,1]>1.5),('arms',np.abs(pts[:,0])>0.2),('trunk',(np.abs(pts[:,0])<0.2)&(pts[:,1]>0.9)&(pts[:,1]<1.5)),('legs',pts[:,1]<0.9)):
            o=sd[m&out];print('  poke',nm,'n',len(o),'of',m.sum(),'p50/p95 mm',np.round(np.quantile(o,[0.5,0.95])*1e3,1) if len(o) else '-')
        if os.environ.get('NOPUSH'):
            pickle.dump((V,F,V0),open('fitmh_%s.pkl'%sex,'wb'));b=(-0.5,0.5,0.0,1.8);an=[(P,Fq,(170,60,55)) for P,Fq in Q]
            sheet([render([(V,F,(214,170,140))],view='front',H=700,bounds=b),render(an+[(V,F,(214,170,140))],view='front',H=700,bounds=b),render(an+[(V,F,(214,170,140))],view='right',H=700,bounds=(-0.3,0.3,0,1.8))],'np_%s.png'%sex);continue
        V=enclose(V,F,A,Q,alm,names,Wt,guard=0.05 if sex=='f' else None)
        d=np.linalg.norm(V-V0,axis=1);print(sex,'push-out mean mm',round(d.mean()*1e3,2),'p95',round(np.quantile(d,0.95)*1e3,1))
        pickle.dump((V,F,V0),open('fitmh_%s.pkl'%sex,'wb'))
        b=(-0.5,0.5,0.0,1.8);bs=(-0.3,0.3,0,1.8);sk=(214,170,140);an=[(P,Fq,(170,60,55)) for P,Fq in Q]
        ims=[render([(V,F,sk)],view=v,H=820,bounds=b if v in('front','back') else bs) for v in('front','right','back')]+[render(an+[(V0,F,sk)],view='front',H=820,bounds=b)]
        sheet(ims,'mh_%s.png'%sex)
