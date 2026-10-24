import sys,re,json,numpy as np,trimesh,fast_simplification
sys.path.insert(0,'/home/claude/brain3d')
from glbtools import *
S='/home/claude/bp3d-src/assets/BodyParts3D_data/stl/'
named=json.load(open('/tmp/named.json'))
def A(V): return np.column_stack([1.1*V[:,0],V[:,1]+70,1.1*V[:,2]-94])/1000.0
def load(stem):
    m=trimesh.load(S+stem+'.stl'); V=np.asarray(m.vertices); V=np.column_stack([V[:,0],V[:,2],-V[:,1]]); return A(V),np.asarray(m.faces)
def decim(V,F,tgt):
    if len(F)<=tgt: return V,F
    V2,F2=fast_simplification.simplify(np.asarray(V,np.float32),np.asarray(F,np.int32),target_reduction=1-tgt/len(F)); return np.asarray(V2,float),np.asarray(F2,int)
def side(n):
    if re.search(r'\bright\b',n): return 'R'
    if re.search(r'\bleft\b',n): return 'L'
    return 'M'
# (node, structure id, name regex, colour, target tris, smooth)
ART=0xD62F2F; VEN=0x3E6FD1
SPEC=[
 ('liver','liver',r'liver',0x8C3B30,5000),
 ('gallbladder','gallbladder',r'gallbladder',0x5C9A45,800),
 ('stomach','stomach',r'stomach',0xD08C7A,4000),
 ('oesophagus','oesophagus',r'esophagus',0xC98A6B,800),
 ('pancreas','pancreas',r'pancreas, nsn|pancreatic duct',0xE3B07A,2500),
 ('spleen','spleen',r'spleen',0x7A3556,2500),
 ('duodenum','duodenum',r'duodenum',0xE59B84,3000),
 ('jejunum','jejunum',r'jejunum',0xE08E78,7000),
 ('ileum','ileum',r'ileum',0xD9806C,7000),
 ('large_intestine','large-intestine',r'colon, nsn',0xC98B6B,6000),
 ('appendix','appendix',r'appendix',0xD39A7C,300),
 ('rectum','rectum',r'rectum',0xB97A5D,1500),
 ('kidney','kidney',r'(right|left) kidney',0x8D3B2F,3500),
 ('adrenal_gland','adrenal-gland',r'(right|left) adrenal gland',0xC99A3A,1500),
 ('ureter','ureter',r'(right|left) ureter',0xD9B38A,500),
 ('urinary_bladder','urinary-bladder',r'urinary bladder',0xD9B38A,2000),
 ('eye','eye',r'eyeball',0xDDE3E8,1500),
 ('thymus','thymus',r'(right|left) lobe of thymus',0xE6D3A8,2500),
 # vessels
 ('aorta','aorta',r'ascending aorta|arch of aorta|descending aorta|brachiocephalic artery, nsn',ART,4000),
 ('common_carotid','common-carotid-artery',r'(right|left) common carotid artery',ART,600),
 ('subclavian_artery','subclavian-artery',r'(right|left) subclavian artery',ART,600),
 ('inferior_vena_cava','inferior-vena-cava',r'inferior vena cava',VEN,1500),
 ('subclavian_vein','subclavian-vein',r'(right|left) (brachiocephalic|subclavian) vein',VEN,600),
 ('internal_jugular_vein','internal-jugular-vein',r'(right|left) internal jugular vein',VEN,400),
 ('common_iliac','common-iliac-artery',r'(right|left) common iliac artery',ART,400),
 ('internal_iliac_artery','internal-iliac-artery',r'(right|left) internal iliac artery',ART,300),
 ('external_iliac_artery','external-iliac-artery',r'(right|left) external iliac artery',ART,400),
 ('iliac_veins','iliac-veins',r'(right|left) (common|internal|external) iliac vein',VEN,900),
 ('renal_artery','renal-artery',r'(right|left) renal artery',ART,400),
 ('renal_vein','renal-vein',r'(right|left) renal vein',VEN,400),
 ('coeliac_trunk','coeliac-trunk',r'celiac artery|common hepatic artery|left gastric artery|splenic artery',ART,600),
 ('superior_mesenteric_artery','superior-mesenteric-artery',r'superior mesenteric artery',ART,300),
 ('inferior_mesenteric_artery','inferior-mesenteric-artery',r'inferior mesenteric artery',ART,300),
 ('superior_mesenteric_vein','superior-mesenteric-vein',r'superior mesenteric vein',VEN,300),
 ('splenic_vein','splenic-vein',r'splenic vein',VEN,300),
 # trunk bones
 ('rib_cage','ribs',r'(right|left) (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib',0xE9E1CF,9000),
 ('sternum','sternum',r'manubrium|body of sternum|xiphoid process',0xE9E1CF,1200),
 ('vertebral_column','vertebral-column',r'[a-z ]+ (thoracic|lumbar|cervical) vertebra|sacrum',0xE9E1CF,14000),
 ('intervertebral_discs','intervertebral-discs',r'intervertebral disk of [a-z ]+',0xBFD6DE,5000),
 ('costal_cartilages','costal-cartilages',r'(right|left) (first|second|third|fourth|fifth|sixth|seventh) costal cartilage',0xDCE8EE,2500),
]
nodes=[];omap={}
for nid,sid,pat,col,tgt in SPEC:
    items=[(s,n) for s,n,k in named if re.fullmatch(pat,n)]
    if not items: print('MISSING',nid,pat); continue
    bysd={}
    for s,n in items: bysd.setdefault(side(n),[]).append(s)
    tot=sum(1 for _ in items)
    for sd,stems in bysd.items():
        L=[]
        for st in stems:
            V,F=load(st); L.append((V,F))
        # split budget by original faces
        sizes=[len(F) for V,F in L]; tot_f=sum(sizes)
        L2=[decim(V,F,max(60,int(tgt*len(F)/tot_f/ (1 if len(bysd)==1 else len(bysd))))) for V,F in L]
        V,F=merge(L2)
        nm=nid if sd=='M' else f'{nid}_{sd}'
        nodes.append(dict(name=nm,V=V,F=F,color=col,rough=0.42,smooth=True)); omap[nm]=sid
        print(nm,sid,len(F))
print(write_glb(nodes,'organs.glb','anatomyverse-organs.glb.json',generator='AnatomyVerse organs'))
json.dump(omap,open('organs_objectmap.json','w'))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,2,figsize=(14,12))
for nd in nodes:
    c='#%06x'%nd['color']; V=nd['V']; ax[0].plot(V[::4,0],V[::4,1],'.',c=c,ms=1); ax[1].plot(V[::4,2],V[::4,1],'.',c=c,ms=1)
for a in ax: a.set_aspect('equal')
plt.savefig('viz_organs.png',dpi=55)
