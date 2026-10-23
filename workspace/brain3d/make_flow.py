import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from vnet import smooth_resample
N=pickle.load(open('net.pkl','rb')); Cs=pickle.load(open('csf_routes.pkl','rb'))
def enc(P,step): 
    P=smooth_resample(np.asarray(P),step,1) if step else np.asarray(P)
    return np.round(P*1e4).astype(int).reshape(-1).tolist()
blood=[]
for r in N['routes']:
    blood.append(dict(s=r['side'],a=enc(r['art'],0.0030),c=enc(r['cap'],0),v=enc(r['ven'],0.0025)))
csf=[enc(r,0.0030) for r in Cs['routes']]
T=pickle.load(open('tract_routes.pkl','rb')); sig=[dict(k=r['t'],p=enc(r['p'],0.004)) for r in T]
data=dict(off=[0,1.655,-0.012],blood=blood,csf=csf,sig=sig)
s=json.dumps(data,separators=(',',':')); open('brain-flow.json','w').write(s); print(len(s)/1e3,'KB',len(blood),'blood routes',len(csf),'csf routes')
