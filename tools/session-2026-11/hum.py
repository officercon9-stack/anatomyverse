import json,numpy as np
exec(open('fitarm3.py').read().split('out={}')[0])
for side in('l','r'):
    P=np.array(Z[f'Humerus.{side}']);Q=np.array(A[f'b_humerus_{side.upper()}'])
    print(side,'Z len',np.ptp(P[:,1]),np.ptp(P,0),'app',np.ptp(Q,0))
    best=None
    for s0 in(0.9,0.95,1.0,1.05,1.1):
        for R0 in [np.eye(3),]:
            r=icp(P,Q,80,s0)
            pass
        e,s,R,t=icp(P,Q,80,s0)
        if best is None or e<best[0]:best=(e,s,R,t)
    e,s,R,t=best;print(' err',e/2,'rot',np.degrees(np.arccos((np.trace(R)-1)/2)))
