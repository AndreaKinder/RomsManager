export default [
  {
    ignores: ["node_modules/**", ".webpack/**", "out/**", "coverage/**"],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        alert: "readonly",
        confirm: "readonly",
        console: "readonly",
        process: "readonly",
        localStorage: "readonly",
        ResizeObserver: "readonly",
        MutationObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: "readonly",
        MAIN_WINDOW_WEBPACK_ENTRY: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^React$" }],
      "no-constant-condition": "warn",
    },
  },
];
