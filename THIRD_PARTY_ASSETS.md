# Third-party assets, licences and attribution

Everything AnatomyVerse ships that was not written for it, what each licence
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
| `bodyparts3d-brain-csf` | Brain CSF spaces (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by AnatomyVerse) |
| `bodyparts3d-brain-fossae` | Cranial fossae (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by AnatomyVerse) |
| `bodyparts3d-brain-in-body` | Detailed brain (inside full-body skull) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-brain-mening` | Meninges (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by AnatomyVerse) |
| `bodyparts3d-brain-skull` | Brain and skull close-up (BodyParts3D) | CC BY-SA 2.1 Japan — BodyParts3D |
| `bodyparts3d-brain-tracts` | Brain and spinal cord tracts (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by AnatomyVerse) |
| `bodyparts3d-brain-vessels` | Brain blood vessels (inside full-body model) | CC BY-SA 2.1 Japan — BodyParts3D (schematic parts by AnatomyVerse) |
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
| `zanatomy-ear` | Ear: auricle, ossicles, tympanic membrane, chorda tympani (+ original cochlea, vestibule, canals, VIII nerve branches) | Ossicles, tympanic membrane, chorda tympani: CC BY-SA 4.0 — Z-Anatomy. Auricle: CC BY-SA 2.1 JP — BodyParts3D, registered onto the Z-Anatomy temporal bone. Cochlea, vestibule, canals, nerve branches: original AnatomyVerse drawings |

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

## 3. Original AnatomyVerse work — MIT

Written for this project; no third-party obligation.

| asset id | name | licence as recorded |
|---|---|---|
| `anatomyverse-alveoli` | Alveoli close-up (gas exchange) | AnatomyVerse schematic model |
| `anatomyverse-diasupply` | Diaphragm blood and nerve supply (schematic) | AnatomyVerse schematic model |
| `anatomyverse-limbsupply` | Limb arteries, veins and nerves (schematic) | AnatomyVerse schematic model |
| `detailed-anatomy-placeholder` | Detailed anatomical model (not installed) | Requires a licensed asset — none is bundled |
| `sample-gltf-femur` | GLB pipeline sample — schematic femur & hip bone | Original work — MIT (exported from the schematic body) |

## 4. Text and terminology

- **OpenStax Anatomy & Physiology 2e** — CC BY 4.0. Attribution required where
  used. All AnatomyVerse educational text is original wording; OpenStax is cited
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
