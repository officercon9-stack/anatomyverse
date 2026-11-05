import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});await MeshoptDecoder.ready;
const sets={A:['VH_F_body_of_uterus','VH_F_fundus_of_uterus','VH_F_cornua','VH_F_lower_uterine_segment','VH_F_cervix'],B:['VH_F_posterior_wall_of_uterus','VH_F_anterior_wall_of_uterus']};
for(const [k,names] of Object.entries(sets)){const d=await io.read('/tmp/ccf/v1.2/models/VH_F_Uterus.glb');
 for(const n of d.getRoot().listNodes()){if(n.getMesh()&&!names.includes(n.getName()))n.dispose()}
 await io.write('/tmp/pv/set'+k+'.glb',d)}
