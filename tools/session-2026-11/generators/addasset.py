import sys,json
# usage: addasset.py manifest id name url desc attribution fidelity license offsetjson objectMapjson replacesPartsjson [gate]
m,i,name,url,desc,attr,fid,lic,off,om,rp=sys.argv[1:12]
gate=sys.argv[12] if len(sys.argv)>12 else None
s=open(m).read()
a=json.dumps({"id":i,"name":name,"kind":"gltf","url":url,"fidelity":fid,"license":lic,"attribution":attr,"description":desc,**({"offset":json.loads(off)} if off!='-' else {}),"objectMap":json.loads(om)},ensure_ascii=True)
k='{"id": "zanatomy-pituitary"'
assert s.count(k)==1
s=s.replace(k,a.replace('": ','": ').replace('", "','", "')+','+k)
rps=''.join('`%s`,'%x for x in json.loads(rp))[:-1] if json.loads(rp) else ''
o='{assetId:`anatomyverse-phrenic`,'
ov='{assetId:`%s`,%sreplacesParts:[%s]},'%(i,('gate:`%s`,'%gate) if gate else '',rps)
assert s.count(o)==1
s=s.replace(o,ov+o)
open(m,'w').write(s);print('added',i)
