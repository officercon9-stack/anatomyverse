import json,base64,numpy as np,pickle,sys
def load(sex):
    out=[]
    for line in open('app_%s.jsonl'%sex):
        d=json.loads(line)
        P=np.frombuffer(base64.b64decode(d['P']),dtype='<f4').reshape(-1,3).astype(float)
        I=np.frombuffer(base64.b64decode(d['I']),dtype='<u4').astype(np.int64)
        I=I[:len(I)//3*3].reshape(-1,3)
        out.append(dict(name=d['name'],sid=d['sid'],chain=d['chain'],vis=d['vis'] and d['mv'],col=d['col'],op=d['op'],P=P,F=I))
    return out
if __name__=='__main__':
    for sex in ('male','female'):
        L=load(sex);pickle.dump(L,open('app_%s.pkl'%sex,'wb'))
        import collections
        c=collections.Counter((m['chain'][1] if len(m['chain'])>1 else '?',m['vis']) for m in L)
        print(sex,len(L));
        for k,v in sorted(c.items(),key=lambda x:str(x)): 
            ms=[m for m in L if (m['chain'][1] if len(m['chain'])>1 else '?')==k[0] and m['vis']==k[1]]
            P=np.vstack([m['P'] for m in ms]);print('  ',k,v,P.min(0).round(3),P.max(0).round(3))
