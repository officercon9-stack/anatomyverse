import sys,glob
R=sys.argv[1]
A=glob.glob(R+'/assets/AnatomyViewer-*.js')[0];s=open(A).read()
fx=open('fx.js').read()
assert 'globalThis.__avFxTick' not in s
old="globalThis.__scn=_s.scene;"
assert s.count(old)==1
s=s.replace(old,old+"globalThis.__avFxTick&&globalThis.__avFxTick(_s);")
s=fx+"\n"+s
open(A,'w').write(s);print('fx patched',A)
