// game28 — Game Off 2026 entry. Theme: SHIFT. One file, one canvas, no engine.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

function frame(t) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#eee';
  ctx.font = '32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SHIFT', W / 2, H / 2);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
