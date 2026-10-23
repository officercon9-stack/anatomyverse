# ---------- diaphragm: blood and nerve supply ----------
shutil.copy('/home/claude/brain3d/anatomyverse-diasupply.glb.json',DST+'/models/')
def r5(id,name,latin,syn,layer,loc,desc,fn,clin):
    r=rec(id,name,latin,syn,'diaphragm',layer,loc,desc,fn,clin,system='respiratory',region='thorax')
    return r.replace('y(v.nervousAnatomy)','y(v.respiratory)')
DR=[
 r5('inferior-phrenic-artery','Inferior phrenic artery','Arteria phrenica inferior',['subdiaphragmatic artery'],'vessels','Arises from the abdominal aorta (or the coeliac trunk) at the aortic opening and runs up on the underside of the diaphragm.','The main artery of the diaphragm. Each side divides into an anterior and a posterior branch that spread over the abdominal surface of the muscle. The right artery passes behind the inferior vena cava.','Supplies the diaphragm with oxygen-rich blood. Branches also reach the adrenal gland. The matching veins drain into the inferior vena cava on the right and the left adrenal or renal vein on the left.','Rich links (anastomoses) with the other phrenic arteries protect the diaphragm if one vessel is blocked. A liver cancer can grow extra feeding vessels from this artery, which matters when its blood supply is blocked by radiology treatment. Cuts or tears of the diaphragm from stab wounds or accidents can bleed from these branches.'),
 r5('superior-phrenic-artery','Superior phrenic artery','Arteria phrenica superior',[],'vessels','Arises from the lower thoracic aorta and runs on the upper (chest) surface of the back of the diaphragm.','A small artery, often several twigs, to the back of the diaphragm. It joins the inferior phrenic, musculophrenic and pericardiophrenic arteries.','Supplies the back and top of the diaphragm.','Because of the many links with the other phrenic arteries, blocking this vessel rarely harms the diaphragm. Its twigs can bleed in chest injuries with tears of the diaphragm.'),
 r5('musculophrenic-artery','Musculophrenic artery','Arteria musculophrenica',[],'vessels','A branch of the internal thoracic artery. It runs along the lower rib margin (costal margin) on the chest side of the diaphragm.','The terminal branch of the internal thoracic (internal mammary) artery. It follows the edge of the diaphragm where it joins the lower ribs and gives branches to the lower intercostal spaces.','Supplies the front and sides of the diaphragm, the lower chest wall and the upper abdominal wall.','The internal thoracic artery is often used as a graft in heart bypass surgery, but the musculophrenic branch is usually left in place. Wounds along the lower rib margin can injure it.'),
 r5('pericardiophrenic-artery','Pericardiophrenic artery','Arteria pericardiacophrenica',[],'vessels','A branch of the internal thoracic artery. It runs with the phrenic nerve between the pericardium and the pleura.','A long, thin artery that travels beside the phrenic nerve down to the diaphragm.','Supplies the pericardium, the pleura beside it and the top of the diaphragm.','During heart or lung surgery the artery and the phrenic nerve run together and can be injured together. This may cause a raised, weak half of the diaphragm.'),
 r5('lower-intercostal-nerves','Lower intercostal and subcostal nerves','Nervi intercostales inferiores et nervus subcostalis',['T5 to T12 nerves'],'nerves','Along the rim of the diaphragm, where it attaches to the lower six ribs and their cartilages.','The lower six intercostal nerves and the subcostal nerve give sensory branches to the outer rim of the diaphragm.','Carry pain and touch sensation from the edge of the diaphragm. They do not move the muscle: all of its movement (motor supply) comes from the phrenic nerves.','Irritation of the rim of the diaphragm (for example in pleurisy or pneumonia of the lower lung) can cause pain felt in the lower chest or upper abdominal wall. Irritation of the centre is felt as shoulder-tip pain because it travels in the phrenic nerve (C3 to C5).'),
]
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
m=m[:i]+','+','.join(DR)+m[i:]
dm={'id':'anatomyverse-diasupply','name':'Diaphragm blood and nerve supply (schematic)','kind':'gltf','url':'./models/anatomyverse-diasupply.glb.json','fidelity':'schematic',
 'license':'AnatomyVerse schematic model','attribution':'Schematic vessels and nerves drawn by AnatomyVerse on the BodyParts3D diaphragm. Routes are simplified and the vessels are drawn thicker than real.',
 'description':'Phrenic nerves, phrenic and thoracic arteries and the lower intercostal nerves on the diaphragm.','offset':[0,1.425,0.015],'objectMap':json.load(open('/home/claude/brain3d/diasupply_objectmap.json'))}
