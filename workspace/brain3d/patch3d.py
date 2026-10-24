# ---------- lungs ----------
import shutil,json,re
LUNG_FILES=['bodyparts3d-lungs.glb.json','lung-flow.json']
for f in LUNG_FILES: shutil.copy('/home/claude/brain3d/'+f,DST+'/models/')
def r3(id,name,latin,syn,parent,loc,desc,fn,clin='',layer='organs'):
    r=rec(id,name,latin,syn,parent,layer,loc,desc,fn,clin,system='respiratory',region='thorax')
    return r.replace('y(v.nervousAnatomy)','y(v.respiratory)')
LR=[
 r3('right-upper-lobe','Right upper lobe','Lobus superior pulmonis dextri',[],'right-lung','Above the horizontal fissure, behind the first to fourth ribs at the front.','The highest of the three lobes of the right lung, with apical, posterior and anterior bronchopulmonary segments.','Takes part in gas exchange, mainly in the upper chest.','Pneumonia, tuberculosis (which often starts at the apex), and lung cancers (Pancoast tumour at the apex).'),
 r3('right-middle-lobe','Right middle lobe','Lobus medius pulmonis dextri',[],'right-lung','Between the horizontal and oblique fissures, at the front of the right chest.','The smallest lobe of the right lung, with lateral and medial segments. It lies against the right side of the heart.','Takes part in gas exchange.','Middle lobe syndrome: its narrow bronchus is easily squeezed by lymph nodes, causing collapse and repeated infection.'),
 r3('right-lower-lobe','Right lower lobe','Lobus inferior pulmonis dextri',[],'right-lung','Below the oblique fissure, resting on the diaphragm at the back of the right chest.','The largest lobe of the right lung, with a superior and four basal segments.','Takes part in gas exchange, mainly when breathing deeply at the base.','Aspiration pneumonia (food or fluid breathed in usually passes to the right lower lobe), abscess, and bronchiectasis.'),
 r3('left-upper-lobe','Left upper lobe','Lobus superior pulmonis sinistri',[],'left-lung','Above the oblique fissure, with the cardiac notch and the lingula at its lower front.','Equal to the right upper and middle lobes together. The lingula is the tongue-shaped part that matches the right middle lobe.','Takes part in gas exchange.','Pneumonia, lung cancer, and tuberculosis. The lingula can collapse or become infected.'),
 r3('left-lower-lobe','Left lower lobe','Lobus inferior pulmonis sinistri',[],'left-lung','Below the oblique fissure, resting on the left side of the diaphragm.','The large lower lobe of the left lung with a superior and four basal segments.','Takes part in gas exchange.','Pneumonia, lung abscess, and collapse (atelectasis), common after surgery.'),
 r3('bronchioles','Bronchioles','Bronchioli',['small airways'],'bronchial-tree','Inside the lungs, beyond the segmental bronchi.','The small airways with no cartilage in their walls, about 1 mm across or less, ending in the respiratory bronchioles that open into the alveoli. The branching here is schematic.','Their smooth muscle widens and narrows the airways and so controls the flow of air.','Asthma (the muscle tightens and the lining swells), bronchiolitis in infants, and COPD.'),
 r3('bronchial-tree','Bronchial tree','Arbor bronchialis',['bronchi','airways'],None,'Inside both lungs, from the carina to the terminal bronchioles.','The branching airways: main bronchi, lobar bronchi, segmental bronchi and about 23 generations of divisions down to the alveolar sacs. The scan shows the larger airways, and the finer branches and alveoli are drawn schematically.','Carries air to and from the alveoli, warms, humidifies and filters it. Cilia and mucus clear dust and microbes.','Asthma, chronic bronchitis, COPD, bronchiectasis, lung cancer and inhaled foreign bodies.'),
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
m=m[:i]+','+','.join(LR)+m[i:]
omapA=json.load(open('/home/claude/brain3d/lungs_objectmap.json'))
lm={'id':'bodyparts3d-lungs','name':'Lungs, airways and diaphragm (inside full-body model)','kind':'gltf','url':'./models/bodyparts3d-lungs.glb.json','fidelity':'anatomical',
 'license':'CC BY-SA 2.1 Japan — BodyParts3D','attribution':'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Lobes, airways and diaphragm re-centred, scaled and smoothed for AnatomyVerse; the finer airways and alveoli are schematic additions.',
 'description':'Lungs with their five lobes, the bronchial tree and the diaphragm.','offset':[0,1.425,0.015],'objectMap':omapA}
tail='],D=`schematic-body-v1`'; assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(lm,ensure_ascii=False)+tail)
a='{assetId:`bodyparts3d-brain-mening`,gate:`mening`,replacesParts:[]}]}'; assert m.count(a)==1
m=m.replace(a,'{assetId:`bodyparts3d-brain-mening`,gate:`mening`,replacesParts:[]},{assetId:`bodyparts3d-lungs`,replacesParts:[`right_lung`,`left_lung`,`trachea`,`left_main_bronchus`,`right_main_bronchus`,`diaphragm`,`pleura_L`,`pleura_R`]}]}')
wr(MAN,m)
# store flags
for ch in (V,L):
    t=rd(ch); t=sub1(t,'sig:!0,mening:!1}','sig:!0,mening:!1,breathe:!0,airflow:!0,inside:!1}'); wr(ch,t)
