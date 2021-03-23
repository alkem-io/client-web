const env = (prod, dev) => (process.env.NODE_ENV === 'production' ? prod : dev);
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2016,
    sourceType: 'module',
    createDefaultProgram: true,
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'react', 'jest'],
  extends: [
    'react-app',
    'react-app/jest',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
    serviceworker: true,
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-multiple-empty-lines': 'error',
    'no-console': env(1, 0),
    'no-debugger': env(1, 0),
    '@typescript-eslint/no-unused-vars': [
      env(2, 1),
      {
        argsIgnorePattern: '^_',
      },
    ],
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
