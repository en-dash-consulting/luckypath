import { useRef, useEffect, useCallback, useState } from "react";
import type {
  LevelData,
  GameState,
  Direction,
  PlacedTile,
  TileType,
  Rotation,
} from "~/engine/types";
import { posKey, NORTH, EAST, SOUTH, WEST } from "~/engine/types";
import { getConnection } from "~/engine/traversal";

const CELL_SIZE = 80;
const BOARD_PADDING = 20;
// Scale factor relative to the original 64px cell size
const S = CELL_SIZE / 64;

// Biome color palettes
const BIOME_COLORS = {
  meadow: { bg: "#e8f5e9", grid: "#a5d6a7", empty: "#c8e6c9", obstacle: "#795548" },
  mushroom: { bg: "#f3e5f5", grid: "#ce93d8", empty: "#e1bee7", obstacle: "#6d4c41" },
  rainbow: { bg: "#e3f2fd", grid: "#90caf9", empty: "#bbdefb", obstacle: "#78909c" },
  grove: { bg: "#fff8e1", grid: "#ffe082", empty: "#fff9c4", obstacle: "#5d4037" },
};

interface GameBoardProps {
  level: LevelData;
  state: GameState;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  highContrast?: boolean;
}

export function GameBoard({
  level,
  state,
  onCellClick,
  onCellRightClick,
  highContrast,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animFrame, setAnimFrame] = useState(0);
  const animRef = useRef<number>(0);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const colors = BIOME_COLORS[level.biome];
  const canvasWidth = level.width * CELL_SIZE + BOARD_PADDING * 2;
  const canvasHeight = level.height * CELL_SIZE + BOARD_PADDING * 2;

  const obstacleSet = new Set(level.obstacles.map((o) => posKey(o.row, o.col)));
  const startKey = posKey(level.start.row, level.start.col);
  const goalKey = posKey(level.goal.row, level.goal.col);

  // Animation loop for Lucky's traversal
  useEffect(() => {
    if (state.phase === "running" || state.phase === "success" || state.phase === "failure") {
      let frame = 0;
      const maxFrames = state.traversalPath.length * 15;
      const animate = () => {
        frame++;
        setAnimFrame(frame);
        if (frame < maxFrames) {
          animRef.current = requestAnimationFrame(animate);
        }
      };
      animRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      setAnimFrame(0);
    }
  }, [state.phase, state.traversalPath.length]);

  // Draw board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply slight perspective transform
    ctx.save();
    ctx.translate(BOARD_PADDING, BOARD_PADDING);

    // Draw grid
    for (let r = 0; r < level.height; r++) {
      for (let c = 0; c < level.width; c++) {
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        const key = posKey(r, c);

        // Cell background
        if (key === startKey) {
          ctx.fillStyle = "#66bb6a";
        } else if (key === goalKey) {
          ctx.fillStyle = "#ffd54f";
        } else if (obstacleSet.has(key)) {
          ctx.fillStyle = colors.obstacle;
        } else if (state.placedTiles.has(key)) {
          ctx.fillStyle = "#e0f2f1";
        } else {
          ctx.fillStyle = colors.empty;
        }

        // Hover highlight
        if (
          hoverCell &&
          hoverCell.row === r &&
          hoverCell.col === c &&
          state.phase === "placing" &&
          state.selectedTileType &&
          !obstacleSet.has(key) &&
          key !== startKey &&
          key !== goalKey
        ) {
          ctx.fillStyle = "#b2dfdb";
        }

        // Draw cell with rounded corners
        const gap = 3 * S;
        drawRoundedRect(ctx, x + gap, y + gap, CELL_SIZE - gap*2, CELL_SIZE - gap*2, 8*S);
        ctx.fill();

        // Cell border
        ctx.strokeStyle = highContrast ? "#333" : colors.grid;
        ctx.lineWidth = highContrast ? 2 : 1;
        drawRoundedRect(ctx, x + gap, y + gap, CELL_SIZE - gap*2, CELL_SIZE - gap*2, 8*S);
        ctx.stroke();

        // Draw cell content
        if (key === startKey) {
          drawStart(ctx, x, y, level.start.direction, highContrast);
        } else if (key === goalKey) {
          drawGoal(ctx, x, y);
        } else if (obstacleSet.has(key)) {
          drawObstacle(ctx, x, y);
        } else if (state.placedTiles.has(key)) {
          const tile = state.placedTiles.get(key)!;
          drawTile(ctx, x, y, tile, highContrast);
        }
      }
    }

    // Draw traversal path animation
    if (
      (state.phase === "running" ||
        state.phase === "success" ||
        state.phase === "failure") &&
      state.traversalPath.length > 0
    ) {
      const pathProgress = Math.min(
        animFrame / 15,
        state.traversalPath.length - 1
      );
      const currentStep = Math.floor(pathProgress);
      const stepFraction = pathProgress - currentStep;

      // Draw path trail
      ctx.strokeStyle = state.phase === "success" ? "#4caf50" : state.phase === "failure" ? "#ef5350" : "#2196f3";
      ctx.lineWidth = 4 * S;
      ctx.setLineDash([8 * S, 5 * S]);
      ctx.beginPath();
      for (let i = 0; i <= Math.min(currentStep, state.traversalPath.length - 1); i++) {
        const p = state.traversalPath[i];
        const px = p.col * CELL_SIZE + CELL_SIZE / 2;
        const py = p.row * CELL_SIZE + CELL_SIZE / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      // Interpolate to current position
      if (currentStep < state.traversalPath.length - 1) {
        const curr = state.traversalPath[currentStep];
        const next = state.traversalPath[currentStep + 1];
        const ix = (curr.col + (next.col - curr.col) * stepFraction) * CELL_SIZE + CELL_SIZE / 2;
        const iy = (curr.row + (next.row - curr.row) * stepFraction) * CELL_SIZE + CELL_SIZE / 2;
        ctx.lineTo(ix, iy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Lucky
      const luckyStep = Math.min(currentStep, state.traversalPath.length - 1);
      let luckyX: number, luckyY: number;
      if (currentStep < state.traversalPath.length - 1) {
        const curr = state.traversalPath[luckyStep];
        const next = state.traversalPath[luckyStep + 1];
        luckyX = (curr.col + (next.col - curr.col) * stepFraction) * CELL_SIZE + CELL_SIZE / 2;
        luckyY = (curr.row + (next.row - curr.row) * stepFraction) * CELL_SIZE + CELL_SIZE / 2;
      } else {
        const last = state.traversalPath[state.traversalPath.length - 1];
        luckyX = last.col * CELL_SIZE + CELL_SIZE / 2;
        luckyY = last.row * CELL_SIZE + CELL_SIZE / 2;
      }

      // Bouncy animation
      const bounce = Math.sin(animFrame * 0.3) * 4 * S;
      drawLucky(ctx, luckyX, luckyY + bounce, state.phase === "failure");

      // Draw fail indicator
      if (state.phase === "failure" && pathProgress >= state.traversalPath.length - 1) {
        const lastPos = state.traversalPath[state.traversalPath.length - 1];
        const fx = lastPos.col * CELL_SIZE + CELL_SIZE / 2;
        const fy = lastPos.row * CELL_SIZE + CELL_SIZE / 2;
        drawFailIndicator(ctx, fx, fy, animFrame);
      }

      // Draw success sparkles
      if (state.phase === "success" && pathProgress >= state.traversalPath.length - 1) {
        drawSuccessSparkles(ctx, luckyX, luckyY, animFrame);
      }
    }

    ctx.restore();
  }, [
    level,
    state,
    animFrame,
    hoverCell,
    colors,
    canvasWidth,
    canvasHeight,
    highContrast,
    obstacleSet,
    startKey,
    goalKey,
  ]);

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const mx = (e.clientX - rect.left) * scaleX - BOARD_PADDING;
      const my = (e.clientY - rect.top) * scaleY - BOARD_PADDING;
      const col = Math.floor(mx / CELL_SIZE);
      const row = Math.floor(my / CELL_SIZE);
      if (row >= 0 && row < level.height && col >= 0 && col < level.width) {
        return { row, col };
      }
      return null;
    },
    [level, canvasWidth, canvasHeight]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (cell) onCellClick(cell.row, cell.col);
    },
    [getCellFromEvent, onCellClick]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const cell = getCellFromEvent(e);
      if (cell) onCellRightClick(cell.row, cell.col);
    },
    [getCellFromEvent, onCellRightClick]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      setHoverCell(cell);
    },
    [getCellFromEvent]
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width: canvasWidth, height: canvasHeight }}
      className="cursor-pointer rounded-xl shadow-lg"
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverCell(null)}
    />
  );
}

// Drawing helpers

function drawRoundedRect(
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

function drawStart(
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

function drawGoal(ctx: CanvasRenderingContext2D, x: number, y: number) {
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

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number) {
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

function drawTile(
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

  const getEdgePoint = (side: Direction): [number, number] => {
    switch (side) {
      case NORTH:
        return [cx, y + 4];
      case SOUTH:
        return [cx, y + CELL_SIZE - 4];
      case EAST:
        return [x + CELL_SIZE - 4, cy];
      case WEST:
        return [x + 4, cy];
    }
  };

  const [ax, ay] = getEdgePoint(sideA);
  const [bx, by] = getEdgePoint(sideB);

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

function drawEdgeArrow(
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

function drawDirectionArrow(
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

function drawLucky(
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

function drawFailIndicator(
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

function drawSuccessSparkles(
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
