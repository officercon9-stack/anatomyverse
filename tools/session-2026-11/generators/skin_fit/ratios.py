import sys,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pickle,numpy as np
alm=pickle.load(open('app_lm.pkl','rb'));L=pickle.load(open('app_male.pkl','rb'));by={m['name']:m for m in L}
def bb(P): return np.r_[P.min(0),P.max(0)]
app={}
app['lungs']=bb(np.vstack([by[k]['P'] for k in ('lobe_ru','lobe_rm','lobe_rl','lobe_lu','lobe_ll')]))
app['pelvis']=bb(np.vstack([by['b_hip-bone_L']['P'],by['b_hip-bone_R']['P']]))
app['brain']=bb(np.vstack([by[k]['P'] for k in ('zb_cerebrum','zb_cerebellum','zb_brainstem')]))
scl=by['za_sclera_1']['P'];app['eyeL']=scl[scl[:,0]>0].mean(0);app['eyeR']=scl[scl[:,0]<0].mean(0)
print('APP lungs',app['lungs'].round(3),'pelvis',app['pelvis'].round(3),'brain',app['brain'].round(3),'eyes',app['eyeL'].round(3),app['eyeR'].round(3))
for sex in 'mf':
    U=pickle.load(open('vh/united_%s.pkl'%sex,'rb'));X='VH_%s_'%sex.upper()
    lm,arms,feet=pickle.load(open('vh/skinlm_%s.pkl'%sex,'rb'))
    anc=pickle.load(open('vh/united_anc_%s.pkl'%sex,'rb'))
    lungs=bb(np.vstack([U[k][0] for k in U if any('lungs' in a for a in anc[k])]))
    pel=bb(np.vstack([U[k][0] for k in U if any(s in k for s in('ilium_compact','ischium_compact','pubis_compact'))]))
    brain=bb(np.vstack([U[k][0] for k in U if k.startswith('Allen_')]))
    def r(a,b): return round(a/b,3)
    print(' lungs',lungs.round(3),'pelvis',pel.round(3),'brain',brain.round(3))
    print(' ratios app/vh:')
    print('  hip dx',r(alm['hip_L'][0]-alm['hip_R'][0],lm['hip_L'][0]-lm['hip_R'][0]))
    print('  thigh len',r(np.linalg.norm(alm['hip_L']-alm['knee2_L']),np.linalg.norm(lm['hip_L']-lm['knee2_L'])),'shank',r(np.linalg.norm(alm['knee2_L']-alm['ankle_L']),np.linalg.norm(lm['knee2_L']-lm['ankle_L'])))
    print('  hip->eye dy',r(app['eyeL'][1]-alm['hip_L'][1],lm['eye_L'][1]-lm['hip_L'][1]))
    print('  lungs x,y,z',[r(app['lungs'][3+i]-app['lungs'][i],lungs[3+i]-lungs[i]) for i in range(3)])
    print('  pelvis x,y,z',[r(app['pelvis'][3+i]-app['pelvis'][i],pel[3+i]-pel[i]) for i in range(3)])
    print('  brain x,y,z',[r(app['brain'][3+i]-app['brain'][i],brain[3+i]-brain[i]) for i in range(3)])
    print('  eye dx',r(app['eyeL'][0]-app['eyeR'][0],lm['eye_L'][0]-lm['eye_R'][0]))
    C1=U[X+'cervical_vertebra_1'][0];L5=U[X+'lumbar_vertebra_5'][0]
    print('  spine C1top-L5bottom',r(1.528-0.989,C1[:,1].max()-L5[:,1].min()))
