import re,collections,zipfile,json,sys
A='/mnt/user-data/attachments/dd792833-738b-5c46-b41e-551b8a6a99c0/'
em=collections.defaultdict(set); nm={}
for l in open(A+'653785c3-attachment.txt').read().splitlines()[1:]:
    c,n,e=l.split('\t'); em[c].add(e); nm[c]=n
byname=collections.defaultdict(list)
for c,n in nm.items(): byname[n].append(c)
def U(*names):
    s=set()
    for n in names:
        if n not in byname: print('MISSING concept:',n,file=sys.stderr)
        for c in byname.get(n,[]): s|=em[c]
    return s
# (id, label, group, side, concept names) in claim priority order
SPEC=[
 ('hippocampus_r','Hippocampus (right)','Deep structures','right',['right hippocampus']),
 ('hippocampus_l','Hippocampus (left)','Deep structures','left',['left hippocampus']),
 ('pituitary','Pituitary gland','Deep structures','mid',['pituitary gland']),
 ('hypothalamus','Hypothalamus','Deep structures','mid',['hypothalamus']),
 ('lat_vent_r','Lateral ventricle (right)','Ventricles','right',['right lateral ventricle']),
 ('lat_vent_l','Lateral ventricle (left)','Ventricles','left',['left lateral ventricle']),
 ('third_vent','Third ventricle','Ventricles','mid',['third ventricle']),
 ('fourth_vent','Fourth ventricle','Ventricles','mid',['fourth ventricle']),
 ('aqueduct','Cerebral aqueduct','Ventricles','mid',['cerebral aqueduct']),
 ('cerebellum','Cerebellum','Hindbrain','mid',['cerebellum']),
 ('midbrain','Midbrain','Brainstem','mid',['midbrain']),
 ('pons','Pons','Brainstem','mid',['pons']),
 ('medulla','Medulla oblongata','Brainstem','mid',['medulla oblongata']),
 ('frontal_r','Frontal lobe (right)','Cerebrum','right',['right frontal lobe']),
 ('frontal_l','Frontal lobe (left)','Cerebrum','left',['left frontal lobe']),
 ('parietal_r','Parietal lobe (right)','Cerebrum','right',['right parietal lobe']),
 ('parietal_l','Parietal lobe (left)','Cerebrum','left',['left parietal lobe']),
 ('temporal_r','Temporal lobe (right)','Cerebrum','right',['right temporal lobe']),
 ('temporal_l','Temporal lobe (left)','Cerebrum','left',['left temporal lobe']),
 ('occipital_r','Occipital lobe (right)','Cerebrum','right',['right occipital lobe']),
 ('occipital_l','Occipital lobe (left)','Cerebrum','left',['left occipital lobe']),
 ('insula_r','Insula (right)','Cerebrum','right',['right insula']),
 ('insula_l','Insula (left)','Cerebrum','left',['left insula']),
 ('deep_r','Deep cerebral structures (right)','Deep structures','right',['right cerebral hemisphere']),
 ('deep_l','Deep cerebral structures (left)','Deep structures','left',['left cerebral hemisphere']),
 ('brain_other','Other brain parts','Deep structures','mid',['brain']),
 ('circle','Cerebral arterial circle','Blood vessels','mid',['cerebral arterial circle']),
 ('spinal','Spinal cord (upper)','Brainstem','mid',['spinal cord']),
 ('neurocranium','Neurocranium (skull vault and base)','Skull','mid',['neurocranium']),
 ('viscerocranium','Facial skeleton (viscerocranium)','Skull','mid',['viscerocranium']),
 ('mandible','Mandible','Skull','mid',['mandible']),
 ('skull_other','Other skull parts','Skull','mid',['skull']),
]
claimed=set(); parts=[]
for pid,label,group,side,names in SPEC:
    els=sorted(U(*names)-claimed)
    claimed|=set(els)
    parts.append(dict(id=pid,label=label,group=group,side=side,elements=els))
if __name__=='__main__':
    z=zipfile.ZipFile('/mnt/user-data/uploads/partof_BP3D_4_0_obj_99.zip')
    size={n.split('/')[-1][:-4]:z.getinfo(n).file_size for n in z.namelist() if n.endswith('.obj')}
    for p in parts: print(f"{p['id']:15s} {len(p['elements']):3d} elems {sum(size.get(e,0) for e in p['elements'])/1e3:7.0f} KB  missing:{[e for e in p['elements'] if e not in size]}")
