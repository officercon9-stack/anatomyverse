import sys,re,json,numpy as np,trimesh,fast_simplification
sys.path.insert(0,'/home/claude/brain3d')
from glbtools import *
from muscles_data import M,HAND_BONES,GROUPS_NOSKIN
S='/home/claude/bp3d-src/assets/BodyParts3D_data/stl/'
named=json.load(open('/tmp/named.json'))
def A(V): return np.column_stack([1.1*V[:,0],V[:,1]+70,1.1*V[:,2]-94])/1000.0
def load(stem):
    m=trimesh.load(S+stem+'.stl'); V=np.asarray(m.vertices); V=np.column_stack([V[:,0],V[:,2],-V[:,1]]); return A(V),np.asarray(m.faces)
def side_of(n):
    if re.search(r'\bright\b',n): return 'R'
    if re.search(r'\bleft\b',n): return 'L'
    return None
def norm(n): return re.sub(r'\b(right|left) ','',n).strip()
EXIST_PAT={'deltoid':r'(clavicular|acromial|spinal) part of deltoid','biceps-brachii':r'(long|short) head of biceps brachii','triceps-brachii':r'(long|lateral|medial) head of triceps brachii'}
MUS=[(r[0],r[3]) for r in M if r[0]!='rectus-abdominis' or True]
for k,v in EXIST_PAT.items(): MUS.append((k,v))
GROUP={r[0]:r[4] for r in M}
for k in EXIST_PAT: GROUP[k]='arm'
GROUP['rectus-abdominis']='abdomen'
GROUP['rectus-femoris']='thigh';GROUP['gastrocnemius']='leg';GROUP['pectoralis-major']='chest'
COL={'abdomen':0xB04840,'back':0xA9423C,'neck':0xBA4D43,'head':0xC05448,'pelvis':0xA83E3A,'shoulder':0xB5463F,'arm':0xC24F44,'chest':0xB8493F,'forearm':0xBF5347,'hand':0xC95A4C,'hip':0xA83E3A,'thigh':0xB84A40,'leg':0xB34540,'foot':0xC25449}
parts=[]  # (stem,id,side,name)
used=set()
for s,n,k in named:
    sd=side_of(n)
    if sd is None: continue
    nn=norm(n)
    for mid,pat in MUS:
        if re.fullmatch(pat,nn):
            parts.append((s,mid,sd,n)); used.add(mid); break
FIB=[('linea-alba',r'linea alba',False),('inguinal-ligament',r'inguinal ligament',False),('iliotibial-tract',r'iliotibial tract',True),('flexor-retinaculum',r'flexor retinaculum of wrist',True),
 ('interosseous-membrane-forearm',r'interosseous membrane of forearm',True),('interosseous-membrane-leg',r'interosseous membrane of leg',True),('long-plantar-ligament',r'long plantar ligament',True)]
fparts=[]
for s_,n,k in named:
    nn=norm(n)
    for fid,pat,sk in FIB:
        if re.fullmatch(pat,nn) or re.fullmatch(pat,n): fparts.append((s_,fid,side_of(n) or 'M',n,sk)); break
print('fibrous parts',len(fparts),[f[1:3] for f in fparts])
print('muscle parts',len(parts),'ids',len(used))
missing=[m for m,_ in MUS if m not in used]; print('missing',missing)
BONES={'humerus':r'humerus','radius':r'radius','ulna':r'ulna','scapula':r'scapula','clavicle':r'clavicle','hip-bone':r'hip bone','femur':r'femur','patella':r'patella','tibia':r'tibia','fibula':r'fibula',
 'hand-bones':r'(scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|(first|second|third|fourth|fifth) metacarpal bone|(proximal|middle|distal) phalanx of (right |left )?(thumb|index finger|middle finger|ring finger|little finger))',
 'foot-bones':r'(talus|calcaneus|cuboid bone|(medial|intermediate|lateral) cuneiform bone|navicular bone of (right |left )?foot|sesamoid bone of (right |left )?foot|(first|second|third|fourth|fifth) metatarsal bone|(proximal|middle|distal) phalanx of (right |left )?(big toe|second toe|third toe|fourth toe|little toe))'}
bparts=[]
for s,n,k in named:
    sd=side_of(n)
    if sd is None: continue
    nn=norm(n) if not re.search(r'phalanx|navicular|sesamoid',n) else n
    for bid,pat in BONES.items():
        if re.fullmatch(pat,re.sub(r'\b(right|left) ','',n).strip()) or re.fullmatch(pat,nn):
            bparts.append((s,bid,sd,n)); break
print('bone parts',len(bparts))
from collections import Counter; print(Counter(b[1] for b in bparts))
# ------- landmarks -------
def slab(V,ax,hi,frac=0.05):
    t=V[:,ax]; return V[t>=np.quantile(t,1-frac)].mean(0) if hi else V[t<=np.quantile(t,frac)].mean(0)
