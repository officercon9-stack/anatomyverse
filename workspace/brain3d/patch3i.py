# ---------- organs, limb supply, views, search commands ----------
import sys,re
sys.path.insert(0,'/home/claude/brain3d')
from organ_data import ORG,VES
from supply_data import SUP
from muscles_data import M as _M
shutil.copy('/home/claude/brain3d/anatomyverse-organs.glb.json',DST+'/models/')
shutil.copy('/home/claude/brain3d/anatomyverse-limbsupply.glb.json',DST+'/models/')
def recg(i,nm,lat,syn,system,layer,region,parent,loc,desc,fn,clin,src):
    d={'id':i,'name':nm,'latinName':lat,'synonyms':syn,'system':system,'region':region,'layer':layer}
    if parent: d['parentId']=parent
    d.update(location=loc,description=desc,function=fn,clinicalRelevance=clin)
    js=json.dumps(d,ensure_ascii=False); return js[:-1]+',"sources":y(v.%s),"reviewStatus":b}'%src
PARENT={'renal-artery':'aorta','coeliac-trunk':'aorta','superior-mesenteric-artery':'aorta','inferior-mesenteric-artery':'aorta','subclavian-artery':'aorta','internal-iliac-artery':'common-iliac-artery','external-iliac-artery':'common-iliac-artery','renal-vein':'inferior-vena-cava','iliac-veins':'inferior-vena-cava','subclavian-vein':'superior-vena-cava','internal-jugular-vein':'superior-vena-cava','radial-artery':'brachial-artery','ulnar-artery':'brachial-artery','axillary-artery':'subclavian-artery','popliteal-artery':'femoral-artery','anterior-tibial-artery':'popliteal-artery','posterior-tibial-artery':'popliteal-artery','saphenous-nerve':'femoral-nerve'}
RECS=[]
for r_ in ORG+VES:
    src={'digestive':'digestive','skeletal':'skeletal','cardiovascular':'vessels'}[r_[4]]
    r_=list(r_)
    if len(r_)==11: r_.insert(7,None)
    if r_[7] is None: r_[7]=PARENT.get(r_[0])
    RECS.append(recg(*r_,src))
for (i,nm,lat,syn,kind,reg,loc,desc,fn,clin) in SUP:
    RECS.append(recg(i,nm,lat,syn,'cardiovascular' if kind=='v' else 'nervous','vessels' if kind=='v' else 'nerves',reg,PARENT.get(i),loc,desc,fn,clin,'vessels' if kind=='v' else 'nervousAnatomy'))
m=rd(MAN)
st=m.index('S=[{id:`skull`'); depth=0; i=st+2; instr=False
while True:
    ch=m[i]
    if ch=='`': instr=not instr
    elif not instr:
        if ch in '[{': depth+=1
        elif ch in ']}':
            depth-=1
            if depth==0: break
    i+=1
m=m[:i]+','+','.join(RECS)+m[i:]
om={'id':'anatomyverse-organs','name':'Detailed organs, vessels and trunk bones (BodyParts3D)','kind':'gltf','url':'./models/anatomyverse-organs.glb.json','fidelity':'anatomical',
 'license':'CC BY-SA 2.1 Japan - BodyParts3D','attribution':'BodyParts3D, (c) The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Meshes simplified and scaled for AnatomyVerse.',
 'description':'Liver, stomach, intestines, pancreas, spleen, kidneys, bladder, large vessels, ribs and spine.','offset':[0,0,0],'objectMap':json.load(open('/home/claude/brain3d/organs_objectmap.json'))}
sm_={'id':'anatomyverse-limbsupply','name':'Limb arteries, veins and nerves (schematic)','kind':'gltf','url':'./models/anatomyverse-limbsupply.glb.json','fidelity':'schematic',
 'license':'AnatomyVerse schematic model','attribution':'Courses of the main limb arteries, veins and nerves drawn by AnatomyVerse on the BodyParts3D limb bones. Routes are simplified and the tubes are drawn thicker than real.',
 'description':'Main arteries, veins and nerves of the arm and the leg.','offset':[0,0,0],'objectMap':json.load(open('/home/claude/brain3d/limbsupply_objectmap.json'))}
