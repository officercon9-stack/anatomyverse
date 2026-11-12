# Third-party assets, licences and attribution

Everything 3D Anatomy ships that was not written for it, what each licence
requires, and **where that requirement has to be satisfied**. Generated from
the asset manifest; re-check it whenever models are added.

Short version: **you can sell this app.** Share-alike restricts exclusivity of
the *model files*, not the sale of the software. What you cannot do is ship the
derived models without credit, or claim them as exclusively yours.

## 1. BodyParts3D — CC BY-SA 2.1 Japan

© The Database Center for Life Science (DBCLS), Japan.
Deed: https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en

Our files are **derivative works**: the source STL meshes were decimated,
converted to glTF, re-centred and re-oriented.

| asset id | name | licence as recorded |
|---|---|---|
| `anatomyverse-limbs` | Limb muscles and bones (BodyParts3D) | CC BY-SA 2.1 Japan — BodyParts3D |
| `anatomyverse-organs` | Detailed organs, vessels and trunk bones (BodyParts3D) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-brain-csf` | Brain CSF spaces (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by 3D Anatomy) |
| `bodyparts3d-brain-fossae` | Cranial fossae (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by 3D Anatomy) |
| `bodyparts3d-brain-in-body` | Detailed brain (inside full-body skull) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-brain-mening` | Meninges (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by 3D Anatomy) |
| `bodyparts3d-brain-skull` | Brain and skull close-up (BodyParts3D) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-brain-tracts` | Brain and spinal cord tracts (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by 3D Anatomy) |
| `bodyparts3d-brain-vessels` | Brain blood vessels (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by 3D Anatomy) |
| `bodyparts3d-lungs` | Lungs, airways and diaphragm (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-nose-ear` | Nose and ear close-up | CC BY-SA 2.1 Japan — BodyParts3D |

Required: credit DBCLS, name the licence, link the deed, state that changes were
made, and license the derived model files under the same licence.

## 2. Z-Anatomy — CC BY-SA 4.0 (assets)

Z-Anatomy, the libre 3D atlas of anatomy (G. Kervyn and contributors), itself
derived from BodyParts3D. Deed: https://creativecommons.org/licenses/by-sa/4.0/

| asset id | name | licence as recorded |
|---|---|---|
| `ethmoid-bone` | Eye close-up (Z-Anatomy) | CC BY-SA 4.0 — Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP) |
| `zanatomy-eye` | Eye close-up (Z-Anatomy) | CC BY-SA 4.0 — Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP) |
| `zanatomy-heart` | Heart close-up (Z-Anatomy) | CC BY-SA 4.0 — Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP) |
| `zanatomy-limbbones` | Limb and girdle bones (Z-Anatomy) | CC BY-SA 4.0 — Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP) |
| `zanatomy-skull` | Skull, jaws and teeth (Z-Anatomy) | CC BY-SA 4.0 — Z-Anatomy, derived from BodyParts3D (CC BY-SA 2.1 JP) |
| `zanatomy-ear` | Ear: auricle, ossicles, tympanic membrane, chorda tympani (+ original cochlea, vestibule, canals, VIII nerve branches) | Ossicles, tympanic membrane, chorda tympani: CC BY-SA 4.0 — Z-Anatomy. Auricle: CC BY-SA 2.1 JP — BodyParts3D, registered onto the Z-Anatomy temporal bone. Cochlea, vestibule, canals, nerve branches: original 3D Anatomy drawings |

**Licence status (checked 29 Oct 2026).** The official models repository
(`github.com/Z-Anatomy/Models-of-human-anatomy`) states: "All the code and
content shared by 'Z-Anatomy' is under Creative Commons Attribution-ShareAlike
4.0 International License", and credits BodyParts3D (CC BY-SA 2.1 Japan) as the
base. The Unity project repository we downloaded carries a GPL-3.0 `LICENSE`
file but no README statement about the models. We rely on the models
repository's explicit CC BY-SA 4.0 statement. Ask the maintainers to confirm in
writing (draft in `store/LICENCE_QUESTIONS.md`).

