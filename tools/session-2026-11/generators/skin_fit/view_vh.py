import sys;sys.path.insert(0,'.')
from glbinfo import meshes
from rnd import render,sheet
import numpy as np
ims=[]
for p in ['/tmp/ccf/v1.3/models/3d-vh-f-skin.glb','/tmp/ccf/v1.3/models/VH_M_Skin.glb']:
    j,ms=meshes(p);P,F=ms[0][1],ms[0][2]
    for v in ('front','right','back'): ims.append(render([(P,F,(214,170,140))],view=v,H=760))
sheet(ims,'vh_skins.png')
