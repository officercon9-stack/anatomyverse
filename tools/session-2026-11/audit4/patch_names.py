"""Audit Phase 3: Latin name corrections and additions (Terminologia Anatomica)."""
import glob
mf=glob.glob('assets/assetManifest-*.js')[0];s=open(mf).read();n=0
def rep(a,b):
    global s,n
    assert s.count(a)==1,(a,s.count(a));s=s.replace(a,b);n+=1
rep('latinName:`Nervus oculomotor`','latinName:`Nervus oculomotorius`')
rep('"latinName": "Via columnae posteriores et lemnisci medialis"','"latinName": "Via columnae posterioris et lemnisci medialis"')

for nm,la in (('Tricuspid valve','Valva atrioventricularis dextra (valva tricuspidalis)'),('Pulmonary valve','Valva trunci pulmonalis'),('Mitral valve','Valva atrioventricularis sinistra (valva mitralis)'),('Aortic valve','Valva aortae'),('Coronary arteries','Arteriae coronariae')):
    rep('name:`%s`,'%nm,'name:`%s`,latinName:`%s`,'%(nm,la))
open(mf,'w').write(s);print('name fixes',n)
