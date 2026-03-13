import { Link } from "react-router";
import { worlds, getLevelsForWorld } from "~/engine";
import {
  useRainbowEasterEgg,
  SVG_WIDTH,
  SVG_HEIGHT,
} from "~/hooks/useRainbowEasterEgg";
import { useWorldSession } from "~/hooks/useWorldSession";

const RAINBOW_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
];

/** Arc geometry constants derived from SVG_WIDTH / SVG_HEIGHT. */
const ARC_CX = SVG_WIDTH / 2;       // 160
const ARC_BASELINE = SVG_HEIGHT - 10; // 130

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
          {worlds.map((world) => {
            const worldLevels = getLevelsForWorld(world.id);
            const anyUnlocked = worldLevels.some((l) => isLevelUnlocked(l.id));
            const worldForceUnlocked = save.unlockedWorlds.includes(world.id);
            const isLocked = !anyUnlocked && !worldForceUnlocked && world.id > 1;

            return (
              <div key={world.id} className={isLocked ? "opacity-35" : ""}>
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
          })}
        </div>

        {/* Rainbow easter egg — below the level grids */}
        <div className="mt-8 sm:mt-10 flex justify-center max-w-full overflow-hidden">
          <svg
            ref={rainbowRef}
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            onMouseMove={handleRainbowMove}
            onMouseLeave={handleRainbowLeave}
          >
            {/* Invisible hit area for the full arc zone */}
            <path
              d={`M 20 ${ARC_BASELINE} A 140 140 0 0 1 ${SVG_WIDTH - 20} ${ARC_BASELINE}`}
              fill="none"
              stroke="transparent"
              strokeWidth="80"
            />

            {RAINBOW_COLORS.map((color, i) => {
              const r = ARC_BASELINE - i * 14;
              const arcProgress = Math.min(progress, 1);
              if (arcProgress <= 0.01) return null;

              const startAngle = Math.PI;
              const endAngle = Math.PI - arcProgress * Math.PI;
              const x1 = ARC_CX + r * Math.cos(startAngle);
              const y1 = ARC_BASELINE - r * Math.sin(startAngle);
              const x2 = ARC_CX + r * Math.cos(endAngle);
              const y2 = ARC_BASELINE - r * Math.sin(endAngle);
              const largeArc = arcProgress > 0.5 ? 1 : 0;

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.5}
                />
              );
            })}

            {/* Pot of gold at right end */}
            {potRevealed && (
              <g
                onClick={handlePotClick}
                className="cursor-pointer"
                style={{ animation: "scaleIn 0.3s ease-out" }}
              >
                {/* Invisible click target */}
                <rect x="260" y="95" width="55" height="45" fill="transparent" />
                {/* Cauldron */}
                <ellipse cx="290" cy="132" rx="18" ry="8" fill="#1e293b" />
                <rect x="272" y="115" width="36" height="17" rx="3" fill="#334155" />
                <rect x="269" y="111" width="42" height="5" rx="2.5" fill="#475569" />
                {/* Gold coins */}
                <circle cx="280" cy="112" r="4.5" fill="#fbbf24" />
                <circle cx="290" cy="110" r="4.5" fill="#f59e0b" />
                <circle cx="300" cy="112" r="4.5" fill="#fbbf24" />
                <circle cx="285" cy="108" r="3.5" fill="#fcd34d" />
                <circle cx="295" cy="107" r="3.5" fill="#fcd34d" />
                {!unlocked && (
                  <>
                    <circle cx="303" cy="102" r="2" fill="#fbbf24" opacity="0.8" className="animate-pulse" />
                    <circle cx="277" cy="104" r="1.5" fill="#fcd34d" opacity="0.6" className="animate-pulse" />
                  </>
                )}
                {unlocked && (
                  <text x="290" y="98" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">
                    Unlocked!
                  </text>
                )}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
