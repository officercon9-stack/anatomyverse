# Anatomy model audit report (as of 4 November 2026)

Each row: original mesh, replacement, source/licence, test. "Tested" means rendered and inspected in a local copy of the built app (the live site is not reachable from the build sandbox); selection, isolation, search and camera were checked on the touched structures.

| Structure | Original | Replacement | Source / licence | Result |
|---|---|---|---|---|
| Uterus, tubes, ovaries, fimbriae | generated shapes | VH Female meshes | HuBMAP, CC BY 4.0 | tested |
| Urinary bladder, rectum | generated | Z-Anatomy bladder, BodyParts3D rectum | CC BY-SA 4.0 / 2.1 JP | tested; old meshes hidden |
| Larynx cartilages, thyroid, trachea | generated | Z-Anatomy | CC BY-SA 4.0 | tested; duplicate trachea fixed |
| Spinal cord | generated, outside canal | VH Male cord, fitted into canal | HuBMAP, CC BY 4.0 | tested by ray-parity |
| Heart ventricles, atria, valves, papillary muscles | balloon-like left ventricle | VH Male heart | HuBMAP, CC BY 4.0 | tested; pulmonary vein stubs not coaxial |
| Arm and hand joints (24 structures) | missing | Z-Anatomy, per-bone ICP fit, skinned | CC BY-SA 4.0 | elbow, wrist rendered; 1-3 mm median to bone |
| Joints and ligaments (38 structures) | missing | Z-Anatomy, fitted to app bones | CC BY-SA 4.0 | knee, shoulder rendered and checked; foot/hip checked numerically |

## Open gaps (no replacement imported)
- Vulva, labia, clitoris, vaginal and urethral openings, scrotum, spermatic cords, vas deferens: no licensed mesh found.
- Pharynx, oral and nasal cavities, both urethras, skin and hair shells, third molars, alveoli: still generated.
- Spine, rib, jaw and laryngeal ligaments: app bones there are procedural or unaligned, not shipped.
- Arm and hand: 24 structures integrated (see THIRD_PARTY_ASSETS.md); six small wrist/elbow ligaments missing (source meshes are blocks only).
- Fascia: not yet imported. Lymph nodes: 103 groups integrated as Z-Anatomy node ovoids (schematic counts). Bursae: 33 integrated as simplified ellipsoids.
- All new records are pending expert review.

## Duplication audit (4 November 2026)
Checked: record ids, names, Latin names and synonyms across all 1,500 records; structures mapped by more than one asset; and, in the running app with every layer on, all 1,283 visible meshes for near-identical overlapping shapes.
Fixed:
- Renal pelvis had two complete records (base, left, right); the second set was removed.
- Left lacrimal canaliculus was drawn twice (eye model and eye-detail model, 97% overlap); removed from the eye-detail model.
- Paratracheal nodes were two records with one Latin name; merged into one record covering both meshes.
Reviewed and kept (distinct structures that sit together): retina on vitreous, arachnoid on dura, capsule and collateral ligaments of the same finger joints, the three prepatellar bursae (subcutaneous, subfascial, subtendinous: three separate terminology entries), muscle belly with its tendon, generic tooth types with the individual teeth under them.
Earlier fixes still in place: old bladder, rectum, trachea, larynx and thyroid hidden where the Z-Anatomy versions replace them.
Not detectable by this check: duplicates of procedural schematic parts that have no mesh file; the id/overlay check found no joints, bursa or lymph structure mapped by another asset.

## Mobile weight fix (lod26)

- The single `zanatomy-joints` asset (3.19 MB full / 2.39 MB lite, ~343 meshes) is replaced by five on-demand region assets: `zanatomy-joints-lower`, `zanatomy-joints-upper`, `zanatomy-bursae`, `zanatomy-lymph-upper`, `zanatomy-lymph-lower` (0.36–0.65 MB each in the lite variant). No content was removed; the meshes were partitioned by region.
- None loads by default. Selecting a structure (or ticking joints / bursae / lymph nodes in the Lab menu) loads only the file(s) it needs.
- Lite copies of the heart, abdominal organs and spinal cord were re-simplified (default triangles about 547k → 473k).
- Measured in headless Chromium at 390 px with 4x CPU throttling: default scene 888 meshes / 473k triangles, ready in ~6 s. This is an emulation, not a real phone; the original failure on the user's device has not been reproduced.

## Clinical review status (4 November 2026)

On 4 November 2026 the app owner stated that all structure records, questions and lessons were reviewed by Dr. Aqsa Hameed Phulpoto, MBBS and Dr. Farhan Ali, MBBS. The records' `reviewStatus` was changed from `pending-expert-review` to `reviewed` and the on-screen badge now names both reviewers. This change records the owner's attestation; the review itself was not performed or observed by the tooling. Note that this is review of the written content; the geometric alignment of the 3D meshes has been checked by software tests, not by an anatomist's validation. If that distinction matters to the reviewers, record it separately.

## Male genital proportions (lod27)
The Z-Anatomy testes and epididymides in `zanatomy-organs2` were about 2.1 × 2.9 × 2.3 cm (roughly 7 mL), well below adult size. They are now scaled 1.4× about their own position and moved down 0.75 cm so they sit inside the scrotum (approx. 3 × 4 × 3.2 cm). This is a node-transform change only; the meshes are unchanged and still CC BY-SA 4.0 Z-Anatomy. The scrotum and all female external genitalia (vulva, labia, clitoris) remain simple procedural shapes: no licensed mesh exists for them in Z-Anatomy, BodyParts3D or HuBMAP. They are labelled schematic.

## Label management (5 November 2026)
Cause of the label pile-up: with the Labels switch on (the default), choosing a body system turned every top-level structure of that system into a permanent label (274 for the Muscular system), each placed at one point with no collision handling, and left and right copies doubled the names. No name or record was lost. `smart-labels.js` replaces that layer: Clean shows only the selected structure, Smart places collision-free labels in edge columns with leader lines (count set by screen size and zoom, the rest grouped into region chips such as "Forearm muscles (32)"), and Index lists all 1,750 records by region (448 head and neck, 444 shoulder and upper limb, 103 thorax, 89 abdomen, 6 back, 125 pelvis, 529 lower limb, 6 whole body). Tested in a headless browser at 390 x 844 and 1280 x 720; not tested on a physical phone.
