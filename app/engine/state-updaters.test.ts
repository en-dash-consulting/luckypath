import { describe, expect, it } from "vitest";
import type { LevelData, GameState, Rotation } from "~/engine";
import {
  EAST,
  createInitialState,
  selectTileUpdate,
  toggleRemoveModeUpdate,
  placeTileUpdate,
  rotateTileUpdate,
  moveTileUpdate,
  removeTileUpdate,
  runSimulationUpdate,
} from "~/engine";

/* ── Test fixtures ───────────────────────────────────────────────── */

/** Minimal 4×4 level with start at (1,0) heading EAST, goal at (1,3). */
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

/** Helper: create a "placing" state with a tile type selected. */
function placingWith(
  level: LevelData,
  selectedTileType: "straight" | "curve"
): GameState {
  return { ...createInitialState(level), selectedTileType };
}

/** Helper: create a state in the given phase. */
function stateInPhase(
  level: LevelData,
  phase: GameState["phase"]
): GameState {
  return { ...createInitialState(level), phase };
}

/* ── createInitialState ──────────────────────────────────────────── */

describe("createInitialState", () => {
  it("sets phase to 'placing'", () => {
    expect(createInitialState(testLevel).phase).toBe("placing");
  });

  it("copies the level inventory", () => {
    const state = createInitialState(testLevel);
    expect(state.remainingInventory).toEqual({ straight: 3, curve: 2 });
    // Must be a copy, not a reference
    expect(state.remainingInventory).not.toBe(testLevel.inventory);
  });

  it("starts with no placed tiles", () => {
    expect(createInitialState(testLevel).placedTiles.size).toBe(0);
  });

  it("starts with no selection and removeMode off", () => {
    const state = createInitialState(testLevel);
    expect(state.selectedTileType).toBeNull();
    expect(state.removeMode).toBe(false);
  });

  it("starts with empty traversal path", () => {
    expect(createInitialState(testLevel).traversalPath).toEqual([]);
  });
});

/* ── Phase transition guards ─────────────────────────────────────── */

describe("phase transition guards", () => {
  const nonPlacingPhases: GameState["phase"][] = ["running", "success", "failure"];

  describe.each(nonPlacingPhases)("in '%s' phase", (phase) => {
    it("placeTile is a no-op", () => {
      const s = { ...placingWith(testLevel, "straight"), phase };
      expect(placeTileUpdate(s, testLevel, 2, 2)).toBe(s);
    });

    it("rotateTile is a no-op", () => {
      const s = stateInPhase(testLevel, phase);
      expect(rotateTileUpdate(s, 1, 1)).toBe(s);
    });

    it("moveTile is a no-op", () => {
      const s = stateInPhase(testLevel, phase);
      expect(moveTileUpdate(s, testLevel, 0, 0, 1, 1)).toBe(s);
    });

    it("removeTile is a no-op", () => {
      const s = stateInPhase(testLevel, phase);
      expect(removeTileUpdate(s, 1, 1)).toBe(s);
    });

    it("runSimulation is a no-op", () => {
      const s = stateInPhase(testLevel, phase);
      expect(runSimulationUpdate(s, testLevel)).toBe(s);
    });
  });
});

/* ── Legal phase transitions ─────────────────────────────────────── */

describe("legal phase transitions", () => {
  it("runSimulation transitions placing → failure when no path", () => {
    const s = createInitialState(testLevel);
    const next = runSimulationUpdate(s, testLevel);
    expect(next.phase).toBe("failure");
    expect(next.failReason).toBeDefined();
  });

  it("runSimulation transitions placing → success when path is complete", () => {
    // Build a straight path: start (1,0) → goal (1,3)
    // Need tiles at (1,1) and (1,2)
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 1, 1);
    s = placeTileUpdate(s, testLevel, 1, 2);
    // Straight tiles default to rotation 0 (NORTH-SOUTH), need rotation 1 (EAST-WEST)
    s = rotateTileUpdate(s, 1, 1);
    s = rotateTileUpdate(s, 1, 2);

    const next = runSimulationUpdate(s, testLevel);
    expect(next.phase).toBe("success");
    expect(next.traversalPath.length).toBeGreaterThan(0);
  });

  it("runSimulation clears removeMode", () => {
    const s = { ...createInitialState(testLevel), removeMode: true };
    const next = runSimulationUpdate(s, testLevel);
    expect(next.removeMode).toBe(false);
  });
});

