import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jest, // <-- Add this line
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: pluginReact,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
