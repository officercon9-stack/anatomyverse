import sys,pickle,json,numpy as np
sys.path.insert(0,'/home/claude/brain3d')
from glbtools import *
from cl import smooth_resample
B=pickle.load(open('/tmp/bones_skinned.pkl','rb'))
def cl(V,y,half=0.009):
    s=V[np.abs(V[:,1]-y)<half]
    if len(s)<3: s=V[np.argsort(np.abs(V[:,1]-y))[:20]]
    return s.mean(0)
def line(V,y0,y1,n=14): return np.array([cl(V,y) for y in np.linspace(y0,y1,n)])
def A(*p): return np.array(p,float)
def sm(P,step=0.004): return smooth_resample(np.asarray(P,float),step,2)
nodes=[];omap={};routes={}
def add(sd,key,sid,pts,r,col,rough=.45):
    routes.setdefault((sd,key),[]).append(np.asarray(pts))
    nm=f'{key}_{sd}'
    omap[nm]=sid
    return nm
groups={}
def collect(sd,key,sid,paths,r,col,rough=.45):
    groups[(key,sd)]=dict(sid=sid,paths=[sm(p) for p in paths],r=r,col=col,rough=rough)
for sd,e in (('R',-1),('L',1)):
    med=-e; lat=e
    H=B[('humerus',sd)]; Ra=B[('radius',sd)]; U=B[('ulna',sd)]; Hd=B[('hand-bones',sd)]; Cl=B[('clavicle',sd)]; Sc=B[('scapula',sd)]
    yHt=H[:,1].max(); yE=H[:,1].min(); yW=min(Ra[:,1].min(),U[:,1].min())
    head=H[H[:,1]>yHt-0.02].mean(0)
    ch=lambda y: cl(H,y); cr=lambda y: cl(Ra,y); cu=lambda y: cl(U,y)
    ysH=np.linspace(yHt-0.05,yE+0.01,10)
    # forearm centre lines (radius lateral/anterior, ulna medial/posterior)
    ysF=np.linspace(yE-0.01,yW+0.012,12)
    # ----- arteries -----
    ax0=head+A(med*0.05,0.004,0.012)
    axl=[ax0,head+A(med*0.040,-0.03,0.012),ch(yHt-0.06)+A(med*0.026,0,0.008)]
    collect(sd,'axillary_artery','axillary-artery',[axl],.0042,0xD62F2F)
    br=[axl[-1]]+[ch(y)+A(med*0.022,0,0.007+0.002*(yHt-y)) for y in ysH[1:]]
    cub=ch(yE+0.012)+A(med*0.006,0,0.014)
    br.append(cub)
    collect(sd,'brachial_artery','brachial-artery',[br],.0036,0xD62F2F)
    rad=[cub]+[cr(y)+A(med*0.0,0,0.020) for y in ysF[1:]]
    hand_y=Hd[:,1].min(); wr=A(*(cr(yW+0.012)+A(0,0,0.016)))
    rad.append(wr+A(0,-0.02,0.004))
    collect(sd,'radial_artery','radial-artery',[rad],.0024,0xE0453F)
    uln=[cub]+[cu(y)+A(med*0.0,0,0.020) for y in ysF[1:]]
    uw=cu(yW+0.012)+A(0,0,0.016)
    uln.append(uw+A(med*-0.004,-0.02,0.006))
    # superficial palmar arch (ulnar artery into the palm, sweeping to the radial side)
    palm_y=yW-0.045
    arch=[uw+A(0,-0.02,0.006),A(uw[0]+lat*0.004,palm_y,uw[2]+0.014),A(uw[0]+lat*0.026,palm_y-0.012,uw[2]+0.016),A(wr[0]+med*0.0+lat*0.0,palm_y-0.005,wr[2]+0.012)]
    collect(sd,'ulnar_artery','ulnar-artery',[uln,arch],.0024,0xC83A5A)
    # ----- veins -----
    axv=[a+A(med*0.010,-0.002,-0.004) for a in axl]
    axv=[axl[0]+A(med*0.012,0.0,-0.006)]+[a+A(med*0.012,0,-0.006) for a in axl[1:]]
    collect(sd,'axillary_vein','axillary-vein',[axv],.0050,0x3E6FD1)
    bas=[axv[-1]+A(0,0,0)]+[ch(y)+A(med*0.036,0,0.0) for y in ysH[2:]]
    bas+= [cu(y)+A(med*0.030,0,0.024) for y in ysF[1:]]
    bas.append(bas[-1]+A(lat*0.012,-0.04,0.0))
    collect(sd,'basilic_vein','basilic-vein',[bas],.0032,0x2F5FC0)
    ceph=[head+A(lat*0.0,-0.045,0.045)]
    ceph+= [ch(y)+A(lat*0.026,0,0.030) for y in ysH[1:]]
    ceph+= [cr(y)+A(lat*0.016,0,0.034) for y in ysF[1:]]
    ceph.append(ceph[-1]+A(lat*0.0,-0.04,0.0))
    collect(sd,'cephalic_vein','cephalic-vein',[ceph],.0032,0x4A7DE0)
    # ----- nerves -----
    NC=0xF0CF45
    cord=head+A(med*0.040,0.006,0.0)
    med_n=[cord+A(med*0.0,0.0,0.012)]+[ch(y)+A(med*0.016,0,0.012+0.003*(yHt-y)) for y in ysH[0:]]
    med_n=[head+A(med*0.040,-0.01,0.010)]+[ch(y)+A(med*0.016,0,0.010+0.004*(yHt-y)) for y in ysH[1:]]
    med_n.append(cub+A(med*0.008,0,0.002))
    med_n+= [cl(U,y)*0.5+cl(Ra,y)*0.5+A(0,0,0.016) for y in ysF[2:]]
    mw=med_n[-1]
    med_n.append(mw+A(0,-0.018,0.008))
    palm=[A(mw[0],mw[1]-0.018,mw[2]+0.008)]
    fingers=[[palm[0],A(mw[0]+lat*0.026,palm_y-0.04,mw[2]+0.014)],[palm[0],A(mw[0]+lat*0.006,palm_y-0.05,mw[2]+0.014)],[palm[0],A(mw[0]-lat*0.014,palm_y-0.05,mw[2]+0.014)]]
    collect(sd,'median_nerve','median-nerve',[med_n]+fingers,.0030,NC)
    uln_n=[head+A(med*0.044,-0.012,0.002)]+[ch(y)+A(med*0.030,0,-0.004-0.003*(yHt-y)) for y in ysH[1:]]
    uln_n.append(ch(yE)+A(med*0.040,0,-0.016))
    uln_n+= [cu(y)+A(med*0.006,0,0.010) for y in ysF[2:]]
    uw2=uln_n[-1]
    uln_n.append(uw2+A(med*-0.002,-0.020,0.004))
    fin2=[[uln_n[-1],A(uw2[0]+lat*0.0-med*0.0+med*0.020*0-lat*0.004,palm_y-0.05,uw2[2]+0.010)],[uln_n[-1],A(uw2[0]+lat*0.018,palm_y-0.048,uw2[2]+0.012)]]
    collect(sd,'ulnar_nerve','ulnar-nerve',[uln_n]+fin2,.0028,0xE7C23A)
    rad_n=[head+A(med*0.030,-0.015,-0.020)]+[ch(y)+A(med*0.0+lat*0.004*(1-(yHt-y)/(yHt-yE))*0 ,0,-0.024) for y in ysH[1:5]]
    rad_n+= [ch(y)+A(lat*0.030*((yHt-y-0.12)/(yHt-yE-0.12)),0,-0.014+0.040*((yHt-y-0.12)/(yHt-yE-0.12))) for y in ysH[5:]]
    rad_n+= [cr(y)+A(lat*0.006,0,0.018) for y in ysF[1:7]]
    rr=rad_n[-1]
    sup=[rr]+[cr(y)+A(lat*0.012,0,0.004) for y in ysF[7:]]
    sup.append(sup[-1]+A(lat*0.004,-0.03,-0.012))
    collect(sd,'radial_nerve','radial-nerve',[rad_n,sup],.0030,0xD9B83A)
    mc=[head+A(med*0.040,-0.018,0.008)]+[ch(y)+A(med*0.0-med*0.004,0,0.016) for y in ysH[1:]]
    mc.append(cub+A(lat*0.014,0,0.012))
    mc+= [cr(y)+A(lat*0.014,0,0.030) for y in ysF[2:]]
    collect(sd,'musculocutaneous_nerve','musculocutaneous-nerve',[mc],.0024,0xF5E26A)
    # axillary nerve: round the surgical neck of the humerus
    cy=yHt-0.045; c0=ch(cy); P=[]
    for ang in np.linspace(np.radians(200),np.radians(-20),12):
        # angle in xz plane: 0 = lateral, 90 = anterior, 180 = medial, 270 = posterior
        P.append(c0+A(lat*0.026*np.cos(ang),0.0-0.004*(1 if ang<np.pi*1.2 else 0),0.026*np.sin(ang)*-1*np.sign(1)))
    P=[A(c0[0]+lat*0.026*np.cos(a),c0[1]-0.01*(1-np.cos(a))*0.2,c0[2]-0.026*np.sin(a)) for a in np.linspace(np.radians(190),np.radians(-30),12)]
    collect(sd,'axillary_nerve','axillary-nerve',[P],.0028,0xEAD14A)
    # ================= LEG =================
    F=B[('femur',sd)]; Ti=B[('tibia',sd)]; Fi=B[('fibula',sd)]; Ft=B[('foot-bones',sd)]; Hp=B[('hip-bone',sd)]
    yFt=F[:,1].max(); yK=F[:,1].min(); yTt=Ti[:,1].max(); yA=Ti[:,1].min()
    fhead=F[F[:,1]>yFt-0.02].mean(0)
    cf=lambda y: cl(F,y); ct=lambda y: cl(Ti,y); cfi=lambda y: cl(Fi,y)
    ysT=np.linspace(yFt-0.06,yK+0.13,10)
    ysL=np.linspace(yTt-0.03,yA+0.012,12)
    fa0=fhead+A(med*0.030,0.012,0.050)
    fem=[fa0]+[cf(y)+A(med*(0.028-0.016*i/9.0),0,0.034-0.034*(i/9.0)) for i,y in enumerate(ysT[1:],1)]
    hiat=cf(yK+0.11)+A(med*0.006,0,-0.020)
    pop=[hiat,cf(yK+0.06)+A(med*0.002,0,-0.034),cf(yK+0.01)+A(0,0,-0.042),ct(yTt-0.04)+A(0,0,-0.040)]
    pop_end=pop[-1]
    collect(sd,'femoral_artery','femoral-artery',[fem],.0044,0xD62F2F)
    collect(sd,'popliteal_artery','popliteal-artery',[[fem[-1]]+pop],.0038,0xD62F2F)
    ant=[pop_end,ct(yTt-0.065)+A(lat*0.012,0,-0.004)]+[ct(y)+A(lat*0.022,0,0.012) for y in ysL[2:]]
    af=ant[-1]; toe=Ft[:,2].max(); fy=Ft[:,1].min()
    ant+=[A(af[0]+med*0.012,af[1]-0.035,af[2]+0.030),A(af[0]+med*0.012+lat*0.0,fy+0.045,toe*0.55)]
    collect(sd,'anterior_tibial_artery','anterior-tibial-artery',[ant],.0026,0xE0453F)
    pt=[pop_end]+[ct(y)+A(med*0.004,0,-0.032) for y in ysL[1:]]
    pf=pt[-1]
    pt+=[A(pf[0]+med*0.020,pf[1]-0.022,pf[2]+0.002),A(pf[0]+med*0.016,fy+0.030,pf[2]+0.040)]
    collect(sd,'posterior_tibial_artery','posterior-tibial-artery',[pt],.0030,0xC83A5A)
    femv=[a+A(med*0.012,0,-0.010) for a in fem]
    collect(sd,'femoral_vein','femoral-vein',[femv],.0050,0x3E6FD1)
    gs=[femv[0]+A(med*0.010,-0.002,0.012)]+[cf(y)+A(med*(0.050+0.004*i/9),0,0.020-0.010*i/9) for i,y in enumerate(ysT[1:],1)]
    gs+=[cf(yK)+A(med*0.040,0,-0.010),ct(yTt-0.05)+A(med*0.052,0,-0.006)]+[ct(y)+A(med*0.044,0,0.002) for y in ysL[1:]]
    ga=gs[-1]; gs.append(A(ga[0]+med*0.004,ga[1]-0.025,ga[2]+0.020)); gs.append(A(ga[0]+med*0.004,fy+0.050,toe*0.45))
    collect(sd,'great_saphenous_vein','great-saphenous-vein',[gs],.0036,0x3A68C8)
    # nerves
    fn=[fhead+A(lat*0.010+med*0.028,0.020,0.044)]+[cf(y)+A(med*0.018,0,0.038-0.014*i/9) for i,y in enumerate(ysT[:4],1)]
    fbr=[[fn[-1],cf(y)+A(lat*0.026,0,0.040)] for y in (ysT[5],ysT[7])]
    fbr.append([fn[-1],cf(ysT[6])+A(lat*0.0,0,0.046)])
    sap=[fn[-1],cf(ysT[5])+A(med*0.026,0,0.020),cf(ysT[8])+A(med*0.034,0,0.010)]+[ct(y)+A(med*0.038,0,0.006) for y in ysL[0:]]
    sa_=sap[-1]; sap.append(A(sa_[0]+med*0.002,sa_[1]-0.03,sa_[2]+0.018)); sap.append(A(sa_[0]+med*0.012,fy+0.060,toe*0.40))
    collect(sd,'femoral_nerve','femoral-nerve',[fn]+fbr,.0032,0xF0CF45)
    collect(sd,'saphenous_nerve','saphenous-nerve',[sap],.0020,0xD9B83A)
    # sciatic nerve: greater sciatic notch -> back of thigh -> splits above knee
    notch=Hp[(Hp[:,2]<Hp[:,2].min()+0.05)&(Hp[:,1]<Hp[:,1].max()-0.07)]; nt=notch.mean(0) if len(notch) else fhead+A(0,0.02,-0.06)
    sc=[A(nt[0]+med*0.010,fhead[1]+0.03,fhead[2]-0.050)]+[cf(y)+A(med*0.002*0+med*0.0,0,-0.046) for y in np.linspace(yFt-0.05,yK+0.16,9)]
    split=sc[-1]
    collect(sd,'sciatic_nerve','sciatic-nerve',[sc],.0050,0xF0CF45)
    tn=[split]+[cf(y)+A(med*0.0,0,-0.045) for y in np.linspace(yK+0.15,yK+0.02,3)]+[ct(yTt-0.05)+A(0,0,-0.046)]+[ct(y)+A(med*0.0,0,-0.038) for y in ysL[2:]]
    tf=tn[-1]
    tn+=[A(tf[0]+med*0.020,tf[1]-0.024,tf[2]+0.002),A(tf[0]+med*0.016,fy+0.030,tf[2]+0.040)]
    collect(sd,'tibial_nerve','tibial-nerve',[tn],.0036,0xE7C23A)
    cfn=[split]+[cf(y)+A(lat*0.030,0,-0.036) for y in np.linspace(yK+0.12,yK+0.02,3)]
    hd=cfi(Fi[:,1].max()-0.012)
    cfn+=[hd+A(lat*0.0,0.0,-0.020),hd+A(lat*0.010,-0.020,0.004)]
    deep=[cfn[-1]]+[ct(y)+A(lat*0.026,0,0.018) for y in ysL[2:]]
    dz=deep[-1]; deep.append(A(dz[0]+lat*0.0,dz[1]-0.03,dz[2]+0.030)); deep.append(A(dz[0]+med*0.006,fy+0.045,toe*0.5))
    supf=[cfn[-1]]+[cfi(y)+A(lat*0.014,0,0.010) for y in np.linspace(Fi[:,1].max()-0.05,Fi[:,1].min()+0.03,7)]
    supf.append(supf[-1]+A(lat*0.006,-0.03,0.030))
    collect(sd,'common_fibular_nerve','common-fibular-nerve',[cfn,deep,supf],.0030,0xB8D43A)
