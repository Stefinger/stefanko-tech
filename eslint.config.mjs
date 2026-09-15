import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The static homepage (hand-written + minified vendor JS served as-is from
    // public/) and its delivery drop zone are not TypeScript sources.
    "public/**",
    "_incoming/**",
  ]),
  {
    rules: {
      // Using <img> for Phase 2 local assets — will evaluate next/image in a later phase
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