# viewer: breathing in jt
v=rd(V)
v=sub1(v,'baseOpacity:_gh&&!/ventricle|aqueduct/.test(e.structureId??``)?.4:e.baseOpacity','baseOpacity:_gh&&!/ventricle|aqueduct/.test(e.structureId??``)?.4:_lg&&/lobe/.test(e.structureId??``)?(_ga.inside?.16:.85):e.baseOpacity')
v=sub1(v,'function jt({asset:e,onLoaded:t}){let _ga=_useAvb(),','function jt({asset:e,onLoaded:t}){let _ga=_useAvb(),_lr=(0,k.useRef)(null),{invalidate:_ivb}=b(),_lg=e.id===`bodyparts3d-lungs`,')
v=sub1(v,'(0,A.jsx)(`group`,{name:e.id,children:r.map((e,t)=>(0,A.jsx)(St,','(0,A.jsx)(`group`,{name:e.id,ref:_lr,children:r.map((e,t)=>(0,A.jsx)(St,')
v=sub1(v,'[n,e.objectMap,e.offset]);return(0,k.useEffect)(()=>()=>r.forEach(e=>e.geometry.dispose()),[r]),','[n,e.objectMap,e.offset]);p((_s,_dt)=>{globalThis.__scn=_s.scene;if(!_lg||!_lr.current)return;let _g=_lr.current,_o=e.offset;if(_ga.breathe){let _tt=performance.now()/1e3,_b=.5-.5*Math.cos(_tt*Math.PI*2/4),_sx=1+.03*_b,_sy=1+.075*_b,_sz=1+.045*_b;_g.scale.set(_sx,_sy,_sz);_g.position.set(_o[0]*(1-_sx),_o[1]*(1-_sy),_o[2]*(1-_sz));_ivb()}else if(_g.scale.x!==1){_g.scale.set(1,1,1);_g.position.set(0,0,0);_ivb()}});return(0,k.useEffect)(()=>()=>r.forEach(e=>e.geometry.dispose()),[r]),')
wr(V,v)
# lab: lung panel
l=rd(L)
LUNG='''function _LungLayers(){return(0,X.jsxs)(`div`,{className:`mt-3 flex flex-col gap-2.5 rounded-xl border border-[var(--av-border)] p-3`,children:[(0,X.jsx)(`p`,{className:`text-sm font-semibold`,children:`Lungs and breathing`}),
(0,X.jsx)(_Chk,{k:`breathe`,label:`Breathing animation`,hint:`The lungs and diaphragm move as in quiet breathing (15 breaths a minute).`}),
(0,X.jsx)(`button`,{type:`button`,className:`av-btn av-btn--sm self-start`,onClick:()=>{let _s=D.getState();for(let _l of[`skin`,`muscles`,`bones`,`vessels`,`nerves`,`organs`])_s.setLayerOpacity(_l,_l===`skin`?.08:1);_s.setSystemFocus(`respiratory`);_avb.set({inside:!1});setTimeout(()=>D.getState().focusStructure(`bronchial-tree`),200)},children:`Show the lungs in the chest`})]})}
'''
l=sub1(l,'function Te(){',LUNG+'function Te(){')
l=sub1(l,'(0,X.jsx)(_BrainLayers,{})]}','(0,X.jsx)(_BrainLayers,{}),e.modelId===`schematic-body-v1`&&(0,X.jsx)(_LungLayers,{})]}') if False else l
l=sub1(l,'e.modelId===`schematic-body-v1`&&(0,X.jsx)(_BrainLayers,{})','e.modelId===`schematic-body-v1`&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(_BrainLayers,{}),(0,X.jsx)(_LungLayers,{})]})')
wr(L,l)


LF=r'''function _LungFlow(){let _g=_useAvb(),[_d,_sd]=(0,k.useState)(globalThis.__lfc??null),_gr=(0,k.useRef)(null),_ref=(0,k.useRef)(null),{invalidate:_inv}=b();
(0,k.useEffect)(()=>{_g.airflow&&!_d&&fetch(`./models/lung-flow.json`).then(_r=>_r.json()).then(_j=>{globalThis.__lfc=_j,_sd(_j)}).catch(()=>{})},[_g.airflow,_d]);
let _per=7,_cv=(0,k.useMemo)(()=>_d?_d.air.map(_a=>{let _pts=[];for(let _j=0;_j+2<_a.length;_j+=3)_pts.push(new y(_a[_j]/1e4,_a[_j+1]/1e4,_a[_j+2]/1e4));return _pts.length>1?new x(_pts,!1,`centripetal`):null}):[],[_d]),_n=_cv.length*_per,
_ph=(0,k.useMemo)(()=>Float32Array.from({length:_n},(_u,_j)=>(_j%_per)/_per+Math.random()*.05),[_n]),
_geo=(0,k.useMemo)(()=>new i(.0015,6,5),[]),_mat=(0,k.useMemo)(()=>new n({color:16777215,depthTest:!1,transparent:!0,opacity:.9}),[]),_dm=(0,k.useMemo)(()=>new ce,[]),
_cc=(0,k.useMemo)(()=>{let _C=_mat.color.constructor;return{a:new _C(`#c8ecff`),b:new _C(`#ffb48c`)}},[_mat]);
p((_e,_dt)=>{let _gp=_gr.current;if(!_gp||!_d)return;_dt=Math.min(_dt,.1);let _tt=performance.now()/1e3,_vs=Math.sin(_tt*Math.PI*2/4),_dir=_vs>=0?1:-1,_sp=.06+.28*Math.abs(_vs);
if(_g.breathe){let _b=.5-.5*Math.cos(_tt*Math.PI*2/4),_sx=1+.03*_b,_sy=1+.075*_b,_sz=1+.045*_b;_gp.scale.set(_sx,_sy,_sz);_gp.position.set(0,1.425*(1-_sy),.015*(1-_sz))}else{_gp.scale.set(1,1,1);_gp.position.set(0,0,0)}
let _m=_ref.current;if(!_m)return;_mat.color.copy(_vs>=0?_cc.a:_cc.b);
for(let _j=0;_j<_n;_j++){let _cu=_cv[Math.floor(_j/_per)];if(!_cu)continue;let _f=(_ph[_j]+_dir*_dt*_sp+1)%1;_ph[_j]=_f;let _s=_f<.06?_f/.06:_f>.94?(1-_f)/.06:1;_dm.position.copy(_cu.getPointAt(_f));_dm.scale.setScalar(Math.max(_s,.001));_dm.updateMatrix();_m.setMatrixAt(_j,_dm.matrix)}
_m.instanceMatrix.needsUpdate=!0;_inv()});
return _g.airflow&&_d&&_n>0?(0,A.jsx)(`group`,{ref:_gr,children:(0,A.jsx)(`instancedMesh`,{ref:_ref,args:[_geo,_mat,_n],renderOrder:10,frustumCulled:!1,raycast:()=>void 0})}):null}
'''

