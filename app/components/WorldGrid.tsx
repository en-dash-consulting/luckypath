/**
 * WorldGrid — presentation component for the level-select grid.
 *
 * Extracted from worlds.tsx so that the route handler follows the same
 * orchestration-only pattern as home.tsx. All inline SVG, grid layout,
 * and per-level presentation logic lives here.
 */
import { Link } from "react-router";
import type { WorldData, LevelData } from "~/engine";

interface WorldGridProps {
  world: WorldData;
  worldLevels: LevelData[];
  isLocked: boolean;
  isLevelUnlocked: (id: string) => boolean;
  getClovers: (id: string) => number;
}

export function WorldGrid({ world, worldLevels, isLocked, isLevelUnlocked, getClovers }: WorldGridProps) {
  return (
    <div className={isLocked ? "opacity-35" : ""}>
      {/* World header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: world.color }}
        />
        <span className="text-base font-bold text-emerald-900">
          {world.name}
        </span>
        {isLocked && (
          <span className="text-xs text-gray-500 ml-auto uppercase tracking-wider font-semibold">
            locked
          </span>
        )}
      </div>

      {/* Level grid */}
      <div className="grid grid-cols-4 gap-2">
        {worldLevels.map((level, idx) => {
          const levelUnlocked = isLevelUnlocked(level.id);
          const clovers = getClovers(level.id);
          const completed = clovers > 0;

          if (!levelUnlocked) {
            return (
              <div
                key={level.id}
                className="aspect-square rounded-xl bg-gray-200/60 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="6" width="6" height="5" rx="1" fill="#9ca3af" />
                  <path d="M5 6V4.5a2 2 0 014 0V6" stroke="#9ca3af" strokeWidth="1.2" fill="none" />
                </svg>
              </div>
            );
          }

          return (
            <Link
              key={level.id}
              to={`/play/${level.id}`}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all active:scale-90
                ${completed
                  ? "bg-white shadow-sm hover:shadow-md border border-emerald-200"
                  : "bg-white shadow-sm hover:shadow-md border border-gray-200"
                }
              `}
            >
              <span className={`text-lg font-bold ${completed ? "text-emerald-800" : "text-gray-700"}`}>
                {idx + 1}
              </span>
              {completed && (
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= clovers ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
