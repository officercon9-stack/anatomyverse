import fs from 'fs';
const sub=(a,b)=>a.map((x,i)=>x-b[i]);const nrm=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)};const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function cat(P,n){const out=[];const g=i=>P[Math.max(0,Math.min(P.length-1,i))];for(let i=0;i<P.length-1;i++){for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);out.push([0,1,2].map(j=>0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}out.push(P[P.length-1]);return out}
function tube(P,r0,r1,v,f,rs=10){const C=cat(P,8);const base=v.length;const n=C.length;
 for(let i=0;i<n;i++){const T=nrm(sub(C[Math.min(n-1,i+1)],C[Math.max(0,i-1)]));const u=Math.abs(T[1])<0.9?[0,1,0]:[1,0,0];const N=nrm(cr(T,u)),B=cr(T,N);const r=r0+(r1-r0)*i/(n-1);
  for(let j=0;j<rs;j++){const a=2*Math.PI*j/rs;v.push([0,1,2].map(k=>+(C[i][k]+r*(Math.cos(a)*N[k]+Math.sin(a)*B[k])).toFixed(5)))}}
 for(let i=0;i<n-1;i++)for(let j=0;j<rs;j++){const a=base+i*rs+j,b=base+i*rs+(j+1)%rs,c=base+(i+1)*rs+j,d=base+(i+1)*rs+(j+1)%rs;f.push([a,c,b],[b,c,d])}}
const L={trunk:[[0.021,1.505,-0.014],[0.030,1.47,-0.008],[0.040,1.435,0.012],[0.046,1.405,0.030],[0.052,1.385,0.040],[0.058,1.365,0.046],[0.068,1.34,0.055],[0.078,1.30,0.06],[0.082,1.265,0.062],[0.083,1.240,0.062]],
 br:[[[0.083,1.240,0.062],[0.095,1.233,0.062],[0.11,1.219,0.06],[0.128,1.203,0.055]],[[0.083,1.240,0.062],[0.088,1.228,0.08],[0.09,1.222,0.095],[0.095,1.208,0.113]],[[0.083,1.240,0.062],[0.076,1.234,0.04],[0.07,1.230,0.015],[0.062,1.224,-0.012]]]};
const mir=P=>P.map(p=>[-p[0],p[1],p[2]]);
const R={trunk:[[-0.021,1.505,-0.014],[-0.030,1.47,-0.008],[-0.038,1.44,0.010],[-0.043,1.41,0.028],[-0.042,1.385,0.038],[-0.042,1.36,0.042],[-0.047,1.33,0.046],[-0.052,1.30,0.046],[-0.055,1.275,0.045],[-0.056,1.263,0.041]],
 br:[[[-0.056,1.263,0.041],[-0.07,1.262,0.036],[-0.10,1.252,0.03],[-0.125,1.236,0.03]],[[-0.056,1.263,0.041],[-0.062,1.261,0.062],[-0.07,1.256,0.09],[-0.08,1.246,0.113]],[[-0.056,1.263,0.041],[-0.052,1.256,0.015],[-0.042,1.242,-0.012],[-0.032,1.232,-0.035]]]};
const out={};
for(const [nm,S] of [['zp_phrenic_l',L],['zp_phrenic_r',R]]){const v=[],f=[];tube(S.trunk,0.0016,0.0011,v,f);for(const b of S.br)tube(b,0.0011,0.0005,v,f);out[nm]={v,f}}
fs.writeFileSync('../zp.json',JSON.stringify(out));console.log(Object.values(out).map(d=>d.v.length+'v'));