# build nodes
for (key,sd),g in groups.items():
    V,F=merge([tube(p,g['r'],6) for p in g['paths']])
    nm=f'{key}_{sd}'; nodes.append(dict(name=nm,V=V,F=F,color=g['col'],rough=g['rough'])); omap[nm]=g['sid']
print(write_glb(nodes,'limbsupply.glb','anatomyverse-limbsupply.glb.json',generator='AnatomyVerse limb supply'))
json.dump(omap,open('limbsupply_objectmap.json','w'))
# diagnostic plot
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(21,10))
cols={}
for (key,sd),g in groups.items():
    c='#%06x'%g['col']
    for p in g['paths']:
        ax[0].plot(p[:,0],p[:,1],c=c,lw=1); ax[1].plot(p[:,2],p[:,1],c=c,lw=1); ax[2].plot(p[:,0],p[:,2],c=c,lw=1)
for k,V in B.items():
    ax[0].plot(V[::6,0],V[::6,1],'.',c='#bbb',ms=.5); ax[1].plot(V[::6,2],V[::6,1],'.',c='#bbb',ms=.5)
for a in ax: a.set_aspect('equal')
ax[0].set_title('front (x,y)'); ax[1].set_title('side (z,y)')
plt.savefig('viz_supply.png',dpi=55)
print({k:len(g['paths']) for k,g in list(groups.items())[:5]})
