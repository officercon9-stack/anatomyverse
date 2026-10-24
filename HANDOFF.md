# AnatomyVerse 3D — handoff (state at 2026-10-23, app version 32)

Live: https://officercon9-stack.github.io/anatomyverse/ (root of this repo = compiled app, Pages from `main`).
Private preview artifact: https://claude.ai/artifact/11PWYusfL14VhUeMHZqjoR

## Layout
- `/` compiled app (assets with `-b12` suffix = cache-busted patched chunks, models, data).
- `workspace/av-src` original compiled app (no source exists), the base for patching.
- `workspace/brain3d` build scripts and intermediate data: `patch_app.py` (master; line 133 sets the cache-bust suffix), `patch3c.py` (brain, CSF, meninges, tracts, hover card), `patch3d.py` (lungs, alveoli, pop-out, click card), `patch3e.py` (simple mode), `patch3f.py` (diaphragm supply), `make_*.py`, `build_*.py` model builders, `test/t22.js` Playwright driver.
- BodyParts3D source zip is NOT included (original attachment); needed to rebuild lungs/brain from scratch.

## Rebuild
`cd workspace/brain3d && python3 patch_app.py` (reads /home/claude/av-src, writes /home/claude/av-build; adjust paths), bump suffix on line 133, node --check chunks, publish.

## Done
Brain, skull base, vessels, CSF flow, meninges, tracts and cord; hover card and click card (function + diseases); lungs, alveoli close-up, breathing; double-click pop-out; simple mode; diaphragm blood and nerve supply.

## Ideas for next
Expert review of teaching text (all "pending review"); simplify top view buttons; licence check (BodyParts3D CC BY-SA 2.1 Japan); thin vessels are hard to click; floating stray objects beside the body (pre-existing).

## Update 2026-10-24 (version 29)
- Removed non-working items: Tutor, Sign in / Create account, Admin link, offline badge, "Ask tutor" buttons, "Demo content" label.
- Added "Touch and explore" tip (lab, bottom right, remembers dismissal).
- Added BodyParts3D limb, trunk, neck and head muscles (128 muscles, both sides) plus limb bones, hand and foot bones: `workspace/brain3d/build_limbs.py`, `muscles_data.py` (origin, insertion, nerve, action, blood supply, clinical text), `patch3h.py`. Tap a muscle: other muscles fade and origin (green) and insertion (orange) dots appear. Simple-mode buttons "Arm and hand muscles", "Leg and foot muscles".
- Source STL files (BodyParts3D 3.0, GitHub Kevin-Mattheus-Moerman/BodyParts3D) were cloned to /home/claude/bp3d-src (not stored here, 1.3 GB). `/tmp/named.json` (stem, name, size) was generated from its parts_list_e.txt; a copy is in workspace/brain3d.
- Pending: expert review of all text; facial muscles; organ name labels; floating skin-layer block at the right of the body.

## Update 2026-10-24 (version 31, suffix -b19)
Doctors' round 4:
- Search bar commands (SearchBox chunk, `_CMD`): "internal organs", "upper limb", "lower limb", "full model" (also skeleton, muscles, nerves and vessels). Implemented as `_view()` / `_viewCmd()` in LabPage (patch3i.py): layer opacities plus `isolate(ids by region)` plus camera frame. Simple-panel buttons added: Internal organs, Upper limb, Lower limb, Nerves and blood vessels.
- One switch "Show nerves and blood vessels" under Muscles / Upper limb / Lower limb: muscles go see-through, tubes show; tapping a muscle highlights its own nerve and artery (`_REL` map built from muscles_data nerve/blood text).
- Limb arteries, veins, nerves: `build_supply.py` (centre lines from the skinned bone landmarks, `/tmp/bones_skinned.pkl` is written by build_limbs.py), `supply_data.py` (records), model `anatomyverse-limbsupply`.
- Detailed organs from BodyParts3D: `build_organs.py` (liver, stomach, duodenum, jejunum, ileum, colon, appendix, rectum, pancreas, spleen, kidneys, adrenals, ureters, bladder, eyes, thymus, ribs, sternum, spine, discs, costal cartilages, aorta, IVC, renal/mesenteric/coeliac/iliac vessels, subclavian/jugular), `organ_data.py` (records), model `anatomyverse-organs`. SVC stays from the detailed heart overlay.
- Tendons and ligaments: muscle meshes are split by shape in build_limbs.py (`split_tendon`) and the tendon ends are drawn pearl white (nodes `t_*`); BodyParts3D ligaments (inguinal, iliotibial, linea alba, flexor retinaculum, interosseous membranes, long plantar) plus authored patellar, collateral and cruciate knee ligaments (`fibrous_data.py`).
- Smooth shading: glbtools `write_glb` accepts `smooth=True` (writes NORMAL).
- Pending: expert review of all new texts; replace remaining schematic organs (thyroid, reproductive, skull, brain stays); labels overlap in some views; limbs model is 8.9 MB.
- v31 speed: brain vessels/CSF overlays now load only on the Brain view (defaults off), limb model 8.9 -> 5.0 MB (fewer triangles, byte normals), startup download about 22 MB instead of 35 MB.

## v32 (build -b20): staged loading
Heavy overlays now carry `gate` flags (ld_org, ld_brain, ld_limb, ld_lung, ld_sup) in the `_avb` store, default off. `_BrainFlow` turns them on in turn (0.5/1.8/3.2/5.5/7.5 s) and all at once when a part is selected; view buttons, search commands, diaphragm view and the nerves/vessels switch request what they need immediately. Brain-only and lungs models decimated (5.5→1.7 MB, 6.8→1.8 MB; originals in workspace/brain3d/slim/orig). Real-device speed not measured.

## v33 (build -b21): on-demand loading
Timed staging removed. At start only the schematic body, heart and small data load (~3 MB). Each view button, search command or diaphragm view sets the ld_* flags it needs; selecting any part loads limbs + organs. Brain/lung/supply models load only from their own views.

## v34 (build -b23): lighter rendering
Profiling showed taps were GPU-bound: all parts used meshPhysicalMaterial (clearcoat, sheen). Now meshStandardMaterial, dpr fixed at 1. Selecting a part loads only the limb model. Test with a CPU-rendered browser only; real phone speed unmeasured.
