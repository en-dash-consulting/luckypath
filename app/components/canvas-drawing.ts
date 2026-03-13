/**
 * Canvas drawing helpers for the game board.
 *
 * Extracted from GameBoard.tsx so they can be tested in isolation
 * and reused by other canvas consumers. All functions are pure —
 * they receive a CanvasRenderingContext2D and draw into it without
 * side-effects beyond mutation of the context.
 */
import type { Direction, PlacedTile } from "~/engine";
import { NORTH, EAST, SOUTH, WEST, getConnection, getEdgePoint } from "~/engine";
import { CELL_SIZE, SCALE as S } from "./board-utils";

// ── Primitive shapes ─────────────────────────────────────────────

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Cell content drawers ─────────────────────────────────────────

export function drawStart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Direction,
  highContrast?: boolean
) {
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  // Clover shape
  ctx.fillStyle = "#2e7d32";
  const petalSize = 10 * S;
  const offsets = [
    [-7 * S, -7 * S],
    [7 * S, -7 * S],
    [0, -12 * S],
  ];
  for (const [ox, oy] of offsets) {
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy + 4 * S, petalSize, 0, Math.PI * 2);
    ctx.fill();
  }
  // Stem
  ctx.strokeStyle = "#1b5e20";
  ctx.lineWidth = 2.5 * S;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4 * S);
  ctx.lineTo(cx + 2 * S, cy + 18 * S);
  ctx.stroke();

  // Direction arrow
  drawDirectionArrow(ctx, cx, cy, dir, "#fff", highContrast);
}

export function drawGoal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  // Pot body — tapered cauldron shape
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.moveTo(cx - 12*S, cy - 4*S);
  ctx.lineTo(cx - 17*S, cy + 14*S);
  ctx.quadraticCurveTo(cx, cy + 24*S, cx + 17*S, cy + 14*S);
  ctx.lineTo(cx + 12*S, cy - 4*S);
  ctx.closePath();
  ctx.fill();

  // Pot rim
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4*S, 14*S, 5*S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4e342e";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4*S, 14*S, 5*S, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Pot highlight stripe
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.moveTo(cx - 10*S, cy);
  ctx.lineTo(cx - 13*S, cy + 10*S);
  ctx.quadraticCurveTo(cx, cy + 17*S, cx + 13*S, cy + 10*S);
  ctx.lineTo(cx + 10*S, cy);
  ctx.quadraticCurveTo(cx, cy + 7*S, cx - 10*S, cy);
  ctx.fill();

  // Gold coins spilling over top
  const goldColors = ["#ffd54f", "#ffca28", "#ffb300"];
  const coins = [
    { x: cx - 6*S, y: cy - 10*S, r: 6*S },
    { x: cx + 6*S, y: cy - 10*S, r: 6*S },
    { x: cx, y: cy - 14*S, r: 7*S },
    { x: cx - 10*S, y: cy - 6*S, r: 5*S },
    { x: cx + 10*S, y: cy - 6*S, r: 5*S },
  ];
  coins.forEach((coin, i) => {
    ctx.fillStyle = "#f9a825";
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y + 1*S, coin.r, coin.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = goldColors[i % goldColors.length];
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y, coin.r, coin.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Gold shine sparkles
  ctx.fillStyle = "#fff9c4";
  ctx.beginPath();
  ctx.arc(cx - 4*S, cy - 15*S, 2*S, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 7*S, cy - 11*S, 1.5*S, 0, Math.PI * 2);
  ctx.fill();
}

export function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  // Rock shape
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.moveTo(cx - 17*S, cy + 12*S);
  ctx.lineTo(cx - 12*S, cy - 10*S);
  ctx.lineTo(cx, cy - 17*S);
  ctx.lineTo(cx + 15*S, cy - 7*S);
  ctx.lineTo(cx + 17*S, cy + 12*S);
  ctx.closePath();
  ctx.fill();

  // Rock highlight
  ctx.fillStyle = "#a1887f";
  ctx.beginPath();
  ctx.moveTo(cx - 7*S, cy - 5*S);
  ctx.lineTo(cx + 2*S, cy - 12*S);
  ctx.lineTo(cx + 10*S, cy - 5*S);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: PlacedTile,
  highContrast?: boolean
) {
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;
  const [sideA, sideB] = getConnection(tile.type, tile.rotation);

  // Draw path shape
  ctx.strokeStyle = highContrast ? "#000" : "#26a69a";
  ctx.lineWidth = highContrast ? 7*S : 10*S;
  ctx.lineCap = "round";

  const [ax, ay] = getEdgePoint(sideA, x, y, CELL_SIZE);
  const [bx, by] = getEdgePoint(sideB, x, y, CELL_SIZE);

  if (tile.type === "straight") {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  } else {
    // Curved path for turns
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cx, cy, bx, by);
    ctx.stroke();
  }

  // Direction indicators (small arrows at edges)
  drawEdgeArrow(ctx, sideA, x, y, highContrast);
  drawEdgeArrow(ctx, sideB, x, y, highContrast);
}

