#!/usr/bin/env python3
"""Write the licence credit into each third-party GLB (asset.copyright + extras) so it travels with the file."""
import json, struct, glob, os, sys
ROOT = sys.argv[1]
Z = "Z-Anatomy (G. Kervyn et al.), CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/ , derived from BodyParts3D (c) DBCLS, CC BY-SA 2.1 Japan. Converted, simplified and modified for AnatomyVerse; derived files remain under CC BY-SA. Source: https://github.com/LluisV/Z-Anatomy"
B = "BodyParts3D (c) The Database Center for Life Science, CC BY-SA 2.1 Japan https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en . Decimated, converted and modified for AnatomyVerse; derived files remain under CC BY-SA. Source: https://lifesciencedb.jp/bp3d/"
def credit(n):
    if n == 'zanatomy-ear.glb': return "Ossicles, tympanic membrane and chorda tympani: " + Z + " Auricle: " + B + " Cochlea, vestibule, semicircular canals and VIII nerve branches: original AnatomyVerse work."
    if n.startswith('zanatomy-'): return Z
    if n.startswith('bodyparts3d-') or n in ('anatomyverse-organs.glb', 'anatomyverse-limbs.glb'): return B
for f in glob.glob(ROOT + '/models/**/*.glb', recursive=True):
    c = credit(os.path.basename(f))
    if not c: continue
    raw = open(f, 'rb').read()
    jl = struct.unpack('<I', raw[12:16])[0]
    g = json.loads(raw[20:20 + jl])
    g.setdefault('asset', {})['copyright'] = c
    g['asset'].setdefault('extras', {})['license'] = c
    j = json.dumps(g, separators=(',', ':')).encode()
    j += b' ' * ((4 - len(j) % 4) % 4)
    rest = raw[20 + jl:]
    out = raw[:8] + struct.pack('<I', 12 + 8 + len(j) + len(rest)) + struct.pack('<I', len(j)) + raw[16:20] + j + rest
    open(f, 'wb').write(out)
    print('credited', f)
