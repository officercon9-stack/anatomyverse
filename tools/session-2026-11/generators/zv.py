import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
want={'Left common carotid artery':'cca_l','Right common carotid artery':'cca_r',
'External carotid artery.l':'eca_l','External carotid artery.r':'eca_r',
'Internal carotid artery.l':'ica_l','Internal carotid artery.r':'ica_r',
'Internal jugular vein.l':'ijv_l','Internal jugular vein.r':'ijv_r',
'Vertebral artery.l':'va_l','Vertebral artery.r':'va_r'}
out={}
for o in bpy.data.objects:
    if o.name in want:
        e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles()
        M=o.matrix_world
        v=[]
        for p in m.vertices:
            w=M@p.co; v.append([round(w.x,5),round(w.z,5),round(-w.y,5)])
        f=[[t.vertices[0],t.vertices[1],t.vertices[2]] for t in m.loop_triangles]
        # frame change (x,z,-y) flips handedness -> swap winding
        f=[[a,c,b] for a,b,c in f]
        out['zv_'+want[o.name]]={'v':v,'f':f}
        print(o.name,len(v),len(f))
json.dump(out,open('zv.json','w'))
