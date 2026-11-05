import bpy,json,re
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get();out={}
for o in bpy.data.objects:
    if o.type!='MESH':continue
    n=o.name.lower()
    if not re.search(r'lymph|node\b|nodes\b',n) or 'tonsil' in n:continue
    M=o.matrix_world;me=o.evaluated_get(dg).to_mesh()
    if not len(me.vertices):continue
    V=[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices]
    F=[[p.vertices[0],p.vertices[i],p.vertices[i+1]] for p in me.polygons for i in range(1,len(p.vertices)-1)]
    out[o.name]={'v':V,'f':F}
json.dump(out,open('/tmp/jx/lymph.json','w'))
import collections
print(len(out))
for k,v in sorted(out.items()):
    P=v['v'];print(k,len(P),[round(sum(p[i] for p in P)/len(P),3) for i in range(3)])
