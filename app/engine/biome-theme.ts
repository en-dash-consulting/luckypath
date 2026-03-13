/**
 * Biome Theme — single source of truth for biome identity and visual properties.
 *
 * All biome-related metadata (canvas colors, world accent color, display name)
 * lives here. Adding a new biome requires only one edit to BIOME_THEMES;
 * the Biome type is derived from the keys so the type-system enforces that
 * every biome has a complete theme entry.
 */

/** Visual properties used by the canvas renderer (GameBoard). */
export interface BiomeCanvasColors {
  bg: string;
  grid: string;
  empty: string;
  obstacle: string;
}

/** Full theme record for a single biome. */
export interface BiomeTheme {
  /** Human-readable display name for the biome / world. */
  displayName: string;
  /** Accent color used in the world-select UI. */
  accentColor: string;
  /** Canvas color palette for the game board. */
  canvas: BiomeCanvasColors;
}

/**
 * Exhaustive map of every biome to its theme.
 *
 * Uses `as const satisfies` so that:
 *  - The `Biome` type below is automatically derived from the keys.
 *  - Adding a new key is a single edit; forgetting any property is a type error.
 */
export const BIOME_THEMES = {
  meadow: {
    displayName: "Meadow Start",
    accentColor: "#4ade80",
    canvas: { bg: "#e8f5e9", grid: "#a5d6a7", empty: "#c8e6c9", obstacle: "#795548" },
  },
  mushroom: {
    displayName: "Mushroom Maze",
    accentColor: "#c084fc",
    canvas: { bg: "#f3e5f5", grid: "#ce93d8", empty: "#e1bee7", obstacle: "#6d4c41" },
  },
  rainbow: {
    displayName: "Rainbow Run",
    accentColor: "#60a5fa",
    canvas: { bg: "#e3f2fd", grid: "#90caf9", empty: "#bbdefb", obstacle: "#78909c" },
  },
  grove: {
    displayName: "Gold Grove",
    accentColor: "#fbbf24",
    canvas: { bg: "#fff8e1", grid: "#ffe082", empty: "#fff9c4", obstacle: "#5d4037" },
  },
} as const satisfies Record<string, BiomeTheme>;

/** Union type of all biome identifiers, derived from BIOME_THEMES keys. */
export type Biome = keyof typeof BIOME_THEMES;

/** Helper to retrieve the canvas colors for a given biome. */
export function getBiomeCanvasColors(biome: Biome): BiomeCanvasColors {
  return BIOME_THEMES[biome].canvas;
}
