import sys,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pickle,json,numpy as np,subprocess
T='/tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad'
for sex,name,rf in (('m','male',0.22),('f','female',0.11)):
    if not os.path.exists('fit_%s.pkl'%sex): continue
    V,F,V0=pickle.load(open('fit_%s.pkl'%sex,'rb'))
    J={'skin_body_'+name:{'v':np.round(V,5).tolist(),'f':F.tolist(),'c':[0.694,0.392,0.254],'rough':0.78}}
    json.dump(J,open('skin_%s.json'%sex,'w'))
    out=subprocess.run(['node','mkglb.mjs',os.path.abspath('skin_%s.json'%sex),T+'/ghclone/models/hubmap-skin-%s.glb'%name,T+'/ghclone/models/lite/hubmap-skin-%s.glb'%name,str(rf),'0.4'],cwd=T+'/tools',capture_output=True,text=True)
    print(out.stdout[-300:],out.stderr[-300:])
