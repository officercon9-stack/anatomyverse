/**
 * Procedural "schematic body": every part is a function that builds its geometry (metres, y up, +z front).
 * `make(detail)` receives a detail factor (1 = normal, lower on low-power devices).
 * Generated from the compiled app and renamed; geometry maths is unchanged.
 */
// @ts-nocheck
import {
  Vector3,
  CatmullRomCurve3,
  SphereGeometry,
  CapsuleGeometry,
  Quaternion,
  CylinderGeometry,
  BoxGeometry,
  Vector2,
  LatheGeometry,
  TubeGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
var toVector3 = (e) => new Vector3(...e);
function ellipsoid(centre, radii, rotation = [0, 0, 0], detail = 1) {
  let geometry = new SphereGeometry(1, Math.round(detail * 28), Math.round(detail * 20));
  geometry.scale(...radii);
  geometry.rotateX(rotation[0]);
  geometry.rotateY(rotation[1]);
  geometry.rotateZ(rotation[2]);
  geometry.translate(...centre);
  return geometry;
}
function capsuleBetween(from, to, radius, detail = 1) {
  let start = toVector3(from);
  let end = toVector3(to);
  let delta = new Vector3().subVectors(end, start);
  let length = delta.length();
  let geometry = new CapsuleGeometry(
    radius,
    Math.max(length - radius * 2, 0.001),
    Math.max(3, Math.round(detail * 6)),
    Math.round(detail * 14),
  );
  let rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.normalize());
  geometry.applyQuaternion(rotation);
  let middle = start.add(end).multiplyScalar(0.5);
  geometry.translate(middle.x, middle.y, middle.z);
  return geometry;
}
function tubeAlong(points, radius, detail = 1, segments = 48, closed = false) {
  let curve = new CatmullRomCurve3(points.map(toVector3), closed, `centripetal`);
  return new TubeGeometry(curve, Math.round(segments * detail), radius, Math.max(6, Math.round(detail * 10)), closed);
}
function mergeSmooth(geometries) {
  let prepared = geometries.map((e) => {
    let t = e.index ? e.toNonIndexed() : e;
    for (let e of Object.keys(t.attributes)) {
      if (e !== `position` && e !== `normal`) {
        t.deleteAttribute(e);
      }
    }
    if (!t.attributes.normal) {
      t.computeVertexNormals();
    }
    return t;
  });
  let merged = mergeGeometries(prepared, false);
  if (!merged) {
    throw Error(`Failed to merge schematic geometry`);
  }
  geometries.forEach((e) => e.dispose());
  return merged;
}
const SIDES = [
  {
    s: 1,
    tag: `L`,
  },
  {
    s: -1,
    tag: `R`,
  },
];
export const COLORS = {
  skin: `#d9a88a`,
  bone: `#e7dcc4`,
  muscle: `#b8473f`,
  artery: `#cc3333`,
  vein: `#3b5fb5`,
  nerve: `#e8c547`,
  brain: `#d9a3a0`,
};
var SPINE_CURVE = new CatmullRomCurve3(
  [
    [0, 1.535, -0.035],
    [0, 1.45, -0.042],
    [0, 1.3, -0.085],
    [0, 1.1, -0.082],
    [0, 0.95, -0.058],
    [0, 0.88, -0.07],
  ].map(toVector3),
);
function spineGeometry(e) {
  let t = [];
  for (let n = 0; n < 24; n++) {
    let r = n / 23;
    let i = SPINE_CURVE.getPoint(r * 0.93);
    let a = n < 7 ? 0.013 : n < 19 ? 0.016 : 0.021;
    let o = new CylinderGeometry(a, a, 0.017, Math.round(e * 12));
    o.translate(i.x, i.y, i.z + 0.012);
    t.push(o);
    let s = new BoxGeometry(0.007, 0.01, 0.026);
    s.rotateX(n < 19 && n > 6 ? 0.5 : 0.15);
    s.translate(i.x, i.y - 0.004, i.z - 0.025);
    t.push(s);
  }
  let n = new CylinderGeometry(0.045, 0.012, 0.12, Math.round(e * 14));
  n.scale(1, 1, 0.45);
  n.rotateX(-0.45);
  n.translate(0, 0.835, -0.07);
  t.push(n);
  return mergeSmooth(t);
}
function spinalCordGeometry(e) {
  let t = [];
  for (let e = 0; e <= 0.76; e += 0.04) {
    let n = SPINE_CURVE.getPoint(e);
    t.push([n.x, n.y, n.z - 0.005]);
  }
  return tubeAlong(t, 0.0065, e, 60);
}
function ribCageGeometry(e) {
  let t = [];
  let n = [0.55, 0.72, 0.84, 0.92, 0.97, 1, 1, 0.99, 0.96, 0.92, 0.84, 0.72];
  for (let r = 0; r < 12; r++) {
    let i = 1.405 - r * 0.027;
    let a = n[r];
    let o = SPINE_CURVE.getPoint(0.17 + r * 0.03).z;
    for (let { s: n } of SIDES) {
      let s = [
        [n * 0.018, i, o + 0.005],
        [n * 0.1 * a, i - 0.006, o - 0.005],
        [n * 0.155 * a, i - 0.035, 0],
      ];
      if (r < 7) {
        s.push([n * 0.125 * a, i - 0.07, 0.075], [n * 0.022, 1.39 - r * 0.03, 0.112]);
      } else if (r < 10) {
        s.push([n * 0.13 * a, i - 0.07, 0.07], [n * 0.075, i - 0.075, 0.1]);
      } else {
        s.push([n * 0.14 * a, i - 0.06, 0.04]);
      }
      t.push(tubeAlong(s, 0.0055, e * 0.6, 28));
    }
  }
  return mergeSmooth(t);
}
function coilGeometry(e) {
  let t = [];
  for (let e = 0; e <= 90; e++) {
    let n = e / 90;
    let r = n * Math.PI * 7;
    t.push([
      Math.sin(r) * 0.075 * (0.6 + Math.cos(n * 9) * 0.4),
      0.925 - n * 0.125 + Math.sin(n * 40) * 0.012,
      0.035 + Math.cos(r) * 0.025,
    ]);
  }
  return tubeAlong(t, 0.011, e, 260);
}
export const SCHEMATIC_PARTS = [
  {
    name: `skin_head`,
    structureId: `skin`,
    color: COLORS.skin,
    make: (e) => ellipsoid([0, 1.635, 0], [0.096, 0.118, 0.112], [0, 0, 0], e),
  },
  {
    name: `skin_neck`,
    structureId: `skin`,
    color: COLORS.skin,
    make: (e) => capsuleBetween([0, 1.43, -0.012], [0, 1.56, -0.004], 0.056, e),
  },
  {
    name: `skin_torso`,
    structureId: `skin`,
    color: COLORS.skin,
    make: (e) => {
      let t = [
        [0.001, 0.74],
        [0.15, 0.76],
        [0.18, 0.85],
        [0.165, 0.98],
        [0.155, 1.08],
        [0.175, 1.2],
        [0.195, 1.32],
        [0.205, 1.4],
        [0.13, 1.46],
        [0.055, 1.475],
        [0.001, 1.478],
      ].map(([e, t]) => new Vector2(e, t));
      let n = new LatheGeometry(t, Math.round(e * 40));
      n.scale(1, 1, 0.64);
      return n;
    },
  },
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `skin_arm_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => capsuleBetween([e * 0.2, 1.405, -0.005], [e * 0.272, 1.115, -0.008], 0.046, t),
    },
    {
      name: `skin_forearm_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => capsuleBetween([e * 0.272, 1.115, -0.008], [e * 0.338, 0.86, 0.015], 0.037, t),
    },
    {
      name: `skin_hand_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => ellipsoid([e * 0.352, 0.79, 0.02], [0.03, 0.065, 0.016], [0, 0, e * 0.25], t),
    },
    {
      name: `skin_thigh_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => capsuleBetween([e * 0.09, 0.86, 0], [e * 0.1, 0.475, 0], 0.078, t),
    },
    {
      name: `skin_leg_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => capsuleBetween([e * 0.1, 0.475, 0], [e * 0.1, 0.075, -0.012], 0.052, t),
    },
    {
      name: `skin_foot_${t}`,
      structureId: `skin`,
      color: COLORS.skin,
      make: (t) => ellipsoid([e * 0.1, 0.03, 0.04], [0.04, 0.03, 0.1], [0, 0, 0], t),
    },
  ]),
  {
    name: `skull`,
    structureId: `skull`,
    color: COLORS.bone,
    make: (e) =>
      mergeSmooth([
        ellipsoid([0, 1.648, -0.005], [0.086, 0.1, 0.098], [0, 0, 0], e),
        ellipsoid([0, 1.575, 0.03], [0.062, 0.042, 0.068], [0.25, 0, 0], e),
      ]),
  },
  {
    name: `vertebral_column`,
    structureId: `vertebral-column`,
    color: COLORS.bone,
    make: spineGeometry,
  },
  {
    name: `rib_cage`,
    structureId: `ribs`,
    color: COLORS.bone,
    make: ribCageGeometry,
  },
  {
    name: `sternum`,
    structureId: `sternum`,
    color: COLORS.bone,
    make: (e) =>
      mergeSmooth([
        (() => {
          let e = new BoxGeometry(0.036, 0.055, 0.012);
          e.translate(0, 1.385, 0.11);
          return e;
        })(),
        (() => {
          let e = new BoxGeometry(0.03, 0.15, 0.011);
          e.translate(0, 1.28, 0.115);
          return e;
        })(),
        ellipsoid([0, 1.19, 0.113], [0.01, 0.022, 0.005], [0, 0, 0], e),
      ]),
  },
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `clavicle_${t}`,
      structureId: `clavicle`,
      color: COLORS.bone,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.022, 1.418, 0.108],
            [e * 0.095, 1.435, 0.075],
            [e * 0.17, 1.43, 0.01],
            [e * 0.19, 1.425, -0.015],
          ],
          0.0085,
          t,
          24,
        ),
    },
    {
      name: `scapula_${t}`,
      structureId: `scapula`,
      color: COLORS.bone,
      make: (t) => ellipsoid([e * 0.115, 1.32, -0.105], [0.058, 0.082, 0.012], [0, e * -0.35, e * 0.1], t),
    },
    {
      name: `humerus_${t}`,
      structureId: `humerus`,
      color: COLORS.bone,
      make: (t) =>
        mergeSmooth([
          ellipsoid([e * 0.192, 1.4, -0.01], [0.024, 0.024, 0.024], [0, 0, 0], t),
          capsuleBetween([e * 0.195, 1.395, -0.01], [e * 0.266, 1.13, -0.01], 0.013, t),
          ellipsoid([e * 0.268, 1.125, -0.01], [0.027, 0.013, 0.016], [0, 0, 0], t),
        ]),
    },
    {
      name: `radius_${t}`,
      structureId: `radius`,
      color: COLORS.bone,
      make: (t) => capsuleBetween([e * 0.282, 1.115, 0.002], [e * 0.35, 0.87, 0.022], 0.0085, t),
    },
    {
      name: `ulna_${t}`,
      structureId: `ulna`,
      color: COLORS.bone,
      make: (t) => capsuleBetween([e * 0.26, 1.13, -0.018], [e * 0.326, 0.87, 0.002], 0.0085, t),
    },
    {
      name: `hip_bone_${t}`,
      structureId: `hip-bone`,
      color: COLORS.bone,
      make: (t) =>
        mergeSmooth([
          ellipsoid([e * 0.095, 0.915, -0.025], [0.07, 0.06, 0.016], [0, e * 0.55, e * -0.2], t),
          tubeAlong(
            [
              [e * 0.115, 0.87, -0.04],
              [e * 0.11, 0.82, -0.025],
              [e * 0.065, 0.78, 0.025],
              [e * 0.012, 0.79, 0.06],
            ],
            0.013,
            t,
            24,
          ),
          tubeAlong(
            [
              [e * 0.11, 0.82, -0.025],
              [e * 0.08, 0.775, -0.03],
              [e * 0.04, 0.78, 0.03],
            ],
            0.011,
            t,
            16,
          ),
        ]),
    },
    {
      name: `femur_${t}`,
      structureId: `femur`,
      color: COLORS.bone,
      make: (t) =>
        mergeSmooth([
          ellipsoid([e * 0.088, 0.862, 0], [0.022, 0.022, 0.022], [0, 0, 0], t),
          capsuleBetween([e * 0.09, 0.86, 0], [e * 0.128, 0.83, 0], 0.013, t),
          ellipsoid([e * 0.135, 0.835, -0.005], [0.016, 0.022, 0.016], [0, 0, 0], t),
          capsuleBetween([e * 0.126, 0.83, 0], [e * 0.1, 0.505, 0], 0.0145, t),
          ellipsoid([e * 0.1, 0.495, -0.006], [0.031, 0.02, 0.026], [0, 0, 0], t),
        ]),
    },
    {
      name: `patella_${t}`,
      structureId: `patella`,
      color: COLORS.bone,
      make: (t) => ellipsoid([e * 0.1, 0.49, 0.034], [0.017, 0.021, 0.008], [0, 0, 0], t),
    },
    {
      name: `tibia_${t}`,
      structureId: `tibia`,
      color: COLORS.bone,
      make: (t) =>
        mergeSmooth([
          ellipsoid([e * 0.097, 0.468, -0.002], [0.03, 0.013, 0.025], [0, 0, 0], t),
          capsuleBetween([e * 0.095, 0.47, 0.002], [e * 0.093, 0.085, -0.008], 0.013, t),
        ]),
    },
    {
      name: `fibula_${t}`,
      structureId: `fibula`,
      color: COLORS.bone,
      make: (t) => capsuleBetween([e * 0.124, 0.455, -0.014], [e * 0.12, 0.075, -0.016], 0.0065, t),
    },
  ]),
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `deltoid_${t}`,
      structureId: `deltoid`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.203, 1.375, -0.004], [0.04, 0.072, 0.052], [0, 0, e * 0.3], t),
    },
    {
      name: `biceps_brachii_${t}`,
      structureId: `biceps-brachii`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.238, 1.245, 0.024], [0.02, 0.085, 0.02], [0, 0, e * 0.266], t),
    },
    {
      name: `triceps_brachii_${t}`,
      structureId: `triceps-brachii`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.236, 1.255, -0.035], [0.022, 0.095, 0.021], [0, 0, e * 0.266], t),
    },
    {
      name: `pectoralis_major_${t}`,
      structureId: `pectoralis-major`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.09, 1.325, 0.108], [0.085, 0.055, 0.016], [0, e * 0.35, e * -0.22], t),
    },
    {
      name: `rectus_abdominis_${t}`,
      structureId: `rectus-abdominis`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.032, 0.99, 0.096], [0.028, 0.18, 0.011], [0, 0, 0], t),
    },
    {
      name: `rectus_femoris_${t}`,
      structureId: `rectus-femoris`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.112, 0.67, 0.048], [0.03, 0.15, 0.024], [0, 0, e * -0.03], t),
    },
    {
      name: `gastrocnemius_${t}`,
      structureId: `gastrocnemius`,
      color: COLORS.muscle,
      make: (t) => ellipsoid([e * 0.1, 0.36, -0.035], [0.034, 0.1, 0.03], [0, 0, 0], t),
    },
  ]),
  {
    name: `diaphragm`,
    structureId: `diaphragm`,
    color: `#a8443d`,
    doubleSide: true,
    make: (e) => {
      let t = new SphereGeometry(1, Math.round(e * 32), Math.round(e * 14), 0, Math.PI * 2, 0, Math.PI * 0.42);
      t.scale(0.152, 0.075, 0.098);
      t.translate(0, 1.035, -0.005);
      return t;
    },
  },
  {
    name: `heart_right_atrium`,
    structureId: `right-atrium`,
    color: `#9e3434`,
    make: (e) => ellipsoid([-0.03, 1.255, 0.045], [0.027, 0.032, 0.027], [0, 0, 0], e),
  },
  {
    name: `heart_right_ventricle`,
    structureId: `right-ventricle`,
    color: `#b5443f`,
    make: (e) => ellipsoid([0.006, 1.212, 0.074], [0.036, 0.042, 0.024], [0, 0, 0.5], e),
  },
  {
    name: `heart_left_atrium`,
    structureId: `left-atrium`,
    color: `#c45a52`,
    make: (e) => ellipsoid([0.024, 1.265, 0.012], [0.029, 0.022, 0.024], [0, 0, 0], e),
  },
  {
    name: `heart_left_ventricle`,
    structureId: `left-ventricle`,
    color: `#cf5049`,
    make: (e) => ellipsoid([0.05, 1.205, 0.042], [0.031, 0.052, 0.031], [0, 0, 0.7], e),
  },
  {
    name: `aorta`,
    structureId: `aorta`,
    color: COLORS.artery,
    make: (e) =>
      tubeAlong(
        [
          [0.022, 1.25, 0.048],
          [0.012, 1.31, 0.05],
          [0.006, 1.352, 0.028],
          [0.02, 1.364, -0.01],
          [0.03, 1.33, -0.045],
          [0.026, 1.2, -0.05],
          [0.015, 1, -0.045],
          [0.008, 0.9, -0.033],
        ],
        0.0105,
        e,
        80,
      ),
  },
  {
    name: `pulmonary_trunk`,
    structureId: `pulmonary-trunk`,
    color: `#4a6fc4`,
    make: (e) =>
      tubeAlong(
        [
          [0.004, 1.24, 0.088],
          [0.012, 1.3, 0.078],
          [0.016, 1.328, 0.05],
        ],
        0.0095,
        e,
        24,
      ),
  },
  ...SIDES.map(({ s: e, tag: t }) => ({
    name: `pulmonary_veins_${t}`,
    structureId: `pulmonary-veins`,
    color: `#c94a43`,
    make: (t) =>
      mergeSmooth([
        tubeAlong(
          e === 1
            ? [
                [0.085, 1.275, -0.01],
                [0.05, 1.268, 0.002],
                [0.03, 1.266, 0.008],
              ]
            : [
                [-0.075, 1.275, -0.01],
                [-0.02, 1.264, -0.004],
                [0.012, 1.264, 0.006],
              ],
          0.0045,
          t,
          16,
        ),
        tubeAlong(
          e === 1
            ? [
                [0.085, 1.255, -0.015],
                [0.05, 1.258, 0],
                [0.03, 1.26, 0.008],
              ]
            : [
                [-0.075, 1.255, -0.015],
                [-0.02, 1.258, -0.004],
                [0.012, 1.26, 0.006],
              ],
          0.0045,
          t,
          16,
        ),
      ]),
  })),
  {
    name: `superior_vena_cava`,
    structureId: `superior-vena-cava`,
    color: COLORS.vein,
    make: (e) =>
      tubeAlong(
        [
          [-0.036, 1.39, 0.024],
          [-0.036, 1.31, 0.04],
          [-0.031, 1.275, 0.045],
        ],
        0.0095,
        e,
        24,
      ),
  },
  {
    name: `inferior_vena_cava`,
    structureId: `inferior-vena-cava`,
    color: COLORS.vein,
    make: (e) =>
      tubeAlong(
        [
          [-0.024, 0.9, -0.03],
          [-0.03, 1.05, -0.022],
          [-0.031, 1.19, 0.018],
          [-0.031, 1.232, 0.04],
        ],
        0.0105,
        e,
        48,
      ),
  },
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `common_carotid_${t}`,
      structureId: `common-carotid-artery`,
      color: COLORS.artery,
      make: (t) =>
        tubeAlong(
          e === 1
            ? [
                [0.012, 1.365, 0.02],
                [0.027, 1.45, 0.02],
                [0.03, 1.56, 0.02],
              ]
            : [
                [-0.008, 1.36, 0.03],
                [-0.028, 1.45, 0.02],
                [-0.031, 1.56, 0.02],
              ],
          0.0055,
          t,
          24,
        ),
    },
    {
      name: `brachial_artery_${t}`,
      structureId: `brachial-artery`,
      color: COLORS.artery,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.2, 1.33, 0.008],
            [e * 0.235, 1.2, 0.022],
            [e * 0.262, 1.115, 0.026],
          ],
          0.0045,
          t,
          24,
        ),
    },
    {
      name: `common_iliac_${t}`,
      structureId: `common-iliac-artery`,
      color: COLORS.artery,
      make: (t) =>
        tubeAlong(
          [
            [0.008, 0.9, -0.033],
            [e * 0.045, 0.855, -0.018],
            [e * 0.07, 0.825, 0.008],
          ],
          0.0065,
          t,
          20,
        ),
    },
    {
      name: `femoral_artery_${t}`,
      structureId: `femoral-artery`,
      color: COLORS.artery,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.078, 0.818, 0.03],
            [e * 0.094, 0.7, 0.036],
            [e * 0.096, 0.58, 0.002],
            [e * 0.1, 0.52, -0.02],
          ],
          0.0058,
          t,
          32,
        ),
    },
  ]),
  {
    name: `cerebrum`,
    structureId: `cerebrum`,
    color: COLORS.brain,
    make: (e) => ellipsoid([0, 1.668, -0.004], [0.074, 0.068, 0.087], [0, 0, 0], e),
  },
  {
    name: `cerebellum`,
    structureId: `cerebellum`,
    color: `#c98e8b`,
    make: (e) => ellipsoid([0, 1.6, -0.058], [0.048, 0.028, 0.034], [0, 0, 0], e),
  },
  {
    name: `brainstem`,
    structureId: `brainstem`,
    color: `#c7928c`,
    make: (e) => capsuleBetween([0, 1.625, -0.02], [0, 1.545, -0.036], 0.014, e),
  },
  {
    name: `spinal_cord`,
    structureId: `spinal-cord`,
    color: COLORS.nerve,
    make: spinalCordGeometry,
  },
  ...SIDES.map(({ s: e, tag: t }) => ({
    name: `sciatic_nerve_${t}`,
    structureId: `sciatic-nerve`,
    color: COLORS.nerve,
    make: (t) =>
      tubeAlong(
        [
          [e * 0.055, 0.84, -0.07],
          [e * 0.085, 0.8, -0.062],
          [e * 0.1, 0.7, -0.045],
          [e * 0.1, 0.55, -0.036],
        ],
        0.0058,
        t,
        32,
      ),
  })),
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `brachial_plexus_${t}`,
      structureId: `brachial-plexus`,
      color: COLORS.nerve,
      make: (t) =>
        mergeSmooth(
          [1.47, 1.445, 1.42, 1.4].map((n) =>
            tubeAlong(
              [
                [e * 0.018, n, -0.045],
                [e * 0.08, 1.43, -0.022],
                [e * 0.13, 1.4, -0.006],
                [e * 0.172, 1.36, 0],
              ],
              0.0035,
              t * 0.7,
              20,
            ),
          ),
        ),
    },
    {
      name: `axillary_nerve_${t}`,
      structureId: `axillary-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.172, 1.36, 0],
            [e * 0.19, 1.335, -0.03],
            [e * 0.218, 1.335, -0.012],
          ],
          0.0035,
          t,
          16,
        ),
    },
    {
      name: `radial_nerve_${t}`,
      structureId: `radial-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.172, 1.36, 0],
            [e * 0.2, 1.3, -0.03],
            [e * 0.24, 1.22, -0.026],
            [e * 0.272, 1.13, 0],
            [e * 0.3, 1, 0.016],
          ],
          0.0038,
          t,
          32,
        ),
    },
    {
      name: `musculocutaneous_nerve_${t}`,
      structureId: `musculocutaneous-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.172, 1.36, 0],
            [e * 0.21, 1.28, 0.016],
            [e * 0.25, 1.17, 0.022],
          ],
          0.0033,
          t,
          20,
        ),
    },
    {
      name: `phrenic_nerve_${t}`,
      structureId: `phrenic-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.034, 1.48, 0.015],
            [e * 0.042, 1.38, 0.03],
            [e * (e === 1 ? 0.07 : 0.05), 1.25, 0.065],
            [e * 0.07, 1.1, 0.03],
          ],
          0.0032,
          t,
          28,
        ),
    },
    {
      name: `vagus_nerve_${t}`,
      structureId: `vagus-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.026, 1.56, 0],
            [e * 0.022, 1.4, 0],
            [e * 0.03, 1.25, -0.032],
            [e * 0.02, 1.08, -0.02],
          ],
          0.0032,
          t,
          28,
        ),
    },
    {
      name: `femoral_nerve_${t}`,
      structureId: `femoral-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.07, 0.87, -0.01],
            [e * 0.093, 0.82, 0.032],
            [e * 0.108, 0.72, 0.042],
          ],
          0.004,
          t,
          20,
        ),
    },
    {
      name: `tibial_nerve_${t}`,
      structureId: `tibial-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.1, 0.55, -0.036],
            [e * 0.1, 0.45, -0.042],
            [e * 0.097, 0.2, -0.03],
          ],
          0.0045,
          t,
          24,
        ),
    },
    {
      name: `common_fibular_nerve_${t}`,
      structureId: `common-fibular-nerve`,
      color: COLORS.nerve,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.1, 0.55, -0.036],
            [e * 0.12, 0.48, -0.03],
            [e * 0.132, 0.44, -0.01],
            [e * 0.126, 0.38, 0.012],
          ],
          0.0038,
          t,
          24,
        ),
    },
  ]),
  {
    name: `tricuspid_valve`,
    structureId: `tricuspid-valve`,
    color: `#f1d9a8`,
    make: (e) => {
      let t = new CylinderGeometry(0.011, 0.011, 0.003, Math.round(e * 20));
      t.rotateZ(0.9);
      t.translate(-0.012, 1.236, 0.058);
      return t;
    },
  },
  {
    name: `pulmonary_valve`,
    structureId: `pulmonary-valve`,
    color: `#f1d9a8`,
    make: (e) => {
      let t = new CylinderGeometry(0.009, 0.009, 0.003, Math.round(e * 20));
      t.translate(0.005, 1.246, 0.088);
      return t;
    },
  },
  {
    name: `mitral_valve`,
    structureId: `mitral-valve`,
    color: `#f1d9a8`,
    make: (e) => {
      let t = new CylinderGeometry(0.011, 0.011, 0.003, Math.round(e * 20));
      t.rotateZ(-0.6);
      t.translate(0.037, 1.242, 0.03);
      return t;
    },
  },
  {
    name: `aortic_valve`,
    structureId: `aortic-valve`,
    color: `#f1d9a8`,
    make: (e) => {
      let t = new CylinderGeometry(0.009, 0.009, 0.003, Math.round(e * 20));
      t.translate(0.022, 1.249, 0.048);
      return t;
    },
  },
  {
    name: `coronary_arteries`,
    structureId: `coronary-arteries`,
    color: `#e0443f`,
    make: (e) =>
      mergeSmooth([
        tubeAlong(
          [
            [0.02, 1.252, 0.062],
            [0.03, 1.22, 0.085],
            [0.05, 1.17, 0.07],
          ],
          0.0028,
          e,
          20,
        ),
        tubeAlong(
          [
            [0.02, 1.252, 0.062],
            [0.05, 1.245, 0.04],
            [0.07, 1.215, 0.02],
          ],
          0.0025,
          e,
          20,
        ),
        tubeAlong(
          [
            [0.014, 1.252, 0.062],
            [-0.03, 1.232, 0.07],
            [-0.045, 1.2, 0.04],
          ],
          0.0028,
          e,
          20,
        ),
      ]),
  },
  ...SIDES.map(({ s: e, tag: t }) => ({
    name: `pleura_${t}`,
    structureId: `pleura`,
    color: `#9fc3e6`,
    baseOpacity: 0.4,
    doubleSide: true,
    make: (t) =>
      e === 1
        ? ellipsoid([0.094, 1.27, -0.005], [0.07, 0.135, 0.088], [0, 0, -0.05], t)
        : ellipsoid([-0.088, 1.268, 0], [0.079, 0.14, 0.093], [0, 0, 0.05], t),
  })),
  {
    name: `nasal_cavity`,
    structureId: `nasal-cavity`,
    color: `#e3a5a5`,
    make: (e) => ellipsoid([0, 1.635, 0.07], [0.016, 0.02, 0.03], [0, 0, 0], e),
  },
  {
    name: `olfactory_epithelium`,
    structureId: `olfactory-epithelium`,
    color: `#c9b04a`,
    make: (e) => ellipsoid([0, 1.657, 0.066], [0.011, 0.003, 0.017], [0, 0, 0], e),
  },
  {
    name: `oral_cavity`,
    structureId: `oral-cavity`,
    color: `#c97b7b`,
    make: (e) => ellipsoid([0, 1.586, 0.058], [0.03, 0.01, 0.03], [0, 0, 0], e),
  },
  {
    name: `tongue_taste_buds`,
    structureId: `taste-buds`,
    color: `#d98a8a`,
    make: (e) => ellipsoid([0, 1.576, 0.055], [0.02, 0.006, 0.027], [0, 0, 0], e),
  },
  {
    name: `pharynx`,
    structureId: `pharynx`,
    color: `#d49a8a`,
    make: (e) =>
      tubeAlong(
        [
          [0, 1.625, 0.022],
          [0, 1.55, 0.01],
          [0, 1.48, 0.002],
        ],
        0.012,
        e,
        20,
      ),
  },
  {
    name: `pituitary_gland`,
    structureId: `pituitary-gland`,
    color: `#8fbf6a`,
    make: (e) => ellipsoid([0, 1.602, 0.004], [0.006, 0.005, 0.006], [0, 0, 0], e),
  },
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `parathyroid_${t}`,
      structureId: `parathyroid-glands`,
      color: `#c7d96a`,
      make: (t) =>
        mergeSmooth([
          ellipsoid([e * 0.021, 1.482, 0.026], [0.0035, 0.0035, 0.0035], [0, 0, 0], t),
          ellipsoid([e * 0.021, 1.458, 0.026], [0.0035, 0.0035, 0.0035], [0, 0, 0], t),
        ]),
    },
    {
      name: `palatine_tonsil_${t}`,
      structureId: `palatine-tonsils`,
      color: `#b0739a`,
      make: (t) => ellipsoid([e * 0.016, 1.565, 0.03], [0.004, 0.007, 0.004], [0, 0, 0], t),
    },
    {
      name: `lymph_nodes_${t}`,
      structureId: `lymph-nodes`,
      color: `#7fb3d5`,
      make: (t) =>
        mergeSmooth(
          [
            [e * 0.042, 1.5, 0.012],
            [e * 0.048, 1.47, 0],
            [e * 0.15, 1.33, 0],
            [e * 0.14, 1.31, 0.02],
            [e * 0.072, 0.81, 0.05],
            [e * 0.085, 0.8, 0.045],
          ].map((e) => ellipsoid(e, [0.0065, 0.005, 0.005], [0, 0, 0], t)),
        ),
    },
    {
      name: `ear_${t}`,
      structureId: `ear`,
      color: `#c9a07a`,
      make: (t) => ellipsoid([e * 0.097, 1.64, -0.005], [0.01, 0.026, 0.018], [0, 0, 0], t),
    },
    {
      name: `ovary_${t}`,
      structureId: `ovary`,
      color: `#c77fa3`,
      make: (t) => ellipsoid([e * 0.045, 0.785, -0.005], [0.008, 0.006, 0.006], [0, 0, 0], t),
    },
    {
      name: `testis_${t}`,
      structureId: `testis`,
      color: `#eec3bd`,
      make: (t) =>
        ellipsoid([e * 0.021, e === 1 ? 0.652 : 0.66, 0.064], [0.0115, 0.019, 0.0105], [-0.22, 0, e * 0.18], t * 1.3),
    },
    {
      name: `epididymis_${t}`,
      structureId: `epididymis`,
      color: `#b9776a`,
      make: (t) => {
        let n = e === 1 ? 0.652 : 0.66;
        return mergeSmooth([
          ellipsoid([e * 0.026, n + 0.017, 0.06], [0.0062, 0.0055, 0.0058], [0, 0, 0], t),
          tubeAlong(
            [
              [e * 0.027, n + 0.014, 0.057],
              [e * 0.03, n + 0.002, 0.054],
              [e * 0.028, n - 0.011, 0.055],
              [e * 0.024, n - 0.018, 0.058],
            ],
            0.0034,
            t,
            24,
          ),
        ]);
      },
    },
    {
      name: `spermatic_cord_${t}`,
      structureId: `spermatic-cord`,
      color: `#d6b28c`,
      make: (t) => {
        let n = e === 1 ? 0.652 : 0.66;
        return tubeAlong(
          [
            [e * 0.022, n - 0.017, 0.056],
            [e * 0.031, n - 0.004, 0.052],
            [e * 0.027, n + 0.024, 0.056],
            [e * 0.026, 0.705, 0.062],
            [e * 0.034, 0.735, 0.066],
            [e * 0.052, 0.758, 0.064],
          ],
          0.0032,
          t,
          40,
        );
      },
    },
  ]),
  {
    name: `scrotum`,
    structureId: `scrotum`,
    color: `#c79a86`,
    baseOpacity: 0.3,
    doubleSide: true,
    make: (e) =>
      mergeSmooth([
        ellipsoid([-0.019, 0.657, 0.063], [0.024, 0.031, 0.022], [0, 0, -0.12], e),
        ellipsoid([0.019, 0.65, 0.063], [0.024, 0.031, 0.022], [0, 0, 0.12], e),
      ]),
  },
  {
    name: `thymus`,
    structureId: `thymus`,
    color: `#9ab8d6`,
    make: (e) => ellipsoid([0, 1.38, 0.088], [0.022, 0.035, 0.01], [0, 0, 0], e),
  },
  {
    name: `uterus`,
    structureId: `uterus`,
    color: `#b8608a`,
    make: (e) => ellipsoid([0, 0.775, 0.008], [0.02, 0.024, 0.014], [0.3, 0, 0], e),
  },
  {
    name: `urethra`,
    structureId: `urethra`,
    color: `#d9b38a`,
    make: (e) =>
      tubeAlong(
        [
          [0, 0.728, 0.04],
          [0, 0.69, 0.046],
          [0, 0.66, 0.052],
        ],
        0.003,
        e,
        12,
      ),
  },
  {
    name: `alveoli_cluster`,
    structureId: `alveoli`,
    color: `#f0a8a8`,
    fixedOpacity: true,
    make: (e) => {
      let t = [
        tubeAlong(
          [
            [-0.42, 1.42, 0],
            [-0.42, 1.36, 0],
            [-0.43, 1.32, 0.005],
          ],
          0.005,
          e,
          12,
        ),
      ];
      let n = 0.011;
      for (let r = 0; r < 14; r++) {
        let i = r * 2.39996;
        let a = 1.3 - (r / 14) * 0.05;
        let o = 0.016 + Math.sin(r) * 0.006;
        t.push(ellipsoid([-0.43 + o * Math.cos(i), a, o * Math.sin(i)], [n, n, n], [0, 0, 0], e * 0.6));
      }
      return mergeSmooth(t);
    },
  },
  {
    name: `alveoli_in_lungs`,
    structureId: `alveoli`,
    color: `#f0a8a8`,
    baseOpacity: 0.5,
    make: (e) =>
      mergeSmooth(
        [
          [-0.1, 1.24, 0.02],
          [-0.07, 1.2, -0.02],
          [0.1, 1.23, 0],
          [0.11, 1.19, -0.02],
        ].map((t) => ellipsoid(t, [0.012, 0.012, 0.012], [0, 0, 0], e * 0.6)),
      ),
  },
  {
    name: `skin_block_epidermis`,
    structureId: `epidermis`,
    color: `#e2b293`,
    fixedOpacity: true,
    make: () => {
      let e = new BoxGeometry(0.07, 0.006, 0.07);
      e.translate(0.42, 1.335, 0);
      return e;
    },
  },
  {
    name: `skin_block_dermis`,
    structureId: `dermis`,
    color: `#d4878a`,
    fixedOpacity: true,
    make: () => {
      let e = new BoxGeometry(0.07, 0.022, 0.07);
      e.translate(0.42, 1.321, 0);
      return e;
    },
  },
  {
    name: `skin_block_hypodermis`,
    structureId: `hypodermis`,
    color: `#f0d98c`,
    fixedOpacity: true,
    make: () => {
      let e = new BoxGeometry(0.07, 0.03, 0.07);
      e.translate(0.42, 1.295, 0);
      return e;
    },
  },
  {
    name: `skin_block_appendages`,
    structureId: `skin-appendages`,
    color: `#5a3d2a`,
    fixedOpacity: true,
    make: (e) =>
      mergeSmooth([
        (() => {
          let e = new CylinderGeometry(0.0018, 0.0025, 0.05, 8);
          e.translate(0.405, 1.322, 0.01);
          return e;
        })(),
        ellipsoid([0.43, 1.3, -0.015], [0.005, 0.004, 0.005], [0, 0, 0], e),
        ellipsoid([0.41, 1.312, 0.012], [0.004, 0.003, 0.004], [0, 0, 0], e),
      ]),
  },
  {
    name: `larynx`,
    structureId: `larynx`,
    color: `#d8b4a0`,
    make: (e) => {
      let t = new CylinderGeometry(0.019, 0.015, 0.05, Math.round(e * 16));
      t.translate(0, 1.5, 0.036);
      return t;
    },
  },
  {
    name: `trachea`,
    structureId: `trachea`,
    color: `#e0c2b0`,
    make: (e) =>
      tubeAlong(
        [
          [0, 1.476, 0.032],
          [0, 1.4, 0.026],
          [0, 1.332, 0.012],
        ],
        0.0105,
        e,
        24,
      ),
  },
  {
    name: `right_main_bronchus`,
    structureId: `right-main-bronchus`,
    color: `#e0c2b0`,
    make: (e) =>
      tubeAlong(
        [
          [0, 1.334, 0.012],
          [-0.022, 1.31, 0.008],
          [-0.036, 1.29, 0.004],
        ],
        0.0085,
        e,
        16,
      ),
  },
  {
    name: `left_main_bronchus`,
    structureId: `left-main-bronchus`,
    color: `#e0c2b0`,
    make: (e) =>
      tubeAlong(
        [
          [0, 1.334, 0.012],
          [0.028, 1.322, 0.006],
          [0.054, 1.308, 0],
        ],
        0.0072,
        e,
        16,
      ),
  },
  {
    name: `right_lung`,
    structureId: `right-lung`,
    color: `#e3a5a5`,
    baseOpacity: 0.82,
    make: (e) => ellipsoid([-0.088, 1.268, 0], [0.072, 0.13, 0.085], [0, 0, 0.05], e),
  },
  {
    name: `left_lung`,
    structureId: `left-lung`,
    color: `#e3a5a5`,
    baseOpacity: 0.82,
    make: (e) => ellipsoid([0.094, 1.27, -0.005], [0.063, 0.125, 0.08], [0, 0, -0.05], e),
  },
  {
    name: `oesophagus`,
    structureId: `oesophagus`,
    color: `#c98a6b`,
    make: (e) =>
      tubeAlong(
        [
          [0, 1.47, 0],
          [0, 1.3, -0.026],
          [0.01, 1.15, -0.03],
          [0.03, 1.07, -0.002],
          [0.05, 1.045, 0.018],
        ],
        0.0075,
        e,
        48,
      ),
  },
  {
    name: `stomach`,
    structureId: `stomach`,
    color: `#d58f7a`,
    make: (e) =>
      tubeAlong(
        [
          [0.05, 1.045, 0.02],
          [0.085, 1.04, 0.03],
          [0.096, 0.99, 0.05],
          [0.062, 0.952, 0.06],
          [0.016, 0.962, 0.056],
        ],
        0.027,
        e,
        40,
      ),
  },
  {
    name: `liver`,
    structureId: `liver`,
    color: `#7a2f2a`,
    make: (e) => ellipsoid([-0.058, 1.02, 0.02], [0.112, 0.054, 0.08], [0, 0, -0.22], e),
  },
  {
    name: `gallbladder`,
    structureId: `gallbladder`,
    color: `#4f8a3c`,
    make: (e) => ellipsoid([-0.05, 0.972, 0.078], [0.012, 0.022, 0.012], [0.3, 0, 0], e),
  },
  {
    name: `pancreas`,
    structureId: `pancreas`,
    color: `#e3b07a`,
    make: (e) =>
      tubeAlong(
        [
          [-0.03, 0.94, 0],
          [0.03, 0.952, -0.01],
          [0.092, 0.972, -0.022],
        ],
        0.012,
        e,
        24,
      ),
  },
  {
    name: `small_intestine`,
    structureId: `small-intestine`,
    color: `#e0a088`,
    make: coilGeometry,
  },
  {
    name: `large_intestine`,
    structureId: `large-intestine`,
    color: `#c98b6b`,
    make: (e) =>
      tubeAlong(
        [
          [-0.088, 0.82, 0.03],
          [-0.1, 0.93, 0.03],
          [-0.088, 0.968, 0.05],
          [0, 0.925, 0.08],
          [0.1, 0.975, 0.04],
          [0.112, 0.86, 0.03],
          [0.065, 0.8, 0.03],
          [0.022, 0.792, 0.002],
        ],
        0.017,
        e,
        90,
      ),
  },
  {
    name: `rectum`,
    structureId: `rectum`,
    color: `#b97a5d`,
    make: (e) =>
      tubeAlong(
        [
          [0.022, 0.792, 0.002],
          [0.006, 0.762, -0.03],
          [0, 0.722, -0.038],
        ],
        0.015,
        e,
        20,
      ),
  },
  ...SIDES.flatMap(({ s: e, tag: t }) => [
    {
      name: `kidney_${t}`,
      structureId: `kidney`,
      color: `#8d3b2f`,
      make: (t) => ellipsoid([e * 0.066, e === 1 ? 0.97 : 0.955, -0.062], [0.025, 0.045, 0.018], [0, 0, e * 0.15], t),
    },
    {
      name: `adrenal_gland_${t}`,
      structureId: `adrenal-gland`,
      color: `#c99a3a`,
      make: (t) => ellipsoid([e * 0.06, e === 1 ? 1.018 : 1.003, -0.06], [0.015, 0.01, 0.01], [0, 0, 0], t),
    },
    {
      name: `ureter_${t}`,
      structureId: `ureter`,
      color: `#d9b38a`,
      make: (t) =>
        tubeAlong(
          [
            [e * 0.055, e === 1 ? 0.945 : 0.93, -0.058],
            [e * 0.05, 0.87, -0.05],
            [e * 0.045, 0.8, -0.02],
            [e * 0.022, 0.762, 0.022],
          ],
          0.0035,
          t,
          32,
        ),
    },
    {
      name: `eye_${t}`,
      structureId: `eye`,
      color: `#b9c4cf`,
      make: (t) => ellipsoid([e * 0.032, 1.652, 0.074], [0.013, 0.013, 0.013], [0, 0, 0], t),
    },
  ]),
  {
    name: `urinary_bladder`,
    structureId: `urinary-bladder`,
    color: `#d9b38a`,
    make: (e) => ellipsoid([0, 0.755, 0.04], [0.035, 0.028, 0.03], [0, 0, 0], e),
  },
  {
    name: `thyroid_gland`,
    structureId: `thyroid-gland`,
    color: `#a8c66c`,
    make: (e) =>
      mergeSmooth([
        ellipsoid([0.019, 1.47, 0.036], [0.01, 0.021, 0.01], [0, 0, 0], e),
        ellipsoid([-0.019, 1.47, 0.036], [0.01, 0.021, 0.01], [0, 0, 0], e),
        ellipsoid([0, 1.462, 0.043], [0.016, 0.006, 0.005], [0, 0, 0], e),
      ]),
  },
  {
    name: `spleen`,
    structureId: `spleen`,
    color: `#6b2b4a`,
    make: (e) => ellipsoid([0.122, 1.02, -0.04], [0.024, 0.045, 0.02], [0, 0, -0.3], e),
  },
];
export const PART_TO_STRUCTURE = Object.fromEntries(SCHEMATIC_PARTS.map((p) => [p.name, p.structureId]));
