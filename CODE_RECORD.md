# 3D Anatomy (AnatomyVerse): code record

Record date: 5 November 2026. Live: https://officercon9-stack.github.io/anatomyverse/ . Repository: officercon9-stack/anatomyverse, branch `main`, published by GitHub Pages (the repository root is the deployed site). Latest commit at the time of writing: `20b7cdc`.

## What the code is
- The app is a **compiled Vite bundle** (React + three.js). The original source no longer exists; features are added by **patching the compiled chunks** with Python/Node scripts, then renaming changed chunks so browsers never serve a stale copy.
- `source/` holds recovered TypeScript for some components and the patch scripts; `reconstructed-src/` holds readable reconstructions of chunks. They document behaviour but are not the build input.
- 3D models are `.glb` files in `models/` (full) and `models/lite/` (phones; chosen automatically by `lowPower`). 

## Layout
| Path | Contents |
|---|---|
| `index.html` | page shell; start-up safety net script; loads `first-run.js`, `ux.js` |
| `assets/*-bNNN.js` | compiled chunks. `NNN` is the cache-bust number (now **b115**). Key chunks: `index-*` (app, routes, legal text, review badge), `assetManifest-*` (all 3D assets, `objectMap`, overlays, ~1,750 structure records), `AnatomyViewer-*` (3D viewer, selection, load flags), `LabPage-*` (Lab UI and layer toggles) |
| `models/`, `models/lite/` | `.glb` meshes. Joints, bursae and lymph nodes are five on-demand files: `zanatomy-joints-lower/-upper`, `zanatomy-bursae`, `zanatomy-lymph-upper/-lower` |
| `sw.js` | service worker. Bump `V` (now `av-v51`) and `MODEL_TOKEN` (now `lod26`, also in the viewer chunk) together whenever a `.glb`, the manifest or the viewer changes |
| `ux.js`, `ux.src.js` | mobile and tools-sheet enhancements (`ux.js` is the minified build of `ux.src.js`) |
| `smart-labels.js` | label management for the Lab: Clean (default), Smart (collision-free labels with leader lines and region clusters) and Index (searchable list of all structures). The old per-structure label component in the viewer chunk is switched off (`globalThis.__avSL`); the viewer exposes the record map as `globalThis.__avRec` |
| `data/` | translated structure names (`i18n-structures.json`), Terminologia Anatomica data |
| `tools/session-2026-11/` | scripts used in the November 2026 work (see below) |
| `MODEL_SOURCES_AND_LICENSES.md`, `THIRD_PARTY_ASSETS.md`, `AUDIT_REPORT.md` | sources, licences and audit of every 3D asset |
| `HANDOFF.md`, `DEVELOPER_GUIDE.md`, `README.md` | earlier handoff notes |

## How a change is made
1. Build or edit the asset or patch (scripts in `tools/session-2026-11/`).
2. `python3 tools/session-2026-11/bump.py . bNNN <changed chunk basenames>` renames the chunks and cascades the new names to every file that references them.
3. If any `.glb`, manifest or viewer changed: bump `V` in `sw.js` and `lodNN` in `sw.js` and the viewer chunk.
4. `node --check assets/*.js`; test with the Playwright scripts (`h.js` helpers; `cnt.js` counts meshes and draw calls, `load.js` measures load, `jt.js` renders a selection, `sel3.js` checks lazy loading, `dup.js` checks for duplicate visible meshes).
5. Commit, push to `main`, wait for the Pages deployment.

## Model pipeline (Z-Anatomy joints, bursae, lymph nodes)
Z-Anatomy `Startup.blend` (CC BY-SA 4.0) is exported with Blender (`bpy`), re-fitted to the app skeleton per bone (arm and hand: ICP per bone; legs: affine ICP; femur from a dedicated fit), skinned to the nearest three bones, packed by `buildjoints.mjs` (colours, node names, `objectMap` keys), split by region with `split.py`, and simplified for phones with `mklite.mjs`. Python helpers `content.py`, `bursacontent.py`, `lymphcontent.py`, `newcontent.py` generate the structure records.

