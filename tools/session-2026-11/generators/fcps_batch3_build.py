import sys,random,importlib
sys.path.insert(0,'/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ang')
names={'ana':'Anatomy','phy':'Physiology','bio':'Biochemistry','pat':'Pathology','pha':'Pharmacology'}
out=[];seen=set()
for k in names:
    A=importlib.import_module('b3_'+k).A
    for n,(p,c,w,e) in enumerate(A,1):
        assert len(w)==3 and '`' not in p+c+e+''.join(w),(k,n)
        assert p not in seen,('dup',p);seen.add(p)
        o=list(w);random.Random(k+'3'+str(n)).shuffle(o);tgt=(n*5+ord(k[1]))%4;o.insert(tgt,c)
        out.append("{id:`q-fcps-%s3-%02d`,type:`multiple-choice`,topic:`fcps`,difficulty:`intermediate`,prompt:`%s`,options:J(%s),correctOptionId:`%s`,explanation:`%s`,learningObjective:`FCPS Part I: %s`,relatedStructureIds:[],sources:[]}"%(k,n,p,",".join("`%s`"%x for x in o),'abcd'[tgt],e,names[k]))
    print(k,len(A))
open('/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad/ang/b3.js','w').write(",".join(out)+",")
print(len(out))
