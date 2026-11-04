// FLIP — Game Off 2026 entry (theme SHIFT). One canvas, no engine; rules.js loads first and supplies PARSED/newState/act.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const CW = canvas.width, CH = canvas.height;
const B = 48;
const MOVE_FRAMES = 6, FLIP_FRAMES = 12;
const HELP_BTN = { x: CW - 112, y: 8, w: 104, h: 28 };

let S = newState(0);
let total = 0;
let cleared = false; // all rooms done
let helpOpen = false;
let frameNo = 0;
let flipT = 0, flipFrom = 'top';
let tween = { t: MOVE_FRAMES, from: { x: S.x, y: S.y, z: S.z } };

try { if (!localStorage.getItem('flip.helpSeen')) { helpOpen = true; localStorage.setItem('flip.helpSeen', '1'); } } catch (e) { /* storage may be blocked */ }

function load(n) {
  S = newState(n);
  tween = { t: MOVE_FRAMES, from: { x: S.x, y: S.y, z: S.z } };
  flipT = 0;
  window._flip.S = S;
  return S;
}

// instant skips animation so the harness sees the result immediately.
function doAction(a, instant) {
  if (a === 'restart') {
    if (cleared) { total = 0; cleared = false; load(0); } else load(S.n);
    return true;
  }
  const from = { x: S.x, y: S.y, z: S.z };
  const fromView = S.view;
  const wasWon = S.won;
  const changed = act(S, a);
  if (!changed) return false;
  if (a === 'flip') {
    if (!instant) { flipT = FLIP_FRAMES; flipFrom = fromView; }
  } else {
    tween = { t: instant ? MOVE_FRAMES : 0, from };
  }
  if (S.won && !wasWon) {
    total += S.moves;
    if (S.n === PARSED.length - 1) cleared = true;
  }
  return true;
}

function nextRoom() {
  if (S.won && !cleared) load(S.n + 1);
}

function input(a) {
  if (helpOpen || flipT > 0) return;
  if (cleared) return;
  if (S.won) return;
  doAction(a, false);
}

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  ' ': 'jump', Shift: 'flip',
};

addEventListener('keydown', (e) => {
  if (e.key === 'F1' || e.key === '?') { e.preventDefault(); helpOpen = !helpOpen; return; }
  if (e.key === 'Escape') { helpOpen = false; return; }
  if (e.key === 'r' || e.key === 'R') { if (!helpOpen) doAction('restart', false); return; }
  if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { if (!helpOpen) nextRoom(); return; }
  const a = KEYS[e.key];
  if (!a) return;
  e.preventDefault();
  if (e.repeat && (a === 'flip' || a === 'jump')) return;
  input(a);
});

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * CW / r.width, my = (e.clientY - r.top) * CH / r.height;
  if (mx >= HELP_BTN.x && mx <= HELP_BTN.x + HELP_BTN.w && my >= HELP_BTN.y && my <= HELP_BTN.y + HELP_BTN.h) helpOpen = !helpOpen;
  else if (helpOpen) helpOpen = false;
});

// Gamepad: edge-triggered buttons, stick repeats every few frames so a held direction keeps walking.
const pad = { prev: [], held: 0, lastDir: '' };
function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = pads && Array.from(pads).find((p) => p && p.connected);
  if (!gp) return;
  const btn = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const edge = (i) => btn(i) && !pad.prev[i];
  if (edge(0)) { if (S.won && !cleared) nextRoom(); else input('jump'); }
  if (edge(6) || edge(7)) input('flip');
  if (edge(9)) doAction('restart', false);
  let dir = '';
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  if (btn(14) || ax < -0.25) dir = 'left';
  else if (btn(15) || ax > 0.25) dir = 'right';
  else if (btn(12) || ay < -0.25) dir = 'up';
  else if (btn(13) || ay > 0.25) dir = 'down';
  if (dir && dir === pad.lastDir) pad.held++; else pad.held = 0;
  if (dir && (pad.held === 0 || (pad.held > 14 && pad.held % 7 === 0))) input(dir);
  pad.lastDir = dir;
  pad.prev = gp.buttons.map((b) => b.pressed);
}

// ---- drawing ----

const C = {
  bg: '#12151f', floor: '#252c40', floorAlt: '#2b3350', pit: '#07080c',
  wall: '#7184b0', wallTop: '#93a6d2', edge: 'rgba(0,0,0,0.45)',
  player: '#ffd45a', goal: '#5af2a8', text: '#e8ecf8',
};

function block(px, py, color, topColor) {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, B, B);
  if (topColor) { ctx.fillStyle = topColor; ctx.fillRect(px + 1, py + 1, B - 2, 8); }
  ctx.strokeStyle = C.edge;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, B - 1, B - 1);
}

function blob(cx, cy, dx, dy) {
  ctx.fillStyle = C.player;
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a07f10'; ctx.lineWidth = 2; ctx.stroke();
  for (const s of [-1, 1]) {
    const ex = cx + dx * 6 + (dy ? s * 6 : 0), ey = cy + dy * 6 + (dx ? s * 6 : 0) - (dx && !dy ? 2 : 0);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex + dx * 2, ey + dy * 2, 2.4, 0, Math.PI * 2); ctx.fill();
  }
}

