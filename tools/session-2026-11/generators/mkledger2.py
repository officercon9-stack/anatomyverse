import json,re,collections
recs=json.load(open('lg0.json'));order=json.load(open('order.json'));by={r['id']:r for r in recs}
try: status=json.load(open('ledger_status.json'))
except Exception: status={}
S=json.load(open('scan_union.json'))
def src(names):
    n=names[0] if names else ''
    if re.match(r'^(za2?|zn|zb|zv|zu|zo|zj)_',n): return 'Z-Anatomy'
    if re.match(r'^(m|b|f|t|bp)_',n): return 'BodyParts3D'
    if n.startswith('hm_'): return 'HuBMAP'
    if re.match(r'^(zp|zm|mc|vulva|zt)_|^scrotum$',n) : return 'generated / adapted (see THIRD_PARTY_ASSETS.md)'
    return 'procedural or schematic (check)'
LM=re.compile(r'(border|surface|body-of|process|fossa|tuberos|spine|crest|facet|head-of|neck-of|notch|groove|line-of|margin|angle|foramen|ramus|condyle|epicondyle|trochanter|tubercle|apex|base-of|part-of|ala-of|wing|protuberance|circumference|capitulum|trochlea|sulcus|canal|eminence|promontory|lamina|pecten|lingula|incisure|prominence|ridge|horn|arch|acetabulum|acromion|olecranon|malleolus|glabella|sella|hamulus|plate)')
kidsOf=collections.defaultdict(list)
for k in S:
    for r in recs:
        pass
ids=set(by)
cnt=collections.Counter()
L=['# AnatomyVerse complete anatomical QA ledger','',
'Every record (%d). Status values: Not inspected; Inspected - passed; Inspected - defect found; Corrected - awaiting visual verification; Corrected - verified; Blocked - requires external source; Blocked - requires anatomical expert.'%len(order),'',
'Technical verification (mesh metrics, selection, screenshots by the developer) is NOT anatomical validation by a qualified expert. No row is marked as expert-validated.','',
'Order: system, then id. Batches of 50. Batch 1 was inspected row by row (camera poses and screenshots). For every other row the Notes column holds the result of an automated whole-scene scan run on 5 November 2026 (mesh present, vertex count, source by node name). The scan is not a visual inspection, so those rows stay "Not inspected".','',
'| # | Batch | System | Id | Name | Status | Notes |','|---|---|---|---|---|---|---|']
for i,id in enumerate(order):
    r=by[id];s=status.get(id)
    if s: st,n=s['s'],s['n']
    else:
        st='Not inspected'
        if id in S:
            v=S[id];nv=int(v['n']);flags=[]
            if nv<150 and r['sys']!='lymphatic': flags.append('very low vertex count: possible placeholder shape, check visually')
            if nv>60000: flags.append('heavy mesh (%d vertices)'%nv)
            n='scan: own mesh, %s vertices, source %s%s'%(format(nv,','),src(v['names']),('; '+'; '.join(flags)) if flags else '')
            cnt['own']+=1
            if flags: cnt['flag']+=1
        elif any(k.startswith(id+'-') for k in S):
            n='scan: aggregate record, drawn through its left, right or part meshes'; cnt['agg']+=1
        elif LM.search(id):
            n='scan: surface landmark or bone feature, shown as a marker on the parent bone, no mesh of its own'; cnt['lm']+=1
        else:
            n='scan: no mesh found in either sex or with detailed-brain on and off; aggregate, microscopic or text-only record, check visually'; cnt['none']+=1
    L.append('| %d | %d | %s | %s | %s | %s | %s |'%(i+1,i//50+1,r['sys'],id,r['name'].replace('|','/'),st,n.replace('|','/')))
open('ghclone/COMPLETE_ANATOMICAL_QA_LEDGER.md','w').write('\n'.join(L)+'\n');print(len(order),'rows',dict(cnt))
