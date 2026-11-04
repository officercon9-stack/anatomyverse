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
original drawings (`source/ear/mkinner.py`). No Z-Anatomy kidney is used (kidneys
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
