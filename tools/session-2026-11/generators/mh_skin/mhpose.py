"""Pose the MakeHuman body (CC0 mesh, skeleton and skin weights) into the app's stance before fitting."""
import sys,json,pickle,numpy as np
sys.path.insert(0,'.');import mhload
SW='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/skinwork';sys.path.insert(0,SW)
from fit import umeyama,unit
R='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/mh/src/makehuman/data/rigs/'
def rot_between(a,b):
    a=unit(a);b=unit(b);v=np.cross(a,b);c=a@b
    if np.linalg.norm(v)<1e-9:return np.eye(3)
    K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]);return np.eye(3)+K+K@K*(1/(1+c))
def pose(sex):
    V,G=mhload.load()
    g='male' if sex=='m' else 'female'
    for eth in('african','asian','caucasian'):mhload.target('macrodetails/%s-%s-young.target'%(eth,g),1/3,V)
    if sex=='f':
        for f in('max','min'):mhload.target('breast/female-young-averagemuscle-averageweight-averagecup-%sfirmness.target'%f,0.5,V)
    V=V/10.0
    sk=json.load(open(R+'default.mhskel'));W=json.load(open(R+'default_weights.mhw'))['weights']
    jp={k:V[v].mean(0) for k,v in sk['joints'].items()};bones=sk['bones']
    head={b:jp[d['head']] for b,d in bones.items()};tail={b:jp[d['tail']] for b,d in bones.items()}
    alm=pickle.load(open(SW+'/app_lm.pkl','rb'))
    # uniform scale + translation so MakeHuman's standing height matches the app skeleton (sole to eye)
    Jg={k[6:]:V[np.unique(np.concatenate(G[k]))].mean(0) for k in G if k.startswith('joint-')}
    body=np.unique(np.concatenate([np.array(f) for f in G['body']]))
    sole=V[body,1].min();eye=Jg['l-eye'][1]
    L=pickle.load(open(SW+'/app_%s.pkl'%('male' if sex=='m' else 'female'),'rb'));by={m['name']:m for m in L}
    aeye=by['za_sclera_1']['P'].mean(0)[1];asole=min(alm['heel_L'][1],alm['heel_R'][1])-0.03
    s=(aeye-asole)/(eye-sole);T=np.array([0,asole-s*sole,0.])
    V=V*s+T;head={b:p*s+T for b,p in head.items()};tail={b:p*s+T for b,p in tail.items()};Jg={k:p*s+T for k,p in Jg.items()}
    # target global rotations
    tgt={}
    for S,sd in (('L','L'),('R','R')):
        tgt['upperarm01.'+S]=rot_between(tail['upperarm02.'+S]-head['upperarm01.'+S],alm['elbow2_'+S]-alm['shoulder_'+S])
        tgt['lowerarm01.'+S]=rot_between(tail['lowerarm02.'+S]-head['lowerarm01.'+S],alm['wrist_'+S]-alm['elbow2_'+S])
        s_=S.lower();X=[];Y=[]
        for N,f in ((2,'index'),(3,'middle'),(4,'ring'),(5,'little')):
            for jj,a in ((1,'mcb'),(2,'mcp'),(3,'pip')):X.append(Jg['%s-finger-%d-%d'%(s_,N,jj)]);Y.append(alm['%s_%s_%s'%(a,f,S)])
        M,_=umeyama(np.array(X),np.array(Y));U_,_,Vt=np.linalg.svd(M);tgt['wrist.'+S]=U_@Vt
        tgt['upperleg01.'+S]=rot_between(tail['upperleg02.'+S]-head['upperleg01.'+S],alm['knee2_'+S]-alm['hip_'+S])
        tgt['lowerleg01.'+S]=rot_between(tail['lowerleg02.'+S]-head['lowerleg01.'+S],alm['ankle_'+S]-alm['knee2_'+S])
        X=np.array([Jg[s_+'-ankle'],Jg[s_+'-toe-1-1'],Jg[s_+'-toe-5-1']]);Y=np.array([alm['ankle_'+S],alm['mt1h_'+S],alm['mt5h_'+S]])
        M,_=umeyama(X,Y);U_,_,Vt=np.linalg.svd(M);tgt['foot.'+S]=U_@Vt
    # forward kinematics: each bone keeps its parent's global rotation unless it has a target
    order=[];seen=set()
    def visit(b):
        if b in seen:return
        p=bones[b]['parent']
        if p:visit(p)
        seen.add(b);order.append(b)
    for b in bones:visit(b)
    Gr={};Tr={}
    for b in order:
        p=bones[b]['parent'];Rp=Gr[p] if p else np.eye(3)
        Rb=tgt.get(b,tgt.get(b.replace('02.','01.'),None)) if b.replace('02.','01.') in tgt and b.startswith(('upperarm02','lowerarm02','upperleg02','lowerleg02')) else tgt.get(b,Rp)
        hp=(Gr[p]@(head[b]-head[p])+Tr[p]) if p else head[b]
        Gr[b]=Rb;Tr[b]=hp
    def xf(b,X):return (X-head[b])@Gr[b].T+Tr[b]
    n=len(V);acc=np.zeros((n,3));ws=np.zeros(n)
    for b,lst in W.items():
        if b not in bones:continue
        a=np.array(lst);idx=a[:,0].astype(int);w=a[:,1]
        acc[idx]+=w[:,None]*xf(b,V[idx]);ws[idx]+=w
    Vp=np.where(ws[:,None]>1e-6,acc/np.maximum(ws,1e-9)[:,None],V)
    # joints: move each joint with its nearest body vertex
    from scipy.spatial import cKDTree
    tr=cKDTree(V[body]);Jp={}
    for k,p in Jg.items():
        _,i=tr.query(p);v=body[i];Jp[k]=p+(Vp[v]-V[v])
    tri=[]
    for f in G['body']:
        tri.append([f[0],f[1],f[2]])
        if len(f)==4:tri.append([f[0],f[2],f[3]])
    tri=np.array(tri);used=np.unique(tri);remap=-np.ones(n,int);remap[used]=np.arange(len(used))
    EY={}
    for g_ in ('helper-l-eye','helper-r-eye'):
        fs=G[g_];tt=[]
        for f in fs:
            tt.append([f[0],f[1],f[2]])
            if len(f)==4:tt.append([f[0],f[2],f[3]])
        tt=np.array(tt);u=np.unique(tt);rm=-np.ones(n,int);rm[u]=np.arange(len(u));EY[g_]=(Vp[u],rm[tt])
    pickle.dump(EY,open('eyes_%s.pkl'%sex,'wb'))
    return Vp[used],remap[tri],Jp,s
if __name__=='__main__':
    sys.path.insert(0,SW);from rnd import render,sheet
    for sx in sys.argv[1:]:
        P,F,J,s=pose(sx);print(sx,'scale',round(s,3),'height',round(np.ptp(P[:,1]),3));pickle.dump((P,F,J),open('mhp_%s.pkl'%sx,'wb'))
        sheet([render([(P,F,(214,170,140))],view=v,H=700,bounds=(-0.5,0.5,0,1.8)) for v in('front','right')],'mhp_%s.png'%sx)
