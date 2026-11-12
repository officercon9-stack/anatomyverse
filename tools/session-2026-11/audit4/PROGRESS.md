# Master anatomical audit (Nov 2026) - progress log

Scripts: `inv.js` dumps every mesh in the running app (name, structure id, model, world box, centroid, visibility)
for male, female and the alternative brain set. `audit.py` runs the automated checks and writes `inventory.csv`,
`findings.json` and `generated_only.json`. These are technical checks, not expert anatomical validation.

## Pass 1 (before any repair) - chunks b163
- 1,760 records, 1,354 unique meshes, 1,163 structures with a mesh, 220 records without their own mesh.
- Record checks: 0 wrong sides, 0 bad parents, 0 duplicate names, 0 duplicate ids.
- Findings to act on: structures drawn from two models at once (kidney, adrenal, ureter, aorta, IVC, sternum, ...),
  one duplicated bursa mesh, coincident central retinal artery/vein, unmapped `brain-flow` mesh, region metadata.
