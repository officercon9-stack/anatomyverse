const H=require('./h');const port=9400+Math.floor(Math.random()*90);H.serve('ghclone',port);
(async()=>{const {b,pg,errs}=await H.open(port,900,760,'/app/lab',14000);
await pg.addStyleTag({content:'.av-label,.av-panel,#avux,header,nav,.avx-cut-btn,.avx-cut-pan{display:none!important}'});
const shots=JSON.parse(process.argv[2]);
for(const s of shots){
 await pg.evaluate(([id,iso,pos,tgt])=>{const S=__avStore.getState();S.select(null);S.restoreVisibility&&S.restoreVisibility();if(id)S.select(id);},[s.id,s.iso,s.pos,s.tgt]);
 await pg.waitForTimeout(6000);
 await pg.evaluate(([iso,pos,tgt])=>{const S=__avStore.getState();if(iso)S.isolate(iso);const sc=globalThis.__r3s.get();sc.camera.position.set(...pos);sc.controls.target.set(...tgt);sc.camera.near=.001;sc.camera.updateProjectionMatrix();sc.controls.update()},[s.iso,s.pos,s.tgt]);
 await pg.waitForTimeout(2500);await pg.screenshot({path:'chk/'+s.out});
}
const r=await pg.evaluate(()=>{const o=[];globalThis.__r3s.get().scene.traverse(x=>{if(x.isMesh&&/^zj_/.test(x.name))o.push(x.name)});return [o.length,o.slice(0,4),globalThis.__avb.get().ld_joints]});
console.log(JSON.stringify(r),'ERR',errs.slice(0,3));await b.close();process.exit(0)})();
