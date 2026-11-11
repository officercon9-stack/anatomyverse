import bpy,sys,re
bpy.ops.wm.open_mainfile(filepath=sys.argv[-1],use_scripts=False)
print('objects',len(bpy.data.objects),'collections',len(bpy.data.collections))
def walk(c,d=0):
    if d<3: print('  '*d+c.name, len(c.objects), len(c.children))
    for ch in c.children: walk(ch,d+1)
walk(bpy.context.scene.collection)
pat=re.compile(r'skin|surface|region|integument|body|breast|mamma|nipple|areola|hair|nail|dermis|cutis',re.I)
n=0
for o in bpy.data.objects:
    if o.type=='MESH' and pat.search(o.name):
        n+=1
        if n<=80: print('MESH',o.name,'|',[c.name for c in o.users_collection][:2],len(o.data.vertices))
print('matches',n)
