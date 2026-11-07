import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Static document navigation avoids unsupported RSC probes on Pages export.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores([".next/**", "coverage/**", "outputs/**", "work/**"]),
]);
