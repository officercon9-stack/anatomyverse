import json,re,os,shutil,glob
SRC='/home/claude/av-src'; DST='/home/claude/av-build'
if os.path.exists(DST): shutil.rmtree(DST)
os.makedirs(DST+'/assets'); os.makedirs(DST+'/models'); os.makedirs(DST+'/data'); os.makedirs(DST+'/icons')
for f in os.listdir(SRC+'/assets'): shutil.copy(f'{SRC}/assets/{f}',f'{DST}/assets/{f}')
shutil.copy(SRC+'/models/zanatomy-heart.glb.json',DST+'/models/'); shutil.copy(SRC+'/data/ta2.json',DST+'/data/'); shutil.copy(SRC+'/icons/logo.svg',DST+'/icons/')
shutil.copy('bodyparts3d-brain-skull.glb.json',DST+'/models/'); shutil.copy('bodyparts3d-brain-only.glb.json',DST+'/models/')
# original entry page (inner document, no floating link)
o=open('/home/claude/anatomyverse/index.original.html').read()
inner=o[o.index('<!doctype html>\n<html lang="en">'):]; inner=inner[:inner.rindex('</body></html>')].rstrip()+'\n'
open(DST+'/index.html','w').write(inner)
def rd(p): return open(f'{DST}/{p}').read()
def wr(p,s): open(f'{DST}/{p}','w').write(s)
def sub1(s,a,b):
    assert s.count(a)==1,(a[:80],s.count(a)); return s.replace(a,b)

# ---------- 1. manifest: structures + model ----------
MAN='assets/assetManifest-D3o27EUe.js'; m=rd(MAN)
def rec(id,name,latin,syn,parent,layer,loc,desc,fn,clin='',system='nervous',region='head'):
    d={'id':id,'name':name}
    if latin: d['latinName']=latin
    d['synonyms']=syn; d['system']=system; d['region']=region; d['layer']=layer
    if parent: d['parentId']=parent
    d['location']=loc; d['description']=desc; d['function']=fn
    if clin: d['clinicalRelevance']=clin
    js=json.dumps(d,ensure_ascii=False)
    return js[:-1]+',"sources":y(v.nervousAnatomy),"reviewStatus":b}'
