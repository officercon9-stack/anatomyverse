s=open('fit.py').read()
a="def run(sex,cfg):"
b='''GROUPS=['trunk','armL','armR','legL','legR']
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
def run(sex,cfg):'''
assert a in s;s=s.replace(a,b,1)
i=s.index("def poly_dist(p,pl):",s.index("def anatomy("));j=s.index("def enclose(");s=s[:i]+s[j:]
a=s[s.index("    G=['trunk','armL','armR','legL','legR'];top="):s.index("    gw=np.zeros((len(V),len(G)))")]
s=s.replace(a,"    G=GROUPS;pg=group_of(pts,alm)\n")
a=s[s.index("    Sd=np.array(cfg['pelvis']);bones['pelvis']"):s.index("    info={}")]
b='''    X='VH_%s_'%sex.upper()
    aP=np.vstack([p for p,_ in anatomy(L,sex)]);aG=group_of(aP,alm);aT=aP[aG==0]
    Pt=P[~armany]
    sy=cfg['sy'];yv=hipmid[1]+0.05;ya=ahip[1]+0.05*sy
    vlo,vhi=ext(Pt,yv);alo,ahi_=ext(aT,ya)
    Sd=np.array([max(cfg['pelvis_min'][0],(ahi_[0]-alo[0]+0.016)/(vhi[0]-vlo[0])),sy,max(cfg['pelvis_min'][1],(ahi_[2]-alo[2]+0.016)/(vhi[2]-vlo[2]))])
    tp=ahip-Sd*hipmid;tp[2]=(alo[2]+ahi_[2])/2-Sd[2]*(vlo[2]+vhi[2])/2;bones['pelvis']=(np.diag(Sd),tp);print('  pelvis scale',Sd.round(3))
    sk=np.vstack([m['P'] for m in L if m['chain'][1]=='zanatomy-skull'])
    scl=by['za_sclera_1']['P'];aeye=scl.mean(0);vtop=P[:,1].max();atop=sk[:,1].max()+0.006
    lv=eye_y+0.35*(vtop-eye_y);la=aeye[1]+0.35*(atop-aeye[1]);vlo,vhi=ext(P[np.abs(P[:,0]-mid)<0.12],lv);alo,ahi_=ext(sk,la)
    Sh=np.array([(ahi_[0]-alo[0]+0.012)/(vhi[0]-vlo[0]),(atop-aeye[1])/(vtop-eye_y),(ahi_[2]-alo[2]+0.012)/(vhi[2]-vlo[2])])
    th=np.array([-Sh[0]*mid,aeye[1]-Sh[1]*eye_y,(alo[2]+ahi_[2])/2-Sh[2]*(vlo[2]+vhi[2])/2]);bones['head']=(np.diag(Sh),th);print('  head scale',Sh.round(3))
    vth=U[X+'thyroid_cartilage'][0].mean(0);ath=by['za2_thyroid_cartilage']['P'].mean(0)
    def narrow(Pp,y0,cx):
        best=None
        for y in np.arange(y0-0.03,y0+0.05,0.004):
            b=Pp[(np.abs(Pp[:,1]-y)<0.005)&(np.abs(Pp[:,0]-cx)<0.13)]
            if len(b)<20:continue
            w=np.ptp(b[:,0])
            if best is None or w<best[0]:best=(w,y,b.min(0),b.max(0))
        return best
    wv,yvn,vlo,vhi=narrow(Pt,vth[1],mid);wa,yan,alo,ahi_=narrow(aT,ath[1],0)
    Sn=np.array([(wa+0.012)/wv,sy,(ahi_[2]-alo[2]+0.012)/(vhi[2]-vlo[2])])
    bones['neck']=(np.diag(Sn),np.array([-Sn[0]*mid,yan-Sn[1]*yvn,(alo[2]+ahi_[2])/2-Sn[2]*(vlo[2]+vhi[2])/2]));print('  neck scale',Sn.round(3),'levels',round(yvn,3),round(yan,3))
'''
s=s.replace(a,b)
a=s[s.index("    aSd=abs(alm['shoulder_L'][0]"):s.index("    seeds['pelvis']=")]
b='''    Mp,tp=bones['pelvis'];wy=(hipmid[1]+axy)/2;wya=Mp[1,1]*wy+tp[1]
    y1=axy-0.05;y1a=wya+sy*(y1-wy);vlo,vhi=ext(Pt,y1);alo,ahi_=ext(aT,y1a);sxc=(ahi_[0]-alo[0]+0.016)/(vhi[0]-vlo[0])
    y2=axy+0.06;y2a=wya+sy*(y2-wy);lim=sx-0.03;vb=Pt[np.abs(Pt[:,0]-mid)<lim];ab_=aT[np.abs(aT[:,0])<lim*sxc];vlo,vhi=ext(vb,y2);alo,ahi_=ext(ab_,y2a)
    Sc=np.array([sxc,sy,(ahi_[2]-alo[2]+0.016)/(vhi[2]-vlo[2])])
    bones['chest']=(np.diag(Sc),np.array([-Sc[0]*mid,wya-Sc[1]*wy,(alo[2]+ahi_[2])/2-Sc[2]*(vlo[2]+vhi[2])/2]));print('  chest scale',Sc.round(3))
'''
s=s.replace(a,b)
a="    seeds['neck']=~armany&(y>vth[1]-0.02)&(y<vth[1]+0.03)";assert a in s
s=s.replace(a,"    seeds['neck']=~armany&(y>yvn-0.015)&(y<yvn+0.015)")
a="    seeds['head']=y>eye_y-0.085*H/1.75";assert a in s
s=s.replace(a,"    seeds['head']=y>eye_y-0.07*H/1.75")
a="    names=list(bones);lab=-np.ones(n,int)"
b='''    for k in list(bones):
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
    names=list(bones);lab=-np.ones(n,int)'''
assert a in s;s=s.replace(a,b)
a="        if mod=='anatomyverse-vulva' and sex=='m': continue";assert a in s
s=s.replace(a,"        if mod in('anatomyverse-vulva','zanatomy-eye','zanatomy-eyedetail','schematic-body-v1'): continue")
i=s.index("CFG=");j=s.index("\n",i)
s=s[:i]+"CFG={'m':dict(sy=0.894,pelvis_min=[0.95,0.95],r_arm=1.0,r_leg=1.0),'f':dict(sy=0.931,pelvis_min=[0.95,0.95],r_arm=1.0,r_leg=1.0)}"+s[j:]
open('fit.py','w').write(s)
