import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  js.config({
    extends: [
      'eslint:recommended',
    ],
  }),
  tseslint.config({
    extends: [
      'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
      project: './tsconfig.json',
    },
  }),
  {
    plugins: {
      react: require('eslint-plugin-react'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
    },
    extends: [
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      prettier,
    ],
    rules: {
      quotes: [
        'error',
        'single',
        { avoidEscape: true },
      ],
      'no-multiple-empty-lines': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
      'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
      '@typescript-eslint/no-unused-vars': [
        process.env.NODE_ENV === 'production' ? 2 : 1,
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/prefer-default-export': 'off',
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
];