**Non-commercial reference models.** The same page lists reference models that
Z-Anatomy used and adapted, including *Anatomy of the Inner Ear* (University of
Dundee, **CC BY-NC-SA 4.0**) and *Kidney* (Lissie Cowley, **CC BY-NC 4.0**).
Non-commercial material cannot be used in a paid app. Because the provenance of
Z-Anatomy's individual inner-ear meshes is not stated, **we removed all
Z-Anatomy inner-ear meshes** (cochlea, vestibule and semicircular canals,
vestibulocochlear/cochlear/vestibular nerves) and replaced them with simplified
original drawings (`source/ear/mkinner.py`). No Z-Anatomy kidney is used (the `zanatomy-kidney.glb` overlay that was still being loaded was removed on 12 Nov 2026) (kidneys
come from BodyParts3D). Still taken from Z-Anatomy and awaiting the maintainers'
confirmation of origin: auditory ossicles, tympanic membrane, chorda tympani,
eyelid tarsal plates, zonular fibres, optic nerves, and the heart, skull and
limb-bone meshes. If they cannot confirm, replace or remove those parts.

## 3. Original 3D Anatomy work — MIT

Written for this project; no third-party obligation.

| asset id | name | licence as recorded |
|---|---|---|
| `anatomyverse-alveoli` | Alveoli close-up (gas exchange) | 3D Anatomy schematic model |
| `anatomyverse-diasupply` | Diaphragm blood and nerve supply (schematic) | 3D Anatomy schematic model |
| `anatomyverse-limbsupply` | Limb arteries, veins and nerves (schematic) | 3D Anatomy schematic model |
| `detailed-anatomy-placeholder` | Detailed anatomical model (not installed) | Requires a licensed asset — none is bundled |
| `sample-gltf-femur` | GLB pipeline sample — schematic femur & hip bone | Original work — MIT (exported from the schematic body) |

## 4. Text and terminology

- **OpenStax Anatomy & Physiology 2e** — CC BY 4.0. Attribution required where
  used. All 3D Anatomy educational text is original wording; OpenStax is cited
  as a verification reference.
- **Terminologia Anatomica, 2nd ed. (FIPAT, 2019)** — consulted for Latin terms
  only, no text reproduced. Individual Latin terms are not themselves
  copyrightable, but TA as a *compilation* is. Since `data/ta2.json` holds
  roughly 7,200 rows across 7 languages, confirm with a lawyer that this is a
  permitted use of terminology rather than reproduction of the compilation.
  This is the one item here with real legal exposure.

## 4b. Fonts

Inter (SIL Open Font License 1.1) and JetBrains Mono (SIL OFL 1.1), self-hosted from the `@fontsource` packages in `fonts/`; licence texts are in the same folder. No fonts are loaded from third parties.

## 5. Where attribution must appear

| where | status | note |
|---|---|---|
| In the app | **done** | `/legal/sources` lists every model with its credit, licence and deed links, links to the Z-Anatomy and BodyParts3D projects, and states the models were modified. A credit line ('3D models: Z-Anatomy and BodyParts3D, CC BY-SA, Credits and licences') sits on the 3D view and links to it. |
| Inside each model file | **done** | the credit is written into every third-party `.glb` (`asset.copyright`); `source/embed_credit.py` re-applies it. |
| Repository | **done** | this file. |
| Google Play listing | **to do** | Play requires third-party licence compliance. The in-app page satisfies it; link to it from the listing or surface it in app settings. |
| Model files redistributed on their own | **done** | the credit now travels inside each file. |

## 6. What share-alike does and does not stop

- **Allowed:** selling the app, charging subscriptions, closed-source app code,
  commercial and institutional licensing.
- **Required:** credit as above; derived model files stay under their original
  licence.
- **Not allowed:** claiming exclusive ownership of the derived models, or
  granting an acquirer exclusive rights to them. An acquirer's diligence will
  ask about this — the honest answer is that the *software and content* are
  yours and the *scan-derived meshes* are shared under CC BY-SA.

*Not legal advice. Have a lawyer confirm section 4 and section 6 before any sale
or paid release.*

## zanatomy-organs2.glb (added 1 November 2026)

