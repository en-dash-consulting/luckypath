import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameState } from "~/hooks/useGameState";
import { completeLevel, loadSave } from "~/lib/persistence";
import type { SaveData } from "~/lib/persistence";
import type { GameState, LevelData, TileType } from "~/engine";
import { levels, worlds, isCellForbidden, posKey } from "~/engine";
import type { WorldData } from "~/engine";

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
 *   - When `state.phase` transitions to `"success"`, `completeLevel()`
 *     is called internally to persist the completion and clover count
 *     to localStorage. If `onLevelCompleted` is provided via options,
 *     it fires after persistence so callers can react.
 */
export interface UseGameSessionReturn {
  state: GameState;
  settings: SaveData["settings"];
  world: WorldData | undefined;
  tilesUsed: number;
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

export interface UseGameSessionOptions {
  /**
   * Optional callback invoked after a level is persisted as complete.
   * This makes the internal completeLevel() write side-effect observable
   * and testable without mocking localStorage.
   */
  onLevelCompleted?: (levelId: string, clovers: number) => void;
}

export function useGameSession(level: LevelData, options: UseGameSessionOptions = {}): UseGameSessionReturn {
  const { onLevelCompleted } = options;
  const [showComplete, setShowComplete] = useState(false);
  const [settings, setSettings] = useState<SaveData["settings"]>({ fastMode: false, highContrast: false });

  useEffect(() => {
    const save = loadSave();
    setSettings(save.settings);
  }, []);

  const gameState = useGameState(level);
  const { state, selectTile, toggleRemoveMode, placeTile, rotateTile, removeTile, runSimulation, resetBoard } = gameState;

  const world = worlds.find((w) => w.id === level.worldId);
  const tilesUsed = state.placedTiles.size;

  const clovers = useMemo(() => {
    if (state.phase !== "success") return 0;
    if (tilesUsed <= level.par) return 3;
    if (tilesUsed <= level.par + 1) return 2;
    return 1;
  }, [state.phase, tilesUsed, level.par]);

  useEffect(() => {
    if (state.phase === "success") {
      completeLevel(level.id, clovers);
      onLevelCompleted?.(level.id, clovers);
      const timer = setTimeout(() => setShowComplete(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowComplete(false);
    }
  }, [state.phase, level.id, clovers, onLevelCompleted]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.phase !== "placing") return;
      if (isCellForbidden(level, row, col)) return;

      if (state.removeMode) {
        removeTile(row, col);
        return;
      }

      if (state.placedTiles.has(posKey(row, col))) {
        rotateTile(row, col);
        return;
      }

      if (state.selectedTileType) {
        placeTile(row, col);
      }
    },
    [state.phase, state.selectedTileType, state.placedTiles, state.removeMode, level, placeTile, rotateTile, removeTile]
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

  const currentIdx = levels.findIndex((l) => l.id === level.id);
  const nextLevel = useMemo(() => {
    if (currentIdx < 0 || currentIdx >= levels.length - 1) return null;
    const candidate = levels[currentIdx + 1];
    // Guard: don't offer a next level whose world is locked
    const save = loadSave();
    if (
      candidate.worldId !== level.worldId &&
      !save.unlockedWorlds.includes(candidate.worldId)
    ) {
      return null;
    }
    return candidate;
  }, [currentIdx, level.worldId]);

  return {
    state,
    settings,
    world,
    tilesUsed,
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
