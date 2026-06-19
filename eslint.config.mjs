import tsParser from '@typescript-eslint/parser';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      '**/*.test_.ts',
      'prototype/',
      'src/crd/app/**',
      // Local dependency-resolution shim (see vendor/excalidraw-element-shim/README.md);
      // build-time glue, not application source, and outside the tsconfig project.
      'vendor/',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-compiler': reactCompilerPlugin,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
];
