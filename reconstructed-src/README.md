# Reconstructed source (NOT the original)

The original source code of AnatomyVerse 3D (the React / Vite / three.js project) was never available to this work: the app was delivered only as compiled, minified files. No source maps exist, so the original cannot be recovered.

`chunks/` holds the **current app code, re-formatted with Prettier** so people can read it. Variable names are still minified (`A`, `k`, `D`, `_avb` ...), comments are gone, and the file layout is the bundler's, not the authors'. It is meant to help a developer rebuild the project cleanly, not to be built as is.

What is real source in this repo: `workspace/brain3d/` (Python and Node scripts, data tables and teaching text, model builders, tests) and the patches (`patch3c`-`patch3i.py`) that were written to change the compiled app.

Rebuild plan: a developer re-creates the project from these chunks (routes: Lab, Quiz, Dictionary, Lesson player, Search), the data in `data/` and `models/`, and the patch scripts, then replaces the patch scripts with normal source.
