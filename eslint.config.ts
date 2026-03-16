/**
 * ESLint Configuration — Single Authoritative Source of DAG Enforcement
 *
 * This file is the ONE AND ONLY mechanism that enforces the architecture
 * layer boundary at import time:
 *
 *   geometry → engine → services → hooks → components → routes
 *
 * The `import-x/no-restricted-paths` rules below are what actually prevent
 * illegal cross-zone imports. Other documentation of the DAG (JSDoc comments
 * in source files, .n-dx.json zone overrides, architecture diagrams) are
 * informational only — editing them does NOT change what is enforced.
 *
 * If you modify the zone rules below:
 *   1. Run `npm test` — the zone-boundaries.test.ts smoke tests will catch
 *      syntactically broken or silently empty rules.
 *   2. Verify with `npm run lint` on the full codebase.
 *   3. Do NOT rely on JSDoc or config overrides as substitutes for these rules.
 */
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "import-x": importX,
    },
    settings: {
      // Enable TypeScript path alias resolution (~/*)
      // Without this, import-x rules silently skip unresolvable paths.
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Prevent circular imports between zones
      "import-x/no-cycle": ["error", { maxDepth: 3 }],

      // Enforce explicit engine barrel usage — block deep engine imports
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            // Engine barrel enforcement — no deep imports
            {
              target: "./app/components/**",
              from: "./app/engine/!(index).ts",
              message: "Import from ~/engine barrel instead of engine internals.",
            },
            // (routes→engine is fully blocked below — no need for a deep-import-only rule here)
            {
              target: "./app/hooks/**",
              from: "./app/engine/!(index).ts",
              message: "Import from ~/engine barrel instead of engine internals.",
            },
            // Hooks barrel enforcement — no deep imports from outside the hooks zone
            {
              target: "./app/routes/**",
              from: "./app/hooks/!(index).ts",
              message: "Import from ~/hooks barrel instead of individual hook files.",
            },
            {
              target: "./app/components/**",
              from: "./app/hooks/!(index).ts",
              message: "Import from ~/hooks barrel instead of individual hook files.",
            },
            // Components barrel enforcement — no deep imports from outside the components zone
            {
              target: "./app/routes/**",
              from: "./app/components/!(index).tsx",
              message: "Import from ~/components barrel instead of individual component files.",
            },
            {
              target: "./app/routes/**",
              from: "./app/components/!(index).ts",
              message: "Import from ~/components barrel instead of individual component files.",
            },
            // Layer enforcement — routes must access engine through hooks
            {
              target: "./app/routes/**",
              from: "./app/engine/**",
              message: "Routes must access engine through hooks, not directly (engine → hooks → routes).",
            },
            // Layer enforcement — routes must not import directly from services
            {
              target: "./app/routes/**",
              from: "./app/services/**",
              message: "Routes must not import directly from services (persistence logic should be accessed through hooks).",
            },
            // Layer enforcement — components must not import from services
            {
              target: "./app/components/**",
              from: "./app/services/**",
              message: "Components must not import directly from services (persistence logic should be accessed through hooks).",
            },
            // Layer enforcement — engine must not import from services
            {
              target: "./app/engine/**",
              from: "./app/services/**",
              message: "Engine must not import from services (services is above engine in the DAG).",
            },
            // Layer enforcement — hooks must not import from routes or components
            {
              target: "./app/hooks/**",
              from: "./app/routes/**",
              message: "Hooks must not import from routes (violates layer boundary: engine → hooks → components → routes).",
            },
            {
              target: "./app/hooks/**",
              from: "./app/components/**",
              message: "Hooks must not import from components (violates layer boundary: engine → hooks → components → routes).",
            },
            // Layer enforcement — components must not import from routes
            {
              target: "./app/components/**",
              from: "./app/routes/**",
              message: "Components must not import from routes (violates layer boundary: engine → hooks → components → routes).",
            },
            // Layer enforcement — services must not import upward
            {
              target: "./app/services/**",
              from: "./app/hooks/**",
              message: "Services must not import from hooks (services is below hooks in the DAG).",
            },
            {
              target: "./app/services/**",
              from: "./app/components/**",
              message: "Services must not import from components (services is below components in the DAG).",
            },
            {
              target: "./app/services/**",
              from: "./app/routes/**",
              message: "Services must not import from routes (services is below routes in the DAG).",
            },
            // Layer enforcement — geometry is a foundation layer, must not import upward
            {
              target: "./app/geometry/**",
              from: "./app/engine/**",
              message: "Geometry must not import from engine (geometry is a foundation layer below engine).",
            },
            {
              target: "./app/geometry/**",
              from: "./app/hooks/**",
              message: "Geometry must not import from hooks (geometry is a foundation layer below hooks).",
            },
            {
              target: "./app/geometry/**",
              from: "./app/components/**",
              message: "Geometry must not import from components (geometry is a foundation layer below components).",
            },
            {
              target: "./app/geometry/**",
              from: "./app/routes/**",
              message: "Geometry must not import from routes (geometry is a foundation layer below routes).",
            },
            {
              target: "./app/geometry/**",
              from: "./app/services/**",
              message: "Geometry must not import from services (geometry is a foundation layer below services).",
            },
          ],
        },
      ],

      // Hooks should be imported from their barrel or individual files
      "import-x/no-duplicates": "warn",

      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["build/**", "node_modules/**", ".react-router/**"],
  },
);
