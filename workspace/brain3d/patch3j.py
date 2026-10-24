# ---------- pre-compile the shader variants a tap needs (opaque/transparent x front/double, with/without normals) ----------
v=rd(V)
WARM=r'''function _Warm(){let _t=b();(0,k.useEffect)(()=>{let _dead=!1,_run=()=>{if(_dead)return;try{let _sc=_t.scene,_seen=new Map;_sc.traverse(_o=>{if(!_o.isMesh||!_o.material||!_o.geometry||Array.isArray(_o.material))return;let _y=_o.material.type;if(_y!==`MeshStandardMaterial`&&_y!==`MeshBasicMaterial`)return;let _k=_y+`|`+Object.keys(_o.geometry.attributes).sort().join()+`|`+(_o.isSkinnedMesh?1:0);_seen.has(_k)||_seen.set(_k,_o)});let _ms=[];_seen.forEach(_src=>{let _std=_src.material.type===`MeshStandardMaterial`;for(let _tr of[0,1])for(let _sd of _std?[0,2]:[0]){let _m=_src.clone();_m.material=new _src.material.constructor(_std?{color:`#c88`,roughness:.6,metalness:0,envMapIntensity:.9,transparent:!!_tr,opacity:_tr?.5:1,depthWrite:!_tr,side:_sd,emissive:`#222`,emissiveIntensity:.3}:{color:`#fff`,transparent:!!_tr,opacity:_tr?.5:1,depthTest:!_tr});_m.visible=!0;_m.frustumCulled=!1;_m.layers.set(31);_ms.push(_m);_sc.add(_m)}});let _done=()=>{_ms.forEach(_m=>{_sc.remove(_m);_m.material.dispose()})};_t.gl.compileAsync?_t.gl.compileAsync(_sc,_t.camera).then(_done,_done):(_t.gl.compile(_sc,_t.camera),_done())}catch(_e){}},_h=setTimeout(_run,1500),_h2=setTimeout(_run,7000);return()=>{_dead=!0;clearTimeout(_h);clearTimeout(_h2)}},[]);return null}
'''
v=sub1(v,'function _BrainFlow(){',WARM+'function _BrainFlow(){')
v=sub1(v,'(0,A.jsx)(_BrainFlow,{}),','(0,A.jsx)(_BrainFlow,{}),(0,A.jsx)(_Warm,{}),')
wr(V,v)

# selecting a part should only pull in the (large) limb model when the part is a limb muscle/bone
import json as _js
_ids=sorted(set(MIDS)|{f[0] for f in FIB}|{'clavicle','scapula','humerus','radius','ulna','hip-bone','femur','patella','tibia','fibula','hand-bones','foot-bones'})
v=rd(V)
v=sub1(v,'_s.selectedId&&_avb.set({ld_limb:!0})','_s.selectedId&&_LIMBSEL.has(_s.selectedId)&&_avb.set({ld_limb:!0})')
v=sub1(v,'function _BrainFlow(){','var _LIMBSEL=new Set('+_js.dumps(_ids)+');function _BrainFlow(){')
wr(V,v)
