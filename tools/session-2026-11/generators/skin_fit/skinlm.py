import sys,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
"""Skin-derived landmarks on the Visible Human skin (arms, hands, feet, head)."""
import numpy as np,pickle
from scipy.spatial import cKDTree
from scipy.sparse.csgraph import connected_components
from vhlm import vh_landmarks
from rnd import sample
def unit(v): return v/np.linalg.norm(v)
def raster_axilla(S,sg,mid,y_hi,y_lo,res=0.003):
    x=(S[:,0]-mid)*sg;m=(x>0.0)&(S[:,1]<y_hi)&(S[:,1]>y_lo)
    xi=(x[m]/res).astype(int);yi=((S[m,1]-y_lo)/res).astype(int)
    W=xi.max()+2;H=yi.max()+2;O=np.zeros((H,W),bool);O[yi,xi]=True
    for r in range(H-1,-1,-1):
        row=O[r];on=np.flatnonzero(row)
        if len(on)<10: continue
        # runs
        brk=np.flatnonzero(np.diff(on)>2)
        if len(brk)==0: continue
        starts=np.r_[on[0],on[brk+1]];ends=np.r_[on[brk],on[-1]]
        # torso run must start near midline; arm run must be >= 2 cm wide and lie lateral
        if starts[0]*res<0.03:
            for k in range(1,len(starts)):
                if (ends[k]-starts[k])*res>=0.02 and (starts[k]-ends[k-1])*res>=0.004:
                    return (ends[k-1]+starts[k])/2*res, y_lo+r*res
    return None
def arm_landmarks(P,F,A,lm,S,sg,H,mid,rng):
    out={}
    Sm,_=sample(P,F,600000,rng)
    eye_y=(lm['eye_L'][1]+lm['eye_R'][1])/2
    ax=raster_axilla(Sm,sg,mid,eye_y-0.18,lm['hip_L'][1]+0.1)
    axx,axy=ax
    near=(np.abs(P[:,1]-axy)<0.01)&(np.abs((P[:,0]-mid)*sg-axx)<0.03)
    Ax=np.array([mid+sg*axx,axy,P[near,2].mean()]);out['axilla']=Ax
    tipfar=int(np.argmax((P[:,0]-mid)*sg))
    u=unit(P[tipfar]-Ax)
    for it in range(2):
        M=((P-Ax)@u>0.0)
        idx=np.flatnonzero(M);sub=A[idx][:,idx];k,lab=connected_components(sub,directed=False)
        loc=np.flatnonzero(idx==tipfar)[0];comp=idx[lab==lab[loc]]
        Pc=P[comp];c=Pc.mean(0);_,_,vt=np.linalg.svd(Pc-c,full_matrices=False);u2=vt[0]
        if u2@u<0:u2=-u2
        u=unit(u2)
    arm=np.zeros(len(P),bool);arm[comp]=True;out['arm_mask']=arm;out['u']=u
    # samples on arm triangles
    fm=arm[F].all(1);Sa,_=sample(P,F[fm],200000,rng)
    t=(Sa-Ax)@u;tmax=t.max();bins=np.arange(0,tmax+0.01,0.01)
    cen=[];rad=[];tt=[]
    for b0 in bins[:-1]:
        m=(t>=b0)&(t<b0+0.01)
        if m.sum()<20: continue
        c=Sa[m].mean(0);r=np.linalg.norm(np.cross(Sa[m]-c,u),axis=1).mean();cen.append(c);rad.append(r);tt.append(b0+0.005)
    cen=np.array(cen);rad=np.array(rad);tt=np.array(tt);out['cl_t']=tt;out['cl_c']=cen;out['cl_r']=rad
    hs=H/1.75
    m=(tt>tmax-0.25*hs)&(tt<tmax-0.15*hs);iw=np.flatnonzero(m)[np.argmin(rad[m])]
    W=cen[iw];tw=tt[iw];out['wrist']=W;out['t_wrist']=tw
    fore=0.146*H;upper=0.186*H
    # arc length along centreline proximal of the wrist
    seg=np.linalg.norm(np.diff(cen,axis=0),axis=1);arc=np.r_[0,np.cumsum(seg)]
    aw=arc[iw]
    def at_arc(a):
        if a>=0:
            j=np.searchsorted(arc,a);j=min(max(j,1),len(arc)-1);f=(a-arc[j-1])/max(arc[j]-arc[j-1],1e-9);return cen[j-1]+f*(cen[j]-cen[j-1])
        # extrapolate proximally using upper-arm direction (first 12 cm)
        m2=tt<0.12;c0=cen[m2].mean(0);_,_,vt=np.linalg.svd(cen[m2]-c0);dirn=vt[0]
        if dirn@u<0:dirn=-dirn
        return cen[0]+dirn*a
    E=at_arc(aw-fore);Sh=at_arc(aw-fore-upper);out['elbow']=E;out['shoulder']=Sh
    # hand
    hand=arm&(((P-Ax)@u)>tw)
    hi=np.flatnonzero(hand);Ph=P[hi];dW=np.linalg.norm(Ph-W,axis=1)
    tr=cKDTree(Ph);nb=tr.query_ball_point(Ph,0.012)
    ismax=np.array([dW[i]>=dW[n].max()-1e-12 for i,n in enumerate(nb)])
    cand=np.flatnonzero(ismax);cand=cand[np.argsort(-dW[cand])];tips=[]
    for c in cand:
        if all(np.linalg.norm(Ph[c]-Ph[t0])>0.015 for t0 in tips): tips.append(c)
        if len(tips)==5: break
    tips=np.array(tips);a=sg*np.cross(np.array([0,0,1.]),u);a=unit(a-(a@u)*u)
    order=np.argsort(-((Ph[tips]-W)@a));names=['thumb','index','middle','ring','little']
    out['across']=a
    for nm,i in zip(names,order):
        tp=Ph[tips[i]];out['tip_'+nm]=tp
        loc=Ph[np.linalg.norm(Ph-tp,axis=1)<0.028];c=loc.mean(0);_,_,vt=np.linalg.svd(loc-c);dd=vt[0]
        if dd@(W-tp)<0:dd=-dd
        out['dir_'+nm]=dd
    out['hand_mask']=hand
    return out
