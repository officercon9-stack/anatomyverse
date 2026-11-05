# 3D Anatomy (AnatomyVerse): code record

Record date: 5 November 2026. Live: https://officercon9-stack.github.io/anatomyverse/ . Repository: officercon9-stack/anatomyverse, branch `main`, published by GitHub Pages (the repository root is the deployed site). Latest commit at the time of writing: `20b7cdc`.

## What the code is
- The app is a **compiled Vite bundle** (React + three.js). The original source no longer exists; features are added by **patching the compiled chunks** with Python/Node scripts, then renaming changed chunks so browsers never serve a stale copy.
- `source/` holds recovered TypeScript for some components and the patch scripts; `reconstructed-src/` holds readable reconstructions of chunks. They document behaviour but are not the build input.
- 3D models are `.glb` files in `models/` (full) and `models/lite/` (phones; chosen automatically by `lowPower`). 

## Layout
| Path | Contents |
|---|---|
| `index.html` | page shell; start-up safety net script; loads `first-run.js`, `ux.js`, `tour-video.js` |
| `assets/*-bNNN.js` | compiled chunks. `NNN` is the cache-bust number (now **b115**). Key chunks: `index-*` (app, routes, legal text, review badge), `assetManifest-*` (all 3D assets, `objectMap`, overlays, ~1,750 structure records), `AnatomyViewer-*` (3D viewer, selection, load flags), `LabPage-*` (Lab UI and layer toggles) |
| `models/`, `models/lite/` | `.glb` meshes. Joints, bursae and lymph nodes are five on-demand files: `zanatomy-joints-lower/-upper`, `zanatomy-bursae`, `zanatomy-lymph-upper/-lower` |
| `sw.js` | service worker. Bump `V` (now `av-v51`) and `MODEL_TOKEN` (now `lod26`, also in the viewer chunk) together whenever a `.glb`, the manifest or the viewer changes |
| `ux.js`, `ux.src.js` | mobile and tools-sheet enhancements (`ux.js` is the minified build of `ux.src.js`) |
| `tour-video.js`, `tour.mp4`, `tour.html` | video tour player (Quick tour card and Tools sheet), the 51 s video, and a standalone page |
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
- Known gaps: vulva, labia, clitoris, scrotum, spermatic cords and vas deferens; pharynx, oral and nasal cavities, urethras, skin and hair, third molars, alveoli; spinal, rib and jaw ligaments; fascia. 
- Open issue: the app is reported not to load on some phones; not reproduced in emulation. A start-up message with a "Clear cache and reload" button now appears on failure.

## Recent commits (4 Nov 2026)
`314834c` bladder and rectum; `3234b5a` larynx, trachea, thyroid; `d4293b9`, `8fba8d8` spinal cord; `218cc74` heart; `4f03e34` joints and ligaments; `d3aa101` source index and audit; `3e85594` arm and hand joints; `75ddd6f` bursae; `3bf3e63` lymph nodes; `193c80d` duplicate removal; `183e42b` region split for mobile; `d1efa45` start-up safety net; `5bb770d` tour video; `d1a18e4` video in Quick tour; `20b7cdc` reviewer names.

## Licences
3D models are CC BY-SA 4.0 (Z-Anatomy), CC BY-SA 2.1 JP (BodyParts3D) and CC BY 4.0 (HuBMAP); keep their attribution and licence when redistributing. App text was written from cited open textbooks. Have the licence terms checked by a lawyer before selling the app.
