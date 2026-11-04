// FLIP rules and rooms: pure integer logic. Classic script (not a module) so file:// works; solve.mjs loads it via require.

// Layers run bottom (z=0) to top; each layer has D rows of W chars: # solid, . empty, P start, G goal.
const ROOMS = [
  // Room 1: walk around a wall, no flip needed.
  [
    ['##########', '##########', '##########', '##########', '##########'],
    ['..........', '....#.....', '.P..#...G.', '....#.....', '..........'],
    ['..........', '..........', '..........', '..........', '..........'],
  ],
  // Room 2: a full-width wall; flip, jump onto it, drop down the far side.
  [
    ['##########', '##########', '##########', '##########', '##########'],
    ['....#.....', '....#.....', '.P..#...G.', '....#.....', '....#.....'],
    ['..........', '..........', '..........', '..........', '..........'],
  ],
  // Room 3: jump the low wall in side view, then flip back to walk around the tall wall.
  [
    ['############', '############', '############', '############', '############'],
    ['...#........', '...#....#...', '.P.#....#.G.', '...#....#...', '...#....#...'],
    ['............', '........#...', '........#...', '........#...', '........#...'],
    ['............', '............', '............', '............', '............'],
  ],
];

function parseRoom(layers) {
  const H = layers.length, D = layers[0].length, W = layers[0][0].length;
  let start = null, goal = null;
  for (let z = 0; z < H; z++) {
    for (let y = 0; y < D; y++) {
      for (let x = 0; x < W; x++) {
        const c = layers[z][y][x];
        if (c === 'P') start = { x, y, z };
        if (c === 'G') goal = { x, y, z };
      }
    }
  }
  // Out-of-range x/y reads as solid so the room is walled in; z outside reads as air.
  const solid = (x, y, z) => {
    if (x < 0 || y < 0 || x >= W || y >= D) return true;
    if (z < 0 || z >= H) return false;
    return layers[z][y][x] === '#';
  };
  return { W, D, H, start, goal, solid };
}

const PARSED = ROOMS.map(parseRoom);

function newState(n) {
  const r = PARSED[n];
  return { n, x: r.start.x, y: r.start.y, z: r.start.z, view: 'top', fx: 1, fdx: 1, fdy: 0, moves: 0, won: false };
}

// Highest floor at or below z in this column, as the z a body would stand at; -1 means a pit.
function land(r, x, y, z) {
  for (let zz = z; zz >= 1; zz--) if (r.solid(x, y, zz - 1)) return zz;
  return -1;
}

// Applies one action in place; returns true if the state changed.
function act(S, a) {
  if (a === 'restart') {
    Object.assign(S, newState(S.n));
    return true;
  }
  if (S.won) return false;
  const r = PARSED[S.n];
  let moved = false;
  if (a === 'flip') {
    S.view = S.view === 'top' ? 'side' : 'top';
    moved = true;
  } else if (a === 'left' || a === 'right') {
    const dx = a === 'left' ? -1 : 1;
    S.fx = dx; S.fdx = dx; S.fdy = 0;
    const nx = S.x + dx;
    if (S.view === 'top') {
      if (!r.solid(nx, S.y, S.z) && r.solid(nx, S.y, S.z - 1)) { S.x = nx; moved = true; }
    } else if (!r.solid(nx, S.y, S.z)) {
      const lz = land(r, nx, S.y, S.z);
      if (lz >= 0) { S.x = nx; S.z = lz; moved = true; }
    }
  } else if (a === 'up' || a === 'down') {
    if (S.view === 'top') {
      const dy = a === 'up' ? -1 : 1;
      S.fdx = 0; S.fdy = dy;
      const ny = S.y + dy;
      if (!r.solid(S.x, ny, S.z) && r.solid(S.x, ny, S.z - 1)) { S.y = ny; moved = true; }
    }
  } else if (a === 'jump') {
    if (S.view === 'side' && S.z + 1 < r.H) {
      const nx = S.x + S.fx;
      if (!r.solid(S.x, S.y, S.z + 1) && !r.solid(nx, S.y, S.z + 1)) {
        const lz = land(r, nx, S.y, S.z + 1);
        if (lz >= 0) { S.x = nx; S.z = lz; moved = true; }
      }
    }
  }
  if (moved) {
    S.moves++;
    if (S.x === r.goal.x && S.y === r.goal.y && S.z === r.goal.z) S.won = true;
  }
  return moved;
}

// Globals so a bundler (which gives each file its own scope) still shares them with main.js.
if (typeof globalThis !== 'undefined') Object.assign(globalThis, { ROOMS, PARSED, newState, act });
if (typeof module !== 'undefined') module.exports = { ROOMS, PARSED, newState, act };