/* ── Inventory add/remove invariants ─────────────────────────────── */

describe("inventory invariants", () => {
  it("placeTile decrements the selected tile type", () => {
    const s = placingWith(testLevel, "straight");
    const next = placeTileUpdate(s, testLevel, 2, 2);
    expect(next.remainingInventory.straight).toBe(2);
    expect(next.remainingInventory.curve).toBe(2); // unchanged
  });

  it("removeTile increments the removed tile type", () => {
    let s = placingWith(testLevel, "curve");
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(s.remainingInventory.curve).toBe(1);

    const next = removeTileUpdate(s, 2, 2);
    expect(next.remainingInventory.curve).toBe(2);
    expect(next.placedTiles.size).toBe(0);
  });

  it("place + remove preserves total inventory", () => {
    const initial = placingWith(testLevel, "straight");
    const totalBefore =
      initial.remainingInventory.straight + initial.remainingInventory.curve;

    let s = placeTileUpdate(initial, testLevel, 2, 2);
    s = removeTileUpdate(s, 2, 2);

    const totalAfter =
      s.remainingInventory.straight + s.remainingInventory.curve;
    expect(totalAfter).toBe(totalBefore);
  });

  it("cannot place when inventory for selected type is 0", () => {
    let s = placingWith(testLevel, "curve");
    // Place both curves
    s = placeTileUpdate(s, testLevel, 2, 1);
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(s.remainingInventory.curve).toBe(0);

    // Third placement should be a no-op
    const next = placeTileUpdate(s, testLevel, 2, 3);
    expect(next.remainingInventory.curve).toBe(0);
    expect(next.placedTiles.size).toBe(2);
  });

  it("replacing a tile returns the old tile to inventory before consuming", () => {
    // Place a straight tile, then replace it with a curve
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(s.remainingInventory.straight).toBe(2);

    // Switch to curve and place on the same cell
    s = selectTileUpdate(s, "curve");
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(s.remainingInventory.straight).toBe(3); // old straight returned
    expect(s.remainingInventory.curve).toBe(1); // new curve consumed
    expect(s.placedTiles.get("2,2")?.type).toBe("curve");
  });
});

/* ── Tile operations ─────────────────────────────────────────────── */

describe("tile operations", () => {
  it("placeTile is a no-op without a selected tile type", () => {
    const s = createInitialState(testLevel);
    expect(placeTileUpdate(s, testLevel, 2, 2)).toBe(s);
  });

  it("placeTile is a no-op on a forbidden cell (start)", () => {
    const s = placingWith(testLevel, "straight");
    expect(placeTileUpdate(s, testLevel, 1, 0)).toBe(s); // start cell
  });

  it("placeTile is a no-op on an obstacle cell", () => {
    const s = placingWith(testLevel, "straight");
    expect(placeTileUpdate(s, testLevel, 0, 2)).toBe(s); // obstacle
  });

  it("rotateTile cycles through 4 rotations", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);

    for (let expected = 1; expected <= 4; expected++) {
      s = rotateTileUpdate(s, 2, 2);
      expect(s.placedTiles.get("2,2")?.rotation).toBe(
        (expected % 4) as Rotation
      );
    }
  });

  it("rotateTile is a no-op on an empty cell", () => {
    const s = createInitialState(testLevel);
    expect(rotateTileUpdate(s, 2, 2)).toBe(s);
  });

  it("moveTile relocates a tile and preserves its rotation", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 1);
    s = rotateTileUpdate(s, 2, 1);

    const next = moveTileUpdate(s, testLevel, 2, 1, 3, 3);
    expect(next.placedTiles.has("2,1")).toBe(false);
    expect(next.placedTiles.get("3,3")?.rotation).toBe(1);
  });

  it("moveTile is a no-op when source and destination are the same", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(moveTileUpdate(s, testLevel, 2, 2, 2, 2)).toBe(s);
  });

  it("moveTile is a no-op when destination is forbidden", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);
    const next = moveTileUpdate(s, testLevel, 2, 2, 0, 2); // obstacle
    expect(next).toBe(s);
  });

  it("moveTile is a no-op when destination is out of bounds", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(moveTileUpdate(s, testLevel, 2, 2, -1, 0)).toBe(s);
    expect(moveTileUpdate(s, testLevel, 2, 2, 0, 4)).toBe(s);
  });

  it("moveTile is a no-op when destination is occupied", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 1);
    s = placeTileUpdate(s, testLevel, 2, 2);
    expect(moveTileUpdate(s, testLevel, 2, 1, 2, 2)).toBe(s);
  });

  it("removeTile is a no-op on an empty cell", () => {
    const s = createInitialState(testLevel);
    expect(removeTileUpdate(s, 2, 2)).toBe(s);
  });
});

