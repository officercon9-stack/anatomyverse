"""Scrotum from the MakeHuman genital helper (CC0): sac part only, posed with the body, lengthened so it
encloses the app's testes and epididymides, smoothed by subdivision."""
import pickle,numpy as np,json,trimesh
SW='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/skinwork'
EY=pickle.load(open('eyesfit_m.pkl','rb'));P,F=EY['helper-genital'];lab=np.load('genlab.npy')
L=pickle.load(open(SW+'/app_male.pkl','rb'));TP=np.vstack([m['P'] for m in L if m['name'].startswith(('za2_testis','za2_epididymis'))])
Fs=F[lab==0];u=np.unique(Fs);rm=-np.ones(len(P),int);rm[u]=np.arange(len(u));V=P[u].copy();Fs=rm[Fs]
# close every open boundary loop with a fan to its centroid, so the sac is a closed surface
mt=trimesh.Trimesh(V,Fs,process=True);V=np.array(mt.vertices);Fs=np.array(mt.faces)
from trimesh.grouping import group_rows
E_=np.sort(mt.edges,axis=1);be=E_[group_rows(E_,require_count=1)]
import collections
adj=collections.defaultdict(list)
for a,b in be:adj[a].append(b);adj[b].append(a)
seen=set();caps=[];VV=list(V)
for st in list(adj):
    if st in seen:continue
    loop=[st];seen.add(st);cur=st
    while True:
        nx=[x for x in adj[cur] if x not in seen]
        if not nx:break
        cur=nx[0];seen.add(cur);loop.append(cur)
    if len(loop)<3:continue
    c=len(VV);VV.append(V[loop].mean(0))
    for i in range(len(loop)):caps.append([loop[i],loop[(i+1)%len(loop)],c])
V=np.array(VV);Fs=np.vstack([Fs,np.array(caps)]);mt=trimesh.Trimesh(V,Fs,process=True);trimesh.repair.fix_normals(mt);V=np.array(mt.vertices);Fs=np.array(mt.faces);print('loops capped',len(caps))
from trimesh.remesh import subdivide
for _ in range(2):V,Fs=subdivide(V,Fs)
mt=trimesh.Trimesh(V,Fs,process=True);trimesh.repair.fix_normals(mt);V=np.array(mt.vertices);Fs=np.array(mt.faces)
from trimesh.smoothing import filter_taubin
mt=trimesh.Trimesh(V,Fs,process=False);filter_taubin(mt,lamb=0.5,nu=0.53,iterations=25);V=np.array(mt.vertices)
ytop=V[:,1].max();ymin=V[:,1].min();tlo,thi=TP.min(0),TP.max(0);mg=0.006
ynew=min(ymin,tlo[1]-mg);t=np.clip((ytop-V[:,1])/(ytop-ymin),0,1)
cx=(V[:,0].min()+V[:,0].max())/2;cz=(V[:,2].min()+V[:,2].max())/2;wx=np.ptp(V[:,0]);wz=np.ptp(V[:,2])
sx=max(1,(thi[0]-tlo[0]+2*mg)/wx);sz=max(1,(thi[2]-tlo[2]+2*mg)/wz);tcx=(tlo[0]+thi[0])/2;tcz=(tlo[2]+thi[2])/2
W=t**0.7
X=V.copy();X[:,1]=ytop-t*(ytop-ynew)
X[:,0]=V[:,0]+W*((V[:,0]-cx)*(sx-1)+(tcx-cx));X[:,2]=V[:,2]+W*((V[:,2]-cz)*(sz-1)+(tcz-cz))
# check containment of testes
from scipy.spatial import cKDTree
mm=trimesh.Trimesh(X,Fs,process=False);print('watertight',mm.is_watertight,'verts',len(X),'box',X.min(0).round(3),X.max(0).round(3),'testes box',tlo.round(3),thi.round(3))
json.dump({'mh_scrotum':dict(v=np.round(X,5).tolist(),f=Fs.tolist(),c=[0.60,0.36,0.26],rough=0.7)},open('scrot.json','w'))
