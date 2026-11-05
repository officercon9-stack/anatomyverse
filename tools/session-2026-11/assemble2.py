import json,re,glob,subprocess
G='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ghclone/'
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
exec(open('/tmp/jx/bursacontent.py').read())
B=[t for t in B if t[1]!='subtendinous-bursa-of-tibialis-anterior']
J=json.load(open('/tmp/jx/joints3.json'));S=json.load(open('/tmp/jx/bursae_skinned.json'))
keep={t[1] for t in B}
for k,v in S.items():
    if k.split('|')[0] in keep:J[k]=v
json.dump(J,open('/tmp/jx/joints4.json','w'))
subprocess.run(['node',SC+'tools/buildjoints.mjs','/tmp/jx/joints4.json','/tmp/jx/zj4.glb','','/tmp/jx/objmap4.json'],check=True)
subprocess.run(['node',SC+'tools/buildjoints.mjs','/tmp/jx/joints4.json','/tmp/jx/zj4-lite.glb','1'],check=True)
om=json.load(open('/tmp/jx/objmap4.json'))
def esc(x):return x.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
def Lst(x):return '['+','.join('`'+esc(i)+'`' for i in x)+']'
def rec(i,name,latin,syn,region,loc,desc,fn,clin):
    return '{id:`%s`,name:`%s`,latinName:`%s`,synonyms:%s,system:`skeletal`,region:`%s`,layer:`bones`,location:`%s`,description:`%s`,function:`%s`,clinicalRelevance:`%s`,sources:[],reviewStatus:`pending-expert-review`}'%(i,esc(name),esc(latin),Lst(syn),region,esc(loc),esc(desc),esc(fn),esc(clin))
def sided(i,name,region,sd):
    S_=sd.capitalize();nm=name[0].lower()+name[1:]
    return '{id:`%s-%s`,name:`%s %s`,synonyms:[],system:`skeletal`,region:`%s`,layer:`bones`,parentId:`%s`,side:`%s`,location:`%s side of the body.`,description:`The %s %s. Its structure, function and clinical notes are the same as the other side and are given under %s.`,sources:[],reviewStatus:`pending-expert-review`}'%(i,sd,S_,esc(nm),region,i,sd,S_,sd,esc(nm),esc(name))
out=[]
for z,i,name,latin,syn,reg,loc,desc,fn,clin in B:
    out+= [rec(i,name,latin,syn,reg,loc,desc,fn,clin),sided(i,name,reg,'left'),sided(i,name,reg,'right')]
mp=glob.glob(G+'assets/assetManifest-*b110.js')[0];s=open(mp).read()
a=s.find('"objectMap": {"zj_medial_meniscus_l_1"');b=s.find('}',a);assert a>0
s=s[:a]+'"objectMap": '+json.dumps(om)+s[b+1:]
en=s.find('{id:`fimbriae-of-uterine-tube`');s=s[:en]+','.join(out)+','+s[en:]
open(mp,'w').write(s)
vf=glob.glob(G+'assets/AnatomyViewer-*-b110.js')[0];v=open(vf).read()
m=re.search(r'var _JOINTSEL=new Set\((\[.*?\])\);',v);ids=json.loads(m.group(1))
for i in sorted(keep):ids+=[i,i+'-left',i+'-right']
v=v[:m.start()]+'var _JOINTSEL=new Set('+json.dumps(ids)+');'+v[m.end():];open(vf,'w').write(v)
print('records',len(out),len(ids))