v=rd(V)
v=sub1(v,'function _BrainFlow(){',LF+'function _BrainFlow(){')
v=sub1(v,'(0,A.jsx)(_BrainFlow,{}),c.map(','(0,A.jsx)(_BrainFlow,{}),t&&(0,A.jsx)(_LungFlow,{}),c.map(')
wr(V,v)
l=rd(L)
l=sub1(l,'(0,X.jsx)(_Chk,{k:`breathe`,label:`Breathing animation`,hint:`The lungs and diaphragm move as in quiet breathing (15 breaths a minute).`}),','(0,X.jsx)(_Chk,{k:`breathe`,label:`Breathing animation`,hint:`The lungs and diaphragm move as in quiet breathing (15 breaths a minute).`}),(0,X.jsx)(_Chk,{k:`airflow`,sub:!0,label:`Air flow`,hint:`Blue dots: air going in. Orange dots: air going out.`}),(0,X.jsx)(_Chk,{k:`inside`,label:`See inside the lungs`,hint:`Makes the lobes transparent to show the bronchial tree, the small airways and the alveoli (drawn larger than real).`}),')
wr(L,l)

# ---------- magnified alveolus close-up ----------
for f in ('anatomyverse-alveoli.glb.json','alveoli-flow.json'): shutil.copy('/home/claude/brain3d/'+f,DST+'/models/')
def r4(id,name,latin,syn,parent,loc,desc,fn,clin):
    r=rec(id,name,latin,syn,parent,'organs',loc,desc,fn,clin,system='respiratory',region='thorax')
    return r.replace('y(v.nervousAnatomy)','y(v.respiratory)')
