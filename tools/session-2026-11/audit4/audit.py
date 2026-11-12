"""Automated anatomy QA on the inventory produced by inv.js. Technical checks only (not expert validation)."""
import json,collections,csv,re,sys,itertools
import numpy as np
M=json.load(open('manifest.json'));R=M['records'];A=M['assets']
SC={k:json.load(open('scene_%s.json'%k)) for k in ('male','female','male_bp3d')}
F=[]   # findings: (severity, check, id, detail)
def add(sev,chk,i,d):F.append((sev,chk,i,d))
SYS={'skeletal','muscular','lymphatic','cardiovascular','nervous','digestive','special-senses','respiratory','reproductive','urinary','endocrine','integumentary'}
LAY={'bones','muscles','vessels','organs','nerves','skin'}
# ---------- records
for i,r in R.items():
    if r.get('id')!=i:add('HIGH','record-id-mismatch',i,'key %s vs id %s'%(i,r.get('id')))
    if not (r.get('name') or '').strip():add('HIGH','missing-name',i,'')
    nm=r.get('name') or ''
    if nm!=nm.strip() or '  ' in nm:add('LOW','name-whitespace',i,repr(nm))
    if r.get('system') not in SYS:add('HIGH','bad-system',i,str(r.get('system')))
    if r.get('layer') not in LAY:add('HIGH','bad-layer',i,str(r.get('layer')))
    p=r.get('parentId')
    if p:
        if p not in R:add('HIGH','parent-missing',i,p)
        elif p==i:add('HIGH','parent-self',i,p)
    # cycles
    seen=set();q=i
    while q and q in R and q not in seen:seen.add(q);q=R[q].get('parentId')
    if q and q in seen:add('HIGH','parent-cycle',i,q)
    # side consistency
    sd=r.get('side');suf='left' if i.endswith('-left') else 'right' if i.endswith('-right') else None
    if suf and sd!=suf:add('HIGH','side-field-vs-id',i,'side=%s'%sd)
    if sd in('left','right'):
        low=nm.lower()
        other='right' if sd=='left' else 'left'
        if re.search(r'\b%s\b'%other,low) and not re.search(r'\b%s\b'%sd,low):add('HIGH','side-vs-name',i,nm)
        if not re.search(r'\b%s\b'%sd,low):add('LOW','sided-name-lacks-side',i,nm)
    for c in r.get('childIds') or []:
        if c not in R:add('HIGH','child-missing',i,c)
# sided pair completeness
for i in R:
    for a,b in (('-left','-right'),('-right','-left')):
        if i.endswith(a) and i[:-len(a)]+b not in R:add('HIGH','pair-incomplete',i,'no '+i[:-len(a)]+b)
# duplicate names / latin names
byname=collections.defaultdict(list);bylat=collections.defaultdict(list)
for i,r in R.items():
    byname[(r.get('name') or '').strip().lower()].append(i)
    if r.get('latinName'):bylat[r['latinName'].strip().lower()].append(i)
for n,ids in byname.items():
    if len(ids)>1:add('HIGH','duplicate-name',ids[0],'%s: %s'%(n,', '.join(ids)))
def base(i):return re.sub(r'-(left|right)$','',i)
for n,ids in bylat.items():
    if len({base(i) for i in ids})>1:add('MEDIUM','duplicate-latin-name',ids[0],'%s: %s'%(n,', '.join(ids)))
# ---------- meshes
assetfid={k:v['fidelity'] for k,v in A.items()}
def is_generated(m):
    mod=m['model'];return assetfid.get(mod,'schematic')!='anatomical' or mod in('','schematic-body-v1')
ms_by_sid=collections.defaultdict(list)
for sc,L in SC.items():
    for m in L:
        m['scene']=sc
        if m['sid']:ms_by_sid[m['sid']].append(m)
seen_unmapped=set()
for sc,L in SC.items():
    for m in L:
        key=(m['model'],m['name'])
        if not m['sid']:
            if key not in seen_unmapped:seen_unmapped.add(key);add('MEDIUM','mesh-without-structure',m['name'],'model %s'%m['model'])
            continue
        if m['sid'] not in R and key not in seen_unmapped:seen_unmapped.add(key);add('HIGH','mesh-structure-not-in-records',m['name'],m['sid'])
        if m['nt']<1 or m['nv']<3:add('HIGH','empty-geometry',m['name'],'%s tris'%m['nt'])
        if m['nan']:add('HIGH','invalid-coordinates',m['name'],'%d NaN'%m['nan'])
