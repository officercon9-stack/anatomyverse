const H=require('./h');H.serve(process.argv[2],8875);
(async()=>{const {b,pg,errs}=await H.open(8875,1280,800,'/app/lab',14000);
const r=await pg.evaluate(()=>{const F=__avF,s=globalThis.__scn;const box={},meshLR=[];
s.updateMatrixWorld(true);
s.traverse(o=>{if(!o.isMesh)return;let sid=null;for(let p=o;p;p=p.parent)if(p.userData&&p.userData.structureId){sid=p.userData.structureId;break}
o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);const cx=(bb.min.x+bb.max.x)/2;
if(sid){(box[sid]=box[sid]||[]).push(cx)}
const n=(o.name||'').toLowerCase();const side=/(^|[_\-. ])(l|left)([_\-. 0-9]|$)/.test(n)?'L':/(^|[_\-. ])(r|right)([_\-. 0-9]|$)/.test(n)?'R':null;
if(side&&Math.abs(cx)>0.008&&((side==='L'&&cx<0)||(side==='R'&&cx>0)))meshLR.push(o.name+' cx='+cx.toFixed(3)+' sid='+sid)});
const recLR=[];for(const id in F){const t=(id+' '+F[id].name).toLowerCase();const side=/\bleft\b/.test(t)?'L':/\bright\b/.test(t)?'R':null;if(!side||!box[id])continue;const xs=box[id];const m=xs.reduce((a,b)=>a+b,0)/xs.length;if(Math.abs(m)>0.008&&((side==='L'&&m<0)||(side==='R'&&m>0)))recLR.push(id+' mean cx='+m.toFixed(3))}
const miss={};const fields=['description','function','location','sources'];for(const id in F)for(const f of fields){const v=F[id][f];if(!v||(Array.isArray(v)&&!v.length))(miss[f]=miss[f]||[]).push(id)}
const names={};for(const id in F){const n=F[id].name.toLowerCase();(names[n]=names[n]||[]).push(id)}const dup=Object.entries(names).filter(([n,v])=>v.length>1);
const rs={};for(const id in F){const k=F[id].reviewStatus||'none';rs[k]=(rs[k]||0)+1}
const noClin=Object.keys(F).filter(id=>!F[id].clinicalRelevance).length;
return {meshLR:meshLR.slice(0,40),meshLRn:meshLR.length,recLR,miss:Object.fromEntries(Object.entries(miss).map(([k,v])=>[k,v.length+': '+v.slice(0,8).join(',')])),dup:dup.slice(0,20),rs,noClin,total:Object.keys(F).length,withMesh:Object.keys(box).length}});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs.slice(0,3));await b.close();process.exit(0)})();