R=[
 rec('frontal-lobe','Frontal lobe','Lobus frontalis',['frontal cortex'],'cerebrum','nerves','Front of each cerebral hemisphere, ahead of the central sulcus and above the lateral sulcus.','The largest lobe of the cerebrum. Its precentral gyrus holds the primary motor cortex; the prefrontal region lies in front of it.','Planning, decision making, personality, attention and voluntary movement. In the dominant hemisphere Broca\'s area helps produce speech.','Damage can change personality, judgement and motivation, and cause weakness on the opposite side of the body.'),
 rec('parietal-lobe','Parietal lobe','Lobus parietalis',['parietal cortex'],'cerebrum','nerves','Upper back part of each hemisphere, between the central sulcus and the occipital lobe.','Contains the postcentral gyrus (primary somatosensory cortex) and association areas for space and body position.','Processes touch, pain, temperature and position sense, and builds awareness of space and of the body.','Damage can cause neglect of one side of space, or trouble reading and calculating when the dominant side is affected.'),
 rec('temporal-lobe','Temporal lobe','Lobus temporalis',['temporal cortex'],'cerebrum','nerves','Side of each hemisphere, below the lateral sulcus.','Contains the primary auditory cortex, Wernicke\'s area on the dominant side, and the hippocampus on its inner surface.','Hearing, understanding speech, recognising objects and faces, and memory.','A common origin of epileptic seizures. Damage to the dominant side can make speech hard to understand.'),
 rec('occipital-lobe','Occipital lobe','Lobus occipitalis',['visual cortex'],'cerebrum','nerves','Back of each hemisphere, above the cerebellum.','Contains the primary visual cortex (area V1) along the calcarine sulcus.','Receives and first processes visual information.','Damage causes loss of vision in part of the opposite visual field.'),
 rec('insula','Insula','Insula',['insular cortex','island of Reil'],'cerebrum','nerves','Folded cortex hidden deep inside the lateral sulcus.','A buried region of cortex covered by parts of the frontal, parietal and temporal lobes.','Linked to taste, sensing the state of the body (interoception), pain and emotion.'),
 rec('hippocampus','Hippocampus','Hippocampus',['hippocampal formation'],'cerebrum','nerves','Curved structure on the inner surface of the temporal lobe, beside the lateral ventricle.','A curved fold of cortex that belongs to the limbic system.','Helps form new long-term memories and supports spatial navigation.','Among the first regions affected in Alzheimer\'s disease. Loss on both sides causes severe difficulty forming new memories.'),
 rec('deep-cerebral-structures','Deep cerebral structures',None,['cerebral white matter','subcortex'],'cerebrum','nerves','Deep inside each cerebral hemisphere, beneath the cortex.','In the Brain and skull model this groups the cerebral white matter (the fibre bundles that link cortical areas) with other deep structures. The exact contents follow the grouping of the source model.','Carries signals between cortical areas and between the cortex and the rest of the nervous system.'),
 rec('hypothalamus','Hypothalamus','Hypothalamus',[],'brain','nerves','Below the thalamus, forming the floor and lower walls of the third ventricle.','A small region at the base of the forebrain, connected to the pituitary gland by the infundibulum.','Regulates body temperature, hunger, thirst, sleep cycles and hormone release through the pituitary gland.'),
 rec('midbrain','Midbrain','Mesencephalon',['mesencephalon'],'brainstem','nerves','Uppermost part of the brainstem, between the pons and the diencephalon.','Contains the cerebral peduncles, the tectum (colliculi) and the substantia nigra.','Controls eye movements and visual and auditory reflexes, and contains dopamine-producing neurons.','Loss of dopamine-producing neurons in the substantia nigra causes Parkinson\'s disease.'),
 rec('pons','Pons','Pons',[],'brainstem','nerves','Middle part of the brainstem, in front of the cerebellum.','A bulging band of fibres that bridges the midbrain and the medulla oblongata.','Relays signals between the cerebrum and cerebellum, contains nuclei of several cranial nerves and helps regulate breathing and sleep.'),
 rec('medulla-oblongata','Medulla oblongata','Medulla oblongata',['medulla'],'brainstem','nerves','Lowest part of the brainstem, continuing into the spinal cord at the foramen magnum.','Contains the pyramids, the olives and nuclei of the lower cranial nerves.','Controls heart rate, breathing and reflexes such as swallowing and coughing. Most motor fibres cross to the opposite side here.','Damage can be life threatening because it houses vital centres.'),
 rec('lateral-ventricle','Lateral ventricles','Ventriculus lateralis',['lateral ventricle'],'brain','nerves','One C-shaped cavity inside each cerebral hemisphere.','The largest cavities of the ventricular system, each with a body, anterior, posterior and inferior horn.','Make and hold cerebrospinal fluid (CSF) from the choroid plexus. Each drains to the third ventricle through an interventricular foramen.','Blocked drainage lets CSF build up and causes hydrocephalus.'),
 rec('third-ventricle','Third ventricle','Ventriculus tertius',[],'brain','nerves','Narrow midline slit between the two halves of the thalamus.','A slit-like cavity whose walls include the thalamus and hypothalamus.','Receives CSF from both lateral ventricles and passes it on through the cerebral aqueduct.'),
 rec('cerebral-aqueduct','Cerebral aqueduct','Aqueductus cerebri',['aqueduct of Sylvius'],'brain','nerves','Narrow canal running through the midbrain.','A thin channel that joins the third ventricle to the fourth ventricle.','Carries CSF from the third to the fourth ventricle.','Because it is so narrow it is a common place for a blockage (aqueductal stenosis) leading to hydrocephalus.'),
 rec('fourth-ventricle','Fourth ventricle','Ventriculus quartus',[],'brain','nerves','Diamond-shaped cavity behind the pons and medulla, in front of the cerebellum.','The last cavity of the ventricular system, continuous with the central canal of the spinal cord.','CSF leaves the ventricles here, through the median and lateral apertures, and enters the space around the brain and spinal cord.'),
 rec('cerebral-arterial-circle','Cerebral arterial circle','Circulus arteriosus cerebri',['circle of Willis'],None,'vessels','Ring of arteries on the underside of the brain, around the pituitary stalk and optic chiasm.','Joins the two internal carotid arteries and the basilar artery through the anterior and posterior communicating arteries.','Links the carotid and vertebrobasilar blood supplies, giving back-up routes if one vessel narrows.','A common site for berry aneurysms.',system='cardiovascular'),
]
recs=','.join(R)
st=m.index('S=[{id:`skull`')+2
depth=0; i=st; instr=False
while True:
    ch=m[i]
    if ch=='`': instr=not instr
    elif not instr:
        if ch in '[{': depth+=1
        elif ch in ']}':
            depth-=1
            if depth==0: break
    i+=1
