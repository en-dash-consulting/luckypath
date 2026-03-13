import { describe, it, expect } from "vitest";
import { posKey, isCellForbidden } from "./utils";
import type { LevelData } from "./types";
import { EAST } from "./types";

const stubLevel: LevelData = {
  id: "test",
  worldId: 1,
  levelIndex: 0,
  name: "Test",
  width: 6,
  height: 6,
  start: { row: 0, col: 0, direction: EAST },
  goal: { row: 5, col: 5 },
  obstacles: [{ row: 2, col: 3 }, { row: 4, col: 1 }],
  inventory: { straight: 1, curve: 1 },
  par: 2,
  biome: "meadow",
};

describe("posKey", () => {
  it("returns 'row,col' format", () => {
    expect(posKey(0, 0)).toBe("0,0");
    expect(posKey(3, 7)).toBe("3,7");
  });

  it("handles negative coordinates", () => {
    expect(posKey(-1, -2)).toBe("-1,-2");
  });

  it("produces unique keys for distinct positions", () => {
    const keys = new Set([posKey(1, 2), posKey(2, 1), posKey(1, 1)]);
    expect(keys.size).toBe(3);
  });
});

describe("isCellForbidden", () => {
  it("returns true for start cell", () => {
    expect(isCellForbidden(stubLevel, 0, 0)).toBe(true);
  });

  it("returns true for goal cell", () => {
    expect(isCellForbidden(stubLevel, 5, 5)).toBe(true);
  });

  it("returns true for obstacle cells", () => {
    expect(isCellForbidden(stubLevel, 2, 3)).toBe(true);
    expect(isCellForbidden(stubLevel, 4, 1)).toBe(true);
  });

  it("returns false for empty cells", () => {
    expect(isCellForbidden(stubLevel, 1, 1)).toBe(false);
    expect(isCellForbidden(stubLevel, 3, 3)).toBe(false);
  });
});
