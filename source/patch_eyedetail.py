#!/usr/bin/env python3
"""Z-Anatomy eye detail: real optic nerves, eyelid tarsal plates, palpebral orbicularis oculi, zonular fibres, lacrimal canaliculus."""
import sys, glob, shutil, os
ROOT = sys.argv[1]
M = glob.glob(ROOT + '/assets/assetManifest-*.js')[0]
V = glob.glob(ROOT + '/assets/AnatomyViewer-*.js')[0]
s = open(M).read()
assert 'zanatomy-eyedetail' not in s
def once(s, old, new):
    assert s.count(old) == 1, (s.count(old), old[:80])
    return s.replace(old, new)
S = lambda b, sid: ",".join("za_%s_%s:`%s`" % (b, x, sid) for x in "lr")
omap = ",".join([S('optic_nerve','optic-nerve'), S('tarsus_sup','tarsal-plates'), S('tarsus_inf','tarsal-plates'),
                 S('orbicularis_palp','orbicularis-oculi-palpebral'), S('zonule','zonular-fibres'), "za_lcanal_l:`lacrimal-apparatus`"])
asset = ("{id:`zanatomy-eyedetail`,name:`Eye detail: optic nerve, eyelids, zonule (Z-Anatomy)`,kind:`gltf`,url:`./models/zanatomy-eyedetail.glb`,fidelity:`anatomical`,"
 "license:`CC BY-SA 4.0 \\u2014 Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP)`,"
 "attribution:`Z-Anatomy \\u2014 the libre 3D atlas of anatomy (G. Kervyn et al.); BodyParts3D \\u00a9 The Database Center for Life Science. Converted and simplified for AnatomyVerse. The left zonular fibres are the mirror image of the right.`,"
 "description:`Scan-derived detail added to the eye: both optic nerves running back to the chiasm, the superior and inferior tarsal plates of the eyelids, the palpebral part of orbicularis oculi, the suspensory (zonular) fibres of the lens and the lacrimal canaliculus.`,"
 "objectMap:{" + omap + "}},")
s = once(s, "{id:`zanatomy-limbbones`,name:", asset + "{id:`zanatomy-limbbones`,name:")
s = once(s, "{assetId:`zanatomy-eye`,replacesParts:[`eye_L`,`eye_R`]},", "{assetId:`zanatomy-eye`,replacesParts:[`eye_L`,`eye_R`]},{assetId:`zanatomy-eyedetail`,replacesParts:[`optic_nerve_L`,`optic_nerve_R`]},")
def rec(i, name, latin, system, layer, loc, desc, func, clin=""):
    q = lambda t: t.replace("`", "'")
    return ("{id:`%s`,name:`%s`,latinName:`%s`,system:`%s`,region:`head`,layer:`%s`,parentId:`eye`,location:`%s`,description:`%s`,function:`%s`,%ssources:[...y(v.somatic)],reviewStatus:`reviewed`},"
            % (i, name, latin, system, layer, q(loc), q(desc), q(func), ("clinicalRelevance:`%s`," % q(clin)) if clin else ""))
R = [rec('tarsal-plates', 'Tarsal plates (eyelid skeleton)', 'Tarsus superior et inferior', 'special-senses', 'organs',
 'Inside the upper and lower eyelids, just behind the skin and orbicularis oculi, along the lid margin.',
 'Two crescent-shaped plates of dense fibrous tissue. The superior plate is about 10 mm high at its centre, the inferior about 5 mm. They hold the meibomian (tarsal) glands, and the levator palpebrae superioris inserts into the upper one.',
 'Give the eyelids their shape and stiffness and keep the lid margins against the globe; the meibomian glands add the oily layer of the tear film.',
 'A blocked meibomian gland forms a chalazion; the upper lid is everted over the superior tarsus to look for foreign bodies.'),
 rec('orbicularis-oculi-palpebral', 'Orbicularis oculi — palpebral part', 'Musculus orbicularis oculi, pars palpebralis', 'muscular', 'muscles',
 'In the upper and lower eyelids, in front of the tarsal plates.',
 'The thin inner part of orbicularis oculi. Its fibres arc across each lid from the medial palpebral ligament to the lateral palpebral raphe.',
 'Closes the eyelids gently, as in blinking and sleep. The thicker orbital part squeezes them tightly shut.',
 'Facial nerve (CN VII) palsy weakens it, so the eye cannot close fully and the cornea is at risk of drying.'),
 rec('zonular-fibres', 'Zonular fibres (suspensory ligament of the lens)', 'Fibrae zonulares', 'special-senses', 'organs',
 'Between the ciliary body and the equator of the lens, behind the iris.',
 'Many fine, strong fibres that run from the ciliary processes to the lens capsule and hold the lens in place. The ciliary body they arise from is not yet modelled separately in 3D.',
 'Transmit the pull of the ciliary muscle to the lens: when the muscle relaxes the fibres tighten and flatten the lens for distance, and when it contracts they slacken and the lens thickens for near vision.',
 'Weak or broken fibres, as in Marfan syndrome, let the lens drift out of position (ectopia lentis).')]
s = once(s, "{id:`cornea`,", "".join(R) + "{id:`cornea`,")
# optic nerve text: now scan-derived
a = "Not a true peripheral nerve but an outgrowth of the brain; shown here as a simplified procedural tube added alongside the scan-derived eye (the source dataset did not include a separate optic-nerve mesh)."
s = once(s, a, "Not a true peripheral nerve but an outgrowth of the brain. Each nerve runs from the back of the eyeball to the optic chiasm; the mesh is scan-derived (Z-Anatomy).")
open(M, 'w').write(s)
v = open(V).read()
v = once(v, "/sclera/.test(_i)?'#ece6da'", "/tarsal/.test(_i)?'#d8c3a5':/zonular/.test(_i)?'#e8e2d0':/sclera/.test(_i)?'#ece6da'")
v = v.replace('lacrimal-(gland|sac|canal)|nasolacrimal', 'lacrimal-(gland|sac|canal|apparatus)|nasolacrimal')
open(V, 'w').write(v)
for sub, src in (('', 'eyed_out/zanatomy-eyedetail.glb'), ('lite/', 'eyed_out/zanatomy-eyedetail-lite.glb')):
    os.makedirs(ROOT + '/models/' + sub, exist_ok=True)
    shutil.copy(src, ROOT + '/models/' + sub + 'zanatomy-eyedetail.glb')
print('eyedetail patched')
