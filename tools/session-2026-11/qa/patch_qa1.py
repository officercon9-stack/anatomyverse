"""Pre-launch QA fixes (17 Nov 2026): credits for every model source, honest admin/tutor text,
payments line in the privacy policy, remove dead in-app-purchase code."""
import glob,re
def P(pat,fn):
    f=glob.glob('assets/'+pat)[0];s=open(f).read();s2=fn(s);assert s2!=s,pat;open(f,'w').write(s2)
def rep(a,b,n=1):
    def f(s):
        assert s.count(a)==n,(a[:60],s.count(a));return s.replace(a,b)
    return f
# 1 footer credit in the 3D viewer
P('AnatomyViewer-*.js',rep("'3D models: Z-Anatomy and BodyParts3D, CC BY-SA \\u00b7 Credits and licences'","'3D models: Z-Anatomy, BodyParts3D (CC BY-SA), HuBMAP (CC BY), MakeHuman (CC0) \\u00b7 Credits'"))
# 2 sources page + terms
P('index-*.js',rep("` (CC BY-SA 2.1 Japan). All models were modified for 3D Anatomy:","` (CC BY-SA 2.1 Japan), with organ and kidney models from the HuBMAP Visible Human reference library (CC BY 4.0) and the body surface, eyes and scrotum from MakeHuman (CC0). All models were modified for 3D Anatomy:"))
P('index-*.js',rep("Many 3D models are derived from Z-Anatomy and BodyParts3D and are licensed under Creative Commons Attribution-ShareAlike (CC BY-SA); those model files stay under their original licences.","Many 3D models are derived from Z-Anatomy and BodyParts3D (Creative Commons Attribution-ShareAlike, CC BY-SA), HuBMAP (CC BY 4.0) and MakeHuman (CC0); those model files stay under their original licences."))
# 3 privacy: payments
P('index-*.js',rep("`Permissions`}),","`Payments`}),(0,U.jsx)(`p`,{children:`The Android app is a one-time purchase on Google Play. Google Play handles the payment under Google's own terms and privacy policy; we never see or store your card or bank details, and we receive only the sale total.`}),(0,U.jsx)(`h2`,{className:`mt-4 text-base font-semibold text-[var(--av-text)]`,children:`Permissions`}),"))
# 4 admin and tutor wording
P('AdminPage-*.js',rep("Content management requires an administrator account. Access is also enforced by the server.","This page is reserved for the app's editors and is not used in this version of 3D Anatomy."))
P('TutorPage-*.js',rep("If the operator has configured an AI model on the server it adds explanation in your chosen level; otherwise a built-in offline tutor assembles answers from the records.","A built-in offline tutor assembles each answer from those records at your chosen level, so it works without internet."))
print('done')
# 5 (run separately) remove dead in-app purchase code from the quiz page
def strip_iap():
    f=glob.glob('assets/QuizPage-*.js')[0];s=open(f).read()
    a=s.index('var _PID=`fcps_full_access`;');b=s.index('var _REV=')
    s=s[:a]+s[b:]
    a=s.index('function _fCheck(){');b=s.index('function _FcpsUnlock(){')
    s=s[:a]+s[b:]
    a=s.index('function _FcpsUnlock(){');b=s.index(':null)}',a)+len(':null)}')
    s=s[:a]+s[b:]
    assert not re.search(r'_np\(|_PID|_FcpsUnlock|_hasBuy|_setOwn|_own\(|purchase',s),re.findall(r'.{40}(?:_np\(|_PID|_FcpsUnlock|purchase).{40}',s)[:3]
    open(f,'w').write(s)
if __name__=='__main__' and 'strip' in __import__('sys').argv:strip_iap();print('stripped')
# 6 (run separately) Android app: Export as JSON copies to the clipboard (file downloads do not work in the app's web view)
def fix_export():
    f=glob.glob('assets/index-*.js')[0];s=open(f).read()
    a="onClick:()=>{let t=new Blob([JSON.stringify(Ui(e),null,2)],{type:`application/json`}),n=document.createElement(`a`);"
    assert s.count(a)==1
    b="onClick:()=>{if(globalThis.Capacitor&&globalThis.Capacitor.isNativePlatform&&globalThis.Capacitor.isNativePlatform()){let j=JSON.stringify(Ui(e),null,2);navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(j).then(()=>alert(`Your progress was copied. Paste it into a note, email or message to keep a backup.`),()=>alert(`Could not copy your progress on this phone.`)):alert(`Could not copy your progress on this phone.`);return}let t=new Blob([JSON.stringify(Ui(e),null,2)],{type:`application/json`}),n=document.createElement(`a`);"
    open(f,'w').write(s.replace(a,b))
if __name__=='__main__' and 'export' in __import__('sys').argv:fix_export();print('export fixed')
