# AnatomyVerse 3D — handoff (state at 2026-10-23, app version 27)

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
