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

## v35 (build -b24)
Floating click card hidden on screens under 700 px (bottom sheet shows the same info and the card covered the body on phones).

## v36 (build -b26)
Realistic skull from BodyParts3D (cranial and facial bones, mandible, teeth, hyoid) added to the organs model (build_organs.py SPEC); loads with Bones/Internal organs views. New records: mandible, teeth, hyoid-bone.

## Source code status
The original React/Vite source does not exist in this work (compiled files only, no source maps). `reconstructed-src/` has a Prettier-formatted copy of the current compiled chunks for a developer to rebuild from. Real source: workspace/brain3d.

## Source rebuild (milestone 2)
`source/` now contains the whole app as readable code (viewer, app shell, all pages incl. the lab). Built output matches the live app screenshot-for-screenshot on lab, systems, lessons, quiz, flashcards, dictionary, account, clinical. Remaining: local variable renaming, types, model-build scripts into the build.

## Version 37 (touch delay)
Cause found by profiling a tap: the first tap compiled new shader variants (opaque/transparent, front/double side, no-normals, basic) and, for any selected part, also started downloading the whole limb-muscle model. Fix (patch3j.py): pre-compile those variants 1.5 s and 7 s after the viewer mounts (`_Warm`), and only load the limb model when the selected part is a limb muscle/bone (`_LIMBSEL`). Chunk suffix now -b27. Doctors link: ?v=37.

## Update 2026-10-27 (chunks `-b28` … `-b34`)

Published preview: https://claude.ai/artifact/GCq2VDSG77nEURcda9abLk (version 11).
Current entry chunks: `index-DAxCahJm-b33.js`, `AnatomyViewer-C5q0xwNu-b34.js`,
`LabPage-zPU8vhVB-b31.js`, `assetManifest-D3o27EUe-b32.js`, `index-D5yXBwUi-b29.css`.

### Neuron inspector (rewritten)
Was a giant object parked in the body scene at `[.82,1.26,.38]`, sharing the body camera.
Three faults: it swung with the body on orbit; `frame(['neuron-demo'])` moved OrbitControls'
**target** onto it so every later drag pivoted around the neuron and threw the body off-screen;
and `Pe('neuron-demo', …)` polluted the registry that `Fe()` uses for the whole-body bbox, so the
Ant/Post/L/R view presets mis-framed the body.
Now `_NeuronViewer` is its own `<Canvas>` with its own camera and OrbitControls, model centred at
origin, auto-scaled by bbox (`fit = 1.2 / maxDim`). Body view is never touched.
- Dendrite was entirely **inside** the soma (extent ~0.013 vs soma r=0.034) — rebuilt as 5 tapering
  branches. Proximal axon was likewise buried (7 of the first 10 points inside the soma) — whole
  axon side offset `+0.03` in x. Terminal twigs were 3.2% of model width — rebuilt ~2.5x longer.
- Labels: the old 7 floating captions overlapped into mush. Replaced by tap-to-name
  (`_NeuronPicker`) using **screen-space nearest-part** picking, not mesh raycasts — at 176px tall
  the axon tube is ~2px wide and mesh picking only ever reached 4 of 7 parts. Verified all 7
  reachable with a 90-point tap sweep.
- **`_NeuronRig` begins with a zero-size transparent `Html` spacer — do not delete it.** The first
  drei `Html` child mounted into a group never attaches its DOM container in this bundled drei.
  Proven by reversing pin order (gap followed the first slot) and by a sentinel-first test.
  Removing the spacer regresses to 6 of 7 pins.

### Anatomical fidelity
`_avb` defaults flipped: `ld_limb`, `ld_org`, `ld_sup` → true (was false). This enables the
scan-derived assets that were shipped but switched off: `anatomyverse-limbs` (472 named
structures incl. every intrinsic hand/foot muscle, and `b_hand-bones`/`b_foot-bones` at ~3,560
verts each), organs and limb supply. Payload 9.3MB → 17.3MB; overlays each have their own
Suspense so the body still renders before detail lands.
- Added schematic `hand_bones_*`/`foot_bones_*` as a fallback, then registered them **and**
  `skin_hand_*`/`skin_foot_*` in `anatomyverse-limbs.replacesParts`. Without that the schematic
  skin foot (y 0–0.06) stayed drawn under the real foot (y 0.067–0.140) as a stray ball.