def foot_landmarks(P,lm,S,sg,mid):
    out={}
    A=lm['ankle_'+S];m=((P[:,0]-mid)*sg>0)&(P[:,1]<A[1]+0.0)
    Pf=P[m]
    out['heel']=Pf[np.argmin(Pf[:,2])]
    out['toe1']=Pf[np.argmax(Pf[:,2])]
    # fifth toe: most lateral point in the front third
    zf=Pf[:,2]>out['toe1'][2]-0.06;lat=(Pf[:,0]-mid)*sg
    out['toe5']=Pf[zf][np.argmax(lat[zf])]
    out['sole_y']=Pf[:,1].min()
    return out
def all_skin_landmarks(sex):
    lm,P,F,A,U=vh_landmarks(sex);rng=np.random.default_rng(1)
    H=P[:,1].max()-P[:,1].min();mid=(lm['hip_L'][0]+lm['hip_R'][0])/2
    lm['mid']=mid;lm['H']=H
    arms={};feet={}
    for S,sg in (('L',1),('R',-1)):
        arms[S]=arm_landmarks(P,F,A,lm,S,sg,H,mid,rng);feet[S]=foot_landmarks(P,lm,S,sg,mid)
    return lm,arms,feet,P,F,A,U
if __name__=='__main__':
    import sys
    from rnd import render,sheet
    from PIL import ImageDraw
    for sex in 'mf':
        lm,arms,feet,P,F,A,U=all_skin_landmarks(sex)
        pickle.dump((lm,arms,feet),open('vh/skinlm_%s.pkl'%sex,'wb'))
        print(sex,'mid',round(lm['mid'],4),'H',round(lm['H'],3))
        for S in 'LR':
            a=arms[S];print(' ',S,'axilla',a['axilla'].round(3),'u',a['u'].round(3),'wrist',a['wrist'].round(3),'elbow',a['elbow'].round(3),'shoulder',a['shoulder'].round(3))
            print('    tips',{k[4:]:a[k].round(3).tolist() for k in a if k.startswith('tip_')})
            print('    radius profile (cm):',(a['cl_r'][::3]*100).round(1).tolist())
            f=feet[S];print('    foot heel',f['heel'].round(3),'toe1',f['toe1'].round(3),'toe5',f['toe5'].round(3),'sole',round(f['sole_y'],3))
        # debug render front with markers
        b=(P[:,0].min()-0.02,P[:,0].max()+0.02,P[:,1].min()-0.02,P[:,1].max()+0.02)
        im=render([(P,F,(214,170,140))],view='front',H=1100,bounds=b)
        dr=ImageDraw.Draw(im);Hh=1100;pad=0.03
        sc=(Hh*(1-2*pad))/(b[3]-b[2])
        def px(p): return ((p[0]-b[0])*sc+pad*Hh, Hh-1-((p[1]-b[2])*sc+pad*Hh))
        def dot(p,c,r=4): x,y=px(p);dr.ellipse([x-r,y-r,x+r,y+r],fill=c)
        for S in 'LR':
            a=arms[S]
            for k,c in (('axilla',(0,255,0)),('wrist',(255,0,0)),('elbow',(255,128,0)),('shoulder',(255,255,0))): dot(a[k],c)
            for k in a:
                if k.startswith('tip_'): dot(a[k],(0,200,255),3)
            for c in a['cl_c'][::2]: dot(c,(255,255,255),1)
            for k,c in (('hip_'+S,(255,0,255)),('knee2_'+S,(255,0,255)),('ankle_'+S,(255,0,255)),('eye_'+S,(0,0,255))): dot(lm[k],c)
            f=feet[S];dot(f['heel'],(0,255,0),3);dot(f['toe1'],(0,255,0),3);dot(f['toe5'],(0,255,0),3)
        im.save('vh/lm_%s.png'%sex)
