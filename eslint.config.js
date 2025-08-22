import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import * as tsParser from '@typescript-eslint/parser'
import eslintPluginAstro from 'eslint-plugin-astro'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.vscode/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      '*.d.ts',
    ],
  },
  js.configs.recommended, // Base ESLint configuration for JavaScript
  {
    // Node.js configuration files
    files: ['**/*.config.{js,ts,mjs}', 'drizzle.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: 'tsconfig.json' },
      globals: {
        ...globals.node, // Node.js globals (require, process, etc.)
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // Use TypeScript parser for JS/TS files
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: 'tsconfig.json' },
      globals: {
        ...globals.browser, // This includes fetch, window, document, etc.
        React: 'readonly', // Add React as a global for type references
        google: 'readonly', // Add Google as a global for type references
      },
    },
    rules: {
      // Turn off the base rule for TypeScript files
      'no-unused-vars': 'off',
      // Use TypeScript-aware version instead
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // React flat config for JSX/TSX files
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  // Disable display-name rule for UI components
  {
    files: ['**/ui/*.{jsx,tsx}'],
    rules: { 'react/display-name': 'off' },
  },
  // Use Astro ESLint rules for Astro files - spread the entire config
  ...eslintPluginAstro.configs.recommended,
  {
    // Use JSX Accessibility rules for all files
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx,astro}'],
    plugins: eslintPluginJsxA11y.flatConfigs.recommended.plugins,
    rules: eslintPluginJsxA11y.flatConfigs.recommended.rules,
  },
]
