import bpy,bmesh,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
names=json.load(open('/tmp/jx/names.json'))
dg=bpy.context.evaluated_depsgraph_get();out={};miss=[]
byname={o.name:o for o in bpy.data.objects if o.type=='MESH'}
for zn,sid in names.items():
    cands=[(zn,'')]+[(zn+'.l','l'),(zn+'.r','r')]
    found=False
    for full,side in cands:
        o=byname.get(full)
        if not o: continue
        found=True
        oe=o.evaluated_get(dg);me=oe.to_mesh()
        bm=bmesh.new();bm.from_mesh(me);bmesh.ops.triangulate(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
        M=o.matrix_world
        V=[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices]
        F=[[p.vertices[0],p.vertices[1],p.vertices[2]] for p in me.polygons]
        key='%s|%s|%s'%(sid,side,zn)
        out[key]={'v':V,'f':F}
    if not found:miss.append(zn)
print('RESULT',len(out),'missing',miss)
json.dump(out,open('/tmp/jx/joints.json','w'))
