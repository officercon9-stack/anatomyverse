#!/usr/bin/env python3
"""Add the Z-Anatomy middle/inner ear + BodyParts3D auricle as an always-on overlay with 11 structure records."""
import sys, glob, shutil, os
ROOT = sys.argv[1]
M = glob.glob(ROOT + '/assets/assetManifest-*.js')[0]
s = open(M).read()
assert 'zanatomy-ear' not in s

def once(s, old, new):
    assert s.count(old) == 1, (s.count(old), old[:80])
    return s.replace(old, new)

SIDES = lambda base, sid: ",".join("za_%s_%s:`%s`" % (base, x, sid) for x in ("l", "r"))
omap = ",".join([SIDES('auricle', 'auricle'), SIDES('tympanic_membrane', 'tympanic-membrane'), SIDES('malleus', 'malleus'),
                 SIDES('incus', 'incus'), SIDES('stapes', 'stapes'), SIDES('cochlea', 'cochlea'), SIDES('vestibule', 'vestibule'),
                 SIDES('vc_nerve', 'vestibulocochlear-nerve'), SIDES('cochlear_nerve', 'cochlear-nerve'),
                 SIDES('vestibular_nerve', 'vestibular-nerve'), SIDES('chorda_tympani', 'chorda-tympani')])
asset = ("{id:`zanatomy-ear`,name:`Ear: auricle, middle and inner ear (Z-Anatomy)`,kind:`gltf`,url:`./models/zanatomy-ear.glb`,fidelity:`anatomical`,"
         "license:`CC BY-SA 4.0 \\u2014 Z-Anatomy (middle and inner ear); CC BY-SA 2.1 Japan \\u2014 BodyParts3D (auricle)`,"
         "attribution:`Z-Anatomy \\u2014 the libre 3D atlas of anatomy (G. Kervyn et al.); BodyParts3D \\u00a9 The Database Center for Life Science, CC BY-SA 2.1 Japan. The auricle is registered onto the Z-Anatomy temporal bone. Converted and simplified for AnatomyVerse.`,"
         "description:`Both ears, scan-derived: the auricle, tympanic membrane, the three auditory ossicles (malleus, incus, stapes), the cochlea, the vestibule with the semicircular canals, the vestibulocochlear nerve with its cochlear and vestibular branches, and the chorda tympani. Isolate Ear to see them; the surrounding temporal bone is not drawn in the isolated view.`,"
         "objectMap:{" + omap + "}},")
s = once(s, "{id:`zanatomy-limbbones`,name:", asset + "{id:`zanatomy-limbbones`,name:")
s = once(s, "{assetId:`zanatomy-eye`,replacesParts:[`eye_L`,`eye_R`]},", "{assetId:`zanatomy-eye`,replacesParts:[`eye_L`,`eye_R`]},{assetId:`zanatomy-ear`,replacesParts:[`ear_L`,`ear_R`]},")

def rec(i, name, latin, system, layer, loc, desc, func, clin, extra=""):
    q = lambda t: t.replace("`", "'")
    return ("{id:`%s`,name:`%s`,latinName:`%s`,system:`%s`,region:`head`,layer:`%s`,parentId:`ear`,location:`%s`,description:`%s`,function:`%s`,%ssources:[...y(v.somatic)],reviewStatus:`reviewed`},"
            % (i, name, latin, system, layer, q(loc), q(desc), q(func), ("clinicalRelevance:`%s`," % q(clin)) if clin else "") + extra)

R = []
R.append(rec('auricle', 'Auricle (pinna)', 'Auricula', 'special-senses', 'organs',
 'Projects from the side of the head, lateral to the external acoustic meatus.',
 'A skin-covered plate of elastic cartilage. The rim is the helix, with the antihelix as a parallel ridge inside it; the tragus and antitragus lie in front of and below the meatus, the concha surrounds the meatus, and the lobule below has no cartilage.',
 'Collects sound and funnels it into the external acoustic meatus; its folds help the brain judge whether a sound comes from above or below.',
 'Auricular haematoma after a blow (cauliflower ear) and perichondritis; the lobule is the usual site for ear piercing.'))
R.append(rec('tympanic-membrane', 'Tympanic membrane (eardrum)', 'Membrana tympanica', 'special-senses', 'organs',
 'Closes the inner end of the external acoustic meatus and separates it from the tympanic cavity of the middle ear.',
 'A thin, oval, pearly-grey membrane about 9 to 10 mm across, tilted so that it faces downward and forward. The handle of the malleus is attached to its inner surface and pulls the centre inward as a small cone, the umbo.',
 'Vibrates with sound pressure and passes the vibration to the malleus.',
 'Perforation after trauma or infection; it bulges red in acute otitis media and is inspected with an otoscope.'))
R.append(rec('malleus', 'Malleus (hammer)', 'Malleus', 'skeletal', 'bones',
 'Most lateral of the three auditory ossicles, in the tympanic cavity of the middle ear.',
 'Hammer-shaped, with a head, neck, handle and anterior and lateral processes. The handle is fixed into the tympanic membrane and the head articulates with the incus. Tensor tympani inserts on it.',
 'Receives vibration from the tympanic membrane and transmits it to the incus.',
 'Can be eroded in chronic otitis media or fixed in otosclerosis, causing conductive hearing loss.'))
