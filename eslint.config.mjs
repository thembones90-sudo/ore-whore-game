import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  next.configs["core-web-vitals"],
  {
    // This project runs on Vinext/Vite/Cloudflare Workers, not Next.js — the
    // `next` package is not a dependency, so `next/image` is unavailable.
    // The core-web-vitals preset's no-img-element rule assumes a real Next.js
    // app and doesn't apply here; raw <img> is the correct choice for
    // ore-sprite/album/share-card renders.
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Standard TS convention: a leading underscore marks a binding as
    // intentionally unused (e.g. destructuring a field out of an object
    // purely to omit it — see migrate()'s `_obsoleteTrueArtifactChance`/
    // `_obsoleteArtifactChance` in app/page.tsx). Recognizing the
    // convention here avoids scattering per-line disables for a pattern
    // that's meaningful, working code rather than dead code.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);

export default eslintConfig;