// ── Arrow helpers ────────────────────────────────────────────────

export function drawEdgeArrow(
  ctx: CanvasRenderingContext2D,
  side: Direction,
  x: number,
  y: number,
  highContrast?: boolean
) {
  const s = 6 * S;
  ctx.fillStyle = highContrast ? "#000" : "#00897b";

  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  ctx.beginPath();
  switch (side) {
    case NORTH:
      ctx.moveTo(cx, y + 2);
      ctx.lineTo(cx - s, y + 2 + s);
      ctx.lineTo(cx + s, y + 2 + s);
      break;
    case SOUTH:
      ctx.moveTo(cx, y + CELL_SIZE - 2);
      ctx.lineTo(cx - s, y + CELL_SIZE - 2 - s);
      ctx.lineTo(cx + s, y + CELL_SIZE - 2 - s);
      break;
    case EAST:
      ctx.moveTo(x + CELL_SIZE - 2, cy);
      ctx.lineTo(x + CELL_SIZE - 2 - s, cy - s);
      ctx.lineTo(x + CELL_SIZE - 2 - s, cy + s);
      break;
    case WEST:
      ctx.moveTo(x + 2, cy);
      ctx.lineTo(x + 2 + s, cy - s);
      ctx.lineTo(x + 2 + s, cy + s);
      break;
  }
  ctx.closePath();
  ctx.fill();
}

export function drawDirectionArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: Direction,
  color: string,
  highContrast?: boolean
) {
  const size = 12 * S;
  ctx.fillStyle = color;
  ctx.strokeStyle = highContrast ? "#000" : "transparent";
  ctx.lineWidth = highContrast ? 2 * S : 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((dir * Math.PI) / 2 - Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size / 2, -size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.closePath();
  ctx.fill();
  if (highContrast) ctx.stroke();
  ctx.restore();
}

// ── Character & effects ──────────────────────────────────────────

export function drawLucky(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isFailing: boolean
) {
  // Body
  ctx.fillStyle = isFailing ? "#ef9a9a" : "#66bb6a";
  ctx.beginPath();
  ctx.arc(x, y, 15*S, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = isFailing ? "#e57373" : "#2e7d32";
  ctx.beginPath();
  ctx.moveTo(x - 12*S, y - 10*S);
  ctx.lineTo(x, y - 27*S);
  ctx.lineTo(x + 12*S, y - 10*S);
  ctx.closePath();
  ctx.fill();

  // Hat brim
  ctx.fillStyle = isFailing ? "#ef5350" : "#1b5e20";
  ctx.fillRect(x - 14*S, y - 11*S, 28*S, 5*S);

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - 5*S, y - 2*S, 4*S, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5*S, y - 2*S, 4*S, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x - 4*S, y - 2*S, 2*S, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6*S, y - 2*S, 2*S, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  if (isFailing) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2*S;
    ctx.beginPath();
    ctx.arc(x, y + 7*S, 5*S, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(x, y + 5*S, 4*S, 0, Math.PI);
    ctx.fill();
  }
}

export function drawFailIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number
) {
  const opacity = Math.max(0, Math.sin(frame * 0.1) * 0.7 + 0.3);
  ctx.strokeStyle = `rgba(244, 67, 54, ${opacity})`;
  ctx.lineWidth = 4 * S;
  const s = 20 * S;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
}

export function drawRotateHint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  const cx = x + CELL_SIZE - 14 * S;
  const cy = y + 14 * S;
  const r = 7 * S;

  // Background circle
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2 * S, 0, Math.PI * 2);
  ctx.fill();

  // Circular arrow
  ctx.strokeStyle = "#0d9488";
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI * 0.8, Math.PI * 0.5);
  ctx.stroke();

  // Arrowhead
  const tipAngle = Math.PI * 0.5;
  const tipX = cx + r * Math.cos(tipAngle);
  const tipY = cy + r * Math.sin(tipAngle);
  const aSize = 4 * S;
  ctx.fillStyle = "#0d9488";
  ctx.beginPath();
  ctx.moveTo(tipX + aSize, tipY - aSize * 0.3);
  ctx.lineTo(tipX - aSize * 0.3, tipY - aSize);
  ctx.lineTo(tipX, tipY + aSize * 0.5);
  ctx.closePath();
  ctx.fill();
}

export function drawSuccessSparkles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number
) {
  const sparkleColors = ["#ffd54f", "#fff176", "#ffee58", "#ffca28"];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.05;
    const dist = (25 + Math.sin(frame * 0.15 + i) * 12) * S;
    const sx = x + Math.cos(angle) * dist;
    const sy = y + Math.sin(angle) * dist;
    const size = (2.5 + Math.sin(frame * 0.2 + i * 0.5) * 2.5) * S;

    ctx.fillStyle = sparkleColors[i % sparkleColors.length];
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fill();
  }
}
