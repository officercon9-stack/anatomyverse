"""Load the MakeHuman 1.1 base mesh (CC0) and apply macro targets for a young adult male or female."""
import numpy as np,pickle,sys
D='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/mh/src/makehuman/data/'
def load():
    V=[];G={};cur=None
    for ln in open(D+'3dobjs/base.obj'):
        if ln.startswith('v '):V.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith('g '):cur=ln.split()[1]
        elif ln.startswith('f '):
            idx=[int(t.split('/')[0])-1 for t in ln.split()[1:]];G.setdefault(cur,[]).append(idx)
    return np.array(V),G
def target(name,w,V):
    for ln in open(D+'targets/'+name):
        if ln[0]=='#' or not ln.strip():continue
        p=ln.split();V[int(p[0])]+=w*np.array([float(p[1]),float(p[2]),float(p[3])])
def build(sex):
    V,G=load()
    g='male' if sex=='m' else 'female'
    for eth in('african','asian','caucasian'):target('macrodetails/%s-%s-young.target'%(eth,g),1/3,V)
    if sex=='f':
        for f in('max','min'):target('breast/female-young-averagemuscle-averageweight-averagecup-%sfirmness.target'%f,0.5,V)
    V=V/10.0   # decimetres -> metres
    J={k[6:]:V[np.unique(np.concatenate(G[k]))].mean(0) for k in G if k.startswith('joint-')}
    body=G['body'];tri=[]
    for f in body:
        tri.append([f[0],f[1],f[2]])
        if len(f)==4:tri.append([f[0],f[2],f[3]])
    tri=np.array(tri);used=np.unique(tri);remap=-np.ones(len(V),int);remap[used]=np.arange(len(used))
    return V[used],remap[tri],J,used
if __name__=='__main__':
    for s in sys.argv[1:]:
        P,F,J,used=build(s);print(s,P.shape,F.shape,'height',np.ptp(P[:,1]).round(3),'min',P.min(0).round(3),'max',P.max(0).round(3))
        for k in('l-shoulder','l-elbow','l-hand','l-upper-leg','l-knee','l-ankle','l-eye','head','neck','pelvis'):print('  ',k,J[k].round(3))
        pickle.dump((P,F,J),open('mh_%s.pkl'%s,'wb'))
