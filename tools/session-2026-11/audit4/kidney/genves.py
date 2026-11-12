"""Generated (schematic) intrarenal vessels for the app kidneys: anterior and posterior divisions of the renal
artery, interlobar arteries and veins running between the scan-derived renal pyramids. Approximation only."""
import pickle,json,numpy as np
G=pickle.load(open('gen_in.pkl','rb'))
def tube(path,r0,r1,n=8):
    P=np.array(path,float)
    # resample with Catmull-Rom
    Q=[]
    pts=np.vstack([P[0],P,P[-1]])
    for i in range(len(P)-1):
        p0,p1,p2,p3=pts[i],pts[i+1],pts[i+2],pts[i+3]
        for t in np.linspace(0,1,7,endpoint=False):
            Q.append(0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t**3))
    Q.append(P[-1]);Q=np.array(Q);m=len(Q)
    T=np.gradient(Q,axis=0);T/=np.linalg.norm(T,axis=1)[:,None]+1e-12
    u=np.cross(T[0],[0,1,0]);
    if np.linalg.norm(u)<1e-3:u=np.cross(T[0],[1,0,0])
    u/=np.linalg.norm(u);V=[];F=[]
    for i in range(m):
        u=u-T[i]*(u@T[i]);u/=np.linalg.norm(u);w=np.cross(T[i],u);r=r0+(r1-r0)*i/(m-1)
        for k in range(n):
            a=2*np.pi*k/n;V.append(Q[i]+r*(np.cos(a)*u+np.sin(a)*w))
    for i in range(m-1):
        for k in range(n):
            a=i*n+k;b=i*n+(k+1)%n;c=a+n;d=b+n;F+=[[a,b,d],[a,d,c]]
    c0=len(V);V.append(Q[0]);c1=len(V);V.append(Q[-1])
    for k in range(n):F+=[[c0,(k+1)%n,k],[c1,(m-1)*n+k,(m-1)*n+(k+1)%n]]
    return np.array(V),np.array(F)
def add(D,name,V,F,col):
    d=D.setdefault(name,dict(v=[],f=[],c=col,rough=0.5));o=len(d['v']);d['v']+=np.round(V,5).tolist();d['f']+=(F+o).tolist()
OUT={};rep={}
for side,g in G.items():
    pyr=g['pyr'];pel=g['pelvis'];sg=g['sg'];kc=g['kid'].mean(0)
    pc=pel.mean(0)
    # apex = pyramid point nearest the pelvis centre (papilla), base = farthest part
    info=[]
    for P in pyr:
        d=np.linalg.norm(P-pc,axis=1);apex=P[d<np.percentile(d,4)].mean(0);base=P[d>np.percentile(d,90)].mean(0);info.append((apex,base,P.mean(0)))
    # hilum entry: where the main renal artery / vein meet the kidney
    ae=g['art_end'];ve=g['vein_end']
    front=pc+np.array([sg*0.004,0,0.009]);back=pc+np.array([sg*0.004,0,-0.009])
    # anterior and posterior divisions
    for nm,tgt,off in (('ant',front,0.0),('post',back,0.0)):
        V,F=tube([ae,(ae+tgt)/2+np.array([0,0.002,0.003 if nm=='ant' else -0.003]),tgt],0.0016,0.0013);add(OUT,'gv_segart_%s_%s'%(nm,side),V,F,[0.72,0.10,0.10])
    vfront=front+np.array([0,-0.003,0.002])
    V,F=tube([ve,(ve+vfront)/2+np.array([0,-0.002,0.003]),vfront],0.0020,0.0016);add(OUT,'gv_intrarenal_vein_'+side,V,F,[0.16,0.22,0.55])
    # interlobar vessels between neighbouring pyramids
    n=len(info);used=set();cnt=0
    for i in range(n):
        dj=sorted((np.linalg.norm(info[i][2]-info[j][2]),j) for j in range(n) if j!=i)[:2]
        for _,j in dj:
            key=(min(i,j),max(i,j))
            if key in used:continue
            used.add(key)
            a_mid=(info[i][0]+info[j][0])/2;b_mid=(info[i][1]+info[j][1])/2;c_mid=(info[i][2]+info[j][2])/2
            start=front if c_mid[2]>pc[2] else back
            path=[start,a_mid,c_mid,b_mid]
            V,F=tube(path,0.0010,0.0006);add(OUT,'gv_intrarenal_art_'+side,V,F,[0.72,0.10,0.10])
            # arcuate hint: short arc over the base of pyramid i
            V,F=tube([b_mid,(b_mid+info[i][1])/2+(info[i][1]-info[i][0])*0.08,info[i][1]],0.0006,0.0004);add(OUT,'gv_intrarenal_art_'+side,V,F,[0.72,0.10,0.10])
            o=np.array([0,-0.0016,0.0012]);V,F=tube([vfront,a_mid+o,c_mid+o,b_mid+o],0.0012,0.0007);add(OUT,'gv_intrarenal_vein_'+side,V,F,[0.16,0.22,0.55]);cnt+=1
    rep[side]=dict(pyramids=n,interlobar=cnt)
json.dump(OUT,open('gv.json','w'));print(rep,{k:len(v['v']) for k,v in OUT.items()})
