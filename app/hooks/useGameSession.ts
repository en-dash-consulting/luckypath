import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameState } from "~/hooks/useGameState";
import { useSave } from "~/hooks/useSave";
import type { SaveData } from "~/services/persistence";
import type { GameState, LevelData, TileType, WorldData } from "~/engine";
import { getWorldById, getNextLevel, isCellForbidden, posKey, calculateClovers } from "~/engine";

/* ── Pure helpers (exported for testing) ──────────────────────────── */

/**
 * Determines which cell-click action to dispatch, or `"none"` if the
 * click should be ignored.  Pure function — no side-effects.
 */
export type CellClickAction = "remove" | "rotate" | "place" | "none";

export function resolveCellClickAction(
  state: Pick<GameState, "phase" | "removeMode" | "placedTiles" | "selectedTileType">,
  level: LevelData,
  row: number,
  col: number,
): CellClickAction {
  if (state.phase !== "placing") return "none";
  if (isCellForbidden(level, row, col)) return "none";
  if (state.removeMode) return "remove";
  if (state.placedTiles.has(posKey(row, col))) return "rotate";
  if (state.selectedTileType) return "place";
  return "none";
}

/**
 * Guard for whether a candidate next level should be offered.
 * Returns `null` when the candidate's world is locked.
 */
export function guardNextLevel(
  candidate: LevelData | null,
  currentWorldId: number,
  unlockedWorlds: number[],
): LevelData | null {
  if (!candidate) return null;
  if (candidate.worldId !== currentWorldId) {
    if (!unlockedWorlds.includes(candidate.worldId)) return null;
  }
  return candidate;
}

/**
 * Public contract for useGameSession.
 *
 * This zone is the sole integration point between three concerns:
 * state (useGameState), persistence (persistence.ts), and routing.
 * Defining an explicit return interface contains blast radius — any
 * schema change to useGameState or persistence.ts that alters this
 * surface is caught at compile time rather than silently propagating.
 *
 * Side-effects:
 *   - When `state.phase` transitions to `"success"`, the level completion
 *     and clover count are persisted via `updateSave`, keeping React state
 *     and localStorage in sync through the single reactive write path.
 */
export interface UseGameSessionReturn {
  state: GameState;
  settings: SaveData["settings"];
  world: WorldData | undefined;
  tilesUsed: number;
  tilesRemaining: number;
  clovers: number;
  showComplete: boolean;
  nextLevel: LevelData | null;
  handleCellClick: (row: number, col: number) => void;
  handleCellRightClick: (row: number, col: number) => void;
  handleRun: () => void;
  handleReset: () => void;
  handleSelectTile: (type: TileType | null) => void;
  toggleRemoveMode: () => void;
  moveTile: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

export function useGameSession(level: LevelData): UseGameSessionReturn {
  const [showComplete, setShowComplete] = useState(false);
  const { save, completeLevel } = useSave();

  const gameState = useGameState(level);
  const { state, selectTile, toggleRemoveMode, placeTile, rotateTile, removeTile, runSimulation, resetBoard } = gameState;

  const world = getWorldById(level.worldId);
  const tilesUsed = state.placedTiles.size;
  const tilesRemaining = state.remainingInventory.straight + state.remainingInventory.curve;

  const clovers = useMemo(() => {
    if (state.phase !== "success") return 0;
    return calculateClovers(tilesUsed, level.par);
  }, [state.phase, tilesUsed, level.par]);

  useEffect(() => {
    if (state.phase === "success") {
      completeLevel(level.id, clovers);
      const timer = setTimeout(() => setShowComplete(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowComplete(false);
    }
  }, [state.phase, level.id, clovers, completeLevel]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const action = resolveCellClickAction(state, level, row, col);
      switch (action) {
        case "remove":  removeTile(row, col); break;
        case "rotate":  rotateTile(row, col); break;
        case "place":   placeTile(row, col);  break;
        case "none":    break;
      }
    },
    [state, level, placeTile, rotateTile, removeTile]
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number) => {
      removeTile(row, col);
    },
    [removeTile]
  );

  const handleRun = useCallback(() => {
    runSimulation();
  }, [runSimulation]);

  const handleReset = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const handleSelectTile = useCallback(
    (type: TileType | null) => {
      selectTile(type);
    },
    [selectTile]
  );

  const nextLevel = useMemo(
    () => guardNextLevel(getNextLevel(level.id), level.worldId, save.unlockedWorlds),
    [level.id, level.worldId, save.unlockedWorlds],
  );

  return {
    state,
    settings: save.settings,
    world,
    tilesUsed,
    tilesRemaining,
    clovers,
    showComplete,
    nextLevel,
    handleCellClick,
    handleCellRightClick,
    handleRun,
    handleReset,
    handleSelectTile,
    toggleRemoveMode,
    moveTile: gameState.moveTile,
  };
}
