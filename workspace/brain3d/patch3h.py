# ---------- limbs: BodyParts3D muscles + bones with origin/insertion ----------
import sys
sys.path.insert(0,'/home/claude/brain3d')
from muscles_data import M
shutil.copy('/home/claude/brain3d/anatomyverse-limbs.glb.json',DST+'/models/')
shutil.copy('/home/claude/brain3d/muscle-attach.json',DST+'/models/')
EXIST={'deltoid','biceps-brachii','triceps-brachii','pectoralis-major','rectus-femoris','gastrocnemius','rectus-abdominis'}
def recm(mid,name,latin,pat,grp,loc,orig,ins,nerve,act,blood,clin):
    region={'shoulder':'upper-limb','arm':'upper-limb','forearm':'upper-limb','hand':'upper-limb','chest':'thorax','abdomen':'abdomen','back':'thorax','neck':'neck','head':'head','pelvis':'pelvis'}.get(grp,'lower-limb')
    d={'id':mid,'name':name,'latinName':latin,'synonyms':[],'system':'muscular','region':region,'layer':'muscles','location':loc,
       'description':loc,'function':act,'origin':orig,'insertion':ins,'innervation':nerve,'actions':act,'bloodSupply':blood,'clinicalRelevance':clin}
    js=json.dumps(d,ensure_ascii=False)
    return js[:-1]+',"sources":y(v.muscular),"reviewStatus":b}'
MR=[recm(*r) for r in M if r[0] not in EXIST]
def recb(mid,name,latin,region,loc,desc,fn,clin):
    d={'id':mid,'name':name,'latinName':latin,'synonyms':[],'system':'skeletal','region':region,'layer':'bones','location':loc,'description':desc,'function':fn,'clinicalRelevance':clin}
    js=json.dumps(d,ensure_ascii=False); return js[:-1]+',"sources":y(v.skeletal),"reviewStatus":b}'
MR.append(recb('hand-bones','Bones of the hand','Ossa manus','upper-limb','Distal to the forearm bones.','Eight carpal bones in two rows (scaphoid, lunate, triquetral, pisiform; trapezium, trapezoid, capitate, hamate), five metacarpals and fourteen phalanges.','Form the wrist, palm and fingers; give attachment to the forearm and hand muscles.','The scaphoid is the most commonly fractured carpal bone (fall on an outstretched hand) and may heal poorly because of its blood supply. A boxer\'s fracture affects the fifth metacarpal neck.'))
MR.append(recb('foot-bones','Bones of the foot','Ossa pedis','lower-limb','Distal to the leg bones.','Seven tarsal bones (talus, calcaneus, navicular, cuboid and three cuneiforms), five metatarsals and fourteen phalanges.','Form the arches of the foot and give attachment to the leg and foot muscles.','Stress fractures of the metatarsals are common in runners. A fracture of the base of the fifth metatarsal follows sudden inversion of the ankle.'))
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
m=m[:i]+','+','.join(MR)+m[i:]
lm={'id':'anatomyverse-limbs','name':'Limb muscles and bones (BodyParts3D)','kind':'gltf','url':'./models/anatomyverse-limbs.glb.json','fidelity':'anatomical',
 'license':'CC BY-SA 2.1 Japan - BodyParts3D','attribution':'BodyParts3D, (c) The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Muscles and bones simplified, scaled and posed for AnatomyVerse.',
 'description':'About ninety muscles of the shoulder, arm, forearm, hand, hip, thigh, leg and foot with the limb bones.','offset':[0,0,0],'objectMap':json.load(open('/home/claude/brain3d/limbs_objectmap.json'))}
