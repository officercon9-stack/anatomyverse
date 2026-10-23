import numpy as np,json,struct,sys
sys.path.insert(0,'.')
from conv import out
KEEP=[k for k in out if k not in ('viscerocranium','mandible','skull_other')]
# axis map: three = (x, z, -y), re-centred on whole-brain centroid
allv=np.vstack([out[k][0] for k in KEEP if out[k][2]['group']!='Skull'])
def T(v): return np.column_stack([v[:,0],v[:,2],-v[:,1]])
C=T(allv).mean(0)
bin_=bytearray(); bviews=[];accs=[];meshes=[];nodes=[];meta=[]
def pad(): 
    while len(bin_)%4: bin_.append(0)
for k in KEEP:
    V,F,p=out[k]
    P=(T(V)-C).astype(np.float32)
    # drop unused verts
    used=np.unique(F); remap=np.full(len(V),-1,dtype=np.int64); remap[used]=np.arange(len(used))
    P=P[used]; F=remap[F]
    idx_t=np.uint16 if len(P)<65535 else np.uint32
    I=F.astype(idx_t).reshape(-1)
    pad(); o=len(bin_); bin_+=P.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=P.nbytes,target=34962))
    accs.append(dict(bufferView=len(bviews)-1,componentType=5126,count=len(P),type='VEC3',min=P.min(0).tolist(),max=P.max(0).tolist()))
    pa=len(accs)-1
    pad(); o=len(bin_); bin_+=I.tobytes(); bviews.append(dict(buffer=0,byteOffset=o,byteLength=I.nbytes,target=34963))
    accs.append(dict(bufferView=len(bviews)-1,componentType=5123 if idx_t==np.uint16 else 5125,count=len(I),type='SCALAR'))
    ia=len(accs)-1
    meshes.append(dict(name=k,primitives=[dict(attributes=dict(POSITION=pa),indices=ia,mode=4)]))
    nodes.append(dict(name=k,mesh=len(meshes)-1))
    cen=P.mean(0); meta.append(dict(id=k,label=p['label'],group=p['group'],side=p['side'],centroid=[round(float(x),1) for x in cen],bbox=[[round(float(x),1) for x in P.min(0)],[round(float(x),1) for x in P.max(0)]],verts=len(P),tris=len(F)))
pad()
gltf=dict(asset=dict(version='2.0',generator='AnatomyVerse brain builder',copyright='BodyParts3D, (c) The Database Center for Life Science, CC Attribution-Share Alike 2.1 Japan'),scene=0,scenes=[dict(nodes=list(range(len(nodes))))],nodes=nodes,meshes=meshes,accessors=accs,bufferViews=bviews,buffers=[dict(byteLength=len(bin_))])
js=json.dumps(gltf,separators=(',',':')).encode()
while len(js)%4: js+=b' '
glb=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(bin_))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(bin_))+b'BIN\x00'+bytes(bin_)
open('brain-skull.glb','wb').write(glb)
json.dump(meta,open('parts-meta.json','w'),indent=1)
print('glb MB',len(glb)/1e6,'parts',len(meta),'verts',sum(m['verts'] for m in meta),'tris',sum(m['tris'] for m in meta))
for m in meta: print(m['id'],m['centroid'],m['bbox'][1][1]-m['bbox'][0][1])
