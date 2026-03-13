/**
 * gameplay-ui zone — highest coupling breadth in the codebase.
 *
 * This route consumes three supplier zones:
 *   1. engine       (getLevelById)
 *   2. components   (GameBoard, TileInventory, MobileInventory, GameHUD, LevelComplete)
 *   3. hooks        (useGameSession)
 *
 * Monitor: if the import count from any single zone grows beyond its
 * current level, treat it as a leading indicator of architectural drift
 * and consider extracting a facade or container component.
 *
 * Current import budget:
 *   engine      — 1 symbol
 *   components  — 5 symbols
 *   hooks       — 1 symbol
 */
import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { getLevelById } from "~/engine";
import { useGameSession } from "~/hooks/useGameSession";
import { GameBoard } from "~/components/GameBoard";
import { TileInventory } from "~/components/TileInventory";
import { MobileInventory } from "~/components/MobileInventory";
import { GameHUD } from "~/components/GameHUD";
import { LevelComplete } from "~/components/LevelComplete";

/**
 * Play route — single source of truth for levelId is useParams().
 *
 * The URL param is the only authority. Navigating to a new level URL
 * triggers a full remount via the key={levelId} prop, which resets
 * all game state cleanly.
 */
export default function Play() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const level = useMemo(
    () => getLevelById(levelId || ""),
    [levelId]
  );

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-800 font-bold text-lg mb-3">Level not found</p>
          <button
            onClick={() => navigate("/worlds")}
            className="text-base text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to levels
          </button>
        </div>
      </div>
    );
  }

  return <PlayLevel key={levelId} level={level} />;
}

function PlayLevel({
  level,
}: {
  level: NonNullable<ReturnType<typeof getLevelById>>;
}) {
  const navigate = useNavigate();

  const {
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
    moveTile,
  } = useGameSession(level);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 flex flex-col items-center px-2 sm:px-4 py-3 gap-2 select-none">
      <GameHUD
        levelName={level.name}
        worldName={world?.name || ""}
        phase={state.phase}
        failReason={state.failReason}
        tilesRemaining={state.remainingInventory.straight + state.remainingInventory.curve}
        onRun={handleRun}
        onReset={handleReset}
        onBack={() => navigate("/worlds")}
      />

      {/* Hint */}
      {level.hint && state.phase === "placing" && tilesUsed === 0 && (
        <div className="text-sm text-amber-800 bg-amber-100/60 px-4 py-2 rounded-xl animate-slideUp max-w-md text-center">
          {level.hint}
        </div>
      )}

      {/* Board + Inventory */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 w-full max-w-2xl">
        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <GameBoard
            level={level}
            state={state}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
            onMoveTile={moveTile}
            highContrast={settings.highContrast}
          />
        </div>

        {/* Desktop: vertical sidebar */}
        <div className="hidden sm:block shrink-0">
          <TileInventory
            remaining={state.remainingInventory}
            selectedType={state.selectedTileType}
            onSelect={handleSelectTile}
            disabled={state.phase !== "placing"}
            removeMode={state.removeMode}
            onToggleRemoveMode={toggleRemoveMode}
          />
        </div>

        {/* Mobile: horizontal bar below board */}
        <div className="sm:hidden">
          <MobileInventory
            remaining={state.remainingInventory}
            selectedType={state.selectedTileType}
            onSelect={handleSelectTile}
            disabled={state.phase !== "placing"}
            removeMode={state.removeMode}
            onToggleRemoveMode={toggleRemoveMode}
          />
        </div>
      </div>

      {showComplete && state.phase === "success" && (
        <LevelComplete
          levelName={level.name}
          tilesUsed={tilesUsed}
          par={level.par}
          clovers={clovers}
          hasNextLevel={!!nextLevel}
          onNext={() => {
            if (nextLevel) {
              navigate(`/play/${nextLevel.id}`, { replace: true });
            }
          }}
          onReplay={handleReset}
          onBack={() => navigate("/worlds")}
        />
      )}
    </div>
  );
}
