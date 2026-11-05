import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
by={o.name:o for o in bpy.data.objects if o.type=='MESH'}
dg=bpy.context.evaluated_depsgraph_get();out={}
for n in ['Liver','Spleen','Pancreas','Stomach','Kidney.l','Kidney.r','Duodenum','Gallbladder','Urinary bladder','Ascending colon','Descending colon','Transverse colon','Sigmoid colon']:
    o=by.get(n)
    if not o:print('missing',n);continue
    M=o.matrix_world;me=o.evaluated_get(dg).to_mesh()
    out[n]=[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices]
json.dump(out,open('/tmp/jx/z_visc.json','w'));print(len(out))
