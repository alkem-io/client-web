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
      'src/crd/app/**',
      // The Playwright e2e suite is type-checked via tsconfig.e2e.json
      // (`pnpm test:e2e:typecheck`), not the src tsconfig the eslint parser uses.
      'e2e/**',
      'playwright.config.ts',
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
