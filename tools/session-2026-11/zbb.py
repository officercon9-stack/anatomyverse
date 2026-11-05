import bpy,json,re
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
pat=re.compile(r'.')
out={}
for o in bpy.data.objects:
    if o.type!='MESH':continue
    pass
    M=o.matrix_world
    vs=[M@v.co for v in o.data.vertices]
    if not vs:continue
    P=[[v.x,v.z,-v.y] for v in vs]
    lo=[min(p[i] for p in P) for i in range(3)];hi=[max(p[i] for p in P) for i in range(3)]
    out[o.name]=[lo,hi]
json.dump(out,open('/tmp/jx/zbb.json','w'))
print(len(out),sorted(out)[:80])