AR=[
 r4('respiratory-bronchiole','Respiratory bronchiole','Bronchiolus respiratorius',[],'bronchioles','The last airways of the bronchial tree, at the edge of the lung tissue.','A tiny airway, about 0.5 mm wide, whose wall has a few alveoli budding from it, so some gas exchange already takes place here.','Leads air from the terminal bronchioles to the alveolar ducts.','Damaged in emphysema and in smoking-related small airway disease.'),
 r4('alveolar-duct','Alveolar duct','Ductus alveolaris',[],'alveoli','Between the respiratory bronchiole and the alveolar sacs.','A short passage whose walls are almost entirely made of the openings of alveoli.','Brings air to the clusters of alveoli (alveolar sacs).','Fibrosis and emphysema destroy or scar the walls of the alveolar ducts and sacs.'),
 r4('pulmonary-capillaries','Pulmonary capillaries','Vasa capillaria pulmonalia',['alveolar capillaries'],None,'In the alveolar walls, wrapped around every alveolus.','A dense net of capillaries about 7 micrometres wide. A red blood cell passes through in under a second. The wall is shared with the alveolus, so the blood-air barrier is only about 0.5 micrometres thick.','Blood picks up oxygen from the alveolar air and gives up carbon dioxide. The red blood cells here turn from dark purple to bright red.','Pulmonary oedema (fluid leaks into the alveoli), pulmonary embolism (a clot blocks the flow) and pulmonary fibrosis (a thick wall slows gas exchange).'),
 r4('pulmonary-arteriole','Pulmonary arteriole','Arteriola pulmonalis',[],None,'Beside the respiratory bronchioles and alveolar ducts.','A small branch of the pulmonary artery. It carries blood low in oxygen (shown blue) to the capillaries.','Delivers deoxygenated blood from the right heart to the alveolar capillaries.','Narrows in response to low oxygen (to match blood flow to ventilation); pulmonary hypertension develops when it stays narrowed.'),
 r4('pulmonary-venule','Pulmonary venule','Venula pulmonalis',[],None,'Between the alveoli, joining to form the pulmonary veins.','A small vessel that collects blood rich in oxygen (shown red) from the capillaries.','Returns oxygenated blood towards the pulmonary veins and the left atrium.','Congestion of these veins from left heart failure causes breathlessness and fluid in the lungs.'),
 r4('type-ii-pneumocyte','Type II pneumocyte','Pneumocytus granularis',['type 2 alveolar cell','great alveolar cell'],'alveoli','Scattered in the corners of the alveolar wall.','A rounded cell that makes surfactant and can divide to repair the wall. It makes up about 5% of the alveolar surface, but about 60% of the cells.','Makes surfactant, a film of fat and protein that lowers surface tension so that the alveoli do not collapse when you breathe out.','Premature babies lack surfactant and develop respiratory distress syndrome. Damage to these cells contributes to ARDS and to pulmonary fibrosis.'),
 r4('alveolar-macrophage','Alveolar macrophage','Macrophagus alveolaris',['dust cell'],'alveoli','Free on the inner surface of the alveoli.','A scavenger white cell that lives in the alveolar air space.','Engulfs dust, bacteria and other particles that get past the airway defences.','Overloaded macrophages in smokers and in silicosis release enzymes and signals that damage the lungs; in tuberculosis the bacteria live inside macrophages.'),
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
m=m[:i]+','+','.join(AR)+m[i:]
am={'id':'anatomyverse-alveoli','name':'Alveoli close-up (gas exchange)','kind':'gltf','url':'./models/anatomyverse-alveoli.glb.json','fidelity':'schematic',
 'license':'AnatomyVerse schematic model','attribution':'Schematic model made for AnatomyVerse. It is magnified about 200 times and is not to scale; the number of alveoli and capillary loops is simplified.',
 'description':'A cluster of alveoli with the capillaries around them, showing the exchange of oxygen and carbon dioxide.','offset':[-0.075,1.2,0],'objectMap':json.load(open('/home/claude/brain3d/alveoli_objectmap.json'))}
tail='],D=`schematic-body-v1`'; assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(am,ensure_ascii=False)+tail)
wr(MAN,m)
v=rd(V)
GD=r'''function _GDots({routes:_r,per:_per,speed:_sp,rad:_rd,c1:_c1,c2:_c2,mode:_mo}){let _ref=(0,k.useRef)(null),_n=_r.length*_per,{invalidate:_inv}=b(),
_cv=(0,k.useMemo)(()=>_r.map(_a=>{let _pts=[];for(let _j=0;_j+2<_a.length;_j+=3)_pts.push(new y(_a[_j]/1e4,_a[_j+1]/1e4,_a[_j+2]/1e4));return _pts.length>1?new x(_pts,!1,`centripetal`):null}),[_r]),
_ph=(0,k.useMemo)(()=>Float32Array.from({length:_n},(_u,_j)=>(_j%_per)/_per+Math.random()*.08),[_n,_per]),
_geo=(0,k.useMemo)(()=>new i(_rd,8,6),[_rd]),_mat=(0,k.useMemo)(()=>new n({color:16777215,transparent:!0,opacity:.95}),[]),_dm=(0,k.useMemo)(()=>new ce,[]),
_cc=(0,k.useMemo)(()=>{let _C=_mat.color.constructor;return{a:new _C(_c1),b:new _C(_c2),t:new _C}},[_mat,_c1,_c2]);
p((_e,_dt)=>{let _m=_ref.current;if(!_m)return;_dt=Math.min(_dt,.1);let _tt=performance.now()/1e3,_vs=Math.sin(_tt*Math.PI*2/4),_dir=_mo===`air`?(_vs>=0?1:-1):1,_spd=_mo===`air`?_sp*(.2+Math.abs(_vs)):_sp;
for(let _j=0;_j<_n;_j++){let _cu=_cv[Math.floor(_j/_per)];if(!_cu)continue;let _f=(_ph[_j]+_dir*_dt*_spd+1)%1;_ph[_j]=_f;let _s=_f<.08?_f/.08:_f>.92?(1-_f)/.08:1;_dm.position.copy(_cu.getPointAt(_f));_dm.scale.setScalar(Math.max(_s,.001));_dm.updateMatrix();_m.setMatrixAt(_j,_dm.matrix);_cc.t.copy(_cc.a).lerp(_cc.b,_f);_m.setColorAt(_j,_cc.t)}
_m.instanceMatrix.needsUpdate=!0;_m.instanceColor&&(_m.instanceColor.needsUpdate=!0);_inv()});
return(0,A.jsx)(`instancedMesh`,{ref:_ref,args:[_geo,_mat,_n],renderOrder:10,frustumCulled:!1,raycast:()=>void 0})}
function _AlvFlow(){let [_d,_sd]=(0,k.useState)(globalThis.__alf??null);(0,k.useEffect)(()=>{_d||fetch(`./models/alveoli-flow.json`).then(_r=>_r.json()).then(_j=>{globalThis.__alf=_j,_sd(_j)}).catch(()=>{})},[_d]);
return _d?(0,A.jsxs)(`group`,{position:_d.off,children:[(0,A.jsx)(_GDots,{routes:_d.rbc,per:4,speed:.07,rad:.0032,c1:`#5a62dc`,c2:`#ff3d3d`}),(0,A.jsx)(_GDots,{routes:_d.art,per:12,speed:.09,rad:.0042,c1:`#5a62dc`,c2:`#6f67e0`}),(0,A.jsx)(_GDots,{routes:_d.ven,per:14,speed:.09,rad:.0046,c1:`#ff4a3f`,c2:`#ff4a3f`}),(0,A.jsx)(_GDots,{routes:_d.o2,per:1,speed:.3,rad:.0017,c1:`#8defff`,c2:`#8defff`}),(0,A.jsx)(_GDots,{routes:_d.co2,per:1,speed:.3,rad:.0017,c1:`#ffb259`,c2:`#ffb259`}),(0,A.jsx)(_GDots,{routes:_d.air,per:8,speed:.5,rad:.0030,c1:`#dff3ff`,c2:`#dff3ff`,mode:`air`})]}):null}
'''
v=sub1(v,'function _BrainFlow(){',GD+'function _BrainFlow(){')
v=sub1(v,'(0,A.jsx)(jt,{asset:t}):null}','(0,A.jsxs)(k.Fragment,{children:[(0,A.jsx)(jt,{asset:t}),t.id===`anatomyverse-alveoli`&&(0,A.jsx)(_AlvFlow,{})]}):null}')
wr(V,v)
l=rd(L)
LUNGSET=['right-lung','left-lung','right-upper-lobe','right-middle-lobe','right-lower-lobe','left-upper-lobe','left-lower-lobe','bronchial-tree','bronchioles','alveoli','trachea','right-main-bronchus','left-main-bronchus','diaphragm','pleura']
l=sub1(l,'var Ce=new Set([','var _LS=new Set('+json.dumps(LUNGSET)+');var Ce=new Set([')
btn=("(_LS.has(n.id)||n.parentId===`alveoli`||n.parentId===`bronchioles`)&&p.modelId!==`anatomyverse-alveoli`&&(0,X.jsxs)(`button`,{type:`button`,className:`av-btn`,onClick:()=>{_goModel(`anatomyverse-alveoli`,`alveoli`)},children:[(0,X.jsx)(d,{size:15,\"aria-hidden\":!0}),` Alveoli close-up: gas exchange`]}),"
     "p.modelId===`anatomyverse-alveoli`&&(0,X.jsxs)(`button`,{type:`button`,className:`av-btn`,onClick:()=>{_goModel(`schematic-body-v1`,`right-lung`)},children:[(0,X.jsx)(A,{size:15,\"aria-hidden\":!0}),` Back to the full-body model`]}),")