uniq={}
for sc in ('male','female','male_bp3d'):
    for m in SC[sc]:uniq.setdefault((m['model'],m['name']),m)
U=list(uniq.values())
for m in U:
    if m['nt']<1:continue
    mn=np.array(m['mn']);mx=np.array(m['mx']);dg=np.linalg.norm(mx-mn)
    if dg<0.0006:add('MEDIUM','tiny-mesh',m['name'],'%.2f mm (%s)'%(dg*1000,m['sid']))
    if dg>1.2 and m['sid'] not in('skin',):add('MEDIUM','oversized-mesh',m['name'],'%.2f m (%s)'%(dg,m['sid']))
    if mn[1]<-0.02 or mx[1]>1.85 or mn[0]<-0.6 or mx[0]>0.6 or mn[2]<-0.4 or mx[2]>0.4:add('HIGH','outside-body-bounds',m['name'],'%s..%s (%s)'%(m['mn'],m['mx'],m['sid']))
# side vs coordinates (app: left = +x)
for sid,L in ms_by_sid.items():
    r=R.get(sid)
    if not r or r.get('side') not in('left','right'):continue
    L=[m for m in L if m['scene']=='male' or m['scene']=='female']
    if not L:continue
    w=np.array([m['nv'] for m in L],float);x=np.array([m['c'][0] for m in L]);xm=(w*x).sum()/w.sum()
    want=1 if r['side']=='left' else -1
    if xm*want<-0.004:add('CRITICAL','wrong-side',sid,'centroid x=%.3f m but side=%s'%(xm,r['side']))
    elif abs(xm)<0.002 and max(abs(m['mn'][0]) for m in L)>0.02 and min(m['mn'][0] for m in L)<-0.01 and max(m['mx'][0] for m in L)>0.01:add('HIGH','sided-structure-spans-both-sides',sid,'x from %.3f to %.3f'%(min(m['mn'][0] for m in L),max(m['mx'][0] for m in L)))
# region plausibility
BOX={'head':(1.40,1.80),'neck':(1.34,1.58),'thorax':(1.02,1.50),'abdomen':(0.88,1.28),'pelvis':(0.70,1.08),'back':(0.85,1.55),'lower-limb':(0.0,1.02),'upper-limb':(0.55,1.50)}
for sid,L in ms_by_sid.items():
    r=R.get(sid)
    if not r:continue
    box=BOX.get(r.get('region'))
    if not box:continue
    L=[m for m in L if m['scene']=='male']
    if not L:continue
    w=np.array([m['nv'] for m in L],float);y=(w*np.array([m['c'][1] for m in L])).sum()/w.sum()
    if y<box[0]-0.03 or y>box[1]+0.03:add('HIGH','region-vs-position',sid,'region=%s but centroid height %.2f m'%(r['region'],y))
    if r['region']=='upper-limb':
        x=(w*np.abs(np.array([m['c'][0] for m in L]))).sum()/w.sum()
        if x<0.07:add('HIGH','region-vs-position',sid,'region=upper-limb but |x|=%.2f m (midline)'%x)
# duplicates: exact and near-identical drawn meshes with different structures
for sc in ('male','female','male_bp3d'):
    D=[m for m in SC[sc] if m['vis'] and m['op']>0.02 and m['nt']>0]
    byh=collections.defaultdict(list)
    for m in D:byh[(m['hash'],m['nv'])].append(m)
    for k,g in byh.items():
        if len(g)>1:add('HIGH','identical-mesh-drawn-twice',g[0]['name'],'%s: %s'%(sc,', '.join('%s/%s[%s]'%(m['model'],m['name'],m['sid']) for m in g)))
    C=np.array([m['c'] for m in D]);MN=np.array([m['mn'] for m in D]);MX=np.array([m['mx'] for m in D])
    from scipy.spatial import cKDTree
    tr=cKDTree(C)
    for i,j in tr.query_pairs(0.003):
        a,b=D[i],D[j]
        if a['sid']==b['sid'] and a['model']==b['model']:continue
        da=np.linalg.norm(MX[i]-MN[i]);
        if da<0.004:continue
        if np.abs(MN[i]-MN[j]).max()<0.0025 and np.abs(MX[i]-MX[j]).max()<0.0025:
            sa=np.array(a['samp']);sb=np.array(b['samp'])
            if len(sa)<5 or len(sb)<5:continue
            d1=cKDTree(sb).query(sa)[0];
            if np.median(d1)<max(0.002,0.03*da):add('HIGH' if a['sid']!=b['sid'] else 'MEDIUM','near-identical-overlap',a['name'],'%s: %s/%s[%s] vs %s/%s[%s], size %.1f cm'%(sc,a['model'],a['name'],a['sid'],b['model'],b['name'],b['sid'],da*100))
