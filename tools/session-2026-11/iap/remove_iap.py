"""Paid-to-install app: remove the in-app purchase; the Android app always has the full FCPS bank."""
import glob,re
f=glob.glob('assets/QuizPage-*.js')[0];q=open(f).read()
a="var _FULL=_REV||(_NAT&&_own());"
assert q.count(a)==1;q=q.replace(a,"var _FULL=_REV||_NAT;")
a="_NAT&&setTimeout(_fCheck,1500);";assert q.count(a)==1;q=q.replace(a,"")
a="_FULL?null:_NAT?_fh(_FcpsUnlock):";assert q.count(a)==1;q=q.replace(a,"_FULL?null:")
q=q.replace("is in the free 3D Anatomy Android app as a one-time Rs 1,500 unlock.","is in the 3D Anatomy Android app on Google Play (one-time Rs 1,500).")
open(f,'w').write(q);print('ok')
