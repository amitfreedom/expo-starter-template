// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/**"] },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features",
                "@/features/**",
                "@/core",
                "@/core/**",
                "@/app",
                "@/app/**",
              ],
              message:
                "Shared code must stay independent of features, app composition, and routes.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}", "src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Use the common client from @/shared/api/client in feature services.",
            },
          ],
          patterns: [
            {
              group: ["@/app", "@/app/**"],
              message:
                "Routes compose screens. Import a feature or shared module instead.",
            },
            {
              group: ["@/features/*/**"],
              message:
                "Use a feature’s public index across features, and relative imports inside the same feature.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Use the common client from @/shared/api/client in feature services.",
            },
          ],
          patterns: [
            {
              group: ["@/app", "@/app/**", "@/core", "@/core/**"],
              message:
                "Features must stay independent of routes and application composition.",
            },
            {
              group: ["@/features/*/**"],
              message:
                "Use a feature’s public index across features, and relative imports inside the same feature.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='apiClient'][arguments.0.type='Literal']",
          message:
            "Keep backend paths in shared/api/endpoints.ts and use API_ENDPOINTS in services.",
        },
      ],
    },
  },
]);