tail='],D=`schematic-body-v1`'; assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(om,ensure_ascii=False)+','+json.dumps(sm_,ensure_ascii=False)+tail)
def both(base): return [base+'_L',base+'_R']
REPO=['oesophagus','stomach','liver','gallbladder','pancreas','small_intestine','large_intestine','rectum','urinary_bladder','spleen','thymus','aorta','inferior_vena_cava','rib_cage','sternum','vertebral_column']+both('kidney')+both('adrenal_gland')+both('ureter')+both('eye')+both('common_carotid')+both('common_iliac')
REPS=[]
for b_ in ('brachial_artery','femoral_artery','sciatic_nerve','axillary_nerve','radial_nerve','musculocutaneous_nerve','femoral_nerve','tibial_nerve','common_fibular_nerve'): REPS+=both(b_)
a='"alveoli_cluster"]}]}'; assert m.count(a)==1
m=m.replace(a,'"alveoli_cluster"]},{assetId:`anatomyverse-organs`,replacesParts:'+json.dumps(REPO)+'},{assetId:`anatomyverse-limbsupply`,replacesParts:'+json.dumps(REPS)+'}]}')
wr(MAN,m)
# store flag nv
for ch in (V,L):
    t=rd(ch); t=sub1(t,'inside:!1,pop:null,dia:!1}','inside:!1,pop:null,dia:!1,nv:!1}'); wr(ch,t)
# muscle -> nerve / vessel relations
NR=[(r'median nerve|anterior interosseous','median-nerve'),(r'ulnar nerve','ulnar-nerve'),(r'radial nerve|posterior interosseous','radial-nerve'),(r'musculocutaneous','musculocutaneous-nerve'),(r'axillary nerve','axillary-nerve'),(r'femoral nerve','femoral-nerve'),(r'sciatic','sciatic-nerve'),(r'tibial nerve|plantar nerve','tibial-nerve'),(r'fibular|peroneal','common-fibular-nerve')]
VR=[(r'axillary','axillary-artery'),(r'brachial|profunda brachii','brachial-artery'),(r'radial','radial-artery'),(r'ulnar','ulnar-artery'),(r'femoral|profunda femoris|circumflex','femoral-artery'),(r'popliteal|sural|genicular','popliteal-artery'),(r'anterior tibial|dorsalis pedis','anterior-tibial-artery'),(r'posterior tibial|fibular artery|peroneal|plantar','posterior-tibial-artery')]
REL={}
for r_ in _M:
    ids=[]
    for pat,i_ in NR:
        if re.search(pat,r_[8],re.I) and i_ not in ids: ids.append(i_)
    for pat,i_ in VR:
        if re.search(pat,r_[10],re.I) and i_ not in ids: ids.append(i_)
    if ids: REL[r_[0]]=ids
