import re,json,sys
import os;os.chdir(os.path.dirname(os.path.abspath(__file__)));exec(open('c4.py').read())
root=os.path.abspath(sys.argv[1]);fn=sys.argv[2]
p=f'{root}/assets/{fn}';s=open(p).read()
def bt(t): return '`'+t.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')+'`'
def arr(l): return '['+','.join(bt(x) for x in l)+']'
cases=[];qs=[]
for c in C:
    cases.append('{id:%s,title:%s,system:%s,objective:%s,scenario:%s,relevantStructureIds:%s,explanation:%s,management:%s,escalate:%s,questionIds:%s,sources:s(u.%s)}'%(bt(c['id']),bt(c['title']),bt(c['system']),bt(c['objective']),bt(c['scenario']),arr(c['relevantStructureIds']),bt(c['explanation']),arr(c['management']),bt(c['escalate']),arr(c['questionIds']),c['src']))
for q in Q:
    qs.append('{id:%s,type:`%s`,topic:%s,difficulty:`%s`,prompt:%s,options:J(%s),correctOptionId:`%s`,explanation:%s,learningObjective:%s,relatedStructureIds:%s,sources:s(u.%s)}'%(bt(q['id']),q['type'],bt(q['topic']),q['difficulty'],bt(q['prompt']),','.join(bt(o) for o in q['options']),q['correct'],bt(q['explanation']),bt(q['objective']),arr(q['related']),q['src']))
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(old[:60],s.count(old))
    s=s.replace(old,new)
# questions + cases
rep('],Zi=Object.fromEntries(Xi.map',','+','.join(qs)+'],Zi=Object.fromEntries(Xi.map')
rep('],Va=Object.fromEntries(Ba.map',','+','.join(cases)+'],Va=Object.fromEntries(Ba.map')
# systems for the four existing cases
for i,sy in [('humeral-shaft-radial-nerve','muscular'),('fibular-neck-foot-drop','nervous'),('inhaled-foreign-body','respiratory'),('lumbar-puncture-level','nervous')]:
    rep('{id:`%s`,title:'%i,'{id:`%s`,system:`%s`,title:'%(i,sy))
# page: management section
rep('(0,U.jsx)(`p`,{className:`text-sm leading-relaxed`,children:t.explanation})]}),',
 '(0,U.jsx)(`p`,{className:`text-sm leading-relaxed`,children:t.explanation})]}),t.management&&(0,U.jsxs)(`section`,{className:`av-card p-5`,children:[(0,U.jsx)(`h2`,{className:`av-section-title mb-2`,children:`What to do (first response)`}),(0,U.jsx)(`ol`,{className:`list-decimal space-y-1.5 pl-5 text-sm leading-relaxed`,children:t.management.map((e,n)=>(0,U.jsx)(`li`,{children:e},n))}),t.escalate&&(0,U.jsxs)(`p`,{className:`mt-3 rounded-lg border border-[var(--av-warn)] p-3 text-sm`,children:[(0,U.jsx)(`strong`,{children:`When to get emergency help: `}),t.escalate]})]}),')
rep('These are illustrative educational examples to connect anatomy with clinical reasoning. They are not real patients, not diagnostic guidance and not treatment advice.',
 'These are illustrative educational examples to connect anatomy with clinical reasoning. They are not real patients. First-response steps summarise standard first-aid and resuscitation teaching; protocols differ between countries and are updated, so follow the version taught and approved where you work, and call the emergency services. This does not replace training or a clinician\'s advice.')
# list page grouped by system
rep('(0,U.jsx)(`ul`,{className:`grid gap-4 sm:grid-cols-2`,children:Ba.map(e=>(0,U.jsx)(`li`,{children:(0,U.jsxs)(L,{to:`/app/clinical/${e.id}`',
 '[`cardiovascular`,`respiratory`,`digestive`,`urinary`,`reproductive`,`endocrine`,`nervous`,`muscular`,`skeletal`,`lymphatic`,`integumentary`,`special-senses`].map(sys=>(0,U.jsxs)(`section`,{className:`mb-8`,children:[(0,U.jsx)(`h2`,{className:`mb-3 text-lg font-semibold`,children:{cardiovascular:`Cardiovascular`,respiratory:`Respiratory`,digestive:`Digestive`,urinary:`Urinary`,reproductive:`Reproductive`,endocrine:`Endocrine`,nervous:`Nervous`,muscular:`Muscular`,skeletal:`Skeletal`,lymphatic:`Lymphatic and immune`,integumentary:`Integumentary (skin)`,"special-senses":`Special senses`}[sys]}),(0,U.jsx)(`ul`,{className:`grid gap-4 sm:grid-cols-2`,children:Ba.filter(e=>e.system===sys).map(e=>(0,U.jsx)(`li`,{children:(0,U.jsxs)(L,{to:`/app/clinical/${e.id}`')
rep('children:(0,U.jsx)(Ea,{status:e.reviewStatus})})]})},e.id))})]})}',
 'children:e.reviewStatus?(0,U.jsx)(Ea,{status:e.reviewStatus}):(0,U.jsx)(`span`,{className:`text-xs text-[var(--av-text-faint)]`,children:e.management?`Emergency first response. Awaiting clinician review`:`Awaiting clinician review`})})]})},e.id))})]},sys))]})}')
open(p,'w').write(s)
print('cases',len(cases),'questions',len(qs))
