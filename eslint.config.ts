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
