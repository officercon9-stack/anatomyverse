import sys,numpy as np,pickle
sys.path.insert(0,'.')
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
import make_glb3 as mg
d=pickle.load(open('vessels_raw.pkl','rb'))
brain=np.vstack([(mg.T(mg.out[k][0])-mg.C)*0.001 for k in mg.KEEP if mg.out[k][2]['group']!='Skull'])[::6]
fig,ax=plt.subplots(1,3,figsize=(18,6))
views=[('sagittal (z→,y↑)',2,1),('coronal (x→,y↑)',0,1),('axial from above (x→,z↑)',0,2)]
for a,(t,i,j) in zip(ax,views):
    a.scatter(brain[:,i],brain[:,j],s=0.2,c='#bbb')
    for g in d['groups']:
        a.scatter(g['V'][::3,i],g['V'][::3,j],s=1,c='r')
    a.set_aspect('equal'); a.set_title(t)
plt.savefig('viz1.png',dpi=70)
