import numpy as np,json,struct,base64
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def tube(P,radius,sides=6):
    P=np.asarray(P,float); n=len(P)
    if n<2: return np.zeros((0,3)),np.zeros((0,3),int)
    r=np.broadcast_to(np.asarray(radius,float),(n,)) if np.ndim(radius)==0 else np.interp(np.linspace(0,1,n),np.linspace(0,1,len(radius)),radius)
    t=np.gradient(P,axis=0); ln=np.linalg.norm(t,axis=1); t=t/np.where(ln[:,None]<1e-12,1,ln[:,None])
    ref=np.array([0,1,0.0]) if abs(t[0]@np.array([0,1,0.0]))<0.9 else np.array([1,0,0.0])
    u=np.cross(t[0],ref); u/=np.linalg.norm(u); V=[]
    for i in range(n):
        if i>0:
            u=u-t[i]*(u@t[i]); nn=np.linalg.norm(u)
            if nn<1e-9: u=np.cross(t[i],ref)
            u/=np.linalg.norm(u)
        w=np.cross(t[i],u)
        for k in range(sides):
            a=2*np.pi*k/sides; V.append(P[i]+r[i]*(np.cos(a)*u+np.sin(a)*w))
    V=np.array(V); F=[]
    for i in range(n-1):
        for k in range(sides):
            a=i*sides+k; b=i*sides+(k+1)%sides; c=a+sides; d=b+sides
            F+= [(a,b,c),(b,d,c)]
    return V,np.array(F,int)
def merge(meshes):
    V=[];F=[];o=0
    for v,f in meshes:
        if len(v)==0: continue
        V.append(v);F.append(f+o);o+=len(v)
    return (np.vstack(V),np.vstack(F)) if V else (np.zeros((0,3)),np.zeros((0,3),int))
def write_glb(nodes,path_glb,path_json,generator='AnatomyVerse vessel builder'):
    """nodes: list of dict(name,V,F,color(0xRRGGBB),alpha=1,rough=.55,emissive=None)"""
    bin_=bytearray(); bviews=[];accs=[];meshes=[];nds=[];mats=[]
    def pad():
        while len(bin_)%4: bin_.append(0)
    for nd in nodes:
        V=nd['V'].astype(np.float32); F=nd['F']
        used=np.unique(F); remap=np.full(len(V),-1,dtype=np.int64); remap[used]=np.arange(len(used))
        P=V[used]; Fi=remap[F]; it=np.uint16 if len(P)<65535 else np.uint32; I=Fi.astype(it).reshape(-1)
        pad(); o=len(bin_); bin_+=P.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=P.nbytes,target=34962))
        accs.append(dict(bufferView=len(bviews)-1,componentType=5126,count=len(P),type='VEC3',min=P.min(0).tolist(),max=P.max(0).tolist())); pa=len(accs)-1
        attrs=dict(POSITION=pa)
        if nd.get('smooth'):
            import trimesh
            Nf=np.asarray(trimesh.Trimesh(P.astype(float),Fi,process=False).vertex_normals,dtype=np.float32)
            Nn=np.zeros((len(Nf),4),np.int8); Nn[:,:3]=np.clip(np.round(Nf*127),-127,127).astype(np.int8)
            pad(); o=len(bin_); bin_+=Nn.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=Nn.nbytes,byteStride=4,target=34962))
            accs.append(dict(bufferView=len(bviews)-1,componentType=5120,normalized=True,count=len(Nf),type='VEC3')); attrs['NORMAL']=len(accs)-1
        pad(); o=len(bin_); bin_+=I.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=I.nbytes,target=34963))
        accs.append(dict(bufferView=len(bviews)-1,componentType=5123 if it==np.uint16 else 5125,count=len(I),type='SCALAR')); ia=len(accs)-1
        c=nd['color']; a=nd.get('alpha',1.0)
        m=dict(name=nd['name'],pbrMetallicRoughness=dict(baseColorFactor=[round(lin((c>>16)&255),5),round(lin((c>>8)&255),5),round(lin(c&255),5),a],metallicFactor=0.0,roughnessFactor=nd.get('rough',0.55)),doubleSided=True)
        if a<1: m['alphaMode']='BLEND'
        mats.append(m)
        meshes.append(dict(name=nd['name'],primitives=[dict(attributes=attrs,indices=ia,material=len(mats)-1,mode=4)]))
        nds.append(dict(name=nd['name'],mesh=len(meshes)-1))
    pad()
    gltf=dict(asset=dict(version='2.0',generator=generator),scene=0,scenes=[dict(nodes=list(range(len(nds))))],nodes=nds,meshes=meshes,materials=mats,accessors=accs,bufferViews=bviews,buffers=[dict(byteLength=len(bin_))])
    js=json.dumps(gltf,separators=(',',':')).encode()
    while len(js)%4: js+=b' '
    glb=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(bin_))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(bin_))+b'BIN\x00'+bytes(bin_)
    open(path_glb,'wb').write(glb)
    wrap={"format":"glb-base64","license":"CC BY-SA 2.1 Japan - BodyParts3D (schematic parts generated for AnatomyVerse)","attribution":"BodyParts3D, (c) The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Arteries re-centred from BodyParts3D; veins, sinuses, capillaries and CSF spaces are schematic additions by AnatomyVerse.","glb":base64.b64encode(glb).decode()}
    open(path_json,'w').write(json.dumps(wrap))
    return len(glb),len(json.dumps(wrap))