tail='],D=`schematic-body-v1`'; assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(lm,ensure_ascii=False)+tail)
REP=[b+'_'+s for b in ('deltoid','biceps_brachii','triceps_brachii','pectoralis_major','rectus_femoris','rectus_abdominis','gastrocnemius','clavicle','scapula','humerus','radius','ulna','hip_bone','femur','patella','tibia','fibula') for s in ('L','R')]
REP.append('alveoli_cluster')
a='{assetId:`anatomyverse-diasupply`,gate:`dia`,replacesParts:[`phrenic_nerve_L`,`phrenic_nerve_R`]}]}'; assert m.count(a)==1
m=m.replace(a,a[:-2]+',{assetId:`anatomyverse-limbs`,replacesParts:'+json.dumps(REP)+'}]}')
wr(MAN,m)
MIDS=[r[0] for r in M]+['deltoid','biceps-brachii','triceps-brachii']
v=rd(V)
ATT=r'''function _Attach(){let _id=D(e=>e.selectedId),[_d,_sd]=(0,k.useState)(globalThis.__mkc??null);
(0,k.useEffect)(()=>{_d||fetch(`./models/muscle-attach.json`).then(_r=>_r.json()).then(_j=>{globalThis.__mkc=_j,_sd(_j)}).catch(()=>{})},[_d]);
let _m=_d&&_id?_d[_id]:null;if(!_m)return null;
let _sp=(_p,_c,_k)=>(0,A.jsxs)(`mesh`,{position:_p,renderOrder:20,raycast:()=>void 0,children:[(0,A.jsx)(`sphereGeometry`,{args:[.0085,16,12]}),(0,A.jsx)(`meshBasicMaterial`,{color:_c,depthTest:!1,transparent:!0,opacity:.95})]},_k);
return(0,A.jsxs)(`group`,{name:`attach`,children:[_m.o.map((_p,_i)=>_sp(_p,`#2fe38a`,`o`+_i)),_m.i.map((_p,_i)=>_sp(_p,`#ff8a2b`,`i`+_i))]})}
var _MI=new Set('''+json.dumps(MIDS)+r''');
'''
v=sub1(v,'function _BrainFlow(){',ATT+'function _BrainFlow(){')
v=sub1(v,'(0,A.jsx)(_BrainFlow,{}),','(0,A.jsx)(_BrainFlow,{}),(0,A.jsx)(_Attach,{}),')
v=sub1(v,'function jt({asset:e,onLoaded:t}){let _ga=_useAvb(),','function jt({asset:e,onLoaded:t}){let _ga=_useAvb(),_sl=D(e=>e.selectedId),_ll=e.id===`anatomyverse-limbs`,')
v=sub1(v,'&&_ga.dia?.55:e.baseOpacity','&&_ga.dia?.55:_ll&&_sl&&e.structureId!==_sl&&_MI.has(e.structureId)?.36:e.baseOpacity')
# card: origin / insertion
v=sub1(v,'_cl.length>0&&(0,A.jsxs)(k.Fragment,','_n.origin&&(0,A.jsxs)(k.Fragment,{children:[(0,A.jsx)(`div`,{style:{fontSize:10,letterSpacing:`.06em`,textTransform:`uppercase`,color:`#2fe38a`,fontWeight:700,margin:`10px 0 2px`},children:`Origin (green dot)`}),(0,A.jsx)(`div`,{children:_n.origin}),(0,A.jsx)(`div`,{style:{fontSize:10,letterSpacing:`.06em`,textTransform:`uppercase`,color:`#ff8a2b`,fontWeight:700,margin:`10px 0 2px`},children:`Insertion (orange dot)`}),(0,A.jsx)(`div`,{children:_n.insertion}),_n.innervation&&(0,A.jsxs)(k.Fragment,{children:[(0,A.jsx)(`div`,{style:{fontSize:10,letterSpacing:`.06em`,textTransform:`uppercase`,color:`#8ab4ff`,fontWeight:700,margin:`10px 0 2px`},children:`Nerve supply`}),(0,A.jsx)(`div`,{children:_n.innervation})]})]}),_cl.length>0&&(0,A.jsxs)(k.Fragment,')
wr(V,v)
l=rd(L)
LS=r'''function _limbShow(_k){let _s=D.getState();for(let _l of[`skin`,`muscles`,`bones`,`vessels`,`nerves`,`organs`])_s.setLayerOpacity(_l,_l===`skin`?.05:_l===`muscles`?1:_l===`bones`?.6:.12);_s.setSystemFocus(null);_avb.set({inside:!1,dia:!1});D.getState().select(null)}
'''
l=sub1(l,'function _diaShow(){',LS+'function _diaShow(){')
l=sub1(l,'[`dia`,`Diaphragm: blood and nerves`,null,null,!0]]','[`arm`,`Arm and hand muscles`,null,null,`arm`],[`leg`,`Leg and foot muscles`,null,null,`leg`],[`dia`,`Diaphragm: blood and nerves`,null,null,!0]]')
l=sub1(l,'onClick:()=>b[4]?(_sa(`dia`),_diaShow()):_go(b[0],b[2],b[3])','onClick:()=>b[4]===!0?(_sa(`dia`),_diaShow()):b[4]?(_sa(b[0]),_limbShow(b[4])):_go(b[0],b[2],b[3])')
l=sub1(l,'...(b[4]?{gridColumn:`span 2`}:{}),','...(b[4]===!0?{gridColumn:`span 2`}:{}),')
wr(L,l)
