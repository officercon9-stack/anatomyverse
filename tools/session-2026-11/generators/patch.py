import json,re,sys
root=sys.argv[1];fn=sys.argv[2]
F=json.load(open('sup/F2.json'))
p=f'{root}/assets/{fn}'
s=open(p).read()
def bt(t): return '`'+t.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')+'`'
miss=[];n=0
for i,d in F.items():
    a=f"{{id:`{i}`,"
    b=f'{{"id": "{i}",'
    if s.count(a)+s.count(b)!=1:
        # allow "id":"x" without space
        c=f'{{"id":"{i}",'
        if s.count(a)+s.count(b)+s.count(c)!=1: miss.append((i,s.count(a),s.count(b),s.count(c)));continue
        b=c
    if s.count(a)==1:
        ins=''.join(f"{k}:{bt(v)}," for k,v in d.items()); s=s.replace(a,a+ins,1)
    else:
        ins=''.join(f'"{k}": {json.dumps(v)}, ' for k,v in d.items()); s=s.replace(b,b+ins,1)
    n+=1
open(p,'w').write(s)
print('patched',n,'missing',len(miss),miss[:10])