anchor="(n.id===`heart`||n.parentId===`heart`)&&P&&"
l=sub1(l,anchor,btn+anchor)
wr(L,l)

# ---------- fill missing "common problems" for hover cards ----------
CLIN={
"scapula":"Fractures are uncommon and mean a high-energy injury. Winging of the scapula follows injury to the long thoracic nerve. Shoulder impingement under the acromion is common.",
"ulna":"Fractures of the shaft (nightstick fracture) and the olecranon, and the Monteggia fracture-dislocation. The ulnar nerve can be squeezed at the elbow (cubital tunnel syndrome).",
"hip-bone":"Pelvic fractures after trauma can bleed heavily. Hip dysplasia and femoroacetabular impingement affect the socket (acetabulum).",
"patella":"Dislocation, fracture after a fall on the knee, patellofemoral pain and chondromalacia (softening of the cartilage under the kneecap).",
"tibia":"The commonest long bone fracture; it can cause compartment syndrome. Also shin splints, plateau fractures at the knee and bone infection (osteomyelitis).",
"triceps-brachii":"Tendon rupture is rare. Radial nerve injury paralyses it. The triceps reflex tests the C7 nerve root.",
"pectoralis-major":"Rupture during weightlifting, strain, and congenital absence in Poland syndrome.",
"rectus-abdominis":"Diastasis recti (the two halves separate) after pregnancy, hernias through the midline, and muscle strains.",
"right-atrium":"Atrial fibrillation and flutter, atrial septal defects, and enlargement in tricuspid valve disease.",
"right-ventricle":"Right heart failure (cor pulmonale) from lung disease or pulmonary hypertension, arrhythmogenic right ventricular cardiomyopathy and tetralogy of Fallot.",
"left-ventricle":"Heart attack (myocardial infarction), heart failure, thickening (hypertrophy) from high blood pressure or aortic stenosis, and cardiomyopathy.",
"tricuspid-valve":"Regurgitation (endocarditis in people who inject drugs, Ebstein anomaly) and stenosis. It causes swollen neck veins and leg swelling.",
"pulmonary-valve":"Congenital stenosis, and regurgitation after repair of tetralogy of Fallot.",
"mitral-valve":"Stenosis (usually from rheumatic fever), regurgitation and prolapse. They lead to breathlessness and atrial fibrillation.",
"aortic-valve":"Aortic stenosis (calcification in older adults or a bicuspid valve) causes chest pain, fainting and breathlessness. Regurgitation causes a large pulse pressure.",
"cardiac-veins":"The coronary sinus is used for pacing leads in cardiac resynchronisation. A persistent left superior vena cava drains into it.",
"pulmonary-trunk":"Pulmonary embolism blocks its branches, pulmonary hypertension widens it, and a patent ductus arteriosus joins it.",
"superior-vena-cava":"Superior vena cava syndrome from lung cancer or lymphoma causes swelling of the face and arms. Thrombosis around central lines.",
"inferior-vena-cava":"Compression by the womb in late pregnancy causes low blood pressure when lying on the back. Clot filters, and tumour growth into it (for example renal cell carcinoma).",
"common-iliac-artery":"Atherosclerosis and aneurysm. Blockage causes pain in the buttock and legs on walking (claudication), and Leriche syndrome.",
"brain":"Stroke, dementia (including Alzheimer disease), brain tumours, epilepsy, Parkinson disease, head injury and meningitis.",
"cerebrum":"Stroke, epilepsy, tumours and dementia. Damage to each lobe gives its own deficit, for example language loss (aphasia), neglect or loss of vision.",
"brainstem":"Brainstem stroke (can cause locked-in syndrome), herniation causing coma and death, and multiple sclerosis. It controls breathing and heartbeat.",
"axillary-nerve":"Injured by shoulder dislocation or a fracture of the surgical neck of the humerus: deltoid weakness and a patch of numbness over the shoulder.",
"musculocutaneous-nerve":"Injury weakens bending of the elbow and turning the palm up, with numbness of the outer forearm. It can be hurt in shoulder injuries or surgery.",
"phrenic-nerve":"Injury paralyses half of the diaphragm (it rises on a chest x-ray); causes include neck or chest surgery and lung cancer. Irritation of the diaphragm gives pain at the tip of the shoulder, and hiccups.",
"vagus-nerve":"Vasovagal fainting, vocal cord paralysis after injury to its recurrent laryngeal branch (thyroid surgery) and delayed stomach emptying (gastroparesis).",
"femoral-nerve":"Injury in pelvic surgery, diabetes or a groin bleed weakens knee extension, with numbness of the front of the thigh and inner leg and a lost knee jerk.",
"tibial-nerve":"Tarsal tunnel syndrome at the ankle. Injury weakens pointing the foot down and causes numbness of the sole.",
"nasal-cavity":"Allergic rhinitis, sinusitis, nosebleeds (epistaxis), a deviated septum and nasal polyps.",
"pharynx":"Pharyngitis and tonsillitis, obstructive sleep apnoea, difficulty swallowing (dysphagia) and nasopharyngeal cancer.",
"larynx":"Laryngitis, croup and epiglottitis, vocal cord nodules or paralysis, laryngeal cancer (mostly in smokers) and airway obstruction.",
"left-main-bronchus":"It is narrower and more horizontal than the right, so inhaled objects go right more often. Lung cancer or enlarged lymph nodes at the carina can narrow it.",
"right-lung":"Pneumonia, tuberculosis, lung cancer, pulmonary embolism, pneumothorax, COPD and asthma. Inhaled objects and aspirated fluid pass more often into the right lung.",
"left-lung":"Pneumonia, lung cancer, pneumothorax, COPD and asthma. Fluid from heart failure collects in both lungs.",
"oral-cavity":"Dental caries, gum disease, oral thrush, mouth ulcers and oral cancer (tobacco and alcohol).",
"oesophagus":"Acid reflux (GORD) and Barrett oesophagus, oesophageal cancer, varices in liver disease, achalasia and strictures.",
"stomach":"Peptic ulcers (H. pylori, anti-inflammatory drugs), gastritis, stomach cancer, reflux and delayed emptying.",
"liver":"Hepatitis, fatty liver disease, cirrhosis, liver cancer and jaundice.",
"gallbladder":"Gallstones, cholecystitis (inflammation) and biliary colic. Cancer is rare.",
"pancreas":"Pancreatitis, pancreatic cancer, diabetes mellitus and cystic fibrosis.",
"small-intestine":"Coeliac disease, Crohn disease, duodenal ulcers and bowel obstruction (adhesions, hernias).",
"large-intestine":"Colorectal cancer, ulcerative colitis, diverticulitis, irritable bowel syndrome and appendicitis.",
"rectum":"Haemorrhoids, anal fissures, rectal cancer and rectal prolapse.",
"kidney":"Kidney stones, urinary infection and pyelonephritis, chronic kidney disease, glomerulonephritis and tumours.",
"urinary-bladder":"Cystitis, bladder cancer, bladder stones, urinary retention (for example with an enlarged prostate) and incontinence.",
"urethra":"Urethritis, strictures, injury in pelvic fractures and hypospadias.",
"scrotum":"Hydrocele, varicocele, testicular torsion (an emergency), epididymitis and inguinal hernia.",
"ovary":"Ovarian cysts, polycystic ovary syndrome, ovarian cancer, torsion and endometriosis.",
"uterus":"Fibroids, endometriosis, endometrial and cervical cancer, prolapse and heavy periods.",
"thyroid-gland":"Hypothyroidism, hyperthyroidism (Graves disease), goitre, nodules and thyroid cancer.",
"parathyroid-glands":"Hyperparathyroidism causes high calcium, kidney stones and bone loss. Low calcium after thyroid surgery causes tingling and cramps.",
"adrenal-gland":"Cushing syndrome, Addison disease, phaeochromocytoma and Conn syndrome.",
"thymus":"Myasthenia gravis, thymoma, and DiGeorge syndrome (a missing thymus with repeated infections).",
"palatine-tonsils":"Tonsillitis, peritonsillar abscess (quinsy) and obstructed breathing in sleep in children.",
"skin":"Eczema, psoriasis, acne, skin infections, skin cancer (including melanoma) and burns.",
"epidermis":"Sunburn, psoriasis, basal and squamous cell carcinoma and blistering diseases such as pemphigus.",
"dermis":"Deep burns, scars and keloids, and connective tissue diseases.",
"hypodermis":"Cellulitis, pressure sores and fat necrosis. It is the site for insulin and other injections under the skin.",
"skin-appendages":"Hair loss (alopecia), acne (sebaceous glands), nail fungus and excessive sweating.",
"eye":"Cataract, glaucoma, macular degeneration, diabetic retinopathy, refractive errors and retinal detachment.",
"ear":"Otitis media and externa, hearing loss, tinnitus, vertigo (Meniere disease) and cholesteatoma.",
"olfactory-epithelium":"Loss of smell (anosmia) after viral infection, head injury or nasal polyps. It can be an early sign of Parkinson and Alzheimer disease.",
"taste-buds":"Loss or change of taste from infection, zinc deficiency, medicines or chemotherapy.",
}
m=rd(MAN); done=0
for sid,txt in CLIN.items():
    mm=re.search(r'\{id:`'+re.escape(sid)+r'`,name:`[^`]+`.*?reviewStatus:b\}',m,re.S)
    if not mm: print('NOREC',sid); continue
    rec_=mm.group(0)
    if 'clinicalRelevance' in rec_: continue
    new=rec_.replace(',sources:',',clinicalRelevance:`'+txt+'`,sources:',1)
    assert new!=rec_,sid
    m=m.replace(rec_,new,1); done+=1
