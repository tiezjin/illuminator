import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"], // Only check src folder
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                // Add specific Obsidian globals here if needed
                app: "readonly",
            },
            parserOptions: {
                project: "./tsconfig.json", // This is key for cross-file analysis
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "no-unused-vars": "off", // Turn off base rule
            "@typescript-eslint/no-unused-vars": ["warn"], // Use TS version
            "no-undef": "off", // TS handles undefined variables better
        },
        ignores: ["main.js", "dist/", "node_modules/"],
    },
];