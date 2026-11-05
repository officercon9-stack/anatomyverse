import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
want=['Humerus','Radius','Ulna','Scaphoid bone','Lunate bone','Triquetrum bone','Pisiform bone','Trapezium bone','Trapezoid bone','Capitate bone','Hamate bone']+[n+' metacarpal bone' for n in ('First','Second','Third','Fourth','Fifth')]+[p+' phalanx of '+f+' finger of hand' for p in ('Proximal','Middle','Distal') for f in ('first','second','third','fourth','fifth')]
by={o.name:o for o in bpy.data.objects if o.type=='MESH'}
dg=bpy.context.evaluated_depsgraph_get();out={}
for w in want:
  for s in ('.l','.r'):
    o=by.get(w+s)
    if not o:continue
    M=o.matrix_world;me=o.evaluated_get(dg).to_mesh()
    out[w+s]=[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices]
json.dump(out,open('/tmp/jx/z_arm.json','w'));print(len(out))