def pick(name,sd):
    for s,n,k in named:
        if n==f'{"right" if sd=="R" else "left"} {name}': return s
LM={}
for sd,e in (('R',-1),('L',1)):
    hu=load(pick('humerus',sd))[0]; ra=load(pick('radius',sd))[0]; ul=load(pick('ulna',sd))[0]
    fe=load(pick('femur',sd))[0]; ti=load(pick('tibia',sd))[0]; fi=load(pick('fibula',sd))[0]
    P0=slab(hu,1,True,0.04); P1=slab(hu,1,False,0.05); P2=(slab(ra,1,False,0.04)+slab(ul,1,False,0.04))/2
    arm=(P0,P1,P2,np.array([e*.195,1.395,-.01]),np.array([e*.268,1.122,-.008]),np.array([e*.338,.87,.012]))
    H0=slab(fe,1,True,0.03); H1=(slab(fe,1,False,0.04)+slab(ti,1,True,0.04))/2; H2=slab(ti,1,False,0.04)
    leg=(H0,H1,H2,H0.copy(),np.array([e*.0985,H1[1],H1[2]]),np.array([e*.093,H2[1],H2[2]]))
    LM[sd]=dict(arm=arm,leg=leg); print(sd,'arm',[x.round(3).tolist() for x in arm[:3]],'leg',[x.round(3).tolist() for x in leg[:3]])
def rot(a,b):
    a=a/np.linalg.norm(a); b=b/np.linalg.norm(b); v=np.cross(a,b); c=a@b
    if c<-0.9999: return -np.eye(3)
    K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]); return np.eye(3)+K+K@K/(1+c)
def ss(x): x=np.clip(x,0,1); return x*x*(3-2*x)
def skin(V,lm):
    P0,P1,P2,Q0,Q1,Q2=lm
    a1=P1-P0; b1=Q1-Q0; a2=P2-P1; b2=Q2-Q1
    R1=rot(a1,b1); s1=np.linalg.norm(b1)/np.linalg.norm(a1); R2=rot(a2,b2); s2=np.linalg.norm(b2)/np.linalg.norm(a2)
    T1=Q0+s1*(V-P0)@R1.T; T2=Q1+s2*(V-P1)@R2.T
    ax=(a1/np.linalg.norm(a1)+a2/np.linalg.norm(a2)); ax/=np.linalg.norm(ax)
    w=ss(((V-P1)@ax+0.03)/0.06)[:,None]
    out=(1-w)*T1+w*T2
    s0=(V-P0)@(a1/np.linalg.norm(a1)); d=np.linalg.norm(V-P0,axis=1)
    alpha=np.where(s0>=0,1.0,np.clip(1-d/0.12,0,1))[:,None]
    return V+alpha*(out-V)
def limb_of(V,sd):
    y=np.median(V[:,1]); return 'arm' if (y>1.0 and abs(np.median(V[:,0]))>0.12) or y>1.12 else 'leg'
def limb_for(stem_name,V,sd):
    n=stem_name
    if re.search(r'hip|gluteus|piriformis|obturator|gemellus|quadratus femoris|iliacus|psoas|tensor|sartorius|femoris|vastus|pectineus|adductor (longus|brevis|magnus|minimus)|gracilis|semi|popliteus|gastrocnemius|soleus|plantaris|calcaneal|tibialis|digitorum longus|digitorum brevis|hallucis|fibularis|foot|toe|metatars|talus|calcaneus|cuboid|cuneiform|navicular|patella|femur|tibia|fibula|accessorius|tarsal|sesamoid|lumbrical.*foot|interossei.*foot|iliotibial|plantar|membrane of (right |left )?leg',n) and not re.search(r'carpi|hand|finger|thumb|pollicis',n): return 'leg'
    return 'arm'
def decim(V,F,tgt):
    if len(F)<=tgt: return V,F
    V2,F2=fast_simplification.simplify(np.asarray(V,np.float32),np.asarray(F,np.int32),target_reduction=1-tgt/len(F)); return np.asarray(V2,float),np.asarray(F2,int)
