const {chromium,devices}=require('playwright');const mobile=process.argv[2]==='mobile';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({...(mobile?devices['Pixel 5']:{viewport:{width:1280,height:800}}),serviceWorkers:'block'});const p=await c.newPage();
await p.goto('http://localhost:8160/#/app/lab');let last=-1;for(let i=0;i<60;i++){await p.waitForTimeout(2500);const o=await p.evaluate(()=>globalThis.__avOvS||null);if(o&&o.total&&o.loaded>=o.total&&o.total===last)break;if(o)last=o.total}
for(const t of ['I understand','Got it']){await p.getByText(t,{exact:true}).first().click({timeout:500}).catch(()=>{})}
const cam=()=>p.evaluate(()=>__r3s.get().camera.position.toArray().concat(__r3s.get().controls.target.toArray()));
const still=async()=>{let a=await cam();for(let i=0;i<40;i++){await p.waitForTimeout(250);const b2=await cam();if(Math.max(...a.map((v,k)=>Math.abs(v-b2[k])))<1e-4)return b2;a=b2}return a};
await p.evaluate(()=>__avStore.getState().resetAll());await p.waitForTimeout(500);const c0=await still();
// reset camera check
const reset=()=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.title==='Reset view, layers and selection'||b.title==='Return the camera to the front view');b&&b.click();return b&&b.title});
await p.evaluate(()=>{const s=__r3s.get();s.camera.position.x+=0.9;s.camera.position.z-=0.4;s.controls.update()});await p.waitForTimeout(300);
const which=await reset();const c1=await still();const d=Math.hypot(...[0,1,2].map(k=>c1[k]-c0[k]));
console.log('reset button',which,'distance from start view after reset',d.toFixed(3),'m');
let n=0,ok=0,bad=[];
for(let i=0;i<40;i++){const fx=0.36+0.28*((i*7)%10)/10,fy=0.12+0.74*((i*13)%20)/20;
 await p.evaluate(()=>__avStore.getState().select(null));await still();
 const bx=await p.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return {x:c.left,y:c.top,w:c.width,h:c.height}});const x=bx.x+bx.w*fx,y=bx.y+bx.h*fy;
 if(await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.tagName,[x,y])!=='CANVAS')continue;
 const exp=await p.evaluate(([x,y])=>{const s=__r3s.get();const r=s.gl.domElement.getBoundingClientRect();const P=s.pointer.clone();P.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);s.raycaster.setFromCamera(P,s.camera);for(const h of s.raycaster.intersectObjects(s.scene.children,true)){const o=h.object;if(!o.isMesh||!o.userData.structureId)continue;let v=true;for(let q=o;q;q=q.parent)if(!q.visible)v=false;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!v||m.opacity<0.3||m.visible===false)continue;return o.userData.structureId}return null},[x,y]);
 if(mobile)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);await p.waitForTimeout(400);const got=await p.evaluate(()=>__avStore.getState().selectedId);
 if(exp){n++;if(got===exp)ok++;else bad.push(exp+'->'+got+'@'+fx.toFixed(2)+','+fy.toFixed(2))}else if(got)bad.push('empty->'+got)}
console.log(mobile?'tap':'click','exact',ok+'/'+n,'mismatch',bad.join('; '));await b.close()})()
