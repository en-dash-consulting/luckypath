import { describe, it, expect } from "vitest";
import { useSave, SaveProvider } from "./useSave";
import type { UseSaveReturn } from "./useSave";

/**
 * useSave architectural contract tests.
 *
 * These tests verify the module's public API surface — that the shared
 * save context pattern exports the expected symbols and types. React
 * hook behavior is tested through the hooks that compose useSave
 * (useWorldSession, useRainbowEasterEgg) and integration/E2E tests.
 */

describe("useSave module exports", () => {
  it("exports useSave as a function", () => {
    expect(typeof useSave).toBe("function");
  });

  it("exports SaveProvider as a function (React component)", () => {
    expect(typeof SaveProvider).toBe("function");
  });

  it("UseSaveReturn interface covers save, setSave, updateSave, completeLevel", () => {
    // Type-level check: if UseSaveReturn is missing any expected key,
    // this assignment will fail at compile time.
    const shape: Record<keyof UseSaveReturn, true> = {
      save: true,
      setSave: true,
      updateSave: true,
      completeLevel: true,
    };
    expect(Object.keys(shape)).toHaveLength(4);
  });
});
