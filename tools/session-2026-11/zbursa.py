import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get();out={}
for o in bpy.data.objects:
    if o.type!='MESH' or 'bursa' not in o.name.lower():continue
    M=o.matrix_world;me=o.evaluated_get(dg).to_mesh()
    out[o.name]={'v':[[(M@v.co).x,(M@v.co).z,-(M@v.co).y] for v in me.vertices],'f':[[p.vertices[0],p.vertices[1],p.vertices[2]] for p in me.polygons if len(p.vertices)==3]+[[p.vertices[0],p.vertices[i],p.vertices[i+1]] for p in me.polygons if len(p.vertices)>3 for i in range(1,len(p.vertices)-1)]}
json.dump(out,open('/tmp/jx/bursae.json','w'))
for k,v in sorted(out.items()):
    xs=[p[0] for p in v['v']];ys=[p[1] for p in v['v']]
    if len(xs)and (sum(xs)/len(xs))>=-0.001 or '.' not in k[-2:]:print(k,len(v['v']),round(sum(xs)/len(xs),3),round(sum(ys)/len(ys),3))
