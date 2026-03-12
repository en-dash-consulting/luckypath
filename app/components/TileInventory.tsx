import type { TileType, Rotation } from "~/engine/types";
import { NORTH, EAST, SOUTH, WEST } from "~/engine/types";
import { getConnection } from "~/engine/traversal";

interface TileInventoryProps {
  remaining: { straight: number; curve: number };
  selectedType: TileType | null;
  onSelect: (type: TileType | null) => void;
  disabled?: boolean;
  removeMode?: boolean;
  onToggleRemoveMode?: () => void;
}

const TILE_DEFS: {
  type: TileType;
  label: string;
  invKey: keyof TileInventoryProps["remaining"];
}[] = [
  { type: "straight", label: "Straight", invKey: "straight" },
  { type: "curve", label: "Curve", invKey: "curve" },
];

export function TileInventory({
  remaining,
  selectedType,
  onSelect,
  disabled,
  removeMode,
  onToggleRemoveMode,
}: TileInventoryProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-r-2xl shadow-lg border border-l-0 border-gray-200 py-3 px-3 flex flex-col gap-2.5 -ml-3 mt-4">
      {/* Tile pieces */}
      {TILE_DEFS.map(({ type, label, invKey }) => {
        const count = remaining[invKey];
        const isSelected = selectedType === type && !removeMode;
        const isEmpty = count <= 0;
        const available = !disabled && !isEmpty;

        return (
          <button
            key={type}
            onClick={() => {
              if (!available) return;
              if (onToggleRemoveMode && removeMode) onToggleRemoveMode();
              onSelect(isSelected ? null : type);
            }}
            disabled={!available}
            className={`
              relative flex flex-col items-center gap-1
              p-2 rounded-xl transition-all duration-150 select-none
              ${isSelected
                ? "bg-teal-100 ring-2 ring-teal-500 shadow-md scale-105"
                : isEmpty
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-teal-50 hover:scale-105 cursor-pointer"
              }
            `}
          >
            <TilePreview type={type} size={64} selected={isSelected} />

            {/* Count display */}
            <span className={`text-lg font-bold tabular-nums ${
              isSelected ? "text-teal-700" : "text-gray-500"
            }`}>
              {count}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-1" />

      {/* Remove tool */}
      <button
        onClick={() => {
          if (disabled) return;
          onSelect(null);
          onToggleRemoveMode?.();
        }}
        disabled={disabled}
        className={`
          flex flex-col items-center justify-center gap-1
          p-2 rounded-xl transition-all duration-150 select-none
          ${removeMode
            ? "bg-red-100 ring-2 ring-red-400 scale-105"
            : disabled
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-red-50 hover:scale-105 cursor-pointer"
          }
        `}
        title="Remove placed tiles"
      >
        <div className={`w-16 h-16 flex items-center justify-center rounded-lg ${
          removeMode ? "bg-red-50" : "bg-gray-50"
        }`}>
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
            <path d="M6 6l10 10M16 6L6 16"
              stroke={removeMode ? "#ef4444" : "#9ca3af"}
              strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function TilePreview({ type, size, selected }: { type: TileType; size: number; selected?: boolean }) {
  const half = size / 2;
  const pad = 6;
  const pathColor = selected ? "#0d9488" : "#a7f3d0";
  const pathStroke = selected ? "#115e59" : "#14b8a6";
  const dotColor = selected ? "#134e4a" : "#0d9488";
  const bgColor = selected ? "#ccfbf1" : "#f0fdfa";
  const borderColor = selected ? "#5eead4" : "#d1d5db";

  const [sideA, sideB] = getConnection(type, 0 as Rotation);

  const getEdge = (side: number): [number, number] => {
    switch (side) {
      case NORTH: return [half, pad];
      case SOUTH: return [half, size - pad];
      case EAST: return [size - pad, half];
      case WEST: return [pad, half];
      default: return [half, half];
    }
  };

  const [ax, ay] = getEdge(sideA);
  const [bx, by] = getEdge(sideB);

  const arrowSize = 5;
  const getArrow = (side: number, ex: number, ey: number): string => {
    switch (side) {
      case NORTH: return `M${ex - arrowSize},${ey + arrowSize} L${ex},${ey} L${ex + arrowSize},${ey + arrowSize}`;
      case SOUTH: return `M${ex - arrowSize},${ey - arrowSize} L${ex},${ey} L${ex + arrowSize},${ey - arrowSize}`;
      case EAST: return `M${ex - arrowSize},${ey - arrowSize} L${ex},${ey} L${ex - arrowSize},${ey + arrowSize}`;
      case WEST: return `M${ex + arrowSize},${ey - arrowSize} L${ex},${ey} L${ex + arrowSize},${ey + arrowSize}`;
      default: return "";
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={1} y={1} width={size - 2} height={size - 2} rx={8}
        fill={bgColor} stroke={borderColor} strokeWidth={1.5} />
      {type === "straight" ? (
        <>
          <line x1={ax} y1={ay} x2={bx} y2={by}
            stroke={pathColor} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
          <line x1={ax} y1={ay} x2={bx} y2={by}
            stroke={pathStroke} strokeWidth={5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M${ax},${ay} Q${half},${half} ${bx},${by}`}
            fill="none" stroke={pathColor} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
          <path d={`M${ax},${ay} Q${half},${half} ${bx},${by}`}
            fill="none" stroke={pathStroke} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      <path d={getArrow(sideA, ax, ay)} fill="none" stroke={dotColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={getArrow(sideB, bx, by)} fill="none" stroke={dotColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
