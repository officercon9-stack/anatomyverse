import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
o=bpy.data.objects['Urethra'];o.data.bevel_depth=0.0028;o.data.use_fill_caps=True
e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles();M=o.matrix_world
v=[[round(w.x,5),round(w.z,5),round(-w.y,5)] for w in [M@p.co for p in m.vertices]]
f=[[t.vertices[0],t.vertices[2],t.vertices[1]] for t in m.loop_triangles]
json.dump({'zu_urethra':{'v':v,'f':f,'c':[0.85,0.70,0.54],'open':True}},open('zur.json','w'));print(len(v),len(f))
import numpy as np;V=np.array(v);print(V.min(0),V.max(0))
