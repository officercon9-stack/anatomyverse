# ---------- remove non-working items, add explore tip ----------
I='assets/index-DAxCahJm.js'
t=rd(I)
t=sub1(t,'{to:`/app/tutor`,label:`Tutor`,icon:Xn},','')
t=sub1(t,'(0,U.jsx)(L,{to:`/app/account`,className:`av-btn av-btn--ghost av-btn--sm`,children:`Sign in`}),','')
t=sub1(t,'`: progress is saved in this browser only. `,(0,U.jsx)(L,{to:`/app/account`,className:`underline`,children:`Create an account`}),` to sync it.`','`: your progress is saved in this browser.`')
t=sub1(t,'e?`Your profile`:`Sign in or create an account`','e?`Your profile`:`My progress`')
t=sub1(t,'children:!e&&`An account syncs bookmarks, flashcards, quiz history and lesson progress across devices. Everything also works without one.`','children:!e&&`Your saved structures, flashcards and quiz results are kept in this browser.`')
t=sub1(t,'(0,U.jsx)(`p`,{className:`font-medium`,children:`Account server not reachable`}),(0,U.jsxs)(`p`,{className:`mt-1 text-[var(--av-text-muted)]`,children:[`You are using `,(0,U.jsx)(`strong`,{children:`local mode`}),`: everything works, and progress is saved in this browser only. Accounts require the AnatomyVerse API server and a PostgreSQL database (see README).`]})','(0,U.jsx)(`p`,{className:`font-medium`,children:`Saved on this device`}),(0,U.jsx)(`p`,{className:`mt-1 text-[var(--av-text-muted)]`,children:`Your progress is stored in this browser. Use the buttons below to export or clear it.`})')
t=sub1(t,'`Local mode — sign in`','`My progress`')
t=sub1(t,'t===`offline`&&(0,U.jsx)(`span`,{className:`av-badge`,title:`The API server is not reachable; progress is saved in this browser.`,children:`offline`})','!1')
t=sub1(t,'`Draft`:`Demo content · pending expert review`','`Draft`:`Educational content · under review`')
wr(I,t)
l=rd(L)
n=l.count(' Ask tutor`]})')
assert n==2,n
l=l.replace('(0,X.jsxs)(E,{to:`/app/tutor?structure=${n.id}`,className:`av-btn av-btn--sm`,children:[(0,X.jsx)(N,{size:15,"aria-hidden":!0}),` Ask tutor`]})','null')
assert 'Ask tutor' not in l
TIP=r'''function _Tip(){let[_o,_so]=(0,Y.useState)(()=>{try{return localStorage.getItem(`av_tip_seen`)?!1:!0}catch{return!0}});
let _close=()=>{_so(!1);try{localStorage.setItem(`av_tip_seen`,`1`)}catch{}};
if(!_o)return(0,X.jsx)(`button`,{type:`button`,onClick:()=>_so(!0),"aria-label":`Open tips`,style:{position:`absolute`,right:12,bottom:56,zIndex:15,padding:`8px 14px`,borderRadius:999,border:`1px solid var(--av-teal)`,background:`var(--av-surface)`,color:`var(--av-teal)`,fontSize:13,fontWeight:600,cursor:`pointer`,boxShadow:`0 6px 20px rgba(0,0,0,.35)`},children:`Touch and explore`});
return(0,X.jsxs)(`div`,{role:`note`,style:{position:`absolute`,right:12,bottom:56,zIndex:15,width:260,padding:`12px 14px`,borderRadius:14,border:`1px solid var(--av-teal)`,background:`var(--av-surface)`,color:`var(--av-text)`,fontSize:13,lineHeight:1.45,boxShadow:`0 10px 30px rgba(0,0,0,.45)`},children:[
(0,X.jsx)(`div`,{style:{fontWeight:700,fontSize:15,color:`var(--av-teal)`},children:`Touch and explore`}),
(0,X.jsx)(`div`,{style:{margin:`4px 0 6px`},children:`Get the most from this app:`}),
(0,X.jsxs)(`ul`,{style:{margin:0,paddingLeft:16,listStyle:`disc`},children:[(0,X.jsx)(`li`,{children:`Tap any part: see what it does and which diseases affect it.`}),(0,X.jsx)(`li`,{children:`Double-tap a part to pull it out; double-tap again to put it back.`}),(0,X.jsx)(`li`,{children:`Drag to turn the body, pinch or scroll to zoom.`}),(0,X.jsx)(`li`,{children:`Use the big buttons on the left to switch system.`}),(0,X.jsx)(`li`,{children:`Test yourself with a quiz when you are ready.`})]}),
(0,X.jsx)(`button`,{type:`button`,className:`av-btn av-btn--sm`,style:{marginTop:8},onClick:_close,children:`Got it`})]})}
'''
l=sub1(l,'function _diaShow(){',TIP+'function _diaShow(){')
l=sub1(l,'`3D viewport`,children:[','`3D viewport`,children:[(0,X.jsx)(_Tip,{}),')
wr(L,l)
