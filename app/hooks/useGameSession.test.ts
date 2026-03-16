import { describe, expect, it } from "vitest";
import type { GameState, LevelData } from "~/engine";
import { EAST } from "~/engine";
import { resolveCellClickAction, guardNextLevel } from "./useGameSession";

/* ── Test fixtures ───────────────────────────────────────────────── */

const testLevel: LevelData = {
  id: "test-1",
  worldId: 1,
  levelIndex: 0,
  name: "Test Level",
  width: 4,
  height: 4,
  start: { row: 1, col: 0, direction: EAST },
  goal: { row: 1, col: 3 },
  obstacles: [{ row: 0, col: 2 }],
  inventory: { straight: 3, curve: 2 },
  par: 2,
  biome: "meadow",
};

/** Minimal state slice for resolveCellClickAction. */
function placingState(
  overrides: Partial<
    Pick<GameState, "phase" | "removeMode" | "placedTiles" | "selectedTileType">
  > = {},
): Pick<GameState, "phase" | "removeMode" | "placedTiles" | "selectedTileType"> {
  return {
    phase: "placing",
    removeMode: false,
    placedTiles: new Map(),
    selectedTileType: null,
    ...overrides,
  };
}

/* ── resolveCellClickAction ─────────────────────────────────────── */

describe("resolveCellClickAction", () => {
  it("returns 'none' when phase is not 'placing'", () => {
    const s = placingState({ phase: "running" });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("none");
  });

  it("returns 'none' on a forbidden cell (start)", () => {
    const s = placingState();
    expect(resolveCellClickAction(s, testLevel, 1, 0)).toBe("none");
  });

  it("returns 'none' on a forbidden cell (goal)", () => {
    const s = placingState();
    expect(resolveCellClickAction(s, testLevel, 1, 3)).toBe("none");
  });

  it("returns 'none' on an obstacle cell", () => {
    const s = placingState();
    expect(resolveCellClickAction(s, testLevel, 0, 2)).toBe("none");
  });

  it("returns 'remove' when removeMode is active", () => {
    const s = placingState({ removeMode: true });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("remove");
  });

  it("returns 'rotate' when cell has a placed tile", () => {
    const tiles = new Map([["2,2", { type: "straight" as const, rotation: 0 as const }]]);
    const s = placingState({ placedTiles: tiles });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("rotate");
  });

  it("returns 'place' when a tile type is selected and cell is empty", () => {
    const s = placingState({ selectedTileType: "curve" });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("place");
  });

  it("returns 'none' when no tile selected and cell is empty", () => {
    const s = placingState();
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("none");
  });

  it("removeMode takes priority over placed tile", () => {
    const tiles = new Map([["2,2", { type: "straight" as const, rotation: 0 as const }]]);
    const s = placingState({ removeMode: true, placedTiles: tiles });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("remove");
  });

  it("placed tile rotation takes priority over selected tile type", () => {
    const tiles = new Map([["2,2", { type: "straight" as const, rotation: 0 as const }]]);
    const s = placingState({ placedTiles: tiles, selectedTileType: "curve" });
    expect(resolveCellClickAction(s, testLevel, 2, 2)).toBe("rotate");
  });
});

/* ── guardNextLevel ─────────────────────────────────────────────── */

describe("guardNextLevel", () => {
  const nextInSameWorld: LevelData = {
    ...testLevel,
    id: "test-2",
    levelIndex: 1,
  };

  const nextInNewWorld: LevelData = {
    ...testLevel,
    id: "test-w2-1",
    worldId: 2,
    levelIndex: 0,
  };

  it("returns null when candidate is null", () => {
    expect(guardNextLevel(null, 1, [1])).toBeNull();
  });

  it("returns candidate when it is in the same world", () => {
    expect(guardNextLevel(nextInSameWorld, 1, [1])).toBe(nextInSameWorld);
  });

  it("returns candidate when its world is unlocked", () => {
    expect(guardNextLevel(nextInNewWorld, 1, [1, 2])).toBe(nextInNewWorld);
  });

  it("returns null when candidate's world is locked", () => {
    expect(guardNextLevel(nextInNewWorld, 1, [1])).toBeNull();
  });
});
