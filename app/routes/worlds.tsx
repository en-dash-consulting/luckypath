/**
 * world-selection-ui zone — route handler for the level-select screen.
 *
 * Layer: routes (top of the dependency DAG: engine → hooks → components → routes).
 * This file is a route handler that sits ABOVE hooks in the dependency hierarchy.
 * It consumes hooks but hooks must never import from routes.
 *
 * Following the same orchestration-only pattern as home.tsx — all presentation
 * (SVG, grid, layout) is delegated to dedicated components (WorldGrid, RainbowArc).
 *
 * Supplier zones:
 *   - engine     (getAllWorlds, getLevelsForWorld)
 *   - hooks      (useWorldSession, useRainbowEasterEgg)
 *   - components (WorldGrid, RainbowArc)
 *
 * The zone override in .n-dx.json places this file in its own zone to enforce
 * the route→hook layering boundary and prevent the route from being co-located
 * with its hook dependencies in sourcevision zone detection.
 */
import { Link } from "react-router";
import { getAllWorlds, getLevelsForWorld } from "~/engine";
import { useRainbowEasterEgg } from "~/hooks/useRainbowEasterEgg";
import { useWorldSession } from "~/hooks/useWorldSession";
import { WorldGrid } from "~/components/WorldGrid";
import { RainbowArc } from "~/components/RainbowArc";

export default function Worlds() {
  const { save, setSave, isLevelUnlocked, getClovers } = useWorldSession();

  const {
    rainbowRef,
    progress,
    potRevealed,
    unlocked,
    handleRainbowMove,
    handlePotClick,
    handleRainbowLeave,
  } = useRainbowEasterEgg(setSave);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 px-4 py-6 sm:py-8 select-none">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 text-emerald-800 hover:bg-white transition-colors text-lg font-bold"
          >
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-emerald-900">Levels</h1>
        </div>

        {/* Worlds */}
        <div className="flex flex-col gap-6">
          {getAllWorlds().map((world) => {
            const worldLevels = getLevelsForWorld(world.id);
            const anyUnlocked = worldLevels.some((l) => isLevelUnlocked(l.id));
            const worldForceUnlocked = save.unlockedWorlds.includes(world.id);
            const isLocked = !anyUnlocked && !worldForceUnlocked && world.id > 1;

            return (
              <WorldGrid
                key={world.id}
                world={world}
                worldLevels={worldLevels}
                isLocked={isLocked}
                isLevelUnlocked={isLevelUnlocked}
                getClovers={getClovers}
              />
            );
          })}
        </div>

        {/* Rainbow easter egg — below the level grids */}
        <RainbowArc
          rainbowRef={rainbowRef}
          progress={progress}
          potRevealed={potRevealed}
          unlocked={unlocked}
          onRainbowMove={handleRainbowMove}
          onPotClick={handlePotClick}
          onRainbowLeave={handleRainbowLeave}
        />
      </div>
    </div>
  );
}
