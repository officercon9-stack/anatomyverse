#!/usr/bin/env python3
"""Make the skull a true 22-bone structure.

* Splits the eight paired bones into separate Left / Right structures (+X is the patient's left).
* Rewrites the 14 bone-type records with real location / function / articulations and a
  cranial-or-facial classification (previously every bone carried the same generic sentence).
* Maps each of the 16 paired meshes to its own side structure.

usage: patch_bones22.py ROOT
"""
import glob, re, sys

ROOT = sys.argv[1]
MAN = glob.glob(ROOT + "/assets/assetManifest-*.js")[0]
s = open(MAN, encoding="utf-8").read()

CR, FA = "Cranial bone", "Facial bone"
# id: (class, location, description, function, articulations, paired?, latin-left, latin-right)
B = {
 "frontal-bone": (CR,
   "Forms the forehead, the front of the cranial vault and the roof of both orbits.",
   "A single, shell-like bone: a vertical squamous part (forehead) and a horizontal orbital part. It carries the supraorbital margins and encloses the frontal sinuses.",
   "Protects the frontal lobes of the brain, forms the upper rim and roof of the orbits and the glabella, and houses the frontal sinuses.",
   ["Parietal bones (coronal suture)", "Sphenoid (sphenofrontal suture)", "Ethmoid", "Nasal bones", "Lacrimal bones", "Maxillae", "Zygomatic bones"], False),
 "parietal-bone": (CR,
   "Forms most of the roof and upper sides of the cranial vault, between the frontal and occipital bones.",
   "Paired, quadrilateral, curved plates that meet in the midline at the sagittal suture.",
   "Protects the cerebral hemispheres and gives attachment to the temporal fascia. Its inner surface is grooved by the middle meningeal vessels.",
   ["Frontal bone (coronal suture)", "Opposite parietal bone (sagittal suture)", "Occipital bone (lambdoid suture)", "Temporal bone (squamous suture)", "Greater wing of sphenoid (at the pterion)"], True,
   "Os parietale sinistrum", "Os parietale dextrum"),
 "temporal-bone": (CR,
   "Forms the lower side wall and part of the base of the cranium, around the ear.",
   "Paired. Has a squamous part, a petrous part that encloses the middle and inner ear, a mastoid part, a tympanic part and the zygomatic and styloid processes.",
   "Protects the organs of hearing and balance, forms the mandibular fossa of the temporomandibular joint, and gives attachment to the sternocleidomastoid and other muscles at the mastoid process.",
   ["Parietal bone", "Occipital bone", "Sphenoid", "Zygomatic bone (zygomatic arch)", "Mandible (temporomandibular joint)"], True,
   "Os temporale sinistrum", "Os temporale dextrum"),
 "occipital-bone": (CR,
   "Forms the back and the lower part of the cranium, including the foramen magnum.",
   "A single bone with a squamous part, two occipital condyles, a basilar part and lateral parts.",
   "Protects the occipital lobes and cerebellum, transmits the spinal cord through the foramen magnum, articulates with the atlas, and anchors the nuchal muscles and ligaments.",
   ["Parietal bones (lambdoid suture)", "Temporal bones", "Sphenoid (basilar part)", "Atlas (atlanto-occipital joints)"], False),
 "sphenoid-bone": (CR,
   "Lies at the centre of the cranial base, between the frontal, ethmoid and occipital bones.",
   "A single bat-shaped keystone bone with a body, greater and lesser wings and pterygoid processes. The sella turcica holds the pituitary gland and the body encloses the sphenoid sinuses.",
   "Binds the cranial and facial bones together. Its canals and fissures carry the optic, oculomotor, trochlear, trigeminal and abducens nerves, and it forms part of the orbit and the skull base.",
   ["Frontal", "Ethmoid", "Parietal bones", "Temporal bones", "Occipital (basilar part)", "Zygomatic bones", "Palatine bones", "Vomer"], False),
 "ethmoid-bone": (CR,
   "Lies between the orbits, behind the nasal bones, forming the roof and upper walls of the nasal cavity.",
   "A single, delicate bone: cribriform plate, perpendicular plate, crista galli and two labyrinths holding the ethmoid air cells and the superior and middle conchae.",
   "Transmits the olfactory nerve fibres through the cribriform plate, forms the upper nasal septum and medial orbital wall, and supports the nasal conchae.",
   ["Frontal", "Sphenoid", "Nasal bones", "Maxillae", "Lacrimal bones", "Palatine bones", "Vomer", "Inferior nasal conchae"], False),
 "nasal-bone": (FA,
   "Forms the bridge of the nose, between the frontal processes of the maxillae.",
   "Paired, small rectangular bones that meet in the midline at the internasal suture.",
   "Supports the bridge of the nose and gives attachment to the nasal cartilages.",
   ["Frontal bone", "Maxilla (frontal process)", "Opposite nasal bone", "Ethmoid (perpendicular plate)"], True,
   "Os nasale sinistrum", "Os nasale dextrum"),
 "maxilla": (FA,
   "Forms the upper jaw, the middle of the face, the floor of the orbit and most of the hard palate.",
   "Paired. Has a body containing the maxillary sinus and frontal, zygomatic, alveolar and palatine processes. The two maxillae fuse at the intermaxillary suture.",
   "Holds the upper teeth in its alveolar process, forms the floor of the orbit, the side of the nasal cavity and the front of the hard palate, and contains the maxillary sinus.",
   ["All facial bones except the mandible", "Frontal", "Ethmoid", "Opposite maxilla"], True,
   "Maxilla sinistra", "Maxilla dextra"),
 "zygomatic-bone": (FA,
   "Forms the prominence of the cheek and the lateral wall and floor of the orbit.",
   "Paired, with frontal, temporal and maxillary processes.",
   "Shapes the cheek, forms the zygomatic arch with the temporal bone, and gives origin to the masseter.",
   ["Frontal", "Sphenoid (greater wing)", "Maxilla", "Temporal bone (zygomatic arch)"], True,
   "Os zygomaticum sinistrum", "Os zygomaticum dextrum"),
 "lacrimal-bone": (FA,
   "Forms part of the medial wall of the orbit, behind the frontal process of the maxilla.",
   "Paired. The smallest and most fragile facial bones. Each carries the lacrimal groove and, with the maxilla, the fossa for the lacrimal sac.",
   "Forms the lacrimal fossa and the upper part of the nasolacrimal canal, which drains tears into the nasal cavity.",
   ["Frontal", "Ethmoid", "Maxilla", "Inferior nasal concha"], True,
   "Os lacrimale sinistrum", "Os lacrimale dextrum"),
 "palatine-bone": (FA,
   "Lies behind the maxilla at the back of the hard palate and the nasal cavity.",
   "Paired, L-shaped bones with a horizontal plate and a perpendicular plate.",
   "Forms the posterior third of the hard palate, part of the lateral wall of the nasal cavity and a small part of the floor of the orbit.",
   ["Maxilla", "Sphenoid (pterygoid process)", "Ethmoid", "Inferior nasal concha", "Vomer", "Opposite palatine bone"], True,
   "Os palatinum sinistrum", "Os palatinum dextrum"),
 "inferior-nasal-concha": (FA,
   "Lies along the lower part of the lateral wall of each nasal cavity.",
   "Paired, thin, scroll-shaped bones. Unlike the superior and middle conchae, they are separate bones, not part of the ethmoid.",
   "Increases the surface area of the nasal cavity so that inspired air is warmed, humidified and filtered.",
   ["Maxilla", "Lacrimal bone", "Ethmoid", "Palatine bone"], True,
   "Concha nasalis inferior sinistra", "Concha nasalis inferior dextra"),
 "vomer": (FA,
   "Lies in the midline, forming the lower and back part of the nasal septum.",
   "A single, thin, plough-shaped bone.",
   "Divides the nasal cavity into right and left sides together with the perpendicular plate of the ethmoid and the septal cartilage.",
   ["Sphenoid", "Ethmoid (perpendicular plate)", "Palatine bones", "Maxillae", "Septal cartilage"], False),
 "mandible": (FA,
   "Forms the lower jaw. It is the largest and strongest facial bone.",
   "A single bone with a horizontal body and two vertical rami. The ramus carries the condylar process and the coronoid process, and the body carries the mental foramen.",
   "Holds the lower teeth and is the only freely movable bone of the skull, moving at the temporomandibular joints for chewing and speech. It gives attachment to the muscles of mastication.",
   ["Temporal bones (temporomandibular joints)"], False),
}
# explicit colour per bone for the isolated view: cranial bones warm, facial bones cool, left darker than right
COL = {
 "frontal-bone": "#e9b44c", "parietal-bone-left": "#e0603f", "parietal-bone-right": "#f2a07b",
 "temporal-bone-left": "#c2417a", "temporal-bone-right": "#e58ab4", "occipital-bone": "#9c6b4e",
 "sphenoid-bone": "#f4d35e", "ethmoid-bone": "#ff8c42",
 "nasal-bone-left": "#1b998b", "nasal-bone-right": "#6fd6c8", "maxilla-left": "#2f6fdb", "maxilla-right": "#79a6f2",
 "zygomatic-bone-left": "#7a4fd0", "zygomatic-bone-right": "#b8a1e8", "lacrimal-bone-left": "#0f8a9d", "lacrimal-bone-right": "#58cfe0",
 "palatine-bone-left": "#3c8d40", "palatine-bone-right": "#8cc98f", "inferior-nasal-concha-left": "#d6457c", "inferior-nasal-concha-right": "#f19bc0",
 "vomer": "#5c6bc0", "mandible": "#8e5bd9",
}


