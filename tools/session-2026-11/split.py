import json,re,glob,subprocess,sys
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
G_=SC+'ghclone/'
exec(open('/tmp/jx/lymphcontent.py').read())
exec(open('/tmp/jx/bursacontent.py').read())
J=json.load(open('/tmp/jx/joints5.json'))
bur={t[1] for t in B if t[1]!='subtendinous-bursa-of-tibialis-anterior'}
lym_up=set();lym_lo=set()
def sid(z):
    if z=='Paratracheal cervical nodes':return 'paratracheal-nodes'
    s=re.sub(r'^\(|\)$','',z).lower();s=s.replace(')','');return re.sub(r'[^a-z0-9]+','-',s).strip('-')
for z,name,latin,region,loc,drains,note in G:
    (lym_up if region in('head','neck','thorax','upper-limb') else lym_lo).add(sid(z))
ARM=set(json.load(open('/tmp/jx/armids.json')))
SH={'glenoid-labrum','middle-glenohumeral-ligament','inferior-glenohumeral-ligament','glenohumeral-joint-capsule','acromioclavicular-joint-capsule','sternoclavicular-joint-capsule'}
buckets={'zanatomy-joints-lower':{},'zanatomy-joints-upper':{},'zanatomy-bursae':{},'zanatomy-lymph-upper':{},'zanatomy-lymph-lower':{}}
for k,v in J.items():
    s=k.split('|')[0]
    if s in bur:b='zanatomy-bursae'
    elif s in lym_up:b='zanatomy-lymph-upper'
    elif s in lym_lo:b='zanatomy-lymph-lower'
    elif s in ARM or s in SH:b='zanatomy-joints-upper'
    else:b='zanatomy-joints-lower'
    buckets[b][k]=v
