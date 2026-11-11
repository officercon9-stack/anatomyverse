import sys,pickle,numpy as np
sys.path.insert(0,'.')
from glbinfo import load,acc,nodemat
def united(path,want):
    j,b=load(path);out={}
    def rec(i,M,anc):
        n=j['nodes'][i];W=M@nodemat(n);nm=n.get('name','?')
        if 'mesh' in n and want(nm,anc):
            Ps=[];Fs=[];off=0
            for p in j['meshes'][n['mesh']]['primitives']:
                P=acc(j,b,p['attributes']['POSITION']).astype(float);I=acc(j,b,p['indices']).ravel().astype(np.int64).reshape(-1,3)
                Ps.append(P@W[:3,:3].T+W[:3,3]);Fs.append(I+off);off+=len(P)
            out[nm]=(np.vstack(Ps),np.vstack(Fs))
        for c in n.get('children',[]): rec(c,W,anc+[nm])
    for r in j['scenes'][j.get('scene',0)]['nodes']: rec(r,np.eye(4),[])
    return out
if __name__=='__main__':
    import re
    for sex,p in (('m','vh/m_united_dir/3d-vh-m-united.glb'),('f','vh/f_united_dir/3d-vh-f-united.glb')):
        U=united(p,lambda nm,anc: True)
        pickle.dump(U,open('vh/united_%s.pkl'%sex,'wb'))
        print(sex,len(U))
        pat=re.compile(r'skin|skelet|pelvis|sacrum|pubis|ilium|ischium|femur_[LR]$|tibia|patella_|vertebra_(1|7|12|5)$|eye|lung|heart$|liver$|kidney_[LR]$|larynx|trachea|bladder|muscul|deltoid|gluteus|trapezius|bicep|quadric',re.I)
        for k,(P,F) in U.items():
            if pat.search(k) and len(P)>200: print('  ',k,len(P),P.min(0).round(3),P.max(0).round(3))
