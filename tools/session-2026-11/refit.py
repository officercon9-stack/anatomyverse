import json
J=json.load(open('/tmp/jx/joints.json'))
T0=['acetabular-labrum','transverse-acetabular-ligament','obturator-membrane','anterior-sacro-iliac-ligament','posterior-sacro-iliac-ligament','sacrotuberous-ligament','interpubic-disc','glenoid-labrum','middle-glenohumeral-ligament','inferior-glenohumeral-ligament','glenohumeral-joint-capsule','acromioclavicular-joint-capsule','sternoclavicular-joint-capsule']
KN=['medial-meniscus','lateral-meniscus','transverse-ligament-of-knee','meniscotibial-ligaments','deep-medial-collateral-ligament','arcuate-popliteal-ligament','oblique-popliteal-ligament','popliteofibular-ligament','knee-joint-capsule','infrapatellar-fat-pad']
TF=['anterior-tibiofibular-ligament','posterior-tibiofibular-ligament','superior-tibiofibular-joint-capsule']
FT=['tibionavicular-ligament','talocalcaneal-interosseous-ligament','dorsal-tarsometatarsal-ligaments','plantar-tarsometatarsal-ligaments','metatarsophalangeal-joint-capsules','collateral-metatarsophalangeal-ligaments','plantar-metatarsophalangeal-ligaments','proximal-interphalangeal-joint-capsules-foot','distal-interphalangeal-joint-capsules-foot','great-toe-interphalangeal-joint-capsule','collateral-interphalangeal-ligaments-foot','plantar-interphalangeal-ligaments']
t={}
for k in T0:t[k]=0
for k in KN:t[k]=.024
for k in TF:t[k]=.028
for k in FT:t[k]=.037
out={}
for key,d in J.items():
    sid,side,zn=key.split('|')
    if sid not in t:continue
    sg=-1 if side=='r' else 1
    if sid in ('interpubic-disc',) : sg=1
    tx=t[sid]*sg
    v=[[1.067*p[0]+tx,.967*p[1]+.0581,1.067*p[2]+.0136] for p in d['v']]
    out[key]={'v':v,'f':d['f']}
json.dump(out,open('/tmp/jx/joints2.json','w'))
json.dump(sorted(t),open('/tmp/jx/keep.json','w'))
print(len(out))