flag={'zanatomy-joints-lower':'ld_jlo','zanatomy-joints-upper':'ld_jup','zanatomy-bursae':'ld_bur','zanatomy-lymph-upper':'ld_lyu','zanatomy-lymph-lower':'ld_lyl'}
title={'zanatomy-joints-lower':'Joints and ligaments: pelvis and leg (Z-Anatomy)','zanatomy-joints-upper':'Joints and ligaments: shoulder, arm and hand (Z-Anatomy)','zanatomy-bursae':'Bursae (Z-Anatomy)','zanatomy-lymph-upper':'Lymph node groups: head, neck, chest and arm (Z-Anatomy)','zanatomy-lymph-lower':'Lymph node groups: abdomen, pelvis and leg (Z-Anatomy)'}
desc={'zanatomy-joints-lower':'Menisci, labra, capsules, ligaments and symphyses of the pelvis, hip, knee, ankle and foot.','zanatomy-joints-upper':'Shoulder, elbow, wrist and hand capsules, labrum and ligaments.','zanatomy-bursae':'Synovial bursae of the shoulder, elbow, hip, knee and ankle, drawn as simplified sacs.','zanatomy-lymph-upper':'Lymph node groups of the head, neck, chest and upper limb, drawn as individual schematic nodes.','zanatomy-lymph-lower':'Lymph node groups of the abdomen, pelvis and lower limb, drawn as individual schematic nodes.'}
maps={};
for a,d in buckets.items():
    json.dump(d,open(f'/tmp/jx/b_{a}.json','w'))
    for out,lite in((f'/tmp/jx/{a}.glb',''),(f'/tmp/jx/{a}-lite.glb','1')):
        subprocess.run(['node',SC+'tools/buildjoints.mjs',f'/tmp/jx/b_{a}.json',out,lite,f'/tmp/jx/om_{a}.json'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    maps[a]=json.load(open(f'/tmp/jx/om_{a}.json'))
    print(a,len(d),'meshes')
# manifest
p=glob.glob(G_+'assets/assetManifest-*b113.js')[0];s=open(p).read()
i=s.find('{"id": "zanatomy-joints"');k=s.find('}},',s.find('"objectMap"',i))+2
old=s[i:k]
assets=[]
for a in buckets:
    e={"id":a,"name":title[a],"kind":"gltf","url":f"./models/{a}.glb","fidelity":"anatomical","license":"CC BY-SA 4.0 — Z-Anatomy","attribution":"Z-Anatomy — the libre 3D atlas of anatomy, CC BY-SA 4.0, derived from BodyParts3D (CC BY-SA 2.1 Japan)","description":desc[a],"objectMap":maps[a]}
    assets.append(json.dumps(e))
s=s[:i]+','.join(assets)+s[k:]
ov='{assetId:`zanatomy-joints`,gate:`ld_joints`,replacesParts:[]}'
assert ov in s
s=s.replace(ov,','.join('{assetId:`%s`,gate:`%s`,replacesParts:[]}'%(a,flag[a]) for a in buckets))
open(p,'w').write(s)
# viewer
vf=glob.glob(G_+'assets/AnatomyViewer-*-b113.js')[0];v=open(vf).read()
m=re.search(r'var _JOINTSEL=new Set\((\[.*?\])\);',v)
ids=set(json.loads(m.group(1)))
def flagfor(i):
    b=re.sub(r'-(left|right)$','',i)
    for a,d in buckets.items():
        if any(k.split('|')[0]==b for k in d):return flag[a]
JM={i:flagfor(i) for i in ids};assert all(JM.values()),[i for i,f in JM.items() if not f][:5]
v=v[:m.start()]+'var _JMAP='+json.dumps(JM)+';'+v[m.end():]
old_sub='_s.selectedId&&_JOINTSEL.has(_s.selectedId)&&!_avb.get().ld_joints&&_avb.set({ld_joints:!0})'
assert old_sub in v
v=v.replace(old_sub,'_s.selectedId&&_JMAP[_s.selectedId]&&!_avb.get()[_JMAP[_s.selectedId]]&&_avb.set({[_JMAP[_s.selectedId]]:!0})')
v=v.replace('ld_joints:!1,','ld_jlo:!1,ld_jup:!1,ld_bur:!1,ld_lyu:!1,ld_lyl:!1,')
open(vf,'w').write(v)
lf=glob.glob(G_+'assets/LabPage-*-b113.js')[0];l=open(lf).read()
l=l.replace('ld_joints:!1,','ld_jlo:!1,ld_jup:!1,ld_bur:!1,ld_lyu:!1,ld_lyl:!1,')
a=l.find('function _JointLayers(){');b=l.find('function ',a+10)
newfn='''function _ChkM({ks:_ks,label:_lb,hint:_h}){let _g=_useAvb();return(0,X.jsxs)(`label`,{className:`flex items-start gap-2 text-sm`,children:[(0,X.jsx)(`input`,{type:`checkbox`,className:`av-checkbox mt-0.5`,checked:_ks.every(_k=>!!_g[_k]),onChange:_e=>_avb.set(Object.fromEntries(_ks.map(_k=>[_k,_e.target.checked])))}),(0,X.jsxs)(`span`,{children:[_lb,_h&&(0,X.jsx)(`span`,{className:`block text-[11px] leading-snug text-[var(--av-text-faint)]`,children:_h})]})]})}
function _JointLayers(){return(0,X.jsxs)(`div`,{className:`mt-3 flex flex-col gap-2.5 rounded-xl border border-[var(--av-border)] p-3`,children:[(0,X.jsx)(`p`,{className:`text-sm font-semibold`,children:`Joints, bursae and lymph nodes`}),(0,X.jsx)(_ChkM,{ks:[`ld_jlo`,`ld_jup`],label:`Show joints and ligaments`,hint:`Menisci, labra, capsules and ligaments from Z-Anatomy. They load only when you switch this on or pick one of them (about 1 MB per region on a phone).`}),(0,X.jsx)(_ChkM,{ks:[`ld_bur`],label:`Show bursae`,hint:`Fluid-filled cushions at the shoulder, elbow, hip, knee and ankle.`}),(0,X.jsx)(_ChkM,{ks:[`ld_lyu`,`ld_lyl`],label:`Show lymph nodes`,hint:`Lymph node groups, drawn as small schematic nodes. This adds many small shapes, so use it on a fast device.`})]})}
'''
print(l[b:b+40])
l=l[:a]+newfn+l[b:]
open(lf,'w').write(l)
print('ok')
