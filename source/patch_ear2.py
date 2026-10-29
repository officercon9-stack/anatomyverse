#!/usr/bin/env python3
"""Label the ear inner-ear parts as original AnatomyVerse work (replaced Z-Anatomy inner-ear meshes for licence safety)."""
import sys, glob
ROOT = sys.argv[1]
M = glob.glob(ROOT + '/assets/assetManifest-*.js')[0]
s = open(M).read()
def once(s, old, new):
    assert s.count(old) == 1, (s.count(old), old[:70]); return s.replace(old, new)
s = once(s, "license:`CC BY-SA 4.0 \\u2014 Z-Anatomy (middle and inner ear); CC BY-SA 2.1 Japan \\u2014 BodyParts3D (auricle)`",
 "license:`CC BY-SA 4.0 \\u2014 Z-Anatomy (auditory ossicles, tympanic membrane, chorda tympani); CC BY-SA 2.1 Japan \\u2014 BodyParts3D (auricle); original AnatomyVerse work (cochlea, vestibule and semicircular canals, vestibulocochlear nerve and its branches)`")
s = once(s, "Converted and simplified for AnatomyVerse.`,description:`Both ears, scan-derived:",
 "Converted and simplified for AnatomyVerse. The cochlea, vestibule with semicircular canals and the vestibulocochlear nerve with its branches are simplified original drawings made for AnatomyVerse, not taken from any third-party model.`,description:`Both ears. The auricle, auditory ossicles, tympanic membrane and chorda tympani are scan-derived; the cochlea, vestibule with semicircular canals and the nerve branches are simplified drawings:")
for rid, name in (('cochlea','Cochlea'),('vestibule','Vestibule and semicircular canals'),('vestibulocochlear-nerve','Vestibulocochlear nerve'),('cochlear-nerve','Cochlear nerve'),('vestibular-nerve','Vestibular nerve')):
    pass
# add a plain note to each affected record's location text
for rid in ('cochlea','vestibule','vestibulocochlear-nerve','cochlear-nerve','vestibular-nerve'):
    i = s.index("{id:`%s`,name:" % rid)
    j = s.index("description:`", i) + len("description:`")
    s = s[:j] + "(Simplified 3D drawing, not scan-derived.) " + s[j:]
open(M, 'w').write(s)
print('ear2 patched')
