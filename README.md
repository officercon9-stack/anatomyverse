# AnatomyVerse 3D/4D

Interactive living-anatomy learning app for medical students — **pilot test build**.

▶ Open the app: https://officercon9-stack.github.io/anatomyverse/

Educational use only. The body is an original schematic model (not anatomically accurate); the heart is a scan-derived Z-Anatomy model. This build also adds the brain, spinal cord, meninges, CSF, tracts and brain vessels, the lungs with airways and alveoli, and the blood and nerve supply of the diaphragm, with click-for-function-and-diseases cards and a simple mode. Content is pending expert review.
The compiled app is in the root; `build-scripts/` holds the Python/Node scripts used to generate the models and patch the app (they need the BodyParts3D source files, which are not included).

## Third-party 3D content
`models/zanatomy-heart.glb.json` (a GLB stored as base64 JSON) is derived from **Z-Anatomy — The libre 3D atlas of anatomy** (CC BY-SA 4.0), itself derived from **BodyParts3D, The Database Center for Life Science** (CC BY-SA 2.1 Japan). Converted and optimised for AnatomyVerse; this derived model is shared under **CC BY-SA 4.0**.
`data/ta2.json` is from the Z-Anatomy TA2 terminology list (CC BY-SA 4.0).

`models/bodyparts3d-*.glb.json` (brain, skull base, vessels, lungs, airways, diaphragm) are derived from **BodyParts3D** (CC BY-SA 2.1 Japan; Database Center for Life Science), re-centred, smoothed and partly generated for AnatomyVerse; shared under the same licence. Verify licence terms before wider distribution.
