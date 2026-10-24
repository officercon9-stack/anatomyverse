// Generates tools/index.config.json + tools/index.decompiled.js for the app-shell chunk.
const fs=require('fs');const p=require('@babel/parser');
const SRC=process.argv[2]||'/tmp/wk/out/index-DAxCahJm/deobfuscated.js';
let src=fs.readFileSync(SRC,'utf8');
const pages={'ViewerPreview':'viewer/ViewerPreview','LabPage':'pages/LabPage','LessonPlayerPage':'pages/LessonPlayerPage','QuizPage':'pages/QuizPage','TutorPage':'pages/TutorPage','AdminPage':'pages/AdminPage','DictionaryPage':'pages/DictionaryPage'};
// lazy imports -> plain dynamic imports
src=src.replace(/X\(\(\) => import\(`\.\/([A-Za-z]+)-[^`]*`\), __vite__mapDeps\(\[[^\]]*\]\), import\.meta\.url\)/g,(m,n)=>{if(!pages[n])throw new Error(n);return 'import(`@/'+pages[n]+'`).then(m => ({ default: m.'+n+' }))'});
fs.writeFileSync(__dirname+'/index.decompiled.js',src);
const ast=p.parse(src,{sourceType:'module',plugins:['jsx']});
const body=ast.program.body;
const declNames=n=>n.type==='VariableDeclaration'?n.declarations.map(d=>d.id.name):(n.type==='FunctionDeclaration'&&n.id?[n.id.name]:[]);
const pascal=s=>s.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('');
const rename={},externals={},remove=new Set();
// icons
const objName={};
for(const n of body){ if(n.type!=='VariableDeclaration')continue; for(const d of n.declarations){ if(d.init&&d.init.type==='ObjectExpression'){const nm=d.init.properties.find(x=>x.key&&x.key.name==='name'&&(x.value.type==='StringLiteral'||x.value.type==='TemplateLiteral')); if(nm&&d.init.properties.find(x=>x.key&&x.key.name==='node'))objName[d.id.name]=(nm.value.value!==undefined?nm.value.value:nm.value.quasis[0].value.cooked);}}}
for(const n of body){ if(n.type!=='VariableDeclaration')continue; for(const d of n.declarations){ const i=d.init; if(i&&i.type==='CallExpression'&&i.callee.name==='c'&&i.arguments[0]&&objName[i.arguments[0].name]){const P=pascal(objName[i.arguments[0].name]);rename[d.id.name]=P;externals[P]={from:'lucide-react'};remove.add(d.id.name);remove.add(i.arguments[0].name);}}}
// lib region
for(const n of body) if(n.loc.start.line<3150) declNames(n).forEach(x=>remove.add(x));
['gi','U','ea','ta','na','ra','ia','X','__vite__mapDeps','Ti'].forEach(x=>{});
['gi','U','ea','ta','na','ra','ia','X'].forEach(x=>remove.add(x));
// router (free refs after lib removal)
Object.assign(rename,{_:'React',L:'Link',On:'NavLink',F:'useLocation',I:'Route',Rt:'Outlet',Bt:'Routes',Lt:'Navigate',Dn:'HashRouter',Nn:'useSearchParams',dt:'useNavigate',ht:'useParams'});
for(const k of ['Link','NavLink','useLocation','Route','Outlet','Routes','Navigate','HashRouter','useSearchParams','useNavigate','useParams'])externals[k]={from:'react-router-dom'};
Object.assign(externals,{create:{from:'zustand'}});
rename.i='create';
// data imports from assetManifest
Object.assign(rename,{a:'structures',o:'getStructure',s:'openstax',c:'createLucideIcon',l:'structuresInModel',u:'chapters',d:'models',f:'structureById',p:'modelById',m:'structureWithDescendants',h:'DEFAULT_MODEL_ID',g:'sources'});
for(const k of ['structures','getStructure','openstax','structuresInModel','chapters','models','structureById','modelById','structureWithDescendants','sources'])externals[k]={from:'@/data'};
externals.DEFAULT_MODEL_ID={from:'@/data',name:'SCHEMATIC_MODEL_ID'};
// viewer store pieces already rewritten
const viewerProv={ga:['LAYERS','@/store/visibility'],_a:null,va:['ancestorsOf','@/store/visibility'],ya:['resolveVisibility','@/store/visibility'],ba:['isWithin','@/store/visibility'],$:['useViewerStore','@/store/viewerStore']};
for(const [k,v] of Object.entries(viewerProv)){ if(v){rename[k]=v[0];externals[v[0]]={from:v[1]};} remove.add(k);} 
['_a','xa','Sa','Ca'].forEach(x=>remove.add(x));
const names={
 _i:'THEME_KEY',vi:'readTheme',yi:'applyTheme',bi:'useTheme',
 xi:'ApiError',Si:'API_BASE',z:'api',Ci:'parseJsonSafe',wi:'syncToServer',
 Ei:'toThenable',Di:'persist',
 B:'relation',Oi:'RELATIONSHIPS',ki:'RELATION_LABELS',Ai:'relationsOf',
 ji:'GRADE_DAYS',Mi:'DAY_MS',Ni:'initialSrs',Pi:'gradeCard',Fi:'isDue',
 Ii:'cardId',Li:'cardsForStructure',Ri:'cardsForLesson',zi:'cardsForMistake',Bi:'newCardSet',
 Vi:'todayKey',Hi:'initialProgress',V:'useProgressStore',Ui:'progressSnapshot',Wi:'importLocalProgress',H:'useAuthStore',
 W:'Logo',Gi:'NAV_ITEMS',Ki:'NavList',qi:'UserBox',Ji:'ThemeToggle',Yi:'AppLayout',
 G:'SYSTEMS',K:'systemById',q:'PENDING_REVIEW',J:'options',Xi:'QUESTIONS',Zi:'questionById',Qi:'QUESTION_TOPICS',Y:'LESSONS',$i:'lessonById',
 aa:'ViewerPreview',oa:'HOME_FEATURES',sa:'HOME_FEATURES_2',ca:'HOME_AUDIENCES',la:'HomePage',ua:'LEGAL_DOCS',da:'LegalPage',
 Z:'PageHeader',Q:'PageContainer',fa:'StructureChips',pa:'Card',ma:'ActivityHeatmap',ha:'DashboardPage',wa:'useHasModel3D',
 Ta:'SequencePlayer',Ea:'ReviewBadge',Da:'systemContent',Oa:'completeness',ka:'SystemsPage',Aa:'SystemDetailPage',
 ja:'GRADES',Ma:'FlashcardReview',Na:'FlashcardAdd',Pa:'RevisionPage',Fa:'AuthForm',Ia:'LocalDataSection',La:'ProfilePage',Ra:'NotFoundPage',
 za:'PENDING_REVIEW_CASE',Ba:'CLINICAL_CASES',Va:'clinicalCaseById',Ha:'SourceList',Ua:'TA2_SOURCE',Wa:'REFERENCES',
 Ga:'normalizeText',Ka:'editDistance',qa:'scoreEntry',Ja:'searchStructures',Ya:'SEARCH_SUGGESTIONS',
 Xa:'QUIZ_TYPES',Za:'shuffle',Qa:'filterQuestions',$a:'buildExam',eo:'isCorrect',to:'scoreExam',no:'correctAnswerText',ro:'structureName',
 io:'QuestionView',ao:'ClinicalDisclaimer',oo:'ClinicalListPage',so:'ClinicalCasePage',co:'LessonsPage',
 lo:'useContentStore',uo:'mergeServerStructures',fo:'fetchServerContent',po:'ErrorBoundary',
 mo:'LabPage',ho:'LessonPlayerPage',go:'QuizPage',_o:'TutorPage',vo:'AdminPage',yo:'DictionaryPage',bo:'Loading',xo:'App'
};
for(const [k,v] of Object.entries(names)) if(!rename[k]) rename[k]=v;
// Ti (createJSONStorage) lives in lib/persist with Di
rename.Ti='createJSONStorage';
const modules={
 'lib/theme.ts':['_i','vi','yi','bi'],
 'lib/api.ts':['xi','Si','z','Ci','wi'],
 'lib/persist.ts':['Ti','Ei','Di'],
 'data/relationships.ts':['B','Oi','ki','Ai'],
 'lib/srs.ts':['ji','Mi','Ni','Pi','Fi'],
 'lib/flashcards.ts':['Ii','Li','Ri','zi','Bi'],
 'store/progress.ts':['Vi','Hi','V','Ui','Wi'],
 'store/auth.ts':['H'],
 'components/Logo.tsx':['W'],
 'layout/AppLayout.tsx':['Gi','Ki','qi','Ji','Yi'],
 'data/systems.ts':['G','K'],
 'data/helpers.ts':['q','J'],
 'data/questions.ts':['Xi','Zi','Qi'],
 'data/lessons.ts':['Y','$i'],
 'pages/HomePage.tsx':['aa','oa','sa','ca','la'],
 'pages/LegalPage.tsx':['ua','da'],
 'components/PageLayout.tsx':['Z','Q','fa','pa','ma'],
 'pages/DashboardPage.tsx':['ha'],
 'store/viewerHooks.ts':['wa'],
 'components/SequencePlayer.tsx':['Ta'],
 'components/ReviewBadge.tsx':['Ea'],
 'lib/systemContent.ts':['Da','Oa'],
 'pages/SystemsPage.tsx':['ka'],
 'pages/SystemDetailPage.tsx':['Aa'],
 'pages/RevisionPage.tsx':['ja','Ma','Na','Pa'],
 'pages/ProfilePage.tsx':['Fa','Ia','La'],
 'pages/NotFoundPage.tsx':['Ra'],
 'data/clinicalCases.ts':['za','Ba','Va'],
 'components/SourceList.tsx':['Ha'],
 'data/references.ts':['Ua','Wa'],
 'lib/search.ts':['Ga','Ka','qa','Ja','Ya'],
 'lib/quizEngine.ts':['Xa','Za','Qa','$a','eo','to','no'],
 'components/QuestionView.tsx':['ro','io'],
 'pages/ClinicalPages.tsx':['ao','oo','so'],
 'pages/LessonsPage.tsx':['co'],
 'store/content.ts':['lo','uo','fo'],
 'components/ErrorBoundary.tsx':['po'],
 'app/App.tsx':['mo','ho','go','_o','vo','yo','bo','xo']
};
for(const m of Object.keys(modules))modules[m]=modules[m].map(k=>rename[k]||k);
const cfg={input:'tools/index.decompiled.js',outDir:'src',rename,modules,externals,remove:[...remove],fn:{}};
fs.writeFileSync(__dirname+'/index.config.json',JSON.stringify(cfg,null,1));
console.log('icons',Object.keys(objName).length,'remove',remove.size);
