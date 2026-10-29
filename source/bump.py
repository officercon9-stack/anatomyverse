#!/usr/bin/env python3
"""Rename changed chunks and cascade the rename to every referrer, so no browser
can serve a stale copy of anything whose content changed."""
import os, re, sys, glob
ROOT, NEW = sys.argv[1], sys.argv[2]
START = sys.argv[3:]
AS = os.path.join(ROOT, "assets")

def bump(path, new):
    base = os.path.basename(path)
    stem = re.sub(r"-b\d+(?=\.js$)", "", base)[:-3]
    newbase = "%s-%s.js" % (stem, new)
    if newbase == base:
        return []
    oldkey, refs = base[:-3], []
    for f in glob.glob(os.path.join(AS, "*.js")) + [os.path.join(ROOT, "index.html")]:
        if not os.path.exists(f):
            continue
        t = open(f, encoding="utf-8").read()
        if oldkey in t:
            open(f, "w", encoding="utf-8").write(t.replace(oldkey, newbase[:-3]))
            if f.endswith(".js") and os.path.abspath(f) != os.path.abspath(path):
                refs.append(f)
    os.rename(path, os.path.join(AS, newbase))
    print("  bumped %s -> %s" % (base, newbase))
    return refs

queue = [os.path.join(AS, p) if not os.path.isabs(p) else p for p in START]
seen = set()
while queue:
    p = queue.pop(0)
    if os.path.abspath(p) in seen or not os.path.exists(p):
        continue
    seen.add(os.path.abspath(p))
    for r in bump(p, NEW):
        if os.path.abspath(r) not in seen:
            queue.append(r)
print("done")