size={s:k for s,n,k in named}
nodes=[];omap={};marks={}
XIN={'supraspinatus','infraspinatus','teres-minor','teres-major','subscapularis','latissimus-dorsi','pectoralis-major','trapezius','rhomboid-major','rhomboid-minor','quadratus-femoris','piriformis','obturator-internus','obturator-externus','gemellus-superior','gemellus-inferior','pectoralis-minor','levator-scapulae'}
XOUT={'serratus-anterior'}
LOW={'rectus-abdominis','internal-oblique','transversus-abdominis','quadratus-lumborum','erector-spinae','multifidus','sternocleidomastoid','platysma','sternohyoid','sternothyroid','omohyoid','thyrohyoid','longus-colli','serratus-posterior-inferior','transversus-thoracis'}
ZPOST={'abductor-hallucis','flexor-digitorum-brevis','abductor-digiti-minimi-foot','flexor-accessorius','extensor-digitorum-brevis'}
def ends(V,mid,sd):
    c=V.mean(0); u,s,vt=np.linalg.svd(V-c,full_matrices=False); a=vt[0]; t=(V-c)@a
    lo=V[t<=np.quantile(t,0.08)].mean(0); hi=V[t>=np.quantile(t,0.92)].mean(0)
    p=[lo,hi]
    if mid in XIN: p.sort(key=lambda q:abs(q[0]))
    elif mid in XOUT: p.sort(key=lambda q:-abs(q[0]))
    elif mid in ZPOST: p.sort(key=lambda q:q[2])
    elif mid in LOW: p.sort(key=lambda q:q[1])
    else: p.sort(key=lambda q:-q[1])
    return p[0],p[1]
def split_tendon(V,F,nb=24,frac_thr=0.5,maxfrac=0.42,minfrac=0.07):
    if len(F)<60: return (V,F),None
    c=V.mean(0); u,sv,vt=np.linalg.svd(V-c,full_matrices=False); a=vt[0]; t=(V-c)@a
    lo,hi=np.percentile(t,0.5),np.percentile(t,99.5); L=hi-lo
    if L<0.03: return (V,F),None
    rr=np.linalg.norm((V-c)-np.outer(t,a),axis=1); tn=np.clip((t-lo)/L,0,1)
    b=np.minimum((tn*nb).astype(int),nb-1); R=np.array([np.percentile(rr[b==k],90) if (b==k).sum()>3 else 0 for k in range(nb)])
    R=np.convolve(np.pad(R,1,mode='edge'),[1/3]*3,'valid'); thr=frac_thr*R.max()
    ok=R>=thr; k0=int(np.argmax(ok)); k1=nb-1-int(np.argmax(ok[::-1]))
    f0=k0/nb; f1=(nb-1-k1)/nb
    f0=min(f0,maxfrac); f1=min(f1,maxfrac)
    if f0<minfrac: f0=0
    if f1<minfrac: f1=0
    if f0==0 and f1==0: return (V,F),None
    cen=tn[F].mean(1); isT=(cen<f0)|(cen>1-f1)
    if isT.all(): return (V,F),None
    if (~isT).sum()<10: return (V,F),None
    return (V,F[~isT]),(V,F[isT]) if isT.any() else None
groups={};tgroups={}
for s,mid,sd,n in parts:
    V,F=load(s); sz=size[s]; tgt=int(np.clip(sz*0.28,120,1300)); o,i=ends(V,mid,sd)
    lm=LM[sd][limb_for(n,V,sd)]
    V,F=decim(V,F,tgt)
    if GROUP.get(mid) not in GROUPS_NOSKIN: V=skin(V,lm); o=skin(o[None],lm)[0]; i=skin(i[None],lm)[0]
    if mid=='calcaneal-tendon': bel,ten=(V,F),None
    else: bel,ten=split_tendon(V,F)
    if bel is not None: groups.setdefault((mid,sd),[]).append(bel)
    if ten is not None: tgroups.setdefault((mid,sd),[]).append(ten)
    marks.setdefault(mid,{'o':[],'i':[]}); marks[mid]['o'].append(o.round(4).tolist()); marks[mid]['i'].append(i.round(4).tolist())
for (mid,sd),L in groups.items():
    V,F=merge(L); nm=f'm_{mid}_{sd}'; nodes.append(dict(name=nm,V=V,F=F,color=0xE8D9C0 if mid=='calcaneal-tendon' else COL.get(GROUP.get(mid,'arm'),0xB5463F),rough=0.55,smooth=True)); omap[nm]=mid
TEN=0xF4F0E6
for (mid,sd),L in tgroups.items():
    V,F=merge(L); nm=f't_{mid}_{sd}'; nodes.append(dict(name=nm,V=V,F=F,color=TEN,rough=0.42,smooth=True)); omap[nm]=mid
print('muscle nodes',len(groups),'tendon nodes',len(tgroups))
for s_,fid,sd,n,sk in fparts:
    V,F=load(s_); lm=LM[sd][limb_for(n,V,sd)] if sd in LM else None
    V,F=decim(V,F,int(np.clip(size[s_]*0.45,150,1500)))
    if sk and lm is not None: V=skin(V,lm)
    nodes.append(dict(name=f'f_{fid}_{sd}',V=V,F=F,color=0xEDEDE6,rough=0.45,smooth=True)); omap[f'f_{fid}_{sd}']=fid
