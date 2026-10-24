import sys,json,os
old,new=sys.argv[1],sys.argv[2]
m={}
for n in ['AdminPage-CnoKsHWf','AnatomyViewer-C5q0xwNu','DictionaryPage-DlS4hjTR','LabPage-zPU8vhVB','LessonPlayerPage-DKkvH1Ng','QuizPage-Ca-aKRIy','SearchBox-CXYvX0ai','TutorPage-C4YcKkov','ViewerPreview-D6qEvvvM','assetManifest-D3o27EUe','index-DAxCahJm','info-iXqhKiJV']:
    m['assets/%s-%s.js'%(n,old)]=None; f='assets/%s-%s.js'%(n,new); m[f]=f
for x in sys.argv[3:]: m[x]=x
print(json.dumps(m))
