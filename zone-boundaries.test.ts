/**
 * Global architecture DAG enforcement tests.
 *
 * This file guards the entire 6-layer dependency DAG:
 *   geometry → engine → services → hooks → components → routes
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
 *
 * SYNC NOTE: scripts/check-layers.sh enforces the same 6-layer DAG at
 * the shell level. If you change the DAG here, update check-layers.sh
 * to match (and vice versa).
 */
import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync, readFileSync, readdirSync } from "node:fs";
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
      // Components barrel enforcement — no deep imports from outside the components zone
      { target: "./app/routes/**",    from: "./app/components/!(index).tsx" },
      { target: "./app/routes/**",    from: "./app/components/!(index).ts" },
      // Engine must not import from services, hooks, components, or routes
      { target: "./app/engine/**",    from: "./app/services/**" },
      { target: "./app/engine/**",    from: "./app/hooks/**" },
      { target: "./app/engine/**",    from: "./app/components/**" },
      { target: "./app/engine/**",    from: "./app/routes/**" },
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

  it("blocks routes importing from deep component files (must use barrel)", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { GameBoard } from "~/components/GameBoard";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("allows routes importing from components barrel", () => {
    const rules = lintTempFile(
      "app/routes/_zone_test_tmp.ts",
      `import { GameBoard } from "~/components";\n`
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

  it("blocks engine from importing services (services is above engine)", () => {
    const rules = lintTempFile(
      "app/engine/_zone_test_tmp.ts",
      `import { loadSave } from "~/services/persistence";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks engine from importing hooks (hooks is above engine)", () => {
    const rules = lintTempFile(
      "app/engine/_zone_test_tmp.ts",
      `import { useSave } from "~/hooks";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks engine from importing components (components is above engine)", () => {
    const rules = lintTempFile(
      "app/engine/_zone_test_tmp.ts",
      `import { GameBoard } from "~/components";\n`
    );
    expect(rules).toContain("import-x/no-restricted-paths");
  });

  it("blocks engine from importing routes (routes is above engine)", () => {
    const rules = lintTempFile(
      "app/engine/_zone_test_tmp.ts",
      `import Worlds from "~/routes/worlds";\n`
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

  it("allows services importing from engine (valid DAG direction)", () => {
    const rules = lintTempFile(
      "app/services/_zone_test_tmp.ts",
      `import { posKey } from "~/engine";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
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

/**
 * Meta-test: enforcement model consistency.
 *
 * The architecture DAG is enforced by three independent systems:
 *   1. eslint.config.ts — import-x/no-restricted-paths zones
 *   2. scripts/check-layers.sh — grep-based forbidden edge checks
 *   3. zone-boundaries.test.ts — expectedZonePairs list (above)
 *
 * A new layer boundary added to one system must appear in all three.
 * This test extracts the forbidden layer edges from each system and
 * asserts they cover exactly the same set — so drift is caught immediately.
 */
describe("enforcement model consistency", () => {
  /**
   * Extract forbidden layer edges from ESLint config zones.
   * Barrel enforcement rules (using !(index) patterns) are excluded —
   * they are an additional concern on top of the layer DAG.
   * Returns edges as "importer → source" strings, e.g. "routes → engine".
   */
  function extractEslintLayerEdges(
    zones: Array<{ target: string; from: string }>
  ): Set<string> {
    const edges = new Set<string>();
    for (const zone of zones) {
      const from = zone.from as string;
      // Skip barrel enforcement rules (they use !(index) globs)
      if (from.includes("!(index)")) continue;
      const importerLayer = zone.target.match(/\.\/app\/(\w+)\//)?.[1];
      const sourceLayer = from.match(/\.\/app\/(\w+)\//)?.[1];
      if (importerLayer && sourceLayer) {
        edges.add(`${importerLayer} → ${sourceLayer}`);
      }
    }
    return edges;
  }

  /**
   * Parse check-layers.sh and extract forbidden edges from check_no_import calls.
   * Each call has the form: check_no_import "dir" "pattern" "label"
   * The pattern contains ~/layer references for each forbidden import target.
   */
  function extractShellEdges(): Set<string> {
    const script = readFileSync(
      resolve(ROOT, "scripts/check-layers.sh"),
      "utf-8"
    );
    const edges = new Set<string>();
    for (const line of script.split("\n")) {
      const dirMatch = line.match(/^check_no_import\s+"(\w+)"/);
      if (!dirMatch) continue;
      const importerLayer = dirMatch[1];
      for (const target of line.matchAll(/~\/(\w+)/g)) {
        edges.add(`${importerLayer} → ${target[1]}`);
      }
    }
    return edges;
  }

  /**
   * Extract forbidden layer edges from the expectedZonePairs list in this file.
   * We re-derive them the same way as extractEslintLayerEdges to stay DRY.
   */
  function extractTestFileEdges(
    expectedPairs: Array<{ target: string; from: string }>
  ): Set<string> {
    return extractEslintLayerEdges(expectedPairs);
  }

  it("all three enforcement systems cover the same set of forbidden layer edges", async () => {
    // 1. ESLint config zones
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

    const eslintEdges = extractEslintLayerEdges(zones);

    // 2. check-layers.sh forbidden edges
    const shellEdges = extractShellEdges();

    // 3. expectedZonePairs from the test above (inline copy to keep the
    //    meta-test self-contained — the "contains exactly the expected zone
    //    boundary rules" test above already asserts these match the ESLint
    //    config, so any drift here is also caught).
    const expectedZonePairs: Array<{ target: string; from: string }> = [
      { target: "./app/engine/**",    from: "./app/services/**" },
      { target: "./app/engine/**",    from: "./app/hooks/**" },
      { target: "./app/engine/**",    from: "./app/components/**" },
      { target: "./app/engine/**",    from: "./app/routes/**" },
      { target: "./app/routes/**",    from: "./app/engine/**" },
      { target: "./app/routes/**",    from: "./app/services/**" },
      { target: "./app/components/**", from: "./app/services/**" },
      { target: "./app/hooks/**",     from: "./app/routes/**" },
      { target: "./app/hooks/**",     from: "./app/components/**" },
      { target: "./app/components/**", from: "./app/routes/**" },
      { target: "./app/services/**",  from: "./app/hooks/**" },
      { target: "./app/services/**",  from: "./app/components/**" },
      { target: "./app/services/**",  from: "./app/routes/**" },
      { target: "./app/geometry/**",  from: "./app/engine/**" },
      { target: "./app/geometry/**",  from: "./app/hooks/**" },
      { target: "./app/geometry/**",  from: "./app/components/**" },
      { target: "./app/geometry/**",  from: "./app/routes/**" },
      { target: "./app/geometry/**",  from: "./app/services/**" },
    ];
    const testFileEdges = extractTestFileEdges(expectedZonePairs);

    // Sort for deterministic comparison and helpful diffs
    const sortedEslint = [...eslintEdges].sort();
    const sortedShell  = [...shellEdges].sort();
    const sortedTest   = [...testFileEdges].sort();

    // Assert pairwise equality — any mismatch shows exactly which edge drifted
    expect(sortedEslint).toEqual(sortedShell);
    expect(sortedEslint).toEqual(sortedTest);
  });
});

/**
 * Route-file coverage assertion.
 *
 * React Router uses file-based routing — every file in app/routes/ becomes a
 * route automatically. If a developer adds a new route file without updating
 * the zone inventory, that route silently bypasses all zone enforcement.
 *
 * This test maintains an explicit allowlist of known route files and asserts
 * that the filesystem matches. A new route file will fail this test with a
 * clear message telling the developer to register it in the known set.
 */
describe("route-file zone coverage", () => {
  // The canonical set of route files that are tracked within the
  // game-ui-routes zone and therefore covered by the architecture DAG
  // enforcement rules. Update this list when adding new routes.
  const KNOWN_ROUTE_FILES = new Set([
    "home.tsx",
    "play.tsx",
    "worlds.tsx",
  ]);

  it("every route file on disk is registered in the known route set", () => {
    const routesDir = resolve(ROOT, "app/routes");
    const filesOnDisk = readdirSync(routesDir).filter(
      (f) => /\.(tsx?|jsx?)$/.test(f) && !f.startsWith("_zone_test_tmp")
    );

    const unregistered = filesOnDisk.filter((f) => !KNOWN_ROUTE_FILES.has(f));
    expect(
      unregistered,
      `Unregistered route file(s) found: ${unregistered.join(", ")}. ` +
        "Add them to the KNOWN_ROUTE_FILES set in zone-boundaries.test.ts " +
        "to confirm they are covered by zone enforcement."
    ).toHaveLength(0);
  });

  it("no stale entries in the known route set (all listed files exist on disk)", () => {
    const routesDir = resolve(ROOT, "app/routes");
    const filesOnDisk = new Set(readdirSync(routesDir));

    const stale = [...KNOWN_ROUTE_FILES].filter((f) => !filesOnDisk.has(f));
    expect(
      stale,
      `Stale route file(s) in KNOWN_ROUTE_FILES: ${stale.join(", ")}. ` +
        "Remove them from the set — the file no longer exists on disk."
    ).toHaveLength(0);
  });
});
