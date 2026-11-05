import bpy,json,numpy as np
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
names=['Gingiva','Soft palate','Uvula of palate','Tongue','Sublingual gland.l','Sublingual gland.r','Parotid gland.l','Parotid gland.r','Submandibular gland.l','Submandibular gland.r','Palatine tonsil.l','Palatine tonsil.r']
out={}
for n in names:
    o=bpy.data.objects.get(n)
    if not o: print('missing',n);continue
    e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles();M=o.matrix_world
    v=[[round(w.x,5),round(w.z,5),round(-w.y,5)] for w in [M@p.co for p in m.vertices]]
    f=[[t.vertices[0],t.vertices[2],t.vertices[1]] for t in m.loop_triangles]
    out[n]={'v':v,'f':f};a=np.array(v);print(n,len(v),len(f),a.min(0).round(3),a.max(0).round(3))
json.dump(out,open('zoral.json','w'))
