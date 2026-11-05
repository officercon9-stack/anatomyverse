import numpy as np, json
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter
a=np.load('palate_pts.npy')
sel=a[(a[:,1]>1.525)&(a[:,1]<1.57)&(abs(a[:,0])<0.034)&(a[:,2]>0.03)&(a[:,2]<0.095)]
T=cKDTree(sel[:,[0,2]])
xs=np.arange(-0.032,0.0321,0.0008);zs=np.arange(0.048,0.0921,0.0008)
H=np.full((len(xs),len(zs)),np.nan);mask=np.zeros_like(H,bool)
for i,x in enumerate(xs):
    for j,z in enumerate(zs):
        half=0.0285-0.45*(z-0.048)  # arch narrows forwards
        half=max(half,0.0)
        if abs(x)<=half and z<=0.092-0.0 and (x/0.0285)**2*0.0+(z-0.048)>=0:
            # forward limit: elliptical arch
            if ((z-0.048)/0.044)**2+(x/ (0.0285))**2<=1.0:
                idx=T.query_ball_point([x,z],0.003)
                if idx: H[i,j]=sel[idx,1].min();mask[i,j]=True
# fill + smooth
from scipy.interpolate import griddata
X,Z=np.meshgrid(xs,zs,indexing='ij')
v=mask&~np.isnan(H)
Hf=griddata((X[v],Z[v]),H[v],(X,Z),method='nearest')
Hs=gaussian_filter(Hf,2.5)
# region polygon mask again (smooth boundary)
m2=((Z-0.048)/0.044)**2+(X/0.0285)**2<=1.0
th=0.0016
V=[];F=[];idx={}
def vid(i,j,top):
    k=(i,j,top)
    if k not in idx:
        y=Hs[i,j]-0.0004-(0 if top else th)
        # arch sag: vault dips slightly at the middle
        idx[k]=len(V);V.append([float(xs[i]),float(y),float(zs[j])])
    return idx[k]
for i in range(len(xs)-1):
    for j in range(len(zs)-1):
        if m2[i,j] and m2[i+1,j] and m2[i,j+1] and m2[i+1,j+1]:
            for top in(1,0):
                a_,b_,c_,d_=vid(i,j,top),vid(i+1,j,top),vid(i,j+1,top),vid(i+1,j+1,top)
                if top: F+= [[a_,c_,b_],[b_,c_,d_]]   # upper face: outward up
                else: F+= [[a_,b_,c_],[b_,d_,c_]]     # lower face: outward down
V=np.array(V);print(len(V),len(F),V.min(0).round(3),V.max(0).round(3))
json.dump({'v':np.round(V,5).tolist(),'f':F,'c':[0.86,0.52,0.50],'ds':True,'open':True},open('palate_hard.json','w'))