def find_record(src, rid):
    j = src.find("{id:`%s`," % rid)
    if j < 0:
        raise SystemExit("record %s not found" % rid)
    d, k, q = 0, j, None
    while True:
        ch = src[k]
        if q:
            if ch == "\\":
                k += 1
            elif ch == q:
                q = None
        elif ch in "`\"'":
            q = ch
        elif ch == "{":
            d += 1
        elif ch == "}":
            d -= 1
            if d == 0:
                break
        k += 1
    return j, k + 1


def js(t):
    return "`" + t.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`"


def arr(items):
    return "[" + ",".join(js(i) for i in items) + "]"


def field(rec, name):
    m = re.search(r"(?:^|,)%s:`((?:[^`\\]|\\.)*)`" % name, rec)
    return m.group(1) if m else None


out = s
for rid, row in B.items():
    j, k = find_record(out, rid)
    old = out[j:k]
    name, latin = field(old, "name"), field(old, "latinName")
    syn = re.search(r"synonyms:\[[^\]]*\]", old)
    src_tok = re.search(r"sources:\[[^\]]*\]", old).group(0)
    cls, loc, desc, func, art, paired = row[:6]
    common = ("system:`skeletal`,region:`head`,layer:`bones`,parentId:`skull`,")
    # the group record keeps the type's name; for paired bones it is the parent of the Left and Right structures
    note = " (%s of the 22 bones of the skull; 8 cranial and 14 facial)" % ("1" if not paired else "2")
    base = ("{id:`%s`,name:%s,latinName:%s,%s%sboneClass:%s,location:%s,description:%s,function:%s,articulations:%s,%s,reviewStatus:`reviewed`}"
            % (rid, js(name), js(latin), (syn.group(0) + ",") if syn else "", common, js(cls), js(loc),
               js(desc + (" Counted as two bones, left and right." if paired else " Counted as one bone.")), js(func), arr(art), src_tok))
    new = base
    if paired:
        for side, lat in (("left", row[6]), ("right", row[7])):
            sid = "%s-%s" % (rid, side)
            nm = "%s %s" % (side.capitalize(), name[0].lower() + name[1:])
            sloc = loc.replace("Forms", "The %s one forms" % side, 1) if loc.startswith("Forms") else loc
            new += (",{id:`%s`,name:%s,latinName:%s,%ssystem:`skeletal`,region:`head`,layer:`bones`,parentId:`%s`,side:`%s`,boneClass:%s,"
                    "location:%s,description:%s,function:%s,articulations:%s,%s,reviewStatus:`reviewed`}"
                    % (sid, js(nm), js(lat), (syn.group(0) + ",") if syn else "", rid, side, js(cls),
                       js("%s side. %s" % (side.capitalize(), sloc)), js(desc), js(func), arr(art), src_tok))
    out = out[:j] + new + out[k:]

# mesh -> structure mapping for the 16 paired meshes (_1 is the patient's left, _2 the right)
PAIR = {"za_parietal": "parietal-bone", "za_temporal": "temporal-bone", "za_nasal": "nasal-bone", "za_maxilla": "maxilla",
        "za_zygomatic": "zygomatic-bone", "za_lacrimal_bone": "lacrimal-bone", "za_palatine": "palatine-bone", "za_inf_concha": "inferior-nasal-concha"}
for mesh, sid in PAIR.items():
    for n, side in ((1, "left"), (2, "right")):
        a = "%s_%d:`%s`" % (mesh, n, sid)
        assert out.count(a) == 1, a
        out = out.replace(a, "%s_%d:`%s-%s`" % (mesh, n, sid, side))

# colour table published for the viewer (read by __avTint)
import json
def _mix(h,a=0.32,base=(0xe8,0xdf,0xca)):
    r=[int(h[i:i+2],16) for i in (1,3,5)]
    return "#%02x%02x%02x"%tuple(round(base[i]*(1-a)+r[i]*a) for i in range(3))
out += "\nglobalThis.__avBoneCol=%s;\n" % json.dumps({k:_mix(v) for k,v in COL.items()})
open(MAN, "w", encoding="utf-8").write(out)
print("22-bone records written;", len(out) - len(s), "bytes added")
