import glob,sys
for R in sys.argv[1:]:
    f=glob.glob(R+'/assets/AnatomyViewer-*.js')[0];t=open(f).read();i=t.index('\n})();\n')+7;t=t[i:].replace("globalThis.__avFxTick&&globalThis.__avFxTick(_s);","");open(f,'w').write(t)
