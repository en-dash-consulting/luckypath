import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { useSave, SaveProvider, getStandaloneInstanceCount } from "./useSave";
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

  it("exports getStandaloneInstanceCount for runtime invariant tracking", () => {
    expect(typeof getStandaloneInstanceCount).toBe("function");
    expect(typeof getStandaloneInstanceCount()).toBe("number");
  });
});

/**
 * SaveProvider wrapping invariant — static route analysis.
 *
 * This test enforces the architectural rule: routes that import two or more
 * save-consuming hooks MUST also import SaveProvider. Without the provider,
 * each useSave() call in those hooks creates independent state and mutations
 * silently diverge.
 *
 * Complements the runtime dev-mode warning in useSave.ts — this catches the
 * violation at test time so it never ships.
 */
describe("SaveProvider wrapping requirement", () => {
  // Hooks that internally compose useSave() — must stay in sync with codebase.
  const SAVE_CONSUMING_HOOKS = [
    "useWorldSession",
    "useRainbowEasterEgg",
    "useGameSession",
  ];

  const routesDir = path.resolve(__dirname, "../routes");

  // Read all route files once.
  const routeFiles = fs.readdirSync(routesDir)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => ({
      name: f,
      content: fs.readFileSync(path.join(routesDir, f), "utf-8"),
    }));

  it("routes with multiple save-consuming hooks import SaveProvider", () => {
    const violations: string[] = [];

    for (const { name, content } of routeFiles) {
      const importedSaveHooks = SAVE_CONSUMING_HOOKS.filter((hook) =>
        content.includes(hook),
      );

      if (importedSaveHooks.length >= 2 && !content.includes("SaveProvider")) {
        violations.push(
          `${name} uses ${importedSaveHooks.join(", ")} but does not import SaveProvider. ` +
            "Wrap save-consuming hooks in <SaveProvider> to prevent mutation divergence.",
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("known save-consuming hooks list is exhaustive", () => {
    // Guard: ensure the hooks list stays up to date by scanning hook files
    // for direct useSave() calls (excluding useSave.ts itself).
    const hooksDir = path.resolve(__dirname);
    const hookFiles = fs.readdirSync(hooksDir)
      .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(".test.") && f !== "useSave.ts" && f !== "index.ts");

    const actualConsumers: string[] = [];
    for (const f of hookFiles) {
      const content = fs.readFileSync(path.join(hooksDir, f), "utf-8");
      if (content.includes("useSave()")) {
        // Extract the hook function name from the file.
        const match = content.match(/export function (use\w+)/);
        if (match) actualConsumers.push(match[1]);
      }
    }

    expect(actualConsumers.sort()).toEqual([...SAVE_CONSUMING_HOOKS].sort());
  });
});
