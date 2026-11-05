import json,re
G='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ghclone/'
keep=set(json.load(open('/tmp/jx/keep.json')))
om=json.load(open('/tmp/jx/objmap2.json'))
mp=G+'assets/assetManifest-D3o27EUe-b108.js'
s=open(mp).read()
# 1 objectMap
a=s.find('"objectMap": {"zj_medial_meniscus_l_1"');b=s.find('}',a)
assert a>0
s=s[:a]+'"objectMap": '+json.dumps(om)+s[b+1:]
# 2 records
st=s.find('{id:`medial-meniscus`');en=s.find('{id:`fimbriae-of-uterine-tube`')
seg=s[st:en]
recs=re.split(r'(?<=\}),(?=\{id:`)',seg.rstrip(','))
def base(i):
    return re.sub(r'-(left|right)$','',i)
kept=[];ids=[]
for r in recs:
    i=re.match(r'\{id:`([^`]+)`',r).group(1)
    if base(i) in keep or i in keep:
        kept.append(r);ids.append(i)
print(len(recs),'->',len(kept))
s=s[:st]+','.join(kept)+','+s[en:]
open(mp,'w').write(s)
json.dump(ids,open('/tmp/jx/ids2.json','w'))