function ring(cx, cy) {
  const pulse = 1 + 0.12 * Math.sin(frameNo / 8);
  ctx.strokeStyle = C.goal; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, 17 * pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.25; ctx.fillStyle = C.goal;
  ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawView(view) {
  const r = PARSED[S.n];
  const cols = r.W, rows = view === 'top' ? r.D : r.H;
  const ox = Math.floor((CW - cols * B) / 2);
  const oy = Math.floor(48 + (CH - 48 - rows * B) / 2);
  const k = tween.t >= MOVE_FRAMES ? 1 : tween.t / MOVE_FRAMES;
  const lerp = (a, b) => a + (b - a) * k;
  const g = r.goal;
  if (view === 'top') {
    for (let y = 0; y < r.D; y++) {
      for (let x = 0; x < r.W; x++) {
        const px = ox + x * B, py = oy + y * B;
        if (r.solid(x, y, S.z)) block(px, py, C.wall, C.wallTop);
        else if (r.solid(x, y, S.z - 1)) block(px, py, (x + y) % 2 ? C.floor : C.floorAlt);
        else block(px, py, C.pit);
      }
    }
    if (g.z === S.z) ring(ox + g.x * B + B / 2, oy + g.y * B + B / 2);
    blob(ox + lerp(tween.from.x, S.x) * B + B / 2, oy + lerp(tween.from.y, S.y) * B + B / 2, S.fdx, S.fdy);
  } else {
    for (let z = 0; z < r.H; z++) {
      for (let x = 0; x < r.W; x++) {
        const px = ox + x * B, py = oy + (r.H - 1 - z) * B;
        if (r.solid(x, S.y, z)) block(px, py, C.wall, C.wallTop);
        else { ctx.fillStyle = (x + z) % 2 ? '#171b29' : '#1a1f30'; ctx.fillRect(px, py, B, B); }
      }
    }
    if (g.y === S.y) ring(ox + g.x * B + B / 2, oy + (r.H - 1 - g.z) * B + B / 2);
    blob(ox + lerp(tween.from.x, S.x) * B + B / 2, oy + (r.H - 1 - lerp(tween.from.z, S.z)) * B + B / 2, S.fx, 0);
  }
}

function text(str, x, y, size, align, color) {
  ctx.font = `${Math.max(size, 14)}px monospace`;
  ctx.textAlign = align || 'left';
  ctx.fillStyle = color || C.text;
  ctx.fillText(str, x, y);
}

function drawHelp() {
  ctx.fillStyle = 'rgba(8,10,16,0.92)';
  ctx.fillRect(160, 60, 640, 420);
  ctx.strokeStyle = C.wallTop; ctx.lineWidth = 2; ctx.strokeRect(160, 60, 640, 420);
  const lines = [
    'FLIP: one room, two views of it',
    '',
    'Arrows / WASD   move (top-down: x and y, side: x)',
    'Space           jump one up, one across (side view)',
    'Shift           flip view (toggle on press)',
    'R               restart room',
    'Enter / N       next room after the goal',
    'F1 or ?         this help      Esc  close',
    '',
    'Gamepad: stick/dpad move, A jump,',
    '         LT or RT flip, Start restart',
    '',
    'Flipping never moves you. Reach the glowing ring.',
  ];
  lines.forEach((l, i) => text(l, 184, 100 + i * 28, i === 0 ? 20 : 16, 'left', i === 0 ? C.goal : C.text));
}

function frame() {
  frameNo++;
  pollPad();
  if (tween.t < MOVE_FRAMES) tween.t++;
  if (flipT > 0) flipT--;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CW, CH);

  // Flip animation squashes the old view to a line, then opens the new one.
  const animating = flipT > 0;
  const view = animating && flipT > FLIP_FRAMES / 2 ? flipFrom : S.view;
  let sy = 1;
  if (animating) sy = Math.abs(flipT - FLIP_FRAMES / 2) / (FLIP_FRAMES / 2);
  ctx.save();
  ctx.translate(0, CH / 2 + 24);
  ctx.scale(1, Math.max(sy, 0.02));
  ctx.translate(0, -(CH / 2 + 24));
  drawView(view);
  ctx.restore();

  text(`ROOM ${S.n + 1} / ${PARSED.length}`, 16, 28, 18);
  text(S.view === 'top' ? 'TOP-DOWN' : 'SIDE', 220, 28, 18, 'left', C.goal);
  text(`MOVES ${S.moves}`, 360, 28, 18);
  ctx.fillStyle = '#252c40'; ctx.fillRect(HELP_BTN.x, HELP_BTN.y, HELP_BTN.w, HELP_BTN.h);
  ctx.strokeStyle = C.wallTop; ctx.lineWidth = 1; ctx.strokeRect(HELP_BTN.x + 0.5, HELP_BTN.y + 0.5, HELP_BTN.w, HELP_BTN.h);
  text('? Help (F1)', HELP_BTN.x + HELP_BTN.w / 2, HELP_BTN.y + 20, 14, 'center');

  if (S.won) {
    ctx.fillStyle = 'rgba(8,10,16,0.82)';
    ctx.fillRect(0, CH / 2 - 70, CW, 140);
    if (cleared) {
      text('ALL ROOMS CLEARED', CW / 2, CH / 2 - 10, 40, 'center', C.goal);
      text(`Total moves: ${total}   -   R to replay`, CW / 2, CH / 2 + 36, 20, 'center');
    } else {
      text('ROOM CLEAR', CW / 2, CH / 2 - 10, 40, 'center', C.goal);
      text('Enter or N for the next room   -   R to retry', CW / 2, CH / 2 + 36, 20, 'center');
    }
  }
  if (helpOpen) drawHelp();
  requestAnimationFrame(frame);
}

window._flip = {
  S,
  step(a) { return doAction(a, true); },
  load,
  state() { return { ...S, total, cleared }; },
};

requestAnimationFrame(frame);