print('clinical filled',done)
wr(MAN,m)

CLIN2={
"insula":"Stroke in the middle cerebral artery territory can damage it, causing loss of taste, altered pain perception and difficulty speaking. It can be the focus of seizures.",
"deep-cerebral-structures":"Basal ganglia damage causes Parkinson disease and Huntington disease. Deep (lacunar) strokes from high blood pressure affect the thalamus and internal capsule.",
"hypothalamus":"Disorders cause diabetes insipidus and disturbed temperature, sleep, appetite and hormone control. Tumours such as craniopharyngioma press on it.",
"pons":"Pontine stroke can cause locked-in syndrome. Central pontine myelinolysis follows too rapid correction of low blood sodium. Basilar artery blockage affects it.",
"third-ventricle":"A colloid cyst can block the interventricular foramina and cause hydrocephalus. Tumours of the pineal region press on the nearby aqueduct.",
"fourth-ventricle":"Blocked outflow (Dandy-Walker malformation, medulloblastoma, ependymoma) causes hydrocephalus. Bleeding from the cerebellum can burst into it.",
"posterior-choroidal-arteries":"Blockage contributes to infarcts in the thalamus and next to the ventricles. They feed the choroid plexus that makes CSF.",
"inferior-sagittal-sinus":"It is rarely blocked on its own. Thrombosis of the venous sinuses in general causes headache, seizures and venous infarcts.",
"straight-sinus":"Thrombosis causes deep venous infarction of the thalamus and basal ganglia, with headache and drowsiness or coma.",
"internal-cerebral-veins":"Thrombosis causes infarction of both thalami with drowsiness and coma.",
"petrosal-sinuses":"Inferior petrosal sinus sampling is used to find the source of Cushing disease. Ear infection (mastoiditis) can spread to them.",
}
m=rd(MAN); done=0
for sid,txt in CLIN2.items():
    mm=re.search(r'\{"id": "'+re.escape(sid)+r'", "name".*?"reviewStatus"',m,re.S)
    if not mm: print('NOREC2',sid); continue
    rec_=mm.group(0)
    if 'clinicalRelevance' in rec_: continue
    new=rec_.replace(',"sources":',', "clinicalRelevance": "'+txt+'","sources":',1); assert new!=rec_,sid
    m=m.replace(rec_,new,1); done+=1
