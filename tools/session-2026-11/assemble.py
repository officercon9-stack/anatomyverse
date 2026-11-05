import json,re,glob,subprocess,sys
sys.path.insert(0,'/tmp/jx')
G='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ghclone/'
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
J=json.load(open('/tmp/jx/joints2.json'));J.update(json.load(open('/tmp/jx/arm_skinned.json')))
json.dump(J,open('/tmp/jx/joints3.json','w'))
subprocess.run(['node',SC+'tools/buildjoints.mjs','/tmp/jx/joints3.json','/tmp/jx/zj3.glb','','/tmp/jx/objmap3.json'],check=True)
subprocess.run(['node',SC+'tools/buildjoints.mjs','/tmp/jx/joints3.json','/tmp/jx/zj3-lite.glb','1'],check=True)
om=json.load(open('/tmp/jx/objmap3.json'))
# records
ns={}
exec(open('/tmp/jx/content.py').read(),ns)
base={t[1]:t for t in ns['C']}
exec(open('/tmp/jx/newcontent.py').read(),ns)
newc={t[0]:t for t in ns['N']}
ARMIDS=set(json.load(open('/tmp/jx/armids.json')))
def esc(x):return x.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
def L(x):return '['+','.join('`'+esc(i)+'`' for i in x)+']'
def rec(i,name,latin,syn,region,loc,desc,fn,clin):
    return '{id:`%s`,name:`%s`,latinName:`%s`,synonyms:%s,system:`skeletal`,region:`%s`,layer:`bones`,location:`%s`,description:`%s`,function:`%s`,clinicalRelevance:`%s`,sources:[],reviewStatus:`pending-expert-review`}'%(i,esc(name),esc(latin),L(syn),region,esc(loc),esc(desc),esc(fn),esc(clin))
def sided(i,name,region,sd):
    S=sd.capitalize()
    nm=name[0].lower()+name[1:] if not name[:2].isupper() else name
    return '{id:`%s-%s`,name:`%s %s`,synonyms:[],system:`skeletal`,region:`%s`,layer:`bones`,parentId:`%s`,side:`%s`,location:`%s side of the body.`,description:`The %s %s. Its structure, function and clinical notes are the same as the other side and are given under %s.`,sources:[],reviewStatus:`pending-expert-review`}'%(i,sd,S,esc(nm),region,i,sd,S,sd,esc(nm),esc(name))
out=[]
for i in sorted(ARMIDS):
    if i in base:
        _,_,name,latin,syn,region,loc,desc,fn,clin=base[i]
    else:
        name,latin,syn,region,loc,desc,fn,clin=newc[i][1:]
    out.append(rec(i,name,latin,syn,region,loc,desc,fn,clin));out.append(sided(i,name,region,'left'));out.append(sided(i,name,region,'right'))
mp=glob.glob(G+'assets/assetManifest-*b109.js')[0];s=open(mp).read()
a=s.find('"objectMap": {"zj_medial_meniscus_l_1"');b=s.find('}',a);assert a>0
s=s[:a]+'"objectMap": '+json.dumps(om)+s[b+1:]
en=s.find('{id:`fimbriae-of-uterine-tube`');s=s[:en]+','.join(out)+','+s[en:]
open(mp,'w').write(s)
ids=json.load(open('/tmp/jx/ids2.json'))
for i in sorted(ARMIDS):ids+= [i,i+'-left',i+'-right']
vf=glob.glob(G+'assets/AnatomyViewer-*-b109.js')[0];v=open(vf).read()
m=re.search(r'var _JOINTSEL=new Set\(\[.*?\]\);',v);v=v[:m.start()]+'var _JOINTSEL=new Set('+json.dumps(ids)+');'+v[m.end():];open(vf,'w').write(v)
print('records',len(out),'ids',len(ids))
