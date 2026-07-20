import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import tsParser from '@typescript-eslint/parser';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  {
    ignores: ['node_modules/', 'build/', 'dist/', 'coverage/', '**/*.test_.ts', 'src/crd/app/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Fail on eslint-disable directives that no longer suppress anything, so the
    // memoization exception list can't silently rot as usages are removed.
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
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
      '@eslint-community/eslint-comments': eslintComments,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      // Every eslint-disable must carry a `-- <reason>` description. This makes the
      // no-memoization policy self-enforcing: you cannot silence the rule below without
      // explaining why the exception is necessary. Also bans blanket file-wide disables.
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
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
        {
          selector:
            ':matches(ClassDeclaration, ClassExpression)[superClass.name="PureComponent"], :matches(ClassDeclaration, ClassExpression)[superClass.property.name="PureComponent"]',
          message:
            'React.PureComponent is not allowed — it is the class-based equivalent of manual memoization. The React Compiler handles this automatically. Use a function component. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
        {
          selector: 'MethodDefinition[key.name="shouldComponentUpdate"]',
          message:
            'shouldComponentUpdate is not allowed — it is manual render bail-out logic the React Compiler handles automatically. If this is a documented exception, add an eslint-disable comment with a reason.',
        },
      ],
    },
  },
];