assert m[i]==']' and m[i+1]==',', m[i-40:i+40]
m=m[:i]+','+recs+m[i:]
OBJMAP={'frontal_r':'frontal-lobe','frontal_l':'frontal-lobe','parietal_r':'parietal-lobe','parietal_l':'parietal-lobe','temporal_r':'temporal-lobe','temporal_l':'temporal-lobe','occipital_r':'occipital-lobe','occipital_l':'occipital-lobe','insula_r':'insula','insula_l':'insula','hippocampus_r':'hippocampus','hippocampus_l':'hippocampus','deep_r':'deep-cerebral-structures','deep_l':'deep-cerebral-structures','brain_other':'brain','lat_vent_r':'lateral-ventricle','lat_vent_l':'lateral-ventricle','third_vent':'third-ventricle','fourth_vent':'fourth-ventricle','aqueduct':'cerebral-aqueduct','cerebellum':'cerebellum','midbrain':'midbrain','pons':'pons','medulla':'medulla-oblongata','spinal':'spinal-cord','pituitary':'pituitary-gland','hypothalamus':'hypothalamus','circle':'cerebral-arterial-circle','neurocranium':'skull'}
model={'id':'bodyparts3d-brain-skull','name':'Brain and skull close-up (BodyParts3D)','kind':'gltf','url':'./models/bodyparts3d-brain-skull.glb.json','fidelity':'anatomical',
 'license':'CC BY-SA 2.1 Japan — BodyParts3D','attribution':'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Meshes merged into named structures, re-centred and re-oriented for AnatomyVerse.',
 'description':'A scan-derived brain with separately selectable lobes, insula, hippocampi, ventricles, cerebellum, brainstem, pituitary gland, hypothalamus, circle of Willis and the skull vault. The skull is drawn faintly so the brain stays visible; select it to see it solid. Left and right sides are separate meshes that share one structure.',
 'objectMap':OBJMAP}
tail='objectMap:{}}],D=`schematic-body-v1`'
assert m.count(tail)==1
m=m.replace(tail,'objectMap:{}},'+json.dumps(model,ensure_ascii=False)+'],D=`schematic-body-v1`')
wr(MAN,m)

# ---------- 2. viewer: honour material opacity ----------
V='assets/AnatomyViewer-C5q0xwNu.js'; v=rd(V)
v=sub1(v,'color:`#${o}`})}),r}','color:`#${o}`,baseOpacity:(Array.isArray(i.material)?i.material[0]:i.material)?.opacity??1})}),r}')
v=sub1(v,'unmapped:!e.structureId,geometry:e.geometry,color:e.color},`${e.name}-${t}`))})}function Mt','unmapped:!e.structureId,geometry:e.geometry,color:e.color,baseOpacity:e.baseOpacity},`${e.name}-${t}`))})}function Mt')
wr(V,v)

# ---------- 3. lab page: close-up buttons ----------
L='assets/LabPage-zPU8vhVB.js'; l=rd(L)
BE=['brain','cerebrum','cerebellum','brainstem','skull','spinal-cord','pituitary-gland']+sorted(set(OBJMAP.values())-{'brain','cerebellum','skull','spinal-cord','pituitary-gland'})
BE=list(dict.fromkeys(BE))
l=sub1(l,'var Ce=new Set([','var Be=new Set('+json.dumps(BE)+'.map(e=>e)),Ce=new Set([') if False else sub1(l,'var Ce=new Set([','var Be=new Set('+json.dumps(BE)+');var Ce=new Set([')
btn=("Be.has(n.id)&&p.modelId!==`bodyparts3d-brain-skull`&&(0,X.jsxs)(`button`,{type:`button`,className:`av-btn`,onClick:()=>{let e=n.id;_goModel(`bodyparts3d-brain-skull`,e)},children:[(0,X.jsx)(d,{size:15,\"aria-hidden\":!0}),` Brain and skull close-up`]}),"
     "p.modelId===`bodyparts3d-brain-skull`&&(0,X.jsxs)(`button`,{type:`button`,className:`av-btn`,onClick:()=>{let e=n.id;_goModel(`schematic-body-v1`,e)},children:[(0,X.jsx)(A,{size:15,\"aria-hidden\":!0}),` Back to the full-body model`]}),")
