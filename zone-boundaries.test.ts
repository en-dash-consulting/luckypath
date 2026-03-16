/**
 * Global architecture DAG enforcement tests.
 *
 * This file guards the entire 5-layer dependency DAG:
 *   geometry → engine → hooks → components → routes
 *
 * Its scope is global architecture enforcement — it validates that every
 * layer boundary in the project is correctly wired in the ESLint config,
 * not just a single zone's internals. It lives in build-infrastructure
 * alongside eslint.config.ts because it is the runtime verification
 * counterpart to that static rule definition.
 *
 * The ESLint config in eslint.config.ts is the sole enforcement mechanism
 * for the architecture DAG. A misconfigured rule silently degrades to no
 * enforcement, so these tests verify that the rules are correctly set up
 * by checking that ESLint reports errors for known-bad imports and passes
 * for known-good ones.
 *
 * The config-validation tests below also confirm that the eslint config
 * itself is syntactically valid and that the no-restricted-paths zones
 * array is non-empty — a misconfigured or accidentally emptied array
 * fails silently with no CI signal otherwise.
 */
import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname);
const TEMP_FILES: string[] = [];

/**
 * Write a temporary file at the given project-relative path, lint it,
 * then track it for cleanup. Returns the list of error-level rule IDs.
 */
function lintTempFile(relativePath: string, code: string): string[] {
  const absPath = resolve(ROOT, relativePath);
  writeFileSync(absPath, code, "utf-8");
  TEMP_FILES.push(absPath);

  try {
    execSync(
      `npx eslint --format json "${relativePath}"`,
      { cwd: ROOT, encoding: "utf-8", timeout: 30_000 }
    );
    return []; // clean exit = no errors
  } catch (err: unknown) {
    // ESLint exits non-zero when it finds errors — expected
    if (err && typeof err === "object" && "stdout" in err) {
      return parseErrorRules((err as { stdout: string }).stdout);
    }
    throw err;
  }
}

function parseErrorRules(jsonOutput: string): string[] {
  try {
    const results = JSON.parse(jsonOutput);
    if (!results[0]?.messages) return [];
    return results[0].messages
      .filter((m: { severity: number }) => m.severity === 2)
      .map((m: { ruleId: string }) => m.ruleId);
  } catch {
    return [];
  }
}

afterEach(() => {
  for (const f of TEMP_FILES) {
    if (existsSync(f)) try { unlinkSync(f); } catch { /* ignore */ }
  }
  TEMP_FILES.length = 0;
});

describe("eslint config validation", () => {
  it("loads without error and contains non-empty no-restricted-paths zones", async () => {
    // Dynamically import the ESLint config to verify it's syntactically valid
    const configModule = await import("./eslint.config");
    const configs = configModule.default;

    expect(Array.isArray(configs)).toBe(true);
    expect(configs.length).toBeGreaterThan(0);

    // Find the config object containing no-restricted-paths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ruleConfig = configs.find((c: any) =>
      c.rules?.["import-x/no-restricted-paths"],
    );
    expect(ruleConfig).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restrictedPaths = (ruleConfig as any).rules[
      "import-x/no-restricted-paths"
    ] as [string, { zones: Array<{ target: string; from: string }> }];
    expect(restrictedPaths).toBeDefined();
    expect(restrictedPaths[0]).toBe("error");
    expect(Array.isArray(restrictedPaths[1].zones)).toBe(true);
    expect(restrictedPaths[1].zones.length).toBeGreaterThan(0);
  });

  it("contains exactly the expected zone boundary rules", async () => {
    const configModule = await import("./eslint.config");
    const configs = configModule.default;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ruleConfig = configs.find((c: any) =>
      c.rules?.["import-x/no-restricted-paths"],
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zones = ((ruleConfig as any).rules[
      "import-x/no-restricted-paths"
    ] as [string, { zones: Array<{ target: string; from: string }> }])[1].zones;

    // Every zone pair in the DAG must be present. If a rule is accidentally
    // removed, this test will fail with the exact missing pair.
    const expectedZonePairs: Array<{ target: string; from: string }> = [
      // Engine barrel enforcement — no deep imports
      { target: "./app/components/**", from: "./app/engine/!(index).ts" },
      { target: "./app/hooks/**",     from: "./app/engine/!(index).ts" },
      // Hooks barrel enforcement — no deep imports from outside the hooks zone
      { target: "./app/routes/**",    from: "./app/hooks/!(index).ts" },
      { target: "./app/components/**", from: "./app/hooks/!(index).ts" },
      // Routes cannot access engine at all (must go through hooks)
      { target: "./app/routes/**",    from: "./app/engine/**" },
      // Routes cannot access services directly (must go through hooks)
      { target: "./app/routes/**",    from: "./app/services/**" },
      // Components cannot access services directly (must go through hooks)
      { target: "./app/components/**", from: "./app/services/**" },
      // Hooks must not import from routes or components
      { target: "./app/hooks/**",     from: "./app/routes/**" },
      { target: "./app/hooks/**",     from: "./app/components/**" },
      // Components must not import from routes
      { target: "./app/components/**", from: "./app/routes/**" },
      // Services must not import upward
      { target: "./app/services/**",  from: "./app/hooks/**" },
      { target: "./app/services/**",  from: "./app/components/**" },
      { target: "./app/services/**",  from: "./app/routes/**" },
      // Geometry is a foundation layer — must not import upward
      { target: "./app/geometry/**",  from: "./app/engine/**" },
      { target: "./app/geometry/**",  from: "./app/hooks/**" },
      { target: "./app/geometry/**",  from: "./app/components/**" },
      { target: "./app/geometry/**",  from: "./app/routes/**" },
      { target: "./app/geometry/**",  from: "./app/services/**" },
    ];

    // Assert exact count — catches both additions and removals
    expect(zones).toHaveLength(expectedZonePairs.length);

    // Assert every expected pair is present
    const actualPairs = zones.map((z) => ({ target: z.target, from: z.from }));
    for (const expected of expectedZonePairs) {
      expect(actualPairs).toContainEqual(expected);
    }
  });
});

