import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
by={o.name:o for o in bpy.data.objects if o.type=='MESH'}
dg=bpy.context.evaluated_depsgraph_get();out={}
for n in ['Femur','Tibia','Fibula','Patella','Hip bone','Scapula','Clavicle','Calcaneus','Talus']:
  for s in('.l','.r'):
    o=by.get(n+s)
    if not o:print('missing',n+s);continue
    M=o.matrix_world;me=o.evaluated_get(dg).to_mesh()
    out[n+s]=[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices]
json.dump(out,open('/tmp/jx/z_leg.json','w'));print(len(out))
