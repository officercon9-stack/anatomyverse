# Realistic male/female skin (work in progress, 2026-11-12)

Goal: replace the schematic block skin with the Visible Human Male and Female skin
surfaces (HuBMAP CCF v1.3, CC BY 4.0; DOI 10.48539/HBM466.LKPQ.876 for the female skin),
fitted to the app skeleton.

Done so far:
- Source meshes located (ccf-releases v1.3 `VH_M_Skin.glb`, `3d-vh-f-skin.glb`; full bodies in v2.0 united GLBs).
- `glbinfo.py`/`united.py` read the GLBs; `rnd.py` renders previews (`vh_skins.png`).
- `dump.js` exports the app scene; `applm.py` gets app joint landmarks from the bones.
- `vhlm.py`/`skinlm.py` get VH joint landmarks (hips, knees, ankles, axillae, shoulders, elbows, wrists, fingertips, feet); `lm_m.png`/`lm_f.png` show them.
- `ratios.py` compares proportions (app vs VH).

Not done: per-joint warp of the skin to the app skeleton, GLB export (full + lite),
wiring into the viewer per sex, testing, ledger entry. Nothing in the live app has changed.

## How to resume (updated 2026-11-12)
- `PROGRESS.md` is the running log; the newest line is the current state.
- Order of scripts: `dump.js` (app scene to app_*.jsonl) -> `appload.py` -> `applm.py` -> `united.py` (reads the two HuBMAP united GLBs) -> `skinlm.py` -> `fit.py m` / `fit.py f`.
- `fit.py`: bones from landmarks, harmonic skin weights, linear blend, then `enclose()` pushes the skin outside the anatomy. Output `fit_<sex>.pkl` (vertices, faces) and preview `fit_<sex>.png`.
- Source data (not in the repo): github.com/hubmapconsortium/ccf-releases, `v2.0/models/3d-vh-m-united.glb.zip` and `3d-vh-f-united.glb.7z` (CC BY 4.0).
- Still to do after the fit is good: export GLB (full + lite) with `tools/mkglb.mjs`, add overlays `hubmap-skin-male` / `hubmap-skin-female` to the manifest and viewer (sex filter like `hubmap-female-repro`), replace schematic `skin_*` parts, test, ledger entry in THIRD_PARTY_ASSETS.md, bump chunks and sw.js.
