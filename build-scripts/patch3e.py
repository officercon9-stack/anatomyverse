# ---------- simple mode ----------
l=rd(L)
l=sub1(l,'function Ee(){','function _EeFull(){')
SIMPLE=r'''function Ee(){let[_a,_sa]=(0,Y.useState)(`all`),[_m,_sm]=(0,Y.useState)(!1);
let _go=(_id,_sys,_foc,_fn)=>{let _s=D.getState();for(let _l of[`skin`,`muscles`,`bones`,`vessels`,`nerves`,`organs`])_s.setLayerOpacity(_l,_l===`skin`?(_sys?.08:.12):1);_avb.set({inside:!1});_s.setSystemFocus(_sys);_sa(_id);_fn&&_fn();_foc&&setTimeout(()=>D.getState().focusStructure(_foc),200)};
let _B=[[`all`,`Whole body`,null,null],[`bones`,`Bones`,`skeletal`,null],[`muscles`,`Muscles`,`muscular`,null],[`heart`,`Heart and blood`,`cardiovascular`,`heart`],[`brain`,`Brain and nerves`,`nervous`,`brain`],[`lungs`,`Lungs`,`respiratory`,`bronchial-tree`],[`gut`,`Digestion`,`digestive`,null],[`kidney`,`Kidneys and bladder`,`urinary`,null]];
return(0,X.jsxs)(`div`,{className:`flex flex-col gap-4 p-4`,children:[(0,X.jsx)(`p`,{className:`text-base font-semibold`,children:`What do you want to see?`}),
(0,X.jsx)(`div`,{className:`grid grid-cols-2 gap-2`,children:_B.map(b=>(0,X.jsx)(`button`,{type:`button`,"aria-pressed":_a===b[0],className:`av-btn justify-center text-center`,style:{minHeight:48,fontSize:14,fontWeight:600,...(_a===b[0]?{borderColor:`var(--av-teal)`,color:`var(--av-teal)`}:{})},onClick:()=>_go(b[0],b[2],b[3]),children:b[1]},b[0]))}),
(0,X.jsxs)(`ol`,{className:`text-sm leading-relaxed text-[var(--av-text-muted)]`,style:{paddingLeft:18,listStyle:`decimal`},children:[(0,X.jsx)(`li`,{children:`Click a button above.`}),(0,X.jsx)(`li`,{children:`Click any part of the body: you see what it does and which diseases affect it.`}),(0,X.jsx)(`li`,{children:`Double-click a part to pull it out. Double-click again to put it back.`})]}),
(0,X.jsx)(`button`,{type:`button`,className:`av-btn av-btn--sm self-start`,"aria-expanded":_m,onClick:()=>_sm(!_m),children:_m?`Hide more options`:`More options (layers, sliders, models)`}),
_m&&(0,X.jsx)(`div`,{style:{margin:`0 -16px`},children:(0,X.jsx)(_EeFull,{})})]})}
'''
l=sub1(l,'function _EeFull(){',SIMPLE+'function _EeFull(){')
l=sub1(l,'n===`structures`?`Structures`:`Layers`]','n===`structures`?`Find a part`:`What to show`]')
# right panel
l=sub1(l,'`Click any part of the model, search, or pick from the structure list. Details, relationships, clinical notes and related questions appear here.`','`Click any part of the body. Its function and the diseases that affect it appear here.`')
l=sub1(l,'`Select a structure`','`Click a part of the body`')
l=sub1(l,'function ke({onPick:e}){let[t,n]=','function ke({onPick:e}){let[_sh,_ssh]=(0,Y.useState)(!1);let[t,n]=')
l=sub1(l,'(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`label`,{htmlFor:`seq-select`','(0,X.jsx)(`button`,{type:`button`,className:`av-btn av-btn--sm self-start`,onClick:()=>_ssh(!_sh),children:_sh?`Hide extras`:`More: animations and practice`}),_sh&&(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`label`,{htmlFor:`seq-select`')
l=sub1(l,'(0,X.jsxs)(`div`,{className:`av-card p-3 text-sm`,children:[(0,X.jsx)(`p`,{className:`mb-2 font-medium`,children:`Practise','_sh&&(0,X.jsxs)(`div`,{className:`av-card p-3 text-sm`,children:[(0,X.jsx)(`p`,{className:`mb-2 font-medium`,children:`Practise')
wr(L,l)
