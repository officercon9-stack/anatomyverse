const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const T={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.glb':'model/gltf-binary','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const Z=new Set(['.js','.html','.css','.json','.svg','.webmanifest']);const cache={};
exports.serve=(root,port)=>{root=path.resolve(root);http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}const x=path.extname(f);const h={'content-type':T[x]||'application/octet-stream','cache-control':'max-age=600'};
if(Z.has(x)&&/gzip/.test(q.headers['accept-encoding']||'')){d=cache[f]||(cache[f]=zlib.gzipSync(d,{level:6}));h['content-encoding']='gzip'}h['content-length']=d.length;r.writeHead(200,h);r.end(d)})}).listen(port)};
