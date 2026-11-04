# FLIP — design

One room, two views of it. Hold Shift (or a pad trigger) and the camera flips between
**top-down** and **side-view**. Both views are slices of the same block grid.

## The model

- A room is a grid of blocks, `W` across (x), `D` deep (y), `H` tall (z). Every cell is solid or empty.
- The player stands at an integer cell `(x, y, z)` and must always have a solid block under them (`z-1`).
- **Top-down** shows the horizontal slice at the player's height `z`: you move in x and y, like Zelda 1.
  Solid cells at height `z` are walls. Empty cells with no floor below are pits you cannot enter.
- **Side-view** shows the vertical slice at the player's depth `y`: you move in x and jump in z, like Zelda II.
  Gravity pulls you down to the nearest floor. A jump clears one block up and one across.
- Flipping never moves the player. It only changes which two axes you can move along.
- The goal is a marked cell. Reach it in either view.

## Why it reads

- A pit in side-view is a gap at your depth. Flip to top-down and walk around it on a different y.
- A wall in top-down is a block at your height. Flip to side-view and jump onto it.
- A ledge too high to jump is reached by walking up a ramp that only exists at another depth.

## Rules kept from the deck

- All-integer simulation, no dt. Every room is proved solvable by a breadth-first solver in `tools/`,
  and gated rooms are proved impossible without flipping.
- F1 opens help. Minimum UI font 14 px. No licensed art.
- Controls: arrows or WASD to move, Space/A to jump in side-view, Shift/LT held to flip, R to restart the room.

## Week one

One mechanic, three rooms: a tutorial that needs no flip, one that needs a single flip, one that needs two.