print('clinical2 filled',done); wr(MAN,m)

# ---------- double-click: pop an organ out / put it back ----------
v=rd(V)
v=sub1(v,'var _avb=globalThis.__avb??=','var _avb=globalThis.__avb??=') if False else v
POP=r'''function _popToggle(e,t){let _s=_avb.get();if(_s.pop){_avb.set({pop:null});return}
let _root=e.object;for(;_root.parent;)_root=_root.parent;let _mn=[1e9,1e9,1e9],_mx=[-1e9,-1e9,-1e9],_v=new y;
_root.traverse(_o=>{let _sid=_o.userData&&_o.userData.structureId;if(!_o.isMesh||!_sid||!_o.visible||!E(_sid,t,w))return;let _g=_o.geometry;_g.boundingBox||_g.computeBoundingBox();let _b=_g.boundingBox;_o.updateWorldMatrix(!0,!1);for(let _i=0;_i<8;_i++){_v.set(_i&1?_b.max.x:_b.min.x,_i&2?_b.max.y:_b.min.y,_i&4?_b.max.z:_b.min.z).applyMatrix4(_o.matrixWorld);let _q=[_v.x,_v.y,_v.z];for(let _a=0;_a<3;_a++){_q[_a]<_mn[_a]&&(_mn[_a]=_q[_a]);_q[_a]>_mx[_a]&&(_mx[_a]=_q[_a])}}});
if(_mn[0]>1e8)return;let _c=_mn.map((_q,_a)=>(_q+_mx[_a])/2),_cp=e.camera.position,_d=[_cp.x-_c[0],_cp.y-_c[1],_cp.z-_c[2]],_L=Math.hypot(_d[0],_d[1],_d[2])||1;_d=_d.map(_q=>_q/_L);_avb.set({pop:{id:t,c:_c,d:_d,dist:_L*.4}})}
function _PopHud(){let _g=_useAvb();return _g.pop?(0,A.jsxs)(`div`,{style:{position:`absolute`,left:`50%`,bottom:64,transform:`translateX(-50%)`,zIndex:12,display:`flex`,gap:10,alignItems:`center`,padding:`8px 14px`,borderRadius:999,background:`var(--av-surface)`,border:`1px solid var(--av-border)`,color:`var(--av-text)`,fontSize:12,boxShadow:`0 6px 20px rgba(0,0,0,.35)`},children:[(0,A.jsxs)(`span`,{children:[`Showing: `,(0,A.jsx)(`b`,{children:w[_g.pop.id]?.name??_g.pop.id}),` - double-click it again to put it back`]}),(0,A.jsx)(`button`,{type:`button`,className:`av-btn av-btn--sm`,onClick:()=>_avb.set({pop:null}),children:`Put back`})]}):null}
'''
v=sub1(v,'function _BrainFlow(){',POP+'function _BrainFlow(){')
v=sub1(v,'(0,k.useEffect)(()=>l.current&&!o?Pe(t,l.current):void 0,[t,o]);','''let _kr=(0,k.useRef)(0),_lp=(0,k.useRef)(null),{invalidate:_pv}=b();p((_s,_dt)=>{let _m=l.current;if(!_m)return;let _po=_avb.get().pop;_po&&(_lp.current=_po);let _tg=_po&&E(t,_po.id,w)?1:0,_k0=_kr.current;if(_k0===_tg&&_tg===0)return;let _k1=_tg>_k0?Math.min(1,_k0+_dt*2.6):Math.max(0,_k0-_dt*2.6);_kr.current=_k1;let _ke=_k1*_k1*(3-2*_k1),_pp=_lp.current;if(!_pp||_k1===0){_m.scale.set(1,1,1);_m.position.set(0,0,0);_pv();return}let _sc=1+.9*_ke;_m.scale.set(_sc,_sc,_sc);_m.position.set(_pp.c[0]*(1-_sc)+_pp.d[0]*_pp.dist*_ke,_pp.c[1]*(1-_sc)+_pp.d[1]*_pp.dist*_ke,_pp.c[2]*(1-_sc)+_pp.d[2]*_pp.dist*_ke);_pv()});(0,k.useEffect)(()=>l.current&&!o?Pe(t,l.current):void 0,[t,o]);''')
v=sub1(v,'onClick:e=>{!m.pickable||e.delta>5||(e.stopPropagation(),f(t))},','onClick:e=>{!m.pickable||e.delta>5||(e.stopPropagation(),f(t))},onDoubleClick:e=>{m.pickable&&(e.stopPropagation(),_popToggle(e,t))},')
v=sub1(v,'(0,A.jsx)(Bt,{}),(0,A.jsx)(zt,{}),','(0,A.jsx)(Bt,{}),(0,A.jsx)(_PopHud,{}),(0,A.jsx)(zt,{}),')
# hide particle layers and stop breathing while an organ is popped
v=sub1(v,'return _d?(0,A.jsxs)(`group`,{name:`brain-flow`,','return _d&&!_g.pop?(0,A.jsxs)(`group`,{name:`brain-flow`,')
v=sub1(v,'return _g.airflow&&_d&&_n>0?','return _g.airflow&&!_g.pop&&_d&&_n>0?')
v=sub1(v,'if(_ga.breathe){let _tt=performance.now()/1e3','if(_ga.breathe&&!_avb.get().pop){let _tt=performance.now()/1e3')
wr(V,v)
for ch in (V,L):
    t=rd(ch); t=sub1(t,'airflow:!0,inside:!1}','airflow:!0,inside:!1,pop:null}'); wr(ch,t)