| | |
|---|---|
| Source | Z-Anatomy, `Startup.blend` inside `Z-Anatomy.zip` |
| Repository | https://github.com/Z-Anatomy/models-of-human-anatomy (commit 22d77228) |
| Authors | Gauthier Kervyn (design, 3D, anatomy), Marcin Zielinski (script) |
| Licence | CC BY-SA 4.0, stated in the repository's `License.txt` |
| Upstream | Models derived from BodyParts3D, CC BY-SA 2.1 Japan |
| Commercial use | Permitted |
| Modification | Permitted |
| Attribution | Required: "Z-Anatomy — the libre 3D atlas of anatomy, CC BY-SA 4.0, derived from BodyParts3D (CC BY-SA 2.1 Japan)" |
| ShareAlike | **Yes.** Derivative works must be distributed under CC BY-SA 4.0. This applies to the exported mesh data, not to the app's own code. |
| Objects used | Tongue, Prostate, Testis.l, Testis.r, Epididymis.l, Epididymis.r |
| Modifications made | Selected 6 objects, applied modifiers, exported to glTF with Y-up, meshopt-compressed and quantized. No geometry was altered. |

## Femur parts (derived work)
The femur meshes in `anatomyverse-limbs.glb` / `zanatomy-limbbones.glb` (Z-Anatomy, CC BY-SA 4.0) are cut into nine named regions (head, neck, greater and lesser trochanter, body, medial and lateral condyle, medial epicondyle, patellar surface) by `source/femurparts.mjs`. The regions are approximate, assigned by position along the bone. The cut meshes remain under the same CC BY-SA 4.0 licence as the source. The older BodyParts3D femur nodes (`b_femur_*`) were removed because the Z-Anatomy femurs replace them.

## Individually named hand and foot bones
The BodyParts3D hand-bones and foot-bones meshes (CC BY-SA 2.1 Japan) are made of separate pieces, one per bone. They were split into 27 (hand) and 28 (foot) separately selectable bones per side and named; geometry is otherwise unchanged. See `source/handsplit.mjs` and `source/footsplit.mjs`.

## hubmap-female-repro.glb (added 4 November 2026)

| | |
|---|---|
| Source | HuBMAP CCF 3D Reference Object Library v1.2, Visible Human Female (NLM): `VH_F_Uterus`, `VH_F_Ovary_L/R`, `VH_F_Fallopian_Tube_L/R` |
| Repository | https://github.com/hubmapconsortium/ccf-releases |
| Licence | CC BY 4.0 |
| Commercial use | Permitted |
| Modification | Permitted |
| Attribution | Required: "HuBMAP CCF 3D Reference Object Library, Visible Human Female uterus, uterine tubes and ovaries, CC BY 4.0" |
| ShareAlike | No |
| Objects used | Body, fundus, cornua, lower segment, cervix and cervical os of the uterus; tubal isthmus, ampulla, infundibulum and fimbriae (both sides); both ovaries |
| Modifications made | Uniform scale 0.94 and translation to fit the app's pelvis, normals recomputed, meshopt-compressed and quantized (lite version simplified). The duplicate anterior/posterior wall shells were not used. Source: `tools/addfemale.mjs`. |

## Urinary bladder and rectum (added to zanatomy-organs2.glb, 4 November 2026)
- Urinary bladder: Z-Anatomy `Startup.blend`, object "Urinary bladder" (subdivision modifier applied), CC BY-SA 4.0, used in place.
- Rectum: BodyParts3D FMA14544 (CC BY-SA 2.1 Japan), converted (x, z, -y)/1000, welded, translated by (0, +0.0425, -0.1015) m to fit the Z-Anatomy pelvis, normals recomputed.
- The older generated bladder and rectum in `anatomyverse-organs.glb` are no longer drawn.

## Larynx, thyroid gland and trachea (added to zanatomy-organs2.glb, 4 November 2026)
Z-Anatomy `Startup.blend` (CC BY-SA 4.0): Thyroid cartilage, Cricoid cartilage, Epiglottis, Arytenoid cartilages (subdivision applied), Corniculate cartilages, Thyroid gland (mirror, solidify and subdivision applied; moved 12 mm down so it sits below the thyroid cartilage), Trachea. The generated larynx cylinder, trachea tube and three-ellipsoid thyroid are no longer drawn, nor are the older trachea pieces in the lung asset.

