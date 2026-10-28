#!/usr/bin/env python3
"""Register the nose/ear close-up asset, add the 4 new structures, and give the
existing ear/nose structures their nerve and blood supply."""
import sys, re, glob, os, json

ASSETS = sys.argv[1]
man_path = glob.glob(os.path.join(ASSETS, "assetManifest-*.js"))[0]
s = open(man_path, encoding="utf-8").read()

# ---------------------------------------------------------------- new structures
NEW = [
{"id":"external-ear","name":"External ear","latinName":"Auris externa","synonyms":["auricle","pinna"],
 "system":"special-senses","region":"head","layer":"organs",
 "location":"The auricle on the side of the head and the external acoustic meatus leading to the tympanic membrane.",
 "description":"The visible part of the ear: an elastic-cartilage auricle and the S-shaped external acoustic meatus, whose outer third is cartilage and inner two thirds bone.",
 "function":"Collects sound and funnels it along the meatus to the tympanic membrane; the folds of the auricle help locate where a sound came from.",
 "innervation":"Great auricular (C2, C3) and lesser occipital nerves over most of the auricle; auriculotemporal nerve (V3) in front; auricular branch of the vagus (X) in the posterior meatus and adjoining tympanic membrane.",
 "bloodSupply":"Posterior auricular and superficial temporal arteries, both branches of the external carotid.",
 "clinicalRelevance":"A shearing blow strips perichondrium from the cartilage; an auricular haematoma that is not drained leaves a 'cauliflower ear'. Instrumenting the meatus can stimulate the vagal auricular branch and provoke reflex coughing or fainting."},
{"id":"inferior-concha","name":"Inferior nasal concha","latinName":"Concha nasalis inferior","synonyms":["inferior turbinate"],
 "system":"skeletal","region":"head","layer":"bones",
 "location":"Scroll of bone on the lateral wall of the nasal cavity, below the middle concha.",
 "description":"A separate bone of the facial skeleton, unlike the superior and middle conchae which are parts of the ethmoid. It encloses the inferior meatus beneath it.",
 "function":"Greatly increases the mucosal surface area of the nasal cavity, so inspired air is warmed, humidified and filtered before it reaches the lungs.",
 "innervation":"Anterior and lateral superior nasal branches of the maxillary nerve (V2), relayed through the pterygopalatine ganglion.",
 "bloodSupply":"Sphenopalatine and greater palatine branches of the maxillary artery, with an anterior ethmoidal contribution.",
 "clinicalRelevance":"Hypertrophy of this turbinate from allergy or chronic rhinitis is a common cause of nasal obstruction. The nasolacrimal duct opens into the inferior meatus beneath it, which is why the nose runs when the eyes water."},
{"id":"nasal-cartilages","name":"Nasal cartilages","latinName":"Cartilagines nasi","synonyms":["alar cartilage","septal cartilage"],
 "system":"skeletal","region":"head","layer":"bones",
 "location":"The lower two thirds of the external nose, below the nasal bones.",
 "description":"The lateral processes, the major and minor alar cartilages and the septal cartilage, which together form the mobile skeleton of the external nose.",
 "function":"Give the nose its external shape and hold the nostrils open against the negative pressure of inspiration.",
 "innervation":"External nasal branch of the anterior ethmoidal nerve (V1) over the dorsum and tip; infraorbital branches (V2) laterally.",
 "bloodSupply":"Dorsal nasal branch of the ophthalmic artery, with lateral nasal and septal branches of the facial artery.",
 "clinicalRelevance":"Cartilage is avascular and depends entirely on its perichondrium. A septal haematoma must be drained urgently, or the septal cartilage undergoes avascular necrosis and the bridge collapses into a saddle-nose deformity."},
{"id":"nasalis","name":"Nasalis","latinName":"Musculus nasalis","synonyms":[],
 "system":"muscular","region":"head","layer":"muscles",
 "location":"Over the bridge and side of the nose.",
 "description":"A muscle of facial expression with a transverse (compressor) part and an alar (dilator) part.",
 "function":"The transverse part compresses the nostrils; the alar part flares them.",
 "origin":"Maxilla above the incisor and canine teeth.",
 "insertion":"Transverse part into an aponeurosis across the dorsum of the nose; alar part into the major alar cartilage.",
 "actions":"Compresses the nostrils (transverse part) and flares them (alar part).",
 "innervation":"Buccal branches of the facial nerve (VII).",
 "bloodSupply":"Superior labial and lateral nasal branches of the facial artery.",
 "clinicalRelevance":"Nasal flaring is an early sign of respiratory distress, particularly in children. Like every muscle of facial expression it is paralysed on the affected side in a facial nerve palsy."},
]

