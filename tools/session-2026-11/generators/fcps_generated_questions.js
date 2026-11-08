(R,J)=>{let H=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0},P=s=>{let a=H(s);return()=>{a=a+1831565813|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}},out=[],
G=/small arteries|vasa nervorum|nervi nervorum|neighbouring|accompany|companion veins|drain to the|branches of the nearby/i,
cl=s=>String(s||``).replace(/\s+/g,` `).trim(),
nm=r=>cl(r.name),
byKey={},bySys={};R.forEach(r=>{(byKey[r.system+`|`+r.region]=byKey[r.system+`|`+r.region]||[]).push(r);(bySys[r.system]=bySys[r.system]||[]).push(r)});
let cnt=(f)=>{let m={};R.forEach(r=>{let v=cl(f(r)).toLowerCase();if(v)m[v]=(m[v]||0)+1});return m},
cLat=cnt(r=>r.latinName),cFun=cnt(r=>r.function),cOrg=cnt(r=>r.origin),cIns=cnt(r=>r.insertion),cAct=cnt(r=>r.actions),cInn=cnt(r=>r.innervation),cBld=cnt(r=>r.bloodSupply),cNam=cnt(r=>r.name),
pool=(r,get,rnd)=>{let k=[...(byKey[r.system+`|`+r.region]||[]),...(bySys[r.system]||[]),...R],seen={},res=[],mine=cl(get(r)).toLowerCase();let a=(byKey[r.system+`|`+r.region]||[]).slice(),b=(bySys[r.system]||[]).slice(),c=R;for(let g of [a,b,c]){let t=g.slice();for(let i=t.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[t[i],t[j]]=[t[j],t[i]]}for(let x of t){let v=cl(get(x));let l=v.toLowerCase();if(!v||l===mine||seen[l]||x.id===r.id)continue;seen[l]=1;res.push(x);if(res.length>=3)return res}}return res},
mk=(id,diff,prompt,get,r,ans,expl,obj,txt)=>{let rnd=P(id),d=pool(r,get,rnd);if(d.length<3)return;let o=d.map(x=>cl(get(x)));if(o.some(x=>x.length>170)||ans.length>170)return;let pos=Math.floor(rnd()*4);o.splice(pos,0,ans);out.push({id:`q-fcps-g-`+id,type:`multiple-choice`,topic:`fcps`,difficulty:diff,prompt:prompt,options:J(...o),correctOptionId:`abcd`[pos],explanation:expl,learningObjective:obj,relatedStructureIds:[r.id],sources:[],generated:!0})};
for(let r of R){let n=nm(r);if(!n)continue;
 if(r.latinName){let L=cl(r.latinName),l=L.toLowerCase();if(l!==n.toLowerCase()&&cLat[l]===1){mk(`lat-${r.id}`,`foundation`,`The Latin (Terminologia Anatomica) name of the ${n} is:`,x=>x.latinName,r,L,`${n}: ${L}.`,`Know the Latin anatomical terms`);
  if(cNam[n.toLowerCase()]===1)mk(`nam-${r.id}`,`foundation`,`Which structure has the Latin name "${L}"?`,x=>x.name,r,n,`${L} is the Latin name of the ${n}.`,`Know the Latin anatomical terms`)}}
 if(r.function){let F=cl(r.function),l=F.toLowerCase();if(cFun[l]===1&&F.length<150&&F.length>25)mk(`fun-${r.id}`,`intermediate`,`Which structure fits this description of function: "${F}"`,x=>x.name,r,n,`The ${n}: ${F}`,`State what a structure does`)}
 if(r.origin&&r.insertion){let O=cl(r.origin),I=cl(r.insertion);if(cOrg[O.toLowerCase()]===1)mk(`org-${r.id}`,`intermediate`,`What is the origin of ${n}?`,x=>x.origin,r,O,`Origin of ${n}: ${O.replace(/\.$/,``)}. Insertion: ${I}`,`State muscle origins and insertions`);
  if(cIns[I.toLowerCase()]===1)mk(`ins-${r.id}`,`intermediate`,`Where does ${n} insert?`,x=>x.insertion,r,I,`Insertion of ${n}: ${I.replace(/\.$/,``)}. Origin: ${O}`,`State muscle origins and insertions`);
  if(r.actions&&cAct[cl(r.actions).toLowerCase()]===1)mk(`act-${r.id}`,`intermediate`,`What is the main action of ${n}?`,x=>x.actions,r,cl(r.actions),`Main action of ${n}: ${cl(r.actions).replace(/\.$/,``)}.`,`State muscle actions`)}}
return out}