REL.update({'deltoid':['axillary-nerve','axillary-artery'],'biceps-brachii':['musculocutaneous-nerve','brachial-artery'],'triceps-brachii':['radial-nerve','brachial-artery'],'rectus-femoris':['femoral-nerve','femoral-artery'],'gastrocnemius':['tibial-nerve','popliteal-artery','posterior-tibial-artery']})
v=rd(V)
v=sub1(v,'function _BrainFlow(){','var _REL='+json.dumps(REL)+';function _BrainFlow(){')
v=sub1(v,'_ll=e.id===`anatomyverse-limbs`,','_ll=e.id===`anatomyverse-limbs`,_ls=e.id===`anatomyverse-limbsupply`,')
v=sub1(v,'?.55:_ll&&_sl&&','?.55:_ls&&_ga.nv&&_sl&&_REL[_sl]&&!_REL[_sl].includes(e.structureId)?.15:_ll&&_sl&&')
wr(V,v)
# ---- lab page: views + buttons
l=rd(L)
VIEW=r'''var _UP=[`clavicle`,`scapula`,`deltoid`,`biceps-brachii`,`triceps-brachii`,`pectoralis-major`,`brachial-plexus`],_LO=[`hip-bone`,`femur`,`tibia`,`fibula`,`patella`,`rectus-femoris`,`gastrocnemius`,`inguinal-ligament`,`iliotibial-tract`],_UPF=[`humerus`,`radius`,`ulna`,`hand-bones`,`scapula`,`clavicle`],_LOF=[`femur`,`tibia`,`fibula`,`foot-bones`,`hip-bone`];
function _regIds(_f){return r.filter(_f).map(_e=>_e.id)}
function _view(_k,_nv,_keep){let _s=D.getState(),_o;
 if(_k===`all`)_o={skin:.12,muscles:1,bones:1,vessels:1,nerves:1,organs:1};
 else if(_k===`inside`)_o={skin:.05,muscles:0,bones:.45,vessels:1,nerves:.5,organs:1};
 else if(_k===`nv`)_o={skin:.05,muscles:.2,bones:.3,vessels:1,nerves:1,organs:.12};
 else if(_k===`skeleton`)_o={skin:.05,muscles:.05,bones:1,vessels:.05,nerves:.05,organs:.05};
 else _o={skin:.05,muscles:_nv?.5:1,bones:_nv?.3:_k===`muscles`?.2:.6,vessels:_nv?1:.12,nerves:_nv?1:.12,organs:.08};
 _s.restoreVisibility();for(let _l in _o){_s.setLayerVisible(_l,!0);_s.setLayerOpacity(_l,_o[_l])}
 _avb.set({inside:!1,dia:!1,nv:!!_nv,...(_k===`all`||_k===`inside`?{vessels:!0,flow:!0,csf:!0,csfFlow:!0,airflow:!0}:{vessels:!1,flow:!1,csf:!1,csfFlow:!1,airflow:!1})});globalThis.__cv=_k;
 let _ids=_k===`inside`?_regIds(_e=>_e.region!==`upper-limb`&&_e.region!==`lower-limb`):_k===`upper`?_regIds(_e=>_e.region===`upper-limb`||_UP.includes(_e.id)):_k===`lower`?_regIds(_e=>_e.region===`lower-limb`||_LO.includes(_e.id)):null;
 _ids&&_s.isolate(_ids);
 if(!_keep){_s.select(null);_k===`upper`?_s.frame(_UPF,`anterior`):_k===`lower`?_s.frame(_LOF,`anterior`):_s.resetCamera()}}
function _viewCmd(_k){let _m=_k===`full`?`all`:_k===`skeleton`?`bones`:_k;globalThis.__sa?.(_m);globalThis.__snv?.(!1);_view(_k===`full`?`all`:_k,!1)}
globalThis.__viewCmd=_viewCmd;
'''
l=sub1(l,'function _EeFull(){',VIEW+'function _EeFull(){')
i0=l.index('function _limbShow(_k){'); i1=l.index('function _diaShow(){')
l=l[:i0]+'function _limbShow(_k){_view(_k,!1)}\n'+l[i1:]
l=sub1(l,'function Ee(){let[_a,_sa]=(0,Y.useState)(`all`),[_m,_sm]=(0,Y.useState)(!1);','function Ee(){let[_a,_sa]=(0,Y.useState)(`all`),[_m,_sm]=(0,Y.useState)(!1),[_nv,_snv]=(0,Y.useState)(!1);globalThis.__sa=_sa;globalThis.__snv=_snv;')
l=sub1(l,'let _go=(_id,_sys,_foc,_fn)=>{let _s=D.getState();','let _go=(_id,_sys,_foc,_fn)=>{let _s=D.getState();_s.restoreVisibility();_s.select(null);_foc||_s.resetCamera();globalThis.__cv=_id;_snv(!1);_avb.set({vessels:!0,flow:!0,csf:!0,csfFlow:!0,airflow:!0});')
l=sub1(l,'_avb.set({inside:!1,dia:!1});_s.setSystemFocus(_sys)','_avb.set({inside:!1,dia:!1,nv:!1});_s.setSystemFocus(_sys)')
l=sub1(l,'function _diaShow(){let _s=D.getState();','function _diaShow(){let _s=D.getState();_s.restoreVisibility();')
l=sub1(l,'[`muscles`,`Muscles`,`muscular`,null]','[`muscles`,`Muscles`,null,null,`muscles`]')
l=sub1(l,'[`arm`,`Arm and hand muscles`,null,null,`arm`],[`leg`,`Leg and foot muscles`,null,null,`leg`],','[`inside`,`Internal organs`,null,null,`inside`],[`upper`,`Upper limb`,null,null,`upper`],[`lower`,`Lower limb`,null,null,`lower`],[`nv`,`Nerves and blood vessels`,null,null,`nv`],')
TOG=r'''[`muscles`,`upper`,`lower`].includes(_a)&&(0,X.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,X.jsx)(`button`,{type:`button`,"aria-pressed":_nv,className:`av-btn justify-center text-center`,style:{minHeight:48,fontSize:14,fontWeight:600,..._nv?{borderColor:`var(--av-teal)`,color:`var(--av-teal)`}:{}},onClick:()=>{let _n=!_nv;_snv(_n);_view(_a,_n,!0)},children:_nv?`Hide nerves and blood vessels`:`Show nerves and blood vessels`}),_nv&&(0,X.jsx)(`p`,{className:`text-xs text-[var(--av-text-muted)]`,children:`Yellow = nerves, red = arteries, blue = veins. Muscles are see-through. Tap a muscle to see its own nerve and artery.`})]}),'''
l=sub1(l,'(0,X.jsxs)(`ol`,{className:`text-sm leading-relaxed text-[var(--av-text-muted)]`',TOG+'(0,X.jsxs)(`ol`,{className:`text-sm leading-relaxed text-[var(--av-text-muted)]`')
wr(L,l)
# ---- search box commands
SB='assets/SearchBox-CXYvX0ai.js'; t=rd(SB)
CMD=r'''var _CMD=[[`full`,`Full model`,`Show the whole body again`,/(full|whole|entire|complete|normal)\s*(body|model)|^\s*(return|back|reset|restore)|return to|go back|reset|start over/,1],
[`inside`,`Internal organs`,`Body with the internal organs`,/internal organs|inner organs|inside|organs?\b|viscera|internal (body|view|model)/,1],
[`upper`,`Upper limb`,`Shoulder, arm and hand only`,/upper\s*(limb|extremit)|\barms?\b|forearm|\bhands?\b|shoulder/,1],
[`lower`,`Lower limb`,`Hip, thigh, leg and foot only`,/lower\s*(limb|extremit)|\blegs?\b|\bfeet\b|\bfoot\b|\bthigh/,1],
[`skeleton`,`Skeleton`,`Bones only`,/skeleton|\bbones?\b/,0],[`muscles`,`Muscles and tendons`,`All muscles, tendons and ligaments`,/muscles?\b|tendons?\b|ligaments?\b/,0],[`nv`,`Nerves and blood vessels`,`Nerves, arteries and veins`,/nerves?\b|vessels?\b|arteries|veins?\b/,0]];
function _cmds(_t){let _q=_t.toLowerCase().trim();if(!_q)return{first:[],rest:[]};let _r={first:[],rest:[]};for(let _c of _CMD)if(_c[3].test(_q))(_c[4]?_r.first:_r.rest).push({cmd:!0,structure:{id:`cmd:`+_c[0],name:_c[1],system:`x`,region:`quick view`,description:_c[2]},matchedOn:`name`});return _r}
function _runCmd(k){let _in=location.hash.includes(`/app/lab`);_in||(location.hash=`#/app/lab`);setTimeout(()=>globalThis.__viewCmd?.(k),_in?0:2500)}
'''
t=sub1(t,'function m({onSelect:e,autoFocus:t,',CMD+'function m({onSelect:e,autoFocus:t,')
t=sub1(t,'w=(0,f.useMemo)(()=>a(m,r,10),[m,C])','w=(0,f.useMemo)(()=>{let _c=_cmds(m);return[..._c.first,...a(m,r,10),..._c.rest]},[m,C])')
t=sub1(t,'E=t=>{e(t),h(``)','E=t=>{typeof t==`string`&&t.startsWith(`cmd:`)?_runCmd(t.slice(4)):e(t),h(``)')
t=sub1(t,'S(e.structure.id)?(0,p.jsxs)(`span`,{className:`av-badge av-badge--accent shrink-0`','e.cmd?(0,p.jsx)(`span`,{className:`av-badge av-badge--accent shrink-0`,children:`View`}):S(e.structure.id)?(0,p.jsxs)(`span`,{className:`av-badge av-badge--accent shrink-0`')
t=sub1(t,'children:[o[e.structure.system]?.name,` · `,e.structure.region.replace(`-`,` `),','children:[e.cmd?`Quick view`:o[e.structure.system]?.name,e.cmd?``:` · `,e.cmd?``:e.structure.region.replace(`-`,` `),')
t=sub1(t,'children:l.map(e=>(0,p.jsx)(`button`,{type:`button`,className:`av-badge hover:text-[var(--av-teal)]`','children:[...l,`internal organs`,`upper limb`,`lower limb`,`full model`].map(e=>(0,p.jsx)(`button`,{type:`button`,className:`av-badge hover:text-[var(--av-teal)]`')
wr(SB,t)
