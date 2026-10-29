# AnatomyVerse 3D: developer guide

Read this first. The README in the root is older.

## What this repository is
- **The root is the shipped website** (GitHub Pages serves it): `index.html`, `assets/` (compiled chunks), `models/`, `data/`, `fonts/`, `icons/`, `manifest.webmanifest`, `sw.js`, `first-run.js`.
- **There is no original source for the compiled app.** It was patched, chunk by chunk, with Python scripts. `source/src/` holds a readable reconstruction that matched the app at an earlier milestone. It does **not** include the later features (skull, ear, eye tools). Treat the compiled files in the root as the source of truth.
- `android-app/` is the Capacitor Android wrapper; `.github/workflows/android.yml` builds it.
- `store/` has the Play Store listing, screenshots, review pack and licence questions.

## How a change is made
1. Edit the compiled chunk in `assets/` with a Python patch script (see `source/patch_*.py`). Every script asserts that the text it replaces occurs exactly once, so a failed assertion means the bundle changed.
2. **Bump the chunk name** so browsers don't serve stale copies: `python3 source/bump.py ROOT bNN AnatomyViewer-<hash>-bOLD.js ...` (pass the *file name only*, and the new suffix as `bNN`, no leading dash). It renames the chunk and every file that refers to it. Always re-test after bumping.
3. Test (below), then commit and push. Pages publishes `main` in a minute or two.
4. Phones cache `index.html`; share links with `?v=NN`.

## Where features live
| Feature | Where |
|---|---|
| Skull/ear/eye tool bar, jaw, explode, see-through, labels, eye cut section, credit line | `source/fx.js`, injected into the `AnatomyViewer` chunk by `source/patch_fx.py` (re-run `source/refx.py` then `patch_fx.py` after editing) |
| 22-bone skull data, colours | `source/patch_bones22.py` |
| Ear (auricle, ossicles, tympanic membrane, original inner ear) | `patch_ear.py`, `patch_ear2.py`; models via `source/models-pipeline/` (`mkinner.py` draws the cochlea, canals and nerves) |
| Eye detail (optic nerve, eyelids, zonule) | `patch_eyedetail.py` |
| Legal pages, content review status | `patch_legal.py`; statuses are `reviewStatus` in `assetManifest-*.js` |
| Fonts, manifest, offline cache, first-launch notice | `patch_pwa.py` |
| Licence credit written into each GLB | `source/embed_credit.py` |
| Model optimisation (meshopt, 16-bit) | `source/optimize_glb.py IN OUT [ratio] [abs_err]` |
| Z-Anatomy FBX to GLB | `source/models-pipeline/exp.js` + `exp.html` (needs the Z-Anatomy repo cloned; paths are at the top of the script) |

Older features (brain, lungs, limbs, organs, simple mode) were produced by the scripts in `workspace/brain3d/` and need the BodyParts3D source files, which are not in the repo.

## Coordinates and conventions
Metres, Y up, +Z in front of the body, +X is the patient's left. Z-Anatomy FBX files are in centimetres, so multiply by 0.01 to get app coordinates. BodyParts3D STL is millimetres, Z up, -Y forward.

## Testing
Playwright with software WebGL. Scripts are in `source/tests/`:
- `earflow.js`: opens the lab, searches a structure, isolates it and clicks tool buttons (`node earflow.js eye tag section,xray,parts [W H]`).
- `pwatest.js`: first-launch notice, service worker, offline reload, legal pages, outside requests.
- `legal.js`, `badge.js`: content pages and review badges.
- `shots.js`: store screenshots.
- `sh4.js`: needs a debug build that exposes `__D`, `__r3`; not used on the shipped build.
The tests start their own static server on a local port. Open a view in a real browser after any 3D change; code that compiles has not proven the picture is right.

## Android and Play Store
See `store/PLAY_STORE_STEPS.md`. The workflow `Android build` produces an AAB and a debug APK. It signs the AAB only if the four `ANDROID_*` secrets are set. Raise `version_code` for every upload.

## Known limits
- Left and right of paired structures are merged into one mesh in some views, so one tap selects both.
- The eye cut section has no solid cap.
- Labels crowd on narrow screens.
- All explanatory text is pending expert review (`store/review/`).
- Licence questions are open: see `THIRD_PARTY_ASSETS.md` and `store/LICENCE_QUESTIONS.md`.