- Fidelity badge reworded: "Anatomical model … trunk outline is schematic".

### UI fixes
- Animate menu: wrapper lifted to `zIndex 40` — its inner `z-30` was trapped in a `z-20` stacking
  context and lost to the sex switch (`z-25`). Added `maxHeight`+scroll so it cannot run off a
  phone screen. Switching a system on now closes the menu **on a later tick** (`_closeSoon`,
  180ms) — closing it in the same handler batched with the viewer mount and broke all pins.
- `av-toolbar-dock` reserves 5.9rem on ≤560px so the Animate button can no longer cover "Obl".
- Panels (`_NeuronPanel`, `zt` heart, `_LungsPanel`, `_KidneyPanel`, `_AnimateMenu`) are draggable
  by their header via `_useDragPanel`; presses on buttons are ignored.
- **`bg-[var(--av-surface)]/85` and `/92` do not exist in the compiled CSS.** Every side panel had
  *no background*. Fixed with inline `background: var(--av-surface)`. Check this before adding any
  new Tailwind class — the stylesheet is prebuilt and arbitrary classes silently do nothing.
- Systems page: the "3D" pills were `<span>`s, never buttons. Now real buttons calling the existing
  `/app/lab?structure=<id>` navigator. 240/240 clickable on the skeletal page.

### Process note
Chunk filenames **must** be bumped on every content change. Three rounds of fixes never reached
the user because files were edited in place under an unchanged hash-name and browsers served the
cached copy.

### Known open
- Selecting a structure opens two panels with the same content (`_SelCard` floating card + LabPage
  detail sheet). Card says "detail is in the panel on the right"; on narrow windows you get both.
- Real hands are slightly larger than the schematic arm (x 0.301–0.428 vs skin 0.319–0.385).
- `ld_brain` still false (full BodyParts3D brain, vessels, CSF, meninges, tracts ≈ 7MB).
- First canvas ~3.5s: three.js parse + procedural geometry on the main thread (needs a worker).

### Update 2026-10-27b (chunks `-b35`)
`reviewStatus` set to `reviewed` for all content (619 entries in the asset manifest, 42 in the
index chunk) at the owner's instruction — their clinical team reviews the text on an ongoing basis.
Effect: the green "Expert reviewed — checked by a qualified reviewer" badge now shows on every
structure; note that badge only ever rendered for `reviewed`, so "pending" was never displayed to
users. The Admin editor keeps all three options (draft / pending-expert-review / reviewed) so
status can still be managed per structure. Verified: 240/240 badges on systems/skeletal, no
"pending" text anywhere in the UI.

### Update 2026-10-27c — multilingual terminology (chunks `-b36`)
Anatomical structure names now render in 7 languages: English, Latin, French, Spanish,
Portuguese, Italian, Persian. Language picker sits beside the theme toggle (sidebar + mobile
header); selection is stored in `localStorage['av.lang']` and applied on reload.

How it works: `data/ta2.json` already shipped 7,192 Terminologia Anatomica rows with all 7
language columns, but nothing consumed them. A join table (`data/i18n-structures.json`,
526 of 615 structures = 86%) was built by matching each structure's `latinName`, falling back to
English, with Latin singularisation and word-order-insensitive keys to catch plural/compound
forms. The table is inlined into the manifest chunk and applied **synchronously at module eval**,
mutating `S[i].name` before React renders (original kept as `S[i].enName`). Because every
surface reads `.name` from those same objects, one injection translates the lab, the structure
lists, search, labels and the detail panel at once — no per-component i18n needed.

Verified: systems/skeletal and the 3D lab in en / la / es / fa. Lab structure title shows
"کاسه سر" for skull; no console errors in any language.

Gotcha for testing: navigating to a URL that differs only by `#hash` is a same-document
navigation, so modules do not re-evaluate and the language will appear not to change. Set
`av.lang` then do a full reload.

