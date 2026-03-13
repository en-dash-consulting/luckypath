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
            {
              target: "./app/routes/**",
              from: "./app/engine/!(index).ts",
              message: "Import from ~/engine barrel instead of engine internals.",
            },
            {
              target: "./app/hooks/**",
              from: "./app/engine/!(index).ts",
              message: "Import from ~/engine barrel instead of engine internals.",
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
