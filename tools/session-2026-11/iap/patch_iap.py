"""Free app + one-time Google Play in-app purchase (fcps_full_access) that unlocks the full FCPS bank."""
import glob,re
f=glob.glob('assets/QuizPage-*.js')[0];q=open(f).read()
old=re.search(r'var _FULL=!!globalThis\.Capacitor\|\|(\(\(\)=>\{.*?\}\)\(\));',q)
assert old and '_FcpsUnlock' not in q
rev=old.group(1)
new=('var _NAT=!!(globalThis.Capacitor&&globalThis.Capacitor.isNativePlatform&&globalThis.Capacitor.isNativePlatform());var _PID=`fcps_full_access`;'
 'function _np(m,o){return globalThis.Capacitor.nativePromise(`NativePurchases`,m,o||{})}'
 'function _own(){try{return localStorage.getItem(`avFcpsOwned`)===`1`}catch(e){return!1}}'
 'function _setOwn(v){try{v?localStorage.setItem(`avFcpsOwned`,`1`):localStorage.removeItem(`avFcpsOwned`)}catch(e){}}'
 'function _hasBuy(r){return(r&&r.purchases||[]).some(t=>t.productIdentifier===_PID&&String(t.purchaseState)===`1`)}'
 'var _REV='+rev+';var _FULL=_REV||(_NAT&&_own());'
 'function _fCheck(){if(!_NAT||_REV)return;_np(`getPurchases`,{productType:`inapp`}).then(r=>{if(!r||!Array.isArray(r.purchases))return;let h=_hasBuy(r);if(h!==_own()){_setOwn(h);location.reload()}}).catch(()=>{})}'
 '_NAT&&setTimeout(_fCheck,1500);'
 'function _FcpsUnlock(){let[st,ss]=N.useState(``),[pr,sp]=N.useState(`Rs 1,500`),[busy,sb]=N.useState(!1);'
 'N.useEffect(()=>{_np(`getProducts`,{productIdentifiers:[_PID],productType:`inapp`}).then(r=>{let x=r&&r.products&&r.products[0];x&&x.priceString&&sp(x.priceString)}).catch(()=>{})},[]);'
 'let msg=e=>String(e&&e.message||e||``),'
 'buy=()=>{sb(!0);ss(`Opening Google Play…`);_np(`purchaseProduct`,{productIdentifier:_PID,productType:`inapp`}).then(t=>{if(String(t&&t.purchaseState)===`1`){_setOwn(1);ss(`Unlocked. Loading all questions…`);setTimeout(()=>location.reload(),700)}else{sb(!1);ss(`Payment is pending. The questions unlock as soon as Google Play confirms it; then tap Restore purchase.`)}}).catch(e=>{sb(!1);ss(/cancel/i.test(msg(e))?``:`The purchase did not go through: `+msg(e))})},'
 'res=()=>{sb(!0);ss(`Checking your purchases…`);_np(`restorePurchases`).catch(()=>{}).then(()=>_np(`getPurchases`,{productType:`inapp`})).then(r=>{if(_hasBuy(r)){_setOwn(1);location.reload()}else{sb(!1);ss(`No purchase found for the Google account on this phone.`)}}).catch(e=>{sb(!1);ss(`Could not reach Google Play: `+msg(e))})};'
 'return _fh(`div`,{className:`mx-3 mt-2 rounded-xl border border-[var(--av-border)] p-3 text-sm`,role:`note`,"data-testid":`fcps-unlock`},'
 '_fh(`strong`,null,`Free: 12 questions per subject. `),`Unlock all 1,806 FCPS Part I questions with explanations, mock exams and revision cards. One-time payment, no subscription.`,'
 '_fh(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`8px`,marginTop:`10px`}},'
 '_fh(`button`,{type:`button`,className:`av-btn av-btn--primary`,disabled:busy,onClick:buy,"data-testid":`fcps-buy`},`Unlock all questions · `+pr),'
 '_fh(`button`,{type:`button`,className:`av-btn`,disabled:busy,onClick:res,"data-testid":`fcps-restore`},`Restore purchase`)),'
 'st?_fh(`p`,{className:`text-xs`,role:`status`,style:{marginTop:`8px`}},st):null)}')
q=q.replace(old.group(0),new)
a="_FULL?null:_fh(`div`,{className:`mx-3 mt-2 rounded-xl border border-[var(--av-border)] p-3 text-sm`,role:`note`,\"data-testid\":`fcps-demo-note`}"
assert q.count(a)==1
q=q.replace(a,"_FULL?null:_NAT?_fh(_FcpsUnlock):_fh(`div`,{className:`mx-3 mt-2 rounded-xl border border-[var(--av-border)] p-3 text-sm`,role:`note`,\"data-testid\":`fcps-demo-note`}")
q=q.replace("is in the 3D Anatomy Android app (one-time Rs 1,500).","is in the free 3D Anatomy Android app as a one-time Rs 1,500 unlock.")
open(f,'w').write(q);print('patched',f)
