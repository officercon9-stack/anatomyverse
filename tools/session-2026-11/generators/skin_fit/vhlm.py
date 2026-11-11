import sys,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pickle,numpy as np,sys
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
def adj(n,F):
    return coo_matrix((np.ones(len(F)*6),(np.r_[F[:,0],F[:,1],F[:,2],F[:,1],F[:,2],F[:,0]],np.r_[F[:,1],F[:,2],F[:,0],F[:,0],F[:,1],F[:,2]])),shape=(n,n)).tocsr()
def sphere_fit(P):
    A=np.c_[2*P,np.ones(len(P))];b=(P**2).sum(1);s,*_=np.linalg.lstsq(A,b,rcond=None);c=s[:3];r=np.sqrt(s[3]+c@c);return c,r
def vh_landmarks(sex):
    U=pickle.load(open('vh/united_%s.pkl'%sex,'rb'));X='VH_%s_'%sex.upper()
    P,F=U[X+'skin'];lm={}
    n=len(P);A=adj(n,F)
    def g(*names):
        return np.vstack([U[k][0] for k in U if any(k==X+nm or k==nm for nm in names)])
    for S,sg in (('L',1),('R',-1)):
        fem=U[X+'femur_'+S][0];tib=U[X+'tibia_'+S][0];fib=U[X+'fibula_'+S][0]
        top=fem[fem[:,1]>fem[:,1].max()-0.05];med=top[np.abs(top[:,0])<np.abs(top[:,0]).min()+0.042]
        c,r=sphere_fit(med);lm['hip_'+S]=c;lm['hip_r_'+S]=r
        lm['knee_'+S]=fem[fem[:,1]<fem[:,1].min()+0.03].mean(0)
        lm['tibtop_'+S]=tib[tib[:,1]>tib[:,1].max()-0.015].mean(0)
        lm['knee2_'+S]=(lm['knee_'+S]+lm['tibtop_'+S])/2
        lm['ankle_'+S]=np.vstack([tib[tib[:,1]<tib[:,1].min()+0.02],fib[fib[:,1]<fib[:,1].min()+0.02]]).mean(0)
        lm['patella_'+S]=U[X+'patella_'+S][0].mean(0)
        lm['gtroch_'+S]=top[np.argmax(np.abs(top[:,0]))]
        sc=[k for k in U if 'sclera' in k and k.endswith('_'+S)]
        lm['eye_'+S]=U[sc[0]][0].mean(0)
    # crotch: highest y where slice has a gap around x=0
    ys=np.arange(lm['hip_L'][1]-0.25,lm['hip_L'][1]+0.02,0.002);cy=None
    for y in ys[::-1]:
        m=np.abs(P[:,1]-y)<0.003;x=np.sort(P[m,0]);x=x[np.abs(x)<0.12]
        if len(x)<4: continue
        gp=np.diff(x);i=np.argmax(gp)
        if gp[i]>0.006 and x[i]<0.03 and x[i+1]>-0.03: cy=y;cx=(x[i]+x[i+1])/2;break
    m=(np.abs(P[:,1]-cy)<0.006)&(np.abs(P[:,0]-cx)<0.03)
    lm['crotch']=np.array([cx,cy,P[m,2].mean()])
    # axilla per side: highest y where the x>0 slice shows gap between torso and arm
    for S,sg in (('L',1),('R',-1)):
        ay=None
        for y in np.arange(0.62,0.2,-0.002):
            m=(np.abs(P[:,1]-y)<0.003)&(P[:,0]*sg>0.05);x=np.sort(P[m,0]*sg)
            if len(x)<6: continue
            gp=np.diff(x);i=np.argmax(gp)
            if gp[i]>0.008: ay=y;ax=(x[i]+x[i+1])/2;break
        m=(np.abs(P[:,1]-ay)<0.008)&(np.abs(P[:,0]*sg-ax)<0.03)
        lm['axilla_'+S]=np.array([sg*ax,ay,P[m,2].mean()])
    lm['vertex']=P[np.argmax(P[:,1])]
    lm['floor']=P[:,1].min()
    return lm,P,F,A,U
if __name__=='__main__':
    for sex in 'mf':
        lm,P,F,A,U=vh_landmarks(sex)
        print(sex,'stature',P[:,1].max()-P[:,1].min())
        for k,v in lm.items(): print('  ',k,np.round(v,3))
