import pickle,numpy as np,re
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
def comps(P,F):
    n=len(P);A=coo_matrix((np.ones(len(F)*3),(np.r_[F[:,0],F[:,1],F[:,2]],np.r_[F[:,1],F[:,2],F[:,0]])),shape=(n,n))
    k,lab=connected_components(A,directed=False);return k,lab
def end_centroid(P,axis_from,axis_to,frac0,frac1):
    u=axis_to-axis_from;L=np.linalg.norm(u);u/=L;t=(P-axis_from)@u/L
    m=(t>=frac0)&(t<=frac1);return P[m].mean(0)
def pca_axis(P):
    c=P.mean(0);u,s,vt=np.linalg.svd(P-c,full_matrices=False);return c,vt[0]
def bone_ends(P,up_hint):
    c,a=pca_axis(P)
    if a@up_hint<0:a=-a
    t=(P-c)@a;return c+a*t.max(),c+a*t.min(),a  # proximal(top along hint), distal
def landmarks(L):
    by={m['name']:m for m in L}
    lm={}
    for S,sg in (('L',1),('R',-1)):
        hum=by['b_humerus_'+S]['P'];rad=by['b_radius_'+S]['P'];uln=by['b_ulna_'+S]['P']
        top,bot,a=bone_ends(hum,np.array([0,1,0.]))
        t=(hum-bot)@a;Lh=t.max()
        head=hum[t>Lh-0.045];
        # humeral head centre: sphere-ish, take centroid of top 4.5cm medial part
        lm['shoulder_'+S]=head.mean(0)
        lm['elbow_'+S]=hum[t<0.03].mean(0)
        rt,rb,ra=bone_ends(rad,np.array([0,1,0.]));ut,ub,ua=bone_ends(uln,np.array([0,1,0.]))
        tr=(rad-rb)@ra;tu=(uln-ub)@ua
        lm['wrist_'+S]=np.vstack([rad[tr<0.02],uln[tu<0.02]]).mean(0)
        lm['elbow2_'+S]=np.vstack([hum[t<0.025],uln[tu>tu.max()-0.025],rad[tr>tr.max()-0.015]]).mean(0)
        hb={k.split('__')[1]:m['P'] for k,m in by.items() if k.startswith('b_hand-bones_%s__'%S)}
        lm['carpus_'+S]=np.vstack([hb[k] for k in ('scaphoid','lunate','triquetrum','pisiform','trapezium','trapezoid','capitate','hamate')]).mean(0)
        W=lm['wrist_'+S]
        fingers={'thumb':('metacarpal-1','proximal-phalanx-of-thumb',None,'distal-phalanx-of-thumb'),'index':('metacarpal-2','proximal-phalanx-of-index-finger','middle-phalanx-of-index-finger','distal-phalanx-of-index-finger'),'middle':('metacarpal-3','proximal-phalanx-of-middle-finger','middle-phalanx-of-middle-finger','distal-phalanx-of-middle-finger'),'ring':('metacarpal-4','proximal-phalanx-of-ring-finger','middle-phalanx-of-ring-finger','distal-phalanx-of-ring-finger'),'little':('metacarpal-5','proximal-phalanx-of-little-finger','middle-phalanx-of-little-finger','distal-phalanx-of-little-finger')}
        for fn,(mc,pp,mp,dp) in fingers.items():
            def far(P,ref): d=np.linalg.norm(P-ref,axis=1);return P[d>np.quantile(d,0.9)].mean(0)
            def near(P,ref): d=np.linalg.norm(P-ref,axis=1);return P[d<np.quantile(d,0.1)].mean(0)
            lm['mcb_%s_%s'%(fn,S)]=near(hb[mc],W)   # metacarpal base
            lm['mcp_%s_%s'%(fn,S)]=far(hb[mc],W)    # knuckle
            lm['pip_%s_%s'%(fn,S)]=far(hb[pp],lm['mcp_%s_%s'%(fn,S)])
            if mp is not None: lm['dip_%s_%s'%(fn,S)]=far(hb[mp],lm['pip_%s_%s'%(fn,S)])
            d=np.linalg.norm(hb[dp]-lm['pip_%s_%s'%(fn,S)],axis=1);lm['tip_%s_%s'%(fn,S)]=hb[dp][np.argmax(d)]
        tib=by['b_tibia_'+S]['P'];fib=by['b_fibula_'+S]['P']
        tt,tb,ta=bone_ends(tib,np.array([0,1,0.]));t2=(tib-tb)@ta
        ft,fb,fa=bone_ends(fib,np.array([0,1,0.]));t3=(fib-fb)@fa
        lm['ankle_'+S]=np.vstack([tib[t2<0.02],fib[t3<0.02]]).mean(0)
        lm['tibtop_'+S]=tib[t2>t2.max()-0.015].mean(0)
        fb_={k.split('__')[1]:m['P'] for k,m in by.items() if k.startswith('b_foot-bones_%s__'%S)}
        lm['talus_'+S]=fb_['talus'].mean(0)
        cal=fb_['calcaneus'];
        allfoot=np.vstack(list(fb_.values()))
        # foot axis: calcaneus centroid -> metatarsal-2 distal
        d=np.linalg.norm(fb_['distal-phalanx-of-great-toe']-lm['talus_'+S],axis=1);lm['toe1_'+S]=fb_['distal-phalanx-of-great-toe'][np.argmax(d)]
        d=np.linalg.norm(fb_['distal-phalanx-of-fifth-toe']-lm['talus_'+S],axis=1);lm['toe5_'+S]=fb_['distal-phalanx-of-fifth-toe'][np.argmax(d)]
        ax=fb_['metatarsal-2'].mean(0)-cal.mean(0);ax/=np.linalg.norm(ax)
        lm['heel_'+S]=cal[np.argmin(cal@ax)]
        lm['mt1h_'+S]=fb_['metatarsal-1'][np.argsort(-(fb_['metatarsal-1']@ax))[:20]].mean(0)
        lm['mt5h_'+S]=fb_['metatarsal-5'][np.argsort(-(fb_['metatarsal-5']@ax))[:20]].mean(0)
        lm['footaxis_'+S]=ax
    # femur: zanatomy-limbbones
    fem=[m for m in L if m['name'].startswith('za_femur_')]
    for tag in ('1','2'):
        parts={m['name'].split('__')[1]:m['P'] for m in fem if m['name'].startswith('za_femur_%s__'%tag)}
        allp=np.vstack(list(parts.values()));S='L' if allp[:,0].mean()>0 else 'R'
        lm['hip_'+S]=parts['head-of-femur'].mean(0)
        lm['knee_'+S]=np.vstack([parts['lateral-condyle-of-femur'],parts['medial-condyle-of-femur']]).mean(0)
        lm['gtroch_'+S]=parts['greater-trochanter'].mean(0)
        lm['femur_'+S]=allp
    for S in 'LR':
        lm['knee2_'+S]=(lm['knee_'+S]+lm['tibtop_'+S])/2
        lm['patella_'+S]=by['b_patella_'+S]['P'].mean(0)
    return lm,by
if __name__=='__main__':
    L=pickle.load(open('app_male.pkl','rb'));lm,by=landmarks(L)
    for k,v in lm.items():
        if v.ndim==1: print(k,np.round(v,3))
    V=by['vertebral_column'];k,lab=comps(V['P'],V['F']);print('vertebral comps',k)
    cs=sorted([(V['P'][lab==i][:,1].mean(),(lab==i).sum(),V['P'][lab==i].min(0).round(3),V['P'][lab==i].max(0).round(3)) for i in range(k) if (lab==i).sum()>30],key=lambda x:-x[0])
    for c in cs: print('  ',round(c[0],3),c[1],c[2],c[3])
    for n in ('rib_cage_L','sternum','b_hip-bone_L','b_clavicle_L','b_scapula_L','intervertebral_discs'):
        P=by[n]['P'];print(n,len(P),P.min(0).round(3),P.max(0).round(3))
    pickle.dump(lm,open('app_lm.pkl','wb'))
