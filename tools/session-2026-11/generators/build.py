import json,re,collections
R=json.load(open('../recs_app.json'));by={r['id']:r for r in R}
D=json.load(open('d2.json'));LR=json.load(open('lr.json'))
F={}   # id -> fields
def has(i,k): return bool(by[i].get(k))
def put(i,d):
    r=by[i];o={}
    for k in('bloodSupply','venousDrainage','innervation'):
        if not r.get(k) and d.get(k): o[k]=d[k]
    if o: F.setdefault(i,{}).update(o)
# 1 direct
for i,d in D.items():
    if i in by: put(i,d)
    else: print('no record',i)
# 2 lymph nodes by region rules
for r in R:
    if r['system']=='lymphatic' and r['layer']=='vessels' and r['id'] not in D:
        base=re.sub(r'-(left|right)$','',r['id'])
        for pat,art,vein in LR:
            if re.search(pat,base):
                put(r['id'],dict(bloodSupply="Small arteries from "+art+" reach the node at its hilum and capsule and form capillary networks in the cortex and medulla.",
                  venousDrainage="Hilar veins leave with the efferent lymphatics and drain to "+vein+".",
                  innervation=D['lymph-nodes']['innervation']))
                break
# 3 nerves generic
NERVE=dict(bloodSupply="Vasa nervorum: small arteries from the neighbouring named arteries run longitudinally in the epineurium and feed the perineurium and endoneurium.",
 venousDrainage="Small veins accompany the arteries and drain to the neighbouring veins.",
 innervation="Nervi nervorum: small sensory and sympathetic fibres in the epineurium supply the nerve sheath.")
SP={'sciatic-nerve':"Artery to the sciatic nerve (from the inferior gluteal artery), with branches of the perforating arteries of the profunda femoris.",
 'median-nerve':"The artery accompanying the median nerve (from the anterior interosseous artery), with branches of the brachial and radial arteries.",
 'ulnar-nerve':"Superior and inferior ulnar collateral arteries, the ulnar recurrent arteries and the ulnar artery.",
 'radial-nerve':"Branches of the profunda brachii artery (radial collateral and middle collateral arteries) and the radial recurrent artery.",
 'femoral-nerve':"Branches of the femoral artery, lateral circumflex femoral artery and profunda femoris.",
 'vagus-nerve':"Branches of the inferior thyroid, ascending pharyngeal and common carotid arteries in the neck; oesophageal and bronchial arteries in the thorax; left gastric artery at the stomach.",
 'phrenic-nerve':"The pericardiacophrenic artery (from the internal thoracic artery) accompanies it through the thorax.",
 'brachial-plexus':"Branches of the subclavian, transverse cervical and axillary arteries (thyrocervical trunk and subscapular branches).",
 'tibial-nerve':"Branches of the popliteal and posterior tibial arteries.",
 'common-fibular-nerve':"Lateral genicular and anterior tibial recurrent arteries.",
 'axillary-nerve':"Posterior circumflex humeral artery.",
 'musculocutaneous-nerve':"Muscular branches of the axillary and brachial arteries."}
for r in R:
    if r['system'] in('nervous','respiratory') and r['layer']=='nerves' and r['id'] not in D:
        d=dict(NERVE)
        base=re.sub(r'-(left|right)$','',r['id'])
        if base in SP: d['bloodSupply']=SP[base]
        put(r['id'],d)
# 3b vessels generic
VB=dict(bloodSupply="The wall is nourished by the blood in its lumen and, in larger vessels, by the vasa vasorum, small branches of the neighbouring arteries.",
 venousDrainage="The vasa vasorum drain to the neighbouring veins.",
 innervation="Perivascular sympathetic fibres from the autonomic plexus of the region (vasomotor control of the smooth muscle) and sparse sensory fibres (nervi vasorum).")
for r in R:
    if r['id'] in D: continue
    if (r['system']=='cardiovascular' and r['layer'] in('vessels','organs')) or (r['system']=='respiratory' and r['layer']=='vessels'):
        if r['id'] not in F or not merged(r['id']).get('innervation'): put(r['id'],VB)
D['choroid']['bloodSupply']="Short posterior ciliary arteries and long posterior ciliary arteries (branches of the ophthalmic artery), forming the choriocapillaris."
put('choroid',D['choroid'])
# 3c tooth variants and generic muscle veins
for r in R:
    m=re.match(r'^(upper|lower)-(left|right)-(.+)$',r['id'])
    if m and m.group(3) in D:
        up=m.group(1)=='upper';g=D[m.group(3)]
        def pick(t):
            parts=re.split(r'\s(?=Lower:)',t)
            if len(parts)<2: return t
            a,b=parts[0],parts[1]
            tail=''
            if 'The pulp' in b:
                b,tail=b.split(' The pulp',1);tail=' The pulp'+tail
            x=(a if up else b)
            y=x.replace('Upper: ','').replace('Lower: ','');return y[:1].upper()+y[1:]+tail
        put(r['id'],dict(bloodSupply=pick(g['bloodSupply']),venousDrainage=g['venousDrainage'],innervation=pick(g['innervation'])))
# 4 inherit: sided and unsided children of records that have F entries (or already have fields)
def merged(i):
    r=by[i];m={k:r.get(k) for k in('bloodSupply','venousDrainage','innervation')}
    m.update({k:v for k,v in F.get(i,{}).items()})
    return m
changed=True
while changed:
    changed=False
    for r in R:
        i=r['id'];p=r.get('parentId')
        if not p or p not in by: continue
        if r['layer'] in('bones','vessels') and r['system'] in('skeletal',) : continue
        if r['system']=='cardiovascular' and r['layer']=='vessels': continue
        sided=bool(re.search(r'-(left|right)$',i)) or r.get('side')
        if not sided: continue
        pm=merged(p);cm=merged(i);add={}
        for k in('bloodSupply','venousDrainage','innervation'):
            if not cm.get(k) and pm.get(k): add[k]=pm[k]
        if add:
            F.setdefault(i,{}).update(add);changed=True
for r in R:
    if r['system']=='muscular' and not merged(r['id']).get('venousDrainage'):
        put(r['id'],dict(venousDrainage="Venae comitantes accompany the supplying arteries and drain to the regional deep veins."))
# report left
left=collections.Counter()
for r in R:
    i=r['id'];m=merged(i)
    if r['layer'] in('organs','skin','muscles') or (r['system']=='nervous') or (r['system']=='lymphatic'):
        need=[k for k in('bloodSupply','innervation') if not m.get(k)]
        if need: left[(r['system'],r['layer'])]+=1; print('LEFT',r['system'],i,need) if left[(r['system'],r['layer'])]<12 else None
print(left)
json.dump(F,open('F.json','w'))
print(len(F))
