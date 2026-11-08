import json,re,collections
R=json.load(open('../recs_app2.json'));by={r['id']:r for r in R}
F=json.load(open('F.json'))
def has(i,k): return bool(by[i].get(k))
T={}
def B(key,b,v,n): T[key]=dict(bloodSupply=b,venousDrainage=v,innervation=n)
PER=" The periosteum is richly supplied with pain fibres."
# bones
B('frontal-bone',"Supraorbital and supratrochlear arteries (ophthalmic), superficial temporal artery, and meningeal branches (anterior meningeal, middle meningeal) to the inner table and diploe.","Diploic veins (frontal) to the dural sinuses and scalp veins; supraorbital vein.","Periosteum: supraorbital and supratrochlear nerves (V1)."+PER)
B('parietal-bone',"Middle meningeal artery (inner surface), superficial temporal and occipital arteries (outer surface).","Diploic veins to the superior sagittal sinus and scalp veins.","Periosteum: auriculotemporal nerve (V3), greater occipital nerve and branches of V1."+PER)
B('temporal-bone',"Middle meningeal artery, posterior auricular and stylomastoid arteries, superficial temporal artery; internal carotid artery branches in the petrous part; labyrinthine artery in the inner ear.","Diploic veins; veins to the sigmoid and petrosal sinuses and the retromandibular vein.","Auriculotemporal nerve (V3), great auricular nerve (C2-C3), auricular branch of the vagus and the facial and tympanic nerves in the canals."+PER)
B('occipital-bone',"Occipital artery, meningeal branches of the vertebral and ascending pharyngeal arteries, posterior meningeal artery.","Occipital and diploic veins; emissary veins to the sigmoid sinus and scalp.","Greater and lesser occipital nerves (C2-C3), hypoglossal nerve in its canal, and meningeal branches."+PER)
B('sphenoid-bone',"Branches of the maxillary artery (pterygoid and sphenopalatine branches), middle meningeal artery, and internal carotid artery (pharyngeal and hypophysial branches).","Pterygoid venous plexus and cavernous sinus tributaries.","Branches of the trigeminal nerve (V1, V2, V3) and the nerve of the pterygoid canal; the optic nerve passes in the optic canal."+PER)
B('ethmoid-bone',"Anterior and posterior ethmoidal arteries (ophthalmic) and sphenopalatine artery branches.","Ethmoidal veins to the superior ophthalmic vein and the nasal veins.","Anterior ethmoidal nerve (V1) and the nasal branches of the maxillary nerve (V2); olfactory nerve fibres pass through the cribriform plate.")
B('maxilla',"Infraorbital artery, superior alveolar arteries and greater palatine artery (maxillary artery); the nutrient supply enters through the alveolar foramina.","Pterygoid venous plexus and facial vein tributaries.","Infraorbital nerve, superior alveolar nerves and greater palatine nerve (V2)."+PER)
B('zygomatic-bone',"Zygomaticofacial and zygomaticotemporal arteries, zygomatico-orbital artery (superficial temporal) and transverse facial artery.","Zygomatic veins to the facial and superficial temporal veins.","Zygomaticofacial and zygomaticotemporal nerves (V2)."+PER)
B('nasal-bone',"Dorsal nasal artery (ophthalmic) and lateral nasal artery (facial).","Nasal veins to the angular and facial veins.","External nasal nerve (anterior ethmoidal, V1) and infratrochlear nerve (V1).")
B('lacrimal-bone',"Anterior ethmoidal and dorsal nasal arteries and branches of the angular artery.","Angular and ophthalmic vein tributaries.","Infratrochlear nerve and anterior ethmoidal nerve (V1).")
B('palatine-bone',"Greater and lesser palatine arteries and the sphenopalatine artery.","Palatine veins to the pterygoid venous plexus.","Greater and lesser palatine nerves and nasal branches (V2).")
B('vomer',"Nasopalatine branch of the sphenopalatine artery and posterior septal branches.","Nasal veins to the pterygoid venous plexus.","Nasopalatine nerve (V2).")
B('inferior-nasal-concha',"Lateral posterior nasal branches of the sphenopalatine artery and greater palatine artery.","Nasal veins to the pterygoid venous plexus.","Posterior inferior nasal branches of the greater palatine nerve and the anterior superior alveolar nerve (V2).")
B('mandible',"Inferior alveolar artery (maxillary artery), entering the mandibular foramen; the facial artery and masseteric branches supply the periosteum.","Inferior alveolar vein to the pterygoid venous plexus; facial vein.","Inferior alveolar nerve (V3) with its mental and mylohyoid branches; masseteric nerve to the periosteum."+PER)
B('hyoid-bone',"Lingual artery (suprahyoid branch) and superior thyroid artery (infrahyoid branch).","Lingual and superior thyroid veins.","Branches of the hypoglossal nerve (C1 fibres), ansa cervicalis and mylohyoid nerve to the attached muscles.")
B('calvaria',"Middle meningeal artery (inner table); scalp arteries (outer table).","Diploic veins and emissary veins to the dural sinuses and the scalp.","Periosteum: trigeminal (V1, V3) and cervical (C2-C3) nerves.")
B('skull',"Meningeal arteries (middle meningeal, anterior and posterior meningeal) supply the inner table and diploe; scalp and facial arteries (superficial temporal, occipital, posterior auricular, supraorbital, facial and maxillary arteries) supply the outer surface.","Diploic veins (frontal, temporal, occipital) and emissary veins to the dural sinuses and scalp veins; facial bones drain to the pterygoid plexus and facial vein.","Periosteum: trigeminal nerve (V1, V2, V3) for the face and front of the skull; occipital nerves (C2-C3) for the back."+PER)
B('anterior-cranial-fossa',"Anterior meningeal and anterior ethmoidal arteries.","Diploic and ethmoidal veins.","Meningeal branches of V1.")
B('middle-cranial-fossa',"Middle meningeal artery and accessory meningeal artery.","Meningeal and sphenoparietal sinus veins.","Meningeal branches of V2 and V3.")
B('posterior-cranial-fossa',"Posterior meningeal artery and meningeal branches of the vertebral and occipital arteries.","Occipital and sigmoid sinus veins.","Meningeal branches of C1-C3, vagus and hypoglossal fibres.")
B('vertebral-column',"Spinal branches of the segmental arteries (vertebral, ascending cervical, posterior intercostal, lumbar and lateral sacral arteries), entering through the intervertebral foramina and nutrient foramina.","Basivertebral veins to the internal vertebral venous plexus; external plexus to the azygos and lumbar veins.","Meningeal (sinuvertebral) nerves and posterior rami of the spinal nerves supply the periosteum, ligaments and facet joints."+PER)
B('sternum',"Internal thoracic artery (sternal branches, perforating and anterior intercostal branches).","Internal thoracic veins.","Anterior cutaneous branches of the intercostal nerves and the supraclavicular nerves."+PER)
B('ribs',"Posterior intercostal arteries (nutrient artery and collateral branches) and anterior intercostal arteries.","Intercostal veins to the azygos system and internal thoracic veins.","Intercostal nerves (T1-T11) and the subcostal nerve (T12) supply the periosteum."+PER)
B('costal-cartilages',"Hyaline cartilage nourished by diffusion through the perichondrium, which receives the anterior intercostal and musculophrenic arteries.","Intercostal veins; the cartilage itself has none.","Intercostal nerves supply the perichondrium.")
B('clavicle',"Clavicular branch of the thoracoacromial artery, suprascapular artery and internal thoracic artery.","Companion veins to the subclavian vein.","Supraclavicular nerves (C3-C4), nerve to subclavius and lateral pectoral nerve."+PER)
B('scapula',"Suprascapular, dorsal scapular and circumflex scapular arteries (subscapular), with the acromial network of the thoracoacromial artery.","Companion veins to the subclavian and axillary veins.","Suprascapular, subscapular and axillary nerves and the dorsal scapular nerve."+PER)
B('humerus',"Nutrient artery from the brachial or profunda brachii artery; anterior and posterior circumflex humeral arteries for the head and neck; collateral arteries around the elbow.","Companion veins to the brachial and axillary veins.","Axillary nerve (surgical neck), radial nerve (shaft in the radial groove), musculocutaneous and median nerves to the periosteum."+PER)
B('radius',"Nutrient artery from the anterior interosseous artery; radial artery and recurrent branches.","Companion veins to the radial veins.","Anterior interosseous nerve (median) and posterior interosseous nerve (radial)."+PER)
B('ulna',"Nutrient artery from the anterior interosseous artery; ulnar artery and collateral arteries at the elbow.","Companion veins to the ulnar veins.","Anterior interosseous nerve (median), ulnar nerve and posterior interosseous nerve."+PER)
B('hand-bones',"Palmar and dorsal carpal arches (radial and ulnar arteries), deep palmar arch, dorsal and palmar metacarpal arteries and proper palmar digital arteries.","Companion veins to the deep and superficial veins of the hand and the dorsal venous network.","Median, ulnar and radial nerves (digital and deep branches) supply the periosteum and joints.")
B('scaphoid',"Branches of the radial artery enter mainly from the distal part (dorsal carpal branch); the proximal pole is supplied by retrograde flow, so a waist fracture can cause avascular necrosis.","Companion veins to the radial veins.","Anterior interosseous nerve, superficial radial nerve and median nerve branches.")
B('hip-bone',"Nutrient arteries from the obturator, superior and inferior gluteal, iliolumbar and deep circumflex iliac arteries.","Companion veins to the internal iliac veins.","Obturator nerve, superior gluteal nerve, femoral nerve and branches of the sacral plexus supply the periosteum."+PER)
B('femur',"Nutrient arteries from perforating branches of the profunda femoris. Head and neck: medial and lateral circumflex femoral arteries (retinacular branches), with a small contribution from the artery of the ligament of the head (obturator artery).","Companion veins to the femoral vein.","Femoral, obturator and sciatic nerves (nerve to quadratus femoris, nerve to vastus) supply the periosteum and hip joint."+PER)
B('patella',"Genicular arterial anastomosis (superior and inferior genicular, descending genicular, anterior tibial recurrent arteries).","Genicular veins to the popliteal vein.","Femoral nerve branches and the infrapatellar branch of the saphenous nerve.")
B('tibia',"Nutrient artery from the posterior tibial artery (the largest nutrient artery in the body); periosteal arteries from the anterior tibial and genicular arteries.","Companion veins to the tibial veins.","Tibial nerve, saphenous nerve and deep fibular nerve supply the periosteum."+PER)
B('fibula',"Nutrient artery from the fibular (peroneal) artery; periosteal branches of the anterior tibial artery.","Companion veins to the fibular veins.","Common fibular nerve (including the deep and superficial fibular nerves) and the tibial nerve."+PER)
B('foot-bones',"Dorsalis pedis (arcuate), medial and lateral plantar and tarsal arteries and the plantar arterial arch; metatarsal and digital arteries.","Companion veins to the dorsal venous arch and the plantar veins.","Medial and lateral plantar nerves, deep fibular, sural and saphenous nerves supply the periosteum and joints.")
B('talus',"Artery of the tarsal canal (posterior tibial artery), branches of the dorsalis pedis and the deltoid branch; the body is supplied by retrograde flow, so a fracture of the neck can cause avascular necrosis.","Companion veins to the posterior tibial veins.","Deep fibular nerve, tibial nerve and sural nerve branches.")
B('calcaneus',"Medial calcaneal branches of the posterior tibial artery, lateral calcaneal branches of the fibular artery.","Companion veins to the posterior tibial and fibular veins.","Medial and lateral plantar nerves, sural nerve and calcaneal branches of the tibial nerve.")
B('nasal-cartilages',"Hyaline and fibrous cartilage nourished by the perichondrium, which is supplied by the lateral nasal, dorsal nasal and septal branches of the superior labial arteries.","Nasal veins to the facial and angular veins.","External nasal nerve (V1) and infraorbital nerve (V2) supply the perichondrium.")
B('intervertebral-discs',"Avascular in the adult: the nucleus pulposus and inner annulus are nourished by diffusion from the vertebral end plates; the outer annulus has small spinal branches.","Not applicable (no vessels in the inner disc); end plate veins drain to the basivertebral veins.","Meningeal (sinuvertebral) nerves and grey rami communicantes supply the outer third of the annulus; the nucleus has no nerve supply.")
B('interpubic-disc',"Branches of the obturator and inferior epigastric arteries and the internal pudendal artery.","Veins to the internal iliac vein.","Ilioinguinal and genitofemoral nerves and branches of the pudendal nerve.")
B('ear',"Tympanic branches of the maxillary, posterior auricular and stylomastoid arteries.","Veins to the pterygoid plexus and the sigmoid sinus.","Tympanic plexus (glossopharyngeal nerve) and the facial nerve (nerve to stapedius).")
for k in ('malleus','incus','stapes'): B(k,"Anterior tympanic artery (maxillary), stylomastoid artery and superior tympanic artery (middle meningeal); the ossicles themselves have a thin mucosal blood supply.","Veins to the pterygoid plexus and the sigmoid sinus.","Tympanic plexus (glossopharyngeal nerve); the stapedius is supplied by the facial nerve and the tensor tympani by the nerve to the medial pterygoid.")
# joint structures by regex on base id
J=[
('knee|menisc|patellar|infrapatellar|popliteal|popliteofibular|deep-medial|anserine|semimembranosus|subtendinous-bursa-of-gastro|lateral-subtendinous|medial-subtendinous|biceps-femoris|suprapatellar|prepatellar|tibial-tuberosity',"the genicular arteries (superior, middle and inferior, from the popliteal artery) and the recurrent branch of the anterior tibial artery","the genicular veins to the popliteal vein","the articular branches of the tibial, common fibular, femoral (nerve to vastus), saphenous and obturator nerves (Hilton law)"),
('acetabul|obturator-membrane|iliopectineal|trochanteric|gluteal|sciatic-bursa|intermuscular-gluteal',"the obturator, medial and lateral circumflex femoral, and superior and inferior gluteal arteries","companion veins to the internal iliac and femoral veins","the obturator, femoral, sciatic and superior gluteal nerves, and the nerve to quadratus femoris (Hilton law)"),
('sacro-iliac|sacrotuberous',"the iliolumbar, lateral sacral and superior gluteal arteries","companion veins to the internal iliac veins","the sacral plexus branches and the posterior rami of L4-S3"),
('glenoid|glenohumeral|subacromial|subdeltoid|coracobrachial|acromio|infraspinatus|teres-major|subcutaneous-acromial',"the suprascapular, circumflex scapular, anterior and posterior circumflex humeral and thoracoacromial arteries","companion veins to the axillary vein","the suprascapular, axillary, lateral pectoral and subscapular nerves"),
('sternoclavicular',"the internal thoracic and suprascapular arteries","companion veins to the internal thoracic and subclavian veins","the nerve to subclavius and the medial supraclavicular nerve"),
('elbow|annular|bicipitoradial|triceps',"the collateral and recurrent branches of the brachial, radial and ulnar arteries (the periarticular anastomosis of the elbow)","companion veins to the brachial veins","the musculocutaneous, radial, median and ulnar nerves"),
('wrist|radiocarpal|intercarpal|carpometacarpal|scapho|ulnolunate|ulnotriquetral|pisotriquetral|radioscaphocapitate|radiate-carpal',"the palmar and dorsal carpal arches (radial, ulnar and anterior interosseous arteries)","companion veins to the radial and ulnar veins","the anterior and posterior interosseous nerves and branches of the median, ulnar and radial nerves"),
('deep-transverse-metacarpal|metacarpophalangeal|-hand|palmar-interphalangeal',"the palmar and dorsal metacarpal arteries and the proper palmar digital arteries","the dorsal venous network and digital veins","the proper palmar digital nerves (median and ulnar) and dorsal digital branches (radial and ulnar)"),
('tibiofibular|malleol|calcane|tarso|talo|navicular',"the malleolar branches of the anterior and posterior tibial arteries, the fibular artery and the dorsalis pedis artery","companion veins to the tibial and fibular veins","the deep fibular, tibial, sural and saphenous nerves"),
('metatarsophalangeal|interphalangeal|plantar|-foot|great-toe',"the dorsalis pedis, plantar arch, metatarsal and digital arteries","the dorsal venous arch and plantar veins","the medial and lateral plantar nerves (tibial) and the deep fibular nerve"),
]
def jtext(i,name):
    base=re.sub(r'-(left|right)$','',i)
    for pat,a,v,n in J:
        if re.search(pat,base):
            return dict(bloodSupply=a[:1].upper()+a[1:]+".",venousDrainage="Drains through "+v+".",innervation="Supplied by "+n+"; the capsule, ligaments and bursae are well innervated with proprioceptive and pain endings." if not re.search('bursa',base) else "Supplied by "+n+" (skin and tendon branches).")
    return None
def chain(r):
    out=[r['id']]
    while by[out[-1]].get('parentId') in by: out.append(by[out[-1]]['parentId'])
    return out
added=0;left=[]
for r in R:
    if r['system']!='skeletal': continue
    i=r['id'];ch=chain(r);d=None
    for c in ch:
        k=re.sub(r'-(left|right)$','',c)
        if k in T: d=T[k];break
    # refine carpal/tarsal individual bones
    base=re.sub(r'-(left|right)$','',i)
    if base=='scaphoid': d=T['scaphoid']
    if base=='talus': d=T['talus']
    if base=='calcaneus': d=T['calcaneus']
    if d is None and ch[-1] in ('vertebral-column',): d=T['vertebral-column']
    if d is None:
        d=jtext(ch[-1],'') or jtext(i,'')
    if d is None: left.append(i);continue
    o={k:v for k,v in d.items() if v and not by[i].get(k)}
    if o:F.setdefault(i,{}).update(o);added+=1
print('added',added,'left',len(left),left[:40])
json.dump(F,open('F2.json','w'))
