const env = (prod, dev) => (process.env.NODE_ENV === 'production' ? prod : dev);

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: '2022',
    sourceType: 'module',
    createDefaultProgram: true,
    project: './tsconfig.json',
  },
  plugins: ['react'],
  extends: ['react-app', 'prettier', 'prettier/prettier'],
  env: {
    browser: true,
    es6: true,
    jest: true,
    serviceworker: true,
  },
  rules: {
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    'no-multiple-empty-lines': 'error',
    'no-console': env(1, 0),
    'no-debugger': env(1, 0),
    '@typescript-eslint/no-unused-vars': [
      env(2, 1),
      {
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'react/prop-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-pascal-case': 'error',
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-tag-spacing': 'error',
    'react/jsx-curly-spacing': 'error',
    'react/jsx-boolean-value': 'error',
    'react/no-string-refs': 'error',
    'react/jsx-wrap-multilines': 'error',
    'react/self-closing-comp': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-quotes': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['block-like', 'class', 'function'], next: 'export' },
    ],
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['interface'], next: '*' },
      { blankLine: 'always', next: ['interface'], prev: '*' },
    ],
  },
};