describe("zone-boundary ESLint rules", () => {
  it("blocks deep engine imports from hooks", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { BIOME_THEMES } from "~/engine/biome-theme";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks deep engine imports from components", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { posKey } from "~/engine/utils";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks deep engine imports from routes", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { levels } from "~/engine/levels";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks hooks importing from routes", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import Worlds from "~/routes/worlds";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks hooks importing from components", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { WorldGrid } from "~/components/WorldGrid";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks components importing from routes", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import Worlds from "~/routes/worlds";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("allows components importing from hooks barrel (valid DAG direction)", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { useGameSession } from "~/hooks";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("blocks components importing from deep hook files", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { useGameSession } from "~/hooks/useGameSession";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("allows barrel engine imports from hooks", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { BIOME_THEMES } from "~/engine";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("allows components importing from peer component utilities", () => {
    // GameBoard.tsx imports board-utils and canvas-drawing — same-layer
    // imports within app/components/ are valid and not a reverse dependency.
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { CELL_SIZE } from "./board-utils";\nimport { drawTile } from "./canvas-drawing";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("allows components importing engine barrel (valid DAG direction)", () => {
    // Components like GameBoard.tsx import types and utils from the engine
    // barrel — this is the expected downward dependency direction.
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { posKey, getBiomeCanvasColors } from "~/engine";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("blocks routes from importing engine (barrel or deep)", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { getLevelById } from "~/engine";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  // ── Hooks-as-bridge tests ──────────────────────────────────────────
  // The hooks layer is the sole permitted bridge from engine to routes.
  // These tests explicitly verify the bridge pattern is intact:
  //   routes → hooks (allowed) → engine (allowed)
  //   routes → engine (blocked)

  it("blocks routes importing from deep hook files (must use barrel)", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { useWorldSession } from "~/hooks/useWorldSession";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("allows routes importing from hooks barrel (bridge pattern)", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { useGameSession } from "~/hooks";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("allows hooks importing from geometry (valid DAG direction)", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { computeArcProgress } from "~/geometry/rainbow-arc";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("allows components importing from geometry (valid DAG direction)", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { computeArcProgress } from "~/geometry/rainbow-arc";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("blocks routes from importing services directly", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { persistence } from "~/services/persistence";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks geometry from importing engine (foundation layer cannot depend upward)", () => {
    const rules = lintTempFile(
      "app/geometry/_zone_test_tmp.ts",
      `import { posKey } from "~/engine";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks geometry from importing components (foundation layer cannot depend upward)", () => {
    const rules = lintTempFile(
      "app/geometry/_zone_test_tmp.ts",
      `import { GameBoard } from "~/components/GameBoard";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks geometry from importing services (foundation layer cannot depend upward)", () => {
    const rules = lintTempFile(
      "app/geometry/_zone_test_tmp.ts",
      `import { loadSave } from "~/services/persistence";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  // ── Services zone boundary tests ────────────────────────────────────
  // Services sits between engine and hooks in the DAG. Only hooks may
  // import from services; services must not import upward.

  it("blocks components from importing services directly", () => {
    const rules = lintTempFile(
      "app/components/_zone_test_tmp.ts",
      `import { loadSave } from "~/services/persistence";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("allows hooks importing from services (valid DAG direction)", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { loadSave } from "~/services/persistence";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });

  it("blocks services from importing hooks (must not depend upward)", () => {
    const rules = lintTempFile(
      "app/services/_zone_test_tmp.ts",
      `import { useSave } from "~/hooks";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks services from importing components (must not depend upward)", () => {
    const rules = lintTempFile(
      "app/services/_zone_test_tmp.ts",
      `import { GameBoard } from "~/components/GameBoard";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks services from importing routes (must not depend upward)", () => {
    const rules = lintTempFile(
      "app/services/_zone_test_tmp.ts",
      `import Worlds from "~/routes/worlds";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  // ── Hooks-internal imports (same-zone, not barrel-enforced) ─────────
  // Hooks importing from sibling hook files within the same zone is valid.
  // The barrel enforcement only applies to consumers outside the zone.

  it("allows hooks importing from sibling hook files (same zone)", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { useSave } from "~/hooks/useSave";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });
});
