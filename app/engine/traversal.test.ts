import { describe, it, expect } from "vitest";
import {
  simulateTraversal,
  opposite,
  getConnection,
  getExitSide,
} from "./traversal";
import type { LevelData, PlacedTile, Rotation } from "./types";
import { NORTH, EAST, SOUTH, WEST } from "./types";
import { posKey } from "./utils";

function makeLevel(overrides: Partial<LevelData> = {}): LevelData {
  return {
    id: "test",
    worldId: 1,
    levelIndex: 0,
    name: "Test",
    width: 6,
    height: 6,
    start: { row: 2, col: 0, direction: EAST },
    goal: { row: 2, col: 3 },
    obstacles: [],
    inventory: { straight: 3, curve: 0 },
    par: 2,
    biome: "meadow",
    ...overrides,
  };
}

function tile(type: "straight" | "curve", rotation: Rotation): PlacedTile {
  return { type, rotation };
}

describe("opposite", () => {
  it("returns the opposite direction", () => {
    expect(opposite(NORTH)).toBe(SOUTH);
    expect(opposite(SOUTH)).toBe(NORTH);
    expect(opposite(EAST)).toBe(WEST);
    expect(opposite(WEST)).toBe(EAST);
  });
});

describe("getConnection", () => {
  it("straight at rotation 0 connects NORTH-SOUTH", () => {
    const [a, b] = getConnection("straight", 0 as Rotation);
    expect(new Set([a, b])).toEqual(new Set([NORTH, SOUTH]));
  });

  it("straight at rotation 1 connects EAST-WEST", () => {
    const [a, b] = getConnection("straight", 1 as Rotation);
    expect(new Set([a, b])).toEqual(new Set([EAST, WEST]));
  });

  it("curve at rotation 0 connects SOUTH-EAST", () => {
    const [a, b] = getConnection("curve", 0 as Rotation);
    expect(new Set([a, b])).toEqual(new Set([SOUTH, EAST]));
  });

  it("curve at rotation 2 connects NORTH-WEST", () => {
    const [a, b] = getConnection("curve", 2 as Rotation);
    expect(new Set([a, b])).toEqual(new Set([NORTH, WEST]));
  });
});

describe("getExitSide", () => {
  it("returns the other side for a valid entry", () => {
    expect(getExitSide("straight", 0 as Rotation, NORTH)).toBe(SOUTH);
    expect(getExitSide("straight", 0 as Rotation, SOUTH)).toBe(NORTH);
  });

  it("returns null for an invalid entry side", () => {
    expect(getExitSide("straight", 0 as Rotation, EAST)).toBeNull();
  });
});

describe("simulateTraversal", () => {
  it("reaches goal with correct straight tiles", () => {
    const level = makeLevel();
    const tiles = new Map<string, PlacedTile>();
    tiles.set(posKey(2, 1), tile("straight", 1 as Rotation));
    tiles.set(posKey(2, 2), tile("straight", 1 as Rotation));

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(true);
    expect(result.outcome).toBe("goal");
  });

  it("returns 'no-path' when tiles are missing", () => {
    const level = makeLevel();
    const tiles = new Map<string, PlacedTile>();

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(false);
    expect(result.outcome).toBe("no-path");
  });

  it("returns 'edge' when path leads out of bounds", () => {
    const level = makeLevel({
      start: { row: 0, col: 2, direction: NORTH },
      goal: { row: 5, col: 5 },
    });
    const tiles = new Map<string, PlacedTile>();

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(false);
    expect(result.outcome).toBe("edge");
  });

  it("returns 'obstacle' when path hits an obstacle", () => {
    const level = makeLevel({
      obstacles: [{ row: 2, col: 1 }],
    });
    const tiles = new Map<string, PlacedTile>();

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(false);
    expect(result.outcome).toBe("obstacle");
  });

  it("returns 'blocked' when tile cannot be entered from the given direction", () => {
    const level = makeLevel();
    const tiles = new Map<string, PlacedTile>();
    // Vertical straight at (2,1) — Lucky enters from WEST but tile only connects NORTH-SOUTH
    tiles.set(posKey(2, 1), tile("straight", 0 as Rotation));

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(false);
    expect(result.outcome).toBe("blocked");
  });

  it("navigates curve tiles to reach goal", () => {
    // Lucky at (2,0) facing EAST → goal at (0,2)
    const level = makeLevel({
      start: { row: 2, col: 0, direction: EAST },
      goal: { row: 0, col: 2 },
    });
    const tiles = new Map<string, PlacedTile>();
    // (2,1): straight horizontal — pass through
    tiles.set(posKey(2, 1), tile("straight", 1 as Rotation));
    // (2,2): curve rot 2 [NORTH, WEST] — enter from WEST, exit NORTH
    tiles.set(posKey(2, 2), tile("curve", 2 as Rotation));
    // (1,2): straight vertical — pass through heading NORTH
    tiles.set(posKey(1, 2), tile("straight", 0 as Rotation));
    // Lucky arrives at (0,2) = goal

    const result = simulateTraversal(level, tiles);
    expect(result.success).toBe(true);
    expect(result.outcome).toBe("goal");
    expect(result.path.length).toBe(5); // start + 3 tiles + goal
  });

  it("includes correct path positions", () => {
    const level = makeLevel();
    const tiles = new Map<string, PlacedTile>();
    tiles.set(posKey(2, 1), tile("straight", 1 as Rotation));
    tiles.set(posKey(2, 2), tile("straight", 1 as Rotation));

    const result = simulateTraversal(level, tiles);
    expect(result.path[0]).toMatchObject({ row: 2, col: 0 });
    expect(result.path[1]).toMatchObject({ row: 2, col: 1 });
    expect(result.path[2]).toMatchObject({ row: 2, col: 2 });
    expect(result.path[3]).toMatchObject({ row: 2, col: 3 }); // goal
  });
});
