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
