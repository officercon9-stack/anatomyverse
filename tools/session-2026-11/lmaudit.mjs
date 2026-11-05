import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
await MeshoptDecoder.ready;
const dir=process.argv[2]||'../live35/models/';
const LM=JSON.parse(fs.readFileSync('../lm.json'));
const bones=[]; // {name,pts Float32Array}
const files=['anatomyverse-limbs.glb','zanatomy-limbbones.glb','zanatomy-skull.glb','bodyparts3d-brain-skull.glb','anatomyverse-organs.glb','bodyparts3d-nose-ear.glb'];
const isBone=n=>/^(b_(clavicle|fibula|foot-bones|hand-bones|hip-bone|humerus|patella|radius|scapula|tibia|ulna)|za_(femur|sternum|ethmoid|frontal|hyoid|inf_|lacrimal|mandible|maxilla|nasal|occipital|palatine|parietal|sphenoid|temporal|vomer|zygomatic|tooth)|neurocranium|rib_cage|vertebral_column|costal)/.test(n);
for(const f of files){const doc=await io.read(dir+f);for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m||!isBone(n.getName()))continue;const w=n.getWorldMatrix();const pos=m.listPrimitives()[0].getAttribute('POSITION');const p=[0,0,0];const a=new Float32Array(pos.getCount()*3);for(let i=0;i<pos.getCount();i++){pos.getElement(i,p);a[i*3]=w[0]*p[0]+w[4]*p[1]+w[8]*p[2]+w[12];a[i*3+1]=w[1]*p[0]+w[5]*p[1]+w[9]*p[2]+w[13];a[i*3+2]=w[2]*p[0]+w[6]*p[1]+w[10]*p[2]+w[14];}bones.push({name:n.getName(),a});}}
const group=n=>n.replace(/^(b_|za_)/,'').replace(/__.*/,'').replace(/_(L|R|\d)$/,'');
const res=[];
for(const [name,sid,x,y,z] of LM){let best=1e9,bn='';for(const b of bones){const a=b.a;for(let i=0;i<a.length;i+=3){const d=(a[i]-x)**2+(a[i+1]-y)**2+(a[i+2]-z)**2;if(d<best){best=d;bn=b.name}}}res.push({name,d:Math.sqrt(best),bone:bn,x});}
fs.writeFileSync('lmres_'+(process.argv[3]||'now')+'.json',JSON.stringify(res));
const bad=res.filter(r=>r.d>0.012);console.log('landmarks',res.length,'>12mm from any bone:',bad.length);
const hist=[0.004,0.008,0.012,0.02,0.04,1];for(const h of hist)console.log('<=',h,res.filter(r=>r.d<=h).length);
