# Anatomy model audit report (as of 4 November 2026)

Each row: original mesh, replacement, source/licence, test. "Tested" means rendered and inspected in a local copy of the built app (the live site is not reachable from the build sandbox); selection, isolation, search and camera were checked on the touched structures.

| Structure | Original | Replacement | Source / licence | Result |
|---|---|---|---|---|
| Uterus, tubes, ovaries, fimbriae | generated shapes | VH Female meshes | HuBMAP, CC BY 4.0 | tested |
| Urinary bladder, rectum | generated | Z-Anatomy bladder, BodyParts3D rectum | CC BY-SA 4.0 / 2.1 JP | tested; old meshes hidden |
| Larynx cartilages, thyroid, trachea | generated | Z-Anatomy | CC BY-SA 4.0 | tested; duplicate trachea fixed |
| Spinal cord | generated, outside canal | VH Male cord, fitted into canal | HuBMAP, CC BY 4.0 | tested by ray-parity |
| Heart ventricles, atria, valves, papillary muscles | balloon-like left ventricle | VH Male heart | HuBMAP, CC BY 4.0 | tested; pulmonary vein stubs not coaxial |
| Joints and ligaments (38 structures) | missing | Z-Anatomy, fitted to app bones | CC BY-SA 4.0 | knee, shoulder rendered and checked; foot/hip checked numerically |

## Open gaps (no replacement imported)
- Vulva, labia, clitoris, vaginal and urethral openings, scrotum, spermatic cords, vas deferens: no licensed mesh found.
- Pharynx, oral and nasal cavities, both urethras, skin and hair shells, third molars, alveoli: still generated.
- Arm, hand, spine, rib, jaw and laryngeal ligaments: not aligned to the app skeleton, so not shipped.
- Bursae, lymph node groups, fascia: not yet imported.
- All new records are pending expert review.
