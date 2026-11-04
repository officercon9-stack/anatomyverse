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