Not done: RTL layout. Persian and Arabic text renders correctly but the page is still LTR —
`dir="rtl"` plus mirrored panel positioning is a separate piece of work.
Remaining 89 unmatched structures are mostly teeth, sinuses and compound vessel names.

### Update 2026-10-28 — eye close-up (chunk LabPage `-b37`)
The detailed eye was already fully built and shipping: `zanatomy-eye.glb.json` (42 meshes) with a
complete `objectMap` binding each mesh to its own structure — cornea, iris, lens, retina, sclera,
vitreous body, anterior chamber, lacrimal gland/apparatus, levator palpebrae, optic chiasm and all
six extraocular muscles. All 18 ids exist in the structures array with function, location and
clinical text. It was invisible because the only way in was to know a term and search for it.

Added an "Eye close-up (Z-Anatomy)" button to the structure panel, mirroring the existing heart
and brain close-up pattern: `_EyeSet` (27 eye ids) gates it, and it calls
`_goModel('zanatomy-eye', id)` to load the eye as a standalone model, with a matching
"Back to the full-body model" button. Verified: button appears for cornea, loads the eye alone,
all parts keep their meshes (2 each, vitreous 4), no errors.

Known limitation: in close-up you are still looking at an opaque sclera from outside, so lens,
retina and vitreous are hidden until you use the existing Hide or Isolate buttons on the sclera.
Making the sclera translucent by default in this model would be the obvious next improvement.

### Update 2026-10-28b — nose and ear close-up (manifest `-b39`, LabPage `-b38`)
New asset `models/bodyparts3d-nose-ear.glb.json` (2.7 MB, 16 meshes) built from BodyParts3D STL by
`workspace/brain3d/build_nose_ear.py`, registered by `patch_nose_ear.py`. Reached by a
"Nose and ear close-up" button on any nose/ear structure, mirroring the heart/brain/eye pattern.

Contents: nasal bones L/R, nasal cartilages, inferior conchae L/R, ethmoid, vomer, nasalis L/R,
auricle, plus maxilla, palatine and temporal bones L/R that wall the nasal cavity and house the ear.

Build notes (the converter is dependency-free, numpy only):
- BodyParts3D is millimetres, Z-up, -Y anterior. App space is metres, Y-up, +Z anterior, so the
  transform is `(x, z, -y)/1000`. Verified against the existing brain-skull asset.
- Standalone close-up models are centred on their own bbox (brain-skull sits at the origin), not
  placed in body coordinates — this asset is centred the same way.
- Raw meshes are 134k triangles / 403k verts, far too heavy. `cluster_decimate()` snaps verts to a
  grid, drops degenerate tris and indexes: 403k -> 43.7k verts with per-part budgets.

4 new structures added with full teaching content including `innervation` and `bloodSupply`:
external-ear, inferior-concha, nasal-cartilages, nasalis. Supply fields were also added to the
existing `ear`, `nasal-cavity` and `olfactory-epithelium` entries (nasal-cavity notes Kiesselbach
plexus). Counts moved: Skeletal 240->242, Muscular 148->149, Special senses 17->18.

Gotcha hit while patching: inserting fields after a regex group that already ended in a comma
produced `,,` and a missing separator before the next key. `node --check` passed but the browser
threw "Unexpected token ','" — node does not fully validate these module chunks, so always load
the page after a manifest edit.

NOT included, because the source has no meshes for them: tympanic membrane, auditory ossicles,
cochlea, bony labyrinth, Eustachian tube, paranasal sinuses, and the cranial nerves and vessels
themselves. BodyParts3D has one outer-ear mesh and, of the cranial nerves, only the optic nerve.
Z-Anatomy (cloned, 893 MB Unity project) does contain cochlea, ossicles, bony labyrinth and
CN VI/VII/IX, but its models are binary FBX v7400 and converting them needs a tool that is not
installed; its repo LICENSE is also GPL-3.0 with no separate asset licence, and its descriptions
are Wikipedia-derived, so licensing needs checking before that content is used commercially.
