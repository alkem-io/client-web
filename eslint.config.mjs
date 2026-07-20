import tsParser from '@typescript-eslint/parser';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  {
    ignores: ['node_modules/', 'build/', 'dist/', 'coverage/', '**/*.test_.ts', 'src/crd/app/**'],
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
      // Prevent reintroduction of manual memoization — the React Compiler handles it
      // automatically (see CLAUDE.md → State & Hooks). Error-level: any new
      // useMemo/useCallback/memo/React.memo fails lint (and the pre-commit hook, which runs
      // `pnpm eslint .`). Each remaining genuine exception carries an
      // `eslint-disable-next-line no-restricted-syntax -- <reason>` comment explaining why.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="useMemo"]',
          message:
            'useMemo is not allowed. The React Compiler handles memoization automatically. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
        {
          selector: 'CallExpression[callee.name="useCallback"]',
          message:
            'useCallback is not allowed. The React Compiler handles memoization automatically. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
        {
          selector: 'CallExpression[callee.name="memo"]',
          message:
            'React.memo is not allowed. The React Compiler handles memoization automatically. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
        {
          selector: 'CallExpression[callee.object.name="React"][callee.property.name="memo"]',
          message:
            'React.memo is not allowed. The React Compiler handles memoization automatically. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
      ],
    },
  },
];
