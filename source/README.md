# AnatomyVerse 3D — clean source (work in progress)

The original source code of the app does not exist (only compiled files were available). This folder is a **new, readable project** being rebuilt to behave like the live app. It is NOT finished yet.

## Done
- `src/types.ts`: typed model of a teaching record (Structure), a 3D model (ModelAsset) and its lazy-loaded overlays.
- `src/data/`: all 350 teaching records, 17 model definitions (with the part-to-structure maps and overlay gates), sources and chapters as plain JSON, with typed helpers in `src/data/index.ts`. Extracted from the live app, so edits here are the way to change teaching content.

## To do (in this order)
1. Anatomy viewer (3D scene, schematic body parts, heart animation, overlays, selection, hover/click cards) from `reconstructed-src/chunks/AnatomyViewer-*.js`
2. Anatomy lab page (view buttons, nerve/vessel switch, view commands) from `LabPage-*.js`
3. Search box and search commands from `SearchBox-*.js`
4. App shell, routes, store, quiz, flashcards, dictionary, lessons, legal pages from `index-*.js`
5. Build pipeline for models (`workspace/brain3d/*.py`) wired into `npm run build`
6. Compare screenshots with the live app

Libraries to use: react, react-router, zustand, three, @react-three/fiber, @react-three/drei, lucide-react, tailwindcss 4.
