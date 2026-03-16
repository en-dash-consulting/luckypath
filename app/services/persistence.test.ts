import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  getDefaultSave,
  loadSave,
  saveSave,
  completeLevelUpdater,
  isLevelUnlockedWithSave,
} from "./persistence";
import type { SaveData } from "./persistence";

/* ── getDefaultSave ─────────────────────────────────────────────── */

describe("getDefaultSave", () => {
  it("returns world 1 unlocked", () => {
    expect(getDefaultSave().unlockedWorlds).toEqual([1]);
  });

  it("returns no completed levels", () => {
    expect(getDefaultSave().completedLevels).toEqual({});
  });

  it("returns empty unlockedLevels", () => {
    expect(getDefaultSave().unlockedLevels).toEqual([]);
  });

  it("returns default settings", () => {
    expect(getDefaultSave().settings).toEqual({
      fastMode: false,
      highContrast: false,
    });
  });

  it("returns a fresh object each call", () => {
    expect(getDefaultSave()).not.toBe(getDefaultSave());
  });
});

/* ── loadSave (SSR safety + localStorage fallback) ──────────────── */

describe("loadSave", () => {
  /** Minimal localStorage stub scoped to each test. */
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      clear: () => { store = {}; },
      removeItem: (key: string) => { delete store[key]; },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns default save when localStorage is empty", () => {
    expect(loadSave()).toEqual(getDefaultSave());
  });

  it("returns default save when localStorage has invalid JSON", () => {
    store["luckypath_save"] = "not-json";
    expect(loadSave()).toEqual(getDefaultSave());
  });

  it("merges partial saved data with defaults", () => {
    const partial = { completedLevels: { "1-1": 3 } };
    store["luckypath_save"] = JSON.stringify(partial);

    const result = loadSave();
    expect(result.completedLevels).toEqual({ "1-1": 3 });
    // Defaults for missing fields
    expect(result.unlockedWorlds).toEqual([1]);
    expect(result.settings).toEqual({ fastMode: false, highContrast: false });
  });

  it("merges partial settings with defaults", () => {
    const partial = { settings: { fastMode: true } };
    store["luckypath_save"] = JSON.stringify(partial);

    const result = loadSave();
    expect(result.settings.fastMode).toBe(true);
    expect(result.settings.highContrast).toBe(false); // default preserved
  });
});

/* ── saveSave (round-trip) ──────────────────────────────────────── */

describe("saveSave", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      clear: () => { store = {}; },
      removeItem: (key: string) => { delete store[key]; },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists data that loadSave can read back", () => {
    const data: SaveData = {
      ...getDefaultSave(),
      completedLevels: { "1-1": 2, "1-2": 3 },
    };
    saveSave(data);

    const loaded = loadSave();
    expect(loaded.completedLevels).toEqual({ "1-1": 2, "1-2": 3 });
  });
});

/* ── completeLevelUpdater ───────────────────────────────────────── */

describe("completeLevelUpdater", () => {
  it("records a new level completion", () => {
    const save = getDefaultSave();
    const result = completeLevelUpdater(save, "1-1", 2);
    expect(result.completedLevels["1-1"]).toBe(2);
  });

  it("keeps the higher clover count on replay", () => {
    let save = getDefaultSave();
    save = completeLevelUpdater(save, "1-1", 3);
    save = completeLevelUpdater(save, "1-1", 1);
    expect(save.completedLevels["1-1"]).toBe(3);
  });

  it("upgrades clover count when replayed with better score", () => {
    let save = getDefaultSave();
    save = completeLevelUpdater(save, "1-1", 1);
    save = completeLevelUpdater(save, "1-1", 3);
    expect(save.completedLevels["1-1"]).toBe(3);
  });

  it("does not mutate the input save", () => {
    const save = getDefaultSave();
    const result = completeLevelUpdater(save, "1-1", 2);
    expect(result).not.toBe(save);
    expect(save.completedLevels).toEqual({});
  });

  it("preserves other completed levels", () => {
    let save = getDefaultSave();
    save = completeLevelUpdater(save, "1-1", 3);
    save = completeLevelUpdater(save, "1-2", 2);
    expect(save.completedLevels).toEqual({ "1-1": 3, "1-2": 2 });
  });
});

/* ── isLevelUnlockedWithSave ────────────────────────────────────── */

describe("isLevelUnlockedWithSave", () => {
  const allLevels = ["1-1", "1-2", "1-3"];

  it("first level is always unlocked", () => {
    expect(isLevelUnlockedWithSave(getDefaultSave(), "1-1", allLevels)).toBe(true);
  });

  it("second level is locked when first is not completed", () => {
    expect(isLevelUnlockedWithSave(getDefaultSave(), "1-2", allLevels)).toBe(false);
  });

  it("second level is unlocked when first is completed", () => {
    const save = completeLevelUpdater(getDefaultSave(), "1-1", 1);
    expect(isLevelUnlockedWithSave(save, "1-2", allLevels)).toBe(true);
  });

  it("easter-egg-unlocked level is always accessible", () => {
    const save: SaveData = {
      ...getDefaultSave(),
      unlockedLevels: ["1-3"],
    };
    expect(isLevelUnlockedWithSave(save, "1-3", allLevels)).toBe(true);
  });

  it("returns false for unknown level ID", () => {
    expect(
      isLevelUnlockedWithSave(getDefaultSave(), "unknown", allLevels)
    ).toBe(false);
  });
});