R.append(rec('incus', 'Incus (anvil)', 'Incus', 'skeletal', 'bones',
 'Middle ossicle, in the tympanic cavity between the malleus and stapes.',
 'Anvil-shaped: a body that articulates with the malleus, a short limb pointing back toward the mastoid antrum, and a long limb whose lenticular process articulates with the head of the stapes.',
 'Transmits vibration from the malleus to the stapes.',
 'Its long limb has a poor blood supply and is the ossicle most often eroded in chronic otitis media.'))
R.append(rec('stapes', 'Stapes (stirrup)', 'Stapes', 'skeletal', 'bones',
 'Innermost ossicle, in the tympanic cavity; its footplate sits in the oval window of the vestibule.',
 'Stirrup-shaped, with a head, two limbs and a footplate held in the oval window by the annular ligament. It is the smallest bone in the body, and stapedius inserts on its neck.',
 'Transmits vibration from the incus into the perilymph of the inner ear. The ossicular chain and the small footplate raise the pressure about twenty-fold.',
 'Fixation of the footplate in otosclerosis is a classic cause of conductive hearing loss, treated by stapedotomy.'))
R.append(rec('cochlea', 'Cochlea', 'Cochlea', 'special-senses', 'organs',
 'Front part of the bony labyrinth in the petrous part of the temporal bone, in front of the vestibule.',
 'A spiral canal of about two and three-quarter turns around a bony core, the modiolus. It is divided lengthwise into the scala vestibuli, the cochlear duct (containing the organ of Corti) and the scala tympani.',
 'Turns sound pressure waves into nerve impulses: hair cells of the organ of Corti are stimulated by movement of the basilar membrane, high pitches at the base and low pitches at the apex.',
 'Sensorineural hearing loss from hair-cell damage (noise, ageing, ototoxic drugs); cochlear implants stimulate the cochlear nerve directly.'))
R.append(rec('vestibule', 'Vestibule and semicircular canals', 'Vestibulum et canales semicirculares', 'special-senses', 'organs',
 'Part of the bony labyrinth behind the cochlea, in the petrous part of the temporal bone.',
 'The vestibule is the central chamber containing the utricle and saccule; its lateral wall carries the oval window. The anterior, posterior and lateral semicircular canals open from it at roughly right angles to one another and each ends in an ampulla.',
 'The utricle and saccule sense linear acceleration and head tilt; the canals sense rotation of the head in three planes. Together they support balance and gaze stability.',
 'Benign paroxysmal positional vertigo (displaced otoliths in a canal), vestibular neuritis and Meniere disease.'))
R.append(rec('vestibulocochlear-nerve', 'Vestibulocochlear nerve (CN VIII)', 'Nervus vestibulocochlearis', 'nervous', 'nerves',
 'Runs from the inner ear through the internal acoustic meatus to the junction of the pons and medulla.',
 'A sensory cranial nerve formed by two parts: the cochlear nerve for hearing and the vestibular nerve for balance.',
 'Carries sound and balance information from the inner ear to the cochlear and vestibular nuclei of the brainstem.',
 'Vestibular schwannoma (acoustic neuroma) at the cerebellopontine angle causes one-sided hearing loss, tinnitus and imbalance.'))
R.append(rec('cochlear-nerve', 'Cochlear nerve', 'Nervus cochlearis', 'nervous', 'nerves',
 'Leaves the modiolus of the cochlea and joins the vestibular nerve in the internal acoustic meatus.',
 'The auditory part of the vestibulocochlear nerve; its cell bodies lie in the spiral ganglion inside the cochlea.',
 'Carries impulses from the hair cells of the organ of Corti to the cochlear nuclei.',
 'Its integrity decides whether a cochlear implant will work.'))
R.append(rec('vestibular-nerve', 'Vestibular nerve', 'Nervus vestibularis', 'nervous', 'nerves',
 'Runs from the utricle, saccule and semicircular canal ampullae to the internal acoustic meatus.',
 'The balance part of the vestibulocochlear nerve; its cell bodies lie in the vestibular (Scarpa) ganglion.',
 'Carries head-position and head-movement signals to the vestibular nuclei.',
 'Vestibular neuritis, usually viral, causes sudden severe vertigo without hearing loss.'))
R.append(rec('chorda-tympani', 'Chorda tympani', 'Chorda tympani', 'nervous', 'nerves',
 'Branch of the facial nerve that crosses the tympanic cavity between the handle of the malleus and the long limb of the incus.',
 'A small nerve that leaves the facial nerve in the temporal bone, passes through the middle ear without supplying it, and joins the lingual nerve.',
 'Carries taste from the anterior two-thirds of the tongue and parasympathetic fibres to the submandibular and sublingual glands.',
 'Can be stretched or cut in middle-ear surgery, causing a metallic taste and dry mouth on that side.'))
ins = "".join(R)
s = once(s, "{id:`cornea`,", ins + "{id:`cornea`,")
open(M, 'w').write(s)
for d, sub in (('full', ''), ('lite', 'lite/')):
    src = 'ear_out/zanatomy-ear.glb' if d == 'full' else 'ear_out/zanatomy-ear-lite.glb'
    os.makedirs(ROOT + '/models/' + sub, exist_ok=True)
    shutil.copy(src, ROOT + '/models/' + sub + 'zanatomy-ear.glb')
print('ear patched', M)
