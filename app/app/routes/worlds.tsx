import { Link } from "react-router";
import { levels, worlds, getLevelsForWorld } from "~/engine/levels";
import { loadSave, getDefaultSave } from "~/lib/persistence";
import { useEffect, useState } from "react";
import type { SaveData } from "~/engine/types";

export default function Worlds() {
  const [save, setSave] = useState<SaveData>(getDefaultSave);
  const allLevelIds = levels.map((l) => l.id);

  useEffect(() => {
    setSave(loadSave());
  }, []);

  function isLevelUnlocked(levelId: string): boolean {
    const idx = allLevelIds.indexOf(levelId);
    if (idx === 0) return true;
    if (idx < 0) return false;
    return allLevelIds[idx - 1] in save.completedLevels;
  }

  function getClovers(levelId: string): number {
    return save.completedLevels[levelId] || 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 px-4 py-6 select-none">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            to="/"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 text-emerald-700 hover:bg-white transition-colors text-sm"
          >
            &larr;
          </Link>
          <h1 className="text-xl font-bold text-emerald-800">Levels</h1>
        </div>

        {/* Worlds */}
        <div className="flex flex-col gap-5">
          {worlds.map((world) => {
            const worldLevels = getLevelsForWorld(world.id);
            const anyUnlocked = worldLevels.some((l) => isLevelUnlocked(l.id));
            const isLocked = !anyUnlocked && world.id > 1;

            return (
              <div key={world.id} className={isLocked ? "opacity-35" : ""}>
                {/* World header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: world.color }}
                  />
                  <span className="text-sm font-semibold text-emerald-800">
                    {world.name}
                  </span>
                  {isLocked && (
                    <span className="text-[10px] text-gray-400 ml-auto uppercase tracking-wider">
                      locked
                    </span>
                  )}
                </div>

                {/* Level grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {worldLevels.map((level, idx) => {
                    const unlocked = isLevelUnlocked(level.id);
                    const clovers = getClovers(level.id);
                    const completed = clovers > 0;

                    if (!unlocked) {
                      return (
                        <div
                          key={level.id}
                          className="aspect-square rounded-lg bg-gray-200/60 flex items-center justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="4" y="6" width="6" height="5" rx="1" fill="#a8a29e" />
                            <path d="M5 6V4.5a2 2 0 014 0V6" stroke="#a8a29e" strokeWidth="1.2" fill="none" />
                          </svg>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={level.id}
                        to={`/play/${level.id}`}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center
                          transition-all active:scale-90
                          ${completed
                            ? "bg-white shadow-sm hover:shadow-md border border-emerald-100"
                            : "bg-white shadow-sm hover:shadow-md border border-gray-100"
                          }
                        `}
                      >
                        <span className={`text-base font-bold ${completed ? "text-emerald-700" : "text-gray-600"}`}>
                          {idx + 1}
                        </span>
                        {completed && (
                          <div className="flex gap-px mt-0.5">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i <= clovers ? "bg-emerald-400" : "bg-gray-200"
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
          })}
        </div>
      </div>
    </div>
  );
}