## hubmap-spinal-cord.glb (added 4 November 2026)
| | |
|---|---|
| Source | HuBMAP CCF 3D Reference Object Library v1.2, `VH_M_Spinal_Cord` (NLM Visible Human Male), 30 segment meshes |
| Repository | https://github.com/hubmapconsortium/ccf-releases |
| Licence | CC BY 4.0 (commercial use and modification permitted; attribution required; no ShareAlike) |
| Modifications made | Uniform scale 0.935, translation, and a height-dependent forward/back shift (`tools/addcord.mjs`) so the cord lies in the vertebral canal of the app's spine (checked by ray parity: almost no cord points lie inside bone). Normals recomputed, meshopt-compressed. |

## zanatomy-heart.glb: ventricles, atria, valves and papillary muscles replaced (4 November 2026)
The left and right ventricles, interventricular septum, both atria, the four valves and the papillary muscles now come from the HuBMAP CCF 3D Reference Library, Visible Human Male heart (`VH_M_Heart.glb`, CC BY 4.0, https://github.com/hubmapconsortium/ccf-releases), simplified to about 30% of the triangles and fitted to the existing Z-Anatomy great vessels by a similarity transform (scale 0.916) estimated from the valve and chamber centres (`tools/heartfit.mjs`, `tools/heartswap.mjs`). The Z-Anatomy coronary arteries, cardiac veins and great vessels (CC BY-SA 4.0) were kept and refitted to the new surface (radial offset mapping). The file therefore contains both CC BY-SA 4.0 and CC BY 4.0 material and is distributed under CC BY-SA 4.0.
Known limitation: the Visible Human atria carry their own short vein stumps; the Z-Anatomy pulmonary vein stubs are not exactly coaxial with them.

## Joints and ligaments (zanatomy-joints.glb)

- Source: Z-Anatomy (CC BY-SA 4.0), derived from BodyParts3D (CC BY-SA 2.1 Japan). 38 structures (75 meshes): menisci and knee ligaments, knee capsule and infrapatellar fat pad, acetabular labrum, obturator membrane, sacro-iliac and sacrotuberous ligaments, pubic disc, shoulder labrum/capsule/ligaments, AC and SC capsules, tibiofibular, ankle and foot ligaments and toe capsules.
- Fit: Z-Anatomy raw coordinates were mapped to the app skeleton with y' = 0.967y + 0.0581, z' = 1.067z + 0.0136 (fits the app tibia, fibula, patella, hip bone, scapula, clavicle, talus, calcaneus to within 1 mm) and x' = 1.067x + t, with t chosen per anchoring bone (pelvis/shoulder 0, tibia 0.024, tibiofibular 0.028, foot 0.037; negated on the right).
- Not included, because the app's bones for these regions are procedural and could not be aligned reliably: spinal and rib ligaments, jaw/hyoid/laryngeal ligaments, and the femoral-side hip ligaments and hip capsule.
- Records are marked pending-expert-review. Loaded on demand (layer "Show joints and ligaments" or by selecting one).

### Arm and hand joints (added 4 November 2026)
- 24 structures (elbow capsule, annular, radial and ulnar collateral ligaments of the elbow, wrist capsule and collaterals, radioscaphocapitate, ulnolunate, ulnotriquetral, scaphotrapeziotrapezoidal, dorsal/palmar carpal and carpometacarpal ligaments, MCP/PIP/DIP capsules and collaterals, deep transverse metacarpal ligament, and others) from Z-Anatomy, CC BY-SA 4.0.
- Alignment: each Z-Anatomy arm bone was matched to the corresponding app bone by ICP (humerus, radius, ulna, 8 carpals, 5 metacarpals, 14 phalanges per side; residual 1-2.5 mm; forearm scale 1.075, hand 1.13, rotation about 7 degrees). Each ligament vertex is moved by a distance-weighted blend of the transforms of its three nearest bones, so ends stay on their own bones. Resulting ligament vertices lie a median 1-3 mm (max 9 mm, elbow capsule) from app bone surfaces.
- Not imported: Z-Anatomy supplies quadrate ligament, oblique cord, scapholunate, lunotriquetral, pisohamate and pisometacarpal ligaments only as 8-vertex blocks; left out as too crude.

### Bursae (added 4 November 2026)
- 33 bursae from Z-Anatomy (CC BY-SA 4.0), both sides: iliopectineal, anserine, bicipitoradial, coracobrachial, the infrapatellar and three prepatellar bursae, suprapatellar, gluteal and trochanteric bursae, sciatic bursae, gastrocnemius and semimembranosus bursae, subacromial, subdeltoid and related shoulder bursae, triceps, retrocalcaneal and subcutaneous malleolar/calcaneal bursae.
- Fit: each bursa vertex moved by a distance-weighted blend of the fitted transforms of its three nearest bones (affine ICP fits for tibia, fibula, patella, hip bone, scapula; the existing femur fit; the arm-bone fits). Vertices lie a median 2-7 mm (up to 13 mm for the retrocalcaneal and gluteal bursae) from the nearest bone.
- Limitation: Z-Anatomy models bursae as smooth ellipsoid sacs, not thin collapsed pouches, so they show position and approximate size, not true shape.
- Not imported: tibialis anterior bursa (its foot bones are not in the fit set, so position could not be verified), the trapezius bursa mesh (unusable geometry), and bursae duplicating an existing one (iliacus subtendinous, obturator internus subtendinous, sartorius).

### Lymph node groups (added 4 November 2026)
- 103 named lymph node groups (about 3,000 individual node shapes), from Z-Anatomy (CC BY-SA 4.0): head, neck, axillary and arm, inguinal, popliteal and leg, pelvic, abdominal (coeliac, mesenteric, aortic, colic, gastric, pancreatic) and thoracic (paratracheal, tracheobronchial, parasternal, intercostal) groups. Each group is a set of separate ovoid node meshes, so group size is Z-Anatomy's schematic count, not a measured one.
- Fit: limb and lacunar groups move with the fitted bones (distance-weighted blend of the three nearest bone transforms). All other groups use one rigid scale-and-shift chosen per group from three candidates (Z-Anatomy frame, the fit of Z-Anatomy abdominal organs to the app's organs, the skeleton frame), whichever puts the group closest to the app's vessels, organs and bones; chosen medians are 1-8 mm for most groups.
- Limits: node shapes are small (about 4-8 mm), so they are hard to see at whole-body zoom; positions are approximate (centimetre level) because the app's organs, vessels and bones are not in one consistent frame.
- Not imported: intrapulmonary nodes (lung frame not fitted), joiner objects with no geometry, and groups without a standard terminology name. Pharyngeal lymphoid ring is not a node group here.

### Asset split (lod26)
`zanatomy-joints.glb` was split into `zanatomy-joints-lower`, `zanatomy-joints-upper`, `zanatomy-bursae`, `zanatomy-lymph-upper`, `zanatomy-lymph-lower`. Source, licence (CC BY-SA 4.0 Z-Anatomy / CC BY-SA 2.1 JP BodyParts3D) and attribution are unchanged.

### Video tour
(The video tour and its tour.mp4 were removed on 8 Nov 2026; the Quick tour remains.)

## zanatomy-nerves.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0), nerve curves evaluated to tube meshes and simplified for the web. Contents: vagus (X), oculomotor (III), trochlear (IV), abducens (VI), ophthalmic nerve, brachial plexus (roots, trunks, divisions, posterior cord), cauda equina, anterior and posterior spinal roots, and the sciatic, femoral, tibial, common fibular, median, ulnar, radial, musculocutaneous and axillary nerves (left and right). They replace the procedural nerve tubes and the schematic limb nerve tubes (removed from anatomyverse-limbsupply.glb). Not covered by this source: phrenic nerve, saphenous nerve.

## zanatomy-brainstem.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0): midbrain, pons and medulla oblongata merged as one brainstem, and adenohypophysis plus neurohypophysis merged as the pituitary gland. Replaces the procedural brainstem (112 triangles) and pituitary ellipsoid.

## zanatomy-cerebrum.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0): "White matter of telencephalon" left and right (the cerebral hemispheres with their gyral surface), merged and simplified from 135k to about 16k vertices. Replaces the procedural cerebrum (300 triangles).

## zanatomy-cerebellum.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0): cerebellar hemisphere lobules, vermis lobules, tonsils and flocculi merged and simplified. Replaces the procedural cerebellum.

## zanatomy-pituitary.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0), split out of the brainstem file so the brainstem and pituitary can be gated separately. Licence and attribution unchanged.

## zanatomy-neckvessels.glb and zanatomy-neckvessels-skull.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0), curve objects evaluated to tube meshes: left and right common carotid, external carotid, internal carotid (neck part, plus the skull-base part in the `-skull` file, hidden when the detailed BodyParts3D brain supplies it), internal jugular vein and vertebral artery. They replace the short common carotid and internal jugular tubes in `anatomyverse-organs.glb`.
Generated part (original 3D Anatomy work, no third-party mesh): a short connecting tube from the lower end of each internal jugular vein to the subclavian vein, and from each vertebral artery to the subclavian artery, because the two sources sit in slightly different frames.

## anatomyverse-organs.glb: subclavian to axillary connection (2026-11-05)
Generated part (original work): a tapered tube joining the end of each subclavian artery and vein to the start of the axillary vessel (5.6 to 7.2 cm). Gaps after joining: 0.4 to 1.4 mm. Approximation; pending expert review.

## anatomyverse-phrenic.glb (2026-11-05)
Generated (original work, no third-party mesh). Z-Anatomy has no phrenic nerve. The course (roots at C3 to C5, in front of the subclavian artery, beside the heart, to the diaphragm, with three terminal branches per side) was built from published anatomical descriptions and placed against the displayed heart, great vessels and diaphragm. Approximation; pending expert review. Replaces the procedural rod and the schematic `phrenic_nerve_dia` in `anatomyverse-diasupply.glb`.

## anatomyverse-mesenteric.glb (2026-11-05)
Generated (original work). Left colic and sigmoid branches of the inferior mesenteric artery, snapped to the displayed descending and sigmoid colon. Approximation; pending expert review.

## anatomyverse-vulva.glb (2026-11-05)
Generated (original work, no third-party mesh). Z-Anatomy and BodyParts3D are male-based and contain no female external genitalia. Labia majora, labia minora, clitoral glans, body, crura and hood, and the mons pubis were modelled with signed-distance shapes from published anatomical descriptions and fitted to the displayed vagina, urethral orifice and pelvis. Approximation; pending expert review. Replaces the procedural ellipsoid and tube shapes.

## anatomyverse-scrotum.glb (2026-11-05)
Mixed. The ductus deferens is from Z-Anatomy (CC BY-SA 4.0, derived from BodyParts3D CC BY-SA 2.1 Japan), thickened for display. The scrotal sac, cord sheath, testicular artery and pampiniform plexus are generated original work (no third-party mesh), fitted around the displayed testes. Approximation; pending expert review. Replaces the procedural scrotum and cord tubes.

## zanatomy-male-urethra.glb (2026-11-05)
Source: Z-Anatomy (CC BY-SA 4.0): the urethra curve, thickened for display. It starts at the bladder neck. It replaces the procedural urethra, which began 6 cm above the bladder. New record `male-urethra` added; `external-carotid-artery` added as a record for the new external carotid mesh.

## Share-alike note for generated parts
Generated parts were built independently and contain no third-party vertices. Where a generated part is merged into the same glb file as a Z-Anatomy mesh (the scrotum file), the whole file is distributed under CC BY-SA 4.0 and listed on the credits page.

## hubmap-skin-male.glb and hubmap-skin-female.glb (added 12 November 2026)

| | |
|---|---|
| Source | HuBMAP CCF 3D Reference Object Library: "3D Reference Organ for Skin, Male" (https://doi.org/10.48539/HBM369.SBSP.863) and "3D Reference Organ for Skin, Female" (https://doi.org/10.48539/HBM466.LKPQ.876), created from the NLM Visible Human Male and Female by Kristen Browne and Heidi Schlehlein. Meshes read from the v2.0 united models, nodes `VH_M_skin` (92,659 vertices) and `VH_F_skin` (191,322 vertices). |
| Repository | https://github.com/hubmapconsortium/ccf-releases (`v2.0/models/3d-vh-m-united.glb.zip`, `3d-vh-f-united.glb.7z`; licence stated in `v2.0/markdown/ref-organs/3d-vh-m-skin.md` and `3d-vh-f-skin.md`) |
| Licence | CC BY 4.0 |
| Commercial use | Permitted |
| Modification | Permitted |
| Attribution | Required: "HuBMAP CCF 3D Reference Object Library, 3D Reference Organ for Skin, Male / Female (Kristen Browne, Heidi Schlehlein), CC BY 4.0", with a note that it was modified |
| ShareAlike | No |
| Modifications made | Substantial. The surface was re-posed and re-proportioned to this app's skeleton: per-segment transforms (pelvis, chest, head, face, upper arm, forearm, hand, thigh, leg, foot) from joint landmarks, blended with harmonic skin weights; arms lengthened about 22 percent; limb girth, chest and head size rescaled to cover the app's muscles and skull; then pushed outward by up to about 2 to 4 cm where muscles still protruded, and smoothed. Simplified to about 40,000 triangles (phone version about 16,000), meshopt-compressed. Scripts: `tools/session-2026-11/generators/skin_fit/` (`fit.py`, `export.py`, `patch_app.py`). |
| Accuracy note | The result is NOT a measurement of either Visible Human subject. The app's muscles and skeleton are the same (male-derived) for both sexes, so the female surface was widened at the shoulders and chest to cover them. The female breast shape is the scan's own. Hands are fitted by landmarks only (finger bones are not individually enclosed). Technical verification only; no anatomist has reviewed the fitted surfaces. |
| Replaces | The procedural skin shapes (`skin_head`, `skin_neck`, `skin_torso`, `skin_torso_female`, `skin_arm_*`, `skin_forearm_*`, `skin_hand_*`, `skin_thigh_*`, `skin_leg_*`, `skin_foot_*`, `skin_breast_*`, `hair_male`, `hair_female`). No hair is drawn now. |


## Renal pelvis, calyces and renal medulla (added 12 Nov 2026)

- Files: `models/hubmap-kidney.glb`, `models/lite/hubmap-kidney.glb`
- Source: HuBMAP CCF 3D Reference Object Library, Visible Human male kidney, left (https://doi.org/10.48539/HBM562.JGPS.244) and right (https://doi.org/10.48539/HBM272.ZVPQ.979), Kristen Browne and Heidi Schlehlein. Licence: CC BY 4.0.
- Changes: renal pelvis merged with major and minor calyces; renal pyramids merged with papillae; simplified; one similarity transform per side to fit the BodyParts3D kidneys shown in the app (surface fit median 3.6 mm left, 4.5 mm right). Technical fit only, not expert-validated.
- Replaces: `models/zanatomy-kidney.glb`, removed because (a) it drew a second kidney, adrenal gland and ureter on top of the BodyParts3D ones and (b) its internal parts are not in BodyParts3D and may come from the non-commercial kidney model listed in the Z-Anatomy credits.

## Intrarenal vessels (generated, 12 Nov 2026)

- Files: `models/anatomyverse-renal-vessels.glb` (+ lite). Original generated tubes, not a scan: anterior and posterior divisions of the renal artery, interlobar arteries and veins routed between the scan-derived pyramids. Marked schematic in the app. Approximation pending expert review.


## Body surface (skin), male and female - replaced 12 Nov 2026

- Files: `models/mh-skin-male.glb`, `models/mh-skin-female.glb` (+ `models/lite/`). They replace the HuBMAP Visible Human skin files, which looked crude (1990s scans of heavy-set donors, no ears or lips, simplified).
- Source: MakeHuman 1.1 base mesh, ethnic/gender macro targets (young adult, average muscle and weight), female breast targets, default skeleton and skin weights. Licence: CC0 1.0 (assets explicitly released as CC0 in September 2020, see LICENSE.ASSETS.md in the MakeHuman repository). Attribution is not required but is given.
- Changes: posed with the MakeHuman skeleton so the arms, hands, legs and feet match this app's skeleton landmarks; scaled to the app's height; limbs and trunk fitted by blended joint transforms. Scripts: `tools/session-2026-11/generators/mh_skin/`.
- Honesty note: artist-made, not anatomical scan data; labelled "schematic" in the app. Some muscles lie up to 1-3 cm outside it in places; this is invisible when the skin is solid (inner structures are hidden then) and harmless when it is see-through.
