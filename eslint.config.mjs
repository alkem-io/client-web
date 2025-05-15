import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
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
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['interface'], next: '*' },
        { blankLine: 'always', next: ['interface'], prev: '*' },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react/jsx-boolean-value': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-curly-spacing': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-tag-spacing': 'error',
      'react/jsx-wrap-multilines': 'error',
      'react/no-string-refs': 'error',
      'react/self-closing-comp': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'quotes': [
        'error',
        'single',
        { avoidEscape: true },
      ],
      'no-multiple-empty-lines': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
      'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
      'import/prefer-default-export': 'off',
      'jsx-quotes': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['block-like', 'class', 'function'], next: 'export' },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    env: {
      browser: true,
      es6: true,
      jest: true,
      serviceworker: true,
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...prettier,
    },
  },
];
