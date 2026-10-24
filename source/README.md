# AnatomyVerse 3D — source

Readable React + TypeScript + Vite + three.js project that reproduces the published AnatomyVerse 3D app
(the app in the repository root is the compiled build; this folder is its source).

## Run
```
npm install
npm run dev        # development
npm run build      # production build to dist/
```
The 3D models and data files are not stored in this folder: link or copy `models/`, `data/` and `icons/`
from the repository root build into `public/` (they are produced by `workspace/brain3d/build_organs.py` etc.).

## Layout
- `src/data` – structures, models, sources (JSON), systems, lessons, questions, clinical cases, references
- `src/store` – zustand stores (viewer, progress, auth, content)
- `src/viewer` – the 3D viewer (scene, heart animation, blood flow, labels, toolbar)
- `src/pages`, `src/layout`, `src/components` – app screens; `src/pages/lab` – the anatomy lab
- `src/lib` – search, quiz engine, spaced repetition, flashcards, theme, api
- `tools/` – scripts that turned the compiled build into this source (not needed to build)

## Status
Pages compared with the live app by screenshot: identical (lab differs by 0.15% of pixels, animation timing).
Still to do: replace short local variable names, remove `// @ts-nocheck` and add types, move the model-building scripts into the build.
