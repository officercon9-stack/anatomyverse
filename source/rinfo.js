const H=require('./h');H.serve(process.argv[2],8981);const W=+process.argv[3]||390,Hh=+process.argv[4]||844;
(async()=>{const {b,pg}=await H.open(8981,W,Hh,'/app/lab',14000);
console.log(await pg.evaluate(()=>{const s=globalThis.__r3s.get();const gl=s.gl;const sc=s.scene;const types={},tr={},lights=[];let vis=0,tris=0,trans=0,dsided=0;
sc.traverse(o=>{if(o.isLight)lights.push(o.type+(o.castShadow?'(shadow)':''));if(!o.isMesh)return;let v=true;for(let p=o;p;p=p.parent)if(!p.visible)v=false;if(!v)return;vis++;const m=Array.isArray(o.material)?o.material[0]:o.material;types[m.type]=(types[m.type]||0)+1;if(m.transparent){trans++;tr[o.name.slice(0,18)]=+m.opacity.toFixed(2)}if(m.side===2)dsided++;const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3});
gl.info.autoReset=false;gl.info.reset();gl.render(sc,s.camera);const inf={calls:gl.info.render.calls,tris:gl.info.render.triangles};
return JSON.stringify({dpr:gl.getPixelRatio(),size:[gl.domElement.width,gl.domElement.height],aa:gl.getContextAttributes().antialias,shadow:gl.shadowMap.enabled,tone:gl.toneMapping,vis,tris:Math.round(tris),trans,dsided,types,lights,inf,transList:Object.entries(tr).slice(0,25)})}));
await b.close();process.exit(0)})();
