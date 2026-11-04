# CHANGELOG

## 2026-11-04

### Boot wrapped in startFlip(canvas)
- **Why**: so the author's private game deck can embed Flip and stop/re-boot it on one page
- **Files**: src/main.js, src/rules.js, input.json
- **Notes**: all state and listeners now live inside `startFlip`, which returns `{ stop, input, load, state, setPaused, toStart }`; index.html still auto-starts it. rules.js also attaches its exports to globalThis so a bundler can share them. input.json added for the deck's controller bindings. solve.mjs unchanged and passing.

## 2026-11-03

### [F-001][F-002] Week-one playable: Flip
- **Why**: first playable of the Flip mechanic (one block grid, top-down and side slices) with three proved rooms; standalone shell with no gamekit dependency
- **Files**: src/rules.js, src/main.js, tools/solve.mjs, index.html, package.json, project/ROADMAP.md, project/CHANGELOG.md
- **Notes**: rules.js is a classic script (not an ES module) because module imports fail from file://; solve.mjs loads it via require, hence package.json type commonjs. Solver proves min flips 0/1/2 for rooms 1-3. Flip is toggle-on-press; jump goes one up and one across in the facing direction. Headless Chrome smoke test ran clean; real keyboard/gamepad feel not yet playtested.

### Repo created
- **Why**: entering GitHub Game Off 2026 (theme SHIFT) with a new single-file web cart
- **Files**: README.md, CLAUDE.md, project/ROADMAP.md, project/CHANGELOG.md, index.html, src/main.js, LICENSE, .gitignore
- **Notes**: scaffold only, no game code yet; the mechanic is undecided