def js_struct(d):
    return "{" + ",".join('"%s": %s' % (k, json.dumps(v, ensure_ascii=False)) for k, v in d.items()) \
           + ',"sources":y(v.skeletal),"reviewStatus":"reviewed"}'

anchor = '{"id": "frontal-lobe"'
assert s.count(anchor) == 1, "insertion anchor not unique"
s = s.replace(anchor, ",".join(js_struct(d) for d in NEW) + "," + anchor)
print("added %d new structures" % len(NEW))

# ------------------------------------------- supply fields for existing structures
SUPPLY = {
 "ear": ('"innervation": "Great auricular and lesser occipital nerves, auriculotemporal nerve (V3), auricular branch of the vagus (X); the inner ear is served by the vestibulocochlear nerve (VIII).",'
         '"bloodSupply": "Posterior auricular and superficial temporal arteries externally; the labyrinthine artery supplies the inner ear.",'),
 "nasal-cavity": ('"innervation": "Smell by the olfactory nerve (I) through the cribriform plate; general sensation from the anterior ethmoidal nerve (V1) above and the nasopalatine and nasal branches of the maxillary nerve (V2) below.",'
                  '"bloodSupply": "Anterior and posterior ethmoidal, sphenopalatine, greater palatine and superior labial arteries, which anastomose on the anterior septum as Kiesselbach plexus.",'),
 "olfactory-epithelium": ('"innervation": "Olfactory nerve (I): bipolar receptor neurons whose central processes pass through the cribriform plate to the olfactory bulb.",'
                          '"bloodSupply": "Anterior ethmoidal artery, a branch of the ophthalmic artery.",'),
}
for sid, fields in SUPPLY.items():
    m = re.search(r'(\{(?:id:`|"id":\s*")' + re.escape(sid) + r'(?:`|")[^\n]{0,40}?)("name"|name:`)', s)
    if not m:
        print("  ! could not place supply for", sid); continue
    if '"innervation"' in s[m.start():m.start()+1200]:
        print("  - %s already has innervation, skipped" % sid); continue
    s = s[:m.end(1)] + "," + fields.rstrip(",") + s[m.end(1):]
    print("  + supply added to", sid)

# ------------------------------------------------------------------ asset entry
obj_map = {
 "nasal_bone_r":"nasal-bone","nasal_bone_l":"nasal-bone",
 "nasal_cartilages":"nasal-cartilages",
 "inferior_concha_r":"inferior-concha","inferior_concha_l":"inferior-concha",
 "ethmoid":"ethmoid-bone","vomer":"vomer",
 "nasalis_r":"nasalis","nasalis_l":"nasalis",
 "ear":"external-ear",
 "maxilla_r":"maxilla","maxilla_l":"maxilla",
 "palatine_r":"palatine-bone","palatine_l":"palatine-bone",
 "temporal_r":"temporal-bone","temporal_l":"temporal-bone",
}
asset = ("{id:`bodyparts3d-nose-ear`,name:`Nose and ear close-up`,kind:`gltf`,"
         "url:`./models/bodyparts3d-nose-ear.glb.json`,fidelity:`anatomical`,"
         "license:`CC BY-SA 2.1 Japan \\u2014 BodyParts3D`,"
         "attribution:`BodyParts3D, \\u00a9 The Database Center for Life Science, licensed under CC BY-SA 2.1 Japan. Decimated and converted for AnatomyVerse.`,"
         "description:`The nasal skeleton and external ear, scan-derived: nasal bones, nasal cartilages, inferior conchae, ethmoid, vomer, the nasalis muscle, the auricle, and the maxilla, palatine and temporal bones that wall the nasal cavity and house the ear. Each is separately selectable, with its nerve and blood supply in the notes. The middle and inner ear (tympanic membrane, auditory ossicles, cochlea) and the paranasal sinuses are not in this source file and remain text-only.`,"
         "objectMap:{" + ",".join("%s:`%s`" % (k, v) for k, v in obj_map.items()) + "}},")
a2 = "{id:`zanatomy-eye`,"
assert s.count(a2) == 1
s = s.replace(a2, asset + a2)
print("registered asset bodyparts3d-nose-ear (%d meshes mapped)" % len(obj_map))

open(man_path, "w", encoding="utf-8").write(s)
print("wrote", os.path.basename(man_path))
