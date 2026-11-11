import sys,json,struct,numpy as np
def load(path):
    b=open(path,'rb').read()
    assert b[:4]==b'glTF'
    off=12;chunks=[]
    while off<len(b):
        n,t=struct.unpack('<I4s',b[off:off+8]);chunks.append((t,b[off+8:off+8+n]));off+=8+n
    j=json.loads(chunks[0][1]);bin_=chunks[1][1] if len(chunks)>1 else b''
    return j,bin_
CT={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'};NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,bin_,i):
    a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];o=bv.get('byteOffset',0)+a.get('byteOffset',0)
    dt=np.dtype('<'+CT[a['componentType']]);nc=NC[a['type']];st=bv.get('byteStride',0)
    if st and st!=dt.itemsize*nc:
        raw=np.frombuffer(bin_,dtype=np.uint8,count=st*(a['count']-1)+dt.itemsize*nc,offset=o)
        idx=(np.arange(a['count'])[:,None]*st+np.arange(dt.itemsize*nc)[None,:]).ravel()
        arr=np.frombuffer(raw[idx].tobytes(),dtype=dt).reshape(a['count'],nc)
    else: arr=np.frombuffer(bin_,dtype=dt,count=a['count']*nc,offset=o).reshape(a['count'],nc)
    return arr
def quat(q):
    x,y,z,w=q;return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def nodemat(n):
    if 'matrix' in n: return np.array(n['matrix'],float).reshape(4,4).T
    M=np.eye(4)
    S=np.diag(list(n.get('scale',[1,1,1]))+[1]);R=np.eye(4);R[:3,:3]=quat(n.get('rotation',[0,0,0,1]));T=np.eye(4);T[:3,3]=n.get('translation',[0,0,0])
    return T@R@S
def meshes(path):
    j,bin_=load(path);out=[]
    def rec(i,M):
        n=j['nodes'][i];W=M@nodemat(n)
        if 'mesh' in n:
            for p in j['meshes'][n['mesh']]['primitives']:
                P=acc(j,bin_,p['attributes']['POSITION']).astype(float)
                I=acc(j,bin_,p['indices']).ravel().astype(np.int64) if 'indices' in p else np.arange(len(P))
                Pw=P@W[:3,:3].T+W[:3,3]
                out.append((n.get('name','?'),Pw,I.reshape(-1,3)))
        for c in n.get('children',[]): rec(c,W)
    sc=j['scenes'][j.get('scene',0)]
    for r in sc['nodes']: rec(r,np.eye(4))
    return j,out
if __name__=='__main__':
    for p in sys.argv[1:]:
        j,ms=meshes(p);print(p,'ext',j.get('extensionsUsed'),'nodes',len(j['nodes']))
        for name,P,F in ms: print('  ',name,len(P),len(F),P.min(0).round(3),P.max(0).round(3))
