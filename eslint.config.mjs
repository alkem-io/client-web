//import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  //js, // somehow importing this is causing an error "Unexpected key meta found", might be due to mix of config setup
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        createDefaultProgram: true,
      },
      // No globals needed for TS block
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        process.env.NODE_ENV === 'production' ? 2 : 1,
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['interface'], next: '*' },
        { blankLine: 'always', next: ['interface'], prev: '*' },
        { blankLine: 'any', prev: 'export', next: 'export' },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        jest: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-multiple-empty-lines': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
      'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
      'import/prefer-default-export': 'off',
      'jsx-quotes': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['block-like', 'class', 'function'], next: 'export' },
        { blankLine: 'any', prev: 'export', next: 'export' },
      ],
      // react rules
      'react-hooks/exhaustive-deps': 'off',
      'react/jsx-pascal-case': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-tag-spacing': 'error',
      'react/jsx-curly-spacing': 'error',
      'react/jsx-boolean-value': 'error',
      'react/no-string-refs': 'error',
      'react/jsx-wrap-multilines': 'error',
      'react/self-closing-comp': 'error',

      // jsx-a11y rules
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
