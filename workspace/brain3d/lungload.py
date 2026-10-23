import zipfile,re,collections,numpy as np,io
z=zipfile.ZipFile('/mnt/user-data/uploads/partof_BP3D_4_0_obj_99.zip'); have={re.search(r'(FJ\d+)',n).group(1):n for n in z.namelist() if n.endswith('.obj')}
A='/mnt/user-data/attachments/dd792833-738b-5c46-b41e-551b8a6a99c0/653785c3-attachment.txt'
D=collections.defaultdict(set); NM={}
for l in open(A,encoding='utf8',errors='ignore'):
    p=l.rstrip('\n').split('\t')
    if len(p)==3 and p[0].startswith('FMA'): D[p[0]].add(p[2]); NM[p[0]]=p[1]
def obj(fj):
    V=[];F=[]
    for l in z.read(have[fj]).decode().splitlines():
        if l.startswith('v '): V.append([float(t) for t in l.split()[1:4]])
        elif l.startswith('f '): 
            ids=[int(t.split('/')[0])-1 for t in l.split()[1:]]
            for i in range(1,len(ids)-1): F.append([ids[0],ids[i],ids[i+1]])
    V=np.array(V); return np.column_stack([V[:,0],V[:,2],-V[:,1]]),np.array(F)   # T coords, mm
def concept(fma,exclude=()):
    Vs=[];Fs=[];n=0
    for fj in sorted(D[fma]):
        if fj in exclude or fj not in have: continue
        V,F=obj(fj); Fs.append(F+n); Vs.append(V); n+=len(V)
    return np.vstack(Vs),np.vstack(Fs)