tail='],D=`schematic-body-v1`'; assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(dm,ensure_ascii=False)+tail)
a='`pleura_L`,`pleura_R`]}]}'; assert m.count(a)==1
m=m.replace(a,'`pleura_L`,`pleura_R`]},{assetId:`anatomyverse-diasupply`,gate:`dia`,replacesParts:[`phrenic_nerve_L`,`phrenic_nerve_R`]}]}')
wr(MAN,m)
for ch in (V,L):
    t=rd(ch); t=sub1(t,'inside:!1,pop:null}','inside:!1,pop:null,dia:!1}'); wr(ch,t)
v=rd(V)
v=sub1(v,'_lg=e.id===`bodyparts3d-lungs`,','_lg=e.id===`bodyparts3d-lungs`||e.id===`anatomyverse-diasupply`,')
v=sub1(v,'?(_ga.inside?.16:.85):e.baseOpacity','?(_ga.dia?.12:_ga.inside?.16:.85):_lg&&e.structureId===`diaphragm`&&_ga.dia?.55:e.baseOpacity')
v=sub1(v,'_lg&&/lobe/.test(','_lg&&_ga.dia&&e.structureId!==`diaphragm`&&!/phrenic|intercostal|musculo|pericardio/.test(e.structureId??``)?.05:_lg&&/lobe/.test(')
wr(V,v)
l=rd(L)
l=sub1(l,'function _EeFull(){','function _diaShow(){let _s=D.getState();for(let _l of[`skin`,`muscles`,`bones`,`vessels`,`nerves`,`organs`])_s.setLayerOpacity(_l,_l===`skin`?.08:1);_s.setSystemFocus(`respiratory`);_avb.set({inside:!1,dia:!0});setTimeout(()=>D.getState().focusStructure(`diaphragm`),250);setTimeout(()=>D.getState().select(null),1000)}\nfunction _EeFull(){')
l=sub1(l,'_avb.set({inside:!1});_s.setSystemFocus(_sys)','_avb.set({inside:!1,dia:!1});_s.setSystemFocus(_sys)')
l=sub1(l,'[`kidney`,`Kidneys and bladder`,`urinary`,null]]','[`kidney`,`Kidneys and bladder`,`urinary`,null],[`dia`,`Diaphragm: blood and nerves`,null,null,!0]]')
l=sub1(l,'onClick:()=>_go(b[0],b[2],b[3]),children:b[1]}','onClick:()=>b[4]?(_sa(`dia`),_diaShow()):_go(b[0],b[2],b[3]),children:b[1]}')
l=sub1(l,'style:{minHeight:48,fontSize:14,fontWeight:600,','style:{minHeight:48,fontSize:14,fontWeight:600,...(b[4]?{gridColumn:`span 2`}:{}),')
anchor="(n.id===`heart`||n.parentId===`heart`)&&P&&"
btn2="(n.id===`diaphragm`||n.parentId===`diaphragm`||n.id===`phrenic-nerve`)&&(0,X.jsxs)(`button`,{type:`button`,className:`av-btn`,onClick:()=>_diaShow(),children:[(0,X.jsx)(d,{size:15,\"aria-hidden\":!0}),` Show blood and nerve supply of the diaphragm`]}),"
l=sub1(l,anchor,btn2+anchor)
wr(L,l)
v=rd(V)
v=sub1(v,'return _g.airflow&&!_g.pop&&_d&&_n>0?','return _g.airflow&&!_g.pop&&!_g.dia&&_d&&_n>0?')
wr(V,v)
