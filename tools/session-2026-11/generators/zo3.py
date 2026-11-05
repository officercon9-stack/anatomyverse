import bpy,json,numpy as np
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
pts=[]
for n in ['Maxilla.l','Maxilla.r','Palatine bone.l','Palatine bone.r']:
    o=bpy.data.objects[n];e=o.evaluated_get(dg);m=e.to_mesh();M=o.matrix_world
    pts+=[[ (M@p.co).x,(M@p.co).z,-(M@p.co).y] for p in m.vertices]
a=np.array(pts);print(a.shape,a.min(0).round(3),a.max(0).round(3))
np.save('palate_pts.npy',a)
# tongue smooth
o=bpy.data.objects['Tongue'];md=o.modifiers.new('s','SUBSURF');md.levels=2;md.render_levels=2
e=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();m.calc_loop_triangles();M=o.matrix_world
v=[[round(w.x,5),round(w.z,5),round(-w.y,5)] for w in [M@p.co for p in m.vertices]]
f=[[t.vertices[0],t.vertices[2],t.vertices[1]] for t in m.loop_triangles]
print('tongue subsurf',len(v),len(f))
json.dump({'v':v,'f':f},open('tongue_smooth.json','w'))
