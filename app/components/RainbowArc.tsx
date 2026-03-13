/**
 * RainbowArc — presentation component for the rainbow easter egg SVG.
 *
 * Extracted from worlds.tsx so that the route handler follows the same
 * orchestration-only pattern as home.tsx. All arc rendering, pot-of-gold
 * SVG, and animation logic lives here.
 */
import type React from "react";
import { SVG_WIDTH, SVG_HEIGHT } from "~/lib/rainbow-constants";

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

interface RainbowArcProps {
  rainbowRef: React.RefObject<SVGSVGElement | null>;
  progress: number;
  potRevealed: boolean;
  unlocked: boolean;
  onRainbowMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onPotClick: () => void;
  onRainbowLeave: () => void;
}

export function RainbowArc({
  rainbowRef,
  progress,
  potRevealed,
  unlocked,
  onRainbowMove,
  onPotClick,
  onRainbowLeave,
}: RainbowArcProps) {
  return (
    <div className="mt-8 sm:mt-10 flex justify-center max-w-full overflow-hidden">
      <svg
        ref={rainbowRef}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        onMouseMove={onRainbowMove}
        onMouseLeave={onRainbowLeave}
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
            onClick={onPotClick}
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
  );
}