bg={}
for s,bid,sd,n in bparts:
    V,F=load(s); lm=LM[sd][limb_for(n,V,sd) if bid not in ('humerus','radius','ulna','femur','tibia','fibula','patella') else ('arm' if bid in('humerus','radius','ulna') else 'leg')]
    if bid in ('scapula','clavicle','hip-bone'): tg=1800
    elif bid in ('hand-bones','foot-bones'): tg=260
    else: tg=2200
    V,F=decim(V,F,tg)
    if bid not in ('scapula','clavicle','hip-bone'): V=skin(V,lm)
    bg.setdefault((bid,sd),[]).append((V,F))
for (bid,sd),L in bg.items():
    V,F=merge(L); nm=f'b_{bid}_{sd}'; nodes.append(dict(name=nm,V=V,F=F,color=0xE9E1CF,rough=0.5,smooth=True)); omap[nm]=bid
def BV(bid,sd): return merge(bg[(bid,sd)])[0]
LIGC=0xEDEDE6
for sd,e in (('R',-1),('L',1)):   # e: +1 = patient's left (x positive); medial = toward x=0
    med=-e
    fe=BV('femur',sd); ti=BV('tibia',sd); pa=BV('patella',sd); fi=BV('fibula',sd)
    ytop=ti[:,1].max(); yb=fe[:,1].min()
    pinf=pa[np.argmin(pa[:,1])]; psup=pa[np.argmax(pa[:,1])]; pant=pa[np.argmax(pa[:,2])]
    sel=ti[(ti[:,1]>ytop-0.09)&(ti[:,1]<ytop-0.02)]; tub=sel[np.argmax(sel[:,2])]
    p0=np.array([pant[0],pinf[1]+0.004,pant[2]-0.002]); 
    nodes.append(dict(name=f'f_patellar-ligament_{sd}',V=tube(np.linspace(p0,tub+np.array([0,0,-0.002]),8),[0.0032,0.0048,0.0042],8)[0],F=tube(np.linspace(p0,tub+np.array([0,0,-0.002]),8),[0.0032,0.0048,0.0042],8)[1],color=LIGC,rough=0.45)); omap[f'f_patellar-ligament_{sd}']='patellar-ligament'
    lowf=fe[fe[:,1]<yb+0.03]; 
    mfe=lowf[np.argmax(lowf[:,0]*med)]; lfe=lowf[np.argmin(lowf[:,0]*med)]
    tsel=ti[(ti[:,1]>ytop-0.08)]; mti=tsel[np.argmax(tsel[:,0]*med)]
    fsel=fi[fi[:,1]>fi[:,1].max()-0.03]; hfi=fsel[np.argmin(fsel[:,0]*med)]
    def band(a,b,r,key,nm,nid):
        P=np.linspace(a,b,8); P[:,0]+=(-med if nid.startswith('medial') is False else med)*0.0; v,f=tube(P,r,8)
        nodes.append(dict(name=f'f_{nm}_{sd}',V=v,F=f,color=LIGC,rough=0.45)); omap[f'f_{nm}_{sd}']=nid
    band(mfe+np.array([med*0.002,0.0,0]),mti+np.array([med*0.002,0.0,0]),[0.0026,0.0034,0.0030],0,'medial-collateral-ligament','medial-collateral-ligament')
    band(lfe+np.array([-med*0.002,0.0,0]),hfi+np.array([-med*0.002,0.012,0]),0.0022,0,'lateral-collateral-ligament','lateral-collateral-ligament')
    tc=ti[ti[:,1]>ytop-0.012].mean(0); fc=lowf.mean(0)
    band(np.array([tc[0]-med*0.004,tc[1]+0.002,tc[2]+0.012]),np.array([fc[0]-med*0.008*0-med*0.003*-1,fc[1]+0.026,fc[2]-0.012]),0.0028,0,'anterior-cruciate-ligament','anterior-cruciate-ligament')
    band(np.array([tc[0]+med*0.004,tc[1]+0.002,tc[2]-0.012]),np.array([fc[0]+med*0.005,fc[1]+0.026,fc[2]+0.008]),0.0030,0,'posterior-cruciate-ligament','posterior-cruciate-ligament')
    print(sd,'knee',pinf.round(3),tub.round(3),mfe.round(3),mti.round(3))
print('bone nodes',len(bg),'total nodes',len(nodes))
print(write_glb(nodes,'limbs.glb','anatomyverse-limbs.glb.json',generator='AnatomyVerse limbs'))
json.dump(omap,open('limbs_objectmap.json','w')); json.dump(marks,open('muscle-attach.json','w'),separators=(',',':'))
print('tris',sum(len(n['F']) for n in nodes))
import pickle
pickle.dump({k:merge(v)[0] for k,v in bg.items()},open('/tmp/bones_skinned.pkl','wb'))
