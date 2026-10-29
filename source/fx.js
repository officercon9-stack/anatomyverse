;(()=>{
/* AnatomyVerse structure tools for the skull, ear and eye: corrected bite, jaw opening, exploded view, see-through, eye section,
   per-structure hide/show and leader-line labels. Also repositions schematic head parts that sat too high. */
const FX=globalThis.__avFx={jaw:0,jawT:0,exp:0,expT:0,xray:false,labels:false,section:false,hidden:{},sig:'',list:null,n:0,occ:{},rr:0,bar:null,svg:null,pop:null,popOpen:false,grp:null,builtGrp:null,btns:{}};
const P=[0,1.573,0.008];            /* temporomandibular axis (metres, Y-up, +Z anterior) */
const BASE_DY=0,BASE_A=0;           /* closed bite: the source arches already occlude (upper and lower crown tips within 2 mm), so no correction */
const OPEN_A=0.42;                  /* ~24 degrees of jaw opening */
const EYE_CUT_Y=1.5912;             /* horizontal section through the centre of the cornea and iris */
const FIXED={pupil_L:[0,0.0047,-0.0057],ear_L:[0,-0.045,0],ear_R:[0,-0.045,0],nasal_cavity:[0,-0.06,0],olfactory_epithelium:[0,-0.05,0]};
const CRANIAL=['frontal-bone','parietal-bone-left','parietal-bone-right','temporal-bone-left','temporal-bone-right','occipital-bone','sphenoid-bone','ethmoid-bone'];
const FACIAL=['nasal-bone-left','nasal-bone-right','maxilla-left','maxilla-right','zygomatic-bone-left','zygomatic-bone-right','lacrimal-bone-left','lacrimal-bone-right','palatine-bone-left','palatine-bone-right','inferior-nasal-concha-left','inferior-nasal-concha-right','vomer','mandible'];
const EAR1=['auricle','tympanic-membrane','malleus','incus','stapes'];
const EAR2=['cochlea','vestibule','vestibulocochlear-nerve','cochlear-nerve','vestibular-nerve','chorda-tympani'];
const EYE1=['sclera','cornea','iris','lens','retina','vitreous-body','anterior-chamber'];
const EYE2=['superior-rectus','inferior-rectus','medial-rectus','lateral-rectus','superior-oblique','inferior-oblique','levator-palpebrae'];
const EYE3=['lacrimal-gland','lacrimal-apparatus','optic-chiasm','optic-nerve'];
const GR={
 skull:{root:'skull',title:'22 skull bones',ids:CRANIAL.concat(FACIAL),secs:[['Cranial (8)',CRANIAL],['Facial (14)',FACIAL]],xray:null,tools:['jaw','explode','xray','labels','parts'],expl:0.055,pop:'Bones'},
 ear:{root:'ear',title:'Ear structures',ids:EAR1.concat(EAR2),secs:[['External and middle ear',EAR1],['Inner ear and nerves',EAR2]],xray:['auricle'],tools:['explode','xray','labels','parts'],expl:0.035,pop:'Parts'},
 eye:{root:'eye',title:'Eye structures',ids:EYE1.concat(EYE2,EYE3),secs:[['Globe',EYE1],['Muscles',EYE2],['Other',EYE3]],xray:['sclera','cornea','vitreous-body','anterior-chamber'],tools:['section','xray','labels','parts'],expl:0,pop:'Parts'}
};
const OF={};Object.keys(GR).forEach(g=>GR[g].ids.forEach(i=>OF[i]=g));
const LAB={jaw:'Open jaw',explode:'Explode',xray:'See-through',labels:'Labels',section:'Cut section',parts:'Parts'};
const nm=k=>{let side='';if(/\|L$/.test(k)){side=' (L)';k=k.slice(0,-2)}else if(/\|R$/.test(k)){side=' (R)';k=k.slice(0,-2)}
  let s=k.replace(/-bone/,'').replace(/-left$/,' (L)').replace(/-right$/,' (R)').replace(/-/g,' ');s=s.charAt(0).toUpperCase()+s.slice(1);return s+side};
const css=(el,o)=>{Object.assign(el.style,o);return el};
const mk=(t,o,txt)=>{const e=document.createElement(t);if(o)css(e,o);if(txt!=null)e.textContent=txt;return e};
const BTN={font:'600 12px system-ui,sans-serif',color:'#e8eef7',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'10px',padding:'0 10px',minHeight:'34px',cursor:'pointer'};
function setBtn(b,on){css(b,{background:on?'rgba(45,212,191,.22)':'rgba(255,255,255,.07)',borderColor:on?'#2dd4bf':'rgba(255,255,255,.18)',color:on?'#7ff0de':'#e8eef7'})}
function inv(s){s&&s.invalidate&&s.invalidate()}
function resetToggles(){FX.jawT=0;FX.expT=0;FX.xray=false;FX.labels=false;FX.section=false;FX.hidden={};FX.occ={};FX.popOpen=false;if(FX.pop)FX.pop.style.display='none';Object.keys(FX.btns).forEach(k=>setBtn(FX.btns[k],false))}
function buildUI(){
  const bar=mk('div',{position:'fixed',top:'184px',left:'12px',flexDirection:'column',gap:'6px',padding:'6px',borderRadius:'14px',background:'rgba(10,18,32,.86)',border:'1px solid rgba(255,255,255,.14)',zIndex:'40',display:'none'});
  bar.id='av-skull-tools';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Structure tools');
  const act={jaw:b=>{FX.jawT=FX.jawT>0.5?0:1;setBtn(b,FX.jawT>0.5)},explode:b=>{FX.expT=FX.expT>0.5?0:1;setBtn(b,FX.expT>0.5)},xray:b=>{FX.xray=!FX.xray;setBtn(b,FX.xray)},
    labels:b=>{FX.labels=!FX.labels;setBtn(b,FX.labels);if(!FX.labels&&FX.svg)FX.svg.innerHTML=''},
    section:b=>{FX.section=!FX.section;setBtn(b,FX.section);if(FX.section){const up=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Sup');up&&up.click()}},
    parts:b=>{FX.popOpen=!FX.popOpen;setBtn(b,FX.popOpen);FX.pop.style.display=FX.popOpen?'block':'none'}};
  Object.keys(LAB).forEach(k=>{const b=mk('button',BTN,LAB[k]);b.type='button';b.dataset.tool=k;b.addEventListener('click',e=>{e.stopPropagation();act[k](b);inv(FX.s)});bar.appendChild(b);FX.btns[k]=b});
  const pop=mk('div',{position:'fixed',top:'184px',left:'110px',width:'min(400px,calc(100vw - 122px))',maxHeight:'55vh',overflowY:'auto',padding:'10px',borderRadius:'14px',background:'rgba(10,18,32,.95)',border:'1px solid rgba(255,255,255,.16)',zIndex:'41',display:'none',font:'12px system-ui,sans-serif',color:'#e8eef7'});
  pop.addEventListener('pointerdown',e=>e.stopPropagation());bar.addEventListener('pointerdown',e=>e.stopPropagation());
  document.body.appendChild(bar);document.body.appendChild(pop);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');css(svg,{position:'fixed',left:'0',top:'0',width:'100vw',height:'100vh',pointerEvents:'none',zIndex:'35'});document.body.appendChild(svg);
  FX.bar=bar;FX.pop=pop;FX.svg=svg;
}
function buildPop(g){
  const pop=FX.pop,G=GR[g];pop.innerHTML='';
  const top=mk('div',{display:'flex',justifyContent:'space-between',alignItems:'center'});top.appendChild(mk('b',null,G.title));
  const all=mk('button',Object.assign({},BTN,{minHeight:'30px'}),'Show all');all.type='button';all.addEventListener('click',()=>{FX.hidden={};pop.querySelectorAll('input').forEach(i=>i.checked=true);inv(FX.s)});top.appendChild(all);pop.appendChild(top);
  G.secs.forEach(([t,ids])=>{pop.appendChild(mk('div',{margin:'6px 0 4px',fontWeight:'700',color:'#7ff0de'},t));
    const gr=mk('div',{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 10px'});
    ids.forEach(id=>{const l=mk('label',{display:'flex',alignItems:'center',gap:'6px',minHeight:'28px',cursor:'pointer'});const c=mk('input');c.type='checkbox';c.checked=!FX.hidden[id];c.dataset.bone=id;c.addEventListener('change',()=>{FX.hidden[id]=!c.checked;inv(FX.s)});l.appendChild(c);
      l.appendChild(mk('span',{width:'9px',height:'9px',borderRadius:'9px',background:(globalThis.__avBoneCol||{})[id]||'#c9b9a6',flex:'none'}));l.appendChild(mk('span',null,nm(id)));gr.appendChild(l)});pop.appendChild(gr)});
  FX.builtGrp=g;
}
function collect(sc){
  const L=[];
  sc.traverse(m=>{if(!m.isMesh||!m.name)return;
    if(FIXED[m.name]){L.push(m);return}
    const id=m.userData&&m.userData.structureId;const nz=m.name.indexOf('za_')===0;
    if(nz&&(OF[id]||/^za_tooth_l/.test(m.name)))L.push(m);
    else if(id==='optic-nerve'&&!nz)L.push(m)});
  return L;
}
function prep(sc,L){
  const M4=sc.matrix.constructor,V3=sc.position.constructor;FX.M4=M4;FX.V3=V3;
  const sums={};
  L.forEach(m=>{if(m.userData.__fx)return;m.updateWorldMatrix(true,false);const pos=m.geometry.attributes.position,nor=m.geometry.attributes.normal;const n=pos.count,step=Math.max(1,Math.floor(n/260));const S=[],N=[];const v=new V3(),w=new V3(),c=new V3();let cnt=0;
    for(let i=0;i<n;i+=step){v.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld);S.push(v.x,v.y,v.z);if(nor){w.fromBufferAttribute(nor,i).transformDirection(m.matrixWorld);N.push(w.x,w.y,w.z)}else N.push(0,0,0);c.add(v);cnt++}
    c.multiplyScalar(1/cnt);
    const fixed=FIXED[m.name]||null;const low=!fixed&&/^za_tooth_l/.test(m.name);const id=m.userData.structureId;
    const g=fixed?null:low?'skull':OF[id];const bone=fixed?'__fix_'+m.name:low?'mandible':id;
    const side=(g==='ear'||g==='eye')?(c.x>0.004?'|L':c.x<-0.004?'|R':''):'';
    m.userData.__fx={m0:m.matrix.clone(),bone:bone,key:bone+side,grp:g,jaw:bone==='mandible',fixed:fixed,S:new Float32Array(S),N:new Float32Array(N),c:c,own:!low&&!fixed};
    if(g==='skull'){const q=sums[bone]||(sums[bone]={c:new V3(),k:0});q.c.add(c);q.k++}
    if(!m.userData.__rc)m.userData.__rc=m.raycast});
  L.forEach(m=>{const u=m.userData.__fx;if(u.dir||u.fixed)return;let cb=u.c;
    if(u.grp==='skull'){const q=sums[u.bone];if(q)cb=q.c.clone().multiplyScalar(1/q.k);u.cen=new V3(0,1.572,0.03)}
    else u.cen=new V3(u.c.x>0.004?0.045:u.c.x<-0.004?-0.045:0,1.58,-0.004);
    const d=cb.clone().sub(u.cen);if(d.length()<1e-4)d.set(0,0,1);u.dir=d.normalize()});
}
function delta(u,out){
  const M4=FX.M4;out.identity();
  if(u.fixed)return out.makeTranslation(u.fixed[0],u.fixed[1],u.fixed[2]);
  if(u.jaw){const A=BASE_A+OPEN_A*FX.jaw;const T=new M4(),R=new M4(),T2=new M4(),T3=new M4();T3.makeTranslation(0,BASE_DY,0);R.makeRotationX(A);T.makeTranslation(P[0],P[1],P[2]);T2.makeTranslation(-P[0],-P[1],-P[2]);out.multiply(T).multiply(R).multiply(T2).multiply(T3)}
  if(FX.exp>0.001&&u.grp&&u.grp===FX.grp&&GR[u.grp].expl){const k=GR[u.grp].expl*FX.exp;const T=new M4();T.makeTranslation(u.dir.x*k,u.dir.y*k,u.dir.z*k);out.premultiply(T)}
  return out;
}
function apply(){
  const M4=FX.M4,D4=new M4(),Pi=new M4(),Lc=new M4();
  FX.list.forEach(m=>{const u=m.userData.__fx;if(!u)return;delta(u,D4);const pw=m.parent?m.parent.matrixWorld:null;
    if(pw){Pi.copy(pw).invert();Lc.copy(Pi).multiply(D4).multiply(pw).multiply(u.m0)}else Lc.copy(D4).multiply(u.m0);
    m.matrixAutoUpdate=false;m.matrix.copy(Lc);m.matrixWorldNeedsUpdate=true;m.frustumCulled=false;u.D=D4.clone()});
}
function visibility(s){
  const noop=()=>{};const G=FX.grp&&GR[FX.grp];
  if(!FX.plane){FX.plane={normal:new FX.V3(0,-1,0),constant:EYE_CUT_Y}}
  if(s&&s.gl)s.gl.localClippingEnabled=true;
  FX.list.forEach(m=>{const u=m.userData.__fx;if(!u)return;
    const act=u.grp&&u.grp===FX.grp;const h=act&&!!FX.hidden[u.bone];
    if(h){if(m.visible)m.visible=false;u.hid=true;m.raycast=noop}else{if(u.hid){m.visible=true;u.hid=false}m.raycast=m.userData.__rc}
    const wantX=act&&FX.xray&&G&&(!G.xray||G.xray.indexOf(u.bone)>=0);
    const wantCut=act&&FX.section&&FX.grp==='eye';
    const mats=Array.isArray(m.material)?m.material:[m.material];
    mats.forEach(mt=>{if(!mt)return;
      if(wantX){if(!mt.userData.__xo)mt.userData.__xo={t:mt.transparent,o:mt.opacity,d:mt.depthWrite};if(mt.opacity>0.34||!mt.transparent){mt.transparent=true;mt.opacity=0.34;mt.depthWrite=false;mt.needsUpdate=true}}
      else if(mt.userData.__xo){const o=mt.userData.__xo;mt.transparent=o.t;mt.opacity=o.o;mt.depthWrite=o.d;mt.needsUpdate=true;delete mt.userData.__xo}
      if(wantCut){if(!mt.userData.__cp){mt.userData.__cp={s:mt.side};mt.clippingPlanes=[FX.plane];mt.side=2;mt.needsUpdate=true}}
      else if(mt.userData.__cp){mt.clippingPlanes=null;mt.side=mt.userData.__cp.s;delete mt.userData.__cp;mt.needsUpdate=true}})});
}
function labels(s){
  const svg=FX.svg;if(!FX.labels||!FX.list||!FX.grp){svg.innerHTML='';return}
  const cam=s.camera,V3=FX.V3;const rc0=s.gl.domElement.getBoundingClientRect();const W=rc0.width,H=rc0.height,X0=rc0.left,Y0=rc0.top;const cp=cam.position;
  const by={};FX.list.forEach(m=>{const u=m.userData.__fx;if(!u||!u.own||u.grp!==FX.grp||FX.hidden[u.bone])return;(by[u.bone]||(by[u.bone]=[])).push(m)});
  const items=[],v=new V3(),nv=new V3(),mean=new V3();
  const sided=FX.grp==='ear'||FX.grp==='eye';const CM={};
  Object.keys(by).forEach(b0=>{
    by[b0].forEach(m=>{const u=m.userData.__fx,S=u.S,N=u.N,D=u.D;for(let i=0;i<S.length;i+=3){v.set(S[i],S[i+1],S[i+2]);nv.set(N[i],N[i+1],N[i+2]);if(D){v.applyMatrix4(D);nv.transformDirection(D)}
      const dx=cp.x-v.x,dy=cp.y-v.y,dz=cp.z-v.z,dl=Math.hypot(dx,dy,dz)||1;if(FX.xray||(nv.x*dx+nv.y*dy+nv.z*dz)/dl>0.15){const k=b0+(sided?(v.x>0.004?'|L':v.x<-0.004?'|R':''):'');(CM[k]||(CM[k]=[])).push(v.x,v.y,v.z,m.uuid)}}})});
  Object.keys(CM).forEach(b=>{
    let best=null;const cand=CM[b];
    if(!cand.length)return;
    /* keep the third of the facing samples nearest the camera: the outer surface, not the inside of the far wall */
    const ds=[];for(let i=0;i<cand.length;i+=4)ds.push([Math.hypot(cand[i]-cp.x,cand[i+1]-cp.y,cand[i+2]-cp.z),i]);ds.sort((a,c)=>a[0]-c[0]);
    const keep=ds.slice(0,Math.max(1,Math.ceil(ds.length*0.33)));mean.set(0,0,0);keep.forEach(q=>{mean.x+=cand[q[1]];mean.y+=cand[q[1]+1];mean.z+=cand[q[1]+2]});mean.multiplyScalar(1/keep.length);
    let bd=1e9;keep.forEach(q=>{const i=q[1];const d=(cand[i]-mean.x)**2+(cand[i+1]-mean.y)**2+(cand[i+2]-mean.z)**2;if(d<bd){bd=d;best=[cand[i],cand[i+1],cand[i+2],cand[i+3]]}});
    if(!best)return;
    const q=new V3(best[0],best[1],best[2]);const dist=q.distanceTo(cp);q.project(cam);if(q.z>1||q.x<-1||q.x>1||q.y<-1||q.y>1)return;
    items.push({b,wx:best[0],wy:best[1],wz:best[2],uid:best[3],dist,x:X0+(q.x+1)/2*W,y:Y0+(1-q.y)/2*H});
  });
  /* occlusion: a result stays valid while the camera has not moved; stale ones are re-tested, five per frame */
  const still=o=>o&&Math.hypot(o.p[0]-cp.x,o.p[1]-cp.y,o.p[2]-cp.z)<=0.004;
  if(!FX.xray&&items.length&&FX.rc){const vis=FX.list.filter(m=>{const u=m.userData.__fx;return m.visible&&u.own&&u.grp===FX.grp&&!FX.hidden[u.bone]});let budget=5;
    for(let k=0;k<items.length&&budget>0;k++){const it=items[(FX.rr+k)%items.length];const o0=FX.occ[it.b];if(still(o0)&&Math.hypot(o0.a[0]-it.wx,o0.a[1]-it.wy,o0.a[2]-it.wz)<=0.01)continue;budget--;
      const o=new V3(cp.x,cp.y,cp.z),d=new V3(it.wx-cp.x,it.wy-cp.y,it.wz-cp.z).normalize();FX.rc.set(o,d);FX.rc.near=0.005;FX.rc.far=it.dist;
      const hit=FX.rc.intersectObjects(vis,false);let occ=false;for(const h of hit){if(h.object.uuid!==it.uid&&h.distance<it.dist-0.003){occ=true;break}if(h.object.uuid===it.uid)break}
      FX.occ[it.b]={v:occ,p:[cp.x,cp.y,cp.z],a:[it.wx,it.wy,it.wz]}}
    FX.rr+=5;if(budget<5)inv(s)}
  const shown=items.filter(i=>FX.xray||(still(FX.occ[i.b])&&!FX.occ[i.b].v));
  if(!shown.length){svg.innerHTML='';return}
  const xs=shown.map(i=>i.x),minX=Math.min(...xs),maxX=Math.max(...xs),mid=(minX+maxX)/2;
  const fs=innerWidth<600?10:11.5,cw=fs*0.56;
  const L=shown.filter(i=>i.x<mid).sort((a,c)=>a.y-c.y),R=shown.filter(i=>i.x>=mid).sort((a,c)=>a.y-c.y);
  const place=arr=>{let last=-1e9;arr.forEach(i=>{i.ly=Math.max(i.y,last+fs+6);last=i.ly});const over=last-(Y0+H-12);if(over>0)arr.forEach(i=>i.ly-=over)};place(L);place(R);
  let out='';
  const draw=(arr,side)=>arr.forEach(i=>{const t=nm(i.b);const w=t.length*cw;
    const ex=side<0?Math.max(X0+6,minX-34):Math.min(X0+W-6,maxX+34);const tx=side<0?Math.max(X0+6+w,ex):Math.min(X0+W-6-w,ex);const lx=side<0?tx+4:tx-4;
    out+=`<line x1="${lx}" y1="${i.ly-fs*0.35}" x2="${i.x}" y2="${i.y}" stroke="#fff" stroke-opacity=".7" stroke-width="1"/><circle cx="${i.x}" cy="${i.y}" r="2.6" fill="#2dd4bf" stroke="#04202a" stroke-width="1"/>`+
    `<text x="${side<0?tx-w:tx}" y="${i.ly}" fill="#fff" font-family="system-ui,sans-serif" font-size="${fs}" font-weight="600" style="paint-order:stroke" stroke="#06101c" stroke-width="3" stroke-linejoin="round">${t}</text>`});
  draw(L,-1);draw(R,1);svg.innerHTML=out;
}
function groupOf(iso){for(const i of iso){if(OF[i])return OF[i];for(const g in GR)if(GR[g].root===i)return g}return null}
globalThis.__avFxTick=function(s){
  FX.s=s;const sc=s.scene;if(!FX.bar&&document.body)buildUI();
  const iso=(D.getState().isolated)||[];const g=groupOf(iso);
  if(!FX.list||(++FX.n%120===0)){const l=collect(sc);if(l.length){FX.list=l;prep(sc,l)}else if(!FX.list)return}
  if(FX.list.some(m=>!m.userData.__fx))prep(sc,FX.list);
  if(!FX.rc&&s.raycaster)FX.rc=new s.raycaster.constructor();
  if(g!==FX.grp){FX.grp=g;resetToggles();FX.dirty=true}
  if(FX.bar){FX.bar.style.display=g?'flex':'none';
    if(g){if(FX.builtGrp!==g)buildPop(g);const T=GR[g].tools;Object.keys(FX.btns).forEach(k=>{FX.btns[k].style.display=T.indexOf(k)>=0?'':'none'});FX.btns.parts.textContent=GR[g].pop}
    else{FX.svg.innerHTML='';FX.pop.style.display='none'}
    const r=s.gl.domElement.getBoundingClientRect();
    if(innerWidth<600){css(FX.bar,{flexDirection:'row',left:'50%',transform:'translateX(-50%)',top:'232px',gap:'4px',padding:'4px'});css(FX.pop,{left:'50%',transform:'translateX(-50%)',top:'282px',width:'calc(100vw - 16px)'})}
    else{css(FX.bar,{flexDirection:'column',left:(r.left+10)+'px',transform:'none',top:'184px',gap:'6px',padding:'6px'});css(FX.pop,{left:(r.left+108)+'px',transform:'none',top:'184px',width:'min(400px,calc(100vw - 122px))'})}}
  let moving=false;
  const e=(a,t)=>{const d=t-a;if(Math.abs(d)<0.002)return t;moving=true;return a+d*0.16};
  FX.jaw=e(FX.jaw,FX.jawT);FX.exp=e(FX.exp,FX.expT);
  const sig=FX.jaw.toFixed(4)+'|'+FX.exp.toFixed(4)+'|'+FX.grp;
  if(sig!==FX.sig||FX.dirty){FX.sig=sig;apply();FX.dirty=false}
  visibility(s);
  if(g)labels(s);
  if(moving)s.invalidate();
};
})();
