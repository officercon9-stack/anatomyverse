import sys,numpy as np,json
sys.path.insert(0,'.')
import make_csf_hull as H
from glbtools import *
from cordlib import cord,OFF
br=np.array([[0,-0.0838,-0.0135],[0,-0.1005,-0.0215],[0,-0.1130,-0.0268],[0,-0.1205,-0.0285],[0,-0.1235,-0.0290]])
cc=cord(0,0.93,0.01)-OFF; cc=cc[cc[:,1]<br[-1,1]]
path=np.vstack([br[1:],cc[::3]])
nodes=[];omap={}
def add(n,sid,V,F,col,a): nodes.append(dict(name=n,V=V,F=F,color=col,alpha=a,rough=0.35)); omap[n]=sid
for nm,sid,off,col,a,r in (('pia','pia-mater',0.0006,0xF08CA4,0.6,0.0069),('arachnoid','arachnoid-mater',0.0050,0xF2F4FA,0.42,0.0102),('dura','dura-mater',0.0090,0xD9A05A,0.40,0.0118)):
    V,F=H.hull(off); V2,F2=tube(path,np.full(len(path),r),12); V3,F3=merge([(V,F),(V2,F2)]); add(nm,sid,V3,F3,col,a)
print(write_glb(nodes,'brain-mening.glb','bodyparts3d-brain-mening.glb.json')); json.dump(omap,open('mening_objectmap.json','w'))
