import sys,numpy as np,pickle,json
sys.path.insert(0,'.')
from glbtools import *
from vnet import *
from surf import surf_r,P as BP
N=pickle.load(open('net.pkl','rb')); S=N['S']
# --- smooth hull from radial map ---
def hull(off,nl=72,na=144,lapl=3):
    la=np.linspace(-np.pi/2+0.02,np.pi/2-0.02,nl); az=np.linspace(-np.pi,np.pi,na,endpoint=False)
    LA,AZ=np.meshgrid(la,az,indexing='ij')
    D=np.stack([np.sin(AZ)*np.cos(LA),np.sin(LA),np.cos(AZ)*np.cos(LA)],-1).reshape(-1,3)
    r=surf_r(D)+off; Pn=(CEN+D*r[:,None]).reshape(nl,na,3)
    for _ in range(lapl):
        Pn=(Pn+np.roll(Pn,1,1)+np.roll(Pn,-1,1))/3; Pn[1:-1]=(Pn[1:-1]*2+Pn[:-2]+Pn[2:])/4
    V=Pn.reshape(-1,3); F=[]
    for i in range(nl-1):
        for j in range(na):
            a=i*na+j; b=i*na+(j+1)%na; c=a+na; d=b+na; F+=[(a,c,b),(b,c,d)]
    # caps
    top=len(V); V=np.vstack([V,Pn[-1].mean(0),Pn[0].mean(0)]); bot=top+1
    for j in range(na): F.append(((nl-1)*na+j,top,(nl-1)*na+(j+1)%na)); F.append((j,(j+1)%na,bot))
    return V,np.array(F)
def ellipsoid(c,r,n=18,rot=None):
    u=np.linspace(0,np.pi,n); v=np.linspace(0,2*np.pi,2*n,endpoint=False); U,Vv=np.meshgrid(u,v,indexing='ij')
    X=np.stack([np.sin(U)*np.cos(Vv)*r[0],np.cos(U)*r[1],np.sin(U)*np.sin(Vv)*r[2]],-1).reshape(-1,3)
    V=X+np.array(c); F=[]; m=2*n
    for i in range(n-1):
        for j in range(m): a=i*m+j; b=i*m+(j+1)%m; F+=[(a,a+m,b),(b,a+m,b+m)]
    return V,np.array(F)