# same structure drawn from two different models at once
for sc in ('male','female'):
    g=collections.defaultdict(lambda:collections.defaultdict(list))
    for m in SC[sc]:
        if m['vis'] and m['op']>0.02 and m['sid']:g[m['sid']][m['model']].append(m)
    for sid,mods in g.items():
        if len(mods)>1:add('MEDIUM','structure-from-two-models',sid,'%s: %s'%(sc,', '.join('%s(%d)'%(k,len(v)) for k,v in mods.items())))
# pairs: one side has a mesh, the other does not
drawn=set()
for sc in ('male','female','male_bp3d'):
    for m in SC[sc]:
        if m['sid'] and m['nt']>0:drawn.add(m['sid'])
def has_mesh(i,depth=0):
    if i in drawn:return True
    return False
kids=collections.defaultdict(list)
for i,r in R.items():
    if r.get('parentId'):kids[r['parentId']].append(i)
def has_any(i,seen=None):
    seen=seen or set()
    if i in seen:return False
    seen.add(i)
    return i in drawn or any(has_any(c,seen) for c in kids[i])
for i in R:
    if i.endswith('-left'):
        j=i[:-5]+'-right'
        if j in R and has_any(i)!=has_any(j):add('HIGH','pair-mesh-asymmetry',i,'left %s, right %s'%('has mesh' if has_any(i) else 'no mesh','has mesh' if has_any(j) else 'no mesh'))
nomesh=[i for i in R if not has_any(i)]
for i in nomesh:add('LOW','record-without-mesh',i,R[i]['system'])
# generated-only structures
gen=collections.defaultdict(list)
for sid,L in ms_by_sid.items():
    if sid in R and all(is_generated(m) for m in L):gen[R[sid]['system']].append(sid)
# ---------- outputs
with open('inventory.csv','w',newline='') as f:
    w=csv.writer(f);w.writerow(['id','name','latinName','system','layer','region','parentId','side','sex','meshes','models','generated_only','centre_x','centre_y','centre_z','drawn_male','drawn_female'])
    for i,r in sorted(R.items()):
        L=[m for m in ms_by_sid.get(i,[]) if m['scene'] in('male','female')];Lm=[m for m in ms_by_sid.get(i,[])]
        ww=np.array([m['nv'] for m in Lm],float) if Lm else None
        c=((ww[:,None]*np.array([m['c'] for m in Lm])).sum(0)/ww.sum()).round(3).tolist() if Lm else ['','','']
        w.writerow([i,r.get('name'),r.get('latinName',''),r.get('system'),r.get('layer'),r.get('region'),r.get('parentId',''),r.get('side',''),r.get('sex',''),len({(m['model'],m['name']) for m in Lm}),';'.join(sorted({m['model'] for m in Lm})),'yes' if Lm and all(is_generated(m) for m in Lm) else ('' if Lm else 'no mesh'),*c,
            'yes' if any(m['scene']=='male' and m['vis'] and m['op']>0.02 for m in Lm) else '','yes' if any(m['scene']=='female' and m['vis'] and m['op']>0.02 for m in Lm) else ''])
json.dump([dict(severity=a,check=b,id=c,detail=d) for a,b,c,d in F],open('findings.json','w'),indent=0)
cnt=collections.Counter((a,b) for a,b,_,_ in F)
print('records',len(R),'unique meshes',len(U),'structures with a mesh',len(drawn&set(R)),'records without mesh (incl. children-less)',len(nomesh))
print('generated-only structures:',{k:len(v) for k,v in gen.items()},'total',sum(len(v) for v in gen.values()))
json.dump(gen,open('generated_only.json','w'),indent=0)
for (sev,chk),n in sorted(cnt.items(),key=lambda x:(['CRITICAL','HIGH','MEDIUM','LOW'].index(x[0][0]),-x[1])):print('%-9s %-36s %d'%(sev,chk,n))
