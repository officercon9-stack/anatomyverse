import zipfile,numpy as np,json,struct,sys
sys.path.insert(0,'.')
from build_parts import parts
z=zipfile.ZipFile('/mnt/user-data/uploads/partof_BP3D_4_0_obj_99.zip')
def load(el):
    t=z.read(f'partof_BP3D_4.0_obj_99/{el}.obj').decode('latin1').splitlines()
    v=np.array([[float(x) for x in l.split()[1:4]] for l in t if l.startswith('v ')],dtype=np.float64)
    f=[]
    for l in t:
        if l.startswith('f '):
            idx=[int(p.split('/')[0]) for p in l.split()[1:]]
            for k in range(1,len(idx)-1): f.append((idx[0]-1,idx[k]-1,idx[k+1]-1))
    return v,np.array(f,dtype=np.uint32)
out={}
for p in parts:
    if not p['elements']: continue
    V=[];F=[];off=0
    for e in p['elements']:
        v,f=load(e); V.append(v);F.append(f+off);off+=len(v)
    V=np.vstack(V);F=np.vstack(F)
    out[p['id']]=(V,F,p)
if __name__=='__main__':
    allv=np.vstack([out[k][0] for k in out if out[k][2]['group']!='Skull'])
    print('brain bbox min',allv.min(0).round(1),'max',allv.max(0).round(1))
    for k in ['frontal_r','frontal_l','occipital_r','cerebellum','neurocranium','pituitary','spinal']:
        V=out[k][0]; print(k,'centroid',V.mean(0).round(1),'verts',len(V),'faces',len(out[k][1]))
    print('total verts',sum(len(o[0]) for o in out.values()),'faces',sum(len(o[1]) for o in out.values()))
