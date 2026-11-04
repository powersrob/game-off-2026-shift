// Breadth-first proof that every room is solvable and that the gated rooms really need their flips.
import { createRequire } from 'node:module';
const { ROOMS, newState, act } = createRequire(import.meta.url)('../src/rules.js');

const ACTIONS = ['up', 'down', 'left', 'right', 'jump', 'flip'];
// Flips the shortest honest solution must use, per room.
const NEED_FLIPS = [0, 1, 2];

function bfs(n, maxFlips) {
  const key = (S, f) => `${S.x},${S.y},${S.z},${S.view},${S.fx},${f}`;
  const start = { S: newState(n), f: 0, path: [] };
  const seen = new Set([key(start.S, 0)]);
  let queue = [start];
  while (queue.length) {
    const next = [];
    for (const cur of queue) {
      for (const a of ACTIONS) {
        const f = cur.f + (a === 'flip' ? 1 : 0);
        if (f > maxFlips) continue;
        const S = { ...cur.S };
        if (!act(S, a)) continue;
        const path = [...cur.path, a];
        if (S.won) return path;
        const k = key(S, f);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ S, f, path });
      }
    }
    queue = next;
  }
  return null;
}

let bad = 0;
ROOMS.forEach((_, n) => {
  const best = bfs(n, Infinity);
  const noFlip = bfs(n, 0);
  let minFlips = -1;
  for (let k = 0; k <= 8 && minFlips < 0; k++) if (bfs(n, k)) minFlips = k;
  console.log(`room ${n + 1}: solvable ${best ? 'yes' : 'NO'}, shortest ${best ? best.length : '-'} moves, without flipping ${noFlip ? 'yes' : 'no'}, min flips ${minFlips}`);
  if (best) console.log(`  ${best.join(' ')}`);
  if (!best) { console.log('  FAIL: unsolvable'); bad++; }
  else if (minFlips !== NEED_FLIPS[n]) { console.log(`  FAIL: expected min flips ${NEED_FLIPS[n]}`); bad++; }
});
process.exit(bad ? 1 : 0);
