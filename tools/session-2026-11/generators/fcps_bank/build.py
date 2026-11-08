#!/usr/bin/env python3
"""Build the lazy FCPS question bank chunks and wire them into QuizPage.

Usage: python3 build.py <repo root> <new bNNN suffix for QuizPage cascade>
Batches live in batches/<cat>_<n>.py (cat: ana phy bio pat pha), each defining
Q = [(prompt, [correct, wrong1, wrong2, wrong3], explanation), ...]
The correct answer is listed FIRST; QuizPage shuffles its position by a hash of the id.
Ids become q-fcps-<cat><n>-NN. Prompts already in the pool (fcps_existing.json) or repeated are dropped.
"""
import sys, os, re, glob, json, hashlib, importlib.util, subprocess
ROOT, NEW = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
AS = os.path.join(ROOT, 'assets')
norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()
seen = set()
ex = os.path.join(HERE, 'fcps_existing.json')
if os.path.exists(ex):
    for r in json.load(open(ex)): seen.add(norm(r[1]))
names = []
tot = 0
for cat in ['ana', 'phy', 'bio', 'pat', 'pha']:
    rows = []
    for f in sorted(glob.glob(os.path.join(HERE, 'batches', cat + '_*.py'))):
        n = re.search(r'_(\d+)\.py$', f).group(1)
        spec = importlib.util.spec_from_file_location('b', f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        i = 0
        for q in m.Q:
            p, o, e = q
            assert len(o) == 4 and len(set(x.strip().lower() for x in o)) == 4, ('options', p)
            k = norm(p)
            if k in seen: print('  dropped duplicate:', p[:70]); continue
            seen.add(k); i += 1
            rows.append(['q-fcps-%s%s-%02d' % (cat, n, i), p, o, e])
    body = 'export default ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
    h = hashlib.sha1(body.encode()).hexdigest()[:8]
    for old in glob.glob(os.path.join(AS, 'FcpsBank-%s-*.js' % cat)): os.remove(old)
    open(os.path.join(AS, 'FcpsBank-%s-%s.js' % (cat, h)), 'w', encoding='utf-8').write(body)
    names.append('./FcpsBank-%s-%s.js' % (cat, h)); tot += len(rows)
    print(cat, len(rows))
q = glob.glob(os.path.join(AS, 'QuizPage-*.js'))[0]
t = open(q, encoding='utf-8').read()
t, c = re.subn(r'var _FBANKS=\[[^\]]*\];', 'var _FBANKS=' + json.dumps(names) + ';', t)
assert c == 1
open(q, 'w', encoding='utf-8').write(t)
print('bank questions', tot)
subprocess.check_call([sys.executable, os.path.join(ROOT, 'source', 'bump.py'), ROOT, NEW, os.path.basename(q)])