# ---------- click card: function + what goes wrong ----------
v=rd(V)
SEL=r'''function _SelCard(){let _id=D(e=>e.selectedId),_md=D(e=>e.mode),_sel=D(e=>e.select),[_p,_sp]=(0,k.useState)(null);
(0,k.useEffect)(()=>{if(!_id)return _sp(null);let _lc=globalThis.__lcp;globalThis.__lcp=null;_sp(_lc?[Math.min(_lc[0]+16,window.innerWidth-380),Math.min(Math.max(_lc[1]-40,70),window.innerHeight-330)]:[Math.min(600,window.innerWidth-380),90])},[_id]);
let _n=_id?w[_id]:null;if(!_n||!_p||_md===`identify`)return null;
let _cl=(_n.clinicalRelevance||``).split(/(?<=[.!?])\s+/).filter(Boolean).slice(0,4);
return(0,A.jsxs)(`div`,{role:`dialog`,"aria-label":_n.name+` summary`,style:{position:`fixed`,left:_p[0],top:_p[1],width:360,maxHeight:`min(60vh,420px)`,overflowY:`auto`,zIndex:55,background:`var(--av-surface)`,border:`1px solid var(--av-border)`,borderRadius:14,padding:`12px 14px`,boxShadow:`0 12px 36px rgba(0,0,0,.45)`,color:`var(--av-text)`,fontSize:13,lineHeight:1.45},children:[
(0,A.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,gap:8,alignItems:`flex-start`},children:[(0,A.jsxs)(`div`,{children:[(0,A.jsx)(`div`,{style:{fontWeight:700,fontSize:16},children:_n.name}),_n.latinName&&(0,A.jsx)(`div`,{style:{fontStyle:`italic`,opacity:.7,fontSize:12},children:_n.latinName})]}),(0,A.jsx)(`button`,{type:`button`,"aria-label":`Close`,onClick:()=>_sel(null),style:{border:0,background:`transparent`,color:`inherit`,fontSize:20,lineHeight:1,cursor:`pointer`,opacity:.7},children:`×`})]}),
(0,A.jsx)(`div`,{style:{fontSize:10,letterSpacing:`.06em`,textTransform:`uppercase`,color:`#6fd3b5`,fontWeight:700,margin:`10px 0 2px`},children:`Function`}),
(0,A.jsx)(`div`,{children:_n.function||_n.description}),
_cl.length>0&&(0,A.jsxs)(k.Fragment,{children:[(0,A.jsx)(`div`,{style:{fontSize:10,letterSpacing:`.06em`,textTransform:`uppercase`,color:`#ff9d6b`,fontWeight:700,margin:`10px 0 2px`},children:`When it goes wrong: diseases`}),(0,A.jsx)(`ul`,{style:{margin:0,paddingLeft:18},children:_cl.map((_t,_i)=>(0,A.jsx)(`li`,{style:{marginBottom:2},children:_t},_i))})]}),
(0,A.jsx)(`div`,{style:{opacity:.55,fontSize:11,marginTop:8},children:`More detail is in the panel on the right.`})]})}
'''
v=sub1(v,'function _BrainFlow(){',SEL+'function _BrainFlow(){')
v=sub1(v,'(0,A.jsx)(_PopHud,{}),','(0,A.jsx)(_PopHud,{}),(0,A.jsx)(_SelCard,{}),')
v=sub1(v,'onClick:e=>{!m.pickable||e.delta>5||(e.stopPropagation(),f(t))},','onClick:e=>{!m.pickable||e.delta>5||(e.stopPropagation(),globalThis.__lcp=[e.nativeEvent.clientX,e.nativeEvent.clientY],f(t))},')
# hide hover card when the same part is already pinned
v=sub1(v,'if(!n||t===`identify`)return null;let _d=','if(!n||t===`identify`||e===D.getState().selectedId)return null;let _d=')
wr(V,v)
exec(open('/home/claude/brain3d/patch3e.py').read())
exec(open('/home/claude/brain3d/patch3f.py').read())
exec(open('/home/claude/brain3d/patch3g.py').read())
exec(open('/home/claude/brain3d/patch3h.py').read())
