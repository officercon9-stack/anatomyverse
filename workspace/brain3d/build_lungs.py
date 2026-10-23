import sys,numpy as np,json,pickle
sys.path.insert(0,'.')
from lungload import *
from glbtools import *
import trimesh,fast_simplification
O=np.array([0,1.425,0.015])
def A(V): return np.column_stack([1.1*V[:,0],V[:,1]+70,1.1*V[:,2]-94])/1000.0-O
def prep(fma,red=0.0,smooth=0,exclude=()):
    V,F=concept(fma,exclude); 
    m=trimesh.Trimesh(V,F,process=True); m.merge_vertices(); m.remove_unreferenced_vertices()
    V,F=m.vertices,m.faces
    if red>0: V,F=fast_simplification.simplify(np.asarray(V,np.float32),np.asarray(F,np.int32),target_reduction=red)
    if smooth:
        m=trimesh.Trimesh(V,F,process=False); trimesh.smoothing.filter_taubin(m,iterations=smooth); V,F=m.vertices,m.faces
    return A(np.asarray(V,float)),np.asarray(F,int)
nodes=[];omap={}
def add(name,sid,V,F,col,alpha=1.0,rough=0.5):
    nodes.append(dict(name=name,V=V,F=F,color=col,alpha=alpha,rough=rough)); omap[name]=sid
import pickle
LS=pickle.load(open('/home/claude/brain3d/lung_surface.pkl','rb'))['out']
def oblique(p): return 0.865*(p[:,2]-45)+0.505*(p[:,1]-1270)
COL={'ru':0xF08F8A,'rm':0xF59C8C,'rl':0xE67A7E,'lu':0xF08F8A,'ll':0xE67A7E}
for side in ('R','L'):
    V0,F0,_=LS[side]
    V1,F1=fast_simplification.simplify(np.asarray(V0,np.float32),np.asarray(F0,np.int32),target_reduction=0.55)
    m=trimesh.Trimesh(V1,F1,process=False); trimesh.smoothing.filter_taubin(m,iterations=4); V1,F1=np.asarray(m.vertices),np.asarray(m.faces)
    cen=V1[F1].mean(1); ob=oblique(cen)
    if side=='R': lab=np.where(ob<0,2,np.where((cen[:,1]<1205)&(cen[:,2]>75),1,0)); names=[('lobe_ru','right-upper-lobe','ru'),('lobe_rm','right-middle-lobe','rm'),('lobe_rl','right-lower-lobe','rl')]
    else: lab=np.where(ob<0,1,0); names=[('lobe_lu','left-upper-lobe','lu'),('lobe_ll','left-lower-lobe','ll')]
    for k,(nm,sid,ck) in enumerate(names):
        sel=F1[lab==k]; used=np.unique(sel); rm=np.full(len(V1),-1); rm[used]=np.arange(len(used))
        add(nm,sid,A(V1[used]),rm[sel],COL[ck],1.0,0.35); print(nm,len(used),len(sel))
V,F=prep('FMA7394',0.0,0); add('trachea','trachea',V,F,0xEBD7C4,1.0,0.4)
V,F=prep('FMA7395',0.0,0); add('main_bronchus_r','right-main-bronchus',V,F,0xEBD7C4,1.0,0.4)
V,F=prep('FMA7396',0.0,0); add('main_bronchus_l','left-main-bronchus',V,F,0xEBD7C4,1.0,0.4)
V,F=prep('FMA7393',0.35,0); add('bronchial_tree','bronchial-tree',V,F,0xF3E6D6,1.0,0.4); print('tree',len(V),len(F))
V,F=prep('FMA13295',0.9,4); add('diaphragm','diaphragm',V,F,0xB04A42,1.0,0.5); print('dia',len(V),len(F))
print(write_glb(nodes,'lungs-a.glb','bodyparts3d-lungs-a.glb.json'))
json.dump(omap,open('lungs_objectmap_a.json','w'))
