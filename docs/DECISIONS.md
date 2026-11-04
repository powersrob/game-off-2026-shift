# DECISIONS

## 2026-11-03 — Flip is the game

Three concepts were pitched for SHIFT: Flip (perspective shift between top-down and side-view of one
block grid), Gearbox (a gear-shift-only runner), Night Shift (a station-keeping loop). Flip won because
it is the one only this studio would make, it reuses the two-view muscle from The Hope of Asimov, and
the jam scores Theme and Innovation separately. Gearbox is the fallback if the dual authoring proves
too heavy by the end of week one.

## 2026-11-03 — The two views are slices of one voxel grid

Rather than two hand-authored maps per room that merely look alike, a room is a single 3D grid and each
view is an orthogonal slice through the player's cell. One source of truth, no desync, and a solver can
prove every room.
