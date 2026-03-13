import { useRef, useEffect, useCallback, useState } from "react";
import type { LevelData, GameState } from "~/engine";
import { posKey, getBiomeCanvasColors } from "~/engine";
import { CELL_SIZE, BOARD_PADDING, SCALE as S } from "./board-utils";
import {
  drawRoundedRect,
  drawStart,
  drawGoal,
  drawObstacle,
  drawTile,
  drawRotateHint,
  drawLucky,
  drawFailIndicator,
  drawSuccessSparkles,
} from "./canvas-drawing";

interface GameBoardProps {
  level: LevelData;
  state: GameState;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onMoveTile?: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  highContrast?: boolean;
}

export function GameBoard({
  level,
  state,
  onCellClick,
  onCellRightClick,
  onMoveTile,
  highContrast,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animFrame, setAnimFrame] = useState(0);
  const animRef = useRef<number>(0);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  // Drag state
  const [dragState, setDragState] = useState<{
    fromRow: number;
    fromCol: number;
    cursorX: number;
    cursorY: number;
  } | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const colors = getBiomeCanvasColors(level.biome);
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

        // Hover highlight (empty cell with tile selected, or placed tile for rotation)
        const isHovered = hoverCell && hoverCell.row === r && hoverCell.col === c;
        if (
          isHovered &&
          state.phase === "placing" &&
          !obstacleSet.has(key) &&
          key !== startKey &&
          key !== goalKey &&
          (state.selectedTileType || state.placedTiles.has(key))
        ) {
          ctx.fillStyle = state.placedTiles.has(key) ? "#b2dfdb" : "#b2dfdb";
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
          // Show rotate hint on hover during placing phase
          if (isHovered && state.phase === "placing") {
            drawRotateHint(ctx, x, y);
          }
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

    // Draw ghost tile while dragging
    if (dragState && state.phase === "placing") {
      const tile = state.placedTiles.get(posKey(dragState.fromRow, dragState.fromCol));
      if (tile) {
        ctx.globalAlpha = 0.6;
        const gx = dragState.cursorX - BOARD_PADDING - CELL_SIZE / 2;
        const gy = dragState.cursorY - BOARD_PADDING - CELL_SIZE / 2;
        drawTile(ctx, gx, gy, tile, highContrast);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }, [
    level,
    state,
    animFrame,
    hoverCell,
    dragState,
    colors,
    canvasWidth,
    canvasHeight,
    highContrast,
    obstacleSet,
    startKey,
    goalKey,
  ]);

  // Unified coordinate helpers for mouse and touch
  const canvasCoordsFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const mx = (clientX - rect.left) * (canvasWidth / rect.width);
      const my = (clientY - rect.top) * (canvasHeight / rect.height);
      return { mx, my };
    },
    [canvasWidth, canvasHeight]
  );

  const cellFromCoords = useCallback(
    (mx: number, my: number) => {
      const cx = mx - BOARD_PADDING;
      const cy = my - BOARD_PADDING;
      const col = Math.floor(cx / CELL_SIZE);
      const row = Math.floor(cy / CELL_SIZE);
      if (row >= 0 && row < level.height && col >= 0 && col < level.width) {
        return { row, col };
      }
      return null;
    },
    [level]
  );

  const cellFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const coords = canvasCoordsFromClient(clientX, clientY);
      if (!coords) return null;
      return cellFromCoords(coords.mx, coords.my);
    },
    [canvasCoordsFromClient, cellFromCoords]
  );

  const DRAG_THRESHOLD = 8;

  // Shared pointer logic
  const handlePointerDown = useCallback(
    (clientX: number, clientY: number) => {
      dragStartPos.current = { x: clientX, y: clientY };
      isDragging.current = false;
    },
    []
  );

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const cell = cellFromClient(clientX, clientY);
      setHoverCell(cell);

      if (!dragStartPos.current) return;

      const coords = canvasCoordsFromClient(clientX, clientY);
      if (!coords) return;

      if (!isDragging.current) {
        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD && state.phase === "placing") {
          const startCoords = canvasCoordsFromClient(dragStartPos.current.x, dragStartPos.current.y);
          if (!startCoords) return;
          const startCell = cellFromCoords(startCoords.mx, startCoords.my);
          if (startCell && state.placedTiles.has(posKey(startCell.row, startCell.col))) {
            isDragging.current = true;
            setDragState({ fromRow: startCell.row, fromCol: startCell.col, cursorX: coords.mx, cursorY: coords.my });
          }
        }
        return;
      }

      setDragState((d) => d ? { ...d, cursorX: coords.mx, cursorY: coords.my } : null);
    },
    [cellFromClient, cellFromCoords, canvasCoordsFromClient, state.phase, state.placedTiles]
  );

  const handlePointerUp = useCallback(
    (clientX: number, clientY: number) => {
      if (isDragging.current && dragState && onMoveTile) {
        const cell = cellFromClient(clientX, clientY);
        if (cell) {
          onMoveTile(dragState.fromRow, dragState.fromCol, cell.row, cell.col);
        }
      } else if (dragStartPos.current && !isDragging.current) {
        const cell = cellFromClient(clientX, clientY);
        if (cell) onCellClick(cell.row, cell.col);
      }

      dragStartPos.current = null;
      isDragging.current = false;
      setDragState(null);
    },
    [dragState, cellFromClient, onCellClick, onMoveTile]
  );

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY);
  }, [handlePointerDown]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    handlePointerUp(e.clientX, e.clientY);
  }, [handlePointerUp]);

  // Attach touch listeners natively with { passive: false } so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      handlePointerDown(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      handlePointerMove(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length < 1) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      handlePointerUp(t.clientX, t.clientY);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  const handleRightClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const cell = cellFromClient(e.clientX, e.clientY);
      if (cell) onCellRightClick(cell.row, cell.col);
    },
    [cellFromClient, onCellRightClick]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCell(null);
    if (isDragging.current) {
      dragStartPos.current = null;
      isDragging.current = false;
      setDragState(null);
    }
  }, []);

  return (
    <div className="max-w-full" style={{ width: canvasWidth }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto", aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
        className={`rounded-xl shadow-lg touch-none ${dragState ? "cursor-grabbing" : "cursor-pointer"}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onContextMenu={handleRightClick}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
