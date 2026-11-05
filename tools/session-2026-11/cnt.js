const H=require('./h');const dir=process.argv[2];const port=9600+Math.floor(Math.random()*90);H.serve(dir,port);
(async()=>{const {b,pg,errs}=await H.open(port,390,800,'/app/lab',15000);
const f=()=>pg.evaluate(()=>{let m=0,v=0,tri=0;const sc=globalThis.__r3s.get();sc.scene.traverse(x=>{if(x.isMesh){m++;let ok=true,p=x;while(p){if(p.visible===false){ok=false;break}p=p.parent}if(ok){v++;const g=x.geometry;tri+=(g.index?g.index.count:g.attributes.position.count)/3}}});const i=sc.gl&&sc.gl.info;return {meshes:m,visible:v,tris:Math.round(tri/1000)+'k',calls:i&&i.render.calls,geoms:i&&i.memory.geometries,flags:JSON.stringify(globalThis.__avb.get()).slice(0,200)}});
console.log('default',JSON.stringify(await f()),errs.slice(0,2));
await pg.evaluate(()=>globalThis.__avb.set({ld_jlo:true,ld_jup:true,ld_bur:true,ld_lyu:true,ld_lyl:true}));await pg.waitForTimeout(12000);console.log('joints on',JSON.stringify(await f()));
await b.close();process.exit(0)})();
