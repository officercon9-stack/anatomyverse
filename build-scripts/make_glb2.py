import numpy as np,json,struct,sys,base64
sys.path.insert(0,'.')
from conv import out
COL={'frontal':0x5B8DEF,'parietal':0x4FC48A,'temporal':0xF2A93B,'occipital':0xA56BE0,'insula':0x2CC3C3,'cerebellum':0xD9B38C,'midbrain':0xE07A5F,'pons':0xE8967A,'medulla':0xF0B1A0,'spinal':0xF4D6A0,'hippocampus':0xE86AA6,'pituitary':0xFF8A3D,'hypothalamus':0xFFB454,'lat_vent':0x3FD0FF,'third_vent':0x3FD0FF,'fourth_vent':0x3FD0FF,'aqueduct':0x3FD0FF,'circle':0xE5384F,'deep':0xC9CFD9,'brain_other':0x9AA7B8,'neurocranium':0xE8DFCB}
def colfor(k):
    for p,c in COL.items():
        if k.startswith(p): return c
    return 0xBBBBBB
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
KEEP=[k for k in out if k not in ('viscerocranium','mandible','skull_other')]
allv=np.vstack([out[k][0] for k in KEEP if out[k][2]['group']!='Skull'])
def T(v): return np.column_stack([v[:,0],v[:,2],-v[:,1]])
C=T(allv).mean(0)
SCALE=0.001   # mm -> metres (the app works in metres)
bin_=bytearray(); bviews=[];accs=[];meshes=[];nodes=[];mats=[]
def pad():
    while len(bin_)%4: bin_.append(0)
for k in KEEP:
    V,F,p=out[k]
    P=((T(V)-C)*SCALE).astype(np.float32)
    used=np.unique(F); remap=np.full(len(V),-1,dtype=np.int64); remap[used]=np.arange(len(used))
    P=P[used]; F=remap[F]
    it=np.uint16 if len(P)<65535 else np.uint32
    I=F.astype(it).reshape(-1)
    pad(); o=len(bin_); bin_+=P.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=P.nbytes,target=34962))
    accs.append(dict(bufferView=len(bviews)-1,componentType=5126,count=len(P),type='VEC3',min=P.min(0).tolist(),max=P.max(0).tolist())); pa=len(accs)-1
    pad(); o=len(bin_); bin_+=I.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=I.nbytes,target=34963))
    accs.append(dict(bufferView=len(bviews)-1,componentType=5123 if it==np.uint16 else 5125,count=len(I),type='SCALAR')); ia=len(accs)-1
    c=colfor(k); a=0.16 if k=='neurocranium' else 1.0
    m=dict(name=k,pbrMetallicRoughness=dict(baseColorFactor=[round(lin((c>>16)&255),5),round(lin((c>>8)&255),5),round(lin(c&255),5),a],metallicFactor=0.0,roughnessFactor=0.6),doubleSided=True)
    if a<1: m['alphaMode']='BLEND'
    mats.append(m)
    meshes.append(dict(name=k,primitives=[dict(attributes=dict(POSITION=pa),indices=ia,material=len(mats)-1,mode=4)]))
    nodes.append(dict(name=k,mesh=len(meshes)-1))
pad()
gltf=dict(asset=dict(version='2.0',generator='AnatomyVerse brain builder',copyright='BodyParts3D, (c) The Database Center for Life Science, CC Attribution-Share Alike 2.1 Japan'),scene=0,scenes=[dict(nodes=list(range(len(nodes))))],nodes=nodes,meshes=meshes,materials=mats,accessors=accs,bufferViews=bviews,buffers=[dict(byteLength=len(bin_))])
js=json.dumps(gltf,separators=(',',':')).encode()
while len(js)%4: js+=b' '
glb=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(bin_))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(bin_))+b'BIN\x00'+bytes(bin_)
open('brain-skull-v2.glb','wb').write(glb)
wrap={"format":"glb-base64","license":"CC BY-SA 2.1 Japan - BodyParts3D","attribution":"BodyParts3D, (c) The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Meshes merged into named structures, re-centred and re-oriented for AnatomyVerse.","glb":base64.b64encode(glb).decode()}
open('bodyparts3d-brain-skull.glb.json','w').write(json.dumps(wrap))
print('glb',len(glb)/1e6,'MB; json',len(json.dumps(wrap))/1e6,'MB; nodes',[n['name'] for n in nodes])
