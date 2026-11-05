import bpy,json
bpy.ops.wm.open_mainfile(filepath='/home/claude/zasset/Z-Anatomy/Startup.blend')
dg=bpy.context.evaluated_depsgraph_get()
def pts(n):
    o=bpy.data.objects.get(n)
    if not o: return None
    e=o.evaluated_get(dg);m=e.to_mesh();return [(v.x,v.z,-v.y) for v in [o.matrix_world@v.co for v in m.vertices]]
res={}
for side,sn in (('left','l'),('right','r')):
    for b,zn in (('humerus','Humerus'),('radius','Radius'),('ulna','Ulna'),('body-of-femur','Femur'),('tibia','Tibia'),('fibula','Fibula')):
        P=pts('%s.%s'%(zn,sn))
        if not P: print('missing',zn,sn);continue
        ys=[p[1] for p in P];lo,hi=min(ys),max(ys);lv=[];y=lo+0.01
        while y<hi:
            s=[p for p in P if abs(p[1]-y)<0.012]
            if len(s)>=3: lv.append([round(y,3),round(sum(p[0] for p in s)/len(s),4),round(sum(p[2] for p in s)/len(s),4)])
            y+=0.02
        res['%s-%s'%(b,side)]={'lo':lo,'hi':hi,'lv':lv}
json.dump(res,open('z_cl.json','w'));print({k:(round(v['lo'],2),round(v['hi'],2)) for k,v in res.items()})
