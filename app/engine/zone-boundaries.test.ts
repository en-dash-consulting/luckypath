/**
 * Zone-boundary ESLint rule verification.
 *
 * The ESLint config in eslint.config.ts is the sole enforcement mechanism
 * for the architecture DAG (engine → hooks → components → routes).
 * A misconfigured rule silently degrades to no enforcement, so these tests
 * verify that the rules are correctly set up by checking that ESLint reports
 * errors for known-bad imports and passes for known-good ones.
 */
import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
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

  it("allows barrel engine imports from hooks", () => {
    const rules = lintTempFile(
      "app/hooks/_zone_test_tmp.ts",
      `import { BIOME_THEMES } from "~/engine";\n`
    );
    expect(rules).not.toContain("import-x/no-restricted-paths");
  });
});