## State of the data
- Structure records (names, Latin names, system, parent, side, source) are in the manifest. Their `reviewStatus` is now `reviewed`, shown as "Reviewed by Dr. Aqsa Hameed Phulpoto and Dr. Farhan Ali" (owner's statement of 4 Nov 2026; see `AUDIT_REPORT.md`).
- Known gaps: vulva, labia, clitoris, scrotum, spermatic cords and vas deferens; oral cavity, urethras, skin and hair, third molars, alveoli; spinal, rib and jaw ligaments; fascia. 
- Open issue: the app is reported not to load on some phones; not reproduced in emulation. A start-up message with a "Clear cache and reload" button now appears on failure.

## Recent commits (4 Nov 2026)
`314834c` bladder and rectum; `3234b5a` larynx, trachea, thyroid; `d4293b9`, `8fba8d8` spinal cord; `218cc74` heart; `4f03e34` joints and ligaments; `d3aa101` source index and audit; `3e85594` arm and hand joints; `75ddd6f` bursae; `3bf3e63` lymph nodes; `193c80d` duplicate removal; `183e42b` region split for mobile; `d1efa45` start-up safety net; `5bb770d` tour video; `d1a18e4` video in Quick tour; `20b7cdc` reviewer names.

## Licences
3D models are CC BY-SA 4.0 (Z-Anatomy), CC BY-SA 2.1 JP (BodyParts3D) and CC BY 4.0 (HuBMAP); keep their attribution and licence when redistributing. App text was written from cited open textbooks. Have the licence terms checked by a lawyer before selling the app.


## 2026-11-05 upper airway and tonsils
Pharynx (Z-Anatomy nasopharynx, oropharynx, laryngopharynx), nasal cavity (Z-Anatomy mucosa of nasal cavity) and palatine tonsils now come from Z-Anatomy (CC BY-SA 4.0) in `zanatomy-organs2.glb`, replacing the procedural tube and ellipsoids. Left/right pairs that share one structure id (arytenoid and corniculate cartilages, tonsils) are single merged nodes, because the viewer keeps one mesh per id; this restored the right-hand arytenoid and corniculate cartilages, which were not being drawn.

## 2026-11-05 female external genitalia (procedural)
No licensed vulva, labia or clitoris mesh exists (Z-Anatomy and HuBMAP have none), so these remain schematic parts. Their shape was reworked: smooth labia majora and minora tubes that start at the mons pubis and meet at the vestibule, replacing the stacked-capsule shapes and the oversized flat mons disc. Ids unchanged.

## 2026-11-05 nerves from Z-Anatomy
New asset zanatomy-nerves (see THIRD_PARTY_ASSETS.md). Two new structure records were added: cauda-equina and spinal-nerve-roots (no reviewStatus, the named reviewers have not yet reviewed these two texts). Measured gaps after import: sciatic to cauda equina 0.1 mm, brachial plexus to spinal roots 0, spinal roots to spinal cord 0.2 mm, cauda equina to cord 1.3 cm (the HuBMAP cord ends above the Z-Anatomy conus), vagus to brainstem 1.4 cm, phrenic to roots 3.3 cm (no licensed source).

## 2026-11-05 defect fixes
- Removed duplicate records: inferior-concha (kept inferior-nasal-concha and its left/right children; the BodyParts3D concha nodes now map to the left/right ids), and the first copy of hyoid-bone, mandible, ophthalmic-artery and internal-jugular-vein (the second copy was already the one shown). Structures: 1751 records, 1751 unique ids.
- Admin status list no longer offers "Pending expert review".
- Accessibility and touch polish in ux.js: larger hit area on the 3D badges, toolbar labels now start with their visible text, preview no longer role=img while holding controls, unique aside labels, an h1 role where a page has none, landing preview button no longer overlaps the credit line.
- Cerebellum replaced from Z-Anatomy.
- Not changed: 862 records without function text, 1,059 without Latin name, 105 very short descriptions (clinical text needs a clinician or a cited source, not generated text).

## Generators for the 5 November 2026 repair pass
`tools/session-2026-11/generators/` holds the scripts that built the new model files, so each can be rebuilt or reviewed:
- Z-Anatomy extraction (run inside Blender's Python against Z-Anatomy `Startup.blend`, frame x, z, -y): `zv.py` (neck vessels), `zdd.py` (ductus deferens), `zur.py` (male urethra), `zo2.py` and `zo3.py` (gums, soft palate, uvula, tongue, glands, palate bone points), `zcl.py` (centrelines for registration).
- Generated geometry: `mkphr.mjs` (phrenic nerves), `mkima.mjs` (mesenteric branches), `ext.mjs` (jugular and vertebral joining tubes), `link.mjs` (subclavian to axillary), `sdf.py` with `vulva.py` and `male.py` (signed-distance modelling of vulva and scrotum), `palate.py` (hard palate sheet fitted to the Z-Anatomy palate bones), `wn.mjs` (limb-nerve registration).
- Packaging: `mkglb.mjs` and `mk_vessels.mjs` (weld, simplify, quantize, lite copy), `addasset.py` (add an asset and overlay to the manifest chunk).
Procedure for a new model file: build the glb and its lite copy, add the asset with `addasset.py`, bump chunk names with `tools/session-2026-11/bump.py`, bump `MODEL_TOKEN` and the cache name in `sw.js`, then test in the browser.

## Angina pain 4D animation (session 2026-11)
Added to the viewer's Animate menu ("Cardiovascular — Angina pain (4D)"). Store flags `anginaActive` and `anginaStage`; panel `_AnginaPanel` in the AnatomyViewer chunk (source copy: tools/session-2026-11/generators/angina_panel.js). Five stages (rest, effort, oxygen mismatch, pain signal, rest or nitroglycerin) drive the real heart beat rate and highlight the coronary arteries, left ventricle, spinal cord and brain. Gauges, plaque and referred-pain map are schematic. The text is an illustrative teaching summary and has not been reviewed by a clinician. Technically tested on desktop and 390px phone emulation only.

## FCPS Preparation quiz topic (session 2026-11)
37 original exam-style MCQs (ids q-fcps-01 to q-fcps-37) on head and neck venous drainage, dural sinuses and their clinical points, written from standard anatomy and cited to OpenStax A&P 2e chapter 20. They appear under a "FCPS Preparation" topic in the Quiz. Generator: tools/session-2026-11/generators/fcps_questions.py. Not reviewed by any clinician and carry no "Reviewed by" badge.

### FCPS Preparation: generated pool
In addition to the 37 hand-written MCQs, the index chunk builds about 2,140 questions at load time from the structure records (generator: tools/session-2026-11/generators/fcps_generated_questions.js). Types: Latin name both ways, function to structure, muscle origin, insertion and action. Distractors come from the same region or system; ids are stable (q-fcps-g-...). Blood and nerve supply questions were deliberately left out because their distractors can be partly correct. Questions are flagged `generated` and have not been checked individually or by a clinician. The quiz page says so. Session cap raised from 30 to 100 questions.

### FCPS Preparation hub (route /app/fcps)
Dedicated page in the QuizPage chunk (source: tools/session-2026-11/generators/fcps_hub.js). Home with day streak, questions seen, accuracy and a days-to-1-January-2027 count; daily drill that weights questions you got wrong; revision cards with known/review marking; timed mock exam (palette, flagging, optional negative marking, area breakdown, answer review); weak-area drills. Progress is stored only in the browser (localStorage key av.fcps.v1). The January 2027 exam date and paper format are not asserted; the page tells users to check the CPSP notice.

### FCPS Preparation update (8 November 2026)
Latin-term questions removed from the generated pool. Added 81 hand-written MCQs in physiology (21), biochemistry (20), pathology (20) and pharmacology (20) (ids q-fcps-phy/bio/pat/pha-NN; generator tools/session-2026-11/generators/fcps_basic_sciences.py). They are standard textbook facts, not reviewed by a clinician. Drills and mock exams now draw evenly across the selected areas.

### FCPS Preparation rework (8 November 2026)
Removed all auto-generated questions (function, muscle attachment) because they were too easy. The pool is now 213 hand-written questions in five areas: Anatomy 69, Physiology 36, Biochemistry 36, Pathology 36, Pharmacology 36. 95 of them are clinical-vignette style (ids q-fcps-<area>2-NN, generator tools/session-2026-11/generators/fcps_vignette_questions.py). None has been reviewed by a clinician. The hub UI was simplified: one start button, subject tiles that start a 10-question drill, compact rows for the other modes, and a sticky Next button during drills and mock exams.

### FCPS Preparation: sources and 3D links (8 November 2026)
Subject tiles are labelled "Practice <subject>". After an answer is revealed (drill, revision card, question bank, mock review) each question shows a "Where to read more" line naming standard textbooks for the subject (not claimed as the source of the question text) and, when the correct answer names a structure that exists in the app's records, a "See it in 3D" link to /app/lab?structure=<id>. Matching is by name at runtime, with a guard against modifier mismatches (for example "medial circumflex femoral artery" does not link to the femoral artery). Structures the app has no model for (for example the facial vein) get no 3D link.

### FCPS Preparation: pool expanded to 477 (8 November 2026)
Added 264 hand-written questions (ids q-fcps-<area>3-NN): anatomy 62, physiology 44, biochemistry 43, pathology 51, pharmacology 64. Sources: tools/session-2026-11/generators/fcps_batch3/. Pool per area: anatomy 131, physiology 80, biochemistry 79, pathology 87, pharmacology 100. Still not reviewed by a clinician.

### FCPS mock exam results (8 November 2026)
The results page now opens with an answer key grid (question number, correct letter, your answer) and lists every question with all four options, the correct one marked, your choice marked, the explanation, reading reference and 3D link. The default review filter is "All with answers".

### FCPS 3D links: related structures (8 November 2026)
When the correct answer names no structure that the app models, the question text and explanation are scanned and the button is labelled "Related structure in 3D (the exact structure is not modelled)" (for example the larynx for the thyrohyoid membrane). Wrong-answer feedback now reads "Incorrect. The correct answer is X: ...". About 111 of 477 questions carry a 3D button; physiology, biochemistry and most pharmacology questions have no structure to show.

### FCPS mock exam: instant answers (8 November 2026)
The mock exam now shows the correct answer, explanation, reading reference and 3D link as soon as an option is touched, and locks that answer. It is on by default. A checkbox in the mock setup ("Show the correct answer ... straight after each answer") turns it off for an exam-style paper with feedback only after submission.

### Instant answers in practice questions (8 November 2026)
In the shared question component, touching an option in practice mode (clinical case revision questions, quiz practice, lessons) now submits immediately and shows Correct or Incorrect, the correct answer and the explanation. The "Submit answer" button remains for fill-in, matching and click-structure questions and in exam mode.

## Lighter first load for phones (sw av-v108)
- Landing page: the 3D preview (which pulled all lite models, about 12 MB raw) is no longer mounted automatically on low-power/mobile devices. A "Load the 3D preview" button mounts it on tap. Desktop is unchanged.
- index.html: instant "Loading 3D Anatomy" placeholder inside #root, with a slow-connection message after 9 s.
- Measured with Playwright (Pixel 5 emulation): landing page 1.4 MB transferred, no page errors. Not tested on a physical phone.

## Slow-connection start-up (sw av-v109)
- Safety banner now waits 60 s (was 15 s) and counts the loading placeholder as 'not ready'; three.js is no longer preloaded on the home page (it is only needed once a 3D view opens).
