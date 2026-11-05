import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
out={}
for n,k in [('Ductus deferens.l','l'),('Ductus deferens.r','r')]:
    o=bpy.data.objects[n];o.data.bevel_depth=0.0013;e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles();M=o.matrix_world
    v=[[round(w.x,5),round(w.z,5),round(-w.y,5)] for w in [M@p.co for p in m.vertices]]
    f=[[t.vertices[0],t.vertices[2],t.vertices[1]] for t in m.loop_triangles]
    out['dd_'+k]={'v':v,'f':f}
    # centreline from spline points
    sp=o.data.splines[0];pts=[M@p.co for p in (sp.bezier_points if sp.type=='BEZIER' else sp.points)] if False else None
    print(n,len(v),len(f),o.data.splines[0].type,len(o.data.splines),o.data.bevel_depth)
json.dump(out,open('zdd.json','w'))
