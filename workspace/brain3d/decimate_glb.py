import json,base64,struct,sys,numpy as np,fast_simplification
def load(path):
    w=json.load(open(path)); g=base64.b64decode(w['glb']); n=struct.unpack('<I',g[12:16])[0]; js=json.loads(g[20:20+n])
    bo=20+n+8; bin_=g[bo:]; return w,js,bin_
def acc_data(js,bin_,ai,dt):
    a=js['accessors'][ai]; bv=js['bufferViews'][a['bufferView']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    nc={'SCALAR':1,'VEC3':3}[a['type']]; return np.frombuffer(bin_,dtype=dt,count=a['count']*nc,offset=off).reshape(-1,nc) if nc>1 else np.frombuffer(bin_,dtype=dt,count=a['count'],offset=off)
def slim(src,dst,rule):
    w,js,bin_=load(src); out=bytearray(); bvs=[];accs=[]
    def pad():
        while len(out)%4: out.append(0)
    for me in js['meshes']:
        for p in me['primitives']:
            pa=p['attributes']['POSITION']; P=acc_data(js,bin_,pa,np.float32).astype(np.float32)
            ia=p['indices']; it=np.uint16 if js['accessors'][ia]['componentType']==5123 else np.uint32
            I=acc_data(js,bin_,ia,it).astype(np.int32).reshape(-1,3)
            tgt=rule(me['name'],len(I))
            if tgt<len(I):
                V2,F2=fast_simplification.simplify(P,I,target_reduction=1-tgt/len(I)); P=np.asarray(V2,np.float32); I=np.asarray(F2,np.int32)
            it2=np.uint16 if len(P)<65535 else np.uint32; Ib=I.astype(it2).reshape(-1)
            pad(); o=len(out); out+=P.tobytes(); bvs.append(dict(buffer=0,byteOffset=o,byteLength=P.nbytes,target=34962))
            accs.append(dict(bufferView=len(bvs)-1,componentType=5126,count=len(P),type='VEC3',min=P.min(0).tolist(),max=P.max(0).tolist())); p['attributes']={'POSITION':len(accs)-1}
            pad(); o=len(out); out+=Ib.tobytes(); bvs.append(dict(buffer=0,byteOffset=o,byteLength=Ib.nbytes,target=34963))
            accs.append(dict(bufferView=len(bvs)-1,componentType=5123 if it2==np.uint16 else 5125,count=len(Ib),type='SCALAR')); p['indices']=len(accs)-1
    pad(); js['accessors']=accs; js['bufferViews']=bvs; js['buffers']=[dict(byteLength=len(out))]
    j=json.dumps(js,separators=(',',':')).encode()
    while len(j)%4: j+=b' '
    glb=b'glTF'+struct.pack('<II',2,12+8+len(j)+8+len(out))+struct.pack('<I',len(j))+b'JSON'+j+struct.pack('<I',len(out))+b'BIN\x00'+bytes(out)
    w['glb']=base64.b64encode(glb).decode(); json.dump(w,open(dst,'w')); 
    import os; print(src.split('/')[-1],os.path.getsize(src)//1000,'->',os.path.getsize(dst)//1000,'KB')
M='/home/claude/av-build/models/'
slim(M+'bodyparts3d-brain-only.glb.json','slim/bodyparts3d-brain-only.glb.json',lambda n,t:max(300,int(t*0.30)))
def lr(n,t):
    if n=='alveoli': return 30000
    return max(400,int(t*0.45))
slim(M+'bodyparts3d-lungs.glb.json','slim/bodyparts3d-lungs.glb.json',lr)