/* ── selectTile / toggleRemoveMode ───────────────────────────────── */

describe("selectTile", () => {
  it("selects a tile type", () => {
    const s = createInitialState(testLevel);
    expect(selectTileUpdate(s, "curve").selectedTileType).toBe("curve");
  });

  it("clears removeMode when selecting a tile", () => {
    const s = { ...createInitialState(testLevel), removeMode: true };
    expect(selectTileUpdate(s, "straight").removeMode).toBe(false);
  });

  it("preserves removeMode when deselecting (null)", () => {
    const s = { ...createInitialState(testLevel), removeMode: true };
    expect(selectTileUpdate(s, null).removeMode).toBe(true);
  });
});

describe("toggleRemoveMode", () => {
  it("toggles removeMode on", () => {
    const s = createInitialState(testLevel);
    expect(toggleRemoveModeUpdate(s).removeMode).toBe(true);
  });

  it("toggles removeMode off", () => {
    const s = { ...createInitialState(testLevel), removeMode: true };
    expect(toggleRemoveModeUpdate(s).removeMode).toBe(false);
  });

  it("clears selectedTileType", () => {
    const s = placingWith(testLevel, "straight");
    expect(toggleRemoveModeUpdate(s).selectedTileType).toBeNull();
  });
});

/* ── Reset boundary ──────────────────────────────────────────────── */

describe("reset boundary", () => {
  it("createInitialState restores full inventory after modifications", () => {
    let s = placingWith(testLevel, "straight");
    s = placeTileUpdate(s, testLevel, 2, 2);
    s = placeTileUpdate(s, testLevel, 2, 3);
    expect(s.remainingInventory.straight).toBe(1);

    const reset = createInitialState(testLevel);
    expect(reset.remainingInventory).toEqual({ straight: 3, curve: 2 });
    expect(reset.placedTiles.size).toBe(0);
    expect(reset.phase).toBe("placing");
  });

  it("createInitialState with a different level uses that level's inventory", () => {
    const otherLevel: LevelData = {
      ...testLevel,
      id: "test-2",
      inventory: { straight: 10, curve: 0 },
    };
    const state = createInitialState(otherLevel);
    expect(state.remainingInventory).toEqual({ straight: 10, curve: 0 });
  });

  it("reset clears simulation results", () => {
    let s = createInitialState(testLevel);
    s = runSimulationUpdate(s, testLevel);
    expect(s.phase).not.toBe("placing");
    expect(s.traversalPath.length).toBeGreaterThan(0);

    const reset = createInitialState(testLevel);
    expect(reset.phase).toBe("placing");
    expect(reset.traversalPath).toEqual([]);
    expect(reset.failReason).toBeUndefined();
  });
});
