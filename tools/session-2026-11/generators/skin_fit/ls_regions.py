import bpy,sys
bpy.ops.wm.open_mainfile(filepath=sys.argv[-1],use_scripts=False)
c=bpy.data.collections['9: Regions of human body']
tot=0;rows=[]
for o in c.all_objects:
    if o.type!='MESH' or len(o.data.vertices)<5: continue
    import mathutils
    bb=[o.matrix_world@mathutils.Vector(v) for v in o.bound_box]
    lo=[min(b[i] for b in bb) for i in range(3)];hi=[max(b[i] for b in bb) for i in range(3)]
    rows.append((o.name,len(o.data.vertices),len(o.data.polygons),[round(x,3) for x in lo],[round(x,3) for x in hi],o.hide_viewport,[m.type for m in o.modifiers]))
    tot+=len(o.data.vertices)
rows.sort()
for r in rows: print(*r,sep=' | ')
print('TOTAL verts',tot,'objects',len(rows))
