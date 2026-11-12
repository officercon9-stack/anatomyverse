// Inventory of the running app: every mesh in the scene with world coordinates, for one sex and one gate set.
const {chromium}=require('playwright');const fs=require('fs');
const sex=process.argv[2]||'male',brain=process.argv[3]==='bp3d';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();
const errs=[],bad=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
await p.goto('http://localhost:8150/#/app/lab');
const wait=async()=>{let last=-1,same=0;for(let i=0;i<80;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total){if(o.total===last){if(++same>=2)break}else{last=o.total;same=0}}}};
await wait();
await p.evaluate(s=>__avStore.getState().setSex(s),sex);
await p.evaluate(br=>globalThis.__avb.set({ld_jlo:!0,ld_jup:!0,ld_bur:!0,ld_lyu:!0,ld_lyl:!0,vessels:!0,csf:!0,fossae:!0,tracts:!0,mening:!0,dia:!0,ld_brain:br}),brain);
await p.evaluate(()=>window.dispatchEvent(new Event('avgo')));
await wait();await p.waitForTimeout(3000);
if(!fs.existsSync('manifest.json')){const man=await p.evaluate(async()=>{const m=await import('/assets/assetManifest-D3o27EUe-b163.js');const out={};for(const k in m){const v=m[k];if(v&&typeof v==='object'){if(v.skin&&v.skin.layer==='skin')out.records=v;else if(v['schematic-body-v1'])out.assets=v}}
  const A={};for(const id in out.assets){const a=out.assets[id];A[id]={id:a.id,name:a.name,kind:a.kind,url:a.url,fidelity:a.fidelity,license:a.license,attribution:a.attribution,objectMap:a.objectMap||null,overlays:(a.overlays||[]).map(o=>({assetId:o.assetId,gate:o.gate||null,replacesParts:o.replacesParts||[]})),parts:(a.parts||[]).map(q=>({name:q.name,structureId:q.structureId,sex:q.sex||null}))}}
  return {records:out.records,assets:A}});fs.writeFileSync('manifest.json',JSON.stringify(man))}
const n=await p.evaluate(()=>{const s=globalThis.__r3s.get();s.scene.updateMatrixWorld(true);const L=[];s.scene.traverse(o=>{if(o.isMesh)L.push(o)});globalThis.__L=L;return L.length});
const out=[];
for(let i=0;i<n;i+=40){const part=await p.evaluate(([i0,i1])=>{const res=[];for(let i=i0;i<Math.min(i1,__L.length);i++){const o=__L[i],g=o.geometry,pos=g.attributes.position,e=o.matrixWorld.elements;
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9],sm=[0,0,0],h=0,nan=0;const step=Math.max(1,Math.floor(pos.count/48)),samp=[];
  for(let k=0;k<pos.count;k++){const x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);const w=[e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]];
   if(!isFinite(w[0]+w[1]+w[2])){nan++;continue}for(let a=0;a<3;a++){if(w[a]<mn[a])mn[a]=w[a];if(w[a]>mx[a])mx[a]=w[a];sm[a]+=w[a]}h=(h*31+Math.round(w[0]*2000)*7+Math.round(w[1]*2000)*13+Math.round(w[2]*2000)*17)>>>0;if(k%step===0)samp.push(w.map(v=>+v.toFixed(4)))}
  let vis=true,model='';for(let q=o;q;q=q.parent){if(!q.visible)vis=false;if(q.parent&&q.parent.parent&&!q.parent.parent.parent)0;}
  const chain=[];for(let q=o.parent;q;q=q.parent)if(q.name)chain.push(q.name);
  const m=Array.isArray(o.material)?o.material[0]:o.material;
  res.push({name:o.name,sid:o.userData.structureId||null,model:chain[0]||'',vis:vis&&m.visible!==false,op:+(+m.opacity).toFixed(2),col:m.color?m.color.getHexString():null,nv:pos.count,nt:(g.index?g.index.count:pos.count)/3,mn:mn.map(v=>+v.toFixed(4)),mx:mx.map(v=>+v.toFixed(4)),c:sm.map(v=>+(v/Math.max(1,pos.count-nan)).toFixed(4)),hash:h,nan,samp})}return res},[i,i+40]);out.push(...part)}
fs.writeFileSync('scene_'+sex+(brain?'_bp3d':'')+'.json',JSON.stringify(out));
const ov=await p.evaluate(()=>globalThis.__avOvS);console.log(sex,brain?'bp3d-brain':'default','meshes',n,'overlays',JSON.stringify(ov),'errors',errs.length,errs.slice(0,2),'bad',bad.slice(0,3));await b.close();process.exit(0)})()
