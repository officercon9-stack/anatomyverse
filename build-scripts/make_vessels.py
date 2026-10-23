import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from glbtools import *
from vnet import *
N=pickle.load(open('net.pkl','rb')); S=N['S']
RED,BLUE,PURP=0xD9363E,0x3D6FD6,0xB0509A
nodes=[]; omap={}
def add(name,sid,V,F,color,**kw):
    if len(V)==0: return
    nodes.append(dict(name=name,V=V,F=F,color=color,**kw)); omap[name]=sid
# BodyParts3D arteries (as-is, per group; MCA left mirrored)
short={'ophthalmic-artery':'oph','anterior-choroidal-artery':'ach','posterior-choroidal-arteries':'pch','thalamic-perforating-arteries':'thp','anterior-cerebral-artery':'aca','middle-cerebral-artery':'mca','posterior-cerebral-artery':'pca','superior-cerebellar-artery':'sca','anterior-inferior-cerebellar-artery':'aica','posterior-inferior-cerebellar-artery':'pica','pontine-arteries':'pon','anterior-spinal-artery':'asa','basilar-artery':'ba','vertebral-artery':'va','internal-carotid-artery':'ica'}
for g in RAW:
    add(f"{short[g['sid']]}_{g['side']}",g['sid'],g['V'],g['F'],RED)
gl=get_group('middle-cerebral-artery','L'); add('mca_L','middle-cerebral-artery',gl['V'],gl['F'],RED)
# procedural arterial branches & connectors, tapering
for parent,lines in N['branch_tubes'].items():
    ms=[]
    for ln in lines:
        # keep only the distal part that is not BP3D mesh: last 45% of each route keeps the fine branch look
        n=len(ln); seg=ln[int(n*0.55):] if parent not in('thalamic-perforating-arteries','anterior-choroidal-artery') else ln[-12:]
        if len(seg)<3: continue
        ms.append(tube(seg,np.linspace(0.0006,0.00028,len(seg)),5))
    V,F=merge(ms); add('br_'+short[parent],parent,V,F,RED)
for parent,pl in N['connectors']:
    V,F=tube(pl,0.0011,6); add('cn_'+short[parent]+str(len(nodes)),parent,V,F,RED)
# veins & sinuses
def vt(name,sid,lines,rad,sides=7):
    ms=[tube(l,rad,sides) for l in lines]; V,F=merge(ms); add(name,sid,V,F,BLUE)
sss=S['sss']; vt('sss','superior-sagittal-sinus',[sss],np.linspace(0.0014,0.0030,10),8)
st=S['straight']; k=max(3,len(st)//4)
vt('gcv','great-cerebral-vein',[st[:k+1]],0.0016); vt('straight','straight-sinus',[st[k:]],0.0019)
vt('iss','inferior-sagittal-sinus',[S['iss']],np.linspace(0.0008,0.0012,6),6)
vt('icv','internal-cerebral-veins',[S['icv_r'],S['icv_l']],0.0010,6)
vt('ts','transverse-sinus',[S['ts_r'],S['ts_l']],0.0026,8)
vt('sig','sigmoid-sinus',[S['sig_r'],S['sig_l']],0.0027,8)
vt('ijv','internal-jugular-vein',[S['ijv_r'],S['ijv_l']],np.linspace(0.0032,0.0048,6),9)
vt('cav','cavernous-sinus',[S['cav_r'],S['cav_l']],0.0022,8)
vt('pet','petrosal-sinuses',[S['pet_r'],S['pet_l']],0.0012,6)
# cortical veins: taper toward the sinus
cv=[]
for v in N['vein_tubes']:
    if len(v)<3: continue
    cv.append(tube(v,np.linspace(0.00042,0.00085,len(v)),5))
V,F=merge(cv); add('cortveins','superficial-cerebral-veins',V,F,BLUE)
# capillary bed: route hops + random loops over the pial surface
from surf import surf_pt
caps=[tube(h,0.00022,4) for h in N['cap_hops'] if len(h)>2]
rng2=np.random.default_rng(11)
cnt=0
while cnt<2600:
    d=rng2.normal(size=3); 
    if d[1]<-0.35: continue
    p0=surf_pt(d,0.0004)[0]
    # random-walk along the surface
    pts=[p0]; dirn=to_dir(p0)[0]; tg=np.cross(dirn,rng2.normal(size=3)); tg/=np.linalg.norm(tg)
    for k in range(6):
        tg=tg+rng2.normal(size=3)*0.9; tg-=dirn*(tg@dirn); tg/=np.linalg.norm(tg)
        q=pts[-1]+tg*0.0007; dq=to_dir(q)[0]; q=surf_pt(dq,0.0004)[0]; pts.append(q); dirn=dq
    caps.append(tube(np.array(pts),0.00018,4)); cnt+=1
V,F=merge(caps); add('caps','cerebral-capillary-bed',V,F,PURP,rough=0.5)
print({n['name']:(len(n['V']),len(n['F'])) for n in nodes})
sz=write_glb(nodes,'brain-vessels.glb','bodyparts3d-brain-vessels.glb.json')
print('size',sz); json.dump(omap,open('vessels_objectmap.json','w'),indent=0)
