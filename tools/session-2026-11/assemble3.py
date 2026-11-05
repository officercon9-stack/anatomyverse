import json,re,glob,subprocess
G_='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ghclone/'
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
SC='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/'
exec(open('/tmp/jx/lymphcontent.py').read())
J=json.load(open('/tmp/jx/joints4.json'));S=json.load(open('/tmp/jx/lymph_skinned.json'));J.update(S)
json.dump(J,open('/tmp/jx/joints5.json','w'))
for out,lite in(('/tmp/jx/zj5.glb',''),('/tmp/jx/zj5-lite.glb','1')):
    subprocess.run(['node',SC+'tools/buildjoints.mjs','/tmp/jx/joints5.json',out,lite,'/tmp/jx/objmap5.json'],check=True)
om=json.load(open('/tmp/jx/objmap5.json'))
def esc(x):return x.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
def sid(z):
    if z=='Paratracheal cervical nodes':return 'paratracheal-nodes'
    s=re.sub(r'^\(|\)$','',z).lower();s=s.replace(')','');return re.sub(r'[^a-z0-9]+','-',s).strip('-')
Lz=json.load(open('/tmp/jx/lymph.json'))
recs=[];ids=[]
for z,name,latin,region,loc,drains,note in G:
    i=sid(z);sided=(z+'.l') in Lz
    nn=sum(len(Lz[(zz+'.l') if sided else zz]['v'])//86 for zz in [z]+EXTRA.get(z,[]))
    nm=name
    desc=f'A group of lymph nodes. {loc} It is drawn here as {nn} individual node shape{"s" if nn!=1 else ""} from the Z-Anatomy atlas, so the number and exact positions of nodes are schematic.'
    fn=f'Filters lymph draining from {drains} before it continues towards the thoracic duct or right lymphatic duct.'
    clin=(note+' ' if note else '')+'Nodes of this group can enlarge (lymphadenopathy) with infection or when they trap spreading cancer cells; the drained region is checked in cancer staging.'
    recs.append('{id:`%s`,name:`%s`,latinName:`%s`,synonyms:[],system:`lymphatic`,region:`%s`,layer:`vessels`,parentId:`lymph-nodes`,location:`%s`,description:`%s`,function:`%s`,clinicalRelevance:`%s`,sources:[],reviewStatus:`pending-expert-review`}'%(i,esc(nm),esc(latin),region,esc(loc),esc(desc),esc(fn),esc(clin)))
    ids.append(i)
    if sided:
        for sd in('left','right'):
            S_=sd.capitalize();lnm=nm[0].lower()+nm[1:]
            recs.append('{id:`%s-%s`,name:`%s %s`,synonyms:[],system:`lymphatic`,region:`%s`,layer:`vessels`,parentId:`%s`,side:`%s`,location:`%s side of the body.`,description:`The %s %s. Its structure, function and clinical notes are the same as the other side and are given under %s.`,sources:[],reviewStatus:`pending-expert-review`}'%(i,sd,S_,esc(lnm),region,i,sd,S_,sd,esc(lnm),esc(nm)))
            ids.append(f'{i}-{sd}')
mp=glob.glob(G_+'assets/assetManifest-*b111.js')[0];s=open(mp).read()
a=s.find('"objectMap": {"zj_medial_meniscus_l_1"');b=s.find('}',a);assert a>0
s=s[:a]+'"objectMap": '+json.dumps(om)+s[b+1:]
en=s.find('{id:`fimbriae-of-uterine-tube`');s=s[:en]+','.join(recs)+','+s[en:]
open(mp,'w').write(s)
vf=glob.glob(G_+'assets/AnatomyViewer-*-b111.js')[0];v=open(vf).read()
m=re.search(r'var _JOINTSEL=new Set\((\[.*?\])\);',v);old=json.loads(m.group(1));
v=v[:m.start()]+'var _JOINTSEL=new Set('+json.dumps(old+ids)+');'+v[m.end():];open(vf,'w').write(v)
print('records',len(recs),'ids',len(ids))