anchor="(n.id===`heart`||n.parentId===`heart`)&&P&&"
l=sub1(l,anchor,btn+anchor)
wr(L,l)


# ---------- 3b. brain inside the full-body skull ----------
m=rd(MAN)
OFF=[0,1.655,-0.012]
bm={k:v for k,v in OBJMAP.items() if k not in('neurocranium','spinal')}; bm['spinal_bridge']='spinal-cord'
inbody={'id':'bodyparts3d-brain-in-body','name':'Detailed brain (inside full-body skull)','kind':'gltf','url':'./models/bodyparts3d-brain-only.glb.json','fidelity':'anatomical',
 'license':'CC BY-SA 2.1 Japan — BodyParts3D','attribution':'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan. Meshes merged into named structures, re-centred and re-oriented for AnatomyVerse.',
 'description':'The detailed brain, drawn inside the skull of the full-body model.','offset':OFF,'objectMap':bm}
tail='],D=`schematic-body-v1`'
assert m.count(tail)==1
m=m.replace(tail,','+json.dumps(inbody,ensure_ascii=False)+tail)
ov='replacesParts:[`heart_right_atrium`'
assert m.count(ov)==1
old_end='`pulmonary_veins_R`]}]}'
assert m.count(old_end)==1
m=m.replace(old_end,'`pulmonary_veins_R`]},{assetId:`bodyparts3d-brain-in-body`,replacesParts:[`cerebrum`,`cerebellum`,`brainstem`,`pituitary_gland`]}]}')
wr(MAN,m)
l=rd(L)
l=sub1(l,'children:s.map(e=>(0,X.jsx)(`option`','children:s.filter(e=>e.id!==`bodyparts3d-brain-in-body`).map(e=>(0,X.jsx)(`option`')
l=sub1(l,'`Detailed heart (Z-Anatomy)`','`Detailed heart and brain`')
l=sub1(l,'`Scan-derived heart drawn inside the body in place of the simplified one.`','`Scan-derived heart and brain drawn inside the body in place of the simplified ones.`')
wr(L,l)

exec(open('/home/claude/brain3d/patch3c.py').read())

# ---------- 4. cache-busting renames (closure over changed files) ----------
names=set(os.listdir(DST+'/assets'))
def live_graph():
    seen=set(); stack=['index.html']
    while stack:
        f=stack.pop(); p=DST+'/'+('assets/'+f if f!='index.html' else f)
        t=open(p).read(); 
        for n in names:
            if n in t and n not in seen and n!=f: seen.add(n); stack.append(n)
    return seen
live=live_graph()
changed={os.path.basename(MAN),os.path.basename(V),os.path.basename(L),os.path.basename(IDX)}
def refs(f): 
    p=DST+'/'+('assets/'+f if f!='index.html' else f); t=open(p).read(); return {n for n in live if n in t and n!=f}
R_=changed|set()
grew=True
while grew:
    grew=False
    for f in list(live)+['index.html']:
        if f in R_: continue
        if refs(f)&R_: R_.add(f); grew=True
ren={f:re.sub(r'\.(js|css)$',r'-b12.\1',f) for f in R_ if f!='index.html'}
for f in list(live)+['index.html']:
    p=DST+'/'+('assets/'+f if f!='index.html' else f); t=open(p).read()
    for a,b in ren.items(): t=t.replace(a,b)
    open(p,'w').write(t)
for a,b in ren.items(): os.rename(f'{DST}/assets/{a}',f'{DST}/assets/{b}')
json.dump({'live':sorted(live),'renamed':ren},open('/home/claude/brain3d/build-report.json','w'),indent=1)
print('live files',len(live),'renamed',len(ren)); print(sorted(ren.values()))
