"""Original (own-work) simplified inner ear for AnatomyVerse: cochlea spiral, vestibule + 3 semicircular canals, VIII nerve and branches."""
import numpy as np, json
def frame(d):
    d=d/np.linalg.norm(d); a=np.array([0,1,0.]) if abs(d[1])<0.9 else np.array([1,0,0.])
    u=np.cross(d,a); u/=np.linalg.norm(u); v=np.cross(d,u); return u,v
def sweep(path,radii,seg=14):
    path=np.asarray(path,float); n=len(path); pos=[]; 
    t=np.gradient(path,axis=0); 
    for i in range(n):
        u,v=frame(t[i]); r=radii[i] if hasattr(radii,'__len__') else radii
        for k in range(seg):
            th=2*np.pi*k/seg; pos.append(path[i]+r*(np.cos(th)*u+np.sin(th)*v))
    idx=[]
    for i in range(n-1):
        for k in range(seg):
            a=i*seg+k; b=i*seg+(k+1)%seg; c=(i+1)*seg+k; d=(i+1)*seg+(k+1)%seg
            idx+= [a,c,b,b,c,d]
    # end caps
    for end,ring in ((0,0),(1,n-1)):
        c=len(pos); pos.append(path[0] if end==0 else path[-1])
        for k in range(seg):
            a=ring*seg+k; b=ring*seg+(k+1)%seg
            idx+= [c,a,b] if end==0 else [c,b,a]
    return np.array(pos),np.array(idx)
def ellipsoid(c,r,nu=20,nv=14):
    pos=[];idx=[]
    for j in range(nv+1):
        ph=np.pi*j/nv
        for i in range(nu):
            th=2*np.pi*i/nu; pos.append([c[0]+r[0]*np.sin(ph)*np.cos(th),c[1]+r[1]*np.cos(ph),c[2]+r[2]*np.sin(ph)*np.sin(th)])
    for j in range(nv):
        for i in range(nu):
            a=j*nu+i;b=j*nu+(i+1)%nu;c2=(j+1)*nu+i;d=(j+1)*nu+(i+1)%nu; idx+=[a,b,c2,b,d,c2]
    return np.array(pos),np.array(idx)
def merge(parts):
    P=[];I=[];o=0
    for p,i in parts: P.append(p);I.append(i+o);o+=len(p)
    return np.vstack(P),np.concatenate(I)
def catmull(pts,n=14):
    pts=np.asarray(pts,float); P=np.vstack([2*pts[0]-pts[1],pts,2*pts[-1]-pts[-2]]); out=[]
    for i in range(1,len(P)-2):
        for s in np.linspace(0,1,n,endpoint=False):
            p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
            out.append(0.5*((2*p1)+(-p0+p2)*s+(2*p0-5*p1+4*p2-p3)*s*s+(-p0+3*p1-3*p2+p3)*s**3))
    out.append(pts[-1]); return np.array(out)
def side(x):  # x=+1 left, -1 right (mirror)
    m=np.array([x,1,1.])
    # cochlea: spiral, 2.75 turns around axis pointing anterolaterally-down; centred at (0.0395,1.5801,0)
    cen=np.array([0.0395,1.5801,0.0000]); ax=np.array([0.55,-0.3,0.78]); ax/=np.linalg.norm(ax); u,v=frame(ax)
    T=2.75; N=int(T*28); tt=np.linspace(0,T,N); 
    r=0.0028*(1-0.62*tt/T); h=0.0032*(tt/T)-0.0016
    path=np.array([cen+r[i]*(np.cos(2*np.pi*tt[i])*u+np.sin(2*np.pi*tt[i])*v)+h[i]*ax for i in range(N)])
    coch=sweep(path,np.linspace(0.00115,0.0005,N),12)
    # vestibule
    vc=np.array([0.0405,1.5835,-0.0078]); ves=ellipsoid(vc,(0.0021,0.0021,0.0030))
    # semicircular canals: three loops of radius ~3.6 mm, tube r 0.55 mm
    def loop(center,n1,n2,R=0.0036,arc=1.5*np.pi,start=-0.25*np.pi):
        ts=np.linspace(start,start+arc,34); return np.array([center+R*(np.cos(t)*n1+np.sin(t)*n2) for t in ts])
    up=np.array([0,1,0.]);
    a_n1=np.array([0.7,0,0.7]); a_n1/=np.linalg.norm(a_n1)   # anterior canal plane
    p_n1=np.array([0.7,0,-0.7]); p_n1/=np.linalg.norm(p_n1) # posterior canal plane
    l_n1=np.array([0.7,0,-0.7]); l_n1/=np.linalg.norm(l_n1); l_n2=np.array([0.7,0,0.7]); l_n2/=np.linalg.norm(l_n2)
    ant=loop(vc+np.array([-0.0005,0.0030,-0.0004]),a_n1,up,0.0033,1.55*np.pi,-0.28*np.pi)
    post=loop(vc+np.array([-0.0003,0.0018,-0.0036]),p_n1,up,0.0033,1.55*np.pi,-0.28*np.pi)
    lat=loop(vc+np.array([0.0006,0.0012,-0.0030]),l_n1,l_n2,0.0027,1.55*np.pi,-0.3*np.pi)
    canals=merge([sweep(ant,0.00055,10),sweep(post,0.00055,10),sweep(lat,0.00055,10)])
    vest=merge([ves,canals])
    # nerves
    trunk=sweep(catmull([[0.0072,1.5768,-0.0158],[0.0120,1.5778,-0.0120],[0.0170,1.5788,-0.0095],[0.0215,1.5798,-0.0078]],8),0.0010,10)
    cn=sweep(catmull([[0.0215,1.5798,-0.0078],[0.0280,1.5800,-0.0050],[0.0340,1.5800,-0.0020],[0.0385,1.5801,0.0000]],8),0.0006,8)
    vn=sweep(catmull([[0.0215,1.5798,-0.0078],[0.0280,1.5815,-0.0085],[0.0340,1.5828,-0.0080],[0.0390,1.5835,-0.0078]],8),0.0006,8)
    out={}
    for nm,(p,i) in {'cochlea':coch,'vestibule':vest,'vc_nerve':trunk,'cochlear_nerve':cn,'vestibular_nerve':vn}.items():
        p=p*m
        i=i.copy()
        if x<0: i=i.reshape(-1,3)[:,[0,2,1]].reshape(-1)
        out[nm]=(p,i)
    return out
res=[]
cols={'cochlea':'#e3c9b6','vestibule':'#dcc3ad','vc_nerve':'#e8d77a','cochlear_nerve':'#e8d77a','vestibular_nerve':'#e8d77a'}
for s,sn in ((1,'l'),(-1,'r')):
    for nm,(p,i) in side(s).items():
        res.append({'name':f'za_{nm}_{sn}','pos':[float(v) for v in p.reshape(-1)],'idx':[int(v) for v in i],'color':cols[nm]})
json.dump(res,open('inner_raw.json','w'))
print([(r['name'],len(r['pos'])//3,len(r['idx'])//3) for r in res])
