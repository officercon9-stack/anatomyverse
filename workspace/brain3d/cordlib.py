import numpy as np
OFF=np.array([0,1.655,-0.012])
QP=np.array([[0,1.535,-.035],[0,1.45,-.042],[0,1.3,-.085],[0,1.1,-.082],[0,.95,-.058],[0,.88,-.07]])
def _cr(p0,p1,p2,p3,w):
    d=lambda a,b:max(np.sum((a-b)**2)**0.25,0)
    dt1=d(p1,p2); dt0=d(p0,p1); dt2=d(p2,p3)
    if dt1<1e-4: dt1=1
    if dt0<1e-4: dt0=dt1
    if dt2<1e-4: dt2=dt1
    out=[]
    for k in range(3):
        x0,x1,x2,x3=p0[k],p1[k],p2[k],p3[k]
        t1=(x1-x0)/dt0-(x2-x0)/(dt0+dt1)+(x2-x1)/dt1; t2=(x2-x1)/dt1-(x3-x1)/(dt1+dt2)+(x3-x2)/dt2
        t1*=dt1; t2*=dt1
        c2=-3*x1+3*x2-2*t1-t2; c3=2*x1-2*x2+t1+t2
        out.append(x1+t1*w+c2*w*w+c3*w**3)
    return np.array(out)
def Qpt(t):
    P=QP; l=len(P); p=(l-1)*t; i=int(np.floor(p)); w=p-i
    if w==0 and i==l-1: i=l-2; w=1
    p0=P[i-1] if i>0 else 2*P[0]-P[1]
    p3=P[i+2] if i+2<l else 2*P[-1]-P[-2]
    return _cr(p0,P[i],P[i+1],p3,w)
def cord(t0=0,t1=0.76,step=0.01):
    ts=np.arange(t0,t1+1e-9,step); return np.array([Qpt(t)+np.array([0,0,-.005]) for t in ts])
if __name__=='__main__':
    c=cord(); print(c[0].round(3),c[-1].round(3),len(c))
    print(Qpt(0.93)+np.array([0,0,-.005]))
